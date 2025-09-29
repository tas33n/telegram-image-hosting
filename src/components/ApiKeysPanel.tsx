import React, { useState } from "react";
import { KeyRound, Plus, Trash2, Copy, Check } from "lucide-react";
import type { ApiKeyRecord } from "../types";

interface ApiKeysPanelProps {
  keys: ApiKeyRecord[];
  loading: boolean;
  onCreate: (label: string) => Promise<ApiKeyRecord> | ApiKeyRecord;
  onDelete: (key: string) => Promise<void> | void;
}

export function ApiKeysPanel({ keys, loading, onCreate, onDelete }: ApiKeysPanelProps) {
  const [label, setLabel] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (creating) return;

    try {
      setCreating(true);
      await onCreate(label.trim());
      setLabel("");
    } catch (error) {
      console.error("Create API key error", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.warn("Clipboard error", error);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate keys for programmatic uploads.</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-3">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label (optional)"
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creating..." : "Create key"}
        </button>
      </form>

      <div className="space-y-3">
        {loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading keys...</div>
        )}

        {keys.map((key) => (
          <article key={key.key} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{key.key}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {formatDate(key.createdAt)} • Used {key.usageCount || 0} times
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(key.key)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {copiedKey === key.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(key.key)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}

        {keys.length === 0 && !loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No API keys yet.</div>
        )}
      </div>
    </section>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}