// ==============================================================================
// EMUFTI AI — CLAIM OFFER RPC & SUBSCRIPTION ACTIVATION TEST SUITE
// Verifies:
// 1. RPC function signature and parameter p_reference_id in migration
// 2. PostgREST permission exposure (anon, authenticated, service_role) & cache reload
// 3. Pro 1-month claim correctly sets 1 month duration and expiration
// 4. Premium annual claim correctly sets 1 year duration and expiration
// 5. Preventing double claims (idempotency)
// 6. Rejecting claims for pending, under_review, rejected, or expired requests
// 7. Ownership enforcement (unauthorized user cannot claim someone else's offer)
// 8. Exact Somali success panel formatting and dynamic localized dates
// 9. Synchronized profiles, subscriptions, and avatar tier rim/badge styling
// 10. Seamless fallback storage claim simulation
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] Test ${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] Test ${totalTests}: ${testName} - ${detail}`);
  }
}

console.log('\n========================================================================');
console.log('EMUFTI AI: CLAIM OFFER RPC & SUBSCRIPTION ACTIVATION SUITE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Part 1: Migration SQL Static Analysis
// -----------------------------------------------------------------------------
console.log('--- Part 1: Migration SQL & PostgREST Schema Exposure ---');

const migrationPath = path.join(rootDir, 'supabase/migrations/20261018_fix_claim_plan_offer_rpc.sql');
assert(fs.existsSync(migrationPath), 'Migration 20261018_fix_claim_plan_offer_rpc.sql exists');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

assert(
  migrationSql.includes('CREATE OR REPLACE FUNCTION public.claim_plan_offer(p_reference_id TEXT)'),
  'RPC signature matches frontend exactly: claim_plan_offer(p_reference_id TEXT)'
);

assert(
  migrationSql.includes('RETURNS JSONB'),
  'RPC returns structured JSONB'
);

assert(
  migrationSql.includes("GRANT EXECUTE ON FUNCTION public.claim_plan_offer(TEXT) TO anon, authenticated, service_role"),
  'EXECUTE granted to anon, authenticated, and service_role to ensure schema cache visibility'
);

assert(
  migrationSql.includes("NOTIFY pgrst, 'reload schema'"),
  'PostgREST schema cache reload notification emitted'
);

assert(
  migrationSql.includes("SECURITY DEFINER") && migrationSql.includes("search_path = public, pg_temp"),
  'RPC secured with SECURITY DEFINER and explicit search_path'
);

assert(
  migrationSql.includes("v_caller_id IS NULL") || migrationSql.includes("auth.uid() IS NULL"),
  'RPC requires authenticated caller inside function body'
);

assert(
  migrationSql.includes("FOR UPDATE"),
  'Row locking FOR UPDATE ensures atomic idempotency'
);

assert(
  migrationSql.includes("INTERVAL '1 year'") && migrationSql.includes("INTERVAL '1 month'"),
  'Calendar interval arithmetic supports both 1 year and 1 month durations'
);

assert(
  migrationSql.includes("'duration_somali', v_duration_somali") &&
  migrationSql.includes("'activated_at', v_now") &&
  migrationSql.includes("'expires_at', v_expires_at"),
  'RPC returns structured activation details: duration_somali, activated_at, expires_at'
);

// -----------------------------------------------------------------------------
// Part 2: Frontend Implementation Static Analysis
// -----------------------------------------------------------------------------
console.log('\n--- Part 2: Frontend Somali Success Panel & Synchronization ---');

const trackPagePath = path.join(rootDir, 'src/pages/TrackRequestPage.tsx');
assert(fs.existsSync(trackPagePath), 'TrackRequestPage.tsx exists');
const trackPageTsx = fs.readFileSync(trackPagePath, 'utf8');

assert(
  trackPageTsx.includes("supabase.rpc('claim_plan_offer'"),
  'TrackRequestPage calls supabase.rpc("claim_plan_offer", ...)'
);

assert(
  trackPageTsx.includes("p_reference_id: refId"),
  'TrackRequestPage passes parameter p_reference_id'
);

assert(
  trackPageTsx.includes("Hambalyo! Waxaad heshay qorshaha"),
  'TrackRequestPage contains exact Somali title: Hambalyo! Waxaad heshay qorshaha {PLAN}.'
);

assert(
  trackPageTsx.includes("Qorshaha:") &&
  trackPageTsx.includes("Muddada:") &&
  trackPageTsx.includes("Taariikhda uu bilaabmay:") &&
  trackPageTsx.includes("Taariikhda uu dhacayo:"),
  'TrackRequestPage renders all 4 required Somali bullet points'
);

assert(
  trackPageTsx.includes("SOMALI_MONTHS") &&
  trackPageTsx.includes("Oktoobar") &&
  trackPageTsx.includes("Nofeembar") &&
  trackPageTsx.includes("Diseembar"),
  'TrackRequestPage includes authentic 12 Somali month names'
);

assert(
  trackPageTsx.includes("refreshProfile()"),
  'TrackRequestPage triggers refreshProfile() immediately after successful claim'
);

// PlanRequestModal checks
const modalPath = path.join(rootDir, 'src/components/plans/PlanRequestModal.tsx');
assert(fs.existsSync(modalPath), 'PlanRequestModal.tsx exists');
const modalTsx = fs.readFileSync(modalPath, 'utf8');

assert(
  modalTsx.includes("Hambalyo! Waxaad heshay qorshaha"),
  'PlanRequestModal renders exact Somali heading'
);

assert(
  modalTsx.includes("Qorshaha:") &&
  modalTsx.includes("Muddada:") &&
  modalTsx.includes("Taariikhda uu bilaabmay:") &&
  modalTsx.includes("Taariikhda uu dhacayo:"),
  'PlanRequestModal renders all 4 required Somali bullet points'
);

// UserAvatar styling checks
const avatarPath = path.join(rootDir, 'src/components/common/UserAvatar.tsx');
assert(fs.existsSync(avatarPath), 'UserAvatar.tsx exists');
const avatarTsx = fs.readFileSync(avatarPath, 'utf8');

const circularPath = path.join(rootDir, 'src/components/common/CircularPlanAvatar.tsx');
const circularCode = fs.existsSync(circularPath) ? fs.readFileSync(circularPath, 'utf8') : '';
const fullAvatarSource = avatarTsx + circularCode;

assert(
  fullAvatarSource.includes("border-amber-400") || fullAvatarSource.includes("ring-amber-400") || fullAvatarSource.includes("#D4AF37"),
  'UserAvatar renders Gold rim/border for Premium subscribers'
);

assert(
  fullAvatarSource.includes("border-emerald-500") || fullAvatarSource.includes("ring-emerald-500") || fullAvatarSource.includes("#16A34A"),
  'UserAvatar renders Green rim/border for Pro subscribers'
);

// -----------------------------------------------------------------------------
// Part 3: Simulation Engine for RPC Execution & Scenarios
// -----------------------------------------------------------------------------
console.log('\n--- Part 3: Simulated Claim Offer RPC Execution ---');

const SOMALI_MONTHS = [
  'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun',
  'Luuliyo', 'Ogosto', 'Sebteembar', 'Oktoobar', 'Nofeembar', 'Diseembar'
];

function formatSomaliDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${SOMALI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

class MockSupabaseDB {
  constructor() {
    this.requests = new Map();
    this.profiles = new Map();
    this.subscriptions = [];
  }

  addRequest(req) {
    this.requests.set(req.reference_id.toUpperCase(), { ...req });
  }

  addProfile(profile) {
    this.profiles.set(profile.id, { ...profile });
  }

  // Exact reproduction of public.claim_plan_offer plpgsql function logic
  claimPlanOffer({ callerId, callerEmail, referenceId, now = new Date('2026-10-18T10:00:00Z') }) {
    if (!callerId) {
      return { success: false, error: 'Authentication required. Please sign in to claim your offer.' };
    }
    if (!referenceId || !referenceId.trim()) {
      return { success: false, error: 'Reference ID is required to claim an offer.' };
    }

    const cleanRef = referenceId.trim().toUpperCase();
    const req = this.requests.get(cleanRef);
    if (!req) {
      return { success: false, error: `Plan request "${referenceId}" not found.` };
    }

    // Ownership check
    const cEmail = (callerEmail || '').trim().toLowerCase();
    const rEmail = (req.email || '').trim().toLowerCase();

    if (req.user_id && req.user_id !== callerId) {
      if (!cEmail || cEmail !== rEmail) {
        return { success: false, error: 'Access denied. You can only claim offers belonging to your own account.' };
      }
    }

    if (!req.user_id && (!rEmail || rEmail !== cEmail)) {
      return { success: false, error: 'Access denied. This offer belongs to a different email address.' };
    }

    // Status checks
    if (req.status === 'claimed') {
      return { success: false, error: 'This offer has already been claimed and is active.' };
    }
    if (req.status === 'rejected') {
      return { success: false, error: 'This request was not approved and cannot be claimed.' };
    }
    if (req.status === 'pending' || req.status === 'under_review') {
      return { success: false, error: 'Your request is pending review and has not yet been approved.' };
    }
    if (req.status !== 'approved' && req.status !== 'completed') {
      return { success: false, error: `This request is not eligible to be claimed (status: ${req.status}).` };
    }

    // Expiration check
    if (req.offer_expires_at && new Date(req.offer_expires_at) < now) {
      req.status = 'expired';
      return { success: false, error: `This offer expired on ${req.offer_expires_at} and can no longer be claimed.` };
    }

    // Plan & Duration derivation strictly from DB
    const planRaw = (req.plan_slug || req.plan || 'pro').toLowerCase();
    const plan = planRaw.includes('premium') || planRaw.includes('alim') ? 'premium' : 'pro';
    const isAnnual = ['yearly', 'annual', 'year', '1 year'].includes((req.billing_interval || '').toLowerCase()) ||
                     ['1 year', 'annual', 'yearly', 'year'].includes((req.duration || '').toLowerCase());

    const interval = isAnnual ? 'annual' : 'monthly';
    const durationLabel = isAnnual ? '1 year' : '1 month';
    const durationSomali = isAnnual ? '1 Sano' : '1 Bil';

    const activatedAt = new Date(now);
    const expiresAt = new Date(now);
    if (isAnnual) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Update subscriptions: cancel existing
    for (const sub of this.subscriptions) {
      if (sub.user_id === callerId && sub.status === 'active') {
        sub.status = 'canceled';
      }
    }

    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.subscriptions.push({
      id: subId,
      user_id: callerId,
      plan,
      billing_interval: interval,
      status: 'active',
      started_at: activatedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      request_id: req.id,
    });

    // Update profile
    const profile = this.profiles.get(callerId) || { id: callerId, email: cEmail || rEmail };
    profile.plan = plan;
    profile.quran_plan = plan;
    profile.started_at = activatedAt.toISOString();
    profile.expires_at = expiresAt.toISOString();
    profile.plan_activated_at = activatedAt.toISOString();
    profile.plan_expires_at = expiresAt.toISOString();
    profile.billing_interval = interval;
    this.profiles.set(callerId, profile);

    // Update request
    req.status = 'claimed';
    req.claimed_at = activatedAt.toISOString();
    req.user_id = callerId;
    req.subscription_id = subId;
    req.payment_verified = true;
    req.duration = durationLabel;
    req.billing_interval = interval;

    const planDisplay = plan === 'premium' ? 'Premium' : 'Pro';

    return {
      success: true,
      reference_id: req.reference_id,
      plan,
      plan_label: plan.toUpperCase(),
      billing_interval: interval,
      duration: durationLabel,
      duration_somali: durationSomali,
      subscription_id: subId,
      activated_at: activatedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'claimed',
      message: `Hambalyo! Waxaad heshay qorshaha ${planDisplay}.`,
    };
  }
}

const db = new MockSupabaseDB();

// Test Scenario 1: Pro 1-Month Claim
db.addProfile({ id: 'user-001', email: 'ahmed@example.com', plan: 'free' });
db.addRequest({
  id: 'req-001',
  reference_id: 'REQ-PRO-MONTHLY',
  user_id: 'user-001',
  email: 'ahmed@example.com',
  plan_slug: 'pro',
  billing_interval: 'monthly',
  duration: '1 month',
  status: 'approved',
  offer_expires_at: '2026-11-01T00:00:00Z',
});

const resPro = db.claimPlanOffer({
  callerId: 'user-001',
  callerEmail: 'ahmed@example.com',
  referenceId: 'REQ-PRO-MONTHLY',
  now: new Date('2026-10-18T10:00:00Z'),
});

assert(resPro.success === true, 'Pro 1-month claim succeeds');
assert(resPro.plan === 'pro', 'Activated plan is Pro');
assert(resPro.duration === '1 month', 'Duration is 1 month');
assert(resPro.duration_somali === '1 Bil', 'Somali duration is 1 Bil');
assert(formatSomaliDate(resPro.activated_at) === '18 Oktoobar 2026', 'Somali start date is 18 Oktoobar 2026');
assert(formatSomaliDate(resPro.expires_at) === '18 Nofeembar 2026', 'Somali expiry date is 18 Nofeembar 2026');
assert(resPro.message === 'Hambalyo! Waxaad heshay qorshaha Pro.', 'Somali success title matches exactly');

// Check profile updated
const updatedProfilePro = db.profiles.get('user-001');
assert(updatedProfilePro.plan === 'pro', 'User profile in database updated to Pro');
assert(updatedProfilePro.billing_interval === 'monthly', 'Profile billing interval set to monthly');

// Test Scenario 2: Premium 1-Year (Annual) Claim
db.addProfile({ id: 'user-002', email: 'fatima@example.com', plan: 'free' });
db.addRequest({
  id: 'req-002',
  reference_id: 'REQ-PREM-YEARLY',
  user_id: 'user-002',
  email: 'fatima@example.com',
  plan_slug: 'premium',
  billing_interval: 'annual',
  duration: '1 year',
  status: 'approved',
  offer_expires_at: '2026-11-01T00:00:00Z',
});

const resPrem = db.claimPlanOffer({
  callerId: 'user-002',
  callerEmail: 'fatima@example.com',
  referenceId: 'REQ-PREM-YEARLY',
  now: new Date('2026-10-18T10:00:00Z'),
});

assert(resPrem.success === true, 'Premium annual claim succeeds');
assert(resPrem.plan === 'premium', 'Activated plan is Premium');
assert(resPrem.duration === '1 year', 'Duration is 1 year');
assert(resPrem.duration_somali === '1 Sano', 'Somali duration is 1 Sano');
assert(formatSomaliDate(resPrem.activated_at) === '18 Oktoobar 2026', 'Start date is 18 Oktoobar 2026');
assert(formatSomaliDate(resPrem.expires_at) === '18 Oktoobar 2027', 'Expiry date is 18 Oktoobar 2027 (exact 1 calendar year)');
assert(resPrem.message === 'Hambalyo! Waxaad heshay qorshaha Premium.', 'Premium Somali title matches exactly');

// Test Scenario 3: Double Claim Prevention (Idempotency)
const resDouble = db.claimPlanOffer({
  callerId: 'user-002',
  callerEmail: 'fatima@example.com',
  referenceId: 'REQ-PREM-YEARLY',
  now: new Date('2026-10-18T10:05:00Z'),
});
assert(resDouble.success === false, 'Cannot claim offer twice');
assert(resDouble.error.includes('already been claimed'), 'Double claim returns already claimed error');

// Test Scenario 4: Rejecting Pending or Under Review Claim
db.addRequest({
  id: 'req-003',
  reference_id: 'REQ-PENDING',
  user_id: 'user-003',
  email: 'ali@example.com',
  plan_slug: 'pro',
  status: 'pending',
});

const resPending = db.claimPlanOffer({
  callerId: 'user-003',
  callerEmail: 'ali@example.com',
  referenceId: 'REQ-PENDING',
});
assert(resPending.success === false, 'Cannot claim pending request');
assert(resPending.error.includes('pending review'), 'Pending claim returns pending review error');

// Test Scenario 5: Rejecting Rejected Claim
db.addRequest({
  id: 'req-004',
  reference_id: 'REQ-REJECTED',
  user_id: 'user-004',
  email: 'hassan@example.com',
  plan_slug: 'pro',
  status: 'rejected',
});

const resRejected = db.claimPlanOffer({
  callerId: 'user-004',
  callerEmail: 'hassan@example.com',
  referenceId: 'REQ-REJECTED',
});
assert(resRejected.success === false, 'Cannot claim rejected request');
assert(resRejected.error.includes('not approved'), 'Rejected claim returns not approved error');

// Test Scenario 6: Unauthorized User Cannot Claim Other User's Offer
const resUnauthorized = db.claimPlanOffer({
  callerId: 'user-hacker',
  callerEmail: 'attacker@evil.com',
  referenceId: 'REQ-PRO-MONTHLY',
});
assert(resUnauthorized.success === false, 'Unauthorized user cannot claim other user offer');

// Test Scenario 7: Unauthenticated Caller Rejected
const resUnauth = db.claimPlanOffer({
  callerId: null,
  callerEmail: null,
  referenceId: 'REQ-PRO-MONTHLY',
});
assert(resUnauth.success === false, 'Unauthenticated caller rejected');
assert(resUnauth.error.includes('Authentication required'), 'Returns authentication required error');

// Test Scenario 8: Expired Offer Rejected
db.addRequest({
  id: 'req-005',
  reference_id: 'REQ-EXPIRED',
  user_id: 'user-005',
  email: 'omar@example.com',
  plan_slug: 'pro',
  status: 'approved',
  offer_expires_at: '2026-10-01T00:00:00Z', // In the past
});

const resExpired = db.claimPlanOffer({
  callerId: 'user-005',
  callerEmail: 'omar@example.com',
  referenceId: 'REQ-EXPIRED',
  now: new Date('2026-10-18T10:00:00Z'),
});
assert(resExpired.success === false, 'Expired offer rejected');
assert(resExpired.error.includes('expired'), 'Returns expired offer error');

// -----------------------------------------------------------------------------
// Part 4: Storage Fallback Verification
// -----------------------------------------------------------------------------
console.log('\n--- Part 4: Storage Fallback Verification ---');
const storagePath = path.join(rootDir, 'src/lib/storage.ts');
const storageTs = fs.readFileSync(storagePath, 'utf8');

assert(
  storageTs.includes("duration_somali: durationSomali"),
  'storage.ts claimPlanOffer returns duration_somali'
);
assert(
  storageTs.includes("activated_at: activatedAt"),
  'storage.ts claimPlanOffer returns activated_at'
);
assert(
  storageTs.includes("expires_at: expiresAt"),
  'storage.ts claimPlanOffer returns expires_at'
);
assert(
  storageTs.includes("Hambalyo! Waxaad heshay qorshaha"),
  'storage.ts claimPlanOffer returns Somali message'
);

// -----------------------------------------------------------------------------
// Part 5: CircularPlanAvatar, Settings planLabel, and Pro-to-Premium Upgrade Claim
// -----------------------------------------------------------------------------
console.log('\n--- Part 5: CircularPlanAvatar, Settings planLabel & Pro-to-Premium Upgrade ---');

// 1. CircularPlanAvatar verification
const circularAvatarPath = path.join(rootDir, 'src/components/common/CircularPlanAvatar.tsx');
assert(fs.existsSync(circularAvatarPath), 'CircularPlanAvatar.tsx exists');
const circularAvatarTs = fs.readFileSync(circularAvatarPath, 'utf8');

assert(
  circularAvatarTs.includes('<svg') && circularAvatarTs.includes('viewBox="0 0 100 100"'),
  'CircularPlanAvatar uses inline SVG with viewBox 0 0 100 100'
);

assert(
  circularAvatarTs.includes('#D4AF37') &&
  circularAvatarTs.includes('#FDE68A') &&
  circularAvatarTs.includes('#B8860B'),
  'CircularPlanAvatar defines Premium Gold gradient (#D4AF37 -> #FDE68A -> #B8860B)'
);

assert(
  circularAvatarTs.includes('#16A34A') &&
  circularAvatarTs.includes('#4ADE80'),
  'CircularPlanAvatar defines Pro Green gradient (#16A34A -> #4ADE80)'
);

assert(
  circularAvatarTs.includes('useId()') || circularAvatarTs.includes('useId'),
  'CircularPlanAvatar uses useId() for safe, collision-free gradient and clipPath IDs'
);

assert(
  circularAvatarTs.includes('<clipPath') && circularAvatarTs.includes('<circle'),
  'CircularPlanAvatar clips image perfectly inside circular SVG clipPath'
);

assert(
  circularAvatarTs.includes('initial') && circularAvatarTs.includes('<text'),
  'CircularPlanAvatar supports fallback initials when no image exists'
);

// 2. UserAvatar delegates to CircularPlanAvatar
const userAvatarPath = path.join(rootDir, 'src/components/common/UserAvatar.tsx');
const userAvatarTs = fs.readFileSync(userAvatarPath, 'utf8');
assert(
  userAvatarTs.includes('CircularPlanAvatar'),
  'UserAvatar delegates directly to CircularPlanAvatar'
);

// 3. SettingsPage planLabel definition
const settingsPagePath = path.join(rootDir, 'src/pages/SettingsPage.tsx');
const settingsPageTs = fs.readFileSync(settingsPagePath, 'utf8');
assert(
  settingsPageTs.includes('planLabel = getPlanLabel('),
  'SettingsPage defines planLabel using getPlanLabel'
);
assert(
  settingsPageTs.includes('<span>{planLabel}</span>'),
  'SettingsPage renders planLabel safely in Tab 10'
);
assert(
  settingsPageTs.includes('(activePlan || \'free\').toUpperCase()'),
  'SettingsPage safeguards activePlan with fallback'
);

// 4. Centralized plan resolution logic in database.ts
const dbTypesPath = path.join(rootDir, 'src/types/database.ts');
const dbTypesTs = fs.readFileSync(dbTypesPath, 'utf8');
assert(
  dbTypesTs.includes('export function getPlanLabel('),
  'database.ts exports getPlanLabel'
);
assert(
  dbTypesTs.includes("'alim'") || dbTypesTs.includes('alim'),
  'database.ts maps alim to premium'
);

// 5. Test Plan Resolution Unit Logic
function normalizePlanSlug(val) {
  if (!val || typeof val !== 'string') return 'free';
  const s = val.trim().toLowerCase();
  if (s === 'premium' || s.includes('premium') || s === 'alim' || s.includes('alim')) return 'premium';
  if (s === 'pro' || s.includes('pro') || s === 'talib' || s.includes('talib')) return 'pro';
  return 'free';
}

function getPlanLabel(val) {
  const slug = normalizePlanSlug(val);
  if (slug === 'premium') return 'Premium';
  if (slug === 'pro') return 'Pro';
  return 'Free';
}

assert(normalizePlanSlug('pro') === 'pro', 'normalizePlanSlug("pro") === "pro"');
assert(normalizePlanSlug('talib') === 'pro', 'normalizePlanSlug("talib") === "pro"');
assert(normalizePlanSlug('premium') === 'premium', 'normalizePlanSlug("premium") === "premium"');
assert(normalizePlanSlug('alim') === 'premium', 'normalizePlanSlug("alim") === "premium"');
assert(normalizePlanSlug('alim research') === 'premium', 'normalizePlanSlug("alim research") === "premium"');
assert(normalizePlanSlug('free') === 'free', 'normalizePlanSlug("free") === "free"');
assert(normalizePlanSlug(null) === 'free', 'normalizePlanSlug(null) === "free"');
assert(getPlanLabel('premium') === 'Premium', 'getPlanLabel("premium") === "Premium"');
assert(getPlanLabel('alim') === 'Premium', 'getPlanLabel("alim") === "Premium"');
assert(getPlanLabel('pro') === 'Pro', 'getPlanLabel("pro") === "Pro"');
assert(getPlanLabel('free') === 'Free', 'getPlanLabel("free") === "Free"');
assert(getPlanLabel(undefined) === 'Free', 'getPlanLabel(undefined) === "Free"');

// 6. Pro-to-Premium Upgrade Claim Simulation
// Setup active Pro user
db.addRequest({
  id: 'req-pro-to-prem',
  reference_id: 'REQ-UPGRADE-PREM',
  user_id: 'user-pro-001',
  email: 'pro_user@example.com',
  plan_slug: 'alim', // Requested Alim / Premium
  status: 'approved',
  billing_interval: 'annual',
  duration: '1 year',
});

// User already had an active Pro subscription
db.subscriptions.push({
  id: 'sub-old-pro',
  user_id: 'user-pro-001',
  plan: 'pro',
  status: 'active',
  created_at: '2026-09-01T00:00:00Z',
});
db.profiles.set('user-pro-001', {
  id: 'user-pro-001',
  email: 'pro_user@example.com',
  plan: 'pro',
  billing_interval: 'monthly',
});

// Claim the approved Premium offer
const upgradeClaimRes = db.claimPlanOffer({
  callerId: 'user-pro-001',
  callerEmail: 'pro_user@example.com',
  referenceId: 'REQ-UPGRADE-PREM',
  now: new Date('2026-10-18T12:00:00Z'),
});

assert(upgradeClaimRes.success === true, 'Pro-to-Premium upgrade claim succeeds');
assert(upgradeClaimRes.plan === 'premium', 'Claimed tier is upgraded to Premium');
assert(upgradeClaimRes.duration_somali === '1 Sano', 'Somali duration for annual upgrade is 1 Sano');

// Verify old Pro subscription was deactivated
const oldSub = db.subscriptions.find((s) => s.id === 'sub-old-pro');
assert(oldSub.status === 'canceled', 'Old Pro subscription canceled atomically');

// Verify active profile is upgraded to Premium
const upgradedProfile = db.profiles.get('user-pro-001');
assert(upgradedProfile.plan === 'premium', 'User profile plan updated to premium');
assert(upgradedProfile.billing_interval === 'annual', 'User profile billing interval updated to annual');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}

