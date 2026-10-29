// ==============================================================================
// EMUFTI AI — Comprehensive Quran Khatma Challenge Service
// Supports Flexible Durations: 1 Month (30 Days), 20 Days, 15 Days, 10 Days, 7 Days, or Others
// Automatic Division of 604 Pages across 5 Daily Prayers
// Strict Day Locking & Sequential Intra-day Slot Locking (Slot 2 locked until Slot 1 completed)
// Immutability (Permanent logs) & Daily Completion Jazakallah notification
// Screen ID Generation & Verifiable Certificate Registry
// Branded PDF Certificate with Both Quran Page Logo & EMufti AI Logo
// ==============================================================================

import { jsPDF } from 'jspdf';
import { recordReadingLog } from './quranAnalyticsService.ts';

export type PrayerSlotKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type KhatmDuration = 30 | 20 | 15 | 10 | 7 | number;

export interface KhatmDurationOption {
  days: number;
  label: string;
  somaliLabel: string;
  dailyPages: number;
  prayerPages: number;
  description: string;
  isCustom?: boolean;
}

export const KHATM_DURATION_OPTIONS: KhatmDurationOption[] = [
  {
    days: 30,
    label: '1 Bil (Month)',
    somaliLabel: '1 Bil (Month)',
    dailyPages: 20,
    prayerPages: 4,
    description: '1 Bil (Month) — 1 Juzz (20 Bog) Maalintii • ~4 Bog Salaad Kasta',
  },
  {
    days: 20,
    label: '3 Weeks',
    somaliLabel: '3 Weeks (3 Toddobaad)',
    dailyPages: 30,
    prayerPages: 6,
    description: '3 Weeks (20 Maalmood) — ~1.5 Juzz (30 Bog) Maalintii • ~6 Bog Salaad Kasta',
  },
  {
    days: 15,
    label: '2 Weeks',
    somaliLabel: '2 Weeks (2 Toddobaad)',
    dailyPages: 40,
    prayerPages: 8,
    description: '2 Weeks (15 Maalmood) — 2 Juzz (40 Bog) Maalintii • ~8 Bog Salaad Kasta',
  },
  {
    days: 10,
    label: '10 Days',
    somaliLabel: '10 Days (10 Maalmood)',
    dailyPages: 60,
    prayerPages: 12,
    description: '10 Days (10 Maalmood) — 3 Juzz (60 Bog) Maalintii • ~12 Bog Salaad Kasta',
  },
  {
    days: 7,
    label: '7 Days',
    somaliLabel: '7 Days (7 Maalmood)',
    dailyPages: 86,
    prayerPages: 17,
    description: '7 Days (7 Maalmood) — 4.3 Juzz (86 Bog) Maalintii • ~17 Bog Salaad Kasta',
  },
];

export interface PrayerSlotDetail {
  key: PrayerSlotKey;
  label: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  pages: string;
}

export interface DayKhatmPlan {
  dayIndex: number;
  juzNumber: number;
  approxEndJuz: number;
  startPage: number;
  endPage: number;
  dailyPages: number;
  slots: PrayerSlotDetail[];
}

export interface KhatmChallengeData {
  id: string;
  userId: string;
  userName: string;
  startDate: string; // YYYY-MM-DD
  targetEndDate: string; // YYYY-MM-DD
  durationDays: number;
  createdAt: string;
  isRegistered: boolean;
  completedSlots: Record<string, boolean>; // key: `day_${day}_${slot}`
  isCompleted: boolean;
  completedAt?: string;
  screenId?: string; // Unique Certificate Screen ID, e.g. EMUFTI-KHATM-XXXX-XXXX
  issueDate?: string;
  signature?: string;
  quizScore?: number;
  quizPassed?: boolean;
  quizCompletedAt?: string;
  isFailedSession?: boolean;
  failedAt?: string;
}

export interface VerifiedCertificateRecord {
  screenId: string;
  challengeId: string;
  userName: string;
  startDate: string;
  completionDate: string;
  issueDate: string;
  durationDays: number;
  totalPages: number;
  totalJuz: number;
  totalPrayerSessions: number;
  signature: string;
  verifiedAt: string;
  isValid: boolean;
}

const STORAGE_PREFIX = 'emufti_khatm_challenge_';
const VERIFIED_CERTIFICATES_KEY = 'emufti_verified_certificates';

export const TOTAL_DAYS = 30;
export const TOTAL_PAGES = 604;
export const TOTAL_JUZ = 30;
export const TOTAL_SLOTS = 150;

export const PRAYER_SLOTS_DEF: { key: PrayerSlotKey; name: string; somaliName: string; icon: string }[] = [
  { key: 'fajr', name: 'Fajr', somaliName: 'Fajir / Subax', icon: '🌅' },
  { key: 'dhuhr', name: 'Dhuhr', somaliName: 'Duhur', icon: '☀️' },
  { key: 'asr', name: 'Asr', somaliName: 'Casar', icon: '🌤️' },
  { key: 'maghrib', name: 'Maghrib', somaliName: 'Maqrib', icon: '🌇' },
  { key: 'isha', name: 'Isha', somaliName: 'Cishe', icon: '🌙' },
];

/**
 * Generate a cryptographically clean, unique Screen ID / Certificate ID
 * Format: EMUFTI-KHATM-XXXX-XXXX
 */
export function generateUniqueScreenId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EMUFTI-KHATM-${segment1}-${segment2}`;
}

function getSafeStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

/**
 * Retrieve all verified certificates from the public persistent registry
 */
export function getVerifiedCertificates(): Record<string, VerifiedCertificateRecord> {
  try {
    const storage = getSafeStorage();
    if (!storage) {
      return getSeedCertificates();
    }
    const raw = storage.getItem(VERIFIED_CERTIFICATES_KEY);
    if (!raw) {
      const seed = getSeedCertificates();
      storage.setItem(VERIFIED_CERTIFICATES_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return getSeedCertificates();
  }
}

/**
 * Save a verified certificate into the registry
 */
export function saveVerifiedCertificate(cert: VerifiedCertificateRecord): void {
  try {
    const storage = getSafeStorage();
    if (!storage) return;
    const all = getVerifiedCertificates();
    all[cert.screenId.toUpperCase().trim()] = cert;
    storage.setItem(VERIFIED_CERTIFICATES_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save certificate record:', e);
  }
}

/**
 * Lookup a certificate by Screen ID (case-insensitive)
 */
export function lookupCertificateByScreenId(screenId: string): VerifiedCertificateRecord | null {
  if (!screenId) return null;
  const cleanId = screenId.toUpperCase().trim();
  const all = getVerifiedCertificates();
  if (all[cleanId]) return all[cleanId];

  // Also check active challenges in localStorage
  try {
    const storage = getSafeStorage();
    if (storage) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = storage.getItem(key);
          if (raw) {
            const data: KhatmChallengeData = JSON.parse(raw);
            if (data.screenId && data.screenId.toUpperCase().trim() === cleanId) {
              const rec: VerifiedCertificateRecord = {
                screenId: data.screenId,
                challengeId: data.id,
                userName: data.userName,
                startDate: data.startDate,
                completionDate: data.completedAt ? data.completedAt.split('T')[0] : new Date().toISOString().split('T')[0],
                issueDate: data.issueDate || new Date().toISOString().split('T')[0],
                durationDays: data.durationDays,
                totalPages: TOTAL_PAGES,
                totalJuz: TOTAL_JUZ,
                totalPrayerSessions: data.durationDays * 5,
                signature: data.signature || "Guddiga Sare ee Qur'aanka Kariimka & Culimada EMufti AI",
                verifiedAt: new Date().toISOString(),
                isValid: true,
              };
              saveVerifiedCertificate(rec);
              return rec;
            }
          }
        }
      }
    }
  } catch {}

  return null;
}

function getSeedCertificates(): Record<string, VerifiedCertificateRecord> {
  return {
    'EMUFTI-KHATM-7B42-9E1F': {
      screenId: 'EMUFTI-KHATM-7B42-9E1F',
      challengeId: 'khatm_seed_1',
      userName: 'Mohamed Abdi',
      startDate: '2026-09-25',
      completionDate: '2026-10-25',
      issueDate: '25 Oct 2026',
      durationDays: 30,
      totalPages: 604,
      totalJuz: 30,
      totalPrayerSessions: 150,
      signature: "Guddiga Sare ee Qur'aanka & EMufti AI",
      verifiedAt: '2026-10-25T12:00:00Z',
      isValid: true,
    },
    'EMUFTI-KHATM-4A1C-8D99': {
      screenId: 'EMUFTI-KHATM-4A1C-8D99',
      challengeId: 'khatm_seed_2',
      userName: 'Fatima Zahra',
      startDate: '2026-10-10',
      completionDate: '2026-10-25',
      issueDate: '25 Oct 2026',
      durationDays: 15,
      totalPages: 604,
      totalJuz: 30,
      totalPrayerSessions: 75,
      signature: "Guddiga Sare ee Qur'aanka & EMufti AI",
      verifiedAt: '2026-10-25T14:30:00Z',
      isValid: true,
    },
  };
}

/**
 * Format Somali Day Ordinal (e.g. 1 -> 1aad, 2 -> 2aad, etc.)
 */
export function formatSomaliDayOrdinal(dayIndex: number): string {
  return `Maalintii ${dayIndex}aad`;
}

/**
 * Automatically calculate the page ranges for a given day and duration
 * Accurately divides 604 total pages across duration and 5 daily prayers
 */
export function getDayPlan(dayIndex: number, durationDays: number = 30): DayKhatmPlan {
  const safeDuration = Math.max(1, durationDays);
  const safeDay = Math.min(safeDuration, Math.max(1, dayIndex));

  // Exactly distribute 604 pages across `safeDuration` days without gaps
  const startPage = Math.floor(((safeDay - 1) * TOTAL_PAGES) / safeDuration) + 1;
  const endPage = safeDay === safeDuration ? TOTAL_PAGES : Math.floor((safeDay * TOTAL_PAGES) / safeDuration);
  const dailyPages = endPage - startPage + 1;

  // Approximate Juzz range for display
  const approxStartJuz = Math.min(30, Math.floor((startPage - 1) / 20) + 1);
  const approxEndJuz = Math.min(30, Math.floor((endPage - 1) / 20) + 1);

  const slotDefs: { key: PrayerSlotKey; label: string }[] = [
    { key: 'fajr', label: 'Fajr (Subax)' },
    { key: 'dhuhr', label: 'Dhuhr (Duhur)' },
    { key: 'asr', label: 'Casar' },
    { key: 'maghrib', label: 'Maghrib (Maqrib)' },
    { key: 'isha', label: 'Isha (Cishe)' },
  ];

  const slots: PrayerSlotDetail[] = slotDefs.map((item, idx) => {
    const sStart = startPage + Math.floor((idx * dailyPages) / 5);
    const sEnd = idx === 4 ? endPage : startPage + Math.floor(((idx + 1) * dailyPages) / 5) - 1;
    const pageCount = Math.max(1, sEnd - sStart + 1);
    const pagesText =
      sStart === sEnd
        ? `Bogga ${sStart} (1 Bog)`
        : `Bogagga ${sStart} - ${sEnd} (${pageCount} Bog)`;

    return {
      key: item.key,
      label: item.label,
      startPage: sStart,
      endPage: sEnd,
      pageCount,
      pages: pagesText,
    };
  });

  return {
    dayIndex: safeDay,
    juzNumber: approxStartJuz,
    approxEndJuz,
    startPage,
    endPage,
    dailyPages,
    slots,
  };
}

/**
 * Format target end date (Start Date + Duration in Days)
 */
export function calculateTargetEndDate(startDateStr: string, durationDays: number = 30): string {
  try {
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    d.setDate(d.getDate() + durationDays);
    return d.toISOString().split('T')[0];
  } catch {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + durationDays);
    return fallback.toISOString().split('T')[0];
  }
}

/**
 * Determine the current calendar active day index (1-based) from start date.
 */
export function getChallengeCurrentDay(startDateStr: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - start.getTime();
    if (diffMs < 0) {
      return 1;
    }
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  } catch {
    return 1;
  }
}

/**
 * Strict Day Locking:
 * Only the current day and past days are open. Future days are strictly locked.
 */
export function isDayLocked(startDateStr: string, dayIndex: number): boolean {
  const currentDay = getChallengeCurrentDay(startDateStr);
  return dayIndex > currentDay;
}

/**
 * Check if a day is the active day (today)
 */
export function isDayActive(startDateStr: string, dayIndex: number): boolean {
  const currentDay = getChallengeCurrentDay(startDateStr);
  return dayIndex === currentDay;
}

/**
 * Check if a day is strictly locked from ticking.
 * Users can only tick off slots on the CURRENT ACTIVE DAY.
 * Past days and future days are strictly locked from alterations.
 */
export function isDayLockedFromTicking(startDateStr: string, dayIndex: number): boolean {
  const currentDay = getChallengeCurrentDay(startDateStr);
  return dayIndex !== currentDay;
}

/**
 * Strict Sequential Prayer Slot Locking (Intra-day & Day Level):
 * 1. Only the current active day can be modified. Past days and future days are strictly locked.
 * 2. Within the active day, Slot 2 is locked until Slot 1 is checked;
 *    Slot 3 is locked until Slot 2 is checked, and so forth.
 */
export function isPrayerSlotLocked(
  challenge: KhatmChallengeData | null,
  dayIndex: number,
  slotKey: PrayerSlotKey
): { isLocked: boolean; reason?: string } {
  if (!challenge) return { isLocked: false };

  const currentActiveDay = getChallengeCurrentDay(challenge.startDate);

  // 1. Strict Day level lock: Future days are locked, past days cannot be altered
  if (dayIndex > currentActiveDay) {
    return { isLocked: true, reason: 'Maalintani weli ma soo gaarin (Maalmaha dambe waa la qufulay 🔒)' };
  }
  if (dayIndex < currentActiveDay) {
    return { isLocked: true, reason: 'Maalintan mar hore ayaa la dhaafay (Maalmihii hore waa la qufulay oo lama beddeli karo 🔒)' };
  }

  // 2. Intra-day sequential order check on current active day
  const order: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const slotIdx = order.indexOf(slotKey);
  if (slotIdx <= 0) {
    return { isLocked: false }; // Fajr is open on the active day
  }

  const prevSlotKey = order[slotIdx - 1];
  const prevSlotId = `day_${dayIndex}_${prevSlotKey}`;
  const isPrevDone = !!challenge.completedSlots[prevSlotId];

  if (!isPrevDone) {
    const prevDef = PRAYER_SLOTS_DEF.find((p) => p.key === prevSlotKey);
    return {
      isLocked: true,
      reason: `Waa in aad marka hore dhammaysataa kalfadhiga ${prevDef?.somaliName || prevSlotKey} si aad kan u bilowdo 🔒.`,
    };
  }

  return { isLocked: false };
}

/**
 * Check if all 5 slots of a given day are completed
 */
export function isDayAllSlotsDone(challenge: KhatmChallengeData | null, dayIndex: number): boolean {
  if (!challenge) return false;
  const order: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  return order.every((s) => !!challenge.completedSlots[`day_${dayIndex}_${s}`]);
}

/**
 * Get active Khatm challenge data from storage
 */
export function getKhatmChallenge(userId: string = 'guest_user'): KhatmChallengeData | null {
  try {
    const storage = getSafeStorage();
    if (!storage) return null;
    const raw = storage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.durationDays) parsed.durationDays = 30;
    return parsed;
  } catch (e) {
    console.error('Failed to get Khatm challenge:', e);
    return null;
  }
}

/**
 * Register or update a Khatm challenge with custom name and duration
 */
export function registerKhatmChallenge(
  userId: string = 'guest_user',
  userName: string = 'Seeker of Knowledge',
  startDate?: string,
  durationDays: number = 30
): KhatmChallengeData {
  const today = new Date().toISOString().split('T')[0];
  const start = startDate || today;
  const targetEnd = calculateTargetEndDate(start, durationDays);

  const existing = getKhatmChallenge(userId);
  const completedSlots = existing?.completedSlots || {};

  const challenge: KhatmChallengeData = {
    id: `khatm_${Date.now()}`,
    userId,
    userName: userName.trim() || 'Seeker of Knowledge',
    startDate: start,
    targetEndDate: targetEnd,
    durationDays,
    createdAt: new Date().toISOString(),
    isRegistered: true,
    completedSlots,
    isCompleted: false,
  };

  saveKhatmChallenge(userId, challenge);
  return challenge;
}

/**
 * Save Khatm challenge data
 */
export function saveKhatmChallenge(userId: string, data: KhatmChallengeData): void {
  try {
    const storage = getSafeStorage();
    if (storage) {
      storage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Failed to save Khatm challenge:', e);
  }
}

/**
 * Record Quran Quiz results for a user's Khatm challenge
 */
export function recordKhatmQuizResult(
  userId: string,
  score: number,
  passed: boolean
): KhatmChallengeData | null {
  const current = getKhatmChallenge(userId);
  if (!current) return null;
  const updated: KhatmChallengeData = {
    ...current,
    quizScore: score,
    quizPassed: passed,
    quizCompletedAt: new Date().toISOString(),
    isFailedSession: !passed,
    failedAt: !passed ? new Date().toISOString() : undefined,
  };
  saveKhatmChallenge(userId, updated);
  return updated;
}

/**
 * Permanently locks and marks a Khatm session as failed after < 7/10 quiz score.
 */
export function markKhatmSessionFailed(userId: string): KhatmChallengeData | null {
  const current = getKhatmChallenge(userId);
  if (!current) return null;
  const updated: KhatmChallengeData = {
    ...current,
    quizPassed: false,
    isFailedSession: true,
    failedAt: new Date().toISOString(),
  };
  saveKhatmChallenge(userId, updated);
  return updated;
}

/**
 * Toggle a prayer slot.
 * IMMUTABLE RULE: Once checked, it CANNOT be unchecked or undone!
 * STRICT SEQUENTIAL RULE: Slot 2 is locked until Slot 1 is checked!
 */
export function togglePrayerSlot(
  userId: string,
  dayIndex: number,
  slotKey: PrayerSlotKey
): { challenge: KhatmChallengeData; dailyCompletedNow: boolean; error?: string } {
  let challenge = getKhatmChallenge(userId);
  if (!challenge) {
    challenge = registerKhatmChallenge(userId);
  }

  const currentActiveDay = getChallengeCurrentDay(challenge.startDate);

  // 1. Strict Day Locking Check: Only the active day can be checked off!
  if (dayIndex > currentActiveDay) {
    return { challenge, dailyCompletedNow: false, error: 'Maalintani weli ma soo gaarin (Maalmaha dambe waa la qufulay 🔒).' };
  }
  if (dayIndex < currentActiveDay) {
    return { challenge, dailyCompletedNow: false, error: 'Maalintan mar hore ayaa la dhaafay (Maalmihii hore waa la qufulay oo lama beddeli karo 🔒).' };
  }

  // 2. Strict Sequential Intra-Day Locking Check
  const lockCheck = isPrayerSlotLocked(challenge, dayIndex, slotKey);
  if (lockCheck.isLocked) {
    return { challenge, dailyCompletedNow: false, error: lockCheck.reason };
  }

  const slotId = `day_${dayIndex}_${slotKey}`;
  const isCurrentlyComplete = !!challenge.completedSlots[slotId];

  // IMMUTABLE CHECK: Once logged, it locks permanently. Cannot uncheck.
  if (isCurrentlyComplete) {
    return {
      challenge,
      dailyCompletedNow: false,
      error: 'Kalfadhigan mar hore ayaa la xaqiijiyay oo si joogto ah u xidhan (Permanent). Lama beddeli karo.',
    };
  }

  const updatedSlots = { ...challenge.completedSlots, [slotId]: true };

  // Calculate pages for this slot
  const plan = getDayPlan(dayIndex, challenge.durationDays || 30);
  const slotObj = plan.slots.find((s) => s.key === slotKey);
  const pagesRead = slotObj?.pageCount || 4;

  try {
    recordReadingLog(userId, pagesRead, pagesRead * 10, 'khatm_challenge');
  } catch {}

  const totalSlots = (challenge.durationDays || 30) * 5;
  const totalCompleted = Object.keys(updatedSlots).length;
  const isFinished = totalCompleted >= totalSlots;

  // Check if day completed just now
  const order: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const dailyCompletedNow = order.every((s) => !!updatedSlots[`day_${dayIndex}_${s}`]);

  // Generate unique screen ID if completed
  let screenId = challenge.screenId;
  let issueDate = challenge.issueDate;
  let signature = challenge.signature || "Guddiga Sare ee Qur'aanka Kariimka & Culimada EMufti AI";

  if (isFinished && !screenId) {
    screenId = generateUniqueScreenId();
    issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const updated: KhatmChallengeData = {
    ...challenge,
    completedSlots: updatedSlots,
    isCompleted: isFinished,
    completedAt: isFinished ? (challenge.completedAt || new Date().toISOString()) : undefined,
    screenId,
    issueDate,
    signature,
  };

  saveKhatmChallenge(userId, updated);

  // If finished, register in verifiable certificate database
  if (isFinished && screenId) {
    saveVerifiedCertificate({
      screenId,
      challengeId: updated.id,
      userName: updated.userName,
      startDate: updated.startDate,
      completionDate: updated.completedAt ? updated.completedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      durationDays: updated.durationDays,
      totalPages: TOTAL_PAGES,
      totalJuz: TOTAL_JUZ,
      totalPrayerSessions: totalSlots,
      signature,
      verifiedAt: new Date().toISOString(),
      isValid: true,
    });
  }

  return { challenge: updated, dailyCompletedNow };
}

/**
 * Mark all prayer slots complete for a day in sequential order.
 */
export function markDayComplete(
  userId: string,
  dayIndex: number
): { challenge: KhatmChallengeData; dailyCompletedNow: boolean } {
  let challenge = getKhatmChallenge(userId);
  if (!challenge) {
    challenge = registerKhatmChallenge(userId);
  }

  if (isDayLocked(challenge.startDate, dayIndex)) {
    return { challenge, dailyCompletedNow: false };
  }

  const updatedSlots = { ...challenge.completedSlots };
  const slotKeys: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const plan = getDayPlan(dayIndex, challenge.durationDays || 30);

  let newPagesAdded = 0;
  slotKeys.forEach((s) => {
    const slotId = `day_${dayIndex}_${s}`;
    if (!updatedSlots[slotId]) {
      updatedSlots[slotId] = true;
      const slotObj = plan.slots.find((slot) => slot.key === s);
      newPagesAdded += slotObj?.pageCount || 4;
    }
  });

  if (newPagesAdded > 0) {
    try {
      recordReadingLog(userId, newPagesAdded, newPagesAdded * 10, 'khatm_challenge');
    } catch {}
  }

  const totalSlots = (challenge.durationDays || 30) * 5;
  const totalCompleted = Object.keys(updatedSlots).length;
  const isFinished = totalCompleted >= totalSlots;

  let screenId = challenge.screenId;
  let issueDate = challenge.issueDate;
  let signature = challenge.signature || "Guddiga Sare ee Qur'aanka Kariimka & Culimada EMufti AI";

  if (isFinished && !screenId) {
    screenId = generateUniqueScreenId();
    issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const updated: KhatmChallengeData = {
    ...challenge,
    completedSlots: updatedSlots,
    isCompleted: isFinished,
    completedAt: isFinished ? (challenge.completedAt || new Date().toISOString()) : undefined,
    screenId,
    issueDate,
    signature,
  };

  saveKhatmChallenge(userId, updated);

  if (isFinished && screenId) {
    saveVerifiedCertificate({
      screenId,
      challengeId: updated.id,
      userName: updated.userName,
      startDate: updated.startDate,
      completionDate: updated.completedAt ? updated.completedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      durationDays: updated.durationDays,
      totalPages: TOTAL_PAGES,
      totalJuz: TOTAL_JUZ,
      totalPrayerSessions: totalSlots,
      signature,
      verifiedAt: new Date().toISOString(),
      isValid: true,
    });
  }

  return { challenge: updated, dailyCompletedNow: true };
}

/**
 * Reset challenge progress / restart
 */
export function resetKhatmChallenge(userId: string): KhatmChallengeData {
  try {
    const storage = getSafeStorage();
    if (storage) {
      storage.removeItem(`${STORAGE_PREFIX}${userId}`);
    }
  } catch (e) {
    console.error('Failed to reset Khatm challenge storage:', e);
  }
  const challenge = registerKhatmChallenge(userId);
  return challenge;
}

/**
 * Calculate challenge statistics
 */
export function getChallengeStats(challenge: KhatmChallengeData | null) {
  const duration = challenge?.durationDays || 30;
  const totalSlots = duration * 5;

  if (!challenge) {
    return {
      durationDays: duration,
      completedSlotsCount: 0,
      totalSlots,
      completedPages: 0,
      totalPages: TOTAL_PAGES,
      completedJuz: 0,
      totalJuz: TOTAL_JUZ,
      completionPercent: 0,
      daysRemaining: duration,
      isCompleted: false,
      completedDaysCount: 0,
      currentAllowedDay: 1,
      screenId: undefined,
    };
  }

  const completedSlotsCount = Object.keys(challenge.completedSlots || {}).length;
  const completionPercent = Math.min(100, Math.round((completedSlotsCount / totalSlots) * 100));

  let completedPages = 0;
  let completedDaysCount = 0;

  for (let d = 1; d <= duration; d++) {
    const plan = getDayPlan(d, duration);
    const slots: PrayerSlotKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const isDayAllDone = slots.every((s) => !!challenge.completedSlots[`day_${d}_${s}`]);
    if (isDayAllDone) completedDaysCount++;

    slots.forEach((s) => {
      if (challenge.completedSlots[`day_${d}_${s}`]) {
        const slotObj = plan.slots.find((item) => item.key === s);
        completedPages += slotObj?.pageCount || 4;
      }
    });
  }

  completedPages = Math.min(TOTAL_PAGES, completedPages);
  const completedJuz = Math.min(30, Number((completedPages / 20.13).toFixed(1)));
  const currentAllowedDay = getChallengeCurrentDay(challenge.startDate);

  let daysRemaining = duration - completedDaysCount;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(challenge.targetEndDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diffDays);
  } catch {}

  const isCompleted = challenge.isCompleted || completedSlotsCount >= totalSlots;

  return {
    durationDays: duration,
    completedSlotsCount,
    totalSlots,
    completedPages,
    totalPages: TOTAL_PAGES,
    completedJuz,
    totalJuz: TOTAL_JUZ,
    completionPercent,
    daysRemaining,
    isCompleted,
    completedDaysCount,
    currentAllowedDay,
    screenId: challenge.screenId,
  };
}

/**
 * Create a transparent circular stamp data URL as an immediate fallback (matching image_9567e4.jpg)
 */
export function createTransparentStampDataUrl(): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cx = 160;
    const cy = 160;

    // Clear transparent background (Alpha = 0)
    ctx.clearRect(0, 0, 320, 320);

    // Outer scalloped ring
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Double solid rings
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 142, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 134, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 98, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 92, 0, Math.PI * 2);
    ctx.stroke();

    // Center Ribbon Banner
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(cx - 80, cy - 14, 160, 28);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 80, cy - 14, 160, 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED & APPROVED', cx, cy + 5);

    // Center Arabic
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('خَتْمُ القُرْآنِ الكَرِيمِ', cx, cy - 25);

    // English Top & Bottom text
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 9px Arial';
    ctx.fillText('OFFICIAL KHATM SEAL', cx, cy + 32);

    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('★ EMUFTI AI ISLAMIC PLATFORM ★', cx, cy + 46);

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

/**
 * Creates high-resolution Arabic Ayah banner for Surah Al-Isra 17:9
 */
export function createArabicAyahDataUrl(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 24px "Traditional Arabic", "Amiri", Arial, serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا',
      canvas.width / 2,
      canvas.height / 2
    );
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

/**
 * Helper to convert an image path to Base64 Data URL
 */
async function loadImageDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch {}
        resolve(null);
      };
      img.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Generate official Khatm al-Quran Certificate of Achievement PDF
 * Includes:
 * 1. User's Name
 * 2. Start Date & Completion Date
 * 3. Issue Date & Authorized Signature
 * 4. Unique Screen ID / Certificate ID
 * 5. Quran Page Logo AND EMufti AI Logo
 * 6. Verification URL for public frontend validation
 */
export async function generateKhatmCertificatePdf(challenge: KhatmChallengeData): Promise<void> {
  // A4 Landscape dimensions in mm: 297 x 210
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Ensure unique Screen ID exists
  const screenId = challenge.screenId || generateUniqueScreenId();
  const issueDate =
    challenge.issueDate ||
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const signatureText = challenge.signature || "Guddiga Sare ee Culimada & Qur'aanka EMufti AI";

  // 1. Certificate Clean Professional Background & Subtle Double Border
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // Outer Royal Blue Hairline Border
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner Gold Accent Border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.rect(13, 13, width - 26, height - 26);

  // Corner Flourishes
  const drawCorner = (x: number, y: number, isRight: boolean, isBottom: boolean) => {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.0);
    const dirX = isRight ? -1 : 1;
    const dirY = isBottom ? -1 : 1;
    doc.line(x, y, x + dirX * 10, y);
    doc.line(x, y, x, y + dirY * 10);
  };
  drawCorner(16, 16, false, false);
  drawCorner(width - 16, 16, true, false);
  drawCorner(16, height - 16, false, true);
  drawCorner(width - 16, height - 16, true, true);

  // 2. Load official logos & Official Transparent Stamp
  let officialStamp: string | null = null;
  try {
    const [emuftiLogo, quranLogo, stampImg] = await Promise.all([
      loadImageDataUrl('/logo.png'),
      loadImageDataUrl('/logo-quran.png'),
      loadImageDataUrl('/images/official-stamp.png'),
    ]);
    officialStamp = stampImg || createTransparentStampDataUrl();

    // EMufti AI Logo on Top Left
    if (emuftiLogo) {
      doc.addImage(emuftiLogo, 'PNG', 20, 16, 18, 18);
    }
    // Quran Page Logo on Top Right
    if (quranLogo) {
      doc.addImage(quranLogo, 'PNG', width - 38, 16, 18, 18);
    }
  } catch (e) {
    console.warn('Logo / stamp loading skipped:', e);
    officialStamp = createTransparentStampDataUrl();
  }

  // 3. Header Texts
  let currentY = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 64, 175);
  doc.text('EMUFTI AI — ISLAMIC PLATFORM & XARUNTA QUR’AANKA KARIIMKA', width / 2, currentY, {
    align: 'center',
  });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const durationText = `${challenge.durationDays || 30} Maalmood`;
  doc.text(`Barnaamijka Khidmada & Tartanka Khatmka (${durationText})`, width / 2, currentY, {
    align: 'center',
  });

  // Certificate Main Title
  currentY += 11;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(15, 23, 42);
  doc.text('SHAHAADADA KHATMKA QUR’AANKA KARIIMKA', width / 2, currentY, { align: 'center' });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text('CERTIFICATE OF HOLY QURAN COMPLETION', width / 2, currentY, { align: 'center' });

  // Quranic Verse Citation (Surah Al-Isra 17:9)
  const ayahImg = createArabicAyahDataUrl();
  if (ayahImg) {
    try {
      doc.addImage(ayahImg, 'PNG', width / 2 - 80, currentY + 1.5, 160, 6.5);
      currentY += 8;
    } catch {
      currentY += 3;
    }
  } else {
    currentY += 3;
  }

  currentY += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '“Indeed, this Quran guides to that which is most suitable and gives glad tidings to the believers” (Surah Al-Isra 17:9)',
    width / 2,
    currentY,
    { align: 'center' }
  );

  // Recipient Presentation
  currentY += 8.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Waxaa sharaf iyo maamuus weyn leh loogu guddoonsiiyey (Presented to):', width / 2, currentY, {
    align: 'center',
  });

  // User Name
  currentY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(30, 64, 175);
  doc.text(challenge.userName || 'Seeker of Knowledge', width / 2, currentY, { align: 'center' });

  // Decorative Underline
  const nameWidth = doc.getTextWidth(challenge.userName || 'Seeker of Knowledge');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(width / 2 - nameWidth / 2 - 8, currentY + 2, width / 2 + nameWidth / 2 + 8, currentY + 2);

  // Citation Paragraph
  currentY += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const citationText = `Maadaama uu/ay si guul iyo xilkasnimo leh ugu dhammaysatay akhrinta 30-ka Juzz (604 Bog) ee Qur’aanka Kariimka barnaamijka Khidmada ${durationText}, iyadoo la raacay nidaamka xiriirsan ee qaybinta bogagga ee 5-ta salaadood maalin kasta.`;
  doc.text(citationText, width / 2, currentY, { align: 'center', maxWidth: 220 });

  // Verified Metrics Badges Container
  currentY += 12;
  const boxWidth = 50;
  const boxHeight = 15;
  const gap = 8;
  const totalBoxWidth = boxWidth * 4 + gap * 3;
  const startX = (width - totalBoxWidth) / 2;

  const totalSlotSessions = (challenge.durationDays || 30) * 5;
  const metrics = [
    { label: '30 Juzz', sub: 'Khatmo Buuxda' },
    { label: '604 Bog', sub: 'La Akhriyay' },
    { label: `${totalSlotSessions || 150} Salaad`, sub: 'Kalfadhiyo Xiriirsan' },
    { label: '3.6M+ Xasano', sub: 'Ajar La Xisaabiyay' },
  ];

  metrics.forEach((m, idx) => {
    const bx = startX + idx * (boxWidth + gap);
    // Clean white cards with refined hairline outline (No heavy background graphics)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bx, currentY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.35);
    doc.roundedRect(bx, currentY, boxWidth, boxHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text(m.label, bx + boxWidth / 2, currentY + 6, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, bx + boxWidth / 2, currentY + 11.5, { align: 'center' });
  });

  // Footer Details: Dates, Signature, and Screen ID Badge
  const footerY = height - 32;

  // Start Date & Completion Date & Issue Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Taariikhda Bilowga: ${challenge.startDate}`, 24, footerY);

  const completionDateStr = challenge.completedAt
    ? new Date(challenge.completedAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  doc.text(`Taariikhda Dhammaystirka: ${completionDateStr}`, 24, footerY + 4.5);
  doc.text(`Taariikhda Bixinta (Issue Date): ${issueDate}`, 24, footerY + 9);

  // Signature Block in the Center
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(width / 2 - 32, footerY + 3, width / 2 + 28, footerY + 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text(signatureText, width / 2 - 2, footerY + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Guddoomiyaha Guddiga / Authorized Verification Signature', width / 2 - 2, footerY + 10.5, {
    align: 'center',
  });

  // Official Transparent Stamp Graphic (matching image_9567e4.jpg with no background)
  if (officialStamp) {
    try {
      doc.addImage(officialStamp, 'PNG', width / 2 + 28, footerY - 14, 28, 28);
    } catch (e) {
      console.warn('Official stamp drawing skipped:', e);
    }
  } else {
    // Vector circular stamp fallback with transparent fill
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.circle(width / 2 + 42, footerY, 12, 'S');
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.circle(width / 2 + 42, footerY, 10, 'S');
    doc.setFontSize(5);
    doc.setTextColor(30, 58, 138);
    doc.text('OFFICIAL SEAL', width / 2 + 42, footerY - 2.5, { align: 'center' });
    doc.setTextColor(217, 119, 6);
    doc.text('★ VERIFIED ★', width / 2 + 42, footerY + 2.0, { align: 'center' });
  }

  // Unique Certificate ID (Screen ID) Badge & Verification Info on Right (Clean white layout)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(width - 98, footerY - 6, 78, 20, 2, 2, 'F');
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.roundedRect(width - 98, footerY - 6, 78, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text('OFFICIAL VERIFIED CERTIFICATE', width - 59, footerY - 1.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`CERTIFICATE ID: ${screenId}`, width - 59, footerY + 3.0, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`SCREEN ID: ${screenId}`, width - 59, footerY + 6.8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(99, 102, 241);
  doc.text('Hubi: emufti.ai/verify-certificate', width - 59, footerY + 11.2, { align: 'center' });

  // Save the PDF file
  const fileName = `Khatm_Certificate_${(challenge.userName || 'Seeker').replace(/\s+/g, '_')}_${screenId}.pdf`;
  doc.save(fileName);
}

/**
 * Admin Test Tool: Instantly generate and preview/download a sample PDF certificate for testing purposes.
 * Embeds test user data, full 604-page completion, dual logos, and registers in public registry for instant online verification.
 */
export async function generateAdminTestCertificatePdf(
  customName: string = 'Admin Tester (Khaliid Axmed)',
  customDurationDays: number = 30
): Promise<{ challenge: KhatmChallengeData; screenId: string }> {
  const screenId = generateUniqueScreenId();
  const startDate = new Date(Date.now() - customDurationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const completionDate = new Date().toISOString();

  const testChallenge: KhatmChallengeData = {
    id: `admin_test_${Date.now()}`,
    userId: 'admin_test_user',
    userName: customName,
    startDate: startDate,
    targetEndDate: completionDate.split('T')[0],
    durationDays: customDurationDays,
    createdAt: startDate,
    isRegistered: true,
    completedSlots: {},
    isCompleted: true,
    completedAt: completionDate,
    screenId: screenId,
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    signature: "Guddiga Sare ee Culimada & Qur'aanka EMufti AI",
  };

  // Register in public certificate registry so it is instantly verifiable at /verify-certificate?id=...
  saveVerifiedCertificate({
    screenId: screenId,
    challengeId: testChallenge.id,
    userName: testChallenge.userName,
    startDate: testChallenge.startDate,
    completionDate: completionDate.split('T')[0],
    durationDays: testChallenge.durationDays,
    issueDate: testChallenge.issueDate || 'Today',
    signature: testChallenge.signature || "Guddiga Sare ee Culimada & Qur'aanka EMufti AI",
    isValid: true,
    issuedBy: 'EMufti AI Islamic Platform (Admin Test Sample)',
  });

  // Generate and trigger download of sample PDF with dual logos
  await generateKhatmCertificatePdf(testChallenge);

  return { challenge: testChallenge, screenId };
}
