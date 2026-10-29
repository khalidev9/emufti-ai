const fs = require('fs');
const path = require('path');

['part2', 'part3', 'part4'].forEach(part => {
  const filePath = path.join(__dirname, `surahs_${part}.cjs`);
  try {
    require(filePath);
    console.log(`${part} loaded without error`);
  } catch (e) {
    console.log(`${part} failed:`, e.message);
    if (e.stack) {
      const match = e.stack.match(/surahs_.*?:(\d+)/);
      if (match) {
        console.log(`Error at line ${match[1]}`);
        const lines = fs.readFileSync(filePath, 'utf8').split('\n');
        const lineIdx = parseInt(match[1], 10) - 1;
        for (let i = Math.max(0, lineIdx - 3); i <= Math.min(lines.length - 1, lineIdx + 3); i++) {
          console.log(`${i + 1}: ${lines[i]}`);
        }
      }
    }
  }
});
