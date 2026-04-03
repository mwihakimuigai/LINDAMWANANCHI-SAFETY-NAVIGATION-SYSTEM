import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { mapService, type NairobiLayers } from "../SERVICES/mapService";

const NairobiMap = dynamic(() => import("../COMPONENTS/MAP/NairobiMap").then((m) => m.NairobiMap), { ssr: false });

export default function MapPage() {
  const { destination, routes, setDestination } = useAppContext();
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [layers, setLayers] = useState<NairobiLayers | null>(null);
  const bestRoute = useMemo(() => routes.find((r) => r.id === selectedRouteId) ?? routes[0], [routes, selectedRouteId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const next = await mapService.getNairobiLayers();
      if (mounted) setLayers(next);
    };
    void load();
    const timer = setInterval(() => {
      void load();
    }, 6000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Interactive Map</h1>
        <p className="lm-meta">Main map view for route planning, lighting status, and danger zones.</p>
        <div className="lm-route-controls">
          <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
          <button type="button" onClick={() => setSelectedRouteId(bestRoute?.id ?? "")}>Find Safe Route</button>
        </div>
        <div className="lm-route-list">
          {routes.map((route) => (
            <button
              key={route.id}
              className={`lm-route-item ${route.id === bestRoute?.id ? "active" : ""}`}
              type="button"
              onClick={() => setSelectedRouteId(route.id)}
            >
              <strong>{route.name}</strong>
              <span>{route.distanceKm}km - {route.etaMinutes}min - risk {route.riskScore}%</span>
            </button>
          ))}
        </div>
      </section>
      <section className="lm-panel">
        <NairobiMap layers={layers} />
      </section>
    </main>
  );
}
