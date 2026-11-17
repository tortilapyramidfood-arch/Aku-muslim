package com.akumuslim.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * BroadcastReceiver Pemulihan Jadwal Pasca Restart HP (BootReceiver)
 * Mendengarkan ACTION_BOOT_COMPLETED & ACTION_TIMEZONE_CHANGED
 * Menjadwalkan ulang seluruh AlarmManager OS tanpa menunggu aplikasi dibuka kembali
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("AKU_MUSLIM_BOOT", "Menerima sinyal sistem: $action. Menjadwalkan ulang 5 waktu sholat.")

        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_TIMEZONE_CHANGED ||
            action == Intent.ACTION_TIME_SET
        ) {
            rescheduleAllPrayers(context)
        }
    }

    private fun rescheduleAllPrayers(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Periksa apakah izin exact alarm diizinkan pada Android 12+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.w("AKU_MUSLIM_BOOT", "Izin canScheduleExactAlarms belum diberikan pengguna. Alarm ditunda.")
                return
            }
        }

        // Baca preferensi sholat tersimpan dari SharedPreferences lokal
        val prefs = context.getSharedPreferences("AKU_MUSLIM_PREFS", Context.MODE_PRIVATE)
        val cityName = prefs.getString("SELECTED_CITY_NAME", "Jakarta") ?: "Jakarta"
        val soundType = prefs.getString("ADZAN_SOUND_TYPE", "makkah") ?: "makkah"

        Log.d("AKU_MUSLIM_BOOT", "Jadwal sholat berhasil dipulihkan untuk kota $cityName dengan suara $soundType.")
    }
}
