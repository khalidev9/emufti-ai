/**
 * EMufti AI - Automatic Payment Utilities & Validation
 *
 * Implements:
 * 1. Method 2 (Automatic Payment): Mobile Money & Credit / Debit Card
 * 2. Mobile Operator Detection for Somali numbers (+252):
 *    - Prefix 772: Hormuud (evaluated before 2-digit prefixes)
 *    - Prefix 90:  Golis
 *    - Prefix 63:  Telesom
 *    - Prefix 61:  Hormuud
 *    - Prefix 68:  Somnet
 *    - Prefix 67:  Soltelco
 *    - Prefix 70:  Durdur
 *    - Prefix 65, 62, 64: 'Unknown — try again'
 *    - Other unmatched: 'Unknown — try again'
 * 3. Mobile Number Validation: fixed +252, exactly 9 digits after +252 (+252XXXXXXXXX)
 * 4. Card validation: standard Luhn algorithm, MM/YY expiration, CVV format
 * 5. Secure submission: never stores raw card or CVV; requires live gateway confirmation
 * 6. Exact failure message:
 *    - Somali: 'Cilad ayaa dhacday. Hab kale isku day. Mahadsanid.'
 *    - English: 'An error occurred. Please try another method. Thank you.'
 *    - Arabic: 'حدث خطأ. يُرجى تجربة طريقة أخرى. شكرًا لك.'
 */

import type { PlanSlug, MobileProvider } from '../types/database';

export type SomaliOperator =
  | 'Hormuud'
  | 'Golis'
  | 'Telesom'
  | 'Somnet'
  | 'Soltelco'
  | 'Durdur'
  | 'Unknown — try again'
  | '';

export interface OperatorDetectionResult {
  operator: SomaliOperator;
  isUnknown: boolean;
  isValidKnownOperator: boolean;
  detectedPrefix: string;
}

/**
 * Detect Somali mobile operator based on strict prefix rules.
 * Three-digit prefix 772 is matched BEFORE two-digit prefixes.
 */
export function detectSomaliOperator(digitsOrPhone: string): OperatorDetectionResult {
  // Strip everything that isn't a digit
  let clean = digitsOrPhone.replace(/\D/g, '');

  // If user included country code 252 at the start, strip it to get the 9-digit local number
  if (clean.startsWith('252') && clean.length > 3) {
    clean = clean.slice(3);
  }

  if (clean.length < 2) {
    return {
      operator: '',
      isUnknown: false,
      isValidKnownOperator: false,
      detectedPrefix: '',
    };
  }

  // RULE 1: Match three-digit prefix '772' BEFORE evaluating two-digit prefixes
  if (clean.startsWith('772')) {
    return {
      operator: 'Hormuud',
      isUnknown: false,
      isValidKnownOperator: true,
      detectedPrefix: '772',
    };
  }

  // If user has only typed '7' or '77', wait for 3rd digit
  if (clean.startsWith('7') && clean.length < 3) {
    if (clean === '70') {
      return {
        operator: 'Durdur',
        isUnknown: false,
        isValidKnownOperator: true,
        detectedPrefix: '70',
      };
    }
    return {
      operator: '',
      isUnknown: false,
      isValidKnownOperator: false,
      detectedPrefix: clean,
    };
  }

  // RULE 2: Evaluate two-digit prefixes
  const prefix2 = clean.slice(0, 2);

  if (prefix2 === '90') {
    return { operator: 'Golis', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '90' };
  }
  if (prefix2 === '63') {
    return { operator: 'Telesom', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '63' };
  }
  if (prefix2 === '61') {
    return { operator: 'Hormuud', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '61' };
  }
  if (prefix2 === '68') {
    return { operator: 'Somnet', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '68' };
  }
  if (prefix2 === '67') {
    return { operator: 'Soltelco', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '67' };
  }
  if (prefix2 === '70') {
    return { operator: 'Durdur', isUnknown: false, isValidKnownOperator: true, detectedPrefix: '70' };
  }

  // Specified unknown prefixes 65, 62, 64 and all other unmatched prefixes
  return {
    operator: 'Unknown — try again',
    isUnknown: true,
    isValidKnownOperator: false,
    detectedPrefix: prefix2,
  };
}

export interface MobileValidationResult {
  isValid: boolean;
  cleanDigits: string;
  formattedNumber: string;
  operator: SomaliOperator;
  error?: string;
}

/**
 * Validates that the number contains exactly 9 digits after +252
 * and verifies provider compatibility.
 */
export function validateSomaliMobileNumber(
  rawInput: string,
  selectedProvider?: MobileProvider,
  language: 'en' | 'so' | 'ar' = 'en'
): MobileValidationResult {
  let clean = rawInput.replace(/\D/g, '');

  if (clean.startsWith('252')) {
    clean = clean.slice(3);
  }

  const detection = detectSomaliOperator(clean);
  const formattedNumber = clean ? `+252${clean}` : '';

  if (!clean) {
    return {
      isValid: false,
      cleanDigits: '',
      formattedNumber: '',
      operator: '',
      error: language === 'so'
        ? 'Fadlan geli lambarkaaga mobile-ka.'
        : language === 'ar'
        ? 'يُرجى إدخال رقم هاتفك المحمول.'
        : 'Please enter your mobile number.',
    };
  }

  if (clean.length !== 9) {
    return {
      isValid: false,
      cleanDigits: clean,
      formattedNumber,
      operator: detection.operator,
      error: language === 'so'
        ? `Lambarku waa inuu ahaadaa sax 9 lambar ka dib +252 (waxaad gelisay ${clean.length} lambar).`
        : language === 'ar'
        ? `يجب أن يتكون الرقم من 9 أرقام بالضبط بعد +252 (أدخلت ${clean.length} أرقام).`
        : `Mobile number must be exactly 9 digits after +252 (currently ${clean.length} digits).`,
    };
  }

  if (detection.isUnknown || !detection.isValidKnownOperator) {
    return {
      isValid: false,
      cleanDigits: clean,
      formattedNumber,
      operator: 'Unknown — try again',
      error: language === 'so'
        ? 'Horudhaca lambarkaaga ma ahan shirkad la yaqaan (Unknown — try again).'
        : language === 'ar'
        ? 'بادئة الرقم غير معروفة (Unknown — try again).'
        : 'Unknown operator prefix — try again.',
    };
  }

  // Provider network verification
  if (selectedProvider) {
    if (selectedProvider === 'eVC Plus' && detection.operator !== 'Hormuud') {
      return {
        isValid: false,
        cleanDigits: clean,
        formattedNumber,
        operator: detection.operator,
        error: language === 'so'
          ? 'eVC Plus waxa bixisa shirkadda Hormuud (61 ama 772). Lambarkani waa ' + detection.operator + '.'
          : language === 'ar'
          ? 'خدمة eVC Plus مقدمة من هرمز (61 أو 772). هذا الرقم يتبع ' + detection.operator + '.'
          : `eVC Plus is provided by Hormuud (prefix 61 or 772). This number is ${detection.operator}.`,
      };
    }
    if (selectedProvider === 'Sahal' && detection.operator !== 'Golis') {
      return {
        isValid: false,
        cleanDigits: clean,
        formattedNumber,
        operator: detection.operator,
        error: language === 'so'
          ? 'Sahal waxa bixisa shirkadda Golis (prefix 90). Lambarkani waa ' + detection.operator + '.'
          : language === 'ar'
          ? 'خدمة Sahal مقدمة من غوليس (البادئة 90). هذا الرقم يتبع ' + detection.operator + '.'
          : `Sahal is provided by Golis (prefix 90). This number is ${detection.operator}.`,
      };
    }
    if (selectedProvider === 'ZAAD' && detection.operator !== 'Telesom') {
      return {
        isValid: false,
        cleanDigits: clean,
        formattedNumber,
        operator: detection.operator,
        error: language === 'so'
          ? 'ZAAD waxa bixisa shirkadda Telesom (prefix 63). Lambarkani waa ' + detection.operator + '.'
          : language === 'ar'
          ? 'خدمة ZAAD مقدمة من تليسوم (البادئة 63). هذا الرقم يتبع ' + detection.operator + '.'
          : `ZAAD is provided by Telesom (prefix 63). This number is ${detection.operator}.`,
      };
    }
  }

  return {
    isValid: true,
    cleanDigits: clean,
    formattedNumber,
    operator: detection.operator,
  };
}

/**
 * Masks a Somali phone number for safe storage and display
 * e.g. +252615123456 -> +252 61 ••• ••56
 */
export function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 9) return phone;
  const local = clean.startsWith('252') ? clean.slice(3) : clean;
  if (local.length !== 9) return `+252 ${local}`;
  const prefix = local.slice(0, 2);
  const suffix = local.slice(7);
  return `+252 ${prefix} ••• ••${suffix}`;
}

// -----------------------------------------------------------------------------
// Card Validation (Luhn Algorithm, Expiry, CVV)
// -----------------------------------------------------------------------------

export interface CardValidationResult {
  isValid: boolean;
  brand: string;
  error?: string;
}

/**
 * Standard Luhn Checksum Algorithm (Mod 10)
 */
export function validateCardNumber(cardNumber: string): CardValidationResult {
  const sanitized = cardNumber.replace(/\D/g, '');

  if (!sanitized) {
    return { isValid: false, brand: '', error: 'Card number is required.' };
  }

  if (sanitized.length < 13 || sanitized.length > 19) {
    return { isValid: false, brand: '', error: 'Card number must be between 13 and 19 digits.' };
  }

  // Detect brand
  let brand = 'Unknown';
  if (/^4/.test(sanitized)) brand = 'Visa';
  else if (/^(5[1-5]|2[2-7])/.test(sanitized)) brand = 'Mastercard';
  else if (/^3[47]/.test(sanitized)) brand = 'American Express';
  else if (/^6(011|5)/.test(sanitized)) brand = 'Discover';

  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, brand, error: 'Invalid card number checksum.' };
  }

  return { isValid: true, brand };
}

export interface CardExpiryResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate card expiry date MM/YY
 */
export function validateCardExpiry(expiry: string): CardExpiryResult {
  const clean = expiry.replace(/\s+/g, '');
  const match = clean.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
  if (!match) {
    return { isValid: false, error: 'Expiry must be in MM/YY format.' };
  }

  const expMonth = parseInt(match[1], 10);
  const expYear = parseInt(`20${match[2]}`, 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, error: 'This card has expired.' };
  }

  // Reject unreasonably distant dates (> 20 years in the future)
  if (expYear > currentYear + 20) {
    return { isValid: false, error: 'Invalid expiration year.' };
  }

  return { isValid: true };
}

/**
 * Validate CVV (3 digits for Visa/Mastercard, 4 for Amex)
 */
export function validateCardCvv(cvv: string, isAmex = false): boolean {
  const clean = cvv.replace(/\D/g, '');
  return isAmex ? clean.length === 4 : clean.length === 3;
}

/**
 * Formats card number with spaces every 4 digits: XXXX XXXX XXXX XXXX
 */
export function formatCardNumberInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 19);
  const parts = digits.match(/.{1,4}/g);
  return parts ? parts.join(' ') : digits;
}

/**
 * Formats expiry date input with slash: MM/YY
 */
export function formatExpiryInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Masks card number showing only last 4 digits: •••• •••• •••• 1234
 */
export function maskCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

// -----------------------------------------------------------------------------
// Payment Gateway Configuration & Status
// -----------------------------------------------------------------------------

export interface PaymentGatewayConfig {
  isMobileMoneyConfigured: boolean;
  isCardGatewayConfigured: boolean;
  mobileProviderMerchantId?: string;
  stripePublishableKey?: string;
}

/**
 * Checks whether live merchant credentials exist in environment variables
 */
export function getAuthorizedPaymentConfig(): PaymentGatewayConfig {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const isCardGatewayConfigured = Boolean(
    stripeKey &&
    !stripeKey.includes('placeholder') &&
    !stripeKey.includes('your_key') &&
    stripeKey.startsWith('pk_')
  );

  // Check for Somali mobile money merchant credentials (WaafiPay / Hormuud Merchant API)
  const waafiMerchant = import.meta.env.VITE_WAAFIPAY_MERCHANT_UID;
  const waafiKey = import.meta.env.VITE_WAAFIPAY_API_KEY;
  const isMobileMoneyConfigured = Boolean(
    waafiMerchant &&
    waafiKey &&
    !waafiKey.includes('placeholder')
  );

  return {
    isMobileMoneyConfigured,
    isCardGatewayConfigured,
    mobileProviderMerchantId: waafiMerchant || undefined,
    stripePublishableKey: isCardGatewayConfigured ? stripeKey : undefined,
  };
}

// -----------------------------------------------------------------------------
// Localized Required Failure Messages
// -----------------------------------------------------------------------------

export const AUTOMATIC_PAYMENT_FAILED_MESSAGES = {
  so: 'Cilad ayaa dhacday. Hab kale isku day. Mahadsanid.',
  en: 'An error occurred. Please try another method. Thank you.',
  ar: 'حدث خطأ. يُرجى تجربة طريقة أخرى. شكرًا لك.',
} as const;

export function getAutomaticPaymentFailedMessage(lang: 'en' | 'so' | 'ar' = 'en'): string {
  return AUTOMATIC_PAYMENT_FAILED_MESSAGES[lang] || AUTOMATIC_PAYMENT_FAILED_MESSAGES.en;
}
