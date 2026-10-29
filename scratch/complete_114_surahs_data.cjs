const fs = require('fs');
const path = require('path');

// Read ALL_114_SURAHS from src/data/quranMetadata.ts
const metadataFile = path.join(__dirname, '../src/data/quranMetadata.ts');
const metadataContent = fs.readFileSync(metadataFile, 'utf8');
const match = metadataContent.match(/export const ALL_114_SURAHS: Surah\[\] = (\[[\s\S]*?\]);/);
const allSurahs = eval(match[1]);

console.log(`Loaded ${allSurahs.length} surahs from metadata.`);
