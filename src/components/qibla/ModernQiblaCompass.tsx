import React, { useState, useEffect } from 'react';
import { PRAYER_CITIES } from '../../services/prayerTimeService';
import {
  Compass,
  MapPin,
  RefreshCw,
  Info,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface ModernQiblaCompassProps {
  onClose?: () => void;
}

export const ModernQiblaCompass: React.FC<ModernQiblaCompassProps> = ({ onClose }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('jakarta');
  const [heading, setHeading] = useState<number>(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(true);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);
  const [showCalibrationGuide, setShowCalibrationGuide] = useState<boolean>(false);

  // Selected city & Qibla math
  const city = PRAYER_CITIES.find((c) => c.id === selectedCityId) || PRAYER_CITIES[0];

  // Coordinates of Ka'bah (Makkah): 21.4225° N, 39.8262° E
  const MAKKAH_LAT = 21.4225;
  const MAKKAH_LNG = 39.8262;

  // Calculate distance using Haversine formula
  const calculateDistanceToMakkah = (lat: number, lng: number): number => {
    const R = 6371; // Earth radius in KM
    const dLat = ((MAKKAH_LAT - lat) * Math.PI) / 180;
    const dLon = ((MAKKAH_LNG - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((MAKKAH_LAT * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Calculate Qibla bearing from True North
  const calculateQiblaBearing = (lat: number, lng: number): number => {
    const lat1 = (lat * Math.PI) / 180;
    const lat2 = (MAKKAH_LAT * Math.PI) / 180;
    const dLon = ((MAKKAH_LNG - lng) * Math.PI) / 180;

    const y = Math.sin(dLon);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = (qiblaRad * 180) / Math.PI;
    return Math.round((qiblaDeg + 360) % 360);
  };

  const cityLat = city.lat ?? city.latitude;
  const cityLng = city.lng ?? city.longitude;
  const distanceKm = calculateDistanceToMakkah(cityLat, cityLng);
  const qiblaAngle = calculateQiblaBearing(cityLat, cityLng);

  // Device orientation listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      if ('webkitCompassHeading' in e && typeof (e as any).webkitCompassHeading === 'number') {
        compassHeading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha;
      }

      if (compassHeading !== null) {
        setHeading(Math.round(compassHeading));
        setIsSensorAvailable(true);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setIsSensorAvailable(false);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Needle angle relative to device
  const relativeAngle = Math.round((qiblaAngle - heading + manualAdjustment + 360) % 360);
  const isAligned = Math.abs(relativeAngle) < 4 || Math.abs(relativeAngle - 360) < 4;

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-10">
      {/* 1. TOP WORLD MAP SECTION WITH GEODESIC ARC (MATCHING SCREENSHOT 4) */}
      <div className="rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md bg-emerald-950/20 relative">
        {/* World Map SVG representation with Great-Circle Arc from Indonesia to Makkah */}
        <div className="relative h-44 bg-[#d8f0ea] dark:bg-[#0f2822] overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 160">
            {/* Minimalist World Map Continents */}
            <path
              d="M 50,40 Q 90,30 130,45 Q 160,70 120,95 Q 80,110 50,70 Z"
              fill="#b2dfdb"
              opacity="0.5"
            />
            <path
              d="M 230,65 Q 260,50 300,55 Q 350,70 330,105 Q 270,115 240,85 Z"
              fill="#b2dfdb"
              opacity="0.6"
            />
            {/* Southeast Asia (Indonesia) landmass */}
            <path
              d="M 310,100 Q 330,95 360,110 Q 350,130 320,120 Z"
              fill="#80cbc4"
              opacity="0.8"
            />

            {/* Geodesic dashed arc line from Indonesia (330, 110) to Makkah (160, 60) */}
            <path
              d="M 330,110 Q 240,40 160,60"
              fill="none"
              stroke="#047857"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="animate-pulse"
            />

            {/* User Location Marker (Green Dot in Indonesia) */}
            <circle cx="330" cy="110" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

            {/* Ka'bah Icon Marker in Makkah */}
            <g transform="translate(150, 48)">
              <rect width="18" height="18" rx="3" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <line x1="2" y1="5" x2="16" y2="5" stroke="#fbbf24" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Left Pill: Distance to Makkah */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs border border-stone-200 dark:border-stone-700 shadow-xs">
            <span className="font-mono text-xs font-black text-stone-900 dark:text-white block">
              {distanceKm.toLocaleString('id-ID')} KM
            </span>
            <span className="text-[9px] text-stone-500 block">Jarak dari Mekkah</span>
          </div>

          {/* Right Pill: Qibla Angle */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs border border-stone-200 dark:border-stone-700 shadow-xs text-right">
            <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 block">
              {qiblaAngle}°
            </span>
            <span className="text-[9px] text-stone-500 block">Sudut Perangkat ke Qibla</span>
          </div>
        </div>

        {/* City Bar below Map */}
        <div className="p-2.5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 text-stone-800 dark:text-stone-200 focus:outline-hidden cursor-pointer"
            >
              {PRAYER_CITIES.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-stone-800">
                  {c.name} ({(c.lat ?? c.latitude).toFixed(2)}°, {(c.lng ?? c.longitude).toFixed(2)}°)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCalibrationGuide(!showCalibrationGuide)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Kalibrasi Sensor</span>
          </button>
        </div>
      </div>

      {/* Calibration Guide Alert */}
      {showCalibrationGuide && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Petunjuk Kalibrasi Kompas (Gerakan Angka Delapan):</span>
          </div>
          <p className="leading-relaxed">
            Pegang ponsel Anda dan gerakkan di udara membentuk pola angka 8 (delapan) sebanyak 2–3 kali untuk menyelaraskan sensor kompas magnetik dengan medan magnet bumi.
          </p>
        </div>
      )}

      {/* 2. LUXURIOUS GOLDEN 3D COMPASS WITH KA'BAH TARGET (EXACT SCREENSHOT 4 DESIGN) */}
      <div className="flex flex-col items-center justify-center py-4">
        {/* Ka'bah Pointer Arrow at Top of Compass */}
        <div className="flex flex-col items-center mb-1 animate-bounce">
          <div className="w-9 h-9 rounded-xl bg-stone-900 border-2 border-amber-400 flex items-center justify-center shadow-md">
            <span className="font-arabic text-amber-300 text-xs font-bold">كعبة</span>
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-amber-500" />
        </div>

        {/* Compass Outer Bezel */}
        <div
          className={`relative w-72 h-72 rounded-full border-8 shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isAligned
              ? 'border-emerald-500 ring-8 ring-emerald-400/30 shadow-emerald-500/20'
              : 'border-amber-400 dark:border-amber-500/80 shadow-amber-500/10'
          } bg-gradient-to-b from-[#fefbf3] via-[#f7ecd5] to-[#ebd8af] dark:from-[#262117] dark:via-[#1e1910] dark:to-[#17130a]`}
        >
          {/* Compass Dial Face with Degree Marks */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${-heading}deg)` }}
            viewBox="0 0 280 280"
          >
            {/* Cardinal Direction Letters */}
            <text x="140" y="32" textAnchor="middle" fill="#b91c1c" fontWeight="bold" fontSize="16">
              N
            </text>
            <text x="252" y="146" textAnchor="middle" fill="#78350f" fontWeight="bold" fontSize="16">
              E
            </text>
            <text x="140" y="260" textAnchor="middle" fill="#78350f" fontWeight="bold" fontSize="16">
              S
            </text>
            <text x="28" y="146" textAnchor="middle" fill="#78350f" fontWeight="bold" fontSize="16">
              W
            </text>

            {/* Minor directions */}
            <text x="218" y="68" textAnchor="middle" fill="#92400e" fontSize="11" opacity="0.6">
              NE
            </text>
            <text x="62" y="68" textAnchor="middle" fill="#92400e" fontSize="11" opacity="0.6">
              NW
            </text>
            <text x="218" y="222" textAnchor="middle" fill="#92400e" fontSize="11" opacity="0.6">
              SE
            </text>
            <text x="62" y="222" textAnchor="middle" fill="#92400e" fontSize="11" opacity="0.6">
              SW
            </text>

            {/* Tick marks */}
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i * 5 * Math.PI) / 180;
              const isMajor = i % 6 === 0;
              const r1 = 126;
              const r2 = isMajor ? 114 : 120;
              return (
                <line
                  key={i}
                  x1={140 + r1 * Math.sin(a)}
                  y1={140 - r1 * Math.cos(a)}
                  x2={140 + r2 * Math.sin(a)}
                  y2={140 - r2 * Math.cos(a)}
                  stroke={isMajor ? '#b45309' : '#d97706'}
                  strokeWidth={isMajor ? 2 : 1}
                  opacity={isMajor ? 0.9 : 0.4}
                />
              );
            })}
          </svg>

          {/* Golden Star / Compass Rose Needle pointing to Qibla Angle */}
          <div
            className="absolute w-full h-full pointer-events-none transition-transform duration-300 flex items-center justify-center"
            style={{ transform: `rotate(${relativeAngle}deg)` }}
          >
            {/* North Point of Needle (Gold metallic needle) */}
            <div className="absolute top-6 w-0 h-0 border-l-8 border-r-8 border-b-64 border-l-transparent border-r-transparent border-b-amber-500 drop-shadow-md" />
            {/* South Point of Needle */}
            <div className="absolute bottom-6 w-0 h-0 border-l-8 border-r-8 border-t-64 border-l-transparent border-r-transparent border-t-stone-400 drop-shadow-md" />
            {/* Sun Icon Indicator on Needle */}
            <div className="absolute top-18 w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[10px] text-stone-900 font-bold shadow-xs">
              ☀️
            </div>
          </div>

          {/* Center Hub & Crosshair */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-lg flex flex-col items-center justify-center z-10 text-stone-900">
            <span className="font-mono text-xs font-black">{qiblaAngle}°</span>
            <span className="text-[8px] uppercase font-bold tracking-tight">KIBLAT</span>
          </div>

          {/* Target Alignment Crosshair Circle */}
          <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-stone-400/60 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          </div>
        </div>

        {/* Prompt from Reference Screenshot: "Harap letakkan ponsel Anda rata." */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <span className="text-base">📳</span>
          <span>Harap letakkan ponsel Anda rata.</span>
        </div>

        {/* Alignment Success Status */}
        {isAligned && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Arah Kiblat Tepat! Anda Menghadap Ka'bah</span>
          </div>
        )}
      </div>

      {/* Manual Fine-Tuning Slider */}
      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
          <span>Penyesuaian Sudut Manual:</span>
          <span className="font-mono text-emerald-600">{manualAdjustment > 0 ? `+${manualAdjustment}` : manualAdjustment}°</span>
        </div>
        <input
          type="range"
          min="-30"
          max="30"
          value={manualAdjustment}
          onChange={(e) => setManualAdjustment(parseInt(e.target.value, 10))}
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>-30° (Barat)</span>
          <button onClick={() => setManualAdjustment(0)} className="text-emerald-600 underline">
            Reset (0°)
          </button>
          <span>+30° (Timur)</span>
        </div>
      </div>
    </div>
  );
};
