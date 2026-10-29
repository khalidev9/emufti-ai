import React, { useState } from 'react';
import {
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  FileText,
  MoreHorizontal,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Scroll,
  Layers,
  Sparkles,
  Headphones,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { QuranDotComVerse, QuranDotComChapter } from '../../lib/quranDotComService';
import { QuranWordItem } from './QuranWordItem';

/**
 * Cleans translation text by removing raw HTML tags,
 * footnote superscript markers, and digits stuck to words/punctuation
 * (e.g. "Allāh,1" -> "Allāh," and "Merciful.2" -> "Merciful.").
 */
export function cleanTranslationText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/([,.;:?!])\d+/g, '$1')
    .replace(/([\p{L}\p{M}])\d+(?=[,.;:?!]|\s|$)/gu, '$1')
    .replace(/\[\d+\]|\(\d+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface VerseByVerseViewProps {
  verses: QuranDotComVerse[];
  chapter: QuranDotComChapter | null;
  arabicFontSizeRem: number;
  translationFontSizeRem: number;
  showWordByWordTranslation: boolean;
  showWordByWordTransliteration: boolean;
  selectedTranslationName: string;
  activeVerseKey: string | null;
  isPlayingVerseKey: string | null;
  onPlayVerseAudio: (verseKey: string, verseNumber: number) => void;
  isVerseBookmarked: (verseKey: string) => boolean;
  onToggleBookmarkVerse: (verseKey: string, verseText: string) => void;
  onAskEMufti: (verseKey: string, verseText: string, translationText: string) => void;
  onOpenTafsir: (verseNumber: number) => void;
  onPlayWordAudio?: (audioUrl: string) => void;
  onOpenLessons?: (verseKey: string) => void;
  onOpenReciterSelector?: () => void;
  onOpenReflections?: (verseKey: string) => void;
  onOpenAnswers?: (verseKey: string) => void;
  onOpenHadith?: (verseKey: string) => void;
  onOpenRelatedContent?: (verseKey: string) => void;
  somaliTranslations?: Record<string, string>;
  showSomaliTranslation?: boolean;
  activeWordPosition?: number | null;
  onOpenComparison?: (verse: QuranDotComVerse, arabicText: string, somaliText: string, englishText: string) => void;
  onOpenCardGenerator?: (verse: QuranDotComVerse, arabicText: string, translationText: string) => void;
}

export const VerseByVerseView: React.FC<VerseByVerseViewProps> = ({
  verses,
  chapter,
  arabicFontSizeRem,
  translationFontSizeRem,
  showWordByWordTranslation,
  showWordByWordTransliteration,
  selectedTranslationName,
  activeVerseKey,
  isPlayingVerseKey,
  onPlayVerseAudio,
  isVerseBookmarked,
  onToggleBookmarkVerse,
  onAskEMufti,
  onOpenTafsir,
  onPlayWordAudio,
  onOpenLessons,
  onOpenReciterSelector,
  onOpenReflections,
  onOpenAnswers,
  onOpenHadith,
  onOpenRelatedContent,
  somaliTranslations = {},
  showSomaliTranslation = true,
  activeWordPosition = null,
  onOpenComparison,
  onOpenCardGenerator,
}) => {
  const [copiedVerseKey, setCopiedVerseKey] = useState<string | null>(null);
  const [openMoreMenuKey, setOpenMoreMenuKey] = useState<string | null>(null);

  const handleCopy = (verse: QuranDotComVerse) => {
    const arabicText = verse.words.map((w) => w.text_uthmani).join(' ');
    const rawTr = verse.translations?.[0]?.text || '';
    const cleanTr = cleanTranslationText(rawTr);
    const somaliText = somaliTranslations[verse.verse_key];
    const textToCopy = somaliText
      ? `${arabicText}\n\n"${cleanTr}"\n\nAf-Soomaali: "${somaliText}"\n[Surah ${chapter?.name_simple || ''} (${verse.verse_key})]`
      : `${arabicText}\n\n"${cleanTr}"\n[Surah ${chapter?.name_simple || ''} (${verse.verse_key})]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseKey(verse.verse_key);
    setTimeout(() => setCopiedVerseKey(null), 2000);
  };

  const handleShare = async (verse: QuranDotComVerse) => {
    const rawTr = verse.translations?.[0]?.text || '';
    const cleanTr = cleanTranslationText(rawTr);
    const shareData = {
      title: `Surah ${chapter?.name_simple || ''} ${verse.verse_key}`,
      text: `${verse.words.map((w) => w.text_uthmani).join(' ')}\n\n${cleanTr}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopy(verse);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
      {verses.map((verse, vIdx) => {
        const isActive = activeVerseKey === verse.verse_key;
        const isPlayingThis = isPlayingVerseKey === verse.verse_key;
        const isHighlighted = isPlayingThis || isActive;
        const bookmarked = isVerseBookmarked(verse.verse_key);
        const rawTr = verse.translations?.[0]?.text || '';
        const cleanTr = cleanTranslationText(rawTr);
        const somaliText = somaliTranslations[verse.verse_key];
        const arabicTextFull = verse.words.map((w) => w.text_uthmani).join(' ');

        return (
          <div
            key={verse.id}
            id={`verse-${verse.verse_key}`}
            className={`p-5 sm:p-6 transition-all duration-300 space-y-4 ${
              isHighlighted
                ? 'bg-blue-50/80 dark:bg-slate-800/70 border-t-2 border-blue-500 border-l-4 border-blue-600 rounded-xl px-4 sm:px-6 shadow-sm'
                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            {/* ========================================================== */}
            {/* TOP ROW OF VERSE                                          */}
            {/* Left: verse key (1:1), Play audio triangle (▷), Bookmark 🔖 */}
            {/* Right: Copy icon, Share icon, Reflection/Note icon, More ••• */}
            {/* ========================================================== */}
            <div className="flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center gap-2">
                {/* Verse Key Badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-colors ${
                    isHighlighted
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {verse.verse_key}
                </span>

                {/* Play Audio Button (Triangle ▷ / ▶) */}
                <button
                  type="button"
                  onClick={() => onPlayVerseAudio(verse.verse_key, verse.verse_number)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isPlayingThis
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/30'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isPlayingThis ? 'Pause recitation' : 'Play verse recitation'}
                  aria-label="Play verse"
                >
                  {isPlayingThis ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Bookmark Icon Button */}
                <button
                  type="button"
                  onClick={() => onToggleBookmarkVerse(verse.verse_key, arabicTextFull)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
                  aria-label="Bookmark verse"
                >
                  {bookmarked ? (
                    <BookmarkCheck className="w-4 h-4 fill-current text-amber-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Right Side: Copy, Share, Reflection/Note, More (•••) */}
              <div className="flex items-center gap-1">
                {/* Copy Icon */}
                <button
                  type="button"
                  onClick={() => handleCopy(verse)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy verse and translation"
                  aria-label="Copy verse"
                >
                  {copiedVerseKey === verse.verse_key ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Share Icon */}
                <button
                  type="button"
                  onClick={() => handleShare(verse)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Share verse"
                  aria-label="Share verse"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Reflection / Note Icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReflections) onOpenReflections(verse.verse_key);
                    else onAskEMufti(verse.verse_key, arabicTextFull, cleanTr);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Verse Reflection & Notes"
                  aria-label="Reflection and Notes"
                >
                  <FileText className="w-4 h-4" />
                </button>

                {/* More (•••) Icon Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMoreMenuKey(openMoreMenuKey === verse.verse_key ? null : verse.verse_key)
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="More actions"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openMoreMenuKey === verse.verse_key && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenTafsir(verse.verse_number);
                          setOpenMoreMenuKey(null);
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tafsiirka Aayadda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onAskEMufti(verse.verse_key, arabicTextFull, cleanTr);
                          setOpenMoreMenuKey(null);
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Weydii EMufti AI</span>
                      </button>

                      {onOpenComparison && (
                        <button
                          type="button"
                          onClick={() => {
                            const somali = somaliTranslations[verse.verse_key] || '';
                            onOpenComparison(verse, arabicTextFull, somali, cleanTr);
                            setOpenMoreMenuKey(null);
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>Isbarbardhig Tarjumada</span>
                        </button>
                      )}

                      {onOpenCardGenerator && (
                        <button
                          type="button"
                          onClick={() => {
                            const somali = somaliTranslations[verse.verse_key] || cleanTr;
                            onOpenCardGenerator(verse, arabicTextFull, somali);
                            setOpenMoreMenuKey(null);
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Samee Kaarka Aayadda</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* MIDDLE ROW OF VERSE                                       */}
            {/* Right-aligned crisp Uthmani Arabic with NORMAL word spacing */}
            {/* Interactive word-by-word hover tooltips                   */}
            {/* ========================================================== */}
            <div className="text-right py-1 leading-[2.6]" dir="rtl">
              <div className="inline-block select-text">
                {verse.words.map((word) => {
                  const isWordHighlighted = isPlayingThis && activeWordPosition === word.position && word.char_type_name !== 'end';
                  return (
                    <QuranWordItem
                      key={word.id}
                      word={word}
                      isHighlightedWord={isWordHighlighted}
                      arabicFontSizeRem={arabicFontSizeRem}
                      showWordByWordTranslation={showWordByWordTranslation}
                      showWordByWordTransliteration={showWordByWordTransliteration}
                      onPlayWordAudio={onPlayWordAudio}
                    />
                  );
                })}
              </div>
            </div>

            {/* ========================================================== */}
            {/* BOTTOM ROW OF VERSE                                       */}
            {/* Clean translation text + Somali translation alongside     */}
            {/* Responsive iOS horizontally-scrollable action bar         */}
            {/* ========================================================== */}
            <div className="pt-2 space-y-3">
              {/* Primary Translation Text (Footnote artifacts removed) */}
              <p
                className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-left"
                style={{ fontSize: `${translationFontSizeRem}rem` }}
              >
                {cleanTr || somaliText}
              </p>

              {/* Somali Translation (Mahmud Muhammad Abduh) - Only display secondary box when an English translation is active */}
              {showSomaliTranslation && somaliText && cleanTr !== somaliText && !selectedTranslationName.toLowerCase().includes('abduh') && !selectedTranslationName.toLowerCase().includes('somali') && (
                <div className="pt-2 pl-3.5 border-l-2 border-blue-300 dark:border-blue-700/60 bg-blue-50/30 dark:bg-blue-950/20 rounded-r-xl py-2 px-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-sans leading-relaxed text-left">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Af-Soomaali (Maxamuud M. Cabduh)
                    </span>
                  </div>
                  <p>{somaliText}</p>
                </div>
              )}

              {/* Horizontal Bar of Study Action Links (Mobile horizontally scrollable, single SVG icons, no wrapping) */}
              <div
                data-tour={vIdx === 0 ? 'verse-actions' : undefined}
                className="pt-2 flex overflow-x-auto no-scrollbar gap-2 py-1 px-1 whitespace-nowrap items-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 w-full max-w-full touch-pan-x"
              >
                {/* 0. ✨ Weydii EMufti (Prominent Blue Pill) */}
                <button
                  type="button"
                  onClick={() => onAskEMufti(verse.verse_key, arabicTextFull, cleanTr)}
                  data-tour="ask-emufti-verse-button"
                  data-testid="ask-emufti-verse-button"
                  className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
                  title="Weydii EMufti AI wax ku saabsan aayaddan"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Weydii EMufti</span>
                </button>

                {/* 1. Tafsirs */}
                <button
                  type="button"
                  onClick={() => onOpenTafsir(verse.verse_number)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/70 transition-colors font-medium cursor-pointer shrink-0 whitespace-nowrap"
                  title="Tafsirs (Not Available)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Tafsirs</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                    N/A
                  </span>
                </button>

                {/* 2. Lessons */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLessons) onOpenLessons(verse.verse_key);
                    else onAskEMufti(verse.verse_key, arabicTextFull, cleanTr);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/70 transition-colors font-medium cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Lessons</span>
                </button>

                {/* 3. Saved (Direct Verse Bookmark / Save) */}
                <button
                  type="button"
                  onClick={() => onToggleBookmarkVerse(verse.verse_key, arabicTextFull)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                    bookmarked
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/70 dark:border-slate-700/70'
                  }`}
                  title={bookmarked ? 'Aayaddan waa la kaydiyey (Remove from Saved)' : 'Keydi aayaddan (Save Verse)'}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Saved</span>
                </button>

                {/* 4. Dooro Qaari (Opens Reciter Selector Modal) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReciterSelector) {
                      onOpenReciterSelector();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/70 transition-colors font-medium cursor-pointer shrink-0 whitespace-nowrap"
                  title="Dooro Qaari (Choose Reciter)"
                >
                  <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Dooro Qaari</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
