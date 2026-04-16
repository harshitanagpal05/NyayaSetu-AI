const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const sendMessageToBackend = async (message, token) => {
  try {
    if (!token) {
      throw new Error("No auth token found");
    }

    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        session_id: "default-session",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.answer || "Request failed");
    }

    return data;

  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};