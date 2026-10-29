import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING LEADERBOARD REDESIGN & WHATSAPP NUMBER TEST SUITE ---');

const constantsFile = fs.readFileSync(path.resolve('./src/lib/constants.ts'), 'utf-8');
const leaderboardFile = fs.readFileSync(path.resolve('./src/components/quiz/QuizLeaderboard.tsx'), 'utf-8');
const quizPageFile = fs.readFileSync(path.resolve('./src/pages/QuizPage.tsx'), 'utf-8');
const helpCenterFile = fs.readFileSync(path.resolve('./src/pages/HelpCenterPage.tsx'), 'utf-8');

// =========================================================================
// 1. LEADERBOARD MINIMALIST REDESIGN & CLUTTER REMOVAL
// =========================================================================
console.log('Testing 1: Minimalist Leaderboard Redesign & Clutter Removal...');

// Removed extra banners & cluttered sections
assert(
  !leaderboardFile.includes('Bulshada Cilmi-doonka'),
  'Extra community knowledge standard cards (Bulshada Cilmi-doonka) must be removed from QuizLeaderboard'
);
assert(
  !leaderboardFile.includes('Bankiga Su\'aalaha'),
  'Extra question bank promo cards (Bankiga Su\'aalaha) must be removed from QuizLeaderboard'
);
assert(
  !leaderboardFile.includes('Bilow Quiz Cusub'),
  'Quiz promo callout button (Bilow Quiz Cusub) must be removed from QuizLeaderboard'
);
assert(
  !leaderboardFile.includes('w-64 h-64 bg-blue-500/10 rounded-full blur-3xl'),
  'Cluttered dark background glow banners must be removed from QuizLeaderboard'
);

// QuizPage hides quiz hero banner on Leaderboard tab
assert(
  quizPageFile.includes("activeTab !== 'leaderboard'"),
  'QuizPage must hide quiz setup hero banner and streak counter when activeTab is leaderboard'
);

// Core Leaderboard rankings list/table is preserved and clean
assert(
  leaderboardFile.includes('Liiska Guud Ee Kaalmaha'),
  'QuizLeaderboard must render unified rankings table'
);
assert(
  leaderboardFile.includes('🥇 #1') && leaderboardFile.includes('🥈 #2') && leaderboardFile.includes('🥉 #3'),
  'QuizLeaderboard rankings table must display Top 3 podium medal badges in table rows'
);
assert(
  leaderboardFile.includes('Horyaalka 1-aad (Champion)'),
  'QuizLeaderboard must feature 1st place champion in standings'
);
assert(
  leaderboardFile.includes('overflow-y-auto'),
  'QuizLeaderboard rankings table must be cleanly scrollable'
);
assert(
  leaderboardFile.includes('filterQuery') && leaderboardFile.includes('timeframe'),
  'QuizLeaderboard must provide search and timeframe filters'
);

console.log('✓ Test 1 Passed: Extra banners, promo cards, and clutter removed; core rankings table cleanly preserved.');

// =========================================================================
// 2. OFFICIAL WHATSAPP NUMBER UPDATED GLOBALLY
// =========================================================================
console.log('Testing 2: Official WhatsApp Number Updated Globally...');

assert(
  constantsFile.includes("OFFICIAL_WHATSAPP_NUMBER = '+974 6678 2031'"),
  'OFFICIAL_WHATSAPP_NUMBER must be set to "+974 6678 2031"'
);
assert(
  constantsFile.includes('wa.me/97466782031'),
  'OFFICIAL_WHATSAPP_LINK must target wa.me/97466782031'
);
assert(
  helpCenterFile.includes('+974 6678 2031'),
  'HelpCenterPage FAQ text must reference updated WhatsApp number (+974 6678 2031)'
);

console.log('✓ Test 2 Passed: WhatsApp support contact number globally updated to +974 6678 2031.');

console.log('\n======================================================');
console.log('  ALL (2/2) LEADERBOARD & WHATSAPP TESTS PASSED!');
console.log('======================================================');
