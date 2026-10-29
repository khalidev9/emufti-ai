import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, ArrowRight, X, BookOpen, Clock, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TOTAL_VERIFIED_QUESTIONS } from '../../data/quizQuestions';

export const EMuftiQuizBanner: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('emufti_quiz_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('emufti_quiz_banner_dismissed', 'true');
  };

  if (isDismissed) {
    return null;
  }

  const isRtl = language === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative overflow-hidden mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-amber-950/20 border border-blue-500/30 dark:border-blue-500/25 shadow-xs transition-all hover:border-blue-500/40"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        {/* Left: Icon & Titles */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs ring-2 ring-blue-500/20">
            <Trophy className="w-5 h-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-800 dark:text-blue-300 font-mono">
                {t('quiz.title', 'EMUFTI QUIZ')}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {TOTAL_VERIFIED_QUESTIONS} Verified Questions Bank
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-foreground mt-1 leading-snug">
              {t('quiz.subtitle', 'Test your authentic Islamic knowledge across Quran, Hadith, Seerah, and Fiqh.')}
            </p>

            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Quran, Hadith, Seerah, Fiqh & Aqeedah
              </span>
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                3 Lifelines (50/50, +2m, Ask EMufti)
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Timed & Practice Modes
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-all transform active:scale-95 cursor-pointer"
          >
            <span>{t('quiz.start_quiz', 'Start Quiz')}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={t('common.close', 'Dismiss')}
            aria-label={t('common.close', 'Dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
