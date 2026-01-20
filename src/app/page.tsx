import { db } from "../db";
import { mountains } from "../db/schema";
import MapWrapper from "../components/MapWrapper";

export default async function Home() {
  // Pobieramy dane z bazy
  const allMountains = await db.select().from(mountains);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🏔️ PeakLog</h1>
        <p className="text-gray-600">Twój dziennik górskich podbojów</p>
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
