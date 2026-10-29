// ==============================================================================
// EMUFTI AI — Mandatory Quranic Khatma Completion Quiz Dataset
// 10 authentic questions purely focused on the Holy Quran:
// Identifying Surah from Ayah & identifying what comes next after an Ayah.
// Includes Arabic Ayah text, Somali explanations, 4 options (a, b, c, d), 30s timer.
// ==============================================================================

export interface QuranQuizQuestion {
  id: number;
  type: 'identify_surah' | 'next_ayah';
  arabicAyah: string;
  somaliQuestion: string;
  explanation: string;
  options: {
    key: 'a' | 'b' | 'c' | 'd';
    text: string;
    isCorrect: boolean;
  }[];
}

export const KHATM_MANDATORY_QUIZ_QUESTIONS: QuranQuizQuestion[] = [
  {
    id: 1,
    type: 'identify_surah',
    arabicAyah: '﴿ إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ﴾',
    somaliQuestion: 'Aayaddan sharafta leh ee ka hadlaysa habeenka weyn ee Laylatul Qadr, suuraddee ayay ku jirtaa?',
    explanation: "Waa aayadda 1-aad ee Suuratul Qadr (97:1), oo ka warramaysa soo degidda Qur'aanka Kariimka.",
    options: [
      { key: 'a', text: 'Suuratul Qadr (Al-Qadr)', isCorrect: true },
      { key: 'b', text: 'Suuratul Fajr (Al-Fajr)', isCorrect: false },
      { key: 'c', text: 'Suuratul Balad (Al-Balad)', isCorrect: false },
      { key: 'd', text: 'Suuratul Calaq (Al-Alaq)', isCorrect: false },
    ],
  },
  {
    id: 2,
    type: 'next_ayah',
    arabicAyah: '﴿ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ﴾',
    somaliQuestion: "Suuratul Faatixa gudaheeda, aayaddan 'Maaliki yawmi-ddiin' ka dib, aayadda xigta kee baa ah?",
    explanation: "Suuratul Faatixa aayaddeeda 5-aad waa: ﴿ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴾.",
    options: [
      { key: 'a', text: '﴿ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴾', isCorrect: true },
      { key: 'b', text: '﴿ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴾', isCorrect: false },
      { key: 'c', text: '﴿ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ﴾', isCorrect: false },
      { key: 'd', text: '﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾', isCorrect: false },
    ],
  },
  {
    id: 3,
    type: 'identify_surah',
    arabicAyah: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ﴾',
    somaliQuestion: 'Aayaddan caddaynaysa kalinimada iyo weynida Alle, suuraddee ayay ku jirtaa?',
    explanation: "Suuratul Ikhlaas (Al-Tawxiid) waxay u dhigantaa saddex meelood hal meel Qur'aanka.",
    options: [
      { key: 'a', text: 'Suuratul Ikhlaas (Al-Ikhlas)', isCorrect: true },
      { key: 'b', text: 'Suuratul Falaq (Al-Falaq)', isCorrect: false },
      { key: 'c', text: 'Suuratun Naas (An-Nas)', isCorrect: false },
      { key: 'd', text: 'Suuratul Kaafiruun (Al-Kafirun)', isCorrect: false },
    ],
  },
  {
    id: 4,
    type: 'next_ayah',
    arabicAyah: '﴿ إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ﴾',
    somaliQuestion: 'Suuratun Nasr gudaheeda, aayadda koowaad ka dib, aayadda xigta kee baa ah?',
    explanation: 'Aayadda 2-aad ee Suuratun Nasr waa: ﴿ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ﴾.',
    options: [
      { key: 'a', text: '﴿ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ﴾', isCorrect: true },
      { key: 'b', text: '﴿ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ﴾', isCorrect: false },
      { key: 'c', text: '﴿ إِنَّهُ كَانَ تَوَّابًا ﴾', isCorrect: false },
      { key: 'd', text: '﴿ تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ ﴾', isCorrect: false },
    ],
  },
  {
    id: 5,
    type: 'identify_surah',
    arabicAyah: '﴿ وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴾',
    somaliQuestion: "Aayaddan dhaaraysa waqtiga oo sheegaysa in bini'aadamku khasaaro ku jiro marka laga reebo inta rumeysay, suuraddee bay tahay?",
    explanation: 'Suuratul Casr (103) waxay tilmaamaysaa qiimaha waqtiga iyo shuruudaha guusha aakhiro iyo adduun.',
    options: [
      { key: 'a', text: 'Suuratul Casr (Al-Asr)', isCorrect: true },
      { key: 'b', text: 'Suuratut Takaathur (At-Takathur)', isCorrect: false },
      { key: 'c', text: 'Suuratul Qaaricah (Al-Qariah)', isCorrect: false },
      { key: 'd', text: 'Suuratul Humazah (Al-Humazah)', isCorrect: false },
    ],
  },
  {
    id: 6,
    type: 'next_ayah',
    arabicAyah: '﴿ إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ﴾',
    somaliQuestion: 'Suuratul Kowthar dhexdeeda, aayadda koowaad ka dib, aayadda xigta kee baa ah?',
    explanation: 'Aayadda 2-aad ee Suuratul Kowthar waa: ﴿ فَصَلِّ لِرَبِّكَ وَانْحَرْ ﴾.',
    options: [
      { key: 'a', text: '﴿ فَصَلِّ لِرَبِّكَ وَانْحَرْ ﴾', isCorrect: true },
      { key: 'b', text: '﴿ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ ﴾', isCorrect: false },
      { key: 'c', text: '﴿ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ ﴾', isCorrect: false },
      { key: 'd', text: '﴿ أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ ﴾', isCorrect: false },
    ],
  },
  {
    id: 7,
    type: 'identify_surah',
    arabicAyah: '﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ﴾',
    somaliQuestion: "Aayadul Kursi oo ah aayadda ugu fadliga iyo weynida badan Qur'aanka Kariimka, suuraddee ayay ku dhex jirtaa?",
    explanation: 'Aayadul Kursi waa Aayadda 255-aad ee Suuratul Baqarah (Al-Baqarah 2:255).',
    options: [
      { key: 'a', text: 'Suuratul Baqarah (Al-Baqarah - Aayadda 255)', isCorrect: true },
      { key: 'b', text: 'Suuratul Aali Cimraan (Ali Imran)', isCorrect: false },
      { key: 'c', text: 'Suuratun Nisaa (An-Nisa)', isCorrect: false },
      { key: 'd', text: 'Suuratul Maa-idah (Al-Maidah)', isCorrect: false },
    ],
  },
  {
    id: 8,
    type: 'next_ayah',
    arabicAyah: '﴿ تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ ﴾',
    somaliQuestion: 'Suuratul Masad dhexdeeda, aayadda 1-aad ka dib, maxaa xiga?',
    explanation: 'Aayadda 2-aad ee Suuratul Masad waa: ﴿ مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ ﴾.',
    options: [
      { key: 'a', text: '﴿ مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ ﴾', isCorrect: true },
      { key: 'b', text: '﴿ سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ ﴾', isCorrect: false },
      { key: 'c', text: '﴿ وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ ﴾', isCorrect: false },
      { key: 'd', text: '﴿ فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ ﴾', isCorrect: false },
    ],
  },
  {
    id: 9,
    type: 'identify_surah',
    arabicAyah: '﴿ أَلْهَاكُمُ التَّكَاثُرُ ۝ حَتَّىٰ زُرْتُمُ الْمَقَابِرَ ﴾',
    somaliQuestion: 'Aayaddan ka digaysa ku mashquulidda adduunka ilaa xabaalaha laga tago, suuraddee bay tahay?',
    explanation: 'Suuratut Takaathur (102) waxay bini-aadamka ku waaninaysaa inay xusuustaan aakhiro.',
    options: [
      { key: 'a', text: 'Suuratut Takaathur (At-Takathur)', isCorrect: true },
      { key: 'b', text: 'Suuratul Qaaricah (Al-Qariah)', isCorrect: false },
      { key: 'c', text: 'Suuratuz Zalzalah (Az-Zalzalah)', isCorrect: false },
      { key: 'd', text: 'Suuratul Caadiyaat (Al-Adiyat)', isCorrect: false },
    ],
  },
  {
    id: 10,
    type: 'next_ayah',
    arabicAyah: '﴿ وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ ﴾',
    somaliQuestion: 'Suuratud Duxaa dhexdeeda, labada aayadood ee hore ka dib, aayadda saddexaad kee baa ah?',
    explanation: 'Aayadda 3-aad ee Suuratud Duxaa waa: ﴿ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ﴾.',
    options: [
      { key: 'a', text: '﴿ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ﴾', isCorrect: true },
      { key: 'b', text: '﴿ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ﴾', isCorrect: false },
      { key: 'c', text: '﴿ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ ﴾', isCorrect: false },
      { key: 'd', text: '﴿ أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ﴾', isCorrect: false },
    ],
  },
];
