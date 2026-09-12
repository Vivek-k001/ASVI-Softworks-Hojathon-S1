import React, { useState, useRef, useEffect } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { ResultCard } from '../components/assistant/ResultCard';
import {
  Send,
  Trash2,
  Bot,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AssistantPage = () => {
  const { messages, isTyping, sendMessage, clearChat, suggestedPrompts } = useAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Header */}
      <div className="card !p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#10B981] to-[#0EA5E9] flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0F172A]">PMNA Assistant</h1>
              <span className="badge-confirmed text-[10px]">
                Grounded AI
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Discover verified deals and spots around Perinthalmanna & Angadipuram
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="btn-secondary text-xs !py-1.5 !px-3"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 card !p-4 sm:!p-6 overflow-y-auto space-y-4 bg-[#F8FAFC]">
        
        {/* Intro banner */}
        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20 text-xs text-[#047857] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#047857]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Strictly Grounded in PMNA Database Records</span>
          </div>
          <p className="text-[#047857] leading-relaxed">
            The assistant answers questions by querying active merchant promotions in Perinthalmanna and Angadipuram. It never invents prices, shops, or discounts.
          </p>
        </div>

        {/* Message bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#10B981] text-white rounded-br-none'
                  : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>

            {/* Structured Card results */}
            {msg.results && msg.results.length > 0 && (
              <div className="w-full sm:max-w-[85%] mt-2 space-y-2">
                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-1">
                  Matching Platform Results:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.results.map((item, idx) => (
                    <ResultCard key={item.id || idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            <span className="text-[10px] text-[#94A3B8] mt-1 px-2">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 w-24 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-[#64748B] shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
          Try:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(p)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] hover:border-[#10B981] hover:text-[#047857] text-[#334155] text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="relative mt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PMNA Assistant: 'Biriyani under 200', 'Shoe offers in Angadipuram'..."
          className="form-input text-xs sm:text-sm !h-[48px] pl-4 pr-12"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="absolute right-2 top-2 p-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-40 transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
