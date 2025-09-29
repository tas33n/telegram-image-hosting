import { useCallback, useEffect, useMemo, useState } from "react";
import type { ViewedUpload } from "../types";

const VIEW_HISTORY_KEY = "telegram.viewHistory.v1";

function loadViewHistory(): ViewedUpload[] {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY);
    if (!raw) return [];
    const parsed: ViewedUpload[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse view history", error);
    return [];
  }
}

function persistViewHistory(entries: ViewedUpload[]) {
  try {
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to persist view history", error);
  }
}

export function useViewHistory() {
  const [entries, setEntries] = useState<ViewedUpload[]>([]);

  useEffect(() => {
    setEntries(loadViewHistory());
  }, []);

  useEffect(() => {
    persistViewHistory(entries);
  }, [entries]);

  const addViewedEntry = useCallback((entry: Omit<ViewedUpload, 'viewedAt'>) => {
    setEntries((prev) => {
      const newEntry = { ...entry, viewedAt: Date.now() };
      // Remove existing entry with the same ID to ensure it's at the top/most recent
      const filtered = prev.filter((item) => item.id !== newEntry.id);
      return [newEntry, ...filtered].slice(0, 20); // Keep only the 20 most recent
    });
  }, []);

  const removeViewedEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearViewHistory = useCallback(() => {
    setEntries([]);
  }, []);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => b.viewedAt - a.viewedAt);
  }, [entries]);

  return {
    entries: sortedEntries,
    addViewedEntry,
    removeViewedEntry,
    clearViewHistory,
  };
}