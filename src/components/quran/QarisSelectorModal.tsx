import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Headphones,
  Play,
  Pause,
  Check,
  Sparkles,
} from 'lucide-react';
import { QariReciter } from '../../types/database';
import {
  getReciterAvatarUrl,
  getReciterInitials,
  RECITER_REMOTE_FALLBACKS,
} from '../../data/reciterAvatars';

interface QarisSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reciters: QariReciter[];
  selectedReciter: QariReciter;
  onSelectReciter: (reciter: QariReciter) => void;
}

export const QarisSelectorModal: React.FC<QarisSelectorModalProps> = ({
  isOpen,
  onClose,
  reciters,
  selectedReciter,
  onSelectReciter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const filteredReciters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return reciters;
    return reciters.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.arabicName.includes(q) ||
        r.style?.toLowerCase().includes(q)
    );
  }, [reciters, searchQuery]);

  const handleTogglePreview = (reciter: QariReciter, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === reciter.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const sampleUrl = reciter.hasVerseAudio && reciter.verseBaseUrl
        ? `${reciter.verseBaseUrl}/001001.mp3`
        : `https://everyayah.com/data/Alafasy_128kbps/001001.mp3`;

      const audio = new Audio(sampleUrl);
      previewAudioRef.current = audio;
      setPreviewingId(reciter.id);
      audio.play().catch(() => setPreviewingId(null));
      audio.onended = () => setPreviewingId(null);
    }
  };

  const handleSelect = (reciter: QariReciter) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewingId(null);
    onSelectReciter(reciter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (previewAudioRef.current) previewAudioRef.current.pause();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-stone-200/80 dark:border-white/10 flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-150 select-none overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Dooro Qaariga (Select Reciter)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                50+ Authentic Verified Quran Reciters
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewAudioRef.current) previewAudioRef.current.pause();
              onClose();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-100 dark:border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi qaariga (Mishary, AbdulBasit, Sudais...)"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border-0 focus:ring-1 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Reciters List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 chat-scrollbar">
          {filteredReciters.map((reciter) => {
            const isSelected = selectedReciter.id === reciter.id;
            const isPreviewing = previewingId === reciter.id;

            return (
              <div
                key={reciter.id}
                onClick={() => handleSelect(reciter)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-xs'
                    : 'border-stone-200/80 dark:border-white/10 hover:border-blue-500/40 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reciter Portrait Photo / Styled Avatar */}
                  <div className="relative w-12 h-12 rounded-full shrink-0">
                    <img
                      src={getReciterAvatarUrl(reciter.id, reciter.portraitUrl)}
                      alt={reciter.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const remoteFallback = RECITER_REMOTE_FALLBACKS[reciter.id];
                        if (remoteFallback && target.src !== remoteFallback) {
                          target.src = remoteFallback;
                        } else if (!target.src.endsWith('/default-reciter-avatar.png')) {
                          target.src = '/default-reciter-avatar.png';
                        } else {
                          target.style.display = 'none';
                          const fallbackEl = target.nextElementSibling as HTMLElement;
                          if (fallbackEl) fallbackEl.style.display = 'flex';
                        }
                      }}
                      className={`w-12 h-12 rounded-full object-cover ring-2 transition-all duration-200 ${
                        isSelected
                          ? 'ring-blue-600 shadow-md scale-105'
                          : 'ring-blue-400/30 hover:ring-blue-500/50 shadow-xs'
                      }`}
                      loading="lazy"
                    />
                    <div
                      style={{ display: 'none' }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {getReciterInitials(reciter.name)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {reciter.name}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {reciter.style || 'Murattal'} • {reciter.hasVerseAudio ? 'Verse-by-Verse' : 'Full Surah'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-arabic text-xs font-bold text-blue-700 dark:text-blue-400">
                    {reciter.arabicName}
                  </span>

                  {/* Preview Audio Button */}
                  <button
                    type="button"
                    onClick={(e) => handleTogglePreview(reciter, e)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isPreviewing
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-blue-600'
                    }`}
                    title={isPreviewing ? 'Stop Preview' : 'Listen to Sample Preview'}
                  >
                    {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
