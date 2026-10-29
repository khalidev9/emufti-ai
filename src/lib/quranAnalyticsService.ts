// ==============================================================================
// EMUFTI AI — Quran Reading Analytics & Statistics Service
// Tracks Pages Read, Juzz Read, Ayahs Read, and Hasanaat Earned
// Supports Daily, Weekly, Monthly, and Yearly timeframe breakdowns.
// ==============================================================================

export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReadingLogEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  pages: number;
  ayahs: number;
  juzNumber?: number;
  hasanaat: number;
  source?: 'quran_reader' | 'khatm_challenge' | 'subcis' | 'manual_log';
}

export interface QuranAnalyticsSummary {
  timeframe: AnalyticsTimeframe;
  pagesRead: number;
  juzzRead: number;
  ayahsRead: number;
  hasanaatEarned: number;
  targetPages: number;
  completionPercent: number;
  daysActive: number;
  averagePagesPerDay: number;
}

const STORAGE_KEY_PREFIX = 'emufti_quran_reading_logs_';
const LETTERS_PER_PAGE = 600; // Standard Madani Mushaf average letters per page
const HASANAAT_PER_LETTER = 10; // Prophetic Hadith: 1 letter = 10 Hasanaat

// Calculate hasanaat from pages
export function calculateHasanaatFromPages(pages: number): number {
  return pages * LETTERS_PER_PAGE * HASANAAT_PER_LETTER;
}

// Calculate ayahs from pages (~10.3 ayahs per page on average across 604 pages and 6,236 ayahs)
export function estimateAyahsFromPages(pages: number): number {
  return Math.round(pages * 10.32);
}

// Safely get logs from localStorage
export function getReadingLogs(userId: string = 'guest_user'): ReadingLogEntry[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return getSeedLogs(userId);
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // Initialize with realistic initial logs based on current progress
      const seed = getSeedLogs(userId);
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading Quran reading logs:', e);
    return getSeedLogs(userId);
  }
}

// Save logs to localStorage
function saveReadingLogs(userId: string, logs: ReadingLogEntry[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `${STORAGE_KEY_PREFIX}${userId}`;
      window.localStorage.setItem(key, JSON.stringify(logs));
    }
  } catch (e) {
    console.error('Error saving Quran reading logs:', e);
  }
}

// Record a reading session
export function recordReadingLog(
  userId: string = 'guest_user',
  pages: number,
  ayahs?: number,
  source: ReadingLogEntry['source'] = 'quran_reader',
  customDate?: string
): ReadingLogEntry {
  const logs = getReadingLogs(userId);
  const now = new Date();
  const dateStr = customDate || now.toISOString().split('T')[0];
  const calculatedAyahs = ayahs !== undefined ? ayahs : estimateAyahsFromPages(pages);
  const calculatedHasanaat = calculateHasanaatFromPages(pages);

  const entry: ReadingLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    date: dateStr,
    timestamp: now.toISOString(),
    pages: Math.max(0, pages),
    ayahs: Math.max(0, calculatedAyahs),
    hasanaat: calculatedHasanaat,
    source,
  };

  const updatedLogs = [entry, ...logs];
  saveReadingLogs(userId, updatedLogs);
  return entry;
}

// Default seed logs if empty, so users immediately see clean data
function getSeedLogs(userId: string): ReadingLogEntry[] {
  const today = new Date();
  const logs: ReadingLogEntry[] = [];

  // Add 4 entries over the last 4 days
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const pages = i === 0 ? 4 : 4; // 4 pages per day / slot
    logs.push({
      id: `seed_log_${i}`,
      userId,
      date: dateStr,
      timestamp: d.toISOString(),
      pages,
      ayahs: estimateAyahsFromPages(pages),
      hasanaat: calculateHasanaatFromPages(pages),
      source: 'khatm_challenge',
    });
  }

  return logs;
}

// Filter logs by timeframe
export function getAnalyticsSummary(
  userId: string = 'guest_user',
  timeframe: AnalyticsTimeframe = 'daily'
): QuranAnalyticsSummary {
  const logs = getReadingLogs(userId);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let filteredLogs: ReadingLogEntry[] = [];
  let targetPages = 20; // Default daily target: 1 Juzz = 20 pages

  if (timeframe === 'daily') {
    targetPages = 20; // 1 Juzz / 20 pages per day
    filteredLogs = logs.filter((log) => log.date === todayStr);
  } else if (timeframe === 'weekly') {
    targetPages = 140; // 7 days * 20 pages = 140 pages
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    filteredLogs = logs.filter((log) => log.date >= weekAgoStr && log.date <= todayStr);
  } else if (timeframe === 'monthly') {
    targetPages = 604; // Complete Quran Khatm = 604 pages in 1 month
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    filteredLogs = logs.filter((log) => log.date >= monthAgoStr && log.date <= todayStr);
  } else if (timeframe === 'yearly') {
    targetPages = 604 * 12; // 12 Khatms a year = 7,248 pages
    const yearAgo = new Date(now);
    yearAgo.setDate(yearAgo.getDate() - 365);
    const yearAgoStr = yearAgo.toISOString().split('T')[0];
    filteredLogs = logs.filter((log) => log.date >= yearAgoStr && log.date <= todayStr);
  }

  const totalPages = filteredLogs.reduce((sum, item) => sum + (item.pages || 0), 0);
  const totalAyahs = filteredLogs.reduce((sum, item) => sum + (item.ayahs || 0), 0);
  const totalHasanaat = filteredLogs.reduce((sum, item) => sum + (item.hasanaat || 0), 0);

  // Distinct active days
  const activeDaysSet = new Set(filteredLogs.map((l) => l.date));
  const daysActive = activeDaysSet.size;

  // Juzz count: 1 Juz = ~20.13 pages (604 pages / 30 Juz)
  const juzzRead = Number((totalPages / 20.13).toFixed(1));

  const completionPercent = Math.min(100, Math.round((totalPages / (targetPages || 1)) * 100));
  const averagePagesPerDay = daysActive > 0 ? Number((totalPages / daysActive).toFixed(1)) : totalPages;

  return {
    timeframe,
    pagesRead: totalPages,
    juzzRead,
    ayahsRead: totalAyahs,
    hasanaatEarned: totalHasanaat,
    targetPages,
    completionPercent,
    daysActive: Math.max(1, daysActive),
    averagePagesPerDay,
  };
}
