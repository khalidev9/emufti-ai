import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Timer,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { KHATM_MANDATORY_QUIZ_QUESTIONS, QuranQuizQuestion } from '../../data/khatmQuranQuizData';
import {
  KhatmChallengeData,
  recordKhatmQuizResult,
  generateKhatmCertificatePdf,
} from '../../lib/khatmChallengeService';

interface KhitmaQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: KhatmChallengeData;
  userId: string;
  onResetChallenge: () => void;
  onSuccessPassed: () => void;
}

export const KhitmaQuizModal: React.FC<KhitmaQuizModalProps> = ({
  isOpen,
  onClose,
  challenge,
  userId,
  onResetChallenge,
  onSuccessPassed,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd'>>({});
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

  // Total questions = 10
  const questions: QuranQuizQuestion[] = KHATM_MANDATORY_QUIZ_QUESTIONS.slice(0, 10);
  const currentQuestion = questions[currentIdx];

  // Reset quiz on modal open
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setSelectedAnswers({});
      setTimeLeft(30);
      setIsCompleted(false);
      setScore(0);
    }
  }, [isOpen]);

  // 30 seconds timer per question
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired, advance to next question automatically
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCompleted, currentIdx, selectedAnswers]);

  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(30);
    } else {
      // Finish quiz and calculate score
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userChoice = selectedAnswers[q.id];
      const correctOption = q.options.find((opt) => opt.isCorrect);
      if (userChoice && correctOption && userChoice === correctOption.key) {
        correctCount += 1;
      }
    });

    const passed = correctCount >= 7;
    setScore(correctCount);
    setIsCompleted(true);
    recordKhatmQuizResult(userId, correctCount, passed);

    if (passed) {
      onSuccessPassed();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      await generateKhatmCertificatePdf(challenge);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setTimeLeft(30);
    setIsCompleted(false);
    setScore(0);
  };

  if (!isOpen) return null;

  const passed = score >= 7;
  const scorePercentage = Math.round((score / 10) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white my-8">
        {/* =========================================================================
            HEADER BAR
           ========================================================================= */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Imtixaanka Khatmka Qur'aanka (10 Su'aalood)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gudub imtixaanka (ugu yaraan 7/10) si aad u hesho Shahaadadaada PDF
              </p>
            </div>
          </div>

          {!isCompleted && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black border ${
                timeLeft <= 7
                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* =========================================================================
            ACTIVE QUIZ IN PROGRESS
           ========================================================================= */}
        {!isCompleted ? (
          <div className="space-y-6">
            {/* Question Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Su'aasha {currentIdx + 1} ee 10</span>
                <span>{Math.round(((currentIdx + 1) / 10) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Arabic Ayah Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-800/50 border border-blue-200/80 dark:border-blue-900/50 text-center space-y-3 shadow-xs">
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {currentQuestion.type === 'identify_surah'
                  ? 'Aqoonso Suuradda Aayadda'
                  : 'Maxaa ku xiga aayaddan?'}
              </span>

              <div
                dir="rtl"
                className="font-quran-uthmani text-xl sm:text-2xl text-slate-900 dark:text-amber-200 font-bold leading-relaxed px-2"
              >
                {currentQuestion.arabicAyah}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-xl mx-auto pt-1">
                {currentQuestion.somaliQuestion}
              </p>
            </div>

            {/* Options List: a, b, c, d */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.01]'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center uppercase shrink-0 ${
                        isSelected
                          ? 'bg-white text-blue-700'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold flex-1 pt-0.5 leading-snug">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next / Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Waqti go'an: 30 ilbiriqsi su'aal kasta
              </span>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentIdx === 9 ? 'Dhammee Imtixaanka' : "Su'aasha Xigta"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             QUIZ RESULTS: PASS OR FAIL FLOW
             ========================================================================= */
          <div className="space-y-6 text-center py-4">
            {passed ? (
              /* PASS FLOW: >= 7/10 */
              <div className="space-y-5">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HAMBALYO! WAAD GUULAYSATAY</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Natiijadaada: {score}/10 ({scorePercentage}%)
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Waxaad si guul leh ugu gudubtay imtixaanka Qur'aanka Kariimka adigoo keenay celcelis ka sarreeya 70%. Shahaadadaada rasmiga ah hadda waa furan tahay waadna degsan kartaa!
                  </p>
                </div>

                {/* Unlocked PDF Download Button */}
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Award className="w-4 h-4" />
                    <span>Shahaadada Khatmka oo leh Shaambada Rasmiga ah (Official Stamp)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isPdfGenerating ? 'Diyaarinaya...' : 'Degso Shahaadada PDF (Download Certificate)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FAIL FLOW: <= 6/10 */
              <div className="space-y-5">
                <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <XCircle className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>NATIIJADA: {score}/10 ({scorePercentage}%)</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                    Fadlan quraanka dib u muraajaceey
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Si aad u hesho Shahaadada Khatmka ee rasmiga ah, waxaad u baahan tahay inaad hesho ugu yaraan <strong>7 su'aalood oo sax ah</strong> (7/10). Fadlan dib u muraajaceey aayadaha oo mar kale isku day ama bilow khidmad cusub.
                  </p>
                </div>

                {/* Locked Certificate Warning */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Shahaadada PDF-ka ah hadda way xidhan tahay sababtoo ah imtixaanku ma guulaysan.</span>
                </div>

                {/* Action Buttons: Retake or Start New Khatma */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Isku Day Mar Kale (Retake Quiz)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetChallenge}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Bilow khidmad kale</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
