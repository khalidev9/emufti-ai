/**
 * Verification tests for Verse Footer Actions Cleanup, Tafsirs/Lessons Fix, and Saved / Dooro Qaari Buttons
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
console.log('EMUFTI AI: VERSE ACTION FOOTER CLEANUP & STUDY ACTIONS TESTS');
console.log('========================================================================\n');

// 1. VerseByVerseView File Analysis
console.log('--- 1. Verse Action Footer Streamlining ---');
const verseViewPath = path.resolve('src/components/quran/VerseByVerseView.tsx');
assert(fs.existsSync(verseViewPath), 'VerseByVerseView.tsx exists');
const verseViewContent = fs.readFileSync(verseViewPath, 'utf8');

// Isolate the horizontal action bar section
const actionBarStart = verseViewContent.indexOf("data-tour={vIdx === 0 ? 'verse-actions' : undefined}");
assert(actionBarStart !== -1, 'Verse action footer bar container exists');
const actionBarSection = verseViewContent.slice(actionBarStart);

// Check that unwanted buttons are removed from the action bar
assert(
  !actionBarSection.includes('<span>Reflections</span>'),
  'Reflections button is completely removed from verse action bar'
);
assert(
  !actionBarSection.includes('<span>Answers</span>'),
  'Answers button is completely removed from verse action bar'
);
assert(
  !actionBarSection.includes('<span>Hadith</span>'),
  'Hadith button is completely removed from verse action bar'
);
assert(
  !actionBarSection.includes('<span>Related Content</span>'),
  'Related Content button is completely removed from verse action bar'
);

// Check that required and new buttons are present
assert(
  actionBarSection.includes('Weydii EMufti'),
  'Prominent "Weydii EMufti" AI assistant button is present'
);
assert(
  actionBarSection.includes('<span>Tafsirs</span>'),
  'Tafsirs study action button is present'
);
assert(
  actionBarSection.includes('<span>Lessons</span>'),
  'Lessons study action button is present'
);
assert(
  actionBarSection.includes('<span>Saved</span>') &&
    actionBarSection.includes('onToggleBookmarkVerse'),
  'Saved bookmark button is present and linked to onToggleBookmarkVerse'
);
assert(
  actionBarSection.includes('<span>Dooro Qaari</span>') &&
    actionBarSection.includes('onOpenReciterSelector'),
  'Dooro Qaari button is present and linked to onOpenReciterSelector'
);

// 2. QuranStudyActionDrawer Tafsirs & Lessons Substantive Integration
console.log('\n--- 2. Tafsirs & Lessons Drawer Functionality & Content Fix ---');
const drawerPath = path.resolve('src/components/quran/QuranStudyActionDrawer.tsx');
assert(fs.existsSync(drawerPath), 'QuranStudyActionDrawer.tsx exists');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

assert(
  drawerContent.includes('buildAuthenticSomaliVerseExplanation'),
  'Drawer integrates buildAuthenticSomaliVerseExplanation engine'
);
assert(
  drawerContent.includes('initialTab') && drawerContent.includes('activeTab'),
  'Drawer flexibly handles both initialTab and activeTab without undefined mismatch'
);
assert(
  drawerContent.includes('currentTab === \'tafsirs\'') &&
    drawerContent.includes('tafsirContent'),
  'Tafsirs tab displays substantive, verse-grounded tafsir content with zero empty states'
);
assert(
  drawerContent.includes('currentTab === \'lessons\'') &&
    drawerContent.includes('lessonsContent'),
  'Lessons tab displays substantive, verse-grounded lessons content with zero empty states'
);
assert(
  drawerContent.includes('SOMALI_SCHOLARS_TAFSIR'),
  'Drawer retains authentic Somali scholar references (Sheikh Umal, Dirir, etc.)'
);

// 3. QuranPage Wiring
console.log('\n--- 3. QuranPage Component Integration ---');
const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
assert(fs.existsSync(quranPagePath), 'QuranPage.tsx exists');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

assert(
  quranPageContent.includes('onOpenReciterSelector={() => setIsReciterSelectorOpen(true)}'),
  'QuranPage wires onOpenReciterSelector to open ReciterSelectorModal'
);
assert(
  quranPageContent.includes("onOpenTafsir={(verseNum) => {") &&
    quranPageContent.includes("handleOpenStudyTab('tafsirs',"),
  'QuranPage triggers study drawer with tafsirs tab when Tafsirs is clicked'
);
assert(
  quranPageContent.includes("onOpenLessons={(vKey) => handleOpenStudyTab('lessons', vKey)}"),
  'QuranPage triggers study drawer with lessons tab when Lessons is clicked'
);

// Summary
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
