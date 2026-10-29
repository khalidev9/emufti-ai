import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('Terms ArrowRight Reference Fix, Circled Element Removal & Support Email Update', () => {

  describe('1. ArrowRight Import & Reference Fix in AuxiliaryPages (Terms Page)', () => {
    const auxPath = path.join(projectRoot, 'src', 'pages', 'AuxiliaryPages.tsx');
    const auxContent = fs.readFileSync(auxPath, 'utf8');

    it('1.1 AuxiliaryPages imports ArrowRight from lucide-react', () => {
      const lucideImportMatch = auxContent.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
      assert.ok(lucideImportMatch, 'Must have lucide-react import in AuxiliaryPages');
      const importedIcons = lucideImportMatch[1].split(',').map((s) => s.trim());
      assert.ok(importedIcons.includes('ArrowRight'), 'ArrowRight must be in the import list of lucide-react');
    });

    it('1.2 ArrowRight is used in TermsPage pricing link without reference errors', () => {
      assert.ok(auxContent.includes('<ArrowRight className="w-3.5 h-3.5" />'), 'ArrowRight icon rendered in Terms pricing link');
    });
  });

  describe('2. Support Email Updated to inFo@emuFti.tech', () => {
    const constantsPath = path.join(projectRoot, 'src', 'lib', 'constants.ts');
    const constantsContent = fs.readFileSync(constantsPath, 'utf8');
    const footerPath = path.join(projectRoot, 'src', 'components', 'layout', 'Footer.tsx');
    const footerContent = fs.readFileSync(footerPath, 'utf8');

    it('2.1 OFFICIAL_SUPPORT_EMAIL is set to inFo@emuFti.tech in constants.ts', () => {
      assert.ok(
        constantsContent.includes("export const OFFICIAL_SUPPORT_EMAIL = 'inFo@emuFti.tech';") ||
        constantsContent.includes('export const OFFICIAL_SUPPORT_EMAIL = "inFo@emuFti.tech";'),
        'OFFICIAL_SUPPORT_EMAIL must be inFo@emuFti.tech'
      );
    });

    it('2.2 Footer displays OFFICIAL_SUPPORT_EMAIL', () => {
      assert.ok(footerContent.includes('OFFICIAL_SUPPORT_EMAIL'), 'Footer uses OFFICIAL_SUPPORT_EMAIL constant');
    });
  });

  describe('3. Clean Header & Circled Elements Removal', () => {
    const quranPagePath = path.join(projectRoot, 'src', 'pages', 'QuranPage.tsx');
    const quranPageContent = fs.readFileSync(quranPagePath, 'utf8');
    const quranExplorerPath = path.join(projectRoot, 'src', 'components', 'quran', 'QuranHeroExplorer.tsx');
    const quranExplorerContent = fs.readFileSync(quranExplorerPath, 'utf8');
    const footerPath = path.join(projectRoot, 'src', 'components', 'layout', 'Footer.tsx');
    const footerContent = fs.readFileSync(footerPath, 'utf8');

    it('3.1 Header badge "Qur\'aan Bilaash Ah • Free Quran Access" is removed from QuranPage toolbar', () => {
      assert.ok(
        !quranPageContent.includes("Qur'aan Bilaash Ah • Free Quran Access"),
        'Header toolbar badge should be removed for a clean header'
      );
    });

    it('3.2 Redundant "Islamic AI" badge next to footer logo is removed', () => {
      assert.ok(
        !footerContent.includes('<span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">\n                    Islamic AI\n                  </span>'),
        'Redundant Islamic AI badge in footer logo is removed'
      );
    });

    it('3.3 Calligraphic ayah banner "Qaf. By the glorious Quran" is not rendered in explorer', () => {
      assert.ok(
        !quranExplorerContent.includes('"Qaf. By the glorious Quran."'),
        'Circled Ayah banner is removed from QuranHeroExplorer'
      );
    });
  });
});
