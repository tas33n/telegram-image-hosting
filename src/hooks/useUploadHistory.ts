import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  StoredUpload,
  HistorySortMode,
  HistoryViewMode,
  UploadResponse,
} from "../types";

const HISTORY_KEY = "telegram.uploadHistory.v1";
const VIEW_KEY = "telegram.uploadHistory.view";
const SORT_KEY = "telegram.uploadHistory.sort";

function loadHistory(): StoredUpload[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: StoredUpload[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse upload history", error);
    return [];
  }
}

function persistHistory(entries: StoredUpload[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to persist upload history", error);
  }
}

function persistPreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Failed to persist preference", error);
  }
}

function loadPreference<T extends string>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return (value as T) || fallback;
  } catch (error) {
    console.warn("Failed to read preference", error);
    return fallback;
  }
}

function transformResponse(response: UploadResponse): StoredUpload | null {
  if (!response.success || !response.url || !response.fileId || !response.encodedFileId) {
    return null;
  }

  return {
    id: response.encodedFileId,
    fileId: response.fileId,
    encodedFileId: response.encodedFileId,
    url: response.url,
    originalName: response.originalName || response.fileId,
    size: response.size || 0,
    fileType: response.fileType || "unknown",
    uploadedAt: response.uploadedAt || Date.now(),
    viaApiKey: response.viaApiKey,
  };
}

export function useUploadHistory() {
  const [entries, setEntries] = useState<StoredUpload[]>([]);
  const [viewMode, setViewMode] = useState<HistoryViewMode>("grid");
  const [sortMode, setSortMode] = useState<HistorySortMode>("recent");

  useEffect(() => {
    setEntries(loadHistory());
    setViewMode(loadPreference(VIEW_KEY, "grid"));
    setSortMode(loadPreference(SORT_KEY, "recent"));
  }, []);

  useEffect(() => {
    persistHistory(entries);
  }, [entries]);

  useEffect(() => {
    persistPreference(VIEW_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    persistPreference(SORT_KEY, sortMode);
  }, [sortMode]);

  const sortedEntries = useMemo(() => {
    const cloned = [...entries];
    if (sortMode === "recent") {
      cloned.sort((a, b) => b.uploadedAt - a.uploadedAt);
    } else if (sortMode === "name") {
      cloned.sort((a, b) => a.originalName.localeCompare(b.originalName));
    } else if (sortMode === "size") {
      cloned.sort((a, b) => (b.size || 0) - (a.size || 0));
    }
    return cloned;
  }, [entries, sortMode]);

  const addFromResponses = useCallback((responses: UploadResponse[]) => {
    const mapped = responses
      .map(transformResponse)
      .filter((item): item is StoredUpload => Boolean(item));

    if (mapped.length === 0) return mapped;

    setEntries((prev) => {
      const existingById = new Map(prev.map((entry) => [entry.id, entry]));
      mapped.forEach((entry) => existingById.set(entry.id, entry));
      return Array.from(existingById.values());
    });

    return mapped;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  const downloadHistory = useCallback(() => {
    const blob = new Blob([
      JSON.stringify(
        entries.map(({ originalName, url }) => ({ originalName, url })),
        null,
        2,
      ),
    ], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `telegram-upload-history-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [entries]);

  return {
    entries: sortedEntries,
    rawEntries: entries,
    addFromResponses,
    removeEntry,
    clearHistory,
    downloadHistory,
    viewMode,
    setViewMode,
    sortMode,
    setSortMode,
  };
}
