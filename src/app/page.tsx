import { db } from "../db";
import { mountains } from "../db/schema";
import MapWrapper from "../components/MapWrapper";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  // 1. Pobieramy aktualnego użytkownika
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Pobieramy dane z bazy (to co było wcześniej)
  const allMountains = await db.select().from(mountains);
  return (
    <main className="p-4 max-w-4xl mx-auto">
      {/* HEADER Z LOGOWANIEM */}
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">🏔️ PeakLog</h1>
          <p className="text-gray-600">Twój dziennik górskich podbojów</p>
        </div>

        <div>
          {user ? (
            <div className="text-right">
              <p className="text-sm font-bold">{user.email}</p>
              <form action="/auth/signout" method="post">
                {/* Wylogowanie dodamy za chwilę, na razie tylko info */}
                <span className="text-xs text-green-600">
                  Jesteś zalogowany! ✅
                </span>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              Zaloguj się
            </Link>
          )}
        </div>
      </header>

      <div className="border-4 border-white shadow-xl rounded-xl overflow-hidden bg-white">
        <MapWrapper mountains={allMountains} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Ostatnio dodane szczyty:
        </h2>
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {allMountains.map((peak) => (
            <li
              key={peak.id}
              className="p-4 bg-gray-50 border rounded-lg hover:shadow-md transition"
            >
              <div className="font-bold text-lg">{peak.name}</div>
              <div className="text-sm text-gray-500">
                {peak.mountainRange} • {peak.elevation} m n.p.m.
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
