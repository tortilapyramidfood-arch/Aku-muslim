import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateQibla } from '../../services/qiblaService';
import { X, Navigation, AlertCircle, Compass as CompassIcon, RotateCw } from 'lucide-react';

export const QiblaModal: React.FC = () => {
  const { showQiblaModal, setShowQiblaModal, selectedCity } = useApp();
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(true);
  const [calibrationNotice, setCalibrationNotice] = useState<boolean>(false);

  const qiblaResult = calculateQibla(selectedCity.latitude, selectedCity.longitude);

  useEffect(() => {
    if (!showQiblaModal) return;

    let sensorFound = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        sensorFound = true;
        setDeviceHeading((e as unknown as { webkitCompassHeading: number }).webkitCompassHeading);
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        // Android / standard compass (alpha: 0 to 360)
        sensorFound = true;
        setDeviceHeading(360 - e.alpha);
        setHasCompassSensor(true);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    const timeout = setTimeout(() => {
      if (!sensorFound) {
        setHasCompassSensor(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [showQiblaModal]);

  if (!showQiblaModal) return null;

  // Bearing of Qibla relative to current device heading
  const needleRotation = deviceHeading !== null
    ? (qiblaResult.bearingDegrees - deviceHeading + 360) % 360
    : qiblaResult.bearingDegrees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Arah Kiblat Menuju Ka'bah
            </h2>
          </div>
          <button
            onClick={() => setShowQiblaModal(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Location info */}
          <div className="text-center mb-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">Lokasi Acuan:</p>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
              {selectedCity.name} ({selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}°)
            </p>
          </div>

          {/* Compass Dial Container */}
          <div className="relative w-64 h-64 my-2 flex items-center justify-center">
            {/* Outer Compass Ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 shadow-inner flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: deviceHeading !== null ? `rotate(${-deviceHeading}deg)` : undefined,
              }}
            >
              {/* Cardinal markings */}
              <span className="absolute top-2 text-xs font-black text-rose-600">U</span>
              <span className="absolute bottom-2 text-xs font-bold text-stone-400">S</span>
              <span className="absolute right-3 text-xs font-bold text-stone-400">T</span>
              <span className="absolute left-3 text-xs font-bold text-stone-400">B</span>

              {/* Angle ticks */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-1 h-3 bg-stone-300 dark:bg-stone-600 top-1"
                  style={{
                    transformOrigin: '50% 124px',
                    transform: `rotate(${deg}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Qibla Needle Pointer */}
            <div
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
              style={{
                transform: `rotate(${needleRotation}deg)`,
              }}
            >
              {/* Kaaba indicator icon at tip */}
              <div className="absolute top-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shadow-md border border-amber-300">
                  <Navigation className="w-4 h-4 fill-amber-300 text-amber-300 transform -rotate-45" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-stone-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Ka'bah
                </span>
              </div>

              {/* Needle center pin */}
              <div className="w-4 h-4 rounded-full bg-emerald-700 border-2 border-white shadow-md z-10" />
            </div>
          </div>

          {/* Degrees readout */}
          <div className="mt-4 text-center">
            <span className="text-3xl font-black text-emerald-950 dark:text-emerald-200 tabular-nums">
              {qiblaResult.bearingFormatted}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
              dari Utara ({qiblaResult.compassCardinal}) · Jarak: {qiblaResult.distanceFormatted}
            </span>
          </div>

          {/* Sensor status warning if desktop / unavailable */}
          {!hasCompassSensor && (
            <div className="mt-5 w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sensor Kompas Belum Terdeteksi</p>
                <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-400">
                  Arahkan bagian atas HP ke sudut <strong>{qiblaResult.bearingFormatted}</strong> dari arah Utara kompas Anda.
                </p>
              </div>
            </div>
          )}

          {/* Calibration button */}
          <button
            onClick={() => setCalibrationNotice(!calibrationNotice)}
            className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-medium"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Petunjuk Kalibrasi Sensor HP</span>
          </button>

          {calibrationNotice && (
            <div className="mt-2 p-3 w-full text-xs bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300 space-y-1">
              <p>• Gerakkan HP membentuk angka <strong>8 (delapan)</strong> di udara selama 5 detik.</p>
              <p>• Jauhkan HP dari benda logam magnetik atau casing bermagnet tebal.</p>
              <p>• Letakkan HP di atas permukaan datar agar akurasi maksimal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
