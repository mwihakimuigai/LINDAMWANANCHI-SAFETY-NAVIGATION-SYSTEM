import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "../TYPES";
import { reportsService, type DashboardAnalytics } from "../SERVICES/reportsService";
import { usersService } from "../SERVICES/usersService";

export const useAdminData = (includeUsers = false) => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshAnalytics = useCallback(async () => {
    const data = await reportsService.getDashboard();
    setAnalytics(data);
    return data;
  }, []);

  const refreshUsers = useCallback(async () => {
    if (!includeUsers) return [];
    const data = await usersService.listUsers();
    setUsers(data);
    return data;
  }, [includeUsers]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [dashboard, userList] = await Promise.all([
          reportsService.getDashboard(),
          includeUsers ? usersService.listUsers() : Promise.resolve([]),
        ]);
        if (!active) return;
        setAnalytics(dashboard);
        setUsers(userList);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load admin data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [includeUsers]);

  return {
    analytics,
    users,
    setUsers,
    setAnalytics,
    loading,
    error,
    refreshAnalytics,
    refreshUsers,
  };
};
