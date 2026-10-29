import assert from 'node:assert';
import fs from 'node:fs';

console.log('==================================================================');
console.log('   EMufti AI: Tafsir Disabled & Dua Audio Recitation Tests         ');
console.log('==================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Tafsir Globally Disabled ("Not Available") Across All Modules & Tabs
// -----------------------------------------------------------------------------
console.log('Test 1: Tafsir Globally Disabled ("Not Available") Across All Modules & Tabs');

// 1.1 SomaliTafsirSection.tsx
const somaliTafsirContent = fs.readFileSync('src/components/quran/SomaliTafsirSection.tsx', 'utf8');
assert.ok(
  somaliTafsirContent.includes('Lama heli karo xilligan • Not Available'),
  'SomaliTafsirSection must display prominent "Lama heli karo xilligan • Not Available" banner'
);
assert.ok(
  somaliTafsirContent.includes('Qaybta Tafsiirka Culimada Xilligan Lama Heli Karo'),
  'SomaliTafsirSection must have clear title explaining Tafsir is currently not available'
);
assert.ok(
  somaliTafsirContent.includes('Dib-u-habeyn ku socota (Maintenance)'),
  'SomaliTafsirSection must state under maintenance / review status'
);
console.log('  ✓ SomaliTafsirSection prominently renders "Not Available / Lama heli karo" maintenance banner');

// 1.2 QuranPage.tsx
const quranPageContent = fs.readFileSync('src/pages/QuranPage.tsx', 'utf8');
assert.ok(
  quranPageContent.includes("id: 'tafsiir', label: 'Tafsiir', labelSo: 'Tafsiirka Soomaaliga', icon: BookOpen, notAvailable: true, statusBadge: 'Not Available'"),
  'QuranPage CATEGORIES must mark tafsiir tab with notAvailable: true and statusBadge'
);
assert.ok(
  quranPageContent.includes('{cat.statusBadge && ('),
  'QuranPage Companion Tools dropdown must render statusBadge indicator'
);
assert.ok(
  quranPageContent.includes('Tafsiirka Aayadda') && quranPageContent.includes('Not Available'),
  'QuranPage quick Tafsir drawer must include Not Available badge'
);
assert.ok(
  quranPageContent.includes('Tafsiirka aayaddan iyo casharrada culimada Soomaaliyeed xilligan lama heli karo'),
  'QuranPage quick Tafsir drawer must explain section is temporarily disabled'
);
console.log('  ✓ QuranPage marks Tafsir tab as Not Available in metadata, tools dropdown, and quick drawer');

// 1.3 QuranStudyActionDrawer.tsx
const studyDrawerContent = fs.readFileSync('src/components/quran/QuranStudyActionDrawer.tsx', 'utf8');
assert.ok(
  studyDrawerContent.includes('currentTab === \'tafsirs\'') && studyDrawerContent.includes('Lama heli karo xilligan • Not Available'),
  'QuranStudyActionDrawer must show "Lama heli karo xilligan • Not Available" when tafsirs tab is active'
);
assert.ok(
  studyDrawerContent.includes('Tafsirs') && studyDrawerContent.includes('Not Available'),
  'QuranStudyActionDrawer must display Not Available badge on Tafsirs tab header'
);
assert.ok(
  studyDrawerContent.includes("activeTab || initialTab || 'lessons'"),
  'QuranStudyActionDrawer must default to active features (lessons) rather than disabled tafsirs'
);
console.log('  ✓ QuranStudyActionDrawer has Not Available badge and banner on Tafsirs tab');

// 1.4 StudyTafsirView.tsx
const studyTafsirContent = fs.readFileSync('src/components/quran/StudyTafsirView.tsx', 'utf8');
assert.ok(
  studyTafsirContent.includes('Tafsiirka Culimada Soomaaliyeed ee Aayaddan') && studyTafsirContent.includes('Not Available'),
  'StudyTafsirView toggle button must include Not Available badge'
);
assert.ok(
  studyTafsirContent.includes('Qaybta Tafsiirka Culimada Soomaaliyeed xilligan lama heli karo (Not Available)'),
  'StudyTafsirView expandable panel must state Tafsir is not available'
);
console.log('  ✓ StudyTafsirView shows Not Available badge and disabled state on verse commentary');

// 1.5 IntegratedQuranReaderPanel.tsx & VerseByVerseView.tsx
const readerPanelContent = fs.readFileSync('src/components/quran/IntegratedQuranReaderPanel.tsx', 'utf8');
assert.ok(
  readerPanelContent.includes('Tafsiirka Aayadda (Not Available)'),
  'IntegratedQuranReaderPanel must mark Tafsir action title as Not Available'
);
assert.ok(
  readerPanelContent.includes('Qaybta Tafsiirka Culimada Soomaaliyeed ee aayaddan xilligan lama heli karo (Not Available)'),
  'IntegratedQuranReaderPanel modal must show Not Available alert'
);

const verseByVerseContent = fs.readFileSync('src/components/quran/VerseByVerseView.tsx', 'utf8');
assert.ok(
  verseByVerseContent.includes('Tafsirs (Not Available)'),
  'VerseByVerseView must mark Tafsirs button with Not Available title and badge'
);
console.log('  ✓ Integrated reader panel and verse-by-verse view mark Tafsir triggers as Not Available');

// 1.6 AdminPage.tsx
const adminPageContent = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
assert.ok(
  adminPageContent.includes("setActiveTab('tafsir')") && adminPageContent.includes('Not Available'),
  'AdminPage Tafsir tab button must display Not Available status badge'
);
assert.ok(
  adminPageContent.includes('Feature Status: Globally Disabled ("Not Available")'),
  'AdminPage Tafsir section must display global disabled notice'
);
console.log('  ✓ AdminPage Tafsir manager shows Not Available status badge and global disabled alert');


// -----------------------------------------------------------------------------
// Test 2: Audio Recitation Player in Dua Section
// -----------------------------------------------------------------------------
console.log('\nTest 2: Audio Recitation Player in Dua Section');

// 2.1 duasData.ts Authentic Audio URLs & Physical Local MP3 Files
const duasDataContent = fs.readFileSync('src/data/duasData.ts', 'utf8');
const idMatches = [...duasDataContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
const audioMatches = [...duasDataContent.matchAll(/audio_url:\s*'([^']+)'/g)].map(m => m[1]);

assert.strictEqual(
  idMatches.length,
  audioMatches.length,
  `Every single Dua in duasData must have a dedicated audio_url (Found ${audioMatches.length} of ${idMatches.length})`
);

// Verify that all 17 physical MP3 files exist in public/audio/duas/ with non-zero bytes
idMatches.forEach(id => {
  const filePath = `public/audio/duas/${id}.mp3`;
  assert.ok(
    fs.existsSync(filePath),
    `Audio recitation file for ${id} must physically exist at ${filePath}`
  );
  const stat = fs.statSync(filePath);
  assert.ok(
    stat.size > 10000,
    `Audio file ${filePath} must have valid non-zero content (Found ${stat.size} bytes)`
  );
});
console.log(`  ✓ All ${idMatches.length} authentic Duas connect to valid, verified local audio files (public/audio/duas/*.mp3)`);

// 2.2 DuaLibrarySection.tsx Audio Player Engine & Controls
const duaLibraryContent = fs.readFileSync('src/components/quran/DuaLibrarySection.tsx', 'utf8');
assert.ok(
  duaLibraryContent.includes('const audioRef = useRef<HTMLAudioElement | null>(null);'),
  'DuaLibrarySection must initialize HTML5 audio element ref'
);
assert.ok(
  duaLibraryContent.includes('playDuaAudio =') && duaLibraryContent.includes('fallbackToSpeech ='),
  'DuaLibrarySection must implement dual playback engine: streaming audio with Web Speech fallback'
);
assert.ok(
  duaLibraryContent.includes('handleToggleDuaAudio ='),
  'DuaLibrarySection must implement handleToggleDuaAudio controller'
);
assert.ok(
  duaLibraryContent.includes('handleSpeedChange =') &&
  duaLibraryContent.includes('playbackSpeed') &&
  duaLibraryContent.includes('0.75') &&
  duaLibraryContent.includes('1.25'),
  'DuaLibrarySection must provide playback speed selector (0.75x, 1.0x, 1.25x)'
);
assert.ok(
  duaLibraryContent.includes('handleLoopToggle =') && duaLibraryContent.includes('isAudioLooping'),
  'DuaLibrarySection must provide audio loop/repeat functionality'
);
assert.ok(
  duaLibraryContent.includes('handleSeek =') && duaLibraryContent.includes('audioCurrentTime'),
  'DuaLibrarySection must provide progress bar scrubber and time display'
);
assert.ok(
  duaLibraryContent.includes('animate-bounce') && duaLibraryContent.includes('Codka wuu socdaa'),
  'DuaLibrarySection must render animated equalizer wave bars while playing'
);
assert.ok(
  duaLibraryContent.includes('Floating Audio Recitation Mini-Player Dock') &&
  duaLibraryContent.includes('activeAudioDua && isPlayingAudio'),
  'DuaLibrarySection must provide floating mini-player dock while listening'
);
console.log('  ✓ DuaLibrarySection provides comprehensive audio player with waveform, speed, loop, and floating mini-player');

console.log('\n==================================================================');
console.log('   ALL TAFSIR DISABLED & DUA AUDIO TESTS PASSED (100%)            ');
console.log('==================================================================\n');
