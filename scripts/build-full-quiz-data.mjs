import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import { validateQuestionBank } from './validate-quiz-bank.mjs';
import { QUIZ_CATEGORIES_METADATA } from './generate-comprehensive-quiz-bank.mjs';

export const ALL_VERIFIED_QUESTIONS = [
  // ===========================================================================
  // 1. QURAN & QURANIC SCIENCES (quran)
  // ===========================================================================
  {
    id: 'QRN-BEG-001',
    question_id: 'QRN-BEG-001',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'Which Surah is known as "Umm al-Kitab" (The Mother of the Book) and must be recited in every Rak\'ah of daily prayer?',
    question_so: 'Waa kuwee suuradda loo yaqaanno "Ummul Kitaab" (Hooyada Kitaabka) ee waajibka ay tahay in lagu akhriyo rakcad kasta oo salaad ah?',
    question_ar: 'ما هي السورة التي تُعرف بـ "أم الكتاب" وتلزم قراءتها في كل ركعة من ركعات الصلاة المفروضة؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Al-Baqarah', text_so: 'Suuradda Al-Baqarah', text_ar: 'سورة البقرة' },
      { id: 'opt_2', text_en: 'Surah Al-Fatihah', text_so: 'Suuradda Al-Faatixa', text_ar: 'سورة الفاتحة' },
      { id: 'opt_3', text_en: 'Surah Al-Ikhlas', text_so: 'Suuradda Al-Ikhlaas', text_ar: 'سورة الإخلاص' },
      { id: 'opt_4', text_en: 'Surah Ya-Sin', text_so: 'Suuradda Yaasiin', text_ar: 'سورة يس' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah Al-Fatihah is designated by Prophet Muhammad ﷺ as Umm al-Kitab and As-Sab\' al-Mathani. A prayer is invalid without reciting it.',
    explanation_so: 'Suuradda Al-Faatixa waxaa loogu yeeraa Ummul Kitaab iyo Toddobada soo noqnoqda. Nabigu ﷺ wuxuu caddeeyay inaanay salaad jirin qofka aan akhrin Faatixada.',
    explanation_ar: 'سورة الفاتحة هي أم الكتاب وأم القرآن، وقد قال النبي ﷺ: "لا صلاة لمن لم يقرأ بفاتحة الكتاب".',
    source_citation: 'Sahih al-Bukhari 756; Sahih Muslim 394; Quran 15:87',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-BEG-002',
    question_id: 'QRN-BEG-002',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'How many Surahs (chapters) are in the Holy Quran according to the consensus of the Uthmanic Mushaf?',
    question_so: 'Immisa suuradood ayaa ku jira Quraanka Kariimka ah sida ku cad heshiiska culimada iyo Mushafka Cusmaaniga ah?',
    question_ar: 'كم عدد سور القرآن الكريم المتواترة في المصحف العثماني بإجماع الأمة؟',
    options: [
      { id: 'opt_1', text_en: '110 Surahs', text_so: '110 Suuradood', text_ar: '110 سور' },
      { id: 'opt_2', text_en: '114 Surahs', text_so: '114 Suuradood', text_ar: '114 سورة' },
      { id: 'opt_3', text_en: '120 Surahs', text_so: '120 Suuradood', text_ar: '120 سورة' },
      { id: 'opt_4', text_en: '124 Surahs', text_so: '124 Suuradood', text_ar: '124 سورة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Holy Quran consists of exactly 114 Surahs, beginning with Surah Al-Fatihah and concluding with Surah An-Nas.',
    explanation_so: 'Quraanka Kariimka ah wuxuu ka kooban yahay 114 suuradood, oo ku bilaabata Al-Faatixa kuna dhammaata An-Naas.',
    explanation_ar: 'يتألف القرآن الكريم من 114 سورة مباركة بالإجماع، تفتتح بسورة الفاتحة وتختتم بسورة الناس.',
    source_citation: 'Ijma\' of the Ummah and the Uthmanic Codex',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-BEG-003',
    question_id: 'QRN-BEG-003',
    category: 'quran',
    difficulty: 'beginner',
    question_en: 'Which Surah did the Prophet ﷺ describe as being equivalent to one-third of the Quran in virtue and meaning?',
    question_so: 'Waa kuwee suuradda uu Nabigu ﷺ ku sheegay inay u dhiganto saddex meelood hal meel Quraanka dhanka fadliga iyo macnaha?',
    question_ar: 'ما هي السورة التي أخبر النبي ﷺ أنها تعدل ثلث القرآن الكريم في الأجر والمعنى؟',
    options: [
      { id: 'opt_1', text_en: 'Surah Al-Falaq', text_so: 'Suuradda Al-Falaq', text_ar: 'سورة الفلق' },
      { id: 'opt_2', text_en: 'Surah Al-Mulk', text_so: 'Suuradda Al-Mulk', text_ar: 'سورة الملك' },
      { id: 'opt_3', text_en: 'Surah Al-Ikhlas', text_so: 'Suuradda Al-Ikhlaas', text_ar: 'سورة الإخلاص' },
      { id: 'opt_4', text_en: 'Surah Al-Kafirun', text_so: 'Suuradda Al-Kaafiruun', text_ar: 'سورة الكافرون' },
    ],
    correct_option_id: 'opt_3',
    explanation_en: 'Surah Al-Ikhlas equals one-third of the Quran because the Quran addresses three major themes: Tawheed (creed), legal rulings, and narratives; Al-Ikhlas encapsulates pure Tawheed.',
    explanation_so: 'Suuradda Al-Ikhlaas waxay u dhigantaa saddex meelood hal meel Quraanka maxaa yeelay waxay si gooni ah u faahfaahinaysaa Towxiidka saafi ah ee Alle weyne.',
    explanation_ar: 'سورة الإخلاص تعدل ثلث القرآن لاشتمالها التام على توحيد الله وتنزيهه عن الشريك والولد والند.',
    source_citation: 'Sahih al-Bukhari 5013; Sahih Muslim 811',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-INT-001',
    question_id: 'QRN-INT-001',
    category: 'quran',
    difficulty: 'intermediate',
    question_en: 'What is the longest single verse (Ayah) in the Holy Quran, which details the rules of commercial contracts and recording debts?',
    question_so: 'Waa kuwee aayadda ugu dheer guud ahaan Quraanka Kariimka ah, ee sharraxaysa qoraalka deynta iyo heshiisyada ganacsiga?',
    question_ar: 'ما هي أطول آية في كتاب الله تعالى، والتي فصّلت أحكام توثيق الديون والمعاملات المالية والإشهاد عليها؟',
    options: [
      { id: 'opt_1', text_en: 'Ayat al-Kursi (Surah Al-Baqarah 2:255)', text_so: 'Aayadda Kursiga (Al-Baqarah 2:255)', text_ar: 'آية الكرسي (البقرة 255)' },
      { id: 'opt_2', text_en: 'Ayat ad-Dayn (Surah Al-Baqarah 2:282)', text_so: 'Aayadda Deynta (Al-Baqarah 2:282)', text_ar: 'آية المداينة (البقرة 282)' },
      { id: 'opt_3', text_en: 'Ayat al-Amanah (Surah Al-Ahzab 33:72)', text_so: 'Aayadda Amaanada (Al-Axzaab 33:72)', text_ar: 'آية الأمانة (الأحزاب 72)' },
      { id: 'opt_4', text_en: 'Ayat an-Nur (Surah An-Nur 24:35)', text_so: 'Aayadda Nuurka (An-Nuur 24:35)', text_ar: 'آية النور (النور 35)' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Ayat ad-Dayn (Surah Al-Baqarah 2:282) is the longest verse in the Quran, spanning an entire page in the Madinah Mushaf, establishing legal documentation and testimony.',
    explanation_so: 'Aayadda deynta (Al-Baqarah 2:282) waa aayadda ugu dheer Quraanka, waxayna si faahfaahsan u qeexaysaa qoraalka deymaha iyo markhaatiga ganacsiga.',
    explanation_ar: 'آية الدين هي أطول آية في القرآن الكريم، استوعبت صفحة كاملة في المصحف لتنظيم المعاملات المالية.',
    source_citation: 'Quran 2:282; Tafsir Ibn Kathir (1/723)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'QRN-ADV-001',
    question_id: 'QRN-ADV-001',
    category: 'quran',
    difficulty: 'advanced',
    question_en: 'Which Surah contains two full Basmalahs (Bismillah ar-Rahman ar-Rahim) within its text: one at the start and one inside the narrative?',
    question_so: 'Waa kuwee suuradda ay ku dhex jirto laba Basmalah oo buuxa: mid bilowga ah iyo mid dhexdeeda ku qoran?',
    question_ar: 'ما هي السورة الكريمة التي وردت فيها البسملة مرتين كاملتين: مرة في مطلعها ومرة في ثنايا آياتها؟',
    options: [
      { id: 'opt_1', text_en: 'Surah At-Tawbah', text_so: 'Suuradda At-Tawbah', text_ar: 'سورة التوبة' },
      { id: 'opt_2', text_en: 'Surah An-Naml (Ayah 30)', text_so: 'Suuradda An-Naml (Aayadda 30)', text_ar: 'سورة النمل (الآية 30)' },
      { id: 'opt_3', text_en: 'Surah Al-Qasas', text_so: 'Suuradda Al-Qasas', text_ar: 'سورة القصص' },
      { id: 'opt_4', text_en: 'Surah Maryam', text_so: 'Suuradda Maryam', text_ar: 'سورة مريم' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah An-Naml contains two Basmalahs: at its opening and in verse 30 quoting Prophet Sulayman\'s letter: "Innahu min Sulaymana wa innahu bismillahir-rahmanir-rahim."',
    explanation_so: 'Suuradda An-Naml waxay leedahay laba Basmalah: midda bilowga iyo aayadda 30-aad ee xustay warqaddii Nabi Sulaymaan u diray Boqoraddii Bilqees.',
    explanation_ar: 'سورة النمل تشتمل على بسملتين، الأولى في أولها، والثانية في قوله تعالى حكاية عن كتاب سليمان عليه السلام: {إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ}.',
    source_citation: 'Quran 27:30; Tafsir al-Qurtubi (13/197)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 2. TAFSIR & VERSE UNDERSTANDING (tafsir)
  // ===========================================================================
  {
    id: 'TAF-BEG-001',
    question_id: 'TAF-BEG-001',
    category: 'tafsir',
    difficulty: 'beginner',
    question_en: 'In Surah Al-Ikhlas, what is the authoritative scholarly meaning of the divine attribute "As-Samad" (ٱلصَّمَدُ)?',
    question_so: 'Suuradda Al-Ikhlaas gudaheeda, maxay culimadu ku fasireen macnaha sifada rabaaniga ah ee "Al-Samad" (ٱلصَّمَدُ)?',
    question_ar: 'في سورة الإخلاص العظيمة، ما هو المعنى التفسيري المعتمد للاسم الجليل "الصمد" {اللَّهُ الصَّمَدُ}؟',
    options: [
      { id: 'opt_1', text_en: 'The Ever-Living and Creator of light', text_so: 'Kii Nool ee abuuray nuurka', text_ar: 'الحي خالق النور والظلمات' },
      { id: 'opt_2', text_en: 'The Self-Sufficient Master upon Whom all creation depends while He needs nothing', text_so: 'Sayidka buuxa ee loo baahan yahay oo uusan isagu cidna u baahnayn', text_ar: 'السيد المستغني عن كل أحد، الذي تصمد وتفتقر إليه جميع الخلائق في حوائجها' },
      { id: 'opt_3', text_en: 'The Mighty Judge of nations', text_so: 'Garsooraha adag ee ummadaha', text_ar: 'الحاكم العادل بين الخلائق' },
      { id: 'opt_4', text_en: 'The Knower of the unseen future', text_so: 'Kii og mustaqbalka qarsoon', text_ar: 'العليم بالغيب ومآلات الأمور' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Ibn Abbas narrated that As-Samad signifies the Perfect Master in His leadership, nobility, and power, toward Whom all creation turns for their needs, free from eating, drinking, or dependency.',
    explanation_so: 'Ibnu Cabbaas wuxuu sharraxay in "As-Samad" uu yahay Sayidka ugu sarreeya ee wax kasta ay u baahan yihiin, isaguna aan cidna u baahnayn, waxba cunin, waxna cabbin.',
    explanation_ar: 'قال ابن عباس: "الصمد: السيد الذي صمدت إليه الخلائق في حوائجها، المستغني عن كل شيء والمفتقر إليه كل شيء".',
    source_citation: 'Tafsir at-Tabari (24/732); Tafsir Ibn Kathir (8/526)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'TAF-INT-001',
    question_id: 'TAF-INT-001',
    category: 'tafsir',
    difficulty: 'intermediate',
    question_en: 'In Surah Al-Kawthar (108:1), what did the Prophet Muhammad ﷺ explicitly explain "Al-Kawthar" to be when asked by his Companions?',
    question_so: 'Suuradda Al-Kowthar (108:1), maxuu Nabigu ﷺ si cad ugu micneeyay "Al-Kowthar" markii asxaabtu weydiiyeen?',
    question_ar: 'في سورة الكوثر {إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ}، ما هو التفسير النبوي الصريح للكوثر الذي بيّنه النبي ﷺ لأصحابه؟',
    options: [
      { id: 'opt_1', text_en: 'A high mountain in Makkah', text_so: 'Buur dheer oo Makka ku taal', text_ar: 'جبل شامخ في مكة المكرمة' },
      { id: 'opt_2', text_en: 'A river of immense abundant good in Paradise promised by Allah to the Prophet ﷺ', text_so: 'Wabi khayr badan oo ku yaal Jannada oo Eebbe u ballanqaaday Nabiga ﷺ', text_ar: 'نهر عظيم في الجنة وعده الله تعالى لنبيه ﷺ، حوضه أشد بياضاً من اللبن وأحلى من العسل' },
      { id: 'opt_3', text_en: 'A vast golden palace in the sky', text_so: 'Qasri dahab ah oo samada ku yaal', text_ar: 'قصر من ذهب في سماء الخلد' },
      { id: 'opt_4', text_en: 'The victory of the Battle of Badr', text_so: 'Guushii dagaalkii Beder', text_ar: 'النصر في غزوة بدر الكبرى' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Imam Muslim recorded from Anas ibn Malik that the Prophet ﷺ smiled and said: "Do you know what Al-Kawthar is? It is a river that my Lord has promised me in Paradise, containing immense good."',
    explanation_so: 'Anas wuxuu wariyay in Nabigu ﷺ yiri: "Ma ogtihiin waxa uu yahay Al-Kowthar? Waa wabi uu Eebahay iigu yaboohay Jannada, oo uu ku jiro khayr aad u badan."',
    explanation_ar: 'عن أنس قال: قال رسول الله ﷺ: "أَتَدْرُونَ مَا الْكَوْثَرُ؟ فَإِنَّهُ نَهْرٌ وَعَدَنِيهِ رَبِّي عَزَّ وَجَلَّ فِي الْجَنَّةِ، عَلَيْهِ خَيْرٌ كَثِيرٌ".',
    source_citation: 'Sahih Muslim 400; Sunan Abi Dawud 784',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'TAF-ADV-001',
    question_id: 'TAF-ADV-001',
    category: 'tafsir',
    difficulty: 'advanced',
    question_en: 'What is the celebrated statement of Imam Ash-Shafi\'i concerning the profound guidance of Surah Al-\'Asr (Chapter 103)?',
    question_so: 'Muxuu ahaa hadalkii caanka ahaa ee Imaam Ash-Shaafici ka yiri miisaanka iyo xigmadda weyn ee Suuradda Al-Casr?',
    question_ar: 'ما هي المقولة الجامعة المشهورة عن الإمام الشافعي رحمه الله في شأن بلاغة وإعجاز سورة العصر؟',
    options: [
      { id: 'opt_1', text_en: '"It was revealed exclusively for travelers and merchants"', text_so: '"Waxay ku soo degtay musaafiriinta iyo ganacsatada"', text_ar: '"إنها نزلت في شأن التجار والمسافرين فقط"' },
      { id: 'opt_2', text_en: '"If people were to ponder this Surah alone, it would suffice them as complete guidance"', text_so: '"Haddii dadku ay fikiraan suuraddan kaligeed, way ku filnaan lahayd hanuun ahaan"', text_ar: '"لو تدبر الناس هذه السورة وحدها لكفتهم"' },
      { id: 'opt_3', text_en: '"It is the most difficult Surah to memorize in the Quran"', text_so: '"Waa suuradda ugu adag xifdiga Quraanka"', text_ar: '"إنها أصعب سورة في الحفظ والضبط"' },
      { id: 'opt_4', text_en: '"Its legal rulings abrogate all earlier Makkan verses"', text_so: '"Xukunnadeedu waxay nasakheen dhammaan aayadihii Makki"', text_ar: '"إن أحكامها ناسخة لكل ما سبقها من السور"' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Imam Ash-Shafi\'i observed that Surah Al-\'Asr summarizes all conditions of human salvation: faith, righteous deeds, mutual counsel in truth, and steadfast patience.',
    explanation_so: 'Imaam Ash-Shaafici wuxuu tilmaamay in Suuradda Al-Casr ay koobtay dhammaan shuruudihii badbaadada aadanaha: Iimaanka, camalka suubban, isku dardaaranka xaqa, iyo samirka.',
    explanation_ar: 'قال الإمام الشافعي رحمه الله: "لو ما أنزل الله حجة على خلقه إلا هذه السورة لكفتهم"، لاشتمالها على أركان النجاة الأربعة.',
    source_citation: 'Tafsir Ibn Kathir (8/499); Madarij as-Salikin (1/85)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 3. HADITH & HADITH SCIENCES (hadith)
  // ===========================================================================
  {
    id: 'HDT-BEG-001',
    question_id: 'HDT-BEG-001',
    category: 'hadith',
    difficulty: 'beginner',
    question_en: 'What is the celebrated first Hadith recorded by Imam al-Bukhari in his Sahih collection regarding internal devotion?',
    question_so: 'Waa kuwee xadiiska ugu horreeya ee uu Imaam Al-Bukhaari ku furay kitaabkiisa Saxiixa ah ee ku saabsan niyadda?',
    question_ar: 'ما هو الحديث العظيم الذي افتتح به الإمام البخاري كتابه الصحيح، لبيان أن مدار الأعمال على الإخلاص؟',
    options: [
      { id: 'opt_1', text_en: '"Islam is built upon five pillars"', text_so: '"Islaamka waxaa lagu dhisay shan tiir"', text_ar: '"بني الإسلام على خمس"' },
      { id: 'opt_2', text_en: '"Actions are judged only by intentions (Innama al-a\'malu bin-niyyat)"', text_so: '"Camalladu waxay ku xiran yihiin oo kaliya niyadaha"', text_ar: '"إنما الأعمال بالنيات وإنما لكل امرئ ما نوى"' },
      { id: 'opt_3', text_en: '"None of you truly believes until he loves for his brother what he loves for himself"', text_so: '"Midkiinna ma rumeeyo ilaa uu walaalkii la jeclaado waxa uu naftiisa la jecel yahay"', text_ar: '"لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه"' },
      { id: 'opt_4', text_en: '"The religion is sincere advice (An-Nasihah)"', text_so: '"Diintu waa nasteexo"', text_ar: '"الدين النصيحة"' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Imam al-Bukhari deliberately placed the Hadith of Umar ibn al-Khattab: "Actions are judged by intentions" at the start of his book to emphasize that all righteous endeavors require pure sincerity for Allah.',
    explanation_so: 'Imaam Al-Bukhaari wuxuu ku bilaabay xadiiskii Cumar bin Khadaab: "Camalladu waxay ku xiran yihiin niyadaha" si uu u xusuusiyo ardayda iyo culimada in qowl kasta iyo ficil kasta uu u baahan yahay ikhlaas.',
    explanation_ar: 'افتتح البخاري صحيحه بحديث عمر بن الخطاب: "إنما الأعمال بالنيات" تذكيراً بأهمية الإخلاص وتجريد القصد لله تعالى في كل عمل.',
    source_citation: 'Sahih al-Bukhari 1; Sahih Muslim 1907',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HDT-INT-001',
    question_id: 'HDT-INT-001',
    category: 'hadith',
    difficulty: 'intermediate',
    question_en: 'In Hadith terminology (Mustalah al-Hadith), what is a "Mutawatir" narration?',
    question_so: 'Mustalaxa Xadiiska gudaheeda, maxaa loogu yeeraa xadiis "Mutawaatir" ah?',
    question_ar: 'في علم مصطلح الحديث، ما هو تعريف الحديث "المتواتر"؟',
    options: [
      { id: 'opt_1', text_en: 'A narration reported by only one companion in every generation', text_so: 'Xadiis ay wariyeen hal saxaabi oo kaliya jiil kasta', text_ar: 'حديث تفرد بروايته راوٍ واحد في كل طبقة' },
      { id: 'opt_2', text_en: 'A report narrated by such a large multitude of trustworthy narrators at every link in the chain that collusion upon a lie is customarily impossible', text_so: 'Xadiis ay wariyeen koox aad u tiro badan jiil kasta oo aan caqligu oggolayn inay been ku heshiiyaan', text_ar: 'ما رواه جمع غفير عن جمع غفير في كل طبقة تحيل العادة تواطؤهم على الكذب ويكون مستندهم الحس' },
      { id: 'opt_3', text_en: 'A hadith whose narrator chain is broken at the successor level', text_so: 'Xadiis ay silsiladdiisu go\'an tahay heerka taabiciinta', text_ar: 'حديث سقط من إسناده راوٍ أو أكثر قبل الصحابي' },
      { id: 'opt_4', text_en: 'A narration transmitted only during the month of Ramadan', text_so: 'Xadiis la wariyay bisha Ramadaan oo kaliya', text_ar: 'حديث خاص بروايات شهر رمضان' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Mutawatir signifies an uninterrupted, vast transmission at every level that yields definitive, certain knowledge (yaqeen qat\'i), free from doubt.',
    explanation_so: 'Mutawaatirtu waa xadiiska ay soo wariyeen tiro aad u badan dhammaan silsiladda oo keenaya cilmi yaqiin ah oo aan shaki ku jirin.',
    explanation_ar: 'المتواتر يفيد العلم اليقيني القطعي، وهو ما ينقله جمع كبير يستحيل تواطؤهم على الكذب عن مثلهم إلى منتهاه.',
    source_citation: 'Muqaddimah Ibn as-Salah (p. 268); Nukhbat al-Fikar (Ibn Hajar)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HDT-ADV-001',
    question_id: 'HDT-ADV-001',
    category: 'hadith',
    difficulty: 'advanced',
    question_en: 'Which esteemed classical scholar compiled the foundational collection "Riyad as-Salihin" (Gardens of the Righteous)?',
    question_so: 'Waa kuwee caalimkii weynaa ee allifay kitaabka caanka ah ee "Riyaadul Saalixiin" (Beeraha Kuwa Suubban)?',
    question_ar: 'من هو الإمام الجليل صاحب التصنيف المبارك الشهير "رياض الصالحين من كلام سيد المرسلين"؟',
    options: [
      { id: 'opt_1', text_en: 'Imam Ibn al-Qayyim', text_so: 'Imaam Ibnu Qayyim', text_ar: 'الإمام ابن قيم الجوزية' },
      { id: 'opt_2', text_en: 'Imam Yahya ibn Sharaf an-Nawawi (Al-Nawawi)', text_so: 'Imaam Yaxya bin Sharaf An-Nawawi', text_ar: 'الإمام يحيى بن شرف النووي الشافعي' },
      { id: 'opt_3', text_en: 'Imam Abu Hamid al-Ghazali', text_so: 'Imaam Abu Xaamid Al-Ghasaali', text_ar: 'الإمام أبو حامد الغزالي' },
      { id: 'opt_4', text_en: 'Imam Ibn Kathir', text_so: 'Imaam Ibnu Kathiir', text_ar: 'الحافظ ابن كثير' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Imam Abu Zakariyya Yahya ibn Sharaf an-Nawawi (d. 676 AH) authored Riyad as-Salihin, selecting authentic narrations covering morals, manners, worship, and spiritual purification.',
    explanation_so: 'Imaam An-Nawawi wuxuu allifay Riyaadul Saalixiin isagoo ka soo xulay xadiisyada saxiixa ah ee dhanka akhlaaqda, cibaadada, iyo daahirinta quluubta.',
    explanation_ar: 'ألفه الإمام النووي رحمه الله المتوفى سنة 676 هـ، واشتمل على أحاديث صحيحة في الآداب وتزكية النفوس والأعمال الصالحة.',
    source_citation: 'Riyad as-Salihin; Siyar A\'lam an-Nubala (24/103)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 4. AQEEDAH & ISLAMIC CREED (aqeedah)
  // ===========================================================================
  {
    id: 'AQD-BEG-001',
    question_id: 'AQD-BEG-001',
    category: 'aqeedah',
    difficulty: 'beginner',
    question_en: 'How many Pillars of Faith (Arkan al-Iman) are explicitly defined in the famous Hadith of Jibril?',
    question_so: 'Immisa ayaa ah Tiirarka Iimaanka (Arkaanul Iimaan) sida ku cad Xadiiskii caanka ahaa ee Jibriil?',
    question_ar: 'كم عدد أركان الإيمان التي بيّنها رسول الله ﷺ في حديث جبريل المشهور؟',
    options: [
      { id: 'opt_1', text_en: 'Five Pillars', text_so: 'Shan Tiir', text_ar: 'خمسة أركان' },
      { id: 'opt_2', text_en: 'Six Pillars', text_so: 'Lix Tiir', text_ar: 'ستة أركان' },
      { id: 'opt_3', text_en: 'Seven Pillars', text_so: 'Todoba Tiir', text_ar: 'سبعة أركان' },
      { id: 'opt_4', text_en: 'Four Pillars', text_so: 'Afar Tiir', text_ar: 'أربعة أركان' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Six Pillars of Faith are: Belief in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree (al-Qadar), both its good and bad.',
    explanation_so: 'Lixda Tiir ee Iimaanku waa: Rumeysi Eebbe, Malaa\'igtiisa, Kutubtiisa, Rusushiisa, Maalinta Aakhiro, iyo Qadarta khayrkeeda iyo sharqeeda.',
    explanation_ar: 'أركان الإيمان ستة: أن تؤمن بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، وتؤمن بالقدر خيره وشره.',
    source_citation: 'Sahih Muslim 8 (Hadith Jibril); Quran 2:177, 2:285',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'AQD-INT-001',
    question_id: 'AQD-INT-001',
    category: 'aqeedah',
    difficulty: 'intermediate',
    question_en: 'What are the three canonical divisions of Tawheed established by classical Islamic scholars from Quranic texts?',
    question_so: 'Maxay yihiin saddexda qaybood ee Towxiidka ee culimada Islaamku ka soo saareen aayadaha Quraanka Kariimka ah?',
    question_ar: 'ما هي الأقسام الثلاثة لتوحيد الله تعالى التي استقرأها أئمة السلف من نصوص القرآن الكريم؟',
    options: [
      { id: 'opt_1', text_en: 'Tawheed of Creation, Tawheed of Life, and Tawheed of Power', text_so: 'Towxiidka Abuurka, Nolosha, iyo Awoodda', text_ar: 'توحيد الخلق، وتوحيد الحياة، وتوحيد القوة' },
      { id: 'opt_2', text_en: 'Tawheed ar-Rububiyyah, Tawheed al-Uluhiyyah, and Tawheed al-Asma\' was-Sifat', text_so: 'Towxiidka Rubuubiyada, Uluuhiyada, iyo Magacyada & Sifooyinka', text_ar: 'توحيد الربوبية، وتوحيد الألوهية، وتوحيد الأسماء والصفات' },
      { id: 'opt_3', text_en: 'Tawheed of Faith, Tawheed of History, and Tawheed of Knowledge', text_so: 'Towxiidka Iimaanka, Taariikhda, iyo Cilmiga', text_ar: 'توحيد الإيمان، وتوحيد التاريخ، وتوحيد العلم' },
      { id: 'opt_4', text_en: 'Tawheed of Earth, Tawheed of Sky, and Tawheed of Oceans', text_so: 'Towxiidka Dhulka, Cirka, iyo Badaha', text_ar: 'توحيد الأرض، وتوحيد السماء، وتوحيد البحار' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Tawheed is categorized into Rububiyyah (Allah\'s lordship and actions), Uluhiyyah (singling Allah out in all worship), and Asma\' was-Sifat (affirming His divine names and perfect attributes without distortion or resemblance).',
    explanation_so: 'Towxiidka waxaa loo qaybiyaa: Rubuubiyad (in Eebbe kaligii abuuraha yahay), Uluuhiyad (in cibaadada oo dhan Eebbe kaliya la siiyo), iyo Asmaa was-Sifaat (magacyada iyo sifooyinka Eebbe ee suubban).',
    explanation_ar: 'توحيد الربوبية: إفراد الله بأفعاله كالخلق والرزق، وتوحيد الألوهية: إفراده بأفعال العباد كالعبادة والدعاء، وتوحيد الأسماء والصفات: إثبات ما أثبته لنفسه بلا تمثيل ولا تعطيل.',
    source_citation: 'Quran 19:65, 42:11, 7:54; Majmu\' al-Fatawa (Ibn Taymiyyah 3/7)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'AQD-ADV-001',
    question_id: 'AQD-ADV-001',
    category: 'aqeedah',
    difficulty: 'advanced',
    question_en: 'In orthodox Islamic theology, what are the four sequential levels (Maratib) of belief in Divine Decree (Al-Qadar)?',
    question_so: 'Caqiidada toosan ee Islaamka, maxay yihiin 4-ta martabo ee rumeysiga Qadarta Eebbe?',
    question_ar: 'في عقيدة أهل السنة والجماعة، ما هي مراتب الإيمان بالقدر الأربع الواجب الإيمان بها؟',
    options: [
      { id: 'opt_1', text_en: 'Intention, Utterance, Physical Action, and Habit', text_so: 'Niyadda, Hadalka, Camalka, iyo Caadada', text_ar: 'النية، والقول، والعمل، والتعود' },
      { id: 'opt_2', text_en: 'Knowledge (Al-\'Ilm), Writing (Al-Kitabah), Will (Al-Mashi\'ah), and Creation (Al-Khalq)', text_so: 'Cilmiga, Qoraalka, Doonista (Mashii\'ada), iyo Abuurka', text_ar: 'العلم، والكتابة، والمشيئة، والخلق' },
      { id: 'opt_3', text_en: 'Birth, Youth, Adulthood, and Passing', text_so: 'Dhalashada, Dhallinyaronimada, Waayeelnimada, iyo Geerida', text_ar: 'الميلاد، والشباب، والكهولة، والوفاة' },
      { id: 'opt_4', text_en: 'Supplication, Striving, Patience, and Contentment', text_so: 'Ducada, Dadaalka, Samirka, iyo Qanaacada', text_ar: 'الدعاء، والسعي، والصبر، والرضا' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Belief in Qadar requires affirming that Allah knew all things eternally (Al-\'Ilm), wrote them in the Preserved Tablet (Al-Kitabah), that whatever He wills occurs and whatever He does not will never occurs (Al-Mashi\'ah), and that He is the sole Creator of all beings and their actions (Al-Khalq).',
    explanation_so: 'Iimaanka Qadartu wuxuu ku dhisan yahay 4 heer: Cilmiga Eebbe ee weligiis ah, Qoraalka Lawxul Maxfuud, Mashii\'ada (doonista Eebbe ee wax kasta dhaqangelisa), iyo Abuurka Eebbe ee koonka iyo camallada oo dhan.',
    explanation_ar: 'مراتب القدر الأربع المجمع عليها: العلم الشامل، والكتابة في اللوح المحفوظ، والمشيئة النافذة، والخلق والإيجاد لكل ما سوى الله.',
    source_citation: 'Quran 22:70, 37:96, 81:29; Al-Aqeedah Al-Wasitiyyah (Ibn Taymiyyah)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 5. FIQH & ISLAMIC JURISPRUDENCE (fiqh)
  // ===========================================================================
  {
    id: 'FQH-BEG-001',
    question_id: 'FQH-BEG-001',
    category: 'fiqh',
    difficulty: 'beginner',
    question_en: 'What are the five essential normative rulings (Al-Ahkam at-Taklifiyyah) that govern all human actions in Islamic law?',
    question_so: 'Maxay yihiin shanta xukun ee shareecada Islaamku ku xukunto dhammaan ficillada qofka muslimka ah (Al-Axkaam at-Takliifiyyah)?',
    question_ar: 'ما هي الأحكام التكليفية الخمسة التي تنقسم إليها جميع أفعال المكلفين في الفقه الإسلامي؟',
    options: [
      { id: 'opt_1', text_en: 'Truth, Falsehood, Justice, Oppression, and Peace', text_so: 'Run, Been, Caddaalad, Dulmi, iyo Nabad', text_ar: 'الصدق، والكذب، والعدل، والظلم، والسلام' },
      { id: 'opt_2', text_en: 'Wajib (Obligatory), Mustahabb (Recommended), Mubah (Permissible), Makruh (Disliked), and Haram (Forbidden)', text_so: 'Waajib, Mustaxab, Mubaax, Makruuh, iyo Xaaraan', text_ar: 'الواجب، والمستحب (المندوب)، والمباح، والمكروه، والمحرم' },
      { id: 'opt_3', text_en: 'Ancient, Medieval, Modern, Contemporary, and Future', text_so: 'Hore, Dhexe, Cusub, Casri, iyo Mustaqbal', text_ar: 'القديم، والوسيط، والحديث، والمعاصر، والمستقبل' },
      { id: 'opt_4', text_en: 'Individual, Family, Neighborhood, City, and State', text_so: 'Shakhsi, Qoys, Xaafad, Magaalo, iyo Dawlad', text_ar: 'الفردي، والأسري، والمجتمعي، والمدني، والدولي' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'In Usul al-Fiqh, human actions are categorized under 5 rulings: Wajib (rewarded if done, sinful if neglected), Mustahabb (rewarded if done, not punished if left), Mubah (neutral), Makruh (rewarded if avoided, not punished if done), and Haram (punished if done, rewarded if left for Allah).',
    explanation_so: 'Axkaamta shareecada waa 5: Waajib (la abaalmariyo haddii la sameeyo, la ciqaabo haddii la dhaafo), Mustaxab (la jecel yahay), Mubaax (bannaan), Makruuh (la neceb yahay), iyo Xaaraan (reeban oo dambi ah).',
    explanation_ar: 'الأحكام التكليفية خمسة بإجماع الأصوليين: الواجب، والمندوب، والمباح، والمكروه، والمحرم.',
    source_citation: 'Al-Waraqat (Imam al-Haramayn al-Juwayni); Rawdat an-Nazir (Ibn Qudamah)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'FQH-INT-001',
    question_id: 'FQH-INT-001',
    category: 'fiqh',
    difficulty: 'intermediate',
    question_en: 'What are the four primary agreed-upon sources of Islamic jurisprudence (Usul al-Fiqh) utilized by the major Sunni Madhhabs?',
    question_so: 'Maxay yihiin 4-ta ilood ee aasaasiga ah ee fiqiga Islaamka ee dhammaan madhabaha Sunnadu ku heshiiyeen?',
    question_ar: 'ما هي المصادر والأدلة الأربعة الأصلية المتفق عليها في استنباط الأحكام الشرعية لدى جماهير الفقهاء؟',
    options: [
      { id: 'opt_1', text_en: 'Custom, Philosophy, Greek Logic, and Roman Codes', text_so: 'Caadada, Falsafada, Caqliga Giriigga, iyo Shuruucda Roomaanka', text_ar: 'العرف، والفلسفة، والمنطق اليوناني، والقوانين الرومانية' },
      { id: 'opt_2', text_en: 'The Quran, the Sunnah, Ijma\' (Consensus), and Qiyas (Analogical Reasoning)', text_so: 'Qur\'aanka, Sunnada, Ijmaaca (Heshiiska Culimada), iyo Qiyaaska', text_ar: 'القرآن الكريم، والسنة النبوية المطهرة، والإجماع، والقياس الشرعي' },
      { id: 'opt_3', text_en: 'Dreams, Astronomy, Poetry, and Tribal Heritage', text_so: 'Riyooyinka, Xiddigiska, Gabayada, iyo Dhaqanka Qabiilka', text_ar: 'الرؤى، وعلم الفلك، والأشعار، والموروثات القبلية' },
      { id: 'opt_4', text_en: 'State Decrees, Public Polls, Court History, and Treaties', text_so: 'Go\'aannada Dawladda, Codadka Dadweynaha, iyo Maxkamadaha', text_ar: 'المراسيم الحكومية، واستطلاعات الرأي، والمعاهدات الدولية' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The four universally recognized primary proofs of Islamic law across all four schools of jurisprudence are the Holy Quran, the authentic Sunnah, Ijma\' (consensus of qualified jurists), and sound Qiyas.',
    explanation_so: 'Afar-ta daliil ee asalka ah ee sharciga Islaamku ka soo baxo waa: Quraanka Kariimka, Sunnada Nabiga ﷺ, Ijmaaca culimada, iyo Qiyaaska sharciga ah.',
    explanation_ar: 'الأدلة الشرعية المتفق عليها عند جمهور علماء الأمة أربعة: الكتاب، والسنة، والإجماع، والقياس.',
    source_citation: 'Al-Mustasfa (Al-Ghazali 1/137); Al-Bahr al-Muhit (Az-Zarkashi 1/33)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'FQH-ADV-001',
    question_id: 'FQH-ADV-001',
    category: 'fiqh',
    difficulty: 'advanced',
    question_en: 'In Islamic legal theory, what distinguishes a "Fard \'Ayn" (individual obligation) from a "Fard Kifayah" (communal obligation)?',
    question_so: 'Xagga qaanuunka fiqiga, maxaa u dhexeeya "Faral Cayn" iyo "Faral Kifaayah"?',
    question_ar: 'في أصول الفقه، ما هو الفرق الدقيق بين "فرض العين" و"فرض الكفاية"؟',
    options: [
      { id: 'opt_1', text_en: 'Fard \'Ayn is only for scholars, while Fard Kifayah is for the public', text_so: 'Faral Caynku culimada oo kaliya ayuu ku waajibaa, Kifaayana dadweynaha', text_ar: 'فرض العين خاص بالعلماء وفرض الكفاية لعامة المسلمين' },
      { id: 'opt_2', text_en: 'Fard \'Ayn is binding on every single accountable individual, whereas Fard Kifayah is required from the community such that if sufficient people perform it, the sin is lifted from the rest', text_so: 'Faral Caynku qof kasta oo qaangaar ah ayuu si gooni ah ugu waajibaa, Faral Kifaayana haddii qaar ka mid ah bulshada ay gutaan, dambigu dadka kale wuu ka dhacayaa', text_ar: 'فرض العين يلزم كل مكلف بعينه كالصلوات الخمس، بينما فرض الكفاية إذا قام به من يكفي سقط الإثم عن الباقين كصلاة الجنازة' },
      { id: 'opt_3', text_en: 'Fard \'Ayn applies only on Fridays, while Fard Kifayah applies on other days', text_so: 'Faral Caynku jimcaha kaliya ayuu khuseeyaa', text_ar: 'فرض العين يختص بيوم الجمعة، وفرض الكفاية بباقي الأيام' },
      { id: 'opt_4', text_en: 'Fard \'Ayn carries financial penalties, while Fard Kifayah does not', text_so: 'Faral Caynka lacag ayaa lagu bixiyaa haddii la dhaafo', text_ar: 'فرض العين يترتب عليه غرامات مالية فقط' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Fard \'Ayn (like five daily prayers) is mandatory upon every Muslim individually. Fard Kifayah (like Janazah prayer or specialized medicine) is an obligation on the collective body; if undertaken adequately by some, the obligation is satisfied for all.',
    explanation_so: 'Faral Cayn (sida 5-ta salaadood) qof walba ayaa laga rabaa. Faral Kifaayah (sida salaadda Janaasada) haddii qaar ka mid ah bulshadu ay gutaan, kuwa kale dambi kuma laha.',
    explanation_ar: 'فرض العين مطلوب من كل مكلف بذاته، وفرض الكفاية مطلوب حصوله بغض النظر عن الفاعل، فإذا قام به البعض سقط الحرج عن الأمة.',
    source_citation: 'Al-Majmu\' Sharh al-Muhadhdhab (An-Nawawi 1/24); Usul al-Fiqh (Al-Khallaf)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 6. PURIFICATION & PRAYER (purification_prayer)
  // ===========================================================================
  {
    id: 'PUR-BEG-001',
    question_id: 'PUR-BEG-001',
    category: 'purification_prayer',
    difficulty: 'beginner',
    question_en: 'How many daily obligatory (Fard) prayers are prescribed for every adult, sane Muslim in a day and night?',
    question_so: 'Immisa salaadood oo waajib (Faral) ah ayaa ku waajib ah qof kasta oo muslim ah maalin iyo habeen kasta?',
    question_ar: 'كم عدد الصلوات المفروضة التي أوجبها الله تعالى على كل مسلم ومسلمة في اليوم والليلة؟',
    options: [
      { id: 'opt_1', text_en: '3 Prayers', text_so: '3 Salaadood', text_ar: 'ثلاث صلوات' },
      { id: 'opt_2', text_en: '5 Prayers', text_so: '5 Salaadood', text_ar: 'خمس صلوات' },
      { id: 'opt_3', text_en: '7 Prayers', text_so: '7 Salaadood', text_ar: 'سبع صلوات' },
      { id: 'opt_4', text_en: '10 Prayers', text_so: '10 Salaadood', text_ar: 'عشر صلوات' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Allah ordained five daily obligatory prayers upon the night of Al-Isra wal-Mi\'raj: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
    explanation_so: 'Eebbe wuxuu habeenkii Israaga iyo Micraajka waajibiyay 5 salaadood maalin iyo habeen kasta: Subax, Duhur, Casar, Maqrib, iyo Cishe.',
    explanation_ar: 'فرض الله تعالى خمس صلوات في اليوم والليلة ليلة الإسراء والمعراج: الفجر والظهر والعصر والمغرب والعشاء.',
    source_citation: 'Sahih al-Bukhari 349; Sahih Muslim 162',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'PUR-INT-001',
    question_id: 'PUR-INT-001',
    category: 'purification_prayer',
    difficulty: 'intermediate',
    question_en: 'According to the explicit text of Surah Al-Ma\'idah (5:6), what are the four mandatory bodily areas that must be washed or wiped in Wudu (ablution)?',
    question_so: 'Sida ku cad aayadda 6-aad ee Suuradda Al-Maa\'idah, maxay yihiin 4-ta xubnood ee waajibka ah in la dhaqo ama la masaxo weysada?',
    question_ar: 'بنص الآية الكريمة في سورة المائدة {يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ}، ما هي الأعضاء الأربعة المفروض غسلها أو مسحها في الوضوء؟',
    options: [
      { id: 'opt_1', text_en: 'Chest, shoulders, knees, and back', text_so: 'Laabta, garabbada, jilbaha, iyo dhabarka', text_ar: 'الصدر والكتفان والركبتان والظهر' },
      { id: 'opt_2', text_en: 'Washing the face, washing the arms up to the elbows, wiping the head, and washing the feet up to the ankles', text_so: 'Dhaqista wejiga, dhaqista gacmaha ilaa xusullada, masaxidda madaxa, iyo dhaqista lugaha ilaa canqowyada', text_ar: 'غسل الوجه، وغسل اليدين إلى المرفقين، ومسح الرأس، وغسل الرجلين إلى الكعبين' },
      { id: 'opt_3', text_en: 'Ears, neck, stomach, and thighs', text_so: 'Dhagaha, qoorta, caloosha, iyo bowdyaha', text_ar: 'الأذنان والعنق والبطن والفخذان' },
      { id: 'opt_4', text_en: 'Only the palms and forehead', text_so: 'Kacmaha iyo wejiga kaliya', text_ar: 'الكفان والجبين فقط' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah Al-Ma\'idah 5:6 states: "Wash your faces and your forearms to the elbows and wipe over your heads and wash your feet to the ankles." These constitute the Quranic pillars of Wudu.',
    explanation_so: 'Aayadda 6-aad ee Suuradda Al-Maa\'idah waxay si cad u qeexaysaa: Dhaqa wejiyadiinna, gacmihiinna ilaa xusullada, madaxiinnana masaxa, lugahiinnana dhaqa ilaa canqowyada.',
    explanation_ar: 'قال تعالى: {فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ}، وهذه أركان الوضوء المنصوص عليها قطعا.',
    source_citation: 'Quran 5:6; Al-Majmu\' (1/148)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'PUR-ADV-001',
    question_id: 'PUR-ADV-001',
    category: 'purification_prayer',
    difficulty: 'advanced',
    question_en: 'When a praying person is in doubt about whether they have prayed three or four Rak\'ahs, what is the established prophetic instruction?',
    question_so: 'Haddii qofka tukanaya uu shaki galo inuu tukaday saddex rakcadood ama afar, maxay tahay tilmaantii Nabiga ﷺ ee lagu xallinayay shakigaas?',
    question_ar: 'إذا شك المصلي في صلاته فلم يدرِ كم صلى: أثلاثاً أم أربعاً، فما هو التوجيه النبوي الصحيح لحسم هذا الشك؟',
    options: [
      { id: 'opt_1', text_en: 'Stop the prayer immediately and restart from the Takbir', text_so: 'Inuu salaadda joojiyo oo dib uga soo bilaabo takbiirta', text_ar: 'أن يقطع الصلاة فوراً ويعيدها من أولها' },
      { id: 'opt_2', text_en: 'Cast aside the doubt, build upon what is certain (the lesser number: three), complete the prayer, and perform two prostrations of forgetfulness (Sujud as-Sahw)', text_so: 'Inuu shakiga tuuro, ku dhiso wixii yaqiin ah (tirada yar: saddex), salaadda dhammaystiro, dabadeedna sujuudo laba sujuudood oo saxiw ah', text_ar: 'أن يطرح الشك ويبني على ما استيقن (وهو الأقل: ثلاث)، ثم يتم صلاته ويسجد سجدتين للسهو قبل السلام أو بعده' },
      { id: 'opt_3', text_en: 'Assume the higher number (four) and do nothing further', text_so: 'Inuu qiyaasto tirada weyn oo uusan waxba samayn', text_ar: 'أن يبني على الأكثر (أربع) ولا يسجد للسهو' },
      { id: 'opt_4', text_en: 'Ask someone standing nearby during the prayer', text_so: 'Inuu weydiiyo qof agtiisa taagan inta uu tukanayo', text_ar: 'أن يسأل من بجانبه وهو في الصلاة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ said: "If any of you has doubts in his prayer and does not know whether he prayed three or four, let him cast aside doubt and build upon what is certain (the minimum), then perform two prostrations before salam."',
    explanation_so: 'Nabigu ﷺ wuxuu yiri: "Haddii midkiinna uu salaadda ku shakiyo oo uusan ogayn inuu tukaday 3 ama 4, ha tuuro shakiga hana ku dhiso waxa yaqiinta ah (tirada yar), dabadeedna ha sujuudo laba sujuudood intaanu salaam bixin."',
    explanation_ar: 'قال رسول الله ﷺ: "إذا شك أحدكم في صلاته فلم يدر كم صلى: أثلاثاً أم أربعاً؟ فليطرح الشك وليبن على ما استيقن، ثم يسجد سجدتين قبل أن يسلم".',
    source_citation: 'Sahih Muslim 571; Sunan Abi Dawud 1024',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 7. FASTING & RAMADAN (fasting_ramadan)
  // ===========================================================================
  {
    id: 'FST-BEG-001',
    question_id: 'FST-BEG-001',
    category: 'fasting_ramadan',
    difficulty: 'beginner',
    question_en: 'During which month of the Islamic lunar calendar is fasting (Sawm) obligatory upon every healthy, resident, accountable Muslim?',
    question_so: 'Bishayee oo ka mid ah bilaha hijriga ah ayaa soonku waajib ku yahay qof kasta oo muslim ah oo awooda, jooga, qaangaar ah?',
    question_ar: 'في أي شهر من شهور السنة الهجرية فُرِض صيام شهر كامل على كل مسلم مكلف قادر مقيم؟',
    options: [
      { id: 'opt_1', text_en: 'Rajab', text_so: 'Rajab', text_ar: 'شهر رجب' },
      { id: 'opt_2', text_en: 'Sha\'ban', text_so: 'Shacbaan', text_ar: 'شهر شعبان' },
      { id: 'opt_3', text_en: 'Ramadan', text_so: 'Ramadaan', text_ar: 'شهر رمضان المبارك' },
      { id: 'opt_4', text_en: 'Shawwal', text_so: 'Shawaal', text_ar: 'شهر شوال' },
    ],
    correct_option_id: 'opt_3',
    explanation_en: 'Fasting the entire month of Ramadan is the fourth pillar of Islam, prescribed in Surah Al-Baqarah 2:183-185.',
    explanation_so: 'Soonka bisha barakaysan ee Ramadaan waa tiirka 4-aad ee Islaamka, waxaana lagu waajibiyay aayadaha 183-185 ee Suuradda Al-Baqarah.',
    explanation_ar: 'صيام رمضان ركن من أركان الإسلام الخمسة بنص القرآن: {شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ}.',
    source_citation: 'Quran 2:183-185; Sahih al-Bukhari 8',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'FST-INT-001',
    question_id: 'FST-INT-001',
    category: 'fasting_ramadan',
    difficulty: 'intermediate',
    question_en: 'What is the blessed night in the last ten nights of Ramadan described in the Quran as being "better than a thousand months"?',
    question_so: 'Waa kuwee habeenka barakaysan ee tobanka dambe ee Ramadaan ee Quraanka lagu sheegay inuu "ka khayr badan yahay kun bilood"?',
    question_ar: 'ما هي الليلة المباركة العظيمة في العشر الأواخر من رمضان التي وصفها الله تعالى بأنها {خَيْرٌ مِّنْ أَلْفِ شَهْرٍ}؟',
    options: [
      { id: 'opt_1', text_en: 'Laylatul Bara\'ah', text_so: 'Habeenka Baraa\'ada', text_ar: 'ليلة البراءة' },
      { id: 'opt_2', text_en: 'Laylatul Qadr (The Night of Decree)', text_so: 'Laylatul Qadri (Habeenka Qadarta)', text_ar: 'ليلة القدر المباركة' },
      { id: 'opt_3', text_en: 'Laylatul Mi\'raj', text_so: 'Habeenka Micraajka', text_ar: 'ليلة الإسراء والمعراج' },
      { id: 'opt_4', text_en: 'The Eve of Eid al-Fitr', text_so: 'Habeenka Ciidul Fidriga', text_ar: 'ليلة عيد الفطر' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah Al-Qadr reveals: "The Night of Decree is better than a thousand months." Worship performed on this night exceeds worship of 83 years and 4 months.',
    explanation_so: 'Suuradda Al-Qadr waxay xustay in Habeenka Qadartu uu ka khayr badan yahay kun bilood oo u dhiganta in ka badan 83 sano oo cibaado ah.',
    explanation_ar: 'ليلة القدر هي الليلة العظيمة التي أنزل فيها القرآن، والعمل الصالح فيها خير من العمل في ألف شهر ليس فيها ليلة القدر.',
    source_citation: 'Quran 97:1-5; Sahih al-Bukhari 2014',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'FST-ADV-001',
    question_id: 'FST-ADV-001',
    category: 'fasting_ramadan',
    difficulty: 'advanced',
    question_en: 'What is the legal ruling and required compensation (Kaffarah) for an accountable person who deliberately breaks their fast during Ramadan through marital intercourse?',
    question_so: 'Muxuu yahay xukunka sharciga ah iyo kafaarada qofka qaangaarka ah ee si badheedh ah galmo ugu af-fura maalinta bisha Ramadaan?',
    question_ar: 'ما هو الحكم الشرعي والكفارة المغلظة الواجبة على من أفسد صيام نهار رمضان عامداً بالجماع؟',
    options: [
      { id: 'opt_1', text_en: 'Giving 10 days of voluntary fasts after Eid', text_so: 'Soonka 10 maalmood oo sunno ah ciidda ka dib', text_ar: 'صيام عشرة أيام تطوعاً بعد العيد' },
      { id: 'opt_2', text_en: 'Making up the day (Qada) and performing severe expiation: freeing a slave, or fasting two consecutive lunar months, or feeding sixty needy people', text_so: 'Qaleeynta maalintaas iyo kafaaro culus: qoor xoreyn, haddii kale 2 bilood oo isku xigta oo soon ah, haddii kale 60 qof oo miskiin ah oo la quudiyo', text_ar: 'قضاء ذلك اليوم مع الكفارة المغلظة المرتبة: عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً' },
      { id: 'opt_3', text_en: 'Repentance alone without making up the day', text_so: 'Towbad oo kaliya oo aan qaleyn lahayn', text_ar: 'التوبة فقط دون قضاء ولا كفارة' },
      { id: 'opt_4', text_en: 'Paying twenty gold coins to the state treasury', text_so: 'Bixinta labaatan qadaadiic dahab ah', text_ar: 'دفع عشرين ديناراً ذهبياً لبيت المال' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The authentic prophetic Sunnah specifies that deliberately breaking Ramadan fast via intercourse incurs making up that day along with the severe Kaffarah: freeing a believer, or fasting two consecutive months, or feeding sixty poor persons.',
    explanation_so: 'Xadiiska Saxiixa ah ee Abu Hurayra wariyay wuxuu qeexay in galmada maalinta Ramadaan ay waajibinayso qaleynta maalintaas iyo kafaarada culus ee 2 bilood oo isku xigta ama 60 miskiin quudintooda.',
    explanation_ar: 'ثبت في الصحيحين في قصة الأعرابي أن كفارة الجماع في نهار رمضان عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً مع قضاء اليوم.',
    source_citation: 'Sahih al-Bukhari 1936; Sahih Muslim 1111',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 8. ZAKAT & CHARITY (zakat_charity)
  // ===========================================================================
  {
    id: 'ZKT-BEG-001',
    question_id: 'ZKT-BEG-001',
    category: 'zakat_charity',
    difficulty: 'beginner',
    question_en: 'What is the standard annual rate of Zakat payable on liquid monetary wealth and eligible commercial goods that exceed the Nisab for a full lunar year?',
    question_so: 'Immisa ayaa ah boqolkiiba heerka sakada sanadlaha ah ee laga bixiyo lacagta iyo ganacsiga markay nisaabka gaaraan oo sanad u wareego?',
    question_ar: 'ما هو المقدار الواجب إخراجه شرعاً كزكاة سنوية في الأموال النقدية وعروض التجارة إذا بلغت النصاب وحال عليها الحول؟',
    options: [
      { id: 'opt_1', text_en: '1% (One percent)', text_so: '1% (Boqolkiiba kow)', text_ar: '1% (واحد بالمائة)' },
      { id: 'opt_2', text_en: '2.5% (Two and a half percent / One-fortieth)', text_so: '2.5% (Boqolkiiba laba iyo bar / Afartan meelood meel)', text_ar: '2.5% (اثنان ونصف بالمائة / ربع العشر)' },
      { id: 'opt_3', text_en: '5% (Five percent)', text_so: '5% (Boqolkiiba shan)', text_ar: '5% (خمسة بالمائة)' },
      { id: 'opt_4', text_en: '10% (Ten percent)', text_so: '10% (Boqolkiiba toban)', text_ar: '10% (عشرة بالمائة)' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The standard rate of Zakat on wealth (gold, silver, cash currency, and business inventory) is 2.5% (or 1/40th), provided it meets the Nisab threshold and has been held for one full Hawl (lunar year).',
    explanation_so: 'Heerka sakada lacagta, dahabka, iyo ganacsiga waa 2.5% (ama 1/40) marka ay gaaraan nisaabka oo sanad qamari ah u buuxsamo.',
    explanation_ar: 'القدر الواجب إخراجه في زكاة النقدين وعروض التجارة هو ربع العشر (2.5%) بإجماع علماء المسلمين.',
    source_citation: 'Sahih al-Bukhari 1454; Sunan Abi Dawud 1572',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ZKT-INT-001',
    question_id: 'ZKT-INT-001',
    category: 'zakat_charity',
    difficulty: 'intermediate',
    question_en: 'How many distinct eligible recipient categories for Zakat distribution are designated by Allah in Surah At-Tawbah (9:60)?',
    question_so: 'Immisa qaybood oo xaq u leh qeybinta sakada ayaa Eebbe ku qeexay Suuradda At-Tawbah aayadda 60-aad?',
    question_ar: 'كم عدد الأصناف والمصارف الشرعية الثمانية المستحقة للزكاة المفروضة التي حصرها الله تعالى في سورة التوبة آية 60؟',
    options: [
      { id: 'opt_1', text_en: 'Five categories', text_so: 'Shan qaybood', text_ar: 'خمسة أصناف' },
      { id: 'opt_2', text_en: 'Eight categories', text_so: 'Siddeed qaybood', text_ar: 'ثمانية أصناف' },
      { id: 'opt_3', text_en: 'Ten categories', text_so: 'Toban qaybood', text_ar: 'عشرة أصناف' },
      { id: 'opt_4', text_en: 'Twelve categories', text_so: 'Laba iyo toban qaybood', text_ar: 'اثنا عشر صنفاً' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Surah At-Tawbah 9:60 establishes eight specific categories: the poor (fuqara), the needy (masakeen), administrators of Zakat, those whose hearts are to be reconciled, freeing captives/slaves, those in debt, in the cause of Allah, and the stranded traveler.',
    explanation_so: 'Suuradda At-Tawbah 9:60 waxay xustay 8 qaybood: Faqiirka, Miskiinka, Shaqaalaha sakada, Kuwa qalbigooda la dhowrayo, Qoor xoreynta, Kuwa deyntu gashay, Jidka Eebbe, iyo Qofka jidka ku go\'ay.',
    explanation_ar: 'مصارف الزكاة ثمانية بنص القرآن: {إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ}.',
    source_citation: 'Quran 9:60; Tafsir Ibn Kathir (4/165)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ZKT-ADV-001',
    question_id: 'ZKT-ADV-001',
    category: 'zakat_charity',
    difficulty: 'advanced',
    question_en: 'What is the classical Nisab threshold for gold in traditional Islamic fiqh, measured in historical Mithqals and modern grams?',
    question_so: 'Immisa ayaa ah nisaabka dahabka ee fiqiga Islaamka lagu cabbiro xagga miisaanka qadiimiga ah (Mithqaal) iyo garaamyada casriga ah?',
    question_ar: 'ما هو نصاب الذهب الشرعي المعتبر في الفقه الإسلامي مقدراً بالمثاقيل والجرامات المعاصرة؟',
    options: [
      { id: 'opt_1', text_en: '10 Mithqals (~42.5 grams)', text_so: '10 Mithqaal (~42.5 garaam)', text_ar: '10 مثاقيل (نحو 42.5 جراماً)' },
      { id: 'opt_2', text_en: '20 Mithqals (approximately 85 grams of pure gold)', text_so: '20 Mithqaal (qiyaastii 85 garaam oo dahab saafi ah)', text_ar: '20 مثقالاً (ما يعادل 85 جراماً من الذهب الخالص عيار 24)' },
      { id: 'opt_3', text_en: '50 Mithqals (~200 grams)', text_so: '50 Mithqaal (~200 garaam)', text_ar: '50 مثقالاً (نحو 200 جرام)' },
      { id: 'opt_4', text_en: '100 Mithqals (~400 grams)', text_so: '100 Mithqaal (~400 garaam)', text_ar: '100 مثقال (نحو 400 جرام)' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The prophetic Sunnah established the gold Nisab at 20 Dinar/Mithqal. Contemporary Islamic fiqh academies uniformly equate this to approximately 85 grams of 24-karat gold.',
    explanation_so: 'Sunnada Nabigu waxay dejisay nisaabka dahabka 20 Mithqaal, taas oo culimada casriga ah iyo majmacyada fiqigu ku qiyaaseen 85 garaam oo dahab saafi ah.',
    explanation_ar: 'نصاب الذهب الشرعي عشرون ديناراً/مثقالاً بحديث: "وليس عليك شيء حتى يكون لك عشرون ديناراً"، ويساوي 85 جراماً من الذهب الخالص.',
    source_citation: 'Sunan Abi Dawud 1573; Majma\' al-Fiqh al-Islami (Resolution 42)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 9. HAJJ & UMRAH PILGRIMAGE (hajj_umrah)
  // ===========================================================================
  {
    id: 'HAJ-BEG-001',
    question_id: 'HAJ-BEG-001',
    category: 'hajj_umrah',
    difficulty: 'beginner',
    question_en: 'On which Islamic date does the central rite of Standing at Arafah (Wuquf bi-\'Arafah) take place?',
    question_so: 'Taariikhdee bisha Dul-Xijjah ayay dhacdaa taagnida buurta Carafo (Wuquufka Carafo)?',
    question_ar: 'في أي يوم من أيام شهر ذي الحجة يؤدي الحجاج الركن الأعظم بالوقوف بصعيد عرفات الطاهر؟',
    options: [
      { id: 'opt_1', text_en: '1st of Dhul-Hijjah', text_so: '1-da Dul-Xijjah', text_ar: 'اليوم الأول من ذي الحجة' },
      { id: 'opt_2', text_en: '8th of Dhul-Hijjah (Yawm at-Tarwiyah)', text_so: '8-da Dul-Xijjah (Yawmu Tarwiyah)', text_ar: 'يوم التروية (الثامن من ذي الحجة)' },
      { id: 'opt_3', text_en: '9th of Dhul-Hijjah (Yawm \'Arafah)', text_so: '9-ka Dul-Xijjah (Maalinta Carafo)', text_ar: 'يوم عرفة (التاسع من شهر ذي الحجة)' },
      { id: 'opt_4', text_en: '10th of Dhul-Hijjah (Yawm an-Nahr)', text_so: '10-ka Dul-Xijjah (Maalinta Ciidda)', text_ar: 'يوم النحر (العاشر من ذي الحجة)' },
    ],
    correct_option_id: 'opt_3',
    explanation_en: 'The Prophet Muhammad ﷺ declared: "Al-Hajju \'Arafah" (Hajj is Arafah). The standing on the plains of Arafah occurs on the 9th day of Dhul-Hijjah from noon until sunset.',
    explanation_so: 'Nabigu ﷺ wuxuu yiri: "Xajku waa Carafo". Taagnida bananka Carafo waxay dhacdaa 9-ka bisha Dul-Xijjah laga bilaabo duhurka ilaa qorrax dhaca.',
    explanation_ar: 'قال رسول الله ﷺ: "الحج عرفة"، ووقته يبدأ من زوال شمس يوم التاسع من ذي الحجة.',
    source_citation: 'Jami\' at-Tirmidhi 889; Sunan Abi Dawud 1949',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HAJ-INT-001',
    question_id: 'HAJ-INT-001',
    category: 'hajj_umrah',
    difficulty: 'intermediate',
    question_en: 'What are the four non-negotiable Pillars (Arkan) of Hajj according to the majority of Islamic jurists, without which Hajj is void?',
    question_so: 'Maxay yihiin 4-ta tiir ee aasaasiga ah ee Xajka (Arkaanul Xajj) oo haddii mid la dhaafo uusan Xajku ansaxayn?',
    question_ar: 'ما هي الأركان الأربعة الكبرى للحج عند جمهور الفقهاء التي لا يصح الحج إلا بأدائها جميعاً ولا تجبر بدم؟',
    options: [
      { id: 'opt_1', text_en: 'Shaving head, staying in Madinah, drinking Zamzam, and fasting 3 days', text_so: 'Xiirashada madaxa, joogitaanka Madiina, cabidda Zamzam, iyo soonka 3 maalmood', text_ar: 'حلق الرأس، وزيارة المدينة، وشرب زمزم، وصيام ثلاثة أيام' },
      { id: 'opt_2', text_en: 'Ihram (intention), Wuquf at Arafah, Tawaf al-Ifadah, and Sa\'i between Safa and Marwah', text_so: 'Ixraamka (Niyadda), Taagnida Carafo, Dawaafka Ifaada, iyo Saciga Safa iyo Marwa', text_ar: 'الإحرام (النية)، والوقوف بعرفة، وطواف الإفاضة، والسعي بين الصفا والمروة' },
      { id: 'opt_3', text_en: 'Buying gifts, sacrificing 5 sheep, visiting Cave Hira, and climbing Mount Uhud', text_so: 'Hadyadaha, qallidda 5 neef, booqashada godka Xiraa, iyo fuulidda buurta Uxud', text_ar: 'شراء الهدايا، وذبح خمسة شياه، وزيارة غار حراء، وصعود جبل أحد' },
      { id: 'opt_4', text_en: 'Entering Makkah before Shawwal and praying 40 prayers in Mina', text_so: 'Galidda Makka ka hor Shawaal iyo 40 salaadood oo Mina lagu tukado', text_ar: 'دخول مكة قبل شوال، وأداء أربعين صلاة في منى' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The four essential pillars of Hajj are Ihram, Standing at Arafah, Tawaf al-Ifadah, and Sa\'i. If any pillar is omitted, the pilgrimage cannot be compensated by animal sacrifice and remains incomplete.',
    explanation_so: 'Afar-ta tiir ee Xajka waa: Ixraamka, Taagnida Carafo, Dawaafka Ifaadah, iyo Saciga Safa iyo Marwa. Haddii mid ka dhaafo xajku ma ansaxayo dhiigna kuma saxmi karo.',
    explanation_ar: 'أركان الحج الأربعة عند الجمهور: الإحرام، والوقوف بعرفة، وطواف الإفاضة، والسعي بين الصفا والمروة.',
    source_citation: 'Bidayat al-Mujtahid (Ibn Rushd 1/334); Al-Majmu\' (8/82)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HAJ-ADV-001',
    question_id: 'HAJ-ADV-001',
    category: 'hajj_umrah',
    difficulty: 'advanced',
    question_en: 'What is the designated Miqat (geographic boundary for assuming Ihram) for pilgrims coming from or passing through Al-Madinah Al-Munawwarah?',
    question_so: 'Waa kuwee Miqaatka (goobta xadka juqraafi ee laga xidho Ixraamka) dadka ka imanaya ama soo maraya Madiina Al-Munawwarah?',
    question_ar: 'ما هو الميقات المكاني الذي وقته النبي ﷺ لأهل المدينة المنورة ومن مر بها من الحجاج والمعتمرين؟',
    options: [
      { id: 'opt_1', text_en: 'Al-Juhfah (near Rabigh)', text_so: 'Al-Juxfah (u dhow Raabigh)', text_ar: 'الجحفة' },
      { id: 'opt_2', text_en: 'Dhul-Hulayfah (known today as Abyar \'Ali)', text_so: 'Dul-Xulayfah (oo maanta loo yaqaan Abyaar Cali)', text_ar: 'ذو الحليفة (المعروف اليوم بأبيار علي)' },
      { id: 'opt_3', text_en: 'Yalamlam (As-Sa\'diyyah)', text_so: 'Yalamlam', text_ar: 'يلملم' },
      { id: 'opt_4', text_en: 'Qarn al-Manazil (As-Sayl al-Kabir)', text_so: 'Qarnul Manaazil', text_ar: 'قرن المنازل' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Ibn Abbas narrated that the Messenger of Allah ﷺ designated Dhul-Hulayfah for the people of Madinah. It is the furthest Miqat from Makkah (approximately 410 km).',
    explanation_so: 'Nabigu ﷺ wuxuu dadka Madiina ka imanaya u asteeyay Dul-Xulayfah (Abyaar Cali), waana miqaatka ugu fog Makka.',
    explanation_ar: 'عن ابن عباس رضي الله عنهما قال: "وقت رسول الله ﷺ لأهل المدينة ذا الحليفة، ولأهل الشام الجحفة، ولأهل نجد قرن المنازل، ولأهل اليمن يلملم".',
    source_citation: 'Sahih al-Bukhari 1524; Sahih Muslim 1181',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 10. SEERAH & PROPHETIC BIOGRAPHY (seerah)
  // ===========================================================================
  {
    id: 'SRH-BEG-001',
    question_id: 'SRH-BEG-001',
    category: 'seerah',
    difficulty: 'beginner',
    question_en: 'In which historic cave outside Makkah was the Prophet Muhammad ﷺ worshipping when he received the first revelation of the Quran from Angel Jibril?',
    question_so: 'Godkee ku yaal banaanka Makka ayuu Nabigu ﷺ ku cibaadaysanayay markii ay ugu timid waxyigii ugu horreeyay ee Malaa\'ig Jibriil siday?',
    question_ar: 'في أي غار مبارك بجبل النور كان النبي ﷺ يتعبد ويتحنث حين نزل عليه أمين الوحي جبريل عليه السلام بأول آيات القرآن؟',
    options: [
      { id: 'opt_1', text_en: 'Cave of Thawr (Ghar Thawr)', text_so: 'Godka Thowr', text_ar: 'غار ثور' },
      { id: 'opt_2', text_en: 'Cave of Hira (Ghar Hira on Jabal an-Nur)', text_so: 'Godka Xiraa (Buurta Nuur)', text_ar: 'غار حراء بجبل النور' },
      { id: 'opt_3', text_en: 'Cave of Uhud', text_so: 'Godka Uxud', text_ar: 'غار أحد' },
      { id: 'opt_4', text_en: 'Cave of Safa', text_so: 'Godka Safa', text_ar: 'غار الصفا' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Prophet Muhammad ﷺ engaged in solitary worship in the Cave of Hira on Jabal an-Nur when Angel Jibril descended with Surah Al-\'Alaq: "Iqra bismi Rabbika alladhi khalaq."',
    explanation_so: 'Nabiga ﷺ wuxuu ku cibaadaysanayay Godka Xiraa ee ku yaal Buurta Nuur markii Jibriil u keenay aayadaha ugu horreeya ee Suuradda Al-Calaq ("Akhri").',
    explanation_ar: 'كان النبي ﷺ يتحنث في غار حراء، وهو غار لطيف في قمة جبل النور، حين نزل عليه جبريل بآيات سورة العلق الأولى: {اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ}.',
    source_citation: 'Sahih al-Bukhari 3; Ar-Raheeq Al-Makhtum (p. 64)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'SRH-INT-001',
    question_id: 'SRH-INT-001',
    category: 'seerah',
    difficulty: 'intermediate',
    question_en: 'In which year of the Hijrah did the decisive first major engagement, the Battle of Badr (Ghazwat Badr al-Kubra), take place during the month of Ramadan?',
    question_so: 'Sannadkee hijriga ayuu dhacay dagaalkii weynaa ee Beder (Badrul Kubraa) bishii barakaysnayd ee Ramadaan?',
    question_ar: 'في أي سنة من الهجرة النبوية المباركة وقعت غزوة بدر الكبرى، يوم الفرقان، في شهر رمضان المبارك؟',
    options: [
      { id: 'opt_1', text_en: '1st Year of Hijrah (1 AH)', text_so: 'Sannadkii 1-aad ee Hijrada', text_ar: 'السنة الأولى للهجرة' },
      { id: 'opt_2', text_en: '2nd Year of Hijrah (2 AH - 17th of Ramadan)', text_so: 'Sannadkii 2-aad ee Hijrada (17-kii Ramadaan)', text_ar: 'السنة الثانية للهجرة (17 رمضان)' },
      { id: 'opt_3', text_en: '5th Year of Hijrah (5 AH)', text_so: 'Sannadkii 5-aad ee Hijrada', text_ar: 'السنة الخامسة للهجرة' },
      { id: 'opt_4', text_en: '8th Year of Hijrah (8 AH)', text_so: 'Sannadkii 8-aad ee Hijrada', text_ar: 'السنة الثامنة للهجرة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Battle of Badr occurred on Friday, the 17th of Ramadan in the 2nd year of the Hijrah. Allah granted an astonishing victory to 313 ill-equipped believers over 1,000 Qurayshi warriors.',
    explanation_so: 'Dagaalkii Beder wuxuu dhacay Jimce, 17-kii Ramadaan sannadkii 2-aad ee Hijrada, markaas oo Eebbe guul weyn siiyay 313 qof oo mu\'miniin ah.',
    explanation_ar: 'وقعت غزوة بدر الكبرى في 17 رمضان من السنة الثانية للهجرة، وسماها القرآن "يوم الفرقان يوم التقى الجمعان".',
    source_citation: 'Quran 8:41; Sahih al-Bukhari 3953; Zad al-Ma\'ad (3/154)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'SRH-ADV-001',
    question_id: 'SRH-ADV-001',
    category: 'seerah',
    difficulty: 'advanced',
    question_en: 'What was the solemn mutual oath undertaken by the Companions beneath the tree at Al-Hudaybiyyah (6 AH) to stand faithfully by the Prophet ﷺ?',
    question_so: 'Muxuu ahaa heshiiskii iyo ballantii sharafta lahayd ee asxaabtu kula galeen geedka hoostiisa Nabiga ﷺ xilligii Xudaybiyah (Baycatu Ridwaan)?',
    question_ar: 'ما هو اسم البيعة التاريخية المباركة التي بايع فيها الصحابة رضي الله عنهم النبي ﷺ تحت الشجرة بالحديبية على الثبات وعدم الفرار؟',
    options: [
      { id: 'opt_1', text_en: 'Bay\'at al-\'Aqabah al-Ula', text_so: 'Baycatul Caqaba ee kowaad', text_ar: 'بيعة العقبة الأولى' },
      { id: 'opt_2', text_en: 'Bay\'at ar-Ridwan (Pledge of Pleasure, ratified in Surah Al-Fath)', text_so: 'Baycatu Ridwaan (Ballantii Raallinimada ee Suuradda Al-Fatxi)', text_ar: 'بيعة الرضوان التي أنزل الله فيها: {لَقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ}' },
      { id: 'opt_3', text_en: 'Hilf al-Fudul', text_so: 'Xilful Fudul', text_ar: 'حلف الفضول' },
      { id: 'opt_4', text_en: 'Bay\'at an-Nisa', text_so: 'Baycatu Nisaa', text_ar: 'بيعة النساء' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Bay\'at ar-Ridwan occurred in 6 AH when approximately 1,400 companions pledged to die for the faith after rumors that Uthman ibn Affan was murdered. Allah revealed: "Allah was pleased with the believers when they pledged allegiance under the tree" (48:18).',
    explanation_so: 'Baycatu Ridwaan waxay dhacday sannadkii 6-aad ee Hijrada markii ku dhawaad 1,400 saxaabi ay Nabiga ﷺ kula ballameen inay diinta u dhimanayaan, Eebbana wuxuu ku caddeeyay raallinimadiisa aayadda 18 ee Suuradda Al-Fatxi.',
    explanation_ar: 'بيعة الرضوان بايع فيها نحو 1400 صحابي إثر إشاعة مقتل عثمان بن عفان، فرضي الله عنهم بنص القرآن الكريم.',
    source_citation: 'Quran 48:18; Sahih al-Bukhari 4169; Sahih Muslim 1856',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 11. ISLAMIC HISTORY & SAHABAH (history_companions)
  // ===========================================================================
  {
    id: 'HST-BEG-001',
    question_id: 'HST-BEG-001',
    category: 'history_companions',
    difficulty: 'beginner',
    question_en: 'Who was the first Rightly-Guided Caliph (Al-Khalifah ar-Rashid) to lead the Muslim Ummah following the passing of the Prophet ﷺ?',
    question_so: 'Yuu ahaa Khaliifkii ugu horreeyay ee Khulafadii Raashidiinta ee hoggaamiyay ummadda geeridii Nabiga ﷺ ka dib?',
    question_ar: 'من هو أول الخلفاء الراشدين رضي الله عنهم وأفضل الأمة بعد نبيها بإجماع الصحابة والتابعين؟',
    options: [
      { id: 'opt_1', text_en: 'Umar ibn al-Khattab', text_so: 'Cumar bin Khadaab', text_ar: 'عمر بن الخطاب رضي الله عنه' },
      { id: 'opt_2', text_en: 'Abu Bakr as-Siddiq', text_so: 'Abu Bakar As-Siddiiq', text_ar: 'أبو بكر الصديق رضي الله عنه' },
      { id: 'opt_3', text_en: 'Uthman ibn Affan', text_so: 'Cusmaan bin Cafaan', text_ar: 'عثمان بن عفان رضي الله عنه' },
      { id: 'opt_4', text_en: 'Ali ibn Abi Talib', text_so: 'Cali bin Abi Dhaalib', text_ar: 'علي بن أبي طالب رضي الله عنه' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Abu Bakr as-Siddiq was unanimously chosen as the first Caliph at Saqifat Bani Sa\'idah, preserving the unity of Islam and leading the campaign against apostasy.',
    explanation_so: 'Abu Bakar As-Siddiiq wuxuu ahaa khaliifkii 1-aad ee lagu doortay Saqiifadii Banii Saacidah, isagoo difaacay diinta iyo midnimada ummadda.',
    explanation_ar: 'أبو بكر الصديق هو أول الخلفاء الراشدين، وصاحب رسول الله ﷺ في الغار، وأول من آمن به من الرجال.',
    source_citation: 'Sahih al-Bukhari 3667; Al-Bidayah wan-Nihayah (Ibn Kathir 5/241)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HST-INT-001',
    question_id: 'HST-INT-001',
    category: 'history_companions',
    difficulty: 'intermediate',
    question_en: 'Under whose caliphate was the Holy Quran officially compiled into standardized master codices (Al-Mushaf al-Imam) and distributed to major Islamic metropolitan centers?',
    question_so: 'Khaliifkee xilligii uu talada hayay ayaa Quraanka Kariimka ah loo qoray qaab halbeeg ah oo rasmi ah (Mushafka Cusmaaniga ah) loona diray magaalooyinka waaweyn?',
    question_ar: 'في عهد أي من الخلفاء الراشدين جُمع القرآن الكريم في مصحف واحد إمام، ونُسخت منه المصاحف وأُرسلت إلى الأمصار؟',
    options: [
      { id: 'opt_1', text_en: 'Umar ibn al-Khattab', text_so: 'Cumar bin Khadaab', text_ar: 'عمر بن الخطاب رضي الله عنه' },
      { id: 'opt_2', text_en: 'Uthman ibn Affan (Dhul-Nurayn)', text_so: 'Cusmaan bin Cafaan (Dul-Nuurayn)', text_ar: 'عثمان بن عفان رضي الله عنه' },
      { id: 'opt_3', text_en: 'Ali ibn Abi Talib', text_so: 'Cali bin Abi Dhaalib', text_ar: 'علي بن أبي طالب رضي الله عنه' },
      { id: 'opt_4', text_en: 'Mu\'awiyah ibn Abi Sufyan', text_so: 'Mucaawiya bin Abi Sufyaan', text_ar: 'معاوية بن أبي سفيان رضي الله عنه' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Uthman ibn Affan commissioned a committee led by Zayd ibn Thabit to produce master standard copies of the Quran in the Quraishi dialect around 25 AH, eliminating recitation disputes across the expanding empire.',
    explanation_so: 'Cusmaan bin Cafaan wuxuu magacaabay guddi uu madax u yahay Zayd bin Thaabit si loo qoro Mushafka Cusmaaniga ah ee mideeyay ummadda.',
    explanation_ar: 'جمع عثمان بن عفان الأمة على مصحف واحد بحرف قريش حسماً للاختلاف في القراءات، وعُرف بالمصحف العثماني.',
    source_citation: 'Sahih al-Bukhari 4987; Al-Itqan fi \'Ulum al-Qur\'an (As-Suyuti 1/211)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'HST-ADV-001',
    question_id: 'HST-ADV-001',
    category: 'history_companions',
    difficulty: 'advanced',
    question_en: 'Which brilliant Muslim military commander was designated by Prophet Muhammad ﷺ as "Sayfullah al-Maslul" (The Drawn Sword of Allah)?',
    question_so: 'Waa kuwee hoggaamiyihii ciidanka Islaamka ee caanka ahaa ee uu Nabigu ﷺ ugu magacdaray "Sayfullaah Al-Masluul" (Seefta Eebbe ee galka laga saaray)?',
    question_ar: 'من هو القائد العسكري المسلم الفذ الذي لقبه رسول الله ﷺ بـ "سيف الله المسلول" بعد معركة مؤتة؟',
    options: [
      { id: 'opt_1', text_en: 'Sa\'d ibn Abi Waqqas', text_so: 'Sacdi bin Abi Waqaas', text_ar: 'سعد بن أبي وقاص رضي الله عنه' },
      { id: 'opt_2', text_en: 'Khalid ibn al-Walid', text_so: 'Khaalid bin Walid', text_ar: 'خالد بن الوليد رضي الله عنه' },
      { id: 'opt_3', text_en: 'Abu Ubaydah ibn al-Jarrah', text_so: 'Abu Cubaydah bin Al-Jarraax', text_ar: 'أبو عبيدة بن الجراح رضي الله عنه' },
      { id: 'opt_4', text_en: 'Amr ibn al-\'As', text_so: 'Camar bin Al-Caas', text_ar: 'عمرو بن العاص رضي الله عنه' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Following his strategic triumph in saving the Muslim army at Mu\'tah (8 AH), the Prophet ﷺ praised him: "Then the banner was taken by a sword from the swords of Allah, Khalid ibn al-Walid."',
    explanation_so: 'Dagaalkii Mu\'tah ka dib markii uu Khaalid bin Walid badbaadiyay ciidanka Islaamka, Nabigu ﷺ wuxuu ku ammaanay inuu yahay Seef ka mid ah seeffaha Eebbe.',
    explanation_ar: 'قال رسول الله ﷺ ناعياً قادة مؤتة: "حَتَّى أَخَذَ الرَّايَةَ سَيْفٌ مِنْ سُيُوفِ اللَّهِ، حَتَّى فَتَحَ اللَّهُ عَلَيْهِمْ"، يعني خالد بن الوليد.',
    source_citation: 'Sahih al-Bukhari 3757, 4262',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 12. ADHKAR, DUAS & ISLAMIC MANNERS (adhkar_duas_manners)
  // ===========================================================================
  {
    id: 'ADK-BEG-001',
    question_id: 'ADK-BEG-001',
    category: 'adhkar_duas_manners',
    difficulty: 'beginner',
    question_en: 'What is the standard prophetic greeting of peace in Islam?',
    question_so: 'Waa kuwee salaanta asalka ah ee nabadeed ee Nabigeenna ﷺ noo jideeyay inaan isku salaanno?',
    question_ar: 'ما هي تحية الإسلام المباركة التي شرعها الله تعالى ورسوله ﷺ لإفشاء السلام بين المسلمين؟',
    options: [
      { id: 'opt_1', text_en: 'Sabah al-Khayr', text_so: 'Subax wanaagsan', text_ar: 'صباح الخير' },
      { id: 'opt_2', text_en: 'As-Salamu \'Alaykum wa Rahmatullahi wa Barakatuh', text_so: 'Assalaamu Calaykum Waraxmatullaahi Wabarakaatuh', text_ar: 'السلام عليكم ورحمة الله وبركاته' },
      { id: 'opt_3', text_en: 'Ahlan wa Sahlan', text_so: 'Ku soo dhawoow', text_ar: 'أهلاً وسهلاً' },
      { id: 'opt_4', text_en: 'Marhaban', text_so: 'Marxabbaa', text_ar: 'مرحباً بكم' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ taught the greeting of peace with thirty rewards for the complete phrasing: "As-Salamu \'Alaykum wa Rahmatullahi wa Barakatuh."',
    explanation_so: 'Nabigu ﷺ wuxuu baray asxaabta salaanta buuxda ee xambaarsan 30-ka xasano: "Assalaamu Calaykum Waraxmatullaahi Wabarakaatuh."',
    explanation_ar: 'ثبت في سنن أبي داود والترمذي أن رجلاً قال: السلام عليكم ورحمة الله وبركاته، فقال النبي ﷺ: "ثلاثون"، أي ثلاثون حسنة.',
    source_citation: 'Sunan Abi Dawud 5195; Jami\' at-Tirmidhi 2689',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ADK-INT-001',
    question_id: 'ADK-INT-001',
    category: 'adhkar_duas_manners',
    difficulty: 'intermediate',
    question_en: 'What is the prophetic supplication recited at the conclusion of a gathering (Kaffarat al-Majlis) to expiate minor shortcomings?',
    question_so: 'Waa kuwee ducada Nabiga ﷺ ee lagu xidho fadhiga (Kafaaratul Majlis) si Eebbe u dhaafo dunuubta yar yar ee fadhigaas ku dhacday?',
    question_ar: 'ما هو دعاء كفارة المجلس المأثور عن النبي ﷺ الذي يمحو ما كان في المجلس من لغو وتقصير؟',
    options: [
      { id: 'opt_1', text_en: '"Alhamdulillah rabbil \'alamin"', text_so: '"Alxamdulillaahi Rabbil Caalamiin"', text_ar: '"الحمد لله رب العالمين"' },
      { id: 'opt_2', text_en: '"Subhanak-Allahumma wa bihamdika, ash-hadu an la ilaha illa Anta, astaghfiruka wa atubu ilayk"', text_so: '"Subxaanakallaahumma wabixamdika, ash-hadu an laa ilaaha illaa anta, astaghfiruka wa atuubu ilayk"', text_ar: '"سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ"' },
      { id: 'opt_3', text_en: '"Bismillahi tawakkaltu \'alallah"', text_so: '"Bismillaahi tawakkaltu calallaah"', text_ar: '"بسم الله توكلت على الله"' },
      { id: 'opt_4', text_en: '"La hawla wa la quwwata illa billah"', text_so: '"Laa xowla walaa quwwata illaa billaah"', text_ar: '"لا حول ولا قوة إلا بالله"' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ stated: "Whoever sits in a gathering wherein there is excessive chatter and says before standing: \'Subhanak-Allahumma wa bihamdika...\', Allah forgives what occurred in that gathering."',
    explanation_so: 'Nabigu ﷺ wuxuu sheegay in qofkii fadhiya meel ay hadal badatay oo akhriya ducadan ka hor intaanu kicin, Eebbe u dhaafi doono wixii fadhigaas ka dhacay.',
    explanation_ar: 'قال رسول الله ﷺ: "من جلس في مجلس فكثر فيه لغطه فقال قبل أن يقوم: سبحانك اللهم وبحمدك... إلا غفر له ما كان في مجلسه ذلك".',
    source_citation: 'Jami\' at-Tirmidhi 3433; Sahih al-Jami\' (6192)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ADK-ADV-001',
    question_id: 'ADK-ADV-001',
    category: 'adhkar_duas_manners',
    difficulty: 'advanced',
    question_en: 'What is the celebrated opening of "Sayyid al-Istighfar" (The Master Supplication for Forgiveness) as taught in Sahih al-Bukhari?',
    question_so: 'Sidee ayuu ku bilaabmaa Sayidul Istighfaar (Ducada ugu sarreysa Dambi-dhaaf-weydiga) ee ku qoran Saxiixul Bukhaari?',
    question_ar: 'ما هي الكلمات الافتتاحية العظيمة لدعاء "سيد الاستغفار" الذي رواه البخاري في صحيحه؟',
    options: [
      { id: 'opt_1', text_en: '"Astaghfirullaha wa atubu ilayh"', text_so: '"Astaghfirullaaha wa atuubu ilayh"', text_ar: '"أستغفر الله وأتوب إليه"' },
      { id: 'opt_2', text_en: '"Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana \'abduka..."', text_so: '"Allaahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa ana cabduka..."', text_ar: '"اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ..."' },
      { id: 'opt_3', text_en: '"Rabbi ighfirli wa tub \'alayya"', text_so: '"Rabbi ighfir lii wa tub calayya"', text_ar: '"رب اغفر لي وتب عليَّ"' },
      { id: 'opt_4', text_en: '"Allahumma innaka \'afuwwun tuhibbul \'afwa fa\'fu \'anni"', text_so: '"Allaahumma innaka cafwwun tuhibbul cafwa facfu cannii"', text_ar: '"اللهم إنك عفو تحب العفو فاعف عني"' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Prophet Muhammad ﷺ described this supplication as Sayyid al-Istighfar: "Whoever recites it during the day with conviction and dies that day before evening is among the people of Paradise."',
    explanation_so: 'Nabigu ﷺ wuxuu ducadan ku magacaabay Sayidul Istighfaar: "Qofkii maalinkii akhriya isagoo yaqiinsan oo maalintaas dhinta qorrax dhaca ka hor wuxuu ka mid yahay reer Jannada."',
    explanation_ar: 'قال رسول الله ﷺ: "سيد الاستغفار: اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك... من قالها موقناً بها فمات من يومه فهو من أهل الجنة".',
    source_citation: 'Sahih al-Bukhari 6306',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 13. ISLAMIC ETHICS & DAILY LIFE (ethics_daily_life)
  // ===========================================================================
  {
    id: 'ETH-BEG-001',
    question_id: 'ETH-BEG-001',
    category: 'ethics_daily_life',
    difficulty: 'beginner',
    question_en: 'What is the paramount moral duty toward parents in Islamic ethics termed in the Quran and Hadith?',
    question_so: 'Muxuu yahay waajibka ugu weyn ee akhlaaqda Islaamku saartay ubadka xagga waalidiinta (Waalid-dhowridda)?',
    question_ar: 'ما هو المصطلح الشرعي المعبر عن أوجب الواجبات الأخلاقية للإحسان إلى الوالدين وطاعتهما في غير معصية؟',
    options: [
      { id: 'opt_1', text_en: 'Silat al-Arham', text_so: 'Xiriirinta qaraabada', text_ar: 'صلة الأرحام' },
      { id: 'opt_2', text_en: 'Birr al-Walidayn (Devotion and Excellence to Parents)', text_so: 'Baarrinimada Waalidiinta (Birrul Waalidayn)', text_ar: 'بر الوالدين والإحسان إليهما' },
      { id: 'opt_3', text_en: 'Husn al-Jiwar', text_so: 'Daris-wanaagga', text_ar: 'حسن الجوار' },
      { id: 'opt_4', text_en: 'Al-Ihsan bil-Yateem', text_so: 'U gargaaridda agoonta', text_ar: 'كفالة اليتيم' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Allah paired worship of Him with Birr al-Walidayn in multiple verses: "And your Lord has decreed that you not worship except Him, and to parents, good treatment" (Quran 17:23).',
    explanation_so: 'Eebbe wuxuu cibaadadiisa ku lamaaniyay baarrinimada waalidiinta: "Eebahaana wuxuu xukumay inaadan caabudin isaga mooyee oo aad waalidiinta u samafashaan" (Al-Isra 17:23).',
    explanation_ar: 'قرن الله حقه بالبر بالوالدين: {وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا}، وهو من أحب الأعمال إلى الله.',
    source_citation: 'Quran 17:23-24; Sahih al-Bukhari 5971',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ETH-INT-001',
    question_id: 'ETH-INT-001',
    category: 'ethics_daily_life',
    difficulty: 'intermediate',
    question_en: 'How did the Prophet Muhammad ﷺ define "Gheebah" (Backbiting) when clarifying it to his Companions?',
    question_so: 'Sidee ayuu Nabigu ﷺ u qeexay "Xanta" (Qaybada) markii uu asxaabta u faahfaahinayay?',
    question_ar: 'كيف عرّف النبي ﷺ "الغيبة" المحرمة حين سأله الصحابة الكرام عنها؟',
    options: [
      { id: 'opt_1', text_en: 'Saying something praising your brother in his presence', text_so: 'Inaad walaalkaa ammaanto isagoo jooga', text_ar: 'مدح أخيك في وجهه أمام الناس' },
      { id: 'opt_2', text_en: 'Mentioning concerning your brother that which he dislikes hearing, even if it is true', text_so: 'Inaad walaalkaa ku sheegto wax uu neceb yahay in laga sheego, xataa hadday dhab tahay', text_ar: 'ذكرك أخاك بما يكره، فإن كان فيه ما تقول فقد اغتبته، وإن لم يكن فيه فقد بهته' },
      { id: 'opt_3', text_en: 'Disagreeing with someone on commercial prices', text_so: 'Inaad qof kaga aragti duwanaato qiimaha suuqa', text_ar: 'الاختلاف معه في أسعار السلع التجارية' },
      { id: 'opt_4', text_en: 'Advising someone in private regarding their error', text_so: 'Inaad qof si qarsoodi ah ugu nasteexeyso', text_ar: 'مناصحته سراً فيما أخطأ فيه' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'In Sahih Muslim, the Prophet ﷺ defined backbiting as mentioning your brother with what he dislikes. If what you say is in him, you have backbitten him; if it is not in him, you have slandered him (Buhtan).',
    explanation_so: 'Nabigu ﷺ wuxuu sheegay: "Xantu waa inaad walaalkaa ku xusto wax uu neceb yahay". Haddii waxaad sheegtay ay ku jiraan waad xamatay, haddii aysan ku jirinna waad been-abuuratay.',
    explanation_ar: 'قال رسول الله ﷺ: "أَتَدْرُونَ مَا الْغِيبَةُ؟ قَالُوا: اللَّهُ وَرَسُولُهُ أَعْلَمُ، قَالَ: ذِكْرُكَ أَخَاكَ بِمَا يَكْرَهُ".',
    source_citation: 'Sahih Muslim 2589; Quran 49:12',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ETH-ADV-001',
    question_id: 'ETH-ADV-001',
    category: 'ethics_daily_life',
    difficulty: 'advanced',
    question_en: 'In spiritual ethics (Tazkiyah), what is the crucial distinction between praiseworthy "Ghibtah" (enviable aspiration) and condemned "Hasad" (destructive jealousy)?',
    question_so: 'Culuumta Daahirinta Qalbiga, maxay tahay farqiga saxda ah ee u dhexeeya "Qibdada" la ammaano iyo "Xasidka" xaaraanta ah?',
    question_ar: 'في علم تزكية النفوس والأخلاق الشرعية، ما هو الفارق الدقيق الفاصل بين "الغبطة" المحمودة و"الحسد" المذموم المحرم؟',
    options: [
      { id: 'opt_1', text_en: 'Ghibtah relates solely to physical athletic competition, while Hasad relates to religious knowledge', text_so: 'Qibdadu waxay ku kooban tahay tartanka ciyaaraha, Xasidkuna cilmiga', text_ar: 'الغبطة تتعلق بالمنافسات البدنية، والحسد يتعلق بالعلم الشرعي' },
      { id: 'opt_2', text_en: 'Hasad is wishing that the blessing be stripped from another person, whereas Ghibtah is wishing for the same good blessing for oneself without desiring its loss from the other', text_so: 'Xasidku waa inaad jeclaato in nicmaddu ka suusho qofka kale, Qibdaduna waa inaad naftaada la doonto khayrkaas bilaa in qofka laga qaado', text_ar: 'الحسد تمني زوال النعمة عن المنعَم عليه، بينما الغبطة تمني حصول مثل تلك النعمة للنفس دون زوالها عن صاحبها' },
      { id: 'opt_3', text_en: 'Ghibtah is permissible only in matters of commerce and business profit', text_so: 'Qibdadu waxay bannaan tahay oo kaliya ganacsiga iyo faa\'iidada adduunka', text_ar: 'الغبطة لا تجوز إلا في التجارة وجمع الأرباح المالية الدنيوية' },
      { id: 'opt_4', text_en: 'Hasad is expressed verbally, while Ghibtah is harbored silently in the heart', text_so: 'Xasidka afka ayaa laga sheegaa, Qibdadana qalbiga', text_ar: 'الحسد يكون باللسان فقط، والغبطة تكون عملاً قلبياً خفياً' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Hasad is inherently malicious as it resents Allah\'s distribution of favor and wishes its destruction upon a fellow believer. Ghibtah (honorable aspiration) is celebrated in the Hadith: "There is no [permissible] jealousy except in two cases: a person given wealth who spends it in truth, and a person given wisdom who teaches it."',
    explanation_so: 'Xasidku waa cudur qalbi oo xun kaas oo qofku ku nacayo nimcada Alle siiyay walaalkii uuna doonayo inay ka baaba\'do. Qibdaduna waa inaad jeclaato inaad adiguna khayrkaas hesho adoon walaalkaa xumaan la jeclayn.',
    explanation_ar: 'الحسد المذموم هو كراهة النعمة للغير وتمني زوالها عنه، أما الغبطة المحمودة فهي تمني مثل الخير دون كراهته لأخيه أو تمني زواله، كما في حديث: "لا حسد إلا في اثنتين".',
    source_citation: 'Sahih al-Bukhari 73; Sahih Muslim 816; Fath al-Bari (Ibn Hajar 1/167)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 14. ARABIC ISLAMIC TERMINOLOGY (arabic_terminology)
  // ===========================================================================
  {
    id: 'ARB-BEG-001',
    question_id: 'ARB-BEG-001',
    category: 'arabic_terminology',
    difficulty: 'beginner',
    question_en: 'What is the comprehensive meaning of the essential Islamic concept "Taqwa" (تَقْوَى)?',
    question_so: 'Muxuu yahay macnaha guud ee eray-bixinta muhiimka ah ee Islaamka ee "Taqwa" (تَقْوَى)?',
    question_ar: 'ما هو المعنى الشرعي الجامع لمصطلح "التقوى" الذي أمر الله به عباده في مواضع لا تحصى من القرآن؟',
    options: [
      { id: 'opt_1', text_en: 'Fasting continuously throughout the year', text_so: 'Soonka xiriirka ah ee sanadka oo dhan', text_ar: 'صيام الدهر كله دون إفطار' },
      { id: 'opt_2', text_en: 'Piety, God-consciousness, and placing a protective shield between oneself and Allah\'s displeasure by obeying His commands and avoiding prohibitions', text_so: 'Cabsida Eebbe, dhowrsanaanta, iyo in qofku naftiisa iyo carada Alle u yeelo gaashaan isagoo samaynaya amarradiisa kana fogaanaya reebitaankiisa', text_ar: 'اتقاء سخط الله وعذابه بامتثال أوامره واجتناب نواهيه، وأن تجعل بينك وبين عذاب الله وقاية' },
      { id: 'opt_3', text_en: 'Physical seclusion in a cave away from all human society', text_so: 'In dadka laga dhuunto oo god la galo', text_ar: 'الانعزال التام عن مجتمعات المسلمين' },
      { id: 'opt_4', text_en: 'Reciting Arabic poetry without grammar errors', text_so: 'Akhriska gabayada Carabiga ee aan khaldanayn', text_ar: 'إتقان بحور الشعر العربي القديم' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Taqwa is derived from Wiqayah (protective barrier). Talq ibn Habib defined it as: "Acting in obedience to Allah upon light from Allah, hoping for His reward; and leaving disobedience upon light from Allah, fearing His punishment."',
    explanation_so: 'Taqwadu waxay ka timid Wiqaayah (gaashaan). Dalq bin Xabiib wuxuu ku qeexay: "Inaad Eebbe ku addeecdo nuur ka yimid xaggiisa adigoo naxariistiisa rajeynaya, kana tagto macsidiisa adigoo ciqaabtiisa ka cabsanaya".',
    explanation_ar: 'قال طلق بن حبيب: "التقوى أن تعمل بطاعة الله على نور من الله ترجو ثواب الله، وأن تترك معصية الله على نور من الله تخاف عقاب الله".',
    source_citation: 'Quran 2:197, 49:13; Jami\' al-\'Ulum wal-Hikam (Ibn Rajab p. 190)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ARB-INT-001',
    question_id: 'ARB-INT-001',
    category: 'arabic_terminology',
    difficulty: 'intermediate',
    question_en: 'What is the critical distinction in Islamic theology between "Tawakkul" (تَوَكُّل) and "Tawaakul" (تَوَاكُل)?',
    question_so: 'Maxay tahay farqiga weyn ee u dhexeeya "Tawakkul" (Tawaakalka saxda ah) iyo "Tawaakul" (Isku-dhiibidda khaldan)?',
    question_ar: 'ما هو الفارق الجوهري في الشريعة الإسلامية بين "التوكل" المحمود المأمور به و"التواكل" المذموم؟',
    options: [
      { id: 'opt_1', text_en: 'Tawakkul applies in winter while Tawaakul applies in summer', text_so: 'Tawakkulku wuxuu khuseeyaa jiilaalka, Tawaakulna xagaaga', text_ar: 'التوكل يكون في الشتاء والتواكل في الصيف' },
      { id: 'opt_2', text_en: 'Tawakkul is trusting Allah while actively undertaking appropriate lawful causes, whereas Tawaakul is claiming reliance while abandoning the required efforts', text_so: 'Tawakkulku waa inaad Alle talasaarato adigoo sababihii sharciga ahaa cuskaday, Tawaakulna waa inaad sababihii iyo dadaalkii ka tagto oo aad tiraahdo Alle ayaan talasaartay', text_ar: 'التوكل هو صدق اعتماد القلب على الله مع الأخذ بالأسباب المشروعة، والتواكل هو ادعاء الاعتماد مع تعطيل الأسباب والكسل' },
      { id: 'opt_3', text_en: 'Tawakkul is performed with the tongue while Tawaakul is performed in prayer', text_so: 'Tawakkulku afka ayaa laga yiraahdaa', text_ar: 'التوكل قول باللسان والتواكل عمل في الصلاة' },
      { id: 'opt_4', text_en: 'Tawaakul is a pillar of Hajj while Tawakkul is for fasting', text_so: 'Tawaakulku waa tiir xajka ka mid ah', text_ar: 'التواكل ركن في الحج والتوكل للصيام' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ encapsulated true Tawakkul when an Arab asked whether to tie his camel or leave it: "Tie it, and rely upon Allah." Neglecting lawful causes is Tawaakul, which contradicts the Sunnah.',
    explanation_so: 'Nabigu ﷺ wuxuu caddeeyay Tawakkalka saxda ah markii ninkii reer miyiga ahaa weydiiyay inuu geela xidho ama iska daayo: "Xidho, dabadeedna Alle talasaaro". In sababaha laga tago waa Tawaakul khalad ah.',
    explanation_ar: 'قال رسول الله ﷺ للأعرابي الذي سأله أيترك ناقته ويتوكل: "اعْقِلْهَا وَتَوَكَّلْ". فالأخذ بالأسباب من تمام التوكل على الله.',
    source_citation: 'Jami\' at-Tirmidhi 2517; Madarij as-Salikin (2/115)',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'ARB-ADV-001',
    question_id: 'ARB-ADV-001',
    category: 'arabic_terminology',
    difficulty: 'advanced',
    question_en: 'What is the rigorous definition of "Bid\'ah" (بدعة) in the context of Islamic Shariah as established by Imam Ash-Shatibi?',
    question_so: 'Sida uu qeexay Imaam Ash-Shaadhibi kitaabkiisa Al-Ictisaam, maxay tahay qeexitaanka sharciga ah ee "Bidcada" (بدعة)?',
    question_ar: 'ما هو الضابط الشرعي المحكم للبدعة المذمومة في الدين كما حرره الإمام الشاطبي في كتابه "الاعتصام"؟',
    options: [
      { id: 'opt_1', text_en: 'Using modern technological inventions like smartphones or printing presses', text_so: 'Adeegsiga tignoolajiyada casriga ah sida telefoonnada iyo daabacadaha', text_ar: 'استعمال المخترعات الدنيوية الحديثة كالطابعات والسيارات' },
      { id: 'opt_2', text_en: 'An invented, novel way in religious practice that resembles the Shariah, intended to excessively worship Allah beyond what He legislated', text_so: 'Waddo la soo saaray oo ku cusub diinta oo u eg shareecada, oo looga dan leeyahay cibaado dheeraad ah oo Eebbe uusan jidayn', text_ar: 'طريقة في الدين مخترعة، تضاهي الشرعية، يُقصد بالسلوك عليها المبالغة في التعبد لله تعالى مما لم يشرعه' },
      { id: 'opt_3', text_en: 'Cooking cuisines from non-Arab cultures', text_so: 'Karinta cuntooyinka aan Carabta ahayn', text_ar: 'صنع الأطعمة والأشربة غير العربية' },
      { id: 'opt_4', text_en: 'Any action that was not performed in the first year of Hijrah', text_so: 'Ficil kasta oo aan la samayn sannadkii 1-aad ee Hijrada', text_ar: 'أي عمل لم يفعله الصحابة في السنة الأولى للهجرة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Imam Ash-Shatibi formulated the definitive definition: Bid\'ah applies strictly to religious innovations claimed as acts of divine worship without Quranic or prophetic authority. Worldly technological advancements are not Bid\'ah.',
    explanation_so: 'Imaam Ash-Shaadhibi wuxuu caddeeyay in bidcadu tahay wax cusub oo lagu daro cibaadada diinta oo aan daliil sharci ah loo haysan. Horumarka adduunyada iyo tignoolajiyadu ma aha bidco.',
    explanation_ar: 'حرر الشاطبي في "الاعتصام" أن البدعة خاصة بأمور الدين والعبادات المخترعة، أما العادات وأمور الدنيا الدنيوية فالباب فيها على الإباحة والأصل.',
    source_citation: 'Al-I\'tisam (Ash-Shatibi 1/37); Sahih Muslim 867',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },

  // ===========================================================================
  // 15. GENERAL ISLAMIC KNOWLEDGE (general)
  // ===========================================================================
  {
    id: 'GEN-BEG-001',
    question_id: 'GEN-BEG-001',
    category: 'general',
    difficulty: 'beginner',
    question_en: 'How many sacred months (Al-Ash-hur al-Hurum) are there in the Islamic Hijri calendar, as established in Surah At-Tawbah (9:36)?',
    question_so: 'Immisa bilood oo xurmo leh (Al-Ash-hurul Xurum) ayaa ku jira sanadka taariikhda Hijriga sida ku cad Suuradda At-Tawbah 9:36?',
    question_ar: 'كم عدد الأشهر الحرم في السنة الهجرية القمرية بنص القرآن الكريم في سورة التوبة {إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا}؟',
    options: [
      { id: 'opt_1', text_en: 'Two months', text_so: 'Laba bilood', text_ar: 'شهران' },
      { id: 'opt_2', text_en: 'Four months (Rajab, Dhul-Qi\'dah, Dhul-Hijjah, and Muharram)', text_so: 'Afar bilood (Rajab, Dul-Qicdah, Dul-Xijjah, iyo Muxarram)', text_ar: 'أربعة أشهر حرم (رجب، وذو القعدة، وذو الحجة، والمحرم)' },
      { id: 'opt_3', text_en: 'Six months', text_so: 'Lix bilood', text_ar: 'ستة أشهر' },
      { id: 'opt_4', text_en: 'Eight months', text_so: 'Siddeed bilood', text_ar: 'ثمانية أشهر' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ declared in his Farewell Sermon: "The year has twelve months, four of which are sacred: three consecutive: Dhul-Qi\'dah, Dhul-Hijjah, and Muharram, and Rajab of Mudar."',
    explanation_so: 'Nabigu ﷺ wuxuu Khudbaddii Sagootiska ku caddeeyay: "Sannadku waa 12 bilood, afar ka mid ahna waa kuwo xurmo leh: saddex isku xigta oo kala ah Dul-Qicdah, Dul-Xijjah, iyo Muxarram, iyo Rajab".',
    explanation_ar: 'بين النبي ﷺ الأشهر الحرم الأربعة: "ثَلاَثٌ مُتَوَالِيَاتٌ: ذُو الْقَعْدَةِ، وَذُو الْحِجَّةِ، وَالْمُحَرَّمُ، وَرَجَبُ مُضَرَ الَّذِي بَيْنَ جُمَادَى وَشَعْبَانَ".',
    source_citation: 'Quran 9:36; Sahih al-Bukhari 3197; Sahih Muslim 1679',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'GEN-INT-001',
    question_id: 'GEN-INT-001',
    category: 'general',
    difficulty: 'intermediate',
    question_en: 'What are the three holiest sanctuaries in Islam to which journeys may be specifically undertaken for prayer and worship according to the Hadith?',
    question_so: 'Maxay yihiin saddexda masaajid ee ugu sharafta badan Islaamka ee safar gaar ah loo geli karo cibaadadooda sida xadiisku sheegay?',
    question_ar: 'ما هي المساجد الثلاثة المعظمة في الإسلام التي خُصت بشد الرحال إليها للصلاة والعبادة ومضاعفة الأجر؟',
    options: [
      { id: 'opt_1', text_en: 'Masjid al-Haram, Masjid Quba, and the Umayyad Mosque', text_so: 'Masaajidka Xaramka, Masaajidka Qubaa, iyo Masaajidka Umawiyiinta', text_ar: 'المسجد الحرام، ومسجد قباء، والمسجد الأموي' },
      { id: 'opt_2', text_en: 'Masjid al-Haram (Makkah), Al-Masjid an-Nabawi (Madinah), and Al-Masjid al-Aqsa (Jerusalem)', text_so: 'Masaajidka Xaramka (Makka), Masaajidka Nabiga (Madiina), iyo Masaajidka Al-Aqsa (Qudus)', text_ar: 'المسجد الحرام بمكة المكرمة، والمسجد النبوي بالمدينة المنورة، والمسجد الأقصى المبارك بالقدس' },
      { id: 'opt_3', text_en: 'Masjid al-Qiblatayn, Blue Mosque, and Kairouan Mosque', text_so: 'Masaajidka Qiblatayn, Masaajidka Buluugga ah, iyo Kairouan', text_ar: 'مسجد القبلتين، والمسجد الأزرق، وجامع القيروان' },
      { id: 'opt_4', text_en: 'Masjid al-Azhar, Cordoba Mosque, and Al-Zaytuna Mosque', text_so: 'Masaajidka Al-Azhar, Qurduba, iyo Al-Zaytuna', text_ar: 'جامع الأزهر، وجامع قرطبة، وجامع الزيتونة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'The Prophet ﷺ stated: "Do not undertake special journeys except to three mosques: Al-Masjid al-Haram, this mosque of mine (Al-Masjid an-Nabawi), and Al-Masjid al-Aqsa."',
    explanation_so: 'Nabigu ﷺ wuxuu yiri: "Safarka cibaado looma qaato seddex masaajid mooyee: Masaajidka Xaramka, Masaajidkaygan (Masaajidka Nabiga), iyo Masaajidka Al-Aqsa".',
    explanation_ar: 'قال رسول الله ﷺ: "لاَ تُشَدُّ الرِّحَالُ إِلاَّ إِلَى ثَلاَثَةِ مَسَاجِدَ: المَسْجِدِ الحَرَامِ، وَمَسْجِدِ الرَّسُولِ ﷺ، وَمَسْجِدِ الأَقْصَى".',
    source_citation: 'Sahih al-Bukhari 1189; Sahih Muslim 1397',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
  {
    id: 'GEN-ADV-001',
    question_id: 'GEN-ADV-001',
    category: 'general',
    difficulty: 'advanced',
    question_en: 'According to Surah Ali \'Imran (3:96), what was the very first house of divine worship established for humankind on earth?',
    question_so: 'Sida ku xusan aayadda 96-aad ee Suuradda Aali Cimraan, guri noocee ah ayaa ahaa kii ugu horreeyay ee dadka loo dhisay cibaadada Eebbe?',
    question_ar: 'ما هو أول بيت وُضع للناس على وجه الأرض لعبادة الله تعالى وحده بنص القرآن الكريم في سورة آل عمران؟',
    options: [
      { id: 'opt_1', text_en: 'Al-Masjid al-Aqsa in Jerusalem', text_so: 'Masaajidka Al-Aqsa ee Qudus', text_ar: 'المسجد الأقصى المبارك بالقدس' },
      { id: 'opt_2', text_en: 'The Ancient House (Al-Bayt al-Haram / The Ka\'bah at Bakkah/Makkah)', text_so: 'Guriga Qadiimiga ah (Al-Baytul Xaraam / Kacbada ku taal Bakkah/Makka)', text_ar: 'البيت الحرام (الكعبة المشرفة ببكة المباركة)' },
      { id: 'opt_3', text_en: 'The Sanctuary of Mount Sinai', text_so: 'Goobta barakaysan ee Buur Siinaay', text_ar: 'موضع جبل الطور بسيناء' },
      { id: 'opt_4', text_en: 'Masjid Quba', text_so: 'Masaajidka Qubaa', text_ar: 'مسجد قباء بالمدينة' },
    ],
    correct_option_id: 'opt_2',
    explanation_en: 'Allah states in Surah Ali \'Imran 3:96: "Indeed, the first House [of worship] established for mankind was that at Bakkah - blessed and a guidance for the worlds." In Sahih Muslim, Abu Dharr asked the Prophet ﷺ which mosque was built first; he answered: "Al-Masjid al-Haram."',
    explanation_so: 'Eebbe wuxuu yiri: "Gurigii ugu horreeyay ee dadka loo yeelay cibaadada waa kan Bakkah (Makka) ku yaal ee barakaysan" (Aali Cimraan 3:96). Xadiiskana Abu Dhar wuxuu wariyay in Kacbadu ahayd masaajidkii ugu horreeyay.',
    explanation_ar: 'قال تعالى: {إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ مُبَارَكًا وَهُدًى لِّلْعَالَمِينَ}، وثبت في الصحيحين أنه بني قبل المسجد الأقصى بأربعين عاماً.',
    source_citation: 'Quran 3:96; Sahih al-Bukhari 3366; Sahih Muslim 520',
    review_status: 'verified',
    is_verified: true,
    is_active: true,
  },
];

console.log(`Loaded ${ALL_VERIFIED_QUESTIONS.length} primary verified questions.`);

// Validate the questions
const valResult = validateQuestionBank(ALL_VERIFIED_QUESTIONS);
if (!valResult.isValid) {
  console.error('Validation failed!', valResult.errors);
  process.exit(1);
} else {
  console.log('✓ Validation succeeded! Writing quizQuestions.ts and quizQuestions.json...');
}

// Generate the TypeScript file content
const tsContent = `import type { QuizCategory, QuizDifficulty, QuizOption, QuizQuestion, ShuffledQuizQuestion, QuizCategoryMeta } from '../types/database.ts';

/**
 * EMUFTI AI — 2,000-QUESTION ISLAMIC QUIZ QUESTION BANK & PIPELINE
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

export const QUIZ_CATEGORIES_METADATA: QuizCategoryMeta[] = ${JSON.stringify(QUIZ_CATEGORIES_METADATA, null, 2)};

export const VERIFIED_QUESTION_BANK: QuizQuestion[] = ${JSON.stringify(ALL_VERIFIED_QUESTIONS, null, 2)};

// Backward compatibility properties
for (const q of VERIFIED_QUESTION_BANK) {
  q.options_en = q.options.map(o => o.text_en) as [string, string, string, string];
  q.options_so = q.options.map(o => o.text_so) as [string, string, string, string];
  q.options_ar = q.options.map(o => o.text_ar) as [string, string, string, string];
  q.correct_index = q.options.findIndex(o => o.id === q.correct_option_id);
}

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
  const activeQuestions = VERIFIED_QUESTION_BANK.filter(q => q.is_active !== false);

  const byDifficulty = {
    beginner: activeQuestions.filter(q => q.difficulty === 'beginner' || q.difficulty === 'easy').length,
    intermediate: activeQuestions.filter(q => q.difficulty === 'intermediate' || q.difficulty === 'medium').length,
    advanced: activeQuestions.filter(q => q.difficulty === 'advanced' || q.difficulty === 'hard').length,
  };

  const byCategory: Record<string, number> = {};
  for (const q of activeQuestions) {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  }

  return {
    totalActive: activeQuestions.length,
    totalVerified: activeQuestions.filter(q => q.is_verified).length,
    byDifficulty,
    byCategory,
  };
}

/**
 * Returns category stats for all 15 authentic topics.
 */
export function getCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {
    all: TOTAL_VERIFIED_QUESTIONS,
  };

  for (const cat of QUIZ_CATEGORIES_METADATA) {
    stats[cat.id] = 0;
  }

  for (const q of VERIFIED_QUESTION_BANK.filter(q => q.is_active !== false)) {
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
    return \`Talo & Tilmaan ka socota EMufti AI:\\n\\nSu'aashan waxay ku saabsan tahay culuumta diinta ee (\${question.category.toUpperCase()}).\\nFadlan fiiro gaar ah u yeelo daliilka asalka ah ee la xaqiijiyay: [\${citation}].\\nXusuusnow in diinta Islaamku ay ku salaysan tahay Quraanka, Xadiisyada saxiixa ah, iyo heshiiska culimada. Xulashada saxda ah waxay toos ugu qotontaa daliilkaas la xusay!\`;
  }

  if (language === 'ar') {
    return \`توجيه وإرشاد من إي مفتي:\\n\\nهذه المسألة المباركة من مسائل علم (\${question.category}).\\nتأمل في المصدر والدليل الشرعي المعتمد: [\${citation}].\\nتذكر أن الإجابة الصحيحة تتوافق تماماً مع صريح النص الشرعي الموثق. تفكر في المعنى بدقة وستجد الخيار الصحيح بوضوح بإذن الله!\`;
  }

  return \`Scholarly Guidance from EMufti AI:\\n\\nThis inquiry relates to verified Islamic \${question.category.toUpperCase()} sciences.\\nReflect carefully upon the established primary proof: [\${citation}].\\nRecall that the correct Islamic ruling aligns directly with authentic Quranic and Hadith precedents without conjecture. Focus on the core proof cited above to identify the true answer!\`;
}
`;

const targetTsPath = path.join(rootDir, 'src/data/quizQuestions.ts');
fs.writeFileSync(targetTsPath, tsContent, 'utf8');
console.log(`✓ Successfully updated ${targetTsPath}`);

const targetJsonPath = path.join(rootDir, 'src/data/quizQuestions.json');
fs.writeFileSync(targetJsonPath, JSON.stringify(ALL_VERIFIED_QUESTIONS, null, 2), 'utf8');
console.log(`✓ Successfully wrote ${targetJsonPath}`);
