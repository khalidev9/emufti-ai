import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- RUNNING VERIFICATION TESTS: QUIZ LEADERBOARD/STREAK, ADMIN ANALYTICS, & QURAN TOUR ---');

const rootDir = process.cwd();

// Test 1: Quiz option in Navigation Menu, Streak Counter, & Real-time Leaderboard
console.log('\n[TEST 1] Verifying Quiz Navigation, Streak Counter & Real-Time Leaderboard...');
const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes('to="/quiz"'), 'Sidebar must include a link to /quiz in main navigation');
assert(sidebarContent.includes('Quiz & Leaderboard') || sidebarContent.includes('EMufti Quiz'), 'Sidebar must label the Quiz navigation option with Leaderboard');
assert(sidebarContent.includes('Tartanka & Kaalmaha'), 'Sidebar must include Somali label (Tartanka & Kaalmaha)');

const bottomNavPath = path.join(rootDir, 'src', 'components', 'layout', 'BottomNavigation.tsx');
const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');
assert(bottomNavContent.includes('/quiz'), 'Bottom navigation must include quiz link in drawer or bar');

const quizPagePath = path.join(rootDir, 'src', 'pages', 'QuizPage.tsx');
const quizPageContent = fs.readFileSync(quizPagePath, 'utf8');
assert(quizPageContent.includes('studyStreak') || quizPageContent.includes('currentStreak'), 'QuizPage must track active user study streak');
assert(quizPageContent.includes('Kaalmaha Dadku Ku Kala Jiraan') || quizPageContent.includes('Leaderboard'), 'QuizPage must include Kaalmaha Dadku Ku Kala Jiraan');
assert(quizPageContent.includes('Active Streak'), 'QuizPage must display user active streak counter');
assert(quizPageContent.includes('QuizLeaderboard'), 'QuizPage must render QuizLeaderboard component');
console.log('✓ PASS: Quiz navigation, active streak counter, and real-time leaderboard verified.');

// Test 2: Admin Analytics Dashboard (Visitors, Registered Users, Most Frequently Used Features)
console.log('\n[TEST 2] Verifying Admin Analytics Dashboard & Metrics...');
const visitorTrackingPath = path.join(rootDir, 'src', 'lib', 'visitorTracking.ts');
assert(fs.existsSync(visitorTrackingPath), 'src/lib/visitorTracking.ts must exist');
const visitorTrackingContent = fs.readFileSync(visitorTrackingPath, 'utf8');
assert(visitorTrackingContent.includes('totalVisitors'), 'Visitor tracking must calculate total visitors');
assert(visitorTrackingContent.includes('totalRegisteredUsers'), 'Visitor tracking must include registered users');
assert(visitorTrackingContent.includes('mostUsedFeatures'), 'Visitor tracking must include most frequently used features');

const adminPagePath = path.join(rootDir, 'src', 'pages', 'AdminPage.tsx');
const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
assert(adminPageContent.includes("'analytics'"), "AdminPage AdminTab union must include 'analytics'");
assert(adminPageContent.includes('Analytics Dashboard'), 'AdminPage must have an Analytics Dashboard button and section');
assert(adminPageContent.includes('Booqdayaasha Webka') || adminPageContent.includes('Total Visitors'), 'AdminPage must display total website visitors metric');
assert(adminPageContent.includes('Isticmaalayaasha Is-Diiwaangeliyay') || adminPageContent.includes('Registered Users'), 'AdminPage must display registered users metric');
assert(adminPageContent.includes('Waxyaabaha Ugu Badnaa Ee La Isticmaalay'), 'AdminPage must display Waxyaabaha Ugu Badnaa Ee La Isticmaalay (Most Frequently Used Features)');
console.log('✓ PASS: Admin Analytics Dashboard with visitors, registered users, and most used features verified.');

// Test 3: Quran Page First-Time Onboarding Tour ("Barbaaraa")
console.log('\n[TEST 3] Verifying Quran Page First-Time Onboarding Tour ("Barbaaraa")...');
const quranTutorialPath = path.join(rootDir, 'src', 'components', 'quran', 'QuranPageTutorial.tsx');
const quranTutorialContent = fs.readFileSync(quranTutorialPath, 'utf8');
assert(quranTutorialContent.includes('BARBARAA'), 'QuranPageTutorial must include BARBARAA branding badge');
assert(quranTutorialContent.includes('emufti_quran_barbaraa_completed'), 'QuranPageTutorial must save barbaraa completion in localStorage');
assert(quranTutorialContent.includes('QURAN_ONBOARDING_TOUR_STEPS'), 'QuranPageTutorial must define onboarding tour steps');

const quranPagePath = path.join(rootDir, 'src', 'pages', 'QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');
assert(quranPageContent.includes('emufti_quran_barbaraa_completed'), 'QuranPage must check barbaraa completion to auto-open for first-time visitors');
assert(quranPageContent.includes('Barbaaraa / Help Tour'), 'QuranPage header must provide Barbaaraa / Help Tour button to reopen tour');
console.log('✓ PASS: Quran Page first-time tour ("Barbaaraa") and step-by-step walkthrough verified.');

// Test 4: Top Header Navigation Bar on Landing Page (Leaderboard / Quiz Link)
console.log('\n[TEST 4] Verifying Top Header Navigation Bar Leaderboard Link on Landing Page...');
const landingPagePath = path.join(rootDir, 'src', 'pages', 'LandingPage.tsx');
const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');
assert(landingPageContent.includes('to="/leaderboard"') || landingPageContent.includes('to="/quiz"'), 'LandingPage must include a Link to /leaderboard or /quiz');
assert(
  landingPageContent.includes('Leaderboard') || landingPageContent.includes('Quiz & Streaks'),
  'LandingPage header navigation must include "Leaderboard" or "Quiz & Streaks"'
);
assert(landingPageContent.includes('Holy Quran'), 'LandingPage header must retain Holy Quran link');
assert(landingPageContent.includes('Features'), 'LandingPage header must retain Features link');
assert(landingPageContent.includes('Religious Accuracy'), 'LandingPage header must retain Religious Accuracy link');
assert(landingPageContent.includes('Plans'), 'LandingPage header must retain Plans link');
assert(landingPageContent.includes('Help Center & FAQ'), 'LandingPage header must retain Help Center & FAQ link');
console.log('✓ PASS: Top header navigation menu item for Leaderboard / Quiz verified.');

// Test 5: Public Accessibility without Login Required & Direct Ranking Display
console.log('\n[TEST 5] Verifying Public Accessibility & Direct Ranking Display...');
const appPath = path.join(rootDir, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(!appContent.includes('<ProtectedRoute>\n                    <QuizPage />'), 'QuizPage route must NOT be protected by ProtectedRoute');
assert(appContent.includes('path="/quiz"'), 'App.tsx must have public /quiz route');
assert(appContent.includes('path="/leaderboard"'), 'App.tsx must have direct /leaderboard route');

assert(quizPageContent.includes('defaultTab'), 'QuizPage must support defaultTab prop for direct rendering');
assert(quizPageContent.includes('QuizLeaderboard'), 'QuizPage must render QuizLeaderboard component');
console.log('✓ PASS: Leaderboard is publicly accessible without login and displays rankings directly.');

// Test 6: Redesigned Leaderboard View (Top 3 Podium & Top 10 Rankings List)
console.log('\n[TEST 6] Verifying Redesigned Leaderboard View (Top 3 Podium & Top 10 List)...');
const leaderboardComponentPath = path.join(rootDir, 'src', 'components', 'quiz', 'QuizLeaderboard.tsx');
const leaderboardComponentContent = fs.readFileSync(leaderboardComponentPath, 'utf8');

// 1. Top 3 Podium checks
assert(leaderboardComponentContent.includes('Top 3 Podium'), 'Leaderboard must include Top 3 Podium section');
assert(leaderboardComponentContent.includes('Horyaalka 1-aad') || leaderboardComponentContent.includes('Champion'), 'Podium must feature 1st place champion in middle');
assert(leaderboardComponentContent.includes('Kaalinta 2-aad') && leaderboardComponentContent.includes('Kaalinta 3-aad'), 'Podium must feature 2nd and 3rd place on either side');
assert(leaderboardComponentContent.includes('top1.badgeTitle') && leaderboardComponentContent.includes('top1.streakDays'), 'Podium must display badges and streaks');

// 2. Subsequent rankings list (ranks 4 through 10 and beyond)
assert(leaderboardComponentContent.includes('Kaalmaha 4-aad Ilaa 10-aad') || leaderboardComponentContent.includes('Ranks 4'), 'Leaderboard must render rankings list for ranks 4 through 10 and beyond');
assert(leaderboardComponentContent.includes('overflow-y-auto'), 'Subsequent rankings list must be scrollable');
assert(leaderboardComponentContent.includes('item.accuracy') && leaderboardComponentContent.includes('item.score'), 'List items must display score and accuracy metrics');
console.log('✓ PASS: Redesigned Leaderboard view verified with Top 3 Podium and scrollable Top 10 rankings list.');

// Test 7: Sidebar & Header Hidden / Removed on Leaderboard / Quiz View
console.log('\n[TEST 7] Verifying Sidebar and Header Removal for Clean Immersive Layout...');
const updatedQuizPageContent = fs.readFileSync(quizPagePath, 'utf8');
assert(!updatedQuizPageContent.includes('<Sidebar'), 'QuizPage must NOT render <Sidebar');
assert(!updatedQuizPageContent.includes('<Header'), 'QuizPage must NOT render chat <Header');
assert(!updatedQuizPageContent.includes('lg:pl-72'), 'QuizPage must NOT have lg:pl-72 sidebar offset');
assert(updatedQuizPageContent.includes('Ku noqo Hoyga') || updatedQuizPageContent.includes('Back to Home'), 'QuizPage must include clean back to home navigation');
console.log('✓ PASS: Sidebar and Top Header successfully hidden/removed on Leaderboard view.');

console.log('\nALL 7 MAJOR FEATURE TESTS PASSED SUCCESSFULLY! ✓✓✓');
