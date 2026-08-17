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
