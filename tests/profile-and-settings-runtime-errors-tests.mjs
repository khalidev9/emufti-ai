import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('EMUFTI AI: PROFILE & SETTINGS RUNTIME REFERENCE-ERROR VERIFICATION');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: Fix Profile Page Error (ReferenceError: Mic is not defined)
// -----------------------------------------------------------------------------
console.log('--- Section 1: Profile Page Mic Import & Declaration ---');
const auxPagesPath = path.join(rootDir, 'src', 'pages', 'AuxiliaryPages.tsx');
assert(fs.existsSync(auxPagesPath), '1.1 AuxiliaryPages.tsx exists on disk');

const auxContent = fs.readFileSync(auxPagesPath, 'utf-8');

// Ensure Mic is imported from lucide-react
const lucideImportMatch = auxContent.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/);
assert(Boolean(lucideImportMatch), '1.2 lucide-react imports block exists');

const importedIcons = lucideImportMatch ? lucideImportMatch[1].split(',').map((s) => s.trim()) : [];
assert(
  importedIcons.includes('Mic'),
  '1.3 Mic icon is explicitly imported from lucide-react in AuxiliaryPages.tsx'
);

assert(
  auxContent.includes('<Mic className="w-4 h-4 text-blue-600" />'),
  '1.4 Subcis recitation progress card renders <Mic /> icon in ProfilePage'
);

// -----------------------------------------------------------------------------
// SECTION 2: Fix Settings Page Error (ReferenceError: chatResponseLang is not defined)
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Settings Page chatResponseLang State Definition ---');
const settingsPagePath = path.join(rootDir, 'src', 'pages', 'SettingsPage.tsx');
assert(fs.existsSync(settingsPagePath), '2.1 SettingsPage.tsx exists on disk');

const settingsContent = fs.readFileSync(settingsPagePath, 'utf-8');

assert(
  settingsContent.includes('const [chatResponseLang, setChatResponseLang] = useState'),
  '2.2 chatResponseLang state is properly declared via useState hook'
);

assert(
  settingsContent.includes('const responseLang = chatResponseLang;'),
  '2.3 responseLang alias reads the defined chatResponseLang state variable'
);

assert(
  settingsContent.includes('setChatResponseLang(profile.default_response_language)'),
  '2.4 chatResponseLang syncs dynamically when user profile default_response_language updates'
);

console.log('\n========================================================================');
console.log(`TOTAL RUNTIME ERROR TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
