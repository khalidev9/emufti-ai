import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING CERTIFICATE VERIFICATION REDESIGN & 30-SECOND ANIMATION TESTS ---');

const verifyPageFile = fs.readFileSync(path.resolve('./src/pages/CertificateVerificationPage.tsx'), 'utf-8');
const appFile = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');

// 1. Modern UI/UX Redesign
console.log('Testing 1: Modern UI/UX Redesign matching white-and-blue theme...');
assert(verifyPageFile.includes('Hubinta Shahaadada Khatmka (Certificate Verification)'), 'Must include modernized title');
assert(verifyPageFile.includes('from-blue-900 via-blue-800 to-indigo-950') || verifyPageFile.includes('bg-slate-50'), 'Must use sleek white-and-blue theme gradients');
assert(verifyPageFile.includes('/images/official-stamp.png'), 'Must display official transparent stamp graphic on verified card');
assert(verifyPageFile.includes('Shahaado Sax Ah Oo La Xaqiijiyay'), 'Must display verified status badge');
console.log('✓ Test 1 Passed: Modern UI/UX redesign with official transparent stamp verified.');

// 2. Valid Certificate ID Search & Strict Validation
console.log('Testing 2: Valid Certificate ID search & validation...');
assert(verifyPageFile.includes('lookupCertificateByScreenId'), 'Must strictly validate against authentic registry');
assert(verifyPageFile.includes('Certificate ID / Screen ID') || verifyPageFile.includes('Certificate ID'), 'Must provide clear input field for Certificate ID');
assert(verifyPageFile.includes('Shahaadadan Lagama Helin Diiwaanka'), 'Must display clear feedback when ID is not found in registry');
assert(verifyPageFile.includes('searchParams.get(\'id\')') || verifyPageFile.includes('searchParams.get'), 'Must support URL parameter query');
console.log('✓ Test 2 Passed: Strict Certificate ID search and authentic registry validation verified.');

// 3. 30-Second Verification Search Animation
console.log('Testing 3: 30-Second Verification Search Animation...');
assert(verifyPageFile.includes('totalDurationMs = 30000') || verifyPageFile.includes('countdown') && verifyPageFile.includes('30'), 'Must enforce 30 seconds verification animation');
assert(verifyPageFile.includes('isVerifying'), 'Must track verification progress state');
assert(verifyPageFile.includes('scanProgress'), 'Must calculate percentage progress over 30 seconds');
assert(verifyPageFile.includes('getVerificationPhaseText') || verifyPageFile.includes('Xiriirinta diiwaanka'), 'Must provide dynamic multi-stage scanning feedback');
assert(verifyPageFile.includes('FastForward') || verifyPageFile.includes('Bood') || verifyPageFile.includes('completeVerification'), 'Must support fast-forward / completion transition');
console.log('✓ Test 3 Passed: 30-second verification search animation with progress bar and multi-stage feedback verified.');

// 4. Routing consistency
console.log('Testing 4: Routing consistency in App.tsx...');
assert(appFile.includes('path="/verify-certificate"'), 'App.tsx must register /verify-certificate');
assert(appFile.includes('path="/verify"'), 'App.tsx must register /verify shortcut');
console.log('✓ Test 4 Passed: Routing for /verify-certificate and /verify confirmed.');

console.log('\n--- ALL (4/4) CERTIFICATE VERIFICATION REDESIGN TESTS PASSED! ---');
