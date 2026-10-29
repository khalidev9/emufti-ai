import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { Ayah, Surah, QariReciter } from '../../types/database';
import { ALL_114_SURAHS } from '../../data/quranMetadata';

interface MushafPageViewProps {
  currentPageNumber: number;
  onPageChange: (newPage: number) => void;
  pageVerses: Ayah[];
  isLoading: boolean;
  currentSurah?: Surah;
  activeAyahNumber: number;
  isPlaying: boolean;
  onPlayAyah: (ayahNumber: number, surahNumber?: number) => void;
  onToggleBookmark: (ayah: Ayah) => void;
  isBookmarked: (ayah: Ayah) => boolean;
  onAskEMufti: (ayah: Ayah) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  readingTheme: 'light' | 'sepia' | 'dark';
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  currentPageNumber,
  onPageChange,
  pageVerses,
  isLoading,
  currentSurah,
  activeAyahNumber,
  isPlaying,
  onPlayAyah,
  onToggleBookmark,
  isBookmarked,
  onAskEMufti,
  fontSize,
  readingTheme,
}) => {
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Keyboard navigation for page turning (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        if (currentPageNumber > 1) onPageChange(currentPageNumber - 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentPageNumber < 604) onPageChange(currentPageNumber + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageNumber, onPageChange]);

  const handleCopyAyah = (ayah: Ayah) => {
    const text = `${ayah.text}\n[Surah ${ayah.surah?.englishName || currentSurah?.englishName} (${ayah.surah?.number || currentSurah?.number}:${ayah.numberInSurah})]`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNum(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      onPageChange(p);
      setJumpPageInput('');
    }
  };

  // Theme styling classes
  const themeClasses =
    readingTheme === 'sepia'
      ? 'bg-[#FBF7EE] text-[#2C2723] border-[#E8DFD0]'
      : readingTheme === 'dark'
      ? 'bg-[#181818] text-[#F3F4F6] border-stone-800'
      : 'bg-white text-stone-900 border-stone-200/90';

  const arabicTextSizeClass =
    fontSize === 'sm'
      ? 'text-lg sm:text-xl leading-[2.4] sm:leading-[2.6]'
      : fontSize === 'md'
      ? 'text-xl sm:text-2xl leading-[2.6] sm:leading-[2.8]'
      : fontSize === 'lg'
      ? 'text-2xl sm:text-3xl leading-[2.8] sm:leading-[3.0]'
      : 'text-3xl sm:text-4xl leading-[3.0] sm:leading-[3.3]';

  // Find if a surah starts on this page (ayah 1)
  const startingSurahAyah = pageVerses.find((a) => a.numberInSurah === 1);
  const startingSurahMeta = startingSurahAyah?.surah
    ? ALL_114_SURAHS.find((s) => s.number === startingSurahAyah.surah?.number)
    : undefined;

  const currentJuz = pageVerses[0]?.juz || 1;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Mushaf Page Container */}
      <div
        className={`rounded-3xl border-2 p-4 sm:p-8 shadow-md relative transition-all duration-300 min-h-[600px] flex flex-col justify-between ${themeClasses}`}
      >
        {/* Top Ornate Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-current/15 text-xs font-semibold select-none opacity-80">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Juzz {currentJuz}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-arabic font-bold text-sm">
              {pageVerses[0]?.surah?.name || currentSurah?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono">Bogga {currentPageNumber}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 py-2">
          {isLoading ? (
            <div className="py-32 text-center space-y-3 opacity-60">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-bold">Soo dejinaya bogga {currentPageNumber} ee Musxafka...</p>
            </div>
          ) : pageVerses.length === 0 ? (
            <div className="py-32 text-center space-y-2 opacity-60">
              <BookOpen className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-xs font-bold">Aayado lagama helin boggan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Surah Banner if Surah starts on this page */}
              {startingSurahMeta && (
                <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-300">
                    Surah {startingSurahMeta.number} • {startingSurahMeta.numberOfAyahs} Aayadood • {startingSurahMeta.revelationType}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-arabic font-bold text-emerald-800 dark:text-emerald-200">
                    سُورَةُ {startingSurahMeta.name}
                  </h2>
                  {startingSurahMeta.number !== 9 && (
                    <div className="pt-1 font-arabic text-base sm:text-lg text-emerald-700 dark:text-emerald-300">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                  )}
                </div>
              )}

              {/* Continuous Traditional Mushaf Verse Flow (RTL) */}
              <div
                dir="rtl"
                className={`font-arabic text-right tracking-wide select-text ${arabicTextSizeClass}`}
              >
                {pageVerses.map((ayah) => {
                  const isCurrentActive =
                    activeAyahNumber === ayah.numberInSurah &&
                    (ayah.surah?.number === currentSurah?.number || !ayah.surah);
                  const isAyahSelected = selectedAyah?.number === ayah.number;

                  return (
                    <span
                      key={ayah.number}
                      onClick={() => setSelectedAyah(ayah)}
                      className={`inline transition-all cursor-pointer rounded px-1 py-0.5 ${
                        isCurrentActive && isPlaying
                          ? 'bg-emerald-500/25 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/50'
                          : isAyahSelected
                          ? 'bg-amber-500/20 text-amber-950 dark:text-amber-100'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      title={`Surah ${ayah.surah?.englishName || currentSurah?.englishName} (${ayah.surah?.number || currentSurah?.number}:${ayah.numberInSurah}) - Click for actions`}
                    >
                      <span>{ayah.text}</span>
                      <span className="inline-flex items-center justify-center font-arabic font-bold text-emerald-600 dark:text-emerald-400 mx-1 text-sm sm:text-base select-none">
                        ۝{ayah.numberInSurah}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Verse Context Toolbar (appears on click of any verse) */}
        {selectedAyah && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                {selectedAyah.numberInSurah}
              </span>
              <span className="font-bold text-foreground">
                {selectedAyah.surah?.englishName || currentSurah?.englishName} ({selectedAyah.surah?.number || currentSurah?.number}:{selectedAyah.numberInSurah})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPlayAyah(selectedAyah.numberInSurah, selectedAyah.surah?.number)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                title="Play this verse"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Dhageyso</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleBookmark(selectedAyah)}
                className="p-1.5 rounded-xl hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                title="Bookmark verse"
              >
                {isBookmarked(selectedAyah) ? (
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyAyah(selectedAyah)}
                className="p-1.5 rounded-xl hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                title="Copy verse"
              >
                {copiedAyahNum === selectedAyah.numberInSurah ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onAskEMufti(selectedAyah)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                title="Weydii EMufti ku saabsan Aayaddan"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Weydii EMufti</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Ornate Footer Line with Page Number */}
        <div className="pt-3 mt-4 border-t border-current/15 flex items-center justify-between text-xs font-semibold select-none opacity-80">
          <span className="text-[11px] text-muted-foreground">
            Musxafka Madiina (King Fahd Complex)
          </span>
          <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
            — {currentPageNumber} —
          </span>
          <span className="text-[11px] text-muted-foreground">
            604 Bogag
          </span>
        </div>
      </div>

      {/* Pagination Controls Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border shadow-xs">
        {/* Previous Page (RTL direction: Page N-1) */}
        <button
          type="button"
          disabled={currentPageNumber <= 1}
          onClick={() => onPageChange(currentPageNumber - 1)}
          className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bogga Hore</span>
        </button>

        {/* Jump to Page Form */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={604}
            value={jumpPageInput}
            onChange={(e) => setJumpPageInput(e.target.value)}
            placeholder={`${currentPageNumber}`}
            className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-xl bg-muted/60 border border-border text-foreground focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-muted-foreground font-medium">/ 604</span>
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
          >
            Tag
          </button>
        </form>

        {/* Next Page (Page N+1) */}
        <button
          type="button"
          disabled={currentPageNumber >= 604}
          onClick={() => onPageChange(currentPageNumber + 1)}
          className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Bogga Xiga</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
