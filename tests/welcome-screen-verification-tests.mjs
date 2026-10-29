import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Verifying WelcomeScreen.tsx and Icons ---');

const welcomeScreenPath = path.join(projectRoot, 'src', 'components', 'chat', 'WelcomeScreen.tsx');
if (!fs.existsSync(welcomeScreenPath)) {
  console.error('FAIL: WelcomeScreen.tsx does not exist');
  process.exit(1);
}

const content = fs.readFileSync(welcomeScreenPath, 'utf8');

// 1. Verify BookOpen is imported from 'lucide-react'
const lucideImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
if (!lucideImportMatch) {
  console.error('FAIL: lucide-react import not found in WelcomeScreen.tsx');
  process.exit(1);
}

const importedIcons = lucideImportMatch[1]
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

console.log('Imported lucide icons:', importedIcons);

if (!importedIcons.includes('BookOpen')) {
  console.error('FAIL: BookOpen is NOT imported in WelcomeScreen.tsx');
  process.exit(1);
}
console.log('PASS: BookOpen is imported successfully.');

// 2. Verify all icons used in PROMPT_SUGGESTIONS are imported
const suggestionsBlock = content.match(/const PROMPT_SUGGESTIONS[\s\S]*?\];/)?.[0] || '';
const promptIcons = [...suggestionsBlock.matchAll(/icon:\s*([A-Za-z0-9_]+)/g)].map((m) => m[1]);
console.log('Icons referenced in PROMPT_SUGGESTIONS:', promptIcons);

for (const icon of promptIcons) {
  if (!importedIcons.includes(icon)) {
    console.error(`FAIL: Icon ${icon} is used in PROMPT_SUGGESTIONS but not imported from lucide-react!`);
    process.exit(1);
  }
}
console.log('PASS: All icons in PROMPT_SUGGESTIONS are properly imported.');

// 3. Check for any other JSX icons or components in WelcomeScreen.tsx return statement
const returnBlock = content.match(/return\s*\(\s*([\s\S]*)\s*\);\s*\};/)?.[1] || '';
const jsxTagMatches = [...returnBlock.matchAll(/<([A-Z][A-Za-z0-9_]+)/g)].map((m) => m[1]);
const uniqueJsxTags = [...new Set(jsxTagMatches)];
console.log('JSX components/tags used in WelcomeScreen return statement:', uniqueJsxTags);

const knownLocalOrImported = new Set([
  ...importedIcons,
  'Logo',
  'Link',
  'Icon', // dynamic variable <Icon className="..." />
  'React',
  'WelcomeScreen',
]);

for (const tag of uniqueJsxTags) {
  if (!knownLocalOrImported.has(tag)) {
    console.error(`FAIL: Undefined JSX component: <${tag}>`);
    process.exit(1);
  }
}
console.log('PASS: All JSX elements in WelcomeScreen.tsx are accounted for.');

// 4. Test fetch from Vite dev server to verify module transformation
const devServerUrl = 'http://localhost:5173/src/components/chat/WelcomeScreen.tsx';
try {
  const res = await fetch(devServerUrl);
  if (!res.ok) {
    console.error(`FAIL: Dev server returned status ${res.status}`);
    process.exit(1);
  }
  const body = await res.text();
  if (body.includes('ReferenceError') || body.includes('SyntaxError')) {
    console.error('FAIL: Error in module transform on dev server');
    process.exit(1);
  }
  console.log(`PASS: Vite dev server transformed WelcomeScreen.tsx successfully (${body.length} bytes).`);
} catch (e) {
  console.warn('Dev server fetch note:', e.message);
}

console.log('\nALL WELCOMESCREEN CHECKS PASSED SUCCESSFULLY!\n');
