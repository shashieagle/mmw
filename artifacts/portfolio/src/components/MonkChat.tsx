import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ChevronRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ_QUESTIONS = [
  "What does MMW do?",
  "What is the Creative Studio?",
  "What are Business Architects?",
  "What is the Creative Ecosystem Certification™?",
  "What is the Catalyst Program?",
  "How do we start working together?",
  "Who is MMW for?",
  "What makes MMW different?",
];

export function MonkChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFAQ, setShowFAQ] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);
    setShowFAQ(false);
    setSuggestions([]);
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
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              full += parsed.content;
              setStreamingContent(full);
            }
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              setSuggestions(parsed.suggestions);
            }
            if (parsed.done) {
              setMessages((prev) => [...prev, { role: "assistant", content: full }]);
              setStreamingContent("");
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again in a moment." },
      ]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  }, [loading, startConversation]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setShowFAQ(true);
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
            className="fixed bottom-6 right-6 z-[9990] group"
            style={{ width: 60, height: 60 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-white/30"
              animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border border-white/20"
              animate={{ scale: [1, 1.28, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-black border border-white/25 flex items-center justify-center overflow-hidden"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 18px rgba(255,255,255,0.12)" }}
            >
              <img
                src="/logo-icon-transparent.png"
                alt="Monk"
                className="w-8 h-8 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </motion.span>
            <span className="absolute -top-9 right-0 text-[10px] uppercase tracking-[0.2em] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none">
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
            className="fixed bottom-6 right-6 z-[9990] w-[380px] max-w-[calc(100vw-2rem)] flex flex-col"
            style={{
              height: "560px",
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden">
                  <img src="/logo-icon-transparent.png" alt="Monk" className="w-5 h-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold tracking-tight">Monk</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">MMW Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

              {/* Greeting + FAQ */}
              {showFAQ && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-white/5 border border-white/8 px-4 py-3 text-sm text-gray-300 leading-relaxed">
                    Hey — I'm Monk. What would you like to know about Monk Monkey Works?
                  </div>
                  <div className="flex flex-col gap-2">
                    {FAQ_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => sendMessage(q)}
                        className="flex items-center justify-between text-left px-4 py-3 border border-white/10 text-gray-400 text-sm hover:border-white/30 hover:text-white transition-all duration-200 group"
                      >
                        <span>{q}</span>
                        <ChevronRight size={13} className="shrink-0 text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Conversation */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] text-sm leading-relaxed px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-white text-black font-medium"
                        : "bg-white/5 text-gray-200 border border-white/8"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] text-sm leading-relaxed px-4 py-3 bg-white/5 text-gray-200 border border-white/8">
                    {streamingContent}
                    <span className="inline-block w-1 h-3 bg-white/40 ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Typing dots */}
              {loading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white/5 border border-white/8 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* AI-generated follow-up suggestions */}
              {!loading && !streamingContent && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 mt-1"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600 font-bold">You might also ask</p>
                  {suggestions.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => sendMessage(q)}
                      className="flex items-center justify-between text-left px-4 py-2.5 border border-white/8 text-gray-500 text-xs hover:border-white/25 hover:text-white transition-all duration-200 group"
                    >
                      <span>{q}</span>
                      <ChevronRight size={11} className="shrink-0 text-gray-700 group-hover:text-gray-400 transition-colors" />
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/8 flex gap-3 items-center shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Or type your own question…"
                disabled={loading}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-700 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
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
