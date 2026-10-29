import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, X, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth, isAnnualBillingInterval } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { storage } from '../../lib/storage';
import { normalizePlanSlug } from '../../types/database';

interface PlanActivationBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export const PlanActivationBanner: React.FC<PlanActivationBannerProps> = ({
  onDismiss,
  className = '',
}) => {
  const { user, profile, activePlan, notifications, markNotificationAsRead } = useAuth();
  const { userPlan } = useChat();
  const userId = user?.id || 'guest_user';

  const [isVisible, setIsVisible] = useState(false);

  // 1. Look for unread plan activation notification in database
  const activeNotification = notifications?.find(
    (n) => n.type === 'plan_activation' && !n.is_read
  );

  const effectivePlan = normalizePlanSlug(activePlan || profile?.plan || userPlan);
  const isPaid = effectivePlan === 'pro' || effectivePlan === 'premium';
  const isAnnual =
    isAnnualBillingInterval(activeNotification?.metadata?.billing_interval) ||
    isAnnualBillingInterval(profile?.billing_interval);

  useEffect(() => {
    // If there is an active unread notification for the user, show it!
    if (activeNotification) {
      setIsVisible(true);
      return;
    }

    // Only show banner for active paid plans (Pro or Premium)
    if (!isPaid) {
      setIsVisible(false);
      return;
    }

    // Check if the user has already dismissed the congratulations notification for this specific plan
    const alreadySeen = storage.isPlanCongratsSeen(userId, effectivePlan);
    if (!alreadySeen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activeNotification, isPaid, userId, effectivePlan]);

  if (!isVisible || !isPaid) {
    return null;
  }

  const handleDismiss = () => {
    if (activeNotification) {
      markNotificationAsRead(activeNotification.id);
    }
    storage.markPlanCongratsSeen(userId, effectivePlan);
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const isPremium = effectivePlan === 'premium';
  const planDisplayName = isPremium ? 'Alim Research (Premium)' : 'Talib al-Ilm (Pro)';
  const planLabel = isPremium ? 'Premium' : 'Pro';
  const durationLabel = isAnnual ? 'sanad' : 'bil';

  // Somali congratulatory notification as explicitly specified in requirements:
  // "Hambalyo! Waxaad heshay subscription-kaaga [Pro/Premium] muddo [bil/sanad] ah. Ku raaxayso adeegga EMufti AI."
  const somaliMessage =
    activeNotification?.message ||
    `Hambalyo! Waxaad heshay subscription-kaaga ${planLabel} muddo ${durationLabel} ah. Ku raaxayso adeegga EMufti AI.`;

  const startDate =
    activeNotification?.metadata?.start_date || profile?.plan_activated_at;
  const expiresDate =
    activeNotification?.metadata?.expires_at || profile?.plan_expires_at;

  const formattedStart = startDate
    ? new Date(startDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : undefined;

  const formattedExpires = expiresDate
    ? new Date(expiresDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
        isPremium
          ? 'bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-500/10 border-amber-500/30 text-slate-100 shadow-amber-500/5'
          : 'bg-gradient-to-r from-blue-500/15 via-slate-900/90 to-blue-500/10 border-blue-500/30 text-slate-100 shadow-blue-500/5'
      } ${className}`}
    >
      {/* Decorative background glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 ${
          isPremium ? 'bg-amber-400' : 'bg-blue-400'
        }`}
      />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
              isPremium
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
            }`}
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
                  isPremium
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span title={isPremium ? 'PREMIUM ACTIVE' : 'PRO ACTIVE'}>{isPremium ? 'PREMIUM' : 'PRO'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isPremium ? '1,000 Questions/Day + Quran Premium' : '150 Questions/Day + Quran Pro'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {somaliMessage}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {isPremium
                ? 'Congratulations! Your Premium Plan is now active. • تهانينا! تم تفعيل اشتراكك المميز بنجاح.'
                : 'Congratulations! Your Pro Plan is now active. • تهانينا! تم تفعيل اشتراكك الاحترافي بنجاح.'}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300/90 leading-relaxed">
              <span>
                Plan: <strong className="text-white">{planDisplayName}</strong>
              </span>
              {formattedStart && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Bilaabmay: {formattedStart}</span>
                </span>
              )}
              {formattedExpires && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Dhacaya: {formattedExpires}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Quran {isPremium ? 'Premium' : 'Pro'} Bundled</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <button
            onClick={handleDismiss}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 ${
              isPremium
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <span>Waayahay (Acknowledge)</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanActivationBanner;
