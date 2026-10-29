import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Search,
  BookOpen,
  Layers,
  FileText,
  Hash,
  ChevronRight,
  Check,
  Command,
} from 'lucide-react';
import { ALL_114_SURAHS, SurahMetadata } from '../../data/quranMetadata';
import { ALL_30_JUZ, JuzInfo } from '../../data/juzMetadata';

export type LeftNavTab = 'surah' | 'verse' | 'juz' | 'page';

export interface QuranLeftNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahNumber: number;
  activeVerseNumber?: number;
  currentPageNumber: number;
  currentJuzNumber: number;
  onSelectSurah: (surahNumber: number) => void;
  onSelectVerse: (surahNumber: number, verseNumber: number) => void;
  onSelectJuz: (juzNumber: number) => void;
  onSelectPage: (pageNumber: number) => void;
  isDockedDesktop?: boolean;
  layoutMode?: 'sticky' | 'fixed';
  className?: string;
}

export const QuranLeftNavDrawer: React.FC<QuranLeftNavDrawerProps> = ({
  isOpen,
  onClose,
  currentSurahNumber,
  activeVerseNumber = 1,
  currentPageNumber,
  currentJuzNumber,
  onSelectSurah,
  onSelectVerse,
  onSelectJuz,
  onSelectPage,
  isDockedDesktop = true,
  layoutMode = 'sticky',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<LeftNavTab>('surah');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSurahForVerses, setSelectedSurahForVerses] = useState<number>(currentSurahNumber);
  const [directPageInput, setDirectPageInput] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when drawer is opened or tab changed
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keep selected surah for verse tab in sync with currentSurahNumber
  useEffect(() => {
    setSelectedSurahForVerses(currentSurahNumber);
  }, [currentSurahNumber]);

  // Filter 114 Surahs
  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_114_SURAHS;
    return ALL_114_SURAHS.filter(
      (s) =>
        s.number.toString().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.somaliNameTranslation?.toLowerCase().includes(q) ||
        s.name.includes(q)
    );
  }, [searchQuery]);

  // Filter 30 Juz
  const filteredJuz = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_30_JUZ;
    return ALL_30_JUZ.filter(
      (j) =>
        j.number.toString().includes(q) ||
        j.nameArabic.includes(q) ||
        j.nameSomali.toLowerCase().includes(q) ||
        j.startSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Currently selected surah metadata for verse tab
  const verseSurahMeta = useMemo(() => {
    return ALL_114_SURAHS.find((s) => s.number === selectedSurahForVerses) || ALL_114_SURAHS[0];
  }, [selectedSurahForVerses]);

  // Filter pages (1-604)
  const filteredPages = useMemo(() => {
    const q = searchQuery.trim();
    const list: Array<{ page: number; surah: SurahMetadata }> = [];
    for (let p = 1; p <= 604; p++) {
      let s = ALL_114_SURAHS[0];
      for (let i = ALL_114_SURAHS.length - 1; i >= 0; i--) {
        if (ALL_114_SURAHS[i].page <= p) {
          s = ALL_114_SURAHS[i];
          break;
        }
      }
      if (!q || p.toString().includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase())) {
        list.push({ page: p, surah: s });
      }
    }
    return list;
  }, [searchQuery]);

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(directPageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      onSelectPage(p);
      setDirectPageInput('');
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        onClose();
      }
    }
  };

  const handleItemSelect = (callback: () => void) => {
    callback();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  const placeholderText = useMemo(() => {
    switch (activeTab) {
      case 'surah':
        return 'Search Surah (e.g. Al-Baqarah, 2)...';
      case 'verse':
        return 'Filter Surahs for verses...';
      case 'juz':
        return 'Search Juz (e.g. Juz 1, Amma)...';
      case 'page':
        return 'Search Page (1 - 604)...';
    }
  }, [activeTab]);

  if (!isOpen) return null;

  // The inner content shared between Desktop Dock and Mobile Full-Screen Overlay
  const content = (
    <div className="flex flex-col h-full w-full bg-slate-900 md:bg-white md:dark:bg-slate-900 select-none text-slate-100 md:text-slate-800 md:dark:text-slate-200">
      {/* ============================================================== */}
      {/* 1. TOP SEGMENTED PILL BAR: Surah | Verse | Juz | Page + [X]     */}
      {/* ============================================================== */}
      <div className="shrink-0 p-3 border-b border-slate-800 md:border-slate-200/80 md:dark:border-slate-800">
        <div className="bg-slate-800/90 md:bg-slate-100 md:dark:bg-slate-800 p-1 rounded-full flex items-center justify-between gap-1 shadow-inner">
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => setActiveTab('surah')}
              className={`flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'surah'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 md:text-slate-600 md:dark:text-slate-400 hover:text-white md:hover:text-slate-900 md:dark:hover:text-white'
              }`}
            >
              Surah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verse')}
              className={`flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'verse'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 md:text-slate-600 md:dark:text-slate-400 hover:text-white md:hover:text-slate-900 md:dark:hover:text-white'
              }`}
            >
              Verse
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('juz')}
              className={`flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'juz'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 md:text-slate-600 md:dark:text-slate-400 hover:text-white md:hover:text-slate-900 md:dark:hover:text-white'
              }`}
            >
              Juz
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('page')}
              className={`flex-1 py-1 px-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'page'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 md:text-slate-600 md:dark:text-slate-400 hover:text-white md:hover:text-slate-900 md:dark:hover:text-white'
              }`}
            >
              Page
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white md:hover:text-slate-700 md:dark:hover:text-slate-200 hover:bg-slate-700 md:hover:bg-slate-200 md:dark:hover:bg-slate-700 transition-colors shrink-0 ml-1 cursor-pointer"
            title="Close navigation drawer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* KEYBOARD SHORTCUT HINT: Tip: try navigating with ctrl K       */}
        {/* ============================================================ */}
        <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 italic">
          <span>Tip: try navigating with</span>
          <span className="inline-flex items-center gap-1 font-mono font-medium not-italic bg-slate-800 md:bg-slate-100 md:dark:bg-slate-800 border border-slate-700 md:border-slate-200 md:dark:border-slate-700 text-slate-300 md:text-slate-600 md:dark:text-slate-300 px-1.5 py-0.5 rounded-md text-[10px]">
            <span className="text-[10px]">Ctrl</span> K
          </span>
        </div>

        {/* ============================================================ */}
        {/* SEARCH INPUT: Rounded input field                            */}
        {/* ============================================================ */}
        <div className="pt-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholderText}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-full bg-slate-800/90 md:bg-slate-50 md:dark:bg-slate-800/80 border border-slate-700 md:border-slate-200 md:dark:border-slate-700 text-white md:text-slate-900 md:dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white md:hover:text-slate-600 md:dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SCROLLABLE LIST VIEWS PER TAB: flex-1 overflow-y-auto overscroll-contain */}
      {/* ============================================================== */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-800 md:divide-slate-100 md:dark:divide-slate-800/80 min-h-0"
        style={{
          flex: '1 1 0%',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {/* ------------------------------------------------------------ */}
        {/* TAB 1: SURAH LIST (All 114 Surahs with highlighted active pill) */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'surah' && (
          <div className="p-2 space-y-1.5">
            {filteredSurahs.map((s) => {
              const isSelected = s.number === currentSurahNumber;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => handleItemSelect(() => onSelectSurah(s.number))}
                  className={`group relative w-full px-3 py-2.5 rounded-2xl text-left flex items-center justify-between gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 md:bg-blue-50 md:dark:bg-blue-950/70 text-blue-500 md:text-blue-700 md:dark:text-blue-300 border border-blue-500/50 md:border-blue-300 md:dark:border-blue-800 shadow-sm ring-1 ring-blue-500/20 font-bold'
                      : 'bg-transparent hover:bg-slate-800/80 md:hover:bg-gradient-to-r md:hover:from-blue-50/70 md:hover:to-white md:dark:hover:from-slate-800/80 md:dark:hover:to-slate-800/40 text-slate-200 md:text-slate-700 md:dark:text-slate-300 border border-transparent hover:border-blue-200/80 md:dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-blue-500/30 shadow-md'
                          : 'bg-slate-800 md:bg-slate-100 md:dark:bg-slate-800 text-slate-400 md:text-slate-600 md:dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors'
                      }`}
                    >
                      {s.number}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {s.englishName}
                        </p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider bg-slate-800/60 md:bg-slate-100 md:dark:bg-slate-800 text-slate-400 md:text-slate-500 md:dark:text-slate-400 shrink-0">
                          {s.revelationType === 'Meccan' ? 'Makki' : 'Madani'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {s.englishNameTranslation} • {s.numberOfAyahs} ayahs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-arabic text-base font-bold shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {s.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}

            {filteredSurahs.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No Surah found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 2: VERSE LIST (Two-Column Split List)                    */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'verse' && (
          <div className="h-full flex divide-x divide-slate-800 md:divide-slate-200 md:dark:divide-slate-800 overflow-hidden">
            {/* Left Column: Surahs */}
            <div className="w-1/2 overflow-y-auto overscroll-contain p-1.5 space-y-0.5">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Surahs
              </p>
              {filteredSurahs.map((s) => {
                const isSelected = s.number === selectedSurahForVerses;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setSelectedSurahForVerses(s.number)}
                    className={`w-full px-2 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'text-slate-300 md:text-slate-700 md:dark:text-slate-300 hover:bg-slate-800 md:hover:bg-slate-100 md:dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">
                      {s.number}. {s.englishName}
                    </span>
                    <span className="text-[10px] opacity-70 shrink-0">
                      ({s.numberOfAyahs})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Verse numbers of the selected Surah */}
            <div className="w-1/2 overflow-y-auto overscroll-contain p-2">
              <div className="pb-2 border-b border-slate-800 md:border-slate-100 md:dark:border-slate-800 mb-2">
                <p className="text-xs font-bold text-white md:text-slate-900 md:dark:text-white truncate">
                  {verseSurahMeta.englishName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Select from {verseSurahMeta.numberOfAyahs} verses
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: verseSurahMeta.numberOfAyahs }, (_, i) => i + 1).map((vNum) => {
                  const isCurrentActive =
                    verseSurahMeta.number === currentSurahNumber && vNum === activeVerseNumber;
                  return (
                    <button
                      key={vNum}
                      type="button"
                      onClick={() =>
                        handleItemSelect(() => onSelectVerse(verseSurahMeta.number, vNum))
                      }
                      className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isCurrentActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 md:bg-slate-100 md:dark:bg-slate-800 hover:bg-slate-700 md:hover:bg-blue-50 md:hover:text-blue-600 md:dark:hover:bg-slate-700 text-slate-300 md:text-slate-700 md:dark:text-slate-300'
                      }`}
                    >
                      {vNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 3: JUZ LIST (All 30 Juz with start surah & ayah boundary) */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'juz' && (
          <div className="p-2 space-y-1">
            {filteredJuz.map((j) => {
              const isSelected = j.number === currentJuzNumber;
              return (
                <button
                  key={j.number}
                  type="button"
                  onClick={() => handleItemSelect(() => onSelectJuz(j.number))}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/25 md:bg-blue-50 md:dark:bg-blue-950/60 text-blue-400 md:text-blue-700 md:dark:text-blue-300 border border-blue-500/40 md:border-blue-200/80 md:dark:border-blue-900 shadow-2xs'
                      : 'hover:bg-slate-800/70 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/60 text-slate-200 md:text-slate-700 md:dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 md:bg-slate-100 md:dark:bg-slate-800 text-slate-400 md:text-slate-600 md:dark:text-slate-400'
                      }`}
                    >
                      {j.number}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">
                        Juz {j.number}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Starts: {j.startSurahName} : {j.startAyah} • Page {j.startPage}
                      </p>
                    </div>
                  </div>

                  <span className="font-arabic text-xs font-semibold text-slate-400 md:text-slate-500 md:dark:text-slate-400 shrink-0">
                    {j.nameArabic}
                  </span>
                </button>
              );
            })}

            {filteredJuz.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No Juz found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 4: PAGE LIST (All 604 Mushaf Pages + Direct Input)       */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'page' && (
          <div className="p-3 space-y-3 flex flex-col h-full overflow-hidden">
            {/* Direct Jump Input Card */}
            <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min="1"
                max="604"
                value={directPageInput}
                onChange={(e) => setDirectPageInput(e.target.value)}
                placeholder="Go directly to Page (1-604)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-800/90 md:bg-slate-50 md:dark:bg-slate-800 border border-slate-700 md:border-slate-200 md:dark:border-slate-700 text-white md:text-slate-900 md:dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
              >
                Go
              </button>
            </form>

            <div className="grid grid-cols-4 gap-1.5 flex-1 overflow-y-auto overscroll-contain pr-1">
              {filteredPages.map(({ page, surah }) => {
                const isSelected = page === currentPageNumber;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handleItemSelect(() => onSelectPage(page))}
                    className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-slate-800 md:bg-slate-100 md:dark:bg-slate-800 hover:bg-slate-700 md:hover:bg-blue-50 md:dark:hover:bg-slate-700 text-slate-300 md:text-slate-700 md:dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{page}</span>
                    <span className="text-[9px] opacity-70 truncate max-w-[58px]">
                      {surah.englishName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEWPORT (>= 768px): Sticky / Fixed Docked Drawer   */}
      {/* Positioned directly beneath top sticky navigation header       */}
      {/* position: sticky; top: 4rem; height: calc(100vh - 4rem);       */}
      {/* (or fixed left-0 top-16 bottom-0 z-40)                         */}
      {/* display: flex; flex-direction: column; overflow: hidden;       */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex self-start sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto flex-shrink-0 w-80 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 flex-col shadow-xs transition-all duration-300 ${className}`}
        style={
          layoutMode === 'fixed'
            ? {
                position: 'fixed',
                top: '1rem',
                bottom: '1rem',
                left: 0,
                width: '20rem',
                height: 'calc(100vh - 2rem)',
                maxHeight: 'calc(100vh - 2rem)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflowY: 'auto',
                zIndex: 40,
              }
            : {
                position: 'sticky',
                top: '1rem',
                height: 'calc(100vh - 2rem)',
                maxHeight: 'calc(100vh - 2rem)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                alignSelf: 'flex-start',
                zIndex: 30,
                width: '20rem',
              }
        }
      >
        {content}
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE VIEWPORT (< 768px): Full-Screen / Sliding Overlay    */}
      {/* fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95          */}
      {/* backdrop-blur-xl flex flex-col overflow-hidden                */}
      {/* Strictly above bottom navigation bar and below top header      */}
      {/* ============================================================== */}
      <div
        className="md:hidden fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden text-white shadow-2xl border-b border-slate-800 animate-in fade-in duration-200"
      >
        {content}
      </div>
    </>
  );
};
