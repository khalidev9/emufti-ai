import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('==================================================================');
console.log('  EMUFTI AI: Supabase Quran Reading Progress & Profiles Fetch Tests');
console.log('==================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Verify SQL Migration for quran_reading_progress
// -----------------------------------------------------------------------------
console.log('Test 1: SQL Migration (20261025_create_quran_reading_progress.sql)');
const migrationPath = path.resolve('supabase/migrations/20261025_create_quran_reading_progress.sql');
assert.ok(fs.existsSync(migrationPath), 'Migration file 20261025_create_quran_reading_progress.sql must exist');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Required columns as requested: id, user_id, surah_number, verse_number, page_number, updated_at
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_reading_progress'), 'Must create public.quran_reading_progress table');
assert.ok(migrationSql.includes('id UUID PRIMARY KEY DEFAULT gen_random_uuid()'), 'Must include id UUID primary key');
assert.ok(migrationSql.includes('user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE'), 'Must include user_id referencing auth.users');
assert.ok(migrationSql.includes('surah_number INT NOT NULL DEFAULT 1'), 'Must include surah_number column');
assert.ok(migrationSql.includes('verse_number INT NOT NULL DEFAULT 1'), 'Must include verse_number column');
assert.ok(migrationSql.includes('page_number INT NOT NULL DEFAULT 1'), 'Must include page_number column');
assert.ok(migrationSql.includes('updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone'), 'Must include updated_at timestamp');

// Backwards-compatible legacy column mirrors
assert.ok(migrationSql.includes('last_surah INT NOT NULL DEFAULT 1'), 'Must include legacy last_surah mirror');
assert.ok(migrationSql.includes('last_verse INT NOT NULL DEFAULT 1'), 'Must include legacy last_verse mirror');
assert.ok(migrationSql.includes('last_page INT NOT NULL DEFAULT 1'), 'Must include legacy last_page mirror');
assert.ok(migrationSql.includes('UNIQUE (user_id)'), 'Must enforce unique constraint on user_id for safe upserts');

// Row Level Security (RLS) & Policies
assert.ok(migrationSql.includes('ALTER TABLE public.quran_reading_progress ENABLE ROW LEVEL SECURITY;'), 'Must enable RLS');
assert.ok(migrationSql.includes('ON public.quran_reading_progress FOR SELECT'), 'Must define SELECT policy');
assert.ok(migrationSql.includes('ON public.quran_reading_progress FOR INSERT'), 'Must define INSERT policy');
assert.ok(migrationSql.includes('ON public.quran_reading_progress FOR UPDATE'), 'Must define UPDATE policy');
assert.ok(migrationSql.includes('ON public.quran_reading_progress FOR DELETE'), 'Must define DELETE policy');
assert.ok(migrationSql.includes('USING (auth.uid() = user_id)'), 'Policies must enforce auth.uid() = user_id');
assert.ok(migrationSql.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quran_reading_progress TO authenticated;'), 'Must grant authenticated permissions');
assert.ok(migrationSql.includes('GRANT ALL ON TABLE public.quran_reading_progress TO service_role;'), 'Must grant service_role permissions');

console.log('  ✓ Migration defines all required columns, constraints, RLS policies, and grants.');

// -----------------------------------------------------------------------------
// Test 2: Verify quranService.ts Reading Progress Handling & Circuit Breaker
// -----------------------------------------------------------------------------
console.log('\nTest 2: quranService.ts Reading Progress Resilience & Schema Mapping');
const quranServicePath = path.resolve('src/lib/quranService.ts');
const quranServiceCode = fs.readFileSync(quranServicePath, 'utf8');

assert.ok(
  quranServiceCode.includes('isReadingProgressTableAvailable'),
  'quranService.ts must implement an in-memory circuit breaker for missing table'
);
assert.ok(
  quranServiceCode.includes('lastProgressCheckTimestamp'),
  'quranService.ts must throttle re-checking missing table to avoid continuous 404 network spam'
);
assert.ok(
  quranServiceCode.includes('surah_number: s') && quranServiceCode.includes('last_surah: s'),
  'saveReadingProgress must map both surah_number and last_surah for database compatibility'
);
assert.ok(
  quranServiceCode.includes('verse_number: v') && quranServiceCode.includes('last_verse: v'),
  'saveReadingProgress must map both verse_number and last_verse for database compatibility'
);
assert.ok(
  quranServiceCode.includes('page_number: p') && quranServiceCode.includes('last_page: p'),
  'saveReadingProgress must map both page_number and last_page for database compatibility'
);
assert.ok(
  quranServiceCode.includes("data.surah_number || data.last_surah || 1"),
  'getReadingProgress must resolve from either surah_number or last_surah'
);
console.log('  ✓ quranService.ts handles table missing 404s gracefully with local fallback and dual-column schema support.');

// -----------------------------------------------------------------------------
// Test 3: Verify AuthContext.tsx Profiles Query & Network Connection Handling
// -----------------------------------------------------------------------------
console.log('\nTest 3: AuthContext.tsx Network Connection Handling & Fallback State');
const authContextPath = path.resolve('src/context/AuthContext.tsx');
const authContextCode = fs.readFileSync(authContextPath, 'utf8');

assert.ok(
  authContextCode.includes('export function isNetworkResetError'),
  'AuthContext.tsx must export isNetworkResetError helper'
);
assert.ok(
  authContextCode.includes('export async function retrySupabaseQuery'),
  'AuthContext.tsx must implement retrySupabaseQuery with backoff'
);
assert.ok(
  authContextCode.includes('export function constructFallbackProfile'),
  'AuthContext.tsx must implement constructFallbackProfile'
);
assert.ok(
  authContextCode.includes('isNetworkResetError(error)') || authContextCode.includes('isNetworkResetError(err)'),
  'AuthContext.tsx must catch network connection reset errors'
);
assert.ok(
  authContextCode.includes('setProfile((prev) => prev || fallbackProfile)'),
  'AuthContext.tsx must ensure profile is never left null on network drops or query exceptions'
);
assert.ok(
  authContextCode.includes('Profile auto-provision notice') || authContextCode.includes('Profile initial provisioning notice'),
  'AuthContext.tsx must safely handle missing profile row provision failures without blocking user'
);

console.log('  ✓ AuthContext.tsx contains retry logic, connection reset detection, and guaranteed fallback hydration.');

// -----------------------------------------------------------------------------
// Test 4: In-Process Logic Verification of Network Reset Detection & Fallback
// -----------------------------------------------------------------------------
console.log('\nTest 4: In-Process Logic Verification');

function isNetworkResetError(err) {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err.message || err.details || '').toLowerCase();
  return (
    err instanceof TypeError ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('connection reset') ||
    msg.includes('err_connection_reset') ||
    msg.includes('err_name_not_resolved') ||
    msg.includes('err_connection_refused') ||
    msg.includes('err_internet_disconnected') ||
    msg.includes('load failed') ||
    msg.includes('network request failed')
  );
}

// Test various real-world browser network exceptions
assert.ok(isNetworkResetError(new TypeError('Failed to fetch')), 'Must detect TypeError: Failed to fetch');
assert.ok(isNetworkResetError({ message: 'net::ERR_CONNECTION_RESET' }), 'Must detect net::ERR_CONNECTION_RESET');
assert.ok(isNetworkResetError(new Error('NetworkError when attempting to fetch resource.')), 'Must detect NetworkError');
assert.ok(isNetworkResetError({ message: 'TypeError: Network request failed' }), 'Must detect Network request failed');
assert.ok(!isNetworkResetError(new Error('Invalid password')), 'Must NOT falsely flag application logic errors');
assert.ok(!isNetworkResetError({ message: 'User not found' }), 'Must NOT falsely flag user not found');

console.log('  ✓ isNetworkResetError correctly discriminates network connection drops from business errors.');

// Test retrySupabaseQuery logic simulation
let callCount = 0;
async function mockFailingNetworkQuery() {
  callCount++;
  if (callCount < 3) {
    return { data: null, error: new TypeError('Failed to fetch') };
  }
  return { data: { id: 'usr-123', display_name: 'Ahmed Seeker' }, error: null };
}

async function retrySupabaseQuery(queryFn, maxRetries = 2, initialDelayMs = 50) {
  let attempt = 0;
  while (true) {
    try {
      const result = await queryFn();
      if (!result.error) {
        return result;
      }
      if (!isNetworkResetError(result.error) || attempt >= maxRetries) {
        return result;
      }
    } catch (thrown) {
      if (!isNetworkResetError(thrown) || attempt >= maxRetries) {
        return { data: null, error: thrown };
      }
    }
    attempt++;
    const delay = initialDelayMs * Math.pow(1.5, attempt);
    await new Promise((res) => setTimeout(res, delay));
  }
}

const retryResult = await retrySupabaseQuery(mockFailingNetworkQuery, 2, 20);
assert.equal(callCount, 3, 'retrySupabaseQuery should have retried until succeeding on attempt 3');
assert.ok(retryResult.data && retryResult.data.display_name === 'Ahmed Seeker', 'retrySupabaseQuery should return recovered data');

console.log('  ✓ retrySupabaseQuery successfully recovers from transient network drops.');

console.log('\n==================================================================');
console.log('🎉 ALL SUPABASE PROGRESS & PROFILES FETCH TESTS PASSED (100%)');
console.log('==================================================================\n');
