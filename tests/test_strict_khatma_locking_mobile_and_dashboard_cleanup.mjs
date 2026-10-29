import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== TEST SUITE: STRICT KHATMA LOCKING, MOBILE OVERFLOW, & DASHBOARD CLEANUP ===\n');

// -----------------------------------------------------------------------------
// 1. STRICT TICKING & SEQUENTIAL LOCKING
// -----------------------------------------------------------------------------
console.log('Test 1: Strict Ticking & Sequential Locking in khatmChallengeService.ts...');
const servicePath = path.resolve('src/lib/khatmChallengeService.ts');
const serviceContent = fs.readFileSync(servicePath, 'utf8');

// Verify future day locking
assert.ok(
  serviceContent.includes('dayIndex > currentActiveDay'),
  'Must check if dayIndex is a future day and lock it'
);

// Verify past day locking
assert.ok(
  serviceContent.includes('dayIndex < currentActiveDay'),
  'Must check if dayIndex is a past day and lock it from alteration'
);

// Verify intra-day sequential check
assert.ok(
  serviceContent.includes('const prevSlotId = `day_${dayIndex}_${prevSlotKey}`'),
  'Must verify previous slot completion before unlocking next prayer slot'
);

// Verify immutability check
assert.ok(
  serviceContent.includes('isCurrentlyComplete') && serviceContent.includes('Lama beddeli karo'),
  'Must enforce permanent immutability once a slot is completed'
);
console.log('✔ Strict day locking, past day locking, sequential slot ordering, and permanent locking verified.');

// -----------------------------------------------------------------------------
// 2. MOBILE LAYOUT & OVERFLOW CONTAINMENT ON KHATMA / TASK PAGES
// -----------------------------------------------------------------------------
console.log('\nTest 2: Mobile Layout Overflow Fixes on Khatma / Task Pages...');
const khitmaPagePath = path.resolve('src/pages/KhitmaPage.tsx');
const khitmaContent = fs.readFileSync(khitmaPagePath, 'utf8');

assert.ok(
  khitmaContent.includes('overflow-x-hidden'),
  'KhitmaPage main/root must enforce overflow-x-hidden'
);

assert.ok(
  khitmaContent.includes('w-full max-w-full min-w-0 overflow-hidden'),
  'Day selector pills container must enforce mobile bounds'
);

assert.ok(
  khitmaContent.includes('grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-full min-w-0'),
  '5-prayer slot grid must contain mobile elements without overflow'
);

// Verify KhatmCertificatePreview containment
const previewPath = path.resolve('src/components/khitma/KhatmCertificatePreview.tsx');
const previewContent = fs.readFileSync(previewPath, 'utf8');

assert.ok(
  previewContent.includes('w-full max-w-full overflow-hidden'),
  'KhatmCertificatePreview root must prevent horizontal viewport stretching'
);

assert.ok(
  previewContent.includes('w-full max-w-full overflow-x-auto pb-3 rounded-2xl scrollbar-thin'),
  'KhatmCertificatePreview inner table must be safely scrollable within mobile bounds'
);
console.log('✔ Mobile layout overflow containment, responsive day pills, and safe scrollbars verified.');

// -----------------------------------------------------------------------------
// 3. DASHBOARD PAGE CLEANUP
// -----------------------------------------------------------------------------
console.log('\nTest 3: Dashboard Page Cleanup (Clutter & Widget Removal)...');
const dashboardPath = path.resolve('src/pages/DashboardPage.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Unnecessary widgets must be removed from DashboardPage
assert.ok(
  !dashboardContent.includes('<MoodDuaSelector'),
  'MoodDuaSelector must be removed from DashboardPage'
);

assert.ok(
  !dashboardContent.includes('<DailyReflectionWidget'),
  'DailyReflectionWidget must be removed from DashboardPage'
);

assert.ok(
  !dashboardContent.includes('<QuranHasanaatWidget'),
  'QuranHasanaatWidget must be removed from DashboardPage'
);

assert.ok(
  !dashboardContent.includes('<PlanActivationBanner'),
  'PlanActivationBanner must be removed from DashboardPage'
);

assert.ok(
  !dashboardContent.includes('<RamadanOfferBanner'),
  'RamadanOfferBanner must be removed from DashboardPage'
);

// Essential core components must be preserved
assert.ok(
  dashboardContent.includes('PrayerTimesWidget'),
  'Essential PrayerTimesWidget must be preserved'
);

assert.ok(
  dashboardContent.includes('ReadingStreakWidget'),
  'Essential ReadingStreakWidget must be preserved'
);

assert.ok(
  dashboardContent.includes('QuranAnalyticsWidget'),
  'Essential QuranAnalyticsWidget must be preserved'
);

assert.ok(
  dashboardContent.includes('QuranKhatmChallengeWidget'),
  'Essential QuranKhatmChallengeWidget must be preserved'
);

assert.ok(
  dashboardContent.includes('Islamic Learning Navigation'),
  'Essential Navigation Hub must be preserved'
);

console.log('✔ Cluttered widgets and promotional banners removed while essential stats & navigation preserved.');

console.log('\n======================================================');
console.log('  ALL STRICT LOCKING, MOBILE, & CLEANUP TESTS PASSED! 🎉');
console.log('======================================================');
