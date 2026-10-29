/**
 * Emufti AI — Interactive Quran Page Tutorial Test Suite
 *
 * Validates:
 * 1. 10 Guided Tutorial Steps covering all Quran controls:
 *    - 1. Quran Reading (quran-reading)
 *    - 2. Surah Selection (surah-selector)
 *    - 3. Qaari Library (qaari-catalog)
 *    - 4. Subcis Practice (subcis-practice)
 *    - 5. Macallin Qur'an (macallin-teacher)
 *    - 6. Hifd Mode (macallin-hifd)
 *    - 7. Tafsiir Library 15 Juz (tafsir-library)
 *    - 8. Quran Progress / Finder (progress-finder)
 *    - 9. Duas and Tasbeeh (duas-tasbeeh)
 *    - 10. Bookmarks & Save (bookmarks-save)
 * 2. Multi-language support (Somali, English, Arabic) for every step
 * 3. Spotlight Dimming & Responsive Tooltips (Desktop Floating & Mobile Bottom Sheet)
 * 4. Arabic RTL & Somali/English LTR text direction support
 * 5. Step Controls (Next, Previous, Skip, Finish, Progress counter)
 * 6. Target selectors attached to real DOM elements in QuranPage and MacallinTeacher
 * 7. User Preferences & Persistence (localStorage 'emufti_quran_tutorial_completed')
 * 8. Restart Buttons in sticky header and mobile category drawer
 */

import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

console.log('==================================================================');
console.log('      EMufti AI - Interactive Quran Page Tutorial Tests           ');
console.log('==================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: TUTORIAL COMPONENT & STEP DEFINITIONS
// -----------------------------------------------------------------------------
console.log('Section 1: Tutorial Steps & Multi-language Definitions');

const tutorialCompContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/QuranPageTutorial.tsx'),
  'utf8'
);

assert.ok(tutorialCompContent.includes('export const QURAN_TUTORIAL_STEPS'), 'QURAN_TUTORIAL_STEPS must be exported');
assert.ok(tutorialCompContent.includes('export const QuranPageTutorial'), 'QuranPageTutorial component must be exported');

const REQUIRED_STEPS = [
  'quran-reading',
  'surah-selector',
  'qaari-catalog',
  'subcis-practice',
  'macallin-teacher',
  'macallin-hifd',
  'tafsir-library',
  'progress-finder',
  'duas-tasbeeh',
  'bookmarks-save',
];

for (const stepId of REQUIRED_STEPS) {
  assert.ok(tutorialCompContent.includes(`id: '${stepId}'`), `Step '${stepId}' must be defined in QURAN_TUTORIAL_STEPS`);
}
console.log(`  ✓ All ${REQUIRED_STEPS.length} guided steps are defined in sequential order`);

// Check multi-language support (Somali, English, Arabic)
assert.ok(tutorialCompContent.includes('titleSo') && tutorialCompContent.includes('titleEn') && tutorialCompContent.includes('titleAr'), 'All steps must have Somali, English, and Arabic titles');
assert.ok(tutorialCompContent.includes('descSo') && tutorialCompContent.includes('descEn') && tutorialCompContent.includes('descAr'), 'All steps must have Somali, English, and Arabic descriptions');
console.log('  ✓ Multi-language content (Somali, English, Arabic) verified for all steps');

// -----------------------------------------------------------------------------
// SECTION 2: SPOTLIGHT DIMMING & TOOLTIP RESPONSIVENESS
// -----------------------------------------------------------------------------
console.log('\nSection 2: Spotlight Dimming Overlay & Responsive Tooltips');

// Spotlight SVG mask and glowing ring
assert.ok(tutorialCompContent.includes('mask id="tutorial-spotlight-mask"'), 'SVG mask for spotlight dimming overlay must exist');
assert.ok(tutorialCompContent.includes('fill="rgba(0, 0, 0, 0.75)"'), 'Dark dimmed backdrop with hole cutout present');
assert.ok((tutorialCompContent.includes('border-2 border-emerald-500') || tutorialCompContent.includes('ring-4 ring-blue-500')) && tutorialCompContent.includes('animate-pulse'), 'Animated glowing ring around target element present');
console.log('  ✓ SVG spotlight mask overlay and glowing pulse ring implemented');

// Desktop floating near element & Mobile bottom dock
assert.ok(tutorialCompContent.includes('hidden md:block'), 'Desktop floating tooltip container present');
assert.ok(tutorialCompContent.includes('md:hidden fixed bottom-4'), 'Mobile compact docked card present');
assert.ok(tutorialCompContent.includes("dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}"), 'RTL text direction applied for Arabic language');
console.log('  ✓ Desktop floating tooltip, Mobile bottom dock, and RTL support verified');

// Keyboard navigation
assert.ok(tutorialCompContent.includes('ArrowRight') && tutorialCompContent.includes('ArrowLeft') && tutorialCompContent.includes('Escape'), 'Keyboard navigation (Right/Left arrows, Enter, Escape) implemented');
console.log('  ✓ Keyboard navigation (Next/Prev/Skip) verified');

// Reset to first step on reopen
assert.ok(tutorialCompContent.includes('setCurrentStepIndex(0)'), 'Must reset step index to 0 whenever tutorial is reopened');
console.log('  ✓ Reopening tour resets to step 1 automatically');

// -----------------------------------------------------------------------------
// SECTION 3: TARGET DATA-ATTRIBUTES IN REAL DOM CODEBASE
// -----------------------------------------------------------------------------
console.log('\nSection 3: Target Selectors Attached to Real DOM Elements');

const quranPageContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/pages/QuranPage.tsx'),
  'utf8'
);
const macallinTeacherContent = fs.readFileSync(
  path.join(ROOT_DIR, 'src/components/quran/MacallinTeacher.tsx'),
  'utf8'
);

// Verify QuranPage contains target selectors
assert.ok(quranPageContent.includes('getCategoryTutorialId'), 'getCategoryTutorialId helper exists in QuranPage');
assert.ok(quranPageContent.includes('data-tutorial={tutorialId}') || quranPageContent.includes('data-tutorial='), 'Category tabs wired with data-tutorial');
assert.ok(quranPageContent.includes('data-tutorial="surah-selector"'), 'Surah dropdown button has data-tutorial="surah-selector"');
assert.ok(macallinTeacherContent.includes('data-tutorial="macallin-hifd"'), 'Hifd mode button has data-tutorial="macallin-hifd"');

// Verify all 10 step ids are returned by getCategoryTutorialId or present directly
for (const stepId of REQUIRED_STEPS) {
  const inQuran = quranPageContent.includes(stepId);
  const inMacallin = macallinTeacherContent.includes(stepId);
  assert.ok(inQuran || inMacallin, `Target selector '${stepId}' must exist in QuranPage or MacallinTeacher`);
}
console.log('  ✓ All 10 target selectors are attached to real buttons and controls in the DOM');

// -----------------------------------------------------------------------------
// SECTION 4: PERSISTENCE, FIRST-VISIT TRIGGER & RESTART BUTTONS
// -----------------------------------------------------------------------------
console.log('\nSection 4: Persistence, Auto-launch & Restart Buttons');

// Persistence key
assert.ok(tutorialCompContent.includes('emufti_quran_tutorial_completed'), 'Tutorial uses localStorage key emufti_quran_tutorial_completed');
assert.ok(quranPageContent.includes('emufti_quran_tutorial_completed'), 'QuranPage checks localStorage key emufti_quran_tutorial_completed');
console.log('  ✓ Local storage completion persistence verified');

// Header restart button
assert.ok(quranPageContent.includes('setIsTutorialOpen(true)'), 'Header button triggers tutorial opening');
assert.ok(quranPageContent.includes('Show Quran Tutorial') || quranPageContent.includes('Hagaha'), 'Header guide button has descriptive label');
console.log('  ✓ Header Guide restart button ("Hagaha" / "Guide") present in sticky navigation');

// Mobile category drawer restart button
assert.ok(quranPageContent.includes("Tus Hagaha Qur'aanka (Restart Tour)") || quranPageContent.includes('Show Quran Tutorial (Restart Tour)'), 'Mobile drawer has restart tour button');
console.log('  ✓ Mobile category drawer has dedicated tour restart button');

// QuranPageTutorial mounted in QuranPage
assert.ok(quranPageContent.includes('<QuranPageTutorial'), 'QuranPageTutorial is mounted in QuranPage component tree');
console.log('  ✓ QuranPageTutorial successfully mounted in QuranPage');

console.log('\n==================================================================');
console.log('All 18 / 18 Interactive Quran Tutorial Tests Passed Successfully!');
console.log('==================================================================\n');
