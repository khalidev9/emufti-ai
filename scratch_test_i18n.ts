import { SUPPORTED_LANGUAGES, TRANSLATIONS, t } from './src/lib/i18n.ts';
import fs from 'fs';
import path from 'path';

console.log('--- VERIFYING SYSTEM LANGUAGE SETTINGS ---');

// 1. Verify Supported Languages
console.log('1. Checking Supported Languages...');
const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
if (codes.length === 3 && codes.includes('en') && codes.includes('so') && codes.includes('ar')) {
  console.log('  [PASS] Supported languages are exactly en, so, ar:', codes);
} else {
  console.error('  [FAIL] Unexpected supported languages:', codes);
  process.exit(1);
}

// Check native names
SUPPORTED_LANGUAGES.forEach((l) => {
  console.log(`  Language ${l.code}: name="${l.name}", nativeName="${l.nativeName}", dir="${l.dir}"`);
});

// 2. Verify Default Language is English
console.log('\n2. Checking Default Language...');
if (SUPPORTED_LANGUAGES[0].code === 'en') {
  console.log('  [PASS] English is the primary/default supported language.');
} else {
  console.error('  [FAIL] First language is not English:', SUPPORTED_LANGUAGES[0]);
  process.exit(1);
}

// 3. Verify Translation Resolution and Resiliency against Raw Keys
console.log('\n3. Testing Translation Resolution & Aliases...');
const testKeys = [
  'settings.title',
  'settings.language_tab',
  'settings.tab_language',
  'language.system_language',
  'language.selector_label',
  'auth.full_name',
  'auth.preferred_language',
  'help.submit_tab',
  'help.my_requests',
];

for (const lang of ['en', 'so', 'ar'] as SupportedLanguage[]) {
  console.log(`\nTesting translations for lang="${lang}":`);
  for (const key of testKeys) {
    const res = t(key, lang);
    if (!res || res.startsWith('settings.') || res.startsWith('Menusvg')) {
      console.error(`  [FAIL] Key "${key}" in "${lang}" returned raw or empty: "${res}"`);
      process.exit(1);
    }
    console.log(`  [PASS] ${key} -> "${res}"`);
  }
}

// 4. Verify Arabic RTL Configuration
console.log('\n4. Checking Arabic RTL definition...');
const arConfig = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
if (arConfig && arConfig.dir === 'rtl') {
  console.log('  [PASS] Arabic configuration dir is rtl.');
} else {
  console.error('  [FAIL] Arabic configuration dir is not rtl:', arConfig);
  process.exit(1);
}

// 5. Verify CSS preserves LTR for sensitive inputs
console.log('\n5. Checking CSS LTR isolation rules...');
const cssContent = fs.readFileSync(path.resolve('src/index.css'), 'utf8');
if (
  cssContent.includes('[dir="rtl"] input[type="email"]') &&
  cssContent.includes('[dir="rtl"] input[type="tel"]') &&
  cssContent.includes('[dir="rtl"] input[type="url"]')
) {
  console.log('  [PASS] src/index.css includes LTR preservation for email, phone, and url inputs in RTL mode.');
} else {
  console.error('  [FAIL] src/index.css is missing LTR isolation rules for RTL mode.');
  process.exit(1);
}

console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
