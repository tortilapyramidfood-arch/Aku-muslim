/**
 * Qibla Direction and Distance Calculation Service
 * Kaaba (Makkah Al-Mukarramah) coordinates: 21.422487° N, 39.826206° E
 */

export const KAABA_LATITUDE = 21.422487;
export const KAABA_LONGITUDE = 39.826206;

const toRadians = (deg: number) => (deg * Math.PI) / 180.0;
const toDegrees = (rad: number) => (rad * 180.0) / Math.PI;

export interface QiblaResult {
  bearingDegrees: number;
  bearingFormatted: string;
  compassCardinal: string;
  distanceKm: number;
  distanceFormatted: string;
}

/**
 * Calculates Qibla direction from user coordinates to Kaaba using spherical trigonometry
 */
export function calculateQibla(latitude: number, longitude: number): QiblaResult {
  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_LATITUDE);
  const deltaLambda = toRadians(KAABA_LONGITUDE - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (toDegrees(qiblaRad) + 360) % 360;

  // Haversine formula for distance
  const R = 6371; // Earth radius in km
  const deltaPhi = phi2 - phi1;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    bearingDegrees: Math.round(qiblaDeg * 10) / 10,
    bearingFormatted: `${Math.round(qiblaDeg * 10) / 10}°`,
    compassCardinal: getCardinalDirection(qiblaDeg),
    distanceKm,
    distanceFormatted: `${distanceKm.toLocaleString('id-ID')} km`,
  };
}

function getCardinalDirection(angle: number): string {
  const directions = [
    'Utara',
    'Utara Timur Laut',
    'Timur Laut',
    'Timur Timur Laut',
    'Timur',
    'Timur Tenggara',
    'Tenggara',
    'Selatan Tenggara',
    'Selatan',
    'Selatan Barat Daya',
    'Barat Daya',
    'Barat Barat Daya',
    'Barat',
    'Barat Barat Laut',
    'Barat Laut',
    'Utara Barat Laut',
  ];
  const index = Math.round(angle / 22.5) % 16;
  return directions[index];
}
