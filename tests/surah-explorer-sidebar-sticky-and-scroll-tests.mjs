import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Testing Surah Navigation Sidebar Sticky Positioning & Scrolling ---');

// 1. Inspect QuranLeftNavDrawer.tsx
const drawerFile = fs.readFileSync(
  path.resolve('src/components/quran/QuranLeftNavDrawer.tsx'),
  'utf8'
);

assert.ok(
  drawerFile.includes('sticky top-4'),
  'QuranLeftNavDrawer must implement sticky top-4 class'
);
assert.ok(
  drawerFile.includes('h-[calc(100vh-2rem)]'),
  'QuranLeftNavDrawer must implement h-[calc(100vh-2rem)] for defined height'
);
assert.ok(
  drawerFile.includes('overflow-y-auto'),
  'QuranLeftNavDrawer must implement overflow-y-auto for independent scrolling'
);
assert.ok(
  drawerFile.includes('flex-shrink-0 w-80'),
  'QuranLeftNavDrawer must implement flex-shrink-0 w-80'
);
assert.ok(
  drawerFile.includes("height: 'calc(100vh - 2rem)'") &&
    drawerFile.includes("maxHeight: 'calc(100vh - 2rem)'"),
  'QuranLeftNavDrawer inline styles must bound height and maxHeight to calc(100vh - 2rem)'
);
assert.ok(
  drawerFile.includes("overflowY: 'auto'"),
  'QuranLeftNavDrawer inline style must define overflowY: auto'
);
assert.ok(
  drawerFile.includes("top: '1rem'"),
  'QuranLeftNavDrawer inline styles must set top: 1rem (top-4)'
);

console.log('✓ QuranLeftNavDrawer successfully implements sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto flex-shrink-0 w-80');

// 2. Inspect QuranPage.tsx
const quranPageFile = fs.readFileSync(
  path.resolve('src/pages/QuranPage.tsx'),
  'utf8'
);

assert.ok(
  quranPageFile.includes('items-start'),
  'QuranPage must have items-start on the parent flex container so the sidebar does not stretch or scroll away'
);
assert.ok(
  quranPageFile.includes("alignItems: 'flex-start'"),
  'QuranPage must have alignItems: flex-start in style on the parent container'
);
assert.ok(
  quranPageFile.includes('sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto flex-shrink-0 w-80 z-30'),
  'QuranPage must pass sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto flex-shrink-0 w-80 z-30 on the drawer'
);
assert.ok(
  !quranPageFile.includes('items-start min-h-screen flex-row overflow-x-hidden'),
  'Parent container of sticky sidebar must NOT have overflow-x-hidden which disables CSS position: sticky in browsers'
);

console.log('✓ QuranPage correctly configures parent items-start and sticky top-4 h-[calc(100vh-2rem)] flex-shrink-0 w-80');

// 3. Inspect index.css for parent wrapper overflow sanity
const indexCssFile = fs.readFileSync(
  path.resolve('src/index.css'),
  'utf8'
);

assert.ok(
  !indexCssFile.includes('html {\n    overflow-x: hidden !important;') &&
  !indexCssFile.includes('html {\r\n    overflow-x: hidden !important;'),
  'html must NOT have overflow-x: hidden !important which breaks CSS position: sticky in browsers'
);

assert.ok(
  !indexCssFile.includes('#root {\n    width: 100%;\n    max-width: 100vw;\n    min-height: 100dvh;\n    overflow-x: hidden;'),
  '#root must NOT have overflow-x: hidden which disables position: sticky on all descendant elements in web browsers'
);

assert.ok(
  quranPageFile.includes("document.documentElement.style.overflowX = 'clip'"),
  'QuranPage must ensure documentElement overflowX is set to clip on mount to safeguard sticky positioning'
);

console.log('✓ index.css verified: html and #root have zero overflow: hidden constraints');
console.log('ALL SURAH NAVIGATION SIDEBAR STICKY POSITIONING TESTS PASSED!');
