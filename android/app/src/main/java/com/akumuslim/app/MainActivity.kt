package com.akumuslim.app

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.BridgeActivity

/**
 * Aktivitas Utama AKU MUSLIM Android Native
 * Menjembatani WebView Capacitor dengan Layanan Sistem Android (Alarm, Suara, Sensor)
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 0. Daftarkan Plugin Bridge Native Resmi AKU MUSLIM
        registerPlugin(AkuMuslimNativePlugin::class.java)

        // 1. Inisialisasi Saluran Notifikasi Android 8.0+
        NotificationHelper.createNotificationChannels(this)

        // 2. Minta Izin Runtime Notifikasi untuk Android 13+ (API 33+)
        checkAndRequestNotificationPermission()

        // 3. Periksa Izin Exact Alarm untuk Android 12+ (API 31+)
        checkExactAlarmPermission()
    }

    private fun checkAndRequestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permission = Manifest.permission.POST_NOTIFICATIONS
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(permission), 101)
            }
        }
    }

    private fun checkExactAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (!alarmManager.canScheduleExactAlarms()) {
                // Pengguna dapat diarahkan ke halaman pengaturan exact alarm sistem
                // Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName"))
            }
        }
    }
}
