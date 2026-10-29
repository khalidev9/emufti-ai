import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Sliders,
  CreditCard,
  Shield,
  Save,
  Moon,
  Sun,
  Laptop,
  Trash2,
  Upload,
  X,
  LogOut,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Cpu,
  Download,
  Keyboard,
  MessageSquare,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  HelpCircle,
  ExternalLink,
  Bell,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Languages,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  BookOpen,
  Clock,
  AlertTriangle,
  FileText,
  RefreshCw,
  Copy,
  CheckCheck,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Compass,
} from 'lucide-react';
import { useAuth, isAnnualBillingInterval } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage, isValidLanguage } from '../lib/i18n';
import {
  useTheme,
  ACCENT_COLORS,
  AccentColor,
  InterfaceDensity,
  FontSize,
  Theme,
} from '../context/ThemeContext';
import { storage, DEFAULT_SETTINGS } from '../lib/storage';
import {
  UserSettings,
  PlanSlug,
  UserSecurityEvent,
  getPlanLabel,
  SupportRequest,
} from '../types/database';
import { PlanRequestModal } from '../components/plans/PlanRequestModal';
import { PhoneInputWithCountry } from '../components/common/PhoneInputWithCountry';
import { UserAvatar } from '../components/common/UserAvatar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../lib/constants';
import type { CountryCode } from 'libphonenumber-js';

function parseUserAgent(): { browser: string; os: string; deviceType: string } {
  if (typeof navigator === 'undefined') {
    return { browser: 'Modern Web Browser', os: 'Desktop OS', deviceType: 'Desktop' };
  }
  const ua = navigator.userAgent;
  let browser = 'Modern Web Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let os = 'Modern OS';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? 'Mobile Device' : 'Desktop Computer';

  return { browser, os, deviceType };
}

type SettingsTab =
  | 'profile'
  | 'appearance'
  | 'security'
  | 'preferences'
  | 'subscription'
  | 'account'
  | 'support'
  | 'general'
  | 'chat'
  | 'storage';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const normalizedInitialTab = useMemo<SettingsTab>(() => {
    if (!rawTab) return 'profile';
    if (rawTab === 'profile') return 'profile';
    if (rawTab === 'appearance' || rawTab === 'general' || rawTab === 'theme' || rawTab === 'accessibility') return 'appearance';
    if (rawTab === 'security' || rawTab === 'privacy') return 'security';
    if (rawTab === 'preferences' || rawTab === 'chat' || rawTab === 'learning') return 'preferences';
    if (rawTab === 'subscription' || rawTab === 'billing' || rawTab === 'plan') return 'subscription';
    if (rawTab === 'account' || rawTab === 'storage' || rawTab === 'export') return 'account';
    if (rawTab === 'support' || rawTab === 'help') return 'support';
    return 'profile';
  }, [rawTab]);

  const {
    user,
    profile,
    isAdmin,
    activePlan,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    deleteAccount,
    signOut,
    resetPassword,
    changePassword,
    signOutOthers,
    fetchSecurityEvents,
  } = useAuth();
  const { language, setLanguage, direction, t } = useLanguage();

  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    customButtonColor,
    setCustomButtonColor,
    density,
    setDensity,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    systemPrefersReducedMotion,
    systemPrefersHighContrast,
  } = useTheme();

  const userId = user?.id || 'seeker_user';
  const [activeTab, setActiveTab] = useState<SettingsTab>(normalizedInitialTab);

  // ---------------------------------------------------------------------------
  // Profile State
  // ---------------------------------------------------------------------------
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>(
    (profile?.phone_country_code as CountryCode) || 'SO'
  );
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // User Settings State (Persisted)
  // ---------------------------------------------------------------------------
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings(userId));
  const [saveFeedback, setSaveFeedback] = useState<
    Record<string, { success: boolean; error: string | null }>
  >({});
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Sync profile values when profile loads/updates
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPhoneNumber(profile.phone_number || '');
      if (profile.phone_country_code) {
        setPhoneCountryCode(profile.phone_country_code as CountryCode);
      }
      if (profile.accent_color && profile.accent_color !== accentColor) {
        setAccentColor(profile.accent_color);
      }
      if (profile.interface_density && profile.interface_density !== density) {
        setDensity(profile.interface_density);
      }
      if (profile.font_size && profile.font_size !== fontSize) {
        setFontSize(profile.font_size);
      }
      if (typeof profile.reduced_motion === 'boolean' && profile.reduced_motion !== reducedMotion) {
        setReducedMotion(profile.reduced_motion);
      }
      if (typeof profile.high_contrast === 'boolean' && profile.high_contrast !== highContrast) {
        setHighContrast(profile.high_contrast);
      }
      if (profile.default_response_language) {
        setChatResponseLang(profile.default_response_language);
      }
    }
  }, [profile]);

  // ---------------------------------------------------------------------------
  // Language Section State
  // ---------------------------------------------------------------------------
  const [selectedSettingLang, setSelectedSettingLang] = useState<SupportedLanguage>(
    isValidLanguage(language) ? language : (profile?.preferred_language as SupportedLanguage) || 'en'
  );
  const [chatResponseLang, setChatResponseLang] = useState<string>(
    (profile?.default_response_language as string) || 'somali'
  );
  const [langSaving, setLangSaving] = useState(false);
  const [langSaveSuccess, setLangSaveSuccess] = useState(false);
  const [langSaveError, setLangSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isValidLanguage(language)) {
      setSelectedSettingLang(language);
    }
  }, [language]);

  const handleSelectLanguage = async (newLang: SupportedLanguage) => {
    if (!isValidLanguage(newLang)) {
      setLangSaveError('Please select a valid supported language (English, Somali, or Arabic).');
      return;
    }

    setSelectedSettingLang(newLang);
    setLangSaving(true);
    setLangSaveError(null);
    setLangSaveSuccess(false);

    try {
      const langRes = await setLanguage(newLang);

      if (user) {
        const profRes = await updateProfile({ preferred_language: newLang });
        if (profRes?.error) {
          setLangSaveError(profRes.error);
          return;
        }
      }

      if (!langRes.success && langRes.error) {
        setLangSaveError(langRes.error);
      } else {
        setLangSaveSuccess(true);
        setTimeout(() => setLangSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setLangSaveError(err?.message || 'Failed to update preferred language.');
    } finally {
      setLangSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Profile Actions
  // ---------------------------------------------------------------------------
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setAvatarError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Photo exceeds the maximum allowed size of 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      if (result.error) {
        setAvatarError(result.error);
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload profile photo.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarFileChange = handleAvatarFileSelect;
  const prefLang = selectedSettingLang;
  const responseLang = chatResponseLang;

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      const result = await removeAvatar();
      if (result.error) {
        setAvatarError(result.error);
      } else {
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);

    if (!displayName.trim()) {
      setProfileError('Display Name cannot be empty.');
      return;
    }

    if (phoneNumber.trim() && !isPhoneValid) {
      setProfileError('Please enter a valid international mobile phone number.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({
        display_name: displayName.trim(),
        phone_number: phoneNumber.trim(),
        phone_country_code: phoneCountryCode,
      });

      if (res?.error) {
        setProfileError(res.error);
      } else {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to save profile changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Generic Save Preferences Helper
  // ---------------------------------------------------------------------------
  const handleSaveSectionPreferences = async (
    sectionKey: string,
    updates: Partial<UserSettings>
  ) => {
    setSavingSection(sectionKey);
    setSaveFeedback((prev) => ({
      ...prev,
      [sectionKey]: { success: false, error: null },
    }));

    const merged = { ...settings, ...updates };
    setSettings(merged);
    storage.saveSettings(userId, merged);

    try {
      if (user) {
        const payload: Record<string, any> = {
          settings: merged,
          theme: merged.theme,
          font_size: merged.font_size,
          interface_density: merged.interface_density,
          accent_color: merged.accent_color,
          reduced_motion: merged.reduced_motion,
          high_contrast: merged.high_contrast,
          learning_level: merged.learning_level,
          learning_style: merged.learning_style,
          preferred_school: merged.preferred_school,
          answer_length: merged.answer_length,
          explanation_style: merged.explanation_style,
          show_references: merged.show_references,
          reminder_schedule: merged.reminder_schedule,
          reminder_timezone: merged.reminder_timezone,
          notifications_enabled: merged.learning_reminders,
        };

        const res = await updateProfile(payload);
        if (res?.error) {
          console.warn('[SettingsPage] Notice when saving preferences to Supabase:', res.error);
        }
      }

      setSaveFeedback((prev) => ({
        ...prev,
        [sectionKey]: { success: true, error: null },
      }));
      setTimeout(() => {
        setSaveFeedback((prev) => ({
          ...prev,
          [sectionKey]: { success: false, error: null },
        }));
      }, 3000);
    } catch (err: any) {
      setSaveFeedback((prev) => ({
        ...prev,
        [sectionKey]: { success: false, error: err?.message || 'Error saving settings' },
      }));
    } finally {
      setSavingSection(null);
    }
  };

  // ---------------------------------------------------------------------------
  // General Experience Handlers (Live updates immediately in UI & persists)
  // ---------------------------------------------------------------------------
  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    await handleSaveSectionPreferences('general', { theme: newTheme });
  };

  const handleAccentChange = async (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    await handleSaveSectionPreferences('general', { accent_color: newAccent });
  };

  const handleDensityChange = async (newDensity: InterfaceDensity) => {
    setDensity(newDensity);
    await handleSaveSectionPreferences('general', { interface_density: newDensity });
  };

  const handleFontSizeChange = async (newSize: FontSize) => {
    setFontSize(newSize);
    await handleSaveSectionPreferences('general', { font_size: newSize });
  };

  const handleReducedMotionChange = async (val: boolean) => {
    setReducedMotion(val);
    await handleSaveSectionPreferences('general', { reduced_motion: val });
  };

  const handleHighContrastChange = async (val: boolean) => {
    setHighContrast(val);
    await handleSaveSectionPreferences('general', { high_contrast: val });
  };

  const handleResetGeneralDefaults = async () => {
    setTheme('system');
    setAccentColor('blue');
    setDensity('comfortable');
    setFontSize('medium');
    setReducedMotion(false);
    setHighContrast(false);

    await handleSaveSectionPreferences('general', {
      theme: 'system',
      accent_color: 'blue',
      interface_density: 'comfortable',
      font_size: 'medium',
      reduced_motion: false,
      high_contrast: false,
    });
  };

  // ---------------------------------------------------------------------------
  // Security & Password Handlers
  // ---------------------------------------------------------------------------
  const clientDevice = parseUserAgent();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const [signOutOthersNotice, setSignOutOthersNotice] = useState<string | null>(null);
  const [securityEvents, setSecurityEvents] = useState<UserSecurityEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    if (activeTab === 'security' && user) {
      setIsLoadingEvents(true);
      fetchSecurityEvents()
        .then((events) => setSecurityEvents(events))
        .catch(() => {})
        .finally(() => setIsLoadingEvents(false));
    }
  }, [activeTab, user]);

  // ---------------------------------------------------------------------------
  // Support & Help Requests State
  // ---------------------------------------------------------------------------
  const [supportTickets, setSupportTickets] = useState<SupportRequest[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'support' && user && isSupabaseConfigured) {
      setIsLoadingTickets(true);
      const fetchTickets = async () => {
        try {
          const { data, error } = await supabase
            .from('support_requests')
            .select('*')
            .or(`user_id.eq.${user.id},email.eq.${user.email || ''}`)
            .order('created_at', { ascending: false });
          if (!error && data) {
            setSupportTickets(data as SupportRequest[]);
          }
        } catch (err) {
          console.error('Failed to fetch user support requests:', err);
        } finally {
          setIsLoadingTickets(false);
        }
      };
      fetchTickets();
    }
  }, [activeTab, user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeSuccess(null);
    setPasswordChangeError(null);

    if (newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match. Please verify and try again.');
      return;
    }

    setIsChangingPassword(true);
    const res = await changePassword(newPassword);
    setIsChangingPassword(false);

    if (res.error) {
      setPasswordChangeError(res.error);
    } else {
      setPasswordChangeSuccess('Password updated successfully. Use your new credentials on your next login.');
      setNewPassword('');
      setConfirmPassword('');
      fetchSecurityEvents().then(setSecurityEvents).catch(() => {});
    }
  };

  const handleSignOutOthers = async () => {
    setIsSigningOutOthers(true);
    setSignOutOthersNotice(null);
    const res = await signOutOthers();
    setIsSigningOutOthers(false);
    if (res.error) {
      setSignOutOthersNotice(`Notice: ${res.error}`);
    } else {
      setSignOutOthersNotice(
        res.message || 'Sign out request sent. Other browser sessions will be invalidated upon their next token refresh.'
      );
      fetchSecurityEvents().then(setSecurityEvents).catch(() => {});
    }
  };

  // Account Deletion State & Confirmation
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteAccountError('Please type DELETE exactly to proceed.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      const res = await deleteAccount();
      if (res?.error) {
        setDeleteAccountError(res.error);
        setIsDeletingAccount(false);
      } else {
        // Only navigate away once server deletion succeeded
        navigate('/');
      }
    } catch (err: any) {
      setDeleteAccountError(err?.message || 'Failed to delete account on server.');
      setIsDeletingAccount(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Data, Storage & Export Handlers
  // ---------------------------------------------------------------------------
  const [confirmClearHistoryModalOpen, setConfirmClearHistoryModalOpen] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [clearHistorySuccess, setClearHistorySuccess] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);

  // Real Storage & Data Metrics (Unfabricated)
  const userConversations = useMemo(() => storage.getConversations(userId), [userId, clearHistorySuccess]);
  const totalConversationsCount = userConversations.length;
  const totalMessagesCount = useMemo(() => {
    return userConversations.reduce((acc, c) => acc + storage.getMessages(c.id).length, 0);
  }, [userConversations]);
  const savedItemsCount = useMemo(() => storage.getSavedItems(userId).length, [userId]);

  const localFootprintStr = useMemo(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return '0 KB';
      let bytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('emufti_')) {
          const v = localStorage.getItem(k);
          bytes += (k.length + (v ? v.length : 0)) * 2;
        }
      }
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    } catch {
      return '0 KB';
    }
  }, [userConversations, savedItemsCount, clearHistorySuccess]);

  const handleClearHistory = () => {
    setIsClearingHistory(true);
    try {
      storage.clearAllConversations(userId);
      setClearHistorySuccess(true);
      setConfirmClearHistoryModalOpen(false);
      setTimeout(() => setClearHistorySuccess(false), 3000);
    } catch (e: any) {
      console.error('Failed to clear history:', e);
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleExportData = (format: 'json' | 'text') => {
    setIsExporting(true);
    setExportSuccessMsg(null);
    setExportErrorMsg(null);

    try {
      const convs = storage.getConversations(userId);
      const messagesMap: Record<string, any[]> = {};
      convs.forEach((c) => {
        messagesMap[c.id] = storage.getMessages(c.id);
      });
      const savedItems = storage.getSavedItems(userId);
      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === 'json') {
        const payload = {
          export_version: '2.0',
          exported_at: new Date().toISOString(),
          user: {
            id: user?.id || userId,
            email: user?.email || profile?.email,
            display_name: profile?.display_name || displayName,
            role: profile?.role || 'user',
            plan: activePlan,
            preferred_language: language,
          },
          settings,
          conversations: convs.map((c) => ({
            id: c.id,
            title: c.title,
            created_at: c.created_at,
            messages: messagesMap[c.id] || [],
          })),
          saved_knowledge_items: savedItems,
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emufti_takeout_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        let md = `# EMUFTI AI — Research & Inquiry Takeout\nExported: ${new Date().toLocaleString()}\nSeeker: ${
          profile?.display_name || displayName || 'Seeker'
        } (${user?.email || 'registered_user'})\n\n`;

        md += `## Saved Islamic References (${savedItems.length})\n\n`;
        savedItems.forEach((item, idx) => {
          md += `### ${idx + 1}. ${item.title}\nTopic: ${item.topic}\nDate: ${item.created_at}\n\n${item.content}\n\n---\n\n`;
        });

        md += `## Conversations & Questions (${convs.length})\n\n`;
        convs.forEach((c, idx) => {
          md += `### Conversation ${idx + 1}: ${c.title}\nDate: ${c.created_at}\n\n`;
          const msgs = messagesMap[c.id] || [];
          msgs.forEach((m) => {
            const role = m.role === 'user' ? 'Question' : 'EMufti AI Response';
            md += `**${role}** (${m.created_at}):\n${m.content}\n\n`;
          });
          md += `---\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emufti_chat_takeout_${timestamp}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setExportSuccessMsg('Data export generated and downloaded successfully.');
      setTimeout(() => setExportSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to export data:', err);
      setExportErrorMsg(err?.message || 'Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Subscription Plan & Usage Details
  // ---------------------------------------------------------------------------
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const planLimits: Record<PlanSlug, number> = { free: 5, pro: 150, premium: 1000 };
  const currentLimit = planLimits[activePlan] || 5;
  const planLabel = getPlanLabel(activePlan || profile?.plan);
  const usage = storage.getDailyUsage(userId);
  const usedPercent = Math.min(100, Math.round((usage.count / currentLimit) * 100));

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 14, 2026';

  const planExpiresText = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const currentAvatarSrc = avatarPreview || profile?.avatar_url;

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {}
  };

  const SETTINGS_TABS: Array<{
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
  }> = [
    { id: 'profile', label: t('settings.profile_tab', '1. Profile'), icon: User, category: 'Personal' },
    { id: 'appearance', label: t('settings.tab_appearance', '2. Appearance'), icon: Palette, category: 'Experience' },
    { id: 'security', label: t('settings.tab_security', '3. Privacy & Security'), icon: ShieldCheck, category: 'Protection' },
    { id: 'preferences', label: t('settings.tab_preferences', '4. Preferences & Methodology'), icon: Compass, category: 'Methodology' },
    { id: 'subscription', label: t('settings.tab_subscription', '5. Subscription'), icon: CreditCard, category: 'Billing' },
    { id: 'account', label: t('settings.tab_account', '6. Account Management'), icon: Database, category: 'Account' },
    { id: 'support', label: t('settings.tab_support', 'Support & Help'), icon: LifeBuoy, category: 'Assistance' },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 w-full max-w-full overflow-x-hidden box-border ${
        highContrast ? 'high-contrast' : ''
      }`}
    >
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-border/80 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-30 w-full max-w-full box-border">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/chat')}
            aria-label={t('common.return_to_chat', 'Return to Chat')}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-muted/60 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t('common.return_to_chat', 'Return to Chat')}</span>
            <span className="sm:hidden font-medium">{t('common.back', 'Chat')}</span>
          </button>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <span className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight truncate">
            {t('settings.title', 'Settings Center')}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          aria-label={t('common.sign_out', 'Sign Out')}
          className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl border border-border hover:bg-muted/70 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('common.sign_out', 'Sign Out')}</span>
        </button>
      </header>

      {/* Main Settings Container */}
      <div className="flex-1 max-w-6xl mx-auto px-3 sm:px-8 py-4 sm:py-8 w-full max-w-full overflow-x-hidden box-border flex flex-col md:flex-row gap-6 md:gap-8 items-start pb-24 lg:pb-8">
        {/* Mobile Navigation (Visible only on mobile/small screens) */}
        <div className="md:hidden w-full max-w-full min-w-0 space-y-2.5 overflow-hidden box-border">
          {/* Active Section Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle settings navigation"
              className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-2xl bg-card border border-border shadow-xs text-left cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const currentTabObj = SETTINGS_TABS.find((t) => t.id === activeTab);
                    const Icon = currentTabObj?.icon || Sliders;
                    return <Icon className="w-4 h-4" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    {SETTINGS_TABS.find((t) => t.id === activeTab)?.category || 'Settings'}
                  </span>
                  <span className="text-xs font-bold text-foreground truncate block">
                    {SETTINGS_TABS.find((t) => t.id === activeTab)?.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                  {activeTab === 'support' ? 'Help' : activeTab}
                </span>
                {isMobileMenuOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Mobile Dropdown Menu Drawer */}
            {isMobileMenuOpen && (
              <div className="mt-2 p-2 bg-card border border-border rounded-2xl shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as SettingsTab);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'text-muted-foreground/80'}`}>
                        {tab.category}
                      </span>
                    </button>
                  );
                })}

                {isAdmin && (
                  <div className="pt-1 mt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/admin?tab=diagnostics');
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-600 hover:bg-blue-50 transition-all border border-blue-200 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 flex-shrink-0" />
                        <span>Admin Dashboard</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:text-blue-600 font-bold uppercase">
                        Admin
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Horizontal Scrollable Tab Pills */}
          <div className="w-full max-w-full min-w-0 overflow-hidden flex-shrink-0">
            <div className="w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as SettingsTab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-blue-600 dark:text-blue-600 bg-blue-50 border border-blue-200 whitespace-nowrap cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Sidebar Tabs (Preserved strictly on desktop) */}
        <aside className="hidden md:block w-64 space-y-3 flex-shrink-0 sticky top-24">
          <div className="p-3 bg-card border border-border rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1 block">
              {t('settings.preferences', 'Preferences')}
            </span>

            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <div className="p-3 bg-card border border-border rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => navigate('/admin?tab=diagnostics')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-600 hover:bg-blue-50 transition-all border border-blue-200 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 flex-shrink-0" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:text-blue-600 font-bold uppercase">
                  Admin
                </span>
              </button>
            </div>
          )}
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 w-full space-y-6">
          {/* =================================================================== */}
          {/* TAB 2: APPEARANCE & INTERFACE                                       */}
          {/* =================================================================== */}
          {(activeTab === 'appearance' || activeTab === 'general') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('settings.tab_appearance', '2. Appearance & Interface')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('appearance.subtitle', 'Customize theme (light, dark, system), accent color, font size, interface density, reduced motion, and high contrast.')}
                </p>
              </div>

              {/* Status alerts */}
              {saveFeedback.general?.success && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Preferences updated and saved successfully.</span>
                </div>
              )}
              {saveFeedback.general?.error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveFeedback.general.error}</span>
                </div>
              )}
              {savingSection === 'general' && (
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                  <span>Saving preferences...</span>
                </div>
              )}

              {/* Settings Rows Card */}
              <div className="rounded-2xl border border-border bg-card p-5 divide-y divide-border/50 shadow-xs space-y-4">
                {/* 1. Theme */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 first:pt-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('appearance.theme_title', 'Theme')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('appearance.theme_desc', 'Choose light, dark, or system color mode.')}</span>
                  </div>
                  <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border self-start sm:self-auto">
                    {[
                      { id: 'light', label: t('appearance.light', 'Light'), icon: Sun },
                      { id: 'dark', label: t('appearance.dark', 'Dark'), icon: Moon },
                      { id: 'system', label: t('appearance.system', 'System'), icon: Laptop },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleThemeChange(item.id as Theme)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-background text-foreground shadow-xs font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. System Language */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('language.system_language', 'System Language')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('language.subtitle', 'Primary interface language.')}</span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {langSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                    <select
                      value={selectedSettingLang}
                      onChange={(e) => handleSelectLanguage(e.target.value as SupportedLanguage)}
                      disabled={langSaving}
                      className="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-xl bg-muted/40 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {SUPPORTED_LANGUAGES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.nativeName} ({item.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Accent Color Picker & Live Customization */}
                <div className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground block">
                          {t('appearance.accent_title', 'Accent Color Palette')}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {t('appearance.accent_desc', 'Choose your system accent color (Red, Light Blue, Green, Yellow, etc.) to customize buttons, active tabs, and highlights.')}
                      </span>
                    </div>

                    {/* Active Accent Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border text-[11px] font-semibold text-foreground self-start sm:self-auto">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb' }}
                      />
                      <span>{ACCENT_COLORS.find((c) => c.id === accentColor)?.label || 'Royal Blue'}</span>
                    </div>
                  </div>

                  {/* Swatches Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border">
                    {ACCENT_COLORS.map((color) => {
                      const isSelected = accentColor === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => handleAccentChange(color.id)}
                          title={color.label}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-card border-primary ring-2 ring-primary/30 shadow-xs scale-102 font-bold'
                              : 'border-transparent hover:bg-card/70 hover:border-border opacity-85 hover:opacity-100'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-transform shadow-2xs shrink-0"
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <span className="text-[10px] text-foreground tracking-tight leading-none text-center">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Button Color Configurator */}
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        <span>Habee Midabka Badhamada (Custom Button Color)</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        Dooro ama geli lambarka midabka (Hex code) aad rabto in badhamada loo adeegsado.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="relative flex items-center gap-2">
                        <input
                          type="color"
                          value={customButtonColor || '#2563eb'}
                          onChange={(e) => setCustomButtonColor(e.target.value)}
                          className="w-8 h-8 rounded-xl cursor-pointer border border-border p-0.5 bg-background shadow-xs"
                          title="Dooro midab gaar ah (Color Picker)"
                        />
                        <input
                          type="text"
                          value={customButtonColor || '#2563eb'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('#') || val.length <= 7) {
                              setCustomButtonColor(val);
                            }
                          }}
                          placeholder="#2563EB"
                          maxLength={7}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-border bg-background text-foreground uppercase"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomButtonColor('#2563eb');
                          handleAccentChange('blue');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors cursor-pointer"
                        title="Ku celi midabkii caadiga ahaa (Reset)"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Live Preview Card */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>{t('appearance.accent_preview', 'Live Element Preview:')}</span>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Preview Primary Button */}
                      <span
                        className="px-3 py-1 rounded-xl text-white font-bold text-xs shadow-2xs transition-colors"
                        style={{ backgroundColor: customButtonColor || ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb' }}
                      >
                        Primary Button
                      </span>

                      {/* Preview Active Tab Chip */}
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1"
                        style={{
                          backgroundColor: (customButtonColor || ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb') + '15',
                          borderColor: (customButtonColor || ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb') + '40',
                          color: customButtonColor || ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb',
                        }}
                      >
                        <Check className="w-3 h-3" /> Active Tab
                      </span>

                      {/* Preview Highlight Dot */}
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: customButtonColor || ACCENT_COLORS.find((c) => c.id === accentColor)?.hex || '#2563eb' }}
                        title="Live highlight indicator"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Font Size */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('accessibility.font_size_title', 'Font Size')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('accessibility.font_size_desc', 'Adjust chat reading typography.')}</span>
                  </div>
                  <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border self-start sm:self-auto">
                    {[
                      { id: 'small', label: t('appearance.font_small', 'Small (14px)') },
                      { id: 'medium', label: t('appearance.font_medium', 'Medium (16px)') },
                      { id: 'large', label: t('appearance.font_large', 'Large (18px)') },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleFontSizeChange(item.id as FontSize)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          fontSize === item.id
                            ? 'bg-background text-foreground shadow-xs font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Interface Density */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('appearance.density_title', 'Interface Density')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('appearance.density_desc', 'Spacing and padding throughout the UI.')}</span>
                  </div>
                  <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border self-start sm:self-auto">
                    {[
                      { id: 'compact', label: t('appearance.density_compact', 'Compact') },
                      { id: 'comfortable', label: t('appearance.density_comfortable', 'Comfortable') },
                      { id: 'spacious', label: t('appearance.density_spacious', 'Spacious') },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleDensityChange(item.id as InterfaceDensity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          density === item.id
                            ? 'bg-background text-foreground shadow-xs font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Reduced Motion */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('appearance.reduced_motion', 'Reduced Motion')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('appearance.reduced_motion_desc', 'Minimizes motion and transitions for visual comfort.')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => handleReducedMotionChange(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* 7. High Contrast */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('appearance.high_contrast', 'High Contrast Mode')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('appearance.high_contrast_desc', 'Maximizes boundary contrast and crisp text borders.')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => handleHighContrastChange(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* 8. Audio Recitation Playback Speed */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Xawaaraha Codka (Audio Playback Speed)</span>
                    <span className="text-[11px] text-muted-foreground block">Reciter speed for Quran recitation and listening.</span>
                  </div>
                  <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border self-start sm:self-auto">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => {
                      const isSelected = (settings.audio_playback_speed || 1) === speed;
                      return (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => handleSaveSectionPreferences('general', { audio_playback_speed: speed })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-background text-foreground shadow-xs font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {speed}x
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 9. Auto-play Next Verse */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Isku Xigsiinta Codka (Auto-Play Next Ayah)</span>
                    <span className="text-[11px] text-muted-foreground block">Automatically recites the subsequent verse in sequence.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoplay_recitation !== false}
                    onChange={(e) => handleSaveSectionPreferences('general', { autoplay_recitation: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* 10. In-App Notification Audio Chime */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Codka Ogeysiisyada (Notification Sound)</span>
                    <span className="text-[11px] text-muted-foreground block">Play an audible chime when AI finishes answering or on prayer time.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notification_sound !== false}
                    onChange={(e) => handleSaveSectionPreferences('general', { notification_sound: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* 11. Daily Quran & Learning Reflections */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground block">{t('notifications.reminders_title', 'Daily Quran Reflections')}</span>
                      <span className="text-[11px] text-muted-foreground block">{t('notifications.reminders_desc', 'Receive an uplifting daily Quranic verse reflection.')}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.learning_reminders !== false}
                      onChange={(e) => handleSaveSectionPreferences('general', { learning_reminders: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  {settings.learning_reminders !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">{t('notifications.schedule_title', 'Schedule Time')}</label>
                        <select
                          value={settings.reminder_schedule || 'morning'}
                          onChange={(e) => handleSaveSectionPreferences('general', { reminder_schedule: e.target.value as any })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="fajr">{t('notifications.fajr', 'Dawn / Fajr Reflection')}</option>
                          <option value="morning">{t('notifications.morning', 'Morning Study (09:00)')}</option>
                          <option value="evening">{t('notifications.evening', 'Evening Reflection (20:00)')}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">{t('notifications.timezone_title', 'Timezone')}</label>
                        <select
                          value={settings.reminder_timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC')}
                          onChange={(e) => handleSaveSectionPreferences('general', { reminder_timezone: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Africa/Mogadishu">Africa/Mogadishu (UTC+3)</option>
                          <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                          <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                          <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                          <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                          <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                          <option value="America/New_York">America/New York (EST/EDT)</option>
                          <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                          <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                          <option value="UTC">Coordinated Universal Time (UTC)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset to defaults button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResetGeneralDefaults}
                  className="px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground transition-all cursor-pointer"
                >
                  {t('appearance.reset_btn', 'Reset General Defaults')}
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 1: PROFILE & IDENTITY                                           */}
          {/* =================================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">{t('profile.title', '1. Profile & Identity')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('profile.subtitle', 'Manage your display name, verified email, international phone number with country picker, avatar, and preferred language.')}
                </p>
              </div>

              {profileSaved && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{t('profile.saved_success', 'Profile information and preferences saved successfully.')}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {avatarError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{avatarError}</span>
                </div>
              )}

              {/* Profile Photo Upload Card */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider text-muted-foreground">
                  {t('profile.photo_title', 'Profile Photo')}
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group">
                    <UserAvatar
                      avatarUrl={currentAvatarSrc}
                      displayName={displayName || profile?.display_name}
                      email={user?.email}
                      size="xl"
                      plan={profile?.plan || activePlan}
                    />

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground">
                      {t('profile.photo_hint', 'PNG, JPG, or WebP. Maximum file size 5MB.')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-2.5 min-h-[44px] flex-1 sm:flex-initial justify-center rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{profile?.avatar_url || currentAvatarSrc ? t('profile.replace_photo', 'Replace Photo') : t('profile.upload_photo', 'Upload Photo')}</span>
                      </button>

                      {(profile?.avatar_url || currentAvatarSrc) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="px-3 py-2.5 min-h-[44px] flex-1 sm:flex-initial justify-center rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t('profile.remove_photo', 'Remove Photo')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seeker Information Form */}
              <form onSubmit={handleSaveProfile} className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider text-muted-foreground">
                  Personal Information
                </span>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t('auth.full_name', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ahmed Nur"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground transition-all"
                  />
                </div>

                {/* Account Email (Read-only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">{t('auth.email', 'Email Address')}</label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Auth ID
                    </span>
                  </div>
                  <input
                    type="email"
                    disabled
                    readOnly
                    value={user?.email || profile?.email || 'seeker@emufti.ai'}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/20 border border-border/60 text-muted-foreground cursor-not-allowed font-medium"
                  />
                </div>

                {/* International Phone */}
                <div className="space-y-1.5">
                  <PhoneInputWithCountry
                    id="profile-phone"
                    value={phoneNumber}
                    defaultCountry={phoneCountryCode}
                    onChange={(formatted, isValid, country) => {
                      setPhoneNumber(formatted);
                      setIsPhoneValid(isValid);
                      setPhoneCountryCode(country);
                    }}
                    label={t('auth.phone', 'Phone Number')}
                    helperText={t('auth.phone_helper', 'International phone number with country code for verified account security.')}
                  />
                </div>

                {/* Language Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t('language.system_language', 'Preferred Language')}</label>
                  <div className="flex items-center gap-2">
                    {langSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                    <select
                      value={selectedSettingLang}
                      onChange={(e) => handleSelectLanguage(e.target.value as SupportedLanguage)}
                      disabled={langSaving}
                      className="w-full px-3.5 py-2.5 min-h-[44px] text-xs font-semibold rounded-xl bg-muted/40 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {SUPPORTED_LANGUAGES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.nativeName} ({item.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                    {t('profile.member_since', 'Member Since')}: {memberSince}
                  </span>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('common.saving', 'Saving...')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{t('profile.save_changes', 'Save Profile Changes')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: PREFERENCES & JURISTIC METHODOLOGY                           */}
          {/* =================================================================== */}
          {(activeTab === 'preferences' || activeTab === 'chat') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('chat_pref.title', '4. Preferences & Juristic Methodology')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('chat_pref.subtitle', 'Configure AI response depth, juristic methodology (Fiqh school), scholarly citations, and learning reminders.')}
                </p>
              </div>

              {saveFeedback.chat?.success && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Chat preferences saved successfully.</span>
                </div>
              )}

              {saveFeedback.learning?.success && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Islamic learning preferences updated successfully.</span>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5 divide-y divide-border/50 shadow-xs space-y-4">
                {/* 1. Response Length */}
                <div className="space-y-2 pt-1 first:pt-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.response_length_title', 'Response Length')}</span>
                    <span className="text-[11px] text-muted-foreground block">Select the default detail level for AI answers.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'concise', label: t('chat_pref.len_concise', 'Concise'), desc: t('chat_pref.len_concise_desc', 'Brief rulings & essential proofs.') },
                      { id: 'balanced', label: t('chat_pref.len_balanced', 'Balanced'), desc: t('chat_pref.len_balanced_desc', 'Clear explanation with primary proofs.') },
                      { id: 'detailed', label: t('chat_pref.len_detailed', 'Detailed'), desc: t('chat_pref.len_detailed_desc', 'In-depth analysis & comparative positions.') },
                    ].map((item) => {
                      const isSelected = settings.answer_length === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSaveSectionPreferences('chat', { answer_length: item.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Explanation Style */}
                <div className="space-y-2 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.style_title', 'Explanation Style')}</span>
                    <span className="text-[11px] text-muted-foreground block">Choose tone and vocabulary complexity.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { id: 'simple', label: t('chat_pref.style_simple', 'Simple & Accessible'), desc: t('chat_pref.style_simple_desc', 'Everyday language for all seekers.') },
                      { id: 'advanced', label: t('chat_pref.style_advanced', 'Advanced Scholarly'), desc: t('chat_pref.style_advanced_desc', 'Classical terminology & Usul al-Fiqh principles.') },
                    ].map((item) => {
                      const isSelected = settings.explanation_style === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSaveSectionPreferences('chat', { explanation_style: item.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Islamic Knowledge Level */}
                <div className="space-y-2 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('learning.level_title', 'Knowledge Level')}</span>
                    <span className="text-[11px] text-muted-foreground block">Tailors scholarly context to your study background.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'beginner', label: t('learning.level_beginner', 'Beginner Seeker'), desc: 'Foundations of Aqeedah & Fard Ayn.' },
                      { id: 'intermediate', label: t('learning.level_intermediate', 'Student (Talib)'), desc: 'Evidence-backed rulings & Hadith context.' },
                      { id: 'advanced', label: t('learning.level_advanced', 'Advanced Researcher'), desc: 'Derivation principles & Usul al-Fiqh.' },
                    ].map((item) => {
                      const isSelected = (settings.learning_level || 'intermediate') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSaveSectionPreferences('learning', { learning_level: item.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Juristic School (Madhhab) */}
                <div className="space-y-2 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('learning.madhhab_title', 'Optional Juristic School (Madhhab)')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('learning.madhhab_subtitle', 'Select an optional juristic framework or keep general Sunnah consensus.')}</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {[
                      { id: 'all', label: t('learning.school_all', 'General Sunnah & Scholarly Consensus (Default)'), desc: 'Rulings based on the most evident authentic proof without school restriction.' },
                      { id: 'shafii', label: "Shafi'i Madhhab (الإمام الشافعي)", desc: 'Prominent across East Africa, Horn of Africa, and Southeast Asia.' },
                      { id: 'hanafi', label: 'Hanafi Madhhab (الإمام أبو حنيفة)', desc: 'Prominent in South Asia, Central Asia, and Turkey.' },
                      { id: 'maliki', label: 'Maliki Madhhab (الإمام مالك)', desc: 'Prevalent in North and West Africa.' },
                      { id: 'hanbali', label: 'Hanbali Madhhab (الإمام أحمد)', desc: 'Prevalent in the Arabian Peninsula.' },
                    ].map((school) => {
                      const isSelected = (settings.preferred_school || 'all') === school.id;
                      return (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => handleSaveSectionPreferences('learning', { preferred_school: school.id as any })}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-muted/30 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-foreground block">{school.label}</span>
                            <span className="text-[11px] text-muted-foreground block">{school.desc}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[3] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Toggles: References & History */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.references_title', 'Display Quran & Hadith References')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('chat_pref.references_desc', 'Include authentic citations and source links with every response.')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_references !== false}
                    onChange={(e) => handleSaveSectionPreferences('chat', { show_references: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.history_title', 'Save Conversation History')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('chat_pref.history_desc', 'Retain past conversations across sessions for easy reference.')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.save_history !== false}
                    onChange={(e) => handleSaveSectionPreferences('chat', { save_history: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* 6. Keyboard send */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.keyboard_title', 'Keyboard Messaging')}</span>
                    <span className="text-[11px] text-muted-foreground block">
                      {settings.enter_to_send
                        ? 'Press Enter to send (Shift+Enter for new line)'
                        : 'Press Shift+Enter to send (Enter for new line)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSectionPreferences('chat', { enter_to_send: !settings.enter_to_send })}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                  >
                    Toggle Key
                  </button>
                </div>

                {/* 7. Copy timestamps & Export format */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.copy_timestamps', 'Include timestamp in copied responses')}</span>
                    <span className="text-[11px] text-muted-foreground block">{t('chat_pref.copy_timestamps_desc', 'Appends generation time when copying answers.')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.include_timestamps_in_copy)}
                    onChange={(e) => handleSaveSectionPreferences('chat', { include_timestamps_in_copy: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">{t('chat_pref.export_format_title', 'Default Chat Export Format')}</span>
                    <span className="text-[11px] text-muted-foreground block">Format used when downloading conversation logs.</span>
                  </div>
                  <select
                    value={settings.export_format || 'json'}
                    onChange={(e) => handleSaveSectionPreferences('chat', { export_format: e.target.value as any })}
                    className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 self-start sm:self-auto"
                  >
                    <option value="json">Structured JSON</option>
                    <option value="text">Markdown / Plain Text</option>
                  </select>
                </div>
              </div>

              {/* Scholarly Integrity Note */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{t('learning.disclaimer_title', 'Scholarly Integrity & Neutrality Safeguard')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('learning.disclaimer_text', "EMufti AI never presumes, infers, or dictates a user's personal beliefs or religious denomination. All rulings adhere strictly to authentic Islamic sources.")}
                </p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: PRIVACY & SECURITY                                           */}
          {/* =================================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">{t('security.title', '3. Privacy & Security')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('security.subtitle', 'Manage your authentication password, active sessions on all devices, and review security access logs.')}
                </p>
              </div>

              {/* Password Change Form */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    {t('security.change_password_title', 'Change Password')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose a strong password containing at least 6 characters.
                  </p>
                </div>

                {passwordChangeSuccess && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                {passwordChangeError && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('security.new_password', 'New Password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t('security.confirm_password', 'Confirm New Password')}
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground transition-all"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full sm:w-auto px-5 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{t('security.update_password_btn', 'Update Password')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                      {t('security.sessions_title', 'Devices & Active Sessions')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your current browser and device session.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{clientDevice.browser}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:text-blue-600 font-semibold">
                          Current Device
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {clientDevice.os} · {clientDevice.deviceType}
                      </span>
                    </div>
                  </div>
                </div>

                {signOutOthersNotice && (
                  <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground">
                    {signOutOthersNotice}
                  </div>
                )}

                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                    {t('security.status_protected', 'Protected with Row Level Security (RLS)')}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOutOthers}
                    disabled={isSigningOutOthers}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSigningOutOthers ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>{t('security.sign_out_others', 'Sign Out of Other Devices')}</span>
                  </button>
                </div>
              </div>

              {/* Permanent Account Deletion Card */}
              <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-destructive uppercase tracking-wider">
                      {t('security.delete_account_title', 'Permanently Delete Account')}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('security.delete_account_desc', 'Irreversibly removes your profile, conversation history, saved verses, and active entitlements.')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmationText('');
                      setDeleteAccountError(null);
                      setConfirmDeleteModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('security.delete_account_btn', 'Delete My Account')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* =================================================================== */}
          {/* TAB 6: ACCOUNT MANAGEMENT & DATA                                    */}
          {/* =================================================================== */}
          {(activeTab === 'account' || activeTab === 'storage') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">{t('storage.title', '6. Account Management & Data')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('storage.subtitle', 'Export full inquiry history in JSON or Markdown, manage local storage footprint, sign out, or delete your account.')}
                </p>
              </div>

              {clearHistorySuccess && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{t('storage.clear_success', 'All chat history has been permanently cleared.')}</span>
                </div>
              )}

              {exportSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 dark:text-blue-600 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              {exportErrorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{exportErrorMsg}</span>
                </div>
              )}

              {/* 1. Authentic Data Activity Counters (Never Fabricated) */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider text-muted-foreground">
                  {t('storage.metrics_title', 'Data & Activity Counters')}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">
                      {t('storage.conversations_count', 'Active Conversations')}
                    </span>
                    <span className="text-xl font-extrabold text-foreground mt-1 block">
                      {totalConversationsCount}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">
                      {t('storage.messages_count', 'Total Inquiries & Responses')}
                    </span>
                    <span className="text-xl font-extrabold text-foreground mt-1 block">
                      {totalMessagesCount}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">
                      {t('storage.saved_items_count', 'Saved Islamic References')}
                    </span>
                    <span className="text-xl font-extrabold text-foreground mt-1 block">
                      {savedItemsCount}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">
                      {t('storage.local_footprint', 'Estimated Local Storage')}
                    </span>
                    <span className="text-xl font-extrabold text-foreground mt-1 block">
                      {localFootprintStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Takeout & Export Controls */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    {t('storage.export_title', 'Data Export (Takeout)')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('storage.export_desc', 'Download a portable, structured archive of your account profile, settings, and research conversations.')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleExportData('json')}
                    disabled={isExporting}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('storage.export_json_btn', 'Download JSON Archive')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportData('text')}
                    disabled={isExporting}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{t('storage.export_text_btn', 'Download Markdown / Text')}</span>
                  </button>
                </div>
              </div>

              {/* 3. History Management Card */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    {t('storage.clear_history_title', 'Clear Chat History')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('storage.clear_history_desc', 'Permanently removes all saved conversations and messages from this account.')}
                  </p>
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistoryModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('storage.clear_history_btn', 'Clear All History')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 5: SUBSCRIPTION & USAGE                                         */}
          {/* =================================================================== */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">{t('plans.title', '5. Seeker Subscription Plans & Usage')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your authentic Islamic inquiry quota, plan upgrades, and billing status.
                </p>
              </div>

              {/* Active Plan Card */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {t('plans.current_plan', 'Active Plan')}
                    </span>
                    <h3 className="text-base font-extrabold text-foreground capitalize flex flex-wrap items-center gap-2">
                      <span>{planLabel}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-600 dark:text-blue-600 border border-blue-200">
                        {(activePlan || 'free').toUpperCase()} ACTIVE
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">Billing Cycle: </span>
                        <span>{isAnnualBillingInterval(profile?.billing_interval) ? 'Annual (1 Year – 365 Days)' : (activePlan && activePlan !== 'free' ? 'Monthly (1 Month – 30 Days)' : 'Lifetime Free')}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Started On: </span>
                        <span>{profile?.plan_activated_at || profile?.started_at ? new Date(profile.plan_activated_at || profile.started_at || '').toLocaleDateString() : 'Active'}</span>
                      </div>
                      {planExpiresText && (
                        <div>
                          <span className="font-semibold text-foreground">{t('plans.renews', 'Renews on')}: </span>
                          <span>{planExpiresText}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-foreground">Status: </span>
                        <span className="text-blue-600 dark:text-blue-600 font-medium">{activePlan && activePlan !== 'free' ? 'Verified Active Subscription' : 'Free Tier'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('plans.upgrade_btn', 'Upgrade Plan')}</span>
                  </button>
                </div>

                {/* 24-Hour Question Allowance */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-1">
                    <div>
                      <span className="font-semibold text-foreground block">
                        {activePlan === 'free' ? '24-Hour Question Quota' : 'Daily Question Allowance'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {activePlan === 'free'
                          ? 'Free Seeker: 5 AI inquiries every rolling 24 hours'
                          : `${activePlan.toUpperCase()}: ${currentLimit} scholarly queries per day`}
                      </span>
                    </div>
                    <span className="font-bold text-foreground">
                      {usage.count} of {currentLimit} used
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-muted-foreground pt-0.5 gap-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>Allowance refreshes continuously</span>
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-600">
                      {Math.max(0, currentLimit - usage.count)} queries remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 11: HELP & SUPPORT                                              */}
          {/* =================================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {t('settings.tab_support', 'Help & Support')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Access our comprehensive Help Center, connect with verified scholars, and track your submitted support inquiries.
                </p>
              </div>

              {/* 1. Quick Help Center & Knowledge Base Card */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        EMufti AI Help Center & Knowledge Base
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Browse authentic scholarly guidance, FAQs, and subscription instructions.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/help"
                    className="w-full sm:w-auto px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                  >
                    <span>Open Help Center</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 2. Official WhatsApp Scholar Desk */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border border-blue-200 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Direct Scholar WhatsApp Desk
                        </h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:text-blue-600">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Rapid assistance for complex Islamic inquiries, billing questions, and technical support.
                      </p>
                    </div>
                  </div>
                  <a
                    href={OFFICIAL_WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3 sm:py-2.5 min-h-[44px] rounded-xl bg-card border border-blue-300 hover:bg-blue-50 text-blue-700 dark:text-blue-600 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp ({OFFICIAL_WHATSAPP_NUMBER})</span>
                  </a>
                </div>
              </div>

              {/* 3. My Submitted Support Inquiries */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                      My Submitted Support Inquiries
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Review status updates and official administrative replies for your requests.
                    </p>
                  </div>
                  <Link
                    to="/help"
                    className="text-xs text-blue-600 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer min-h-[36px]"
                  >
                    <span>Submit New Inquiry</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>

                {isLoadingTickets ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-xs">Loading your support inquiries...</span>
                  </div>
                ) : supportTickets.length === 0 ? (
                  <div className="p-6 rounded-xl bg-muted/20 border border-border text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">No Support Inquiries Found</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      You currently have no open or past support tickets. If you need help with your account or subscriptions, please submit an inquiry or visit our Help Center.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/help"
                        className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => {
                      const isExpanded = expandedTicketId === ticket.id;
                      const statusConfig = {
                        submitted: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Submitted' },
                        in_review: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'In Review' },
                        replied: { bg: 'bg-blue-50', text: 'text-blue-600 dark:text-blue-600', label: 'Replied' },
                        closed: { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', label: 'Closed' },
                      }[ticket.status] || { bg: 'bg-muted', text: 'text-muted-foreground', label: ticket.status };

                      return (
                        <div
                          key={ticket.id}
                          className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-foreground">
                                #{ticket.reference_id || ticket.id.slice(0, 8)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.label}
                              </span>
                              {ticket.category && (
                                <span className="text-[10px] text-muted-foreground capitalize">
                                  • {ticket.category.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>

                          {ticket.subject && (
                            <h4 className="text-xs font-bold text-foreground">{ticket.subject}</h4>
                          )}

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {ticket.description}
                          </p>

                          {ticket.admin_reply && (
                            <div className="pt-2 border-t border-border/50">
                              <button
                                type="button"
                                onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                                className="text-xs font-bold text-blue-600 dark:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer min-h-[44px] py-1"
                              >
                                <span>{isExpanded ? 'Hide Official Response' : 'View Official Scholar Response'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 animate-in fade-in">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                      Official Admin Response
                                    </span>
                                    {ticket.replied_at && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {new Date(ticket.replied_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                                    {ticket.admin_reply}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* ===================================================================== */}
      {/* MODAL: CLEAR CHAT HISTORY CONFIRMATION                                */}
      {/* ===================================================================== */}
      {confirmClearHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-[calc(100vw-1.5rem)] sm:max-w-md w-full p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t('storage.clear_modal_title', 'Are you sure you want to clear chat history?')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t('storage.clear_modal_desc', 'All stored conversations and assistant responses will be deleted immediately. This action cannot be undone.')}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearHistoryModalOpen(false)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground transition-all cursor-pointer flex items-center justify-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={isClearingHistory}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isClearingHistory ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{t('storage.clear_modal_confirm', 'Yes, Clear All History')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PERMANENT ACCOUNT DELETION CONFIRMATION                         */}
      {/* ===================================================================== */}
      {confirmDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border-2 border-destructive/40 rounded-2xl max-w-[calc(100vw-1.5rem)] sm:max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-destructive">
                  {t('security.delete_confirm_modal_title', 'Confirm Permanent Account Deletion')}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('security.delete_confirm_modal_desc', 'This action is immediate and cannot be undone. All your saved bookmarks, inquiry history, and personal preferences will be permanently wiped from the database.')}
                </p>
              </div>
            </div>

            {deleteAccountError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {deleteAccountError}
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-foreground">
                {t('security.delete_confirm_type_word', 'Type DELETE to proceed:')}
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 min-h-[44px] text-xs font-mono font-bold rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-destructive text-foreground"
              />
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteModalOpen(false)}
                disabled={isDeletingAccount}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground transition-all cursor-pointer flex items-center justify-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {isDeletingAccount ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{t('security.delete_account_btn', 'Delete My Account')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {isUpgradeModalOpen && (
        <PlanRequestModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          defaultPlan={activePlan === 'free' ? 'pro' : activePlan}
          defaultInterval={isAnnualBillingInterval(profile?.billing_interval) ? 'yearly' : 'monthly'}
          userEmail={user?.email || profile?.email || ''}
          userName={displayName || profile?.display_name || ''}
          userPhone={phoneNumber || profile?.phone_number || ''}
        />
      )}
    </div>
  );
};
