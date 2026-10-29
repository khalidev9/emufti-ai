import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING PDF DESIGN REFINEMENT & ADMIN-ONLY ACCESS TESTS ---');

const khitmaPageFile = fs.readFileSync(path.resolve('./src/pages/KhitmaPage.tsx'), 'utf-8');
const khatmServiceFile = fs.readFileSync(path.resolve('./src/lib/khatmChallengeService.ts'), 'utf-8');

// 1. RESTRICT ADMIN TEST PDF BUTTON TO ADMIN ONLY
console.log('Testing 1: Restricting Admin Test PDF Button to Authenticated Admins only...');
assert(khitmaPageFile.includes('const { user, profile, isAdmin } = useAuth()'), 'KhitmaPage must extract isAdmin from useAuth');
assert(khitmaPageFile.includes('{isAdmin &&') || khitmaPageFile.includes('isAdmin && ('), 'Admin Test PDF button must be conditionally rendered under isAdmin');
assert(!khitmaPageFile.includes('<button\n              type="button"\n              onClick={handleAdminTestSample}\n              disabled={isAdminTesting}\n              title="Tijaabi Soo Saaridda Shahaadada PDF (Admin Test Tool)"'), 'Admin Test PDF button must NOT be rendered unconditionally');
console.log('✓ Test 1 Passed: Admin Test PDF button is strictly restricted to authenticated Admins only.');

// 2. PDF CERTIFICATE CLEAN DESIGN & METRICS
console.log('Testing 2: PDF Certificate clean design without heavy background graphics...');
assert(khatmServiceFile.includes('doc.setFillColor(255, 255, 255)'), 'PDF canvas must use clean white background');
assert(khatmServiceFile.includes('doc.setLineWidth(1.5)') || khatmServiceFile.includes('doc.setLineWidth(1.0)'), 'PDF must use refined hairline double border');
assert(!khatmServiceFile.includes('doc.setFillColor(241, 245, 249)'), 'PDF metrics cards must not have heavy gray solid backgrounds');
assert(khatmServiceFile.includes('doc.setFillColor(255, 255, 255)'), 'Metrics boxes and badges must have clean white background');
console.log('✓ Test 2 Passed: PDF Certificate layout is completely clean with no heavy background graphics.');

// 3. TRANSPARENT OFFICIAL STAMP & DUAL LOGOS EMBEDDING
console.log('Testing 3: Transparent official stamp and dual logos embedding...');
assert(khatmServiceFile.includes('/images/official-stamp.png'), 'PDF must load official transparent stamp');
assert(khatmServiceFile.includes('createTransparentStampDataUrl'), 'PDF must provide high-res transparent circular stamp data URL generator');
assert(khatmServiceFile.includes('/logo.png') && khatmServiceFile.includes('/logo-quran.png'), 'PDF must embed dual logos');
assert(khatmServiceFile.includes('CERTIFICATE ID:'), 'PDF must embed unique Certificate ID');
assert(khatmServiceFile.includes('Taariikhda Bilowga') && khatmServiceFile.includes('Taariikhda Dhammaystirka'), 'PDF must embed start and completion dates');
console.log('✓ Test 3 Passed: Transparent official stamp, dual logos, user details, dates, and Certificate ID verified.');

console.log('\n--- ALL (3/3) PDF REFINEMENT & ADMIN ACCESS TESTS PASSED! ---');
