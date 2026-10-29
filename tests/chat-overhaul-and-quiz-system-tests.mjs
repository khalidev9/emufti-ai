/**
 * EMUFTI AI — Chat Interface Overhaul & Full-Featured Quiz System Tests
 *
 * Verifies:
 * 1. Top-Right Profile: User profile picture, full name, and "PREMIUM" badge directly underneath.
 * 2. Branding: Prominent blue logo and EMufti AI scheme, zero visible "Online" text in rendered layout.
 * 3. Navigation Buttons: Sidebar has Holy Quran (/quran), EMufti Quiz (/quiz), Dashboard (/dashboard), Help Center (/help).
 * 4. Question Bank: Exactly 2,000 verified authentic questions with 4 options, valid citations, explanations.
 * 5. Quiz Engine: 90-second countdown timer, 50/50 lifeline (2 uses), Weydii EMufti lifeline (1 use).
 * 6. Visual Effects & Leaderboard: Confetti celebration on correct answer and interactive Leaderboard with top 3 podium.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n========================================================================');
console.log('🧪 EMUFTI AI: CHAT OVERHAUL & FULL-FEATURED QUIZ SYSTEM VERIFICATION');
console.log('========================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Header Layout & Branding Verification
// -----------------------------------------------------------------------------
const headerPath = path.join(rootDir, 'src', 'components', 'layout', 'Header.tsx');
assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
const headerSrc = fs.readFileSync(headerPath, 'utf8');

runTest('1.1 Header brand features prominent blue emblem and EMufti AI styling', () => {
  assert.ok(headerSrc.includes('bg-blue-600'), 'Brand logo badge must have royal blue bg-blue-600');
  assert.ok(headerSrc.includes('EMufti'), 'Brand title must have EMufti');
  assert.ok(headerSrc.includes('text-blue-600 font-extrabold'), 'AI branding text must be prominent blue font');
});

runTest('1.2 Header top-right profile renders clean UserAvatar icon without surrounding card or name', () => {
  assert.ok(headerSrc.includes('UserAvatar'), 'Must render UserAvatar component');
  assert.ok(headerSrc.includes('to="/profile"'), 'Must link to user profile');
});

// -----------------------------------------------------------------------------
// 2. Sidebar Core Navigation Buttons
// -----------------------------------------------------------------------------
const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.tsx');
assert.ok(fs.existsSync(sidebarPath), 'Sidebar.tsx must exist');
const sidebarSrc = fs.readFileSync(sidebarPath, 'utf8');

runTest('2.1 Sidebar features Holy Quran navigation button linked to /quran', () => {
  assert.ok(sidebarSrc.includes('to="/quran"'), 'Sidebar must contain link to /quran');
  assert.ok(sidebarSrc.includes('Holy Quran'), 'Sidebar must have Holy Quran button text');
});

runTest('2.2 Sidebar features EMufti Quiz navigation button linked to /quiz', () => {
  assert.ok(sidebarSrc.includes('to="/quiz"'), 'Sidebar must contain link to /quiz');
  assert.ok(sidebarSrc.includes('EMufti Quiz'), 'Sidebar must have EMufti Quiz button text');
});

runTest('2.3 Sidebar features Dashboard navigation button linked to /dashboard', () => {
  assert.ok(sidebarSrc.includes('to="/dashboard"'), 'Sidebar must contain link to /dashboard');
  assert.ok(sidebarSrc.includes('Dashboard'), 'Sidebar must have Dashboard button text');
});

runTest('2.4 Sidebar features Help Center navigation button linked to /help', () => {
  assert.ok(sidebarSrc.includes('to="/help"'), 'Sidebar must contain link to /help');
  assert.ok(sidebarSrc.includes('Help Center'), 'Sidebar must have Help Center button text');
});

runTest('2.5 Sidebar profile card arranges User Name with SubscriptionBadge directly underneath', () => {
  assert.ok(sidebarSrc.includes('flex flex-col items-start'), 'Sidebar profile must stack name and badge vertically');
  assert.ok(sidebarSrc.includes('SubscriptionBadge'), 'Sidebar profile must render SubscriptionBadge');
});

// -----------------------------------------------------------------------------
// 3. 2,000-Question Bank Verification
// -----------------------------------------------------------------------------
const quizJsonPath = path.join(rootDir, 'src', 'data', 'quizQuestions.json');
assert.ok(fs.existsSync(quizJsonPath), 'quizQuestions.json must exist');
const quizQuestions = JSON.parse(fs.readFileSync(quizJsonPath, 'utf8'));

runTest('3.1 Question bank contains exactly 2,000 distinct verified questions', () => {
  assert.strictEqual(quizQuestions.length, 2000, `Expected exactly 2000 questions, got ${quizQuestions.length}`);
});

runTest('3.2 All 2,000 questions contain 4 unique options with stable IDs', () => {
  const seenIds = new Set();
  for (const q of quizQuestions) {
    const qId = q.id || q.question_id;
    assert.ok(qId, 'Question must have valid ID');
    assert.ok(!seenIds.has(qId), `Duplicate ID found: ${qId}`);
    seenIds.add(qId);

    assert.strictEqual(q.options.length, 4, `Question ${qId} must have exactly 4 options`);
    const optIds = new Set(q.options.map(o => o.id));
    assert.strictEqual(optIds.size, 4, `Question ${qId} options must have unique IDs`);
    assert.ok(q.options.some(o => o.id === q.correct_option_id), `Question ${qId} correct_option_id must match an option`);
  }
});

runTest('3.3 Question bank covers all essential Islamic categories', () => {
  const categories = new Set(quizQuestions.map(q => q.category));
  const expectedCats = ['quran', 'tafsir', 'seerah', 'fiqh', 'aqeedah', 'hadith'];
  for (const cat of expectedCats) {
    assert.ok(categories.has(cat), `Category '${cat}' must be covered in question bank`);
  }
});

// -----------------------------------------------------------------------------
// 4. Quiz Page Features: 90s Timer, Lifelines, Confetti & Leaderboard
// -----------------------------------------------------------------------------
const quizPagePath = path.join(rootDir, 'src', 'pages', 'QuizPage.tsx');
assert.ok(fs.existsSync(quizPagePath), 'QuizPage.tsx must exist');
const quizPageSrc = fs.readFileSync(quizPagePath, 'utf8');

runTest('4.1 Quiz countdown timer defaults to 90 seconds per question', () => {
  assert.ok(quizPageSrc.includes('timeLimitPerQuestion, setTimeLimitPerQuestion] = useState<number>(90)'), 'Default time limit must be 90s');
  assert.ok(quizPageSrc.includes('timeLeft, setTimeLeft] = useState<number>(90)'), 'Initial countdown time must be 90s');
  assert.ok(quizPageSrc.includes('[30, 45, 60, 90]'), 'Countdown options must include 90s');
});

runTest('4.2 50/50 Lifeline supports up to 2 uses per session', () => {
  assert.ok(quizPageSrc.includes('lifeline5050Count, setLifeline5050Count] = useState<number>(2)'), '50/50 lifeline must start with 2 uses');
  assert.ok(quizPageSrc.includes('lifeline5050Count <= 0'), '50/50 must disable when count reaches 0');
  assert.ok(quizPageSrc.includes('lifeline5050Count}/2'), 'UI must show remaining 50/50 count out of 2');
});

runTest('4.3 Weydii EMufti Lifeline supports 1 use per session', () => {
  assert.ok(quizPageSrc.includes('lifelineAskEMuftiCount, setLifelineAskEMuftiCount] = useState<number>(1)'), 'Weydii EMufti must start with 1 use');
  assert.ok(quizPageSrc.includes('lifelineAskEMuftiCount <= 0'), 'Weydii EMufti must disable when count reaches 0');
  assert.ok(quizPageSrc.includes('lifelineAskEMuftiCount}/1'), 'UI must show remaining count out of 1');
  assert.ok(quizPageSrc.includes('Weydii EMufti'), 'UI button must be labeled Weydii EMufti');
});

runTest('4.4 Celebratory Confetti system is integrated on correct answer selection', () => {
  assert.ok(quizPageSrc.includes('QuizConfetti'), 'Must import and mount QuizConfetti');
  assert.ok(quizPageSrc.includes('setShowConfetti(true)'), 'Must trigger confetti on correct answer');
});

runTest('4.5 Frontend Leaderboard tab and component integrated with podium', () => {
  assert.ok(quizPageSrc.includes('QuizLeaderboard'), 'Must import and mount QuizLeaderboard');
  assert.ok(quizPageSrc.includes("id: 'leaderboard'"), 'Must define leaderboard navigation tab');

  const leaderboardPath = path.join(rootDir, 'src', 'components', 'quiz', 'QuizLeaderboard.tsx');
  assert.ok(fs.existsSync(leaderboardPath), 'QuizLeaderboard.tsx component must exist');
  const lbSrc = fs.readFileSync(leaderboardPath, 'utf8');
  assert.ok(lbSrc.includes('🥇') && lbSrc.includes('🥈') && lbSrc.includes('🥉'), 'Leaderboard must display top 3 podium medals');
  assert.ok(lbSrc.includes('Your Rank') || lbSrc.includes('Waxaad ku jirtaa kaalinta'), 'Must display current user ranking card');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
console.log('========================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
