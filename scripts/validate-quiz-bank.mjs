import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const VALID_CATEGORIES = new Set([
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
  // Legacy aliases
  'history',
  'akhlaaq',
  'manners',
]);

const VALID_DIFFICULTIES = new Set([
  'beginner',
  'intermediate',
  'advanced',
  'easy',
  'medium',
  'hard',
]);

export function validateQuestionBank(questions) {
  const errors = [];
  const seenIds = new Set();
  const seenQuestions = new Set();
  const categoryCounts = {};
  const difficultyCounts = {};

  questions.forEach((q, index) => {
    const qIndex = `Question #${index + 1} (${q.question_id || q.id || 'NO_ID'})`;

    // 1. Stable Unique ID Check
    const qId = q.question_id || q.id;
    if (!qId) {
      errors.push(`${qIndex}: Missing question_id or id.`);
    } else if (seenIds.has(qId)) {
      errors.push(`${qIndex}: Duplicate question ID "${qId}".`);
    } else {
      seenIds.add(qId);
    }

    // 2. Question Text & Duplication Check
    if (!q.question_en || q.question_en.trim().length < 10) {
      errors.push(`${qIndex}: Missing or too short question_en.`);
    }
    if (!q.question_so || q.question_so.trim().length < 10) {
      errors.push(`${qIndex}: Missing or too short question_so.`);
    }

    const normEn = (q.question_en || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenQuestions.has(normEn)) {
      errors.push(`${qIndex}: Duplicate question content: "${q.question_en}".`);
    } else if (normEn) {
      seenQuestions.add(normEn);
    }

    // 3. Category Validation
    if (!VALID_CATEGORIES.has(q.category)) {
      errors.push(`${qIndex}: Invalid category "${q.category}".`);
    } else {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    }

    // 4. Difficulty Validation
    if (!VALID_DIFFICULTIES.has(q.difficulty)) {
      errors.push(`${qIndex}: Invalid difficulty "${q.difficulty}".`);
    } else {
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
    }

    // 5. Exactly 4 Options Check
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${qIndex}: Must have exactly 4 options, found ${q.options?.length || 0}.`);
    } else {
      const optionIds = new Set();
      const optionTextsEn = new Set();

      q.options.forEach((opt, optIdx) => {
        if (!opt.id) {
          errors.push(`${qIndex} Option ${optIdx}: Missing option id.`);
        } else if (optionIds.has(opt.id)) {
          errors.push(`${qIndex}: Duplicate option id "${opt.id}".`);
        } else {
          optionIds.add(opt.id);
        }

        if (!opt.text_en || !opt.text_so) {
          errors.push(`${qIndex} Option ${optIdx}: Missing text_en or text_so.`);
        }

        const normOpt = (opt.text_en || '').toLowerCase().trim();
        if (optionTextsEn.has(normOpt)) {
          errors.push(`${qIndex}: Duplicate option text "${opt.text_en}".`);
        } else if (normOpt) {
          optionTextsEn.add(normOpt);
        }
      });

      // 6. Valid Answer Key Check
      if (!q.correct_option_id) {
        errors.push(`${qIndex}: Missing correct_option_id.`);
      } else if (!optionIds.has(q.correct_option_id)) {
        errors.push(`${qIndex}: correct_option_id "${q.correct_option_id}" does not exist in options.`);
      }
    }

    // 7. Explanation & Source Reference Check
    if (!q.explanation_en && !q.explanation_so) {
      errors.push(`${qIndex}: Missing explanation in both English and Somali.`);
    }
    if (!q.source_citation || q.source_citation.trim().length < 3) {
      errors.push(`${qIndex}: Missing or invalid source_citation.`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalQuestions: questions.length,
    uniqueIdsCount: seenIds.size,
    errors,
    categoryCounts,
    difficultyCounts,
  };
}

async function main() {
  console.log('\n========================================================================');
  console.log('EMUFTI AI — ISLAMIC QUIZ QUESTION BANK VALIDATOR');
  console.log('========================================================================\n');

  try {
    const questionsModule = await import('../src/data/quizQuestions.ts');
    const questions = questionsModule.VERIFIED_QUESTION_BANK || questionsModule.QUESTION_BANK || [];

    const result = validateQuestionBank(questions);

    console.log(`Total Questions Analyzed: ${result.totalQuestions}`);
    console.log(`Unique Question IDs:     ${result.uniqueIdsCount}`);
    console.log('\nBreakdown by Category:');
    for (const [cat, count] of Object.entries(result.categoryCounts)) {
      console.log(`  - ${cat.padEnd(24)}: ${count}`);
    }

    console.log('\nBreakdown by Difficulty:');
    for (const [diff, count] of Object.entries(result.difficultyCounts)) {
      console.log(`  - ${diff.padEnd(16)}: ${count}`);
    }

    if (result.isValid) {
      console.log('\n✓ ALL QUESTIONS ARE 100% VALID! ZERO ERRORS OR DUPLICATES FOUND.\n');
      process.exit(0);
    } else {
      console.error(`\n✗ FOUND ${result.errors.length} VALIDATION ERRORS:`);
      result.errors.forEach((err) => console.error(`  - ${err}`));
      console.log('');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal validation runner error:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
