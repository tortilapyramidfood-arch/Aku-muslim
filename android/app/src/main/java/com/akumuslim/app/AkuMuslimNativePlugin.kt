package com.akumuslim.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Plugin Jembatan Native Resmi AKU MUSLIM untuk Capacitor — TAHAP 7.3 HOTFIX
 * Menghubungkan antarmuka Web UI ke Layanan Sistem Android (AlarmManager, ForegroundService, Audio Adzan)
 */
@CapacitorPlugin(name = "AkuMuslimNative")
class AkuMuslimNativePlugin : Plugin() {

    @PluginMethod
    fun getNativeSystemStatus(call: PluginCall) {
        val context = context ?: run {
            call.reject("Android context is null")
            return
        }

        val ret = JSObject().apply {
            put("platform", "android")
            put("appId", "com.akumuslim.app")
            put("androidVersion", Build.VERSION.RELEASE)
            put("sdkInt", Build.VERSION.SDK_INT)
            put("isNativeBridgeActive", true)
            put("exactAlarmSupported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            ret.put("hasExactAlarmPermission", alarmManager.canScheduleExactAlarms())
        } else {
            ret.put("hasExactAlarmPermission", true)
        }

        call.resolve(ret)
    }

    @PluginMethod
    fun scheduleNativeAdzanAlarm(call: PluginCall) {
        val context = context ?: run {
            call.reject("Android context is null")
            return
        }

        val prayerName = call.getString("prayerName", "Sholat") ?: "Sholat"
        val prayerTime = call.getString("prayerTime", "") ?: ""
        val cityName = call.getString("cityName", "Indonesia") ?: "Indonesia"
        val triggerTimestamp = call.getLong("timestamp", System.currentTimeMillis()) ?: System.currentTimeMillis()
        val soundType = call.getString("soundType", "makkah") ?: "makkah"

        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, AdzanAlarmReceiver::class.java).apply {
                putExtra("EXTRA_PRAYER_NAME", prayerName)
                putExtra("EXTRA_PRAYER_TIME", prayerTime)
                putExtra("EXTRA_CITY_NAME", cityName)
                putExtra("EXTRA_SOUND_TYPE", soundType)
            }

            val requestCode = prayerName.hashCode()
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimestamp,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimestamp,
                    pendingIntent
                )
            }

            Log.i("AKU_MUSLIM_NATIVE", "Berhasil mendaftarkan alarm adzan native untuk $prayerName pada timestamp $triggerTimestamp")

            val result = JSObject().apply {
                put("success", true)
                put("prayerName", prayerName)
                put("scheduledTime", prayerTime)
                put("timestamp", triggerTimestamp)
            }
            call.resolve(result)
        } catch (e: Exception) {
            Log.e("AKU_MUSLIM_NATIVE", "Gagal mendaftarkan alarm adzan", e)
            call.reject("Gagal mendaftarkan alarm: ${e.message}")
        }
    }

    @PluginMethod
    fun scheduleTestAlarmInTwoMinutes(call: PluginCall) {
        val context = context ?: run {
            call.reject("Android context is null")
            return
        }

        val soundType = call.getString("soundType", "makkah") ?: "makkah"
        val testTimestamp = System.currentTimeMillis() + (120 * 1000L) // Tepat 2 Menit (120 detik) dari sekarang

        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, AdzanAlarmReceiver::class.java).apply {
                putExtra("EXTRA_PRAYER_NAME", "Uji Coba Alarm")
                putExtra("EXTRA_PRAYER_TIME", "2 Menit")
                putExtra("EXTRA_CITY_NAME", "Pengujian Native")
                putExtra("EXTRA_SOUND_TYPE", soundType)
            }

            val requestCode = 99999
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    testTimestamp,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    testTimestamp,
                    pendingIntent
                )
            }

            Log.i("AKU_MUSLIM_NATIVE", "Uji Coba Alarm 2 Menit berhasil dijadwalkan pada $testTimestamp")

            val result = JSObject().apply {
                put("success", true)
                put("triggerTimestamp", testTimestamp)
                put("secondsRemaining", 120)
                put("message", "Alarm uji 2 menit berhasil didaftarkan ke AlarmManager OS Android.")
            }
            call.resolve(result)
        } catch (e: Exception) {
            Log.e("AKU_MUSLIM_NATIVE", "Gagal menjadwalkan tes alarm 2 menit", e)
            call.reject("Gagal menjadwalkan tes: ${e.message}")
        }
    }

    @PluginMethod
    fun stopAdzanAudio(call: PluginCall) {
        val context = context ?: run {
            call.reject("Android context is null")
            return
        }

        try {
            val stopIntent = Intent(context, AdzanForegroundService::class.java).apply {
                action = "ACTION_STOP_ADZAN"
            }
            context.startService(stopIntent)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Gagal menghentikan audio: ${e.message}")
        }
    }
}
