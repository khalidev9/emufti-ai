import React, { useState, useEffect, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { normalizePlanSlug, PlanSlug } from '../../types/database';

export interface CircularPlanAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  alt?: string;
  plan?: 'free' | 'pro' | 'premium' | string | null;
  showBadge?: boolean;
}

export const CircularPlanAvatar: React.FC<CircularPlanAvatarProps> = ({
  avatarUrl,
  displayName,
  email,
  size = 'md',
  className = '',
  alt,
  plan,
  showBadge = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const auth = useAuthSafe();

  // Reset error state whenever the avatarUrl changes
  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  // Determine authoritative subscription entitlement
  // If plan is explicitly passed, normalize it; otherwise fallback to auth context activePlan
  const rawPlan = plan !== undefined ? plan : auth?.activePlan;
  const cleanPlan: PlanSlug = normalizePlanSlug(rawPlan);
  const isPremium = cleanPlan === 'premium';
  const isPro = cleanPlan === 'pro';

  // Safe unique SVG IDs using React useId
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const blueGradientId = `blue-grad-${safeId}`;
  const goldGradientId = `gold-grad-${safeId}`;
  const greenGradientId = `green-grad-${safeId}`;
  const clipPathId = `avatar-clip-${safeId}`;

  // Dimension classes and numerical sizes
  const sizeClasses = typeof size === 'string'
    ? {
        xs: 'w-6 h-6',
        sm: 'w-7 h-7 sm:w-8 sm:h-8',
        md: 'w-8 h-8 sm:w-9 sm:h-9',
        lg: 'w-12 h-12',
        xl: 'w-24 h-24',
      }[size] || 'w-8 h-8 sm:w-9 sm:h-9'
    : '';

  const customStyle: React.CSSProperties = typeof size === 'number'
    ? { width: size, height: size }
    : {};

  const initial = (displayName?.trim()?.[0] || email?.trim()?.[0] || 'U').toUpperCase();
  const altText = alt || displayName || email || 'User Avatar';

  // SVG Geometry:
  // Paid users have an outer stroke with width 4.5; inner content radius is 45.5.
  // Free users have standard border with width 2; inner content radius is 48.
  // Authoritative subscription entitlement
  // Free: No glowing blue ring/border (clean neutral styling)
  // Pro: Distinct Green ring (border-green-500 / glowing emerald ring)
  // Premium: Distinct Blue ring (border-blue-500 / vibrant blue ring)
  const isPaid = isPremium || isPro;
  const innerRadius = isPaid ? 45.5 : 48;
  const imgInset = isPaid ? 4.5 : 2;
  const imgSize = isPaid ? 91 : 96;

  let ringContainerClasses = '';
  let ringStrokeUrl = '';
  let ringStrokeClass = '';
  let innerFillClass = '';
  let fallbackTextClass = '';

  if (isPremium) {
    ringContainerClasses = 'border-2 border-blue-500 ring-2 ring-blue-500/30 dark:ring-blue-400/40 bg-blue-600 shadow-xs shadow-blue-500/20';
    ringStrokeUrl = `url(#${blueGradientId})`;
    ringStrokeClass = 'text-blue-500 border-blue-500 ring-blue-500 border-blue-600 bg-blue-600';
    innerFillClass = 'fill-blue-50 dark:fill-blue-950/40';
    fallbackTextClass = 'fill-blue-600 dark:fill-blue-400';
  } else if (isPro) {
    ringContainerClasses = 'border-2 border-green-500 ring-2 ring-green-500/30 dark:ring-emerald-400/40 bg-emerald-600 shadow-xs shadow-green-500/20';
    ringStrokeUrl = `url(#${greenGradientId})`;
    ringStrokeClass = 'text-green-500 border-green-500 ring-green-500 border-emerald-500';
    innerFillClass = 'fill-emerald-50 dark:fill-emerald-950/40';
    fallbackTextClass = 'fill-emerald-600 dark:fill-emerald-400';
  } else {
    // Free Plan Users: Completely remove the glowing blue ring/border
    ringContainerClasses = 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs';
    ringStrokeUrl = 'none';
    ringStrokeClass = 'text-slate-200 dark:text-slate-700';
    innerFillClass = 'fill-slate-100 dark:fill-slate-800';
    fallbackTextClass = 'fill-slate-700 dark:fill-slate-300';
  }

  // Ensure any legacy shape preference is cleared
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('avatar_shape');
        localStorage.removeItem('avatarShape');
        localStorage.removeItem('profile_shape');
        localStorage.removeItem('profileShape');
      }
    } catch {}
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none rounded-full ${ringContainerClasses} ${sizeClasses} ${className}`}
      style={customStyle}
      data-plan={cleanPlan}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-hidden rounded-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={altText}
      >
        <defs>
          {/* Modern Blue Theme Gradient for Premium Profile Avatar */}
          <linearGradient id={blueGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* Green Gradient for Pro Profile Avatar */}
          <linearGradient id={greenGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Legacy Gold Gradient preserved in defs */}
          <linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          {/* Circular Clip Path for Avatar Image and Background */}
          <clipPath id={clipPathId}>
            <circle cx="50" cy="50" r={innerRadius} />
          </clipPath>
        </defs>

        {/* Inner Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={innerRadius}
          className={innerFillClass}
        />

        {/* User Avatar Image or Fallback Initial */}
        {avatarUrl && !hasError ? (
          <image
            href={avatarUrl}
            x={imgInset}
            y={imgInset}
            width={imgSize}
            height={imgSize}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipPathId})`}
            onError={() => setHasError(true)}
          />
        ) : (
          <g clipPath={`url(#${clipPathId})`}>
            <text
              x="50"
              y="53"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isPaid ? '38' : '40'}
              fontWeight="800"
              className={fallbackTextClass}
              style={{ userSelect: 'none' }}
            >
              {initial}
            </text>
          </g>
        )}

        {/* Plan-Based Circular SVG Stroke Border: Blue for Premium, Green for Pro, Neutral for Free */}
        {isPaid ? (
          <circle
            cx="50"
            cy="50"
            r="47.75"
            fill="none"
            stroke={isPro ? `url(#${greenGradientId})` : `url(#${blueGradientId})`}
            strokeWidth="4.5"
            className={ringStrokeClass}
          />
        ) : (
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-200 dark:text-slate-700"
          />
        )}
      </svg>

      {/* Online and status dots completely removed from profile icon per user specification (ZERO status dots) */}
    </div>
  );
};

// Safe hook wrapper to prevent crashes when CircularPlanAvatar is rendered outside AuthProvider
function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return null;
  }
}
