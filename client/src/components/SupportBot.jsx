import { useState } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import api from "../api/axios";

const SupportBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Need help with SkillSwap? Ask me anything about Swaps, Scheduling, or Chat!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/support", { query: userMsg });
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-3 rounded-full shadow-2xl transition-transform transform hover:scale-105"
        >
          <Bot size={22} />
          <span className="text-xs font-bold">Support AI</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-[#111B38] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[420px]">
          {/* Header */}
          <div className="bg-[#182342] p-3.5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Bot size={18} />
              <span>SkillSwap Assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-2.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-500 text-black font-medium"
                      : "bg-gray-800 text-gray-200 border border-gray-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-gray-400 animate-pulse">Assistant typing...</p>}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-gray-800 flex items-center gap-2 bg-[#0B132B]">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black p-2 rounded-lg">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportBot;