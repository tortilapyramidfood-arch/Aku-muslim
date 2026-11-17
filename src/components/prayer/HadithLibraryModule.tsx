import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ShieldCheck,
  Copy,
} from 'lucide-react';

export interface HadithItem {
  id: string;
  category: string;
  title: string;
  arabic: string;
  translation: string;
  bookName: string;
  hadithNumber: string;
  narrator: string;
  grade: 'Shahih' | 'Hasan';
  briefExplanation: string;
}

export const VERIFIED_HADITH_COLLECTION: HadithItem[] = [
  {
    id: 'h_1',
    category: 'Niat & Keikhlasan',
    title: 'Segala Amal Bergantung Pada Niat',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
    translation: 'Sesungguhnya setiap amalan tergantung pada niatnya. Dan setiap orang akan mendapatkan sesuai dengan apa yang ia niatkan. Maka barangsiapa yang hijrahnya karena dunia yang ingin ia raih atau karena wanita yang ingin ia nikahi, maka hijrahnya itu kepada apa yang ia tuju.',
    bookName: 'Shahih Bukhari & Shahih Muslim',
    hadithNumber: 'Bukhari no. 1 & Muslim no. 1907',
    narrator: 'Umar bin Khaththab radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Hadis landasan utama syariat yang menegaskan bahwa diterimanya pahala ibadah disyaratkan niat yang ikhlas semata-mata karena Allah SWT.',
  },
  {
    id: 'h_2',
    category: 'Akhlak & Kejujuran',
    title: 'Kejujuran Membimbing Menuju Kebaikan dan Surga',
    arabic: 'عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ، وَمَا يَزَالُ الرَّجُلُ يَصْدُقُ وَيَتَحَرَّى الصِّدْقَ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ صِدِّيقًا',
    translation: 'Wajib atas kalian untuk senantiasa jujur, karena sesungguhnya kejujuran itu membimbing kepada kebaikan, dan kebaikan membimbing ke surga. Dan senantiasalah seseorang berbuat jujur dan memilih kejujuran sampai ia dicatat di sisi Allah sebagai orang yang sangat jujur (shiddiq).',
    bookName: 'Shahih Muslim',
    hadithNumber: 'Muslim no. 2607',
    narrator: 'Abdullah bin Mas\'ud radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Menjaga kejujuran dalam lisan dan perbuatan membuka pintu taufik menuju seluruh cabang amal saleh dan keselamatan akhirat.',
  },
  {
    id: 'h_3',
    category: 'Sholat & Tiang Agama',
    title: 'Sholat Lima Waktu Pembersih Dosa',
    arabic: 'أَرَأَيْتُمْ لَوْ أَنَّ نَهْرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟ قَالُوا: لاَ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ. قَالَ: فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا',
    translation: 'Bagaimanakah pendapat kalian jika di depan pintu rumah salah seorang di antara kalian ada sungai yang mengalir, lalu ia mandi di sana lima kali sehari, apakah masih ada kotoran yang tersisa pada tubuhnya? Para sahabat menjawab: Tidak tersisa sedikit pun kotoran. Beliau bersabda: Begitulah perumpamaan sholat lima waktu, dengannya Allah menghapus dosa-dosa.',
    bookName: 'Shahih Bukhari & Shahih Muslim',
    hadithNumber: 'Bukhari no. 528 & Muslim no. 667',
    narrator: 'Abu Hurairah radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Menjaga sholat fardhu berjamaah dan tepat waktu secara konsisten menghapuskan dosa-dosa kecil di antara waktu sholat tersebut.',
  },
  {
    id: 'h_4',
    category: 'Orang Tua & Keluarga',
    title: 'Keutamaan Berbakti Kepada Ibu dan Ayah',
    arabic: 'جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أَبُوكَ',
    translation: 'Seseorang datang kepada Rasulullah shallallahu \'alaihi wa sallam lalu bertanya: Wahai Rasulullah, siapakah orang yang paling berhak aku pergauli dengan baik? Beliau menjawab: Ibumu. Orang itu bertanya lagi: Kemudian siapa? Beliau menjawab: Ibumu. Orang itu bertanya lagi: Kemudian siapa? Beliau menjawab: Ibumu. Orang itu bertanya lagi: Kemudian siapa? Beliau menjawab: Kemudian ayahmu.',
    bookName: 'Shahih Bukhari & Shahih Muslim',
    hadithNumber: 'Bukhari no. 5971 & Muslim no. 2548',
    narrator: 'Abu Hurairah radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Kedudukan ibu dalam bakti anak ditegaskan tiga kali lebih besar karena beratnya masa mengandung, melahirkan, dan menyusui.',
  },
  {
    id: 'h_5',
    category: 'Sedekah & Kasih Sayang',
    title: 'Senyuman dan Kata yang Baik Adalah Sedekah',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ، وَأَمْرُكَ بِالْمَعْرُوفِ وَنَهْيُكَ عَنِ الْمُنْكَرِ صَدَقَةٌ، وَإِرْشَادُكَ الرَّجُلَ فِي أَرْضِ الضَّلَالِ لَكَ صَدَقَةٌ',
    translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu, ajakanmu kepada kebaikan dan laranganmu dari kemungkaran adalah sedekah bagimu, dan petunjukmu kepada seseorang yang tersesat di jalan adalah sedekah bagimu.',
    bookName: 'Sunan Tirmidzi',
    hadithNumber: 'Tirmidzi no. 1956',
    narrator: 'Abu Dzar radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Sedekah tidak terbatas pada materi harta kekayaan; kehangatan budi pekerti, senyuman tulus, dan bantuan tenaga dinilai berharga di sisi Allah.',
  },
  {
    id: 'h_6',
    category: 'Menuntut Ilmu',
    title: 'Kemudahan Jalan Menuju Surga Bagi Penuntut Ilmu',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Barangsiapa menempuh suatu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.',
    bookName: 'Shahih Muslim',
    hadithNumber: 'Muslim no. 2699',
    narrator: 'Abu Hurairah radhiyallahu \'anhu',
    grade: 'Shahih',
    briefExplanation: 'Menuntut ilmu agama yang bermanfaat, mempelajari Al-Qur\'an dan sunnah mengantarkan penuntutnya kepada petunjuk dan ampunan ilahi.',
  },
];

export const HadithLibraryModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('akumuslim_bookmarked_hadiths');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = ['all', ...Array.from(new Set(VERIFIED_HADITH_COLLECTION.map((h) => h.category)))];

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('akumuslim_bookmarked_hadiths', JSON.stringify(updated));
  };

  const handleCopyHadith = (hadith: HadithItem) => {
    const text = `${hadith.title}\n\n${hadith.arabic}\n\n"${hadith.translation}"\n\n(HR. ${hadith.bookName} - ${hadith.hadithNumber})\nPerawi: ${hadith.narrator} [Status: ${hadith.grade}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHadiths = VERIFIED_HADITH_COLLECTION.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.narrator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arabic.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      {/* Search & Categories Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hadis (niat, kejujuran, orang tua, sholat, ilmu)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
              }`}
            >
              {cat === 'all' ? `Semua Hadis (${VERIFIED_HADITH_COLLECTION.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hadith List */}
      <div className="space-y-4">
        {filteredHadiths.map((hadith) => {
          const isBookmarked = bookmarkedIds.includes(hadith.id);
          const isCopied = copiedId === hadith.id;

          return (
            <div
              key={hadith.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 hover:border-emerald-400 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {hadith.category}
                  </span>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white mt-1">
                    {hadith.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyHadith(hadith)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600"
                    title="Salin Hadis"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleBookmark(hadith.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600"
                    title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Hadis'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-right">
                <p className="font-arabic text-xl sm:text-2xl text-emerald-950 dark:text-emerald-200 leading-loose">
                  {hadith.arabic}
                </p>
              </div>

              {/* Translation */}
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                "{hadith.translation}"
              </p>

              {/* Brief Explanation */}
              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                <strong>Pelajaran Hadis:</strong> {hadith.briefExplanation}
              </div>

              {/* Footer Citations */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {hadith.bookName} ({hadith.hadithNumber}) · Perawi: {hadith.narrator}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  Derajat: {hadith.grade}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
