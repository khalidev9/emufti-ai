import React from 'react';
import { Check, Sparkles, Star } from 'lucide-react';
import { normalizePlanSlug, PlanSlug } from '../../types/database';

export interface SubscriptionBadgeProps {
  plan?: PlanSlug | string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabelOnly?: boolean;
  className?: string;
}

/**
 * SubscriptionBadge: Renders the official subscription status badge for EMufti AI.
 * - Pro: Green circular status indicator (circle with white checkmark) + PRO label.
 * - Premium: Blue circular status indicator (circle with white star) + PREMIUM label.
 * - Free: Simple clean FREE label.
 */
export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  plan = 'free',
  size = 'sm',
  showLabelOnly = false,
  className = '',
}) => {
  const cleanPlan = normalizePlanSlug(plan);

  // Size styling maps
  const sizeClasses = {
    xs: {
      badge: 'text-[9px] px-1.5 py-0.5 gap-1',
      circle: 'w-2.5 h-2.5',
      icon: 'w-2 h-2',
    },
    sm: {
      badge: 'text-[10px] px-2 py-0.5 gap-1.5',
      circle: 'w-3 h-3',
      icon: 'w-2 h-2',
    },
    md: {
      badge: 'text-xs px-2.5 py-1 gap-1.5',
      circle: 'w-3.5 h-3.5',
      icon: 'w-2.5 h-2.5',
    },
    lg: {
      badge: 'text-sm px-3.5 py-1.5 gap-2',
      circle: 'w-4 h-4',
      icon: 'w-3 h-3',
    },
  }[size] || {
    badge: 'text-[10px] px-2 py-0.5 gap-1.5',
    circle: 'w-3 h-3',
    icon: 'w-2 h-2',
  };

  if (cleanPlan === 'pro') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs select-none ${sizeClasses.badge} ${className}`}
        title="Pro Subscriber (Talib Seeker)"
      >
        {!showLabelOnly && (
          <span className={`rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 ${sizeClasses.circle}`}>
            <Check className={`${sizeClasses.icon} stroke-[3]`} />
          </span>
        )}
        <span className="font-black text-emerald-800">PRO</span>
      </span>
    );
  }

  if (cleanPlan === 'premium') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs select-none ${sizeClasses.badge} ${className}`}
        title="Premium Subscriber (Alim Scholar)"
      >
        {!showLabelOnly && (
          <span className={`rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ${sizeClasses.circle}`}>
            <Star className={`${sizeClasses.icon} fill-white stroke-[2.5]`} />
          </span>
        )}
        <span className="font-black text-blue-800">PREMIUM</span>
      </span>
    );
  }

  // Free Tier
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 select-none ${sizeClasses.badge} ${className}`}
      title="Free Seeker"
    >
      <span className="font-bold text-slate-500">FREE</span>
    </span>
  );
};
