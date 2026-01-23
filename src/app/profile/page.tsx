import { db } from "@/db";
import { logs, mountains } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pobierz logi TYLKO dla tego użytkownika
  const myLogs = await db
    .select({
      id: logs.id,
      date: logs.dateClimbed,
      notes: logs.notes,
      mountainName: mountains.name,
      elevation: mountains.elevation,
      mountainId: mountains.id,
    })
    .from(logs)
    .leftJoin(mountains, eq(logs.mountainId, mountains.id))
    .where(eq(logs.userId, user.id)) // <-- Kluczowe filtrowanie
    .orderBy(desc(logs.dateClimbed));

  // Policz statystyki
  const totalElevation = myLogs.reduce(
    (sum, log) => sum + (log.elevation || 0),
    0,
  );
  const uniquePeaks = new Set(myLogs.map((l) => l.mountainName)).size;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Twój Profil 🧗‍♂️</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Link href="/" className="text-sm underline">
          ← Wróć na mapę
        </Link>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
          <span className="block text-3xl font-bold text-blue-600">
            {myLogs.length}
          </span>
          <span className="text-sm text-gray-600">Wejść ogółem</span>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <span className="block text-3xl font-bold text-green-600">
            {uniquePeaks}
          </span>
          <span className="text-sm text-gray-600">Zdobytych szczytów</span>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
          <span className="block text-3xl font-bold text-purple-600">
            {totalElevation} m
          </span>
          <span className="text-sm text-gray-600">Suma wysokości</span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Historia Wejść</h2>

      {myLogs.length === 0 ? (
        <p className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
          Nie masz jeszcze żadnych wpisów.{" "}
          <Link href="/" className="text-blue-600 font-bold">
            Zdobądź coś!
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {myLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div>
                <h3 className="font-bold text-lg">{log.mountainName}</h3>
                <p className="text-sm text-gray-500">
                  {log.date} • {log.elevation} m n.p.m.
                </p>
                {log.notes && (
                  <p className="mt-2 text-sm italic text-gray-700">
                    "{log.notes}"
                  </p>
                )}
              </div>
              <Link
                href={`/mountain/${log.mountainId}`}
                className="text-sm bg-gray-200 px-3 py-1 rounded"
              >
                Zobacz
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
