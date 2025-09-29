const MAX_RETRIES = 2;

export function encodeFileId(fileId) {
  const base64 = btoa(fileId);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeFileId(encoded) {
  try {
    const paddedLength = encoded.length % 4;
    const padded = encoded + (paddedLength ? "=".repeat(4 - paddedLength) : "");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    return atob(base64);
  } catch (error) {
    console.error("Failed to decode file id", encoded, error);
    return null;
  }
}

export function extractFileId(response) {
  if (!response?.ok || !response?.result) return null;
  const result = response.result;

  if (result.document) {
    return result.document.file_id;
  }

  if (result.video) {
    return result.video.file_id;
  }

  if (result.audio) {
    return result.audio.file_id;
  }

  if (Array.isArray(result.photo)) {
    const largestPhoto = result.photo.reduce((prev, current) =>
      prev.file_size > current.file_size ? prev : current
    );
    return largestPhoto.file_id;
  }

  return null;
}

export async function sendToTelegram(env, formData, apiEndpoint, retryCount = 0) {
  const apiUrl = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/${apiEndpoint}`;

  try {
    const response = await fetch(apiUrl, { method: "POST", body: formData });
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    }

    if (retryCount < MAX_RETRIES && apiEndpoint === "sendPhoto") {
      console.log("Retrying image as document...");
      const fallbackForm = new FormData();
      fallbackForm.append("chat_id", formData.get("chat_id"));
      fallbackForm.append("document", formData.get("photo"));
      return await sendToTelegram(env, fallbackForm, "sendDocument", retryCount + 1);
    }

    return {
      success: false,
      error: data?.description || "Upload to Telegram failed",
    };
  } catch (error) {
    console.error("Telegram network error", error);
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return await sendToTelegram(env, formData, apiEndpoint, retryCount + 1);
    }

    return { success: false, error: "Network error occurred" };
  }
}
