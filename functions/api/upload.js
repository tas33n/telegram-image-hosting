import { corsHeaders } from "../utils/middleware.js";
import {
  fingerprintRequest,
  enforceRateLimit,
  saveUsageStats,
  verifyApiKey,
  touchApiKeyUsage,
} from "../utils/app-data.js";
import {
  encodeFileId,
  extractFileId,
  sendToTelegram,
} from "../utils/telegram.js";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(),
    });
  }

  try {
    const formData = await request.clone().formData();
    const uploadFile = formData.get("file");

    if (!uploadFile || typeof uploadFile === "string") {
      return jsonError("No file uploaded", 400);
    }

    if (uploadFile.size > MAX_UPLOAD_BYTES) {
      return jsonError("File size exceeds 5MB limit", 413);
    }

    if (!ALLOWED_TYPES.includes(uploadFile.type)) {
      return jsonError("File type not supported", 400);
    }

    const apiKeyHeader = request.headers.get("X-API-Key");
    const apiKeyRecord = await verifyApiKey(env, apiKeyHeader);
    const fingerprint = await fingerprintRequest(request);

    const rateResult = await enforceRateLimit(env, fingerprint, {
      viaApiKey: Boolean(apiKeyRecord),
    });

    if (!rateResult.allowed) {
      return jsonError(
        `Upload rate limit reached. Retry after ${Math.ceil(
          (rateResult.retryAfter || 0) / 1000,
        )}s`,
        429,
      );
    }

    const telegramFormData = new FormData();
    telegramFormData.append("chat_id", env.TG_CHAT_ID);

    let apiEndpoint;
    if (uploadFile.type.startsWith("image/")) {
      telegramFormData.append("photo", uploadFile);
      apiEndpoint = "sendPhoto";
    } else if (uploadFile.type.startsWith("video/")) {
      telegramFormData.append("video", uploadFile);
      apiEndpoint = "sendVideo";
    } else if (uploadFile.type.startsWith("audio/")) {
      telegramFormData.append("audio", uploadFile);
      apiEndpoint = "sendAudio";
    } else {
      telegramFormData.append("document", uploadFile);
      apiEndpoint = "sendDocument";
    }

    const telegramResult = await sendToTelegram(env, telegramFormData, apiEndpoint);
    if (!telegramResult.success) {
      return jsonError(telegramResult.error || "Upload failed", 502);
    }

    const fileId = extractFileId(telegramResult.data);
    if (!fileId) {
      return jsonError("Failed to resolve Telegram file id", 500);
    }

    const encodedId = encodeFileId(fileId);
    const origin = new URL(request.url).origin;
    const fileUrl = `${origin}/file/${encodedId}`;

    // Removed saveFileMetadata call as per user request

    await saveUsageStats(env, fingerprint, {
      fileName: uploadFile.name,
      fileType: uploadFile.type,
      bytes: uploadFile.size,
      viaApiKey: Boolean(apiKeyRecord),
    }, rateResult);

    if (apiKeyRecord) {
      await touchApiKeyUsage(env, apiKeyRecord);
    }

    const responsePayload = {
      success: true,
      url: fileUrl,
      fileId,
      encodedFileId: encodedId,
      originalName: uploadFile.name, // Still include for frontend local history
      size: uploadFile.size, // Still include for frontend local history
      fileType: uploadFile.type, // Still include for frontend local history
      uploadedAt: Date.now(), // Still include for frontend local history
      viaApiKey: Boolean(apiKeyRecord),
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Unified upload error", error);
    return jsonError("Internal server error", 500);
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}