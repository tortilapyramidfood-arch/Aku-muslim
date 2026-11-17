import React, { useState } from 'react';
import { humanAudioService } from '../../services/humanAudioService';
import {
  Volume2,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export interface PrayerStepItem {
  id: number;
  stepName: string;
  arabicName: string;
  category: 'Rukun' | 'Sunnah Ab\'adh' | 'Sunnah Hai\'at';
  illustrationIcon: string;
  arabicText: string;
  latinText: string;
  translation: string;
  pedagogicalNote: string;
  fiqhReference: string;
  audioUrl?: string;
}

// 13 Rukun Sholat Standar Fiqh Syafi'i & Kemenag RI
export const PRAYER_STEPS_DATA: PrayerStepItem[] = [
  {
    id: 1,
    stepName: '1. Niat (An-Niyyah)',
    arabicName: 'النِّيَّةُ',
    category: 'Rukun',
    illustrationIcon: '🤍',
    arabicText: 'أُصَلِّي فَرْضَ ... رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latinText: 'Ushallii fardha... arba\'a raka\'aatin mustaqbilal-qiblati adaa-an lillaahi ta\'aalaa.',
    translation: 'Aku berniat sholat fardhu ... rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.',
    pedagogicalNote: 'Rukun pertama sholat. Niat wajib dihadirkan di dalam hati secara sengaja berbarengan saat melafalkan Takbiratul Ihram (Muqaranah \'urfiyyah). Melafalkan niat dengan lisan hukumnya sunnah untuk membantu memfokuskan hati.',
    fiqhReference: 'HR. Bukhari no. 1 & Muslim no. 1907 dari Umar bin Khaththab radhiyallahu \'anhu: "Innamal a\'maalu bin-niyyaat". Standar Fiqh Syafi\'i Matan Safinatun Naja fasal Rukun Sholat.',
  },
  {
    id: 2,
    stepName: '2. Berdiri bagi yang Mampu (Al-Qiyam)',
    arabicName: 'الْقِيَامُ مَعَ الْقُدْرَةِ',
    category: 'Rukun',
    illustrationIcon: '🧍‍♂️',
    arabicText: 'وَقُومُوا لِلَّهِ قَانِتِينَ',
    latinText: 'Wa quumuu lillaahi qaanitiin.',
    translation: 'Dan berdirilah untuk Allah (dalam sholatmu) dengan khusyuk dan patuh. (QS. Al-Baqarah: 238)',
    pedagogicalNote: 'Rukun kedua pada sholat fardhu bagi orang yang mampu. Badan tegak lurus, pandangan diarahkan ke tempat sujud. Jika sakit atau uzur syar\'i yang menyulitkan, dibolehkan sholat sambil duduk, jika tidak mampu maka berbaring miring menghadap kiblat.',
    fiqhReference: 'HR. Bukhari no. 1117 dari Imran bin Hushain radhiyallahu \'anhu: "Sholli qoo-iman, fa-in lam tastathi\' fa qoo\'idan...".',
  },
  {
    id: 3,
    stepName: '3. Takbiratul Ihram',
    arabicName: 'تَكْبِيرَةُ الْإِحْرَامِ',
    category: 'Rukun',
    illustrationIcon: '🤲',
    arabicText: 'اللَّهُ أَكْبَرُ',
    latinText: 'Allahu Akbar',
    translation: 'Allah Maha Besar.',
    pedagogicalNote: 'Rukun qauli (ucapan) yang membuka sholat dan mengharamkan perkara di luar sholat. Wajib dilafalkan dengan suara minimal yang terdengar oleh telinga sendiri. Disunnahkan mengangkat kedua tangan sejajar bahu atau cuping telinga dengan telapak tangan menghadap kiblat.',
    fiqhReference: 'HR. Abu Dawud no. 618 & At-Tirmidzi no. 3: "Miftaahush-shalaatith-thahuur, wa tahriimuhat-takbiir, wa tahliiluhat-tasliim".',
  },
  {
    id: 4,
    stepName: '4. Membaca Surah Al-Fatihah',
    arabicName: 'قِرَاءَةُ الْفَاتِحَةِ',
    category: 'Rukun',
    illustrationIcon: '📖',
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    latinText: 'Bismillaahir-rahmaanir-rahiim. Al-hamdu lillaahi rabbil-\'aalamiin. Ar-rahmaanir-rahiim. Maaliki yaumid-diin. Iyyaaka na\'budu wa iyyaaka nasta\'iin. Ihdinas-shiraathal-mustaqiim. Shiraathal-ladziina an\'amta \'alaihim ghairil-maghdhuubi \'alaihim waladh-dhaalliin.',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepada mereka; bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
    pedagogicalNote: 'Rukun wajib pada setiap rakaat sholat (fardhu maupun sunnah). Dalam madzhab Syafi\'i, Basmalah adalah ayat pertama Al-Fatihah yang wajib dibaca secara utuh dengan menjaga makhraj, tasydid (14 tasydid), dan waqaf/washal yang benar.',
    fiqhReference: 'HR. Bukhari no. 756 & Muslim no. 394 dari \'Ubadah bin Shamit: "Laa shalaata liman lam yaqra\' bifatihatil kitaab".',
    audioUrl: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1/001.mp3',
  },
  {
    id: 5,
    stepName: '5. Ruku\' dengan Tuma\'ninah',
    arabicName: 'الرُّكُوعُ مَعَ الطُّمَأْنِينَةِ',
    category: 'Rukun',
    illustrationIcon: '🙇‍♂️',
    arabicText: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ',
    latinText: 'Subhaana rabbiyal-\'azhiimi wa bihamdih (3x)',
    translation: 'Maha Suci Tuhanku Yang Maha Agung dan dengan memuji-Nya (dibaca 3 kali).',
    pedagogicalNote: 'Membungkukkan badan hingga kedua telapak tangan dapat memegang lutut. Punggung dan leher diluruskan sejajar. Disertai Tuma\'ninah (diam sejenak minimal selama ucapan "Subhanallah"). Bacaan tasbih ruku\' berhukum sunnah hai\'ah.',
    fiqhReference: 'HR. Bukhari no. 793 (Hadits al-Musi\' Shalatuhu): "Tsummar-ka\' hattaa tathma-inna raaki\'aa".',
  },
  {
    id: 6,
    stepName: '6. I\'tidal dengan Tuma\'ninah',
    arabicName: 'الِاعْتِدَالُ مَعَ الطُّمَأْنِينَةِ',
    category: 'Rukun',
    illustrationIcon: '🧍‍♂️',
    arabicText: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ',
    latinText: 'Sami\'allaahu liman hamidah. Rabbanaa wa lakal-hamdu mil-us-samaawaati wa mil-ul-ardhi wa mil-u maa syi\'ta min syai-in ba\'d.',
    translation: 'Allah mendengar siapa yang memuji-Nya. Ya Tuhan kami, bagi-Mu segala puji sepenuh langit dan sepenuh bumi serta sepenuh apa saja yang Engkau kehendaki setelah itu.',
    pedagogicalNote: 'Bangkit dari ruku\' dan berdiri tegak lurus seperti sedia kala sebelum sujud, diiringi tuma\'ninah (tenang sejenak). Mengucapkan "Sami\'allahu liman hamidah" dan doa tahmid berhukum sunnah hai\'ah.',
    fiqhReference: 'HR. Bukhari no. 793: "Tsummarfa\' hattaa ta\'tadila qoo-imaa".',
  },
  {
    id: 7,
    stepName: '7. Sujud Dua Kali dengan Tuma\'ninah',
    arabicName: 'السُّجُودُ مَعَ الطُّمَأْنِينَةِ',
    category: 'Rukun',
    illustrationIcon: '🙇‍♂️',
    arabicText: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ وَبِحَمْدِهِ',
    latinText: 'Subhaana rabbiyal-a\'laa wa bihamdih (3x)',
    translation: 'Maha Suci Tuhanku Yang Maha Tinggi dan dengan memuji-Nya (dibaca 3 kali).',
    pedagogicalNote: 'Meletakkan 7 anggota sujud ke lantai: kening (terbuka tanpa penghalang) & hidung, kedua telapak tangan, kedua lutut, serta jemari kedua kaki menghadap kiblat. Disertai tuma\'ninah. Dilakukan 2 kali pada setiap rakaat.',
    fiqhReference: 'HR. Bukhari no. 812 & Muslim no. 490 dari Ibnu Abbas radhiyallahu \'anhuma: "Umirtu an asjuda \'alaa sab\'ati a\'dzumin...".',
  },
  {
    id: 8,
    stepName: '8. Duduk di Antara Dua Sujud',
    arabicName: 'الْجُلُوسُ بَيْنَ السَّجْدَتَيْنِ',
    category: 'Rukun',
    illustrationIcon: '🧎‍♂️',
    arabicText: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي',
    latinText: 'Rabbighfir lii warhamnii wajburnii warfa\'nii warzuqnii wahdinii wa\'aafinii wa\'fu \'annii.',
    translation: 'Ya Tuhanku, ampunilah dosaku, rahmatilah aku, cukupkanlah kekuranganku, angkatlah derajatku, berilah aku rezeki, berilah aku petunjuk, selamatkanlah aku, dan maafkanlah kesalahanku.',
    pedagogicalNote: 'Duduk tegak di antara sujud pertama dan kedua dengan tuma\'ninah. Disunnahkan duduk iftirasy (menduduki telapak kaki kiri dan menegakkan telapak kaki kanan dengan jari-jemari ditekuk menghadap kiblat).',
    fiqhReference: 'HR. Abu Dawud no. 850 & At-Tirmidzi no. 284 dari Ibnu Abbas radhiyallahu \'anhuma.',
  },
  {
    id: 9,
    stepName: '9. Duduk untuk Tasyahhud Akhir',
    arabicName: 'الْقُعُودُ لِلتَّشَهُّدِ الْأَخِيرِ',
    category: 'Rukun',
    illustrationIcon: '🧎‍♂️',
    arabicText: 'الْجُلُوسُ فِي آخِرِ الصَّلَاةِ',
    latinText: 'Al-Juluusu fii aakhirish-shalaah (Duduk pada rakaat terakhir).',
    translation: 'Duduk tegak pada rakaat penutup sholat untuk membaca Tasyahhud Akhir dan Shalawat.',
    pedagogicalNote: 'Duduk tasyahhud akhir adalah rukun fi\'li tersendiri. Posisi duduk yang disunnahkan adalah duduk tawarruk (memasukkan telapak kaki kiri di bawah tulang kering kaki kanan, telapak kaki kanan ditegakkan, dan pantat langsung menempel ke lantai).',
    fiqhReference: 'HR. Bukhari no. 828 dari Abu Humaid as-Sa\'idi radhiyallahu \'anhu tentang tata cara sholat Rasulullah SAW.',
  },
  {
    id: 10,
    stepName: '10. Membaca Tasyahhud Akhir',
    arabicName: 'قِرَاءَةُ التَّشَهُّدِ الْأَخِيرِ',
    category: 'Rukun',
    illustrationIcon: '🧎‍♂️',
    arabicText: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    latinText: 'At-tahiyyaatul-mubaarakaatush-shalawaatuth-thayyibaatu lillaah. As-salaamu \'alaika ayyuhan-nabiyyu wa rahmatullaahi wa barakaatuh. As-salaamu \'alainaa wa \'alaa \'ibaadillaahish-shaalihiin. Asyhadu an laa ilaaha illallaah wa asyhadu anna Muhammadar-rasuulullaah.',
    translation: 'Segala kehormatan, keberkahan, rahmat, dan kebaikan hanyalah milik Allah. Semoga keselamatan tercurah kepadamu wahai Nabi, beserta rahmat Allah dan berkah-Nya. Semoga keselamatan tercurah kepada kami dan kepada hamba-hamba Allah yang saleh. Aku bersaksi bahwa tiada tuhan selain Allah dan aku bersaksi bahwa Muhammad adalah utusan Allah.',
    pedagogicalNote: 'Rukun qauli wajib. Dilafalkan saat duduk tasyahhud akhir. Jari telunjuk tangan kanan diangkat mengarah ke kiblat saat melafalkan lafaz syahadat "illallaah".',
    fiqhReference: 'HR. Bukhari no. 1202 & Muslim no. 402 dari Abdullah bin Mas\'ud radhiyallahu \'anhu.',
  },
  {
    id: 11,
    stepName: '11. Membaca Shalawat atas Nabi SAW',
    arabicName: 'الصَّلَاةُ عَلَى النَّبِيِّ فِي التَّشَهُّدِ الْأَخِيرِ',
    category: 'Rukun',
    illustrationIcon: '🧎‍♂️',
    arabicText: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ، وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    latinText: 'Allaahumma shalli \'alaa sayyidinaa Muhammad, wa \'alaa aali sayyidinaa Muhammad, kamaa shallaita \'alaa sayyidinaa Ibraahiim wa \'alaa aali sayyidinaa Ibraahiim, wa baarik \'alaa sayyidinaa Muhammad wa \'alaa aali sayyidinaa Muhammad, kamaa baarakta \'alaa sayyidinaa Ibraahiim wa \'alaa aali sayyidinaa Ibraahiim, fil-\'aalamiina innaka hamiidum-majiid.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad beserta keluarganya, sebagaimana Engkau telah melimpahkan rahmat kepada junjungan kami Nabi Ibrahim beserta keluarganya. Dan limpahkanlah berkah kepada junjungan kami Nabi Muhammad beserta keluarganya, sebagaimana Engkau telah melimpahkan berkah kepada junjungan kami Nabi Ibrahim beserta keluarganya. Sesungguhnya di alam semesta ini Engkau Maha Terpuji lagi Maha Mulia.',
    pedagogicalNote: 'Minimal rukun adalah membaca: "Allaahumma shalli \'alaa Muhammad" setelah tasyahhud akhir. Membaca shalawat Ibrahimiyyah lengkap dan shalawat kepada keluarga Nabi (Aal Muhammad) adalah penyempurna utama.',
    fiqhReference: 'HR. Bukhari no. 3370 & Muslim no. 405 dari Ka\'ab bin \'Ujrah radhiyallahu \'anhu.',
  },
  {
    id: 12,
    stepName: '12. Mengucapkan Salam Pertama',
    arabicName: 'التَّسْلِيمَةُ الْأُولَى',
    category: 'Rukun',
    illustrationIcon: '🧍‍♂️',
    arabicText: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    latinText: 'As-salaamu \'alaikum wa rahmatullaah',
    translation: 'Semoga keselamatan dan rahmat Allah tercurah kepada kalian.',
    pedagogicalNote: 'Rukun qauli penutup yang melegalkan kembali perkara di luar sholat (tahallul). Wajib melafalkan salam pertama sambil memalingkan wajah ke kanan hingga pipi kanan terlihat dari belakang. Salam kedua ke kiri berhukum sunnah hai\'ah.',
    fiqhReference: 'HR. Muslim no. 582 dari Jabir bin Samurah radhiyallahu \'anhu.',
  },
  {
    id: 13,
    stepName: '13. Tertib (Berurutan)',
    arabicName: 'التَّرْتِيبُ',
    category: 'Rukun',
    illustrationIcon: '🔄',
    arabicText: 'أَدَاءُ الْأَرْكَانِ عَلَى تَرْتِيبِهَا الشَّرْعِيِّ',
    latinText: 'Adaa-ul arkaan \'alaa tartiibihaa asy-syar\'iy.',
    translation: 'Mengerjakan seluruh rukun secara berurutan sebagaimana dicontohkan Rasulullah SAW.',
    pedagogicalNote: 'Rukun maknawi yang mewajibkan seluruh rukun 1 sampai 12 dilakukan sesuai urutannya: niat & takbir, berdiri, Fatihah, ruku\', i\'tidal, sujud, duduk di antara dua sujud, sujud kedua, hingga tasyahhud, shalawat, dan salam. Jika rukun fi\'li sengaja dibalik (misal sujud mendahului ruku\'), sholat batal.',
    fiqhReference: 'HR. Bukhari no. 631 dari Malik bin Huwairits: "Shalluu kamaa ra-aitumuunii ushallii" (Sholatlah kalian sebagaimana kalian melihat aku sholat). Kitab Fathul Qarib Al-Mujib & Safinatun Naja.',
  },
];

// 5 Syarat Sah Sholat
export const SHOLAT_CONDITIONS = [
  {
    number: 1,
    title: 'Suci dari Hadats Besar dan Kecil',
    desc: 'Wajib suci dari hadats kecil melalui wudhu yang sah, dan suci dari hadats besar melalui mandi janabah (atau tayamum bila ada uzur syar\'i yang sah).',
    dalil: 'QS. Al-Maidah: 6 & HR. Muslim: "Tidak diterima sholat tanpa bersuci."',
  },
  {
    number: 2,
    title: 'Suci Badan, Pakaian, dan Tempat dari Najis',
    desc: 'Tubuh yang sholat, pakaian yang menempel, serta tempat berpijak/sujud harus bebas dari najis mutawassithah, mughalladhah, maupun mukhaffafah yang tidak dimaafkan.',
    dalil: 'QS. Al-Muddatstsir: 4 ("Dan bersihkanlah pakaianmu").',
  },
  {
    number: 3,
    title: 'Menutup Aurat',
    desc: 'Laki-laki minimal antara pusar hingga lutut. Perempuan menutup seluruh anggota tubuh kecuali wajah dan kedua telapak tangan. Menggunakan kain yang suci, tidak transparan, dan tidak memperlihatkan warna kulit.',
    dalil: 'QS. Al-A\'raf: 31 ("Pakailah pakaianmu yang indah di setiap memasuki masjid").',
  },
  {
    number: 4,
    title: 'Mengetahui Masuknya Waktu Sholat',
    desc: 'Yakin telah masuknya waktu sholat fardhu secara pasti atau melalui ijtihad (seperti perhitungan hisab waktu sholat akurat atau adzan terpercaya). Sholat yang dikerjakan sebelum waktunya tidak sah.',
    dalil: 'QS. An-Nisa: 103 ("Sesungguhnya sholat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman").',
  },
  {
    number: 5,
    title: 'Menghadap Kiblat (Ka\'bah)',
    desc: 'Menghadapkan dada lurus ke arah Ka\'bah di Masjidil Haram Makkah bagi yang jauh melalui penentuan arah kiblat yang akurat (atau perkiraan arah barat laut dari Indonesia).',
    dalil: 'QS. Al-Baqarah: 144 ("Palingkanlah mukamu ke arah Masjidil Haram").',
  },
];

// 6 Rukun Wudhu
export const WUDHU_RUKUN = [
  { step: 1, name: 'Niat Bersuci', note: 'Diniatkan dalam hati berbarengan saat air pertama kali menyentuh wajah.' },
  { step: 2, name: 'Membasuh Seluruh Wajah', note: 'Batas vertikal: tempat tumbuh rambut kepala sampai bawah dagu; batas horizontal: telinga ke telinga.' },
  { step: 3, name: 'Membasuh Kedua Tangan Sampai Siku', note: 'Wajib meratakan air dari ujung kuku hingga melewati kedua siku, didahulukan tangan kanan.' },
  { step: 4, name: 'Mengusap Sebagian Kepala', note: 'Membasahi minimal sebagian rambut atau kulit kepala dengan usapan tangan basah.' },
  { step: 5, name: 'Membasuh Kedua Kaki Sampai Mata Kaki', note: 'Meratakan air ke seluruh kaki hingga melewati mata kaki dan menyela jemari kaki.' },
  { step: 6, name: 'Tertib (Berurutan)', note: 'Mengerjakan langkah 1 hingga 5 secara berurutan tanpa membolak-balik urutan.' },
];

/**
 * Komponen Siluet Vektor Anatomi Gerakan Sholat (Prayer Posture Graphic)
 */
export const PrayerPostureGraphic: React.FC<{ stepId: number; className?: string }> = ({
  stepId,
  className = 'w-16 h-20',
}) => {
  // Warna aksen hijau emerald & emas Islami
  const primaryColor = '#047857'; // emerald-700
  const accentColor = '#f59e0b'; // amber-500
  const floorColor = '#94a3b8'; // slate-400

  // 1 & 2: Berdiri Tegak / Qiyam
  if (stepId === 1 || stepId === 2) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="112" x2="80" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="22" r="9" fill={primaryColor} />
        <path d="M42 35 H58 L55 75 H45 Z" fill={primaryColor} />
        <line x1="40" y1="38" x2="36" y2="68" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="60" y1="38" x2="64" y2="68" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="47" y1="75" x2="47" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
        <line x1="53" y1="75" x2="53" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 3: Takbiratul Ihram (Kedua tangan terangkat setinggi bahu/telinga)
  if (stepId === 3) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="112" x2="80" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="22" r="9" fill={primaryColor} />
        <path d="M43 35 H57 L54 75 H46 Z" fill={primaryColor} />
        {/* Tangan terangkat */}
        <path d="M43 40 L30 38 L28 20" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M57 40 L70 38 L72 20" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="47" y1="75" x2="47" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
        <line x1="53" y1="75" x2="53" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 4: Membaca Al-Fatihah (Berdiri Bersedekap di dada)
  if (stepId === 4) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="112" x2="80" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="22" r="9" fill={primaryColor} />
        <path d="M42 35 H58 L55 75 H45 Z" fill={primaryColor} />
        {/* Tangan bersedekap */}
        <path d="M42 38 L45 52 L55 52 L58 38" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="47" y1="75" x2="47" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
        <line x1="53" y1="75" x2="53" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 5: Rukuk dengan Tuma'ninah (Badan membungkuk 90 derajat)
  if (stepId === 5) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="112" x2="85" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        {/* Kepala & Punggung lurus horizontal */}
        <circle cx="28" cy="56" r="8" fill={primaryColor} />
        <line x1="36" y1="56" x2="72" y2="56" stroke={primaryColor} strokeWidth="9" strokeLinecap="round" />
        {/* Tangan memegang lutut */}
        <line x1="48" y1="56" x2="68" y2="82" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
        {/* Kaki tegak lurus */}
        <line x1="72" y1="56" x2="68" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
        <line x1="76" y1="56" x2="74" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 6: I'tidal dengan Tuma'ninah
  if (stepId === 6) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="112" x2="80" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="22" r="9" fill={primaryColor} />
        <path d="M43 35 H57 L54 75 H46 Z" fill={primaryColor} />
        <line x1="41" y1="38" x2="38" y2="68" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="59" y1="38" x2="62" y2="68" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="47" y1="75" x2="47" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
        <line x1="53" y1="75" x2="53" y2="110" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 7: Sujud Dua Kali (7 Anggota Badan Menempel di Lantai)
  if (stepId === 7) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="112" x2="90" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        {/* Kepala menempel sajadah */}
        <circle cx="24" cy="103" r="8" fill={accentColor} />
        {/* Tangan di samping kepala */}
        <path d="M42 90 L34 100 L28 108" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Punggung membungkuk sujud */}
        <path d="M26 100 Q45 74 65 80" stroke={primaryColor} strokeWidth="8" strokeLinecap="round" />
        {/* Paha & Kaki menekuk */}
        <path d="M65 80 L76 105 L84 108" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 8: Duduk di Antara Dua Sujud (Duduk Iftirasy)
  if (stepId === 8) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="112" x2="85" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="48" r="8" fill={primaryColor} />
        {/* Badan tegak duduk */}
        <path d="M43 59 H53 L51 88 H41 Z" fill={primaryColor} />
        {/* Tangan di atas lutut/paha */}
        <line x1="44" y1="62" x2="30" y2="88" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Kaki melipat duduk iftirasy */}
        <path d="M46 88 L30 96 L65 106 L74 106" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 9, 10, 11: Duduk Tasyahud (Tasyahhud Akhir / Tawarruk) dengan isyarat telunjuk
  if (stepId === 9 || stepId === 10 || stepId === 11) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="112" x2="85" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="48" r="8" fill={primaryColor} />
        <path d="M43 59 H53 L51 88 H41 Z" fill={primaryColor} />
        {/* Tangan kanan dengan isyarat jari telunjuk tauhid */}
        <path d="M44 62 L32 82 L26 78" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="48" y1="62" x2="38" y2="86" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Kaki posisi tawarruk */}
        <path d="M46 88 L34 98 L68 108 L78 108" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 12: Salam Pertama ke Kanan
  if (stepId === 12) {
    return (
      <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="112" x2="85" y2="112" stroke={floorColor} strokeWidth="2" strokeLinecap="round" />
        {/* Kepala menoleh ke kanan */}
        <circle cx="53" cy="48" r="8" fill={accentColor} />
        <path d="M57 48 L62 48" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M43 59 H53 L51 88 H41 Z" fill={primaryColor} />
        <path d="M46 88 L30 96 L65 106 L74 106" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 13: Tertib (Rangkaian berurutan dan teratur)
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="60" r="32" stroke={primaryColor} strokeWidth="3" strokeDasharray="4 2" />
      <path d="M40 60 L48 68 L64 50" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="20" r="4" fill={primaryColor} />
      <circle cx="78" cy="60" r="4" fill={primaryColor} />
      <circle cx="50" cy="100" r="4" fill={primaryColor} />
      <circle cx="22" cy="60" r="4" fill={primaryColor} />
    </svg>
  );
};

export function getPostureDescription(stepId: number): string {
  switch (stepId) {
    case 1:
      return 'Berdiri tegak menghadap kiblat dengan tenang dan tuma\'ninah. Niat dihadirkan di hati berbarengan saat melafalkan takbiratul ihram.';
    case 2:
      return 'Berdiri tegak lurus (Al-Qiyam) bagi yang mampu secara fisik. Kaki sejajar dibuka selebar bahu menghadap kiblat, pandangan ke tempat sujud.';
    case 3:
      return 'Mengangkat kedua tangan sejajar bahu atau telinga dengan telapak tangan menghadap kiblat seraya mengucap "Allahu Akbar".';
    case 4:
      return 'Kedua tangan bersedekap di dada di atas pusar. Tangan kanan menggenggam pergelangan tangan kiri. Membaca Surah Al-Fatihah dengan fasih.';
    case 5:
      return 'Membungkukkan badan mendatar 90°, kedua tangan menggenggam tempurung lutut, tulang belakang lurus rata, disertai tuma\'ninah.';
    case 6:
      return 'Bangkit berdiri tegak lurus kembali dari ruku\' (I\'tidal) seraya memuji Allah, kedua tangan lurus ke bawah disertai tuma\'ninah.';
    case 7:
      return 'Bersujud dengan 7 anggota badan: kening & hidung, 2 telapak tangan, 2 lutut, serta jemari kedua kaki ditekuk ke arah kiblat, disertai tuma\'ninah.';
    case 8:
      return 'Duduk Iftirasy di antara dua sujud: menduduki telapak kaki kiri dan menegakkan telapak kaki kanan dengan jemari menekuk ke kiblat, tangan di paha.';
    case 9:
      return 'Duduk Tawarruk pada rakaat penutup: menyelipkan kaki kiri di bawah betis kanan, pantat menempel langsung ke lantai sajadah.';
    case 10:
      return 'Duduk tenang seraya membaca bacaan Tasyahhud Akhir. Jari telunjuk tangan kanan diacungkan saat melafalkan syahadat tauhid.';
    case 11:
      return 'Melanjutkan posisi tasyahhud dengan melantunkan shalawat Ibrahimiyyah kepada Baginda Nabi Muhammad SAW dan keluarga beliau.';
    case 12:
      return 'Menolehkan wajah ke kanan hingga pipi terlihat dari belakang mengucap "Assalamu\'alaikum warahmatullah", disusul salam kedua ke kiri.';
    case 13:
      return 'Melaksanakan seluruh 12 rukun sholat secara tertib dan berurutan dari awal hingga akhir tanpa mendahului atau membolak-balik gerakan.';
    default:
      return 'Menjalankan gerakan rukun sholat sesuai tuntunan sunnah Rasulullah SAW.';
  }
}

export const PrayerGuideModule: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'rukun' | 'syarat' | 'sunnah' | 'wudhu' | 'sholat_sunnah'>('rukun');
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [playbackNotice, setPlaybackNotice] = useState<string>('');

  const currentStep = PRAYER_STEPS_DATA.find((s) => s.id === activeStepId) || PRAYER_STEPS_DATA[0];

  const handlePlayAudio = async (step: PrayerStepItem) => {
    if (step.audioUrl) {
      setPlaybackNotice(`Memutar pelafalan Syaikh Mahmud Khalil Al-Husary: ${step.stepName}`);
      const res = await humanAudioService.playCustomHumanAudio(step.audioUrl, step.stepName);
      setPlaybackNotice(res.message);
    } else {
      humanAudioService.stopAllAudio();
      setPlaybackNotice('Audio belum tersedia untuk gerakan ini (menunggu rekaman fisik ustadz bersanad). Silakan ikuti bacaan Arab.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <BookOpen className="w-4 h-4" />
          <span>STANDAR FIQH SYAFI'I & KEMENAG RI</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black">
          Tuntunan Ibadah Sholat & Bersuci
        </h2>
        <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
          Panduan komprehensif 13 rukun sholat wajib, 5 syarat sah, sunnah ab'adh & hai'ah, serta rukun wudhu dengan dalil shahih dan audio manusia asli (bebas TTS sintetis).
        </p>
      </div>

      {/* Primary Category Segmented Nav */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setSelectedTab('rukun')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedTab === 'rukun'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          13 Rukun Sholat
        </button>
        <button
          onClick={() => setSelectedTab('syarat')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedTab === 'syarat'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          5 Syarat Sah
        </button>
        <button
          onClick={() => setSelectedTab('sunnah')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedTab === 'sunnah'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Sunnah Ab'adh & Hai'ah
        </button>
        <button
          onClick={() => setSelectedTab('wudhu')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedTab === 'wudhu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Tata Cara Wudhu
        </button>
        <button
          onClick={() => setSelectedTab('sholat_sunnah')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedTab === 'sholat_sunnah'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          Sholat Sunnah
        </button>
      </div>

      {/* Content Section 1: 13 RUKUN SHOLAT */}
      {selectedTab === 'rukun' && (
        <div className="space-y-4">
          {/* Step Selector Horizontal Bar (1 to 13) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PRAYER_STEPS_DATA.map((step) => {
              const isSelected = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                  }`}
                >
                  <span>{step.id}. {step.stepName.split('.')[1] || step.stepName}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                  {currentStep.illustrationIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Rukun Wajib Sholat
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      {currentStep.id} dari 13 Rukun
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white mt-0.5">
                    {currentStep.stepName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => handlePlayAudio(currentStep)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all shrink-0 ${
                  currentStep.audioUrl
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-900 cursor-pointer'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-default opacity-75 border border-stone-300 dark:border-stone-700'
                }`}
                title={
                  currentStep.audioUrl
                    ? 'Dengarkan Rekaman Suara Qari Syaikh Mahmud Khalil Al-Husary'
                    : 'Audio belum tersedia (Menunggu rekaman ustadz bersanad)'
                }
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {currentStep.audioUrl ? 'Audio Pelafalan' : 'Audio Belum Tersedia'}
                </span>
              </button>
            </div>

            {/* Posture Visual Illustration & Physical Stance Guide */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/10 via-teal-950/5 to-amber-950/10 dark:bg-stone-800/80 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-28 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-400/40 flex items-center justify-center p-2 shadow-sm shrink-0">
                <PrayerPostureGraphic stepId={currentStep.id} className="w-16 h-20" />
              </div>
              <div className="text-xs sm:text-sm space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Posisi & Panduan Gerakan Tubuh:
                  </span>
                  <span className="font-arabic text-base font-bold text-amber-600 dark:text-amber-400">
                    {currentStep.arabicName}
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {getPostureDescription(currentStep.id)}
                </p>
              </div>
            </div>

            {/* Arabic Recitation Box */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-right space-y-3">
              <p className="font-arabic text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-200 leading-loose">
                {currentStep.arabicText}
              </p>
              <div className="text-left text-xs font-medium text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-200/60 dark:border-stone-700 space-y-1">
                <p className="italic text-stone-500 dark:text-stone-400">{currentStep.latinText}</p>
                <p className="font-semibold text-stone-800 dark:text-stone-200">"{currentStep.translation}"</p>
              </div>
            </div>

            {/* Pedagogical Note */}
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                <strong className="block mb-1 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Tata Cara & Kaidah Fiqih:</span>
                </strong>
                {currentStep.pedagogicalNote}
              </div>

              <div className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Rujukan Dalil: <strong>{currentStep.fiqhReference}</strong></span>
              </div>
            </div>

            {/* Pagination */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
                disabled={activeStepId <= 1}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 disabled:opacity-30"
              >
                ← Rukun Sebelumnya
              </button>
              <button
                onClick={() => setActiveStepId((prev) => Math.min(PRAYER_STEPS_DATA.length, prev + 1))}
                disabled={activeStepId >= PRAYER_STEPS_DATA.length}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-30"
              >
                Rukun Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Section 2: 5 SYARAT SAH SHOLAT */}
      {selectedTab === 'syarat' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
            <strong>Kaidah Syarat Sah:</strong> Syarat sah adalah hal-hal yang wajib dipenuhi <em>sebelum</em> memulai sholat dan harus terus terjaga selama sholat berlangsung. Jika salah satu syarat gugur, sholat menjadi tidak sah.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SHOLAT_CONDITIONS.map((cond) => (
              <div
                key={`sholat_cond_${cond.number}`}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {cond.number}
                  </span>
                  <h4 className="text-sm font-black text-stone-900 dark:text-white">
                    {cond.title}
                  </h4>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {cond.desc}
                </p>
                <div className="pt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  📜 {cond.dalil}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section 3: SUNNAH AB'ADH & HAI'AH */}
      {selectedTab === 'sunnah' && (
        <div className="space-y-4">
          {/* Penjelasan Perbedaan Ab'adh & Hai'ah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-200 dark:border-emerald-800/50 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  1. Sunnah Ab'adh
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 font-bold">
                  Sujud Sahwi Bila Lupa
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Sunnah yang berkedudukan sangat kuat menyerupai rukun. Jika ditinggalkan secara sengaja atau lupa, dianjurkan menggantinya dengan <strong>Sujud Sahwi</strong> dua kali sebelum salam.
              </p>
              <ul className="text-xs text-stone-700 dark:text-stone-200 space-y-1.5 list-disc list-inside">
                <li>Tasyahhud awal pada rakaat kedua.</li>
                <li>Duduk untuk membaca tasyahhud awal.</li>
                <li>Shalawat kepada Nabi SAW pada tasyahhud awal.</li>
                <li>Shalawat kepada keluarga Nabi SAW pada tasyahhud akhir.</li>
                <li>Membaca doa Qunut pada sholat Subuh dan Witir paruh kedua Ramadhan.</li>
                <li>Berdiri saat membaca doa Qunut.</li>
                <li>Shalawat dan salam kepada Nabi, keluarga, dan sahabat dalam Qunut.</li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                  2. Sunnah Hai'ah
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 font-bold">
                  Tanpa Sujud Sahwi
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Sunnah pelengkap dan penghias sholat. Jika terlewat baik sengaja maupun lupa, sholat tetap sah dan tidak disunnahkan sujud sahwi.
              </p>
              <ul className="text-xs text-stone-700 dark:text-stone-200 space-y-1.5 list-disc list-inside">
                <li>Mengangkat tangan saat takbiratul ihram, ruku', i'tidal, dan bangun dari rakaat 2.</li>
                <li>Bersedekap meletakkan tangan kanan di atas pergelangan tangan kiri.</li>
                <li>Membaca Doa Iftitah setelah takbiratul ihram.</li>
                <li>Membaca Ta'awwudz sebelum membaca Surah Al-Fatihah.</li>
                <li>Mengucapkan "Aamiin" setelah selesai Al-Fatihah.</li>
                <li>Membaca Surah Al-Qur'an setelah Al-Fatihah pada rakaat 1 dan 2.</li>
                <li>Mengeraskan bacaan (Jahr) pada Subuh, Maghrib, Isya rakaat 1-2.</li>
                <li>Membaca Tasbih saat ruku' dan sujud (3 kali).</li>
                <li>Duduk Iftirasy saat duduk antara dua sujud & tasyahhud awal.</li>
                <li>Duduk Tawarruk saat tasyahhud akhir.</li>
                <li>Mengucapkan salam kedua ke arah kiri.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Content Section 4: TATA CARA WUDHU */}
      {selectedTab === 'wudhu' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-5">
          <div>
            <h3 className="text-base font-black text-stone-900 dark:text-white">
              6 Rukun Wudhu Wajib & Sunnah-Sunnahnya
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Standar Mazhab Syafi'i berdasarkan firman Allah Ta'ala dalam Surah Al-Ma'idah ayat 6.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WUDHU_RUKUN.map((item) => (
              <div
                key={`wudhu_rukun_${item.step}`}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                    {item.name}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 pl-7 leading-relaxed">
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
            <strong className="block text-emerald-800 dark:text-emerald-300">
              Sunnah-Sunnah Penyempurna Wudhu:
            </strong>
            <p className="leading-relaxed">
              1. Bersiwak, 2. Membaca basmalah, 3. Membasuh telapak tangan 3 kali, 4. Berkumur-kumur (madhmadhoh) & menghisap air ke hidung (istinsyaq), 5. Mengulang basuhan 3 kali (tatslith), 6. Menyela-nyela jemari dan jenggot, 7. Mengusap seluruh kepala beserta daun telinga, 8. Mendahulukan bagian kanan, 9. Muwalah (berkesinambungan tanpa jeda), 10. Menghadap kiblat dan membaca doa setelah wudhu:
            </p>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-300/40 text-right font-arabic text-sm text-stone-900 dark:text-stone-100">
              أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ
            </div>
          </div>
        </div>
      )}

      {/* Content Section 5: SHOLAT SUNNAH */}
      {selectedTab === 'sholat_sunnah' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              name: 'Sholat Dhuha',
              time: 'Mulai matahari naik setinggi tombak (±15 menit setelah syuruq) hingga menjelang waktu zawal (Dzuhur).',
              rakaat: 'Minimal 2 rakaat, utama 4 atau 8 rakaat.',
              fadhilah: 'Menjadi sedekah bagi 360 persendian tubuh dan mendatangkan kecukupan rezeki yang berkah.',
            },
            {
              name: 'Sholat Tahajjud (Qiyamullail)',
              time: 'Dilakukan pada malam hari setelah tidur, paling utama di sepertiga malam terakhir.',
              rakaat: 'Minimal 2 rakaat hingga tidak terbatas, ditutup dengan Witir.',
              fadhilah: 'Mengangkat derajat ke Maqamam Mahmuda (tempat terpuji) dan doa mustajab.',
            },
            {
              name: 'Sholat Witir',
              time: 'Setelah sholat Isya hingga sebelum terbit fajar Subuh sebagai penutup sholat malam.',
              rakaat: 'Ganjil: 1, 3, 5, 7, 9, atau 11 rakaat.',
              fadhilah: 'Sunnah muakkadah yang sangat dijaga Rasulullah SAW.',
            },
            {
              name: 'Sholat Sunnah Rawatib',
              time: 'Mengiringi sebelum (qabliyah) dan sesudah (ba\'diyah) sholat fardhu.',
              rakaat: '10–12 Rakaat Muakkad (2 Qabliyah Subuh, 2/4 Qabliyah Dzuhur, 2 Ba\'diyah Dzuhur, 2 Ba\'diyah Maghrib, 2 Ba\'diyah Isya).',
              fadhilah: 'Dibangunkan rumah/istana di surga oleh Allah Ta\'ala.',
            },
            {
              name: 'Sholat Taubat',
              time: 'Kapan saja baik siang maupun malam (di luar waktu yang diharamkan sholat).',
              rakaat: '2 Rakaat dengan memperbanyak istighfar dan penyesalan sungguh-sungguh.',
              fadhilah: 'Allah mengampuni dosa hamba-Nya yang bertaubat dengan ikhlas.',
            },
            {
              name: 'Sholat Istikharah',
              time: 'Saat menghadapi pilihan yang belum jelas kebaikannya dalam urusan halal.',
              rakaat: '2 Rakaat lalu membaca doa istikharah yang ma\'tsur.',
              fadhilah: 'Diberikan ketetapan hati dan kelapangan dalam memilih takdir terbaik.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
            >
              <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                {item.name}
              </h4>
              <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 leading-relaxed">
                <p><strong>Waktu:</strong> {item.time}</p>
                <p><strong>Jumlah Rakaat:</strong> {item.rakaat}</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  💡 {item.fadhilah}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Fiqh Disclaimer */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 leading-relaxed text-center">
        <p>
          <strong>Catatan Sanad Fiqih:</strong> Materi disusun berdasarkan Fiqh Syafi'i standar Kementerian Agama Republik Indonesia (mengacu pada Matan Safinatun Naja dan Fathul Qarib Al-Mujib). Disarankan tetap bertalaqqi langsung dengan ustadz atau guru agama terpercaya.
        </p>
      </div>
    </div>
  );
};
