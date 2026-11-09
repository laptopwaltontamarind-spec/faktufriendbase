import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Lock, Crown, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const PremiumModal: React.FC = () => {
  const { premiumModalOpen, closePremiumGate, premiumModalContent, setCurrentPage } = useApp();

  if (!premiumModalOpen) return null;

  const handleBuyPremium = () => {
    closePremiumGate();
    setCurrentPage('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0f1422] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closePremiumGate}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 mb-5">
          <Crown className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
          {premiumModalContent.title}
        </h3>

        {/* Exact prompt message */}
        <p className="text-slate-300 text-base leading-relaxed mb-6">
          {premiumModalContent.message}
        </p>

        {/* Feature Highlights */}
        <div className="bg-[#141b2d] border border-slate-800/80 rounded-xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Instant access to all verified secret methods & blueprints</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>High-speed direct file downloads with 0 wait times</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>100% Ad-Free uninterrupted learning experience</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleBuyPremium}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Buy Premium</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={closePremiumGate}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
