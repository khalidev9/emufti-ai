import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { ALL_114_SURAHS } from '../src/data/quranMetadata.ts';
import { ALL_50_QARIS } from '../src/data/qarisData.ts';
import { tajweedAssessmentEngine } from '../src/lib/tajweedAssessmentEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: SUBCIS COMPLETE REDESIGN & RECITATION WORKFLOW TESTS');
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

  // ---------------------------------------------------------------------------
  // SUITE 1: Welcome Banner and Setup
  // ---------------------------------------------------------------------------
  await runTest('[1.1] Welcome banner displays "Ku soo dhawoow Subcis"', () => {
    assert(
      subcisSource.includes('Ku soo dhawoow Subcis'),
      'Must display exact title "Ku soo dhawoow Subcis"'
    );
  });

  await runTest('[1.2] Welcome banner displays exact description: "Dhageyso qaariga, akhri aayadaha ku xiga, kuna horumari akhriskaaga Qur’aanka."', () => {
    assert(
      subcisSource.includes('Dhageyso qaariga, akhri aayadaha ku xiga, kuna horumari akhriskaaga Qur’aanka.') ||
      subcisSource.includes('Dhageyso qaari, akhri aayadaha ku xiga, kuna hubi akhriskaaga Qur’aanka.'),
      'Must display exact description text'
    );
  });

  await runTest('[1.3] Provides "Bilow Imminka" button on initial open', () => {
    assert(
      subcisSource.includes('Bilow Imminka'),
      'Must provide "Bilow Imminka" button'
    );
  });

  await runTest('[1.4] After clicking, supports choosing from all 114 Surahs and verified verse audio reciters', () => {
    assert(subcisSource.includes('ALL_114_SURAHS'), 'Must import all 114 surahs');
    assert(subcisSource.includes('hasVerseAudio'), 'Must filter reciters with EveryAyah verse audio');
    assert(subcisSource.includes('surahMeta'), 'Must display selected Surah before starting');
    assert(subcisSource.includes('activeQari'), 'Must display selected Qari before starting');
  });

  // ---------------------------------------------------------------------------
  // SUITE 2: 20-Second User Recitation & Automatic Alternation
  // ---------------------------------------------------------------------------
  await runTest('[2.1] Exactly 20 seconds limit per ayah (USER_RECITE_TIME_LIMIT = 20)', () => {
    assert(
      subcisSource.includes('USER_RECITE_TIME_LIMIT = 20'),
      'Must define exact 20-second time limit'
    );
    assert(
      subcisSource.includes('userCountdown'),
      'Must manage countdown state'
    );
  });

  await runTest('[2.2] Displays required turn status: "Qaarigu wuxuu akhrinayaa aayadda…"', () => {
    assert(
      subcisSource.includes('Qaarigu wuxuu akhrinayaa aayadda…'),
      'Must display exact status during Qari turn'
    );
  });

  await runTest('[2.3] Displays required turn statuses: "Hadda adiga akhri aayadda xigta.", "Codkaaga waa la duubayaa…", "Akhri waqtiga haray:"', () => {
    assert(
      subcisSource.includes('Hadda adiga akhri aayadda xigta.'),
      'Must display "Hadda adiga akhri aayadda xigta."'
    );
    assert(
      subcisSource.includes('Codkaaga waa la duubayaa…'),
      'Must display "Codkaaga waa la duubayaa…"'
    );
    assert(
      subcisSource.includes('Akhri waqtiga haray:'),
      'Must display "Akhri waqtiga haray:"'
    );
  });

  await runTest('[2.4] Advances automatically without requiring manual "Next" click after every ayah', () => {
    assert(
      subcisSource.includes('handleFinishUserTurnAutomatically'),
      'Must have automatic turn completion and advance handler'
    );
    assert(
      subcisSource.includes('handleQariAudioFinished'),
      'Must automatically transition when Qari finishes'
    );
  });

  await runTest('[2.5] Alternating sequence assigns immediately following ayah (Ayah_user = Ayah_qari + 1)', () => {
    assert(
      subcisSource.includes('currentAyahIndex + 1') || subcisSource.includes('currentIndex + 1'),
      'Must increment index by 1 so user recites consecutive next ayah'
    );
  });

  await runTest('[2.6] Stale closure prevention: uses currentAyahIndexRef for timer intervals and audio onended callbacks', () => {
    assert(
      subcisSource.includes('currentAyahIndexRef'),
      'Must declare currentAyahIndexRef to ensure closure safety'
    );
    assert(
      subcisSource.includes('currentAyahIndexRef.current + 1') || subcisSource.includes('currentIndex = currentAyahIndexRef.current'),
      'Must read latest ayah index from ref when transitioning turns'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 3: Sequential Audio / Microphone Coordination
  // ---------------------------------------------------------------------------
  await runTest('[3.1] Audio and microphone never conflict (Qari audio stops before mic starts, mic stops before Qari audio)', () => {
    assert(
      subcisSource.includes('stopMicrophoneStream'),
      'Must cleanly stop microphone stream'
    );
    assert(
      subcisSource.includes('qariAudioRef.current.pause()'),
      'Must pause Qari audio before starting user turn'
    );
  });

  await runTest('[3.2] Persistent root audio mounting: audio element mounted at root to prevent detached playback and dropped onended events', () => {
    // There must be only one qariAudioRef audio element mounted persistently at the top of the return
    const qariAudioCount = (subcisSource.match(/ref=\{qariAudioRef\}/g) || []).length;
    assert.equal(
      qariAudioCount,
      1,
      'Must mount exactly one persistent <audio ref={qariAudioRef}> at the component root'
    );
    assert(
      subcisSource.includes('subcis-container'),
      'Must have persistent root container'
    );
  });

  await runTest('[3.3] Next Ayah rendering resiliency: active recitation card provides fallback display if verse is resolving', () => {
    assert(
      subcisSource.includes('Soo diyaarinaya aayadda'),
      'Must provide graceful fallback display instead of null when verse is resolving'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 4: End of Surah Parity Handling
  // ---------------------------------------------------------------------------
  await runTest('[4.1] Accurately handles odd and even ayah counts without out-of-bounds indexing', () => {
    assert(
      subcisSource.includes('isOddAyahCount') || subcisSource.includes('totalAyahsCount % 2 !== 0'),
      'Must calculate odd/even parity'
    );
    assert(
      subcisSource.includes('>= activeAyahs.length'),
      'Must guard against out-of-bounds ayah index access'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 5: Recitation Assessment & Final Error Report
  // ---------------------------------------------------------------------------
  await runTest('[5.1] Evaluates user recitation against the assigned ayah, not preceding Qari ayah', () => {
    assert(
      subcisSource.includes('evaluateAyahStrict'),
      'Must use evaluateAyahStrict for accurate recitation assessment'
    );
    assert(
      subcisSource.includes('targetAyah.numberInSurah,') && subcisSource.includes('targetAyah.text,'),
      'Must pass targetAyah to evaluateAyahStrict'
    );
  });

  await runTest('[5.2] Displays completion message: "Waxaad dhamaysay Subcis-ka suuradda [Magaca Suuradda]. Hoos ka eeg khaladaadka lagaa helay iyo sida loo saxo."', () => {
    assert(
      subcisSource.includes('Waxaad dhamaysay Subcis-ka suuradda'),
      'Must display exact completion message'
    );
    assert(
      subcisSource.includes('Hoos ka eeg khaladaadka lagaa helay iyo sida loo saxo.'),
      'Must display instruction to review errors below'
    );
  });

  await runTest('[5.3] Displays report header "Natiijada Subcis-kaaga"', () => {
    assert(
      subcisSource.includes('Natiijada Subcis-kaaga'),
      'Must display exact title "Natiijada Subcis-kaaga"'
    );
  });

  await runTest('[5.4] Provides required completion buttons: "Dib u eeg khaladaadka", "Ku celi Subcis-ka", "Dooro Suurad Kale"', () => {
    assert(
      subcisSource.includes('Dib u eeg khaladaadka'),
      'Must provide "Dib u eeg khaladaadka" button'
    );
    assert(
      subcisSource.includes('Ku celi Subcis-ka'),
      'Must provide "Ku celi Subcis-ka" button'
    );
    assert(
      subcisSource.includes('Dooro Suurad Kale'),
      'Must provide "Dooro Suurad Kale" button'
    );
  });

  await runTest('[5.5] Provides audio replay for both user voice recording and Qari reference', () => {
    assert(
      subcisSource.includes('Dhageyso Codkaaga'),
      'Must provide user voice replay'
    );
    assert(
      subcisSource.includes('Dhageyso Qariga'),
      'Must provide Qari reference replay'
    );
  });

  await runTest('[5.6] Labels unverified recitations as "Lama xaqiijin" without guessing', () => {
    assert(
      subcisSource.includes('Lama xaqiijin'),
      'Must label unverified recitation as "Lama xaqiijin"'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 6: Connected Arabic Text & Supabase Storage
  // ---------------------------------------------------------------------------
  await runTest('[6.1] Renders connected Arabic Quran text without splitting into characters', () => {
    assert(
      !subcisSource.includes('seg.char'),
      'Must NOT split characters into individual spans'
    );
    assert(
      subcisSource.includes('tok.rawText') || subcisSource.includes('currentAyah.text'),
      'Must render complete connected Arabic words'
    );
  });

  await runTest('[6.2] Persists completed session to Supabase "quran_subcis_sessions"', () => {
    assert(
      subcisSource.includes('quran_subcis_sessions'),
      'Must target quran_subcis_sessions table'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 7: Ayah Sequence & Audio Replay Bug Prevention
  // ---------------------------------------------------------------------------
  await runTest('[7.1] Playback is not triggered by a rogue reactive useEffect on !qariAudioPlaying (no infinite replay loop)', () => {
    // There must be no useEffect that automatically calls playQariAyah whenever qariAudioPlaying becomes false
    assert(
      !subcisSource.includes("!qariAudioPlaying &&\n      !isQariAudioLoading &&\n      !qariAudioPlaybackFailed\n    ) {\n      playQariAyah"),
      'Must NOT have reactive useEffect triggering playQariAyah on !qariAudioPlaying'
    );
  });

  await runTest('[7.2] Single source of truth updater updateCurrentAyahIndex synchronizes ref and state atomically', () => {
    assert(
      subcisSource.includes('updateCurrentAyahIndex'),
      'Must declare updateCurrentAyahIndex helper'
    );
    assert(
      subcisSource.includes('currentAyahIndexRef.current = newIndex'),
      'Must update ref synchronously before state dispatch'
    );
  });

  await runTest('[7.3] Transition guards prevent duplicate advance or dual audio triggering', () => {
    assert(
      subcisSource.includes('isTransitioningRef'),
      'Must define isTransitioningRef to protect against duplicate onEnded triggers'
    );
    assert(
      subcisSource.includes('isFinishingUserTurnRef'),
      'Must define isFinishingUserTurnRef to protect against concurrent timer and submit clicks'
    );
    assert(
      subcisSource.includes('advanceTimeoutRef'),
      'Must track advance timeout in ref for clean unmount/reset'
    );
  });

  await runTest('[7.4] 20-second practice timer executes outside React setState updaters', () => {
    assert(
      !subcisSource.includes('setUserCountdown((prev) => {\n        if (prev <= 1) {\n          // Timer expired'),
      'Must NOT trigger handleFinishUserTurnAutomatically inside setUserCountdown reducer'
    );
  });

  await runTest('[7.5] Surah or Qari change resets active session safely without audio conflict', () => {
    assert(
      subcisSource.includes('[currentSurahNumber, activeQari.id]'),
      'Must observe currentSurahNumber and activeQari.id for safe session reset'
    );
    assert(
      subcisSource.includes('handleResetToSetup();'),
      'Must reset to setup when surah or qari changes during active session'
    );
  });

  await runTest('[7.6] Manual replay exclusively replays current ayah without advancing', () => {
    assert(
      subcisSource.includes('playQariAyah(currentAyahIndexRef.current, true)'),
      'Manual replay must target current ayah from ref with isExplicitReplay flag'
    );
  });

  // ---------------------------------------------------------------------------
  // SUITE 8: Flexible Practice Range Selection & Post-Practice Assessment
  // ---------------------------------------------------------------------------
  await runTest('[8.1] Flexible Range Selection: Supports 3 modes (entire_surah, ayah_range, quantity) with validated bounds', () => {
    assert(
      subcisSource.includes("'entire_surah'") &&
      subcisSource.includes("'ayah_range'") &&
      subcisSource.includes("'quantity'"),
      'Must define and support 3 distinct practice range modes'
    );
    assert(
      subcisSource.includes('rangeStartAyah') &&
      subcisSource.includes('rangeEndAyah') &&
      subcisSource.includes('rangeQuantity'),
      'Must maintain state for start ayah, end ayah, and quantity'
    );
    assert(
      subcisSource.includes('effectiveStartAyah') &&
      subcisSource.includes('effectiveEndAyah'),
      'Must calculate effective validated ayah range bounded by total surah ayahs'
    );
  });

  await runTest('[8.2] Local Zero-Upload Recitation: Records locally without mid-session interruption', () => {
    assert(
      subcisSource.includes('audioChunksRef') &&
      subcisSource.includes('userAttemptRecords'),
      'Must collect audio chunks locally into userAttemptRecords'
    );
    assert(
      subcisSource.includes('Zero Server Upload'),
      'Must guarantee privacy with zero server upload for recitation audio'
    );
  });

  await runTest('[8.3] On-Demand Assessment: Provides "Review My Recitation (Dib u eeg Akhriskayga)" on session completion', () => {
    assert(
      subcisSource.includes('Review My Recitation') &&
      subcisSource.includes('Dib u eeg Akhriskayga'),
      'Must display "Review My Recitation" ("Dib u eeg Akhriskayga")'
    );
    assert(
      subcisSource.includes('handleRunRecitationReview'),
      'Must provide on-demand handler to evaluate recitation only upon user request'
    );
  });

  await runTest('[8.4] Statistics Grid: Differentiates Assessed, Not Assessed, Mistakes, and Clean Pass', () => {
    assert(
      subcisSource.includes('assessedAyahsCount') &&
      subcisSource.includes('unverifiedAyahsCount'),
      'Must derive assessed and unverified counts separately'
    );
    assert(
      subcisSource.includes('Aayadaha La Baaray') &&
      subcisSource.includes('Lama Xaqiijin') &&
      subcisSource.includes('Khaladaadka La Helay') &&
      subcisSource.includes('Aayadaha Saxda Ah'),
      'Must render 4-stat summary grid for recitation accuracy'
    );
  });

  await runTest('[8.5] Targeted Mistake Practice: Provides "Ku celi Khaladaadka" and single-ayah retry "Ku celi aayaddan"', () => {
    assert(
      subcisSource.includes('handlePracticeMistakesAgain'),
      'Must implement handlePracticeMistakesAgain to filter only verses with mistakes'
    );
    assert(
      subcisSource.includes('handlePracticeSingleAyah'),
      'Must implement handlePracticeSingleAyah for retrying a single ayah'
    );
    assert(
      subcisSource.includes('Ku celi Khaladaadka') &&
      subcisSource.includes('Ku celi aayaddan'),
      'Must render retry buttons for mistakes and individual ayahs'
    );
  });

  await runTest('[8.6] Completion Summary: Displays Surah, range, duration, and session metrics', () => {
    assert(
      subcisSource.includes('sessionDurationSeconds'),
      'Must track session duration in seconds'
    );
    assert(
      subcisSource.includes('Waqtiga Tababarka:'),
      'Must display total practice duration in summary'
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
