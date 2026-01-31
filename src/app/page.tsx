import { db } from "@/db";
import { mountains, logs, profiles } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MountainDashboard from "@/components/MountainDashboard";
import { User } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Pobierz wszystkie szczyty
  const allMountains = await db.select().from(mountains);

  // 2. Pobierz ID zdobytych szczytów (jeśli user zalogowany)
  let visitedIds: number[] = [];
  let isAdmin = false;

  if (user) {
    const userLogs = await db
      .select({ mountainId: logs.mountainId })
      .from(logs)
      .where(eq(logs.userId, user.id));

    visitedIds = userLogs.map((log) => log.mountainId);
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id));

    isAdmin = profile?.role === "admin";
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Korona Gór Polski 🏔️
          </h1>
          <p className="text-gray-500 mt-2">
            Zaloguj się, aby śledzić swoje postępy i zdobywać szczyty.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Przycisk dla Admina */}
          {isAdmin && (
            <Link href="/admin/add-mountain">
              <Button variant="secondary" size="sm">
                + Dodaj szczyt
              </Button>
            </Link>
          )}
          {user ? (
            <Link href="/profile">
              <Button variant="outline" className="gap-2 border-slate-300">
                <User className="w-4 h-4" /> Twój Profil
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Zaloguj się
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Dashboard */}
      <MountainDashboard
        mountains={allMountains}
        visitedMountainIds={visitedIds}
      />
    </main>
  );
}
