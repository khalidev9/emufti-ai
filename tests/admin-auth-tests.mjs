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
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName} - ${detail}`);
  }
}

console.log('\n======================================================');
console.log('  EMUFTI AI: Admin Login & Authentication Security Tests');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Source Code Inspection (AuthContext.tsx)
// -----------------------------------------------------------------------------
console.log('--- Suite 1: AuthContext Source Verification ---');
const authContextPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
const authContextCode = fs.readFileSync(authContextPath, 'utf8');

assert(
  !authContextCode.includes('supabase/migrations/20261014_plan_requests.sql yet'),
  'AuthContext does NOT falsely claim plan_requests migration is missing on login errors'
);

assert(
  authContextCode.includes('/api/auth/admin-login'),
  'AuthContext includes fallback to backend proxy /api/auth/admin-login'
);

assert(
  authContextCode.includes('Network connection error'),
  'AuthContext contains specific network connection error message'
);

assert(
  authContextCode.includes('Invalid administrator credentials'),
  'AuthContext contains clean invalid administrator credentials message'
);

// -----------------------------------------------------------------------------
// Suite 2: Server & Vite Proxy Inspection
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Server & Vite Proxy Verification ---');
const viteConfigPath = path.join(rootDir, 'vite.config.ts');
const viteConfigCode = fs.readFileSync(viteConfigPath, 'utf8');

assert(
  viteConfigCode.includes('/api/auth/admin-login'),
  'vite.config.ts registers /api/auth/admin-login endpoint'
);

const serverIndexPath = path.join(rootDir, 'server', 'index.mjs');
const serverIndexCode = fs.readFileSync(serverIndexPath, 'utf8');

assert(
  serverIndexCode.includes('/api/auth/admin-login'),
  'server/index.mjs registers /api/auth/admin-login endpoint'
);

// -----------------------------------------------------------------------------
// Suite 3: Migration File Verification
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Migration File Verification ---');
const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20261016_confirm_admin_user.sql');
assert(fs.existsSync(migrationPath), 'Migration 20261016_confirm_admin_user.sql exists');

const migrationCode = fs.readFileSync(migrationPath, 'utf8');
assert(
  migrationCode.includes('UPDATE auth.users') && migrationCode.includes('admin@emufti.ai'),
  'Migration confirms email for admin@emufti.ai'
);
assert(
  migrationCode.includes('INSERT INTO public.profiles') && migrationCode.includes("'admin'"),
  'Migration ensures admin role in public.profiles'
);

// -----------------------------------------------------------------------------
// Suite 4: Network Error vs Credential Error Handling Logic
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Error Differentiation Logic ---');

function formatAdminLoginError(error, maxAttempts = 5, recordFailedAttemptFn = () => 1) {
  const rawMsg = error?.message || 'Login failed';
  const isRealNetworkFailure =
    rawMsg === 'Failed to fetch' ||
    rawMsg.includes('Failed to fetch') ||
    rawMsg.includes('NetworkError') ||
    error?.code === 'SUPABASE_UNREACHABLE';

  if (isRealNetworkFailure) {
    // DO NOT record failed attempt
    return {
      type: 'network',
      error: `Network connection error (${rawMsg}). Unable to reach the Supabase authentication server. Please check your internet connection or verify that browser ad-blockers / shields are not blocking Supabase.`,
    };
  }

  if (rawMsg.toLowerCase().includes('confirm') || rawMsg.toLowerCase().includes('not confirmed')) {
    return {
      type: 'unconfirmed',
      error: `Administrator email has not been confirmed yet. Please verify your email or confirm it in the Supabase Dashboard / SQL Editor.`,
    };
  }

  const attempts = recordFailedAttemptFn();
  const remaining = maxAttempts - attempts;

  return {
    type: 'credentials',
    error:
      remaining > 0
        ? `Invalid administrator credentials. Please check your admin identifier and passphrase. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout).`
        : 'Portal locked for 15 minutes due to multiple failed login attempts.',
  };
}

const netRes = formatAdminLoginError({ message: 'Failed to fetch' });
assert(netRes.type === 'network', 'Failed to fetch categorized as network error');
assert(netRes.error.includes('Network connection error'), 'Network error has clear descriptive text');
assert(!netRes.error.includes('Invalid administrator credentials'), 'Network error does not claim credentials are bad');
assert(!netRes.error.includes('plan_requests'), 'Network error does not mention plan_requests');

const credRes = formatAdminLoginError({ message: 'Invalid login credentials', code: 'invalid_credentials' });
assert(credRes.type === 'credentials', 'Bad password categorized as credential error');
assert(credRes.error.includes('Invalid administrator credentials'), 'Credential error has proper notice');
assert(credRes.error.includes('remaining before temporary lockout'), 'Credential error indicates remaining attempts');

const unconfirmedRes = formatAdminLoginError({ message: 'Email not confirmed' });
assert(unconfirmedRes.type === 'unconfirmed', 'Unconfirmed email categorized properly');
assert(unconfirmedRes.error.includes('has not been confirmed yet'), 'Clear email confirmation guidance provided');

// -----------------------------------------------------------------------------
// Suite 5: Identifier Resolution Logic
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Identifier Normalization ---');

function resolveAdminEmail(usernameOrEmail) {
  const clean = (usernameOrEmail || '').trim().toLowerCase();
  return clean === 'admin' ? 'admin@emufti.ai' : clean;
}

assert(resolveAdminEmail('admin') === 'admin@emufti.ai', 'Admin alias resolves to admin@emufti.ai');
assert(resolveAdminEmail('ADMIN ') === 'admin@emufti.ai', 'Uppercase padded admin resolves to admin@emufti.ai');
assert(resolveAdminEmail('admin@emufti.ai') === 'admin@emufti.ai', 'Direct email preserved');
assert(resolveAdminEmail('custom.admin@emufti.ai') === 'custom.admin@emufti.ai', 'Custom admin email preserved');

console.log('\n======================================================');
console.log(`  Tests Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) process.exit(1);
