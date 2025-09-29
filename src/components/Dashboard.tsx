import React from "react";
import type { User } from "../types";
import { AdminStatsPanel } from "./AdminStatsPanel";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { useStats } from "../hooks/useStats";
import { useApiKeys } from "../hooks/useApiKeys";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const stats = useStats();
  const apiKeys = useApiKeys();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as {user.username}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-8">
        <AdminStatsPanel
          stats={stats.stats}
          summary={stats.summary}
          loading={stats.loading}
          error={stats.error}
          onRefresh={stats.refresh}
          onRemove={stats.removeStat}
        />

        <ApiKeysPanel
          keys={apiKeys.keys}
          loading={apiKeys.loading}
          onCreate={apiKeys.createKey}
          onDelete={apiKeys.deleteKey}
        />
      </main>
    </div>
  );
}