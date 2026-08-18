// SMART RT 07 RW 11 GPA NGIJO - ENVIRONMENTAL FACILITY & GIS CONFIGURATION v1.0

import { FacilityCategory, FacilityCondition, FacilityPriority } from '../types/facility';

export const GPA_NGIJO_BOUNDS = {
  centerLat: -7.9025,
  centerLng: 112.5985,
  defaultZoom: 18,
  minLat: -7.9060,
  maxLat: -7.8990,
  minLng: 112.5940,
  maxLng: 112.6030,
  areaName: 'Perumahan Griya Permata Alam (GPA) Ngijo RT 07 RW 11',
  kecamatan: 'Karangploso',
  kabupaten: 'Malang'
};

export const FACILITY_CATEGORIES: {
  key: FacilityCategory;
  label: string;
  subcategories: string[];
  icon: string;
  color: string;
}[] = [
  {
    key: 'KEAMANAN',
    label: 'Keamanan & Ketertiban',
    subcategories: ['POS_KEAMANAN', 'CCTV', 'PAGAR', 'PORTAL', 'PENERANGAN_KEAMANAN'],
    icon: 'Shield',
    color: '#1E3A8A' // Blue 900
  },
  {
    key: 'PENERANGAN',
    label: 'Penerangan Jalan & Fasum',
    subcategories: ['LAMPU_JALAN', 'LAMPU_GANG', 'LAMPU_FASILITAS', 'PANEL_LISTRIK'],
    icon: 'Lightbulb',
    color: '#D97706' // Amber 600
  },
  {
    key: 'JALAN',
    label: 'Jalan & Paving Lingkungan',
    subcategories: ['JALAN_UTAMA', 'JALAN_LINGKUNGAN', 'GANG', 'PAVING', 'POLISI_TIDUR'],
    icon: 'Navigation',
    color: '#475569' // Slate 600
  },
  {
    key: 'DRAINASE',
    label: 'Drainase & Saluran Air',
    subcategories: ['SALURAN_AIR', 'GORONG_GORONG', 'BAK_KONTROL', 'RESAPAN_BIOPORI'],
    icon: 'Droplets',
    color: '#0284C7' // Sky 600
  },
  {
    key: 'AIR',
    label: 'Sarana Air Bersih & Kran',
    subcategories: ['KRAN_UMUM', 'POMPA_AIR', 'TANDON_AIR', 'MATA_AIR'],
    icon: 'Waves',
    color: '#06B6D4' // Cyan 500
  },
  {
    key: 'SAMPAH',
    label: 'Pengelolaan Sampah',
    subcategories: ['TEMPAT_SAMPAH', 'TPS', 'BANK_SAMPAH', 'KOMPOSTER'],
    icon: 'Trash2',
    color: '#15803D' // Green 700
  },
  {
    key: 'TEMPAT_IBADAH',
    label: 'Tempat Ibadah / Musholla',
    subcategories: ['MUSHASOLA_RT', 'TEMPAT_WUDHU', 'SOUND_SYSTEM_IBADAH'],
    icon: 'Building2',
    color: '#047857' // Emerald 700
  },
  {
    key: 'POSYANDU',
    label: 'Posyandu & Fasilitas Kesehatan',
    subcategories: ['BALAI_POSYANDU', 'TIMBANGAN_BAYI', 'KOTAK_P3K_RT', 'ALAT_UKUR_KESEHATAN'],
    icon: 'HeartPulse',
    color: '#E11D48' // Rose 600
  },
  {
    key: 'OLAHRAGA',
    label: 'Sarana Olahraga',
    subcategories: ['LAPANGAN_BULUTANGKIS', 'MEJA_PINGPONG', 'JALUR_REFLEKSI'],
    icon: 'Trophy',
    color: '#7C3AED' // Purple 600
  },
  {
    key: 'TAMAN',
    label: 'Taman & Penghijauan',
    subcategories: ['TAMAN_TOGA', 'TAMAN_BUNGA', 'POHON_PENEDUH', 'GAZEBO_TAMAN'],
    icon: 'Trees',
    color: '#16A34A' // Green 600
  },
  {
    key: 'RUANG_PUBLIK',
    label: 'Ruang Publik & Balai Pertemuan',
    subcategories: ['BALAI_RT', 'TERAS_SERBAGUNA', 'PAPAN_PENGUMUMAN', 'GUDANG_RT'],
    icon: 'Home',
    color: '#123B5D' // GPA Navy
  },
  {
    key: 'PARKIR',
    label: 'Area Parkir & Fasum Kendaraan',
    subcategories: ['PARKIR_TAMU', 'PARKIR_MOTOR_WARGA', 'RAMBU_PARKIR'],
    icon: 'Car',
    color: '#64748B' // Slate 500
  },
  {
    key: 'FASILITAS_ANAK',
    label: 'Taman Bermain Anak',
    subcategories: ['AYUNAN', 'PEROSOTAN', 'JUNGKITAN', 'LANTAI_PASIR_RUMPUT'],
    icon: 'Smile',
    color: '#F59E0B' // Amber 500
  },
  {
    key: 'TELEKOMUNIKASI',
    label: 'Jaringan & WiFi Publik',
    subcategories: ['ACCESS_POINT_WIFI', 'TIANG_INTERNET', 'KABEL_FIBER_RT'],
    icon: 'Wifi',
    color: '#2563EB' // Blue 600
  },
  {
    key: 'LAINNYA',
    label: 'Fasilitas Lainnya',
    subcategories: ['LAIN_LAIN'],
    icon: 'Package',
    color: '#6B7280' // Gray 500
  }
];

export const CONDITION_SCORE_MAP: Record<FacilityCondition, number> = {
  BAIK: 5,
  CUKUP_BAIK: 4,
  RUSAK_RINGAN: 3,
  RUSAK_SEDANG: 2,
  RUSAK_BERAT: 1,
  TIDAK_LAYAK: 0,
  BELUM_DINILAI: 0
};

export const CONDITION_METADATA: Record<
  FacilityCondition,
  { label: string; badgeColor: string; textColor: string; borderColor: string; dotColor: string }
> = {
  BAIK: {
    label: 'Baik (Sangat Layak)',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    dotColor: '#10B981'
  },
  CUKUP_BAIK: {
    label: 'Cukup Baik',
    badgeColor: 'bg-sky-100 text-sky-800',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    dotColor: '#0EA5E9'
  },
  RUSAK_RINGAN: {
    label: 'Rusak Ringan',
    badgeColor: 'bg-amber-100 text-amber-800',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    dotColor: '#F59E0B'
  },
  RUSAK_SEDANG: {
    label: 'Rusak Sedang',
    badgeColor: 'bg-orange-100 text-orange-800',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dotColor: '#F97316'
  },
  RUSAK_BERAT: {
    label: 'Rusak Berat',
    badgeColor: 'bg-rose-100 text-rose-800',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-300',
    dotColor: '#EF4444'
  },
  TIDAK_LAYAK: {
    label: 'Tidak Layak Pakai',
    badgeColor: 'bg-slate-900 text-white',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-800',
    dotColor: '#1E293B'
  },
  BELUM_DINILAI: {
    label: 'Belum Dinilai',
    badgeColor: 'bg-slate-100 text-slate-700',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-300',
    dotColor: '#94A3B8'
  }
};

export const PRIORITY_METADATA: Record<
  FacilityPriority,
  { label: string; badgeColor: string; textColor: string; isAlert: boolean }
> = {
  RENDAH: {
    label: 'Rendah (Low)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    textColor: 'text-slate-600',
    isAlert: false
  },
  NORMAL: {
    label: 'Normal',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    textColor: 'text-blue-700',
    isAlert: false
  },
  TINGGI: {
    label: 'Tinggi (High)',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    textColor: 'text-orange-700',
    isAlert: true
  },
  DARURAT: {
    label: '🚨 DARURAT (Urgent)',
    badgeColor: 'bg-rose-600 text-white border-rose-700 font-black animate-pulse',
    textColor: 'text-rose-600',
    isAlert: true
  }
};

// SMART RT GEOBASE v2.0 REAL-WORLD MAP PROVIDER ABSTRACTION
export interface MapProviderConfig {
  id: string;
  name: string;
  type: 'VECTOR' | 'TILE' | 'SATELLITE' | 'HYBRID';
  tileUrl: string;
  subdomains?: string[];
  attribution: string;
  maxZoom: number;
  minZoom: number;
}

export const MAP_PROVIDERS: MapProviderConfig[] = [
  {
    id: 'OSM_STANDARD',
    name: 'OpenStreetMap (Real-World Standard)',
    type: 'TILE',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 14
  },
  {
    id: 'CARTO_VOYAGER',
    name: 'CartoDB Voyager (Clean Detailed)',
    type: 'TILE',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20,
    minZoom: 14
  },
  {
    id: 'ESRI_SATELLITE',
    name: 'Esri World Imagery (Satellite)',
    type: 'SATELLITE',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    minZoom: 14
  },
  {
    id: 'OPENTOPOMAP',
    name: 'OpenTopoMap (Topografi Lingkungan)',
    type: 'TILE',
    tileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
    minZoom: 14
  }
];

// GPS ACCURACY GATING THRESHOLDS (SECTION 7 - v2.1 SPECIFICATION)
export const GPS_ACCURACY_THRESHOLDS = {
  HIGH_PRECISION: 5.0,     // <= 5m (PRESISI TINGGI)
  ACCEPTABLE: 10.0,        // > 5m - <= 10m (DAPAT DITERIMA)
  LOW_PRECISION: 25.0      // > 10m - <= 25m (PRESISI RENDAH)
  // > 25m: REQUIRES REVIEW (MEMBUTUHKAN PENINJAUAN)
};

export const getGPSAccuracyGrade = (
  accuracyMeters: number
): {
  grade: 'HIGH_PRECISION' | 'ACCEPTABLE' | 'LOW_PRECISION' | 'REQUIRES_REVIEW';
  label: string;
  colorClass: string;
  badgeClass: string;
  color: string;
  description: string;
} => {
  if (accuracyMeters <= GPS_ACCURACY_THRESHOLDS.HIGH_PRECISION) {
    return {
      grade: 'HIGH_PRECISION',
      label: 'PRESISI TINGGI (≤ 5m)',
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      color: '#10B981',
      description: 'Presisi tinggi, optimal untuk pencatatan koordinat titik fisik on-site.'
    };
  }
  if (accuracyMeters <= GPS_ACCURACY_THRESHOLDS.ACCEPTABLE) {
    return {
      grade: 'ACCEPTABLE',
      label: 'DAPAT DITERIMA (> 5-10m)',
      colorClass: 'text-sky-700',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      color: '#0284C7',
      description: 'Presisi standar perangkat seluler, layak digunakan untuk pemetaan lingkungan.'
    };
  }
  if (accuracyMeters <= GPS_ACCURACY_THRESHOLDS.LOW_PRECISION) {
    return {
      grade: 'LOW_PRECISION',
      label: 'PRESISI RENDAH (> 10-25m)',
      colorClass: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      color: '#F59E0B',
      description: 'Akurasi rendah, disarankan kalibrasi GPS atau berpindah ke area terbuka.'
    };
  }
  return {
    grade: 'REQUIRES_REVIEW',
    label: 'MEMBUTUHKAN PENINJAUAN (> 25m)',
    colorClass: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    color: '#EF4444',
    description: 'Akurasi lemah (> 25m), membutuhkan peninjauan atau pengambilan ulang di lapangan.'
  };
};

// STALE DATA THRESHOLDS (SECTION 26)
export const STALE_DATA_CONFIG = {
  FRESH_DAYS: 90,
  AGING_DAYS: 180
};

export const calculateStaleStatus = (
  lastSurveyedDateStr?: string
): {
  status: 'FRESH' | 'AGING' | 'STALE';
  daysElapsed: number;
  label: string;
  badgeClass: string;
} => {
  if (!lastSurveyedDateStr) {
    return {
      status: 'STALE',
      daysElapsed: 999,
      label: 'STALE (Belum Pernah Disurvey)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }

  const lastDate = new Date(lastSurveyedDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < STALE_DATA_CONFIG.FRESH_DAYS) {
    return {
      status: 'FRESH',
      daysElapsed: diffDays,
      label: `FRESH (${diffDays} hari lalu)`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }
  if (diffDays <= STALE_DATA_CONFIG.AGING_DAYS) {
    return {
      status: 'AGING',
      daysElapsed: diffDays,
      label: `AGING (${diffDays} hari lalu)`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }
  return {
    status: 'STALE',
    daysElapsed: diffDays,
    label: `STALE (${diffDays} hari lalu)`,
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
  };
};

// REAL-WORLD REFERENCE BOUNDARIES & ROAD NETWORKS (SOURCE: REFERENCE)
// Explicitly tagged as REFERENCE/UNVERIFIED per Section 13-14 rules
export const RT07_REFERENCE_BOUNDARY = {
  boundaryId: 'BOUND-RT07-RW11-REFERENCE',
  rtNumber: '07',
  rwNumber: '11',
  areaName: 'Perumahan Griya Permata Alam (GPA) Ngijo RT 07 RW 11',
  source: 'REFERENCE' as const,
  verificationStatus: 'REFERENCE_UNVERIFIED' as const,
  notes: 'Batas estimasi referensi spasial lingkungan. Wajib diverifikasi melalui survey GPS batas wilayah.',
  polygon: [
    [-7.9015, 112.5968],
    [-7.9014, 112.5998],
    [-7.9022, 112.6002],
    [-7.9038, 112.5997],
    [-7.9039, 112.5972],
    [-7.9028, 112.5966]
  ] as [number, number][],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export const RT07_REFERENCE_ROADS = [
  {
    roadId: 'ROAD-001',
    name: 'Jl. Permata Raya (Akses Utama)',
    type: 'JALAN_UTAMA',
    source: 'REFERENCE' as const,
    verificationStatus: 'FIELD_VERIFIED' as const,
    points: [
      [-7.9016, 112.5970],
      [-7.9020, 112.5980],
      [-7.9025, 112.5990],
      [-7.9030, 112.6000]
    ] as [number, number][]
  },
  {
    roadId: 'ROAD-002',
    name: 'Gang 1 Blok A (Paving)',
    type: 'GANG',
    source: 'REFERENCE' as const,
    verificationStatus: 'FIELD_VERIFIED' as const,
    points: [
      [-7.9018, 112.5975],
      [-7.9028, 112.5973]
    ] as [number, number][]
  },
  {
    roadId: 'ROAD-003',
    name: 'Gang 2 Blok B (Paving)',
    type: 'GANG',
    source: 'REFERENCE' as const,
    verificationStatus: 'FIELD_VERIFIED' as const,
    points: [
      [-7.9022, 112.5983],
      [-7.9032, 112.5981]
    ] as [number, number][]
  },
  {
    roadId: 'ROAD-004',
    name: 'Gang 3 Blok C (Paving)',
    type: 'GANG',
    source: 'REFERENCE' as const,
    verificationStatus: 'FIELD_VERIFIED' as const,
    points: [
      [-7.9026, 112.5991],
      [-7.9036, 112.5989]
    ] as [number, number][]
  }
];

export const RT07_REFERENCE_DRAINAGE = [
  {
    drainId: 'DRAIN-001',
    name: 'Saluran Drainase Utama Jl. Permata Raya',
    type: 'SALURAN_PRIMER',
    source: 'REFERENCE' as const,
    verificationStatus: 'REFERENCE_UNVERIFIED' as const,
    points: [
      [-7.9016, 112.5971],
      [-7.9021, 112.5981],
      [-7.9026, 112.5991],
      [-7.9031, 112.6001]
    ] as [number, number][]
  },
  {
    drainId: 'DRAIN-002',
    name: 'Drainase Sekunder Gang 1 Blok A',
    type: 'SALURAN_SEKUNDER',
    source: 'REFERENCE' as const,
    verificationStatus: 'REFERENCE_UNVERIFIED' as const,
    points: [
      [-7.9019, 112.5976],
      [-7.9029, 112.5974]
    ] as [number, number][]
  },
  {
    drainId: 'DRAIN-003',
    name: 'Drainase Sekunder Gang 2 Blok B',
    type: 'SALURAN_SEKUNDER',
    source: 'REFERENCE' as const,
    verificationStatus: 'REFERENCE_UNVERIFIED' as const,
    points: [
      [-7.9023, 112.5984],
      [-7.9033, 112.5982]
    ] as [number, number][]
  }
];

// POINT IN POLYGON (RAY CASTING) GEOFENCE VALIDATION
export const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Check if coordinates reside within RT 07 RW 11 GPA Ngijo Boundary
export const isInsideRT07Boundary = (lat: number, lng: number): boolean => {
  return isPointInPolygon([lat, lng], RT07_REFERENCE_BOUNDARY.polygon);
};

// Calculate Haversine distance in meters
export const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(1));
};

// Distance Comparison Status vs Reference Point
export const getDistanceComparisonStatus = (
  distanceMeters: number | null | undefined
): {
  status: 'MATCH' | 'NEAR' | 'SIGNIFICANT_DIFFERENCE' | 'REQUIRES_REVIEW' | 'NO_REFERENCE';
  label: string;
  colorClass: string;
  badgeClass: string;
} => {
  if (distanceMeters === null || distanceMeters === undefined || isNaN(distanceMeters)) {
    return {
      status: 'NO_REFERENCE',
      label: 'FASILITAS BARU (Tanpa Referensi)',
      colorClass: 'text-slate-600',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
    };
  }

  if (distanceMeters <= 5.0) {
    return {
      status: 'MATCH',
      label: `MATCH (Δ ${distanceMeters}m)`,
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }
  if (distanceMeters <= 15.0) {
    return {
      status: 'NEAR',
      label: `NEAR (Δ ${distanceMeters}m)`,
      colorClass: 'text-sky-700',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300'
    };
  }
  if (distanceMeters <= 50.0) {
    return {
      status: 'SIGNIFICANT_DIFFERENCE',
      label: `SELISIH SIGNIFIKAN (Δ ${distanceMeters}m)`,
      colorClass: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }
  return {
    status: 'REQUIRES_REVIEW',
    label: `PERLU REVIEW (Δ ${distanceMeters}m > 50m)`,
    colorClass: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
  };
};

// GPS Signal Quality Derivation
export const getGPSSignalStatus = (
  accuracyMeters: number | null,
  isAcquiring = false
): {
  status: 'ACQUIRING' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNAVAILABLE';
  label: string;
  colorClass: string;
  badgeClass: string;
  iconColor: string;
} => {
  if (isAcquiring) {
    return {
      status: 'ACQUIRING',
      label: 'ACQUIRING SATELLITE LOCK...',
      colorClass: 'text-purple-700',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse',
      iconColor: '#7C3AED'
    };
  }
  if (accuracyMeters === null || isNaN(accuracyMeters)) {
    return {
      status: 'UNAVAILABLE',
      label: 'GPS UNAVAILABLE',
      colorClass: 'text-slate-500',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      iconColor: '#6B7280'
    };
  }
  if (accuracyMeters <= 5.0) {
    return {
      status: 'GOOD',
      label: 'GPS SIGNAL: EXCELLENT (GOOD)',
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: '#10B981'
    };
  }
  if (accuracyMeters <= 12.0) {
    return {
      status: 'ACCEPTABLE',
      label: 'GPS SIGNAL: ACCEPTABLE',
      colorClass: 'text-sky-700',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      iconColor: '#0284C7'
    };
  }
  return {
    status: 'POOR',
    label: 'GPS SIGNAL: POOR (HIGH UNCERTAINTY)',
    colorClass: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    iconColor: '#EF4444'
  };
};

// Quality Score calculation based on GPS, Geofence, Photo Evidence, Checklist, Freshness
export const calculateSurveyQualityScore = (params: {
  accuracyMeters: number;
  insideBoundary: boolean;
  photoCount: number;
  checklistComplete: boolean;
  daysElapsed?: number;
}): {
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'REQUIRES_REVIEW';
  score: number; // 0-100
  label: string;
  badgeClass: string;
} => {
  let score = 0;

  // GPS Accuracy weight (max 35)
  if (params.accuracyMeters <= 5) score += 35;
  else if (params.accuracyMeters <= 10) score += 25;
  else if (params.accuracyMeters <= 25) score += 10;

  // Boundary weight (max 25)
  if (params.insideBoundary) score += 25;

  // Photo evidence weight (max 20)
  if (params.photoCount >= 2) score += 20;
  else if (params.photoCount === 1) score += 12;

  // Checklist weight (max 20)
  if (params.checklistComplete) score += 20;

  if (!params.insideBoundary || params.accuracyMeters > 25) {
    return {
      grade: 'REQUIRES_REVIEW',
      score,
      label: `REQUIRES REVIEW (${score}/100)`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }

  if (score >= 85) {
    return {
      grade: 'EXCELLENT',
      score,
      label: `EXCELLENT (${score}/100)`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }
  if (score >= 70) {
    return {
      grade: 'GOOD',
      score,
      label: `GOOD (${score}/100)`,
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300'
    };
  }
  if (score >= 50) {
    return {
      grade: 'FAIR',
      score,
      label: `FAIR (${score}/100)`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }
  return {
    grade: 'POOR',
    score,
    label: `POOR (${score}/100)`,
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300'
  };
};
