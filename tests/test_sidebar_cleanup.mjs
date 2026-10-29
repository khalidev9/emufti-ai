import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- STARTING SIDEBAR NAVIGATION CLEANUP TESTS ---');

const sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// 1. Verify Visible Account Menu has ONLY Core Account & Settings Options
const accountMenuMatch = sidebarCode.match(/isAccountMenuOpen && user && \([\s\S]*?<\/aside>/);
assert.ok(accountMenuMatch, 'Sidebar must contain account popover menu');
const accountMenuSection = accountMenuMatch[0];

// Visible links in Account Menu
assert.ok(accountMenuSection.includes('to="/profile"'), 'Account menu must include Profile link');
assert.ok(accountMenuSection.includes('<span>Profile</span>'), 'Account menu must label Profile');

assert.ok(accountMenuSection.includes('to="/settings"'), 'Account menu must include Settings link');
assert.ok(accountMenuSection.includes('<span>Settings</span>'), 'Account menu must label Settings');

assert.ok(accountMenuSection.includes('to="/pricing"'), 'Account menu must include Subscription Plans link');
assert.ok(accountMenuSection.includes('<span>Subscription Plans</span>'), 'Account menu must label Subscription Plans');

assert.ok(accountMenuSection.includes('signOut()'), 'Account menu must include Sign Out button');
assert.ok(accountMenuSection.includes('<span>Sign Out</span>'), 'Account menu must label Sign Out');

console.log('✓ Test 1 Passed: Core account & settings options (Profile, Settings, Subscription Plans, Sign Out) cleanly preserved.');

// 2. Verify Visible Sidebar & Account Menu do NOT render removed items in the visible UI
// Extract the visible account popover menu (between isAccountMenuOpen && user and the closing of the popover)
const visibleAccountMenu = sidebarCode.slice(
  sidebarCode.indexOf('isAccountMenuOpen && user && ('),
  sidebarCode.indexOf('{/* Clean User Profile Card')
);

assert.ok(!visibleAccountMenu.includes('to="/quran"'), 'Visible account menu must NOT render Holy Quran');
assert.ok(!visibleAccountMenu.includes('to="/quiz"'), 'Visible account menu must NOT render Quiz & Leaderboard');
assert.ok(!visibleAccountMenu.includes('to="/dashboard"'), 'Visible account menu must NOT render Dashboard');
assert.ok(!visibleAccountMenu.includes('to="/verify-certificate"'), 'Visible account menu must NOT render Hubinta Shahaadada');

// Extract the visible promo/navigation section before the user profile footer
const visibleNavArea = sidebarCode.slice(
  sidebarCode.indexOf('{/* PROMOTIONAL / FEATURE BANNER:'),
  sidebarCode.indexOf('{/* 4. BOTTOM USER PROFILE FOOTER:')
);
assert.ok(!visibleNavArea.includes('to="/quran"'), 'Visible sidebar stack must NOT render Holy Quran');
assert.ok(!visibleNavArea.includes('to="/quiz"'), 'Visible sidebar stack must NOT render Quiz & Leaderboard');
assert.ok(!visibleNavArea.includes('to="/dashboard"'), 'Visible sidebar stack must NOT render Dashboard');
assert.ok(!visibleNavArea.includes('to="/verify-certificate"'), 'Visible sidebar stack must NOT render Hubinta Shahaadada');

console.log('✓ Test 2 Passed: 1. Holy Quran, 2. Quiz & Leaderboard, 3. Dashboard, and 4. Hubinta Shahaadada successfully removed from visible sidebar navigation.');

console.log('\n--- ALL SIDEBAR CLEANUP TESTS PASSED SUCCESSFULLY! (2/2) ---');
