import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const ChatContext = createContext(null);

const STORAGE_KEY = "legalai_chats";

function loadChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw).map((chat) => ({
          ...chat,
          messages: Array.isArray(chat.messages) ? chat.messages : [], // ✅ always array
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);