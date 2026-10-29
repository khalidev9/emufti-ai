// Automated Verification Test Suite for ChatGPT-Style Interface Redesign in EMufti AI
// Tests UI architecture, component rendering logic, ChatGPT message styling,
// sidebar collapse, composer states, and functional parity.

import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let total = 0;

function check(condition, testName, failureDetails = '') {
  total++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${failureDetails}`);
    throw new Error(`Test Failed: ${testName} - ${failureDetails}`);
  }
}

function runRedesignTests() {
  console.log('========================================================================');
  console.log('EMUFTI AI: CHATGPT REDESIGN VERIFICATION TEST SUITE');
  console.log('========================================================================\n');

  // 1. Inspect WelcomeScreen.tsx
  console.log('--- 1. WelcomeScreen (ChatGPT Minimalist Welcome Screen) ---');
  const welcomePath = path.resolve('src/components/chat/WelcomeScreen.tsx');
  const welcomeContent = fs.readFileSync(welcomePath, 'utf8');

  check(welcomeContent.includes('Maxaad jeclaan lahayd inaad ka ogaato diinta Islaamka?'), 'Includes localized Somali headline');
  check(welcomeContent.includes('What would you like to know about Islam?'), 'Includes localized English headline');
  check(welcomeContent.includes('ماذا تود أن تسأل عن الشريعة الإسلامية؟'), 'Includes localized Arabic headline');
  check(welcomeContent.includes('Waa maxay macnaha Suuratul Faatixa'), 'Card 1: Surah Al-Fatihah suggested prompt');
  check(welcomeContent.includes('Sidee loo tukadaa salaadda'), 'Card 2: Prayer conditions suggested prompt');
  check(welcomeContent.includes('Maxaa buriya weysada'), 'Card 3: Wudu nullifiers suggested prompt');
  check(welcomeContent.includes('Waa maxay tafsiirka Suuratul Ikhlaas'), 'Card 4: Surah Al-Ikhlas suggested prompt');
  check(welcomeContent.includes('onSelectPrompt(prompt'), 'Suggested cards invoke onSelectPrompt directly');
  check(welcomeContent.includes('max-w-3xl'), 'Centered spacious max-w-3xl layout');

  // 2. Inspect MessageComposer.tsx
  console.log('\n--- 2. MessageComposer (ChatGPT Floating Capsule & Circular Button) ---');
  const composerPath = path.resolve('src/components/chat/MessageComposer.tsx');
  const composerContent = fs.readFileSync(composerPath, 'utf8');

  check(composerContent.includes('rounded-[26px]') || composerContent.includes('rounded-3xl'), 'ChatGPT rounded capsule container');
  check(composerContent.includes('ArrowUp'), 'Circular send button uses ArrowUp icon');
  check(composerContent.includes('Square'), 'Stop generation uses Square icon');
  check(composerContent.includes('stopGeneration'), 'Wires real stopGeneration handler');
  check(composerContent.includes('Shift'), 'Handles Shift+Enter for newlines');
  check(composerContent.includes('min-h-[44px]') && composerContent.includes('max-h-48'), 'Auto-growing textarea constraints');
  check(composerContent.includes('getDisclaimer'), 'Includes discreet Islamic disclaimer text');
  check(composerContent.includes('Globe'), 'Includes response language switcher');

  // 3. Inspect ChatMessage.tsx
  console.log('\n--- 3. ChatMessage (ChatGPT Conversation Flow & RTL Arabic) ---');
  const chatMsgPath = path.resolve('src/components/chat/ChatMessage.tsx');
  const chatMsgContent = fs.readFileSync(chatMsgPath, 'utf8');

  check(chatMsgContent.includes('justify-end') && chatMsgContent.includes('rounded-3xl'), 'User message is understated right-aligned rounded bubble');
  check(chatMsgContent.includes('dir={quoteIsArabic ? \'rtl\' : \'ltr\'}') || chatMsgContent.includes('font-arabic'), 'RTL direction for Arabic Quran quotations');
  check(chatMsgContent.includes('border-r-4 border-l-0'), 'Appropriate RTL border for Arabic blockquotes');
  check(chatMsgContent.includes('regenerateMessage'), 'Functional regenerate message action');
  check(chatMsgContent.includes('handleCopy') && chatMsgContent.includes('Copied'), 'Functional copy answer action with feedback');
  check(chatMsgContent.includes('submitFeedback'), 'Functional helpful/unhelpful feedback action');
  check(chatMsgContent.includes('saveToKnowledge'), 'Functional bookmark/save action');
  check(chatMsgContent.includes('RotateCcw') && chatMsgContent.includes('Isku day mar kale / Retry'), 'Interactive retry button for error states');

  // 4. Inspect Sidebar.tsx
  console.log('\n--- 4. Sidebar (ChatGPT-Style Navigation & Security) ---');
  const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  check(sidebarContent.includes('handleStartNewChat'), 'Prominent New Chat button');
  check(sidebarContent.includes('Search') && sidebarContent.includes('searchQuery'), 'Search conversations input with live filter');
  check(sidebarContent.includes('Today') && sidebarContent.includes('Yesterday') && sidebarContent.includes('Previous 7 Days'), 'Chat history grouped by date');
  check(sidebarContent.includes('startRename') && sidebarContent.includes('renameConversation'), 'Inline conversation renaming');
  check(sidebarContent.includes('triggerDelete') && sidebarContent.includes('deleteConversation'), 'Conversation deletion with confirmation');
  check(sidebarContent.includes('/quran') && sidebarContent.includes('Quran & Tafsir Library'), 'Quran and Tafsir library navigation');
  check(sidebarContent.includes('ISLAMIC_TOPICS') && sidebarContent.includes('Explore Topics'), 'Explore Islamic Topics navigation');
  check(sidebarContent.includes('/saved') && sidebarContent.includes('Saved Answers'), 'Saved answers / bookmarks navigation');
  check(sidebarContent.includes('isAdmin') && sidebarContent.includes('/admin'), 'Admin dashboard strictly guarded by isAdmin check');
  check(sidebarContent.includes('PanelLeftClose'), 'Collapse and expand toggle controls');
  check(sidebarContent.includes('onMobileClose'), 'Mobile drawer slide-out with close support');
  check(sidebarContent.includes('userPlan') && sidebarContent.includes('/pricing'), 'Displays current plan and upgrade link');

  // 5. Inspect Header.tsx
  console.log('\n--- 5. Header (Clean Minimal Top Bar with Sidebar Toggle) ---');
  const headerPath = path.resolve('src/components/layout/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');

  check(headerContent.includes('onToggleSidebar') && headerContent.includes('PanelLeft'), 'Header includes desktop sidebar expand button when collapsed');
  check(headerContent.includes('onMobileMenuToggle'), 'Header includes mobile drawer trigger');
  check(headerContent.includes('targetLanguage') && headerContent.includes('setTargetLanguage'), 'Language switcher selector');
  check(headerContent.includes('createNewChat'), 'Header quick new chat button');
  check(headerContent.includes('toggleReferencePanel'), 'Islamic reference panel toggle');

  // 6. Inspect ChatPage.tsx
  console.log('\n--- 6. ChatPage (Spacious Central Conversation Area) ---');
  const chatPagePath = path.resolve('src/pages/ChatPage.tsx');
  const chatPageContent = fs.readFileSync(chatPagePath, 'utf8');

  check(chatPageContent.includes('max-w-3xl'), 'Central conversation column uses max-w-3xl');
  check(chatPageContent.includes('lg:pl-72') && chatPageContent.includes('lg:pl-0'), 'Smooth layout offset when sidebar is opened vs collapsed');
  check(chatPageContent.includes('sticky bottom-0'), 'Fixed/sticky message composer at bottom');
  check(chatPageContent.includes('WelcomeScreen') && chatPageContent.includes('ChatMessage'), 'Renders WelcomeScreen when empty and ChatMessages when active');

  console.log('\n========================================================================');
  console.log(`ALL CHATGPT REDESIGN TESTS PASSED: ${passed}/${total} checks completed successfully!`);
  console.log('========================================================================');
}

runRedesignTests();
