import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING SIDEBAR CORE NAVIGATION ITEMS TESTS ---');

const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
const content = fs.readFileSync(sidebarPath, 'utf8');

// 1. Verify existence of the navigation section
assert.ok(content.includes('CORE NAVIGATION ITEMS'), 'Sidebar must include CORE NAVIGATION ITEMS section');

// 2. Verify all 5 key items are present with icons, labels, and routes
console.log('Testing 1. Dashboard...');
assert.ok(content.includes('to="/dashboard"'), 'Must route to /dashboard');
assert.ok(content.includes('LayoutDashboard'), 'Must use LayoutDashboard icon');
assert.ok(content.includes('<span>Dashboard</span>'), 'Must display Dashboard label');

console.log('Testing 2. EMufti Quran...');
assert.ok(content.includes('to="/quran"'), 'Must route to /quran');
assert.ok(content.includes('BookOpen'), 'Must use BookOpen icon');
assert.ok(content.includes('<span>EMufti Quran</span>'), 'Must display EMufti Quran label');

console.log('Testing 3. EMufti Quiz...');
assert.ok(content.includes('to="/quiz"'), 'Must route to /quiz');
assert.ok(content.includes('Trophy'), 'Must use Trophy icon');
assert.ok(content.includes('<span>EMufti Quiz</span>'), 'Must display EMufti Quiz label');

console.log('Testing 4. Help Center...');
assert.ok(content.includes('to="/help"'), 'Must route to /help');
assert.ok(content.includes('HelpCircle'), 'Must use HelpCircle icon');
assert.ok(content.includes('<span>Help Center</span>'), 'Must display Help Center label');

console.log('Testing 5. Certificate Verify (Hubinta Shahaadada)...');
assert.ok(content.includes('to="/verify-certificate"'), 'Must route to /verify-certificate');
assert.ok(content.includes('ShieldCheck'), 'Must use ShieldCheck icon');
assert.ok(content.includes('Certificate Verify'), 'Must display Certificate Verify label');
assert.ok(content.includes('Hubinta'), 'Must include Hubinta Shahaadada indicator');

// 3. Verify position: below middle scrollable area and above bottom user profile footer
const middleScrollIndex = content.indexOf('MIDDLE SCROLLABLE AREA');
const navStackIndex = content.indexOf('Dedicated vertical row/stack at the bottom of the sidebar');
const profileFooterIndex = content.indexOf('BOTTOM USER PROFILE FOOTER');

assert.ok(middleScrollIndex !== -1, 'Must have MIDDLE SCROLLABLE AREA');
assert.ok(navStackIndex !== -1, 'Must have Dedicated vertical row/stack marker');
assert.ok(profileFooterIndex !== -1, 'Must have BOTTOM USER PROFILE FOOTER');
assert.ok(navStackIndex > middleScrollIndex, 'Navigation stack must be positioned below the scrollable conversation area');
assert.ok(profileFooterIndex > navStackIndex, 'Profile footer must be positioned below the navigation stack');

// 4. Verify clean alignment and responsive mobile handlers
assert.ok(content.includes('onClick={onMobileClose}'), 'Links must support mobile drawer close on click');

console.log('\n--- ALL 5 SIDEBAR CORE NAVIGATION ITEMS TESTS PASSED SUCCESSFULLY! (5/5) ---');
