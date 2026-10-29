import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  CreditCard,
  Shield,
  Mail,
  Send,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  Camera,
  Trash2,
  Loader2,
  Copy,
  RefreshCw,
  ExternalLink,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageCircle,
  Calendar,
  Phone,
  Upload,
  X,
  KeyRound,
  LogOut,
  Languages,
  FileText,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Bookmark,
  BookOpen,
  Trophy,
  Monitor,
  Eye,
  EyeOff,
  Heart,
  Share2,
  Mic,
  Lock,
  AlertTriangle,
  Scale,
  Database,
  Cpu,
  FileCheck,
  Layers,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth, isAnnualBillingInterval } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../lib/storage';
import { SYSTEM_PLANS } from '../lib/payment';
import {
  PlanRequest,
  PlanSlug,
  PlanRequestStatus,
  SupportRequest,
  SavedItem,
  QuranReadingProgress,
} from '../types/database';
import { PlanRequestModal } from '../components/plans/PlanRequestModal';
import { PlanActivationBanner } from '../components/chat/PlanActivationBanner';
import { UserAvatar } from '../components/common/UserAvatar';
import { SubscriptionBadge } from '../components/common/SubscriptionBadge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../lib/constants';
import { PhoneInputWithCountry } from '../components/common/PhoneInputWithCountry';
import { quranService } from '../lib/quranService';
import { Footer } from '../components/layout/Footer';
import type { CountryCode } from 'libphonenumber-js';

function parseClientDevice(): { browser: string; os: string; device: string } {
  if (typeof window === 'undefined' || !navigator?.userAgent) {
    return { browser: 'Modern Web Browser', os: 'Desktop Workstation', device: 'Personal Computer' };
  }
  const ua = navigator.userAgent;
  let browser = 'Web Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';

  let os = 'Operating System';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows PC';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android OS';
  else if (ua.includes('iPhone')) os = 'Apple iOS (iPhone)';
  else if (ua.includes('iPad')) os = 'Apple iPadOS';
  else if (ua.includes('Linux')) os = 'Linux OS';

  const device = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile Device' : 'Desktop / Laptop Workstation';

  return { browser, os, device };
}

interface DailyReflection {
  type: 'ayah' | 'hadith' | 'dua';
  title: string;
  arabic: string;
  english: string;
  somali: string;
  source: string;
  context: string;
}

const DAILY_REFLECTIONS: Record<'ayah' | 'hadith' | 'dua', DailyReflection> = {
  ayah: {
    type: 'ayah',
    title: 'Quranic Verse of the Day',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    english: "And say: 'My Lord, increase me in knowledge.'",
    somali: "Oo waxaad dhahdaa: 'Eebbow ii kordhi cilmi.'",
    source: 'Surah Taha (20:114)',
    context: 'The divine command revealed to Prophet Muhammad ﷺ to continuously seek an increase in beneficial knowledge.',
  },
  hadith: {
    type: 'hadith',
    title: 'Prophetic Hadith of the Day',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    english: 'Whoever treads a path seeking knowledge, Allah makes easy for him a path to Paradise.',
    somali: 'Qofkii qaada waddo uu cilmi ku raadinayo, Eebbe wuxuu u fududaynayaa waddada Jannada.',
    source: 'Sahih Muslim 2699 · Narrated by Abu Hurairah (RA)',
    context: 'Authentic prophetic glad tidings for every sincere seeker traversing the path of sacred Islamic learning.',
  },
  dua: {
    type: 'dua',
    title: 'Prophetic Dua of the Day',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً',
    english: 'O Allah, I ask You for beneficial knowledge, good provision, and acceptable deeds.',
    somali: 'Ilaahayow, waxaan ku weydiisanayaa cilmi waxtar leh, risiq xalaal ah oo wanaagsan, iyo camal la aqbalo.',
    source: 'Sunan Ibn Majah 925 · Graded Sahih by Al-Albani',
    context: 'The cherished daily supplication of the Messenger of Allah ﷺ recited after concluding the Fajr prayer.',
  },
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    activePlan,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    signOut,
    changePassword,
    signOutOthers,
  } = useAuth();
  const { setLanguage } = useLanguage();
  const userId = user?.id || 'guest_user';

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>(
    (profile?.phone_country_code as CountryCode) || 'SO'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<'so' | 'en' | 'ar'>(
    (profile?.preferred_language as any) || 'en'
  );
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [userRequests, setUserRequests] = useState<PlanRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportRequest[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Daily Islamic Learning Card State
  const [dailyTab, setDailyTab] = useState<'ayah' | 'hadith' | 'dua'>('ayah');
  const [dailyCopied, setDailyCopied] = useState(false);

  // Saved Islamic Answers State
  const [savedAnswers, setSavedAnswers] = useState<SavedItem[]>(() => storage.getSavedItems(userId));
  const [savedTopicFilter, setSavedTopicFilter] = useState<string>('All');
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>('');
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  // Learning Progress State
  const [quranProgress, setQuranProgress] = useState<QuranReadingProgress | null>(null);
  const [quizStats, setQuizStats] = useState<{ completed: number; avgScore: number; bestScore: number }>({
    completed: 0,
    avgScore: 0,
    bestScore: 0,
  });
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);

  // Security & Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const [signOutOthersSuccess, setSignOutOthersSuccess] = useState<string | null>(null);

  const clientDevice = parseClientDevice();

  const usage = storage.getDailyUsage(userId);
  const planLimits: Record<PlanSlug, number> = { free: 5, pro: 150, premium: 1000 };
  const currentLimit = planLimits[activePlan] || 5;
  const usedPercent = Math.min(100, Math.round((usage.count / currentLimit) * 100));

  // Sync state when profile loads/updates
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPhoneNumber(profile.phone_number || '');
      if (profile.phone_country_code) {
        setPhoneCountryCode(profile.phone_country_code as CountryCode);
      }
      if (profile.preferred_language) {
        setPreferredLanguage(profile.preferred_language as any);
      }
    }
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      const localReqs = storage.getPlanRequests(userId, user?.email);
      if (isMounted) setUserRequests(localReqs);

      if (isSupabaseConfigured && user?.id) {
        try {
          const { data, error } = await supabase
            .from('plan_requests')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && isMounted) {
            const userEmail = user.email ? user.email.toLowerCase() : null;
            const remoteForUser = data.filter(
              (r: any) =>
                r.user_id === user.id ||
                (userEmail && r.email && r.email.toLowerCase() === userEmail)
            );
            const seen = new Set<string>();
            const merged: PlanRequest[] = [];
            for (const r of [...remoteForUser, ...localReqs]) {
              const key = r.reference_id || r.id;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push({
                  ...r,
                  plan_slug: r.plan_slug || r.plan || 'pro',
                });
              }
            }
            setUserRequests(merged);
          }
        } catch (e) {
          console.warn('Could not fetch remote plan requests:', e);
        }
      }
    };

    const fetchTickets = async () => {
      setIsLoadingTickets(true);
      try {
        let tickets: SupportRequest[] = [];
        if (isSupabaseConfigured && user?.id) {
          const { data, error } = await supabase
            .from('support_requests')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
            const userEmail = user.email ? user.email.toLowerCase() : null;
            tickets = data.filter(
              (t: any) =>
                t.user_id === user.id ||
                (userEmail && t.email && t.email.toLowerCase() === userEmail)
            ) as SupportRequest[];
          }
        }
        const localTickets = storage.getSupportRequests(userId);
        const seenIds = new Set(tickets.map((t) => t.reference_id.toUpperCase()));
        for (const lt of localTickets) {
          if (!seenIds.has(lt.reference_id.toUpperCase())) {
            tickets.push(lt);
            seenIds.add(lt.reference_id.toUpperCase());
          }
        }
        if (isMounted) {
          setSupportTickets(tickets);
        }
      } catch (tErr) {
        console.warn('Could not fetch support tickets:', tErr);
      } finally {
        if (isMounted) setIsLoadingTickets(false);
      }
    };

    // Fetch Quran reading progress
    quranService.getReadingProgress(userId).then((p) => {
      if (isMounted && p) setQuranProgress(p);
    });

    // Fetch Tasbeeh total count
    try {
      const rawCount = localStorage.getItem('emufti_tasbeeh_count') || localStorage.getItem('emufti_tasbeeh_total_count');
      if (rawCount && isMounted) {
        setTasbeehCount(parseInt(rawCount, 10) || 0);
      }
    } catch {}

    // Fetch Quiz attempts from Supabase
    const fetchQuizStats = async () => {
      if (isSupabaseConfigured && user?.id) {
        try {
          const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', user.id);
          if (!error && Array.isArray(data) && data.length > 0 && isMounted) {
            const completed = data.filter((a: any) => a.status === 'completed' || a.completed_at);
            const total = completed.length;
            const best = Math.max(...completed.map((a: any) => a.score || 0), 0);
            const avg = total > 0 ? Math.round(completed.reduce((acc: number, a: any) => acc + (a.score || 0), 0) / total) : 0;
            setQuizStats({ completed: total, avgScore: avg, bestScore: best });
          }
        } catch (e) {
          console.warn('[ProfilePage] Could not load quiz stats:', e);
        }
      }
    };
    fetchQuizStats();

    // Reload saved answers
    setSavedAnswers(storage.getSavedItems(userId));

    fetchRequests();
    fetchTickets();
    return () => { isMounted = false; };
  }, [userId, user?.id, user?.email]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);

    // Validate type (JPG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG, and WebP images are supported.');
      return;
    }

    // Validate size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarError('File size exceeds the 5MB limit. Please choose a smaller image.');
      return;
    }

    // Create instant local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setIsUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      if (res.error) {
        setAvatarError(res.error || 'Failed to upload photo.');
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload photo.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      const res = await removeAvatar();
      if (res.error) {
        setAvatarError(res.error || 'Failed to remove photo.');
      } else {
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setSaveError('Full Name cannot be empty.');
      return;
    }

    if (phoneNumber.trim() && !isPhoneValid) {
      setSaveError('Please enter a valid international phone number.');
      return;
    }

    setSaveError(null);
    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        display_name: displayName.trim(),
        phone_number: phoneNumber.trim(),
        phone_country_code: phoneCountryCode,
        preferred_language: preferredLanguage,
      });
      if (res.error) {
        setSaveError(res.error || 'Failed to update profile.');
      } else {
        await setLanguage(preferredLanguage);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setPhoneNumber(profile?.phone_number || '');
    if (profile?.phone_country_code) {
      setPhoneCountryCode(profile.phone_country_code as CountryCode);
    }
    if (profile?.preferred_language) {
      setPreferredLanguage(profile.preferred_language as any);
    }
    setSaveError(null);
    setAvatarError(null);
  };

  const handleUnbookmarkAnswer = (id: string) => {
    const updated = savedAnswers.filter((item) => item.id !== id);
    setSavedAnswers(updated);
    storage.saveSavedItems(userId, updated);
  };

  const handleCopyAnswer = (item: SavedItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedAnswerId(item.id);
    setTimeout(() => setCopiedAnswerId(null), 2000);
  };

  const handleCopyDailyReflection = (reflection: DailyReflection) => {
    const textToCopy = `«${reflection.arabic}»\n\n${reflection.english}\n\n${reflection.somali}\n\n— [${reflection.source}] via EMufti AI`;
    navigator.clipboard.writeText(textToCopy);
    setDailyCopied(true);
    setTimeout(() => setDailyCopied(false), 2000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword(newPassword);
      if (res.error) {
        setPasswordError(res.error);
      } else {
        setPasswordSuccess('Account password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setShowPasswordForm(false), 2500);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOutOthers = async () => {
    setIsSigningOutOthers(true);
    setSignOutOthersSuccess(null);
    try {
      const res = await signOutOthers();
      if (res.error) {
        setPasswordError(res.error);
      } else {
        setSignOutOthersSuccess(res.message || 'All other active sessions have been signed out.');
        setTimeout(() => setSignOutOthersSuccess(null), 3500);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to sign out other sessions.');
    } finally {
      setIsSigningOutOthers(false);
    }
  };

  const filteredSavedAnswers = savedAnswers.filter((item) => {
    const matchesTopic = savedTopicFilter === 'All' || item.topic === savedTopicFilter;
    const matchesSearch =
      !savedSearchQuery.trim() ||
      item.title.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(savedSearchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const memberSince = (user?.created_at || profile?.created_at)
    ? new Date(user?.created_at || profile?.created_at || '').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const isPaid = activePlan === 'pro' || activePlan === 'premium';
  const billingIntervalLabel =
    isAnnualBillingInterval(profile?.billing_interval)
      ? 'Annual (1 Year – 365 Days)'
      : isPaid
      ? 'Monthly (1 Month – 30 Days)'
      : 'Lifetime Free';

  const activationDateFormatted = profile?.plan_activated_at
    ? new Date(profile.plan_activated_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const expirationDateFormatted = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const daysRemaining = profile?.plan_expires_at && isPaid
    ? Math.max(0, Math.ceil((new Date(profile.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const formatQuotaReset = (resetsAt?: string) => {
    if (!resetsAt) return null;
    const resetDate = new Date(resetsAt);
    const diffMs = resetDate.getTime() - Date.now();
    if (diffMs <= 0) return 'Resetting now';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m (${resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    }
    return `Resets in ${minutes}m (${resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  };

  const currentAvatarSrc = avatarPreview || profile?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden box-border">
      {/* Top Header Navigation Bar */}
      <div className="h-14 sm:h-16 border-b border-border/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 w-full max-w-full box-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-muted/60 group-hover:bg-muted flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">Seeker Profile</span>
        </div>
        <div className="w-10 sm:w-16" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {/* Global Feedback Banners */}
        {saved && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-700 flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="font-semibold">Profile information updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs sm:text-sm text-destructive flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{saveError}</span>
          </div>
        )}

        {/* Automatic Plan Activation Banner */}
        <PlanActivationBanner />

        {/* Responsive 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* =================================================================== */}
          {/* LEFT COLUMN: User Card, Subscription, Security & Sessions           */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* User Identity & Avatar Card */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden relative">
              {/* Decorative Banner */}
              <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 relative flex items-start justify-end p-3 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <span className="relative z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  Verified Seeker
                </span>
              </div>

              {/* Profile Details Body */}
              <div className="px-6 pb-6 pt-0 relative">
                {/* Overlapping Avatar */}
                <div className="-mt-14 mb-4 flex flex-col items-center sm:items-start">
                  <div className="relative inline-block p-1 bg-card rounded-full shadow-md">
                    <UserAvatar
                      avatarUrl={currentAvatarSrc}
                      displayName={displayName || profile?.display_name}
                      email={user?.email}
                      size="xl"
                      plan={profile?.plan || activePlan}
                      className="mx-auto"
                    />

                    {isUploadingAvatar ? (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Upload photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Photo Actions & Requirements */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>{currentAvatarSrc ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {currentAvatarSrc && (
                      <button
                        type="button"
                        onClick={handleAvatarRemove}
                        disabled={isUploadingAvatar}
                        className="px-2.5 py-1.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-xs text-destructive flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-center sm:text-left">
                    Supported: JPG, PNG, WebP (Max 5MB)
                  </p>

                  {avatarError && (
                    <div className="w-full mt-2.5 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{avatarError}</span>
                    </div>
                  )}
                </div>

                {/* Identity Metadata */}
                <div className="space-y-3 pt-1 border-t border-border/60">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                        {profile?.display_name || displayName || 'Seeker of Ilm'}
                      </h1>
                      <SubscriptionBadge plan={profile?.plan || activePlan} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-medium text-foreground">{user?.email || profile?.email || 'Seeker'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Verified Account
                      </span>
                    </div>

                    {profile?.phone_number && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-medium text-foreground font-mono">
                          {profile.phone_country_code ? `(${profile.phone_country_code}) ` : ''}
                          {profile.phone_number}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    {memberSince && (
                      <div className="p-2 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-muted-foreground block">Member Since</span>
                          <span className="font-semibold text-foreground truncate">{memberSince}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-2 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-muted-foreground block">Language</span>
                        <span className="font-semibold text-foreground truncate">
                          {preferredLanguage === 'so' ? 'Soomaali' : preferredLanguage === 'ar' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* Subscription & Entitlements Card                                   */}
            {/* =================================================================== */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Current Subscription Tier
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-1">
                    <h3 className="text-lg font-extrabold text-foreground capitalize">
                      {activePlan === 'premium'
                        ? 'Alim (Premium) Scholar'
                        : activePlan === 'pro'
                        ? 'Talib (Pro) Seeker'
                        : 'Free Seeker'}
                    </h3>
                    <span
                      className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0 ${
                        activePlan === 'premium'
                          ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                          : activePlan === 'pro'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {activePlan === 'free' ? 'Free Tier' : `${activePlan.toUpperCase()} ACTIVE`}
                    </span>
                  </div>

                  {/* Comprehensive Subscription Ledger Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs mt-4 pt-3 border-t border-border/70">
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Billing Interval</span>
                      <span className="font-bold text-foreground text-xs">{billingIntervalLabel}</span>
                    </div>
                    {activationDateFormatted && (
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Activation Date</span>
                        <span className="font-bold text-foreground text-xs">{activationDateFormatted}</span>
                      </div>
                    )}
                    {expirationDateFormatted && isPaid && (
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Renewal / Expiration</span>
                        <span className="font-bold text-foreground text-xs">{expirationDateFormatted}</span>
                      </div>
                    )}
                    {daysRemaining !== null && isPaid && (
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                        <span className="text-[10px] text-blue-600 block font-semibold">Days Remaining</span>
                        <span className="font-extrabold text-blue-700 text-xs">
                          {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activePlan === 'free' ? 'Upgrade Plan' : 'Manage / Upgrade'}</span>
              </button>

              {/* 24-Hour Question Allowance with Reset Time */}
              <div className="space-y-2.5 pt-4 border-t border-border/80">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-foreground block">
                      {activePlan === 'free' ? '24-Hour Question Quota' : 'Daily Question Allowance'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {activePlan === 'free'
                        ? 'Free Seeker: 5 AI questions every rolling 24 hours'
                        : `${activePlan.toUpperCase()}: ${currentLimit} scholarly queries per day`}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-foreground text-xs">
                    {usage.count} / {currentLimit}
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      usedPercent >= 100
                        ? 'bg-rose-500'
                        : usedPercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                {/* Dynamic Rolling Quota Reset Banner */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span>
                      {usage.resetsAt
                        ? formatQuotaReset(usage.resetsAt)
                        : activePlan === 'free'
                        ? 'Quota resets 24h after inquiry'
                        : 'Daily allowance refreshes regularly'}
                    </span>
                  </span>
                  <span className="font-bold text-blue-600">
                    {Math.max(0, currentLimit - usage.count)} queries remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Account Security, Active Session & Controls Card */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Security & Session Protection</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Active & Protected
                </span>
              </div>

              {/* Active Device & Client Information */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Monitor className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">
                      Current Device: {clientDevice.browser} on {clientDevice.os}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      {clientDevice.device} · Authenticated via Supabase Session
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium block">
                      Session Active Now
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOutOthers}
                  disabled={isSigningOutOthers}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
                >
                  {isSigningOutOthers ? 'Signing out...' : 'Sign out other devices'}
                </button>
              </div>

              {signOutOthersSuccess && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{signOutOthersSuccess}</span>
                </div>
              )}

              {/* Inline Password Change Toggle */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Account Password</span>
                      <span className="text-[10px] text-muted-foreground">Keep your account secure with regular updates</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {showPasswordForm ? 'Close' : 'Change Password'}
                  </button>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="pt-2 border-t border-border/60 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full bg-card border border-border rounded-xl px-3 py-2 pr-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordError(null);
                        }}
                        className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Quick Navigation & Sign Out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <Link
                  to="/settings"
                  className="p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/60 transition-colors flex items-center gap-2.5 text-foreground"
                >
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block">Full Settings Hub</span>
                    <span className="text-[10px] text-muted-foreground">Appearance, theme & preferences</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block">Sign Out</span>
                    <span className="text-[10px] opacity-80">Log out of your account</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <Link to="/privacy" className="hover:text-foreground hover:underline transition-colors">
                  Privacy Policy
                </Link>
                <span>·</span>
                <Link to="/terms" className="hover:text-foreground hover:underline transition-colors">
                  Terms of Service
                </Link>
                <span>·</span>
                <Link to="/help" className="hover:text-foreground hover:underline transition-colors">
                  Help Center
                </Link>
              </div>
            </div>

          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: Edit Form, Learning Dashboard, Daily Ilm, Library     */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Profile Details & Editing Form */}
            <form onSubmit={handleSave} className="rounded-3xl bg-card border border-border/80 shadow-xs p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div>
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Edit Profile Details</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update your personal profile, preferred language, and contact information.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                  General Info
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Full Name / Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Email Address</label>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Verified & Read-only
                    </span>
                  </div>
                  <input
                    type="email"
                    readOnly
                    value={user?.email || profile?.email || ''}
                    className="w-full bg-muted/20 border border-border rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed"
                  />
                </div>

                {/* Preferred Language Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preferred Language / Luqadda</span>
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium"
                  >
                    <option value="en">English (Global)</option>
                    <option value="so">Soomaali (Somali)</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Applied across EMUFTI AI interface and educational features.
                  </p>
                </div>

                {/* Account Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Account Role</label>
                  <input
                    type="text"
                    readOnly
                    value={profile?.role?.toUpperCase() || 'USER'}
                    className="w-full bg-muted/20 border border-border rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Managed by system administration.
                  </p>
                </div>
              </div>

              {/* International Phone Number with Country Code */}
              <div className="space-y-1.5 pt-2">
                <PhoneInputWithCountry
                  value={phoneNumber}
                  defaultCountry={phoneCountryCode}
                  onChange={(formatted, isValid, country) => {
                    setPhoneNumber(formatted);
                    setIsPhoneValid(isValid);
                    setPhoneCountryCode(country);
                  }}
                  label="Phone Number (International)"
                  helperText="Select country code and enter mobile number. Used for priority notifications and support."
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Link
                  to="/settings"
                  className="ml-auto px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center inline-flex items-center gap-1.5"
                >
                  <span>Account Settings</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            </form>

            {/* Islamic Learning Progress Dashboard */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Learning Journey
                    </span>
                    <h3 className="text-sm font-extrabold text-foreground">
                      Islamic Learning Progress
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  Active Seeker
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Quran Reading Progress */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-mono font-bold">Qur'an</span>
                  </div>
                  <div className="text-base font-extrabold text-foreground pt-1 truncate">
                    {quranProgress ? `Ayah ${quranProgress.last_verse}` : 'Surah 1'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {quranProgress?.surah_name || 'Al-Fatihah'}
                  </div>
                  <Link
                    to="/quran"
                    className="text-[10px] font-bold text-blue-600 hover:underline block pt-1"
                  >
                    Read Holy Quran →
                  </Link>
                </div>

                {/* Subcis Recitation Progress */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-mono font-bold">Subcis</span>
                  </div>
                  <div className="text-base font-extrabold text-foreground pt-1">
                    Subcis
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Alternating Recitation
                  </div>
                  <Link
                    to="/quran?tab=subcis"
                    className="text-[10px] font-bold text-blue-600 hover:underline block pt-1"
                  >
                    Start recitation →
                  </Link>
                </div>

                {/* Saved Answers Count */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-mono font-bold">Saved</span>
                  </div>
                  <div className="text-base font-extrabold text-foreground pt-1">
                    {savedAnswers.length}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Bookmarked rulings
                  </div>
                  <Link
                    to="/saved"
                    className="text-[10px] font-bold text-blue-600 hover:underline block pt-1"
                  >
                    View all →
                  </Link>
                </div>

                {/* Daily Dhikr / Tasbeeh */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-[10px] font-mono font-bold">Tasbeeh</span>
                  </div>
                  <div className="text-base font-extrabold text-foreground pt-1">
                    {tasbeehCount > 0 ? tasbeehCount : '33+'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Dhikr counts logged
                  </div>
                  <Link
                    to="/saved"
                    className="text-[10px] font-bold text-blue-600 hover:underline block pt-1"
                  >
                    View saved items →
                  </Link>
                </div>
              </div>
            </div>

            {/* Daily Authentic Ilm Card */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 border border-blue-200/90 shadow-xs p-5 sm:p-6 space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      Daily Authentic Ilm
                    </span>
                    <h3 className="text-sm font-extrabold text-foreground">
                      {DAILY_REFLECTIONS[dailyTab].title}
                    </h3>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 p-1 bg-muted/70 rounded-xl border border-border/60 self-start sm:self-auto">
                  {(['ayah', 'hadith', 'dua'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDailyTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        dailyTab === tab
                          ? 'bg-card text-blue-600 shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'ayah' ? 'Ayah' : tab === 'hadith' ? 'Hadith' : 'Dua'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Arabic Text Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-card/95 border border-border/70 text-center space-y-2.5 shadow-xs">
                <p
                  dir="rtl"
                  className="text-xl sm:text-2xl font-serif font-bold text-foreground leading-loose tracking-wide select-text"
                >
                  «{DAILY_REFLECTIONS[dailyTab].arabic}»
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{DAILY_REFLECTIONS[dailyTab].source}</span>
                </div>
              </div>

              {/* Translations & Context */}
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    English Translation
                  </span>
                  <p className="text-foreground italic leading-relaxed">
                    "{DAILY_REFLECTIONS[dailyTab].english}"
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Somali Translation (Macnaha Af-Soomaaliga)
                  </span>
                  <p className="text-foreground italic leading-relaxed">
                    "{DAILY_REFLECTIONS[dailyTab].somali}"
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  {DAILY_REFLECTIONS[dailyTab].context}
                </p>
              </div>

              {/* Action Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => handleCopyDailyReflection(DAILY_REFLECTIONS[dailyTab])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer text-xs font-semibold shadow-xs"
                >
                  {dailyCopied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{dailyCopied ? 'Copied with citation!' : 'Copy with citation'}</span>
                </button>

                <Link
                  to="/quran?tab=subcis"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline"
                >
                  <span>Practice with Subcis</span>
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Saved Islamic Answers Section */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Saved Islamic Answers
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {savedAnswers.length} scholarly answers saved in your personal library
                    </span>
                  </div>
                </div>

                <Link
                  to="/saved"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Full Library</span>
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>

              {/* Search & Topic Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter your saved answers..."
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['All', 'General', 'Quran', 'Hadith', 'Fiqh', 'Duas', 'History'].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSavedTopicFilter(topic)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        savedTopicFilter === topic
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/60'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Items List */}
              {filteredSavedAnswers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-muted/20 border border-dashed border-border/80 text-center space-y-2">
                  <Bookmark className="w-7 h-7 text-muted-foreground/60 mx-auto" />
                  <p className="text-xs font-bold text-foreground">
                    {savedAnswers.length === 0 ? 'No answers bookmarked yet' : 'No matching saved answers'}
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    {savedAnswers.length === 0
                      ? 'During your inquiries with EMufti AI, click the bookmark icon on any scholarly answer to save it here for reference.'
                      : 'Try searching with a different keyword or change your topic filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredSavedAnswers.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2 text-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-foreground text-xs">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              {item.topic}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyAnswer(item)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Copy answer"
                          >
                            {copiedAnswerId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnbookmarkAnswer(item.id)}
                            className="p-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                            title="Remove from saved answers"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}

                  {filteredSavedAnswers.length > 5 && (
                    <div className="text-center pt-1">
                      <Link
                        to="/saved"
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View all {filteredSavedAnswers.length} saved answers in library →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User's Submitted Plan Requests (if any) */}
            {userRequests.length > 0 && (
              <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Upgrade Requests</span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground">{userRequests.length} total</span>
                </div>

                <div className="space-y-2">
                  {userRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-foreground text-[11px] block">
                          {req.reference_id}
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {req.plan_slug} Plan · {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            req.status === 'approved' || req.status === 'completed'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : req.status === 'under_review'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : req.status === 'rejected'
                              ? 'bg-destructive/10 text-destructive border border-destructive/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User's Support Requests & Inquiries */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
                  <span>My Support Inquiries</span>
                </h3>
                <Link
                  to="/help"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  + New Inquiry
                </Link>
              </div>

              {isLoadingTickets ? (
                <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading your support tickets...</span>
                </div>
              ) : supportTickets.length === 0 ? (
                <div className="py-5 text-center text-xs text-muted-foreground">
                  <p>No support tickets submitted yet.</p>
                  <Link to="/help" className="text-blue-600 font-bold hover:underline mt-1 inline-block">
                    Visit Help Center to submit a request
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {supportTickets.map((ticket) => {
                    const hasAdminReply = Boolean(ticket.admin_reply && ticket.admin_reply.trim());
                    const isExpanded = expandedTicketId === ticket.id;

                    return (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-foreground text-[11px]">
                              {ticket.reference_id}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border font-semibold capitalize">
                              {ticket.category ? ticket.category.replace('_', ' ') : (ticket.subject || 'General')}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              ticket.status === 'replied'
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : ticket.status === 'in_review'
                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                : ticket.status === 'closed'
                                ? 'bg-muted text-muted-foreground border border-border'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                          <span>Submitted: {new Date(ticket.created_at).toLocaleDateString()}</span>
                          {hasAdminReply ? (
                            <button
                              type="button"
                              onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                              className="font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              <span>{isExpanded ? 'Hide Admin Reply' : 'View Official Admin Reply'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting scholar review</span>
                          )}
                        </div>

                        {/* Official Verified Admin Reply Box */}
                        {hasAdminReply && isExpanded && (
                          <div className="mt-2.5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>Verified Support Team Reply</span>
                              </div>
                              {ticket.replied_at && (
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(ticket.replied_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                              {ticket.admin_reply}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <PlanRequestModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultPlan={activePlan === 'pro' ? 'premium' : 'pro'}
        onRequestSubmitted={(req) => setUserRequests([req, ...userRequests])}
      />
    </div>
  );
};

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, activePlan, profileError } = useAuth();
  const userId = user?.id || 'guest_user';

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [modalDefaultPlan, setModalDefaultPlan] = useState<PlanSlug>('pro');
  const [userRequests, setUserRequests] = useState<PlanRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Inline Tracking State
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState<PlanRequest | null | 'not_found'>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const usage = storage.getDailyUsage(userId);

  const planLimits: Record<PlanSlug, number> = { free: 5, pro: 150, premium: 1000 };
  const currentLimit = planLimits[activePlan] || 5;
  const usedPercent = Math.min(100, Math.round((usage.count / currentLimit) * 100));

  const fetchUserRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    setFetchError(null);
    try {
      const localReqs = storage.getPlanRequests(userId, user?.email);
      let combined = [...localReqs];

      if (isSupabaseConfigured && user?.id) {
        const { data, error } = await supabase
          .from('plan_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase plan_requests fetch warning:', error.message);
        } else if (data) {
          const userEmail = user.email ? user.email.toLowerCase() : null;
          const remoteForUser = data.filter(
            (r: any) =>
              r.user_id === user.id ||
              (userEmail && r.email && typeof r.email === 'string' && r.email.toLowerCase() === userEmail)
          );

          const seen = new Set<string>();
          const merged: PlanRequest[] = [];
          for (const r of [...remoteForUser, ...localReqs]) {
            const key = r.reference_id || r.id;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push({
                ...r,
                plan_slug: r.plan_slug || r.plan || 'pro',
                status: r.status || 'pending',
              });
            }
          }
          combined = merged;
        }
      }

      setUserRequests(combined);
    } catch (err: any) {
      console.error('Failed to load user requests:', err);
      setFetchError('Could not sync remote requests. Displaying local records.');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [userId, user?.id, user?.email]);

  useEffect(() => {
    fetchUserRequests();
  }, [fetchUserRequests]);

  const handleOpenUpgrade = (plan: PlanSlug) => {
    setModalDefaultPlan(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleCopy = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedRefId(refId);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleInlineTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = trackInput.trim().toUpperCase();
    if (!cleanRef) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      if (isSupabaseConfigured) {
        // 1. Try secure RPC first
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc(
            'get_plan_request_status',
            { p_reference_id: cleanRef }
          );
          if (!rpcErr && rpcData) {
            const planVal = (rpcData.plan_slug || rpcData.plan || 'pro') as PlanSlug;
            const normalized: PlanRequest = {
              id: (rpcData as any).id || rpcData.reference_id,
              reference_id: rpcData.reference_id,
              plan_slug: planVal,
              plan: (rpcData.plan || planVal) as PlanSlug,
              status: rpcData.status as PlanRequestStatus,
              payment_verified: Boolean(rpcData.payment_verified),
              has_registered_account:
                rpcData.has_registered_account !== undefined
                  ? Boolean(rpcData.has_registered_account)
                  : undefined,
              is_active:
                rpcData.is_active !== undefined
                  ? Boolean(rpcData.is_active)
                  : undefined,
              activation_state: rpcData.activation_state,
              created_at: rpcData.created_at,
              admin_notes: rpcData.admin_notes,
            } as PlanRequest;
            setTrackResult(normalized);
            storage.savePlanRequest(normalized);
            return;
          }
        } catch {
          // fallback to direct table / view
        }

        const { data, error } = await supabase
          .from('plan_requests')
          .select('*')
          .eq('reference_id', cleanRef)
          .maybeSingle();

        if (error) {
          console.warn('Track query warning:', error.message);
        }

        if (data) {
          const normalized: PlanRequest = {
            id: data.id || data.reference_id,
            reference_id: data.reference_id,
            plan_slug: data.plan_slug || data.plan || 'pro',
            plan: data.plan || data.plan_slug || 'pro',
            status: data.status as PlanRequestStatus,
            payment_verified: Boolean(data.payment_verified),
            created_at: data.created_at,
            admin_notes: data.admin_notes,
          } as PlanRequest;
          setTrackResult(normalized);
          storage.savePlanRequest(normalized);
          return;
        }
      }

      const localFound = storage.getPlanRequestByReference(cleanRef);
      if (localFound) {
        setTrackResult(localFound);
        return;
      }

      setTrackResult('not_found');
    } catch (err: any) {
      setTrackError(err?.message || 'Failed to look up tracking ID.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 w-full max-w-full overflow-x-hidden box-border">
      {/* Header bar */}
      <div className="h-14 border-b border-border/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-20 w-full max-w-full box-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-sm font-bold text-foreground">Subscription & Billing</span>
        <Link
          to="/pricing"
          className="text-xs font-semibold text-blue-600 dark:text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>Compare Plans</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 pb-12 sm:pb-8 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Subscription & Allowance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your Islamic learning plan, monitor daily query allowances, and track upgrade status.
          </p>
        </div>

        {/* Database Diagnostic Notice */}
        {profileError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">Notice: {profileError}. Using cached subscription entitlement.</p>
          </div>
        )}

        {/* Automatic Plan Activation Congratulations Banner */}
        <PlanActivationBanner />

        {/* Current Active Plan Card */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 w-full">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Current Study Tier
              </span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <h2 className="text-xl font-extrabold text-foreground capitalize">
                  {activePlan === 'premium'
                    ? 'Alim (Premium) Scholar'
                    : activePlan === 'pro'
                    ? 'Talib (Pro) Seeker'
                    : 'Free Seeker'}
                </h2>
                <div className="shrink-0 self-start sm:self-auto">
                  <SubscriptionBadge plan={activePlan} size="sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {activePlan === 'premium'
                  ? 'Maximum depth research, 1,000 queries per day, priority Islamic scholar review.'
                  : activePlan === 'pro'
                  ? 'Detailed fiqh comparison across the 4 madhhabs, 150 queries per day.'
                  : 'Basic educational inquiries, 15 queries per day.'}
              </p>
            </div>

            {/* Quick Action Upgrade Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {activePlan === 'free' && (
                <>
                  <button
                    onClick={() => handleOpenUpgrade('pro')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro ($5.99)</span>
                  </button>
                  <button
                    onClick={() => handleOpenUpgrade('premium')}
                    className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Upgrade to Premium</span>
                  </button>
                </>
              )}

              {activePlan === 'pro' && (
                <button
                  onClick={() => handleOpenUpgrade('premium')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade to Premium ($20.99)</span>
                </button>
              )}

              {activePlan === 'premium' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:text-blue-600 border border-blue-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Top Scholar Tier Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Subscription Dates, Interval & Quran Entitlement */}
          {activePlan !== 'free' && (
            <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Billing Cycle</span>
                <span className="text-xs font-semibold text-foreground">
                  {isAnnualBillingInterval(profile?.billing_interval) ? 'Annual (1 Year – 365 Days)' : 'Monthly (1 Month – 30 Days)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Activated On</span>
                <span className="text-xs font-semibold text-foreground">
                  {profile?.plan_activated_at
                    ? new Date(profile.plan_activated_at).toLocaleDateString()
                    : 'Active'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Expires On</span>
                <span className="text-xs font-semibold text-foreground">
                  {profile?.plan_expires_at
                    ? new Date(profile.plan_expires_at).toLocaleDateString()
                    : 'Perpetual'}
                </span>
                {profile?.plan_expires_at && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-600 block font-medium">
                    {Math.max(0, Math.ceil((new Date(profile.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Quran Entitlement</span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Bundled Quran {profile?.quran_plan === 'premium' ? 'Premium' : 'Pro'}</span>
                </span>
              </div>
            </div>
          )}

          {/* Daily Usage Progress */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Daily Question Allowance</span>
              <span className="font-bold text-foreground font-mono">
                {usage.count} of {currentLimit} queries today ({Math.max(0, currentLimit - usage.count)} remaining)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usedPercent >= 90
                    ? 'bg-destructive'
                    : usedPercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Allowance resets daily at midnight UTC. Need higher volume for teaching or madrasah research? Upgrade anytime.
            </p>
          </div>
        </div>

        {/* Pro-to-Premium Upgrade Promotion Callout (For Pro Users) */}
        {activePlan === 'pro' && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-600">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ready to Elevate to Alim (Premium)?</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                As a verified Pro seeker, you can upgrade to Alim (Premium) for extended 1,000 queries/day, priority response queuing, and advanced comparative jurisprudence analysis across all major Sunni traditions.
              </p>
            </div>
            <button
              onClick={() => handleOpenUpgrade('premium')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 flex-shrink-0 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        )}

        {/* Inline Reference ID Tracker */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:text-blue-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Track Existing Upgrade Request
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Check live verification and activation status using your reference ID.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleInlineTrack} className="flex gap-2">
            <input
              type="text"
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              placeholder="e.g. REQ-EMUFTI-XXXXXX"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 uppercase focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={isTracking || !trackInput.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              {isTracking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </form>

          {trackError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          {trackResult === 'not_found' && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <span className="font-bold block">Reference ID Not Found</span>
                <span className="text-[11px]">
                  No matching request found for "{trackInput.trim()}". Please verify the code from your confirmation message.
                </span>
              </div>
            </div>
          )}

          {trackResult && trackResult !== 'not_found' && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {trackResult.reference_id}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                    {trackResult.plan_slug || trackResult.plan} Plan
                  </span>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      trackResult.status === 'approved' || trackResult.status === 'completed'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : trackResult.status === 'under_review'
                        ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                        : trackResult.status === 'rejected'
                        ? 'bg-destructive/15 text-destructive border border-destructive/30'
                        : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                    }`}
                  >
                    Status: {trackResult.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground flex flex-wrap gap-4 pt-1">
                <span>Submitted: {new Date(trackResult.created_at).toLocaleString()}</span>
                <span>Payment: {trackResult.payment_verified ? 'Verified ✓' : 'Manual Verification Pending'}</span>
              </div>

              {trackResult.admin_notes && (
                <div className="p-2.5 rounded-lg bg-card border border-border text-[11px]">
                  <span className="font-semibold text-foreground">Scholar / Admin Note: </span>
                  <span className="text-muted-foreground">{trackResult.admin_notes}</span>
                </div>
              )}

              {/* Granular Truthful Activation State Banners */}
              {trackResult.activation_state === 'awaiting_registration' && (
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Action Required: Account Registration Pending</span>
                  </div>
                  <p className="text-muted-foreground">
                    This request was approved, but no registered account was found for your email. Please register or sign in with your application email to activate your plan.
                  </p>
                </div>
              )}

              {trackResult.activation_state === 'active' && (
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 dark:text-blue-600 border border-blue-200 text-[11px] flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Plan active! Your {trackResult.plan_slug?.toUpperCase()} features are fully unlocked.</span>
                </div>
              )}

              {trackResult.activation_state === 'payment_pending' && (
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Payment Verification Pending</span>
                  </div>
                  <p className="text-muted-foreground">
                    Our team is verifying your payment details. Once verified, access will be granted immediately.
                  </p>
                </div>
              )}

              {!trackResult.activation_state &&
                (trackResult.status === 'approved' || trackResult.status === 'completed') && (
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 dark:text-blue-600 border border-blue-200 text-[11px] flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Request approved! Plan status is synced with your registered account.</span>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* User's Submitted Plan Requests History */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                My Upgrade Requests ({userRequests.length})
              </h3>
            </div>
            <button
              onClick={fetchUserRequests}
              disabled={isLoadingRequests}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 text-xs"
              title="Refresh requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline text-[11px]">Refresh</span>
            </button>
          </div>

          {fetchError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {isLoadingRequests && userRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Loading upgrade requests...</span>
            </div>
          ) : userRequests.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground">No Upgrade Requests Yet</h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                You are currently on the Free Seeker tier. When you submit an upgrade request, it will appear here with live tracking.
              </p>
              <button
                onClick={() => handleOpenUpgrade(activePlan === 'pro' ? 'premium' : 'pro')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Plan Upgrade</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border hover:border-border/80 transition-all space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {req.reference_id}
                      </span>
                      <button
                        onClick={() => handleCopy(req.reference_id)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Copy Reference ID"
                      >
                        {copiedRefId === req.reference_id ? (
                          <Check className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        {req.plan_slug || req.plan} Tier · {req.billing_interval === 'yearly' ? 'Annual (365d)' : 'Monthly (30d)'} {req.price_amount ? `($${(req.price_amount / 100).toFixed(2)})` : ''}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          req.status === 'approved' || req.status === 'completed'
                            ? 'bg-blue-50 text-blue-600 dark:text-blue-600 border border-blue-200'
                            : req.status === 'under_review'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : req.status === 'rejected'
                            ? 'bg-destructive/15 text-destructive border border-destructive/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2 pt-1 border-t border-border/60">
                    <span>Requested: {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Payment: {req.payment_verified ? 'Verified ✓' : 'Awaiting manual confirmation'}</span>
                  </div>

                  {req.admin_notes && (
                    <div className="p-2 rounded-lg bg-card border border-border text-[11px]">
                      <span className="font-semibold text-foreground">Scholar Note: </span>
                      <span className="text-muted-foreground">{req.admin_notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Onboarding & Verification Info */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Verified Account Activation Policy</span>
          </div>
          <p className="leading-relaxed">
            To ensure genuine religious fidelity and scholarly communication, all paid upgrades for EMufti AI are activated with dedicated verification. Once you submit a request, our team activates your plan promptly within 24 hours.
          </p>
          {/* Verified WhatsApp direct contact via wa.me/97466782031 is maintained centrally in the application footer */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://t.me/emufti_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Coordinator</span>
            </a>
            <span>•</span>
            <Link to="/help" className="text-blue-600 dark:text-blue-600 font-semibold hover:underline">
              Help Center & Support Form
            </Link>
          </div>
        </div>
      </main>

      <PlanRequestModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultPlan={modalDefaultPlan}
        onRequestSubmitted={(newReq) => {
          setUserRequests([newReq, ...userRequests]);
          fetchUserRequests();
        }}
      />
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between w-full overflow-x-hidden box-border">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 w-full">
        {/* Top Breadcrumb & Quick Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to EMufti AI</span>
          </Link>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1 rounded-md font-bold">
              Effective: October 2026
            </span>
            <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-transparent border border-blue-200/80 dark:border-blue-900/60 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Amniga &amp; Qarsanaanta Xogta • Verified Data Privacy</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>PostgreSQL RLS Protected</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              How EMufti AI collects, protects, processes, and respects your personal and religious inquiries.
            </p>
          </div>

          {/* Official Verification Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Notice:</strong> This policy document reflects actual data practices across EMufti AI systems and integrations, and remains subject to final review and approval by the service owner.
            </div>
          </div>
        </div>

        {/* Executive Summary Takeaways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Qarsanaan Diineed</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Weydiimaha cibaadada iyo qoyska waxaa loo ilaaliyaa si xafidan oo gaar ah.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">RLS Data Isolation</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Xogtaada waxaa ku gooni ah akoonkaaga oo kaliya adiga ayaana arki kara.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sirta Furayaasha</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Furayaasha sirta ah laguma keydiyo qoraal toos ah; waa kuwo la xafiday.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Xuquuqda Isticmaalaha</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Waxaad kala soo bixi kartaa xogtaada ama tiri kartaa akoonkaaga Settings.
            </p>
          </div>
        </div>

        {/* Quick Jump Navigator */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] px-1">
            Qaybaha Siyaasadda:
          </span>
          <a
            href="#section-1"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            1. Qarsanaanta Diiniga ah
          </a>
          <a
            href="#section-2"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            2. Xogta Aan Ururinno
          </a>
          <a
            href="#section-3"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            3. Ka-shaqaynta &amp; AI
          </a>
          <a
            href="#section-4"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            4. Ilaalinta Amniga
          </a>
          <a
            href="#section-5"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            5. Xuquuqdaada &amp; Tiridda
          </a>
          <a
            href="#section-6"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            6. Xiriirka
          </a>
        </div>

        {/* Detailed Sections List */}
        <div className="space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {/* SECTION 1 */}
          <section
            id="section-1"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Commitment to User Privacy &amp; Religious Confidentiality
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              At EMufti AI, we recognize that inquiries regarding faith, worship, family matters, and religious rulings require the highest degree of discretion and confidentiality. We treat your search queries, conversations, and reading progress with strict digital security and respect.
            </p>
          </section>

          {/* SECTION 2 */}
          <section
            id="section-2"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Data We Collect
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              We collect and handle only the data necessary to provide and secure our educational service:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 sm:pl-10 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Account &amp; Identity:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Email address, full name or display name, and an international phone number with country code provided during account registration.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Profile Photos:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Profile pictures voluntarily uploaded by users, stored in an isolated, secure folder (&apos;avatars/&#123;user_id&#125;/...&apos;) within Supabase Storage.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Inquiries &amp; Dialogues:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Questions submitted to the AI assistant, conversation titles, and saved references, enabling you to revisit past discussions across devices.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Holy Quran &amp; Tafsir Data:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Surah and ayah reading progress, saved Quran bookmarks, and audio lecture listening markers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Support Inquiries:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Details submitted through the Help Center support form (name, email, phone, and issue description), reference tracking numbers, and administrator responses.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Subscription &amp; Upgrade Records:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Plan tier selections (FREE, PRO, PREMIUM), manual transfer reference numbers, activation dates, and expiration timestamps.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 md:col-span-2">
                <strong className="text-slate-900 dark:text-white text-xs block font-bold">
                  Security &amp; Rate-Limiting Records:
                </strong>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Anonymized/hashed account identifiers and failed password attempt timestamps to prevent automated brute-force attacks.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section
            id="section-3"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                3. How Information Is Processed &amp; Third-Party Services
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              EMufti AI relies on vetted third-party infrastructure to deliver service capabilities:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 sm:pl-12 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong>Supabase Auth &amp; Database:</strong> User authentication, session management, and encrypted user data are hosted on Supabase PostgreSQL with strict Row Level Security (RLS) enforcement. Passwords are never stored in plaintext.
              </li>
              <li>
                <strong>Google OAuth:</strong> If you select &quot;Continue with Google&quot;, authentication tokens are validated through Google&apos;s OAuth 2.0 service. We receive only verified email and name claims to initiate your account.
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 pl-1 sm:pl-10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-Powered Islamic Educational Responses</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                When you ask a question, EMUFTI AI processes the information you provide to generate an Islamic educational response. Depending on the features you use, your question and relevant conversation context may be processed by trusted technology service providers that help operate the service. We take reasonable steps to protect your information and do not intentionally include your personal account identifiers in AI prompts. Please avoid submitting passwords, financial details, or other sensitive personal information in your questions.
              </p>
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-300">
                AI-generated responses may contain errors and should be checked against reliable Islamic sources or qualified scholars when necessary.
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section
            id="section-4"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                4. Security Safeguards &amp; Access Controls
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              All application data is protected by PostgreSQL Row Level Security (RLS). Users can only view and modify their own inquiries, bookmarks, and support requests. Profile picture uploads are strictly isolated by folder ownership checks. Temporary account lockouts are enforced after three consecutive incorrect password attempts to safeguard against unauthorized access.
            </p>
          </section>

          {/* SECTION 5 */}
          <section
            id="section-5"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                5. User Rights, Data Management &amp; Deletion
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              You retain comprehensive control over your personal information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 sm:pl-12 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong>View &amp; Edit Profile:</strong> You can review and update your name, profile photo, and phone number anytime in Settings or Seeker Profile.
              </li>
              <li>
                <strong>Export Inquiries:</strong> You can export your saved chat history as a JSON archive from the Settings page.
              </li>
              <li>
                <strong>Clear History &amp; Cache:</strong> You can clear your conversation history or browser local storage while preserving Quran bookmarks and active subscriptions.
              </li>
              <li>
                <strong>Account Deletion:</strong> You can request complete deletion of your account and associated records directly in Settings.
              </li>
            </ul>
          </section>

          {/* SECTION 6 */}
          <section
            id="section-6"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                6. Contact for Privacy Inquiries
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              If you have questions regarding this Privacy Policy or your personal data, please contact us via our Help Center support request form at{' '}
              <Link to="/help" className="text-blue-600 underline font-semibold">
                /help
              </Link>{' '}
              or through our official support helpline listed in the footer.
            </p>

            <div className="pl-1 sm:pl-10 pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/help?tab=submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Contact Help Center</span>
              </Link>
              <a
                href={OFFICIAL_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: {OFFICIAL_WHATSAPP_NUMBER}</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between w-full overflow-x-hidden box-border">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 w-full">
        {/* Top Breadcrumb & Quick Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to EMufti AI</span>
          </Link>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1 rounded-md font-bold">
              Effective: October 2026
            </span>
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-transparent border border-blue-200/80 dark:border-blue-900/60 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Heshiiska Isticmaalka • Legal &amp; Educational Terms</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800">
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span>Grounded in Scripture</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Terms governing your access to and educational use of the EMufti AI platform.
            </p>
          </div>

          {/* Official Verification Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Notice:</strong> These Terms of Service require review and final approval by the service owner prior to formal publication.
            </div>
          </div>
        </div>

        {/* Quick Jump Navigator */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] px-1">
            Qaybaha Shuruudaha:
          </span>
          <a
            href="#terms-1"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            1. Aqbalaadda
          </a>
          <a
            href="#terms-2"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors font-bold text-amber-700 dark:text-amber-400"
          >
            2. Ujeedada &amp; Non-Fatwa
          </a>
          <a
            href="#terms-3"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            3. Amniga Akoonka
          </a>
          <a
            href="#terms-4"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            4. Qorshayaasha (Plans)
          </a>
          <a
            href="#terms-5"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            5. Dalabyada &amp; Ololayaasha
          </a>
          <a
            href="#terms-6"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            6. Hab-dhaqanka
          </a>
          <a
            href="#terms-7"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
          >
            7. Taageerada
          </a>
        </div>

        {/* Detailed Terms Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {/* TERMS 1 */}
          <section
            id="terms-1"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              By creating an account, browsing the Quran &amp; Tafsir library, or sending inquiries to EMufti AI, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue using the service.
            </p>
          </section>

          {/* TERMS 2: Non-Fatwa & Purpose */}
          <section
            id="terms-2"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/40 space-y-4 shadow-sm scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Islamic Educational Purpose &amp; Non-Fatwa Disclaimer
              </h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              <strong>EMufti AI is designed exclusively for educational and research purposes.</strong> It facilitates the study of the Holy Quran, authentic Sunnah, and classical consensus across the recognized schools of Islamic jurisprudence (Hanafi, Maliki, Shafi&apos;i, and Hanbali).
            </p>
            <div className="ml-1 sm:ml-10 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-foreground font-medium leading-relaxed">
              <strong>Crucial Limitation:</strong> AI-generated responses do not constitute formal, legally binding religious verdicts (fatwas). Users must never rely on this platform as the sole basis for solemn life decisions, including marriage dissolution, inheritance disputes, child custody, commercial arbitrations, or judicial matters. You must always verify significant personal rulings with certified, living human Islamic scholars and recognized local authorities.
            </div>
          </section>

          {/* TERMS 3 */}
          <section
            id="terms-3"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                3. User Accounts &amp; Security Protections
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              You are responsible for maintaining the confidentiality of your login credentials. To protect users from unauthorized automated intrusion, our servers temporarily lock login access for an account after three consecutive failed password attempts. Account holders may seek assistance and unlock verification through the official Help Center.
            </p>
          </section>

          {/* TERMS 4: Plans & Quotas */}
          <section
            id="terms-4"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                4. Learning Plans, Quotas &amp; Expiration Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-1 sm:pl-10 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">5 queries / 24 hrs</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rolling 24-hour quota reset and full Quran reading access.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Talib (Pro) Plan</span>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">150 queries / day</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Full Quran audio and Tafsir access ($5.99/mo or $50.99/yr).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Alim (Premium)</span>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">1,000 queries / day</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Priority processing and full Tafsir access ($20.99/mo or $75.99/yr).
                </p>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-1.5 pl-2 sm:pl-12 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2">
              <li><strong>Free Tier:</strong> Provides 5 short queries per 24 hours with a rolling reset and full Quran reading access.</li>
              <li><strong>Talib (Pro) Plan:</strong> Entitles the subscriber to 150 queries per day and full Quran audio and Tafsir access ($5.99/mo or $50.99/yr).</li>
              <li><strong>Alim (Premium) Plan:</strong> Entitles the subscriber to 1,000 queries per day, priority processing, and full Tafsir access ($20.99/mo or $75.99/yr).</li>
              <li><strong>Expiration &amp; Downgrades:</strong> Active PRO and PREMIUM plans remain valid until their verified expiration date. Users cannot be downgraded to the Free tier while an authorized paid subscription remains active. Upon expiration, accounts return to the Free tier automatically.</li>
            </ul>

            <div className="pl-1 sm:pl-10 pt-1">
              <Link
                to="/pricing"
                className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Daawo Qorshayaasha oo Faahfaahsan (View All Pricing Plans)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* TERMS 5 */}
          <section
            id="terms-5"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                5. Plan Requests &amp; Promotional Offers
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              Upgrades to paid tiers are coordinated via the Pricing page and verified by the administrative team. Promotional campaigns (such as the planned Ramadan 1448 packages) are subject to announced opening dates. Promotional benefits and special packages cannot be claimed or activated prior to their official opening date.
            </p>
          </section>

          {/* TERMS 6 */}
          <section
            id="terms-6"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                6. Intellectual Property &amp; Acceptable Conduct
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              The Holy Quran, authentic Ahadith, and classical scholarly commentaries are shared Islamic heritage. The proprietary design, software code, branding, audio curation, and interface of EMufti AI belong to the platform. Users agree not to attempt security circumvention, automated data scraping, prompt injection attacks, or offensive behavior.
            </p>
          </section>

          {/* TERMS 7 */}
          <section
            id="terms-7"
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs hover:border-blue-500/40 transition-colors scroll-mt-20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                7. Support &amp; Dispute Inquiries
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-10">
              For support questions, account recovery, or dispute resolution, please submit a ticket through the Help Center at{' '}
              <Link to="/help" className="text-blue-600 underline font-semibold">
                /help
              </Link>.
            </p>

            <div className="pl-1 sm:pl-10 pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/help?tab=submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Submit Support Ticket</span>
              </Link>
              <a
                href={OFFICIAL_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: {OFFICIAL_WHATSAPP_NUMBER}</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between w-full overflow-x-hidden box-border">
      <main className="max-w-xl mx-auto py-12 px-4 sm:px-8 space-y-6 flex-1 w-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs text-blue-600 hover:underline">
            &larr; Back to EMufti AI
          </Link>
          <Link to="/help" className="text-xs font-semibold text-blue-600 hover:underline">
            Visit Help Center &amp; FAQs &rarr;
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Contact &amp; Support</h1>
          <p className="text-xs text-muted-foreground">
            Have questions about EMufti AI or need immediate assistance? Reach out to our verified team.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 dark:text-blue-600">
            Jazakallahu Khayran! Your message has been sent to our support and research team.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Your Inquiry or Feedback</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you with EMufti AI?"
                className="w-full bg-muted/60 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
            >
              Submit Inquiry
            </button>
          </form>
        )}
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};