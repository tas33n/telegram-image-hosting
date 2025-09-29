import { useCallback, useEffect, useState } from "react";
import type { UsageStat, UsageSummary } from "../types";
import { useAuth } from "./useAuth";

interface FetchOptions {
  silent?: boolean;
}

export function useStats() {
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (options: FetchOptions = {}) => {
    const { silent } = options;

    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const response = await fetch("/api/stats", {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usage stats");
      }

      const data = await response.json();
      setStats(data.items || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [getAuthHeader]);

  const removeStat = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/stats", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete stat entry");
      }

      setStats((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats({ silent: true });
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const refresh = useCallback(() => fetchStats(), [fetchStats]);

  return {
    stats,
    summary,
    loading,
    error,
    refresh,
    removeStat,
  };
}
