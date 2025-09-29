import { useCallback, useEffect, useState } from "react";
import type { ApiKeyRecord } from "../types";
import { useAuth } from "./useAuth";

export function useApiKeys() {
  const { getAuthHeader } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/api-keys", {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load API keys");
      }

      const data = await response.json();
      setKeys(data.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const createKey = useCallback(async (label: string) => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ label }),
      });

      if (!response.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await response.json();
      setKeys((prev) => [data.key, ...prev]);
      return data.key;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }, [getAuthHeader]);

  const deleteKey = useCallback(async (key: string) => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      setKeys((prev) => prev.filter((item) => item.key !== key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return {
    keys,
    loading,
    error,
    refresh: fetchKeys,
    createKey,
    deleteKey,
  };
}
