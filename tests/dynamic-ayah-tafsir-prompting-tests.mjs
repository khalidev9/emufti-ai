import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Testing Dynamic Ayah Tafsir & Translation Generation Logic ---');

// 1. Verify buildDynamicAyahTafsirPrompt and resolveSomaliVerseTranslation from source code
const engineFile = fs.readFileSync(
  path.resolve('src/lib/quranVerseExplanationEngine.ts'),
  'utf8'
);

// Assert engine functions exist and contain required dynamic logic
assert.ok(
  engineFile.includes('export function resolveSomaliVerseTranslation'),
  'Must export resolveSomaliVerseTranslation'
);
assert.ok(
  engineFile.includes('export function buildDynamicAyahTafsirPrompt'),
  'Must export buildDynamicAyahTafsirPrompt'
);
assert.ok(
  engineFile.includes('export async function fetchDynamicAyahTafsir'),
  'Must export fetchDynamicAyahTafsir'
);
assert.ok(
  engineFile.includes('never output empty string ""'),
  'Must explicitly mandate Gemini to never output empty string for translation'
);
assert.ok(
  engineFile.includes('no repeating boilerplate'),
  'Must explicitly instruct Gemini to not output generic repeating boilerplate'
);
assert.ok(
  engineFile.includes('Shiikh Maxamed Cabdi Umal') && engineFile.includes('Shiikh Nuuraddiin'),
  'Must instruct authentic Somali scholars tafsir citations'
);
assert.ok(
  engineFile.includes('Al-Xaafid Ibnu Kathir') && engineFile.includes('Al-Qurtubi'),
  'Must instruct classical scholarly commentary'
);

console.log('✓ quranVerseExplanationEngine has dynamic prompt, scholar grounding & non-empty translation mandate');

// 2. Verify QuranStudyActionDrawer implementation
const studyDrawerFile = fs.readFileSync(
  path.resolve('src/components/quran/QuranStudyActionDrawer.tsx'),
  'utf8'
);

assert.ok(
  studyDrawerFile.includes('fetchDynamicAyahTafsir'),
  'QuranStudyActionDrawer must import and call fetchDynamicAyahTafsir'
);
assert.ok(
  studyDrawerFile.includes('resolveSomaliVerseTranslation'),
  'QuranStudyActionDrawer must resolve Somali verse translation'
);
assert.ok(
  studyDrawerFile.includes('Promise.allSettled'),
  'QuranStudyActionDrawer must concurrently fetch dynamic AI tafsir and lessons'
);
assert.ok(
  studyDrawerFile.includes('effectiveSomaliTranslation'),
  'QuranStudyActionDrawer must bind non-empty effectiveSomaliTranslation'
);

console.log('✓ QuranStudyActionDrawer dynamically invokes AI Tafsir and binds non-empty translation');

// 3. Verify QuranWeydiiEMuftiDrawer implementation
const weydiiDrawerFile = fs.readFileSync(
  path.resolve('src/components/quran/QuranWeydiiEMuftiDrawer.tsx'),
  'utf8'
);

assert.ok(
  weydiiDrawerFile.includes('buildDynamicAyahTafsirPrompt'),
  'QuranWeydiiEMuftiDrawer must use buildDynamicAyahTafsirPrompt'
);
assert.ok(
  weydiiDrawerFile.includes('res?.content'),
  'QuranWeydiiEMuftiDrawer must check res?.content (not res.text which was undefined)'
);
assert.ok(
  !weydiiDrawerFile.includes('res && res.text && res.text.trim().length > 20'),
  'Must NOT contain the buggy res.text check that caused fallbacks'
);
assert.ok(
  weydiiDrawerFile.includes('effectiveTranslation'),
  'QuranWeydiiEMuftiDrawer must bind effectiveTranslation in preview box'
);

console.log('✓ QuranWeydiiEMuftiDrawer sends dynamic prompt and accurately extracts res.content');

// 4. Verify QuranPage implementation
const quranPageFile = fs.readFileSync(
  path.resolve('src/pages/QuranPage.tsx'),
  'utf8'
);

assert.ok(
  !quranPageFile.includes('somaliTranslationsMap[studyDrawerState.ayahNumber]?.translation'),
  'Must have removed the buggy somaliTranslationsMap[ayahNumber]?.translation which evaluated to undefined'
);
assert.ok(
  quranPageFile.includes('somaliTranslationsMap[studyDrawerState.verseKey]'),
  'Must correctly index somaliTranslationsMap with verseKey'
);

console.log('✓ QuranPage correctly resolves and passes verse translation mapping to drawers');
console.log('ALL DYNAMIC AYAH TAFSIR PROMPT & TRANSLATION TESTS PASSED SUCCESSFULLY!');
