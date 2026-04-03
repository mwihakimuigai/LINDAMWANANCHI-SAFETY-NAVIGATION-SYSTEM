import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { mapService, type NairobiLayers } from "../SERVICES/mapService";

const LiveNavigationMap = dynamic(
  () => import("../COMPONENTS/MAP/LiveNavigationMap").then((m) => m.LiveNavigationMap),
  { ssr: false }
);

const DESTINATIONS = [
  { id: "cbd", label: "Nairobi CBD", coords: { lat: -1.286389, lng: 36.817223 } },
  { id: "westlands", label: "Westlands", coords: { lat: -1.2676, lng: 36.8108 } },
  { id: "karen", label: "Karen", coords: { lat: -1.3196, lng: 36.7073 } },
  { id: "jkia", label: "JKIA", coords: { lat: -1.3192, lng: 36.9278 } },
];

const toRad = (value: number) => (value * Math.PI) / 180;
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earth = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earth * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
};

const buildPath = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
  const midA: [number, number] = [from.lat + (to.lat - from.lat) * 0.34, from.lng + (to.lng - from.lng) * 0.2];
  const midB: [number, number] = [from.lat + (to.lat - from.lat) * 0.72, from.lng + (to.lng - from.lng) * 0.62];
  return [
    [from.lat, from.lng] as [number, number],
    midA,
    midB,
    [to.lat, to.lng] as [number, number],
  ];
};

export default function NavigationPage() {
  const { userLocation, routes, routeError, locationPermission, destination, setDestination, loading } = useAppContext();
  const [draftDestination, setDraftDestination] = useState(destination);
  const [follow, setFollow] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [statusMessage, setStatusMessage] = useState("Type a Nairobi destination or choose a quick destination to generate a safer road-following route.");
  const [layers, setLayers] = useState<NairobiLayers | null>(null);

  useEffect(() => {
    setDraftDestination(destination);
  }, [destination]);

  useEffect(() => {
    let active = true;
    void mapService.getNairobiLayers().then((nextLayers) => {
      if (active) {
        setLayers(nextLayers);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (routes[0] && !routes.find((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes, selectedRouteId]);

  const activeRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId]
  );
  const routedDestination = useMemo(() => {
    if (activeRoute?.resolvedDestination) {
      return {
        id: "route-end",
        label: activeRoute.resolvedDestination.label,
        coords: { lat: activeRoute.resolvedDestination.lat, lng: activeRoute.resolvedDestination.lng },
      };
    }
    const quickMatch = DESTINATIONS.find((item) => item.label.toLowerCase() === destination.trim().toLowerCase());
    if (quickMatch) {
      return {
        id: quickMatch.id,
        label: quickMatch.label,
        coords: quickMatch.coords,
      };
    }
    return {
      id: "unknown-destination",
      label: destination || "Destination pending",
      coords: userLocation,
    };
  }, [activeRoute?.resolvedDestination, destination, userLocation]);
  const routePoints = useMemo(() => {
    if (activeRoute?.geometry?.coordinates?.length) {
      return activeRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
    }
    if (activeRoute?.pathPoints && activeRoute.pathPoints.length > 1) {
      return activeRoute.pathPoints.map((point) => [point.lat, point.lng] as [number, number]);
    }
    return [];
  }, [activeRoute?.geometry?.coordinates, activeRoute?.pathPoints]);
  const unsafeSegments = activeRoute?.unsafeSegments ?? [];
  const fallbackDistance = useMemo(() => distanceKm(userLocation, routedDestination.coords), [routedDestination.coords, userLocation]);
  const distance = activeRoute?.distanceKm ?? fallbackDistance;
  const etaMinutes = activeRoute?.etaMinutes ?? Math.max(4, Math.round((fallbackDistance / 28) * 60));
  const bestRisk = activeRoute?.riskScore ?? 0;
  const safetyScore = activeRoute?.safetyScore ?? Math.round(distance * 1000 + bestRisk * 55);

  useEffect(() => {
    if (routeError) {
      setStatusMessage(routeError);
      return;
    }
    if (activeRoute?.resolvedDestination) {
      setStatusMessage(`Route locked to ${activeRoute.resolvedDestination.label}. The path now follows connected road segments and avoids risky corridors where possible.`);
      return;
    }
    if (loading) {
      setStatusMessage("Calculating a safe road-following route from your live location.");
      return;
    }
    setStatusMessage("Type a Nairobi destination or choose a quick destination to generate a safer road-following route.");
  }, [activeRoute?.resolvedDestination, loading, routeError]);

  const calculateSafeRoute = () => {
    const nextDestination = draftDestination.trim();
    if (!nextDestination) {
      setStatusMessage("Please type a destination first, for example Westlands, Karen, South C, or JKIA.");
      return;
    }

    setStatusMessage(`Finding the safest connected road route to ${nextDestination}...`);
    setDestination(nextDestination);
  };

  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Safe Route Navigation</h1>
        <p className="lm-meta">Enter your destination and calculate the safest route using current risk stats.</p>
        <p className="lm-meta">{statusMessage}</p>
        <div className="lm-route-controls">
          <input
            value={draftDestination}
            onChange={(e) => setDraftDestination(e.target.value)}
            placeholder="Enter destination e.g. Westlands, Karen, CBD"
          />
          <button type="button" onClick={calculateSafeRoute}>
            {loading ? "Calculating..." : "Calculate Safe Route"}
          </button>
        </div>
        <div className="lm-guide-tabs">
          {DESTINATIONS.map((item) => (
            <button key={item.id} type="button" onClick={() => {
              setDraftDestination(item.label);
              setStatusMessage(`Finding the safest connected road route to ${item.label}...`);
              setDestination(item.label);
            }}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="lm-route-controls">
          <button type="button" onClick={() => setFollow((prev) => !prev)}>
            {follow ? "Disable Follow" : "Enable Follow"}
          </button>
        </div>
        <div className="lm-route-list">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              className={`lm-route-item ${route.id === activeRoute?.id ? "active" : ""}`}
              onClick={() => setSelectedRouteId(route.id)}
            >
              <strong>{route.name}</strong>
              <span>{route.distanceKm} km - {route.etaMinutes} min - risk {route.riskScore}% - score {route.safetyScore ?? "-"}</span>
            </button>
          ))}
        </div>
      </section>

      {locationPermission !== "granted" ? (
        <section className="lm-panel">
          <p className="lm-meta">
            Live location is currently off. Please allow location sharing to run full safe-route navigation.
          </p>
        </section>
      ) : null}

      <section className="lm-panel lm-nav-panel">
        <div className="lm-nav-hud top-left">
          <strong>{distance.toFixed(1)} km</strong>
          <span>Proceed to {routedDestination.label}</span>
        </div>
        <div className="lm-nav-hud top-right speed">
          <strong>{Math.max(18, Math.min(50, Math.round(34 - bestRisk / 6)))} km/h</strong>
          <span>safe speed</span>
        </div>
        <LiveNavigationMap
          userLocation={userLocation}
          destination={routedDestination}
          routePoints={routePoints}
          unsafeSegments={unsafeSegments}
          streetLights={layers?.streetLights ?? []}
          follow={follow}
        />
        <div className="lm-nav-bottom">
          <div>
            <strong>{distance.toFixed(1)} km</strong>
            <span>{etaMinutes} min ETA</span>
          </div>
          <div>
            <strong>Score {safetyScore}</strong>
            <span>risk {bestRisk}%</span>
          </div>
          <div>
            <strong>{unsafeSegments.length}</strong>
            <span>unsafe segments flagged</span>
          </div>
          <div>
            <strong>{new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>arrival</span>
          </div>
        </div>
      </section>
    </main>
  );
}
