import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Info, ChevronDown, Check, Headphones } from 'lucide-react';
import { QuranDotComChapter, QuranDotComChapterInfo, VERIFIED_TRANSLATIONS, QuranDotComTranslation } from '../../lib/quranDotComService';
import { SurahInfoModal } from './SurahInfoModal';

interface SurahInfoBannerProps {
  chapter: QuranDotComChapter | null;
  chapterInfo: QuranDotComChapterInfo | null;
  isPlayingFullSurah: boolean;
  onTogglePlayFullSurah: () => void;
  readingSubMode?: 'arabic' | 'translation';
  onSelectReadingSubMode?: (mode: 'arabic' | 'translation') => void;
  selectedTranslationName?: string;
  isAudioLoading?: boolean;
  onSelectTranslation?: (translation: QuranDotComTranslation) => void;
  availableTranslations?: QuranDotComTranslation[];
  showReadingSubModeToggle?: boolean;
  onOpenReciterSelector?: () => void;
  selectedReciterName?: string;
}

export const SurahInfoBanner: React.FC<SurahInfoBannerProps> = ({
  chapter,
  chapterInfo,
  isPlayingFullSurah,
  onTogglePlayFullSurah,
  readingSubMode = 'arabic',
  onSelectReadingSubMode,
  selectedTranslationName = 'Dr. Mustafa Khattab',
  isAudioLoading = false,
  onSelectTranslation,
  availableTranslations = VERIFIED_TRANSLATIONS,
  showReadingSubModeToggle = false,
  onOpenReciterSelector,
  selectedReciterName,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTranslationMenuOpen(false);
      }
    }
    if (isTranslationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTranslationMenuOpen]);

  if (!chapter) return null;

  const isSomaliSelected =
    selectedTranslationName.toLowerCase().includes('abduh') ||
    selectedTranslationName.toLowerCase().includes('mahmud') ||
    selectedTranslationName.toLowerCase().includes('somali');

  const translationButtonLabel = isSomaliSelected
    ? 'Somali (Abduh)'
    : `${selectedTranslationName.split(' ')[0]} ${selectedTranslationName.split(' ')[1] || ''}`.trim();

  // Primary Somali translations
  const somaliTranslations = availableTranslations.filter(
    (t) => t.language_name === 'somali' || t.id === 46 || t.author_name.toLowerCase().includes('abduh')
  );
  if (somaliTranslations.length === 0) {
    somaliTranslations.push({
      id: 46,
      name: 'Mahmud Muhammad Abduh',
      author_name: 'Mahmud Muhammad Abduh',
      language_name: 'somali',
    });
  }

  // English translations
  const englishTranslations = availableTranslations.filter(
    (t) => t.language_name !== 'somali' && t.id !== 46 && !t.author_name.toLowerCase().includes('abduh')
  );

  const revelationText = chapter.revelation_place === 'makkah' ? 'Mecca' : 'Medina';
  const description =
    chapterInfo?.short_text ||
    `Read and listen to the full Surah ${chapter.name_simple} (Chapter ${chapter.id}), consisting of ${chapter.verses_count} verses. Revealed in ${revelationText}, it includes complete Arabic text with diacritics, translations, tafsirs, word-by-word meaning, and audio recitation.`;

  return (
    <div className="w-full space-y-4">
      {/* ============================================================== */}
      {/* SURAH INFO BANNER CARD (Quran.com layout)                      */}
      {/* ============================================================== */}
      <div className="rounded-2xl p-6 sm:p-7 mb-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-visible transition-all duration-200">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          {/* ========================================================== */}
          {/* LEFT SIDE: Calligraphy + Title + Subtitle + Description    */}
          {/* ========================================================== */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              {/* Large Arabic Calligraphy */}
              <span className="font-arabic text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 select-none">
                {chapter.name_arabic}
              </span>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {chapter.id}. Surah {chapter.name_simple}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {chapter.translated_name?.name || chapter.name_simple}
                </p>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {/* ========================================================== */}
          {/* RIGHT SIDE: Action Buttons & Translation Dropdown         */}
          {/* ========================================================== */}
          <div className="shrink-0 flex flex-col gap-2.5 sm:w-72">
            {/* Pill buttons: 2-button action grid (▶ Listen and ℹ Info) */}
            <div className="grid grid-cols-2 gap-2" data-tour="surah-actions">
              <button
                type="button"
                onClick={onTogglePlayFullSurah}
                data-tour="surah-listen-button"
                data-testid="surah-listen-button"
                className={`py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 truncate ${
                  isPlayingFullSurah
                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/30'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60'
                }`}
                title={isPlayingFullSurah ? 'Jooji codka suuradda (Pause recitation)' : 'Dhageyso suuradda oo dhan (Listen to full Surah)'}
                aria-label={isPlayingFullSurah ? 'Jooji codka suuradda (Pause recitation)' : 'Dhageyso suuradda oo dhan (Listen to full Surah)'}
              >
                {isAudioLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlayingFullSurah ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
                <span className="truncate">{isPlayingFullSurah ? 'Playing' : '▶ Listen'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInfoModalOpen(true)}
                data-tour="surah-info-button"
                data-testid="surah-info-button"
                className="py-2 px-3 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Xogta & Taariikhda Suuradda (Surah Information & Revelation context)"
                aria-label="Surah Information"
              >
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>ℹ Info</span>
              </button>
            </div>

            {/* Full-width pill dropdown button: Translation: Dr. Mustafa Khattab / Somali (Abduh) ⌄ */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsTranslationMenuOpen(!isTranslationMenuOpen)}
                className="w-full py-2 px-3 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                title="Dooro Turjumaadda Af-Soomaaliga ama Ingiriiska (Choose Somali or English Translation)"
                aria-haspopup="listbox"
                aria-expanded={isTranslationMenuOpen}
              >
                <span className="truncate pr-1">
                  Translation: <strong className="text-blue-600 dark:text-blue-400">{translationButtonLabel}</strong>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isTranslationMenuOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Translation Selection Dropdown (Floats outside and above card with z-50 and overflow-visible) */}
              {isTranslationMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-[420px] overflow-y-auto"
                  role="listbox"
                  aria-label="Quran translations"
                >
                  {/* Somali Translation Section Header (Primary) */}
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-between">
                    <span>Af-Soomaali (Somali)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                      🇸🇴 Somali
                    </span>
                  </div>

                  {somaliTranslations.map((tr) => {
                    const isSelected = isSomaliSelected;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => {
                          if (onSelectTranslation) onSelectTranslation(tr);
                          setIsTranslationMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base select-none leading-none">🇸🇴</span>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{tr.author_name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-semibold uppercase">
                                Primary
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Turjumaadda Af-Soomaaliga (Abduh)
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}

                  {/* English Translations Section Header */}
                  <div className="pt-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Select English Translation</span>
                    <span className="text-[10px] text-slate-400">English</span>
                  </div>

                  {englishTranslations.map((tr) => {
                    const isSelected =
                      !isSomaliSelected &&
                      (tr.author_name === selectedTranslationName || tr.name === selectedTranslationName);
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => {
                          if (onSelectTranslation) onSelectTranslation(tr);
                          setIsTranslationMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div>
                          <div className="font-bold">{tr.author_name}</div>
                          <div className="text-[10px] text-slate-400">{tr.name}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Optional Reading Sub-mode segmented pill (Arabic / Translation) */}
            {showReadingSubModeToggle && onSelectReadingSubMode && (
              <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full flex items-center border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => onSelectReadingSubMode('arabic')}
                  className={`flex-1 py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    readingSubMode === 'arabic'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Arabic
                </button>
                <button
                  type="button"
                  onClick={() => onSelectReadingSubMode('translation')}
                  className={`flex-1 py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    readingSubMode === 'translation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Translation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Surah Information Modal / Drawer */}
      <SurahInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        chapter={chapter}
        info={chapterInfo}
      />
    </div>
  );
};
