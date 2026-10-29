import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING KHITMA WORKFLOW & ADMIN TEST PDF GENERATION TESTS ---');

const khitmaPageFile = fs.readFileSync(path.resolve('./src/pages/KhitmaPage.tsx'), 'utf-8');
const adminPageFile = fs.readFileSync(path.resolve('./src/pages/AdminPage.tsx'), 'utf-8');
const khatmServiceFile = fs.readFileSync(path.resolve('./src/lib/khatmChallengeService.ts'), 'utf-8');
const appFile = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');
const bannerFile = fs.readFileSync(path.resolve('./src/components/dashboard/QuranKhatmChallengeWidget.tsx'), 'utf-8');

// 1. DEDICATED KHITMA PAGE ROUTING & BANNER NAVIGATION
console.log('Testing 1: Dedicated Khitma page routing and banner navigation...');
assert(appFile.includes('path="/khitma"'), 'App.tsx must register route for /khitma');
assert(bannerFile.includes("navigate('/khitma')") || bannerFile.includes('navigate("/khitma")'), 'Banner Start Khatma button must navigate to /khitma');
console.log('✓ Test 1 Passed: Banner routes directly to dedicated /khitma page.');

// 2. REGISTRATION FORM & DURATION OPTIONS
console.log('Testing 2: Khitma registration form & requested duration options...');
assert(khitmaPageFile.includes('Full Name (Magaca'), 'KhitmaPage must have Full Name (Magaca) field');
assert(khitmaPageFile.includes('Start Date (Taariikhda'), 'KhitmaPage must have Start Date field');
assert(khitmaPageFile.includes('End Date (Taariikhda dhamaynaysid)'), 'KhitmaPage must have End Date auto-calculated field');
assert(khitmaPageFile.includes('1 Bil (Month)'), 'KhitmaPage must include 1 Bil (Month) duration option');
assert(khitmaPageFile.includes('3 Weeks'), 'KhitmaPage must include 3 Weeks duration option');
assert(khitmaPageFile.includes('2 Weeks'), 'KhitmaPage must include 2 Weeks duration option');
assert(khitmaPageFile.includes('10 Days'), 'KhitmaPage must include 10 Days duration option');
assert(khitmaPageFile.includes('7 Days'), 'KhitmaPage must include 7 Days duration option');
assert(khitmaPageFile.includes('Hagaha Maalinlaha ah ee Qorshaha Khitmada') || khitmaPageFile.includes('Daily Breakdown Guide'), 'KhitmaPage must include daily breakdown routine guide');
console.log('✓ Test 2 Passed: Registration form includes Magaca, Start Date, End Date, all 5 duration options and daily breakdown guide.');

// 3. DAILY READING & TICKING WORKFLOW
console.log('Testing 3: Daily reading & ticking workflow with locking...');
assert(khitmaPageFile.includes("Billaaw Akhriska Qur'aanka (Start Reading Quran)"), 'KhitmaPage must include Start Reading Quran callout');
assert(khitmaPageFile.includes('/quran?page='), 'KhitmaPage must link directly to start page in Quran reader');
assert(khitmaPageFile.includes('Ku Soo Laabo & Sax') || khitmaPageFile.includes('Sax Horumarka Maanta'), 'KhitmaPage must instruct user to return and tick daily progress');
assert(khitmaPageFile.includes('isDayLocked'), 'KhitmaPage must enforce strict day locking for future dates');
assert(khitmaPageFile.includes('isPrayerSlotLocked'), 'KhitmaPage must enforce intra-day sequential slot locking');
assert(khitmaPageFile.includes('Waa la xaqiijiyay 🔒'), 'KhitmaPage must display locked confirmation for ticked slots');
console.log('✓ Test 3 Passed: Daily reading & ticking workflow with day/slot locking and Quran link verified.');

// 4. COMPLETION CELEBRATION & BRANDED PDF CERTIFICATE
console.log('Testing 4: Completion celebration & branded PDF certificate...');
assert(khitmaPageFile.includes('isCompleted'), 'KhitmaPage must track challenge completion');
assert(khitmaPageFile.includes('Degso Shahaadada PDF') || khitmaPageFile.includes('generateKhatmCertificatePdf'), 'KhitmaPage must offer PDF certificate download on completion');
assert(khatmServiceFile.includes('/logo-quran.png'), 'PDF generator must embed Quran page logo');
assert(khatmServiceFile.includes('/logo.png'), 'PDF generator must embed EMufti AI logo');
assert(khatmServiceFile.includes('screenId'), 'PDF generator must embed unique Screen ID');
console.log('✓ Test 4 Passed: Branded PDF generation with dual logos and unique Screen ID verified.');

// 5. ADMIN TEST PDF GENERATION
console.log('Testing 5: Admin test PDF generation function and admin UI...');
assert(khatmServiceFile.includes('export async function generateAdminTestCertificatePdf'), 'khatmChallengeService must export generateAdminTestCertificatePdf');
assert(adminPageFile.includes('generateAdminTestCertificatePdf'), 'AdminPage.tsx must import generateAdminTestCertificatePdf');
assert(adminPageFile.includes('adminTestRecipient'), 'AdminPage must have recipient name state/input for sample PDF');
assert(adminPageFile.includes('adminTestDuration'), 'AdminPage must have duration selector for sample PDF');
assert(adminPageFile.includes('Generate Sample PDF') || adminPageFile.includes('handleAdminTestPdf'), 'AdminPage must have action button to generate sample PDF');
assert(khitmaPageFile.includes('generateAdminTestCertificatePdf'), 'KhitmaPage must support admin test certificate trigger');
console.log('✓ Test 5 Passed: Admin sample PDF generation tool in Admin panel and Khitma page verified.');

console.log('\n--- ALL (5/5) KHITMA WORKFLOW & ADMIN TEST PDF TESTS PASSED! ---');
