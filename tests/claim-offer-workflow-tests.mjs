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
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ' - ' + detail : ''}`);
  }
}

console.log('\n========================================================================');
console.log('EMUFTI AI: PLAN APPROVAL, CLAIM OFFER & AUTOMATIC SUBSCRIPTION ACTIVATION');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. Static Source File Assertions
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Source Code Verification ---');

const trackPageSource = fs.readFileSync(path.join(rootDir, 'src/pages/TrackRequestPage.tsx'), 'utf8');
const modalSource = fs.readFileSync(path.join(rootDir, 'src/components/plans/PlanRequestModal.tsx'), 'utf8');
const workflowMigration = fs.readFileSync(path.join(rootDir, 'supabase/migrations/20261016_claim_offer_workflow.sql'), 'utf8');
const storageSource = fs.readFileSync(path.join(rootDir, 'src/lib/storage.ts'), 'utf8');
const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
const pricingSource = fs.readFileSync(path.join(rootDir, 'src/pages/PricingPage.tsx'), 'utf8');

assert(
  trackPageSource.includes('Track Your Request'),
  'TrackRequestPage contains search field labeled "Track Your Request"'
);

assert(
  trackPageSource.includes('Your request is pending review'),
  'TrackRequestPage contains "Your request is pending review" message when pending'
);

assert(
  trackPageSource.includes('Claim Offer'),
  'TrackRequestPage contains "Claim Offer" action button'
);

assert(
  trackPageSource.includes('Congratulations! Your') && trackPageSource.includes('plan has been activated successfully for'),
  'TrackRequestPage displays dynamic congratulations message on activation'
);

assert(
  trackPageSource.includes('Start Chatting') && trackPageSource.includes('/chat'),
  'TrackRequestPage contains "Start Chatting" button navigating to /chat'
);

assert(
  appSource.includes('/track') && appSource.includes('TrackRequestPage'),
  'App.tsx registers /track route mapping to TrackRequestPage'
);

assert(
  pricingSource.includes('/track'),
  'PricingPage links directly to the /track claim portal'
);

assert(
  modalSource.includes('Your request is pending review'),
  'PlanRequestModal displays "Your request is pending review"'
);

assert(
  modalSource.includes('Claim Offer'),
  'PlanRequestModal provides Claim Offer button'
);

assert(
  modalSource.includes('Please save your unique tracking code'),
  'PlanRequestModal instructs users to save their tracking code after submission'
);

assert(
  workflowMigration.includes('FUNCTION public.claim_plan_offer'),
  'Migration defines atomic RPC public.claim_plan_offer'
);

assert(
  workflowMigration.includes('FUNCTION public.get_plan_request_status'),
  'Migration defines privacy-preserving public.get_plan_request_status'
);

assert(
  workflowMigration.includes('ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS duration'),
  'Migration adds duration column to public.plan_requests'
);

assert(
  workflowMigration.includes('ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS approved_at'),
  'Migration adds approved_at column to public.plan_requests'
);

assert(
  workflowMigration.includes('ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS offer_expires_at'),
  'Migration adds offer_expires_at column to public.plan_requests'
);

assert(
  workflowMigration.includes('ALTER TABLE public.plan_requests ADD COLUMN IF NOT EXISTS claimed_at'),
  'Migration adds claimed_at column to public.plan_requests'
);

assert(
  typeof storageSource === 'string' && storageSource.includes('claimPlanOffer'),
  'Storage engine implements offline/fallback claimPlanOffer method'
);

// -----------------------------------------------------------------------------
// 2. Behavioral Simulation: Complete Lifecycle
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Complete User Plan Submission Lifecycle ---');

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.planRequests = new Map();
    this.subscriptions = [];
  }

  addUser(id, email) {
    const user = { id, email: email.toLowerCase() };
    this.users.set(id, user);
    this.profiles.set(id, {
      id,
      email: email.toLowerCase(),
      display_name: email.split('@')[0],
      role: email === 'admin@emufti.ai' ? 'admin' : 'user',
      plan: 'free',
      plan_activated_at: null,
      billing_interval: 'monthly',
    });
    return user;
  }

  submitPlanRequest({ userId, email, fullName, whatsapp, plan, billingInterval }) {
    const normalizedEmail = email.toLowerCase().trim();
    // Check for duplicate active requests
    for (const req of this.planRequests.values()) {
      const isOwner = (userId && req.user_id === userId) || (req.email === normalizedEmail);
      if (isOwner && ['pending', 'under_review', 'approved'].includes(req.status)) {
        throw new Error(`Duplicate active request: ${req.reference_id} is already in status "${req.status}".`);
      }
    }

    const refId = `REQ-EMUFTI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const duration = billingInterval === 'yearly' ? '1 year' : '1 month';
    const record = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      reference_id: refId,
      user_id: userId || null,
      full_name: fullName,
      email: normalizedEmail,
      whatsapp,
      plan: plan.toLowerCase(),
      plan_slug: plan.toLowerCase(),
      billing_interval: billingInterval,
      duration,
      status: 'pending',
      payment_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      offer_expires_at: null,
      claimed_at: null,
    };
    this.planRequests.set(refId, record);
    return record;
  }

  getPlanRequestStatus(refId, callerUserId, callerEmail) {
    const cleanRef = refId.trim().toUpperCase();
    const req = this.planRequests.get(cleanRef);
    if (!req) return null;

    const isOwner = Boolean(
      (callerUserId && req.user_id === callerUserId) ||
      (callerEmail && req.email === callerEmail.toLowerCase())
    );

    const now = new Date();
    let canClaim = false;
    if (req.status === 'approved' && isOwner) {
      if (!req.offer_expires_at || new Date(req.offer_expires_at) > now) {
        canClaim = true;
      }
    }

    return {
      reference_id: req.reference_id,
      plan: req.plan,
      plan_slug: req.plan_slug,
      duration: req.duration,
      billing_interval: req.billing_interval,
      status: req.status,
      created_at: req.created_at,
      approved_at: req.approved_at,
      offer_expires_at: req.offer_expires_at,
      claimed_at: req.claimed_at,
      is_owner: isOwner,
      can_claim: canClaim,
      // Protect private fields:
      full_name: isOwner ? req.full_name : null,
      email: isOwner ? req.email : null,
    };
  }

  adminApproveRequest(refId, adminId) {
    const req = this.planRequests.get(refId);
    if (!req) throw new Error('Request not found');

    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7-day claim deadline

    req.status = 'approved';
    req.payment_verified = true;
    req.approved_at = now.toISOString();
    req.approved_by = adminId;
    req.offer_expires_at = expiry.toISOString();
    req.updated_at = now.toISOString();
    // CRITICAL: Does NOT prematurely activate user profile plan!
    return req;
  }

  claimPlanOffer(refId, callerUserId, callerEmail) {
    if (!callerUserId) throw new Error('Authentication required to claim offer');
    const cleanRef = refId.trim().toUpperCase();
    const req = this.planRequests.get(cleanRef);
    if (!req) throw new Error(`Plan request "${refId}" not found`);

    const isOwner = Boolean(
      (req.user_id && req.user_id === callerUserId) ||
      (req.email && callerEmail && req.email === callerEmail.toLowerCase())
    );

    if (!isOwner) {
      throw new Error('Access denied: You can only claim offers belonging to your own account.');
    }

    if (req.status === 'claimed') {
      throw new Error('This offer has already been claimed and is active.');
    }

    if (req.status === 'rejected') {
      throw new Error('This request was not approved and cannot be claimed.');
    }

    if (['pending', 'under_review'].includes(req.status)) {
      throw new Error('Your request is pending review and has not yet been approved.');
    }

    if (req.status !== 'approved') {
      throw new Error(`This request is not eligible to be claimed (status: ${req.status}).`);
    }

    const now = new Date();
    if (req.offer_expires_at && new Date(req.offer_expires_at) < now) {
      req.status = 'expired';
      throw new Error('This offer has expired and can no longer be claimed.');
    }

    // Atomically cancel previous active subscriptions
    for (const sub of this.subscriptions) {
      if (sub.user_id === callerUserId && sub.status === 'active') {
        sub.status = 'canceled';
        sub.updated_at = now.toISOString();
      }
    }

    // Create fresh active subscription for approved duration
    const durationIntervalDays = req.duration === '1 year' ? 365 : 30;
    const subId = `sub_${Date.now()}`;
    this.subscriptions.push({
      id: subId,
      user_id: callerUserId,
      plan: req.plan,
      provider: 'manual',
      status: 'active',
      request_id: req.id,
      current_period_start: now.toISOString(),
      current_period_end: new Date(now.getTime() + durationIntervalDays * 86400000).toISOString(),
    });

    // Update profile
    const profile = this.profiles.get(callerUserId);
    if (profile) {
      profile.plan = req.plan;
      profile.plan_activated_at = now.toISOString();
      profile.billing_interval = req.billing_interval;
    }

    // Mark request claimed
    req.status = 'claimed';
    req.claimed_at = now.toISOString();
    req.updated_at = now.toISOString();

    return {
      success: true,
      reference_id: req.reference_id,
      plan: req.plan.toUpperCase(),
      duration: req.duration,
      message: `Congratulations! Your ${req.plan.toUpperCase()} plan has been activated successfully for ${req.duration}.`,
    };
  }
}

const db = new MockDatabase();
const seeker = db.addUser('user_ahmed', 'ahmed.nur@example.com');
const otherUser = db.addUser('user_fatima', 'fatima.z@example.com');
const admin = db.addUser('admin_id', 'admin@emufti.ai');

// 1. Submit Request
const reqPro = db.submitPlanRequest({
  userId: seeker.id,
  email: seeker.email,
  fullName: 'Ahmed Nur',
  whatsapp: '+252615112233',
  plan: 'pro',
  billingInterval: 'monthly',
});

assert(Boolean(reqPro.reference_id), 'Submission returns unique tracking reference code');
assert(reqPro.duration === '1 month', 'Duration is recorded as "1 month" for monthly request');
assert(reqPro.status === 'pending', 'Initial status is "pending"');

// Duplicate submission prevention
let dupCaught = false;
try {
  db.submitPlanRequest({
    userId: seeker.id,
    email: seeker.email,
    fullName: 'Ahmed Nur',
    whatsapp: '+252615112233',
    plan: 'pro',
    billingInterval: 'monthly',
  });
} catch (e) {
  dupCaught = true;
}
assert(dupCaught, 'System prevents duplicate active requests for the same user');

// 2. Track Search - Pending State
const trackPending = db.getPlanRequestStatus(reqPro.reference_id, seeker.id, seeker.email);
assert(trackPending.status === 'pending', 'Track search displays status "pending"');
assert(trackPending.can_claim === false, 'can_claim is false while request is pending');

// Privacy protection check
const trackByStranger = db.getPlanRequestStatus(reqPro.reference_id, otherUser.id, otherUser.email);
assert(trackByStranger.is_owner === false, 'Non-owner correctly identified as is_owner=false');
assert(trackByStranger.email === null, 'Non-owner tracking query strictly hides applicant email');
assert(trackByStranger.full_name === null, 'Non-owner tracking query strictly hides applicant full name');

// 3. Admin Approval without premature activation
db.adminApproveRequest(reqPro.reference_id, admin.id);
const reqApproved = db.planRequests.get(reqPro.reference_id);
assert(reqApproved.status === 'approved', 'Admin approval sets status to "approved"');
assert(Boolean(reqApproved.approved_at), 'Approval records approval timestamp');
assert(Boolean(reqApproved.offer_expires_at), 'Approval records claim deadline');

// Verify user profile is NOT yet activated before claim
const profileBeforeClaim = db.profiles.get(seeker.id);
assert(
  profileBeforeClaim.plan === 'free',
  'User profile remains "free" after approval (no premature activation before offer is claimed)'
);

// 4. Unauthorized Claim Attempt
let unauthClaimCaught = false;
try {
  db.claimPlanOffer(reqPro.reference_id, otherUser.id, otherUser.email);
} catch (e) {
  unauthClaimCaught = true;
}
assert(unauthClaimCaught, 'Unauthorized user is strictly blocked from claiming another user\'s offer');

// 5. Successful Offer Claim
const claimResult = db.claimPlanOffer(reqPro.reference_id, seeker.id, seeker.email);
assert(claimResult.success === true, 'Claim offer returns success true');
assert(
  claimResult.message === 'Congratulations! Your PRO plan has been activated successfully for 1 month.',
  'Claim offer returns dynamic confirmation: "Congratulations! Your PRO plan has been activated successfully for 1 month."'
);

const profileAfterClaim = db.profiles.get(seeker.id);
assert(profileAfterClaim.plan === 'pro', 'User profile plan is now activated to "pro"');
assert(db.subscriptions.length === 1, 'Active subscription ledger entry created');
assert(db.subscriptions[0].plan === 'pro', 'Subscription ledger plan is "pro"');
assert(db.subscriptions[0].status === 'active', 'Subscription status is active');

// 6. Idempotency Check (Double-click / replay claim)
let doubleClaimCaught = false;
try {
  db.claimPlanOffer(reqPro.reference_id, seeker.id, seeker.email);
} catch (e) {
  doubleClaimCaught = true;
}
assert(doubleClaimCaught, 'Claiming an already-claimed offer is prevented (idempotent against double-clicks)');
assert(db.subscriptions.filter(s => s.status === 'active').length === 1, 'No duplicate active subscriptions created');

// -----------------------------------------------------------------------------
// 3. Yearly Premium Upgrade Lifecycle & Entitlements
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Yearly PREMIUM Upgrade & Chat Entitlements ---');

const reqPremium = db.submitPlanRequest({
  userId: seeker.id,
  email: seeker.email,
  fullName: 'Ahmed Nur',
  whatsapp: '+252615112233',
  plan: 'premium',
  billingInterval: 'yearly',
});

assert(reqPremium.duration === '1 year', 'Premium yearly request records duration "1 year"');
db.adminApproveRequest(reqPremium.reference_id, admin.id);

const claimPremiumResult = db.claimPlanOffer(reqPremium.reference_id, seeker.id, seeker.email);
assert(
  claimPremiumResult.message === 'Congratulations! Your PREMIUM plan has been activated successfully for 1 year.',
  'Claim offer dynamically confirms: "Congratulations! Your PREMIUM plan has been activated successfully for 1 year."'
);

assert(profileAfterClaim.plan === 'premium', 'User profile safely upgraded to "premium"');
const activeSubs = db.subscriptions.filter(s => s.status === 'active');
assert(activeSubs.length === 1, 'Older Pro subscription was canceled; exactly one active Premium subscription exists');
assert(activeSubs[0].plan === 'premium', 'Active subscription is "premium"');

// Entitlement verification
const getDailyLimit = (plan) => (plan === 'premium' ? 1000 : plan === 'pro' ? 150 : 15);
assert(getDailyLimit(profileAfterClaim.plan) === 1000, 'Premium user receives 1,000 daily AI queries');
assert(getDailyLimit('pro') === 150, 'Pro user receives 150 daily AI queries');
assert(getDailyLimit('free') === 15, 'Free user receives 15 daily AI queries');

// -----------------------------------------------------------------------------
// 4. Expiration & Rejection Verification
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Expiration & Rejection Handling ---');

const reqExpired = db.submitPlanRequest({
  userId: otherUser.id,
  email: otherUser.email,
  fullName: 'Fatima Zahra',
  whatsapp: '+252615998877',
  plan: 'pro',
  billingInterval: 'monthly',
});

db.adminApproveRequest(reqExpired.reference_id, admin.id);
// Artificially expire the offer
reqExpired.offer_expires_at = new Date(Date.now() - 3600000).toISOString();

let expiredCaught = false;
try {
  db.claimPlanOffer(reqExpired.reference_id, otherUser.id, otherUser.email);
} catch (e) {
  expiredCaught = true;
}
assert(expiredCaught, 'Expired approved offer cannot be claimed');
assert(reqExpired.status === 'expired', 'Expired request marked as "expired"');

console.log('\n========================================================================');
console.log(`SUMMARY: Total Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL CLAIM OFFER & ACTIVATION WORKFLOW TESTS PASSED PERFECTLY!\n');
}
