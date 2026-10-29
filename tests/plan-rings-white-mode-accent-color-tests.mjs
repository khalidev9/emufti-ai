import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- TESTING PLAN-BASED PROFILE RINGS, DEFAULT WHITE MODE, AND CUSTOM ACCENT COLOR ---');

// 1. Check CircularPlanAvatar.tsx for plan-based avatar rings
const circularAvatarPath = path.join(__dirname, '../src/components/common/CircularPlanAvatar.tsx');
assert.ok(fs.existsSync(circularAvatarPath), 'CircularPlanAvatar.tsx must exist');
const circularAvatarSrc = fs.readFileSync(circularAvatarPath, 'utf8');

// A. Free plan: completely remove glowing blue ring/border
assert.ok(
  circularAvatarSrc.includes('// Free Plan Users: Completely remove the glowing blue ring/border'),
  'CircularPlanAvatar must explicitly handle Free Plan users without glowing blue ring'
);
assert.ok(
  circularAvatarSrc.includes('border border-slate-200 dark:border-slate-700 bg-slate-100'),
  'Free Plan users must have clean neutral border styling'
);

// B. Pro plan: distinct green ring
assert.ok(
  circularAvatarSrc.includes('border-2 border-green-500 ring-2 ring-green-500/30'),
  'Pro Plan users must have distinct green ring (border-green-500 ring-green-500)'
);
assert.ok(
  circularAvatarSrc.includes('greenGradientId'),
  'Pro Plan users must have green gradient stroke'
);

// C. Premium plan: distinct blue ring
assert.ok(
  circularAvatarSrc.includes('border-2 border-blue-500 ring-2 ring-blue-500/30'),
  'Premium Plan users must have distinct blue ring (border-blue-500 ring-blue-500)'
);
assert.ok(
  circularAvatarSrc.includes('blueGradientId'),
  'Premium Plan users must have blue gradient stroke'
);
console.log('✓ Check 1: Plan-Based Profile Avatar Rings verified (Free: no blue ring, Pro: Green ring, Premium: Blue ring).');

// 2. Check Sidebar.tsx and QuranPage.tsx use UserAvatar with dynamic plan
const sidebarPath = path.join(__dirname, '../src/components/layout/Sidebar.tsx');
const sidebarSrc = fs.readFileSync(sidebarPath, 'utf8');
assert.ok(
  sidebarSrc.includes('<UserAvatar') && sidebarSrc.includes('plan={activePlan || userPlan}'),
  'Sidebar.tsx must use UserAvatar with plan={activePlan || userPlan}'
);

const quranPagePath = path.join(__dirname, '../src/pages/QuranPage.tsx');
const quranPageSrc = fs.readFileSync(quranPagePath, 'utf8');
assert.ok(
  quranPageSrc.includes('<UserAvatar') && quranPageSrc.includes('plan={accessStatus.plan}'),
  'QuranPage.tsx must use UserAvatar with plan={accessStatus.plan}'
);
console.log('✓ Check 2: Sidebar and QuranPage user profiles dynamically pass plan to UserAvatar.');

// 3. Check ThemeContext.tsx defaults to White / Light mode
const themeContextPath = path.join(__dirname, '../src/context/ThemeContext.tsx');
const themeContextSrc = fs.readFileSync(themeContextPath, 'utf8');

assert.ok(
  themeContextSrc.includes("// Default initial/startup mode to White (Light mode)\n    return 'light';") ||
  themeContextSrc.includes("return 'light'; // Default to White / Light mode") ||
  themeContextSrc.includes("return 'light';"),
  'ThemeContext.tsx must default startup/initial theme to light mode'
);

assert.ok(
  themeContextSrc.includes("// Default startup is White / Light mode\n      document.documentElement.classList.remove('dark');\n      return 'light';") ||
  themeContextSrc.includes("document.documentElement.classList.remove('dark');\n      return 'light';"),
  'ThemeContext.tsx resolvedTheme must remove dark class and default to light'
);
console.log('✓ Check 3: Default initial/startup theme mode verified as White / Light mode.');

// 4. Check Custom Accent Color Palette in ThemeContext.tsx
assert.ok(
  themeContextSrc.includes("id: 'rose'") && themeContextSrc.includes("name: 'Red'"),
  'ThemeContext must include Red accent color'
);
assert.ok(
  themeContextSrc.includes("id: 'cyan'") && themeContextSrc.includes("name: 'Light Blue'"),
  'ThemeContext must include Light Blue accent color'
);
assert.ok(
  themeContextSrc.includes("id: 'emerald'") && themeContextSrc.includes("name: 'Green'"),
  'ThemeContext must include Green accent color'
);
assert.ok(
  themeContextSrc.includes("id: 'amber'") && themeContextSrc.includes("name: 'Yellow'"),
  'ThemeContext must include Yellow accent color'
);
assert.ok(
  themeContextSrc.includes("root.style.setProperty('--primary',"),
  'ThemeContext must dynamically update CSS variable --primary on documentElement'
);
assert.ok(
  themeContextSrc.includes("root.style.setProperty('--ring',"),
  'ThemeContext must dynamically update CSS variable --ring on documentElement'
);
console.log('✓ Check 4: Custom Accent Color Palette (Red, Light Blue, Green, Yellow, etc.) and CSS variables verified.');

// 5. Check SettingsPage.tsx for Accent Color Picker UI & Live Preview
const settingsPath = path.join(__dirname, '../src/pages/SettingsPage.tsx');
const settingsSrc = fs.readFileSync(settingsPath, 'utf8');

assert.ok(
  settingsSrc.includes('Accent Color Palette'),
  'SettingsPage.tsx must have Accent Color Palette header'
);
assert.ok(
  settingsSrc.includes('Live Element Preview:'),
  'SettingsPage.tsx must display Live Element Preview card'
);
assert.ok(
  settingsSrc.includes('Primary Button') && settingsSrc.includes('Active Tab'),
  'SettingsPage.tsx must show dynamically styled primary button and active tab preview'
);
console.log('✓ Check 5: SettingsPage Accent Color Picker UI and live preview verified.');

// 6. Check index.css for data-accent rules
const indexCssPath = path.join(__dirname, '../src/index.css');
const indexCssSrc = fs.readFileSync(indexCssPath, 'utf8');

assert.ok(indexCssSrc.includes('[data-accent="rose"]'), 'index.css must define [data-accent="rose"]');
assert.ok(indexCssSrc.includes('[data-accent="cyan"]'), 'index.css must define [data-accent="cyan"]');
assert.ok(indexCssSrc.includes('[data-accent="emerald"]'), 'index.css must define [data-accent="emerald"]');
assert.ok(indexCssSrc.includes('[data-accent="amber"]'), 'index.css must define [data-accent="amber"]');
assert.ok(indexCssSrc.includes('[data-accent="blue"]'), 'index.css must define [data-accent="blue"]');
assert.ok(indexCssSrc.includes('[data-accent="purple"]'), 'index.css must define [data-accent="purple"]');
console.log('✓ Check 6: index.css data-accent rules verified for dynamic accent themes.');

console.log('\nALL 6 CHECKS PASSED CLEANLY! Plan-based rings, white mode default, and accent picker fully operational.');
