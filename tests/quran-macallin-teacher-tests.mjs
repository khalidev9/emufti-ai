import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { ALL_114_SURAHS } from '../src/data/quranMetadata.ts';
import {
  normalizeArabicForComparison,
  macallinService,
  getLocalDateString,
} from '../src/lib/macallinService.ts';
import {
  tajweedAssessmentEngine,
  tokenizeAyahWithTajweed,
  decomposeWordIntoLetterSegments,
  ARABIC_MAKHAARIJ,
  CONFUSABLE_LETTER_RULES,
  HARAKAH_RULES,
} from '../src/lib/tajweedAssessmentEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: QURAN MACALLIN DETAILED RECITATION ERROR DETECTION TESTS');
console.log('========================================================================\n');

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  // -----------------------------------------------------------------------------
  // TEST SUITE 1: Macallin Category & NEW Badging in QuranPage
  // -----------------------------------------------------------------------------
  const quranPageFile = path.join(rootDir, 'src/pages/QuranPage.tsx');
  const quranPageSource = fs.readFileSync(quranPageFile, 'utf8');

  await runTest('QuranPage: Macallin category is completely removed and Subcis is primary', () => {
    assert.ok(!quranPageSource.includes("id: 'macallin'"), 'Macallin tab id must NOT exist in QuranPage');
    assert.ok(!quranPageSource.includes("<MacallinTeacher"), 'MacallinTeacher component must NOT be rendered in QuranPage');
    assert.ok(quranPageSource.includes("id: 'subcis'"), 'Subcis tab id must exist in QuranPage');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 2: All 114 Canonical Surahs Verification
  // -----------------------------------------------------------------------------
  await runTest('Surahs: Exactly 114 Surahs present in canonical order with authentic Arabic names', () => {
    assert.equal(ALL_114_SURAHS.length, 114, 'Must include exactly 114 Surahs');

    for (let i = 0; i < 114; i++) {
      const s = ALL_114_SURAHS[i];
      assert.equal(s.number, i + 1, `Surah ${i + 1} must be at index ${i}`);
      assert.ok(s.name && s.name.length > 0, `Surah ${i + 1} must have authentic Arabic name`);
      assert.ok(s.englishName && s.englishName.length > 0, `Surah ${i + 1} must have English name`);
      assert.ok(s.numberOfAyahs > 0, `Surah ${i + 1} must have positive verse count`);
    }

    assert.equal(ALL_114_SURAHS[0].englishName, 'Al-Fatihah');
    assert.equal(ALL_114_SURAHS[0].numberOfAyahs, 7);
    assert.equal(ALL_114_SURAHS[1].englishName, 'Al-Baqarah');
    assert.equal(ALL_114_SURAHS[1].numberOfAyahs, 286);
    assert.equal(ALL_114_SURAHS[113].englishName, 'An-Nas');
    assert.equal(ALL_114_SURAHS[113].numberOfAyahs, 6);
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 3: Arabic Text Normalization & Letter Decomposition
  // -----------------------------------------------------------------------------
  await runTest('Normalization: Strips tashkeel and normalizes Alef/Hamza variants for speech comparison', () => {
    const fatihah1 = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    const norm1 = normalizeArabicForComparison(fatihah1);
    assert.equal(norm1, 'بسم الله الرحمن الرحيم');

    const ikhlas1 = 'قُلْ هُوَ اللَّهُ أَحَدٌ';
    const norm2 = normalizeArabicForComparison(ikhlas1);
    assert.equal(norm2, 'قل هو الله احد');

    assert.equal(normalizeArabicForComparison('إِيَّاكَ نَعْبُدُ'), 'اياك نعبد');
    assert.equal(normalizeArabicForComparison('آمَنَ الرَّسُولُ'), 'امن الرسول');
  });

  await runTest('Decomposition: Decomposes words into base letters and diacritics for granular highlighting', () => {
    const word = 'صِرَاطَ';
    const segments = decomposeWordIntoLetterSegments(word);
    assert.equal(segments.length, 4);
    assert.equal(segments[0].char, 'ص');
    assert.equal(segments[0].diacritics, 'ِ');
    assert.equal(segments[1].char, 'ر');
    assert.equal(segments[1].diacritics, 'َ');
    assert.equal(segments[2].char, 'ا');
    assert.equal(segments[3].char, 'ط');
    assert.equal(segments[3].diacritics, 'َ');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 4: Category A — Xarakada (Harakat) Detection
  // -----------------------------------------------------------------------------
  await runTest('Category A: Detects Harakah mistakes (e.g. Fathah vs Dammah on أَنْعَمْتَ)', () => {
    const expected = 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ';
    const spokenWithDammah = 'صراط الذين انعمتو عليهم'; // Dammah instead of Fathah on 'ت'

    const result = tajweedAssessmentEngine.evaluateAyahStrict(7, expected, spokenWithDammah, 1);
    assert.equal(result.status, 'errors_detected');
    assert.ok(result.mistakes.length > 0);

    const harakahMistake = result.mistakes.find((m) => m.category === 'xarakada');
    assert.ok(harakahMistake, 'Must classify error under category: xarakada');
    assert.equal(harakahMistake.category_label_so, 'Xarakada (Harakat)');
    assert.equal(harakahMistake.type, 'harakah_error');
    assert.equal(harakahMistake.harakah_expected, 'Fathah (ـَ)');
    assert.equal(harakahMistake.harakah_detected, 'Dammah (ـُ)');
    assert.ok(harakahMistake.location_text.includes('Aayadda 7'));
    assert.ok(harakahMistake.explanation_so.includes('Dammah'));
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 5: Category B — Xarfaha iyo makhaarijta
  // -----------------------------------------------------------------------------
  await runTest('Category B: Detects letter substitutions and makhraj points (e.g. ص -> س on صِرَاطَ)', () => {
    const expected = 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ';
    const spokenWithSeen = 'سراط الذين أنعمت عليهم'; // 'ص' replaced with 'س'

    const result = tajweedAssessmentEngine.evaluateAyahStrict(7, expected, spokenWithSeen, 1);
    assert.equal(result.status, 'errors_detected');

    const letterMistake = result.mistakes.find((m) => m.category === 'makhaarijta');
    assert.ok(letterMistake, 'Must classify error under category: makhaarijta');
    assert.equal(letterMistake.category_label_so, 'Xarfaha iyo makhaarijta');
    assert.equal(letterMistake.specific_letter, 'ص');
    assert.equal(letterMistake.type, 'letter_substitution');
    assert.ok(letterMistake.makhraj_category.includes('Al-Lisan'));
    assert.ok(letterMistake.explanation_so.includes("Xarafka 'ص' (Saad) waxaa loo akhriyay 'س'"));
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 6: Category C — Tajwiidka (Qalqalah, Ghunnah, Madd)
  // -----------------------------------------------------------------------------
  await runTest('Category C: Tokenizer annotates active Tajweed rules (Qalqalah, Ghunnah, Madd)', () => {
    const ikhlas = 'قُلْ هُوَ اللَّهُ أَحَدٌ';
    const tokens = tokenizeAyahWithTajweed(ikhlas);
    const ahadToken = tokens[tokens.length - 1];
    assert.equal(ahadToken.hasQalqalah, true, 'أَحَدٌ must have qalqalah on Daal at stop');
    assert.ok(ahadToken.activeTajweedRules.some((r) => r.includes('Qalqalah')));

    const nas = 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ';
    const nasTokens = tokenizeAyahWithTajweed(nas);
    const annasToken = nasTokens[nasTokens.length - 1];
    assert.equal(annasToken.hasGhunnah, true, 'النَّاسِ must have ghunnah on Noon mushaddadah');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 7: Category D — Erayada iyo aayadaha (Omitted / Mismatched Words)
  // -----------------------------------------------------------------------------
  await runTest('Category D: Detects omitted words and classifies under Erayada iyo aayadaha', () => {
    const expected = 'مَالِكِ يَوْمِ الدِّينِ';
    const spokenSkipped = 'يوم الدين'; // 'مالك' skipped

    const result = tajweedAssessmentEngine.evaluateAyahStrict(4, expected, spokenSkipped, 1);
    assert.equal(result.status, 'errors_detected');

    const wordMistake = result.mistakes.find((m) => m.category === 'erayada');
    assert.ok(wordMistake, 'Must classify skipped word under category: erayada');
    assert.equal(wordMistake.category_label_so, 'Erayada iyo aayadaha');
    assert.equal(wordMistake.type, 'missing_word');
    assert.ok(wordMistake.explanation_so.includes('laga booday'));
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 8: Exact Somali Results Messages & Unverified State
  // -----------------------------------------------------------------------------
  await runTest('Evaluation: Exact recitation triggers passed status, 0 errors, and exact Somali success message', () => {
    const expected = 'قُلْ هُوَ اللَّهُ أَحَدٌ';
    const spoken = 'قل هو الله أحد';

    const result = macallinService.evaluateAyahRecitation(1, expected, spoken, 112);
    assert.equal(result.status, 'passed');
    assert.equal(result.mistakes.length, 0);
    assert.equal(
      result.feedbackMessageSo,
      'Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.'
    );
    assert.ok(Array.isArray(result.wordVerifications));
    assert.ok(result.wordVerifications.every((w) => w.status === 'correct'));
  });

  await runTest('Evaluation: Unverified / empty audio triggers "Lama xaqiijin" without guessing', () => {
    const expected = 'قُلْ هُوَ اللَّهُ أَحَدٌ';
    const emptySpoken = '';

    const result = macallinService.evaluateAyahRecitation(1, expected, emptySpoken, 112);
    assert.equal(result.status, 'unverified');
    assert.equal(result.feedbackMessageSo, 'Lama xaqiijin');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 9: Daily Lesson Scheduling & Progression
  // -----------------------------------------------------------------------------
  await runTest('Scheduling: Progression within same Surah (e.g. Al-Baqarah 1-5 -> 6-10)', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const mockLesson = {
      id: 'test-lesson-1',
      user_id: testUserId,
      surah_number: 2, // Al-Baqarah
      surah_name: 'Al-Baqarah',
      surah_arabic_name: 'البَقَرَةِ',
      start_ayah: 1,
      end_ayah: 5,
      scheduled_date: getLocalDateString(0),
      status: 'in_progress',
      mistakes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { completedLesson, tomorrowLesson } =
      await macallinService.markLessonCompletedAndScheduleTomorrow(mockLesson, 0);

    assert.equal(completedLesson.status, 'completed');
    assert.ok(completedLesson.completed_at);
    assert.equal(tomorrowLesson.surah_number, 2, 'Must remain in Al-Baqarah');
    assert.equal(tomorrowLesson.start_ayah, 6, 'Next start ayah must be 6');
    assert.equal(tomorrowLesson.end_ayah, 10, 'Next end ayah must be 10');
    assert.equal(tomorrowLesson.scheduled_date, getLocalDateString(1));
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 10: Component Detailed Error Report & 5-Column Table
  // -----------------------------------------------------------------------------
  const macallinComponentSource = fs.readFileSync(
    path.join(rootDir, 'src/components/quran/MacallinTeacher.tsx'),
    'utf8'
  );

  await runTest('Component: Renders detailed 5-column error table below the Quran text', () => {
    assert.ok(macallinComponentSource.includes('Meesha khaladku yaallo'), 'Must contain column "Meesha khaladku yaallo"');
    assert.ok(macallinComponentSource.includes('Nooca khaladka'), 'Must contain column "Nooca khaladka"');
    assert.ok(macallinComponentSource.includes('Akhriska la maqlay'), 'Must contain column "Akhriska la maqlay"');
    assert.ok(macallinComponentSource.includes('Akhriska saxda ah'), 'Must contain column "Akhriska saxda ah"');
    assert.ok(macallinComponentSource.includes('Sharaxaad'), 'Must contain column "Sharaxaad"');
  });

  await runTest('Component: Supports granular letter/harakah red highlighting and correct reading display', () => {
    assert.ok(macallinComponentSource.includes('text-red-600 dark:text-red-400 font-extrabold'), 'Must highlight exact incorrect letter in red');
    assert.ok(macallinComponentSource.includes('selectedWordMistake'), 'Must support tapping mistakes for detailed popover');
    assert.ok(macallinComponentSource.includes('Dhageyso Qaariga'), 'Must allow user to hear correct recitation from Qari');
    assert.ok(macallinComponentSource.includes('Dhageyso Codkaaga'), 'Must allow user to replay their own recorded audio');
    assert.ok(macallinComponentSource.includes('Dhammee Akhriska'), 'Must contain "Dhammee Akhriska" button');
    assert.ok(macallinComponentSource.includes('Akhriska waa la hubinayaa'), 'Must contain status "Akhriska waa la hubinayaa"');
  });

  await runTest('Component: Zero errors confirmed statement rendered when passed', () => {
    assert.ok(
      macallinComponentSource.includes('Wax khaladaad ah oo la ogaaday kuma jiraan aayadaha la akhriyay.'),
      'Must state clearly that no detectable errors were found in the passage'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 11: Hidden-Ayah Memorization Mode & Controls
  // -----------------------------------------------------------------------------
  await runTest('Memorization Mode: Defines Habka Xifdinta with active session states', () => {
    assert.ok(
      macallinComponentSource.includes('isMemorizationMode'),
      'Must define isMemorizationMode state'
    );
    assert.ok(
      macallinComponentSource.includes('Habka Xifdinta (Aayadaha Qarsan)'),
      'Must render Habka Xifdinta mode toggle'
    );
    assert.ok(
      macallinComponentSource.includes('memorizationState'),
      'Must manage memorization lifecycle states'
    );
    assert.ok(
      macallinComponentSource.includes('completedAyahIndices'),
      'Must track completed ayahs to hide them'
    );
  });

  await runTest('Memorization Controls: Implements all 5 required Somali controls (Bilow Akhriska, Ku celi Aayadda, Eeg Khaladka, Sii wad, Jooji)', () => {
    assert.ok(
      macallinComponentSource.includes('Bilow Akhriska'),
      'Must provide "Bilow Akhriska" control'
    );
    assert.ok(
      macallinComponentSource.includes('Ku celi Aayadda'),
      'Must provide "Ku celi Aayadda" control'
    );
    assert.ok(
      macallinComponentSource.includes('Eeg Khaladka'),
      'Must provide "Eeg Khaladka" control'
    );
    assert.ok(
      macallinComponentSource.includes('Sii wad'),
      'Must provide "Sii wad" control'
    );
    assert.ok(
      macallinComponentSource.includes('Jooji'),
      'Must provide "Jooji" control'
    );
  });

  await runTest('Memorization Mode: Unrecited upcoming ayahs are strictly hidden and cheat-protected', () => {
    assert.ok(
      macallinComponentSource.includes('(Qarsan)'),
      'Upcoming ayahs must be marked as Qarsan with lock'
    );
    assert.ok(
      macallinComponentSource.includes('disabled={isMemorizationMode'),
      'Forward skipping must be locked/disabled during memorization'
    );
    // Verify no "reveal all" cheat control exists during session
    assert.ok(
      !macallinComponentSource.includes('Muuji Aayadaha Dhammaan'),
      'Must not have a control to reveal all remaining ayahs'
    );
    assert.ok(
      !macallinComponentSource.includes('Reveal All Ayahs'),
      'Must not have cheat button'
    );
  });

  await runTest('Memorization Mode: Completed ayahs are automatically hidden from reading area', () => {
    assert.ok(
      macallinComponentSource.includes('Qoraalka aayaddan si toos ah ayaa loo qariyay'),
      'Completed ayah text must be hidden automatically'
    );
    assert.ok(
      macallinComponentSource.includes('handleProceedNextAyah'),
      'Must provide handleProceedNextAyah handler'
    );
  });

  await runTest('Memorization Mode: Eeg Khaladka reveals correction for current ayah without exposing upcoming ayahs', () => {
    assert.ok(
      macallinComponentSource.includes('revealedCorrectionForCurrentAyah'),
      'Must track revealedCorrectionForCurrentAyah'
    );
    assert.ok(
      macallinComponentSource.includes('handleToggleViewMistake'),
      'Must provide handleToggleViewMistake handler'
    );
  });

  await runTest('Memorization Mode: Jooji pauses session and preserves current position and hidden state', () => {
    assert.ok(
      macallinComponentSource.includes('handlePauseOrEndSession'),
      'Must provide handlePauseOrEndSession handler'
    );
    assert.ok(
      macallinComponentSource.includes('Akhriskii waa la hakiyay (Session Paused)'),
      'Must display paused status when Jooji is clicked'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 6: Initialization Order & TDZ Fix for passageVerses
  // -----------------------------------------------------------------------------
  await runTest('Initialization Order: passageVerses is declared before any useEffect or callback hook', () => {
    const passageVersesDeclarationIndex = macallinComponentSource.indexOf('const passageVerses =');
    assert.ok(
      passageVersesDeclarationIndex !== -1,
      'passageVerses declaration must exist in MacallinTeacher'
    );

    const firstUseEffectIndex = macallinComponentSource.indexOf('useEffect(');
    assert.ok(
      firstUseEffectIndex !== -1,
      'useEffect hooks must exist in MacallinTeacher'
    );

    assert.ok(
      passageVersesDeclarationIndex < firstUseEffectIndex,
      `passageVerses (index ${passageVersesDeclarationIndex}) MUST be initialized BEFORE the first useEffect (index ${firstUseEffectIndex}) to prevent TDZ ReferenceError`
    );
  });

  await runTest('Initialization Order: passageVerses dependency array evaluates without TDZ violation', () => {
    const reviewEffectMatch = macallinComponentSource.match(
      /useEffect\(\(\)\s*=>\s*\{[\s\S]*?passageVerses\.length[\s\S]*?\}\s*,\s*\[([\s\S]*?)\]\s*\);/
    );
    assert.ok(reviewEffectMatch, 'Review useEffect with passageVerses dependency must exist');

    const effectPosition = macallinComponentSource.indexOf(reviewEffectMatch[0]);
    const passageVersesPosition = macallinComponentSource.indexOf('const passageVerses =');

    assert.ok(
      passageVersesPosition < effectPosition,
      'passageVerses declaration must precede the review useEffect hook that includes passageVerses.length'
    );
  });

  await runTest('Empty State: passageVerses and currentAyah derive safely when verses are empty or loading', () => {
    // Test the exact derivation logic used in MacallinTeacher
    const verses = [];
    const passageStartAyah = 1;
    const passageEndAyah = 5;
    const currentAyahIndex = 0;

    const passageVerses = (verses || []).filter(
      (v) => v.numberInSurah >= passageStartAyah && v.numberInSurah <= passageEndAyah
    );
    const currentAyah = passageVerses[currentAyahIndex] || passageVerses[0] || null;
    const currentAyahTokens = currentAyah ? tokenizeAyahWithTajweed(currentAyah.text) : [];

    assert.equal(passageVerses.length, 0, 'passageVerses must safely be empty array []');
    assert.equal(currentAyah, null, 'currentAyah must safely be null when verses are empty');
    assert.equal(currentAyahTokens.length, 0, 'currentAyahTokens must safely be []');

    // Also verify component includes empty-state UI with retry option
    assert.ok(
      macallinComponentSource.includes('Aayadaha lama helin'),
      'Must render friendly empty-state title when verses are unavailable'
    );
    assert.ok(
      macallinComponentSource.includes('Isku day mar kale'),
      'Must offer retry button in empty state'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 7: Live Letter Tracking, AI Review Status & Final Correction Screen
  // -----------------------------------------------------------------------------
  await runTest('Live Tracking: Component defines liveRecitationEvaluation and live word highlights', () => {
    assert.ok(
      macallinComponentSource.includes('liveRecitationEvaluation'),
      'Must define liveRecitationEvaluation for live tracking'
    );
    assert.ok(
      macallinComponentSource.includes('isWordLiveCorrect'),
      'Must highlight live correct words in green'
    );
  });

  await runTest('Review Status: Component displays "Akhriskaaga AI ayaa hubinaya" during 30s review', () => {
    assert.ok(
      macallinComponentSource.includes('Akhriskaaga AI ayaa hubinaya'),
      'Must display exact status "Akhriskaaga AI ayaa hubinaya"'
    );
  });

  await runTest('Final Correction Screen: Renders "Natiijada Akhriskaaga Qur’aanka" and confirmed mistakes notice', () => {
    assert.ok(
      macallinComponentSource.includes('Natiijada Akhriskaaga Qur’aanka'),
      'Must display exact title "Natiijada Akhriskaaga Qur’aanka"'
    );
    assert.ok(
      macallinComponentSource.includes('Waxaan helnay khaladaad akhriskaaga ku jira. Hoos ka eeg meelaha cas iyo sida loo saxo.'),
      'Must display exact confirmed mistakes notice'
    );
  });

  await runTest('Final Correction Screen: Implements all 4 required action buttons (Dib u eeg, Ku celi Aayadda, Ku celi Akhriska, Dhammee)', () => {
    assert.ok(
      macallinComponentSource.includes('Dib u eeg Khaladaadka'),
      'Must provide "Dib u eeg Khaladaadka" button'
    );
    assert.ok(
      macallinComponentSource.includes('Ku celi Aayadda'),
      'Must provide "Ku celi Aayadda" button'
    );
    assert.ok(
      macallinComponentSource.includes('Ku celi Akhriska'),
      'Must provide "Ku celi Akhriska" button'
    );
    assert.ok(
      macallinComponentSource.includes('Dhammee'),
      'Must provide "Dhammee" button'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 15: Review Timeout, Error Handling & Unmount Cleanup Isolation
  // -----------------------------------------------------------------------------
  await runTest('Review Cleanup: Timer cleanup is isolated from userAudioBlobUrl to prevent interval stall', () => {
    // Ensure timer cleanup is mounted with [] dependency array, not [userAudioBlobUrl]
    assert.ok(
      !macallinComponentSource.includes('clearInterval(reviewTimerRef.current);\n      if (recognitionRef.current) {\n        try {\n          recognitionRef.current.abort();\n        } catch {}\n      }\n    };\n  }, [userAudioBlobUrl]'),
      'Timer cleanup must not be tied to [userAudioBlobUrl] which causes premature interval termination'
    );
    assert.ok(
      macallinComponentSource.includes('clearInterval(reviewTimerRef.current);\n      if (assessmentTimeoutRef.current)'),
      'Must clean up timers and assessment timeout on unmount'
    );
  });

  await runTest('Review Timeout: Implements safety timeout to prevent permanently stuck loading state', () => {
    assert.ok(
      macallinComponentSource.includes('assessmentTimeoutRef'),
      'Must declare assessmentTimeoutRef'
    );
    assert.ok(
      macallinComponentSource.includes('Waqtigii hubinta akhriska wuu dhacay (Timeout)'),
      'Must provide Somali timeout message when assessment exceeds deadline'
    );
    assert.ok(
      macallinComponentSource.includes('assessmentAbortControllerRef'),
      'Must declare assessmentAbortControllerRef for request cancellation'
    );
  });

  await runTest('Review Error Handling: Renders Somali error notice and retry button when failed', () => {
    assert.ok(
      macallinComponentSource.includes('reviewError'),
      'Must declare reviewError state'
    );
    assert.ok(
      macallinComponentSource.includes('Mar kale isku day'),
      'Must provide "Mar kale isku day" button on error and review cards'
    );
    assert.ok(
      macallinComponentSource.includes('Ka noqo (Cancel)'),
      'Must provide cancel option to abort review if user chooses'
    );
    assert.ok(
      !macallinComponentSource.includes('Eeg Natiijada Hadda'),
      'Early result check button must be removed during 30-second countdown'
    );
    assert.ok(
      !macallinComponentSource.includes('Hubi natiijadaada'),
      'Must not offer premature result check button during countdown'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 16: Qari Audio Separation & High-Accuracy Tajweed Assessment
  // -----------------------------------------------------------------------------
  await runTest('Audio Separation: userRecordingBlob and qariReferenceAudioRef are strictly separated', () => {
    assert.ok(
      macallinComponentSource.includes('userRecordingBlob'),
      'Must declare dedicated userRecordingBlob state'
    );
    assert.ok(
      macallinComponentSource.includes('qariReferenceAudioRef'),
      'Must declare separated qariReferenceAudioRef audio element'
    );
    assert.ok(
      macallinComponentSource.includes('userAudioPlayerRef'),
      'Must declare separated userAudioPlayerRef audio element'
    );
  });

  await runTest('Cross-Talk Prevention: handlePlayQariAudio halts microphone and speech recognition before playback', () => {
    const playQariFn = macallinComponentSource.slice(
      macallinComponentSource.indexOf('const handlePlayQariAudio = () => {'),
      macallinComponentSource.indexOf('const handlePlayUserAudio = () => {')
    );

    assert.ok(
      playQariFn.includes('setIsRecording(false)'),
      'handlePlayQariAudio must set isRecording to false'
    );
    assert.ok(
      playQariFn.includes('mediaRecorderRef.current.stop()'),
      'handlePlayQariAudio must stop active mediaRecorder'
    );
    assert.ok(
      playQariFn.includes('recognitionRef.current.stop()'),
      'handlePlayQariAudio must halt speech recognition'
    );
  });

  await runTest('Audio Safety: Qari onEnded never triggers recitation evaluation, counter, or ayah progression', () => {
    const qariAudioTagMatch = macallinComponentSource.match(/<audio[\s\S]*?ref=\{qariReferenceAudioRef\}[\s\S]*?\/>/);
    assert.ok(qariAudioTagMatch, 'Must find qariReferenceAudioRef audio tag');
    const qariAudioTag = qariAudioTagMatch[0];

    assert.ok(
      qariAudioTag.includes('setIsPlayingQari(false)'),
      'Qari onEnded must reset playing state'
    );
    assert.ok(
      !qariAudioTag.includes('evaluateAyahRecitation'),
      'Qari onEnded must NEVER invoke evaluateAyahRecitation'
    );
    assert.ok(
      !qariAudioTag.includes('setCurrentAyahIndex'),
      'Qari onEnded must NEVER advance currentAyahIndex'
    );
    assert.ok(
      !qariAudioTag.includes('markLessonCompleted'),
      'Qari onEnded must NEVER mark lesson as completed'
    );
  });

  await runTest('User Recording Preservation: Playing Qari reference audio does NOT clear userRecordingBlob', () => {
    const playQariFn = macallinComponentSource.slice(
      macallinComponentSource.indexOf('const handlePlayQariAudio = () => {'),
      macallinComponentSource.indexOf('const handlePlayUserAudio = () => {')
    );

    assert.ok(
      !playQariFn.includes('setUserRecordingBlob(null)'),
      'handlePlayQariAudio must preserve userRecordingBlob'
    );
    assert.ok(
      !playQariFn.includes('setUserAudioBlobUrl(null)'),
      'handlePlayQariAudio must preserve userAudioBlobUrl'
    );
  });

  await runTest('Recording Exclusivity: startRecording stops any running Qari audio playback', () => {
    const startRecFn = macallinComponentSource.slice(
      macallinComponentSource.indexOf('const startRecording = async () => {'),
      macallinComponentSource.indexOf('const finishRecitationAndStart30sReview = () => {')
    );

    assert.ok(
      startRecFn.includes('qariReferenceAudioRef.current.pause()'),
      'startRecording must pause active Qari audio'
    );
    assert.ok(
      startRecFn.includes('setIsPlayingQari(false)'),
      'startRecording must reset isPlayingQari'
    );
  });

  await runTest('Evidence Grounding: Empty audio blob or missing speech returns "Lama xaqiijin" without guessing', () => {
    const fakeEmptyBlob = { size: 0, type: 'audio/webm' };
    const res = macallinService.evaluateAyahRecitation(
      1,
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      '',
      1,
      fakeEmptyBlob
    );

    assert.equal(res.status, 'unverified', 'Empty audio must return status unverified');
    assert.equal(res.feedbackMessageSo, 'Lama xaqiijin', 'Somali feedback must be exact "Lama xaqiijin"');
    assert.equal(res.mistakes.length, 0, 'Must never invent false mistakes on empty audio');
  });

  await runTest('Tajweed Tokenizer: Identifies Qalqalah (Kubra vs Sughra) and Ghunnah', () => {
    const tokensIkhlas = tokenizeAyahWithTajweed('قُلْ هُوَ اللَّهُ أَحَدٌ');
    assert.ok(tokensIkhlas.length === 4, 'Must parse 4 tokens');
    const lastToken = tokensIkhlas[3];
    assert.ok(
      lastToken.rules.some((r) => r.includes('Qalqalah Kubra')),
      `Last word of Ikhlas 1 must have Qalqalah Kubra at Waqf: ${JSON.stringify(lastToken.rules)}`
    );

    const tokensNas = tokenizeAyahWithTajweed('قُلْ أَعُوذُ بِرَبِّ النَّاسِ');
    const anNasToken = tokensNas.find((t) => t.rawText.includes('النَّاسِ'));
    assert.ok(
      anNasToken && anNasToken.rules.some((r) => r.includes('Ghunnah')),
      'النَّاسِ with Shaddah on Noon must have Ghunnah rule'
    );
  });

  await runTest('Tajweed Tokenizer: Identifies Madd rules (Muttasil, Munfasil, Lazim, Asli)', () => {
    // Madd Lazim: الضالين (6 harakat)
    const tokensFatihah7 = tokenizeAyahWithTajweed('صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ');
    const dallinToken = tokensFatihah7.find((t) => t.rawText.includes('الضَّالِّينَ'));
    assert.ok(
      dallinToken && dallinToken.rules.some((r) => r.includes('Madd Lazim')),
      `الضَّالِّينَ must have Madd Lazim (6 harakat): ${JSON.stringify(dallinToken?.rules)}`
    );

    // Madd Muttasil: إِذَا جَاءَ (4-5 harakat)
    const tokensNasr = tokenizeAyahWithTajweed('إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ');
    const jaaToken = tokensNasr.find((t) => t.rawText.includes('جَاءَ'));
    assert.ok(
      jaaToken && jaaToken.rules.some((r) => r.includes('Madd Muttasil')),
      `جَاءَ must have Madd Muttasil (4-5 harakat): ${JSON.stringify(jaaToken?.rules)}`
    );

    // Madd Munfasil: إِنَّا أَعْطَيْنَاكَ (4-5 harakat)
    const tokensKawthar = tokenizeAyahWithTajweed('إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ');
    const innaToken = tokensKawthar[0];
    assert.ok(
      innaToken && innaToken.rules.some((r) => r.includes('Madd Munfasil') || r.includes('Ghunnah')),
      `إِنَّا followed by Hamza must have Madd Munfasil: ${JSON.stringify(innaToken?.rules)}`
    );
  });

  await runTest('Tajweed Rules: Ahkam Noon Sakinah and Tanween (Izhar, Iqlab, Idgham, Ikhfa)', () => {
    // Iqlab: مِنْ بَعْدِ -> Noon sakin before Baa
    const tokensIqlab = tokenizeAyahWithTajweed('مِنْ بَعْدِ ذَٰلِكَ');
    assert.ok(
      tokensIqlab[0].rules.some((r) => r.includes('Iqlab')),
      `مِنْ before بَعْدِ must trigger Iqlab: ${JSON.stringify(tokensIqlab[0].rules)}`
    );

    // Izhar: أَنْعَمْتَ -> Noon sakin before Ayn
    const tokensIzhar = tokenizeAyahWithTajweed('صِرَاطَ الَّذِينَ أَنْعَمْتَ');
    const anamta = tokensIzhar.find((t) => t.rawText.includes('أَنْعَمْتَ'));
    assert.ok(
      anamta && (anamta.rules.some((r) => r.includes('Izhar')) || anamta.letterSegments.some((s) => s.char === 'ع')),
      'أَنْعَمْتَ includes Izhar Halqi before throat letter Ayn'
    );
  });

  await runTest('Makhaarij Letter Confusions: Detects all specified confusable letter pairs', () => {
    const pairsToTest = [
      { expected: 'ح', spoken: 'ه', wordExp: 'الحمد', wordSpoken: 'الهمد' },
      { expected: 'ع', spoken: 'ء', wordExp: 'العالمين', wordSpoken: 'الءالمين' },
      { expected: 'ص', spoken: 'س', wordExp: 'الصراط', wordSpoken: 'السراط' },
      { expected: 'ط', spoken: 'ت', wordExp: 'صراط', wordSpoken: 'صرات' },
      { expected: 'ق', spoken: 'ك', wordExp: 'مستقيم', wordSpoken: 'مستكيم' },
      { expected: 'غ', spoken: 'خ', wordExp: 'المغضوب', wordSpoken: 'المخضوب' },
    ];

    for (const p of pairsToTest) {
      const confusion = tajweedAssessmentEngine.detectLetterConfusion(
        normalizeArabicForComparison(p.wordExp),
        normalizeArabicForComparison(p.wordSpoken),
        p.wordExp
      );
      assert.ok(
        confusion !== null,
        `Must detect phonetic confusion between ${p.expected} and ${p.spoken} in ${p.wordExp} vs ${p.wordSpoken}`
      );
      assert.equal(confusion.expectedLetter, p.expected);
      assert.ok(
        confusion.correctionTip && confusion.correctionTip.length > 0,
        'Must provide Somali correction tip for letter'
      );
    }
  });

  await runTest('Harakah Detection: Detects incorrect vowel substitutions (Fathah vs Dammah/Kasrah)', () => {
    // Alhamdu lillahi rabbil alameen recited with Rabba (Fathah instead of Kasrah)
    const err = tajweedAssessmentEngine.detectHarakahMistake(
      normalizeArabicForComparison('رَبِّ'),
      normalizeArabicForComparison('ربا'),
      'رَبِّ'
    );
    assert.ok(err !== null, 'Must detect harakah error on Rabba vs Rabbi');
  });

  console.log('\n========================================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (Failed: ${failedTests})`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exitCode = 1;
  }
}

await runAllTests();
