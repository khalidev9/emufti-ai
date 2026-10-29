// ==============================================================================
// TEST SUITE: Quran Page Khatma Banner Relocation Verification
// Verifies that QuranHeroExplorer renders QuranKhatmChallengeWidget above the search bar
// ==============================================================================

import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- STARTING QURAN PAGE KHATMA RELOCATION TESTS ---\n');

const explorerPath = 'src/components/quran/QuranHeroExplorer.tsx';
assert.ok(fs.existsSync(explorerPath), 'QuranHeroExplorer.tsx must exist');

const content = fs.readFileSync(explorerPath, 'utf8');

// 1. Verify import of QuranKhatmChallengeWidget
assert.ok(content.includes('QuranKhatmChallengeWidget'), 'QuranHeroExplorer must import QuranKhatmChallengeWidget');
console.log('✓ QuranHeroExplorer imports QuranKhatmChallengeWidget.');

// 2. Verify placement above search bar
const khatmIdx = content.indexOf('<QuranKhatmChallengeWidget');
const searchIdx = content.indexOf('data-tour="quran-search"');
assert.ok(khatmIdx !== -1, 'QuranKhatmChallengeWidget must be rendered in JSX');
assert.ok(searchIdx !== -1, 'Quran search bar must exist in JSX');
assert.ok(khatmIdx < searchIdx, 'QuranKhatmChallengeWidget must be placed ABOVE the search bar (red-box area in image_09c7fe.png)');
console.log('✓ QuranKhatmChallengeWidget is positioned precisely above the search bar in the explorer area.');

// 3. Verify max-w-5xl responsiveness
assert.ok(content.includes('max-w-5xl'), 'Explorer container must use max-w-5xl for smooth responsiveness');
console.log('✓ Explorer container configured with smooth responsive max-w-5xl width.');

// 4. Verify auth context integration for user name
assert.ok(content.includes('useAuth'), 'Must use useAuth for user name and profile');
console.log('✓ Auth context integrated for personalized user progress.');

console.log('\n--- ALL QURAN PAGE KHATMA RELOCATION TESTS PASSED! (4/4) ---');
