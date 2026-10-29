// tests/qaari-layout-and-weydii-button-tests.mjs
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('========================================================================');
console.log('EMUFTI AI: QAARI VERTICAL ROW LAYOUT & WEYDII EMUFTI BUTTON VERIFICATION');
console.log('========================================================================\n');

const rootDir = process.cwd();
let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: QAARI SECTION RESPONSIVE LAYOUT (QarisCatalog.tsx)
// -----------------------------------------------------------------------------
console.log('--- 1. Qaari Section: Responsive Vertical Row Layout ---');

const qarisCatalogFile = path.join(rootDir, 'src/components/quran/QarisCatalog.tsx');
assert.ok(fs.existsSync(qarisCatalogFile), 'QarisCatalog.tsx must exist');
const qarisCatalogSrc = fs.readFileSync(qarisCatalogFile, 'utf8');

runTest('Qaari catalog uses vertical single-column container (flex flex-col gap-3 w-full)', () => {
  assert.ok(
    qarisCatalogSrc.includes('flex flex-col') && qarisCatalogSrc.includes('w-full'),
    'Reciter catalog must use a full-width vertical column'
  );
  assert.ok(
    !qarisCatalogSrc.includes('grid-cols-3') && !qarisCatalogSrc.includes('grid-cols-2'),
    'Reciters must not be squeezed into multi-column grid layouts'
  );
});

runTest('Desktop: Each reciter is displayed on a separate horizontal row (lg:flex-row lg:items-center)', () => {
  assert.ok(
    qarisCatalogSrc.includes('lg:flex-row') && qarisCatalogSrc.includes('lg:items-center'),
    'Desktop must display reciter in an aligned horizontal row'
  );
  assert.ok(
    qarisCatalogSrc.includes('justify-between'),
    'Main row must space identity and controls across the row'
  );
});

runTest('Mobile: Reciters are displayed in a clean vertical row design with compact padding', () => {
  assert.ok(
    qarisCatalogSrc.includes('rounded-2xl') && qarisCatalogSrc.includes('p-3.5 sm:p-4'),
    'Reciter cards must use compact padding (p-3.5 sm:p-4) to prevent bloated oversized cards'
  );
});

runTest('Reciter names in English and Arabic are properly aligned', () => {
  assert.ok(
    qarisCatalogSrc.includes('qari.name') && qarisCatalogSrc.includes('qari.arabicName'),
    'Both English and Arabic names must be displayed'
  );
  assert.ok(
    qarisCatalogSrc.includes('dir="rtl"'),
    'Arabic reciter name must specify RTL text direction'
  );
});

runTest('Audio controls, Surah dropdown, and Play button are cleanly aligned', () => {
  assert.ok(
    qarisCatalogSrc.includes('qari-surah-select'),
    'Must include Surah selector dropdown for each reciter'
  );
  assert.ok(
    qarisCatalogSrc.includes('handleTogglePlay(qari)'),
    'Must wire play/pause button for each reciter'
  );
  assert.ok(
    qarisCatalogSrc.includes('onSelectReciter(qari'),
    'Must provide reciter selection action'
  );
});

runTest('Preserves reciters data, audio sources, and active playback controls', () => {
  assert.ok(
    qarisCatalogSrc.includes('ALL_114_SURAHS'),
    'Must provide access to all 114 Surahs per reciter'
  );
  assert.ok(
    qarisCatalogSrc.includes('handleSeek') && qarisCatalogSrc.includes('type="range"'),
    'Must provide interactive progress seek bar during playback'
  );
});

// -----------------------------------------------------------------------------
// SECTION 2: WEYDII EMUFTI BUTTON ABOVE QURAN AYAHS (QuranPage.tsx)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Weydii EMufti Button Above Quran Ayahs (QuranPage.tsx) ---');

const quranPageFile = path.join(rootDir, 'src/pages/QuranPage.tsx');
assert.ok(fs.existsSync(quranPageFile), 'QuranPage.tsx must exist');
const quranPageSrc = fs.readFileSync(quranPageFile, 'utf8');

runTest('Ayah Header container uses responsive layout (flex flex-col sm:flex-row sm:items-center justify-between)', () => {
  assert.ok(
    quranPageSrc.includes('flex flex-col sm:flex-row sm:items-center justify-between'),
    'Ayah header must stack on mobile and expand on desktop to prevent clipping'
  );
});

runTest('Prevents overlapping: Ayah number/heading and verse controls are cleanly decoupled', () => {
  assert.ok(
    quranPageSrc.includes('currentSurah?.englishName') && quranPageSrc.includes('ayah.numberInSurah'),
    'Must display Surah and Ayah number'
  );
  assert.ok(
    quranPageSrc.includes('flex items-center justify-between sm:justify-end gap-1.5 flex-wrap sm:flex-nowrap'),
    'Verse action buttons must be responsive and wrap safely on mobile'
  );
});

runTest('Weydii EMufti button is compact, visible, and does not overlap Quran text', () => {
  assert.ok(
    quranPageSrc.includes('Weydii EMufti'),
    'Must render Weydii EMufti button text'
  );
  assert.ok(
    quranPageSrc.includes('whitespace-nowrap'),
    'Button label must prevent unwanted text wrapping'
  );
  assert.ok(
    quranPageSrc.includes('flex-shrink-0'),
    'Button must not squash on narrow mobile screens'
  );
});

runTest('Preserves Waydii EMufti modal opening with ayah context', () => {
  assert.ok(
    quranPageSrc.includes('setWaydiiModalAyah(ayah)'),
    'Must pass the clicked Ayah object as context'
  );
  assert.ok(
    quranPageSrc.includes('setIsWaydiiModalOpen(true)'),
    'Must open the Waydii EMufti modal on click'
  );
});

// -----------------------------------------------------------------------------
// SECTION 3: WEYDII EMUFTI BUTTON IN SOMALI TAFSIR (SomaliTafsirSection.tsx)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Weydii EMufti Button in Somali Tafsir (SomaliTafsirSection.tsx) ---');

const tafsirFile = path.join(rootDir, 'src/components/quran/SomaliTafsirSection.tsx');
assert.ok(fs.existsSync(tafsirFile), 'SomaliTafsirSection.tsx must exist');
const tafsirSrc = fs.readFileSync(tafsirFile, 'utf8');

runTest('Tafsir Ayah Header container uses responsive layout (flex flex-col sm:flex-row)', () => {
  assert.ok(
    tafsirSrc.includes('flex flex-col sm:flex-row sm:items-center justify-between'),
    'Tafsir ayah header must be responsive across mobile and desktop'
  );
});

runTest('Tafsir Weydii EMufti button maintains full inquiry context', () => {
  assert.ok(
    tafsirSrc.includes('Weydii EMufti AI Tafsiirka'),
    'Must maintain Weydii EMufti AI Tafsiirka label'
  );
  assert.ok(
    tafsirSrc.includes('handleOpenAiInquiry'),
    'Must trigger grounded AI inquiry with Ayah and translation context'
  );
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
console.log('========================================================================\n');

if (passedTests === totalTests) {
  console.log('ALL QAARI LAYOUT & WEYDII EMUFTI BUTTON TESTS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
