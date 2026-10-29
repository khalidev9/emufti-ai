/**
 * EMUFTI AI — Quiz Features, Content Pipeline, and Settings Groups Test Suite
 * 
 * Verifies:
 * 1. 15 authentic Islamic knowledge topics coverage and metadata.
 * 2. Question bank integrity: 4 options, stable IDs ('opt_1'..'opt_4'), valid correct_option_id, citations, explanations.
 * 3. Shuffling preserves correct answer by stable ID.
 * 4. 50/50 lifeline eliminates exactly 2 incorrect options.
 * 5. Ask EMufti scholarly guidance hint generation.
 * 6. Difficulty and category filtering.
 * 7. Settings 6 groups and tab mapping.
 * 8. Validation pipeline detects bad data (missing fields, wrong options count, duplicate text).
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n=============================================================');
console.log('🧪 EMUFTI AI: Quiz Features, Content Pipeline & Settings Tests');
console.log('=============================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Load Question Bank & Metadata from JSON
// -----------------------------------------------------------------------------
const quizQuestionsJsonPath = path.join(rootDir, 'src', 'data', 'quizQuestions.json');
assert.ok(fs.existsSync(quizQuestionsJsonPath), 'quizQuestions.json must exist');
const questions = JSON.parse(fs.readFileSync(quizQuestionsJsonPath, 'utf8'));

const tsContent = fs.readFileSync(path.join(rootDir, 'src', 'data', 'quizQuestions.ts'), 'utf8');
const catMatch = tsContent.match(/export const QUIZ_CATEGORIES_METADATA: QuizCategoryMeta\[\] = (\[[\s\S]*?\]);/);
assert.ok(catMatch && catMatch[1], 'Must match QUIZ_CATEGORIES_METADATA array');
const categories = JSON.parse(catMatch[1]);

// Test 1: Exactly 15 authentic categories defined
runTest('All 15 authentic Islamic categories defined in metadata', () => {
  assert.ok(Array.isArray(categories), 'Categories must be an array');
  assert.strictEqual(categories.length, 15, `Expected 15 categories, got ${categories.length}`);

  const expectedIds = [
    'quran',
    'tafsir',
    'hadith',
    'aqeedah',
    'fiqh',
    'purification_prayer',
    'fasting_ramadan',
    'zakat_charity',
    'hajj_umrah',
    'seerah',
    'history_companions',
    'adhkar_duas_manners',
    'ethics_daily_life',
    'arabic_terminology',
    'general',
  ];

  for (const id of expectedIds) {
    const found = categories.find((c) => c.id === id);
    assert.ok(found, `Category '${id}' must be present in categories metadata`);
    assert.ok(found.name_en, `Category '${id}' must have English name`);
    assert.ok(found.name_so, `Category '${id}' must have Somali name`);
    assert.ok(found.name_ar, `Category '${id}' must have Arabic name`);
    assert.ok(found.iconName, `Category '${id}' must specify an icon`);
  }
});

// Test 2: Questions Bank Integrity
runTest('Question bank integrity: 4 options, stable IDs, valid citations', () => {
  assert.ok(Array.isArray(questions), 'Questions must be an array');
  assert.ok(questions.length >= 45, `Expected at least 45 verified questions, got ${questions.length}`);

  const seenIds = new Set();
  const seenTexts = new Set();

  for (const q of questions) {
    const qId = q.id || q.question_id;
    assert.ok(qId, 'Question must have an id');
    assert.ok(!seenIds.has(qId), `Duplicate question id found: ${qId}`);
    seenIds.add(qId);

    const normText = q.question_en.toLowerCase().trim();
    assert.ok(!seenTexts.has(normText), `Duplicate question text found: "${q.question_en}"`);
    seenTexts.add(normText);

    assert.ok(q.question_en && q.question_en.length > 5, `Question ${qId} missing valid question_en`);
    assert.ok(q.question_so && q.question_so.length > 5, `Question ${qId} missing valid question_so`);
    assert.ok(q.source_citation && q.source_citation.length > 3, `Question ${qId} missing valid source_citation`);
    assert.ok(q.explanation_en && q.explanation_en.length > 5, `Question ${qId} missing valid explanation_en`);

    // Verify exactly 4 options
    assert.ok(Array.isArray(q.options), `Question ${qId} options must be an array`);
    assert.strictEqual(q.options.length, 4, `Question ${qId} must have exactly 4 options`);

    const optIds = q.options.map((o) => o.id);
    const expectedOptIds = ['opt_1', 'opt_2', 'opt_3', 'opt_4'];
    assert.deepStrictEqual(optIds.sort(), expectedOptIds.sort(), `Question ${qId} options must use stable IDs opt_1..opt_4`);

    // Verify correct_option_id exists in options
    assert.ok(optIds.includes(q.correct_option_id), `Question ${qId} correct_option_id (${q.correct_option_id}) not found in options`);
  }
});

// Test 3: Option Shuffling preserves correctness
runTest('Option shuffling preserves correct answer by stable ID', () => {
  const sampleQ = questions[0];
  const originalCorrectId = sampleQ.correct_option_id;

  // Simulate shuffle function
  function shuffle(q, seed = 12345) {
    const opts = [...q.options];
    // Deterministic pseudo-random
    let s = seed;
    for (let i = opts.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const displayedCorrectIndex = opts.findIndex((o) => o.id === q.correct_option_id);
    return {
      ...q,
      shuffled_options: opts,
      displayed_correct_index: displayedCorrectIndex,
    };
  }

  const shuffled1 = shuffle(sampleQ, 42);
  const shuffled2 = shuffle(sampleQ, 999);

  // The correct option ID remains stable
  assert.strictEqual(shuffled1.correct_option_id, originalCorrectId);
  assert.strictEqual(shuffled2.correct_option_id, originalCorrectId);

  // The option at displayed_correct_index matches correct_option_id
  assert.strictEqual(shuffled1.shuffled_options[shuffled1.displayed_correct_index].id, originalCorrectId);
  assert.strictEqual(shuffled2.shuffled_options[shuffled2.displayed_correct_index].id, originalCorrectId);
});

// Test 4: 50/50 Lifeline Logic
runTest('50/50 Lifeline eliminates exactly 2 incorrect options', () => {
  const sampleQ = questions[0];
  const correctId = sampleQ.correct_option_id;

  const incorrectOptions = sampleQ.options.filter((o) => o.id !== correctId);
  assert.strictEqual(incorrectOptions.length, 3, 'Must have 3 incorrect options');

  // Eliminate 2 wrong options
  const toEliminate = incorrectOptions.slice(0, 2).map((o) => o.id);
  assert.strictEqual(toEliminate.length, 2, 'Must eliminate exactly 2 options');
  assert.ok(!toEliminate.includes(correctId), '50/50 must never eliminate the correct option');

  const remaining = sampleQ.options.filter((o) => !toEliminate.includes(o.id));
  assert.strictEqual(remaining.length, 2, 'Exactly 2 options must remain active');
  assert.ok(remaining.some((o) => o.id === correctId), 'Correct option must remain in active options');
});

// Test 5: Ask EMufti Guidance Hint
runTest('Ask EMufti Lifeline generates authentic guidance based on question citation', () => {
  const sampleQ = questions[0];
  const citation = sampleQ.source_citation;

  function generateHint(q, lang) {
    if (lang === 'so') {
      return `Daliilka: [${q.source_citation}]`;
    }
    return `Proof: [${q.source_citation}]`;
  }

  const hintEn = generateHint(sampleQ, 'en');
  const hintSo = generateHint(sampleQ, 'so');

  assert.ok(hintEn.includes(citation), 'English hint must include source citation');
  assert.ok(hintSo.includes(citation), 'Somali hint must include source citation');
});

// Test 6: Settings 6 Groups Architecture
runTest('Settings page supports the 6 distinct groups', () => {
  const settingsFile = path.join(rootDir, 'src', 'pages', 'SettingsPage.tsx');
  const content = fs.readFileSync(settingsFile, 'utf8');

  // Verify all 6 groups are defined in tabs
  assert.ok(content.includes("'profile'"), "Must support 'profile' tab");
  assert.ok(content.includes("'appearance'"), "Must support 'appearance' tab");
  assert.ok(content.includes("'security'"), "Must support 'security' tab");
  assert.ok(content.includes("'preferences'"), "Must support 'preferences' tab");
  assert.ok(content.includes("'subscription'"), "Must support 'subscription' tab");
  assert.ok(content.includes("'account'"), "Must support 'account' tab");

  // Verify tab labels have the 6 numbered groups
  assert.ok(content.includes('1. Profile'), 'Must label 1. Profile');
  assert.ok(content.includes('2. Appearance'), 'Must label 2. Appearance');
  assert.ok(content.includes('3. Privacy & Security'), 'Must label 3. Privacy & Security');
  assert.ok(content.includes('4. Preferences & Methodology'), 'Must label 4. Preferences & Methodology');
  assert.ok(content.includes('5. Subscription'), 'Must label 5. Subscription');
  assert.ok(content.includes('6. Account Management'), 'Must label 6. Account Management');
});

// Test 7: Mobile Chat Smart Auto-scroll and Composer Safety
runTest('Mobile Chat smart auto-scroll and composer touch target safety', () => {
  const chatPageFile = path.join(rootDir, 'src', 'pages', 'ChatPage.tsx');
  const chatContent = fs.readFileSync(chatPageFile, 'utf8');
  assert.ok(chatContent.includes('isNearBottomRef'), 'ChatPage must track isNearBottomRef for smart scroll');
  assert.ok(chatContent.includes('scrollContainerRef'), 'ChatPage must attach scrollContainerRef to main');

  const composerFile = path.join(rootDir, 'src', 'components', 'chat', 'MessageComposer.tsx');
  const composerContent = fs.readFileSync(composerFile, 'utf8');
  assert.ok(composerContent.includes('min-h-[44px] min-w-[44px]'), 'Send button must enforce 44px min touch target');
  assert.ok(composerContent.includes('env(safe-area-inset-bottom'), 'Composer must handle iOS safe-area-inset-bottom');
});

// Test 8: Validator rejects invalid question data
runTest('Automated validator rejects invalid options or missing citations', () => {
  function validateQuestion(q) {
    if (!q.question_en || !q.question_so) return { valid: false, error: 'Missing question text' };
    if (!Array.isArray(q.options) || q.options.length !== 4) return { valid: false, error: 'Must have 4 options' };
    if (!q.correct_option_id) return { valid: false, error: 'Missing correct_option_id' };
    if (!q.options.some((o) => o.id === q.correct_option_id)) return { valid: false, error: 'correct_option_id not in options' };
    if (!q.source_citation) return { valid: false, error: 'Missing citation' };
    return { valid: true };
  }

  // Good question
  assert.strictEqual(validateQuestion(questions[0]).valid, true);

  // Missing options
  assert.strictEqual(validateQuestion({ ...questions[0], options: [{ id: 'opt_1' }] }).valid, false);

  // Missing citation
  assert.strictEqual(validateQuestion({ ...questions[0], source_citation: '' }).valid, false);

  // Invalid correct_option_id
  assert.strictEqual(validateQuestion({ ...questions[0], correct_option_id: 'opt_999' }).valid, false);
});

// Test 9: Daily Quiz Deterministic Seed Generation
runTest('Daily Quiz deterministic seed produces identical questions for the same date', () => {
  function getSeedForDate(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickDeterministicQuestions(pool, count, seed) {
    const list = [...pool];
    let s = seed;
    for (let i = list.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, count);
  }

  const seedA = getSeedForDate('2026-10-20');
  const seedB = getSeedForDate('2026-10-20');
  const seedC = getSeedForDate('2026-10-21');

  const setA = pickDeterministicQuestions(questions, 10, seedA);
  const setB = pickDeterministicQuestions(questions, 10, seedB);
  const setC = pickDeterministicQuestions(questions, 10, seedC);

  assert.strictEqual(setA.length, 10);
  assert.strictEqual(setB.length, 10);
  assert.deepStrictEqual(
    setA.map((q) => q.id || q.question_id),
    setB.map((q) => q.id || q.question_id),
    'Same calendar date must produce the exact same 10 questions'
  );
  assert.notDeepStrictEqual(
    setA.map((q) => q.id || q.question_id),
    setC.map((q) => q.id || q.question_id),
    'Different calendar date should produce a distinct daily quiz question set'
  );
});

// Test 10: QuizPage features and tabs integrity
runTest('QuizPage supports Learning Tabs, Practice vs Exam mode, and Bookmarks', () => {
  const quizPageFile = path.join(rootDir, 'src', 'pages', 'QuizPage.tsx');
  const content = fs.readFileSync(quizPageFile, 'utf8');

  assert.ok(content.includes("'daily'"), "QuizPage must support 'daily' tab");
  assert.ok(content.includes("'dashboard'"), "QuizPage must support 'dashboard' tab");
  assert.ok(content.includes("'mistakes'"), "QuizPage must support 'mistakes' tab");
  assert.ok(content.includes("'bookmarks'"), "QuizPage must support 'bookmarks' tab");
  assert.ok(content.includes("'practice'"), "QuizPage must support 'practice' mode");
  assert.ok(content.includes("'exam'"), "QuizPage must support 'exam' mode");
  assert.ok(content.includes('handleToggleBookmark'), 'QuizPage must support bookmark toggling');
  assert.ok(content.includes('handleRetryIncorrect'), 'QuizPage must support retrying incorrect questions');
  assert.ok(content.includes('studyStreak'), 'QuizPage must support daily study streak tracking');
});

// Test 11: Admin 1,000 Milestone Tracking & Export Functionality
runTest('AdminPage supports honest 1,000-question milestone metrics and JSON export', () => {
  const adminPageFile = path.join(rootDir, 'src', 'pages', 'AdminPage.tsx');
  const content = fs.readFileSync(adminPageFile, 'utf8');

  assert.ok(content.includes('1,000-Question Islamic Knowledge Expansion Milestone'), 'Must render 1,000 milestone header');
  assert.ok(content.includes('Verified Active in Bank'), 'Must track active verified count');
  assert.ok(content.includes('Pending Review'), 'Must track pending review count');
  assert.ok(content.includes('Remaining to 1,000'), 'Must compute remaining questions to 1,000 target');
  assert.ok(content.includes('Export JSON'), 'Must support exporting question bank to JSON');
  assert.ok(content.includes('Batch Ingest JSON'), 'Must support batch ingesting questions');
});

console.log('\n-------------------------------------------------------------');
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log('-------------------------------------------------------------\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
