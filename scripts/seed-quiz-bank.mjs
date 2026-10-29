import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateQuestionBank } from './validate-quiz-bank.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function seed() {
  console.log('\n========================================================================');
  console.log('EMUFTI AI — REPEATABLE QUIZ BANK SEED & IMPORT PIPELINE');
  console.log('========================================================================\n');

  const questionsModule = await import('../src/data/quizQuestions.ts');
  const questions = questionsModule.VERIFIED_QUESTION_BANK || [];

  // 1. Validation check
  const valResult = validateQuestionBank(questions);
  if (!valResult.isValid) {
    console.error('Validation errors encountered during seed preparation:', valResult.errors);
    process.exit(1);
  }

  console.log(`Validated ${questions.length} authentic Islamic knowledge questions.`);

  // 2. Generate idempotent SQL Seed File
  const sqlStatements = [
    '--',
    '-- EMufti AI - Authentic Islamic Quiz Questions Seed File',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total Validated Questions: ${questions.length}`,
    '--',
    'BEGIN;',
    '',
  ];

  for (const q of questions) {
    const esc = (txt) => (txt || '').replace(/'/g, "''");
    const optionsJson = esc(JSON.stringify(q.options));
    const explanationEn = esc(q.explanation_en || '');
    const explanationSo = esc(q.explanation_so || '');
    const explanationAr = esc(q.explanation_ar || '');
    const citation = esc(q.source_citation || 'Verified Islamic Source');

    sqlStatements.push(`
INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  '${esc(q.question_id)}',
  '${esc(q.category)}',
  '${esc(q.difficulty)}',
  '${esc(q.question_en)}',
  '${esc(q.question_so)}',
  '${esc(q.question_ar || '')}',
  '${optionsJson}'::jsonb,
  '${esc(q.correct_option_id)}',
  '${explanationEn}',
  '${explanationSo}',
  '${explanationAr}',
  '${citation}',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());
`);
  }

  sqlStatements.push('COMMIT;');

  const seedFilePath = path.join(rootDir, 'supabase', 'seed_quiz_questions.sql');
  fs.writeFileSync(seedFilePath, sqlStatements.join('\n'), 'utf8');

  console.log(`✓ Idempotent seed script generated at: ${seedFilePath}`);
  console.log(`✓ Total questions ready for database seed / import: ${questions.length}`);
  console.log('\n========================================================================\n');
}

seed().catch((err) => {
  console.error('Fatal seed script error:', err);
  process.exit(1);
});
