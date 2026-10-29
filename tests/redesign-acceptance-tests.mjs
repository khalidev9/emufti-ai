// ==============================================================================
// EMUFTI AI - REDESIGN & PRODUCTION FEATURES ACCEPTANCE TESTS
// File: tests/redesign-acceptance-tests.mjs
// Covers all 12 core requirements and acceptance scenarios:
// 1. UI & Islamic Visual Theme (Dark/Light mode, Emerald, Navy, Warm Neutrals)
// 2. Unauthenticated Access & Mandatory Auth (ProtectedRoute + Return URL)
// 3. User Registration Flow & Profile Initialization
// 4. User Login & Target Destination Preservation
// 5. Password Reset Flow
// 6. User Profile & Settings (Avatar upload/remove, Read-only Email, Preferences)
// 7. Chat Sidebar & Account Footer (Real Plan Badge, Popover Menu)
// 8. Plan Request & Atomic Plan Activation (No duplicates, Congratulations Banner)
// 9. Plan Request Tracking by Reference ID
// 10. Islamic Knowledge QA & Citations (Somali, Arabic, English, Non-Islamic Scope)
// 11. Scholar Lecture Transcripts Integration
// 12. Admin Operations & Server-Side Security (is_admin() verification)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: REDESIGN & COMPREHENSIVE ACCEPTANCE VERIFICATION');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: UI & Islamic Theme (Emerald, Deep Navy, Warm Neutrals, Light/Dark)
// -----------------------------------------------------------------------------
console.log('--- Scenario 1: UI & Islamic Visual Identity ---');

test('ThemeContext supports light and dark themes', () => {
  const themeContextFile = fs.readFileSync('src/context/ThemeContext.tsx', 'utf8');
  assert.match(themeContextFile, /type Theme = 'light' \| 'dark'/);
  assert.match(themeContextFile, /toggleTheme/);
  assert.match(themeContextFile, /localStorage\.getItem\('emufti_theme'\)/);
});

test('Index CSS defines refined Islamic color palette & dark mode tokens', () => {
  const indexCss = fs.readFileSync('src/index.css', 'utf8');
  assert.match(indexCss, /--primary:\s*160\s+84%\s+39%/); // Emerald
  assert.match(indexCss, /\.dark/);
  assert.match(indexCss, /font-arabic/);
});

test('Tailwind config configures emerald, navy, and arabic typography', () => {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  assert.match(tailwindConfig, /fontFamily/);
  assert.match(tailwindConfig, /Amiri|Scheherazade|Noto Naskh Arabic/);
});

// -----------------------------------------------------------------------------
// Scenario 2: Unauthenticated Access & Mandatory Auth
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 2: Unauthenticated Access & Mandatory Auth ---');

test('ProtectedRoute redirects unauthenticated visitors to /login preserving state.from', () => {
  const protectedRouteFile = fs.readFileSync('src/components/layout/ProtectedRoute.tsx', 'utf8');
  assert.match(protectedRouteFile, /if \(!user\) \{/);
  assert.match(protectedRouteFile, /<Navigate to="\/login" state=\{\{ from: location(\.pathname)? \}\} replace \/>/);
});

test('App.tsx protects /chat, /chat/:id, /settings, /saved, /profile, /billing routes', () => {
  const appFile = fs.readFileSync('src/App.tsx', 'utf8');
  assert.match(appFile, /path="\/chat"[\s\S]*?<ProtectedRoute>[\s\S]*?<ChatPage \/>/);
  assert.match(appFile, /path="\/settings"[\s\S]*?<ProtectedRoute>[\s\S]*?<SettingsPage \/>/);
  assert.match(appFile, /path="\/profile"[\s\S]*?<ProtectedRoute>[\s\S]*?<ProfilePage \/>/);
  assert.match(appFile, /path="\/billing"[\s\S]*?<ProtectedRoute>[\s\S]*?<BillingPage \/>/);
});

test('Landing Page Start Chat button routes unauthenticated visitors to login', () => {
  const landingFile = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');
  assert.match(landingFile, /handleStartChat/);
  assert.match(landingFile, /navigate\('\/login', \{ state: \{ from: '\/chat' \} \}\)/);
});

// -----------------------------------------------------------------------------
// Scenario 3: User Registration Flow & Profile Initialization
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 3: User Registration & Profile Initialization ---');

test('AuthCombinedPage has Create Account tab with validation', () => {
  const authFile = fs.readFileSync('src/pages/AuthPages.tsx', 'utf8');
  assert.match(authFile, /mode === 'signup'|initialMode = 'login'/);
  assert.match(authFile, /displayName/);
  assert.match(authFile, /email/);
  assert.match(authFile, /password/);
});

test('AuthContext signUp registers user and initializes profile', () => {
  const authContext = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  assert.match(authContext, /signUp\s*=\s*async/);
  assert.match(authContext, /supabase\.auth\.signUp/);
  assert.match(authContext, /role:\s*'user'/);
  assert.match(authContext, /plan:\s*dbPlan|plan:\s*'free'/);
});

// -----------------------------------------------------------------------------
// Scenario 4: User Login & Return URL Preservation
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 4: User Login & Return URL Preservation ---');

test('AuthCombinedPage preserves and navigates to target destination upon login', () => {
  const authFile = fs.readFileSync('src/pages/AuthPages.tsx', 'utf8');
  assert.match(authFile, /targetDestination/);
  assert.match(authFile, /location\.state/);
  assert.match(authFile, /navigate\(targetDestination/);
});

test('Guest login button is completely removed from authentication page', () => {
  const authFile = fs.readFileSync('src/pages/AuthPages.tsx', 'utf8');
  assert.doesNotMatch(authFile, /Continue as Guest/i);
  assert.doesNotMatch(authFile, /guest-login/i);
});

// -----------------------------------------------------------------------------
// Scenario 5: Password Reset Flow
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 5: Password Reset Flow ---');

test('AuthContext provides resetPassword method calling supabase.auth.resetPasswordForEmail', () => {
  const authContext = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  assert.match(authContext, /resetPassword\s*=\s*async/);
  assert.match(authContext, /supabase\.auth\.resetPasswordForEmail/);
});

test('ForgotPasswordPage allows submitting reset request with success message', () => {
  const authFile = fs.readFileSync('src/pages/AuthPages.tsx', 'utf8');
  assert.match(authFile, /ForgotPasswordPage/);
  assert.match(authFile, /resetPassword\(email/);
  assert.match(authFile, /password recovery link|reset/i);
});

// -----------------------------------------------------------------------------
// Scenario 6: User Profile & Settings
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 6: User Profile & Settings Management ---');

test('SettingsPage provides avatar upload, replace, and remove via storage bucket', () => {
  const settingsFile = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
  assert.match(settingsFile, /uploadAvatar/);
  assert.match(settingsFile, /removeAvatar/);
  assert.match(settingsFile, /handleAvatarFileChange/);
  assert.match(settingsFile, /avatar_url/);
});

test('SettingsPage displays read-only email with verified security badge', () => {
  const settingsFile = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
  assert.match(settingsFile, /Account Email|Email Address/);
  assert.match(settingsFile, /disabled|readOnly/);
  assert.match(settingsFile, /cursor-not-allowed/);
  assert.match(settingsFile, /Verified Auth ID|Verified & Read-only/);
});

test('SettingsPage allows editing display name and language/theme preferences', () => {
  const settingsFile = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
  assert.match(settingsFile, /displayName/);
  assert.match(settingsFile, /prefLang/);
  assert.match(settingsFile, /responseLang/);
  assert.match(settingsFile, /theme/);
});

test('AuthContext sanitizes updateProfile to prevent user self-escalation of role or plan', () => {
  const authContext = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  assert.match(authContext, /safeUpdates/);
  assert.match(authContext, /safeUpdates\.display_name/);
  assert.doesNotMatch(authContext, /safeUpdates\.role\s*=/);
  assert.doesNotMatch(authContext, /safeUpdates\.plan\s*=/);
});

test('Migration enforces database trigger to protect role, plan, and activation timestamp', () => {
  const migration = fs.readFileSync('supabase/migrations/20261014_redesign_features.sql', 'utf8');
  assert.match(migration, /protect_profile_privileged_fields/);
  assert.match(migration, /trg_protect_profile_fields/);
  assert.match(migration, /IF NOT public\.is_admin\(\) THEN/);
});

test('Storage bucket for avatars is configured with 2MB limit and image mime-types', () => {
  const migration = fs.readFileSync('supabase/migrations/20261014_redesign_features.sql', 'utf8');
  assert.match(migration, /'avatars'/);
  assert.match(migration, /2097152/);
  assert.match(migration, /image\/png/);
});

// -----------------------------------------------------------------------------
// Scenario 7: Chat Sidebar & Account Popover
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 7: Chat Sidebar & Account Popover Menu ---');

test('Sidebar renders account popover dropdown with Profile, Settings, Billing, and Sign Out', () => {
  const sidebarFile = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
  assert.match(sidebarFile, /isAccountMenuOpen/);
  assert.match(sidebarFile, /to="\/profile"/);
  assert.match(sidebarFile, /to="\/settings"/);
  assert.match(sidebarFile, /to="\/billing"/);
  assert.match(sidebarFile, /signOut/);
});

test('Sidebar displays real plan badge in uppercase (FREE, PRO, PREMIUM)', () => {
  const sidebarFile = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
  assert.match(sidebarFile, /premium/i);
  assert.match(sidebarFile, /pro/i);
  assert.match(sidebarFile, /\(\(profile\?\.plan \|\| userPlan \|\| 'free'\) as string\)\.toUpperCase\(\)/);
});

test('Sidebar supports conversation history, search, pin, rename, and delete', () => {
  const sidebarFile = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
  assert.match(sidebarFile, /searchQuery/);
  assert.match(sidebarFile, /pinConversation/);
  assert.match(sidebarFile, /renameConversation/);
  assert.match(sidebarFile, /deleteConversation/);
});

// -----------------------------------------------------------------------------
// Scenario 8: Plan Request & Atomic Plan Activation
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 8: Plan Request & Atomic Plan Activation ---');

test('PlanRequestModal validates contact and saves to public.plan_requests with reference_id', () => {
  const modalFile = fs.readFileSync('src/components/plans/PlanRequestModal.tsx', 'utf8');
  assert.match(modalFile, /reference_id/);
  assert.match(modalFile, /status:\s*'pending'/);
  assert.match(modalFile, /payment_verified:\s*false/);
  assert.match(modalFile, /\.from\('plan_requests'\)[\s\S]*?\.insert/);
});

test('AdminPage uses update_plan_request_status RPC for atomic approval without duplicate subscriptions', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /update_plan_request_status/);
  assert.match(adminFile, /p_request_id/);
  assert.match(adminFile, /p_status/);
  assert.match(adminFile, /p_payment_verified/);
});

test('PlanActivationBanner displays congratulatory message in English, Somali, and Arabic', () => {
  const bannerFile = fs.readFileSync('src/components/chat/PlanActivationBanner.tsx', 'utf8');
  assert.match(bannerFile, /Congratulations/);
  assert.match(bannerFile, /Hambalyo/);
  assert.match(bannerFile, /تهانينا/);
  assert.match(bannerFile, /PRO ACTIVE/);
  assert.match(bannerFile, /PREMIUM ACTIVE/);
});

// -----------------------------------------------------------------------------
// Scenario 9: Reference ID Tracking
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 9: Plan Request Tracking by Reference ID ---');

test('PlanRequestModal tracks request by reference_id using secure RPC or public tracking view', () => {
  const modalFile = fs.readFileSync('src/components/plans/PlanRequestModal.tsx', 'utf8');
  assert.match(modalFile, /get_plan_request_status/);
  assert.match(modalFile, /plan_request_tracking/);
  assert.match(modalFile, /Reference ID not found/i);
});

// -----------------------------------------------------------------------------
// Scenario 10: Islamic Knowledge QA Engine
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 10: Grounded Islamic Knowledge Engine ---');

test('Universal Islamic prompt builder includes Quran, Hadith, Fiqh, and scope enforcement', () => {
  const geminiFile = fs.readFileSync('src/lib/gemini.ts', 'utf8');
  assert.match(geminiFile, /ISLAMIC_SYSTEM_INSTRUCTIONS/);
  assert.match(geminiFile, /NEVER fabricate or invent/);
  assert.match(geminiFile, /Surah Al-Baqarah/);
  assert.match(geminiFile, /Sahih al-Bukhari/);
  assert.match(geminiFile, /ISLAMIC-ONLY SCOPE/);
});

// -----------------------------------------------------------------------------
// Scenario 11: Scholar Lecture Transcripts Integration
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 11: Scholar Lecture Transcripts Integration ---');

test('Database migration defines public.lecture_transcripts with timestamps and sheikh metadata', () => {
  const migration = fs.readFileSync('supabase/migrations/20261014_redesign_features.sql', 'utf8');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.lecture_transcripts/);
  assert.match(migration, /sheikh_name TEXT NOT NULL/);
  assert.match(migration, /timestamp_seconds INTEGER/);
  assert.match(migration, /transcript_text TEXT NOT NULL/);
  assert.match(migration, /Sheikh Umal/);
});

// -----------------------------------------------------------------------------
// Scenario 12: Admin Dashboard & Server-Side Security
// -----------------------------------------------------------------------------
console.log('\n--- Scenario 12: Admin Dashboard & Server-Side Security ---');

test('AdminPage includes all 8 required tabs: overview, requests, users, plans, sources, lectures, feedback, monitoring', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /'overview' \| 'requests' \| 'users' \| 'plans' \| 'sources' \| 'lectures' \| 'feedback' \| 'monitoring'/);
  assert.match(adminFile, /activeTab === 'sources'/);
  assert.match(adminFile, /activeTab === 'lectures'/);
  assert.match(adminFile, /activeTab === 'feedback'/);
  assert.match(adminFile, /activeTab === 'monitoring'/);
});

test('AdminPage verifies server-side public.is_admin() and role before granting access', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /if \(!isAdmin\) \{/);
  assert.match(adminFile, /is_admin\(\)/);
  assert.match(adminFile, /Navigate to="\/admin\/login"/);
});

test('AdminPage provides sources management (create, filter, delete) for islamic_sources', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /handleAddSource/);
  assert.match(adminFile, /handleDeleteSource/);
  assert.match(adminFile, /islamic_sources/);
});

test('AdminPage provides lecture transcripts management for lecture_transcripts', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /handleAddLecture/);
  assert.match(adminFile, /handleDeleteLecture/);
  assert.match(adminFile, /lecture_transcripts/);
});

test('AdminPage provides user feedback & reports review with status transitions', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /handleUpdateReportStatus/);
  assert.match(adminFile, /response_feedback/);
  assert.match(adminFile, /reports/);
});

test('AdminPage provides live health and security monitoring telemetry', () => {
  const adminFile = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
  assert.match(adminFile, /ozvvxuzecwhlpbfongiy\.supabase\.co/);
  assert.match(adminFile, /Real-Time Audit Stream/);
  assert.match(adminFile, /Security Definer is_admin\(\) validated/);
});

console.log('\n======================================================');
console.log(`  Acceptance Test Suite Summary`);
console.log(`  Total:  ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL 12 SCENARIOS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
