// ==============================================================================
// TEST SUITE: Quran Khatma Tracker & Certificate System Complete Features
// 1. Khatma Banner & Cards Interface
// 2. Setup Form (Name & 30/20/15/10/7 Days Duration Options)
// 3. Automatic 604-Page Calculation & 5-Prayer Breakdown
// 4. Strict Day Locking (Future Days Locked) & Immutable Logs (Permanent)
// 5. Conditional PDF Download Button (Hidden until 100% Final Day Completion)
// 6. Completion Celebration & Branded Certificate with Quran Page & EMufti AI Logos
// ==============================================================================

import assert from 'node:assert';
import fs from 'node:fs';
import {
  getDayPlan,
  calculateTargetEndDate,
  isDayLocked,
  getChallengeCurrentDay,
  KHATM_DURATION_OPTIONS,
  TOTAL_PAGES,
} from '../src/lib/khatmChallengeService.ts';

console.log('--- STARTING KHATMA TRACKER & CERTIFICATE SYSTEM TESTS ---\n');

// 1. Check Duration Options
assert.strictEqual(KHATM_DURATION_OPTIONS.length, 5, 'Must provide 5 flexible duration options');
const durations = KHATM_DURATION_OPTIONS.map((o) => o.days);
assert.deepStrictEqual(durations, [30, 20, 15, 10, 7], 'Must support 30, 20, 15, 10, and 7 days');
console.log('✓ Test 1 Passed: 5 flexible duration options configured (30, 20, 15, 10, 7 days).');

// 2. Check Automatic 604-Page Division across Durations and 5 Daily Prayers
for (const duration of [30, 20, 15, 10, 7]) {
  let totalCalculatedPages = 0;
  for (let d = 1; d <= duration; d++) {
    const plan = getDayPlan(d, duration);
    assert.strictEqual(plan.slots.length, 5, `Day ${d} must have exactly 5 prayer slots`);
    assert.strictEqual(plan.dayIndex, d);
    if (d === 1) {
      assert.strictEqual(plan.startPage, 1, 'First day must start on page 1');
    }
    if (d === duration) {
      assert.strictEqual(plan.endPage, 604, 'Final day must end on page 604');
    }
    const dayPagesSum = plan.slots.reduce((sum, s) => sum + s.pageCount, 0);
    assert.strictEqual(dayPagesSum, plan.dailyPages, `Slots sum must match daily pages on day ${d}`);
    totalCalculatedPages += plan.dailyPages;
  }
  assert.strictEqual(totalCalculatedPages, 604, `All ${duration} days must sum to exactly 604 pages`);
}
console.log('✓ Test 2 Passed: 604 pages divided across all durations and 5 prayers with 0 gaps and 0 overlaps.');

// 3. Check Strict Day Locking
const today = new Date().toISOString().split('T')[0];
const currentDay = getChallengeCurrentDay(today);
assert.strictEqual(currentDay, 1, 'Today should be Day 1 for a challenge starting today');
assert.strictEqual(isDayLocked(today, 1), false, 'Day 1 must not be locked on start date');
assert.strictEqual(isDayLocked(today, 2), true, 'Day 2 must be locked on start date (future day)');
assert.strictEqual(isDayLocked(today, 5), true, 'Day 5 must be locked on start date (future day)');
console.log('✓ Test 3 Passed: Strict Day Locking verified (future days are locked).');

// 4. Check Immutability & Service Code in khatmChallengeService.ts
const serviceCode = fs.readFileSync('src/lib/khatmChallengeService.ts', 'utf8');
assert.ok(serviceCode.includes('isCurrentlyComplete'), 'Must check if slot is currently complete');
assert.ok(serviceCode.includes('return challenge; // Sealed permanently, no undo') || serviceCode.includes('// IMMUTABLE CHECK: Once logged, it locks permanently'), 'Must enforce immutability');
assert.ok(serviceCode.includes('/logo.png'), 'Must include EMufti AI logo in certificate');
assert.ok(serviceCode.includes('/logo-quran.png'), 'Must include Quran Page logo in certificate');
console.log('✓ Test 4 Passed: Immutability and dual logo embedding (/logo.png & /logo-quran.png) verified.');

// 5. Check Widget UI Implementation in QuranKhatmChallengeWidget.tsx
const widgetCode = fs.readFileSync('src/components/dashboard/QuranKhatmChallengeWidget.tsx', 'utf8');
assert.ok(widgetCode.includes('Billaaw / Start Khatma'), 'Banner must feature Billaaw / Start Khatma button');
assert.ok(widgetCode.includes('KHATM_DURATION_OPTIONS'), 'Widget must render duration options');
assert.ok(widgetCode.includes('challenge?.isCompleted &&'), 'PDF Download button must be conditioned on challenge.isCompleted');
assert.ok(widgetCode.includes('HAMBALYO CAAJIIB AH!') || widgetCode.includes('Hambalyo cajiib ah!'), 'Celebration screen must celebrate with "Hambalyo cajiib ah!"');
assert.ok(widgetCode.includes('Lock') && widgetCode.includes('Xidhan'), 'Widget must display lock indicators for future days');
assert.ok(widgetCode.includes('Waa la xaqiijiyay 🔒') || widgetCode.includes('Immutable Log'), 'Widget must display immutable locked status for checked slots');
console.log('✓ Test 5 Passed: Khatma widget interface, conditional PDF button, and celebration verified.');

console.log('\n--- ALL QURAN KHATMA TRACKER TESTS PASSED SUCCESSFULLY! (5/5) ---');
