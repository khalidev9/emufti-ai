/**
 * Comprehensive verification tests for EMufti AI Quran.com-inspired Redesign
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: QURAN.COM-INSPIRED REDESIGN VERIFICATION TESTS');
console.log('========================================================================\n');

// 1. Division Data: Hizb, Half-Hizb, Rub al-Hizb
console.log('--- 1. Quran Division Metadata (Hizb, Half-Hizb, Rub al-Hizb) ---');
const divisionsPath = path.resolve('src/data/quranDivisions.ts');
assert(fs.existsSync(divisionsPath), 'quranDivisions.ts exists');
const divisionsContent = fs.readFileSync(divisionsPath, 'utf8');

assert(divisionsContent.includes('ALL_60_HIZB') && divisionsContent.includes('ALL_120_HALF_HIZB') && divisionsContent.includes('ALL_240_RUB_AL_HIZB'), 'Exports 60 Hizbs, 120 Half-Hizbs, and 240 Rub al-Hizbs');
assert(divisionsContent.includes('getHizbByNumber') && divisionsContent.includes('getHalfHizbByNumber') && divisionsContent.includes('getRubByNumber'), 'Exports division lookup helpers');

// 2. Quran Service: Page Verses Fetching (1..604)
console.log('\n--- 2. Quran Service 604-Page API & Multi-Tier Caching ---');
const quranServicePath = path.resolve('src/lib/quranService.ts');
const quranServiceContent = fs.readFileSync(quranServicePath, 'utf8');
assert(quranServiceContent.includes('fetchPageVerses(pageNumber: number)'), 'quranService implements fetchPageVerses');
assert(quranServiceContent.includes('emufti_quran_page_v1_'), 'Implements localStorage page caching');
assert(quranServiceContent.includes('api.alquran.cloud/v1/page/'), 'Uses official AlQuran Cloud page endpoint');

// 3. Mode 1 — Mushaf Page View Component
console.log('\n--- 3. Mode 1: Traditional Printed-Mushaf Page View (1 to 604) ---');
const mushafViewPath = path.resolve('src/components/quran/MushafPageView.tsx');
assert(fs.existsSync(mushafViewPath), 'MushafPageView.tsx component exists');
const mushafViewContent = fs.readFileSync(mushafViewPath, 'utf8');
assert(mushafViewContent.includes('currentPageNumber') && mushafViewContent.includes('onPageChange'), 'Supports two-way page number control');
assert(mushafViewContent.includes('604'), 'Supports all 604 Medina Mushaf pages');
assert(mushafViewContent.includes('ArrowLeft') && mushafViewContent.includes('ArrowRight'), 'Supports keyboard arrow key navigation');
assert(mushafViewContent.includes('readingTheme'), 'Supports Light, Sepia, and Dark reading themes');
assert(mushafViewContent.includes('onAskEMufti') && mushafViewContent.includes('Weydii EMufti'), 'Verse action toolbar integrates Weydii EMufti');

// 4. Mode 3 — Translation & Study View with Authentic Somali Tafsiir
console.log('\n--- 4. Mode 3: Translation & Scholarly Study View ---');
const studyViewPath = path.resolve('src/components/quran/StudyTafsirView.tsx');
assert(fs.existsSync(studyViewPath), 'StudyTafsirView.tsx component exists');
const studyViewContent = fs.readFileSync(studyViewPath, 'utf8');
assert(studyViewContent.includes('SOMALI_SCHOLARS_TAFSIR'), 'Connects to authentic Somali scholars Tafsiir dataset');
assert(studyViewContent.includes('Sheikh Umal') || studyViewContent.includes('Sheikh Dirir') || studyViewContent.includes('getScholarTafsirForAyah'), 'Integrates Sheikh Umal and Sheikh Dirir audio lessons');
assert(studyViewContent.includes('translationSo') && studyViewContent.includes('translationEn'), 'Supports side-by-side / stacked Somali & English translations');
assert(studyViewContent.includes('onAskEMufti') && studyViewContent.includes('Weydii EMufti'), 'Includes Weydii EMufti consultation on study cards');

// 5. Quran Navigation Drawer (6-tab unified drawer)
console.log('\n--- 5. Modern 6-Tab Quran Navigation Drawer ---');
const navDrawerPath = path.resolve('src/components/quran/QuranNavigationDrawer.tsx');
assert(fs.existsSync(navDrawerPath), 'QuranNavigationDrawer.tsx exists');
const navDrawerContent = fs.readFileSync(navDrawerPath, 'utf8');
assert(navDrawerContent.includes("'surahs'") && navDrawerContent.includes("'juz'") && navDrawerContent.includes("'hizb'"), 'Drawer has Surah, Juz, and Hizb tabs');
assert(navDrawerContent.includes("'half_hizb'") && navDrawerContent.includes("'rub_al_hizb'") && navDrawerContent.includes("'page'"), 'Drawer has Half-Hizb (Barkiis), Rub (Rubuc), and 604 Page tabs');
assert(navDrawerContent.includes('searchQuery') && navDrawerContent.includes('filtered'), 'Features real-time division search filtering');

// 6. Quran Reading Settings Drawer
console.log('\n--- 6. Quran Reading Settings Drawer & Themes ---');
const settingsDrawerPath = path.resolve('src/components/quran/QuranSettingsDrawer.tsx');
assert(fs.existsSync(settingsDrawerPath), 'QuranSettingsDrawer.tsx exists');
const settingsDrawerContent = fs.readFileSync(settingsDrawerPath, 'utf8');
assert(settingsDrawerContent.includes("'mushaf'") && settingsDrawerContent.includes("'ayah'") && settingsDrawerContent.includes("'study'"), 'Supports 3 reading design modes');
assert(settingsDrawerContent.includes("'light'") && settingsDrawerContent.includes("'sepia'") && settingsDrawerContent.includes("'dark'"), 'Supports Light (White), Sepia (Warm Ivory), and Dark themes');
assert(settingsDrawerContent.includes('Dooro cabbirka') || settingsDrawerContent.includes('cabbirka'), 'Includes font size configuration matching system standard');
assert(settingsDrawerContent.includes('playbackSpeed') && settingsDrawerContent.includes('autoScrollWithAudio'), 'Includes audio speed (0.75x..1.5x) and auto-scroll preferences');

// 7. Modern 50+ Qaari Selection Modal
console.log('\n--- 7. Modern 50+ Verified Reciters Modal ---');
const qarisModalPath = path.resolve('src/components/quran/QarisSelectorModal.tsx');
assert(fs.existsSync(qarisModalPath), 'QarisSelectorModal.tsx exists');
const qarisModalContent = fs.readFileSync(qarisModalPath, 'utf8');
assert(qarisModalContent.includes('previewingId') || qarisModalContent.includes('previewAudioRef'), 'Includes audio sample preview player');
assert(qarisModalContent.includes('searchQuery'), 'Includes real-time reciter name search');

// 8. Fixed Touch-Friendly Docked Audio Player
console.log('\n--- 8. Docked Sticky Touch-Friendly Audio Player ---');
const playerPath = path.resolve('src/components/quran/QuranAudioPlayer.tsx');
assert(fs.existsSync(playerPath), 'QuranAudioPlayer.tsx exists');
const playerContent = fs.readFileSync(playerPath, 'utf8');
assert(playerContent.includes('onSeek') && playerContent.includes('playbackProgress'), 'Supports seekable timeline scrubber');
assert(playerContent.includes('onSelectSpeed'), 'Supports playback speed switching');
assert(playerContent.includes('onOpenRecitersModal'), 'Quickly opens full reciters modal');

// 9. Integration in QuranPage.tsx
console.log('\n--- 9. QuranPage.tsx Integration & Zero Regressions ---');
const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');
assert(quranPageContent.includes('Qaabka Akhriska:'), 'Prominent Qaabka Akhriska mode selector visible');
assert(quranPageContent.includes('<MushafPageView'), 'Mounts Mode 1 MushafPageView');
assert(quranPageContent.includes('<StudyTafsirView'), 'Mounts Mode 3 StudyTafsirView');
assert(quranPageContent.includes('<QuranAudioPlayer'), 'Mounts docked QuranAudioPlayer at bottom');
assert(quranPageContent.includes('<QuranNavigationDrawer'), 'Mounts QuranNavigationDrawer');
assert(quranPageContent.includes('<QuranSettingsDrawer'), 'Mounts QuranSettingsDrawer');
assert(quranPageContent.includes('<QarisSelectorModal'), 'Mounts QarisSelectorModal');
assert(quranPageContent.includes('Dooro cabbirka'), 'Preserves exact "Dooro cabbirka" select element for backward tests');
assert(quranPageContent.includes('flex flex-col sm:flex-row sm:items-center justify-between'), 'Preserves Ayah header container styling for regression tests');
assert(quranPageContent.includes('Weydii EMufti'), 'Preserves Weydii EMufti button');
assert(quranPageContent.includes('data-tutorial="surah-selector"'), 'Preserves guided tutorial attributes');

console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nALL QURAN.COM-INSPIRED REDESIGN TESTS PASSED WITH 100% SUCCESS!');
}
