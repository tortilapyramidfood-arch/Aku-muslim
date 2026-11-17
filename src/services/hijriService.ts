/**
 * Hijri Calendar & Sunnah Fasting Service
 * Includes conversion, Islamic calendar holidays, and Sunnah fasting rules.
 */

export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  formatted: string;
}

export interface IslamicEvent {
  title: string;
  hijriDate: string;
  gregorianApprox: string;
  description: string;
  isOfficialKemenagNote?: boolean;
}

export interface SunnahFastDay {
  date: string; // YYYY-MM-DD
  type: 'Senin' | 'Kamis' | 'Ayyamul Bidh' | 'Asyura' | 'Arafah' | 'Ramadhan';
  description: string;
}

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  'Jumadil Awwal',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawwal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

/**
 * Converts a Gregorian Date into Hijri Date using astronomical arithmetic algorithm
 * with optional adjustment offset (+/- 1 day for Kemenag Ru'yatul Hilal alignment).
 */
export function getHijriDate(date: Date = new Date(), dayOffset: number = 0): HijriDate {
  // Use Intl.DateTimeFormat with islamic-umalqura calendar if available in modern browsers
  try {
    const adjustedDate = new Date(date.getTime() + dayOffset * 86400000);
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(adjustedDate);
    let day = 1;
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const monthName = HIJRI_MONTHS[(month - 1) % 12];
    return {
      day,
      month,
      monthName,
      year,
      formatted: `${day} ${monthName} ${year} H`,
    };
  } catch {
    // Mathematical Kuwati fallback algorithm if Intl is limited
    const d = new Date(date.getTime() + dayOffset * 86400000);
    let jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    let m = Math.floor((24 * l) / 709);
    let day = l - Math.floor((709 * m) / 24);
    let y = 30 * n + j - 30;
    let month = m;
    let year = y;
    const monthName = HIJRI_MONTHS[(month - 1) % 12];
    return {
      day,
      month,
      monthName,
      year,
      formatted: `${day} ${monthName} ${year} H`,
    };
  }
}

/**
 * Known Islamic Major Holidays and Commemorations
 */
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    title: 'Tahun Baru Islam (1 Muharram)',
    hijriDate: '1 Muharram',
    gregorianApprox: 'Awal tahun kalender Hijriah',
    description: 'Peringatan hijrah Rasulullah SAW dari Makkah ke Madinah.',
  },
  {
    title: 'Hari Asyura (10 Muharram)',
    hijriDate: '10 Muharram',
    gregorianApprox: 'Bulan Muharram',
    description: 'Hari disunnahkannya berpuasa Tasu\'a (9 Muharram) dan Asyura (10 Muharram).',
  },
  {
    title: 'Maulid Nabi Muhammad SAW',
    hijriDate: "12 Rabi'ul Awwal",
    gregorianApprox: "Bulan Rabi'ul Awwal",
    description: 'Peringatan hari kelahiran manusia termulia, Rasulullah SAW.',
  },
  {
    title: "Isra Mi'raj",
    hijriDate: '27 Rajab',
    gregorianApprox: 'Bulan Rajab',
    description: 'Perjalanan agung malam hari Rasulullah SAW dan penerimaan perintah sholat lima waktu.',
  },
  {
    title: 'Awal Puasa Ramadhan',
    hijriDate: '1 Ramadhan',
    gregorianApprox: 'Bulan Ramadhan',
    description: 'Bulan suci penuh berkah, rahmat, dan ampunan. Wajib berpuasa satu bulan penuh.',
    isOfficialKemenagNote: true,
  },
  {
    title: "Nuzulul Qur'an",
    hijriDate: '17 Ramadhan',
    gregorianApprox: 'Pertengahan Ramadhan',
    description: 'Peringatan diturunkannya permulaan ayat Al-Qur\'an kepada Nabi Muhammad SAW di Gua Hira.',
  },
  {
    title: 'Hari Raya Idul Fitri',
    hijriDate: '1-2 Syawwal',
    gregorianApprox: 'Bulan Syawwal',
    description: 'Hari kemenangan umat Islam setelah menunaikan ibadah puasa Ramadhan.',
    isOfficialKemenagNote: true,
  },
  {
    title: 'Hari Arafah & Idul Adha',
    hijriDate: '9-10 Dzulhijjah',
    gregorianApprox: 'Bulan Dzulhijjah',
    description: 'Puasa Arafah disunnahkan bagi yang tidak berhaji. Dilanjutkan sholat Idul Adha dan penyembelihan hewan qurban.',
    isOfficialKemenagNote: true,
  },
];

/**
 * Checks if a given date is a Sunnah fasting day
 */
export function checkSunnahFast(date: Date): { isFastDay: boolean; fastType?: string; description?: string } {
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, 4 is Thursday
  const hijri = getHijriDate(date);

  // 1. Senin & Kamis
  if (dayOfWeek === 1) {
    return {
      isFastDay: true,
      fastType: 'Puasa Senin',
      description: 'Rasulullah SAW bersabda amal hamba diperiksa pada hari Senin dan Kamis.',
    };
  }
  if (dayOfWeek === 4) {
    return {
      isFastDay: true,
      fastType: 'Puasa Kamis',
      description: 'Rasulullah SAW senang jika amalnya diperiksa dalam keadaan berpuasa.',
    };
  }

  // 2. Ayyamul Bidh (13, 14, 15 Hijriah)
  if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
    return {
      isFastDay: true,
      fastType: 'Puasa Ayyamul Bidh',
      description: `Hari ke-${hijri.day} bulan ${hijri.monthName}. Pahala puasa seperti berpuasa sepanjang tahun.`,
    };
  }

  // 3. Puasa Asyura (9 & 10 Muharram)
  if (hijri.month === 1 && (hijri.day === 9 || hijri.day === 10)) {
    return {
      isFastDay: true,
      fastType: hijri.day === 9 ? "Puasa Tasu'a" : 'Puasa Asyura',
      description: 'Puasa Asyura menghapuskan dosa setahun yang lalu (HR. Muslim).',
    };
  }

  // 4. Puasa Arafah (9 Dzulhijjah)
  if (hijri.month === 12 && hijri.day === 9) {
    return {
      isFastDay: true,
      fastType: 'Puasa Arafah',
      description: 'Menghapuskan dosa setahun yang lalu dan setahun yang akan datang (HR. Muslim).',
    };
  }

  return { isFastDay: false };
}

export interface HijriCalendarDay {
  gregorianDate: Date;
  gregorianIso: string; // YYYY-MM-DD
  gregorianShort: string; // e.g. "12 Nov"
  dayOfWeek: number; // 0 = Min .. 6 = Sab
  hijriDay: number;
  sunnahFastType?: string;
  islamicEventTitle?: string;
}

export interface HijriMonthEvent {
  title: string;
  hijriDateLabel: string;
  gregorianFormatted: string;
  description: string;
  isOfficialKemenagNote?: boolean;
}

export interface HijriMonthSchedule {
  key: string; // `${year}-${month}`
  year: number;
  month: number;
  monthName: string;
  gregorianRangeLabel: string;
  days: HijriCalendarDay[];
  events: HijriMonthEvent[];
}

function matchIslamicEventsForHijriDay(month: number, day: number): { title: string; description: string; isOfficialKemenagNote?: boolean } | null {
  if (month === 1 && day === 1) {
    return { title: 'Tahun Baru Islam (1 Muharram)', description: 'Awal tahun baru penanggalan Hijriah.' };
  }
  if (month === 1 && day === 10) {
    return { title: 'Hari Asyura (10 Muharram)', description: 'Disunnahkan berpuasa Asyura (10 Muharram).' };
  }
  if (month === 3 && day === 12) {
    return { title: 'Maulid Nabi Muhammad SAW', description: 'Peringatan hari kelahiran Rasulullah SAW.' };
  }
  if (month === 7 && day === 27) {
    return { title: "Isra Mi'raj Nabi Muhammad SAW", description: 'Peringatan perjalanan Isra Mi\'raj dan perintah sholat lima waktu.' };
  }
  if (month === 8 && day === 15) {
    return { title: "Nisfu Sya'ban", description: 'Malam pertengahan bulan Sya\'ban sebelum memasuki Ramadhan.' };
  }
  if (month === 9 && day === 1) {
    return { title: 'Awal Ramadhan', description: 'Permulaan ibadah puasa wajib Ramadhan (mengikuti Sidang Isbat Kemenag RI).', isOfficialKemenagNote: true };
  }
  if (month === 9 && day === 17) {
    return { title: "Nuzulul Qur'an", description: 'Peringatan turunnya wahyu pertama Al-Qur\'an.' };
  }
  if (month === 10 && day === 1) {
    return { title: 'Hari Raya Idul Fitri (1 Syawwal)', description: 'Hari kemenangan umat Islam (mengikuti Sidang Isbat Kemenag RI).', isOfficialKemenagNote: true };
  }
  if (month === 12 && day === 9) {
    return { title: 'Hari Arafah (9 Dzulhijjah)', description: 'Disunnahkan berpuasa Arafah bagi yang tidak menunaikan ibadah haji.', isOfficialKemenagNote: true };
  }
  if (month === 12 && day === 10) {
    return { title: 'Hari Raya Idul Adha (10 Dzulhijjah)', description: 'Sholat Idul Adha & penyembelihan hewan qurban (Sidang Isbat Kemenag RI).', isOfficialKemenagNote: true };
  }
  return null;
}

/**
 * Menghasilkan jadwal 12 bulan Hijriah ke depan dimulai dari bulan Hijriah saat ini,
 * lengkap dengan padanan tanggal Masehi setiap harinya dan hari penting Islam.
 */
export function getUpcoming12HijriMonths(referenceDate: Date = new Date()): HijriMonthSchedule[] {
  const startHijri = getHijriDate(referenceDate);

  // Mundur secukupnya ke awal bulan Hijriah aktif agar tampilan grid 1 bulan utuh rapi
  const cursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 12, 0, 0);
  for (let i = 0; i < 32; i++) {
    const prev = new Date(cursor.getTime() - 86400000);
    const prevHijri = getHijriDate(prev);
    if (prevHijri.month !== startHijri.month || prevHijri.year !== startHijri.year) {
      break;
    }
    cursor.setTime(prev.getTime());
  }

  const monthMap = new Map<string, HijriMonthSchedule>();
  const orderedKeys: string[] = [];

  for (let d = 0; d < 390; d++) {
    const dayDate = new Date(cursor.getTime() + d * 86400000);
    const h = getHijriDate(dayDate);
    const key = `${h.year}-${h.month}`;

    if (!monthMap.has(key)) {
      if (orderedKeys.length >= 12) break;
      orderedKeys.push(key);
      monthMap.set(key, {
        key,
        year: h.year,
        month: h.month,
        monthName: h.monthName,
        gregorianRangeLabel: '',
        days: [],
        events: [],
      });
    }

    const bucket = monthMap.get(key)!;
    const sunnah = checkSunnahFast(dayDate);
    const ev = matchIslamicEventsForHijriDay(h.month, h.day);

    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');

    bucket.days.push({
      gregorianDate: dayDate,
      gregorianIso: `${yyyy}-${mm}-${dd}`,
      gregorianShort: dayDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      dayOfWeek: dayDate.getDay(),
      hijriDay: h.day,
      sunnahFastType: sunnah.isFastDay ? sunnah.fastType : undefined,
      islamicEventTitle: ev?.title,
    });

    if (ev) {
      bucket.events.push({
        title: ev.title,
        hijriDateLabel: `${h.day} ${h.monthName} ${h.year} H`,
        gregorianFormatted: dayDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        description: ev.description,
        isOfficialKemenagNote: ev.isOfficialKemenagNote,
      });
    }
  }

  return orderedKeys.map((key) => {
    const m = monthMap.get(key)!;
    const first = m.days[0]?.gregorianDate;
    const last = m.days[m.days.length - 1]?.gregorianDate;
    const firstStr = first
      ? first.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const lastStr = last
      ? last.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    return {
      ...m,
      gregorianRangeLabel: firstStr && lastStr ? `${firstStr} – ${lastStr}` : '',
    };
  });
}
