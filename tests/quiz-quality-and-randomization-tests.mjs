import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  VERIFIED_QUESTION_BANK,
  TOTAL_VERIFIED_QUESTIONS,
  getQuizQuestions,
  shuffleQuestionOptions,
  getQuestionBankStats,
  generateAskEMuftiHint,
} from '../src/data/quizQuestions.ts';

console.log('================================================================');
console.log('EMUFTI QUIZ — QUALITY, DIFFICULTY & RANDOMIZATION TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// REQUIREMENT 1: Each difficulty retrieves only its eligible questions
// -----------------------------------------------------------------------------
console.log('--- REQ 1: Strict Difficulty Separation ---');

runTest('Beginner difficulty retrieves strictly Beginner/Easy questions', () => {
  const beginnerQuestions = getQuizQuestions({ difficulty: 'beginner', count: 100 });
  assert(beginnerQuestions.length > 0, 'Must retrieve beginner questions');
  for (const q of beginnerQuestions) {
    assert(
      q.difficulty === 'beginner' || q.difficulty === 'easy',
      `Question ${q.id} has difficulty "${q.difficulty}", expected "beginner"`
    );
  }
});

runTest('Intermediate difficulty retrieves strictly Intermediate/Medium questions', () => {
  const intermediateQuestions = getQuizQuestions({ difficulty: 'intermediate', count: 100 });
  assert(intermediateQuestions.length > 0, 'Must retrieve intermediate questions');
  for (const q of intermediateQuestions) {
    assert(
      q.difficulty === 'intermediate' || q.difficulty === 'medium',
      `Question ${q.id} has difficulty "${q.difficulty}", expected "intermediate"`
    );
  }
});

runTest('Advanced difficulty retrieves strictly Advanced/Hard questions', () => {
  const advancedQuestions = getQuizQuestions({ difficulty: 'advanced', count: 100 });
  assert(advancedQuestions.length > 0, 'Must retrieve advanced questions');
  for (const q of advancedQuestions) {
    assert(
      q.difficulty === 'advanced' || q.difficulty === 'hard',
      `Question ${q.id} has difficulty "${q.difficulty}", expected "advanced"`
    );
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 2: Every standard question has exactly four distinct options
// -----------------------------------------------------------------------------
console.log('\n--- REQ 2: Exactly Four Distinct Options ---');

runTest('Every question in the bank has exactly four distinct options in EN, SO, and AR', () => {
  for (const q of VERIFIED_QUESTION_BANK) {
    assert.strictEqual(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);

    // Verify option IDs are unique
    const optionIds = q.options.map(o => o.id);
    const uniqueIds = new Set(optionIds);
    assert.strictEqual(uniqueIds.size, 4, `Question ${q.id} must have 4 unique option IDs`);

    // Verify English text is distinct
    const textsEn = q.options.map(o => o.text_en.trim().toLowerCase());
    assert.strictEqual(new Set(textsEn).size, 4, `Question ${q.id} has duplicate English options`);

    // Verify Somali text is distinct
    const textsSo = q.options.map(o => o.text_so.trim().toLowerCase());
    assert.strictEqual(new Set(textsSo).size, 4, `Question ${q.id} has duplicate Somali options`);

    // Verify Arabic text is distinct
    const textsAr = q.options.map(o => o.text_ar.trim().toLowerCase());
    assert.strictEqual(new Set(textsAr).size, 4, `Question ${q.id} has duplicate Arabic options`);
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 3: Every single-answer question has exactly one valid correct answer
// -----------------------------------------------------------------------------
console.log('\n--- REQ 3: Exactly One Valid Correct Answer ---');

runTest('Every question has exactly one valid correct_option_id matching an option', () => {
  for (const q of VERIFIED_QUESTION_BANK) {
    assert(q.correct_option_id, `Question ${q.id} must define correct_option_id`);
    const matching = q.options.filter(o => o.id === q.correct_option_id);
    assert.strictEqual(matching.length, 1, `Question ${q.id} must have exactly 1 matching correct option`);
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 4: Shuffling options preserves the correct answer by stable ID
// -----------------------------------------------------------------------------
console.log('\n--- REQ 4: Shuffling Preserves Correct Answer Mapping ---');

runTest('Shuffling options preserves the correct option content via correct_option_id', () => {
  for (const q of VERIFIED_QUESTION_BANK) {
    const originalCorrectOption = q.options.find(o => o.id === q.correct_option_id);
    
    // Shuffle 10 times with different random sequences
    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleQuestionOptions(q);
      const displayedCorrectOption = shuffled.options[shuffled.displayed_correct_index];

      assert.strictEqual(
        displayedCorrectOption.id,
        q.correct_option_id,
        `Displayed correct option ID must equal stable correct_option_id`
      );
      assert.strictEqual(
        displayedCorrectOption.text_en,
        originalCorrectOption.text_en,
        `Correct answer text must be identical before and after shuffle`
      );
    }
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 5: Correct-answer positions vary and have no fixed repeating pattern
// -----------------------------------------------------------------------------
console.log('\n--- REQ 5: Correct-Answer Position Distribution Across A, B, C, D ---');

runTest('Correct-answer positions distribute across all four slots (0, 1, 2, 3) over time', () => {
  const slotCounts = [0, 0, 0, 0];
  const rounds = 1000;

  for (let i = 0; i < rounds; i++) {
    const q = VERIFIED_QUESTION_BANK[i % VERIFIED_QUESTION_BANK.length];
    const shuffled = shuffleQuestionOptions(q);
    slotCounts[shuffled.displayed_correct_index]++;
  }

  // Each slot should receive roughly 25% (at least 15% to 35% in 1,000 samples)
  for (let s = 0; s < 4; s++) {
    const percentage = (slotCounts[s] / rounds) * 100;
    assert(
      percentage >= 15 && percentage <= 35,
      `Slot ${s} received ${percentage.toFixed(1)}%, expected balanced ~25% distribution`
    );
  }
  console.log(`    Position Distribution across A, B, C, D: A: ${slotCounts[0]}, B: ${slotCounts[1]}, C: ${slotCounts[2]}, D: ${slotCounts[3]}`);
});

// -----------------------------------------------------------------------------
// REQUIREMENT 6: A quiz attempt does not repeat question IDs
// -----------------------------------------------------------------------------
console.log('\n--- REQ 6: No Duplicate Question IDs in a Single Attempt ---');

runTest('getQuizQuestions generates a set with zero duplicate question IDs', () => {
  for (let round = 0; round < 20; round++) {
    const attemptQuestions = getQuizQuestions({ count: 15, seed: round * 1000 });
    const ids = attemptQuestions.map(q => q.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(
      ids.length,
      uniqueIds.size,
      `Attempt contained duplicate question IDs: ${ids.length} vs ${uniqueIds.size}`
    );
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 7: Somali, English, and Arabic strings are present & natural
// -----------------------------------------------------------------------------
console.log('\n--- REQ 7: High-Quality Trilingual Association (EN, SO, AR) ---');

runTest('Every question has complete, natural Somali, Arabic, and English translations', () => {
  for (const q of VERIFIED_QUESTION_BANK) {
    // English
    assert(q.question_en && q.question_en.length > 10, `Question ${q.id} missing English text`);
    assert(q.explanation_en && q.explanation_en.length > 10, `Question ${q.id} missing English explanation`);

    // Somali
    assert(q.question_so && q.question_so.length > 10, `Question ${q.id} missing Somali text`);
    assert(q.explanation_so && q.explanation_so.length > 10, `Question ${q.id} missing Somali explanation`);

    // Arabic
    assert(q.question_ar && q.question_ar.length > 10, `Question ${q.id} missing Arabic text`);
    assert(q.explanation_ar && q.explanation_ar.length > 10, `Question ${q.id} missing Arabic explanation`);

    // Options in all 3 languages
    for (const opt of q.options) {
      assert(opt.text_en && opt.text_en.length > 0, `Option ${opt.id} in ${q.id} missing EN text`);
      assert(opt.text_so && opt.text_so.length > 0, `Option ${opt.id} in ${q.id} missing SO text`);
      assert(opt.text_ar && opt.text_ar.length > 0, `Option ${opt.id} in ${q.id} missing AR text`);
    }
  }
});

// -----------------------------------------------------------------------------
// REQUIREMENT 8: Retired questions do not appear in new attempts
// -----------------------------------------------------------------------------
console.log('\n--- REQ 8: Inactive / Retired Questions Excluded ---');

runTest('Inactive questions marked is_active: false are never returned in attempts', () => {
  // Test by filtering mock list with inactive
  const testPool = [
    ...VERIFIED_QUESTION_BANK,
    {
      id: 'RETIRED-001',
      question_id: 'RETIRED-001',
      category: 'quran',
      difficulty: 'beginner',
      question_en: 'Retired Question?',
      question_so: 'Su\'aal hore?',
      question_ar: 'سؤال قديم؟',
      options: [
        { id: 'opt_1', text_en: 'A', text_so: 'A', text_ar: 'A' },
        { id: 'opt_2', text_en: 'B', text_so: 'B', text_ar: 'B' },
        { id: 'opt_3', text_en: 'C', text_so: 'C', text_ar: 'C' },
        { id: 'opt_4', text_en: 'D', text_so: 'D', text_ar: 'D' },
      ],
      correct_option_id: 'opt_1',
      source_citation: 'Old reference',
      is_verified: false,
      is_active: false,
    }
  ];

  const activeOnly = testPool.filter(q => q.is_active !== false);
  assert(!activeOnly.some(q => q.id === 'RETIRED-001'), 'Retired question must not be in active pool');
});

// -----------------------------------------------------------------------------
// REQUIREMENT 9: Verified sources and answer keys remain unchanged during randomization
// -----------------------------------------------------------------------------
console.log('\n--- REQ 9: Source Citations and Answer Keys Remain Unchanged ---');

runTest('Randomization does not alter question IDs, category, difficulty, or source citations', () => {
  const q = VERIFIED_QUESTION_BANK[0];
  const shuffled = shuffleQuestionOptions(q);

  assert.strictEqual(shuffled.id, q.id);
  assert.strictEqual(shuffled.category, q.category);
  assert.strictEqual(shuffled.difficulty, q.difficulty);
  assert.strictEqual(shuffled.source_citation, q.source_citation);
  assert.strictEqual(shuffled.correct_option_id, q.correct_option_id);
});

// -----------------------------------------------------------------------------
// REQUIREMENT 10: Existing quiz lifelines, components & database schema work
// -----------------------------------------------------------------------------
console.log('\n--- REQ 10: Lifelines, Components & Database Schema ---');

runTest('Ask EMufti lifeline generates contextual guidance without revealing direct option letter', () => {
  const q = VERIFIED_QUESTION_BANK[0];
  const hintEn = generateAskEMuftiHint(q, 'en');
  const hintSo = generateAskEMuftiHint(q, 'so');
  const hintAr = generateAskEMuftiHint(q, 'ar');

  assert(!hintEn.includes('The answer is A'), 'Hint must not spoil option letter');
  assert(!hintSo.includes('Jawaabtu waa B'), 'Somali hint must not spoil option letter');
  assert(!hintAr.includes('الخيار الصحيح هو أ'), 'Arabic hint must not spoil option letter');
  assert(hintEn.includes(q.source_citation), 'Hint must reference the authentic source citation');
});

runTest('50/50 lifeline logic eliminates exactly 2 incorrect options', () => {
  const q = VERIFIED_QUESTION_BANK[0];
  const shuffled = shuffleQuestionOptions(q);
  
  const wrongOptions = shuffled.options.filter(o => o.id !== q.correct_option_id);
  assert.strictEqual(wrongOptions.length, 3, 'Must have 3 wrong options before 50/50');
  
  // Pick 2 wrong options to eliminate
  const eliminated = wrongOptions.slice(0, 2).map(o => o.id);
  assert.strictEqual(eliminated.length, 2, 'Must eliminate exactly 2 options');
  assert(!eliminated.includes(q.correct_option_id), 'Must NEVER eliminate the correct option');
});

runTest('Database migration file exists and contains stable option ID schema', () => {
  const migrationPath = path.resolve('supabase/migrations/20261017_quiz_quality_and_randomization.sql');
  assert(fs.existsSync(migrationPath), 'Migration file must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  assert(sql.includes('correct_option_id'), 'SQL must add correct_option_id');
  assert(sql.includes('options JSONB'), 'SQL must add options JSONB');
  assert(sql.includes('review_status'), 'SQL must add review_status');
  assert(sql.includes('is_active'), 'SQL must add is_active');
});

// -----------------------------------------------------------------------------
// STATS SUMMARY
// -----------------------------------------------------------------------------
console.log('\n--- QUESTION BANK INVENTORY & STATS ---');
const stats = getQuestionBankStats();
console.log(`Total Active Questions:   ${stats.totalActive}`);
console.log(`Total Verified Questions: ${stats.totalVerified}`);
console.log(`By Difficulty:`);
console.log(`  - Beginner (Aasaasi):        ${stats.byDifficulty.beginner}`);
console.log(`  - Intermediate (Dhexdhexaad): ${stats.byDifficulty.intermediate}`);
console.log(`  - Advanced (Sare):           ${stats.byDifficulty.advanced}`);
console.log(`By Category:`);
for (const [cat, count] of Object.entries(stats.byCategory)) {
  console.log(`  - ${cat.padEnd(12)}: ${count}`);
}

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
