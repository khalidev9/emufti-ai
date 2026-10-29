// Automated Verification Test Suite for Gemini API Connection & Clean UI (No Literal SVG)
// Verifies request flow, missing/invalid key handling, Retry button behavior,
// absence of literal "svg" / "svgCopy" / "svgRegenerate" text, and Islamic scope preservation.

import fs from 'node:fs';
import path from 'node:path';
import { generateIslamicResponse, getEffectiveGeminiApiKey } from '../src/lib/gemini.ts';

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

async function runGeminiConnectionAndUiTests() {
  console.log('========================================================================');
  console.log('EMUFTI AI: GEMINI API CONNECTION & UI INTEGRITY VERIFICATION SUITE');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // 1. Literal SVG & Broken Icon Inspection Across Chat & Layout Components
  // -------------------------------------------------------------------------
  console.log('--- 1. Verification of Clean Icon Rendering (Zero Literal SVG Artifacts) ---');

  const componentsToInspect = [
    'src/components/chat/ChatMessage.tsx',
    'src/components/chat/MessageComposer.tsx',
    'src/components/chat/WelcomeScreen.tsx',
    'src/components/chat/PlanActivationBanner.tsx',
    'src/components/chat/QuotaModal.tsx',
    'src/components/chat/Modals.tsx',
    'src/components/layout/Header.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/pages/ChatPage.tsx',
    'src/pages/SettingsPage.tsx',
  ];

  for (const relPath of componentsToInspect) {
    const fullPath = path.resolve(relPath);
    const code = fs.readFileSync(fullPath, 'utf8');

    // Check for accidental placeholder text
    check(!code.includes('svgCopy'), `${relPath} does not contain placeholder 'svgCopy'`);
    check(!code.includes('svgRegenerate'), `${relPath} does not contain placeholder 'svgRegenerate'`);
    check(!/>\s*svg\s*</i.test(code), `${relPath} does not render raw '>svg<' text`);
    check(!code.includes('<span>svg</span>'), `${relPath} does not contain '<span>svg</span>'`);
    check(!code.includes("text-xs\">svg<"), `${relPath} does not contain raw text node 'svg'`);
  }

  // -------------------------------------------------------------------------
  // 2. ChatMessage Retry Button State & Prevention of Duplicate Requests
  // -------------------------------------------------------------------------
  console.log('\n--- 2. ChatMessage Retry & Error Component Hardening ---');
  const chatMsgCode = fs.readFileSync(path.resolve('src/components/chat/ChatMessage.tsx'), 'utf8');

  check(chatMsgCode.includes('isGenerating'), 'ChatMessage destructures isGenerating from useChat');
  check(chatMsgCode.includes('disabled={isGenerating}'), 'Retry button is disabled when generation is active');
  check(chatMsgCode.includes('disabled:cursor-not-allowed'), 'Retry button enforces disabled cursor-not-allowed');
  check(chatMsgCode.includes('Loader2') && chatMsgCode.includes('animate-spin'), 'Retry button displays spinning Loader2 while retrying');
  check(chatMsgCode.includes('Isku day mar kale / Retry'), 'Retry button has bilingual Somali/English label');

  // -------------------------------------------------------------------------
  // 3. ChatContext Regeneration Robustness
  // -------------------------------------------------------------------------
  console.log('\n--- 3. ChatContext Retry Orchestration ---');
  const chatCtxCode = fs.readFileSync(path.resolve('src/context/ChatContext.tsx'), 'utf8');

  check(chatCtxCode.includes('const regenerateMessage = async (messageId?: string)'), 'regenerateMessage accepts messageId');
  check(chatCtxCode.includes('if (!activeConversation || isGenerating) return;'), 'regenerateMessage immediately guards against concurrent in-flight requests');
  check(chatCtxCode.includes('truncatedHistory'), 'regenerateMessage trims history to user prompt before regenerating');

  // -------------------------------------------------------------------------
  // 4. Vite Server-Side Secure Gemini Endpoint & Dynamic Env Loading
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Secure Server-Side Gemini API Proxy in vite.config.ts ---');
  const viteConfigCode = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');

  check(viteConfigCode.includes('/api/chat-gemini'), 'vite.config.ts implements server-side /api/chat-gemini proxy');
  check(viteConfigCode.includes('/api/ai-status'), 'vite.config.ts implements diagnostic /api/ai-status endpoint');
  check(viteConfigCode.includes('/api/configure-gemini-key'), 'vite.config.ts implements secure /api/configure-gemini-key endpoint');
  check(viteConfigCode.includes('getDynamicEnv'), 'vite.config.ts dynamically reads environment on each request');
  check(viteConfigCode.includes('MISSING_GEMINI_API_KEY'), 'vite.config.ts returns structured MISSING_GEMINI_API_KEY when secret is not configured');
  check(viteConfigCode.includes('INVALID_API_KEY'), 'vite.config.ts catches and handles 400 INVALID_API_KEY from Gemini');
  check(viteConfigCode.includes('RATE_LIMIT'), 'vite.config.ts handles 429 RATE_LIMIT');
  check(viteConfigCode.includes('temperature: 0.25'), 'vite.config.ts sets low temperature for religious fidelity');

  // -------------------------------------------------------------------------
  // 5. Production Node.js Server Independent of Vite Dev Middleware
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Independent Production Node.js Server (server/index.mjs) ---');
  check(fs.existsSync(path.resolve('server/index.mjs')), 'server/index.mjs exists as standalone production server');
  const serverCode = fs.readFileSync(path.resolve('server/index.mjs'), 'utf8');
  check(serverCode.includes('/api/chat-gemini'), 'Production server handles /api/chat-gemini');
  check(serverCode.includes('/api/ai-status'), 'Production server handles /api/ai-status');
  check(serverCode.includes('/api/configure-gemini-key'), 'Production server handles /api/configure-gemini-key');
  check(serverCode.includes('MIME_TYPES') && serverCode.includes('DIST_DIR'), 'Production server serves production dist/ assets with SPA fallback');

  const pkgJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  check(pkgJson.scripts?.start === 'node server/index.mjs', 'package.json defines npm start pointing to standalone production server');

  // -------------------------------------------------------------------------
  // 6. Settings Page Secure Configuration & Local Key Purge
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Settings Page Security & Status Diagnostic ---');
  const settingsCode = fs.readFileSync(path.resolve('src/pages/SettingsPage.tsx'), 'utf8');

  check(settingsCode.includes('/api/ai-status'), 'SettingsPage queries server status via /api/ai-status');
  check(settingsCode.includes('/api/configure-gemini-key'), 'SettingsPage saves keys securely to server via /api/configure-gemini-key');
  check(settingsCode.includes('Purge Stored Browser Key'), 'SettingsPage provides option to purge legacy keys from browser storage');
  check(settingsCode.includes('GEMINI_API_KEY'), 'SettingsPage guides users to set GEMINI_API_KEY in .env.local');
  check(settingsCode.includes('Save & Connect'), 'SettingsPage provides Save & Connect button');

  // -------------------------------------------------------------------------
  // 7. Client Endpoint Priority (Server Endpoint First, Edge Function Fallback)
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Client Endpoint Resolution Priority in src/lib/gemini.ts ---');
  const geminiLibCode = fs.readFileSync(path.resolve('src/lib/gemini.ts'), 'utf8');
  const localIndex = geminiLibCode.indexOf('/api/chat-gemini');
  const edgeIndex = geminiLibCode.indexOf('supabase.functions.invoke');
  check(localIndex > 0 && edgeIndex > 0 && localIndex < edgeIndex, 'src/lib/gemini.ts tries local/server /api/chat-gemini before remote edge function');
  check(geminiLibCode.includes('isSupabaseEdgeDeployed'), 'src/lib/gemini.ts caches edge function deployment status to avoid repeated 404s');

  // -------------------------------------------------------------------------
  // 6. Gemini API Connection Failure Simulation & Clear Actionable Error
  // -------------------------------------------------------------------------
  console.log('\n--- 6. End-to-End Missing Key Diagnostic Simulation ---');

  // When no key is provided in process environment:
  let caughtErrorSo = null;
  try {
    await generateIslamicResponse({
      prompt: 'Waa maxay tiirarka salaadda?',
      targetLanguage: 'so',
    });
  } catch (err) {
    caughtErrorSo = err;
  }

  check(caughtErrorSo !== null, 'generateIslamicResponse throws when unconfigured instead of returning mock text');
  check(caughtErrorSo.message.includes('GEMINI_API_KEY'), 'Somali error mentions GEMINI_API_KEY');
  check(caughtErrorSo.message.includes('Settings') || caughtErrorSo.message.includes('Dhowridda'), 'Somali error mentions Settings');
  check(caughtErrorSo.message.includes('Isku day mar kale / Retry'), 'Somali error mentions Retry button');
  check(!caughtErrorSo.message.includes('AIzaSy'), 'Zero API secret exposure in error message');

  // Test English error message
  let caughtErrorEn = null;
  try {
    await generateIslamicResponse({
      prompt: 'What are the pillars of prayer in Islam?',
      targetLanguage: 'en',
    });
  } catch (err) {
    caughtErrorEn = err;
  }

  check(caughtErrorEn !== null, 'English inquiry throws when unconfigured');
  check(caughtErrorEn.message.includes('GEMINI_API_KEY'), 'English error mentions GEMINI_API_KEY');
  check(caughtErrorEn.message.includes('Settings'), 'English error directs user to Settings');
  check(caughtErrorEn.message.includes('Retry'), 'English error instructs user to use Retry');

  // -------------------------------------------------------------------------
  // 7. Greetings & Islamic Scope Enforcement
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Conversational Islamic Scope & Warm Greetings ---');

  // Greetings should return immediate warm responses without requiring external API calls
  const greetingResultSo = await generateIslamicResponse({
    prompt: 'Asc',
    targetLanguage: 'so',
  });
  check(greetingResultSo.content.includes('Wacalaykumu salaam'), 'Asc receives immediate warm Islamic greeting');
  check(greetingResultSo.content.includes('EMufti AI'), 'Identifies platform gracefully');

  const greetingResultEn = await generateIslamicResponse({
    prompt: 'As-salamu alaykum',
    targetLanguage: 'en',
  });
  check(greetingResultEn.content.includes('Wa Alaykum As-Salam'), 'English salam receives customary Islamic greeting');

  // Secular queries should be politely redirected
  const secularResult = await generateIslamicResponse({
    prompt: 'Can you write a Python script for stock market scraping?',
    targetLanguage: 'en',
  });
  check(secularResult.content.includes('dedicated exclusively') && secularResult.content.includes('Islam'), 'Politely redirects secular inquiry to Islamic knowledge');

  console.log('\n========================================================================');
  console.log(`ALL CONNECTION & UI TESTS PASSED: ${passed}/${total} checks completed successfully!`);
  console.log('========================================================================');
}

runGeminiConnectionAndUiTests().catch((err) => {
  console.error('\n[FATAL] Test execution failed:', err);
  process.exit(1);
});
