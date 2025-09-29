import React from "react";
import { RefreshCcw, Trash2, Globe, HardDrive } from "lucide-react";
import type { UsageStat, UsageSummary } from "../types";

interface AdminStatsPanelProps {
  stats: UsageStat[];
  summary: UsageSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onRemove: (id: string) => void;
}

export function AdminStatsPanel({ stats, summary, loading, error, onRefresh, onRemove }: AdminStatsPanelProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Usage Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aggregated by anonymous browser fingerprint.</p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total uploads" value={summary?.uploads || 0} />
        <StatCard title="Via API key" value={summary?.apiUploads || 0} />
        <StatCard title="Data transferred" value={formatBytes(summary?.bytes || 0)} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Identity</th>
              <th className="px-4 py-3 text-left">Uploads</th>
              <th className="px-4 py-3 text-left">Last upload</th>
              <th className="px-4 py-3 text-left md:table-cell hidden">Device / Agent</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
            {stats.map((stat) => (
              <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-400">{stat.id.slice(0, 16)}...</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">IP hash: {stat.ipHash}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 dark:text-white">{stat.uploads}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">API: {stat.apiUploads}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(stat.totalBytes)}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{formatDate(stat.lastUpload)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={stat.lastFileName}>
                    {stat.lastFileName || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-3 md:table-cell hidden">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="truncate" title={stat.device || stat.browser}>
                      {stat.device || stat.browser || "Unknown"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={stat.userAgent}>
                    {stat.userAgent || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{stat.country || "??"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemove(stat.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {stats.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
                  No usage data collected yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
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