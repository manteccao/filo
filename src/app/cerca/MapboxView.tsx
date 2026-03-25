"use client";

import { useCallback } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export type CityMarker = {
  city: string;
  lat: number;
  lng: number;
  count: number;
};

export default function MapboxView({
  markers,
  selectedCity,
  onCityClick,
}: {
  markers: CityMarker[];
  selectedCity: string | null;
  onCityClick: (city: string) => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const onLoad = useCallback((event: { target: mapboxgl.Map }) => {
    const map = event.target;
    if (map.getLayer("3d-buildings")) return;
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#1a1a2e",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.75,
      },
    } as mapboxgl.AnyLayer);
  }, []);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111111]">
        <p className="text-sm text-[#6b7280]">NEXT_PUBLIC_MAPBOX_TOKEN mancante in .env.local</p>
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ longitude: 12.5, latitude: 42.5, zoom: 5.5 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onLoad={onLoad as never}
    >
      {markers.map((m) => {
        const isSelected = selectedCity?.toLowerCase() === m.city.toLowerCase();
        return (
          <Marker
            key={m.city}
            latitude={m.lat}
            longitude={m.lng}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); onCityClick(m.city); }}
          >
            <div
              style={{
                minWidth: 30,
                height: 30,
                borderRadius: 15,
                background: isSelected ? "#0b7c76" : "#0D9488",
                border: isSelected ? "2.5px solid white" : "2px solid rgba(255,255,255,0.8)",
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(13,148,136,0.4), 0 0 20px rgba(13,148,136,0.8)"
                  : "0 0 12px rgba(13,148,136,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "white",
                padding: "0 8px",
                cursor: "pointer",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                transition: "all 0.15s ease",
              }}
            >
              {m.count}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
