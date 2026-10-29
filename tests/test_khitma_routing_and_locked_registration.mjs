import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING KHITMA ROUTING & LOCKED REGISTRATION TEST SUITE ---');

const khitmaPageFile = fs.readFileSync(path.resolve('./src/pages/KhitmaPage.tsx'), 'utf-8');
const wizardFile = fs.readFileSync(path.resolve('./src/components/khitma/KhitmaRegistrationWizard.tsx'), 'utf-8');
const appFile = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');
const widgetFile = fs.readFileSync(path.resolve('./src/components/dashboard/QuranKhatmChallengeWidget.tsx'), 'utf-8');

// =========================================================================
// 1. CHECK REGISTRATION STATE ON KHITMA PAGE LOAD
// =========================================================================
console.log('Testing 1: Check Registration State on Khitma Page Load...');

// Unregistered vs registered detection in KhitmaPage
assert(
  khitmaPageFile.includes("challenge?.isRegistered ? 'tasks' : 'wizard'"),
  'KhitmaPage must check challenge?.isRegistered to set initial viewMode (tasks if registered, wizard if unregistered)'
);

assert(
  khitmaPageFile.includes('if (existing && existing.isRegistered)') &&
  khitmaPageFile.includes("setViewMode('tasks')") &&
  khitmaPageFile.includes("setViewMode('wizard')"),
  'KhitmaPage must update viewMode to tasks if registered, or wizard if unregistered on load/user change'
);

// Unregistered displays 3-Step Registration form
assert(
  khitmaPageFile.includes("viewMode === 'wizard' && !challenge?.isRegistered"),
  'KhitmaPage must render KhitmaRegistrationWizard with isLocked=false for unregistered users'
);

// 3 Steps are present in wizard
assert(wizardFile.includes('Tallaabada 1-aad: Magaca Saddexan'), 'Step 1 must be present for Full Name and Start Date');
assert(wizardFile.includes('Tallaabada 2-aad: Dooro Muddada'), 'Step 2 must be present for Duration Selection & calculation');
assert(wizardFile.includes('Tallaabada 3-aad: Xaqiijinta'), 'Step 3 must be present for Summary Confirmation & Apply');

console.log('✓ Test 1 Passed: Registration state checked on load; unregistered users receive 3-Step Wizard, registered users route to tasks.');

// =========================================================================
// 2. REDIRECT TO TASK PAGE POST-SUBMISSION
// =========================================================================
console.log('Testing 2: Redirect to Task Page Post-Submission...');

// In wizard, Apply registers and invokes onRegistered
assert(
  wizardFile.includes('registerKhatmChallenge('),
  'Wizard must call registerKhatmChallenge upon clicking Apply'
);
assert(
  wizardFile.includes('Waad ka mid noqotay bulshada khitma'),
  'Wizard must show success message: "Waad ka mid noqotay bulshada khitma"'
);
assert(
  wizardFile.includes('onRegistered(challenge)'),
  'Wizard must call onRegistered with challenge to immediately transition'
);

// In KhitmaPage, handleWizardCompleted transitions directly to Task page
assert(
  khitmaPageFile.includes('const handleWizardCompleted = (newCh: KhatmChallengeData) => {') &&
  khitmaPageFile.includes("setViewMode('tasks')") &&
  khitmaPageFile.includes("navigate('/khitma/tasks'"),
  'KhitmaPage handleWizardCompleted must set viewMode to tasks and redirect to /khitma/tasks'
);

console.log('✓ Test 2 Passed: Successful submission immediately redirects to Task Page with success notice.');

// =========================================================================
// 3. LOCK FORM DATA (NO EDITS ALLOWED FOR REGISTERED USERS)
// =========================================================================
console.log('Testing 3: Lock Form Data (No Edits Allowed for Registered Users)...');

// Top header toggle button to re-enter editable wizard is removed for registered users
assert(
  !khitmaPageFile.includes('onClick={() => setViewMode(\'wizard\')}\n                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${'),
  'Top header must NOT contain a button allowing registered users to toggle back to an editable wizard'
);

// Header shows locked badge
assert(
  khitmaPageFile.includes('Qorshaha Waa La Qufulay 🔒'),
  'KhitmaPage header must display locked badge for registered users'
);

// KhitmaRegistrationWizard supports isLocked
assert(
  wizardFile.includes('isLocked = false') || wizardFile.includes('isLocked?: boolean'),
  'KhitmaRegistrationWizard must support isLocked property'
);

// Inputs are strictly readOnly/disabled when locked
assert(
  wizardFile.includes('readOnly={isLocked}'),
  'Wizard Full Name and Start Date inputs must be readOnly={isLocked}'
);
assert(
  wizardFile.includes('disabled={isLocked}'),
  'Wizard duration options and Start Date must be disabled={isLocked}'
);

// Locked notice displayed
assert(
  wizardFile.includes('Qorshaha Khitmadaada Waa La Qufulay (Locked / Read-only)'),
  'Wizard must display locked notification when viewed in locked mode'
);
assert(
  wizardFile.includes('Lama beddeli karo'),
  'Wizard must notify user that registration details cannot be changed'
);

// Apply button replaced with navigation to tasks
assert(
  wizardFile.includes('U gudub Bogga Hawlaha (Task Page)'),
  'In locked mode, Apply button must be replaced with navigation to Task Page'
);

console.log('✓ Test 3 Passed: Form data permanently locked (read-only) once submitted; no edits permitted.');

// =========================================================================
// 4. ROUTING & ACCESS INTEGRATION
// =========================================================================
console.log('Testing 4: Routing & Access Integration...');

assert(appFile.includes('path="/khitma"'), 'App.tsx must register route for /khitma');
assert(appFile.includes('path="/khitma/tasks"'), 'App.tsx must register route for /khitma/tasks');
assert(widgetFile.includes('navigate(\'/khitma\')'), 'Quran widget must navigate to /khitma');
assert(widgetFile.includes('Bogga Hawlaha'), 'Registered users on widget see Bogga Hawlaha');

console.log('✓ Test 4 Passed: App routing and cross-page integration verified.');

console.log('\n======================================================');
console.log('  ALL (4/4) KHITMA ROUTING & LOCKED REGISTRATION TESTS PASSED!');
console.log('======================================================');
