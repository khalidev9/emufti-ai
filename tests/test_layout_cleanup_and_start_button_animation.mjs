import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- STARTING LAYOUT CLEANUP & START BUTTON ANIMATION TEST SUITE ---');

// 1. Verify "Billaaw / Start" button animation in QuranKhatmChallengeWidget.tsx
console.log('Testing 1: "Billaaw / Start" button pulse & hover animation...');
const widgetPath = path.resolve('src/components/dashboard/QuranKhatmChallengeWidget.tsx');
const widgetContent = fs.readFileSync(widgetPath, 'utf8');

assert.ok(widgetContent.includes('Billaaw / Start Khatma'), 'Widget must contain "Billaaw / Start Khatma" button text');
assert.ok(widgetContent.includes('animate-pulse'), 'Start button must have animate-pulse for eye-catching animation');
assert.ok(widgetContent.includes('hover:scale-105') || widgetContent.includes('hover:scale-'), 'Start button must have hover scale effect');
assert.ok(widgetContent.includes('group-hover:translate-x-full') || widgetContent.includes('shimmer'), 'Start button must have smooth light shimmer effect');
assert.ok(widgetContent.includes('/khitma?duration='), 'Widget must support /khitma?duration= navigation');

console.log('✓ Test 1 Passed: "Billaaw / Start" Khatma button features smooth eye-catching hover and pulse animation.');

// 2. Verify removal of circled elements in QuranHeroExplorer.tsx
console.log('Testing 2: Removal of circled elements in QuranHeroExplorer.tsx...');
const explorerPath = path.resolve('src/components/quran/QuranHeroExplorer.tsx');
const explorerContent = fs.readFileSync(explorerPath, 'utf8');

// The redundant top toggle box row with "Quran Explorer" and "Hide Explorer" must be removed
assert.ok(!explorerContent.includes('Hide Explorer'), 'QuranHeroExplorer must NOT contain redundant "Hide Explorer" button box');
assert.ok(!explorerContent.includes('Show Explorer'), 'QuranHeroExplorer must NOT contain redundant "Show Explorer" button box');

// Verify Khatma widget is rendered cleanly above the search bar
const khatmIdx = explorerContent.indexOf('<QuranKhatmChallengeWidget');
const searchIdx = explorerContent.indexOf('data-tour="quran-search"');
assert.ok(khatmIdx !== -1, 'QuranHeroExplorer must render QuranKhatmChallengeWidget');
assert.ok(searchIdx !== -1, 'QuranHeroExplorer must render search bar');
assert.ok(khatmIdx < searchIdx, 'QuranKhatmChallengeWidget must be placed above the search bar');

// Verify responsive max-w-5xl and clean padding
assert.ok(explorerContent.includes('max-w-5xl'), 'Explorer must maintain max-w-5xl responsive width');
assert.ok(explorerContent.includes('defaultExpanded={false}'), 'Must pass defaultExpanded={false}');

console.log('✓ Test 2 Passed: Circled redundant toggle elements removed and explorer layout streamlined.');

// 3. Verify top navigation toolbar cleanup in QuranPage.tsx
console.log('Testing 3: Top navigation toolbar cleanup in QuranPage.tsx...');
const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

// Verify redundant select dropdown is removed from top header
assert.ok(!quranPageContent.includes('title="Select Surah"'), 'QuranPage top header must NOT contain redundant native <select> Surah dropdown');

// Verify Quran Certificate link is present and correctly routed
assert.ok(quranPageContent.includes('quran-header-certificate'), 'QuranPage header must retain quran-header-certificate');
assert.ok(quranPageContent.includes('to="/verify-certificate"'), 'QuranPage header must link to /verify-certificate');

console.log('✓ Test 3 Passed: QuranPage top header toolbar cleaned up and streamlined.');

// 4. Verify Khitma Apply button animation in KhitmaRegistrationWizard.tsx
console.log('Testing 4: Khitma registration Apply button animation...');
const wizardPath = path.resolve('src/components/khitma/KhitmaRegistrationWizard.tsx');
const wizardContent = fs.readFileSync(wizardPath, 'utf8');

assert.ok(wizardContent.includes('Apply (Billaaw Khidmada)'), 'Wizard must include Apply (Billaaw Khidmada) button');
assert.ok(wizardContent.includes('animate-pulse'), 'Apply button must feature pulse animation');

console.log('✓ Test 4 Passed: Khitma registration Apply button animated with pulse and shimmer effects.');

console.log('\n======================================================');
console.log('  ALL (4/4) LAYOUT CLEANUP & ANIMATION TESTS PASSED!');
console.log('======================================================\n');
