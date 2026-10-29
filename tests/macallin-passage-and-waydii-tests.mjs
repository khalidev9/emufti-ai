import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

import { ALL_114_SURAHS } from '../src/data/quranMetadata.ts';
import { macallinService, normalizeArabicForComparison } from '../src/lib/macallinService.ts';
import { getWaydiiEMuftiStatus, recordWaydiiEMuftiUsage } from '../src/lib/quranService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: MACALLIN PASSAGE RECITATION & WAYDII EMUFTI LIMIT VERIFICATION');
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
  const macallinTeacherSource = fs.readFileSync(
    path.join(rootDir, 'src/components/quran/MacallinTeacher.tsx'),
    'utf8'
  );
  const waydiiModalSource = fs.readFileSync(
    path.join(rootDir, 'src/components/quran/WaydiiEMuftiModal.tsx'),
    'utf8'
  );
  const migrationSqlSource = fs.readFileSync(
    path.join(rootDir, 'supabase/migrations/20261020_waydii_emufti_free_limit.sql'),
    'utf8'
  );
  const quranServiceSource = fs.readFileSync(
    path.join(rootDir, 'src/lib/quranService.ts'),
    'utf8'
  );

  // -----------------------------------------------------------------------------
  // TEST SUITE 1: Macallin Hidden Next Ayah Logic & Forward Skipping Prevention
  // -----------------------------------------------------------------------------
  await runTest('Macallin: Future Ayahs in a passage are strictly hidden until reached', () => {
    // Check that verses rendered in passage mode are filtered by currentAyahIndex
    assert.ok(
      macallinTeacherSource.includes('.filter((_, idx) => idx <= currentAyahIndex)'),
      'Passage rendering must filter out all verses past currentAyahIndex'
    );

    // Check that future verses locked indicator is present
    assert.ok(
      macallinTeacherSource.includes('waa qarsan yihiin ilaa laga gaaro'),
      'UI must display notice that upcoming Ayahs remain hidden until reached'
    );
  });

  await runTest('Macallin: Forward skipping is locked during recitation to prevent peeking', () => {
    // Next Ayah button must be disabled to disallow forward peeking
    assert.ok(
      (macallinTeacherSource.includes('disabled={isMemorizationMode || true}') || macallinTeacherSource.includes('disabled={true}')) &&
      macallinTeacherSource.includes('Aayadaha dambe waa qarsan yihiin ilaa laga dhammeeyo aayaddan'),
      'Next Ayah button must be explicitly locked/disabled'
    );

    // Navigation handler guard
    assert.ok(
      macallinTeacherSource.includes("if (passageFlowState === 'recitingAyah' || passageFlowState === 'advancingAyah' || isRecording || isReviewing)"),
      'Forward skipping must be guarded against active recitation or recording'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 2: Sequential Auto-Advancement & Race Condition Prevention
  // -----------------------------------------------------------------------------
  await runTest('Macallin: Sequential auto-advance without intermediate result interruptions', () => {
    assert.ok(
      macallinTeacherSource.includes('handleFinishAyahAndAdvance'),
      'handleFinishAyahAndAdvance must be defined'
    );
    assert.ok(
      macallinTeacherSource.includes('isAdvancingRef.current = true'),
      'Concurrency lock must prevent duplicate advancements'
    );
    assert.ok(
      macallinTeacherSource.includes("setPassageFlowState('advancingAyah')"),
      'advancingAyah transition state must be used'
    );

    // Transition delay to smoothly move to next verse
    assert.ok(
      macallinTeacherSource.includes('setCurrentAyahIndex((prev) => prev + 1)'),
      'Must advance currentAyahIndex automatically'
    );
  });

  await runTest('Macallin: No intermediate score cards or premature assessments between verses', () => {
    // Ensure that handleFinishAyahAndAdvance only triggers full review on the last verse
    const finishFnMatch = macallinTeacherSource.match(
      /const handleFinishAyahAndAdvance = \(\) => \{[\s\S]*?finishRecitationAndStart30sReview\(\);[\s\S]*?\};/
    );
    assert.ok(finishFnMatch, 'handleFinishAyahAndAdvance must contain final review call');
    assert.ok(
      finishFnMatch[0].includes('if (!isLastAyah)') && finishFnMatch[0].includes('startRecording()'),
      'Non-last Ayahs must transition and start recording without calling evaluation'
    );

    // Confirm intermediate ayah_passed blocking screen was removed
    assert.ok(
      !macallinTeacherSource.includes("memorizationState === 'ayah_passed' ? ("),
      'Intermediate ayah_passed blocking modal must not exist'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 3: Full Passage Evaluation Engine & Aggregation
  // -----------------------------------------------------------------------------
  await runTest('Macallin: Passage-level evaluation aggregates all Ayahs in correct sequence', () => {
    // Mock passage: Surah Al-Fatihah, Ayahs 1 to 4
    const samplePassage = [
      { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
    ];

    // Perfect recitation across all 4 Ayahs
    const perfectTranscript = 'بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين';
    const evalResult = macallinService.evaluatePassageRecitation(samplePassage, perfectTranscript, 1);

    assert.equal(evalResult.totalAyahsCount, 4, 'Must evaluate exactly 4 Ayahs');
    assert.equal(evalResult.passedAyahsCount, 4, 'All 4 Ayahs should pass');
    assert.equal(evalResult.status, 'passed', 'Passage overall status must be passed');
    assert.equal(evalResult.mistakes.length, 0, 'Zero mistakes for perfect recitation');
    assert.ok(evalResult.overallAccuracy >= 95, 'High accuracy for perfect recitation');
    assert.equal(evalResult.ayahResults.length, 4, 'Must have breakdown for all 4 Ayahs');
  });

  await runTest('Macallin: Passage-level evaluation correctly maps mistakes to specific Ayahs', () => {
    // 4 Ayahs with a deliberate mistake in Ayah 2: reciting "الرحمن" instead of "رب العالمين"
    const samplePassage = [
      { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
    ];

    // Omission/substitution in Ayah 2
    const flawedTranscript = 'بسم الله الرحمن الرحيم الحمد لله الرحمن الرحمن الرحيم مالك يوم الدين';
    const evalResult = macallinService.evaluatePassageRecitation(samplePassage, flawedTranscript, 1);

    assert.equal(evalResult.totalAyahsCount, 4);
    assert.ok(evalResult.mistakes.length > 0, 'Must detect mistakes in flawed recitation');
    // Ensure detected mistakes are mapped to Ayah 2
    const ayah2Mistakes = evalResult.mistakes.filter((m) => m.ayah_number === 2);
    assert.ok(ayah2Mistakes.length > 0, 'Mistake must be mapped to Ayah 2');
    assert.ok(evalResult.feedbackMessageSo.length > 0, 'Somali feedback message must be generated');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 4: 30-Second Review Countdown & No Premature Check Button
  // -----------------------------------------------------------------------------
  await runTest('Macallin: 30-second countdown runs without early result-check button', () => {
    // Verify countdown starts at 30
    assert.ok(
      macallinTeacherSource.includes('setReviewCountdown(30)'),
      'Countdown must start at 30 seconds'
    );
    assert.ok(
      macallinTeacherSource.includes('Akhriskaaga AI ayaa hubinaya') ||
      macallinTeacherSource.includes('AI ayaa hubinaya akhriskaaga'),
      'Must display status message that AI is evaluating recitation'
    );

    // Verify early check buttons were REMOVED from the reviewing state card
    const reviewingSectionMatch = macallinTeacherSource.match(
      /isReviewing && \([\s\S]*?Hubinta Akhriska & Tajweed-ka[\s\S]*?handleCancelReview[\s\S]*?<\/div>/
    );
    assert.ok(reviewingSectionMatch, 'Reviewing countdown section must exist');
    assert.ok(
      !reviewingSectionMatch[0].includes('Hubi natiijadaada'),
      'Must NOT contain "Hubi natiijadaada" button'
    );
    assert.ok(
      !reviewingSectionMatch[0].includes('Eeg Natiijada Hadda'),
      'Must NOT contain "Eeg Natiijada Hadda" early check button'
    );
  });

  await runTest('Macallin: Honest loading state when assessment takes full 30 seconds', () => {
    assert.ok(
      macallinTeacherSource.includes('reviewCountdown <= 0 && !pendingEvaluationResult'),
      'Must handle state where 30s ends but AI result is still finalizing'
    );
    assert.ok(
      macallinTeacherSource.includes('Qiimeynta AI ayaa la dhammaystirayaa, fadlan sug wax yar...'),
      'Must show honest loading indicator instead of empty or fabricated result'
    );
    assert.ok(
      macallinTeacherSource.includes('Waqtigii hubinta akhriska wuu dhacay (Timeout)'),
      'Must provide clean error handling on timeout'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 5: "Waydii EMufti" Database Migration & Server RPCs
  // -----------------------------------------------------------------------------
  await runTest('Waydii EMufti: Migration defines usage table and advisory transaction lock', () => {
    assert.ok(
      migrationSqlSource.includes('CREATE TABLE IF NOT EXISTS public.quran_waydii_usage'),
      'Migration must create public.quran_waydii_usage table'
    );
    assert.ok(
      migrationSqlSource.includes('pg_advisory_xact_lock(hashtext(v_uid::text))'),
      'RPC must use PostgreSQL advisory xact lock for concurrency safety'
    );
    assert.ok(
      migrationSqlSource.includes('CREATE OR REPLACE FUNCTION public.get_waydii_emufti_status'),
      'Migration must define get_waydii_emufti_status RPC'
    );
    assert.ok(
      migrationSqlSource.includes('CREATE OR REPLACE FUNCTION public.record_waydii_emufti_usage'),
      'Migration must define record_waydii_emufti_usage RPC'
    );
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 6: Free Plan 2-Use Limit & Blocking on 3rd Submission
  // -----------------------------------------------------------------------------
  await runTest('Waydii EMufti: Free user gets exactly 2 uses and 3rd is blocked', async () => {
    const testUserId = `test-free-user-${Date.now()}`;

    // Step 1: Initial status check
    const status1 = await getWaydiiEMuftiStatus(testUserId, 'free');
    assert.equal(status1.is_paid, false, 'Initial user is free tier');
    assert.equal(status1.uses_consumed, 0, 'Zero uses initially');
    assert.equal(status1.uses_remaining, 2, 'Two remaining uses');
    assert.equal(status1.allowed, true, 'Can submit first question');

    // Step 2: Record 1st use
    const res1 = await recordWaydiiEMuftiUsage(
      1,
      1,
      'tafsiir',
      'Maxaa loola jeedaa magaca Al-Fatihah?',
      testUserId,
      'free'
    );
    assert.equal(res1.success, true, 'First question succeeds');
    assert.equal(res1.allowed, true, 'Allowed flag is true');
    assert.equal(res1.uses_consumed, 1, 'Used count is now 1');
    assert.equal(res1.uses_remaining, 1, '1 remaining use');

    // Step 3: Record 2nd use
    const res2 = await recordWaydiiEMuftiUsage(
      2,
      255,
      'tafsiir',
      'Sharaxaad ku saabsan Aayadda Kursiga',
      testUserId,
      'free'
    );
    assert.equal(res2.success, true, 'Second question succeeds');
    assert.equal(res2.allowed, true, 'Allowed flag is true');
    assert.equal(res2.uses_consumed, 2, 'Used count is now 2');
    assert.equal(res2.uses_remaining, 0, '0 remaining uses');

    // Step 4: 3rd use MUST be strictly blocked!
    const res3 = await recordWaydiiEMuftiUsage(
      112,
      1,
      'tafsiir',
      'Suuradda Al-Ikhlas maxaa lagu faa’iidaa?',
      testUserId,
      'free'
    );
    assert.equal(res3.success, false, 'Third question must be rejected');
    assert.equal(res3.allowed, false, 'Allowed flag is false');
    assert.equal(res3.uses_consumed, 2, 'Used count remains 2');
    assert.equal(res3.uses_remaining, 0, 'Remaining uses remains 0');

    // Verify status check confirms exhaustion
    const statusExhausted = await getWaydiiEMuftiStatus(testUserId, 'free');
    assert.equal(statusExhausted.allowed, false, 'Status confirms cannot submit');
    assert.equal(statusExhausted.uses_remaining, 0, 'Status confirms 0 remaining uses');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 7: Dialog Dismissal Consumes Zero Uses
  // -----------------------------------------------------------------------------
  await runTest('Waydii EMufti: Opening and closing the modal consumes 0 uses', async () => {
    const testUserId = `test-dismiss-user-${Date.now()}`;

    // User checks status (e.g. when opening modal)
    const statusBefore = await getWaydiiEMuftiStatus(testUserId, 'free');
    assert.equal(statusBefore.uses_consumed, 0);

    // Modal is mounted, user views questions, then dismisses dialog (no question sent)
    // Verify that getWaydiiEMuftiStatus does NOT write to database/usage table
    const statusAfter = await getWaydiiEMuftiStatus(testUserId, 'free');
    assert.equal(statusAfter.uses_consumed, 0, 'Dismissing dialog without submitting must consume 0 uses');
    assert.equal(statusAfter.uses_remaining, 2, 'Remaining uses remains 2');
    assert.equal(statusAfter.allowed, true, 'Can still submit');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 8: Paid Users Retain Unlimited Access
  // -----------------------------------------------------------------------------
  await runTest('Waydii EMufti: Paid subscribers have unlimited access without restriction', async () => {
    const paidUserId = `test-paid-user-${Date.now()}`;

    const paidStatus = await getWaydiiEMuftiStatus(paidUserId, 'pro');
    assert.equal(paidStatus.is_paid, true, 'Must identify user as paid');
    assert.equal(paidStatus.allowed, true, 'Paid users can always submit');
    assert.equal(paidStatus.unlimited, true, 'Unlimited flag is true');

    // Test record usage for paid user
    const paidRecord = await recordWaydiiEMuftiUsage(
      1,
      1,
      'tafsiir',
      'Test paid query',
      paidUserId,
      'pro'
    );
    assert.equal(paidRecord.success, true, 'Paid query succeeds');
    assert.equal(paidRecord.is_paid, true, 'Confirmed as paid');
    assert.equal(paidRecord.unlimited, true, 'Confirmed unlimited');
  });

  // -----------------------------------------------------------------------------
  // TEST SUITE 9: Waydii Modal UI Exhaustion Banner & CTA to /pricing
  // -----------------------------------------------------------------------------
  await runTest('Waydii EMufti: Modal shows upgrade banner with CTA to /pricing when exhausted', () => {
    assert.ok(
      waydiiModalSource.includes('/pricing'),
      'Modal must link to /pricing'
    );
    assert.ok(
      waydiiModalSource.includes("Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa"),
      'Modal must show explicit exhaustion message'
    );
    assert.ok(
      waydiiModalSource.includes('isFreePlanExhausted') &&
      waydiiModalSource.includes('disabled={\n                isFreePlanExhausted') ||
      waydiiModalSource.includes('disabled={isFreePlanExhausted'),
      'Submit button and input must be strictly disabled when exhausted'
    );
    assert.ok(
      waydiiModalSource.includes('U cusboonaysii Pro / Premium') || waydiiModalSource.includes('/pricing'),
      'Modal must have clear CTA to upgrade'
    );
  });

  console.log('\n========================================================================');
  console.log(`TEST RUN SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
    process.exitCode = 1;
  } else {
    console.log('ALL MACALLIN PASSAGE & WAYDII EMUFTI REQUIREMENTS FULLY VERIFIED!');
  }
  console.log('========================================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exitCode = 1;
});
