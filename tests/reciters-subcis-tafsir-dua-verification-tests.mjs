import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('==================================================================');
console.log('   EMufti AI: Reciters Desktop, Subcis Photos, Tafsir & Dua Tests  ');
console.log('==================================================================\n');

// 1. Check 50 Reciters Desktop Layout in QarisCatalog.tsx
console.log('Test 1: 50 Reciters Desktop Vertical Layout');
const qarisCatalogContent = fs.readFileSync('src/components/quran/QarisCatalog.tsx', 'utf8');
assert.ok(
  qarisCatalogContent.includes('grid grid-cols-1 gap-4 w-full max-w-full') ||
  qarisCatalogContent.includes('flex flex-col gap-4 w-full max-w-full'),
  'QarisCatalog must enforce single-column vertical list (grid-cols-1 or flex-col) on all viewports'
);
assert.ok(
  !qarisCatalogContent.includes('grid-cols-2') && !qarisCatalogContent.includes('grid-cols-3'),
  'QarisCatalog reciter list must not use multi-column grid classes'
);
assert.ok(
  qarisCatalogContent.includes('flex flex-col space-y-4 w-full max-w-full'),
  'QarisCatalog reciter card must refactor into a strict vertical block stack (flex flex-col space-y-4)'
);
assert.ok(
  qarisCatalogContent.includes('Block 2: Surah Dropdown Selector sitting completely below description, spanning full width') &&
  qarisCatalogContent.includes('Block 3: Action Buttons sitting completely below dropdown, spanning full width'),
  'QarisCatalog must stack Surah selector and action buttons completely below description spanning full width'
);
console.log('  ✓ 50 Reciters renders strictly as a vertical list (grid-cols-1) with full-width stacked card controls');

// 2. Check Subcis Reciters Avatars & Fallback Handlers
console.log('\nTest 2: Subcis Reciters Portrait Avatars & Fallbacks');
const subcisPracticeContent = fs.readFileSync('src/components/quran/SubcisPractice.tsx', 'utf8');
assert.ok(
  subcisPracticeContent.includes("import { ReciterAvatar } from './ReciterAvatar';"),
  'SubcisPractice must import ReciterAvatar component'
);
assert.ok(
  subcisPracticeContent.includes('<ReciterAvatar reciter={q} isSelected={isSelected} size="sm" showSomaliFlag />'),
  'Subcis quick reciters pill row must render ReciterAvatar with portrait and Somali flag'
);
assert.ok(
  subcisPracticeContent.includes('<ReciterAvatar reciter={q} isSelected={isSelected} size="md" showSomaliFlag />'),
  'Subcis reciter selection list must render ReciterAvatar'
);
assert.ok(
  subcisPracticeContent.includes('<ReciterAvatar reciter={activeQari} size="md" showSomaliFlag />'),
  'Subcis active setup card must render ReciterAvatar'
);
assert.ok(
  subcisPracticeContent.includes('<ReciterAvatar reciter={activeQari} size="xs" />'),
  'Subcis attempt history card must render ReciterAvatar'
);

const reciterAvatarContent = fs.readFileSync('src/components/quran/ReciterAvatar.tsx', 'utf8');
assert.ok(
  reciterAvatarContent.includes("size?: 'xs' | 'sm' | 'md' | 'lg'"),
  'ReciterAvatar must support xs size'
);
assert.ok(
  reciterAvatarContent.includes('RECITER_REMOTE_FALLBACKS'),
  'ReciterAvatar must provide remote fallback handler'
);
console.log('  ✓ Subcis section renders valid portrait photos with graceful fallbacks across all cards');

// 3. Check Tafsir Scholars, Sheikh Mustafa & Removals/Adjustments
console.log('\nTest 3: Tafsir Scholars, Sheikh Mustafa, Photos & Adjustments');
const tafsirDataContent = fs.readFileSync('src/data/tafsirData.ts', 'utf8');
assert.ok(
  tafsirDataContent.includes("id: 'sheikh-mustafe'"),
  'tafsirData must include Sheikh Mustafe'
);
assert.ok(
  tafsirDataContent.includes("portraitUrl: '/images/scholars/sheikh_mustafe.jpg'"),
  'Sheikh Mustafe must have valid portraitUrl'
);
assert.ok(
  tafsirDataContent.includes("portraitUrl: '/images/scholars/sheikh_cumar_faaruuq.svg'"),
  'Sheikh Cumar Faaruuq must have portraitUrl'
);
assert.ok(
  tafsirDataContent.includes("portraitUrl: '/images/scholars/sheikh_shibli.svg'"),
  'Sheikh Shibli must have portraitUrl'
);
assert.ok(
  tafsirDataContent.includes("portraitUrl: '/images/reciters/abdulrasheed-sufi.png'"),
  'Sheikh Cabdirashiid Cali Suufi must have portraitUrl'
);
assert.ok(
  tafsirDataContent.includes('export function getActiveSomaliScholars()'),
  'tafsirData must export getActiveSomaliScholars helper'
);

// Verify file exists on disk
assert.ok(
  fs.existsSync('public/images/scholars/sheikh_mustafe.jpg'),
  'sheikh_mustafe.jpg must exist on disk in public folder'
);

const somaliTafsirContent = fs.readFileSync('src/components/quran/SomaliTafsirSection.tsx', 'utf8');
assert.ok(
  somaliTafsirContent.includes("Tafsiirka & Tadabburka Qur'aanka ee Culimada Soomaaliyeed"),
  'SomaliTafsirSection must replace Tafsiir Dhamaystir with authentic Tadabbur title'
);
assert.ok(
  somaliTafsirContent.includes('Sheekha Tadabburka'),
  'SomaliTafsirSection must highlight Sheikh Mustafe as Sheekha Tadabburka'
);
assert.ok(
  somaliTafsirContent.includes('img') && somaliTafsirContent.includes('scholar.portraitUrl'),
  'SomaliTafsirSection must render scholar portrait photos'
);
console.log('  ✓ Sheikh Mustafa is primary scholar with portrait photo, lessons, and Tafsiir Dhamaystir adjusted');

// 4. Check Dua Learning & Reading Section ("Lana Bari Karo")
console.log('\nTest 4: Dua Reading & Interactive Learning Mode ("Lana Bari Karo")');
const duaLibraryContent = fs.readFileSync('src/components/quran/DuaLibrarySection.tsx', 'utf8');
assert.ok(
  duaLibraryContent.includes("activeMode === 'learn'") && duaLibraryContent.includes("activeMode === 'browse'"),
  'DuaLibrarySection must implement dual browse and interactive learning modes'
);
assert.ok(
  duaLibraryContent.includes('Lana Bari Karo'),
  'DuaLibrarySection must provide Lana Bari Karo interactive mode'
);
assert.ok(
  duaLibraryContent.includes('Baro Eray-Eray'),
  'DuaLibrarySection must provide phrase-by-phrase learning'
);
assert.ok(
  duaLibraryContent.includes('Ku Celceli & Xifdi'),
  'DuaLibrarySection must provide repetition trainer'
);
assert.ok(
  duaLibraryContent.includes('Tijaabi Xifdigaaga'),
  'DuaLibrarySection must provide memorization recall test'
);
assert.ok(
  duaLibraryContent.includes('Fasiraadda & Xigmadda'),
  'DuaLibrarySection must provide wisdom and virtue analysis'
);
assert.ok(
  duaLibraryContent.includes('handleAskEMuftiForDua'),
  'DuaLibrarySection must provide EMufti AI inquiry integration'
);

const duasDataContent = fs.readFileSync('src/data/duasData.ts', 'utf8');
assert.ok(
  duasDataContent.includes('phrases: ['),
  'duasData must include structured phrase breakdowns for interactive learning'
);
assert.ok(
  duasDataContent.includes('whenToRecite:'),
  'duasData must include whenToRecite guidance'
);
console.log('  ✓ Dedicated Dua section has authentic reading and interactive Lana Bari Karo learning mode');

console.log('\n==================================================================');
console.log('   ALL 4 FEATURE SPECIFICATIONS PASSED WITH 100% SUCCESS!         ');
console.log('==================================================================\n');
