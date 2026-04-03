import { useEffect, useState } from "react";
import type { Incident, SafetyAlert } from "../TYPES";
import { incidentsService } from "../SERVICES/incidentsService";

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      const [incidentList, alertList] = await Promise.all([
        incidentsService.listIncidents(),
        incidentsService.listAlerts(),
      ]);

      if (!active) return;
      setIncidents((prev) => {
        if (prev.length === 0) return incidentList;
        const map = new Map(prev.map((item) => [item.id, item]));
        for (const incident of incidentList) map.set(incident.id, incident);
        return Array.from(map.values()).sort((a, b) => Number(b.id) - Number(a.id));
      });
      setAlerts(alertList);
      setLoading(false);
    };

    void load();
    const timer = setInterval(() => {
      void load();
    }, 12000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { incidents, alerts, loading };
};
