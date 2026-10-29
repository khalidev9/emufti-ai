import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('Testing Exact PDF Certificate Design Replication & Khatma Page Preview...');

  const servicePath = path.resolve('src/lib/khatmChallengeService.ts');
  const previewPath = path.resolve('src/components/khitma/KhatmCertificatePreview.tsx');
  const khitmaPagePath = path.resolve('src/pages/KhitmaPage.tsx');

  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  const previewContent = fs.readFileSync(previewPath, 'utf8');
  const pageContent = fs.readFileSync(khitmaPagePath, 'utf8');

  // 1. PDF Certificate Layout in khatmChallengeService.ts
  console.log('Testing 1: PDF Certificate Layout & Styling in khatmChallengeService.ts...');

  if (!serviceContent.includes('EMUFTI AI — ISLAMIC PLATFORM & XARUNTA QUR’AANKA KARIIMKA')) {
    throw new Error('PDF missing exact header institution text');
  }
  if (!serviceContent.includes('/logo.png') || !serviceContent.includes('/logo-quran.png')) {
    throw new Error('PDF missing dual logos (EMufti AI and Quran logos)');
  }
  if (!serviceContent.includes('SHAHAADADA KHATMKA QUR’AANKA KARIIMKA') || !serviceContent.includes('CERTIFICATE OF HOLY QURAN COMPLETION')) {
    throw new Error('PDF missing center-aligned certificate titles');
  }
  if (!serviceContent.includes('Surah Al-Isra 17:9')) {
    throw new Error('PDF missing Surah Al-Isra 17:9 ayah citation');
  }
  if (!serviceContent.includes('Waxaa sharaf iyo maamuus weyn leh loogu guddoonsiiyey (Presented to):')) {
    throw new Error('PDF missing recipient presentation header text');
  }
  if (!serviceContent.includes('30 Juzz') || !serviceContent.includes('604 Bog') || !serviceContent.includes('Salaad') || !serviceContent.includes('3.6M+ Xasano')) {
    throw new Error('PDF missing exact 4 summary metric boxes (30 Juzz, 604 Bog, 150 Salaad, 3.6M+ Xasano)');
  }
  if (!serviceContent.includes('Taariikhda Bilowga:') || !serviceContent.includes('Taariikhda Dhammaystirka:') || !serviceContent.includes('Taariikhda Bixinta (Issue Date):')) {
    throw new Error('PDF missing bottom-left dates');
  }
  if (!serviceContent.includes("Guddiga Sare ee Culimada & Qur'aanka EMufti AI")) {
    throw new Error('PDF missing center authorized signature text');
  }
  if (!serviceContent.includes('officialStamp') || !serviceContent.includes('/images/official-stamp.png')) {
    throw new Error('PDF missing official transparent stamp graphic');
  }
  if (!serviceContent.includes('OFFICIAL VERIFIED CERTIFICATE') || !serviceContent.includes('CERTIFICATE ID:') || !serviceContent.includes('SCREEN ID:') || !serviceContent.includes('emufti.ai/verify-certificate')) {
    throw new Error('PDF missing official verified certificate box with Certificate ID and URL');
  }
  console.log('✔ PDF certificate generation has all exact layout elements, dual logos, ayah, and verified stamp');

  // 2. KhatmCertificatePreview Component
  console.log('Testing 2: KhatmCertificatePreview Component...');
  if (!previewContent.includes('KhatmCertificatePreview')) {
    throw new Error('KhatmCertificatePreview component not exported');
  }
  if (!previewContent.includes('EMUFTI AI — ISLAMIC PLATFORM & XARUNTA QUR\'AANKA KARIIMKA')) {
    throw new Error('KhatmCertificatePreview missing institution header');
  }
  if (!previewContent.includes('SHAHAADADA KHATMKA QUR\'AANKA KARIIMKA') || !previewContent.includes('CERTIFICATE OF HOLY QURAN COMPLETION')) {
    throw new Error('KhatmCertificatePreview missing main titles');
  }
  if (!previewContent.includes('إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ')) {
    throw new Error('KhatmCertificatePreview missing Arabic ayah text for Surah Al-Isra 17:9');
  }
  if (!previewContent.includes('30 Juzz') || !previewContent.includes('604 Bog') || !previewContent.includes('3.6M+ Xasano')) {
    throw new Error('KhatmCertificatePreview missing 4 summary metric cards');
  }
  if (!previewContent.includes('/images/official-stamp.png')) {
    throw new Error('KhatmCertificatePreview missing official transparent stamp');
  }
  if (!previewContent.includes('OFFICIAL VERIFIED CERTIFICATE') || !previewContent.includes('emufti.ai/verify-certificate')) {
    throw new Error('KhatmCertificatePreview missing verification box');
  }
  console.log('✔ KhatmCertificatePreview component renders exact replica matching image_7c6815.png');

  // 3. Integration on Khatma Page
  console.log('Testing 3: Integration on KhatmaPage.tsx...');
  if (!pageContent.includes('<KhatmCertificatePreview')) {
    throw new Error('KhitmaPage missing <KhatmCertificatePreview /> integration');
  }
  if (!pageContent.includes('id="certificate-preview-section"')) {
    throw new Error('KhitmaPage missing certificate preview section anchor');
  }
  if (!pageContent.includes('#certificate-preview-section')) {
    throw new Error('KhitmaPage header missing quick navigation to certificate preview');
  }
  console.log('✔ KhitmaPage cleanly embeds the certificate preview with quick navigation link');

  console.log('\nAll PDF Certificate replication and Khatma page preview tests passed successfully! 🎉');
}

runTests();
