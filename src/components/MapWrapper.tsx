"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
      Ładowanie mapy...
    </div>
  ),
});

type Mountain = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
};

type MapWrapperProps = {
  mountains: Mountain[];
  visitedMountainIds?: number[]; // NOWY props
};

export default function MapWrapper({
  mountains,
  visitedMountainIds = [],
}: MapWrapperProps) {
  return (
    <LeafletMap mountains={mountains} visitedMountainIds={visitedMountainIds} />
  );
}
