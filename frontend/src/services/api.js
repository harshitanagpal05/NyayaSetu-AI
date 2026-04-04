const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendMessageToBackend = async (message) => {
const res = await fetch(`${BASE_URL}/chat`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ message }),
});

return await res.json();
};
