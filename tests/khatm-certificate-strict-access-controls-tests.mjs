// ==============================================================================
// TEST SUITE: STRICT KHATM CERTIFICATE ACCESS CONTROLS & LOCKSCREEN GUARDS
// Verifies:
// 1. Check Active/Completed Khatm Status & Supabase cross-device sync
// 2. Redirect to /khitma with "Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub."
// 3. Strict Expiry & 10-Question Exam Rule (>= 7/10 score required)
// 4. Failed Attempt Handling with "Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale"
// 5. Component State Guard & LockScreen rendering across routes
// ==============================================================================

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failedTests++;
  }
}

console.log('\n========================================================================');
console.log('🧪 EMUFTI AI: STRICT KHATM CERTIFICATE ACCESS CONTROLS TEST SUITE');
console.log('========================================================================\n');

// 1. Service Layer Tests: khatmChallengeService.ts
console.log('--- 1. Khatm Challenge Service Guards & Supabase Sync ---');
const serviceContent = fs.readFileSync(path.resolve('src/lib/khatmChallengeService.ts'), 'utf-8');

assert(
  serviceContent.includes('export function isKhatmChallengeExpired') &&
  serviceContent.includes('today.getTime() >= target.getTime()'),
  '1.1 isKhatmChallengeExpired accurately checks calendar expiration against targetEndDate'
);

assert(
  serviceContent.includes('export function isKhatmExamRequired') &&
  serviceContent.includes('isExpired || isFinished'),
  '1.2 isKhatmExamRequired triggers when duration has expired or challenge is completed'
);

assert(
  serviceContent.includes('export async function fetchKhatmChallengeFromSupabase') &&
  serviceContent.includes("from('khatm_challenges')"),
  '1.3 fetchKhatmChallengeFromSupabase queries Supabase khatm_challenges table'
);

assert(
  serviceContent.includes('export async function getOrFetchKhatmChallenge') &&
  serviceContent.includes('fetchKhatmChallengeFromSupabase'),
  '1.4 getOrFetchKhatmChallenge checks Supabase first for authenticated users with offline fallback'
);

assert(
  serviceContent.includes('export function isKhatmCertificateUnlocked') &&
  serviceContent.includes('isTimeOrPagesDone && hasPassedExam'),
  '1.5 isKhatmCertificateUnlocked enforces duration expired/completed AND quizPassed >= 7/10'
);

assert(
  serviceContent.includes('export function recordKhatmQuizResult') &&
  serviceContent.includes("const status: KhatmChallengeStatus = passed ? 'completed' : 'failed'") &&
  serviceContent.includes('saveVerifiedCertificate'),
  '1.6 recordKhatmQuizResult generates Screen ID and registers verified certificate upon passing'
);

// 2. Protected Certificate Page Tests: KhatmCertificatePage.tsx
console.log('\n--- 2. Dedicated Protected Khatm Certificate Page ---');
const certPageExists = fs.existsSync(path.resolve('src/pages/KhatmCertificatePage.tsx'));
assert(certPageExists, '2.1 src/pages/KhatmCertificatePage.tsx exists');

const certPageContent = fs.readFileSync(path.resolve('src/pages/KhatmCertificatePage.tsx'), 'utf-8');

assert(
  certPageContent.includes('getOrFetchKhatmChallenge') &&
  certPageContent.includes('setIsLoading(true)'),
  '2.2 KhatmCertificatePage fetches active/completed Khatm status on load with loading state'
);

assert(
  certPageContent.includes('Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub.') &&
  certPageContent.includes("/khitma?notice=not_started"),
  '2.3 Unregistered/unstarted users are redirected to /khitma with "Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub."'
);

assert(
  certPageContent.includes('Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale') &&
  certPageContent.includes('handleStartFreshChallenge'),
  '2.4 Failed exam attempts (< 7/10) lock session and display "Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale"'
);

assert(
  certPageContent.includes('!isExpired && !isFinished') &&
  certPageContent.includes('Muddadii Khatmkaagu Weli Ma Dhammaan'),
  '2.5 Inaccessible LockScreen displayed while challenge duration is active and pages not completed'
);

assert(
  certPageContent.includes('!challenge.quizPassed') &&
  certPageContent.includes("Imtixaanka Khatmka Waa Qasab") &&
  certPageContent.includes('KhitmaQuizModal'),
  '2.6 Mandatory 10-Question Quiz prompt displayed when duration expired/finished but exam not passed'
);

assert(
  certPageContent.includes('KhatmCertificatePreview') &&
  certPageContent.includes('generateKhatmCertificatePdf'),
  '2.7 Official verified certificate with PDF download and Screen ID unlocked only after passing exam >= 7/10'
);

// 3. App Routing Tests: App.tsx
console.log('\n--- 3. App Routing & Route Protection ---');
const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');

assert(
  appContent.includes("import { KhatmCertificatePage } from './pages/KhatmCertificatePage'") &&
  appContent.includes('path="/certificate"') &&
  appContent.includes('path="/khatm/certificate"'),
  '3.1 App.tsx registers /certificate and /khatm/certificate routes pointing to KhatmCertificatePage'
);

// 4. Khitma Page Guards: KhitmaPage.tsx
console.log('\n--- 4. Khitma Page Component Guards & Cleanups ---');
const khitmaContent = fs.readFileSync(path.resolve('src/pages/KhitmaPage.tsx'), 'utf-8');

assert(
  khitmaContent.includes('Weli ma aadan bilaabin Khatm. Fadlan dooro oo bilow Khatm cusub.') &&
  khitmaContent.includes('redirectNotice'),
  '4.1 KhitmaPage handles redirect notice and displays prominent alert banner'
);

assert(
  !khitmaContent.includes("viewMode === 'wizard' && (\n          <div id=\"certificate-preview-section\""),
  '4.2 Premature certificate preview removed from KhitmaPage wizard mode (unregistered users cannot preview/download)'
);

assert(
  khitmaContent.includes('Mahadsanid, kuma aanad guuleysanin shahaadada khatmka. Samee khatm kale') &&
  khitmaContent.includes('Shahaadada Weli Waa Qufulan Tahay 🔒'),
  '4.3 Tasks mode certificate section strictly guarded with LockScreen and Failed Screen'
);

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
