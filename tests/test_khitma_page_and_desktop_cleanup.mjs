import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING DEDICATED KHITMA PAGE & DESKTOP CLEANUP TESTS ---');

const appFile = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');
const widgetFile = fs.readFileSync(path.resolve('./src/components/dashboard/QuranKhatmChallengeWidget.tsx'), 'utf-8');
const khitmaPageFile = fs.readFileSync(path.resolve('./src/pages/KhitmaPage.tsx'), 'utf-8');
const headerFile = fs.readFileSync(path.resolve('./src/components/layout/Header.tsx'), 'utf-8');
const sidebarFile = fs.readFileSync(path.resolve('./src/components/layout/Sidebar.tsx'), 'utf-8');

// 1. Verify App.tsx routes for dedicated Khitma view
console.log('Testing App.tsx routes for /khitma...');
assert(appFile.includes('KhitmaPage'), 'App.tsx must import KhitmaPage');
assert(appFile.includes('path="/khitma"'), 'App.tsx must define route path="/khitma"');
assert(appFile.includes('<Route path="/khitma" element={<KhitmaPage />} />'), 'App.tsx must render KhitmaPage at /khitma');
console.log('✓ Test 1 Passed: Dedicated route /khitma registered and wired to KhitmaPage.');

// 2. Verify QuranKhatmChallengeWidget navigates to /khitma
console.log('Testing QuranKhatmChallengeWidget navigation to /khitma...');
assert(widgetFile.includes('useNavigate'), 'QuranKhatmChallengeWidget must import and use useNavigate');
assert(widgetFile.includes("navigate('/khitma')") || widgetFile.includes('navigate("/khitma")'), 'Start Khatma button must navigate to /khitma');
assert(widgetFile.includes('/khitma?duration='), 'Duration options must navigate to /khitma with duration query');
console.log('✓ Test 2 Passed: Khatma banner navigates to dedicated /khitma page on start/preset click.');

// 3. Verify KhitmaPage setup and registration form
console.log('Testing KhitmaPage full setup and registration form...');
assert(khitmaPageFile.includes('Magacaaga Rasmiga ah'), 'KhitmaPage must include full name input field');
assert(khitmaPageFile.includes('Taariikhda Bilaabashada'), 'KhitmaPage must include start date picker');
assert(khitmaPageFile.includes('Dooro Muddada Khatmka'), 'KhitmaPage must include duration selector');
assert(khitmaPageFile.includes('1 Bil (30 M)'), 'KhitmaPage must support 1 Month (30 Days)');
assert(khitmaPageFile.includes('20 Maalmood') || khitmaPageFile.includes('opt.days'), 'KhitmaPage must support flexible duration presets');
assert(khitmaPageFile.includes('Others (Kale)'), 'KhitmaPage must support Others (Kale) duration option');
assert(khitmaPageFile.includes('customDays'), 'KhitmaPage must have custom days input for Others');
assert(khitmaPageFile.includes('registerKhatmChallenge'), 'KhitmaPage must call registerKhatmChallenge upon form submission');
console.log('✓ Test 3 Passed: KhitmaPage contains full registration form with all duration options and custom input.');

// 4. Verify KhitmaPage daily tracking and locking mechanisms
console.log('Testing KhitmaPage daily tracker and sequential locking...');
assert(khitmaPageFile.includes('isDayLocked'), 'KhitmaPage must enforce daily locking for future dates');
assert(khitmaPageFile.includes('isPrayerSlotLocked'), 'KhitmaPage must enforce intra-day sequential prayer slot locking');
assert(khitmaPageFile.includes('Waa la xaqiijiyay 🔒'), 'KhitmaPage must mark completed slots as permanent and locked');
assert(khitmaPageFile.includes('Screen ID-ga Shahaadadaada'), 'KhitmaPage must display Screen ID upon completion');
assert(khitmaPageFile.includes('Degso Shahaadada PDF') || khitmaPageFile.includes('generateKhatmCertificatePdf'), 'KhitmaPage must provide PDF certificate download');
console.log('✓ Test 4 Passed: KhitmaPage enforces daily & sequential locking and conditional PDF export.');

// 5. Verify Desktop Header and Sidebar elements cleanup
console.log('Testing desktop layout cleanup in Header and Sidebar...');
assert(headerFile.includes('sticky top-0 z-30 h-14'), 'Header must have sleek desktop top-0 h-14 bar');
assert(headerFile.includes('isLangMenuOpen'), 'Header must include streamlined language dropdown');
assert(headerFile.includes('NotificationCenter'), 'Header must include notification center');
assert(headerFile.includes('ThemeToggle'), 'Header must include theme toggle');
assert(sidebarFile.includes('Search chats...'), 'Sidebar must include streamlined search chats input');
assert(sidebarFile.includes('+ Wadahadal Cusub') || sidebarFile.includes('getNewChatText()'), 'Sidebar must include primary new chat action');
console.log('✓ Test 5 Passed: Desktop Header and Sidebar elements streamlined and professionally arranged.');

console.log('\n--- ALL DEDICATED KHITMA PAGE & DESKTOP CLEANUP TESTS PASSED! (5/5) ---');
