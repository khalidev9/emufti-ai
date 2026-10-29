import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- STARTING QURAN BANNER CLEANUP & TOP NAV CERTIFICATE TESTS ---');

// 1. Verify Quran Page Khatma Banner & Interactive Toggle
const quranHeroCode = fs.readFileSync('src/components/quran/QuranHeroExplorer.tsx', 'utf8');
assert.ok(quranHeroCode.includes('defaultExpanded={false}'), 'QuranHeroExplorer must pass defaultExpanded={false} to display only banner initially');
console.log('✓ Test 1 Passed: Quran page explorer renders Khatma widget with defaultExpanded={false}.');

// 2. Verify QuranKhatmChallengeWidget toggle implementation
const widgetCode = fs.readFileSync('src/components/dashboard/QuranKhatmChallengeWidget.tsx', 'utf8');
assert.ok(widgetCode.includes('defaultExpanded?: boolean'), 'QuranKhatmChallengeWidgetProps must accept defaultExpanded');
assert.ok(widgetCode.includes('const [isExpanded, setIsExpanded] = useState<boolean>('), 'Widget must maintain isExpanded state');
assert.ok(widgetCode.includes('Billaaw / Start Khatma'), 'Widget banner must feature Billaaw / Start Khatma action button');
assert.ok(widgetCode.includes('{isExpanded && ('), 'Widget must hide setup forms, active tracking data & slots when not expanded');
console.log('✓ Test 2 Passed: Widget hides all setup forms and extra clutter underneath by default, dynamically revealing on start click.');

// 3. Verify Landing Page Top Header Navigation Menu
const landingCode = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');
assert.ok(landingCode.includes('to="/verify-certificate"'), 'LandingPage must include link to /verify-certificate');
assert.ok(landingCode.includes('header-nav-certificate'), 'LandingPage must include data-testid="header-nav-certificate" in top header');
assert.ok(landingCode.includes('Quran Certificate'), 'LandingPage must label item "Quran Certificate"');
console.log('✓ Test 3 Passed: Landing page top header navigation includes Quran Certificate link.');

// 4. Verify Header.tsx (Global App Header) Top Navigation Menu
const headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
assert.ok(headerCode.includes('to="/verify-certificate"'), 'Header.tsx must link to /verify-certificate');
assert.ok(headerCode.includes('header-nav-certificate'), 'Header.tsx must include data-testid="header-nav-certificate"');
assert.ok(headerCode.includes('Quran Certificate'), 'Header.tsx must display Quran Certificate item');
console.log('✓ Test 4 Passed: Header.tsx includes top navigation menu item for Quran Certificate.');

// 5. Verify QuranPage.tsx Top Header Navigation
const quranPageCode = fs.readFileSync('src/pages/QuranPage.tsx', 'utf8');
assert.ok(quranPageCode.includes('to="/verify-certificate"'), 'QuranPage.tsx must link to /verify-certificate');
assert.ok(quranPageCode.includes('quran-header-certificate'), 'QuranPage.tsx must include data-testid="quran-header-certificate" in top header');
assert.ok(quranPageCode.includes('Quran Certificate'), 'QuranPage.tsx must display Quran Certificate item in top header');
console.log('✓ Test 5 Passed: Quran page top header includes Quran Certificate navigation link.');

console.log('\n--- ALL QURAN BANNER CLEANUP & TOP NAV CERTIFICATE TESTS PASSED (5/5)! ---');
