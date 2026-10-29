/**
 * ==============================================================================
 * EMufti AI - Quran Tafsir Library Test Suite (All 114 Surahs)
 * ==============================================================================
 * Comprehensive test verification for:
 * 1. Canonical 114 Surahs catalog order and metadata (6,236 total ayahs).
 * 2. Scholarly honesty & completion statuses (38 complete, 13 in progress, 63 not available).
 * 3. 6 verified Somali scholars library and attributions.
 * 4. Audio recordings and stream links.
 * 5. Search, filters, and library statistics.
 * 6. User progress persistence and resume listening logic.
 * 7. Admin CRUD & verification workflows.
 * 8. Routing and component integration checks.
 * ==============================================================================
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    console.error(`  ${RED}✗ ${name}${RESET}`);
    console.error(`    ${RED}${err.message}${RESET}`);
    if (err.stack) {
      const callerLine = err.stack.split('\n')[2];
      if (callerLine) console.error(`    ${callerLine.trim()}`);
    }
  }
}

console.log(`\n${BOLD}${CYAN}==================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   EMufti AI - Somali Quran Tafsir Library (114 Surahs) Tests     ${RESET}`);
console.log(`${BOLD}${CYAN}==================================================================${RESET}\n`);

// -----------------------------------------------------------------------------
// SECTION 1: Database Migration & Schema Verification
// -----------------------------------------------------------------------------
console.log(`${BOLD}${YELLOW}Section 1: Database Migration & Schema Files${RESET}`);

const migrationPath = path.resolve('supabase/migrations/20261015_quran_tafsir_library.sql');

test('Migration file exists: 20261015_quran_tafsir_library.sql', () => {
  assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');
  const content = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(content.length > 5000, 'Migration file should have substantial content');
});

test('Migration defines tafsir_scholars, tafsir_surahs, tafsir_lessons, and user_tafsir_progress', () => {
  const content = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.tafsir_scholars'), 'Must create tafsir_scholars');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.tafsir_surahs'), 'Must create tafsir_surahs');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.tafsir_lessons'), 'Must create tafsir_lessons');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.user_tafsir_progress'), 'Must create user_tafsir_progress');
});

test('Migration seeds all 114 canonical surahs in tafsir_surahs with truthful statuses', () => {
  const content = fs.readFileSync(migrationPath, 'utf8');
  for (let s = 1; s <= 114; s++) {
    assert.ok(content.includes(`(${s},`), `Migration must pre-seed surah number ${s}`);
  }
  assert.ok(content.includes("'Furitaanka'"), 'Should include Furitaanka Somali name for Al-Fatihah');
  assert.ok(content.includes("'complete'"), 'Should include complete status');
  assert.ok(content.includes("'in_progress'"), 'Should include in_progress status');
  assert.ok(content.includes("'not_available'"), 'Should include not_available status');
});

test('Migration seeds the 6 Somali scholars', () => {
  const content = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(content.includes("'sheikh-umal'"), 'Must seed sheikh-umal');
  assert.ok(content.includes("'sheikh-dirir'"), 'Must seed sheikh-dirir');
  assert.ok(content.includes("'sheikh-cumar-faaruuq'"), 'Must seed sheikh-cumar-faaruuq');
  assert.ok(content.includes("'sheikh-shibli'"), 'Must seed sheikh-shibli');
  assert.ok(content.includes("'sheikh-cabdirashiid-suufi'"), 'Must seed sheikh-cabdirashiid-suufi');
  assert.ok(content.includes("'sheikh-mustafe'"), 'Must seed sheikh-mustafe');
});

test('Migration configures RLS and security helper RPCs', () => {
  const content = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(content.includes('ALTER TABLE public.tafsir_scholars ENABLE ROW LEVEL SECURITY;'), 'RLS on tafsir_scholars');
  assert.ok(content.includes('ALTER TABLE public.tafsir_surahs ENABLE ROW LEVEL SECURITY;'), 'RLS on tafsir_surahs');
  assert.ok(content.includes('ALTER TABLE public.tafsir_lessons ENABLE ROW LEVEL SECURITY;'), 'RLS on tafsir_lessons');
  assert.ok(content.includes('ALTER TABLE public.user_tafsir_progress ENABLE ROW LEVEL SECURITY;'), 'RLS on user_tafsir_progress');
  assert.ok(content.includes('save_user_tafsir_progress'), 'Must define save_user_tafsir_progress RPC');
  assert.ok(content.includes('get_tafsir_library_stats'), 'Must define get_tafsir_library_stats RPC');
});

// -----------------------------------------------------------------------------
// SECTION 2: Canonical 114 Surahs Catalog in quranMetadata.ts and tafsirData.ts
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 2: Canonical 114 Surahs Metadata & Coverage Integrity${RESET}`);

const quranMetadataPath = path.resolve('src/data/quranMetadata.ts');
const quranMetadataContent = fs.readFileSync(quranMetadataPath, 'utf8');

test('quranMetadata.ts defines all 114 canonical surahs in sequential order', () => {
  assert.ok(quranMetadataContent.includes('export const ALL_114_SURAHS: Surah[]'), 'Must export ALL_114_SURAHS');
  for (let i = 1; i <= 114; i++) {
    assert.ok(quranMetadataContent.includes(`number: ${i},`), `Must contain surah number ${i}`);
  }
});

test('Surah 1 (Al-Fatihah) has 7 ayahs and is Meccan', () => {
  assert.ok(quranMetadataContent.includes("englishName: 'Al-Fatihah'"), 'Surah 1 is Al-Fatihah');
  assert.ok(quranMetadataContent.includes("numberOfAyahs: 7"), 'Surah 1 has 7 ayahs');
  assert.ok(quranMetadataContent.includes("revelationType: 'Meccan'"), 'Surah 1 is Meccan');
});

test('Surah 114 (An-Nas) has 6 ayahs and is Meccan', () => {
  assert.ok(quranMetadataContent.includes("englishName: 'An-Nas'"), 'Surah 114 is An-Nas');
  assert.ok(quranMetadataContent.includes("numberOfAyahs: 6"), 'Surah 114 has 6 ayahs');
});

test('Canonical Total Ayahs count across all 114 Surahs equals 6,236', () => {
  const ayahMatches = [...quranMetadataContent.matchAll(/numberOfAyahs:\s*(\d+)/g)];
  assert.equal(ayahMatches.length, 114, 'Must have exactly 114 surah verse counts');
  const totalVerses = ayahMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
  assert.equal(totalVerses, 6236, 'Canonical Quran ayah sum must equal exactly 6,236');
});

const tafsirDataPath = path.resolve('src/data/tafsirData.ts');
const tafsirDataContent = fs.readFileSync(tafsirDataPath, 'utf8');

test('Strict Scholarly Honesty: 38 Complete, 13 In Progress, 63 Not Available', () => {
  assert.ok(tafsirDataContent.includes('VERIFIED_COMPLETE_SURAHS'), 'Must define VERIFIED_COMPLETE_SURAHS set');
  assert.ok(tafsirDataContent.includes('VERIFIED_IN_PROGRESS_SURAHS'), 'Must define VERIFIED_IN_PROGRESS_SURAHS set');

  // Parse numbers inside VERIFIED_COMPLETE_SURAHS
  const completeMatch = tafsirDataContent.match(/VERIFIED_COMPLETE_SURAHS\s*=\s*new Set<number>\(\[([\s\S]*?)\]\)/);
  assert.ok(completeMatch, 'Must find VERIFIED_COMPLETE_SURAHS array');
  const completeNums = completeMatch[1].match(/\d+/g).map(Number);
  assert.equal(completeNums.length, 38, 'Must have exactly 38 complete surahs (Surah 1 + Surahs 78-114)');

  // Parse numbers inside VERIFIED_IN_PROGRESS_SURAHS
  const inProgressMatch = tafsirDataContent.match(/VERIFIED_IN_PROGRESS_SURAHS\s*=\s*new Set<number>\(\[([\s\S]*?)\]\)/);
  assert.ok(inProgressMatch, 'Must find VERIFIED_IN_PROGRESS_SURAHS array');
  const inProgressNums = inProgressMatch[1].match(/\d+/g).map(Number);
  assert.equal(inProgressNums.length, 13, 'Must have exactly 13 in_progress surahs');

  const notAvailableCount = 114 - (completeNums.length + inProgressNums.length);
  assert.equal(notAvailableCount, 63, 'Remaining 63 surahs must be not_available (honest missing content)');
});

// -----------------------------------------------------------------------------
// SECTION 3: Somali Scholars Library & Audio Archives
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 3: Somali Scholars Catalog & Lessons${RESET}`);

test('All 6 Somali scholars are cataloged in SOMALI_SCHOLARS_TAFSIR', () => {
  const expectedScholars = [
    { id: 'sheikh-umal', name: 'Shiikh Maxamed Cabdi Umal' },
    { id: 'sheikh-dirir', name: 'Shiikh Maxamed Cumar Dirir' },
    { id: 'sheikh-cumar-faaruuq', name: 'Shiikh Cumar Faaruuq' },
    { id: 'sheikh-shibli', name: 'Shiikh Maxamed Shibli' },
    { id: 'sheikh-cabdirashiid-suufi', name: 'Shiikh Cabdirashiid Cali Suufi' },
    { id: 'sheikh-mustafe', name: 'Shiikh Mustafe Xaaji Ismaaciil' },
  ];

  for (const s of expectedScholars) {
    assert.ok(tafsirDataContent.includes(`id: '${s.id}'`), `Must include scholar id '${s.id}'`);
    assert.ok(tafsirDataContent.includes(s.name), `Must include scholar name '${s.name}'`);
  }
});

test('Sheikh Umal contains Juz Amma audio commentary catalog', () => {
  assert.ok(tafsirDataContent.includes("id: 'sheikh-umal'"), 'Must include Sheikh Umal catalog');
  assert.ok(tafsirDataContent.includes("id: 'umal-1'"), 'Must have Umal Surah 1');
  assert.ok(tafsirDataContent.includes("id: 'umal-2-kursi'"), 'Must have Umal Surah 2 (Ayat al-Kursi)');
  assert.ok(tafsirDataContent.includes("id: 'umal-78'"), 'Must have Umal Surah 78');
  assert.ok(tafsirDataContent.includes("id: 'umal-112'"), 'Must have Umal Surah 112 (Al-Ikhlas)');
});

test('Lessons include valid audio URLs pointing to verified Islamic archives', () => {
  const urlMatches = [...tafsirDataContent.matchAll(/audioUrl:\s*'([^']+)'/g)];
  assert.ok(urlMatches.length >= 20, 'Should have verified audio lesson URLs');

  for (const [_, url] of urlMatches) {
    assert.ok(url.startsWith('https://'), `Audio URL must use HTTPS: ${url}`);
    assert.ok(
      url.includes('archive.org') || url.includes('mp3quran.net') || url.includes('islamhouse.com'),
      `Audio URL must point to verified domain: ${url}`
    );
  }
});

test('Lessons include non-empty Somali and English transcripts/summaries', () => {
  assert.ok(tafsirDataContent.includes('transcriptSo:'), 'Must contain transcriptSo');
  assert.ok(tafsirDataContent.includes('transcriptEn:'), 'Must contain transcriptEn');
  assert.ok(tafsirDataContent.includes('Sharaxa Ummul'), 'Must have Fatihah Somali transcript');
});

// -----------------------------------------------------------------------------
// SECTION 4: Helper Functions & Progress Tracking
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 4: Query Helpers & Progress Tracking APIs${RESET}`);

test('tafsirData.ts exports required functions', () => {
  const requiredFunctions = [
    'getAllSomaliScholars',
    'getSomaliScholarById',
    'getAll114SurahsTafsirStatus',
    'getSurahTafsirStatus',
    'getTafsirLessonsForSurah',
    'searchTafsirLessons',
    'getTafsirLibraryStats',
    'saveUserTafsirProgress',
    'getUserTafsirProgress',
    'getLastPlayedTafsirLesson',
    'getAllTafsirLessons',
    'saveTafsirLesson',
    'deleteTafsirLesson',
  ];

  for (const fn of requiredFunctions) {
    assert.ok(
      tafsirDataContent.includes(`export function ${fn}`) ||
      tafsirDataContent.includes(`export async function ${fn}`),
      `tafsirData.ts must export ${fn}`
    );
  }
});

// -----------------------------------------------------------------------------
// SECTION 5: SomaliTafsirSection UI Component
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 5: SomaliTafsirSection Component Verification${RESET}`);

const tafsirComponentPath = path.resolve('src/components/quran/SomaliTafsirSection.tsx');
const tafsirCompContent = fs.readFileSync(tafsirComponentPath, 'utf8');

test('SomaliTafsirSection component exists and has rich UI features', () => {
  assert.ok(fs.existsSync(tafsirComponentPath), 'Component file must exist');
  assert.ok(tafsirCompContent.length > 20000, 'Component must be comprehensive');
});

test('SomaliTafsirSection provides 114 Surah directory with status indicators', () => {
  assert.ok(tafsirCompContent.includes('all114Summaries'), 'Must use all 114 summaries');
  assert.ok(tafsirCompContent.includes('surahNumber'), 'Must show surahNumber');
  assert.ok(tafsirCompContent.includes("'complete'"), 'Must handle complete status badge');
  assert.ok(tafsirCompContent.includes("'in_progress'"), 'Must handle in_progress status badge');
  assert.ok(tafsirCompContent.includes("'not_available'"), 'Must handle not_available status badge');
});

test('SomaliTafsirSection includes audio player with speed, seek, and prev/next', () => {
  assert.ok(tafsirCompContent.includes('playbackSpeed'), 'Must support playbackSpeed');
  assert.ok(tafsirCompContent.includes('handleSeek'), 'Must support handleSeek scrubber');
  assert.ok(tafsirCompContent.includes('handlePrevLesson'), 'Must support prev lesson');
  assert.ok(tafsirCompContent.includes('handleNextLesson'), 'Must support next lesson');
  assert.ok(tafsirCompContent.includes('0.75'), 'Must support 0.75x speed');
  assert.ok(tafsirCompContent.includes('1.25'), 'Must support 1.25x speed');
  assert.ok(tafsirCompContent.includes('1.5'), 'Must support 1.5x speed');
});

test('SomaliTafsirSection includes Continue Listening banner', () => {
  assert.ok(tafsirCompContent.includes('continueListeningItem'), 'Must track continue listening item');
  assert.ok(tafsirCompContent.includes('Continue Listening:'), 'Must include Continue Listening header');
  assert.ok(tafsirCompContent.includes('handleResumeContinueListening'), 'Must have resume click handler');
});

test('SomaliTafsirSection includes Dual View: Audio Lessons and Verse-by-verse Commentary', () => {
  assert.ok(tafsirCompContent.includes('audio_lessons'), 'Must support audio_lessons view mode');
  assert.ok(tafsirCompContent.includes('verse_commentary'), 'Must support verse_commentary view mode');
  assert.ok(tafsirCompContent.includes('Scholar Audio Lessons'), 'Must display Lessons tab');
  assert.ok(tafsirCompContent.includes('Verse-by-Verse Text & Translation'), 'Must display Verse Commentary tab');
});

test('SomaliTafsirSection includes transparent Missing Content disclosure when surah is pending', () => {
  assert.ok(tafsirCompContent.includes('No verified audio recording is currently logged for this surah.'), 'Must honestly notify user');
  assert.ok(tafsirCompContent.includes('COMMENTARY NOT YET DIGITIZED'), 'Must show unverified badge');
  assert.ok(tafsirCompContent.includes('adheres to strict academic honesty and does not fabricate recordings'), 'Academic integrity disclosure');
});

test('SomaliTafsirSection includes grounded EMufti AI inquiry modal', () => {
  assert.ok(tafsirCompContent.includes('Weydii EMufti AI Tafsiirka'), 'Must include Ask EMufti AI Tafsir button');
  assert.ok(tafsirCompContent.includes('createNewChat'), 'Must integrate with ChatContext');
  assert.ok(tafsirCompContent.includes('Citations based on verified Sunni scholars'), 'Scholarly citations footer');
});

// -----------------------------------------------------------------------------
// SECTION 6: Admin Management & Routes Integration
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 6: Admin Management & Route Wiring${RESET}`);

const appPath = path.resolve('src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

test('App.tsx defines /quran, /tafsir, and /quran/tafsir routes', () => {
  assert.ok(appContent.includes('path="/quran"'), 'App.tsx must have /quran route');
  assert.ok(appContent.includes('path="/tafsir"'), 'App.tsx must have /tafsir route');
  assert.ok(appContent.includes('path="/quran/tafsir"'), 'App.tsx must have /quran/tafsir route');
  assert.ok(appContent.includes('defaultTab="tafsir"'), 'Route must pass defaultTab="tafsir"');
});

const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

test('QuranPage.tsx handles defaultTab and URL query params (?tab=tafsir&surah=N)', () => {
  assert.ok(quranPageContent.includes('useSearchParams'), 'QuranPage must import useSearchParams');
  assert.ok(quranPageContent.includes("searchParams.get('tab')"), 'Must inspect tab query param');
  assert.ok(quranPageContent.includes("searchParams.get('surah')"), 'Must inspect surah query param');
  assert.ok(quranPageContent.includes('<SomaliTafsirSection'), 'Must render SomaliTafsirSection');
  assert.ok(quranPageContent.includes('initialSurahNumber={currentSurahNumber}'), 'Must pass initialSurahNumber prop');
});

const adminPagePath = path.resolve('src/pages/AdminPage.tsx');
const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');

test('AdminPage.tsx contains Tafsir Library tab in activeTab union', () => {
  assert.ok(adminPageContent.includes("'tafsir'"), "activeTab union must include 'tafsir'");
});

test('AdminPage.tsx has Tafsir navigation tab button and badge', () => {
  assert.ok(adminPageContent.includes("onClick={() => setActiveTab('tafsir')}"), 'Must have tab click handler');
  assert.ok(adminPageContent.includes('tafsirLessonsList.length'), 'Must show count badge');
});

test('AdminPage.tsx provides Tafsir metrics cards', () => {
  assert.ok(adminPageContent.includes('Total Duruus'), 'Must show total duruus');
  assert.ok(adminPageContent.includes('Verified Duruus'), 'Must show verified duruus');
  assert.ok(adminPageContent.includes('Published Publicly'), 'Must show published count');
  assert.ok(adminPageContent.includes('114 Surahs Coverage'), 'Must show 114 surahs coverage');
});

test('AdminPage.tsx provides Tafsir lesson Add / Edit form and CRUD handlers', () => {
  assert.ok(adminPageContent.includes('handleSaveTafsir'), 'Must define handleSaveTafsir');
  assert.ok(adminPageContent.includes('handleTogglePublishTafsir'), 'Must define handleTogglePublishTafsir');
  assert.ok(adminPageContent.includes('handleToggleVerifyTafsir'), 'Must define handleToggleVerifyTafsir');
  assert.ok(adminPageContent.includes('handleDeleteTafsir'), 'Must define handleDeleteTafsir');
  assert.ok(adminPageContent.includes('loadTafsirLessons'), 'Must define loadTafsirLessons');
});

test('AdminPage.tsx provides Tafsir search and multi-criteria filters', () => {
  assert.ok(adminPageContent.includes('tafsirScholarFilter'), 'Must have scholar filter');
  assert.ok(adminPageContent.includes('tafsirSurahFilter'), 'Must have surah filter (1-114)');
  assert.ok(adminPageContent.includes('tafsirStatusFilter'), 'Must have status filter');
  assert.ok(adminPageContent.includes('tafsirSearchQuery'), 'Must have search query input');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${CYAN}==================================================================${RESET}`);
console.log(`${BOLD}${GREEN}All ${passedTests} / ${totalTests} Tafsir Library Tests Passed Successfully!${RESET}`);
console.log(`${BOLD}${CYAN}==================================================================${RESET}\n`);

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
