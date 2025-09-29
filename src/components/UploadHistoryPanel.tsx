import React, { useMemo, useState } from "react";
import {
  Copy,
  Check,
  Trash2,
  Download,
  Grid as GridIcon,
  List as ListIcon,
  Clock,
  ArrowUpAZ,
  ArrowDownWideNarrow,
  Eye,
} from "lucide-react";
import type {
  StoredUpload,
  HistorySortMode,
  HistoryViewMode,
} from "../types";
import { Link as RouterLink } from "react-router-dom"; 

interface UploadHistoryPanelProps {
  entries: StoredUpload[];
  viewMode: HistoryViewMode;
  onViewModeChange: (mode: HistoryViewMode) => void;
  sortMode: HistorySortMode;
  onSortModeChange: (mode: HistorySortMode) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onDownload: () => void;
  title?: string;
  showWarning?: boolean;
}

export function UploadHistoryPanel({
  entries,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
  onRemove,
  onClear,
  onDownload,
  title = "Upload History",
  showWarning,
}: UploadHistoryPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emptyState = entries.length === 0;

  const totals = useMemo(() => {
    const bytes = entries.reduce((sum, item) => sum + (item.size || 0), 0);
    return {
      count: entries.length,
      bytes,
    };
  }, [entries]);

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.warn("Clipboard error", error);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totals.count} file{totals.count === 1 ? "" : "s"} saved locally - {formatBytes(totals.bytes)} total
          </p>
          {showWarning && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Upload history is stored only in your browser. Clearing cache or switching devices removes it.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" />
            Backup JSON
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              viewMode === "grid" ? "bg-gray-900 dark:bg-gray-700 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <GridIcon className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              viewMode === "list" ? "bg-gray-900 dark:bg-gray-700 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ListIcon className="w-4 h-4" /> List
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => onSortModeChange("recent")}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              sortMode === "recent" ? "bg-gray-900 dark:bg-gray-700 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Clock className="w-4 h-4" /> Recent
          </button>
          <button
            onClick={() => onSortModeChange("name")}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              sortMode === "name" ? "bg-gray-900 dark:bg-gray-700 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ArrowUpAZ className="w-4 h-4" /> Name
          </button>
          <button
            onClick={() => onSortModeChange("size")}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              sortMode === "size" ? "bg-gray-900 dark:bg-gray-700 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ArrowDownWideNarrow className="w-4 h-4" /> Size
          </button>
        </div>
      </div>

      {emptyState ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-500 dark:text-gray-400">
          No uploads yet. Upload something to start your personal history.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <article key={entry.id} className="border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div className="relative bg-gray-50 dark:bg-gray-700">
                {entry.fileType.startsWith("video/") ? (
                  <video src={entry.url} className="w-full h-48 object-cover" controls preload="metadata" />
                ) : (
                  <img src={entry.url} alt={entry.originalName} className="w-full h-48 object-cover" loading="lazy" />
                )}
                <button
                  onClick={() => onRemove(entry.id)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={entry.originalName}>
                    {entry.originalName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(entry.uploadedAt)} - {formatBytes(entry.size)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(entry.id, entry.url)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="w-4 h-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy URL
                        </>
                      )}
                    </button>
                  </div>
                  {entry.encodedFileId && (
                    <RouterLink
                      to={`${entry.url}?a=view`} // Link to direct URL with ?a=view
                      className="inline-flex items-center gap-1 px-3 py-1 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
                    >
                      <Eye className="w-4 h-4" /> Open
                    </RouterLink>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">Uploaded</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
              {entries.map((entry) => {
                const isVideo = entry.fileType?.startsWith("video/");
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {isVideo ? (
                            <video
                              src={entry.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={entry.url}
                              alt={entry.originalName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white truncate" title={entry.originalName}>
                            {entry.originalName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{entry.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatBytes(entry.size)}</td>
                    <td className="px-4 py-3">{formatDate(entry.uploadedAt)}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleCopy(entry.id, entry.url)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {copiedId === entry.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {entry.encodedFileId && (
                        <RouterLink
                          to={`${entry.url}?a=view`} // Link to direct URL with ?a=view
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="w-4 h-4" /> Open
                        </RouterLink>
                      )}
                      <button
                        onClick={() => onRemove(entry.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString();
}