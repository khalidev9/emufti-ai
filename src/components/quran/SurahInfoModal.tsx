import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  MapPin,
  Layers,
  FileText,
  Star,
  CheckCircle2,
  Sparkles,
  Compass,
  Globe2,
  Info,
  Calendar,
} from 'lucide-react';
import { QuranDotComChapter, QuranDotComChapterInfo } from '../../lib/quranDotComService';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { getSurahOverview } from '../../data/surahOverviewData';

interface SurahInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: QuranDotComChapter | null;
  info: QuranDotComChapterInfo | null;
}

export const SurahInfoModal: React.FC<SurahInfoModalProps> = ({
  isOpen,
  onClose,
  chapter,
  info,
}) => {
  const [activeLang, setActiveLang] = useState<'so' | 'en'>('so');
  const [activeSection, setActiveSection] = useState<'overview' | 'themes' | 'virtues' | 'history'>('overview');

  const overview = useMemo(() => {
    if (!chapter) return null;
    return getSurahOverview(chapter.id, ALL_114_SURAHS);
  }, [chapter]);

  if (!isOpen || !chapter || !overview) return null;

  const isMeccan = (chapter.revelation_place || overview.revelationType).toLowerCase().includes('makk') || (chapter.revelation_place || overview.revelationType).toLowerCase().includes('mecc');
  const revPlaceTitle = isMeccan ? 'Makkah (Makkiyah)' : 'Madinah (Madaniyah)';
  const revPlaceBadgeSo = isMeccan ? 'Makkiyah (Makkah)' : 'Madaniyah (Madiina)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over / Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* ============================================================== */}
        {/* 1. HEADER                                                      */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Surah Number Box */}
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base shrink-0 shadow-2xs border border-blue-200/50 dark:border-blue-800/50">
              {chapter.id}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Surah {chapter.name_simple}
                </h3>
                <span className="font-arabic text-base sm:text-lg text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  {chapter.name_arabic}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {chapter.translated_name?.name || chapter.name_simple} • {isMeccan ? 'Meccan Revelation' : 'Medinan Revelation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector: Soomaali / English */}
            <div className="bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-full flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLang('so')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeLang === 'so'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Somali
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeLang === 'en'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BODY CONTENT                                                */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* A. REVELATION BADGE & REVELATION ORDER */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300">
                  {activeLang === 'so' ? 'Goobta Soo Degitaanka' : 'Place of Revelation'}
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {activeLang === 'so' ? revPlaceBadgeSo : revPlaceTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {activeLang === 'so'
                  ? `Soo degitaanka #${chapter.revelation_order || overview.revelationOrder}`
                  : `Revelation Order #${chapter.revelation_order || overview.revelationOrder}`}
              </span>
            </div>
          </div>

          {/* B. QUICK METADATA CARDS (Verses, Words, Juz, Mushaf Pages) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                {activeLang === 'so' ? 'Aayadaha' : 'Verses'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                {chapter.verses_count}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {activeLang === 'so' ? 'Aayadood' : 'Ayahs'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                {activeLang === 'so' ? 'Erayada' : 'Words'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                ~{overview.wordCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {activeLang === 'so' ? 'Eray' : 'Words'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                {activeLang === 'so' ? 'Juz-ka' : 'Juz Range'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block truncate">
                {overview.juzRange}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {activeLang === 'so' ? 'Qaybta Qur\'aanka' : 'Section'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                {activeLang === 'so' ? 'Bogagga' : 'Mushaf Pages'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 block truncate">
                {overview.pageRange}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {activeLang === 'so' ? 'Madina Mushaf' : 'Page Number'}
              </span>
            </div>
          </div>

          {/* C. NAVIGATION TABS FOR SECTIONS */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`pb-2 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{activeLang === 'so' ? 'Dulmar & Magaca' : 'Overview & Name'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('themes')}
              className={`pb-2 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'themes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{activeLang === 'so' ? 'Mawduucyada Waaweyn' : 'Core Themes'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('virtues')}
              className={`pb-2 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'virtues'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{activeLang === 'so' ? 'Fadliga & Axaadiista' : 'Virtues & Hadith'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className={`pb-2 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'history'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{activeLang === 'so' ? 'Asbaabta Soo Degitaanka' : 'Context & Background'}</span>
            </button>
          </div>

          {/* D. TAB CONTENT */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              {/* What it is about */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{activeLang === 'so' ? 'Dulmar & Nuxurka Suuradda' : 'What the Surah is About'}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {activeLang === 'so' ? overview.aboutSomali : overview.aboutEnglish}
                </p>
              </div>

              {/* Why it is named this */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeLang === 'so' ? 'Sababta Magaca loo bixiyay' : 'Why it is Named This'}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {activeLang === 'so' ? overview.namingReasonSomali : overview.namingReasonEnglish}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'themes' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {activeLang === 'so'
                    ? 'Waxay Suuraddu Ka Hadlayso (Mawduucyada Waaweyn)'
                    : 'Core Quranic Themes & Lessons'}
                </span>
              </div>
              <div className="space-y-2">
                {(activeLang === 'so' ? overview.mainThemesSomali : overview.mainThemesEnglish).map((theme, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {theme}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'virtues' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Star className="w-3.5 h-3.5" />
                <span>{activeLang === 'so' ? 'Fadliga Suuradda & Axaadiista' : 'Virtues, Blessings & Prophetic Hadith'}</span>
              </div>
              <div className="space-y-2.5">
                {(activeLang === 'so' ? overview.virtuesSomali : overview.virtuesEnglish).map((virtue, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed"
                  >
                    ⭐ {virtue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'history' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {activeLang === 'so'
                      ? 'Asbaabta Soo Degitaanka & Taariikhda'
                      : 'Historical Context & Circumstances of Revelation'}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {activeLang === 'so' ? overview.revelationContextSomali : overview.revelationContextEnglish}
                </p>
              </div>

              {/* Extra API background if available */}
              {info && info.text && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Scholarly Source Documentation
                  </span>
                  <div
                    className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-48 overflow-y-auto bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl [&>h2]:font-bold [&>h2]:text-slate-800 dark:[&>h2]:text-slate-200 [&>p]:mt-1"
                    dangerouslySetInnerHTML={{ __html: info.text }}
                  />
                  {info.source && (
                    <p className="text-[10px] text-slate-400 italic">
                      Source: {info.source}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. FOOTER                                                      */}
        {/* ============================================================== */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>EMufti AI Quranic Knowledge Base</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            {activeLang === 'so' ? 'Xir (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
