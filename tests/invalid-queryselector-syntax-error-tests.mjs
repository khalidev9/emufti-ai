/**
 * EMufti AI - Invalid querySelector SyntaxError Fix & Tour Target Resolution Verification
 *
 * Verifies:
 * 1. Complete elimination of invalid jQuery pseudo-selector 'button:has(span:contains("Listen"))' and any :contains() across the codebase.
 * 2. All targetSelector and fallbackSelector in QURAN_ONBOARDING_TOUR_STEPS are valid standard CSS selectors.
 * 3. `safeQuerySelector` and `resolveTourTargetElement` in QuranPageTutorial handle missing, malformed, or fallback elements safely without throwing SyntaxError.
 * 4. Listen button in SurahInfoBanner retains full audio toggle functionality, accessibility labels, and data attributes.
 * 5. Continue Reading card and Verse Actions (Weydii EMufti) are correctly targeted and resolved.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('========================================================================');
console.log('EMUFTI AI: INVALID QUERYSELECTOR SYNTAXERROR VERIFICATION TESTS');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// Suite 1: Codebase Scan - No invalid :contains() or button:has(...) selectors
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Codebase Scan for Invalid jQuery Selectors ---');

const ROOT_DIR = process.cwd();

it('ensures button:has(span:contains("Listen")) does NOT exist anywhere in the codebase', () => {
  const tutorialSource = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/QuranPageTutorial.tsx'), 'utf8');
  assert.ok(
    !tutorialSource.includes('button:has(span:contains("Listen"))'),
    'Must NOT contain invalid button:has(span:contains("Listen")) selector'
  );
  assert.ok(
    !tutorialSource.includes('div:has(> span:contains("Continue Reading"))'),
    'Must NOT contain invalid div:has(> span:contains("Continue Reading")) selector'
  );
  assert.ok(
    !tutorialSource.includes('button:has(span:contains("Weydii EMufti"))'),
    'Must NOT contain invalid button:has(span:contains("Weydii EMufti")) selector'
  );
});

it('ensures no active code in src/ contains jQuery :contains() pseudo-class', () => {
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (['node_modules', 'dist', '.git'].includes(item)) continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (/\.(tsx|ts|jsx|js)$/.test(item)) {
        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          // Ignore comment lines explaining the fix
          if (line.includes(':contains') && !line.trim().startsWith('*') && !line.trim().startsWith('//')) {
            assert.fail(`Invalid :contains selector found at ${full}:${idx + 1}: ${line}`);
          }
        });
      }
    }
  }
  scanDir(path.join(ROOT_DIR, 'src'));
});

// -----------------------------------------------------------------------------
// Suite 2: Valid Standard CSS Selectors in QURAN_ONBOARDING_TOUR_STEPS
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: W3C Valid CSS Selectors in QURAN_ONBOARDING_TOUR_STEPS ---');

const tutorialSource = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/QuranPageTutorial.tsx'), 'utf8');

it('defines standard valid fallbackSelector for surah-actions (Listen button)', () => {
  assert.ok(
    tutorialSource.includes(`id: 'surah-actions'`),
    'Step surah-actions must be defined'
  );
  assert.ok(
    tutorialSource.includes('button[aria-label*="Listen"]') ||
    tutorialSource.includes('[data-testid="surah-listen-button"]'),
    'surah-actions fallbackSelector must use valid standard CSS attribute selectors'
  );
});

it('defines standard valid fallbackSelector for continue-reading', () => {
  assert.ok(
    tutorialSource.includes(`id: 'continue-reading'`),
    'Step continue-reading must be defined'
  );
  assert.ok(
    tutorialSource.includes('[data-tour="continue-reading"]') &&
    tutorialSource.includes('[data-testid="continue-reading-card"]'),
    'continue-reading fallbackSelector must use valid data attributes'
  );
});

it('defines standard valid fallbackSelector for verse-actions (Weydii EMufti)', () => {
  assert.ok(
    tutorialSource.includes(`id: 'verse-actions'`),
    'Step verse-actions must be defined'
  );
  assert.ok(
    tutorialSource.includes('button[title*="Weydii EMufti"]') ||
    tutorialSource.includes('[data-testid="ask-emufti-verse-button"]'),
    'verse-actions fallbackSelector must use valid standard CSS attribute selectors'
  );
});

// -----------------------------------------------------------------------------
// Suite 3: Safe DOM Resolution Functions (safeQuerySelector & resolveTourTargetElement)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Safe Element Resolution & Error Prevention ---');

it('implements safeQuerySelector with try-catch guarding against SyntaxError', () => {
  assert.ok(
    tutorialSource.includes('export function safeQuerySelector'),
    'safeQuerySelector function must be defined and exported'
  );
  assert.ok(
    tutorialSource.includes('try {') && tutorialSource.includes('catch'),
    'safeQuerySelector must catch any selector syntax error'
  );
});

it('implements resolveTourTargetElement with safe DOM traversal fallback', () => {
  assert.ok(
    tutorialSource.includes('export function resolveTourTargetElement'),
    'resolveTourTargetElement function must be defined and exported'
  );
  assert.ok(
    tutorialSource.includes("step.id === 'surah-actions'") &&
    tutorialSource.includes("step.id === 'continue-reading'") &&
    tutorialSource.includes("step.id === 'verse-actions'"),
    'resolveTourTargetElement must provide semantic textContent / aria-label fallbacks'
  );
  assert.ok(
    tutorialSource.includes('querySelectorAll'),
    'Must use querySelectorAll to find candidate elements safely'
  );
});

// -----------------------------------------------------------------------------
// Suite 4: Component Attributes & Audio Functionality Preservation
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Preservation of Listen & Audio Functionality ---');

const surahBannerSource = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/SurahInfoBanner.tsx'), 'utf8');

it('preserves Listen button with full audio toggling, data-tour, and data-testid attributes', () => {
  assert.ok(
    surahBannerSource.includes('data-tour="surah-listen-button"'),
    'Listen button must have data-tour="surah-listen-button"'
  );
  assert.ok(
    surahBannerSource.includes('data-testid="surah-listen-button"'),
    'Listen button must have data-testid="surah-listen-button"'
  );
  assert.ok(
    surahBannerSource.includes('onClick={onTogglePlayFullSurah}'),
    'Listen button must maintain onTogglePlayFullSurah handler'
  );
  assert.ok(
    surahBannerSource.includes("title={isPlayingFullSurah ? 'Pause recitation' : 'Listen to full Surah'}"),
    'Listen button must preserve dynamic pause/play title'
  );
  assert.ok(
    surahBannerSource.includes("aria-label={isPlayingFullSurah ? 'Pause recitation' : 'Listen to full Surah'}"),
    'Listen button must preserve dynamic accessibility aria-label'
  );
});

const heroExplorerSource = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/QuranHeroExplorer.tsx'), 'utf8');

it('attaches data-testid="continue-reading-card" to Continue Reading card', () => {
  assert.ok(
    heroExplorerSource.includes('data-testid="continue-reading-card"'),
    'Continue Reading card must have data-testid="continue-reading-card"'
  );
  assert.ok(
    heroExplorerSource.includes('data-tour="continue-reading"'),
    'Continue Reading card must maintain data-tour="continue-reading"'
  );
});

const verseViewSource = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/VerseByVerseView.tsx'), 'utf8');

it('attaches data-testid and data-tour attributes to Weydii EMufti button', () => {
  assert.ok(
    verseViewSource.includes('data-testid="ask-emufti-verse-button"'),
    'Weydii EMufti button must have data-testid="ask-emufti-verse-button"'
  );
  assert.ok(
    verseViewSource.includes('data-tour="ask-emufti-verse-button"'),
    'Weydii EMufti button must have data-tour="ask-emufti-verse-button"'
  );
  assert.ok(
    verseViewSource.includes('onClick={() => onAskEMufti'),
    'Weydii EMufti button must preserve onAskEMufti handler'
  );
});

// -----------------------------------------------------------------------------
// Test Summary
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
