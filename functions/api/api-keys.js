import { corsHeaders } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import { listApiKeys, createApiKey, deleteApiKey } from "../utils/app-data.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const unauthorized = requireAuth(request, env);
  if (unauthorized) {
    return addCors(unauthorized);
  }

  const keys = await listApiKeys(env);
  return new Response(JSON.stringify({ success: true, keys }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const unauthorized = requireAuth(request, env);
  if (unauthorized) {
    return addCors(unauthorized);
  }

  try {
    const { label } = await request.json();
    const key = await createApiKey(env, { label, createdBy: "admin" });

    return new Response(JSON.stringify({ success: true, key }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Create api key error", error);
    return jsonError(error.message || "Failed to create API key", 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const unauthorized = requireAuth(request, env);
  if (unauthorized) {
    return addCors(unauthorized);
  }

  try {
    const { key } = await request.json();
    if (!key) {
      return jsonError("Missing API key", 400);
    }

    await deleteApiKey(env, key);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Delete api key error", error);
    return jsonError("Invalid request payload", 400);
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

function addCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
