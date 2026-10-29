import type { JuzInfo } from '../types/database.ts';
import { ALL_114_SURAHS } from './quranMetadata.ts';

/**
 * Verified metadata for all 30 Juz of the Holy Quran
 * Based on the standard 604-page Madinah Mushaf (King Fahd Complex).
 * Guaranteed in order from Juz 1 to Juz 30 (Juz Amma).
 */
export const ALL_30_JUZ: JuzInfo[] = [
  {
    number: 1,
    nameArabic: 'الجزء الأول',
    nameEnglish: 'Juz 1',
    nameSomali: 'Juz-ka 1aad (Al-Faatixa - Al-Baqarah)',
    startSurah: 1,
    startSurahName: 'Al-Fatihah',
    startSurahArabic: 'الفَاتِحَةِ',
    startAyah: 1,
    endSurah: 2,
    endSurahName: 'Al-Baqarah',
    endSurahArabic: 'البَقَرَةِ',
    endAyah: 141,
    startPage: 1,
    endPage: 21,
    totalPages: 21,
    startHizb: 1,
    endHizb: 2,
  },
  {
    number: 2,
    nameArabic: 'الجزء الثاني (سَيَقُولُ)',
    nameEnglish: 'Juz 2 (Sayaqool)',
    nameSomali: 'Juz-ka 2aad (Sayaquul)',
    startSurah: 2,
    startSurahName: 'Al-Baqarah',
    startSurahArabic: 'البَقَرَةِ',
    startAyah: 142,
    endSurah: 2,
    endSurahName: 'Al-Baqarah',
    endSurahArabic: 'البَقَرَةِ',
    endAyah: 252,
    startPage: 22,
    endPage: 41,
    totalPages: 20,
    startHizb: 3,
    endHizb: 4,
  },
  {
    number: 3,
    nameArabic: 'الجزء الثالث (تِلْكَ الرُّسُلُ)',
    nameEnglish: 'Juz 3 (Tilka ar-Rusul)',
    nameSomali: 'Juz-ka 3aad (Tilka Rusuul)',
    startSurah: 2,
    startSurahName: 'Al-Baqarah',
    startSurahArabic: 'البَقَرَةِ',
    startAyah: 253,
    endSurah: 3,
    endSurahName: 'Ali \'Imran',
    endSurahArabic: 'آلِ عِمْرَانَ',
    endAyah: 92,
    startPage: 42,
    endPage: 61,
    totalPages: 20,
    startHizb: 5,
    endHizb: 6,
  },
  {
    number: 4,
    nameArabic: 'الجزء الرابع (لَنْ تَنَالُوا)',
    nameEnglish: 'Juz 4 (Lan Tanaalu)',
    nameSomali: 'Juz-ka 4aad (Lan Tanaaluu)',
    startSurah: 3,
    startSurahName: 'Ali \'Imran',
    startSurahArabic: 'آلِ عِمْرَانَ',
    startAyah: 93,
    endSurah: 4,
    endSurahName: 'An-Nisa',
    endSurahArabic: 'النِّسَاءِ',
    endAyah: 23,
    startPage: 62,
    endPage: 81,
    totalPages: 20,
    startHizb: 7,
    endHizb: 8,
  },
  {
    number: 5,
    nameArabic: 'الجزء الخامس (وَالْمُحْصَنَاتُ)',
    nameEnglish: 'Juz 5 (Wal-Muhsanat)',
    nameSomali: 'Juz-ka 5aad (Wal-Muxsanaat)',
    startSurah: 4,
    startSurahName: 'An-Nisa',
    startSurahArabic: 'النِّسَاءِ',
    startAyah: 24,
    endSurah: 4,
    endSurahName: 'An-Nisa',
    endSurahArabic: 'النِّسَاءِ',
    endAyah: 147,
    startPage: 82,
    endPage: 101,
    totalPages: 20,
    startHizb: 9,
    endHizb: 10,
  },
  {
    number: 6,
    nameArabic: 'الجزء السادس (لَا يُحِبُّ اللَّهُ)',
    nameEnglish: 'Juz 6 (La Yuhibbullah)',
    nameSomali: 'Juz-ka 6aad (Laa Yuxibbullahu)',
    startSurah: 4,
    startSurahName: 'An-Nisa',
    startSurahArabic: 'النِّسَاءِ',
    startAyah: 148,
    endSurah: 5,
    endSurahName: 'Al-Ma\'idah',
    endSurahArabic: 'المَائِدَةِ',
    endAyah: 81,
    startPage: 102,
    endPage: 121,
    totalPages: 20,
    startHizb: 11,
    endHizb: 12,
  },
  {
    number: 7,
    nameArabic: 'الجزء السابع (وَإِذَا سَمِعُوا)',
    nameEnglish: 'Juz 7 (Wa Iza Sami\'u)',
    nameSomali: 'Juz-ka 7aad (Wa Izaa Sami\'uu)',
    startSurah: 5,
    startSurahName: 'Al-Ma\'idah',
    startSurahArabic: 'المَائِدَةِ',
    startAyah: 82,
    endSurah: 6,
    endSurahName: 'Al-An\'am',
    endSurahArabic: 'الأَنْعَامِ',
    endAyah: 110,
    startPage: 122,
    endPage: 141,
    totalPages: 20,
    startHizb: 13,
    endHizb: 14,
  },
  {
    number: 8,
    nameArabic: 'الجزء الثامن (وَلَوْ أَنَّنَا)',
    nameEnglish: 'Juz 8 (Wa Law Annana)',
    nameSomali: 'Juz-ka 8aad (Wa Law Annanaa)',
    startSurah: 6,
    startSurahName: 'Al-An\'am',
    startSurahArabic: 'الأَنْعَامِ',
    startAyah: 111,
    endSurah: 7,
    endSurahName: 'Al-A\'raf',
    endSurahArabic: 'الأَعْرَافِ',
    endAyah: 87,
    startPage: 142,
    endPage: 161,
    totalPages: 20,
    startHizb: 15,
    endHizb: 16,
  },
  {
    number: 9,
    nameArabic: 'الجزء التاسع (قَالَ الْمَلَأُ)',
    nameEnglish: 'Juz 9 (Qalal Mala\'u)',
    nameSomali: 'Juz-ka 9aad (Qaalal Mala\'u)',
    startSurah: 7,
    startSurahName: 'Al-A\'raf',
    startSurahArabic: 'الأَعْرَافِ',
    startAyah: 88,
    endSurah: 8,
    endSurahName: 'Al-Anfal',
    endSurahArabic: 'الأَنْفَالِ',
    endAyah: 40,
    startPage: 162,
    endPage: 181,
    totalPages: 20,
    startHizb: 17,
    endHizb: 18,
  },
  {
    number: 10,
    nameArabic: 'الجزء العاشر (وَاعْلَمُوا)',
    nameEnglish: 'Juz 10 (Wa\'lamu)',
    nameSomali: 'Juz-ka 10aad (Wa\'lamuu)',
    startSurah: 8,
    startSurahName: 'Al-Anfal',
    startSurahArabic: 'الأَنْفَالِ',
    startAyah: 41,
    endSurah: 9,
    endSurahName: 'At-Tawbah',
    endSurahArabic: 'التَّوْبَةِ',
    endAyah: 92,
    startPage: 182,
    endPage: 201,
    totalPages: 20,
    startHizb: 19,
    endHizb: 20,
  },
  {
    number: 11,
    nameArabic: 'الجزء الحادي عشر (يَعْتَذِرُونَ)',
    nameEnglish: 'Juz 11 (Ya\'tadhirun)',
    nameSomali: 'Juz-ka 11aad (Ya\'tadiruun)',
    startSurah: 9,
    startSurahName: 'At-Tawbah',
    startSurahArabic: 'التَّوْبَةِ',
    startAyah: 93,
    endSurah: 11,
    endSurahName: 'Hud',
    endSurahArabic: 'هُودٍ',
    endAyah: 5,
    startPage: 202,
    endPage: 221,
    totalPages: 20,
    startHizb: 21,
    endHizb: 22,
  },
  {
    number: 12,
    nameArabic: 'الجزء الثاني عشر (وَمَا مِنْ دَابَّةٍ)',
    nameEnglish: 'Juz 12 (Wa Ma Min Dabbah)',
    nameSomali: 'Juz-ka 12aad (Wa Maa Min Daabbah)',
    startSurah: 11,
    startSurahName: 'Hud',
    startSurahArabic: 'هُودٍ',
    startAyah: 6,
    endSurah: 12,
    endSurahName: 'Yusuf',
    endSurahArabic: 'يُوسُفَ',
    endAyah: 52,
    startPage: 222,
    endPage: 241,
    totalPages: 20,
    startHizb: 23,
    endHizb: 24,
  },
  {
    number: 13,
    nameArabic: 'الجزء الثالث عشر (وَمَا أُبَرِّئُ)',
    nameEnglish: 'Juz 13 (Wa Ma Ubarri\'u)',
    nameSomali: 'Juz-ka 13aad (Wa Maa Ubarri\'u)',
    startSurah: 12,
    startSurahName: 'Yusuf',
    startSurahArabic: 'يُوسُفَ',
    startAyah: 53,
    endSurah: 14,
    endSurahName: 'Ibrahim',
    endSurahArabic: 'إِبْرَاهِيمَ',
    endAyah: 52,
    startPage: 242,
    endPage: 261,
    totalPages: 20,
    startHizb: 25,
    endHizb: 26,
  },
  {
    number: 14,
    nameArabic: 'الجزء الرابع عشر (رُبَمَا)',
    nameEnglish: 'Juz 14 (Rubama)',
    nameSomali: 'Juz-ka 14aad (Rubamaa)',
    startSurah: 15,
    startSurahName: 'Al-Hijr',
    startSurahArabic: 'الحِجْرِ',
    startAyah: 1,
    endSurah: 16,
    endSurahName: 'An-Nahl',
    endSurahArabic: 'النَّحْلِ',
    endAyah: 128,
    startPage: 262,
    endPage: 281,
    totalPages: 20,
    startHizb: 27,
    endHizb: 28,
  },
  {
    number: 15,
    nameArabic: 'الجزء الخامس عشر (سُبْحَانَ الَّذِي)',
    nameEnglish: 'Juz 15 (Subhanallazi)',
    nameSomali: 'Juz-ka 15aad (Subxaana Alladii)',
    startSurah: 17,
    startSurahName: 'Al-Isra',
    startSurahArabic: 'الإِسْرَاءِ',
    startAyah: 1,
    endSurah: 18,
    endSurahName: 'Al-Kahf',
    endSurahArabic: 'الكَهْفِ',
    endAyah: 74,
    startPage: 282,
    endPage: 301,
    totalPages: 20,
    startHizb: 29,
    endHizb: 30,
  },
  {
    number: 16,
    nameArabic: 'الجزء السادس عشر (قَالَ أَلَمْ)',
    nameEnglish: 'Juz 16 (Qala Alam)',
    nameSomali: 'Juz-ka 16aad (Qaala Alam)',
    startSurah: 18,
    startSurahName: 'Al-Kahf',
    startSurahArabic: 'الكَهْفِ',
    startAyah: 75,
    endSurah: 20,
    endSurahName: 'Ta-Ha',
    endSurahArabic: 'طه',
    endAyah: 135,
    startPage: 302,
    endPage: 321,
    totalPages: 20,
    startHizb: 31,
    endHizb: 32,
  },
  {
    number: 17,
    nameArabic: 'الجزء السابع عشر (اقْتَرَبَ لِلنَّاسِ)',
    nameEnglish: 'Juz 17 (Iqtaraba Lin-Nas)',
    nameSomali: 'Juz-ka 17aad (Iqtaraba Lin-Naas)',
    startSurah: 21,
    startSurahName: 'Al-Anbiya',
    startSurahArabic: 'الأَنْبِيَاءِ',
    startAyah: 1,
    endSurah: 22,
    endSurahName: 'Al-Hajj',
    endSurahArabic: 'الحَجِّ',
    endAyah: 78,
    startPage: 322,
    endPage: 341,
    totalPages: 20,
    startHizb: 33,
    endHizb: 34,
  },
  {
    number: 18,
    nameArabic: 'الجزء الثامن عشر (قَدْ أَفْلَحَ)',
    nameEnglish: 'Juz 18 (Qad Aflaha)',
    nameSomali: 'Juz-ka 18aad (Qad Aflaxa)',
    startSurah: 23,
    startSurahName: 'Al-Mu\'minun',
    startSurahArabic: 'المُؤْمِنُونَ',
    startAyah: 1,
    endSurah: 25,
    endSurahName: 'Al-Furqan',
    endSurahArabic: 'الفُرْقَانِ',
    endAyah: 20,
    startPage: 342,
    endPage: 361,
    totalPages: 20,
    startHizb: 35,
    endHizb: 36,
  },
  {
    number: 19,
    nameArabic: 'الجزء التاسع عشر (وَقَالَ الَّذِينَ)',
    nameEnglish: 'Juz 19 (Wa Qalallazina)',
    nameSomali: 'Juz-ka 19aad (Wa Qaala Alladiina)',
    startSurah: 25,
    startSurahName: 'Al-Furqan',
    startSurahArabic: 'الفُرْقَانِ',
    startAyah: 21,
    endSurah: 27,
    endSurahName: 'An-Naml',
    endSurahArabic: 'النَّمْلِ',
    endAyah: 55,
    startPage: 362,
    endPage: 381,
    totalPages: 20,
    startHizb: 37,
    endHizb: 38,
  },
  {
    number: 20,
    nameArabic: 'الجزء العشرون (أَمَّنْ خَلَقَ)',
    nameEnglish: 'Juz 20 (Amman Khalaq)',
    nameSomali: 'Juz-ka 20aad (Amman Khalaqa)',
    startSurah: 27,
    startSurahName: 'An-Naml',
    startSurahArabic: 'النَّمْلِ',
    startAyah: 56,
    endSurah: 29,
    endSurahName: 'Al-\'Ankabut',
    endSurahArabic: 'العَنْكَبُوتِ',
    endAyah: 45,
    startPage: 382,
    endPage: 401,
    totalPages: 20,
    startHizb: 39,
    endHizb: 40,
  },
  {
    number: 21,
    nameArabic: 'الجزء الحادي والعشرون (اتْلُ مَا أُوحِيَ)',
    nameEnglish: 'Juz 21 (Utlu Ma Oohiya)',
    nameSomali: 'Juz-ka 21aad (Utlu Maa Uuxiya)',
    startSurah: 29,
    startSurahName: 'Al-\'Ankabut',
    startSurahArabic: 'العَنْكَبُوتِ',
    startAyah: 46,
    endSurah: 33,
    endSurahName: 'Al-Ahzab',
    endSurahArabic: 'الأَحْزَابِ',
    endAyah: 30,
    startPage: 402,
    endPage: 421,
    totalPages: 20,
    startHizb: 41,
    endHizb: 42,
  },
  {
    number: 22,
    nameArabic: 'الجزء الثاني والعشرون (وَمَنْ يَقْنُتْ)',
    nameEnglish: 'Juz 22 (Wa Man Yaqnut)',
    nameSomali: 'Juz-ka 22aad (Wa Man Yaqnut)',
    startSurah: 33,
    startSurahName: 'Al-Ahzab',
    startSurahArabic: 'الأَحْزَابِ',
    startAyah: 31,
    endSurah: 36,
    endSurahName: 'Ya-Sin',
    endSurahArabic: 'يس',
    endAyah: 27,
    startPage: 422,
    endPage: 441,
    totalPages: 20,
    startHizb: 43,
    endHizb: 44,
  },
  {
    number: 23,
    nameArabic: 'الجزء الثالث والعشرون (وَمَا أَنْزَلْنَا)',
    nameEnglish: 'Juz 23 (Wa Ma Anzalna)',
    nameSomali: 'Juz-ka 23aad (Wa Maa Anzalnaa)',
    startSurah: 36,
    startSurahName: 'Ya-Sin',
    startSurahArabic: 'يس',
    startAyah: 28,
    endSurah: 39,
    endSurahName: 'Az-Zumar',
    endSurahArabic: 'الزُّمَرِ',
    endAyah: 31,
    startPage: 442,
    endPage: 461,
    totalPages: 20,
    startHizb: 45,
    endHizb: 46,
  },
  {
    number: 24,
    nameArabic: 'الجزء الرابع والعشرون (فَمَنْ أَظْلَمُ)',
    nameEnglish: 'Juz 24 (Fa Man Azlamu)',
    nameSomali: 'Juz-ka 24aad (Faman Adhlamu)',
    startSurah: 39,
    startSurahName: 'Az-Zumar',
    startSurahArabic: 'الزُّمَرِ',
    startAyah: 32,
    endSurah: 41,
    endSurahName: 'Fussilat',
    endSurahArabic: 'فُصِّلَتْ',
    endAyah: 46,
    startPage: 462,
    endPage: 481,
    totalPages: 20,
    startHizb: 47,
    endHizb: 48,
  },
  {
    number: 25,
    nameArabic: 'الجزء الخامس والعشرون (إِلَيْهِ يُرَدُّ)',
    nameEnglish: 'Juz 25 (Ilayhi Yuraddu)',
    nameSomali: 'Juz-ka 25aad (Ilayhi Yuraddu)',
    startSurah: 41,
    startSurahName: 'Fussilat',
    startSurahArabic: 'فُصِّلَتْ',
    startAyah: 47,
    endSurah: 45,
    endSurahName: 'Al-Jathiyah',
    endSurahArabic: 'الجَاثِيَةِ',
    endAyah: 37,
    startPage: 482,
    endPage: 501,
    totalPages: 20,
    startHizb: 49,
    endHizb: 50,
  },
  {
    number: 26,
    nameArabic: 'الجزء السادس والعشرون (حم)',
    nameEnglish: 'Juz 26 (Ha-Meem)',
    nameSomali: 'Juz-ka 26aad (Xaa-Miim)',
    startSurah: 46,
    startSurahName: 'Al-Ahqaf',
    startSurahArabic: 'الأَحْقَافِ',
    startAyah: 1,
    endSurah: 51,
    endSurahName: 'Adh-Dhariyat',
    endSurahArabic: 'الذَّارِيَاتِ',
    endAyah: 30,
    startPage: 502,
    endPage: 521,
    totalPages: 20,
    startHizb: 51,
    endHizb: 52,
  },
  {
    number: 27,
    nameArabic: 'الجزء السابع والعشرون (قَالَ فَمَا خَطْبُكُمْ)',
    nameEnglish: 'Juz 27 (Qala Fama Khatbukum)',
    nameSomali: 'Juz-ka 27aad (Qaala Famaa Khatbukum)',
    startSurah: 51,
    startSurahName: 'Adh-Dhariyat',
    startSurahArabic: 'الذَّارِيَاتِ',
    startAyah: 31,
    endSurah: 57,
    endSurahName: 'Al-Hadid',
    endSurahArabic: 'الحَدِيدِ',
    endAyah: 29,
    startPage: 522,
    endPage: 541,
    totalPages: 20,
    startHizb: 53,
    endHizb: 54,
  },
  {
    number: 28,
    nameArabic: 'الجزء الثامن والعشرون (قَدْ سَمِعَ اللَّهُ)',
    nameEnglish: 'Juz 28 (Qad Sami\'allah)',
    nameSomali: 'Juz-ka 28aad (Qad Sami\'allahu)',
    startSurah: 58,
    startSurahName: 'Al-Mujadila',
    startSurahArabic: 'المُجَادِلَةِ',
    startAyah: 1,
    endSurah: 66,
    endSurahName: 'At-Tahrim',
    endSurahArabic: 'التَّحْرِيمِ',
    endAyah: 12,
    startPage: 542,
    endPage: 561,
    totalPages: 20,
    startHizb: 55,
    endHizb: 56,
  },
  {
    number: 29,
    nameArabic: 'الجزء التاسع والعشرون (تَبَارَكَ الَّذِي)',
    nameEnglish: 'Juz 29 (Tabarakallazi - Juz Tabarak)',
    nameSomali: 'Juz-ka 29aad (Tabaaraka Alladii - Juz Tabaarak)',
    startSurah: 67,
    startSurahName: 'Al-Mulk',
    startSurahArabic: 'المُلْكِ',
    startAyah: 1,
    endSurah: 77,
    endSurahName: 'Al-Mursalat',
    endSurahArabic: 'المُرْسَلَاتِ',
    endAyah: 50,
    startPage: 562,
    endPage: 581,
    totalPages: 20,
    startHizb: 57,
    endHizb: 58,
  },
  {
    number: 30,
    nameArabic: 'الجزء الثلاثون (عَمَّ يَتَسَاءَلُونَ - جُزْء عَمَّ)',
    nameEnglish: 'Juz 30 (\'Amma Yatasa\'aloon - Juz \'Amma)',
    nameSomali: 'Juz-ka 30aad (Camma Yatasaa\'aluun - Juz Camma)',
    startSurah: 78,
    startSurahName: 'An-Naba',
    startSurahArabic: 'النَّبَإِ',
    startAyah: 1,
    endSurah: 114,
    endSurahName: 'An-Nas',
    endSurahArabic: 'النَّاسِ',
    endAyah: 6,
    startPage: 582,
    endPage: 604,
    totalPages: 23,
    startHizb: 59,
    endHizb: 60,
  },
];

/**
 * Get all 30 Juz
 */
export function getAllJuz(): JuzInfo[] {
  return ALL_30_JUZ;
}

/**
 * Get Juz by its number (1..30)
 */
export function getJuzByNumber(juzNumber: number): JuzInfo | undefined {
  if (juzNumber < 1 || juzNumber > 30) return undefined;
  return ALL_30_JUZ[juzNumber - 1];
}

/**
 * Determine which Juz contains a given page (Madinah Mushaf 1..604)
 */
export function getJuzForPage(page: number): JuzInfo {
  const p = Math.max(1, Math.min(page, 604));
  const found = ALL_30_JUZ.find((j) => p >= j.startPage && p <= j.endPage);
  return found || ALL_30_JUZ[0];
}

/**
 * Calculate detailed progress statistics for any Quran location
 */
export function calculateQuranLocationProgress(
  page: number,
  juz: number,
  hizbQuarter?: number,
  mushafTotalPages: number = 604
) {
  const clampedPage = Math.max(1, Math.min(page, mushafTotalPages));
  const clampedJuz = Math.max(1, Math.min(juz, 30));

  const pagesCompletedBefore = clampedPage - 1;
  const pagesRemainingAfter = Math.max(0, mushafTotalPages - clampedPage);

  const juzCompletedBefore = clampedJuz - 1;
  const juzRemainingAfter = Math.max(0, 30 - clampedJuz);

  // Hizb and Quarter calculation
  const verifiedQuarter = hizbQuarter || Math.ceil((clampedPage / mushafTotalPages) * 240);
  const calculatedHizb = Math.ceil(verifiedQuarter / 4);
  const quarterInHizb = ((verifiedQuarter - 1) % 4) + 1;

  const percentage = Math.round((clampedPage / mushafTotalPages) * 1000) / 10;

  return {
    page: clampedPage,
    juz: clampedJuz,
    hizb: calculatedHizb,
    quarter: quarterInHizb,
    hizbQuarter: verifiedQuarter,
    pagesCompletedBefore,
    pagesRemainingAfter,
    juzCompletedBefore,
    juzRemainingAfter,
    percentage,
    mushafTotalPages,
  };
}

/**
 * Get the list of the first 15 Juz (Half of the Quran)
 */
export function getFirst15Juz(): JuzInfo[] {
  return ALL_30_JUZ.slice(0, 15);
}

/**
 * Interface representing a Surah's segment within a specific Juz
 */
export interface SurahInJuz {
  surahNumber: number;
  englishName: string;
  nameArabic: string;
  somaliNameTranslation: string;
  startAyahInJuz: number;
  endAyahInJuz: number;
  totalAyahsInJuz: number;
  totalSurahAyahs: number;
  revelationType: string;
  isEntireSurahInJuz: boolean;
}

/**
 * Return all Surahs that fall inside a given Juz (1..30) with exact ayah boundaries
 */
export function getSurahsForJuz(juzNumber: number): SurahInJuz[] {
  const juz = getJuzByNumber(juzNumber);
  if (!juz) return [];

  const results: SurahInJuz[] = [];

  for (let sNum = juz.startSurah; sNum <= juz.endSurah; sNum++) {
    const sMeta = ALL_114_SURAHS.find((s) => s.number === sNum);
    if (!sMeta) continue;

    let startAyahInJuz = 1;
    let endAyahInJuz = sMeta.numberOfAyahs;

    if (sNum === juz.startSurah) {
      startAyahInJuz = juz.startAyah;
    }
    if (sNum === juz.endSurah) {
      endAyahInJuz = juz.endAyah;
    }

    const totalInJuz = endAyahInJuz - startAyahInJuz + 1;
    const isEntire = totalInJuz === sMeta.numberOfAyahs;

    results.push({
      surahNumber: sMeta.number,
      englishName: sMeta.englishName,
      nameArabic: sMeta.name,
      somaliNameTranslation: sMeta.somaliNameTranslation || sMeta.englishNameTranslation,
      startAyahInJuz,
      endAyahInJuz,
      totalAyahsInJuz: totalInJuz,
      totalSurahAyahs: sMeta.numberOfAyahs,
      revelationType: sMeta.revelationType,
      isEntireSurahInJuz: isEntire,
    });
  }

  return results;
}
