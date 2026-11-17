package com.akumuslim.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import android.util.Log

/**
 * BroadcastReceiver Pemicu Alarm Adzan Android
 * Menangkap sinyal tepat waktu dari AlarmManager.setExactAndAllowWhileIdle()
 */
class AdzanAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val prayerName = intent.getStringExtra("EXTRA_PRAYER_NAME") ?: "Sholat"
        val prayerTime = intent.getStringExtra("EXTRA_PRAYER_TIME") ?: ""
        val cityName = intent.getStringExtra("EXTRA_CITY_NAME") ?: "Indonesia"
        val soundType = intent.getStringExtra("EXTRA_SOUND_TYPE") ?: "makkah"

        Log.d("AKU_MUSLIM_ALARM", "Alarm Adzan terpicu untuk sholat: $prayerName ($prayerTime) di $cityName")

        // Peroleh WakeLock singkat untuk membangunkan CPU dari kondisi Doze
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "AKUMuslim:AdzanAlarmWakeLock"
        )
        wakeLock.acquire(10 * 1000L) // 10 detik batas aman

        try {
            // Luncurkan ForegroundService agar audio dapat berbunyi meskipun layar HP terkunci
            val serviceIntent = Intent(context, AdzanForegroundService::class.java).apply {
                putExtra("EXTRA_PRAYER_NAME", prayerName)
                putExtra("EXTRA_PRAYER_TIME", prayerTime)
                putExtra("EXTRA_CITY_NAME", cityName)
                putExtra("EXTRA_SOUND_TYPE", soundType)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } finally {
            if (wakeLock.isHeld) {
                wakeLock.release()
            }
        }
    }
}
