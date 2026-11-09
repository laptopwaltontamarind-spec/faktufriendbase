import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { 
  ArrowLeft, 
  Crown, 
  Sparkles, 
  ThumbsUp, 
  Share2, 
  Eye, 
  Calendar, 
  Folder,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const MethodDetailPage: React.FC = () => {
  const { selectedItemId, methods, setCurrentPage, openMethodDetail, triggerPremiumGate, showToast } = useApp();
  const { isPremium } = useAuth();
  const [liked, setLiked] = useState(false);

  const method = methods.find(m => m.id === selectedItemId) || methods[0];

  if (!method) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Method not found.</p>
        <button
          onClick={() => setCurrentPage('methods')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs"
        >
          Back to Methods
        </button>
      </div>
    );
  }

  const isLocked = method.type === 'premium' && !isPremium;
  const relatedMethods = methods.filter(m => m.id !== method.id && m.category === method.category).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  return (
    <div className="w-full min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb Back */}
      <button
        onClick={() => setCurrentPage('methods')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Methods</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Video Player with Watermark */}
          <VideoPlayer
            title={method.title}
            videoUrl={method.videoUrl}
            thumbnailUrl={method.thumbnailUrl}
            contentType="method"
            tierType={method.type}
            downloadAllowed={method.downloadAllowed}
            downloadUrl={method.downloadUrl}
            fileName={method.fileName}
            fileSize={method.fileSize}
            itemId={method.id}
          />

          {/* Details & Actions Header */}
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  method.type === 'premium'
                    ? 'bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center gap-1.5'
                    : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                }`}>
                  {method.type === 'premium' && <Crown className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{method.type === 'premium' ? 'PREMIUM METHOD' : 'SIMPLE METHOD'}</span>
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-slate-500" />
                  {method.category}
                </span>

                <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {method.uploadDate}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    liked 
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-purple-400 text-purple-400' : ''}`} />
                  <span>{method.likes + (liked ? 1 : 0)}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-4 mb-4">
              {method.title}
            </h1>

            {/* Full Unlimited-Length Description */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <p>{method.description}</p>
              
              <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Implementation Guidelines</span>
                </div>
                <p className="text-slate-400">
                  Follow each step shown in the video precisely. For custom API tokens or configuration files, please refer to the attached download resource.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Banner for Simple Users */}
          <AdBanner placement="download_page" />
        </div>

        {/* Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Premium Membership Pitch (if not premium) */}
          {!isPremium && (
            <div className="bg-gradient-to-br from-[#13102b] to-[#0c1222] border border-purple-500/30 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 mx-auto mb-3">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upgrade to Premium</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Unlock all high-value VIP methods, courses, direct downloads and enjoy 100% ad-free experience.
              </p>
              <button
                onClick={() => {
                  setCurrentPage('packages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                View Premium Packages
              </button>
            </div>
          )}

          {/* Related Methods */}
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Related Methods</h3>
            <div className="space-y-4">
              {relatedMethods.map(rm => (
                <div
                  key={rm.id}
                  onClick={() => {
                    if (rm.type === 'premium' && !isPremium) {
                      triggerPremiumGate('method');
                    } else {
                      openMethodDetail(rm.id);
                    }
                  }}
                  className="flex gap-3 group cursor-pointer"
                >
                  <div className="relative w-24 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                    <img
                      src={rm.thumbnailUrl}
                      alt={rm.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {rm.type === 'premium' && (
                      <div className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-purple-400">
                        <Crown className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {rm.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">{rm.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
