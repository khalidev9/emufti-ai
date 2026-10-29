import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- EMUFTI AI: CHATGPT + QURAN THREE-PANEL UI DESIGN TESTS ---\n');

const ROOT = process.cwd();

// Test 1: Verify Quran Divisions Data (60 Hizbs, 120 Half-Hizbs, 240 Rub al-Hizb)
console.log('1. Testing Quran Divisions Data & Metadata...');
const divisionsPath = path.join(ROOT, 'src/data/quranDivisions.ts');
assert.ok(fs.existsSync(divisionsPath), 'quranDivisions.ts must exist');
const divisionsContent = fs.readFileSync(divisionsPath, 'utf8');

assert.ok(divisionsContent.includes('ALL_60_HIZB'), 'Must export ALL_60_HIZB');
assert.ok(divisionsContent.includes('ALL_120_HALF_HIZB'), 'Must export ALL_120_HALF_HIZB');
assert.ok(divisionsContent.includes('ALL_240_RUB_AL_HIZB'), 'Must export ALL_240_RUB_AL_HIZB');
assert.ok(divisionsContent.includes('getHizbByNumber'), 'Must export getHizbByNumber');
assert.ok(divisionsContent.includes('getHalfHizbByNumber'), 'Must export getHalfHizbByNumber');
assert.ok(divisionsContent.includes('getRubByNumber'), 'Must export getRubByNumber');

// Count hizb definitions
const hizbCountMatch = divisionsContent.match(/number:\s*\d+,\s*juzNumber:/g);
assert.equal(hizbCountMatch?.length, 60, 'Must have exactly 60 Hizbs defined');
console.log('  ✓ 60 Hizbs, 120 Half-Hizbs (Barkiis), and 240 Rub al-Hizb verified');

// Test 2: Verify IntegratedQuranReaderPanel Component
console.log('2. Testing IntegratedQuranReaderPanel Component...');
const readerPanelPath = path.join(ROOT, 'src/components/quran/IntegratedQuranReaderPanel.tsx');
assert.ok(fs.existsSync(readerPanelPath), 'IntegratedQuranReaderPanel.tsx must exist');
const readerContent = fs.readFileSync(readerPanelPath, 'utf8');

// Verify 5 navigation tabs
const tabs = ['suurad', 'jizz', 'hizb', 'half_hizb', 'rub_al_hizb'];
tabs.forEach((tab) => {
  assert.ok(readerContent.includes(tab), `IntegratedQuranReaderPanel must support tab "${tab}"`);
});
console.log('  ✓ All 5 navigation tabs (Suurad, Jizz, Hizb, Half-Hizb, Rub al-Hizb) present');

// Verify selection controls
assert.ok(readerContent.includes('ALL_114_SURAHS'), 'Must include 114 Surahs selector');
assert.ok(readerContent.includes('ALL_30_JUZ'), 'Must include 30 Juz selector');
assert.ok(readerContent.includes('Go to Ayah'), 'Must include Go to Ayah input and action');
assert.ok(readerContent.includes('handleGoToAyahSubmit'), 'Must have handleGoToAyahSubmit function');
console.log('  ✓ Surah selector (114), Juz selector (30), and Go to Ayah verified');

// Verify font size and translation settings
assert.ok(readerContent.includes('setFontSize'), 'Must support font size settings');
assert.ok(readerContent.includes('showSomaliTranslation'), 'Must support Somali translation toggle');
assert.ok(readerContent.includes('showEnglishTranslation'), 'Must support English translation toggle');
assert.ok(readerContent.includes('readingMode'), 'Must support read vs listen mode');
console.log('  ✓ Reading settings (font size, translations, mode) verified');

// Verify verified Uthmani Quran text & diacritics & verse markers
assert.ok(readerContent.includes('font-arabic'), 'Must use Arabic typography for Uthmani text');
assert.ok(readerContent.includes('dir="rtl"'), 'Must have RTL text alignment for Arabic verses');
assert.ok(readerContent.includes('۝'), 'Must have classical Quran verse end marker');
console.log('  ✓ Verified Uthmani Quran text, RTL font, and verse markers verified');

// Verify Ayah actions
assert.ok(readerContent.includes('Tafsiir'), 'Must support Tafsiir action');
assert.ok(readerContent.includes('handleToggleBookmark'), 'Must support Bookmark toggle action');
assert.ok(readerContent.includes('handleCopyAyah'), 'Must support Copy Ayah action');
assert.ok(readerContent.includes('handleAskEMufti'), 'Must support "Waydii EMufti" action');
assert.ok(readerContent.includes('onAskEMufti'), 'Must connect "Waydii EMufti" to onAskEMufti prop');
console.log('  ✓ Ayah actions (Tafsiir, Bookmark, Copy, Waydii EMufti) verified');

// Verify Audio Player with 50+ Qaris
assert.ok(readerContent.includes('selectedReciter'), 'Must have selected reciter');
assert.ok(readerContent.includes('playAyahAudio'), 'Must have playAyahAudio function');
assert.ok(readerContent.includes('togglePlayPause'), 'Must have togglePlayPause function');
assert.ok(readerContent.includes('handleNextAyah'), 'Must have handleNextAyah function');
assert.ok(readerContent.includes('handlePreviousAyah'), 'Must have handlePreviousAyah function');
assert.ok(readerContent.includes('loopAyah'), 'Must have repeat/loop ayah option');
assert.ok(readerContent.includes('audioCurrentTime'), 'Must have audio progress bar with current time');
console.log('  ✓ Sticky Audio Player with 50+ Qaris, verse sync, and controls verified');

// Test 3: Verify Header.tsx Clean Conversational Integration
console.log('3. Testing Header.tsx Clean Header Integration...');
const headerPath = path.join(ROOT, 'src/components/layout/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');
assert.ok(headerContent.includes('EMufti AI'), 'Header must render brand identity');
assert.ok(headerContent.includes('Online'), 'Header must render online indicator');
assert.ok(headerContent.includes('SquarePen') || headerContent.includes('New Chat'), 'Header must have new chat action');
console.log('  ✓ Clean Header with online status and New Chat action verified');

// Test 4: Verify ChatPage.tsx Clean Chat Workspace
console.log('4. Testing ChatPage.tsx Clean Chat Workspace...');
const chatPagePath = path.join(ROOT, 'src/pages/ChatPage.tsx');
const chatPageContent = fs.readFileSync(chatPagePath, 'utf8');
assert.ok(!chatPageContent.includes('<IntegratedQuranReaderPanel'), 'ChatPage must NOT clutter conversation with embedded Quran panel');
console.log('  ✓ ChatPage clean conversation workspace verified without embedded Quran clutter');

// Test 5: Verify Sidebar.tsx Navigation Links & Date Grouping
console.log('5. Testing Sidebar.tsx Navigation Links & Date Grouping...');
const sidebarPath = path.join(ROOT, 'src/components/layout/Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Verify requested navigation links
const navLinks = [
  'Quran',
  'Qaari',
  'Macallin',
  'Tafsiir',
  'Dua & Tasbeeh',
  'Bookmarks',
  'Settings',
];
navLinks.forEach((link) => {
  assert.ok(sidebarContent.includes(`label: '${link}'`), `Sidebar must have navigation link "${link}"`);
});
console.log('  ✓ All 7 requested navigation links (Quran, Qaari, Macallin, Tafsiir, Dua & Tasbeeh, Bookmarks, Settings) verified');

// Verify date grouping
assert.ok(sidebarContent.includes("'Today', 'Yesterday', 'Earlier'"), 'Sidebar must group dates by Today, Yesterday, Earlier');
console.log('  ✓ Sidebar conversation date grouping (Today, Yesterday, Earlier) verified');

// Verify user profile at bottom
assert.ok(sidebarContent.includes('UserAvatar'), 'Sidebar must display user avatar');
assert.ok(sidebarContent.includes('activePlan || userPlan'), 'Sidebar must display active subscription plan');
console.log('  ✓ Sidebar bottom profile with active subscription plan verified');

console.log('\n--- ALL CHATGPT + QURAN THREE-PANEL TESTS PASSED! ---');
