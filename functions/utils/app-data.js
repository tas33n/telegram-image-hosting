const encoder = new TextEncoder();

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(buffer));
}

export async function fingerprintRequest(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const userAgent = request.headers.get("User-Agent") || "unknown";
  const country = request.headers.get("CF-IPCountry") || "??";
  const device = request.headers.get("Sec-CH-UA-Model") || "unknown";
  const browser = request.headers.get("Sec-CH-UA") || "unknown";

  const identitySource = `${ip}|${userAgent}|${country}|${device}|${browser}`;
  const identity = await sha256(identitySource);
  const ipHash = (await sha256(ip)).slice(0, 24);

  return {
    identity,
    ipHash,
    userAgent,
    country,
    device,
    browser,
  };
}

export async function enforceRateLimit(env, fingerprint, { viaApiKey } = {}) {
  if (!env.app_data) {
    return { allowed: true, windowStart: Date.now(), windowCount: 0 };
  }

  const key = `stats:${fingerprint.identity}`;
  const record = await env.app_data.get(key, { type: "json" });
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limit = viaApiKey ? 200 : 30;

  let windowStart = record?.windowStart ?? now;
  let windowCount = record?.windowCount ?? 0;

  if (now - windowStart >= windowMs) {
    windowStart = now;
    windowCount = 0;
  }

  if (windowCount >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(0, windowMs - (now - windowStart)),
      windowStart,
      windowCount,
    };
  }

  return { allowed: true, windowStart, windowCount };
}
export async function saveUsageStats(env, fingerprint, input, windowState) {
  if (!env.app_data) return;

  const key = `stats:${fingerprint.identity}`;
  const now = Date.now();
  const previous = (await env.app_data.get(key, { type: "json" })) || {};
  const state = windowState || (await enforceRateLimit(env, fingerprint, {
    viaApiKey: input.viaApiKey,
  }));

  const payload = {
    id: fingerprint.identity,
    createdAt: previous.createdAt || now,
    uploads: (previous.uploads || 0) + 1,
    totalBytes: (previous.totalBytes || 0) + (input.bytes || 0),
    apiUploads: (previous.apiUploads || 0) + (input.viaApiKey ? 1 : 0),
    lastUpload: now,
    lastFileName: input.fileName,
    lastFileType: input.fileType,
    ipHash: fingerprint.ipHash,
    userAgent: fingerprint.userAgent,
    country: fingerprint.country,
    device: fingerprint.device,
    browser: fingerprint.browser,
    viaApiKey: input.viaApiKey,
    windowStart: state.windowStart,
    windowCount: (state.windowCount || 0) + 1,
  };

  await env.app_data.put(key, JSON.stringify(payload));

  const globalKey = "stats:global";
  const global = (await env.app_data.get(globalKey, { type: "json" })) || {
    uploads: 0,
    bytes: 0,
    apiUploads: 0,
  };

  global.uploads += 1;
  global.bytes += input.bytes || 0;
  global.apiUploads += input.viaApiKey ? 1 : 0;
  global.lastUpload = now;

  await env.app_data.put(globalKey, JSON.stringify(global));
}
export async function listUsageStats(env) {
  if (!env.app_data) return { items: [], summary: null };

  const summary = await env.app_data.get("stats:global", { type: "json" });
  const items = [];
  let cursor;

  do {
    const result = await env.app_data.list({ prefix: "stats:", cursor });
    cursor = result.cursor;

    for (const entry of result.keys) {
      if (entry.name === "stats:global") continue;
      const value = await env.app_data.get(entry.name, { type: "json" });
      if (value) {
        items.push(value);
      }
    }
  } while (cursor);

  items.sort((a, b) => (b.lastUpload || 0) - (a.lastUpload || 0));

  return { items, summary };
}

export async function verifyApiKey(env, apiKey) {
  if (!env.app_data || !apiKey) return null;
  const keyName = `apikey:${apiKey}`;
  const record = await env.app_data.get(keyName, { type: "json" });
  if (!record) return null;
  return { key: apiKey, ...record };
}

export async function touchApiKeyUsage(env, apiKeyRecord) {
  if (!env.app_data || !apiKeyRecord) return;
  const keyName = `apikey:${apiKeyRecord.key}`;
  const payload = {
    label: apiKeyRecord.label,
    createdAt: apiKeyRecord.createdAt,
    createdBy: apiKeyRecord.createdBy,
    usageCount: (apiKeyRecord.usageCount || 0) + 1,
    lastUsed: Date.now(),
  };
  await env.app_data.put(keyName, JSON.stringify(payload));
}
export function generateApiKey() {
  const random = crypto.getRandomValues(new Uint8Array(24));
  const base = Array.from(random)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `tap_${base}`;
}

export async function createApiKey(env, { label, createdBy }) {
  if (!env.app_data) {
    throw new Error("KV binding app_data not configured");
  }

  for (let attempts = 0; attempts < 5; attempts += 1) {
    const key = generateApiKey();
    const existing = await env.app_data.get(`apikey:${key}`);
    if (existing) continue;

    const record = {
      label: label || "Untitled Key",
      createdAt: Date.now(),
      createdBy: createdBy || "admin",
      usageCount: 0,
    };

    await env.app_data.put(`apikey:${key}`, JSON.stringify(record));
    return { key, ...record };
  }

  throw new Error("Failed to generate unique API key");
}

export async function deleteApiKey(env, apiKey) {
  if (!env.app_data) return;
  await env.app_data.delete(`apikey:${apiKey}`);
}

export async function listApiKeys(env) {
  if (!env.app_data) return [];

  const keys = [];
  let cursor;

  do {
    const result = await env.app_data.list({ prefix: "apikey:", cursor });
    cursor = result.cursor;

    for (const entry of result.keys) {
      const value = await env.app_data.get(entry.name, { type: "json" });
      if (value) {
        keys.push({ key: entry.name.replace("apikey:", ""), ...value });
      }
    }
  } while (cursor);

  keys.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return keys;
}