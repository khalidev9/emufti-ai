import {
  type Conversation,
  type Message,
  type SavedItem,
  type Report,
  type UserSettings,
  type PlanRequest,
  type PlanSlug,
  type SupportRequest,
  type SupportRequestStatus,
  type UserSecurityEvent,
  type PaymentTransaction,
  normalizePlanSlug,
} from '../types/database.ts';

const CONVERSATIONS_KEY = 'emufti_conversations';
const MESSAGES_KEY = 'emufti_messages';
const SETTINGS_KEY = 'emufti_settings';
const SAVED_ITEMS_KEY = 'emufti_saved_items';
const REPORTS_KEY = 'emufti_reports';
const USAGE_KEY = 'emufti_usage_today';
const PLAN_REQUESTS_KEY = 'emufti_plan_requests';
const USER_PLAN_KEY = 'emufti_user_plan';
const SUPPORT_REQUESTS_KEY = 'emufti_support_requests';
const GUEST_SUPPORT_TOKENS_KEY = 'emufti_guest_support_requests';
const PAYMENT_TRANSACTIONS_KEY = 'emufti_payment_transactions';
const SAVED_FOLDERS_KEY = 'emufti_saved_folders';
const FAVORITE_RECITERS_KEY = 'emufti_favorite_reciters';
const READING_STREAK_KEY = 'emufti_reading_streak';

const SEED_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'sr-seed-1',
    reference_id: 'SR-EMUFTI-7B29A1',
    full_name: 'Zahra Mohamed',
    email: 'zahra.m@example.com',
    phone: '+252 61 7891234',
    subject: 'Question on Tafsir Audio Playback',
    description: 'Assalamu alaykum. While listening to Surah Maryam tafsir by Sheikh Umal on my mobile browser, the playback pauses when screen locks. Is background audio supported or coming soon?',
    status: 'replied',
    admin_reply: 'Wa alaykumu salam Zahra. Background audio for mobile browsers is fully supported in our latest update. Please ensure your browser permissions allow background media playback, or use the audio player controls.',
    admin_id: 'admin_seed_1',
    replied_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sr-seed-2',
    reference_id: 'SR-EMUFTI-4E81C9',
    full_name: 'Omar Farooq',
    email: 'omar.farooq@example.com',
    phone: '+44 7911 123456',
    subject: 'Account Plan Upgrade Clarification',
    description: 'I recently submitted a request for the Talib al-Ilm (Pro) plan. I want to confirm if I will receive access to all 50 Quran reciters immediately once approved.',
    status: 'in_review',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const SEED_PLAN_REQUESTS: PlanRequest[] = [
  {
    id: 'req-seed-1',
    reference_id: 'REQ-EMUFTI-94B2F1',
    full_name: 'Ahmed Nur',
    email: 'ahmed.nur@example.com',
    whatsapp: '+252 61 5123456',
    plan_slug: 'pro',
    message: 'Seeking deeper comparative fiqh for madrasah studies in Mogadishu.',
    status: 'pending',
    payment_verified: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'req-seed-2',
    reference_id: 'REQ-EMUFTI-71A8E4',
    full_name: 'Fatima Zahra',
    email: 'fatima.z@example.com',
    telegram: '@fatima_ilm',
    plan_slug: 'premium',
    message: 'Preparing research on hadith grading in Shafi fiqh.',
    status: 'under_review',
    payment_verified: false,
    admin_notes: 'Contacted on Telegram to verify identity.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'req-seed-3',
    reference_id: 'REQ-EMUFTI-33D9C2',
    full_name: 'Khalid Mansoor',
    email: 'khalid.m@example.com',
    whatsapp: '+44 7700 900123',
    telegram: '@khalid_m',
    plan_slug: 'pro',
    message: 'Monthly subscription for family Islamic homeschooling.',
    status: 'approved',
    payment_verified: true,
    admin_notes: 'Manual transfer confirmed via WhatsApp.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];


export const DEFAULT_SETTINGS: UserSettings = {
  preferred_language: 'en',
  default_response_language: 'auto',
  theme: 'system',
  accent_color: 'blue',
  interface_density: 'comfortable',
  font_size: 'medium',
  enter_to_send: true,
  answer_length: 'balanced',
  explanation_depth: 'simple',
  explanation_style: 'simple',
  preferred_school: 'all',
  learning_level: 'intermediate',
  learning_style: 'explanation',
  save_history: true,
  export_format: 'json',
  include_timestamps_in_copy: false,
  account_security_notifications: true,
  learning_reminders: true,
  reminder_schedule: 'morning',
  reminder_timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
  email_notifications: true,
  product_updates: false,
  chat_density: 'comfortable',
  reduced_motion: false,
  high_contrast: false,
  show_references: true,
  audio_playback_speed: 1,
  autoplay_recitation: true,
  continuous_recitation: true,
  notification_sound: true,
  tts_language: 'auto',
  ai_persona: 'mufti',
  tajweed_rules_enabled: true,
  quran_font_size: 26,
};

// Browser-safe storage helper with in-memory fallback
const inMemoryStore = new Map<string, string>();

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Restricted environment, private browsing, or quota error
  }
  return inMemoryStore.get(key) ?? null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Restricted environment, private browsing, or quota error
  }
  inMemoryStore.set(key, value);
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Restricted environment, private browsing, or quota error
  }
  inMemoryStore.delete(key);
}

// -----------------------------------------------------------------------------
// Safe City & Prayer Times Location Storage
// -----------------------------------------------------------------------------
export const CITY_STORAGE_KEY = 'emufti_user_city';
export const DEFAULT_CITY_ID = 'mogadishu';
const MAX_CITY_ID_LENGTH = 64;

/**
 * Validates whether a value is a safe, compact city identifier.
 * Rejects JSON objects/arrays, HTML/SVG markup, base64 data, or oversized strings.
 */
export function isValidCityId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_CITY_ID_LENGTH) return false;
  if (
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('<') ||
    trimmed.startsWith('data:') ||
    trimmed.includes('base64') ||
    trimmed.includes('http://') ||
    trimmed.includes('https://')
  ) {
    return false;
  }
  return /^[a-z0-9_-]+$/i.test(trimmed);
}

/**
 * Safely retrieves the user's selected city ID with validation and cleanup of corrupted/oversized values.
 * Returns a compact city identifier (e.g. 'mogadishu').
 */
export function getUserCity(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CITY_STORAGE_KEY);
      if (raw !== null) {
        if (!isValidCityId(raw)) {
          // Purge ONLY the invalid/oversized city key, preserving all other user data intact
          try {
            window.localStorage.removeItem(CITY_STORAGE_KEY);
          } catch {}
          return DEFAULT_CITY_ID;
        }
        return raw.trim().toLowerCase();
      }
    }
  } catch {
    // Private mode, restricted sandbox, or quota error
  }

  const inMem = inMemoryStore.get(CITY_STORAGE_KEY);
  if (inMem && isValidCityId(inMem)) {
    return inMem.trim().toLowerCase();
  }
  return DEFAULT_CITY_ID;
}

/**
 * Safely persists the user's selected city ID.
 * - Stores ONLY the minimal compact identifier string (max 64 chars).
 * - Avoids repeated writes if the value is already identical.
 * - Gracefully handles QuotaExceededError and storage exceptions without crashing the Dashboard.
 * - Falls back to in-memory store so UI remains fully interactive when storage is full.
 */
export function setUserCity(cityId: string): void {
  const normalized = typeof cityId === 'string' ? cityId.trim().toLowerCase() : '';
  const validId = isValidCityId(normalized) ? normalized : DEFAULT_CITY_ID;

  // Always keep in-memory store synchronized as resilient fallback
  inMemoryStore.set(CITY_STORAGE_KEY, validId);

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Prevent redundant writes if value is already identical
      const current = window.localStorage.getItem(CITY_STORAGE_KEY);
      if (current === validId) {
        return;
      }

      // If existing key has oversized/invalid payload, purge it first to free space
      if (current && !isValidCityId(current)) {
        try {
          window.localStorage.removeItem(CITY_STORAGE_KEY);
        } catch {}
      }

      window.localStorage.setItem(CITY_STORAGE_KEY, validId);
    }
  } catch (err: any) {
    // QuotaExceededError handling: attempt recovery of ONLY this key if oversized
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existing = window.localStorage.getItem(CITY_STORAGE_KEY);
        if (existing && existing.length > MAX_CITY_ID_LENGTH) {
          window.localStorage.removeItem(CITY_STORAGE_KEY);
          window.localStorage.setItem(CITY_STORAGE_KEY, validId);
        }
      }
    } catch {
      // In-memory fallback is active; continue seamlessly without throwing
    }
  }
}

export interface ReadingProgressData {
  currentSurah: number;
  currentVerse: number;
  last_surah?: number;
  last_verse?: number;
  lastReadTime: string | null;
  [key: string]: any;
}

export const getReadingProgress = (userId?: string): ReadingProgressData => {
  try {
    let data: string | null = null;
    if (typeof localStorage !== 'undefined') {
      data = localStorage.getItem('quran_reading_progress');
      if (!data && userId) {
        data =
          localStorage.getItem(`emufti_quran_reading_progress_${userId}`) ||
          localStorage.getItem('emufti_quran_reading_progress_guest');
      }
    }
    if (data) {
      const parsed = JSON.parse(data);
      return {
        currentSurah: parsed.currentSurah || parsed.last_surah || 1,
        currentVerse: parsed.currentVerse || parsed.last_verse || 1,
        last_surah: parsed.last_surah || parsed.currentSurah || 1,
        last_verse: parsed.last_verse || parsed.currentVerse || 1,
        lastReadTime: parsed.lastReadTime || parsed.last_read_at || parsed.updated_at || null,
        ...parsed,
      };
    }
    return {
      currentSurah: 1,
      currentVerse: 1,
      last_surah: 1,
      last_verse: 1,
      lastReadTime: null,
    };
  } catch (e) {
    console.error("Error reading progress:", e);
    return {
      currentSurah: 1,
      currentVerse: 1,
      last_surah: 1,
      last_verse: 1,
      lastReadTime: null,
    };
  }
};

export const saveReadingProgress = (
  progressOrSurah: number | Record<string, any>,
  verse?: number,
  userId?: string
): void => {
  try {
    let progressObj: Record<string, any>;
    if (typeof progressOrSurah === 'object' && progressOrSurah !== null) {
      progressObj = progressOrSurah;
    } else if (typeof progressOrSurah === 'number') {
      progressObj = {
        currentSurah: progressOrSurah,
        currentVerse: verse || 1,
        last_surah: progressOrSurah,
        last_verse: verse || 1,
        lastReadTime: new Date().toISOString(),
      };
    } else {
      progressObj = {
        currentSurah: 1,
        currentVerse: 1,
        last_surah: 1,
        last_verse: 1,
        lastReadTime: new Date().toISOString(),
      };
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('quran_reading_progress', JSON.stringify(progressObj));
      if (userId) {
        localStorage.setItem(`emufti_quran_reading_progress_${userId}`, JSON.stringify(progressObj));
      }
    }
  } catch (e) {
    console.error("Error saving reading progress:", e);
  }
};

export const storage = {
  // User City & Prayer Times Location
  getUserCity(): string {
    return getUserCity();
  },
  setUserCity(cityId: string): void {
    setUserCity(cityId);
  },
  // Quran Reading Progress
  getReadingProgress(userId?: string): ReadingProgressData {
    return getReadingProgress(userId);
  },

  saveReadingProgress(
    progressOrSurah: number | Record<string, any>,
    verse?: number,
    userId?: string
  ): void {
    saveReadingProgress(progressOrSurah, verse, userId);
  },
  // Conversations
  getConversations(userId: string): Conversation[] {
    try {
      const data = safeGet(`${CONVERSATIONS_KEY}_${userId}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveConversations(userId: string, conversations: Conversation[]): void {
    try {
      safeSet(`${CONVERSATIONS_KEY}_${userId}`, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to local storage', e);
    }
  },

  clearAllConversations(userId: string): void {
    try {
      const convs = this.getConversations(userId);
      convs.forEach((c) => this.deleteMessages(c.id));
      this.saveConversations(userId, []);
    } catch (e) {
      console.error('Failed to clear conversations', e);
    }
  },

  // Messages
  getMessages(conversationId: string): Message[] {
    try {
      const data = safeGet(`${MESSAGES_KEY}_${conversationId}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMessages(conversationId: string, messages: Message[]): void {
    try {
      safeSet(`${MESSAGES_KEY}_${conversationId}`, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to local storage', e);
    }
  },

  deleteMessages(conversationId: string): void {
    try {
      safeRemove(`${MESSAGES_KEY}_${conversationId}`);
    } catch (e) {
      console.error('Failed to delete messages', e);
    }
  },

  // Settings
  getSettings(userId: string): UserSettings {
    try {
      const data = safeGet(`${SETTINGS_KEY}_${userId}`);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(userId: string, settings: UserSettings): void {
    try {
      safeSet(`${SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
      if (typeof window !== 'undefined') {
        if (settings.theme) {
          window.localStorage.setItem('emufti_theme', settings.theme);
        }
        if (settings.audio_playback_speed) {
          window.localStorage.setItem('emufti_playback_speed', String(settings.audio_playback_speed));
        }
        if (settings.autoplay_recitation !== undefined) {
          window.localStorage.setItem('emufti_autoplay_audio', String(settings.autoplay_recitation));
        }
        if (settings.tts_language) {
          window.localStorage.setItem('emufti_tts_language', settings.tts_language);
        }
        if (settings.ai_persona) {
          window.localStorage.setItem('emufti_ai_persona', settings.ai_persona);
        }
        if (settings.quran_font_size) {
          window.localStorage.setItem('emufti_quran_font_size', String(settings.quran_font_size));
        }
        window.dispatchEvent(new CustomEvent('emufti_settings_updated', { detail: settings }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // Custom Saved Folders (Feature 1)
  getSavedFolders(userId: string): { id: string; name: string; color?: string; icon?: string }[] {
    try {
      const data = safeGet(`${SAVED_FOLDERS_KEY}_${userId}`);
      if (!data) {
        return [
          { id: 'f-duas', name: 'Duas & Adhkar', color: 'emerald', icon: 'heart' },
          { id: 'f-tafsir', name: 'Tafsir Reflections', color: 'blue', icon: 'book' },
          { id: 'f-fiqh', name: 'Fiqh Rulings', color: 'amber', icon: 'shield' },
          { id: 'f-tajweed', name: 'Tajweed Rules', color: 'purple', icon: 'mic' },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSavedFolders(userId: string, folders: { id: string; name: string; color?: string; icon?: string }[]): void {
    try {
      safeSet(`${SAVED_FOLDERS_KEY}_${userId}`, JSON.stringify(folders));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('emufti_folders_updated'));
      }
    } catch (e) {
      console.error('Failed to save saved folders', e);
    }
  },

  // Pinned Favorite Reciters (Feature 13)
  getFavoriteReciters(userId: string): number[] {
    try {
      const data = safeGet(`${FAVORITE_RECITERS_KEY}_${userId}`);
      if (!data) return [7, 1, 2]; // Default: Mishary, AbdulBaset, Sudais
      return JSON.parse(data);
    } catch {
      return [7, 1, 2];
    }
  },

  saveFavoriteReciters(userId: string, reciters: number[]): void {
    try {
      safeSet(`${FAVORITE_RECITERS_KEY}_${userId}`, JSON.stringify(reciters));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('emufti_favorites_updated'));
      }
    } catch (e) {
      console.error('Failed to save favorite reciters', e);
    }
  },

  // Reading Streak & Habit Tracker (Feature 6)
  getReadingStreak(userId: string): { currentStreak: number; bestStreak: number; lastReadDate: string; activeDaysThisWeek: string[] } {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = safeGet(`${READING_STREAK_KEY}_${userId}`);
      if (!data) {
        return { currentStreak: 3, bestStreak: 7, lastReadDate: today, activeDaysThisWeek: [today] };
      }
      const parsed = JSON.parse(data);
      return {
        currentStreak: parsed.currentStreak || 1,
        bestStreak: parsed.bestStreak || 5,
        lastReadDate: parsed.lastReadDate || today,
        activeDaysThisWeek: Array.isArray(parsed.activeDaysThisWeek) ? parsed.activeDaysThisWeek : [today],
      };
    } catch {
      const today = new Date().toISOString().split('T')[0];
      return { currentStreak: 1, bestStreak: 3, lastReadDate: today, activeDaysThisWeek: [today] };
    }
  },

  recordReadingSession(userId: string): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const current = this.getReadingStreak(userId);
      if (current.lastReadDate === today) return; // already counted today

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = current.currentStreak;
      if (current.lastReadDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      const newBest = Math.max(newStreak, current.bestStreak);
      const activeDays = Array.from(new Set([...current.activeDaysThisWeek, today])).slice(-7);

      safeSet(
        `${READING_STREAK_KEY}_${userId}`,
        JSON.stringify({
          currentStreak: newStreak,
          bestStreak: newBest,
          lastReadDate: today,
          activeDaysThisWeek: activeDays,
        })
      );
    } catch (e) {
      console.error('Failed to record reading streak', e);
    }
  },

  // Saved Items (Knowledge base)
  getSavedItems(userId: string): SavedItem[] {
    try {
      const data = safeGet(`${SAVED_ITEMS_KEY}_${userId}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSavedItems(userId: string, items: SavedItem[]): void {
    try {
      safeSet(`${SAVED_ITEMS_KEY}_${userId}`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save saved items', e);
    }
  },

  // Reports
  getReports(): Report[] {
    try {
      const data = safeGet(REPORTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveReport(report: Report): void {
    try {
      const current = this.getReports();
      safeSet(REPORTS_KEY, JSON.stringify([report, ...current]));
    } catch (e) {
      console.error('Failed to save report', e);
    }
  },

  // Daily Usage Tracking with Rolling 24-Hour Window
  getDailyUsage(userId: string): { count: number; date: string; resetsAt?: string; timestamps: number[] } {
    try {
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;
      const today = new Date().toISOString().split('T')[0];
      const raw = safeGet(`${USAGE_KEY}_${userId}`);
      if (!raw) return { count: 0, date: today, timestamps: [] };
      const parsed = JSON.parse(raw);
      
      let timestamps: number[] = Array.isArray(parsed.timestamps) ? parsed.timestamps : [];
      if (timestamps.length === 0 && parsed.count && parsed.date === today) {
        timestamps = Array(parsed.count).fill(now);
      }
      
      const activeTimestamps = timestamps.filter((t) => typeof t === 'number' && t >= cutoff);
      const count = activeTimestamps.length;
      const oldest = activeTimestamps[0];
      const resetsAt = oldest ? new Date(oldest + 24 * 60 * 60 * 1000).toISOString() : undefined;
      
      return {
        count,
        date: today,
        resetsAt,
        timestamps: activeTimestamps,
      };
    } catch {
      return { count: 0, date: new Date().toISOString().split('T')[0], timestamps: [] };
    }
  },

  incrementDailyUsage(userId: string): number {
    try {
      const usage = this.getDailyUsage(userId);
      const now = Date.now();
      const updatedTimestamps = [...usage.timestamps, now];
      const nextCount = updatedTimestamps.length;
      safeSet(
        `${USAGE_KEY}_${userId}`,
        JSON.stringify({
          count: nextCount,
          date: usage.date,
          timestamps: updatedTimestamps,
        })
      );
      return nextCount;
    } catch {
      return 1;
    }
  },

  // Plan Requests
  generateReferenceId(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `REQ-EMUFTI-${code}`;
  },

  getAllPlanRequests(): PlanRequest[] {
    try {
      const data = safeGet(PLAN_REQUESTS_KEY);
      if (!data) {
        safeSet(PLAN_REQUESTS_KEY, JSON.stringify(SEED_PLAN_REQUESTS));
        return SEED_PLAN_REQUESTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PLAN_REQUESTS;
    }
  },

  getPlanRequests(userId?: string, email?: string): PlanRequest[] {
    const all = this.getAllPlanRequests();
    if (!userId && !email) return all;
    const lowerEmail = email ? email.toLowerCase() : null;
    return all.filter((r) => {
      if (userId && r.user_id === userId) return true;
      if (lowerEmail && r.email && typeof r.email === 'string' && r.email.toLowerCase() === lowerEmail) return true;
      return false;
    });
  },

  getPlanRequestByReference(referenceId: string): PlanRequest | undefined {
    const all = this.getAllPlanRequests();
    const cleanRef = referenceId.trim().toUpperCase();
    return all.find((r) => r.reference_id.toUpperCase() === cleanRef);
  },

  savePlanRequest(request: PlanRequest): void {
    try {
      const all = this.getAllPlanRequests();
      const existingIdx = all.findIndex((r) => r.id === request.id || r.reference_id === request.reference_id);
      let updated: PlanRequest[];
      if (existingIdx >= 0) {
        updated = [...all];
        updated[existingIdx] = request;
      } else {
        updated = [request, ...all];
      }
      safeSet(PLAN_REQUESTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save plan request', e);
    }
  },

  updatePlanRequest(idOrRef: string, updates: Partial<PlanRequest>): PlanRequest | null {
    try {
      const all = this.getAllPlanRequests();
      const idx = all.findIndex((r) => r.id === idOrRef || r.reference_id.toUpperCase() === idOrRef.toUpperCase());
      if (idx === -1) return null;
      const updatedItem: PlanRequest = {
        ...all[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      all[idx] = updatedItem;
      safeSet(PLAN_REQUESTS_KEY, JSON.stringify(all));

      // If claimed or completed, update user's active plan
      if ((updates.status === 'claimed' || updates.status === 'completed' || updates.status === 'approved') && updatedItem.user_id) {
        this.setUserActivePlan(updatedItem.user_id, updatedItem.plan_slug);
      }
      return updatedItem;
    } catch (e) {
      console.error('Failed to update plan request', e);
      return null;
    }
  },

  claimPlanOffer(referenceId: string, userId: string, userEmail?: string): {
    success: boolean;
    plan?: PlanSlug;
    duration?: string;
    duration_somali?: string;
    billing_interval?: string;
    activated_at?: string;
    expires_at?: string;
    message?: string;
    error?: string;
  } {
    try {
      const all = this.getAllPlanRequests();
      const cleanRef = referenceId.trim().toUpperCase();
      const idx = all.findIndex((r) => r.reference_id.toUpperCase() === cleanRef);
      if (idx === -1) {
        return { success: false, error: 'Request not found.' };
      }
      const req = all[idx];

      // Ownership check
      if (req.user_id && req.user_id !== userId) {
        return { success: false, error: 'Access denied: You do not own this offer.' };
      }
      if (!req.user_id && userEmail && req.email && req.email.toLowerCase() !== userEmail.toLowerCase()) {
        return { success: false, error: 'Access denied: Email does not match this offer.' };
      }

      if (req.status === 'claimed') {
        return { success: false, error: 'This offer has already been claimed.' };
      }
      if (req.status === 'rejected') {
        return { success: false, error: 'This request was rejected.' };
      }
      if (req.status !== 'approved') {
        return { success: false, error: `This request is not eligible to be claimed (status: ${req.status}).` };
      }

      // Check expiry
      if (req.offer_expires_at && new Date(req.offer_expires_at) < new Date()) {
        return { success: false, error: 'This offer has expired.' };
      }

      const normPlan = normalizePlanSlug(req.plan_slug || req.plan);
      const plan: PlanSlug = normPlan === 'premium' ? 'premium' : 'pro';
      const isAnnual = req.billing_interval === 'yearly' || req.billing_interval === 'annual' || req.duration === '1 year';
      const duration = req.duration || (isAnnual ? '1 year' : '1 month');
      const durationSomali = isAnnual ? '1 Sano' : '1 Bil';

      const now = new Date();
      const activatedAt = now.toISOString();
      const expiresDate = new Date(now);
      if (isAnnual) {
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
      } else {
        expiresDate.setMonth(expiresDate.getMonth() + 1);
      }
      const expiresAt = expiresDate.toISOString();

      const updatedReq: PlanRequest = {
        ...req,
        status: 'claimed',
        claimed_at: activatedAt,
        user_id: userId,
        updated_at: activatedAt,
      };
      all[idx] = updatedReq;
      safeSet(PLAN_REQUESTS_KEY, JSON.stringify(all));

      // Activate user plan
      this.setUserActivePlan(userId, plan);

      return {
        success: true,
        plan,
        duration,
        duration_somali: durationSomali,
        billing_interval: isAnnual ? 'annual' : 'monthly',
        activated_at: activatedAt,
        expires_at: expiresAt,
        message: `Hambalyo! Waxaad heshay qorshaha ${plan === 'premium' ? 'Premium' : 'Pro'}.`,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to claim offer.' };
    }
  },

  // User Active Plan
  getUserActivePlan(userId: string): PlanSlug {
    try {
      const p = safeGet(`${USER_PLAN_KEY}_${userId}`);
      if (!p) return 'free';
      const clean = p.trim().toLowerCase();
      if (clean === 'pro' || clean === 'premium' || clean === 'free') {
        return clean as PlanSlug;
      }
      return 'free';
    } catch {
      return 'free';
    }
  },

  setUserActivePlan(userId: string, plan: PlanSlug | string): void {
    try {
      const clean = String(plan || 'free').trim().toLowerCase();
      const normPlan: PlanSlug = clean === 'pro' || clean === 'premium' ? clean : 'free';
      safeSet(`${USER_PLAN_KEY}_${userId}`, normPlan);
    } catch (e) {
      console.error('Failed to set user active plan', e);
    }
  },

  isPlanCongratsSeen(userId: string, plan: PlanSlug): boolean {
    try {
      return safeGet(`emufti_congrats_seen_${userId}_${plan}`) === 'true';
    } catch {
      return false;
    }
  },

  markPlanCongratsSeen(userId: string, plan: PlanSlug): void {
    try {
      safeSet(`emufti_congrats_seen_${userId}_${plan}`, 'true');
    } catch (e) {
      console.error('Failed to mark plan congrats seen', e);
    }
  },

  // Custom Gemini API Key Management (for direct client execution or dev keys)
  getCustomApiKey(): string {
    return safeGet('emufti_custom_gemini_api_key') || '';
  },

  setCustomApiKey(key: string): void {
    try {
      safeSet('emufti_custom_gemini_api_key', key.trim());
    } catch (e) {
      console.error('Failed to save custom Gemini API key', e);
    }
  },

  // Support Requests System
  generateSupportReferenceId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SR-EMUFTI-${code}`;
  },

  generateGuestAccessToken(): string {
    const randPart = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    return `gst_${Date.now()}_${randPart}`;
  },

  getGuestSupportTokens(): Record<string, string> {
    try {
      const raw = safeGet(GUEST_SUPPORT_TOKENS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveGuestSupportToken(referenceId: string, token: string): void {
    try {
      const current = this.getGuestSupportTokens();
      current[referenceId.toUpperCase().trim()] = token.trim();
      safeSet(GUEST_SUPPORT_TOKENS_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save guest support token', e);
    }
  },

  getAllSupportRequests(): SupportRequest[] {
    try {
      const raw = safeGet(SUPPORT_REQUESTS_KEY);
      if (!raw) {
        safeSet(SUPPORT_REQUESTS_KEY, JSON.stringify(SEED_SUPPORT_REQUESTS));
        return SEED_SUPPORT_REQUESTS;
      }
      const parsed: SupportRequest[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return SEED_SUPPORT_REQUESTS;
    }
  },

  getSupportRequests(userId?: string | null): SupportRequest[] {
    const all = this.getAllSupportRequests();
    if (userId) {
      return all.filter((r) => r.user_id === userId);
    }
    // Guest retrieval: match against saved guest tokens in browser
    const guestTokens = this.getGuestSupportTokens();
    const guestRefs = Object.keys(guestTokens);
    if (guestRefs.length === 0) return [];
    return all.filter((r) => {
      const normRef = (r.reference_id || '').toUpperCase().trim();
      return guestTokens[normRef] && guestTokens[normRef] === r.guest_access_token;
    });
  },

  getSupportRequestByReference(referenceId: string, accessToken?: string | null): SupportRequest | null {
    const all = this.getAllSupportRequests();
    const cleanRef = referenceId.toUpperCase().trim();
    const found = all.find((r) => (r.reference_id || '').toUpperCase().trim() === cleanRef);
    if (!found) return null;

    if (accessToken && found.guest_access_token && found.guest_access_token !== accessToken.trim()) {
      return null;
    }
    return found;
  },

  saveSupportRequest(data: {
    fullName: string;
    email: string;
    phone: string;
    description: string;
    subject?: string;
    category?: string;
    userId?: string | null;
  }): { request: SupportRequest; guestAccessToken?: string } {
    const all = this.getAllSupportRequests();
    const referenceId = this.generateSupportReferenceId();
    const guestAccessToken = !data.userId ? this.generateGuestAccessToken() : null;
    const now = new Date().toISOString();

    const newRequest: SupportRequest = {
      id: `sr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reference_id: referenceId,
      user_id: data.userId || null,
      guest_access_token: guestAccessToken,
      full_name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      subject: data.subject?.trim() || 'General Support',
      category: data.category?.trim() || 'general',
      description: data.description.trim(),
      status: 'submitted',
      admin_reply: null,
      admin_id: null,
      admin_notes: null,
      replied_at: null,
      created_at: now,
      updated_at: now,
    };

    all.unshift(newRequest);
    safeSet(SUPPORT_REQUESTS_KEY, JSON.stringify(all));

    if (guestAccessToken) {
      this.saveGuestSupportToken(referenceId, guestAccessToken);
    }

    return { request: newRequest, guestAccessToken: guestAccessToken || undefined };
  },

  updateSupportRequestStatus(idOrRef: string, status: SupportRequestStatus, adminNotes?: string): SupportRequest | null {
    const all = this.getAllSupportRequests();
    const idx = all.findIndex(
      (r) => r.id === idOrRef || r.reference_id.toUpperCase() === idOrRef.toUpperCase()
    );
    if (idx === -1) return null;

    const updated: SupportRequest = {
      ...all[idx],
      status,
      admin_notes: adminNotes !== undefined ? adminNotes : all[idx].admin_notes,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    safeSet(SUPPORT_REQUESTS_KEY, JSON.stringify(all));
    return updated;
  },

  replyToSupportRequest(
    idOrRef: string,
    reply: string,
    adminId?: string | null,
    status: SupportRequestStatus = 'replied',
    adminNotes?: string | null
  ): SupportRequest | null {
    const all = this.getAllSupportRequests();
    const idx = all.findIndex(
      (r) => r.id === idOrRef || r.reference_id.toUpperCase() === idOrRef.toUpperCase()
    );
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const updated: SupportRequest = {
      ...all[idx],
      admin_reply: reply.trim(),
      admin_id: adminId || all[idx].admin_id || 'admin',
      admin_notes: adminNotes !== undefined ? adminNotes : all[idx].admin_notes,
      status,
      replied_at: now,
      updated_at: now,
    };
    all[idx] = updated;
    safeSet(SUPPORT_REQUESTS_KEY, JSON.stringify(all));
    return updated;
  },

  // Language Preferences Management
  getPreferredLanguage(): 'so' | 'en' | 'ar' {
    const val = safeGet('emufti_preferred_language');
    if (val === 'so' || val === 'ar' || val === 'en') return val;
    return 'en';
  },

  setPreferredLanguage(lang: 'so' | 'en' | 'ar'): void {
    safeSet('emufti_preferred_language', lang);
  },

  // User Security Activity Logging (Local & Offline Fallback)
  getUserSecurityEvents(userId: string): UserSecurityEvent[] {
    try {
      const raw = safeGet(`emufti_security_events_${userId}`);
      return raw ? (JSON.parse(raw) as UserSecurityEvent[]) : [];
    } catch {
      return [];
    }
  },

  recordUserSecurityEvent(
    userIdOrEvent:
      | string
      | {
          user_id: string;
          event_type: string;
          device_info?: string;
          description?: string;
          ip_approx_city?: string;
          metadata?: Record<string, any>;
        },
    event?: {
      event_type: string;
      device_info?: string;
      description?: string;
      ip_approx_city?: string;
    }
  ): void {
    try {
      const userId = typeof userIdOrEvent === 'string' ? userIdOrEvent : userIdOrEvent.user_id;
      const eventData = typeof userIdOrEvent === 'string' ? event! : userIdOrEvent;
      if (!userId || !eventData) return;
      const existing = this.getUserSecurityEvents(userId);
      const newEntry: UserSecurityEvent = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        event_type: eventData.event_type,
        device_info: eventData.device_info || 'Unknown device',
        description: (eventData as any).description || undefined,
        ip_approx_city: eventData.ip_approx_city || undefined,
        created_at: new Date().toISOString(),
      };
      const updated = [newEntry, ...existing].slice(0, 30); // retain latest 30
      safeSet(`emufti_security_events_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to record security event locally', e);
    }
  },

  // Payment Transactions Tracking (Offline & Fallback)
  getPaymentTransactions(userId?: string): PaymentTransaction[] {
    try {
      const raw = safeGet(PAYMENT_TRANSACTIONS_KEY);
      const list: PaymentTransaction[] = raw ? JSON.parse(raw) : [];
      if (!userId) return list;
      return list.filter((tx) => tx.user_id === userId);
    } catch {
      return [];
    }
  },

  savePaymentTransaction(tx: PaymentTransaction): void {
    try {
      const list = this.getPaymentTransactions();
      const existingIdx = list.findIndex(
        (item) => item.id === tx.id || item.reference_id === tx.reference_id || (item as any).transaction_reference === (tx as any).transaction_reference
      );
      let updated: PaymentTransaction[];
      if (existingIdx >= 0) {
        updated = [...list];
        updated[existingIdx] = tx;
      } else {
        updated = [tx, ...list];
      }
      safeSet(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save payment transaction locally', e);
    }
  },
};

export default storage;


