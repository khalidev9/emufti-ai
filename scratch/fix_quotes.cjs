const fs = require('fs');
const path = require('path');

function fixFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  // Specific known unescaped quotes:
  content = content.replace(
    "'Sayyiduna 'Umar urged the community: \"Teach your women Surah An-Nur\" for its domestic wisdom.'",
    "\"Sayyiduna 'Umar urged the community: \\\"Teach your women Surah An-Nur\\\" for its domestic wisdom.\""
  );
  content = content.replace(
    "'Recited by the Prophet ﷺ to the Meccan diplomat 'Utbah ibn Rabi'ah, leaving the pagan emissary utterly spellbound and immobilized.'",
    "\"Recited by the Prophet ﷺ to the Meccan diplomat 'Utbah ibn Rabi'ah, leaving the pagan emissary utterly spellbound and immobilized.\""
  );
  content = content.replace(
    "'The Prophet ﷺ regularly recited Surah Al-Buruj in the night prayer ('Isha) for its inspirational fortitude (Tirmidhi).'",
    "\"The Prophet ﷺ regularly recited Surah Al-Buruj in the night prayer ('Isha) for its inspirational fortitude (Tirmidhi).\""
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

['surahs_part2.cjs', 'surahs_part3.cjs', 'surahs_part4.cjs'].forEach(fixFile);
console.log('Fixed quotes. Now testing...');
