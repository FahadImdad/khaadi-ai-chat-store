import React from 'react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './chat/ChatMessage';
import { TypingIndicator } from './chat/TypingIndicator';
import { ChatInput } from './chat/ChatInput';

export const ChatSection: React.FC = () => {
  const {
    messages,
    isTyping,
    sendMessage,
    handleAction
  } = useChat();

  return (
    <section
      id="chat"
      className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-orange-50 to-pink-50"
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-center py-6 px-4 font-bold text-2xl tracking-wide shadow-md z-10">
        🛍️ Khaadi AI Shopping Assistant
      </header>

      {/* Chat Window */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 max-w-3xl mx-auto w-full space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onAction={handleAction}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </main>

      {/* Chat Input */}
      <footer className="border-t border-stone-200 bg-stone-50 px-4 py-4 shadow-inner">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={sendMessage} disabled={isTyping} />
        </div>
      </footer>
    </section>
  );
};
