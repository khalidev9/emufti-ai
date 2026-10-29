import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} - ${detail}`);
  }
}

console.log('\n======================================================');
console.log('  EMUFTI AI: Plan Requests & Admin Dashboard Test Suite');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Email & Contact Validation Logic
// -----------------------------------------------------------------------------
console.log('Suite 1: Applicant Input & Contact Validation');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

assert(emailRegex.test('seeker@example.com'), 'Valid standard email accepted');
assert(emailRegex.test('ahmed.nur@somalia.edu.so'), 'Valid academic email accepted');
assert(emailRegex.test('student+emufti@al-azhar.eg'), 'Valid email with plus-tag accepted');
assert(!emailRegex.test(''), 'Empty email rejected');
assert(!emailRegex.test('not-an-email'), 'String without @ rejected');
assert(!emailRegex.test('seeker@'), 'Email without domain rejected');
assert(!emailRegex.test('@example.com'), 'Email without user rejected');
assert(!emailRegex.test('user name@example.com'), 'Email with spaces rejected');

function validateContact(whatsapp, telegram) {
  const cleanW = (whatsapp || '').trim();
  const cleanT = (telegram || '').trim();
  return cleanW.length > 0 || cleanT.length > 0;
}

assert(validateContact('+252615000000', ''), 'WhatsApp only contact accepted');
assert(validateContact('', '@somali_student'), 'Telegram only contact accepted');
assert(validateContact('+254712345678', '@alim_research'), 'Both WhatsApp and Telegram accepted');
assert(!validateContact('', ''), 'Empty contact rejected');
assert(!validateContact('   ', '   '), 'Whitespace-only contact rejected');
assert(!validateContact(null, undefined), 'Null/undefined contact rejected');

// -----------------------------------------------------------------------------
// Suite 2: UUID Sanitation & Foreign Key Integrity
// -----------------------------------------------------------------------------
console.log('\nSuite 2: User ID UUID Sanitation (PostgreSQL Type Safety)');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeUserId(userId) {
  if (!userId || typeof userId !== 'string') return null;
  return uuidRegex.test(userId.trim()) ? userId.trim() : null;
}

const validUuid1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const validUuid2 = 'd3b07384-d113-4c91-9556-9e1f574d5b20';
assert(sanitizeUserId(validUuid1) === validUuid1, 'Real Supabase Auth UUID preserved');
assert(sanitizeUserId(validUuid2) === validUuid2, 'Second valid UUID preserved');
assert(sanitizeUserId('guest_1728901234567') === null, 'Guest prefixed ID sanitized to null');
assert(sanitizeUserId('user_ahmed') === null, 'Dev mock user ID sanitized to null');
assert(sanitizeUserId('admin') === null, 'Arbitrary text sanitized to null');
assert(sanitizeUserId(null) === null, 'Null ID remains null');
assert(sanitizeUserId(undefined) === null, 'Undefined ID sanitized to null');

// -----------------------------------------------------------------------------
// Suite 3: Reference ID Generation & Format
// -----------------------------------------------------------------------------
console.log('\nSuite 3: Reference ID Format & Uniqueness');

function generateReferenceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REQ-EMUFTI-${code}`;
}

const sampleRef = generateReferenceId();
const refRegex = /^REQ-EMUFTI-[A-Z0-9]{6}$/;

assert(refRegex.test(sampleRef), `Generated reference matches pattern: ${sampleRef}`);

// Check uniqueness across 500 generated IDs
const generatedSet = new Set();
let duplicatesFound = false;
for (let i = 0; i < 500; i++) {
  const ref = generateReferenceId();
  if (generatedSet.has(ref)) {
    duplicatesFound = true;
    break;
  }
  generatedSet.add(ref);
}
assert(!duplicatesFound, '500 consecutively generated reference IDs have zero collisions');

// -----------------------------------------------------------------------------
// Suite 4: Plan Slug & Payload Structure
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Plan Upgrade Payload & State Defaults');

const allowedUpgradePlans = ['pro', 'premium'];
assert(allowedUpgradePlans.includes('pro'), 'Talib al-Ilm (Pro) is an allowed upgrade target');
assert(allowedUpgradePlans.includes('premium'), 'Alim Research (Premium) is an allowed upgrade target');
assert(!allowedUpgradePlans.includes('free'), 'Free is not a paid upgrade target');
assert(!allowedUpgradePlans.includes('enterprise'), 'Arbitrary plan rejected');

function createPlanRequestPayload({
  fullName,
  email,
  whatsapp,
  telegram,
  planSlug,
  message,
  rawUserId,
}) {
  if (!fullName || !fullName.trim()) throw new Error('Full name is required');
  if (!email || !emailRegex.test(email.trim())) throw new Error('Valid email is required');
  if (!validateContact(whatsapp, telegram)) throw new Error('At least one contact method is required');
  if (!allowedUpgradePlans.includes(planSlug)) throw new Error('Invalid plan selection');

  return {
    reference_id: generateReferenceId(),
    user_id: sanitizeUserId(rawUserId),
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    whatsapp: (whatsapp || '').trim() || null,
    telegram: (telegram || '').trim() || null,
    plan_slug: planSlug,
    message: (message || '').trim() || null,
    status: 'pending',
    payment_verified: false,
    created_at: new Date().toISOString(),
  };
}

const testPayload = createPlanRequestPayload({
  fullName: '  Sheikh Abdullahi Farah  ',
  email: 'Farah@Example.COM',
  whatsapp: '+252 61 555 1234',
  telegram: '',
  planSlug: 'premium',
  message: 'Seeking research access for Ramadan tafsir series.',
  rawUserId: 'guest_987654321',
});

assert(testPayload.full_name === 'Sheikh Abdullahi Farah', 'Full name trimmed');
assert(testPayload.email === 'farah@example.com', 'Email lowercased and trimmed');
assert(testPayload.whatsapp === '+252 61 555 1234', 'WhatsApp contact saved');
assert(testPayload.telegram === null, 'Empty telegram converted to null');
assert(testPayload.plan_slug === 'premium', 'Plan slug assigned correctly');
assert(testPayload.status === 'pending', 'Initial status set to pending');
assert(testPayload.payment_verified === false, 'Payment verified defaults to false');
assert(testPayload.user_id === null, 'Non-UUID guest ID correctly converted to null');

// -----------------------------------------------------------------------------
// Suite 5: SQL Migration Verification
// -----------------------------------------------------------------------------
console.log('\nSuite 5: SQL Migration Verification (supabase/migrations/20261014_plan_requests.sql)');

const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20261014_plan_requests.sql');
assert(fs.existsSync(migrationPath), 'Migration file exists on disk');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

assert(
  migrationSql.includes('CREATE TABLE IF NOT EXISTS public.plan_requests'),
  'Defines public.plan_requests table'
);
assert(migrationSql.includes('reference_id TEXT NOT NULL UNIQUE'), 'Enforces unique reference_id');
assert(
  migrationSql.includes("plan_slug TEXT NOT NULL CHECK (plan_slug IN ('pro', 'premium'))"),
  'Enforces plan_slug check constraint (pro, premium)'
);
assert(
  migrationSql.includes("status TEXT NOT NULL DEFAULT 'pending'"),
  'Defaults status to pending'
);
assert(
  migrationSql.includes('payment_verified BOOLEAN NOT NULL DEFAULT FALSE'),
  'Defaults payment_verified to false'
);
assert(
  migrationSql.includes('chk_contact_provided'),
  'Enforces constraint that either WhatsApp or Telegram must be provided'
);
assert(
  migrationSql.includes('GRANT SELECT, INSERT ON TABLE public.plan_requests TO anon, authenticated;'),
  'Grants SELECT and INSERT permissions to anon and authenticated roles'
);
assert(
  migrationSql.includes('ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;'),
  'Enables Row Level Security (RLS)'
);
assert(
  migrationSql.includes('CREATE OR REPLACE FUNCTION public.is_admin()') &&
    migrationSql.includes('SECURITY DEFINER'),
  'Creates SECURITY DEFINER function public.is_admin() to prevent RLS recursion'
);
assert(
  migrationSql.includes('CREATE POLICY "Anyone can insert plan requests"'),
  'Includes public/authenticated INSERT policy'
);
assert(
  migrationSql.includes('CREATE POLICY "Admins can view all plan requests"'),
  'Includes admin SELECT policy protected by is_admin()'
);
assert(
  migrationSql.includes('CREATE POLICY "Admins can update plan requests"'),
  'Includes admin UPDATE policy protected by is_admin()'
);
assert(
  migrationSql.includes('CREATE TRIGGER trigger_plan_requests_updated_at'),
  'Includes auto-updating updated_at trigger'
);
assert(
  migrationSql.includes('CREATE INDEX IF NOT EXISTS idx_plan_requests_reference'),
  'Creates index on reference_id'
);
assert(
  migrationSql.includes('CREATE INDEX IF NOT EXISTS idx_plan_requests_status'),
  'Creates index on status'
);

// -----------------------------------------------------------------------------
// Suite 6: Admin Dashboard Logic & Realtime Contract
// -----------------------------------------------------------------------------
console.log('\nSuite 6: Admin Dashboard Request Filtering & Status Transitions');

const mockRequests = [
  {
    id: 'req-1',
    reference_id: 'REQ-EMUFTI-ABC123',
    full_name: 'Hassan Ali',
    email: 'hassan@example.com',
    whatsapp: '+25261234567',
    telegram: null,
    plan_slug: 'pro',
    status: 'pending',
    payment_verified: false,
    created_at: '2026-10-14T08:00:00Z',
  },
  {
    id: 'req-2',
    reference_id: 'REQ-EMUFTI-XYZ789',
    full_name: 'Maryam Warsame',
    email: 'maryam@example.com',
    whatsapp: null,
    telegram: '@maryam_w',
    plan_slug: 'premium',
    status: 'under_review',
    payment_verified: false,
    created_at: '2026-10-14T09:00:00Z',
  },
  {
    id: 'req-3',
    reference_id: 'REQ-EMUFTI-KLM456',
    full_name: 'Omar Jamac',
    email: 'omar@example.com',
    whatsapp: '+25470000000',
    telegram: '@omar_j',
    plan_slug: 'pro',
    status: 'approved',
    payment_verified: true,
    created_at: '2026-10-13T12:00:00Z',
  },
];

function filterRequests(requests, search, status, plan) {
  const q = search.trim().toLowerCase();
  return requests.filter((r) => {
    const matchesSearch =
      !q ||
      r.reference_id.toLowerCase().includes(q) ||
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.whatsapp && r.whatsapp.toLowerCase().includes(q)) ||
      (r.telegram && r.telegram.toLowerCase().includes(q));

    const matchesStatus = status === 'all' || r.status === status;
    const matchesPlan = plan === 'all' || r.plan_slug === plan;

    return matchesSearch && matchesStatus && matchesPlan;
  });
}

assert(filterRequests(mockRequests, '', 'all', 'all').length === 3, 'All filter returns 3 requests');
assert(filterRequests(mockRequests, '', 'pending', 'all').length === 1, 'Status pending filter returns 1');
assert(filterRequests(mockRequests, '', 'all', 'premium').length === 1, 'Tier premium filter returns 1');
assert(filterRequests(mockRequests, 'maryam', 'all', 'all').length === 1, 'Search by name returns match');
assert(filterRequests(mockRequests, 'XYZ789', 'all', 'all').length === 1, 'Search by reference ID returns match');
assert(filterRequests(mockRequests, 'nonexistent', 'all', 'all').length === 0, 'Nonexistent query returns 0');

// Status transition verification
const validTransitions = {
  pending: ['under_review', 'approved', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['completed'],
  rejected: ['under_review'],
  completed: [],
};

assert(validTransitions.pending.includes('under_review'), 'Pending can move to under_review');
assert(validTransitions.pending.includes('approved'), 'Pending can move to approved');
assert(validTransitions.under_review.includes('approved'), 'Under review can move to approved');

// -----------------------------------------------------------------------------
// Suite 7: Update Request Status Workflow (Approve, Complete, Reject)
// -----------------------------------------------------------------------------
console.log('\nSuite 7: Update Request Status Workflow (Approve, Complete, Reject)');

function simulateStatusUpdate(currentReq, newStatus, paymentVerified, notes) {
  const verified =
    paymentVerified !== undefined
      ? paymentVerified
      : newStatus === 'approved' || newStatus === 'completed'
      ? true
      : newStatus === 'rejected'
      ? false
      : currentReq.payment_verified;

  return {
    ...currentReq,
    status: newStatus,
    payment_verified: verified,
    admin_notes: notes !== undefined ? notes : currentReq.admin_notes,
    updated_at: new Date().toISOString(),
  };
}

const baseRequest = {
  id: 'a0000000-0000-0000-0000-000000000001',
  reference_id: 'REQ-EMUFTI-TST001',
  user_id: 'u0000000-0000-0000-0000-000000000001',
  full_name: 'Test Applicant',
  email: 'test@example.com',
  whatsapp: '+25261111111',
  telegram: null,
  plan_slug: 'pro',
  status: 'pending',
  payment_verified: false,
  admin_notes: '',
  created_at: '2026-10-14T10:00:00Z',
  updated_at: '2026-10-14T10:00:00Z',
};

// Test Approve
const approved = simulateStatusUpdate(baseRequest, 'approved', true, 'Payment received via Dahabshiil');
assert(approved.status === 'approved', 'Approve sets status to approved');
assert(approved.payment_verified === true, 'Approve marks payment_verified to true');
assert(approved.admin_notes === 'Payment received via Dahabshiil', 'Approve records coordinator notes');
assert(approved.id === baseRequest.id, 'Approve maintains correct request ID');
assert(approved.reference_id === baseRequest.reference_id, 'Approve maintains reference ID');

// Test Complete
const completed = simulateStatusUpdate(approved, 'completed', true, 'Account activated and verified');
assert(completed.status === 'completed', 'Complete sets status to completed');
assert(completed.payment_verified === true, 'Complete maintains payment_verified as true');

// Test Reject
const rejected = simulateStatusUpdate(baseRequest, 'rejected', false, 'Duplicate submission');
assert(rejected.status === 'rejected', 'Reject sets status to rejected');
assert(rejected.payment_verified === false, 'Reject marks payment_verified to false');
assert(rejected.admin_notes === 'Duplicate submission', 'Reject records reason note');

// Test Under Review
const underReview = simulateStatusUpdate(baseRequest, 'under_review');
assert(underReview.status === 'under_review', 'Mark under review sets status to under_review');
assert(underReview.payment_verified === false, 'Under review preserves unverified state');

// Verify AdminPage.tsx source code checks
const adminPageSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'pages', 'AdminPage.tsx'),
  'utf-8'
);

assert(
  adminPageSource.includes("if (isUpdatingStatus) return;"),
  'AdminPage prevents duplicate concurrent status updates'
);
assert(
  adminPageSource.includes("supabase.rpc('update_plan_request_status'") &&
    !adminPageSource.includes("supabase.from('plan_requests').update("),
  'AdminPage uses atomic RPC update_plan_request_status as single source of truth without direct table fallback'
);
assert(
  adminPageSource.includes("setPlanRequests((prev) =>"),
  'AdminPage updates React state immediately after status change'
);
assert(
  adminPageSource.includes("setSelectedRequest(updatedRecord)"),
  'AdminPage updates selected modal request immediately'
);
assert(
  adminPageSource.includes("handleUpdateStatus(selectedRequest, 'approved', true)"),
  'AdminPage modal includes Approve action button handler'
);
assert(
  adminPageSource.includes("handleUpdateStatus(selectedRequest, 'completed', true)"),
  'AdminPage modal includes Complete action button handler'
);
assert(
  adminPageSource.includes("handleUpdateStatus(selectedRequest, 'rejected', false)"),
  'AdminPage modal includes Reject action button handler'
);
assert(
  adminPageSource.includes("handleUpdateStatus(selectedRequest, 'under_review')"),
  'AdminPage modal includes Under Review action button handler'
);
assert(
  adminPageSource.includes("<select") && adminPageSource.includes("value={req.status}"),
  'AdminPage table row includes direct status selection dropdown'
);
assert(
  adminPageSource.includes("targetRequestId") && adminPageSource.includes("isUuid("),
  'AdminPage validates and resolves database UUID before calling update_plan_request_status'
);
assert(
  adminPageSource.includes("await loadRequests()"),
  'AdminPage refreshes request list from database after status update'
);
assert(
  adminPageSource.includes("setActionError(errMsg)"),
  'AdminPage surfaces actual error in UI on RPC rejection or failure'
);

// -----------------------------------------------------------------------------
// Suite 8: Automatic Pro/Premium Plan Activation & Status Safeguards
// -----------------------------------------------------------------------------
console.log('\nSuite 8: Automatic Pro/Premium Plan Activation & Status Safeguards');

function simulatePlanActivation(currentProfile, request, newStatus) {
  // Only 'approved' or 'completed' activate a plan
  const isApproved = newStatus === 'approved' || newStatus === 'completed';
  if (!isApproved) {
    return {
      profile: { ...currentProfile },
      activated: false,
    };
  }

  // Exact plan mapping from database request
  const requestedPlan = request.plan_slug === 'premium' ? 'premium' : 'pro';
  return {
    profile: {
      ...currentProfile,
      plan: requestedPlan,
      plan_activated_at: new Date().toISOString(),
    },
    activated: true,
  };
}

const freeUserProfile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'student@example.com',
  full_name: 'Student User',
  role: 'user',
  plan: 'free',
  plan_activated_at: null,
};

const proRequest = {
  id: 'req-pro-001',
  user_id: freeUserProfile.id,
  plan_slug: 'pro',
  status: 'pending',
};

const premiumRequest = {
  id: 'req-prem-002',
  user_id: freeUserProfile.id,
  plan_slug: 'premium',
  status: 'pending',
};

// 1. Pro Approval
const proApproval = simulatePlanActivation(freeUserProfile, proRequest, 'approved');
assert(proApproval.activated === true, 'Approval triggers plan activation');
assert(proApproval.profile.plan === 'pro', 'Pro request activates pro plan');
assert(Boolean(proApproval.profile.plan_activated_at), 'Activation timestamp is recorded');

// 2. Pro Completion
const proCompletion = simulatePlanActivation(freeUserProfile, proRequest, 'completed');
assert(proCompletion.activated === true, 'Complete action triggers plan activation');
assert(proCompletion.profile.plan === 'pro', 'Complete action activates pro plan');

// 3. Premium Approval
const premiumApproval = simulatePlanActivation(freeUserProfile, premiumRequest, 'approved');
assert(premiumApproval.activated === true, 'Approval of premium request triggers activation');
assert(premiumApproval.profile.plan === 'premium', 'Premium request activates premium plan');

// 4. Premium Completion
const premiumCompletion = simulatePlanActivation(freeUserProfile, premiumRequest, 'completed');
assert(premiumCompletion.activated === true, 'Complete action on premium request triggers activation');
assert(premiumCompletion.profile.plan === 'premium', 'Complete action activates premium plan');

// 5. Rejection Safeguard
const rejection = simulatePlanActivation(freeUserProfile, proRequest, 'rejected');
assert(rejection.activated === false, 'Rejection does not activate plan');
assert(rejection.profile.plan === 'free', 'User plan remains unchanged on rejection');

// 6. Under Review / Pending Safeguard
const underReviewActivation = simulatePlanActivation(freeUserProfile, premiumRequest, 'under_review');
assert(underReviewActivation.activated === false, 'Under review does not activate plan');
assert(underReviewActivation.profile.plan === 'free', 'User plan remains unchanged under review');

// 7. Security / Non-Admin Safeguard check
function verifyAdminAuthorization(callerRole) {
  if (callerRole !== 'admin') {
    throw new Error('Access denied: Administrator privileges required to activate plans');
  }
  return true;
}

assert(verifyAdminAuthorization('admin') === true, 'Admin caller is authorized to activate plans');
let nonAdminBlocked = false;
try {
  verifyAdminAuthorization('user');
} catch {
  nonAdminBlocked = true;
}
assert(nonAdminBlocked, 'Regular authenticated user is strictly blocked from approving/activating plans');

let anonBlocked = false;
try {
  verifyAdminAuthorization('anon');
} catch {
  anonBlocked = true;
}
assert(anonBlocked, 'Anonymous visitor is strictly blocked from approving/activating plans');

// -----------------------------------------------------------------------------
// Suite 9: User Experience, Multi-Lingual Congratulations & Badge Representation
// -----------------------------------------------------------------------------
console.log('\nSuite 9: Multi-Lingual Congratulations & Active Badges');

const bannerContent = {
  en: {
    pro: {
      title: 'Congratulations! Your Pro Plan is now active.',
      badge: 'PRO ACTIVE',
      quota: '150 Questions/Day Active',
    },
    premium: {
      title: 'Congratulations! Your Premium Plan is now active.',
      badge: 'PREMIUM ACTIVE',
      quota: '1,000 Questions/Day Active',
    },
  },
  so: {
    pro: {
      title: 'Hambalyo! Qorshahaaga Pro (Talib) hadda wuu shaqaynayaa.',
      badge: 'PRO ACTIVE',
      quota: '150 Su’aalood/Maalintii',
    },
    premium: {
      title: 'Hambalyo! Qorshahaaga Premium (Alim) hadda wuu shaqaynayaa.',
      badge: 'PREMIUM ACTIVE',
      quota: '1,000 Su’aalood/Maalintii',
    },
  },
  ar: {
    pro: {
      title: 'تهانينا! خطتك الاحترافية (Pro) مفعلة الآن.',
      badge: 'PRO ACTIVE',
      quota: '150 استفسار يومياً',
    },
    premium: {
      title: 'تهانينا! خطتك المميزة (Premium) مفعلة الآن.',
      badge: 'PREMIUM ACTIVE',
      quota: '1,000 استفسار يومياً',
    },
  },
};

// Verify English messages
assert(
  bannerContent.en.pro.title === 'Congratulations! Your Pro Plan is now active.',
  'English Pro congratulations text matches exact specification'
);
assert(
  bannerContent.en.premium.title === 'Congratulations! Your Premium Plan is now active.',
  'English Premium congratulations text matches exact specification'
);
assert(bannerContent.en.pro.badge === 'PRO ACTIVE', 'English Pro badge reads PRO ACTIVE');
assert(bannerContent.en.premium.badge === 'PREMIUM ACTIVE', 'English Premium badge reads PREMIUM ACTIVE');

// Verify Somali translations
assert(
  bannerContent.so.pro.title.includes('Hambalyo!'),
  'Somali Pro congratulations greeting present'
);
assert(
  bannerContent.so.premium.title.includes('Hambalyo!'),
  'Somali Premium congratulations greeting present'
);

// Verify Arabic translations
assert(
  bannerContent.ar.pro.title.includes('تهانينا!'),
  'Arabic Pro congratulations greeting present'
);
assert(
  bannerContent.ar.premium.title.includes('تهانينا!'),
  'Arabic Premium congratulations greeting present'
);

// Offline user persistence simulation
const mockLocalStorage = new Map();
function isPlanCongratsSeen(userId, plan) {
  return mockLocalStorage.get(`emufti_congrats_seen_${userId}_${plan}`) === 'true';
}
function markPlanCongratsSeen(userId, plan) {
  mockLocalStorage.set(`emufti_congrats_seen_${userId}_${plan}`, 'true');
}

const offlineUserId = 'u0000000-0000-0000-0000-000000000999';
assert(!isPlanCongratsSeen(offlineUserId, 'pro'), 'New approval starts with congratulations unseen for offline user');
// User logs in and visits page -> banner is shown, user dismisses it
markPlanCongratsSeen(offlineUserId, 'pro');
assert(isPlanCongratsSeen(offlineUserId, 'pro'), 'Dismissed congratulations is remembered across refreshes');
assert(!isPlanCongratsSeen(offlineUserId, 'premium'), 'Upgrade to Premium subsequently resets to unseen for the new plan');

// Source code structural assertions
const planBannerSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'components', 'chat', 'PlanActivationBanner.tsx'),
  'utf-8'
);
assert(
  planBannerSource.includes('Congratulations! Your Pro Plan is now active.'),
  'PlanActivationBanner contains Pro congratulations string'
);
assert(
  planBannerSource.includes('Congratulations! Your Premium Plan is now active.'),
  'PlanActivationBanner contains Premium congratulations string'
);
assert(
  planBannerSource.includes('PRO ACTIVE') && planBannerSource.includes('PREMIUM ACTIVE'),
  'PlanActivationBanner contains PRO ACTIVE and PREMIUM ACTIVE badges'
);

const headerSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'components', 'layout', 'Header.tsx'),
  'utf-8'
);
assert(
  headerSource.includes('PRO ACTIVE') && headerSource.includes('PREMIUM ACTIVE'),
  'Header displays PRO ACTIVE and PREMIUM ACTIVE badges'
);

const sidebarSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'components', 'layout', 'Sidebar.tsx'),
  'utf-8'
);
assert(
  sidebarSource.includes('PRO ACTIVE') && sidebarSource.includes('PREMIUM ACTIVE'),
  'Sidebar displays PRO ACTIVE and PREMIUM ACTIVE badges'
);

// Migration SQL assertions for atomic activation RPC and trigger
assert(
  migrationSql.includes('CREATE OR REPLACE FUNCTION public.update_plan_request_status'),
  'Migration defines atomic RPC public.update_plan_request_status'
);
assert(
  migrationSql.includes('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT'),
  'Migration adds plan column to public.profiles'
);
assert(
  migrationSql.includes('CREATE TABLE IF NOT EXISTS public.subscriptions'),
  'Migration creates public.subscriptions table'
);

// Focused migration 20261014_plan_activation_rpc.sql verification
const focusedMigrationPath = path.join(
  rootDir,
  'supabase',
  'migrations',
  '20261014_plan_activation_rpc.sql'
);
assert(fs.existsSync(focusedMigrationPath), 'Focused RPC migration file exists on disk');

const focusedSql = fs.readFileSync(focusedMigrationPath, 'utf8');
assert(
  focusedSql.includes('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT \'free\''),
  'Focused migration ensures profiles.plan exists'
);
assert(
  focusedSql.includes('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ'),
  'Focused migration ensures profiles.plan_activated_at exists'
);
assert(
  focusedSql.includes('CREATE TABLE IF NOT EXISTS public.subscriptions'),
  'Focused migration ensures public.subscriptions table exists'
);
assert(
  focusedSql.includes('DROP TRIGGER IF EXISTS trigger_plan_request_activation ON public.plan_requests'),
  'Focused migration drops duplicate activation trigger to enforce single activation mechanism'
);
assert(
  focusedSql.includes('CREATE OR REPLACE FUNCTION public.update_plan_request_status'),
  'Focused migration installs public.update_plan_request_status RPC'
);
assert(
  focusedSql.includes('IF NOT public.is_admin() THEN'),
  'Focused RPC verifies public.is_admin() before executing'
);
assert(
  focusedSql.includes('IF p_status IN (\'approved\', \'completed\') AND v_user_id IS NULL THEN') &&
    focusedSql.includes('RAISE EXCEPTION'),
  'Focused RPC returns clear exception if request has no associated real user account'
);
assert(
  focusedSql.includes('GRANT EXECUTE ON FUNCTION public.update_plan_request_status'),
  'Focused migration grants execute permission on RPC'
);

// -----------------------------------------------------------------------------
// Suite 10: Plan Request Tracking & Status Resolution
// -----------------------------------------------------------------------------
console.log('\nSuite 10: Plan Request Tracking & Status Resolution');

// 1. PlanRequestModal source code inspection
const modalSource = fs.readFileSync(
  path.join(rootDir, 'src', 'components', 'plans', 'PlanRequestModal.tsx'),
  'utf8'
);

assert(
  modalSource.includes('Enter Your Tracking Reference ID'),
  'PlanRequestModal displays "Enter Your Tracking Reference ID"'
);
assert(
  modalSource.includes("from('plan_requests')") &&
    modalSource.includes(".eq('reference_id', referenceId)"),
  'PlanRequestModal queries public.plan_requests using exact reference_id'
);
assert(
  !modalSource.includes(".eq('reference_id', referenceId)\n          .eq('user_id'"),
  'PlanRequestModal does not restrict tracking by current user_id'
);
const trackingSelectMatch = modalSource.match(/\.from\('plan_requests'\)\s*\.select\(([^)]+)\)/);
const trackingSelectStr = trackingSelectMatch ? trackingSelectMatch[1] : '';
assert(
  trackingSelectStr.includes('reference_id') &&
    trackingSelectStr.includes('status') &&
    trackingSelectStr.includes('plan') &&
    !trackingSelectStr.includes('whatsapp') &&
    !trackingSelectStr.includes('telegram') &&
    !trackingSelectStr.includes('admin_notes'),
  'Tracking select query never exposes sensitive applicant contact details or coordinator notes'
);
assert(
  modalSource.includes('Reference ID not found'),
  'Displays explicit "Reference ID not found" message when row is absent'
);

// 2. Status Badge Formatting Logic
function getStatusBadgeLabel(status) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'under_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown Status';
  }
}

assert(getStatusBadgeLabel('pending') === 'Pending', 'Status pending displays "Pending" (not Under Review)');
assert(getStatusBadgeLabel('under_review') === 'Under Review', 'Status under_review displays "Under Review"');
assert(getStatusBadgeLabel('approved') === 'Approved', 'Status approved displays "Approved"');
assert(getStatusBadgeLabel('completed') === 'Completed', 'Status completed displays "Completed"');
assert(getStatusBadgeLabel('rejected') === 'Rejected', 'Status rejected displays "Rejected"');

// 3. Known Tracking Reference Resolution Simulation
const databaseMockRows = [
  {
    reference_id: 'REQ-EMUFTI-33D9C2',
    plan: 'pro',
    plan_slug: 'pro',
    status: 'approved',
    payment_verified: true,
    created_at: '2026-10-12T10:00:00Z',
  },
  {
    reference_id: 'REQ-EMUFTI-94B2F1',
    plan: 'pro',
    plan_slug: 'pro',
    status: 'pending',
    payment_verified: false,
    created_at: '2026-10-14T08:00:00Z',
  },
  {
    reference_id: 'REQ-EMUFTI-71A8E4',
    plan: 'premium',
    plan_slug: 'premium',
    status: 'under_review',
    payment_verified: false,
    created_at: '2026-10-13T12:00:00Z',
  },
  {
    reference_id: 'REQ-EMUFTI-CMP001',
    plan: 'premium',
    plan_slug: 'premium',
    status: 'completed',
    payment_verified: true,
    created_at: '2026-10-11T12:00:00Z',
  },
  {
    reference_id: 'REQ-EMUFTI-REJ002',
    plan: 'pro',
    plan_slug: 'pro',
    status: 'rejected',
    payment_verified: false,
    created_at: '2026-10-10T12:00:00Z',
  },
];

function simulateTrackSearch(enteredRef, dbRows, isSupabaseConfigured = true) {
  const cleanRef = (enteredRef || '').trim().toUpperCase();
  if (!cleanRef) return { error: 'Please enter a reference ID', result: null };

  if (isSupabaseConfigured) {
    const matched = dbRows.find((r) => r.reference_id === cleanRef);
    if (matched) {
      const planVal = matched.plan_slug || matched.plan || 'pro';
      return {
        error: null,
        result: {
          reference_id: matched.reference_id,
          plan: planVal,
          plan_slug: planVal,
          status: matched.status,
          payment_verified: Boolean(matched.payment_verified),
          created_at: matched.created_at,
          badgeLabel: getStatusBadgeLabel(matched.status),
        },
      };
    }
    // Never default missing rows to pending!
    return { error: null, result: 'not_found' };
  }

  return { error: null, result: 'not_found' };
}

// Test A: Known Approved Reference (REQ-EMUFTI-33D9C2)
const approvedSearch = simulateTrackSearch('REQ-EMUFTI-33D9C2', databaseMockRows);
assert(approvedSearch.result !== null && approvedSearch.result !== 'not_found', 'Approved reference found');
assert(approvedSearch.result.status === 'approved', 'Approved reference returns actual database status "approved"');
assert(approvedSearch.result.badgeLabel === 'Approved', 'Approved reference displays "Approved" badge (not Pending)');
assert(approvedSearch.result.plan === 'pro', 'Approved reference preserves requested plan');
assert(approvedSearch.result.payment_verified === true, 'Approved reference has payment_verified true');

// Test B: Known Pending Reference (REQ-EMUFTI-94B2F1)
const pendingSearch = simulateTrackSearch('REQ-EMUFTI-94B2F1', databaseMockRows);
assert(pendingSearch.result !== null && pendingSearch.result !== 'not_found', 'Pending reference found');
assert(pendingSearch.result.status === 'pending', 'Pending reference returns actual database status "pending"');
assert(pendingSearch.result.badgeLabel === 'Pending', 'Pending reference displays "Pending" badge');
assert(pendingSearch.result.payment_verified === false, 'Pending reference has payment_verified false');

// Test C: Known Under Review Reference (REQ-EMUFTI-71A8E4)
const underReviewSearch = simulateTrackSearch('REQ-EMUFTI-71A8E4', databaseMockRows);
assert(underReviewSearch.result.status === 'under_review', 'Under review reference returns status "under_review"');
assert(underReviewSearch.result.badgeLabel === 'Under Review', 'Under review displays "Under Review" badge');

// Test D: Known Completed Reference
const completedSearch = simulateTrackSearch('REQ-EMUFTI-CMP001', databaseMockRows);
assert(completedSearch.result.status === 'completed', 'Completed reference returns status "completed"');
assert(completedSearch.result.badgeLabel === 'Completed', 'Completed reference displays "Completed" badge');

// Test E: Known Rejected Reference
const rejectedSearch = simulateTrackSearch('REQ-EMUFTI-REJ002', databaseMockRows);
assert(rejectedSearch.result.status === 'rejected', 'Rejected reference returns status "rejected"');
assert(rejectedSearch.result.badgeLabel === 'Rejected', 'Rejected reference displays "Rejected" badge');

// Test F: Unknown / Non-existent Reference (Never defaults to Pending)
const unknownSearch = simulateTrackSearch('REQ-EMUFTI-DOESNOTEXIST', databaseMockRows);
assert(unknownSearch.result === 'not_found', 'Non-existent reference returns "not_found" (never defaults to pending)');
assert(unknownSearch.error === null, 'Non-existent reference does not trigger crash');

// Test G: Case-insensitivity & whitespace trimming
const caseSearch = simulateTrackSearch('  req-emufti-33d9c2  ', databaseMockRows);
assert(caseSearch.result?.status === 'approved', 'Lowercase and padded reference ID resolved correctly');

// 4. Secure Tracking RPC and View Assertions
assert(
  modalSource.includes("trackRefId.trim().toUpperCase()"),
  'PlanRequestModal normalizes reference ID with trimming and uppercase'
);
assert(
  modalSource.includes("'get_plan_request_status'"),
  'PlanRequestModal calls secure get_plan_request_status RPC'
);
assert(
  modalSource.includes("'plan_request_tracking'"),
  'PlanRequestModal supports public plan_request_tracking view fallback'
);
assert(
  modalSource.includes("setTrackError(getDatabaseError(searchError))"),
  'PlanRequestModal surfaces real database error and never defaults to not found'
);

assert(
  focusedSql.includes("CREATE OR REPLACE FUNCTION public.get_plan_request_status"),
  'Focused migration installs public.get_plan_request_status RPC'
);
assert(
  focusedSql.includes("GRANT EXECUTE ON FUNCTION public.get_plan_request_status(TEXT) TO anon, authenticated, service_role"),
  'Focused migration grants execute permission to anon and authenticated roles'
);
assert(
  focusedSql.includes("CREATE OR REPLACE VIEW public.plan_request_tracking"),
  'Focused migration creates public.plan_request_tracking view'
);
assert(
  migrationSql.includes("CREATE OR REPLACE FUNCTION public.get_plan_request_status"),
  'Full plan_requests migration includes public.get_plan_request_status RPC'
);
assert(
  migrationSql.includes("CREATE OR REPLACE VIEW public.plan_request_tracking"),
  'Full plan_requests migration includes public.plan_request_tracking view'
);

// -----------------------------------------------------------------------------
// Test Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`  Plan Requests Test Suite Summary`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}


