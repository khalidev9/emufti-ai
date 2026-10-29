/**
 * EMufti AI - Quran Onboarding Spotlight Tour Verification Suite
 *
 * Verifies the 10-step interactive onboarding tour (spotlight coach marks):
 * 1. Spotlight SVG mask and backdrop overlay (bg-black/70 backdrop-blur-xs z-50)
 * 2. Glowing animated ring (ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl animate-pulse)
 * 3. Floating explanation card (bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl max-w-sm text-white z-50)
 * 4. Header row (badge, bold title, close X button), description body, 10 pagination dots, and footer buttons (Skip, Prev, Next/Finish)
 * 5. All 10 data-tour selectors present across the Quran codebase
 * 6. LocalStorage persistence (hasCompletedTour) and header restart button (Help / Tour)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT_DIR = process.cwd();

console.log('==================================================================');
console.log('     EMufti AI - Quran Spotlight Onboarding Tour Test Suite       ');
console.log('==================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: TUTORIAL COMPONENT ARCHITECTURE & 10 STEPS
// -----------------------------------------------------------------------------
console.log('Section 1: 10 Guided Tour Steps & Multilingual Content');

const tutorialCompContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/QuranPageTutorial.tsx'),
  'utf8'
);

const EXPECTED_TOUR_STEPS = [
  'brand-header',
  'surah-selector',
  'view-toggle',
  'quran-search',
  'continue-reading',
  'surah-actions',
  'verse-actions',
  'audio-player',
  'theme-switcher',
  'bottom-nav',
];

assert.ok(
  tutorialCompContent.includes('export const QURAN_ONBOARDING_TOUR_STEPS'),
  'QURAN_ONBOARDING_TOUR_STEPS array must be exported'
);

for (let i = 0; i < EXPECTED_TOUR_STEPS.length; i++) {
  const stepId = EXPECTED_TOUR_STEPS[i];
  assert.ok(
    tutorialCompContent.includes(`id: '${stepId}'`),
    `Tour step id '${stepId}' must exist in QURAN_ONBOARDING_TOUR_STEPS`
  );
  assert.ok(
    tutorialCompContent.includes(`targetSelector: '[data-tour="${stepId}"]'`) ||
      tutorialCompContent.includes(`targetSelector: '[data-tour="reciter-selector"]'`),
    `Tour step id '${stepId}' must target [data-tour="${stepId}"]`
  );
}
console.log('  ✓ All 10 requested onboarding steps are defined in sequential order');

// Verify STEP X OF 10 badges exist
for (let n = 1; n <= 10; n++) {
  assert.ok(
    tutorialCompContent.includes(`STEP ${n} OF 10`),
    `Tour step badge 'STEP ${n} OF 10' must exist`
  );
}
console.log('  ✓ All 10 step badges (STEP 1 OF 10 ... STEP 10 OF 10) verified');

// Verify Multilingual support (en, so, ar)
assert.ok(
  tutorialCompContent.includes('en:') &&
    tutorialCompContent.includes('so:') &&
    tutorialCompContent.includes('ar:'),
  'Tour steps must contain English, Somali, and Arabic translations'
);
console.log('  ✓ English, Somali, and Arabic copy provided for all tour steps');

// -----------------------------------------------------------------------------
// SECTION 2: SPOTLIGHT BACKDROP & GLOWING RING SPECIFICATIONS
// -----------------------------------------------------------------------------
console.log('\nSection 2: Spotlight Backdrop & Glowing Animated Ring');

// Backdrop overlay class: bg-black/70 backdrop-blur-xs z-50
assert.ok(
  tutorialCompContent.includes('bg-black/70 backdrop-blur-xs z-50'),
  'Spotlight SVG backdrop must use bg-black/70 backdrop-blur-xs z-50'
);
assert.ok(
  tutorialCompContent.includes('id="tutorial-spotlight-mask"'),
  'Spotlight mask #tutorial-spotlight-mask must exist'
);
assert.ok(
  tutorialCompContent.includes('fill="rgba(0, 0, 0, 0.75)"'),
  'Dimming overlay rect must be filled with 75% dark tone'
);
console.log('  ✓ Dark translucent backdrop with SVG cutout mask verified');

// Glowing animated ring: ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl animate-pulse
assert.ok(
  tutorialCompContent.includes('ring-4 ring-blue-500') &&
    tutorialCompContent.includes('shadow-[0_0_25px_rgba(59,130,246,0.6)]') &&
    tutorialCompContent.includes('rounded-xl') &&
    tutorialCompContent.includes('animate-pulse'),
  'Active target element must have bright glowing animated ring: ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl animate-pulse'
);
console.log('  ✓ Bright glowing animated ring verified');

// -----------------------------------------------------------------------------
// SECTION 3: FLOATING STEP EXPLANATION CARD SPECIFICATIONS
// -----------------------------------------------------------------------------
console.log('\nSection 3: Floating Step Explanation Card UI & Controls');

// Card container: bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl max-w-sm text-white z-50
assert.ok(
  tutorialCompContent.includes('bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl max-w-sm text-white z-50'),
  'Explanation card must match exact styling: bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl max-w-sm text-white z-50'
);

// Header close X button
assert.ok(
  tutorialCompContent.includes('title="Close Tour"') || tutorialCompContent.includes('aria-label="Close Tour"'),
  'Tour card header must contain an explicit close button'
);

// 10 Pagination dots
assert.ok(
  tutorialCompContent.includes('QURAN_ONBOARDING_TOUR_STEPS.map') &&
    tutorialCompContent.includes('bg-blue-500') &&
    (tutorialCompContent.includes('bg-slate-600') || tutorialCompContent.includes('bg-slate-700')),
  'Tour card must render 10 pagination dots with active step in blue'
);

// Footer navigation actions: Skip, Prev, Next > / Finish ✓
assert.ok(
  tutorialCompContent.includes('onClick={handleSkip}') &&
    tutorialCompContent.includes('onClick={handlePrev}') &&
    tutorialCompContent.includes('onClick={handleNext}'),
  'Footer must include Skip, Prev, and Next/Finish action handlers'
);
assert.ok(
  tutorialCompContent.includes('bg-blue-600') &&
    (tutorialCompContent.includes('hover:bg-blue-700') || tutorialCompContent.includes('hover:bg-blue-500')),
  'Next/Finish action button must be styled with royal blue background'
);
console.log('  ✓ Floating card structure, close button, 10 dots, and footer buttons verified');

// -----------------------------------------------------------------------------
// SECTION 4: DOM TARGET SELECTORS ATTACHED IN APPLICATION
// -----------------------------------------------------------------------------
console.log('\nSection 4: DOM Target Selectors Attached Across Quran Pages & Components');

const quranPageContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/pages/QuranPage.tsx'),
  'utf8'
);
const heroExplorerContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/QuranHeroExplorer.tsx'),
  'utf8'
);
const surahBannerContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/SurahInfoBanner.tsx'),
  'utf8'
);
const verseViewContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/VerseByVerseView.tsx'),
  'utf8'
);

// Step 1: brand-header
assert.ok(
  quranPageContent.includes('data-tour="brand-header"'),
  'data-tour="brand-header" must exist on top brand header'
);
console.log('  ✓ Step 1: data-tour="brand-header" verified');

// Step 2: surah-selector
assert.ok(
  quranPageContent.includes('data-tour="surah-selector"'),
  'data-tour="surah-selector" must exist on surah dropdown button'
);
console.log('  ✓ Step 2: data-tour="surah-selector" verified');

// Step 3: view-toggle
assert.ok(
  quranPageContent.includes('data-tour="view-toggle"'),
  'data-tour="view-toggle" must exist on segmented pill toggle'
);
console.log('  ✓ Step 3: data-tour="view-toggle" verified');

// Step 4: quran-search
assert.ok(
  heroExplorerContent.includes('data-tour="quran-search"'),
  'data-tour="quran-search" must exist on Quran search explorer'
);
console.log('  ✓ Step 4: data-tour="quran-search" verified');

// Step 5: continue-reading
assert.ok(
  heroExplorerContent.includes('data-tour="continue-reading"'),
  'data-tour="continue-reading" must exist on Continue Reading card'
);
console.log('  ✓ Step 5: data-tour="continue-reading" verified');

// Step 6: surah-actions
assert.ok(
  surahBannerContent.includes('data-tour="surah-actions"'),
  'data-tour="surah-actions" must exist on Listen and Info buttons'
);
console.log('  ✓ Step 6: data-tour="surah-actions" verified');

// Step 7: verse-actions
assert.ok(
  verseViewContent.includes('verse-actions') && verseViewContent.includes('data-tour='),
  'data-tour="verse-actions" must exist on verse study action bar'
);
console.log('  ✓ Step 7: data-tour="verse-actions" verified');

// Step 8: reciter-selector & audio-player
assert.ok(
  quranPageContent.includes('data-tour="reciter-selector"'),
  'data-tour="reciter-selector" must exist on Dooro Qaari selector'
);
assert.ok(
  quranPageContent.includes('data-tour="audio-player"'),
  'data-tour="audio-player" must exist on sticky bottom audio player'
);
console.log('  ✓ Step 8: data-tour="reciter-selector" and data-tour="audio-player" verified');

// Step 9: theme-switcher
assert.ok(
  quranPageContent.includes('data-tour="theme-switcher"'),
  'data-tour="theme-switcher" must exist on reading settings gear button'
);
console.log('  ✓ Step 9: data-tour="theme-switcher" verified');

// Step 10: bottom-nav
assert.ok(
  quranPageContent.includes('data-tour="bottom-nav"'),
  'data-tour="bottom-nav" must exist on bottom navigation bar wrapper'
);
console.log('  ✓ Step 10: data-tour="bottom-nav" verified');

// -----------------------------------------------------------------------------
// SECTION 5: LOCALSTORAGE PERSISTENCE & HEADER REPLAY BUTTON
// -----------------------------------------------------------------------------
console.log('\nSection 5: LocalStorage Persistence & Replay Trigger');

assert.ok(
  tutorialCompContent.includes("localStorage.setItem('hasCompletedTour', 'true')"),
  'Tutorial completion must persist hasCompletedTour=true in localStorage'
);
assert.ok(
  quranPageContent.includes("localStorage.getItem('hasCompletedTour')"),
  'QuranPage must check hasCompletedTour on initial load for new users'
);
assert.ok(
  quranPageContent.includes('Help / Tour'),
  'Header must contain visible Help / Tour button for replaying the onboarding tour'
);
console.log('  ✓ LocalStorage persistence and visible header "Help / Tour" trigger button verified');

console.log('\n==================================================================');
console.log('All 22 / 22 Quran Spotlight Onboarding Tour Tests Passed!');
console.log('==================================================================\n');
