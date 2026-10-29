import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: SUBCIS TURN-TAKING & MOBILE LAYOUT NON-OVERFLOW TESTS');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: Strict Mobile Horizontal Containers & Non-Overflow CSS Rules
// -----------------------------------------------------------------------------
console.log('--- Section 1: Mobile Non-Overflow Layout Verification ---');
const settingsPageContent = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'SettingsPage.tsx'), 'utf-8');
const quranPageContent = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'QuranPage.tsx'), 'utf-8');

assert(
  settingsPageContent.includes('w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border'),
  '1.1 SettingsPage mobile tab navigation has strict non-overflow CSS rules with box-border'
);

assert(
  settingsPageContent.includes('flex-shrink-0 flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl') &&
  settingsPageContent.includes('flex-shrink-0 flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-blue-600'),
  '1.2 SettingsPage tab navigation pills all enforce flex-shrink-0 to prevent button squashing'
);

assert(
  quranPageContent.includes('w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border'),
  '1.3 QuranPage mobile reading quick bar has strict non-overflow CSS rules with box-border'
);

assert(
  quranPageContent.includes('flex-shrink-0 shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full') &&
  quranPageContent.includes('flex-shrink-0 shrink-0 flex items-center gap-0.5 bg-slate-200/80'),
  '1.4 QuranPage quick bar buttons and font size controls have flex-shrink-0 shrink-0'
);

// -----------------------------------------------------------------------------
// SECTION 2: Subcis Recitation Turn-Taking State Machine & Audio Separation
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Subcis Audio Separation & Turn Handover ---');
const subcisContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'quran', 'SubcisPractice.tsx'), 'utf-8');

assert(
  subcisContent.includes("if (playbackSessionIdRef.current !== thisSessionId || activeRoleRef.current !== 'qari')") &&
  subcisContent.includes('audio.pause()'),
  '2.1 playQariAyah verifies activeRoleRef is qari and pauses immediately if turn has moved to student'
);

assert(
  subcisContent.includes('playbackSessionIdRef.current += 1;') &&
  subcisContent.includes('if (qariAudioRef.current) {\n      try {\n        qariAudioRef.current.pause();'),
  '2.2 transitionToUserTurn invalidates playback session ID and pauses Qari audio'
);

assert(
  subcisContent.includes("if (activeRoleRef.current !== 'qari' || isTransitioningRef.current) return;") &&
  subcisContent.includes('playbackSessionIdRef.current += 1;'),
  '2.3 handleQariAudioFinished enforces strict role guard activeRoleRef === qari preventing double increments'
);

assert(
  subcisContent.includes("if (activeRoleRef.current !== 'user' || isFinishingUserTurnRef.current) return;"),
  '2.4 handleFinishUserTurnAutomatically enforces strict role guard activeRoleRef === user'
);

assert(
  subcisContent.includes("onPlaying={() => {\n          if (activeRoleRef.current !== 'qari') {\n            try {\n              qariAudioRef.current?.pause();") &&
  subcisContent.includes("onEnded={() => {\n          if (activeRoleRef.current === 'qari') {\n            handleQariAudioFinished();") &&
  subcisContent.includes("onError={() => {\n          if (activeRoleRef.current === 'qari') {"),
  '2.5 Root persistent audio element strictly guards onPlaying, onEnded, and onError with activeRoleRef === qari'
);

assert(
  subcisContent.includes("if (activeRoleRef.current !== 'user') return;\n    const recordIndex"),
  '2.6 startUserRecording guards against stale execution if role switched before mic initialization'
);

assert(
  subcisContent.includes("if (activeRoleRef.current !== 'user' || isCompletingVerseRef.current) return;"),
  '2.7 triggerVerseCompletionAndNext verifies user role before triggering completion and advance'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
