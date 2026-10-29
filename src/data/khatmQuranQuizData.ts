// ==============================================================================
// EMUFTI AI — Comprehensive Quranic Khatma Completion Quiz Dataset
// 10 randomized questions covering:
// 1. Juzz (Juz structure, boundaries, counts)
// 2. Surahs (Makki/Madani, lengths, virtues)
// 3. Page References (Madinah Mushaf 604 pages, positions)
// 4. Fill-in-the-blanks (Ayah word completion)
// 5. True/False (with 4 distinct options a, b, c, d)
// 6. Multiple Choice (4 options: a, b, c, d with strictly one correct answer)
// ==============================================================================

export type QuranQuizCategory =
  | 'juzz'
  | 'surah'
  | 'page_reference'
  | 'fill_in_the_blank'
  | 'true_false'
  | 'multiple_choice';

export interface QuizOption {
  key: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean;
}

export interface RawQuizItem {
  id: number;
  category: QuranQuizCategory;
  categoryLabel: string;
  arabicSnippet?: string;
  question: string;
  explanation: string;
  correctAnswerText: string;
  distractorTexts: [string, string, string];
}

export interface QuranQuizQuestion {
  id: number;
  category: QuranQuizCategory;
  categoryLabel: string;
  arabicAyah?: string;
  somaliQuestion: string;
  explanation: string;
  options: QuizOption[];
}

export const KHATM_QUIZ_MASTER_BANK: RawQuizItem[] = [
  // -------------------------------------------------------------
  // 1. JUZZ CATEGORY
  // -------------------------------------------------------------
  {
    id: 101,
    category: 'juzz',
    categoryLabel: 'Aqoonta Juzz-yada (Juzz Knowledge)',
    arabicSnippet: '﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾',
    question: "Qur'aanka Kariimka ah wuxuu ka kooban yahay immisa Juzz guud ahaan?",
    explanation: "Qur'aanka Kariimka ah waxaa loo qeybiyay 30 Juzz oo siman si loo fududeeyo akhriska iyo xifdiga.",
    correctAnswerText: "30 Juzz",
    distractorTexts: ["25 Juzz", "40 Juzz", "60 Juzz"],
  },
  {
    id: 102,
    category: 'juzz',
    categoryLabel: 'Aqoonta Juzz-yada (Juzz Knowledge)',
    arabicSnippet: '﴿ عَمَّ يَتَسَاءَلُونَ ۝ عَنِ النَّبَإِ الْعَظِيمِ ﴾',
    question: "Juzz-ka 30-aad ee ugu dambeeya Qur'aanka (Juz Camma), suuraddee ayuu ka bilaabmaa?",
    explanation: "Juz Camma (Juz 30) wuxuu toos uga bilaabmaa Suuratun Naba (Surah 78).",
    correctAnswerText: "Suuratun Naba (Al-Naba)",
    distractorTexts: ["Suuratul Mulk", "Suuratul Faatixa", "Suuratul Ikhlaas"],
  },
  {
    id: 103,
    category: 'juzz',
    categoryLabel: 'Aqoonta Juzz-yada (Juzz Knowledge)',
    arabicSnippet: '﴿ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴾',
    question: "Juzz-ka 29-aad ee Qur'aanka Kariimka ah magac noocee ah ayaa guud ahaan loogu yeeraa?",
    explanation: "Juzz-ka 29-aad wuxuu ku bilaabmaa Suuratul Mulk, waxaana loo yaqaannaa 'Juz Tabaarak'.",
    correctAnswerText: "Juz Tabaarak (Suuratul Mulk)",
    distractorTexts: ["Juz Camma", "Juz Qad Samica", "Juz Alif Laam Miim"],
  },
  {
    id: 104,
    category: 'juzz',
    categoryLabel: 'Aqoonta Juzz-yada (Juzz Knowledge)',
    arabicSnippet: '﴿ الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ ﴾',
    question: "Suuradda caanka ah ee Al-Kahf juzz-yadee ayay ku dhex taallaa Qur'aanka?",
    explanation: "Suuratul Kahf waxay ka bilaabataa dhamaadka Juzz 15 waxayna ku dhex dhammaataa Juzz 16.",
    correctAnswerText: "Juzz 15 iyo Juzz 16",
    distractorTexts: ["Juzz 10 iyo Juzz 11", "Juzz 18 iyo Juzz 19", "Juzz 29 iyo Juzz 30"],
  },
  {
    id: 105,
    category: 'juzz',
    categoryLabel: 'Aqoonta Juzz-yada (Juzz Knowledge)',
    arabicSnippet: '﴿ سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ مَا وَلَّاهُمْ عَن قِبْلَتِهِمُ ﴾',
    question: "Aayaddan 'Sayaquulu al-sufahaau' juzzkee ayay ka bilaabataa bilowgiisa hore?",
    explanation: "Aayaddan (Al-Baqarah 2:142) waa bilowga tooska ah ee Juzz-ka 2-aad ee Qur'aanka.",
    correctAnswerText: "Juzz-ka 2-aad (Juz 2)",
    distractorTexts: ["Juzz-ka 1-aad (Juz 1)", "Juzz-ka 3-aad (Juz 3)", "Juzz-ka 5-aad (Juz 5)"],
  },

  // -------------------------------------------------------------
  // 2. SURAH CATEGORY
  // -------------------------------------------------------------
  {
    id: 201,
    category: 'surah',
    categoryLabel: 'Aqoonta Suuradaha (Surah Knowledge)',
    arabicSnippet: '﴿ إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴾',
    question: "Suuraddee ayaa ah tan keliya ee laba jeer ay ku dhex qoran tahay 'Bismillaahi Raxmaani Raxiim'?",
    explanation: "Suuratun Namli (27:30) waxay leedahay Bismillaah bilowga iyo aayadda 30-aad oo ah warqaddii Nebi Suleymaan (CS).",
    correctAnswerText: "Suuratun Namli (An-Naml)",
    distractorTexts: ["Suuratul Baqarah", "Suuratu Yuusuf", "Suuratu Yaasiin"],
  },
  {
    id: 202,
    category: 'surah',
    categoryLabel: 'Aqoonta Suuradaha (Surah Knowledge)',
    arabicSnippet: '﴿ بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ إِلَى الَّذِينَ عَاهَدتُّم مِّنَ الْمُشْرِكِينَ ﴾',
    question: "Suuraddee ayaa ah tan keliya ee Qur'aanka Kariimka ee aan bilowgeeda lagu qorin Bismillaah?",
    explanation: "Suuratut Tawbah (Baraa'ah) ma laha Bismillaah bilowgeeda sababtoo ah waxay ku degtay baabi'inta heshiisyadii mushrikiinta.",
    correctAnswerText: "Suuratut Tawbah (At-Tawbah)",
    distractorTexts: ["Suuratul Anfaal", "Suuratul Xadiid", "Suuratu Nuux"],
  },
  {
    id: 203,
    category: 'surah',
    categoryLabel: 'Aqoonta Suuradaha (Surah Knowledge)',
    arabicSnippet: '﴿ إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ﴾',
    question: "Suuraddee ayaa ah tan ugu gaaban dhammaan Qur'aanka Kariimka (oo ka kooban 3 aayadood)?",
    explanation: "Suuratul Kowthar waa suuradda ugu gaaban Qur'aanka Kariimka oo leh 3 aayadood iyo 10 eray.",
    correctAnswerText: "Suuratul Kowthar (Al-Kawthar)",
    distractorTexts: ["Suuratul Ikhlaas", "Suuratun Nasr", "Suuratul Casr"],
  },
  {
    id: 204,
    category: 'surah',
    categoryLabel: 'Aqoonta Suuradaha (Surah Knowledge)',
    arabicSnippet: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾',
    question: "Suuraddee ayay ahaayeen aayadaha ugu horreeya ee ku soo dega Nabiga Muxammad ﷺ Godka Xiraa?",
    explanation: "Shan aayadood oo ka mid ah Suuratul Calaq (1-5) ayaa ugu horreeyay waxyiga soo dega.",
    correctAnswerText: "Suuratul Calaq (Al-Alaq)",
    distractorTexts: ["Suuratul Faatixa", "Suuratul Mudathir", "Suuratul Muzamil"],
  },
  {
    id: 205,
    category: 'surah',
    categoryLabel: 'Aqoonta Suuradaha (Surah Knowledge)',
    arabicSnippet: '﴿ يس ۝ وَالْقُرْآنِ الْحَكِيمِ ﴾',
    question: "Suuraddee ayaa axaadiista qaarkood ku tilmaameen 'Qalbiga Qur'aanka' (Qalb al-Qur'an)?",
    explanation: "Suuratu Yaasiin ayaa xadiisyada qaarkood loogu yeeraa Qalbiga Qur'aanka sababtoo ah xaqiiqooyinka aakhiro ee ay xambaarsan tahay.",
    correctAnswerText: "Suuratu Yaasiin (Ya-Sin)",
    distractorTexts: ["Suuratul Raxmaan", "Suuratul Waaqicah", "Suuratul Mulk"],
  },

  // -------------------------------------------------------------
  // 3. PAGE REFERENCE CATEGORY
  // -------------------------------------------------------------
  {
    id: 301,
    category: 'page_reference',
    categoryLabel: 'Bogagga Mushafka (Mushaf Page References)',
    arabicSnippet: '﴿ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ ﴾',
    question: "Mushafka Madiina ee caalamiga ah (Madinah Standard Mushaf) immisa bog buu ka kooban yahay guud ahaan?",
    explanation: "Mushafka rasmiga ah ee Madiina wuxuu ka kooban yahay 604 bog oo bilaabata Faatixa kuna dhamaata An-Naas.",
    correctAnswerText: "604 Bog",
    distractorTexts: ["500 Bog", "666 Bog", "700 Bog"],
  },
  {
    id: 302,
    category: 'page_reference',
    categoryLabel: 'Bogagga Mushafka (Mushaf Page References)',
    arabicSnippet: '﴿ الم ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴾',
    question: "Suuratul Baqarah boggee ayay ka bilaabataa Mushafka Madiina ee 604-ka bog ah?",
    explanation: "Bogga 1-aad waa Suuratul Faatixa, bogga 2-aadna waxay toos uga bilaabataa Suuratul Baqarah.",
    correctAnswerText: "Bogga 2-aad (Page 2)",
    distractorTexts: ["Bogga 1-aad (Page 1)", "Bogga 5-aad (Page 5)", "Bogga 10-aad (Page 10)"],
  },
  {
    id: 303,
    category: 'page_reference',
    categoryLabel: 'Bogagga Mushafka (Mushaf Page References)',
    arabicSnippet: '﴿ وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ ﴾',
    question: "Mushafka Madiina ee 604 bog ah, hal Juzz celcelis ahaan immisa bog buu ka kooban yahay?",
    explanation: "604 bog loo qeybiyay 30 Juzz waxay noqonaysaa qiyaastii 20 bog Juzz kasta ( marka laga reebo juz 1 iyo 30 oo wax yar ka duwan).",
    correctAnswerText: "20 Bog Juzz kasta",
    distractorTexts: ["15 Bog Juzz kasta", "30 Bog Juzz kasta", "10 Bog Juzz kasta"],
  },
  {
    id: 304,
    category: 'page_reference',
    categoryLabel: 'Bogagga Mushafka (Mushaf Page References)',
    arabicSnippet: '﴿ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴾',
    question: "Bogga ugu dambeeya ee Mushafka (Bogga 604), suuradahee ayaa ku yaalla?",
    explanation: "Bogga 604 waxaa ku wada daabacan saddexda suuradood ee quluubta: Al-Ikhlaas, Al-Falaq, iyo An-Naas.",
    correctAnswerText: "Al-Ikhlaas, Al-Falaq, iyo An-Naas",
    distractorTexts: ["Al-Mulk iyo Al-Qalam", "Al-Fajr iyo Al-Balad", "Al-Kawthar iyo Al-Maa'uun"],
  },
  {
    id: 305,
    category: 'page_reference',
    categoryLabel: 'Bogagga Mushafka (Mushaf Page References)',
    arabicSnippet: '﴿ وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا ﴾',
    question: "Bartamaha Mushafka Madiina (Bogga 293 ilaa 304) suuraddee ayaa ku taalla?",
    explanation: "Bartamaha Qur'aanka Kariimka waxaa ku beegan Suuratul Kahf (Bogga 293-304).",
    correctAnswerText: "Suuratul Kahf (Al-Kahf)",
    distractorTexts: ["Suuratu Maryam", "Suuratu Yuusuf", "Suuratu Daaha"],
  },

  // -------------------------------------------------------------
  // 4. FILL-IN-THE-BLANK CATEGORY
  // -------------------------------------------------------------
  {
    id: 401,
    category: 'fill_in_the_blank',
    categoryLabel: 'Buuxi Meelaha Bannaan (Fill in the Blank)',
    arabicSnippet: '﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ [...] ﴾',
    question: "Dhammeystir aayadda sharafta leh ee Suuratush Sharx: ereygee baa meesha bannaan ku jira?",
    explanation: "Aayadda 6-aad ee Suuratush Sharx waa: ﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾.",
    correctAnswerText: "يُسْرًا (Yusraa)",
    distractorTexts: ["خَيْرًا (Khayraa)", "صَبْرًا (Sabraa)", "أَجْرًا (Ajraa)"],
  },
  {
    id: 402,
    category: 'fill_in_the_blank',
    categoryLabel: 'Buuxi Meelaha Bannaan (Fill in the Blank)',
    arabicSnippet: '﴿ قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا [...] ﴾',
    question: "Dhammeystir aayadda 2-aad ee Suuratul Kaafiruun: ereygee baa buuxinaya?",
    explanation: "Aayadda 2-aad ee Suuratul Kaafiruun waa: ﴿ لَا أَعْبُدُ مَا تَعْبُدُونَ ﴾.",
    correctAnswerText: "تَعْبُدُونَ (Tacbuduun)",
    distractorTexts: ["تَفْعَلُونَ (Tafcaluun)", "تَكْفُرُونَ (Takfuruun)", "تَعْلَمُونَ (Taclamuun)"],
  },
  {
    id: 403,
    category: 'fill_in_the_blank',
    categoryLabel: 'Buuxi Meelaha Bannaan (Fill in the Blank)',
    arabicSnippet: '﴿ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا [...] ﴾',
    question: "Suuratul Casr aayaddeeda ugu dambeysa: maxaa buuxinaya meesha bannaan?",
    explanation: "Aayadda 3-aad ee Suuratul Casr waxay ku dhammaataa: ﴿ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴾.",
    correctAnswerText: "بِالصَّبْرِ (Bis-Sabr)",
    distractorTexts: ["بِالشُّكْرِ (Bish-Shukr)", "بِالْعِلْمِ (Bil-Cilm)", "بِالتَّقْوَى (Bit-Taqwa)"],
  },
  {
    id: 404,
    category: 'fill_in_the_blank',
    categoryLabel: 'Buuxi Meelaha Bannaan (Fill in the Blank)',
    arabicSnippet: '﴿ مَالِكِ يَوْمِ [...] ﴾',
    question: "Suuratul Faatixa aayaddeeda 4-aad: ereygee baa ku jira meesha bannaan?",
    explanation: "Suuratul Faatixa aayadda 4-aad waa: ﴿ مَالِكِ يَوْمِ الدِّينِ ﴾.",
    correctAnswerText: "الدِّينِ (Ad-Diin)",
    distractorTexts: ["الْقِيَامَةِ (Al-Qiyaamah)", "الْحِسَابِ (Al-Xisaab)", "الْفَصْلِ (Al-Fasl)"],
  },
  {
    id: 405,
    category: 'fill_in_the_blank',
    categoryLabel: 'Buuxi Meelaha Bannaan (Fill in the Blank)',
    arabicSnippet: '﴿ وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا [...] ﴾',
    question: "Suuratuth Thaariyaat aayadda 56-aad: ujeeddada abuurista bini'aadamka iyo jinka waa maxay?",
    explanation: "Aayadda 56-aad ee Suuratuth Thaariyaat waa: ﴿ وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ ﴾.",
    correctAnswerText: "لِيَعْبُدُونِ (Li-yacbuduun)",
    distractorTexts: ["لِيَعْلَمُونِ (Li-yaclamuun)", "لِيَشْكُرُونِ (Li-yashkuruun)", "لِيَعْرِفُونِ (Li-yacrifuun)"],
  },

  // -------------------------------------------------------------
  // 5. TRUE / FALSE CATEGORY (With 4 structured options a, b, c, d)
  // -------------------------------------------------------------
  {
    id: 501,
    category: 'true_false',
    categoryLabel: 'Run mise Been (True / False)',
    arabicSnippet: '﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    question: "Run mise Been: Suuratul Faatixa waa suurad Makki ah oo ka kooban 7 aayadood?",
    explanation: "Run: Suuratul Faatixa waa 7 aayadood (As-Sabcu al-Mathaani) waxaana lagu tiriyaa Makki.",
    correctAnswerText: "Run (Waa 7 aayadood oo Makki ah)",
    distractorTexts: [
      "Been (Waa 10 aayadood)",
      "Been (Waa suurad Madani ah oo kaliya)",
      "Labadaba maaha"
    ],
  },
  {
    id: 502,
    category: 'true_false',
    categoryLabel: 'Run mise Been (True / False)',
    arabicSnippet: '﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ﴾',
    question: "Run mise Been: Aayadul Kursi oo ah aayadda ugu weyn Qur'aanka waxay ku dhex jirtaa Suuratul Aali Cimraan?",
    explanation: "Been: Aayadul Kursi waxay ku dhex jirtaa Suuratul Baqarah (Aayadda 255), ee kuma jirto Aali Cimraan.",
    correctAnswerText: "Been (Waxay ku jirtaa Suuratul Baqarah 2:255)",
    distractorTexts: [
      "Run (Waxay ku jirtaa Aali Cimraan)",
      "Been (Waxay ku jirtaa Suuratu Yaasiin)",
      "Been (Waxay ku jirtaa Suuratun Nisaa)"
    ],
  },
  {
    id: 503,
    category: 'true_false',
    categoryLabel: 'Run mise Been (True / False)',
    arabicSnippet: '﴿ إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْمُبَارَكَةِ ﴾',
    question: "Run mise Been: Qur'aanka Kariimka ah wuxuu leeyahay 114 suuradood guud ahaan?",
    explanation: "Run: Qur'aanka Kariimka ah wuxuu leeyahay 114 suuradood oo u qeybsama Makki iyo Madani.",
    correctAnswerText: "Run (Waa 114 suuradood)",
    distractorTexts: [
      "Been (Waa 112 suuradood)",
      "Been (Waa 120 suuradood)",
      "Been (Waa 100 suuradood)"
    ],
  },
  {
    id: 504,
    category: 'true_false',
    categoryLabel: 'Run mise Been (True / False)',
    arabicSnippet: '﴿ الر كِتَابٌ أُحْكِمَتْ آيَاتُهُ ثُمَّ فُصِّلَتْ ﴾',
    question: "Run mise Been: Suuratut Tawbah waxay leedahay Bismillaahi Raxmaani Raxiim bilowgeeda?",
    explanation: "Been: Suuratut Tawbah waa suuradda keliya ee aan lahayn Bismillaah bilowgeeda.",
    correctAnswerText: "Been (Ma laha Bismillaah bilowgeeda)",
    distractorTexts: [
      "Run (Waxay leedahay Bismillaah bilowga)",
      "Run (Waxay leedahay laba Bismillaah)",
      "Been (Salaadda oo keliya baa loogu daraa)"
    ],
  },

  // -------------------------------------------------------------
  // 6. MULTIPLE CHOICE CATEGORY (Quran Facts & Ayah Sequences)
  // -------------------------------------------------------------
  {
    id: 601,
    category: 'multiple_choice',
    categoryLabel: 'Xulashada Saxda ah (Multiple Choice)',
    arabicSnippet: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
    question: "Xadiis saxiix ah marka la eego, Suuratul Ikhlaas waxay u dhigantaa qaybtee Qur'aanka Kariimka ah?",
    explanation: "Nabi Muxammad ﷺ wuxuu xaqiijiyay in Suuratul Ikhlaas u dhiganto saddex meelood hal meel (1/3) Qur'aanka.",
    correctAnswerText: "Saddex meelood hal meel (1/3)",
    distractorTexts: [
      "Kala bar Qur'aanka (1/2)",
      "Afar meelood hal meel (1/4)",
      "Toban meelood hal meel (1/10)"
    ],
  },
  {
    id: 602,
    category: 'multiple_choice',
    categoryLabel: 'Xulashada Saxda ah (Multiple Choice)',
    arabicSnippet: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ ﴾',
    question: "Aayadda ugu dheer dhammaan Qur'aanka Kariimka (Aayadda Daynta / Aayat ad-Dayn) suuraddee bay ku jirtaa?",
    explanation: "Aayadda Daynta waa Aayadda 282-aad ee Suuratul Baqarah, waana aayadda ugu dheer Qur'aanka oo dhan (bog dhan).",
    correctAnswerText: "Suuratul Baqarah (Aayadda 282)",
    distractorTexts: [
      "Suuratun Nisaa (Aayadda 176)",
      "Suuratul Maa-idah (Aayadda 3)",
      "Suuratu Yuusuf (Aayadda 1)"
    ],
  },
  {
    id: 603,
    category: 'multiple_choice',
    categoryLabel: 'Xulashada Saxda ah (Multiple Choice)',
    arabicSnippet: '﴿ وَإِذْ قَالَتِ الْمَلَائِكَةُ يَا مَرْيَمُ إِنَّ اللَّهَ اصْطَفَاكِ ﴾',
    question: "Suuraddee ayaa loogu magac daray haweeney sharaf leh oo ahayd hooyadii Nebi Ciise (CS)?",
    explanation: "Suuratu Maryam (Suuradda 19-aad) waa suuradda keliya ee Qur'aanka loogu magac daray haweeney sharaf leh.",
    correctAnswerText: "Suuratu Maryam (Maryam)",
    distractorTexts: [
      "Suuratu Khadiijah",
      "Suuratu Faadimah",
      "Suuratu Caashah"
    ],
  },
  {
    id: 604,
    category: 'multiple_choice',
    categoryLabel: 'Xulashada Saxda ah (Multiple Choice)',
    arabicSnippet: '﴿ وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ﴾',
    question: "Suuratud Duxaa dhexdeeda, labada aayadood ee hore ka dib, aayadda saddexaad kee baa ah?",
    explanation: "Aayadda 3-aad ee Suuratud Duxaa waa: ﴿ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ﴾.",
    correctAnswerText: "﴿ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ﴾",
    distractorTexts: [
      "﴿ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ﴾",
      "﴿ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ ﴾",
      "﴿ أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ﴾"
    ],
  },
  {
    id: 605,
    category: 'multiple_choice',
    categoryLabel: 'Xulashada Saxda ah (Multiple Choice)',
    arabicSnippet: '﴿ إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ﴾',
    question: "Suuratun Nasr gudaheeda, aayadda 1-aad ka dib, aayadda xigta kee baa ah?",
    explanation: "Aayadda 2-aad ee Suuratun Nasr waa: ﴿ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ﴾.",
    correctAnswerText: "﴿ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ﴾",
    distractorTexts: [
      "﴿ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ﴾",
      "﴿ إِنَّهُ كَانَ تَوَّابًا ﴾",
      "﴿ تَبَّتْ يَدَا أَبِي لَهَبٍ ﴾"
    ],
  },
];

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates 10 randomized, multi-category Quran questions with randomized options (a, b, c, d).
 * Strictly guarantees coverage of Juzz, Surahs, Page references, Fill-in-the-blanks, True/False, and MCQ.
 */
export function getRandomKhatmQuizQuestions(count = 10): QuranQuizQuestion[] {
  // Group by categories
  const categories: QuranQuizCategory[] = [
    'juzz',
    'surah',
    'page_reference',
    'fill_in_the_blank',
    'true_false',
    'multiple_choice',
  ];

  const pickedItems: RawQuizItem[] = [];

  // Pick at least 1 from each category to guarantee full diversity
  for (const cat of categories) {
    const pool = KHATM_QUIZ_MASTER_BANK.filter((q) => q.category === cat);
    if (pool.length > 0) {
      const shuffledPool = shuffleArray(pool);
      pickedItems.push(shuffledPool[0]);
    }
  }

  // Fill remainder from remaining pool
  const remainingPool = shuffleArray(
    KHATM_QUIZ_MASTER_BANK.filter((q) => !pickedItems.some((p) => p.id === q.id))
  );

  while (pickedItems.length < count && remainingPool.length > 0) {
    pickedItems.push(remainingPool.pop()!);
  }

  // Shuffle the final selected 10 questions
  const finalQuestions = shuffleArray(pickedItems).slice(0, count);

  // For each question, assemble and shuffle 4 options (a, b, c, d)
  return finalQuestions.map((item, idx) => {
    const rawOptions = [
      { text: item.correctAnswerText, isCorrect: true },
      { text: item.distractorTexts[0], isCorrect: false },
      { text: item.distractorTexts[1], isCorrect: false },
      { text: item.distractorTexts[2], isCorrect: false },
    ];

    const shuffledOpts = shuffleArray(rawOptions);
    const keys: Array<'a' | 'b' | 'c' | 'd'> = ['a', 'b', 'c', 'd'];

    const formattedOptions: QuizOption[] = shuffledOpts.map((opt, oIdx) => ({
      key: keys[oIdx],
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));

    return {
      id: item.id || idx + 1,
      category: item.category,
      categoryLabel: item.categoryLabel,
      arabicAyah: item.arabicSnippet,
      somaliQuestion: item.question,
      explanation: item.explanation,
      options: formattedOptions,
    };
  });
}

// Retain legacy export for backward compatibility
export const KHATM_MANDATORY_QUIZ_QUESTIONS = getRandomKhatmQuizQuestions(10);
