import { db } from "@/db";
import { mountains, logs, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { logClimb } from "@/app/actions"; // Import naszej nowej akcji
import MapWrapper from "@/components/MapWrapper";

export default async function MountainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mountainId = Number(id);

  // 1. Pobierz dane szczytu
  const mountain = await db.query.mountains.findFirst({
    where: eq(mountains.id, mountainId),
  });

  if (!mountain) return notFound();

  // 2. Pobierz historię wejść na ten szczyt (JOIN z profilami, żeby widzieć kto wszedł)
  const climbLogs = await db
    .select({
      notes: logs.notes,
      date: logs.dateClimbed,
      userName: profiles.fullName,
    })
    .from(logs)
    .leftJoin(profiles, eq(logs.userId, profiles.id))
    .where(eq(logs.mountainId, mountainId))
    .orderBy(desc(logs.dateClimbed));

  return (
    <main className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-8">
      {/* Kolumna Lewa: Info o górze */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{mountain.name}</h1>
        <p className="text-xl text-gray-600 mb-6">
          {mountain.elevation} m n.p.m. • {mountain.mountainRange}
        </p>

        <div className="h-64 rounded-xl overflow-hidden border-2 mb-8">
          {/* Wyświetlamy mapę tylko z tym jednym szczytem */}
          <MapWrapper mountains={[mountain]} />
        </div>

        <h3 className="text-xl font-bold mb-4">
          📜 Dziennik Zdobywców ({climbLogs.length})
        </h3>
        <ul className="space-y-3">
          {climbLogs.length === 0 && (
            <p className="text-gray-400 italic">
              Nikt jeszcze tu nie wszedł. Bądź pierwszy!
            </p>
          )}

          {climbLogs.map((log, i) => (
            <li key={i} className="bg-gray-50 p-3 rounded-lg border text-sm">
              <div className="flex justify-between font-bold text-gray-700">
                <span>{log.userName || "Anonim"}</span>
                <span>{log.date}</span>
              </div>
              {log.notes && <p className="mt-1 text-gray-600">"{log.notes}"</p>}
            </li>
          ))}
        </ul>
      </div>

      {/* Kolumna Prawa: Formularz "Zdobyłem!" */}
      <div className="bg-white p-6 shadow-xl border rounded-2xl h-fit sticky top-10">
        <h2 className="text-2xl font-bold mb-4">🏔️ Zdobądź ten szczyt!</h2>
        <form action={logClimb} className="flex flex-col gap-4">
          <input type="hidden" name="mountainId" value={mountain.id} />

          <div>
            <label className="block text-sm font-medium mb-1">Kiedy?</label>
            <input
              type="date"
              name="date"
              required
              className="w-full border p-2 rounded"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notatka (opcjonalnie)
            </label>
            <textarea
              name="notes"
              placeholder="Pogoda była super, widoki niesamowite..."
              className="w-full border p-2 rounded h-24"
            />
          </div>

          <button className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            ✅ Zapisz wejście
          </button>
        </form>
      </div>
    </main>
  );
}
