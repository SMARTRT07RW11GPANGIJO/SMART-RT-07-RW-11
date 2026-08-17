// SMART RT 07 RW 11 GPA NGIJO - GIS INTERACTIVE FACILITY MAP v1.0
// Production Grade SVG & Coordinate Mapping Component for RT 07 Environment

import React, { useState, useRef, useMemo } from 'react';
import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority
} from '../../types/facility';
import {
  GPA_NGIJO_BOUNDS,
  FACILITY_CATEGORIES,
  CONDITION_METADATA,
  PRIORITY_METADATA
} from '../../config/facilityConfig';
import {
  MapPin,
  Layers,
  Search,
  Crosshair,
  Shield,
  Lightbulb,
  Navigation,
  Droplets,
  Trash2,
  Building2,
  HeartPulse,
  Trophy,
  Trees,
  Home,
  Car,
  Smile,
  Wifi,
  Package,
  Eye,
  AlertTriangle,
  Wrench,
  Compass
} from 'lucide-react';

interface FacilityMapProps {
  facilities: FasilitasLingkungan[];
  selectedFacility: FasilitasLingkungan | null;
  onSelectFacility: (facility: FasilitasLingkungan) => void;
  onPickCoordinates?: (lat: number, lng: number) => void;
  isCoordinatePickerMode?: boolean;
  onOpenReportModal?: (facility: FasilitasLingkungan) => void;
  onOpenInspectionModal?: (facility: FasilitasLingkungan) => void;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  onPickCoordinates,
  isCoordinatePickerMode = false,
  onOpenReportModal,
  onOpenInspectionModal
}) => {
  const [mapLayer, setMapLayer] = useState<'STREET' | 'SATELLITE' | 'INFRASTRUCTURE'>('STREET');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FacilityCategory | 'ALL'>('ALL');
  const [conditionFilter, setConditionFilter] = useState<FacilityCondition | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<FacilityPriority | 'ALL'>('ALL');
  const [hoveredFacility, setHoveredFacility] = useState<FasilitasLingkungan | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pickerPin, setPickerPin] = useState<{ lat: number; lng: number } | null>(null);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Convert real lat/lng to SVG canvas percentage coordinates (0 - 1000 x 0 - 700)
  const latLngToSvgPoint = (lat: number, lng: number) => {
    const latSpan = GPA_NGIJO_BOUNDS.maxLat - GPA_NGIJO_BOUNDS.minLat;
    const lngSpan = GPA_NGIJO_BOUNDS.maxLng - GPA_NGIJO_BOUNDS.minLng;

    // Lat increases upwards, SVG y increases downwards
    const yRatio = (GPA_NGIJO_BOUNDS.maxLat - lat) / latSpan;
    const xRatio = (lng - GPA_NGIJO_BOUNDS.minLng) / lngSpan;

    const x = Math.max(40, Math.min(960, xRatio * 1000));
    const y = Math.max(40, Math.min(660, yRatio * 700));

    return { x, y };
  };

  // Convert SVG click to approximate lat/lng coordinates
  const svgPointToLatLng = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const latSpan = GPA_NGIJO_BOUNDS.maxLat - GPA_NGIJO_BOUNDS.minLat;
    const lngSpan = GPA_NGIJO_BOUNDS.maxLng - GPA_NGIJO_BOUNDS.minLng;

    const lng = Number((GPA_NGIJO_BOUNDS.minLng + clickX * lngSpan).toFixed(6));
    const lat = Number((GPA_NGIJO_BOUNDS.maxLat - clickY * latSpan).toFixed(6));

    if (isCoordinatePickerMode && onPickCoordinates) {
      setPickerPin({ lat, lng });
      onPickCoordinates(lat, lng);
    }
  };

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (f.status === 'DIHAPUS') return false;
      if (categoryFilter !== 'ALL' && f.kategori !== categoryFilter) return false;
      if (conditionFilter !== 'ALL' && f.kondisi !== conditionFilter) return false;
      if (priorityFilter !== 'ALL' && f.tingkatPrioritas !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.namaFasilitas.toLowerCase().includes(q);
        const matchesCode = f.kodeFasilitas.toLowerCase().includes(q);
        const matchesLocation = f.lokasi.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesLocation) return false;
      }
      return true;
    });
  }, [facilities, categoryFilter, conditionFilter, priorityFilter, searchQuery]);

  const getCategoryIcon = (category: FacilityCategory, className = 'w-4 h-4') => {
    switch (category) {
      case 'KEAMANAN':
        return <Shield className={className} />;
      case 'PENERANGAN':
        return <Lightbulb className={className} />;
      case 'JALAN':
        return <Navigation className={className} />;
      case 'DRAINASE':
        return <Droplets className={className} />;
      case 'SAMPAH':
        return <Trash2 className={className} />;
      case 'TEMPAT_IBADAH':
        return <Building2 className={className} />;
      case 'POSYANDU':
        return <HeartPulse className={className} />;
      case 'OLAHRAGA':
        return <Trophy className={className} />;
      case 'TAMAN':
        return <Trees className={className} />;
      case 'RUANG_PUBLIK':
        return <Home className={className} />;
      case 'PARKIR':
        return <Car className={className} />;
      case 'FASILITAS_ANAK':
        return <Smile className={className} />;
      case 'TELEKOMUNIKASI':
        return <Wifi className={className} />;
      default:
        return <Package className={className} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top Filter & Search Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fasilitas di peta..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {FACILITY_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as any)}
            className="text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="BAIK">🟢 Baik</option>
            <option value="CUKUP_BAIK">🔵 Cukup Baik</option>
            <option value="RUSAK_RINGAN">🟡 Rusak Ringan</option>
            <option value="RUSAK_SEDANG">🟠 Rusak Sedang</option>
            <option value="RUSAK_BERAT">🔴 Rusak Berat</option>
            <option value="TIDAK_LAYAK">⚫ Tidak Layak</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="DARURAT">🚨 DARURAT Saja</option>
            <option value="TINGGI">Tinggi</option>
            <option value="NORMAL">Normal</option>
            <option value="RENDAH">Rendah</option>
          </select>
        </div>

        {/* Map Layer Mode & Controls */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="bg-slate-200 p-0.5 rounded-xl flex items-center text-[11px] font-bold">
            <button
              onClick={() => setMapLayer('STREET')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapLayer === 'STREET' ? 'bg-[#123B5D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jalan
            </button>
            <button
              onClick={() => setMapLayer('SATELLITE')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapLayer === 'SATELLITE' ? 'bg-[#123B5D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satelit
            </button>
            <button
              onClick={() => setMapLayer('INFRASTRUCTURE')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapLayer === 'INFRASTRUCTURE' ? 'bg-[#123B5D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Infrastruktur
            </button>
          </div>

          {isCoordinatePickerMode && (
            <div className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 border border-amber-300 animate-pulse">
              <Crosshair className="w-3.5 h-3.5" />
              Mode Pilih Koordinat: Klik peta untuk menandai titik
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="relative w-full overflow-hidden bg-slate-900 min-h-[480px] sm:min-h-[560px]" ref={svgContainerRef}>
        {/* SVG Interactive Canvas */}
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full cursor-crosshair select-none"
          onClick={svgPointToLatLng}
          style={{
            background:
              mapLayer === 'SATELLITE'
                ? '#1e293b'
                : mapLayer === 'INFRASTRUCTURE'
                ? '#0f172a'
                : '#f8fafc'
          }}
        >
          {/* Map Grid / Grid Lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={mapLayer === 'STREET' ? '#e2e8f0' : '#334155'}
                strokeWidth="0.75"
              />
            </pattern>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          <rect width="1000" height="700" fill="url(#grid)" />

          {/* Environmental Layout & Housing Blocks of GPA Ngijo RT 07 */}
          {/* Main Road: Jl. Permata Raya */}
          <path
            d="M 50 180 Q 300 200 500 200 T 950 220"
            fill="none"
            stroke={mapLayer === 'STREET' ? '#cbd5e1' : '#475569'}
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d="M 50 180 Q 300 200 500 200 T 950 220"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="12,12"
          />
          <text x="70" y="165" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Jl. Permata Raya (Gerbang Utama RT 07)
          </text>

          {/* Gang Lorong Blok A */}
          <path d="M 180 200 L 180 580" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
          <text x="140" y="380" fill="#64748b" fontSize="10" fontWeight="bold" transform="rotate(-90 140 380)">
            Gang Blok A
          </text>

          {/* Gang Lorong Blok B */}
          <path d="M 380 200 L 380 580" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
          <text x="340" y="380" fill="#64748b" fontSize="10" fontWeight="bold" transform="rotate(-90 340 380)">
            Gang Blok B
          </text>

          {/* Gang Lorong Blok C */}
          <path d="M 580 200 L 580 580" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
          <text x="540" y="380" fill="#64748b" fontSize="10" fontWeight="bold" transform="rotate(-90 540 380)">
            Gang Blok C
          </text>

          {/* Gang Lorong Blok D */}
          <path d="M 780 220 L 780 580" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
          <text x="740" y="380" fill="#64748b" fontSize="10" fontWeight="bold" transform="rotate(-90 740 380)">
            Gang Blok D
          </text>

          {/* Sisi Selatan: Jalan Penghubung RT */}
          <path d="M 100 580 L 860 580" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />

          {/* Housing Block Zones */}
          {/* Blok A */}
          <rect x="70" y="240" width="80" height="300" rx="12" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="95" y="390" fill="#94a3b8" fontSize="12" fontWeight="bold">BLOK A</text>

          {/* Blok B */}
          <rect x="220" y="240" width="130" height="300" rx="12" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="265" y="390" fill="#94a3b8" fontSize="12" fontWeight="bold">BLOK B</text>

          {/* Taman Fasum & Balai Warga RT */}
          <rect x="420" y="240" width="120" height="300" rx="16" fill={mapLayer === 'STREET' ? '#ecfdf5' : '#064e3b'} stroke="#a7f3d0" strokeWidth="2" />
          <text x="440" y="270" fill="#047857" fontSize="11" fontWeight="bold">🌿 FASUM & TAMAN</text>
          <text x="440" y="390" fill="#065f46" fontSize="10">Balai RT & Lapangan</text>

          {/* Blok C */}
          <rect x="620" y="240" width="120" height="300" rx="12" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="660" y="390" fill="#94a3b8" fontSize="12" fontWeight="bold">BLOK C</text>

          {/* Blok D */}
          <rect x="820" y="240" width="100" height="300" rx="12" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="850" y="390" fill="#94a3b8" fontSize="12" fontWeight="bold">BLOK D</text>

          {/* Infrastructure Overlay (Drainase Channel Lines) */}
          {mapLayer === 'INFRASTRUCTURE' && (
            <g>
              <path d="M 60 195 L 940 235" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,4" />
              <path d="M 195 200 L 195 590" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,4" />
              <path d="M 395 200 L 395 590" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,4" />
              <path d="M 595 200 L 595 590" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,4" />
              <path d="M 795 220 L 795 590" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,4" />
            </g>
          )}

          {/* Render Facility Markers */}
          {filteredFacilities.map((facility) => {
            const { x, y } = latLngToSvgPoint(facility.latitude, facility.longitude);
            const isSelected = selectedFacility?.fasilitasId === facility.fasilitasId;
            const isHovered = hoveredFacility?.fasilitasId === facility.fasilitasId;
            const isEmergency = facility.tingkatPrioritas === 'DARURAT';
            const conditionColor = CONDITION_METADATA[facility.kondisi]?.dotColor || '#10b981';

            return (
              <g
                key={facility.fasilitasId}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFacility(facility);
                }}
                onMouseEnter={() => setHoveredFacility(facility)}
                onMouseLeave={() => setHoveredFacility(null)}
              >
                {/* Pulse Ring for Emergency / Selected */}
                {(isEmergency || isSelected) && (
                  <circle
                    r={isSelected ? '24' : '20'}
                    fill={isEmergency ? '#ef4444' : '#123B5D'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Marker Outer Circle */}
                <circle
                  r={isSelected ? '18' : '14'}
                  fill={isEmergency ? '#dc2626' : isSelected ? '#123B5D' : '#ffffff'}
                  stroke={isEmergency ? '#fee2e2' : conditionColor}
                  strokeWidth={isSelected ? '4' : '3'}
                  className="shadow-lg drop-shadow"
                />

                {/* Inner Icon Dot / Status Indicator */}
                <circle
                  r="5"
                  fill={isEmergency ? '#ffffff' : conditionColor}
                />

                {/* Label text on Hover or Selected */}
                {(isHovered || isSelected) && (
                  <g transform="translate(0, -28)">
                    <rect
                      x={-facility.namaFasilitas.length * 4 - 12}
                      y="-18"
                      width={facility.namaFasilitas.length * 8 + 24}
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      opacity="0.95"
                    />
                    <text
                      textAnchor="middle"
                      y="-2"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {facility.namaFasilitas}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Coordinate Picker Pin (if active) */}
          {pickerPin && (
            <g
              transform={`translate(${latLngToSvgPoint(pickerPin.lat, pickerPin.lng).x}, ${
                latLngToSvgPoint(pickerPin.lat, pickerPin.lng).y
              })`}
            >
              <circle r="14" fill="#f59e0b" opacity="0.4" className="animate-ping" />
              <circle r="8" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
              <text y="-14" textAnchor="middle" fill="#d97706" fontSize="10" fontWeight="bold">
                Titik Terpilih ({pickerPin.lat}, {pickerPin.lng})
              </text>
            </g>
          )}
        </svg>

        {/* Floating Map Legend & Stats Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] border-b border-slate-100 pb-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#123B5D]" /> Peta RT 07 RW 11 GPA
            </span>
            <span className="text-slate-500 font-normal text-[10px]">
              {filteredFacilities.length} Fasilitas
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Baik ({facilities.filter(f => f.kondisi === 'BAIK').length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Cukup ({facilities.filter(f => f.kondisi === 'CUKUP_BAIK').length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Rusak Ringan ({facilities.filter(f => f.kondisi === 'RUSAK_RINGAN').length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Rusak Sedang ({facilities.filter(f => f.kondisi === 'RUSAK_SEDANG').length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Rusak Berat ({facilities.filter(f => f.kondisi === 'RUSAK_BERAT').length})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> Tidak Layak ({facilities.filter(f => f.kondisi === 'TIDAK_LAYAK').length})
            </div>
          </div>
        </div>

        {/* Selected Facility Card Overlay */}
        {selectedFacility && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedFacility.kodeFasilitas}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      CONDITION_METADATA[selectedFacility.kondisi]?.badgeColor
                    }`}
                  >
                    {CONDITION_METADATA[selectedFacility.kondisi]?.label}
                  </span>
                  {selectedFacility.tingkatPrioritas === 'DARURAT' && (
                    <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      🚨 DARURAT
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  {selectedFacility.namaFasilitas}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {selectedFacility.lokasi}
                </p>
              </div>
              <button
                onClick={() => onSelectFacility(null as any)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedFacility.fotoUtama && (
              <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={selectedFacility.fotoUtama}
                  alt={selectedFacility.namaFasilitas}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Kategori</span>
                <span className="font-semibold text-slate-700">{selectedFacility.kategori}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Skor Kondisi</span>
                <span className="font-bold text-[#123B5D]">{selectedFacility.conditionScore} / 5</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Koordinat GPS</span>
                <span className="font-mono text-slate-600 text-[10px]">
                  {selectedFacility.latitude.toFixed(4)}, {selectedFacility.longitude.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pengaduan Aktif</span>
                <span className="font-bold text-amber-700">{selectedFacility.complaintCount || 0} Laporan</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {onOpenInspectionModal && (
                <button
                  onClick={() => onOpenInspectionModal(selectedFacility)}
                  className="flex-1 bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Catat Inspeksi
                </button>
              )}
              {onOpenReportModal && (
                <button
                  onClick={() => onOpenReportModal(selectedFacility)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Lapor Masalah
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
