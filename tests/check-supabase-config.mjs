import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

console.log('\n======================================================');
console.log('  EMUFTI AI: Supabase Connection Diagnostic');
console.log('======================================================\n');

// Load environment variables from .env, .env.local, etc.
const env = loadEnv('development', process.cwd(), '');

const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const key = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

const hasUrl = Boolean(url && !url.includes('placeholder'));
const hasKey = Boolean(key && !key.includes('placeholder'));

let host = 'N/A';
if (hasUrl) {
  try {
    const parsed = new URL(url);
    host = parsed.host;
  } catch (e) {
    host = 'INVALID_URL';
  }
}

console.log('Diagnostic Details (Zero Secret Exposure):');
console.log(`  - VITE_SUPABASE_URL configured: ${hasUrl ? 'YES' : 'NO'}`);
if (hasUrl) {
  console.log(`  - Supabase Host: ${host}`);
  console.log(`  - URL Length: ${url.length} chars`);
}
console.log(`  - VITE_SUPABASE_ANON_KEY configured: ${hasKey ? 'YES' : 'NO'}`);
if (hasKey) {
  console.log(`  - Key Length: ${key.length} chars`);
  console.log(`  - Key Format: ${key.startsWith('sb_') ? 'sb_publishable/secret format' : key.split('.').length === 3 ? 'JWT standard format' : 'custom string'}`);
}

if (!hasUrl || !hasKey) {
  console.error('\n[ERROR] Supabase configuration is incomplete.');
  console.error('Please check that .env.local contains:');
  console.error('  VITE_SUPABASE_URL=https://<your-project-id>.supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>');
  process.exit(1);
}

console.log('\nTesting live database connectivity...');
try {
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // Query public.plan_requests table head
  const { count, error } = await supabase
    .from('plan_requests')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error(`\n[DB ERROR] Query to public.plan_requests failed: ${error.message} (code: ${error.code})`);
    if (error.code === '42P01') {
      console.error('  -> Table "public.plan_requests" does not exist in the connected database.');
      console.error('  -> Run supabase/migrations/20261014_plan_requests.sql in your Supabase SQL editor.');
    } else if (error.code === '42501') {
      console.log('  -> Table exists, but anonymous HEAD/COUNT query is protected by RLS (expected behavior).');
    }
  } else {
    console.log(`[SUCCESS] Database connection active! Total plan_requests records: ${count}`);
  }

  // Test inserting test plan request
  const testRefId = `TEST-${Date.now()}`;
  console.log(`\nTesting inserting test plan request: ${testRefId}...`);

  // Try full schema first
  let { data: insertData, error: insertError } = await supabase
    .from('plan_requests')
    .insert([
      {
        reference_id: testRefId,
        full_name: 'Diagnostic Health Check',
        email: 'diagnostic@emufti.ai',
        whatsapp: '+25261000000',
        plan_slug: 'pro',
        plan: 'pro',
        message: 'Automated connectivity verification check.',
        status: 'pending',
        payment_verified: false,
      },
    ])
    .select()
    .single();

  // If columns missing in remote table (PGRST204), try with core columns
  if (insertError && insertError.code === 'PGRST204') {
    console.log(`  -> Note: Table is missing optional columns (${insertError.message}). Retrying with core columns...`);
    const minimalPayload = {
      reference_id: testRefId,
      full_name: 'Diagnostic Health Check',
      email: 'diagnostic@emufti.ai',
      whatsapp: '+25261000000',
      plan: 'pro',
      status: 'pending',
    };
    const retryRes = await supabase
      .from('plan_requests')
      .insert([minimalPayload])
      .select()
      .single();
    insertData = retryRes.data;
    insertError = retryRes.error;
  }

  if (insertError) {
    console.error(`\n[INSERT FAILED] ${insertError.message} (code: ${insertError.code})`);
    if (insertError.code === '42501') {
      console.log('\n[DIAGNOSTIC] Root Cause Identified:');
      console.log('  1. Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are valid and connected.');
      console.log('  2. The table "public.plan_requests" exists in the database.');
      console.log('  3. Row Level Security (RLS) is currently blocking public inserts because');
      console.log('     migration "supabase/migrations/20261014_plan_requests.sql" has not yet been');
      console.log('     executed in the Supabase SQL Editor.');
      console.log('\n[ACTION REQUIRED]:');
      console.log('  Open your Supabase Dashboard -> SQL Editor, paste the contents of:');
      console.log('    supabase/migrations/20261014_plan_requests.sql');
      console.log('  and click "Run". This will enable public inserts and add all columns.\n');
    }
    process.exit(1);
  } else {
    console.log(`[INSERT SUCCESSFUL] Stored record ID: ${insertData.id}, Reference: ${insertData.reference_id}, Status: ${insertData.status}`);
    
    // Clean up test record if possible
    console.log('Cleaning up diagnostic test record...');
    const { error: deleteError } = await supabase
      .from('plan_requests')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.log(`(Note: Cleanup skipped by RLS policy - record will remain as test record in admin)`);
    } else {
      console.log('[CLEANUP SUCCESSFUL] Test record removed.');
    }
  }

  console.log('\n======================================================');
  console.log('  ALL SUPABASE CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
  process.exit(0);
} catch (err) {
  console.error(`\n[EXCEPTION] Failed to connect: ${err.message}`);
  process.exit(1);
}
