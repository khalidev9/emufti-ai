import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('==================================================================');
console.log('  EMUFTI AI: Modern Login & Sign Up (Register) Redesign Test Suite');
console.log('==================================================================\n');

// 1. Inspect AuthPages.tsx
console.log('Test 1: AuthPages.tsx Modern UI/UX Structure & Glass Container');
const authPagesPath = path.resolve('src/pages/AuthPages.tsx');
assert.ok(fs.existsSync(authPagesPath), 'AuthPages.tsx must exist');
const authCode = fs.readFileSync(authPagesPath, 'utf8');

// Modern glass card container with rounded-3xl and backdrop blur
assert.ok(
  authCode.includes('bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl') &&
  authCode.includes('rounded-3xl'),
  'AuthPages must use a sleek centered glass card container with rounded-3xl and backdrop blur'
);

// Atmospheric ambient background mesh
assert.ok(
  authCode.includes('bg-gradient-to-br from-slate-50 via-blue-50/25 to-slate-100') ||
  authCode.includes('bg-gradient-to-br from-slate-50'),
  'AuthPages must feature a modern gradient background'
);
assert.ok(
  authCode.includes('max-w-full overflow-x-hidden box-border'),
  'AuthPages must preserve mobile responsiveness and prevent horizontal overflow'
);

console.log('  ✓ Modern glass/card container and ambient atmospheric background verified.');

// 2. Clear Visual Hierarchy & Welcoming Headings
console.log('\nTest 2: Clear Visual Hierarchy, Headings & Subtitles');
assert.ok(
  authCode.includes('Ku Soo Dhawow') || authCode.includes('Welcome Back'),
  'Must include welcoming heading for Login'
);
assert.ok(
  authCode.includes('Sameyso Akoon Cusub') || authCode.includes('Create Account'),
  'Must include welcoming heading for Sign Up'
);
assert.ok(
  authCode.includes('Madal Islaami ah oo Toosan') || authCode.includes('Seek Knowledge with Confidence'),
  'Must include subtle welcoming pill badge'
);

console.log('  ✓ Welcoming headings, descriptive subtitles, and badge hierarchy verified.');

// 3. Segmented Pill Switcher & Form Inputs
console.log('\nTest 3: Segmented Pill Switcher, Form Inputs & Accent Rings');
assert.ok(
  authCode.includes('grid grid-cols-2') && authCode.includes('bg-slate-100/90'),
  'Must feature sleek segmented pill switcher'
);

// Focus rings matching blue accent
assert.ok(
  authCode.includes('focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15'),
  'Form inputs must have clean borders and accent focus rings matching royal blue'
);

// Group focus icon styling
assert.ok(
  authCode.includes('group-focus-within:text-blue-600'),
  'Input icons must dynamically highlight on field focus'
);

// Eye / EyeOff password toggle
assert.ok(
  authCode.includes('showPassword ?') && authCode.includes('<EyeOff') && authCode.includes('<Eye'),
  'Password input must provide interactive show/hide toggle'
);

// Language chips for signup
assert.ok(
  authCode.includes('Soomaali') && authCode.includes('English') && authCode.includes('العربية'),
  'Sign up form must provide preferred language selection chips'
);

console.log('  ✓ Segmented switcher, accent focus rings, dynamic icons, and language selection verified.');

// 4. Prominent Action Buttons & Seamless Toggling
console.log('\nTest 4: Action Buttons, Toggling Links & Google OAuth');
assert.ok(
  authCode.includes('bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold'),
  'Must feature prominent primary action buttons with hover and active states'
);
assert.ok(
  authCode.includes('Continue with Google') && authCode.includes('GoogleIcon'),
  'Must feature prominent Google authentication option'
);
assert.ok(
  authCode.includes('switchMode') &&
  (authCode.includes("Don't have an account") || authCode.includes('Miyaanad weli akoon lahayn?')) &&
  (authCode.includes('Already have an account') || authCode.includes('Horay ma u lahayd akoon?')),
  'Must provide seamless footer toggling between login and signup'
);

console.log('  ✓ Prominent action buttons, Google OAuth, and footer toggling links verified.');

// 5. App.tsx Routes Registration
console.log('\nTest 5: App.tsx Route Registration for Login, Signup, and Register');
const appCode = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(appCode.includes('path="/login"') && appCode.includes('<LoginPage'), 'App.tsx must register /login');
assert.ok(appCode.includes('path="/signup"') && appCode.includes('<SignupPage'), 'App.tsx must register /signup');
assert.ok(appCode.includes('path="/register"') && appCode.includes('<SignupPage'), 'App.tsx must register /register');

console.log('  ✓ /login, /signup, and /register routes registered in App.tsx.');

// 6. Blue & White Palette Integrity (0 emerald)
console.log('\nTest 6: Blue & White Palette Integrity (0 emerald in AuthPages.tsx)');
const emeraldCount = (authCode.match(/emerald/g) || []).length;
assert.equal(emeraldCount, 0, `AuthPages.tsx must have 0 emerald occurrences, found ${emeraldCount}`);
const blueCount = (authCode.match(/blue/g) || []).length;
assert.ok(blueCount >= 20, `AuthPages.tsx must use blue accents, found ${blueCount}`);

console.log('  ✓ Zero emerald occurrences maintained, consistent with Royal Blue design system.');

console.log('\n==================================================================');
console.log('🎉 ALL MODERN LOGIN & SIGN UP REDESIGN TESTS PASSED (100%)');
console.log('==================================================================\n');
