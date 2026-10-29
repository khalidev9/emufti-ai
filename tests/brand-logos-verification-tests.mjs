/**
 * Verification Test Suite for Brand Logo Separation:
 * 1. Frontend & Chatbot Logo: media_1792725867549_ce4dfa1b.png -> public/logo-frontend.png
 * 2. Quran Page Only Logo: media_1792725883547_6408a620.png -> public/logo-quran.png
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('EMUFTI AI: Brand Logo Separation Verification', () => {

  describe('1. Static Logo Assets in public/', () => {
    const frontendLogoPath = path.join(ROOT_DIR, 'public', 'logo-frontend.png');
    const quranLogoPath = path.join(ROOT_DIR, 'public', 'logo-quran.png');
    const defaultLogoPath = path.join(ROOT_DIR, 'public', 'logo.png');

    it('1.1 Frontend logo asset exists and is non-empty', () => {
      assert.ok(fs.existsSync(frontendLogoPath), 'public/logo-frontend.png must exist');
      const stats = fs.statSync(frontendLogoPath);
      assert.ok(stats.size > 10000, 'Frontend logo must be a valid image file');
    });

    it('1.2 Quran page logo asset exists and is non-empty', () => {
      assert.ok(fs.existsSync(quranLogoPath), 'public/logo-quran.png must exist');
      const stats = fs.statSync(quranLogoPath);
      assert.ok(stats.size > 10000, 'Quran logo must be a valid image file');
    });

    it('1.3 Default public/logo.png is synchronized with the new frontend branding', () => {
      assert.ok(fs.existsSync(defaultLogoPath), 'public/logo.png must exist');
      const stats = fs.statSync(defaultLogoPath);
      assert.ok(stats.size > 10000, 'Default logo must be a valid image file');
    });
  });

  describe('2. Common Logo Component (src/components/common/Logo.tsx)', () => {
    const logoCompPath = path.join(ROOT_DIR, 'src', 'components', 'common', 'Logo.tsx');

    it('2.1 Logo component supports variant prop: frontend and quran', () => {
      assert.ok(fs.existsSync(logoCompPath), 'Logo.tsx must exist');
      const content = fs.readFileSync(logoCompPath, 'utf8');

      assert.ok(content.includes("variant?: 'frontend' | 'quran'"), 'LogoProps must define variant');
      assert.ok(content.includes('/logo-quran.png'), 'Logo component must support /logo-quran.png');
      assert.ok(content.includes('/logo-frontend.png'), 'Logo component must support /logo-frontend.png');
    });
  });

  describe('3. Frontend & Landing Pages use Frontend Logo', () => {
    const landingPath = path.join(ROOT_DIR, 'src', 'pages', 'LandingPage.tsx');

    it('3.1 LandingPage top navigation renders /logo-frontend.png', () => {
      assert.ok(fs.existsSync(landingPath), 'LandingPage.tsx must exist');
      const content = fs.readFileSync(landingPath, 'utf8');

      assert.ok(content.includes('/logo-frontend.png'), 'Landing page navbar must display /logo-frontend.png');
      assert.ok(!content.includes('/logo-quran.png'), 'Landing page must NOT use Quran logo');
    });

    it('3.2 LandingPage footer renders /logo-frontend.png', () => {
      const content = fs.readFileSync(landingPath, 'utf8');
      const footerIndex = content.indexOf('<footer');
      const footerContent = content.substring(footerIndex);

      assert.ok(footerContent.includes('/logo-frontend.png'), 'Landing page footer must display /logo-frontend.png');
    });
  });

  describe('4. Chatbot Page & Core Layout use Frontend Logo', () => {
    const headerPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Header.tsx');
    const sidebarPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Sidebar.tsx');
    const welcomePath = path.join(ROOT_DIR, 'src', 'components', 'chat', 'WelcomeScreen.tsx');

    it('4.1 Chat Header renders /logo-frontend.png', () => {
      assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
      const content = fs.readFileSync(headerPath, 'utf8');

      assert.ok(content.includes('/logo-frontend.png'), 'Chat header must display /logo-frontend.png');
      assert.ok(!content.includes('/logo-quran.png'), 'Chat header must NOT use Quran logo');
    });

    it('4.2 Sidebar top brand renders /logo-frontend.png', () => {
      assert.ok(fs.existsSync(sidebarPath), 'Sidebar.tsx must exist');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      assert.ok(content.includes('/logo-frontend.png'), 'Sidebar top brand must display /logo-frontend.png');
      assert.ok(!content.includes('/logo-quran.png'), 'Sidebar top brand must NOT use Quran logo');
    });

    it('4.3 WelcomeScreen hero renders /logo-frontend.png', () => {
      assert.ok(fs.existsSync(welcomePath), 'WelcomeScreen.tsx must exist');
      const content = fs.readFileSync(welcomePath, 'utf8');

      assert.ok(content.includes('/logo-frontend.png'), 'WelcomeScreen hero must display /logo-frontend.png');
      assert.ok(!content.includes('/logo-quran.png'), 'WelcomeScreen must NOT use Quran logo');
    });
  });

  describe('5. Quran Page uses Quran Logo Exclusively', () => {
    const quranPagePath = path.join(ROOT_DIR, 'src', 'pages', 'QuranPage.tsx');

    it('5.1 QuranPage top header renders /logo-quran.png', () => {
      assert.ok(fs.existsSync(quranPagePath), 'QuranPage.tsx must exist');
      const content = fs.readFileSync(quranPagePath, 'utf8');

      assert.ok(content.includes('/logo-quran.png'), 'QuranPage header must display /logo-quran.png');
    });

    it('5.2 QuranPage top header does NOT use /logo-frontend.png for its brand', () => {
      const content = fs.readFileSync(quranPagePath, 'utf8');
      const brandHeaderIndex = content.indexOf('data-tour="brand-header"');
      const brandSlice = content.substring(brandHeaderIndex, brandHeaderIndex + 800);

      assert.ok(brandSlice.includes('/logo-quran.png'), 'QuranPage brand slice must use /logo-quran.png');
      assert.ok(!brandSlice.includes('/logo-frontend.png'), 'QuranPage brand slice must NOT use /logo-frontend.png');
    });
  });

});
