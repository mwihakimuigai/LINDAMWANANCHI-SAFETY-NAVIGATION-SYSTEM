import { useEffect, useState } from "react";
import { locationsService } from "../SERVICES/locationsService";
import type { Coordinates, Incident, SafeRoute } from "../TYPES";

export const useSafeRoutes = (params: {
  userLocation: Coordinates;
  destination: string;
  incidents: Incident[];
}) => {
  const [routes, setRoutes] = useState<SafeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const roundedLat = Number(params.userLocation.lat.toFixed(4));
  const roundedLng = Number(params.userLocation.lng.toFixed(4));
  const trimmedDestination = params.destination.trim();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const nextRoutes = await locationsService.getSafeRoutes({
          userLocation: { lat: roundedLat, lng: roundedLng },
          destination: trimmedDestination || "CBD Bus Station",
          incidents: params.incidents,
        });
        if (!active) return;
        setRoutes(nextRoutes);
      } catch (nextError) {
        if (!active) return;
        setRoutes([]);
        setError(nextError instanceof Error ? nextError.message : "Unable to fetch safe routes");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [roundedLat, roundedLng, trimmedDestination, params.incidents]);

  return { routes, loading, error };
};
