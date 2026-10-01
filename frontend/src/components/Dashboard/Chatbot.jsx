import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react';

// ============================================================
// Renders bot message — converts bullet lines to styled list
// ============================================================
const BotMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split("\n").filter(l => l.trim() !== "");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
        const isLast   = i === lines.length - 1;

        if (isBullet) {
          const content = line.trim().replace(/^[•\-]\s*/, "");
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-purple-400 font-black mt-0.5 shrink-0">•</span>
              <span className="text-sm text-gray-200 leading-relaxed">{content}</span>
            </div>
          );
        }

        // Last line = motivational line — render bold + colored
        if (isLast && !isBullet && lines.length > 1) {
          return (
            <p key={i} className="text-xs text-purple-400 font-bold mt-2 pt-2 border-t border-gray-700">
              {line.trim()}
            </p>
          );
        }

        return (
          <p key={i} className="text-sm text-gray-200 leading-relaxed">
            {line.trim()}
          </p>
        );
      })}
    </div>
  );
};

// ============================================================
// CHATBOT
// ============================================================
const Chatbot = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I am your FitAI Assistant. How can I help with your workout today?"
    }
  ]);

  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================================
  // NAV SHORTCUTS — handle before sending to AI
  // ============================================================
  const checkNavCommand = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("diet plan") || m.includes("what should i eat")) {
      addBotMessage("Opening your personalized nutrition plan now! 🥗");
      setTimeout(() => navigate("/diet"), 1200);
      return true;
    }
    if (m.includes("workout today") || m.includes("my workout")) {
      addBotMessage("Taking you to your workout dashboard! 💪");
      setTimeout(() => navigate("/dashboard"), 1200);
      return true;
    }
    if (m === "dashboard" || m.includes("go to dashboard")) {
      addBotMessage("Going back to dashboard!");
      setTimeout(() => navigate("/dashboard"), 1200);
      return true;
    }
    return false;
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: "bot", text }]);
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    // Check nav shortcuts first
    if (checkNavCommand(trimmed)) return;

    // Show typing indicator
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/expert/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      addBotMessage(data.reply || "No response from coach.");

    } catch (err) {
      console.error("Chat error:", err);
      addBotMessage("Sorry, the coach is currently unavailable. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-[#1F2937] flex items-center gap-4 bg-[#121826]">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center">
          <Bot size={18} className="text-[#7C3AED]" />
        </div>
        <div>
          <h1 className="text-base font-black">FitAI Coach Chat</h1>
          <p className="text-[10px] text-green-400 font-bold">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-5 overflow-y-auto space-y-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Bot avatar */}
            {m.role === "bot" && (
              <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#7C3AED]/40 flex items-center justify-center shrink-0 mb-1">
                <Bot size={14} className="text-[#7C3AED]" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-5 py-4 rounded-2xl
                ${m.role === "user"
                  ? "bg-[#7C3AED] rounded-br-sm"
                  : "bg-[#121826] border border-[#1F2937] rounded-bl-sm"
                }`}
            >
              {m.role === "bot"
                ? <BotMessage text={m.text} />
                : <p className="text-sm text-white">{m.text}</p>
              }
            </div>

            {/* User avatar */}
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[#7C3AED]/30 flex items-center justify-center shrink-0 mb-1">
                <User size={14} className="text-purple-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#7C3AED]/40 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-[#7C3AED]" />
            </div>
            <div className="bg-[#121826] border border-[#1F2937] px-5 py-4 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#121826] border-t border-[#1F2937] flex gap-3">
        <input
          ref={inputRef}
          className="flex-grow bg-[#0B0F14] border border-[#1F2937] rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#7C3AED] transition-colors placeholder-gray-600"
          placeholder="Ask about exercises, diet, or reps..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`p-3 rounded-2xl transition-all
            ${loading || !input.trim()
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-[#7C3AED] text-white hover:bg-purple-500"
            }`}
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <Send size={20} />
          }
        </button>
      </div>

    </div>
  );
};

export default Chatbot;