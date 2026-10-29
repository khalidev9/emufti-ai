import React, { useState, useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { QuranDotComWord } from '../../lib/quranDotComService';

interface QuranWordItemProps {
  word: QuranDotComWord;
  isHighlightedWord?: boolean;
  arabicFontSizeRem?: number;
  showWordByWordTranslation?: boolean;
  showWordByWordTransliteration?: boolean;
  onPlayWordAudio?: (audioUrl: string) => void;
}

export const QuranWordItem: React.FC<QuranWordItemProps> = ({
  word,
  isHighlightedWord = false,
  arabicFontSizeRem = 2.0,
  showWordByWordTranslation = true,
  showWordByWordTransliteration = true,
  onPlayWordAudio,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<'top' | 'bottom'>('top');
  const [tooltipLeftOffset, setTooltipLeftOffset] = useState<number>(0);
  const wordRef = useRef<HTMLSpanElement | null>(null);

  // If verse end marker
  if (word.char_type_name === 'end') {
    return (
      <span
        className="inline-flex items-center justify-center font-arabic text-blue-600 dark:text-blue-400 font-bold mx-1.5 select-none text-[0.85em] align-middle"
        title={`Ayah End Marker ${word.text_uthmani || ''}`}
        aria-label={`Ayah ${word.text_uthmani || ''}`}
      >
        <span className="relative flex items-center justify-center">
          <span className="text-[1.2em]">۝</span>
          <span className="absolute text-[0.55em] font-sans font-bold text-slate-800 dark:text-slate-200 -mt-0.5">
            {word.text_uthmani || ''}
          </span>
        </span>
      </span>
    );
  }

  const isVisible = isHovered || isTapped;
  const hasWordData = Boolean(word.translation?.text || word.transliteration?.text);

  // Calculate viewport boundaries on hover/tap to prevent clipping
  useEffect(() => {
    if (isVisible && wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      // If too close to the top of the viewport (< 80px), display below
      if (rect.top < 80) {
        setTooltipPos('bottom');
      } else {
        setTooltipPos('top');
      }

      // If too close to left or right screen edge, clamp offset
      const centerX = rect.left + rect.width / 2;
      const windowWidth = window.innerWidth;
      if (centerX < 90) {
        setTooltipLeftOffset(90 - centerX);
      } else if (centerX > windowWidth - 90) {
        setTooltipLeftOffset(windowWidth - 90 - centerX);
      } else {
        setTooltipLeftOffset(0);
      }
    }
  }, [isVisible]);

  const handleWordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTapped(!isTapped);
    if (word.audio_url && onPlayWordAudio) {
      onPlayWordAudio(word.audio_url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsTapped(!isTapped);
      if (word.audio_url && onPlayWordAudio) {
        onPlayWordAudio(word.audio_url);
      }
    }
  };

  return (
    <span
      ref={wordRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onClick={handleWordClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${word.text_uthmani} - meaning: ${word.translation?.text || 'unknown'}, transliteration: ${word.transliteration?.text || 'none'}`}
      className={`relative inline-block transition-all duration-150 rounded-lg px-1 py-0.5 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isVisible
          ? 'bg-blue-600 text-white shadow-xs z-20'
          : isHighlightedWord
          ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-amber-400 font-bold ring-1 ring-blue-500/40 shadow-xs scale-[1.03]'
          : 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
      }`}
      style={{
        fontSize: `${arabicFontSizeRem}rem`,
        lineHeight: 1.8,
      }}
    >
      {/* Arabic text with Uthmani script */}
      <span className={`font-arabic tracking-wide inline-block ${isHighlightedWord ? 'font-bold' : 'font-normal'}`}>
        {word.text_uthmani}
      </span>

      {/* Interactive Tooltip (Dark Navy with blue accents) */}
      {isVisible && hasWordData && (
        <span
          className={`absolute z-50 left-1/2 min-w-[120px] max-w-[220px] pointer-events-none transform -translate-x-1/2 ${
            tooltipPos === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{ transform: `translateX(calc(-50% + ${tooltipLeftOffset}px))` }}
        >
          <span className="block bg-slate-900/95 dark:bg-black/95 text-white border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-2xl backdrop-blur-xs text-center text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Word Transliteration */}
            {showWordByWordTransliteration && word.transliteration?.text && (
              <span className="block text-[10px] font-mono text-blue-300 font-semibold tracking-wider">
                {word.transliteration.text}
              </span>
            )}

            {/* Verified Word English Meaning */}
            {showWordByWordTranslation && word.translation?.text && (
              <span className="block text-[11px] font-sans font-medium text-slate-100 leading-snug mt-0.5">
                {word.translation.text}
              </span>
            )}

            {/* Word location & audio indicator */}
            <span className="flex items-center justify-center gap-1 text-[9px] text-slate-400 mt-1 border-t border-slate-800 pt-0.5">
              <span>{word.location}</span>
              {word.audio_url && <Volume2 className="w-2.5 h-2.5 text-blue-400 shrink-0" />}
            </span>
          </span>
        </span>
      )}
    </span>
  );
};
