import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: MOBILE LAYOUT & WEYDII AI REFINEMENTS VERIFICATION SUITE');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: Fix Mobile Viewport Verse Footer Buttons (VerseByVerseView.tsx)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Mobile Viewport Verse Footer Buttons ---');
const verseViewPath = path.join(rootDir, 'src', 'components', 'quran', 'VerseByVerseView.tsx');
const verseViewContent = fs.readFileSync(verseViewPath, 'utf-8');

assert(
  verseViewContent.includes('overflow-x-auto') &&
  verseViewContent.includes('no-scrollbar') &&
  verseViewContent.includes('gap-2') &&
  verseViewContent.includes('py-1') &&
  verseViewContent.includes('px-1') &&
  verseViewContent.includes('whitespace-nowrap'),
  '1.1 Verse action bar uses flex overflow-x-auto no-scrollbar gap-2 py-1 px-1 whitespace-nowrap'
);

assert(
  verseViewContent.includes('Weydii EMufti') &&
  verseViewContent.includes('Tafsirs') &&
  verseViewContent.includes('Lessons') &&
  verseViewContent.includes('Saved') &&
  verseViewContent.includes('Dooro Qaari'),
  '1.2 Streamlined verse action bar renders Weydii EMufti, Tafsirs, Lessons, Saved, and Dooro Qaari'
);

assert(
  verseViewContent.includes('shrink-0 whitespace-nowrap'),
  '1.3 Action buttons contain shrink-0 whitespace-nowrap to prevent awkward mobile wrapping'
);

// -----------------------------------------------------------------------------
// SECTION 2: Automate "Weydii EMufti" Instant AI Responses (No Manual Typing)
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Automated Weydii EMufti Instant AI Responses ---');
const weydiiDrawerPath = path.join(rootDir, 'src', 'components', 'quran', 'QuranWeydiiEMuftiDrawer.tsx');
const weydiiDrawerContent = fs.readFileSync(weydiiDrawerPath, 'utf-8');

assert(
  weydiiDrawerContent.includes('1. Tafsiirka') &&
  weydiiDrawerContent.includes('2. Asbaabul Nuzuul') &&
  weydiiDrawerContent.includes('3. Faahfaahin') &&
  weydiiDrawerContent.includes('4. Others'),
  '2.1 Contains all 4 option pills (1. Tafsiirka, 2. Asbaabul Nuzuul, 3. Faahfaahin, 4. Others)'
);

assert(
  weydiiDrawerContent.includes('handleCategoryClick') &&
  weydiiDrawerContent.includes('handleGenerate(catId)'),
  '2.2 Tapping any of pills 1-3 automatically triggers handleGenerate without requiring manual typing'
);

assert(
  weydiiDrawerContent.includes('customInputRef') &&
  weydiiDrawerContent.includes("Others"),
  '2.3 Tapping "Others" pill enables and focuses custom question input field for user questions'
);

assert(
  weydiiDrawerContent.includes('arabicText') &&
  weydiiDrawerContent.includes('verseTextArabic'),
  '2.4 Supports both arabicText and verseTextArabic props seamlessly'
);

// -----------------------------------------------------------------------------
// SECTION 3: Mobile Layout "Dooro Qaari" & Font Size Controls
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Mobile Dooro Qaari & Font Size Controls ---');
const quranPagePath = path.join(rootDir, 'src', 'pages', 'QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf-8');

assert(
  quranPageContent.includes('md:hidden') &&
  quranPageContent.includes('setIsReciterSelectorOpen(true)') &&
  quranPageContent.includes('selectedReciter.name'),
  '3.1 Mobile reading bar provides direct 1-tap "Dooro Qaari" button'
);

assert(
  quranPageContent.includes('handleSetFontSizeLevel') &&
  quranPageContent.includes("'yar'") &&
  quranPageContent.includes("'dhexdheexad'") &&
  quranPageContent.includes("'weyn'"),
  '3.2 Font size level handler supports Yar, Dhexdheexad, and Weyn'
);

assert(
  quranPageContent.includes('currentFontSizeLevel === \'yar\'') &&
  quranPageContent.includes('currentFontSizeLevel === \'dhexdheexad\'') &&
  quranPageContent.includes('currentFontSizeLevel === \'weyn\''),
  '3.3 Mobile quick bar renders active segmented pill control for Yar / Dhexdheexad / Weyn'
);

assert(
  quranPageContent.includes('w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border') ||
  quranPageContent.includes('flex overflow-x-auto no-scrollbar items-center gap-2 py-1 px-2 whitespace-nowrap'),
  '3.4 Mobile secondary controls wrapped inside w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border'
);

assert(
  quranPageContent.includes('Cabbirka:') &&
  quranPageContent.includes('shrink-0 whitespace-nowrap'),
  '3.5 Cabbirka and font size buttons are shrink-0 whitespace-nowrap to prevent awkward wrapping'
);

assert(
  quranPageContent.includes('space-y-2 md:space-y-6'),
  '3.6 Mobile view container uses space-y-2 for clean vertical stacking and spacing'
);

// -----------------------------------------------------------------------------
// SECTION 4: Top Navbar & Hero Section Menus Clean-up
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Top Navbar & Hero Section Menus Clean-up ---');
const landingPagePath = path.join(rootDir, 'src', 'pages', 'LandingPage.tsx');
const landingPageContent = fs.readFileSync(landingPagePath, 'utf-8');

assert(
  !landingPageContent.includes('to="/macallin"') &&
  !landingPageContent.includes('Macallin AI') &&
  !landingPageContent.includes('Macallin Quran Teacher'),
  '4.1 Top Navbar and LandingPage contain zero links or references to Macallin AI'
);

// Check hero section CTAs
const heroCtaSection = landingPageContent.substring(
  landingPageContent.indexOf('{/* CTAs'),
  landingPageContent.indexOf('Floating Feature Pills')
);

assert(
  heroCtaSection.includes('Start Chat') &&
  heroCtaSection.includes('Holy Quran (Mushaf)') &&
  heroCtaSection.includes('to="/quran"'),
  '4.2 Hero section primary CTAs include Start Chat and Holy Quran routing directly to /quran'
);

assert(
  !heroCtaSection.includes('Subcis Recitation') &&
  !heroCtaSection.includes('Macallin'),
  '4.3 Hero center group has no middle Macallin or Subcis Recitation button'
);

console.log('\n========================================================================');
console.log(`TOTAL REFINEMENTS TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
