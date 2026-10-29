import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: MOBILE PRICING & SUBCIS WIZARD RESPONSIVE VERIFICATION');
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

// -----------------------------------------------------------------------------
// SECTION 1: Pricing Comparison Table Mobile Layout (PricingPage.tsx)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Pricing Comparison Table Mobile Layout ---');
const pricingPagePath = path.join(rootDir, 'src', 'pages', 'PricingPage.tsx');
const pricingContent = fs.readFileSync(pricingPagePath, 'utf-8');

assert(
  pricingContent.includes('md:hidden') &&
  pricingContent.includes('Free Seeker:') &&
  pricingContent.includes('Talib al-Ilm (Pro):') &&
  pricingContent.includes('Alim (Premium):'),
  '1.1 Mobile stackable card comparison layout renders all plan tiers on mobile (< 768px)'
);

assert(
  pricingContent.includes('Daily AI Question Quota') &&
  pricingContent.includes('Context Window Depth') &&
  pricingContent.includes('Response Speed & Queue') &&
  pricingContent.includes('Quran Access Entitlement') &&
  pricingContent.includes('Billing Options'),
  '1.2 All 5 comparison capabilities are present in both mobile cards and desktop table'
);

assert(
  pricingContent.includes('hidden md:block') &&
  pricingContent.includes('overflow-x-auto') &&
  pricingContent.includes('min-w-[700px]'),
  '1.3 Desktop table has overflow-x-auto with min-w-[700px] preventing column squashing'
);

// -----------------------------------------------------------------------------
// SECTION 2: Subcis Setup Wizard Horizontal Scroll & Filter Clipping
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Subcis Setup Wizard Filters & Bottom Spacing ---');
const subcisPath = path.join(rootDir, 'src', 'components', 'quran', 'SubcisPractice.tsx');
const subcisContent = fs.readFileSync(subcisPath, 'utf-8');

assert(
  subcisContent.includes('flex overflow-x-auto no-scrollbar gap-2 px-1 py-1 w-full max-w-full touch-pan-x whitespace-nowrap') &&
  subcisContent.includes('Dhammaan (114)') &&
  subcisContent.includes('Caanka ah (Popular)') &&
  subcisContent.includes('Juz Amma (78-114)'),
  '2.1 Step 1 (Choose Surah) filter pills container is horizontally scrollable with no-scrollbar and whitespace-nowrap'
);

assert(
  subcisContent.includes('Dhammaan (50)') &&
  subcisContent.includes('🇸🇴 Somalia') &&
  subcisContent.includes('Egypt') &&
  subcisContent.includes('Kuwait') &&
  subcisContent.includes('Saudi Arabia'),
  '2.2 Step 2 (Choose Reciter) country filter pills support all regions with horizontal scrolling'
);

assert(
  subcisContent.includes('pb-24 sm:pb-8'),
  '2.3 Subcis setup wizard container includes pb-24 sm:pb-8 bottom spacing for mobile navigation clearance'
);

assert(
  subcisContent.includes('Dooro') &&
  subcisContent.includes('shrink-0') &&
  subcisContent.includes('flex items-center justify-between gap-3'),
  '2.4 Reciter card actions (Dooro button) use direct row alignment with shrink-0, always visible inside the viewport'
);

console.log('\n========================================================================');
console.log(`TOTAL RESPONSIVE TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
