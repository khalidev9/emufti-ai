/**
 * EMufti AI - Universal Sticky & Fixed Layout Fix for Left Navigation Drawer Tests
 *
 * Verifies the CSS layout of the entire navigation drawer across Desktop and Mobile:
 * 1. Desktop Viewport (>= 768px):
 *    - position: sticky; top: 4rem; height: calc(100vh - 4rem); (and fixed left-0 top-16 bottom-0 z-40)
 *    - display: flex; flex-direction: column; overflow: hidden;
 *    - Inner list independently scrollable: flex-1 overflow-y-auto overscroll-contain
 * 2. Mobile Viewport (< 768px):
 *    - fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden
 *    - Occupies 100% vertical space without middle-screen breaks
 *    - Smooth selection and escape dismissal
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT_DIR = process.cwd();

console.log('==================================================================');
console.log('   EMufti AI - Universal Left Navigation Drawer Layout Tests      ');
console.log('==================================================================\n');

const drawerPath = path.join(ROOT_DIR, 'src/components/quran/QuranLeftNavDrawer.tsx');
assert.ok(fs.existsSync(drawerPath), 'QuranLeftNavDrawer.tsx must exist');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

const quranPagePath = path.join(ROOT_DIR, 'src/pages/QuranPage.tsx');
assert.ok(fs.existsSync(quranPagePath), 'QuranPage.tsx must exist');
const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');

// -----------------------------------------------------------------------------
// SECTION 1: DESKTOP VIEWPORT (>= 768px) STICKY & FIXED SPECIFICATIONS
// -----------------------------------------------------------------------------
console.log('Section 1: Desktop Viewport (>= 768px) Layout & Positioning');

// Sticky positioning and height: position: sticky; top: 4rem; height: calc(100vh - 4rem);
assert.ok(
  drawerContent.includes("position: 'sticky'") &&
    drawerContent.includes("top: '4rem'") &&
    drawerContent.includes("height: 'calc(100vh - 4rem)'"),
  'Desktop aside element must specify position: sticky; top: 4rem; height: calc(100vh - 4rem);'
);
console.log('  ✓ Desktop sticky positioning (top: 4rem, height: calc(100vh - 4rem)) verified');

// Fixed fallback support: fixed left-0 top-16 bottom-0 z-40
assert.ok(
  drawerContent.includes('fixed left-0 top-16 bottom-0 z-40'),
  'Desktop layout must support fixed fallback: fixed left-0 top-16 bottom-0 z-40'
);
console.log('  ✓ Desktop fixed fallback layout class (fixed left-0 top-16 bottom-0 z-40) verified');

// Container flex & overflow: display: flex; flex-direction: column; overflow: hidden;
assert.ok(
  drawerContent.includes("display: 'flex'") &&
    drawerContent.includes("flexDirection: 'column'") &&
    drawerContent.includes("overflow: 'hidden'"),
  'Desktop drawer container must have display: flex; flex-direction: column; overflow: hidden;'
);
assert.ok(
  drawerContent.includes('flex-col overflow-hidden'),
  'Desktop drawer must include Tailwind classes flex-col overflow-hidden'
);
console.log('  ✓ Main container display: flex, flex-direction: column, overflow: hidden verified');

// Inner scrollable list: flex-1 overflow-y-auto overscroll-contain
assert.ok(
  drawerContent.includes('flex-1 overflow-y-auto overscroll-contain'),
  'Inner list container must have flex-1 overflow-y-auto overscroll-contain for independent scrolling'
);
console.log('  ✓ Inner list independently scrollable with overscroll-contain verified');

// -----------------------------------------------------------------------------
// SECTION 2: MOBILE VIEWPORT (< 768px) SLIDING OVERLAY SPECIFICATIONS
// -----------------------------------------------------------------------------
console.log('\nSection 2: Mobile Viewport (< 768px) Full-Screen / Sliding Overlay');

// Mobile overlay exact class string:
// fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden
assert.ok(
  drawerContent.includes('fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden'),
  'Mobile drawer overlay must match exact class: fixed inset-x-0 top-16 bottom-16 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden'
);
console.log('  ✓ Mobile fixed overlay strictly between top header (top-16) and bottom nav (bottom-16) verified');

// Occupies 100% available vertical space without middle-screen breaks
assert.ok(
  drawerContent.includes('h-full') && drawerContent.includes('min-h-0'),
  'Mobile list container utilizes 100% vertical space with min-h-0 to avoid overflow breaks'
);
console.log('  ✓ Full vertical space utilization (no middle-screen breaks) verified');

// Auto-closing on mobile selection
assert.ok(
  drawerContent.includes('handleItemSelect') && drawerContent.includes('window.innerWidth < 768'),
  'Selecting items on mobile automatically closes the drawer'
);
console.log('  ✓ Mobile item selection auto-dismiss verified');

// Escape key dismissal
assert.ok(
  drawerContent.includes("e.key === 'Escape'") && drawerContent.includes('onClose()'),
  'Pressing Escape closes the navigation drawer'
);
console.log('  ✓ Escape key dismissal listener verified');

// -----------------------------------------------------------------------------
// SECTION 3: INTEGRATION IN QURANPAGE & SUB-HEADER TOGGLE
// -----------------------------------------------------------------------------
console.log('\nSection 3: Integration in QuranPage Component Tree');

assert.ok(
  quranPageContent.includes('<QuranLeftNavDrawer'),
  'QuranLeftNavDrawer is mounted in QuranPage'
);
assert.ok(
  quranPageContent.includes('isOpen={isLeftDrawerOpen}'),
  'QuranLeftNavDrawer is controlled by isLeftDrawerOpen state'
);
assert.ok(
  quranPageContent.includes('setIsLeftDrawerOpen(!isLeftDrawerOpen)'),
  'Surah selector button toggles isLeftDrawerOpen'
);
assert.ok(
  quranPageContent.includes('flex-1 flex max-w-7xl w-full mx-auto relative items-start') &&
    quranPageContent.includes('min-h-screen'),
  'Parent container uses flex layout with min-h-screen so drawer and main content sit side-by-side without colliding'
);
assert.ok(
  drawerContent.includes('sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-30'),
  'Dedicated sticky sidebar specifies sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-30'
);
assert.ok(
  quranPageContent.includes("display: 'flex'") &&
    quranPageContent.includes("flexDirection: 'row'") &&
    quranPageContent.includes("alignItems: 'flex-start'") &&
    quranPageContent.includes("minHeight: '100vh'") &&
    quranPageContent.includes("width: '100%'") &&
    quranPageContent.includes("position: 'relative'"),
  'Parent container strictly specifies display: flex, flexDirection: row, alignItems: flex-start, minHeight: 100vh, width: 100%, position: relative'
);
assert.ok(
  drawerContent.includes("maxHeight: 'calc(100vh - 4rem)'") &&
    drawerContent.includes("flexShrink: 0"),
  'Desktop drawer specifies maxHeight: calc(100vh - 4rem) and flexShrink: 0'
);
assert.ok(
  drawerContent.includes("flex: '1 1 0%'") &&
    drawerContent.includes("overscrollBehavior: 'contain'"),
  'Inner list container specifies flex: 1 1 0% and overscrollBehavior: contain'
);
console.log('  ✓ QuranPage integration, flex min-h-screen container, and dedicated sticky sidebar verified');

// -----------------------------------------------------------------------------
// SECTION 4: CONTAINER HIERARCHY & ZERO CONFLICTING OVERFLOW
// -----------------------------------------------------------------------------
console.log('\nSection 4: Container Hierarchy & Overflow Validation');

const indexCssPath = path.join(ROOT_DIR, 'src/index.css');
assert.ok(fs.existsSync(indexCssPath), 'src/index.css must exist');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

assert.ok(
  !indexCssContent.includes('overflow-x: hidden') && !indexCssContent.includes('overflow: hidden;'),
  'html and body in index.css must not have overflow-x: hidden or overflow: hidden to avoid breaking sticky sidebar'
);
assert.ok(
  indexCssContent.includes('overflow-x: visible;') && indexCssContent.includes('overflow: visible;'),
  'html and body in index.css specify overflow-x: visible; overflow: visible;'
);
console.log('  ✓ html and body overflow: visible verified without sticky-breaking clipping');

assert.ok(
  quranPageContent.includes("overflow: 'visible'") && quranPageContent.includes('overflow-visible'),
  'QuranPage main containers explicitly specify overflow: visible and overflow-visible'
);
console.log('  ✓ QuranPage main containers overflow: visible verified');

console.log('\n==================================================================');
console.log('All 15 / 15 Navigation Drawer Layout Tests Passed Successfully!');
console.log('==================================================================\n');
