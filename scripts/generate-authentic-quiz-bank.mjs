import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import the existing 47 verified questions to preserve them completely
const existingJsonPath = path.join(rootDir, 'src', 'data', 'quizQuestions.json');
const existingQuestions = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));

console.log(`Starting with ${existingQuestions.length} existing verified questions.`);

// Define categories
const CATEGORIES = [
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

console.log('Categories defined:', CATEGORIES.length);
