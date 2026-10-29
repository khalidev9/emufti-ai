/**
 * Verification tests for Surah Info Banner Translation Dropdown & Somali Translation Support
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
console.log('EMUFTI AI: SURAH TRANSLATION DROPDOWN & SOMALI TRANSLATION TESTS');
console.log('========================================================================\n');

// 1. Container Overflow & Dropdown Clipping Fix
console.log('--- 1. Surah Card Container Overflow & Dropdown Floating Layers ---');
const bannerPath = path.resolve('src/components/quran/SurahInfoBanner.tsx');
assert(fs.existsSync(bannerPath), 'SurahInfoBanner.tsx exists');
const bannerContent = fs.readFileSync(bannerPath, 'utf8');

assert(
  bannerContent.includes('rounded-2xl p-6 sm:p-7 mb-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-visible'),
  'Surah header card container uses overflow-visible to prevent clipping translation dropdown'
);

assert(
  !bannerContent.includes('relative overflow-hidden transition-all duration-200">\n        {/* Subtle decorative glow */}'),
  'Old overflow-hidden on Surah banner card is removed'
);

assert(
  bannerContent.includes('z-50') && bannerContent.includes('shadow-2xl'),
  'Translation dropdown menu uses z-50 and shadow-2xl to float cleanly outside and above the card'
);

assert(
  bannerContent.includes('dropdownRef') && bannerContent.includes('handleClickOutside'),
  'Translation dropdown includes outside-click listener to dismiss menu cleanly'
);

// 2. Somali Translation Support in Dropdown
console.log('\n--- 2. Somali Translation Primary Option & Visual Grouping ---');
assert(
  bannerContent.includes('Af-Soomaali (Somali)') || bannerContent.includes('Somali Translation (Af-Soomaali)'),
  'Dropdown features dedicated Somali Translation section header'
);

assert(
  bannerContent.includes('🇸🇴') && bannerContent.includes('Mahmud Muhammad Abduh'),
  'Dropdown features Mahmud Muhammad Abduh with Somali flag 🇸🇴 badge'
);

assert(
  bannerContent.includes('Select English Translation'),
  'Dropdown clearly delineates English translations below the primary Somali translation'
);

assert(
  bannerContent.includes('Somali (Abduh)'),
  'Dropdown button dynamically displays Somali (Abduh) when Somali translation is selected'
);

// 3. QuranPage Translation State & Persistence
console.log('\n--- 3. QuranPage Translation Selection & LocalStorage Persistence ---');
const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
assert(fs.existsSync(quranPagePath), 'QuranPage.tsx exists');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

assert(
  quranPageContent.includes("localStorage.getItem('emufti_quran_translation_id')"),
  'Initializes selected translation from localStorage emufti_quran_translation_id'
);

assert(
  quranPageContent.includes("localStorage.setItem('emufti_quran_translation_id', String(tr.id))"),
  'Persists chosen translation ID to localStorage on selection'
);

assert(
  quranPageContent.includes('selectedTranslationId === 46') && quranPageContent.includes('somaliTranslationsMap'),
  'QuranPage attaches Somali translation when selectedTranslationId === 46'
);

assert(
  quranPageContent.includes('tr.id === 46') && quranPageContent.includes('setVerses'),
  'Provides instant zero-latency visual update to Somali translation upon selection'
);

// 4. VerseByVerseView Display Logic
console.log('\n--- 4. VerseByVerseView Clean Somali Translation Rendering ---');
const verseViewPath = path.resolve('src/components/quran/VerseByVerseView.tsx');
assert(fs.existsSync(verseViewPath), 'VerseByVerseView.tsx exists');
const verseViewContent = fs.readFileSync(verseViewPath, 'utf8');

assert(
  verseViewContent.includes('{cleanTr || somaliText}'),
  'Primary verse translation renders cleanTr with fallback to somaliText'
);

assert(
  verseViewContent.includes('cleanTr !== somaliText') && verseViewContent.includes('abduh'),
  'Avoids duplicating Somali translation card when Somali is already active as primary translation'
);

console.log('\n========================================================================');
console.log(`TOTAL TRANSLATION TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
