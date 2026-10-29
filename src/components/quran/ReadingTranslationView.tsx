import React, { useState } from 'react';
import { QuranDotComVerse, QuranDotComChapter, quranDotComService } from '../../lib/quranDotComService';
import { X, BookOpen } from 'lucide-react';

interface ReadingTranslationViewProps {
  verses: QuranDotComVerse[];
  chapter: QuranDotComChapter | null;
  translationFontSizeRem: number;
  selectedTranslationName: string;
}

export const ReadingTranslationView: React.FC<ReadingTranslationViewProps> = ({
  verses,
  chapter,
  translationFontSizeRem,
  selectedTranslationName,
}) => {
  const [activeFootnote, setActiveFootnote] = useState<{ id: number; text: string } | null>(null);
  const [loadingFootnoteId, setLoadingFootnoteId] = useState<number | null>(null);

  const handleFootnoteClick = async (footnoteId: number) => {
    setLoadingFootnoteId(footnoteId);
    try {
      const text = await quranDotComService.fetchFootnote(footnoteId);
      if (text) {
        setActiveFootnote({ id: footnoteId, text });
      }
    } finally {
      setLoadingFootnoteId(null);
    }
  };

  // Helper to parse footnote references like `<sup foot_note=195932>1</sup>`
  const renderFormattedTranslation = (text: string) => {
    // Replace <sup foot_note=123>1</sup> with an interactive element
    const parts: React.ReactNode[] = [];
    const regex = /<sup foot_note=(\d+)>(\d+)<\/sup>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const fnId = parseInt(match[1], 10);
      const fnNum = match[2];
      parts.push(
        <button
          key={`fn_${fnId}_${match.index}`}
          type="button"
          onClick={() => handleFootnoteClick(fnId)}
          className="inline-flex items-center justify-center text-[0.7em] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 rounded px-1 py-0.2 mx-0.5 align-super cursor-pointer transition-colors"
          title={`View footnote ${fnNum}`}
        >
          {loadingFootnoteId === fnId ? '...' : fnNum}
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      // Also clean up any other raw HTML safely
      parts.push(text.substring(lastIndex).replace(/<\/?[^>]+(>|$)/g, ''));
    }

    return parts;
  };

  return (
    <div className="w-full space-y-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 border border-slate-200/90 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-sm relative transition-all">
        {/* Header with Translation Name */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-stone-800 text-xs font-semibold text-slate-500 dark:text-stone-400">
          <span>Surah {chapter?.name_simple || ''}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            Translation: {selectedTranslationName}
          </span>
          <span>{chapter?.verses_count || ''} Verses</span>
        </div>

        {/* Centered Readable Continuous Paragraph Layout */}
        <div
          className="text-slate-800 dark:text-stone-200 leading-[2.2] tracking-normal space-y-4 select-text"
          style={{ fontSize: `${translationFontSizeRem}rem` }}
        >
          <p className="text-justify">
            {verses.map((verse) => {
              const trText = verse.translations?.[0]?.text || '';
              return (
                <span key={verse.id} className="inline mr-1.5">
                  <span className="inline-flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-[0.8em] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 select-none mr-1 align-baseline">
                    ({verse.verse_number})
                  </span>
                  <span>{renderFormattedTranslation(trText)}</span>{' '}
                </span>
              );
            })}
          </p>
        </div>

        {/* Footnote Modal / Callout */}
        {activeFootnote && (
          <div className="mt-8 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/60 dark:border-blue-900">
              <span className="font-bold text-blue-900 dark:text-blue-300">
                Footnote Reference
              </span>
              <button
                type="button"
                onClick={() => setActiveFootnote(null)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-700 dark:text-stone-300 leading-relaxed">
              {activeFootnote.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
