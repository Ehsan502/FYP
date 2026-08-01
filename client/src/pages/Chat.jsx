import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Paperclip, Check, CheckCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { SkeletonRow } from "../components/Skeleton.jsx";

const Chat = () => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [typingUser, setTypingUser] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data);
      const targetUserId = searchParams.get("user");
      if (targetUserId) {
        const convRes = await api.post("/chat/conversations", { userId: targetUserId });
        setActiveConv(convRes.data);
        if (!res.data.find((c) => c._id === convRes.data._id)) {
          setConversations((prev) => [convRes.data, ...prev]);
        }
      } else if (res.data.length > 0 && !activeConv && window.innerWidth >= 768) {
        setActiveConv(res.data[0]);
      }
    } catch (err) {
      toast.error("Could not load conversations");
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const otherUser = (conv) => conv?.participants?.find((p) => p._id !== user._id);

  const loadMessages = async (convId) => {
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/chat/messages/${convId}`);
      setMessages(res.data);
    } catch (err) {
      toast.error("Could not load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv._id);
      socket?.emit("chat:join", activeConv._id);
    }
  }, [activeConv?._id, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      if (activeConv && msg.conversation === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.conversation);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: msg.text || "📎 Attachment", lastMessageAt: msg.createdAt };
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const onTyping = ({ conversationId, userId, isTyping }) => {
      if (activeConv && conversationId === activeConv._id && userId !== user._id) {
        setTypingUser(isTyping);
      }
    };

    const onSeen = ({ conversationId }) => {
      if (activeConv && conversationId === activeConv._id) {
        setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
      }
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);
    socket.on("chat:seen", onSeen);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
      socket.off("chat:seen", onSeen);
    };
  }, [socket, activeConv, user._id]);

  const handleTyping = (val) => {
    setText(val);
    if (!socket || !activeConv) return;
    socket.emit("chat:typing", { conversationId: activeConv._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:typing", { conversationId: activeConv._id, isTyping: false });
    }, 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post("/chat/messages", { conversationId: activeConv._id, text: text.trim() });
      setText("");
    } catch (err) {
      toast.error("Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    const formData = new FormData();
    formData.append("conversationId", activeConv._id);
    formData.append("file", file);
    setSending(true);
    try {
      await api.post("/chat/messages", formData, { headers: { "Content-Type": "multipart/form-data" } });
    } catch (err) {
      toast.error("File could not be sent");
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-2 sm:px-6 py-3 sm:py-6">
      <h1 className="mb-3 sm:mb-6 font-display text-xl sm:text-3xl font-bold hidden sm:block">Messages</h1>

      {/* Main Grid Wrapper Optimized for Mobile Height */}
      <div className="grid gap-3 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        
        {/* Conversation List (Mobile Fullscreen View when no Active Chat) */}
        <div className={`card flex flex-col gap-1.5 p-2 sm:p-3 h-[calc(100dvh-6.5rem)] sm:h-[75vh] overflow-y-auto ${activeConv ? "hidden md:flex" : "flex"}`}>
          {loadingConvs ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs sm:text-sm text-muted-light dark:text-muted-dark">
              No conversations yet. Start one from Explore.
            </p>
          ) : (
            conversations.map((conv) => {
              const partner = otherUser(conv);
              const active = activeConv?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-center gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-colors ${
                    active ? "bg-primary/10" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary text-sm sm:text-base">
                      {partner?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {isOnline(partner?._id) && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark bg-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs sm:text-sm font-semibold">{partner?.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-base-dark">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] sm:text-xs text-muted-light dark:text-muted-dark">{conv.lastMessage || "Say hello 👋"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Active Chat Area (Mobile Viewport Optimized) */}
        <div className={`card flex flex-col h-[calc(100dvh-6.5rem)] sm:h-[75vh] ${!activeConv ? "hidden md:flex" : "flex"}`}>
          {!activeConv ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a chat from the list to start messaging." />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 p-2.5 sm:p-4">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary flex-shrink-0">
                  {otherUser(activeConv)?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">{otherUser(activeConv)?.name}</p>
                  <p className="text-[10px] sm:text-xs text-emerald-400">
                    {isOnline(otherUser(activeConv)?._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
                {loadingMsgs ? (
                  <p className="text-center text-xs sm:text-sm text-muted-light dark:text-muted-dark">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs sm:text-sm text-muted-light dark:text-muted-dark">Say hello and start conversation!</p>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${mine ? "bg-primary text-base-dark" : "bg-black/5 dark:bg-white/5"}`}>
                          {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                          {msg.fileUrl && (
                            msg.fileType?.startsWith("image") ? (
                              <img src={msg.fileUrl} alt={msg.fileName} className="mt-1.5 max-w-[180px] sm:max-w-[220px] rounded-lg" />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 underline text-xs">
                                <Paperclip size={12} /> {msg.fileName}
                              </a>
                            )
                          )}
                          <div className={`mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] ${mine ? "text-base-dark/70" : "text-muted-light dark:text-muted-dark"}`}>
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            {mine && (msg.seen ? <CheckCheck size={12} /> : <Check size={12} />)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                {typingUser && <p className="text-xs italic text-muted-light dark:text-muted-dark">Typing...</p>}
                <div ref={bottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-black/5 dark:border-white/5 p-2 sm:p-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-muted-light dark:text-muted-dark hover:text-primary">
                  <Paperclip size={18} />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                <input
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1 text-xs sm:text-sm !py-2"
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary !p-2 sm:!px-4">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;