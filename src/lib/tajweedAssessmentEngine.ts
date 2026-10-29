import type {
  MacallinMistake,
  MacallinMistakeType,
  MacallinWordVerification,
  MacallinErrorCategory,
  MacallinLetterSegment,
} from '../types/database.ts';
import { normalizeArabicForComparison } from './macallinService.ts';

// -----------------------------------------------------------------------------
// Makharij al-Huruf (Points of Articulation) Reference Data
// -----------------------------------------------------------------------------
export interface MakhrajInfo {
  letter: string;
  nameSo: string;
  nameAr: string;
  category: 'al_halq' | 'al_lisan' | 'ash_shafatan' | 'al_khayshum' | 'al_jawf';
  categorySo: string;
  categoryAr: string;
  pointDetailSo: string;
  isHeavy: boolean; // Isti'la (خص ضغط قظ)
  hasQalqalah: boolean; // قطب جد
  hasSafeer: boolean; // ص ز س
  hasGhunnah: boolean; // ن م
}

export const ARABIC_MAKHAARIJ: Record<string, MakhrajInfo> = {
  'ء': {
    letter: 'ء',
    nameSo: 'Hamzah',
    nameAr: 'همزة',
    category: 'al_halq',
    categorySo: 'Dhuunta (Aqsal-Halq - Gunta hoose)',
    categoryAr: 'أقصى الحلق',
    pointDetailSo: 'Gunta dhuunta ee u dhow xabadka.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ه': {
    letter: 'ه',
    nameSo: 'Haa’',
    nameAr: 'هاء',
    category: 'al_halq',
    categorySo: 'Dhuunta (Aqsal-Halq - Gunta hoose)',
    categoryAr: 'أقصى الحلق',
    pointDetailSo: 'Gunta dhuunta ee u dhow xabadka.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ع': {
    letter: 'ع',
    nameSo: '‘Ayn',
    nameAr: 'عين',
    category: 'al_halq',
    categorySo: 'Dhuunta (Wasat al-Halq - Dhexda dhuunta)',
    categoryAr: 'وسط الحلق',
    pointDetailSo: 'Badhtamaha dhuunta.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ح': {
    letter: 'ح',
    nameSo: 'Xaa’',
    nameAr: 'حاء',
    category: 'al_halq',
    categorySo: 'Dhuunta (Wasat al-Halq - Dhexda dhuunta)',
    categoryAr: 'وسط الحلق',
    pointDetailSo: 'Badhtamaha dhuunta oo leh neef khafiif ah (hams).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'غ': {
    letter: 'غ',
    nameSo: 'Ghayn',
    nameAr: 'غين',
    category: 'al_halq',
    categorySo: 'Dhuunta (Adnal-Halq - Afka dhuunta)',
    categoryAr: 'أدنى الحلق',
    pointDetailSo: 'Afka dhuunta xagga sare ee u dhow xididka carrabka. Waa xaraf culus (Isti‘laa).',
    isHeavy: true,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'خ': {
    letter: 'خ',
    nameSo: 'Khaa’',
    nameAr: 'خاء',
    category: 'al_halq',
    categorySo: 'Dhuunta (Adnal-Halq - Afka dhuunta)',
    categoryAr: 'أدنى الحلق',
    pointDetailSo: 'Afka dhuunta xagga sare oo leh cod buuran iyo neef (Isti‘laa & Hams).',
    isHeavy: true,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ق': {
    letter: 'ق',
    nameSo: 'Qaaf',
    nameAr: 'قاف',
    category: 'al_lisan',
    categorySo: 'Carrabka (Aqsal-Lisan - Xididka carrabka)',
    categoryAr: 'أقصى اللسان',
    pointDetailSo: 'Xididka carrabka ee cirridka jilicsan xagga sare. Waa culus yahay oo leh Qalqalah.',
    isHeavy: true,
    hasQalqalah: true,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ك': {
    letter: 'ك',
    nameSo: 'Kaaf',
    nameAr: 'كاف',
    category: 'al_lisan',
    categorySo: 'Carrabka (Aqsal-Lisan - Xididka carrabka)',
    categoryAr: 'أقصى اللسان',
    pointDetailSo: 'Xididka carrabka wax yar ka hooseeya Qaafka cirridka adag. Waa khafiif leh neef (Hams).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ج': {
    letter: 'ج',
    nameSo: 'Jeem',
    nameAr: 'جيم',
    category: 'al_lisan',
    categorySo: 'Carrabka (Wasat al-Lisan - Badhtamaha carrabka)',
    categoryAr: 'وسط اللسان',
    pointDetailSo: 'Badhtamaha carrabka oo ku dhegaya cirridka sare. Waa adag yahay oo leh Qalqalah.',
    isHeavy: false,
    hasQalqalah: true,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ش': {
    letter: 'ش',
    nameSo: 'Sheen',
    nameAr: 'شين',
    category: 'al_lisan',
    categorySo: 'Carrabka (Wasat al-Lisan - Badhtamaha carrabka)',
    categoryAr: 'وسط اللسان',
    pointDetailSo: 'Badhtamaha carrabka iyo cirridka sare oo leh faafidda codka iyo neefta (Tafash-shi).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ي': {
    letter: 'ي',
    nameSo: 'Yaa’',
    nameAr: 'ياء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Wasat al-Lisan - Badhtamaha carrabka)',
    categoryAr: 'وسط اللسان',
    pointDetailSo: 'Badhtamaha carrabka iyo cirridka sare (ama Al-Jawf marka ay madd tahay).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ض': {
    letter: 'ض',
    nameSo: 'Daad',
    nameAr: 'ضاد',
    category: 'al_lisan',
    categorySo: 'Carrabka (Hafatal-Lisan - Dacallada carrabka)',
    categoryAr: 'حافة اللسان',
    pointDetailSo: 'Dacalka ama labada dacal ee carrabka cirridka gowsaha sare. Xarafka ugu adag ee buuran (Istitaalah).',
    isHeavy: true,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ل': {
    letter: 'ل',
    nameSo: 'Laam',
    nameAr: 'لام',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Cirifka caarada carrabka)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Dhinaca caarada carrabka iyo cirridka labada ilig ee sare.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ن': {
    letter: 'ن',
    nameSo: 'Noon',
    nameAr: 'نون',
    category: 'al_lisan',
    categorySo: 'Carrabka & Sanka (Tarafal-Lisan & Khayshum)',
    categoryAr: 'طرف اللسان والخيشوم',
    pointDetailSo: 'Caarada carrabka cirridka sare, codkuna wuxuu la socdaa ghunnah sanka ka soo baxda.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: true,
  },
  'ر': {
    letter: 'ر',
    nameSo: 'Raa’',
    nameAr: 'راء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka xagga dhabarkiisa iyo cirridka sare oo leh gariir (Takreer xaddidan).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ط': {
    letter: 'ط',
    nameSo: 'Taa’ (Culays)',
    nameAr: 'طاء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka xididka labada ilig ee sare. Waa xarafka ugu buuran (Isti‘laa & Itbaaq) oo leh Qalqalah.',
    isHeavy: true,
    hasQalqalah: true,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'د': {
    letter: 'د',
    nameSo: 'Daal',
    nameAr: 'دال',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka xididka labada ilig ee sare. Waa khafiif oo leh Qalqalah marka uu sakin yahay.',
    isHeavy: false,
    hasQalqalah: true,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ت': {
    letter: 'ت',
    nameSo: 'Taa’ (Khafiif)',
    nameAr: 'تاء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka xididka labada ilig ee sare. Waa khafiif oo leh neef (Hams).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ص': {
    letter: 'ص',
    nameSo: 'Saad',
    nameAr: 'صاد',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha hoose)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo ilkaha hoose dusheeda. Waa buuran yahay (Isti‘laa & Itbaaq) oo leh safeer.',
    isHeavy: true,
    hasQalqalah: false,
    hasSafeer: true,
    hasGhunnah: false,
  },
  'ز': {
    letter: 'ز',
    nameSo: 'Zaay',
    nameAr: 'زاي',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha hoose)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo ilkaha hoose dusheeda oo leh cod gariiraya (Safeer & Jahr).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: true,
    hasGhunnah: false,
  },
  'س': {
    letter: 'س',
    nameSo: 'Seen',
    nameAr: 'سين',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha hoose)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo ilkaha hoose dusheeda. Waa khafiif (Istifaal) oo leh safeer iyo hams.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: true,
    hasGhunnah: false,
  },
  'ظ': {
    letter: 'ظ',
    nameSo: 'Dhaa’',
    nameAr: 'ظاء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha sare)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo cirifka labada ilig ee sare. Waa buuran yahay (Isti‘laa & Itbaaq).',
    isHeavy: true,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ذ': {
    letter: 'ذ',
    nameSo: 'Dhaal',
    nameAr: 'ذال',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha sare)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo cirifka labada ilig ee sare. Waa khafiif (Istifaal).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ث': {
    letter: 'ث',
    nameSo: 'Thaa’',
    nameAr: 'ثاء',
    category: 'al_lisan',
    categorySo: 'Carrabka (Tarafal-Lisan - Caarada carrabka iyo ilkaha sare)',
    categoryAr: 'طرف اللسان',
    pointDetailSo: 'Caarada carrabka iyo cirifka labada ilig ee sare oo leh neef (Hams).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ف': {
    letter: 'ف',
    nameSo: 'Faa’',
    nameAr: 'فاء',
    category: 'ash_shafatan',
    categorySo: 'Dibnaha (Cirifka ilkaha sare iyo dibinta hoose)',
    categoryAr: 'الشفة السفلى مع أطراف الثنايا العليا',
    pointDetailSo: 'Cirifka labada ilig ee sare iyo gudaha dibinta hoose oo leh neef (Hams).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ب': {
    letter: 'ب',
    nameSo: 'Baa’',
    nameAr: 'باء',
    category: 'ash_shafatan',
    categorySo: 'Dibnaha (Labada dibnood oo isku qabata)',
    categoryAr: 'الشفتان',
    pointDetailSo: 'Isku qabashada labada dibnood. Waa adag yahay oo leh Qalqalah marka uu sakin yahay.',
    isHeavy: false,
    hasQalqalah: true,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'م': {
    letter: 'م',
    nameSo: 'Meem',
    nameAr: 'ميم',
    category: 'ash_shafatan',
    categorySo: 'Dibnaha & Sanka (Labada dibnood & Khayshum)',
    categoryAr: 'الشفتان والخيشوم',
    pointDetailSo: 'Isku xirka labada dibnood oo uu weheliyo codka Ghunnah ee sanka ka soo baxa.',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: true,
  },
  'و': {
    letter: 'و',
    nameSo: 'Waaw',
    nameAr: 'واو',
    category: 'ash_shafatan',
    categorySo: 'Dibnaha (Labada dibnood oo la wareejiyo)',
    categoryAr: 'الشفتان بالضم',
    pointDetailSo: 'Isku soo wareejinta labada dibnood adigoo meel bannaan u reebaya codka (ama Al-Jawf haddii ay madd tahay).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
  'ا': {
    letter: 'ا',
    nameSo: 'Alif Madd',
    nameAr: 'ألف المد',
    category: 'al_jawf',
    categorySo: 'Bannaanka Afka iyo Dhuunta (Al-Jawf)',
    categoryAr: 'الجوف',
    pointDetailSo: 'Bannaanka afka iyo dhuunta oo codka lagu jiido laba xarakadood (Madd Asli).',
    isHeavy: false,
    hasQalqalah: false,
    hasSafeer: false,
    hasGhunnah: false,
  },
};

// -----------------------------------------------------------------------------
// Frequent Letter Confusion Pairings & Diagnostic Explanations
// -----------------------------------------------------------------------------
export interface ConfusionRule {
  expectedLetter: string;
  detectedLetter: string;
  makhrajCategory: string;
  tajweedRule: string;
  explanationSo: string;
  correctionTip: string;
}

export const CONFUSABLE_LETTER_RULES: ConfusionRule[] = [
  {
    expectedLetter: 'ص',
    detectedLetter: 'س',
    makhrajCategory: 'Al-Lisan (Tongue / Caarada carrabka)',
    tajweedRule: 'Isti‘laa & Itbaaq (ص)',
    explanationSo: "Xarafka 'ص' (Saad) waxaa loo akhriyay 'س' (Seen). Saad waa xaraf culus oo buuran (Isti‘laa), halka Siin uu yahay khafiif (Istifaal).",
    correctionTip: 'Kor u qaad dhabarka carrabka oo dhumuc sii codkaaga markaad Saad ku dhawaaqayso.',
  },
  {
    expectedLetter: 'ض',
    detectedLetter: 'ظ',
    makhrajCategory: 'Al-Lisan (Tongue / Dacallada carrabka)',
    tajweedRule: 'Istitaalah & Makhrajka Daad (ض)',
    explanationSo: "Xarafka 'ض' (Daad) waxaa loo akhriyay 'ظ' (Dhaa’). Daad wuxuu ka soo baxaa dacallada carrabka cirridka gowsaha, ee kama soo baxo caarada ilkaha hore.",
    correctionTip: 'Dacalka carrabka ku qabo gowsaha sare, ha soo saarin caarada carrabka sida Dhaa’-da.',
  },
  {
    expectedLetter: 'ض',
    detectedLetter: 'د',
    makhrajCategory: 'Al-Lisan (Tongue / Dacallada carrabka)',
    tajweedRule: 'Isti‘laa & Istitaalah (ض)',
    explanationSo: "Xarafka 'ض' (Daad) waxaa loo akhriyay 'د' (Daal). Daad waa culus yahay oo dacalka carrabka ka baxa.",
    correctionTip: 'Codka Daad ha noqon mid go’an sida Daal, ee sii dheeree oo culeys sii.',
  },
  {
    expectedLetter: 'ط',
    detectedLetter: 'ت',
    makhrajCategory: 'Al-Lisan (Tongue / Caarada carrabka)',
    tajweedRule: 'Isti‘laa & Itbaaq & Qalqalah (ط)',
    explanationSo: "Xarafka 'ط' waxaa loo akhriyay 'ت'. Taa’ (ط) waa xaraf culus oo aad u buuran, halka Taa’ (ت) ay tahay khafiif leh neef (Hams).",
    correctionTip: 'Afka kor u buuxi oo ha siinin neef (hams) xarafka Daa’ (ط).',
  },
  {
    expectedLetter: 'ق',
    detectedLetter: 'ك',
    makhrajCategory: 'Al-Lisan (Tongue / Xididka carrabka)',
    tajweedRule: 'Isti‘laa & Qalqalah (ق)',
    explanationSo: "Xarafka 'ق' (Qaaf) waxaa loo akhriyay 'ك' (Kaaf). Qaaf wuxuu ka soo baxaa xididka carrabka cirridka jilicsan, waana buuran yahay oo leh Qalqalah.",
    correctionTip: 'Xididka carrabka kor ugu qaad cirridka jilicsan xagga dhuunta.',
  },
  {
    expectedLetter: 'ق',
    detectedLetter: 'غ',
    makhrajCategory: 'Al-Lisan vs Al-Halq',
    tajweedRule: 'Makhrajka Qaaf (ق)',
    explanationSo: "Xarafka 'ق' (Qaaf) waxaa loo akhriyay 'غ' (Ghayn). Qaaf wuxuu ka baxa xididka carrabka, halka Ghayn uu ka baxo afka dhuunta.",
    correctionTip: 'Codka Qaaf ha noqon mid soconaya sida Ghayn, ee ku dhufo cirridka jilicsan.',
  },
  {
    expectedLetter: 'ذ',
    detectedLetter: 'ز',
    makhrajCategory: 'Al-Lisan (Tongue)',
    tajweedRule: 'Makhrajka Dhaal (ذ)',
    explanationSo: "Xarafka 'ذ' (Dhaal) waxaa loo akhriyay 'ز' (Zaay). Dhaal waa caarada carrabka iyo ilkaha sare oo aan lahayn codka yeeraya (safeer).",
    correctionTip: 'Caarada carrabka wax yar ka soo saar cirifka labada ilig ee sare.',
  },
  {
    expectedLetter: 'ث',
    detectedLetter: 'س',
    makhrajCategory: 'Al-Lisan (Tongue)',
    tajweedRule: 'Makhrajka Thaa’ (ث)',
    explanationSo: "Xarafka 'ث' (Thaa’) waxaa loo akhriyay 'س' (Seen). Thaa’ waa caarada carrabka iyo cirifka labada ilig ee sare, halka Seen ay ilkaha hoose ka baxdo.",
    correctionTip: 'Caarada carrabka soo saar oo ilkaha sare saar, ha yeerin sida Siin.',
  },
  {
    expectedLetter: 'ح',
    detectedLetter: 'ه',
    makhrajCategory: 'Al-Halq (Throat)',
    tajweedRule: 'Wasat al-Halq (ح)',
    explanationSo: "Xarafka 'ح' (Xaa’) waxaa loo akhriyay 'ه' (Haa’). Xaa’ wuxuu ka soo baxaa dhexda dhuunta, halka Haa’ ay gunta dhuunta ka baxdo.",
    correctionTip: 'Dhuunta dhexdeeda culeys ku qabo si codka Xaa’ uu ugu baxo si cad.',
  },
  {
    expectedLetter: 'ع',
    detectedLetter: 'ء',
    makhrajCategory: 'Al-Halq (Throat)',
    tajweedRule: 'Wasat al-Halq (ع)',
    explanationSo: "Xarafka 'ع' (Cayn) waxaa loo akhriyay 'ء' (Hamzah). Cayn wuxuu ka soo baxaa dhexda dhuunta oo si fudud codkeedu u socdo.",
    correctionTip: 'Carrabka gadaal u yara riix si dhexda dhuuntu u dhuuxdo codka Cayn.',
  },
  {
    expectedLetter: 'غ',
    detectedLetter: 'خ',
    makhrajCategory: 'Adnal-Halq (Throat)',
    tajweedRule: 'Jahr vs Hams (غ / خ)',
    explanationSo: "Xarafka 'غ' (Ghayn) waxaa loo akhriyay 'خ' (Khaa’). Ghayn codkiisu waa cad yahay oo neefi lama socoto (Jahr).",
    correctionTip: 'Ha ku darin codka xabeebta leh ee Khaa’ marka aad Ghayn akhrinayso.',
  },
];

// -----------------------------------------------------------------------------
// Frequent Harakah (Diacritics) Diagnostic Rules
// -----------------------------------------------------------------------------
export interface HarakahDiagnosticRule {
  expectedBasePattern: RegExp;
  detectedMistakePattern: RegExp;
  charName: string;
  expectedHarakah: string;
  detectedHarakah: string;
  explanationSo: string;
  correctionTip: string;
}

export const HARAKAH_RULES: HarakahDiagnosticRule[] = [
  {
    expectedBasePattern: /انعمت/i,
    detectedMistakePattern: /انعمت[وُ]/i,
    charName: 'Taa (ت)',
    expectedHarakah: 'Fathah (ـَ)',
    detectedHarakah: 'Dammah (ـُ)',
    explanationSo: "Waxaa la maqlay Dammah (تُ) halkii laga rabay Fathah (تَ). Xarakada saxda ah ee xarafka Taa waa Fathah.",
    correctionTip: "Ku dhawaaq 'أَنْعَمْتَ' adigoo afka furaya (Fathah), hana ku darin codka Dammah.",
  },
  {
    expectedBasePattern: /انعمت/i,
    detectedMistakePattern: /انعمت[يِ]/i,
    charName: 'Taa (ت)',
    expectedHarakah: 'Fathah (ـَ)',
    detectedHarakah: 'Kasrah (ـِ)',
    explanationSo: "Waxaa la maqlay Kasrah (تِ) halkii laga rabay Fathah (تَ). Xarakada saxda ah waa Fathah.",
    correctionTip: "Afka kor u fur xarafka Taa dushiisa si ay Fathah sax ah u noqoto.",
  },
  {
    expectedBasePattern: /نعبد/i,
    detectedMistakePattern: /نعبد[اَ]/i,
    charName: 'Daal (د)',
    expectedHarakah: 'Dammah (ـُ)',
    detectedHarakah: 'Fathah (ـَ)',
    explanationSo: "Waxaa la maqlay Fathah (نَعْبُدَ) halkii laga rabay Dammah (نَعْبُدُ). Xarafka Daal wuxuu sitaa Dammah.",
    correctionTip: "Labada dibnood soo wareeji (Dammah) marka aad 'نَعْبُدُ' akhrinayso.",
  },
  {
    expectedBasePattern: /مالك/i,
    detectedMistakePattern: /مالك[اَ]/i,
    charName: 'Kaaf (ك)',
    expectedHarakah: 'Kasrah (ـِ)',
    detectedHarakah: 'Fathah (ـَ)',
    explanationSo: "Waxaa la maqlay Fathah (مَالِكَ) halkii laga rabay Kasrah (مَالِكِ). Xarafka Kaaf wuxuu sitaa Kasrah.",
    correctionTip: "Daanka hoos u yara dhig (Kasrah) xarafka Kaaf dushiisa.",
  },
  {
    expectedBasePattern: /الحمد/i,
    detectedMistakePattern: /الحمد[اَ]/i,
    charName: 'Daal (د)',
    expectedHarakah: 'Dammah (ـُ)',
    detectedHarakah: 'Fathah (ـَ)',
    explanationSo: "Waxaa la maqlay Fathah (الْحَمْدَ) halkii laga rabay Dammah (الْحَمْدُ). Xarafka Daal wuxuu sitaa Dammah.",
    correctionTip: "Labada dibnood soo wareeji si aad Dammah sax ah u samayso.",
  },
  {
    expectedBasePattern: /احد/i,
    detectedMistakePattern: /احد[اًن]/i,
    charName: 'Daal (د)',
    expectedHarakah: 'Tanween Damm (ـٌ)',
    detectedHarakah: 'Tanween Fath (ـً)',
    explanationSo: "Waxaa la maqlay Tanween Fath (أَحَدًا) halkii laga rabay Tanween Damm (أَحَدٌ).",
    correctionTip: "Akhri Tanween Damm adigoo dibnaha wareejinaya: 'أَحَدٌ'.",
  },
];

// -----------------------------------------------------------------------------
// Tokenizer & Letter Segment Decomposition for Authentic Ayahs
// -----------------------------------------------------------------------------
export interface AyahWordToken {
  wordIndex: number;
  rawText: string;
  normalizedText: string;
  hasQalqalah: boolean;
  hasGhunnah: boolean;
  hasMadd: boolean;
  hasNoonSakinahOrTanween: boolean;
  activeTajweedRules: string[];
  rules: string[];
  letterSegments: MacallinLetterSegment[];
}

/**
 * Decomposes an Arabic word into base letters and their attached diacritics
 */
export function decomposeWordIntoLetterSegments(rawWord: string): MacallinLetterSegment[] {
  if (!rawWord) return [];

  const segments: MacallinLetterSegment[] = [];
  const chars = Array.from(rawWord);
  let currentSegment: MacallinLetterSegment | null = null;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    // Check if character is an Arabic combining diacritic / tashkeel mark
    const isDiacritic = /[\u064B-\u065F\u0670\u06E2]/.test(ch);

    if (isDiacritic && currentSegment) {
      currentSegment.diacritics += ch;
    } else {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        char: ch,
        diacritics: '',
        isError: false,
      };
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Parses an authentic Uthmani Ayah into individual word tokens with Tajweed rule annotations
 * and granular letter segments.
 */
export function tokenizeAyahWithTajweed(ayahText: string): AyahWordToken[] {
  if (!ayahText) return [];

  // Remove trailing ayah end numbers if attached (e.g. ﴿١﴾ or digits)
  const cleanText = ayahText
    .replace(/[\u06DD\u06DE\u06DF\u06E9\u06EA\u06EB\u06EC\u06ED]/g, '')
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, '')
    .replace(/[۝«»‹›]/g, '')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);

  return words.map((rawWord, idx) => {
    const norm = normalizeArabicForComparison(rawWord);
    const activeRules: string[] = [];

    // 1. Qalqalah Detection (قطب جد with Sukoon or at end of word/ayah)
    const hasQalqalah = /[قطبجد][\u0652]?/g.test(rawWord) && (
      /[\u0652]/.test(rawWord) || idx === words.length - 1 || /[قطبجد]$/.test(norm)
    );
    if (hasQalqalah) {
      if (idx === words.length - 1 || /[قطبجد]$/.test(norm)) {
        activeRules.push('Qalqalah Kubra (قلقلة كبرى - Waqf)');
      } else {
        activeRules.push('Qalqalah (قطب جد)');
      }
    }

    // 2. Ghunnah Detection (Noon or Meem with Shaddah: نّ / مّ)
    const hasGhunnah = /[نم][\u064B-\u065F\u0670]*\u0651|\u0651[\u064B-\u065F\u0670]*[نم]/.test(rawWord);
    if (hasGhunnah) {
      activeRules.push('Ghunnah (نّ / مّ)');
    }

    // 3. Shaddah Detection (Doubled Consonant)
    const hasShaddah = /\u0651/.test(rawWord);
    if (hasShaddah && !hasGhunnah) {
      activeRules.push('Shaddah (التشديد - Nabrah)');
    }

    // 4. Madd Rules Detection
    const hasMaddSign = /[\u0653]/.test(rawWord);
    const hasLongVowel = /[\u0670]|[\u064E]ا|[\u064F]و|[\u0650]ي/.test(rawWord);
    const hasShaddahAfterMadd = /[اوي][\u0653]?[\u064B-\u065F\u0670]*[ء-ي][\u064B-\u065F\u0670]*\u0651/.test(rawWord);
    const hasHamzahAfterMaddInSameWord = /[اوي][\u0653]?[\u064B-\u065F\u0670]*\s*[ءأإ]/.test(rawWord);
    const hasMadd = hasMaddSign || hasLongVowel || hasShaddahAfterMadd || hasHamzahAfterMaddInSameWord;

    if (hasShaddahAfterMadd || (hasMaddSign && hasShaddah)) {
      activeRules.push('Madd Lazim (مد لازم - 6 xarakadood)');
    } else if (hasHamzahAfterMaddInSameWord) {
      activeRules.push('Madd Muttasil (مد متصل واجب - 4-5 xarakadood)');
    } else if (hasMaddSign) {
      // Madd sign, potentially Munfasil if next word starts with Hamzah
      const nextWord = words[idx + 1] ? normalizeArabicForComparison(words[idx + 1]) : '';
      if (nextWord && /^[اأإآ]/.test(nextWord)) {
        activeRules.push('Madd Munfasil (مد منفصل جائز - 4-5 xarakadood)');
      } else {
        activeRules.push('Madd Elongation');
      }
    } else if (hasLongVowel) {
      activeRules.push('Madd Asli (مد أصلي / طبيعي - 2 xarakadood)');
    }

    // 5. Ahkam Noon Sakinah and Tanween
    const hasTanween = /[\u064B\u064C\u064D]/.test(rawWord);
    const hasNoonSakin = /ن[\u0652]?/.test(rawWord) && !/ن[\u064E\u064F\u0650]/.test(rawWord);
    const hasNoonRule = hasTanween || hasNoonSakin;

    if (hasNoonRule) {
      const nextWord = words[idx + 1] ? normalizeArabicForComparison(words[idx + 1]) : '';
      const nextFirstChar = nextWord.charAt(0);

      if (/[ءهعحغخ]/.test(nextFirstChar)) {
        activeRules.push('Izhar Halqi (إظهار حلقي - Caddeyn)');
      } else if (nextFirstChar === 'ب') {
        activeRules.push('Iqlab (إقلاب - Beddelid)');
      } else if (/[ينمو]/.test(nextFirstChar)) {
        activeRules.push('Idgham bi Ghunnah (إدغام بغنة)');
      } else if (/[لر]/.test(nextFirstChar)) {
        activeRules.push('Idgham bila Ghunnah (إدغام بغير غنة)');
      } else if (/[صذثكجشقسدطزفتضظ]/.test(nextFirstChar)) {
        activeRules.push('Ikhfa Haqiqi (إخفاء حقيقي - Qarin)');
      } else {
        activeRules.push('Ahkam Noon Sakinah / Tanween');
      }
    }

    // 6. Ahkam Meem Sakinah
    const hasMeemSakin = /م[\u0652]?$/.test(rawWord) || (/م[\u0652]/.test(rawWord) && !/م[\u064E\u064F\u0650]/.test(rawWord));
    if (hasMeemSakin) {
      const nextWord = words[idx + 1] ? normalizeArabicForComparison(words[idx + 1]) : '';
      const nextFirstChar = nextWord.charAt(0);

      if (nextFirstChar === 'ب') {
        activeRules.push('Ikhfa Shafawi (إخفاء شفوي)');
      } else if (nextFirstChar === 'م') {
        activeRules.push('Idgham Shafawi (إدغام شفوي)');
      } else if (nextFirstChar) {
        activeRules.push('Izhar Shafawi (إظهار شفوي)');
      }
    }

    return {
      wordIndex: idx,
      rawText: rawWord,
      normalizedText: norm,
      hasQalqalah,
      hasGhunnah,
      hasMadd,
      hasNoonSakinahOrTanween: hasNoonRule,
      activeTajweedRules: activeRules,
      rules: activeRules,
      letterSegments: decomposeWordIntoLetterSegments(rawWord),
    };
  });
}

// -----------------------------------------------------------------------------
// Levenshtein Distance for Phonetic & Word Alignment
// -----------------------------------------------------------------------------
function computeEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// -----------------------------------------------------------------------------
// Core Verification & Assessment Engine
// -----------------------------------------------------------------------------
export interface StrictAyahEvaluationResult {
  ayahNumber: number;
  status: 'passed' | 'errors_detected' | 'unverified';
  confidence: number;
  wordVerifications: MacallinWordVerification[];
  mistakes: MacallinMistake[];
  feedbackMessageSo: string;
  feedbackMessageAr: string;
  feedbackMessageEn: string;
}

export interface StrictPassageEvaluationResult {
  surahNumber?: number;
  passageStartAyah?: number;
  passageEndAyah?: number;
  totalAyahsCount?: number;
  passedAyahsCount?: number;
  unverifiedAyahsCount?: number;
  status: 'passed' | 'errors_detected' | 'unverified';
  confidence: number;
  overallAccuracy?: number;
  totalWords: number;
  correctWordsCount: number;
  mistakesCount: number;
  ayahResults: StrictAyahEvaluationResult[];
  mistakes: MacallinMistake[];
  feedbackMessageSo: string;
  feedbackMessageAr?: string;
  feedbackMessageEn?: string;
  hasUnverifiedWords: boolean;
  summaryNote?: string;
  overallAccuracy?: number;
  wordVerifications?: MacallinWordVerification[];
  spokenTranscript?: string;
}

export const tajweedAssessmentEngine = {
  /**
   * Evaluates an individual Ayah word-by-word and letter-by-letter against the learner's spoken recitation.
   * Accurately categorizes errors into:
   * A. Xarakada (Harakat)
   * B. Xarfaha iyo makhaarijta
   * C. Tajwiidka
   * D. Erayada iyo aayadaha
   */
  evaluateAyahStrict(
    ayahNumber: number,
    authenticAyahText: string,
    spokenTranscript: string | null | undefined,
    surahNumber: number = 1
  ): StrictAyahEvaluationResult {
    const rawTranscript = (spokenTranscript || '').trim();

    const tokens = tokenizeAyahWithTajweed(authenticAyahText);
    if (tokens.length === 0) {
      return {
        ayahNumber,
        status: 'unverified',
        confidence: 0,
        wordVerifications: [],
        mistakes: [],
        feedbackMessageSo: 'Lama xaqiijin',
        feedbackMessageAr: 'لم يتم التحقق',
        feedbackMessageEn: 'Recitation could not be verified.',
      };
    }

    // 1. If audio or speech recognition did not capture words (Evidence-based check)
    if (!rawTranscript || rawTranscript.length < 2) {
      const unverifiedWords: MacallinWordVerification[] = tokens.map((t) => ({
        word_index: t.wordIndex,
        ayah_number: ayahNumber,
        raw_text: t.rawText,
        normalized_text: t.normalizedText,
        status: 'uncertain',
        letter_segments: t.letterSegments.map((seg) => ({ ...seg, isError: false })),
      }));

      return {
        ayahNumber,
        status: 'unverified',
        confidence: 0,
        wordVerifications: unverifiedWords,
        mistakes: [],
        feedbackMessageSo: 'Lama xaqiijin',
        feedbackMessageAr: 'لم يتم التحقق من التلاوة بشكل كامل.',
        feedbackMessageEn: 'Recitation could not be reliably verified.',
      };
    }

    const normSpoken = normalizeArabicForComparison(rawTranscript);
    const spokenWords = normSpoken.split(' ').filter(Boolean);

    const wordVerifications: MacallinWordVerification[] = [];
    const mistakes: MacallinMistake[] = [];
    let matchedCount = 0;
    let spokenIdx = 0;

    // Sequence alignment across authentic words
    for (let expIdx = 0; expIdx < tokens.length; expIdx++) {
      const expToken = tokens[expIdx];
      const expNorm = expToken.normalizedText;

      let bestMatchIdx = -1;
      let lowestDist = 999;

      // Look ahead up to 2 words
      const searchLimit = Math.min(spokenWords.length, spokenIdx + 3);
      for (let s = spokenIdx; s < searchLimit; s++) {
        const spkWord = spokenWords[s];
        const dist = computeEditDistance(expNorm, spkWord);
        if (dist < lowestDist) {
          lowestDist = dist;
          bestMatchIdx = s;
        }
      }

      const maxLen = Math.max(expNorm.length, bestMatchIdx >= 0 ? spokenWords[bestMatchIdx].length : 1);
      const similarity = bestMatchIdx >= 0 ? (maxLen - lowestDist) / maxLen : 0;

      // 1. Check Harakah mistakes (Category A: Xarakada)
      const matchedSpokenRaw = bestMatchIdx >= 0 ? spokenWords[bestMatchIdx] : '';
      const harakahMistake = this.detectHarakahMistake(expNorm, matchedSpokenRaw, expToken.rawText);

      // 2. Check Confusable Letter Substitutions (Category B: Xarfaha iyo makhaarijta)
      const confusion = bestMatchIdx >= 0 ? this.detectLetterConfusion(expNorm, matchedSpokenRaw) : null;

      // Case 1: Exact or very close base match (>= 80% or confirmed harakah/confusion match)
      if (bestMatchIdx >= 0 && (similarity >= 0.80 || harakahMistake !== null || confusion !== null)) {
        if (harakahMistake) {
          // Confirmed Harakah Error (Category A)
          const mistake: MacallinMistake = {
            id: `mistake-${surahNumber}-${ayahNumber}-${expIdx}`,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            word_index: expIdx,
            location_text: `Surah ${surahNumber}, Aayadda ${ayahNumber} • Erayga ${expIdx + 1} (${expToken.rawText})`,
            category: 'xarakada',
            category_label_so: 'Xarakada (Harakat)',
            type: 'harakah_error',
            expected_word: expToken.rawText,
            recited_word: harakahMistake.recitedWord,
            harakah_expected: harakahMistake.expectedHarakah,
            harakah_detected: harakahMistake.detectedHarakah,
            highlight_target: 'harakah',
            message: harakahMistake.explanationSo,
            explanation_so: harakahMistake.explanationSo,
            correction_tip: harakahMistake.correctionTip,
            confidence: 95,
          };
          mistakes.push(mistake);

          // Tag letter segments
          const segments = expToken.letterSegments.map((seg) => {
            const isTarget = seg.diacritics.length > 0 || (harakahMistake.charName && seg.char.includes(harakahMistake.charName.charAt(0)));
            return {
              ...seg,
              isError: isTarget,
              errorCategory: 'xarakada' as MacallinErrorCategory,
              errorType: 'harakah_error' as MacallinMistakeType,
              expectedHarakah: harakahMistake.expectedHarakah,
              detectedHarakah: harakahMistake.detectedHarakah,
              mistake,
            };
          });

          wordVerifications.push({
            word_index: expIdx,
            ayah_number: ayahNumber,
            raw_text: expToken.rawText,
            normalized_text: expNorm,
            status: 'error',
            mistake,
            letter_segments: segments,
          });
        } else if (confusion) {
          // Confirmed Letter & Makhraj Error (Category B)
          const mistake: MacallinMistake = {
            id: `mistake-${surahNumber}-${ayahNumber}-${expIdx}`,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            word_index: expIdx,
            location_text: `Surah ${surahNumber}, Aayadda ${ayahNumber} • Erayga ${expIdx + 1} (${expToken.rawText}), Xarafka '${confusion.expectedLetter}'`,
            category: 'makhaarijta',
            category_label_so: 'Xarfaha iyo makhaarijta',
            type: 'letter_substitution',
            expected_word: expToken.rawText,
            recited_word: matchedSpokenRaw,
            specific_letter: confusion.expectedLetter,
            makhraj_category: confusion.makhrajCategory,
            tajweed_rule: confusion.tajweedRule,
            highlight_target: 'letter',
            message: confusion.explanationSo,
            explanation_so: confusion.explanationSo,
            correction_tip: confusion.correctionTip,
            confidence: 96,
          };
          mistakes.push(mistake);

          // Tag letter segments
          const segments = expToken.letterSegments.map((seg) => ({
            ...seg,
            isError: seg.char === confusion.expectedLetter,
            errorCategory: 'makhaarijta' as MacallinErrorCategory,
            errorType: 'letter_substitution' as MacallinMistakeType,
            expectedLetter: confusion.expectedLetter,
            detectedLetter: confusion.detectedLetter,
            mistake,
          }));

          wordVerifications.push({
            word_index: expIdx,
            ayah_number: ayahNumber,
            raw_text: expToken.rawText,
            normalized_text: expNorm,
            status: 'error',
            mistake,
            specific_letter_error: confusion.expectedLetter,
            letter_segments: segments,
          });
        } else {
          // Word recited accurately
          matchedCount++;
          wordVerifications.push({
            word_index: expIdx,
            ayah_number: ayahNumber,
            raw_text: expToken.rawText,
            normalized_text: expNorm,
            status: 'correct',
            letter_segments: expToken.letterSegments.map((seg) => ({ ...seg, isError: false })),
          });
        }
        spokenIdx = bestMatchIdx + 1;
      } else if (bestMatchIdx >= 0 && similarity >= 0.45) {
        // Significant mismatch in word letters / phonetics
        const recitedWord = spokenWords[bestMatchIdx];
        const mistakeCategory: MacallinErrorCategory = confusion
          ? 'makhaarijta'
          : harakahMistake
          ? 'xarakada'
          : 'erayada';

        const categoryLabel =
          mistakeCategory === 'makhaarijta'
            ? 'Xarfaha iyo makhaarijta'
            : mistakeCategory === 'xarakada'
            ? 'Xarakada (Harakat)'
            : 'Erayada iyo aayadaha';

        const mistake: MacallinMistake = {
          id: `mistake-${surahNumber}-${ayahNumber}-${expIdx}`,
          surah_number: surahNumber,
          ayah_number: ayahNumber,
          word_index: expIdx,
          location_text: `Surah ${surahNumber}, Aayadda ${ayahNumber} • Erayga ${expIdx + 1} (${expToken.rawText})`,
          category: mistakeCategory,
          category_label_so: categoryLabel,
          type: confusion ? 'letter_substitution' : harakahMistake ? 'harakah_error' : 'mismatched_word',
          expected_word: expToken.rawText,
          recited_word: recitedWord,
          specific_letter: confusion?.expectedLetter,
          makhraj_category: confusion?.makhrajCategory || 'Al-Lisan (Tongue)',
          tajweed_rule: confusion?.tajweedRule,
          harakah_expected: harakahMistake?.expectedHarakah,
          harakah_detected: harakahMistake?.detectedHarakah,
          highlight_target: confusion ? 'letter' : harakahMistake ? 'harakah' : 'word',
          message: confusion?.explanationSo || harakahMistake?.explanationSo || `Erayga "${expToken.rawText}" si khaldan ayaa loo akhriyay.`,
          explanation_so:
            confusion?.explanationSo ||
            harakahMistake?.explanationSo ||
            `Erayga "${expToken.rawText}" si khaldan ayaa loo dhawaaqay. Waxaa la maqlay "${recitedWord}". Sax higaadda iyo xarfaha.`,
          correction_tip: confusion?.correctionTip || harakahMistake?.correctionTip || 'Dhageyso qaariga si aad u hesho dhawaaqa saxda ah.',
          confidence: 90,
        };
        mistakes.push(mistake);

        const segments = expToken.letterSegments.map((seg) => ({
          ...seg,
          isError: confusion ? seg.char === confusion.expectedLetter : harakahMistake ? seg.diacritics.length > 0 : true,
          errorCategory: mistakeCategory,
          errorType: (confusion ? 'letter_substitution' : harakahMistake ? 'harakah_error' : 'mismatched_word') as MacallinMistakeType,
          expectedHarakah: harakahMistake?.expectedHarakah,
          detectedHarakah: harakahMistake?.detectedHarakah,
          expectedLetter: confusion?.expectedLetter,
          detectedLetter: confusion?.detectedLetter,
          mistake,
        }));

        wordVerifications.push({
          word_index: expIdx,
          ayah_number: ayahNumber,
          raw_text: expToken.rawText,
          normalized_text: expNorm,
          status: 'error',
          mistake,
          specific_letter_error: confusion?.expectedLetter,
          letter_segments: segments,
        });
        spokenIdx = bestMatchIdx + 1;
      } else {
        // Missing / omitted word (Category D: Erayada iyo aayadaha)
        const mistake: MacallinMistake = {
          id: `mistake-${surahNumber}-${ayahNumber}-${expIdx}`,
          surah_number: surahNumber,
          ayah_number: ayahNumber,
          word_index: expIdx,
          location_text: `Surah ${surahNumber}, Aayadda ${ayahNumber} • Erayga ${expIdx + 1} (${expToken.rawText})`,
          category: 'erayada',
          category_label_so: 'Erayada iyo aayadaha',
          type: 'missing_word',
          expected_word: expToken.rawText,
          recited_word: '(Laga booday / Lama maqal)',
          highlight_target: 'word',
          message: `Erayga "${expToken.rawText}" waa laga booday ama lama maqal.`,
          explanation_so: `Erayga "${expToken.rawText}" waa laga booday akhriska dhexdiisa. Waa in aayad kasta erayadeeda si buuxda loo akhriyo.`,
          correction_tip: 'Ku celi aayadda adigoo raacaya tartanka erayada Qur’aanka.',
          confidence: 98,
        };
        mistakes.push(mistake);

        wordVerifications.push({
          word_index: expIdx,
          ayah_number: ayahNumber,
          raw_text: expToken.rawText,
          normalized_text: expNorm,
          status: 'error',
          mistake,
          letter_segments: expToken.letterSegments.map((seg) => ({ ...seg, isError: true, mistake })),
        });
      }
    }

    const accuracyRatio = tokens.length > 0 ? matchedCount / tokens.length : 0;
    const confidence = Math.round(accuracyRatio * 100);

    if (mistakes.length > 0) {
      return {
        ayahNumber,
        status: 'errors_detected',
        confidence,
        wordVerifications,
        mistakes,
        feedbackMessageSo: 'Fadlan ku laabo meelaha casaanka ah, sax khaladaadka, kuna celceli xifdinta. Dadaalkaagu waa muhiim.',
        feedbackMessageAr: 'يرجى مراجعة المواضع المحددة بالأحمر وتصحيح الأخطاء ومتابعة الحفظ.',
        feedbackMessageEn: 'Please review the red highlighted positions, correct mistakes, and practice recitation.',
      };
    }

    return {
      ayahNumber,
      status: 'passed',
      confidence: Math.max(96, confidence),
      wordVerifications,
      mistakes: [],
      feedbackMessageSo: 'Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.',
      feedbackMessageAr: 'ما شاء الله، لقد أتقنت تلاوة الآية الكريمة بشكل سليم. جزاك الله خيراً.',
      feedbackMessageEn: 'Well done, you recited the passage accurately. May Allah reward you.',
    };
  },

  /**
   * Helper to detect Harakah mistakes (Category A: Xarakada).
   * Checks both predefined high-fidelity diagnostic rules and generalized dynamic vowel checks.
   */
  detectHarakahMistake(
    expectedNorm: string,
    spokenNorm: string,
    rawUthmani: string
  ): {
    charName: string;
    expectedHarakah: string;
    detectedHarakah: string;
    recitedWord: string;
    explanationSo: string;
    correctionTip: string;
  } | null {
    if (!expectedNorm || !spokenNorm) return null;

    // 1. Check exact predefined diagnostic rules (Fatihah, Ikhlas, Baqarah, etc.)
    for (const rule of HARAKAH_RULES) {
      if (rule.expectedBasePattern.test(expectedNorm) && rule.detectedMistakePattern.test(spokenNorm)) {
        return {
          charName: rule.charName,
          expectedHarakah: rule.expectedHarakah,
          detectedHarakah: rule.detectedHarakah,
          recitedWord: spokenNorm,
          explanationSo: rule.explanationSo,
          correctionTip: rule.correctionTip,
        };
      }
    }

    // 2. Generalized dynamic harakah detection across ANY Quran verse
    if (rawUthmani && rawUthmani.length > 1 && expectedNorm !== spokenNorm) {
      // Check final vowel discrepancy
      const hasFinalFathah = /[\u064E]$/.test(rawUthmani) || /[\u064E][^ا-ي]*$/.test(rawUthmani);
      const hasFinalDammah = /[\u064F]$/.test(rawUthmani) || /[\u064F][^ا-ي]*$/.test(rawUthmani);
      const hasFinalKasrah = /[\u0650]$/.test(rawUthmani) || /[\u0650][^ا-ي]*$/.test(rawUthmani);
      const hasFinalTanweenDamm = /[\u064C]/.test(rawUthmani);
      const hasFinalTanweenFath = /[\u064B]/.test(rawUthmani);

      if (hasFinalFathah && (spokenNorm.endsWith('و') || spokenNorm.endsWith('ُ'))) {
        return {
          charName: 'Dhamaadka erayga',
          expectedHarakah: 'Fathah (ـَ)',
          detectedHarakah: 'Dammah (ـُ)',
          recitedWord: spokenNorm,
          explanationSo: `Waxaa la maqlay Dammah halkii laga rabay Fathah xarafka dambe ee erayga "${rawUthmani}".`,
          correctionTip: 'Afka kor u fur (Fathah) markaad dhameynayso eraygan.',
        };
      }

      if (hasFinalFathah && (spokenNorm.endsWith('ي') || spokenNorm.endsWith('ِ'))) {
        return {
          charName: 'Dhamaadka erayga',
          expectedHarakah: 'Fathah (ـَ)',
          detectedHarakah: 'Kasrah (ـِ)',
          recitedWord: spokenNorm,
          explanationSo: `Waxaa la maqlay Kasrah halkii laga rabay Fathah xarafka dambe ee erayga "${rawUthmani}".`,
          correctionTip: 'Afka fur (Fathah) adigoo aan daanka hoos u dhigin.',
        };
      }

      if (hasFinalDammah && (spokenNorm.endsWith('ا') || spokenNorm.endsWith('َ'))) {
        return {
          charName: 'Dhamaadka erayga',
          expectedHarakah: 'Dammah (ـُ)',
          detectedHarakah: 'Fathah (ـَ)',
          recitedWord: spokenNorm,
          explanationSo: `Waxaa la maqlay Fathah halkii laga rabay Dammah xarafka dambe ee erayga "${rawUthmani}".`,
          correctionTip: 'Labada dibnood soo wareeji (Dammah) dhammaadka erayga.',
        };
      }

      if (hasFinalKasrah && (spokenNorm.endsWith('ا') || spokenNorm.endsWith('َ'))) {
        return {
          charName: 'Dhamaadka erayga',
          expectedHarakah: 'Kasrah (ـِ)',
          detectedHarakah: 'Fathah (ـَ)',
          recitedWord: spokenNorm,
          explanationSo: `Waxaa la maqlay Fathah halkii laga rabay Kasrah xarafka dambe ee erayga "${rawUthmani}".`,
          correctionTip: 'Daanka hoos u yara dhig (Kasrah) dhammaadka erayga.',
        };
      }

      if (hasFinalTanweenDamm && (spokenNorm.endsWith('اً') || (spokenNorm.endsWith('ا') && !expectedNorm.endsWith('ا')))) {
        return {
          charName: 'Tanween',
          expectedHarakah: 'Tanween Damm (ـٌ)',
          detectedHarakah: 'Tanween Fath (ـً)',
          recitedWord: spokenNorm,
          explanationSo: `Waxaa la maqlay Tanween Fath halkii laga rabay Tanween Damm erayga "${rawUthmani}".`,
          correctionTip: 'Ku dhawaaq Tanween Damm dibnaha oo wareegsan.',
        };
      }
    }

    return null;
  },

  /**
   * Helper to identify if a specific confusable letter was substituted in the spoken word (Category B: Xarfaha iyo makhaarijta).
   * Checks both predefined rule list and generalized dynamic substitution pairings.
   */
  detectLetterConfusion(expectedNormalized: string, spokenNormalized: string): ConfusionRule | null {
    if (!expectedNormalized || !spokenNormalized) return null;

    // 1. Check exact predefined confusable letter rules
    for (const rule of CONFUSABLE_LETTER_RULES) {
      if (expectedNormalized.includes(rule.expectedLetter)) {
        if (spokenNormalized.includes(rule.detectedLetter) && !spokenNormalized.includes(rule.expectedLetter)) {
          return rule;
        }
      }
    }

    // 2. Dynamic check across all known confusable phonetic pairs
    const DYNAMIC_CONFUSABLE_PAIRS: [string, string][] = [
      ['ص', 'س'], ['س', 'ص'],
      ['ض', 'ظ'], ['ظ', 'ض'],
      ['ض', 'د'], ['د', 'ض'],
      ['ط', 'ت'], ['ت', 'ط'],
      ['ق', 'ك'], ['ك', 'ق'],
      ['ق', 'غ'], ['غ', 'ق'],
      ['ذ', 'ز'], ['ز', 'ذ'],
      ['ث', 'س'], ['س', 'ث'],
      ['ح', 'ه'], ['ه', 'ح'],
      ['ع', 'ء'], ['ء', 'ع'],
      ['غ', 'خ'], ['خ', 'غ'],
      ['ظ', 'ز'], ['ز', 'ظ'],
    ];

    for (const [expLetter, detLetter] of DYNAMIC_CONFUSABLE_PAIRS) {
      if (expectedNormalized.includes(expLetter) && spokenNormalized.includes(detLetter) && !spokenNormalized.includes(expLetter)) {
        const makhraj = ARABIC_MAKHAARIJ[expLetter];
        return {
          expectedLetter: expLetter,
          detectedLetter: detLetter,
          makhrajCategory: makhraj?.categorySo || 'Makhraj al-Huruf',
          tajweedRule: `Makhrajka ${makhraj?.nameSo || expLetter} (${expLetter})`,
          explanationSo: `Xarafka '${expLetter}' (${makhraj?.nameSo || expLetter}) waxaa loo akhriyay '${detLetter}'. ${makhraj?.pointDetailSo || ''}`,
          correctionTip: `Xarafka '${expLetter}' ka soo saar makhrajkiisa saxda ah: ${makhraj?.nameSo || expLetter}.`,
        };
      }
    }

    return null;
  },

  /**
   * Evaluates an entire passage (multiple ayahs) strictly word by word and letter by letter.
   */
  evaluatePassageStrict(
    passageVerses: { numberInSurah: number; text: string }[],
    spokenTranscript: string | null | undefined,
    surahNumber: number = 1
  ): StrictPassageEvaluationResult {
    const rawTranscript = (spokenTranscript || '').trim();
    const passageStartAyah = passageVerses[0]?.numberInSurah || 1;
    const passageEndAyah = passageVerses[passageVerses.length - 1]?.numberInSurah || 1;
    const totalAyahsCount = passageVerses.length;

    if (!rawTranscript || rawTranscript.length < 2) {
      const allAyahResults = passageVerses.map((v) =>
        this.evaluateAyahStrict(v.numberInSurah, v.text, '', surahNumber)
      );
      return {
        surahNumber,
        passageStartAyah,
        passageEndAyah,
        totalAyahsCount,
        passedAyahsCount: 0,
        unverifiedAyahsCount: totalAyahsCount,
        status: 'unverified',
        confidence: 0,
        totalWords: allAyahResults.reduce((acc, r) => acc + r.wordVerifications.length, 0),
        correctWordsCount: 0,
        mistakesCount: 0,
        ayahResults: allAyahResults,
        mistakes: [],
        feedbackMessageSo: 'Lama xaqiijin',
        feedbackMessageAr: 'لم يتم التحقق من تلاوة المقطع بالكامل.',
        feedbackMessageEn: 'Passage recitation could not be verified.',
        hasUnverifiedWords: true,
        summaryNote: 'Codka lama maqal ama makarafoonka ma qabanin erayo ku filan.',
      };
    }

    // If only 1 Ayah in passage, evaluate directly with rawTranscript
    if (passageVerses.length === 1) {
      const verse = passageVerses[0];
      const res = this.evaluateAyahStrict(verse.numberInSurah, verse.text, rawTranscript, surahNumber);
      const totalWords = res.wordVerifications.length;
      const correctWordsCount = res.wordVerifications.filter((w) => w.status === 'correct').length;
      return {
        surahNumber,
        passageStartAyah,
        passageEndAyah,
        totalAyahsCount: 1,
        passedAyahsCount: res.status === 'passed' ? 1 : 0,
        unverifiedAyahsCount: res.status === 'unverified' ? 1 : 0,
        status: res.status,
        confidence: res.confidence,
        overallAccuracy: res.confidence,
        totalWords,
        correctWordsCount,
        mistakesCount: res.mistakes.length,
        ayahResults: [res],
        mistakes: res.mistakes,
        feedbackMessageSo: res.feedbackMessageSo,
        feedbackMessageAr: res.feedbackMessageAr,
        feedbackMessageEn: res.feedbackMessageEn,
        hasUnverifiedWords: res.status === 'unverified',
        summaryNote: res.status === 'passed' ? 'Aayadda si sax ah ayaa loo akhriyay.' : undefined,
      };
    }

    // For multi-ayah passages, perform intelligent sequential alignment across Ayahs
    const normalizedSpokenWords = normalizeArabicForComparison(rawTranscript)
      .split(/\s+/)
      .filter(Boolean);

    const ayahResults: StrictAyahEvaluationResult[] = [];
    const allMistakes: MacallinMistake[] = [];
    let totalWords = 0;
    let correctWordsCount = 0;
    let spokenOffset = 0;

    for (let i = 0; i < passageVerses.length; i++) {
      const verse = passageVerses[i];
      const expectedTokens = tokenizeAyahWithTajweed(verse.text);
      const expectedWordsCount = expectedTokens.length;

      let verseTranscript = '';

      if (spokenOffset < normalizedSpokenWords.length) {
        // If not the last ayah, find where the NEXT ayah starts in spoken words
        let nextAyahStartOffset = -1;
        if (i < passageVerses.length - 1) {
          const nextVerse = passageVerses[i + 1];
          const nextVerseFirstWordNorm = normalizeArabicForComparison(
            nextVerse.text.split(/\s+/)[0] || ''
          );

          if (nextVerseFirstWordNorm) {
            // Search ahead in spokenWords after spokenOffset + Math.max(1, expectedWordsCount - 3)
            const searchStart = Math.min(
              normalizedSpokenWords.length,
              spokenOffset + Math.max(1, Math.floor(expectedWordsCount * 0.6))
            );
            for (let j = searchStart; j < normalizedSpokenWords.length; j++) {
              if (normalizedSpokenWords[j] === nextVerseFirstWordNorm) {
                nextAyahStartOffset = j;
                break;
              }
            }
          }
        }

        if (nextAyahStartOffset > spokenOffset) {
          verseTranscript = normalizedSpokenWords.slice(spokenOffset, nextAyahStartOffset).join(' ');
          spokenOffset = nextAyahStartOffset;
        } else {
          // Take expected word count + cushion or remaining words
          const takeCount =
            i === passageVerses.length - 1
              ? normalizedSpokenWords.length - spokenOffset
              : Math.min(normalizedSpokenWords.length - spokenOffset, expectedWordsCount + 2);
          verseTranscript = normalizedSpokenWords.slice(spokenOffset, spokenOffset + takeCount).join(' ');
          spokenOffset += takeCount;
        }
      }

      // If verseTranscript is empty, it evaluates as missing/unverified
      const res = this.evaluateAyahStrict(
        verse.numberInSurah,
        verse.text,
        verseTranscript,
        surahNumber
      );
      ayahResults.push(res);
      allMistakes.push(...res.mistakes);
      totalWords += res.wordVerifications.length;
      correctWordsCount += res.wordVerifications.filter((w) => w.status === 'correct').length;
    }

    const mistakesCount = allMistakes.length;
    const passedAyahsCount = ayahResults.filter((r) => r.status === 'passed').length;
    const unverifiedAyahsCount = ayahResults.filter((r) => r.status === 'unverified').length;
    const hasUnverified = unverifiedAyahsCount > 0;

    let overallStatus: 'passed' | 'errors_detected' | 'unverified' = 'passed';
    if (unverifiedAyahsCount === totalAyahsCount) {
      overallStatus = 'unverified';
    } else if (mistakesCount > 0 || hasUnverified) {
      overallStatus = 'errors_detected';
    } else {
      overallStatus = 'passed';
    }

    const confidence = totalWords > 0 ? Math.round((correctWordsCount / totalWords) * 100) : 0;

    return {
      surahNumber,
      passageStartAyah,
      passageEndAyah,
      totalAyahsCount,
      passedAyahsCount,
      unverifiedAyahsCount,
      status: overallStatus,
      confidence: overallStatus === 'passed' ? Math.max(95, confidence) : confidence,
      overallAccuracy: overallStatus === 'passed' ? Math.max(95, confidence) : confidence,
      totalWords,
      correctWordsCount,
      mistakesCount,
      ayahResults,
      mistakes: allMistakes,
      feedbackMessageSo:
        overallStatus === 'passed'
          ? 'Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.'
          : overallStatus === 'unverified'
          ? 'Lama xaqiijin'
          : 'Fadlan ku laabo meelaha casaanka ah, sax khaladaadka, kuna celceli xifdinta. Dadaalkaagu waa muhiim.',
      feedbackMessageAr:
        overallStatus === 'passed'
          ? 'ما شاء الله، لقد أتقنت تلاوة المقطع بالكامل بشكل سليم.'
          : overallStatus === 'unverified'
          ? 'لم يتم التحقق من تلاوة المقطع بالكامل.'
          : 'يرجى مراجعة المواضع المحددة وتصحيح الأخطاء.',
      feedbackMessageEn:
        overallStatus === 'passed'
          ? 'Well done, you recited the passage accurately. May Allah reward you.'
          : overallStatus === 'unverified'
          ? 'Passage recitation could not be reliably verified.'
          : 'Please review the red highlighted positions, correct mistakes, and practice recitation.',
      hasUnverifiedWords: hasUnverified,
      summaryNote:
        mistakesCount > 0
          ? `Waxaa la ogaaday ${mistakesCount} khaladaad ah oo ku jira ${totalAyahsCount} aayadood.`
          : undefined,
    };
  },
};
