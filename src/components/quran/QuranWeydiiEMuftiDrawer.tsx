import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Info,
  Scroll,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { generateIslamicResponse } from '../../lib/gemini';
import { synthesizeSubstantiveResponse, retrieveIslamicSources } from '../../lib/islamicKnowledgeEngine';
import {
  AICategoryChip,
  buildAuthenticSomaliVerseExplanation,
  buildDynamicAyahTafsirPrompt,
  resolveSomaliVerseTranslation,
} from '../../lib/quranVerseExplanationEngine';

export type { AICategoryChip };
export { buildAuthenticSomaliVerseExplanation, buildDynamicAyahTafsirPrompt, resolveSomaliVerseTranslation };

export interface QuranWeydiiEMuftiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  surahEnglishName?: string;
  ayahNumber: number;
  verseTextArabic?: string;
  arabicText?: string;
  translationText: string;
  initialCategory?: AICategoryChip;
  userPlan?: string;
  onUpgradeClick?: () => void;
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

export const QuranWeydiiEMuftiDrawer: React.FC<QuranWeydiiEMuftiDrawerProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  surahEnglishName,
  ayahNumber,
  verseTextArabic,
  arabicText,
  translationText,
  initialCategory = 'Tafsiirka',
  userPlan = 'free',
  onUpgradeClick,
}) => {
  const isPaidUser = userPlan === 'pro' || userPlan === 'premium';
  const ASK_LIMIT = 2;
  const [askCount, setAskCount] = useState<number>(() => {
    try {
      const v = localStorage.getItem('emufti_quran_ask_emufti_count');
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  });

  const isLimitReached = !isPaidUser && askCount >= ASK_LIMIT;

  const [selectedCategory, setSelectedCategory] = useState<AICategoryChip>(initialCategory);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const actualArabicText = arabicText || verseTextArabic || '';
  const actualSurahTitle = surahEnglishName || surahName || `Surah ${surahNumber}`;
  const effectiveTranslation = resolveSomaliVerseTranslation(
    surahNumber,
    ayahNumber,
    translationText
  );

  // Sync initial category when opened
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Categories list per specification: 1. Tafsiirka, 2. Asbaabul Nuzuul, 3. Faahfaahin, 4. Others
  const CATEGORIES: {
    id: AICategoryChip;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'Tafsiirka', label: '1. Tafsiirka', sublabel: 'Tafsiirka & Macnaha', icon: BookOpen },
    { id: 'Asbaabul Nuzuul', label: '2. Asbaabul Nuzuul', sublabel: 'Sababta soo dagitaanka', icon: Scroll },
    { id: 'Faahfaahin', label: '3. Faahfaahin', sublabel: 'Xukunka & Casharrada', icon: Sparkles },
    { id: 'Others', label: '4. Others', sublabel: "Su'aal Gaar ah", icon: MessageSquare },
  ];

  // Generate explanation based on selected category or custom prompt
  const handleGenerate = async (category: AICategoryChip, questionText?: string) => {
    if (isLimitReached) {
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    const promptQuery = buildDynamicAyahTafsirPrompt({
      surahNumber,
      surahName: actualSurahTitle,
      ayahNumber,
      arabicText: actualArabicText,
      existingTranslation: effectiveTranslation,
      category,
      customQuestion: questionText,
    });

    try {
      // 1. Attempt generation via Gemini service with streaming if supported
      const res = await generateIslamicResponse({
        prompt: promptQuery,
        targetLanguage: 'so',
        answerLength: 'detailed',
        onChunk: (chunkText) => {
          if (chunkText) {
            setAiResponse(chunkText);
          }
        },
      });

      const responseContent = res?.content || (res as any)?.text || '';
      if (responseContent && responseContent.trim().length > 20) {
        let finalMarkdown = responseContent.trim();
        // Prevent empty Macnaha & Turjumaadda
        if (
          finalMarkdown.includes('**Macnaha & Turjumaadda:**\n""') ||
          finalMarkdown.includes('**Macnaha & Turjumaadda:** ""') ||
          finalMarkdown.includes('**Macnaha & Turjumaadda:**\n\n####')
        ) {
          finalMarkdown = finalMarkdown.replace(
            /\*\*Macnaha & Turjumaadda:\*\*(\s*""|\s*\n\s*""|\s*\n\s*\n\s*####)/,
            `**Macnaha & Turjumaadda:**\n"${effectiveTranslation}"\n\n####`
          );
        }
        setAiResponse(finalMarkdown);
      } else {
        // Substantive authentic Somali verse explanation fallback
        const fallbackText = buildAuthenticSomaliVerseExplanation(
          category,
          surahNumber,
          actualSurahTitle,
          ayahNumber,
          actualArabicText,
          effectiveTranslation,
          questionText
        );
        setAiResponse(fallbackText);
      }
    } catch {
      // Reliable fallback: always provide authentic Somali explanation so the user NEVER sees an empty screen
      const fallbackText = buildAuthenticSomaliVerseExplanation(
        category,
        surahNumber,
        actualSurahTitle,
        ayahNumber,
        actualArabicText,
        effectiveTranslation,
        questionText
      );
      setAiResponse(fallbackText);
    } finally {
      if (!isPaidUser) {
        setAskCount((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem('emufti_quran_ask_emufti_count', String(next));
          } catch {}
          return next;
        });
      }
      setIsLoading(false);
    }
  };

  // Automated trigger: When category pill is clicked, immediately trigger AI without manual typing
  const handleCategoryClick = (catId: AICategoryChip) => {
    setSelectedCategory(catId);
    if (catId === 'Others') {
      setCustomQuestion('');
      setTimeout(() => {
        customInputRef.current?.focus();
      }, 100);
    } else {
      setCustomQuestion('');
      if (!isLimitReached) {
        handleGenerate(catId);
      }
    }
  };

  // Auto-generate on initial open
  useEffect(() => {
    if (isOpen && selectedCategory !== 'Others' && !isLimitReached) {
      handleGenerate(selectedCategory);
    }
  }, [isOpen, surahNumber, ayahNumber, isLimitReached]);

  const handleSubmitCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    handleGenerate('Others', customQuestion);
  };

  const handleCopyResponse = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
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
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 border-l border-slate-200/80 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-right duration-300">
        {/* iOS Drag Handle for Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-blue-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Weydii EMufti AI
                </h2>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Ayah AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Surah {surahName} ({surahNumber}:{ayahNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPaidUser ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Bilaash: {Math.min(askCount, ASK_LIMIT)}/{ASK_LIMIT}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO UNLIMITED
              </span>
            )}
            {aiResponse && (
              <button
                type="button"
                onClick={handleCopyResponse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy Response"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
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

        {/* Selected Ayah Preview Box at Top */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 space-y-1.5">
          <div className="text-right text-base sm:text-lg font-arabic font-normal text-slate-900 dark:text-white leading-loose select-text" dir="rtl">
            {actualArabicText}
          </div>
          <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
            "{effectiveTranslation}"
          </p>
        </div>

        {/* Section A: 4 Automated Category Option Pills (No Manual Typing Required) */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dooro Qaybta (Instant AI Response • No Typing Required)
            </p>
            {isLoading && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Diyaarinaya...</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 border active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                  <span className="leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section B: Custom Question Input Field (Active ONLY when "Others" is selected) */}
        {selectedCategory === 'Others' && (
          <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 transition-colors animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <span className="text-blue-700 dark:text-blue-300 font-bold">
                4. Ama weydii su'aal gaar ah (Custom Question)
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-normal normal-case">
                Qor kadibna riix Weydii
              </span>
            </div>
            <form onSubmit={handleSubmitCustomQuestion} className="relative flex items-center gap-2">
              <input
                ref={customInputRef}
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ama weydii su'aal gaar ah oo ku saabsan aayaddan..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !customQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Weydii</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Section C: Live AI Response Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading && (
            <div className="space-y-3.5 py-2 animate-in fade-in duration-200" data-testid="weydii-loading-skeleton">
              {/* Skeleton Banner Header */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center animate-spin">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-40 bg-blue-200/80 dark:bg-blue-800/80 rounded-full animate-pulse" />
                    <div className="h-2 w-24 bg-blue-100 dark:bg-blue-900/50 rounded-full animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                  Diyaarinaya...
                </span>
              </div>

              {/* Skeleton Body Cards */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <div className="h-3.5 w-1/3 bg-blue-200 dark:bg-blue-900/60 rounded-full animate-pulse" />
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-2.5 w-11/12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-2.5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <div className="h-3.5 w-2/5 bg-blue-200 dark:bg-blue-900/60 rounded-full animate-pulse" />
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-2.5 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-2.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>

              {/* Skeleton Callout Quote */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-xl space-y-2">
                <div className="h-2.5 w-full bg-blue-200/60 dark:bg-blue-900/40 rounded-full animate-pulse" />
                <div className="h-2.5 w-2/3 bg-blue-200/60 dark:bg-blue-900/40 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {isLimitReached && (
            <div className="py-8 px-4 text-center space-y-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Xadka Weydii EMufti ee Bilaashka ah (2/2) waa Dhammaaday
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Dhammaan akhriska 114-ka Suuradood ee Qur'aanka iyo dhagaysiga 50-ka Qaari waa kuu bilaash aan xad lahayn! Laakiin faallada iyo weydiinta AI-ga ee "Ask EMufti", qorshaha bilaashka ah wuxuu leeyahay ugu badnaan 2 weydiin. Fadlan ku cusboonaysii Pro ama Premium si aad u hesho weydiimo aan xad lahayn.
                </p>
              </div>
              {onUpgradeClick && (
                <div className="pt-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={onUpgradeClick}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kor u Qaad Qorshaha (Upgrade to Pro)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLoading && !aiResponse && !isLimitReached && (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dooro mid ka mid ah qaybaha kore si aad u hesho sharaxaadda aayaddan.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate(selectedCategory)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Diyaari Sharaxaadda</span>
              </button>
            </div>
          )}

          {!isLoading && aiResponse && (
            <div className="space-y-3 text-xs leading-relaxed animate-in fade-in duration-200">
              {/* Blue Highlight Header Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">
                    Sharaxaadda: {selectedCategory} (Aayadda {surahNumber}:{ayahNumber})
                  </h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    Waxaa loo habeeyey si waafaqsan mabaadi'da Tafsiirka sugan ee Ahlus-Sunnah wal-Jamaacah.
                  </p>
                </div>
              </div>

              {/* Formatted Content with Crisp Dark/Black Body & Bold Headers */}
              <div className="space-y-3 text-slate-900 dark:text-slate-100 font-sans">
                {aiResponse.split('\n\n').map((para, pIdx) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  // Heading detection (###, ##, or ending with colon / numbered sections)
                  if (trimmed.startsWith('#') || trimmed.endsWith(':') || trimmed.startsWith('**1.') || trimmed.startsWith('**2.')) {
                    const headingText = trimmed.replace(/^#+\s*/, '');
                    return (
                      <h4 key={pIdx} className="font-bold text-black dark:text-white text-slate-950 dark:text-white text-sm sm:text-base mt-3 mb-1">
                        {renderFormattedInline(headingText)}
                      </h4>
                    );
                  }

                  // Callout detection
                  if (trimmed.toLowerCase().includes('xikmad') || trimmed.toLowerCase().includes('faa\'iido') || trimmed.toLowerCase().includes('ogow')) {
                    return (
                      <div key={pIdx} className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-900 dark:text-slate-100 my-2 font-medium">
                        {renderFormattedInline(trimmed)}
                      </div>
                    );
                  }

                  // Blockquotes (> ...)
                  if (trimmed.startsWith('>')) {
                    return (
                      <blockquote key={pIdx} className="p-3 my-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-l-4 border-blue-600 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed">
                        {renderFormattedInline(trimmed.replace(/^>\s*/, ''))}
                      </blockquote>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-slate-900 dark:text-slate-100 leading-relaxed text-justify">
                      {renderFormattedInline(trimmed)}
                    </p>
                  );
                })}
              </div>

              {/* Re-prompt Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                  Jawaabtu ma ku qancisay?
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerate(selectedCategory, customQuestion)}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Dib u weydii</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
