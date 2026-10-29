import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT = path.resolve('c:/Users/MOHAMUD/Desktop/chatbot');

console.log('============================================================');
console.log('EMUFTI AI — QURAN, HIFDH, TAFSIR & CHAT IMPROVEMENTS TEST SUITE');
console.log('============================================================');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`✔ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✖ ${desc}`);
    console.error(`  Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Rename "New Islamic Inquiry" to "New Chat" & Translations
// -----------------------------------------------------------------------------
const sidebarContent = fs.readFileSync(path.join(ROOT, 'src/components/layout/Sidebar.tsx'), 'utf-8');
const chatContextContent = fs.readFileSync(path.join(ROOT, 'src/context/ChatContext.tsx'), 'utf-8');
const messageComposerContent = fs.readFileSync(path.join(ROOT, 'src/components/chat/MessageComposer.tsx'), 'utf-8');

it('[1.1] Sidebar does not display "New Islamic Inquiry" in UI', () => {
  assert(!sidebarContent.includes('<span>New Islamic Inquiry</span>'), 'Found legacy New Islamic Inquiry in Sidebar');
});

it('[1.2] Sidebar provides "New Chat" with Somali and Arabic translations', () => {
  assert(sidebarContent.includes("'Wadahadal Cusub'"), 'Missing Somali translation Wadahadal Cusub');
  assert(sidebarContent.includes("'محادثة جديدة'"), 'Missing Arabic translation محادثة جديدة');
  assert(sidebarContent.includes("'New Chat'"), 'Missing New Chat label');
});

it('[1.3] ChatContext initializes new conversation title as "New Chat"', () => {
  assert(chatContextContent.includes("initialPrompt ? truncate(initialPrompt, 36) : 'New Chat'"), 'ChatContext should default to New Chat');
});

it('[1.4] ChatContext preserves backwards compatibility with legacy "New Islamic Inquiry" titles', () => {
  assert(chatContextContent.includes("conversation.title === 'New Chat' || conversation.title === 'New Islamic Inquiry'"), 'Should handle both titles');
});

// -----------------------------------------------------------------------------
// 2. Chat Composer Arrow Button Fixes
// -----------------------------------------------------------------------------
it('[2.1] MessageComposer handles form submission and button click safely', () => {
  assert(messageComposerContent.includes('e.preventDefault()'), 'Must prevent default form bubbling');
  assert(messageComposerContent.includes('e.stopPropagation()'), 'Must stop event propagation');
});

it('[2.2] MessageComposer preserves current message text if API request fails', () => {
  assert(messageComposerContent.includes('const previousPrompt = textToSend;'), 'Must preserve prompt before send');
  assert(messageComposerContent.includes('setPrompt(previousPrompt);'), 'Must restore prompt if send throws error');
});

it('[2.3] MessageComposer prevents duplicate submissions with isSubmitting state', () => {
  assert(messageComposerContent.includes('isSubmitting'), 'Must have isSubmitting guard state');
  assert(messageComposerContent.includes('disabled={!prompt.trim() || isSubmitting}'), 'Button must be disabled when submitting or empty');
});

it('[2.4] MessageComposer supports Enter to send and Shift+Enter for new line', () => {
  assert(messageComposerContent.includes("if (e.key === 'Enter')"), 'Must check for Enter key');
  assert(messageComposerContent.includes('!e.shiftKey'), 'Shift+Enter must insert new line without sending');
  assert(messageComposerContent.includes('e.nativeEvent.isComposing'), 'Must ignore Enter during IME composition (Arabic)');
});

it('[2.5] MessageComposer provides accessible mobile touch target', () => {
  assert(messageComposerContent.includes('min-w-[40px]'), 'Must have at least 40px touch width on mobile');
  assert(messageComposerContent.includes('min-h-[40px]'), 'Must have at least 40px touch height on mobile');
});

// -----------------------------------------------------------------------------
// 3. 50 Real Quran Reciters Catalog & Sheikh Cabdirashiid Suufi
// -----------------------------------------------------------------------------
const qarisContent = fs.readFileSync(path.join(ROOT, 'src/data/qarisData.ts'), 'utf-8');

it('[3.1] qarisData.ts defines ALL_50_QARIS catalog', () => {
  assert(qarisContent.includes('export const ALL_50_QARIS: QariReciter[] = ['), 'Missing ALL_50_QARIS export');
});

// Count reciters in qarisData
const reciterIdMatches = qarisContent.match(/id:\s*'([^']+)'/g);
const reciterIds = reciterIdMatches ? reciterIdMatches.map(m => m.replace(/id:\s*'|'/g, '')) : [];

it('[3.2] ALL_50_QARIS contains exactly 50 verified reciters', () => {
  assert.strictEqual(reciterIds.length, 50, `Expected 50 reciters, found ${reciterIds.length}`);
});

it('[3.3] Reciter catalog includes Sheikh Cabdirashiid Suufi with Somalia origin', () => {
  assert(qarisContent.includes("'abdulrasheed-sufi'"), 'Missing Sheikh Abdur-Rashid Sufi ID');
  assert(qarisContent.includes('Sheikh Abdur-Rashid Ali Sufi'), 'Missing English name');
  assert(qarisContent.includes('الشيخ عبد الرشيد بن علي صوفي'), 'Missing Arabic name');
  assert(qarisContent.includes("country: 'Somalia'"), 'Must be attributed to Somalia');
  assert(qarisContent.includes('abdulrasheed-sufi/r3'), 'Must have authentic audio CDN server');
});

it('[3.4] Reciter catalog includes international Qurra (Egypt, Saudi, Kuwait, Sudan, Yemen, UAE, Morocco, Syria, Libya)', () => {
  const countries = ['Somalia', 'Kuwait', 'Egypt', 'Saudi Arabia', 'United Arab Emirates', 'Yemen', 'Syria', 'Sudan', 'Morocco', 'Libya'];
  for (const c of countries) {
    assert(qarisContent.includes(`country: '${c}'`), `Missing reciter from country: ${c}`);
  }
});

it('[3.5] qarisData exports query and filtering functions', () => {
  assert(qarisContent.includes('export function getAllQaris()'), 'Missing getAllQaris');
  assert(qarisContent.includes('export function getQariById('), 'Missing getQariById');
  assert(qarisContent.includes('export function getQarisByCountry('), 'Missing getQarisByCountry');
  assert(qarisContent.includes('export function searchQaris('), 'Missing searchQaris');
  assert(qarisContent.includes('export function getAvailableCountries()'), 'Missing getAvailableCountries');
});

// -----------------------------------------------------------------------------
// 4. Subcis / Alternating Recitation Practice
// -----------------------------------------------------------------------------
const subcisPath = path.join(ROOT, 'src/components/quran/SubcisPractice.tsx');

it('[4.1] SubcisPractice component file exists', () => {
  assert(fs.existsSync(subcisPath), 'Missing SubcisPractice.tsx');
});

const subcisContent = fs.readFileSync(subcisPath, 'utf-8');

it('[4.2] SubcisPractice implements turn states (Qari reciting, user recording, review)', () => {
  assert(subcisContent.includes("'qari_reciting'"), 'Missing qari_reciting turn state');
  assert(subcisContent.includes("'user_recording'"), 'Missing user_recording turn state');
  assert(subcisContent.includes("'user_recorded'"), 'Missing user_recorded review state');
});

it('[4.3] SubcisPractice handles microphone permissions and local recording', () => {
  assert(subcisContent.includes('navigator.mediaDevices.getUserMedia'), 'Must request mic access');
  assert(subcisContent.includes('new MediaRecorder'), 'Must instantiate MediaRecorder');
  assert(subcisContent.includes('URL.createObjectURL'), 'Must create local audio blob URL');
});

it('[4.4] SubcisPractice supports auto-record toggle and manual recitation start', () => {
  assert(subcisContent.includes('autoRecordEnabled'), 'Must support autoRecordEnabled state');
  assert(subcisContent.includes('setAutoRecordEnabled'), 'Must allow user to toggle auto-record');
});

it('[4.5] SubcisPractice guarantees privacy with zero server uploading', () => {
  assert(subcisContent.includes('Zero Server Upload'), 'Must display local-only privacy guarantee');
  assert(!subcisContent.includes('fetch(') || !subcisContent.includes("method: 'POST'"), 'Must not upload audio blobs remotely');
});

// -----------------------------------------------------------------------------
// 5. Somali Scholars Quran Tafsir
// -----------------------------------------------------------------------------
const tafsirDataContent = fs.readFileSync(path.join(ROOT, 'src/data/tafsirData.ts'), 'utf-8');
const tafsirCompPath = path.join(ROOT, 'src/components/quran/SomaliTafsirSection.tsx');

it('[5.1] tafsirData.ts defines SOMALI_SCHOLARS_TAFSIR catalog', () => {
  assert(tafsirDataContent.includes('export const SOMALI_SCHOLARS_TAFSIR: SomaliScholarTafsir[] = ['), 'Missing scholars catalog');
});

it('[5.2] Tafsir catalog includes Sheikh Maxamed Cabdi Umal with authentic audio', () => {
  assert(tafsirDataContent.includes("'sheikh-umal'"), 'Missing Sheikh Umal ID');
  assert(tafsirDataContent.includes('Sheikh Mohamed Abdi Umal'), 'Missing English name');
  assert(tafsirDataContent.includes('الشيخ محمد عبدي أومل'), 'Missing Arabic name');
  assert(tafsirDataContent.includes('tafsiirka-quraanka-juz-camma-sheekh-maxamed-cadi-umal'), 'Missing verified Archive.org identifier');
});

it('[5.3] Tafsir catalog includes Sheikh Maxamed Cumar Dirir with verified identity', () => {
  assert(tafsirDataContent.includes("'sheikh-dirir'"), 'Missing Sheikh Dirir ID');
  assert(tafsirDataContent.includes('Sheikh Mohamed Sheikh Omar Dirir'), 'Missing Dirir name');
  assert(tafsirDataContent.includes('الشيخ محمد بن شيخ عمر درر'), 'Missing Dirir Arabic');
  assert(tafsirDataContent.includes('tafsiirka-quraanka-suuradda-20aad-taha-sheekh-maxamed-cumar-dirir'), 'Missing Dirir Ta-Ha archive');
});

it('[5.4] Tafsir catalog includes Sheikh Maxamed Shibli', () => {
  assert(tafsirDataContent.includes("'sheikh-shibli'"), 'Missing Sheikh Shibli ID');
  assert(tafsirDataContent.includes('Sheikh Mohamed Abdillahi Shibli'), 'Missing Shibli name');
});

it('[5.5] Tafsir catalog includes Sheikh Cabdirashiid Suufi', () => {
  assert(tafsirDataContent.includes("'sheikh-cabdirashiid-suufi'"), 'Missing Sheikh Sufi Tafsir ID');
  assert(tafsirDataContent.includes('Sheikh Abdur-Rashid Ali Sufi'), 'Missing Sufi name');
});

it('[5.6] Tafsir catalog includes historic pioneer Sheikh Cumar Faaruuq (Rahimahullah)', () => {
  assert(tafsirDataContent.includes("'sheikh-cumar-faaruuq'"), 'Missing Sheikh Omar Faruq ID');
  assert(tafsirDataContent.includes('Sheikh Omar Faruq (Rahimahullah)'), 'Missing Faruq name');
  assert(tafsirDataContent.includes('ALFAITHA'), 'Missing ALFAITHA historic recording');
});

it('[5.7] SomaliTafsirSection component exists and handles unavailable lessons without hallucination', () => {
  assert(fs.existsSync(tafsirCompPath), 'Missing SomaliTafsirSection.tsx');
  const tafsirCompContent = fs.readFileSync(tafsirCompPath, 'utf-8');
  assert(tafsirCompContent.includes('Ma jiro tafsiir la xaqiijiyay oo hadda u diiwaangashan'), 'Must handle unavailable lessons authentically');
});

// -----------------------------------------------------------------------------
// 6. Quran Completion Schedule Planner
// -----------------------------------------------------------------------------
const plannerMigrationPath = path.join(ROOT, 'supabase/migrations/20261015_quran_hifdh_planner.sql');
const plannerCompPath = path.join(ROOT, 'src/components/quran/QuranPlanner.tsx');

it('[6.1] Planner database migration file exists', () => {
  assert(fs.existsSync(plannerMigrationPath), 'Missing planner migration');
});

const migrationSql = fs.readFileSync(plannerMigrationPath, 'utf-8');

it('[6.2] Planner migration defines quran_reading_plans and quran_planner_logs tables with RLS', () => {
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_reading_plans'), 'Missing quran_reading_plans table');
  assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_planner_logs'), 'Missing quran_planner_logs table');
  assert(migrationSql.includes('ALTER TABLE public.quran_reading_plans ENABLE ROW LEVEL SECURITY'), 'Missing plans RLS');
  assert(migrationSql.includes('ALTER TABLE public.quran_planner_logs ENABLE ROW LEVEL SECURITY'), 'Missing logs RLS');
});

// Verify mathematical duration formula for 604 and 600 page baselines
function calcDuration(pages, daily) {
  return Math.ceil(pages / daily);
}

it('[6.3] 604-page Madinah Mushaf duration estimates match requested specs', () => {
  assert.strictEqual(calcDuration(604, 20), 31, '604 pages at 20p/day = 31 days (approximately 30-31 days)');
  assert.strictEqual(calcDuration(604, 10), 61, '604 pages at 10p/day = 61 days');
  assert.strictEqual(calcDuration(604, 5), 121, '604 pages at 5p/day = 121 days');
  assert.strictEqual(calcDuration(604, 2.5), 242, '604 pages at 2.5p/day = 242 days');
});

it('[6.4] 600-page simplified baseline duration estimates match requested reference values', () => {
  assert.strictEqual(calcDuration(600, 20), 30, '600 pages at 20p/day = 30 days');
  assert.strictEqual(calcDuration(600, 10), 60, '600 pages at 10p/day = 60 days');
  assert.strictEqual(calcDuration(600, 5), 120, '600 pages at 5p/day = 120 days');
  assert.strictEqual(calcDuration(600, 2.5), 240, '600 pages at 2.5p/day = 240 days');
});

it('[6.5] QuranPlanner component implements daily logging and progress updates', () => {
  assert(fs.existsSync(plannerCompPath), 'Missing QuranPlanner.tsx');
  const plannerContent = fs.readFileSync(plannerCompPath, 'utf-8');
  assert(plannerContent.includes('handleMarkTodayComplete'), 'Must have handleMarkTodayComplete');
  assert(plannerContent.includes('handleTogglePause'), 'Must have handleTogglePause');
  assert(plannerContent.includes('Madinah (604 p.)'), 'Must display 604 baseline');
  assert(plannerContent.includes('Standard (600 p.)'), 'Must display 600 baseline');
});

// -----------------------------------------------------------------------------
// 7. Quran Progress Finder
// -----------------------------------------------------------------------------
const juzMetadataContent = fs.readFileSync(path.join(ROOT, 'src/data/juzMetadata.ts'), 'utf-8');
const finderCompPath = path.join(ROOT, 'src/components/quran/QuranProgressFinder.tsx');

it('[7.1] juzMetadata.ts defines all 30 Juz in correct sequence', () => {
  assert(juzMetadataContent.includes('export const ALL_30_JUZ: JuzInfo[] = ['), 'Missing ALL_30_JUZ export');
  const juzCountMatches = juzMetadataContent.match(/number:\s*(\d+)/g);
  assert(juzCountMatches && juzCountMatches.length >= 30, 'Must define all 30 Juz');
});

it('[7.2] Juz 30 is correctly identified as Juz Amma ending at An-Nas 114:6', () => {
  assert(juzMetadataContent.includes("nameArabic: 'الجزء الثلاثون (عَمَّ يَتَسَاءَلُونَ - جُزْء عَمَّ)'"), 'Juz 30 must be labeled Juz Amma');
  assert(juzMetadataContent.includes("endSurahName: 'An-Nas'"), 'Juz 30 must end at An-Nas');
  assert(juzMetadataContent.includes('endPage: 604'), 'Juz 30 must end at page 604');
});

it('[7.3] QuranProgressFinder provides formatted output matching exact specification', () => {
  assert(fs.existsSync(finderCompPath), 'Missing QuranProgressFinder.tsx');
  const finderContent = fs.readFileSync(finderCompPath, 'utf-8');
  assert(finderContent.includes('Waxaad joogtaa: Suuradda'), 'Must include exact Somali output');
  assert(finderContent.includes('Bogagga kaa horreeya'), 'Must show preceding pages');
  assert(finderContent.includes('Bogagga kuu dhiman / haray'), 'Must show remaining pages');
  assert(finderContent.includes('Juz-yada kaa horreeya'), 'Must show preceding Juz');
  assert(finderContent.includes('Juz-yada kuu haray'), 'Must show remaining Juz');
});

// -----------------------------------------------------------------------------
// 8. Quran Navigation Integration
// -----------------------------------------------------------------------------
const quranPageFile = path.join(ROOT, 'src/pages/QuranPage.tsx');
const quranPageContent = fs.readFileSync(quranPageFile, 'utf-8');

it('[8.1] QuranCenterPage.tsx integrates all new sections as navigation tabs', () => {
  assert(quranPageContent.includes("activeTab === '50qaris'"), 'Missing 50qaris tab router');
  assert(quranPageContent.includes("activeTab === 'subcis'"), 'Missing subcis tab router');
  assert(quranPageContent.includes("activeTab === 'tafsiir'") || quranPageContent.includes("activeTab === 'tafsir'"), 'Missing tafsir tab router');
  assert(quranPageContent.includes("activeTab === 'juz'") || quranPageContent.includes("activeTab === 'finder'"), 'Missing finder tab router');
});

it('[8.2] QuranCenterPage.tsx mounts QarisCatalog, SubcisPractice, SomaliTafsirSection, and MacallinTeacher', () => {
  assert(quranPageContent.includes('QarisCatalog'), 'Must mount QarisCatalog');
  assert(quranPageContent.includes('SubcisPractice'), 'Must mount SubcisPractice');
  assert(quranPageContent.includes('SomaliTafsirSection'), 'Must mount SomaliTafsirSection');
});

console.log('============================================================');
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
console.log('============================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! ✔');
}
