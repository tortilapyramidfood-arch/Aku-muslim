/**
 * Quran Audio Offline Storage Service (IndexedDB Binary Store)
 * AKU MUSLIM — Penyimpanan Audio Murottal Mandiri 100% Offline
 */

export interface DownloadProgress {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  downloadedAyahs: number;
  percent: number;
  status: 'idle' | 'downloading' | 'paused' | 'completed' | 'failed';
  errorMessage?: string;
  bytesDownloaded: number;
}

export interface DownloadedSurahRecord {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  totalBytes: number;
  qariId: string;
  downloadedAt: string;
  isComplete: boolean;
}

const DB_NAME = 'AKU_MUSLIM_AUDIO_DB';
const DB_VERSION = 1;
const STORE_FILES = 'audio_files';
const STORE_METADATA = 'surah_records';

class QuranAudioStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeAbortControllers: Map<number, AbortController> = new Map();
  private downloadProgressCallbacks: Map<number, (p: DownloadProgress) => void> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB not supported in SSR'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_FILES)) {
            db.createObjectStore(STORE_FILES); // key: `${qariId}_${surah}_${ayah}`
          }
          if (!db.objectStoreNames.contains(STORE_METADATA)) {
            db.createObjectStore(STORE_METADATA, { keyPath: 'surahNumber' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    return this.dbPromise;
  }

  private getKey(qariId: string, surah: number, ayah: number): string {
    return `${qariId}_${surah}_${ayah}`;
  }

  /**
   * Cek kapasitas penyimpanan perangkat menggunakan StorageManager API
   */
  async getStorageEstimate(): Promise<{ usedMB: number; totalMB: number; percentUsed: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const usedMB = Math.round((est.usage || 0) / (1024 * 1024));
        const totalMB = Math.round((est.quota || 0) / (1024 * 1024));
        const percentUsed = totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0;
        return { usedMB, totalMB, percentUsed };
      } catch {
        // Fallback
      }
    }
    return { usedMB: 0, totalMB: 10000, percentUsed: 0 };
  }

  /**
   * Menyimpan audio satu ayat ke dalam IndexedDB
   */
  async saveAyahAudio(qariId: string, surah: number, ayah: number, buffer: ArrayBuffer): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const key = this.getKey(qariId, surah, ayah);
      const putReq = store.put(buffer, key);

      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  }

  /**
   * Mengambil audio satu ayat dari IndexedDB sebagai Blob / Object URL
   */
  async getAyahAudioUrl(qariId: string, surah: number, ayah: number): Promise<string | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const key = this.getKey(qariId, surah, ayah);
      const req = store.get(key);

      req.onsuccess = () => {
        const buffer = req.result as ArrayBuffer | undefined;
        if (buffer && buffer.byteLength > 100) {
          const blob = new Blob([buffer], { type: 'audio/mpeg' });
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  }

  /**
   * Memeriksa apakah audio satu ayat sudah tersimpan di cache offline
   */
  async isAyahAudioSaved(qariId: string, surah: number, ayah: number): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const key = this.getKey(qariId, surah, ayah);
      const req = store.count(key);

      req.onsuccess = () => resolve((req.result || 0) > 0);
      req.onerror = () => resolve(false);
    });
  }

  /**
   * Memeriksa apakah satu Surah penuh telah terunduh 100%
   */
  async isSurahFullyDownloaded(qariId: string, surah: number, totalAyahs: number): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.get(surah);

      req.onsuccess = () => {
        const record = req.result as DownloadedSurahRecord | undefined;
        if (record && record.isComplete && record.qariId === qariId) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      req.onerror = () => resolve(false);
    });
  }

  /**
   * Mengunduh satu surah secara utuh ayat demi ayat dengan verifikasi integritas
   */
  async downloadSurah(
    surahNumber: number,
    surahName: string,
    totalAyahs: number,
    qariId: string,
    baseUrl: string,
    onProgress: (p: DownloadProgress) => void
  ): Promise<boolean> {
    // Siapkan controller untuk membatalkan / menjeda
    const abortController = new AbortController();
    this.activeAbortControllers.set(surahNumber, abortController);
    this.downloadProgressCallbacks.set(surahNumber, onProgress);

    let bytesTotal = 0;
    let downloadedCount = 0;

    onProgress({
      surahNumber,
      surahName,
      totalAyahs,
      downloadedAyahs: 0,
      percent: 0,
      status: 'downloading',
      bytesDownloaded: 0,
    });

    const sStr = String(surahNumber).padStart(3, '0');

    for (let ayah = 1; ayah <= totalAyahs; ayah++) {
      if (abortController.signal.aborted) {
        onProgress({
          surahNumber,
          surahName,
          totalAyahs,
          downloadedAyahs: downloadedCount,
          percent: Math.round((downloadedCount / totalAyahs) * 100),
          status: 'paused',
          bytesDownloaded: bytesTotal,
        });
        return false;
      }

      // Cek apakah ayat ini sudah tersimpan
      const alreadySaved = await this.isAyahAudioSaved(qariId, surahNumber, ayah);
      if (alreadySaved) {
        downloadedCount++;
        onProgress({
          surahNumber,
          surahName,
          totalAyahs,
          downloadedAyahs: downloadedCount,
          percent: Math.round((downloadedCount / totalAyahs) * 100),
          status: 'downloading',
          bytesDownloaded: bytesTotal,
        });
        continue;
      }

      // Unduh file audio ayat
      const aStr = String(ayah).padStart(3, '0');
      const url = `${baseUrl}${sStr}${aStr}.mp3`;

      try {
        const response = await fetch(url, {
          signal: abortController.signal,
          headers: { Accept: 'audio/mpeg, audio/*; q=0.9' },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengunduh ayat ${ayah} (HTTP ${response.status})`);
        }

        const buffer = await response.arrayBuffer();

        // Verifikasi integritas: pastikan ukuran file wajar (> 1 KB)
        if (buffer.byteLength < 1024) {
          throw new Error(`Ukuran file ayat ${ayah} tidak wajar (${buffer.byteLength} bytes)`);
        }

        await this.saveAyahAudio(qariId, surahNumber, ayah, buffer);
        bytesTotal += buffer.byteLength;
        downloadedCount++;

        onProgress({
          surahNumber,
          surahName,
          totalAyahs,
          downloadedAyahs: downloadedCount,
          percent: Math.round((downloadedCount / totalAyahs) * 100),
          status: 'downloading',
          bytesDownloaded: bytesTotal,
        });
      } catch (err: any) {
        if (abortController.signal.aborted) {
          return false;
        }
        onProgress({
          surahNumber,
          surahName,
          totalAyahs,
          downloadedAyahs: downloadedCount,
          percent: Math.round((downloadedCount / totalAyahs) * 100),
          status: 'failed',
          errorMessage: err?.message || 'Koneksi terputus saat mengunduh',
          bytesDownloaded: bytesTotal,
        });
        return false;
      }
    }

    // Seluruh ayat selesai! Catat ke metadata
    const record: DownloadedSurahRecord = {
      surahNumber,
      surahName,
      totalAyahs,
      totalBytes: bytesTotal,
      qariId,
      downloadedAt: new Date().toISOString(),
      isComplete: true,
    };

    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_METADATA, 'readwrite');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    this.activeAbortControllers.delete(surahNumber);
    onProgress({
      surahNumber,
      surahName,
      totalAyahs,
      downloadedAyahs: totalAyahs,
      percent: 100,
      status: 'completed',
      bytesDownloaded: bytesTotal,
    });

    return true;
  }

  /**
   * Menjeda / Membatalkan proses download surah yang sedang berjalan
   */
  pauseOrCancelDownload(surahNumber: number) {
    const controller = this.activeAbortControllers.get(surahNumber);
    if (controller) {
      controller.abort();
      this.activeAbortControllers.delete(surahNumber);
    }
  }

  /**
   * Menghapus file audio satu surah penuh dari IndexedDB
   */
  async deleteSurahAudio(qariId: string, surahNumber: number, totalAyahs: number): Promise<void> {
    const db = await this.getDB();

    // Hapus dari STORE_FILES
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      for (let ayah = 1; ayah <= totalAyahs; ayah++) {
        const key = this.getKey(qariId, surahNumber, ayah);
        store.delete(key);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Hapus dari STORE_METADATA
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_METADATA, 'readwrite');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.delete(surahNumber);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Mengambil daftar seluruh surah yang telah terunduh
   */
  async getDownloadedSurahs(): Promise<DownloadedSurahRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Hapus seluruh data audio offline untuk mengosongkan memori HP
   */
  async clearAllOfflineAudio(): Promise<void> {
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_FILES).clear();
      tx.objectStore(STORE_METADATA).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const quranAudioStorage = new QuranAudioStorageService();
