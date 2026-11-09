import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { 
  Crown, 
  Play, 
  Lock, 
  Search, 
  Filter, 
  Sparkles, 
  Eye, 
  ArrowRight,
  Download
} from 'lucide-react';
import type { MethodItem } from '../types/index.ts';

interface MethodsPageProps {
  initialFilter?: 'all' | 'simple' | 'premium';
}

export const MethodsPage: React.FC<MethodsPageProps> = ({ initialFilter = 'all' }) => {
  const { methods, openMethodDetail, triggerPremiumGate } = useApp();
  const { isPremium } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'simple' | 'premium'>(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(methods.map(m => m.category)))];

  const filteredMethods = methods.filter(m => {
    // Type filter
    if (activeTab === 'simple' && m.type !== 'simple') return false;
    if (activeTab === 'premium' && m.type !== 'premium') return false;

    // Category filter
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMethodClick = (m: MethodItem) => {
    if (m.type === 'premium' && !isPremium) {
      triggerPremiumGate('method');
    } else {
      openMethodDetail(m.id);
    }
  };

  return (
    <div className="w-full min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>METHOD & TRICKS ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tested Methods, Secrets & Tricks
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Discover proven digital strategies, productivity bypasses, automated systems, and optimization guides.
        </p>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#0f1422] border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Methods ({methods.length})
          </button>
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'simple'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simple Methods (Free)
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'premium'
                ? 'bg-purple-600 text-white shadow'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Premium VIP ({methods.filter(m => m.type === 'premium').length})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 text-xs bg-[#0f1422] border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0f1422] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* AD BANNER FOR SIMPLE USERS */}
      <AdBanner placement="video_banner" />

      {/* Methods Grid */}
      {filteredMethods.length === 0 ? (
        <div className="text-center py-16 bg-[#0f1422] border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 text-sm">No methods match your selected filter.</p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map(m => {
            const isLocked = m.type === 'premium' && !isPremium;
            return (
              <div
                key={m.id}
                onClick={() => handleMethodClick(m)}
                className={`bg-[#0f1422] border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col group shadow-xl ${
                  m.type === 'premium'
                    ? 'border-purple-500/20 hover:border-purple-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={m.thumbnailUrl}
                    alt={m.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badge */}
                  <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    m.type === 'premium'
                      ? 'bg-purple-950/90 border border-purple-500/40 text-purple-300 flex items-center gap-1'
                      : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'
                  }`}>
                    {m.type === 'premium' && <Crown className="w-3 h-3 text-purple-400" />}
                    <span>{m.type === 'premium' ? 'PREMIUM VIP' : 'FREE METHOD'}</span>
                  </div>

                  {isLocked && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      {isLocked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 mb-1.5">
                      <span>{m.category}</span>
                      <span className="mx-1.5">·</span>
                      <span>{m.uploadDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                      {m.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{m.views} views</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {m.type === 'premium' ? 'Watermark: Premium Video' : 'Watermark: Simple Video'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
