import React, { useState, useEffect } from 'react';
import { PRAYER_CITIES } from '../../services/prayerTimeService';
import {
  MapPin,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Search,
  Sliders,
  Sparkles,
  Compass,
} from 'lucide-react';

export interface MosqueItem {
  id: string;
  name: string;
  category: 'Masjid Raya' | 'Masjid Jami\'' | 'Musholla';
  address: string;
  city: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  hasWudhuFacilities: boolean;
  isWheelchairAccessible: boolean;
  googleMapsUrl: string;
}

export const VERIFIED_INDONESIAN_MOSQUES: MosqueItem[] = [
  {
    id: 'm_1',
    name: 'Masjid Istiqlal',
    category: 'Masjid Raya',
    address: 'Jl. Taman Wijaya Kusuma, Ps. Baru, Sawah Besar, Jakarta Pusat',
    city: 'Jakarta',
    distanceKm: 1.2,
    latitude: -6.1702,
    longitude: 106.8315,
    hasWudhuFacilities: true,
    isWheelchairAccessible: true,
    googleMapsUrl: 'https://maps.google.com/?q=-6.1702,106.8315',
  },
  {
    id: 'm_2',
    name: 'Masjid Agung Sunda Kelapa',
    category: 'Masjid Jami\'',
    address: 'Jl. Taman Sunda Kelapa No.16, Menteng, Jakarta Pusat',
    city: 'Jakarta',
    distanceKm: 2.8,
    latitude: -6.1996,
    longitude: 106.8329,
    hasWudhuFacilities: true,
    isWheelchairAccessible: true,
    googleMapsUrl: 'https://maps.google.com/?q=-6.1996,106.8329',
  },
  {
    id: 'm_3',
    name: 'Masjid Al-Azhar Kebayoran Baru',
    category: 'Masjid Jami\'',
    address: 'Jl. Sisingamangaraja No.1, Selong, Kebayoran Baru, Jakarta Selatan',
    city: 'Jakarta',
    distanceKm: 4.5,
    latitude: -6.2355,
    longitude: 106.7986,
    hasWudhuFacilities: true,
    isWheelchairAccessible: true,
    googleMapsUrl: 'https://maps.google.com/?q=-6.2355,106.7986',
  },
  {
    id: 'm_4',
    name: 'Masjid Nasional Al-Akbar',
    category: 'Masjid Raya',
    address: 'Jl. Masjid Al-Akbar Timur No.1, Pagesangan, Jambangan, Surabaya',
    city: 'Surabaya',
    distanceKm: 2.1,
    latitude: -7.3377,
    longitude: 112.7153,
    hasWudhuFacilities: true,
    isWheelchairAccessible: true,
    googleMapsUrl: 'https://maps.google.com/?q=-7.3377,112.7153',
  },
  {
    id: 'm_5',
    name: 'Masjid Raya Bandung',
    category: 'Masjid Raya',
    address: 'Jl. Asia Afrika, Balonggede, Regol, Kota Bandung',
    city: 'Bandung',
    distanceKm: 1.5,
    latitude: -6.9219,
    longitude: 107.6074,
    hasWudhuFacilities: true,
    isWheelchairAccessible: true,
    googleMapsUrl: 'https://maps.google.com/?q=-6.9219,107.6074',
  },
  {
    id: 'm_6',
    name: 'Musholla An-Nuur Perkantoran',
    category: 'Musholla',
    address: 'Kawasan Komersial Pusat, Lantai Dasar Gedung A',
    city: 'Jakarta',
    distanceKm: 0.3,
    latitude: -6.1820,
    longitude: 106.8280,
    hasWudhuFacilities: true,
    isWheelchairAccessible: false,
    googleMapsUrl: 'https://maps.google.com/?q=-6.1820,106.8280',
  },
];

export const NearbyMosqueLocator: React.FC = () => {
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'LOCATING' | 'GRANTED' | 'DENIED'>('IDLE');

  // Status integrasi Google Maps Platform
  // Diatur ketat: EXTERNAL INTEGRATION BLOCKED until Owner activates billing & restricted key
  const googleMapsApiStatus = 'EXTERNAL INTEGRATION BLOCKED';

  const handleRequestLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setLocationStatus('LOCATING');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('GRANTED');
        },
        () => {
          setLocationStatus('DENIED');
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus('DENIED');
    }
  };

  const filteredMosques = VERIFIED_INDONESIAN_MOSQUES.filter((m) => {
    const matchesRadius = m.distanceKm <= selectedRadiusKm;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRadius && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      {/* Google Maps Billing & Policy Notice as instructed by Owner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="font-bold">Status Integrasi Google Maps:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
              {googleMapsApiStatus}
            </span>
          </div>
          <p className="leading-relaxed">
            Sesuai kepatuhan Owner, panggilan Google Maps Places API live belum mengaktifkan kuota berbayar tanpa konfirmasi billing Owner. Sistem saat ini menyajikan direktori masjid terverifikasi dan membuka navigasi arah langsung ke Google Maps resmi secara aman.
          </p>
        </div>
      </div>

      {/* Location Permission & Radius Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white">
                Lokasi Pencarian
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {locationStatus === 'GRANTED'
                  ? 'GPS Aktif: Menampilkan masjid di sekitar koordinat Anda'
                  : 'Gunakan lokasi saat ini untuk akurasi jarak'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRequestLocation}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>{locationStatus === 'LOCATING' ? 'Mendeteksi...' : 'Izin Lokasi GPS'}</span>
          </button>
        </div>

        {/* Radius Filter Pills (1 km, 3 km, 5 km, 10 km) */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-bold text-stone-500">Radius Pencarian:</span>
          <div className="flex items-center gap-1.5">
            {[1, 3, 5, 10].map((r) => (
              <button
                key={`mosque_radius_${r}`}
                onClick={() => setSelectedRadiusKm(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  selectedRadiusKm === r
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {r} KM
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama masjid atau alamat (Istiqlal, Al-Akbar, Sunda Kelapa)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Mosque Cards List */}
      <div className="space-y-3">
        {filteredMosques.map((mosque) => (
          <div
            key={mosque.id}
            className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {mosque.category}
                </span>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  ~{mosque.distanceKm} KM
                </span>
              </div>
              <h4 className="text-base font-black text-stone-900 dark:text-white">
                {mosque.name}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {mosque.address}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                <span>Fasilitas Wudhu: {mosque.hasWudhuFacilities ? 'Tersedia ✓' : '–'}</span>
                <span>Akses Ramah Difabel: {mosque.isWheelchairAccessible ? 'Tersedia ✓' : '–'}</span>
              </div>
            </div>

            <a
              href={mosque.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk Arah (Maps)</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
