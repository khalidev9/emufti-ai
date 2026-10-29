import assert from 'node:assert/strict';
import { storage, getReadingProgress, saveReadingProgress } from '../src/lib/storage.ts';
import * as utilsStorage from '../src/utils/storage.ts';
import * as servicesStorage from '../src/services/storage.ts';

console.log('\n========================================================================');
console.log('STORAGE: GET_READING_PROGRESS FUNCTIONALITY & EXPORT TESTS');
console.log('========================================================================\n');

// Mock localStorage if in node environment
const mockStore = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStore.get(key) || null,
  setItem: (key, val) => mockStore.set(key, String(val)),
  removeItem: (key) => mockStore.delete(key),
  clear: () => mockStore.clear(),
};

// Test 1: storage.getReadingProgress is a function
assert.equal(typeof storage.getReadingProgress, 'function', 'storage.getReadingProgress must be a function');
console.log('✓ [PASS] storage.getReadingProgress is a function');

// Test 2: standalone getReadingProgress is a function
assert.equal(typeof getReadingProgress, 'function', 'getReadingProgress must be exported as a function');
console.log('✓ [PASS] standalone getReadingProgress is exported as a function');

// Test 3: utils/storage exports both
assert.equal(typeof utilsStorage.storage.getReadingProgress, 'function', 'utils/storage.storage.getReadingProgress must exist');
assert.equal(typeof utilsStorage.getReadingProgress, 'function', 'utils/storage.getReadingProgress must exist');
console.log('✓ [PASS] utils/storage re-exports getReadingProgress and storage object');

// Test 4: services/storage exports both
assert.equal(typeof servicesStorage.storage.getReadingProgress, 'function', 'services/storage.storage.getReadingProgress must exist');
assert.equal(typeof servicesStorage.getReadingProgress, 'function', 'services/storage.getReadingProgress must exist');
console.log('✓ [PASS] services/storage re-exports getReadingProgress and storage object');

// Test 5: Default value when localStorage is empty
mockStore.clear();
const defaultRes = storage.getReadingProgress();
assert.equal(defaultRes.currentSurah, 1);
assert.equal(defaultRes.currentVerse, 1);
assert.equal(defaultRes.lastReadTime, null);
console.log('✓ [PASS] Returns default { currentSurah: 1, currentVerse: 1, lastReadTime: null } when empty');

// Test 6: Reading valid progress from localStorage
mockStore.set('quran_reading_progress', JSON.stringify({
  currentSurah: 2,
  currentVerse: 255,
  lastReadTime: '2026-10-23T10:00:00.000Z',
}));
const savedRes = storage.getReadingProgress();
assert.equal(savedRes.currentSurah, 2);
assert.equal(savedRes.currentVerse, 255);
assert.equal(savedRes.lastReadTime, '2026-10-23T10:00:00.000Z');
console.log('✓ [PASS] Correctly parses and returns valid reading progress from quran_reading_progress');

// Test 7: Handles corrupt/invalid JSON without throwing
mockStore.set('quran_reading_progress', 'invalid-json{{{');
const corruptRes = storage.getReadingProgress();
assert.equal(corruptRes.currentSurah, 1);
assert.equal(corruptRes.currentVerse, 1);
assert.equal(corruptRes.lastReadTime, null);
console.log('✓ [PASS] Safely catches JSON errors and returns fallback default without throwing');

// Test 8: Calling standalone getReadingProgress()
mockStore.set('quran_reading_progress', JSON.stringify({
  currentSurah: 18,
  currentVerse: 10,
  lastReadTime: '2026-10-23T10:05:00.000Z',
}));
const standaloneRes = getReadingProgress();
assert.equal(standaloneRes.currentSurah, 18);
assert.equal(standaloneRes.currentVerse, 10);
console.log('✓ [PASS] Standalone getReadingProgress() retrieves valid data');

console.log('\n========================================================================');
console.log('ALL STORAGE READING PROGRESS TESTS PASSED SUCCESSFULLY!');
console.log('========================================================================\n');
