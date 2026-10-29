import { supabase, isSupabaseConfigured } from './supabase.ts';
import type {
  MacallinLesson,
  MacallinAttempt,
  MacallinMistake,
  MacallinProgressSummary,
  MacallinWordVerification,
} from '../types/database.ts';
import { ALL_114_SURAHS } from '../data/quranMetadata.ts';
import { tajweedAssessmentEngine } from './tajweedAssessmentEngine.ts';
import type { StrictPassageEvaluationResult } from './tajweedAssessmentEngine.ts';

const MACALLIN_LESSONS_STORAGE_KEY = 'emufti_macallin_lessons';
const MACALLIN_ATTEMPTS_STORAGE_KEY = 'emufti_macallin_attempts';

/**
 * Normalizes Arabic text for faithful textual comparison.
 * Strips tashkeel (diacritics), Quranic pauses, tatweel, and normalizes
 * hamza / alef variants so that speech recognition transcript can be compared
 * against authentic Quran verses without diacritic discrepancies.
 */
export function normalizeArabicForComparison(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic recitation and stop signs (Sajdah, rub, juz, stop signs)
    .replace(/[\u06D6-\u06ED\u0610-\u061A]/g, '')
    // Remove Tashkeel (Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanween, Superscript Alef)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // Normalize Alef variants (أ, إ, آ, ٱ -> ا)
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Ta Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Alef Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Hamza on Waw / Ya
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Remove punctuation, digits, brackets, verse numbers
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»‹›۝\\[\\]]/g, '')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein edit distance between two normalized words
 */
function wordEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Returns user's local date formatted as YYYY-MM-DD
 */
export function getLocalDateString(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface EvaluationResult {
  status: 'passed' | 'errors_detected' | 'unverified';
  confidence: number;
  expectedNormalized: string;
  transcriptNormalized: string;
  mistakes: MacallinMistake[];
  wordVerifications?: MacallinWordVerification[];
  feedbackMessageSo: string;
  feedbackMessageAr: string;
  feedbackMessageEn: string;
  summaryNote?: string;
}

export const macallinService = {
  /**
   * Evaluates the learner's recited transcript against the authentic Quran Ayah text.
   * Compares word-by-word with religious honesty and accuracy.
   */
  evaluateAyahRecitation(
    ayahNumber: number,
    expectedAyahText: string,
    spokenTranscript: string | null | undefined,
    surahNumber: number = 1,
    audioBlob?: Blob | null
  ): EvaluationResult {
    const rawTranscript = (spokenTranscript || '').trim();
    const normExpected = normalizeArabicForComparison(expectedAyahText);
    const normSpoken = normalizeArabicForComparison(rawTranscript);

    // If no transcript was captured, or microphone recognition was unavailable,
    // or if audioBlob was explicitly passed as empty (< 50 bytes) and no transcript
    if (!rawTranscript || rawTranscript.length < 2 || (audioBlob && audioBlob.size < 50 && rawTranscript.length < 2)) {
      return {
        status: 'unverified',
        confidence: 0,
        expectedNormalized: normExpected,
        transcriptNormalized: '',
        mistakes: [],
        wordVerifications: [],
        feedbackMessageSo: 'Lama xaqiijin',
        feedbackMessageAr: 'لم يتم التحقق من التلاوة بشكل كامل. يرجى المحاولة مرة أخرى أو مراجعة معلّم.',
        feedbackMessageEn: 'Recitation could not be reliably verified. Please try again or verify with a qualified teacher.',
        summaryNote: 'Speech recognition did not capture enough clear audio to verify. Fadlan mar kale si cad u akhri si loo hubiyo.',
      };
    }

    const strictResult = tajweedAssessmentEngine.evaluateAyahStrict(
      ayahNumber,
      expectedAyahText,
      spokenTranscript,
      surahNumber
    );

    return {
      status: strictResult.status,
      confidence: strictResult.confidence,
      expectedNormalized: normExpected,
      transcriptNormalized: normSpoken,
      mistakes: strictResult.mistakes,
      wordVerifications: strictResult.wordVerifications,
      feedbackMessageSo: strictResult.feedbackMessageSo,
      feedbackMessageAr: strictResult.feedbackMessageAr,
      feedbackMessageEn: strictResult.feedbackMessageEn,
      summaryNote:
        strictResult.mistakes.length > 0
          ? `Waxaa la ogaaday ${strictResult.mistakes.length} khaladaad oo sixid u baahan.`
          : 'Dhammaan erayada aayadda si sax ah ayaa loo akhriyay.',
    };
  },

  /**
   * Evaluates an entire passage (Full Surah or selected Ayah range) consolidated.
   */
  evaluatePassageRecitation(
    passageVerses: { numberInSurah: number; text: string }[],
    spokenTranscript: string | null | undefined,
    surahNumber: number = 1,
    audioBlob?: Blob | null
  ): StrictPassageEvaluationResult {
    const rawTranscript = (spokenTranscript || '').trim();

    if (!rawTranscript || rawTranscript.length < 2 || (audioBlob && audioBlob.size < 50 && rawTranscript.length < 2)) {
      return tajweedAssessmentEngine.evaluatePassageStrict(passageVerses, '', surahNumber);
    }

    return tajweedAssessmentEngine.evaluatePassageStrict(
      passageVerses,
      spokenTranscript,
      surahNumber
    );
  },

  /**
   * Retrieves all lessons for a user (combining Supabase and LocalStorage)
   */
  async getAllLessons(userId: string): Promise<MacallinLesson[]> {
    const localLessons = this.getLocalLessons(userId);

    if (isSupabaseConfigured && userId && userId !== 'guest_user') {
      try {
        const { data, error } = await supabase
          .from('quran_macallin_lessons')
          .select('*')
          .eq('user_id', userId)
          .order('scheduled_date', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Merge and update local cache
          const remoteList = data as MacallinLesson[];
          this.saveLocalLessons(userId, remoteList);
          return remoteList;
        }
      } catch (err) {
        console.warn('[macallinService] Failed to fetch remote lessons, using local cache:', err);
      }
    }

    return localLessons;
  },

  /**
   * Gets or idempotently initializes today's scheduled lesson.
   * If a previous lesson is incomplete, preserves it as the active due lesson!
   */
  async getOrScheduleTodayLesson(
    userId: string,
    preferredSurahNumber: number = 1
  ): Promise<{ lesson: MacallinLesson; isPendingPrevious: boolean }> {
    const all = await this.getAllLessons(userId);
    const today = getLocalDateString(0);

    // 1. Check if there is an uncompleted lesson from a previous date that is still pending
    const overdueIncomplete = all
      .filter((l) => l.scheduled_date < today && (l.status === 'pending' || l.status === 'needs_review' || l.status === 'in_progress'))
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];

    if (overdueIncomplete) {
      return { lesson: overdueIncomplete, isPendingPrevious: true };
    }

    // 2. Check if today already has a scheduled lesson
    const todayLesson = all.find((l) => l.scheduled_date === today);
    if (todayLesson) {
      return { lesson: todayLesson, isPendingPrevious: false };
    }

    // 3. Otherwise, initialize today's lesson based on actual learning progression
    // Find the latest completed lesson to determine the next passage
    const latestCompleted = all
      .filter((l) => l.status === 'completed')
      .sort((a, b) => (b.completed_at || b.scheduled_date).localeCompare(a.completed_at || a.scheduled_date))[0];

    let surahNum = preferredSurahNumber;
    let startAyah = 1;
    let endAyah = 5;

    if (latestCompleted) {
      const curSurahMeta = ALL_114_SURAHS.find((s) => s.number === latestCompleted.surah_number);
      const totalAyahs = curSurahMeta?.numberOfAyahs || 7;

      if (latestCompleted.end_ayah < totalAyahs) {
        // Continue same surah with next 5 ayahs
        surahNum = latestCompleted.surah_number;
        startAyah = latestCompleted.end_ayah + 1;
        endAyah = Math.min(startAyah + 4, totalAyahs);
      } else {
        // Completed surah! Advance to next surah in canonical order
        surahNum = latestCompleted.surah_number < 114 ? latestCompleted.surah_number + 1 : 1;
        const nextSurahMeta = ALL_114_SURAHS.find((s) => s.number === surahNum);
        startAyah = 1;
        endAyah = Math.min(5, nextSurahMeta?.numberOfAyahs || 5);
      }
    } else {
      const meta = ALL_114_SURAHS.find((s) => s.number === surahNum);
      endAyah = Math.min(5, meta?.numberOfAyahs || 5);
    }

    const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNum) || ALL_114_SURAHS[0];

    const newLesson: MacallinLesson = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lesson-${Date.now()}`,
      user_id: userId,
      surah_number: surahNum,
      surah_name: surahMeta.englishName,
      surah_arabic_name: surahMeta.name,
      start_ayah: startAyah,
      end_ayah: endAyah,
      scheduled_date: today,
      status: 'pending',
      mistakes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveLesson(newLesson);
    return { lesson: newLesson, isPendingPrevious: false };
  },

  /**
   * Saves or updates a lesson in Supabase and localStorage.
   */
  async saveLesson(lesson: MacallinLesson): Promise<MacallinLesson> {
    // 1. Save locally
    const existing = this.getLocalLessons(lesson.user_id);
    const updatedList = existing.filter((l) => l.id !== lesson.id && l.scheduled_date !== lesson.scheduled_date);
    updatedList.unshift(lesson);
    this.saveLocalLessons(lesson.user_id, updatedList);

    // 2. Persist to Supabase if authenticated
    if (isSupabaseConfigured && lesson.user_id && lesson.user_id !== 'guest_user') {
      try {
        const payload: any = {
          id: lesson.id,
          user_id: lesson.user_id,
          surah_number: lesson.surah_number,
          surah_name: lesson.surah_name,
          surah_arabic_name: lesson.surah_arabic_name || null,
          start_ayah: lesson.start_ayah,
          end_ayah: lesson.end_ayah,
          assigned_ayahs_count: lesson.assigned_ayahs_count || (lesson.end_ayah - lesson.start_ayah + 1),
          selection_mode: lesson.selection_mode || 'ayah_range',
          scheduled_date: lesson.scheduled_date,
          status: lesson.status,
          mistakes_count: lesson.mistakes_count,
          accuracy_percentage: lesson.accuracy_percentage ?? null,
          next_lesson_assignment: lesson.next_lesson_assignment ? JSON.stringify(lesson.next_lesson_assignment) : null,
          teacher_override: lesson.teacher_override ?? false,
          teacher_notes: lesson.teacher_notes || null,
          completed_at: lesson.completed_at || null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('quran_macallin_lessons')
          .upsert(payload, { onConflict: 'user_id, scheduled_date' });

        if (error) {
          console.warn('[macallinService] Supabase lesson upsert error:', error.message);
        }
      } catch (err) {
        console.warn('[macallinService] Supabase lesson save exception:', err);
      }
    }

    return lesson;
  },

  /**
   * Intelligently calculates tomorrow's planned lesson based on the student's actual completed lesson.
   * Handles:
   *  - Scenario A: Student selects an entire surah -> next surah in full.
   *  - Scenario B: Student selects a specific number of ayahs (5, 10, etc.) -> next N ayahs, crossing surahs when reached.
   *  - Boundary protection and canonical 114 Surah sequencing.
   */
  calculateNextLesson(
    lesson: MacallinLesson,
    options?: {
      mode?: MacallinLesson['selection_mode'];
      ayahCount?: number;
    }
  ): NextLessonPlan {
    const curSurahMeta = ALL_114_SURAHS.find((s) => s.number === lesson.surah_number) || ALL_114_SURAHS[0];
    const totalAyahs = curSurahMeta.numberOfAyahs;
    const tomorrowDate = getLocalDateString(1);

    // Determine selection mode: explicit option > lesson.selection_mode > infer from bounds
    const isEntireSurah =
      options?.mode === 'entire_surah' ||
      lesson.selection_mode === 'entire_surah' ||
      (lesson.start_ayah === 1 && lesson.end_ayah === totalAyahs);

    const mode = isEntireSurah ? 'entire_surah' : (options?.mode || lesson.selection_mode || 'ayah_range');

    let nextSurah = lesson.surah_number;
    let nextStartAyah = 1;
    let nextEndAyah = 5;
    let assignedCount = 5;

    if (isEntireSurah) {
      // Scenario A: Student selected an entire surah!
      // Assign the next surah in the standard Mushaf curriculum
      nextSurah = lesson.surah_number < 114 ? lesson.surah_number + 1 : 1;
      const nextMeta = ALL_114_SURAHS.find((s) => s.number === nextSurah) || ALL_114_SURAHS[0];
      nextStartAyah = 1;
      nextEndAyah = nextMeta.numberOfAyahs;
      assignedCount = nextMeta.numberOfAyahs;
    } else {
      // Scenario B: Student selected a specific number of ayahs (e.g. 5, 10, or custom)
      const currentLessonSize = options?.ayahCount || lesson.assigned_ayahs_count || (lesson.end_ayah - lesson.start_ayah + 1);
      const targetSize = Math.max(1, currentLessonSize);

      if (lesson.end_ayah < totalAyahs) {
        // Preserve current surah until remaining ayahs are completed
        nextSurah = lesson.surah_number;
        nextStartAyah = lesson.end_ayah + 1;
        nextEndAyah = Math.min(nextStartAyah + targetSize - 1, totalAyahs);
        assignedCount = nextEndAyah - nextStartAyah + 1;
      } else {
        // Crosses surah boundary: continue from beginning of next surah in curriculum
        nextSurah = lesson.surah_number < 114 ? lesson.surah_number + 1 : 1;
        const nextMeta = ALL_114_SURAHS.find((s) => s.number === nextSurah) || ALL_114_SURAHS[0];
        nextStartAyah = 1;
        nextEndAyah = Math.min(targetSize, nextMeta.numberOfAyahs);
        assignedCount = nextEndAyah - nextStartAyah + 1;
      }
    }

    const nextSurahMeta = ALL_114_SURAHS.find((s) => s.number === nextSurah) || ALL_114_SURAHS[0];

    const messageSo = isEntireSurah
      ? `Berri waxaad akhrin doontaa Suuradda ${nextSurahMeta.englishName} (${nextSurahMeta.name}) oo buuxda (Aayadaha 1 - ${nextEndAyah}).`
      : `Berri waxaad akhrin doontaa Suuradda ${nextSurahMeta.englishName} (${nextSurahMeta.name}), Aayadaha ${nextStartAyah} ilaa ${nextEndAyah} (wadar ahaan ${assignedCount} aayadood).`;

    const messageEn = isEntireSurah
      ? `Tomorrow you are scheduled to recite the entire Surah ${nextSurahMeta.englishName} (${nextSurahMeta.name}) (Ayahs 1 to ${nextEndAyah}).`
      : `Tomorrow you are scheduled to recite Surah ${nextSurahMeta.englishName} (${nextSurahMeta.name}), Ayahs ${nextStartAyah} to ${nextEndAyah} (${assignedCount} ayahs).`;

    return {
      surah_number: nextSurah,
      surah_name: nextSurahMeta.englishName,
      surah_arabic_name: nextSurahMeta.name,
      start_ayah: nextStartAyah,
      end_ayah: nextEndAyah,
      assigned_ayahs_count: assignedCount,
      selection_mode: mode,
      scheduled_date: tomorrowDate,
      messageSo,
      messageEn,
    };
  },

  /**
   * Marks a lesson as completed, and automatically schedules the next day's lesson (Casharka Berri)
   * using smart curriculum calculation.
   */
  async markLessonCompletedAndScheduleTomorrow(
    lesson: MacallinLesson,
    mistakesCount: number = 0,
    options?: {
      mode?: MacallinLesson['selection_mode'];
      ayahCount?: number;
      accuracy?: number;
    }
  ): Promise<{ completedLesson: MacallinLesson; tomorrowLesson: MacallinLesson }> {
    const nextPlan = this.calculateNextLesson(lesson, options);

    const completedLesson: MacallinLesson = {
      ...lesson,
      status: 'completed',
      mistakes_count: mistakesCount,
      accuracy_percentage: options?.accuracy ?? (mistakesCount === 0 ? 100 : Math.max(0, 100 - mistakesCount * 10)),
      next_lesson_assignment: nextPlan,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveLesson(completedLesson);

    const tomorrowLesson: MacallinLesson = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lesson-${Date.now() + 1}`,
      user_id: lesson.user_id,
      surah_number: nextPlan.surah_number,
      surah_name: nextPlan.surah_name,
      surah_arabic_name: nextPlan.surah_arabic_name,
      start_ayah: nextPlan.start_ayah,
      end_ayah: nextPlan.end_ayah,
      assigned_ayahs_count: nextPlan.assigned_ayahs_count,
      selection_mode: nextPlan.selection_mode,
      scheduled_date: nextPlan.scheduled_date,
      status: 'pending',
      mistakes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveLesson(tomorrowLesson);

    return { completedLesson, tomorrowLesson };
  },

  /**
   * Retrieves tomorrow's assigned lesson (Casharka Berri)
   */
  async getTomorrowLesson(userId: string): Promise<MacallinLesson | null> {
    const all = await this.getAllLessons(userId);
    const tomorrow = getLocalDateString(1);
    return all.find((l) => l.scheduled_date === tomorrow) || null;
  },

  /**
   * Records a recitation attempt into Supabase and localStorage.
   */
  async recordRecitationAttempt(attempt: Omit<MacallinAttempt, 'id' | 'evaluated_at'>): Promise<MacallinAttempt> {
    const fullAttempt: MacallinAttempt = {
      ...attempt,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `attempt-${Date.now()}`,
      evaluated_at: new Date().toISOString(),
    };

    // Save locally
    const attempts = this.getLocalAttempts(attempt.user_id);
    attempts.unshift(fullAttempt);
    // Keep last 100 attempts in local storage
    if (attempts.length > 100) attempts.length = 100;
    this.saveLocalAttempts(attempt.user_id, attempts);

    // Save to Supabase if available
    if (isSupabaseConfigured && attempt.user_id && attempt.user_id !== 'guest_user') {
      try {
        await supabase.from('quran_macallin_attempts').insert({
          id: fullAttempt.id,
          user_id: fullAttempt.user_id,
          lesson_id: fullAttempt.lesson_id || null,
          surah_number: fullAttempt.surah_number,
          ayah_number: fullAttempt.ayah_number,
          transcript: fullAttempt.transcript || null,
          expected_text: fullAttempt.expected_text || null,
          accuracy_status: fullAttempt.accuracy_status,
          mistakes: fullAttempt.mistakes || [],
          evaluated_at: fullAttempt.evaluated_at,
        });
      } catch (err) {
        console.warn('[macallinService] Supabase attempt insert exception:', err);
      }
    }

    return fullAttempt;
  },

  /**
   * Generates a compact progress summary based on authentic records.
   */
  async getProgressSummary(userId: string): Promise<MacallinProgressSummary> {
    const lessons = await this.getAllLessons(userId);
    const attempts = this.getLocalAttempts(userId);

    const completed = lessons.filter((l) => l.status === 'completed');
    const today = getLocalDateString(0);
    const tomorrow = getLocalDateString(1);

    const activeLesson = lessons.find((l) => l.scheduled_date === today) || lessons[0];
    const tomorrowLesson = lessons.find((l) => l.scheduled_date === tomorrow);

    const mistakesCount = attempts.reduce((acc, a) => acc + (a.mistakes?.length || 0), 0);
    const hasPendingReview = lessons.some((l) => l.status === 'needs_review');

    return {
      total_completed_lessons: completed.length,
      current_assigned_surah: activeLesson ? activeLesson.surah_number : 1,
      current_assigned_surah_name: activeLesson ? activeLesson.surah_name : 'Al-Fatihah',
      current_passage_range: activeLesson ? `Aayadaha ${activeLesson.start_ayah} – ${activeLesson.end_ayah}` : 'Aayadaha 1 – 5',
      next_lesson_date: tomorrowLesson ? tomorrowLesson.scheduled_date : tomorrow,
      total_attempts_count: attempts.length,
      confirmed_mistakes_count: mistakesCount,
      has_pending_review: hasPendingReview,
    };
  },

  // ---------------------------------------------------------------------------
  // LocalStorage Helpers
  // ---------------------------------------------------------------------------
  getLocalLessons(userId: string): MacallinLesson[] {
    try {
      const raw = localStorage.getItem(`${MACALLIN_LESSONS_STORAGE_KEY}_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  saveLocalLessons(userId: string, lessons: MacallinLesson[]): void {
    try {
      localStorage.setItem(`${MACALLIN_LESSONS_STORAGE_KEY}_${userId}`, JSON.stringify(lessons));
    } catch {}
  },

  getLocalAttempts(userId: string): MacallinAttempt[] {
    try {
      const raw = localStorage.getItem(`${MACALLIN_ATTEMPTS_STORAGE_KEY}_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  saveLocalAttempts(userId: string, attempts: MacallinAttempt[]): void {
    try {
      localStorage.setItem(`${MACALLIN_ATTEMPTS_STORAGE_KEY}_${userId}`, JSON.stringify(attempts));
    } catch {}
  },
};
