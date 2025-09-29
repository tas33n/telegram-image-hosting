import { corsHeaders } from "../utils/middleware.js";
import { listUsageStats } from "../utils/app-data.js";
import { requireAuth } from "../utils/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const unauthorized = requireAuth(request, env);
  if (unauthorized) {
    return addCors(unauthorized);
  }

  const data = await listUsageStats(env);
  return new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const unauthorized = requireAuth(request, env);
  if (unauthorized) {
    return addCors(unauthorized);
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return jsonError("Missing stats id", 400);
    }

    if (!env.app_data) {
      return jsonError("KV binding missing", 500);
    }

    await env.app_data.delete(`stats:${id}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Stats delete error", error);
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
