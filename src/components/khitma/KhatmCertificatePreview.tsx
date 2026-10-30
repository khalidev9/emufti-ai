import React, { useState } from 'react';
import {
  Award,
  Download,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Eye,
  CheckCircle2,
  Maximize2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KhatmChallengeData, generateKhatmCertificatePdf } from '../../lib/khatmChallengeService';

interface KhatmCertificatePreviewProps {
  challenge?: KhatmChallengeData | null;
  userName?: string;
  startDate?: string;
  targetEndDate?: string;
  durationDays?: number;
  screenId?: string;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
  isSample?: boolean;
  className?: string;
}

export const KhatmCertificatePreview: React.FC<KhatmCertificatePreviewProps> = ({
  challenge,
  userName,
  startDate,
  targetEndDate,
  durationDays,
  screenId,
  onDownloadPdf,
  isGeneratingPdf = false,
  isSample = false,
  className = '',
}) => {
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [localDownloading, setLocalDownloading] = useState(false);

  const effectiveName =
    userName ||
    challenge?.userName ||
    'Khaliid Axmed (Seeker of Knowledge)';

  const effectiveDuration = durationDays || challenge?.durationDays || 30;
  const effectiveTotalSessions = effectiveDuration * 5;

  const effectiveStartDate =
    startDate ||
    challenge?.startDate ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const effectiveCompletionDate =
    targetEndDate ||
    (challenge?.completedAt ? new Date(challenge.completedAt).toISOString().split('T')[0] : null) ||
    challenge?.targetEndDate ||
    new Date().toISOString().split('T')[0];

  const effectiveIssueDate =
    challenge?.issueDate ||
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const effectiveScreenId =
    screenId ||
    challenge?.screenId ||
    'EMUFTI-KHATM-7B42-9E1F';

  const signatureText =
    challenge?.signature || "Guddiga Sare ee Culimada & Qur'aanka EMufti AI";

  const handleDownload = async () => {
    if (challenge && !challenge.quizPassed && !isSample) {
      alert("Waa inaad baastaa imtixaanka 10-ka su'aalood (≥ 7/10) si aad u hesho shahaadada.");
      return;
    }

    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }

    try {
      setLocalDownloading(true);
      const targetChallenge: KhatmChallengeData = challenge || {
        id: `preview_${Date.now()}`,
        userId: 'preview_user',
        userName: effectiveName,
        startDate: effectiveStartDate,
        targetEndDate: effectiveCompletionDate,
        durationDays: effectiveDuration,
        createdAt: effectiveStartDate,
        isRegistered: true,
        completedSlots: {},
        isCompleted: true,
        completedAt: effectiveCompletionDate,
        screenId: effectiveScreenId,
        issueDate: effectiveIssueDate,
        signature: signatureText,
      };
      await generateKhatmCertificatePdf(targetChallenge);
    } catch (err) {
      console.error('Failed to download preview certificate PDF:', err);
    } finally {
      setLocalDownloading(false);
    }
  };

  const isBusy = isGeneratingPdf || localDownloading;

  return (
    <div className={`space-y-4 w-full max-w-full overflow-hidden ${className}`}>
      {/* =========================================================================
          PREVIEW HEADER TOOLBAR
         ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-blue-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SHAHAADADA KHATMKA (OFFICIAL CERTIFICATE PREVIEW)</span>
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white">
            Tusaalaha Shahaadadaada Rasmiga ah (Official Verified Certificate)
          </h3>
          <p className="text-xs text-blue-200/80 max-w-xl">
            Tani waa shahaadada aad si toos ah u heli doonto markaad dhammaysato 604-ta bog ee Qur'aanka Kariimka adigoo ku baasay imtixaanka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFullscreenModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs border border-white/10"
            title="Arag Muuqaal Buuxa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Muuqaal Buuxa</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isBusy}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBusy ? 'Diyaarinaya...' : 'Degso PDF Sample'}</span>
          </button>

          <Link
            to={`/verify-certificate?id=${effectiveScreenId}`}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Xaqiiji Online</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          EXACT CERTIFICATE REPLICA CONTAINER (Matching image_7c6815.png)
         ========================================================================= */}
      <div className="w-full max-w-full overflow-x-auto pb-3 rounded-2xl scrollbar-thin">
        <div className="min-w-[680px] max-w-4xl mx-auto rounded-3xl bg-white text-slate-900 border-4 border-blue-900 shadow-2xl p-4 sm:p-6 transition-colors relative select-none">
          {/* Inner Golden Accent Border */}
          <div className="rounded-2xl border-2 border-amber-600 p-5 sm:p-8 relative bg-white">
            {/* Top-Left Corner Geometric Accent */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600" />
            {/* Top-Right Corner Geometric Accent */}
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600" />
            {/* Bottom-Left Corner Geometric Accent */}
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600" />
            {/* Bottom-Right Corner Geometric Accent */}
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600" />

            {/* 1. Header Bar: Dual Logos & Institution Branding */}
            <div className="flex items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
              {/* EMufti AI Logo on Left */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src="/logo.png"
                    alt="EMufti AI Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left hidden min-[540px]:block">
                  <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider block">
                    EMufti AI
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block">
                    Islamic Platform
                  </span>
                </div>
              </div>

              {/* Center Institution Title */}
              <div className="text-center space-y-1 flex-1 px-2">
                <div className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  {"EMUFTI AI — ISLAMIC PLATFORM & XARUNTA QUR'AANKA KARIIMKA"}
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                  Barnaamijka Khidmada &amp; Tartanka Khatmka ({effectiveDuration} Maalmood)
                </p>
              </div>

              {/* Quran Page Logo on Right */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right hidden min-[540px]:block">
                  <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider block">
                    Quran Kareem
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold block">
                    Xarunta Qur'aanka
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src="/logo-quran.png"
                    alt="Quran Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 2. Certificate Titles */}
            <div className="text-center space-y-1.5 pt-5 pb-3">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase">
                SHAHAADADA KHATMKA QUR'AANKA KARIIMKA
              </h1>
              <h2 className="text-xs sm:text-sm font-black text-amber-600 tracking-widest uppercase">
                CERTIFICATE OF HOLY QURAN COMPLETION
              </h2>

              {/* Quranic Ayah Citation (Surah Al-Isra 17:9) */}
              <div className="max-w-2xl mx-auto pt-2 space-y-1">
                <div
                  dir="rtl"
                  className="font-quran-uthmani text-lg sm:text-xl text-blue-900 font-bold leading-relaxed"
                >
                  إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 italic font-medium">
                  “Indeed, this Quran guides to that which is most suitable and gives glad tidings to the believers” (Surah Al-Isra 17:9)
                </p>
              </div>
            </div>

            {/* 3. Recipient Section */}
            <div className="text-center space-y-2 py-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Waxaa sharaf iyo maamuus weyn leh loogu guddoonsiiyey (Presented to):
              </span>

              <div className="inline-block relative">
                <div className="text-2xl sm:text-4xl font-black text-blue-900 tracking-wide font-serif px-6 py-1">
                  {effectiveName}
                </div>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full mt-1" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed pt-1">
                Maadaama uu/ay si guul iyo xilkasnimo leh ugu dhammaysatay akhrinta <strong>30-ka Juzz (604 Bog)</strong> ee Qur'aanka Kariimka barnaamijka Khidmada {effectiveDuration} Maalmood, iyadoo la raacay nidaamka xiriirsan ee qaybinta bogagga ee 5-ta salaadood maalin kasta.
              </p>
            </div>

            {/* 4. 4 Summary Metric Boxes/Cards */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 py-3">
              <div className="p-3 rounded-xl bg-white border border-amber-300 text-center shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-blue-900 block">
                  30 Juzz
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Khatmo Buuxda
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-300 text-center shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-blue-900 block">
                  604 Bog
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  La Akhriyay
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-300 text-center shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-blue-900 block">
                  {effectiveTotalSessions || 150} Salaad
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Kalfadhiyo Xiriirsan
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-300 text-center shadow-2xs">
                <span className="text-xs sm:text-sm font-black text-blue-900 block">
                  3.6M+ Xasano
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Ajar La Xisaabiyay
                </span>
              </div>
            </div>

            {/* 5. Footer Details: Dates, Signature, and Official Transparent Stamp */}
            <div className="flex items-end justify-between gap-4 pt-6 mt-4 border-t border-slate-200">
              {/* Bottom-Left: Dates */}
              <div className="space-y-1 text-[11px] font-bold text-slate-600 text-left shrink-0">
                <div>
                  <span className="text-slate-400 font-medium">Taariikhda Bilowga:</span>{' '}
                  <span className="text-slate-800">{effectiveStartDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Taariikhda Dhammaystirka:</span>{' '}
                  <span className="text-slate-800">{effectiveCompletionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Taariikhda Bixinta (Issue Date):</span>{' '}
                  <span className="text-slate-800">{effectiveIssueDate}</span>
                </div>
              </div>

              {/* Center: Authorized Signature Block */}
              <div className="text-center space-y-1 shrink-0 pb-1">
                <div className="w-48 mx-auto border-b border-slate-400 h-6 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 font-bold text-sm">
                    Culimada EMufti
                  </span>
                </div>
                <div className="text-[11px] font-black text-blue-900">
                  {signatureText}
                </div>
                <div className="text-[9px] text-slate-500 font-semibold">
                  Guddoomiyaha Guddiga / Authorized Verification Signature
                </div>
              </div>

              {/* Bottom-Right: Official Transparent Stamp & Verification Badge */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Official Stamp Graphic */}
                <div className="relative">
                  <img
                    src="/images/official-stamp.png"
                    alt="Official Transparent Stamp"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-md"
                  />
                </div>

                {/* Verification Box */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-blue-900 text-center shadow-xs space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider block">
                    OFFICIAL VERIFIED CERTIFICATE
                  </span>
                  <div className="font-mono text-[10px] font-black text-slate-900">
                    ID: {effectiveScreenId}
                  </div>
                  <div className="font-mono text-[9px] text-slate-500">
                    SCREEN: {effectiveScreenId}
                  </div>
                  <span className="text-[8px] font-semibold text-blue-600 block mt-0.5">
                    Hubi: emufti.ai/verify-certificate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULLSCREEN MODAL PREVIEW
         ========================================================================= */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 p-3 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3 px-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-black text-sm uppercase">
                  Muuqaalka Rasmiga ah ee Shahaadada (Official Certificate Replica)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Certificate View */}
            <div className="overflow-x-auto p-1 bg-slate-950 rounded-2xl flex justify-center">
              <div className="w-[850px] shrink-0 rounded-2xl bg-white text-slate-900 border-4 border-blue-900 shadow-2xl p-6 relative">
                <div className="rounded-xl border-2 border-amber-600 p-6 relative bg-white">
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-amber-200/80 pb-3">
                    <img src="/logo.png" alt="EMufti AI Logo" className="w-14 h-14 object-contain" />
                    <div className="text-center space-y-0.5 flex-1">
                      <div className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-black uppercase">
                        {"EMUFTI AI — ISLAMIC PLATFORM & XARUNTA QUR'AANKA KARIIMKA"}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Barnaamijka Khidmada &amp; Tartanka Khatmka ({effectiveDuration} Maalmood)
                      </p>
                    </div>
                    <img src="/logo-quran.png" alt="Quran Logo" className="w-14 h-14 object-contain" />
                  </div>

                  {/* Titles */}
                  <div className="text-center space-y-1 pt-4 pb-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif uppercase">
                      SHAHAADADA KHATMKA QUR'AANKA KARIIMKA
                    </h1>
                    <h2 className="text-xs font-black text-amber-600 tracking-widest uppercase">
                      CERTIFICATE OF HOLY QURAN COMPLETION
                    </h2>
                    <div dir="rtl" className="font-quran-uthmani text-xl text-blue-900 font-bold pt-1">
                      إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      “Indeed, this Quran guides to that which is most suitable and gives glad tidings to the believers” (Surah Al-Isra 17:9)
                    </p>
                  </div>

                  {/* Recipient */}
                  <div className="text-center space-y-1.5 py-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">
                      Waxaa sharaf iyo maamuus weyn leh loogu guddoonsiiyey (Presented to):
                    </span>
                    <div className="text-3xl font-black text-blue-900 font-serif">
                      {effectiveName}
                    </div>
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-72 mx-auto" />
                    <p className="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed pt-1">
                      Maadaama uu/ay si guul iyo xilkasnimo leh ugu dhammaysatay akhrinta <strong>30-ka Juzz (604 Bog)</strong> ee Qur'aanka Kariimka barnaamijka Khidmada {effectiveDuration} Maalmood, iyadoo la raacay nidaamka xiriirsan ee qaybinta bogagga ee 5-ta salaadood maalin kasta.
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-3 py-2">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center">
                      <span className="text-xs font-black text-blue-900 block">30 Juzz</span>
                      <span className="text-[10px] text-slate-500 block">Khatmo Buuxda</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center">
                      <span className="text-xs font-black text-blue-900 block">604 Bog</span>
                      <span className="text-[10px] text-slate-500 block">La Akhriyay</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center">
                      <span className="text-xs font-black text-blue-900 block">{effectiveTotalSessions || 150} Salaad</span>
                      <span className="text-[10px] text-slate-500 block">Kalfadhiyo Xiriirsan</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-center">
                      <span className="text-xs font-black text-blue-900 block">3.6M+ Xasano</span>
                      <span className="text-[10px] text-slate-500 block">Ajar La Xisaabiyay</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between gap-4 pt-4 mt-2 border-t border-slate-200">
                    <div className="space-y-0.5 text-[10px] text-slate-600 font-semibold text-left">
                      <div>Taariikhda Bilowga: <span className="font-bold text-slate-800">{effectiveStartDate}</span></div>
                      <div>Taariikhda Dhammaystirka: <span className="font-bold text-slate-800">{effectiveCompletionDate}</span></div>
                      <div>Taariikhda Bixinta: <span className="font-bold text-slate-800">{effectiveIssueDate}</span></div>
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="w-40 border-b border-slate-400 font-serif italic text-blue-900 font-bold text-xs mx-auto">
                        Culimada EMufti
                      </div>
                      <div className="text-[10px] font-black text-blue-900">{signatureText}</div>
                      <div className="text-[8px] text-slate-500">Guddoomiyaha Guddiga / Authorized Verification Signature</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <img src="/images/official-stamp.png" alt="Official Stamp" className="w-20 h-20 object-contain drop-shadow-md" />
                      <div className="p-2 rounded-xl bg-white border border-blue-900 text-center text-[9px] font-mono">
                        <span className="font-black text-indigo-700 block">OFFICIAL VERIFIED</span>
                        <div className="font-bold text-slate-900">ID: {effectiveScreenId}</div>
                        <div className="text-slate-500">SCREEN: {effectiveScreenId}</div>
                        <span className="text-[7.5px] text-blue-600 block">emufti.ai/verify-certificate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 px-2">
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Xidh (Close)
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isBusy}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBusy ? 'Diyaarinaya...' : 'Degso PDF Shahaadada'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
