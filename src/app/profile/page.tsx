import { db } from "@/db";
import { mountains, logs, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mountain, Trophy, User } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Pobierz dane profilu
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  // 2. Pobierz historię wejść (połączoną z tabelą mountains, żeby znać nazwy szczytów)
  // Drizzle pozwala na pobieranie relacyjne, ale tutaj zrobimy to ręcznie dla pewności
  const userLogs = await db
    .select({
      log: logs,
      mountain: mountains,
    })
    .from(logs)
    .leftJoin(mountains, eq(logs.mountainId, mountains.id))
    .where(eq(logs.userId, user.id))
    .orderBy(desc(logs.dateClimbed));

  const totalPeaks = userLogs.length;
  // Unikalne szczyty (bo można wejść 2 razy na ten sam)
  const uniquePeaks = new Set(userLogs.map((item) => item.log.mountainId)).size;

  // Prosty system rang
  let rank = "Turysta";
  if (uniquePeaks >= 5) rank = "Wędrowiec";
  if (uniquePeaks >= 10) rank = "Zdobywca";
  if (uniquePeaks >= 28) rank = "Korona Gór Polski";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* --- NAGŁÓWEK PROFILU --- */}
        <Card className="border-none shadow-lg bg-white overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback className="bg-slate-200 text-2xl font-bold text-slate-600">
                    {profile?.fullName?.[0] || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {profile?.fullName || "Użytkownik"}
                  </h1>
                  <p className="text-slate-500 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="mb-2 hidden sm:block">
                <Link href="/">
                  <Button variant="outline">Wróć do mapy</Button>
                </Link>
              </div>
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Zdobyte szczyty
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {uniquePeaks}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Wszystkie wejścia
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {totalPeaks}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center col-span-2 md:col-span-2 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Aktualna Ranga
                </p>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-lg px-4 py-1 border-amber-200">
                  <Trophy className="w-4 h-4 mr-2" /> {rank}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* --- HISTORIA WEJŚĆ --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mountain className="w-5 h-5" /> Historia wypraw
          </h2>

          {userLogs.length > 0 ? (
            <div className="grid gap-4">
              {userLogs.map(({ log, mountain }) => (
                <Link key={log.id} href={`/mountain/${mountain?.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Miniaturka */}
                      <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                        {mountain?.imageUrl ? (
                          <Image
                            src={mountain.imageUrl}
                            alt={mountain.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Mountain className="text-slate-300 w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-slate-900">
                            {mountain?.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(log.dateClimbed).toLocaleDateString(
                              "pl-PL",
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {mountain?.mountainRange}
                        </p>

                        {log.notes && (
                          <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                            "{log.notes}"
                          </div>
                        )}
                      </div>

                      {/* Badge zima */}
                      {log.isWinterEntry === 1 && (
                        <div className="hidden sm:flex flex-col items-center gap-1 text-blue-500 px-2">
                          <span className="text-2xl">❄️</span>
                          <span className="text-[10px] font-bold uppercase">
                            Zima
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-white border-dashed border-2">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <MapPin className="w-12 h-12 opacity-20" />
                <p>Twój dziennik jest pusty.</p>
                <Link href="/">
                  <Button variant="link" className="text-blue-600">
                    Znajdź szczyt na mapie i dodaj wpis!
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
