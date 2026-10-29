import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { tokenizeAyahWithTajweed } from '../src/lib/tajweedAssessmentEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: MACALLIN CONNECTED ARABIC QURAN TEXT & LAYOUT TESTS');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  const macallinPath = path.join(rootDir, 'src/components/quran/MacallinTeacher.tsx');
  assert(fs.existsSync(macallinPath), 'MacallinTeacher.tsx must exist');
  const macallinSource = fs.readFileSync(macallinPath, 'utf8');

  // ---------------------------------------------------------------------------
  // TEST 1: No Character-by-Character Splitting
  // ---------------------------------------------------------------------------
  await runTest('[1.1] Does not split Arabic words into individual character spans', () => {
    assert(
      !macallinSource.includes('{letterSegments.map('),
      'MacallinTeacher must NOT map over letterSegments to render individual character spans'
    );
    assert(
      !macallinSource.includes('{seg.char}{seg.diacritics}'),
      'MacallinTeacher must NOT render separate character/diacritic spans'
    );
  });

  await runTest('[1.2] Renders complete Uthmani words directly (token.rawText)', () => {
    assert(
      macallinSource.includes('{token.rawText}'),
      'Must render token.rawText as a complete connected word string'
    );
  });

  // ---------------------------------------------------------------------------
  // TEST 2: Preserves Verified Uthmani Script and Diacritics
  // ---------------------------------------------------------------------------
  await runTest('[2.1] Preserves Uthmani diacritics, shaddah, sukoon, and madd in tokens', () => {
    const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    const tokens = tokenizeAyahWithTajweed(bismillah);
    assert.equal(tokens.length, 4, 'Bismillah has 4 words');
    assert.equal(tokens[0].rawText, 'بِسْمِ');
    assert.equal(tokens[1].rawText, 'اللَّهِ');
    assert.equal(tokens[2].rawText, 'الرَّحْمَٰنِ');
    assert.equal(tokens[3].rawText, 'الرَّحِيمِ');
    // Ensure harakat / diacritics are preserved intact
    assert.ok(tokens[0].rawText.includes('\u0650'), 'Kasrah preserved');
    assert.ok(tokens[0].rawText.includes('\u0652'), 'Sukoon preserved');
    assert.ok(tokens[1].rawText.includes('\u0651'), 'Shaddah preserved');
    assert.ok(tokens[2].rawText.includes('\u0670'), 'Dagger Alif preserved');
  });

  // ---------------------------------------------------------------------------
  // TEST 3: Typography & CSS Layout
  // ---------------------------------------------------------------------------
  await runTest('[3.1] No inappropriate letter-spacing (tracking-wide removed from Arabic verse container)', () => {
    // Check the verse container does not have tracking-wide which disrupts cursive joins
    assert(
      !macallinSource.includes('tracking-wide flex flex-wrap items-center justify-center'),
      'Must NOT apply tracking-wide or flex items to Arabic Quran paragraph'
    );
    assert(
      macallinSource.includes('letterSpacing: \'normal\'') || macallinSource.includes('letter-spacing: normal'),
      'Must enforce normal letter spacing for connected Arabic'
    );
  });

  await runTest('[3.2] Proper natural line breaking at word boundaries (break-normal)', () => {
    assert(
      macallinSource.includes('break-normal'),
      'Must use break-normal so line breaks occur only at natural word boundaries'
    );
    assert(
      !macallinSource.includes('break-all'),
      'Must NOT use break-all on Arabic Quran text'
    );
  });

  await runTest('[3.3] Proper RTL direction applied to container', () => {
    assert(
      macallinSource.includes('dir="rtl"'),
      'Must apply RTL direction for correct Arabic reading flow'
    );
    assert(
      macallinSource.includes('font-arabic'),
      'Must use font-arabic (Amiri/Quran compatible font)'
    );
  });

  // ---------------------------------------------------------------------------
  // TEST 4: Error Highlighting & Interactions
  // ---------------------------------------------------------------------------
  await runTest('[4.1] Preserves red error highlighting on words with confirmed mistakes', () => {
    assert(
      macallinSource.includes('text-red-600 dark:text-red-400 font-extrabold'),
      'Must highlight confirmed error words in red'
    );
    assert(
      macallinSource.includes('setSelectedWordMistake'),
      'Must preserve tapping error word to view detailed popover'
    );
  });

  await runTest('[4.2] Words without errors render as natural connected text', () => {
    assert(
      macallinSource.includes('inline hover:text-blue-700') || macallinSource.includes('inline hover:text-emerald-700'),
      'Words without errors must render as inline connected text'
    );
  });

  console.log('\n========================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
