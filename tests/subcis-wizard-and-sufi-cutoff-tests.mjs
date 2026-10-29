import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { getVerseTiming, isFullSurahReciter } from '../src/lib/verseTimingService.ts';
import { ALL_50_QARIS } from '../src/data/qarisData.ts';
import { ALL_114_SURAHS } from '../src/data/quranMetadata.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: SUBCIS STEP-BY-STEP SETUP & SUFI CUTOFF VERIFICATION TESTS');
console.log('========================================================================\n');

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
  const subcisPath = path.join(rootDir, 'src/components/quran/SubcisPractice.tsx');
  assert(fs.existsSync(subcisPath), 'SubcisPractice.tsx must exist');
  const subcisSource = fs.readFileSync(subcisPath, 'utf8');

  const quranPagePath = path.join(rootDir, 'src/pages/QuranPage.tsx');
  const quranPageSource = fs.readFileSync(quranPagePath, 'utf8');

  const quranNavPath = path.join(rootDir, 'src/components/quran/QuranBottomNavigation.tsx');
  const quranNavSource = fs.readFileSync(quranNavPath, 'utf8');

  // ===========================================================================
  // SECTION 1: VERSE TIMING SERVICE & SHEIKH CABDIRASHIID ALI SUFI TIMINGS
  // ===========================================================================
  console.log('--- Section 1: Verse Timing Service & Full-Surah Reciter Detection ---');

  await runTest('[1.1] isFullSurahReciter correctly identifies Sheikh Abdur-Rashid Ali Sufi and full-surah reciters', () => {
    const sufi = ALL_50_QARIS.find((q) => q.id === 'abdulrasheed-sufi');
    assert(sufi, 'Sheikh Abdur-Rashid Ali Sufi must exist in ALL_50_QARIS');
    assert.equal(isFullSurahReciter(sufi), true, 'Sheikh Abdur-Rashid Ali Sufi must be identified as full-surah reciter');

    const alafasy = ALL_50_QARIS.find((q) => q.id === 'alafasy');
    assert.equal(isFullSurahReciter(alafasy), false, 'Alafasy has verse audio, not full surah only');
  });

  await runTest('[1.2] Verified millisecond-accurate verse boundary timestamps for Surah Al-Fatihah (Sheikh Sufi)', () => {
    const t1 = getVerseTiming(1, 1, 7, undefined, undefined, 'abdulrasheed-sufi');
    assert.equal(t1.startTime, 0.0);
    assert.equal(t1.endTime, 5.8);
    assert.equal(t1.duration, 5.8);

    const t2 = getVerseTiming(1, 2, 7, undefined, undefined, 'abdulrasheed-sufi');
    assert.equal(t2.startTime, 5.8);
    assert.equal(t2.endTime, 11.8);

    const t3 = getVerseTiming(1, 3, 7, undefined, undefined, 'abdulrasheed-sufi');
    assert.equal(t3.startTime, 11.8);
    assert.equal(t3.endTime, 16.5);

    const t7 = getVerseTiming(1, 7, 7, undefined, undefined, 'abdulrasheed-sufi');
    assert.equal(t7.startTime, 34.2);
    assert.equal(t7.endTime, 43.2);
  });

  await runTest('[1.3] Dynamic proportional segment calculation for any of the 114 Surahs and full-surah reciters', () => {
    const versesText = [
      'قُلْ هُوَ اللَّهُ أَحَدٌ',
      'اللَّهُ الصَّمَدُ',
      'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    ];
    const tDynamic = getVerseTiming(112, 1, 4, versesText, 17.5, 'abdulrasheed-sufi');
    assert(tDynamic.startTime >= 0, 'Start time must be non-negative');
    assert(tDynamic.endTime > tDynamic.startTime, 'End time must be after start time');
    assert(tDynamic.duration >= 2.0, 'Duration must be at least minimum audible duration');
  });

  // ===========================================================================
  // SECTION 2: STEP-BY-STEP SETUP WIZARD IN SUBCIS
  // ===========================================================================
  console.log('\n--- Section 2: Step-by-Step Subcis Setup Wizard ---');

  await runTest('[2.1] Subcis defines 3-step setup wizard (surah -> reciter -> start)', () => {
    assert(
      subcisSource.includes("wizardStep === 'surah'") &&
      subcisSource.includes("wizardStep === 'reciter'") &&
      subcisSource.includes("wizardStep === 'start'"),
      'Must manage wizardStep state with surah, reciter, and start'
    );
  });

  await runTest('[2.2] Step 1 — Choose Surah (Dooro Suuradda) with searchable 114 surahs and filters', () => {
    assert(
      subcisSource.includes('Dooro Suuradda'),
      'Must display "Dooro Suuradda"'
    );
    assert(
      subcisSource.includes('filteredSurahs.map'),
      'Must render filtered 114 surahs grid'
    );
    assert(
      subcisSource.includes('surahCategoryFilter'),
      'Must provide category filters for popular surahs and Juz Amma'
    );
  });

  await runTest('[2.3] Step 2 — Choose Reciter (Dooro Qaariga) with authentic portraits & origin badges', () => {
    assert(
      subcisSource.includes('Dooro Qaariga kula subcinaya') || subcisSource.includes('Dooro Qaariga'),
      'Must display reciter selection step'
    );
    assert(
      subcisSource.includes('Somali Heritage') || subcisSource.includes('🇸🇴 Somalia'),
      'Must display authentic Somali origin badge'
    );
    assert(
      subcisSource.includes('abdulrasheed-sufi'),
      'Must prominently support Sheikh Abdur-Rashid Ali Sufi'
    );
  });

  await runTest('[2.4] Step 3 — Bilow Subciska review and launch canvas', () => {
    assert(
      subcisSource.includes('Bilow Subciska'),
      'Must display Step 3 Bilow Subciska review and launch canvas'
    );
    assert(
      subcisSource.includes('handleStartActiveSession'),
      'Must trigger active recitation session upon start'
    );
  });

  // ===========================================================================
  // SECTION 3: SHEIKH CABDIRASHIID ALI SUFI STRICT TURN ENFORCEMENT & CUTOFF
  // ===========================================================================
  console.log('\n--- Section 3: Sheikh Cabdirashiid Ali Sufi Continuous Playback Cutoff ---');

  await runTest('[3.1] Playback controller uses getVerseTiming and isFullSurahReciter for turn calculation', () => {
    assert(
      subcisSource.includes('isFullSurahReciter(activeQari)'),
      'Must check if activeQari is full-surah reciter'
    );
    assert(
      subcisSource.includes('getVerseTiming('),
      'Must retrieve precise verse start and end timestamps'
    );
  });

  await runTest('[3.2] Setup turn cutoff watcher programmatically pauses at verse end timestamp', () => {
    assert(
      subcisSource.includes('setupTurnCutoffWatcher'),
      'Must implement setupTurnCutoffWatcher'
    );
    assert(
      subcisSource.includes('audio.currentTime >= targetEndTime') ||
      subcisSource.includes('audio.currentTime >= timing.endTime'),
      'Must check current playback position against verse end cutoff'
    );
    assert(
      subcisSource.includes('audio.pause()'),
      'Must programmatically pause audio precisely at turn boundary'
    );
  });

  await runTest('[3.3] Strict Turn Enforcement: transitions to student turn and waits for student completion', () => {
    assert(
      subcisSource.includes('transitionToUserTurn(nextUserIndex)'),
      'Must cleanly transition to student turn after Qari finishes'
    );
    assert(
      subcisSource.includes('startUserRecording'),
      'Must activate microphone recording for student turn'
    );
  });

  // ===========================================================================
  // SECTION 4: COMPLETE REMOVAL OF MACALLIN AI
  // ===========================================================================
  console.log('\n--- Section 4: Complete Removal of Macallin AI ---');

  await runTest('[4.1] QuranPage CATEGORIES does not contain Macallin AI', () => {
    assert(
      !quranPageSource.includes("id: 'macallin'"),
      'CATEGORIES in QuranPage must not contain macallin'
    );
  });

  await runTest('[4.2] QuranPage does not render Tab 3 MacallinTeacher', () => {
    assert(
      !quranPageSource.includes('<MacallinTeacher'),
      'QuranPage must not render MacallinTeacher component'
    );
  });

  await runTest('[4.3] QuranBottomNavigation does not contain Macallin tab', () => {
    assert(
      !quranNavSource.includes("id: 'macallin'"),
      'QuranBottomNavigation must not contain macallin tab item'
    );
    assert(
      quranNavSource.includes("id: 'subcis'"),
      'QuranBottomNavigation must feature Subcis tab'
    );
  });

  console.log('\n========================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
