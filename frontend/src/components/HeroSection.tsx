import React from 'react';
import bgImage from '../assets/bg1.jpg';
import logo from '../assets/logo.png'; // Use .png or .svg as available

interface HeroSectionProps {
  onStartChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartChat }) => {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center text-white transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-pink-700/50 to-orange-600/40 z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-xl space-y-6">
        <div className="mx-auto w-32 h-14">
          <img src={logo} alt="Khaadi Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight drop-shadow">
          Welcome to Khaadi’s Official Chat Store
        </h1>

        <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow">
          Discover & shop premium collections via our AI-powered assistant.
        </p>

        <button
          onClick={onStartChat}
          className="mt-4 px-6 py-3 bg-white text-pink-600 font-semibold rounded-xl shadow-lg hover:bg-pink-100 transition"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};
