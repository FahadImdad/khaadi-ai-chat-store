import React from 'react';
import logo from '../assets/logo.png';

export const Preloader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="flex flex-col items-center space-y-6">
        <img
          src={logo}
          alt="Khaadi Logo"
          className="w-28 h-auto animate-pulse"
        />
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-stone-600 text-sm font-semibold">Loading your Khaadi experience...</p>
      </div>
    </div>
  );
};
