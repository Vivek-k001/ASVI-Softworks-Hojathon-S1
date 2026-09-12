import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AssistantContext = createContext();

export const AssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm PMNA Assistant 👋\nI can help you find local offers, shops, food spots and more around Perinthalmanna and Angadipuram.",
      results: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const suggestedPrompts = [
    "🔥 Show me today's deals",
    "🍔 Find food under ₹200",
    "👟 Any shoe offers?",
    "📍 What's available in Angadipuram?",
    "🛍️ Show offers ending today",
    "🍰 Any bakery deals in Perinthalmanna?",
  ];

  const sendMessage = async (userText) => {
    if (!userText || userText.trim() === '') return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      results: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.post('/assistant/chat', { message: userText.trim() });
      if (res.data?.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: res.data.data.message,
          results: res.data.data.results || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat Assistant error', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        results: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation cleared. How can I help you find what you need in PMNA?",
        results: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen: () => setIsOpen((prev) => !prev),
        openAssistant: () => setIsOpen(true),
        closeAssistant: () => setIsOpen(false),
        messages,
        isTyping,
        sendMessage,
        clearChat,
        suggestedPrompts,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => useContext(AssistantContext);
