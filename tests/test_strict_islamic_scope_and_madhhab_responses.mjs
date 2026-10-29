import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  isIslamicQuery,
  isGreeting,
  isTechnologyOrModelQuery,
  buildMadhhabSystemInstruction,
  resolveEffectiveSchool,
  generateIslamicResponse,
  AUTHENTIC_KNOWLEDGE_BASE
} from '../src/lib/gemini.ts';

console.log('=== TEST SUITE: STRICT ISLAMIC SCOPE FILTER & MADHHAB-SPECIFIC RESPONSES ===\n');

// ============================================================================
// PART 1: STRICT ISLAMIC / RELIGIOUS SCOPE FILTER TESTS
// ============================================================================
console.log('--- 1. Testing Genuine Islamic Queries (Accepted) ---');

const genuineIslamicPrompts = [
  'Waa maxay salaaddu?',
  'Sidee baa weesada loo qaataa?',
  'Maxaa jabiya soonka?',
  'How is Zakat calculated on gold and cash savings?',
  'Hajj rituals and conditions of Ihram',
  'How are inheritance shares distributed in Mirath?',
  'What are the conditions of a Sahih Hadith in Mustalah al-Hadith?',
  'Tafsiirka Suuradda Al-Faatixa ee Sheekh Umal',
  'Is cryptocurrency or Bitcoin halal in Islamic finance?',
  'Rulings on conventional mortgages and bank interest (riba)',
  'Islamic rulings on organ donation and brain death',
  'Is cosmetic surgery permissible in Islam?',
  'Ma bannaantahay in qofku bangi caadi ah lacag dhigto?',
  'Muxuu yahay xukunka qofka been sheega diin ahaan?',
  'ما حكم صلاة الجماعة في المسجد؟',
  'هل يجوز التأمين التجاري في الشريعة الإسلامية؟',
  'Waa maxay shuruudaha meherka iyo guurka ee shareecada?',
];

for (const prompt of genuineIslamicPrompts) {
  assert.strictEqual(isIslamicQuery(prompt), true, `Failed to accept genuine Islamic inquiry: "${prompt}"`);
}
console.log('✓ All 17 genuine Islamic queries correctly identified as authentic Islamic topics.');

console.log('\n--- 2. Testing Greetings and Platform / Technology Queries (Accepted) ---');
const greetingsAndTech = [
  'Asc',
  'Assalamu alaykum',
  'Hello',
  'Hi',
  'السلام عليكم',
  'Who created EMufti AI?',
  'What model powers this system?',
  'What technology do you use?',
];

for (const prompt of greetingsAndTech) {
  assert.strictEqual(isIslamicQuery(prompt), true, `Failed to accept greeting/tech inquiry: "${prompt}"`);
}
console.log('✓ All greetings and platform disclosures correctly accepted.');

console.log('\n--- 3. Testing Strict Rejection of Non-Religious / Off-Topic Queries ---');
const nonReligiousPrompts = [
  // Secular recipes
  'Can you give me a recipe for chocolate cake?',
  'How to bake sourdough bread step by step?',
  'Recipe for apple pie and cookies',
  // Secular mathematics
  'Solve this quadratic equation: 3x^2 + 5x - 12 = 0',
  'Calculate the square root of 144 and the hypotenuse',
  'Solve the algebraic equation 2x + 7 = 19',
  // Secular science & biology
  'Explain photosynthesis and how plants convert sunlight into energy',
  'How does gravity work in physics according to general relativity?',
  // Secular world trivia & geography
  'What is the capital of Spain?',
  'What is the capital of Australia?',
  'Who was the 16th president of the United States?',
  'What is the weather like today in London?',
  // Secular history & entertainment
  'Tell me about the French revolution and the storming of the Bastille',
  'Who is Taylor Swift dating right now?',
  'Who won the 2022 World Cup and what was the score?',
  // Secular coding
  'Write a python script to sort a list using quicksort',
  'Debug this typescript error in my react component',
  // Secular stories / general chit-chat
  'Tell me a bedtime story about dragons in a magical castle',
];

for (const prompt of nonReligiousPrompts) {
  assert.strictEqual(isIslamicQuery(prompt), false, `Failed to reject non-religious query: "${prompt}"`);
}
console.log(`✓ All ${nonReligiousPrompts.length} non-religious / off-topic queries strictly rejected.`);

console.log('\n--- 4. Testing End-to-End Polite Refusal & Redirect Generation ---');
// Verify Somali refusal
const somaliSecular = await generateIslamicResponse({
  prompt: 'Can you give me a recipe for chocolate cake?',
  targetLanguage: 'so',
});
assert.strictEqual(somaliSecular.model, 'EMufti-Islamic-Core');
assert.ok(somaliSecular.content.includes('Diinta Islaamka oo keliya'), 'Somali refusal must state Islamic scope');
assert.ok(somaliSecular.content.includes('Fadlan waxaad xor u tahay inaad i weydiiso su\'aal kasta oo ku saabsan diinta Islaamka'), 'Somali refusal must redirect to Islamic topics');

// Verify English refusal
const englishSecular = await generateIslamicResponse({
  prompt: 'Solve this quadratic equation: x^2 - 4 = 0',
  targetLanguage: 'en',
});
assert.strictEqual(englishSecular.model, 'EMufti-Islamic-Core');
assert.ok(englishSecular.content.includes('dedicated exclusively') && englishSecular.content.includes('Islamic teachings'), 'English refusal must state Islamic scope');
assert.ok(englishSecular.content.includes('Please feel free to ask any question regarding Islamic knowledge'), 'English refusal must redirect to Islamic topics');

// Verify Arabic refusal
const arabicSecular = await generateIslamicResponse({
  prompt: 'ما هي عاصمة إسبانيا؟',
  targetLanguage: 'ar',
});
assert.strictEqual(arabicSecular.model, 'EMufti-Islamic-Core');
assert.ok(arabicSecular.content.includes('مخصص حصرياً للعلوم والمعارف') && arabicSecular.content.includes('الإسلامية والشرعية'), 'Arabic refusal must state Islamic scope');
assert.ok(arabicSecular.content.includes('يسعدنا جداً الإجابة على أي سؤال أو استفسار يتعلق بتعاليم الدين الإسلامي'), 'Arabic refusal must redirect to Islamic topics');
console.log('✓ Polite scope refusals and redirection verified across Somali, English, and Arabic.');

// ============================================================================
// PART 2: MADHHAB-SPECIFIC AI RESPONSES TESTS
// ============================================================================
console.log('\n--- 5. Testing Madhhab System Instruction Generation ---');

// 5.1 Shafi'i Madhhab
const shafiiInstruction = buildMadhhabSystemInstruction('shafii', 'so');
assert.ok(shafiiInstruction.includes("SHAFI'I SCHOOL"), 'Should designate Shafi\'i school');
assert.ok(shafiiInstruction.includes('Minhaj at-Talibin') && shafiiInstruction.includes('Al-Majmu'), 'Should cite core Shafi\'i authorities');
assert.ok(shafiiInstruction.includes('skin-to-skin contact between non-mahram'), 'Should mandate Shafi\'i wudu ruling');
assert.ok(shafiiInstruction.includes('Basmalah is an obligatory explicit verse'), 'Should mandate Shafi\'i Fatihah ruling');
assert.ok(shafiiInstruction.includes('Qunut in the second Rak\'ah of Salat al-Fajr'), 'Should mandate Shafi\'i Fajr Qunut ruling');

// 5.2 Hanafi Madhhab
const hanafiInstruction = buildMadhhabSystemInstruction('hanafi', 'so');
assert.ok(hanafiInstruction.includes("HANAFI SCHOOL"), 'Should designate Hanafi school');
assert.ok(hanafiInstruction.includes('Zahir ar-Riwayah') || hanafiInstruction.includes('Al-Hidayah'), 'Should cite Hanafi authorities');
assert.ok(hanafiInstruction.includes('Touching women does NOT invalidate Wudu'), 'Should mandate Hanafi wudu ruling');
assert.ok(hanafiInstruction.includes('distinction between Fard and Wajib'), 'Should mandate Hanafi Fard vs Wajib ruling');
assert.ok(hanafiInstruction.includes('Monetary value equivalent (Qeemah)'), 'Should mandate Hanafi Zakat Qeemah ruling');

// 5.3 Maliki Madhhab
const malikiInstruction = buildMadhhabSystemInstruction('maliki', 'so');
assert.ok(malikiInstruction.includes("MALIKI SCHOOL"), 'Should designate Maliki school');
assert.ok(malikiInstruction.includes('Amal Ahl al-Madinah') || malikiInstruction.includes('Mukhtasar Khalil'), 'Should cite Maliki authorities');
assert.ok(malikiInstruction.includes('Sadl (releasing arms straight down'), 'Should mandate Maliki Sadl prayer posture');
assert.ok(malikiInstruction.includes('Touching women breaks Wudu ONLY if done with sexual pleasure'), 'Should mandate Maliki wudu ruling');

// 5.4 Hanbali Madhhab
const hanbaliInstruction = buildMadhhabSystemInstruction('hanbali', 'so');
assert.ok(hanbaliInstruction.includes("HANBALI SCHOOL"), 'Should designate Hanbali school');
assert.ok(hanbaliInstruction.includes('Zad al-Mustaqni') || hanbaliInstruction.includes('Al-Mughni'), 'Should cite Hanbali authorities');
assert.ok(hanbaliInstruction.includes('Eating camel meat unconditionally invalidates Wudu'), 'Should mandate Hanbali camel meat ruling');
assert.ok(hanbaliInstruction.includes('Tasbih in Ruku') && hanbaliInstruction.includes('Wajibat'), 'Should mandate Hanbali Wajibat rulings');

// 5.5 General / Consensus
const allInstruction = buildMadhhabSystemInstruction('all', 'so');
assert.ok(allInstruction.includes('GENERAL AHL AS-SUNNAH CONSENSUS & FOUR MADHHABS'), 'Should describe general consensus');
console.log('✓ All 4 Madhhab system instructions and general consensus verified.');

console.log('\n--- 6. Testing Effective School Resolution ---');
// Prompt explicitly mentions Shafi'i -> resolves shafii even if user prefers hanafi
assert.strictEqual(resolveEffectiveSchool('Sida uu qabo madhabka Shaaficiga, waa maxay xukunka?', undefined, 'hanafi'), 'shafii');
assert.strictEqual(resolveEffectiveSchool('According to the Hanafi school, what is the ruling on wudu?', undefined, 'shafii'), 'hanafi');
assert.strictEqual(resolveEffectiveSchool('What is the Maliki ruling on Sadl?', undefined, 'hanbali'), 'maliki');
assert.strictEqual(resolveEffectiveSchool('Sida uu qabo madhabka Xanbaliga ee cunista hilibka geela?', undefined, 'all'), 'hanbali');

// No prompt mention -> falls back to user preference
assert.strictEqual(resolveEffectiveSchool('Waa maxay shuruudaha salaadda?', undefined, 'shafii'), 'shafii');
assert.strictEqual(resolveEffectiveSchool('Waa maxay shuruudaha salaadda?', undefined, 'hanafi'), 'hanafi');
assert.strictEqual(resolveEffectiveSchool('Waa maxay shuruudaha salaadda?', undefined, 'maliki'), 'maliki');
assert.strictEqual(resolveEffectiveSchool('Waa maxay shuruudaha salaadda?', undefined, 'hanbali'), 'hanbali');
assert.strictEqual(resolveEffectiveSchool('Waa maxay shuruudaha salaadda?', undefined, 'all'), 'all');
console.log('✓ School preference resolution verified (prompt override and user preference fallback).');

console.log('\n--- 7. Verifying ChatContext.tsx passes preferred_school ---');
const chatContextContent = fs.readFileSync(path.resolve('src/context/ChatContext.tsx'), 'utf8');
assert.ok(chatContextContent.includes('userSettings.preferred_school'), 'ChatContext must read preferred_school from user settings');
assert.ok(chatContextContent.includes('schoolPreference,'), 'ChatContext must pass schoolPreference to generateIslamicResponse');
console.log('✓ ChatContext.tsx properly integrates userSettings.preferred_school.');

console.log('\n--- 8. Verifying Backend Server (server/index.mjs) Strict Filter & Madhhab Guidance ---');
const serverContent = fs.readFileSync(path.resolve('server/index.mjs'), 'utf8');
assert.ok(serverContent.includes('isIslamicServerQuery'), 'Server must enforce isIslamicServerQuery');
assert.ok(serverContent.includes('NON_ISLAMIC_SCOPE_MESSAGES'), 'Server must have polite non-Islamic refusal messages');
assert.ok(serverContent.includes('buildServerMadhhabInstruction'), 'Server must build Madhhab instruction');
assert.ok(serverContent.includes('school_preference'), 'Server must process school_preference');
console.log('✓ server/index.mjs enforces strict scope filter and Madhhab context.');

console.log('\n--- 9. Verifying Supabase Edge Function (chat-gemini) Strict Filter & Madhhab Guidance ---');
const edgeContent = fs.readFileSync(path.resolve('supabase/functions/chat-gemini/index.ts'), 'utf8');
assert.ok(edgeContent.includes('isEdgeIslamicQuery'), 'Edge function must enforce isEdgeIslamicQuery');
assert.ok(edgeContent.includes('buildEdgeMadhhabInstruction'), 'Edge function must build Madhhab instruction');
assert.ok(edgeContent.includes('school_preference'), 'Edge function must extract school_preference');
console.log('✓ supabase/functions/chat-gemini/index.ts enforces strict scope filter and Madhhab context.');

console.log('\n======================================================');
console.log('  ALL STRICT ISLAMIC SCOPE & MADHHAB TESTS PASSED! 🚀');
console.log('======================================================');
