import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trophy,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Lock,
  AlertCircle,
  Download,
  PartyPopper,
  X,
  User,
  Award,
  Sun,
  Moon,
  Info,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  KhatmChallengeData,
  PrayerSlotKey,
  KHATM_DURATION_OPTIONS,
  TOTAL_PAGES,
  TOTAL_JUZ,
  PRAYER_SLOTS_DEF,
  getDayPlan,
  getKhatmChallenge,
  registerKhatmChallenge,
  getChallengeStats,
  calculateTargetEndDate,
  isPrayerSlotLocked,
  isDayLocked,
  togglePrayerSlot,
  formatSomaliDayOrdinal,
  generateKhatmCertificatePdf,
  generateAdminTestCertificatePdf,
  resetKhatmChallenge,
} from '../lib/khatmChallengeService';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { KhitmaRegistrationWizard } from '../components/khitma/KhitmaRegistrationWizard';
import { KhitmaQuizModal } from '../components/khitma/KhitmaQuizModal';
import { KhatmCertificatePreview } from '../components/khitma/KhatmCertificatePreview';
import { Footer } from '../components/layout/Footer';

export const KhitmaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isAdmin } = useAuth();
  const userId = user?.id || 'seeker_user';
  const defaultUserName = profile?.display_name || user?.email?.split('@')[0] || 'Seeker of Knowledge';

  // Read URL query parameters
  const durationParam = searchParams.get('duration');
  const initialDuration = durationParam ? parseInt(durationParam, 10) : 30;
  const viewParam = searchParams.get('view');

  // Active Challenge State
  const [challenge, setChallenge] = useState<KhatmChallengeData | null>(() => getKhatmChallenge(userId));

  // Check Registration State on Khitma Page Load:
  // If registered: automatically route to active Task Page ('tasks').
  // If NOT registered: display the 3-Step Registration Form ('wizard').
  const [viewMode, setViewMode] = useState<'tasks' | 'wizard'>(() => {
    return challenge?.isRegistered ? 'tasks' : 'wizard';
  });

  // Wizard & Setup Form values (kept for compatibility with legacy test suite assertions)
  const [name, setName] = useState<string>(() => challenge?.userName || defaultUserName);
  const [startDate, setStartDate] = useState<string>(() => challenge?.startDate || new Date().toISOString().split('T')[0]);
  const [selectedDuration, setSelectedDuration] = useState<number | 'others'>(() => {
    if ([30, 20, 15, 10, 7].includes(initialDuration)) return initialDuration;
    if (challenge?.durationDays && [30, 20, 15, 10, 7].includes(challenge.durationDays)) {
      return challenge.durationDays;
    }
    return 30;
  });
  const [customDays, setCustomDays] = useState<number>(() => {
    if (challenge?.durationDays && ![30, 20, 15, 10, 7].includes(challenge.durationDays)) {
      return challenge.durationDays;
    }
    return 25;
  });

  // UI Feedback States
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState<boolean>(false);
  const [immutableAlert, setImmutableAlert] = useState<string | null>(null);
  const [dailyCompletionNotice, setDailyCompletionNotice] = useState<string | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [isAdminTesting, setIsAdminTesting] = useState<boolean>(false);
  const [adminTestSuccess, setAdminTestSuccess] = useState<string | null>(null);

  // Sync state on user change & verify active registration
  useEffect(() => {
    const existing = getKhatmChallenge(userId);
    if (existing && existing.isRegistered) {
      setChallenge(existing);
      setName(existing.userName);
      setStartDate(existing.startDate);
      if ([30, 20, 15, 10, 7].includes(existing.durationDays)) {
        setSelectedDuration(existing.durationDays);
      } else {
        setSelectedDuration('others');
        setCustomDays(existing.durationDays);
      }
      // Registered user: automatically route straight to active Task Page
      setViewMode('tasks');
    } else {
      setChallenge(null);
      // Unregistered user: display 3-Step Registration Form
      setViewMode('wizard');
    }
  }, [userId]);

  // Effective days for calculation
  const effectiveDays = useMemo(() => {
    if (selectedDuration === 'others') {
      return Math.max(1, Math.min(365, customDays || 25));
    }
    return selectedDuration;
  }, [selectedDuration, customDays]);

  // Target completion date preview
  const previewTargetEnd = useMemo(() => {
    return calculateTargetEndDate(startDate, effectiveDays);
  }, [startDate, effectiveDays]);

  // Calculated daily pages & prayer session pages
  const calculatedDailyPages = useMemo(() => {
    return Math.ceil(TOTAL_PAGES / effectiveDays);
  }, [effectiveDays]);

  const calculatedPrayerPages = useMemo(() => {
    return Math.ceil(calculatedDailyPages / 5);
  }, [calculatedDailyPages]);

  // Challenge Stats
  const stats = useMemo(() => getChallengeStats(challenge), [challenge]);

  // Active day plan
  const dayPlan = useMemo(() => {
    return getDayPlan(selectedDay, challenge?.durationDays || effectiveDays);
  }, [selectedDay, challenge, effectiveDays]);

  // Check if all 5 slots for the selected day are completed
  const isSelectedDayAllCompleted = useMemo(() => {
    if (!challenge) return false;
    return dayPlan.slots.every((slot) => challenge.completedSlots[`day_${selectedDay}_${slot.key}`]);
  }, [challenge, dayPlan, selectedDay]);

  // Handle slot toggle with strict sequential and day locking
  const handleSlotToggle = (slotKey: PrayerSlotKey) => {
    if (!challenge) return;

    if (challenge.isFailedSession) {
      setImmutableAlert('Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale.');
      setTimeout(() => setImmutableAlert(null), 4000);
      return;
    }

    if (isDayLocked(challenge.startDate, selectedDay)) {
      setImmutableAlert('Maalintani weli ma soo gaarin! Waxaad calaamadayn kartaa oo kaliya maalmaha furmay.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    const slotId = `day_${selectedDay}_${slotKey}`;
    if (challenge.completedSlots[slotId]) {
      setImmutableAlert('Kalfadhigan mar hore ayaa la xaqiijiyay oo si joogto ah u xidhan (Permanent). Lama beddeli karo.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    const lockCheck = isPrayerSlotLocked(challenge, selectedDay, slotKey);
    if (lockCheck.isLocked) {
      setImmutableAlert(lockCheck.reason || 'Waa in aad salaadaha u akhrisaa si xiriir ah (Sequential Locking).');
      setTimeout(() => setImmutableAlert(null), 4000);
      return;
    }

    const res = togglePrayerSlot(userId, selectedDay, slotKey);
    if (res.error) {
      setImmutableAlert(res.error);
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    setChallenge(res.challenge);

    // Exact congratulatory daily message: "Hambalyo dadaalkaada maalinta [1aad / 2aad / 3aad...]"
    if (res.dailyCompletedNow) {
      const dayOrdinal = formatSomaliDayOrdinal(selectedDay);
      setDailyCompletionNotice(`Hambalyo dadaalkaada maalinta ${dayOrdinal}!`);
      setTimeout(() => setDailyCompletionNotice(null), 7000);
    }

    if (res.challenge.isCompleted) {
      setIsCelebrationOpen(true);
    }
  };

  // Quick check off today's next sequential slot on the active day
  const handleCheckOffToday = () => {
    if (!challenge) return;

    if (challenge.isFailedSession) {
      setImmutableAlert('Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale.');
      setTimeout(() => setImmutableAlert(null), 4000);
      return;
    }

    const currentActiveDay = stats.currentAllowedDay || 1;

    if (selectedDay !== currentActiveDay) {
      setSelectedDay(currentActiveDay);
    }

    const order: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let nextPendingSlot: PrayerSlotKey | null = null;
    for (const key of order) {
      if (!challenge.completedSlots[`day_${currentActiveDay}_${key}`]) {
        nextPendingSlot = key;
        break;
      }
    }

    if (!nextPendingSlot) {
      setImmutableAlert('Dhammaan 5-ta kalfadhi ee maanta mar hore ayaa la wada xaqiijiyay! 🔒');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    const res = togglePrayerSlot(userId, currentActiveDay, nextPendingSlot);
    if (res.error) {
      setImmutableAlert(res.error);
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    setChallenge(res.challenge);

    if (res.dailyCompletedNow) {
      const dayOrdinal = formatSomaliDayOrdinal(currentActiveDay);
      setDailyCompletionNotice(`Hambalyo dadaalkaada maalinta ${dayOrdinal}!`);
      setTimeout(() => setDailyCompletionNotice(null), 7000);
    }

    if (res.challenge.isCompleted) {
      setIsCelebrationOpen(true);
    }
  };

  // Handle PDF Download (checks if mandatory quiz has been passed)
  const handleDownloadPdf = async () => {
    if (!challenge || !challenge.isCompleted) return;

    if (!challenge.quizPassed) {
      // Must pass mandatory 10-question Quranic Quiz first!
      setIsCelebrationOpen(false);
      setIsQuizModalOpen(true);
      return;
    }

    try {
      setIsPdfGenerating(true);
      await generateKhatmCertificatePdf(challenge);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Handle Admin Sample PDF Test
  const handleAdminTestSample = async () => {
    try {
      setIsAdminTesting(true);
      const res = await generateAdminTestCertificatePdf('Admin Tester', 30);
      setAdminTestSuccess(`Shahaadada tijaabada ah waa la soo saaray! Screen ID: ${res.screenId}`);
      setTimeout(() => setAdminTestSuccess(null), 6000);
    } catch (err) {
      console.error('Failed to generate admin test PDF:', err);
    } finally {
      setIsAdminTesting(false);
    }
  };

  // Reset or Start New Khatma ("Bilow khidmad kale")
  const handleResetKhatm = () => {
    resetKhatmChallenge(userId);
    setChallenge(null);
    setIsCelebrationOpen(false);
    setIsQuizModalOpen(false);
    setViewMode('wizard');
    navigate('/khitma', { replace: true });
  };

  // Redirect to Task Page Post-Submission
  const handleWizardCompleted = (newCh: KhatmChallengeData) => {
    setChallenge(newCh);
    setViewMode('tasks');
    setSelectedDay(1);
    navigate('/khitma/tasks', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for direct registration (supports legacy form call)
  const handleRegister = (customName?: string, customStart?: string, customDuration?: number) => {
    const reg = registerKhatmChallenge(
      userId,
      customName || name,
      customStart || startDate,
      customDuration || effectiveDays
    );
    setChallenge(reg);
    setViewMode('tasks');
    return reg;
  };

  /* =========================================================================
     KHITMA REGISTRATION SPECIFICATION & OPTIONS:
     - Full Name (Magaca / Magacaaga Rasmiga ah)
     - Start Date (Taariikhda uu bilaabayo / Taariikhda Bilaabashada)
     - End Date (Taariikhda dhamaynaysid)
     - Dooro Muddada Khatmka:
       * 1 Bil (Month) • 1 Bil (30 M)
       * 3 Weeks (20 Maalmood / 20 Days)
       * 2 Weeks (15 Days)
       * 10 Days
       * 7 Days
       * Others (Kale) (customDays)
     - Hagaha Maalinlaha ah ee Qorshaha Khitmada (Daily Breakdown Guide)
     ========================================================================= */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden box-border transition-colors">
      {/* =========================================================================
          1. TOP NAVIGATION HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs w-full max-w-full box-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back to Quran and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/quran')}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Ku noqo Qur'aanka (Back to Quran)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Qur'aanka</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                خ
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate block max-w-[125px] min-[400px]:max-w-[170px] sm:max-w-none">
                  Khitma <span className="hidden min-[400px]:inline">— Tartanka Khatmka</span>
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block sm:hidden truncate">
                  604 Bog • 5 Salaadood
                </span>
              </div>
            </div>
          </div>

          {/* Right: Challenge Locked Status, Admin Test PDF, and Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {challenge?.isRegistered ? (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[10px] sm:text-[11px] font-black text-blue-700 dark:text-blue-300 shadow-2xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="hidden md:inline">Bogga Hawlaha (Task Page) • </span>
                <span className="hidden sm:inline">Qorshaha Waa La Qufulay 🔒</span>
                <span className="sm:hidden font-bold">Qufulan 🔒</span>
              </div>
            ) : null}

            {/* Quick jump to Certificate Preview */}
            <a
              href="#certificate-preview-section"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-all cursor-pointer"
              title="Eeg Muuqaalka Shahaadada (Certificate Preview)"
            >
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Shahaadada</span>
            </a>

            {/* Admin Test Sample PDF trigger - Strictly restricted to Authenticated Admins only */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminTestSample}
                disabled={isAdminTesting}
                title="Tijaabi Soo Saaridda Shahaadada PDF (Admin Test Tool)"
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden md:inline">{isAdminTesting ? 'Diyaarinaya...' : 'Admin Test PDF'}</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT AREA
         ========================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6 overflow-x-hidden">
        {/* Alerts & Feedback */}
        {adminTestSuccess && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>{adminTestSuccess}</span>
            </div>
            <Link
              to="/verify-certificate"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer text-center"
            >
              Xaqiiji Online
            </Link>
          </div>
        )}

        {immutableAlert && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{immutableAlert}</span>
          </div>
        )}

        {/* Congratulatory Daily Message: "Hambalyo dadaalkaada maalinta [1aad / 2aad / 3aad...]" */}
        {dailyCompletionNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white text-xs sm:text-sm font-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg shadow-emerald-500/20 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-white shrink-0 animate-bounce" />
              <span>{dailyCompletionNotice}</span>
            </div>
            <span className="text-[11px] sm:text-xs bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
              5/5 Salaadood La Saxay
            </span>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: 3-STEP KHATMA REGISTRATION FORM WIZARD
            - Unregistered users: Clean 3-step registration wizard
            - Registered users: Permanently locked (read-only) with direct link to tasks
           ========================================================================= */}
        {viewMode === 'wizard' && !challenge?.isRegistered ? (
          <KhitmaRegistrationWizard
            userId={userId}
            defaultName={name}
            isLocked={false}
            onRegistered={handleWizardCompleted}
          />
        ) : viewMode === 'wizard' && challenge?.isRegistered ? (
          <KhitmaRegistrationWizard
            userId={userId}
            defaultName={name}
            isLocked={true}
            registeredChallenge={challenge}
            onNavigateToTasks={() => setViewMode('tasks')}
            onRegistered={handleWizardCompleted}
            onCancel={() => setViewMode('tasks')}
          />
        ) : (
          /* =========================================================================
              VIEW 2: DEDICATED TASK PAGE & DAILY 5-PRAYER TICKING
             ========================================================================= */
          <div className="space-y-6 animate-in fade-in">
            {/* FAILED KHATM SESSION NOTICE & RESET LOCK */}
            {challenge?.isFailedSession && (
              <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 text-center space-y-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-xl font-black text-rose-700 dark:text-rose-300">
                    Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Kalfadhigan Khatmka si buuxda ayaa loo xidhay maadaama buundada imtixaankaagu ka yaraatay 7/10. Si aad mar kale u hesho fursad shahaado, fadlan bilow khatm cusub.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetKhatm}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Samee khatm kale (Bilow Khatm Cusub)</span>
                </button>
              </div>
            )}
            {/* 1. ONBOARDING EXPLANATION GUIDE (DETAILING PROGRAM & REQUIRED QUOTA PER PRAYER) */}
            {!isOnboardingDismissed && (
              <div className="relative overflow-hidden p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800/60 shadow-lg space-y-4">
                <button
                  type="button"
                  onClick={() => setIsOnboardingDismissed(true)}
                  className="absolute right-3 sm:right-4 top-3 sm:top-4 p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
                  title="Xidh Hagaha"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pr-8 sm:pr-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>HAGAHA BARNAAMIJKA KHITMADA (ONBOARDING GUIDE)</span>
                  </span>
                </div>

                <div className="space-y-2 max-w-2xl pr-8 sm:pr-0">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    Ku soo dhowow Bogga Hawlaha Khitmada (Task Page)!
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                    Barnaamijkan waxaad ku dhammaystiri doontaa dhammaan 604-ta bog ee Qur'aanka Kariimka adigoo maalin kasta akhrinaya qayb cayiman oo loo qaybiyay 5-taada salaadood.
                  </p>
                </div>

                {/* Quota Breakdown Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                    <span className="text-[10px] text-blue-200 font-bold uppercase block">Qoondada Maalinlaha ah</span>
                    <span className="text-base font-black text-white block">
                      {calculatedDailyPages} Bog / Maalin
                    </span>
                    <span className="text-[11px] text-blue-200 block">
                      Guud ahaan 604 bog oo loo qaybiyay {challenge?.durationDays || effectiveDays} maalmood.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                    <span className="text-[10px] text-blue-200 font-bold uppercase block">Qoondada Salaad Kasta</span>
                    <span className="text-base font-black text-amber-300 block">
                      ~{calculatedPrayerPages} Bog / Salaad
                    </span>
                    <span className="text-[11px] text-blue-200 block">
                      Akhri ~{calculatedPrayerPages} bog salaad kasta kadib (Fajr, Dhuhr, Asr, Maghrib, Isha).
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                    <span className="text-[10px] text-blue-200 font-bold uppercase block">Nidaamka Qufulka</span>
                    <span className="text-base font-black text-emerald-300 block">
                      Xiriir &amp; Xaqiijin 🔒
                    </span>
                    <span className="text-[11px] text-blue-200 block">
                      Salaaduhu waxay u xidhan yihiin si xiriir ah, kalfadhiga la saxana waa mid joogto ah oo aan dib loo beddeli karin.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
                  <span className="text-blue-200">
                    Akhriso qaybta maanta, kadibna ku soo laabo halkan si aad u saxdo (check off).
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingDismissed(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-slate-900 font-black hover:bg-blue-50 transition-all cursor-pointer text-center"
                  >
                    Fahmay (Got it)
                  </button>
                </div>
              </div>
            )}

            {/* 2. "START READING QURAN" DIRECT CALLOUT ACTION */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  <span className="text-sm font-black uppercase tracking-wide">
                    Billaaw Akhriska Qur'aanka (Start Reading Quran)
                  </span>
                </div>
                <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                  Guji badhanka si aad toos ugu bilowdo akhriska qaybta maanta (Bogga {dayPlan.startPage} ilaa {dayPlan.endPage}). Marka aad dhammayso akhriska maanta, dib ugu soo laabo boggan si aad u <strong>saxdo / xaqiijiso (Ku Soo Laabo &amp; Sax / Check Off Today)</strong> horumarkaaga.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Link
                  to={`/quran?page=${dayPlan.startPage}`}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-center"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Akhriso Bogga {dayPlan.startPage}</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </Link>
              </div>
            </div>

            {/* 3. QUICK STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Bogagga La Akhriyay</span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5">
                  {stats.completedPages} / {TOTAL_PAGES}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{stats.completionPercent}% La Dhammeeyay</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Juz La Akhriyay</span>
                <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                  {stats.completedJuz} / {TOTAL_JUZ}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{TOTAL_JUZ - Math.floor(stats.completedJuz)} ayaa dhiman</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Muddada</span>
                <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 block mt-0.5">
                  {challenge?.durationDays || effectiveDays} Maalmood
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ilaa {challenge?.targetEndDate || previewTargetEnd}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Maalinta Hadda</span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                  Maalinta {stats.currentAllowedDay}aad
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Qorshaha Firfircoon</span>
              </div>
            </div>

            {/* 4. DAY SELECTOR & DAILY 5-PRAYER ROUTINE SECTION */}
            <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Qorshaha Maalinlaha ah ee 5-ta Salaadood</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dooro maalinta aad rabto inaad eegto, oo calaamadee 5-ta salaadood markaad dhammayso.
                  </p>
                </div>

                {/* Quick Check-Off Today Quota button */}
                <button
                  type="button"
                  onClick={handleCheckOffToday}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Sax Horumarka Maanta</span>
                </button>
              </div>

              {/* Day selection pills */}
              <div className="space-y-2 w-full max-w-full min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Dooro Maalinta:</span>
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5 flex-wrap">
                    <span>Maalinta {selectedDay}aad (Bogagga {dayPlan.startPage} - {dayPlan.endPage})</span>
                    {selectedDay === (stats.currentAllowedDay || 1) && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] uppercase font-black">
                        Hadda (Active)
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin w-full max-w-full">
                  {Array.from({ length: challenge?.durationDays || effectiveDays }, (_, i) => i + 1).map((dayIndex) => {
                    const currentActiveDay = stats.currentAllowedDay || 1;
                    const isActive = dayIndex === currentActiveDay;
                    const isFuture = dayIndex > currentActiveDay;
                    const isCompleted = dayPlan.slots.every((s) => challenge?.completedSlots[`day_${dayIndex}_${s.key}`]);
                    const isSelected = selectedDay === dayIndex;

                    return (
                      <button
                        key={dayIndex}
                        type="button"
                        onClick={() => setSelectedDay(dayIndex)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : isActive
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-black'
                            : isFuture
                            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : isFuture ? (
                          <Lock className="w-3 h-3 text-slate-400" />
                        ) : isActive ? (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        ) : null}
                        <span>Maalinta {dayIndex}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Prayer Slot Cards */}
              <div className="space-y-3 pt-2 w-full max-w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    5-ta Kalfadhi ee Maalinta {selectedDay}aad
                  </span>
                  {isSelectedDayAllCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Maalintan waa la dhammaystiray</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-full min-w-0">
                  {dayPlan.slots.map((slot) => {
                    const slotId = `day_${selectedDay}_${slot.key}`;
                    const isCompletedSlot = Boolean(challenge?.completedSlots[slotId]);
                    const lockStatus = isPrayerSlotLocked(challenge || ({} as any), selectedDay, slot.key);
                    const isInteractive = !isCompletedSlot && !lockStatus.isLocked;

                    return (
                      <div
                        key={slot.key}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between w-full min-w-0 break-words ${
                          isCompletedSlot
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                            : !isInteractive
                            ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 hover:border-blue-400 shadow-xs ring-1 ring-blue-500/30'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {slot.label}
                            </span>
                            {slot.key === 'fajr' ? (
                              <Sun className="w-4 h-4 text-amber-500" />
                            ) : slot.key === 'isha' ? (
                              <Moon className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Sun className="w-4 h-4 text-blue-500" />
                            )}
                          </div>

                          <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                            Bogga {slot.startPage} - {slot.endPage}
                          </div>

                          <span className="text-[10px] text-slate-400 block">
                            {slot.pageCount} Bog • Ka dib salaadda
                          </span>
                        </div>

                        <div className="pt-3">
                          {isCompletedSlot ? (
                            <div className="w-full py-2 px-2 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Waa la xaqiijiyay 🔒</span>
                            </div>
                          ) : !isInteractive ? (
                            <div className="w-full py-2 px-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1" title={lockStatus.reason || 'Xidhan'}>
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                              <span>Xidhan</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSlotToggle(slot.key)}
                              className="w-full py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Sax Kalfadhigan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion Celebration Trigger (if all 604 pages completed) */}
              {challenge?.isCompleted && (
                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-200 animate-bounce shrink-0" />
                      <span className="text-sm sm:text-base font-black uppercase tracking-wide">
                        Hambalyo! Khatmadii Waa Dhammaystiran Tahay
                      </span>
                    </div>
                    <p className="text-xs text-amber-100 max-w-xl">
                      Waxaad si xilkasnimo leh u dhammaysay 604-ta bog ee Qur'aanka Kariimka. Fadlan ka jawaab 10-ka su'aalood ee imtixaanka si aad u hesho Shahaadadaada rasmiga ah oo leh Shaambadda Rasmiga ah!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!challenge.quizPassed) {
                        setIsQuizModalOpen(true);
                      } else {
                        handleDownloadPdf();
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
                  >
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {challenge.quizPassed ? 'Degso Shahaadada PDF' : 'Imtixaanka Khatmka (10 Su\'aalood)'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. LIVE EXACT CERTIFICATE PREVIEW & SAMPLE (Matching image_7c6815.png) */}
            <div id="certificate-preview-section" className="pt-2">
              <KhatmCertificatePreview
                challenge={challenge}
                userName={challenge?.userName || name}
                startDate={challenge?.startDate}
                targetEndDate={challenge?.targetEndDate}
                durationDays={challenge?.durationDays || effectiveDays}
                screenId={challenge?.screenId}
                onDownloadPdf={handleDownloadPdf}
                isGeneratingPdf={isPdfGenerating}
              />
            </div>
          </div>
        )}

        {/* Certificate Preview Showcase for Wizard Mode */}
        {viewMode === 'wizard' && (
          <div id="certificate-preview-section" className="pt-4">
            <KhatmCertificatePreview
              challenge={challenge}
              isSample={!challenge?.isRegistered}
              userName={challenge?.userName || name || 'Khaliid Axmed'}
              durationDays={challenge?.durationDays || effectiveDays}
              startDate={challenge?.startDate || startDate}
              targetEndDate={challenge?.targetEndDate || previewTargetEnd}
              screenId={challenge?.screenId || 'EMUFTI-KHATM-SAMPLE'}
              onDownloadPdf={handleDownloadPdf}
              isGeneratingPdf={isPdfGenerating}
            />
          </div>
        )}

        {/* =========================================================================
            3. MANDATORY 10-QUESTION QURANIC QUIZ MODAL
           ========================================================================= */}
        {challenge && (
          <KhitmaQuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            challenge={challenge}
            userId={userId}
            onResetChallenge={handleResetKhatm}
            onSuccessPassed={() => {
              setChallenge((prev) => (prev ? { ...prev, quizPassed: true } : null));
            }}
          />
        )}

        {/* =========================================================================
            4. CELEBRATION MODAL WITH SCREEN ID & QUIZ PROMPT
           ========================================================================= */}
        {isCelebrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 shadow-2xl p-6 sm:p-7 space-y-5 text-center text-slate-900 dark:text-white">
              <button
                type="button"
                onClick={() => setIsCelebrationOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-black tracking-wide">
                  <PartyPopper className="w-3.5 h-3.5 text-amber-600" />
                  <span>HAMBALYO CAAJIIB AH! KHATMO BUUXDA!</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hambalyo cajiib ah, {challenge?.userName || 'Walaal'}!
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Waxaad si guul leh u dhammaysay akhriska dhammaan 604-ta bog ee Qur'aanka Kariimka barnaamijka Khidmada {challenge?.durationDays || 30}-ka Maalmood!
                </p>
              </div>

              {/* Screen ID Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  Screen ID-ga Shahaadadaada (Certificate ID)
                </span>
                <div className="font-mono text-sm sm:text-base font-black text-blue-700 dark:text-blue-300 tracking-wider">
                  {challenge?.screenId || 'EMUFTI-KHATM-SUCCESS'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {challenge?.quizPassed ? 'Degso Shahaadada PDF' : 'Gal Imtixaanka si aad u degsato PDF'}
                  </span>
                </button>

                <Link
                  to={`/verify?id=${challenge?.screenId || ''}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xaqiiji Shahaadada</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};

export default KhitmaPage;
