import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: HEADER & SIDEBAR UI CLEANUP TESTS (image_c79c3e.png)');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failCount++;
  }
}

const headerPath = path.join(rootDir, 'src', 'components', 'layout', 'Header.tsx');
const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.tsx');

const headerContent = fs.readFileSync(headerPath, 'utf8');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// -----------------------------------------------------------------------------
// SECTION 1: Subtext Removal ("Islamic AI" / "Islamic Intelligence")
// -----------------------------------------------------------------------------
console.log('--- Section 1: Subtexts Removal below EMufti AI Logo ---');

assert(
  !sidebarContent.includes('Islamic AI') &&
  sidebarContent.includes('EMufti AI'),
  '1.1 Subtitle text "Islamic AI" is completely removed below EMufti AI logo in Sidebar.tsx'
);

assert(
  !headerContent.includes('Islamic Intelligence') &&
  headerContent.includes('EMufti') &&
  headerContent.includes('AI'),
  '1.2 Subtitle text "Islamic Intelligence" is completely removed below EMufti AI logo in Header.tsx'
);

// -----------------------------------------------------------------------------
// SECTION 2: Replace Language Dropdown with Clean Globe Icon
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Minimalist Language Icon ---');

assert(
  headerContent.includes('Globe') &&
  headerContent.includes('isLangMenuOpen') &&
  headerContent.includes('setIsLangMenuOpen'),
  '2.1 Text-based language dropdown is replaced with clean minimalist Globe icon'
);

assert(
  headerContent.includes('targetLanguage') &&
  headerContent.includes('setTargetLanguage'),
  '2.2 Language selector supports multi-language switching (Auto, Somali, English, Arabic)'
);

// -----------------------------------------------------------------------------
// SECTION 3: Simplify User Profile (Remove Background & Name)
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Simplified User Profile (No Background & No Name) ---');

assert(
  headerContent.includes('UserAvatar') &&
  !headerContent.includes('<SubscriptionBadge') &&
  !headerContent.includes('truncate max-w-[100px]'),
  '3.1 Text name and subscription badge pill are completely removed from Header profile section'
);

assert(
  !headerContent.includes('border border-slate-200/60 group shrink-0') &&
  !headerContent.includes('p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100/80'),
  '3.2 Surrounding card background and border are removed, rendering only the clean UserAvatar'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
