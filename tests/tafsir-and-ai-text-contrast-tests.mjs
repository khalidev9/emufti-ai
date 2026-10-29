import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: TAFSIR & AI RESPONSE CARD TEXT CONTRAST VERIFICATION');
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
// SECTION 1: QuranStudyActionDrawer Text Contrast & Markdown Formatting
// -----------------------------------------------------------------------------
console.log('--- Section 1: QuranStudyActionDrawer Text Contrast & Formatting ---');
const studyDrawerPath = path.join(rootDir, 'src', 'components', 'quran', 'QuranStudyActionDrawer.tsx');
assert(fs.existsSync(studyDrawerPath), '1.1 QuranStudyActionDrawer.tsx exists on disk');

const studyDrawerContent = fs.readFileSync(studyDrawerPath, 'utf-8');

assert(
  studyDrawerContent.includes('renderTafsirMarkdown') &&
  studyDrawerContent.includes('renderFormattedInline'),
  '1.2 Drawer implements renderTafsirMarkdown and renderFormattedInline markdown parsers'
);

assert(
  studyDrawerContent.includes('text-slate-900 dark:text-slate-100') ||
  studyDrawerContent.includes('text-gray-900'),
  '1.3 Content container uses crisp dark/black body text (text-slate-900 / text-gray-900)'
);

assert(
  studyDrawerContent.includes('text-black dark:text-white') ||
  studyDrawerContent.includes('text-slate-950 dark:text-white'),
  '1.4 Markdown headers and bold text use deep dark/black styling (text-black / font-bold text-slate-950)'
);

assert(
  studyDrawerContent.includes('renderTafsirMarkdown(tafsirContent)') &&
  studyDrawerContent.includes('renderTafsirMarkdown(lessonsContent)'),
  '1.5 Both Tafsirs and Lessons tabs render substantive content through the high-contrast markdown engine'
);

// -----------------------------------------------------------------------------
// SECTION 2: QuranWeydiiEMuftiDrawer Text Contrast & Markdown Formatting
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: QuranWeydiiEMuftiDrawer Text Contrast & Formatting ---');
const weydiiDrawerPath = path.join(rootDir, 'src', 'components', 'quran', 'QuranWeydiiEMuftiDrawer.tsx');
assert(fs.existsSync(weydiiDrawerPath), '2.1 QuranWeydiiEMuftiDrawer.tsx exists on disk');

const weydiiDrawerContent = fs.readFileSync(weydiiDrawerPath, 'utf-8');

assert(
  weydiiDrawerContent.includes('renderFormattedInline'),
  '2.2 Weydii drawer integrates renderFormattedInline helper for bold tags'
);

assert(
  weydiiDrawerContent.includes('text-slate-900 dark:text-slate-100') ||
  weydiiDrawerContent.includes('text-gray-900'),
  '2.3 AI response container uses crisp dark body text (text-slate-900)'
);

assert(
  weydiiDrawerContent.includes('text-black dark:text-white') ||
  weydiiDrawerContent.includes('text-slate-950 dark:text-white'),
  '2.4 AI response headings and bold elements use prominent black/dark text'
);

console.log('\n========================================================================');
console.log(`TOTAL CONTRAST TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
