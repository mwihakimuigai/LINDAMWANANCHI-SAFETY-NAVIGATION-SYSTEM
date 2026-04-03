import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "../TYPES";

const DEFAULT_LOCATION: Coordinates = { lat: -1.286389, lng: 36.817223 };
const LOCATION_PREF_KEY = "lm_location_pref";
type LocationPermission = "prompt" | "requesting" | "granted" | "denied";

export const useUserLocation = () => {
  const [location, setLocation] = useState<Coordinates>(DEFAULT_LOCATION);
  const [isLocationApproximate, setIsLocationApproximate] = useState(true);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>("prompt");
  const watchIdRef = useRef<number | null>(null);

  const clearWatcher = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestLocationSharing = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    localStorage.setItem(LOCATION_PREF_KEY, "accepted");
    setLocationPermission("requesting");
    setIsLocationApproximate(true);

    clearWatcher();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocationApproximate(false);
        setLocationPermission("granted");
      },
      () => {
        setIsLocationApproximate(true);
        setLocationPermission("denied");
        localStorage.setItem(LOCATION_PREF_KEY, "denied");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 2000 }
    );
  }, [clearWatcher]);

  const denyLocationSharing = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCATION_PREF_KEY, "denied");
    }
    clearWatcher();
    setIsLocationApproximate(true);
    setLocationPermission("denied");
  }, [clearWatcher]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPreference = localStorage.getItem(LOCATION_PREF_KEY);
    if (savedPreference === "accepted") {
      requestLocationSharing();
    } else if (savedPreference === "denied") {
      setLocationPermission("denied");
    } else {
      setLocationPermission("prompt");
    }

    return () => {
      clearWatcher();
    };
  }, [clearWatcher, requestLocationSharing]);

  return { location, isLocationApproximate, locationPermission, requestLocationSharing, denyLocationSharing };
};
