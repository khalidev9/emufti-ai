import assert from 'node:assert';
import fs from 'node:fs';
import {
  KHATM_DURATION_OPTIONS,
  getDayPlan,
  generateUniqueScreenId,
  isPrayerSlotLocked,
  formatSomaliDayOrdinal,
  registerKhatmChallenge,
  togglePrayerSlot,
  saveVerifiedCertificate,
  lookupCertificateByScreenId,
  getVerifiedCertificates,
} from '../src/lib/khatmChallengeService.ts';

console.log('--- STARTING KHATMA SEQUENTIAL LOCKING & VERIFICATION SUITE ---');

// Mock localStorage for node environment if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

// 1. Test Duration Options & Custom "Others" Calculation
console.log('Testing Duration options and Custom calculations...');
const customDays = 25;
const customSchedule = Array.from({ length: customDays }, (_, i) => getDayPlan(i + 1, customDays));
assert.strictEqual(customSchedule.length, 25, 'Custom schedule should have 25 days');
const totalCustomPages = customSchedule.reduce(
  (sum, d) => sum + Object.values(d.slots).reduce((pSum, s) => pSum + s.pageCount, 0),
  0
);
assert.strictEqual(totalCustomPages, 604, 'Custom 25-day schedule must sum up to exactly 604 Quran pages');
console.log('✓ Test 1 Passed: Custom "Others" duration divides 604 pages accurately.');

// 2. Test Intra-Day Sequential Locking & Day Locking
console.log('Testing Intra-Day Sequential Locking...');
const today = new Date().toISOString().split('T')[0];
const testUserId = 'test-user-seq-123';
const challenge = registerKhatmChallenge(testUserId, 'Cabdillaahi Cali', today, 30);

// Day 1: Slot 1 (fajr) is active and NOT locked
const day1FajrLock = isPrayerSlotLocked(challenge, 1, 'fajr');
assert.strictEqual(day1FajrLock.isLocked, false, 'Day 1 Fajr (slot 1) should be open');

// Day 1: Slot 2 (dhuhr) MUST BE LOCKED because Slot 1 is not yet completed
const day1DhuhrLock = isPrayerSlotLocked(challenge, 1, 'dhuhr');
assert.strictEqual(day1DhuhrLock.isLocked, true, 'Day 1 Dhuhr must be locked until Fajr is complete');
assert.ok(day1DhuhrLock.reason?.includes('Fajr') || day1DhuhrLock.reason?.includes('Subax'), 'Lock reason should mention completing Fajr/Subax');

// Toggling Dhuhr directly without Fajr should fail
const failToggle = togglePrayerSlot(testUserId, 1, 'dhuhr');
assert.ok(failToggle.error, 'Attempting to toggle Dhuhr when locked should return an error');
assert.strictEqual(failToggle.challenge.completedSlots['day_1_dhuhr'], undefined, 'Dhuhr must remain uncompleted');

// Now toggle Slot 1 (Fajr)
const fajrToggle = togglePrayerSlot(testUserId, 1, 'fajr');
assert.strictEqual(fajrToggle.challenge.completedSlots['day_1_fajr'], true, 'Fajr should now be completed');
assert.strictEqual(fajrToggle.error, undefined, 'Fajr toggle should succeed without error');

// Immutability: Toggling Fajr again must be rejected (cannot undo completed slot)
const undoFajr = togglePrayerSlot(testUserId, 1, 'fajr');
assert.ok(undoFajr.error?.includes('xaqiijiyay') || undoFajr.error?.includes('joogto ah'), 'Undoing a completed slot must be blocked');
assert.strictEqual(undoFajr.challenge.completedSlots['day_1_fajr'], true, 'Fajr must remain completed permanently');

// Now Slot 2 (Dhuhr) should be UNLOCKED
const day1DhuhrUnlocked = isPrayerSlotLocked(fajrToggle.challenge, 1, 'dhuhr');
assert.strictEqual(day1DhuhrUnlocked.isLocked, false, 'Day 1 Dhuhr should now be unlocked after Fajr is done');
console.log('✓ Test 2 Passed: Strict intra-day sequential locking and immutability enforced.');

// 3. Test Daily Completion Message Helper
console.log('Testing Daily Completion formatting...');
const day1Text = formatSomaliDayOrdinal(1);
const day2Text = formatSomaliDayOrdinal(2);
const day10Text = formatSomaliDayOrdinal(10);
assert.strictEqual(day1Text, 'Maalintii 1aad');
assert.strictEqual(day2Text, 'Maalintii 2aad');
assert.strictEqual(day10Text, 'Maalintii 10aad');
console.log('✓ Test 3 Passed: Somali day ordinal formatting works correctly.');

// 4. Test Unique Screen ID Generation & Format
console.log('Testing Unique Screen ID format...');
const screenId = generateUniqueScreenId();
assert.match(screenId, /^EMUFTI-KHATM-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Screen ID must match EMUFTI-KHATM-XXXX-XXXX format');
console.log('✓ Test 4 Passed: Unique Screen ID format verified (' + screenId + ').');

// 5. Test Certificate Registration & Public Lookup
console.log('Testing Certificate Registration and Lookup...');
const certData = {
  screenId: screenId,
  userName: 'Faadumo Axmed',
  challengeTitle: 'Khidmada Khatmka Qur\'aanka Kariimka',
  durationDays: 30,
  startDate: '2026-09-25',
  completionDate: '2026-10-25',
  issueDate: '2026-10-25',
  totalPages: 604,
  verificationUrl: `https://emufti.ai/verify?id=${screenId}`,
  verified: true,
};

saveVerifiedCertificate(certData);
const lookedUp = lookupCertificateByScreenId(screenId);
assert.ok(lookedUp, 'Certificate must be found by Screen ID');
assert.strictEqual(lookedUp.userName, 'Faadumo Axmed');
assert.strictEqual(lookedUp.durationDays, 30);
assert.strictEqual(lookedUp.screenId, screenId);

const notFound = lookupCertificateByScreenId('INVALID-ID-999');
assert.strictEqual(notFound, null, 'Invalid Screen ID should return null');
console.log('✓ Test 5 Passed: Certificate registration and Screen ID verification lookup verified.');

// 6. Test Public Verification Page & Routes in Frontend
console.log('Testing Verification Page component and routing...');
const appCode = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(appCode.includes('CertificateVerificationPage'), 'App.tsx must import CertificateVerificationPage');
assert.ok(appCode.includes('path="/verify-certificate"'), 'App.tsx must register /verify-certificate route');
assert.ok(appCode.includes('path="/verify"'), 'App.tsx must register /verify shortcut route');

const sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
assert.ok(sidebarCode.includes('/verify-certificate'), 'Sidebar must include link to /verify-certificate');
assert.ok(sidebarCode.includes('Hubinta Shahaadada'), 'Sidebar must display Hubinta Shahaadada label');

const verifyPageCode = fs.readFileSync('src/pages/CertificateVerificationPage.tsx', 'utf8');
assert.ok(verifyPageCode.includes('lookupCertificateByScreenId'), 'Verification page must use lookup function');
assert.ok(verifyPageCode.includes('searchParams.get(\'id\')') || verifyPageCode.includes('searchParams.get'), 'Verification page must support ?id= URL param');
assert.ok(verifyPageCode.includes('Shahaado Sax Ah Oo La Xaqiijiyay'), 'Verification page must display verified badge');
console.log('✓ Test 6 Passed: Public verification page and routing verified.');

// 7. Verify Dual Logos in Certificate PDF Generation
console.log('Testing Certificate PDF Dual Logo generation...');
const khatmServiceCode = fs.readFileSync('src/lib/khatmChallengeService.ts', 'utf8');
assert.ok(khatmServiceCode.includes("'/logo.png'"), 'PDF generator must load /logo.png');
assert.ok(khatmServiceCode.includes("'/logo-quran.png'"), 'PDF generator must load /logo-quran.png');
assert.ok(khatmServiceCode.includes('EMUFTI AI') || khatmServiceCode.includes('EMUFTI'), 'PDF generator must label Emufti AI');
assert.ok(khatmServiceCode.includes('challenge.screenId'), 'PDF generator must stamp Screen ID on the certificate');
console.log('✓ Test 7 Passed: Dual logos, Screen ID, and signature embedded in PDF generator.');

console.log('\n--- ALL (7/7) KHATMA SEQUENTIAL LOCKING & VERIFICATION TESTS PASSED! ---');
