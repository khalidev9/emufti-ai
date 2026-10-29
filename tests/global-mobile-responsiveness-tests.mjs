import { readFileSync } from 'fs';
import { resolve } from 'path';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('GLOBAL MOBILE RESPONSIVENESS & LAYOUT OVERFLOW TEST SUITE');
console.log('================================================================\n');

// 1. Check index.css
const indexCss = readFileSync(resolve('src/index.css'), 'utf-8');

assert(
  indexCss.includes('overflow-x: hidden !important;'),
  'index.css enforces overflow-x: hidden !important on html and body'
);

assert(
  !indexCss.includes('overflow-x: visible;'),
  'index.css completely removes old overflow-x: visible'
);

assert(
  indexCss.includes('#root {') && indexCss.includes('max-width: 100vw;'),
  'index.css bounds #root to max-width: 100vw and overflow-x: hidden'
);

assert(
  indexCss.includes('box-sizing: border-box;'),
  'index.css enforces box-sizing: border-box globally'
);

assert(
  indexCss.includes('overflow-wrap: break-word;'),
  'index.css safeguards typography with overflow-wrap: break-word'
);

assert(
  indexCss.includes('img, video, canvas, svg {') && indexCss.includes('max-width: 100%'),
  'index.css bounds media elements to max-width: 100%'
);

// 2. Check Header.tsx
const headerTsx = readFileSync(resolve('src/components/layout/Header.tsx'), 'utf-8');
assert(
  !headerTsx.includes('overflow-visible'),
  'Header.tsx removes overflow-visible class'
);
assert(
  headerTsx.includes('max-w-full box-border'),
  'Header.tsx contains max-w-full box-border'
);

// 3. Check ChatPage.tsx
const chatPageTsx = readFileSync(resolve('src/pages/ChatPage.tsx'), 'utf-8');
assert(
  chatPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'ChatPage.tsx wraps main canvas and containers with max-w-full overflow-x-hidden box-border'
);

// 4. Check QuranPage.tsx
const quranPageTsx = readFileSync(resolve('src/pages/QuranPage.tsx'), 'utf-8');
assert(
  !quranPageTsx.includes("overflow: 'visible'") && !quranPageTsx.includes('overflow-visible'),
  'QuranPage.tsx completely eliminates overflow: visible and overflow-visible from workspace containers'
);
assert(
  quranPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'QuranPage.tsx bounds main reader containers with max-w-full overflow-x-hidden box-border'
);

// 5. Check DashboardPage.tsx
const dashboardPageTsx = readFileSync(resolve('src/pages/DashboardPage.tsx'), 'utf-8');
assert(
  dashboardPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'DashboardPage.tsx applies max-w-full overflow-x-hidden box-border to root and main canvas'
);

// 6. Check SettingsPage.tsx
const settingsPageTsx = readFileSync(resolve('src/pages/SettingsPage.tsx'), 'utf-8');
assert(
  settingsPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'SettingsPage.tsx applies max-w-full overflow-x-hidden box-border to root and containers'
);

// 7. Check QuizPage.tsx
const quizPageTsx = readFileSync(resolve('src/pages/QuizPage.tsx'), 'utf-8');
assert(
  quizPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'QuizPage.tsx applies max-w-full overflow-x-hidden box-border to root and main canvas'
);
assert(
  quizPageTsx.includes('flex-shrink-0 shrink-0 px-4 py-2.5 rounded-2xl'),
  'QuizPage.tsx applies shrink-0 to horizontal swipe tabs to prevent squishing on mobile'
);

// 8. Check LandingPage.tsx & PricingPage.tsx
const landingPageTsx = readFileSync(resolve('src/pages/LandingPage.tsx'), 'utf-8');
assert(
  landingPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'LandingPage.tsx applies max-w-full overflow-x-hidden box-border to root wrapper'
);

const pricingPageTsx = readFileSync(resolve('src/pages/PricingPage.tsx'), 'utf-8');
assert(
  pricingPageTsx.includes('max-w-full overflow-x-hidden box-border'),
  'PricingPage.tsx applies max-w-full overflow-x-hidden box-border to root and main canvas'
);

// 9. Check AuthPages.tsx
const authPagesTsx = readFileSync(resolve('src/pages/AuthPages.tsx'), 'utf-8');
assert(
  authPagesTsx.includes('max-w-full overflow-x-hidden box-border'),
  'AuthPages.tsx applies max-w-full overflow-x-hidden box-border to root container'
);

// 10. Check PlanRequestModal.tsx & RamadanOfferBanner.tsx
const planModalTsx = readFileSync(resolve('src/components/plans/PlanRequestModal.tsx'), 'utf-8');
assert(
  planModalTsx.includes('w-full max-w-full box-border'),
  'PlanRequestModal.tsx applies w-full max-w-full box-border to modal dialog'
);

const ramadanBannerTsx = readFileSync(resolve('src/components/chat/RamadanOfferBanner.tsx'), 'utf-8');
assert(
  ramadanBannerTsx.includes('w-full max-w-full box-border'),
  'RamadanOfferBanner.tsx applies w-full max-w-full box-border to banner and popup modal'
);

// 11. Check ChatMessage.tsx
const chatMessageTsx = readFileSync(resolve('src/components/chat/ChatMessage.tsx'), 'utf-8');
assert(
  chatMessageTsx.includes('w-full max-w-full overflow-x-hidden box-border'),
  'ChatMessage.tsx applies w-full max-w-full overflow-x-hidden box-border to messages'
);

// 12. Check Sidebar.tsx
const sidebarTsx = readFileSync(resolve('src/components/layout/Sidebar.tsx'), 'utf-8');
assert(
  sidebarTsx.includes('box-border max-w-full overflow-hidden'),
  'Sidebar.tsx applies box-border max-w-full overflow-hidden'
);

console.log('\n================================================================');
console.log(`RESULTS: ${passedTests} passed, ${failedTests} failed.`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
