import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tsPath = path.join(rootDir, 'src', 'data', 'quizQuestions.ts');
const content = fs.readFileSync(tsPath, 'utf8');

// 1. Add import rawQuestions if missing
let updated = content;
if (!updated.includes("import rawQuestions from './quizQuestions.json';")) {
  updated = updated.replace(
    "import type { QuizCategory, QuizDifficulty, QuizOption, QuizQuestion, ShuffledQuizQuestion, QuizCategoryMeta } from '../types/database.ts';",
    "import type { QuizCategory, QuizDifficulty, QuizOption, QuizQuestion, ShuffledQuizQuestion, QuizCategoryMeta } from '../types/database.ts';\nimport rawQuestions from './quizQuestions.json';"
  );
}

// 2. Replace the massive VERIFIED_QUESTION_BANK array definition with the json map
const startMarker = "export const VERIFIED_QUESTION_BANK: QuizQuestion[] = [";
const endMarker = "export const TOTAL_VERIFIED_QUESTIONS = VERIFIED_QUESTION_BANK";

const startIndex = updated.indexOf(startMarker);
const endIndex = updated.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `export const VERIFIED_QUESTION_BANK: QuizQuestion[] = (rawQuestions as unknown as QuizQuestion[]).map(q => ({
  ...q,
  options_en: q.options.map(o => o.text_en) as [string, string, string, string],
  options_so: q.options.map(o => o.text_so) as [string, string, string, string],
  options_ar: (q.options.map(o => o.text_ar || o.text_en)) as [string, string, string, string],
  correct_index: q.options.findIndex(o => o.id === q.correct_option_id),
}));\n\n`;

  updated = updated.substring(0, startIndex) + replacement + updated.substring(endIndex);
  fs.writeFileSync(tsPath, updated, 'utf8');
  console.log('Successfully updated src/data/quizQuestions.ts to dynamically load 2,000 questions from quizQuestions.json!');
} else {
  console.error('Could not find markers to update quizQuestions.ts');
  process.exit(1);
}
