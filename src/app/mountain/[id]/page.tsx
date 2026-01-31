import { db } from "@/db";
import { mountains, logs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  MapPin,
  Mountain,
  Calendar,
  ScrollText,
  CheckCircle2,
} from "lucide-react";
import { LogVisitButton } from "@/components/LogVisitButton";
import MapWrapper from "@/components/MapWrapper";

export default async function MountainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peakId = parseInt(id);

  // 1. Pobierz szczyt
  const [peak] = await db
    .select()
    .from(mountains)
    .where(eq(mountains.id, peakId));

  if (!peak) notFound();

  // 2. Pobierz usera i jego logi
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userLogs: any[] = [];
  if (user) {
    userLogs = await db
      .select()
      .from(logs)
      .where(and(eq(logs.mountainId, peakId), eq(logs.userId, user.id)))
      .orderBy(desc(logs.dateClimbed));
  }

  const isVisited = userLogs.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Pasek powrotu */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Powrót do mapy
          </Button>
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- KOLUMNA LEWA (Główna) --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Karta Szczytu */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-2xl">
              <div className="relative h-[400px] w-full bg-slate-200 group">
                {peak.imageUrl ? (
                  <Image
                    src={peak.imageUrl}
                    alt={peak.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Mountain className="h-20 w-20 opacity-20" />
                    <p>Brak zdjęcia szczytu</p>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <Badge className="mb-3 bg-blue-500/90 hover:bg-blue-600 border-none backdrop-blur-sm">
                        {peak.mountainRange || "Pasmo nieznane"}
                      </Badge>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                        {peak.name}
                      </h1>
                    </div>
                    {isVisited && (
                      <div className="hidden md:flex bg-green-500/90 text-white px-4 py-2 rounded-full items-center gap-2 backdrop-blur-sm shadow-lg border border-white/20">
                        <span className="font-bold">ZDOBYTY</span>
                        <span className="text-xs opacity-75">
                          ({userLogs.length}x)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-8 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <Mountain className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Wysokość
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {peak.elevation} m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <MapPin className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Współrzędne
                      </p>
                      <p className="text-lg font-medium text-slate-900 font-mono">
                        {peak.lat.toFixed(4)}, {peak.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opis (Placeholder) */}
            <div className="prose prose-slate max-w-none">
              <h3 className="text-2xl font-bold text-slate-800">O szczycie</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {peak.name} to jeden z ciekawych szczytów w paśmie{" "}
                {peak.mountainRange}. Wznosi się na wysokość {peak.elevation}{" "}
                metrów n.p.m. Jest to popularny cel wycieczek, oferujący{" "}
                {peak.elevation > 2000
                  ? "wymagające podejścia"
                  : "przyjemne szlaki"}{" "}
                i piękne widoki.
              </p>
            </div>

            {/* Historia Wejść (Jeśli są) */}
            {isVisited && (
              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ScrollText className="h-5 w-5" /> Twój dziennik wejść
                </h3>
                <div className="space-y-4"> 
                  {userLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 md:items-center"
                    >
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-sm min-w-[120px]">
                        <Calendar className="h-4 w-4" />
                        {new Date(log.dateClimbed).toLocaleDateString("pl-PL")}
                      </div>

                      <div className="flex-1">
                        {log.isWinterEntry === 1 && (
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-1 mr-2">
                            ❄️ Zima
                          </span>
                        )}
                        <p className="text-slate-800">
                          {log.notes || "Brak notatki"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- KOLUMNA PRAWA (Sidebar) --- */}
          <div className="space-y-6">
            {/* Panel Akcji */}
            <Card className="border-slate-200 shadow-lg bg-white overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Status
                  zdobywcy
                </h4>
              </div>
              <div className="p-6 space-y-6">
                {user ? (
                  <>
                    <div className="text-center py-2">
                      {isVisited ? (
                        <p className="text-green-600 font-medium">
                          Gratulacje! Szczyt zdobyty. <br />
                          <span className="text-sm text-slate-500 font-normal">
                            Chcesz dodać kolejne wejście?
                          </span>
                        </p>
                      ) : (
                        <p className="text-slate-600">
                          Jeszcze nie zdobyłeś tego szczytu.
                          <br />
                          <span className="text-sm text-slate-400">
                            Zaloguj swoje pierwsze wejście!
                          </span>
                        </p>
                      )}
                    </div>

                    <LogVisitButton mountainId={peak.id} />
                  </>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <Link
                      href="/login"
                      className="underline font-bold hover:text-blue-900"
                    >
                      Zaloguj się
                    </Link>
                    , aby zapisywać swoje wejścia i budować kolekcję.
                  </div>
                )}
              </div>
            </Card>

            {/* Mini Mapa */}
            <Card className="overflow-hidden border-slate-200 shadow-md">
              <div className="h-[250px] relative z-0">
                <MapWrapper
                  mountains={[peak]}
                  visitedMountainIds={isVisited ? [peak.id] : []}
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
