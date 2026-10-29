import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('Testing Khatma and Task mobile responsive layout enhancements...');

  const wizardPath = path.resolve('src/components/khitma/KhitmaRegistrationWizard.tsx');
  const khitmaPagePath = path.resolve('src/pages/KhitmaPage.tsx');
  const quizModalPath = path.resolve('src/components/khitma/KhitmaQuizModal.tsx');

  const wizardContent = fs.readFileSync(wizardPath, 'utf8');
  const pageContent = fs.readFileSync(khitmaPagePath, 'utf8');
  const quizContent = fs.readFileSync(quizModalPath, 'utf8');

  // 1. Wizard action buttons flexbox stacking and full-width on mobile
  if (!wizardContent.includes('flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4')) {
    throw new Error('KhitmaRegistrationWizard missing responsive flexbox stacking on action row');
  }
  console.log('✔ Wizard action rows use flex-col-reverse sm:flex-row stacking');

  // Verify Step 3 has w-full sm:w-auto for buttons
  if (!wizardContent.includes('Apply (Billaaw Khidmada)') || !wizardContent.includes('w-full sm:w-auto')) {
    throw new Error('KhitmaRegistrationWizard Step 3 Apply button is missing responsive mobile width');
  }
  console.log('✔ Wizard Step 3 buttons support mobile full-width (w-full sm:w-auto)');

  // Verify Wizard padding is p-4 sm:p-8
  if (!wizardContent.includes('p-4 sm:p-8 rounded-3xl bg-white')) {
    throw new Error('KhitmaRegistrationWizard card padding not optimized for mobile viewports');
  }
  console.log('✔ Wizard card padding optimized with p-4 sm:p-8');

  // Verify break-words on full name
  if (!wizardContent.includes('break-words')) {
    throw new Error('KhitmaRegistrationWizard missing break-words for long names');
  }
  console.log('✔ Wizard full name card handles long text wrapping (break-words)');

  // 2. KhitmaPage sticky header responsiveness
  if (!pageContent.includes('truncate block max-w-[125px] min-[400px]:max-w-[170px] sm:max-w-none')) {
    throw new Error('KhitmaPage header missing responsive title truncation');
  }
  console.log('✔ KhitmaPage top sticky header has responsive width constraint and truncation');

  if (!pageContent.includes('Qufulan 🔒')) {
    throw new Error('KhitmaPage header missing compact mobile lock badge');
  }
  console.log('✔ KhitmaPage header uses compact locked badge on mobile');

  if (!pageContent.includes('overflow-x-hidden')) {
    throw new Error('KhitmaPage main element missing overflow-x-hidden to prevent horizontal page scrolling');
  }
  console.log('✔ KhitmaPage prevents horizontal page scrolling (overflow-x-hidden)');

  // 3. KhitmaPage Task Page responsive elements
  if (!pageContent.includes('Akhriso Bogga') || !pageContent.includes('w-full sm:w-auto justify-center')) {
    throw new Error('KhitmaPage start reading callout link button missing responsive mobile styling');
  }
  console.log('✔ Task page Start Reading button stacks cleanly on mobile');

  if (!pageContent.includes('p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6')) {
    throw new Error('KhitmaPage 5-Prayer routine section missing responsive padding p-4 sm:p-8');
  }
  console.log('✔ Task page 5-Prayer routine section uses responsive padding (p-4 sm:p-8)');

  // 4. Quiz modal responsiveness
  if (!quizContent.includes('flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2')) {
    throw new Error('KhitmaQuizModal footer button row missing responsive flexbox stacking');
  }
  console.log('✔ KhitmaQuizModal navigation button row stacks cleanly on mobile');

  console.log('\nAll Mobile Responsive Layout checks passed successfully! 🎉');
}

runTests();
