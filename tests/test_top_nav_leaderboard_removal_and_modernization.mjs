import { readFileSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';

console.log('🧪 Starting Top Navigation Leaderboard Removal & Modernization Test Suite...');

const landingPagePath = resolve('src/pages/LandingPage.tsx');
const featuresPagePath = resolve('src/pages/FeaturesPage.tsx');

const landingContent = readFileSync(landingPagePath, 'utf8');
const featuresContent = readFileSync(featuresPagePath, 'utf8');

// 1. Landing Page Navigation Bar Tests
console.log('1. Checking LandingPage.tsx top navigation and mobile drawer...');

// Extract nav block
const navMatch = landingContent.match(/<nav[\s\S]*?<\/nav>/);
assert(navMatch, 'LandingPage must contain a <nav> element');
const navContent = navMatch[0];

// Assert Leaderboard is completely absent from top desktop nav
assert(!navContent.includes('/leaderboard'), 'Desktop top navigation bar must NOT contain /leaderboard link');
assert(!navContent.includes('Leaderboard'), 'Desktop top navigation bar must NOT contain Leaderboard text');
assert(!navContent.includes('header-nav-leaderboard'), 'Desktop top navigation bar must NOT contain header-nav-leaderboard data-testid');

// Assert remaining desktop menu items are present
assert(navContent.includes('Holy Quran'), 'Desktop nav must contain Holy Quran');
assert(navContent.includes('Quran Certificate'), 'Desktop nav must contain Quran Certificate');
assert(navContent.includes('Features'), 'Desktop nav must contain Features');
assert(navContent.includes('Religious Accuracy'), 'Desktop nav must contain Religious Accuracy');
assert(navContent.includes('Plans'), 'Desktop nav must contain Plans');
assert(navContent.includes('Help Center &amp; FAQ') || navContent.includes('Help Center & FAQ'), 'Desktop nav must contain Help Center & FAQ');

// Assert white-and-blue modernized styling classes
assert(navContent.includes('hover:bg-blue-50/70'), 'Desktop nav links must have modern blue hover styling');
assert(navContent.includes('rounded-xl'), 'Desktop nav links must have rounded-xl borders');

// Extract mobile drawer block
const drawerStartIndex = landingContent.indexOf('{mobileMenuOpen && (');
assert(drawerStartIndex !== -1, 'LandingPage must contain mobile menu drawer');
const drawerEndIndex = landingContent.indexOf('</div>\n      )}', drawerStartIndex);
const drawerContent = landingContent.slice(drawerStartIndex, drawerEndIndex !== -1 ? drawerEndIndex + 15 : drawerStartIndex + 2000);

// Assert Leaderboard is completely absent from mobile drawer
assert(!drawerContent.includes('/leaderboard'), 'Mobile drawer must NOT contain /leaderboard link');
assert(!drawerContent.includes('Leaderboard'), 'Mobile drawer must NOT contain Leaderboard text');

// Assert mobile drawer has remaining items with modernized styling
assert(drawerContent.includes('Holy Quran (Mushaf)'), 'Mobile drawer must contain Holy Quran');
assert(drawerContent.includes('Quran Certificate (Hubinta Shahaadada)'), 'Mobile drawer must contain Quran Certificate');
assert(drawerContent.includes('Features & Tools'), 'Mobile drawer must contain Features & Tools');
assert(drawerContent.includes('Subscription Plans'), 'Mobile drawer must contain Subscription Plans');
assert(drawerContent.includes('Help Center & FAQ'), 'Mobile drawer must contain Help Center & FAQ');

// Assert footer still maintains /leaderboard link for quiz accessibility and test compatibility
assert(landingContent.includes('<Link to="/leaderboard" className="hover:text-slate-900">Leaderboard & Quiz</Link>'), 'Footer must retain leaderboard link for quiz access and legacy tests');

console.log('✅ LandingPage.tsx navigation checks passed!');

// 2. Features Page Navigation Bar Tests
console.log('2. Checking FeaturesPage.tsx top navigation header...');

const featuresHeaderMatch = featuresContent.match(/<header[\s\S]*?<\/header>/);
assert(featuresHeaderMatch, 'FeaturesPage must contain a <header> element');
const featuresHeader = featuresHeaderMatch[0];

// Assert Leaderboard is absent from FeaturesPage header
assert(!featuresHeader.includes('/leaderboard'), 'FeaturesPage header must NOT contain /leaderboard link');
assert(!featuresHeader.includes('Leaderboard'), 'FeaturesPage header must NOT contain Leaderboard text');

// Assert remaining modernized header items are present
assert(featuresHeader.includes('to="/verify-certificate"'), 'FeaturesPage header must contain verify-certificate');
assert(featuresHeader.includes('to="/pricing"'), 'FeaturesPage header must contain pricing');
assert(featuresHeader.includes('to="/help"'), 'FeaturesPage header must contain help');
assert(featuresHeader.includes('to="/chat"'), 'FeaturesPage header must contain chat CTA');
assert(featuresHeader.includes('hover:bg-blue-50/70'), 'FeaturesPage header links must use white-and-blue theme hover styling');

console.log('✅ FeaturesPage.tsx navigation checks passed!');

console.log('\n🎉 ALL TOP NAVIGATION LEADERBOARD REMOVAL & MODERNIZATION TESTS PASSED!\n');
