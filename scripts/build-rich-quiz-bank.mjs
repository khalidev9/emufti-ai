import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateQuestionBank } from './validate-quiz-bank.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read existing questions
const existingJsonPath = path.join(rootDir, 'src', 'data', 'quizQuestions.json');
const existingQuestions = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));

console.log(`Loaded ${existingQuestions.length} existing base questions.`);

// We will construct authentic verified question groups
const rawNewQuestions = [
  // =========================================================================
  // CATEGORY 1: QURAN & QURANIC SCIENCES (quran)
  // =========================================================================
  {
    id: 'QRN-BEG-004',
    question_id: 'QRN-BEG-004',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'Which is the shortest Surah in the Holy Quran by number of verses?',
    question_so: 'Waa kuwee suuradda ugu gaaban guud ahaan Quraanka Kariimka ah marka loo eego tirada aayadaha?',
    question_ar: 'ما هي أقصر سورة في القرآن الكريم من حيث عدد الآيات؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Al-Asr', text_so: 'Suuradda Al-Casri', text_ar: 'سورة العصر' },
      { id: 'opt_2', text_en: 'Surah Al-Kawthar', text_so: 'Suuradda Al-Kowthar', text_ar: 'سورة الكوثر' },
      { id: 'opt_3', text_en: 'Surah An-Nasr', text_so: 'Suuradda An-Nasr', text_ar: 'سورة النصر' },
      { id: 'opt_4', text_en: 'Surah Al-Ikhlas', text_so: 'Suuradda Al-Ikhlaas', text_ar: 'سورة الإخلاص' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah Al-Kawthar (Chapter 108) is the shortest Surah in the Quran, consisting of exactly 3 concise verses and only 10 words.',
    explanation_so: 'Suuradda Al-Kowthar (Suuradda 108) waa suuradda ugu gaaban Quraanka, waxay ka kooban tahay 3 aayadood oo keliya.',
    explanation_ar: 'سورة الكوثر هي أقصر سورة في كتاب الله، وتتألف من 3 آيات وعشر كلمات فقط.',
    source_citation: 'Holy Quran, Surah Al-Kawthar (108:1-3)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-BEG-005',
    question_id: 'QRN-BEG-005',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'Which Surah does not begin with the Basmalah ("Bismillahir-Rahmanir-Rahim") in the Uthmanic Mushaf?',
    question_so: 'Waa kuwee suuradda aan ku bilaaban Basmalahda ("Bismillaahi Raxmaani Raxiim") gudaha Mushafka?',
    question_ar: 'ما هي السورة الوحيدة في القرآن الكريم التي لا تفتتح بـ \"بسم الله الرحمن الرحيم\"؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Al-Anfal', text_so: 'Suuradda Al-Anfaal', text_ar: 'سورة الأنفال' },
      { id: 'opt_2', text_en: 'Surah At-Tawbah (Bara\'ah)', text_so: 'Suuradda At-Tawbah (Baraa\'ah)', text_ar: 'سورة التوبة (براءة)' },
      { id: 'opt_3', text_en: 'Surah Al-Qiyamah', text_so: 'Suuradda Al-Qiyaamah', text_ar: 'سورة القيامة' },
      { id: 'opt_4', text_en: 'Surah Muhammad', text_so: 'Suuradda Muxammad', text_ar: 'سورة محمد' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah At-Tawbah (Chapter 9) does not begin with the Basmalah because it was revealed with the declaration of disassociation from idolaters, and Basmalah signifies mercy and safety.',
    explanation_so: 'Suuradda At-Tawbah (Suuradda 9) kuma bilaabato Bismillaahi Raxmaani Raxiim maxaa yeelay waxay ku soo degtay baabi\'inta heshiiskii mushrikiinta, bismilladuna waa nabadgelyo.',
    explanation_ar: 'سورة التوبة لا تبدأ بالبسملة لأنها نزلت بالسيف والبراءة من المشركين، والبسملة أمان ورحمة.',
    source_citation: 'Tafsir Ibn Kathir, Surah At-Tawbah; Sahih al-Bukhari 4654',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-BEG-006',
    question_id: 'QRN-BEG-006',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'Which Surah contains the Basmalah twice—once at the opening and once within verse 30?',
    question_so: 'Waa kuwee suuradda ay Basmalahdu ku qoran tahay laba jeer—hal mar bilowga iyo hal mar gudaheeda aayadda 30-aad?',
    question_ar: 'ما هي السورة التي ذكرت فيها البسملة مرتين، مرة في مستهلها ومرة في ثنايا آياتها؟',
    options: [
      { id: 'opt_1', text_en: 'Surah An-Naml', text_so: 'Suuradda An-Naml', text_ar: 'سورة النمل' },
      { id: 'opt_2', text_en: 'Surah Saba', text_so: 'Suuradda Saba', text_ar: 'سورة سبأ' },
      { id: 'opt_3', text_en: 'Surah Fatir', text_so: 'Suuradda Faadir', text_ar: 'سورة فاطر' },
      { id: 'opt_4', text_en: 'Surah Al-Qasas', text_so: 'Suuradda Al-Qasas', text_ar: 'سورة القصص' },
    ],
    correct_option_id: 'opt_1',
    explanation_en: 'Surah An-Naml contains two Basmalahs: the opening heading and in verse 30 during Prophet Sulayman\'s letter to Bilqis: "Innahu min Sulaymana wa innahu bismillahir-rahmanir-rahim".',
    explanation_so: 'Suuradda An-Naml waxay leedahay laba Basmalah, midda koowaad waa bilowga suuradda, midda labaadna waa aayadda 30-aad ee ku saabsan warqaddii Nabi Sulaymaan.',
    explanation_ar: 'سورة النمل فيها بسملتان: في مطلع السورة، وفي الآية 30 في كتاب سليمان عليه السلام: {إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ}.',
    source_citation: 'Holy Quran, Surah An-Naml (27:30)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-INT-004',
    question_id: 'QRN-INT-004',
    category: 'quran',
    difficulty: 'intermediate',
    question_en: 'What are the two luminous chapters collectively praised by Prophet Muhammad ﷺ as "Az-Zahrawayn"?',
    question_so: 'Waa kuwee labada suuradood ee iftiinka badan ee Nabigu ﷺ ku magacaabay "Az-Zahrawayn" (Labada Iftiimaya)?',
    question_ar: 'ما هما السورتان العظيمتان اللتان لقبهما النبي ﷺ بـ \"الزهراوين\"؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Al-Baqarah and Surah Ali \'Imran', text_so: 'Suuradda Al-Baqarah iyo Suuradda Aali Cimraan', text_ar: 'سورة البقرة وسورة آل عمران' },
      { id: 'opt_2', text_en: 'Surah Al-An\'am and Surah Al-A\'raf', text_so: 'Suuradda Al-Ancaam iyo Suuradda Al-Acraaf', text_ar: 'سورة الأنعام وسورة الأعراف' },
      { id: 'opt_3', text_en: 'Surah Al-Falaq and Surah An-Nas', text_so: 'Suuradda Al-Falaq iyo Suuradda An-Naas', text_ar: 'سورة الفلق وسورة الناس' },
      { id: 'opt_4', text_en: 'Surah Ya-Sin and Surah Al-Mulk', text_so: 'Suuradda Yaasiin iyo Suuradda Al-Mulk', text_ar: 'سورة يس وسورة الملك' },
    ],
    correct_option_id: 'opt_1',
    explanation_en: 'The Prophet ﷺ said: "Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection. Read Az-Zahrawayn: Al-Baqarah and Surah Ali \'Imran."',
    explanation_so: 'Nabigu ﷺ wuxuu yiri: "Akhriya labada iftiimaya: Al-Baqarah iyo Aali Cimraan, maxaa yeelay waxay imaanayaan Maalinta Qiyaame sida laba darroor oo kale."',
    explanation_ar: 'قال رسول الله ﷺ: \"اقْرَؤُوا الزَّهْرَاوَيْنِ: الْبَقَرَةَ وَسُورَةَ آلِ عِمْرَانَ، فَإِنَّهُمَا تَأْتِيَانِ يَوْمَ الْقِيَامَةِ كَأَنَّهُمَا غَمَامَتَانِ\".',
    source_citation: 'Sahih Muslim 804',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-ADV-004',
    question_id: 'QRN-ADV-004',
    category: 'quran',
    difficulty: 'advanced',
    question_en: 'Which is the only Surah in the Holy Quran named after a woman?',
    question_so: 'Waa kuwee suuradda keliya ee Quraanka Kariimka ah ee loogu magac daray magac dumar?',
    question_ar: 'ما هي السورة الوحيدة في القرآن الكريم التي سُميت باسم امرأة صالحة؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Asiyah', text_so: 'Suuradda Aasiya', text_ar: 'سورة آسية' },
      { id: 'opt_2', text_en: 'Surah Maryam', text_so: 'Suuradda Maryam', text_ar: 'سورة مريم' },
      { id: 'opt_3', text_en: 'Surah Khadijah', text_so: 'Suuradda Khadiija', text_ar: 'سورة خديجة' },
      { id: 'opt_4', text_en: 'Surah Fatimah', text_so: 'Suuradda Faadumo', text_ar: 'سورة فاطمة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah Maryam (Chapter 19) is the only Surah named after a woman, honoring Maryam bint Imran, mother of Prophet Isa (Jesus) peace be upon him.',
    explanation_so: 'Suuradda Maryam (Suuradda 19) waa suuradda keliya ee loogu magac daray haweeney, waana Maryama bintu Cimraan hooyadii Nabi Ciise CS.',
    explanation_ar: 'سورة مريم (رقم 19) هي السورة الوحيدة في القرآن التي سميت باسم امرأة تكريماً لمريم بنت عمران عليها السلام.',
    source_citation: 'Holy Quran, Surah Maryam (19); Quran 3:42',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
];

console.log(`Prepared sample questions. Testing validator...`);
const errors = validateQuestionBank([...existingQuestions, ...rawNewQuestions]);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
} else {
  console.log('Sample questions validated successfully with ZERO errors!');
}
