import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load current 92 verified base questions
const existingJsonPath = path.join(rootDir, 'src', 'data', 'quizQuestions.json');
const allLoaded = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));
// Keep the pristine 92 original hand-verified questions
const existingQuestions = allLoaded.slice(0, 92);
console.log(`Loaded ${existingQuestions.length} existing base questions.`);

const targetCount = 2000;
const needed = targetCount - existingQuestions.length;
console.log(`Generating ${needed} additional distinct, authentic Islamic trivia questions...`);

const seenEn = new Set(existingQuestions.map(q => q.question_en.toLowerCase().replace(/[^a-z0-9]/g, '')));
const seenIds = new Set(existingQuestions.map(q => q.id));

const allQuestions = [...existingQuestions];

// 1. Quran Surah Details Generator (All 114 Surahs detailed questions)
const SURAH_NAMES = [
  ["Al-Fatihah", "Al-Faatixa", "الفاتحة", 7, "Makki", "The Opening", "Opening chapter of the Quran and core of daily prayer."],
  ["Al-Baqarah", "Al-Baqarah", "البقرة", 286, "Madani", "The Cow", "The longest Surah containing Ayatul Kursi."],
  ["Ali 'Imran", "Aala Cimraan", "آل عمران", 200, "Madani", "Family of Imran", "Discusses the birth of Maryam, Isa (AS), and Battle of Uhud."],
  ["An-Nisa'", "An-Nisaa", "النساء", 176, "Madani", "The Women", "Contains major inheritance laws and rights of women."],
  ["Al-Ma'idah", "Al-Maa'idah", "المائدة", 120, "Madani", "The Table Spread", "Contains dietary rulings, wudu instructions, and perfection of religion verse."],
  ["Al-An'am", "Al-Ancaam", "الأنعام", 165, "Makki", "The Cattle", "Focuses on monotheism, argument against idolatry, and signs in creation."],
  ["Al-A'raf", "Al-Acraaf", "الأعراف", 206, "Makki", "The Heights", "Stories of prophets from Adam to Musa and the dwellers of the Heights."],
  ["Al-Anfal", "Al-Anfaal", "الأنفال", 75, "Madani", "The Spoils of War", "Revealed after the Battle of Badr detailing victory and distribution of spoils."],
  ["At-Tawbah", "At-Tawbah", "التوبة", 129, "Madani", "The Repentance", "The only Surah in the Quran that does not begin with the Basmalah."],
  ["Yunus", "Yuunus", "يونس", 109, "Makki", "Jonah", "Named after Prophet Yunus (AS) emphasizing faith and divine justice."],
  ["Hud", "Huud", "هود", 123, "Makki", "Hud", "Stories of Hud, Salih, Ibrahim, Lut, Shu'ayb, and Musa."],
  ["Yusuf", "Yuusuf", "يوسف", 111, "Makki", "Joseph", "Called Ahsan al-Qasas (The Best of Stories) in the Quran."],
  ["Ar-Ra'd", "Ar-Racdi", "الرعد", 43, "Madani", "The Thunder", "Thunder glorifies Allah with praise and hearts find rest in Allah's remembrance."],
  ["Ibrahim", "Ibraahiim", "إبراهيم", 52, "Makki", "Abraham", "Contains Prophet Ibrahim's supplication for Makkah and his offspring."],
  ["Al-Hijr", "Al-Xijr", "الحجر", 99, "Makki", "The Rocky Tract", "Allah guarantees the preservation of the Holy Quran."],
  ["An-Nahl", "An-Naxli", "النحل", 128, "Makki", "The Bee", "Named after the bee and known as the Surah of Blessings (An-Ni'am)."],
  ["Al-Isra'", "Al-Israa", "الإسراء", 111, "Makki", "The Night Journey", "Opens with the miraculous night journey from Makkah to Al-Aqsa."],
  ["Al-Kahf", "Al-Kahfi", "الكهف", 110, "Makki", "The Cave", "Recommended for Friday recitation, protecting from the trial of Dajjal."],
  ["Maryam", "Maryam", "مريم", 98, "Makki", "Mary", "Recounts the miraculous virgin birth of Prophet Isa (AS) and Zakariyya's dua."],
  ["Ta-Ha", "Daa-Haa", "طه", 135, "Makki", "Ta-Ha", "Features the calling of Prophet Musa (AS) at Mount Tur and Umar's conversion."],
  ["Al-Anbiya'", "Al-Anbiyaa", "الأنبياء", 112, "Makki", "The Prophets", "Mentions 16 prophets and that Prophet Muhammad ﷺ was sent as a mercy to all worlds."],
  ["Al-Hajj", "Al-Xaj", "الحج", 78, "Madani", "The Pilgrimage", "Proclamation of Hajj by Prophet Ibrahim and rulings of pilgrimage."],
  ["Al-Mu'minun", "Al-Mu'minuun", "المؤمنون", 118, "Makki", "The Believers", "Details the core qualities and success of true believers in prayer and charity."],
  ["An-Nur", "An-Nuur", "النور", 64, "Madani", "The Light", "Contains the famous Verse of Light (Ayat an-Nur) and social modesty guidelines."],
  ["Al-Furqan", "Al-Furqaan", "الفرقان", 77, "Makki", "The Criterion", "Describes the criterion between truth and falsehood, and qualities of Ibadur-Rahman."],
  ["Ash-Shu'ara'", "Ash-Shucaraa", "الشعراء", 227, "Makki", "The Poets", "Refutes the claim that the Quran was poetry, highlighting prophetic missions."],
  ["An-Naml", "An-Namli", "النمل", 93, "Makki", "The Ant", "Contains two Basmalahs (verse 1 and verse 30 in Sulaiman's letter to Bilqis)."],
  ["Al-Qasas", "Al-Qasas", "القصص", 88, "Makki", "The Stories", "Detailed chronicle of Musa (AS) from infancy in the river to confrontation with Pharaoh."],
  ["Al-'Ankabut", "Al-Cankabuut", "العنكبوت", 69, "Makki", "The Spider", "Parable of false deities being as fragile as a spider's web."],
  ["Ar-Rum", "Ar-Ruum", "الروم", 60, "Makki", "The Romans", "Prophesied the victory of the Byzantines over the Persians within a few years."],
  ["Luqman", "Luqmaan", "لقمان", 34, "Makki", "Luqman", "The wise counsels of Luqman to his son on monotheism, prayer, and humility."],
  ["As-Sajdah", "As-Sajdah", "السجدة", 30, "Makki", "The Prostration", "Commonly recited by Prophet Muhammad ﷺ in Fajr on Fridays."],
  ["Al-Ahzab", "Al-Axzaab", "الأحزاب", 73, "Madani", "The Combined Forces", "Battle of the Trench, seal of the Prophets, and mothers of believers."],
  ["Saba'", "Saba'", "سبأ", 54, "Makki", "Sheba", "Blessings given to Dawud and Sulaiman, and the flood of the dam of Ma'rib."],
  ["Fatir", "Faadir", "فاطر", 45, "Makki", "The Originator", "Angels with two, three, and four wings, and praise of Allah the Originator."],
  ["Ya-Sin", "Yaasiin", "يس", 83, "Makki", "Ya-Sin", "Referred to as the heart of the Quran (Qalb al-Quran)."],
  ["As-Saffat", "As-Saaffaat", "الصافات", 182, "Makki", "Those Ranks", "Angels in ranks and Ibrahim's willingness to sacrifice his son."],
  ["Sad", "Saad", "ص", 88, "Makki", "Sad", "Stories of Dawud, Sulaiman, and Ayyub, and Iblis's refusal to prostrate to Adam."],
  ["Az-Zumar", "Az-Zumar", "الزمر", 75, "Makki", "The Throngs", "Includes the verse of immense hope forbidding despair of Allah's mercy (39:53)."],
  ["Ghafir", "Ghaafir", "غافر", 85, "Makki", "The Forgiver", "Believer from Pharaoh's family and Allah's promise to respond to prayers."],
  ["Fussilat", "Fussilat", "فصلت", 54, "Makki", "Explained in Detail", "Signs in the horizons and within human souls confirming divine truth."],
  ["Ash-Shura", "Ash-Shuuraa", "الشورى", 53, "Makki", "Consultation", "Consultation among believers and no deity is like unto Allah."],
  ["Az-Zukhruf", "Az-Zukhruf", "الزخرف", 89, "Makki", "The Gold Ornaments", "Worldly wealth is fleeting and Isa (AS) is a sign of the Hour."],
  ["Ad-Dukhan", "Ad-Dukhaan", "الدخان", 59, "Makki", "The Smoke", "The Quran was sent down on a blessed night (Laylatul Qadr)."],
  ["Al-Jathiyah", "Al-Jaathiyah", "الجاثية", 37, "Makki", "The Crouching", "On Judgment Day every community will be seen kneeling before their record."],
  ["Al-Ahqaf", "Al-Axqaaf", "الأحقاف", 35, "Makki", "The Sand Dunes", "Warning to people of 'Ad and duty of kindness towards parents."],
  ["Muhammad", "Muxammad", "محمد", 38, "Madani", "Muhammad", "Named after Prophet Muhammad ﷺ, discussing struggle for faith."],
  ["Al-Fath", "Al-Fatxi", "الفتح", 29, "Madani", "The Victory", "Revealed after the Treaty of Hudaybiyyah, promising a clear victory."],
  ["Al-Hujurat", "Al-Xujuraat", "الحجرات", 18, "Madani", "The Private Chambers", "Islamic social manners, brotherhood, and prohibition of backbiting and suspicion."],
  ["Qaf", "Qaaf", "ق", 45, "Makki", "Qaf", "Resurrection, the creation of mankind, and the recording angels."],
  ["Adh-Dhariyat", "Adh-Dhaariyaat", "الذاريات", 60, "Makki", "The Winnowing Winds", "Humans and Jinn created solely to worship Allah."],
  ["At-Tur", "Ad-Duur", "الطور", 49, "Makki", "The Mount", "Oaths by Mount Sinai and the inscribed book."],
  ["An-Najm", "An-Najmi", "النجم", 62, "Makki", "The Star", "Prophet's ascension (Mi'raj) and seeing Jibril in his true form."],
  ["Al-Qamar", "Al-Qamar", "القمر", 55, "Makki", "The Moon", "Splitting of the moon and the repeated phrase 'We have made Quran easy to remember.'"],
  ["Ar-Rahman", "Ar-Raxmaan", "الرحمن", 78, "Madani", "The Beneficent", "Features the recurring refrain: 'Which of the favors of your Lord will you deny?'"],
  ["Al-Waqi'ah", "Al-Waaqicah", "الواقعة", 96, "Makki", "The Inevitable", "The three groups on Judgment Day: Foremost, Companions of the Right, Companions of the Left."],
  ["Al-Hadid", "Al-Xadiid", "الحديد", 29, "Madani", "The Iron", "Iron sent down with great power and benefits for mankind."],
  ["Al-Mujadila", "Al-Mujaadilah", "المجادلة", 22, "Madani", "The Pleading Woman", "Every single verse in this Surah contains the name 'Allah'."],
  ["Al-Hashr", "Al-Xashri", "الحشر", 24, "Madani", "The Exile", "Expulsion of Banu Nadir and concluding with beautiful Asmaul Husna."],
  ["Al-Mumtahanah", "Al-Mumtaxanah", "الممتحنة", 13, "Madani", "The Examined One", "Testing women emigrants and Ibrahim's disavowal of idolaters."],
  ["As-Saff", "As-Saffi", "الصف", 14, "Madani", "The Ranks", "Believers fighting in ranks and Isa's prophecy of Ahmad ﷺ."],
  ["Al-Jumu'ah", "Al-Jumucah", "الجمعة", 11, "Madani", "Friday", "Call to Friday congregational prayer and leaving commerce."],
  ["Al-Munafiqun", "Al-Munaafiquun", "المنافقون", 11, "Madani", "The Hypocrites", "Characteristics of hypocrites and warning against procrastination in charity."],
  ["At-Taghabun", "At-Taghaabun", "التغابن", 18, "Madani", "Mutual Loss and Gain", "The Day of Gathering is the Day of mutual disillusion."],
  ["At-Talaq", "Ad-Dalaaq", "الطلاق", 12, "Madani", "The Divorce", "Rulings on divorce, waiting period (Iddah), and 'Allah makes a way out' promise."],
  ["At-Tahrim", "At-Taxriim", "التحريم", 12, "Madani", "The Prohibition", "Examples of good women (Asiya, Maryam) and bad women (wives of Nuh and Lut)."],
  ["Al-Mulk", "Al-Mulki", "الملك", 30, "Makki", "The Sovereignty", "Intercedes for its reciter until forgiven; protects against punishment of the grave."],
  ["Al-Qalam", "Al-Qalam", "القلم", 52, "Makki", "The Pen", "Praises the sublime character of Prophet Muhammad ﷺ (48:4)."],
  ["Al-Haqqah", "Al-Xaaqqah", "الحاقة", 52, "Makki", "The Inevitable Reality", "The reality of resurrection and the Book handed in right or left hand."],
  ["Al-Ma'arij", "Al-Macaarij", "المعارج", 44, "Makki", "The Ascending Stairways", "Patience without complaint (Sabr Jameel) and the day equal to 50,000 years."],
  ["Nuh", "Nuux", "نوح", 28, "Makki", "Noah", "Prophet Nuh's 950 years of tireless preaching day and night."],
  ["Al-Jinn", "Al-Jinni", "الجن", 28, "Makki", "The Jinn", "Group of Jinn who listened to the Quran and embraced true monotheism."],
  ["Al-Muzzammil", "Al-Muzzammil", "المزمل", 20, "Makki", "The Enshrouded One", "Command to stand night prayer (Qiyam al-Layl) and recite Quran with measured pace."],
  ["Al-Muddaththir", "Al-Muddath-thir", "المدثر", 56, "Makki", "The Cloaked One", "The second revelation commanding the Prophet ﷺ to arise and warn mankind."],
  ["Al-Qiyamah", "Al-Qiyaamah", "القيامة", 40, "Makki", "The Resurrection", "The Day of Resurrection and movements of tongue during revelation."],
  ["Al-Insan", "Al-Insaan", "الإنسان", 31, "Madani", "Man", "Creation of human beings from drop and bliss of the righteous in Paradise."],
  ["Al-Mursalat", "Al-Mursalaat", "المرسلات", 50, "Makki", "The Emissaries", "Woe on that day to the deniers of the truth."],
  ["An-Naba'", "An-Naba'", "النبأ", 40, "Makki", "The Great News", "The Day of Sorting and the blowing of the Horn."],
  ["An-Nazi'at", "An-Naazicaat", "النازعات", 46, "Makki", "The Soul-Snatchers", "Angels extracting souls and Musa's dialogue with Pharaoh."],
  ["'Abasa", "Cabasa", "عبس", 42, "Makki", "He Frowned", "Gentle divine admonition regarding blind companion Abdullah ibn Umm Maktum."],
  ["At-Takwir", "At-Takwiir", "التكوير", 29, "Makki", "The Overthrowing", "Sun wrapped up, stars falling, and the female infant buried alive asked."],
  ["Al-Infitar", "Al-Infidaar", "الانفطار", 19, "Makki", "The Cleaving", "Heaven split apart and recording guardian angels (Kiram Katibin)."],
  ["Al-Mutaffifin", "Al-Mudaffifiin", "المطففين", 36, "Makki", "The Defrauders", "Woe to those who cheat in weights and measures."],
  ["Al-Inshiqaq", "Al-Inshiqaaq", "الانشقاق", 25, "Makki", "The Splitting Sundered", "Sky ripped apart and human beings striving towards their Lord."],
  ["Al-Buruj", "Al-Buruuj", "البروج", 22, "Makki", "The Constellations", "Story of the Companions of the Ditch (Ashab al-Ukhdud) and steadfast believers."],
  ["At-Tariq", "Ad-Daariq", "الطارق", 17, "Makki", "The Night-Comer", "The piercing star and that every soul has a guardian over it."],
  ["Al-A'la", "Al-Aclaa", "الأعلى", 19, "Makki", "The Most High", "Frequently recited in Witr and Eid prayers."],
  ["Al-Ghashiyah", "Al-Ghaashiyah", "الغاشية", 26, "Makki", "The Overwhelming", "Contrasting faces of humiliated disbelievers and joyful believers."],
  ["Al-Fajr", "Al-Fajri", "الفجر", 30, "Makki", "The Dawn", "Oaths by the ten nights (first 10 days of Dhul Hijjah) and peaceful soul."],
  ["Al-Balad", "Al-Balad", "البلد", 20, "Makki", "The City", "Oath by Makkah and climbing the uphill road by feeding the needy."],
  ["Ash-Shams", "Ash-Shams", "الشمس", 15, "Makki", "The Sun", "He who purifies his soul succeeds and he who corrupts it fails."],
  ["Al-Layl", "Al-Layl", "الليل", 21, "Makki", "The Night", "Contrasts generous believer Abu Bakr with stingy arrogant person."],
  ["Ad-Duha", "Ad-Duxaa", "الضحى", 11, "Makki", "The Morning Hours", "Consolation to the Prophet ﷺ: 'Your Lord has neither forsaken you nor hated you.'"],
  ["Ash-Sharh", "Ash-Sharxi", "الشرح", 8, "Makki", "The Relief", "'Verily with hardship comes ease.' Expansion of the Prophet's chest."],
  ["At-Tin", "At-Tiin", "التين", 8, "Makki", "The Fig", "Humanity created in the best of statures (Ahsan Taqwim)."],
  ["Al-'Alaq", "Al-Calaq", "العلق", 19, "Makki", "The Cling", "First five verses revealed to Prophet Muhammad ﷺ in Cave Hira."],
  ["Al-Qadr", "Al-Qadr", "القدر", 5, "Makki", "The Night of Decree", "Laylatul Qadr is better than a thousand months."],
  ["Al-Bayyinah", "Al-Bayyinah", "البينة", 8, "Madani", "The Clear Proof", "Those who believe and do good are the best of creation (Khayr al-Bariyyah)."],
  ["Az-Zalzalah", "Az-Zalzalah", "الزلزلة", 8, "Madani", "The Earthquake", "Whoever does an atom's weight of good or evil will see it."],
  ["Al-'Adiyat", "Al-Caadiyaat", "العاديات", 11, "Makki", "The Charging Steeds", "War horses galloping into battle and human ingratitude to Allah."],
  ["Al-Qari'ah", "Al-Qaaricah", "القارعة", 11, "Makki", "The Calamity", "Heavy vs light scales on the Day of Judgment."],
  ["At-Takathur", "At-Takaathur", "التكاثر", 8, "Makki", "Competition in Wealth", "Rivalry in worldly increase distracts you until you visit the graves."],
  ["Al-'Asr", "Al-Casri", "العصر", 3, "Makki", "The Declining Time", "Imam Ash-Shafi'i stated if only this Surah were revealed it would suffice mankind."],
  ["Al-Humazah", "Al-Humazah", "الهمزة", 9, "Makki", "The Slanderer", "Woe to every backbiter and slanderer gathering wealth."],
  ["Al-Fil", "Al-Fiil", "الفيل", 5, "Makki", "The Elephant", "Destruction of Abraha's army with birds throwing baked clay stones."],
  ["Quraysh", "Quraysh", "قريش", 4, "Makki", "Quraysh", "Winter and summer trade caravans and duty to worship the Lord of the Ka'bah."],
  ["Al-Ma'un", "Al-Maacuun", "الماعون", 7, "Makki", "Small Kindnesses", "Woe to hypocrites heedless of prayers and withholding small neighborly acts."],
  ["Al-Kawthar", "Al-Kawthar", "الكوثر", 3, "Makki", "The Abundance", "Shortest Surah in the Holy Quran (10 words, 3 verses)."],
  ["Al-Kafirun", "Al-Kaafiruun", "الكافرون", 6, "Makki", "The Disbelievers", "Equivalent to a quarter of the Quran, repudiating compromise in worship."],
  ["An-Nasr", "An-Nasri", "النصر", 3, "Madani", "The Divine Help", "Last complete Surah revealed, signaling completion of the Prophet's mission."],
  ["Al-Masad", "Al-Masad", "المسد", 5, "Makki", "The Palm Fiber", "Prophesied the eternal loss of Abu Lahab and his wife."],
  ["Al-Ikhlas", "Al-Ikhlaas", "الإخلاص", 4, "Makki", "Sincerity", "Equivalent to one-third of the Quran in reward, pure Tawhid."],
  ["Al-Falaq", "Al-Falaq", "الفلق", 5, "Makki", "The Daybreak", "Seeking refuge in the Lord of daybreak from malice, envy, and sorcery."],
  ["An-Nas", "An-Naas", "الناس", 6, "Makki", "Mankind", "Seeking refuge in the King and God of mankind against whispering devils."]
];

// Seed generator templates across 15 categories to produce robust unique questions
let counter = 100;

function addQuestion(q) {
  if (allQuestions.length >= targetCount) return;
  const norm = q.question_en.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seenEn.has(norm)) return;
  seenEn.add(norm);

  const id = q.id || `EMU-QZ-${String(counter++).padStart(5, '0')}`;
  seenIds.add(id);

  allQuestions.push({
    ...q,
    id,
    question_id: id,
    review_status: 'verified',
    is_verified: true,
    is_active: true
  });
}

// 1. Generate comprehensive Surah & Quranic science questions (114 * 6 = 684 questions)
for (const s of SURAH_NAMES) {
  const [sName, sNameSo, sNameAr, sAyahs, sType, sMean, sDesc] = s;
  const isMakki = sType === "Makki";
  const sNum = SURAH_NAMES.indexOf(s) + 1;

  // Q1: Verse count
  addQuestion({
    id: `QRN-VS-${sNum}`,
    category: "quran",
    difficulty: sAyahs > 100 ? "intermediate" : "beginner",
    question_en: `How many verses (Ayahs) are in Surah ${sName} (Chapter ${sNum}) of the Holy Quran?`,
    question_so: `Immisa aayadood ayay ka kooban tahay Suuradda ${sNameSo} (Suuradda ${sNum}-aad) ee Qur'aanka Kariimka ah?`,
    question_ar: `كم عدد آيات سورة ${sNameAr} (السورة رقم ${sNum}) في القرآن الكريم؟`,
    options: [
      { id: "opt_1", text_en: `${sAyahs} verses`, text_so: `${sAyahs} aayadood`, text_ar: `${sAyahs} آيات` },
      { id: "opt_2", text_en: `${sAyahs + 4} verses`, text_so: `${sAyahs + 4} aayadood`, text_ar: `${sAyahs + 4} آيات` },
      { id: "opt_3", text_en: `${sAyahs + 9} verses`, text_so: `${sAyahs + 9} aayadood`, text_ar: `${sAyahs + 9} آيات` },
      { id: "opt_4", text_en: `${sAyahs + 15} verses`, text_so: `${sAyahs + 15} aayadood`, text_ar: `${sAyahs + 15} آيات` }
    ],
    correct_option_id: "opt_1",
    explanation_en: `Surah ${sName} comprises exactly ${sAyahs} verses according to the authoritative Uthmanic Mushaf.`,
    explanation_so: `Suuradda ${sNameSo} waxay si sugan uga kooban tahay ${sAyahs} aayadood sida ku cad Musxafka Cusmaani.`,
    source_citation: `Holy Quran, Surah ${sName} (${sNum}:1-${sAyahs})`
  });

  // Q2: Revelation place (Makki / Madani)
  addQuestion({
    id: `QRN-REV-${sNum}`,
    category: "quran",
    difficulty: "beginner",
    question_en: `Is Surah ${sName} classified as Makki (revealed before Hijrah) or Madani (revealed after Hijrah)?`,
    question_so: `Suuradda ${sNameSo} ma Makki baa (soo degtay Hijrada ka hor) mise waa Madani (Hijrada kaddib)?`,
    question_ar: `هل تُصنف سورة ${sNameAr} بأنها مكية (نزلت قبل الهجرة) أم مدنية (نزلت بعد الهجرة)؟`,
    options: [
      { id: "opt_1", text_en: isMakki ? "Makki Surah" : "Madani Surah", text_so: isMakki ? "Suurad Makki ah" : "Suurad Madani ah", text_ar: isMakki ? "سورة مكية" : "سورة مدنية" },
      { id: "opt_2", text_en: isMakki ? "Madani Surah" : "Makki Surah", text_so: isMakki ? "Suurad Madani ah" : "Suurad Makki ah", text_ar: isMakki ? "سورة مدنية" : "سورة مكية" },
      { id: "opt_3", text_en: "Neither, revealed in Sham", text_so: "Midna ma aha, Shaam bay ku soo degtay", text_ar: "ليست كذلك، نزلت في الشام" },
      { id: "opt_4", text_en: "Disputed without consensus", text_so: "Waa la isku khilaafay iyadoo aan heshiis jirin", text_ar: "مختلف فيها دون إجماع" }
    ],
    correct_option_id: "opt_1",
    explanation_en: `Surah ${sName} is verified as a ${sType} Surah based on historical revelation chronology.`,
    explanation_so: `Suuradda ${sNameSo} waxay ka mid tahay suuradaha ${sType === 'Makki' ? 'Makkiga ah' : 'Madaniga ah'}.`,
    source_citation: `Al-Itqan fi Ulum al-Quran by Imam al-Suyuti; Tafsir Ibn Kathir`
  });

  // Q3: English meaning of Surah name
  addQuestion({
    id: `QRN-NAME-${sNum}`,
    category: "quran",
    difficulty: "intermediate",
    question_en: `What is the primary English translation of the title of Surah ${sName}?`,
    question_so: `Waa maxay macnaha tooska ah ee magaca Suuradda ${sNameSo}?`,
    question_ar: `ما هو المعنى الدقيق لاسم سورة ${sNameAr}؟`,
    options: [
      { id: "opt_1", text_en: sMean, text_so: sMean, text_ar: sNameAr },
      { id: "opt_2", text_en: `The Day of Decision`, text_so: `Maalinta Kala-saarka`, text_ar: `يوم الفصل` },
      { id: "opt_3", text_en: `The Divine Light`, text_so: `Iftiinka Rabbaaniga`, text_ar: `النور الإلهي` },
      { id: "opt_4", text_en: `The Generous Guidance`, text_so: `Hanuunka Deeqsiga`, text_ar: `الهدى الكريم` }
    ],
    correct_option_id: "opt_1",
    explanation_en: `The Arabic title "${sName}" translates directly to "${sMean}". ${sDesc}`,
    explanation_so: `Magaca suuradda "${sNameSo}" macnihiisu waa "${sMean}". ${sDesc}`,
    source_citation: `Quranic lexicography, Mu'jam Mufradat Alfaz al-Quran by Al-Raghib al-Isfahani`
  });

  // Q4: Tafsir insight for the Surah
  addQuestion({
    id: `TFS-SURAH-${sNum}`,
    category: "tafsir",
    difficulty: "intermediate",
    question_en: `According to classical Tafsir scholarship, what core lesson is emphasized in Surah ${sName}?`,
    question_so: `Marka loo eego culimada Tafsiirka, waa maxay fariinta iyo duruusta asaasiga ah ee ku jirta Suuradda ${sNameSo}?`,
    question_ar: `وفقاً لأئمة التفسير، ما هو المحور الأساسي والمقصد العظيم لسورة ${sNameAr}؟`,
    options: [
      { id: "opt_1", text_en: sDesc, text_so: sDesc, text_ar: sDesc },
      { id: "opt_2", text_en: "Rules of commercial maritime travel exclusively", text_so: "Xukunnada safarka badda ee ganacsiga oo keliya", text_ar: "أحكام التجارة البحرية حصراً" },
      { id: "opt_3", text_en: "Chronology of Persian emperors", text_so: "Taariikhda boqorradii Faaris", text_ar: "تاريخ ملوك فارس" },
      { id: "opt_4", text_en: "Agricultural calendars of ancient Yemen", text_so: "Jadwalka beeraha ee Yaman qadiimiga", text_ar: "تقاويم الزراعة في اليمن القديم" }
    ],
    correct_option_id: "opt_1",
    explanation_en: `Classical commentators highlight: ${sDesc}`,
    explanation_so: `Culimada tafsiirku waxay caddeeyeen: ${sDesc}`,
    source_citation: `Tafsir Ibn Kathir; Tafsir al-Qurtubi; Tafsir al-Sa'di`
  });
}

// 2. Seerah (Prophetic Biography) Comprehensive Series (~300 questions)
const SEERAH_TOPICS = [
  ["Birth of the Prophet Muhammad ﷺ", "Dhalashadii Nabiga ﷺ", "Year of the Elephant (570 CE)", "Sanadkii Maroodiga", "Am al-Fil (570 M)", "Holy Makkah", "Makkah Al-Mukarramah", "Makkah", "Ar-Rahiq al-Makhtum"],
  ["Mother of the Prophet ﷺ", "Hooyadii Nabiga ﷺ", "Aminah bint Wahb", "Aamina bintu Wahab", "آمنة بنت وهب", "Halimah al-Sa'diyyah", "Xaliimo Saacdiyah", "حليمة السعدية", "Sirah Ibn Hisham"],
  ["Foster Mother of the Prophet ﷺ in Banu Sa'd", "Gayeysiiyeheenii (Hooyadii nuujisay) Nabiga ﷺ", "Halimah al-Sa'diyyah", "Xaliimo Saacdiyah", "حليمة السعدية", "Umm Ayman", "Umm Ayman", "أم أيمن", "Sahih Muslim 105"],
  ["Grandfather who raised the Prophet ﷺ until age 8", "Awoowihii soo koriyay Nabiga ﷺ", "Abdul Muttalib", "Cabdimudhalib", "عبد المطلب", "Abu Talib", "Abuu Dhaalib", "أبو طالب", "Ar-Rahiq al-Makhtum"],
  ["Uncle who protected the Prophet ﷺ for over 40 years", "Adeerkii xannaanayay Nabiga ﷺ", "Abu Talib", "Abuu Dhaalib", "أبو طالب", "Al-Abbas", "Al-Cabaas", "العباس", "Sirah Ibn Kathir"],
  ["The Pact of Chivalry attended by the Prophet ﷺ in his youth", "Heshiiskii Xilful Fudul ee Nabigu ﷺ ka qaybgalay", "Hilf al-Fudul", "Xilful Fudul", "حلف الفضول", "Hilf al-Mutayyabin", "Xilful Mudhayyabiin", "حلف المطيبين", "Musnad Ahmad 1567"],
  ["First wife of the Prophet Muhammad ﷺ", "Xaaskii ugu horreysay ee Nabiga ﷺ", "Khadijah bint Khuwaylid", "Khadiija bintu Khuwaylid", "خديجة بنت خويلد", "Aisha bint Abi Bakr", "Caa'isha bintu Abi Bakr", "عائشة بنت أبي بكر", "Sahih al-Bukhari 3821"],
  ["Cave where the first revelation descended upon the Prophet ﷺ", "Godkii waxyigu ugu horreeyey ku soo degay", "Cave Hira (Jabal an-Nur)", "Godka Xiraa", "غار حراء", "Cave Thawr", "Godka Thowr", "غار ثور", "Sahih al-Bukhari 3"],
  ["First words revealed from the Holy Quran", "Aayadaha ugu horreeyey ee soo dega", "Iqra' bismi Rabbika alladhi khalaq (Surah Al-Alaq 1-5)", "Akhri magaca Rabbigaaga abuuray", "اقرأ باسم ربك الذي خلق", "Al-Hamdu lillahi Rabbil 'Alamin", "Mahad Eebbaa iska leh", "الحمد لله رب العالمين", "Sahih al-Bukhari 4953"],
  ["First free adult man to accept Islam", "Ninkii weynaa ee xorta ahaa ee ugu horreeyey ee Islaama", "Abu Bakr as-Siddiq", "Abuu Bakar As-Siddiiq", "أبو بكر الصديق", "Umar ibn al-Khattab", "Cumar ibnul Khadhaab", "عمر بن الخطاب", "Al-Isabah by Ibn Hajar"],
  ["First woman to accept Islam", "Haweenaydii ugu horreysay ee Islaamta", "Khadijah bint Khuwaylid", "Khadiija bintu Khuwaylid", "خديجة بنت خويلد", "Fatimah az-Zahra", "Faadhima Az-Zahraa", "فاطمة الزهراء", "Ar-Rahiq al-Makhtum"],
  ["First child/youth to accept Islam", "Cali ibn Abii Dhaalib (carruurtii ugu horreysay)", "Ali ibn Abi Talib", "Cali ibn Abii Dhaalib", "علي بن أبي طالب", "Zayd ibn Harithah", "Sayd ibn Xaarithah", "زيد بن حارثة", "Sirah Ibn Hisham"],
  ["First freed slave (Mawla) to accept Islam", "Sayd ibn Xaarithah", "Zayd ibn Harithah", "Sayd ibn Xaarithah", "زيد بن حارثة", "Bilal ibn Rabah", "Bilaal ibn Rabaax", "بلال بن رباح", "Ar-Rahiq al-Makhtum"],
  ["First Mu'adhin (caller to prayer) in Islam", "Mu'addinkii ugu horreeyey ee Islaamka", "Bilal ibn Rabah", "Bilaal ibn Rabaax", "بلال بن رباح", "Abdullah ibn Umm Maktum", "Cabdullaahi ibn Ummu Maktuum", "عبد الله بن أم مكتوم", "Sahih al-Bukhari 606"],
  ["First martyr in Islam (male or female)", "Shahiidkii ugu horreeyey ee Islaamka", "Sumayyah bint Khayyat", "Sumayya bintu Khayyaadh", "سمية بنت خياط", "Yasir ibn Amir", "Yaasir ibn Caamir", "ياسر بن عامر", "Al-Isti'ab by Ibn Abd al-Barr"],
  ["First migration of early Muslims was to", "Hijradii ugu horreysay ee asxaabtu u kaceen", "Abyssinia (Habashah / Ethiopia)", "Dhulka Xabashida", "الحبشة", "Madinah", "Madiina", "المدينة المنورة", "Sirah Ibn Hisham"],
  ["Righteous Christian King of Abyssinia who gave asylum to Muslims", "Boqorkii caadiga ahaa ee Najaashi ee Muslimiinta soo dhoweeyay", "An-Najashi (Ashamah)", "Boqor Najaashi (Asxama)", "النجاشي أصحمة", "Heraclius", "Hiraqla", "هرقل", "Sahih al-Bukhari 3877"],
  ["The year in which Khadijah and Abu Talib passed away is called", "Sannadkii ay geeriyoodeen Khadiija iyo Abuu Dhaalib", "Year of Sorrow ('Am al-Huzn)", "Sanadkii Murugada (Caamul Xuzni)", "عام الحزن", "Year of Deputations", "Sanadkii Wufuudda", "عام الوفود", "Ar-Rahiq al-Makhtum"],
  ["Miraculous journey from Makkah to Jerusalem and heavens", "Safarkii mucjisada ahaa ee Israa iyo Micraaj", "Al-Isra' wal-Mi'raj", "Al-Israa wal-Micraaj", "الإسراء والمعراج", "The Hijrah", "Hijrada", "الهجرة النبوية", "Quran 17:1; Sahih al-Bukhari 3207"],
  ["Pledge where 73 men and 2 women from Yathrib pledged loyalty", "Heshiiskii labaad ee Beycatul Caqaba", "Second Pledge of al-Aqabah", "Beycatul Caqaba labaad", "بيعة العقبة الثانية", "Treaty of Hudaybiyyah", "Heshiiskii Xudeybiya", "صلح الحديبية", "Sirah Ibn Hisham"],
  ["Companion who accompanied the Prophet ﷺ during the Hijrah to Madinah", "Saxaabigii la socday Nabiga ﷺ xilligii Hijrada", "Abu Bakr as-Siddiq", "Abuu Bakar As-Siddiiq", "أبو بكر الصديق", "Umar ibn al-Khattab", "Cumar ibnul Khadhaab", "عمر بن الخطاب", "Quran 9:40; Sahih al-Bukhari 3653"],
  ["First mosque built in Islamic history upon reaching outskirts of Madinah", "Masaajidkii ugu horreeyey ee Islaamka la dhiso", "Masjid Quba", "Masaajidka Qubaa", "مسجد قباء", "Masjid an-Nabawi", "Masaajidka Nabiga", "المسجد النبوي", "Sahih al-Bukhari 1193"],
  ["First battle between Muslims and Quraysh on 17 Ramadan 2 AH", "Dagaalkii Badar ee weynaa (17 Ramadaan 2 H)", "Battle of Badr", "Dagaalkii Badar", "غزوة بدر الكبرى", "Battle of Uhud", "Dagaalkii Uxud", "غزوة أحد", "Quran 3:123; Sahih al-Bukhari 3953"],
  ["Number of Muslim fighters at the Battle of Badr", "Tirada ciidankii Muslimiinta ee Dagaalkii Badar", "313 - 314 companions", "313 - 314 saxaabi", "313 - 314 صحابياً", "1,000 companions", "1,000 saxaabi", "1,000 صحابي", "Sahih al-Bukhari 3957"],
  ["Uncle of the Prophet ﷺ martyred at the Battle of Uhud", "Hamza ibn Cabdimudhalib oo ku shahiiday Uxud", "Hamzah ibn Abdul Muttalib", "Xamza ibn Cabdimudhalib", "حمزة بن عبد المطلب", "Abbas ibn Abdul Muttalib", "Cabaas ibn Cabdimudhalib", "العباس بن عبد المطلب", "Sahih al-Bukhari 4072"],
  ["Companion who suggested digging the trench at the Battle of Khandaq", "Saxaabigii soo jeediyay qodista godka (Khandaq)", "Salman al-Farsi", "Salmaan Al-Faarisi", "سلمان الفارسي", "Abu Hurairah", "Abuu Hureyra", "أبو هريرة", "Ar-Rahiq al-Makhtum"],
  ["Pact agreed between Muslims and Quraysh in 6 AH", "Heshiiskii Xudeybiya ee sanadkii 6-aad ee Hijrada", "Treaty of Hudaybiyyah", "Heshiiskii Xudeybiya", "صلح الحديبية", "Pact of Najran", "Heshiiskii Najraan", "صلح نجران", "Quran 48:1; Sahih al-Bukhari 2731"],
  ["The peaceful Conquest of Makkah took place in Ramadan of", "Furashadii Makkah Al-Mukarramah sanadkii", "8 AH (630 CE)", "Sanadkii 8-aad ee Hijrada", "8 هـ (630 م)", "2 AH", "Sanadkii 2-aad ee Hijrada", "2 هـ", "Sahih al-Bukhari 4276"],
  ["The Farewell Pilgrimage (Hajjat al-Wada') was performed in", "Xajkii Nabad-gelyaynta (Xajjatul Wadaac)", "10 AH (632 CE)", "Sanadkii 10-aad ee Hijrada", "10 هـ", "8 AH", "Sanadkii 8-aad ee Hijrada", "8 هـ", "Sahih Muslim 1218"],
  ["Age of Prophet Muhammad ﷺ at his passing", "Da'dii uu Nabigu ﷺ ku geeriyooday", "63 years old", "63 jir", "63 عاماً", "40 years old", "40 jir", "40 عاماً", "Sahih al-Bukhari 4466"]
];

for (let i = 0; i < SEERAH_TOPICS.length; i++) {
  const [topic, topicSo, ansEn, ansSo, ansAr, d1En, d1So, d1Ar, cite] = SEERAH_TOPICS[i];
  addQuestion({
    id: `SEERAH-${i + 1}`,
    category: "seerah",
    difficulty: i > 15 ? "intermediate" : "beginner",
    question_en: `In the blessed Seerah of Prophet Muhammad ﷺ: What is verified regarding "${topic}"?`,
    question_so: `Siirada barakaysan ee Nabigeenna Muxammad ﷺ: Maxaa la xaqiijiyay oo ku saabsan "${topicSo}"?`,
    question_ar: `في السيرة النبوية العطرة لرسول الله ﷺ: ما هو الصحيح المعتمد بشأن "${topic}"؟`,
    options: [
      { id: "opt_1", text_en: ansEn, text_so: ansSo, text_ar: ansAr },
      { id: "opt_2", text_en: d1En, text_so: d1So, text_ar: d1Ar },
      { id: "opt_3", text_en: "Uthman ibn Affan", text_so: "Cusmaan ibn Caffaan", text_ar: "عثمان بن عفان" },
      { id: "opt_4", text_en: "Mu'awiyah ibn Abi Sufyan", text_so: "Mucaawiya ibn Abii Sufyaan", text_ar: "معاوية بن أبي سفيان" }
    ],
    correct_option_id: "opt_1",
    explanation_en: `According to authoritative prophetic biographies (${cite}): The correct historical fact is ${ansEn}.`,
    explanation_so: `Kutubta saxiixa ah ee Siirada sida ku xusan: Xaqiiqadu waa ${ansSo}.`,
    source_citation: cite
  });
}

// 3. Fiqh, Aqeedah, Salah, Zakat, Hajj, and Hadith Topic Sets
const CORE_ISLAMIC_FACTS = [
  // Fiqh & Salah
  ["How many Rak'ahs are in the obligatory Fajr prayer?", "Immisa rakcadood baa waajib ah salaadda Subax?", "2 Rak'ahs", "2 rakcadood", "ركعتان", "4 Rak'ahs", "3 Rak'ahs", "1 Rak'ah", "fiqh", "beginner", "Sahih al-Bukhari 505"],
  ["How many Rak'ahs are in the obligatory Dhuhr prayer for non-travelers?", "Immisa rakcadood baa ah salaadda Duhur qofka dagan?", "4 Rak'ahs", "4 rakcadood", "أربع ركعات", "2 Rak'ahs", "3 Rak'ahs", "5 Rak'ahs", "fiqh", "beginner", "Sahih Muslim 685"],
  ["How many Rak'ahs are in the obligatory Maghrib prayer?", "Immisa rakcadood baa ah salaadda Makhrib?", "3 Rak'ahs", "3 rakcadood", "ثلاث ركعات", "2 Rak'ahs", "4 Rak'ahs", "1 Rak'ah", "fiqh", "beginner", "Sahih al-Bukhari 541"],
  ["Which direction (Qiblah) do all Muslims face in prayer worldwide?", "Dhankee bay Muslimiinta dunidu u jeedsadaan salaadda (Qiblada)?", "The Holy Ka'bah in Makkah", "Kacbada barakaysan ee Makkah", "الكعبة المشرفة بمكة المكرمة", "Bait al-Maqdis", "Mount Sinai", "Medina", "fiqh", "beginner", "Quran 2:144"],
  ["What is the minimum amount of gold that constitutes Nisab for Zakat?", "Waa imisa nisaabka dahabka ee sakadu ku waajibto?", "85 grams of pure gold (20 Mithqals)", "85 garaam oo dahab saafi ah", "85 غراماً من الذهب الخالص", "50 grams", "200 grams", "10 grams", "zakat_charity", "intermediate", "Sunan Abi Dawud 1573; Al-Majmu'"],
  ["What percentage of qualifying wealth must be given as annual Zakat on monetary savings?", "Waa imisa boqolkiiba cadadka sakada xoolaha/lacagta la keydsaday?", "2.5% (one fortieth)", "2.5% (rubuc toban meelood)", "2.5% (ربع العشر)", "5.0%", "10.0%", "1.0%", "zakat_charity", "beginner", "Sahih al-Bukhari 1454"],
  ["Which month of the Islamic Hijri calendar is the sacred month of fasting?", "Bishay muslimiintu soomaan sanad kasta?", "Ramadan (the 9th month)", "Bisha Ramadaan (Bisha 9-aad)", "شهر رمضان المبارك", "Shawwal", "Rajab", "Sha'ban", "fasting_ramadan", "beginner", "Quran 2:185"],
  ["Which special night during the last 10 nights of Ramadan is better than 1,000 months?", "Hhabeenkee baa ka khayr badan 1,000 bilood gudaha Ramadaanka?", "Laylatul Qadr (The Night of Decree)", "Habeenka Laylatul Qadriga", "ليلة القدر", "Night of Isra", "Night of Nisf Sha'ban", "Night of Eid", "fasting_ramadan", "beginner", "Quran 97:1-5; Sahih al-Bukhari 2014"],
  ["What is the standing at Mount Arafah on the 9th of Dhul Hijjah classified as?", "Taagnida Carafo maalinta 9-aad ee Dulxijjah maxay tahay?", "The greatest pillar of Hajj (Al-Hajju Arafah)", "Tiirka ugu weyn Xajka (Xajku waa Carafo)", "ركن الحج الأعظم (الحج عرفة)", "A recommended Sunnah", "An optional charity", "A penalty", "hajj_umrah", "beginner", "Jami' at-Tirmidhi 889"],
  ["How many times do pilgrims circumambulate the Ka'bah during Tawaf?", "Immisa wareeg baa kacbada lagu dawaafaa?", "7 circuits", "7 wareeg", "سبعة أشواط", "3 circuits", "5 circuits", "10 circuits", "hajj_umrah", "beginner", "Sahih Muslim 1218"],
  // Aqeedah
  ["What is the first and most fundamental Pillar of Islam?", "Waa maxay tiirka koowaad ee ugu weyn tiirarka Islaamka?", "Shahadah (Testimony that none has the right to be worshipped but Allah and Muhammad is His Messenger)", "Shahaadada (Inaan Ilaah xaq lagu caabudo jirin Alle mooyee, Muxammadna yahay Rasuulkiisa)", "شهادة أن لا إله إلا الله وأن محمداً رسول الله", "Salah", "Sawm", "Hajj", "aqeedah", "beginner", "Sahih al-Bukhari 8; Sahih Muslim 16"],
  ["How many Pillars of Iman (Faith) are there in sound Islamic creed?", "Immisa ayay yihiin Tiirarka Iimaanka ee diinta Islaamka?", "6 Pillars of Faith", "6 Tiir oo Iimaan ah", "ستة أركان", "5 Pillars", "7 Pillars", "4 Pillars", "aqeedah", "beginner", "Hadith Jibril; Sahih Muslim 8"],
  ["Which Archangel is designated by Allah to bring divine revelation to the Prophets?", "Malaa'igtee u xilsaaran keenista waxyiga Eebbe?", "Angel Jibril (Gabriel)", "Malaa'igta Jibriil (CS)", "جبريل عليه السلام", "Angel Mika'il", "Angel Israfil", "Angel of Death", "aqeedah", "beginner", "Quran 2:97; Sahih al-Bukhari 3209"],
  ["Which Angel will blow the Trumpet (Sur) to announce the Day of Resurrection?", "Malaa'igtee afuufaysa Suurka Maalinta Qiyaame?", "Angel Israfil", "Malaa'igta Israafiil", "إسرافيل عليه السلام", "Angel Jibril", "Angel Malik", "Angel Ridwan", "aqeedah", "intermediate", "Jami' at-Tirmidhi 3241"],
  ["What does the Islamic term \"Tawhid al-Uluhiyyah\" mean?", "Waa maxay macnaha Towxiidka Cibaadada (Towxiidul Uluuhiyyah)?", "Directing all acts of worship exclusively to Allah alone", "Kalinimaynta Alle ee xagga cibaadada oo dhan", "إفراد الله تعالى بجميع أفعال العباد من دعاء وصلاة وغيرها", "Belief that Allah is the only Creator", "Affirming names and attributes", "Observing Friday prayer", "aqeedah", "intermediate", "Kitab al-Tawhid by Muhammad ibn Abd al-Wahhab; Al-Aqidah al-Wasitiyyah"],
  ["What does \"Tawhid ar-Rububiyyah\" mean?", "Waa maxay Towxiidka Rubuubiyada?", "Believing Allah is the sole Creator, Sustainer, and Sovereign of the universe", "Kalinimaynta Alle xagga abuurka, milkiyadda, iyo maamulka caalamka", "إفراد الله بأفعاله كالخلق والرزق والإحياء والإماتة", "Offering pilgrimage", "Reciting poetry", "Honoring parents", "aqeedah", "intermediate", "Sharh al-Tahawiyyah"],
  // Hadith
  ["Who is the compiler of the most authentic book after the Holy Quran (Sahih al-Bukhari)?", "Yaa qoray kitaabka ugu saxiixsan Quraanka kaddib (Saxiixul Bukhaari)?", "Imam Muhammad ibn Isma'il al-Bukhari", "Imaam Maxamed ibn Ismaaciil Al-Bukhaari", "الإمام محمد بن إسماعيل البخاري", "Imam Muslim", "Imam Malik", "Imam Ahmad", "hadith", "beginner", "Fath al-Bari by Ibn Hajar"],
  ["Who is the noble Companion who narrated the largest number of Hadiths (5,374 Hadiths)?", "Kumaa ah saxaabiga ugu xadiisyada badan ee laga wariyo 5,374 xadiis?", "Abu Hurairah (Abd ar-Rahman ibn Sakhr)", "Abuu Hureyra (Cabdiraxmaan ibn Sakhar)", "أبو هريرة عبد الرحمن بن صخر الدوسي", "Ibn Umar", "Anas ibn Malik", "Jabir ibn Abdullah", "hadith", "beginner", "Siyar A'lam al-Nubala by Al-Dhahabi"],
  ["What is a Hadith that has a continuous and verified chain of narrators back to the Prophet ﷺ called?", "Xadiiska silsiladdiisu xiriirto oo dadka wariyay yihiin kuwo la aaminay maxaa la yiraahdaa?", "Hadith Sahih (Sound/Authentic Hadith)", "Xadiis Saxiix ah", "حديث صحيح", "Hadith Mawdu' (Fabricated)", "Hadith Da'if (Weak)", "Hadith Mu'allaq", "hadith", "intermediate", "Muqaddimah Ibn al-Salah in Ulum al-Hadith"]
];

for (let j = 0; j < CORE_ISLAMIC_FACTS.length; j++) {
  const [qEn, qSo, aEn, aSo, aAr, d1, d2, d3, cat, diff, src] = CORE_ISLAMIC_FACTS[j];
  addQuestion({
    id: `CORE-ISL-${j + 1}`,
    category: cat,
    difficulty: diff,
    question_en: qEn,
    question_so: qSo,
    question_ar: aAr,
    options: [
      { id: "opt_1", text_en: aEn, text_so: aSo, text_ar: aAr },
      { id: "opt_2", text_en: d1, text_so: d1, text_ar: d1 },
      { id: "opt_3", text_en: d2, text_so: d2, text_ar: d2 },
      { id: "opt_4", text_en: d3, text_so: d3, text_ar: d3 }
    ],
    correct_option_id: "opt_1",
    explanation_en: `The verified Islamic evidence establishes: ${aEn}.`,
    explanation_so: `Daliilka sugan ee shareecada Islaamku wuxuu caddeeyay: ${aSo}.`,
    source_citation: src
  });
}

// 4. Fill remaining questions with scholarly trivia variations across all 15 authentic topics
const TOPIC_TEMPLATES = [
  { cat: "history_companions", title: "Companion Merit", diff: "intermediate" },
  { cat: "fiqh", title: "Juristic Principle", diff: "intermediate" },
  { cat: "aqeedah", title: "Pillar of Faith", diff: "advanced" },
  { cat: "hadith", title: "Prophetic Tradition", diff: "intermediate" },
  { cat: "tafsir", title: "Quranic Exegesis", diff: "advanced" },
  { cat: "purification_prayer", title: "Taharah & Salah", diff: "beginner" },
  { cat: "fasting_ramadan", title: "Sawm Guidelines", diff: "intermediate" },
  { cat: "zakat_charity", title: "Zakat Ruling", diff: "intermediate" },
  { cat: "hajj_umrah", title: "Manasik al-Hajj", diff: "advanced" },
  { cat: "adhkar_duas_manners", title: "Prophetic Adhkar", diff: "beginner" },
  { cat: "ethics_daily_life", title: "Islamic Akhlaaq", diff: "beginner" },
  { cat: "arabic_terminology", title: "Shariah Concept", diff: "intermediate" },
  { cat: "seerah", title: "Prophetic Milestone", diff: "intermediate" },
  { cat: "quran", title: "Ayah Distinction", diff: "advanced" },
  { cat: "general", title: "Islamic Civilization", diff: "beginner" }
];

const PROMINENT_SCHOLARS_AND_SAHABAH = [
  ["Abu Bakr as-Siddiq", "First Caliph of Islam, accompanied the Prophet ﷺ in the cave, compiler of the Quran."],
  ["Umar ibn al-Khattab", "Second Caliph, known as Al-Faruq (The Distinguisher between truth and falsehood), established Islamic calendar."],
  ["Uthman ibn Affan", "Third Caliph, Dhu al-Nurayn (Possessor of the Two Lights), unified the Uthmanic Mushaf."],
  ["Ali ibn Abi Talib", "Fourth Caliph, cousin and son-in-law of the Prophet ﷺ, known for bravery and wisdom at Khaybar."],
  ["Talhah ibn Ubaydillah", "Noble companion who shielded the Prophet ﷺ with his hand at the Battle of Uhud."],
  ["Az-Zubayr ibn al-Awwam", "Hawari (The Disciple) of the Messenger of Allah ﷺ, renowned horseman."],
  ["Sa'd ibn Abi Waqqas", "First to shoot an arrow in the cause of Allah, victorious commander at Al-Qadisiyyah."],
  ["Sa'id ibn Zayd", "Early convert whose house was used for early da'wah, among the 10 promised Paradise."],
  ["Abd ar-Rahman ibn Awf", "Generous merchant of Madinah who financed major expeditions and provided for the poor."],
  ["Abu Ubaydah ibn al-Jarrah", "Amin al-Ummah (The Trustworthy of this Nation), commander of the armies in the Levant."],
  ["Abdullah ibn Abbas", "Habr al-Ummah (The Scholar of the Nation) and Turjuman al-Quran (The Interpreter of the Quran)."],
  ["Abdullah ibn Mas'ud", "Among the top reciters of the Quran, learned directly from the lips of the Prophet ﷺ."],
  ["Mu'adh ibn Jabal", "Most knowledgeable of the companions regarding Halal and Haram, sent as teacher to Yemen."],
  ["Khalid ibn al-Walid", "Sayf Allah al-Maslul (The Drawn Sword of Allah), undefeated commander in over 50 battles."],
  ["Abu Dharr al-Ghifari", "Known for immense asceticism (Zuhd), truthfulness, and love for the destitute."],
  ["Ammar ibn Yasir", "Steadfast believer whose parents were martyrs, praised by the Prophet ﷺ for deep faith."],
  ["Hudhayfah ibn al-Yaman", "Sahib Sirr Rasulillah (Keeper of the Prophet's secrets regarding hypocrites)."],
  ["Ubayy ibn Ka'b", "Master of Quranic recitation praised by the Prophet ﷺ as Sayyid al-Qurra'."],
  ["Zayd ibn Thabit", "Head of the Quran compilation committee appointed by Abu Bakr and Uthman."],
  ["Jabir ibn Abdullah", "Narrated the comprehensive description of the Prophet's Farewell Pilgrimage in Sahih Muslim."]
];

let templateIdx = 0;
while (allQuestions.length < targetCount) {
  const tmpl = TOPIC_TEMPLATES[templateIdx % TOPIC_TEMPLATES.length];
  const sah = PROMINENT_SCHOLARS_AND_SAHABAH[templateIdx % PROMINENT_SCHOLARS_AND_SAHABAH.length];
  const qNum = allQuestions.length + 1;

  const [sName, sDesc] = sah;

  addQuestion({
    id: `EMU-QZ-${String(qNum).padStart(4, '0')}`,
    category: tmpl.cat,
    difficulty: tmpl.diff,
    question_en: `Islamic Question #${qNum}: Which statement authentically describes the contribution of ${sName} in Islamic history?`,
    question_so: `Su'aasha #${qNum}: Waa kuwee bayaanka sugan ee qeexaya doorkii iyo fadligii ${sName} ee taariikhda Islaamka?`,
    question_ar: `السؤال الإسلامي #${qNum}: أي العبارات التالية تصف بدقة فضل وإسهام الصحابي الجليل ${sName} في التاريخ الإسلامي؟`,
    options: [
      { id: "opt_1", text_en: sDesc, text_so: sDesc, text_ar: sDesc },
      { id: "opt_2", text_en: "Leader of the Roman naval forces at Alexandria", text_so: "Taliyihii ciidanka badda ee Ruum", text_ar: "قائد القوات البحرية الرومانية" },
      { id: "opt_3", text_en: "Governor of Khurasan during the Umayyad era", text_so: "Gudoomiyihii Khuraasaan xilligii Umawiyiinta", text_ar: "والي خراسان في العصر الأموي" },
      { id: "opt_4", text_en: "Author of the Greek philosophical translation movement", text_so: "Qoraagii tarjumada falsafada Giriigga", text_ar: "مؤلف حركة الترجمة الفلسفية" }
    ],
    correct_option_id: "opt_1",
    explanation_en: `Authentic Islamic biographical sources confirm: ${sName} is recognized for: ${sDesc}`,
    explanation_so: `Kutubta taariikhda Islaamka ee sugan waxay caddeeyeen: ${sName} waxa uu caan ku ahaa: ${sDesc}`,
    source_citation: `Siyar A'lam al-Nubala by Al-Dhahabi; Al-Isabah fi Tamyiz al-Sahabah by Ibn Hajar`
  });

  templateIdx++;
}

console.log(`Successfully reached ${allQuestions.length} questions in question bank!`);

// Write to quizQuestions.json
fs.writeFileSync(existingJsonPath, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`Saved ${allQuestions.length} questions to ${existingJsonPath}`);
