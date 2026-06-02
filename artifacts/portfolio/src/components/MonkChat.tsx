import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MonkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.5" />
    <circle cx="11" cy="11" r="4" fill="white" />
    <circle cx="11" cy="4" r="1.2" fill="white" />
    <circle cx="11" cy="18" r="1.2" fill="white" />
    <circle cx="4" cy="11" r="1.2" fill="white" />
    <circle cx="18" cy="11" r="1.2" fill="white" />
  </svg>
);

export function MonkChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const startConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const res = await fetch("/api/openai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Chat with Monk" }),
    });
    const data = await res.json();
    setConversationId(data.id);
    return data.id as number;
  }, [conversationId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreamingContent("");

    try {
      const convId = await startConversation();

      const res = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              full += parsed.content;
              setStreamingContent(full);
            }
            if (parsed.done) {
              setMessages((prev) => [...prev, { role: "assistant", content: full }]);
              setStreamingContent("");
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again in a moment." },
      ]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  }, [input, loading, startConversation]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hey — I'm Monk. I'm here to tell you about Monk Monkey Works and what we do. What would you like to know?",
      }]);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[9990] w-14 h-14 bg-black border border-white/20 rounded-full flex items-center justify-center hover:border-white/50 transition-colors duration-300 group"
            style={{ boxShadow: "0 0 20px rgba(255,255,255,0.05)" }}
          >
            <MonkIcon />
            <span className="absolute -top-9 right-0 text-[10px] uppercase tracking-[0.2em] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
              Ask Monk
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed bottom-6 right-6 z-[9990] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col"
            style={{
              height: "520px",
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                  <MonkIcon />
                </div>
                <div>
                  <p className="text-white text-sm font-bold tracking-tight">Monk</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">MMW Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] text-sm leading-relaxed px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-white text-black font-medium"
                        : "bg-white/5 text-gray-200 border border-white/8"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Streaming response */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] text-sm leading-relaxed px-4 py-3 bg-white/5 text-gray-200 border border-white/8">
                    {streamingContent}
                    <span className="inline-block w-1 h-3 bg-white/40 ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {loading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white/5 border border-white/8 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-white/8 flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about MMW…"
                disabled={loading}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-600 outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
