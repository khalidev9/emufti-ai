// ==============================================================================
// EMUFTI AI — Comprehensive Quran Khatma Tracker & Certificate System
// 1. Compact & Animated Banner Design with Prominent "Billaaw / Start" Button
// 2. Challenge Setup Modal/Form with 30, 20, 15, 10, 7 Days, or Others (Custom)
// 3. Automatic 604-Page Calculation & 5-Prayer Breakdown with Estimated Completion Date
// 4. Strict Day Locking & Intra-Day Sequential Prayer Slot Locking (Slot 2 locked until Slot 1 checked)
// 5. Daily Completion Congratulatory Message ("Mahadsanid dadaalkaada jazakallah...")
// 6. Completion Screen with Unique Screen ID & Dual-Branded PDF Certificate Generation
// ==============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  User,
  PartyPopper,
  X,
  Lock,
  Check,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
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
  togglePrayerSlot,
  markDayComplete,
  resetKhatmChallenge,
  getChallengeStats,
  generateKhatmCertificatePdf,
  isDayLocked,
  isPrayerSlotLocked,
  isDayAllSlotsDone,
  formatSomaliDayOrdinal,
  getChallengeCurrentDay,
  calculateTargetEndDate,
  isKhatmChallengeExpired,
  isKhatmExamRequired,
} from '../../lib/khatmChallengeService.ts';
import { KhitmaQuizModal } from '../khitma/KhitmaQuizModal.tsx';

interface QuranKhatmChallengeWidgetProps {
  userId?: string;
  defaultUserName?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const QuranKhatmChallengeWidget: React.FC<QuranKhatmChallengeWidgetProps> = ({
  userId = 'guest_user',
  defaultUserName = 'Seeker of Knowledge',
  className = '',
  defaultExpanded = true,
}) => {
  const navigate = useNavigate();

  // Challenge State
  const [challenge, setChallenge] = useState<KhatmChallengeData | null>(() => getKhatmChallenge(userId));

  // Interactive toggle: when defaultExpanded is false (e.g. Quran page), display ONLY clean compact banner initially
  const [isExpanded, setIsExpanded] = useState<boolean>(() => defaultExpanded);

  // Registration Form State
  const [regName, setRegName] = useState<string>(() => defaultUserName);
  const [regStartDate, setRegStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDurationPreset, setSelectedDurationPreset] = useState<number | 'others'>(30);
  const [customDays, setCustomDays] = useState<number>(25);
  const [showSetupForm, setShowSetupForm] = useState<boolean>(() => !challenge?.isRegistered);

  // Active Day Viewing in the Routine Tracker (1 to D)
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Modals & Feedback Notifications
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [immutableAlert, setImmutableAlert] = useState<string | null>(null);
  const [dailyCompletionNotice, setDailyCompletionNotice] = useState<string | null>(null);
  const [copiedScreenId, setCopiedScreenId] = useState<boolean>(false);

  const setupFormRef = useRef<HTMLDivElement>(null);

  // Effective duration in days based on preset or custom input
  const effectiveRegDays = useMemo(() => {
    if (selectedDurationPreset === 'others') {
      return Math.max(1, Math.min(365, customDays || 25));
    }
    return selectedDurationPreset;
  }, [selectedDurationPreset, customDays]);

  // Sync challenge on mount or userId change
  useEffect(() => {
    const existing = getKhatmChallenge(userId);
    if (existing) {
      setChallenge(existing);
      if (existing.durationDays && [30, 20, 15, 10, 7].includes(existing.durationDays)) {
        setSelectedDurationPreset(existing.durationDays);
      } else if (existing.durationDays) {
        setSelectedDurationPreset('others');
        setCustomDays(existing.durationDays);
      }
      const currentAllowed = getChallengeCurrentDay(existing.startDate);
      const safeDay = Math.min(existing.durationDays || 30, Math.max(1, currentAllowed));
      setSelectedDay(safeDay);
    }
  }, [userId]);

  // Derived stats
  const stats = useMemo(() => getChallengeStats(challenge), [challenge]);

  // Current active duration
  const activeDuration = challenge?.durationDays || effectiveRegDays;
  const dayPlan = useMemo(() => getDayPlan(selectedDay, activeDuration), [selectedDay, activeDuration]);

  // Check if selected day is locked (future day)
  const isSelectedDayLocked = useMemo(() => {
    if (!challenge) return false;
    return isDayLocked(challenge.startDate, selectedDay);
  }, [challenge, selectedDay]);

  // Check if selected day has all slots completed
  const isSelectedDayFullyComplete = useMemo(() => {
    return isDayAllSlotsDone(challenge, selectedDay);
  }, [challenge, selectedDay]);

  // Navigate directly to dedicated "Khitma" registration & challenge page
  const handleStartClick = () => {
    navigate('/khitma');
  };

  // Handle registration submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const created = registerKhatmChallenge(userId, regName, regStartDate, effectiveRegDays);
    setChallenge(created);
    setShowSetupForm(false);
    setSelectedDay(1);
    setDailyCompletionNotice(null);
  };

  // Handle slot click (Strict sequential & immutable locking)
  const handleSlotClick = (slotKey: PrayerSlotKey) => {
    if (!challenge) return;

    // 1. Day locking check
    if (isDayLocked(challenge.startDate, selectedDay)) {
      setImmutableAlert('Maalintani weli ma soo gaarin! Waxaad calaamadayn kartaa oo kaliya maalmaha furmay.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    const slotId = `day_${selectedDay}_${slotKey}`;
    // 2. Immutability check
    if (challenge.completedSlots[slotId]) {
      setImmutableAlert('Kalfadhigan mar hore ayaa la xaqiijiyay oo si joogto ah u xidhan (Permanent). Lama beddeli karo.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    // 3. Intra-day sequential locking check
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

    // 4. Daily completion notification
    if (res.dailyCompletedNow) {
      setDailyCompletionNotice(
        `Mahadsanid dadaalkaada jazakallah, waa lagu diwaangaliyeey ${formatSomaliDayOrdinal(selectedDay)}!`
      );
    }

    // 5. Overall completion check
    if (res.challenge.isCompleted) {
      setIsCelebrationOpen(true);
    }
  };

  const handleSlotToggle = handleSlotClick;

  // Handle mark entire day complete
  const handleDayComplete = () => {
    if (!challenge) return;
    if (isDayLocked(challenge.startDate, selectedDay)) {
      setImmutableAlert('Maalintani waa xidhan tahay. Ma calaamadayn kartid ka hor taariikhdeeda.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }
    const res = markDayComplete(userId, selectedDay);
    setChallenge(res.challenge);
    setDailyCompletionNotice(
      `Mahadsanid dadaalkaada jazakallah, waa lagu diwaangaliyeey ${formatSomaliDayOrdinal(selectedDay)}!`
    );
    if (res.challenge.isCompleted) {
      setIsCelebrationOpen(true);
    }
  };

  // Handle PDF Certificate Download (ONLY available when 100% completed & Quiz Passed)
  const handleDownloadPdf = async () => {
    if (!challenge) return;

    if (challenge.isFailedSession) {
      setImmutableAlert('Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale.');
      setTimeout(() => setImmutableAlert(null), 4000);
      return;
    }

    if (!challenge.quizPassed) {
      // Must pass mandatory 10-question Quranic Quiz first!
      setIsCelebrationOpen(false);
      setIsQuizModalOpen(true);
      return;
    }

    if (!challenge.isCompleted && !isKhatmChallengeExpired(challenge)) {
      setImmutableAlert('Waa inaad dhammaysataa dhammaan bogagga ama muddadu dhammaataa si aad u hesho shahaadada.');
      setTimeout(() => setImmutableAlert(null), 3500);
      return;
    }

    setIsPdfGenerating(true);
    setPdfSuccessMessage(null);
    try {
      await generateKhatmCertificatePdf(challenge);
      setPdfSuccessMessage('Shahaadada PDF si guul leh ayaa loo soo dejiyay!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Copy Screen ID
  const handleCopyScreenId = () => {
    if (!challenge?.screenId) return;
    navigator.clipboard.writeText(challenge.screenId);
    setCopiedScreenId(true);
    setTimeout(() => setCopiedScreenId(false), 3000);
  };

  // Reset challenge
  const handleResetChallenge = () => {
    if (window.confirm('Ma hubtaa inaad dib u bilaabayso tartanka Khatmka? Dhammaan xogta hore dib baa loo bilaabayaa.')) {
      const reset = resetKhatmChallenge(userId);
      setChallenge(reset);
      setShowSetupForm(true);
      setSelectedDay(1);
      setDailyCompletionNotice(null);
    }
  };

  // Calculated estimated completion date preview for setup form
  const previewTargetEnd = useMemo(() => {
    return calculateTargetEndDate(regStartDate, effectiveRegDays);
  }, [regStartDate, effectiveRegDays]);

  // Calculated pages per prayer session and daily pages
  const calculatedDailyPages = useMemo(() => {
    return Math.ceil(TOTAL_PAGES / effectiveRegDays);
  }, [effectiveRegDays]);

  const calculatedPrayerPages = useMemo(() => {
    return Math.ceil(calculatedDailyPages / 5);
  }, [calculatedDailyPages]);

  return (
    <div
      className={`transition-all duration-300 ${
        isExpanded
          ? `p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-300 dark:hover:border-blue-800 ${className}`
          : `p-0 bg-transparent border-0 shadow-none space-y-0 ${className}`
      }`}
    >
      {/* =========================================================================
          1. COMPACT & ANIMATED BANNER DESIGN
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 sm:p-5 shadow-sm">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/25 border border-blue-400/30 text-amber-300 text-[10px] font-extrabold tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
                  <span>QUR'AN KHATMA CHALLENGE</span>
                </span>
                <span className="text-[11px] text-blue-200 font-semibold hidden md:inline">
                  • 604 Bog • 5 Salaadood
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Khidmada Khatmka Qur'aanka Kariimka</span>
              </h2>

              <p className="text-xs text-blue-100/85 max-w-xl">
                Qaybi 604-ta bog 5-taada salaadood maalin kasta. Dooro muddada kugu habboon oo dhis caado xiriirsan.
              </p>
            </div>

            {/* Prominent Start / Action Button with Eye-Catching Pulse & Hover Animation */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartClick}
                className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50 hover:ring-amber-300 hover:shadow-amber-400/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer animate-pulse hover:animate-none"
                title="Billaaw / Start Khatma"
              >
                {/* Shimmer light sweep on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                <Trophy className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                <span className="font-black tracking-tight whitespace-nowrap">Billaaw / Start Khatma</span>
                <ArrowRight className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </button>

              {challenge?.isRegistered && (
                <button
                  type="button"
                  onClick={() => navigate('/khitma')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  title="Eeg Bogga Hawlaha (Task Page)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span>Bogga Hawlaha</span>
                </button>
              )}

              {/* Conditional PDF Download Button: ONLY UNLOCKS WHEN COMPLETED */}
              {challenge?.isCompleted && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isPdfGenerating ? 'Diyaarinaya...' : 'PDF Shahaado'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Streamlined Minimalist Duration Presets (Clean, Responsive & Clutter-Free) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="text-[11px] font-semibold text-blue-200/90 mr-1 hidden sm:inline">Muddada:</span>
            {KHATM_DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDurationPreset === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => {
                    setSelectedDurationPreset(opt.days);
                    navigate(`/khitma?duration=${opt.days}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-blue-950 shadow-sm font-bold scale-[1.02]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                  }`}
                  title={`${opt.days} Maalmood (${opt.dailyPages} bog maalintii / ~${opt.prayerPages} bog salaad kasta)`}
                >
                  {opt.days === 30 ? '1 Bil' : `${opt.days} M`}
                  <span className="opacity-75 font-normal ml-1 hidden xs:inline">({opt.dailyPages}b)</span>
                </button>
              );
            })}

            {/* "Others / Kale" Preset */}
            <button
              type="button"
              onClick={() => {
                setSelectedDurationPreset('others');
                navigate('/khitma?duration=others');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDurationPreset === 'others'
                  ? 'bg-white text-blue-950 shadow-sm font-bold scale-[1.02]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
              title="Dooro tiro maalmood oo kale"
            >
              Others (Kale)
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Collapsible Details (Hidden by default when defaultExpanded=false) */}
      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

      {/* Failed Session Notice */}
      {challenge?.isFailedSession && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-center space-y-2">
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
            Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale
          </p>
          <button
            type="button"
            onClick={handleResetChallenge}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Samee khatm kale
          </button>
        </div>
      )}

      {/* Expiration or Completion Exam Required Banner */}
      {!challenge?.isFailedSession && !challenge?.quizPassed && isKhatmExamRequired(challenge) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
              <Award className="w-4 h-4 text-amber-200" />
              <span>Imtixaanka Khatmka (Khatm Exam Required)</span>
            </span>
            <p className="text-[11px] text-amber-100">
              Muddadii khatmka way dhammaatay. Fadlan gal imtixaanka 10-ka su'aalood si aad shahaadada u qaadato.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuizModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-amber-50 cursor-pointer shadow-xs shrink-0"
          >
            Gal Imtixaanka (10 Su'aalood)
          </button>
        </div>
      )}

      {/* Daily Completion Congratulatory Notice */}
      {dailyCompletionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{dailyCompletionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDailyCompletionNotice(null)}
            className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notifications */}
      {pdfSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {immutableAlert && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{immutableAlert}</span>
        </div>
      )}

      {/* =========================================================================
          2. CHALLENGE SETUP FORM & DURATION OPTIONS (WITH OTHERS / CUSTOM)
         ========================================================================= */}
      {(!challenge?.isRegistered || showSetupForm) && (
        <div
          ref={setupFormRef}
          className="p-4 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-blue-200/90 dark:border-slate-700 shadow-2xs space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Habee Tartankaaga Khatmka (Setup Challenge)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Geli magacaaga, taariikhda bilowga, iyo muddada aad doonayso (1 Bil, 20, 15, 10, 7, ama tiro kale).
              </p>
            </div>

            {challenge?.isRegistered && (
              <button
                type="button"
                onClick={() => setShowSetupForm(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Xir Form-ka
              </button>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Magacaaga oo Buuxa (Full Name for Certificate):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mohamed Abdi"
                    className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Start Date Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Taariikhda Bilowga (Start Date):
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Duration Selector: 30, 20, 15, 10, 7 Days, or Others */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Dooro Muddada Khatmka (Choose Duration):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {KHATM_DURATION_OPTIONS.map((opt) => {
                  const isChecked = selectedDurationPreset === opt.days;
                  return (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setSelectedDurationPreset(opt.days)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-200 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black">{opt.somaliLabel}</span>
                        {isChecked && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                        {opt.prayerPages} Bog/Salaad
                      </span>
                    </button>
                  );
                })}

                {/* Others Option */}
                <button
                  type="button"
                  onClick={() => setSelectedDurationPreset('others')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDurationPreset === 'others'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black">Others / Kale</span>
                    {selectedDurationPreset === 'others' && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                    Geli Maalmo
                  </span>
                </button>
              </div>

              {/* Custom days input if "Others" selected */}
              {selectedDurationPreset === 'others' && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 space-y-2 mt-2 animate-in fade-in">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Geli Tirada Maalmood ee aad ku dhammaysanayso (e.g. 5, 12, 25, 40):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value) || 1)}
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Maalmood ({calculatedDailyPages} Bog Maalintii • {calculatedPrayerPages} Bog Salaad kasta)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Calculated Preview & Action Button */}
            <div className="p-3 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300 shrink-0" />
                <span>
                  Qorshaha: <strong>{calculatedDailyPages} Bog/Maalin</strong> ({calculatedPrayerPages} Bog Salaad kasta) • Dhammaystir: <strong>{previewTargetEnd}</strong>
                </span>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Xaqiiji & Billaaw</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          3. ACTIVE CHALLENGE PROGRESS & STATS
         ========================================================================= */}
      {challenge?.isRegistered && (
        <div className="space-y-4">
          {/* Top Progress & Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Qofka & Muddada
              </span>
              <div className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 truncate">{challenge.userName}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                {challenge.durationDays} Maalmood ({challenge.targetEndDate})
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Bogagga La Dhameeyay
              </span>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {stats.completedPages} / {TOTAL_PAGES} Bog
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {stats.completedSlotsCount} kalfadhi oo salaadeed
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Juzz La Dhameeyay
              </span>
              <div className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                {stats.completedJuz} / {TOTAL_JUZ} Juzz
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {Math.max(0, 30 - Math.floor(stats.completedJuz))} Juzz ayaa dhiman
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Horumarka
              </span>
              <div className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">{stats.completionPercent}%</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {stats.isCompleted
                  ? 'Guul Buuxda! ✓'
                  : `Maalinta ${stats.currentAllowedDay}aad / ${challenge.durationDays}`}
              </div>
            </div>
          </div>

          {/* Overall Challenge Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Horumarka Guud ({challenge.durationDays} Maalmood)</span>
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {stats.completedPages} / {TOTAL_PAGES} Bog ({stats.completionPercent}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, stats.completionPercent))}%` }}
              />
            </div>
          </div>

          {/* =========================================================================
              4. STRICT DAY LOCKING CAROUSEL
             ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Maalmaha:</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  (Mustaqbalku waa xidhan yahay 🔒)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedDay((p) => Math.max(1, p - 1))}
                  disabled={selectedDay === 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2 font-mono">
                  Maalinta {selectedDay} / {challenge.durationDays}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDay((p) => Math.min(challenge.durationDays, p + 1))}
                  disabled={selectedDay === challenge.durationDays}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Horizontal Day Chips with STRICT LOCKING INDICATOR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 chat-scrollbar">
              {Array.from({ length: challenge.durationDays }, (_, i) => i + 1).map((d) => {
                const slots: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                const isDayDone = slots.every((s) => !!challenge.completedSlots[`day_${d}_${s}`]);
                const isLocked = isDayLocked(challenge.startDate, d);
                const isSelected = selectedDay === d;

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    title={isLocked ? `Maalinta ${d} (Locked until reached)` : `Maalinta ${d}`}
                    className={`shrink-0 w-11 h-12 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-105'
                        : isDayDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                        : isLocked
                        ? 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-70'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold leading-none">M</span>
                    <span className="text-xs font-black mt-0.5">{d}</span>
                    {isDayDone ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : isLocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 mt-0.5" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              5. STRICT SEQUENTIAL INTRA-DAY PRAYER SLOT TRACKER
             ========================================================================= */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                    Maalinta {selectedDay}aad • Juzz {dayPlan.juzNumber}{dayPlan.approxEndJuz !== dayPlan.juzNumber ? ` - ${dayPlan.approxEndJuz}` : ''}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    ({dayPlan.dailyPages} Bog: Bogga {dayPlan.startPage} ilaa {dayPlan.endPage})
                  </span>
                  {isSelectedDayLocked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Xidhan</span>
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                  5-ta Salaadood (Sequential Locking: Slot kasta wuxuu furmayaa markii kii hore la akhriyo)
                </h4>
              </div>

              {/* Day Complete Toggle Action */}
              {!isSelectedDayLocked && !isSelectedDayFullyComplete && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDayComplete}
                    className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold transition-all border border-blue-200/80 cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    <span>Dhamee Dhamaan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Locked Notice if viewing future day */}
            {isSelectedDayLocked && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  Maalintani weli ma soo gaarin (Strict Day Locking). Waxaad calaamadayn kartaa oo kaliya maalmaha furmay.
                </span>
              </div>
            )}

            {/* The 5 Prayer Slot Check Cards with SEQUENTIAL INTRA-DAY LOCKING */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {dayPlan.slots.map((slot) => {
                const slotKey = slot.key;
                const slotId = `day_${selectedDay}_${slotKey}`;
                const isChecked = !!challenge.completedSlots[slotId];
                const prayerDef = PRAYER_SLOTS_DEF.find((p) => p.key === slotKey);

                // Sequential Locking check
                const intraDayCheck = isPrayerSlotLocked(challenge, selectedDay, slotKey);
                const isSlotDisabled = isSelectedDayLocked || (!isChecked && intraDayCheck.isLocked);

                return (
                  <div
                    key={slotKey}
                    onClick={() => handleSlotClick(slotKey)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 select-none ${
                      isChecked
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 shadow-2xs cursor-default'
                        : isSlotDisabled
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs text-slate-700 dark:text-slate-300 cursor-pointer active:scale-98'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{prayerDef?.icon || '📖'}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : isSlotDisabled
                            ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400'
                        }`}
                      >
                        {isChecked ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : isSlotDisabled ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-black block text-slate-900 dark:text-white">
                        {prayerDef?.somaliName || slot.label}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                        {slot.pages}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Ka hor/ka dib salaadda
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold">
                      {isChecked ? (
                        <span className="text-blue-700 dark:text-blue-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>Waa la xaqiijiyay 🔒</span>
                        </span>
                      ) : isSlotDisabled ? (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Xidhan</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                          Guji si aad u xaqiijiso
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* =========================================================================
          6. COMPLETION CELEBRATION MODAL WITH UNIQUE SCREEN ID & VERIFICATION LINK
         ========================================================================= */}
      {isCelebrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 shadow-2xl p-6 sm:p-7 space-y-5 text-center text-slate-900 dark:text-white">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsCelebrationOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Celebration Trophy with Animation */}
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

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Waxaad si guul iyo sharaf leh ku dhammaystirtay 30-ka Juzz ee Qur'aanka Kariimka (604 Bog)
                barnaamijka Khidmada {challenge?.durationDays || 30}-ka Maalmood!
              </p>
            </div>

            {/* Unique Screen ID Card */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 space-y-1 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                SCREEN ID-GAAGA RASMIGA AH (UNIQUE CERTIFICATE ID)
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm sm:text-base font-mono font-black text-blue-900 dark:text-blue-100 tracking-wider">
                  {challenge?.screenId || 'EMUFTI-KHATM-SUCCESS'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyScreenId}
                  className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 hover:text-blue-600 cursor-pointer shadow-2xs"
                  title="Copy Screen ID"
                >
                  {copiedScreenId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Screen ID-gan waxaa si toos ah loogu hubin karaa bogga rasmiga ah ee Certificate Verification.
              </p>
            </div>

            {/* Arabic Dua snippet */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-center space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 font-serif" dir="rtl">
                اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً
              </p>
              <p className="text-[10px] text-amber-800 dark:text-amber-300 italic">
                “Allow noogu naxariiso Qur'aanka, noogana dhig imaam, nuur, hanuun iyo naxariis.”
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isPdfGenerating
                    ? 'Diyaarinaya Shahaadada PDF...'
                    : 'Soo Dejiso Shahaadadaada (Download PDF)'}
                </span>
              </button>

              <Link
                to={`/verify-certificate?id=${challenge?.screenId || ''}`}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Hubi Shahaadada Online (Verify Portal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Mandatory Khatm Quiz Modal */}
      {challenge && (
        <KhitmaQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          challenge={challenge}
          userId={userId}
          onResetChallenge={handleResetChallenge}
          onSuccessPassed={() => {
            const updated = getKhatmChallenge(userId);
            setChallenge(updated);
          }}
        />
      )}
    </div>
  );
};
