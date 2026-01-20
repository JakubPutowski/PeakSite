"use client";

import dynamic from "next/dynamic";

// Tutaj robimy import dynamiczny z ssr: false
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

export default function MapWrapper({ mountains }: { mountains: Mountain[] }) {
  return <LeafletMap mountains={mountains} />;
}
