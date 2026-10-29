import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: MACALLIN HIFD (HIDE & REVEAL) & REVISION RECOMMENDATION TESTS');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    ${err.message}\n`);
    failCount++;
  }
}

const macallinComponentPath = path.join(projectRoot, 'src', 'components', 'quran', 'MacallinTeacher.tsx');
const macallinComponentSource = fs.readFileSync(macallinComponentPath, 'utf8');

// ---------------------------------------------------------------------------
// 1. Dual Modes & Mode Switching Without Progress Reset
// ---------------------------------------------------------------------------
await runTest('1.1: Defines recitationMode state with "hifd" and "review" modes', () => {
  assert.ok(
    macallinComponentSource.includes("const [recitationMode, setRecitationMode] = useState<'hifd' | 'review'>('hifd');"),
    'Must define recitationMode state defaulting to hifd'
  );
  assert.ok(
    macallinComponentSource.includes('const isMemorizationMode = recitationMode === \'hifd\';'),
    'Must synchronize isMemorizationMode with recitationMode'
  );
});

await runTest('1.2: Mode switcher renders both Hifd Mode and Review Mode with distinct indicators', () => {
  assert.ok(
    macallinComponentSource.includes('Habka Xifdinta (Aayadaha Qarsan)'),
    'Must render Hifd Mode button with exact label'
  );
  assert.ok(
    macallinComponentSource.includes('Habka Dib-u-eegista (Review Mode)'),
    'Must render Review Mode button with exact label'
  );
  assert.ok(
    macallinComponentSource.includes('data-tutorial="macallin-hifd"'),
    'Must keep data-tutorial attribute on Hifd Mode toggle'
  );
});

await runTest('1.3: handleToggleRecitationMode preserves lesson progress without resetting state', () => {
  assert.ok(
    macallinComponentSource.includes('const handleToggleRecitationMode = (mode: \'hifd\' | \'review\') => {'),
    'Must define handleToggleRecitationMode'
  );
  // Ensure handleToggleRecitationMode does NOT clear completedAyahIndices or currentAyahIndex
  const fnMatch = macallinComponentSource.match(/const handleToggleRecitationMode = \([\s\S]*?\n  \};/);
  assert.ok(fnMatch, 'handleToggleRecitationMode implementation must exist');
  const fnBody = fnMatch[0];
  assert.ok(!fnBody.includes('setCompletedAyahIndices([])'), 'Must NOT clear completed Ayahs on mode toggle');
  assert.ok(!fnBody.includes('setCurrentAyahIndex(0)'), 'Must NOT reset current Ayah on mode toggle');
  assert.ok(!fnBody.includes('collectedAyahAttemptsRef.current = []'), 'Must NOT wipe attempts on mode toggle');
});

// ---------------------------------------------------------------------------
// 2. Hide Ayahs Before Recitation in Hifd Mode
// ---------------------------------------------------------------------------
await runTest('2.1: Concealed Ayah Card renders when in Hifd Mode and ayah is not yet verified', () => {
  assert.ok(
    macallinComponentSource.includes("recitationMode === 'hifd' && !isAyahRevealedForReview"),
    'Must condition concealed card on recitationMode === hifd and !isAyahRevealedForReview'
  );
  assert.ok(
    macallinComponentSource.includes('Habka Xifdinta: Qoraalka Aayadda Waa Qarsan Yahay'),
    'Must display concealed ayah badge'
  );
  assert.ok(
    macallinComponentSource.includes('Ka akhri aayaddan maankaaga adiga oo aan qoraalka eegin'),
    'Must provide clear memorization instruction'
  );
  assert.ok(
    macallinComponentSource.includes('•••••••• •••••••• ••••••••'),
    'Must render masked Uthmani placeholder'
  );
});

await runTest('2.2: Concealed Ayah Card provides quick access to Review Mode without losing progress', () => {
  assert.ok(
    macallinComponentSource.includes("handleToggleRecitationMode('review')"),
    'Concealed card must offer button to switch to Review Mode'
  );
  assert.ok(
    macallinComponentSource.includes('Fur Habka Dib-u-eegista (Review Mode)'),
    'Button must clearly state Review Mode switch'
  );
});

await runTest('2.3: Recording and microphone controls remain accessible while Ayah text is hidden', () => {
  assert.ok(
    macallinComponentSource.includes('Bilow Akhriska'),
    'Must keep "Bilow Akhriska" accessible'
  );
  assert.ok(
    macallinComponentSource.includes('Dhammee Aayadda'),
    'Must keep "Dhammee Aayadda" accessible during recording'
  );
  assert.ok(
    macallinComponentSource.includes('handleFinishAyahAndAdvance'),
    'Must trigger handleFinishAyahAndAdvance on completion'
  );
});

// ---------------------------------------------------------------------------
// 3. Reveal Ayahs After Recitation Only When Verified
// ---------------------------------------------------------------------------
await runTest('3.1: Empty audio or blank transcript does NOT reveal Ayah text and allows retry', () => {
  assert.ok(
    macallinComponentSource.includes('!capturedTranscript || capturedTranscript.trim().length < 2'),
    'Must check for missing/short transcript before verification'
  );
  assert.ok(
    macallinComponentSource.includes('setIsAyahRevealedForReview(false)'),
    'Must ensure isAyahRevealedForReview stays false on unverified/empty input'
  );
  assert.ok(
    macallinComponentSource.includes('Cod lama maqal ama lama xaqiijin karin'),
    'Must inform user when audio is not heard without losing progress'
  );
});

await runTest('3.2: Unverified audio status maintains hidden state and allows retry', () => {
  assert.ok(
    macallinComponentSource.includes("ayahEval.status === 'unverified'"),
    'Must handle unverified status explicitly'
  );
  assert.ok(
    macallinComponentSource.includes('Akhriskaaga lama xaqiijin karin'),
    'Must notify student that audio could not be verified'
  );
});

await runTest('3.3: Detected mistakes reveal Ayah text with red error highlights and retry from memory', () => {
  assert.ok(
    macallinComponentSource.includes("ayahEval.status === 'errors_detected'"),
    'Must handle detected mistakes status'
  );
  assert.ok(
    macallinComponentSource.includes('setIsAyahRevealedForReview(true)'),
    'Must reveal Ayah text when errors are detected so user can learn'
  );
  assert.ok(
    macallinComponentSource.includes('setSessionMistakes(ayahEval.mistakes)'),
    'Must set session mistakes for red highlighting'
  );
});

await runTest('3.4: Retrying Ayah re-hides text so student recites from memory again', () => {
  const retryMatch = macallinComponentSource.match(/const handleRetryCurrentAyah = \(\) => {[\s\S]*?\n  \};/);
  assert.ok(retryMatch, 'handleRetryCurrentAyah must exist');
  const retryBody = retryMatch[0];
  assert.ok(
    retryBody.includes('setIsAyahRevealedForReview(false)'),
    'handleRetryCurrentAyah must re-hide text for memorization attempt'
  );
});

// ---------------------------------------------------------------------------
// 4. Automatic Ayah Progression & Hiding Next Ayah
// ---------------------------------------------------------------------------
await runTest('4.1: Passed evaluation reveals verified Ayah in green and auto-advances', () => {
  assert.ok(
    macallinComponentSource.includes('setIsAyahRevealedForReview(true)'),
    'Must reveal verified Ayah on pass'
  );
  assert.ok(
    macallinComponentSource.includes("setPassageFlowState('advancingAyah')"),
    'Must enter advancingAyah state'
  );
  assert.ok(
    macallinComponentSource.includes('Masha Allah! Aayadda'),
    'Must display Somali praise banner on passed Ayah'
  );
});

await runTest('4.2: Next Ayah is automatically re-hidden until recitation attempt', () => {
  assert.ok(
    macallinComponentSource.includes("setCurrentAyahIndex((prev) => prev + 1);"),
    'Must increment currentAyahIndex'
  );
  assert.ok(
    macallinComponentSource.includes('// RE-HIDE the next Ayah text so student recites from memory!\n        setIsAyahRevealedForReview(false);'),
    'Must re-hide next Ayah text immediately upon advancing'
  );
});

// ---------------------------------------------------------------------------
// 5. Lesson End Assessment & Personalized Revision Recommendations
// ---------------------------------------------------------------------------
await runTest('5.1: Consolidated review renders completed ayahs, mistakes, and accuracy', () => {
  assert.ok(
    macallinComponentSource.includes('Wadarta Aayadaha'),
    'Must show total ayahs in lesson summary'
  );
  assert.ok(
    macallinComponentSource.includes('Aayadaha Saxda ah'),
    'Must show passed ayahs count'
  );
  assert.ok(
    macallinComponentSource.includes('Khaladaadka'),
    'Must show mistakes count'
  );
  assert.ok(
    macallinComponentSource.includes('Saxnaanta (Accuracy)'),
    'Must show overall accuracy %'
  );
});

await runTest('5.2: Renders personalized pedagogical revision recommendations based on accuracy', () => {
  assert.ok(
    macallinComponentSource.includes('Talooyinka Macallinka ee Dib-u-eegista (Revision & Retention Guidance)'),
    'Must render Revision & Retention Guidance title'
  );
  assert.ok(
    macallinComponentSource.includes('Heerka: Mumtaaz (Aad u Sarreeya)'),
    'Must provide Mumtaaz tier for >= 90% accuracy'
  );
  assert.ok(
    macallinComponentSource.includes('Heerka: Jayyid (Wanaagsan)'),
    'Must provide Jayyid tier for 70-89% accuracy'
  );
  assert.ok(
    macallinComponentSource.includes('Heerka: U Baahan Murajaco'),
    'Must provide Murajaco tier for < 70% accuracy'
  );
  assert.ok(
    macallinComponentSource.includes('Aayadaha u baahan dib-u-eegista:'),
    'Must list specific mistake Ayahs needing revision'
  );
});

await runTest('5.3: Actionable revision CTA buttons allow practicing mistake ayahs and opening Review Mode', () => {
  assert.ok(
    macallinComponentSource.includes('Ku celceli Aayadaha Khaladaadka leh (Review Mode)'),
    'Must provide CTA to practice mistake ayahs'
  );
  assert.ok(
    macallinComponentSource.includes('Fur Habka Dib-u-eegista (Eeg Qoraalka)'),
    'Must provide CTA to open Review Mode'
  );
});

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
}
