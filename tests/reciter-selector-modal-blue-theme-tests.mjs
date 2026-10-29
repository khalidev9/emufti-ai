/**
 * Verification tests for Reciter Selector Modal ("Dooro Qaari") Blue Background & White Text Theme
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: RECITER SELECTOR MODAL BLUE BACKGROUND & WHITE TEXT TESTS');
console.log('========================================================================\n');

// 1. Component Existence & Header Check
console.log('--- 1. Modal Component & Title Verification ---');
const modalPath = path.resolve('src/components/quran/ReciterSelectorModal.tsx');
assert(fs.existsSync(modalPath), 'ReciterSelectorModal.tsx exists');
const modalContent = fs.readFileSync(modalPath, 'utf8');

assert(
  modalContent.includes('Dooro Qaari (Choose Reciter)'),
  'Modal features title "Dooro Qaari (Choose Reciter)"'
);

// 2. Card Background Theme (Blue / Dark Blue)
console.log('\n--- 2. Reciter Selection Cards Blue Background Styling ---');
assert(
  modalContent.includes('bg-slate-900 border border-blue-500/50 hover:bg-blue-950'),
  'Unselected cards use sleek dark-blue container: bg-slate-900 border border-blue-500/50 hover:bg-blue-950'
);

assert(
  modalContent.includes('bg-blue-600 border-blue-400') &&
    modalContent.includes('ring-2 ring-blue-300/40'),
  'Selected card uses active blue container: bg-blue-600 border-blue-400 ring-2 ring-blue-300/40'
);

assert(
  !modalContent.includes("isSelected\n                    ? 'bg-blue-50/90"),
  'Old light-blue washed-out background on active card is removed'
);

assert(
  !modalContent.includes("bg-white dark:bg-slate-850 border-slate-200/80"),
  'Old white background on unselected cards is removed'
);

// 3. Crisp White Text & High Contrast Typography
console.log('\n--- 3. Crisp White Text & Contrast Verification ---');
assert(
  modalContent.includes('text-xs font-bold text-white truncate'),
  'Reciter English name renders in crisp white: text-white'
);

assert(
  modalContent.includes('font-arabic text-xs font-semibold hidden sm:inline') &&
    modalContent.includes('text-blue-100'),
  'Reciter Arabic name renders in crisp text-white / text-blue-100'
);

assert(
  modalContent.includes('text-[11px] truncate') &&
    modalContent.includes('text-blue-100'),
  'Reciter style and country details render in readable text-blue-100'
);

assert(
  modalContent.includes('bg-white text-blue-600 shadow-xs') &&
    modalContent.includes('bg-blue-800/90 text-white'),
  'Reciter avatar pills use high-contrast white and royal blue styling'
);

assert(
  modalContent.includes('w-6 h-6 rounded-full bg-white text-blue-600'),
  'Active selection checkmark badge uses clean white pill with blue icon'
);

// Summary
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
