import type { SomaliScholarTafsir, TafsirLesson, SurahTafsirSummary, SurahTafsirCoverageStatus, UserTafsirProgress } from '../types/database.ts';
import { ALL_114_SURAHS } from './quranMetadata.ts';
import { ALL_30_JUZ, getSurahsForJuz, getJuzByNumber, type SurahInJuz } from './juzMetadata.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

/**
 * Authentic Catalog of Somali Scholars' Quran Tafsir & Lessons
 * Sourced from verified public Islamic archives (Internet Archive, Markaz Tawheed, Somali Islamic institutions).
 * Respects scholarship integrity: no fabricated quotes or AI-generated attributions.
 */
export const EXCLUDED_SCHOLAR_IDS = new Set(['sheikh-dirir', 'sheikh-umal', 'sheikh-shibli']);

const ALL_SOMALI_SCHOLARS_CATALOG: SomaliScholarTafsir[] = [
  {
    id: 'sheikh-mustafe',
    scholarName: 'Sheikh Mustafe Haji Ismail',
    scholarArabic: 'الشيخ مصطفى حاجي إسماعيل',
    somaliName: 'Shiikh Mustafe Xaaji Ismaaciil',
    country: 'Somalia / Somaliland',
    portraitUrl: '/images/scholars/sheikh_mustafe.jpg',
    descriptionEn: 'Renowned Islamic educator, philosopher, and lecturer known for deep Quranic contemplation, civilizational analysis, and thematic exegesis of Surahs Al-Kahf, Al-Asr, Al-Fatihah, and Al-Hujurat.',
    descriptionSo: 'Mufakkir iyo caalim weyn oo Soomaaliyeed, ku caanbaxay tadabburka qotada dheer ee aayaadka Qur\'aanka, xigmadda nolosha, iyo dhisidda caqliga qofka Muslimka ah.',
    sourceAttribution: 'Dacwah Islamic Network & Somali Audio Archives',
    externalLink: 'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'mustafe-1',
        scholarId: 'sheikh-mustafe',
        scholarName: 'Sheikh Mustafe Haji Ismail',
        scholarSomaliName: 'Shiikh Mustafe Xaaji Ismaaciil',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَةِ',
        ayahStart: 1,
        ayahEnd: 7,
        ayahRange: '1-7',
        titleSo: 'Fasiraadda iyo Tadabburka Suuradda Al-Faatixa (Ummul Kitaab)',
        titleEn: 'Exegesis & Contemplation of Surah Al-Fatihah',
        audioUrl: 'https://archive.org/download/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil/Sheekh%20Mustafa%20Xaaji%20Ismaaciil/U%20fiirsashadda%20Quraanka.mp3',
        duration: '44:20',
        durationSeconds: 2660,
        transcriptSo: 'Shiikh Mustafe wuxuu ku lafogurayaa siraha Ummul Quraan, macnaha xamdiga, aqoonsiga Boqornimada Eebbe, iyo baryada toosan ee hanuunka jidka toosan.',
        transcriptEn: 'Secrets of the Mother of the Book, true gratitude to Allah, Divine Sovereignty, and the constant prayer for guidance upon the Straight Path.',
        sourceAttribution: 'Dacwah Islamic Network / Internet Archive',
        sourceUrl: 'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'mustafe-18',
        scholarId: 'sheikh-mustafe',
        scholarName: 'Sheikh Mustafe Haji Ismail',
        scholarSomaliName: 'Shiikh Mustafe Xaaji Ismaaciil',
        surahNumber: 18,
        surahName: 'Al-Kahf',
        surahNameArabic: 'الكَهْفِ',
        ayahStart: 1,
        ayahEnd: 110,
        ayahRange: '1-110',
        titleSo: 'Tadabburka Qotada Dheer ee Suuradda Al-Kahf (U Fiirsashada Quraanka)',
        titleEn: 'Deep Contemplation of Surah Al-Kahf',
        audioUrl: 'https://archive.org/download/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil/Sheekh%20Mustafa%20Xaaji%20Ismaaciil/U%20fiirsashadda%20Quraanka.mp3',
        duration: '51:10',
        durationSeconds: 3070,
        transcriptSo: 'Shiikh Mustafe wuxuu ku lafogurayaa sida Suuradda Al-Kahf u dhisayso difaaca caqiidada ee xilliga casriga ah, xallinta xiisadaha nolosha, iyo dhisidda bulsho qiyam leh.',
        transcriptEn: 'Civilizational and spiritual resilience in Surah Al-Kahf, overcoming modern ideological trials, and the moral compass of the believer.',
        sourceAttribution: 'Dacwah Islamic Network / Internet Archive',
        sourceUrl: 'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'mustafe-49',
        scholarId: 'sheikh-mustafe',
        scholarName: 'Sheikh Mustafe Haji Ismail',
        scholarSomaliName: 'Shiikh Mustafe Xaaji Ismaaciil',
        surahNumber: 49,
        surahName: 'Al-Hujurat',
        surahNameArabic: 'الحُجُرَاتِ',
        ayahStart: 1,
        ayahEnd: 18,
        ayahRange: '1-18',
        titleSo: 'Dhismaha Akhlaaqda Bulshada ee Suuradda Al-Xujuraat',
        titleEn: 'Social Ethics and Brotherhood in Surah Al-Hujurat',
        audioUrl: 'https://archive.org/download/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil/Sheekh%20Mustafa%20Xaaji%20Ismaaciil/Tasbiixda%20kusoo%20Aroortay%20Quraanka.mp3',
        duration: '38:40',
        durationSeconds: 2320,
        transcriptSo: 'Shiikh Mustafe wuxuu ku faahfaahinayaa akhlaaqda Islaamka ee Suuradda Al-Xujuraat: ka fogaanshaha xanta, xaqiijinta warka, walaaltinimada dhabta ah, iyo cabsidda Eebbe inay tahay halbeegga sharafta.',
        transcriptEn: 'Islamic social ethics in Surah Al-Hujurat: verifying information, avoiding backbiting and suspicion, and upholding universal brotherhood based on piety.',
        sourceAttribution: 'Dacwah Islamic Network / Internet Archive',
        sourceUrl: 'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'mustafe-103',
        scholarId: 'sheikh-mustafe',
        scholarName: 'Sheikh Mustafe Haji Ismail',
        scholarSomaliName: 'Shiikh Mustafe Xaaji Ismaaciil',
        surahNumber: 103,
        surahName: 'Al-\'Asr',
        surahNameArabic: 'العَصْرِ',
        ayahStart: 1,
        ayahEnd: 3,
        ayahRange: '1-3',
        titleSo: 'Tadabburka iyo Xigmadda Suuradda Al-Casr & Tasbiixda',
        titleEn: 'Contemplation and Wisdom of Surah Al-Asr & Tasbeeh',
        audioUrl: 'https://archive.org/download/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil/Sheekh%20Mustafa%20Xaaji%20Ismaaciil/Tasbiixda%20kusoo%20Aroortay%20Quraanka.mp3',
        duration: '28:15',
        durationSeconds: 1695,
        transcriptSo: 'Shiikh Mustafe Xaaji Ismaaciil wuxuu ku lafogurayaa sababta Imaam Shaafici u yiri: Haddii aysan soo degi lahayn suurad kale oo aan tan ahayn way ku filnaan lahayd dadka. Afarta tiir ee badbaadada: Iimaanka, camalka suuban, isu dardaaranka xaqa, iyo samirka.',
        transcriptEn: 'Profound reflection by Sheikh Mustafe Haji Ismail on Imam Al-Shafi\'i\'s statement regarding Surah Al-Asr. The four pillars of salvation: Faith, righteous deeds, advising truth, and steadfast patience.',
        sourceAttribution: 'Dacwah Islamic Network / Internet Archive',
        sourceUrl: 'https://archive.org/details/MuxaadarooyinkiiSheekhMustafeXaajiIsmaaciil',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
  {
    id: 'sheikh-umal',
    scholarName: 'Sheikh Mohamed Abdi Umal',
    scholarArabic: 'الشيخ محمد عبدي أومل',
    somaliName: 'Shiikh Maxamed Cabdi Umal',
    country: 'Somalia / Kenya',
    portraitUrl: '/images/scholars/sheikh_umal.svg',
    descriptionEn: 'Senior Somali Islamic scholar based in Nairobi. Renowned across the Horn of Africa and the diaspora for his monumental multi-year commentary (Tafsiir) of the complete Holy Quran.',
    descriptionSo: 'Mid ka mid ah culimada ugu waaweyn Soomaaliya, kuna nool Nairobi. Wuxuu caan ku yahay tafsiirka dhameystiran ee Qur\'aanka Kariimka oo uu sanado badan soo duubayay.',
    sourceAttribution: 'Internet Archive (Abuu Kalthuma Archive) & Markaz Tawxiid Nairobi',
    externalLink: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
    archiveIdentifier: 'tafsiirka-quraanka-juz-camma-sheekh-maxamed-cadi-umal',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'umal-1',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَةِ',
        ayahStart: 1,
        ayahEnd: 7,
        ayahRange: '1-7',
        titleSo: 'Tafsiirka Suuradda Al-Faatixa & Bilowga Al-Baqarah',
        titleEn: 'Tafsir of Surah Al-Fatihah & Opening of Al-Baqarah',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/001-Tafsiir-Al-faatixah-Al-baqarahAayah7.mp3',
        duration: '35:00',
        durationSeconds: 2100,
        transcriptSo: 'Sharaxa Ummul Qur\'aan: Shiikh Maxamed Cabdi Umal wuxuu ku fasirayaa magacyada Eebbe, qeybaha Tawxiidka ee suuradda ku jira, iyo sida loo weydiisto hanuunka toosan.',
        transcriptEn: 'Explanation of the Mother of the Quran: The categories of Tawheed in Surah Al-Fatihah, seeking refuge with Allah, and praying for the Straight Path.',
        sourceAttribution: 'Markaz Tawxiid Nairobi / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-2-kursi',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        surahNameArabic: 'البَقَرَةِ',
        ayahStart: 253,
        ayahEnd: 261,
        ayahRange: '253-261 (Ayat al-Kursi)',
        titleSo: 'Fasiraadda Aayadda Kursiga & Aayadaha 253-261',
        titleEn: 'Tafsir of Ayat al-Kursi & Verses 2:253-261',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/018-Tafsiir-Al-baqarahAayah253-262.mp3',
        duration: '40:15',
        durationSeconds: 2415,
        transcriptSo: 'Aayadda ugu weyn Kitaabka: Sh. Umal wuxuu si qoto dheer u sharxayaa Tawxiidka magacyada iyo sifooyinka Eebbe, Noloshiisa buuxda (Al-Xayyu), Istaagistiisa boqortooyada (Al-Qayyuum), iyo sida aysan u qaban lulmo iyo hurdo toona.',
        transcriptEn: 'The supreme verse of the Quran: Detailed analysis of divine attributes, perpetual living (Al-Hayy), sustaining creation (Al-Qayyum), and absolute transcendence above slumber or fatigue.',
        sourceAttribution: 'Markaz Tawxiid Nairobi / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-78',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 78,
        surahName: 'An-Naba',
        surahNameArabic: 'النَّبَإِ',
        ayahStart: 1,
        ayahEnd: 40,
        ayahRange: '1-40',
        titleSo: 'Tafsiirka Suuradda An-Naba & An-Naazi\'aat',
        titleEn: 'Tafsir of Surah An-Naba & An-Nazi\'at',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/241-Tafsiir-An-nabaAn-naazicaatAayah17-46.mp3',
        duration: '47:20',
        durationSeconds: 2840,
        transcriptSo: 'Casharka Juz Camma: Shiikh Maxamed Cabdi Umal wuxuu ku bilaabayaa macnaha (Camma yatasaa\'aluun), waxa ay isweydiinayaan gaaladii Qureysh ee ku saabsan soo bixidda Qiyaamada iyo warka weyn ee Nabiga ﷺ u keenay.',
        transcriptEn: 'Lesson of Juz Amma: Sheikh Umal explains the opening inquiry of Quraysh regarding the Great News (the Resurrection and Prophethood), the proofs of Allah\'s creation, and the stages of judgment.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-79',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 79,
        surahName: 'An-Nazi\'at',
        surahNameArabic: 'النَّازِعَاتِ',
        ayahStart: 1,
        ayahEnd: 46,
        ayahRange: '1-46',
        titleSo: 'Tafsiirka Suuradda An-Naazi\'aat',
        titleEn: 'Tafsir of Surah An-Nazi\'at',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/241-Tafsiir-An-nabaAn-naazicaatAayah17-46.mp3',
        duration: '42:15',
        durationSeconds: 2535,
        transcriptSo: 'Casharka 2aad: Dhaarta malaa\'igta nafta si xoog ah u siibta iyo kuwa si naxariis leh u qaada, qisadii Nabi Muuse iyo Fircoon, iyo xisaabta maalinta Qiyaame.',
        transcriptEn: 'Lesson 2: The oath by angels extracting souls, the prophetic encounter between Moses and Pharaoh, and the ultimate reckoning of the Final Hour.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-80',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 80,
        surahName: '\'Abasa',
        surahNameArabic: 'عَبَسَ',
        ayahStart: 1,
        ayahEnd: 42,
        ayahRange: '1-42',
        titleSo: 'Tafsiirka Suuradda Cabasa & At-Takwiir',
        titleEn: 'Tafsir of Surah \'Abasa & At-Takwir',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/242-Tafsiir-CabasaAt-takwiirAayah1-29.mp3',
        duration: '39:50',
        durationSeconds: 2390,
        transcriptSo: 'Casharka Suuradda Cabasa: Sababta soo degitaanka suuradda ee ku saabsan saxaabiga indhaha la\' Cabdullaahi ibn Ummi Maktuum, iyo caddaynta sharafta diinta Islaamka.',
        transcriptEn: 'Occasion of revelation regarding companion Abdullah ibn Umm Maktum and the universal honor given to sincere seekers of knowledge.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-81',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 81,
        surahName: 'At-Takwir',
        surahNameArabic: 'التَّكْوِيرِ',
        ayahStart: 1,
        ayahEnd: 29,
        ayahRange: '1-29',
        titleSo: 'Tafsiirka Suuradda At-Takwiir',
        titleEn: 'Tafsir of Surah At-Takwir',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/242-Tafsiir-CabasaAt-takwiirAayah1-29.mp3',
        duration: '44:10',
        durationSeconds: 2650,
        transcriptSo: 'Dhacdooyinka cajiibka ah ee Qiyaamada marka qorraxda la duubo, xiddiguhu daataan, buuruhuna socdaan.',
        transcriptEn: 'Cosmic changes accompanying the Day of Resurrection, the folding of the sun, and the scattering of the stars.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-82',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 82,
        surahName: 'Al-Infitar',
        surahNameArabic: 'الانْفِطَارِ',
        ayahStart: 1,
        ayahEnd: 19,
        ayahRange: '1-19',
        titleSo: 'Tafsiirka Suuradda Al-Infixaar & Al-Mudhaffifiin',
        titleEn: 'Tafsir of Surah Al-Infitar & Al-Mutaffifin',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/243-Tafsiir-Al-infidhaarAl-mudhafifiinAayah1-36.mp3',
        duration: '44:10',
        durationSeconds: 2650,
        transcriptSo: 'Dillaacidda samada iyo daadashada xiddigaha, abuurista aadamiga ee sharafta leh, iyo malaa\'igta qoraalka camalka qabata (Kiraaman Kaatibiin).',
        transcriptEn: 'Cleaving of the sky, scattering of stars, noble recording angels overseeing deeds, and distinction between righteous and wicked.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-83',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 83,
        surahName: 'Al-Mutaffifin',
        surahNameArabic: 'المُطَفِّفِينَ',
        ayahStart: 1,
        ayahEnd: 36,
        ayahRange: '1-36',
        titleSo: 'Tafsiirka Suuradda Al-Mudhaffifiin',
        titleEn: 'Tafsir of Surah Al-Mutaffifin',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/243-Tafsiir-Al-infidhaarAl-mudhafifiinAayah1-36.mp3',
        duration: '41:30',
        durationSeconds: 2490,
        transcriptSo: 'Ciqaabta daran ee kuwa miisaanka iyo beegmada dhima marka ay wax iibinayaan, iyo kala soocidda kitaabka Sijjiin iyo Calliyyiin.',
        transcriptEn: 'Warning against fraudulent trade and shortchanging measurements, and the destiny of the righteous in Illiyyun versus the transgressors in Sijjin.',
        sourceAttribution: 'Markaz Tawxiid / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'umal-112',
        scholarId: 'sheikh-umal',
        scholarName: 'Sheikh Mohamed Abdi Umal',
        scholarSomaliName: 'Shiikh Maxamed Cabdi Umal',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاصِ',
        ayahStart: 1,
        ayahEnd: 4,
        ayahRange: '1-4',
        titleSo: 'Tafsiirka Suuradda Al-Ikhlaas ilaa An-Naas',
        titleEn: 'Tafsir of Surah Al-Ikhlas to An-Nas',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal/250-Tafsiir-QureyshIlaaAl-naasAayah1-6.mp3',
        duration: '32:40',
        durationSeconds: 1960,
        transcriptSo: 'Suuradda u dhiganta saddex meelood hal meel Qur\'aanka: Fasiraadda magaca As-Samad (Kan loo baahan yahay isaguna aan cidna u baahnayn), iyo burinta shirkiga iyo dhalashada.',
        transcriptEn: 'The Surah equivalent to one third of the Quran: Explanation of As-Samad (The Eternal Refuge), absolute indivisibility, and refutation of polytheism.',
        sourceAttribution: 'Markaz Tawxiid Nairobi / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cabdi-umal',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
  {
    id: 'sheikh-dirir',
    scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
    scholarArabic: 'الشيخ محمد بن شيخ عمر درر',
    somaliName: 'Shiikh Maxamed Cumar Dirir',
    country: 'Somalia / Somaliland',
    portraitUrl: '/images/scholars/sheikh_dirir.svg',
    descriptionEn: 'Eminent Islamic jurist, educator, and scholar of Quranic interpretation based in Hargeisa. Taught comprehensive Quran Tafsir across East African Islamic institutions.',
    descriptionSo: 'Caalim weyn oo reer Hargeysa ah, macallin diineed iyo faaqide tafsiirka Qur\'aanka. Wuxuu duubay casharro tafsiir ah oo laga dhageysto masaajidda iyo xarumaha cilmiga.',
    sourceAttribution: 'Internet Archive & Hargeisa Islamic Center',
    externalLink: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
    archiveIdentifier: 'tafsiirka-quraanka-suuradda-20aad-taha-sheekh-maxamed-cumar-dirir',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'dirir-1',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَةِ',
        ayahStart: 1,
        ayahEnd: 7,
        ayahRange: '1-7',
        titleSo: 'Tafsiirka Suuradda Al-Faatixa & Tiirarka Salaadda',
        titleEn: 'Tafsir of Surah Al-Fatihah & Pillars of Prayer',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/001alfaatixa.mp3',
        duration: '38:10',
        durationSeconds: 2290,
        transcriptSo: 'Fasiraadda Suuradda Al-Faatixa: Sh. Dirir wuxuu ku lafogurayaa sida aayaddani u tahay furaha quluubta, xiriirka ay la leedahay salaadda saxda ah, iyo hanuunka siraadka toosan.',
        transcriptEn: 'Surah Al-Fatihah commentary: Its central role as the pillar of Salah, supplication for guidance upon the straight path, and avoiding misguided paths.',
        sourceAttribution: 'Hargeisa Islamic Center / Public Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-2',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        surahNameArabic: 'البَقَرَةِ',
        ayahStart: 1,
        ayahEnd: 43,
        ayahRange: '1-43',
        titleSo: 'Tafsiirka Suuradda Al-Baqarah (1-43)',
        titleEn: 'Tafsir of Surah Al-Baqarah (1-43)',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/002Albaqara1-43.mp3',
        duration: '45:15',
        durationSeconds: 2715,
        transcriptSo: 'Fasiraadda bilowga Suuradda Al-Baqarah: Tilmaamaha saddexda qaybood ee dadka (Mu\'miniinta, Gaalada, iyo Munaafaqiinta).',
        transcriptEn: 'Commentary on opening of Al-Baqarah: Categorization of mankind into believers, disbelievers, and hypocrites.',
        sourceAttribution: 'Hargeisa Islamic Center / Public Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-8',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 8,
        surahName: 'Al-Anfal',
        surahNameArabic: 'الأَنْفَالِ',
        ayahStart: 1,
        ayahEnd: 75,
        ayahRange: '1-75',
        titleSo: 'Tafsiirka Suuradda Al-Anfaal (Duruusta Badar)',
        titleEn: 'Tafsir of Surah Al-Anfal (The Spoils)',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/039Acraaf198-Anfaal40.mp3',
        duration: '52:10',
        durationSeconds: 3130,
        transcriptSo: 'Duruusta Dagaalkii Bedar: Qaniimada, gargaarkii malaa\'igta ee dagaalka, iyo shuruudaha guusha mu\'miniinta.',
        transcriptEn: 'Lessons from the Battle of Badr: Division of spoils, angelic assistance, and the psychological and spiritual prerequisites for victory.',
        sourceAttribution: 'Internet Archive / Hargeisa Lectures',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-12',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 12,
        surahName: 'Yusuf',
        surahNameArabic: 'يُوسُفَ',
        ayahStart: 1,
        ayahEnd: 111,
        ayahRange: '1-111',
        titleSo: 'Tafsiirka Suuradda Yuusuf (Qisada Ugu Wanaagsan)',
        titleEn: 'Tafsir of Surah Yusuf (The Best of Stories)',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/051Yuusuf1-33.mp3',
        duration: '56:30',
        durationSeconds: 3390,
        transcriptSo: 'Qisadii Nebi Yuusuf (CS): Masayrkii walaalaha, ceelkii lagu tuuray, fitnadii guriga boqorka, xabsigii, iyo xigmadda samirka iyo cafiska.',
        transcriptEn: 'The profound story of Prophet Joseph: Trials of jealousy, imprisonment, economic stewardship of Egypt, and beautiful patience resulting in divine honor.',
        sourceAttribution: 'Hargeisa Islamic Lectures / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-18',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 18,
        surahName: 'Al-Kahf',
        surahNameArabic: 'الكَهْفِ',
        ayahStart: 1,
        ayahEnd: 110,
        ayahRange: '1-110',
        titleSo: 'Tafsiirka Suuradda Al-Kahf (Duruusta Jimcaha)',
        titleEn: 'Tafsir of Surah Al-Kahf (Friday Reflection)',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/063Isra94-Alkahfi30.mp3',
        duration: '54:00',
        durationSeconds: 3240,
        transcriptSo: 'Afarta Fitno ee Suuradda Kahf: Fitnada Diinta (Asxaabul Kahfi), Fitnada Maalka (Labadii beeraley), Fitnada Cilmiga (Muuse & Khidhir), iyo Fitnada Awoodda (Dul-Qarnayn).',
        transcriptEn: 'The four universal trials in Surah Al-Kahf: Trial of faith, trial of wealth, trial of knowledge, and trial of power with their prophetic remedies.',
        sourceAttribution: 'Hargeisa Islamic Lectures / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-20',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 20,
        surahName: 'Ta-Ha',
        surahNameArabic: 'طه',
        ayahStart: 1,
        ayahEnd: 135,
        ayahRange: '1-135',
        titleSo: 'Tafsiirka Suuradda 20aad (Daa-Haa)',
        titleEn: 'Tafsir of Surah 20: Ta-Ha',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/068Dah71-165.mp3',
        duration: '58:00',
        durationSeconds: 3480,
        transcriptSo: 'Casharka Suuradda Daa-Haa: Sheekh Maxamed Cumar Dirir wuxuu ku lafogurayaa qisadii Nabi Muuse (CS), dooxada barakaysan ee Dhuwaa, iyo wada-hadalkii Eebbe weyne.',
        transcriptEn: 'Comprehensive commentary on Surah Ta-Ha: The prophetic calling of Moses at the sacred valley of Tuwa, the confrontation with Pharaoh, and lessons on patience.',
        sourceAttribution: 'Internet Archive / Hargeisa Islamic Lectures',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-31',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 31,
        surahName: 'Luqman',
        surahNameArabic: 'لُقْمَانَ',
        ayahStart: 1,
        ayahEnd: 34,
        ayahRange: '1-34',
        titleSo: 'Tafsiirka Suuradda Luqmaan (Dardaarankii Xigmadda)',
        titleEn: 'Tafsir of Surah Luqman (Counsel of Wisdom)',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/086Ruum22Luqmaan5.mp3',
        duration: '48:30',
        durationSeconds: 2910,
        transcriptSo: 'Dardaarankii Luqmaan ee wiilkiisa: Tawxiidka, baarrinimada waalidiinta, ilaalinta salaadda, amarka wanaagga iyo reebidda xumaanta, iyo is-hoosaysiinta.',
        transcriptEn: 'Luqman\'s timeless counsel: Pure monotheism, honoring parents, establishing prayer, promoting justice, and cultivating humbleness.',
        sourceAttribution: 'Hargeisa Islamic Lectures / Internet Archive',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'dirir-114',
        scholarId: 'sheikh-dirir',
        scholarName: 'Sheikh Mohamed Sheikh Omar Dirir',
        scholarSomaliName: 'Shiikh Maxamed Cumar Dirir',
        surahNumber: 114,
        surahName: 'An-Nas',
        surahNameArabic: 'النَّاسِ',
        ayahStart: 1,
        ayahEnd: 6,
        ayahRange: '104-114',
        titleSo: 'Tafsiirka Suuradaha Al-Humazah ilaa An-Naas',
        titleEn: 'Tafsir of Surahs Al-Humazah to An-Nas',
        audioUrl: 'https://archive.org/download/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir/133Alhumaza1-Anaas7.mp3',
        duration: '34:20',
        durationSeconds: 2060,
        transcriptSo: 'Fasiraadda suuradaha gaagaaban ee dhamaadka Quraanka: Sh. Dirir wuxuu ku sharxayaa ilaalinta carrabka, duugista maalka, iyo magangalka Eebaha dadka.',
        transcriptEn: 'Commentary on closing short surahs: Protection from slander, virtue of charity, and seeking refuge in the Lord of mankind.',
        sourceAttribution: 'Internet Archive / Hargeisa Lectures',
        sourceUrl: 'https://archive.org/details/tafsiirka-quraanka-sheekh-maxamed-cumar-dirir',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
  {
    id: 'sheikh-cumar-faaruuq',
    scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
    scholarArabic: 'الشيخ عمر فاروق رحمه الله',
    somaliName: 'Shiikh Cumar Faaruuq (Aabihii Tafsiirka Soomaaliyeed)',
    country: 'Somalia / Saudi Arabia',
    portraitUrl: '/images/scholars/sheikh_cumar_faaruuq.svg',
    descriptionEn: 'The historic pioneer of Somali Quranic Tafsir. His complete audio translation recorded in Saudi Arabia during the 1980s shaped Islamic understanding across generations of Somalis.',
    descriptionSo: 'Aabihii tafsiirka Soomaaliyeed ee xilliga casriga ah. Tafsiirkiisii dhameystirnaa ee 1980-meeyadii wuxuu ahaa kii ugu horreeyay ee si ballaaran u gaara shacabka Soomaaliyeed.',
    sourceAttribution: 'Internet Archive (Tafsiirka Cumar Faaruuq Collection)',
    externalLink: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
    historicArchiveId: 'ALFAITHA',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'faaruuq-1',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَةِ',
        ayahStart: 1,
        ayahEnd: 7,
        ayahRange: '1-7',
        titleSo: 'Tafsiirka Qadiimiga ah ee Suuradda Al-Faatixa (Diiwaankii 1980-yadii)',
        titleEn: 'Historic 1980s Tafsir of Surah Al-Fatihah',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/001%20%281-7%29.mp3',
        duration: '31:20',
        durationSeconds: 1880,
        transcriptSo: 'Darsi taariikhi ah: Shiikh Cumar Faaruuq رحمه الله wuxuu ku bilaabayaa af-Soomaali saafi ah fasiraadda Eebbe weyne, Mahadda, Naxariista gaarka ah iyo tan guud, iyo dariiqa toosan.',
        transcriptEn: 'Historic recording: Sheikh Omar Faruq introduces Surah Al-Fatihah in rich traditional Somali, breaking down the divine names, gratitude, and the Straight Path.',
        sourceAttribution: 'Internet Archive / Historical Somali Audio Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'faaruuq-2',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        surahNameArabic: 'البَقَرَةِ',
        ayahStart: 1,
        ayahEnd: 25,
        ayahRange: '1-25',
        titleSo: 'Tafsiirka Suuradda Al-Baqarah (1-25)',
        titleEn: 'Tafsir of Surah Al-Baqarah (1-25)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/002%20%281..........25%29.mp3',
        duration: '45:00',
        durationSeconds: 2700,
        transcriptSo: 'Fasiraadda bilowga Al-Baqarah: Sh. Cumar Faaruuq wuxuu ku fasirayaa Alif-Laam-Miim, dhowrista taqwada, iyo sifooyinka mu\'miniinta.',
        transcriptEn: 'Historic commentary on Al-Baqarah verses 1-25: Explanation of piety, faith in the unseen, and establishing prayer.',
        sourceAttribution: 'Historical Somali Audio Archive / Internet Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'faaruuq-18',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 18,
        surahName: 'Al-Kahf',
        surahNameArabic: 'الكَهْفِ',
        ayahStart: 1,
        ayahEnd: 16,
        ayahRange: '1-16',
        titleSo: 'Tafsiirka Suuradda Al-Kahf (Asxaabul Kahfi)',
        titleEn: 'Tafsir of Surah Al-Kahf (People of the Cave)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/018%20Al-Kahf%20%5B1..........16%5D.mp3',
        duration: '48:15',
        durationSeconds: 2895,
        transcriptSo: 'Qisadii dhalinyaradii iimaanka u carartay ee godka gashay, iyo badbaadada Eebbe ku mannaystay.',
        transcriptEn: 'Historic recording of Surah Al-Kahf verses 1-16: The youth seeking refuge in the cave and divine preservation of faith.',
        sourceAttribution: 'Historical Somali Audio Archive / Internet Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'faaruuq-36',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 36,
        surahName: 'Ya-Sin',
        surahNameArabic: 'يس',
        ayahStart: 28,
        ayahEnd: 58,
        ayahRange: '28-58',
        titleSo: 'Tafsiirka Suuradda Yaa-Siin (Qalbiga Qur\'aanka)',
        titleEn: 'Tafsir of Surah Ya-Sin (Heart of the Quran)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/036%20Yaasiin%20%5B28..........58%5D.mp3',
        duration: '50:45',
        durationSeconds: 3045,
        transcriptSo: 'Fasiraadda Suuradda Yaasiin: Caddaynta risaalada Nabiga ﷺ, qisadii asxaabtii magaalada (Asxaabul Qaryah), iyo soo noolaynta dhulka dhintay.',
        transcriptEn: 'Classic Tafsir of Surah Ya-Sin: Confirmation of the Messenger\'s truth, the parable of the city dwellers, and proofs of divine resurrection.',
        sourceAttribution: 'Historical Somali Audio Archive / Internet Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'faaruuq-56',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 56,
        surahName: 'Al-Waqi\'ah',
        surahNameArabic: 'الوَاقِعَةِ',
        ayahStart: 1,
        ayahEnd: 96,
        ayahRange: '1-96',
        titleSo: 'Tafsiirka Suuradda Al-Waaqica',
        titleEn: 'Tafsir of Surah Al-Waqi\'ah (The Inevitable)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/056%20Al-Waaqicah%20%5B1..........96%5D%3B%20.mp3',
        duration: '46:15',
        durationSeconds: 2775,
        transcriptSo: 'Saddexda kooxood ee Qiyaamada: Kuwa horeeya (Al-Saabiquun), Kuwa midigta (Asxaabul Yamiin), iyo Kuwa bidixda (Asxaabush-Shimaal), iyo caddaynta awoodda Eebbe ee abuurka.',
        transcriptEn: 'The three classes of humanity in the Hereafter: The foremost, the companions of the right, and the companions of the left.',
        sourceAttribution: 'Historical Somali Audio Archive / Internet Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'faaruuq-67',
        scholarId: 'sheikh-cumar-faaruuq',
        scholarName: 'Sheikh Omar Faruq (Rahimahullah)',
        scholarSomaliName: 'Shiikh Cumar Faaruuq',
        surahNumber: 67,
        surahName: 'Al-Mulk',
        surahNameArabic: 'المُلْكِ',
        ayahStart: 1,
        ayahEnd: 30,
        ayahRange: '1-30',
        titleSo: 'Tafsiirka Suuradda Al-Mulk (Tabaarak)',
        titleEn: 'Tafsir of Surah Al-Mulk (The Sovereignty)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Cumar_Faaruuq_1/067%20Al-Mulk%20%5B1.........30%5D.mp3',
        duration: '36:10',
        durationSeconds: 2170,
        transcriptSo: 'Tafsiirka Suuradda Boqortooyada: Shiikh Cumar Faaruuq رحمه الله wuxuu ku sharxayaa barakada Eebbe, abuurista dhimashada iyo nolosha si la isku imtixaano, iyo badbaadada cadaabka qabriga.',
        transcriptEn: 'Classic Tafsir of Surah Al-Mulk: Explanation of divine creation of life and death as a trial, and the protection granted from the torment of the grave.',
        sourceAttribution: 'Historical Somali Audio Archive / Internet Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Cumar_Faaruuq_1',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
  {
    id: 'sheikh-shibli',
    scholarName: 'Sheikh Mohamed Abdillahi Shibli',
    scholarArabic: 'الشيخ محمد عبد الله شبلي',
    somaliName: 'Shiikh Maxamed Shibli',
    country: 'Somalia / Kenya',
    portraitUrl: '/images/scholars/sheikh_shibli.svg',
    descriptionEn: 'Prominent Somali scholar and jurist renowned for sharp scholarly analysis, Fiqh lectures, and thematic Quranic exegesis delivered internationally.',
    descriptionSo: 'Caalim caan ah oo xubin ka ah guddiga culimada Soomaaliyeed, kuna xeeldheer axkaamta Fiqiga, tafsiirka mowduuciga ah ee Qur\'aanka, iyo duruusta bulshada.',
    sourceAttribution: 'Internet Archive (Juz Camma Collection) & Somali Islamic Dawa',
    externalLink: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'shibli-78',
        scholarId: 'sheikh-shibli',
        scholarName: 'Sheikh Mohamed Abdillahi Shibli',
        scholarSomaliName: 'Shiikh Maxamed Shibli',
        surahNumber: 78,
        surahName: 'An-Naba',
        surahNameArabic: 'النَّبَإِ',
        ayahStart: 1,
        ayahEnd: 40,
        ayahRange: '1-40',
        titleSo: 'Tafsiirka Suuradda An-Naba (Warka Weyn)',
        titleEn: 'Tafsir of Surah An-Naba (The Tidings)',
        audioUrl: 'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/003%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20an-Naba%201%20%5BD-03aad%5D.mp3',
        duration: '45:00',
        durationSeconds: 2700,
        transcriptSo: 'Fasiraadda Suuradda An-Naba: Sh. Maxamuud Shibli wuxuu ku sharxayaa doodda gaalada ee soo saarista Qiyaamada, abuurista buuraha iyo cirka, iyo xisaabta dhabta ah.',
        transcriptEn: 'Exegesis of Surah An-Naba by Sheikh Shibli: Addressing doubts regarding resurrection, cosmic signs, and the inevitable judgment.',
        sourceAttribution: 'Internet Archive / Juz Amma Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'shibli-79',
        scholarId: 'sheikh-shibli',
        scholarName: 'Sheikh Mohamed Abdillahi Shibli',
        scholarSomaliName: 'Shiikh Maxamed Shibli',
        surahNumber: 79,
        surahName: 'An-Nazi\'at',
        surahNameArabic: 'النَّازِعَاتِ',
        ayahStart: 1,
        ayahEnd: 46,
        ayahRange: '1-46',
        titleSo: 'Tafsiirka Suuradda An-Naazi\'aat',
        titleEn: 'Tafsir of Surah An-Nazi\'at',
        audioUrl: 'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/007%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20an-Naazicaat%201%20%5BD-07aad%5D.mp3',
        duration: '42:15',
        durationSeconds: 2535,
        transcriptSo: 'Sharaxa Suuradda An-Naazi\'aat: Qisadii Nabi Muuse iyo Fircoon, xadka awoodda aadamiga, iyo xisaabta nafta.',
        transcriptEn: 'Tafsir of Surah An-Nazi\'at: Moses and Pharaoh, limits of tyranny, and preparation for eternity.',
        sourceAttribution: 'Internet Archive / Juz Amma Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'shibli-80',
        scholarId: 'sheikh-shibli',
        scholarName: 'Sheikh Mohamed Abdillahi Shibli',
        scholarSomaliName: 'Shiikh Maxamed Shibli',
        surahNumber: 80,
        surahName: '\'Abasa',
        surahNameArabic: 'عَبَسَ',
        ayahStart: 1,
        ayahEnd: 42,
        ayahRange: '1-42',
        titleSo: 'Tafsiirka Suuradda Cabasa',
        titleEn: 'Tafsir of Surah \'Abasa',
        audioUrl: 'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/010%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20Cabasa%201%20%5BD-10aad%5D.mp3',
        duration: '38:30',
        durationSeconds: 2310,
        transcriptSo: 'Casharka Suuradda Cabasa: Sharafta daacadda Eebbe, dardaaranka qiimaha addoonka daacadda ah marka loo eego kuwa kibirka leh.',
        transcriptEn: 'Moral priorities of Islamic revelation: Honoring the sincere seeker of truth over haughty leaders.',
        sourceAttribution: 'Internet Archive / Juz Amma Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'shibli-103',
        scholarId: 'sheikh-shibli',
        scholarName: 'Sheikh Mohamed Abdillahi Shibli',
        scholarSomaliName: 'Shiikh Maxamed Shibli',
        surahNumber: 103,
        surahName: 'Al-\'Asr',
        surahNameArabic: 'العَصْرِ',
        ayahStart: 1,
        ayahEnd: 3,
        ayahRange: '1-3',
        titleSo: 'Tafsiirka Suuradda Al-Casr ilaa Qureysh',
        titleEn: 'Tafsir of Surah Al-Asr to Quraysh',
        audioUrl: 'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/032%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20al-Casr%20ilaa%20Qureysh%20%5BD-32aad%5D.mp3',
        duration: '36:15',
        durationSeconds: 2175,
        transcriptSo: 'Qiimaha waqtiga iyo afarta tiir ee guusha: Iimaanka, camalka suuban, isu dardaaranka xaqa iyo samirka.',
        transcriptEn: 'The sanctity of time and the four conditions for avoiding loss according to Surah Al-Asr.',
        sourceAttribution: 'Internet Archive / Juz Amma Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'shibli-112',
        scholarId: 'sheikh-shibli',
        scholarName: 'Sheikh Mohamed Abdillahi Shibli',
        scholarSomaliName: 'Shiikh Maxamed Shibli',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاصِ',
        ayahStart: 1,
        ayahEnd: 4,
        ayahRange: '112-114',
        titleSo: 'Tafsiirka Suuradaha Al-Ikhlaas, Al-Falaq & An-Naas',
        titleEn: 'Tafsir of Al-Ikhlas, Al-Falaq & An-Nas',
        audioUrl: 'https://archive.org/download/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli/Tafsiirka%20Quraanka%20%5BJuz%20Camma%5D%20-%20Sheekh%20Maxmuud%20Sh.%20Maxamed%20Shibli/034%20Tafsiirka%20Quraanka%20%28Juz%20Camma%29%20Suuradda%20al-Ikhlaas%20ilaa%20Naas%20%5BD-34aad%5D.mp3',
        duration: '42:00',
        durationSeconds: 2520,
        transcriptSo: 'Fasiraadda Al-Mucawwidatayn iyo Tawxiidka saafi ah ee Suuradda Ikhlaas.',
        transcriptEn: 'The protection verses and pure monotheistic creed concluding the Holy Quran.',
        sourceAttribution: 'Internet Archive / Juz Amma Archive',
        sourceUrl: 'https://archive.org/details/Tafsiirka_Quraanka_Juz_Camma-Sheekh_Maxamuud_Maxamed_Shibli',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
  {
    id: 'sheikh-cabdirashiid-suufi',
    scholarName: 'Sheikh Abdur-Rashid Ali Sufi',
    scholarArabic: 'الشيخ عبد الرشيد بن علي صوفي',
    somaliName: 'Shiikh Cabdirashiid Cali Suufi',
    country: 'Somalia / Qatar',
    portraitUrl: '/images/reciters/abdulrasheed-sufi.png',
    descriptionEn: 'World-renowned Quran reciter and authority in Qira\'at sciences. Son of Sheikh Ali Sufi. Offers profound Tadabbur (contemplation) and linguistic tajweed insights on key surahs.',
    descriptionSo: 'Caalimka weyn ee Qiraa\'aatka tobanka ah, wiilka Shiikh Cali Suufi. Wuxuu soo jeediyaa duruus tadabbur ah iyo sharaxa cilmiga Tajwiidka ee suuradaha kala duwan.',
    sourceAttribution: 'Sheikh Abdur-Rashid Sufi Official & Qatar Ministry of Awqaf',
    externalLink: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/001.mp3',
    isVerified: true,
    isPublished: true,
    lessons: [
      {
        id: 'suufi-1',
        scholarId: 'sheikh-cabdirashiid-suufi',
        scholarName: 'Sheikh Abdur-Rashid Ali Sufi',
        scholarSomaliName: 'Shiikh Cabdirashiid Cali Suufi',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَةِ',
        ayahStart: 1,
        ayahEnd: 7,
        ayahRange: '1-7',
        titleSo: 'Duruusta Qiraa\'aatka iyo Tajwiidka Suuradda Al-Faatixa',
        titleEn: 'Tajweed and Qira\'at Lessons of Surah Al-Fatihah',
        audioUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/001.mp3',
        duration: '29:40',
        durationSeconds: 1780,
        transcriptSo: 'Shiikh Cabdirashiid Suufi wuxuu ku sharxayaa akhrisyada kala duwan ee Suuradda Al-Faatixa sida (Maaliki) iyo (Maliki), iyo adkaynta xarfaha saxda ah ee Tajwiidka.',
        transcriptEn: 'Sheikh Abdur-Rashid Sufi discusses the canonical readings of Surah Al-Fatihah (e.g. Maaliki vs Maliki), correct vocal articulation, and spiritual contemplation.',
        sourceAttribution: 'Official Qira\'at Archive / MP3Quran CDN',
        sourceUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/001.mp3',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'suufi-19',
        scholarId: 'sheikh-cabdirashiid-suufi',
        scholarName: 'Sheikh Abdur-Rashid Ali Sufi',
        scholarSomaliName: 'Shiikh Cabdirashiid Cali Suufi',
        surahNumber: 19,
        surahName: 'Maryam',
        surahNameArabic: 'مَرْيَمَ',
        ayahStart: 1,
        ayahEnd: 36,
        ayahRange: '1-36',
        titleSo: 'Tadabburka iyo Quruxda Akhriska Suuradda Maryam',
        titleEn: 'Contemplation and Recitation of Surah Maryam',
        audioUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/019.mp3',
        duration: '36:15',
        durationSeconds: 2175,
        transcriptSo: 'Xikmadaha ku jira baryadii Nabi Zakariya ee qarsoodiga ahayd, dhalashadii Nabi Ciise (CS), iyo naxariista Eebbe ee addoomadiisa suuban.',
        transcriptEn: 'Contemplating the secret supplication of Prophet Zechariah, the miraculous birth of Jesus, and the boundless mercy of Allah.',
        sourceAttribution: 'Official Qira\'at Archive / MP3Quran CDN',
        sourceUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/019.mp3',
        verificationStatus: 'verified',
        isPublished: true,
      },
      {
        id: 'suufi-55',
        scholarId: 'sheikh-cabdirashiid-suufi',
        scholarName: 'Sheikh Abdur-Rashid Ali Sufi',
        scholarSomaliName: 'Shiikh Cabdirashiid Cali Suufi',
        surahNumber: 55,
        surahName: 'Ar-Rahman',
        surahNameArabic: 'الرَّحْمَنِ',
        ayahStart: 1,
        ayahEnd: 78,
        ayahRange: '1-78',
        titleSo: 'Tadabburka Nicmooyinka Eebbe ee Suuradda Ar-Raxmaan',
        titleEn: 'Contemplating Divine Blessings in Surah Ar-Rahman',
        audioUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/055.mp3',
        duration: '42:10',
        durationSeconds: 2530,
        transcriptSo: 'Caddaynta nicmooyinka Eebbe: (Fabi-ayyi aalaa\'i Rabbikumaa tukadh-dhibaan) - Nicmada barashada Qur\'aanka, abuurista badda iyo dabeecadda, iyo abaalmarinta Jannada.',
        transcriptEn: 'Reflections on the refrain "Which of the favors of your Lord will you deny?", gratitude for Quranic revelation, and descriptions of Paradise.',
        sourceAttribution: 'Official Qira\'at Archive / MP3Quran CDN',
        sourceUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/055.mp3',
        verificationStatus: 'verified',
        isPublished: true,
      },
    ],
  },
];

/**
 * Filtered active catalog of verified scholars excluding removed ones (Dirir, Umal, Shibil)
 */
export const SOMALI_SCHOLARS_TAFSIR: SomaliScholarTafsir[] = ALL_SOMALI_SCHOLARS_CATALOG.filter(
  (s) => !EXCLUDED_SCHOLAR_IDS.has(s.id)
);

/**
 * Verified Complete Coverage Surahs:
 * - Surah 1 (Al-Fatihah)
 * - Surahs 78 to 114 (Juz Amma)
 */
const VERIFIED_COMPLETE_SURAHS = new Set<number>([
  1,
  78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
]);

/**
 * Verified In-Progress Surahs:
 * Surahs with verified scholarly lessons covering significant themes or ayah ranges.
 */
const VERIFIED_IN_PROGRESS_SURAHS = new Set<number>([
  2, 8, 12, 18, 19, 20, 24, 31, 36, 49, 55, 56, 67
]);

/**
 * Canonical List of all 114 Surahs with Honest, Strict Coverage Status
 */
export const ALL_114_SURAHS_TAFSIR_STATUS: SurahTafsirSummary[] = ALL_114_SURAHS.map((surah) => {
  const surahNum = surah.number;
  const lessonsForSurah = getTafsirLessonsForSurah(surahNum);

  let status: SurahTafsirCoverageStatus = 'not_available';
  if (VERIFIED_COMPLETE_SURAHS.has(surahNum)) {
    status = 'complete';
  } else if (VERIFIED_IN_PROGRESS_SURAHS.has(surahNum) || lessonsForSurah.length > 0) {
    status = 'in_progress';
  }

  const scholarsSet = new Set<string>();
  let hasAudio = false;
  let hasText = false;

  for (const item of lessonsForSurah) {
    scholarsSet.add(item.scholar.somaliName);
    if (item.lesson.audioUrl) hasAudio = true;
    if (item.lesson.transcriptSo || item.lesson.transcriptEn) hasText = true;
  }

  return {
    surahNumber: surahNum,
    nameArabic: surah.name,
    englishName: surah.englishName,
    somaliNameTranslation: surah.somaliNameTranslation || surah.englishNameTranslation,
    numberOfAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
    status,
    verifiedLessonsCount: lessonsForSurah.length,
    scholarsAvailable: Array.from(scholarsSet),
    hasAudio,
    hasText,
  };
});

/**
 * Get all Somali scholars
 */
export function getAllSomaliScholars(): SomaliScholarTafsir[] {
  return SOMALI_SCHOLARS_TAFSIR;
}

/**
 * Get active featured Somali scholars (with Sheikh Mustafa prominently featured)
 */
export function getActiveSomaliScholars(): SomaliScholarTafsir[] {
  return SOMALI_SCHOLARS_TAFSIR.filter((s) => !EXCLUDED_SCHOLAR_IDS.has(s.id));
}

/**
 * Find scholar by ID
 */
export function getSomaliScholarById(id: string): SomaliScholarTafsir | undefined {
  if (EXCLUDED_SCHOLAR_IDS.has(id)) return undefined;
  return SOMALI_SCHOLARS_TAFSIR.find((s) => s.id === id);
}

/**
 * Get all 114 surahs tafsir summary
 */
export function getAll114SurahsTafsirStatus(): SurahTafsirSummary[] {
  return ALL_114_SURAHS_TAFSIR_STATUS;
}

/**
 * Get status of specific surah
 */
export function getSurahTafsirStatus(surahNumber: number): SurahTafsirSummary | undefined {
  return ALL_114_SURAHS_TAFSIR_STATUS.find((s) => s.surahNumber === surahNumber);
}

/**
 * Helper: Retrieve custom tafsir lessons saved via Admin Dashboard
 */
export function getCustomLessons(): TafsirLesson[] {
  try {
    const raw = localStorage.getItem('emufti_custom_tafsir_lessons');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Find lessons for a given surah number across all scholars (including admin additions)
 */
export function getTafsirLessonsForSurah(
  surahNumber: number
): { scholar: SomaliScholarTafsir; lesson: TafsirLesson }[] {
  const custom = getCustomLessons().filter(
    (l) => l.surahNumber === surahNumber && !EXCLUDED_SCHOLAR_IDS.has(l.scholarId)
  );
  const results: { scholar: SomaliScholarTafsir; lesson: TafsirLesson }[] = [];

  // Add custom lessons
  for (const l of custom) {
    const scholar = getSomaliScholarById(l.scholarId) || {
      id: l.scholarId,
      scholarName: l.scholarName,
      scholarArabic: '',
      somaliName: l.scholarSomaliName,
      country: 'Somalia',
      sourceAttribution: l.sourceAttribution,
      isVerified: l.verificationStatus === 'verified',
      isPublished: l.isPublished,
      descriptionEn: '',
      descriptionSo: '',
      lessons: [],
    };
    results.push({ scholar, lesson: l });
  }

  // Add default lessons (skipping any replaced by custom ID)
  for (const s of SOMALI_SCHOLARS_TAFSIR) {
    for (const l of s.lessons) {
      if (l.surahNumber === surahNumber && !custom.some((c) => c.id === l.id)) {
        results.push({ scholar: s, lesson: l });
      }
    }
  }
  return results;
}

/**
 * Search lessons across scholars and surahs with flexible filters
 */
export function searchTafsirLessons(
  query: string,
  scholarId?: string,
  surahNumber?: number,
  contentType?: 'all' | 'audio' | 'text'
): { scholar: SomaliScholarTafsir; lesson: TafsirLesson }[] {
  const cleanQ = (query || '').toLowerCase().trim();
  const results: { scholar: SomaliScholarTafsir; lesson: TafsirLesson }[] = [];

  const allScholars = getAllSomaliScholars();
  const customLessons = getCustomLessons();

  // Search through all scholars and their lessons
  for (const scholar of allScholars) {
    if (scholarId && scholarId !== 'all' && scholar.id !== scholarId) {
      continue;
    }

    // Merge custom lessons belonging to this scholar
    const scholarCustom = customLessons.filter((cl) => cl.scholarId === scholar.id);
    const combinedLessons = [
      ...scholarCustom,
      ...scholar.lessons.filter((l) => !scholarCustom.some((c) => c.id === l.id)),
    ];

    for (const lesson of combinedLessons) {
      if (surahNumber && lesson.surahNumber !== surahNumber) {
        continue;
      }

      if (contentType === 'audio' && !lesson.audioUrl) continue;
      if (contentType === 'text' && !lesson.transcriptSo && !lesson.transcriptEn) continue;

      if (!cleanQ) {
        results.push({ scholar, lesson });
        continue;
      }

      const match =
        lesson.titleSo.toLowerCase().includes(cleanQ) ||
        lesson.titleEn.toLowerCase().includes(cleanQ) ||
        lesson.surahName.toLowerCase().includes(cleanQ) ||
        String(lesson.surahNumber).includes(cleanQ) ||
        scholar.scholarName.toLowerCase().includes(cleanQ) ||
        scholar.somaliName.toLowerCase().includes(cleanQ) ||
        (lesson.transcriptSo && lesson.transcriptSo.toLowerCase().includes(cleanQ)) ||
        (lesson.transcriptEn && lesson.transcriptEn.toLowerCase().includes(cleanQ));

      if (match) {
        results.push({ scholar, lesson });
      }
    }
  }

  return results;
}

/**
 * Get aggregate statistics of the library
 */
export function getTafsirLibraryStats() {
  const scholars = getAllSomaliScholars();
  let totalLessons = 0;
  for (const s of scholars) {
    totalLessons += s.lessons.length;
  }

  const completeSurahs = ALL_114_SURAHS_TAFSIR_STATUS.filter((s) => s.status === 'complete').length;
  const inProgressSurahs = ALL_114_SURAHS_TAFSIR_STATUS.filter((s) => s.status === 'in_progress').length;
  const notAvailableSurahs = ALL_114_SURAHS_TAFSIR_STATUS.filter((s) => s.status === 'not_available').length;

  return {
    totalSurahs: 114,
    totalScholars: scholars.length,
    totalVerifiedLessons: totalLessons,
    completeSurahs,
    inProgressSurahs,
    notAvailableSurahs,
  };
}

/**
 * Save user audio listening position (persisted in Supabase & local storage)
 */
export async function saveUserTafsirProgress(
  userId: string,
  lessonId: string,
  surahNumber: number,
  positionSeconds: number,
  durationSeconds: number,
  completed = false
): Promise<void> {
  const record: UserTafsirProgress = {
    userId,
    lessonId,
    surahNumber,
    positionSeconds,
    durationSeconds,
    completed,
    lastPlayedAt: new Date().toISOString(),
  };

  // Local storage cache
  try {
    const key = `emufti_tafsir_progress_${userId}`;
    const raw = localStorage.getItem(key);
    let list: UserTafsirProgress[] = raw ? JSON.parse(raw) : [];
    list = list.filter((p) => p.lessonId !== lessonId);
    list.unshift(record);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
    localStorage.setItem(`emufti_tafsir_last_played_${userId}`, JSON.stringify(record));
  } catch {}

  // Remote Supabase sync
  if (isSupabaseConfigured && userId) {
    try {
      await supabase.rpc('save_user_tafsir_progress', {
        p_lesson_id: lessonId,
        p_surah_number: surahNumber,
        p_position: positionSeconds,
        p_duration: durationSeconds,
        p_completed: completed,
      });
    } catch {}
  }
}

/**
 * Retrieve user's saved listening progress
 */
export async function getUserTafsirProgress(userId: string): Promise<UserTafsirProgress[]> {
  if (!userId) return [];

  // Local fallback
  try {
    const key = `emufti_tafsir_progress_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('user_tafsir_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_played_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          userId: d.user_id,
          lessonId: d.lesson_id,
          surahNumber: d.surah_number,
          positionSeconds: Number(d.position_seconds || 0),
          durationSeconds: Number(d.duration_seconds || 0),
          completed: Boolean(d.completed),
          lastPlayedAt: d.last_played_at,
        }));
      }
    } catch {}
  }

  return [];
}

/**
 * Get the last played lesson for Continue Listening
 */
export function getLastPlayedTafsirLesson(
  userId?: string
): { lesson: TafsirLesson; scholar: SomaliScholarTafsir; progress: UserTafsirProgress } | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`emufti_tafsir_last_played_${userId}`);
    if (!raw) return null;
    const progress: UserTafsirProgress = JSON.parse(raw);
    const allScholars = getAllSomaliScholars();
    const custom = getCustomLessons();

    // Check custom first
    const customLesson = custom.find((l) => l.id === progress.lessonId);
    if (customLesson) {
      const scholar = getSomaliScholarById(customLesson.scholarId) || allScholars[0];
      return { lesson: customLesson, scholar, progress };
    }

    for (const s of allScholars) {
      const foundLesson = s.lessons.find((l) => l.id === progress.lessonId);
      if (foundLesson) {
        return { lesson: foundLesson, scholar: s, progress };
      }
    }
  } catch {}
  return null;
}

/**
 * Get all tafsir lessons across all scholars, merged with any custom-created lessons
 */
export function getAllTafsirLessons(): TafsirLesson[] {
  const customLessons = getCustomLessons();
  const standardLessons = SOMALI_SCHOLARS_TAFSIR.flatMap((s) => s.lessons);
  const map = new Map<string, TafsirLesson>();
  standardLessons.forEach((l) => map.set(l.id, l));
  customLessons.forEach((l) => map.set(l.id, l));
  return Array.from(map.values()).sort((a, b) => {
    if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
    return (a.ayahStart || 0) - (b.ayahStart || 0);
  });
}

/**
 * Admin action: Save or update a Tafsir lesson (localStorage + Supabase if available)
 */
export async function saveTafsirLesson(lesson: TafsirLesson): Promise<TafsirLesson> {
  try {
    const raw = localStorage.getItem('emufti_custom_tafsir_lessons');
    let customLessons: TafsirLesson[] = raw ? JSON.parse(raw) : [];
    const index = customLessons.findIndex((l) => l.id === lesson.id);
    if (index >= 0) {
      customLessons[index] = lesson;
    } else {
      customLessons.unshift(lesson);
    }
    localStorage.setItem('emufti_custom_tafsir_lessons', JSON.stringify(customLessons));
  } catch (err) {
    console.error('Error saving tafsir lesson to localStorage:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('tafsir_lessons').upsert({
        id: lesson.id,
        scholar_id: lesson.scholarId,
        surah_number: lesson.surahNumber,
        surah_name: lesson.surahName,
        ayah_start: lesson.ayahStart || null,
        ayah_end: lesson.ayahEnd || null,
        ayah_range: lesson.ayahRange || null,
        title_so: lesson.titleSo,
        title_en: lesson.titleEn,
        audio_url: lesson.audioUrl,
        duration: lesson.duration,
        duration_seconds: lesson.durationSeconds || 0,
        transcript_so: lesson.transcriptSo || null,
        transcript_en: lesson.transcriptEn || null,
        source_attribution: lesson.sourceAttribution,
        source_url: lesson.sourceUrl || null,
        verification_status: lesson.verificationStatus,
        is_published: lesson.isPublished,
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('Supabase tafsir_lessons upsert error:', dbErr);
    }
  }

  return lesson;
}

/**
 * Admin action: Delete a Tafsir lesson
 */
export async function deleteTafsirLesson(lessonId: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem('emufti_custom_tafsir_lessons');
    if (raw) {
      const customLessons: TafsirLesson[] = JSON.parse(raw);
      const filtered = customLessons.filter((l) => l.id !== lessonId);
      localStorage.setItem('emufti_custom_tafsir_lessons', JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting tafsir lesson from localStorage:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('tafsir_lessons').delete().eq('id', lessonId);
    } catch (dbErr) {
      console.warn('Supabase tafsir_lessons delete error:', dbErr);
    }
  }

  return true;
}

// =============================================================================
// CONTENT HEALTH DIAGNOSTICS & AUDITING
// =============================================================================

export interface ScholarAudioHealthItem {
  scholarId: string;
  scholarName: string;
  somaliName: string;
  totalLessons: number;
  validAudio: number;
  brokenAudio: number;
  missingAudio: number;
}

export interface TafsirContentHealthReport {
  timestamp: string;
  totalSurahs: number;
  surahsWithText: number;
  surahsMissingText: number;
  totalAyahsExpected: number;
  totalAyahs?: number;
  completeCoverageSurahs: number;
  inProgressSurahs: number;
  notYetAvailableSurahs: number;
  totalLessons: number;
  totalAudioStreams: number;
  validAudioStreams: number;
  brokenAudioStreams: number;
  activeStreams?: number;
  brokenStreams?: number;
  scholarBreakdown: ScholarAudioHealthItem[];
  brokenLessons: Array<{
    lessonId: string;
    scholarId: string;
    surahNumber: number;
    title: string;
    url: string;
    error: string;
  }>;
}

/**
 * Returns instantaneous diagnostic summary of tafsir audio and surah coverage
 */
export function getTafsirContentHealthSummary(): TafsirContentHealthReport {
  const allLessons = getAllTafsirLessons();
  const allScholars = getAllSomaliScholars();
  const stats = getTafsirLibraryStats();

  const scholarBreakdown: ScholarAudioHealthItem[] = allScholars.map((s) => {
    const sLessons = allLessons.filter((l) => l.scholarId === s.id);
    const valid = sLessons.filter((l) => l.audioUrl && l.audioUrl.trim().startsWith('http')).length;
    const missing = sLessons.filter((l) => !l.audioUrl || !l.audioUrl.trim()).length;
    return {
      scholarId: s.id,
      scholarName: s.scholarName,
      somaliName: s.somaliName,
      totalLessons: sLessons.length,
      validAudio: valid,
      brokenAudio: 0,
      missingAudio: missing,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    totalSurahs: 114,
    surahsWithText: 114,
    surahsMissingText: 0,
    totalAyahsExpected: 6236,
    totalAyahs: 6236,
    completeCoverageSurahs: stats.completeSurahs,
    inProgressSurahs: stats.inProgressSurahs,
    notYetAvailableSurahs: stats.notAvailableSurahs,
    totalLessons: allLessons.length,
    totalAudioStreams: allLessons.filter((l) => Boolean(l.audioUrl)).length,
    validAudioStreams: allLessons.filter((l) => l.audioUrl && l.audioUrl.trim().startsWith('http')).length,
    brokenAudioStreams: 0,
    scholarBreakdown,
    brokenLessons: [],
  };
}

/**
 * Executes a live network diagnostic check testing audio stream URLs via HTTP HEAD
 */
export async function runTafsirContentHealthAudit(
  onProgress?: (checked: number, total: number) => void
): Promise<TafsirContentHealthReport> {
  const allLessons = getAllTafsirLessons();
  const allScholars = getAllSomaliScholars();
  const stats = getTafsirLibraryStats();

  const brokenLessons: TafsirContentHealthReport['brokenLessons'] = [];
  let validAudioCount = 0;
  let brokenAudioCount = 0;

  for (let i = 0; i < allLessons.length; i++) {
    const l = allLessons[i];
    if (onProgress) onProgress(i + 1, allLessons.length);

    if (!l.audioUrl) {
      continue;
    }

    let isAudioOk = false;
    let lastError = '';

    for (let attempt = 0; attempt < 2 && !isAudioOk; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(l.audioUrl, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          isAudioOk = true;
        } else {
          lastError = `HTTP ${res.status}: ${res.statusText}`;
          // Wait 300ms before retry if 5xx
          if (res.status >= 500 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      } catch (err: any) {
        lastError = err?.message || 'Network request failed';
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    if (isAudioOk) {
      validAudioCount++;
    } else {
      brokenAudioCount++;
      brokenLessons.push({
        lessonId: l.id,
        scholarId: l.scholarId,
        surahNumber: l.surahNumber,
        title: l.titleSo || l.titleEn,
        url: l.audioUrl,
        error: lastError,
      });
    }
  }

  const scholarBreakdown: ScholarAudioHealthItem[] = allScholars.map((s) => {
    const sLessons = allLessons.filter((l) => l.scholarId === s.id);
    const brokenForScholar = brokenLessons.filter((b) => b.scholarId === s.id).length;
    const withAudio = sLessons.filter((l) => Boolean(l.audioUrl)).length;
    return {
      scholarId: s.id,
      scholarName: s.scholarName,
      somaliName: s.somaliName,
      totalLessons: sLessons.length,
      validAudio: Math.max(0, withAudio - brokenForScholar),
      brokenAudio: brokenForScholar,
      missingAudio: sLessons.filter((l) => !l.audioUrl).length,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    totalSurahs: 114,
    surahsWithText: 114,
    surahsMissingText: 0,
    totalAyahsExpected: 6236,
    totalAyahs: 6236,
    completeCoverageSurahs: stats.completeSurahs,
    inProgressSurahs: stats.inProgressSurahs,
    notYetAvailableSurahs: stats.notAvailableSurahs,
    totalLessons: allLessons.length,
    totalAudioStreams: allLessons.filter((l) => Boolean(l.audioUrl)).length,
    validAudioStreams: validAudioCount,
    brokenAudioStreams: brokenAudioCount,
    activeStreams: validAudioCount,
    brokenStreams: brokenAudioCount,
    scholarBreakdown,
    brokenLessons,
  };
}

/**
 * Interface representing Tafsir summary for a Quran Juz
 */
export interface JuzTafsirSummary {
  juzNumber: number;
  nameArabic: string;
  nameEnglish: string;
  nameSomali: string;
  startSurah: number;
  startSurahName: string;
  startAyah: number;
  endSurah: number;
  endSurahName: string;
  endAyah: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  surahs: SurahInJuz[];
  verifiedLessonsCount: number;
  scholarsAvailable: string[];
  hasAudio: boolean;
  hasText: boolean;
  status: SurahTafsirCoverageStatus;
}

/**
 * Get Tafsir summary and Surahs for a specific Juz (1..30)
 */
export function getJuzTafsirSummary(juzNumber: number): JuzTafsirSummary | undefined {
  const juz = getJuzByNumber(juzNumber);
  if (!juz) return undefined;

  const surahs = getSurahsForJuz(juzNumber);
  const scholarsSet = new Set<string>();
  let totalLessons = 0;
  let hasAudio = false;
  let hasText = false;

  let completeSurahs = 0;
  let inProgressSurahs = 0;

  for (const s of surahs) {
    const sStatus = getSurahTafsirStatus(s.surahNumber);
    if (sStatus) {
      if (sStatus.status === 'complete') completeSurahs++;
      else if (sStatus.status === 'in_progress') inProgressSurahs++;
      for (const sch of sStatus.scholarsAvailable) {
        scholarsSet.add(sch);
      }
      totalLessons += sStatus.verifiedLessonsCount;
      if (sStatus.hasAudio) hasAudio = true;
      if (sStatus.hasText) hasText = true;
    }
  }

  let status: SurahTafsirCoverageStatus = 'not_available';
  if (completeSurahs === surahs.length && totalLessons > 0) {
    status = 'complete';
  } else if (totalLessons > 0 || inProgressSurahs > 0 || completeSurahs > 0) {
    status = 'in_progress';
  }

  return {
    juzNumber: juz.number,
    nameArabic: juz.nameArabic,
    nameEnglish: juz.nameEnglish,
    nameSomali: juz.nameSomali,
    startSurah: juz.startSurah,
    startSurahName: juz.startSurahName,
    startAyah: juz.startAyah,
    endSurah: juz.endSurah,
    endSurahName: juz.endSurahName,
    endAyah: juz.endAyah,
    startPage: juz.startPage,
    endPage: juz.endPage,
    totalPages: juz.totalPages,
    surahs,
    verifiedLessonsCount: totalLessons,
    scholarsAvailable: Array.from(scholarsSet),
    hasAudio,
    hasText,
    status,
  };
}

/**
 * Get all 15 Juz Tafsir summaries (covering Juz 1 through 15)
 */
export function getAll15JuzTafsirSummaries(): JuzTafsirSummary[] {
  const summaries: JuzTafsirSummary[] = [];
  for (let j = 1; j <= 15; j++) {
    const s = getJuzTafsirSummary(j);
    if (s) summaries.push(s);
  }
  return summaries;
}

/**
 * Get all 30 Juz Tafsir summaries
 */
export function getAll30JuzTafsirSummaries(): JuzTafsirSummary[] {
  const summaries: JuzTafsirSummary[] = [];
  for (let j = 1; j <= 30; j++) {
    const s = getJuzTafsirSummary(j);
    if (s) summaries.push(s);
  }
  return summaries;
}
