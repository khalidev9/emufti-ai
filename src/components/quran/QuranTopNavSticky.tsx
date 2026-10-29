import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Settings,
  Search,
  BookOpen,
  Layers,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuranDotComChapter } from '../../lib/quranDotComService';

export type MainReadingMode = 'verse_by_verse' | 'reading';

interface QuranTopNavStickyProps {
  chapters: QuranDotComChapter[];
  selectedChapterId: number;
  onSelectChapter: (chapterId: number) => void;
  currentPageNumber: number;
  currentJuzNumber: number;
  currentHizbNumber: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  readingMode: MainReadingMode;
  onSelectReadingMode: (mode: MainReadingMode) => void;
  onOpenSettings: () => void;
}

export const QuranTopNavSticky: React.FC<QuranTopNavStickyProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  currentPageNumber,
  currentJuzNumber,
  currentHizbNumber,
  isBookmarked,
  onToggleBookmark,
  readingMode,
  onSelectReadingMode,
  onOpenSettings,
}) => {
  const [isSurahMenuOpen, setIsSurahMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedChapter =
    chapters.find((c) => c.id === selectedChapterId) ||
    chapters[0] || {
      id: 1,
      name_simple: 'Al-Fatihah',
      name_arabic: 'الفاتحة',
      verses_count: 7,
    };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsSurahMenuOpen(false);
      }
    };
    if (isSurahMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSurahMenuOpen]);

  const filteredChapters = chapters.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.id.toString().includes(q) ||
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(q) ||
      c.translated_name?.name.toLowerCase().includes(q)
    );
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-stone-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ================================================================= */}
        {/* LEFT: Searchable Surah Selector with Active Blue Indicator        */}
        {/* ================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0" ref={menuRef}>
          {/* Back to Home / Chat Link */}
          <Link
            to="/chat"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors shrink-0"
            title="Back to AI Assistant"
            aria-label="Back to AI Assistant"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Surah Dropdown Trigger Button with Active Blue Line */}
          <div className="relative">
            <button
              type="button"
              data-tutorial="surah-selector"
              onClick={() => setIsSurahMenuOpen(!isSurahMenuOpen)}
              className="group flex items-center gap-2 py-2 px-2.5 sm:px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-stone-800/80 transition-all cursor-pointer relative"
              aria-expanded={isSurahMenuOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedChapter.id}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedChapter.id}. {selectedChapter.name_simple}
                </span>
                <span className="hidden md:inline font-arabic text-xs font-bold text-blue-600 dark:text-blue-400">
                  {selectedChapter.name_arabic}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 shrink-0 ${
                  isSurahMenuOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />

              {/* Active Blue Selection Indicator Underline */}
              <div className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
            </button>

            {/* Dropdown Menu */}
            {isSurahMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] max-h-96 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-stone-800 bg-slate-50/80 dark:bg-stone-900">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 114 Surahs..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-stone-800">
                  {filteredChapters.map((c) => {
                    const isSelected = c.id === selectedChapterId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectChapter(c.id);
                          setIsSurahMenuOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xs text-slate-400 w-6 text-center">{c.id}.</span>
                          <div className="truncate">
                            <span className="text-xs font-semibold block truncate">
                              {c.name_simple}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {c.translated_name?.name} • {c.verses_count} ayahs
                            </span>
                          </div>
                        </div>
                        <span className="font-arabic text-sm text-blue-600 dark:text-blue-400 font-bold shrink-0">
                          {c.name_arabic}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER: Bookmark, Page Number, and Muted Juz & Hizb Metadata      */}
        {/* ================================================================= */}
        <div className="hidden md:flex items-center gap-2.5 text-center">
          {/* Bookmark Control Button */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-stone-800'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this passage'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this passage'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Prominent Current Page Number */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Page {currentPageNumber}
            </span>
            {/* Muted Juz and Hizb */}
            <span className="text-[10px] font-semibold text-slate-400 dark:text-stone-400">
              Juz {currentJuzNumber} • Hizb {currentHizbNumber}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT: Segmented Mode Selector & Blue Settings Gear Button        */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile bookmark icon */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`md:hidden p-1.5 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-amber-500'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this passage'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Pill-Shaped Segmented Control: Verse by Verse vs Reading */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-stone-800 rounded-full border border-slate-200/80 dark:border-stone-700/80">
            <button
              type="button"
              onClick={() => onSelectReadingMode('verse_by_verse')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                readingMode === 'verse_by_verse'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Verse by Verse
            </button>

            <button
              type="button"
              onClick={() => onSelectReadingMode('reading')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                readingMode === 'reading'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reading
            </button>
          </div>

          {/* Blue Settings Gear Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Quran Reading Settings"
            aria-label="Quran Reading Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
