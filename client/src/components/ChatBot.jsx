import React, { useState, useRef, useEffect } from "react";

const SUGGESTED_QUESTIONS = [
  "Which stock has the highest profit?",
  "What is my total portfolio value?",
  "Which stock is performing worst?",
  "How diversified is my portfolio?",
  "Show analysis of TCS",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-none shadow-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
          AI
        </div>
      )}

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {msg.content}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black text-xs font-bold ml-2 shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}

function ChatBot({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I can analyze your portfolio, holdings, profit/loss, and stock performance from your database.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (textValue) => {
    const text = textValue.trim();
    if (!text || loading) return;

    setError("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      console.error("ChatBot error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all active:scale-95"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ height: "520px" }}
        >
          <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
                📈
              </div>
              <div>
                <p className="text-white font-bold text-sm">Portfolio Assistant</p>
                <p className="text-indigo-200 text-xs">Analyzing your market data</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition text-lg"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
                  AI
                </div>
                <TypingIndicator />
              </div>
            )}

            {error && (
              <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length >0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-end gap-2 shrink-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio..."
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 max-h-24 overflow-y-auto"
            />
           <button
  onClick={() => sendMessage(input)}
  disabled={loading || !input.trim()}
  className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-black rounded-xl flex items-center justify-center transition active:scale-95 shrink-0"
  aria-label="Send message"
>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;