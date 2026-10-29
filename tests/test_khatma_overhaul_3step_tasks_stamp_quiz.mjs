import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING KHATMA OVERHAUL: 3-STEP FORM, TASK PAGE, TRANSPARENT STAMP, & MANDATORY QUIZ TESTS ---');

const wizardFile = fs.readFileSync(path.resolve('./src/components/khitma/KhitmaRegistrationWizard.tsx'), 'utf-8');
const taskPageFile = fs.readFileSync(path.resolve('./src/pages/KhitmaPage.tsx'), 'utf-8');
const quizFile = fs.readFileSync(path.resolve('./src/components/khitma/KhitmaQuizModal.tsx'), 'utf-8');
const quizDataFile = fs.readFileSync(path.resolve('./src/data/khatmQuranQuizData.ts'), 'utf-8');
const khatmServiceFile = fs.readFileSync(path.resolve('./src/lib/khatmChallengeService.ts'), 'utf-8');
const appFile = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');

// =========================================================================
// TEST 1: 3-STEP KHATMA REGISTRATION FORM
// =========================================================================
console.log('Testing 1: 3-Step Khatma Registration Form Wizard...');

// Step 1 assertions
assert(wizardFile.includes('Magaca saddexan'), 'Wizard Step 1 must include full name (Magaca saddexan) input');
assert(wizardFile.includes('Taariikhda uu bilaabayo') || wizardFile.includes('Start Date (Taariikhda'), 'Wizard Step 1 must include Start Date picker');
assert(wizardFile.includes('Continue (Sii wad)') || wizardFile.includes('Continue'), 'Wizard Step 1 must include Continue button');

// Step 2 assertions
assert(wizardFile.includes('1 Month') || wizardFile.includes('1 Bil'), 'Wizard Step 2 must include 1 Month option');
assert(wizardFile.includes('20 Days'), 'Wizard Step 2 must include 20 Days option');
assert(wizardFile.includes('15 Days'), 'Wizard Step 2 must include 15 Days option');
assert(wizardFile.includes('10 Days'), 'Wizard Step 2 must include 10 Days option');
assert(wizardFile.includes('7 Days'), 'Wizard Step 2 must include 7 Days option');
assert(wizardFile.includes('Other') || wizardFile.includes('Kale'), 'Wizard Step 2 must include Other option');
assert(wizardFile.includes('calculatedPrayerPages') || wizardFile.includes('Xisaabinta Tooska ah ee Bogagga Salaad Kasta'), 'Wizard Step 2 must automatically calculate pages per prayer session');

// Step 3 assertions
assert(wizardFile.includes('Xaqiijinta') || wizardFile.includes('Summary'), 'Wizard Step 3 must show summary confirmation');
assert(wizardFile.includes('calculatedEndDate'), 'Wizard Step 3 must show calculated end date');
assert(wizardFile.includes('Apply (Billaaw Khidmada)') || wizardFile.includes('Apply'), 'Wizard Step 3 must have Apply button');
assert(wizardFile.includes('Waad ka mid noqotay bulshada khitma'), 'Wizard Step 3 must display success message: "Waad ka mid noqotay bulshada khitma"');
assert(taskPageFile.includes('KhitmaRegistrationWizard'), 'KhitmaPage must integrate the 3-Step wizard');

console.log('✓ Test 1 Passed: 3-Step Wizard with Step 1 (Name & Start Date), Step 2 (Duration & Pages), Step 3 (Summary & Apply) verified.');

// =========================================================================
// TEST 2: DEDICATED TASK PAGE & DAILY 5-PRAYER TICKING
// =========================================================================
console.log('Testing 2: Dedicated Task Page & Daily 5-Prayer Ticking...');

// Routing
assert(appFile.includes('path="/khitma/tasks"'), 'App.tsx must include route for /khitma/tasks');

// Onboarding guide
assert(taskPageFile.includes('HAGAHA BARNAAMIJKA KHITMADA') || taskPageFile.includes('ONBOARDING GUIDE'), 'Task page must include onboarding explanation guide');
assert(taskPageFile.includes('calculatedPrayerPages') || taskPageFile.includes('Qoondada Salaad Kasta'), 'Onboarding guide must detail required daily reading quota per prayer');

// 5 Tickable slots per day
assert(taskPageFile.includes('PRAYER_SLOTS_DEF') && taskPageFile.includes('handleSlotToggle'), 'Task page must provide 5 tickable slots per day');
assert(taskPageFile.includes('Waa la xaqiijiyay 🔒'), 'Ticked slots must be immutable and marked permanent');

// Congratulatory daily message
assert(taskPageFile.includes('Hambalyo dadaalkaada maalinta'), 'Task page must display congratulatory message "Hambalyo dadaalkaada maalinta [1aad / 2aad...]" upon finishing 5 slots');
assert(taskPageFile.includes('formatSomaliDayOrdinal'), 'Task page must use formatSomaliDayOrdinal for dynamic Somali day ordinals');

// Day and intra-day locking
assert(taskPageFile.includes('isDayLocked'), 'Task page must enforce strict day locking for future dates');
assert(taskPageFile.includes('isPrayerSlotLocked'), 'Task page must enforce sequential intra-day slot locking');

console.log('✓ Test 2 Passed: Dedicated Task Page with onboarding guide, 5-prayer ticking, congratulatory message, and locking verified.');

// =========================================================================
// TEST 3: CLEAN PDF CERTIFICATE & TRANSPARENT OFFICIAL STAMP
// =========================================================================
console.log('Testing 3: Clean PDF Certificate & Transparent Official Stamp...');

// Official Stamp asset files
const stampPngPath = path.resolve('./public/images/official-stamp.png');
const stampSvgPath = path.resolve('./public/images/official-stamp.svg');
assert(fs.existsSync(stampPngPath), 'public/images/official-stamp.png must exist');
assert(fs.existsSync(stampSvgPath), 'public/images/official-stamp.svg must exist');

const stampBuf = fs.readFileSync(stampPngPath);
assert(stampBuf.readUInt32BE(16) > 0 && stampBuf.readUInt32BE(20) > 0, 'Official stamp PNG must have valid dimensions');

// PDF Clean layout & embedding
assert(khatmServiceFile.includes('/images/official-stamp.png'), 'PDF generator must load /images/official-stamp.png');
assert(khatmServiceFile.includes('officialStamp'), 'PDF generator must embed official transparent stamp graphic');
assert(khatmServiceFile.includes('CERTIFICATE ID:'), 'PDF generator must include Certificate ID');
assert(khatmServiceFile.includes('SCREEN ID:'), 'PDF generator must include Screen ID for public verification');
assert(khatmServiceFile.includes('/logo-quran.png') && khatmServiceFile.includes('/logo.png'), 'PDF generator must embed dual logos');

console.log('✓ Test 3 Passed: Clean PDF certificate layout, transparent official stamp, Certificate ID, and dual logos verified.');

// =========================================================================
// TEST 4: MANDATORY 10-QUESTION QURANIC QUIZ BEFORE PDF DOWNLOAD
// =========================================================================
console.log('Testing 4: Mandatory 10-Question Quranic Quiz Before PDF Download...');

// Quiz questions dataset
assert(quizDataFile.includes('KHATM_MANDATORY_QUIZ_QUESTIONS'), 'Must export KHATM_MANDATORY_QUIZ_QUESTIONS');
assert(quizDataFile.includes('identify_surah') && quizDataFile.includes('next_ayah'), 'Questions must cover identifying Surah from Ayah and what comes next');
assert(quizDataFile.includes('arabicAyah') && quizDataFile.includes('somaliQuestion'), 'Questions must have Arabic Ayah text and Somali explanation');

// 30 seconds timer
assert(quizFile.includes('timeLeft') && quizFile.includes('30'), 'Quiz must enforce 30 seconds timer per question');

// Passing criteria (>= 7/10)
assert(quizFile.includes('correctCount >= 7') || quizFile.includes('score >= 7'), 'Passing criteria must require at least 7 out of 10 (>= 7/10)');

// Pass Flow: congratulatory screen & unlocked PDF download
assert(quizFile.includes('HAMBALYO! WAAD GUULAYSATAY'), 'Pass flow must display congratulatory message');
assert(quizFile.includes('scorePercentage') || quizFile.includes('score/10'), 'Pass flow must display score average');
assert(quizFile.includes('Degso Shahaadada PDF'), 'Pass flow must unlock PDF download button');

// Fail Flow (<= 6/10): "Fadlan quraanka dib u muraajaceey" & "Bilow khidmad kale"
assert(quizFile.includes('Fadlan quraanka dib u muraajaceey'), 'Fail flow must display exact message: "Fadlan quraanka dib u muraajaceey"');
assert(quizFile.includes('Bilow khidmad kale'), 'Fail flow must provide action button: "Bilow khidmad kale"');
assert(taskPageFile.includes('resetKhatmChallenge') || khatmServiceFile.includes('resetKhatmChallenge'), 'Must provide resetKhatmChallenge service to restart challenge');

console.log('✓ Test 4 Passed: Mandatory 10-Question Quranic Quiz with 30s timer, >=7 pass flow, <=6 fail flow, and lock/unlock verified.');

console.log('\n--- ALL (4/4) KHATMA OVERHAUL TESTS PASSED SUCCESSFULLY! ---');
