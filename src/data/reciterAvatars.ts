/**
 * Official Reciter Portrait Images & Avatar Mappings
 * Maps all 50 verified Qurra to their local portrait photographs or stylized Islamic avatars.
 * Also provides high-res remote CDN fallbacks and utility helpers.
 */

export const RECITER_AVATARS: Record<string, string> = {
  abdulbasit: '/images/reciters/abdulbasit.jpeg',
  'abdulrasheed-sufi': '/images/reciters/abdulrasheed-sufi.png',
  abkar: '/images/reciters/abkar.svg',
  adel_rayan: '/images/reciters/adel_rayan.svg',
  ajmi: '/images/reciters/ajmi.png',
  akhdar: '/images/reciters/akhdar.svg',
  alafasy: '/images/reciters/alafasy.jpeg',
  ali_jaber: '/images/reciters/ali_jaber.png',
  alzain: '/images/reciters/alzain.png',
  ayman_suwaid: '/images/reciters/ayman_suwaid.jpg',
  ayyub: '/images/reciters/ayyub.svg',
  baleela: '/images/reciters/baleela.png',
  banna: '/images/reciters/banna.svg',
  barrak: '/images/reciters/barrak.svg',
  basfar: '/images/reciters/basfar.svg',
  budair: '/images/reciters/budair.jpg',
  bukhatir: '/images/reciters/bukhatir.svg',
  daawob: '/images/reciters/daawob.svg',
  fares_abbad: '/images/reciters/fares_abbad.svg',
  ghamdi: '/images/reciters/ghamdi.png',
  hanif: '/images/reciters/hanif.svg',
  hasan_saleh: '/images/reciters/hasan_saleh.svg',
  hatem_waer: '/images/reciters/hatem_waer.svg',
  hawashi: '/images/reciters/hawashi.svg',
  hudhaifi: '/images/reciters/hudhaifi.jpg',
  husary: '/images/reciters/husary.png',
  jibreel: '/images/reciters/jibreel.png',
  juhany: '/images/reciters/juhany.png',
  kanakeri: '/images/reciters/kanakeri.svg',
  khalid_ghamdi: '/images/reciters/khalid_ghamdi.svg',
  koushi: '/images/reciters/koushi.jpeg',
  luhaidan: '/images/reciters/luhaidan.svg',
  maher: '/images/reciters/maher.png',
  mazroyee: '/images/reciters/mazroyee.svg',
  minshawi: '/images/reciters/minshawi.jpeg',
  mustafa_ismail: '/images/reciters/mustafa_ismail.jpg',
  naina: '/images/reciters/naina.jpg',
  nourin: '/images/reciters/nourin.svg',
  qahtani: '/images/reciters/qahtani.svg',
  qasim: '/images/reciters/qasim.svg',
  qatami: '/images/reciters/qatami.jpg',
  qazabri: '/images/reciters/qazabri.svg',
  rifai: '/images/reciters/rifai.jpeg',
  shatri: '/images/reciters/shatri.jpeg',
  shuraim: '/images/reciters/shuraim.jpeg',
  sudais: '/images/reciters/sudais.jpeg',
  tablawi: '/images/reciters/tablawi.svg',
  tunaiji: '/images/reciters/tunaiji.jpeg',
  yamani: '/images/reciters/yamani.svg',
  yasser_dosari: '/images/reciters/yasser_dosari.png',
};

export const RECITER_REMOTE_FALLBACKS: Record<string, string> = {
  'abdulrasheed-sufi': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Abdul-Rachid_Soufi.png',
  alafasy: 'https://static.qurancdn.com/images/reciters/6/mishary-rashid-alafasy-profile.jpeg',
  husary: 'https://static.qurancdn.com/images/reciters/5/mahmoud-khalil-al-hussary-profile.png',
  abdulbasit: 'https://static.qurancdn.com/images/reciters/1/abdelbasset-profile.jpeg',
  minshawi: 'https://static.qurancdn.com/images/reciters/7/mohamed-siddiq-el-minshawi-profile.jpeg',
  maher: 'https://static.qurancdn.com/images/reciters/25/Maher-al-Muaiqly-profile.png',
  ghamdi: 'https://static.qurancdn.com/images/reciters/16/saad-al-ghamdi-profile.png',
  shatri: 'https://static.qurancdn.com/images/reciters/3/abu-bakr-al-shatri-pofile.jpeg',
  shuraim: 'https://static.qurancdn.com/images/reciters/8/saoud-shuraim-profile.jpeg',
  sudais: 'https://static.qurancdn.com/images/reciters/2/abdul-rahman-al-sudais-profile.jpeg',
  yasser_dosari: 'https://static.qurancdn.com/images/reciters/20/yasser-profile.png',
  qatami: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg/250px-%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg',
  ali_jaber: 'https://static.qurancdn.com/images/reciters/23/Abdullah-Ali-Jabir-profile.png',
  rifai: 'https://static.qurancdn.com/images/reciters/4/hani-ar-rifai-profile.jpeg',
  hudhaifi: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Huthaify.jpg',
  budair: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Salah_Ibn_Mohammed_Al_Budair.jpg/250px-Salah_Ibn_Mohammed_Al_Budair.jpg',
  tunaiji: 'https://static.qurancdn.com/images/reciters/11/khalifa-al-tunaiji-profile.jpeg',
  jibreel: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Qari_Muhammad_Jebril%2C_Ramadan_2019.png/250px-Qari_Muhammad_Jebril%2C_Ramadan_2019.png',
  ayman_suwaid: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Aymen_souaid.jpg/250px-Aymen_souaid.jpg',
  ajmi: 'https://static.qurancdn.com/images/reciters/22/Ahmed-ibn-Ali-al-Ajmy-profile.png',
  mustafa_ismail: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Mustafa_Ismail_%281%29.jpg/250px-Mustafa_Ismail_%281%29.jpg',
  baleela: 'https://static.qurancdn.com/images/reciters/24/Bandar-Baleela-profile.png',
  juhany: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Abdullah_Al_Juhany_%28Cropped%29.png/250px-Abdullah_Al_Juhany_%28Cropped%29.png',
  koushi: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/%D8%B5%D9%88%D8%B1%D8%A9_%D9%84%D9%84%D9%82%D8%A7%D8%B1%D8%A6_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D8%A7%D9%84%D8%B9%D9%8A%D9%88%D9%86_%D8%A7%D9%84%D9%83%D9%88%D8%B4%D9%8A.jpeg/250px-%D8%B5%D9%88%D8%B1%D8%A9_%D9%84%D9%84%D9%82%D8%A7%D8%B1%D8%A6_%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D8%A7%D9%84%D8%B9%D9%8A%D9%88%D9%86_%D8%A7%D9%84%D9%83%D9%88%D8%B4%D9%8A.jpeg',
  naina: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/DrAhmedNeinaa.jpg/250px-DrAhmedNeinaa.jpg',
  alzain: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/%D8%A7%D9%84%D8%B2%D9%8A%D9%86_%D9%85%D8%AD%D9%85%D8%AF_%D8%A3%D8%AD%D9%85%D8%AF.png/250px-%D8%A7%D9%84%D8%B2%D9%8A%D9%86_%D9%85%D8%AD%D9%85%D8%AF_%D8%A3%D8%AD%D9%85%D8%AF.png',
  mazroyee: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/%D9%8A%D8%A7%D8%B3%D8%B1_%D8%A7%D9%84%D9%85%D8%B2%D8%B1%D9%88%D8%B9%D9%8A.jpg/300px-%D9%8A%D8%A7%D8%B3%D8%B1_%D8%A7%D9%84%D9%85%D8%B2%D8%B1%D9%88%D8%B9%D9%8A.jpg',
  daawob: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tareq_Daawob.jpg/300px-Tareq_Daawob.jpg',
  kanakeri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Abdul_Hadi_Kanakeri.jpg/300px-Abdul_Hadi_Kanakeri.jpg',
  khalid_ghamdi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Khalid_Al_Ghamdi.jpg/300px-Khalid_Al_Ghamdi.jpg',
  qasim: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Abdul_Mohsin_Al-Qasim.jpg',
  hatem_waer: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Hatem_Fareed.jpg/300px-Hatem_Fareed.jpg',
  adel_rayan: 'https://upload.wikimedia.org/wikipedia/commons/4/40/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE_%D8%B9%D8%A7%D8%AF%D9%84_%D8%B1%D9%8A%D8%A7%D9%86_2013-11-02_16-56.jpg',
  luhaidan: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Muhammad_Al-Luhaidan.jpg/300px-Muhammad_Al-Luhaidan.jpg',
  barrak: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mohammad_Al-Barrak.jpg/300px-Mohammad_Al-Barrak.jpg',
  hawashi: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Alhawashi.jpg',
  qazabri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Omar_Al_Qazabri.jpg/300px-Omar_Al_Qazabri.jpg',
  hasan_saleh: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Hassan_Saleh-IMG_3966.jpg',
  yamani: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Wadih_Al_Yamani.jpg/300px-Wadih_Al_Yamani.jpg',
  nourin: 'https://upload.wikimedia.org/wikipedia/ar/8/88/%D9%86%D9%88%D8%B1%D9%8A%D9%86_%D8%B5%D8%AF%D9%8A%D9%82.jpg',
  bukhatir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Salah_Bukhatir.jpg/300px-Salah_Bukhatir.jpg',
  ayyub: 'https://upload.wikimedia.org/wikipedia/ar/6/6f/Muhammad_ayop.jpeg',
  basfar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Abdullah_Basfar.jpg/300px-Abdullah_Basfar.jpg',
  qahtani: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Khaled_Al_Qahtani.jpg/300px-Khaled_Al_Qahtani.jpg',
};

/**
 * Returns the resolved primary portrait URL for a reciter.
 */
export function getReciterAvatarUrl(reciterId: string, customUrl?: string): string {
  if (customUrl) return customUrl;
  return RECITER_REMOTE_FALLBACKS[reciterId] || RECITER_AVATARS[reciterId] || '';
}

/**
 * Extracts 1-2 clean uppercase initials from a reciter's name.
 */
export function getReciterInitials(name: string): string {
  if (!name) return 'Q';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  // Skip titles like 'Sheikh', 'Dr.', 'Imam' for initials when available
  const cleanParts = parts.filter(
    (p) => !['sheikh', 'dr.', 'dr', 'al-sheikh', 'imam', 'qari'].includes(p.toLowerCase())
  );
  if (cleanParts.length >= 2) {
    return (cleanParts[0].charAt(0) + cleanParts[1].charAt(0)).toUpperCase();
  }
  return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
}
