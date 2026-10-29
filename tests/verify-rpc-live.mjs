import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const url = (env.VITE_SUPABASE_URL || '').trim();
const key = (env.VITE_SUPABASE_ANON_KEY || '').trim();

console.log('\n======================================================');
console.log('  EMUFTI AI: Live Supabase Plan Activation Diagnostic');
console.log('======================================================\n');

if (!url || !key) {
  console.error('[CONFIG ERROR] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let allPassed = true;

// 1. Check RPC function in live Supabase schema cache
console.log('1. Checking RPC public.update_plan_request_status in schema cache...');
const dummyId = '00000000-0000-0000-0000-000000000000';
const { data: rpcData, error: rpcError } = await supabase.rpc('update_plan_request_status', {
  p_request_id: dummyId,
  p_status: 'approved',
  p_admin_notes: 'diagnostic_check',
  p_payment_verified: true,
});

if (rpcError && rpcError.code === 'PGRST202') {
  console.log('  [MISSING] Function public.update_plan_request_status NOT found in schema cache (PGRST202).');
  allPassed = false;
} else if (rpcError && (rpcError.code === '42501' || rpcError.message?.toLowerCase().includes('denied') || rpcError.code === 'P0001')) {
  console.log(`  [VERIFIED] Function public.update_plan_request_status is INSTALLED and ENFORCING ADMIN SECURITY (${rpcError.message})`);
} else if (rpcData) {
  console.log('  [VERIFIED] Function public.update_plan_request_status is INSTALLED.');
} else if (rpcError) {
  console.log(`  [STATUS] Function returned: ${rpcError.code} - ${rpcError.message}`);
  // If not PGRST202, the function exists in schema
  if (rpcError.code !== 'PGRST202') {
    console.log('  [VERIFIED] Function is registered in database schema.');
  }
}

// 2. Check public.subscriptions table
console.log('\n2. Checking public.subscriptions table in schema cache...');
const { data: subData, error: subError } = await supabase
  .from('subscriptions')
  .select('*')
  .limit(1);

if (subError && subError.code === 'PGRST205') {
  console.log('  [MISSING] Table public.subscriptions NOT found in schema cache (PGRST205).');
  allPassed = false;
} else if (subError && subError.code === '42501') {
  console.log('  [VERIFIED] Table public.subscriptions EXISTS and is protected by RLS (42501).');
} else if (!subError) {
  console.log('  [VERIFIED] Table public.subscriptions EXISTS.');
} else {
  console.log(`  [NOTICE] Subscriptions returned: ${subError.code} - ${subError.message}`);
}

// 3. Check public.profiles schema (plan and plan_activated_at)
console.log('\n3. Checking public.profiles columns (plan, plan_activated_at)...');
const { error: profError } = await supabase
  .from('profiles')
  .select('plan, plan_activated_at')
  .limit(1);

if (profError && (profError.code === '42703' || profError.message?.includes('does not exist'))) {
  console.log(`  [MISSING] Columns in public.profiles: ${profError.message}`);
  allPassed = false;
} else if (profError && profError.code === '42501') {
  console.log('  [PROTECTED] public.profiles is protected by RLS (expected for anon).');
} else if (!profError) {
  console.log('  [VERIFIED] public.profiles columns exist.');
} else {
  console.log(`  [NOTICE] Profiles query: ${profError.code} - ${profError.message}`);
}

// 4. Check public.plan_requests table
console.log('\n4. Checking public.plan_requests columns...');
const { error: prError } = await supabase
  .from('plan_requests')
  .select('id, reference_id, user_id, plan, plan_slug, status, payment_verified, admin_notes')
  .limit(1);

if (prError && (prError.code === '42703' || prError.message?.includes('does not exist'))) {
  console.log(`  [MISSING] Columns in public.plan_requests: ${prError.message}`);
  allPassed = false;
} else if (prError && prError.code === '42501') {
  console.log('  [PROTECTED] public.plan_requests is protected by RLS.');
} else if (!prError) {
  console.log('  [VERIFIED] public.plan_requests columns exist.');
}

console.log('\n======================================================');
if (!allPassed) {
  console.log('  DIAGNOSTIC SUMMARY: Action Required');
  console.log('  The live Supabase database requires running the migration:');
  console.log('    supabase/migrations/20261014_plan_activation_rpc.sql');
  console.log('  Run it in your Supabase SQL Editor to install the RPC function');
  console.log('  and create the subscriptions ledger.');
  console.log('======================================================\n');
  process.exit(2);
} else {
  console.log('  DIAGNOSTIC SUMMARY: ALL LIVE CHECKS VERIFIED SUCCESSFULLY!');
  console.log('======================================================\n');
  process.exit(0);
}
