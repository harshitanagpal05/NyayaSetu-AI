import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext"; // adjust path if needed

const ChatContext = createContext(null);

const STORAGE_KEY = "legalai_chats";

function loadChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw).map((chat) => ({
          ...chat,
          messages: Array.isArray(chat.messages) ? chat.messages : [],
        }))
      : [];
  } catch {
    return [];
  }
}

function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(loadChats());
  const [activeChatId, setActiveChatId] = useState(null);

  const { getToken } = useAuth(); // 🔐 get JWT token

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const createChat = (firstMessage = null) => {
    const id = uuidv4();
    const newChat = {
      id,
      title: firstMessage
        ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "")
        : "New conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      sessionId: `session_${id.slice(0, 8)}`,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    return id;
  };

  const deleteChat = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const addMessage = (chatId, message) => {
    if (!chatId) {
      console.error("addMessage called without chatId");
      return;
    }
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...(chat.messages || []), message] }
          : chat
      )
    );
  };

  // 🚀 MAIN CHAT FUNCTION (CONNECTED TO BACKEND)
  const sendMessage = async (chatId, userInput) => {
    if (!chatId) {
      console.error("No chat selected");
      return;
    }

    // 1️⃣ Add user message instantly
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: userInput,
      createdAt: new Date().toISOString(),
    };

    addMessage(chatId, userMessage);

    try {
      // 2️⃣ Get auth token
      const token = await getToken();

      // 3️⃣ Call backend API
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();

      // 4️⃣ Add AI response
      const aiMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.response || "No response from AI",
        createdAt: new Date().toISOString(),
      };

      addMessage(chatId, aiMessage);
    } catch (err) {
      console.error("Chat error:", err);

      // ❌ Error fallback message
      addMessage(chatId, {
        id: uuidv4(),
        role: "assistant",
        content: "⚠️ Error connecting to server",
        createdAt: new Date().toISOString(),
      });
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        setActiveChatId,
        createChat,
        deleteChat,
        addMessage,
        clearAllChats,
        sendMessage, // ✅ exposed
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  return useContext(ChatContext);
};