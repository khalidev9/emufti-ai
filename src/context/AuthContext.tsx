import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';
import {
  Profile,
  UserRole,
  UserNotification,
  PlanSlug,
  UserSecurityEvent,
  normalizePlanSlug,
  normalizeSubscriptionStatus,
} from '../types/database';
import { storage } from '../lib/storage';
import { isValidLanguage, SupportedLanguage } from '../lib/i18n';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  user_metadata?: Record<string, any>;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  activePlan: PlanSlug;
  quranPlan: string;
  isPaidPlan: boolean;
  subscription: any | null;
  profileError: string | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  notifications: UserNotification[];
  unreadNotificationCount: number;
  refreshProfile: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{
    error?: string;
    isLocked?: boolean;
    remainingMinutes?: number;
    isUnconfirmed?: boolean;
    email?: string;
  }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  adminSignIn: (usernameOrEmail: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
    phoneNumber?: string,
    phoneCountryCode?: string,
    preferredLanguage?: 'so' | 'en' | 'ar'
  ) => Promise<{
    error?: string;
    message?: string;
    requiresVerification?: boolean;
    email?: string;
    isExistingUser?: boolean;
  }>;
  verifyEmailOtp: (
    email: string,
    token: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  resendVerificationOtp: (
    email: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  signOutOthers: () => Promise<{ error?: string; success?: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string; notice?: string }>;
  removeAvatar: () => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
  unlockAccount: (email: string) => Promise<boolean>;
  fetchSecurityEvents: () => Promise<UserSecurityEvent[]>;
  recordSecurityEvent: (eventType: string, deviceInfo?: string) => Promise<void>;
  loginAsGuest?: () => void;
  loginAsAdminDemo?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GUEST_KEY = 'emufti_auth_guest';
const ADMIN_LOCKOUT_KEY = 'emufti_admin_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const USER_LOCKOUT_PREFIX = 'emufti_user_lockout_';
const USER_MAX_ATTEMPTS = 3;
const USER_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function isAnnualBillingInterval(interval?: string | null): boolean {
  if (!interval) return false;
  const clean = interval.trim().toLowerCase();
  return clean === 'yearly' || clean === 'annual' || clean === 'year' || clean === '1 year';
}

export function getSubscriptionDurationDays(interval?: string | null): number {
  return isAnnualBillingInterval(interval) ? 365 : 30;
}

export function isNetworkResetError(err: any): boolean {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err.message || err.details || '').toLowerCase();
  return (
    err instanceof TypeError ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('connection reset') ||
    msg.includes('err_connection_reset') ||
    msg.includes('err_name_not_resolved') ||
    msg.includes('err_connection_refused') ||
    msg.includes('err_internet_disconnected') ||
    msg.includes('load failed') ||
    msg.includes('network request failed')
  );
}

export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 2,
  initialDelayMs = 350
): Promise<{ data: T | null; error: any }> {
  let attempt = 0;
  while (true) {
    try {
      const result = await queryFn();
      if (!result.error) {
        return result;
      }
      if (!isNetworkResetError(result.error) || attempt >= maxRetries) {
        return result;
      }
    } catch (thrown: any) {
      if (!isNetworkResetError(thrown) || attempt >= maxRetries) {
        return { data: null, error: thrown };
      }
    }
    attempt++;
    const delay = initialDelayMs * Math.pow(1.5, attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export function constructFallbackProfile(
  uid: string,
  email?: string,
  overridePlan?: PlanSlug
): Profile {
  let localAvatar: string | undefined;
  let localPhone: string | undefined;
  let localCountryCode = 'SO';
  let localDisplayName = email ? email.split('@')[0] : 'Knowledge Seeker';
  let localLang: 'so' | 'en' | 'ar' = 'en';
  let localTheme: 'light' | 'dark' | 'system' = 'system';
  const localRole: UserRole = (email?.toLowerCase() === 'admin@emufti.ai') ? 'admin' : 'user';

  try {
    localAvatar = localStorage.getItem(`emufti_avatar_${uid}`) || undefined;
    const rawOverrides = localStorage.getItem(`emufti_profile_overrides_${uid}`);
    if (rawOverrides) {
      const parsed = JSON.parse(rawOverrides);
      localAvatar = localAvatar || parsed.avatar_url;
      localPhone = parsed.phone_number || localPhone;
      localCountryCode = parsed.phone_country_code || localCountryCode;
      localDisplayName = parsed.display_name || localDisplayName;
      localLang = parsed.preferred_language || localLang;
      localTheme = parsed.theme || localTheme;
    }
  } catch {}

  const activePlan = overridePlan || storage.getUserActivePlan(uid) || 'free';

  return {
    id: uid,
    email: email || '',
    display_name: localDisplayName,
    avatar_url: localAvatar,
    phone_number: localPhone,
    phone_country_code: localCountryCode,
    preferred_language: localLang,
    default_response_language: 'auto',
    theme: localTheme,
    role: localRole,
    plan: activePlan,
    quran_plan: activePlan,
    billing_interval: 'monthly',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function getAccountHash(email: string): string {
  const clean = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + '_' + clean.substring(0, 4);
}

function checkLocalUserLockout(email: string): { isLocked: boolean; remainingMinutes?: number } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return { isLocked: false };
    const key = USER_LOCKOUT_PREFIX + getAccountHash(email);
    const raw = localStorage.getItem(key);
    if (!raw) return { isLocked: false };
    const { attempts, lockedUntil } = JSON.parse(raw);
    const now = Date.now();
    if (lockedUntil && lockedUntil > now) {
      const remainingMinutes = Math.max(1, Math.ceil((lockedUntil - now) / 60000));
      return { isLocked: true, remainingMinutes };
    }
    if (lockedUntil && lockedUntil <= now) {
      localStorage.removeItem(key);
      return { isLocked: false };
    }
    return { isLocked: attempts >= USER_MAX_ATTEMPTS };
  } catch {
    return { isLocked: false };
  }
}

function recordLocalUserFailure(email: string): { isLocked: boolean; attempts: number } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return { isLocked: false, attempts: 1 };
    const key = USER_LOCKOUT_PREFIX + getAccountHash(email);
    const raw = localStorage.getItem(key);
    const now = Date.now();
    let attempts = 1;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.lockedUntil || parsed.lockedUntil <= now) {
        attempts = (parsed.attempts || 0) + 1;
      }
    }
    const isLocked = attempts >= USER_MAX_ATTEMPTS;
    const lockedUntil = isLocked ? now + USER_LOCKOUT_MS : null;
    localStorage.setItem(key, JSON.stringify({ attempts, lockedUntil, lastFailed: now }));
    return { isLocked, attempts };
  } catch {
    return { isLocked: false, attempts: 1 };
  }
}

function clearLocalUserLockout(email: string) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = USER_LOCKOUT_PREFIX + getAccountHash(email);
      localStorage.removeItem(key);
    }
  } catch {}
}

function checkLockout(): { locked: boolean; remainingMinutes?: number } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return { locked: false };
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { locked: false };
    const { attempts, lastAttempt } = JSON.parse(raw);
    const now = Date.now();
    if (now - lastAttempt > LOCKOUT_DURATION_MS) {
      try {
        localStorage.removeItem(ADMIN_LOCKOUT_KEY);
      } catch {}
      return { locked: false };
    }
    if (attempts >= MAX_ATTEMPTS) {
      const remainingMinutes = Math.ceil((LOCKOUT_DURATION_MS - (now - lastAttempt)) / 60000);
      return { locked: true, remainingMinutes: Math.max(1, remainingMinutes) };
    }
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

function recordFailedAttempt(): number {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 1;
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    const now = Date.now();
    let attempts = 1;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (now - parsed.lastAttempt < LOCKOUT_DURATION_MS) {
        attempts = parsed.attempts + 1;
      }
    }
    localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify({ attempts, lastAttempt: now }));
    return attempts;
  } catch {
    return 1;
  }
}

function clearLockout() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(ADMIN_LOCKOUT_KEY);
    }
  } catch {}
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notificationsAvailableRef = useRef<boolean>(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('emufti_user_notifications_missing') !== 'true'
      : true
  );

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  const loadNotifications = useCallback(async (uid: string) => {
    if (!uid || !isUuid(uid)) return;

    // Skip remote fetch if user_notifications table is confirmed missing from PostgREST schema cache
    if (
      isSupabaseConfigured &&
      notificationsAvailableRef.current &&
      typeof window !== 'undefined' &&
      sessionStorage.getItem('emufti_user_notifications_missing') !== 'true'
    ) {
      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setNotifications(data as UserNotification[]);
          return;
        }

        if (error) {
          const isMissing =
            error.code === 'PGRST205' ||
            error.code === '42P01' ||
            error.message?.includes('schema cache') ||
            error.message?.includes('does not exist') ||
            (error as any).status === 404 ||
            (error as any)?.statusCode === 404 ||
            (error as any)?.statusCode === '404';

          if (isMissing) {
            notificationsAvailableRef.current = false;
            try {
              sessionStorage.setItem('emufti_user_notifications_missing', 'true');
            } catch {}
          }
        }
      } catch (err: any) {
        notificationsAvailableRef.current = false;
        try {
          sessionStorage.setItem('emufti_user_notifications_missing', 'true');
        } catch {}
      }
    }

    // Local fallback for offline/development notification records
    try {
      const localKey = `emufti_notifs_${uid}`;
      const raw = localStorage.getItem(localKey);
      if (raw) {
        setNotifications(JSON.parse(raw) as UserNotification[]);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    if (user?.id) {
      try {
        const localKey = `emufti_notifs_${user.id}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const parsed = JSON.parse(raw) as UserNotification[];
          const updated = parsed.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n));
          localStorage.setItem(localKey, JSON.stringify(updated));
        }
      } catch {}
    }

    if (
      isSupabaseConfigured &&
      notificationsAvailableRef.current &&
      typeof window !== 'undefined' &&
      sessionStorage.getItem('emufti_user_notifications_missing') !== 'true'
    ) {
      try {
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq('id', notificationId);
        if (error) {
          const isMissing =
            error.code === 'PGRST205' ||
            error.code === '42P01' ||
            error.message?.includes('schema cache') ||
            error.message?.includes('does not exist') ||
            (error as any).status === 404 ||
            (error as any)?.statusCode === 404 ||
            (error as any)?.statusCode === '404';
          if (isMissing) {
            notificationsAvailableRef.current = false;
            try {
              sessionStorage.setItem('emufti_user_notifications_missing', 'true');
            } catch {}
          }
        }
      } catch (err: any) {
        notificationsAvailableRef.current = false;
        try {
          sessionStorage.setItem('emufti_user_notifications_missing', 'true');
        } catch {}
      }
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await fetchProfile(session.user.id, session.user.email);
            await loadNotifications(session.user.id);
          } else {
            clearGuestSession();
          }
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_ev, s) => {
            if (s?.user) {
              setUser({ id: s.user.id, email: s.user.email || '' });
              await fetchProfile(s.user.id, s.user.email);
              await loadNotifications(s.user.id);
            } else {
              clearGuestSession();
            }
          });
          return () => subscription.unsubscribe();
        } else {
          clearGuestSession();
        }
      } catch {
        clearGuestSession();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    function clearGuestSession() {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setProfileError(null);
      setNotifications([]);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(GUEST_KEY);
        }
      } catch {}
    }
    initAuth();
    return () => { mounted = false; };
  }, [loadNotifications]);

  // Realtime Supabase Channel for instant update upon admin approval or status changes
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id || !isUuid(user.id)) return;

    const channel = supabase
      .channel(`realtime-user-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        async () => {
          console.info('[AuthContext] Realtime profile update received, refreshing profile...');
          await fetchProfile(user.id, user.email);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          console.info('[AuthContext] Realtime subscription update received, refreshing profile...');
          await fetchProfile(user.id, user.email);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_requests',
        },
        async (payload: any) => {
          const rec = payload.new || payload.old;
          if (
            rec?.user_id === user.id ||
            (user.email && rec?.email?.toLowerCase() === user.email.toLowerCase())
          ) {
            console.info('[AuthContext] Realtime plan_request update for user received, refreshing profile...');
            await fetchProfile(user.id, user.email);
            await loadNotifications(user.id);
          }
        }
      )
    if (
      notificationsAvailableRef.current &&
      typeof window !== 'undefined' &&
      sessionStorage.getItem('emufti_user_notifications_missing') !== 'true'
    ) {
      try {
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await loadNotifications(user.id);
          }
        );
      } catch {}
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email, loadNotifications]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
      await loadNotifications(user.id);
    }
  }, [user?.id, user?.email, loadNotifications]);

  async function fetchProfile(uid: string, email?: string) {
    if (!uid || !isUuid(uid)) {
      return;
    }

    // Immediately resolve a solid local fallback so that any network interruption
    // never leaves the user with null profile or a blank unauthenticated screen.
    const fallbackProfile = constructFallbackProfile(uid, email);

    try {
      if (isSupabaseConfigured) {
        // 1. Fetch user profile from database with resilient retry on connection resets
        let queryRes: { data: any; error: any } = { data: null, error: null };
        try {
          queryRes = await retrySupabaseQuery(async () => {
            return await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .maybeSingle();
          }, 2, 400);
        } catch (fetchErr: any) {
          queryRes = { data: null, error: fetchErr };
        }

        const { data, error } = queryRes;

        if (error) {
          if (isNetworkResetError(error)) {
            console.warn('[AuthContext] Network connection reset during profile fetch, applying resilient local fallback:', error.message || error);
            setProfile((prev) => prev || fallbackProfile);
            setProfileError(null);
            return;
          } else {
            console.warn('[AuthContext] Profile query notice:', error.message);
            setProfileError(error.message);
          }
        } else {
          setProfileError(null);
        }

        // Determine active plan and entitlements from database profile or subscriptions ledger
        const profilePlan = normalizePlanSlug(data?.plan);
        const isProfilePlanUnexpired = !data?.plan_expires_at || new Date(data.plan_expires_at) > new Date();
        let dbPlan: PlanSlug = isProfilePlanUnexpired && (profilePlan === 'pro' || profilePlan === 'premium')
          ? profilePlan
          : 'free';
        let dbQuranPlan: string = (data?.quran_plan as string) || (dbPlan !== 'free' ? dbPlan : 'free');
        let planActivatedAt: string | undefined = data?.plan_activated_at || data?.started_at;
        let planExpiresAt: string | undefined = data?.plan_expires_at || data?.expires_at;
        let billingInterval: 'monthly' | 'yearly' = isAnnualBillingInterval(data?.billing_interval) ? 'yearly' : 'monthly';

        // 2. Query authoritative subscriptions table ledger for this user
        // We query all subscriptions for the authenticated user to ensure that canceled subscriptions
        // NEVER override the single active, unexpired subscription.
        try {
          const { data: subsData, error: subErr } = await retrySupabaseQuery(async () => {
            return await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', uid)
              .eq('status', 'active')
              .order('current_period_end', { ascending: false });
          }, 1, 300);

          if (subErr) {
            console.warn('[AuthContext] Subscription lookup notice:', subErr.message);
            setProfileError(subErr.message);
            // DO NOT downgrade dbPlan on query error!
          } else if (subsData && Array.isArray(subsData)) {
            const now = new Date();
            // Filter all active, unexpired subscriptions
            const activeSubs = subsData.filter((s: any) => {
              const normStatus = normalizeSubscriptionStatus(s?.status);
              const normPlan = normalizePlanSlug(s?.plan);
              const notExpired = !s?.current_period_end || new Date(s.current_period_end) > now;
              return normStatus === 'active' && (normPlan === 'pro' || normPlan === 'premium') && notExpired;
            });

            // Strict tier precedence: active PREMIUM strictly takes precedence over PRO
            const activeSub = activeSubs.find((s: any) => normalizePlanSlug(s?.plan) === 'premium')
              || activeSubs.find((s: any) => normalizePlanSlug(s?.plan) === 'pro');

            if (activeSub) {
              setSubscription(activeSub);
              const normSubPlan = normalizePlanSlug(activeSub.plan);
              // Respect tier precedence: If profile or dbPlan already has unexpired premium, do not downgrade to pro
              if (normSubPlan === 'premium' || dbPlan !== 'premium') {
                dbPlan = normSubPlan;
                dbQuranPlan = normSubPlan;
                planActivatedAt = activeSub.current_period_start || activeSub.started_at || planActivatedAt;
                planExpiresAt = activeSub.current_period_end || activeSub.expires_at;
                billingInterval = isAnnualBillingInterval(activeSub.billing_interval) ? 'yearly' : 'monthly';
              }
            } else {
              setSubscription(null);
              // Only downgrade if the user's profile also has no unexpired plan
              if (!isProfilePlanUnexpired || (profilePlan !== 'pro' && profilePlan !== 'premium')) {
                const hasExpiredSub = subsData.some((s: any) => {
                  const normStatus = normalizeSubscriptionStatus(s?.status);
                  return normStatus === 'active' && s?.current_period_end && new Date(s.current_period_end) <= now;
                });
                if (hasExpiredSub) {
                  dbPlan = 'free';
                  dbQuranPlan = 'expired';
                }
              }
            }
          }
        } catch (subErr) {
          console.warn('[AuthContext] Subscription ledger lookup exception:', subErr);
        }

        // 3. Resilience Check: Check for approved & payment-verified plan_requests (including upgrades from pro to premium)
        if (dbPlan === 'free' || dbPlan === 'pro') {
          try {
            const userEmail = email ? email.toLowerCase() : null;
            const { data: approvedReqs } = await retrySupabaseQuery(async () => {
              return await supabase
                .from('plan_requests')
                .select('*')
                .or(`user_id.eq.${uid}${userEmail ? `,email.eq.${userEmail}` : ''}`)
                .in('status', ['approved', 'completed'])
                .eq('payment_verified', true)
                .order('updated_at', { ascending: false });
            }, 1, 300);

            if (approvedReqs && approvedReqs.length > 0) {
              // Find unexpired approved request, prioritizing premium upgrades
              const approvedReq = approvedReqs.find((r: any) => {
                const rPlan = normalizePlanSlug(r.plan_slug || r.plan);
                const rInterval = (r.billing_interval as any) || 'monthly';
                const rDurationDays = getSubscriptionDurationDays(rInterval);
                const approvedTime = new Date(r.updated_at || r.created_at || Date.now()).getTime();
                const periodEnd = new Date(approvedTime + rDurationDays * 24 * 60 * 60 * 1000);
                const notExpired = periodEnd > new Date();
                // If dbPlan is already pro, only a premium upgrade can elevate it
                return notExpired && (dbPlan === 'pro' ? rPlan === 'premium' : (rPlan === 'pro' || rPlan === 'premium'));
              });

              if (approvedReq) {
                const reqPlan = normalizePlanSlug(approvedReq.plan_slug || approvedReq.plan || 'premium');
                const reqInterval = isAnnualBillingInterval(approvedReq.billing_interval) ? 'yearly' : 'monthly';
                const reqDurationDays = getSubscriptionDurationDays(approvedReq.billing_interval);
                const approvedTime = new Date(approvedReq.updated_at || approvedReq.created_at || Date.now()).getTime();
                const periodEnd = new Date(approvedTime + reqDurationDays * 24 * 60 * 60 * 1000);

                dbPlan = reqPlan;
                dbQuranPlan = reqPlan;
                planActivatedAt = new Date(approvedTime).toISOString();
                planExpiresAt = periodEnd.toISOString();
                billingInterval = reqInterval;

                // Auto-heal missing subscription record
                try {
                  const { data: healedSub } = await supabase.from('subscriptions').insert({
                    user_id: uid,
                    plan: reqPlan,
                    billing_interval: reqInterval,
                    price_amount: approvedReq.price_amount,
                    currency: approvedReq.currency || 'USD',
                    status: 'active',
                    request_id: approvedReq.id,
                    quran_access: true,
                    current_period_start: new Date(approvedTime).toISOString(),
                    current_period_end: periodEnd.toISOString(),
                  }).select().maybeSingle();

                  if (healedSub) {
                    setSubscription(healedSub);
                  }
                } catch (healErr) {
                  console.warn('[AuthContext] Self-heal subscription insertion notice:', healErr);
                }
              }
            }
          } catch (reqErr) {
            console.warn('[AuthContext] Plan requests check notice:', reqErr);
          }
        }

        // 4. Check if profile plan has expired
        if (dbPlan !== 'free' && planExpiresAt && new Date(planExpiresAt) <= new Date()) {
          dbPlan = 'free';
          dbQuranPlan = 'expired';
        }

        // 5. Synchronize user plan entitlements via atomic RPC if available
        try {
          const { data: syncData, error: syncErr } = await supabase.rpc('sync_user_plan_entitlements');
          if (!syncErr && syncData?.success && (syncData.plan === 'pro' || syncData.plan === 'premium')) {
            const normSyncPlan = normalizePlanSlug(syncData.plan);
            dbPlan = normSyncPlan;
            dbQuranPlan = syncData.quran_plan || normSyncPlan;
            planActivatedAt = syncData.plan_activated_at || syncData.started_at || planActivatedAt;
            planExpiresAt = syncData.plan_expires_at || syncData.expires_at || planExpiresAt;
            billingInterval = isAnnualBillingInterval(syncData.billing_interval) ? 'yearly' : 'monthly';
          }
        } catch {
          // RPC sync is progressive
        }

        // 6. Ensure profiles.plan in Supabase matches verified dbPlan
        // SAFETY: Only update profile if we are syncing a paid plan or genuinely expired plan.
        // NEVER overwrite profiles.plan = 'free' if profile had 'pro' and subscription lookup had an error!
        const isSafeToSync = dbPlan !== 'free' || (planExpiresAt && new Date(planExpiresAt) <= new Date());
        if (isSafeToSync && data && normalizePlanSlug(data.plan) !== dbPlan) {
          try {
            await supabase
              .from('profiles')
              .update({
                plan: dbPlan,
                plan_activated_at: planActivatedAt || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', uid);
          } catch (syncProfErr) {
            console.warn('[AuthContext] Profile plan synchronization skipped:', syncProfErr);
          }
        }

        // Keep local storage in sync with remote database truth
        storage.setUserActivePlan(uid, dbPlan);

        if (data) {
          // Check for locally preserved profile overrides (avatar, phone, country code, preferences)
          let finalProfile = { ...(data as Profile) };
          try {
            const overrideKey = `emufti_profile_overrides_${uid}`;
            const rawOverrides = localStorage.getItem(overrideKey);
            const localAvatar = localStorage.getItem(`emufti_avatar_${uid}`);
            const overrides = rawOverrides ? JSON.parse(rawOverrides) : {};

            // Check session user metadata for authoritative signup fields if DB fields are blank or defaults
            const { data: sessData } = await supabase.auth.getSession();
            const meta = (sessData?.session?.user?.id === uid ? sessData?.session?.user?.user_metadata : null) || {};

            const resolvedName =
              overrides.display_name ||
              (finalProfile.display_name &&
              finalProfile.display_name !== 'Knowledge Seeker' &&
              finalProfile.display_name !== email?.split('@')[0]
                ? finalProfile.display_name
                : meta.full_name || finalProfile.display_name);

            const resolvedPhone =
              overrides.phone_number ||
              finalProfile.phone_number ||
              meta.phone_number ||
              undefined;

            const resolvedCountryCode =
              overrides.phone_country_code ||
              finalProfile.phone_country_code ||
              meta.phone_country_code ||
              'SO';

            const resolvedLang =
              overrides.preferred_language ||
              (finalProfile.preferred_language && ['so', 'en', 'ar'].includes(finalProfile.preferred_language)
                ? finalProfile.preferred_language
                : meta.preferred_language || 'en');

            finalProfile = {
              ...finalProfile,
              ...overrides,
              display_name: resolvedName || 'Knowledge Seeker',
              phone_number: resolvedPhone,
              phone_country_code: resolvedCountryCode,
              preferred_language: resolvedLang,
            };

            if (!finalProfile.avatar_url && (overrides.avatar_url || localAvatar)) {
              finalProfile.avatar_url = overrides.avatar_url || localAvatar;
            }

            // Asynchronously sync back to database if missing or repaired
            if (
              (resolvedName && resolvedName !== data.display_name) ||
              (resolvedPhone && resolvedPhone !== data.phone_number) ||
              (resolvedCountryCode && resolvedCountryCode !== data.phone_country_code) ||
              (resolvedLang && resolvedLang !== data.preferred_language)
            ) {
              supabase
                .from('profiles')
                .update({
                  display_name: resolvedName,
                  phone_number: resolvedPhone || null,
                  phone_country_code: resolvedCountryCode,
                  preferred_language: resolvedLang,
                })
                .eq('id', uid)
                .then(() => {}, () => {});
            }
          } catch (overrideErr) {
            console.warn('[AuthContext] Load profile overrides notice:', overrideErr);
          }

          setProfile({
            ...finalProfile,
            plan: dbPlan,
            quran_plan: dbQuranPlan as any,
            plan_activated_at: planActivatedAt,
            plan_expires_at: planExpiresAt,
            started_at: planActivatedAt,
            expires_at: planExpiresAt,
            billing_interval: billingInterval,
          });
          return;
        }

        // If no profile exists yet in the database for this authenticated user,
        // provision their initial profile record safely
        let sessionUser: any = null;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user && sessionData.session.user.id === uid) {
            sessionUser = sessionData.session.user;
          }
        } catch {}

        const fallbackRole: UserRole = (email?.toLowerCase() === 'admin@emufti.ai') ? 'admin' : 'user';
        const meta = sessionUser?.user_metadata || {};
        const effDisplayName = fallbackProfile.display_name || meta.full_name || (email ? email.split('@')[0] : 'Knowledge Seeker');
        const effPhone = fallbackProfile.phone_number || meta.phone_number || undefined;
        const effCountryCode = fallbackProfile.phone_country_code || meta.phone_country_code || 'SO';
        const effLang = fallbackProfile.preferred_language || meta.preferred_language || 'en';

        const defaultProfile = {
          id: uid,
          email: email || sessionUser?.email || '',
          display_name: effDisplayName,
          avatar_url: fallbackProfile.avatar_url,
          phone_number: effPhone,
          phone_country_code: effCountryCode,
          preferred_language: effLang,
          theme: fallbackProfile.theme || 'system',
          role: fallbackRole,
          plan: dbPlan,
          plan_activated_at: planActivatedAt,
          updated_at: new Date().toISOString(),
        };

        try {
          const { data: created, error: createErr } = await retrySupabaseQuery(async () => {
            return await supabase
              .from('profiles')
              .upsert(defaultProfile)
              .select()
              .maybeSingle();
          }, 1, 300);

          if (!createErr && created) {
            setProfile({
              ...(created as Profile),
              display_name: (created as any)?.display_name || effDisplayName,
              avatar_url: (created as any)?.avatar_url || fallbackProfile.avatar_url,
              phone_number: (created as any)?.phone_number || effPhone,
              phone_country_code: (created as any)?.phone_country_code || effCountryCode,
              preferred_language: (created as any)?.preferred_language || effLang,
              plan: dbPlan,
              quran_plan: dbQuranPlan as any,
              plan_activated_at: planActivatedAt,
              plan_expires_at: planExpiresAt,
              billing_interval: billingInterval,
            });
            return;
          }
        } catch (provisionErr) {
          console.warn('[AuthContext] Profile auto-provision notice:', provisionErr);
        }

        // Fallback state if database upsert did not complete (e.g. offline, connection reset, or schema mismatch)
        setProfile({
          ...fallbackProfile,
          display_name: effDisplayName,
          role: fallbackRole,
          plan: dbPlan,
          quran_plan: dbQuranPlan as any,
          plan_activated_at: planActivatedAt,
          plan_expires_at: planExpiresAt,
          billing_interval: billingInterval,
        });
        return;
      }

      setProfile((prev) => prev || fallbackProfile);
    } catch (err: any) {
      console.warn('[AuthContext] Exception in fetchProfile:', err);
      if (isNetworkResetError(err)) {
        console.warn('[AuthContext] Handled network connection reset in fetchProfile, setting fallback profile.');
        setProfileError(null);
      } else {
        setProfileError(err?.message || 'Failed to load user profile');
      }
      setProfile((prev) => prev || fallbackProfile);
    }
  }

  // Authoritative active plan resolved across all layers with strict tier precedence (premium > pro > free)
  const activePlan: PlanSlug = (() => {
    // 1. Authoritative subscription ledger candidate (status active & unexpired)
    let subPlan: PlanSlug = 'free';
    if (subscription) {
      const normStatus = normalizeSubscriptionStatus(subscription.status);
      const normPlan = normalizePlanSlug(subscription.plan);
      const notExpired = !subscription.current_period_end || new Date(subscription.current_period_end) > new Date();
      if (normStatus === 'active' && (normPlan === 'pro' || normPlan === 'premium') && notExpired) {
        subPlan = normPlan;
      }
    }

    // 2. Profile plan candidate (pro or premium & unexpired)
    let profPlan: PlanSlug = 'free';
    if (profile) {
      const normPlan = normalizePlanSlug(profile.plan);
      const notExpired = !profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date();
      if ((normPlan === 'pro' || normPlan === 'premium') && notExpired) {
        profPlan = normPlan;
      }
    }

    // 3. User local storage backup candidate
    let localPlan: PlanSlug = 'free';
    if (user?.id) {
      const local = storage.getUserActivePlan(user.id);
      const normLocal = normalizePlanSlug(local);
      if (normLocal === 'pro' || normLocal === 'premium') {
        localPlan = normLocal;
      }
    }

    // Strict tier precedence hierarchy: premium (tier 3) > pro (tier 2) > free (tier 1)
    if (subPlan === 'premium' || profPlan === 'premium' || localPlan === 'premium') {
      return 'premium';
    }
    if (subPlan === 'pro' || profPlan === 'pro' || localPlan === 'pro') {
      return 'pro';
    }
    return 'free';
  })();

  const isPaidPlan = activePlan === 'pro' || activePlan === 'premium';
  const quranPlan = profile?.quran_plan || (isPaidPlan ? activePlan : 'free');

  const signIn = async (
    email: string,
    password: string
  ): Promise<{
    error?: string;
    isLocked?: boolean;
    remainingMinutes?: number;
    isUnconfirmed?: boolean;
    email?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();
    setIsLoading(true);

    try {
      // 1. Check server-side lockout first
      let isServerLocked = false;
      let serverRemainingMinutes: number | undefined;

      if (isSupabaseConfigured) {
        try {
          const isCheckMissing =
            typeof window !== 'undefined' &&
            sessionStorage.getItem('emufti_rpc_check_login_missing') === 'true';

          if (!isCheckMissing) {
            const { data: statusData, error: statusErr } = await supabase.rpc(
              'check_account_login_status',
              { p_email: cleanEmail }
            );
            if (!statusErr && statusData) {
              if (statusData.is_locked) {
                isServerLocked = true;
                serverRemainingMinutes = Math.max(
                  1,
                  Math.ceil((statusData.remaining_seconds || 900) / 60)
                );
              }
            } else if (statusErr) {
              const isMissing =
                statusErr.code === 'PGRST202' ||
                statusErr.code === '42883' ||
                statusErr.message?.includes('schema cache') ||
                statusErr.message?.includes('Could not find') ||
                (statusErr as any).status === 404 ||
                (statusErr as any)?.statusCode === 404 ||
                (statusErr as any)?.statusCode === '404';
              if (isMissing && typeof window !== 'undefined') {
                try {
                  sessionStorage.setItem('emufti_rpc_check_login_missing', 'true');
                } catch {}
              }
            }
          }
        } catch {
          // Graceful fallback to local lockout check without console 404 spam
        }
      }

      // Also check local lockout fallback
      const localCheck = checkLocalUserLockout(cleanEmail);
      if (isServerLocked || localCheck.isLocked) {
        return {
          error:
            'Your account has been temporarily locked for security reasons. Please contact the Help Center for assistance.',
          isLocked: true,
          remainingMinutes: serverRemainingMinutes || localCheck.remainingMinutes || 15,
        };
      }

      // 2. Perform authentication with Supabase
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const errorMsg = (error.message || '').toLowerCase();
          if (errorMsg.includes('email not confirmed') || errorMsg.includes('not confirmed')) {
            return {
              error: 'Your email address has not been verified yet. Please enter the 8-digit verification code sent to your email.',
              isUnconfirmed: true,
              email: cleanEmail,
            };
          }

          // Distinguish between non-existent accounts and incorrect passwords
          let accountExists = false;
          try {
            const isAccountExistsMissing =
              typeof window !== 'undefined' &&
              sessionStorage.getItem('emufti_rpc_check_exists_missing') === 'true';

            if (!isAccountExistsMissing) {
              const { data: existsData, error: existsErr } = await supabase.rpc(
                'check_account_exists',
                { p_email: cleanEmail }
              );
              if (!existsErr && typeof existsData === 'boolean') {
                accountExists = existsData;
              } else if (existsErr) {
                const isMissing =
                  existsErr.code === 'PGRST202' ||
                  existsErr.code === '42883' ||
                  existsErr.message?.includes('schema cache') ||
                  (existsErr as any).status === 404;
                if (isMissing && typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('emufti_rpc_check_exists_missing', 'true');
                  } catch {}
                }
              }
            }
          } catch {}

          if (!accountExists) {
            // Fallback query to public.profiles
            try {
              const { count } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .eq('email', cleanEmail);
              accountExists = count !== null && count > 0;
            } catch {}
          }

          if (!accountExists) {
            // Do NOT record failed login attempt for non-existent accounts
            return {
              error: 'No account was found for these details. Please create an account or verify your email address.',
              isLocked: false,
            };
          }

          // User account exists, but password was incorrect:
          // Record failed attempt on server
          let isNowLocked = false;
          let attemptsCount = 1;

          try {
            const isFailMissing =
              typeof window !== 'undefined' &&
              sessionStorage.getItem('emufti_rpc_failed_login_missing') === 'true';

            if (!isFailMissing) {
              const { data: failData, error: failErr } = await supabase.rpc(
                'record_failed_login_attempt',
                { p_email: cleanEmail }
              );
              if (!failErr && failData) {
                isNowLocked = failData.is_locked;
                attemptsCount = failData.failed_attempts || 1;
              } else if (failErr) {
                const isMissing =
                  failErr.code === 'PGRST202' ||
                  failErr.code === '42883' ||
                  failErr.message?.includes('schema cache') ||
                  (failErr as any).status === 404;
                if (isMissing && typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('emufti_rpc_failed_login_missing', 'true');
                  } catch {}
                }
              }
            }
          } catch {}

          // Also record on local fallback
          const localFail = recordLocalUserFailure(cleanEmail);
          if (isNowLocked || localFail.isLocked) {
            return {
              error:
                'Your account has been temporarily locked for security reasons. Please contact the Help Center for assistance.',
              isLocked: true,
              remainingMinutes: 15,
            };
          }

          const currentFailed = Math.max(attemptsCount, localFail.attempts);
          const remainingAttempts = Math.max(0, USER_MAX_ATTEMPTS - currentFailed);
          return {
            error: `Incorrect password. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before security lockout)`,
            isLocked: false,
          };
        }

        if (data.user) {
          // Successful login: reset server and local lockout counters
          try {
            const isRecordMissing =
              typeof window !== 'undefined' &&
              sessionStorage.getItem('emufti_rpc_record_login_missing') === 'true';

            if (!isRecordMissing) {
              const { error: rpcErr } = await supabase.rpc('record_successful_login', { p_email: cleanEmail });
              if (rpcErr) {
                const isMissing =
                  rpcErr.code === 'PGRST202' ||
                  rpcErr.code === '42883' ||
                  rpcErr.message?.includes('schema cache') ||
                  rpcErr.message?.includes('Could not find') ||
                  (rpcErr as any).status === 404 ||
                  (rpcErr as any)?.statusCode === 404 ||
                  (rpcErr as any)?.statusCode === '404';
                if (isMissing && typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('emufti_rpc_record_login_missing', 'true');
                  } catch {}
                }
              }
            }
          } catch {}
          clearLocalUserLockout(cleanEmail);

          setUser({ id: data.user.id, email: data.user.email || cleanEmail });
          await fetchProfile(data.user.id, data.user.email);
          await loadNotifications(data.user.id);
          return {};
        }
      }

      // Offline / demo fallback mode: verify that account exists, prevent automatic account creation during invalid logins
      const savedAuth = typeof window !== 'undefined' ? localStorage.getItem(GUEST_KEY) : null;
      let existingAccount = false;
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed?.user?.email?.toLowerCase() === cleanEmail) {
            existingAccount = true;
          }
        } catch {}
      }

      if (!existingAccount) {
        return {
          error: 'No account was found for these details. Please create an account or verify your email address.',
          isLocked: false,
        };
      }

      const demoId = `user_${btoa(cleanEmail).substring(0, 8)}`;
      const u: AuthUser = { id: demoId, email: cleanEmail };
      const p: Profile = {
        id: demoId,
        email: cleanEmail,
        display_name: cleanEmail.split('@')[0],
        preferred_language: 'en',
        default_response_language: 'auto',
        theme: 'system',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(u);
      setProfile(p);
      clearLocalUserLockout(cleanEmail);
      return {};
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

function parseSupabaseOAuthError(err: any): { isProviderNotEnabled: boolean; friendlyMessage: string; rawMessage: string } {
  if (!err) return { isProviderNotEnabled: false, friendlyMessage: '', rawMessage: '' };

  const rawMessage = typeof err === 'string'
    ? err
    : String(err?.message || err?.msg || err?.error_description || (err?.error ? err.error : ''));

  const rawCode = typeof err === 'object' && err !== null
    ? String(err?.error_code || err?.code || '')
    : '';

  let jsonStr = '';
  try {
    if (typeof err === 'object' && err !== null) {
      jsonStr = JSON.stringify(err);
    }
  } catch {}

  const combined = `${rawMessage} ${rawCode} ${jsonStr}`.toLowerCase();

  const isProviderNotEnabled =
    combined.includes('unsupported provider') ||
    combined.includes('provider is not enabled') ||
    combined.includes('provider is not active') ||
    combined.includes('unsupported_provider') ||
    (combined.includes('validation_failed') && (combined.includes('provider') || combined.includes('google'))) ||
    (rawCode === 'validation_failed' && (combined.includes('provider') || combined.includes('google')));

  const friendlyMessage = isProviderNotEnabled
    ? 'Google Authentication is not yet enabled in the Supabase Dashboard. To activate it, go to your Supabase Project > Authentication > Providers > Google, enable the toggle, and add your Google Client ID and Secret. In the meantime, please log in or sign up using your Email and Password below.'
    : rawMessage || 'Google sign-in could not be initiated.';

  return { isProviderNotEnabled, friendlyMessage, rawMessage };
}

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        return {
          error:
            'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google Authentication.',
        };
      }
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/chat` : '/chat';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile openid',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const parsed = parseSupabaseOAuthError(error);
        if (parsed.isProviderNotEnabled) {
          console.warn('[AuthContext] Google Provider is not enabled in Supabase Dashboard:', error);
          return { error: parsed.friendlyMessage };
        }
        return { error: parsed.friendlyMessage || error.message };
      }

      // If Supabase returns an OAuth consent URL in PKCE flow and browser hasn't redirected yet
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }

      return {};
    } catch (err: any) {
      console.warn('[AuthContext] Exception initiating Google OAuth:', err);
      const parsed = parseSupabaseOAuthError(err);
      return { error: parsed.friendlyMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const unlockAccount = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    clearLocalUserLockout(cleanEmail);
    if (isSupabaseConfigured) {
      try {
        const { data: d1, error: e1 } = await supabase.rpc('unlock_user_account', { p_email: cleanEmail });
        if (!e1 && (d1 as any)?.success) return true;

        const { data: d2, error: e2 } = await supabase.rpc('admin_unlock_account', { p_email: cleanEmail });
        return !e2 && Boolean(d2);
      } catch {
        return true;
      }
    }
    return true;
  };

  const adminSignIn = async (usernameOrEmail: string, password: string): Promise<{ error?: string }> => {
    const lockout = checkLockout();
    if (lockout.locked) {
      return {
        error: `Too many failed administrator login attempts. Portal locked for security. Please try again in ${lockout.remainingMinutes} minute(s).`,
      };
    }

    const clean = usernameOrEmail.trim().toLowerCase();
    const effectiveEmail = clean === 'admin' ? 'admin@emufti.ai' : clean;

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        let authResultData: any = null;
        let authError: any = null;

        // 1. Attempt direct authentication with Supabase
        try {
          const directRes = await supabase.auth.signInWithPassword({
            email: effectiveEmail,
            password,
          });
          authResultData = directRes.data;
          authError = directRes.error;
        } catch (fetchEx: any) {
          authError = fetchEx;
        }

        // 2. If direct fetch encountered a network/ad-blocker error ("Failed to fetch"),
        // transparently fallback to the secure backend proxy
        const isNetworkErr =
          authError &&
          (authError.message === 'Failed to fetch' ||
            (typeof authError.message === 'string' &&
              (authError.message.includes('Failed to fetch') ||
                authError.message.includes('NetworkError') ||
                authError.message.includes('Failed to load'))));

        if (isNetworkErr) {
          console.warn('[AuthContext] Direct Supabase fetch failed. Attempting local server proxy...');
          try {
            const proxyRes = await fetch('/api/auth/admin-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: effectiveEmail, password }),
            });

            const proxyJson = await proxyRes.json();
            if (proxyRes.ok && proxyJson.access_token) {
              const { data: sessionData, error: setSessionErr } = await supabase.auth.setSession({
                access_token: proxyJson.access_token,
                refresh_token: proxyJson.refresh_token,
              });

              if (!setSessionErr && sessionData?.user) {
                authResultData = sessionData;
                authError = null;
              } else {
                authError = setSessionErr;
              }
            } else {
              authError = {
                message: proxyJson.error || proxyJson.message || 'Login failed',
                status: proxyRes.status,
                code: proxyJson.code,
              };
            }
          } catch (proxyEx: any) {
            console.error('[AuthContext] Server proxy exception:', proxyEx);
            authError = {
              message: 'Failed to fetch',
              details: proxyEx.message,
            };
          }
        }

        // 3. Precise error diagnostics distinguishing network failure from credential rejection
        if (authError || !authResultData?.user) {
          const rawMsg = authError?.message || 'Login failed';
          const isRealNetworkFailure =
            rawMsg === 'Failed to fetch' ||
            rawMsg.includes('Failed to fetch') ||
            rawMsg.includes('NetworkError') ||
            authError?.code === 'SUPABASE_UNREACHABLE';

          if (isRealNetworkFailure) {
            // Do NOT increment brute-force attempt counter on network/connectivity errors
            return {
              error: `Network connection error (${rawMsg}). Unable to reach the Supabase authentication server. Please check your internet connection or verify that browser ad-blockers / shields are not blocking Supabase.`,
            };
          }

          if (rawMsg.toLowerCase().includes('confirm') || rawMsg.toLowerCase().includes('not confirmed')) {
            return {
              error: `Administrator email has not been confirmed yet. Please verify your email or confirm it in the Supabase Dashboard / SQL Editor.`,
            };
          }

          // Genuine invalid credentials (wrong password or unrecognized user)
          const attempts = recordFailedAttempt();
          const remaining = MAX_ATTEMPTS - attempts;

          return {
            error:
              remaining > 0
                ? `Invalid administrator credentials. Please check your admin identifier and passphrase. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout).`
                : 'Portal locked for 15 minutes due to multiple failed login attempts.',
          };
        }

        // 4. Verify verified administrator role in public.profiles table
        const userId = authResultData.user.id;
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // If this is the designated admin account, ensure their profile has role='admin'
        if (effectiveEmail === 'admin@emufti.ai') {
          if (!profileData || profileData.role !== 'admin') {
            const { data: autoProf } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                email: effectiveEmail,
                display_name: 'Chief Administrator',
                role: 'admin',
              })
              .select()
              .maybeSingle();

            if (autoProf) {
              profileData = autoProf;
            }
          }
        }

        // For non-designated accounts, require explicit role='admin' in public.profiles
        if (effectiveEmail !== 'admin@emufti.ai' && profileData?.role !== 'admin') {
          await supabase.auth.signOut();
          recordFailedAttempt();
          return {
            error: `Access denied: Account ${effectiveEmail} does not have administrator role ('admin') in public.profiles.`,
          };
        }

        const effectiveProfile: Profile = (profileData as Profile) || {
          id: userId,
          email: effectiveEmail,
          display_name: 'Chief Administrator',
          preferred_language: 'en',
          default_response_language: 'auto',
          theme: 'system',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        clearLockout();
        setUser({ id: userId, email: authResultData.user.email || effectiveEmail });
        setProfile(effectiveProfile);
        return {};
      }

      return { error: 'Database connection is not configured.' };
    } catch (e: any) {
      return { error: e.message || 'Admin authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };



  const recordSecurityEvent = async (
    eventType: string,
    deviceInfo?: string
  ): Promise<void> => {
    if (!user) return;
    const clientDevice = deviceInfo || (typeof navigator !== 'undefined' ? `${navigator.userAgent}` : 'Unknown client');

    // Always persist to local storage as durable backup
    storage.recordUserSecurityEvent({
      user_id: user.id,
      event_type: eventType as any,
      description: deviceInfo,
      device_info: clientDevice,
    });

    // If Supabase is configured and user is UUID, try recording to remote table
    if (isSupabaseConfigured && isUuid(user.id)) {
      try {
        await supabase.from('user_security_events').insert({
          user_id: user.id,
          event_type: eventType,
          description: deviceInfo || null,
          device_info: clientDevice.slice(0, 500),
        });
      } catch (err) {
        console.warn('[AuthContext] Security event remote recording notice:', err);
      }
    }
  };

  const fetchSecurityEvents = async (): Promise<UserSecurityEvent[]> => {
    if (!user) return [];

    if (isSupabaseConfigured && isUuid(user.id)) {
      try {
        const { data, error } = await supabase
          .from('user_security_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          return data as UserSecurityEvent[];
        }
      } catch (err) {
        console.warn('[AuthContext] Fetch remote security events notice:', err);
      }
    }

    // Fallback to local storage
    return storage.getUserSecurityEvents(user.id);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    phoneNumber?: string,
    phoneCountryCode?: string,
    preferredLanguage?: 'so' | 'en' | 'ar'
  ) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const validLang: 'so' | 'en' | 'ar' =
        preferredLanguage && ['so', 'en', 'ar'].includes(preferredLanguage)
          ? preferredLanguage
          : 'en';

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
            data: {
              full_name: displayName || cleanEmail.split('@')[0],
              phone_number: phoneNumber?.trim() || null,
              phone_country_code: phoneCountryCode || null,
              preferred_language: validLang,
            },
          },
        });

        if (error) {
          // Log diagnostic details without passwords, OTPs, or API keys
          console.error('[AuthContext] Supabase signUp error:', {
            status: error.status,
            name: error.name,
            message: error.message,
            code: (error as any).code,
            timestamp: new Date().toISOString(),
          });

          const rawMsg = (error.message || '').toLowerCase();
          if (rawMsg.includes('error sending confirmation email') || rawMsg.includes('smtp')) {
            return {
              error: 'Failed to send confirmation email. Your Supabase Custom SMTP (Resend) configuration or sender domain needs verification in the Supabase Dashboard. Please check your Supabase Auth Logs.',
              isSmtpError: true,
              email: cleanEmail,
            };
          }

          if (rawMsg.includes('rate') || rawMsg.includes('too many') || (error as any).code === 'over_email_send_rate_limit') {
            return {
              error: 'Too many signup requests. Please wait a few minutes before trying again.',
              isRateLimited: true,
            };
          }

          return { error: error.message };
        }

        // Detect duplicate accounts when user enumeration protection is enabled
        const isDuplicateUser = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
        if (isDuplicateUser) {
          return {
            error: 'An account with this email address already exists. Please sign in or reset your password.',
            isExistingUser: true,
            email: cleanEmail,
          };
        }

        // Always persist pending signup fields locally for reliable recovery on confirmation
        try {
          localStorage.setItem(
            `emufti_pending_signup_${cleanEmail}`,
            JSON.stringify({
              displayName: displayName || cleanEmail.split('@')[0],
              phoneNumber: phoneNumber?.trim() || null,
              phoneCountryCode: phoneCountryCode || null,
              preferredLanguage: validLang,
            })
          );
        } catch {}

        if (data.session?.user) {
          const uid = data.session.user.id;
          setUser({ id: uid, email: cleanEmail });
          storage.setPreferredLanguage(validLang);
          try {
            const overrides = {
              display_name: displayName || cleanEmail.split('@')[0],
              phone_number: phoneNumber?.trim() || null,
              phone_country_code: phoneCountryCode || null,
              preferred_language: validLang,
            };
            localStorage.setItem(`emufti_profile_overrides_${uid}`, JSON.stringify(overrides));
            localStorage.removeItem(`emufti_pending_signup_${cleanEmail}`);

            await supabase
              .from('profiles')
              .upsert({
                id: uid,
                email: cleanEmail,
                display_name: displayName || cleanEmail.split('@')[0],
                phone_number: phoneNumber?.trim() || null,
                phone_country_code: phoneCountryCode || null,
                preferred_language: validLang,
              });
          } catch (profErr) {
            console.warn('[AuthContext] Profile sync during signup notice:', profErr);
          }
          await fetchProfile(uid, cleanEmail);
          recordSecurityEvent('login', 'User registered and signed in');
          return { message: 'Account created successfully!', requiresVerification: false };
        }

        // Email confirmation is required
        storage.setPreferredLanguage(validLang);
        return {
          message: 'Verification code requested. Please check your email.',
          requiresVerification: true,
          email: cleanEmail,
        };
      }

      storage.setPreferredLanguage(validLang);
      return signIn(cleanEmail, password);
    } catch (e: any) {
      console.error('[AuthContext] signUp exception:', e?.message);
      return { error: e.message || 'Sign up failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async (
    email: string,
    token: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\D/g, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Valid email address is required.' };
    }

    if (!cleanToken || cleanToken.length !== 8) {
      setIsLoading(false);
      return { success: false, error: 'Please enter the complete 8-digit verification code.' };
    }

    try {
      if (isSupabaseConfigured) {
        // Attempt verification using signup type
        let { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup',
        });

        // Type fallback if specific Supabase Auth version expects 'email'
        if (error && error.message?.toLowerCase().includes('type')) {
          const fallbackRes = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanToken,
            type: 'email',
          });
          data = fallbackRes.data;
          error = fallbackRes.error;
        }

        if (error) {
          console.warn('[AuthContext] verifyOtp failed:', {
            status: error.status,
            name: error.name,
            message: error.message,
          });

          const msg = error.message.toLowerCase();
          if (msg.includes('expired')) {
            return {
              success: false,
              error: 'This verification code has expired. Please request a new code.',
            };
          }
          if (msg.includes('invalid') || msg.includes('token') || msg.includes('bad') || msg.includes('otp')) {
            return {
              success: false,
              error: 'Invalid verification code. Please check the 8 digits and try again.',
            };
          }
          if (msg.includes('rate') || msg.includes('too many')) {
            return {
              success: false,
              error: 'Too many failed verification attempts. Please wait a moment before trying again.',
            };
          }
          return { success: false, error: error.message };
        }

        const verifiedUser = data?.user || (data?.session?.user as any);
        if (verifiedUser) {
          const uid = verifiedUser.id;
          let pendingInfo: any = {};
          try {
            const rawPending = localStorage.getItem(`emufti_pending_signup_${cleanEmail}`);
            if (rawPending) pendingInfo = JSON.parse(rawPending);
          } catch {}

          const meta = verifiedUser.user_metadata || {};
          const effName =
            pendingInfo.displayName ||
            meta.full_name ||
            (cleanEmail ? cleanEmail.split('@')[0] : 'Knowledge Seeker');
          const effPhone = pendingInfo.phoneNumber || meta.phone_number || null;
          const effCountryCode = pendingInfo.phoneCountryCode || meta.phone_country_code || 'SO';
          const effLang = pendingInfo.preferredLanguage || meta.preferred_language || 'en';

          // Persist overrides immediately to ensure zero UI delay
          try {
            const overrides = {
              display_name: effName,
              phone_number: effPhone,
              phone_country_code: effCountryCode,
              preferred_language: effLang,
            };
            localStorage.setItem(`emufti_profile_overrides_${uid}`, JSON.stringify(overrides));
            localStorage.removeItem(`emufti_pending_signup_${cleanEmail}`);
          } catch {}

          if (['so', 'en', 'ar'].includes(effLang)) {
            storage.setPreferredLanguage(effLang as any);
          }

          // Persist to public.profiles table in Supabase
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: uid,
                email: cleanEmail,
                display_name: effName,
                phone_number: effPhone,
                phone_country_code: effCountryCode,
                preferred_language: effLang,
              });
          } catch (upsertErr) {
            console.warn('[AuthContext] Profile upsert during OTP verification notice:', upsertErr);
          }

          setUser({ id: uid, email: verifiedUser.email || cleanEmail });
          clearLocalUserLockout(cleanEmail);
          await fetchProfile(uid, verifiedUser.email || cleanEmail);
          await loadNotifications(uid);
          recordSecurityEvent('signup_verified', 'User verified email OTP and signed in');
          return { success: true, message: 'Email successfully verified! Welcome to EMufti AI.' };
        }

        return { success: false, error: 'Verification completed, but no session was established. Please sign in.' };
      }

      // Offline / Demo mode fallback
      const demoId = `user_${btoa(cleanEmail).substring(0, 8)}`;
      let pendingDemoInfo: any = {};
      try {
        const rawPending = localStorage.getItem(`emufti_pending_signup_${cleanEmail}`);
        if (rawPending) pendingDemoInfo = JSON.parse(rawPending);
      } catch {}
      const demoName = pendingDemoInfo.displayName || cleanEmail.split('@')[0];
      const demoPhone = pendingDemoInfo.phoneNumber || undefined;
      const demoCountryCode = pendingDemoInfo.phoneCountryCode || 'SO';
      const demoLang = pendingDemoInfo.preferredLanguage || 'en';

      try {
        const overrides = {
          display_name: demoName,
          phone_number: demoPhone,
          phone_country_code: demoCountryCode,
          preferred_language: demoLang,
        };
        localStorage.setItem(`emufti_profile_overrides_${demoId}`, JSON.stringify(overrides));
        localStorage.removeItem(`emufti_pending_signup_${cleanEmail}`);
      } catch {}

      setUser({ id: demoId, email: cleanEmail });
      await fetchProfile(demoId, cleanEmail);
      return { success: true, message: 'Email verified successfully!' };
    } catch (err: any) {
      console.error('[AuthContext] verifyEmailOtp exception:', err);
      return { success: false, error: err?.message || 'Verification failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
          },
        });

        if (error) {
          console.warn('[AuthContext] resendVerificationOtp error:', {
            status: error.status,
            name: error.name,
            message: error.message,
          });

          const msg = error.message.toLowerCase();
          if (msg.includes('rate') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
            return {
              success: false,
              error: 'Please wait before requesting another verification code.',
            };
          }
          if (msg.includes('smtp') || msg.includes('error sending') || msg.includes('delivery')) {
            return {
              success: false,
              error: 'Verification email could not be sent. Please check your Supabase Custom SMTP / Resend settings.',
            };
          }
          return { success: false, error: error.message };
        }

        return {
          success: true,
          message: 'A new 8-digit verification code was requested. Please check your email or spam folder.',
        };
      }

      return {
        success: true,
        message: 'A new verification code has been requested.',
      };
    } catch (err: any) {
      console.error('[AuthContext] resendVerificationOtp exception:', err);
      return { success: false, error: err?.message || 'Failed to resend code.' };
    }
  };

  const signOut = async () => {
    if (user) {
      recordSecurityEvent('logout', 'User initiated sign out');
    }
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(GUEST_KEY);
      }
    } catch {}
  };

  const changePassword = async (newPassword: string): Promise<{ error?: string; success?: boolean }> => {
    if (!user) return { error: 'Not signed in' };
    if (!newPassword || newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
      }
      recordSecurityEvent('password_change', 'Account password successfully updated');
      return { success: true };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update password.' };
    }
  };

  const signOutOthers = async (): Promise<{ error?: string; success?: boolean; message?: string }> => {
    if (!user) return { error: 'Not signed in' };
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut({ scope: 'others' });
        if (error) {
          console.warn('[AuthContext] signOut others notice:', error);
          return { error: error.message };
        }
      }
      recordSecurityEvent('session_revoked', 'Terminated other browser sessions');
      return {
        success: true,
        message: 'Sign out request sent. Other browser sessions will be invalidated upon their next token refresh.',
      };
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign out other sessions.' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { error: error.message };
      }
      return { message: 'Password recovery email sent if account exists.' };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const extractMissingColumn = (errorMsg: string): string | null => {
    if (!errorMsg) return null;
    const m1 = errorMsg.match(/Could not find the '([^']+)' column/i);
    if (m1) return m1[1];
    const m2 = errorMsg.match(/column [a-zA-Z0-9_.]*?([a-zA-Z0-9_]+) does not exist/i);
    if (m2) return m2[1];
    const m3 = errorMsg.match(/column "([^"]+)" of relation/i);
    if (m3) return m3[1];
    return null;
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!user || !profile) return { error: 'Not signed in' };

    // Never let regular users change their own subscription plan or admin role through editable profile fields
    const safeUpdates: Partial<Profile> = {};
    if (updates.display_name !== undefined) safeUpdates.display_name = updates.display_name.trim();
    if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url;
    if (updates.phone_number !== undefined) safeUpdates.phone_number = updates.phone_number.trim();
    if (updates.phone_country_code !== undefined) safeUpdates.phone_country_code = updates.phone_country_code;
    if (updates.preferred_language !== undefined) safeUpdates.preferred_language = updates.preferred_language;
    if (updates.default_response_language !== undefined) safeUpdates.default_response_language = updates.default_response_language;
    if (updates.theme !== undefined) safeUpdates.theme = updates.theme;
    if (updates.accent_color !== undefined) safeUpdates.accent_color = updates.accent_color;
    if (updates.interface_density !== undefined) safeUpdates.interface_density = updates.interface_density;

    const next = { ...profile, ...safeUpdates, updated_at: new Date().toISOString() };

    // Persist safe updates to local storage overrides immediately so user experience never fails
    try {
      const overrideKey = `emufti_profile_overrides_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(overrideKey) || '{}');
      const merged = { ...existing, ...safeUpdates };
      localStorage.setItem(overrideKey, JSON.stringify(merged));

      if (safeUpdates.avatar_url !== undefined) {
        if (safeUpdates.avatar_url) {
          localStorage.setItem(`emufti_avatar_${user.id}`, safeUpdates.avatar_url);
        } else {
          localStorage.removeItem(`emufti_avatar_${user.id}`);
        }
      }
      if (safeUpdates.preferred_language) {
        storage.setPreferredLanguage(safeUpdates.preferred_language);
      }
    } catch (localErr) {
      console.warn('[AuthContext] Local storage override notice:', localErr);
    }

    if (isSupabaseConfigured && isUuid(user.id)) {
      // Whitelist columns known to exist on the remote public.profiles table
      // (newer/client fields like default_response_language are preserved in local state/overrides)
      const KNOWN_REMOTE_PROFILE_COLS = new Set([
        'display_name',
        'avatar_url',
        'phone_number',
        'phone_country_code',
        'preferred_language',
        'theme',
        'accent_color',
        'interface_density',
        'plan',
        'plan_activated_at',
        'role',
      ]);

      let payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(safeUpdates)) {
        if (KNOWN_REMOTE_PROFILE_COLS.has(k)) {
          payload[k] = v;
        }
      }
      payload.updated_at = new Date().toISOString();

      let lastError: any = null;

      // Iteratively strip columns missing from remote PostgREST schema cache
      for (let attempt = 0; attempt < 8; attempt++) {
        if (Object.keys(payload).length === 0) {
          lastError = null;
          break;
        }

        let updateRes: { error: any } = { error: null };
        try {
          updateRes = await retrySupabaseQuery(async () => {
            return await supabase
              .from('profiles')
              .update(payload)
              .eq('id', user.id);
          }, 1, 300);
        } catch (updErr: any) {
          updateRes = { error: updErr };
        }

        const { error } = updateRes;

        if (!error) {
          lastError = null;
          break;
        }

        if (isNetworkResetError(error)) {
          console.warn('[AuthContext] Network connection reset during profile update, local profile changes preserved:', error.message || error);
          lastError = null;
          break;
        }

        lastError = error;
        const missingCol = extractMissingColumn(error.message);
        if (missingCol && missingCol in payload) {
          console.warn(`[AuthContext] Column '${missingCol}' missing from schema cache, stripping from remote payload and saving locally:`, error.message);
          delete payload[missingCol];
        } else if (error.message?.includes('schema cache')) {
          // If schema cache error doesn't name column cleanly, try removing optional newer fields
          const optionalCols = ['phone_country_code', 'phone_number', 'avatar_url', 'preferred_language', 'accent_color', 'interface_density'];
          let strippedAny = false;
          for (const c of optionalCols) {
            if (c in payload) {
              delete payload[c];
              strippedAny = true;
              break;
            }
          }
          if (!strippedAny) break;
        } else {
          break;
        }
      }

      if (lastError && Object.keys(payload).length > 0) {
        console.warn('[AuthContext] Supabase profile partial update note:', lastError);
      }
    }

    setProfile(next);
    return {};
  };

  const uploadAvatar = async (file: File): Promise<{ url?: string; error?: string; notice?: string }> => {
    if (!user || !isUuid(user.id)) {
      return { error: 'Please sign in to upload an avatar.' };
    }

    // Secure file validation: max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { error: 'Avatar image must be smaller than 5MB.' };
    }

    // Secure file validation: allowed image types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { error: 'Invalid file format. Allowed formats: PNG, JPEG, and WebP.' };
    }

    const readAsDataUrl = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    if (!isSupabaseConfigured) {
      try {
        const base64 = await readAsDataUrl(file);
        await updateProfile({ avatar_url: base64 });
        recordSecurityEvent('avatar_update', 'Avatar updated (local mode)');
        return { url: base64 };
      } catch {
        return { error: 'Failed to read image file.' };
      }
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;

      // Clean up previous storage avatar if it existed in the avatars bucket
      if (profile?.avatar_url && profile.avatar_url.includes('/storage/v1/object/public/avatars/')) {
        try {
          const oldPath = profile.avatar_url.split('/storage/v1/object/public/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from('avatars').remove([decodeURIComponent(oldPath)]);
          }
        } catch (cleanupErr) {
          console.warn('[AuthContext] Previous avatar removal notice:', cleanupErr);
        }
      }

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadErr) {
        console.warn('[AuthContext] Avatar upload storage error:', uploadErr);
        // Graceful handling for "Bucket not found" or Storage errors:
        // Use Data URL fallback so the user experience never breaks even if the remote migration hasn't been executed yet.
        const isBucketNotFound =
          uploadErr.message?.toLowerCase().includes('bucket not found') ||
          (uploadErr as any).statusCode === 404 ||
          (uploadErr as any).error === 'Bucket not found';

        if (isBucketNotFound) {
          const base64 = await readAsDataUrl(file);
          await updateProfile({ avatar_url: base64 });
          recordSecurityEvent('avatar_update', 'Avatar saved via profile data fallback');
          return {
            url: base64,
            notice: 'Avatar saved directly to your profile. (Tip: run supabase/migrations/20261017_storage_avatars_and_security.sql in Supabase SQL Editor for dedicated storage bucket hosting).',
          };
        }

        return { error: uploadErr.message || 'Failed to upload avatar image to storage.' };
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path || filePath);

      const avatarUrl = publicUrlData.publicUrl;
      try {
        localStorage.setItem(`emufti_avatar_${user.id}`, avatarUrl);
      } catch {}
      await updateProfile({ avatar_url: avatarUrl });
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      recordSecurityEvent('avatar_update', 'Avatar updated successfully in storage');
      return { url: avatarUrl };
    } catch (e: any) {
      console.warn('[AuthContext] Avatar upload fallback caught exception:', e);
      try {
        const base64 = await readAsDataUrl(file);
        try {
          localStorage.setItem(`emufti_avatar_${user.id}`, base64);
        } catch {}
        await updateProfile({ avatar_url: base64 });
        setProfile((prev) => (prev ? { ...prev, avatar_url: base64 } : null));
        recordSecurityEvent('avatar_update', 'Avatar saved via fallback');
        return { url: base64 };
      } catch {
        return { error: e.message || 'An unexpected error occurred while uploading your avatar.' };
      }
    }
  };

  const removeAvatar = async (): Promise<{ error?: string }> => {
    if (!user || !profile) return { error: 'Not signed in' };
    try {
      if (isSupabaseConfigured && profile.avatar_url && profile.avatar_url.includes('/storage/v1/object/public/avatars/')) {
        try {
          const oldPath = profile.avatar_url.split('/storage/v1/object/public/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from('avatars').remove([decodeURIComponent(oldPath)]);
          }
        } catch (cleanupErr) {
          console.warn('[AuthContext] Avatar storage cleanup error:', cleanupErr);
        }
      }
      try {
        localStorage.removeItem(`emufti_avatar_${user.id}`);
        const overrideKey = `emufti_profile_overrides_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(overrideKey) || '{}');
        delete existing.avatar_url;
        localStorage.setItem(overrideKey, JSON.stringify(existing));
      } catch {}
      await updateProfile({ avatar_url: '' });
      setProfile((prev) => (prev ? { ...prev, avatar_url: undefined } : null));
      recordSecurityEvent('avatar_remove', 'Profile photo removed');
      return {};
    } catch (e: any) {
      return { error: e.message || 'Failed to remove avatar.' };
    }
  };

  const deleteAccount = async (): Promise<{ error?: string; success?: boolean }> => {
    if (!user) return { error: 'Not signed in' };
    if (isSupabaseConfigured && isUuid(user.id)) {
      try {
        const { error: rpcError } = await supabase.rpc('delete_user_account');
        if (rpcError) {
          const { error: delError } = await supabase.from('profiles').delete().eq('id', user.id);
          if (delError) {
            console.warn('[AuthContext] Account deletion error:', delError);
            return { error: delError.message };
          }
        }
      } catch (err: any) {
        console.warn('[AuthContext] Account deletion exception:', err);
        return { error: err?.message || 'Failed to delete account on server.' };
      }
    }
    try {
      storage.clearAllConversations(user.id);
    } catch {}
    await signOut();
    return { success: true };
  };

  const loginAsGuest = () => {
    console.warn('[AuthContext] Guest access has been retired. Please sign up or log in.');
  };

  const loginAsAdminDemo = () => {
    console.warn('[AuthContext] Demo admin login has been retired. Please authenticate via /admin/login.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activePlan,
        quranPlan,
        isPaidPlan,
        subscription,
        profileError,
        role: profile?.role || 'user',
        isAdmin: (profile?.role === 'admin') || (user?.email?.toLowerCase() === 'admin@emufti.ai'),
        isLoading,
        isConfigured: isSupabaseConfigured,
        notifications,
        unreadNotificationCount,
        refreshProfile,
        markNotificationAsRead,
        signIn,
        signInWithGoogle,
        adminSignIn,
        signUp,
        verifyEmailOtp,
        resendVerificationOtp,
        signOut,
        changePassword,
        signOutOthers,
        resetPassword,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        deleteAccount,
        unlockAccount,
        fetchSecurityEvents,
        recordSecurityEvent,
        loginAsGuest,
        loginAsAdminDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth outside provider');
  return c;
};
