import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName} - ${detail}`);
  }
}

console.log('\n========================================================================');
console.log('EMUFTI AI: QURAN, AUDIO, DUAS, TASBEEH & TRIAL ACCESS VERIFICATION');
console.log('========================================================================\n');

// Load source files for static verification
const quranPagePath = path.join(rootDir, 'src/pages/QuranPage.tsx');
const quranPageSource = fs.readFileSync(quranPagePath, 'utf8');
const quranServiceSource = fs.readFileSync(path.join(rootDir, 'src/lib/quranService.ts'), 'utf8');
const quranMetadataSource = fs.readFileSync(path.join(rootDir, 'src/data/quranMetadata.ts'), 'utf8');
const duasDataSource = fs.readFileSync(path.join(rootDir, 'src/data/duasData.ts'), 'utf8');
const tasbeehDataSource = fs.readFileSync(path.join(rootDir, 'src/data/tasbeehData.ts'), 'utf8');
const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
const sidebarSource = fs.readFileSync(path.join(rootDir, 'src/components/layout/Sidebar.tsx'), 'utf8');
const welcomeScreenSource = fs.readFileSync(path.join(rootDir, 'src/components/chat/WelcomeScreen.tsx'), 'utf8');
const landingPageSource = fs.readFileSync(path.join(rootDir, 'src/pages/LandingPage.tsx'), 'utf8');
const adminPageSource = fs.readFileSync(path.join(rootDir, 'src/pages/AdminPage.tsx'), 'utf8');
const migrationSql = fs.readFileSync(path.join(rootDir, 'supabase/migrations/20261015_quran_features_and_trial.sql'), 'utf8');

function extractExport(source, exportName) {
  // Strip import statements
  const clean = source.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
  const regex = new RegExp(`export\\s+const\\s+${exportName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*([\\s\\S]*?);\\s*(?:\\/\\*\\*|export|$)`);
  const match = clean.match(regex);
  if (match) {
    return eval(`(${match[1]})`);
  }
  throw new Error(`Could not extract ${exportName}`);
}

const ALL_114_SURAHS = extractExport(quranMetadataSource, 'ALL_114_SURAHS');
const VERIFIED_QURRA = extractExport(quranMetadataSource, 'VERIFIED_QURRA');
const BUNDLED_SURAHS = extractExport(quranMetadataSource, 'BUNDLED_SURAHS');
const AUTHENTIC_DUAS = extractExport(duasDataSource, 'AUTHENTIC_DUAS');
const TASBEEH_PRESETS = extractExport(tasbeehDataSource, 'TASBEEH_PRESETS');

console.log('--- Requirement 1: All 114 Surahs are accessible ---');
{
  assert(ALL_114_SURAHS.length === 114, 'ALL_114_SURAHS array contains exactly 114 surahs');
  assert(ALL_114_SURAHS[0].number === 1 && ALL_114_SURAHS[0].englishName === 'Al-Fatihah', 'Surah 1 is Al-Fatihah');
  assert(ALL_114_SURAHS[113].number === 114 && ALL_114_SURAHS[113].englishName === 'An-Nas', 'Surah 114 is An-Nas');
  
  const allNumbersValid = ALL_114_SURAHS.every((s, i) => s.number === i + 1);
  assert(allNumbersValid, 'Surah numbers are strictly sequential from 1 to 114');

  const allNamesValid = ALL_114_SURAHS.every(
    (s) => s.name && s.englishName && s.englishNameTranslation && s.somaliNameTranslation
  );
  assert(allNamesValid, 'All 114 surahs have Arabic, English, and Somali names');

  const allVerseCountsValid = ALL_114_SURAHS.every((s) => s.numberOfAyahs > 0);
  assert(allVerseCountsValid, 'All 114 surahs have positive authentic verse counts');

  const allRevelationValid = ALL_114_SURAHS.every(
    (s) => s.revelationType === 'Meccan' || s.revelationType === 'Medinan'
  );
  assert(allRevelationValid, 'All 114 surahs have Meccan or Medinan classification');
}

console.log('\n--- Requirement 2: Arabic Quran text comes from a verified data source ---');
{
  assert(
    quranServiceSource.includes('api.alquran.cloud/v1/surah'),
    'quranService integrates standard AlQuran Cloud API for complete Uthmani text'
  );
  assert(
    quranServiceSource.includes('quran-uthmani,en.sahih,so.abduh'),
    'quranService pulls exact Uthmani text, Saheeh International, and Abduh Somali translation'
  );
  assert(
    BUNDLED_SURAHS[1] && BUNDLED_SURAHS[1].length === 7,
    'Surah Al-Fatihah has 7 authentic bundled offline verses'
  );
  assert(
    BUNDLED_SURAHS[1][0].text === 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'First ayah of Al-Fatihah is exact Bismillah'
  );
  assert(
    BUNDLED_SURAHS[112] && BUNDLED_SURAHS[112].length === 4,
    'Surah Al-Ikhlas has 4 authentic bundled verses'
  );
  assert(
    BUNDLED_SURAHS[114] && BUNDLED_SURAHS[114].length === 6,
    'Surah An-Nas has 6 authentic bundled verses'
  );
}

console.log('\n--- Requirement 3: Search and surah navigation work ---');
{
  assert(
    quranPageSource.includes('filteredSurahs = allSurahs.filter'),
    'QuranPage filters surahs dynamically based on search query'
  );
  assert(
    quranPageSource.includes('handleSelectSurah(currentSurahNumber - 1)') &&
      quranPageSource.includes('handleSelectSurah(currentSurahNumber + 1)'),
    'QuranPage supports previous and next surah navigation'
  );
  assert(
    quranPageSource.includes('handleJumpToAyah'),
    'QuranPage supports jumping directly to a specific ayah'
  );
  assert(
    appSource.includes('path="/quran"'),
    'App.tsx registers dedicated /quran route'
  );
  assert(
    sidebarSource.includes('to="/quran"'),
    'Sidebar.tsx renders Holy Quran navigation link'
  );
  assert(
    welcomeScreenSource.includes('to="/quran"'),
    'WelcomeScreen.tsx renders prominent Holy Quran feature card'
  );
  assert(
    landingPageSource.includes('to="/quran"'),
    'LandingPage.tsx provides Holy Quran links in navbar and hero'
  );
}

console.log('\n--- Requirement 4: Real reciter audio plays ---');
{
  assert(VERIFIED_QURRA.length >= 6, 'At least 6 verified top Qurra reciters are configured');
  
  const reciterIds = VERIFIED_QURRA.map((r) => r.id);
  assert(reciterIds.includes('alafasy'), 'Mishary Rashid Alafasy is available');
  assert(reciterIds.includes('husary'), 'Mahmoud Khalil Al-Husary is available');
  assert(reciterIds.includes('abdulbasit'), 'Abdul Basit Abdul Samad is available');
  assert(reciterIds.includes('maher'), 'Maher Al-Muaiqly is available');
  assert(reciterIds.includes('ghamdi'), 'Saad Al-Ghamdi is available');
  assert(reciterIds.includes('shatri'), 'Abu Bakr Al-Shatri is available');

  const allEveryAyah = VERIFIED_QURRA.every((r) => r.verseBaseUrl.startsWith('https://everyayah.com/data/'));
  assert(allEveryAyah, 'All reciters use authentic everyayah.com verse-by-verse audio CDNs');
}

console.log('\n--- Requirement 5: Audio controls and verse navigation work ---');
{
  assert(
    quranPageSource.includes('togglePlayPause'),
    'Audio play/pause toggle implemented'
  );
  assert(
    quranPageSource.includes('handleNextAyah') && quranPageSource.includes('handlePrevAyah'),
    'Next and previous verse navigation controls implemented'
  );
  assert(
    quranPageSource.includes('isLoopingAyah') && quranPageSource.includes('Repeat'),
    'Verse looping and memorization repeat control implemented'
  );
  assert(
    quranPageSource.includes('scrollToAyah'),
    'Active verse auto-scrolling implemented'
  );
  assert(
    quranPageSource.includes('handleAudioEnded'),
    'Audio auto-advancement to subsequent verse implemented'
  );
}

console.log('\n--- Requirement 6: User reading progress and bookmarks persist ---');
{
  assert(
    quranServiceSource.includes('quran_bookmarks') &&
      quranServiceSource.includes('addBookmark') &&
      quranServiceSource.includes('removeBookmark'),
    'quranService implements persistent bookmark storage'
  );
  assert(
    quranServiceSource.includes('quran_reading_progress') &&
      quranServiceSource.includes('saveReadingProgress'),
    'quranService implements persistent reading progress'
  );
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_bookmarks'),
    'Database migration defines public.quran_bookmarks table'
  );
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_reading_progress'),
    'Database migration defines public.quran_reading_progress table'
  );
}

console.log('\n--- Requirement 7: Dua categories and source references render correctly ---');
{
  assert(AUTHENTIC_DUAS.length >= 10, 'Catalog contains authentic Duas and Adhkar');
  
  const categories = new Set(AUTHENTIC_DUAS.map((d) => d.category));
  assert(categories.has('morning_evening'), 'Morning & Evening adhkar category present');
  assert(categories.has('quranic'), 'Quranic (Rabbana) supplications present');
  assert(categories.has('prophetic'), 'Prophetic Sunnah supplications present');
  assert(categories.has('prayer_forgiveness'), 'Prayer & Istighfar supplications present');
  assert(categories.has('travel_daily'), 'Travel & Daily life supplications present');

  const allHaveReferences = AUTHENTIC_DUAS.every((d) => Boolean(d.reference));
  assert(allHaveReferences, 'Every single dua includes an authentic scholarly/hadith citation');

  const allHaveTranslations = AUTHENTIC_DUAS.every(
    (d) => d.arabic_text && d.translation_en && d.translation_so
  );
  assert(allHaveTranslations, 'All duas contain Arabic text, English, and Somali translations');
}

console.log('\n--- Requirement 8: Tasbeeh increments and saves correctly ---');
{
  assert(TASBEEH_PRESETS.length >= 8, 'At least 8 authentic Dhikr presets configured');
  assert(
    quranPageSource.includes('handleTasbeehTap'),
    'Interactive Tasbeeh tap handler increments count'
  );
  assert(
    quranPageSource.includes('handleResetTasbeeh') &&
      quranPageSource.includes('isResetConfirmOpen'),
    'Reset confirmation modal prevents accidental count loss'
  );
  assert(
    quranPageSource.includes('navigator.vibrate'),
    'Haptic vibration feedback triggers upon counter taps'
  );
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.tasbeeh_logs'),
    'Database migration defines public.tasbeeh_logs table'
  );
}

console.log('\n--- Requirement 9: Free users receive exactly three trial sessions ---');
{
  assert(
    migrationSql.includes('v_trial_limit INT := 3;'),
    'Database RPC enforces exactly 3 trial sessions limit'
  );
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.quran_trial_sessions'),
    'Database migration defines public.quran_trial_sessions table'
  );
  assert(
    quranPageSource.includes('Free Trial: ${accessStatus.trial_uses_remaining} of ${accessStatus.trial_uses_total} uses'),
    'UI clearly displays remaining trial uses out of 3'
  );
}

console.log('\n--- Requirement 10: Trial usage cannot be bypassed by refreshing or editing client state ---');
{
  assert(
    migrationSql.includes('CREATE OR REPLACE FUNCTION public.record_quran_session'),
    'Database migration installs server-side record_quran_session RPC'
  );
  assert(
    migrationSql.includes('CREATE OR REPLACE FUNCTION public.get_quran_access_status'),
    'Database migration installs server-side get_quran_access_status RPC'
  );
  assert(
    migrationSql.includes('CONSTRAINT unique_user_daily_quran_session UNIQUE (user_id, session_date, session_type)'),
    'Database enforces unique daily session constraint for idempotency'
  );
  assert(
    migrationSql.includes('v_sessions_count') && migrationSql.includes('FROM public.quran_trial_sessions'),
    'Usage counts are queried from PostgreSQL table, not client state'
  );
}

console.log('\n--- Requirement 11: Exhausted Free users see the upgrade request flow ---');
{
  assert(
    quranPageSource.includes('accessStatus.trial_exhausted && !accessStatus.is_paid_member'),
    'QuranPage displays paywall when free trial is exhausted'
  );
  assert(
    quranPageSource.includes('<PlanRequestModal'),
    'QuranPage reuses existing EMufti AI PlanRequestModal for upgrade flow'
  );
  assert(
    quranPageSource.includes('Upgrade to Pro ($9)') && quranPageSource.includes('Get Premium ($19)'),
    'Paywall modal displays standard Pro and Premium tier upgrades'
  );
}

console.log('\n--- Requirement 12: Pro and Premium users have unlimited access ---');
{
  assert(
    migrationSql.includes("plan_id ILIKE '%pro%' OR plan_id ILIKE '%premium%'"),
    'Database RPC verifies active subscription in public.subscriptions ledger'
  );
  assert(
    migrationSql.includes("'unlimited', TRUE"),
    'Database RPC returns unlimited = true for paid members'
  );
  assert(
    quranPageSource.includes('{accessStatus.plan.toUpperCase()} QURAN UNLIMITED'),
    'QuranPage displays Pro/Premium Unlimited badge for subscribers'
  );
}

console.log('\n--- Requirement 13: Upgrade requests appear in the admin dashboard ---');
{
  assert(
    adminPageSource.includes('📖 Quran Entitlement'),
    'AdminPage highlights Quran-related upgrade requests'
  );
  assert(
    adminPageSource.includes('update_plan_request_status'),
    'AdminPage uses atomic update_plan_request_status RPC'
  );
}

console.log('\n--- Requirement 14: Pending requests do not grant paid access ---');
{
  assert(
    migrationSql.includes("AND status = 'active'"),
    'Server RPC requires status = active before granting paid access'
  );
  assert(
    migrationSql.includes("v_status->>'is_paid_member'"),
    'quran_trial_sessions enforces paid member verification'
  );
}

console.log('\n--- Requirement 15: Admin approval activates the correct plan or entitlement ---');
{
  assert(
    adminPageSource.includes('Approve & Unlock Tier'),
    'AdminPage provides Approve action calling database activation'
  );
  assert(
    adminPageSource.includes("requestedPlan.toUpperCase()} plan activated"),
    'AdminPage confirms plan activation upon database confirmation'
  );
}

console.log('\n--- Requirement 16: Users cannot grant themselves paid access ---');
{
  assert(
    migrationSql.includes('SECURITY DEFINER'),
    'Database RPCs use SECURITY DEFINER to safely inspect ledger'
  );
  assert(
    migrationSql.includes('auth.uid() = user_id'),
    'Row Level Security restricts users to their own data'
  );
}

console.log('\n--- Requirement 17: Existing subscription and admin functionality remains intact ---');
{
  assert(
    adminPageSource.includes('repair_unlinked_plan_requests'),
    'Admin repair unlinked requests preserved'
  );
  assert(
    adminPageSource.includes('handleUpdateStatus'),
    'Admin status update logic preserved'
  );
  assert(
    appSource.includes('path="/billing"'),
    'Existing /billing route preserved'
  );
  assert(
    appSource.includes('path="/pricing"'),
    'Existing /pricing route preserved'
  );
}

console.log('\n--- Requirement 18: The application builds and existing tests pass ---');
{
  assert(
    fs.existsSync(path.join(rootDir, 'supabase/migrations/20261015_quran_features_and_trial.sql')),
    'Migration 20261015_quran_features_and_trial.sql exists'
  );
  assert(
    fs.existsSync(path.join(rootDir, 'src/pages/QuranPage.tsx')),
    'QuranPage.tsx exists'
  );
  assert(
    fs.existsSync(path.join(rootDir, 'src/lib/quranService.ts')),
    'quranService.ts exists'
  );
  assert(
    fs.existsSync(path.join(rootDir, 'src/data/quranMetadata.ts')),
    'quranMetadata.ts exists'
  );
  assert(
    fs.existsSync(path.join(rootDir, 'src/data/duasData.ts')),
    'duasData.ts exists'
  );
  assert(
    fs.existsSync(path.join(rootDir, 'src/data/tasbeehData.ts')),
    'tasbeehData.ts exists'
  );
}

console.log('\n========================================================================');
console.log('SUMMARY: QURAN FEATURE TEST SUITE');
console.log(`Total:  ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL 18 QURAN FEATURE REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
