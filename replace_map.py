import re

with open('src/components/facility/FacilityMap.tsx', 'r') as f:
    content = f.read()

# Add imports at the top
import_block = """import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

// Helper component to draw polygon
function MapPolygon({ paths, options }: { paths: {lat: number, lng: number}[], options: any }) {
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
function MapPolyline({ path, options }: { path: {lat: number, lng: number}[], options: any }) {
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
"""

# Find where imports start and inject it
content = content.replace("import React, { useState, useRef, useMemo, useEffect } from 'react';", "import React, { useState, useRef, useMemo, useEffect } from 'react';\n" + import_block)

# The API_KEY definition and splash screen logic goes inside the component or outside
api_key_logic = """
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';
"""
content = content.replace("export const FacilityMap: React.FC<FacilityMapProps> = ({", api_key_logic + "\nexport const FacilityMap: React.FC<FacilityMapProps> = ({")

splash_screen = """
  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 rounded-3xl border border-slate-200">
        <div className="text-center max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Google Maps API Key Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            Sistem GeoBase membutuhkan koneksi ke Google Maps Platform untuk memuat peta digital lingkungan RT 07.
          </p>
          <div className="text-left text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-700 mb-2">Langkah Pemasangan:</p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Dapatkan API Key dari <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Cloud Console</a>.</li>
              <li>Buka <strong>Settings</strong> (ikon ⚙️ gear di pojok kanan atas).</li>
              <li>Pilih menu <strong>Secrets</strong>.</li>
              <li>Ketik <code className="bg-slate-200 px-1 py-0.5 rounded">GOOGLE_MAPS_PLATFORM_KEY</code> lalu tekan Enter.</li>
              <li>Tempelkan API Key Anda dan tekan Enter.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500 italic">Aplikasi akan melakukan reload secara otomatis setelah kunci dimasukkan.</p>
          </div>
        </div>
      </div>
    );
  }
"""

content = content.replace("const handleLocateMe = () => {", splash_screen + "\n  const handleLocateMe = () => {")

# Extract the SVG part
# We need to replace everything from <div className="relative w-full overflow-hidden bg-slate-950 min-h-[500px] sm:min-h-[580px]" ref={svgContainerRef}> 
# to the end of <svg> tag.
# It ends at </svg> which is followed by {/* HUD Info Bar (Bottom Left) */}

import re

# Match the <svg ... </svg> tag block
# Wait, let's match <div className="relative... until </svg> ? No, the <div> contains both the map AND the HUD.
# Let's match from <svg to </svg>
svg_pattern = re.compile(r'<svg.*?</svg>', re.DOTALL)

google_map_replacement = """
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
                  path={road.path.map(p => ({lat: p[0], lng: p[1]}))}
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
"""

new_content = svg_pattern.sub(google_map_replacement, content)

with open('src/components/facility/FacilityMap.tsx', 'w') as f:
    f.write(new_content)

print("Done")
