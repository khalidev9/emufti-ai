import type { QuizCategory, QuizDifficulty, QuizOption, QuizQuestion, ShuffledQuizQuestion, QuizCategoryMeta } from '../types/database.ts';
import rawQuestions from './quizQuestions.json' with { type: 'json' };

/**
 * EMUFTI AI — 1,000-QUESTION ISLAMIC QUIZ QUESTION BANK & PIPELINE
 * 
 * Standards & Principles:
 * 1. ZERO duplicate, filler, or template questions.
 * 2. Every question tests distinct, verified Islamic knowledge.
 * 3. Exactly 4 plausible, authentic options per question using stable option IDs ('opt_1'..'opt_4').
 * 4. Balanced distribution across all 15 authentic Islamic knowledge categories.
 * 5. Distinct difficulty tiers: Beginner (Aasaasi), Intermediate (Dhexdhexaad), Advanced (Sare).
 * 6. High-quality natural translations in English, Somali, and Arabic.
 * 7. Explicit primary citations (Holy Quran, Sahih al-Bukhari, Sahih Muslim, classical scholarly references).
 * 8. Shuffle engine preserves correct answer via stable option IDs and balances positions across A, B, C, D.
 */

export const QUIZ_CATEGORIES_METADATA: QuizCategoryMeta[] = [
  {
    "id": "quran",
    "name_en": "Quran & Quranic Sciences",
    "name_so": "Qur'aanka & Culuumtiisa",
    "name_ar": "القرآن وعلومه",
    "description_en": "Verses, Surahs, revelation context, and Quranic structure.",
    "description_so": "Aayadaha, Suuradaha, Sababaha soo degidda, iyo qaab-dhismeedka Quraanka.",
    "iconName": "BookOpen"
  },
  {
    "id": "tafsir",
    "name_en": "Tafsir & Verse Understanding",
    "name_so": "Tafsiirka & Macnaha Aayadaha",
    "name_ar": "التفسير وفهم الآيات",
    "description_en": "Scholarly exegesis, deep meanings, and core themes of the Quran.",
    "description_so": "Fahamka qotoda dheer, macnayaasha aayadaha, iyo fasiraadda culimada.",
    "iconName": "FileText"
  },
  {
    "id": "hadith",
    "name_en": "Hadith & Hadith Sciences",
    "name_so": "Xadiiska & Mustalaxa Xadiiska",
    "name_ar": "الحديث الشريف وعلومه",
    "description_en": "Prophetic traditions, chains of narration, and canonical collections.",
    "description_so": "Sunnada Nabiga ﷺ, silsiladda xadiiska, iyo kutubta saxiixa ah.",
    "iconName": "Scroll"
  },
  {
    "id": "aqeedah",
    "name_en": "Aqeedah & Islamic Creed",
    "name_so": "Caqiidada & Tiirarka Iimaanka",
    "name_ar": "العقيدة الإسلامية والإيمان",
    "description_en": "Tawheed, the Six Pillars of Faith, and sound Islamic belief.",
    "description_so": "Towxiidka, 6-da Tiir ee Iimaanka, iyo caqiidada toosan.",
    "iconName": "ShieldCheck"
  },
  {
    "id": "fiqh",
    "name_en": "Fiqh & Islamic Jurisprudence",
    "name_so": "Fiqiga & Xukunnada Shareecada",
    "name_ar": "الفقه وأصول الأحكام",
    "description_en": "Rulings of Shariah, legal principles, and authentic juristic schools.",
    "description_so": "Xukunnada shareecada, axkaamta sharciga ah, iyo masaailka fiqiga.",
    "iconName": "Compass"
  },
  {
    "id": "purification_prayer",
    "name_en": "Purification & Salah (Prayer)",
    "name_so": "Daahirada & Salaadda",
    "name_ar": "الطهارة والصلاة",
    "description_en": "Wudu, Ghusl, Tayammum, conditions, pillars, and rulings of daily Salah.",
    "description_so": "Weysada, Qubayska, Tayamumka, shuruudaha, iyo tiirarka salaadda.",
    "iconName": "Sparkles"
  },
  {
    "id": "fasting_ramadan",
    "name_en": "Fasting & Ramadan",
    "name_so": "Soonka & Bisha Ramadaan",
    "name_ar": "الصيام وأحكام رمضان",
    "description_en": "Rules of Sawm, virtues of Ramadan, Laylatul Qadr, and Taraweeh.",
    "description_so": "Axkaamta soonka, fadliga Ramadaan, Laylatul Qadri, iyo Taraawiixda.",
    "iconName": "Moon"
  },
  {
    "id": "zakat_charity",
    "name_en": "Zakat & Islamic Charity",
    "name_so": "Sakada & Sadaqada",
    "name_ar": "الزكاة والصدقات",
    "description_en": "Nisab thresholds, categories of Zakat recipients, and charity virtues.",
    "description_so": "Nisaabka dahabka/lacagta, 8-da kooxood ee sakada la siiyo, iyo sadaqada.",
    "iconName": "Award"
  },
  {
    "id": "hajj_umrah",
    "name_en": "Hajj & Umrah Pilgrimage",
    "name_so": "Xajka & Cumrada",
    "name_ar": "الحج والعمرة",
    "description_en": "Pillars of Hajj, rites at Mina and Arafah, Tawaf, Sa’i, and Miqat.",
    "description_so": "Tiirarka Xajka, taagnida Carafo, Dawaafka, Saciga, iyo Miqaatka.",
    "iconName": "Globe"
  },
  {
    "id": "seerah",
    "name_en": "Seerah & Prophetic Biography",
    "name_so": "Siirada Nabiga ﷺ",
    "name_ar": "السيرة النبوية العطرة",
    "description_en": "The blessed life, character, milestones, and expeditions of Prophet Muhammad ﷺ.",
    "description_so": "Nolosha barakaysan ee Nabigeenna Muxammad ﷺ iyo dhacdooyinkii taariikhiga ahaa.",
    "iconName": "User"
  },
  {
    "id": "history_companions",
    "name_en": "Islamic History & Sahabah",
    "name_so": "Taariikhda Islaamka & Saxaabada",
    "name_ar": "التاريخ الإسلامي والصحابة",
    "description_en": "The Rightly-Guided Caliphs, noble Companions, and Islamic civilizational history.",
    "description_so": "Khulafadii Raashidiinta, Saxaabadii sharafta lahaa, iyo taariikhda Islaamka.",
    "iconName": "Clock"
  },
  {
    "id": "adhkar_duas_manners",
    "name_en": "Adhkar, Duas & Islamic Manners",
    "name_so": "Adkaarta, Ducooyinka & Asluubta",
    "name_ar": "الأذكار والأدعية والآداب",
    "description_en": "Daily supplications, morning/evening remembrances, and Islamic etiquette.",
    "description_so": "Ducooyinka maalinlaha ah, adkaarta subax/galab, iyo asluubta Islaamiga ah.",
    "iconName": "HelpCircle"
  },
  {
    "id": "ethics_daily_life",
    "name_en": "Islamic Ethics & Daily Life",
    "name_so": "Akhlaaqda & Nolosha Maalinlaha ah",
    "name_ar": "الأخلاق الإسلامية والمعاملات",
    "description_en": "Honesty, filial piety (Birr al-Walidayn), neighborly duty, and moral virtues.",
    "description_so": "Baarrinimada waalidiinta, xiriirinta qaraabada, runta, iyo dabeecadaha suuban.",
    "iconName": "Heart"
  },
  {
    "id": "arabic_terminology",
    "name_en": "Arabic Islamic Terminology",
    "name_so": "Eray-bixinta Carabiga ee Islaamka",
    "name_ar": "المصطلحات الشرعية والعربية",
    "description_en": "Meanings of foundational Islamic terms like Taqwa, Tawakkul, Ikhlas, and Sunnah.",
    "description_so": "Macnaha erayada muhiimka ah sida Taqwa, Tawaakul, Ikhlaas, iyo Sunno.",
    "iconName": "Languages"
  },
  {
    "id": "general",
    "name_en": "General Islamic Knowledge",
    "name_so": "Aqoon Guud oo Islaami ah",
    "name_ar": "معلومات إسلامية عامة",
    "description_en": "Islamic calendar, sacred months, holy sites, and overarching Islamic heritage.",
    "description_so": "Hijdiyada, bilaha xurmada leh, goobaha barakaysan, iyo macluumaad guud.",
    "iconName": "Trophy"
  }
];

export const VERIFIED_QUESTION_BANK: QuizQuestion[] = (rawQuestions as unknown as QuizQuestion[]).map(q => ({
  ...q,
  options_en: q.options.map(o => o.text_en) as [string, string, string, string],
  options_so: q.options.map(o => o.text_so) as [string, string, string, string],
  options_ar: (q.options.map(o => o.text_ar || o.text_en)) as [string, string, string, string],
  correct_index: q.options.findIndex(o => o.id === q.correct_option_id),
}));

export const TOTAL_VERIFIED_QUESTIONS = VERIFIED_QUESTION_BANK.filter(q => q.is_active !== false).length;
export const QUESTION_BANK = VERIFIED_QUESTION_BANK;
export const TOTAL_QUESTION_BANK_COUNT = TOTAL_VERIFIED_QUESTIONS;

/**
 * Randomizes options for a question using stable option IDs.
 * Ensures the correct answer position is unpredictable (A, B, C, or D).
 */
export function shuffleQuestionOptions(
  question: QuizQuestion,
  randomFn: () => number = Math.random
): ShuffledQuizQuestion {
  const optionsCopy = [...question.options];
  
  // Fisher-Yates shuffle
  for (let i = optionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
  }

  const displayedCorrectIndex = optionsCopy.findIndex(o => o.id === question.correct_option_id);

  return {
    ...question,
    options: optionsCopy as [QuizOption, QuizOption, QuizOption, QuizOption],
    shuffled_options: optionsCopy,
    displayed_correct_index: displayedCorrectIndex,
    options_en: optionsCopy.map(o => o.text_en) as [string, string, string, string],
    options_so: optionsCopy.map(o => o.text_so) as [string, string, string, string],
    options_ar: optionsCopy.map(o => o.text_ar) as [string, string, string, string],
    correct_index: displayedCorrectIndex,
  };
}

/**
 * Retrieves quiz questions filtered strictly by category and difficulty.
 */
export function getQuizQuestions(options?: {
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  count?: number;
  seed?: number;
  randomFn?: () => number;
}): ShuffledQuizQuestion[] {
  const { category = 'all', difficulty = 'all', count = 10, seed = Date.now(), randomFn } = options || {};

  // 1. Filter active questions
  let pool = VERIFIED_QUESTION_BANK.filter(q => q.is_active !== false);

  // 2. Category filtering with support for legacy aliases
  if (category && category !== 'all') {
    if (category === 'history') {
      pool = pool.filter(q => q.category === 'history' || q.category === 'history_companions');
    } else if (category === 'akhlaaq') {
      pool = pool.filter(q => q.category === 'akhlaaq' || q.category === 'ethics_daily_life');
    } else if (category === 'manners') {
      pool = pool.filter(q => q.category === 'manners' || q.category === 'adhkar_duas_manners');
    } else {
      pool = pool.filter(q => q.category === category);
    }
  }

  // 3. Difficulty filtering
  if (difficulty && difficulty !== 'all') {
    if (difficulty === 'beginner' || difficulty === 'easy') {
      pool = pool.filter(q => q.difficulty === 'beginner' || q.difficulty === 'easy');
    } else if (difficulty === 'intermediate' || difficulty === 'medium') {
      pool = pool.filter(q => q.difficulty === 'intermediate' || q.difficulty === 'medium');
    } else if (difficulty === 'advanced' || difficulty === 'hard') {
      pool = pool.filter(q => q.difficulty === 'advanced' || q.difficulty === 'hard');
    }
  }

  // 4. Shuffle questions without duplicates in this attempt
  const shuffledQuestions = [...pool];
  let s = seed;
  const rng = randomFn || (() => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  });

  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }

  const selected = shuffledQuestions.slice(0, count);

  // 5. Shuffle options for each selected question
  return selected.map(q => shuffleQuestionOptions(q, rng));
}

/**
 * Returns question bank counts by category and difficulty.
 */
export function getQuestionBankStats() {
  const total = VERIFIED_QUESTION_BANK.length;
  const active = VERIFIED_QUESTION_BANK.filter(q => q.is_active !== false).length;

  const byDifficulty: Record<QuizDifficulty, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    all: total,
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const q of VERIFIED_QUESTION_BANK) {
    if (byDifficulty[q.difficulty] !== undefined) {
      byDifficulty[q.difficulty]++;
    }
  }

  const byCategory: Partial<Record<QuizCategory, number>> = {};
  for (const q of VERIFIED_QUESTION_BANK) {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  }

  return {
    total,
    active,
    byDifficulty,
    byCategory,
  };
}

export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const cat of QUIZ_CATEGORIES_METADATA) {
    stats[cat.id] = 0;
  }

  for (const q of VERIFIED_QUESTION_BANK) {
    if (stats[q.category] !== undefined) {
      stats[q.category]++;
    } else {
      stats[q.category] = 1;
    }
  }

  return stats;
}

export function getQuestionById(id: string): QuizQuestion | undefined {
  return VERIFIED_QUESTION_BANK.find(q => q.id === id || q.question_id === id);
}

/**
 * Scholarly guidance for "Ask EMufti" lifeline.
 */
export function generateAskEMuftiHint(
  question: QuizQuestion,
  language: 'en' | 'so' | 'ar' = 'en'
): string {
  const citation = question.source_citation || 'Islamic scholarship';
  
  if (language === 'so') {
    return `Talo & Tilmaan ka socota EMufti AI:\n\nSu'aashan waxay ku saabsan tahay culuumta diinta ee (${question.category.toUpperCase()}).\nFadlan fiiro gaar ah u yeelo daliilka asalka ah ee la xaqiijiyay: [${citation}].\nXusuusnow in diinta Islaamku ay ku salaysan tahay Quraanka, Xadiisyada saxiixa ah, iyo heshiiska culimada. Xulashada saxda ah waxay toos ugu qotontaa daliilkaas la xusay!`;
  }

  if (language === 'ar') {
    return `توجيه وإرشاد من إي مفتي:\n\nهذه المسألة المباركة من مسائل علم (${question.category}).\nتأمل في المصدر والدليل الشرعي المعتمد: [${citation}].\nتذكر أن الإجابة الصحيحة تتوافق تماماً مع صريح النص الشرعي الموثق. تفكر في المعنى بدقة وستجد الخيار الصحيح بوضوح بإذن الله!`;
  }

  return `Scholarly Guidance from EMufti AI:\n\nThis inquiry relates to verified Islamic ${question.category.toUpperCase()} sciences.\nReflect carefully upon the established primary proof: [${citation}].\nRecall that the correct Islamic ruling aligns directly with authentic Quranic and Hadith precedents without conjecture. Focus on the core proof cited above to identify the true answer!`;
}
