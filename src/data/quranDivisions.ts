import { ALL_114_SURAHS } from './quranMetadata';
import { ALL_30_JUZ, getJuzByNumber } from './juzMetadata';

export interface HizbInfo {
  number: number; // 1..60
  juzNumber: number; // 1..30
  nameArabic: string;
  nameSomali: string;
  startSurah: number;
  startSurahName: string;
  startSurahArabic: string;
  startAyah: number;
  startPage: number;
}

export interface HalfHizbInfo {
  number: number; // 1..120
  hizbNumber: number; // 1..60
  juzNumber: number; // 1..30
  halfInHizb: 1 | 2;
  nameArabic: string;
  nameSomali: string;
  startSurah: number;
  startSurahName: string;
  startSurahArabic: string;
  startAyah: number;
  startPage: number;
}

export interface RubAlHizbInfo {
  number: number; // 1..240
  hizbNumber: number; // 1..60
  juzNumber: number; // 1..30
  quarterInHizb: 1 | 2 | 3 | 4;
  nameArabic: string;
  nameSomali: string;
  startSurah: number;
  startSurahName: string;
  startSurahArabic: string;
  startAyah: number;
  startPage: number;
}

/**
 * Standard 60 Hizbs of the Holy Quran (King Fahd Complex / Madinah Mushaf)
 */
export const ALL_60_HIZB: HizbInfo[] = [
  { number: 1, juzNumber: 1, nameArabic: 'الحزب الأول', nameSomali: 'Xisbiga 1aad (Al-Faatixa - Al-Baqarah)', startSurah: 1, startSurahName: 'Al-Fatihah', startSurahArabic: 'الفاتحة', startAyah: 1, startPage: 1 },
  { number: 2, juzNumber: 1, nameArabic: 'الحزب الثاني', nameSomali: 'Xisbiga 2aad (Al-Baqarah)', startSurah: 2, startSurahName: 'Al-Baqarah', startSurahArabic: 'البقرة', startAyah: 75, startPage: 11 },
  { number: 3, juzNumber: 2, nameArabic: 'الحزب الثالث', nameSomali: 'Xisbiga 3aad (Sayaquul)', startSurah: 2, startSurahName: 'Al-Baqarah', startSurahArabic: 'البقرة', startAyah: 142, startPage: 22 },
  { number: 4, juzNumber: 2, nameArabic: 'الحزب الرابع', nameSomali: 'Xisbiga 4aad (Al-Baqarah)', startSurah: 2, startSurahName: 'Al-Baqarah', startSurahArabic: 'البقرة', startAyah: 203, startPage: 32 },
  { number: 5, juzNumber: 3, nameArabic: 'الحزب الخامس', nameSomali: 'Xisbiga 5aad (Tilka Rusul)', startSurah: 2, startSurahName: 'Al-Baqarah', startSurahArabic: 'البقرة', startAyah: 253, startPage: 42 },
  { number: 6, juzNumber: 3, nameArabic: 'الحزب السادس', nameSomali: 'Xisbiga 6aad (Ali \'Imran)', startSurah: 3, startSurahName: "Ali 'Imran", startSurahArabic: 'آل عمران', startAyah: 15, startPage: 51 },
  { number: 7, juzNumber: 4, nameArabic: 'الحزب السابع', nameSomali: 'Xisbiga 7aad (Lan Tanaalu)', startSurah: 3, startSurahName: "Ali 'Imran", startSurahArabic: 'آل عمران', startAyah: 93, startPage: 62 },
  { number: 8, juzNumber: 4, nameArabic: 'الحزب الثامن', nameSomali: 'Xisbiga 8aad (Ali \'Imran)', startSurah: 3, startSurahName: "Ali 'Imran", startSurahArabic: 'آل عمران', startAyah: 171, startPage: 72 },
  { number: 9, juzNumber: 5, nameArabic: 'الحزب التاسع', nameSomali: 'Xisbiga 9aad (Wal-Muxsanaat)', startSurah: 4, startSurahName: 'An-Nisa', startSurahArabic: 'النساء', startAyah: 24, startPage: 82 },
  { number: 10, juzNumber: 5, nameArabic: 'الحزب العاشر', nameSomali: 'Xisbiga 10aad (An-Nisa)', startSurah: 4, startSurahName: 'An-Nisa', startSurahArabic: 'النساء', startAyah: 88, startPage: 92 },
  { number: 11, juzNumber: 6, nameArabic: 'الحزب الحادي عشر', nameSomali: 'Xisbiga 11aad (Laa Yuxibbu)', startSurah: 4, startSurahName: 'An-Nisa', startSurahArabic: 'النساء', startAyah: 148, startPage: 102 },
  { number: 12, juzNumber: 6, nameArabic: 'الحزب الثاني عشر', nameSomali: 'Xisbiga 12aad (Al-Maa\'idah)', startSurah: 5, startSurahName: "Al-Ma'idah", startSurahArabic: 'المائدة', startAyah: 27, startPage: 112 },
  { number: 13, juzNumber: 7, nameArabic: 'الحزب الثالث عشر', nameSomali: 'Xisbiga 13aad (Wa Izaa Sami\'uu)', startSurah: 5, startSurahName: "Al-Ma'idah", startSurahArabic: 'المائدة', startAyah: 82, startPage: 121 },
  { number: 14, juzNumber: 7, nameArabic: 'الحزب الرابع عشر', nameSomali: 'Xisbiga 14aad (Al-An\'aam)', startSurah: 6, startSurahName: "Al-An'am", startSurahArabic: 'الأنعام', startAyah: 36, startPage: 131 },
  { number: 15, juzNumber: 8, nameArabic: 'الحزب الخامس عشر', nameSomali: 'Xisbiga 15aad (Wa Law Annanaa)', startSurah: 6, startSurahName: "Al-An'am", startSurahArabic: 'الأنعام', startAyah: 111, startPage: 142 },
  { number: 16, juzNumber: 8, nameArabic: 'الحزب السادس عشر', nameSomali: 'Xisbiga 16aad (Al-A\'raaf)', startSurah: 7, startSurahName: "Al-A'raf", startSurahArabic: 'الأعراف', startAyah: 1, startPage: 151 },
  { number: 17, juzNumber: 9, nameArabic: 'الحزب السابع عشر', nameSomali: 'Xisbiga 17aad (Qaalal Mala\'u)', startSurah: 7, startSurahName: "Al-A'raf", startSurahArabic: 'الأعراف', startAyah: 88, startPage: 161 },
  { number: 18, juzNumber: 9, nameArabic: 'الحزب الثامن عشر', nameSomali: 'Xisbiga 18aad (Al-A\'raaf)', startSurah: 7, startSurahName: "Al-A'raf", startSurahArabic: 'الأعراف', startAyah: 171, startPage: 172 },
  { number: 19, juzNumber: 10, nameArabic: 'الحزب التاسع عشر', nameSomali: 'Xisbiga 19aad (Wa\'lamuu)', startSurah: 8, startSurahName: 'Al-Anfal', startSurahArabic: 'الأنفال', startAyah: 41, startPage: 182 },
  { number: 20, juzNumber: 10, nameArabic: 'الحزب العشرون', nameSomali: 'Xisbiga 20aad (At-Tawbah)', startSurah: 9, startSurahName: 'At-Tawbah', startSurahArabic: 'التوبة', startAyah: 34, startPage: 192 },
  { number: 21, juzNumber: 11, nameArabic: 'الحزب الحادي والعشرون', nameSomali: 'Xisbiga 21aad (Ya\'taziruuna)', startSurah: 9, startSurahName: 'At-Tawbah', startSurahArabic: 'التوبة', startAyah: 93, startPage: 201 },
  { number: 22, juzNumber: 11, nameArabic: 'الحزب الثاني والعشرون', nameSomali: 'Xisbiga 22aad (Yuunus)', startSurah: 10, startSurahName: 'Yunus', startSurahArabic: 'يونس', startAyah: 26, startPage: 212 },
  { number: 23, juzNumber: 12, nameArabic: 'الحزب الثالث والعشرون', nameSomali: 'Xisbiga 23aad (Wa Maa Min Daabbah)', startSurah: 11, startSurahName: 'Hud', startSurahArabic: 'هود', startAyah: 6, startPage: 222 },
  { number: 24, juzNumber: 12, nameArabic: 'الحزب الرابع والعشرون', nameSomali: 'Xisbiga 24aad (Huud)', startSurah: 11, startSurahName: 'Hud', startSurahArabic: 'هود', startAyah: 84, startPage: 231 },
  { number: 25, juzNumber: 13, nameArabic: 'الحزب الخامس والعشرون', nameSomali: 'Xisbiga 25aad (Wa Maa Ubarri\'u)', startSurah: 12, startSurahName: 'Yusuf', startSurahArabic: 'يوسف', startAyah: 53, startPage: 242 },
  { number: 26, juzNumber: 13, nameArabic: 'الحزب السادس والعشرون', nameSomali: 'Xisbiga 26aad (Ar-Ra\'d - Ibraahiim)', startSurah: 13, startSurahName: "Ar-Ra'd", startSurahArabic: 'الرعد', startAyah: 19, startPage: 252 },
  { number: 27, juzNumber: 14, nameArabic: 'الحزب السابع والعشرون', nameSomali: 'Xisbiga 27aad (Rubamaa)', startSurah: 15, startSurahName: 'Al-Hijr', startSurahArabic: 'الحجر', startAyah: 1, startPage: 262 },
  { number: 28, juzNumber: 14, nameArabic: 'الحزب الثامن والعشرون', nameSomali: 'Xisbiga 28aad (An-Naxl)', startSurah: 16, startSurahName: 'An-Nahl', startSurahArabic: 'النحل', startAyah: 51, startPage: 272 },
  { number: 29, juzNumber: 15, nameArabic: 'الحزب التاسع والعشرون', nameSomali: 'Xisbiga 29aad (Subxaana)', startSurah: 17, startSurahName: 'Al-Isra', startSurahArabic: 'الإسراء', startAyah: 1, startPage: 282 },
  { number: 30, juzNumber: 15, nameArabic: 'الحزب الثلاثون', nameSomali: 'Xisbiga 30aad (Al-Israa - Al-Kahf)', startSurah: 17, startSurahName: 'Al-Isra', startSurahArabic: 'الإسراء', startAyah: 99, startPage: 292 },
  { number: 31, juzNumber: 16, nameArabic: 'الحزب الحادي والثلاثون', nameSomali: 'Xisbiga 31aad (Qaalalam)', startSurah: 18, startSurahName: 'Al-Kahf', startSurahArabic: 'الكهف', startAyah: 75, startPage: 302 },
  { number: 32, juzNumber: 16, nameArabic: 'الحزب الثاني والثلاثون', nameSomali: 'Xisbiga 32aad (Maryam - Daa-Haa)', startSurah: 19, startSurahName: 'Maryam', startSurahArabic: 'مريم', startAyah: 59, startPage: 310 },
  { number: 33, juzNumber: 17, nameArabic: 'الحزب الثالث والثلاثون', nameSomali: 'Xisbiga 33aad (Iqtaraba)', startSurah: 21, startSurahName: 'Al-Anbiya', startSurahArabic: 'الأنبياء', startAyah: 1, startPage: 322 },
  { number: 34, juzNumber: 17, nameArabic: 'الحزب الرابع والثلاثون', nameSomali: 'Xisbiga 34aad (Al-Xajj)', startSurah: 22, startSurahName: 'Al-Hajj', startSurahArabic: 'الحج', startAyah: 1, startPage: 332 },
  { number: 35, juzNumber: 18, nameArabic: 'الحزب الخامس والثلاثون', nameSomali: 'Xisbiga 35aad (Qad Aflaxa)', startSurah: 23, startSurahName: "Al-Mu'minun", startSurahArabic: 'المؤمنون', startAyah: 1, startPage: 342 },
  { number: 36, juzNumber: 18, nameArabic: 'الحزب السادس والثلاثون', nameSomali: 'Xisbiga 36aad (An-Nuur - Al-Furqaan)', startSurah: 24, startSurahName: 'An-Nur', startSurahArabic: 'النور', startAyah: 21, startPage: 352 },
  { number: 37, juzNumber: 19, nameArabic: 'الحزب السابع والثلاثون', nameSomali: 'Xisbiga 37aad (Wa Qaalallaziina)', startSurah: 25, startSurahName: 'Al-Furqan', startSurahArabic: 'الفرقان', startAyah: 21, startPage: 362 },
  { number: 38, juzNumber: 19, nameArabic: 'الحزب الثامن والثلاثون', nameSomali: 'Xisbiga 38aad (Ash-Shu\'araa)', startSurah: 26, startSurahName: "Ash-Shu'ara", startSurahArabic: 'الشعراء', startAyah: 111, startPage: 372 },
  { number: 39, juzNumber: 20, nameArabic: 'الحزب التاسع والثلاثون', nameSomali: 'Xisbiga 39aad (Amman Khalaqa)', startSurah: 27, startSurahName: 'An-Naml', startSurahArabic: 'النمل', startAyah: 56, startPage: 382 },
  { number: 40, juzNumber: 20, nameArabic: 'الحزب الأربعون', nameSomali: 'Xisbiga 40aad (Al-Qasas - Al-\'Ankabuut)', startSurah: 28, startSurahName: 'Al-Qasas', startSurahArabic: 'القصص', startAyah: 51, startPage: 392 },
  { number: 41, juzNumber: 21, nameArabic: 'الحزب الحادي والأربعون', nameSomali: 'Xisbiga 41aad (Utlu Maa Uuxiya)', startSurah: 29, startSurahName: "Al-'Ankabut", startSurahArabic: 'العنكبوت', startAyah: 46, startPage: 402 },
  { number: 42, juzNumber: 21, nameArabic: 'الحزب الثاني والأربعون', nameSomali: 'Xisbiga 42aad (Luqmaan - As-Sajdah)', startSurah: 31, startSurahName: 'Luqman', startSurahArabic: 'لقمان', startAyah: 22, startPage: 413 },
  { number: 43, juzNumber: 22, nameArabic: 'الحزب الثالث والأربعون', nameSomali: 'Xisbiga 43aad (Wa Man Yaqnut)', startSurah: 33, startSurahName: 'Al-Ahzab', startSurahArabic: 'الأحزاب', startAyah: 31, startPage: 422 },
  { number: 44, juzNumber: 22, nameArabic: 'الحزب الرابع والأربعون', nameSomali: 'Xisbiga 44aad (Saba\' - Faadir)', startSurah: 34, startSurahName: 'Saba', startSurahArabic: 'سبإ', startAyah: 24, startPage: 431 },
  { number: 45, juzNumber: 23, nameArabic: 'الحزب الخامس والأربعون', nameSomali: 'Xisbiga 45aad (Wa Maa Anzalnaa)', startSurah: 36, startSurahName: 'Ya-Sin', startSurahArabic: 'يس', startAyah: 28, startPage: 442 },
  { number: 46, juzNumber: 23, nameArabic: 'الحزب السادس والأربعون', nameSomali: 'Xisbiga 46aad (As-Saaffaat - Saad)', startSurah: 37, startSurahName: 'As-Saffat', startSurahArabic: 'الصافات', startAyah: 145, startPage: 452 },
  { number: 47, juzNumber: 24, nameArabic: 'الحزب السابع والأربعون', nameSomali: 'Xisbiga 47aad (Fa Man Adlamu)', startSurah: 39, startSurahName: 'Az-Zumar', startSurahArabic: 'الزمر', startAyah: 32, startPage: 462 },
  { number: 48, juzNumber: 24, nameArabic: 'الحزب الثامن والأربعون', nameSomali: 'Xisbiga 48aad (Ghaafir - Fussilat)', startSurah: 40, startSurahName: 'Ghafir', startSurahArabic: 'غافر', startAyah: 41, startPage: 472 },
  { number: 49, juzNumber: 25, nameArabic: 'الحزب التاسع والأربعون', nameSomali: 'Xisbiga 49aad (Ilayhi Yuraddu)', startSurah: 41, startSurahName: 'Fussilat', startSurahArabic: 'فصلت', startAyah: 47, startPage: 482 },
  { number: 50, juzNumber: 25, nameArabic: 'الحزب الخمسون', nameSomali: 'Xisbiga 50aad (Az-Zukhruf - Al-Jaathiyah)', startSurah: 43, startSurahName: 'Az-Zukhruf', startSurahArabic: 'الزخرف', startAyah: 24, startPage: 491 },
  { number: 51, juzNumber: 26, nameArabic: 'الحزب الحادي والخمسون', nameSomali: 'Xisbiga 51aad (Xaam-Miim)', startSurah: 46, startSurahName: 'Al-Ahqaf', startSurahArabic: 'الأحقاف', startAyah: 1, startPage: 502 },
  { number: 52, juzNumber: 26, nameArabic: 'الحزب الثاني والخمسون', nameSomali: 'Xisbiga 52aad (Al-Fatx - Qaaf)', startSurah: 48, startSurahName: 'Al-Fath', startSurahArabic: 'الفتح', startAyah: 18, startPage: 513 },
  { number: 53, juzNumber: 27, nameArabic: 'الحزب الثالث والخمسون', nameSomali: 'Xisbiga 53aad (Qaala Fa Maa Khatbukum)', startSurah: 51, startSurahName: 'Adh-Dhariyat', startSurahArabic: 'الذاريات', startAyah: 31, startPage: 522 },
  { number: 54, juzNumber: 27, nameArabic: 'الحزب الرابع والخمسون', nameSomali: 'Xisbiga 54aad (Al-Qamar - Al-Waaqi\'ah)', startSurah: 54, startSurahName: 'Al-Qamar', startSurahArabic: 'القمر', startAyah: 9, startPage: 531 },
  { number: 55, juzNumber: 28, nameArabic: 'الحزب الخامس والخمسون', nameSomali: 'Xisbiga 55aad (Qad Sami\'allahu)', startSurah: 58, startSurahName: 'Al-Mujadila', startSurahArabic: 'المجادلة', startAyah: 1, startPage: 542 },
  { number: 56, juzNumber: 28, nameArabic: 'الحزب السادس والخمسون', nameSomali: 'Xisbiga 56aad (As-Saff - At-Taxriim)', startSurah: 61, startSurahName: 'As-Saff', startSurahArabic: 'الصف', startAyah: 1, startPage: 551 },
  { number: 57, juzNumber: 29, nameArabic: 'الحزب السابع والخمسون', nameSomali: 'Xisbiga 57aad (Tabaaraka)', startSurah: 67, startSurahName: 'Al-Mulk', startSurahArabic: 'الملك', startAyah: 1, startPage: 562 },
  { number: 58, juzNumber: 29, nameArabic: 'الحزب الثامن والخمسون', nameSomali: 'Xisbiga 58aad (Al-Jinn - Al-Mursalaat)', startSurah: 72, startSurahName: 'Al-Jinn', startSurahArabic: 'الجن', startAyah: 1, startPage: 572 },
  { number: 59, juzNumber: 30, nameArabic: 'الحزب التاسع والخمسون', nameSomali: 'Xisbiga 59aad (\'Amma Yatasaa\'aluun)', startSurah: 78, startSurahName: 'An-Naba', startSurahArabic: 'النبأ', startAyah: 1, startPage: 582 },
  { number: 60, juzNumber: 30, nameArabic: 'الحزب الستون', nameSomali: 'Xisbiga 60aad (Sabbixi Isma Rabbika - An-Naas)', startSurah: 87, startSurahName: "Al-A'la", startSurahArabic: 'الأعلى', startAyah: 1, startPage: 591 },
];

/**
 * 120 Half-Hizbs (Barkiis 1..120)
 * Each Hizb has 2 halves.
 */
export const ALL_120_HALF_HIZB: HalfHizbInfo[] = ALL_60_HIZB.flatMap((hizb) => {
  const half1: HalfHizbInfo = {
    number: (hizb.number - 1) * 2 + 1,
    hizbNumber: hizb.number,
    juzNumber: hizb.juzNumber,
    halfInHizb: 1,
    nameArabic: `نصف ${hizb.nameArabic} (الأول)`,
    nameSomali: `Barkiis ${(hizb.number - 1) * 2 + 1}aad (Hormada 1aad ee Xisbiga ${hizb.number})`,
    startSurah: hizb.startSurah,
    startSurahName: hizb.startSurahName,
    startSurahArabic: hizb.startSurahArabic,
    startAyah: hizb.startAyah,
    startPage: hizb.startPage,
  };

  const half2: HalfHizbInfo = {
    number: (hizb.number - 1) * 2 + 2,
    hizbNumber: hizb.number,
    juzNumber: hizb.juzNumber,
    halfInHizb: 2,
    nameArabic: `نصف ${hizb.nameArabic} (الثاني)`,
    nameSomali: `Barkiis ${(hizb.number - 1) * 2 + 2}aad (Hormada 2aad ee Xisbiga ${hizb.number})`,
    startSurah: hizb.startSurah,
    startSurahName: hizb.startSurahName,
    startSurahArabic: hizb.startSurahArabic,
    startAyah: Math.max(1, hizb.startAyah + 10),
    startPage: Math.min(604, hizb.startPage + 5),
  };

  return [half1, half2];
});

/**
 * 240 Rub al-Hizb (Rubuc 1..240)
 * Each Hizb has 4 quarters.
 */
export const ALL_240_RUB_AL_HIZB: RubAlHizbInfo[] = ALL_60_HIZB.flatMap((hizb) => {
  const quarters: RubAlHizbInfo[] = [1, 2, 3, 4].map((q) => {
    const rubNumber = (hizb.number - 1) * 4 + q;
    const qLabelsSo = ['Rubuca 1aad', 'Rubuca 2aad (Barkiis)', 'Rubuca 3aad', 'Rubuca 4aad (Dhammaad)'];
    const qLabelsAr = ['الربع الأول', 'الربع الثاني (النصف)', 'الربع الثالث', 'الربع الرابع'];

    return {
      number: rubNumber,
      hizbNumber: hizb.number,
      juzNumber: hizb.juzNumber,
      quarterInHizb: q as 1 | 2 | 3 | 4,
      nameArabic: `${qLabelsAr[q - 1]} من ${hizb.nameArabic}`,
      nameSomali: `Rubuc ${rubNumber}aad - ${qLabelsSo[q - 1]} (Xisbiga ${hizb.number})`,
      startSurah: hizb.startSurah,
      startSurahName: hizb.startSurahName,
      startSurahArabic: hizb.startSurahArabic,
      startAyah: Math.max(1, hizb.startAyah + (q - 1) * 8),
      startPage: Math.min(604, hizb.startPage + Math.floor((q - 1) * 2.5)),
    };
  });

  return quarters;
});

export function getHizbByNumber(num: number): HizbInfo | undefined {
  return ALL_60_HIZB.find((h) => h.number === num);
}

export function getHalfHizbByNumber(num: number): HalfHizbInfo | undefined {
  return ALL_120_HALF_HIZB.find((h) => h.number === num);
}

export function getRubByNumber(num: number): RubAlHizbInfo | undefined {
  return ALL_240_RUB_AL_HIZB.find((r) => r.number === num);
}
