import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('EMufti AI: Comprehensive Footer, "About" Section, & Legal Pages Modernization', () => {

  describe('1. Comprehensive Footer & "About" Section Component', () => {
    const footerPath = path.join(projectRoot, 'src', 'components', 'layout', 'Footer.tsx');
    assert.ok(fs.existsSync(footerPath), 'Footer.tsx component must exist');
    const footerContent = fs.readFileSync(footerPath, 'utf8');

    it('1.1 Renders brand header with Logo and Islamic AI identity', () => {
      assert.ok(footerContent.includes('<Logo'), 'Includes Logo component');
      assert.ok(footerContent.includes('EMufti AI'), 'Displays platform name EMufti AI');
      assert.ok(footerContent.includes('Barashada &amp; Faafinta Cilmiga Diinta ee Sugan') || footerContent.includes('Barashada & Faafinta Cilmiga Diinta'), 'Displays Islamic knowledge subtitle');
    });

    it('1.2 Includes dedicated "About" (Ku Saabsan) section rooted in scripture and classical tradition', () => {
      assert.ok(footerContent.includes('Ku Saabsan EMufti AI / About Us'), 'Has About Us header');
      assert.ok(footerContent.includes('Kitaabka Qur\'aanka Kariimka'), 'Mentions Holy Quran scripture');
      assert.ok(footerContent.includes('Sunnada Nabiga (NNKH)'), 'Mentions prophetic Sunnah');
      assert.ok(footerContent.includes('afarta mad-habadood (Xanafi, Maaliki, Shaafici, iyo Xanbali)'), 'Mentions the 4 recognized schools of jurisprudence');
    });

    it('1.3 Highlights core authentic Islamic heritage & security badges', () => {
      assert.ok(footerContent.includes("Qur'aan &amp; Sunnah") || footerContent.includes("Qur'aan & Sunnah"), 'Has Quran & Sunnah badge');
      assert.ok(footerContent.includes('Afarta Mad-habadood'), 'Has 4 Madhabs badge');
      assert.ok(footerContent.includes('Amni &amp; Qarsanaanta Xogta') || footerContent.includes('Amni & Qarsanaanta Xogta'), 'Has Privacy badge');
    });

    it('1.4 Provides categorized navigation links to all key platform capabilities', () => {
      assert.ok(footerContent.includes('to="/quran"'), 'Links to Quran Mushaf');
      assert.ok(footerContent.includes('to="/quran?tab=50qaris"'), 'Links to 50+ Reciters');
      assert.ok(footerContent.includes('to="/quran?tab=subcis"'), 'Links to Subcis');
      assert.ok(footerContent.includes('to="/khitma"'), 'Links to Khatma Challenge');
      assert.ok(footerContent.includes('to="/quiz"'), 'Links to Quiz & Competition');
      assert.ok(footerContent.includes('to="/features"'), 'Links to Features');
      assert.ok(footerContent.includes('to="/pricing"'), 'Links to Pricing');
    });

    it('1.5 Provides legal and verification links', () => {
      assert.ok(footerContent.includes('to="/privacy"'), 'Links to Privacy Policy');
      assert.ok(footerContent.includes('to="/terms"'), 'Links to Terms of Service');
      assert.ok(footerContent.includes('to="/verify-certificate"'), 'Links to Certificate Verification');
      assert.ok(footerContent.includes('to="/track"'), 'Links to Request Tracking');
      assert.ok(footerContent.includes('to="/help"'), 'Links to Help Center');
    });

    it('1.6 Integrates verified WhatsApp support contact card and helpline', () => {
      assert.ok(footerContent.includes('OFFICIAL_WHATSAPP_LINK'), 'Uses official WhatsApp direct link');
      assert.ok(footerContent.includes('OFFICIAL_WHATSAPP_NUMBER'), 'Displays official WhatsApp number (+974 6678 2031)');
      assert.ok(footerContent.includes('WhatsApp Support'), 'Displays WhatsApp Support title');
    });

    it('1.7 Renders Islamic educational non-fatwa disclaimer and copyright statement', () => {
      assert.ok(footerContent.includes('Digniin Diineed (Islamic Educational Disclaimer)'), 'Includes educational disclaimer');
      assert.ok(footerContent.includes('EMufti AI Platform') && footerContent.includes('All rights reserved'), 'Includes full copyright');
    });
  });

  describe('2. Modernized Privacy Policy (Siyaasadda Khaaska ah)', () => {
    const auxPath = path.join(projectRoot, 'src', 'pages', 'AuxiliaryPages.tsx');
    const auxContent = fs.readFileSync(auxPath, 'utf8');

    it('2.1 Features modern responsive white-and-blue hero layout with breadcrumbs', () => {
      assert.ok(auxContent.includes('Back to EMufti AI'), 'Includes back breadcrumb');
      assert.ok(auxContent.includes('Siyaasadda Khaaska ah (Privacy Policy)') || auxContent.includes('Privacy Policy'), 'Displays Privacy Policy header');
      assert.ok(auxContent.includes('Effective: October 2026'), 'Preserves effective date');
      assert.ok(auxContent.includes('PostgreSQL RLS Protected'), 'Displays RLS security badge');
    });

    it('2.2 Renders executive summary takeaways and quick jump navigation', () => {
      assert.ok(auxContent.includes('Qarsanaan Diineed'), 'Highlights religious confidentiality');
      assert.ok(auxContent.includes('RLS Data Isolation'), 'Highlights data isolation');
      assert.ok(auxContent.includes('href="#section-1"'), 'Has quick jump navigation anchors');
    });

    it('2.3 Preserves all 6 formal policy sections with full security specifications', () => {
      assert.ok(auxContent.includes('1. Commitment to User Privacy &amp; Religious Confidentiality') || auxContent.includes('1. Commitment to User Privacy & Religious Confidentiality'), 'Section 1 present');
      assert.ok(auxContent.includes('2. Data We Collect'), 'Section 2 present');
      assert.ok(auxContent.includes('avatars/&#123;user_id&#125;/') || auxContent.includes('avatars/{user_id}/'), 'Profile photo storage path preserved');
      assert.ok(auxContent.includes('3. How Information Is Processed &amp; Third-Party Services') || auxContent.includes('3. How Information Is Processed & Third-Party Services'), 'Section 3 present');
      assert.ok(auxContent.includes('AI-Powered Islamic Educational Responses'), 'AI responses section present');
      assert.ok(auxContent.includes('4. Security Safeguards &amp; Access Controls') || auxContent.includes('4. Security Safeguards & Access Controls'), 'Section 4 present');
      assert.ok(auxContent.includes('5. User Rights, Data Management &amp; Deletion') || auxContent.includes('5. User Rights, Data Management & Deletion'), 'Section 5 present');
      assert.ok(auxContent.includes('6. Contact for Privacy Inquiries'), 'Section 6 present');
    });

    it('2.4 Embeds comprehensive Footer in PrivacyPage', () => {
      const privacyMatch = auxContent.match(/export const PrivacyPage: React\.FC = \(\) => \{([\s\S]*?)\n\};/);
      assert.ok(privacyMatch, 'PrivacyPage must be defined');
      assert.ok(privacyMatch[1].includes('<Footer />'), 'PrivacyPage embeds Footer component');
    });
  });

  describe('3. Modernized Terms of Service (Shuruudaha Isticmaalka)', () => {
    const auxPath = path.join(projectRoot, 'src', 'pages', 'AuxiliaryPages.tsx');
    const auxContent = fs.readFileSync(auxPath, 'utf8');

    it('3.1 Features modern responsive hero layout with breadcrumbs and legal metadata', () => {
      assert.ok(auxContent.includes('Shuruudaha Isticmaalka (Terms of Service)') || auxContent.includes('Terms of Service'), 'Displays Terms header');
      assert.ok(auxContent.includes('Grounded in Scripture'), 'Displays scripture grounding badge');
    });

    it('3.2 Features high-visibility Islamic Educational Purpose & Non-Fatwa Disclaimer', () => {
      assert.ok(auxContent.includes('2. Islamic Educational Purpose &amp; Non-Fatwa Disclaimer') || auxContent.includes('2. Islamic Educational Purpose & Non-Fatwa Disclaimer'), 'Section 2 present');
      assert.ok(auxContent.includes('AI-generated responses do not constitute formal, legally binding religious verdicts (fatwas)'), 'Clear non-fatwa limitation');
      assert.ok(auxContent.includes('Hanafi, Maliki, Shafi\'i, and Hanbali') || auxContent.includes('Hanafi, Maliki, Shafi&apos;i, and Hanbali'), 'Mentions 4 jurisprudence schools');
    });

    it('3.3 Displays structured learning plan quotas and expiration safeguards', () => {
      assert.ok(auxContent.includes('4. Learning Plans, Quotas &amp; Expiration Rules') || auxContent.includes('4. Learning Plans, Quotas & Expiration Rules'), 'Section 4 present');
      assert.ok(auxContent.includes('Free Tier:'), 'Free tier rules present');
      assert.ok(auxContent.includes('Talib (Pro) Plan:'), 'Talib plan rules present');
      assert.ok(auxContent.includes('Alim (Premium) Plan:'), 'Alim plan rules present');
      assert.ok(auxContent.includes('Users cannot be downgraded to the Free tier while an authorized paid subscription remains active'), 'Downgrade protection rule preserved');
    });

    it('3.4 Preserves all 7 terms sections and embeds comprehensive Footer in TermsPage', () => {
      const termsMatch = auxContent.match(/export const TermsPage: React\.FC = \(\) => \{([\s\S]*?)\n\};/);
      assert.ok(termsMatch, 'TermsPage must be defined');
      assert.ok(termsMatch[1].includes('<Footer />'), 'TermsPage embeds Footer component');
      assert.ok(auxContent.includes('1. Acceptance of Terms'), 'Section 1 present');
      assert.ok(auxContent.includes('3. User Accounts &amp; Security Protections') || auxContent.includes('3. User Accounts & Security Protections'), 'Section 3 present');
      assert.ok(auxContent.includes('5. Plan Requests &amp; Promotional Offers') || auxContent.includes('5. Plan Requests & Promotional Offers'), 'Section 5 present');
      assert.ok(auxContent.includes('6. Intellectual Property &amp; Acceptable Conduct') || auxContent.includes('6. Intellectual Property & Acceptable Conduct'), 'Section 6 present');
      assert.ok(auxContent.includes('7. Support &amp; Dispute Inquiries'), 'Section 7 present');
    });
  });

  describe('4. Global Footer Integration Across Main Pages', () => {
    const pages = [
      { name: 'LandingPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'LandingPage.tsx') },
      { name: 'FeaturesPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'FeaturesPage.tsx') },
      { name: 'PricingPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'PricingPage.tsx') },
      { name: 'HelpCenterPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'HelpCenterPage.tsx') },
      { name: 'CertificateVerificationPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'CertificateVerificationPage.tsx') },
      { name: 'KhitmaPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'KhitmaPage.tsx') },
      { name: 'QuizPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'QuizPage.tsx') },
      { name: 'TrackRequestPage.tsx', path: path.join(projectRoot, 'src', 'pages', 'TrackRequestPage.tsx') },
    ];

    pages.forEach(({ name, path: p }) => {
      it(`4.${pages.indexOf(name) + 1} ${name} integrates <Footer />`, () => {
        assert.ok(fs.existsSync(p), `${name} exists`);
        const content = fs.readFileSync(p, 'utf8');
        assert.ok(content.includes('<Footer') || content.includes('<Footer />'), `${name} renders <Footer />`);
      });
    });
  });
});
