const fs = require('fs');
const path = require('path');

// We will read ALL_114_SURAHS from src/data/quranMetadata.ts or define it here
const metadataContent = fs.readFileSync(path.join(__dirname, '../src/data/quranMetadata.ts'), 'utf8');

// Parse ALL_114_SURAHS from file
const surahRegex = /number:\s*(\d+),\s*name:\s*'([^']+)',\s*englishName:\s*'([^']+)',\s*englishNameTranslation:\s*'([^']+)',\s*somaliNameTranslation:\s*'([^']+)',\s*numberOfAyahs:\s*(\d+),\s*revelationType:\s*'([^']+)',\s*page:\s*(\d+)/g;

const surahs = [];
let match;
while ((match = surahRegex.exec(metadataContent)) !== null) {
  surahs.push({
    number: parseInt(match[1], 10),
    name: match[2],
    englishName: match[3],
    englishNameTranslation: match[4],
    somaliNameTranslation: match[5],
    numberOfAyahs: parseInt(match[6], 10),
    revelationType: match[7],
    page: parseInt(match[8], 10)
  });
}

console.log(`Found ${surahs.length} surahs in metadata`);
