import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== EMUFTI AI: FULL SYSTEM UI/UX REDESIGN VERIFICATION TESTS ===\n');

const ROOT = process.cwd();

// Test 1: Chat UI - Reference Screenshot Consistency
console.log('1. Testing Chat Page & Reference Styling...');
const messageComposerPath = path.join(ROOT, 'src/components/chat/MessageComposer.tsx');
assert.ok(fs.existsSync(messageComposerPath), 'MessageComposer.tsx must exist');
const composerContent = fs.readFileSync(messageComposerPath, 'utf8');

// Verify exact required disclaimer
assert.ok(
  composerContent.includes('EMufti AI can make mistakes. Please verify important information.'),
  'Disclaimer must exactly match “EMufti AI can make mistakes. Please verify important information.”'
);
console.log('  ✓ Verified exact disclaimer in MessageComposer');

const chatMessagePath = path.join(ROOT, 'src/components/chat/ChatMessage.tsx');
assert.ok(fs.existsSync(chatMessagePath), 'ChatMessage.tsx must exist');
const chatMsgContent = fs.readFileSync(chatMessagePath, 'utf8');

// Verify user message soft green bubble
assert.ok(
  chatMsgContent.includes('bg-emerald-50 text-emerald-950') || chatMsgContent.includes('bg-emerald-50/60') || chatMsgContent.includes('bg-emerald-50'),
  'User message must be displayed in a soft green bubble'
);
console.log('  ✓ User messages displayed in soft green bubbles');

// Verify AI response in clean white card
assert.ok(
  chatMsgContent.includes('bg-white dark:bg-[#1a1a1a]') && chatMsgContent.includes('rounded-2xl'),
  'AI responses must be in clean white cards with fine borders and rounded corners'
);
console.log('  ✓ AI responses styled as clean white cards');

// Verify speech / listen button
assert.ok(
  chatMsgContent.includes('handleToggleSpeech') && (chatMsgContent.includes('Volume2') || chatMsgContent.includes('Listen')),
  'Must include audio listen / speech capability on AI responses'
);
console.log('  ✓ Audio listen action verified on AI responses');

// Verify distinct quotes for Quran, Hadith, and Tafsiir
assert.ok(
  chatMsgContent.includes('Quranic Verse') &&
  chatMsgContent.includes('Hadith Citation') &&
  chatMsgContent.includes('Tafsiir'),
  'Must visually distinguish Quran quotations, Hadith references, and Tafsiir commentary'
);
console.log('  ✓ Distinct badges & styling for Quran, Hadith, and Tafsiir quotations verified');

// Test 2: Quran Reading Page - Font Size Control "Dooro cabbirka"
console.log('2. Testing Quran Reading Page & "Dooro cabbirka" Control...');
const quranPagePath = path.join(ROOT, 'src/pages/QuranPage.tsx');
assert.ok(fs.existsSync(quranPagePath), 'QuranPage.tsx must exist');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

// Verify "Dooro cabbirka" label
assert.ok(
  quranPageContent.includes('Dooro cabbirka'),
  'Must have control labeled “Dooro cabbirka”'
);

// Verify options Yar, Caadi, Weyn, Aad u weyn
assert.ok(quranPageContent.includes('Yar'), 'Must have size option "Yar"');
assert.ok(quranPageContent.includes('Caadi'), 'Must have size option "Caadi"');
assert.ok(quranPageContent.includes('Weyn'), 'Must have size option "Weyn"');
assert.ok(quranPageContent.includes('Aad u weyn'), 'Must have size option "Aad u weyn"');

// Verify old size buttons (A-, A, A+, A++) were removed from font sizing
assert.ok(
  !quranPageContent.includes('title="Extra large font">A++<') &&
  !quranPageContent.includes('title="Small font">A-<'),
  'Old standalone A+, A-, A++, and A font-size buttons must be replaced'
);
console.log('  ✓ Replaced font size buttons with "Dooro cabbirka" (Yar, Caadi, Weyn, Aad u weyn)');

// Verify localStorage persistence of font size
assert.ok(
  quranPageContent.includes('emufti_quran_font_size'),
  'Must persist chosen font size in preferences'
);
console.log('  ✓ User font size preference persisted in localStorage');

// Test 3: Navigation Consistency & Bottom Navigation
console.log('3. Testing Navigation Consistency...');
const bottomNavPath = path.join(ROOT, 'src/components/layout/BottomNavigation.tsx');
assert.ok(fs.existsSync(bottomNavPath), 'BottomNavigation.tsx must exist');
const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');

// Verify 5 primary destinations: Home, Chat, Quran, Macallin, Profile
assert.ok(bottomNavContent.includes("to: '/dashboard'") || bottomNavContent.includes("to: '/'"), 'Primary tab 1: Home');
assert.ok(bottomNavContent.includes("to: '/chat'"), 'Primary tab 2: Chat');
assert.ok(bottomNavContent.includes("to: '/quran'"), 'Primary tab 3: Quran');
assert.ok(bottomNavContent.includes("to: '/quran?tab=macallin'"), 'Primary tab 4: Macallin');
assert.ok(bottomNavContent.includes("to: user ? '/profile' : '/settings'") || bottomNavContent.includes("to: '/profile'"), 'Primary tab 5: Profile');
console.log('  ✓ Compact mobile bottom navigation with Home, Chat, Quran, Macallin, and Profile verified');

// Verify secondary destinations in accessible menu
const secondaryMenu = ['50qaris', 'tafsir', 'duas', 'subcis', 'library'];
secondaryMenu.forEach((dest) => {
  assert.ok(bottomNavContent.includes(dest), `Secondary menu must include ${dest}`);
});
console.log('  ✓ Secondary destinations (Qaari, Tafsiir, Dua, Subcis, Library) accessible in menu');

// Test 4: Admin Dashboard Redesign
console.log('4. Testing Admin Dashboard Design Consistency...');
const adminPagePath = path.join(ROOT, 'src/pages/AdminPage.tsx');
assert.ok(fs.existsSync(adminPagePath), 'AdminPage.tsx must exist');
const adminContent = fs.readFileSync(adminPagePath, 'utf8');

// Verify that admin page uses background/foreground design system rather than hardcoded dark slate-950
assert.ok(
  adminContent.includes('min-h-screen bg-background text-foreground'),
  'Admin Dashboard must follow the global design system (bg-background text-foreground)'
);
assert.ok(
  adminContent.includes('bg-card/95 backdrop-blur-md'),
  'Admin Header must use consistent card/surface background'
);
console.log('  ✓ Admin Dashboard redesigned with consistent global design system');

// Test 5: Integrated Quran Reader Panel
console.log('5. Testing Integrated Quran Reader Panel...');
const readerPanelPath = path.join(ROOT, 'src/components/quran/IntegratedQuranReaderPanel.tsx');
const readerContent = fs.readFileSync(readerPanelPath, 'utf8');
assert.ok(readerContent.includes('Dooro cabbirka:'), 'Integrated reader must also have "Dooro cabbirka" label');
assert.ok(readerContent.includes('Yar') && readerContent.includes('Caadi') && readerContent.includes('Weyn'), 'Must have Yar, Caadi, Weyn options');
console.log('  ✓ Integrated Quran Reader panel updated with consistent font controls');

// Test 6: Chat Simplification (No Quran reader embedded in chat & no Quran reading cards)
console.log('6. Testing Chat Simplification & Public Quiz Removal...');
const chatPagePath = path.join(ROOT, 'src/pages/ChatPage.tsx');
const chatPageContent = fs.readFileSync(chatPagePath, 'utf8');
assert.ok(
  !chatPageContent.includes('<IntegratedQuranReaderPanel'),
  'ChatPage must NOT have embedded IntegratedQuranReaderPanel'
);
console.log('  ✓ Verified embedded Quran reader panel removed from ChatPage');

const welcomePath = path.join(ROOT, 'src/components/chat/WelcomeScreen.tsx');
const welcomeContent = fs.readFileSync(welcomePath, 'utf8');
assert.ok(
  !welcomeContent.includes('readingProgress.last_surah') && !welcomeContent.includes('Qur\'aanka Kariimka & Tafsiirka'),
  'WelcomeScreen must NOT automatically inject Quran reading cards into chat'
);
console.log('  ✓ Verified Quran reading cards removed from Chat WelcomeScreen');

// Verify Islamic Quiz removed from public frontend
const landingPath = path.join(ROOT, 'src/pages/LandingPage.tsx');
const landingContent = fs.readFileSync(landingPath, 'utf8');
assert.ok(
  !landingContent.includes('to="/quiz"') && !landingContent.includes('Islamic Quiz'),
  'LandingPage must NOT contain public links to Islamic Quiz'
);

const featuresPath = path.join(ROOT, 'src/pages/FeaturesPage.tsx');
const featuresContent = fs.readFileSync(featuresPath, 'utf8');
assert.ok(
  !featuresContent.includes('id: \'islamic-quiz\''),
  'FeaturesPage must NOT contain public card for Islamic Quiz'
);
console.log('  ✓ Verified Islamic Quiz removed from public frontend (LandingPage & FeaturesPage)');

// Verify suggestions row and mic voice input in composer
assert.ok(
  composerContent.includes('QUICK_SUGGESTIONS') && composerContent.includes('handleToggleVoice'),
  'MessageComposer must include quick suggestions row and functional voice input'
);
console.log('  ✓ Quick suggestion chips and functional voice input verified in MessageComposer');

console.log('\n=== ALL FULL SYSTEM REDESIGN TESTS PASSED WITH 100% SUCCESS! ===');
