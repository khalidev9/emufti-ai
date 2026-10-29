/**
 * EMufti AI - Dashboard City Storage & QuotaExceededError Verification Tests
 *
 * Verifies:
 * 1. Safe storage design: Only compact, validated city IDs (<= 64 chars) are stored in emufti_user_city.
 * 2. Rejection of oversized objects, JSON, SVG markup, and base64 strings.
 * 3. Pruning of oversized/corrupted emufti_user_city without clearing other localStorage data.
 * 4. QuotaExceededError handling: Dashboard and PrayerTimesWidget continue functioning seamlessly via in-memory fallback.
 * 5. Redundant writes prevention: Identical values do not cause repeated storage writes.
 * 6. Non-interference: Other localStorage keys (auth, profile, reading progress) remain 100% intact.
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getUserCity,
  setUserCity,
  isValidCityId,
  CITY_STORAGE_KEY,
  DEFAULT_CITY_ID,
  storage,
} from '../src/lib/storage.ts';

console.log('========================================================================');
console.log('EMUFTI AI: DASHBOARD CITY STORAGE & QUOTAEXCEEDEDERROR TESTS');
console.log('========================================================================\n');

let total = 0;
let passed = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] Test ${total}: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// Mock localStorage setup for Node test environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.shouldThrowQuota = false;
    this.writeCount = 0;
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.writeCount++;
    if (this.shouldThrowQuota) {
      const err = new Error("Failed to execute 'setItem' on 'Storage': Setting the value of '" + key + "' exceeded the quota.");
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    }
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }
}

const mockStorage = new MockLocalStorage();
global.window = { localStorage: mockStorage };

// -----------------------------------------------------------------------------
// Test 1: Validation of compact city ID vs oversized / invalid payloads
// -----------------------------------------------------------------------------
runTest('isValidCityId accepts valid compact city IDs and rejects oversized/invalid payloads', () => {
  // Valid compact city IDs
  assert.equal(isValidCityId('mogadishu'), true);
  assert.equal(isValidCityId('hargeisa'), true);
  assert.equal(isValidCityId('riyadh'), true);
  assert.equal(isValidCityId('djibouti_city'), true);
  assert.equal(isValidCityId('new-york'), true);

  // Rejected: Oversized strings (> 64 characters)
  const oversized65 = 'a'.repeat(65);
  assert.equal(isValidCityId(oversized65), false, 'Must reject > 64 chars string');

  // Rejected: JSON objects/arrays
  assert.equal(isValidCityId('{"id":"mogadishu","name":"Mogadishu"}'), false);
  assert.equal(isValidCityId('["mogadishu","hargeisa"]'), false);

  // Rejected: HTML / SVG markup
  assert.equal(isValidCityId('<svg width="100" height="100"><circle /></svg>'), false);

  // Rejected: Base64 data URIs
  assert.equal(isValidCityId('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'), false);

  // Rejected: Non-strings or empty strings
  assert.equal(isValidCityId(''), false);
  assert.equal(isValidCityId('   '), false);
  assert.equal(isValidCityId(null), false);
  assert.equal(isValidCityId(undefined), false);
  assert.equal(isValidCityId(12345), false);
});

// -----------------------------------------------------------------------------
// Test 2: Safe Read & Default Fallback
// -----------------------------------------------------------------------------
runTest('getUserCity returns default city ("mogadishu") when storage is empty', () => {
  mockStorage.clear();
  const city = getUserCity();
  assert.equal(city, DEFAULT_CITY_ID);
});

// -----------------------------------------------------------------------------
// Test 3: Normal Compact Persistence
// -----------------------------------------------------------------------------
runTest('setUserCity correctly stores validated compact city ID', () => {
  mockStorage.clear();
  setUserCity('hargeisa');
  assert.equal(mockStorage.getItem(CITY_STORAGE_KEY), 'hargeisa');
  assert.equal(getUserCity(), 'hargeisa');
});

// -----------------------------------------------------------------------------
// Test 4: Prunes Oversized Corrupted Key Without Clearing Unrelated Data
// -----------------------------------------------------------------------------
runTest('Prunes oversized/corrupted emufti_user_city without affecting other localStorage entries', () => {
  mockStorage.clear();
  // Set critical user data that must NOT be cleared
  mockStorage.setItem('emufti_auth_user', JSON.stringify({ id: 'user-123', email: 'user@example.com' }));
  mockStorage.setItem('quran_reading_progress', JSON.stringify({ currentSurah: 2, currentVerse: 255 }));

  // Simulate an old corrupted/oversized city payload (e.g. 500KB JSON or base64)
  const hugeData = 'data:image/svg+xml;base64,' + 'X'.repeat(5000);
  mockStorage.setItem(CITY_STORAGE_KEY, hugeData);

  // Reading city should detect corruption, purge ONLY CITY_STORAGE_KEY, and return default
  const city = getUserCity();
  assert.equal(city, DEFAULT_CITY_ID);
  assert.equal(mockStorage.getItem(CITY_STORAGE_KEY), null, 'Corrupted key should have been purged');

  // Verify unrelated user data remains 100% intact!
  assert.ok(mockStorage.getItem('emufti_auth_user'), 'Auth data must be preserved');
  assert.ok(mockStorage.getItem('quran_reading_progress'), 'Reading progress must be preserved');
});

// -----------------------------------------------------------------------------
// Test 5: Prevents Repeated Writes of Identical Values
// -----------------------------------------------------------------------------
runTest('Prevents redundant writes when city value is already identical', () => {
  mockStorage.clear();
  mockStorage.writeCount = 0;

  setUserCity('riyadh');
  assert.equal(mockStorage.writeCount, 1, 'First write must succeed');

  // Second identical write should be a no-op
  setUserCity('riyadh');
  assert.equal(mockStorage.writeCount, 1, 'Second identical write must NOT invoke setItem');

  // Third write with differing casing should normalize and also be a no-op
  setUserCity('RIYADH');
  assert.equal(mockStorage.writeCount, 1, 'Normalized identical write must NOT invoke setItem');
});

// -----------------------------------------------------------------------------
// Test 6: Graceful Handling of QuotaExceededError
// -----------------------------------------------------------------------------
runTest('Gracefully handles QuotaExceededError without crashing and falls back to in-memory store', () => {
  mockStorage.clear();
  mockStorage.shouldThrowQuota = true;

  // setUserCity must NOT throw even when QuotaExceededError occurs
  assert.doesNotThrow(() => {
    setUserCity('cairo');
  }, 'Must handle QuotaExceededError gracefully without throwing');

  // getUserCity must seamlessly return the in-memory value
  const city = getUserCity();
  assert.equal(city, 'cairo', 'In-memory fallback must retain user selection');

  mockStorage.shouldThrowQuota = false;
});

// -----------------------------------------------------------------------------
// Test 7: storage.getUserCity and storage.setUserCity methods
// -----------------------------------------------------------------------------
runTest('storage object proxies getUserCity and setUserCity correctly', () => {
  mockStorage.clear();
  assert.equal(typeof storage.getUserCity, 'function');
  assert.equal(typeof storage.setUserCity, 'function');

  storage.setUserCity('dubai');
  assert.equal(storage.getUserCity(), 'dubai');
});

// -----------------------------------------------------------------------------
// Test 8: Verify PrayerTimesWidget.tsx does not contain raw unhandled localStorage.setItem
// -----------------------------------------------------------------------------
runTest('PrayerTimesWidget.tsx uses getUserCity and setUserCity with zero unhandled localStorage writes', () => {
  const widgetPath = path.resolve('src/components/dashboard/PrayerTimesWidget.tsx');
  const content = fs.readFileSync(widgetPath, 'utf-8');

  // Must import getUserCity and setUserCity
  assert.ok(
    content.includes('getUserCity') && content.includes('setUserCity'),
    'Must import getUserCity and setUserCity from storage'
  );

  // Must NOT contain raw unhandled localStorage.setItem('emufti_user_city'
  assert.ok(
    !content.includes("localStorage.setItem('emufti_user_city'"),
    'Must NOT contain raw unhandled localStorage.setItem("emufti_user_city"'
  );

  // Must NOT contain raw unhandled localStorage.getItem('emufti_user_city'
  assert.ok(
    !content.includes("localStorage.getItem('emufti_user_city'"),
    'Must NOT contain raw unhandled localStorage.getItem("emufti_user_city"'
  );
});

console.log('\n========================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('========================================================================\n');
