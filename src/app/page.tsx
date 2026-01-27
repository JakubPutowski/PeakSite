import { db } from "../db";
import { mountains } from "../db/schema";
import MapWrapper from "../components/MapWrapper";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mountain } from "lucide-react";
import Image from "next/image";
import { logs } from "../db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allMountains = await db.select().from(mountains);

  let visitedMountainIds: number[] = [];
  if (user) {
    const userLogs = await db
      .select({ mountainId: logs.mountainId })
      .from(logs)
      .where(eq(logs.userId, user.id));
    visitedMountainIds = userLogs.map((l) => l.mountainId);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar (Tymczasowy, potem przeniesiemy do layout.tsx) */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Mountain className="h-6 w-6 text-slate-800" />
          <span className="text-xl font-bold tracking-tight">PeakLog</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user.email}
              </span>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Mój Profil
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Zaloguj się</Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <Card className="overflow-hidden shadow-lg border-0 mb-10">
          <div className="h-[500px] w-full relative z-0">
            <MapWrapper
              mountains={allMountains}
              visitedMountainIds={visitedMountainIds}
            />
          </div>
        </Card>

        {/* Sekcja Listy */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Odkrywaj Szczyty
          </h2>
          {user && (
            <Link href="/admin/add-mountain">
              <Button variant="secondary" size="sm">
                + Dodaj nowy
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMountains.map((peak) => (
            <Link key={peak.id} href={`/mountain/${peak.id}`} className="group">
              <Card className="h-full hover:shadow-md transition-all duration-200 border-slate-200 group-hover:border-slate-400 overflow-hidden">
                {/* Sekcja Obrazka */}
                <div className="relative h-48 w-full bg-slate-100">
                  {peak.imageUrl ? (
                    <Image
                      src={peak.imageUrl}
                      alt={peak.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50">
                      <Mountain className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {/* Reszta karty */}
                <CardHeader className="pb-2 pt-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {peak.name}
                    </CardTitle>
                    <MapPin className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {peak.mountainRange || "Pasmo nieznane"}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold text-slate-700">
                    {peak.elevation}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      m n.p.m.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
