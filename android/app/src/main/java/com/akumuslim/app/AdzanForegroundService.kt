package com.akumuslim.app

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.res.AssetFileDescriptor
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.media.ToneGenerator
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service Pemutaran Kumandang Adzan Android — TAHAP 7.3 HOTFIX
 * Menjamin adzan tetap berbunyi tepat waktu saat layar HP terkunci / Sleep / Doze Mode
 * dengan fallback bertingkat (Local Audio -> System Alarm Ringtone -> ToneGenerator).
 */
class AdzanForegroundService : Service() {

    private var mediaPlayer: MediaPlayer? = null
    private var toneGenerator: ToneGenerator? = null
    private val NOTIFICATION_ID = 1001

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prayerName = intent?.getStringExtra("EXTRA_PRAYER_NAME") ?: "Sholat"
        val prayerTime = intent?.getStringExtra("EXTRA_PRAYER_TIME") ?: ""
        val cityName = intent?.getStringExtra("EXTRA_CITY_NAME") ?: "Indonesia"
        val soundType = intent?.getStringExtra("EXTRA_SOUND_TYPE") ?: "makkah"

        if (intent?.action == "ACTION_STOP_ADZAN") {
            Log.i("AKU_MUSLIM_SERVICE", "Menerima sinyal Hentikan Suara Adzan.")
            stopAdzanPlayback()
            stopSelf()
            return START_NOT_STICKY
        }

        // 1. Buat NotificationChannel resmi
        NotificationHelper.createNotificationChannels(this)

        // 2. PendingIntent untuk membuka aplikasi saat notifikasi diketuk
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            this.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingOpenApp = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Tombol Aksi "Hentikan Suara" pada notifikasi adzan
        val stopIntent = Intent(this, AdzanForegroundService::class.java).apply {
            action = "ACTION_STOP_ADZAN"
        }
        val pendingStop = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 4. Bangun Notifikasi Foreground Prioritas Tinggi
        val notification: Notification = NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ADZAN_ID)
            .setContentTitle("Waktu Sholat $prayerName Telah Tiba ($prayerTime)")
            .setContentText("Panggilan sholat untuk wilayah $cityName dan sekitarnya.")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingOpenApp)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_media_pause, "Hentikan Suara", pendingStop)
            .setAutoCancel(true)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        // 5. Putar Audio Adzan dengan Arsitektur Tangguh Multi-Level
        if (soundType != "silent") {
            playAudioAdzanResilient(soundType)
        } else {
            Handler(Looper.getMainLooper()).postDelayed({
                stopSelf()
            }, 10000L)
        }

        return START_NOT_STICKY
    }

    private fun playAudioAdzanResilient(soundType: String) {
        stopAdzanPlayback()

        // Level 1: Coba resource raw jika tersedia
        val rawResName = when (soundType) {
            "madinah" -> "adzan_madinah"
            "beep" -> "beep_chime"
            else -> "adzan_makkah"
        }
        val rawResId = resources.getIdentifier(rawResName, "raw", packageName)

        if (rawResId != 0) {
            try {
                mediaPlayer = MediaPlayer.create(this, rawResId).apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .build()
                    )
                    setOnCompletionListener {
                        Log.i("AKU_MUSLIM_SERVICE", "Kumandang adzan selesai diputar.")
                        stopAdzanPlayback()
                        stopSelf()
                    }
                    start()
                }
                Log.i("AKU_MUSLIM_SERVICE", "Berhasil memutar audio adzan dari raw/$rawResName")
                return
            } catch (e: Exception) {
                Log.w("AKU_MUSLIM_SERVICE", "Gagal memutar raw audio: ${e.message}, beralih ke Level 2")
            }
        }

        // Level 2: Coba muat dari Assets folder
        try {
            val assetPath = "public/audio/$rawResName.mp3"
            val afd: AssetFileDescriptor = assets.openFd(assetPath)
            mediaPlayer = MediaPlayer().apply {
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
                prepare()
                setOnCompletionListener {
                    stopAdzanPlayback()
                    stopSelf()
                }
                start()
            }
            Log.i("AKU_MUSLIM_SERVICE", "Berhasil memutar audio adzan dari asset: $assetPath")
            return
        } catch (e: Exception) {
            Log.w("AKU_MUSLIM_SERVICE", "Gagal memutar dari asset: ${e.message}, beralih ke Level 3 Ringtone Alarm Sistem")
        }

        // Level 3: Fallback ke System Alarm Ringtone
        try {
            val alarmUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            mediaPlayer = MediaPlayer().apply {
                setDataSource(this@AdzanForegroundService, alarmUri)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
                prepare()
                setOnCompletionListener {
                    stopAdzanPlayback()
                    stopSelf()
                }
                start()
            }
            Log.i("AKU_MUSLIM_SERVICE", "Berhasil memutar nada alarm sistem Android.")
            return
        } catch (e: Exception) {
            Log.w("AKU_MUSLIM_SERVICE", "Gagal memutar ringtone sistem: ${e.message}, beralih ke Level 4 ToneGenerator")
        }

        // Level 4: Ultimate Fallback menggunakan ToneGenerator Alarm
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100).apply {
                startTone(ToneGenerator.TONE_CDMA_HIGH_L, 10000) // Bunyi 10 detik
            }
            Log.i("AKU_MUSLIM_SERVICE", "Memutar alarm darurat via ToneGenerator.")
            Handler(Looper.getMainLooper()).postDelayed({
                stopAdzanPlayback()
                stopSelf()
            }, 10000L)
        } catch (e: Exception) {
            Log.e("AKU_MUSLIM_SERVICE", "Seluruh mekanisme pemutaran adzan gagal: ${e.message}")
            stopSelf()
        }
    }

    private fun stopAdzanPlayback() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            // safe ignore
        }

        try {
            toneGenerator?.let {
                it.stopTone()
                it.release()
            }
            toneGenerator = null
        } catch (e: Exception) {
            // safe ignore
        }
    }

    override fun onDestroy() {
        stopAdzanPlayback()
        super.onDestroy()
    }
}
