"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Criar pauta sobre IA",
  "Melhorar o SEO do título",
  "Gerar resumo do artigo",
  "Criar legenda Instagram",
];

interface AIPanelProps {
  articleContent?: string;
  articleTitle?: string;
}

export default function AIPanel({ articleContent, articleTitle }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente MONATIZA AI. Posso ajudar a criar pautas, melhorar SEO, gerar títulos e legendas. Como posso ajudar?",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Placeholder — substituir por chamada real à API
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Entendido! Em breve a integração com IA estará ativa. Sua mensagem foi: "${userMsg.content}"`,
        },
      ]);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-black">MONATIZA AI</h3>
          <p className="text-[10px] text-gray-400">Assistente editorial</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${msg.role === "assistant" ? "bg-black" : "bg-gray-200"}
            `}>
              {msg.role === "assistant"
                ? <Bot size={12} className="text-white" />
                : <User size={12} className="text-gray-600" />
              }
            </div>

            {/* Bubble */}
            <div className={`
              max-w-[80%] px-3.5 py-2.5 rounded-2xl
              text-[12.5px] leading-relaxed
              ${msg.role === "assistant"
                ? "bg-gray-50 text-gray-700 rounded-tl-sm"
                : "bg-black text-white rounded-tr-sm"
              }
            `}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-gray-50 px-3.5 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                {[0, 0.15, 0.3].map(delay => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="
              px-2.5 py-1.5
              bg-gray-50 hover:bg-gray-100
              border border-gray-100
              rounded-xl text-[11px]
              text-gray-500 hover:text-black
              transition font-medium
            "
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Pergunte algo ao AI..."
            className="
              flex-1 bg-transparent
              text-[13px] text-black
              outline-none placeholder:text-gray-300
              px-2
            "
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="
              w-8 h-8 rounded-xl
              bg-black text-white
              flex items-center justify-center
              disabled:opacity-30 transition
              hover:opacity-80
            "
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}