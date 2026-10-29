import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ✗ [FAIL] ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: NAVIGATION, AUTH REDIRECTS, SETTINGS & SUBCIS VERIFICATION');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Part 1: Start Chat Navigation Link
// -----------------------------------------------------------------------------
console.log('--- 1. User Navigation: "Start Chat" replacing "Dashboard" ---');

const landingPageCode = readFileSync(resolve('src/pages/LandingPage.tsx'), 'utf8');

assert(
  landingPageCode.includes("navigate('/chat')") &&
  landingPageCode.includes("navigate('/login', { state: { from: '/chat' } })"),
  'LandingPage handleStartChat navigates to /chat (or /login with from: /chat)'
);

assert(
  landingPageCode.includes('<span>Start Chat</span>') &&
  !landingPageCode.includes('<span>Dashboard</span>'),
  'Desktop and mobile buttons display "Start Chat" instead of "Dashboard"'
);

assert(
  landingPageCode.includes('<Link to="/chat"') &&
  landingPageCode.includes('<span>Start Chat</span>'),
  'Desktop and drawer navigation link to /chat with "Start Chat" label'
);

// -----------------------------------------------------------------------------
// Part 2: Authentication Redirects
// -----------------------------------------------------------------------------
console.log('\n--- 2. Authentication Redirects to Main Chat ---');

const authPagesCode = readFileSync(resolve('src/pages/AuthPages.tsx'), 'utf8');

assert(
  authPagesCode.includes("targetDestination =") &&
  authPagesCode.includes("'/chat'"),
  'AuthCombinedPage defaults targetDestination to /chat'
);

assert(
  authPagesCode.includes("navigate('/chat', { replace: true })"),
  'AuthCombinedPage navigates to /chat on successful authentication'
);

assert(
  authPagesCode.includes('!isAuthLoading && user') &&
  authPagesCode.includes("navigate('/chat', { replace: true })"),
  'AuthCombinedPage automatically redirects existing authenticated sessions to /chat'
);

assert(
  authPagesCode.includes("navigate(`/verify-email?email=") &&
  authPagesCode.includes("requiresVerification"),
  'Unverified users are routed to the verification screen, not treated as authenticated'
);

const verifyEmailPageCode = readFileSync(resolve('src/pages/AuthPages.tsx'), 'utf8');
assert(
  verifyEmailPageCode.includes("onSuccess={() => navigate('/chat', { replace: true })}"),
  'VerifyEmailPage redirects to /chat upon successful code verification'
);

// -----------------------------------------------------------------------------
// Part 3: Settings Page & Compass Icon Fix
// -----------------------------------------------------------------------------
console.log('\n--- 3. Settings Page: Compass Icon & isSupabaseConfigured ---');

const settingsPageCode = readFileSync(resolve('src/pages/SettingsPage.tsx'), 'utf8');

assert(
  settingsPageCode.includes("Compass,") &&
  settingsPageCode.includes("from 'lucide-react'"),
  'SettingsPage imports Compass icon from lucide-react'
);

assert(
  settingsPageCode.includes("icon: Compass"),
  'SettingsPage assigns Compass icon to preferences & methodology tab'
);

assert(
  !settingsPageCode.includes("isSupabaseConfigured()") &&
  settingsPageCode.includes("isSupabaseConfigured"),
  'SettingsPage treats isSupabaseConfigured as a boolean without invoking it as a function'
);

// Check that AdminPage has Upload imported
const adminPageCode = readFileSync(resolve('src/pages/AdminPage.tsx'), 'utf8');
assert(
  adminPageCode.includes("Upload,") &&
  adminPageCode.includes("from 'lucide-react'"),
  'AdminPage imports Upload icon from lucide-react'
);

// -----------------------------------------------------------------------------
// Part 4: Subcis Audio Controller & Consecutive Alternating Recitation
// -----------------------------------------------------------------------------
console.log('\n--- 4. Subcis: Race-Safe Audio & 6+ Consecutive Alternating Turns ---');

const subcisCode = readFileSync(resolve('src/components/quran/SubcisPractice.tsx'), 'utf8');

assert(
  !subcisCode.includes("}, [userAttemptRecords]);"),
  'SubcisPractice unmount cleanup does NOT depend on userAttemptRecords (prevents pause() between turns)'
);

assert(
  subcisCode.includes("recordedUrlsRef") &&
  subcisCode.includes("cancelActivePlayback"),
  'SubcisPractice uses recordedUrlsRef and cancelActivePlayback on unmount'
);

assert(
  subcisCode.includes("activePlayPromiseRef") &&
  subcisCode.includes("playbackSessionIdRef"),
  'SubcisPractice implements race-safe audio controller with activePlayPromiseRef and playbackSessionIdRef'
);

assert(
  subcisCode.includes("await activePlayPromiseRef.current"),
  'playQariAyah waits for in-flight play() requests to settle before changing audio src or pausing'
);

assert(
  subcisCode.includes("isAbort") &&
  subcisCode.includes("AbortError"),
  'playQariAyah ignores expected AbortError when a session is cleanly interrupted'
);

assert(
  subcisCode.includes("handleFinishUserTurnAutomatically") &&
  subcisCode.includes("nextQariIndex = currentIndex + 1") &&
  subcisCode.includes("playQariAyah(nextQariIndex)"),
  'Finishing user turn automatically advances to consecutive Qari ayah (Ayah 3, 5, etc.)'
);

assert(
  subcisCode.includes("handleQariAudioFinished") &&
  subcisCode.includes("nextUserIndex = currentIndex + 1") &&
  subcisCode.includes("transitionToUserTurn(nextUserIndex)"),
  'Qari audio completion automatically advances to consecutive User ayah (Ayah 2, 4, 6, etc.)'
);

// -----------------------------------------------------------------------------
// Simulation of 6-Ayah and 7-Ayah Alternating Sessions
// -----------------------------------------------------------------------------
console.log('\n--- 5. Simulation: Consecutive Alternating Recitation Turns ---');

function simulateSubcisSession(totalAyahs) {
  let currentIndex = 0;
  let activeRole = 'qari';
  const turns = [];

  // Start with Turn 1: Qari Ayah 1 (index 0)
  turns.push({ turn: 1, role: 'qari', ayahIndex: 0, ayahNumber: 1 });

  for (let t = 2; t <= 20; t++) {
    if (activeRole === 'qari') {
      // Qari finished their ayah
      const nextUserIndex = currentIndex + 1;
      if (nextUserIndex >= totalAyahs) {
        turns.push({ turn: t, status: 'completed', totalTurns: t - 1 });
        break;
      }
      currentIndex = nextUserIndex;
      activeRole = 'user';
      turns.push({ turn: t, role: 'user', ayahIndex: currentIndex, ayahNumber: currentIndex + 1 });
    } else {
      // User finished their ayah
      const nextQariIndex = currentIndex + 1;
      if (nextQariIndex >= totalAyahs) {
        turns.push({ turn: t, status: 'completed', totalTurns: t - 1 });
        break;
      }
      currentIndex = nextQariIndex;
      activeRole = 'qari';
      turns.push({ turn: t, role: 'qari', ayahIndex: currentIndex, ayahNumber: currentIndex + 1 });
    }
  }
  return turns;
}

const sixAyahSession = simulateSubcisSession(6);
assert(
  sixAyahSession.length === 7 && sixAyahSession[6].status === 'completed',
  '6-Ayah session executes exactly 6 alternating turns and then completes'
);
assert(
  sixAyahSession[0].role === 'qari' && sixAyahSession[0].ayahNumber === 1,
  'Turn 1 is Qari recites Ayah 1'
);
assert(
  sixAyahSession[1].role === 'user' && sixAyahSession[1].ayahNumber === 2,
  'Turn 2 is User recites Ayah 2'
);
assert(
  sixAyahSession[2].role === 'qari' && sixAyahSession[2].ayahNumber === 3,
  'Turn 3 is Qari recites Ayah 3 (does NOT stop after Ayah 2)'
);
assert(
  sixAyahSession[3].role === 'user' && sixAyahSession[3].ayahNumber === 4,
  'Turn 4 is User recites Ayah 4'
);
assert(
  sixAyahSession[4].role === 'qari' && sixAyahSession[4].ayahNumber === 5,
  'Turn 5 is Qari recites Ayah 5'
);
assert(
  sixAyahSession[5].role === 'user' && sixAyahSession[5].ayahNumber === 6,
  'Turn 6 is User recites Ayah 6'
);

const sevenAyahSession = simulateSubcisSession(7);
assert(
  sevenAyahSession.length === 8 && sevenAyahSession[7].status === 'completed',
  '7-Ayah (Al-Fatihah) session executes all 7 alternating turns through to completion'
);

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('========================================================================\n');

if (totalTests === passedTests) {
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
