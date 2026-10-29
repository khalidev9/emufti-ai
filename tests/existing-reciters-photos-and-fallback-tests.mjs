import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('========================================================================');
console.log('EMUFTI AI: 18 EXISTING RECITERS PROFILE PHOTOS & BULLETPROOF FALLBACK TESTS');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

const targetReciters = [
  { id: 'mazroyee', name: 'Yasser Al-Mazroyee' },
  { id: 'daawob', name: 'Tareq Abdulghani Daawob' },
  { id: 'kanakeri', name: 'Abdul Hadi Kanakeri' },
  { id: 'khalid_ghamdi', name: 'Khalid Al-Ghamdi' },
  { id: 'qasim', name: 'Abdul Muhsin Al-Qasim' },
  { id: 'hatem_waer', name: 'Hatem Fareed Al-Waer' },
  { id: 'adel_rayan', name: 'Adel Rayan' },
  { id: 'luhaidan', name: 'Mohammad Al-Luhaidan' },
  { id: 'barrak', name: 'Mohammad Al-Barrak' },
  { id: 'hawashi', name: 'Ahmad Al-Hawashi' },
  { id: 'qazabri', name: 'Omar Al-Qazabri' },
  { id: 'hasan_saleh', name: 'Hasan Saleh' },
  { id: 'yamani', name: 'Wadih Al-Yamani' },
  { id: 'nourin', name: 'Nourin Mohamed Siddiq' },
  { id: 'bukhatir', name: 'Salah Bukhatir' },
  { id: 'ayyub', name: 'Muhammad Ayyub' },
  { id: 'basfar', name: 'Abdullah Basfar' },
  { id: 'qahtani', name: 'Khaled Al-Qahtani' }
];

// --- Suite 1: Data Entries in qarisData.ts ---
console.log('--- Suite 1: Reciter Data Entries in qarisData.ts ---');

const qarisSource = fs.readFileSync(path.resolve('src/data/qarisData.ts'), 'utf8');

targetReciters.forEach((r) => {
  it(`defines portraitUrl for ${r.name} (${r.id}) in ALL_50_QARIS`, () => {
    // Regex finds the object with id: 'r.id' and confirms portraitUrl is present
    const regex = new RegExp(`id:\\s*'${r.id}'[\\s\\S]*?portraitUrl:\\s*'([^']+)'`, 'i');
    const match = qarisSource.match(regex);
    assert.ok(match, `${r.name} must have explicit portraitUrl in its data entry`);
    assert.ok(match[1].startsWith('http://') || match[1].startsWith('https://') || match[1].startsWith('/images/'), `${r.name} portraitUrl must be a valid URL`);
  });
});

// --- Suite 2: Remote Fallbacks in reciterAvatars.ts ---
console.log('\n--- Suite 2: Remote Fallbacks in reciterAvatars.ts ---');

const avatarsSource = fs.readFileSync(path.resolve('src/data/reciterAvatars.ts'), 'utf8');
const remoteFallbacksSource = avatarsSource.substring(avatarsSource.indexOf('RECITER_REMOTE_FALLBACKS'));

targetReciters.forEach((r) => {
  it(`defines RECITER_REMOTE_FALLBACKS for ${r.name} (${r.id})`, () => {
    const regex = new RegExp(`['"]?${r.id}['"]?:\\s*'([^']+)'`, 'i');
    const match = remoteFallbacksSource.match(regex);
    assert.ok(match, `${r.name} must have a remote fallback entry`);
    assert.ok(match[1].startsWith('https://'), `${r.name} fallback must be https`);
  });
});

// --- Suite 3: Bulletproof onError Fallback Handlers across Components ---
console.log('\n--- Suite 3: Bulletproof onError Handlers across Reciter Components ---');

const reciterSelectorModal = fs.readFileSync(path.resolve('src/components/quran/ReciterSelectorModal.tsx'), 'utf8');
const qarisCatalog = fs.readFileSync(path.resolve('src/components/quran/QarisCatalog.tsx'), 'utf8');
const qarisSelectorModal = fs.readFileSync(path.resolve('src/components/quran/QarisSelectorModal.tsx'), 'utf8');
const reciterAvatar = fs.readFileSync(path.resolve('src/components/quran/ReciterAvatar.tsx'), 'utf8');

it('ReciterSelectorModal implements bulletproof multi-tier onError fallback with remote fallback & fallback pill', () => {
  assert.ok(reciterSelectorModal.includes('onError='), 'Must define onError on img tag');
  assert.ok(reciterSelectorModal.includes('RECITER_REMOTE_FALLBACKS'), 'Must attempt RECITER_REMOTE_FALLBACKS');
  assert.ok(reciterSelectorModal.includes('/default-reciter-avatar.png'), 'Must fallback to default avatar image');
  assert.ok(reciterSelectorModal.includes('nextElementSibling'), 'Must gracefully display initials fallback pill');
});

it('QarisCatalog implements bulletproof multi-tier onError fallback with remote fallback & fallback pill', () => {
  assert.ok(qarisCatalog.includes('onError='), 'Must define onError on img tag');
  assert.ok(qarisCatalog.includes('RECITER_REMOTE_FALLBACKS'), 'Must attempt RECITER_REMOTE_FALLBACKS');
  assert.ok(qarisCatalog.includes('/default-reciter-avatar.png'), 'Must fallback to default avatar image');
  assert.ok(qarisCatalog.includes('nextElementSibling'), 'Must gracefully display initials fallback pill');
});

it('QarisSelectorModal implements bulletproof multi-tier onError fallback with remote fallback & fallback pill', () => {
  assert.ok(qarisSelectorModal.includes('onError='), 'Must define onError on img tag');
  assert.ok(qarisSelectorModal.includes('RECITER_REMOTE_FALLBACKS'), 'Must attempt RECITER_REMOTE_FALLBACKS');
  assert.ok(qarisSelectorModal.includes('/default-reciter-avatar.png'), 'Must fallback to default avatar image');
  assert.ok(qarisSelectorModal.includes('nextElementSibling'), 'Must gracefully display initials fallback pill');
});

it('ReciterAvatar component implements bulletproof multi-tier onError fallback with remote fallback & state fallback', () => {
  assert.ok(reciterAvatar.includes('onError={handleError}'), 'Must bind onError to handleError');
  assert.ok(reciterAvatar.includes('RECITER_REMOTE_FALLBACKS'), 'Must attempt remote fallback first');
  assert.ok(reciterAvatar.includes('/default-reciter-avatar.png'), 'Must fallback to default-reciter-avatar.png');
  assert.ok(reciterAvatar.includes('setHasError(true)'), 'Must gracefully switch to stylized initials avatar');
});

console.log('\n========================================================================');
console.log(`TOTAL: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
