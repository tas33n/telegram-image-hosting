"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Link,
  Check,
  Eye,
} from "lucide-react";
import { useUploader } from "../hooks/useUploader";
import { useUploadHistory } from "../hooks/useUploadHistory";
import { UploadHistoryPanel } from "./UploadHistoryPanel";
import { Link as RouterLink } from "react-router-dom"; 

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

export function PublicUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploading, responses, uploadFiles, clearResponses } = useUploader();
  const history = useUploadHistory();

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files) {
      handleFileSelect(Array.from(event.dataTransfer.files));
    }
  }, []);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (event.clipboardData?.files) {
      const files = Array.from(event.clipboardData.files);
      if (files.length > 0) {
        handleFileSelect(files);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleFileSelect = (files: File[]) => {
    const validFiles = files.filter((file) => validateFile(file));
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} exceeds the 5MB limit.`);
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(`${file.name} is not an accepted format.`);
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    const results = await uploadFiles(selectedFiles);
    history.addFromResponses(results);
    setSelectedFiles([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.warn("Clipboard error", error);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-8 h-8" />;
    if (file.type.startsWith("video/")) return <VideoIcon className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-12">
        <header className="text-center space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Telegram Image Hosting</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload and share images or videos instantly. History lives in your browser, so you stay in control.
            </p>
          </div>
        </header>

        <section className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Images and videos up to 5MB • JPEG, PNG, GIF, WebP, MP4, WebM, MOV
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) =>
                  event.target.files && handleFileSelect(Array.from(event.target.files))
                }
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
              >
                Choose Files
              </button>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Tip: Press Ctrl+V to paste from clipboard</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to upload</h3>
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400">{getFileIcon(file)}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`}
                  </button>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {responses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent upload</h3>
                <button onClick={clearResponses} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Dismiss
                </button>
              </div>

              <div className="space-y-3">
                {responses.map((result, index) => (
                  <div
                    key={`${result.originalName}-${index}`}
                    className={`border rounded-xl p-4 ${
                      result.success ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {result.success && result.url ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{result.originalName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(result.size || 0)} • {result.fileType}
                            </p>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400">Saved to local history</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                          <Link className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <input
                            readOnly
                            value={result.url}
                            className="flex-1 text-sm text-gray-700 dark:text-white bg-transparent focus:outline-none min-w-0"
                          />
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <button
                              onClick={() => copyToClipboard(result.url!)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-sm"
                            >
                              {copiedUrl === result.url ? (
                                <>
                                  <Check className="w-4 h-4" /> Copied
                                </>
                              ) : (
                                "Copy"
                              )}
                            </button>
                            {result.encodedFileId && (
                              <RouterLink
                                to={`${result.url}?a=view`} // Link to direct URL with ?a=view
                                className="inline-flex items-center gap-1 px-3 py-1 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
                              >
                                <Eye className="w-4 h-4" /> Open
                              </RouterLink>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-700 dark:text-red-300">
                        Upload failed: {result.error || "Unknown error"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <UploadHistoryPanel
          entries={history.entries}
          viewMode={history.viewMode}
          onViewModeChange={history.setViewMode}
          sortMode={history.sortMode}
          onSortModeChange={history.setSortMode}
          onRemove={history.removeEntry}
          onClear={history.clearHistory}
          onDownload={history.downloadHistory}
          showWarning
        />
      </div>
    </div>
  );
}