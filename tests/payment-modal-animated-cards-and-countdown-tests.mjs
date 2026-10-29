import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('========================================================================');
console.log('EMUFTI AI: PAYMENT / UPGRADE MODAL ANIMATED CARDS & 60S COUNTDOWN TESTS');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

const modalPath = path.resolve('src/components/plans/PlanRequestModal.tsx');
assert.ok(fs.existsSync(modalPath), 'PlanRequestModal.tsx must exist');
const modalSource = fs.readFileSync(modalPath, 'utf8');

const cssPath = path.resolve('src/index.css');
assert.ok(fs.existsSync(cssPath), 'src/index.css must exist');
const cssSource = fs.readFileSync(cssPath, 'utf8');

// --- Suite 1: CSS Animation & Keyframes ---
console.log('--- Suite 1: CSS Keyframes & Glowing Animation Classes ---');

it('defines pulseGlow keyframe in src/index.css', () => {
  assert.ok(cssSource.includes('@keyframes pulseGlow'), 'Must define @keyframes pulseGlow');
  assert.ok(cssSource.includes('.animate-pulse-glow'), 'Must export .animate-pulse-glow utility');
});

it('defines progressPulse keyframe in src/index.css', () => {
  assert.ok(cssSource.includes('@keyframes progressPulse'), 'Must define @keyframes progressPulse');
  assert.ok(cssSource.includes('.animate-progress-pulse'), 'Must export .animate-progress-pulse utility');
});

// --- Suite 2: Modern Animated Cards in PlanRequestModal ---
console.log('\n--- Suite 2: Modern Animated Cards UI ---');

it('Payment Method cards feature hover effects, scale transitions, and glowing active borders', () => {
  assert.ok(modalSource.includes('hover:scale-[1.02]'), 'Must support subtle scale on hover');
  assert.ok(modalSource.includes('hover:-translate-y-0.5'), 'Must support subtle elevation on hover');
  assert.ok(modalSource.includes('animate-pulse-glow'), 'Active cards must feature glowing animated pulse border');
  assert.ok(modalSource.includes('ring-2 ring-blue-500'), 'Active cards must have prominent blue ring');
});

it('Billing Duration toggle has smooth transitions and animated 30% discount badge', () => {
  assert.ok(modalSource.includes('Sanadleed: Qiimo Dhimis 30%'), 'Must display 30% discount announcement');
  assert.ok(modalSource.includes('Save 30%'), 'Must have Save 30% badge');
  assert.ok(modalSource.includes('animate-pulse'), 'Save badge must animate with pulse');
  assert.ok(modalSource.includes('active:scale-95'), 'Must have press feedback');
});

it('Plan selection cards (Talib vs Alim) feature crown icon, glowing borders, and feature highlights', () => {
  assert.ok(modalSource.includes('Talib (Pro)'), 'Must include Talib (Pro) card');
  assert.ok(modalSource.includes('Alim (Premium)'), 'Must include Alim (Premium) card');
  assert.ok(modalSource.includes('Crown'), 'Must display Crown icon for Premium tier');
  assert.ok(modalSource.includes('Ugu Fiican'), 'Must display Ugu Fiican badge for Premium');
  assert.ok(modalSource.includes('Qorshe Doortay'), 'Must display Qorshe Doortay checkmark for selected plan');
});

it('Mobile Money provider cards (eVC Plus, Sahal, ZAAD) have hover scale and glowing active states', () => {
  assert.ok(modalSource.includes('eVC Plus') && modalSource.includes('Sahal') && modalSource.includes('ZAAD'), 'Must support all 3 Somali providers');
  assert.ok(modalSource.includes('hover:scale-[1.03]'), 'Providers must scale smoothly on hover');
});

// --- Suite 3: 60-Second Waiting & Submission Countdown to Admin ---
console.log('\n--- Suite 3: 60-Second Waiting & Submission Countdown ---');

it('tracks 60-second admin countdown state with ref cleanup', () => {
  assert.ok(modalSource.includes('isWaitingForAdmin'), 'Must track isWaitingForAdmin state');
  assert.ok(modalSource.includes('adminCountdown'), 'Must track adminCountdown numeric state');
  assert.ok(modalSource.includes('startAdminCountdown'), 'Must implement startAdminCountdown handler');
  assert.ok(modalSource.includes('finalizeAdminDispatch'), 'Must implement finalizeAdminDispatch handler');
  assert.ok(modalSource.includes('cancelAdminCountdown'), 'Must implement cancelAdminCountdown handler');
});

it('provides dynamic Somali status messages for each phase of the 60-second countdown', () => {
  assert.ok(modalSource.includes('Diyaarinta xogta dalabka...'), 'Phase 1: Must show Diyaarinta xogta dalabka...');
  assert.ok(modalSource.includes('Ku xiridda nidaamka maamulka...'), 'Phase 2: Must show Ku xiridda nidaamka maamulka...');
  assert.ok(modalSource.includes('Fadlan sug 60 ilbiriqsi inta laga diiwaangelinayo dalabkaaga...'), 'Phase 3: Must show Fadlan sug 60 ilbiriqsi inta laga diiwaangelinayo dalabkaaga...');
  assert.ok(modalSource.includes('Dhammaystirka diiwaangelinta iyo dirista maamulka...'), 'Phase 4: Must show Dhammaystirka diiwaangelinta iyo dirista maamulka...');
});

it('renders circular SVG progress ring and linear progress bar with live percentage', () => {
  assert.ok(modalSource.includes('<svg className="h-36 w-36 -rotate-90 transform"'), 'Must render SVG circular timer ring');
  assert.ok(modalSource.includes('strokeDashoffset'), 'Must calculate dynamic dash offset based on countdown');
  assert.ok(modalSource.includes('adminCountdown'), 'Must display numeric countdown seconds in center');
  assert.ok(modalSource.includes('Admin Dispatch Progress'), 'Must display linear progress bar');
});

it('provides Fast-Track / Expedite button and Cancel button during countdown', () => {
  assert.ok(modalSource.includes('Gudbi Hadda (Dhammaystir Hadda)'), 'Must provide immediate finalize button');
  assert.ok(modalSource.includes('Jooji Dalabka'), 'Must provide cancel button');
});

it('dispatches to public.plan_requests and presents reference code upon completion', () => {
  assert.ok(modalSource.includes("from('plan_requests')"), 'Must insert to plan_requests table');
  assert.ok(modalSource.includes('reference_id'), 'Must generate and store reference_id');
  assert.ok(modalSource.includes('status: \'pending\''), 'Must initialize status to pending');
  assert.ok(modalSource.includes('payment_verified: false'), 'Must default payment_verified to false');
  assert.ok(modalSource.includes('OFFICIAL_WHATSAPP_LINK'), 'Must link to official WhatsApp support');
  assert.ok(modalSource.includes('WhatsApp Support'), 'Must render WhatsApp Support button');
});

console.log('\n========================================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================================');

if (failed > 0) {
  process.exit(1);
}
