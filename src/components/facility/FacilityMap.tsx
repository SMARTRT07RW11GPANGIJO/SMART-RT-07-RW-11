// SMART RT 07 RW 11 GPA NGIJO - REAL-WORLD FIELD SURVEY GIS MAP v2.0
// Production Grade Geospatial Visualization for RT 07 Facilities, Boundary, Roads, and GPS Evidence

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority,
  GeoObject
} from '../../types/facility';
import {
  GPA_NGIJO_BOUNDS,
  FACILITY_CATEGORIES,
  CONDITION_METADATA,
  PRIORITY_METADATA,
  RT07_REFERENCE_BOUNDARY,
  RT07_REFERENCE_ROADS,
  RT07_REFERENCE_DRAINAGE,
  getGPSAccuracyGrade,
  calculateStaleStatus
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
  Compass,
  CheckCircle2,
  Clock,
  Radio,
  Ruler,
  Maximize2
} from 'lucide-react';

interface FacilityMapProps {
  facilities: FasilitasLingkungan[];
  selectedFacility: FasilitasLingkungan | null;
  onSelectFacility: (facility: FasilitasLingkungan) => void;
  onPickCoordinates?: (lat: number, lng: number) => void;
  isCoordinatePickerMode?: boolean;
  onOpenReportModal?: (facility: FasilitasLingkungan) => void;
  onOpenInspectionModal?: (facility: FasilitasLingkungan) => void;
  onOpenFieldSurveyModal?: (facility?: FasilitasLingkungan) => void;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  onPickCoordinates,
  isCoordinatePickerMode = false,
  onOpenReportModal,
  onOpenInspectionModal,
  onOpenFieldSurveyModal
}) => {
  const [mapLayer, setMapLayer] = useState<'STREET' | 'SATELLITE' | 'INFRASTRUCTURE'>('STREET');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FacilityCategory | 'ALL'>('ALL');
  const [conditionFilter, setConditionFilter] = useState<FacilityCondition | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<FacilityPriority | 'ALL'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED'>('ALL');
  const [hoveredFacility, setHoveredFacility] = useState<FasilitasLingkungan | null>(null);
  const [pickerPin, setPickerPin] = useState<{ lat: number; lng: number } | null>(null);

  // Live Surveyor Position State
  const [userGpsLocation, setUserGpsLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showAccuracyRadius, setShowAccuracyRadius] = useState(true);

  // Distance Measurement Tool
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ lat: number; lng: number }[]>([]);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Live Location Tracker
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Number(pos.coords.accuracy.toFixed(1))
        });
        setIsLocatingUser(false);
      },
      () => {
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Convert real lat/lng to SVG canvas percentage coordinates (0 - 1000 x 0 - 700)
  const latLngToSvgPoint = (lat: number, lng: number) => {
    const latSpan = GPA_NGIJO_BOUNDS.maxLat - GPA_NGIJO_BOUNDS.minLat;
    const lngSpan = GPA_NGIJO_BOUNDS.maxLng - GPA_NGIJO_BOUNDS.minLng;

    const yRatio = (GPA_NGIJO_BOUNDS.maxLat - lat) / latSpan;
    const xRatio = (lng - GPA_NGIJO_BOUNDS.minLng) / lngSpan;

    const x = Math.max(30, Math.min(970, xRatio * 1000));
    const y = Math.max(30, Math.min(670, yRatio * 700));

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
      return;
    }

    if (isMeasuring) {
      setMeasurePoints((prev) => (prev.length >= 2 ? [{ lat, lng }] : [...prev, { lat, lng }]));
    }
  };

  // Haversine calculation for measure tool
  const calculatedDistanceMeters = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    const [p1, p2] = measurePoints;
    const R = 6371e3;
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }, [measurePoints]);

  // Convert reference polygon to SVG points string
  const boundarySvgPoints = useMemo(() => {
    return RT07_REFERENCE_BOUNDARY.polygon
      .map(([lat, lng]) => {
        const pt = latLngToSvgPoint(lat, lng);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  }, []);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (f.status === 'DIHAPUS') return false;
      if (categoryFilter !== 'ALL' && f.kategori !== categoryFilter) return false;
      if (conditionFilter !== 'ALL' && f.kondisi !== conditionFilter) return false;
      if (priorityFilter !== 'ALL' && f.tingkatPrioritas !== priorityFilter) return false;
      if (verificationFilter !== 'ALL') {
        const status = f.surveyStatus || f.locationStatus || 'VERIFIED';
        if (status !== verificationFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.namaFasilitas.toLowerCase().includes(q);
        const matchesCode = f.kodeFasilitas.toLowerCase().includes(q);
        const matchesLocation = f.lokasi.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesLocation) return false;
      }
      return true;
    });
  }, [facilities, categoryFilter, conditionFilter, priorityFilter, verificationFilter, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top Filter & Search Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari titik fasilitas..."
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

          {/* Verification Status Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as any)}
            className="text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Status Validasi</option>
            <option value="VERIFIED">✅ Terverifikasi</option>
            <option value="PENDING">⏳ Menunggu Verifikasi</option>
            <option value="UNVERIFIED">⚠️ Belum Diverifikasi</option>
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
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
          {/* Layer switcher */}
          <div className="bg-slate-200 p-0.5 rounded-xl flex items-center text-[11px] font-bold">
            <button
              onClick={() => setMapLayer('STREET')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapLayer === 'STREET' ? 'bg-[#123B5D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vektor
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
              Drainase
            </button>
          </div>

          {/* Live Surveyor GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocatingUser}
            title="Deteksi Lokasi GPS Saya di Lapangan"
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Posisi Saya</span>
          </button>

          {/* Measure Tool Toggle */}
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              isMeasuring
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMeasuring ? 'Ukur: Aktif' : 'Ukur Jarak'}</span>
          </button>

          {/* Field Survey Quick Action */}
          {onOpenFieldSurveyModal && (
            <button
              onClick={() => onOpenFieldSurveyModal()}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Survey Lapangan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="relative w-full overflow-hidden bg-slate-950 min-h-[500px] sm:min-h-[580px]" ref={svgContainerRef}>
        {/* SVG Interactive Canvas */}
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full cursor-crosshair select-none"
          onClick={svgPointToLatLng}
          style={{
            background:
              mapLayer === 'SATELLITE'
                ? '#0f172a'
                : mapLayer === 'INFRASTRUCTURE'
                ? '#090d16'
                : '#f8fafc'
          }}
        >
          {/* Map Grid / Grid Lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={mapLayer === 'STREET' ? '#e2e8f0' : '#1e293b'}
                strokeWidth="0.75"
              />
            </pattern>
          </defs>

          <rect width="1000" height="700" fill="url(#grid)" />

          {/* RT 07 Official Boundary Polygon (Section 13) */}
          {showBoundary && (
            <g id="rt07-boundary">
              <polygon
                points={boundarySvgPoints}
                fill={mapLayer === 'STREET' ? '#123B5D' : '#38bdf8'}
                fillOpacity={mapLayer === 'STREET' ? '0.04' : '0.08'}
                stroke={mapLayer === 'STREET' ? '#123B5D' : '#38bdf8'}
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <text x="80" y="60" fill={mapLayer === 'STREET' ? '#123B5D' : '#38bdf8'} fontSize="11" fontWeight="bold">
                BATAS REFERENSI WILAYAH RT 07 RW 11 GPA NGIJO
              </text>
              <text x="80" y="75" fill="#94a3b8" fontSize="9">
                [REFERENCE: UNVERIFIED] Menunggu Survey GPS Batas
              </text>
            </g>
          )}

          {/* Road Network Lines (Section 14) */}
          <g id="road-network">
            {RT07_REFERENCE_ROADS.map((road) => {
              const svgPoints = road.points
                .map(([lat, lng]) => {
                  const pt = latLngToSvgPoint(lat, lng);
                  return `${pt.x},${pt.y}`;
                })
                .join(' ');
              const isMain = road.type === 'JALAN_UTAMA';

              return (
                <g key={road.roadId}>
                  <polyline
                    points={svgPoints}
                    fill="none"
                    stroke={mapLayer === 'STREET' ? '#cbd5e1' : '#334155'}
                    strokeWidth={isMain ? '26' : '16'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {isMain && (
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="8,8"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Road Labels */}
          <text x="70" y="175" fill="#64748b" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Jl. Permata Raya (Akses Utama RT 07)
          </text>
          <text x="145" y="380" fill="#94a3b8" fontSize="10" fontWeight="bold" transform="rotate(-90 145 380)">
            Gang 1 (Blok A)
          </text>
          <text x="345" y="380" fill="#94a3b8" fontSize="10" fontWeight="bold" transform="rotate(-90 345 380)">
            Gang 2 (Blok B)
          </text>
          <text x="545" y="380" fill="#94a3b8" fontSize="10" fontWeight="bold" transform="rotate(-90 545 380)">
            Gang 3 (Blok C)
          </text>

          {/* Housing Block Zones */}
          {/* Blok A */}
          <rect x="70" y="240" width="80" height="300" rx="10" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1" />
          <text x="95" y="390" fill="#94a3b8" fontSize="11" fontWeight="bold">BLOK A</text>

          {/* Blok B */}
          <rect x="220" y="240" width="130" height="300" rx="10" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1" />
          <text x="265" y="390" fill="#94a3b8" fontSize="11" fontWeight="bold">BLOK B</text>

          {/* Fasum & Balai Warga */}
          <rect x="420" y="240" width="120" height="300" rx="14" fill={mapLayer === 'STREET' ? '#ecfdf5' : '#064e3b'} stroke="#a7f3d0" strokeWidth="1.5" />
          <text x="440" y="270" fill="#047857" fontSize="11" fontWeight="bold">🌿 FASUM & TAMAN</text>
          <text x="440" y="390" fill="#065f46" fontSize="10">Balai RT & Pendopo</text>

          {/* Blok C */}
          <rect x="620" y="240" width="120" height="300" rx="10" fill={mapLayer === 'STREET' ? '#f1f5f9' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1" />
          <text x="660" y="390" fill="#94a3b8" fontSize="11" fontWeight="bold">BLOK C</text>

          {/* Drainage Overlay */}
          {mapLayer === 'INFRASTRUCTURE' && (
            <g id="drainage-layer">
              {RT07_REFERENCE_DRAINAGE.map((drain) => {
                const svgPoints = drain.points
                  .map(([lat, lng]) => {
                    const pt = latLngToSvgPoint(lat, lng);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ');
                return (
                  <g key={drain.drainId}>
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeDasharray="5,5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Measurement Distance Line */}
          {measurePoints.length > 0 && (
            <g id="measure-layer">
              {measurePoints.map((pt, idx) => {
                const sPt = latLngToSvgPoint(pt.lat, pt.lng);
                return (
                  <circle
                    key={idx}
                    cx={sPt.x}
                    cy={sPt.y}
                    r="6"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
              {measurePoints.length === 2 && (
                <>
                  <line
                    x1={latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).x}
                    y1={latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).y}
                    x2={latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).x}
                    y2={latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).y}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  <rect
                    x={(latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).x + latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).x) / 2 - 40}
                    y={(latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).y + latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).y) / 2 - 14}
                    width="80"
                    height="20"
                    rx="6"
                    fill="#0f172a"
                  />
                  <text
                    x={(latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).x + latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).x) / 2}
                    y={(latLngToSvgPoint(measurePoints[0].lat, measurePoints[0].lng).y + latLngToSvgPoint(measurePoints[1].lat, measurePoints[1].lng).y) / 2}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {calculatedDistanceMeters} m
                  </text>
                </>
              )}
            </g>
          )}

          {/* User Live GPS Marker */}
          {userGpsLocation && (
            <g
              transform={`translate(${latLngToSvgPoint(userGpsLocation.lat, userGpsLocation.lng).x}, ${
                latLngToSvgPoint(userGpsLocation.lat, userGpsLocation.lng).y
              })`}
            >
              <circle r="30" fill="#3b82f6" opacity="0.2" className="animate-ping" />
              <circle r="16" fill="#3b82f6" opacity="0.3" />
              <circle r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              <text y="-18" textAnchor="middle" fill="#2563eb" fontSize="10" fontWeight="bold">
                Posisi Anda (±{userGpsLocation.accuracy}m)
              </text>
            </g>
          )}

          {/* Facility Markers with Accuracy Buffers and Status Tags */}
          {filteredFacilities.map((facility) => {
            const { x, y } = latLngToSvgPoint(facility.latitude, facility.longitude);
            const isSelected = selectedFacility?.fasilitasId === facility.fasilitasId;
            const isHovered = hoveredFacility?.fasilitasId === facility.fasilitasId;
            const isEmergency = facility.tingkatPrioritas === 'DARURAT';
            const conditionColor = CONDITION_METADATA[facility.kondisi]?.dotColor || '#10b981';
            const accMeters = facility.accuracyMeters || facility.akurasiLokasi || 4;
            const staleInfo = calculateStaleStatus(facility.lastSurveyedAt);

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
                {/* Accuracy Radius Buffer Circle (Section 7) */}
                {showAccuracyRadius && (
                  <circle
                    r={Math.max(10, Math.min(45, accMeters * 3))}
                    fill={conditionColor}
                    opacity={isSelected ? '0.25' : '0.12'}
                    stroke={conditionColor}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                )}

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
                  r={isSelected ? '16' : '12'}
                  fill={isEmergency ? '#dc2626' : isSelected ? '#123B5D' : '#ffffff'}
                  stroke={isEmergency ? '#fee2e2' : conditionColor}
                  strokeWidth={isSelected ? '3.5' : '2.5'}
                  className="shadow-md"
                />

                {/* Inner Icon Dot / Status Indicator */}
                <circle
                  r="4.5"
                  fill={isEmergency ? '#ffffff' : conditionColor}
                />

                {/* Stale Data Indicator Dot (top right of marker) */}
                <circle
                  cx="8"
                  cy="-8"
                  r="3.5"
                  fill={
                    staleInfo.status === 'FRESH'
                      ? '#10b981'
                      : staleInfo.status === 'AGING'
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  stroke="#ffffff"
                  strokeWidth="1"
                />

                {/* Hover / Selected Tooltip Tag */}
                {(isHovered || isSelected) && (
                  <g transform="translate(0, -26)">
                    <rect
                      x={-facility.namaFasilitas.length * 4 - 14}
                      y="-18"
                      width={facility.namaFasilitas.length * 8 + 28}
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

        {/* HUD Info Bar (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] border-b border-slate-100 pb-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#123B5D]" /> GeoBase RT 07 RW 11 GPA
            </span>
            <span className="text-slate-500 font-mono text-[10px]">WGS84 Datum</span>
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
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Rusak Berat ({facilities.filter(f => f.kondisi === 'RUSAK_BERAT').length})
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
            <span>Stale Key: 🟢 Fresh 🟡 Aging 🔴 Stale</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showAccuracyRadius}
                onChange={(e) => setShowAccuracyRadius(e.target.checked)}
                className="w-3 h-3 rounded text-indigo-600"
              />
              Akurasi Buffer
            </label>
          </div>
        </div>

        {/* Selected Facility Card Overlay */}
        {selectedFacility && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
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
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {selectedFacility.coordinateSource || 'SURVEYED'}
                  </span>
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
                <span className="text-slate-400 block text-[10px]">Akurasi GPS</span>
                <span className="font-semibold text-slate-700">
                  ± {selectedFacility.accuracyMeters || selectedFacility.akurasiLokasi || 4} m
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status Validasi</span>
                <span className="font-bold text-emerald-700">
                  {selectedFacility.surveyStatus || 'TERVERIFIKASI'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Koordinat GPS</span>
                <span className="font-mono text-slate-600 text-[10px]">
                  {selectedFacility.latitude.toFixed(5)}, {selectedFacility.longitude.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Survey Terakhir</span>
                <span className="font-medium text-slate-700 text-[10px]">
                  {selectedFacility.lastSurveyedAt
                    ? new Date(selectedFacility.lastSurveyedAt).toLocaleDateString('id-ID')
                    : 'Belum Survey'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenFieldSurveyModal && (
                <button
                  onClick={() => onOpenFieldSurveyModal(selectedFacility)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> Re-Survey GPS
                </button>
              )}
              {onOpenInspectionModal && (
                <button
                  onClick={() => onOpenInspectionModal(selectedFacility)}
                  className="flex-1 bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspeksi
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

