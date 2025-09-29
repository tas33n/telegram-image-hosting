import { useState } from "react";
import type { UploadResponse } from "../types";

export function useUploader() {
  const [uploading, setUploading] = useState(false);
  const [responses, setResponses] = useState<UploadResponse[]>([]);

  const uploadFiles = async (files: File[]): Promise<UploadResponse[]> => {
    if (!files.length) return [];

    setUploading(true);
    const results: UploadResponse[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const payload = (await response.json()) as UploadResponse;

          if (response.ok && payload.success) {
            results.push(payload);
          } else {
            results.push({
              success: false,
              error: payload.error || "Upload failed",
              originalName: file.name,
            });
          }
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Network error",
            originalName: file.name,
          });
        }
      }

      setResponses(results);
      return results;
    } finally {
      setUploading(false);
    }
  };

  const clearResponses = () => setResponses([]);

  return {
    uploading,
    responses,
    uploadFiles,
    clearResponses,
  };
}
