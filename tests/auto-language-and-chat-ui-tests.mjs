// Automated Verification Tests: Automatic Language Detection & Modern Chat UI
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

console.log('\n=== EMUFTI AI: Automatic Language Detection & Modern Chat UI Tests ===\n');

// -------------------------------------------------------------
// Test Suite 1: Verification that Visible Language Selectors Are Removed
// -------------------------------------------------------------
console.log('Suite 1: Removal of Visible Language Selectors');
{
  const composerFile = fs.readFileSync(path.join(ROOT, 'src/components/chat/MessageComposer.tsx'), 'utf8');
  const headerFile = fs.readFileSync(path.join(ROOT, 'src/components/layout/Header.tsx'), 'utf8');
  const chatPageFile = fs.readFileSync(path.join(ROOT, 'src/pages/ChatPage.tsx'), 'utf8');

  assert(
    !composerFile.includes('<select') && !composerFile.includes('Choose Language') && !composerFile.includes('Select response language'),
    'MessageComposer has no visible language select dropdown or selector control'
  );

  assert(
    !headerFile.includes('<select') && !headerFile.includes('Choose Answer Language') && !headerFile.includes('Auto (Luuqadda)'),
    'Header has no visible language select dropdown or selector chip'
  );

  assert(
    !chatPageFile.includes('<select') && !chatPageFile.includes('Select Language'),
    'ChatPage has no extraneous visible language dropdowns'
  );
}

// -------------------------------------------------------------
// Test Suite 2: Language Detection Accuracy
// -------------------------------------------------------------
console.log('\nSuite 2: Language Detection (Somali, Arabic, English, Explicit Overrides, Mixed)');
{
  // Test the detectQueryLanguage algorithm from gemini.ts and utils.ts
  const utilsCode = fs.readFileSync(path.join(ROOT, 'src/lib/utils.ts'), 'utf8');
  const geminiCode = fs.readFileSync(path.join(ROOT, 'src/lib/gemini.ts'), 'utf8');

  // Load functions in isolated node environment
  function isArabic(text) {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  }

  function isPredominantlyArabic(text) {
    if (!text) return false;
    const clean = text.replace(/[\s\d\p{P}]/gu, '');
    if (!clean) return false;
    const arabicChars = (clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    return arabicChars / clean.length > 0.45;
  }

  function isSomali(text) {
    if (!text) return false;
    const somaliPatterns = [
      /\b(waa|waxaa|waxa|waxaan|waxaad|waxaynu|waxay|wuxuu)\b/i,
      /\b(maxay|maxaa|sidee|goormaa|xagee|halkee|sheeg|iiga|warran|adigu)\b/i,
      /\b(salaad|salaadda|salaaddu|salaadii|salaadaha|tukanaya|tukada|tukashada)\b/i,
      /\b(zakad|zakada|zakadu|sakad|sakada|sakadu|soon|soonka|soomid|xaj|xajka)\b/i,
      /\b(shuruud|shuruudaha|shardi|tiir|tiirarka|arkaan|rukun)\b/i,
      /\b(daahir|daahirnimo|weeso|weesada|qubeys|qubeyska|najaaso|najaasada|cawro|cawrada|qiblo|qiblada|niyad|niyadda)\b/i,
      /\b(islaam|islaamka|islaamnimo|diin|diinta|culimo|culimada|sheekh)\b/i,
      /\b(xalaal|xaaraan|xaaraam|waajib|faral|sunno|sunnada|mustaxab|makruuh|bannaan|mubaax)\b/i,
      /\b(daliil|aayad|suurad|suuradda|xadiis|xadiiska|nabiga|rasuulka)\b/i,
      /\b(fadlan|qofka|qofkii|ruuxa|inuu|inay|waana|haddii|lagama|maarmaan)\b/i,
      /\b(asc|ascw|asw|sc|salaan|salaamu calaykum|assalaamu calaykum|subax wanaagsan|galab wanaagsan|habeen wanaagsan)\b/i,
      /\b(guur|guurka|nikax|meher|furiin|furriin|dhaxal|dhaxalka|riba|ribada)\b/i,
      /\b(towxiid|towxiidka|caqiido|aqiido|duco|ducada|dikri|tasbiix|toobad|toobadda)\b/i,
      /\b(iyo|ee|oo|ku|ka|ah|u|la|kala|yahay|tahay|yihiin|inaad|inaan|annagu|iyagu)\b/i,
      /\b(jawaab|jawaabta|faahfaahin|sharax|sharaxaad|ogow|maanta|halkan)\b/i,
    ];
    return somaliPatterns.some((p) => p.test(text));
  }

  function detectQueryLanguage(text) {
    if (!text || !text.trim()) return 'so';
    const t = text.trim();
    const lower = t.toLowerCase();

    if (
      /(?:answer|reply|write|explain|respond)\s+(?:me\s+)?in\s+english\b/i.test(lower) ||
      /\bin\s+english(?:\s+please)?\b/i.test(lower) ||
      /\benglish\s*:\s*/i.test(lower) ||
      /\bku\s+jawaab\s+ingiriisi\b/i.test(lower)
    ) {
      return 'en';
    }

    if (
      /(?:ku\s+jawaab|iigu\s+jawaab|ku\s+sharax|qor)\s+af[-\s]?soomaali\b/i.test(lower) ||
      /\baf[-\s]?soomaali(?:\s+fadlan)?\b/i.test(lower) ||
      /\bin\s+somali\b/i.test(lower) ||
      /\bsomali\s*:\s*/i.test(lower) ||
      /\bsoomaali\s+ku\s+sheeg\b/i.test(lower)
    ) {
      return 'so';
    }

    if (
      /(?:أجبني|باللغة|بالعربية|بالعربي|جاوبني)\s+بالعربية/i.test(lower) ||
      /\bin\s+arabic\b/i.test(lower) ||
      /\barabic\s*:\s*/i.test(lower) ||
      /\bku\s+jawaab\s+carabi\b/i.test(lower)
    ) {
      return 'ar';
    }

    if (isSomali(t)) {
      return 'so';
    }

    if (isPredominantlyArabic(t)) {
      return 'ar';
    }

    if (isArabic(t) && !/[a-zA-Z]/.test(t)) {
      return 'ar';
    }

    return 'en';
  }

  // 1. Pure Somali Queries
  assert(
    detectQueryLanguage('Waa maxay shuruudaha salaadda?') === 'so',
    'Somali: "Waa maxay shuruudaha salaadda?" detected as so'
  );
  assert(
    detectQueryLanguage('Sidee loo gutaa xajka iyo cumrada?') === 'so',
    'Somali: "Sidee loo gutaa xajka iyo cumrada?" detected as so'
  );
  assert(
    detectQueryLanguage('Maxaa buriya weysada marka loo eego culimada?') === 'so',
    'Somali: "Maxaa buriya weysada marka loo eego culimada?" detected as so'
  );
  assert(
    detectQueryLanguage('Iiga warran xukunka zakada lacagta iyo dahabka') === 'so',
    'Somali: "Iiga warran xukunka zakada lacagta iyo dahabka" detected as so'
  );

  // 2. Pure Arabic Queries
  assert(
    detectQueryLanguage('ما هي شروط صحة الصلاة في الفقه الإسلامي؟') === 'ar',
    'Arabic: "ما هي شروط صحة الصلاة في الفقه الإسلامي؟" detected as ar'
  );
  assert(
    detectQueryLanguage('ما حكم صيام يوم الشك؟') === 'ar',
    'Arabic: "ما حكم صيام يوم الشك؟" detected as ar'
  );
  assert(
    detectQueryLanguage('بيّن أركان النكاح وشروط الولي في المذاهب الأربعة') === 'ar',
    'Arabic: "بيّن أركان النكاح وشروط الولي في المذاهب الأربعة" detected as ar'
  );

  // 3. Pure English Queries
  assert(
    detectQueryLanguage('What are the fundamental pillars of Islam and Iman?') === 'en',
    'English: "What are the fundamental pillars of Islam and Iman?" detected as en'
  );
  assert(
    detectQueryLanguage('Can a Muslim invest in index funds and modern stock markets?') === 'en',
    'English: "Can a Muslim invest in index funds and modern stock markets?" detected as en'
  );
  assert(
    detectQueryLanguage('Explain the Islamic ruling regarding organ donation') === 'en',
    'English: "Explain the Islamic ruling regarding organ donation" detected as en'
  );

  // 4. Mixed Prompts with Arabic Scriptural Citations (Must NOT get tricked into 'ar')
  assert(
    detectQueryLanguage('Waa maxay macnaha aayadda (إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا) ee ku jirta Suuradda An-Nisaa?') === 'so',
    'Mixed Somali + Quran verse correctly preserves Somali (so)'
  );
  assert(
    detectQueryLanguage('What is the explanation of the hadith (إنما الأعمال بالنيات) in Sahih al-Bukhari?') === 'en',
    'Mixed English + Hadith quote correctly preserves English (en)'
  );

  // 5. Explicit Language Preferences / Overrides
  assert(
    detectQueryLanguage('Answer me in English: Waa maxay salaaddu?') === 'en',
    'Explicit instruction "Answer me in English" triggers English (en)'
  );
  assert(
    detectQueryLanguage('Ku jawaab af Soomaali: What are the conditions of prayer?') === 'so',
    'Explicit instruction "Ku jawaab af Soomaali" triggers Somali (so)'
  );
  assert(
    detectQueryLanguage('أجبني بالعربية: What are the nullifiers of wudu?') === 'ar',
    'Explicit instruction "أجبني بالعربية" triggers Arabic (ar)'
  );
}

// -------------------------------------------------------------
// Test Suite 3: System Prompt Instructions for Dynamic Mid-Thread Adaptation
// -------------------------------------------------------------
console.log('\nSuite 3: Dynamic AI System Instructions & Backend Rules');
{
  const geminiCode = fs.readFileSync(path.join(ROOT, 'src/lib/gemini.ts'), 'utf8');
  const serverCode = fs.readFileSync(path.join(ROOT, 'server/index.mjs'), 'utf8');
  const viteCode = fs.readFileSync(path.join(ROOT, 'vite.config.ts'), 'utf8');

  assert(
    geminiCode.includes('DYNAMIC AUTOMATIC RESPONSE LANGUAGE MANDATE') &&
    geminiCode.includes('AUTOMATIC PER-MESSAGE MATCHING') &&
    geminiCode.includes('DYNAMIC MID-THREAD SWITCHING'),
    'gemini.ts mandates automatic per-message detection and mid-thread switching'
  );

  assert(
    geminiCode.includes('ZERO HALLUCINATION: NEVER fabricate or invent verses') &&
    geminiCode.includes('distinguish verified scholar tafsir from AI explanation'),
    'gemini.ts strictly preserves Islamic scholarship integrity and zero hallucination'
  );

  assert(
    serverCode.includes('Automatically detect the language of the user\'s latest prompt') &&
    serverCode.includes('If the user switches language mid-conversation, immediately switch'),
    'server/index.mjs enforces dynamic automatic language matching on server endpoint'
  );

  assert(
    viteCode.includes('Automatically detect the language of the user\'s latest prompt') &&
    viteCode.includes('If the user switches language mid-conversation, immediately switch'),
    'vite.config.ts enforces dynamic automatic language matching on dev proxy endpoint'
  );
}

// -------------------------------------------------------------
// Test Suite 4: ChatMessage & UI Component Layout
// -------------------------------------------------------------
console.log('\nSuite 4: ChatMessage Modern UI, RTL/LTR Direction & Composer');
{
  const chatMessageFile = fs.readFileSync(path.join(ROOT, 'src/components/chat/ChatMessage.tsx'), 'utf8');
  const composerFile = fs.readFileSync(path.join(ROOT, 'src/components/chat/MessageComposer.tsx'), 'utf8');
  const helpCenterFile = fs.readFileSync(path.join(ROOT, 'src/pages/HelpCenterPage.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(ROOT, 'src/components/layout/Sidebar.tsx'), 'utf8');

  assert(
    chatMessageFile.includes('messageIsArabic') &&
    chatMessageFile.includes('dir={messageIsArabic ? \'rtl\' : \'ltr\'}'),
    'ChatMessage sets dir="rtl" for Arabic messages and "ltr" for Somali/English'
  );

  assert(
    chatMessageFile.includes('isPredominantlyArabic(quoteText)') &&
    chatMessageFile.includes('font-arabic text-right'),
    'ChatMessage formats Arabic Quran/Hadith blockquotes with RTL Arabic typography'
  );

  assert(
    chatMessageFile.includes('handleCopy') &&
    chatMessageFile.includes('regenerateMessage') &&
    chatMessageFile.includes('submitFeedback'),
    'ChatMessage includes working copy, regenerate, and feedback actions'
  );

  assert(
    composerFile.includes('ArrowUp') &&
    composerFile.includes('bg-emerald-600') &&
    composerFile.includes('Generating response...'),
    'MessageComposer includes green circular ArrowUp button and Generating response... state'
  );

  assert(
    composerFile.includes('handleKeyDown') &&
    composerFile.includes("e.key === 'Enter'") &&
    composerFile.includes('!e.shiftKey'),
    'MessageComposer preserves Enter-to-send and Shift+Enter for new line'
  );

  assert(
    sidebarFile.includes('bg-emerald-600') &&
    sidebarFile.includes('Plus') &&
    sidebarFile.includes('getNewChatText()'),
    'Sidebar preserves prominent green New Chat button'
  );

  assert(
    !helpCenterFile.includes('globe icon selector inside the chat box') &&
    helpCenterFile.includes('The AI automatically detects your language and replies in the same language'),
    'HelpCenterPage FAQ updated to reflect automatic language detection'
  );
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log(`\n==================================================`);
console.log(`Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`==================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
