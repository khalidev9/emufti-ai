/**
 * Quran.com Content API v4 Service
 * Official Documentation: https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/content-apis/
 *
 * Provides real-time chapter metadata, word-by-word Uthmani text, verified translations,
 * chapter/verse audio streams, and scholarly information with multi-tier caching and reliable fallbacks.
 */

import { ALL_114_SURAHS } from '../data/quranMetadata';

export interface QuranDotComWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: 'word' | 'end';
  verse_key: string;
  verse_id?: number;
  location: string;
  text_uthmani: string;
  page_number: number;
  line_number?: number;
  text?: string;
  translation: {
    text: string;
    language_name: string;
  } | null;
  transliteration: {
    text: string | null;
    language_name: string;
  } | null;
}

export interface QuranDotComVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  page_number: number;
  juz_number: number;
  words: QuranDotComWord[];
  translations?: Array<{
    id: number;
    resource_id: number;
    text: string;
  }>;
}

export interface QuranDotComChapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface QuranDotComChapterInfo {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
}

export interface QuranDotComTranslation {
  id: number;
  name: string;
  author_name: string;
  language_name: string;
  is_default?: boolean;
}

export interface QuranDotComReciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name?: {
    name: string;
  };
}

// Fallback verified reciters
export const VERIFIED_QDC_RECITERS: QuranDotComReciter[] = [
  { id: 12, reciter_name: 'Mahmoud Khalil Al-Husary', style: 'Muallim' },
  { id: 6, reciter_name: 'Mahmoud Khalil Al-Husary', style: 'Murattal' },
  { id: 7, reciter_name: 'Mishari Rashid al-`Afasy', style: 'Murattal' },
  { id: 2, reciter_name: 'AbdulBaset AbdulSamad', style: 'Murattal' },
  { id: 1, reciter_name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
  { id: 3, reciter_name: 'Abdur-Rahman as-Sudais', style: 'Murattal' },
  { id: 4, reciter_name: 'Abu Bakr al-Shatri', style: 'Murattal' },
  { id: 9, reciter_name: 'Mohamed Siddiq al-Minshawi', style: 'Murattal' },
  { id: 10, reciter_name: 'Sa`ud ash-Shuraym', style: 'Murattal' },
];

// Fallback verified translations list
export const VERIFIED_TRANSLATIONS: QuranDotComTranslation[] = [
  { id: 20, name: 'Saheeh International', author_name: 'Saheeh International', language_name: 'english', is_default: true },
  { id: 85, name: 'M.A.S. Abdel Haleem', author_name: 'Abdul Haleem', language_name: 'english' },
  { id: 149, name: 'Bridges’ translation', author_name: 'Fadel Soliman', language_name: 'english' },
  { id: 84, name: 'T. Usmani', author_name: 'Mufti Taqi Usmani', language_name: 'english' },
  { id: 46, name: 'Mahmud Muhammad Abduh', author_name: 'Mahmud Muhammad Abduh', language_name: 'somali' },
  { id: 131, name: 'Dr. Mustafa Khattab (The Clear Quran)', author_name: 'Dr. Mustafa Khattab', language_name: 'english' },
];

const API_BASE = 'https://api.quran.com/api/v4';

class QuranDotComService {
  /**
   * Fetches all 114 chapters from Quran.com Content API v4
   */
  async fetchChapters(): Promise<QuranDotComChapter[]> {
    const cacheKey = 'qdc_chapters_list_v1';
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 114) {
          return parsed;
        }
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/chapters?language=en`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.chapters && Array.isArray(json.chapters)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json.chapters));
          } catch {}
          return json.chapters;
        }
      }
    } catch (e) {
      console.warn('[quranDotComService] fetchChapters network error, using fallback:', e);
    }

    // Fallback based on canonical ALL_114_SURAHS
    return ALL_114_SURAHS.map((s) => ({
      id: s.number,
      revelation_place: s.revelationType === 'Meccan' ? 'makkah' : 'madinah',
      revelation_order: s.number,
      bismillah_pre: s.number !== 9 && s.number !== 1,
      name_simple: s.englishName,
      name_complex: s.englishName,
      name_arabic: s.name,
      verses_count: s.numberOfAyahs,
      pages: [s.page, s.page] as [number, number],
      translated_name: {
        language_name: 'english',
        name: s.englishNameTranslation,
      },
    }));
  }

  /**
   * Fetches chapter historical info, revelation context, and themes
   */
  async fetchChapterInfo(chapterId: number): Promise<QuranDotComChapterInfo | null> {
    const cacheKey = `qdc_chapter_info_${chapterId}_v1`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/chapters/${chapterId}/info?language=en`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.chapter_info) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json.chapter_info));
          } catch {}
          return json.chapter_info;
        }
      }
    } catch (e) {
      console.warn(`[quranDotComService] fetchChapterInfo error for chapter ${chapterId}:`, e);
    }

    // Fallback metadata description
    const surahMeta = ALL_114_SURAHS.find((s) => s.number === chapterId);
    return {
      id: chapterId,
      chapter_id: chapterId,
      language_name: 'english',
      short_text: `Surah ${surahMeta?.englishName || chapterId} is chapter ${chapterId} of the Holy Quran, containing ${surahMeta?.numberOfAyahs || ''} verses revealed in ${surahMeta?.revelationType || 'Makkah'}.`,
      source: 'EMufti AI Verified Catalog',
      text: `<p>Surah ${surahMeta?.englishName || chapterId} (${surahMeta?.englishNameTranslation || ''}) is the ${chapterId}th chapter of the Noble Quran. It consists of ${surahMeta?.numberOfAyahs || ''} verses revealed in ${surahMeta?.revelationType || 'Makkah'}.</p>`,
    };
  }

  /**
   * Fetches verses for a chapter with word-by-word data, transliteration, and translation.
   * Uses per_page=300 to fetch complete chapters in a single query.
   */
  async fetchChapterVerses(chapterId: number, translationId: number = 20): Promise<QuranDotComVerse[]> {
    const cacheKey = `qdc_verses_ch_${chapterId}_tr_${translationId}_v2`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      // Request Uthmani text, words, word translation, transliteration, and chapter translation
      const url = `${API_BASE}/verses/by_chapter/${chapterId}?language=en&words=true&translations=${translationId}&word_fields=verse_key,verse_id,page_number,location,text_uthmani,translation,transliteration&per_page=300`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.verses && Array.isArray(json.verses)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json.verses));
          } catch {}
          return json.verses;
        }
      }
    } catch (e) {
      console.warn(`[quranDotComService] fetchChapterVerses error for chapter ${chapterId}:`, e);
    }

    // Fallback: If translations=131 returned empty because of Quran.com API licensing, try Saheeh International (20)
    if (translationId !== 20) {
      try {
        const fallbackVerses = await this.fetchChapterVerses(chapterId, 20);
        if (fallbackVerses && fallbackVerses.length > 0) {
          return fallbackVerses;
        }
      } catch {}
    }

    return [];
  }

  /**
   * Fetches verses for a specific Mushaf page (1-604) with word-by-word data,
   * line numbers, Uthmani script, translations, and transliterations.
   */
  async fetchPageVersesWithWords(pageNumber: number): Promise<QuranDotComVerse[]> {
    if (pageNumber < 1 || pageNumber > 604) {
      pageNumber = 1;
    }

    const cacheKey = `qdc_verses_page_${pageNumber}_v2`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const url = `${API_BASE}/verses/by_page/${pageNumber}?language=en&words=true&translations=20,46&word_fields=verse_key,verse_id,page_number,location,text_uthmani,line_number,translation,transliteration&per_page=50`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.verses && Array.isArray(json.verses)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json.verses));
          } catch {}
          return json.verses;
        }
      }
    } catch (e) {
      console.warn(`[quranDotComService] fetchPageVersesWithWords error for page ${pageNumber}:`, e);
    }

    return [];
  }

  /**
   * Fetches available translation resources from Quran.com Content API v4
   */
  async fetchTranslationsList(): Promise<QuranDotComTranslation[]> {
    const cacheKey = 'qdc_translations_list_v1';
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/resources/translations?language=en`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.translations && Array.isArray(json.translations)) {
          const list: QuranDotComTranslation[] = json.translations.map((t: any) => ({
            id: t.id,
            name: t.name,
            author_name: t.author_name || t.name,
            language_name: t.language_name,
            is_default: t.id === 20 || t.id === 131,
          }));

          // Always ensure Dr. Mustafa Khattab option is displayed
          if (!list.some((t) => t.id === 131)) {
            list.unshift({
              id: 131,
              name: 'Dr. Mustafa Khattab (The Clear Quran)',
              author_name: 'Dr. Mustafa Khattab',
              language_name: 'english',
              is_default: true,
            });
          }

          try {
            localStorage.setItem(cacheKey, JSON.stringify(list));
          } catch {}
          return list;
        }
      }
    } catch (e) {
      console.warn('[quranDotComService] fetchTranslationsList error:', e);
    }

    return VERIFIED_TRANSLATIONS;
  }

  /**
   * Fetches full chapter recitation audio URL
   */
  async fetchChapterAudio(reciterId: number, chapterId: number): Promise<string | null> {
    const cacheKey = `qdc_chapter_audio_${reciterId}_${chapterId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {}

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/chapter_recitations/${reciterId}/${chapterId}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.audio_file?.audio_url) {
          const url = json.audio_file.audio_url;
          try {
            localStorage.setItem(cacheKey, url);
          } catch {}
          return url;
        }
      }
    } catch (e) {
      console.warn(`[quranDotComService] fetchChapterAudio error for reciter ${reciterId}, chapter ${chapterId}:`, e);
    }

    // High availability fallback using download.quranicaudio.com / everyayah
    if (reciterId === 12 || reciterId === 6) {
      return `https://download.quranicaudio.com/qdc/khalil_al_husary/${reciterId === 12 ? 'muallim' : 'murattal'}/${chapterId}.mp3`;
    }
    const padded = chapterId.toString().padStart(3, '0');
    return `https://server8.mp3quran.net/afs/${padded}.mp3`;
  }

  /**
   * Fetches footnote explanation
   */
  async fetchFootnote(footnoteId: number): Promise<string | null> {
    const cacheKey = `qdc_footnote_${footnoteId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/foot_notes/${footnoteId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.foot_note?.text) {
          const text = json.foot_note.text;
          try {
            localStorage.setItem(cacheKey, text);
          } catch {}
          return text;
        }
      }
    } catch (e) {
      console.warn(`[quranDotComService] fetchFootnote error for ${footnoteId}:`, e);
    }
    return null;
  }
}

export const quranDotComService = new QuranDotComService();
