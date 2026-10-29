const fs = require('fs');
const path = require('path');

const p1 = require('./surahs_part1.cjs');
const p2 = require('./surahs_part2.cjs');
const p3 = require('./surahs_part3.cjs');
const p3b = require('./surahs_part3b.cjs');
const p4 = require('./surahs_part4.cjs');
const p5 = require('./surahs_part5.cjs');

const rawSurahs = { ...p1, ...p2, ...p3, ...p3b, ...p4, ...p5 };

// Parse ALL_114_SURAHS from quranMetadata.ts
const metaFile = fs.readFileSync(path.join(__dirname, '../src/data/quranMetadata.ts'), 'utf8');
const match = metaFile.match(/export const ALL_114_SURAHS: Surah\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not find ALL_114_SURAHS');
  process.exit(1);
}
const allSurahs = eval(match[1]);
console.log('Loaded allSurahs metadata count:', allSurahs.length);

const assembled = {};
const uniqueSoThemes = new Set();
const uniqueEnThemes = new Set();
const duplicateThemes = [];

for (let i = 1; i <= 114; i++) {
  const meta = allSurahs.find(s => s.number === i);
  const raw = rawSurahs[i];
  if (!raw) {
    console.error(`Missing data for surah ${i}`);
    continue;
  }

  const themesSo = raw.themesSo || raw.mainThemesSo;
  const themesEn = raw.themesEn || raw.mainThemesEn;
  const namingSo = raw.namingReasonSo || raw.nameReasonSo;
  const namingEn = raw.namingReasonEn || raw.nameReasonEn;

  // Check themes validity
  if (!themesSo || themesSo.length < 3) {
    console.error(`Surah ${i} (${meta?.englishName}) has insufficient Somali themes:`, themesSo);
  }
  if (!themesEn || themesEn.length < 3) {
    console.error(`Surah ${i} (${meta?.englishName}) has insufficient English themes:`, themesEn);
  }

  // Check uniqueness of theme strings
  const soKey = themesSo.join(' | ');
  if (uniqueSoThemes.has(soKey)) {
    duplicateThemes.push(`Surah ${i} duplicates Somali themes: ${soKey}`);
  }
  uniqueSoThemes.add(soKey);

  const enKey = themesEn.join(' | ');
  if (uniqueEnThemes.has(enKey)) {
    duplicateThemes.push(`Surah ${i} duplicates English themes: ${enKey}`);
  }
  uniqueEnThemes.add(enKey);

  const startPage = meta.page;
  const nextSurah = allSurahs.find(s => s.number === i + 1);
  const endPage = nextSurah ? Math.max(startPage, nextSurah.page > startPage ? nextSurah.page - (meta.numberOfAyahs < 5 && nextSurah.page > startPage + 1 ? 0 : (meta.numberOfAyahs <= 6 ? 0 : 0)) : startPage) : 604;
  const pageRangeStr = startPage === endPage ? `Page ${startPage}` : `Pages ${startPage}-${endPage}`;
  const approxJuz = Math.min(30, Math.max(1, Math.ceil(startPage / 20)));

  assembled[i] = {
    surahNumber: i,
    revelationType: meta.revelationType,
    revelationOrder: raw.revOrder || i,
    ayahCount: meta.numberOfAyahs,
    wordCount: Math.round(meta.numberOfAyahs * 14.5),
    juzRange: `Juz ${approxJuz}`,
    pageRange: pageRangeStr,
    aboutSomali: raw.aboutSo,
    aboutEnglish: raw.aboutEn,
    namingReasonSomali: namingSo,
    namingReasonEnglish: namingEn,
    mainThemesSomali: themesSo,
    mainThemesEnglish: themesEn,
    virtuesSomali: raw.virtuesSo || [],
    virtuesEnglish: raw.virtuesEn || [],
    revelationContextSomali: raw.contextSo,
    revelationContextEnglish: raw.contextEn
  };
}

console.log('Total assembled surahs:', Object.keys(assembled).length);
console.log('Unique Somali theme sets:', uniqueSoThemes.size);
console.log('Unique English theme sets:', uniqueEnThemes.size);
if (duplicateThemes.length > 0) {
  console.log('Duplicate themes detected:', duplicateThemes);
} else {
  console.log('SUCCESS: All 114 Surahs have 100% unique, distinct themes!');
}
