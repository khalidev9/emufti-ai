import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('EMUFTI AI: Seeker Profile Page Redesign Verification', () => {
  const auxPagesPath = path.join(ROOT_DIR, 'src', 'pages', 'AuxiliaryPages.tsx');

  it('1. AuxiliaryPages.tsx exists and is readable', () => {
    assert.ok(fs.existsSync(auxPagesPath), 'AuxiliaryPages.tsx must exist');
  });

  const content = fs.readFileSync(auxPagesPath, 'utf8');

  describe('2. Modern Aesthetic & Card Layouts', () => {
    it('2.1 Uses expansive container max-w-7xl on desktop instead of cramped max-w-xl', () => {
      assert.ok(content.includes('max-w-7xl mx-auto'), 'Must use max-w-7xl container for spacious desktop layout');
    });

    it('2.2 Renders decorative top gradient hero banner with subtle ambient pattern', () => {
      assert.ok(
        content.includes('bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500'),
        'Must render decorative gradient banner'
      );
      assert.ok(
        content.includes('Verified Seeker'),
        'Must display Verified Seeker status chip in hero banner'
      );
    });

    it('2.3 Features overlapping UserAvatar with floating camera upload button and format hints', () => {
      assert.ok(content.includes('-mt-14'), 'Avatar must cleanly overlap hero banner');
      assert.ok(content.includes('Camera className="w-3.5 h-3.5'), 'Camera button must be present');
      assert.ok(content.includes('Supported: JPG, PNG, WebP (Max 5MB)'), 'Must indicate supported photo formats');
    });

    it('2.4 Displays verified account badge and metadata chips (member since, language)', () => {
      assert.ok(content.includes('Verified Account'), 'Must render Verified Account badge');
      assert.ok(content.includes('Member Since'), 'Must render Member Since info chip');
      assert.ok(content.includes('Language'), 'Must render Language info chip');
    });
  });

  describe('3. Subscription Tier & Details Section', () => {
    it('3.1 Displays clear subscription tiers (Alim Premium, Talib Pro, Free Seeker)', () => {
      assert.ok(content.includes('Alim (Premium) Scholar'), 'Must support Alim (Premium) Scholar tier title');
      assert.ok(content.includes('Talib (Pro) Seeker'), 'Must support Talib (Pro) Seeker tier title');
      assert.ok(content.includes('Free Seeker'), 'Must support Free Seeker tier title');
    });

    it('3.2 Preserves responsive non-overlapping layout classes required by existing test suites', () => {
      assert.ok(
        content.includes('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-1'),
        'Must preserve exact responsive flex classes for subscription tier header'
      );
      assert.ok(
        content.includes('self-start sm:self-auto shrink-0'),
        'Must preserve self-start sm:self-auto shrink-0 for status badge'
      );
    });

    it('3.3 Displays subscription ledger: billing interval, activation date, renewal, days remaining', () => {
      assert.ok(content.includes('Billing Interval'), 'Must render Billing Interval');
      assert.ok(content.includes('Activation Date'), 'Must render Activation Date');
      assert.ok(content.includes('Renewal / Expiration'), 'Must render Renewal / Expiration');
      assert.ok(content.includes('Days Remaining'), 'Must render Days Remaining');
    });

    it('3.4 Renders Manage / Upgrade button and 24-hour question quota progress bar', () => {
      assert.ok(content.includes('Manage / Upgrade'), 'Must render Manage / Upgrade action button');
      assert.ok(content.includes('24-Hour Question Quota') || content.includes('Daily Question Allowance'), 'Must render quota header');
      assert.ok(content.includes('formatQuotaReset'), 'Must dynamically calculate quota reset time');
    });
  });

  describe('4. Responsive 12-Column Layout (Desktop & Mobile)', () => {
    it('4.1 Uses responsive 12-column grid layout with balanced desktop & mobile spacing', () => {
      assert.ok(
        content.includes('grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'),
        'Must use 12-column grid layout (grid-cols-1 on mobile, lg:grid-cols-12 on desktop)'
      );
      assert.ok(
        content.includes('lg:col-span-5 xl:col-span-4 space-y-6'),
        'Left column must use lg:col-span-5 xl:col-span-4 for identity and subscription overview'
      );
      assert.ok(
        content.includes('lg:col-span-7 xl:col-span-8 space-y-6'),
        'Right column must use lg:col-span-7 xl:col-span-8 for forms, learning dashboard, and library'
      );
    });

    it('4.2 Preserves Subcis recitation progress card with <Mic /> icon required by existing test suites', () => {
      assert.ok(
        content.includes('<Mic className="w-4 h-4 text-blue-600" />'),
        'Must preserve <Mic className="w-4 h-4 text-blue-600" /> icon in Subcis recitation card'
      );
    });

    it('4.3 Renders Edit Profile Details form, Daily Authentic Ilm card, and Saved Answers section', () => {
      assert.ok(content.includes('Edit Profile Details'), 'Must render Edit Profile Details form');
      assert.ok(content.includes('Daily Authentic Ilm'), 'Must render Daily Authentic Ilm card');
      assert.ok(content.includes('Saved Islamic Answers'), 'Must render Saved Islamic Answers section');
    });
  });
});
