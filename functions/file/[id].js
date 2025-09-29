import { corsHeaders } from "../utils/middleware.js";
import { decodeFileId } from "../utils/telegram.js";

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const encodedId = params.id;
  const fileId = decodeFileId(encodedId);

  if (!fileId) {
    return new Response("Invalid file reference", {
      status: 400,
      headers: corsHeaders(),
    });
  }

  const url = new URL(request.url);
  const isInfoRequest = url.searchParams.get("info") === "true";
  const isPreviewRequest = url.searchParams.get("a") === "view";

  try {
    // Fetch file info from Telegram
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/getFile?file_id=${fileId}`,
    );

    if (!infoResponse.ok) {
      return notFound();
    }

    const info = await infoResponse.json();
    if (!info.ok || !info.result?.file_path) {
      return notFound();
    }

    const fileUrl = `${url.origin}/file/${encodedId}`; // The public URL for the file
    const telegramFilePath = info.result.file_path;
    const originalName = telegramFilePath.split("/").pop() || encodedId; // Derive original name from path or use encodedId
    const fileType = info.result.mime_type || guessMime(originalName);
    const fileSize = info.result.file_size || 0; // Telegram provides file_size

    // If it's an info request, return JSON metadata
    if (isInfoRequest) {
      return new Response(JSON.stringify({
        success: true,
        fileId,
        encodedFileId: encodedId,
        url: fileUrl,
        originalName,
        fileType,
        size: fileSize,
        uploadedAt: Date.now(), // Placeholder, as Telegram getFile doesn't provide upload time
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    }

    // If it's a preview request, serve the React app's index.html
    if (isPreviewRequest) {
      // Assuming index.html is served by the ASSETS binding
      const assetResponse = await env.ASSETS.fetch(new Request(url.origin));
      return new Response(assetResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders(),
        },
      });
    }

    // Otherwise, serve the raw file directly, with inline disposition
    const directFileResponse = await fetch(`https://api.telegram.org/file/bot${env.TG_BOT_TOKEN}/${telegramFilePath}`);

    if (!directFileResponse.ok) {
      return notFound();
    }

    const fileName = sanitizeFilename(originalName); // Use the derived original name for download

    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=31536000");
    // Set Content-Disposition to inline to display in browser, not force download
    headers.set("Content-Disposition", `inline; filename="${fileName}"`); 
    headers.set("Content-Type", fileType || directFileResponse.headers.get("Content-Type") || guessMime(fileName));

    // Preserve CORS for clients embedding the asset.
    for (const [key, value] of Object.entries(corsHeaders())) {
      headers.set(key, value);
    }

    return new Response(directFileResponse.body, { headers });
  } catch (error) {
    console.error("File retrieval error", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

function sanitizeFilename(name) {
  return name.replace(/[\r\n]/g, "").replace(/"/g, "");
}

function guessMime(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const lookup = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };
  return lookup[ext] || "application/octet-stream";
}

function notFound() {
  return new Response("File not found", {
    status: 404,
    headers: corsHeaders(),
  });
}