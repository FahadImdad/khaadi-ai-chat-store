import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-8">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Bot size={20} className="text-white" />
        </div>
        
        {/* Typing Bubble */}
        <div className="bg-white rounded-2xl rounded-bl-md px-6 py-4 shadow-lg border border-stone-100/50 backdrop-blur-sm max-w-xs">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-stone-600 font-semibold">Khaadi is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
};