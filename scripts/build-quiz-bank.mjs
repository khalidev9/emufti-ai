import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import the validator to verify every single question before saving
import { validateQuestionBank } from './validate-quiz-bank.mjs';

console.log('Building authentic Islamic Quiz Bank across all 15 categories...');
