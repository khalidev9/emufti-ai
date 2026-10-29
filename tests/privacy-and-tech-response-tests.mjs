import { generateIslamicResponse, isTechnologyOrModelQuery, isIslamicQuery } from '../src/lib/gemini.ts';

let passed = 0;
let total = 0;

function check(condition, testName, failureDetails = '') {
  total++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${failureDetails}`);
    throw new Error(`Test Failed: ${testName}`);
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('EMUFTI AI: PRIVACY POLICY & TECHNOLOGY DISCLOSURE VERIFICATION');
  console.log('========================================================================\n');

  // 1. Detection of technology queries in English, Somali, and Arabic
  const enQueries = [
    'What model are you?',
    'Which AI powers this?',
    'What technology do you use?',
    'Are you an AI or a human?',
    'Who created you?'
  ];
  for (const q of enQueries) {
    check(isTechnologyOrModelQuery(q), `Recognizes English tech query: "${q}"`);
  }

  const soQueries = [
    'Waa maxay model-kaagu?',
    'Sideed u shaqeysaa?',
    'Ma qof baad tahay mise AI?',
    'Yaa ku sameeyay?',
    'Maxaa lagugu dhisay?'
  ];
  for (const q of soQueries) {
    check(isTechnologyOrModelQuery(q), `Recognizes Somali tech query: "${q}"`);
  }

  const arQueries = [
    'ما هو النموذج الذي تعمل به؟',
    'ما هي التقنية المستخدمة؟',
    'هل أنت إنسان أم ذكاء اصطناعي؟',
    'كيف تعمل؟',
    'من طورك؟'
  ];
  for (const q of arQueries) {
    check(isTechnologyOrModelQuery(q), `Recognizes Arabic tech query: "${q}"`);
  }

  // 2. Test technology query responses without API key (zero-network fidelity)
  console.log('\n--- English Technology Response Verification ---');
  const enRes = await generateIslamicResponse({ prompt: 'What model are you?' });
  const enText = enRes.content;
  check(enText.includes('About EMUFTI AI'), 'English response has proper title');
  check(enText.includes('Educational AI Assistant, Not a Human Scholar'), 'Clarifies AI nature and does not claim human scholar status');
  check(enText.includes('trusted technology partners'), 'Discloses trusted technology partners truthfully');
  check(enText.includes('Privacy Policy') && enText.includes('/privacy'), 'Links to /privacy');
  check(enText.includes('passwords') && enText.includes('financial details'), 'Warns against submitting sensitive personal data');
  check(!enText.includes('gemini-') && !enText.includes('googleapis.com'), 'Does not leak internal model IDs or API endpoints');

  console.log('\n--- Somali Technology Response Verification ---');
  const soRes = await generateIslamicResponse({ prompt: 'Waa maxay model-kaagu?' });
  const soText = soRes.content;
  check(soText.includes('Ku Saabsan EMUFTI AI'), 'Somali response has proper title');
  check(soText.includes("Ma ihi mufti ama caalim bini'aadam ah"), "Clarifies not a human scholar in Somali");
  check(soText.includes('adeeg-bixiyeyaal tignoolaji oo lagu kalsoon yahay'), 'Discloses trusted technology partners in Somali');
  check(soText.includes('Xeerka Dhowridda Xogta') && soText.includes('/privacy'), 'Links to /privacy in Somali');
  check(soText.includes('passwords'), 'Advises not submitting passwords');
  check(!soText.includes('gemini-') && !soText.includes('googleapis.com'), 'Does not leak internal model IDs or API endpoints in Somali');

  console.log('\n--- Arabic Technology Response Verification ---');
  const arRes = await generateIslamicResponse({ prompt: 'ما هو النموذج الذي تعمل به؟' });
  const arText = arRes.content;
  check(arText.includes('حول EMUFTI AI والتقنية المستخدمة'), 'Arabic response has proper title');
  check(arText.includes('مساعد تعليمي ذكي وليس فقيهاً بشرياً'), 'Clarifies not a human scholar in Arabic');
  check(arText.includes('مزودي خدمات تقنية موثوقين'), 'Discloses trusted technology partners in Arabic');
  check(arText.includes('سياسة الخصوصية') && arText.includes('/privacy'), 'Links to /privacy in Arabic');
  check(arText.includes('كلمات المرور'), 'Warns against submitting passwords in Arabic');
  check(!arText.includes('gemini-') && !arText.includes('googleapis.com'), 'Does not leak internal model IDs or API endpoints in Arabic');

  console.log('\n========================================================================');
  console.log(`ALL TESTS PASSED: ${passed}/${total} checks completed successfully!`);
  console.log('========================================================================');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
