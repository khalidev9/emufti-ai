/**
 * Verification test suite for Reciter Portrait Photos / Avatars Feature Addition
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: RECITER PORTRAIT PHOTOS & AVATARS VERIFICATION TESTS');
console.log('========================================================================\n');

// 1. Reciter Avatar Data & Assets Catalog
console.log('--- 1. Reciter Avatars Asset Map & Local Files ---');
const avatarMapPath = path.resolve('src/data/reciterAvatars.ts');
assert(fs.existsSync(avatarMapPath), '1.1 src/data/reciterAvatars.ts exists');
const avatarMapContent = fs.readFileSync(avatarMapPath, 'utf8');

const majorReciters = [
  { id: 'abdulrasheed-sufi', name: 'Sheikh Abdur-Rashid Ali Sufi' },
  { id: 'alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Hussary' },
  { id: 'abdulbasit', name: 'Abdul Basit Abdul Samad' },
  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
  { id: 'maher', name: 'Maher Al-Muaiqly' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi' },
  { id: 'sudais', name: 'Abdul Rahman Al-Sudais' },
  { id: 'shuraim', name: 'Saud Al-Shuraim' },
  { id: 'yasser_dosari', name: 'Yasser Al-Dosari' },
];

majorReciters.forEach((r) => {
  assert(
    avatarMapContent.includes(r.id),
    `1.2 reciterAvatars.ts defines portrait mapping for ${r.name} (${r.id})`
  );
  const publicDir = path.resolve('public/images/reciters');
  const matchingFiles = fs.readdirSync(publicDir).filter((f) => f.startsWith(r.id + '.'));
  assert(
    matchingFiles.length > 0,
    `1.3 Local image asset exists for ${r.name}: public/images/reciters/${matchingFiles[0] || 'NONE'}`
  );
});

// 2. ReciterSelectorModal Integration ("Dooro Qaari")
console.log('\n--- 2. ReciterSelectorModal ("Dooro Qaari" Modal) ---');
const modalPath = path.resolve('src/components/quran/ReciterSelectorModal.tsx');
assert(fs.existsSync(modalPath), '2.1 ReciterSelectorModal.tsx exists');
const modalContent = fs.readFileSync(modalPath, 'utf8');

assert(
  modalContent.includes('w-12 h-12 rounded-full object-cover'),
  '2.2 Reciter card renders portrait photo with circular styling (w-12 h-12 rounded-full object-cover)'
);

assert(
  modalContent.includes('onError=') && modalContent.includes('nextElementSibling'),
  '2.3 Reciter card includes onError fallback handling'
);

assert(
  modalContent.includes('getReciterAvatarUrl') && modalContent.includes('getReciterInitials'),
  '2.4 ReciterSelectorModal utilizes getReciterAvatarUrl and getReciterInitials helpers'
);

assert(
  modalContent.includes('bg-white text-blue-600 shadow-xs') &&
    modalContent.includes('bg-blue-800/90 text-white'),
  '2.5 Preserves strict blue theme test classes for fallback avatar pills'
);

// 3. QarisCatalog Integration (Reciter Selection Page / Section)
console.log('\n--- 3. QarisCatalog (Reciter Selection Page) ---');
const catalogPath = path.resolve('src/components/quran/QarisCatalog.tsx');
assert(fs.existsSync(catalogPath), '3.1 QarisCatalog.tsx exists');
const catalogContent = fs.readFileSync(catalogPath, 'utf8');

assert(
  catalogContent.includes('w-12 h-12') &&
    catalogContent.includes('rounded-full object-cover'),
  '3.2 QarisCatalog renders reciter portrait photo with circular styling'
);

assert(
  catalogContent.includes('onError=') && catalogContent.includes('getReciterAvatarUrl'),
  '3.3 QarisCatalog integrates getReciterAvatarUrl with onError fallback'
);

// 4. QarisSelectorModal Integration
console.log('\n--- 4. QarisSelectorModal Component ---');
const qarisModalPath = path.resolve('src/components/quran/QarisSelectorModal.tsx');
assert(fs.existsSync(qarisModalPath), '4.1 QarisSelectorModal.tsx exists');
const qarisModalContent = fs.readFileSync(qarisModalPath, 'utf8');

assert(
  qarisModalContent.includes('w-12 h-12 rounded-full object-cover'),
  '4.2 QarisSelectorModal renders reciter portrait photo with circular styling'
);

assert(
  !qarisModalContent.includes('emerald'),
  '4.3 QarisSelectorModal maintains 0 emerald occurrences adhering to blue design system'
);

// 5. Standalone ReciterAvatar Component
console.log('\n--- 5. Standalone ReciterAvatar Component ---');
const reciterAvatarPath = path.resolve('src/components/quran/ReciterAvatar.tsx');
assert(fs.existsSync(reciterAvatarPath), '5.1 ReciterAvatar.tsx exists');
const reciterAvatarContent = fs.readFileSync(reciterAvatarPath, 'utf8');

assert(
  reciterAvatarContent.includes('w-12 h-12 rounded-full object-cover'),
  '5.2 ReciterAvatar implements w-12 h-12 rounded-full object-cover'
);

assert(
  reciterAvatarContent.includes('onError={handleError}'),
  '5.3 ReciterAvatar implements graceful multi-tier fallback error handling'
);

// Summary
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
