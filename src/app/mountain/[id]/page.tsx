import { db } from "@/db";
import { mountains } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, MapPin, Mountain } from "lucide-react";

export default async function MountainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Odpakuj params za pomocą await (Wymagane w Next.js 15+)
  const { id } = await params;

  // 2. Teraz możesz bezpiecznie sparsować id na liczbę
  const peakId = parseInt(id);

  // 3. Pobieranie danych z bazy danych
  const [peak] = await db
    .select()
    .from(mountains)
    .where(eq(mountains.id, peakId));

  if (!peak) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Pasek powrotu */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
            <ChevronLeft className="h-4 w-4" /> Powrót do listy
          </Button>
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolumna Lewa: Zdjęcie i Główne Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-0 shadow-xl bg-white">
              <div className="relative h-[400px] w-full bg-slate-200">
                {peak.imageUrl ? (
                  <Image
                    src={peak.imageUrl}
                    alt={peak.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Mountain className="h-20 w-20 opacity-20" />
                    <p>Brak zdjęcia szczytu</p>
                  </div>
                )}
                {/* Overlay z nazwą na zdjęciu */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <Badge className="mb-3 bg-blue-500 hover:bg-blue-600">
                    {peak.mountainRange || "Pasmo nieznane"}
                  </Badge>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    {peak.name}
                  </h1>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-8 items-center text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Mountain className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Wysokość
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {peak.elevation} m n.p.m.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Lokalizacja
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {peak.lat.toFixed(4)}, {peak.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="prose prose-slate max-w-none p-4">
              <h3 className="text-xl font-bold">O tym szczycie</h3>
              <p className="text-slate-600 leading-relaxed">
                {peak.name} to imponujący szczyt położony w regionie{" "}
                {peak.mountainRange}. Znajduje się na wysokości {peak.elevation}{" "}
                metrów nad poziomem morza. W PeakLog możesz śledzić swoje
                postępy w zdobywaniu takich właśnie wspaniałych wierzchołków.
              </p>
            </div>
          </div>

          {/* Kolumna Prawa: Akcje i Statystyki */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200/60 shadow-md bg-white">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                Twoja aktywność
              </h4>
              <div className="space-y-4">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg">
                  Zaloguj wejście
                </Button>
                <p className="text-xs text-center text-slate-400">
                  Zaloguj się, aby dodać ten szczyt do swojej listy zdobytych
                  trofeów.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-slate-200/60 shadow-md bg-white overflow-hidden">
              <h4 className="font-bold mb-4">Położenie na mapie</h4>
              <div className="h-48 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center">
                <p className="text-xs text-slate-400 text-center px-4">
                  [Tu w przyszłości dodamy mini-mapę z jednym punktem]
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
