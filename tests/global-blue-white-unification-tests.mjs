import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('EMUFTI AI: GLOBAL BLUE & WHITE DESIGN SYSTEM UNIFICATION TESTS');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

// 1. Verify CSS variables and Tailwind tokens
console.log('--- 1. Design Tokens & CSS Variables ---');
const indexCss = fs.readFileSync('./src/index.css', 'utf8');
assert(indexCss.includes('--primary: 221 83% 53%'), 'Root CSS defines primary color as Royal Blue (221 83% 53%)');
assert(indexCss.includes('--accent: 214 95% 93%'), 'Root CSS defines accent color as Light Blue tint (214 95% 93%)');
assert(indexCss.includes('@keyframes floatSlow'), 'floatSlow keyframe animation is configured');
assert(indexCss.includes('@keyframes fadeInUp'), 'fadeInUp keyframe animation is configured');

const tailwindConfig = fs.readFileSync('./tailwind.config.js', 'utf8');
assert(tailwindConfig.includes("DEFAULT: 'hsl(var(--primary))'") && tailwindConfig.includes("600: '#2563eb'"), 'tailwind.config.js primary color scale uses royal blue #2563eb');
assert(tailwindConfig.includes("50: '#eff6ff'"), 'tailwind.config.js primary 50 scale defined as #eff6ff');

// 2. Active Application Pages: 0 emerald in active UI pages
console.log('\n--- 2. Active Application Pages Adherence ---');

const activePages = [
  { file: 'src/pages/DashboardPage.tsx', name: 'Dashboard Page' },
  { file: 'src/pages/FeaturesPage.tsx', name: 'Features Page' },
  { file: 'src/pages/AuthPages.tsx', name: 'Auth Pages (Login/Signup/Verify/Forgot)' },
  { file: 'src/components/auth/VerifyEmail.tsx', name: 'VerifyEmail Component' },
  { file: 'src/pages/PricingPage.tsx', name: 'Pricing & Plans Page' },
  { file: 'src/pages/SavedPage.tsx', name: 'Saved & Bookmarks Page' },
  { file: 'src/pages/TrackRequestPage.tsx', name: 'Track Request Page' },
  { file: 'src/pages/HelpCenterPage.tsx', name: 'Help Center Page' },
  { file: 'src/pages/AuxiliaryPages.tsx', name: 'Auxiliary Pages (Profile/Billing/Privacy/Terms/Support)' },
  { file: 'src/pages/AdminLoginPage.tsx', name: 'Admin Login Page' },
  { file: 'src/pages/SettingsPage.tsx', name: 'Settings Page' },
  { file: 'src/pages/MacallinPage.tsx', name: 'Macallin & Hifd Quran Page' },
  { file: 'src/components/quran/MacallinTeacher.tsx', name: 'MacallinTeacher Interactive Practice Component' },
  { file: 'src/pages/QuizPage.tsx', name: 'Islamic Quiz Page' },
  { file: 'src/pages/QuranPage.tsx', name: 'Digital Mushaf Quran Page' },
];

for (const p of activePages) {
  const content = fs.readFileSync(p.file, 'utf8');
  const emeraldCount = (content.match(/emerald/g) || []).length;
  const blueCount = (content.match(/blue/g) || []).length;
  assert(emeraldCount === 0, `${p.name} (${p.file}) has 0 emerald occurrences`);
  assert(blueCount > 0, `${p.name} uses blue accents (${blueCount} occurrences)`);
}

// 3. Shared Modals & Layout Components
console.log('\n--- 3. Shared Modals & Layout Components ---');

const activeComponents = [
  { file: 'src/components/plans/PlanRequestModal.tsx', name: 'PlanRequestModal' },
  { file: 'src/components/chat/PlanActivationBanner.tsx', name: 'PlanActivationBanner' },
  { file: 'src/components/chat/ChatSearchModal.tsx', name: 'ChatSearchModal' },
  { file: 'src/components/chat/ConversationHistoryDrawer.tsx', name: 'ConversationHistoryDrawer' },
  { file: 'src/components/chat/EMuftiQuizBanner.tsx', name: 'EMuftiQuizBanner' },
  { file: 'src/components/chat/Modals.tsx', name: 'Chat Modals (Share/Export/Clear)' },
  { file: 'src/components/chat/QuotaModal.tsx', name: 'QuotaModal' },
  { file: 'src/components/chat/RamadanOfferBanner.tsx', name: 'RamadanOfferBanner' },
  { file: 'src/components/common/CircularPlanAvatar.tsx', name: 'CircularPlanAvatar', allowProGreen: true },
  { file: 'src/components/common/SubscriptionBadge.tsx', name: 'SubscriptionBadge', allowProGreen: true },
  { file: 'src/components/common/Logo.tsx', name: 'Logo Component' },
  { file: 'src/components/common/PhoneInputWithCountry.tsx', name: 'PhoneInputWithCountry' },
  { file: 'src/components/layout/BottomNavigation.tsx', name: 'BottomNavigation' },
  { file: 'src/components/layout/ErrorBoundary.tsx', name: 'ErrorBoundary' },
  { file: 'src/components/layout/ProtectedRoute.tsx', name: 'ProtectedRoute' },
  { file: 'src/components/layout/ReferencePanel.tsx', name: 'ReferencePanel' },
];

for (const c of activeComponents) {
  const content = fs.readFileSync(c.file, 'utf8');
  const emeraldCount = (content.match(/emerald/g) || []).length;
  const blueCount = (content.match(/blue/g) || []).length;
  if (c.allowProGreen) {
    assert(emeraldCount <= 6, `${c.name} preserves semantic green for PRO subscription badge (${emeraldCount} occurrences)`);
  } else {
    assert(emeraldCount === 0, `${c.name} (${c.file}) has 0 emerald occurrences`);
  }
  assert(blueCount > 0, `${c.name} uses blue styling (${blueCount} occurrences)`);
}

// 4. Admin Portal Integrity & Styling
console.log('\n--- 4. Admin Portal Integrity & Styling ---');
const adminPageContent = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
const adminEmeraldCount = (adminPageContent.match(/emerald/g) || []).length;
assert(adminEmeraldCount <= 2, `AdminPage.tsx preserves only semantic status indicators (${adminEmeraldCount} status dots)`);
assert(adminPageContent.includes('from-blue-950/20 via-slate-900 to-slate-900'), 'Admin reply composer uses blue gradient accent');
assert(adminPageContent.includes('text-blue-600') && adminPageContent.includes('bg-blue-600'), 'AdminPage controls and badges use royal blue');

// 5. ThemeContext Default Setting
console.log('\n--- 5. ThemeContext Default & Accent Colors ---');
const themeContext = fs.readFileSync('src/context/ThemeContext.tsx', 'utf8');
assert(themeContext.includes("id: 'blue'"), 'ThemeContext includes royal blue accent');
assert(themeContext.includes("|| 'blue'"), 'ThemeContext defaults to blue accent');

console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests === 0) {
  console.log('ALL GLOBAL BLUE & WHITE DESIGN UNIFICATION TESTS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
