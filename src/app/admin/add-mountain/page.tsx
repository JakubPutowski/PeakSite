import { createMountain } from "@/app/actions";

export default function AddMountainPage() {
  return (
    <main className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-xl mt-10 border">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🏔️ Dodaj nowy szczyt
      </h1>

      {/* Formularz podłączony bezpośrednio do Server Action */}
      <form action={createMountain} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nazwa szczytu
          </label>
          <input
            name="name"
            type="text"
            placeholder="np. Kasprowy Wierch"
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Wysokość (m n.p.m.)
          </label>
          <input
            name="elevation"
            type="number"
            placeholder="1987"
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Szerokość (Lat)
            </label>
            <input
              name="lat"
              type="number"
              step="any"
              placeholder="49.23"
              className="w-full border p-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Długość (Lng)
            </label>
            <input
              name="lng"
              type="number"
              step="any"
              placeholder="19.98"
              className="w-full border p-2 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pasmo górskie
          </label>
          <input
            name="mountainRange"
            type="text"
            placeholder="np. Tatry Zachodnie"
            className="w-full border p-2 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition"
        >
          Zapisz Szczyt
        </button>
      </form>
    </main>
  );
}
