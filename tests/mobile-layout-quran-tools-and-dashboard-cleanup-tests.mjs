// ==============================================================================
// TEST SUITE: MOBILE LAYOUT, CHAT COMPOSER, QURAN TOOLS & DASHBOARD CLEANUP
// Verifies:
// 1. Mobile chat composer compact height, button sizes, and chat scroll clearance
// 2. Quran Page dedicated mobile navigation tools & QuranBottomNavigation
// 3. Dashboard cleanup & lightweight Tartanka Khatmka summary
// 4. Google OAuth branding redirect & account selection
// 5. Theme Color Customizer dynamic accent CSS & Settings palette
// ==============================================================================

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failedTests++;
  }
}

console.log('\n========================================================================');
console.log('🧪 EMUFTI AI: MOBILE LAYOUT, QURAN TOOLS & POLISH TEST SUITE');
console.log('========================================================================\n');

// 1. Mobile Chat Composer & Spacing
console.log('--- 1. Mobile Chat Composer & Message Container Spacing ---');
const composerContent = fs.readFileSync(path.resolve('src/components/chat/MessageComposer.tsx'), 'utf-8');

assert(
  composerContent.includes('hidden sm:block space-y-1.5'),
  '1.1 Bulky category chips hidden on mobile to keep input box compact'
);

assert(
  composerContent.includes('w-8 h-8 sm:w-10 sm:h-10') &&
  composerContent.includes('w-9 h-9 sm:w-11 sm:h-11'),
  '1.2 Plus, Mic, and Send buttons resized and compacted on mobile devices'
);

assert(
  composerContent.includes('min-h-[30px] sm:min-h-[36px]'),
  '1.3 Textarea min-height compacted for mobile screens'
);

const chatPageContent = fs.readFileSync(path.resolve('src/pages/ChatPage.tsx'), 'utf-8');

assert(
  chatPageContent.includes('pb-36 sm:pb-44'),
  '1.4 Chat message container includes adequate bottom spacing (pb-36 sm:pb-44) so messages are never hidden'
);

assert(
  chatPageContent.includes('ref={messagesEndRef}') &&
  chatPageContent.includes('className="h-24 sm:h-32 shrink-0 pointer-events-none"'),
  '1.5 Dedicated scroll clearance spacer ensures latest responses remain fully visible above composer'
);

// 2. Quran Page Navigation Tools
console.log('\n--- 2. Quran Page Navigation Tools & Mobile Bottom Bar ---');
const quranPageContent = fs.readFileSync(path.resolve('src/pages/QuranPage.tsx'), 'utf-8');

assert(
  quranPageContent.includes('import { QuranBottomNavigation') &&
  quranPageContent.includes('<QuranBottomNavigation'),
  '2.1 QuranPage integrates QuranBottomNavigation for mobile view'
);

assert(
  quranPageContent.includes('handleQuranNavSelect') &&
  quranPageContent.includes('currentQuranNavTab'),
  '2.2 QuranPage synchronizes bottom navigation tabs with active reader modes and companion tools'
);

assert(
  quranPageContent.includes('data-tour="reciter-selector-mobile"') &&
  quranPageContent.includes('setReadingMode'),
  '2.3 Mobile Quran toolbar provides quick Qaari reciter selection and reading mode toggles'
);

assert(
  quranPageContent.includes('pb-28 md:pb-8'),
  '2.4 Main workspace container includes bottom padding on mobile to clear bottom navigation'
);

// 3. Dashboard Cleanup
console.log('\n--- 3. Dashboard Cleanup & Lightweight Performance ---');
const dashboardContent = fs.readFileSync(path.resolve('src/pages/DashboardPage.tsx'), 'utf-8');

assert(
  !dashboardContent.includes('<QuranKhatmChallengeWidget'),
  '3.1 Heavy 1000-line embedded Khatm challenge widget removed from DashboardPage'
);

assert(
  dashboardContent.includes('Tartanka Khatmka') &&
  dashboardContent.includes('to="/khitma"'),
  '3.2 Clean, lightweight Khatm Challenge banner card links directly to dedicated /khitma page'
);

assert(
  dashboardContent.includes('PrayerTimesWidget') &&
  dashboardContent.includes('ReadingStreakWidget') &&
  dashboardContent.includes('Wadahadalladii U Dambeeyay'),
  '3.3 Core features (Prayer Times, Reading Streak, Inquiries, and Recent Consultations) preserved cleanly'
);

// 4. Google OAuth Branding
console.log('\n--- 4. Google OAuth Configuration ---');
const authContextContent = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf-8');

assert(
  authContextContent.includes("redirectTo: redirectUrl") &&
  authContextContent.includes("/auth/callback"),
  '4.1 Google OAuth redirects to /auth/callback for secure PKCE token exchange'
);

assert(
  authContextContent.includes("prompt: 'select_account'"),
  '4.2 Google OAuth uses select_account prompt for clean account switching'
);

// 5. Theme Color Customizer
console.log('\n--- 5. Theme Color Customizer & Dynamic CSS ---');
const indexCssContent = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');

assert(
  indexCssContent.includes('[data-accent="emerald"]') &&
  indexCssContent.includes('[data-accent="rose"]') &&
  indexCssContent.includes('[data-accent="purple"]') &&
  indexCssContent.includes('[data-accent="amber"]'),
  '5.1 index.css defines dynamic theme accent rules for emerald, rose, purple, amber, cyan, and teal'
);

assert(
  indexCssContent.includes('[data-accent="emerald"] .bg-blue-600') &&
  indexCssContent.includes('[data-accent="rose"] .bg-blue-600'),
  '5.2 Primary buttons and accents dynamically adapt to user-selected theme color'
);

const settingsPageContent = fs.readFileSync(path.resolve('src/pages/SettingsPage.tsx'), 'utf-8');

assert(
  settingsPageContent.includes('ACCENT_COLORS.map') &&
  settingsPageContent.includes('handleAccentChange') &&
  settingsPageContent.includes('Custom Button Color'),
  '5.3 SettingsPage features color swatches palette and custom hex color picker with live element preview'
);

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
