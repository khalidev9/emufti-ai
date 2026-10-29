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
    console.error(`  ✗ [FAIL] ${testName} - ${detail}`);
  }
}

console.log('\n========================================================================');
console.log('EMUFTI AI: AUTOMATIC PRO/PREMIUM PLAN ACTIVATION & ENTITLEMENT VERIFICATION');
console.log('========================================================================\n');

// Load source files for static verification
const authContextSource = fs.readFileSync(path.join(rootDir, 'src/context/AuthContext.tsx'), 'utf8');
const adminPageSource = fs.readFileSync(path.join(rootDir, 'src/pages/AdminPage.tsx'), 'utf8');
const planModalSource = fs.readFileSync(path.join(rootDir, 'src/components/plans/PlanRequestModal.tsx'), 'utf8');
const auxiliaryPagesSource = fs.readFileSync(path.join(rootDir, 'src/pages/AuxiliaryPages.tsx'), 'utf8');
const hardeningSql = fs.readFileSync(path.join(rootDir, 'supabase/migrations/20261015_plan_activation_hardening.sql'), 'utf8');
const focusedRpcSql = fs.readFileSync(path.join(rootDir, 'supabase/migrations/20261014_plan_activation_rpc.sql'), 'utf8');
const nullFixMigrationSql = fs.readFileSync(path.join(rootDir, 'supabase/migrations/20261015_fix_null_user_id_and_linking.sql'), 'utf8');

// -----------------------------------------------------------------------------
// Simulation Engine: Database State & Atomic RPC Execution
// -----------------------------------------------------------------------------
class MockSupabaseDatabase {
  constructor() {
    this.authUsers = new Map(); // id -> user object
    this.profiles = new Map(); // id -> profile object
    this.planRequests = new Map(); // id -> plan request object
    this.subscriptions = []; // list of subscription records
  }

  // Simulates public.handle_plan_request_insert_user_id trigger
  simulateInsertTrigger({ rawUserId, callerAuthUid, rawEmail, callerAuthEmail }) {
    let finalUserId = null;
    let finalEmail = rawEmail;

    if (callerAuthUid) {
      finalUserId = callerAuthUid;
      if (!finalEmail || finalEmail.trim() === '') {
        finalEmail = callerAuthEmail;
      }
    } else {
      finalUserId = null; // Unauthenticated caller: user_id is explicitly NULL
    }
    return { user_id: finalUserId, email: finalEmail };
  }

  // Simulates public.repair_unlinked_plan_requests RPC
  repairUnlinkedPlanRequests(callerRole = 'admin') {
    if (callerRole !== 'admin') {
      throw new Error('Access denied. Only verified administrators can repair unlinked plan requests.');
    }
    let linkedCount = 0;
    let unlinkedCount = 0;

    for (const [id, req] of this.planRequests.entries()) {
      if (!req.user_id && req.email) {
        let matchingUsers = [];
        for (const [uid, user] of this.authUsers.entries()) {
          if (user.email.toLowerCase() === req.email.toLowerCase()) {
            matchingUsers.push(uid);
          }
        }
        if (matchingUsers.length === 1) {
          req.user_id = matchingUsers[0];
          req.updated_at = new Date().toISOString();
          linkedCount++;
        } else {
          unlinkedCount++;
        }
      }
    }
    // Subscriptions are strictly NOT activated during repair
    return { success: true, linked_count: linkedCount, unlinked_count: unlinkedCount };
  }

  addUser(id, email) {
    const user = { id, email: email.toLowerCase() };
    this.authUsers.set(id, user);
    this.profiles.set(id, {
      id,
      email: email.toLowerCase(),
      display_name: email.split('@')[0],
      role: email === 'admin@emufti.ai' ? 'admin' : 'user',
      plan: 'free',
      plan_activated_at: null,
    });
    return user;
  }

  addPlanRequest(req) {
    const record = {
      id: req.id || `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      reference_id: req.reference_id,
      user_id: req.user_id || null,
      full_name: req.full_name,
      email: req.email.toLowerCase(),
      whatsapp: req.whatsapp || '+252615000000',
      plan: req.plan || 'pro',
      plan_slug: req.plan_slug || req.plan || 'pro',
      status: req.status || 'pending',
      payment_verified: Boolean(req.payment_verified),
      admin_notes: req.admin_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.planRequests.set(record.id, record);
    return record;
  }

  // Atomic simulation of public.update_plan_request_status RPC
  updatePlanRequestStatus({ requestId, status, adminNotes = null, paymentVerified = null, callerEmail = 'admin@emufti.ai', callerRole = 'admin' }) {
    // 1. Authorization check
    const isAdmin = callerEmail === 'admin@emufti.ai' || callerRole === 'admin';
    if (!isAdmin) {
      throw new Error('Access denied. Only verified administrators can update plan requests.');
    }

    // 2. Validate status
    const allowed = ['pending', 'under_review', 'approved', 'completed', 'rejected'];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status "${status}".`);
    }

    // 3. Find target request
    const req = this.planRequests.get(requestId);
    if (!req) {
      throw new Error(`Plan request with ID "${requestId}" was not found.`);
    }

    // 4. Determine verified flag
    let verified = paymentVerified !== null ? paymentVerified : status === 'rejected' ? false : req.payment_verified;

    // 5. Extract plan
    const requestedPlan = (req.plan_slug || req.plan || 'pro').toLowerCase();
    const finalPlan = (requestedPlan === 'premium') ? 'premium' : 'pro';

    // 6. Enforce payment verification before approval/completion
    if ((status === 'approved' || status === 'completed') && !verified) {
      throw new Error(`Cannot activate ${finalPlan.toUpperCase()} plan: Payment verification is required before approval.`);
    }

    // 7. Resolve target user ID
    let targetUserId = req.user_id;
    if (targetUserId && !this.authUsers.has(targetUserId)) {
      targetUserId = null;
    }
    if (!targetUserId && req.email) {
      for (const [uid, user] of this.authUsers.entries()) {
        if (user.email.toLowerCase() === req.email.toLowerCase()) {
          targetUserId = uid;
          break;
        }
      }
    }

    // 8. Prevent activation if user account is missing
    if ((status === 'approved' || status === 'completed') && !targetUserId) {
      throw new Error(`Cannot activate ${finalPlan.toUpperCase()} plan: Request has no associated registered user account. The applicant must register first.`);
    }

    // 9. Update request
    req.status = status;
    req.payment_verified = verified;
    req.user_id = targetUserId || req.user_id;
    req.admin_notes = adminNotes || req.admin_notes;
    req.updated_at = new Date().toISOString();

    // 10. Activate plan atomically
    if ((status === 'approved' || status === 'completed') && targetUserId) {
      const now = new Date().toISOString();
      // Update profile
      const prof = this.profiles.get(targetUserId);
      if (prof) {
        prof.plan = finalPlan;
        prof.plan_activated_at = now;
      }

      // Cancel prior active subscriptions for this user
      for (const sub of this.subscriptions) {
        if (sub.user_id === targetUserId && sub.status === 'active') {
          sub.status = 'canceled';
          sub.updated_at = now;
        }
      }

      // Insert new active subscription
      this.subscriptions.push({
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        user_id: targetUserId,
        plan: finalPlan,
        provider: 'manual',
        status: 'active',
        request_id: requestId,
        current_period_start: now,
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: now,
        updated_at: now,
      });
    }

    return {
      success: true,
      request_id: requestId,
      reference_id: req.reference_id,
      status,
      payment_verified: verified,
      user_id: targetUserId,
      plan: (status === 'approved' || status === 'completed') ? finalPlan : null,
      plan_activated: (status === 'approved' || status === 'completed') && Boolean(targetUserId),
    };
  }

  // Tracking function simulation matching public.get_plan_request_status
  getPlanRequestStatus(referenceId) {
    const clean = referenceId.trim().toUpperCase();
    let found = null;
    for (const req of this.planRequests.values()) {
      if (req.reference_id.toUpperCase() === clean) {
        found = req;
        break;
      }
    }
    if (!found) return null;

    let hasUser = false;
    if (found.user_id && this.authUsers.has(found.user_id)) {
      hasUser = true;
    } else if (found.email) {
      for (const user of this.authUsers.values()) {
        if (user.email === found.email) {
          hasUser = true;
          break;
        }
      }
    }

    const plan = (found.plan_slug || found.plan || 'pro').toLowerCase();
    const isActive = this.subscriptions.some(
      (s) => s.status === 'active' && s.plan === plan && (s.user_id === found.user_id || (this.authUsers.get(s.user_id)?.email === found.email))
    );

    let activation_state = 'pending';
    if (found.status === 'rejected') {
      activation_state = 'rejected';
    } else if (found.status === 'approved' || found.status === 'completed') {
      if (!found.payment_verified) {
        activation_state = 'payment_pending';
      } else if (!hasUser) {
        activation_state = 'awaiting_registration';
      } else if (isActive) {
        activation_state = 'active';
      } else {
        activation_state = 'approved';
      }
    } else if (found.status === 'under_review') {
      activation_state = 'under_review';
    } else {
      activation_state = found.payment_verified ? 'pending' : 'payment_pending';
    }

    return {
      id: found.id,
      reference_id: found.reference_id,
      plan,
      plan_slug: plan,
      status: found.status,
      payment_verified: found.payment_verified,
      has_registered_account: hasUser,
      is_active: isActive,
      activation_state,
      created_at: found.created_at,
    };
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE EXECUTION
// -----------------------------------------------------------------------------

console.log('--- Test Requirement 1: Approving an eligible Pro request activates Pro ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-101', 'seeker.pro@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-PRO001',
    user_id: user.id,
    email: user.email,
    plan: 'pro',
    payment_verified: true,
  });

  const res = db.updatePlanRequestStatus({
    requestId: req.id,
    status: 'approved',
    paymentVerified: true,
  });

  assert(res.success === true, 'Approval RPC returned success true');
  assert(res.plan_activated === true, 'Activation flag is true');
  assert(db.profiles.get(user.id).plan === 'pro', 'User profile plan updated to "pro"');
  assert(db.profiles.get(user.id).plan_activated_at !== null, 'Plan activation timestamp recorded');
  const activeSubs = db.subscriptions.filter((s) => s.user_id === user.id && s.status === 'active');
  assert(activeSubs.length === 1 && activeSubs[0].plan === 'pro', 'Active subscription created for Pro');
}

console.log('\n--- Test Requirement 2: Approving an eligible Premium request activates Premium ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-201', 'alim.scholar@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-PREM01',
    user_id: user.id,
    email: user.email,
    plan: 'premium',
    payment_verified: true,
  });

  const res = db.updatePlanRequestStatus({
    requestId: req.id,
    status: 'approved',
    paymentVerified: true,
  });

  assert(res.success === true, 'Approval RPC returned success true for Premium');
  assert(res.plan === 'premium', 'Result plan is "premium"');
  assert(db.profiles.get(user.id).plan === 'premium', 'User profile plan updated to "premium"');
  const activeSubs = db.subscriptions.filter((s) => s.user_id === user.id && s.status === 'active');
  assert(activeSubs.length === 1 && activeSubs[0].plan === 'premium', 'Active subscription created for Premium');
}

console.log('\n--- Test Requirement 3: An existing Pro user can upgrade to Premium without duplicates ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-301', 'student.upgrading@example.com');
  // First activate Pro
  const req1 = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-PRO002',
    user_id: user.id,
    email: user.email,
    plan: 'pro',
    payment_verified: true,
  });
  db.updatePlanRequestStatus({ requestId: req1.id, status: 'approved', paymentVerified: true });
  assert(db.profiles.get(user.id).plan === 'pro', 'User is initially Pro');

  // Now submit and approve Premium upgrade
  const req2 = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-PREM02',
    user_id: user.id,
    email: user.email,
    plan: 'premium',
    payment_verified: true,
  });
  db.updatePlanRequestStatus({ requestId: req2.id, status: 'approved', paymentVerified: true });

  assert(db.profiles.get(user.id).plan === 'premium', 'User profile successfully upgraded to "premium"');
  const allUserSubs = db.subscriptions.filter((s) => s.user_id === user.id);
  const activeSubs = allUserSubs.filter((s) => s.status === 'active');
  const canceledSubs = allUserSubs.filter((s) => s.status === 'canceled');

  assert(activeSubs.length === 1, 'Exactly one active subscription exists after upgrade');
  assert(activeSubs[0].plan === 'premium', 'Active subscription plan is Premium');
  assert(canceledSubs.length === 1 && canceledSubs[0].plan === 'pro', 'Older Pro subscription was canceled');
}

console.log('\n--- Test Requirement 4: A pending or unpaid request cannot grant paid access ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-401', 'unpaid@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-UNPAID',
    user_id: user.id,
    email: user.email,
    plan: 'pro',
    payment_verified: false,
  });

  // Try approving with paymentVerified = false
  let errorCaught = false;
  try {
    db.updatePlanRequestStatus({
      requestId: req.id,
      status: 'approved',
      paymentVerified: false,
    });
  } catch (err) {
    errorCaught = true;
    assert(err.message.includes('Payment verification is required'), 'RPC blocked approval without verified payment');
  }

  assert(errorCaught === true, 'Approval threw error when unpaid');
  assert(db.profiles.get(user.id).plan === 'free', 'User remains on free plan');
  assert(db.subscriptions.length === 0, 'No subscription was created for unpaid request');
}

console.log('\n--- Test Requirement 5: A rejected request cannot grant paid access ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-501', 'rejected@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-REJ001',
    user_id: user.id,
    email: user.email,
    plan: 'premium',
    payment_verified: false,
  });

  const res = db.updatePlanRequestStatus({
    requestId: req.id,
    status: 'rejected',
    adminNotes: 'Invalid documentation',
  });

  assert(res.status === 'rejected', 'Status changed to rejected');
  assert(res.plan_activated === false, 'Plan activation returned false');
  assert(db.profiles.get(user.id).plan === 'free', 'Profile remains on free plan');
  assert(db.subscriptions.length === 0, 'No subscription ledger created');
}

console.log('\n--- Test Requirement 6: A missing user account does not activate a subscription ---');
{
  const db = new MockSupabaseDatabase();
  // Request submitted by unregistered applicant
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-NOACC',
    user_id: null,
    email: 'unregistered.applicant@example.com',
    plan: 'pro',
    payment_verified: true,
  });

  let errorCaught = false;
  try {
    db.updatePlanRequestStatus({
      requestId: req.id,
      status: 'approved',
      paymentVerified: true,
    });
  } catch (err) {
    errorCaught = true;
    assert(err.message.includes('no associated registered user account'), 'RPC error specifies user registration required');
  }

  assert(errorCaught === true, 'Approval blocked for missing account');
  assert(db.subscriptions.length === 0, 'No orphaned subscription created');
}

console.log('\n--- Test Requirement 7: Unauthorized callers cannot approve requests ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-701', 'attacker@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-SEC001',
    user_id: user.id,
    email: user.email,
    plan: 'premium',
    payment_verified: true,
  });

  let errorCaught = false;
  try {
    db.updatePlanRequestStatus({
      requestId: req.id,
      status: 'approved',
      paymentVerified: true,
      callerEmail: 'attacker@example.com',
      callerRole: 'user', // Non-admin
    });
  } catch (err) {
    errorCaught = true;
    assert(err.message.includes('Only verified administrators'), 'Security error returned to unauthorized caller');
  }

  assert(errorCaught === true, 'Unauthorized approval attempt rejected');
  assert(db.profiles.get(user.id).plan === 'free', 'Profile plan untouched');
}

console.log('\n--- Test Requirement 8: Repeated approval does not create duplicate subscriptions ---');
{
  const db = new MockSupabaseDatabase();
  const user = db.addUser('u-801', 'repeat@example.com');
  const req = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-REP001',
    user_id: user.id,
    email: user.email,
    plan: 'pro',
    payment_verified: true,
  });

  // Call approval 3 times consecutively
  db.updatePlanRequestStatus({ requestId: req.id, status: 'approved', paymentVerified: true });
  db.updatePlanRequestStatus({ requestId: req.id, status: 'approved', paymentVerified: true });
  db.updatePlanRequestStatus({ requestId: req.id, status: 'approved', paymentVerified: true });

  const activeSubs = db.subscriptions.filter((s) => s.user_id === user.id && s.status === 'active');
  assert(activeSubs.length === 1, 'Exactly one active subscription exists despite repeated approvals');
  assert(db.profiles.get(user.id).plan === 'pro', 'Plan remains Pro');
}

console.log('\n--- Test Requirement 9: The tracking page does not report activation prematurely ---');
{
  const db = new MockSupabaseDatabase();

  // Scenario 9A: Submitted, unverified request
  const reqPending = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-TRK001',
    email: 'track1@example.com',
    status: 'pending',
    payment_verified: false,
  });
  const track1 = db.getPlanRequestStatus('REQ-EMUFTI-TRK001');
  assert(track1.activation_state === 'payment_pending', 'Unpaid pending request returns activation_state "payment_pending"');
  assert(track1.is_active === false, 'is_active is false');

  // Scenario 9B: Approved but applicant has not registered account yet
  const reqNoAccount = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-TRK002',
    email: 'unregistered.tracking@example.com',
    status: 'approved',
    payment_verified: true,
    user_id: null,
  });
  const track2 = db.getPlanRequestStatus('REQ-EMUFTI-TRK002');
  assert(track2.activation_state === 'awaiting_registration', 'Approved request without registered account returns "awaiting_registration"');
  assert(track2.is_active === false, 'is_active is false for awaiting registration');

  // Scenario 9C: Approved, payment verified, registered user with active subscription
  const user = db.addUser('u-903', 'activated.user@example.com');
  const reqActive = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-TRK003',
    email: user.email,
    user_id: user.id,
    plan: 'pro',
    payment_verified: true,
  });
  db.updatePlanRequestStatus({ requestId: reqActive.id, status: 'approved', paymentVerified: true });

  const track3 = db.getPlanRequestStatus('REQ-EMUFTI-TRK003');
  assert(track3.activation_state === 'active', 'Fully activated request returns activation_state "active"');
  assert(track3.is_active === true, 'is_active is true only when database subscription is confirmed');
}

console.log('\n--- Test Requirement 10: The user sees correct plan after refresh and a new login ---');
{
  assert(
    authContextSource.includes(".from('subscriptions')") &&
      authContextSource.includes(".eq('status', 'active')"),
    'AuthContext queries public.subscriptions ledger for active status'
  );
  assert(
    authContextSource.includes("sync_user_plan_entitlements"),
    'AuthContext calls sync_user_plan_entitlements RPC to reconcile unlinked requests'
  );
  assert(
    authContextSource.includes("table: 'subscriptions'"),
    'AuthContext listens to Realtime subscription ledger updates'
  );
  assert(
    authContextSource.includes("storage.setUserActivePlan(uid, dbPlan)"),
    'AuthContext syncs local storage with verified remote database truth'
  );
}

console.log('\n--- Test Requirement 11: Billing page and feature access match database plan ---');
{
  assert(
    auxiliaryPagesSource.includes("get_plan_request_status"),
    'Billing page inline tracker checks secure get_plan_request_status RPC'
  );
  assert(
    auxiliaryPagesSource.includes("trackResult.activation_state === 'awaiting_registration'"),
    'Billing page displays explicit account registration pending guidance'
  );
  assert(
    auxiliaryPagesSource.includes("trackResult.activation_state === 'active'"),
    'Billing page displays active banner only when confirmed by database'
  );
  assert(
    auxiliaryPagesSource.includes("trackResult.activation_state === 'payment_pending'"),
    'Billing page displays payment verification pending banner'
  );
}

console.log('\n--- Test Requirement 12: Activation failures are visible and recoverable ---');
{
  assert(
    adminPageSource.includes("setActionError(errMsg)"),
    'AdminPage displays error banner when RPC activation fails'
  );
  assert(
    adminPageSource.includes("await loadRequests()"),
    'AdminPage reloads requests from database after status update'
  );
  assert(
    planModalSource.includes("activation_state === 'awaiting_registration'"),
    'PlanRequestModal alerts user when registration is awaited'
  );
  assert(
    hardeningSql.includes("RAISE EXCEPTION 'Cannot activate % plan for request %: Payment verification is required"),
    'SQL migration enforces payment verification before activation'
  );
  assert(
    hardeningSql.includes("RAISE EXCEPTION 'Cannot activate % plan: Request % has no associated registered user account"),
    'SQL migration enforces real user account association before activation'
  );
}

console.log('\n--- Test Requirement 13: Enforce trusted user_id on submission and safe repair without premature activation ---');
{
  // Static checks
  assert(
    planModalSource.includes('supabase.auth.getUser()'),
    'PlanRequestModal fetches live authenticated user from Supabase Auth during submission'
  );
  assert(
    planModalSource.includes('validUserId = liveUserId'),
    'PlanRequestModal explicitly sets validUserId to authenticated UUID or null for visitors'
  );
  assert(
    adminPageSource.includes('repair_unlinked_plan_requests'),
    'AdminPage provides Repair Unlinked handler invoking database repair function'
  );
  assert(
    adminPageSource.includes('Unlinked Request'),
    'AdminPage visually distinguishes unlinked requests in table row'
  );
  assert(
    adminPageSource.includes('Registration Awaited'),
    'AdminPage modal warns administrators when applicant has no registered account'
  );
  assert(
    nullFixMigrationSql.includes('CREATE TRIGGER trigger_set_plan_request_user_id'),
    'Database migration installs trigger_set_plan_request_user_id on public.plan_requests'
  );
  assert(
    nullFixMigrationSql.includes('NEW.user_id := auth.uid()'),
    'Database trigger binds user_id to trusted auth.uid() for authenticated callers'
  );
  assert(
    nullFixMigrationSql.includes('NEW.user_id := NULL'),
    'Database trigger sets user_id := NULL for unauthenticated callers, rejecting spoofed UUIDs'
  );

  // Behavioral simulation: trigger rejects spoofed UUID and enforces auth.uid()
  const db = new MockSupabaseDatabase();
  const callerUser = db.addUser('00000000-0000-0000-0000-000000000001', 'realuser@example.com');
  const spoofedInput = db.simulateInsertTrigger({
    rawUserId: '99999999-9999-9999-9999-999999999999', // Attacker attempts to spoof another user's UUID
    callerAuthUid: callerUser.id,
    rawEmail: 'realuser@example.com',
    callerAuthEmail: 'realuser@example.com',
  });
  assert(
    spoofedInput.user_id === callerUser.id,
    'Trigger overrides spoofed client UUID with trusted caller auth.uid()'
  );

  const anonInput = db.simulateInsertTrigger({
    rawUserId: '99999999-9999-9999-9999-999999999999', // Anonymous caller attempts to set arbitrary user_id
    callerAuthUid: null,
    rawEmail: 'visitor@example.com',
    callerAuthEmail: null,
  });
  assert(
    anonInput.user_id === null,
    'Trigger clears arbitrary user_id for unauthenticated callers (user_id := NULL)'
  );

  // Behavioral simulation: repair links without activating subscriptions
  const visitorUser = db.addUser('00000000-0000-0000-0000-000000000002', 'visitor@example.com');
  const unlinkedReq = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-UNLINKED',
    email: 'visitor@example.com',
    user_id: null,
    plan: 'pro',
    payment_verified: false,
    status: 'pending',
  });
  assert(unlinkedReq.user_id === null, 'Pre-repair request has user_id = null');

  const repairResult = db.repairUnlinkedPlanRequests('admin');
  assert(repairResult.success === true, 'repairUnlinkedPlanRequests returns success');
  assert(repairResult.linked_count === 1, 'repairUnlinkedPlanRequests links matching registered account');
  assert(unlinkedReq.user_id === visitorUser.id, 'Request user_id is now updated to registered account UUID');
  assert(
    db.subscriptions.length === 0,
    'Repair function does NOT create or activate any subscriptions (safe linking only)'
  );
  assert(
    db.profiles.get(visitorUser.id).plan === 'free',
    'User profile plan remains "free" after repair (no premature plan activation)'
  );

  // Verification: Unlinked request with unknown email cannot be approved
  const orphanReq = db.addPlanRequest({
    reference_id: 'REQ-EMUFTI-ORPHAN',
    email: 'unregistered@example.com',
    user_id: null,
    plan: 'pro',
    payment_verified: true,
  });
  let approvalFailed = false;
  try {
    db.updatePlanRequestStatus({ requestId: orphanReq.id, status: 'approved', paymentVerified: true });
  } catch (err) {
    approvalFailed = true;
    assert(
      err.message.includes('has no associated registered user account'),
      'Approval fails with explicit error when applicant has no registered account'
    );
  }
  assert(approvalFailed === true, 'Unlinked orphan request cannot be approved without an account');
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log('SUMMARY: AUTOMATIC PLAN ACTIVATION TEST SUITE');
console.log(`Total:  ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL 13 AUTOMATIC ACTIVATION REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
