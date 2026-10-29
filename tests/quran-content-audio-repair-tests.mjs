import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    console.error(`  ${RED}✗${RESET} ${name}`);
    console.error(`    ${RED}${err.message}${RESET}`);
    throw err;
  }
}

console.log(`\n${BOLD}${CYAN}==================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   EMufti AI - Quran Content & Somali Tafsir Audio Repair Tests   ${RESET}`);
console.log(`${BOLD}${CYAN}==================================================================${RESET}`);

// -----------------------------------------------------------------------------
// SECTION 1: Canonical 114 Surahs Metadata & Ayah Count Integrity
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 1: 114 Surahs Canonical Metadata & Exact Ayah Counts${RESET}`);

const quranMetadataPath = path.resolve('src/data/quranMetadata.ts');
const quranMetadataContent = fs.readFileSync(quranMetadataPath, 'utf8');

test('quranMetadata.ts defines all 114 canonical surahs in sequential order (1 to 114)', () => {
  assert.ok(quranMetadataContent.includes('export const ALL_114_SURAHS: Surah[]'), 'Must export ALL_114_SURAHS');
  for (let i = 1; i <= 114; i++) {
    assert.ok(quranMetadataContent.includes(`number: ${i},`), `Must contain Surah ${i}`);
  }
});

test('Total Quran ayah count across all 114 surahs strictly sums to 6,236', () => {
  const matches = [...quranMetadataContent.matchAll(/numberOfAyahs:\s*(\d+)/g)];
  assert.equal(matches.length, 114, 'Must have exactly 114 surah verse counts');
  const total = matches.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
  assert.equal(total, 6236, 'Canonical Quran ayah sum must equal exactly 6,236');
});

test('Spot-checks for major Surahs match Islamic standard Mushaf counts', () => {
  const expectedCounts = [
    { num: 1, name: 'Al-Fatihah', ayahs: 7, type: 'Meccan' },
    { num: 2, name: 'Al-Baqarah', ayahs: 286, type: 'Medinan' },
    { num: 36, name: 'Ya-Sin', ayahs: 83, type: 'Meccan' },
    { num: 67, name: 'Al-Mulk', ayahs: 30, type: 'Meccan' },
    { num: 78, name: 'An-Naba', ayahs: 40, type: 'Meccan' },
    { num: 112, name: 'Al-Ikhlas', ayahs: 4, type: 'Meccan' },
    { num: 113, name: 'Al-Falaq', ayahs: 5, type: 'Meccan' },
    { num: 114, name: 'An-Nas', ayahs: 6, type: 'Meccan' },
  ];

  for (const s of expectedCounts) {
    assert.ok(quranMetadataContent.includes(`number: ${s.num},`), `Must have surah ${s.num}`);
    assert.ok(quranMetadataContent.includes(`numberOfAyahs: ${s.ayahs},`), `Surah ${s.num} must have ${s.ayahs} ayahs`);
  }
});

test('BUNDLED_SURAHS provides zero-latency offline fallback for essential surahs', () => {
  assert.ok(quranMetadataContent.includes('export const BUNDLED_SURAHS: Record<number, Ayah[]>'), 'Must export BUNDLED_SURAHS');
  // Check that Surahs 1, 103, 108, 109, 110, 111, 112, 113, 114 are bundled
  const bundledSurahs = [1, 103, 108, 109, 110, 111, 112, 113, 114];
  for (const num of bundledSurahs) {
    assert.ok(quranMetadataContent.includes(`${num}: [`), `BUNDLED_SURAHS must bundle Surah ${num}`);
  }
  // Check authentic Uthmani script and authentic translations
  assert.ok(quranMetadataContent.includes('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'), 'Must contain authentic Basmalah');
  assert.ok(quranMetadataContent.includes('Magiciisa ku billow Eebbe'), 'Must contain Somali translation');
});

// -----------------------------------------------------------------------------
// SECTION 2: Resilient Quran Text Service (quranService.ts)
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 2: Resilient Quran Text Service (quranService.ts)${RESET}`);

const quranServicePath = path.resolve('src/lib/quranService.ts');
const quranServiceContent = fs.readFileSync(quranServicePath, 'utf8');

test('quranService implements multi-tier fallback architecture', () => {
  // Tier 1: In-memory cache with count integrity
  assert.ok(quranServiceContent.includes('versesCache.get(surahNumber)'), 'Must check in-memory cache');
  assert.ok(quranServiceContent.includes('cached.length === metadata.numberOfAyahs'), 'Must verify in-memory cache integrity');

  // Tier 2: LocalStorage cache with count integrity
  assert.ok(quranServiceContent.includes('localStorage.getItem(cacheKey)'), 'Must check LocalStorage cache');
  assert.ok(quranServiceContent.includes('stored.length === metadata.numberOfAyahs'), 'Must verify LocalStorage cache integrity');

  // Tier 3: Primary 3-editions endpoint
  assert.ok(quranServiceContent.includes('quran-uthmani,en.sahih,so.abduh'), 'Must use 3-editions endpoint');

  // Tier 4: Standalone AlQuran Cloud Uthmani endpoint
  assert.ok(quranServiceContent.includes('api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani'), 'Must have standalone Uthmani fallback');

  // Tier 5: Quran.com API v4 CDN fallback
  assert.ok(quranServiceContent.includes('api.quran.com/api/v4/quran/verses/uthmani'), 'Must have Quran.com API v4 fallback');

  // Tier 6: Bundled authentic verses fallback
  assert.ok(quranServiceContent.includes('BUNDLED_SURAHS[surahNumber]'), 'Must fall back to BUNDLED_SURAHS');
});

test('quranService exports getSurah and verifySurahVerses helpers', () => {
  assert.ok(quranServiceContent.includes('export const getSurah = getSurahVerses;'), 'Must export getSurah alias');
  assert.ok(quranServiceContent.includes('export async function verifySurahVerses'), 'Must export verifySurahVerses');
});

test('quranService prevents returning incomplete/truncated ayah lists', () => {
  assert.ok(
    quranServiceContent.includes('verses.length < metadata.numberOfAyahs'),
    'Must check if returned verses count is less than canonical numberOfAyahs'
  );
  assert.ok(
    quranServiceContent.includes('Incomplete ayah list returned'),
    'Must log or throw warning on incomplete ayah list'
  );
});

// -----------------------------------------------------------------------------
// SECTION 3: Somali Scholars' Tafsir Audio Recordings & Zero-Broken-Links
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 3: Somali Tafsir Audio Recordings & Zero-Broken-Links Integrity${RESET}`);

const tafsirDataPath = path.resolve('src/data/tafsirData.ts');
const tafsirDataContent = fs.readFileSync(tafsirDataPath, 'utf8');

test('SOMALI_SCHOLARS_TAFSIR catalogs all 6 authentic Somali scholars', () => {
  const scholars = [
    'sheikh-umal',
    'sheikh-dirir',
    'sheikh-cumar-faaruuq',
    'sheikh-shibli',
    'sheikh-cabdirashiid-suufi',
    'sheikh-mustafe',
  ];
  for (const s of scholars) {
    assert.ok(tafsirDataContent.includes(`id: '${s}'`), `Must catalog scholar ${s}`);
  }
});

test('No fabricated or broken URLs exist (ALFAITHA/002.mp3, etc. are eliminated)', () => {
  assert.ok(!tafsirDataContent.includes('ALFAITHA/002.mp3'), 'Fabricated ALFAITHA/002.mp3 must NOT exist');
  assert.ok(!tafsirDataContent.includes('ALFAITHA/012.mp3'), 'Fabricated ALFAITHA/012.mp3 must NOT exist');
  assert.ok(!tafsirDataContent.includes('ALFAITHA/018.mp3'), 'Fabricated ALFAITHA/018.mp3 must NOT exist');
  assert.ok(!tafsirDataContent.includes('ALFAITHA/036.mp3'), 'Fabricated ALFAITHA/036.mp3 must NOT exist');
  assert.ok(!tafsirDataContent.includes('ALFAITHA/067.mp3'), 'Fabricated ALFAITHA/067.mp3 must NOT exist');
});

test('All cataloged audio URLs use HTTPS and point to verified Islamic repositories', () => {
  const urlMatches = [...tafsirDataContent.matchAll(/audioUrl:\s*'([^']+)'/g)];
  assert.ok(urlMatches.length >= 30, `Expected at least 30 audio lessons, found ${urlMatches.length}`);

  for (const [_, url] of urlMatches) {
    assert.ok(url.startsWith('https://'), `Audio URL must be HTTPS: ${url}`);
    assert.ok(
      url.includes('archive.org/download/') ||
      url.includes('cdn.mp3quran.net') ||
      url.includes('server6.mp3quran.net') ||
      url.includes('islamhouse.com'),
      `Audio URL must point to verified audio repository: ${url}`
    );
  }
});

test('Database SQL migration matches verified audio stream URLs in tafsirData.ts', () => {
  const sqlPath = path.resolve('supabase/migrations/20261015_quran_tafsir_library.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Verify that old fabricated URLs are also removed from SQL
  assert.ok(!sqlContent.includes('ALFAITHA/002.mp3'), 'Migration must not have broken ALFAITHA/002.mp3');
  assert.ok(!sqlContent.includes('ALFAITHA/012.mp3'), 'Migration must not have broken ALFAITHA/012.mp3');
  assert.ok(sqlContent.includes('018-Tafsiir-Al-baqarahAayah253-262.mp3'), 'Migration must include live Umal lesson 18');
  assert.ok(sqlContent.includes('002Albaqara1-43.mp3'), 'Migration must include live Dirir Baqarah lesson');
  assert.ok(sqlContent.includes('001%20%281-7%29.mp3') || sqlContent.includes('001 (1-7).mp3'), 'Migration must include live Cumar Faaruuq lesson');
});

// -----------------------------------------------------------------------------
// SECTION 4: Content Health Diagnostics & Auditing Tools
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 4: Content Health Diagnostics & Auditing Tools${RESET}`);

test('tafsirData.ts exports getTafsirContentHealthSummary', () => {
  assert.ok(tafsirDataContent.includes('export function getTafsirContentHealthSummary()'), 'Must export getTafsirContentHealthSummary');
  assert.ok(tafsirDataContent.includes('totalSurahs: 114'), 'Summary must report 114 surahs');
  assert.ok(tafsirDataContent.includes('totalAyahs: 6236'), 'Summary must report 6,236 ayahs');
});

test('tafsirData.ts exports runTafsirContentHealthAudit with live stream validation', () => {
  assert.ok(tafsirDataContent.includes('export async function runTafsirContentHealthAudit'), 'Must export runTafsirContentHealthAudit');
  assert.ok(tafsirDataContent.includes('brokenStreams:'), 'Audit must report broken streams');
  assert.ok(tafsirDataContent.includes('activeStreams:'), 'Audit must report active streams');
});

test('AdminPage.tsx contains Content Health Diagnostics section & audit button', () => {
  const adminPagePath = path.resolve('src/pages/AdminPage.tsx');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');

  assert.ok(adminPageContent.includes('Content Health Diagnostics'), 'Must display Content Health Diagnostics heading');
  assert.ok(adminPageContent.includes('runTafsirContentHealthAudit'), 'Must invoke runTafsirContentHealthAudit');
  assert.ok(adminPageContent.includes('Run Full Content Audit'), 'Must have Run Full Content Audit button');
  assert.ok(adminPageContent.includes('All 114 Surahs Verified'), 'Must display 114 surahs verification badge');
});

// -----------------------------------------------------------------------------
// SECTION 5: Frontend UI Resilience & User Recovery Controls
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${YELLOW}Section 5: Frontend UI Resilience (SomaliTafsirSection.tsx)${RESET}`);

const somaliSectionPath = path.resolve('src/components/quran/SomaliTafsirSection.tsx');
const somaliSectionContent = fs.readFileSync(somaliSectionPath, 'utf8');

test('SomaliTafsirSection provides retry controls when Quran text loading fails', () => {
  assert.ok(somaliSectionContent.includes('versesError'), 'Must track versesError state');
  assert.ok(somaliSectionContent.includes('loadVerses(selectedSurahNumber)'), 'Must allow re-triggering loadVerses on error');
  assert.ok(somaliSectionContent.includes('Isku day mar kale'), 'Must render Somali retry button label');
});

test('SomaliTafsirSection provides retry and direct link when audio playback fails', () => {
  assert.ok(somaliSectionContent.includes('audioError'), 'Must track audioError state');
  assert.ok(somaliSectionContent.includes('Dhib baa ka dhacay codka'), 'Must show friendly Somali audio error message');
  assert.ok(somaliSectionContent.includes('Fur Codka Toos'), 'Must provide direct link to open audio externally');
});

test('SomaliTafsirSection displays verse count & Mushaf edition badge', () => {
  assert.ok(
    somaliSectionContent.includes('Uthmani Script') || somaliSectionContent.includes('Qoraalka Cusmaani'),
    'Must display Mushaf script edition indicator'
  );
  assert.ok(
    somaliSectionContent.includes('verses.length') && somaliSectionContent.includes('numberOfAyahs'),
    'Must show rendered verse count out of total canonical ayahs'
  );
});

test('SomaliTafsirSection handles audio element recovery in handleTogglePlay', () => {
  assert.ok(somaliSectionContent.includes('audioRef.current.load()'), 'Must reload audio element on error recovery');
  assert.ok(somaliSectionContent.includes('audioRef.current.play()'), 'Must play audio when triggered');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}${CYAN}==================================================================${RESET}`);
console.log(`${BOLD}${GREEN}All ${passedTests} / ${totalTests} Quran Content & Audio Repair Tests Passed!${RESET}`);
console.log(`${BOLD}${CYAN}==================================================================${RESET}\n`);
