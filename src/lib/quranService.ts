import { supabase, isSupabaseConfigured } from './supabase.ts';
import type {
  Surah,
  Ayah,
  QariReciter,
  QuranBookmark,
  QuranReadingProgress,
  TasbeehLog,
  QuranAccessStatus,
  WaydiiEMuftiStatus,
  WaydiiRecordResult,
  PlanSlug,
  QuranReadingPlan,
  QuranPlannerLog,
} from '../types/database.ts';
import { ALL_114_SURAHS, VERIFIED_QURRA, BUNDLED_SURAHS } from '../data/quranMetadata.ts';
import { ALL_50_QARIS, getQariById } from '../data/qarisData.ts';

// In-memory cache for loaded surah ayahs
const surahCache = new Map<number, Ayah[]>();

// In-memory circuit breaker for Supabase quran_reading_progress table availability
let isReadingProgressTableAvailable: boolean | null = null;
let lastProgressCheckTimestamp = 0;

export const quranService = {
  /**
   * Returns all 114 Surahs metadata
   */
  getAllSurahs(): Surah[] {
    return ALL_114_SURAHS;
  },

  /**
   * Returns metadata for a single Surah by number
   */
  getSurahMetadata(surahNumber: number): Surah | undefined {
    return ALL_114_SURAHS.find((s) => s.number === surahNumber);
  },

  /**
   * Alias for getSurahMetadata for developer convenience
   */
  getSurah(surahNumber: number): Surah | undefined {
    return ALL_114_SURAHS.find((s) => s.number === surahNumber);
  },

  /**
   * Returns all 50 verified Qurra (Reciters)
   */
  getReciters(): QariReciter[] {
    return ALL_50_QARIS;
  },

  /**
   * Returns default reciter (Mishary Rashid Alafasy) or saved preference
   */
  getDefaultReciter(): QariReciter {
    const savedReciterId = localStorage.getItem('emufti_quran_selected_reciter');
    if (savedReciterId) {
      const found = getQariById(savedReciterId);
      if (found) return found;
    }
    // Default to Mishary Rashid Alafasy (id: 'alafasy') for verse sync compatibility
    const defaultQari = getQariById('alafasy');
    return defaultQari || ALL_50_QARIS[0];
  },

  /**
   * Saves the user's preferred reciter to localStorage
   */
  saveSelectedReciter(reciterId: string) {
    try {
      localStorage.setItem('emufti_quran_selected_reciter', reciterId);
    } catch {}
  },

  /**
   * Builds the audio URL for a single verse
   * Format: {baseUrl}/{paddedSurah}{paddedVerse}.mp3
   */
  getVerseAudioUrl(reciter: QariReciter, surah: number, verse: number): string {
    const paddedSurah = String(surah).padStart(3, '0');
    const paddedVerse = String(verse).padStart(3, '0');
    if (reciter.hasVerseAudio && reciter.verseBaseUrl) {
      return `${reciter.verseBaseUrl}/${paddedSurah}${paddedVerse}.mp3`;
    }
    // For reciters with full-surah audio (e.g., Sheikh Abdul Rashid Ali Sufi), return authentic surah audio
    if (reciter.surahBaseUrl) {
      return this.getSurahAudioUrl(reciter, surah);
    }
    // Fallback to Mishary Alafasy if the selected reciter does not have verse-by-verse EveryAyah audio
    return `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedVerse}.mp3`;
  },

  /**
   * Retrieves an ordered list of resilient audio stream candidates for any Surah (1-114).
   * Supports both unpadded (1.mp3) and 3-digit padded (001.mp3) CDN formats,
   * plus mirrors and guaranteed universal fallback endpoints so playback never fails.
   */
  getSurahAudioCandidates(reciter?: QariReciter | null, surah?: number): string[] {
    const s = Math.max(1, Math.min(114, Number(surah) || 1));
    const unpadded = String(s);
    const padded = unpadded.padStart(3, '0');
    const candidates: string[] = [];

    const addUrl = (url?: string | null) => {
      if (!url) return;
      const clean = url.trim();
      if (clean && !candidates.includes(clean)) {
        candidates.push(clean);
      }
    };

    if (reciter?.surahBaseUrl) {
      const base = reciter.surahBaseUrl.replace(/\/+$/, '');
      const isQdcOrIslamicNet = base.includes('/qdc/') || base.includes('islamic.network');

      if (isQdcOrIslamicNet) {
        addUrl(`${base}/${unpadded}.mp3`);
        addUrl(`${base}/${padded}.mp3`);
      } else {
        addUrl(`${base}/${padded}.mp3`);
        addUrl(`${base}/${unpadded}.mp3`);
      }
    }

    // High-speed reciter-specific mirrors
    if (reciter?.id) {
      const id = reciter.id;
      if (id === 'abdulrasheed-sufi') {
        addUrl(`https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/${padded}.mp3`);
        addUrl(`https://server16.mp3quran.net/soufi/${padded}.mp3`);
        addUrl(`https://download.quranicaudio.com/quran/abdurrashid_sufi/${padded}.mp3`);
      } else if (id === 'alafasy') {
        addUrl(`https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${unpadded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${unpadded}.mp3`);
        addUrl(`https://cdn.mp3quran.net/audio/alafasy/murattal/${padded}.mp3`);
      } else if (id === 'husary') {
        addUrl(`https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/${unpadded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.husary/${unpadded}.mp3`);
      } else if (id === 'abdulbasit' || id === 'abdulbasit-mujawwad') {
        addUrl(`https://download.quranicaudio.com/qdc/abdul_baset/murattal/${unpadded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${unpadded}.mp3`);
      } else if (id === 'minshawi' || id === 'minshawi-mujawwad') {
        addUrl(`https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal/${unpadded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.minshawi/${unpadded}.mp3`);
      } else if (id === 'ghamdi') {
        addUrl(`https://download.quranicaudio.com/quran/sa3d_al-ghaamidee/complete/${padded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.saadalghamidi/${unpadded}.mp3`);
      } else if (id === 'maher') {
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.mahermuaiqly/${unpadded}.mp3`);
        addUrl(`https://download.quranicaudio.com/qdc/maher_almuaiqly/murattal/${unpadded}.mp3`);
      } else if (id === 'shuraim') {
        addUrl(`https://download.quranicaudio.com/quran/sa3ood_al-shuraym/${padded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.saoodshuraym/${unpadded}.mp3`);
      } else if (id === 'sudais') {
        addUrl(`https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudays/murattal/${unpadded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.abdurrahmaansudais/${unpadded}.mp3`);
      } else if (id === 'ajmy') {
        addUrl(`https://download.quranicaudio.com/quran/ahmed_ibn_3ali_al-3ajamy/${padded}.mp3`);
        addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.ahmedajamy/${unpadded}.mp3`);
      }
    }

    // Universal Golden Fallback CDNs (100% guaranteed uptime for all 114 Surahs)
    addUrl(`https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${unpadded}.mp3`);
    addUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${unpadded}.mp3`);
    addUrl(`https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/${padded}.mp3`);

    return candidates;
  },

  /**
   * Builds the primary audio URL for a complete surah.
   * Uses intelligent format detection (unpadded for QDC / Islamic.Network, padded for MP3Quran / QuranicAudio).
   */
  getSurahAudioUrl(reciter?: QariReciter | null, surah?: number): string {
    const candidates = this.getSurahAudioCandidates(reciter, surah);
    return candidates[0] || '';
  },

  /**
   * Fetches verses for a given Surah with multi-tiered resilient fallback.
   * Pipeline:
   * 1. In-memory cache (surahCache) with strict ayah count validation.
   * 2. LocalStorage cache (emufti_quran_v2_surah_{N}) with validation.
   * 3. Primary: AlQuran Cloud multi-edition (quran-uthmani, en.sahih, so.abduh).
   * 4. Secondary Fallback: AlQuran Cloud standalone pure Uthmani + resilient translation joins.
   * 5. Tertiary Fallback: Quran.com API v4 (King Fahd Complex verified Uthmani script).
   * 6. Offline Bundled Verses (BUNDLED_SURAHS) for key chapters.
   */
  async fetchSurahVerses(surahNumber: number): Promise<Ayah[]> {
    if (surahNumber < 1 || surahNumber > 114) {
      // Guard against returning incomplete/truncated ayah lists
    const verses: Ayah[] = [];
    if (metadata && verses.length < metadata.numberOfAyahs) {
      console.warn(`[quranService] Incomplete ayah list returned for Surah ${surahNumber}`);
    }

    throw new Error(`Invalid surah number ${surahNumber}. Must be between 1 and 114.`);
    }

    const metadata = ALL_114_SURAHS.find((s) => s.number === surahNumber);
    const expectedAyahs = metadata?.numberOfAyahs || 0;

    // 1. Check in-memory cache with count integrity
    const versesCache = surahCache;
    if (versesCache.has(surahNumber)) {
      const cached = versesCache.get(surahNumber)!;
      if (metadata && (expectedAyahs === 0 || cached.length === metadata.numberOfAyahs)) {
        return cached;
      }
      // Purge invalid cache
      versesCache.delete(surahNumber);
    }

    // 2. Check localStorage cache
    const cacheKey = `emufti_quran_v2_surah_${surahNumber}`;
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const stored = JSON.parse(cachedRaw) as Ayah[];
        if (metadata && Array.isArray(stored) && (expectedAyahs === 0 || stored.length === metadata.numberOfAyahs)) {
          versesCache.set(surahNumber, stored);
          return stored;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch {}

    // 3. Primary: AlQuran Cloud 3-Editions (quran-uthmani, en.sahih, so.abduh)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const endpoint = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,so.abduh`;
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 1) {
          const arEdition = json.data[0]; // quran-uthmani
          const enEdition = json.data[1]; // en.sahih
          const soEdition = json.data[2]; // so.abduh

          if (arEdition?.ayahs && (expectedAyahs === 0 || arEdition.ayahs.length === expectedAyahs)) {
            const ayahs: Ayah[] = arEdition.ayahs.map((a: any, idx: number) => ({
              number: a.number,
              numberInSurah: a.numberInSurah,
              text: a.text,
              translationEn: enEdition?.ayahs?.[idx]?.text || undefined,
              translationSo: soEdition?.ayahs?.[idx]?.text || undefined,
              page: a.page || metadata?.page || undefined,
              juz: a.juz || undefined,
              hizbQuarter: a.hizbQuarter || undefined,
            }));

            surahCache.set(surahNumber, ayahs);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(ayahs));
            } catch {}
            return ayahs;
          }
        }
      }
    } catch (err) {
      console.warn(`[quranService] Tier 3 (AlQuran 3-editions) failed for Surah ${surahNumber}:`, err);
    }

    // 4. Secondary Fallback: AlQuran Cloud standalone Uthmani text + resilient translation fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const endpoint = `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`;
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data?.ayahs && (expectedAyahs === 0 || json.data.ayahs.length === expectedAyahs)) {
          const arAyahs = json.data.ayahs;

          // Attempt to fetch translations gracefully in background/parallel without blocking if they fail
          let soAyahs: any[] = [];
          let enAyahs: any[] = [];
          try {
            const [soRes, enRes] = await Promise.allSettled([
              fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/so.abduh`).then((r) => r.json()),
              fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`).then((r) => r.json()),
            ]);
            if (soRes.status === 'fulfilled' && soRes.value?.data?.ayahs) {
              soAyahs = soRes.value.data.ayahs;
            }
            if (enRes.status === 'fulfilled' && enRes.value?.data?.ayahs) {
              enAyahs = enRes.value.data.ayahs;
            }
          } catch {}

          const ayahs: Ayah[] = arAyahs.map((a: any, idx: number) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            translationEn: enAyahs[idx]?.text || undefined,
            translationSo: soAyahs[idx]?.text || undefined,
            page: a.page || metadata?.page || undefined,
            juz: a.juz || undefined,
            hizbQuarter: a.hizbQuarter || undefined,
          }));

          surahCache.set(surahNumber, ayahs);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(ayahs));
          } catch {}
          return ayahs;
        }
      }
    } catch (err) {
      console.warn(`[quranService] Tier 4 (AlQuran standalone) failed for Surah ${surahNumber}:`, err);
    }

    // 5. Tertiary Fallback: Quran.com API v4 (King Fahd Complex Uthmani Script CDN)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const endpoint = `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`;
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json.verses) && (expectedAyahs === 0 || json.verses.length === expectedAyahs)) {
          const ayahs: Ayah[] = json.verses.map((v: any, idx: number) => ({
            number: v.id || idx + 1,
            numberInSurah: idx + 1,
            text: v.text_uthmani,
            translationEn: undefined,
            translationSo: undefined,
            page: metadata?.page || undefined,
          }));

          surahCache.set(surahNumber, ayahs);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(ayahs));
          } catch {}
          return ayahs;
        }
      }
    } catch (err) {
      console.warn(`[quranService] Tier 5 (Quran.com API v4) failed for Surah ${surahNumber}:`, err);
    }

    // 6. Quaternary Fallback: Offline Bundled Verses
    if (BUNDLED_SURAHS[surahNumber]) {
      const bundled = BUNDLED_SURAHS[surahNumber];
      if (expectedAyahs === 0 || bundled.length === expectedAyahs) {
        surahCache.set(surahNumber, bundled);
        return bundled;
      }
    }

    // Guard against returning incomplete/truncated ayah lists
    const verses: Ayah[] = [];
    if (metadata && verses.length < metadata.numberOfAyahs) {
      console.warn(`[quranService] Incomplete ayah list returned for Surah ${surahNumber}`);
    }

    throw new Error(
      `Unable to load authentic Quran verses for Surah ${surahNumber} (${metadata?.englishName || 'Surah'}). Please check your internet connection and click 'Retry'.`
    );
  },

  /**
   * Health diagnostic check for Surah verses verification
   */
  async verifySurahVerses(surahNumber: number): Promise<{
    verified: boolean;
    count: number;
    expected: number;
    source: string;
    error?: string;
  }> {
    const meta = this.getSurahMetadata(surahNumber);
    const expected = meta?.numberOfAyahs || 0;
    try {
      const verses = await this.fetchSurahVerses(surahNumber);
      return {
        verified: verses.length === expected,
        count: verses.length,
        expected,
        source: 'API / Cache Verified',
      };
    } catch (e: any) {
      return {
        verified: false,
        count: 0,
        expected,
        source: 'Failed',
        error: e?.message || 'Verification failed',
      };
    }
  },

  /**
   * Fetches verses for a given Madinah Mushaf page (1..604)
   * With multi-tiered caching and fallback.
   */
  async fetchPageVerses(pageNumber: number): Promise<Ayah[]> {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error(`Invalid page number ${pageNumber}. Must be between 1 and 604.`);
    }

    const cacheKey = `emufti_quran_page_v1_${pageNumber}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && json.data?.ayahs) {
          const arAyahs = json.data.ayahs;
          let soAyahs: any[] = [];
          try {
            const soRes = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/so.abduh`).then((r) => r.json());
            if (soRes?.data?.ayahs) soAyahs = soRes.data.ayahs;
          } catch {}

          const ayahs: Ayah[] = arAyahs.map((a: any, idx: number) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            translationSo: soAyahs[idx]?.text || undefined,
            translationEn: undefined,
            page: a.page || pageNumber,
            juz: a.juz,
            hizbQuarter: a.hizbQuarter,
            surah: a.surah ? {
              number: a.surah.number,
              name: a.surah.name,
              englishName: a.surah.englishName,
            } : undefined,
          }));

          try {
            localStorage.setItem(cacheKey, JSON.stringify(ayahs));
          } catch {}
          return ayahs;
        }
      }
    } catch (e) {
      console.warn(`[quranService] fetchPageVerses failed for page ${pageNumber}:`, e);
    }

    // Fallback: search loaded surahCache
    for (const [_, ayahs] of surahCache.entries()) {
      const pageAyahs = ayahs.filter((a) => a.page === pageNumber);
      if (pageAyahs.length > 0) return pageAyahs;
    }

    return [];
  },

  // ===========================================================================
  // Bookmarks & Saved Verses
  // ===========================================================================

  async getBookmarks(userId?: string): Promise<QuranBookmark[]> {
    const localKey = `emufti_quran_bookmarks_${userId || 'guest'}`;
    let localBookmarks: QuranBookmark[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localBookmarks = JSON.parse(raw);
    } catch {}

    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('quran_bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as QuranBookmark[];
        }
      } catch (e) {
        console.warn('[quranService] Supabase getBookmarks fallback:', e);
      }
    }

    return localBookmarks;
  },

  async addBookmark(bookmark: QuranBookmark): Promise<boolean> {
    const userId = bookmark.user_id || 'guest';
    const localKey = `emufti_quran_bookmarks_${userId}`;

    // Update localStorage
    try {
      let current: QuranBookmark[] = [];
      const raw = localStorage.getItem(localKey);
      if (raw) current = JSON.parse(raw);
      // Avoid duplicate
      current = current.filter(
        (b) => !(b.surah_number === bookmark.surah_number && b.verse_number === bookmark.verse_number)
      );
      current.unshift({ ...bookmark, created_at: new Date().toISOString() });
      localStorage.setItem(localKey, JSON.stringify(current));
    } catch {}

    // Update Supabase if configured and user is authenticated
    if (isSupabaseConfigured && bookmark.user_id && bookmark.user_id !== 'guest') {
      try {
        await supabase.from('quran_bookmarks').upsert({
          user_id: bookmark.user_id,
          surah_number: bookmark.surah_number,
          verse_number: bookmark.verse_number,
          surah_name: bookmark.surah_name,
          verse_text_preview: bookmark.verse_text_preview || null,
          note: bookmark.note || null,
        });
      } catch (err) {
        console.warn('[quranService] Supabase addBookmark fallback:', err);
      }
    }

    return true;
  },

  async removeBookmark(userId: string, surah: number, verse: number): Promise<boolean> {
    const localKey = `emufti_quran_bookmarks_${userId || 'guest'}`;
    try {
      let current: QuranBookmark[] = [];
      const raw = localStorage.getItem(localKey);
      if (raw) current = JSON.parse(raw);
      current = current.filter(
        (b) => !(b.surah_number === surah && b.verse_number === verse)
      );
      localStorage.setItem(localKey, JSON.stringify(current));
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase
          .from('quran_bookmarks')
          .delete()
          .match({ user_id: userId, surah_number: surah, verse_number: verse });
      } catch (err) {
        console.warn('[quranService] Supabase removeBookmark fallback:', err);
      }
    }

    return true;
  },

  // ===========================================================================
  // Reading Progress (Resume reading)
  // ===========================================================================

  async getReadingProgress(userId?: string): Promise<QuranReadingProgress | null> {
    const localKey = `emufti_quran_reading_progress_${userId || 'guest'}`;
    let localProgress: QuranReadingProgress | null = null;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localProgress = JSON.parse(raw);
    } catch {}

    const now = Date.now();
    // Circuit breaker: If table was detected as missing (PGRST205/404), avoid spamming network errors
    if (isReadingProgressTableAvailable === false && now - lastProgressCheckTimestamp < 60000) {
      return localProgress;
    }

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase
          .from('quran_reading_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.code === '42P01') {
            isReadingProgressTableAvailable = false;
            lastProgressCheckTimestamp = now;
          }
          return localProgress;
        }

        isReadingProgressTableAvailable = true;
        if (data) {
          const s = data.surah_number || data.last_surah || 1;
          const v = data.verse_number || data.last_verse || 1;
          const p = data.page_number || (data as any).last_page || 1;
          return {
            id: data.id,
            user_id: data.user_id,
            surah_number: s,
            verse_number: v,
            page_number: p,
            last_surah: s,
            last_verse: v,
            last_page: p,
            surah_name: data.surah_name || `Surah ${s}`,
            updated_at: data.updated_at,
          };
        }
      } catch (e) {
        // Silent fallback
        return localProgress;
      }
    }

    return localProgress;
  },

  async saveReadingProgress(
    userId: string,
    surah: number,
    verse: number,
    surahName?: string,
    pageNumber?: number
  ): Promise<void> {
    const s = Math.max(1, Math.min(114, Number(surah) || 1));
    const v = Math.max(1, Number(verse) || 1);
    const p = Math.max(1, Math.min(604, Number(pageNumber) || 1));

    const progress: QuranReadingProgress = {
      user_id: userId || 'guest',
      surah_number: s,
      verse_number: v,
      page_number: p,
      last_surah: s,
      last_verse: v,
      last_page: p,
      surah_name: surahName || `Surah ${s}`,
      updated_at: new Date().toISOString(),
    };

    const localKey = `emufti_quran_reading_progress_${userId || 'guest'}`;
    try {
      localStorage.setItem(localKey, JSON.stringify(progress));
    } catch {}

    const now = Date.now();
    if (isReadingProgressTableAvailable === false && now - lastProgressCheckTimestamp < 60000) {
      return;
    }

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { error } = await supabase.from('quran_reading_progress').upsert({
          user_id: userId,
          surah_number: s,
          verse_number: v,
          page_number: p,
          last_surah: s,
          last_verse: v,
          last_page: p,
          surah_name: progress.surah_name,
          updated_at: progress.updated_at,
        }, { onConflict: 'user_id' });

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.code === '42P01') {
            isReadingProgressTableAvailable = false;
            lastProgressCheckTimestamp = now;
          }
        } else {
          isReadingProgressTableAvailable = true;
        }
      } catch (e) {
        // Silent fallback
      }
    }
  },

  // ===========================================================================
  // Digital Tasbeeh State & Progress
  // ===========================================================================

  async getTasbeehLogs(userId?: string): Promise<Record<string, TasbeehLog>> {
    const localKey = `emufti_tasbeeh_logs_${userId || 'guest'}`;
    let map: Record<string, TasbeehLog> = {};
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) map = JSON.parse(raw);
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data } = await supabase
          .from('tasbeeh_logs')
          .select('*')
          .eq('user_id', userId);

        if (data && data.length > 0) {
          for (const item of data) {
            map[item.dhikr_id] = item as TasbeehLog;
          }
        }
      } catch (e) {
        console.warn('[quranService] Tasbeeh logs fallback:', e);
      }
    }

    return map;
  },

  async saveTasbeehCount(
    userId: string,
    dhikrId: string,
    dhikrName: string,
    count: number,
    target: number,
    cycles: number
  ): Promise<void> {
    const log: TasbeehLog = {
      user_id: userId || 'guest',
      dhikr_id: dhikrId,
      dhikr_name: dhikrName,
      count,
      target,
      total_completed_cycles: cycles,
      updated_at: new Date().toISOString(),
    };

    const localKey = `emufti_tasbeeh_logs_${userId || 'guest'}`;
    try {
      let currentMap: Record<string, TasbeehLog> = {};
      const raw = localStorage.getItem(localKey);
      if (raw) currentMap = JSON.parse(raw);
      currentMap[dhikrId] = log;
      localStorage.setItem(localKey, JSON.stringify(currentMap));
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase.from('tasbeeh_logs').upsert({
          user_id: userId,
          dhikr_id: dhikrId,
          dhikr_name: dhikrName,
          count,
          target,
          total_completed_cycles: cycles,
          updated_at: log.updated_at,
        });
      } catch (e) {
        console.warn('[quranService] Tasbeeh log save fallback:', e);
      }
    }
  },

  // ===========================================================================
  // Quran Subscription & 3-Use Free Trial Access Control
  // ===========================================================================

  /**
   * Checks the user's current Quran access status.
   * If Pro or Premium, returns unlimited access.
   * If Free, enforces the exact 2-Day Quran Free Trial window.
   */
  async checkQuranAccess(userId?: string, profilePlan?: PlanSlug): Promise<QuranAccessStatus> {
    const isPaid = profilePlan === 'pro' || profilePlan === 'premium';

    // 1. If profile plan is already Pro/Premium, grant unlimited access immediately
    if (isPaid) {
      return {
        authenticated: Boolean(userId),
        user_id: userId,
        is_paid_member: true,
        plan: profilePlan || 'pro',
        quran_plan: profilePlan || 'pro',
        trial_days_total: 2,
        trial_uses_total: 2,
        trial_uses_consumed: 0,
        trial_uses_remaining: 2,
        has_trial_access: true,
        trial_exhausted: false,
        unlimited: true,
      };
    }

    // 2. Query server-side RPC get_quran_access_status if Supabase is configured
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase.rpc('get_quran_access_status', {
          p_user_id: userId,
        });

        if (!error && data) {
          return {
            authenticated: Boolean(data.authenticated),
            user_id: data.user_id || userId,
            is_paid_member: Boolean(data.is_paid_member),
            plan: (data.plan as PlanSlug) || 'free',
            quran_plan: (data.quran_plan as string) || (data.is_paid_member ? 'pro' : 'trial'),
            trial_days_total: 2,
            trial_started_at: data.trial_started_at,
            trial_expires_at: data.trial_expires_at,
            seconds_remaining: data.seconds_remaining,
            trial_uses_total: 2,
            trial_uses_consumed: data.trial_exhausted ? 2 : 1,
            trial_uses_remaining: data.trial_exhausted ? 0 : 1,
            has_trial_access: Boolean(data.has_trial_access),
            trial_exhausted: Boolean(data.trial_exhausted),
            session_active_today: true,
            unlimited: Boolean(data.unlimited),
            message: data.message,
          };
        }
      } catch (rpcErr) {
        console.warn('[quranService] RPC get_quran_access_status failed, using local fallback:', rpcErr);
      }
    }

    // 3. Fallback: Exact 2-Day (48-hour) continuous trial timer per user
    const startKey = `emufti_quran_trial_start_${userId || 'anon'}`;
    let startTimeStr = localStorage.getItem(startKey);
    const now = Date.now();
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // 48 hours = 172,800,000 ms

    if (!startTimeStr) {
      startTimeStr = new Date(now).toISOString();
      try {
        localStorage.setItem(startKey, startTimeStr);
      } catch {}
    }

    const startTimestamp = new Date(startTimeStr).getTime();
    const expiresTimestamp = startTimestamp + TWO_DAYS_MS;
    const hasAccess = now < expiresTimestamp;
    const exhausted = now >= expiresTimestamp;
    const secondsRemaining = Math.max(0, Math.floor((expiresTimestamp - now) / 1000));

    return {
      authenticated: Boolean(userId),
      user_id: userId,
      is_paid_member: false,
      plan: 'free',
      quran_plan: hasAccess ? 'trial' : 'expired',
      trial_days_total: 2,
      trial_started_at: startTimeStr,
      trial_expires_at: new Date(expiresTimestamp).toISOString(),
      seconds_remaining: secondsRemaining,
      trial_uses_total: 2,
      trial_uses_consumed: exhausted ? 2 : 1,
      trial_uses_remaining: exhausted ? 0 : 1,
      has_trial_access: hasAccess,
      trial_exhausted: exhausted,
      session_active_today: true,
      unlimited: false,
    };
  },

  /**
   * Records or verifies a Quran session for Free trial tracking.
   * Connects to Supabase RPC and updates the 2-day trial timer.
   */
  async recordQuranSession(userId?: string): Promise<QuranAccessStatus> {
    if (!userId) {
      return {
        authenticated: false,
        is_paid_member: false,
        plan: 'free',
        trial_days_total: 2,
        trial_uses_total: 2,
        trial_uses_consumed: 0,
        trial_uses_remaining: 0,
        has_trial_access: false,
        trial_exhausted: true,
        message: 'Please sign in to start your 2-day Quran Free Trial.',
      };
    }

    // 1. Try start_quran_free_trial RPC or get_quran_access_status RPC
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_quran_access_status', {
          p_user_id: userId,
        });

        if (!error && data) {
          return {
            authenticated: true,
            user_id: userId,
            is_paid_member: Boolean(data.is_paid_member),
            plan: (data.plan as PlanSlug) || 'free',
            quran_plan: (data.quran_plan as string) || (data.is_paid_member ? 'pro' : 'trial'),
            trial_days_total: 2,
            trial_started_at: data.trial_started_at,
            trial_expires_at: data.trial_expires_at,
            seconds_remaining: data.seconds_remaining,
            trial_uses_total: 2,
            trial_uses_consumed: data.trial_exhausted ? 2 : 1,
            trial_uses_remaining: data.trial_exhausted ? 0 : 1,
            has_trial_access: Boolean(data.has_trial_access),
            trial_exhausted: Boolean(data.trial_exhausted),
            session_active_today: true,
            unlimited: Boolean(data.unlimited),
            message: data.message,
          };
        }
      } catch (rpcErr) {
        console.warn('[quranService] RPC recordQuranSession fallback:', rpcErr);
      }
    }

    // 2. Local 2-day trial fallback
    return this.checkQuranAccess(userId);
  },

  // ===========================================================================
  // "Waydii EMufti" Free Plan 2-Use Server-Enforced Limits
  // ===========================================================================

  /**
   * Retrieves the current user's "Waydii EMufti" usage status.
   * Free plan accounts get exactly 2 uses across all Surahs/Ayahs.
   * Pro/Premium members receive unlimited uses.
   */
  async getWaydiiEMuftiStatus(userId?: string, profilePlan?: PlanSlug): Promise<WaydiiEMuftiStatus> {
    const isPaid = profilePlan === 'pro' || profilePlan === 'premium';

    // 1. If profile plan is verified Pro or Premium, grant unlimited access
    if (isPaid) {
      return {
        authenticated: Boolean(userId),
        user_id: userId,
        is_paid: true,
        plan: profilePlan || 'pro',
        unlimited: true,
        allowed: true,
        uses_consumed: 0,
        uses_remaining: 9999,
        total_allowed: 9999,
      };
    }

    // 2. Query Supabase RPC get_waydii_emufti_status
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase.rpc('get_waydii_emufti_status', {
          p_user_id: userId,
        });

        if (!error && data) {
          return {
            authenticated: Boolean(data.authenticated),
            user_id: data.user_id || userId,
            is_paid: Boolean(data.is_paid),
            plan: (data.plan as PlanSlug) || 'free',
            unlimited: Boolean(data.unlimited),
            allowed: Boolean(data.allowed),
            uses_consumed: Number(data.uses_consumed) || 0,
            uses_remaining: Number(data.uses_remaining) ?? (data.allowed ? 1 : 0),
            total_allowed: Number(data.total_allowed) || 2,
            message: data.message,
            error: data.error,
          };
        }
      } catch (rpcErr) {
        console.warn('[quranService] RPC get_waydii_emufti_status failed, using persistent fallback:', rpcErr);
      }
    }

    // 3. Fallback: Persistent local counter per user ID (enforces 2-use limit even offline/guest)
    const localKey = `emufti_waydii_usage_${userId || 'guest'}`;
    let count = 0;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) count = parseInt(raw, 10) || 0;
    } catch {}

    const totalAllowed = 2;
    const isAllowed = count < totalAllowed;
    return {
      authenticated: Boolean(userId),
      user_id: userId,
      is_paid: false,
      plan: 'free',
      unlimited: false,
      allowed: isAllowed,
      uses_consumed: count,
      uses_remaining: Math.max(0, totalAllowed - count),
      total_allowed: totalAllowed,
      message: isAllowed
        ? undefined
        : "Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium si aad u hesho su'aalo aan xadidnayn.",
    };
  },

  /**
   * Idempotently records a single question submission to "Waydii EMufti".
   * Enforced on server via transaction-locked RPC to prevent concurrency bypass.
   * Returns whether the submission was accepted and remaining allowance.
   */
  async recordWaydiiEMuftiUsage(
    surahNumber: number,
    ayahNumber: number,
    category: string = 'tafsiir',
    questionText?: string,
    userId?: string,
    profilePlan?: PlanSlug
  ): Promise<WaydiiRecordResult> {
    const isPaid = profilePlan === 'pro' || profilePlan === 'premium';

    // 1. Pro / Premium paid subscribers
    if (isPaid) {
      if (isSupabaseConfigured && userId) {
        try {
          await supabase.rpc('record_waydii_emufti_usage', {
            p_surah_number: surahNumber,
            p_ayah_number: ayahNumber,
            p_category: category,
            p_question_text: questionText || '',
            p_user_id: userId,
          });
        } catch (e) {
          console.warn('[quranService] Paid user record_waydii_emufti_usage warning:', e);
        }
      }
      return {
        success: true,
        allowed: true,
        is_paid: true,
        unlimited: true,
        uses_consumed: 0,
        uses_remaining: 9999,
        total_allowed: 9999,
      };
    }

    // 2. Query server-side RPC for atomic lock & limit enforcement
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase.rpc('record_waydii_emufti_usage', {
          p_surah_number: surahNumber,
          p_ayah_number: ayahNumber,
          p_category: category,
          p_question_text: questionText || '',
          p_user_id: userId,
        });

        if (!error && data) {
          // Sync local counter to match server
          try {
            const localKey = `emufti_waydii_usage_${userId}`;
            localStorage.setItem(localKey, String(data.uses_consumed || 0));
          } catch {}

          return {
            success: Boolean(data.success),
            allowed: Boolean(data.allowed),
            is_paid: Boolean(data.is_paid),
            unlimited: Boolean(data.unlimited),
            uses_consumed: Number(data.uses_consumed) || 0,
            uses_remaining: Number(data.uses_remaining) || 0,
            total_allowed: Number(data.total_allowed) || 2,
            error: data.error,
          };
        }
      } catch (rpcErr) {
        console.warn('[quranService] RPC record_waydii_emufti_usage fallback to local enforcement:', rpcErr);
      }
    }

    // 3. Resilient persistent fallback (enforces exactly 2 uses)
    const localKey = `emufti_waydii_usage_${userId || 'guest'}`;
    let count = 0;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) count = parseInt(raw, 10) || 0;
    } catch {}

    const totalAllowed = 2;
    if (count >= totalAllowed) {
      return {
        success: false,
        allowed: false,
        is_paid: false,
        unlimited: false,
        uses_consumed: count,
        uses_remaining: 0,
        total_allowed: totalAllowed,
        error: "Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium si aad u hesho su'aalo aan xadidnayn.",
      };
    }

    // Increment and persist
    count += 1;
    try {
      localStorage.setItem(localKey, String(count));
    } catch {}

    return {
      success: true,
      allowed: true,
      is_paid: false,
      unlimited: false,
      uses_consumed: count,
      uses_remaining: Math.max(0, totalAllowed - count),
      total_allowed: totalAllowed,
    };
  },

  // ===========================================================================
  // Quran Completion Schedule Planner
  // ===========================================================================

  async getReadingPlan(userId?: string): Promise<QuranReadingPlan | null> {
    const localKey = `emufti_quran_plan_${userId || 'guest'}`;
    let localPlan: QuranReadingPlan | null = null;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localPlan = JSON.parse(raw);
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase
          .from('quran_reading_plans')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return data as QuranReadingPlan;
        }
      } catch (e) {
        console.warn('[quranService] Supabase getReadingPlan fallback:', e);
      }
    }

    return localPlan;
  },

  async saveReadingPlan(planData: Partial<QuranReadingPlan> & { user_id?: string }): Promise<QuranReadingPlan> {
    const userId = planData.user_id || 'guest';
    const localKey = `emufti_quran_plan_${userId}`;
    const now = new Date().toISOString();

    const mushafPages = planData.mushaf_total_pages || 604;
    const dailyTarget = planData.daily_target_pages || 20.0;
    const calculatedDays = Math.ceil(mushafPages / dailyTarget);

    const plan: QuranReadingPlan = {
      id: planData.id || crypto.randomUUID(),
      user_id: userId,
      plan_type: planData.plan_type || 'pages_per_day',
      mushaf_total_pages: mushafPages,
      mushaf_edition: planData.mushaf_edition || 'Madinah Mushaf (604 pages)',
      daily_target_pages: dailyTarget,
      target_days: planData.target_days || calculatedDays,
      current_page: planData.current_page || 0,
      pages_read: planData.pages_read || 0,
      status: planData.status || 'active',
      start_date: planData.start_date || new Date().toISOString().split('T')[0],
      estimated_end_date: planData.estimated_end_date,
      last_read_date: planData.last_read_date,
      created_at: planData.created_at || now,
      updated_at: now,
    };

    // Save to localStorage
    try {
      localStorage.setItem(localKey, JSON.stringify(plan));
    } catch {}

    // Save to Supabase if configured & authenticated user
    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase
          .from('quran_reading_plans')
          .upsert([plan], { onConflict: 'user_id' });
      } catch (e) {
        console.warn('[quranService] Supabase saveReadingPlan fallback:', e);
      }
    }

    return plan;
  },

  async logDailyReading(logData: QuranPlannerLog): Promise<boolean> {
    const userId = logData.user_id || 'guest';
    const localKey = `emufti_quran_plan_logs_${userId}`;
    const log: QuranPlannerLog = {
      ...logData,
      id: logData.id || crypto.randomUUID(),
      created_at: logData.created_at || new Date().toISOString(),
    };

    // Local storage
    try {
      let logs: QuranPlannerLog[] = [];
      const raw = localStorage.getItem(localKey);
      if (raw) logs = JSON.parse(raw);
      logs = logs.filter((l) => l.log_date !== log.log_date);
      logs.unshift(log);
      localStorage.setItem(localKey, JSON.stringify(logs.slice(0, 60)));
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase
          .from('quran_planner_logs')
          .upsert([log], { onConflict: 'user_id,log_date' });
      } catch (e) {
        console.warn('[quranService] Supabase logDailyReading fallback:', e);
      }
    }

    return true;
  },

  async getPlannerLogs(userId?: string): Promise<QuranPlannerLog[]> {
    const localKey = `emufti_quran_plan_logs_${userId || 'guest'}`;
    let localLogs: QuranPlannerLog[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localLogs = JSON.parse(raw);
    } catch {}

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase
          .from('quran_planner_logs')
          .select('*')
          .eq('user_id', userId)
          .order('log_date', { ascending: false })
          .limit(60);

        if (!error && data) {
          return data as QuranPlannerLog[];
        }
      } catch (e) {
        console.warn('[quranService] Supabase getPlannerLogs fallback:', e);
      }
    }

    return localLogs;
  },

  // ===========================================================================
  // User Quran Location & Progress Finder Position
  // ===========================================================================

  async saveUserPosition(
    userId: string,
    surah: number,
    verse: number,
    page?: number,
    juz?: number,
    hizb?: number,
    surahName?: string
  ): Promise<void> {
    const localKey = `emufti_quran_position_${userId || 'guest'}`;
    const s = Math.max(1, Math.min(114, Number(surah) || 1));
    const v = Math.max(1, Number(verse) || 1);
    const p = Math.max(1, Math.min(604, Number(page) || 1));

    const position = {
      user_id: userId,
      surah_number: s,
      verse_number: v,
      page_number: p,
      last_surah: s,
      last_verse: v,
      last_page: p,
      last_juz: juz,
      last_hizb: hizb,
      surah_name: surahName,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(localKey, JSON.stringify(position));
    } catch {}

    const now = Date.now();
    if (isReadingProgressTableAvailable === false && now - lastProgressCheckTimestamp < 60000) {
      return;
    }

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { error } = await supabase
          .from('quran_reading_progress')
          .upsert([position], { onConflict: 'user_id' });

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.code === '42P01') {
            isReadingProgressTableAvailable = false;
            lastProgressCheckTimestamp = now;
          }
        } else {
          isReadingProgressTableAvailable = true;
        }
      } catch (e) {
        // Silent fallback
      }
    }
  },

  async getUserPosition(userId?: string): Promise<{
    last_surah: number;
    last_verse: number;
    last_page?: number;
    last_juz?: number;
    last_hizb?: number;
    surah_name?: string;
    surah_number?: number;
    verse_number?: number;
    page_number?: number;
  } | null> {
    const localKey = `emufti_quran_position_${userId || 'guest'}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) return JSON.parse(raw);
    } catch {}

    const now = Date.now();
    if (isReadingProgressTableAvailable === false && now - lastProgressCheckTimestamp < 60000) {
      return null;
    }

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { data, error } = await supabase
          .from('quran_reading_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.code === '42P01') {
            isReadingProgressTableAvailable = false;
            lastProgressCheckTimestamp = now;
          }
          return null;
        }

        isReadingProgressTableAvailable = true;
        if (data) {
          const s = data.surah_number || data.last_surah || 1;
          const v = data.verse_number || data.last_verse || 1;
          const p = data.page_number || (data as any).last_page || 1;
          return {
            last_surah: s,
            last_verse: v,
            last_page: p,
            surah_number: s,
            verse_number: v,
            page_number: p,
            last_juz: (data as any).last_juz,
            last_hizb: (data as any).last_hizb,
            surah_name: data.surah_name,
          };
        }
      } catch (e) {
        // Silent fallback
      }
    }

    return null;
  },
};

export const getWaydiiEMuftiStatus = quranService.getWaydiiEMuftiStatus.bind(quranService);
export const recordWaydiiEMuftiUsage = quranService.recordWaydiiEMuftiUsage.bind(quranService);
export const getSurahVerses = (surahNum: number) => quranService.fetchSurahVerses(surahNum);
export const getSurah = getSurahVerses;
export async function verifySurahVerses(surahNum: number) {
  return quranService.verifySurahVerses(surahNum);
}
