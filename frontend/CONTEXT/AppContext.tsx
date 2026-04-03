import React, { createContext, useContext, useMemo, useState } from "react";
import type { Coordinates, Incident, SafeRoute, SafetyAlert, UserProfile } from "../TYPES";
import { useIncidents } from "../HOOKS/useIncidents";
import { useSafeRoutes } from "../HOOKS/useSafeRoutes";
import { useUserLocation } from "../HOOKS/usersUserLocation";
import { usersService } from "../SERVICES/usersService";

type AppState = {
  destination: string;
  setDestination: (value: string) => void;
  incidents: Incident[];
  alerts: SafetyAlert[];
  routes: SafeRoute[];
  routeError: string;
  loading: boolean;
  user?: UserProfile;
  userLoading: boolean;
  userLocation: Coordinates;
  isLocationApproximate: boolean;
  locationPermission: "prompt" | "requesting" | "granted" | "denied";
  requestLocationSharing: () => void;
  denyLocationSharing: () => void;
  refreshUser: () => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [destination, setDestination] = useState("CBD Bus Station");
  const [user, setUser] = useState<UserProfile | undefined>();
  const [userLoading, setUserLoading] = useState(true);
  const { incidents, alerts, loading: incidentsLoading } = useIncidents();
  const { location, isLocationApproximate, locationPermission, requestLocationSharing, denyLocationSharing } = useUserLocation();
  const { routes, loading: routesLoading, error: routeError } = useSafeRoutes({
    userLocation: location,
    destination,
    incidents,
  });

  const refreshUser = React.useCallback(async () => {
    setUserLoading(true);
    try {
      const nextUser = await usersService.getCurrentUser();
      setUser(nextUser);
    } catch {
      setUser(undefined);
    } finally {
      setUserLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      destination,
      setDestination,
      incidents,
      alerts,
      routes,
      routeError,
      user,
      userLoading,
      userLocation: location,
      isLocationApproximate,
      locationPermission,
      requestLocationSharing,
      denyLocationSharing,
      refreshUser,
      loading: incidentsLoading || routesLoading,
    }),
    [
      alerts,
      denyLocationSharing,
      destination,
      incidents,
      incidentsLoading,
      isLocationApproximate,
      location,
      locationPermission,
      requestLocationSharing,
      refreshUser,
      routeError,
      routes,
      routesLoading,
      user,
      userLoading,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
