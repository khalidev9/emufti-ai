import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('EMUFTI AI: MACALLIN AI & SUBCIS MODERN UI/UX REDESIGN TEST SUITE');
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

  const subcisPath = path.join(rootDir, 'src/components/quran/SubcisPractice.tsx');
  assert(fs.existsSync(subcisPath), 'SubcisPractice.tsx must exist');
  const subcisSource = fs.readFileSync(subcisPath, 'utf8');

  // ===========================================================================
  // SECTION 1: MACALLIN AI REDESIGN VERIFICATION
  // ===========================================================================
  console.log('--- Section 1: Macallin AI Modern Dashboard & UI Tests ---');

  await runTest('[1.1] Desktop Split View Layout (lg:grid-cols-12, left column lg:col-span-5/4, right column lg:col-span-7/8)', () => {
    assert(
      macallinSource.includes('lg:grid-cols-12'),
      'Must use responsive 12-column grid for desktop split view'
    );
    assert(
      macallinSource.includes('lg:col-span-5') || macallinSource.includes('lg:col-span-4'),
      'Must define left column for lesson controls and progress'
    );
    assert(
      macallinSource.includes('lg:col-span-7') || macallinSource.includes('lg:col-span-8'),
      'Must define right column for active recitation & feedback canvas'
    );
  });

  await runTest('[1.2] Lesson Configuration & Progress Card with "Dooro Casharka Maanta" and visual metrics', () => {
    assert(
      macallinSource.includes('Dooro Casharka Maanta'),
      'Must display "Dooro Casharka Maanta" header'
    );
    assert(
      macallinSource.includes('Streak') && macallinSource.includes('Saxnaanta'),
      'Must display visual streak and accuracy metrics'
    );
  });

  await runTest('[1.3] Active Recording UI with animated glowing waveform bars (pulse animation)', () => {
    assert(
      macallinSource.includes('Bilow Akhriska'),
      'Must provide prominent "Bilow Akhriska" button'
    );
    assert(
      macallinSource.includes('animate-pulse'),
      'Must provide animated pulsing audio wave bars'
    );
    assert(
      macallinSource.includes('Jooji'),
      'Must provide "Jooji" stop/pause button'
    );
  });

  await runTest('[1.4] Hifd mode toggle with "Qari Qoraalka / Hide Text" and data-tutorial="macallin-hifd"', () => {
    assert(
      macallinSource.includes('data-tutorial="macallin-hifd"'),
      'Must include data-tutorial="macallin-hifd" for onboarding tour'
    );
    assert(
      macallinSource.includes('Qari Qoraalka / Hide Text'),
      'Must display "Qari Qoraalka / Hide Text" badge'
    );
    assert(
      macallinSource.includes('Habka Xifdinta (Aayadaha Qarsan)'),
      'Must display "Habka Xifdinta (Aayadaha Qarsan)"'
    );
  });

  await runTest('[1.5] Error Breakdown Badges: Accurate in green/blue and mistakes in red (bg-red-50/bg-red-100 underline)', () => {
    assert(
      macallinSource.includes('bg-emerald-50 text-emerald-600') || macallinSource.includes('bg-emerald-50') || macallinSource.includes('bg-emerald') || macallinSource.includes('bg-blue-500/15'),
      'Accurate words must render with verified badges'
    );
    assert(
      macallinSource.includes('text-red-600') && macallinSource.includes('underline'),
      'Mispronounced words must render with red underline badges'
    );
    assert(
      macallinSource.includes('text-red-600 dark:text-red-400 font-extrabold'),
      'Must strictly preserve text-red-600 dark:text-red-400 font-extrabold for test contract'
    );
  });

  await runTest('[1.6] AI Teacher insight box ("Jawaabta Macallin AI") with retry options (Ku celi aayaddan, Ku celi Casharka)', () => {
    assert(
      macallinSource.includes('Jawaabta Macallin AI'),
      'Must render "Jawaabta Macallin AI" box'
    );
    assert(
      macallinSource.includes('Ku celi aayaddan'),
      'Must provide "Ku celi aayaddan" retry action'
    );
    assert(
      macallinSource.includes('Ku celi Casharka'),
      'Must provide "Ku celi Casharka" retry action'
    );
  });

  await runTest('[1.7] Tomorrow\'s Lesson Card ("Casharka Berri") distinct preview with calendar/clock icon', () => {
    assert(
      macallinSource.includes('Casharka Berri'),
      'Must render "Casharka Berri" preview card'
    );
    assert(
      macallinSource.includes('Calendar') && macallinSource.includes('Clock'),
      'Must include Calendar and Clock icons'
    );
  });

  // ===========================================================================
  // SECTION 2: SUBCIS ALTERNATING RECITATION REDESIGN VERIFICATION
  // ===========================================================================
  console.log('\n--- Section 2: Subcis Alternating Recitation Modern UI Tests ---');

  await runTest('[2.1] Configuration Bar with instant Qari avatar badges and "Dooro Qaariga kula subcinaya"', () => {
    assert(
      subcisSource.includes('Dooro Qaariga kula subcinaya'),
      'Must display title "Dooro Qaariga kula subcinaya"'
    );
    assert(
      subcisSource.includes('verseReciters.slice(0, 8).map') || subcisSource.includes('verseReciters.map'),
      'Must render interactive Qari avatar badges'
    );
  });

  await runTest('[2.2] Sheekha\'s Turn soft blue banner (bg-blue-600 text-white) with waveform bars and "Qaarigu wuxuu akhrinayaa aayadda…"', () => {
    assert(
      subcisSource.includes('bg-blue-600 text-white'),
      'Must style Sheekha\'s turn with bg-blue-600 text-white banner'
    );
    assert(
      subcisSource.includes('Sheekha ayaa akhrinaya') || subcisSource.includes('Sheikh ayaa akhrinaya'),
      'Must display "Sheekha ayaa akhrinaya" or "Sheikh ayaa akhrinaya"'
    );
    assert(
      subcisSource.includes('Qaarigu wuxuu akhrinayaa aayadda…'),
      'Must preserve exact test string "Qaarigu wuxuu akhrinayaa aayadda…"'
    );
  });

  await runTest('[2.3] Student\'s Turn soft emerald banner (bg-emerald-600 text-white) with live mic state and countdown', () => {
    assert(
      subcisSource.includes('bg-emerald-600 text-white'),
      'Must style Student\'s turn with bg-emerald-600 text-white banner'
    );
    assert(
      subcisSource.includes('Adiga ayaa iska leh') || subcisSource.includes('Adiga ayaa akhrinaya'),
      'Must display "Adiga ayaa iska leh" or "Adiga ayaa akhrinaya"'
    );
    assert(
      subcisSource.includes('Hadda adiga akhri aayadda xigta.'),
      'Must preserve exact test string "Hadda adiga akhri aayadda xigta."'
    );
    assert(
      subcisSource.includes('Codkaaga waa la duubayaa…'),
      'Must preserve exact test string "Codkaaga waa la duubayaa…"'
    );
    assert(
      subcisSource.includes('Akhri waqtiga haray:'),
      'Must preserve exact test string "Akhri waqtiga haray:"'
    );
  });

  await runTest('[2.4] Alternating Verse Cards: Recitation history thread with checkmarks', () => {
    assert(
      subcisSource.includes('userAttemptRecords.map'),
      'Must render alternating recitation history thread'
    );
    assert(
      subcisSource.includes('CheckCircle2'),
      'Must display completion checkmarks on verified turns'
    );
  });

  await runTest('[2.5] Mobile Bottom Action Bar docked inside frosted-glass bottom sheet (backdrop-blur-xl bg-slate-900/80 border-t border-slate-800 p-4)', () => {
    assert(
      subcisSource.includes('backdrop-blur-xl bg-slate-900/80 border-t border-slate-800 p-4'),
      'Must render mobile bottom action bar inside backdrop-blur-xl bg-slate-900/80 border-t border-slate-800 p-4'
    );
  });

  console.log('\n========================================================================');
  console.log(`TOTAL REDESIGN TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
