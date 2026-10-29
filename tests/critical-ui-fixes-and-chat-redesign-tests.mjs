import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('========================================================================');
console.log('CRITICAL UI FIXES & CHAT REDESIGN VERIFICATION TESTS');
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

const headerPath = path.resolve('src/components/layout/Header.tsx');
const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
const logoPath = path.resolve('src/components/common/Logo.tsx');
const themeContextPath = path.resolve('src/context/ThemeContext.tsx');
const chatMessagePath = path.resolve('src/components/chat/ChatMessage.tsx');
const chatPagePath = path.resolve('src/pages/ChatPage.tsx');
const composerPath = path.resolve('src/components/chat/MessageComposer.tsx');

const headerCode = fs.readFileSync(headerPath, 'utf8');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
const logoCode = fs.readFileSync(logoPath, 'utf8');
const themeContextCode = fs.readFileSync(themeContextPath, 'utf8');
const chatMessageCode = fs.readFileSync(chatMessagePath, 'utf8');
const chatPageCode = fs.readFileSync(chatPagePath, 'utf8');
const composerCode = fs.readFileSync(composerPath, 'utf8');

// --- SECTION 1: LANGUAGE ICON DROPDOWN / MODAL (3 LANGUAGES) ---
console.log('--- Section 1: Language Icon Dropdown / Modal (3 Languages) ---');

runTest('1.1 Header has minimalist Globe language icon button', () => {
  assert(headerCode.includes('<Globe'), 'Header must contain Globe icon');
  assert(headerCode.includes('aria-label="Select response language"'), 'Language button must have proper aria-label');
  assert(headerCode.includes('setIsLangMenuOpen'), 'Language button must toggle isLangMenuOpen state');
});

runTest('1.2 Language options contain 3 languages: Somali, Arabic, English', () => {
  assert(headerCode.includes("code: 'so', label: 'Somali', nativeName: 'Soomaali'"), 'Must include Somali language option');
  assert(headerCode.includes("code: 'ar', label: 'Arabic', nativeName: 'العربية'"), 'Must include Arabic language option');
  assert(headerCode.includes("code: 'en', label: 'English', nativeName: 'English'"), 'Must include English language option');
});

runTest('1.3 Language selection calls both setLanguage and setTargetLanguage', () => {
  assert(headerCode.includes('await setLanguage(item.code)'), 'Selecting language must call setLanguage');
  assert(headerCode.includes('setTargetLanguage(item.code)'), 'Selecting language must call setTargetLanguage');
});

runTest('1.4 Header has overflow-visible so dropdown menu is not clipped', () => {
  assert(headerCode.includes('overflow-visible'), 'Header must have overflow-visible for dropdown visibility');
  assert(headerCode.includes('z-[100]'), 'Dropdown menu must have high z-index (z-[100])');
});

// --- SECTION 2: DARK / LIGHT MODE TOGGLE ---
console.log('\n--- Section 2: Dark / Light Mode Toggle ---');

runTest('2.1 ThemeContext synchronously toggles dark class on documentElement', () => {
  assert(themeContextCode.includes("root.classList.add('dark')") && themeContextCode.includes("root.classList.remove('dark')"), 'ThemeContext must synchronously apply dark class');
  assert(themeContextCode.includes('root.style.colorScheme'), 'ThemeContext must set colorScheme style');
  assert(themeContextCode.includes('setResolvedTheme'), 'ThemeContext must update resolvedTheme state');
});

runTest('2.2 Header includes ThemeToggle and dark mode styling', () => {
  assert(headerCode.includes('<ThemeToggle />'), 'Header must contain ThemeToggle component');
  assert(headerCode.includes('dark:bg-slate-900'), 'Header must have dark background class');
  assert(headerCode.includes('dark:border-slate-800'), 'Header must have dark border class');
});

runTest('2.3 Key surfaces (Sidebar, ChatPage, Composer, ChatMessage) support dark mode classes', () => {
  assert(sidebarCode.includes('dark:bg-slate-900'), 'Sidebar must have dark background styling');
  assert(chatPageCode.includes('dark:bg-slate-950'), 'ChatPage must have dark background styling');
  assert(composerCode.includes('dark:bg-slate-900'), 'MessageComposer must have dark background styling');
  assert(chatMessageCode.includes('dark:text-slate-100'), 'ChatMessage must have dark text styling');
});

// --- SECTION 3: CHAT INTERFACE REDESIGN (CHATGPT STYLE) ---
console.log('\n--- Section 3: Chat Interface Redesign (ChatGPT Style) ---');

runTest('3.1 AI response container removes heavy card box (bg-white border rounded-3xl p-4 sm:p-6)', () => {
  // Check that the old card wrapper is completely eliminated
  assert(!chatMessageCode.includes('bg-white border border-slate-200/80 shadow-xs rounded-3xl p-4 sm:p-6'), 'Enclosing card box for assistant message must be removed');
  assert(chatMessageCode.includes('Main Assistant Body (Clean ChatGPT conversational flow without heavy card box)'), 'Assistant container must be unboxed ChatGPT style');
  assert(chatMessageCode.includes('flex-1 min-w-0 space-y-3.5 pt-0.5'), 'Assistant message body must flow directly into flex container');
});

runTest('3.2 User message is styled in clean ChatGPT bubble style', () => {
  assert(chatMessageCode.includes('bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'), 'User message bubble must have sleek slate background and proper text colors');
  assert(chatMessageCode.includes('rounded-3xl rounded-br-md'), 'User bubble must have clean modern rounded corners');
});

runTest('3.3 Assistant displays sleek blue avatar emblem and clean action bar', () => {
  assert(chatMessageCode.includes('w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600'), 'Assistant must have circular blue emblem');
  assert(chatMessageCode.includes('Action Bar (ChatGPT-style subtle toolbar below response)'), 'Action bar must be clean subtle toolbar');
});

// --- SECTION 4: BRAND NAME COLOR TO BLUE ---
console.log('\n--- Section 4: Brand Name Color to Vibrant Blue ---');

runTest('4.1 Header brand title uses vibrant blue', () => {
  assert(headerCode.includes('text-blue-600 dark:text-blue-500'), 'Header EMufti AI title must use text-blue-600 dark:text-blue-500');
  assert(headerCode.includes('EMufti') && headerCode.includes('AI'), 'Header must render EMufti AI');
});

runTest('4.2 Sidebar brand title uses vibrant blue', () => {
  assert(sidebarCode.includes('text-blue-600 dark:text-blue-500'), 'Sidebar EMufti AI title must use text-blue-600 dark:text-blue-500');
  assert(sidebarCode.includes('EMufti AI'), 'Sidebar must render EMufti AI');
});

runTest('4.3 Logo component uses vibrant blue', () => {
  assert(logoCode.includes('text-blue-600 dark:text-blue-500'), 'Logo component must use text-blue-600 dark:text-blue-500');
});

// --- SECTION 5: WHITE + BLUE MIXTURE THEME & TEXT CONTRAST ---
console.log('\n--- Section 5: White + Blue Mixture Theme & Text Contrast ---');

const welcomeScreenPath = path.resolve('src/components/chat/WelcomeScreen.tsx');
const welcomeScreenCode = fs.readFileSync(welcomeScreenPath, 'utf8');

runTest('5.1 Default theme initializes to light (clean White + Blue mixture aesthetic)', () => {
  assert(themeContextCode.includes("root.classList.remove('dark')"), 'Initial theme must remove dark class by default');
  assert(themeContextCode.includes("activeTheme = 'light'"), 'Default active theme must be light');
});

runTest('5.2 WelcomeScreen has high-contrast text and clean card mixture', () => {
  assert(welcomeScreenCode.includes('text-slate-600 dark:text-slate-300 font-medium'), 'WelcomeScreen must use high-contrast text');
  assert(welcomeScreenCode.includes('text-blue-600'), 'WelcomeScreen must feature vibrant blue accents');
});

runTest('5.3 MessageComposer placeholder and hints have strong contrast', () => {
  assert(composerCode.includes('placeholder:text-slate-500'), 'Composer must have high contrast placeholder');
  assert(composerCode.includes('text-slate-500 dark:text-slate-400 font-medium'), 'Composer disclaimer must be clearly legible');
});

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('========================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
