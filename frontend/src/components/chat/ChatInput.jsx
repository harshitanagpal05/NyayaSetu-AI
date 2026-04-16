import { useState } from "react";

const ChatInput = ({ sendMessage }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (typeof sendMessage !== "function") {
      console.error("sendMessage prop is missing");
      return;
    }

    const message = input;

    setInput("");
    setLoading(true);

    try {
      await sendMessage(message); // ✅ uses ChatWindow token flow
    } catch (err) {
      console.error("Error sending message:", err);
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