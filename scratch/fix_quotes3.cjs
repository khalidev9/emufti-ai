const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'surahs_part3.cjs');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "Houses the paramount existential verse defining the raison d'être",
  "Houses the paramount existential verse defining the raison d\\'être"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed part3 line 647');
