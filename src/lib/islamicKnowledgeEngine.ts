// EMufti AI — Universal Islamic Knowledge & Verified Source Grounding Engine
// Provides structured retrieval across the Quran, Hadith corpus, Fiqh, Aqeedah,
// Family law, Worship, Seerah, and Islamic ethics in Somali, Arabic, and English.

import { SOMALI_SCHOLARS_TAFSIR } from '../data/tafsirData.ts';
import { ALL_114_SURAHS } from '../data/quranMetadata.ts';

export interface QuranVerse {
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  ayahNumber: number | string;
  arabicText: string;
  translationEn: string;
  translationSo: string;
  theme: string;
}

export interface HadithNarrative {
  collection: string;
  number: string | number;
  arabicText?: string;
  englishMatn: string;
  somaliMatn: string;
  narrator?: string;
  grading: 'Sahih' | 'Hasan' | 'Muttafaq Alayh';
  topic: string;
}

export interface FiqhConcept {
  id: string;
  topic: string;
  titleEn: string;
  titleSo: string;
  titleAr: string;
  keywords: string[];
  principlesEn: string;
  principlesSo: string;
  principlesAr: string;
  evidenceVerses: string[];
  evidenceHadiths: string[];
  scholarlyViews?: {
    hanafi?: string;
    maliki?: string;
    shafii?: string;
    hanbali?: string;
    consensus?: string;
  };
}

// -----------------------------------------------------------------------------
// VERIFIED QURANIC CANON (High-Frequency Thematic Passages)
// -----------------------------------------------------------------------------
export const VERIFIED_QURAN_DATABASE: QuranVerse[] = [
  {
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    ayahNumber: '1-7',
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ * الرَّحْمَٰنِ الرَّحِيمِ * مَالِكِ يَوْمِ الدِّينِ...',
    translationEn: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds...',
    translationSo: 'Magaca Eebbe yaan ku bilaabaynaa ee Naxariis guud iyo mid gaaraba naxariista. Mahad oo dhan waxay u sugnaatay Eebbe ee Barbaariyaha caalamka...',
    theme: 'Tawheed, Worship, and Supplication',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    ayahNumber: 43,
    arabicText: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
    translationEn: 'And establish prayer and give zakah and bow with those who bow [in worship and obedience].',
    translationSo: 'Ooga salaadda oo bixiya zakada oo la rukuuca kuwa rukuucaya.',
    theme: 'Obligation of Salah and Zakat',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    ayahNumber: 183,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    translationEn: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.',
    translationSo: 'Kuwa xaqa rumeeyow waxaa laydinku waajibiyay soonka sidii loogu waajibiyay kuwii idinka horreeyay si aad u cabsataan.',
    theme: 'Obligation and Spiritual Purpose of Fasting (Sawm)',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    ayahNumber: 255,
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...',
    translationEn: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    translationSo: 'Alle ma jiro Ilaah kale oo xaq lagu caabudo Isaga mooyee, waana Noolaha Qayyuunka ah ee wax kasta maamula...',
    theme: 'Ayat al-Kursi — Supreme Sovereignty and Tawheed',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    ayahNumber: 275,
    arabicText: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
    translationEn: 'And Allah has permitted trade and has forbidden interest (riba).',
    translationSo: 'Ilaahay wuxuu xalaaleeyay ganacsiga wuxuuna xarrimay Ribada.',
    theme: 'Prohibition of Riba (Usury) and Legitimacy of Trade',
  },
  {
    surahNumber: 3,
    surahName: 'Ali \'Imran',
    surahNameAr: 'آل عمران',
    ayahNumber: 97,
    arabicText: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
    translationEn: 'And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way.',
    translationSo: 'Alle wuxuu dadka ku leeyahay inay Xajka u soo gutaan Beytka qofkii heli kara waddo uu ku tago.',
    theme: 'Obligation of Hajj for the Capable',
  },
  {
    surahNumber: 4,
    surahName: 'An-Nisa',
    surahNameAr: 'النساء',
    ayahNumber: 103,
    arabicText: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
    translationEn: 'Indeed, prayer has been decreed upon the believers a decree of specified times.',
    translationSo: 'Xaqiiqdii salaaddu waxay ku tahay mu\'miniinta faral waqtiyeysan.',
    theme: 'Prescribed Times of Salah',
  },
  {
    surahNumber: 4,
    surahName: 'An-Nisa',
    surahNameAr: 'النساء',
    ayahNumber: '11-12',
    arabicText: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ...',
    translationEn: 'Allah instructs you concerning your children: for the male, what is equal to the share of two females...',
    translationSo: 'Alle wuxuu idiin dardaarmayaa carruurtiinna: ninka qaybtiisu waa labo dumar qaybtood oo kale...',
    theme: 'Divine Laws of Inheritance (Mirath)',
  },
  {
    surahNumber: 5,
    surahName: 'Al-Ma\'idah',
    surahNameAr: 'المائدة',
    ayahNumber: 6,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ...',
    translationEn: 'O you who have believed, when you rise to [pray], wash your faces and your forearms to the elbows and wipe over your heads and wash your feet to the ankles...',
    translationSo: 'Kuwa xaqa rumeeyow! Markaad u kacaysaan salaadda, dhaqa wejiyadiinna iyo gacmihiinna ilaa xusullada, mariyana madaxyadiinna oo dhaqa lugahiinna ilaa canqowyada...',
    theme: 'Obligatory Pillars of Wudu and Purification (Taharah)',
  },
  {
    surahNumber: 9,
    surahName: 'At-Tawbah',
    surahNameAr: 'التوبة',
    ayahNumber: 60,
    arabicText: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ...',
    translationEn: 'Zakah expenditures are only for the poor and for the needy and for those employed to collect [zakah] and for bringing hearts together [for Islam] and for freeing captives and for those in debt and for the cause of Allah and for the [stranded] traveler...',
    translationSo: 'Zakada waxaa leh oo keliya: Fuqarada, Masaakiinta, Kuwa ka shaqeeya, Quluubtooda la soo dhoweynayo, Addoomada, Kuwa deyntu ku habsatay, Jidka Alle, iyo Socotada danta ku noqotay...',
    theme: 'The Eight Exclusive Recipients of Zakat',
  },
  {
    surahNumber: 29,
    surahName: 'Al-Ankabut',
    surahNameAr: 'العنكبوت',
    ayahNumber: 45,
    arabicText: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
    translationEn: 'Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.',
    translationSo: 'Xaqiiqdii salaaddu waxay ka reebtaa qofka xumaanta iyo waxa la noco, xuska Allena waa waxa ugu weyn.',
    theme: 'Moral and Spiritual Impact of Prayer',
  },
  {
    surahNumber: 30,
    surahName: 'Ar-Rum',
    surahNameAr: 'الروم',
    ayahNumber: 21,
    arabicText: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translationEn: 'And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.',
    translationSo: 'Calaamooyinkiisa waxaa ka mid ah inuu idiinka abuuray naftiinna ahaan xaasas si aad ugu xasishaan, dhexdiinnana yeelay kalgacal iyo naxariis.',
    theme: 'Sanctity of Marriage, Love, and Tranquility',
  },
  {
    surahNumber: 49,
    surahName: 'Al-Hujurat',
    surahNameAr: 'الحجرات',
    ayahNumber: 10,
    arabicText: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ',
    translationEn: 'The believers are but brothers, so make settlement between your brothers.',
    translationSo: 'Mu\'miniintu waa uun walaalo, ee heshiisiiya labadaada walaal dhexdooda.',
    theme: 'Islamic Brotherhood and Reconciliation',
  },
  {
    surahNumber: 51,
    surahName: 'Adh-Dhariyat',
    surahNameAr: 'الذاريات',
    ayahNumber: 56,
    arabicText: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
    translationEn: 'And I did not create the jinn and mankind except to worship Me.',
    translationSo: 'Uma aanan abuurin jinka iyo insiga inay I caabudaan mooyee.',
    theme: 'Fundamental Purpose of Human Existence — Worship',
  },
  {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    surahNameAr: 'الإخلاص',
    ayahNumber: '1-4',
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    translationEn: 'Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent."',
    translationSo: 'Dheh: Isagu Eebbe waa Mid Keliya, Eebbe waa kan loo baahdo ee aan cidi u baahnayn, Ma dhalin lamana dhalin, Eebbana ma jiro wax la mid ahi.',
    theme: 'Pure Monotheism (Tawheed al-Ikhlas)',
  },
  {
    surahNumber: 40,
    surahName: 'Ghafir',
    surahNameAr: 'غافر',
    ayahNumber: 60,
    arabicText: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ ۚ إِنَّ الَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِي سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ',
    translationEn: 'And your Lord says, "Call upon Me; I will respond to you. Indeed, those who disdain My worship will enter Hell [rendered] contemptible."',
    translationSo: 'Eebbihiin wuxuu yiri: I barya waan idin ajiibi doonaaye; kuwa iska weyneeya cibaadadayda waxay geli doonaan Jahannamo iyagoo dulleysan.',
    theme: 'Virtue and Obligation of Du\'a and Supplication',
  },
  {
    surahNumber: 66,
    surahName: 'At-Tahrim',
    surahNameAr: 'التحريم',
    ayahNumber: 8,
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا عَسَىٰ رَبُّكُمْ أَن يُكَفِّرَ عَنكُمْ سَيِّئَاتِكُمْ...',
    translationEn: 'O you who have believed, repent to Allah with sincere repentance. Perhaps your Lord will remove from you your misdeeds...',
    translationSo: 'Kuwa xaqa rumeeyow! U toobad keena Eebbe toobad dhab ah oo daacad ah, wuxuu Eebbihiin asturi doonaa xumaantiinna...',
    theme: 'Sincere Repentance (Tawbah Nasuh) and Forgiveness',
  },
  {
    surahNumber: 22,
    surahName: 'Al-Hajj',
    surahNameAr: 'الحج',
    ayahNumber: 27,
    arabicText: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ',
    translationEn: 'And proclaim to the people the Hajj [pilgrimage]; they will come to you on foot and on every lean camel; they will come from every distant pass.',
    translationSo: 'Ugu yeer dadka Xajka, waxay kuugu iman doonaan iyagoo lugaynaya iyo iyagoo fuushan hal kasta oo dhuuban oo ka imanaysa waddo kasta oo fog.',
    theme: 'Obligation and Universal Proclamation of Hajj',
  },
  {
    surahNumber: 67,
    surahName: 'Al-Mulk',
    surahNameAr: 'الملك',
    ayahNumber: '1-2',
    arabicText: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ * الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
    translationEn: 'Blessed is He in whose hand is dominion, and He is over all things competent — [He] who created death and life to test you [as to] which of you is best in deed — and He is the Exalted in Might, the Forgiving.',
    translationSo: 'Waxaa barakoobay oo weynaaday Eebaha xukunka koonka gacantiisa ku jiro, Isaguna wax kasta wuu karaa; Eebaha abuuray dhimashada iyo nolosha si uu idiin imtixaano midkiinna camal wanaagsan.',
    theme: 'Sovereignty of Allah, Creation of Life and Death, and Protection in the Grave (Surah Al-Mulk)',
  },
  {
    surahNumber: 67,
    surahName: 'Al-Mulk',
    surahNameAr: 'الملك',
    ayahNumber: 14,
    arabicText: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
    translationEn: 'Does He who created not know, while He is the Subtle, the Acquainted?',
    translationSo: 'Miyaanu garanayn kii wax abuuray, Isagoo ah Naxariiste xeeldheer oo wax walba xog-ogaal u ah?',
    theme: 'Divine All-Encompassing Knowledge and Subtlety (Al-Latif Al-Khabir)',
  },
  {
    surahNumber: 17,
    surahName: 'Al-Isra',
    surahNameAr: 'الإسراء',
    ayahNumber: '23-24',
    arabicText: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
    translationEn: 'And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], "uff," and do not repel them but speak to them a noble word.',
    translationSo: 'Eebbihiin wuxuu xukumay inaadnaan caabudin Isaga mooyee, labada waalidna u wanaag-fashaan. Haddii midkood ama labadoodaba ay agtaada ku gaboobaan, ha ku dhihin erey ciil ah (uff), hana canaanan ee kula hadal hadal sharaf leh.',
    theme: 'Dutifulness and Utmost Honor to Parents (Birr al-Walidayn)',
  },
  {
    surahNumber: 21,
    surahName: 'Al-Anbiya',
    surahNameAr: 'الأنبياء',
    ayahNumber: 87,
    arabicText: 'فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    translationEn: 'And he called out within the darknesses, "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
    translationSo: 'Wuxuuna kaga dhawaaqay mugdiyada dhexdeeda: Ilaah kale ma jiro Adiga mooyee, Xumaan oo dhan waad ka nasahan tahay, xaqiiqdiina waxaan ka mid ahaa kuwa gar-darraystay.',
    theme: 'Dua of Prophet Yunus for Relief from Distress and Sorrow (Du\'a al-Karb)',
  },
];

// -----------------------------------------------------------------------------
// AUTHENTIC HADITH CORPUS (Primary Sunni Collections)
// -----------------------------------------------------------------------------
export const VERIFIED_HADITH_DATABASE: HadithNarrative[] = [
  {
    collection: 'Sahih al-Bukhari',
    number: 1,
    narrator: 'Umar ibn al-Khattab',
    grading: 'Sahih',
    englishMatn: 'Actions are judged by motives, and each person will be rewarded according to what he intended.',
    somaliMatn: 'Camalladu waxay ku xiran yihiin niyadaha, qof kastaana wuxuu helayaa wixii uu niyaystay.',
    topic: 'Intention (An-Niyyah) in Worship and Deeds',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 8,
    narrator: 'Abdullah ibn Umar',
    grading: 'Sahih',
    englishMatn: 'Islam is built upon five: testifying that there is no god but Allah and Muhammad is the Messenger of Allah, establishing prayer, paying Zakat, the pilgrimage (Hajj), and fasting Ramadan.',
    somaliMatn: 'Islaamka waxaa lagu dhisay shan: Qirashada inaan Ilaah jirin aan Alle ahayn Maxammadna yahay Rasuulkiisa, Oogidda salaadda, Bixinta zakada, Xajka, iyo Soonka bisha Ramadaan.',
    topic: 'The Five Pillars of Islam (Arkaan al-Islam)',
  },
  {
    collection: 'Sahih Muslim',
    number: 8,
    narrator: 'Umar ibn al-Khattab',
    grading: 'Sahih',
    englishMatn: 'The Hadith of Jibril: Delineating Islam (actions), Iman (six articles of faith), and Ihsan (worshiping Allah as if you see Him).',
    somaliMatn: 'Xadiiskii Jibriil ee qeexayay heerarka diinta: Islaamka, Iimaanka (lixda tiir), iyo Ixsaanka (inaad Alle u caabuddo sidii adigoo arkaya).',
    topic: 'Levels of Religion: Islam, Iman, and Ihsan',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 52,
    narrator: 'An-Nu\'man ibn Bashir',
    grading: 'Sahih',
    englishMatn: 'That which is lawful is clear, and that which is unlawful is clear, and between the two of them are doubtful matters about which many people do not know.',
    somaliMatn: 'Xalaashu way caddahay, xaaraantuna way caddahay, labadooda dhexdoodana waxaa jira arrimo shaki leh oo dad badan aysan aqoon u lahayn.',
    topic: 'Halal, Haram, and Avoiding Doubtful Matters',
  },
  {
    collection: 'Jami\' at-Tirmidhi',
    number: 413,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'The first matter that the slave will be brought to account for on the Day of Judgment is prayer. If it is sound, then he has triumphed and succeeded.',
    somaliMatn: 'Waxa ugu horreeya ee addoonka xisaabtiisa laga bilaabayo Maalinta Qiyaamaha waa salaadda; haddii ay wanaagsanaato, wuu liibaanay oo guuleystay.',
    topic: 'Accountability of Salah on the Day of Judgment',
  },
  {
    collection: 'Sunan at-Tirmidhi',
    number: 2621,
    narrator: 'Buraydah ibn al-Hasib',
    grading: 'Sahih',
    englishMatn: 'The covenant between us and them is prayer; whoever abandons it has disbelieved.',
    somaliMatn: 'Ballanta inaga iyo iyaga noo dhaxaysa waa salaadda; qofkii ka tagaana wuu gaaloobay.',
    topic: 'Crucial Legal Obligation of Salah',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 1894,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'Fasting is a shield. When one of you is fasting, he should neither indulge in obscene language nor should he behave foolishly.',
    somaliMatn: 'Soonku waa gaashaan; markuu midkiin sooman yahay yuusan ku hadlin hadal xun, yuusanna ficil jaahilnimo samayn.',
    topic: 'Spiritual Discipline of Fasting (Sawm)',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 1773,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'An accepted pilgrimage (Hajj Mabrur) has no reward except Paradise.',
    somaliMatn: 'Xajka la aqbalo (Xaj al-Mabruur) abaalkiisu ma aha waxaan Jannada ahayn.',
    topic: 'Merit of Accepted Hajj',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 5063,
    narrator: 'Anas ibn Malik',
    grading: 'Sahih',
    englishMatn: 'Marriage is my sunnah, and whoever turns away from my sunnah is not of me.',
    somaliMatn: 'Guurku waa sunnadaydii, qofkii ka jeesta sunnadayda igama mid aha.',
    topic: 'Marriage as Prophetic Sunnah',
  },
  {
    collection: 'Jami\' at-Tirmidhi',
    number: 3895,
    narrator: 'Aisha',
    grading: 'Sahih',
    englishMatn: 'The best of you are those who are best to their families, and I am the best of you to my family.',
    somaliMatn: 'Kiinna ugu khayrka badan waa kan ugu khayrka badan reerkiisa, aniguna waxaan ahay ka idiinku khayrka badan reerkayga.',
    topic: 'Family Treatment and Domestic Kindness',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 5971,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'A man asked: "Who among people is most deserving of my fine companionship?" The Prophet replied: "Your mother, then your mother, then your mother, then your father."',
    somaliMatn: 'Nin baa weydiiyay Nabiga ﷺ: "Yaa dadka ugu xaq badan wanaaggayga?" Nabigu wuxuu yiri: "Hooyadaa, kaddibna hooyadaa, kaddibna hooyadaa, kaddibna aabbahaa."',
    topic: 'Dutifulness to Parents (Birr al-Walidayn)',
  },
  {
    collection: 'Sunan Ibn Majah',
    number: 224,
    narrator: 'Anas ibn Malik',
    grading: 'Hasan',
    englishMatn: 'Seeking knowledge is an obligation upon every Muslim.',
    somaliMatn: 'Doonista cilmiga diinta waa faral ku waajib ah qof kasta oo Muslim ah.',
    topic: 'Obligation of Seeking Religious Knowledge',
  },
  {
    collection: 'Sunan Abi Dawud',
    number: 1479,
    narrator: 'An-Nu\'man ibn Bashir',
    grading: 'Sahih',
    englishMatn: 'Supplication is worship itself.',
    somaliMatn: 'Ducadu waa cibaadada laf-dhaqarkeeda.',
    topic: 'Dua as Core Worship',
  },
  {
    collection: 'Sunan Ibn Majah',
    number: 4250,
    narrator: 'Abdullah ibn Mas\'ud',
    grading: 'Hasan',
    englishMatn: 'The one who repents from sin is like the one who had no sin.',
    somaliMatn: 'Qofka dambiga ka toobad keena wuxuu la mid yahay qof aan dambiba lahayn.',
    topic: 'Repentance (Tawbah) and Divine Forgiveness',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 3815,
    narrator: 'Ali ibn Abi Talib',
    grading: 'Sahih',
    englishMatn: 'The best of the women of her time was Maryam, and the best of the women of her time was Khadijah.',
    somaliMatn: 'Haweenka ugu khayrka badnaa xilligeeda waxay ahayd Maryam, haweenka ugu khayrka badnaa xilligeedana waxay ahayd Khadiija bintu Khuwaylid.',
    topic: 'Virtues of the Mothers of the Believers: Khadijah',
  },
  {
    collection: 'Jami\' at-Tirmidhi',
    number: 889,
    narrator: 'Abdur-Rahman ibn Ya\'mar',
    grading: 'Sahih',
    englishMatn: 'The Prophet ﷺ proclaimed: "Hajj is Arafah. Whoever arrives before Fajr prayer on the night of Muzdalifah, his Hajj is complete."',
    somaliMatn: 'Nabigu ﷺ wuxuu caddeeyay: "Xajku waa Carafo; qofkii soo gaara ka hor salaadda subax ee habeenka Muzdalifah, xajkiisu wuu dhammeystirmay."',
    topic: 'Standing at Arafah as the Paramount Pillar of Hajj',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 3820,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'Angel Jibril came to the Prophet ﷺ and said: "Convey peace to Khadijah from her Lord and from me, and give her glad tidings of a palace in Paradise of pearls with neither noise nor fatigue."',
    somaliMatn: 'Malag Jibriil ayaa u yimid Nabiga ﷺ wuxuuna yiri: "Khadiija gaarsii salaam Eebbeheeda iyo xaggayga ah, uguna bishaaree qasri Jannada ku yaal oo luul ka samaysan oo aan qeylo iyo daal lahayn."',
    topic: 'Sublime Status and Divine Greetings to Khadijah bint Khuwaylid',
  },
  {
    collection: 'Sahih Muslim',
    number: 1015,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'Allah is pure and accepts only what is pure... A man raises hands in du\'a, but his nourishment is haram: how can it be answered?',
    somaliMatn: 'Alle waa daahir mana aqbalo waxaan daahir ahayn... Qof baa gacmaha kor ugu taagaya duco, halka cuntadiisu xaaraan tahay: sidee loogu ajiibi karaa?',
    topic: 'Halal Consumption and Requisites of Answered Du\'a',
  },
  {
    collection: 'Jami\' at-Tirmidhi',
    number: 2891,
    narrator: 'Abu Hurairah',
    grading: 'Hasan',
    englishMatn: 'Indeed, there is a Surah of thirty verses that interceded for a man until he was forgiven: "Blessed is He in whose hand is dominion" (Surah Al-Mulk).',
    somaliMatn: 'Xaqiiqdii waxaa Quraanka ku jirta suurad ka kooban soddon aayadood oo nin u shafeeco qaadday ilaa loo dambi dhaafay: waa Suuradda Tabaarak (Al-Mulk). Waxay qofka ka badbaadisaa cadaabka qabriga.',
    topic: 'Virtue and Intercession of Surah Al-Mulk in the Grave',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 6306,
    narrator: 'Shaddad ibn Aws',
    grading: 'Sahih',
    englishMatn: 'The Master of seeking forgiveness (Sayyid al-Istighfar) is: "O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant..." Whoever recites it in the evening with conviction and dies enters Paradise, and similarly in the morning.',
    somaliMatn: 'Sayyidul Istiqfaar (Ducooyinka dambi-dhaafka madaxdooda) waa: "Allaahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa ana \'abduka..." Qofkii fiidkii akhriya isagoo yaqiinsan oo habeenkaas dhinta wuxuu galaa Jannada, qofkii subaxdii akhriyana sidoo kale.',
    topic: 'Master Supplication for Forgiveness (Sayyid al-Istighfar)',
  },
  {
    collection: 'Al-Muwatta',
    number: 1614,
    narrator: 'Abu Hurairah',
    grading: 'Sahih',
    englishMatn: 'The Messenger of Allah ﷺ said: "I was only sent to perfect noble character."',
    somaliMatn: 'Rasuulka Alle ﷺ wuxuu yiri: "Waxaa la ii soo diray uun inaan dhammeystiro akhlaaqda suubban."',
    topic: 'Noble Character (Makarim al-Akhlaaq) and Islamic Ethics',
  },
  {
    collection: 'Jami\' at-Tirmidhi',
    number: 1924,
    narrator: 'Abdullah ibn Amr',
    grading: 'Sahih',
    englishMatn: 'The Prophet ﷺ said: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will be merciful to you."',
    somaliMatn: 'Nabigu ﷺ wuxuu yiri: "Kuwa dadka u naxariista waxaa u naxariisanaya Eebaha Naxariistaha ah. U naxariista kuwa dhulka jooga si uu idiinku naxariisto Kan samada jooga."',
    topic: 'Universal Mercy (Ar-Rahmah) in Islam',
  },
  {
    collection: 'Sahih al-Bukhari',
    number: 6345,
    narrator: 'Abdullah ibn Abbas',
    grading: 'Sahih',
    englishMatn: 'The Prophet ﷺ used to supplicate at times of grief and distress (Du\'a al-Karb): "There is no deity except Allah, the Great, the Forbearing; there is no deity except Allah, Lord of the Magnificent Throne..."',
    somaliMatn: 'Nabigu ﷺ marka uu dhib, welwel ama murugo la kulmo wuxuu dhihi jiray (Ducada Al-Karb): "Laa ilaaha illallaahul Cadhiimul Xaliim, laa ilaaha illallaahu Rabbul Carshil Cadhiim, laa ilaaha illallaahu Rabbus-samaawaati wa Rabbul ardi wa Rabbul Carshil Kariim."',
    topic: 'Supplication for Grief, Distress and Anxiety (Du\'a al-Karb)',
  },
  {
    collection: 'Sunan Abi Dawud',
    number: 5088,
    narrator: 'Uthman ibn Affan',
    grading: 'Sahih',
    englishMatn: 'Whoever recites three times every morning and evening: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing" — nothing will harm him.',
    somaliMatn: 'Qofkii subax kasta iyo fiid kasta seddex jeer yiraahda: "Bismillaahilladii laa yadurru ma\'asmihii shay\'un fil ardi walaa fis-samaa\'i wahuwas-Samii\'ul \'Aliim", wax dhibaato ah ma gaari doonaan.',
    topic: 'Morning and Evening Daily Protective Adhkar (Adhkar as-Sabah wa-l-Masa\')',
  },
];

// -----------------------------------------------------------------------------
// FIQH & THEOLOGICAL TOPIC REPOSITORY (Comprehensive Sunni Consensus & Ikhtilaf)
// -----------------------------------------------------------------------------
export const FIQH_TOPICS_DATABASE: FiqhConcept[] = [
  {
    id: 'wudu_nullifiers',
    topic: 'taharah_wudu',
    titleEn: 'Nullifiers of Wudu (Nawāqid al-Wuḍū\')',
    titleSo: 'Waxyaabaha Buriya / Jabiya Weesada (Nawaaqidul Wuduu)',
    titleAr: 'نواقض الوضوء في الفقه الإسلامي',
    keywords: ['weeso', 'wudu', 'jabinaya', 'jebiya', 'buriya', 'burinaya', 'nullifier', 'invalidates', 'break wudu', 'نواقض', 'الوضوء', 'يبطل'],
    principlesSo: `Culimada fiqiga waxay isku raacsan yihiin in weesadu ku burto waxyaabo go'an:
1. **Wax kasta oo ka soo baxa labada dariiq (hore iyo dambe):** Kaadida, saxarada, dabaysha, dhiigga, ama dheecaannada kale [Surah An-Nisa 4:43].
2. **Hurdo culus oo dareenka lumisa:** Hurdada aan qofka fadhigiisu sugneyn ee ka kaxaysa dareenka.
3. **Miyir-beelka:** Suuxdinta, waallida, ama daawooyinka caqliga kaxeeya.
4. **Taabashada xubinta taranka iyadoo aan waxba u dhexeynin:** Sida ku cad xadiiska Nabiga ﷺ: "Qofkii taabta xubintiisa taranka ha weeseysto" [Sunan Abi Dawud 181 - Saxiix].
5. **Kala duwanaanshaha Madhabaha (Ikhtilaaf):**
   - *Taabashada haweeney aan maxram ahayn:* Madhabta Shaaficiyadu waxay qabtaa inay weesada jebiso xitaa haddii aysan shahwo wehelin, halka Xanafiyadu qabto inaysan jebinayn, Maalikiyada iyo Xanbaliyaduna ay shardi ka dhigaan jiritaanka dareenka shahwada.
   - *Cunista hilibka geela:* Madhabta Xanbaliyadu waxay qabtaa inay weesadu ku jabto [Sahih Muslim 360], halka jumhuurka culimadu qabaan inaysan burinayn.`,
    principlesEn: `Scholars have outlined the verified nullifiers of ritual ablution (Wudu):
1. **Anything exiting the two private passages:** Urine, feces, passing wind, or other emissions [Surah An-Nisa 4:43].
2. **Deep sleep:** Sleep wherein awareness is completely lost and posture is relaxed.
3. **Loss of consciousness:** Through fainting, intoxication, medication, or severe illness.
4. **Direct contact with the private parts without barrier:** As stated in the Hadith: "Whoever touches his private parts, let him perform wudu" [Sunan Abi Dawud 181 - Sahih].
5. **Scholarly Differences (Ikhtilaf):**
   - *Touching a non-mahram person of the opposite sex:* Shafi'i madhhab holds it breaks wudu unconditionally; Hanafi holds it does not; Maliki and Hanbali condition it upon feelings of physical desire.
   - *Eating camel meat:* Hanbali madhhab holds it invalidates wudu based on [Sahih Muslim 360]; majority hold it does not.`,
    principlesAr: `نواقض الوضوء المتفق عليها والمختلف فيها بين أئمة الفقه:
1. **الخارج من السبيلين:** بول، غائط، ريح، أو مذي بإجماع العلماء.
2. **زوال العقل أو تغطيته:** بجنون أو إغماء أو سكر أو نوم مستغرق لا تمكن فيه للمقعدة.
3. **مس الفرج باليد مباشرة دون حائل:** لقوله ﷺ: «مَن مسَّ ذَكَرَهُ فلْيَتَوَضَّأْ» [سنن أبي داود 181].
4. **مسائل الخلاف الفقهي:**
   - *لمس المرأة الأجنبية:* الشافعية يرون نقض الوضوء مطلقاً، الحنفية لا يرون النقض إلا بالمباشرة الفاحشة، والمالكية والحنابلة يقيدونه بلذة.
   - *أكل لحم الإبل:* الحنابلة يوجبون الوضوء لحديث جابر في صحيح مسلم، والجمهور يستحبونه ولا يوجبونه.`,
    evidenceVerses: ['[Surah An-Nisa 4:43]', '[Surah Al-Ma\'idah 5:6]'],
    evidenceHadiths: ['[Sunan Abi Dawud 181, Saxiix]', '[Sahih Muslim 360]'],
  },
  {
    id: 'tawheed_pillars',
    topic: 'aqeedah_tawheed',
    titleEn: 'Tawheed and Its Three Foundational Branches',
    titleSo: 'Towxiidka iyo Saddexda Qaybood ee Caqiidada Islaamka',
    titleAr: 'التوحيد وأقسامه الثلاثة في العقيدة الإسلامية',
    keywords: ['towxiid', 'tawhiid', 'tawheed', 'aqeedah', 'caqiido', 'shirk', 'shirki', 'rububiyyah', 'uluhiyyah', 'asma', 'iimaan', 'iman', 'التوحيد', 'العقيدة', 'الشرك'],
    principlesSo: `Towxiidku waa tiirka ugu weyn ee diinta Islaamka, waana ujeeddada Alle u abuuray jinka iyo insiga [Surah Adh-Dhariyat 51:56]. Culimada caqiidadu waxay Towxiidka u qaybiyeen saddex qaybood oo is-dhammaystiraya:
1. **Towxiidul Rubuubiyyah (Keliyeynta Abuurista & Maamulka):** In la rumeeyo in Alle yahay Abuuraha keliya, Maamulaha koonka, Biyaha iyo Risqiga bixiya, ee aan lahayn cid wax la wadaagta [Surah Az-Zumar 39:62].
2. **Towxiidul Uluuhiyyah (Keliyeynta Cibaadada):** In dhammaan ficillada cibaadada (sida salaadda, ducada, gawraca, nadarka, rajada, iyo cabsida) loo gaar yeelo Alle keliya, iyadoo aan cidna lala wadaajin. Tani waa asalka ay u yimaadeen dhammaan rususha [Surah An-Nahl 16:36].
3. **Towxiidul Asmaa was-Sifaat (Magacyada iyo Tilmaamaha Alle):** In la rumeeyo dhammaan magacyada wanaagsan iyo tilmaamaha suubban ee Alle naftiisa u sugay Quraanka ama uu Nabigu ﷺ ku sheegay xadiisyada saxda ah, iyadoo aan la leexin (Tahriif), la diidin (Tacdiil), la cayimin sida ay yihiin (Takyif), ama cidna lala barbardhigin (Tamthiil) [Surah Ash-Shura 42:11].
- **Shirka (Liddiisa):** Shirku waa in wax lala wadaajiyo Alle, waana dambiga keliya ee uusan Alle cafin haddii aan laga toobad keenin inta la nool yahay [Surah An-Nisa 4:48].`,
    principlesEn: `Tawheed (Islamic Monotheism) represents the supreme foundation of Islam and the core purpose of creation [Surah Adh-Dhariyat 51:56]. Classical scholars categorize Tawheed into three interrelated branches:
1. **Tawheed ar-Rububiyyah (Oneness of Lordship):** Believing that Allah alone is the Creator, Sustainer, Provider, and Sovereign of all existence [Surah Az-Zumar 39:62].
2. **Tawheed al-Uluhiyyah (Oneness of Worship):** Directing every act of devotion—prayer, supplication, sacrifice, reliance, and hope—exclusively to Allah alone. This was the principal mission of every Prophet [Surah An-Nahl 16:36].
3. **Tawheed al-Asma wa as-Sifat (Oneness of Divine Names and Attributes):** Affirming the Names and Attributes Allah affirmed for Himself in the Quran and authentic Sunnah, without distortion (tahrīf), negation (ta'ṭīl), probing their nature (takyīf), or likening Him to creation (tamthīl) [Surah Ash-Shura 42:11].
- **Shirk:** The antithesis of Tawheed is associating partners with Allah, described in the Quran as the gravest injustice and unforgivable without repentance [Surah An-Nisa 4:48].`,
    principlesAr: `التوحيد هو إفراد الله تعالى بما يختص به من الربوبية والألوهية والأسماء والصفات:
1. **توحيد الربوبية:** إفراد الله بأفعاله؛ كالخلق والرزق والإحياء والإماتة والتدبير ﴿اللَّهُ خَالِقُ كُلِّ شَيْءٍ﴾ [الزمر: 62].
2. **توحيد الألوهية:** إفراد الله بأفعال العباد التعبدية؛ كالصلاة، والدعاء، والنذر، والذبح، والرجاء، والتوكل ﴿وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَّسُولًا أَنِ اعْبُدُوا اللَّهَ وَاجْتَنِبُوا الطَّاغُوتَ﴾ [النحل: 36].
3. **توحيد الأسماء والصفات:** إثبات ما أثبته الله لنفسه في كتابه أو أثبته له رسوله ﷺ من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل ﴿لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ﴾ [الشورى: 11].
- **الشرك:** أعظم الذنوب، ومحبط لجميع الأعمال لمن مات عليه بلا توبة ﴿إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ﴾ [النساء: 48].`,
    evidenceVerses: ['[Surah Adh-Dhariyat 51:56]', '[Surah Al-Ikhlas 112:1-4]', '[Surah Ash-Shura 42:11]', '[Surah An-Nisa 4:48]'],
    evidenceHadiths: ['[Sahih al-Bukhari 7372]', '[Sahih Muslim 30]'],
  },
  {
    id: 'fasting_sawm_rules',
    topic: 'worship_fasting',
    titleEn: 'Rulings, Pillars, and Exemptions of Fasting (Sawm)',
    titleSo: 'Axkaamta, Tiirarka, iyo Waxyaabaha Jebiya Soonka (As-Sawm)',
    titleAr: 'أحكام الصيام، أركانه، ومفطراته في الشريعة',
    keywords: ['soon', 'soonka', 'ramadaan', 'ramadan', 'sawm', 'afur', 'saxuur', 'jebiya', 'buriya', 'invalidates fast', 'fasting', 'الصيام', 'رمضان', 'المفطرات'],
    principlesSo: `Soonka (As-Sawm) waa rukunka 4-aad ee Islaamka, waana ka joogsashada waxyaabaha cunto, cabbis, iyo shahwo ah laga bilaabo dillaaca waaberiga ilaa qorrax-u-dhaca iyadoo niyaddu jirto.
1. **Tiirarka Soonka:**
   - **Niyadda:** Qalbiga ka go'aansashada soonka habeenkii ka hor inta uusan waaberigu dillaacin [Sunan at-Tirmidhi 730].
   - **Ka-joogsashada (Al-Imsaak):** Ka joogsashada cunidda, cabbitaanka, iyo galmada laga bilaabo Fajarka ilaa Maghribka [Surah Al-Baqarah 2:187].
2. **Waxyaabaha Soonka Jebiya:**
   - Wax kasta oo gaara caloosha xagga afka ama sanka si ku talagal ah.
   - Galmada maalintii Ramadaanka (waxay leedahay kafaaro culus: xorayn addoon, ama 2 bilood oo isku xigta oo soon ah, ama quudinta 60 miskiin).
   - Matag ku talagal ah (haddii uu ku qasbo ma jebiyo sida xadiisku sheegay).
   - Dhiigga dheddignimada (Xaydka ama Dhiig-baxa dhalmada/Nifaaska).
3. **Dadka Loo Oggol Yahay Inay Afuraan:**
   - Qofka bukaanka ah ama socotada safarka dheer ku jira (waxay dib ka qallaynayaan maalmey afureen) [Surah Al-Baqarah 2:185].
   - Qofka waayeelka ah ee aan awoodin ama qofka qaba xanuun aan laga bogsanayn (wuxuu bixinayaa Fidyo: quudinta hal miskiin maalin kasta).
   - Haweenka uurka leh ama kuwa nuujinaya haddii ay naftooda ama ilmaha u baqaan.`,
    principlesEn: `Fasting (Sawm) during Ramadan constitutes the 4th pillar of Islam, entailing abstinence from all food, drink, and marital relations from true dawn until sunset with pure intention.
1. **Core Pillars:**
   - **Niyyah (Intention):** Established from the night prior to dawn [Sunan at-Tirmidhi 730].
   - **Imsak (Abstinence):** Complete refrainment from dawn until sunset [Surah Al-Baqarah 2:187].
2. **Invalidators of Fasting:**
   - Intentional eating, drinking, or nutritional intake through nasal or IV routes.
   - Marital intercourse during the day of Ramadan (incurs major expiation / kaffarah).
   - Deliberate vomiting; unintentional vomiting does not break the fast.
   - Menstrual or postnatal bleeding (fast is invalid and must be made up).
3. **Valid Religious Concessions:**
   - The ill and travelers may break fast and make up missed days (*qada'*) [Surah Al-Baqarah 2:185].
   - The elderly and chronically ill pay fidyah (feeding one needy person per day).
   - Pregnant and nursing mothers may postpone fasting if health or child well-being is at risk.`,
    principlesAr: `الصيام فريضة وركن من أركان الإسلام الخمسة:
1. **أركان الصيام:** النية قبل طلوع الفجر، والإمساك عن جميع المفطرات من طلوع الفجر إلى غروب الشمس.
2. **مبطلات الصيام:** الأكل والشرب عمداً، الجماع (ويوجب القضاء والكفارة المغلظة)، القيء عمداً، خروج دم الحيض والنفاس.
3. **أصحاب الأعذار:** المريض والمسافر يقضيان، العاجز هرماً أو لمرض لا يُرجى برؤه يُطعم مسكيناً عن كل يوم (فدية)، الحامل والمرضع إذا خافتا على نفسيهما أو ولديهما.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:183]', '[Surah Al-Baqarah 2:185]', '[Surah Al-Baqarah 2:187]'],
    evidenceHadiths: ['[Sahih al-Bukhari 1894]', '[Sahih Muslim 1151]', '[Sunan at-Tirmidhi 730]'],
  },
  {
    id: 'nikah_marriage_pillars',
    topic: 'family_marriage',
    titleEn: 'Pillars and Conditions of Valid Islamic Marriage (Nikāḥ)',
    titleSo: 'Tiirarka iyo Shuruudaha Guurka Saxiixa ah ee Islaamka (Nikax)',
    titleAr: 'أركان وشروط عقد النكاح الصحيح في الإسلام',
    keywords: ['guur', 'guurka', 'nikax', 'nikah', 'meher', 'wali', 'waliga', 'marriage', 'furiin', 'talaq', 'dower', 'النكاح', 'الزواج', 'المهر', 'الولي'],
    principlesSo: `Guurka Islaamku waa heshiis barakaysan oo sharaf leh oo xalaaleeya xiriirka labada qof. Si uu guurku u noqdo mid ansax ah oo sharci ah, waa in la helaa tiirarka iyo shuruudaha soo socda:
1. **Rallinimo Labada Qof (Is-ogolaansho):** In ninka iyo gabadhu ay labaduba si xor ah u oggolaadaan guurka iyadoo aan khasab jirin.
2. **Waliga Gabadha (Al-Wali):** In aabbaha ama mas'uulka sharciga ah ee gabadhu bixiyo gabadha, sida uu Nabigu ﷺ yiri: "Ma jiro guur aan wali lahayn" [Sunan Abi Dawud 2085, Jami' at-Tirmidhi 1101 - Saxiix].
3. **Laba Markhaati oo Caadil ah:** Laba marag oo Muslimiin ah oo caqli iyo caddaalad leh inay joogaan meherka.
4. **Meherka (Al-Mahr / As-Sadaaq):** Meherku waa xaqa gaarka ah ee gabadha uu ninku siinayo, waxaana lagu dhiirigeliyay in meherka la fududeeyo oo aan la cuslayn [Surah An-Nisa 4:4].
5. **Ijaab iyo Qabuul:** Erayada heshiiska ee afka laga sheegayo (Bixinta waliga iyo Ogolaanshaha ninka).
6. **Xor ka noqoshada caqabadaha sharciga ah:** Inaanay jirin wax qaraabo ama dhiig ah oo guurka xarrimaya (sida walaalaha nuugmada ama kuwa dhalashada).`,
    principlesEn: `Islamic marriage (Nikāḥ) is a sacred, legally binding covenant. For a marriage contract to be religiously valid, specific essential pillars and conditions must be fulfilled:
1. **Mutual Consent:** Both bride and groom must willingly consent without coercion.
2. **The Bride\'s Legal Guardian (Al-Wali):** The permission and representation of the guardian (father or legal mahram guardian) as mandated by the Prophet ﷺ: "There is no marriage without a wali" [Sunan Abi Dawud 2085, Jami' at-Tirmidhi 1101 - Sahih].
3. **Two Upright Witnesses:** Two sane, adult Muslim witnesses present during the solemnization.
4. **The Dowry (Al-Mahr):** The exclusive financial or material gift given from the groom directly to the bride [Surah An-Nisa 4:4]; moderation in dowry is strongly encouraged.
5. **Offer and Acceptance (Ijab and Qabul):** Clear, spoken verbal agreement between the guardian and groom.
6. **Absence of Legal Impediments:** Ensuring no prohibitive ties exist (such as fosterage/milk kinship, existing four wives, or non-permissible lineages).`,
    principlesAr: `أركان وشروط صحة عقد النكاح في الشريعة الإسلامية:
1. **الصيغة (الإيجاب والقبول):** لفظ دال على الرضا بالزواج.
2. **الولي:** إذن ولي المرأة لقول النبي ﷺ: «لا نِكاحَ إلَّا بوَليٍّ» [سنن أبي داود 2085، جامع الترمذي 1101].
3. **الشاهدان العدلان:** لقوله ﷺ: «لا نكاح إلا بولي وشاهدي عدل».
4. **المهر (الصداق):** حق خالص للمرأة ﴿وَآتُوا النِّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً﴾ [النساء: 4].
5. **خلو الزوجين من الموانع الشرعية:** كالقرابة المحرمة، والرضاع، واختلاف الدين المانع.`,
    evidenceVerses: ['[Surah An-Nisa 4:4]', '[Surah Ar-Rum 30:21]', '[Surah Al-Baqarah 2:221]'],
    evidenceHadiths: ['[Sunan Abi Dawud 2085]', '[Jami\' at-Tirmidhi 1101]', '[Sahih al-Bukhari 5063]'],
  },
  {
    id: 'prophet_seerah_summary',
    topic: 'history_seerah',
    titleEn: 'Life of Prophet Muhammad ﷺ (The Noble Seerah)',
    titleSo: 'Taariikhda Suubbanaha Nabiga ﷺ (Siirada Nabiga)',
    titleAr: 'سيرة النبي محمد ﷺ العطرة ومعالم بعثته الشريفة',
    keywords: ['siirada', 'seerah', 'nabiga', 'rasuulka', 'muhammad', 'prophet', 'hijrah', 'hijrada', 'makkah', 'madinah', 'السيرة', 'النبي', 'الرسول'],
    principlesSo: `Nabi Muxammad ﷺ waa xabiibka iyo Rasuulkii u dambeeyay ee Alle u soo diray dhammaan aadanaha:
1. **Dhalashadii:** Wuxuu dhashay sanadkii Maroodiga (571 Miilaadiga) magaalada barakaysan ee Makka, isagoo agoon ah oo aabbihiis Cabdullaahi geeriyooday ka hor dhalashadiisa.
2. **Barbaarintii iyo Shakhsiyaddiisii:** Wuxuu ku caanbaxay daacadnimo iyo xaq-dhawr, waxaana loogu magac daray *Al-Amiin* (Kii la aamminsanaa). Wuxuu guursaday Sayidada Khadiija bintu Khuwaylid isagoo 25 jir ah.
3. **Soo-diriddii (Waxyiga):** Markuu gaaray 40 sano, waxyigii ugu horreeyay wuxuu ugu yimid godka Xiraa iyadoo loo soo dhiibay Suuratul Calaq [Surah Al-Alaq 96:1-5].
4. **Dacwada iyo Hijradii:** Wuxuu dacwada ku waday si qarsoodi iyo caddaan ah muddo 13 sano ah Makka dhexdeeda, ka dibna Alle wuxuu u amray inuu u hijroodo magaalada Madiina Al-Munawwarah sanadkii 622 Miilaadiga.
5. **Aasaaskii Dawladdii Islaamka:** Madiina wuxuu ku dhisay walaaltinimada Muhaajiriinta iyo Ansaarta, heshiiskii Madiina, wuxuuna hoggaamiyay dagaalladii xaqqa (Badr, Uxud, Khandaq, Furashadii Makka).
6. **Geeridii:** Wuxuu ku geeriyooday magaalada Madiina sanadkii 11-aad ee Hijrada isagoo 63 jir ah, kaddib markuu diintii oo dhammeystiran gaarsiiyay ummadda.`,
    principlesEn: `Prophet Muhammad ﷺ is the final Messenger sent as a mercy to all creation [Surah Al-Anbiya 21:107]:
1. **Birth and Early Life:** Born in Makkah in the Year of the Elephant (c. 570 CE) as an orphan; raised by his grandfather Abdul-Muttalib and later his uncle Abu Talib.
2. **Noble Character:** Widely acclaimed for integrity and truthfulness, known throughout Arabia as *Al-Amin* (The Trustworthy). Married Lady Khadijah bint Khuwaylid at age 25.
3. **Prophethood and Revelation:** At age 40, received the first revelation through Angel Jibril in Cave Hira [Surah Al-Alaq 96:1-5].
4. **The Da\'wah and Hijrah:** Preached monotheism patiently in Makkah under severe persecution for 13 years before executing the historic Migration (**Hijrah**) to Madinah in 622 CE.
5. **Building the Islamic Community:** Established the Constitution of Madinah, fostered brotherhood between the Muhajirun and Ansar, and solidified justice through pivotal milestones (Badr, Uhud, Khandaq, Treaty of Hudaybiyyah, and the peaceful Conquest of Makkah).
6. **Legacy and Demise:** Delivered the Farewell Pilgrimage (*Hajjat al-Wada'*) and passed away in Madinah in 11 AH (632 CE) at age 63, having successfully conveyed the complete religion.`,
    principlesAr: `سيرة خير البرية محمد بن عبد الله صلوات الله وسلامه عليه:
1. **المولد والنشأة:** ولد بمكة في عام الفيل يتيماً، وكفله جده عبد المطلب ثم عمه أبو طالب، وعُرف في قومه بالصادق الأمين، وتزوج أم المؤمنين خديجة رضي الله عنها وهو ابن خمس وعشرين سنة.
2. **البعثة والرسالة:** نزل عليه الوحي وهو يتعبد بغار حراء وله أربعون سنة بأول آيات سورة العلق ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾.
3. **الهجرة وبناء الدولة:** دعا بمكة ثلاث عشرة سنة صابراً محتسباً، ثم هاجر إلى المدينة المنورة فآخى بين المهاجرين والأنصار وأرسى قواعد الدولة الإسلامية.
4. **الجهاد والفتح:** قاد معارك الإسلام الفاصلة كبدر وأحد والخندق، وفتح مكة سلماً في السنة الثامنة للهجرة.
5. **الوفاة:** توفي في ربيع الأول من السنة الحادية عشرة للهجرة بعد أن بلّغ الرسالة وأدّى الأمانة ونصح الأمة.`,
    evidenceVerses: ['[Surah Al-Ahzab 33:21]', '[Surah Al-Anbiya 21:107]', '[Surah Al-Alaq 96:1-5]'],
    evidenceHadiths: ['[Sahih al-Bukhari 3815]', '[Sahih al-Bukhari 3656]'],
  },
  {
    id: 'riba_business_ethics',
    topic: 'transactions_business',
    titleEn: 'Prohibition of Riba (Interest) and Islamic Business Ethics',
    titleSo: 'Xarrimista Ribada iyo Anshaxa Ganacsiga Islaamka',
    titleAr: 'تحريم الربا وأخلاقيات المعاملات المالية في الإسلام',
    keywords: ['riba', 'ribada', 'interest', 'ganacsi', 'ganacsiga', 'business', 'forex', 'crypto', 'crypto currency', 'dayn', 'debt', 'الربا', 'المعاملات', 'البيوع'],
    principlesSo: `Islaamku wuxuu xalaaleeyay ganacsiga wanaagsan wuxuuna xarrimay Ribada iyo wax kasta oo ku saleysan dulmi ama khamaar:
1. **Xarrimista Ribada:** Ribadu waa kordhinta lacagta ama deynta lagu kordhiyo iyadoo aan wax shaqo ama ganacsi xalaal ah lahayn. Alle wuxuu ku yiri Quraanka: "Ilaahay wuxuu xalaaleeyay ganacsiga wuxuuna xarrimay Ribada" [Surah Al-Baqarah 2:275]. Qofkii cuna ribadana wuxuu ku baaqay dagaal ka dhan ah Alle iyo Rasuulkiisa [Surah Al-Baqarah 2:279].
2. **Kala-soocidda Ribada:**
   - *Riba An-Nasi'ah:* Ribada deynta ee waqtiga la kordhiyo iyadoo lacag lagu kordhinayo (sida bangiyada dulsaarka qaata).
   - *Riba Al-Fadl:* Is-dhaafsiga laba shey oo isku nooc ah oo ribawi ah (sida dahab dahab lagu beddelo) iyadoo mid la kordhiyay.
3. **Mabaadi'da Ganacsiga Xalaasha ah:**
   - Ka fogaanshaha Qiyaanada, Dhaarta beenta ah, iyo Qarinta ceebaha badeecada.
   - Ka fogaanshaha Qaraarka (Gharar: mugdiga xad-dhaafka ah iyo hubaal la'aanta).
   - Ka fogaanshaha Maysirka (Khamaarka iyo nasiib-u-dhigashada lacagta).
   - *Ganacsiyada casriga ah (sida Forex ama Crypto):* Waxay u baahan yihiin in si gooni ah loo eego shuruudaha qabashada isla goobta (Taqābuḍ) iyo inaysan lahayn dulsaar (Swap/Interest) ama khatar khamaar ah.`,
    principlesEn: `Islamic jurisprudence places profound emphasis on honest commerce while categorically forbidding usury (Riba), excessive uncertainty (Gharar), and gambling (Maysir):
1. **The Prohibition of Riba:** Riba represents any unjust, unearned increment in exchange or debt without equivalent counter-value. Allah states: "Allah has permitted trade and has forbidden interest" [Surah Al-Baqarah 2:275], and warns those who persist of war from Allah and His Messenger [Surah Al-Baqarah 2:279].
2. **Types of Riba:**
   - *Riba an-Nasi'ah (Delay Usury):* Interest charged on loans due to time deferment (standard conventional bank interest).
   - *Riba al-Fadl (Surplus Usury):* Unequal exchange of identical commodities belonging to the ribawi categories (gold for gold, silver for silver) without instantaneous delivery and equal weight.
3. **Core Principles of Permissible (Halal) Earning:**
   - Mutual consent between parties without coercion.
   - Transparency and absolute prohibition of fraud or concealing defects [Sahih Muslim 102].
   - Prohibition of Gharar (speculative ambiguity where the subject matter cannot be delivered).
   - Contemporary questions (Forex, Cryptocurrency): Rulings require strict adherence to on-the-spot delivery (*taqābuḍ*) for currencies and freedom from interest fees.`,
    principlesAr: `الأصول الشرعية في المعاملات المالية والمكاسب:
1. **تحريم الربا:** محرم بالكتاب والسنة والإجماع، وهو من السبع الموبقات ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ [البقرة: 275].
2. **قسما الربا:**
   - *ربا النسيئة:* الزيادة المشروطة في الدين مقابل الأجل، كفوائد القروض البنكية التقليدية.
   - *ربا الفضل:* بيع الأموال الربوية بجنسها مع التفاضل (كالذهب بالذهب، والفضة بالفضة).
3. **ضوابط المعاملات المباحة:**
   - التراضي الخالي من الإكراه والغرر والتدليس.
   - اجتناب بيوع الغرر والمقامرة والميسر لحديث نهي النبي ﷺ عن بيع الغرر [صحيح مسلم 1513].
   - المعاملات المعاصرة كالعملات الرقمية والفوركس تخضع للضوابط الفقهية المقررة من المجامع الفقهية المعتمدة لضمان خلوها من الربا والغرر الفاحش.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:275]', '[Surah Al-Baqarah 2:279]', '[Surah An-Nisa 4:29]'],
    evidenceHadiths: ['[Sahih al-Bukhari 52]', '[Sahih Muslim 1599]', '[Sahih Muslim 1513]'],
  },
  {
    id: 'khadijah_bint_khuwaylid',
    topic: 'history_seerah',
    titleEn: 'Lady Khadijah bint Khuwaylid (Mother of the Believers)',
    titleSo: 'Sayidada Khadiija bintu Khuwaylid (Hooyada Mu\'miniinta)',
    titleAr: 'أم المؤمنين خديجة بنت خويلد رضي الله عنها',
    keywords: ['khadijah', 'khadija', 'khadiijo', 'khuwaylid', 'mother of the believers', 'خديجة', 'أم المؤمنين'],
    principlesSo: `Sayidada Khadiija bintu Khuwaylid (Allaha ka raalli noqdee) waa qofkii ugu horreeyay ee Islaama dunida korkeeda, waana xaaskii ugu horreysay ee Rasuulka ﷺ:
1. **Kaalinteedii Dacwada:** Markii waxyigu ku bilowday Nabiga ﷺ godka Xiraa, waxay ahayd tii dejisay oo ku tiri erayadii taariikhiga ahaa: "Wallahi Alle marna ku dulleyn maayo, adigu waxaad xiriirisaa qaraabada, caawisaa masaakiinta, martida sharafaysaa..." [Sahih al-Bukhari 3].
2. **Fadligeeda Sare:** Waxay ahayd qofka keliya ee Alle weyne salaam ugu soo dhiibay Malaa'igta Jibriil [Sahih al-Bukhari 3820].
3. **Jacaylkii Nabiga ﷺ ee Khadiija:** Nabigu ﷺ waligiis ma iloobin wanaaggeda, wuxuuna ku yiri: "Waxay i rumaysay markii ay dadku i beeniyeen, waxayna hantideeda igu taageertay markii ay dadku wax iga dideen..." [Musnad Ahmad 24864].`,
    principlesEn: `Lady Khadijah bint Khuwaylid (may Allah be pleased with her) holds a peerless rank as the first Mother of the Believers (*Umm al-Mu'minin*):
1. **The First to Embrace Islam:** She was the very first human being to accept the message of Islam without hesitation.
2. **Consolation at First Revelation:** When Angel Jibril descended in Cave Hira, she comforted the trembling Prophet ﷺ with prophetic reassurance: "Never! By Allah, Allah will never disgrace you, for you maintain family ties, help the poor, honor guests, and assist in truth" [Sahih al-Bukhari 3].
3. **Divine Salutation:** She was uniquely honored when Allah the Almighty sent His Divine greetings of peace to her through Angel Jibril [Sahih al-Bukhari 3820, Sahih Muslim 2432].`,
    principlesAr: `أم المؤمنين خديجة بنت خويلد رضي الله عنها، سيدة نساء العالمين في عصرها:
1. **أول من آمن:** كانت أول من أسلم على وجه الأرض وصدّق النبي ﷺ وشدّ أزره.
2. **تثبيتها للنبي ﷺ في بدء الوحي:** لما جاءه الوحي في غار حراء زمّلته وثبّتته بكلماتها الخالدة: «كلا والله ما يخزيك الله أبداً؛ إنك لتصل الرحم، وتصدق الحديث، وتحمل الكلّ، وتقري الضيف، وتعين على نوائب الحق» [صحيح البخاري 3].
3. **فضلها وبشارة السماء:** أقرأها جبريل عليه السلام السلام من ربها ومنه، وبشّرها ببيت في الجنة من قصب [صحيح البخاري 3820].`,
    evidenceVerses: ['[Surah Al-Ahzab 33:6]', '[Surah Ad-Duha 93:8]'],
    evidenceHadiths: ['[Sahih al-Bukhari 3815]', '[Sahih al-Bukhari 3820]', '[Sahih al-Bukhari 3]'],
  },
  {
    id: 'dua_repentance_adhkar',
    topic: 'duas_ethics',
    titleEn: 'Du\'a, Adhkar, and Sincere Repentance (Tawbah)',
    titleSo: 'Ducada, Dikriga, iyo Toobad-keenka Dhabta ah (Tawbah)',
    titleAr: 'الدعاء والذكر والتوبة النصوح في الإسلام',
    keywords: ['dua', 'duco', 'ducada', 'dhikr', 'dikri', 'adhkar', 'toobad', 'toobadda', 'repent', 'repentance', 'istighfaar', 'istighfar', 'استغفار', 'توبة', 'دعاء', 'أذكار'],
    principlesSo: `Ducada iyo Toobaddu waa tiirarka ugu muhiimsan ee qofka Muslimka ah ku xira Alle:
1. **Fadliga Ducada:** Ducadu waa cibaadada laf-dhaqarkeeda sida Nabigu ﷺ sheegay [Sunan Abi Dawud 1479]. Alle wuxuu yiri: "I barya waan idin ajiibi doonaaye" [Surah Ghafir 40:60].
2. **Shuruudaha Aqbaarta Ducada:** Niyad daacad ah, kalsooni buuxda oo Alle lagu qabo, iyo in qofku ku nool yahay cunto, cabbitaan, iyo dhar xalaal ah [Sahih Muslim 1015].
3. **Shuruudaha Toobadda Saxiixa ah (Tawbah Nasuuh):**
   - Ka joogsashada dambiga isla markaas.
   - Qoomamo dhab ah oo qalbiga ka timaada wixii horay u dhacay.
   - Go'aan adag oo aan dib loogu laabanayn dambigaas.
   - Celinta xuquuqda dadka haddii dambigu taabanayay xaq qof leeyahay [Surah At-Tahrim 66:8].`,
    principlesEn: `Supplication (Du'a), Remembrance (Dhikr), and Sincere Repentance (Tawbah) are central to the believer's spiritual life:
1. **The Essence of Worship:** Du'a is worship itself [Sunan Abi Dawud 1479]. Allah declares: "Call upon Me; I will respond to you" [Surah Ghafir 40:60].
2. **Requisites for Accepted Supplication:** Absolute sincerity (*Ikhlās*), certainty in divine response, and strictly consuming halal provisions [Sahih Muslim 1015].
3. **Pillars of Sincere Repentance (Tawbah Nasūh):**
   - Immediate abandonment of the transgression.
   - Genuine internal remorse for the committed act.
   - Firm, unyielding resolve never to return to the sin.
   - Restoring rights or seeking pardon if the transgression harmed other human beings [Surah At-Tahrim 66:8].`,
    principlesAr: `أصول الدعاء والذكر والتوبة النصوح في الإسلام:
1. **مكانة الدعاء:** الدعاء هو العبادة ﴿وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ﴾ [غافر: 60].
2. **شروط إجابة الدعاء:** الإخلاص، واليقين بالإجابة، وطيب المأكل والمشرب [صحيح مسلم 1015].
3. **شروط التوبة النصوح:** الإقلاع الفوري عن الذنب، والندم على ما فرط، والعزم الجازم على عدم العودة، ورد المظالم لأهلها إن تعلقت بحقوق الآدميين ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا﴾ [التحريم: 8].`,
    evidenceVerses: ['[Surah Ghafir 40:60]', '[Surah At-Tahrim 66:8]', '[Surah Al-Baqarah 2:186]'],
    evidenceHadiths: ['[Sunan Abi Dawud 1479]', '[Sahih Muslim 1015]', '[Sunan Ibn Majah 4250]'],
  },
  {
    id: 'hajj_umrah_pillars',
    topic: 'worship_hajj',
    titleEn: 'Pillars, Rites, and Conditions of Hajj and Umrah',
    titleSo: 'Tiirarka, Waajibaadka, iyo Shuruudaha Xajka iyo Cumrada',
    titleAr: 'أركان وواجبات وشروط الحج والعمرة',
    keywords: ['xaj', 'xajka', 'cumro', 'cumrada', 'hajj', 'umrah', 'mabrur', 'arafah', 'ihram', 'tawaf', 'sa\'i', 'الحج', 'العمرة', 'عرفة', 'طواف', 'إحرام'],
    principlesSo: `Xajku waa tiirka 5-aad ee Islaamka, waana faral hal mar nolosha qofka ku waajibaya haddii uu awoodo (Al-Istidaa'ah) [Surah Ali 'Imran 3:97]:
1. **Shuruudaha Waajibnimada:** Islaamnimo, Caqli, Qaangaarnimo, Xornimo, iyo Awood dhaqaale iyo mid jireed.
2. **Afar Tiir ee Xajka (Arkaanul Xaj):**
   - *Ixraamka (Al-Ixraam):* Niyadda gelitaanka xajka ee miqaatka loo maro.
   - *Taagnida Carafo (Wuquuf bi-Carafa):* Waa tiirka ugu muhiimsan sida Nabigu ﷺ yiri: "Xajku waa Carafo" [Jami' at-Tirmidhi 889].
   - *Dawaafka Ifaadada (Tawaaf Al-Ifaadah):* Dawaafka Kacbada sharafta leh.
   - *Saciga (As-Sac\'yu):* Todobada wareeg ee u dhaxeeya Safa iyo Marwa.`,
    principlesEn: `Hajj is the 5th pillar of Islam, obligatory once in a lifetime for every capable Muslim [Surah Ali 'Imran 3:97]:
1. **Conditions of Obligation:** Islam, sanity, adulthood, freedom, and capability (financial and physical).
2. **The Four Inviolable Pillars (Arkan al-Hajj):**
   - *Ihram:* The sacred intention entered at designated boundary stations (Miqat).
   - *Wuquf at Arafah:* The indispensable core: "Hajj is Arafah" [Jami' at-Tirmidhi 889].
   - *Tawaf al-Ifadah:* Circumambulating the Sacred Kaaba after descending from Muzdalifah.
   - *Sa'i:* Walking seven laps between the hills of Safa and Marwah.`,
    principlesAr: `أركان وشروط فريضة الحج في الشريعة الإسلامية:
1. **شروط الوجوب:** الإسلام، والعقل، والبلوغ، والحرية، والاستطاعة المالية والبدنية ﴿وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا﴾ [آل عمران: 97].
2. **أركان الحج الأربعة:**
   - الإحرام (نية الدخول في النسك).
   - الوقوف بعرفة لقوله ﷺ: «الحَجُّ عَرَفَةُ» [جامع الترمذي 889].
   - طواف الإفاضة حول البيت الحرام.
   - السعي بين الصفا والمروة سبعة أشواط.`,
    evidenceVerses: ['[Surah Ali \'Imran 3:97]', '[Surah Al-Hajj 22:27]', '[Surah Al-Baqarah 2:196]'],
    evidenceHadiths: ['[Sahih al-Bukhari 1773]', '[Jami\' at-Tirmidhi 889]', '[Sahih al-Bukhari 8]'],
  },
  {
    id: 'crypto_forex_contemporary_finance',
    topic: 'transactions_crypto_forex',
    titleEn: 'Islamic Ruling on Cryptocurrency, Bitcoin, and Forex Trading',
    titleSo: 'Xukunka Shareecada ee Lacagaha Digital-ka ah (Crypto/Bitcoin) iyo Forex-ka',
    titleAr: 'حكم العملات الرقمية المشفرة وتداول الفوركس في الفقه الإسلامي',
    keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'btc', 'ethereum', 'forex', 'margin', 'leverage', 'day trading', 'lacagaha', 'lacagta digital', 'العملات الرقمية', 'البيتكوين', 'الفوركس', 'التداول'],
    principlesSo: `Culimada casriga ah iyo majmacyada fiqiga caalamiga ah (sida Majmaca Fiqiga ee Jeddah iyo Al-Azhar) waxay si qoto dheer u lafa-gureen ganacsiga lacagaha digital-ka ah (Cryptocurrency) iyo Forex-ka:
1. **Shuruudaha Guud ee Ganacsiga Islaamka:** Waa in ganacsigu ka madax-bannaan yahay Ribada, Qaraarka daran (Gharar: mugdi iyo khiyaamo), iyo Khamaarka (Maysir) [Surah Al-Baqarah 2:275].
2. **Kala Duwanaanshaha Culimada ee Cryptocurrency (Bitcoin/Crypto):**
   - *Aragtida Koowaad (Mamnuuc / Aan Bannaanayn):* Qaar ka mid ah hay'adaha fatwada (sida Dar al-Ifta ee Masar iyo Majmaca Fiqiga ee Turkiga) waxay qabaan inaysan bannaanayn hubaal-la'aanta baaxadda leh (Gharar Faaxish), qiimaha sida xad-dhaafka ah u rogrogmada, damaanad-qaad dowli ah oo ka maqan, iyo khatarta ah in loo isticmaalo lacag-dhaqid awgeed.
   - *Aragtida Labaad (Bannaan oo leh Shuruudo Adag):* Culimo badan oo ku takhasusay Maaliyadda Islaamka (Islamic Finance) waxay qabaan in cryptocurrency ay tahay hanti maaliyadeed (Maal) oo qiimo leh, haddii ay leedahay mashruuc dhab ah oo faa'iido leh, aan lagu ganacsan khamaar ama khiyaamo, loona hoggaansamo shuruudaha sarifka sharciga ah.
3. **Forex-ka iyo Margin Trading:** Forex-ka caadiga ah ee bangiyada caalamiga ah badanaa waxaa weheliya dulsaar (Swap/Overnight interest) iyo leverage/margin oo sharci ahaan la xiriira deyn ribo dhalisa, taasoo culimada badankoodu mamnuuceen. Sarifka xalaasha ah wuxuu u baahan yahay qabashada isla goobta (Taqābuḍ) iyadoo aan la helin deyn dulsaar leh [Sahih Muslim 1587].`,
    principlesEn: `Contemporary Islamic jurists and international Fiqh academies (including the International Islamic Fiqh Academy in Jeddah and AAOIFI) have extensively evaluated cryptocurrency and retail forex trading:
1. **Core Islamic Finance Standards:** Financial transactions must be completely free from Riba (usury/interest), excessive ambiguity or risk without real underlying value (*Gharar Fāhish*), and gambling (*Maysir*) [Surah Al-Baqarah 2:275, Sahih Muslim 1513].
2. **Scholarly Views on Cryptocurrencies (Bitcoin, Ethereum, etc.):**
   - *Cautious/Prohibitive View:* Several national fatwa councils (such as Egypt's Dar al-Ifta and Turkey's Diyanet) express prohibition due to extreme volatility, lack of sovereign legal-tender backing, speculative hoarding, and potential for illicit exploitation.
   - *Permissible with Strict Caveats:* Many leading Islamic finance scholars (such as Mufti Taqi Usmani and contemporary Islamic fintech councils) evaluate cryptocurrencies as legitimate digital assets (*Māl*) or utility tokens when backed by transparent technology, genuine utility, verifiable governance, and free from speculative gambling contracts.
3. **Forex and Margin Trading:** Conventional retail forex involving leverage, rolled-over overnight swaps (interest fees), and delayed settlement fails the scriptural mandate of immediate hand-to-hand exchange (*Taqābuḍ*) established in [Sahih Muslim 1587]. Spot trading without leverage or interest fees is the only shariah-compliant mechanism.`,
    principlesAr: `الأحكام الفقهية المعاصرة في العملات الرقمية المشفرة وسوق الصرف الأجنبي (الفوركس):
1. **الأصل الشرعي في المعاملات:** الحل والإباحة ما لم تشتمل المعاملة على ربا أو غرر فاحش أو ميسر وقمار ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ [البقرة: 275].
2. **حكم العملات الرقمية (كالبيتكوين والإيثيريوم):**
   - *الاتجاه الأول (المنع والتحريم):* ذهبت بعض دور الإفتاء الرسمية إلى التحريم لعدم استقرار قيمتها، واشتمالها على الغرر والمضاربات الوهمية، وخلوها من الضمان السيادي.
   - *الاتجاه الثاني (الجواز بضوابط مشددة):* يرى باحثون في الاقتصاد الإسلامي أنها مال معتبر متقوم إذا كان لها مشروع نافع حقيقي، وخلا التعامل فيها من المقامرة وغسيل الأموال، مع وجوب مراعاة شروط التقابض الشرعي عند المصارفة.
3. **حكم تداول الفوركس بالرافعة المالية (Margin):** التداول التقليدي المشتمل على رسوم التبييت (Swap) وهي فوائد ربوية، والرافعة المالية التي تجمع بين السلف والمعاوضة، مما حرمه مجمع الفقه الإسلامي الدولي؛ ويجوز التداول الفوري المباشر الخالي من القروض الربوية والمحقق للتقابض الشرعي [صحيح مسلم 1587].`,
    evidenceVerses: ['[Surah Al-Baqarah 2:275]', '[Surah An-Nisa 4:29]', '[Surah Al-Ma\'idah 5:90]'],
    evidenceHadiths: ['[Sahih Muslim 1587]', '[Sahih Muslim 1513]', '[Sunan Abi Dawud 3504]'],
  },
  {
    id: 'organ_donation_medical_ethics',
    topic: 'medical_organ_donation',
    titleEn: 'Islamic Ruling on Organ Donation, Transplants, and Blood Donation',
    titleSo: 'Xukunka Shareecada ee Ku-tallaalidda iyo Bixinta Xubnaha Jirka (Kalyaha, Wadnaha) iyo Dhiigga',
    titleAr: 'حكم التبرع بالأعضاء وزراعتها ونقل الدم في الشريعة الإسلامية',
    keywords: ['organ donation', 'organ transplant', 'kidney', 'donating kidney', 'blood transfusion', 'bixinta xubnaha', 'kalyo', 'kalyaha', 'wadnaha', 'beerka', 'dhiig', 'dhiigga', 'التبرع بالأعضاء', 'زراعة الأعضاء', 'نقل الدم'],
    principlesSo: `Ku-tallaalidda xubnaha iyo bixinta dhiigga si loo badbaadiyo nolosha bini'aadanka waa mid ka mid ah arrimaha ugu waaweyn ee fiqiga caafimaadka casriga ah:
1. **Asalka Sharafta Qofka:** Jirka bini'aadamka waa ammaanad Alle leeyahay, waxaana waajib ah in la ilaaliyo sharaftiisa nool iyo meyd labadaba [Surah Al-Isra 17:70].
2. **Badbaadinta Nafta:** Alle wuxuu ku yiri Quraanka: "Qofkii naf badbaadiyaana waxay la mid tahay isagoo dadka oo dhan wada nooleeyay" [Surah Al-Ma'idah 5:32].
3. **Xukunka Bixinta Xubinta Qofka Nool:**
   - *Bannaan:* Qofka nooli wuxuu ku deeqi karaa xubin aan dhimasho keenayn (sida mid ka mid ah labadiisa kalyood ama qayb ka mid ah beerka) haddii dhakhaatiir lagu kalsoon yahay ay xaqiijiyaan inaysan waxyeello halis ah u geysanayn caafimaadkiisa, qofka qaadanayana ay badbaadinayso.
   - *Mamnuuc:* Lama bixin karo xubin muhiim u ah nolosha oo dhimasho dhalinaysa (sida wadnaha qof nool), loomana bixin karo lacag ama ganacsi ahaan.
4. **Xukunka Bixinta Xubnaha Qofka Dhintay:** Majmaca Fiqiga Islaamka ee Jeddah iyo culimo badan oo caalami ah waxay banneeyeen in xubnaha qofka meydka ah loo isticmaalo badbaadinta bukaanka haddii qofku uu nolosha ku dardaarmay ama ehelkiisu oggolaadaan dhimashadiisa ka dib, iyadoo aan wax iib ah ku jirin.
5. **Bixinta Dhiigga:** Bixinta dhiigga bukaanka u baahan waa sunno iyo sadaqo aad loo jecel yahay oo ku dheehan naxariis iyo samafal.`,
    principlesEn: `Organ transplantation and blood transfusion to preserve human life are among the paramount issues resolved by contemporary medical fiqh:
1. **Sanctity of the Human Body:** Human beings are divinely honored by Allah [Surah Al-Isra 17:70], and the human body is a sacred trust (*Amānah*).
2. **Preservation of Life (*Hifdh an-Nafs*):** A fundamental objective of Shariah (*Maqasid*). Allah declares: "And whoever saves a life, it is as though he had saved the life of all mankind" [Surah Al-Ma'idah 5:32].
3. **Living Donor Transplants:**
   - *Permissible:* Donating paired or regenerative organs (such as one kidney or a partial liver lobe) is permissible provided reliable medical experts confirm that donor health is not gravely compromised and recipient life is preserved.
   - *Categorically Forbidden:* Donating vital singular organs (such as the heart of a living person), which induces suicide/homicide, and any commercial sale or commodification of human organs.
4. **Deceased Organ Donation:** The International Islamic Fiqh Academy (Resolution No. 26/1/4), the Islamic Fiqh Academy of Makkah, and major scholarship permit deceased organ transplantation when voluntary prior consent or legal family authorization exists.
5. **Blood Donation:** Fully permissible and rewarded as an exemplary act of ongoing charity (*Sadaqah*) to rescue patients.`,
    principlesAr: `الأحكام الشرعية في زراعة الأعضاء ونقل الدم:
1. **كرامة الإنسان وحرمة جسده:** جسد الإنسان أمانة محترمة حياً وميتاً ﴿وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ﴾ [الإسراء: 70].
2. **حفظ النفس ضرورة شرعية:** قال تعالى: ﴿وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا﴾ [المائدة: 32].
3. **التبرع من الحي:**
   - يجوز للمسلم التبرع بجزء من جسده يتجدد كالدم، أو عضو مزدوج لا يؤدي نقله إلى تعطيل حياته كإحدى الكليتين، بشرط غلبة الظن بنجاح العملية وعدم تضرر المتبرع تضرراً فادحاً.
   - يحرم التبرع بعضو تتوقف عليه الحياة كالقلب، كما يحرم بيع الأعضاء والاتجار بها بإجماع الفقهاء.
4. **التبرع من الميت:** قرر مجمع الفقه الإسلامي الدولي وهيئة كبار العلماء جواز نقل الأعضاء من المتوفى لإنقاذ مريض معصوم الدم بشرط إذن المتوفى قبل موته أو إذن ورثته بعد وفاته.`,
    evidenceVerses: ['[Surah Al-Ma\'idah 5:32]', '[Surah Al-Isra 17:70]', '[Surah Al-Baqarah 2:195]'],
    evidenceHadiths: ['[Sahih Muslim 2586]', '[Sunan Abi Dawud 4545]', '[Sunan Ibn Majah 2341]'],
  },
  {
    id: 'mortgage_home_financing',
    topic: 'transactions_mortgage_banking',
    titleEn: 'Islamic Ruling on Conventional Mortgages and Islamic Home Financing',
    titleSo: 'Xukunka Mortgage-ka (Deynta Guriga ee Bangiyada Dulsaarka) iyo Beddelka Islaamiga ah',
    titleAr: 'حكم القرض العقاري الربوي وبدائل التمويل العقاري الإسلامي',
    keywords: ['mortgage', 'home loan', 'bank loan', 'buying house', 'guri', 'guriga', 'mortgage-ka', 'deynta guriga', 'dulsaar', 'bangiga', 'القرض العقاري', 'شراء بيت', 'تمويل عقاري', 'الربا'],
    principlesSo: `Iibsashada guriga ee deynta bangiyada dulsaarka (Conventional Mortgage) waxay ka mid tahay su'aalaha ugu badan ee ay Muslimiintu is-weydiiyaan:
1. **Xukunka Asalka ah ee Mortgage-ka Caadiga ah:** Mortgage-ka ku dhisan dulsaarka (Interest) waa Ribo cad oo shareecadu si adag u mamnuucday [Surah Al-Baqarah 2:275-279]. Qofka amaahda lacagta ah ku bixinaya dulsaar wuxuu gelayaa dambiga Ribada, haddii aysan jirin xaalad dharuuro aad u culus oo shareecadu qirtay.
2. **Kala-aragtida Xaaladaha Dharuuriga ah ee Galbeedka:**
   - *Jumhuurka Culimada Casriga ah:* Waxay qabaan in iibsashada guriga uusan gaarin heer dharuuro banneeya ribada (Darurah), maxaa yeelay kireysiga guriga (Rent) ayaa ka maarmi kara deynta ribada.
   - *Aragtida Golaha Yurub ee Fatwada (ECFR):* Waxay si gaar ah xaalado aad u kooban ugu banneeyeen qoysaska danyarta ah ee aan heli karin guri kiro ah ama qandaraas Islaami ah, balse tani waa fatwo gaar ah oo shardi adag leh, oo aan ahayn xukun guud.
3. **Beddellada Xalaasha ah ee Islaamiga ah (Islamic Mortgages):**
   - *Al-Muraabaxa (Murabaha):* Bangiga Islaamiga ah ayaa guriga soo iibsanaya, kaddibna ku iibinaya macaamilka faa'iido go'an oo la yaqaan iyadoo lacagta qayb-qayb loo bixiyo.
   - *Mushaaraka Hoos u Dhacda (Diminishing Musharakah):* Qofka iyo bangiga ayaa guriga wada iibsanaya, qofkuna si tartiib ah ayuu u iibsanayaa qaybta bangiga isagoo isla markaas bixinaya kirada qaybta uusan weli lahayn ilaa uu guriga oo dhan yeesho.`,
    principlesEn: `Purchasing a primary residence via conventional interest-bearing mortgages is among the most consequential financial decisions confronting Muslims:
1. **Core Jurisprudential Ruling:** Conventional mortgages are interest-bearing loans (*Qard bi-Fā'idah*), which constitutes prohibited Riba by unanimous scholarly consensus [Surah Al-Baqarah 2:275-279, Sahih Muslim 1598].
2. **Scholarly Debate Regarding Living in the West (*Dār al-Iqāmah*):**
   - *The Majority Position:* The vast majority of international fiqh assemblies (Permanent Committee, AMJA, OIC Fiqh Academy) hold that homeownership is a convenience or need (*Hājah*), not a life-threatening necessity (*Ḍarūrah*) that suspends the severe prohibition of Riba, since renting remains a valid, halal alternative.
   - *The European Council for Fatwa (ECFR) Concession:* Granted a qualified concession strictly for individuals in Western jurisdictions unable to secure suitable rented accommodation or Islamic financing, conditioned upon purchasing only a single modest family home.
3. **Shariah-Compliant Islamic Home Financing Alternatives:**
   - *Murabaha (Cost-Plus Sale):* The Islamic financier acquires the property and sells it directly to the client at an agreed mark-up with installment payments.
   - *Diminishing Musharakah (Mushārakah Mutanāqiṣah):* The client and bank co-own the property; the client pays rent for the bank's share while progressively purchasing the bank's equity until complete ownership is attained.`,
    principlesAr: `حكم التمويل العقاري وشراء البيوت عن طريق البنوك التقليدية والإسلامية:
1. **الأصل الشرعي:** القرض العقاري المشتمل على فائدة هو عقد ربا صريح محرم بنص القرآن والسنة والإجماع ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا﴾ [البقرة: 278].
2. **مسألة الضرورة في بلاد المهجر:**
   - *جمهور العلماء والمجامع الفقهية (مجمع الفقه الدولي، مجمع فقهاء الشريعة بأمريكا):* يرون تحريم أخذ القرض الربوي لشراء المسكن، وأن الإيجار بديل مباح يرفع الحرج ولا يرتقي شراء المسكن إلى رتبة الضرورة المبيحة للربا.
   - *فتوى المجلس الأوروبي للإفتاء:* أجازت بشروط مشددة شراء مسكن واحد لضرورة السكنى عند تعذر البدائل الإسلامية واستحالة الإيجار اللائق.
3. **البدائل الشرعية المعتمدة:**
   - *المشاركة المتناقصة:* يشترك العميل والمصرف في ملكية العقار، ويقوم العميل بشراء حصة المصرف تدريجياً مع دفع أجرة عادلة عن حصة المصرف.
   - *المرابحة للآمر بالشراء:* يشتري المصرف العقار أولاً ثم يبيعه للعميل بربح معلوم مقسطاً.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:275]', '[Surah Al-Baqarah 2:278-279]', '[Surah Al-Baqarah 2:185]'],
    evidenceHadiths: ['[Sahih Muslim 1598]', '[Sahih al-Bukhari 2083]', '[Sunan Abi Dawud 3333]'],
  },
  {
    id: 'cosmetic_plastic_surgery_ethics',
    topic: 'medical_cosmetic_surgery',
    titleEn: 'Islamic Ruling on Cosmetic and Plastic Surgery, Botox, and Tattoos',
    titleSo: 'Xukunka Qalliinka Qurxinta (Plastic Surgery), Botox-ka, iyo Tataawga (Tattoos)',
    titleAr: 'حكم الجراحة التجميلية والبوتوكس والوشم في الفقه الإسلامي',
    keywords: ['plastic surgery', 'cosmetic surgery', 'botox', 'rhinoplasty', 'liposuction', 'tattoos', 'tattoo', 'piercing', 'qurxin', 'qalliinka', 'qalliin', 'tataaw', 'tataawga', 'جراحة التجميل', 'عمليات التجميل', 'الوشم', 'البوتوكس'],
    principlesSo: `Diinta Islaamku waxay dhiirigelisaa nadaafadda iyo quruxda dabiiciga ah, laakiin waxay dejisay soohdin adag oo u dhaxeysa daweynta ceebaha iyo beddelidda abuurta Alle:
1. **Kala-soocidda Muhiimka ah:**
   - *Qalliinka Saxitaanka Ceebaha (Reconstructive Surgery):* Waa **bannaan yahay**. Haddii qofku leeyahay ceeb ku timid dhalasho (sida dibnaha kala jeexan), shil, ama gubasho keenaysa xanuun iyo culeys nafsi ah, in la saxo waa dawo xalaal ah. Daliil: Nabigu ﷺ wuxuu u oggolaaday saxaabigii Carfajah binu As'ad oo sanku ka go'ay dagaalka inuu sanka ka samaysto dahab [Sunan Abi Dawud 4232 - Xasan].
   - *Qalliinka Quruxda Xad-dhaafka ah (Pure Elective Cosmetic Surgery):* Waa **xaaraan**. In qof caafimaad qaba oo aan ceeb lahayn uu qalliin ku beddelo wejigiisa ama sanka si uu u kordhiyo qurux keliya waxay soo gelaysaa beddelidda abuurta Alle oo Shaydaanku ku hanjabay [Surah An-Nisa 4:119].
2. **Botox-ka iyo Fillers-ka:** Haddii loo isticmaalo daaweyn (sida murqo xanuun daran ama cudurro) waa bannaan; haddii loo isticmaalo qarin gabow ama qurux ku-meel-gaar ah iyadoo aan waxyeello caafimaad ku jirin, culimadu way banneeyeen haweenka dhexdooda haddii aysan ku jirin walxo xaaraan ah ama is-khiyaano.
3. **Tataawga (Tattoos):** Tataawga joogtada ah ee maqaarka lagu mudo waa **xaaraan** weyn oo la habaaray, sida Nabigu ﷺ ku sheegay xadiiska saxiixa ah [Sahih al-Bukhari 5937].`,
    principlesEn: `Islam celebrates cleanliness, aesthetic neatness, and natural beauty while drawing a clear, definitive boundary between therapeutic healing and vanity alterations:
1. **The Fundamental Distinction:**
   - *Reconstructive/Therapeutic Surgery (*Jirāḥah 'Ilājiyyah*):* Fully **Permissible**. Correcting congenital deformities (such as cleft palate), burn injuries, physical trauma, or functional breathing obstructions brings psychological relief and restores natural functioning. Evidence: The Prophet ﷺ permitted companion Arfajah ibn As'ad to replace his severed nose with one made of gold [Sunan Abi Dawud 4232, Jami' at-Tirmidhi 1770 — Hasan].
   - *Purely Elective Cosmetic Surgery (*Jirāḥah Taḥsīniyyah*):* **Impermissible**. Surgical intervention performed exclusively on a healthy body to conform to vanity standards or chase superficial trends constitutes altering the natural creation of Allah (*Taghyīr Khalq Allāh*), an act inspired by Satan [Surah An-Nisa 4:119].
2. **Botox, Dermal Fillers, and Skin Treatments:** Permissible for therapeutic reasons (migraines, muscle spasticity). When used topically by women for marital beautification, scholars permit them provided the ingredients are pure (*tāhir*), physically safe, and avoid fraud/deception.
3. **Permanent Tattoos:** Categorically **Forbidden** (*Harām*). The Prophet ﷺ explicitly cursed the one who tattoos and the one who gets tattooed [Sahih al-Bukhari 5937, Sahih Muslim 2125].`,
    principlesAr: `الضوابط الفقهية في العمليات الجراحية التجميلية وإجراءات التحسين:
1. **الفرق بين التجميل العلاجي والتحسيني:**
   - *الجراحة العلاجية التصحيحية:* **جائزة شرعاً**؛ وهي ما كان لإزالة عيب خِلقي أو طارئ بحادث أو حريق أو استعادة الوظيفة الطبيعية للعضو، لحديث عرفجة بن أسعد رضي الله عنه حين قطع أنفه فأذن له النبي ﷺ أن يتخذ أنفاً من ذهب [سنن أبي داود 4232].
   - *الجراحة التحسينية المجردة:* **محرمة** إذا كانت لزيادة الحسن وتغيير خلق الله طلباً للمضاهاة وملاحقة الموضة ﴿وَلَآمُرَنَّهُمْ فَلَيُغَيِّرُنَّ خَلْقَ اللَّهِ﴾ [النساء: 119].
2. **البوتوكس والفيلر:** جائز إذا كان لأغراض علاجية؛ ويجوز للمرأة للزينة إذا خلا من الضرر والمواد المحرمة ولم يكن فيه تدليس وتغرير.
3. **الوشم:** محرم تحريماً قاطعاً وهو من كبائر الذنوب لحديث: «لَعَنَ اللَّهُ الوَاشِمَاتِ والمُوتَشِمَاتِ» [صحيح البخاري 5937، صحيح مسلم 2125].`,
    evidenceVerses: ['[Surah An-Nisa 4:119]', '[Surah At-Tin 95:4]', '[Surah Al-Baqarah 2:195]'],
    evidenceHadiths: ['[Sahih al-Bukhari 5937]', '[Sahih Muslim 2125]', '[Sunan Abi Dawud 4232]'],
  },
  {
    id: 'assisted_reproduction_ivf',
    topic: 'medical_bioethics_ivf',
    titleEn: 'Islamic Ruling on In Vitro Fertilization (IVF) and Surrogacy',
    titleSo: 'Xukunka Uurka Dhalada (IVF / Taranka Caafimaadka) iyo Uur-ku-sidaynta (Surrogacy)',
    titleAr: 'حكم أطفال الأنابيب والتلقيح الاصطناعي وتأجير الأرحام',
    keywords: ['ivf', 'in vitro fertilization', 'surrogacy', 'artificial insemination', 'egg freezing', 'ilmaha dhalada', 'uurka', 'taranka', 'dhalmo', 'أطفال الأنابيب', 'التلقيح الاصطناعي', 'تأجير الأرحام'],
    principlesSo: `Horumarka sayniska caafimaadka ee taranka (Assisted Reproductive Technology) waxaa culimada caalamiga ahi ka soo saareen go'aanno qeexan:
1. **Uurka Dhalada (IVF) ee Ninka iyo Xaaskiisa:** Waa **bannaan yahay** haddii la ilaaliyo shuruudaha soo socda:
   - In shahwada ninka iyo ugxanta gabadha laga qaado laba qof oo si sharci ah isku qaba oo nikax sax ahi u dhaxeeyo.
   - In uurjiifka lagu beero ilma-galeenka isla xaaskaas.
   - In la hubiyo inaanay jirin wax qasitaanka nasabka ah ama ku-dhex-qasid shahwo qof kale.
2. **Uur-ku-sidaynta (Surrogacy):** In ilmaha la dhalayo lagu beero haweeney kale oo saddexaad (Surrogate mother) waa **xaaraan** oo ma bannaana, maxaa yeelay waxay burinaysaa xurmada guurka waxayna keenaysaa isku-dhex-yaac nasabka iyo hooyonimada ah.
3. **Bixinta ama Gadashada Shahwada/Ugxanta:** Waa xaaraan adag, waana nooc ka mid ah sinada xagga nasabka.`,
    principlesEn: `Contemporary bioethics in reproductive technology is regulated strictly to protect human lineage (*Hifdh an-Nasl*):
1. **In Vitro Fertilization (IVF):** **Permissible** under strict ethical prerequisites codified by the Islamic Fiqh Academy:
   - The sperm must be from the lawful husband and the ovum from the lawful wife during an active, valid marriage.
   - The fertilized embryo must be implanted exclusively inside the womb of the wife herself.
   - Absolute precautions must be maintained by verified medical institutions to eliminate any risk of sample contamination or mix-up.
2. **Surrogacy (Gestational Carriers):** **Categorically Forbidden**. Renting or utilizing a third-party woman's womb shatters marital sanctity, complicates maternal legal rights (*al-Umūmah*), and disrupts verified lineage.
3. **Donor Sperm, Ova, or Embryos:** Strictly prohibited as an encroachment upon legitimate lineage resembling zina in consequences.`,
    principlesAr: `الأحكام الشرعية في التلقيح الاصطناعي وأطفال الأنابيب وتأجير الأرحام:
1. **أطفال الأنابيب بين الزوجين:** **جائز شرعاً** بقرار مجمع الفقه الإسلامي الدولي، بشرط:
   - أن تكون النطفة من الزوج والبويضة من الزوجة، وأن يتم الزرع في رحم الزوجة نفسها في ظل قيام عقد زواج شرعي قائم.
   - اتخاذ أقصى درجات الحيطة الطبية لمنع أي اختلاط في الأنساب.
2. **تأجير الأرحام (Surrogacy):** **محرم قطعاً**؛ لما يترتب عليه من ضياع الأمومة الشرعية واختلاط الأنساب ونزاع الحقوق.
3. **التبرع بالنطاف أو البويضات:** محرم بإجماع علماء المسلمين لحرمة خلط الأنساب.`,
    evidenceVerses: ['[Surah Al-Furqan 25:54]', '[Surah Al-Mu\'minun 23:5-6]', '[Surah Al-Isra 17:32]'],
    evidenceHadiths: ['[Sahih al-Bukhari 6749]', '[Sahih Muslim 1450]'],
  },
  {
    id: 'inheritance_mirath_shares',
    topic: 'family_inheritance',
    titleEn: 'Islamic Inheritance Laws, Fractional Shares, and Probate (Al-Mīrāth / \'Ilm al-Farā\'iḍ)',
    titleSo: 'Xeerarka, Qaybaha, iyo Xisaabinta Dhaxalka ee Islaamka (Cilmiga Dhaxalka / Faraa\'idka)',
    titleAr: 'أحكام علم الميراث والفرائض وتوزيع التركات في الشريعة الإسلامية',
    keywords: ['dhaxal', 'dhaxalka', 'mirath', 'inheritance', 'faraid', 'faraa\'id', 'shares of inheritance', 'daughter share', 'son share', 'qaybta gabadha', 'qaybta wiilka', 'qaybta hooyada', 'qaybta aabbaha', 'الميراث', 'الفرائض', 'التركة', 'المواريث'],
    principlesSo: `Cilmiga Dhaxalka (Faraa'idka) waa mid ka mid ah cilmiyada ugu xurmada badan ee shareecada, waxaana qaybaha dhaxalka si toos ah oo faahfaahsan u qeexay Alle weyne Quraankiisa:
1. **Daliilka Asalka ah:** Suuradda An-Nisaa aayadaha 11, 12, iyo 176 waxay si faahfaahsan u caddaynayaan saamiyada go'an (Ashabul Furuud).
2. **Qaybaha Quraanka lagu Caddeeyay (Ashabul Furuud):**
   - *1/2 (Barkeed):* Gabadha keliya haddii aysan wiil la dhalan, gabadha wiilka dhalay hadday keli tahay, walaasha dhalashada hadday keli tahay, ama ninka qaba naag dhimatay oo aan carruur ka tagin.
   - *1/4 (Rubuc):* Ninka haddii xaaskiisu carruur ka tagto, ama naagta (ama xaasaska) haddii ninku uusan carruur ka tagin.
   - *1/8 (Sideed-meelood):* Xaaska (ama xaasaska) haddii ninku carruur ka tago [Surah An-Nisa 4:12].
   - *2/3 (Saddex meelood labo):* Laba gabdhood ama ka badan haddii aysan wiil la dhalan, ama laba walaalood iyo wixii ka badan.
   - *1/3 (Saddex meelood kow):* Hooyada haddii qofka dhintay uusan carruur ama walaalo badan ka tagin, ama walaalaha hooyada wada dhasheen hadday ka badan yihiin hal.
   - *1/6 (Lix meelood kow):* Aabbaha ama Hooyada haddii qofka dhintay uu carruur ka tago, iyo awoowaha/ayeeyada xaaladaha qaarkood.
3. **Qaanuunka Carruurta:** Haddii wiilal iyo gabdho wada jiraan, wiilku wuxuu qaadanayaa labanlaabka qaybta gabadha (*Liddakari mithlu xadhil unthayayn*) [Surah An-Nisa 4:11], sababtoo ah ninka waxaa saaran dhammaan masruufka, meherka, iyo dayactirka qoyska.
4. **Talo Muhiim ah:** Qaybinta dhabta ah ee hantida waxay u baahan tahay in la diiwaangeliyo dhammaan ehelka nool xilliga geerida iyo daymaha marxuumka, lana horgeeyo maxkamad sharci ah ama caalim ku takhasusay faraa'idka.`,
    principlesEn: `The Islamic Law of Succession (*'Ilm al-Farā'iḍ / Al-Mīrāth*) is divinely codified in comprehensive detail directly in the Holy Quran [Surah An-Nisa 4:11-12, 4:176]:
1. **The Primary Heirs and Fixed Prescribed Quotas (*Aṣḥāb al-Furūḍ*):**
   - *One-half (1/2):* Single daughter without male co-heir; single granddaughter; single full sister; or surviving husband when the deceased wife leaves no surviving children.
   - *One-fourth (1/4):* Surviving husband if children exist; surviving wife/wives if deceased husband leaves no children.
   - *One-eighth (1/8):* Surviving wife/wives if the deceased husband leaves children [Surah An-Nisa 4:12].
   - *Two-thirds (2/3):* Two or more daughters without sons; two or more full or paternal sisters.
   - *One-third (1/3):* Mother when deceased leaves no offspring and no multiple siblings; or multiple maternal siblings.
   - *One-sixth (1/6):* Father and Mother when deceased leaves offspring; grandfather or grandmother in absence of parents; single maternal sibling.
2. **Residuary Heirs (*'Aṣabah*):** Male descendants, father, or brothers who inherit the remaining estate after prescribed shares are disbursed [Sahih al-Bukhari 6732].
3. **Brother-Sister Ratio:** Sons and daughters inherit in a 2:1 ratio (*Li al-dhakari mithlu ḥaẓẓi al-unthayayn*) [Surah An-Nisa 4:11], reflecting the comprehensive financial obligation (*Nafaqah*) placed solely upon men in Islam to financially sustain wives, children, and elderly female relatives.
4. **Practical Counsel:** Complex estates require thorough inventory of burial expenses, debts, bequests (*Waṣiyyah* up to 1/3), and surviving relatives, certified by a qualified Islamic probate jurist.`,
    principlesAr: `علم الفرائض والمواريث هو العلم الذي يُعرف به من يرث ومن لا يرث ومقدار ما لكل وارث من التركة:
1. **أصحاب الفروض المقدرة في كتاب الله ستة فروض:**
   - *النصف (1/2):* للزوج (عند عدم الفرع الوارث)، والبنت المنفردة، وبنت الابن، والأخت الشقيقة، والأخت لأب.
   - *الربع (1/4):* للزوج (مع الفرع الوارث)، وللزوجة أو الزوجات (عند عدم الفرع الوارث).
   - *الثمن (1/8):* للزوجة أو الزوجات (مع وجود الفرع الوارث) ﴿فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم﴾ [النساء: 12].
   - *الRest (2/3):* للبنتين فأكثر، وبنات الابن فأكثر، والأخوات الشقائق فأكثر.
   - *الثلث (1/3):* للأم (عند عدم الفرع الوارث وعدم جمع من الإخوة)، وللإخوة لأم (إذا كانوا اثنين فأكثر).
   - *السدس (1/6):* للأب والأم (مع الفرع الوارث)، وللجد والجدة، وللواحد من الإخوة لأم.
2. **ميراث الأولاد والعصبات:** ﴿يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ﴾ [النساء: 11]؛ وتوزيع التركات المعقدة يجب أن يُعرض على القضاء الشرعي والعلماء المعتبرين.`,
    evidenceVerses: ['[Surah An-Nisa 4:11]', '[Surah An-Nisa 4:12]', '[Surah An-Nisa 4:176]'],
    evidenceHadiths: ['[Sahih al-Bukhari 6732]', '[Sahih Muslim 1614]'],
  },
  {
    id: 'hadith_authenticity_sciences',
    topic: 'hadith_methodology',
    titleEn: 'Hadith Authenticity, Classifications, and Sciences (Muṣṭalaḥ al-Ḥadīth)',
    titleSo: 'Cilmiga Xadiiska, Heerarka Sugnaanta, iyo Saxiixa/Daciifka (Mustalax al-Xadiis)',
    titleAr: 'علم مصطلح الحديث، شروط الصحة، وتصنيف الأحاديث النبوية',
    keywords: ['hadith authenticity', 'hadith grading', 'is it authentic', 'sahih hadith', 'hasan hadith', 'da\'if', 'daciif', 'saxiix', 'xadiis', 'isnad', 'matn', 'sanad', 'bukhari', 'muslim', 'mustalah', 'xadiis saxiix ah', 'صحة الحديث', 'مصطلح الحديث', 'صحيح', 'ضعيف'],
    principlesSo: `Cilmiga Mustalax al-Xadiis waa manhaj cilmiyeedka adag ee ay culimada Islaamku ku kala saaraan waxa Nabiga ﷺ ka sugnaaday iyo waxaan ka sugnayn:
1. **Shanta Shardi ee Xadiiska Saxiixa ah (Shuruudul Xadiis As-Saxiix):**
   - *Ittisaal As-Sanad (Xiriirka Silsiladda):* In weriye kasta uu si toos ah uga maqlay weriyihii ka horreeyay bilowga ilaa dhammaadka.
   - *Cadaaladda Weriyeyaasha ('Adaalah):* In weriyuhu yahay Muslim, caaqil, qaangaar ah, ka fog dambiyada waaweyn iyo anshax-xumada.
   - *Dabidka (Xifdiga iyo Qoraalka):* In weriyuhu leeyahay xifdi sugan iyo qoraal sax ah oo aan khalad badnayn.
   - *Ka-fogaanshaha Shudhuudha ('Adam ash-Shudhudh):* In weriyuhu uusan khilaafin weriyeyaal ka kalsooni badan.
   - *Ka-fogaanshaha Cillada Qarsoon ('Adam al-'Illah):* In uusan ku jirin cillad qarsoon oo waxyeellaynaysa saxnimada.
2. **Qaybaha Waaweyn ee Xadiiska:**
   - *Saxiix (Authentic):* Xadiiska shantii shardi oo dhan si buuxda u buuxiyay (sida inta badan ku sugan Sahih al-Bukhari iyo Sahih Muslim).
   - *Xasan (Good):* Xadiiska shuruudaha buuxiyay laakiin dabidka/xifdiga weriyuhu wax yar ka hooseeyo saxiixa.
   - *Daciif (Weak):* Xadiiska waayay mid ama wax ka badan oo ka mid ah shuruudaha saxnimada. Laguma dhisi karo caqiido ama xukun xalaal/xaaraan ah.
   - *Mawduuc (Fabricated):* Hadal been abuur ah oo loo nisbeeyay Nabiga ﷺ; waa xaaraan in la weriyo iyadoo aan beennimadiisa la caddaynayn [Sahih al-Bukhari 108].`,
    principlesEn: `The Science of Hadith Verification (*Muṣṭalaḥ al-Ḥadīth*) represents the peerless methodology developed by classical Muslim scholars to authenticate sayings and actions of Prophet Muhammad ﷺ:
1. **The Five Rigorous Criteria for a Sahih (Authentic) Hadith:**
   - *Continuous Chain (*Ittiṣāl as-Sanad*):* Every narrator must have received the text directly from their immediate predecessor without gaps.
   - *Integrity of Character (*'Adālah*):* Narrators must be righteous, truthful Muslims free from major sin and moral defect.
   - *Precision and Retention (*Ḍabṭ*):* Narrators must possess meticulous memory or accurate written records.
   - *Freedom from Irregularity (*'Adam ash-Shudhūdh*):* The narration must not contradict accounts from more reliable authorities.
   - *Freedom from Subtle Defect (*'Adam al-'Illah*):* Free from hidden, destructive flaws that only master critical hadith scholars (*Al-Jahbadh*) uncover.
2. **Major Classifications:**
   - *Ṣaḥīḥ (Sound/Authentic):* Highest grade; legally binding across Aqeedah and Fiqh (epitomized by Sahih al-Bukhari and Sahih Muslim).
   - *Ḥasan (Good/Reliable):* Sound and legally valid, where a narrator's retention is marginally less precise than Sahih standard.
   - *Ḍa'īf (Weak):* Lacks one or more authenticity requirements; unusable for establishing creed or binding legal prohibitions.
   - *Mawḍū' (Fabricated):* Forgery falsely ascribed to the Prophet ﷺ; strictly impermissible to propagate except to expose its falsehood [Sahih al-Bukhari 108].`,
    principlesAr: `علم مصطلح الحديث وقواعد الحكم على الروايات النبوية:
1. **شروط الحديث الصحيح الخمسة المتفق عليها:**
   - اتصال السند: بسماع كل راوٍ ممن فوقه حتى منتهاه.
   - عدالة الرواة: بالتقوى والسلامة من الفسق وخوارم المروءة.
   - ضبط الرواة: تمام الضبط حفظاً وصدراً أو كتاباً.
   - عدم الشذوذ: ألا يخالف الراوي الثقة من هو أوثق منه.
   - عدم العلة القادحة: السلامة من الأسباب الخفية الغامضة القادحة في صحة الحديث.
2. **مراتب الحديث:** الصحيح والحسن (وهما حجة في العقائد والأحكام)، والضعيف (لا يُبنى عليه حكم)، والموضوع (المكذوب على رسول الله ﷺ تحرم روايته إلا لبيان وضعه لقوله ﷺ: «مَن كَذَبَ عَلَيَّ فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ» [صحيح البخاري 108]).`,
    evidenceVerses: ['[Surah Al-Hujurat 49:6]', '[Surah An-Najm 53:3-4]', '[Surah Al-Ahzab 33:21]'],
    evidenceHadiths: ['[Sahih al-Bukhari 108]', '[Sahih Muslim Introduction]', '[Jami\' at-Tirmidhi 2658]'],
  },
  {
    id: 'tafsir_fatihah_meaning',
    topic: 'quran_tafsir',
    titleEn: 'Tafsir and Meanings of Surah Al-Fatihah (The Opening / Umm al-Kitāb)',
    titleSo: 'Fasiraadda iyo Macnaha Suuradda Al-Faatixa (Ummul Kitaab / Todobada Soo Noqnoqda)',
    titleAr: 'تفسير وبيان المعاني الإيمانية لسورة الفاتحة (أم الكتاب والسبع المثاني)',
    keywords: ['fatihah', 'al-fatihah', 'faatixa', 'al-faatixa', 'furitaanka', 'ummul kitaab', 'meaning of fatihah', 'tafsir fatihah', 'fasirada faatixa', 'suuradda faatixa', 'الفاتحة', 'سورة الفاتحة', 'تفسير الفاتحة'],
    principlesSo: `Suuradda Al-Faatixa (Furitaanka) waa suuradda ugu weyn Quraanka Kariimka ah, waxaana lagu magacaabaa *Ummul Kitaab* (Hooyada Kitaabka) iyo *As-Sab\'ul Mathaani* (Todobada soo noqnoqda) [Surah Al-Hijr 15:87]:
1. **Fadligeeda:** Waa tiir ka mid ah tiirarka salaadda, salaadna ma ansaxayso haddii aan la akhrin [Sahih al-Bukhari 756]. Waxay ka kooban tahay 7 aayadood oo Makki ah.
2. **Macnaha Aayadaha:**
   - *1. Bisinka:* Magaca Eebbe ee Naxariistaha guud iyo midka gaaraba lagu bilaabayo.
   - *2. Alxamdulillaahi Rabbil Caalamiin:* Mahadnaq buuxa oo Alle u sugnaatay maadaama uu yahay Barbaariyaha iyo Maamulaha dhammaan koonka.
   - *3. Ar-Raxmaan Ar-Raxiim:* Xaqiijinta naxariistiisa ballaaran ee adduun iyo aakhiro.
   - *4. Maaliki Yawmi-Diin:* Xukunka buuxa ee Maalinta Xisaabta iyo Abaalmarinta (Qiyaamada).
   - *5. Iyyaaka Nacbudu wa Iyyaaka Nastaciin:* Asalka Towxiidka: "Adiga keliyaan ku caabudaynaa, adiga keliyaana gargaar kaa weydiisanaynaa".
   - *6. Ihdina As-Siraad Al-Mustaqiim:* Baryada ugu weyn ee qofku ku baryo Alle: "Nagu hanuuni jidka toosan".
   - *7. Siraada Alladiina Ancamta Calayhim...:* Jidka kuwii Alle u nicmeeyay (Nabiyada, Runlowyada, Shuhadada, iyo Saalixiinta), oo aan ahayn kuwa cadhada mutaystay ama kuwa lumay.`,
    principlesEn: `Surah Al-Fatihah (The Opening) is the greatest Surah in the Holy Quran, designated as *Umm al-Kitāb* (The Mother of the Book) and *As-Sab' al-Mathānī* (The Seven Oft-Repeated Verses) [Surah Al-Hijr 15:87]:
1. **Indispensability in Salah:** Reciting Al-Fatihah is an obligatory pillar of every single prayer unit: "There is no prayer for whoever does not recite the Opening of the Book" [Sahih al-Bukhari 756, Sahih Muslim 394].
2. **Comprehensive Conceptual Framework:**
   - *Praise and Divine Sovereignty (Ayahs 1-4):* Commences with the Basmalah, establishing gratitude to Allah, the Cherisher and Sustainer of the Worlds (*Rabb al-'Ālamīn*), Perpetual Grace (*Ar-Raḥmān Ar-Raḥīm*), and Sole Sovereign over the Day of Recompense (*Mālik Yawm ad-Dīn*).
   - *The Core Covenant of Monotheism (Ayah 5):* "It is You we worship and You we ask for help" (*Iyyāka na'budu wa iyyāka nasta'īn*)—perfect synthesis of Tawheed al-Uluhiyyah and utter reliance.
   - *The Supreme Supplication (Ayahs 6-7):* Asking for perpetual guidance along the Straight Path (*Aṣ-Ṣirāṭ al-Mustaqīm*)—the path of the prophets and righteous, not those who earned anger or went astray.`,
    principlesAr: `سورة الفاتحة أعظم سور القرآن الكريم، وتسمى أم الكتاب، والسبع المثاني، والشفية، والوافية:
1. **ركن الصلاة الأعظم:** قراءة الفاتحة ركن لازم في كل ركعة لحديث: «لا صَلاةَ لِمَن لَمْ يَقْرَأْ بفاتِحَةِ الكِتابِ» [صحيح البخاري 756].
2. **مقاصد السورة:** جمعت مقاصد القرآن كله؛ فاشتملت على توحيد الربوبية والألوهية والأسماء والصفات، وإثبات الجزاء والبعث، والعهد الخالص بين العبد وربه ﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾، وسؤال الهداية إلى الصراط المستقيم صراط المنعم عليهم من النبيين والصديقين والشهداء والصالحين.`,
    evidenceVerses: ['[Surah Al-Fatihah 1:1-7]', '[Surah Al-Hijr 15:87]', '[Surah Al-An\'am 6:153]'],
    evidenceHadiths: ['[Sahih al-Bukhari 756]', '[Sahih al-Bukhari 4474]', '[Sahih Muslim 395]'],
  },
  {
    id: 'madhhab_differences_ikhtilaf',
    topic: 'fiqh_madhhabs',
    titleEn: 'Scholarly Differences and the Four Sunni Madhhabs (Ikhtilāf al-Fuqahā\')',
    titleSo: 'Kala Duwanaanshaha Fiqhiga ee Afarta Madhabood (Shaafici, Xanafi, Maaliki, Xanbali)',
    titleAr: 'أسباب اختلاف الفقهاء والمذاهب الفقهية الأربعة المعتبرة',
    keywords: ['madhhab', 'madhab', 'madhabs', 'schools of thought', 'four madhabs', 'shafii', 'shaafici', 'hanafi', 'xanafi', 'maliki', 'maaliki', 'hanbali', 'xanbali', 'ikhtilaf', 'kala duwanaanshaha culimada', 'المذاهب الأربعة', 'اختلاف الفقهاء'],
    principlesSo: `Kala duwanaanshaha culimada ee arrimaha fiqiga (Ikhtilaaf) waa arrin dabiici ah oo ku salaysan naxariis iyo furfurnaan xagga shareecada ah:
1. **Afarta Madhabood ee Waaweyn:**
   - *Madhabta Xanafiga (Imaam Abuu Xaniifah, 80-150 H):* Wuxuu xoogga saari jiray qiyaaska (Qiyās), ra'yiga fiqhiga, iyo xorriyadda heshiisyada.
   - *Madhabta Maalikiga (Imaam Maalik ibn Anas, 93-179 H):* Wuxuu saldhig xooggan u ahaa camalka reer Madiina ('Amal Ahl al-Madinah) iyo danta guud (Al-Maslahah Al-Mursalah).
   - *Madhabta Shaaficiga (Imaam Maxamed ibn Idriis As-Shaafici, 150-204 H):* Wuxuu aasaasay cilmiga Usuusha Fiqiga, isagoo si buuxda u mideeyay xadiiska iyo fahamka qoto dheer.
   - *Madhabta Xanbaliga (Imaam Axmad ibn Xanbal, 164-241 H):* Wuxuu aad ugu dheggenaa nolosha xadiiska iyo aathaarta saxaabada.
2. **Sababaha Culimadu ku Kala Duwanaadeen:**
   - Fahamka luqadda Carabiga (erayada leh macno ka badan hal, sida ereyga *Qur'*).
   - Gaaridda xadiisku uu gaaray caalimka iyo shuruudaha uu ku aqbalay saxiixnimadiisa.
   - Farqiga xagga mabaadi'da usuusha fiqiga (sida qiyaaska, istixsaanka, iyo maslaxada).
3. **Anshaxa Ikhtilaafka:** Culimadu isma gaalaysiin jirin, ismana necbi jirin; qofka Muslimka ahina wuxuu raacayaa daliilka saxda ah ama madhabta uu barashadeeda kalsoonida ku qabo.`,
    principlesEn: `Legitimate scholarly disagreement (*Ikhtilāf*) among the recognized four Sunni schools of jurisprudence represents flexibility, scholarly depth, and divine mercy:
1. **The Four Foundational Juristic Schools:**
   - *Hanafi School (Imam Abu Hanifah, 80–150 AH):* Pioneered systematic jurisprudence, juristic preference (*Istiḥsān*), and extensive deductive analogical reasoning (*Qiyās*).
   - *Maliki School (Imam Malik ibn Anas, 93–179 AH):* Grounded profoundly in the living practice of the people of Madinah (*'Amal Ahl al-Madīnah*) and public welfare (*Al-Maṣlaḥah al-Mursalah*).
   - *Shafi'i School (Imam Muhammad ibn Idris al-Shafi'i, 150–204 AH):* Codified legal theory (*Uṣūl al-Fiqh* in *Al-Risālah*), harmonizing scriptural Hadith authority with disciplined analogy.
   - *Hanbali School (Imam Ahmad ibn Hanbal, 164–241 AH):* Strongly centered on direct scriptural evidence, marfu' hadiths, and traditions of the Companions (*Athar*).
2. **Causes of Jurisprudential Disagreement (*Asbāb al-Ikhtilāf*):**
   - Linguistic interpretations (words with multiple lexical meanings, such as *Qur'* denoting either purity or menstruation).
   - Variation in hadith transmission across regions before unified codification.
   - Diverse methodological weights assigned to secondary sources.
3. **Islamic Ethics of Disagreement:** The Imams prayed behind one another, respected opposing viewpoints, and condemned sectarian bigotry.`,
    principlesAr: `أسباب اختلاف الفقهاء وأئمة المذاهب الأربعة المتبوعة:
1. **المذاهب الفقهية الأربعة:** الحنفي، والمالكي، والشافعي، والحنبلي؛ وكلهم متفقون على أصول الإيمان، وأركان الإسلام، وقطيعات الشريعة.
2. **أسباب الاختلاف الفقهي المشروع:**
   - دلالات الألفاظ واشتراك المعاني في لغة العرب.
   - تفاوت الرواية وبلوغ الحديث وتصحيحه.
   - الاختلاف في حجية بعض الأصول التبعية؛ كقول الصحابي، والمصالح المرسلة، والاستحسان، وعمل أهل المدينة.
3. **أدب الخلاف:** الاختلاف الفقهي رحمة وسعة، وكان الأئمة يعذر بعضهم بعضاً وينهون عن التعصب المذهبي الأعمى.`,
    evidenceVerses: ['[Surah An-Nisa 4:59]', '[Surah At-Tawbah 9:122]', '[Surah Al-Ma\'idah 5:48]'],
    evidenceHadiths: ['[Sahih al-Bukhari 7352]', '[Sahih Muslim 1716]'],
  },
  {
    id: 'somali_scholars_tafsir_overview',
    topic: 'somali_tafsir',
    titleEn: 'Somali Quran Tafsir Heritage and Scholar Profiles',
    titleSo: 'Taariikhda iyo Dhaxalka Tafsiirka ee Culimada Soomaaliyeed',
    titleAr: 'تراث علماء الصومال في تفسير القرآن الكريم والمحاضرات العلمية',
    keywords: ['sheikh umal', 'shiikh umal', 'sheekh umal', 'sheikh dirir', 'shiikh dirir', 'sheekh dirir', 'cumar faaruuq', 'sheikh farooq', 'sheikh shibli', 'shiikh shibli', 'cabdirashiid suufi', 'sheikh mustafe', 'shiikh mustafe', 'culimada soomaaliyeed', 'tafsiir soomaali'],
    principlesSo: `Tafsiirka Quraanka ee Af-Soomaaliga wuxuu leeyahay taariikh dheer iyo dhaxal ballaaran oo ay reebeen culimo caan ah oo ku caanbaxay fidinta diinta:
1. **Shiikh Maxamed Cabdi Umal:** Caalim weyn oo reer Nairobi ah, faaqide cilmiga xadiiska iyo tafsiirka. Wuxuu duubay tafsiirka Quraanka oo buuxa (249 cashar oo ka bilaabma Al-Faatixa ilaa An-Naas), gaar ahaan sharaxaadda qoto dheer ee Aayadda Kursiga iyo Juz Camma.
2. **Shiikh Maxamed Cumar Dirir:** Caalim iyo macallin weyn oo reer Hargeysa ah, wuxuu duubay 134 cashar oo tafsiir ah oo si fiican u faahfaahiya suuradaha sida Al-Baqarah, Al-Anfaal, iyo Yuusuf.
3. **Shiikh Cumar Faaruuq (Raximahullaah):** Caalimkii ugu horreeyay ee duubay tafsiirka codka ah ee Af-Soomaaliga oo si ballaaran looga dhageysto dhulka Soomaalida (239 cashar).
4. **Shiikh Maxamed Shibli:** Caalim weyn oo reer Kenya ah, oo tafsiirkiisa Juz Camma iyo axkaamta fiqiga si xeeldheer loo barto.
5. **Shiikh Cabdirashiid Cali Suufi:** Caalim caalami ah oo caan ku ah cilmiga Qiraa'aatka iyo codka Qur'aanka.
6. **Shiikh Mustafe Xaaji Ismaaciil:** Caalim iyo mufakkir Islaami ah oo caan ku ah duruusta caqliga iyo cilmiga bulshada ku xirta Quraanka.`,
    principlesEn: `The Somali Quranic commentary (Tafsir) tradition possesses a rich heritage transmitted by renowned contemporary scholars:
1. **Sheikh Mohamed Abdi Umal:** Renowned scholar based in Nairobi, prominent for rigorous hadith analysis and comprehensive 249-lesson complete Quran tafsir (including Juz Amma and detailed Ayat al-Kursi exposition).
2. **Sheikh Mohamed Omar Dirir:** Leading jurist and educator in Hargeisa, famous for clear linguistic and thematic tafsir across 134 structured lessons.
3. **Sheikh Omar Faruq (Rahimahullah):** The pioneer of audio-recorded Somali Quran tafsir, whose comprehensive 239-part commentary educated generations across East Africa.
4. **Sheikh Mohamed Shibli:** Distinguished scholar in Kenya, known for foundational Juz Amma tafsir and fiqh analysis.
5. **Sheikh Abdulrashid Ali Sufi:** World-renowned Qari and scholar of Quranic Qira'at recitations.
6. **Sheikh Mustafe Haji Ismail:** Influential Islamic intellectual known for thematic lectures connecting Quranic guidance to history and contemporary ethics.`,
    principlesAr: `تراث علماء الصومال الأعلام في تدريس التفسير القرآني ونشر العلوم الشرعية باللغة الصومالية الرصينة وفق منهج أهل السنة والجماعة.`,
    evidenceVerses: ['[Surah Fatir 35:28]', '[Surah An-Nahl 16:44]'],
    evidenceHadiths: ['[Sunan Ibn Majah 224]', '[Sahih al-Bukhari 5027]'],
  },
  {
    id: 'tafsir_al_mulk_grave_protection',
    topic: 'tafsir_quran',
    titleEn: 'Surah Al-Mulk: Core Themes, Sovereignty of Allah, and Grave Intercession',
    titleSo: 'Tafsiirka Suurat Al-Mulk: Dulucda Guud iyo Badbaadada Cadaabka Qabriga',
    titleAr: 'تفسير سورة الملك: مقاصدها وفضلها في النجاة والوقاية من عذاب القبر',
    keywords: [
      'tafsiirka suurat al-mulk',
      'suurat al-mulk',
      'suuradda al-mulk',
      'al-mulk',
      'mulk',
      'tabaarak',
      'qabriga',
      'cadaabka qabriga',
      'surah al-mulk',
      'surah 67',
      'سورة الملك',
      'الملك',
      'تبارك'
    ],
    principlesSo: `Suuradda Al-Mulk (Suuradda 67-aad, 30 aayadood, Makkiyah) waa mid ka mid ah suuradaha ugu sharafta badan uguna muhiimsan Quraanka Kariimka ah:
1. **Magacyada Suuradda:** Waxaa loo yaqaannaa *Al-Mulk* (Xukunka), *Tabaarak* (Barakaysane), *Al-Maani'ah* (Ka-reebta cadaabka qabriga), iyo *Al-Munjiyah* (Badbaadisa qofka akhriya).
2. **Fadliga iyo Badbaadada Qabriga:**
   - Nabigu ﷺ wuxuu yiri: «إنَّ سورةً من القرآنِ ثلاثون آيةً شَفَعَتْ لرجلٍ حتى غُفِرَ له: تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ» [Sunan at-Tirmidhi 2891, Sunan Abi Dawud 1400 — Xasan/Saxiix].
   - Cabdullaahi ibn Mascuud wuxuu yiri: "Qofkii akhriya Suuradda Al-Mulk habeen kasta, Alle wuxuu kaga ilaaliyaa cadaabka qabriga; xilligii Rasuulka ﷺ waxaan u bixin jirnay Al-Maani'ah" [As-Sunan al-Kubra an-Nasa'i 10547].
3. **Dulucda Guud iyo Aayadaha Waaweyn:**
   - *Aayadda 1-2:* Xaqiijinta xukunka Alle iyo ujeeddada dhimashada iyo nolosha: ﴿الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا﴾ — Alle wuxuu dhimashada iyo nolosha u abuuray imtixaan si loo kala saaro kuwa camalka wanaagsan la yimaada.
   - *Aayadda 3-5:* Quruxda iyo hab-dhiska todobada samo ee aan lahayn wax nusqaan ah ama daldalool.
   - *Aayadda 13-14:* Cilmiga qotada dheer ee Eebbe: ﴿أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ﴾ — Miyaanu wax walba ogeyn Kii abuuray koonka?
4. **Casharrada Ficiliga ah:** Qofka Muslimka ah waxaa la gudboon inuu joogteeyo akhriskeeda habeen kasta ka hor intuusan seexan, kuna noolaado cabsida iyo weyneynta Alle.`,
    principlesEn: `Surah Al-Mulk (Surah 67, 30 Ayahs, Meccan) is among the most profound and protective chapters of the Holy Quran:
1. **Honorary Titles:** It is designated as *Al-Mulk* (The Dominion), *Tabarak* (The Blessed), *Al-Mani'ah* (The Preventer), and *Al-Munjiyah* (The Rescuer).
2. **Virtue and Intercession in the Grave:**
   - The Prophet Muhammad ﷺ affirmed: "Indeed, there is a Surah of thirty verses that interceded for a man until he was forgiven: 'Blessed is He in whose hand is dominion'" [Jami' at-Tirmidhi 2891, Sunan Abi Dawud 1400 — Hasan/Sahih].
   - Companion Abdullah ibn Mas'ud stated: "Whoever recites Surah Al-Mulk every night, Allah will protect him from the punishment of the grave" [Sunan an-Nasa'i in Al-Kubra 10547].
3. **Core Thematic Pillars:**
   - *Ayahs 1–2:* Affirmation of absolute divine sovereignty and the philosophical purpose of existence: He created death and life solely to test mankind as to who is best in deed.
   - *Ayahs 3–5:* Flawless cosmic architecture of the seven heavens challenging the skeptic to find any imperfection.
   - *Ayahs 13–14:* Comprehensive divine omniscience: "Does He who created not know, while He is the Subtle, the Acquainted?"
4. **Practical Action:** Reciting Surah Al-Mulk attentively every night before sleeping, reflecting upon mortality and standing before the Creator.`,
    principlesAr: `سورة الملك (رقم 67، آياتها 30 آية، مكية) من أعظم سور القرآن تدبراً وفضلاً:
1. **أسماؤها النبوية:** سورة الملك، وتبارك، والمانعة، والمنجية لأنها تمنع صاحبها وتنجيه من عذاب القبر.
2. **فضلها النبوي الثابت:**
   - قال رسول الله ﷺ: «إنَّ سورةً من القرآنِ ثلاثون آيةً شَفَعَتْ لرجلٍ حتى غُفِرَ له: تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ» [سنن الترمذي 2891، سنن أبي داود 1400].
   - وعن ابن مسعود رضي الله عنه: «مَن قرأ تبارك الذي بيده الملك كلَّ ليلةٍ منعه اللهُ بها من عذابِ القبر» [السنن الكبرى للنسائي].
3. **مقاصد السورة العظيمة:**
   - الآيتان 1-2: إثبات الملك والقدرة التامة لله، وغاية خلق الموت والحياة للابتلاء والعمل الصالح.
   - الآيات 3-5: إحكام خلق السماوات السبع دون فطور أو تفاوت دلالةً على كمال الصانع.
   - الآية 14: سعة علم اللطيف الخبير بالسرائر والظواهر.`,
    evidenceVerses: ['[Surah Al-Mulk 67:1-2]', '[Surah Al-Mulk 67:14]'],
    evidenceHadiths: ['[Jami\' at-Tirmidhi 2891]', '[Sunan Abi Dawud 1400]'],
  },
  {
    id: 'tafsir_ayat_al_kursi_verse',
    topic: 'tafsir_quran',
    titleEn: 'Ayat al-Kursi (Al-Baqarah 2:255): The Greatest Verse in the Quran and Divine Names',
    titleSo: 'Fasiraadda Aayat Al-Kursi (Al-Baqarah 255) iyo Magacyada Alle ee ku Jira',
    titleAr: 'تفسير آية الكرسي (البقرة 255): سيدة آي القرآن والدلالات العقدية لأسماء الله',
    keywords: [
      'aayat al-kursi',
      'fasiraadda aayat al-kursi',
      'ayat al-kursi',
      'aayadda kursiga',
      'al-kursi',
      'kursi',
      'kursiga',
      'al-baqarah 255',
      'baqarah 255',
      'surah 2:255',
      'آية الكرسي',
      'الكرسي'
    ],
    principlesSo: `Aayat Al-Kursi (Suuradda Al-Baqarah 2:255) waa aayadda ugu weyn uguna fadliga badan Kitaabka Alle:
1. **Sababta ay u Tahay Aayadda Ugu Weyn:**
   - Markii Nabigu ﷺ weydiiyay Ubayy ibn Kacb: "Waa kuwee aayadda ugu weyn Kitaabka Alle?", Ubayy wuxuu ku jawaabay: "Allaahu laa ilaaha illaa Huwa Al-Xayyul Qayyuum", markaasuu Nabigu ﷺ laabta uga dhuftay isagoo ku yiri: "Hambalyo cilmiga, Abul Mundhir!" [Sahih Muslim 810].
2. **Magacyada iyo Sifooyinka Eebbe ee ku Jira:**
   - *Allaah:* Magaca ugu weyn ee Eebbe ee tilmaamaya Ilaaha xaqa ah.
   - *Al-Xayy:* Noolaha noloshiisu taamka tahay ee aan dhimanayn weligiis.
   - *Al-Qayyuum:* Kan iskii u taagan, maamula, una haya samada, dhulka iyo dhammaan khalqiga.
   - *Al-Caliyy:* Kan ugu sarreeya xagga awoodda, boqornimada iyo sharafta.
   - *Al-Cadhiim:* Weynaha ay weynidiisa wax kasta ka yaryar yihiin.
3. **Macnaha Kursiga (Al-Kursi):** Kursiga Alle waa mid aad u weyn oo ka ballaaran todobada samo iyo dhulka. Cabdullaahi ibn Cabbaas wuxuu yiri: "Kursigu waa mowqifka labada lugood, Carshigana qaddarkiisa Eebbe keliya ayaa og".
4. **Fadliga Joogtada ah:**
   - Qofkii akhriya salaad kasta oo faral ah dabadeed, wax u diidaya Jannada ma jiraan dhimashada mooyee [As-Sunan al-Kubra an-Nasa'i 9848 — Saxiix].
   - Akhriskeeda xilliga hurdada waxay qofka ka ilaalisaa shaydaanka ilaa waagu baryo [Sahih al-Bukhari 2311].`,
    principlesEn: `Ayat al-Kursi (Surah Al-Baqarah 2:255) represents the apex of Quranic revelation and the supreme declaration of pure Islamic monotheism:
1. **Scriptural Primacy:** When the Prophet ﷺ asked Ubayy ibn Ka'b: "Which verse in the Book of Allah is greatest?", Ubayy recited Ayat al-Kursi, to which the Prophet struck his chest affectionately and said: "May knowledge bring you joy, O Abu al-Mundhir!" [Sahih Muslim 810].
2. **The Sublime Divine Names & Attributes:**
   - *Allāh:* The foundational Proper Name of the One True God.
   - *Al-Ḥayy:* The Ever-Living who possesses absolute, eternal, and independent life.
   - *Al-Qayyūm:* The Self-Sustaining Sustainer of all creation.
   - *Negation of slumber and sleep (*Lā ta'khudhuhu sinatun wa-lā nawm*):* Perfect attentiveness and protection without weariness.
   - *Al-'Aliyy & Al-'Aẓīm:* The Most High and Most Magnificent.
3. **The Vastness of the Kursi (The Footstool):** Ibn Abbas explained that the Kursi is the place of the two feet, and the Throne ('Arsh) itself is unimaginably grander.
4. **Protective Virtues:**
   - Reciting it after every obligatory Salah guarantees entrance to Paradise upon death [Sunan an-Nasa'i in Al-Kubra 9848 — Sahih].
   - Reciting it before sleep appoints a guardian angel from Allah preventing Shaytan from approaching until dawn [Sahih al-Bukhari 2311].`,
    principlesAr: `آية الكرسي (سورة البقرة: 255) هي أعظم آية في كتاب الله الكريم بنص الحديث الصحيح:
1. **عظمتها وفضلها:** سأل النبي ﷺ أُبي بن كعب: «أيُّ آيةٍ في كتابِ اللهِ معكَ أعظمُ؟»، فقال: ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾، فضرب في صدره وقال: «لِيَهْنِكَ العِلْمُ أبا المُنْذِرِ» [صحيح مسلم 810].
2. **الأسماء والصفات الإلهية فيها:**
   - تشتمل الآية على خمسة من أمهات أسماء الله الحسنى: الله، الحي، القيوم، العلي، العظيم.
   - تنزيه الله عن النقص والغفلة: ﴿لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ﴾.
3. **معنى الكرسي:** قال ابن عباس رضي الله عنهما: «الكرسي موضع القدمين، والعرش لا يقدر قدره إلا الله تعالى».
4. **ثمراتها وفضائلها:** مَن قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت، ومَن قرأها عند نومه كان عليه من الله حافظ ولم يقربه شيطان حتى يصبح.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:255]'],
    evidenceHadiths: ['[Sahih Muslim 810]', '[Sahih al-Bukhari 2311]', '[As-Sunan al-Kubra an-Nasa\'i 9848]'],
  },
  {
    id: 'tafsir_al_ikhlas_monotheism',
    topic: 'tafsir_quran',
    titleEn: 'Surah Al-Ikhlas: Asbab an-Nuzul, Pure Tawheed, and Equaling One-Third of the Quran',
    titleSo: 'Sababta Soo Degitaanka Suuratul Ikhlaas iyo Sababta ay 1/3 ugu Dhiganto Quraanka',
    titleAr: 'سورة الإخلاص: أسباب نزولها ودلالات التوحيد وعلة معادلتها لثلث القرآن',
    keywords: [
      'sababta suurat al-ikhlas',
      'suuratul ikhlaas',
      'suurat al-ikhlas',
      'suuradda ikhlaas',
      'ikhlaas',
      'ikhlas',
      'qul huwa allahu ahad',
      'saddex meelood',
      '1/3',
      'surah al-ikhlas',
      'surah 112',
      'الإخلاص',
      'سورة الإخلاص'
    ],
    principlesSo: `Suuratul Ikhlaas (Suuradda 112-aad, 4 aayadood, Makkiyah) waa xudunta iyo qirashada saafi ah ee Towxiidka:
1. **Sababta Soo Degitaanka (Asbaab an-Nuzuul):**
   - Waxaa sugan in mushrikiintii ay Nabiga ﷺ ku yiraahdeen: "Maxammadow, noo sheeg nasabka Rabbigaa; ma dahab baa mise qalin mise maar?", markaasuu Alle soo dejiyay: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾ [Sunan at-Tirmidhi 3364, Musnad Ahmad 21217].
2. **Sababta ay ugu Dhiganto Saddex Meelood Hal Quraanka:**
   - Rasuulku ﷺ wuxuu yiri: «وَالَّذِي نَفْسِي بِيَدِهِ إِنَّهَا لَتَعْدِلُ ثُلُثَ الْقُرْآنِ» — "Ilaaha naftaydu gacantiisa ku jirto ayaan ku dhaartaye waxay u dhigantaa saddex meelood hal meel Quraanka" [Sahih al-Bukhari 5013, Sahih Muslim 811].
   - *Fahmiga Culimada:* Quraanka Kariimka ah mawduucyadiisa waaweyn waxay u qaybsamaan 3 qaybood: (1) Towxiidka iyo Magacyada Alle, (2) Axkaamta iyo Shuruucda, iyo (3) Qisooyinka iyo Wacdigii ummadihii hore. Suuratul Ikhlaas waxay si buuxda u koobtay qaybta Towxiidka saafi ah.
3. **Macnaha Ereyada Qotada Dheer:**
   - *Al-Axad:* Midka keliya ee aan lahayn lamaane ama wax la mid ah.
   - *As-Samad:* Eebaha wax kasta ay u baahan yihiin, Isaguna aan cidi u baahnayn, waxba cunin waxna cabin.
   - *Lam yalid wa lam yuulad:* Ma dhalin lamana dhalin, waayo wax la mid ahi ma jiraan.`,
    principlesEn: `Surah Al-Ikhlas (Surah 112, 4 Ayahs, Meccan) encapsulates the purest theology of Islamic Monotheism:
1. **Circumstance of Revelation (Asbab an-Nuzul):**
   - The polytheists of Makkah challenged the Prophet ﷺ: "Describe to us the lineage and substance of your Lord — is He gold, silver, or bronze?" In reply, Allah revealed Surah Al-Ikhlas [Sunan at-Tirmidhi 3364, Musnad Ahmad 21217].
2. **Why It Equals One-Third of the Quran:**
   - The Prophet ﷺ declared: "By the One in whose hand is my soul, it is indeed equal to one-third of the Quran" [Sahih al-Bukhari 5013, Sahih Muslim 811].
   - *Scholarly Consensus:* Islamic scholars (including Ibn Taymiyyah and Al-Qurtubi) explain that the entire Quran consists of three overarching thematic domains: (1) Tawheed and Divine Names/Attributes, (2) Legal Rulings (*Ahkam*), and (3) Historical accounts and parables (*Qisas*). Surah Al-Ikhlas is exclusively and purely dedicated to the first domain (Tawheed), thus equaling one-third of the Quran in theme and reward.
3. **Lexical Meanings:**
   - *Al-Ahad:* The Absolutely One without partner or peer.
   - *As-Samad:* The Eternal Master upon whom all creation depends while He depends upon none.`,
    principlesAr: `سورة الإخلاص (رقم 112، آياتها 4، مكية) هي جوهر عقيدة التوحيد الخالص:
1. **سبب النزول:** سأل المشركون النبي ﷺ: «انسب لنا ربك، أمن ذهب هو أم من فضة؟»، فأنزل الله تعالى السورة داحضةً كل ألوان الشرك والتشبيه.
2. **علة معادلتها لثلث القرآن:**
   - قال رسول الله ﷺ: «والذي نفسي بيده إنها لتعدل ثلث القرآن» [صحيح البخاري 5013، صحيح مسلم 811].
   - بيّن العلماء أن القرآن يشتمل على ثلاثة أصول كبرى: (1) التوحيد والأسماء والصفات، (2) الأحكام والفرائض، (3) القصص والأخبار. وسورة الإخلاص تمحضت بالكلية لبيان التوحيد، فعدلت ثلث القرآن موضوعاً وأجراً.
3. **معاني ألفاظها:**
   - (الأحد): المنفرد بالكمال المطلق الذي لا شبيه له.
   - (الصمد): السيد الذي صمدت إليه الخلائق في حوائجها، الغني عن كل ما سواه.`,
    evidenceVerses: ['[Surah Al-Ikhlas 112:1-4]'],
    evidenceHadiths: ['[Sahih al-Bukhari 5013]', '[Sahih Muslim 811]', '[Sunan at-Tirmidhi 3364]'],
  },
  {
    id: 'hadith_nawawi_first_intentions',
    topic: 'hadith_sciences',
    titleEn: 'Hadith 1 of Forty Nawawi: Actions are Judged by Intentions (Innamal A\'maalu Bin-Niyyaat)',
    titleSo: 'Xadiiska 1-aad ee 40-ka Nawawi (Innamal A\'maalu Bin-Niyyaat)',
    titleAr: 'الحديث الأول من الأربعين النووية: إنما الأعمال بالنيات وشرح معانيه الفقهية',
    keywords: [
      'xadiiska 1-aad nawawi',
      'xadiiska 1aad nawawi',
      'xadiiska 1',
      '40-ka nawawi',
      'nawawi 1',
      'forty nawawi',
      'innamal a\'maalu bin-niyyaat',
      'innamal a\'maalu',
      'bin-niyyaat',
      'niyyaat',
      'niyadda',
      'الأربعين النووية',
      'إنما الأعمال بالنيات'
    ],
    principlesSo: `Xadiiska Koowaad ee Arbacuunka Nawawi (40-ka Nawawi) waa saldhigga iyo tiir-dhexaadka dhammaan camallada Islaamka:
1. **Matn-ka Xadiiska:**
   - Cumar ibn al-Khadhaab (RC) wuxuu yiri: Waxaan maqlay Rasuulka Alle ﷺ oo leh: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ» [Sahih al-Bukhari 1, Sahih Muslim 1907].
2. **Maqaamka Sare ee Xadiiskan:**
   - Imaam Shaafici wuxuu yiri: "Xadiiskani wuxuu fadhiyaa saddex meelood hal meel dhammaan cilmiga Islaamka, wuxuuna galaa 70 albaab oo fiqiga ah."
   - Imaam Bukhaari, Cabdiraxmaan ibn Mahdi, iyo culimo badan waxay kitaabbadooda ku bilaabi jireen xadiiskan si ay dadka ugu baraan daacadnimada niyadda.
3. **Labada Shardi ee Camalku ku Aqbalmo:**
   - *1. Ikhlaas:* In camalka loo gaar yeelo Eebbe oo keliya (daliilkiisu waa xadiiskan Niyadda).
   - *2. Ittibaa':* In camalku waafaqsan yahay sunnada Nabiga ﷺ («Qofkii la yimaada camal aan amarkayaga ku salaysnayn waa mid la celinayo» [Sahih Muslim 1718]).
4. **Faa'iidada Niyadda ee Fiqiga:**
   - Kala soocidda caadada iyo cibaadada (sida qof u qubeysanaya qabowsi iyo qof u qubeysanaya jinaabo).
   - Kala soocidda darajooyinka cibaadada (sida salaad faral ah iyo salaad sunno ah).`,
    principlesEn: `The First Hadith of Imam an-Nawawi's Forty Hadith is the bedrock upon which all Islamic deeds stand or fall:
1. **Text of the Hadith:**
   - Narrated by Amir al-Mu'minin Umar ibn al-Khattab (may Allah be pleased with him): I heard the Messenger of Allah ﷺ say: "Actions are but by intentions, and every person will have only that which they intended. Thus, he whose migration was for Allah and His Messenger, his migration is for Allah and His Messenger; and he whose migration was for a worldly gain he might attain or a woman he might marry, his migration is for that for which he migrated" [Sahih al-Bukhari 1, Sahih Muslim 1907].
2. **Juristic Weight:**
   - Imam Ash-Shafi'i proclaimed: "This Hadith constitutes one-third of all Islamic knowledge, and enters into seventy chapters of jurisprudence."
   - Imam al-Bukhari placed it deliberately as the foundational first Hadith of his Sahih collection.
3. **The Two Inseparable Conditions for Acceptance of Any Deed:**
   - *Sincerity to Allah (Ikhlās):* Addressed directly by this Hadith of intention.
   - *Adherence to Prophetic Sunnah (Ittibā'):* "Whoever innovates in this matter of ours that which is not part of it, it will be rejected" [Sahih Muslim 1718].
4. **Transforming Habits into Worship:** A conscious, pious intention transforms ordinary worldly routines (working, eating, sleeping) into continuous acts of rewarded worship.`,
    principlesAr: `الحديث الأول من الأربعين النووية أصل أصيل تدور عليه أحكام الشريعة كلها:
1. **نص الحديث الصحيح:** عن أمير المؤمنين عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول: «إنَّما الأعمالُ بالنِّيَّاتِ، وإنَّما لِكُلِّ امرِئٍ ما نَوَى، فَمَن كانَتْ هِجْرَتُهُ إلى اللَّهِ ورَسولِهِ فَهجرَتُهُ إلى اللَّهِ ورَسولِهِ، ومَن كانَتْ هِجْرَتُهُ لِدُنْيا يُصِيبُها أوِ امْرَأَةٍ يَنْكِحُها فَهجرَتُهُ إلى ما هاجَرَ إليه» [صحيح البخاري 1، صحيح مسلم 1907].
2. **مكانته الفقهية والعلمية:**
   - قال الإمام الشافعي: «هذا الحديث ثلث العلم، ويدخل في سبعين باباً من الفقه».
   - صدّر به الإمام البخاري صحيحه تذكيراً بإخلاص النية لله في كل طلب.
3. **شرطا قبول العبادة عند أهل السنة:**
   - (الإخلاص): بأن يبتغى بالعمل وجه الله وحده.
   - (المتابعة): بأن يكون العمل موافقاً لهدي النبي ﷺ.
4. **وظيفة النية الفقهية:** تمييز العبادة من العادة، وتمييز رتب العبادات بعضها من بعض (الفرض من النفل).`,
    evidenceVerses: ['[Surah Al-Bayyinah 98:5]', '[Surah Al-Insan 76:9]'],
    evidenceHadiths: ['[Sahih al-Bukhari 1]', '[Sahih Muslim 1907]', '[Sahih Muslim 1718]'],
  },
  {
    id: 'rights_and_care_of_parents',
    topic: 'islamic_ethics',
    titleEn: 'Rights, Honor, and Utmost Care for Parents (Birr al-Walidayn)',
    titleSo: 'Xurmada, Daryeelka iyo Wanaag-u-falka Waalidiinta (Birr al-Walidayn)',
    titleAr: 'بر الوالدين: منزلته في الإسلام، حقوقهما، والتحذير من عقوقهما',
    keywords: [
      'daryeelka waalidiinta',
      'xurmada, daryeelka iyo wanaag-u-falka waalidiinta',
      'wanaag-u-falka waalidiinta',
      'xadiis sugan oo ku saabsan xurmada, daryeelka iyo wanaag-u-falka waalidiinta',
      'xadiis ku saabsan waalidiinta',
      'xurmada iyo daryeelka waalidiinta',
      'waalidiinta',
      'waalidka',
      'xurmada waalidiinta',
      'birr al-walidayn',
      'hooyo',
      'aabbahaa',
      'honoring parents',
      'parents',
      'بر الوالدين',
      'حقوق الوالدين',
      'عقوق الوالدين'
    ],
    principlesSo: `Daryeelka iyo xurmada waalidiinta (Birr al-Walidayn) waa waajibka ugu sarreeya ee qofka saaran Towxiidka ka dib:
1. **Ku Lamaanaynta Towxiidka iyo Daryeelka Waalidiinta:**
   - Alle weyne wuxuu Quraanka ku yiri: ﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾ [Surah Al-Isra 17:23].
   - Wuxuu reebay in xitaa erey ciil ah (sida "Uff") lagu yiraahdo marka ay gaboobaan.
2. **Xuquuqda Gaarka ah ee Hooyada:**
   - Nin baa u yimid Nabiga ﷺ wuxuuna yiri: "Yaa ugu mudan daryeelkayga wanaagsan?", Nabigu wuxuu yiri: "Hooyadaa", ninkii wuxuu yiri: "Kaddibna yaa?", wuxuu yiri: "Hooyadaa", ninkii wuxuu yiri: "Kaddibna yaa?", wuxuu yiri: "Hooyadaa", kaddibna wuxuu yiri: "Aabbahaa" [Sahih al-Bukhari 5971, Sahih Muslim 2548].
   - Xadiiska Jaahimah: Nabigu ﷺ wuxuu ku yiri: "Hooyadaa u khidmee, waayo Jannadu waxay ku hoos jirtaa labadeeda lugood" [Sunan an-Nasa'i 3104].
3. **Khatarta Caasinimada Waalidiinta ('Uquuq al-Walidayn):**
   - Nabigu ﷺ wuxuu ku daray dambiyada kabaa'irta ah ee ugu waaweyn: Shirkiga Alle, caasinimada waalidiinta, iyo marag-furka beenta ah [Sahih al-Bukhari 2654].
4. **Samafalka Geeridooda Ka Dib:**
   - In loo duceeyo, dambi-dhaaf loo weydiiyo, ballamaha ay qaadeen la oofiyo, lana xiriiriyo ehelkooda iyo asxaabtooda.`,
    principlesEn: `Dutifulness to parents (*Birr al-Wālidayn*) is among the greatest virtues in Islam, second only to the worship of Allah:
1. **Coupled with Pure Monotheism:**
   - Allah explicitly links His worship to good treatment of parents: "And your Lord has decreed that you not worship except Him, and to parents, good treatment" [Surah Al-Isra 17:23].
   - The Quran explicitly forbids uttering even the slightest sigh of irritation ("Uff") to them in their old age.
2. **The Triple Priority of the Mother:**
   - When asked who is most deserving of fine companionship, the Prophet ﷺ replied: "Your mother, then your mother, then your mother, then your father" [Sahih al-Bukhari 5971, Sahih Muslim 2548].
   - The Prophet told Jahimah who sought to join an expedition: "Stay with her, for Paradise is beneath her feet" [Sunan an-Nasa'i 3104].
3. **Severe Sin of Disobedience (*'Uqūq*):**
   - Disobedience to parents is categorized among the most destructive major sins (*al-Kabā'ir*) along with polytheism and false testimony [Sahih al-Bukhari 2654].
4. **Honoring Them After Their Passing:**
   - Praying for their forgiveness, fulfilling their unfulfilled promises/charity, honoring their friends, and maintaining the ties of kinship they established.`,
    principlesAr: `بر الوالدين أوجب الواجبات وأعظم القربات بعد توحيد رب البريات:
1. **اقتران حقهما بحق الله:** قال تعالى: ﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾ [سورة الإسراء: 23]، ونهى عن أدنى مراتب التأفف عند كبرهما.
2. **أحقية الأم بالرعاية:** سأل رجل النبي ﷺ: «مَن أَحَقُّ النَّاسِ بحُسْنِ صَحَابَتِي؟ قالَ: أُمُّكَ، قالَ: ثُمَّ مَنْ؟ قالَ: ثُمَّ أُمُّكَ، قالَ: ثُمَّ مَنْ؟ قالَ: ثُمَّ أُمُّكَ، قالَ: ثُمَّ مَنْ؟ قالَ: ثُمَّ أَبُوكَ» [صحيح البخاري 5971، صحيح مسلم 2548].
3. **التحذير الشديد من العقوق:** عدَّ النبي ﷺ عقوق الوالدين من أكبر الكبائر المقرونة بالإشراك بالله.
4. **برهما بعد الممات:** بالدعاء والاستغفار لهما، وإنفاذ عهدهما، وإكرام صديقهما، وصلة الرحم التي لا توصل إلا بهما.`,
    evidenceVerses: ['[Surah Al-Isra 17:23-24]', '[Surah Luqman 31:14]'],
    evidenceHadiths: ['[Sahih al-Bukhari 5971]', '[Sahih Muslim 2548]', '[Sunan an-Nasa\'i 3104]'],
  },
  {
    id: 'akhlaaq_and_mercy_prophetic',
    topic: 'islamic_ethics',
    titleEn: 'Prophetic Character (Husn al-Khuluq) and Universal Mercy in Islam',
    titleSo: 'Akhlaaqda Suubban iyo Naxariista Guud ee Diinta Islaamka',
    titleAr: 'مكارم الأخلاق وسعة الرحمة في الهدي النبوي الشريف',
    keywords: [
      'akhlaaqda & naxariista',
      'akhlaaqda',
      'akhlaaq',
      'naxariista',
      'naxariis',
      'akhlaaqda suubban',
      'makarim al-akhlaaq',
      'husn al-khuluq',
      'noble character',
      'mercy in islam',
      'الأخلاق',
      'الرحمة',
      'مكارم الأخلاق'
    ],
    principlesSo: `Akhlaaqda suubban iyo naxariistu waa laf-dhabarta iyo ujeeddada ugu weyn ee loo soo diray Nabiga ﷺ:
1. **Ujeeddada Soo Diritaanka Nabiga ﷺ:**
   - Rasuulku ﷺ wuxuu yiri: «إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الأَخْلَاقِ» — "Waxaa la ii soo diray uun inaan dhammeystiro akhlaaqda wanaagsan" [Al-Muwatta 1614, Al-Bayhaqi].
   - Alle weyne wuxuu ku ammaanay Nabiga ﷺ: ﴿وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ﴾ [Surah Al-Qalam 68:4].
2. **Miisaanka Akhlaaqda ee Maalinta Qiyaamaha:**
   - Nabigu ﷺ wuxuu yiri: "Waxa ugu culus ee la saari doono Miisaanka qofka mu'minka ah Maalinta Qiyaamaha waa akhlaaqda wanaagsan" [Jami' at-Tirmidhi 2002 — Saxiix].
   - Wuxuu kaloo yiri: "Kuwa iigu jecel idinka uguna dhow fadhigayga Maalinta Qiyaamaha waa kuwa akhlaaqda ugu wanaagsan" [Jami' at-Tirmidhi 2018].
3. **Naxariista Guud ee Khalqiga:**
   - Nabigu ﷺ wuxuu yiri: «الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ» — "Kuwa u naxariista khalqiga waxaa u naxariista Eebaha Raxmaanka ah. U naxariista kuwa dhulka jooga si uu idiinku naxariisto Kan samada jooga" [Jami' at-Tirmidhi 1924 — Saxiix].
   - Naxariistu waxay koobeysaa dadka daciifka ah, agoonta, masaakiinta, iyo xitaa xayawaanka.`,
    principlesEn: `Noble character (*Ḥusn al-Khuluq*) and universal mercy (*Ar-Raḥmah*) constitute the supreme moral essence of the Prophetic message:
1. **The Ultimate Purpose of the Prophetic Mission:**
   - The Prophet Muhammad ﷺ proclaimed: "I was sent only to perfect noble character" [Al-Muwatta 1614, Al-Bayhaqi].
   - Allah Himself praises the Prophet's character in the Quran: "And indeed, you are of a great moral character" [Surah Al-Qalam 68:4].
2. **The Heaviest Deed upon the Scales:**
   - The Prophet ﷺ said: "Nothing is heavier upon the Scale of a believer on the Day of Resurrection than good character" [Jami' at-Tirmidhi 2002 — Sahih].
   - He also affirmed: "Those dearest to me and nearest to me in assembly on the Day of Resurrection are those with the best character among you" [Jami' at-Tirmidhi 2018].
3. **Cosmic & Universal Mercy:**
   - The Prophet ﷺ taught: "The merciful are shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in heaven will be merciful to you" [Jami' at-Tirmidhi 1924 — Sahih].
   - This mercy encompasses all beings: parents, spouses, orphans, neighbors, and all creatures.`,
    principlesAr: `الأخلاق الفاضلة والرحمة الشاملة هما غاية البعثة النبوية الشريفة:
1. **غاية الرسالة المحمدية:**
   - قال رسول الله ﷺ: «إنَّما بُعِثْتُ لِأُتَمِّمَ مَكارِمَ الأخْلاقِ» [موطأ مالك 1614].
   - وأثنى الله تعالى عليه فقال: ﴿وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ﴾ [سورة القلم: 4].
2. **أثقل ما يوضع في الميزان:**
   - قال ﷺ: «ما شيءٌ أثقلُ في ميزانِ المُؤمنِ يومَ القيامةِ من خُلقٍ حسنٍ» [جامع الترمذي 2002].
   - وقال ﷺ: «إنَّ من أحبِّكم إليَّ وأقربِكم منِّي مجلساً يومَ القيامةِ أحاسنَكم أخلاقاً» [جامع الترمذي 2018].
3. **شمولية الرحمة النبوية:**
   - قال ﷺ: «الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ» [جامع الترمذي 1924].`,
    evidenceVerses: ['[Surah Al-Qalam 68:4]', '[Surah Al-Anbiya 21:107]'],
    evidenceHadiths: ['[Al-Muwatta 1614]', '[Jami\' at-Tirmidhi 1924]', '[Jami\' at-Tirmidhi 2002]'],
  },
  {
    id: 'prayer_shurut_arkan_wajibat',
    topic: 'worship_salah',
    titleEn: 'Conditions (Shurut), Pillars (Arkan), and Obligatory Acts (Wajibat) of Salah',
    titleSo: 'Shuruudaha, Tiirarka iyo Waajibaadka Salaadda ee Qofka looga Baahan Yahay',
    titleAr: 'منظومة الصلاة الكاملة: شروطها التسعة، أركانها الأربعة عشر، وواجباتها الثمانية',
    keywords: [
      'shuruudaha salaadda',
      'tiirarka salaadda',
      'waajibaadka salaadda',
      'shuruudaha, tiirarka',
      'shuruudaha',
      'arkaan al-salah',
      'conditions of prayer',
      'pillars of prayer',
      'شروط الصلاة',
      'أركان الصلاة',
      'واجبات الصلاة'
    ],
    principlesSo: `Salaaddu si ay u noqoto mid ansax ah oo Alle agtiisa laga aqbalo, waxay leedahay shuruudo, tiirar iyo waajibaad:
1. **9-ka Shardi ee Salaadda (Ka Hor Bilaabashada):**
   - 1. Islaamnimo, 2. Caqli taam ah, 3. Tamyiis (kala-garasho), 4. Daahirinta xadaska (weeso/qubeys), 5. Daahirinta najaasada jirka, dharka iyo meesha, 6. Asturidda cawrada, 7. Gelitaanka waqtiga salaadda, 8. U jeesashada Qiblada, 9. Niyadda.
2. **14-ka Tiir (Arkaan) ee Haddii Mid Ka Dhaco aysan Ansaxayn:**
   - 1. Qiyaamka qofkii awooda, 2. Takbiirta hore (Allaahu Akbar), 3. Akhrinta Faatixada, 4. Rukuuca, 5. Toosashada rukuuca (Ictidaal), 6. Sujuudda todobada xubnood, 7. Ka toosashada sujuudda, 8. Fadhiga u dhexeeya labada sujuudood, 9. Tashaxudka dambe, 10. Fadhiga tashaxudka dambe, 11. Salaadda Nabiga ﷺ ee tashaxudka, 12. Salaamo-naqsiga, 13. Xasiloonida (Dhuma'niinah) rukun kasta, 14. Tartiibinta arkaanada.
3. **8-da Waajib ee Lagu Kabi Karo Sujuudda Sahwiga:**
   - Takbiiraha kala-guurka, dhahida "Subxaana Rabbiyal Cadhiim" rukuuca, "Samicallaahu liman xamidah" imaamka iyo kaligiis tukanaha, "Rabbanaa wa lakal xamd", "Subxaana Rabbiyal A'laa" sujuudda, "Rabbighfir lii" labada sujuudood dhexdooda, Tashaxudka koowaad, iyo fadhigiisa.`,
    principlesEn: `The complete legal structure of Salah rests upon three distinct categories: conditions, pillars, and obligatory elements:
1. **The 9 Preconditions (Shurūṭ) Prior to Commencing:**
   - Islam, Sanity, Discernment, Purification from minor and major impurities, Cleanliness from physical filth on body/clothes/location, Covering the Awrah, Entry of the prayer time, Facing the Qiblah, and Sincere Intention.
2. **The 14 Pillars (Arkān) Without Which Prayer is Completely Invalid:**
   - Standing (*Qiyam*) for the able, Opening Takbir, Recitation of Surah Al-Fatihah, Bowing (*Ruku'*), Straightening from Ruku', Prostrating (*Sujud*) upon the 7 limbs, Rising from Sujud, Sitting between the two prostrations, The Final Tashahhud, Sitting for the Final Tashahhud, Supplication for the Prophet ﷺ, The Closing Taslim, Serenity (*Tuma'ninah*) in every posture, and Proper Sequence.
3. **The 8 Obligatory Acts (Wājibāt) Compensated by Sujūd as-Sahw:**
   - Transition Takbirs, "Subhana Rabbiyal Adheem" in Ruku', "Sami'allahu liman hamidah", "Rabbana wa lakal hamd", "Subhana Rabbiyal A'la" in Sujud, "Rabbighfir li" between prostrations, the First Tashahhud, and sitting for it.`,
    principlesAr: `منظومة الصلاة في الفقه الإسلامي تشتمل على الشروط والأركان والواجبات:
1. **شروط الصلاة التسعة (السابقة لها):** الإسلام، العقل، التمييز، رفع الحدث، طهارة النجاسة، ستر العورة، دخول الوقت، استقبال القبلة، والنية.
2. **أركان الصلاة الأربعة عشر (التي لا تسقط عمداً ولا سهواً):** القيام مع القدرة، تكبيرة الإحرام، قراءة الفاتحة، الركوع، الرفع منه، الاعتدال قائماً، السجود على الأعضاء السبعة، الرفع منه، الجلوس بين السجدتين، الطمأنينة في جميع الأركان، التشهد الأخير، الجلوس له، الصلاة على النبي ﷺ، والتسليمتان، والترتيب.
3. **واجبات الصلاة الثمانية (التي تُجبر بسجود السهو):** التكبيرات لغير الإحرام، قول سبحان ربي العظيم في الركوع، سمع الله لمن حمده للإمام والمنفرد، ربنا ولك الحمد للجميع، سبحان ربي الأعلى في السجود، رب اغفر لي بين السجدتين، والتشهد الأول والجلوس له.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:43]', '[Surah Al-Ma\'idah 5:6]'],
    evidenceHadiths: ['[Sahih al-Bukhari 757]', '[Sahih Muslim 397]'],
  },
  {
    id: 'zakat_calculation_savings_nisab',
    topic: 'worship_zakat',
    titleEn: 'Zakat Calculation: Gold and Cash Nisab, Lunar Hawl, and Formula',
    titleSo: 'Xisaabinta Zakada Hantida, Lacagta Kaydsan, Dahabka iyo Nisaabka',
    titleAr: 'طريقة حساب زكاة المال والمدخرات والذهب وبيان النصاب الشرعي (2.5%)',
    keywords: [
      'xisaabinta zakada',
      'zakada hantida',
      'lacagta kaydsan',
      'immisa ayuuna yahay nisaabku',
      'nisaabku',
      'nisaabka',
      'zakat calculation',
      'calculate zakat',
      'nisab',
      '2.5%',
      'حساب الزكاة',
      'نصاب الزكاة'
    ],
    principlesSo: `Xisaabinta Zakada lacagta kaydsan iyo hantida waxay ku socotaa qaacidooyin cadcad oo shareecadu jideysay:
1. **Nisaabka Sharciga ah ee Lacagta iyo Dahabka:**
   - *Nisaabka Dahabka:* Waa **85 garaam** oo dahab saafi ah (24K).
   - *Nisaabka Qalinka:* Waa **595 garaam** oo qalin saafi ah.
   - *Nisaabka Lacagta Maanta:* Waxaa lagu xisaabiyaa qiimaha uu maanta suuqa ka joogo 85 garaam oo dahab ah. Haddii qiimaha 1g oo dahab ah uu yahay tusaale $70, nisaabku waa $5,950.
2. **Shuruudaha Waajibnimada:**
   - Hantidu inay gaarto ama ka badato nisaabka.
   - Inay tahay hanti dheeri ku ah baahiyaha asalka ah ee qofka (cuntada, guriga, gaadiidka shakhsiga ah).
   - Inuu u wareego **Sanad Qamari ah (Xawl)** oo ah 354 maalmood iyadoo aan ka hoos marin nisaabka.
3. **Qaacidada Xisaabinta:**
   - Qaddarka laga bixinayo waa **2.5%** (ama hantida oo dhan oo loo qaybiyo 40).
   - *Tusaale:* Haddii aad haysato $10,000 oo sanad kuu kaydsanayd:
     $$\\text{Zakada} = 10,000 \\times 0.025 = \\$250$$ (ama $10,000 \\div 40 = \\$250$).
4. **Dadka La Siiyo Zakada:**
   - Sideedda qaybood ee ku cad Surah At-Tawbah 9:60 (Fuqarada, Masaakiinta, Deyn-qabayaasha, iwm).`,
    principlesEn: `Calculating Zakat on cash savings, business inventory, and precious metals adheres to clear juristic formulas:
1. **The Legal Nisab Threshold:**
   - *Gold Standard:* Exactly **85 grams** of pure gold (24-karat) or equivalent in cash.
   - *Silver Standard:* Exactly **595 grams** of pure silver.
   - *Cash Equivalent:* Calculate current market value: (85 × current price per gram of 24k gold). Any savings equal to or exceeding this threshold qualifies.
2. **Core Conditions of Obligation:**
   - Full legal ownership and liquidity beyond fundamental living necessities (housing, primary transport, basic family upkeep).
   - Passage of one full lunar year (*Hawl* = 354 days) while maintaining wealth at or above Nisab.
3. **The Exact Calculation Formula:**
   - Pay exactly **2.5%** (one-fortieth) of the net eligible savings.
   - Formula: $\\text{Zakat} = \\text{Total Eligible Savings} \\times 0.025$ (or divide total by 40).
   - *Example:* On $10,000 kept for one lunar year: $\\$10,000 \\div 40 = \\$250$.
4. **Legitimate Recipients:**
   - Restricted exclusively to the eight Quranic categories designated in Surah At-Tawbah 9:60.`,
    principlesAr: `كيفية حساب زكاة المال والمدخرات والذهب وفق الشريعة الإسلامية:
1. **النصاب الشرعي للمال:**
   - نصاب الذهب: 85 غراماً من الذهب الخالص (عيار 24).
   - نصاب الفضة: 595 غراماً من الفضة الخالصة.
   - يُقدَّر نصاب الأوراق النقدية المعاصرة بقيمة 85 غراماً من الذهب بسعر السوق يوم وجوب الزكاة.
2. **شروط الوجوب:**
   - بلوغ النصاب، والملك التام الفائض عن الحاجات الأصلية.
   - مرور حول قمري كامل (354 يوماً) على النصاب.
3. **معادلة الحساب الشرعية:**
   - النسبة الواجبة شرعاً هي ربع العشر: **2.5%** (أو قسمة المبلغ على 40).
   - *مثال:* مَن ادخر 10,000 دولار وحال عليها الحول: $10,000 ÷ 40 = 250 دولاراً.
4. **مصارف الزكاة:** الثمانية المذكورة في سورة التوبة آية 60.`,
    evidenceVerses: ['[Surah At-Tawbah 9:60]', '[Surah Al-Baqarah 2:43]'],
    evidenceHadiths: ['[Sahih al-Bukhari 1454]', '[Sunan Abi Dawud 1573]'],
  },
  {
    id: 'fasting_nullifiers_and_invalidation',
    topic: 'worship_fasting',
    titleEn: 'Nullifiers and Invalidators of the Fast (Mufattirat as-Sawm)',
    titleSo: 'Waxyaabaha Buriya ama Jebiya Soonka ee Qofka Sooman',
    titleAr: 'مفطرات الصيام ومبطلاته في الفقه الإسلامي وما يعفى عنه',
    keywords: [
      'waxyaabaha soonka jebiya',
      'waxyaabaha buriya ama jebiya soonka',
      'buriya ama jebiya soonka',
      'waxyaabaha buriya soonka',
      'waxyaabaha jebiya soonka',
      'jebiya soonka',
      'buriya soonka',
      'soonka jabiya',
      'nullifiers of fasting',
      'invalidates fast',
      'mufattirat',
      'مبطلات الصوم',
      'مفطرات الصيام'
    ],
    principlesSo: `Waxyaabaha buriya ama jebiya soonka ee qofka sooman waxaa loo qaybiyaa labo qaybood oo waaweyn:
1. **Waxyaabaha Jebiya ee Qadaada Keliya Waajibiya:**
   - *Cunidda iyo Cabbitaanka ku talagalka ah:* Wax kasta oo afka ama sanka ka gala dhuunta ama caloosha.
   - *Matagga kas ah:* Qofka iska keena matagga wuu jabanayaa, haddiise uu qasab kaga yimaado soonkiisu waa saxan yahay [Sunan at-Tirmidhi 720].
   - *Dhiigga Xaydka ama Nifaaska:* Isla marka uu dhiiggu yimaado xitaa haddii ay qorrax-u-dhaca hal daqiiqo ka dhiman tahay, soonku wuu burayaa waxaana waajib ah in dib laga qaleeyo.
   - *Cirbadaha Nafaqada leh:* Cirbadaha beddela cuntada iyo cabbitaanka ee xididka lagu shubo.
2. **Waxyaabaha Jebiya ee Qadaada iyo Kafaarada Culus Waajibiya:**
   - *Galmada maalintii Ramadaanka:* Waa dambi aad u weyn oo soonka jebiya, wuxuuna waajibinayaa Qadaa iyo Kafaaro culus: (1) Xoraynta addoon, haddii la waayana (2) Soonka labo bilood oo xiriir ah (60 maalmood), haddii la awoodi waayana (3) Quudinta 60 miskiin [Sahih al-Bukhari 1936].
3. **Waxyaabaha AAN Jebin Soonka (Dadku Isku Khaldaan):**
   - Cunista ama cabbitaanka ilowshaha ku dhaca: Nabigu ﷺ wuxuu yiri: "Qofkii sooman ee wax cuna ama cabba isagoo iloobay, soonkiisa ha dhammeystiro waayo Alle ayaa quudiyay oo waraabiyay" [Sahih al-Bukhari 1933].
   - Cadayga caadiga ah, dhibicda indhaha, qubeyska qabowbinta, iyo dhiig-qaadista yar ee baaritaanka caafimaadka.`,
    principlesEn: `The nullifiers of fasting (*Mufaṭṭirāt aṣ-Ṣawm*) fall into specific legal classifications:
1. **Nullifiers Requiring Make-Up Fast (*Qadā'*) Only:**
   - *Deliberate Eating and Drinking:* Anything entering the throat or stomach through mouth or nose intentionally.
   - *Intentional Vomiting:* The Prophet ﷺ clarified: "Whoever is overcome by vomiting does not have to make it up, but whoever vomits deliberately must make it up" [Jami' at-Tirmidhi 720].
   - *Menstruation (*Ḥayḍ*) or Post-Natal Bleeding (*Nifās*):* Even if it occurs moments before sunset, the fast is nullified and made up after Ramadan.
   - *Nutritional Injections:* Intravenous drips and nutrient infusions that nourish the body like food and drink.
2. **Nullifier Requiring Qadā' and Heavy Expiation (*Kaffārah Mughallaẓah*):**
   - *Sexual Intercourse During Daytime of Ramadan:* Incurs grave sin, requiring making up the day PLUS strict expiation: freeing a slave, or fasting two consecutive lunar months, or feeding sixty poor persons [Sahih al-Bukhari 1936].
3. **Acts that DO NOT Invalidate the Fast:**
   - Eating or drinking out of forgetfulness [Sahih al-Bukhari 1933].
   - Using the Miswak/toothbrush without swallowing toothpaste, eye/ear drops, cooling off with water, and routine diagnostic blood tests.`,
    principlesAr: `مفطرات الصيام ومبطلاته في الفقه تنقسم إلى قسمين:
1. **ما يوجب القضاء فقط:**
   - الأكل والشرب عمداً من الفجر إلى المغرب.
   - الاستقاءة عمداً (إخراج القيء قصداً)، أما مَن ذرعه القيء فلا قضاء عليه لحديث الترمذي.
   - خروج دم الحيض والنفاس ولو قبل الغروب بلحظة.
   - الإبر المغذية التي تقوم مقام الطعام والشراب.
2. **ما يوجب القضاء والكفارة المغلظة:**
   - الجماع في نهار رمضان عامداً مختاراً، وكفارته عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً [صحيح البخاري 1936].
3. **ما لا يُفطر ويعفى عنه:** الأكل والشرب ناسياً، قطرة العين والأذن، السواك، الغسل للتبرد، وتحليل الدم اليسير.`,
    evidenceVerses: ['[Surah Al-Baqarah 2:187]'],
    evidenceHadiths: ['[Sahih al-Bukhari 1933]', '[Sahih al-Bukhari 1936]', '[Jami\' at-Tirmidhi 720]'],
  },
  {
    id: 'authentic_morning_evening_adhkar',
    topic: 'dua_dhikr',
    titleEn: 'Authentic Morning and Evening Adhkar (Adhkar as-Sabah wa-l-Masa\')',
    titleSo: 'Ducooyinka Adkaarta Subaxda iyo Fiidka ee Sunnada ka Sugnaaday',
    titleAr: 'أذكار الصباح والمساء الصحيحة وفضائلها وحفظها للمسلم',
    keywords: [
      'ducooyinka subaxda iyo fiidka',
      'ducooyinka adkaarta',
      'adkaarta subaxda iyo fiidka',
      'subaxda iyo fiidka',
      'adkaarta subaxda',
      'adkaarta fiidka',
      'adkaar',
      'adkaarta',
      'morning and evening adhkar',
      'adhkar as-sabah',
      'أذكار الصباح',
      'أذكار المساء',
      'أذكار الصباح والمساء',
      'الأذكار'
    ],
    principlesSo: `Adkaarta subaxda iyo fiidka (Adkaar as-Sabaax wal-Masaa') waa gaashaanka ruuxiga ah ee qofka Muslimka ah ka ilaaliya shar kasta:
1. **Waqtiyada Sharciga ah:**
   - *Adkaarta Subaxda:* Waxay bilaabataa dillaaca waaberiga (Fajarka) ilaa qorraxdu ka soo baxdo (waxayna bannaantahay ilaa barqada).
   - *Adkaarta Fiidka:* Waxay bilaabataa salaadda Casar kaddib ilaa qorrax-u-dhaca (ama ilaa bartanka habeenka).
2. **Aayadaha iyo Suuradaha ugu Muhiimsan:**
   - *Aayat Al-Kursi:* Qofkii subaxdii akhriya waxaa laga ilaaliyaa jinka ilaa fiidka, kii fiidkii akhriyana ilaa subaxda [Al-Xaakim, Saxiix].
   - *Saddexda Qul (Al-Ikhlaas, Al-Falaq, An-Naas):* Waxaa la akhriyaa min 3 jeer subaxdii iyo fiidkii; waxay kaafiyaan qofka wax kasta [Sunan Abi Dawud 5082].
3. **Ducooyinka Nabawiga ah ee Sugan:**
   - «بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ» (3 jeer) — Qofka akhriya wax dhib ah ma gaaraan [Sunan Abi Dawud 5088].
   - «أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ» (3 jeer fiidkii) — Qaniinyo iyo sun wax ma yeelaan [Sahih Muslim 2709].
   - «أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...» [Sahih Muslim 2723].
   - *Sayyidul Istiqfaar:* Ducooyinka dambi-dhaafka madaxdooda.`,
    principlesEn: `Morning and Evening Adhkar (*Adhkār aṣ-Ṣabāḥ wa-l-Masā'*) serve as the believer's divine spiritual fortress:
1. **Prescribed Times:**
   - *Morning Adhkar:* From Fajr dawn until sunrise (extendable into early forenoon).
   - *Evening Adhkar:* From 'Asr afternoon until sunset (extendable into early night).
2. **Foundational Quranic Protections:**
   - *Ayat al-Kursi (2:255):* Protects against devilish interference from dawn to dusk and vice versa [Al-Hakim, Sahih].
   - *The Three Mu'awwidhat (Surahs Al-Ikhlas, Al-Falaq, An-Nas):* Recited 3 times each morning and evening; suffices the believer against all harm [Sunan Abi Dawud 5082].
3. **Core Verified Prophetic Invocations:**
   - "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing" (3 times) [Sunan Abi Dawud 5088].
   - "I seek refuge in the perfect words of Allah from the evil of what He has created" (3 times in the evening) [Sahih Muslim 2709].
   - "We have reached the morning and the dominion belongs to Allah, and all praise is for Allah..." [Sahih Muslim 2723].
   - *Sayyid al-Istighfar* (The Master Supplication for Forgiveness).`,
    principlesAr: `أذكار الصباح والمساء هي حصن المسلم المنيع وسبيل الطمأنينة والسكينة:
1. **أوقاتها الشرعية:**
   - أذكار الصباح: من طلوع الفجر الصادق حتى طلوع الشمس.
   - أذكار المساء: من بعد صلاة العصر حتى غروب الشمس أو أوائل الليل.
2. **الآيات والسور الأساسية:**
   - آية الكرسي: مَن قرأها حين يصبح أجير من الجن حتى يمسي، ومَن قرأها حين يمسي أجير منهم حتى يصبح.
   - المعوذات (الإخلاص، الفلق، الناس) 3 مرات: تكفي من كل شيء.
3. **الأدعية النبوية الثابتة:**
   - «بسمِ اللهِ الذي لا يَضُرُّ مع اسمِهِ شيءٌ في الأرضِ ولا في السَّماءِ وهو السَّميعُ العليمُ» (3 مرات).
   - «أعوذُ بكلماتِ اللهِ التَّامَّاتِ من شرِّ ما خَلَقَ» (3 مرات في المساء).
   - سيد الاستغفار: «اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ...».`,
    evidenceVerses: ['[Surah Taha 20:130]', '[Surah Ghafir 40:55]'],
    evidenceHadiths: ['[Sunan Abi Dawud 5088]', '[Sahih Muslim 2709]', '[Sunan Abi Dawud 5082]'],
  },
  {
    id: 'dua_for_grief_and_distress',
    topic: 'dua_dhikr',
    titleEn: 'Supplications for Relief from Grief, Anxiety, and Distress (Du\'a al-Karb)',
    titleSo: 'Ducada Murugada, Welwelka, Walbahaarka iyo Diiqadda (Du\'a al-Karb)',
    titleAr: 'أدعية تفريج الكرب والهم والحزن والضيق من السنة النبوية الصحيحة',
    keywords: [
      'ducada murugada & welwelka',
      'ducada murugada',
      'murugada',
      'welwelka',
      'walwal',
      'diiqad',
      'murugo',
      'distress',
      'relief from grief',
      'anxiety dua',
      'dua al-karb',
      'دعاء الكرب',
      'دعاء الهم والحزن',
      'تفريج الهم'
    ],
    principlesSo: `Diinta Islaamku waxay qofka qalbigiisa ku taabta diiqadda ama murugada baraysaa ducooyin nabawi ah oo degdeg wax uga tara:
1. **Ducadii Nebi Yoonis (Du'a Dhin-Nuun):**
   - ﴿لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ﴾ [Surah Al-Anbiya 21:87].
   - Nabigu ﷺ wuxuu yiri: «دَعْوَةُ ذِي النُّونِ إِذْ دَعَا وَهُوَ فِي بَطْنِ الْحُوتِ... لَمْ يَدْعُ بِهَا رَجُلٌ مُسْلِمٌ فِي شَيْءٍ قَطُّ إِلَّا اسْتَجَابَ اللَّهُ لَهُ» — "Ducadii Nebi Yoonis markuu ku jiray caloosha kalluunka... Ma jiro qof Muslim ah oo dhibaato ku haysato oo ku duceysta iyada illaa Alle wuu ka ajiibaa oo dhibka ka kaxeeyaa" [Jami' at-Tirmidhi 3505 — Saxiix].
2. **Ducada Murugada iyo Deynta (Du'a al-Hamm wal-Xazan):**
   - «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ» [Sahih al-Bukhari 2893].
3. **Ducada Al-Karb (Dhibaatada Weyn):**
   - Nabigu ﷺ marka uu dhib weyn la kulmo wuxuu dhihi jiray: «لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ» [Sahih al-Bukhari 6345, Sahih Muslim 2730].
4. **Ducada Deganaanshaha:** «يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ» [Sunan an-Nasa'i, Saxiix].`,
    principlesEn: `When faced with grief, sorrow, panic, or overwhelming anxiety, the Sunnah prescribes profound invocations:
1. **The Supplication of Prophet Yunus (Dhu an-Nun):**
   - Quran [Surah Al-Anbiya 21:87]: *"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."*
   - The Prophet ﷺ affirmed: "No Muslim supplication with this in any distress except that Allah relieves him" [Jami' at-Tirmidhi 3505 — Sahih].
2. **Du'a Against Anxiety and Debt:**
   - "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men" [Sahih al-Bukhari 2893].
3. **Du'a al-Karb (The Supreme Distress Prayer):**
   - "There is no deity except Allah, the Magnificent, the Forbearing; there is no deity except Allah, Lord of the Magnificent Throne; there is no deity except Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne" [Sahih al-Bukhari 6345, Sahih Muslim 2730].
4. **Relief Through Ya Hayyu Ya Qayyum:**
   - "O Ever-Living, O Sustainer, by Your mercy I seek assistance; rectify for me all of my affairs and do not leave me to myself even for the blink of an eye."`,
    principlesAr: `أدعية تفريج الكرب وإزالة الهم والحزن من كنوز السنة الصحيحة:
1. **دعوة ذي النون عليه السلام:** ﴿لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ﴾، قال ﷺ: «لم يدعُ بها رجلٌ مسلمٌ في شيءٍ قطُّ إلا استجاب اللهُ له» [جامع الترمذي 3505].
2. **دعاء تفريج الهم والدين:** «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ» [صحيح البخاري 2893].
3. **دعاء الكرب العظيم:** «لا إِلَهَ إِلا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لا إِلَهَ إِلا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ» [صحيح البخاري 6345].
4. **دعاء الاستغاثة برحمة الله:** «يا حيُّ يا قيُّومُ برحمتِكَ أستغيثُ، أصلِحْ لي شأني كُلَّهُ، ولا تَكِلْني إلى نفسي طرفةَ عينٍ».`,
    evidenceVerses: ['[Surah Al-Anbiya 21:87]', '[Surah Ash-Sharh 94:5-6]'],
    evidenceHadiths: ['[Sahih al-Bukhari 6345]', '[Sahih al-Bukhari 2893]', '[Jami\' at-Tirmidhi 3505]'],
  },
  {
    id: 'sayyidul_istighfar_master_prayer',
    topic: 'dua_dhikr',
    titleEn: 'Sayyid al-Istighfar: The Master Supplication for Seeking Forgiveness',
    titleSo: 'Sayyidul Istiqfaar: Ducooyinka Dambi-dhaafka Madaxdooda',
    titleAr: 'سيد الاستغفار: نصه الصحيح، معانيه العقدية العميقة، وفضله العظيم',
    keywords: [
      'sayyidul istiqfaar',
      'sayyidul istighfar',
      'sayyid al-istighfar',
      'sayyidul-istiqfaar',
      'duco dambi dhaaf',
      'master supplication',
      'سيد الاستغفار'
    ],
    principlesSo: `Sayyidul Istiqfaar waa ducada ugu sarreysa uguna qiimaha badan ee dambi-dhaaf lagu weydiisto Alle:
1. **Matn-ka Saxiixa ah ee Ducada:**
   - Shaddaad ibn Aws wuxuu wariyay in Nabigu ﷺ yiri: «سَيِّدُ الاِسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ» [Sahih al-Bukhari 6306].
2. **Macnaha iyo Fahamka Qotada Dheer:**
   - *Allaahumma Anta Rabbii:* Qirashada Towxiidka Rubuubiyada.
   - *Laa ilaaha illaa Anta:* Qirashada Towxiidka Uluuhiyadada (cibaadada).
   - *Khalaqtanii wa ana 'abduka:* Qirashada abuurista iyo addoonnimada dhabta ah.
   - *Wa ana 'alaa 'ahdika wa wa'dika mastada'tu:* Inuu qofku ballanta Alle ku taagan yahay inta tamartiisu tahay.
   - *Abuudhu bika min sharri maa sana'tu:* Ka magan-galka cawaaqibta xun ee dambiyada.
   - *Abuu'u laka bini'matika 'alayya:* Qirashada nimcooyinka badan ee Alle ku galadaystay.
   - *Wa abuu'u laka bidhambii:* Qirashada dunuubta iyo khaladaadka.
   - *Faghfir lii fa-innahu laa yaghfirudh-dhunuuba illaa Anta:* Dambi-dhaaf weydiisasho, waayo cid kale oo dambiyada cafisa ma jirto.
3. **Fadliga Weyn:**
   - Nabigu ﷺ wuxuu yiri: "Qofkii akhriya galabtii isagoo yaqiinsan oo habeenkaas dhinta ka hor waaberiga, wuxuu ka mid yahay reer Jannaha; qofkii subaxdiina akhriya isagoo yaqiinsan oo maalintaas dhinta, wuxuu ka mid yahay reer Jannaha" [Sahih al-Bukhari 6306].`,
    principlesEn: `Sayyid al-Istighfar (The Master Supplication for Seeking Forgiveness) is the most supreme phrasing of repentance taught by the Prophet Muhammad ﷺ:
1. **Authentic Prophetic Text:**
   - Narrated by Shaddad ibn Aws: The Prophet ﷺ said: "The master of seeking forgiveness is that you say: *'Allāhumma Anta Rabbī, lā ilāha illā Anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastata'tu, a'ūdhu bika min sharri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u laka bidhanbī, faghfir lī fa-innahu lā yaghfiru adh-dhunūba illā Anta'*." [Sahih al-Bukhari 6306].
2. **Profound Theological Anatomy:**
   - Acknowledgment of Allah's Lordship (*Rububiyyah*) and Divinity (*Uluhiyyah*).
   - Humility in recognizing oneself as a created, dependent servant.
   - Commitment to the divine covenant within human capability.
   - Seeking refuge from the evil consequences of one's own sins.
   - Gratitude for Allah's abundant favors coupled with honest confession of shortcomings.
   - Absolute conviction that none can forgive sins except Allah.
3. **Immeasurable Reward:**
   - The Prophet ﷺ said: "Whoever recites it in the evening with firm conviction and dies that night before morning enters Paradise; and whoever recites it in the morning with firm conviction and dies that day enters Paradise" [Sahih al-Bukhari 6306].`,
    principlesAr: `سيد الاستغفار هو أعلى صيغ التوبة وأجمعها لمعاني الخضوع والافتقار لله:
1. **نص الحديث في صحيح البخاري:**
   - عن شداد بن أوس رضي الله عنه عن النبي ﷺ قال: «سَيِّدُ الاسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ» [صحيح البخاري 6306].
2. **أسراره ودلالاته العقدية:**
   - جمع بين توحيد الربوبية والإلوهية والاعتراف بالعبودية.
   - الجمع بين شهود المنة والإنعام، والاعتراف بذل الذنب والتقصير.
3. **فضله العظيم:** «مَن قالها من النهار موقناً بها فمات من يومه قبل أن يمسي فهو من أهل الجنة، ومَن قالها من الليل وهو موقن بها فمات قبل أن يصبح فهو من أهل الجنة».`,
    evidenceVerses: ['[Surah Az-Zumar 39:53]', '[Surah An-Nisa 4:110]'],
    evidenceHadiths: ['[Sahih al-Bukhari 6306]'],
  },
];

// -----------------------------------------------------------------------------
// UNIVERSAL RETRIEVAL & INTENT DISCOVERY
// -----------------------------------------------------------------------------
export interface RetrievalResult {
  matchedTopic?: FiqhConcept;
  matchedVerses: QuranVerse[];
  matchedHadiths: HadithNarrative[];
  subjectDomain: string;
  userIntent: string;
  groundingSnippet: string;
  /** True when at least one authentic topic, Quranic verse, or authentic Hadith was retrieved */
  hasVerifiedContent: boolean;
}

export function retrieveIslamicSources(prompt: string, schoolPreference: string = 'all'): RetrievalResult {
  const pLower = prompt.toLowerCase();

  // 1. Match Fiqh Concepts by Keywords with Weighted Phrase Matching
  let bestTopic: FiqhConcept | undefined;
  let maxKeywordMatches = 0;

  for (const topic of FIQH_TOPICS_DATABASE) {
    let score = 0;
    for (const kw of topic.keywords) {
      const kwLower = kw.toLowerCase();
      if (pLower.includes(kwLower)) {
        const words = kwLower.split(/\s+/).length;
        score += words >= 3 ? words * 8 : words === 2 ? 10 : 3;
      }
    }
    if (score > maxKeywordMatches) {
      maxKeywordMatches = score;
      bestTopic = topic;
    }
  }

  // 2. Match Quranic Verses by Theme and Keyword
  const matchedVerses: QuranVerse[] = [];
  for (const v of VERIFIED_QURAN_DATABASE) {
    const vThemes = (v.theme + ' ' + v.surahName + ' ' + v.surahNameAr).toLowerCase();
    if (
      pLower.includes(v.surahName.toLowerCase()) ||
      pLower.includes(`surah ${v.surahNumber}`) ||
      (vThemes.includes('mulk') && (pLower.includes('mulk') || pLower.includes('tabaarak') || pLower.includes('qabriga') || pLower.includes('الملك'))) ||
      (vThemes.includes('kursi') && (pLower.includes('kursi') || pLower.includes('الكرسي') || pLower.includes('255'))) ||
      (vThemes.includes('parents') && (pLower.includes('waalid') || pLower.includes('hooyo') || pLower.includes('aabb') || pLower.includes('parents') || pLower.includes('الوالدين'))) ||
      (vThemes.includes('yunus') && (pLower.includes('yoonis') || pLower.includes('yunus') || pLower.includes('murugo') || pLower.includes('welwel') || pLower.includes('diiqad') || pLower.includes('karb'))) ||
      (v.theme.toLowerCase().includes('prayer') && (pLower.includes('salaad') || pLower.includes('prayer') || pLower.includes('صلاة'))) ||
      (v.theme.toLowerCase().includes('zakat') && (pLower.includes('zakat') || pLower.includes('zakad') || pLower.includes('sakad') || pLower.includes('زكاة'))) ||
      (v.theme.toLowerCase().includes('fasting') && (pLower.includes('soon') || pLower.includes('sawm') || pLower.includes('fasting') || pLower.includes('صيام'))) ||
      (v.theme.toLowerCase().includes('wudu') && (pLower.includes('weeso') || pLower.includes('wudu') || pLower.includes('وضوء') || pLower.includes('daahir') || pLower.includes('taharah'))) ||
      (v.theme.toLowerCase().includes('riba') && (pLower.includes('riba') || pLower.includes('ribada') || pLower.includes('interest') || pLower.includes('forex') || pLower.includes('ganacsi') || pLower.includes('ربا'))) ||
      (v.theme.toLowerCase().includes('marriage') && (pLower.includes('guur') || pLower.includes('nikah') || pLower.includes('meher') || pLower.includes('marriage') || pLower.includes('نكاح'))) ||
      (v.theme.toLowerCase().includes('tawheed') && (pLower.includes('towxiid') || pLower.includes('tawheed') || pLower.includes('tawhid') || pLower.includes('shirk') || pLower.includes('caqiido') || pLower.includes('aqeedah') || pLower.includes('توحيد') || pLower.includes('ikhlaas') || pLower.includes('ikhlas'))) ||
      (v.theme.toLowerCase().includes('hajj') && (pLower.includes('xaj') || pLower.includes('hajj') || pLower.includes('cumro') || pLower.includes('umrah') || pLower.includes('حج'))) ||
      ((v.theme.toLowerCase().includes('dua') || v.theme.toLowerCase().includes('repentance')) && (pLower.includes('dua') || pLower.includes('duco') || pLower.includes('toobad') || pLower.includes('istighfar') || pLower.includes('istiqfaar') || pLower.includes('repent') || pLower.includes('دعاء') || pLower.includes('توبة')))
    ) {
      matchedVerses.push(v);
    }
  }

  // 3. Match Hadiths by Topic and Topic Keywords
  const matchedHadiths: HadithNarrative[] = [];
  for (const h of VERIFIED_HADITH_DATABASE) {
    const hTopic = h.topic.toLowerCase();
    if (
      ((hTopic.includes('intention') || hTopic.includes('niyyah')) && (pLower.includes('niyad') || pLower.includes('nawawi') || pLower.includes('innamal') || pLower.includes('intention') || pLower.includes('نية'))) ||
      ((hTopic.includes('mulk') || hTopic.includes('grave')) && (pLower.includes('mulk') || pLower.includes('tabaarak') || pLower.includes('qabriga') || pLower.includes('cadaab') || pLower.includes('الملك'))) ||
      ((hTopic.includes('character') || hTopic.includes('akhlaaq') || hTopic.includes('mercy') || hTopic.includes('rahmah')) && (pLower.includes('akhlaaq') || pLower.includes('naxariis') || pLower.includes('character') || pLower.includes('mercy') || pLower.includes('أخلاق') || pLower.includes('رحمة'))) ||
      ((hTopic.includes('istighfar') || hTopic.includes('sayyid')) && (pLower.includes('sayyid') || pLower.includes('istighfar') || pLower.includes('istiqfaar') || pLower.includes('استغفار'))) ||
      ((hTopic.includes('distress') || hTopic.includes('grief') || hTopic.includes('karb')) && (pLower.includes('murugo') || pLower.includes('welwel') || pLower.includes('walwal') || pLower.includes('diiqad') || pLower.includes('karb') || pLower.includes('distress') || pLower.includes('هم'))) ||
      (hTopic.includes('adhkar') && (pLower.includes('adkaar') || pLower.includes('adhkar') || pLower.includes('subax') || pLower.includes('fiid') || pLower.includes('أذكار'))) ||
      (hTopic.includes('prayer') && (pLower.includes('salaad') || pLower.includes('prayer') || pLower.includes('صلاة'))) ||
      (hTopic.includes('zakat') && (pLower.includes('zakad') || pLower.includes('zakat') || pLower.includes('sakad') || pLower.includes('زكاة'))) ||
      (hTopic.includes('fasting') && (pLower.includes('soon') || pLower.includes('sawm') || pLower.includes('fasting') || pLower.includes('صيام'))) ||
      (hTopic.includes('wudu') && (pLower.includes('weeso') || pLower.includes('wudu') || pLower.includes('وضوء') || pLower.includes('jebiya') || pLower.includes('buriya') || pLower.includes('nullif'))) ||
      (hTopic.includes('knowledge') && (pLower.includes('cilmi') || pLower.includes('knowledge') || pLower.includes('علم'))) ||
      (hTopic.includes('parents') && (pLower.includes('waalid') || pLower.includes('mother') || pLower.includes('father') || pLower.includes('والدين') || pLower.includes('hooyo') || pLower.includes('aabb'))) ||
      (hTopic.includes('marriage') && (pLower.includes('guur') || pLower.includes('nikah') || pLower.includes('meher') || pLower.includes('marriage') || pLower.includes('نكاح'))) ||
      (hTopic.includes('repentance') && (pLower.includes('toobad') || pLower.includes('repent') || pLower.includes('istighfar') || pLower.includes('توبة'))) ||
      (hTopic.includes('supplication') && (pLower.includes('dua') || pLower.includes('duco') || pLower.includes('دعاء'))) ||
      (hTopic.includes('halal') && (pLower.includes('xalaal') || pLower.includes('xaaraan') || pLower.includes('halal') || pLower.includes('حلال'))) ||
      (hTopic.includes('khadijah') && (pLower.includes('khadijah') || pLower.includes('khadija') || pLower.includes('khadiijo') || pLower.includes('خديجة'))) ||
      (hTopic.includes('hajj') && (pLower.includes('xaj') || pLower.includes('hajj') || pLower.includes('cumro') || pLower.includes('umrah') || pLower.includes('حج')))
    ) {
      matchedHadiths.push(h);
    }
  }

  // 4. Match Somali Scholars and Verified Tafsir Lessons
  const matchedScholarLessons: Array<{
    scholarName: string;
    title: string;
    audioUrl: string;
    transcriptSo: string;
    transcriptEn: string;
    surahNumber: number;
  }> = [];

  const isAskingAboutScholar =
    pLower.includes('umal') ||
    pLower.includes('dirir') ||
    pLower.includes('faaruuq') ||
    pLower.includes('farooq') ||
    pLower.includes('shibli') ||
    pLower.includes('suufi') ||
    pLower.includes('mustafe') ||
    pLower.includes('tafsiir') ||
    pLower.includes('tafsir');

  if (isAskingAboutScholar) {
    for (const scholar of SOMALI_SCHOLARS_TAFSIR) {
      const scholarMatches =
        pLower.includes(scholar.id) ||
        pLower.includes(scholar.scholarName.toLowerCase()) ||
        pLower.includes(scholar.somaliName.toLowerCase()) ||
        (scholar.id === 'sheikh-umal' && (pLower.includes('umal') || pLower.includes('sheekh umal') || pLower.includes('shiikh umal'))) ||
        (scholar.id === 'sheikh-dirir' && (pLower.includes('dirir') || pLower.includes('sheekh dirir') || pLower.includes('shiikh dirir'))) ||
        (scholar.id === 'sheikh-cumar-faaruuq' && (pLower.includes('faaruuq') || pLower.includes('farooq') || pLower.includes('cumar faaruuq'))) ||
        (scholar.id === 'sheikh-shibli' && (pLower.includes('shibli') || pLower.includes('sheekh shibli'))) ||
        (scholar.id === 'sheikh-cabdirashiid-suufi' && (pLower.includes('suufi') || pLower.includes('cabdirashiid'))) ||
        (scholar.id === 'sheikh-mustafe' && (pLower.includes('mustafe') || pLower.includes('mustafe xaaji')));

      if (scholarMatches || pLower.includes('tafsiir') || pLower.includes('tafsir')) {
        for (const lesson of scholar.lessons) {
          const lessonMatches =
            scholarMatches ||
            pLower.includes(lesson.surahName.toLowerCase()) ||
            pLower.includes(`surah ${lesson.surahNumber}`) ||
            pLower.includes(`suuradda ${lesson.surahNumber}`) ||
            (lesson.surahNumber === 1 && (pLower.includes('faatixa') || pLower.includes('fatihah'))) ||
            (lesson.surahNumber === 2 && (pLower.includes('baqarah') || pLower.includes('kursi'))) ||
            (lesson.surahNumber === 78 && pLower.includes('naba')) ||
            (lesson.surahNumber === 112 && (pLower.includes('ikhlas') || pLower.includes('ikhlaas')));

          if (lessonMatches) {
            matchedScholarLessons.push({
              scholarName: scholar.somaliName,
              title: lesson.titleSo || lesson.titleEn,
              audioUrl: lesson.audioUrl,
              transcriptSo: lesson.transcriptSo,
              transcriptEn: lesson.transcriptEn,
              surahNumber: lesson.surahNumber,
            });
            if (matchedScholarLessons.length >= 3) break;
          }
        }
      }
      if (matchedScholarLessons.length >= 3) break;
    }
  }

  // 5. Construct Structured Retrieval Grounding Snippet
  const snippetParts: string[] = [];

  if (bestTopic) {
    snippetParts.push(`[Topic Grounding: ${bestTopic.titleEn} / ${bestTopic.titleSo}]`);
    snippetParts.push(`Key Legal/Fiqh Principles:\n${bestTopic.principlesEn}`);
    if (bestTopic.evidenceVerses && bestTopic.evidenceVerses.length > 0) {
      snippetParts.push(`Quran Evidence: ${bestTopic.evidenceVerses.join(', ')}`);
    }
    if (bestTopic.evidenceHadiths && bestTopic.evidenceHadiths.length > 0) {
      snippetParts.push(`Hadith Evidence: ${bestTopic.evidenceHadiths.join(', ')}`);
    }
    if (bestTopic.scholarlyViews) {
      const school = (schoolPreference || 'all').toLowerCase();
      if ((school === 'shafii' || school === 'shafi' || school === 'shaafici') && bestTopic.scholarlyViews.shafii) {
        snippetParts.push(`[Chosen Madhhab - Shafi'i Relied-Upon View]: ${bestTopic.scholarlyViews.shafii}`);
      } else if ((school === 'hanafi' || school === 'xanafi') && bestTopic.scholarlyViews.hanafi) {
        snippetParts.push(`[Chosen Madhhab - Hanafi Relied-Upon View]: ${bestTopic.scholarlyViews.hanafi}`);
      } else if ((school === 'maliki' || school === 'maaliki') && bestTopic.scholarlyViews.maliki) {
        snippetParts.push(`[Chosen Madhhab - Maliki Relied-Upon View]: ${bestTopic.scholarlyViews.maliki}`);
      } else if ((school === 'hanbali' || school === 'xanbali') && bestTopic.scholarlyViews.hanbali) {
        snippetParts.push(`[Chosen Madhhab - Hanbali Relied-Upon View]: ${bestTopic.scholarlyViews.hanbali}`);
      }
      if (bestTopic.scholarlyViews.consensus) {
        snippetParts.push(`[Scholarly Consensus / Jumhur]: ${bestTopic.scholarlyViews.consensus}`);
      }
    }
  }

  if (matchedScholarLessons.length > 0) {
    snippetParts.push(`[Verified Somali Scholars' Tafsir Commentary]:`);
    for (const sl of matchedScholarLessons) {
      snippetParts.push(`- Scholar: ${sl.scholarName} | Surah: ${sl.surahNumber} (${sl.title})`);
      snippetParts.push(`  Somali Lesson Summary: "${sl.transcriptSo}"`);
      snippetParts.push(`  Audio Stream URL: ${sl.audioUrl}`);
    }
  }

  if (matchedVerses.length > 0) {
    snippetParts.push(`Verified Quran Verses:`);
    for (const v of matchedVerses.slice(0, 3)) {
      snippetParts.push(`- [Surah ${v.surahName} ${v.surahNumber}:${v.ayahNumber}]: "${v.translationEn}"`);
    }
  }

  if (matchedHadiths.length > 0) {
    snippetParts.push(`Verified Hadiths:`);
    for (const h of matchedHadiths.slice(0, 3)) {
      snippetParts.push(`- [${h.collection} ${h.number}] (${h.grading}): "${h.englishMatn.slice(0, 160)}..."`);
    }
  }

  let domain = 'general_islamic';
  if (pLower.includes('salaad') || pLower.includes('prayer') || pLower.includes('salat')) domain = 'worship_salah';
  else if (pLower.includes('wudu') || pLower.includes('weeso') || pLower.includes('taharah') || pLower.includes('ghusl')) domain = 'worship_taharah';
  else if (pLower.includes('soon') || pLower.includes('sawm') || pLower.includes('fasting') || pLower.includes('ramadan')) domain = 'worship_fasting';
  else if (pLower.includes('zakad') || pLower.includes('zakat') || pLower.includes('sakad')) domain = 'worship_zakat';
  else if (pLower.includes('xaj') || pLower.includes('hajj') || pLower.includes('cumro') || pLower.includes('umrah')) domain = 'worship_hajj';
  else if (pLower.includes('dhaxal') || pLower.includes('mirath') || pLower.includes('inheritance') || pLower.includes('faraid')) domain = 'family_inheritance';
  else if (pLower.includes('guur') || pLower.includes('nikah') || pLower.includes('furiin') || pLower.includes('talaq')) domain = 'family_law';
  else if (pLower.includes('towxiid') || pLower.includes('tawheed') || pLower.includes('shirk') || pLower.includes('caqiido')) domain = 'theology_aqeedah';
  else if (pLower.includes('riba') || pLower.includes('ganacsi') || pLower.includes('trade') || pLower.includes('crypto') || pLower.includes('forex')) domain = 'commercial_fiqh';
  else if (pLower.includes('mustalah') || pLower.includes('hadith grading') || pLower.includes('authenticity') || pLower.includes('is it authentic')) domain = 'hadith_methodology';
  else if (pLower.includes('madhab') || pLower.includes('madhhab') || pLower.includes('shafii') || pLower.includes('hanafi')) domain = 'fiqh_madhhabs';
  else if (pLower.includes('umal') || pLower.includes('dirir') || pLower.includes('tafsiir') || pLower.includes('fatihah')) domain = 'quran_tafsir';
  else if (pLower.includes('khadijah') || pLower.includes('khadiijo') || pLower.includes('siirada') || pLower.includes('nabiga') || pLower.includes('prophet') || pLower.includes('sahaba')) domain = 'seerah_history';
  else if (pLower.includes('dua') || pLower.includes('duco') || pLower.includes('toobad') || pLower.includes('dhikr')) domain = 'duas_ethics';

  let intent = 'educational_explanation';
  if (pLower.includes('waa maxay') || pLower.includes('what is') || pLower.includes('ما هو') || pLower.includes('ما هي') || pLower.includes('who was') || pLower.includes('kuma ayey') || pLower.includes('kuma buu')) intent = 'definition';
  else if (pLower.includes('shuruud') || pLower.includes('condition') || pLower.includes('tiir') || pLower.includes('pillar') || pLower.includes('شروط') || pLower.includes('أركان')) intent = 'conditions_prerequisites';
  else if (pLower.includes('jebiya') || pLower.includes('buriya') || pLower.includes('nullif') || pLower.includes('break') || pLower.includes('نواقض') || pLower.includes('مبطلات')) intent = 'nullifiers_invalidation';
  else if (pLower.includes('xukunka') || pLower.includes('ruling') || pLower.includes('hukm') || pLower.includes('حكم')) intent = 'legal_ruling';

  const hasVerifiedContent = Boolean(
    bestTopic ||
    matchedVerses.length > 0 ||
    matchedHadiths.length > 0 ||
    snippetParts.length > 0
  );

  return {
    matchedTopic: bestTopic,
    matchedVerses,
    matchedHadiths,
    subjectDomain: domain,
    userIntent: intent,
    groundingSnippet: snippetParts.join('\n'),
    hasVerifiedContent,
  };
}

// -----------------------------------------------------------------------------
// DYNAMIC EDUCATIONAL RESPONSE SYNTHESIZER
// -----------------------------------------------------------------------------
export function synthesizeSubstantiveResponse(
  prompt: string,
  lang: 'so' | 'ar' | 'en' = 'so',
  retrieval?: RetrievalResult,
  schoolPreference: string = 'all'
): string {
  const safeRetrieval = retrieval || retrieveIslamicSources(prompt, schoolPreference);
  const { matchedTopic, matchedVerses, matchedHadiths, subjectDomain } = safeRetrieval;
  const safeDomain = (subjectDomain || 'Islamic_Knowledge').replace(/_/g, ' ');

  if (lang === 'so') {
    let response = `### Barashada iyo Fahamka Su'aashaada\n\n`;
    response += `Ku saabsan su'aashaada: **"${prompt}"**\n\n`;

    if (matchedTopic) {
      response += `#### 1. Qeexidda iyo Xukunka Guud\n`;
      response += `${matchedTopic.principlesSo}\n\n`;
    } else {
      response += `#### 1. Jawaabta iyo Faahfaahinta Diiniga ah\n`;
      response += `Diinta Islaamku waxay arrinta ku saabsan **${safeDomain}** ku maamushaa mabaadi'da cad ee laga soo qaatay **Qur'aanka Kariimka ah** iyo **Sunnada suubban ee Nabiga ﷺ**.\n\n`;
    }

    if (matchedTopic?.scholarlyViews) {
      const school = (schoolPreference || 'all').toLowerCase();
      if ((school === 'shafii' || school === 'shafi' || school === 'shaafici') && matchedTopic.scholarlyViews.shafii) {
        response += `#### Aragtida Madhabka Shaaficiyada (Shafi'i Madhhab)\n${matchedTopic.scholarlyViews.shafii}\n\n`;
      } else if ((school === 'hanafi' || school === 'xanafi') && matchedTopic.scholarlyViews.hanafi) {
        response += `#### Aragtida Madhabka Xanafiyada (Hanafi Madhhab)\n${matchedTopic.scholarlyViews.hanafi}\n\n`;
      } else if ((school === 'maliki' || school === 'maaliki') && matchedTopic.scholarlyViews.maliki) {
        response += `#### Aragtida Madhabka Maalikiyada (Maliki Madhhab)\n${matchedTopic.scholarlyViews.maliki}\n\n`;
      } else if ((school === 'hanbali' || school === 'xanbali') && matchedTopic.scholarlyViews.hanbali) {
        response += `#### Aragtida Madhabka Xanbaliyada (Hanbali Madhhab)\n${matchedTopic.scholarlyViews.hanbali}\n\n`;
      }
    }

    const hasVerses = matchedVerses.length > 0;
    const hasHadiths = matchedHadiths.length > 0;
    const hasTopicVerses = matchedTopic && matchedTopic.evidenceVerses.length > 0;
    const hasTopicHadiths = matchedTopic && matchedTopic.evidenceHadiths.length > 0;

    if (hasVerses || hasHadiths || hasTopicVerses || hasTopicHadiths) {
      response += `#### 2. Daliilka Quraanka iyo Xadiisyada Saxiixa ah\n`;
      if (hasVerses) {
        for (const v of matchedVerses.slice(0, 2)) {
          response += `- **Qur'aanka:** [Surah ${v.surahName} ${v.surahNumber}:${v.ayahNumber}] — *"${v.translationSo}"*\n`;
        }
      } else if (hasTopicVerses && matchedTopic) {
        for (const ev of matchedTopic.evidenceVerses.slice(0, 2)) {
          response += `- **Qur'aanka:** Daliil ahaan ${ev}\n`;
        }
      }

      if (hasHadiths) {
        for (const h of matchedHadiths.slice(0, 2)) {
          response += `- **Xadiiska:** [${h.collection} ${h.number}] (${h.grading}) — *"${h.somaliMatn}"*\n`;
        }
      } else if (hasTopicHadiths && matchedTopic) {
        for (const eh of matchedTopic.evidenceHadiths.slice(0, 2)) {
          response += `- **Xadiiska:** Sida ku sugan ${eh}\n`;
        }
      }
      response += `\n`;
    }

    response += `#### 3. Tilmaamaha Ficiliga ah ee Qofka Muslimka ah\n`;
    response += `1. **Barashada Cilmiga:** Qofka Muslimka ah waxaa waajib ku ah inuu barto waxa cibaadadiisa ama nolol-maalmeedkiisa toosinaya.\n`;
    response += `2. **Ku Dhaqanka Sunnada:** In la raaco jidkii Nabiga ﷺ loogana fogaado bidcada iyo waxyaabaha aan diinta saldhigga u lahayn.\n\n`;

    response += `*Allaahu A'lam (Ilaahay baa og).*`;
    return response;
  }

  if (lang === 'ar') {
    let response = `### الإيضاح الشرعي والتأصيل العلمي\n\n`;
    response += `بخصوص سؤالكم الكريم: **"${prompt}"**\n\n`;

    if (matchedTopic) {
      response += `#### 1. البيان الفقهي والتأصيل\n`;
      response += `${matchedTopic.principlesAr}\n\n`;
    } else {
      response += `#### 1. التوجيه الشرعي\n`;
      response += `مسائل **${safeDomain}** في الشريعة الإسلامية مبنية على نصوص الوحيين الشريفين: كتاب الله وسنة رسوله ﷺ بفهم الأئمة المعتبرين.\n\n`;
    }

    const hasVerses = matchedVerses.length > 0;
    const hasHadiths = matchedHadiths.length > 0;
    const hasTopicVerses = matchedTopic && matchedTopic.evidenceVerses.length > 0;
    const hasTopicHadiths = matchedTopic && matchedTopic.evidenceHadiths.length > 0;

    if (hasVerses || hasHadiths || hasTopicVerses || hasTopicHadiths) {
      response += `#### 2. الأدلة من الكتاب والسنة الصحيحة\n`;
      if (hasVerses) {
        for (const v of matchedVerses.slice(0, 2)) {
          response += `- **القرآن الكريم:** ﴿${v.arabicText}﴾ [سورة ${v.surahNameAr}: ${v.ayahNumber}]\n`;
        }
      } else if (hasTopicVerses && matchedTopic) {
        for (const ev of matchedTopic.evidenceVerses.slice(0, 2)) {
          response += `- **القرآن الكريم:** الدليل في ${ev}\n`;
        }
      }

      if (hasHadiths) {
        for (const h of matchedHadiths.slice(0, 2)) {
          response += `- **الحديث النبوي:** [${h.collection}: ${h.number}] (${h.grading}): «${h.englishMatn.slice(0, 150)}...»\n`;
        }
      } else if (hasTopicHadiths && matchedTopic) {
        for (const eh of matchedTopic.evidenceHadiths.slice(0, 2)) {
          response += `- **الحديث النبوي:** كما ثبت في ${eh}\n`;
        }
      }
      response += `\n`;
    }

    response += `#### 3. التوجيهات العملية\n`;
    response += `1. الحرص على التثبت في أحكام الدين والعمل بمقتضى الدليل الصحيح.\n`;
    response += `2. إخلاص العمل لله تعالى ومتابعة هدي النبي ﷺ.\n\n`;

    response += `*والله تعالى أعلم.*`;
    return response;
  }

  // English Synthesis
  let response = `### Islamic Insight & Scriptural Guidance\n\n`;
  response += `Regarding your inquiry: **"${prompt}"**\n\n`;

  if (matchedTopic) {
    response += `#### 1. Legal and Conceptual Breakdown\n`;
    response += `${matchedTopic.principlesEn}\n\n`;
  } else {
    response += `#### 1. Scriptural Guidance and Principles\n`;
    response += `Matters relating to **${safeDomain}** in Islamic jurisprudence are directly derived from the divine revelation of the **Holy Quran** and the authenticated **Sunnah** of the Prophet Muhammad ﷺ.\n\n`;
  }

  const hasVerses = matchedVerses.length > 0;
  const hasHadiths = matchedHadiths.length > 0;
  const hasTopicVerses = matchedTopic && matchedTopic.evidenceVerses.length > 0;
  const hasTopicHadiths = matchedTopic && matchedTopic.evidenceHadiths.length > 0;

  if (hasVerses || hasHadiths || hasTopicVerses || hasTopicHadiths) {
    response += `#### 2. Primary Scriptural Evidence\n`;
    if (hasVerses) {
      for (const v of matchedVerses.slice(0, 2)) {
        response += `- **The Holy Quran:** [Surah ${v.surahName} ${v.surahNumber}:${v.ayahNumber}] — *"${v.translationEn}"*\n`;
      }
    } else if (hasTopicVerses && matchedTopic) {
      for (const ev of matchedTopic.evidenceVerses.slice(0, 2)) {
        response += `- **The Holy Quran:** See ${ev}\n`;
      }
    }

    if (hasHadiths) {
      for (const h of matchedHadiths.slice(0, 2)) {
        response += `- **Authentic Hadith:** [${h.collection} ${h.number}] (${h.grading}) — *"${h.englishMatn}"*\n`;
      }
    } else if (hasTopicHadiths && matchedTopic) {
      for (const eh of matchedTopic.evidenceHadiths.slice(0, 2)) {
        response += `- **Authentic Hadith:** Documented in ${eh}\n`;
      }
    }
    response += `\n`;
  }

  response += `#### 3. Practical Guidance for the Believer\n`;
  response += `1. **Pursuing Verified Knowledge:** Fulfilling obligations according to clear scriptural evidence.\n`;
  response += `2. **Adherence to Sincerity & Moderation:** Emphasizing sincere devotion (*Ikhlās*) and conformity to Prophetic practice (*Ittibā'*).\n\n`;

  response += `*Allahu A'lam (Allah knows best).*`;
  return response;
}

