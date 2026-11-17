package com.akumuslim.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

/**
 * Pengelola Saluran Notifikasi (NotificationChannel) Resmi Android 8.0+ (API 26+)
 * AKU MUSLIM — Memisahkan Saluran Adzan Keras, Pengingat 10 Menit, dan Dzikir
 */
object NotificationHelper {

    const val CHANNEL_ADZAN_ID = "adzan_alarm_channel"
    const val CHANNEL_REMINDER_ID = "sholat_reminder_channel"
    const val CHANNEL_DHIKR_ID = "daily_dhikr_channel"

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Saluran Prioritas Tinggi: Panggilan Adzan Wajib (Bypass DND / Layar Terkunci)
            val adzanChannel = NotificationChannel(
                CHANNEL_ADZAN_ID,
                "Panggilan Adzan & Waktu Sholat",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifikasi kumandang adzan bersuara ketika tiba waktu sholat fardhu."
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setBypassDnd(true)
            }

            // 2. Saluran Pengingat Lembut (10 Menit Sebelum Waktu Sholat & Waktu Imsak)
            val reminderChannel = NotificationChannel(
                CHANNEL_REMINDER_ID,
                "Pengingat Menjelang Waktu Sholat",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Peringatan 10 menit sebelum masuk waktu sholat dan waktu imsak."
                enableVibration(true)
            }

            // 3. Saluran Dzikir Harian Pagi & Petang
            val dhikrChannel = NotificationChannel(
                CHANNEL_DHIKR_ID,
                "Dzikir Pagi & Petang",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Pengingat doa dan dzikir harian setelah Subuh dan Ashar."
                enableVibration(false)
            }

            notificationManager.createNotificationChannel(adzanChannel)
            notificationManager.createNotificationChannel(reminderChannel)
            notificationManager.createNotificationChannel(dhikrChannel)
        }
    }
}
