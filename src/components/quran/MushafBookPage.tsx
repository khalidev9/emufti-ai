import React, { useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { QuranDotComVerse, QuranDotComWord } from '../../lib/quranDotComService';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { ALL_30_JUZ } from '../../data/juzMetadata';
import { Surah } from '../../types/database';

export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
}

export type QuranFontSize = 'yar' | 'caadi' | 'weyn' | 'aad_u_weyn';

interface MushafBookPageProps {
  pageNumber: number;
  verses: QuranDotComVerse[];
  isLoading: boolean;
  currentSurah: Surah;
  fontSize: QuranFontSize;
  activeAyahKey: string | null;
  playingAyahKey: string | null;
  isPlayingAudio: boolean;
  onSelectAyah: (verseKey: string, ayahNum: number, surahNum: number) => void;
  onTogglePlayAudio: (verseKey?: string) => void;
  viewMode: 'text' | 'scanned';
  onToggleViewMode: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookmarkedKeys: Record<string, boolean>;
  onToggleBookmark: (surahNum: number, ayahNum: number) => void;
  onOpenTranslation: (verseKey: string) => void;
  onOpenTafsir: (verseKey: string) => void;
  onCopyAyah: (text: string, key: string) => void;
  copiedKey: string | null;
}

export const MushafBookPage: React.FC<MushafBookPageProps> = ({
  pageNumber,
  verses,
  isLoading,
  currentSurah,
  fontSize,
  activeAyahKey,
  playingAyahKey,
  isPlayingAudio,
  onSelectAyah,
  onTogglePlayAudio,
  viewMode,
  onToggleViewMode,
  onNextPage,
  onPrevPage,
  bookmarkedKeys,
  onToggleBookmark,
  onOpenTranslation,
  onOpenTafsir,
  onCopyAyah,
  copiedKey,
}) => {
  // Current Juz info based on page number
  const currentJuz = useMemo(() => {
    return ALL_30_JUZ.find((j) => pageNumber >= j.startPage && pageNumber <= j.endPage) || ALL_30_JUZ[0];
  }, [pageNumber]);

  // Group words into lines (1-15)
  const linesMap = useMemo(() => {
    const map = new Map<number, QuranDotComWord[]>();
    for (let i = 1; i <= 15; i++) {
      map.set(i, []);
    }

    verses.forEach((verse) => {
      verse.words.forEach((word) => {
        const lineNum = word.line_number || 1;
        if (!map.has(lineNum)) {
          map.set(lineNum, []);
        }
        map.get(lineNum)!.push(word);
      });
    });

    return map;
  }, [verses]);

  // Determine which surahs start on this page (and on which line)
  const surahStarts = useMemo(() => {
    const list: Array<{ surah: Surah; startLine: number }> = [];
    verses.forEach((verse) => {
      if (verse.verse_number === 1) {
        const [sNumStr] = verse.verse_key.split(':');
        const sNum = parseInt(sNumStr, 10);
        const meta = ALL_114_SURAHS.find((s) => s.number === sNum);
        const firstWord = verse.words[0];
        const line = firstWord?.line_number || 1;
        if (meta) {
          list.push({ surah: meta, startLine: line });
        }
      }
    });
    return list;
  }, [verses]);

  // Font size responsive classes
  const fontClass = {
    yar: 'text-lg sm:text-xl md:text-2xl leading-[2.2] sm:leading-[2.4]',
    caadi: 'text-xl sm:text-2xl md:text-3xl leading-[2.4] sm:leading-[2.6]',
    weyn: 'text-2xl sm:text-3xl md:text-4xl leading-[2.6] sm:leading-[2.8]',
    aad_u_weyn: 'text-3xl sm:text-4xl md:text-5xl leading-[2.8] sm:leading-[3.0]',
  }[fontSize];

  // Scanned image URL for King Fahd Complex Madinah Mushaf
  const paddedPage = String(pageNumber).padStart(3, '0');
  const scannedImageUrl = `https://files.quran.app/hafs/madani/width_1260/page${paddedPage}.png`;

  // Active Ayah details for floating pill
  const activeVerse = useMemo(() => {
    if (!activeAyahKey) return null;
    return verses.find((v) => v.verse_key === activeAyahKey) || null;
  }, [activeAyahKey, verses]);

  const activeVerseFullText = useMemo(() => {
    if (!activeVerse) return '';
    return activeVerse.words
      .filter((w) => w.char_type_name === 'word')
      .map((w) => w.text_uthmani)
      .join(' ');
  }, [activeVerse]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* ============================================================== */}
      {/* DESKTOP SIDE QUICK PAGE-TURN BUTTONS                            */}
      {/* ============================================================== */}
      <button
        type="button"
        onClick={onNextPage}
        disabled={pageNumber >= 604}
        className="hidden lg:flex fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 w-12 h-16 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/90 shadow-lg backdrop-blur-sm items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 z-20 group cursor-pointer"
        title="Bogga Xiga (Next Page)"
        aria-label="Bogga Xiga"
      >
        <div className="flex flex-col items-center gap-1">
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600">Xiga</span>
        </div>
      </button>

      <button
        type="button"
        onClick={onPrevPage}
        disabled={pageNumber <= 1}
        className="hidden lg:flex fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 w-12 h-16 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/90 shadow-lg backdrop-blur-sm items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 z-20 group cursor-pointer"
        title="Bogga Hore (Previous Page)"
        aria-label="Bogga Hore"
      >
        <div className="flex flex-col items-center gap-1">
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600">Hore</span>
        </div>
      </button>

      {/* ============================================================== */}
      {/* THE PRINTED MUSHAF BOOK PAGE CONTAINER                         */}
      {/* Warm Ivory Paper, Traditional Double Borders, Arabesque Corners */}
      {/* ============================================================== */}
      <div
        className="relative w-full bg-[#fdfbf7] dark:bg-[#1a1c1e] text-slate-900 dark:text-amber-50 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-amber-900/20 dark:border-amber-500/20 p-2 sm:p-5 md:p-7 select-text transition-all duration-300 min-h-[680px] sm:min-h-[880px] flex flex-col justify-between"
        style={{
          boxShadow: '0 20px 45px -10px rgba(80, 50, 20, 0.12), 0 0 0 1px rgba(180, 140, 90, 0.18)',
        }}
      >
        {/* Outer Ornamental Frame Line */}
        <div className="border border-amber-800/30 dark:border-amber-600/30 rounded-xl sm:rounded-2xl p-1 sm:p-2.5 flex-1 flex flex-col justify-between">
          {/* Inner Decorative Margin Frame */}
          <div className="border-2 border-amber-700/25 dark:border-amber-600/25 rounded-lg sm:rounded-xl p-2.5 sm:p-5 md:p-6 flex-1 flex flex-col justify-between relative">
            {/* Traditional Arabesque Corner Accents */}
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-amber-800/50 rounded-tr-sm pointer-events-none" />
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-amber-800/50 rounded-tl-sm pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-amber-800/50 rounded-br-sm pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-amber-800/50 rounded-bl-sm pointer-events-none" />

            {/* ------------------------------------------------------------ */}
            {/* TOP HEADER: Juz Name (Right), Surah (Center), Hizb (Left)     */}
            {/* ------------------------------------------------------------ */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 mb-2 sm:mb-4 border-b border-amber-800/20 dark:border-amber-600/20 text-xs sm:text-sm font-serif font-bold text-amber-900/80 dark:text-amber-200/90 select-none">
              {/* Right: Juz Indicator */}
              <div className="flex items-center gap-1.5" dir="rtl">
                <span className="text-[11px] sm:text-xs font-mono text-amber-700/70 dark:text-amber-400/80">الجزء</span>
                <span className="font-arabic font-bold text-xs sm:text-sm">{toArabicNumerals(currentJuz.number)}</span>
                <span className="text-[10px] text-amber-900/50 dark:text-amber-300/50 font-mono hidden sm:inline">
                  (Juz {currentJuz.number})
                </span>
              </div>

              {/* Center: Surah Name */}
              <div className="flex items-center gap-1.5" dir="rtl">
                <span className="font-arabic font-bold text-sm sm:text-base text-amber-950 dark:text-amber-100 tracking-wide">
                  سُورَةُ {currentSurah.arabicName || currentSurah.name}
                </span>
              </div>

              {/* Left: Hizb / Quarter Info */}
              <div className="flex items-center gap-1.5" dir="rtl">
                <span className="text-[11px] sm:text-xs font-mono text-amber-700/70 dark:text-amber-400/80">الحزب</span>
                <span className="font-arabic font-bold text-xs sm:text-sm">
                  {toArabicNumerals(Math.ceil(pageNumber / 10))}
                </span>
                <span className="text-[10px] text-amber-900/50 dark:text-amber-300/50 font-mono hidden sm:inline">
                  (Hizb {Math.ceil(pageNumber / 10)})
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* VIEW MODE: TEXT MUSHAF (DEFAULT) OR SCANNED HIGH-RES PAGE     */}
            {/* ------------------------------------------------------------ */}
            {viewMode === 'scanned' ? (
              <div className="relative flex-1 flex flex-col items-center justify-center p-1 sm:p-2">
                <img
                  src={scannedImageUrl}
                  alt={`Bogga ${pageNumber} ee Qur'aanka Kariimka ah`}
                  className="w-full max-h-[820px] object-contain rounded-md shadow-inner transition-opacity duration-300"
                  loading="eager"
                />
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center animate-pulse">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-amber-900/70 font-arabic text-center">
                  جَارٍ تَحْمِيلُ صَفْحَةِ القُرْآنِ الكَرِيمِ...
                  <br />
                  <span className="text-xs font-sans text-slate-500">Soo dejinaya bogga {pageNumber}...</span>
                </p>
              </div>
            ) : (
              /* ========================================================== */
              /* 15-LINE AUTHENTIC MADINAH MUSHAF PRINTED TEXT CANVAS        */
              /* ========================================================== */
              <div
                dir="rtl"
                className="flex-1 flex flex-col justify-between py-1 sm:py-2 select-text font-mushaf font-arabic text-center sm:text-justify"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((lineNum) => {
                  const lineWords = linesMap.get(lineNum) || [];

                  // Check if any surah starts on this line
                  const startingSurah = surahStarts.find((s) => s.startLine === lineNum);

                  return (
                    <React.Fragment key={lineNum}>
                      {/* Surah Decorative Title Banner & Bismillah if starting on this line */}
                      {startingSurah && (
                        <div className="my-3 sm:my-4 select-none" dir="rtl">
                          {/* Traditional Arabesque Surah Header Banner */}
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-100/80 via-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40 border-2 border-amber-700/40 dark:border-amber-600/40 p-2 sm:p-2.5 shadow-xs">
                            <div className="border border-dashed border-amber-600/30 rounded-lg py-1 px-3 sm:px-5 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                              <span className="font-arabic">
                                آيَاتُهَا {toArabicNumerals(startingSurah.surah.numberOfAyahs)}
                              </span>
                              <span className="font-arabic text-base sm:text-lg text-amber-950 dark:text-amber-100 font-bold tracking-wider">
                                سُورَةُ {startingSurah.surah.arabicName || startingSurah.surah.name}
                              </span>
                              <span className="font-arabic">
                                {startingSurah.surah.revelationType === 'Meccan' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}
                              </span>
                            </div>
                          </div>

                          {/* Bismillah Calligraphy (except Surah 9 At-Tawbah & Surah 1 Al-Fatihah where already ayah 1) */}
                          {startingSurah.surah.number !== 9 && startingSurah.surah.number !== 1 && (
                            <div className="text-center py-2 sm:py-3 font-mushaf text-amber-950 dark:text-amber-100 font-bold text-lg sm:text-xl md:text-2xl tracking-wide select-none">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </div>
                          )}
                        </div>
                      )}

                      {/* Line of Arabic Words (1 to 15) */}
                      {lineWords.length > 0 && (
                        <div
                          className={`w-full flex items-center justify-between gap-x-0.5 sm:gap-x-1 transition-colors ${fontClass}`}
                        >
                          {lineWords.map((word) => {
                            const isEndMarker = word.char_type_name === 'end';
                            const [sNumStr, aNumStr] = word.verse_key.split(':');
                            const sNum = parseInt(sNumStr, 10);
                            const aNum = parseInt(aNumStr, 10);
                            const isCurrentActive = activeAyahKey === word.verse_key;
                            const isCurrentPlaying = playingAyahKey === word.verse_key;

                            if (isEndMarker) {
                              return (
                                <span
                                  key={`end-${word.id || word.position}-${word.verse_key}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAyah(word.verse_key, aNum, sNum);
                                  }}
                                  className={`inline-flex items-center justify-center font-arabic px-1 mx-0.5 select-none transition-all cursor-pointer rounded-full text-[0.82em] ${
                                    isCurrentPlaying
                                      ? 'text-blue-700 bg-blue-100/90 font-bold scale-110 shadow-xs'
                                      : isCurrentActive
                                      ? 'text-amber-800 bg-amber-200/80 font-bold scale-105'
                                      : 'text-amber-800/80 hover:text-blue-600 hover:bg-amber-100/50'
                                  }`}
                                  title={`Aayad ${word.verse_key} — Riix si aad u doorato`}
                                >
                                  ۝{toArabicNumerals(aNum)}
                                </span>
                              );
                            }

                            return (
                              <span
                                key={`w-${word.id || word.position}-${word.location}`}
                                onClick={() => onSelectAyah(word.verse_key, aNum, sNum)}
                                className={`cursor-pointer transition-colors px-0.5 rounded-sm hover:bg-amber-100/70 dark:hover:bg-amber-900/30 ${
                                  isCurrentPlaying
                                    ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-bold rounded-sm'
                                    : isCurrentActive
                                    ? 'bg-amber-200/60 dark:bg-amber-800/40 text-amber-950 dark:text-amber-50 rounded-sm'
                                    : ''
                                }`}
                                title={`${word.verse_key} | ${word.translation?.text || ''}`}
                              >
                                {word.text_uthmani}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* BOTTOM FOOTER: Mushaf Page Number in Discreet Center Motif   */}
            {/* ------------------------------------------------------------ */}
            <div className="pt-2 sm:pt-3 mt-2 sm:mt-4 border-t border-amber-800/20 dark:border-amber-600/20 flex items-center justify-between text-xs font-mono font-bold text-amber-900/70 dark:text-amber-300/70 select-none">
              <span className="text-[11px] text-amber-800/60 hidden sm:inline">
                {currentSurah.name} ({currentSurah.englishName})
              </span>

              {/* Centered Page Number Motif */}
              <div className="flex items-center gap-1.5 mx-auto bg-amber-100/60 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/20">
                <span className="font-arabic font-bold text-sm text-amber-950 dark:text-amber-100">
                  — {toArabicNumerals(pageNumber)} —
                </span>
                <span className="text-[11px] font-mono text-amber-800/60 dark:text-amber-400/60">
                  ({pageNumber})
                </span>
              </div>

              {/* View Mode Quick Switch Button */}
              <button
                type="button"
                onClick={onToggleViewMode}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md text-amber-900/80 hover:bg-amber-100/70 transition-colors cursor-pointer border border-amber-800/20"
                title="Baddal Qaabka: Qoraal ama Sawir Daabacan"
              >
                {viewMode === 'text' ? <Eye className="w-3 h-3 text-blue-600" /> : <FileText className="w-3 h-3 text-amber-700" />}
                <span className="hidden sm:inline">{viewMode === 'text' ? 'Mushaf Daabacan' : 'Mushaf Qoraal'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FLOATING ACTION PILL FOR SELECTED AYAH                           */}
        {/* Appears smoothly when user clicks any ayah                      */}
        {/* ---------------------------------------------------------------- */}
        {activeVerse && (
          <div className="sticky bottom-3 left-0 right-0 mx-auto mt-4 max-w-lg w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900 p-2 sm:p-2.5 flex items-center justify-between gap-2 z-30 transition-all animate-in fade-in slide-in-from-bottom-2">
            {/* Ayah Badge */}
            <div className="flex items-center gap-2 pl-1">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {activeVerse.verse_number}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentSurah.name} {activeVerse.verse_key}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Bogga {pageNumber}</span>
              </div>
            </div>

            {/* Quick Actions: Play, Translate, Tafsir, Bookmark, Copy */}
            <div className="flex items-center gap-1">
              {/* Play Audio Toggle */}
              <button
                type="button"
                onClick={() => onTogglePlayAudio(activeVerse.verse_key)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isPlayingAudio && playingAyahKey === activeVerse.verse_key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isPlayingAudio && playingAyahKey === activeVerse.verse_key ? 'Hakad gal' : 'Dhageyso aayaddan'}
              >
                {isPlayingAudio && playingAyahKey === activeVerse.verse_key ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              {/* Translation Drawer Trigger */}
              <button
                type="button"
                onClick={() => onOpenTranslation(activeVerse.verse_key)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Turjumaad & Tafsiir"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Turjumaad</span>
              </button>

              {/* Tafsir Trigger */}
              <button
                type="button"
                onClick={() => onOpenTafsir(activeVerse.verse_key)}
                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Tafsiirka Aayadda"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Bookmark Toggle */}
              <button
                type="button"
                onClick={() => {
                  const [s, a] = activeVerse.verse_key.split(':').map(Number);
                  onToggleBookmark(s, a);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  bookmarkedKeys[activeVerse.verse_key]
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={bookmarkedKeys[activeVerse.verse_key] ? 'Ka saar kaydka' : 'Ku dar kaydka'}
              >
                {bookmarkedKeys[activeVerse.verse_key] ? (
                  <BookmarkCheck className="w-4 h-4 fill-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Copy Ayah */}
              <button
                type="button"
                onClick={() => onCopyAyah(activeVerseFullText, activeVerse.verse_key)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Nuqul ka qaado aayadda"
              >
                {copiedKey === activeVerse.verse_key ? (
                  <Check className="w-4 h-4 text-blue-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR FOR PAGE TURNING                   */}
      {/* ============================================================== */}
      <div className="flex lg:hidden items-center justify-between w-full mt-4 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
        <button
          type="button"
          onClick={onNextPage}
          disabled={pageNumber >= 604}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bogga Xiga ({pageNumber + 1})</span>
        </button>

        <div className="px-3 text-xs font-mono font-bold text-slate-500">
          {pageNumber} / 604
        </div>

        <button
          type="button"
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span>Bogga Hore ({pageNumber - 1})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
