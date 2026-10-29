// ==============================================================================
// EMUFTI AI — Islamic Calendar, Prayer Times & Qibla Direction Engine
// ==============================================================================

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: {
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    time: string;
    remainingMinutes: number;
    formattedCountdown: string;
  };
}

export interface IslamicCity {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const ISLAMIC_CITIES: IslamicCity[] = [
  { id: 'mogadishu', name: 'Mogadishu (Muqdisho)', country: 'Somalia', latitude: 2.0469, longitude: 45.3182, timezone: 'Africa/Mogadishu' },
  { id: 'hargeisa', name: 'Hargeisa (Hargeysa)', country: 'Somalia', latitude: 9.5624, longitude: 44.0770, timezone: 'Africa/Mogadishu' },
  { id: 'garowe', name: 'Garowe (Garoowe)', country: 'Somalia', latitude: 8.4054, longitude: 48.4845, timezone: 'Africa/Mogadishu' },
  { id: 'kismayo', name: 'Kismayo (Kismaayo)', country: 'Somalia', latitude: -0.3582, longitude: 42.5454, timezone: 'Africa/Mogadishu' },
  { id: 'djibouti', name: 'Djibouti City', country: 'Djibouti', latitude: 11.5721, longitude: 43.1456, timezone: 'Africa/Djibouti' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'makkah', name: 'Makkah Al-Mukarramah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { id: 'medina', name: 'Al-Madinah Al-Munawwarah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { id: 'london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'minneapolis', name: 'Minneapolis', country: 'United States', latitude: 44.9778, longitude: -93.2650, timezone: 'America/Chicago' },
  { id: 'columbus', name: 'Columbus', country: 'United States', latitude: 39.9612, longitude: -82.9988, timezone: 'America/New_York' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
];

// Calculation of Qibla direction towards the Kaaba (21.4225° N, 39.8262° E)
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const makkahLat = (21.4225 * Math.PI) / 180;
  const makkahLon = (39.8262 * Math.PI) / 180;
  const userLat = (latitude * Math.PI) / 180;
  const userLon = (longitude * Math.PI) / 180;

  const deltaLon = makkahLon - userLon;

  const y = Math.sin(deltaLon);
  const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(deltaLon);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  return Math.round((qiblaDeg + 360) % 360);
}

// Convert hours to 12-hour AM/PM string
function formatTime(hours: number): string {
  const normalized = (hours + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${ampm}`;
}

function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + m;
}

// Astronomical calculation of prayer times
export function calculatePrayerTimes(city: IslamicCity, date: Date = new Date()): PrayerTimeData {
  const lat = city.latitude;
  const lng = city.longitude;

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Approximate solar declination & equation of time
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // Equation of time in minutes
  const declination = 23.45 * Math.sin(((dayOfYear - 81) * 2 * Math.PI) / 365) * (Math.PI / 180);

  // Timezone standard meridian
  const tzOffset = -date.getTimezoneOffset() / 60;
  const standardMeridian = tzOffset * 15;

  // Solar noon
  const solarNoon = 12 + (standardMeridian - lng) / 15 - eot / 60;

  // Hour angle helper
  const hourAngle = (angleDeg: number) => {
    const latRad = (lat * Math.PI) / 180;
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
    if (cosHA < -1) return Math.PI;
    if (cosHA > 1) return 0;
    return Math.acos(cosHA);
  };

  // Asr shadow ratio (1 for Shafi'i / Hanbali / Maliki / standard)
  const asrAngle = () => {
    const latRad = (lat * Math.PI) / 180;
    const delta = Math.abs(latRad - declination);
    const shadowRatio = 1 + Math.tan(delta);
    const altRad = Math.atan(1 / shadowRatio);
    return hourAngle((altRad * 180) / Math.PI);
  };

  const fajrHA = hourAngle(-18) * (180 / Math.PI) / 15;
  const sunriseHA = hourAngle(-0.833) * (180 / Math.PI) / 15;
  const asrHA = asrAngle() * (180 / Math.PI) / 15;
  const sunsetHA = sunriseHA;
  const ishaHA = hourAngle(-17.5) * (180 / Math.PI) / 15;

  const fajr = formatTime(solarNoon - fajrHA);
  const sunrise = formatTime(solarNoon - sunriseHA);
  const dhuhr = formatTime(solarNoon + 0.05); // slight delay after zenith
  const asr = formatTime(solarNoon + asrHA);
  const maghrib = formatTime(solarNoon + sunsetHA + 0.03); // slight delay for sunset
  const isha = formatTime(solarNoon + ishaHA);

  // Determine next prayer and countdown
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const prayers = [
    { name: 'Fajr' as const, time: fajr, mins: timeToMinutes(fajr) },
    { name: 'Sunrise' as const, time: sunrise, mins: timeToMinutes(sunrise) },
    { name: 'Dhuhr' as const, time: dhuhr, mins: timeToMinutes(dhuhr) },
    { name: 'Asr' as const, time: asr, mins: timeToMinutes(asr) },
    { name: 'Maghrib' as const, time: maghrib, mins: timeToMinutes(maghrib) },
    { name: 'Isha' as const, time: isha, mins: timeToMinutes(isha) },
  ];

  let next = prayers.find((p) => p.mins > nowMinutes);
  let remainingMinutes = 0;

  if (next) {
    remainingMinutes = next.mins - nowMinutes;
  } else {
    // Next prayer is tomorrow's Fajr
    next = prayers[0];
    remainingMinutes = 24 * 60 - nowMinutes + next.mins;
  }

  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minsLeft = remainingMinutes % 60;
  const formattedCountdown = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha,
    nextPrayer: {
      name: next.name,
      time: next.time,
      remainingMinutes,
      formattedCountdown,
    },
  };
}

// Accurate Hijri Islamic Date calculation with Umm al-Qura Intl fallback
export function getDetailedIslamicDate(date: Date = new Date()): {
  hijriDay: number;
  hijriMonthName: string;
  hijriMonthArabic: string;
  hijriYear: number;
  fullHijriString: string;
  gregorianString: string;
  islamicEvent?: string;
} {
  const gregorianString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const HIJRI_MONTHS_EN = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
  ];

  const HIJRI_MONTHS_AR = [
    'محرّم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة',
  ];

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const day = Number(parts.find((p) => p.type === 'day')?.value || '1');
    const monthIndex = Number(parts.find((p) => p.type === 'month')?.value || '1') - 1;
    const yearStr = parts.find((p) => p.type === 'year')?.value || '1447';
    const year = parseInt(yearStr.replace(/\D/g, ''), 10) || 1447;

    const monthName = HIJRI_MONTHS_EN[monthIndex] || 'Shawwal';
    const monthArabic = HIJRI_MONTHS_AR[monthIndex] || 'شوّال';

    let islamicEvent: string | undefined;
    if (monthIndex === 8) islamicEvent = 'Mubarak Ramadan (Bisha Barakeysan ee Ramadaan)';
    else if (monthIndex === 9 && day === 1) islamicEvent = 'Eid al-Fitr (Ciidul Fidriga)';
    else if (monthIndex === 11 && day === 10) islamicEvent = 'Eid al-Adha (Ciidul Adxada)';
    else if (monthIndex === 11 && day === 9) islamicEvent = 'Day of Arafah (Maalinta Carafo)';
    else if (monthIndex === 6 && day === 27) islamicEvent = 'Isra and Miraj (Israaga & Mi\'raajka)';
    else if (day >= 13 && day <= 15) islamicEvent = 'Ayyam al-Beed (Maalmaha Cad-cad)';

    return {
      hijriDay: day,
      hijriMonthName: monthName,
      hijriMonthArabic: monthArabic,
      hijriYear: year,
      fullHijriString: `${day} ${monthName} ${year} AH`,
      gregorianString,
      islamicEvent,
    };
  } catch {
    return {
      hijriDay: 15,
      hijriMonthName: 'Shawwal',
      hijriMonthArabic: 'شوّال',
      hijriYear: 1447,
      fullHijriString: '15 Shawwal 1447 AH',
      gregorianString,
      islamicEvent: undefined,
    };
  }
}
