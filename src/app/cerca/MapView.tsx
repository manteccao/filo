"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type CityMarker = {
  city: string;
  lat: number;
  lng: number;
  count: number;
};

function createPin(count: number, selected: boolean) {
  const bg = selected ? "#0b7c76" : "#0D9488";
  const shadow = selected
    ? "0 0 0 3px white, 0 0 16px rgba(13,148,136,0.9)"
    : "0 0 12px rgba(13,148,136,0.6)";
  return L.divIcon({
    html: `<div style="
      min-width:28px;height:28px;border-radius:14px;
      background:${bg};border:2px solid white;
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;color:white;
      padding:0 7px;cursor:pointer;
      transition:all 0.15s;
    ">${count}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapClickAway({ onClickAway }: { onClickAway: () => void }) {
  useMapEvents({ click: onClickAway });
  return null;
}

export default function MapView({
  markers,
  selectedCity,
  onCityClick,
}: {
  markers: CityMarker[];
  selectedCity: string | null;
  onCityClick: (city: string) => void;
}) {
  return (
    <MapContainer
      center={[42.5, 12.5]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: "60vh", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapClickAway onClickAway={() => onCityClick("")} />
      {markers.map((m) => {
        const isSelected = selectedCity?.toLowerCase() === m.city.toLowerCase();
        return (
          <Marker
            key={m.city}
            position={[m.lat, m.lng]}
            icon={createPin(m.count, isSelected)}
            eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); onCityClick(m.city); } }}
          />
        );
      })}
    </MapContainer>
  );
}
