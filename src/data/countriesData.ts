import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import type { CountryCode, PhoneNumber } from 'libphonenumber-js';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  callingCode: string; // e.g. "+252"
  examplePlaceholder: string;
}

// Convert 2-letter ISO country code into Unicode Flag Emoji
export const getCountryFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Exemplar local placeholders for key countries
const COUNTRY_PLACEHOLDERS: Partial<Record<CountryCode, string>> = {
  SO: '61 123 4567',
  KE: '712 345678',
  DJ: '77 12 34 56',
  ET: '91 123 4567',
  SA: '50 123 4567',
  AE: '50 123 4567',
  US: '202 555 0123',
  GB: '7911 123456',
  CA: '416 555 0123',
  IN: '98123 45678',
  PK: '301 2345678',
  TR: '501 234 5678',
  EG: '10 1234 5678',
  QA: '3312 3456',
  OM: '9123 4567',
  KW: '5123 4567',
  YE: '71 234 567',
  SD: '91 234 5678',
  MY: '12 345 6789',
  ID: '812 3456 7890',
  UG: '701 234567',
  TZ: '712 345 678',
  ZA: '71 234 5678',
  SE: '70 123 45 67',
  NO: '412 34 567',
  DE: '151 23456789',
  FR: '6 12 34 56 78',
  NL: '6 12345678',
  AU: '412 345 678',
};

// Priority ordering for EMUFTI AI user demographic:
// Horn of Africa, East Africa, Gulf/Arab world, Global Diaspora, followed by all remaining countries
const PRIORITY_COUNTRY_CODES: CountryCode[] = [
  'SO', // Somalia (Default)
  'KE', // Kenya
  'DJ', // Djibouti
  'ET', // Ethiopia
  'SA', // Saudi Arabia
  'AE', // United Arab Emirates
  'US', // United States
  'GB', // United Kingdom
  'CA', // Canada
  'SE', // Sweden
  'NO', // Norway
  'TR', // Turkey
  'QA', // Qatar
  'EG', // Egypt
  'IN', // India
  'PK', // Pakistan
  'MY', // Malaysia
  'ID', // Indonesia
  'OM', // Oman
  'KW', // Kuwait
  'YE', // Yemen
  'SD', // Sudan
  'UG', // Uganda
  'TZ', // Tanzania
  'ZA', // South Africa
  'DE', // Germany
  'FR', // France
  'NL', // Netherlands
  'AU', // Australia
];

let cachedCountriesList: CountryInfo[] | null = null;

export const getAllCountries = (): CountryInfo[] => {
  if (cachedCountriesList) return cachedCountriesList;

  let regionNames: Intl.DisplayNames | null = null;
  try {
    regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    regionNames = null;
  }

  const allCodes = getCountries();
  const countryMap = new Map<CountryCode, CountryInfo>();

  for (const code of allCodes) {
    try {
      const callingCode = `+${getCountryCallingCode(code)}`;
      const name = regionNames?.of(code) || code;
      const flag = getCountryFlagEmoji(code);
      const examplePlaceholder = COUNTRY_PLACEHOLDERS[code] || '123 456 789';

      countryMap.set(code, {
        code,
        name,
        flag,
        callingCode,
        examplePlaceholder,
      });
    } catch {
      // Skip rare unsupported territory codes
    }
  }

  // Build sorted list: priority countries first, then remainder sorted alphabetically by name
  const priorityList: CountryInfo[] = [];
  for (const pCode of PRIORITY_COUNTRY_CODES) {
    const item = countryMap.get(pCode);
    if (item) {
      priorityList.push(item);
      countryMap.delete(pCode);
    }
  }

  const remainingList = Array.from(countryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  cachedCountriesList = [...priorityList, ...remainingList];
  return cachedCountriesList;
};

export const getCountryByCode = (code: string): CountryInfo | undefined => {
  if (!code) return undefined;
  const upper = code.toUpperCase() as CountryCode;
  const list = getAllCountries();
  return list.find((c) => c.code === upper);
};

export const getCountryByCallingCode = (callingCode: string): CountryInfo | undefined => {
  if (!callingCode) return undefined;
  const normalized = callingCode.startsWith('+') ? callingCode : `+${callingCode}`;
  const list = getAllCountries();
  return list.find((c) => c.callingCode === normalized);
};

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string; // e.g. "+252615123456"
  internationalFormatted: string; // e.g. "+252 61 5123456"
  nationalFormatted: string; // e.g. "061 5123456"
  countryCode: CountryCode;
  callingCode: string;
  errorMessage?: string;
}

/**
 * Validates and normalizes phone numbers using libphonenumber-js
 * Handles numbers with or without leading +, local numbers with chosen country, or international format
 */
export const validateAndFormatPhoneNumber = (
  rawNumber: string,
  selectedCountry: CountryCode = 'SO'
): PhoneValidationResult => {
  const trimmed = (rawNumber || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      e164: '',
      internationalFormatted: '',
      nationalFormatted: '',
      countryCode: selectedCountry,
      callingCode: `+${getCountryCallingCode(selectedCountry)}`,
      errorMessage: 'Phone number is required.',
    };
  }

  try {
    let parsed: PhoneNumber | undefined;

    // If input begins with a plus, parse in international mode
    if (trimmed.startsWith('+')) {
      parsed = parsePhoneNumberFromString(trimmed);
    } else {
      // Otherwise, parse relative to selectedCountry
      parsed = parsePhoneNumberFromString(trimmed, selectedCountry);
      // If parsing failed, try prepending country calling code
      if (!parsed) {
        const callingCode = getCountryCallingCode(selectedCountry);
        parsed = parsePhoneNumberFromString(`+${callingCode}${trimmed.replace(/^0+/, '')}`);
      }
    }

    if (!parsed) {
      return {
        isValid: false,
        e164: trimmed,
        internationalFormatted: trimmed,
        nationalFormatted: trimmed,
        countryCode: selectedCountry,
        callingCode: `+${getCountryCallingCode(selectedCountry)}`,
        errorMessage: 'Invalid phone number format. Please check the digits.',
      };
    }

    const isValid = parsed.isValid();
    const country = parsed.country || selectedCountry;
    const callingCode = `+${parsed.countryCallingCode || getCountryCallingCode(country)}`;

    return {
      isValid,
      e164: parsed.format('E.164'),
      internationalFormatted: parsed.formatInternational(),
      nationalFormatted: parsed.formatNational(),
      countryCode: country,
      callingCode,
      errorMessage: isValid
        ? undefined
        : `Please enter a valid phone number for ${getCountryByCode(country)?.name || country}.`,
    };
  } catch (err: any) {
    return {
      isValid: false,
      e164: trimmed,
      internationalFormatted: trimmed,
      nationalFormatted: trimmed,
      countryCode: selectedCountry,
      callingCode: `+${getCountryCallingCode(selectedCountry)}`,
      errorMessage: err?.message || 'Invalid phone number.',
    };
  }
};
