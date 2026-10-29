import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as LucideIcons from 'lucide-react';

console.log('=== RUNNING ADMIN PAGE & ICON RUNTIME VERIFICATION TESTS ===\n');

// 1. Verify AdminPage.tsx has zero references to BarChart2
console.log('--- TEST 1: Check AdminPage.tsx for BarChart2 elimination ---');
const adminCode = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
assert.ok(!adminCode.includes('BarChart2'), 'AdminPage.tsx must not contain any reference to BarChart2');
assert.ok(adminCode.includes('BarChart3'), 'AdminPage.tsx must import and use BarChart3');
console.log('[PASS] AdminPage.tsx has zero BarChart2 references and properly includes BarChart3');

// 2. Verify all icons imported from lucide-react in AdminPage.tsx exist
console.log('\n--- TEST 2: Verify all Lucide imports in AdminPage.tsx are valid exports ---');
const lucideImportMatch = adminCode.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
assert.ok(lucideImportMatch, 'AdminPage.tsx must have an import from lucide-react');

const importedIcons = lucideImportMatch[1]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log(`Found ${importedIcons.length} icon imports from lucide-react in AdminPage.tsx`);

for (const icon of importedIcons) {
  assert.ok(icon in LucideIcons, `Icon "${icon}" imported in AdminPage.tsx must exist in lucide-react`);
  console.log(`  [OK] ${icon} is a valid Lucide icon`);
}

// 3. Verify QuizPage.tsx has zero references to BarChart2
console.log('\n--- TEST 3: Check QuizPage.tsx for BarChart2 elimination ---');
const quizCode = fs.readFileSync('src/pages/QuizPage.tsx', 'utf8');
assert.ok(!quizCode.includes('BarChart2'), 'QuizPage.tsx must not contain any reference to BarChart2');
assert.ok(quizCode.includes('BarChart3'), 'QuizPage.tsx must import and use BarChart3');
console.log('[PASS] QuizPage.tsx has zero BarChart2 references and properly includes BarChart3');

// 4. Verify BottomNavigation.tsx properly imports Headphones
console.log('\n--- TEST 4: Check BottomNavigation.tsx for Headphones import ---');
const bottomNavCode = fs.readFileSync('src/components/layout/BottomNavigation.tsx', 'utf8');
const bottomNavLucideMatch = bottomNavCode.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/);
assert.ok(bottomNavLucideMatch, 'BottomNavigation.tsx must have an import from lucide-react');
assert.ok(bottomNavLucideMatch[1].includes('Headphones'), 'BottomNavigation.tsx must import Headphones from lucide-react');
console.log('[PASS] BottomNavigation.tsx imports Headphones from lucide-react');

console.log('\n=== ALL ADMIN PAGE ICON RUNTIME TESTS PASSED (100%) ===');
