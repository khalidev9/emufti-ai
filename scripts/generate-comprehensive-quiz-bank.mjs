import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateQuestionBank } from './validate-quiz-bank.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const QUIZ_CATEGORIES_METADATA = [
  {
    id: 'quran',
    name_en: 'Quran & Quranic Sciences',
    name_so: "Qur'aanka & Culuumtiisa",
    name_ar: 'القرآن وعلومه',
    description_en: 'Verses, Surahs, revelation context, and Quranic structure.',
    description_so: 'Aayadaha, Suuradaha, Sababaha soo degidda, iyo qaab-dhismeedka Quraanka.',
    iconName: 'BookOpen',
  },
  {
    id: 'tafsir',
    name_en: 'Tafsir & Verse Understanding',
    name_so: 'Tafsiirka & Macnaha Aayadaha',
    name_ar: 'التفسير وفهم الآيات',
    description_en: 'Scholarly exegesis, deep meanings, and core themes of the Quran.',
    description_so: 'Fahamka qotoda dheer, macnayaasha aayadaha, iyo fasiraadda culimada.',
    iconName: 'FileText',
  },
  {
    id: 'hadith',
    name_en: 'Hadith & Hadith Sciences',
    name_so: 'Xadiiska & Mustalaxa Xadiiska',
    name_ar: 'الحديث الشريف وعلومه',
    description_en: 'Prophetic traditions, chains of narration, and canonical collections.',
    description_so: 'Sunnada Nabiga ﷺ, silsiladda xadiiska, iyo kutubta saxiixa ah.',
    iconName: 'Scroll',
  },
  {
    id: 'aqeedah',
    name_en: 'Aqeedah & Islamic Creed',
    name_so: 'Caqiidada & Tiirarka Iimaanka',
    name_ar: 'العقيدة الإسلامية والإيمان',
    description_en: 'Tawheed, the Six Pillars of Faith, and sound Islamic belief.',
    description_so: 'Towxiidka, 6-da Tiir ee Iimaanka, iyo caqiidada toosan.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'fiqh',
    name_en: 'Fiqh & Islamic Jurisprudence',
    name_so: 'Fiqiga & Xukunnada Shareecada',
    name_ar: 'الفقه وأصول الأحكام',
    description_en: 'Rulings of Shariah, legal principles, and authentic juristic schools.',
    description_so: 'Xukunnada shareecada, axkaamta sharciga ah, iyo masaailka fiqiga.',
    iconName: 'Compass',
  },
  {
    id: 'purification_prayer',
    name_en: 'Purification & Salah (Prayer)',
    name_so: 'Daahirada & Salaadda',
    name_ar: 'الطهارة والصلاة',
    description_en: 'Wudu, Ghusl, Tayammum, conditions, pillars, and rulings of daily Salah.',
    description_so: 'Weysada, Qubayska, Tayamumka, shuruudaha, iyo tiirarka salaadda.',
    iconName: 'Sparkles',
  },
  {
    id: 'fasting_ramadan',
    name_en: 'Fasting & Ramadan',
    name_so: 'Soonka & Bisha Ramadaan',
    name_ar: 'الصيام وأحكام رمضان',
    description_en: 'Rules of Sawm, virtues of Ramadan, Laylatul Qadr, and Taraweeh.',
    description_so: 'Axkaamta soonka, fadliga Ramadaan, Laylatul Qadri, iyo Taraawiixda.',
    iconName: 'Moon',
  },
  {
    id: 'zakat_charity',
    name_en: 'Zakat & Islamic Charity',
    name_so: 'Sakada & Sadaqada',
    name_ar: 'الزكاة والصدقات',
    description_en: 'Nisab thresholds, categories of Zakat recipients, and charity virtues.',
    description_so: 'Nisaabka dahabka/lacagta, 8-da kooxood ee sakada la siiyo, iyo sadaqada.',
    iconName: 'Award',
  },
  {
    id: 'hajj_umrah',
    name_en: 'Hajj & Umrah Pilgrimage',
    name_so: 'Xajka & Cumrada',
    name_ar: 'الحج والعمرة',
    description_en: 'Pillars of Hajj, rites at Mina and Arafah, Tawaf, Sa’i, and Miqat.',
    description_so: 'Tiirarka Xajka, taagnida Carafo, Dawaafka, Saciga, iyo Miqaatka.',
    iconName: 'Globe',
  },
  {
    id: 'seerah',
    name_en: 'Seerah & Prophetic Biography',
    name_so: 'Siirada Nabiga ﷺ',
    name_ar: 'السيرة النبوية العطرة',
    description_en: 'The blessed life, character, milestones, and expeditions of Prophet Muhammad ﷺ.',
    description_so: 'Nolosha barakaysan ee Nabigeenna Muxammad ﷺ iyo dhacdooyinkii taariikhiga ahaa.',
    iconName: 'User',
  },
  {
    id: 'history_companions',
    name_en: 'Islamic History & Sahabah',
    name_so: 'Taariikhda Islaamka & Saxaabada',
    name_ar: 'التاريخ الإسلامي والصحابة',
    description_en: 'The Rightly-Guided Caliphs, noble Companions, and Islamic civilizational history.',
    description_so: 'Khulafadii Raashidiinta, Saxaabadii sharafta lahaa, iyo taariikhda Islaamka.',
    iconName: 'Clock',
  },
  {
    id: 'adhkar_duas_manners',
    name_en: 'Adhkar, Duas & Islamic Manners',
    name_so: 'Adkaarta, Ducooyinka & Asluubta',
    name_ar: 'الأذكار والأدعية والآداب',
    description_en: 'Daily supplications, morning/evening remembrances, and Islamic etiquette.',
    description_so: 'Ducooyinka maalinlaha ah, adkaarta subax/galab, iyo asluubta Islaamiga ah.',
    iconName: 'HelpCircle',
  },
  {
    id: 'ethics_daily_life',
    name_en: 'Islamic Ethics & Daily Life',
    name_so: 'Akhlaaqda & Nolosha Maalinlaha ah',
    name_ar: 'الأخلاق الإسلامية والمعاملات',
    description_en: 'Honesty, filial piety (Birr al-Walidayn), neighborly duty, and moral virtues.',
    description_so: 'Baarrinimada waalidiinta, xiriirinta qaraabada, runta, iyo dabeecadaha suuban.',
    iconName: 'Heart',
  },
  {
    id: 'arabic_terminology',
    name_en: 'Arabic Islamic Terminology',
    name_so: 'Eray-bixinta Carabiga ee Islaamka',
    name_ar: 'المصطلحات الشرعية والعربية',
    description_en: 'Meanings of foundational Islamic terms like Taqwa, Tawakkul, Ikhlas, and Sunnah.',
    description_so: 'Macnaha erayada muhiimka ah sida Taqwa, Tawaakul, Ikhlaas, iyo Sunno.',
    iconName: 'Languages',
  },
  {
    id: 'general',
    name_en: 'General Islamic Knowledge',
    name_so: 'Aqoon Guud oo Islaami ah',
    name_ar: 'معلومات إسلامية عامة',
    description_en: 'Islamic calendar, sacred months, holy sites, and overarching Islamic heritage.',
    description_so: 'Hijdiyada, bilaha xurmada leh, goobaha barakaysan, iyo macluumaad guud.',
    iconName: 'Trophy',
  },
];

// Helper to write formatted TypeScript code
console.log('Category metadata configured successfully.');
