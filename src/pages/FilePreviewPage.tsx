"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { useViewHistory } from "../hooks/useViewHistory";
import type { ViewedUpload } from "../types";

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString();
}

export function FilePreviewPage() {
  const { encodedId } = useParams<{ encodedId: string }>();
  const location = useLocation();

  const [fileData, setFileData] = useState<ViewedUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { entries: viewedHistory, addViewedEntry, removeViewedEntry, clearViewHistory } = useViewHistory();

  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const isPreviewMode = useMemo(() => {
    if (!encodedId) {
      return false;
    }
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("a") === "view";
  }, [encodedId, location.search]);


  const fetchFileData = useCallback(async () => {
    if (!encodedId || !isPreviewMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const foundEntry = viewedHistory.find(entry => entry.encodedFileId === encodedId);

    if (foundEntry) {
      setFileData(foundEntry);
      if (viewedHistory[0]?.id !== foundEntry.id) {
        const { id, fileId, encodedFileId, url, originalName, fileType, size, uploadedAt } = foundEntry;
        addViewedEntry({ id, fileId, encodedFileId, url, originalName, fileType, size, uploadedAt });
      }
      setLoading(false);
    } else {
      try {
        const response = await fetch(`/file/${encodedId}?info=true`);
        const data = await response.json();

        if (data.success) {
          const fullUrl = `${window.location.origin}/file/${encodedId}`;
          const viewedEntry: ViewedUpload = {
            id: data.encodedFileId,
            fileId: data.fileId,
            encodedFileId: data.encodedFileId,
            url: fullUrl,
            originalName: data.originalName,
            fileType: data.fileType,
            size: data.size,
            uploadedAt: data.uploadedAt,
            viewedAt: Date.now(),
          };
          setFileData(viewedEntry);
          addViewedEntry(viewedEntry);
        } else {
          console.error("fetchFileData: Backend fetch failed:", data.error);
          setError(data.error || "Failed to load file metadata.");
        }
      } catch (err) {
        console.error("fetchFileData: Network error during backend fetch:", err);
        setError(err instanceof Error ? err.message : "Network error fetching file metadata.");
      } finally {
        setLoading(false);
      }
    }
  }, [encodedId, isPreviewMode, viewedHistory, addViewedEntry]);

  useEffect(() => {
    fetchFileData();
  }, [fetchFileData]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = useCallback(() => {
    if (fileData) {
      const link = document.createElement("a");
      link.href = fileData.url;
      link.download = fileData.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileData]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.warn("Clipboard error", error);
    }
  };

  if (!isPreviewMode) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-700 dark:text-red-300 text-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-gray-700 dark:text-gray-300 text-lg">
          File data not available.
        </div>
      </div>
    );
  }

  const isVideo = fileData.fileType.startsWith("video/");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 space-y-8 lg:flex lg:space-x-8 lg:space-y-0">
        {/* Main Preview Area */}
        <div className="lg:flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {fileData.originalName}
          </h1>

          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px] max-h-[70vh]">
            {isVideo ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={fileData.url}
                controls
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
                style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
              />
            ) : (
              <img
                ref={mediaRef as React.RefObject<HTMLImageElement>}
                src={fileData.url}
                alt={fileData.originalName}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
                style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleZoomIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ZoomIn className="w-5 h-5" /> Zoom In
            </button>
            <button
              onClick={handleZoomOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ZoomOut className="w-5 h-5" /> Zoom Out
            </button>
            <button
              onClick={handleRotate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <RotateCw className="w-5 h-5" /> Rotate
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              <Download className="w-5 h-5" /> Save to Device
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                Uploaded: {formatDate(fileData.uploadedAt)} • Size: {formatFileSize(fileData.size)} • Type: {fileData.fileType}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                readOnly
                value={fileData.url}
                className="flex-1 text-sm text-gray-700 dark:text-white bg-transparent focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(fileData.url)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded"
              >
                {copiedUrl === fileData.url ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Viewed History Sidebar */}
        <div className="lg:w-80 lg:flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recently Viewed</h2>
            {viewedHistory.length > 0 && (
              <button
                onClick={clearViewHistory}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {viewedHistory.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No viewed history yet.</p>
            ) : (
              viewedHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="w-16 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {entry.fileType.startsWith("video/") ? (
                      <video src={entry.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={entry.url} alt={entry.originalName} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`${entry.url}?a=view`} className="font-medium text-gray-900 dark:text-white truncate block">
                      {entry.originalName}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(entry.viewedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeViewedEntry(entry.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
