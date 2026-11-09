import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  Lock, 
  Crown, 
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  contentType: 'method' | 'course';
  tierType: 'simple' | 'premium';
  downloadAllowed?: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  itemId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  videoUrl,
  thumbnailUrl,
  contentType,
  tierType,
  downloadAllowed = false,
  downloadUrl,
  fileName,
  fileSize,
  itemId
}) => {
  const { isPremium, token } = useAuth();
  const { triggerPremiumGate, showToast } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Check if content is locked for this user
  const isLocked = tierType === 'premium' && !isPremium;

  const handlePlayToggle = () => {
    if (isLocked) {
      triggerPremiumGate(contentType);
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked || !videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (isLocked || !videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleDownload = async () => {
    if (isLocked) {
      triggerPremiumGate(contentType);
      return;
    }
    if (!downloadAllowed) {
      showToast('Downloads are disabled for this content.', 'info');
      return;
    }

    setDownloading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/media/download/${contentType}/${itemId}`, { headers });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || 'Download verification failed', 'error');
        if (data.error && data.error.includes('Premium')) {
          triggerPremiumGate(contentType);
        }
        return;
      }

      setDownloadSuccess(true);
      showToast(`Download started: ${data.fileName}`, 'success');

      // Create synthetic link to download
      const link = document.createElement('a');
      link.href = data.downloadUrl || '#';
      link.setAttribute('download', data.fileName || 'method-resource.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch {
      showToast('Failed to connect to download gateway', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Watermark text according to user specification
  const watermarkText = contentType === 'method'
    ? (tierType === 'premium' ? 'Premium Video' : 'Simple Video')
    : (tierType === 'premium' ? 'Premium Course' : 'Simple Course');

  return (
    <div className="w-full bg-[#0d121f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
        {isLocked ? (
          // LOCKED STATE OVERLAY FOR SIMPLE USERS
          <div 
            onClick={() => triggerPremiumGate(contentType)}
            className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center text-center p-6 bg-slate-950/85 backdrop-blur-sm z-20 group"
          >
            {/* Background blurred preview */}
            <img 
              src={thumbnailUrl} 
              alt={title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md"
            />
            
            <div className="relative z-10 flex flex-col items-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/40">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300 mb-3">
                <Crown className="w-3.5 h-3.5" />
                <span>PREMIUM EXCLUSIVE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                {contentType === 'method' 
                  ? 'Purchase a Premium Package to unlock this method and start watching.' 
                  : 'This is a Premium Course. Buy a Premium Package to access this course.'}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerPremiumGate(contentType);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Unlock Premium Access</span>
              </button>
            </div>
          </div>
        ) : (
          // UNLOCKED VIDEO PLAYER
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnailUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
              playsInline
            />

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-950/60 transition-transform transform hover:scale-110 z-10 cursor-pointer"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
              </button>
            )}

            {/* Custom Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
              />

              <div className="flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePlayToggle} 
                    className="p-1 hover:text-purple-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = 0;
                    }}
                    className="p-1 hover:text-purple-400 transition-colors"
                    title="Restart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleVolumeToggle} 
                    className="p-1 hover:text-purple-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="font-mono tabular-nums text-slate-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] uppercase font-mono text-slate-400">
                    HD 1080p
                  </span>
                  <button 
                    onClick={handleFullscreen} 
                    className="p-1 hover:text-purple-400 transition-colors"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Subtle Watermark Below Video (Prompt Requirement) & Resource Controls */}
      <div className="p-4 bg-[#0a0f1a] border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Subtle Watermark Text */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md text-[11px] ${
            tierType === 'premium' 
              ? 'bg-purple-950/60 text-purple-300 border border-purple-500/20' 
              : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'
          }`}>
            {tierType === 'premium' && <Crown className="w-3 h-3 text-purple-400" />}
            <span>{watermarkText}</span>
          </span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            · Method Tricks Verified Educational Content
          </span>
        </div>

        {/* Download File Button (if enabled) */}
        {downloadAllowed && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLocked 
                  ? 'bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-700' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download File (Premium)</span>
                </>
              ) : downloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Download...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resource {fileSize ? `(${fileSize})` : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
