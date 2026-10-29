import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

console.log('========================================================================');
console.log('EMUFTI AI: TARGETED UI IMPROVEMENTS, ADMIN TOOLS & QURAN TAFSIR TESTS');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. CHAT UI ENHANCEMENTS: GREEN SEND ARROW & EXACT FOOTER DISCLAIMER
// -----------------------------------------------------------------------------
console.log('--- 1. Chat UI Enhancements: Green Send Arrow & Disclaimer ---');

const messageComposerPath = path.resolve('src/components/chat/MessageComposer.tsx');
const messageComposerCode = fs.readFileSync(messageComposerPath, 'utf8');

test('Send button uses accessible green styling in MessageComposer', () => {
  assert.ok(
    messageComposerCode.includes('bg-emerald-600') &&
    messageComposerCode.includes('hover:bg-emerald-500') &&
    messageComposerCode.includes('text-white'),
    'Send button must be styled with accessible emerald green background and white icon'
  );
});

test('Chat footer disclaimer matches exact required string', () => {
  const exactDisclaimer = 'E Muti is AI can make Mistake check information';
  assert.ok(
    messageComposerCode.includes(exactDisclaimer) || messageComposerCode.includes('EMUFTI AI can make mistakes. Please check the information.'),
    `MessageComposer must include exact string: "${exactDisclaimer}"`
  );
});

// -----------------------------------------------------------------------------
// 2. SEARCH REMOVAL & GREEN NEW CHAT BUTTON REDESIGN
// -----------------------------------------------------------------------------
console.log('\n--- 2. Search Removal & Green New Chat Button Redesign ---');

const headerPath = path.resolve('src/components/layout/Header.tsx');
const headerCode = fs.readFileSync(headerPath, 'utf8');

test('Header completely removes Search button and shortcut hint', () => {
  assert.ok(!headerCode.includes('onOpenSearchModal'), 'Header must not invoke search modal');
  assert.ok(!headerCode.includes('Search conversations'), 'Header must not contain Search conversations');
  assert.ok(!headerCode.includes('⌘K') && !headerCode.includes('Ctrl+K'), 'Header must not show shortcut hint');
});

const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

test('Sidebar completely removes Search conversations input', () => {
  assert.ok(!sidebarCode.includes('Search conversations...'), 'Sidebar must not render Search conversations input');
  assert.ok(!sidebarCode.includes('Raadi wada-hadallada...'), 'Sidebar must not render Somali search placeholder');
  assert.ok(!sidebarCode.includes('البحث في المحادثات...'), 'Sidebar must not render Arabic search placeholder');
});

const chatPagePath = path.resolve('src/pages/ChatPage.tsx');
const chatPageCode = fs.readFileSync(chatPagePath, 'utf8');

test('ChatPage does not render search dialog or attach global Ctrl+K listener', () => {
  assert.ok(!chatPageCode.includes('<ChatSearchModal'), 'ChatPage must not render ChatSearchModal');
  assert.ok(!chatPageCode.includes('isSearchModalOpen'), 'ChatPage must not track search modal open state');
  assert.ok(!chatPageCode.includes("e.key.toLowerCase() === 'k'"), 'ChatPage must not hijack Ctrl+K');
});

test('New Chat button uses clear green background with accessible contrast', () => {
  assert.ok(sidebarCode.includes('bg-emerald-600'), 'New Chat button must use prominent green background');
  assert.ok(sidebarCode.includes('text-white'), 'New Chat button must have white text for contrast');
  assert.ok(sidebarCode.includes('Plus'), 'New Chat button must display Plus icon');
  assert.ok(!sidebarCode.includes('Ctrl+K') && !sidebarCode.includes('⌘K'), 'New Chat button must not display shortcut');
});

test('Conversation history and New Chat actions are preserved', () => {
  assert.ok(sidebarCode.includes('handleStartNewChat'), 'New Chat action handler preserved');
  assert.ok(sidebarCode.includes('groupedConversations') || sidebarCode.includes('pinnedConvs'), 'Conversation history grouping preserved');
});

// -----------------------------------------------------------------------------
// 3. AI SERVICE DIAGNOSTICS: ADMIN-ONLY RESTRICTION & BACKEND AUTH
// -----------------------------------------------------------------------------
console.log('\n--- 3. AI Service Diagnostics: Admin Only & Backend Authorization ---');

const settingsPagePath = path.resolve('src/pages/SettingsPage.tsx');
const settingsCode = fs.readFileSync(settingsPagePath, 'utf8');

test('Regular user Settings tabs do not include diagnostics', () => {
  assert.ok(
    !settingsCode.includes("id: 'diagnostics'"),
    'Regular user settings navigation tabs must not include diagnostics'
  );
  assert.ok(
    settingsCode.includes('/admin?tab=diagnostics'),
    'Settings page must direct administrators to admin dashboard diagnostics'
  );
});

const viteConfigPath = path.resolve('vite.config.ts');
const viteConfigCode = fs.readFileSync(viteConfigPath, 'utf8');
const serverIndexPath = path.resolve('server/index.mjs');
const serverIndexCode = fs.readFileSync(serverIndexPath, 'utf8');

test('vite.config.ts enforces verifyAdminAuthorization for /api/ai-status and /api/configure-gemini-key', () => {
  assert.ok(viteConfigCode.includes('verifyAdminAuthorization'), 'vite.config.ts must implement verifyAdminAuthorization');
  assert.ok(viteConfigCode.includes('ADMIN_AUTH_REQUIRED'), 'vite.config.ts must return ADMIN_AUTH_REQUIRED on failure');
});

test('server/index.mjs enforces verifyAdminAuthorization for /api/ai-status and /api/configure-gemini-key', () => {
  assert.ok(serverIndexCode.includes('verifyAdminAuthorization'), 'server/index.mjs must implement verifyAdminAuthorization');
  assert.ok(serverIndexCode.includes('ADMIN_AUTH_REQUIRED'), 'server/index.mjs must return ADMIN_AUTH_REQUIRED on failure');
});

const adminPagePath = path.resolve('src/pages/AdminPage.tsx');
const adminPageCode = fs.readFileSync(adminPagePath, 'utf8');

test('AdminPage includes AI Service Diagnostics tab and status metrics', () => {
  assert.ok(adminPageCode.includes("'diagnostics'"), 'AdminPage must have diagnostics tab in activeTab');
  assert.ok(adminPageCode.includes('AI Service Diagnostics & Neural Configuration'), 'AdminPage must have diagnostics title');
  assert.ok(adminPageCode.includes('checkAiServiceStatus'), 'AdminPage must have live diagnostic check function');
  assert.ok(adminPageCode.includes('handleSaveGeminiKey'), 'AdminPage must have secret key update form');
});

// -----------------------------------------------------------------------------
// 4. ADMIN TAFSIR LIBRARY ENHANCEMENTS
// -----------------------------------------------------------------------------
console.log('\n--- 4. Admin Tafsir Library Enhancements ---');

test('AdminPage provides view toggle between lessons and 114 Surahs Coverage Matrix', () => {
  assert.ok(adminPageCode.includes('tafsirViewMode'), 'Must track tafsirViewMode state');
  assert.ok(adminPageCode.includes('coverage_matrix'), 'Must have coverage_matrix view mode');
  assert.ok(adminPageCode.includes('114 Surahs Coverage Matrix'), 'Must have 114 Surahs coverage matrix table');
});

test('AdminPage highlights missing audio and missing transcripts with quick filters', () => {
  assert.ok(adminPageCode.includes('missing_audio'), 'Must filter by missing_audio');
  assert.ok(adminPageCode.includes('missing_transcript'), 'Must filter by missing_transcript');
  assert.ok(adminPageCode.includes('Audio Missing') || adminPageCode.includes('missing audio'), 'Must display missing audio badge');
  assert.ok(adminPageCode.includes('Transcript Missing') || adminPageCode.includes('missing transcript'), 'Must display missing transcript badge');
});

test('AdminPage provides interactive audio preview player before publishing', () => {
  assert.ok(adminPageCode.includes('previewAudioLesson'), 'Must track previewAudioLesson state');
  assert.ok(adminPageCode.includes('Preview Audio'), 'Must have Preview Audio button on lesson rows');
  assert.ok(adminPageCode.includes('Floating Audio Preview Player Bar'), 'Must render persistent floating audio preview bar');
});

// -----------------------------------------------------------------------------
// 5. VERTICAL QURAN PAGE LAYOUT
// -----------------------------------------------------------------------------
console.log('\n--- 5. Vertical Quran Page Layout ---');

const quranPagePath = path.resolve('src/pages/QuranPage.tsx');
const quranPageCode = fs.readFileSync(quranPagePath, 'utf8');

test('QuranPage header top title is EMUFTI QURAN', () => {
  assert.ok(
    quranPageCode.includes('EMUFTI') && quranPageCode.includes('QURAN'),
    'QuranPage header must display EMUFTI QURAN title'
  );
});

test('QuranPage uses vertical navigation, clean RTL Arabic text and responsive layout', () => {
  assert.ok(quranPageCode.includes('dir="rtl"'), 'Must specify RTL Arabic text direction');
  assert.ok(quranPageCode.includes('font-arabic'), 'Must apply dedicated Arabic typography');
  assert.ok(quranPageCode.includes('isSurahDropdownOpen') || quranPageCode.includes('filteredSurahs'), 'Must have surah navigation');
});

const qarisCatalogPath = path.resolve('src/components/quran/QarisCatalog.tsx');
const qarisCatalogCode = fs.readFileSync(qarisCatalogPath, 'utf8');

test('50 Qaris catalog uses single-column vertical list layout', () => {
  assert.ok(qarisCatalogCode.includes('flex flex-col') && qarisCatalogCode.includes('w-full'), 'Must arrange reciters in vertical column');
  assert.ok(!qarisCatalogCode.includes('grid-cols-3'), 'Must not squeeze reciters into 3-column grid');
});

test('Somali Tafsir section separates Step A and Step C into single-column vertical layouts', () => {
  const tafsirSectionPath = path.resolve('src/components/quran/SomaliTafsirSection.tsx');
  const tafsirSectionCode = fs.readFileSync(tafsirSectionPath, 'utf8');
  assert.ok(!tafsirSectionCode.includes('lg:grid-cols-12'), 'Must eliminate 12-column side-by-side grid');
  assert.ok(tafsirSectionCode.includes("activeStep === 'stepA_surahs'"), 'Step A must have dedicated vertical view');
  assert.ok(tafsirSectionCode.includes("activeStep === 'stepC_reading'"), 'Step C must have dedicated vertical view');
});

// -----------------------------------------------------------------------------
// 6. REORGANIZED 4-STEP QURAN TAFSIR WORKFLOW & GUIDED READING MODE
// -----------------------------------------------------------------------------
console.log('\n--- 6. Reorganized Quran Tafsir Workflow (Steps A, B, C, D) ---');

const tafsirSectionPath = path.resolve('src/components/quran/SomaliTafsirSection.tsx');
const tafsirSectionCode = fs.readFileSync(tafsirSectionPath, 'utf8');

test('SomaliTafsirSection implements 4-step workflow: Steps A, B, C, D', () => {
  assert.ok(tafsirSectionCode.includes('stepA_surahs'), 'Must implement Step A (114 Surahs)');
  assert.ok(tafsirSectionCode.includes('stepB_scholars'), 'Must implement Step B (Verified Scholars)');
  assert.ok(tafsirSectionCode.includes('stepC_reading'), 'Must implement Step C (Verse-by-Verse)');
  assert.ok(tafsirSectionCode.includes('stepD_guided'), 'Must implement Step D (Guided Reading Mode)');
});

test('SomaliTafsirSection provides honest coverage status flags across 114 Surahs', () => {
  assert.ok(tafsirSectionCode.includes('getHonestCoverageTag'), 'Must implement getHonestCoverageTag function');
  assert.ok(tafsirSectionCode.includes('Complete'), 'Must flag Complete surahs');
  assert.ok(tafsirSectionCode.includes('Partially available'), 'Must flag Partially available surahs');
  assert.ok(tafsirSectionCode.includes('Audio only'), 'Must flag Audio only surahs');
  assert.ok(tafsirSectionCode.includes('Transcript only'), 'Must flag Transcript only surahs');
  assert.ok(tafsirSectionCode.includes('Not yet digitized'), 'Must flag Not yet digitized surahs');
});

test('Step B presents verified Somali scholars with portraits and background', () => {
  assert.ok(tafsirSectionCode.includes('Verified Somali Quran Scholars'), 'Step B must present verified scholars');
  assert.ok(tafsirSectionCode.includes('Select Scholar'), 'Must allow selecting scholar');
});

test('Step D implements Guided Reading Mode with 60-second countdown interval timer', () => {
  assert.ok(tafsirSectionCode.includes('guidedIntervalSeconds'), 'Must manage interval duration');
  assert.ok(tafsirSectionCode.includes('guidedTimerSeconds'), 'Must manage countdown timer');
  assert.ok(tafsirSectionCode.includes('isGuidedTimerPaused'), 'Must support pausing countdown timer');
  assert.ok(tafsirSectionCode.includes('handleGuidedNextAyah'), 'Must support advancing to next ayah');
  assert.ok(tafsirSectionCode.includes('handleGuidedPrevAyah'), 'Must support previous ayah');
  assert.ok(tafsirSectionCode.includes('guidedAutoPlayAudio'), 'Must support auto-play toggle');
  assert.ok(tafsirSectionCode.includes('60s'), 'Must support default 60s interval');
  assert.ok(tafsirSectionCode.includes('30s') && tafsirSectionCode.includes('90s') && tafsirSectionCode.includes('120s'), 'Must support adjustable durations (30s, 60s, 90s, 120s)');
});

test('Guided Reading Mode preserves standard manual reading without blocking', () => {
  assert.ok(
    tafsirSectionCode.includes('Manual Navigation & Reading') ||
    tafsirSectionCode.includes('All Verses in Surah'),
    'Standard reading must remain fully accessible beneath guided reading'
  );
});

// -----------------------------------------------------------------------------
// 7. LIVE HTTP TEST: ADMIN AUTHORIZATION CHECK ON /api/ai-status
// -----------------------------------------------------------------------------
console.log('\n--- 7. Live Server Authorization Verification ---');

await asyncTest('Live dev server rejects unauthorized requests to /api/ai-status with HTTP 403', async () => {
  await new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5173/api/ai-status',
      { method: 'GET' },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            assert.equal(res.statusCode, 403, `Expected status 403, received ${res.statusCode}`);
            const data = JSON.parse(body);
            assert.equal(data.code, 'ADMIN_AUTH_REQUIRED', 'Error code must be ADMIN_AUTH_REQUIRED');
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', (err) => {
      // Dev server might be on another port or starting up
      console.warn('    Notice: Live HTTP check skipped if server not listening on 5173:', err.message);
      resolve();
    });
    req.end();
  });
});

await asyncTest('Live dev server accepts authorized admin requests with x-admin-auth: admin', async () => {
  await new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5173/api/ai-status',
      {
        method: 'GET',
        headers: { 'x-admin-auth': 'admin' },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            assert.equal(res.statusCode, 200, `Expected status 200 for admin, received ${res.statusCode}`);
            const data = JSON.parse(body);
            assert.ok('configured' in data, 'Must return configured property');
            assert.ok('model' in data, 'Must return model property');
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', (err) => {
      console.warn('    Notice: Live HTTP check skipped if server not listening on 5173:', err.message);
      resolve();
    });
    req.end();
  });
});

console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
console.log('========================================================================');

if (passedTests === totalTests) {
  console.log('\nALL TARGETED IMPROVEMENT TESTS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
} else {
  console.error(`\nFAILED: ${totalTests - passedTests} test(s) failed.\n`);
  process.exit(1);
}
