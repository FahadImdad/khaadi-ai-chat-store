import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed !== '') {
      onSendMessage(trimmed);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-stone-50 px-6 py-4">
      <input
        type="text"
        placeholder="Ask something like: show unstitched lawn, view my cart, etc..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
      />
    </form>
  );
};
