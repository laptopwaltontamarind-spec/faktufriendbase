import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { ExternalLink, Sparkles } from 'lucide-react';
import type { Advertisement } from '../types/index.ts';

interface AdBannerProps {
  placement: 'home_top' | 'home_sidebar' | 'video_banner' | 'download_page' | 'course_bottom';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const { isPremium } = useAuth();
  const { ads, setCurrentPage } = useApp();

  // PREMIUM USERS NEVER SEE ADVERTISEMENTS
  if (isPremium) {
    return null;
  }

  // Find active ad for this placement
  const placementAds = ads.filter(a => a.placement === placement && a.isEnabled);
  const ad: Advertisement | undefined = placementAds[0] || ads.find(a => a.isEnabled);

  if (!ad) {
    // Show a clean self-promotional banner to upgrade if no external ad is configured
    return (
      <div className={`w-full bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 rounded-xl p-4 my-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-0.5">
              Tired of Advertisements?
            </div>
            <p className="text-sm text-slate-300">
              Upgrade to <span className="text-white font-semibold">Method Tricks Premium</span> to remove all ads and unlock VIP methods!
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setCurrentPage('packages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-md shadow-purple-600/20"
        >
          Remove Ads ৳250
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full bg-[#0d121e] border border-slate-800 rounded-xl overflow-hidden my-4 ${className}`}>
      <div className="px-3 py-1 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Sponsored Advertisement</span>
        <span className="text-slate-500">Ad</span>
      </div>
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group relative overflow-hidden"
      >
        <div className="relative aspect-[21/9] sm:aspect-[24/7] max-h-36 w-full bg-slate-950">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-85 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors drop-shadow-md">
                  {ad.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-1">Click to learn more · Partner link</p>
              </div>
              <span className="p-2 bg-purple-600/80 group-hover:bg-purple-600 text-white rounded-lg transition-colors shadow">
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
