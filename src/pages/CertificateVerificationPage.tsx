// ==============================================================================
// EMUFTI AI — Public Frontend Certificate Verification Portal
// Hubinta Shahaadada Khatmka Qur'aanka Kariimka
// Modern UI/UX Redesign matching white-and-blue theme
// Strict backend/frontend validation for authentic system-issued Certificate IDs
// 30-Second Verification Search Animation with live multi-stage scanning & progress
// Official Transparent Stamp display & verified certificate details
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  FileText,
  User,
  RotateCcw,
  FastForward,
  Lock,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  lookupCertificateByScreenId,
  VerifiedCertificateRecord,
  generateKhatmCertificatePdf,
  KhatmChallengeData,
} from '../lib/khatmChallengeService';
import { Footer } from '../components/layout/Footer';

export const CertificateVerificationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [inputScreenId, setInputScreenId] = useState<string>(initialId);
  const [verifiedRecord, setVerifiedRecord] = useState<VerifiedCertificateRecord | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  // (standalone public page — no sidebar needed)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // 30-Second Verification Animation States
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-stage verification descriptions
  const getVerificationPhaseText = (secondsLeft: number) => {
    if (secondsLeft > 23) {
      return "Xiriirinta diiwaanka amniga ee shahaadooyinka (Connecting to verifiable registry...)";
    }
    if (secondsLeft > 15) {
      return "Hubinta saxeexa dhijitaalka ah iyo Certificate ID-ga (Validating digital signature & Certificate ID...)";
    }
    if (secondsLeft > 7) {
      return "Xaqiijinta 604-ta bog ee Khatmka iyo taariikhaha (Verifying 604 Quran pages & completion dates...)";
    }
    return "Soo saarista shahaadada rasmiga ah oo leh shaambadda (Loading official certificate with official stamp...)";
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Auto-search if URL contains ID parameter
  useEffect(() => {
    if (initialId && !hasSearched && !isVerifying) {
      setInputScreenId(initialId);
      startVerificationProcess(initialId);
    }
  }, [initialId]);

  // Start 30-Second Verification Search Animation
  const startVerificationProcess = (targetId: string) => {
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) {
      setValidationError("Fadlan geli Certificate ID-ga saxda ah.");
      return;
    }

    setValidationError(null);
    setHasSearched(false);
    setVerifiedRecord(null);
    setIsVerifying(true);
    setCountdown(30);
    setScanProgress(0);

    // Update URL query
    setSearchParams({ id: cleanId });

    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const startTime = Date.now();
    const totalDurationMs = 30000; // 30 seconds

    // High resolution progress counter
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(1, elapsed / totalDurationMs);
      const remainingSecs = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));

      setScanProgress(Math.round(progressRatio * 100));
      setCountdown(remainingSecs);

      if (elapsed >= totalDurationMs) {
        completeVerification(cleanId);
      }
    }, 100);
  };

  // Fast-forward / complete verification search
  const completeVerification = (cleanId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIsVerifying(false);
    setScanProgress(100);
    setCountdown(0);
    setHasSearched(true);

    // Strict lookup in system registry
    const found = lookupCertificateByScreenId(cleanId);
    setVerifiedRecord(found);
  };

  // Skip 30s animation immediately
  const handleSkipAnimation = () => {
    completeVerification(inputScreenId.trim().toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startVerificationProcess(inputScreenId);
  };

  const handleCopyVerificationUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadVerifiedPdf = async () => {
    if (!verifiedRecord) return;
    try {
      setIsDownloadingPdf(true);
      const challengeMock: KhatmChallengeData = {
        id: verifiedRecord.challengeId,
        userId: 'verified_user',
        userName: verifiedRecord.userName,
        startDate: verifiedRecord.startDate,
        targetEndDate: verifiedRecord.completionDate,
        durationDays: verifiedRecord.durationDays,
        createdAt: verifiedRecord.startDate,
        isRegistered: true,
        completedSlots: {},
        isCompleted: true,
        completedAt: verifiedRecord.completionDate,
        screenId: verifiedRecord.screenId,
        issueDate: verifiedRecord.issueDate,
        signature: verifiedRecord.signature,
      };
      await generateKhatmCertificatePdf(challengeMock);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col w-full overflow-x-hidden font-sans">
      {/* ─── Standalone Public Top Navigation Bar ─── */}
      <nav className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-black text-blue-700 dark:text-blue-400 text-sm tracking-tight hover:opacity-80 transition-opacity"
          >
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>EMufti AI</span>
          </Link>

          <Link
            to="/quran"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xarunta Qur'aanka</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full py-8 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ── Official Verification badge pill ── */}
            <div className="flex justify-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Hubinta Rasmiga ah • Official Verification
              </span>
            </div>

            {/* Portal Hero Banner (White-and-Blue modern theme) */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xl space-y-3">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-amber-300 text-xs font-black tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>EMUFTI AI OFFICIAL VERIFICATION GATEWAY</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Hubinta Shahaadada Khatmka (Certificate Verification)
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
                Geli <strong>Certificate ID / Screen ID</strong>-ga ku qoran shahaadada si aad u xaqiijiso saxnimadeeda, diiwaanka akhriska 604-ta bog, iyo shaambadda rasmiga ah ee nidaamka.
              </p>
            </div>

            {/* Verification Form Card */}
            <form
              onSubmit={handleSubmit}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Geli Certificate ID-ga Shahaadada (Certificate ID / Screen ID):</span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    Nidaamka Amniga ee Xaqiijinta
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Wuxuu ku bilaabmaa <code>EMUFTI-KHATM-...</code>
                </p>
              </div>

              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold animate-in fade-in">
                  {validationError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    required
                    disabled={isVerifying}
                    value={inputScreenId}
                    onChange={(e) => setInputScreenId(e.target.value)}
                    placeholder="e.g. EMUFTI-KHATM-7B42-9E1F"
                    className="w-full px-4 py-3.5 pl-11 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono uppercase font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifying ? 'Hubinaya...' : 'Hubi Hadda (Verify)'}</span>
                </button>
              </div>

              {/* Sample IDs helper */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold">Tusaale (Sample Certificate IDs):</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputScreenId('EMUFTI-KHATM-7B42-9E1F');
                    startVerificationProcess('EMUFTI-KHATM-7B42-9E1F');
                  }}
                  className="text-blue-600 dark:text-blue-400 font-mono font-bold hover:underline cursor-pointer"
                >
                  EMUFTI-KHATM-7B42-9E1F
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputScreenId('EMUFTI-KHATM-4A1C-8D99');
                    startVerificationProcess('EMUFTI-KHATM-4A1C-8D99');
                  }}
                  className="text-blue-600 dark:text-blue-400 font-mono font-bold hover:underline cursor-pointer"
                >
                  EMUFTI-KHATM-4A1C-8D99
                </button>
              </div>
            </form>

            {/* =========================================================================
                30-SECOND VERIFICATION SEARCH ANIMATION
               ========================================================================= */}
            {isVerifying && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95">
                {/* Rotating Security Shield & Radar */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-300 dark:border-indigo-800 border-b-indigo-500 animate-spin-slow" />
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                    <ShieldCheck className="w-9 h-9 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>30-SECOND SECURITY VERIFICATION IN PROGRESS</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Hubinta Saxnimada Shahaadada: {inputScreenId.toUpperCase()}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto min-h-[40px] flex items-center justify-center font-medium">
                    {getVerificationPhaseText(countdown)}
                  </p>
                </div>

                {/* Progress Bar & Countdown Ring */}
                <div className="space-y-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-blue-600 dark:text-blue-400 font-black">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Waqti dhiman: {countdown}s</span>
                    </span>
                    <span className="font-mono font-black">{scanProgress}%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-200 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>

                {/* Skip button for quick review */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSkipAnimation}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Bood (Fast Forward)</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                RESULT: VERIFIED AUTHENTIC CERTIFICATE WITH TRANSPARENT STAMP
               ========================================================================= */}
            {!isVerifying && hasSearched && verifiedRecord && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Status Badge & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                          Xaqiijin Rasmi ah • Authentic
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                        Shahaado Sax Ah Oo La Xaqiijiyay!
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleCopyVerificationUrl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link-ga waa la koobiyeeyay' : 'Koobiyeey Link-ga'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadVerifiedPdf}
                      disabled={isDownloadingPdf}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'Diyaarinaya...' : 'Degso PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* Recipient Presentation Card */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-slate-850 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                        Magaca Qofka Shahaadada Leh (Certificate Recipient)
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {verifiedRecord.userName}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Wuxuu/waxay si xilkasnimo leh u dhammaysatay akhriska 30-ka Juzz ee Qur'aanka Kariimka.
                      </p>
                    </div>

                    {/* Official Transparent Stamp Image matching image_9567e4.jpg */}
                    <div className="relative shrink-0">
                      <img
                        src="/images/official-stamp.png"
                        alt="Official Transparent Stamp"
                        className="w-24 h-24 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-2 inset-x-0 text-center text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-white/90 dark:bg-slate-900/90 rounded-md px-1 py-0.5 border border-blue-200 dark:border-blue-800 shadow-2xs">
                        Official Stamp
                      </span>
                    </div>
                  </div>

                  {/* Verification Records Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Certificate ID</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-blue-600 dark:text-blue-400 block mt-0.5 truncate">
                        {verifiedRecord.screenId}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Muddada</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                        {verifiedRecord.durationDays} Maalmood
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Bogagga</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {verifiedRecord.totalPages} Bog (30 Juz)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Taariikhda Bixinta</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        {verifiedRecord.issueDate}
                      </span>
                    </div>
                  </div>

                  {/* Dates & Authentication Notes */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Taariikhda Bilowga & Dhammaystirka:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {verifiedRecord.startDate} ilaa {verifiedRecord.completionDate}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Hay'adda Bixisay:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">EMUFTI AI Academic & Quran Platform</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Saxnimada Saxeexa:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{verifiedRecord.signature}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Xaaladda Rasmiga ah:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>100% Dhammaystiran & Xaqiiqo Ah ✓</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                RESULT: NOT FOUND / INVALID CERTIFICATE ID
               ========================================================================= */}
            {!isVerifying && hasSearched && !verifiedRecord && (
              <div className="p-8 rounded-3xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-xs">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200">
                    Shahaadadan Lagama Helin Diiwaanka Rasmiga ah
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Certificate ID-ga <strong>"{inputScreenId}"</strong> kuma jiro diiwaanka shahaadooyinka rasmiga ah ee nidaamka. Nidaamku wuxuu xaqiijiyaa oo kaliya shahaadooyinka dhabta ah ee lagu dhammaystiray barnaamijka Khatmka. Fadlan hubi xuruufaha oo mar kale isku day.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputScreenId('');
                      setHasSearched(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Isku Day Mar Kale</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
    </div>
  );
};

export default CertificateVerificationPage;
