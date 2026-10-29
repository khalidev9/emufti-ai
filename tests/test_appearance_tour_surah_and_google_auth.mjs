import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('Comprehensive System Updates: Appearance Sync, Quran Tour, Surah Cards, & Google Auth Fix', () => {

  describe('1. Unified Appearance & Settings Overhaul', () => {
    const themeContextPath = path.join(projectRoot, 'src', 'context', 'ThemeContext.tsx');
    const themeContextContent = fs.readFileSync(themeContextPath, 'utf8');

    it('1.1 ThemeContext implements cross-tab/window storage event synchronization', () => {
      assert.ok(themeContextContent.includes('window.addEventListener(\'storage\''), 'Should listen for storage events');
      assert.ok(themeContextContent.includes('syncFromStorage'), 'Should have syncFromStorage function');
    });

    it('1.2 ThemeContext syncs dark class to both documentElement and body', () => {
      assert.ok(themeContextContent.includes('root.classList.add(\'dark\')'), 'Should add dark class to root');
      assert.ok(themeContextContent.includes('document.body.classList.add(\'dark\')'), 'Should add dark class to body');
      assert.ok(themeContextContent.includes('emufti-theme-change'), 'Should dispatch emufti-theme-change custom event');
    });

    it('1.3 Main application pages have responsive dark/light background classes', () => {
      const pagesToCheck = [
        path.join(projectRoot, 'src', 'pages', 'AuxiliaryPages.tsx'),
        path.join(projectRoot, 'src', 'pages', 'SettingsPage.tsx'),
        path.join(projectRoot, 'src', 'pages', 'SavedPage.tsx'),
        path.join(projectRoot, 'src', 'pages', 'HelpCenterPage.tsx'),
        path.join(projectRoot, 'src', 'pages', 'FeaturesPage.tsx'),
        path.join(projectRoot, 'src', 'pages', 'PricingPage.tsx'),
        path.join(projectRoot, 'src', 'pages', 'DashboardPage.tsx'),
      ];

      pagesToCheck.forEach((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        assert.ok(
          content.includes('dark:bg-slate-950') || content.includes('dark:bg-slate-900') || content.includes('bg-background'),
          `Page ${path.basename(filePath)} should have dark background classes`
        );
      });
    });
  });

  describe('2. Quran Page Guided Tour & Helper Arrows', () => {
    const quranPagePath = path.join(projectRoot, 'src', 'pages', 'QuranPage.tsx');
    const tutorialPath = path.join(projectRoot, 'src', 'components', 'quran', 'QuranPageTutorial.tsx');
    const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');
    const tutorialContent = fs.readFileSync(tutorialPath, 'utf8');

    it('2.1 QuranPage auto-launches tutorial for first-time visitors', () => {
      assert.ok(quranPageContent.includes('hasCompletedTour'), 'Checks tour completion');
      assert.ok(quranPageContent.includes('setIsTutorialOpen(true)'), 'Opens tutorial on first visit');
    });

    it('2.2 QuranPage has persistent Help / Tour button in navigation', () => {
      assert.ok(quranPageContent.includes('Help / Tour'), 'Header contains Help / Tour trigger');
    });

    it('2.3 QuranPageTutorial renders interactive pointing arrow SVG towards active target', () => {
      assert.ok(tutorialContent.includes('Pointer Arrow (Helper Arrow)'), 'Includes interactive pointing helper arrow');
      assert.ok(tutorialContent.includes('<svg') && (tutorialContent.includes('polygon') || tutorialContent.includes('path')), 'Renders SVG arrow pointer');
      assert.ok(tutorialContent.includes('animate-bounce'), 'Includes bounce animation on pointing arrow');
    });
  });

  describe('3. Surah Navigation Card Effects & Modern Animations', () => {
    const leftNavPath = path.join(projectRoot, 'src', 'components', 'quran', 'QuranLeftNavDrawer.tsx');
    const navDrawerPath = path.join(projectRoot, 'src', 'components', 'quran', 'QuranNavigationDrawer.tsx');
    const heroPath = path.join(projectRoot, 'src', 'components', 'quran', 'QuranHeroExplorer.tsx');

    const leftNavContent = fs.readFileSync(leftNavPath, 'utf8');
    const navDrawerContent = fs.readFileSync(navDrawerPath, 'utf8');
    const heroContent = fs.readFileSync(heroPath, 'utf8');

    it('3.1 QuranLeftNavDrawer has hover lift and micro-interactions', () => {
      assert.ok(leftNavContent.includes('hover:-translate-y-0.5'), 'Has hover lift');
      assert.ok(leftNavContent.includes('group-hover:scale-110'), 'Number badge scales on hover');
      assert.ok(leftNavContent.includes('group-hover:scale-105'), 'Arabic text scales on hover');
    });

    it('3.2 QuranNavigationDrawer has hover lift, active scale, and card animations', () => {
      assert.ok(navDrawerContent.includes('hover:-translate-y-0.5'), 'Has hover lift');
      assert.ok(navDrawerContent.includes('group-hover:scale-110'), 'Number badge scales on hover');
      assert.ok(navDrawerContent.includes('group-hover:scale-105'), 'Arabic text scales on hover');
      assert.ok(navDrawerContent.includes('active:scale-[0.98]'), 'Has tactile active press scale');
    });

    it('3.3 QuranHeroExplorer has hover lift and smooth transitions for popular and search cards', () => {
      assert.ok(heroContent.includes('hover:-translate-y-0.5'), 'Popular surah cards lift on hover');
      assert.ok(heroContent.includes('group-hover:scale-110'), 'Popular surah card Arabic text scales');
      assert.ok(heroContent.includes('hover:translate-x-1'), 'Search autocomplete results slide right on hover');
    });
  });

  describe('4. Supabase Google Login Error & Configuration Handling', () => {
    const supabasePath = path.join(projectRoot, 'src', 'lib', 'supabase.ts');
    const authContextPath = path.join(projectRoot, 'src', 'context', 'AuthContext.tsx');
    const authPagesPath = path.join(projectRoot, 'src', 'pages', 'AuthPages.tsx');

    const supabaseContent = fs.readFileSync(supabasePath, 'utf8');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');
    const authPagesContent = fs.readFileSync(authPagesPath, 'utf8');

    it('4.1 Supabase client initializes auth with PKCE flow', () => {
      assert.ok(supabaseContent.includes("flowType: 'pkce'"), 'Uses PKCE flow type for modern browser OAuth');
    });

    it('4.2 AuthContext intercepts unsupported provider / validation_failed errors with actionable message', () => {
      assert.ok(authContextContent.includes('unsupported provider'), 'Detects unsupported provider error');
      assert.ok(authContextContent.includes('Authentication > Providers > Google'), 'Provides clear instructions for Supabase dashboard');
      assert.ok(authContextContent.includes('Email and Password below'), 'Suggests email/password alternative');
    });

    it('4.3 AuthPages displays dedicated warning banner with actionable fallback tips', () => {
      assert.ok(authPagesContent.includes('error.toLowerCase().includes(\'google\')'), 'Detects Google auth error');
      assert.ok(authPagesContent.includes('Waxaad hoos ku geli kartaa Emailkaaga iyo Furahaaga'), 'Displays email fallback hint');
    });
  });
});
