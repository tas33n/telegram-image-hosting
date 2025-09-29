export interface StoredUpload {
  id: string;
  fileId: string;
  encodedFileId: string;
  url: string;
  originalName: string;
  size: number;
  fileType: string;
  uploadedAt: number;
  viaApiKey?: boolean;
}

export interface ViewedUpload {
  id: string; // encodedFileId
  fileId: string;
  encodedFileId: string;
  url: string; // The direct file URL
  originalName: string;
  fileType: string;
  size: number;
  viewedAt: number;
}

export type HistorySortMode = "recent" | "name" | "size";
export type HistoryViewMode = "grid" | "list";

export interface UploadResponse {
  success: boolean;
  url?: string;
  fileId?: string;
  encodedFileId?: string;
  originalName?: string;
  size?: number;
  fileType?: string;
  uploadedAt?: number;
  viaApiKey?: boolean;
  error?: string;
}

export interface UsageStat {
  id: string;
  uploads: number;
  totalBytes: number;
  apiUploads: number;
  lastUpload?: number;
  lastFileName?: string;
  lastFileType?: string;
  userAgent?: string;
  country?: string;
  device?: string;
  browser?: string;
  ipHash?: string;
}

export interface UsageSummary {
  uploads: number;
  bytes: number;
  apiUploads: number;
  lastUpload?: number;
}

export interface ApiKeyRecord {
  key: string;
  label: string;
  createdAt: number;
  createdBy?: string;
  usageCount?: number;
  lastUsed?: number;
}

export interface User {
  username: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}