"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Naprawa ikonek Leafleta w Next.js (bez tego pinezki są niewidoczne!)
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Mountain = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
};

export default function Map({ mountains }: { mountains: Mountain[] }) {
  // Ustawiamy widok startowy na Polskę (lub pierwszy szczyt z listy)
  const center: [number, number] =
    mountains.length > 0
      ? [mountains[0].lat, mountains[0].lng]
      : [52.0693, 19.4803];

  return (
    <MapContainer
      center={center}
      zoom={mountains.length > 0 ? 13 : 6}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "12px",
        zIndex: 0,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mountains.map((peak) => (
        <Marker key={peak.id} position={[peak.lat, peak.lng]} icon={markerIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-lg">{peak.name}</strong>
              <br />
              {peak.elevation} m n.p.m.
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
