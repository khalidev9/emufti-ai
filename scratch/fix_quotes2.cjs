const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'surahs_part3.cjs');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "'Historical retribution overtaking the insolent societies of Lut, Pharaoh, and the titanic 'Ad',",
  "\"Historical retribution overtaking the insolent societies of Lut, Pharaoh, and the titanic 'Ad\","
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed part3 line 639');
