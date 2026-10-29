import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import {
  KHATM_DURATION_OPTIONS,
  TOTAL_PAGES,
  PRAYER_SLOTS_DEF,
  calculateTargetEndDate,
  registerKhatmChallenge,
  KhatmChallengeData,
} from '../../lib/khatmChallengeService';

interface KhitmaRegistrationWizardProps {
  userId: string;
  defaultName: string;
  onRegistered: (challenge: KhatmChallengeData) => void;
  onCancel?: () => void;
  isLocked?: boolean;
  registeredChallenge?: KhatmChallengeData | null;
  onNavigateToTasks?: () => void;
}

export const KhitmaRegistrationWizard: React.FC<KhitmaRegistrationWizardProps> = ({
  userId,
  defaultName,
  onRegistered,
  onCancel,
  isLocked = false,
  registeredChallenge = null,
  onNavigateToTasks,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Name and Start Date (Locked to registeredChallenge if locked)
  const [fullName, setFullName] = useState<string>(() => {
    return registeredChallenge?.userName || defaultName || '';
  });
  const [startDate, setStartDate] = useState<string>(() => {
    return registeredChallenge?.startDate || new Date().toISOString().split('T')[0];
  });
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Duration Selector
  const [selectedDuration, setSelectedDuration] = useState<number | 'other'>(() => {
    if (registeredChallenge?.durationDays) {
      if ([30, 20, 15, 10, 7].includes(registeredChallenge.durationDays)) {
        return registeredChallenge.durationDays;
      }
      return 'other';
    }
    return 30;
  });
  const [customDays, setCustomDays] = useState<number>(() => {
    if (registeredChallenge?.durationDays && ![30, 20, 15, 10, 7].includes(registeredChallenge.durationDays)) {
      return registeredChallenge.durationDays;
    }
    return 25;
  });

  // Keep state synced if registeredChallenge changes
  useEffect(() => {
    if (registeredChallenge) {
      setFullName(registeredChallenge.userName);
      setStartDate(registeredChallenge.startDate);
      if ([30, 20, 15, 10, 7].includes(registeredChallenge.durationDays)) {
        setSelectedDuration(registeredChallenge.durationDays);
      } else {
        setSelectedDuration('other');
        setCustomDays(registeredChallenge.durationDays);
      }
    }
  }, [registeredChallenge]);

  // Step 3 & Submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Effective days for calculation
  const effectiveDays = useMemo(() => {
    if (selectedDuration === 'other') {
      return Math.max(1, Math.min(365, customDays || 25));
    }
    return selectedDuration;
  }, [selectedDuration, customDays]);

  // Derived calculations
  const calculatedDailyPages = useMemo(() => {
    return Math.ceil(TOTAL_PAGES / effectiveDays);
  }, [effectiveDays]);

  const calculatedPrayerPages = useMemo(() => {
    return Math.ceil(calculatedDailyPages / 5);
  }, [calculatedDailyPages]);

  const calculatedEndDate = useMemo(() => {
    return calculateTargetEndDate(startDate, effectiveDays);
  }, [startDate, effectiveDays]);

  // Step 1 validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setStep1Error('Fadlan geli magacaaga saddexan oo buuxa.');
      return;
    }
    if (!startDate) {
      setStep1Error('Fadlan dooro taariikhda bilaabashada.');
      return;
    }
    setStep1Error(null);
    setStep(2);
  };

  // Step 3 submission (Apply)
  const handleApply = async () => {
    if (isLocked) {
      if (onNavigateToTasks) {
        onNavigateToTasks();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const challenge = registerKhatmChallenge(
        userId,
        fullName.trim(),
        startDate,
        effectiveDays
      );

      // Display the required success message: "Waad ka mid noqotay bulshada khitma"
      setSuccessMessage('Waad ka mid noqotay bulshada khitma');

      // Immediately transition/redirect to the Task page post-submission
      setTimeout(() => {
        onRegistered(challenge);
      }, 400);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Permanent Lock Notification for Registered Users */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="block font-black text-amber-950 dark:text-amber-100">
                Qorshaha Khitmadaada Waa La Qufulay (Locked / Read-only)
              </span>
              <span className="block text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                Xogta diiwaangelintaadu (Magaca, Taariikhda Bilaabashada, Muddada) waa mid joogto ah oo lama beddeli karo ka dib markii la gudbiyay.
              </span>
            </div>
          </div>
          {onNavigateToTasks && (
            <button
              type="button"
              onClick={onNavigateToTasks}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>U gudub Bogga Hawlaha</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          WIZARD STEPPER HEADER
         ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>3-Step Khatma Setup</span>
              </span>
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wide">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Waa La Qufulay (Read-only)</span>
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
              Diiwaangelinta Tartanka Khitmada
            </h1>
          </div>

          <span className="w-fit self-start sm:self-auto text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 shrink-0">
            Tallaabada {step} ee 3
          </span>
        </div>

        {/* Stepper Dots & Line */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs font-bold">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 transition-all text-left cursor-pointer ${
              step === 1
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : step > 1
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step > 1 ? 'bg-emerald-600 text-white' : 'bg-white/20 text-current'
              }`}
            >
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <div className="hidden sm:block truncate">
              <span className="block text-[11px] font-black">Step 1</span>
              <span className="block text-[10px] opacity-85 truncate">Magaca &amp; Taariikhda</span>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 transition-all text-left cursor-pointer ${
              step === 2
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : step > 2
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step > 2 ? 'bg-emerald-600 text-white' : 'bg-white/20 text-current'
              }`}
            >
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <div className="hidden sm:block truncate">
              <span className="block text-[11px] font-black">Step 2</span>
              <span className="block text-[10px] opacity-85 truncate">Muddada &amp; Bogagga</span>
            </div>
          </button>

          {/* Step 3 Pill */}
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 transition-all text-left cursor-pointer ${
              step === 3
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black text-current">
              3
            </span>
            <div className="hidden sm:block truncate">
              <span className="block text-[11px] font-black">Step 3</span>
              <span className="block text-[10px] opacity-85 truncate">Xaqiijinta &amp; Codso</span>
            </div>
          </button>
        </div>
      </div>

      {/* Success Notification upon Apply */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-sm flex items-center gap-3 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 animate-bounce" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* =========================================================================
          STEP 1: FULL NAME & START DATE + CONTINUE
         ========================================================================= */}
      {step === 1 && (
        <form
          onSubmit={handleProceedToStep2}
          className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in"
        >
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Tallaabada 1-aad: Magaca Saddexan &amp; Taariikhda Bilaabashada</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Geli magacaaga rasmiga ah oo saddexan iyo taariikhda aad qorshaynayso inaad akhriska bilaawdo.
            </p>
          </div>

          {step1Error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold animate-in fade-in">
              {step1Error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full Name (Magaca saddexan / Magacaaga Rasmiga ah):</span>
                </span>
                {isLocked && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Waa la qufulay
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                readOnly={isLocked}
                value={fullName}
                onChange={(e) => {
                  if (!isLocked) setFullName(e.target.value);
                }}
                placeholder="Geli Magacaaga saddexan oo buuxa..."
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                  isLocked
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-not-allowed select-none'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                {isLocked
                  ? '🔒 Magacan mar hore ayaa la diiwaangeliyay oo loo qufulay si joogto ah (Lama beddeli karo).'
                  : 'Magacani wuxuu si toos ah ugu qormi doonaa Shahaadada Khatmka.'}
              </span>
            </div>

            {/* Start Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Start Date (Taariikhda uu bilaabayo / Taariikhda Bilaabashada):</span>
                </span>
                {isLocked && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Waa la qufulay
                  </span>
                )}
              </label>
              <input
                type="date"
                required
                readOnly={isLocked}
                disabled={isLocked}
                value={startDate}
                onChange={(e) => {
                  if (!isLocked) setStartDate(e.target.value);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
                  isLocked
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-not-allowed select-none'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 cursor-pointer'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                {isLocked
                  ? '🔒 Taariikhda bilowga waa la xidhay (Lama beddeli karo).'
                  : 'Maalinta koowaad ee aad bilaabayso tartanka'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
              >
                Ka Noqo
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer sm:ml-auto"
            >
              <span>Continue (Sii wad)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          STEP 2: DURATION SELECTOR (1 Month, 20 Days, 15 Days, 10 Days, 7 Days, Other)
          + AUTOMATIC CALCULATION OF PAGES REQUIRED PER PRAYER SESSION
         ========================================================================= */}
      {step === 2 && (
        <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Tallaabada 2-aad: Dooro Muddada &amp; Xisaabinta Bogagga Salaad Kasta</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xulo muddada kugu habboon. Nidaamku wuxuu si toos ah u xisaabinayaa bogagga aad akhrinayso salaad kasta.
            </p>
          </div>

          {/* Duration Options Grid */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Dooro Muddada Khatmka (Duration Options):</span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {effectiveDays} Maalmood • {calculatedDailyPages} Bog/Maalin
                {isLocked && ' (Waa la qufulay 🔒)'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {KHATM_DURATION_OPTIONS.map((opt) => {
                const isSelected = selectedDuration === opt.days;
                const durationTitle =
                  opt.days === 30
                    ? '1 Month'
                    : opt.days === 20
                    ? '20 Days'
                    : opt.days === 15
                    ? '15 Days'
                    : opt.days === 10
                    ? '10 Days'
                    : '7 Days';

                return (
                  <button
                    key={opt.days}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) setSelectedDuration(opt.days);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                      isLocked && !isSelected
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        : isLocked && isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02] cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                    }`}
                  >
                    <span className="text-[11px] font-bold block opacity-95 truncate">
                      {durationTitle}
                    </span>
                    {opt.days === 30 && (
                      <span className="text-[9px] opacity-75 block">1 Bil (30 M)</span>
                    )}
                    <span className="text-base sm:text-lg font-black block my-1">
                      {opt.dailyPages} Bog
                    </span>
                    <span className="text-[10px] font-medium block opacity-85">
                      ~{opt.prayerPages} B / Salaad
                    </span>
                  </button>
                );
              })}

              {/* Other Option */}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) setSelectedDuration('other');
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isLocked && selectedDuration !== 'other'
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : isLocked && selectedDuration === 'other'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 cursor-not-allowed'
                    : selectedDuration === 'other'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02] cursor-pointer'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                <span className="text-[11px] font-bold block opacity-95">Other (Kale)</span>
                <span className="text-base sm:text-lg font-black block my-1">
                  {selectedDuration === 'other' ? `${customDays} M` : 'Geli'}
                </span>
                <span className="text-[10px] font-medium block opacity-85">
                  Muuqad Gaar ah
                </span>
              </button>
            </div>

            {/* Custom Days Input */}
            {selectedDuration === 'other' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
                <div className="flex-1 text-xs text-slate-700 dark:text-slate-200">
                  <strong>Geli Tirada Maalmaha (Custom Days):</strong> Nidaamku wuxuu 604-ta bog u qaybinayaa maalmahaas.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    disabled={isLocked}
                    value={customDays}
                    onChange={(e) => {
                      if (!isLocked) {
                        setCustomDays(Math.max(1, parseInt(e.target.value || '1', 10)));
                      }
                    }}
                    className={`w-24 px-3 py-1.5 rounded-xl border text-center text-sm font-black ${
                      isLocked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Maalmood</span>
                </div>
              </div>
            )}
          </div>

          {/* Automatic Calculation of Pages Required Per Prayer Session */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:via-slate-850 dark:to-slate-800/40 border border-blue-200/80 dark:border-blue-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-blue-100 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Xisaabinta Tooska ah ee Bogagga Salaad Kasta
                </span>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Wadarta: {calculatedDailyPages} Bog Maalintii
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              {PRAYER_SLOTS_DEF.map((slot) => (
                <div
                  key={slot.key}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs"
                >
                  <span className="text-[11px] font-bold block text-slate-700 dark:text-slate-300">
                    {slot.somaliName}
                  </span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 block mt-1">
                    ~{calculatedPrayerPages} Bog
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Ka dib salaadda</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                604 Bog ÷ {effectiveDays} Maalmood = ~{calculatedDailyPages} bog maalintii ÷ 5 salaadood = <strong>~{calculatedPrayerPages} bog salaad kasta</strong>.
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dib u noqo</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue (Sii wad)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: SUMMARY CONFIRMATION & APPLY BUTTON
         ========================================================================= */}
      {step === 3 && (
        <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>
                {isLocked
                  ? 'Tallaabada 3-aad: Xogta Qorshaha Khitmada (Waa La Qufulay 🔒)'
                  : 'Tallaabada 3-aad: Xaqiijinta Qorshaha & Codso (Apply)'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLocked
                ? 'Qorshahaaga mar hore ayaa la xaqiijiyay. Hoos waxaad ka arkaysaa faahfaahinta la xidhay.'
                : 'Fadlan hubi xogtaada hoose ka hor inta aadan codsan (Apply).'}
            </p>
          </div>

          {/* Summary Confirmation Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Magaca Saddexan (Full Name)
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5 break-words">
                  {fullName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Muddada Tartanka (Duration)
                </span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 block mt-0.5">
                  {effectiveDays} Maalmood ({calculatedDailyPages} Bog / Maalin)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Taariikhda uu bilaabayo (Start Date)
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                  {startDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Taariikhda Dhamaynaysid (End Date)
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                  {calculatedEndDate}
                </span>
              </div>
            </div>

            {/* Quota breakdown reminder */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
              <span>
                Qoondadaada maalinlaha ah waa <strong>~{calculatedPrayerPages} bog salaad kasta</strong> (5 jeer maalinkii) si aad ugu dhammayso 604-ta bog taariikhda {calculatedEndDate}.
              </span>
            </div>

            {isLocked && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Xogta diiwaangelintaadu waa mid xiran (Locked / Read-only) oo lama beddeli karo ka dib markii la gudbiyay.
                </span>
              </div>
            )}
          </div>

          {/* Action Row: Back & Apply or Navigate to Tasks */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dib u noqo</span>
            </button>

            {isLocked ? (
              <button
                type="button"
                onClick={onNavigateToTasks}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>U gudub Bogga Hawlaha (Task Page)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApply}
                className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40 hover:ring-emerald-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse hover:animate-none"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <CheckCircle2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" />
                <span>{isSubmitting ? 'Diiwaangelinaya...' : 'Apply (Billaaw Khidmada)'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
