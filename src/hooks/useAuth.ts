import { useState, useEffect, useCallback } from "react";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  }, []);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: token } : {};
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    getAuthHeader,
    isAuthenticated: Boolean(user),
  };
}
