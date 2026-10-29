import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

console.log('========================================================================');
console.log('EMUFTI AI: CHAT PAGE BLUE & WHITE REDESIGN VERIFICATION TESTS');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  ✗ [FAIL] ${name}`);
    console.log(`     Error: ${err.message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. Color Palette & Theme (Blue & White)
// -----------------------------------------------------------------------------
console.log('--- 1. Color Palette & Theme (Blue & White) ---');

const chatPageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/ChatPage.tsx'), 'utf8');
const sidebarSrc = fs.readFileSync(path.join(rootDir, 'src/components/layout/Sidebar.tsx'), 'utf8');
const headerSrc = fs.readFileSync(path.join(rootDir, 'src/components/layout/Header.tsx'), 'utf8');
const welcomeSrc = fs.readFileSync(path.join(rootDir, 'src/components/chat/WelcomeScreen.tsx'), 'utf8');
const composerSrc = fs.readFileSync(path.join(rootDir, 'src/components/chat/MessageComposer.tsx'), 'utf8');
const messageSrc = fs.readFileSync(path.join(rootDir, 'src/components/chat/ChatMessage.tsx'), 'utf8');
const indexCssSrc = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');

runTest('Chat canvas uses soft cool gray/white (bg-slate-50)', () => {
  assert.ok(chatPageSrc.includes('bg-slate-50'), 'ChatPage must use bg-slate-50 canvas');
});

runTest('Sidebar uses crisp white background (bg-white)', () => {
  assert.ok(sidebarSrc.includes('bg-white'), 'Sidebar must use bg-white background');
});

runTest('Header uses sticky white with backdrop blur (bg-white/95 backdrop-blur-md)', () => {
  assert.ok(headerSrc.includes('bg-white/95 backdrop-blur-md'), 'Header must be white with backdrop blur');
});

runTest('Typography uses deep slate headings and muted slate subtitles', () => {
  assert.ok(welcomeSrc.includes('text-slate-900'), 'Headings must use text-slate-900');
  assert.ok(welcomeSrc.includes('text-slate-500'), 'Subtitles must use text-slate-500');
});

// -----------------------------------------------------------------------------
// 2. Left Sidebar Cleanup (Remove All Navigations)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Left Sidebar Cleanup (Remove All Navigations) ---');

runTest('Top Navigation / Islamic Hub block is completely removed', () => {
  assert.ok(!sidebarSrc.includes('Islamic Hub'), 'Islamic Hub must be deleted');
  assert.ok(!sidebarSrc.includes("to: '/quran'"), 'Quran 114 link must be deleted from sidebar');
  assert.ok(!sidebarSrc.includes("tab=50qaris"), '50 Qurra link must be deleted from sidebar');
  assert.ok(!sidebarSrc.includes("tab=tafsir"), 'Tafsiir link must be deleted from sidebar');
  assert.ok(!sidebarSrc.includes("tab=duas"), 'Dua & Tasbeeh link must be deleted from sidebar');
});

runTest('Bottom Navigation block below search bar is completely removed', () => {
  assert.ok(!sidebarSrc.includes('Qur\'aanka Kariimka & Tafsiir'), 'Secondary Quran link must be deleted');
  assert.ok(!sidebarSrc.includes('Explore Topics'), 'Explore Topics must be deleted from sidebar');
});

runTest('Essential Chat Elements: Top Brand Header with blue logo and title', () => {
  assert.ok(sidebarSrc.includes('EMufti'), 'Must include brand name');
  assert.ok(sidebarSrc.includes('bg-blue-600'), 'Must include royal blue brand element');
});

runTest('Essential Chat Elements: Full-width + Wadahadal Cusub button with blue gradient', () => {
  assert.ok(
    sidebarSrc.includes('bg-gradient-to-r from-blue-600 to-indigo-600') ||
    sidebarSrc.includes('from-blue-600 to-indigo-600'),
    'New Chat button must use modern blue gradient'
  );
  assert.ok(sidebarSrc.includes('+ Wadahadal Cusub'), 'Must display + Wadahadal Cusub label');
});

runTest('Essential Chat Elements: Clean Search chats... input field', () => {
  assert.ok(sidebarSrc.includes('Search chats...'), 'Must contain Search chats... input placeholder');
  assert.ok(sidebarSrc.includes('bg-slate-100'), 'Search input must use bg-slate-100');
  assert.ok(sidebarSrc.includes('focus:border-blue-500'), 'Search input must focus with blue border');
});

runTest('Essential Chat Elements: Dedicated middle scrollable area for chat history', () => {
  assert.ok(sidebarSrc.includes('flex-1 overflow-y-auto'), 'Must have dedicated flex-1 overflow-y-auto history area');
  assert.ok(sidebarSrc.includes('renderConversationItem'), 'Must render user conversation history items');
});

runTest('Essential Chat Elements: Bottom user profile footer with avatar and online status', () => {
  assert.ok(sidebarSrc.includes('UserAvatar') || sidebarSrc.includes('rawUsername'), 'Must render user profile');
  assert.ok(sidebarSrc.includes('Online'), 'Must show Online indicator');
  assert.ok(sidebarSrc.includes('bg-blue-600'), 'Online indicator must be royal blue');
});

// -----------------------------------------------------------------------------
// 3. Main Hero Section & Animated Suggestion Cards
// -----------------------------------------------------------------------------
console.log('\n--- 3. Main Hero Section & Animated Suggestion Cards ---');

runTest('Header bar displays pulsing blue online indicator', () => {
  assert.ok(headerSrc.includes('bg-blue-600') && headerSrc.includes('animate-ping'), 'Online indicator must pulse with blue ping');
});

runTest('Header bar displays language dropdown (Auto) and user avatar (K)', () => {
  assert.ok(headerSrc.includes('<option value="auto">Auto</option>'), 'Must provide Auto language option');
  assert.ok(headerSrc.includes('UserAvatar'), 'Must render user avatar in header');
});

runTest('Center Hero Header: Central rounded blue icon with continuous floatSlow animation', () => {
  assert.ok(welcomeSrc.includes('bg-blue-600'), 'Hero icon container must be bg-blue-600');
  assert.ok(welcomeSrc.includes('animate-float-slow'), 'Hero icon must use animate-float-slow');
  assert.ok(indexCssSrc.includes('@keyframes floatSlow'), 'floatSlow keyframes must be declared in CSS');
});

runTest('Main Heading: Maxaad jeclaan lahayd inaad ka ogaato diinta Islaamka? with blue highlight', () => {
  assert.ok(welcomeSrc.includes('Maxaad jeclaan lahayd inaad ka ogaato'), 'Must contain exact heading start');
  assert.ok(welcomeSrc.includes('text-blue-600') && welcomeSrc.includes('diinta Islaamka?'), 'Must highlight diinta Islaamka? in text-blue-600');
});

runTest('Subheading matches exact Islamic knowledge copy', () => {
  assert.ok(
    welcomeSrc.includes('EMufti AI waxay ku siinaysaa aqoon diini ah oo sax ah adigoo adeegsanaya Qur\'aanka Kariimka ah, Sunnada suubban, iyo ilo la hubiyay.'),
    'Must display exact subheading text'
  );
});

runTest('2x2 Animated Prompt Cards Grid: 2-column responsive layout without overlapping', () => {
  assert.ok(welcomeSrc.includes('grid-cols-1 md:grid-cols-2'), 'Must use 2-column grid on desktop');
  assert.ok(welcomeSrc.includes('max-w-3xl'), 'Must bound max-width to max-w-3xl');
  assert.ok(welcomeSrc.includes('mb-8') || welcomeSrc.includes('mb-12'), 'Must provide generous bottom margin to prevent overlap');
});

runTest('Card 1: Macnaha Suuratul Faatixa', () => {
  assert.ok(welcomeSrc.includes('Macnaha Suuratul Faatixa'), 'Card 1 title must match');
  assert.ok(welcomeSrc.includes('Waa maxay macnaha Suuratul Faatixa iyo dulucdeeda guud?'), 'Card 1 prompt must match');
});

runTest('Card 2: Sida Loo Tukado Salaadda', () => {
  assert.ok(welcomeSrc.includes('Sida Loo Tukado Salaadda'), 'Card 2 title must match');
  assert.ok(welcomeSrc.includes('Sidee loo tukadaa salaadda, maxayse yihiin shuruudaha iyo tiirarka salaadda?'), 'Card 2 prompt must match');
});

runTest('Card 3: Waxyaabaha Buriya Waysada', () => {
  assert.ok(welcomeSrc.includes('Waxyaabaha Buriya Waysada'), 'Card 3 title must match');
  assert.ok(welcomeSrc.includes('Maxay yihiin waxyaabaha buriya waysada ee waajibka ka dhiga in la cusboonaysiiyo?'), 'Card 3 prompt must match');
});

runTest('Card 4: Tafsiirka Suuratul Ikhlaas', () => {
  assert.ok(welcomeSrc.includes('Tafsiirka Suuratul Ikhlaas'), 'Card 4 title must match');
  assert.ok(welcomeSrc.includes('Sharaxaad kooban iyo tafsiir ku saabsan Suuratul Ikhlaas iyo fadligeeda.'), 'Card 4 prompt must match');
});

runTest('Card Styling & Micro-interactions: bg-white, border-slate-200, hover elevation & sliding arrow', () => {
  assert.ok(welcomeSrc.includes('bg-white'), 'Cards must have white background');
  assert.ok(welcomeSrc.includes('border-slate-200'), 'Cards must have crisp slate-200 border');
  assert.ok(welcomeSrc.includes('rounded-2xl'), 'Cards must be rounded-2xl');
  assert.ok(welcomeSrc.includes('bg-blue-50 text-blue-600'), 'Left badge must be bg-blue-50 text-blue-600');
  assert.ok(welcomeSrc.includes('hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-400'), 'Cards must elevate on hover');
  assert.ok(welcomeSrc.includes('group-hover:bg-blue-600 group-hover:text-white'), 'Badge must transition to solid blue on hover');
  assert.ok(welcomeSrc.includes('ArrowRight'), 'Must render sliding arrow on hover');
  assert.ok(welcomeSrc.includes('animate-fade-in-up'), 'Cards must use fadeInUp entrance animation');
});

// -----------------------------------------------------------------------------
// 4. Bottom Quick Chips & Chat Input Bar
// -----------------------------------------------------------------------------
console.log('\n--- 4. Bottom Quick Chips & Chat Input Bar ---');

runTest('Quick Suggestion Pills rendered above input bar in white and blue', () => {
  assert.ok(composerSrc.includes("Faa'iidada Quraanka kale?"), 'Chip 1 must match');
  assert.ok(composerSrc.includes("Sidee ku xifdi karaa?"), 'Chip 2 must match');
  assert.ok(composerSrc.includes("Aayado ku saabsan sabarka"), 'Chip 3 must match');
  assert.ok(composerSrc.includes("Shuruudaha weysada"), 'Chip 4 must match');
  assert.ok(composerSrc.includes('bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white'), 'Chips must be styled in white and blue');
});

runTest('Prompt Input Box: Pill-shaped white container with blue focus ring', () => {
  assert.ok(composerSrc.includes('bg-white border border-slate-300 rounded-full shadow-md'), 'Must be a pill-shaped container');
  assert.ok(composerSrc.includes('focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'), 'Must have blue focus ring');
});

runTest('Prompt Input Box: Attachment (+), Microphone, and Circular Blue Send button', () => {
  assert.ok(composerSrc.includes('<Plus'), 'Must include attachment plus button');
  assert.ok(composerSrc.includes('<Mic'), 'Must include voice microphone button');
  assert.ok(composerSrc.includes('Weydii EMufti AI...'), 'Must have Weydii EMufti AI... placeholder');
  assert.ok(composerSrc.includes('bg-blue-600 hover:bg-blue-700 text-white'), 'Send button must be circular royal blue');
});

runTest('Disclaimer Text: Centered muted footer text', () => {
  assert.ok(
    composerSrc.includes('EMufti AI can make mistakes. Please verify important information.'),
    'Must display exact disclaimer text'
  );
  assert.ok(composerSrc.includes('text-center text-slate-400'), 'Disclaimer must be centered and muted slate');
});

// -----------------------------------------------------------------------------
// 5. Chat Messages (Blue & White Palette)
// -----------------------------------------------------------------------------
console.log('\n--- 5. Chat Messages Styling ---');

runTest('User messages styled with soft blue bubble and CheckCheck icon', () => {
  assert.ok(messageSrc.includes('bg-blue-50'), 'User messages must use soft blue bubble');
  assert.ok(messageSrc.includes('text-blue-600'), 'CheckCheck icon must be royal blue');
  assert.ok(!messageSrc.includes('to={`/quran?'), 'Broken quran links must be removed from ChatMessage');
});

runTest('Assistant messages styled with clean white card and blue emblem', () => {
  assert.ok(messageSrc.includes('bg-white border border-slate-200'), 'Assistant card must be white with slate border');
  assert.ok(messageSrc.includes('bg-blue-600 text-white'), 'Assistant emblem must be royal blue');
});

console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nALL CHAT PAGE BLUE & WHITE REDESIGN TESTS PASSED WITH 100% SUCCESS!');
}
