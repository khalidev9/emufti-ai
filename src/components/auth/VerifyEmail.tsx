import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  RotateCw,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export interface VerifyEmailProps {
  email: string;
  onSuccess?: () => void;
  onChangeEmail?: () => void;
  onBackToSignup?: () => void;
  onBackToLogin?: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  email,
  onSuccess,
  onChangeEmail,
  onBackToSignup,
  onBackToLogin,
}) => {
  const { verifyEmailOtp, resendVerificationOtp } = useAuth();
  const { t } = useLanguage();
  const handleBackToSignup = onBackToSignup || onChangeEmail;

  // 8 separate digit slots
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // 60-second cooldown for Resend Code
  const [cooldown, setCooldown] = useState<number>(60);
  const [showSpamTip, setShowSpamTip] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastAttemptedRef = useRef<string>('');

  // Focus first input box on initial mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 8;

  // Execute verification logic
  const executeVerification = async (codeToVerify: string) => {
    if (isVerifying) return;

    if (codeToVerify.length !== 8) {
      setError(
        t('auth.verify_enter_digits', 'Please enter the complete 8-digit verification code.')
      );
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsVerifying(true);
    lastAttemptedRef.current = codeToVerify;

    try {
      const res = await verifyEmailOtp(email, codeToVerify);
      if (res.success) {
        setSuccessMsg(
          t('auth.verify_success', 'Email verified successfully! Redirecting...')
        );
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 800);
      } else {
        setError(
          res.error ||
            t(
              'auth.verify_invalid_code',
              'Invalid or expired verification code. Please check your email or request a new code.'
            )
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle single character input & auto-advance & auto-submit
  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    setSuccessMsg(null);
    lastAttemptedRef.current = '';

    // Only allow numeric digits
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // If user typed/pasted multiple digits into one slot
    if (cleaned.length > 1) {
      handlePastedCode(cleaned);
      return;
    }

    const next = [...digits];
    next[index] = cleaned[0];
    setDigits(next);

    // Advance to next slot
    if (index < 7 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 8 digits are now filled
    const fullCode = next.join('');
    if (fullCode.length === 8) {
      executeVerification(fullCode);
    }
  };

  // Handle backspace navigation to previous slot
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      lastAttemptedRef.current = '';
      if (!digits[index] && index > 0) {
        // Move to previous and clear it
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 8-digit code into any slot
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePastedCode(pasted);
  };

  const handlePastedCode = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 8);
    if (!cleaned) return;

    const next = [...digits];
    for (let i = 0; i < 8; i++) {
      next[i] = cleaned[i] || '';
    }
    setDigits(next);

    // Focus the slot right after the pasted content or the last slot
    const targetIdx = Math.min(cleaned.length, 7);
    inputRefs.current[targetIdx]?.focus();

    // Auto-submit if complete 8-digit code was pasted
    if (cleaned.length === 8) {
      executeVerification(cleaned);
    }
  };

  // Submit OTP Verification button handler
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeVerification(otpCode);
  };

  // Resend Verification Code
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError(null);
    setSuccessMsg(null);
    setIsResending(true);

    try {
      const res = await resendVerificationOtp(email);
      if (res.success) {
        setSuccessMsg(res.message || 'A new 8-digit verification code has been requested.');
        setCooldown(60); // Restart 60-second cooldown
        // Clear slots and focus first
        setDigits(['', '', '', '', '', '', '', '']);
        lastAttemptedRef.current = '';
        inputRefs.current[0]?.focus();
      } else {
        setError(res.error || 'Failed to resend code. Please try again later.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-sm animate-float-slow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          {t('auth.verify_title', 'Verify your email')}
        </h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          {t(
            'auth.verify_desc',
            'Enter the 8-digit verification code sent to your email address.'
          )}
        </p>

        {/* Display Submitted Email */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium max-w-full truncate">
          <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[220px] sm:max-w-xs">{email}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold block">{error}</span>
            {error.toLowerCase().includes('expired') && (
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="mt-1.5 text-[11px] underline font-bold text-destructive hover:opacity-80 cursor-pointer block"
              >
                Click here to request a fresh code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block text-center">
            {t('auth.verify_code_label', '8-Digit Verification Code')}
          </label>

          {/* 8 Visual OTP Input Slots (dir="ltr" ensures left-to-right digit sequence across all languages) */}
          <div dir="ltr" className="flex items-center justify-center gap-0.5 min-[350px]:gap-1 sm:gap-2 max-w-full">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                autoComplete="one-time-code"
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${idx + 1}`}
                className={`w-7 min-[350px]:w-8 sm:w-10 md:w-11 h-10 min-[350px]:h-11 sm:h-13 text-center text-sm min-[350px]:text-base sm:text-lg font-bold font-mono rounded-lg min-[350px]:rounded-xl sm:rounded-2xl border transition-all outline-none bg-white text-slate-900 ${
                  digit
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={!isComplete || isVerifying}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('auth.verify_btn_loading', 'Verifying Code...')}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{t('auth.verify_btn', 'Verify Email')}</span>
            </>
          )}
        </button>

        {/* Resend Code Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer py-1"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('auth.resend_btn_loading', 'Sending new code...')}</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t('auth.resend_cooldown', `Resend Code in ${cooldown}s`).replace('{seconds}', cooldown.toString())}</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t('auth.resend_btn', 'Resend Code')}</span>
              </>
            )}
          </button>

          {/* Change Email / Back to Signup Option */}
          {handleBackToSignup && (
            <button
              type="button"
              onClick={handleBackToSignup}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1"
            >
              {t('auth.change_email', 'Change Email / Back to Signup')}
            </button>
          )}
        </div>

        {/* Spam / Custom SMTP delivery notice toggle */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowSpamTip(!showSpamTip)}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-blue-600" />
            <span>Didn't receive the email?</span>
          </button>

          {showSpamTip && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left leading-relaxed animate-in fade-in space-y-1">
              <p>
                {t(
                  'auth.verify_spam_notice',
                  'If you do not see the email, check your spam folder or verify your custom SMTP configuration in the Supabase Dashboard.'
                )}
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                Note: In Supabase Custom SMTP (Resend), make sure your sender email domain is fully verified in your Resend account.
              </p>
            </div>
          )}
        </div>

        {/* Return to Sign In */}
        {onBackToLogin && (
          <div className="pt-2 text-center border-t border-border/40">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
