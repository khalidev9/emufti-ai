import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Scroll,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Volume2,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { SOMALI_SCHOLARS_TAFSIR } from '../../data/tafsirData';
import {
  buildAuthenticSomaliVerseExplanation,
  fetchDynamicAyahTafsir,
  resolveSomaliVerseTranslation,
} from '../../lib/quranVerseExplanationEngine';

export type StudyDrawerTab =
  | 'tafsirs'
  | 'lessons'
  | 'reflections'
  | 'answers'
  | 'hadith'
  | 'related';

export interface QuranStudyActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: StudyDrawerTab;
  initialTab?: StudyDrawerTab;
  onSelectTab?: (tab: StudyDrawerTab) => void;
  verseKey?: string;
  surahNumber: number;
  surahName?: string;
  surahEnglishName?: string;
  ayahNumber: number;
  verseTextArabic?: string;
  arabicText?: string;
  translationText?: string;
  somaliTranslationText?: string;
  onOpenWeydiiEMufti?: (initialCategory?: string) => void;
  onAskEMufti?: (verseKey: string, arabicText: string, translationText: string) => void;
}

const renderFormattedInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-black dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderTafsirMarkdown = (content: string) => {
  if (!content) return null;
  const blocks = content.split('\n\n');

  return (
    <div className="space-y-3 font-sans text-slate-900 dark:text-slate-100">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings (### or #### or ##)
        if (trimmed.startsWith('#')) {
          const headerLevel = trimmed.match(/^#+/)?.[0].length || 3;
          const cleanText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4
              key={bIdx}
              className={`font-bold text-black dark:text-white ${
                headerLevel <= 3
                  ? 'text-sm sm:text-base mt-3 mb-1 text-slate-950 dark:text-white'
                  : 'text-xs sm:text-sm mt-2 mb-1 text-slate-900 dark:text-slate-100'
              }`}
            >
              {renderFormattedInline(cleanText)}
            </h4>
          );
        }

        // Blockquotes (> "...")
        if (trimmed.startsWith('>')) {
          const cleanQuote = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote
              key={bIdx}
              className="p-3 my-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-l-4 border-blue-600 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed"
            >
              {renderFormattedInline(cleanQuote)}
            </blockquote>
          );
        }

        // Bullet lists (- or *)
        if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 list-disc list-inside">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[-*]\s*/, '').trim();
                return (
                  <li key={lIdx} className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed">
                    {renderFormattedInline(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard body paragraph
        return (
          <p key={bIdx} className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed text-justify">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const QuranStudyActionDrawer: React.FC<QuranStudyActionDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  initialTab,
  onSelectTab,
  surahNumber,
  surahName,
  surahEnglishName,
  ayahNumber,
  verseTextArabic,
  arabicText,
  translationText = '',
  somaliTranslationText,
  onOpenWeydiiEMufti,
  onAskEMufti,
}) => {
  const [currentTab, setCurrentTab] = useState<StudyDrawerTab>(activeTab || initialTab || 'lessons');
  const [userNote, setUserNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [lessonsContent, setLessonsContent] = useState<string>('');

  const effectiveSomaliTranslation =
    somaliTranslationText ||
    resolveSomaliVerseTranslation(surahNumber, ayahNumber, translationText);
  const actualArabicText = verseTextArabic || arabicText || '';
  const actualTranslationText = effectiveSomaliTranslation || translationText || '';
  const actualSurahTitle = surahEnglishName || surahName || `Surah ${surahNumber}`;

  // Keep current tab in sync with incoming props
  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    } else if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [activeTab, initialTab, isOpen]);

  // Dynamically generate substantive Tafsiir and Lessons for this specific verse with zero empty states
  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

    if (isOpen) {
      setIsLoading(true);

      // Immediately render substantive authentic content first so user never waits with blank UI
      const immediateTafsir = buildAuthenticSomaliVerseExplanation(
        'Tafsiirka',
        surahNumber,
        actualSurahTitle,
        ayahNumber,
        actualArabicText,
        actualTranslationText
      );
      const immediateLessons = buildAuthenticSomaliVerseExplanation(
        'Faahfaahin',
        surahNumber,
        actualSurahTitle,
        ayahNumber,
        actualArabicText,
        actualTranslationText
      );
      setTafsirContent(immediateTafsir);
      setLessonsContent(immediateLessons);

      // Concurrently fetch dynamic AI Tafsir & Lessons via Gemini API
      Promise.allSettled([
        fetchDynamicAyahTafsir({
          surahNumber,
          surahName: actualSurahTitle,
          ayahNumber,
          arabicText: actualArabicText,
          translationText: actualTranslationText,
          category: 'Tafsiirka',
          signal: abortController.signal,
        }),
        fetchDynamicAyahTafsir({
          surahNumber,
          surahName: actualSurahTitle,
          ayahNumber,
          arabicText: actualArabicText,
          translationText: actualTranslationText,
          category: 'Faahfaahin',
          signal: abortController.signal,
        }),
      ]).then(([tafsirRes, lessonsRes]) => {
        if (!isCancelled) {
          if (tafsirRes.status === 'fulfilled' && tafsirRes.value) {
            setTafsirContent(tafsirRes.value);
          }
          if (lessonsRes.status === 'fulfilled' && lessonsRes.value) {
            setLessonsContent(lessonsRes.value);
          }
          setIsLoading(false);
        }
      });

      return () => {
        isCancelled = true;
        abortController.abort();
      };
    }
  }, [isOpen, surahNumber, ayahNumber, actualArabicText, actualTranslationText, actualSurahTitle]);

  const handleSelectTab = (tab: StudyDrawerTab) => {
    setCurrentTab(tab);
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  const triggerAskEMufti = (cat: string = 'Tafsiirka') => {
    if (onOpenWeydiiEMufti) {
      onOpenWeydiiEMufti(cat);
    } else if (onAskEMufti) {
      onAskEMufti(`${surahNumber}:${ayahNumber}`, actualArabicText, actualTranslationText);
    }
  };

  // Load saved reflections for this specific verse
  useEffect(() => {
    try {
      const key = `emufti_note_${surahNumber}_${ayahNumber}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setSavedNotes(JSON.parse(saved));
      } else {
        setSavedNotes([]);
      }
    } catch {
      setSavedNotes([]);
    }
  }, [surahNumber, ayahNumber]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNote.trim()) return;
    const key = `emufti_note_${surahNumber}_${ayahNumber}`;
    const next = [userNote.trim(), ...savedNotes];
    setSavedNotes(next);
    setUserNote('');
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2500);
  };

  const handleCopyVerse = () => {
    const text = `${verseTextArabic}\n\n"${translationText}"\n[Surah ${surahName} ${surahNumber}:${ayahNumber}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Frosted Glass Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Bottom Sheet Container (iOS Responsive) */}
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 border-l border-slate-200/80 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-right sm:slide-in-from-right duration-300">
        {/* iOS Mobile Drag Handle (Visible on small screens) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
              {surahNumber}:{ayahNumber}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Surah {surahName} — Ayah {ayahNumber}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scholarly Study, Tafsiir & Guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyVerse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Verse"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Verse Context Box */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 space-y-2">
          <div className="text-right text-base sm:text-lg font-arabic font-normal text-slate-900 dark:text-white leading-loose" dir="rtl">
            {actualArabicText}
          </div>
          {effectiveSomaliTranslation && (
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              <strong className="text-[10px] uppercase font-bold text-blue-500 mr-1.5">Soomaali:</strong>
              {effectiveSomaliTranslation}
            </p>
          )}
          {translationText && translationText !== effectiveSomaliTranslation && (
            <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
              <strong className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 mr-1.5">Tarjumaad:</strong>
              {translationText}
            </p>
          )}
        </div>

        {/* Segmented iOS Style Horizontal Tab Bar (Horizontally scrollable) */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleSelectTab('tafsirs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'tafsirs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tafsirs</span>
            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Not Available
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('lessons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'lessons'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Lessons</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('reflections')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'reflections'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reflections</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('answers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'answers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Answers</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('hadith')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'hadith'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Hadith</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('related')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'related'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Related</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: TAFSIRS */}
          {currentTab === 'tafsirs' && (
            <div className="space-y-4">
              {/* Not Available Status Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  <span>Lama heli karo xilligan • Not Available</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Qaybta Tafsiirka Aayadaha Xilligan Lama Heli Karo
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Qaybta Tafsiirka ee culimada Soomaaliyeed waxaa ku socda dib-u-habeyn iyo hubin dheeraad ah. Fadlan isticmaal tabs-ka kale ee firfircoon sida Lessons, Hadith, ama Reflections.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Somali Scholars Tafsiir
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-white dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                    Sugan
                  </span>
                </div>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  Sharaxaadda iyo tafsiirka aayaddan oo ay bixiyeen culimada waaweyn ee Soomaaliyeed.
                </p>
              </div>

              {/* Dynamic Verse-Specific Scholarly Tafsir */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Tafsiirka Aayadda ({actualSurahTitle} {surahNumber}:{ayahNumber})</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => triggerAskEMufti('Tafsiirka')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Weydii EMufti</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="space-y-2 animate-pulse py-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6" />
                  </div>
                ) : (
                  <div className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                    {renderTafsirMarkdown(tafsirContent)}
                  </div>
                )}
              </div>

              {/* Scholar Audio & Notes Cards */}
              <div className="space-y-3">
                {SOMALI_SCHOLARS_TAFSIR.map((scholar) => (
                  <div
                    key={scholar.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {scholar.nameEnglish}
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{scholar.specialty}</p>
                      </div>
                      <span className="font-arabic text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {scholar.nameArabic}
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                      {scholar.methodologySummary}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        Darsiga: Juz {Math.ceil(surahNumber / 4)}
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerAskEMufti('Tafsiirka')}
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>Weydii Tafsiirkan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Classical Tafsir Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tafsir Ibn Kathir (تفسير ابن كثير)
                </h5>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  Aayaddani waxay xambaarsan tahay aasaaska Tawxiidka iyo weyneynta Eebbe. Culimadu waxay isku raaceen in akhriskeedu uu keenayo naxariis iyo furfurnaan xagga Rabbiga ah.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LESSONS */}
          {currentTab === 'lessons' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">
                  Casharrada & Xikmadaha Aayadda ({actualSurahTitle} {surahNumber}:{ayahNumber})
                </h4>
                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                  Faa'iidooyinka cilmiga ah, xukunnada shareecada, iyo casharrada quluubta toosiya ee aayaddani ina barayso.
                </p>
              </div>

              {/* Dynamic Verse-Specific Lessons */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Duruusta & Xikmadaha Diiniga ah</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => triggerAskEMufti('Faahfaahin')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Weydii EMufti</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="space-y-2 animate-pulse py-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                  </div>
                ) : (
                  <div className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                    {renderTafsirMarkdown(lessonsContent)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REFLECTIONS */}
          {currentTab === 'reflections' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Tadabburka Aayadda (Reflections)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ku qor halkan fahamka iyo dareenka qalbigaaga ku soo dhacay markii aad aayaddan akhriday si aad mar dambe ugu noqoto.
                </p>
              </div>

              {/* Note composer form */}
              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Geli tadabburkaaga ama qoraal aad rabto inaad ku kaydsato aayaddan..."
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {noteSavedToast ? '✓ Qoraalka waa la kaydiyey!' : 'Waa mid kuu gaar ah (Private)'}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Kaydi Tadabburka
                  </button>
                </div>
              </form>

              {/* Saved Notes list */}
              {savedNotes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Qoraalladaadii hore ee Aayaddan ({savedNotes.length})
                  </h5>
                  {savedNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANSWERS */}
          {currentTab === 'answers' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider mb-1">
                  Su'aalaha & Jawaabaha Diiniga ah
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Su'aalaha badanaa la iska weydiiyo aayaddan iyo qodobada xukunka shareecada la xiriira.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Su'aal: Bismillahu ma aayad ka mid ah Al-Faatixa baa?
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Jawaab: Culimada qaarkood (sida Mad-habta Shaaficiyada) waxay qabaan inay tahay aayadda koowaad ee Al-Faatixa, halka culimo kale ay qabaan inay tahay bilowga suurad kasta marka laga reebo At-Tawbah.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Su'aal: Waa maxay farqiga u dhexeeya Ar-Raxmaan iyo Ar-Raxiim?
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Jawaab: Ar-Raxmaan waa Eebbe oo naxariistiisu tahay sifo guud oo koobaysa dhammaan khalqiga, halka Ar-Raxiim ay tahay naxariistiisa gaarka ah ee uu ku mannaysto adoomadiisa mu'miniinta ah.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAskEMufti('Faahfaahin')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Su'aal gaar ah ka weydii EMufti AI</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: HADITH */}
          {currentTab === 'hadith' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-1">
                  Axaadiista Sugan ee La Xiriirta Aayadda
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Axaadiis laga soo xigtay Kutubta Saxiixa ah ee iftiiminaya fadliga iyo macnaha aayaddan.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Sahih al-Bukhari (صحيح البخاري)</span>
                    <span>Xadiis #4474</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Nabigu (NNKH) wuxuu yidhi: "Suuratul Faatixa waa Ummul Qur'aan, waana toddobada soo noqnoqda (Sab'ul Mathaani), waana Qur'aanka weyn ee la i siiyey."
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Sahih Muslim (صحيح مسلم)</span>
                    <span>Xadiis #395</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Xadiis Qudsi ah oo Eebbe leeyahay: "Waxaan salaadda (Faatixada) u qaybiyey laba qaybood aniga iyo addoonkayga dhexdooda..."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RELATED */}
          {currentTab === 'related' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                  Aayadaha Mawduuc ahaan La Xiriira
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Aayadaha kale ee Qur'aanka Kariimka ah ee xambaarsan mawduuca, erayada, ama xikmadda la midka ah.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Surah Al-Hijr 15:87</span>
                    <span className="text-[10px] text-blue-600">Al-Mathaani</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-arabic" dir="rtl">
                    وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Surah Al-An'am 6:1</span>
                    <span className="text-[10px] text-blue-600">Al-Xamdu Lillaah</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-arabic" dir="rtl">
                    الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالأَرْضَ وَجَعَلَ الظُّلُمَاتِ وَالنُّورَ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Bottom Action: Weydii EMufti Trigger */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
            Ma u baahan tahay sharaxaad intaas ka badan?
          </div>
          <button
            type="button"
            onClick={() => triggerAskEMufti('Tafsiirka')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Weydii EMufti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
