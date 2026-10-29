/**
 * Verification Test Suite for:
 * 1. Profile Subscription Badge Overlap Fix (AuxiliaryPages.tsx)
 * 2. Settings Navigation Tabs Horizontal Overflow Fix (SettingsPage.tsx, index.css)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('EMUFTI AI: Mobile Profile Badge Overlap & Settings Navigation Tabs Verification', () => {

  describe('1. Profile Subscription Badge Mobile Layout (AuxiliaryPages.tsx)', () => {
    const auxPagesPath = path.join(ROOT_DIR, 'src', 'pages', 'AuxiliaryPages.tsx');

    it('1.1 AuxiliaryPages.tsx exists on disk', () => {
      assert.ok(fs.existsSync(auxPagesPath), 'AuxiliaryPages.tsx must exist');
    });

    it('1.2 Seeker Profile subscription card arranges tier title and status badge with responsive flex layout', () => {
      const content = fs.readFileSync(auxPagesPath, 'utf8');

      // Must have the responsive flex layout preventing overlap on mobile
      assert.ok(
        content.includes('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-1') ||
        content.includes('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'),
        'Must arrange tier title and badge using responsive flex-col on mobile and sm:flex-row on desktop'
      );

      // Status badge must be prevented from shrinking or clipping into text
      assert.ok(
        content.includes('self-start sm:self-auto shrink-0'),
        'Status badge must have shrink-0 and self-start sm:self-auto for clean mobile alignment'
      );
    });

    it('1.3 Current Study Tier card in Billing section also applies clean non-overlapping responsive layout', () => {
      const content = fs.readFileSync(auxPagesPath, 'utf8');

      assert.ok(
        content.includes('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5'),
        'Study tier card in billing section must also use flex-col on mobile to prevent badge overlap'
      );
    });
  });

  describe('2. Settings Navigation Tabs Horizontal Overflow Fix (SettingsPage.tsx & index.css)', () => {
    const settingsPagePath = path.join(ROOT_DIR, 'src', 'pages', 'SettingsPage.tsx');
    const indexCssPath = path.join(ROOT_DIR, 'src', 'index.css');

    it('2.1 SettingsPage.tsx wraps mobile tabs in a strict boundary-constrained container', () => {
      const content = fs.readFileSync(settingsPagePath, 'utf8');

      assert.ok(
        content.includes('md:hidden w-full max-w-full min-w-0 space-y-2.5 overflow-hidden'),
        'Mobile navigation container must enforce w-full max-w-full min-w-0 overflow-hidden'
      );
    });

    it('2.2 Settings sub-navigation tabs are wrapped inside a horizontally scrollable container with no-scrollbar', () => {
      const content = fs.readFileSync(settingsPagePath, 'utf8');

      assert.ok(
        content.includes('w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border') ||
        content.includes('w-full max-w-full overflow-x-auto no-scrollbar flex items-center gap-2 px-4 py-2 box-border flex-shrink-0') ||
        content.includes('flex overflow-x-auto whitespace-nowrap gap-2 px-4 py-2 w-full no-scrollbar') ||
        content.includes('flex overflow-x-auto no-scrollbar gap-2 py-1 px-1 whitespace-nowrap w-full'),
        'Settings tab pills must use w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border'
      );

      // Must not use negative margins that break viewport boundary on mobile
      assert.ok(
        !content.includes('touch-pan-x -mx-3 px-3'),
        'Must not use negative horizontal margins (-mx-3) that cause mobile layout overflow'
      );
    });

    it('2.3 index.css defines .no-scrollbar utility hiding scrollbars across all browsers while preserving swipe', () => {
      const css = fs.readFileSync(indexCssPath, 'utf8');

      assert.ok(css.includes('.no-scrollbar::-webkit-scrollbar'), 'Must hide webkit scrollbar');
      assert.ok(css.includes('.no-scrollbar'), 'Must declare .no-scrollbar rule');
      assert.ok(css.includes('scrollbar-width: none'), 'Must set scrollbar-width: none for Firefox');
    });
  });

});
