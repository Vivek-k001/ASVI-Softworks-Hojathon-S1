import React, { useState, useRef, useEffect } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import { ResultCard } from './ResultCard';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Maximize2,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FloatingAssistant = () => {
  const { isOpen, toggleOpen, closeAssistant, messages, isTyping, sendMessage, clearChat, suggestedPrompts } =
    useAssistant();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button with approved gradient #10B981 -> #0EA5E9 */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#10B981] to-[#0EA5E9] text-white font-semibold text-sm shadow-elevated hover:opacity-95 active:scale-95 transition-all duration-200"
          aria-label="Open PMNA Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>PMNA Assistant</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-elevated border border-[#E2E8F0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#10B981] to-[#0EA5E9] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">PMNA Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                </div>
                <p className="text-[11px] text-white/90">Grounded local discovery</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/assistant"
                onClick={closeAssistant}
                title="Open full page assistant"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={clearChat}
                title="Clear chat history"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeAssistant}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#10B981] text-white rounded-br-none'
                      : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Render Structured Database Results */}
                {msg.results && msg.results.length > 0 && (
                  <div className="w-full mt-1.5 space-y-1.5">
                    {msg.results.map((item, idx) => (
                      <ResultCard key={item.id || idx} item={item} />
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-[#94A3B8] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-xl rounded-bl-none px-3.5 py-2.5 w-20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 bg-white border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedPrompts.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="whitespace-nowrap text-[11px] font-semibold bg-[#F1F5F9] hover:bg-[#ECFDF5] hover:text-[#047857] text-[#334155] px-2.5 py-1 rounded-full border border-[#E2E8F0] transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about deals, food spots, shops..."
              className="flex-1 text-xs rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] bg-white transition-all text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
