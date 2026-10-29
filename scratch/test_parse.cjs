const fs = require('fs');
const path = require('path');

const metadataContent = fs.readFileSync(path.join(__dirname, '../src/data/quranMetadata.ts'), 'utf8');

// Extract ALL_114_SURAHS array content
const match = metadataContent.match(/export const ALL_114_SURAHS: Surah\[\] = (\[[\s\S]*?\]);/);
if (match) {
  // Replace single quotes with double quotes carefully, or evaluate as JS object
  const arrayCode = match[1];
  const list = eval(arrayCode);
  console.log(`Successfully parsed ${list.length} surahs!`);
  console.log('Surah 1:', list[0].englishName, 'Surah 114:', list[113].englishName);
} else {
  console.log('Could not find ALL_114_SURAHS');
}
