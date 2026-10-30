// ==============================================================================
// EMUFTI AI — Protected Khatm Quran Certificate Page
// Strict Access Controls & LockScreen Verification Guard:
// 1. Checks active/completed Khatm status from Supabase (with offline fallback)
// 2. If not started: Redirects to /khitma with "Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub."
// 3. If failed (< 7/10): Displays locked screen with "Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale"
// 4. If duration not expired & not completed: Displays LockScreen with countdown/progress
// 5. If expired/completed but quiz not passed: Displays LockScreen prompting 10-question quiz
// 6. Only unlocked when: Duration timer expired/completed AND Quiz Passed (score >= 7/10)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Award,
  Download,
  ShieldCheck,
  Lock,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  KhatmChallengeData,
  getOrFetchKhatmChallenge,
  resetKhatmChallenge,
  isKhatmChallengeExpired,
  isKhatmCertificateUnlocked,
  generateKhatmCertificatePdf,
  getChallengeStats,
  TOTAL_PAGES,
  TOTAL_JUZ,
} from '../lib/khatmChallengeService';
import { KhitmaQuizModal } from '../components/khitma/KhitmaQuizModal';
import { KhatmCertificatePreview } from '../components/khitma/KhatmCertificatePreview';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Footer } from '../components/layout/Footer';

export const KhatmCertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const userId = user?.id || 'seeker_user';
  const defaultUserName = profile?.display_name || user?.email?.split('@')[0] || 'Seeker of Knowledge';

  // Component State Guard States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [challenge, setChallenge] = useState<KhatmChallengeData | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1. Fetch User's Active/Completed Khatm Status from Supabase & localStorage
  useEffect(() => {
    let isMounted = true;

    async function verifyKhatmStatus() {
      setIsLoading(true);
      try {
        const record = await getOrFetchKhatmChallenge(userId);
        if (!isMounted) return;

        if (!record || !record.isRegistered) {
          // If the user has NOT started any Khatm challenge:
          // Redirect immediately to Khatm Challenge start page with the required notice
          navigate('/khitma?notice=not_started', {
            replace: true,
            state: { notice: 'Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub.' },
          });
          return;
        }

        setChallenge(record);
      } catch (err) {
        console.error('Failed to verify Khatm status:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifyKhatmStatus();

    return () => {
      isMounted = false;
    };
  }, [userId, navigate]);

  // Handle Reset and Start Fresh Challenge on Failure
  const handleStartFreshChallenge = () => {
    resetKhatmChallenge(userId);
    navigate('/khitma?mode=new', { replace: true });
  };

  // Handle PDF Generation
  const handleDownloadPdf = async () => {
    if (!challenge) return;
    try {
      setIsPdfGenerating(true);
      setPdfSuccessMessage(null);
      await generateKhatmCertificatePdf(challenge);
      setPdfSuccessMessage('Shahaadada PDF si guul leh ayaa loo soo saaray!');
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Handle Copy Verification Link
  const handleCopyLink = () => {
    if (!challenge?.screenId) return;
    const url = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(challenge.screenId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 1: LOADING STATE (Fetching from Supabase & verifying status)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto animate-spin">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Hubinta Xaaladda Khatmka...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Waxaan xaqiijinaynaa diiwaankaaga Supabase iyo xaqa aad u leedahay Shahaadada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 2: NO ACTIVE KHATM CHALLENGE
  // (Redirecting fallback if navigation hasn't finished yet)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!challenge || !challenge.isRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-xl text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300">
              Weli ma aadan bilaabin Khatm.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Fadlan dooro oo bilow Khatm cusub si aad u hesho shahaadada khatmka Qur'aanka.
            </p>
          </div>
          <Link
            to="/khitma"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Bilow Khatm Cusub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 3: FAILED ATTEMPT HANDLING (< 7/10 score or isFailedSession)
  // Strict requirement: "Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale"
  // ─────────────────────────────────────────────────────────────────────────────
  const isFailed =
    challenge.isFailedSession ||
    challenge.status === 'failed' ||
    (challenge.quizScore !== undefined && challenge.quizScore < 7 && challenge.quizPassed === false);

  if (isFailed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/khitma"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ku Noqo Khitma</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 shadow-2xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Kalfadhigan Waa La Qufulay (Session Locked)</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 leading-snug">
                Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Buundadaada imtixaanka waxay ahayd{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {challenge.quizScore ?? 0}/10
                </strong>
                . Si aad u hesho Shahaadada Khatmka ee rasmiga ah, sharcigu wuxuu dhigayaa inaad keento ugu yaraan{' '}
                <strong>7/10</strong>. Kalfadhigan si buuxda ayaa loo qufulay.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Shahaadada lama soo saari karo kalfadhigan fashilmay awgeed.</span>
            </div>

            <button
              type="button"
              onClick={handleStartFreshChallenge}
              className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Samee khatm kale (Bilow Khatm Cusub)</span>
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 4: DURATION TIMER NOT EXPIRED AND CHALLENGE NOT COMPLETED
  // (Inaccessible LockScreen)
  // ─────────────────────────────────────────────────────────────────────────────
  const isExpired = isKhatmChallengeExpired(challenge);
  const isFinished = !!challenge.isCompleted;
  const stats = getChallengeStats(challenge);

  if (!isExpired && !isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/khitma/tasks"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ku Noqo Bogga Hawlaha (Tasks)</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Shahaadada Weli Waa Qufulan Tahay</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                Muddadii Khatmkaagu Weli Ma Dhammaan
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Shahaadada Khatmka ee rasmiga ah waxaad heli kartaa oo keliya marka aad dhammaysato dhammaan 604-ta bog ama muddadii aad dooratay ay si buuxda u dhammaato, ka dibna aad baasto imtixaanka 10-ka su'aalood (≥ 7/10).
              </p>
            </div>

            {/* Active Challenge Progress Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Horumarka Tartankaaga</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{stats.progressPercent}%</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Muddada</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{challenge.durationDays} Maalmood</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kalfadhiyada La Saxay</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{stats.completedSlotsCount} / {stats.totalSlots}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Taariikhda Bilowga</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{challenge.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dhammaadka La Qiyaasay</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{challenge.targetEndDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/khitma/tasks"
                className="w-full px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ku Noqo Bogga Hawlaha (Daily Tasks)</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 5: DURATION EXPIRED OR FINISHED, BUT EXAM NOT PASSED
  // (Prompt to take 10-Question Khatm Exam)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!challenge.quizPassed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/khitma"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ku Noqo Khitma</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-2xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muddadii Tartanka Waa Dhammaatay</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                Imtixaanka Khatmka Waa Qasab (Mandatory Exam)
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Muddadii aad u qorshaysay tartankaaga Khatmka waa dhammaatay ama waxaad akhriday 604-ta bog. Si aad u furto oo aad u hesho Shahaadadaada rasmiga ah oo leh Shaambadda, waa inaad gashaa oo aad baastaa imtixaanka 10-ka su'aalood adigoo keenaya ugu yaraan <strong>7/10</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">Xeerarka Imtixaanka:</p>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-left">
                <li>10 su'aalood oo ku saabsan Qur'aanka (Juz, Suuradaha, Bogagga)</li>
                <li>30 ilbiriqsi su'aal kasta</li>
                <li>Heerka baasitaanku waa ugu yaraan 7/10 (70%)</li>
                <li>Haddii aad keento wax ka yar 7/10, kalfadhigan waa la qufulayaa</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Award className="w-5 h-5" />
                <span>Bilow Imtixaanka Khatmka (10 Su'aalood)</span>
              </button>
            </div>
          </div>
        </main>

        {/* 10-Question Quiz Modal */}
        <KhitmaQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          challenge={challenge}
          userId={userId}
          onResetChallenge={handleStartFreshChallenge}
          onSuccessPassed={async () => {
            const updated = await getOrFetchKhatmChallenge(userId);
            if (updated) {
              setChallenge(updated);
            } else {
              setChallenge((prev) => (prev ? { ...prev, quizPassed: true, status: 'completed' } : null));
            }
            setIsQuizModalOpen(false);
          }}
        />

        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GUARD STATE 6: ALL CONDITIONS MET (Passed Quiz >= 7/10 AND Timer Expired/Finished)
  // RENDER OFFICIAL VERIFIED CERTIFICATE!
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/khitma"
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Ku Noqo Khitma"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Shahaadada Rasmiga ah ee Khatmka Qur'aanka
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/verify-certificate?id=${encodeURIComponent(challenge.screenId || '')}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Hubi Online</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Success Alert Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                Shahaado Rasmi ah oo La Xaqiijiyay • Verified
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Hambalyo! Shahaadadaada Khatmka Qur'aanka waa diyaar!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{isPdfGenerating ? 'Diyaarinaya...' : 'Degso PDF'}</span>
            </button>
          </div>
        </div>

        {pdfSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
        )}

        {/* Screen ID & Fast Verification Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Certificate Screen ID (Aqoonsiga Gaarka ah ee Shahaadada)
            </span>
            <div className="font-mono text-base sm:text-lg font-black text-blue-700 dark:text-blue-400 tracking-wider">
              {challenge.screenId || 'EMUFTI-KHATM-VERIFIED'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Waa la guriyay!' : 'Guri Link-ga Hubinta'}</span>
            </button>

            <Link
              to={`/verify-certificate?id=${encodeURIComponent(challenge.screenId || '')}`}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Bogga Hubinta</span>
            </Link>
          </div>
        </div>

        {/* 5. Live Exact Certificate Preview Card */}
        <div className="pt-2">
          <KhatmCertificatePreview
            challenge={challenge}
            userName={challenge.userName || defaultUserName}
            startDate={challenge.startDate}
            targetEndDate={challenge.targetEndDate}
            durationDays={challenge.durationDays}
            screenId={challenge.screenId}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isPdfGenerating}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KhatmCertificatePage;
