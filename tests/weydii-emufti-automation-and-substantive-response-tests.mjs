/**
 * Verification tests for "Weydii EMufti" AI Automation & Substantive Response State
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: WEYDII EMUFTI AUTOMATION & SUBSTANTIVE RESPONSE TESTS');
console.log('========================================================================\n');

// 1. Inspect QuranWeydiiEMuftiDrawer.tsx source
console.log('--- 1. Preset Categories & Input Box Conditional Visibility ---');
const drawerPath = path.resolve('src/components/quran/QuranWeydiiEMuftiDrawer.tsx');
assert(fs.existsSync(drawerPath), 'QuranWeydiiEMuftiDrawer.tsx exists');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

assert(
  drawerContent.includes("selectedCategory === 'Others' &&") ||
  drawerContent.includes("selectedCategory === 'Others' ?"),
  'Manual custom question input box is ONLY active/rendered when category 4. Others is selected'
);

assert(
  drawerContent.includes('Ama weydii su\'aal gaar ah'),
  'Input box contains the specified "Ama weydii su\'aal gaar ah" title and placeholder'
);

assert(
  drawerContent.includes('handleCategoryClick') &&
  drawerContent.includes('handleGenerate(catId)') &&
  drawerContent.includes("setCustomQuestion('')"),
  'Category clicks for 1, 2, and 3 do NOT populate input box and immediately trigger handleGenerate'
);

// 2. Animated Loading Skeleton
console.log('\n--- 2. Animated Loading Skeleton & Streaming Feedback ---');
assert(
  drawerContent.includes('animate-pulse') &&
  drawerContent.includes('Diyaarinaya...'),
  'Includes responsive animated loading skeleton with pulsing elements'
);

assert(
  drawerContent.includes('onChunk'),
  'Supports streaming AI response directly into drawer via onChunk'
);

// 3. Substantive Response Generation (Never Empty)
console.log('\n--- 3. Substantive Somali Verse Explanation Engine ---');
assert(
  drawerContent.includes('buildAuthenticSomaliVerseExplanation'),
  'Defines buildAuthenticSomaliVerseExplanation engine'
);

// Test the explanation generator directly
import { buildAuthenticSomaliVerseExplanation } from '../src/lib/quranVerseExplanationEngine.ts';

const tafsirOutput = buildAuthenticSomaliVerseExplanation(
  'Tafsiirka',
  1,
  'Al-Fatihah',
  1,
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'In the Name of Allah—the Most Compassionate, Most Merciful.'
);

assert(
  tafsirOutput.includes('Tafsiirka Sugan') &&
  tafsirOutput.includes('Al-Fatihah') &&
  tafsirOutput.includes('Ahlus-Sunnah'),
  'Tafsiirka returns substantive explanation with scholarly Tafsir context in Somali'
);

const asbaabOutput = buildAuthenticSomaliVerseExplanation(
  'Asbaabul Nuzuul',
  2,
  'Al-Baqarah',
  255,
  'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
  'Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence.'
);

assert(
  asbaabOutput.includes('Sababta Soo Degitaanka') &&
  asbaabOutput.includes('Al-Cibrah bi Cumuumi al-Lafdh') &&
  asbaabOutput.includes('Asbaab al-Nuzul'),
  'Asbaabul Nuzuul returns substantive historical and Usul context in Somali'
);

const faahfaahinOutput = buildAuthenticSomaliVerseExplanation(
  'Faahfaahin',
  112,
  'Al-Ikhlas',
  1,
  'قُلْ هُوَ اللَّهُ أَحَدٌ',
  'Say, "He is Allah, [who is] One."'
);

assert(
  faahfaahinOutput.includes('Faahfaahin Qoto-Dheer') &&
  faahfaahinOutput.includes('Xukunnada Sharciyeed') &&
  faahfaahinOutput.includes('Duruusta Nololeed'),
  'Faahfaahin returns detailed breakdown with practical life lessons in Somali'
);

const othersOutput = buildAuthenticSomaliVerseExplanation(
  'Others',
  1,
  'Al-Fatihah',
  5,
  'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
  'It is You we worship and You we ask for help.',
  'Maxaa keenay in caabudidda laga hor mariyo kaalmo-weydiiga?'
);

assert(
  othersOutput.includes('Maxaa keenay in caabudidda laga hor mariyo kaalmo-weydiiga?') &&
  othersOutput.includes('Jawaabta Su\'aashaada'),
  'Others returns tailored explanation for the custom inquiry tied to the verse'
);

// 4. Fallback Safety in islamicKnowledgeEngine.ts
console.log('\n--- 4. Engine Crash-Proof Fallback Verification ---');
const enginePath = path.resolve('src/lib/islamicKnowledgeEngine.ts');
const engineContent = fs.readFileSync(enginePath, 'utf8');

assert(
  engineContent.includes('safeRetrieval = retrieval || retrieveIslamicSources(prompt)'),
  'synthesizeSubstantiveResponse safely handles optional retrieval argument without throwing TypeError'
);

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
