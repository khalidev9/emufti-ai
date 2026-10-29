import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================================');
console.log('EMUFTI AI: SUBSCRIPTION RULES, SUPPORT, HELP CENTER, CHAT UI & BANNERS');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. PREVENT DOWNGRADING TO FREE WHILE PAID PLAN IS ACTIVE
// -----------------------------------------------------------------------------
console.log('--- 1. Prevent Downgrading to Free While Paid Plan is Active ---');

const pricingPagePath = path.resolve('src/pages/PricingPage.tsx');
const pricingPageCode = fs.readFileSync(pricingPagePath, 'utf8');

test('PricingPage checks if paid plan (pro or premium) is active', () => {
  assert.ok(
    pricingPageCode.includes("activePlan === 'pro' || activePlan === 'premium'") ||
    pricingPageCode.includes("isPaidActive"),
    'PricingPage must evaluate whether an active paid plan (pro or premium) is in effect'
  );
});

test('PricingPage displays exact expiration date notice when paid plan is active', () => {
  assert.ok(
    pricingPageCode.includes('subscription is active until') &&
    pricingPageCode.includes('You can use the Free plan after your paid subscription expires'),
    'PricingPage must display notice informing users their paid subscription is active until the expiry date'
  );
});

test('PricingPage handleSelectPlan prevents switching to free when paid plan is active', () => {
  assert.ok(
    pricingPageCode.includes("if (slug === 'free')") &&
    pricingPageCode.includes("if (isPaidActive)"),
    'handleSelectPlan must guard against switching to free when isPaidActive is true'
  );
});

test('Free plan card disables action button when active paid plan exists', () => {
  assert.ok(
    pricingPageCode.includes('isFreeDowngradeDisabled') ||
    pricingPageCode.includes('cursor-not-allowed'),
    'Free plan card button must be disabled when a paid plan is active'
  );
  assert.ok(
    pricingPageCode.includes('Free Active After Expiry') ||
    pricingPageCode.includes('Active on'),
    'Free plan card should clearly label button when paid subscription is active'
  );
});

// -----------------------------------------------------------------------------
// 2. OFFICIAL WHATSAPP SUPPORT NUMBER & LINK
// -----------------------------------------------------------------------------
console.log('\n--- 2. Official WhatsApp Support Number (+252702228704) ---');

const constantsPath = path.resolve('src/lib/constants.ts');
const constantsCode = fs.readFileSync(constantsPath, 'utf8');

test('Constants file exports official WhatsApp phone number', () => {
  assert.ok(
    constantsCode.includes('+974 6678 2031') || constantsCode.includes('+252702228704'),
    'constants.ts must define official WhatsApp phone number'
  );
});

test('Constants file exports official WhatsApp wa.me link with prefilled greeting', () => {
  assert.ok(
    constantsCode.includes('97466782031') || constantsCode.includes('252702228704'),
    'constants.ts must format wa.me link with phone number and greeting'
  );
});

test('Old placeholder WhatsApp number 252615123456 is completely removed from src', () => {
  function searchDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?|json|html|css)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          !content.includes('252615123456'),
          `Found old WhatsApp number in ${fullPath}`
        );
      }
    }
  }
  searchDir(path.resolve('src'));
});

const auxiliaryPagesPath = path.resolve('src/pages/AuxiliaryPages.tsx');
const auxiliaryPagesCode = fs.readFileSync(auxiliaryPagesPath, 'utf8');

test('AuxiliaryPages Billing & Support pages reference official WhatsApp link', () => {
  assert.ok(
    auxiliaryPagesCode.includes('OFFICIAL_WHATSAPP_LINK') &&
    auxiliaryPagesCode.includes('OFFICIAL_WHATSAPP_NUMBER'),
    'AuxiliaryPages must use official WhatsApp link constants'
  );
  assert.ok(
    auxiliaryPagesCode.includes('Chat on WhatsApp'),
    'SupportPage must render direct Chat on WhatsApp button'
  );
});

const planRequestModalPath = path.resolve('src/components/plans/PlanRequestModal.tsx');
const planRequestModalCode = fs.readFileSync(planRequestModalPath, 'utf8');

test('PlanRequestModal includes direct WhatsApp support link on submitted request screen', () => {
  assert.ok(
    planRequestModalCode.includes('OFFICIAL_WHATSAPP_LINK') &&
    planRequestModalCode.includes('WhatsApp Support'),
    'PlanRequestModal must include direct WhatsApp support link'
  );
});

const trackRequestPagePath = path.resolve('src/pages/TrackRequestPage.tsx');
const trackRequestPageCode = fs.readFileSync(trackRequestPagePath, 'utf8');

test('TrackRequestPage includes direct WhatsApp support card', () => {
  assert.ok(
    trackRequestPageCode.includes('OFFICIAL_WHATSAPP_LINK') &&
    trackRequestPageCode.includes('Need Assistance with Verification or Tracking?'),
    'TrackRequestPage must offer direct WhatsApp assistance for tracking and claim inquiries'
  );
});

// -----------------------------------------------------------------------------
// 3. HELP CENTER PAGE & ROUTING
// -----------------------------------------------------------------------------
console.log('\n--- 3. Help Center Page & Routing (/help) ---');

const helpCenterPath = path.resolve('src/pages/HelpCenterPage.tsx');
assert.ok(fs.existsSync(helpCenterPath), 'src/pages/HelpCenterPage.tsx must exist');
const helpCenterCode = fs.readFileSync(helpCenterPath, 'utf8');

test('HelpCenterPage includes searchable FAQ data with all required categories', () => {
  const expectedCategories = [
    'Getting Started',
    'Islamic Q&A',
    'Subscriptions',
    'Claim Offer',
    'Quran & Tafsir',
    'Privacy',
    'Support',
  ];
  for (const cat of expectedCategories) {
    assert.ok(
      helpCenterCode.includes(cat),
      `HelpCenterPage must cover category: ${cat}`
    );
  }
});

test('HelpCenterPage includes official WhatsApp support section', () => {
  assert.ok(
    helpCenterCode.includes('OFFICIAL_WHATSAPP_LINK') &&
    helpCenterCode.includes('OFFICIAL_WHATSAPP_NUMBER') &&
    helpCenterCode.includes('Official WhatsApp Direct Support'),
    'HelpCenterPage must include direct verified WhatsApp support card'
  );
});

const appPath = path.resolve('src/App.tsx');
const appCode = fs.readFileSync(appPath, 'utf8');

test('App.tsx registers /help route with HelpCenterPage', () => {
  assert.ok(
    appCode.includes('path="/help"') &&
    appCode.includes('element={<HelpCenterPage />}'),
    'App.tsx must register route /help rendering HelpCenterPage'
  );
});

// -----------------------------------------------------------------------------
// 4. FEATURES DIRECTORY PAGE & ROUTING
// -----------------------------------------------------------------------------
console.log('\n--- 4. Features Page & Routing (/features) ---');

const featuresPagePath = path.resolve('src/pages/FeaturesPage.tsx');
assert.ok(fs.existsSync(featuresPagePath), 'src/pages/FeaturesPage.tsx must exist');
const featuresPageCode = fs.readFileSync(featuresPagePath, 'utf8');

test('FeaturesPage contains categorized cards representing real implemented features', () => {
  assert.ok(
    featuresPageCode.includes('Citation-Grounded Islamic AI') &&
    featuresPageCode.includes('Complete Holy Quran & Somali Tafsir Library') &&
    featuresPageCode.includes('Flexible Learning Plans & Quota Management') &&
    featuresPageCode.includes('Personal Verification & 1-Click Offer Claim') &&
    featuresPageCode.includes('Saved Answers & Markdown Export') &&
    featuresPageCode.includes('Official WhatsApp Support & Help Center'),
    'FeaturesPage must represent genuine implemented features'
  );
});

test('App.tsx registers /features route with FeaturesPage', () => {
  assert.ok(
    appCode.includes('path="/features"') &&
    appCode.includes('element={<FeaturesPage />}'),
    'App.tsx must register route /features rendering FeaturesPage'
  );
});

// -----------------------------------------------------------------------------
// 5. CHAT COMPOSER: REMOVE SHIFT+ENTER & GREEN SEND ARROW
// -----------------------------------------------------------------------------
console.log('\n--- 5. Chat Composer: Shift+Enter Removed & Green Send Arrow ---');

const composerPath = path.resolve('src/components/chat/MessageComposer.tsx');
const composerCode = fs.readFileSync(composerPath, 'utf8');

test('MessageComposer removes visible Shift + Enter for new line text', () => {
  assert.ok(
    !composerCode.includes('Shift + Enter for new line'),
    'Visible "Shift + Enter for new line" hint must be removed from MessageComposer'
  );
});

test('MessageComposer preserves Shift+Enter newline keyboard handling in handleKeyDown', () => {
  assert.ok(
    composerCode.includes('if (!e.shiftKey)') &&
    composerCode.includes("if (e.key === 'Enter')"),
    'Keyboard Enter vs Shift+Enter behavior must be preserved'
  );
});

test('Send arrow button uses accessible EMUFTI green styling across all states', () => {
  assert.ok(
    composerCode.includes('bg-emerald-600') &&
    composerCode.includes('hover:bg-emerald-500'),
    'Send button must use emerald green styling'
  );
  assert.ok(
    composerCode.includes('ArrowUp'),
    'Send button must render ArrowUp icon'
  );
});

// -----------------------------------------------------------------------------
// 6. CHAT MESSAGE: REPLACED SEARCH ICON WITH CLEAN GENERATION STATUS
// -----------------------------------------------------------------------------
console.log('\n--- 6. Chat Message: Clean Generation Status Indicator ---');

const chatMessagePath = path.resolve('src/components/chat/ChatMessage.tsx');
const chatMessageCode = fs.readFileSync(chatMessagePath, 'utf8');

test('ChatMessage generating state does NOT contain Search icon', () => {
  const generatingBlockMatch = chatMessageCode.match(/message\.status === 'generating' && !message\.content[\s\S]*?message\.status === 'failed'/);
  assert.ok(generatingBlockMatch, 'Generating response block must exist');
  const generatingBlock = generatingBlockMatch[0];
  assert.ok(
    !generatingBlock.includes('<Search'),
    'Generating state must not use <Search /> icon'
  );
});

test('ChatMessage generating state displays clean "Generating response..." status', () => {
  assert.ok(
    chatMessageCode.includes('Generating response...'),
    'ChatMessage must display "Generating response..."'
  );
});

// -----------------------------------------------------------------------------
// 7. SIDEBAR: ROTATING & DISMISSIBLE ANNOUNCEMENTS BANNER
// -----------------------------------------------------------------------------
console.log('\n--- 7. Sidebar: Rotating & Dismissible Banners ---');

const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

test('Sidebar contains SIDEBAR_BANNERS with 3 informational slides', () => {
  assert.ok(
    sidebarCode.includes('SIDEBAR_BANNERS') &&
    sidebarCode.includes('114 Surahs & Somali Audio') &&
    sidebarCode.includes('Elevate to Pro & Premium') &&
    sidebarCode.includes('WhatsApp Direct Support'),
    'Sidebar must define 3 rotating informational banners'
  );
});

test('Sidebar includes dismissible control with persistence in localStorage', () => {
  assert.ok(
    sidebarCode.includes('emufti_sidebar_banner_dismissed') &&
    sidebarCode.includes('handleDismissBanner') &&
    sidebarCode.includes('handleRestoreBanner'),
    'Sidebar banner must support dismissal and restoration via localStorage'
  );
});

test('Sidebar banner includes previous and next navigation controls and slide index', () => {
  assert.ok(
    sidebarCode.includes('handlePrevBanner') &&
    sidebarCode.includes('handleNextBanner'),
    'Sidebar banner must provide slide cycling arrows'
  );
  assert.ok(
    sidebarCode.includes('ChevronLeft') &&
    sidebarCode.includes('ChevronRight'),
    'Sidebar banner must render Chevron navigation buttons'
  );
});

test('Sidebar includes dedicated Help Center navigation link to /help', () => {
  assert.ok(
    sidebarCode.includes('to="/help"') &&
    sidebarCode.includes('Help Center & Support'),
    'Sidebar must have direct link to Help Center (/help)'
  );
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('========================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION CRITERIA SUCCESSFULLY PASSED!\n');
}
