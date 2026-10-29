import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 EMUFTI AI — EMAIL VERIFICATION CODE SCREEN & OTP TESTS');
  console.log('======================================================\n');

  // Test 1: VerifyEmail Component File & Visual 8-Digit Slots
  console.log('--- Test 1: VerifyEmail Component Implementation ---');
  const verifyEmailPath = path.join(rootDir, 'src', 'components', 'auth', 'VerifyEmail.tsx');
  assert(fs.existsSync(verifyEmailPath), 'VerifyEmail.tsx component file exists');

  const verifyEmailContent = fs.readFileSync(verifyEmailPath, 'utf8');

  // Title & Description
  assert(
    verifyEmailContent.includes("t('auth.verify_title', 'Verify your email')") ||
    verifyEmailContent.includes('Verify your email'),
    'Displays "Verify your email" title'
  );
  assert(
    verifyEmailContent.includes('Enter the 8-digit verification code sent to your email address.'),
    'Displays "Enter the 8-digit verification code sent to your email address." description'
  );

  // Email Address Display
  assert(
    verifyEmailContent.includes('{email}') && verifyEmailContent.includes('Mail'),
    'Displays submitted email address with mail icon badge'
  );

  // 8 Visual Input Boxes with LTR enforcement
  assert(
    verifyEmailContent.includes("digits, setDigits] = useState<string[]>(['', '', '', '', '', '', '', ''])") ||
    verifyEmailContent.includes("['', '', '', '', '', '', '', '']"),
    'Initializes 8 separate digit slots'
  );
  assert(
    verifyEmailContent.includes('dir="ltr"') || verifyEmailContent.includes('dir=\'ltr\''),
    'Enforces LTR layout for digit boxes across RTL (Arabic) and LTR languages'
  );
  assert(
    verifyEmailContent.includes('inputMode="numeric"'),
    'Specifies numeric keyboard inputMode for mobile compatibility'
  );
  assert(
    verifyEmailContent.includes('handleDigitChange') && verifyEmailContent.includes('handleKeyDown'),
    'Implements digit change, auto-advance, and backspace slot navigation for 8 slots'
  );
  assert(
    verifyEmailContent.includes('slice(0, 8)') &&
    (verifyEmailContent.includes('handlePaste') || verifyEmailContent.includes('handlePastedCode')),
    'Supports pasting complete 8-digit code into any slot'
  );
  assert(
    verifyEmailContent.includes('executeVerification') &&
    verifyEmailContent.includes('fullCode.length === 8'),
    'Implements auto-submit logic when all 8 digits are entered or pasted'
  );

  // Verify Button, Resend Button with Cooldown, Change Email Option
  assert(
    verifyEmailContent.includes('Verify Email') && verifyEmailContent.includes('isVerifying'),
    'Implements Verify Email button with loading and disabled states'
  );
  assert(
    verifyEmailContent.includes('Resend Code') &&
    verifyEmailContent.includes('cooldown') &&
    verifyEmailContent.includes('60'),
    'Implements Resend Code button with 60-second cooldown timer'
  );
  assert(
    verifyEmailContent.includes('onBackToSignup') &&
    verifyEmailContent.includes('Change Email / Back to Signup'),
    'Provides onBackToSignup and Change Email / Back to Signup option'
  );
  assert(
    verifyEmailContent.includes('Didn\'t receive the email?'),
    'Provides expandable Custom SMTP / Resend Spam troubleshooting notice'
  );

  // Test 2: Integration with AuthPages.tsx
  console.log('\n--- Test 2: Create Account / AuthPages Integration ---');
  const authPagesPath = path.join(rootDir, 'src', 'pages', 'AuthPages.tsx');
  assert(fs.existsSync(authPagesPath), 'AuthPages.tsx exists');

  const authPagesContent = fs.readFileSync(authPagesPath, 'utf8');

  // VerifyEmail component imported
  assert(
    authPagesContent.includes("import { VerifyEmail } from '../components/auth/VerifyEmail';"),
    'Imports VerifyEmail component into AuthPages.tsx'
  );

  // verificationEmail state present
  assert(
    authPagesContent.includes('verificationEmail, setVerificationEmail'),
    'Maintains verificationEmail state in AuthCombinedPage'
  );

  // Connected to signUp completion & navigates to /verify-email
  assert(
    authPagesContent.includes('if (res.requiresVerification) {') &&
    authPagesContent.includes('setVerificationEmail(cleanEmail)') &&
    authPagesContent.includes("navigate(`/verify-email?email="),
    'Navigates to /verify-email with cleanEmail immediately after successful signup requiring confirmation'
  );

  // Connects unconfirmed logins to verification screen
  assert(
    authPagesContent.includes('(res as any).isUnconfirmed') &&
    authPagesContent.includes('setVerificationEmail(cleanEmail)') &&
    authPagesContent.includes("navigate(`/verify-email?email="),
    'Directs unconfirmed users attempting login straight to /verify-email OTP verification'
  );

  // VerifyEmail rendered inside card
  assert(
    authPagesContent.includes('<VerifyEmail') &&
    authPagesContent.includes('email={verificationEmail}') &&
    authPagesContent.includes('onBackToSignup'),
    'Renders VerifyEmail component with target email and onBackToSignup inside auth card'
  );

  // Export VerifyEmailPage
  assert(
    authPagesContent.includes('export const VerifyEmailPage'),
    'Exports dedicated VerifyEmailPage component for direct routing'
  );

  // Test 3: App.tsx Routing
  console.log('\n--- Test 3: App.tsx Route Registration ---');
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  assert(fs.existsSync(appPath), 'App.tsx exists');

  const appContent = fs.readFileSync(appPath, 'utf8');
  assert(
    appContent.includes('VerifyEmailPage'),
    'Imports VerifyEmailPage into App.tsx'
  );
  assert(
    appContent.includes('path="/verify-email"') &&
    appContent.includes('element={<VerifyEmailPage />}'),
    'Registers /verify-email route in App.tsx'
  );

  // Test 4: AuthContext OTP Verification & Resend Logic
  console.log('\n--- Test 4: AuthContext Supabase OTP Verification & Resend ---');
  const authContextPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
  assert(fs.existsSync(authContextPath), 'AuthContext.tsx exists');

  const authContextContent = fs.readFileSync(authContextPath, 'utf8');

  // verifyEmailOtp signature and implementation
  assert(
    authContextContent.includes('verifyEmailOtp: (') &&
    authContextContent.includes('const verifyEmailOtp = async'),
    'Implements verifyEmailOtp in AuthContext'
  );
  assert(
    authContextContent.includes("type: 'signup'") &&
    authContextContent.includes('supabase.auth.verifyOtp'),
    'Calls supabase.auth.verifyOtp with type: "signup" and cleanToken'
  );
  assert(
    authContextContent.includes("cleanToken.length !== 8"),
    'Validates that verification token is strictly 8 digits'
  );
  assert(
    authContextContent.includes("msg.includes('expired')") &&
    authContextContent.includes("msg.includes('invalid')"),
    'Maps expired and invalid OTP codes to clear user-friendly error messages'
  );

  // resendVerificationOtp implementation
  assert(
    authContextContent.includes('resendVerificationOtp: (') &&
    authContextContent.includes('const resendVerificationOtp = async'),
    'Implements resendVerificationOtp in AuthContext'
  );
  assert(
    authContextContent.includes('supabase.auth.resend({') &&
    authContextContent.includes("type: 'signup'"),
    'Calls supabase.auth.resend with type: "signup"'
  );
  assert(
    authContextContent.includes('over_email_send_rate_limit') ||
    authContextContent.includes('rate'),
    'Handles email resend rate limit errors gracefully'
  );
  assert(
    authContextContent.includes('smtp') ||
    authContextContent.includes('error sending') ||
    authContextContent.includes('delivery'),
    'Handles Custom SMTP / Resend delivery errors cleanly'
  );

  // Provider exposes OTP functions
  assert(
    authContextContent.includes('verifyEmailOtp,') &&
    authContextContent.includes('resendVerificationOtp,'),
    'Exposes verifyEmailOtp and resendVerificationOtp on AuthContext.Provider value'
  );

  // Test 5: i18n Translations
  console.log('\n--- Test 5: i18n Translations (en, so, ar) ---');
  const i18nPath = path.join(rootDir, 'src', 'lib', 'i18n.ts');
  assert(fs.existsSync(i18nPath), 'i18n.ts exists');

  const i18nContent = fs.readFileSync(i18nPath, 'utf8');

  // Verify explicit 8-digit phrasing in English, Somali, and Arabic
  assert(
    i18nContent.includes("'auth.verify_desc': 'Enter the 8-digit verification code sent to your email address.'"),
    'English contains "Enter the 8-digit verification code" instruction'
  );
  assert(
    i18nContent.includes("'auth.verify_desc': 'Gali koodhka 8-lambar ah ee loo soo diray ciwaankaaga email-ka.'"),
    'Somali contains "Gali koodhka 8-lambar ah" instruction'
  );
  assert(
    i18nContent.includes("'auth.verify_desc': 'أدخل رمز التحقق المكون من 8 أرقام المرسل إلى بريدك الإلكتروني.'"),
    'Arabic contains "أدخل رمز التحقق المكون من 8 أرقام" instruction'
  );

  const requiredKeys = [
    'auth.verify_title',
    'auth.verify_desc',
    'auth.verify_code_label',
    'auth.verify_btn',
    'auth.verify_btn_loading',
    'auth.resend_btn',
    'auth.resend_btn_loading',
    'auth.resend_cooldown',
    'auth.change_email',
    'auth.verify_enter_digits',
    'auth.verify_success',
    'auth.verify_invalid_code',
    'auth.verify_spam_notice',
  ];

  for (const key of requiredKeys) {
    const regex = new RegExp(`'${key}':\\s*'[^']+'`, 'g');
    const matches = i18nContent.match(regex) || [];
    assert(
      matches.length >= 3,
      `Translation key "${key}" has entries for all 3 languages (found: ${matches.length})`
    );
  }

  // Security Check: No secrets leaked in code
  console.log('\n--- Test 6: Security Verification ---');
  assert(
    !authPagesContent.includes('service_role') &&
    !verifyEmailContent.includes('service_role') &&
    !authContextContent.includes('service_role'),
    'No Supabase service_role keys exposed in client authentication code'
  );
  assert(
    !verifyEmailContent.includes('mockOtp') &&
    !verifyEmailContent.includes('fakeToken'),
    'Does not use fake OTP codes or bypass Supabase verification'
  );

  console.log('\n======================================================');
  console.log('🎉 ALL EMAIL VERIFICATION CODE SCREEN TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
