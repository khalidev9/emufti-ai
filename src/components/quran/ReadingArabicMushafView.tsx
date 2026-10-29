import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuranDotComVerse, QuranDotComChapter } from '../../lib/quranDotComService';
import { QuranWordItem } from './QuranWordItem';

interface ReadingArabicMushafViewProps {
  verses: QuranDotComVerse[];
  chapter: QuranDotComChapter | null;
  arabicFontSizeRem: number;
  translationFontSizeRem?: number;
  showWordByWordTranslation: boolean;
  showWordByWordTransliteration: boolean;
  onPlayWordAudio?: (audioUrl: string) => void;
  currentPageNumber: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  totalPages?: number;
  readingSubMode?: 'arabic' | 'translation';
  selectedTranslationName?: string;
}

export const ReadingArabicMushafView: React.FC<ReadingArabicMushafViewProps> = ({
  verses,
  chapter,
  arabicFontSizeRem,
  translationFontSizeRem = 1.0,
  showWordByWordTranslation,
  showWordByWordTransliteration,
  onPlayWordAudio,
  currentPageNumber,
  onPrevPage,
  onNextPage,
  totalPages = 604,
  readingSubMode = 'arabic',
  selectedTranslationName = 'Dr. Mustafa Khattab',
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Centered Reading Column (~600px on desktop: max-w-xl mx-auto) */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative transition-all">
        {/* Subtle Page Watermark Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400">
          <span>Surah {chapter?.name_simple || ''}</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Page {currentPageNumber}
          </span>
          <span className="font-arabic">{chapter?.name_arabic || ''}</span>
        </div>

        {/* Continuous Flow of Quranic Uthmani Text */}
        {readingSubMode === 'arabic' ? (
          <div
            className="text-center leading-[2.8] tracking-wide text-slate-900 dark:text-white select-text"
            dir="rtl"
          >
            {verses.map((verse) => (
              <React.Fragment key={verse.id}>
                {verse.words.map((word) => (
                  <QuranWordItem
                    key={word.id}
                    word={word}
                    arabicFontSizeRem={arabicFontSizeRem}
                    showWordByWordTranslation={showWordByWordTranslation}
                    showWordByWordTransliteration={showWordByWordTransliteration}
                    onPlayWordAudio={onPlayWordAudio}
                  />
                ))}
                {' '}
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* Translation Mode Flow */
          <div className="space-y-4 text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 pb-1 border-b border-slate-100 dark:border-slate-800">
              Translation: {selectedTranslationName}
            </div>
            {verses.map((verse) => {
              const trText = verse.translations?.[0]?.text?.replace(/<\/?[^>]+(>|$)/g, '') || '';
              return (
                <div key={verse.id} className="space-y-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 mr-2">
                    {verse.verse_key}
                  </span>
                  <p
                    className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans inline"
                    style={{ fontSize: `${translationFontSizeRem}rem` }}
                  >
                    {trText}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Page Number Footer with Previous / Next Page Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPageNumber <= 1}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Page</span>
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Page {currentPageNumber} of {totalPages}
          </span>

          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPageNumber >= totalPages}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
