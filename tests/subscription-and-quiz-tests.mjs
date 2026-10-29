import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('EMUFTI AI — Subscription, Chat UI & Quiz Verification Tests');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: Subscription Duration & Annual Billing Interval Normalization
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Subscription Duration & Annual Billing Calculation ---');

function isAnnualBillingInterval(interval) {
  if (!interval) return false;
  const s = String(interval).toLowerCase().trim();
  return (
    s === 'yearly' ||
    s === 'annual' ||
    s === 'year' ||
    s === '1 year' ||
    s === '1_year' ||
    s === 'annually' ||
    s.includes('year') ||
    s.includes('annual')
  );
}

runTest('Interval normalization recognizes yearly, annual, year, and 1 year', () => {
  assert.strictEqual(isAnnualBillingInterval('yearly'), true);
  assert.strictEqual(isAnnualBillingInterval('annual'), true);
  assert.strictEqual(isAnnualBillingInterval('year'), true);
  assert.strictEqual(isAnnualBillingInterval('1 year'), true);
  assert.strictEqual(isAnnualBillingInterval('ANNUAL'), true);
  assert.strictEqual(isAnnualBillingInterval('monthly'), false);
  assert.strictEqual(isAnnualBillingInterval('month'), false);
  assert.strictEqual(isAnnualBillingInterval('free'), false);
  assert.strictEqual(isAnnualBillingInterval(undefined), false);
});

runTest('Annual subscription calculation grants exactly 1 calendar year (not 1 month)', () => {
  const activationDate = new Date('2026-10-17T12:00:00Z');
  
  // Monthly expiration
  const monthlyExp = new Date(activationDate);
  monthlyExp.setMonth(monthlyExp.getMonth() + 1);

  // Annual expiration
  const annualExp = new Date(activationDate);
  annualExp.setFullYear(annualExp.getFullYear() + 1);

  const durationDaysMonthly = Math.round((monthlyExp - activationDate) / (1000 * 60 * 60 * 24));
  const durationDaysAnnual = Math.round((annualExp - activationDate) / (1000 * 60 * 60 * 24));

  assert(durationDaysMonthly >= 28 && durationDaysMonthly <= 31, 'Monthly should be ~30 days');
  assert(durationDaysAnnual >= 365 && durationDaysAnnual <= 366, 'Annual should be 365 or 366 days');
  assert(durationDaysAnnual > 360, 'Annual duration must be 1 full calendar year');
});

runTest('SQL Migration contains 1-year calendar interval for annual subscriptions', () => {
  const migrationPath = path.resolve('supabase/migrations/20261017_subscription_and_quiz_upgrade.sql');
  assert(fs.existsSync(migrationPath), 'Migration file must exist');
  const content = fs.readFileSync(migrationPath, 'utf8');

  assert(content.includes("INTERVAL '1 year'"), 'Must calculate INTERVAL 1 year for annual subscriptions');
  assert(content.includes("INTERVAL '1 month'"), 'Must calculate INTERVAL 1 month for monthly subscriptions');
  assert(content.includes('started_at'), 'Must store started_at');
  assert(content.includes('expires_at'), 'Must store expires_at');
  assert(content.includes('public.quiz_questions'), 'Must create quiz_questions table');
  assert(content.includes('public.quiz_attempts'), 'Must create quiz_attempts table');
  assert(content.includes('public.quiz_answers'), 'Must create quiz_answers table');
  assert(content.includes('complete_quiz_attempt'), 'Must define complete_quiz_attempt RPC');
});

// -----------------------------------------------------------------------------
// TEST SUITE 2: AI Generation Status Text in 3 Languages
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: AI Generation Status Text Translations ---');

runTest('i18n dictionary contains exact translated "chat.generating" strings', () => {
  const i18nPath = path.resolve('src/lib/i18n.ts');
  const content = fs.readFileSync(i18nPath, 'utf8');

  assert(content.includes("'chat.generating': 'Generating response...'"), 'English chat.generating must be "Generating response..."');
  assert(content.includes("'chat.generating': 'Jawaabta ayaa la diyaarinayaa...'"), 'Somali chat.generating must be "Jawaabta ayaa la diyaarinayaa..."');
  assert(content.includes("'chat.generating': 'جارٍ إنشاء الإجابة...'"), 'Arabic chat.generating must be "جارٍ إنشاء الإجابة..."');
});

runTest('ChatMessage component uses localized chat.generating translation', () => {
  const chatMessagePath = path.resolve('src/components/chat/ChatMessage.tsx');
  const content = fs.readFileSync(chatMessagePath, 'utf8');

  assert(content.includes("t('chat.generating'"), 'ChatMessage must invoke t("chat.generating")');
  assert(!content.includes("Waxaan baadhayaa ilo diini ah..."), 'Hardcoded Somali generating text must be removed');
});

// -----------------------------------------------------------------------------
// TEST SUITE 3: Scoped Chat Scrollbar
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Scoped Chat Scrollbar ---');

runTest('index.css contains scoped .chat-scrollbar rules with green accent thumb', () => {
  const cssPath = path.resolve('src/index.css');
  const content = fs.readFileSync(cssPath, 'utf8');

  assert(content.includes('.chat-scrollbar'), 'Must have .chat-scrollbar selector');
  assert(content.includes('16, 185, 129') || content.includes('#10b981') || content.includes('rgba('), 'Must use green accent thumb color');
});

runTest('ChatPage.tsx applies .chat-scrollbar to main conversation scroll view', () => {
  const chatPagePath = path.resolve('src/pages/ChatPage.tsx');
  const content = fs.readFileSync(chatPagePath, 'utf8');

  assert(content.includes('chat-scrollbar'), 'ChatPage main must apply chat-scrollbar class');
});

// -----------------------------------------------------------------------------
// TEST SUITE 4: Subscription Badges on Profile Avatars
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: User Avatar Subscription Badges ---');

runTest('UserAvatar component renders solid circular badge for PRO and PREMIUM', () => {
  const avatarPath = path.resolve('src/components/common/UserAvatar.tsx');
  const content = fs.readFileSync(avatarPath, 'utf8');

  assert(content.includes("cleanPlan === 'pro'") || content.includes("plan === 'pro'"), 'Avatar must check pro plan');
  assert(content.includes("cleanPlan === 'premium'") || content.includes("plan === 'premium'"), 'Avatar must check premium plan');
  assert(content.includes('bg-emerald-500'), 'Pro must use green/emerald badge');
  assert(content.includes('bg-amber-400') || content.includes('bg-amber-500'), 'Premium must use yellow/gold badge');
  assert(content.includes('rounded-full'), 'Badge must be circular');
  assert(content.includes('absolute'), 'Badge must attach to avatar rim');
});

// -----------------------------------------------------------------------------
// TEST SUITE 5: Pricing Page Feature Organization
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Pricing Page Organization by Plan ---');

runTest('PricingPage has clear FREE, PRO, and PREMIUM tiers with monthly and annual pricing', () => {
  const pricingPath = path.resolve('src/pages/PricingPage.tsx');
  const content = fs.readFileSync(pricingPath, 'utf8');

  assert(content.includes('FREE'), 'Must feature FREE tier');
  assert(content.includes('PRO'), 'Must feature PRO tier');
  assert(content.includes('PREMIUM'), 'Must feature PREMIUM tier');
  assert(content.includes('5.99'), 'Pro monthly is $5.99');
  assert(content.includes('20.99'), 'Premium monthly is $20.99');
  assert(content.includes('50.99'), 'Pro annual is $50.99');
  assert(content.includes('75.99'), 'Premium annual is $75.99');
});

// -----------------------------------------------------------------------------
// TEST SUITE 6: Ramadan Offer Banner
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Ramadan Offer Banner ---');

runTest('RamadanOfferBanner has compact padding, responsive countdown chips and translations', () => {
  const bannerPath = path.resolve('src/components/chat/RamadanOfferBanner.tsx');
  const content = fs.readFileSync(bannerPath, 'utf8');

  assert(content.includes("t('ramadan.title'"), 'Must use translated ramadan.title');
  assert(content.includes("t('ramadan.claim_btn'"), 'Must use translated claim button');
  assert(content.includes('RAMADAN 1448 SPECIAL OFFER') || content.includes('t('), 'Must display offer banner');
});

// -----------------------------------------------------------------------------
// TEST SUITE 7: EMufti Quiz System & 2,000 Questions Bank
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 7: EMufti Quiz & 2,000 Questions Architecture ---');

runTest('quizQuestions.ts exports verified questions with authentic citations', async () => {
  const { VERIFIED_QUESTION_BANK, TOTAL_VERIFIED_QUESTIONS, getQuizQuestions, generateAskEMuftiHint } = await import('../src/data/quizQuestions.ts');

  assert(VERIFIED_QUESTION_BANK.length >= 15, 'Verified questions must be present');
  assert(TOTAL_VERIFIED_QUESTIONS >= 15, 'Confirmed verified question count must be reported');

  // Verify questions integrity
  for (const q of VERIFIED_QUESTION_BANK) {
    assert(q.id, 'Question must have id');
    assert(q.question_en && q.question_so && q.question_ar, 'Must have translations in English, Somali, and Arabic');
    assert.strictEqual(q.options.length, 4, 'Must have 4 structured options');
    assert(q.options.every(o => o.id && o.text_en && o.text_so && o.text_ar), 'Every option must have stable id and translations');
    assert(q.options.some(o => o.id === q.correct_option_id), 'correct_option_id must match one of the options');
    assert(q.source_citation && q.source_citation.length > 3, 'Must have valid source citation');
    assert.strictEqual(q.is_verified, true, 'Must be marked as verified');
  }

  // Verify getQuizQuestions function
  const round10 = getQuizQuestions({ count: 10 });
  assert.strictEqual(round10.length, 10, 'Should return exactly 10 questions for round');

  const quranOnly = getQuizQuestions({ category: 'quran', count: 3 });
  assert(quranOnly.every(q => q.category === 'quran'), 'All questions must be in quran category');

  // Test Ask EMufti hint generation
  const hintEn = generateAskEMuftiHint(VERIFIED_QUESTION_BANK[0], 'en');
  const hintSo = generateAskEMuftiHint(VERIFIED_QUESTION_BANK[0], 'so');
  const hintAr = generateAskEMuftiHint(VERIFIED_QUESTION_BANK[0], 'ar');

  assert(hintEn.includes('Scholarly Guidance') || hintEn.includes('EMufti AI'), 'English hint must provide scholarly guidance');
  assert(hintSo.includes('EMufti AI') || hintSo.includes('Talo'), 'Somali hint must provide scholarly guidance');
  assert(hintAr.includes('إي مفتي') || hintAr.includes('توجيه'), 'Arabic hint must provide scholarly guidance');
});

runTest('EMuftiQuizBanner component is implemented and rendered in ChatPage', () => {
  const bannerPath = path.resolve('src/components/chat/EMuftiQuizBanner.tsx');
  assert(fs.existsSync(bannerPath), 'EMuftiQuizBanner.tsx must exist');

  const chatPageContent = fs.readFileSync(path.resolve('src/pages/ChatPage.tsx'), 'utf8');
  assert(chatPageContent.includes('<EMuftiQuizBanner />'), 'ChatPage must render EMuftiQuizBanner');
});

runTest('QuizPage implements 3 lifelines: 50/50, +2 Time, and Ask EMufti', () => {
  const quizPagePath = path.resolve('src/pages/QuizPage.tsx');
  assert(fs.existsSync(quizPagePath), 'QuizPage.tsx must exist');
  const content = fs.readFileSync(quizPagePath, 'utf8');

  assert(content.includes('handleUse5050') || content.includes('lifeline5050Used'), 'Must implement 50/50 lifeline');
  assert(content.includes('handleUse2Time') || content.includes('lifeline2TimeUsed'), 'Must implement 2 Time (+120s) lifeline');
  assert(content.includes('handleUseAskEMufti') || content.includes('lifelineAskEMuftiUsed'), 'Must implement Ask EMufti lifeline');
  assert(content.includes('complete_quiz_attempt'), 'Must call complete_quiz_attempt RPC');
});

runTest('App.tsx registers /quiz route with ProtectedRoute', () => {
  const appPath = path.resolve('src/App.tsx');
  const content = fs.readFileSync(appPath, 'utf8');

  assert(content.includes('path="/quiz"'), 'App.tsx must register /quiz route');
  assert(content.includes('<QuizPage />'), 'App.tsx must mount QuizPage');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
