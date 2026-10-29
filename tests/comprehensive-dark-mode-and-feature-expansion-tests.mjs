import { readFileSync } from 'fs';
import { resolve } from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('\n--- COMPREHENSIVE DARK MODE & FEATURE EXPANSION TEST SUITE ---\n');

// 1. Clock icon completely removed from Header.tsx
const headerContent = readFileSync(resolve('src/components/layout/Header.tsx'), 'utf-8');
assert(!headerContent.includes('<Clock') && !headerContent.includes('Clock,'), 'Clock icon is completely absent from Header.tsx');
assert(headerContent.includes('text-blue-600 dark:text-white'), 'Header.tsx brand logo dynamically switches to text-white in dark mode');

// 2. Dynamic logo color in Sidebar.tsx & Logo.tsx
const sidebarContent = readFileSync(resolve('src/components/layout/Sidebar.tsx'), 'utf-8');
assert(sidebarContent.includes('text-blue-600 dark:text-white'), 'Sidebar.tsx brand logo switches to text-white in dark mode');

const logoContent = readFileSync(resolve('src/components/common/Logo.tsx'), 'utf-8');
assert(logoContent.includes('text-blue-600 dark:text-white'), 'Logo.tsx brand logo has text-blue-600 dark:text-white');

// 3. Religious Accuracy & Ijma Policy yellow box removed from ReferencePanel.tsx
const refPanelContent = readFileSync(resolve('src/components/layout/ReferencePanel.tsx'), 'utf-8');
assert(!refPanelContent.includes('Religious Accuracy & Ijma Policy'), 'Religious Accuracy & Ijma Policy box completely removed from ReferencePanel.tsx');
assert(!refPanelContent.includes('AlertTriangle'), 'AlertTriangle icon removed from ReferencePanel.tsx');

// 4. Ramadan Bundle glowing card & moon interactive animations
const bannerContent = readFileSync(resolve('src/components/chat/RamadanOfferBanner.tsx'), 'utf-8');
assert(bannerContent.includes('animate-ramadan-glow'), 'RamadanOfferBanner card has animate-ramadan-glow');
assert(bannerContent.includes('animate-moon-interactive'), 'RamadanOfferBanner moon icon has animate-moon-interactive');
assert(bannerContent.includes('2027-01-20'), 'RamadanOfferBanner defines 20 January 2027 launch date');
assert(sidebarContent.includes('animate-ramadan-glow') && sidebarContent.includes('animate-moon-interactive'), 'Sidebar Ramadan Bundle button has animated glow and moon animation');

// 5. System theme synchronization in ThemeContext.tsx
const themeContextContent = readFileSync(resolve('src/context/ThemeContext.tsx'), 'utf-8');
assert(themeContextContent.includes("return 'system';"), "ThemeContext defaults to 'system'");
assert(themeContextContent.includes('prefers-color-scheme: dark'), 'ThemeContext actively queries prefers-color-scheme: dark');
assert(themeContextContent.includes('mediaQuery.matches ? \'dark\' : \'light\''), 'ThemeContext resolves system theme based on mediaQuery.matches');

// 6. Quran Page: quick bookmarking filter & playback speed controls
const quranPageContent = readFileSync(resolve('src/pages/QuranPage.tsx'), 'utf-8');
assert(quranPageContent.includes('filterBookmarkedOnly'), 'QuranPage has filterBookmarkedOnly state');
assert(quranPageContent.includes('displayedVerses'), 'QuranPage computes displayedVerses for bookmark filtering');
assert(quranPageContent.includes('0.75, 1.0, 1.25, 1.5, 2.0') || quranPageContent.includes('[0.75, 1.0, 1.25, 1.5, 2.0]'), 'QuranPage has quick playback speed controls [0.75, 1.0, 1.25, 1.5, 2.0]');
const bookmarkedDeclIndex = quranPageContent.indexOf('const [bookmarkedKeys, setBookmarkedKeys]');
const firstUsageIndex = quranPageContent.indexOf('bookmarkedKeys[');
assert(bookmarkedDeclIndex !== -1 && bookmarkedDeclIndex < firstUsageIndex, 'bookmarkedKeys is declared and initialized at the top before any usage/access');

// 7. Chat Page / MessageComposer: categorized quick prompt chips
const composerContent = readFileSync(resolve('src/components/chat/MessageComposer.tsx'), 'utf-8');
assert(composerContent.includes('CATEGORIZED_PROMPT_CHIPS'), 'MessageComposer defines CATEGORIZED_PROMPT_CHIPS');
assert(composerContent.includes("'tafsir'") && composerContent.includes("'hadith'") && composerContent.includes("'fiqh'") && composerContent.includes("'dua'"), 'MessageComposer includes Tafsir, Hadith, Fiqh, and Dua categories');

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed\n`);
if (failCount > 0) process.exit(1);
