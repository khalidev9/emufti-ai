import type { QariReciter } from '../types/database.ts';
import { RECITER_AVATARS } from './reciterAvatars.ts';

/**
 * Catalog of 50 Verified Quran Reciters (Qurra)
 * Sourced from legitimate Islamic audio repositories (EveryAyah CDN and mp3quran.net CDN).
 * Every audio endpoint has been validated via HTTP HEAD status checks.
 * Includes prominent Somali reciter Sheikh Abdur-Rashid Ali Sufi (عبد الرشيد صوفي).
 */
export const ALL_50_QARIS: QariReciter[] = [
  // 1. Somalia
  {
    id: 'abdulrasheed-sufi',
    name: 'Sheikh Abdul Rashid Ali Sufi',
    arabicName: 'الشيخ عبد الرشيد بن علي صوفي',
    country: 'Somalia',
    style: 'Murattal (Hafs & Qira\'at)',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'World-renowned Somali Qari and master of the Ten Qira\'at, son of the esteemed Sheikh Ali Sufi.',
  },
  // 2. Kuwait
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    country: 'Kuwait',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Kuwaiti imam and internationally acclaimed reciter, Imam of the Grand Mosque of Kuwait.',
  },
  // 3. Egypt
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    country: 'Egypt',
    style: 'Murattal (Standard Tajweed)',
    verseBaseUrl: 'https://everyayah.com/data/Husary_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/khalil_al_husary/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Pioneering Egyptian master of Tajweed, widely considered the golden reference for Quranic pronunciation.',
  },
  // 4. Egypt
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    country: 'Egypt',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/abdul_baset/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Legendary Egyptian Qari known as the "Golden Voice of the Quran" across the Islamic world.',
  },
  // 5. Egypt
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    country: 'Egypt',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Revered Egyptian reciter distinguished by his profoundly emotional and humble recitation style.',
  },
  // 6. Saudi Arabia
  {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر بن حمد المعيقلي',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    verseBaseUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps',
    surahBaseUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.mahermuaiqly',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Beloved Imam of Masjid al-Haram in Mecca with clear and resonant Taraweeh recitations.',
  },
  // 7. Saudi Arabia
  {
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد بن سعيد الغامدي',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/sa3d_al-ghaamidee/complete',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Accomplished Saudi Qari and Islamic scholar whose recitations are broadcast globally.',
  },
  // 8. Saudi Arabia
  {
    id: 'shatri',
    name: 'Abu Bakr Al-Shatri',
    arabicName: 'أبو بكر الشاطري',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/abu_bakr_shatri/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Prominent Saudi reciter with an unmistakable melodic pacing and crystalline Tajweed.',
  },
  // 9. Saudi Arabia
  {
    id: 'shuraim',
    name: 'Saud Al-Shuraim',
    arabicName: 'سعود بن إبراهيم الشريم',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    verseBaseUrl: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Former Imam and Khateeb of the Grand Mosque in Mecca, renowned for his rhythmic recitation.',
  },
  // 10. Saudi Arabia
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    arabicName: 'عبد الرحمن بن عبد العزيز السديس',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    verseBaseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Chief of the Presidency for the Two Holy Mosques and legendary Imam of Masjid al-Haram.',
  },
  // 11. Saudi Arabia
  {
    id: 'yasser_dosari',
    name: 'Yasser Al-Dosari',
    arabicName: 'ياسر بن راشد الدوسري',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    verseBaseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/yasser_ad-dussary',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Imam of Masjid al-Haram in Mecca celebrated for his stirring and powerful vocal delivery.',
  },
  // 12. Saudi Arabia
  {
    id: 'qatami',
    name: 'Nasser Al-Qatami',
    arabicName: 'ناصر بن علي القطامي',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Nasser_Alqatami_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/nasser_alqatami',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Prominent Riyadh Imam recognized for his gentle tone and deeply moving supplications.',
  },
  // 13. Saudi Arabia
  {
    id: 'ayyub',
    name: 'Muhammad Ayyub',
    arabicName: 'محمد أيوب بن محمد يوسف',
    country: 'Saudi Arabia',
    style: 'Murattal (Prophetic Mosque)',
    verseBaseUrl: 'https://everyayah.com/data/Muhammad_Ayyoub_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/muhammad_ayyoob',
    hasVerseAudio: true,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/ar/6/6f/Muhammad_ayop.jpeg',
    bio: 'Beloved former Imam of Al-Masjid an-Nabawi in Medina with a deeply contemplative cadence.',
  },
  // 14. Saudi Arabia
  {
    id: 'ali_jaber',
    name: 'Ali Jaber',
    arabicName: 'علي بن عبد الله جابر',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain Heritage)',
    verseBaseUrl: 'https://everyayah.com/data/Ali_Jaber_64kbps',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/ali-jaber/r1',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Historic Imam of the Grand Mosque in Mecca whose 1980s recitations inspired millions.',
  },
  // 15. Saudi Arabia
  {
    id: 'rifai',
    name: 'Hani Ar-Rifai',
    arabicName: 'هاني بن عبد الرحيم الرفاعي',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Hani_Rifai_192kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/qdc/hani_ar_rifai/murattal',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Imam of the Anani Mosque in Jeddah, celebrated for his heartfelt emotional recitations.',
  },
  // 16. Saudi Arabia
  {
    id: 'basfar',
    name: 'Abdullah Basfar',
    arabicName: 'عبد الله بن علي بصفر',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Abdullah_Basfar_192kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/abdullaah_basfar',
    hasVerseAudio: true,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Abdullah_Basfar.jpg/300px-Abdullah_Basfar.jpg',
    bio: 'Secretary General of the World Book and Sunnah Organization, renowned for clear teaching.',
  },
  // 17. Saudi Arabia
  {
    id: 'hudhaifi',
    name: 'Ali Al-Hudhaifi',
    arabicName: 'علي بن عبد الرحمن الحذيفي',
    country: 'Saudi Arabia',
    style: 'Murattal (Prophetic Mosque)',
    verseBaseUrl: 'https://everyayah.com/data/Hudhaify_128kbps',
    surahBaseUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.hudhaify',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Chief Imam of Al-Masjid an-Nabawi in Medina, praised for deliberate and precise recitation.',
  },
  // 18. Saudi Arabia
  {
    id: 'budair',
    name: 'Salah Al-Budair',
    arabicName: 'صلاح بن محمد البدير',
    country: 'Saudi Arabia',
    style: 'Murattal (Prophetic Mosque)',
    verseBaseUrl: 'https://everyayah.com/data/Salah_Al_Budair_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/salahbudair',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Imam of the Prophet\'s Mosque in Medina and judge in the High Court of Medina.',
  },
  // 19. Saudi Arabia
  {
    id: 'akhdar',
    name: 'Ibrahim Al-Akhdar',
    arabicName: 'إبراهيم بن الأخضر القيم',
    country: 'Saudi Arabia',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Ibrahim_Akhdar_32kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/ibrahim_al-akhdar',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Shaykh al-Qurra in Medina and former Imam of the Prophet\'s Mosque.',
  },
  // 20. United Arab Emirates
  {
    id: 'tunaiji',
    name: 'Khalifa Al-Tunaiji',
    arabicName: 'خليفة مصبح أحمد الطنيجي',
    country: 'United Arab Emirates',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/khalefa_al_tunaiji_64kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/khalifa_al_tunaiji',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Emirati reciter with an exceptionally soothing voice and high Tajweed precision.',
  },
  // 21. Egypt
  {
    id: 'tablawi',
    name: 'Mohammad Al-Tablawi',
    arabicName: 'محمد محمود الطبلاوي',
    country: 'Egypt',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Mohammad_al_Tablaway_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/mohammad_al_tablaway',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Former head of the Egyptian Reciters Syndicate and distinguished reciter of Cairo.',
  },
  // 22. Egypt
  {
    id: 'jibreel',
    name: 'Muhammad Jibreel',
    arabicName: 'محمد محمد السيد جبريل',
    country: 'Egypt',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Muhammad_Jibreel_128kbps',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/muhammad_jibreel/complete',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Renowned Egyptian Qari famous for leading massive Dua al-Khatm prayers at Amr ibn al-Aas Mosque.',
  },
  // 23. Yemen
  {
    id: 'fares_abbad',
    name: 'Fares Abbad',
    arabicName: 'فارس عبد ربه محمد عباد',
    country: 'Yemen',
    style: 'Murattal',
    verseBaseUrl: 'https://everyayah.com/data/Fares_Abbad_64kbps',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/fares-abbad/r1',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'Acclaimed Yemeni reciter with an enchanting, tranquil melody beloved worldwide.',
  },
  // 24. Syria
  {
    id: 'ayman_suwaid',
    name: 'Dr. Ayman Suwaid',
    arabicName: 'د. أيمن رشدي سويد',
    country: 'Syria',
    style: 'Murattal (Educational Tajweed)',
    verseBaseUrl: 'https://everyayah.com/data/Ayman_Sowaid_64kbps',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/ayman-suwaid/r1',
    hasVerseAudio: true,
    surahTotal: 114,
    bio: 'World authority in Quranic sciences and Tajweed, host of the premier Tajweed TV series.',
  },
  // 25. Egypt
  {
    id: 'banna',
    name: 'Mahmoud Ali Al-Banna',
    arabicName: 'محمود علي البنا',
    country: 'Egypt',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/mahmood_3alee_al_bannaa',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Classic Egyptian master reciter who served as Qari at the Mosque of Imam Al-Hussein in Cairo.',
  },
  // 26. Saudi Arabia
  {
    id: 'ajmi',
    name: 'Ahmed Al-Ajmi',
    arabicName: 'أحمد بن علي العجمي',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/ahmed_ibn_3alee_al-3ajamy',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Esteemed Khobar-born Saudi reciter with widespread global popularity.',
  },
  // 27. Egypt
  {
    id: 'mustafa_ismail',
    name: 'Mustafa Ismail',
    arabicName: 'مصطفى إسماعيل',
    country: 'Egypt',
    style: 'Mujawwad',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/mustafa_ismaa3eel',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Legendary Egyptian Qari known as the King of Maqamat and pioneer of modern Quran recitation.',
  },
  // 28. Saudi Arabia
  {
    id: 'hanif',
    name: 'Abdul Wadud Hanif',
    arabicName: 'عبد الودود مقبول حنيف',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/abdulwadood_haneef',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Professor at Umm Al-Qura University and former guest Imam of the Prophet\'s Mosque.',
  },
  // 29. Saudi Arabia
  {
    id: 'baleela',
    name: 'Bandar Baleela',
    arabicName: 'بندر بن عبد العزيز بليلة',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/bandar-baleela/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Imam and Khateeb of Masjid al-Haram in Mecca and member of the Council of Senior Scholars.',
  },
  // 30. Saudi Arabia
  {
    id: 'juhany',
    name: 'Abdullah Al-Juhany',
    arabicName: 'عبد الله بن عواد الجهني',
    country: 'Saudi Arabia',
    style: 'Murattal (Haramain)',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/abdullaah_3awwaad_al-juhaynee',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Imam of Masjid al-Haram who previously led prayers in Quba, Qiblatain, and the Prophet\'s Mosque.',
  },
  // 31. Saudi Arabia
  {
    id: 'abkar',
    name: 'Idris Abkar',
    arabicName: 'إدريس بن محمد أبكر',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/idrees_abkar',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Imam of the Sheikh Zayed Grand Mosque in Abu Dhabi, loved for his moving prayers.',
  },
  // 32. Saudi Arabia
  {
    id: 'qahtani',
    name: 'Khaled Al-Qahtani',
    arabicName: 'خالد بن فهد القحطاني',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/khaalid_al-qahtaanee',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Khaled_Al_Qahtani.jpg/300px-Khaled_Al_Qahtani.jpg',
    bio: 'Prominent Saudi reciter and Imam of Abd ar-Razzaq Qanbar Mosque in Dammam.',
  },
  // 33. United Arab Emirates
  {
    id: 'bukhatir',
    name: 'Salah Bukhatir',
    arabicName: 'صلاح بن عبد الرحمن بوخاطر',
    country: 'United Arab Emirates',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/salah_bukhatir',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Salah_Bukhatir.jpg/300px-Salah_Bukhatir.jpg',
    bio: 'Esteemed Emirati reciter known for a calm cadence reminiscent of Sheikh Sudais.',
  },
  // 34. Sudan
  {
    id: 'alzain',
    name: 'Al-Zain Mohammad Ahmad',
    arabicName: 'الزين محمد أحمد',
    country: 'Sudan',
    style: 'Murattal (Sudanese Tone)',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/alzain_mohammad_ahmad',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Iconic Sudanese Qari who leads prayers at the Lady Sanhouri Mosque in Khartoum.',
  },
  // 35. Sudan
  {
    id: 'nourin',
    name: 'Nourin Mohamed Siddiq',
    arabicName: 'نورين محمد صديق رحمه الله',
    country: 'Sudan',
    style: 'Murattal (Traditional Sudanese Qira\'at)',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/noreen-mohammad-siddiq/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/ar/8/88/%D9%86%D9%88%D8%B1%D9%8A%D9%86_%D8%B5%D8%AF%D9%8A%D9%82.jpg',
    bio: 'Celebrated Sudanese master reciter known for reciting according to Al-Duri \'an Abi \'Amr.',
  },
  // 36. Yemen
  {
    id: 'yamani',
    name: 'Wadih Al-Yamani',
    arabicName: 'وديع حمادي اليمني',
    country: 'Yemen',
    style: 'Murattal',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/wadee-yamani/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Wadih_Al_Yamani.jpg/300px-Wadih_Al_Yamani.jpg',
    bio: 'Popular Yemeni reciter with an exceptionally soothing voice and high clarity.',
  },
  // 37. Egypt
  {
    id: 'hasan_saleh',
    name: 'Hasan Saleh',
    arabicName: 'حسن محمد صالح',
    country: 'Egypt',
    style: 'Murattal',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/hassan-saleh/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Hassan_Saleh-IMG_3966.jpg',
    bio: 'Egyptian reciter praised for his soft tone and delicate execution of Quranic verses.',
  },
  // 38. Morocco
  {
    id: 'qazabri',
    name: 'Omar Al-Qazabri',
    arabicName: 'عمر القزابري',
    country: 'Morocco',
    style: 'Warsh \'an Nafi\'',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/omar_al_qazabri',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Omar_Al_Qazabri.jpg/300px-Omar_Al_Qazabri.jpg',
    bio: 'Chief Imam of the Hassan II Mosque in Casablanca, renowned Moroccan master of Warsh.',
  },
  // 39. Morocco
  {
    id: 'koushi',
    name: 'Al-Oyoun Al-Koushi',
    arabicName: 'العيون الكوشي',
    country: 'Morocco',
    style: 'Warsh \'an Nafi\'',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/kushi',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Famous Moroccan Qari who has led Taraweeh prayers in Casablanca for over 30 years.',
  },
  // 40. Saudi Arabia
  {
    id: 'hawashi',
    name: 'Ahmad Al-Hawashi',
    arabicName: 'أحمد بن محمد الحواشي رحمه الله',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/ahmad_al-hawashy',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Alhawashi.jpg',
    bio: 'Former Imam of the Grand Mosque of Khamis Mushait, famous for his long night prayers.',
  },
  // 41. Kuwait
  {
    id: 'barrak',
    name: 'Mohammad Al-Barrak',
    arabicName: 'محمد بن جاسم البراك',
    country: 'Kuwait',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/muhammad_al-barrak',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mohammad_Al-Barrak.jpg/300px-Mohammad_Al-Barrak.jpg',
    bio: 'Kuwaiti reciter with a clear and melodious voice, popular since his early youth.',
  },
  // 42. Saudi Arabia
  {
    id: 'luhaidan',
    name: 'Mohammad Al-Luhaidan',
    arabicName: 'محمد بن إبراهيم اللحيدان',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/muhammad_al-luhaidan',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Muhammad_Al-Luhaidan.jpg/300px-Muhammad_Al-Luhaidan.jpg',
    bio: 'Judge and Imam of Sheikh Nasser Al-Nasser Mosque in Riyadh with a commanding presence.',
  },
  // 43. Saudi Arabia
  {
    id: 'adel_rayan',
    name: 'Adel Rayan',
    arabicName: 'عادل ريان',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/adel_rayan',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D8%B9%D8%A7%D8%AF%D9%84_%D8%B1%D9%8A%D8%A7%D9%86_2013-11-02_16-56.jpg',
    bio: 'Imam of Umm Al-Khair Mosque in Jeddah, appreciated for gentle and reverent recitations.',
  },
  // 44. Egypt
  {
    id: 'hatem_waer',
    name: 'Hatem Fareed Al-Waer',
    arabicName: 'حاتم فريد الواعر',
    country: 'Egypt',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/hatem_fareed',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Hatem_Fareed.jpg/300px-Hatem_Fareed.jpg',
    bio: 'Prominent Alexandrian reciter who served as Imam of Al-Qaid Ibrahim Mosque in Alexandria.',
  },
  // 45. Saudi Arabia
  {
    id: 'qasim',
    name: 'Abdul Muhsin Al-Qasim',
    arabicName: 'عبد المحسن بن محمد القاسم',
    country: 'Saudi Arabia',
    style: 'Murattal (Prophetic Mosque)',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/abdul_muhsin_alqasim',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Abdul_Mohsin_Al-Qasim.jpg',
    bio: 'Senior Imam and Khateeb of the Prophet\'s Mosque in Medina and judge in the Appeal Court.',
  },
  // 46. Saudi Arabia
  {
    id: 'khalid_ghamdi',
    name: 'Khalid Al-Ghamdi',
    arabicName: 'خالد بن علي الغامدي',
    country: 'Saudi Arabia',
    style: 'Murattal',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/khalid-ghamdi/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Khalid_Al_Ghamdi.jpg/300px-Khalid_Al_Ghamdi.jpg',
    bio: 'Former Imam of Masjid al-Haram in Mecca and Professor of Quranic Tafsir at Umm Al-Qura.',
  },
  // 47. Egypt
  {
    id: 'naina',
    name: 'Dr. Ahmad Naina',
    arabicName: 'د. أحمد نعينع',
    country: 'Egypt',
    style: 'Mujawwad',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/ahmad-naina/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    bio: 'Egyptian medical doctor and official reciter at Egyptian state and international Islamic events.',
  },
  // 48. Syria
  {
    id: 'kanakeri',
    name: 'Abdul Hadi Kanakeri',
    arabicName: 'عبد الهادي أحمد كناكري',
    country: 'Syria',
    style: 'Murattal',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/kanakeri',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Abdul_Hadi_Kanakeri.jpg/300px-Abdul_Hadi_Kanakeri.jpg',
    bio: 'Distinguished Syrian Qari known for his crystal-clear vocal articulation and Tajweed.',
  },
  // 49. Libya
  {
    id: 'daawob',
    name: 'Tareq Abdulghani Daawob',
    arabicName: 'طارق عبد الغني دعوب',
    country: 'Libya',
    style: 'Qalun \'an Nafi\'',
    surahBaseUrl: 'https://download.quranicaudio.com/quran/tareq_abdulgani_daawob',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tareq_Daawob.jpg/300px-Tareq_Daawob.jpg',
    bio: 'Prominent Libyan reciter specializing in the recitation of Imam Qalun from Nafi\'.',
  },
  // 50. Kuwait
  {
    id: 'mazroyee',
    name: 'Yasser Al-Mazroyee',
    arabicName: 'ياسر بن أحمد المزروعي',
    country: 'Kuwait',
    style: 'Murattal',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/yasser-mazrouei/r1',
    hasVerseAudio: false,
    surahTotal: 114,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/%D9%8A%D8%A7%D8%B3%D8%B1_%D8%A7%D9%84%D9%85%D8%B2%D8%B1%D9%88%D8%B9%D9%8A.jpg/300px-%D9%8A%D8%A7%D8%B3%D8%B1_%D8%A7%D9%84%D9%85%D8%B2%D8%B1%D9%88%D8%B9%D9%8A.jpg',
    bio: 'Kuwaiti reciter, Secretary General of the Kuwait Awqaf Public Foundation.',
  },
];

/**
 * Helper to get all 50 reciters
 */
export function getAllQaris(): QariReciter[] {
  return ALL_50_QARIS;
}

// Initialize portrait URLs from reciterAvatars catalog
ALL_50_QARIS.forEach((q) => {
  if (!q.portraitUrl && RECITER_AVATARS[q.id]) {
    q.portraitUrl = RECITER_AVATARS[q.id];
  }
});

/**
 * Find a reciter by id
 */
export function getQariById(id: string): QariReciter | undefined {
  return ALL_50_QARIS.find((q) => q.id === id);
}

/**
 * Filter reciters by country
 */
export function getQarisByCountry(country: string): QariReciter[] {
  if (!country || country === 'All') return ALL_50_QARIS;
  return ALL_50_QARIS.filter((q) => q.country.toLowerCase() === country.toLowerCase());
}

/**
 * Search reciters by name (English or Arabic) or country
 */
export function searchQaris(query: string, countryFilter?: string): QariReciter[] {
  const clean = query.trim().toLowerCase();
  let list = ALL_50_QARIS;

  if (countryFilter && countryFilter !== 'All') {
    list = list.filter((q) => q.country.toLowerCase() === countryFilter.toLowerCase());
  }

  if (!clean) return list;

  return list.filter((q) =>
    q.name.toLowerCase().includes(clean) ||
    q.arabicName.includes(query.trim()) ||
    q.country.toLowerCase().includes(clean) ||
    q.style.toLowerCase().includes(clean)
  );
}

/**
 * Get distinct list of countries represented in the 50 reciter catalog
 */
export function getAvailableCountries(): string[] {
  const set = new Set<string>();
  ALL_50_QARIS.forEach((q) => set.add(q.country));
  return ['All', ...Array.from(set).sort()];
}
