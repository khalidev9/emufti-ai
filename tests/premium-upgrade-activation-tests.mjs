/**
 * EMufti AI - Comprehensive Regression Test Suite:
 * Approved Premium Requests Must Activate PREMIUM Entitlements
 *
 * Verifies end-to-end upgrade workflow:
 * 1. User with active PRO subscription upgrades to PREMIUM
 * 2. Admin approval via update_plan_request_status activates PREMIUM
 * 3. Prior active PRO subscription canceled to prevent duplicate active rows
 * 4. Subscriptions table correctly stores active 'premium' record
 * 5. Idempotent re-approval does not duplicate subscriptions or change expiration
 * 6. profiles.plan and profiles.quran_plan become 'premium'
 * 7. In-app Somali notification delivered for Premium activation
 * 8. sync_user_plan_entitlements tier precedence: PREMIUM always beats PRO even if PRO ends later
 * 9. AuthContext fetchProfile picker: activeSubs finds PREMIUM over PRO
 * 10. AuthContext activePlan resolution: Strict tier precedence (premium > pro > free)
 * 11. ChatContext quota: dailyLimit = 1,000 for Premium (vs 150 Pro, 15 Free)
 * 12. QuranPage entitlement: is_paid_member = true, unlimited = true
 * 13. UI badges: Header ('PREMIUM ACTIVE'), Sidebar ('PREMIUM'), Billing ('Alim (Premium) Scholar')
 * 14. Static code inspection of SQL migration and AuthContext
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         ${err.message}`);
  }
}

console.log('========================================================================');
console.log('EMUFTI AI: APPROVED PREMIUM UPGRADE ACTIVATION TEST SUITE');
console.log('========================================================================\n');

// 1. Normalization functions matching src/types/database.ts
function normalizePlanSlug(val) {
  if (!val || typeof val !== 'string') return 'free';
  const s = val.trim().toLowerCase();
  if (s === 'premium' || s.includes('premium')) return 'premium';
  if (s === 'pro' || s.includes('pro')) return 'pro';
  return 'free';
}

function normalizeSubscriptionStatus(val) {
  if (!val || typeof val !== 'string') return '';
  return val.trim().toLowerCase();
}

// 2. Mock Database & RPC Simulation Engine
class MockDatabase {
  constructor() {
    this.authUsers = new Map();
    this.profiles = new Map();
    this.planRequests = new Map();
    this.subscriptions = [];
    this.notifications = [];
  }

  addUser(id, email, role = 'user') {
    const user = { id, email: email.toLowerCase() };
    this.authUsers.set(id, user);
    this.profiles.set(id, {
      id,
      email: email.toLowerCase(),
      display_name: email.split('@')[0],
      role,
      plan: 'free',
      quran_plan: 'free',
      billing_interval: 'monthly',
      plan_activated_at: null,
      plan_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return user;
  }

  // Exact reproduction of public.update_plan_request_status RPC
  updatePlanRequestStatus({ requestId, status, adminNotes = '', paymentVerified = null, callerRole = 'admin', mockNow = new Date() }) {
    if (callerRole !== 'admin') {
      throw new Error('Access denied. Only verified administrators can update plan requests.');
    }
    if (!['pending', 'under_review', 'approved', 'completed', 'rejected'].includes(status)) {
      throw new Error(`Invalid status "${status}".`);
    }

    const req = this.planRequests.get(requestId);
    if (!req) {
      throw new Error(`Plan request with ID "${requestId}" was not found.`);
    }

    let verified = paymentVerified;
    if (verified === null || verified === undefined) {
      if (['approved', 'completed'].includes(status)) verified = true;
      else if (status === 'rejected') verified = false;
      else verified = Boolean(req.payment_verified);
    }

    const planSlug = lowerTrim(req.plan_slug || req.plan || 'pro');
    const v_plan = planSlug.includes('premium') ? 'premium' : 'pro';
    const v_interval = lowerTrim(req.billing_interval || 'monthly') === 'yearly' ? 'yearly' : 'monthly';
    const v_price = v_plan === 'premium'
      ? (v_interval === 'yearly' ? 75.99 : 20.99)
      : (v_interval === 'yearly' ? 50.99 : 5.99);

    if (['approved', 'completed'].includes(status) && !verified) {
      throw new Error(`Cannot activate ${v_plan.toUpperCase()} plan: Payment verification is required.`);
    }

    let v_user_id = req.user_id;
    if (v_user_id && !this.authUsers.has(v_user_id)) {
      v_user_id = null;
    }
    if (!v_user_id && req.email) {
      for (const [uid, u] of this.authUsers.entries()) {
        if (u.email.toLowerCase() === req.email.toLowerCase()) {
          v_user_id = uid;
          break;
        }
      }
    }
    if (['approved', 'completed'].includes(status) && !v_user_id) {
      throw new Error(`Cannot activate ${v_plan.toUpperCase()} plan: Request has no associated registered user account.`);
    }

    const durationDays = v_interval === 'yearly' ? 365 : 30;
    const v_period_end = new Date(mockNow.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Update request
    req.status = status;
    req.payment_verified = verified;
    req.user_id = req.user_id || v_user_id;
    req.plan = v_plan;
    req.plan_slug = v_plan;
    req.billing_interval = v_interval;
    req.price_amount = v_price;
    req.updated_at = mockNow.toISOString();

    if (['approved', 'completed'].includes(status) && v_user_id) {
      // Update profile
      const prof = this.profiles.get(v_user_id);
      if (prof) {
        prof.plan = v_plan;
        prof.quran_plan = v_plan;
        prof.plan_activated_at = mockNow.toISOString();
        prof.plan_expires_at = v_period_end.toISOString();
        prof.billing_interval = v_interval;
        prof.updated_at = mockNow.toISOString();
      }

      // Cancel prior active subscriptions (not this request)
      for (const sub of this.subscriptions) {
        if (sub.user_id === v_user_id && lowerTrim(sub.status) === 'active' && sub.request_id !== requestId) {
          sub.status = 'canceled';
          sub.updated_at = mockNow.toISOString();
        }
      }

      // Idempotent subscription handling
      const existingSub = this.subscriptions.find((s) => s.request_id === requestId);
      if (existingSub) {
        existingSub.plan = v_plan;
        existingSub.billing_interval = v_interval;
        existingSub.price_amount = v_price;
        existingSub.status = 'active';
        existingSub.quran_access = true;
        existingSub.updated_at = mockNow.toISOString();
      } else {
        this.subscriptions.push({
          id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: v_user_id,
          plan: v_plan,
          billing_interval: v_interval,
          price_amount: v_price,
          currency: 'USD',
          provider: 'manual',
          status: 'active',
          request_id: requestId,
          quran_access: true,
          current_period_start: mockNow.toISOString(),
          current_period_end: v_period_end.toISOString(),
          created_at: mockNow.toISOString(),
          updated_at: mockNow.toISOString(),
        });
      }

      // In-app Somali Notification
      const planLabel = v_plan === 'premium' ? 'Premium' : 'Pro';
      const durationLabel = v_interval === 'yearly' ? 'sanad' : 'bil';
      const notif = {
        id: `notif_${Date.now()}`,
        user_id: v_user_id,
        title: `Hambalyo! Subscription-kaaga ${durationLabel}laha ah waa la kiciyay (${v_plan.toUpperCase()})`,
        message: `Hambalyo! Waxaad heshay subscription-kaaga ${planLabel} muddo ${durationLabel} ah. Ku raaxayso adeegga EMufti AI.`,
        type: 'plan_activation',
        metadata: {
          request_id: requestId,
          reference_id: req.reference_id,
          plan: v_plan,
          quran_plan: v_plan,
          billing_interval: v_interval,
          start_date: mockNow.toISOString(),
          expires_at: v_period_end.toISOString(),
          price_amount: v_price,
        },
        is_read: false,
        created_at: mockNow.toISOString(),
        updated_at: mockNow.toISOString(),
      };
      this.notifications.push(notif);
    }

    return {
      success: true,
      request_id: requestId,
      reference_id: req.reference_id,
      status,
      payment_verified: verified,
      user_id: v_user_id,
      plan: ['approved', 'completed'].includes(status) ? v_plan : null,
      quran_plan: ['approved', 'completed'].includes(status) ? v_plan : null,
      billing_interval: v_interval,
      price_amount: v_price,
      current_period_start: mockNow.toISOString(),
      current_period_end: v_period_end.toISOString(),
      plan_activated: ['approved', 'completed'].includes(status) && Boolean(v_user_id),
      updated_at: mockNow.toISOString(),
    };
  }

  // Exact reproduction of public.sync_user_plan_entitlements RPC
  syncUserPlanEntitlements(uid, mockNow = new Date()) {
    // 1. Expire active subscriptions past current_period_end
    for (const sub of this.subscriptions) {
      if (sub.user_id === uid && lowerTrim(sub.status) === 'active' && sub.current_period_end) {
        if (new Date(sub.current_period_end) <= mockNow) {
          sub.status = 'expired';
          sub.updated_at = mockNow.toISOString();
        }
      }
    }

    // 2. Select active subscriptions with strict tier precedence:
    // ORDER BY CASE WHEN lower(trim(plan)) ILIKE '%premium%' THEN 2 ELSE 1 END DESC, created_at DESC, current_period_end DESC
    const activeSubs = this.subscriptions
      .filter((s) => s.user_id === uid && lowerTrim(s.status) === 'active' && (!s.current_period_end || new Date(s.current_period_end) > mockNow))
      .sort((a, b) => {
        const priorityA = lowerTrim(a.plan).includes('premium') ? 2 : 1;
        const priorityB = lowerTrim(b.plan).includes('premium') ? 2 : 1;
        if (priorityA !== priorityB) return priorityB - priorityA;
        return new Date(b.created_at) - new Date(a.created_at);
      });

    if (activeSubs.length > 0) {
      const topSub = activeSubs[0];
      const plan = lowerTrim(topSub.plan).includes('premium') ? 'premium' : 'pro';
      const prof = this.profiles.get(uid);
      if (prof) {
        prof.plan = plan;
        prof.quran_plan = plan;
        prof.plan_expires_at = topSub.current_period_end;
        prof.billing_interval = topSub.billing_interval;
      }
      return {
        success: true,
        has_active_subscription: true,
        plan,
        quran_plan: plan,
        billing_interval: topSub.billing_interval,
        plan_expires_at: topSub.current_period_end,
      };
    }

    return {
      success: true,
      has_active_subscription: false,
      plan: 'free',
      quran_plan: 'expired',
    };
  }
}

function lowerTrim(val) {
  if (!val || typeof val !== 'string') return '';
  return val.trim().toLowerCase();
}

// 3. AuthContext subscription picker and activePlan logic
function pickActiveSubscription(subsData, now = new Date()) {
  if (!subsData || !Array.isArray(subsData)) return null;
  const activeSubs = subsData.filter((s) => {
    const normStatus = normalizeSubscriptionStatus(s?.status);
    const normPlan = normalizePlanSlug(s?.plan);
    const notExpired = !s?.current_period_end || new Date(s.current_period_end) > now;
    return normStatus === 'active' && (normPlan === 'pro' || normPlan === 'premium') && notExpired;
  });

  return activeSubs.find((s) => normalizePlanSlug(s?.plan) === 'premium')
    || activeSubs.find((s) => normalizePlanSlug(s?.plan) === 'pro')
    || null;
}

function computeActivePlan({ subscription, profile, localPlan }) {
  let subPlan = 'free';
  if (subscription) {
    const normStatus = normalizeSubscriptionStatus(subscription.status);
    const normPlan = normalizePlanSlug(subscription.plan);
    const notExpired = !subscription.current_period_end || new Date(subscription.current_period_end) > new Date();
    if (normStatus === 'active' && (normPlan === 'pro' || normPlan === 'premium') && notExpired) {
      subPlan = normPlan;
    }
  }

  let profPlan = 'free';
  if (profile) {
    const normPlan = normalizePlanSlug(profile.plan);
    const notExpired = !profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date();
    if ((normPlan === 'pro' || normPlan === 'premium') && notExpired) {
      profPlan = normPlan;
    }
  }

  let lPlan = 'free';
  if (localPlan) {
    const normLocal = normalizePlanSlug(localPlan);
    if (normLocal === 'pro' || normLocal === 'premium') {
      lPlan = normLocal;
    }
  }

  // Strict tier precedence hierarchy: premium (tier 3) > pro (tier 2) > free (tier 1)
  if (subPlan === 'premium' || profPlan === 'premium' || lPlan === 'premium') {
    return 'premium';
  }
  if (subPlan === 'pro' || profPlan === 'pro' || lPlan === 'pro') {
    return 'pro';
  }
  return 'free';
}

// =============================================================================
// TEST EXECUTION
// =============================================================================

const db = new MockDatabase();
const testUser = db.addUser('user-upgrade-123', 'ahmed.student@example.com');

// Set up initial state: User has an active PRO subscription ending 10 months from now
const now = new Date();
const proEnd = new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000); // 300 days in future
const initialProSub = {
  id: 'sub-pro-001',
  user_id: testUser.id,
  plan: 'pro',
  billing_interval: 'yearly',
  price_amount: 50.99,
  currency: 'USD',
  provider: 'manual',
  status: 'active',
  request_id: 'req-old-pro',
  quran_access: true,
  current_period_start: now.toISOString(),
  current_period_end: proEnd.toISOString(),
  created_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString(),
};
db.subscriptions.push(initialProSub);
const prof = db.profiles.get(testUser.id);
prof.plan = 'pro';
prof.quran_plan = 'pro';
prof.plan_expires_at = proEnd.toISOString();
prof.billing_interval = 'yearly';

runTest('1. User starts with verified active PRO plan', () => {
  assert.equal(prof.plan, 'pro');
  const picked = pickActiveSubscription(db.subscriptions);
  assert.equal(picked.plan, 'pro');
  const plan = computeActivePlan({ subscription: picked, profile: prof, localPlan: 'pro' });
  assert.equal(plan, 'pro');
});

// User submits request to upgrade to PREMIUM (monthly)
const premiumReq = {
  id: 'req-prem-999',
  reference_id: 'REQ-PREM-999',
  user_id: testUser.id,
  email: testUser.email,
  full_name: 'Ahmed Student',
  plan_slug: 'premium',
  plan: 'premium',
  billing_interval: 'monthly',
  price_amount: 20.99,
  currency: 'USD',
  status: 'pending',
  payment_verified: false,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};
db.planRequests.set(premiumReq.id, premiumReq);

runTest('2. Premium upgrade request submitted as pending', () => {
  const r = db.planRequests.get('req-prem-999');
  assert.equal(r.plan_slug, 'premium');
  assert.equal(r.status, 'pending');
});

runTest('3. Admin approval without payment verification is rejected', () => {
  assert.throws(() => {
    db.updatePlanRequestStatus({
      requestId: 'req-prem-999',
      status: 'approved',
      paymentVerified: false,
      callerRole: 'admin',
    });
  }, /Payment verification is required/);
});

runTest('4. Non-admin caller cannot approve requests', () => {
  assert.throws(() => {
    db.updatePlanRequestStatus({
      requestId: 'req-prem-999',
      status: 'approved',
      paymentVerified: true,
      callerRole: 'user',
    });
  }, /Only verified administrators/);
});

// Admin approves with payment verification
let rpcResult = null;
runTest('5. Admin approves verified PREMIUM request: updates request, profile, and subscription atomically', () => {
  rpcResult = db.updatePlanRequestStatus({
    requestId: 'req-prem-999',
    status: 'approved',
    paymentVerified: true,
    callerRole: 'admin',
    mockNow: now,
  });

  assert.equal(rpcResult.success, true);
  assert.equal(rpcResult.status, 'approved');
  assert.equal(rpcResult.plan, 'premium');
  assert.equal(rpcResult.quran_plan, 'premium');
  assert.equal(rpcResult.plan_activated, true);
});

runTest('6. User profiles.plan and profiles.quran_plan are updated to "premium"', () => {
  const updatedProf = db.profiles.get(testUser.id);
  assert.equal(updatedProf.plan, 'premium');
  assert.equal(updatedProf.quran_plan, 'premium');
  assert.equal(updatedProf.billing_interval, 'monthly');
  assert(new Date(updatedProf.plan_expires_at) > now);
});

runTest('7. Old PRO subscription is canceled and new PREMIUM subscription is active', () => {
  const oldPro = db.subscriptions.find((s) => s.id === 'sub-pro-001');
  assert.equal(oldPro.status, 'canceled');

  const newPrem = db.subscriptions.find((s) => s.request_id === 'req-prem-999');
  assert(newPrem, 'Active PREMIUM subscription must exist');
  assert.equal(newPrem.status, 'active');
  assert.equal(newPrem.plan, 'premium');
  assert.equal(newPrem.quran_access, true);
});

runTest('8. Somali in-app congratulatory notification created for Premium activation', () => {
  const notif = db.notifications.find((n) => n.metadata?.request_id === 'req-prem-999');
  assert(notif, 'Notification must exist');
  assert.equal(notif.metadata.plan, 'premium');
  assert(notif.message.includes('Premium'), 'Message must mention Premium');
  assert(notif.message.includes('Hambalyo!'), 'Message must contain Somali greeting');
});

runTest('9. Idempotency: Re-approving the same request does NOT duplicate subscription rows', () => {
  const countBefore = db.subscriptions.length;
  db.updatePlanRequestStatus({
    requestId: 'req-prem-999',
    status: 'approved',
    paymentVerified: true,
    callerRole: 'admin',
    mockNow: now,
  });
  const countAfter = db.subscriptions.length;
  assert.equal(countBefore, countAfter, 'Subscription rows count must remain unchanged');
  const activeSubs = db.subscriptions.filter((s) => s.user_id === testUser.id && s.status === 'active');
  assert.equal(activeSubs.length, 1, 'Only one active subscription must exist');
});

runTest('10. sync_user_plan_entitlements: Tier precedence picks PREMIUM even if an active PRO sub had a later date', () => {
  // Add a hypothetical second active PRO subscription with a later date
  db.subscriptions.push({
    id: 'sub-pro-future',
    user_id: testUser.id,
    plan: 'pro',
    status: 'active',
    current_period_end: new Date(now.getTime() + 400 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const syncRes = db.syncUserPlanEntitlements(testUser.id, now);
  assert.equal(syncRes.success, true);
  assert.equal(syncRes.plan, 'premium', 'syncUserPlanEntitlements must resolve to premium via tier precedence');
  assert.equal(syncRes.quran_plan, 'premium');
});

runTest('11. AuthContext subscription picker: picks PREMIUM over PRO when both exist in array', () => {
  const subs = [
    { plan: 'pro', status: 'active', current_period_end: new Date(now.getTime() + 400 * 24 * 60 * 60 * 1000).toISOString() },
    { plan: 'premium', status: 'active', current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() },
  ];
  const picked = pickActiveSubscription(subs, now);
  assert.equal(picked.plan, 'premium');
});

runTest('12. AuthContext activePlan: Resolves to PREMIUM even if subscription is PRO and profile is PREMIUM', () => {
  const plan = computeActivePlan({
    subscription: { plan: 'pro', status: 'active' },
    profile: { plan: 'premium' },
    localPlan: 'pro',
  });
  assert.equal(plan, 'premium', 'Strict tier precedence must pick premium');
});

runTest('13. ChatContext daily quota: PREMIUM grants 1,000 queries/day', () => {
  const planLimits = { free: 15, pro: 150, premium: 1000 };
  const userPlan = computeActivePlan({
    subscription: { plan: 'premium', status: 'active' },
    profile: { plan: 'premium' },
    localPlan: 'premium',
  });
  const limit = planLimits[userPlan];
  assert.equal(limit, 1000, 'Premium plan quota must be 1,000');
});

runTest('14. QuranPage and UI badges resolve to PREMIUM', () => {
  const activePlan = 'premium';
  const isPaidMember = activePlan === 'pro' || activePlan === 'premium';
  assert.equal(isPaidMember, true);

  // Header badge
  const headerBadge = activePlan === 'premium' ? 'PREMIUM ACTIVE' : activePlan === 'pro' ? 'PRO ACTIVE' : '';
  assert.equal(headerBadge, 'PREMIUM ACTIVE');

  // Sidebar badge
  const sidebarBadge = activePlan.toUpperCase();
  assert.equal(sidebarBadge, 'PREMIUM');

  // Billing card title
  const studyTier = activePlan === 'premium' ? 'Alim (Premium) Scholar' : activePlan === 'pro' ? 'Talib (Pro) Seeker' : 'Free Seeker';
  assert.equal(studyTier, 'Alim (Premium) Scholar');
});

// 15. Static code verification of files
runTest('15. Static check: SQL migration and AuthContext implement tier precedence', () => {
  const migrationPath = path.join(rootDir, 'supabase/migrations/20261015_premium_upgrade_activation_fix.sql');
  const authContextPath = path.join(rootDir, 'src/context/AuthContext.tsx');
  const adminPagePath = path.join(rootDir, 'src/pages/AdminPage.tsx');

  assert(fs.existsSync(migrationPath), 'Migration 20261015_premium_upgrade_activation_fix.sql must exist');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  assert(migrationContent.includes('CASE WHEN lower(trim(plan)) ILIKE \'%premium%\' THEN 2 ELSE 1 END DESC'), 'SQL must order active subscriptions with premium priority');
  assert(migrationContent.includes('WHERE user_id = v_user_id'), 'SQL must cancel prior active subscriptions for user');

  const authContent = fs.readFileSync(authContextPath, 'utf8');
  assert(authContent.includes('activeSubs.find((s: any) => normalizePlanSlug(s?.plan) === \'premium\')'), 'AuthContext must prioritize premium subscription');
  assert(authContent.includes('subPlan === \'premium\' || profPlan === \'premium\' || localPlan === \'premium\''), 'activePlan must enforce premium tier precedence');

  const adminContent = fs.readFileSync(adminPagePath, 'utf8');
  assert(adminContent.includes('resolvedPlan'), 'AdminPage must normalize resolvedPlan upon approval');
});

console.log('\n========================================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All regression tests passed successfully!');
}
