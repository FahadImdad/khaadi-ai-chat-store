import React, { useEffect, useRef, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatInput } from './components/chat/ChatInput';

import { useChat } from './hooks/useChat';
import logo from './assets/logo.png';

import './index.css';

function App() {
  const [showChat, setShowChat] = useState(false);
  const { messages, isTyping, sendMessage, handleAction, askAboutProduct } = useChat();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // --- DEBUG: Cart Reset Button ---
  const handleCartReset = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cart');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      {!showChat ? (
        <HeroSection onStartChat={() => setShowChat(true)} />
      ) : (
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl border border-stone-100/50 overflow-hidden flex flex-col min-h-[85vh]">
          {/* Header with Centered Logo */}
          <div className="bg-white py-6 text-center border-b border-stone-200 relative">
            <img src={logo} alt="Khaadi Logo" className="h-12 mx-auto" />
            {/* Debug Cart Reset Button */}
            <button
              onClick={handleCartReset}
              style={{ position: 'absolute', right: 16, top: 16 }}
              className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-semibold shadow hover:bg-red-200"
            >
              Reset Cart (Debug)
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onAction={handleAction} onAskAbout={askAboutProduct} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSendMessage={sendMessage} disabled={isTyping} />
        </div>
      )}
    </div>
  );
}

export default App;
