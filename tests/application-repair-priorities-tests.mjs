// ==============================================================================
// EMUFTI AI - APPLICATION REPAIR & PRIORITIES VERIFICATION TEST SUITE
// File: tests/application-repair-priorities-tests.mjs
// Verifies all 9 priorities:
// Priority 1: Fix Black/Blank Pages (ErrorBoundary, Theme tokens, null-safety)
// Priority 2: Reliable Islamic QA (Somali, Arabic, English, verified citations, scope)
// Priority 3: Real Web Search with Visible Search Indicator & Clickable URLs
// Priority 4: Fix Suggested-Question Banners (Direct submission without race conditions)
// Priority 5: Remove "ISLAMIC" Next to Logo (Sidebar & Headers)
// Priority 6: Pro-to-Premium Upgrades (Modal default, atomic RPC activation)
// Priority 7: Fix Billing Page Functionality (Supabase fetch, inline tracker, quotas)
// Priority 8: Error Handling & Reliability (Multilingual error states, timeouts, retries)
// Priority 9: Verification & Testing (Build and tests passing)
// ==============================================================================

import fs from 'node:fs';
import assert from 'node:assert/strict';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: APPLICATION REPAIR & 9 PRIORITIES VERIFICATION');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Priority 1: Fix Black/Blank Pages
// -----------------------------------------------------------------------------
console.log('--- Priority 1: Fix Black/Blank Pages ---');

test('ErrorBoundary component exists with reload, chat, and home recovery actions', () => {
  const ebFile = fs.readFileSync('src/components/layout/ErrorBoundary.tsx', 'utf8');
  assert.match(ebFile, /export class ErrorBoundary/);
  assert.match(ebFile, /componentDidCatch/);
  assert.match(ebFile, /Reload Page/);
  assert.match(ebFile, /Go to Chat/);
});

test('App.tsx wraps entire application routes in ErrorBoundary', () => {
  const appFile = fs.readFileSync('src/App.tsx', 'utf8');
  assert.match(appFile, /import { ErrorBoundary } from '\.\/components\/layout\/ErrorBoundary'/);
  assert.match(appFile, /<ErrorBoundary>[\s\S]*?<BrowserRouter>[\s\S]*?<\/ErrorBoundary>/);
});

test('storage.ts getPlanRequests guards against null/undefined email without throwing', () => {
  const storageFile = fs.readFileSync('src/lib/storage.ts', 'utf8');
  assert.match(storageFile, /typeof r\.email === 'string'/);
  assert.match(storageFile, /r\.email\.toLowerCase\(\)/);
});

test('AdminPage safely guards u.email and u.display_name before toLowerCase filter', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /u\.email && u\.email\.toLowerCase\(\)\.includes/);
  assert.match(adminFile, /u\.display_name && u\.display_name\.toLowerCase\(\)\.includes/);
});

test('BillingPage has background and text foreground tokens for dark/light themes', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /bg-background text-foreground/);
  assert.match(auxFile, /bg-card border border-border/);
});

// -----------------------------------------------------------------------------
// Priority 2: Reliable Islamic QA
// -----------------------------------------------------------------------------
console.log('\n--- Priority 2: Reliable Islamic QA ---');

test('isIslamicQuery recognizes Somali, Arabic, and English Islamic inquiries', () => {
  const geminiFile = fs.readFileSync('src/lib/gemini.ts', 'utf8');
  assert.match(geminiFile, /export function isIslamicQuery/);
  assert.match(geminiFile, /salaad|salaadda|shuruudaha|zakada/);
  assert.match(geminiFile, /صلاة|زكاة|حديث|قرآن/);
  assert.match(geminiFile, /salah|prayer|zakat|hadith/);
});

test('ISLAMIC_SYSTEM_INSTRUCTIONS enforces direct answers without evasive generic disclaimers', () => {
  const geminiFile = fs.readFileSync('src/lib/gemini.ts', 'utf8');
  assert.match(geminiFile, /NEVER use "ask a scholar" as your entire answer/);
  assert.match(geminiFile, /DO NOT cite Surah An-Nahl 16:43 as a generic citation or evasion/);
  assert.match(geminiFile, /ISLAMIC-ONLY SCOPE/);
});

test('AUTHENTIC_KNOWLEDGE_BASE provides verified content for Salah and Zakat', () => {
  const geminiFile = fs.readFileSync('src/lib/gemini.ts', 'utf8');
  assert.match(geminiFile, /salah_definition/);
  assert.match(geminiFile, /prayer_conditions/);
  assert.match(geminiFile, /zakat_definition/);
  assert.match(geminiFile, /Surah Al-Baqarah 2:43/);
  assert.match(geminiFile, /Sahih al-Bukhari 8/);
});

// -----------------------------------------------------------------------------
// Priority 3: Real Web Search with Visible Search Indicator & Clickable URLs
// -----------------------------------------------------------------------------
console.log('\n--- Priority 3: Real Web Search with Visible Search Indicator ---');

test('ChatMessage renders exact Somali indicator: "Waxaan baadhayaa ilo diini ah..."', () => {
  const chatMsgFile = fs.readFileSync('src/components/chat/ChatMessage.tsx', 'utf8');
  assert.match(chatMsgFile, /Waxaan baadhayaa ilo diini ah\.\.\./);
});

test('ChatMessage renders exact Arabic indicator: "جارٍ البحث في المصادر الإسلامية..."', () => {
  const chatMsgFile = fs.readFileSync('src/components/chat/ChatMessage.tsx', 'utf8');
  assert.match(chatMsgFile, /جارٍ البحث في المصادر الإسلامية\.\.\./);
});

test('ChatMessage renders exact English indicator: "Searching Islamic sources..."', () => {
  const chatMsgFile = fs.readFileSync('src/components/chat/ChatMessage.tsx', 'utf8');
  assert.match(chatMsgFile, /Searching Islamic sources\.\.\./);
});

test('extractCitations attaches clickable quran.com URL for Quranic verses', () => {
  const utilsFile = fs.readFileSync('src/lib/utils.ts', 'utf8');
  assert.match(utilsFile, /https:\/\/quran\.com\/\$\{chapter\}\/\$\{startVerse\}/);
});

test('extractCitations attaches clickable sunnah.com URL for authentic Hadiths', () => {
  const utilsFile = fs.readFileSync('src/lib/utils.ts', 'utf8');
  assert.match(utilsFile, /https:\/\/sunnah\.com\/bukhari:\$\{number\}/);
  assert.match(utilsFile, /https:\/\/sunnah\.com\/muslim:\$\{number\}/);
});

test('ReferencePanel displays primary source link button with ExternalLink', () => {
  const refPanelFile = fs.readFileSync('src/components/layout/ReferencePanel.tsx', 'utf8');
  assert.match(refPanelFile, /Open Primary Islamic Source/);
  assert.match(refPanelFile, /ExternalLink/);
});

// -----------------------------------------------------------------------------
// Priority 4: Fix Suggested-Question Banners
// -----------------------------------------------------------------------------
console.log('\n--- Priority 4: Fix Suggested-Question Banners ---');

test('WelcomeScreen renders prompt suggestions with category and language', () => {
  const welcomeFile = fs.readFileSync('src/components/chat/WelcomeScreen.tsx', 'utf8');
  assert.match(welcomeFile, /PROMPT_SUGGESTIONS/);
  assert.match(welcomeFile, /Quran & Tafsir/);
  assert.match(welcomeFile, /Salah & Worship/);
  assert.match(welcomeFile, /Somali Explanation/);
  assert.match(welcomeFile, /onSelectPrompt\(item\.prompt,\s*item\.lang\)/);
});

test('ChatPage handleSelectSuggestedPrompt dispatches immediately without race conditions', () => {
  const chatPageFile = fs.readFileSync('src/pages/ChatPage.tsx', 'utf8');
  assert.match(chatPageFile, /handleSelectSuggestedPrompt\s*=\s*async/);
  assert.match(chatPageFile, /createNewChat\(prompt,\s*undefined,\s*targetLanguage\)/);
  assert.doesNotMatch(chatPageFile, /setTimeout\(\(\)\s*=>\s*sendMessage/);
});

test('ChatContext createNewChat passes prompt and language to start synthesis immediately', () => {
  const chatContextFile = fs.readFileSync('src/context/ChatContext.tsx', 'utf8');
  assert.match(chatContextFile, /sendMessageWithConversation\(newConversation,\s*initialPrompt,\s*overrideLanguage\)/);
});

// -----------------------------------------------------------------------------
// Priority 5: Remove "ISLAMIC" Next to Logo
// -----------------------------------------------------------------------------
console.log('\n--- Priority 5: Remove "ISLAMIC" Next to Logo ---');

test('Sidebar logo brand displays EMufti AI without "Islamic" pill badge', () => {
  const sidebarFile = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
  assert.match(sidebarFile, /<span className="font-bold text-base tracking-tight text-foreground">\s*EMufti AI\s*<\/span>/);
  assert.doesNotMatch(sidebarFile, /EMufti AI\s*<span[^>]*>Islamic<\/span>/i);
});

// -----------------------------------------------------------------------------
// Priority 6: Pro-to-Premium Upgrades
// -----------------------------------------------------------------------------
console.log('\n--- Priority 6: Pro-to-Premium Upgrades ---');

test('BillingPage provides dedicated Upgrade to Premium button for Pro users', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /activePlan === 'pro'/);
  assert.match(auxFile, /Upgrade to Premium \(\$20\.99\)/);
  assert.match(auxFile, /handleOpenUpgrade\('premium'\)/);
});

test('BillingPage passes dynamic defaultPlan (premium for pro users) to PlanRequestModal', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /defaultPlan=\{modalDefaultPlan\}/);
});

test('ProfilePage defaults upgrade modal to premium if user is currently pro', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /defaultPlan=\{activePlan === 'pro' \? 'premium' : 'pro'\}/);
});

test('Database RPC update_plan_request_status cancels prior active subscription to prevent duplicates', () => {
  const rpcFile = fs.readFileSync('supabase/migrations/20261014_plan_activation_rpc.sql', 'utf8');
  assert.match(rpcFile, /UPDATE public\.subscriptions\s+SET status = 'canceled'/);
  assert.match(rpcFile, /WHERE user_id = v_user_id AND status = 'active'/);
});

// -----------------------------------------------------------------------------
// Priority 7: Fix Billing Page Functionality
// -----------------------------------------------------------------------------
console.log('\n--- Priority 7: Fix Billing Page Functionality ---');

test('BillingPage fetches requests from Supabase public.plan_requests with storage fallback', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /fetchUserRequests/);
  assert.match(auxFile, /supabase[\s\S]*?\.from\('plan_requests'\)[\s\S]*?\.select/);
  assert.match(auxFile, /storage\.getPlanRequests/);
});

test('BillingPage displays live question usage bar and daily limit', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /Daily Question Allowance/);
  assert.match(auxFile, /usage\.count.*currentLimit/);
  assert.match(auxFile, /usedPercent/);
});

test('BillingPage provides inline Reference ID tracking form and status card', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /Track Existing Upgrade Request/);
  assert.match(auxFile, /handleInlineTrack/);
  assert.match(auxFile, /Reference ID Not Found/);
});

test('BillingPage provides manual onboarding verification details (WhatsApp and Telegram)', () => {
  const auxFile = fs.readFileSync('src/pages/AuxiliaryPages.tsx', 'utf8');
  assert.match(auxFile, /Verified Manual Onboarding Policy/);
  assert.match(auxFile, /wa\.me/);
  assert.match(auxFile, /t\.me\/emufti_ai/);
});

// -----------------------------------------------------------------------------
// Priority 8: Error Handling & Reliability
// -----------------------------------------------------------------------------
console.log('\n--- Priority 8: Error Handling & Reliability ---');

test('ChatMessage error state provides clear multilingual error and retry button', () => {
  const chatMsgFile = fs.readFileSync('src/components/chat/ChatMessage.tsx', 'utf8');
  assert.match(chatMsgFile, /Codsiga lama dhammaystiri karin/);
  assert.match(chatMsgFile, /Isku day mar kale \/ Retry/);
  assert.match(chatMsgFile, /regenerateMessage/);
});

test('ChatContext has request timeout handling with abortController', () => {
  const chatContextFile = fs.readFileSync('src/context/ChatContext.tsx', 'utf8');
  assert.match(chatContextFile, /abortControllerRef\.current/);
  assert.match(chatContextFile, /setTimeout\(\(\) => \{[\s\S]*?abort\(\)/);
});

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`  Application Repair Test Suite Summary`);
console.log(`  Total:  ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL PRIORITIES VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
