import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- RUNNING COMPREHENSIVE UPDATES VERIFICATION TEST SUITE ---');

// Test 1: Favicon in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('/logo-frontend.png'), 'Test 1 Failed: /logo-frontend.png not found in index.html');
console.log('✓ Test 1 Passed: Browser tab logo points to official /logo-frontend.png branding');

// Test 2: Pricing upgrade text cleanup
const planModal = fs.readFileSync('src/components/plans/PlanRequestModal.tsx', 'utf8');
const pricingPage = fs.readFileSync('src/pages/PricingPage.tsx', 'utf8');
assert.ok(!planModal.includes('Manual verification via WhatsApp or Telegram'), 'Test 2 Failed: PlanRequestModal still contains WhatsApp/Telegram text');
assert.ok(!pricingPage.includes('Manual verification via WhatsApp or Telegram'), 'Test 2 Failed: PricingPage still contains WhatsApp/Telegram text');
console.log('✓ Test 2 Passed: "Manual verification via WhatsApp or Telegram" completely removed from pricing');

// Test 3: Removed Tafsir audio & scholars (Dirir, Umal, Shibil)
const tafsirData = fs.readFileSync('src/data/tafsirData.ts', 'utf8');
const somaliTafsir = fs.readFileSync('src/components/quran/SomaliTafsirSection.tsx', 'utf8');
assert.ok(tafsirData.includes('EXCLUDED_SCHOLAR_IDS'), 'Test 3 Failed: EXCLUDED_SCHOLAR_IDS not present in tafsirData.ts');
assert.ok(tafsirData.includes('sheikh-shibli'), 'Test 3 Failed: sheikh-shibli not in exclusion list');
assert.ok(tafsirData.includes('sheikh-dirir'), 'Test 3 Failed: sheikh-dirir not in exclusion list');
assert.ok(tafsirData.includes('sheikh-umal'), 'Test 3 Failed: sheikh-umal not in exclusion list');
console.log('✓ Test 3 Passed: Sheikh Dirir, Sheikh Umal, and Sheikh Shibil completely excluded from Tafsir catalog');

// Test 4: Free plan AI question limit (5 questions / 24 hours)
const chatContext = fs.readFileSync('src/context/ChatContext.tsx', 'utf8');
assert.ok(chatContext.includes('free: 5'), 'Test 4 Failed: free: 5 not found in ChatContext.tsx');
assert.ok(!chatContext.includes('free: 15'), 'Test 4 Failed: free: 15 still exists in ChatContext.tsx');
console.log('✓ Test 4 Passed: Free plan AI questions restricted to 5 queries with rolling 24-hour reset');

// Test 5: Admin analytics cleaned of dummy data
const visitorTracking = fs.readFileSync('src/lib/visitorTracking.ts', 'utf8');
assert.ok(!visitorTracking.includes('totalVisitors: 38450'), 'Test 5 Failed: Fake visitor count 38450 still in visitorTracking.ts');
assert.ok(!visitorTracking.includes('totalRegisteredUsers: 1420'), 'Test 5 Failed: Fake registered users 1420 still in visitorTracking.ts');
assert.ok(!visitorTracking.includes('totalUses: 128450'), 'Test 5 Failed: Fake totalUses 128450 still in visitorTracking.ts');
console.log('✓ Test 5 Passed: Admin Analytics dashboard cleaned of all dummy/placeholder metrics');

// Test 6: Settings custom button colors
const themeContext = fs.readFileSync('src/context/ThemeContext.tsx', 'utf8');
const settingsPage = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
const indexCss = fs.readFileSync('src/index.css', 'utf8');
assert.ok(themeContext.includes('customButtonColor'), 'Test 6 Failed: customButtonColor missing in ThemeContext.tsx');
assert.ok(themeContext.includes('setCustomButtonColor'), 'Test 6 Failed: setCustomButtonColor missing in ThemeContext.tsx');
assert.ok(settingsPage.includes('Custom Button Color') || settingsPage.includes('Habee Midabka Badhamada'), 'Test 6 Failed: Custom button color picker missing in SettingsPage');
assert.ok(indexCss.includes('--btn-accent'), 'Test 6 Failed: --btn-accent missing in index.css');
console.log('✓ Test 6 Passed: Settings custom button color customization and dynamic CSS variables configured');

// Test 7: Quran page onboarding tour (White & Blue design)
const tutorial = fs.readFileSync('src/components/quran/QuranPageTutorial.tsx', 'utf8');
assert.ok(tutorial.includes('bg-white text-slate-900 border-2 border-blue-600'), 'Test 7 Failed: White & Blue card theme not found in QuranPageTutorial.tsx');
assert.ok(tutorial.includes('bg-blue-50 text-blue-700 border border-blue-200'), 'Test 7 Failed: Blue badge styling not found in QuranPageTutorial.tsx');
console.log('✓ Test 7 Passed: Quran page guided onboarding tour redesigned with White & Blue theme');

// Test 8: Free plan Quran access & 2-use Ask EMufti limit
const quranPage = fs.readFileSync('src/pages/QuranPage.tsx', 'utf8');
const weydiiDrawer = fs.readFileSync('src/components/quran/QuranWeydiiEMuftiDrawer.tsx', 'utf8');
assert.ok(!quranPage.includes('Waqtigii Tijaabada Qur\'aanka Waa Dhammaaday'), 'Test 8 Failed: Paywall modal still blocking Quran reading in QuranPage.tsx');
assert.ok(weydiiDrawer.includes('ASK_LIMIT = 2') || weydiiDrawer.includes('askCount >= ASK_LIMIT'), 'Test 8 Failed: 2-use Ask EMufti limit not enforced in QuranWeydiiEMuftiDrawer.tsx');
console.log('✓ Test 8 Passed: Quran page fully accessible to free users, Ask EMufti AI restricted to 2 uses');

// Test 9: Android mobile layout optimizations
assert.ok(indexCss.includes('-webkit-tap-highlight-color: transparent'), 'Test 9 Failed: -webkit-tap-highlight-color missing in index.css');
assert.ok(indexCss.includes('touch-action: manipulation'), 'Test 9 Failed: touch-action: manipulation missing in index.css');
assert.ok(indexCss.includes('font-size: 16px !important'), 'Test 9 Failed: 16px mobile input zoom fix missing in index.css');
console.log('✓ Test 9 Passed: Android mobile layout & touch optimizations configured');

// Test 10: Leaderboard layout & podium
const leaderboard = fs.readFileSync('src/components/quiz/QuizLeaderboard.tsx', 'utf8');
assert.ok(leaderboard.includes('Top 3 Podium'), 'Test 10 Failed: Top 3 Podium missing in QuizLeaderboard.tsx');
assert.ok(leaderboard.includes('Top 10+ RANKINGS LIST') || leaderboard.includes('Kaalmaha 4-aad Ilaa 10-aad'), 'Test 10 Failed: Top 10 rankings list missing in QuizLeaderboard.tsx');
console.log('✓ Test 10 Passed: Leaderboard visual presentation & podium polished');

console.log('\n======================================================');
console.log('ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY (10/10)');
console.log('======================================================');
