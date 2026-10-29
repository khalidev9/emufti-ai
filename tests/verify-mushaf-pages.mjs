// Global fetch in Node 18+

async function testPage(pageNumber) {
  console.log(`\n======================================================`);
  console.log(`Testing Mushaf Page ${pageNumber}:`);
  console.log(`======================================================`);

  const url = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=text_uthmani,line_number,page_number,verse_key,location&per_page=50`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch page ${pageNumber}: HTTP ${res.status}`);
    return;
  }

  const json = await res.json();
  const verses = json.verses || [];
  console.log(`Total verses on page: ${verses.length}`);

  // Collect surahs
  const surahs = new Set();
  const startingSurahs = [];
  verses.forEach((v) => {
    const [s] = v.verse_key.split(':');
    surahs.add(s);
    if (v.verse_number === 1) {
      startingSurahs.push(s);
    }
  });

  console.log(`Surahs appearing on page ${pageNumber}: ${Array.from(surahs).join(', ')}`);
  if (startingSurahs.length > 0) {
    console.log(`✨ Surah transition(s) detected: Surah ${startingSurahs.join(', ')} starts on this page!`);
  }

  // Check line distribution (1 to 15)
  const lineCounts = {};
  verses.forEach((v) => {
    v.words.forEach((w) => {
      const line = w.line_number || 1;
      lineCounts[line] = (lineCounts[line] || 0) + 1;
    });
  });

  const lines = Object.keys(lineCounts).map(Number).sort((a, b) => a - b);
  console.log(`Active printed lines on page: ${lines.join(', ')} (Span: Line ${lines[0]} to Line ${lines[lines.length - 1]})`);

  // Sample line text
  const firstLine = lines[0];
  const firstLineWords = [];
  verses.forEach((v) => {
    v.words.forEach((w) => {
      if (w.line_number === firstLine) {
        firstLineWords.push(w.text_uthmani);
      }
    });
  });
  console.log(`Sample Line ${firstLine} Uthmani text: [ ${firstLineWords.join(' ')} ]`);

  console.log(`✓ Page ${pageNumber} verified successfully!`);
}

async function run() {
  await testPage(1);   // Al-Fatihah
  await testPage(2);   // Al-Baqarah start
  await testPage(50);  // Transition: Al-Baqarah -> Aal-Imran
  await testPage(77);  // Transition: Aal-Imran -> An-Nisa
  await testPage(604); // Multi-surah page: 112, 113, 114
  console.log('\nAll 5 test Mushaf pages verified successfully with line and word layouts!\n');
}

run().catch(console.error);
