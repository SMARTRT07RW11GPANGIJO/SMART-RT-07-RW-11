// SMART RT 07 RW 11 GPA NGIJO - REAL-WORLD FIELD SURVEY GIS MAP v2.0
// Production Grade Geospatial Visualization for RT 07 Facilities, Boundary, Roads, and GPS Evidence

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

// Helper component to draw polygon
const MapPolygon: React.FC<{ paths: {lat: number, lng: number}[], options: any }> = ({ paths, options }) => {
  const map = useMap();
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;
    const p = new google.maps.Polygon({ paths, ...options });
    p.setMap(map);
    setPolygon(p);
    return () => p.setMap(null);
  }, [map, paths, options]);

  return null;
}

// Helper component to draw polyline
const MapPolyline: React.FC<{ path: {lat: number, lng: number}[], options: any }> = ({ path, options }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    const p = new google.maps.Polyline({ path, ...options });
    p.setMap(map);
    setPolyline(p);
    return () => p.setMap(null);
  }, [map, path, options]);

  return null;
}

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


const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

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
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'FIELD_VERIFIED' | 'PENDING_REVIEW' | 'REFERENCE_UNVERIFIED'>('ALL');
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
  const [useVectorFallback, setUseVectorFallback] = useState(!hasValidKey);

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
        const status = f.surveyStatus || f.locationStatus || 'FIELD_VERIFIED';
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
        
        {/* Interactive Map View (Google Maps Platform or GIS Vector Fallback) */}
        {!hasValidKey || useVectorFallback ? (
          <div className="absolute inset-0 bg-[#0c1626] select-none">
            <svg
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 1000 700"
              preserveAspectRatio="xMidYMid meet"
              onClick={svgPointToLatLng}
            >
              {/* Grid Background Pattern */}
              <defs>
                <pattern id="gisGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.6" />
                </pattern>
              </defs>
              <rect width="1000" height="700" fill="url(#gisGrid)" />

              {/* RT 07 Boundary Polygon */}
              {showBoundary && (
                <polygon
                  points={boundarySvgPoints}
                  fill="#ef4444"
                  fillOpacity="0.08"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
              )}

              {/* RT 07 Reference Road Network */}
              {showBoundary &&
                RT07_REFERENCE_ROADS.map((road) => {
                  const pts = road.points.map((p) => latLngToSvgPoint(p[0], p[1]));
                  const pathStr = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                  return (
                    <g key={road.roadId}>
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={road.type === 'MAIN_ROAD' ? '14' : '8'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={pathStr}
                        fill="none"
                        stroke={road.type === 'MAIN_ROAD' ? '#94a3b8' : '#64748b'}
                        strokeWidth={road.type === 'MAIN_ROAD' ? '10' : '4'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}

              {/* Measurement Line */}
              {measurePoints.length > 0 && (
                <polyline
                  points={measurePoints.map((p) => {
                    const pt = latLngToSvgPoint(p.lat, p.lng);
                    return `${pt.x},${pt.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="4,4"
                />
              )}

              {/* Facility Markers on SVG */}
              {filteredFacilities.map((facility) => {
                const pt = latLngToSvgPoint(facility.latitude, facility.longitude);
                const isSelected = selectedFacility?.fasilitasId === facility.fasilitasId;
                const isHovered = hoveredFacility?.fasilitasId === facility.fasilitasId;
                const isEmergency = facility.tingkatPrioritas === 'DARURAT';

                let statusColor = '#94a3b8';
                if (facility.surveyStatus === 'FIELD_VERIFIED' || facility.locationStatus === 'FIELD_VERIFIED') statusColor = '#10b981';
                else if (facility.surveyStatus === 'PENDING_REVIEW' || facility.locationStatus === 'PENDING_REVIEW') statusColor = '#f97316';
                else if (facility.surveyStatus === 'REJECTED' || facility.locationStatus === 'REJECTED') statusColor = '#ef4444';
                else if (facility.surveyStatus === 'RESURVEY_REQUIRED') statusColor = '#a855f7';
                else if (facility.surveyStatus === 'REFERENCE_UNVERIFIED' || facility.locationStatus === 'REFERENCE_UNVERIFIED' || !facility.surveyStatus) statusColor = '#eab308';

                return (
                  <g
                    key={facility.fasilitasId}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFacility(facility);
                    }}
                    onMouseEnter={() => setHoveredFacility(facility)}
                    onMouseLeave={() => setHoveredFacility(null)}
                  >
                    {/* Accuracy Buffer Circle */}
                    {showAccuracyRadius && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={Math.max(8, (facility.accuracyMeters || facility.akurasiLokasi || 5) * 1.8)}
                        fill={statusColor}
                        fillOpacity="0.12"
                        stroke={statusColor}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Pulse effect if selected or emergency */}
                    {(isSelected || isEmergency) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 18 : 14}
                        fill={isEmergency ? '#ef4444' : '#6366f1'}
                        fillOpacity="0.3"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer Ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? '#123B5D' : '#ffffff'}
                      stroke={isEmergency ? '#dc2626' : statusColor}
                      strokeWidth="2.5"
                    />

                    {/* Center Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 4 : 3}
                      fill={isEmergency ? '#ffffff' : statusColor}
                    />

                    {/* Text Label on hover or selected */}
                    {(isHovered || isSelected) && (
                      <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                        <rect
                          x="-60"
                          y="-16"
                          width="120"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                          fillOpacity="0.95"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-4"
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {facility.namaFasilitas.length > 18
                            ? facility.namaFasilitas.substring(0, 16) + '...'
                            : facility.namaFasilitas}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* User Live GPS Marker */}
              {userGpsLocation && (() => {
                const pt = latLngToSvgPoint(userGpsLocation.lat, userGpsLocation.lng);
                return (
                  <g transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle r="22" fill="#3b82f6" fillOpacity="0.2" className="animate-pulse" />
                    <circle r="12" fill="#3b82f6" fillOpacity="0.3" />
                    <circle r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="-14" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">
                      Posisi Anda (±{userGpsLocation.accuracy}m)
                    </text>
                  </g>
                );
              })()}

              {/* Coordinate Picker Pin */}
              {pickerPin && (() => {
                const pt = latLngToSvgPoint(pickerPin.lat, pickerPin.lng);
                return (
                  <g transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle r="16" fill="#f59e0b" fillOpacity="0.3" className="animate-ping" />
                    <circle r="6" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="-12" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">
                      Titik Terpilih
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        ) : (
        <APIProvider apiKey={API_KEY} version="weekly">
          <div className="absolute inset-0">
            <Map
              defaultCenter={{lat: GPA_NGIJO_BOUNDS.centerLat, lng: GPA_NGIJO_BOUNDS.centerLng}}
              defaultZoom={GPA_NGIJO_BOUNDS.defaultZoom}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              disableDefaultUI={true}
              mapTypeId={mapLayer === 'SATELLITE' ? 'hybrid' : 'roadmap'}
              onClick={(e) => {
                if (isCoordinatePickerMode && onPickCoordinates && e.detail.latLng) {
                  onPickCoordinates(e.detail.latLng.lat, e.detail.latLng.lng);
                  setPickerPin({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                } else if (isMeasuring && e.detail.latLng) {
                  setMeasurePoints(prev => prev.length >= 2 ? [{lat: e.detail.latLng!.lat, lng: e.detail.latLng!.lng}] : [...prev, {lat: e.detail.latLng!.lat, lng: e.detail.latLng!.lng}]);
                } else {
                  onSelectFacility(null as any);
                }
              }}
            >
              {/* Boundary */}
              {showBoundary && (
                <MapPolygon
                  paths={RT07_REFERENCE_BOUNDARY.polygon.map(p => ({lat: p[0], lng: p[1]}))}
                  options={{
                    fillColor: '#ef4444',
                    fillOpacity: 0.05,
                    strokeColor: '#ef4444',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    strokeDasharray: '5,5'
                  }}
                />
              )}

              {/* Roads */}
              {showBoundary && RT07_REFERENCE_ROADS.map(road => (
                <MapPolyline
                  key={road.roadId}
                  path={road.points.map(p => ({lat: p[0], lng: p[1]}))}
                  options={{
                    strokeColor: mapLayer === 'STREET' ? '#cbd5e1' : '#334155',
                    strokeOpacity: 1,
                    strokeWeight: road.type === 'MAIN_ROAD' ? 12 : 6,
                  }}
                />
              ))}

              {/* Measurement */}
              {measurePoints.length > 0 && (
                <MapPolyline
                  path={measurePoints}
                  options={{
                    strokeColor: '#f59e0b',
                    strokeOpacity: 1,
                    strokeWeight: 4,
                  }}
                />
              )}
              {measurePoints.length === 2 && (
                <AdvancedMarker 
                  position={{
                    lat: (measurePoints[0].lat + measurePoints[1].lat) / 2,
                    lng: (measurePoints[0].lng + measurePoints[1].lng) / 2
                  }} 
                  zIndex={1000}
                >
                  <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                    {calculatedDistanceMeters} m
                  </div>
                </AdvancedMarker>
              )}

              {/* Facilities */}
              {filteredFacilities.map(facility => {
                const isSelected = selectedFacility?.fasilitasId === facility.fasilitasId;
                const isHovered = hoveredFacility?.fasilitasId === facility.fasilitasId;
                const isEmergency = facility.tingkatPrioritas === 'DARURAT';
                
                let statusColor = '#94a3b8'; // default gray
                if (facility.surveyStatus === 'FIELD_VERIFIED' || facility.locationStatus === 'FIELD_VERIFIED') statusColor = '#10b981';
                else if (facility.surveyStatus === 'PENDING_REVIEW' || facility.locationStatus === 'PENDING_REVIEW') statusColor = '#f97316';
                else if (facility.surveyStatus === 'REJECTED' || facility.locationStatus === 'REJECTED') statusColor = '#ef4444';
                else if (facility.surveyStatus === 'RESURVEY_REQUIRED') statusColor = '#a855f7';
                else if (facility.surveyStatus === 'REFERENCE_UNVERIFIED' || facility.locationStatus === 'REFERENCE_UNVERIFIED' || !facility.surveyStatus) statusColor = '#eab308';
                
                const zIndex = isSelected ? 100 : (isEmergency ? 90 : 10);

                return (
                  <AdvancedMarker
                    key={facility.fasilitasId}
                    position={{lat: facility.latitude, lng: facility.longitude}}
                    zIndex={zIndex}
                    onClick={() => onSelectFacility(facility)}
                    onMouseEnter={() => setHoveredFacility(facility)}
                    onMouseLeave={() => setHoveredFacility(null)}
                  >
                    <div className="relative flex items-center justify-center">
                      {(isSelected || isEmergency) && (
                        <div className={`absolute w-12 h-12 rounded-full opacity-30 animate-ping ${isEmergency ? 'bg-red-500' : 'bg-indigo-600'}`}></div>
                      )}
                      <div 
                        className={`w-6 h-6 rounded-full border-2 shadow-md flex items-center justify-center transition-transform ${isSelected ? 'scale-125' : ''}`}
                        style={{ backgroundColor: isEmergency ? '#dc2626' : (isSelected ? '#123B5D' : '#ffffff'), borderColor: isEmergency ? '#fee2e2' : statusColor }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isEmergency ? '#ffffff' : statusColor }}></div>
                      </div>
                      
                      {(isHovered || isSelected) && (
                        <div className="absolute top-[-30px] whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg z-50">
                          {facility.namaFasilitas}
                        </div>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* User Live GPS Marker */}
              {userGpsLocation && (
                <AdvancedMarker position={{lat: userGpsLocation.lat, lng: userGpsLocation.lng}} zIndex={999}>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-14 h-14 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                    <div className="absolute w-8 h-8 rounded-full bg-blue-500 opacity-30"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
                    <div className="absolute top-[-24px] whitespace-nowrap text-blue-600 text-[10px] font-bold text-shadow-sm">
                      Posisi Anda (±{userGpsLocation.accuracy}m)
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Picker Pin */}
              {pickerPin && (
                <AdvancedMarker position={{lat: pickerPin.lat, lng: pickerPin.lng}} zIndex={999}>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-10 h-10 rounded-full bg-amber-500 opacity-40 animate-ping"></div>
                    <div className="w-4 h-4 rounded-full bg-amber-600 border-2 border-white shadow-lg"></div>
                    <div className="absolute top-[-24px] whitespace-nowrap text-amber-700 text-[10px] font-bold">
                      Titik Terpilih
                    </div>
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </div>
        </APIProvider>
        )}


        {/* HUD Info Bar (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-lg text-xs space-y-2 max-w-sm pointer-events-auto">
          {/* Trust Status Header (Section 44) */}
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] border-b border-slate-100 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#123B5D]" /> GEOBASE TRUST STATUS
            </span>
            {(() => {
              const total = facilities.filter(f => f.status !== 'DIHAPUS').length;
              const verified = facilities.filter(f => f.status !== 'DIHAPUS' && (f.surveyStatus === 'FIELD_VERIFIED' || f.locationStatus === 'FIELD_VERIFIED')).length;
              const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
              const trustLevel = pct >= 80 ? 'HIGH' : pct >= 50 ? 'MEDIUM' : 'LOW';
              const badgeStyle = pct >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : pct >= 50 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300';
              return (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                  KEPERCAYAAN: {trustLevel} ({pct}%)
                </span>
              );
            })()}
          </div>

          {/* Map Legend (Section 17) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">LEGENDA STATUS DATA:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 🟢 Field Verified
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> 🟠 Pending Review
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> 🟡 Reference Unverified
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> 🔴 Rejected
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> 🟣 Resurvey Required
              </div>
            </div>
          </div>

          {/* Section 45: No False Claim Notice */}
          <div className="pt-1.5 border-t border-slate-100 text-[9px] text-slate-500 italic leading-tight">
            "Peta berisi kombinasi data terverifikasi, data referensi, dan data yang menunggu verifikasi."
          </div>

          <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500">
            <span>Stale: 🟢&lt;90h 🟡&lt;180h 🔴&gt;180h</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showAccuracyRadius}
                onChange={(e) => setShowAccuracyRadius(e.target.checked)}
                className="w-3 h-3 rounded text-indigo-600"
              />
              Akurasi Buffer (±m)
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
                <span className={`font-bold text-[10px] ${
                  (selectedFacility.surveyStatus === 'FIELD_VERIFIED' || selectedFacility.locationStatus === 'FIELD_VERIFIED') 
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  {(selectedFacility.surveyStatus === 'FIELD_VERIFIED' || selectedFacility.locationStatus === 'FIELD_VERIFIED') 
                    ? 'REAL-WORLD VERIFIED' 
                    : (selectedFacility.surveyStatus === 'REFERENCE_UNVERIFIED' || selectedFacility.locationStatus === 'REFERENCE_UNVERIFIED' || !selectedFacility.surveyStatus)
                    ? 'REFERENCE — BELUM DIVERIFIKASI LAPANGAN'
                    : selectedFacility.surveyStatus?.replace(/_/g, ' ') || 'TERVERIFIKASI'}
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

