const BASE_URL = "http://127.0.0.1:8000";

export const sendMessageToBackend = async (message) => {
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        session_id: "default-session",
      }),
    });

    // ✅ Handle non-200 responses properly
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API ERROR:", errorText);
      throw new Error(`API failed: ${res.status}`);
    }

    const data = await res.json();

    // ✅ Safety check
    if (!data) {
      throw new Error("Empty response from server");
    }

    return data;

  } catch (error) {
    console.error("🚨 Chat API error:", error);

    // ✅ Return safe fallback (prevents UI crash)
    return {
      answer: "⚠️ Unable to connect to server. Please try again.",
      confidence: 0,
      sources: []
    };
  }
};