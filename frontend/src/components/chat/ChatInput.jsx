import { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { sendMessageToBackend } from "../../services/api";

const ChatInput = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContext = useChat() || {};
  const { activeChatId, addMessage, createChat } = chatContext;

  const session_id =
    localStorage.getItem("session_id") || crypto.randomUUID();
  localStorage.setItem("session_id", session_id);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (typeof addMessage !== "function") {
      console.error("addMessage is not a function:", addMessage);
      return;
    }
    if (typeof createChat !== "function") {
      console.error("createChat is not a function:", createChat);
      return;
    }

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat(input);
    }

    const userMessage = { role: "user", content: input };
    addMessage(chatId, userMessage);

    setInput("");
    setLoading(true);

    try {
      const res = await sendMessageToBackend(input);

      const aiMessage = {
        role: "assistant",
        content: res?.answer || "No response",
        confidence: res?.confidence,
        sources: res?.sources,
      };

      addMessage(chatId, aiMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      addMessage(chatId, { role: "assistant", content: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 w-full flex items-center gap-2 p-3 border-t border-white/[0.06] bg-navy-900 pb-[env(safe-area-inset-bottom)]">
      <input
        type="text"
        placeholder="Ask your legal question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={loading}
        className="flex-1 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-gold-500 text-black font-semibold hover:bg-gold-400 transition-all disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;