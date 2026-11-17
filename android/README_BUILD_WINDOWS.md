# PANDUAN KOMPILASI APK DEBUG ANDROID DI WINDOWS
**Aplikasi:** AKU MUSLIM (*Sahabat Ibadah Setiap Hari*)  
**Package Name:** `com.akumuslim.app`  
**Status APK Saat Ini:** **NOT BUILT** (Proyek native dan source code siap kompilasi; proses build membutuhkan Android Studio di laptop/PC Owner).

---

## 1. PERSYARATAN SISTEM (WINDOWS 10 / 11)

1. **Android Studio**: Unduh dan pasang versi terbaru (Android Studio Iguana, Jellyfish, atau Ladybug) dari situs resmi:  
   `https://developer.android.com/studio`
2. **JDK (Java Development Kit)**: Minimal OpenJDK 17 (sudah termasuk secara otomatis dalam instalasi Android Studio).
3. **Android SDK Platform**:
   - Android SDK Platform 35 (Android 15)
   - Android SDK Build-Tools 35.0.0
   - Android SDK Command-line Tools
4. **Node.js**: Versi 20 LTS atau 22 LTS (tersedia di `nodejs.org`).

---

## 2. LANGKAH-LANGKAH BUILD APK DEBUG DI WINDOWS

### Langkah 1: Siapkan Web Assets (Distribusi Frontend)
Buka terminal **Command Prompt (cmd)** atau **PowerShell** di folder proyek AKU MUSLIM, lalu jalankan:

```bash
# 1. Pastikan seluruh dependensi terpasang
npm install

# 2. Lakukan build web production (Vite)
npm run build

# 3. Sinkronisasikan bundle web ke folder android Capacitor
npx cap sync android
```

Folder `dist/` akan otomatis disalin ke dalam aset Android `android/app/src/main/assets/public/`.

---

### Langkah 2: Buka Proyek di Android Studio
1. Buka aplikasi **Android Studio** di Windows.
2. Pilih menu **File > Open...**
3. Arahkan dan pilih folder `android` (lokasi file `android/build.gradle` dan `settings.gradle`).
4. Tunggu hingga proses **Gradle Sync** selesai secara otomatis (memerlukan koneksi internet pertama kali untuk mengunduh library Gradle).

---

### Langkah 3: Kompilasi APK Debug untuk Pengujian Internal
1. Di menu atas Android Studio, klik:  
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Tunggu proses kompilasi hingga muncul notifikasi balon di pojok kanan bawah:  
   `APK(s) generated successfully for 1 module: 'app'. locate`
3. Klik tautan **locate** untuk membuka folder file APK yang dihasilkan:  
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. CARA INSTALASI APK KE HP ANDROID OWNER (INTERNAL TESTING)

### Opsi A: Melalui Kabel Data USB (Paling Cepat & Direkomendasikan)
1. Di HP Android Owner (Samsung / Xiaomi / Oppo / Vivo):
   - Buka **Pengaturan > Tentang Ponsel**.
   - Ketuk **Nomor Bentukan (Build Number)** sebanyak 7 kali hingga muncul pesan *"Anda sekarang adalah pengembang!"*.
   - Buka **Pengaturan Tambahan / Opsi Pengembang (Developer Options)**, lalu aktifkan **Debugging USB (USB Debugging)**.
2. Sambungkan HP ke laptop Windows menggunakan kabel USB.
3. Di Command Prompt laptop, ketik:
   ```bash
   adb devices
   ```
   *(Pastikan nama HP Anda terdeteksi)*
4. Pasang APK secara langsung:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Opsi B: Melalui Google Drive / WhatsApp Web
1. Unggah file `app-debug.apk` ke Google Drive Anda atau kirim ke chat WhatsApp diri sendiri.
2. Buka dan unduh file APK tersebut langsung di HP.
3. Saat muncul peringatan *"Demi keamanan, ponsel Anda tidak diizinkan memasang aplikasi yang tidak dikenal dari sumber ini"*:
   - Ketuk **Setelan (Settings)**.
   - Aktifkan sakelar **"Izinkan dari sumber ini"**.
   - Ketuk **Pasang (Install)**.

---

## 4. PENGUJIAN 15 SKENARIO ADZAN PADA HP FISIK

Setelah aplikasi terpasang di HP fisik, jalankan 15 skenario pengujian berikut dan catat hasilnya:

1. **Aplikasi Terbuka (Foreground)**: Putar adzan, dengarkan suara keluar jelas dari speaker.
2. **Aplikasi Diminimalkan (Background)**: Masuk waktu sholat saat HP digunakan membuka aplikasi lain.
3. **Layar Mati / Terkunci (Screen Lock)**: Layar HP mati saat waktu sholat tiba. Suara adzan wajib tetap berkumandang.
4. **Doze Mode (HP Diletakkan Diam > 30 Menit)**: Pastikan aplikasi sudah diatur ke *"Tidak Dibatasi / No Restrictions"* pada pengaturan baterai vendor (Samsung/Xiaomi/Oppo/Vivo).
5. **Mode Hemat Baterai Aktif**: Periksa apakah notifikasi tetap muncul.
6. **Aplikasi Ditutup dari Recent Apps (Swipe Kill)**: Periksa alarm berikutnya.
7. **HP Direstart / Dinyalakan Ulang**: BootReceiver akan mendaftarkan ulang jadwal sholat secara otomatis tanpa perlu membuka aplikasi terlebih dahulu.
8. **Perpindahan Lokasi GPS**: Pindah kota dan periksa apakah jadwal sholat berubah sesuai koordinat baru.
9. **Perubahan Zona Waktu (WIB ke WITA/WIT)**: Jadwal sholat dan hitung mundur menyesuaikan otomatis.
10. **Mode Pesawat (Offline Mode)**: Al-Qur'an, jadwal sholat lokal, dan kompas kiblat tetap berfungsi tanpa internet.
11. **Izin Notifikasi Ditolak**: Aplikasi memberikan pesan ramah dan mengarahkan pengguna ke pengaturan.
12. **Izin Exact Alarm Dicabut**: Aplikasi menampilkan peringatan bahwa alarm mungkin mengalami penundaan jika izin tidak aktif.
13. **Audio Adzan Berakhir**: MediaPlayer melepaskan memori dan menghentikan status Foreground Service dengan bersih.
14. **Ganti Suara Adzan**: Pilih antara Makkah, Madinah, atau Beep di menu pengaturan.
15. **Uji Smart Hifz**: Coba lafalkan surah pendek (Al-Fatihah/Al-Ikhlas) dengan mikrofon HP.

---

## 5. CATATAN KEAMANAN & KEBIJAKAN
- Jangan membagikan file APK debug ini ke publik.
- APK ini adalah build **Internal Staging / Testing**.
- Tidak ada Google Play Services tracking atau telemetry tersembunyi.
- Seluruh hisab astronomis sholat dan kompas arah kiblat berjalan 100% lokal pada perangkat.
