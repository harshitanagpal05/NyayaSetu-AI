const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const sendMessageToBackend = async (message, token) => {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔐 for your auth
    },
    body: JSON.stringify({ message }),
  });

  return await res.json();
};