import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sparkles,
  Calendar,
  Gift,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface RamadanCountdownTime {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const RAMADAN_TARGET_DATE_STR = 'February 7, 2027';
export const RAMADAN_TARGET_ISO = '2027-02-07T00:00:00Z';
export const RAMADAN_EXACT_MODAL_MESSAGE = 'Not available this offer. Wait until 7 February 2027.';

// Official launch and visibility schedule: 20 January 2027
export const RAMADAN_SCHEDULED_LAUNCH_STR = 'January 20, 2027';
export const RAMADAN_SCHEDULED_LAUNCH_ISO = '2027-01-20T00:00:00Z';

/**
 * Determines if the Ramadan Bundle banner is officially scheduled to be visible.
 * Launches automatically on 20 January 2027.
 */
export function isRamadanBannerScheduledVisible(dateInput?: Date | string | number): boolean {
  if (typeof window !== 'undefined') {
    try {
      const override = localStorage.getItem('emufti_ramadan_banner_force_show');
      if (override === 'true') return true;
      if (override === 'false') return false;
    } catch {}
  }
  const now = dateInput ? new Date(dateInput) : new Date();
  const launchDate = new Date(RAMADAN_SCHEDULED_LAUNCH_ISO);
  return now.getTime() >= launchDate.getTime();
}

export function calculateRamadanTimeLeft(targetDate = new Date(RAMADAN_TARGET_ISO)): RamadanCountdownTime {
  const now = new Date();
  if (targetDate.getTime() <= now.getTime()) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  // Calculate calendar months
  let cursor = new Date(now.getTime());
  let months = 0;
  while (true) {
    const nextMonth = new Date(cursor.getTime());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth.getTime() <= targetDate.getTime()) {
      cursor = nextMonth;
      months++;
    } else {
      break;
    }
  }

  const remainingMs = targetDate.getTime() - cursor.getTime();
  const totalDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const remainingHoursMs = remainingMs % (1000 * 60 * 60 * 24);
  const hours = Math.floor(remainingHoursMs / (1000 * 60 * 60));
  const remainingMinutesMs = remainingHoursMs % (1000 * 60 * 60);
  const minutes = Math.floor(remainingMinutesMs / (1000 * 60));
  const seconds = Math.floor((remainingMinutesMs % (1000 * 60)) / 1000);

  return { months, weeks, days, hours, minutes, seconds, isPast: false };
}

export interface RamadanOfferBannerProps {
  onOpenModalExternal?: boolean;
  onRequestCloseExternal?: () => void;
  forceShow?: boolean;
}

export const RamadanOfferBanner: React.FC<RamadanOfferBannerProps> = ({
  onOpenModalExternal,
  onRequestCloseExternal,
  forceShow = false,
}) => {
  const { direction, language } = useLanguage();
  const targetDate = new Date(RAMADAN_TARGET_ISO);
  const [timeLeft, setTimeLeft] = useState<RamadanCountdownTime>(() => calculateRamadanTimeLeft(targetDate));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRtl = direction === 'rtl' || language === 'ar';
  const isScheduledVisible = forceShow || isRamadanBannerScheduledVisible();

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateRamadanTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize external modal trigger if provided
  useEffect(() => {
    if (onOpenModalExternal) {
      setIsModalOpen(true);
    }
  }, [onOpenModalExternal]);

  // Slides for rotation
  const slides = [
    {
      badge: '🌙 RAMADAN BUNDLE 1448',
      title: 'Ramadan 1448 Special Bundle',
      titleSomali: 'Xidhmada Gaarka ah ee Bisha Ramadaan 1448 H',
      desc: 'Full Quran mushaf, interactive audio Subcis, and unlimited verified scholarly AI guidance.',
      descSomali: 'Qur\'aanka oo dhan, Subcis cod ah, tafsiir qoto dheer iyo hagaha AI Muftiga.',
    },
    {
      badge: '✨ EXCLUSIVE ISLAMIC ACCESS',
      title: 'Complete Digital Quran & Subcis Companion',
      titleSomali: 'Barashada & Xafididda Qur\'aanka Kariimka ah',
      desc: 'Listen to 50 renowned Qaris, practice alternating recitation, and explore authentic tafsir.',
      descSomali: 'Dhageyso 50 Qaari oo caan ah, ku celceli subciska, oo baro tafsiirka saxda ah.',
    },
    {
      badge: '⏳ SCHEDULED LAUNCH: 20 JANUARY 2027',
      title: 'Scheduled Launch on 20 January 2027',
      titleSomali: 'Jadwalka Furitaanka: 20 Janaayo 2027',
      desc: 'Official launch on 20 January 2027. All Ramadan subscription features unlock on 7 February 2027.',
      descSomali: 'Jadwalka rasmiga ah ee furitaanka xidhmada bisha barakeysan ee Ramadaan 1448 H.',
    },
  ];

  // Rotate slides automatically every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  const handleClaimClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onRequestCloseExternal?.();
  };

  // If banner is not scheduled for launch yet and not forced, hide it from the active dashboard
  if (!isScheduledVisible) {
    if (!isModalOpen) return null;
    return (
      /* Claim Offer Popup Modal with EXACT REQUIRED MESSAGE */
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ramadan-modal-title"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={handleCloseModal}
      >
        <div
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-amber-400/50 dark:border-amber-500/40 p-6 sm:p-7 shadow-2xl shadow-amber-500/20 text-center animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Glowing Crescent & Gift Emblem */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20">
            <Moon className="w-7 h-7 fill-white/30 text-white animate-moon-interactive" />
          </div>

          {/* Modal Heading */}
          <h3
            id="ramadan-modal-title"
            className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2"
          >
            Ramadan Bundle (1448 H)
          </h3>

          {/* EXACT MESSAGE DISPLAYED PROMINENTLY AS REQUESTED */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 my-4 text-center shadow-inner">
            <div className="flex items-center justify-center gap-2 mb-1 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Notice</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold leading-snug">
              {RAMADAN_EXACT_MODAL_MESSAGE}
            </p>
          </div>

          {/* Somali Explanation */}
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-5 leading-relaxed">
            Codsigan hadda diyaar ma aha. Fadlan sug ilaa 7-da Febraayo 2027 marka ay bilaabato bisha barakeysan ee Ramadaan 1448 H.
          </p>

          {/* Countdown Snapshot */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-xs font-mono" dir="ltr">
            <div>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.months}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Months</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.weeks}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Weeks</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.days}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm block">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Hours</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Waan Fahmay / Understood
          </button>

          {/* Close Cross Button */}
          <button
            type="button"
            onClick={handleCloseModal}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Animated Rotating Ramadan Bundle Banner */}
      <div
        className="relative w-full max-w-full box-border mb-3 rounded-2xl overflow-hidden border border-amber-400/60 dark:border-amber-500/50 bg-gradient-to-r from-amber-50 via-blue-50/60 to-indigo-50/80 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 shadow-lg shadow-amber-500/15 p-3.5 sm:p-4 transition-all duration-300 animate-ramadan-glow ring-1 ring-amber-400/40 hover:ring-amber-500/80"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Ambient Shimmer / Glowing Accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-blue-500/15 dark:bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Left: Rotating Slide Content */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Top Glowing Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                <Moon className="w-3.5 h-3.5 fill-white text-white animate-moon-interactive" />
                <span>{activeSlide.badge}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Launch: 20 January 2027</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-medium bg-amber-100/70 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-800">
                <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                <span>Special Promotion</span>
              </span>
            </div>

            {/* Rotating Title & Description with smooth fade transition */}
            <div className="pt-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 transition-all">
                <span>{language === 'so' ? activeSlide.titleSomali : activeSlide.title}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-1 mt-0.5">
                {language === 'so' ? activeSlide.descSomali : activeSlide.desc}
              </p>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx
                      ? 'w-6 bg-amber-500 dark:bg-amber-400'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: EXACT COUNTDOWN UNITS (Months, Weeks, Days, Hours) & Claim Offer Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end shrink-0 pt-1 lg:pt-0">
            {/* Live Countdown Display: Months, Weeks, Days, Hours */}
            <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-slate-700 shadow-xs" dir="ltr">
              {/* Months */}
              <div className="flex flex-col items-center px-1.5 min-w-[34px]">
                <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                  {timeLeft.months}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                  Months
                </span>
              </div>
              <span className="text-amber-500/80 font-bold text-xs">:</span>

              {/* Weeks */}
              <div className="flex flex-col items-center px-1.5 min-w-[34px]">
                <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                  {timeLeft.weeks}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                  Weeks
                </span>
              </div>
              <span className="text-amber-500/80 font-bold text-xs">:</span>

              {/* Days */}
              <div className="flex flex-col items-center px-1.5 min-w-[34px]">
                <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                  {timeLeft.days}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                  Days
                </span>
              </div>
              <span className="text-amber-500/80 font-bold text-xs">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center px-1.5 min-w-[34px]">
                <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                  Hours
                </span>
              </div>
            </div>

            {/* Glowing Claim Offer Button */}
            <button
              type="button"
              onClick={handleClaimClick}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border border-amber-300/40"
              title="Claim Ramadan Bundle Offer"
            >
              <Gift className="w-4 h-4 text-white animate-bounce" />
              <span>Claim Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claim Offer Popup Modal with EXACT REQUIRED MESSAGE */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 w-full max-w-full box-border overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ramadan-modal-title"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-amber-400/50 dark:border-amber-500/40 p-5 sm:p-7 shadow-2xl shadow-amber-500/20 text-center animate-in zoom-in-95 duration-200 box-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Glowing Crescent & Gift Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20">
              <Moon className="w-7 h-7 fill-white/30 text-white animate-moon-interactive" />
            </div>

            {/* Modal Heading */}
            <h3
              id="ramadan-modal-title"
              className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2"
            >
              Ramadan Bundle (1448 H)
            </h3>

            {/* EXACT MESSAGE DISPLAYED PROMINENTLY AS REQUESTED */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 my-4 text-center shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-1 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Notice</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold leading-snug">
                {RAMADAN_EXACT_MODAL_MESSAGE}
              </p>
            </div>

            {/* Somali Explanation */}
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-5 leading-relaxed">
              Codsigan hadda diyaar ma aha. Fadlan sug ilaa 7-da Febraayo 2027 marka ay bilaabato bisha barakeysan ee Ramadaan 1448 H.
            </p>

            {/* Countdown Snapshot */}
            <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-xs font-mono" dir="ltr">
              <div>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.months}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Months</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.weeks}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Weeks</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">{timeLeft.days}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Days</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Hours</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Waan Fahmay / Understood
            </button>

            {/* Close Cross Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
