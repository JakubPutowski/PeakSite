"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Mountain } from "@/db/schema";

// Importujemy Mapę dynamicznie, żeby uniknąć błędów SSR z Leafletem
const Map = dynamic(() => import("./LeafletMap"), { ssr: false });

type Props = {
  mountains: Mountain[];
  visitedMountainIds: number[];
};

export default function MountainDashboard({
  mountains,
  visitedMountainIds,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideVisited, setHideVisited] = useState(false);

  // LOGIKA FILTROWANIA
  const filteredMountains = mountains.filter((peak) => {
    const matchesSearch = peak.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const isVisited = visitedMountainIds.includes(peak.id);
    const matchesVisibility = hideVisited ? !isVisited : true;

    return matchesSearch && matchesVisibility;
  });

  // Obliczanie statystyk do paska postępu (taki bonus UI)
  const progress = Math.round(
    (visitedMountainIds.length / mountains.length) * 100,
  );

  return (
    <div className="space-y-6">
      {/* --- PASEK KONTROLNY (Search + Filter) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Szukaj szczytu..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={hideVisited}
              onChange={(e) => setHideVisited(e.target.checked)}
            />
            Ukryj zdobyte
          </label>
        </div>

        {/* Mały pasek postępu */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span>Postęp: {progress}%</span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- MAPA --- */}
      <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-lg relative z-0">
        <Map
          mountains={filteredMountains}
          visitedMountainIds={visitedMountainIds}
        />
      </div>

      {/* --- LISTA KAFELKÓW (Grid) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMountains.map((peak) => {
          const isVisited = visitedMountainIds.includes(peak.id);
          return (
            <Link
              key={peak.id}
              href={`/mountain/${peak.id}`}
              className={`block p-4 rounded-xl border transition hover:shadow-md ${
                isVisited
                  ? "bg-green-50/50 border-green-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{peak.name}</h3>
                  <p className="text-sm text-gray-500">{peak.mountainRange}</p>
                  <p className="text-xs font-mono mt-1 text-gray-400">
                    {peak.elevation} m n.p.m.
                  </p>
                </div>
                {isVisited && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                    ✓
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {filteredMountains.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Nie znaleziono szczytów spełniających kryteria.
          </div>
        )}
      </div>
    </div>
  );
}
