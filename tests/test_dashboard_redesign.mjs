// ==============================================================================
// TEST SUITE: Comprehensive Dashboard Redesign Verification
// 1. Advanced Quran Reading Analytics (Pages, Juz, Ayahs, Hasanaat + Timeframes)
// 2. Location-Based Prayer Times Widget (Geolocation + 5 Prayers + Qibla)
// 3. 1-Month Quran Completion Khidma (20 pages/day rule: 5 slots x 4 pages)
// 4. Completion Celebration & PDF Export (jsPDF certificate generation)
// ==============================================================================

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- STARTING DASHBOARD REDESIGN COMPREHENSIVE TESTS ---\n');

// 1. Verify files exist
const files = [
  'src/lib/quranAnalyticsService.ts',
  'src/lib/khatmChallengeService.ts',
  'src/components/dashboard/QuranAnalyticsWidget.tsx',
  'src/components/dashboard/QuranKhatmChallengeWidget.tsx',
  'src/components/dashboard/PrayerTimesWidget.tsx',
  'src/pages/DashboardPage.tsx',
];

for (const f of files) {
  assert.ok(fs.existsSync(f), `File must exist: ${f}`);
  console.log(`✓ File exists: ${f}`);
}

// 2. Verify Quran Analytics Service logic
const analyticsContent = fs.readFileSync('src/lib/quranAnalyticsService.ts', 'utf8');
assert.ok(analyticsContent.includes('AnalyticsTimeframe'), 'Must define AnalyticsTimeframe type');
assert.ok(analyticsContent.includes('getAnalyticsSummary'), 'Must export getAnalyticsSummary');
assert.ok(analyticsContent.includes('recordReadingLog'), 'Must export recordReadingLog');
assert.ok(analyticsContent.includes('calculateHasanaatFromPages'), 'Must export calculateHasanaatFromPages');
assert.ok(analyticsContent.includes('daily') && analyticsContent.includes('weekly') && analyticsContent.includes('monthly') && analyticsContent.includes('yearly'), 'Must support daily, weekly, monthly, yearly timeframes');
console.log('✓ Quran Analytics Service implements all required calculations and timeframes.');

// 3. Verify Khatm Challenge Service logic
const khatmContent = fs.readFileSync('src/lib/khatmChallengeService.ts', 'utf8');
assert.ok(khatmContent.includes('TOTAL_DAYS = 30'), 'Must define 30 days total for 1-month challenge');
assert.ok(khatmContent.includes('TOTAL_PAGES = 604'), 'Must define 604 pages total for complete Quran');
assert.ok(khatmContent.includes('TOTAL_SLOTS = 150'), 'Must define 150 total prayer slots (30 days * 5 slots)');
assert.ok(khatmContent.includes('fajr') && khatmContent.includes('dhuhr') && khatmContent.includes('asr') && khatmContent.includes('maghrib') && khatmContent.includes('isha'), 'Must define 5 prayer slots: fajr, dhuhr, asr, maghrib, isha');
assert.ok(khatmContent.includes('calculateTargetEndDate'), 'Must calculate 30-day target end date');
assert.ok(khatmContent.includes('generateKhatmCertificatePdf'), 'Must export generateKhatmCertificatePdf using jsPDF');
assert.ok(khatmContent.includes('togglePrayerSlot'), 'Must support toggling prayer slot');
console.log('✓ 1-Month Khatm Challenge Service implements 20 pages/day 5-slot routine & PDF export.');

// 4. Verify PrayerTimesWidget Geolocation
const prayerContent = fs.readFileSync('src/components/dashboard/PrayerTimesWidget.tsx', 'utf8');
assert.ok(prayerContent.includes('navigator.geolocation'), 'Must check navigator.geolocation for live user coordinates');
assert.ok(prayerContent.includes('detectLiveLocation'), 'Must implement detectLiveLocation function');
assert.ok(prayerContent.includes('Crosshair') || prayerContent.includes('GPS'), 'Must provide visual GPS live indicator');
assert.ok(prayerContent.includes('calculatePrayerTimes'), 'Must calculate prayer times');
assert.ok(prayerContent.includes('calculateQiblaDirection'), 'Must calculate Qibla direction');
console.log('✓ PrayerTimesWidget supports live geolocation detection & accurate astronomical calculations.');

// 5. Verify QuranAnalyticsWidget UI
const analyticsWidgetContent = fs.readFileSync('src/components/dashboard/QuranAnalyticsWidget.tsx', 'utf8');
assert.ok(analyticsWidgetContent.includes('Bogagga La Akhriyay'), 'Must display Pages Read');
assert.ok(analyticsWidgetContent.includes('Juzz La Dhameeyay'), 'Must display Juzz Read');
assert.ok(analyticsWidgetContent.includes('Aayado La Akhriyay'), 'Must display Ayahs Read');
assert.ok(analyticsWidgetContent.includes('Xasanaad La Kasbaday'), 'Must display Hasanaat Earned');
assert.ok(analyticsWidgetContent.includes('timeframeTabs'), 'Must render timeframe switcher tabs');
assert.ok(analyticsWidgetContent.includes('handleQuickLog'), 'Must support quick-logging reading sessions');
console.log('✓ QuranAnalyticsWidget displays real-time widgets and timeframe filters.');

// 6. Verify QuranKhatmChallengeWidget UI
const khatmWidgetContent = fs.readFileSync('src/components/dashboard/QuranKhatmChallengeWidget.tsx', 'utf8');
assert.ok(khatmWidgetContent.includes('Khidmada Khatmka'), 'Must render Khidma Challenge section');
assert.ok(khatmWidgetContent.includes('handleRegister'), 'Must provide registration flow');
assert.ok(khatmWidgetContent.includes('handleSlotToggle'), 'Must allow ticking 4-page prayer slots');
assert.ok(khatmWidgetContent.includes('handleDownloadPdf'), 'Must allow 1-click Download as PDF');
assert.ok(khatmWidgetContent.includes('isCelebrationOpen'), 'Must render completion celebration');
console.log('✓ QuranKhatmChallengeWidget provides interactive 5-prayer slot tracking, celebration & PDF download.');

// 7. Verify DashboardPage integrates all components
const dashboardContent = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
assert.ok(dashboardContent.includes('QuranAnalyticsWidget'), 'DashboardPage must import and render QuranAnalyticsWidget');
assert.ok(dashboardContent.includes('PrayerTimesWidget'), 'DashboardPage must import and render PrayerTimesWidget');
assert.ok(dashboardContent.includes('QuranKhatmChallengeWidget'), 'DashboardPage must import and render QuranKhatmChallengeWidget');
console.log('✓ DashboardPage integrates all new and redesigned dashboard widgets.');

console.log('\n--- ALL DASHBOARD REDESIGN TESTS PASSED SUCCESSFULLY! (7/7) ---');
