import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { 
  Crown, 
  Play, 
  Lock, 
  Search, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import type { CourseItem } from '../types/index.ts';

interface CoursesPageProps {
  initialFilter?: 'all' | 'simple' | 'premium';
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ initialFilter = 'all' }) => {
  const { courses, openCourseDetail, triggerPremiumGate } = useApp();
  const { isPremium } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'simple' | 'premium'>(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = courses.filter(c => {
    if (activeTab === 'simple' && c.type !== 'simple') return false;
    if (activeTab === 'premium' && c.type !== 'premium') return false;

    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCourseClick = (c: CourseItem) => {
    if (c.type === 'premium' && !isPremium) {
      triggerPremiumGate('course');
    } else {
      openCourseDetail(c.id);
    }
  };

  return (
    <div className="w-full min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          <span>FULL-LENGTH MASTERCLASSES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Comprehensive Digital Courses
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Structured curricula with practical project lessons, downloadable exercises, and specialist guidance.
        </p>
      </div>

      {/* Segmented Controls & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1 p-1 bg-[#0f1422] border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'simple'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simple Courses (Free)
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
            <span>Premium VIP ({courses.filter(c => c.type === 'premium').length})</span>
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-xs bg-[#0f1422] border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0f1422] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Ad banner for simple users */}
      <AdBanner placement="course_bottom" />

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-[#0f1422] border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 text-sm">No courses match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(c => {
            const isLocked = c.type === 'premium' && !isPremium;
            return (
              <div
                key={c.id}
                onClick={() => handleCourseClick(c)}
                className={`bg-[#0f1422] border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col group shadow-xl ${
                  c.type === 'premium'
                    ? 'border-purple-500/20 hover:border-purple-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    c.type === 'premium'
                      ? 'bg-purple-950/90 border border-purple-500/40 text-purple-300 flex items-center gap-1'
                      : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'
                  }`}>
                    {c.type === 'premium' && <Crown className="w-3 h-3 text-purple-400" />}
                    <span>{c.type === 'premium' ? 'PREMIUM VIP' : 'FREE COURSE'}</span>
                  </div>

                  {isLocked && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-purple-300 backdrop-blur-sm border border-purple-500/30">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      {isLocked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-2">
                      <span>{c.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3" />
                        {c.totalDuration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {c.lessons.length} Lessons
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {c.type === 'premium' ? 'Watermark: Premium Course' : 'Watermark: Simple Course'}
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
