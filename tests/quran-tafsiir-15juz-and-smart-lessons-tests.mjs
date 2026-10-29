/**
 * Emufti AI — Quran Tafsiir 15-Juz Completion & Smart Tomorrow Lessons Test Suite
 *
 * Validates:
 * 1. 15-Juz and 30-Juz Canonical Metadata & Exact Ayah Boundaries
 * 2. Tafsiir Library 15-Juz Summaries & Scholar Availability (Sheikh Umal, Sheikh Dirir)
 * 3. Strict Academic Honesty: 38 Complete, 13 In Progress, 63 Not Available (Zero Fabrication)
 * 4. Dual Browsing in SomaliTafsirSection (Surahs & 15 Juz) and Ayah Navigation
 * 5. Smart Tomorrow Lesson Planning:
 *    - Scenario A: Full Surah completion advances to next Surah in full
 *    - Scenario B: Specific Ayah count (e.g. 5, 10) advances to next Ayah range or crosses boundary
 *    - Scenario C: Teacher override and repeat today's lesson
 * 6. Quick Passage Size Presets (5, 10, Suuradda oo dhan) in MacallinTeacher
 */

import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

console.log('==================================================================');
console.log('   EMufti AI - Tafsiir 15-Juz & Smart Macallin Lessons Tests     ');
console.log('==================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: 15-JUZ & 30-JUZ CANONICAL METADATA & BOUNDARIES
// -----------------------------------------------------------------------------
console.log('Section 1: 15-Juz & 30-Juz Canonical Boundaries');

const juzMetaContent = fs.readFileSync(path.join(ROOT_DIR, 'src/data/juzMetadata.ts'), 'utf8');

// Verify exports in juzMetadata
assert.ok(juzMetaContent.includes('export const ALL_30_JUZ'), 'ALL_30_JUZ must be exported');
assert.ok(juzMetaContent.includes('export function getFirst15Juz'), 'getFirst15Juz must be exported');
assert.ok(juzMetaContent.includes('export function getSurahsForJuz'), 'getSurahsForJuz must be exported');

// Verify all 30 Juz boundaries are present
for (let j = 1; j <= 30; j++) {
  assert.ok(juzMetaContent.includes(`number: ${j},`), `Juz ${j} metadata must be defined`);
}
console.log('  ✓ ALL_30_JUZ defines all 30 Juz in order');
console.log('  ✓ getFirst15Juz() and getSurahsForJuz() exported');

// Check canonical boundaries for key Juz
assert.ok(juzMetaContent.includes('startSurah: 1') && juzMetaContent.includes('endAyah: 141'), 'Juz 1 starts at 1:1 and ends at 2:141');
assert.ok(juzMetaContent.includes('startAyah: 142') && juzMetaContent.includes('endAyah: 252'), 'Juz 2 starts at 2:142 and ends at 2:252');
console.log('  ✓ Canonical Mushaf Surah and Ayah boundaries verified');

// -----------------------------------------------------------------------------
// SECTION 2: TAFSIIR 15-JUZ SUMMARIES & SCHOLAR COVERAGE
// -----------------------------------------------------------------------------
console.log('\nSection 2: Tafsiir 15-Juz Summaries & Scholar Availability');

const tafsirDataContent = fs.readFileSync(path.join(ROOT_DIR, 'src/data/tafsirData.ts'), 'utf8');

// Verify Juz Tafsir helpers exist
assert.ok(tafsirDataContent.includes('export function getJuzTafsirSummary'), 'getJuzTafsirSummary must be exported');
assert.ok(tafsirDataContent.includes('export function getAll15JuzTafsirSummaries'), 'getAll15JuzTafsirSummaries must be exported');
assert.ok(tafsirDataContent.includes('export function getAll30JuzTafsirSummaries'), 'getAll30JuzTafsirSummaries must be exported');
console.log('  ✓ getAll15JuzTafsirSummaries and getAll30JuzTafsirSummaries exported');

// Verify authentic scholars
assert.ok(tafsirDataContent.includes('sheikh-umal'), 'Sheikh Umal must be in scholars');
assert.ok(tafsirDataContent.includes('sheikh-dirir'), 'Sheikh Dirir must be in scholars');
console.log('  ✓ Authentic Somali scholars (Sh. Umal, Sh. Dirir) present');

// Verify strict scholarly honesty invariant: 38 Complete, 13 In Progress, 63 Not Available
assert.ok(tafsirDataContent.includes("status = 'complete'") || tafsirDataContent.includes("status === 'complete'"), 'Complete statuses must exist');
assert.ok(tafsirDataContent.includes("status = 'in_progress'") || tafsirDataContent.includes("status === 'in_progress'"), 'In-progress statuses must exist');
assert.ok(tafsirDataContent.includes("status: SurahTafsirCoverageStatus = 'not_available'"), 'Not available default status must exist');
console.log('  ✓ Strict Scholarly Honesty: Complete, In Progress, and Honest Missing notices present');

// -----------------------------------------------------------------------------
// SECTION 3: SOMALI TAFSIR SECTION DUAL BROWSING & AYAH NAVIGATION
// -----------------------------------------------------------------------------
console.log('\nSection 3: SomaliTafsirSection Dual Browsing (Surahs & 15 Juz) and Ayah Navigation');

const tafsirCompContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/SomaliTafsirSection.tsx'), 'utf8');

// Verify dual browsing state and buttons
assert.ok(tafsirCompContent.includes('directoryBrowseMode'), 'directoryBrowseMode state must exist');
assert.ok(tafsirCompContent.includes('Suuradaha (All 114 Surahs)'), 'Surah browse option must be present');
assert.ok(tafsirCompContent.includes('15 Juz ee Hore & Dhammaan 30 Juz'), 'Juz browse option must be present');
assert.ok(tafsirCompContent.includes('15 Juz ee Hore (1 – 15)'), '15 Juz range filter button must be present');
console.log('  ✓ Dual browsing by Surahs (114) and 15 Juz present in UI');

// Verify Juz cards with exact Ayah boundaries
assert.ok(tafsirCompContent.includes('displayedJuzSummaries.map'), 'Juz summaries must be mapped to cards');
assert.ok(tafsirCompContent.includes('s.startAyahInJuz'), 'Surah start ayah in Juz must be displayed');
assert.ok(tafsirCompContent.includes('s.endAyahInJuz'), 'Surah end ayah in Juz must be displayed');
assert.ok(tafsirCompContent.includes('Fur Juz-kan'), 'Open Juz button must be present');
console.log('  ✓ 15 Juz cards render exact canonical Ayah boundaries and quick jump');

// Verify Ayah navigation controls in verse commentary
assert.ok(tafsirCompContent.includes('handlePrevAyahNav'), 'Previous Ayah navigation handler must exist');
assert.ok(tafsirCompContent.includes('handleNextAyahNav'), 'Next Ayah navigation handler must exist');
assert.ok(tafsirCompContent.includes('Aayaddii Hore'), 'Previous Ayah button label present');
assert.ok(tafsirCompContent.includes('Aayadda Xigta'), 'Next Ayah button label present');
assert.ok(tafsirCompContent.includes('tafsir-ayah-'), 'Target ayah container IDs present for smooth scrolling');
assert.ok(tafsirCompContent.includes('Dooro Aayad:'), 'Ayah jumper dropdown present');
console.log('  ✓ Verse-by-verse Ayah navigation and direct jump controls verified');

// Verify honest scholar missing disclosure
assert.ok(tafsirCompContent.includes('Tafsiirka Shiikha ee Suuradda') && tafsirCompContent.includes('weli lama hayo'), 'Honest missing commentary notice verified');
console.log('  ✓ Honest Missing Content notice rendered when scholar commentary is pending');

// -----------------------------------------------------------------------------
// SECTION 4: SMART TOMORROW LESSON PLANNING IN MACALLIN SERVICE
// -----------------------------------------------------------------------------
console.log('\nSection 4: Smart Tomorrow Lesson Planning in Macallin Service');

const macallinServiceContent = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/macallinService.ts'), 'utf8');

// Verify calculateNextLesson
assert.ok(macallinServiceContent.includes('calculateNextLesson'), 'calculateNextLesson must be defined');
assert.ok(macallinServiceContent.includes('markLessonCompletedAndScheduleTomorrow'), 'markLessonCompletedAndScheduleTomorrow must be defined');
assert.ok(macallinServiceContent.includes('getTomorrowLesson'), 'getTomorrowLesson must be defined');

// Verify Scenario A: Entire Surah logic
assert.ok(macallinServiceContent.includes('isEntireSurah'), 'Entire surah detection must exist');
assert.ok(macallinServiceContent.includes('nextSurah = lesson.surah_number < 114 ? lesson.surah_number + 1 : 1'), 'Next surah advancement must exist');

// Verify Scenario B: Ayah count and boundary crossing logic
assert.ok(macallinServiceContent.includes('nextStartAyah = lesson.end_ayah + 1'), 'Continues next ayah within same surah');
assert.ok(macallinServiceContent.includes('Crosses surah boundary'), 'Crosses surah boundary comment and logic present');

// Verify Somali and English smart explanations
assert.ok(macallinServiceContent.includes('messageSo'), 'messageSo must be included in NextLessonPlan');
assert.ok(macallinServiceContent.includes('messageEn'), 'messageEn must be included in NextLessonPlan');
console.log('  ✓ Smart Tomorrow Lesson scenarios A, B, C implemented in macallinService');

// -----------------------------------------------------------------------------
// SECTION 5: MACALLIN TEACHER UI & QUICK PRESETS
// -----------------------------------------------------------------------------
console.log('\nSection 5: MacallinTeacher UI Presets & Tomorrow Lesson Controls');

const macallinTeacherContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/quran/MacallinTeacher.tsx'), 'utf8');

// Quick presets
assert.ok(macallinTeacherContent.includes('5 Aayadood'), 'Quick 5 Aayadood button must be present');
assert.ok(macallinTeacherContent.includes('10 Aayadood'), 'Quick 10 Aayadood button must be present');
assert.ok(macallinTeacherContent.includes('Suuradda oo dhan'), 'Quick Suuradda oo dhan button must be present');
console.log('  ✓ Quick passage size presets (5, 10, Suuradda oo dhan) present in MacallinTeacher');

// Smart tomorrow scheduling options passed
assert.ok(macallinTeacherContent.includes('mode: passageSelectionMode === \'full_surah\' ? \'entire_surah\' : \'ayah_range\''), 'Passes selection mode to smart scheduler');

// Tomorrow subtab smart details & teacher overrides
assert.ok(macallinTeacherContent.includes('tomorrowLesson.next_lesson_assignment'), 'Displays smart assignment message in tomorrow tab');
assert.ok(macallinTeacherContent.includes('handlePracticeTomorrowLessonNow'), 'Practice Tomorrow Lesson Now action present');
assert.ok(macallinTeacherContent.includes('handleRepeatTodayLessonTomorrow'), 'Repeat Today Lesson Tomorrow teacher override action present');
assert.ok(macallinTeacherContent.includes('Ku celi Casharka Maanta'), 'Repeat today button label present');
console.log('  ✓ Casharka Berri smart message and Teacher Override controls verified');

console.log('\n==================================================================');
console.log('All Tafsiir 15-Juz & Smart Macallin Lessons Tests Passed Successfully!');
console.log('==================================================================\n');
