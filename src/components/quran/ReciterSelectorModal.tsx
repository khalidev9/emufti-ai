import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Headphones,
  Check,
  Play,
  Pause,
  Sparkles,
  Volume2,
  Heart,
} from 'lucide-react';
import { storage } from '../../lib/storage';
import { QariReciter } from '../../types/database';
import { ALL_50_QARIS } from '../../data/qarisData';
import {
  getReciterAvatarUrl,
  getReciterInitials,
  RECITER_REMOTE_FALLBACKS,
} from '../../data/reciterAvatars';

interface ReciterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReciter: QariReciter;
  onSelectReciter: (reciter: QariReciter) => void;
}

export const ReciterSelectorModal: React.FC<ReciterSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedReciter,
  onSelectReciter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => storage.getFavoriteReciters('user'));
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleFavorite = (e: React.MouseEvent, qariNumber: number) => {
    e.stopPropagation();
    const updated = favorites.includes(qariNumber)
      ? favorites.filter((id) => id !== qariNumber)
      : [...favorites, qariNumber];
    setFavorites(updated);
    storage.saveFavoriteReciters('user', updated);
  };

  if (!isOpen) return null;

  const filteredReciters = ALL_50_QARIS.filter((q) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      q.name.toLowerCase().includes(query) ||
      q.arabicName.includes(query) ||
      q.country.toLowerCase().includes(query) ||
      (q.style && q.style.toLowerCase().includes(query))
    );
  });

  const handleTogglePreview = (e: React.MouseEvent, qari: QariReciter) => {
    e.stopPropagation();
    if (previewingId === qari.id) {
      previewAudioRef.current?.pause();
      setPreviewingId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      // Sample audio (Surah 1 Al-Fatihah)
      const sampleUrl = qari.surahBaseUrl
        ? `${qari.surahBaseUrl}/001.mp3`
        : qari.verseBaseUrl
        ? `${qari.verseBaseUrl}/001001.mp3`
        : `https://everyayah.com/data/Alafasy_128kbps/001001.mp3`;

      previewAudioRef.current = new Audio(sampleUrl);
      previewAudioRef.current
        .play()
        .then(() => setPreviewingId(qari.id))
        .catch(() => setPreviewingId(null));
      previewAudioRef.current.onended = () => setPreviewingId(null);
    }
  };

  const handleSelect = (qari: QariReciter) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingId(null);
    }
    onSelectReciter(qari);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Frosted Glass Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => {
          if (previewAudioRef.current) previewAudioRef.current.pause();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal / iOS Bottom Sheet Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col max-h-[85vh] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* iOS Drag Indicator for mobile */}
        <div className="sm:hidden pt-3 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Dooro Qaari (Choose Reciter)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                50+ Verified Qurra with real-time verse audio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (previewAudioRef.current) previewAudioRef.current.pause();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reciter name (e.g. Cabdirashiid Cali Suufi, Al-Husary, Alafasy)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Feature 13: Pinned Favorites Quick Switcher Bar */}
        {favorites.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>Pinned:</span>
            </span>
            {favorites.map((favNum) => {
              const q = ALL_50_QARIS.find((item) => item.number === favNum);
              if (!q) return null;
              const isSel = selectedReciter.id === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelect(q)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                    isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                  }`}
                >
                  <img
                    src={getReciterAvatarUrl(q.id, q.portraitUrl)}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const remoteFallback = RECITER_REMOTE_FALLBACKS[q.id];
                      if (remoteFallback && target.src !== remoteFallback) {
                        target.src = remoteFallback;
                      } else {
                        target.src = '/default-reciter-avatar.png';
                      }
                    }}
                  />
                  <span>{q.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Reciters List Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredReciters.map((qari) => {
            const isSelected = selectedReciter.id === qari.id;
            const isPreviewing = previewingId === qari.id;

            return (
              <div
                key={qari.id}
                onClick={() => handleSelect(qari)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 ring-2 ring-blue-300/40 shadow-md text-white'
                    : 'bg-slate-900 border border-blue-500/50 hover:bg-blue-950 hover:border-blue-400 text-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Reciter Portrait Photo / Styled Avatar with clean fallback */}
                  <div className="relative w-12 h-12 rounded-full shrink-0">
                    <img
                      src={getReciterAvatarUrl(qari.id, qari.portraitUrl)}
                      alt={qari.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const remoteFallback = RECITER_REMOTE_FALLBACKS[qari.id];
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
                      className={`w-12 h-12 rounded-full object-cover ring-2 transition-transform duration-200 ${
                        isSelected
                          ? 'ring-white shadow-md scale-105'
                          : 'ring-blue-400/40 hover:ring-blue-300 shadow-xs'
                      }`}
                      loading="lazy"
                    />
                    <div
                      style={{ display: 'none' }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'bg-blue-800/90 text-white border border-blue-700/60 shadow-2xs'
                      }`}
                    >
                      {getReciterInitials(qari.name)}
                    </div>
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2 truncate">
                      <h4 className="text-xs font-bold text-white truncate">
                        {qari.name}
                      </h4>
                      {qari.country === 'Somalia' && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-blue-500/20 text-blue-100 border border-blue-400/40'
                          }`}
                        >
                          Somalia 🇸🇴
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate ${
                        isSelected ? 'text-blue-100' : 'text-blue-100/90'
                      }`}
                    >
                      {qari.style} • {qari.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-arabic text-xs font-semibold hidden sm:inline ${
                      isSelected ? 'text-white' : 'text-blue-100'
                    }`}
                  >
                    {qari.arabicName}
                  </span>

                  {/* Pin Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(e, qari.number)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      favorites.includes(qari.number)
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={favorites.includes(qari.number) ? 'Remove Favorite' : 'Pin Favorite'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(qari.number) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Sample Audio Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => handleTogglePreview(e, qari)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isPreviewing
                        ? 'bg-white text-blue-600 shadow-xs animate-pulse ring-2 ring-white/40'
                        : isSelected
                        ? 'text-white hover:bg-blue-700/80 bg-blue-500/60'
                        : 'text-blue-200 hover:text-white hover:bg-blue-800/60'
                    }`}
                    title={isPreviewing ? 'Stop Preview' : 'Sample Recitation'}
                  >
                    {isPreviewing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  {/* Checkmark */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredReciters.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No reciter found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
