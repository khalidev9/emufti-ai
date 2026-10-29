import assert from 'node:assert/strict';
import { resolveCuratedKnowledgeKey, CURATED_ISLAMIC_KNOWLEDGE } from '../src/lib/curatedIslamicKnowledge.ts';
import { retrieveIslamicSources, synthesizeSubstantiveResponse } from '../src/lib/islamicKnowledgeEngine.ts';
import { generateIslamicResponse } from '../src/lib/gemini.ts';

console.log('=== RUNNING SUGGESTION CHIPS & DYNAMIC RESPONSES TEST SUITE ===\n');

// 1. Test the 12 Suggestion Chips from MessageComposer.tsx
const SUGGESTION_CHIPS = [
  {
    label: 'Tafsiirka Suurat Al-Mulk',
    prompt: "Tafsiirka Suurat Al-Mulk: maxay tahay dulucdeeda guud iyo faa'iidada ay u leedahay qabriga?",
    expectedKey: 'tafsir_al_mulk',
    expectedTopic: 'tafsir_al_mulk_grave_protection'
  },
  {
    label: 'Aayat Al-Kursi',
    prompt: 'Fasiraadda Aayat Al-Kursi iyo fadliga weyn ee ay leedahay.',
    expectedKey: 'tafsir_ayat_al_kursi',
    expectedTopic: 'tafsir_ayat_al_kursi_verse'
  },
  {
    label: 'Suurat Al-Ikhlaas',
    prompt: "Dulucda iyo macnaha Suurat Al-Ikhlaas iyo sababta ay ugu dhiganto 1/3 Qur'aanka.",
    expectedKey: 'tafsir_al_ikhlas',
    expectedTopic: 'tafsir_al_ikhlas_monotheism'
  },
  {
    label: 'Xadiiska 1-aad Nawawi',
    prompt: 'Sharaxaadda Xadiiska 1-aad ee Arbaciinka Nawawi: Camallada iyo Niyadda.',
    expectedKey: 'hadith_nawawi_1',
    expectedTopic: 'hadith_nawawi_first_intentions'
  },
  {
    label: 'Daryeelka Waalidiinta',
    prompt: 'Xadiisyada Nabiga ﷺ ee ku saabsan wanaag-falka iyo daryeelka waalidiinta.',
    expectedKey: 'hadith_parents',
    expectedTopic: 'rights_and_care_of_parents'
  },
  {
    label: 'Akhlaaqda iyo Naxariista',
    prompt: 'Akhlaaqda suubban iyo naxariista guud sida uu Nabigu ﷺ inoo baray.',
    expectedKey: 'hadith_akhlaaq',
    expectedTopic: 'akhlaaq_and_mercy_prophetic'
  },
  {
    label: 'Shuruudaha iyo Tiirarka Salaadda',
    prompt: 'Shuruudaha, tiirarka, iyo waajibaadka Salaadda: sidee loo kala saaraa?',
    expectedKey: 'prayer_conditions_and_pillars',
    expectedTopic: 'prayer_shurut_arkan_wajibat'
  },
  {
    label: 'Xisaabinta Zakada & Nisaabka',
    prompt: 'Sidee loo xisaabiyaa Zakada hantida keydka ah iyo xaddiga Nisaabka?',
    expectedKey: 'zakat_calculation',
    expectedTopic: 'zakat_calculation_savings_nisab'
  },
  {
    label: 'Buriyaasha Soonka',
    prompt: 'Waxyaabaha buriya soonka iyo axkaamta qofka si hilmaan ah wax u cuna.',
    expectedKey: 'fasting_nullifiers',
    expectedTopic: 'fasting_nullifiers_and_invalidation'
  },
  {
    label: 'Adkaarta Subaxda & Galabta',
    prompt: 'Adkaarta subaxda iyo galabta ee sugan iyo fadligooda.',
    expectedKey: 'adhkar_morning_evening',
    expectedTopic: 'authentic_morning_evening_adhkar'
  },
  {
    label: 'Ducooyinka Murugada & Culeyska',
    prompt: 'Ducooyinka Nabiga ﷺ ku duceysan jiray marka murugto ama culeys soo wajaho.',
    expectedKey: 'dua_grief_distress',
    expectedTopic: 'dua_for_grief_and_distress'
  },
  {
    label: 'Sayyidul Istiqfaar',
    prompt: 'Sayyidul Istiqfaar: ducada ugu fadliga badan dambi-dhaaf-weydiisiga.',
    expectedKey: 'sayyidul_istighfar',
    expectedTopic: 'sayyidul_istighfar_master_prayer'
  }
];

// 2. Test WelcomeScreen Quick Cards
const WELCOME_CARDS = [
  {
    label: 'Sidee loo tukadaa',
    prompt: 'Sidee loo tukadaa salaadda si sax ah?',
    expectedKey: 'how_to_pray_salah'
  },
  {
    label: 'Suuratul Faatixa',
    prompt: 'Fasiraadda Suuratul Al-Faatixa iyo macnaheeda',
    expectedKey: 'tafsir_al_fatiha'
  },
  {
    label: 'Waxyaabaha buriya weesada',
    prompt: 'Maxay yihiin waxyaabaha buriya weesada?',
    expectedKey: 'wudu_nullifiers'
  },
  {
    label: 'Xisaabinta Sakada',
    prompt: 'Sidee loo xisaabiyaa sakada xoolaha iyo lacagta?',
    expectedKey: 'zakat_calculation'
  }
];

console.log('--- TEST 1: Key Resolver Precision on Suggestion Chips ---');
for (const chip of SUGGESTION_CHIPS) {
  const key = resolveCuratedKnowledgeKey(chip.prompt);
  assert.equal(key, chip.expectedKey, `Expected "${chip.prompt}" to resolve to ${chip.expectedKey}, but got ${key}`);
  console.log(`[PASS] Chip "${chip.label}" -> ${key}`);
}

console.log('\n--- TEST 2: Key Resolver Precision on Welcome Cards ---');
for (const card of WELCOME_CARDS) {
  const key = resolveCuratedKnowledgeKey(card.prompt);
  assert.equal(key, chipToKey(card.expectedKey, key), `Expected "${card.prompt}" to resolve to ${card.expectedKey}, but got ${key}`);
  console.log(`[PASS] Welcome Card "${card.label}" -> ${key}`);
}

function chipToKey(expected, actual) {
  return expected;
}

console.log('\n--- TEST 3: Knowledge Base Completeness & Multi-Language Quality ---');
for (const [key, content] of Object.entries(CURATED_ISLAMIC_KNOWLEDGE)) {
  assert.ok(content.so && content.so.length > 200, `Topic ${key} must have comprehensive Somali content`);
  assert.ok(content.en && content.en.length > 200, `Topic ${key} must have comprehensive English content`);
  assert.ok(content.ar && content.ar.length > 200, `Topic ${key} must have comprehensive Arabic content`);
  
  // Verify zero generic boilerplate
  assert.ok(!content.so.includes('Fasiraad buuxda lama hayo'), `Topic ${key} must not contain generic fallback placeholder`);
  assert.ok(!content.en.includes('generic placeholder'), `Topic ${key} must not contain generic placeholder`);
  console.log(`[PASS] Topic "${key}" has verified content in SO (${content.so.length} chars), EN (${content.en.length} chars), AR (${content.ar.length} chars)`);
}

console.log('\n--- TEST 4: Dynamic Responses for Suggestion Chips via generateIslamicResponse ---');
async function testDynamicResponses() {
  for (const chip of SUGGESTION_CHIPS) {
    const res = await generateIslamicResponse({
      prompt: chip.prompt,
      targetLanguage: 'so'
    });
    
    assert.ok(res.content && res.content.length > 300, `Response for "${chip.prompt}" must be substantive`);
    // Check that response is specific to the chip's topic
    if (chip.expectedKey === 'tafsir_al_mulk') {
      assert.ok(res.content.includes('Mulk') || res.content.includes('Tabaarak') || res.content.includes('qabriga'), 'Al-Mulk response must cite Al-Mulk / Qabriga');
    }
    if (chip.expectedKey === 'tafsir_ayat_al_kursi') {
      assert.ok(res.content.includes('Kursi') || res.content.includes('255') || res.content.includes('Xayy'), 'Ayat al-Kursi response must cite Kursi');
    }
    if (chip.expectedKey === 'hadith_nawawi_1') {
      assert.ok(res.content.includes('Niyad') || res.content.includes('Cumar') || res.content.includes('Camallada'), 'Hadith 1 Nawawi response must cite Niyad');
    }
    if (chip.expectedKey === 'sayyidul_istighfar') {
      assert.ok(res.content.includes('Sayyid') || res.content.includes('Istiqfaar') || res.content.includes('خَلَقْتَنِي'), 'Sayyidul Istighfar response must cite the master prayer');
    }
    
    console.log(`[PASS] generateIslamicResponse("${chip.label}") returned ${res.content.length} chars [model: ${res.model}]`);
  }
}

testDynamicResponses().then(() => {
  console.log('\n=== ALL SUGGESTION CHIP DYNAMIC RESPONSE TESTS PASSED (100%) ===');
}).catch((err) => {
  console.error('\nFAILED TEST:', err);
  process.exit(1);
});
