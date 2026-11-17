import React, { useState, useEffect } from 'react';
import { MuhasabahEntry } from '../../types';
import { Lock, Trash2, Plus, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

const MUHASABAH_STORAGE_KEY = 'akumuslim_muhasabah_diary_v1';

export const MuhasabahDiaryModule: React.FC = () => {
  const [entries, setEntries] = useState<MuhasabahEntry[]>(() => {
    try {
      const saved = localStorage.getItem(MUHASABAH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inginDiperbaiki, setInginDiperbaiki] = useState('');
  const [niatPerbaikan, setNiatPerbaikan] = useState('');
  const [langkahKebaikan, setLangkahKebaikan] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(MUHASABAH_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [entries]);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inginDiperbaiki.trim() && !niatPerbaikan.trim() && !langkahKebaikan.trim()) {
      return;
    }

    const now = new Date();
    const entry: MuhasabahEntry = {
      id: `muh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: now.toISOString().slice(0, 10),
      inginDiperbaiki: inginDiperbaiki.trim() || 'Refleksi pribadi harian',
      niatPerbaikan: niatPerbaikan.trim() || 'Berniat memperbaiki diri karena Allah SWT',
      langkahKebaikan: langkahKebaikan.trim() || 'Menjaga kebaikan hari ini',
      createdAt: now.toISOString(),
    };

    setEntries((prev) => [entry, ...prev]);
    setInginDiperbaiki('');
    setNiatPerbaikan('');
    setLangkahKebaikan('');
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">
      {/* Jaminan Privasi Mutlak */}
      <div className="p-4 rounded-2xl bg-stone-900 text-white border border-emerald-700/50 shadow-sm space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Diary Islami / Muhasabah — 100% Privat di Perangkat Anda</span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          Catatan ini hanya tersimpan lokal di perangkat Anda untuk refleksi diri pribadi.{' '}
          <strong>Tidak</strong> ditampilkan di Dashboard Keluarga, <strong>tidak</strong> dihitung menjadi poin, dan{' '}
          <strong>tidak pernah</strong> dikirim ke AI maupun server mana pun.
        </p>
      </div>

      {/* Form Muhasabah */}
      <form
        onSubmit={handleSaveEntry}
        className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>Tulis Muhasabah Hari Ini</span>
          </h2>
          <span className="text-[11px] font-mono text-stone-400">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            1. Hal yang ingin diperbaiki
          </label>
          <textarea
            rows={2}
            value={inginDiperbaiki}
            onChange={(e) => setInginDiperbaiki(e.target.value)}
            placeholder="Contoh: Ingin lebih menjaga lisan dan datang sholat lebih awal..."
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            2. Niat perbaikan
          </label>
          <textarea
            rows={2}
            value={niatPerbaikan}
            onChange={(e) => setNiatPerbaikan(e.target.value)}
            placeholder="Contoh: Bismillah, niat bersabar dan membaca Al-Qur'an 1 halaman setelah Maghrib..."
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            3. Satu langkah kebaikan yang sudah dilakukan hari ini
          </label>
          <input
            type="text"
            value={langkahKebaikan}
            onChange={(e) => setLangkahKebaikan(e.target.value)}
            placeholder="Contoh: Membantu pekerjaan rumah dan menyapa ramah tetangga..."
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {savedBanner && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Catatan muhasabah tersimpan secara privat di perangkat ini.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Simpan Catatan Muhasabah</span>
        </button>
      </form>

      {/* Riwayat Catatan Lokal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Catatan Privat Tersimpan ({entries.length})</span>
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
            Belum ada catatan muhasabah tersimpan. Catatan Anda selalu aman di perangkat ini dan dapat dihapus kapan saja.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] font-mono font-semibold text-stone-500 dark:text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => handleDeleteEntry(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold transition-colors"
                    aria-label="Hapus catatan muhasabah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Hal yang ingin diperbaiki
                    </span>
                    <p className="mt-0.5 leading-relaxed">{item.inginDiperbaiki}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Niat perbaikan
                    </span>
                    <p className="mt-0.5 leading-relaxed">{item.niatPerbaikan}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                      Langkah kebaikan hari ini
                    </span>
                    <p className="mt-0.5 text-emerald-950 dark:text-emerald-200 font-medium">
                      {item.langkahKebaikan}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
