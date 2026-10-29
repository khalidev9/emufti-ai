import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('========================================================================');
console.log('COMPREHENSIVE UI UPDATES & RAMADAN BUNDLE VERIFICATION TESTS');
console.log('========================================================================\n');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failedCount++;
  }
}

const chatMessagePath = path.resolve('src/components/chat/ChatMessage.tsx');
const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
const referencePanelPath = path.resolve('src/components/layout/ReferencePanel.tsx');
const landingPagePath = path.resolve('src/pages/LandingPage.tsx');
const ramadanBannerPath = path.resolve('src/components/chat/RamadanOfferBanner.tsx');
const chatPagePath = path.resolve('src/pages/ChatPage.tsx');

const chatMessageCode = fs.readFileSync(chatMessagePath, 'utf8');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
const referencePanelCode = fs.readFileSync(referencePanelPath, 'utf8');
const landingPageCode = fs.readFileSync(landingPagePath, 'utf8');
const ramadanBannerCode = fs.readFileSync(ramadanBannerPath, 'utf8');
const chatPageCode = fs.readFileSync(chatPagePath, 'utf8');

// --- SECTION 1: REMOVE MESSAGE TICKS ---
console.log('--- Section 1: Remove Message Ticks (CheckMarks) ---');

runTest('1.1 ChatMessage does not render CheckCheck tick marks in message cards', () => {
  assert(!chatMessageCode.includes('<CheckCheck'), 'ChatMessage must NOT contain <CheckCheck /> component');
  assert(!chatMessageCode.includes('CheckCheck,'), 'ChatMessage must NOT import CheckCheck');
});

runTest('1.2 User message shows clean timestamp without tick indicators', () => {
  assert(chatMessageCode.includes('formatMessageTime(message.created_at)'), 'Message must retain clean timestamp');
});

// --- SECTION 2: DARK MODE FOR SIDEBAR & SIDE PANELS ---
console.log('\n--- Section 2: Dark Mode for Side Panels and Sidebar ---');

runTest('2.1 Sidebar has comprehensive dark mode background and border classes', () => {
  assert(sidebarCode.includes('dark:bg-slate-900'), 'Sidebar must use dark:bg-slate-900');
  assert(sidebarCode.includes('dark:border-slate-800'), 'Sidebar must use dark:border-slate-800');
  assert(sidebarCode.includes('dark:text-slate-100') || sidebarCode.includes('dark:text-white'), 'Sidebar must have dark text styling');
});

runTest('2.2 Sidebar bottom navigation and user profile support dark mode', () => {
  assert(sidebarCode.includes('dark:bg-slate-900/90'), 'Sidebar navigation area must have dark mode classes');
  assert(sidebarCode.includes('dark:bg-slate-850'), 'Sidebar nav buttons must have dark mode card styles');
});

runTest('2.3 ReferencePanel has full dark mode classes across shell and inner cards', () => {
  assert(referencePanelCode.includes('dark:bg-slate-900'), 'ReferencePanel must use dark:bg-slate-900');
  assert(referencePanelCode.includes('dark:border-slate-800'), 'ReferencePanel must use dark:border-slate-800');
  assert(referencePanelCode.includes('dark:text-slate-100') || referencePanelCode.includes('dark:text-white'), 'ReferencePanel must use dark text');
});

// --- SECTION 3: REDESIGN ISLAMIC REFERENCES & SOURCES MODAL ---
console.log('\n--- Section 3: Redesign Islamic References & Sources Modal ---');

runTest('3.1 ReferencePanel features elegant verified header with BookOpen emblem', () => {
  assert(referencePanelCode.includes('Islamic References & Sources'), 'Must contain panel title');
  assert(referencePanelCode.includes('Verified Quran, Hadith & Scholarly Corpus'), 'Must contain verified subtitle');
});

runTest('3.2 ReferencePanel renders Arabic scripture with calligraphic framing and high contrast', () => {
  assert(referencePanelCode.includes('font-arabic'), 'Arabic scripture must use font-arabic');
  assert(referencePanelCode.includes('dir="rtl"'), 'Arabic scripture must have RTL direction');
  assert(referencePanelCode.includes('Verified Source'), 'Must have verified source pill');
});

runTest('3.3 ReferencePanel includes active citations list and Scholarly Terminology Guide', () => {
  assert(referencePanelCode.includes('Conversation Citations'), 'Must contain conversation citations list');
  assert(referencePanelCode.includes('Scholarly Terminology Guide'), 'Must include terminology guide');
  assert(referencePanelCode.includes('Ikhtilāf'), 'Must explain Ikhtilaf');
  assert(referencePanelCode.includes('Ṣaḥīḥ'), 'Must explain Sahih hadith grading');
});

// --- SECTION 4: REMOVE HEADER NAVIGATION MENUS ---
console.log('\n--- Section 4: Remove Header Navigation Menus (Start Chat & Subcis) ---');

runTest('4.1 LandingPage top navigation removes "Start Chat" link from desktop nav', () => {
  // Grab the desktop nav section between <div className="hidden md:flex items-center gap-6
  const desktopNavMatch = landingPageCode.match(/<div className="hidden md:flex items-center gap-6[^>]*>([\s\S]*?)<\/div>/);
  assert(desktopNavMatch, 'Desktop nav must exist');
  const desktopNav = desktopNavMatch[1];
  assert(!desktopNav.includes('Start Chat'), 'Desktop nav must NOT contain Start Chat link');
  assert(!desktopNav.includes('to="/subcis"'), 'Desktop nav must NOT contain Subcis link');
  assert(desktopNav.includes('Holy Quran'), 'Desktop nav must preserve Holy Quran link');
});

runTest('4.2 LandingPage mobile menu removes "Start Chat" and "Subcis" links', () => {
  const mobileMenuMatch = landingPageCode.match(/\{mobileMenuOpen && \([\s\S]*?<div className="grid grid-cols-1 gap-1[^>]*>([\s\S]*?)<Link\s+to="\/features"/);
  assert(mobileMenuMatch, 'Mobile menu nav section must exist');
  const mobileNav = mobileMenuMatch[1];
  assert(!mobileNav.includes('Start Chat'), 'Mobile nav must NOT contain Start Chat link');
  assert(!mobileNav.includes('to="/subcis"'), 'Mobile nav must NOT contain Subcis link');
});

// --- SECTION 5: RAMADAN BUNDLE MENU & ROTATING BANNER ---
console.log('\n--- Section 5: Ramadan Bundle Menu & Rotating Banner ---');

runTest('5.1 Sidebar contains prominent "Ramadan Bundle" menu item', () => {
  assert(sidebarCode.includes('Ramadan Bundle'), 'Sidebar must contain Ramadan Bundle item');
  assert(sidebarCode.includes('1448 H'), 'Sidebar must contain 1448 H tag');
  assert(sidebarCode.includes('setIsRamadanModalOpen'), 'Sidebar item must trigger Ramadan modal');
});

runTest('5.2 RamadanOfferBanner calculates exact units: Months, Weeks, Days, and Hours until Feb 7, 2027', () => {
  assert(ramadanBannerCode.includes('months: number'), 'Must calculate months');
  assert(ramadanBannerCode.includes('weeks: number'), 'Must calculate weeks');
  assert(ramadanBannerCode.includes('days: number'), 'Must calculate days');
  assert(ramadanBannerCode.includes('hours: number'), 'Must calculate hours');
  assert(ramadanBannerCode.includes('2027-02-07'), 'Target date must be 7 February 2027');
  assert(ramadanBannerCode.includes('Months') && ramadanBannerCode.includes('Weeks') && ramadanBannerCode.includes('Days') && ramadanBannerCode.includes('Hours'), 'Display chips must show Months, Weeks, Days, and Hours');
});

runTest('5.3 RamadanOfferBanner includes Claim Offer button and displays EXACT required message on click', () => {
  assert(ramadanBannerCode.includes('Claim Offer'), 'Banner must have Claim Offer button');
  assert(ramadanBannerCode.includes('Not available this offer. Wait until 7 February 2027.'), 'Modal must contain EXACT required notice string');
});

runTest('5.4 RamadanOfferBanner features automatic rotating slides and is mounted in ChatPage', () => {
  assert(ramadanBannerCode.includes('activeSlide'), 'Banner must have slide rotation mechanism');
  assert(chatPageCode.includes('<RamadanOfferBanner'), 'ChatPage must mount RamadanOfferBanner');
});

runTest('5.5 RamadanOfferBanner schedules launch for 20 January 2027 and hides from current dashboard display position', () => {
  assert(ramadanBannerCode.includes('2027-01-20'), 'Must define 20 January 2027 launch ISO');
  assert(ramadanBannerCode.includes('isRamadanBannerScheduledVisible'), 'Must export isRamadanBannerScheduledVisible');
  assert(chatPageCode.includes('isRamadanBannerScheduledVisible'), 'ChatPage must check isRamadanBannerScheduledVisible');
});

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('========================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
