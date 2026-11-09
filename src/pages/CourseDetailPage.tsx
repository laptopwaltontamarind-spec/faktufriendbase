import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { AdBanner } from '../components/AdBanner.tsx';
import { 
  ArrowLeft, 
  Crown, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  User, 
  Download,
  Share2
} from 'lucide-react';
import type { Lesson } from '../types/index.ts';

export const CourseDetailPage: React.FC = () => {
  const { selectedItemId, courses, setCurrentPage, triggerPremiumGate, showToast } = useApp();
  const { isPremium } = useAuth();

  const course = courses.find(c => c.id === selectedItemId) || courses[0];
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  if (!course) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Course not found.</p>
        <button
          onClick={() => setCurrentPage('courses')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const isLocked = course.type === 'premium' && !isPremium;
  const currentLesson: Lesson = course.lessons[selectedLessonIndex] || course.lessons[0] || {
    id: 'l_default',
    title: course.title,
    duration: course.totalDuration,
    videoUrl: course.videoUrl,
    description: course.description,
    order: 1
  };

  const handleLessonClick = (idx: number) => {
    if (isLocked) {
      triggerPremiumGate('course');
      return;
    }
    setSelectedLessonIndex(idx);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Course link copied to clipboard!', 'success');
  };

  return (
    <div className="w-full min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        onClick={() => setCurrentPage('courses')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Courses</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Video & Lesson Viewer (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <VideoPlayer
            title={currentLesson.title}
            videoUrl={currentLesson.videoUrl || course.videoUrl}
            thumbnailUrl={course.thumbnailUrl}
            contentType="course"
            tierType={course.type}
            downloadAllowed={course.downloadAllowed}
            downloadUrl={course.downloadUrl}
            fileName={course.fileName}
            fileSize="35.0 MB"
            itemId={course.id}
          />

          {/* Lesson Info */}
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  course.type === 'premium'
                    ? 'bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center gap-1.5'
                    : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                }`}>
                  {course.type === 'premium' && <Crown className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{course.type === 'premium' ? 'PREMIUM COURSE' : 'SIMPLE COURSE'}</span>
                </span>

                <span className="text-xs text-slate-400">
                  {course.category}
                </span>

                <span className="text-xs text-slate-500 hidden sm:inline">
                  Lesson {selectedLessonIndex + 1} of {course.lessons.length}
                </span>
              </div>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            {/* Current Lesson Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-4 mb-2">
              {currentLesson.title}
            </h1>
            <p className="text-xs text-purple-400 mb-4 font-mono">
              Course: {course.title}
            </p>

            {/* Lesson & Course Description */}
            <div className="text-slate-300 text-sm leading-relaxed space-y-4">
              <p>{currentLesson.description || course.description}</p>
              
              <div className="pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Course Overview & Objectives
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Instructor Card */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">{course.instructor || 'Lead Technical Instructor'}</h5>
                  <p className="text-[11px] text-slate-400">Method Tricks Senior Specialist · Verified Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Banner for Simple Users */}
          <AdBanner placement="video_banner" />
        </div>

        {/* Syllabus / Lesson Playlist Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Course Syllabus</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {course.lessons.length} Modules
              </span>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === selectedLessonIndex;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-purple-950/70 border-purple-500/50 text-white'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-slate-500" />
                        ) : isActive ? (
                          <PlayCircle className="w-4 h-4 text-purple-400" />
                        ) : (
                          <span className="w-4 h-4 text-[11px] font-mono font-bold text-slate-500 inline-block text-center">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isActive ? 'text-purple-300' : ''}`}>
                          {lesson.title}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>

                    {isLocked && (
                      <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider shrink-0">
                        VIP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premium VIP Banner if locked */}
          {isLocked && (
            <div className="bg-gradient-to-br from-[#15102a] to-[#0c1222] border border-purple-500/30 rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 mx-auto mb-3">
                <Crown className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Unlock All Course Lessons</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                This is a Premium Course. Buy a Premium Package to access this course and all project assets.
              </p>
              <button
                onClick={() => {
                  setCurrentPage('packages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Buy Premium Package
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
