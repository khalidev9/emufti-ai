import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- TESTING SURAH-SPECIFIC MAJOR THEMES (MAWDUUCYADA WAAWAYN) ---');

// 1. Read and parse surahOverviewData.ts
const overviewFilePath = path.join(__dirname, '../src/data/surahOverviewData.ts');
assert.ok(fs.existsSync(overviewFilePath), 'src/data/surahOverviewData.ts must exist');

const overviewContent = fs.readFileSync(overviewFilePath, 'utf8');

// Ensure SURAH_OVERVIEWS contains all 114 Surahs
const surahBlockMatches = overviewContent.match(/^\s*(\d+):\s*\{/gm);
assert.ok(surahBlockMatches, 'Must match Surah blocks');
assert.strictEqual(
  surahBlockMatches.length,
  114,
  `SURAH_OVERVIEWS must contain all 114 Surahs, found ${surahBlockMatches.length}`
);
console.log('✓ Check 1: SURAH_OVERVIEWS contains all 114 Surahs.');

// 2. Load compiled or parsed data to test all 114 Surahs dynamically
const metaFilePath = path.join(__dirname, '../src/data/quranMetadata.ts');
const metaContent = fs.readFileSync(metaFilePath, 'utf8');
const matchAllSurahs = metaContent.match(/export const ALL_114_SURAHS: Surah\[\] = (\[[\s\S]*?\]);/);
assert.ok(matchAllSurahs, 'ALL_114_SURAHS must be parseable');
const allSurahs = eval(matchAllSurahs[1]);
assert.strictEqual(allSurahs.length, 114, 'ALL_114_SURAHS must have 114 elements');

// Extract the SURAH_OVERVIEWS object using eval in node
const overviewsMatch = overviewContent.match(/export const SURAH_OVERVIEWS: Record<number, SurahOverview> = (\{[\s\S]*?\n\};)/);
assert.ok(overviewsMatch, 'Must match SURAH_OVERVIEWS object literal');
const surahOverviews = eval(`(${overviewsMatch[1].replace(/;\s*$/, '')})`);

assert.strictEqual(Object.keys(surahOverviews).length, 114, 'Parsed SURAH_OVERVIEWS must have 114 keys');
console.log('✓ Check 2: Parsed SURAH_OVERVIEWS successfully with 114 entries.');

// 3. Verify each Surah has unique, non-empty, authentic themes and metadata
const allSomaliThemeSets = new Map();
const allEnglishThemeSets = new Map();
const genericPlaceholderSo = 'Awoodda iyo Kalinimada Eebbe ee abuurka koonka';

for (let id = 1; id <= 114; id++) {
  const surah = surahOverviews[id];
  assert.ok(surah, `Surah ${id} must exist in SURAH_OVERVIEWS`);
  assert.strictEqual(surah.surahNumber, id, `Surah ${id} must have surahNumber: ${id}`);
  
  // Verify themes array
  assert.ok(Array.isArray(surah.mainThemesSomali), `Surah ${id} mainThemesSomali must be an array`);
  assert.ok(Array.isArray(surah.mainThemesEnglish), `Surah ${id} mainThemesEnglish must be an array`);
  assert.ok(surah.mainThemesSomali.length >= 3, `Surah ${id} must have at least 3 Somali themes, got ${surah.mainThemesSomali.length}`);
  assert.ok(surah.mainThemesEnglish.length >= 3, `Surah ${id} must have at least 3 English themes, got ${surah.mainThemesEnglish.length}`);

  // Verify it does NOT contain the old generic repeating placeholder
  const hasGenericPlaceholder = surah.mainThemesSomali.includes(genericPlaceholderSo);
  assert.ok(
    !hasGenericPlaceholder,
    `Surah ${id} must not contain generic repeating placeholder "${genericPlaceholderSo}"`
  );

  // Verify non-empty strings
  for (const t of surah.mainThemesSomali) {
    assert.ok(typeof t === 'string' && t.trim().length > 10, `Surah ${id} theme must be a descriptive string: ${t}`);
  }
  for (const t of surah.mainThemesEnglish) {
    assert.ok(typeof t === 'string' && t.trim().length > 10, `Surah ${id} English theme must be descriptive: ${t}`);
  }

  // Check uniqueness across Surahs
  const soKey = surah.mainThemesSomali.join(' || ');
  const enKey = surah.mainThemesEnglish.join(' || ');

  if (allSomaliThemeSets.has(soKey)) {
    assert.fail(`Surah ${id} shares identical Somali themes with Surah ${allSomaliThemeSets.get(soKey)}`);
  }
  allSomaliThemeSets.set(soKey, id);

  if (allEnglishThemeSets.has(enKey)) {
    assert.fail(`Surah ${id} shares identical English themes with Surah ${allEnglishThemeSets.get(enKey)}`);
  }
  allEnglishThemeSets.set(enKey, id);

  // Check naming reason
  assert.ok(surah.namingReasonSomali && surah.namingReasonSomali.trim().length > 15, `Surah ${id} namingReasonSomali must be descriptive`);
  assert.ok(surah.namingReasonEnglish && surah.namingReasonEnglish.trim().length > 15, `Surah ${id} namingReasonEnglish must be descriptive`);

  // Check about
  assert.ok(surah.aboutSomali && surah.aboutSomali.trim().length > 20, `Surah ${id} aboutSomali must be descriptive`);
  assert.ok(surah.aboutEnglish && surah.aboutEnglish.trim().length > 20, `Surah ${id} aboutEnglish must be descriptive`);

  // Check virtues
  assert.ok(Array.isArray(surah.virtuesSomali) && surah.virtuesSomali.length >= 1, `Surah ${id} must have at least 1 Somali virtue`);
  assert.ok(Array.isArray(surah.virtuesEnglish) && surah.virtuesEnglish.length >= 1, `Surah ${id} must have at least 1 English virtue`);
}

console.log('✓ Check 3: Every Surah from 1 to 114 has authentic, distinct, and non-repeating Somali & English themes (114 unique sets).');

// 4. Test specific known Surahs (Al-Fatihah, Al-Baqarah, An-Nisa, Al-Kahf, Ya-Sin, Al-Mulk, Al-Ikhlas)
assert.ok(
  surahOverviews[1].mainThemesSomali.some(t => t.includes('Alxamdullillaah') || t.includes('Tawxiidka')),
  'Surah 1 Al-Fatihah themes match'
);
assert.ok(
  surahOverviews[2].mainThemesSomali.some(t => t.includes('Ramadaan') || t.includes('Ribada') || t.includes('Aadan') || t.includes('Guurka')),
  'Surah 2 Al-Baqarah themes match Ramadaan, Ribada, Aadan, or Guurka'
);
assert.ok(
  surahOverviews[4].mainThemesSomali.some(t => t.includes('haweenka') || t.includes('dhaxalka') || t.includes('agoonta')),
  'Surah 4 An-Nisa themes match women, orphans, inheritance'
);
assert.ok(
  surahOverviews[18].mainThemesSomali.some(t => t.includes('godka') || t.includes('Kahf') || t.includes('Khidr') || t.includes('Dul-Qarnayn')),
  'Surah 18 Al-Kahf themes match Cave, Khidr, Dhul-Qarnayn'
);
assert.ok(
  surahOverviews[112].mainThemesSomali.some(t => t.includes('Samad') || t.includes('Ahad') || t.includes('Kow')),
  'Surah 112 Al-Ikhlas themes match monotheism'
);
console.log('✓ Check 4: Specific milestone Surahs (1, 2, 4, 18, 112) contain verified contextual themes.');

// 5. Verify UI component binding in SurahInfoModal.tsx
const modalFilePath = path.join(__dirname, '../src/components/quran/SurahInfoModal.tsx');
assert.ok(fs.existsSync(modalFilePath), 'src/components/quran/SurahInfoModal.tsx must exist');
const modalContent = fs.readFileSync(modalFilePath, 'utf8');

assert.ok(
  modalContent.includes('getSurahOverview(chapter.id, ALL_114_SURAHS)'),
  'SurahInfoModal must dynamically pass chapter.id to getSurahOverview'
);
assert.ok(
  modalContent.includes('activeSection === \'themes\''),
  'SurahInfoModal must have the themes section'
);
assert.ok(
  modalContent.includes('overview.mainThemesSomali'),
  'SurahInfoModal must bind overview.mainThemesSomali'
);
assert.ok(
  modalContent.includes('overview.mainThemesEnglish'),
  'SurahInfoModal must bind overview.mainThemesEnglish'
);
console.log('✓ Check 5: SurahInfoModal.tsx is cleanly bound to dynamic chapter.id and renders unique themes.');

console.log('\nALL TESTS PASSED! (5/5 checks passed cleanly)');
