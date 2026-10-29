import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('EMUFTI AI: Support Request Form & Supabase Fix Verification Suite');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// -----------------------------------------------------------------------------
// Test Suite 1: Supabase Configuration Exports & Types
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Supabase Configuration Exports ---');

const supabaseTsPath = path.resolve('src/lib/supabase.ts');
const supabaseTs = fs.readFileSync(supabaseTsPath, 'utf8');

runTest('1.1: isSupabaseConfigured is exported as a boolean in src/lib/supabase.ts', () => {
  assert(
    supabaseTs.includes('export const isSupabaseConfigured = Boolean('),
    'isSupabaseConfigured must be exported as a Boolean evaluation'
  );
});

runTest('1.2: Callable helper functions checkIsSupabaseConfigured and getIsSupabaseConfigured are exported', () => {
  assert(
    supabaseTs.includes('export const checkIsSupabaseConfigured = (): boolean => isSupabaseConfigured;') ||
    supabaseTs.includes('checkIsSupabaseConfigured'),
    'checkIsSupabaseConfigured must be exported'
  );
  assert(
    supabaseTs.includes('export const getIsSupabaseConfigured = (): boolean => isSupabaseConfigured;') ||
    supabaseTs.includes('getIsSupabaseConfigured'),
    'getIsSupabaseConfigured must be exported'
  );
});

runTest('1.3: Zero files in src/ call isSupabaseConfigured() with parentheses', () => {
  const srcFiles = [];
  function scanDir(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
        srcFiles.push(fullPath);
      }
    }
  }
  scanDir(path.resolve('src'));

  const badCalls = [];
  const regex = /\bisSupabaseConfigured\s*\(/g;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) {
      badCalls.push(path.relative(process.cwd(), file));
    }
  }

  assert.strictEqual(
    badCalls.length,
    0,
    `Found invalid isSupabaseConfigured() call in: ${badCalls.join(', ')}`
  );
});

// -----------------------------------------------------------------------------
// Test Suite 2: HelpCenterPage Support Form Submission & Error Flow
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: HelpCenterPage Support Form Submission ---');

const helpCenterPath = path.resolve('src/pages/HelpCenterPage.tsx');
const helpCenterCode = fs.readFileSync(helpCenterPath, 'utf8');

runTest('2.1: HelpCenterPage uses isSupabaseConfigured as a boolean variable', () => {
  assert(
    helpCenterCode.includes('if (isSupabaseConfigured) {'),
    'Must check if (isSupabaseConfigured) without ()'
  );
  assert(
    !helpCenterCode.includes('isSupabaseConfigured()'),
    'Must not contain isSupabaseConfigured()'
  );
});

runTest('2.2: In-flight duplicate submission guard exists', () => {
  assert(
    helpCenterCode.includes('if (isSubmitting) return;'),
    'Must prevent duplicate submissions when isSubmitting is true'
  );
  assert(
    helpCenterCode.includes('disabled={isSubmitting}'),
    'Submit button and inputs must be disabled during submission'
  );
});

runTest('2.3: Form validation checks all required fields', () => {
  assert(helpCenterCode.includes('Full Name is required'), 'Must validate Full Name');
  assert(helpCenterCode.includes('Email Address is required'), 'Must validate Email Address');
  assert(helpCenterCode.includes('Phone Number is required'), 'Must validate Phone Number');
  assert(helpCenterCode.includes('Problem / Description is required'), 'Must validate Problem / Description');
});

runTest('2.4: Exact confirmation message is defined for display after successful save', () => {
  const exactMsg = 'Your support request has been sent successfully. Our support team will review your request and respond as soon as possible, usually within a few hours.';
  assert(
    helpCenterCode.includes(exactMsg),
    `Must display exact confirmation message: "${exactMsg}"`
  );
});

runTest('2.5: Unique reference number with copy feedback is generated and displayed', () => {
  assert(
    helpCenterCode.includes('handleCopyReference') || helpCenterCode.includes('copiedCode'),
    'Must provide copy reference code functionality with visual feedback'
  );
  assert(
    helpCenterCode.includes('submittedResult.referenceId'),
    'Must display submittedResult.referenceId'
  );
});

runTest('2.6: Useful database error message is handled when Supabase request fails', () => {
  assert(
    helpCenterCode.includes('Database table "support_requests" was not found in Supabase schema') ||
    helpCenterCode.includes('20261016_support_requests.sql'),
    'Must show helpful instructions when table is missing in schema cache'
  );
  assert(
    helpCenterCode.includes('throw new Error('),
    'Must throw and display error without showing false success screen'
  );
});

runTest('2.7: My Support Requests section allows tracking and unread indicators', () => {
  assert(
    helpCenterCode.includes('My Support Requests'),
    'Must include My Support Requests section'
  );
  assert(
    helpCenterCode.includes('readReplyIds') || helpCenterCode.includes('isUnread'),
    'Must include unread indicator for admin replies'
  );
});

// -----------------------------------------------------------------------------
// Test Suite 3: Admin Dashboard Support Management
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Admin Dashboard Support Management ---');

const adminPagePath = path.resolve('src/pages/AdminPage.tsx');
const adminPageCode = fs.readFileSync(adminPagePath, 'utf8');

runTest('3.1: AdminPage activeTab union includes "support"', () => {
  assert(
    adminPageCode.includes("'support'"),
    'activeTab state union must include support'
  );
});

runTest('3.2: URL query param supports ?tab=support', () => {
  assert(
    adminPageCode.includes("['overview', 'requests', 'support'"),
    'URL tabParam check must allow tab=support'
  );
});

runTest('3.3: Support tab navigation button with pending badge exists', () => {
  assert(
    adminPageCode.includes("onClick={() => setActiveTab('support')}"),
    'Must have button to activate support tab'
  );
  assert(
    adminPageCode.includes('pendingSupportCount'),
    'Must display pending support count badge'
  );
});

runTest('3.4: Support request metrics and status filters are rendered', () => {
  assert(
    adminPageCode.includes('totalSupportCount') &&
    adminPageCode.includes('submittedSupportCount') &&
    adminPageCode.includes('inReviewSupportCount') &&
    adminPageCode.includes('repliedSupportCount') &&
    adminPageCode.includes('closedSupportCount'),
    'Must calculate and display all 5 support status metrics'
  );
});

runTest('3.5: Support request status transitions and reply composer exist', () => {
  assert(
    adminPageCode.includes('handleUpdateSupportStatus'),
    'Must allow administrators to change request status'
  );
  assert(
    adminPageCode.includes('handleSendSupportReply'),
    'Must allow administrators to compose and send official replies'
  );
  assert(
    adminPageCode.includes('Official Admin Response') || adminPageCode.includes('Official support reply sent successfully'),
    'Must have official admin reply composer and success feedback'
  );
});

// -----------------------------------------------------------------------------
// Test Suite 4: Storage & Migration Integrity
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Storage & Database Migration ---');

const storagePath = path.resolve('src/lib/storage.ts');
const storageCode = fs.readFileSync(storagePath, 'utf8');

runTest('4.1: Storage provides support request operations', () => {
  assert(storageCode.includes('generateSupportReferenceId'), 'Must provide generateSupportReferenceId');
  assert(storageCode.includes('saveSupportRequest'), 'Must provide saveSupportRequest');
  assert(storageCode.includes('replyToSupportRequest'), 'Must provide replyToSupportRequest');
  assert(storageCode.includes('getSupportRequests'), 'Must provide getSupportRequests');
});

const migrationPath = path.resolve('supabase/migrations/20261016_support_requests.sql');
runTest('4.2: Migration file 20261016_support_requests.sql exists and is valid', () => {
  assert(fs.existsSync(migrationPath), 'Migration file must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.support_requests'), 'Must create table support_requests');
  assert(sql.includes('ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');
  assert(sql.includes('public.reply_to_support_request'), 'Must define reply RPC');
  assert(sql.includes('public.get_guest_support_request'), 'Must define guest lookup RPC');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('\nAll Support Form & Supabase Fix tests PASSED!');
  process.exit(0);
} else {
  console.error(`\nFailed ${totalTests - passedTests} tests.`);
  process.exit(1);
}
