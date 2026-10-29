import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  RotateCcw,
  RefreshCw,
  Headphones,
  Volume2,
  VolumeX,
  X,
  MoreHorizontal,
  Download,
  Zap,
  Gauge,
  UserCheck,
  Check,
  ChevronRight,
} from 'lucide-react';
import { QariReciter, Surah } from '../../types/database';

export interface QuranAudioPlayerProps {
  currentSurah?: Surah;
  activeAyahNumber: number;
  totalAyahsInSurah: number;
  selectedReciter: QariReciter;
  isPlaying: boolean;
  isLoading: boolean;
  isLoopingAyah: boolean;
  playbackProgress: number;
  audioCurrentTime: number;
  audioDuration: number;
  audioError: string | null;
  playbackSpeed: number;
  onTogglePlayPause: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onReplayAyah: () => void;
  onToggleLoopAyah: () => void;
  onSeek: (percentage: number) => void;
  onSelectSpeed: (speed: number) => void;
  onOpenRecitersModal: () => void;
  // Extended optional props
  onClose?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  autoScroll?: boolean;
  onToggleAutoScroll?: () => void;
  showWordTooltips?: boolean;
  onToggleWordTooltips?: () => void;
  onDownloadAudio?: () => void;
  currentAudioUrl?: string;
}

export const QuranAudioPlayer: React.FC<QuranAudioPlayerProps> = ({
  currentSurah,
  activeAyahNumber,
  totalAyahsInSurah,
  selectedReciter,
  isPlaying,
  isLoading,
  isLoopingAyah,
  playbackProgress,
  audioCurrentTime,
  audioDuration,
  audioError,
  playbackSpeed,
  onTogglePlayPause,
  onPrevAyah,
  onNextAyah,
  onReplayAyah,
  onToggleLoopAyah,
  onSeek,
  onSelectSpeed,
  onOpenRecitersModal,
  onClose,
  isMuted = false,
  onToggleMute,
  autoScroll = true,
  onToggleAutoScroll,
  showWordTooltips = true,
  onToggleWordTooltips,
  onDownloadAudio,
  currentAudioUrl,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<'main' | 'repeat' | 'experience' | 'speed'>('main');
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
        setActiveSubMenu('main');
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${mm}:${ss}`;
  };

  const currentDuration = audioDuration && isFinite(audioDuration) ? audioDuration : 0;
  const currentTime = audioCurrentTime && isFinite(audioCurrentTime) ? audioCurrentTime : 0;
  const progressPercent = currentDuration > 0 ? Math.min(100, Math.max(0, (currentTime / currentDuration) * 100)) : playbackProgress || 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0) {
      const percentage = Math.max(0, Math.min(1, clickX / width));
      onSeek(percentage);
    }
  };

  const handleDownload = () => {
    if (onDownloadAudio) {
      onDownloadAudio();
    } else if (currentAudioUrl) {
      const a = document.createElement('a');
      a.href = currentAudioUrl;
      a.download = `${currentSurah?.englishName || 'Surah'}_Ayah_${activeAyahNumber}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setIsMoreMenuOpen(false);
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-2xl py-2 px-3 sm:px-6 select-none animate-in slide-in-from-bottom duration-200">
      <div className="max-w-5xl mx-auto w-full space-y-1.5">
        
        {/* ============================================================== */}
        {/* 1. TOP SCRUBBER & TIMELINE BAR: Elapsed / Scrubber / Total     */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="w-10 text-right shrink-0">{formatTime(currentTime)}</span>

          {/* Interactive Progress Bar */}
          <div
            onClick={handleScrubberClick}
            className="relative flex-1 h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full cursor-pointer group py-0.5"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label="Audio timeline scrubber"
          >
            {/* Filled Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-blue-600 rounded-full transition-all duration-75 relative group-hover:bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Scrubbing Handle Pip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-100 rounded-full shadow-md border-2 border-blue-600 scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>

          <span className="w-10 text-left shrink-0">{formatTime(currentDuration)}</span>
        </div>

        {/* ============================================================== */}
        {/* 2. MAIN CONTROLS ROW                                           */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Surah & Reciter Info */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-[35%] sm:max-w-[32%]">
            <button
              type="button"
              onClick={onOpenRecitersModal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
              title="Change Reciter / Dooro Qaari"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentSurah?.englishName || 'Surah'}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  {activeAyahNumber}:{totalAyahsInSurah}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenRecitersModal}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium truncate block text-left transition-colors"
                title="Change Reciter"
              >
                {selectedReciter?.name || 'Sheikh Reciter'}
              </button>
            </div>
          </div>

          {/* Center: Playback Controls + Three-Dots (•••) */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 shrink-0 relative" ref={moreMenuRef}>
            
            {/* ============================================================ */}
            {/* "•••" THREE-DOTS BUTTON & FLOATING POPOVER MENU             */}
            {/* ============================================================ */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                  setActiveSubMenu('main');
                }}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                  isMoreMenuOpen
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="More audio options (Download, Repeat, Speed, Reciter, Experience)"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* FLOATING POPOVER MENU */}
              {isMoreMenuOpen && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* MAIN MENU */}
                  {activeSubMenu === 'main' && (
                    <div className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                        Audio Preferences
                      </div>

                      {/* 1. Download */}
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Download</span>
                        </div>
                        <span className="text-[10px] text-slate-400">MP3</span>
                      </button>

                      {/* 2. Manage repeat settings */}
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('repeat')}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Manage repeat settings</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{isLoopingAyah ? 'Verse Loop' : 'Off'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* 3. Experience */}
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('experience')}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Experience</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* 4. Speed */}
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('speed')}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Speed</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          <span>{playbackSpeed}x</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* 5. Reciter */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenRecitersModal();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Reciter</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                          {selectedReciter.name.split(' ')[0]}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* SUBMENU: REPEAT SETTINGS */}
                  {activeSubMenu === 'repeat' && (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('main')}
                        className="text-[10px] font-bold text-blue-600 px-2 py-1 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ‹ Back to Menu
                      </button>
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-white">
                        Verse Repeat Settings
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isLoopingAyah) onToggleLoopAyah();
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                          !isLoopingAyah ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>No Repeat (Play continuous)</span>
                        {!isLoopingAyah && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoopingAyah) onToggleLoopAyah();
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                          isLoopingAyah ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>Loop Current Verse (Repeat)</span>
                        {isLoopingAyah && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* SUBMENU: EXPERIENCE */}
                  {activeSubMenu === 'experience' && (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('main')}
                        className="text-[10px] font-bold text-blue-600 px-2 py-1 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ‹ Back to Menu
                      </button>
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-white">
                        Experience Toggles
                      </div>

                      {/* Auto-scroll toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleAutoScroll) onToggleAutoScroll();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span>Auto-scroll to active verse</span>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoScroll ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${autoScroll ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>

                      {/* Word Tooltips toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleWordTooltips) onToggleWordTooltips();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span>Word-by-word tooltips</span>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showWordTooltips ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showWordTooltips ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* SUBMENU: PLAYBACK SPEED */}
                  {activeSubMenu === 'speed' && (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('main')}
                        className="text-[10px] font-bold text-blue-600 px-2 py-1 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ‹ Back to Menu
                      </button>
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-white">
                        Select Playback Speed
                      </div>
                      {speedOptions.map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => {
                            onSelectSpeed(sp);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                            playbackSpeed === sp
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{sp}x Speed</span>
                          {playbackSpeed === sp && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Previous Verse (⏮) */}
            <button
              type="button"
              onClick={onPrevAyah}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous verse (⏮)"
              aria-label="Previous verse"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause Main Button (▶ / ⏸) */}
            <button
              type="button"
              onClick={onTogglePlayPause}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Verse (⏭) */}
            <button
              type="button"
              onClick={onNextAyah}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next verse (⏭)"
              aria-label="Next verse"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Close / Dismiss Player (✕) */}
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                else if (isPlaying) onTogglePlayPause();
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close audio player"
              aria-label="Close audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Quick Speed & Loop Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : playbackSpeed === 2.0 ? 0.75 : 1.0;
                onSelectSpeed(nextSpeed);
              }}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
              title="Click to cycle speed"
            >
              {playbackSpeed}x
            </button>

            <button
              type="button"
              onClick={onToggleLoopAyah}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isLoopingAyah
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isLoopingAyah ? 'Verse loop active' : 'Loop current verse'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Error message if any */}
        {audioError && (
          <p className="text-[10px] text-red-500 font-semibold text-center truncate">
            {audioError}
          </p>
        )}
      </div>
    </div>
  );
};
