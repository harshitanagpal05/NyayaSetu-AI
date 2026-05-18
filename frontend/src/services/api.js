const BASE_URL = "http://127.0.0.1:8000";

// Send a chat message to the backend. Requires the user's auth token and the
// chat's sessionId to ensure per-user and per-chat isolation on the server.
export const sendMessageToBackend = async (message, token, sessionId) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: message,
        session_id: sessionId || "default-session",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API ERROR:", res.status, text);
      throw new Error(`API failed: ${res.status}`);
    }

    const data = await res.json();
    if (!data) throw new Error("Empty response from server");

    return data;
  } catch (error) {
    console.error("🚨 Chat API error:", error);
    return {
      answer: "⚠️ Unable to connect to server. Please try again.",
      confidence: 0,
      sources: [],
    };
  }
};