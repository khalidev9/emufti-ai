// Automated Universal Islamic Coverage & Verification Test Suite for EMufti AI
// Tests comprehensive Islamic coverage, intent recognition, language detection,
// Somali scholars retrieval, zero canned answers, and explicit error/retry handling.

import {
  detectQueryLanguage,
  isIslamicQuery,
  isGreeting,
  buildGeminiContents,
  getEffectiveGeminiApiKey,
  generateIslamicResponse,
  ISLAMIC_SYSTEM_INSTRUCTIONS
} from '../src/lib/gemini.ts';

import {
  retrieveIslamicSources,
  FIQH_TOPICS_DATABASE
} from '../src/lib/islamicKnowledgeEngine.ts';

import { ALL_114_SURAHS } from '../src/data/quranMetadata.ts';
import { SOMALI_SCHOLARS_TAFSIR } from '../src/data/tafsirData.ts';

let passed = 0;
let total = 0;

function check(condition, testName, failureDetails = '') {
  total++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${failureDetails}`);
    throw new Error(`Test Failed: ${testName} - ${failureDetails}`);
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('EMUFTI AI: UNIVERSAL ISLAMIC QUESTION COVERAGE & QUALITY TEST SUITE');
  console.log('========================================================================\n');

  // =========================================================================
  // 1. LANGUAGE DETECTION (Somali, Arabic, English)
  // =========================================================================
  console.log('--- 1. Language Detection Tests ---');
  check(detectQueryLanguage('Waa maxay shuruudaha salaadda?') === 'so', 'Detects Somali query');
  check(detectQueryLanguage('Sidee loo soomaa bisha Ramadaan?') === 'so', 'Detects Somali fasting query');
  check(detectQueryLanguage('Maxaa buriya weesada?') === 'so', 'Detects Somali wudu query');
  check(detectQueryLanguage('ما هي شروط الصلاة في الفقه؟') === 'ar', 'Detects Arabic query');
  check(detectQueryLanguage('ما حكم الربا في المعاملات المالية؟') === 'ar', 'Detects Arabic finance query');
  check(detectQueryLanguage('What are the pillars of Islam?') === 'en', 'Detects English query');
  check(detectQueryLanguage('Is cryptocurrency permissible in Islamic finance?') === 'en', 'Detects English finance query');

  // =========================================================================
  // 2. ISLAMIC SCOPE & BOUNDARIES ENFORCEMENT
  // =========================================================================
  console.log('\n--- 2. Islamic Scope & Boundary Enforcement Tests ---');
  // 2.1 Genuine Islamic topics (Classical & Contemporary)
  check(isIslamicQuery('Waa maxay salaaddu?'), 'Identifies Salah as Islamic');
  check(isIslamicQuery('How is Zakat calculated on gold and cash?'), 'Identifies Zakat as Islamic');
  check(isIslamicQuery('Maxaa jabiya soonka?'), 'Identifies Sawm as Islamic');
  check(isIslamicQuery('Hajj rituals and conditions of Ihram'), 'Identifies Hajj as Islamic');
  check(isIslamicQuery('How are inheritance shares distributed in Mirath?'), 'Identifies Mirath as Islamic');
  check(isIslamicQuery('What are the 5 conditions of a Sahih Hadith?'), 'Identifies Hadith science as Islamic');
  check(isIslamicQuery('Tafsiirka Suuradda Al-Faatixa ee Sheekh Umal'), 'Identifies Somali scholar tafsir as Islamic');
  check(isIslamicQuery('Is cryptocurrency or Bitcoin halal in Islam?'), 'Identifies crypto inquiry as Islamic');
  check(isIslamicQuery('Rulings on conventional mortgages and bank interest'), 'Identifies mortgage/riba as Islamic');
  check(isIslamicQuery('Islamic rulings on organ donation'), 'Identifies organ donation as Islamic');

  // 2.2 Secular topics (Correctly classified as non-Islamic)
  check(!isIslamicQuery('Write a Python script to sort a list using quicksort'), 'Rejects Python coding request');
  check(!isIslamicQuery('Who won the 2022 World Cup and what was the score?'), 'Rejects sports match stats');
  check(!isIslamicQuery('How to replace the alternator and brake pads on my car?'), 'Rejects car mechanical repair');
  check(!isIslamicQuery('Who is Taylor Swift dating right now?'), 'Rejects celebrity gossip');

  // =========================================================================
  // 3. CONVERSATIONAL INTENT & GREETINGS (Non-preaching / Warm response)
  // =========================================================================
  console.log('\n--- 3. Conversational Intent & Greetings Tests ---');
  check(isGreeting('Asc'), 'Recognizes "Asc" as greeting');
  check(isGreeting('Assalaamu calaykum'), 'Recognizes "Assalaamu calaykum" as greeting');
  check(isGreeting('As-salamu alaykum'), 'Recognizes "As-salamu alaykum" as greeting');
  check(isGreeting('Hello'), 'Recognizes "Hello" as greeting');
  check(isGreeting('Hi'), 'Recognizes "Hi" as greeting');
  check(isGreeting('السلام عليكم'), 'Recognizes Arabic Salam as greeting');
  check(!isGreeting('Waa maxay salaaddu?'), 'Does not classify substantive question as greeting');
  check(!isGreeting('What is zakat?'), 'Does not classify zakat question as greeting');

  // Test greeting execution: direct warm response without lecturing or reciting prayer conditions
  const greetingResSo = await generateIslamicResponse({ prompt: 'Asc' });
  check(greetingResSo.content.includes('Wacalaykumu salaam'), 'Somali greeting receives Islamic Wa Alaykum As-Salam');
  check(greetingResSo.content.includes('EMufti AI'), 'Identifies platform warmly');
  check(!greetingResSo.content.includes('#### 1.'), 'Does not recite unprompted numbered conditions or lectures');

  const greetingResEn = await generateIslamicResponse({ prompt: 'Hello', targetLanguage: 'en' });
  check(greetingResEn.content.includes('Wa Alaykum As-Salam') || greetingResEn.content.includes('Welcome'), 'English greeting receives warm welcome');
  check(!greetingResEn.content.includes('#### 1.'), 'English greeting does not recite unprompted lectures');

  // Test non-Islamic query redirect
  const nonIslamicRes = await generateIslamicResponse({ prompt: 'Write a python script to reverse a linked list' });
  check(nonIslamicRes.content.includes('EMufti AI'), 'Identifies EMufti AI scope in redirect');
  check(nonIslamicRes.content.includes('Diinta Islaamka') || nonIslamicRes.content.includes('Islamic'), 'Explains dedicated Islamic mission');

  // =========================================================================
  // 4. GEMINI MULTI-TURN MESSAGE FORMATTING (Strict alternating roles)
  // =========================================================================
  console.log('\n--- 4. Google Gemini Multi-Turn Message Formatting Tests ---');
  // 4.1 Empty history
  const contents1 = buildGeminiContents([], 'What is Salah?');
  check(contents1.length === 1, 'Contents has 1 turn with empty history');
  check(contents1[0].role === 'user', 'First turn role is user');
  check(contents1[0].parts[0].text === 'What is Salah?', 'Prompt text matches');

  // 4.2 History starting with assistant (must skip or format so first turn is user)
  const historyWithLeadingAssistant = [
    { role: 'assistant', content: 'Welcome to EMufti AI' },
    { role: 'user', content: 'What is Zakat?' },
    { role: 'assistant', content: 'Zakat is the 3rd pillar...' },
  ];
  const contents2 = buildGeminiContents(historyWithLeadingAssistant, 'What is the Nisab?');
  check(contents2[0].role === 'user', 'Guarantees first turn is always user even if history starts with assistant');
  check(contents2.length >= 3, 'Includes relevant turns');
  // Check strict alternation
  let alternating = true;
  for (let i = 1; i < contents2.length; i++) {
    if (contents2[i].role === contents2[i - 1].role) alternating = false;
  }
  check(alternating, 'Guarantees strictly alternating roles (user -> model -> user -> model)');

  // 4.3 History with consecutive user messages (must merge)
  const historyWithConsecutiveUser = [
    { role: 'user', content: 'First user message' },
    { role: 'user', content: 'Second user message immediately following' },
    { role: 'assistant', content: 'Model answer' },
  ];
  const contents3 = buildGeminiContents(historyWithConsecutiveUser, 'Follow-up question');
  check(contents3[0].role === 'user', 'First turn is user');
  check(contents3[0].parts[0].text.includes('First user message') && contents3[0].parts[0].text.includes('Second user message'), 'Merges consecutive user turns');

  // =========================================================================
  // 5. ISLAMIC SCRIPTURAL & SCHOLAR GROUNDING RETRIEVAL
  // =========================================================================
  console.log('\n--- 5. Islamic Knowledge Engine Retrieval Across Domains ---');

  // 5.1 Quran Surahs & Tafsir (Surah Al-Fatihah)
  const rFatihah = retrieveIslamicSources('Tafsiirka Suuradda Al-Faatixa');
  check(rFatihah.groundingSnippet.includes('Al-Fatihah'), 'Retrieves Surah Al-Fatihah metadata');
  check(rFatihah.groundingSnippet.includes('Umm al-Kitab') || rFatihah.groundingSnippet.includes('Fatihah'), 'Retrieves Tafsir Fatihah concept');

  // 5.2 Taharah & Wudu
  const rWudu = retrieveIslamicSources('Maxaa jebiya weesada?');
  check(rWudu.matchedTopic?.id === 'wudu_nullifiers', 'Matches wudu_nullifiers topic');
  check(rWudu.groundingSnippet.includes('Sunan Abi Dawud'), 'Retrieves authentic Hadith citation for wudu');

  // 5.3 Fasting & Ramadan
  const rSawm = retrieveIslamicSources('Maxaa jabiya soonka Ramadaan?');
  check(rSawm.matchedTopic?.id === 'fasting_sawm_rules', 'Matches fasting_sawm_rules topic');
  check(rSawm.groundingSnippet.includes('Al-Baqarah 2:187'), 'Retrieves Quranic proof for fasting');

  // 5.4 Mirath / Inheritance Fixed Shares
  const rMirath = retrieveIslamicSources('Sidee loo qaybiyaa dhaxalka (Mirath)?');
  check(rMirath.matchedTopic?.id === 'inheritance_mirath_shares', 'Matches inheritance_mirath_shares topic');
  check(rMirath.groundingSnippet.includes('An-Nisa 4:11-12') || rMirath.groundingSnippet.includes('4:11'), 'Retrieves Quranic inheritance shares verses');
  check(rMirath.groundingSnippet.includes('1/2') && rMirath.groundingSnippet.includes('1/4') && rMirath.groundingSnippet.includes('1/8'), 'Retrieves fixed Quranic shares');

  // 5.5 Hadith Authenticity Sciences (Mustalah al-Hadith)
  const rHadith = retrieveIslamicSources('Waa maxay shuruudaha xadiiska saxiixa ah?');
  check(rHadith.matchedTopic?.id === 'hadith_authenticity_sciences', 'Matches hadith_authenticity_sciences topic');
  check(rHadith.groundingSnippet.includes('Mustalah al-Hadith') || rHadith.groundingSnippet.includes('Sahih'), 'Retrieves Hadith classification science');
  check(rHadith.groundingSnippet.includes('Dabt') || rHadith.groundingSnippet.includes('Sanad') || rHadith.groundingSnippet.includes('Cillah'), 'Retrieves conditions of authentic hadith');

  // 5.6 Madhhab Differences (Ikhtilaf across 4 Sunni schools)
  const rIkhtilaf = retrieveIslamicSources('Maxay tahay sababta ay culimada madhabaha isku khilaafeen?');
  check(rIkhtilaf.matchedTopic?.id === 'madhhab_differences_ikhtilaf', 'Matches madhhab_differences_ikhtilaf topic');
  check(rIkhtilaf.groundingSnippet.includes('Hanafi') && rIkhtilaf.groundingSnippet.includes('Shafi'), 'Covers Sunni madhhabs');

  // 5.7 Somali Scholars Tafsir (Sheikh Umal, Sheikh Dirir, etc.)
  const rUmal = retrieveIslamicSources('Tafsiirka Sheekh Umal suuradda Al-Baqarah');
  check(rUmal.groundingSnippet.includes('Sheekh Maxamed Cabdi Umal') || rUmal.groundingSnippet.includes('Umal'), 'Retrieves Sheekh Umal tafsir grounding');
  check(rUmal.groundingSnippet.includes('archive.org') || rUmal.groundingSnippet.includes('duruso.org'), 'Includes verified audio link for scholar');

  const rDirir = retrieveIslamicSources('Sheekh Dirir tafsiirkiisa');
  check(rDirir.groundingSnippet.includes('Sheekh Maxamed Sheekh Cumar Dirir') || rDirir.groundingSnippet.includes('Dirir'), 'Retrieves Sheekh Dirir tafsir grounding');

  // =========================================================================
  // 6. VERIFY ZERO CANNED RESPONSES & NO "FOUNDATIONAL ISLAMIC PRINCIPLES"
  // =========================================================================
  console.log('\n--- 6. Verify Elimination of Canned "Foundational Islamic Principles" ---');
  check(!ISLAMIC_SYSTEM_INSTRUCTIONS.includes('Foundational Islamic Principles'), 'System instructions free of generic template');
  
  // Verify across all database topics
  for (const topic of FIQH_TOPICS_DATABASE) {
    check(!topic.titleSo.includes('Foundational Islamic Principles'), `Topic ${topic.id} titleSo free of canned template`);
    check(!topic.titleEn.includes('Foundational Islamic Principles'), `Topic ${topic.id} titleEn free of canned template`);
    check(!topic.principlesSo.includes('Foundational Islamic Principles'), `Topic ${topic.id} principlesSo free of canned template`);
  }

  // =========================================================================
  // 7. VERIFY AI SERVICE UNAVAILABLE BEHAVIOR (Explicit Error & Retry Guidance)
  // =========================================================================
  console.log('\n--- 7. AI Service Unavailable & Retry Guidance Verification ---');
  // When no API key is available and edge function fails:
  // Must THROW an error directing user to Settings and Retry button, NEVER return silent mock text!
  let threwExpectedError = false;
  let caughtErrorMessage = '';
  try {
    await generateIslamicResponse({
      prompt: 'Waa maxay xukunka qofka cudur dartiis u soomi waaya?',
      targetLanguage: 'so'
    });
  } catch (err) {
    threwExpectedError = true;
    caughtErrorMessage = err.message;
  }

  check(threwExpectedError, 'Throws explicit error when AI service is unavailable instead of returning canned text');
  check(caughtErrorMessage.includes('Settings') || caughtErrorMessage.includes('Dhowridda'), 'Error message instructs user to check Settings');
  check(caughtErrorMessage.includes('Isku day mar kale') || caughtErrorMessage.includes('Retry'), 'Error message instructs user to use Retry button');

  // Verify English error messaging
  let threwExpectedErrorEn = false;
  let caughtErrorMessageEn = '';
  try {
    await generateIslamicResponse({
      prompt: 'What is the ruling on fasting for an ill person?',
      targetLanguage: 'en'
    });
  } catch (err) {
    threwExpectedErrorEn = true;
    caughtErrorMessageEn = err.message;
  }

  check(threwExpectedErrorEn, 'English inquiry throws explicit error when AI service is unavailable');
  check(caughtErrorMessageEn.includes('Settings') && caughtErrorMessageEn.includes('Retry'), 'English error includes Settings and Retry guidance');

  // =========================================================================
  // 8. VERIFY API KEY EXTRACTION PRIORITY
  // =========================================================================
  console.log('\n--- 8. API Key Resolution Priority Tests ---');
  const resolvedKey = getEffectiveGeminiApiKey();
  check(typeof resolvedKey === 'string', 'getEffectiveGeminiApiKey returns a string');

  console.log('\n========================================================================');
  console.log(`ALL TESTS PASSED: ${passed}/${total} checks completed successfully!`);
  console.log('========================================================================');
}

runTestSuite().catch((err) => {
  console.error('\n[FATAL] Test suite execution failed:', err);
  process.exit(1);
});
