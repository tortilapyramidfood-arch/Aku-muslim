import { CityLocation, NextPrayerInfo, PrayerTimes } from '../types';

/**
 * 20 Standard Indonesian Cities with precise coordinates, elevations, and official timezones
 * Sources: Badan Informasi Geospasial (BIG) & SIHAT Bimas Islam Kementerian Agama RI
 */
export const INDONESIA_CITIES: CityLocation[] = [
  { id: 'jkt', name: 'DKI Jakarta', province: 'DKI Jakarta', latitude: -6.2088, longitude: 106.8456, timezone: 'WIB', utcOffset: 7, elevationMeters: 8 },
  { id: 'bdg', name: 'Bandung', province: 'Jawa Barat', latitude: -6.9175, longitude: 107.6191, timezone: 'WIB', utcOffset: 7, elevationMeters: 768 },
  { id: 'smg', name: 'Semarang', province: 'Jawa Tengah', latitude: -6.9667, longitude: 110.4167, timezone: 'WIB', utcOffset: 7, elevationMeters: 4 },
  { id: 'sby', name: 'Surabaya', province: 'Jawa Timur', latitude: -7.2575, longitude: 112.7521, timezone: 'WIB', utcOffset: 7, elevationMeters: 5 },
  { id: 'sda', name: 'Sidoarjo', province: 'Jawa Timur', latitude: -7.4478, longitude: 112.7183, timezone: 'WIB', utcOffset: 7, elevationMeters: 4 },
  { id: 'ygy', name: 'Yogyakarta', province: 'DI Yogyakarta', latitude: -7.7956, longitude: 110.3695, timezone: 'WIB', utcOffset: 7, elevationMeters: 113 },
  { id: 'mdn', name: 'Medan', province: 'Sumatera Utara', latitude: 3.5952, longitude: 98.6722, timezone: 'WIB', utcOffset: 7, elevationMeters: 26 },
  { id: 'pdg', name: 'Padang', province: 'Sumatera Barat', latitude: -0.9471, longitude: 100.4172, timezone: 'WIB', utcOffset: 7, elevationMeters: 10 },
  { id: 'ptk', name: 'Pontianak', province: 'Kalimantan Barat', latitude: -0.0263, longitude: 109.3425, timezone: 'WIB', utcOffset: 7, elevationMeters: 1 },
  { id: 'bjm', name: 'Banjarmasin', province: 'Kalimantan Selatan', latitude: -3.3194, longitude: 114.5908, timezone: 'WITA', utcOffset: 8, elevationMeters: 2 },
  { id: 'dps', name: 'Denpasar', province: 'Bali', latitude: -8.6705, longitude: 115.2126, timezone: 'WITA', utcOffset: 8, elevationMeters: 4 },
  { id: 'mtr', name: 'Mataram', province: 'Nusa Tenggara Barat', latitude: -8.5833, longitude: 116.1167, timezone: 'WITA', utcOffset: 8, elevationMeters: 16 },
  { id: 'mks', name: 'Makassar', province: 'Sulawesi Selatan', latitude: -5.1477, longitude: 119.4327, timezone: 'WITA', utcOffset: 8, elevationMeters: 5 },
  { id: 'mnd', name: 'Manado', province: 'Sulawesi Utara', latitude: 1.4748, longitude: 124.8421, timezone: 'WITA', utcOffset: 8, elevationMeters: 10 },
  { id: 'pal', name: 'Palu', province: 'Sulawesi Tengah', latitude: -0.9003, longitude: 119.8780, timezone: 'WITA', utcOffset: 8, elevationMeters: 15 },
  { id: 'amb', name: 'Ambon', province: 'Maluku', latitude: -3.6554, longitude: 128.1908, timezone: 'WIT', utcOffset: 9, elevationMeters: 12 },
  { id: 'jyp', name: 'Jayapura', province: 'Papua', latitude: -2.5916, longitude: 140.6690, timezone: 'WIT', utcOffset: 9, elevationMeters: 287 },
  { id: 'srg', name: 'Sorong', province: 'Papua Barat Daya', latitude: -0.8762, longitude: 131.2558, timezone: 'WIT', utcOffset: 9, elevationMeters: 7 },
  { id: 'kpg', name: 'Kupang', province: 'Nusa Tenggara Timur', latitude: -10.1772, longitude: 123.6070, timezone: 'WITA', utcOffset: 8, elevationMeters: 62 },
  { id: 'mrk', name: 'Merauke', province: 'Papua Selatan', latitude: -8.4991, longitude: 140.4010, timezone: 'WIT', utcOffset: 9, elevationMeters: 5 },
];

export const DEFAULT_CITY = INDONESIA_CITIES[0]; // Jakarta
export const PRAYER_CITIES: CityLocation[] = INDONESIA_CITIES.map((c) => ({
  ...c,
  lat: c.latitude,
  lng: c.longitude,
}));

const degToRad = (deg: number) => (deg * Math.PI) / 180.0;
const radToDeg = (rad: number) => (rad * 180.0) / Math.PI;

export interface PrayerMethodDocumentation {
  authority: string;
  subuhAngle: string;
  isyaAngle: string;
  asrMadhhab: string;
  ihtiyatMinutes: number;
  ihtiyatRationale: string;
  elevationCorrectionFormula: string;
  roundingMethod: string;
}

export const PRAYER_METHOD_DOCUMENTATION: PrayerMethodDocumentation = {
  authority: 'Direktorat Jenderal Bimbingan Masyarakat Islam (Bimas Islam) Kementerian Agama Republik Indonesia',
  subuhAngle: '-20.0° (Solar depression angle saat fajar shadiq)',
  isyaAngle: '-18.0° (Solar depression angle saat syafaq ahmar lenyap)',
  asrMadhhab: 'Syafi\'i / Jumhur (Panjang bayangan = panjang benda + bayangan saat zawal, faktor bayangan 1)',
  ihtiyatMinutes: 2,
  ihtiyatRationale: 'Ihtiyat 2 menit ditetapkan melalui Musyawarah Tim Hisab Rukyat Kemenag RI sebagai faktor pengaman masuknya waktu sholat di seluruh batas wilayah administratif kota/kabupaten serta mengompensasi variasi ketinggian tempat lokal.',
  elevationCorrectionFormula: 'Dip of horizon: d = 0.0347 * sqrt(h) derajat, memperhitungkan elevasi tempat dari permukaan laut untuk terbit dan terbenam.',
  roundingMethod: 'Pembulatan desimal detik ke menit terdekat dengan ambang toleransi pengaman (Kemenag standard)',
};

/**
 * Astronomical calculation engine according to Kemenag RI (Bimas Islam):
 * - Subuh: -20° solar depression angle + 2 min ihtiyat
 * - Imsak: Subuh minus 10 minutes
 * - Terbit: -0.833° - dip(h) (Sun top limb visible)
 * - Dzuhur: Meridian transit (zawal) + 2 min ihtiyat
 * - Ashar: Shafi'i madhhab (shadow factor = 1) + 2 min ihtiyat
 * - Maghrib: Sun depression -0.833° - dip(h) + 2 min ihtiyat
 * - Isya: -18° solar depression angle + 2 min ihtiyat
 */
export function calculatePrayerTimes(
  dateOrLat: Date | number = new Date(),
  cityOrLng: CityLocation | number = DEFAULT_CITY,
  optionalDate?: Date
): PrayerTimes {
  let date: Date;
  let city: CityLocation;

  if (typeof dateOrLat === 'number') {
    date = optionalDate instanceof Date ? optionalDate : new Date();
    city = {
      id: 'custom_loc',
      name: 'Lokasi Pengguna',
      province: 'Indonesia',
      latitude: dateOrLat,
      longitude: typeof cityOrLng === 'number' ? cityOrLng : 106.8456,
      timezone: 'WIB',
      utcOffset: 7,
      elevationMeters: 10,
    };
  } else {
    date = dateOrLat instanceof Date ? dateOrLat : new Date();
    city = (typeof cityOrLng === 'object' && cityOrLng !== null) ? (cityOrLng as CityLocation) : DEFAULT_CITY;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day Number
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Days since J2000.0
  const d = jdn - 2451545.0 + (12.0 - city.utcOffset) / 24.0;

  // Mean anomaly of the Sun
  const g = (357.529 + 0.98560028 * d) % 360;
  const gRad = degToRad(g);

  // Mean longitude of the Sun
  const q = (280.459 + 0.98564736 * d) % 360;

  // Ecliptic longitude of the Sun
  const L = (q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad)) % 360;
  const LRad = degToRad(L);

  // Obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;
  const eRad = degToRad(e);

  // Sun's Declination (delta)
  const sinDelta = Math.sin(eRad) * Math.sin(LRad);
  const delta = Math.asin(sinDelta); // radians

  // Right Ascension (alpha)
  let alpha = radToDeg(Math.atan2(Math.cos(eRad) * Math.sin(LRad), Math.cos(LRad))) / 15.0;
  if (alpha < 0) alpha += 24.0;

  // Equation of Time (EoT in hours)
  const eot = q / 15.0 - alpha;

  // Solar noon (Dzuhur without ihtiyat) in local standard time
  const noon = 12.0 + city.utcOffset - city.longitude / 15.0 - eot;

  const latRad = degToRad(city.latitude);

  // Elevation dip of horizon in degrees
  const elevation = city.elevationMeters || 0;
  const dipDeg = 0.0347 * Math.sqrt(Math.max(0, elevation));

  // Helper function to calculate hour angle for a given solar altitude angle (alphaDeg)
  const calcHourAngle = (alphaDeg: number): number | null => {
    const alphaRad = degToRad(alphaDeg);
    const cosHA = (Math.sin(alphaRad) - Math.sin(latRad) * Math.sin(delta)) / (Math.cos(latRad) * Math.cos(delta));
    if (cosHA < -1.0 || cosHA > 1.0) return null; // Sun never reaches angle
    return radToDeg(Math.acos(cosHA)) / 15.0; // hours
  };

  // 1. Subuh: angle = -20° + 2 min ihtiyat
  const haSubuh = calcHourAngle(-20.0) ?? 6.0;
  const subuhHours = noon - haSubuh + 2 / 60;

  // 2. Terbit (Sunrise): angle = -0.833° - dip
  const haSunrise = calcHourAngle(-0.833 - dipDeg) ?? 6.0;
  const sunriseHours = noon - haSunrise;

  // 3. Dzuhur: solar noon + 2 min ihtiyat
  const dzuhurHours = noon + 2 / 60;

  // 4. Ashar: Shafi'i shadow factor = 1 -> arccot(1 + tan|lat - delta|) + 2 min ihtiyat
  const phiMinusDelta = Math.abs(latRad - delta);
  const asharAltitudeRad = Math.atan(1.0 / (1.0 + Math.tan(phiMinusDelta)));
  const asharAltitudeDeg = radToDeg(asharAltitudeRad);
  const haAshar = calcHourAngle(asharAltitudeDeg) ?? 3.5;
  const asharHours = noon + haAshar + 2 / 60;

  // 5. Maghrib: Sunset (-0.833° - dip) + 2 min ihtiyat
  const sunsetHours = noon + haSunrise + 2 / 60;

  // 6. Isya: -18° + 2 min ihtiyat
  const haIsya = calcHourAngle(-18.0) ?? 6.2;
  const isyaHours = noon + haIsya + 2 / 60;

  // 7. Imsak: Subuh - 10 minutes
  const imsakHours = subuhHours - 10 / 60;

  // Format time with standard astronomical rounding (seconds >= 30 rounded up)
  const formatTime = (hoursFraction: number): string => {
    let normalized = (hoursFraction % 24 + 24) % 24;
    const totalMinutes = normalized * 60;
    const roundedMinutes = Math.round(totalMinutes);
    const h = Math.floor(roundedMinutes / 60) % 24;
    const m = roundedMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const padZero = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${year}-${padZero(month)}-${padZero(day)}`;

  return {
    date: dateStr,
    imsak: formatTime(imsakHours),
    subuh: formatTime(subuhHours),
    terbit: formatTime(sunriseHours),
    dzuhur: formatTime(dzuhurHours),
    ashar: formatTime(asharHours),
    maghrib: formatTime(sunsetHours),
    isya: formatTime(isyaHours),
    fajr: formatTime(subuhHours),
    sunrise: formatTime(sunriseHours),
    dhuhr: formatTime(dzuhurHours),
    asr: formatTime(asharHours),
    isha: formatTime(isyaHours),
  };
}

/**
 * Calculates current active or next approaching prayer and countdown in seconds
 */
export function getNextPrayerInfo(prayerTimes: PrayerTimes, currentTime: Date = new Date()): NextPrayerInfo {
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();
  const currentSecsOfDay = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

  const parseTimeToSecs = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const prayers: Array<{ name: NextPrayerInfo['name']; time: string; secs: number }> = [
    { name: 'Subuh', time: prayerTimes.subuh, secs: parseTimeToSecs(prayerTimes.subuh) },
    { name: 'Terbit', time: prayerTimes.terbit, secs: parseTimeToSecs(prayerTimes.terbit) },
    { name: 'Dzuhur', time: prayerTimes.dzuhur, secs: parseTimeToSecs(prayerTimes.dzuhur) },
    { name: 'Ashar', time: prayerTimes.ashar, secs: parseTimeToSecs(prayerTimes.ashar) },
    { name: 'Maghrib', time: prayerTimes.maghrib, secs: parseTimeToSecs(prayerTimes.maghrib) },
    { name: 'Isya', time: prayerTimes.isya, secs: parseTimeToSecs(prayerTimes.isya) },
  ];

  // Find next prayer today
  for (const p of prayers) {
    if (p.secs > currentSecsOfDay) {
      const diffSecs = p.secs - currentSecsOfDay;
      return {
        name: p.name,
        time: p.time,
        remainingSeconds: diffSecs,
        remainingFormatted: formatCountdown(diffSecs),
        isPassed: false,
      };
    }
  }

  // If passed all prayers today, the next prayer is tomorrow's Subuh
  const subuhSecsTomorrow = prayers[0].secs + 86400;
  const diffSecs = subuhSecsTomorrow - currentSecsOfDay;
  return {
    name: 'Subuh',
    time: prayers[0].time,
    remainingSeconds: diffSecs,
    remainingFormatted: formatCountdown(diffSecs),
    isPassed: false,
  };
}

export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}j ${minutes}m ${seconds}d`;
  }
  return `${minutes}m ${seconds}d`;
}

/**
 * Returns prayer times for an entire month
 */
export function getMonthlyPrayerSchedule(year: number, month: number, city: CityLocation): PrayerTimes[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedule: PrayerTimes[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    schedule.push(calculatePrayerTimes(d, city));
  }
  return schedule;
}
