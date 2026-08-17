// SMART RT 07 RW 11 GPA NGIJO - FACILITY DETAIL MODAL v1.0
// Comprehensive View of Facility Master Data, Health Scores, Inspections, and Maintenance

import React, { useState } from 'react';
import {
  FasilitasLingkungan,
  FacilityInspection,
  FacilityMaintenance,
  FacilityComplaintReport
} from '../../types/facility';
import {
  CONDITION_METADATA,
  PRIORITY_METADATA
} from '../../config/facilityConfig';
import {
  X,
  MapPin,
  Calendar,
  Shield,
  Eye,
  Wrench,
  AlertTriangle,
  FileText,
  User,
  Phone,
  DollarSign,
  Tag,
  Clock,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';

interface FacilityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FasilitasLingkungan | null;
  inspections: FacilityInspection[];
  maintenanceList: FacilityMaintenance[];
  complaints: FacilityComplaintReport[];
  currentUserRole: string;
  onEdit?: (facility: FasilitasLingkungan) => void;
  onDelete?: (facility: FasilitasLingkungan) => void;
  onInspect?: (facility: FasilitasLingkungan) => void;
  onMaintain?: (facility: FasilitasLingkungan) => void;
  onReportProblem?: (facility: FasilitasLingkungan) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  isOpen,
  onClose,
  facility,
  inspections,
  maintenanceList,
  complaints,
  currentUserRole,
  onEdit,
  onDelete,
  onInspect,
  onMaintain,
  onReportProblem
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSPECTIONS' | 'MAINTENANCE' | 'COMPLAINTS'>('OVERVIEW');

  if (!isOpen || !facility) return null;

  const isPengurus = ['ADMIN', 'KETUA_RT', 'SEKRETARIS_RT', 'BENDAHARA_RT', 'SEKSI_KEGIATAN'].includes(currentUserRole.toUpperCase());
  const conditionMeta = CONDITION_METADATA[facility.kondisi];
  const priorityMeta = PRIORITY_METADATA[facility.tingkatPrioritas];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                {facility.kodeFasilitas}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${conditionMeta?.badgeColor}`}>
                {conditionMeta?.label}
              </span>
              {facility.tingkatPrioritas === 'DARURAT' && (
                <span className="text-[10px] font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                  🚨 DARURAT
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                {facility.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {facility.namaFasilitas}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {facility.lokasi} — {facility.alamatSingkat}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-4 bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'OVERVIEW'
                ? 'border-[#123B5D] text-[#123B5D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Ringkasan & Profil
          </button>
          <button
            onClick={() => setActiveTab('INSPECTIONS')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'INSPECTIONS'
                ? 'border-[#123B5D] text-[#123B5D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Pemeriksaan ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('MAINTENANCE')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'MAINTENANCE'
                ? 'border-[#123B5D] text-[#123B5D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Pemeliharaan ({maintenanceList.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLAINTS')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'COMPLAINTS'
                ? 'border-[#123B5D] text-[#123B5D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Pengaduan ({complaints.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              {/* Photo & Condition Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  {facility.fotoUtama ? (
                    <img
                      src={facility.fotoUtama}
                      alt={facility.namaFasilitas}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Foto belum tersedia
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">Skor Kelayakan Fisik</span>
                      <span className="font-extrabold text-[#123B5D] text-sm">
                        {facility.conditionScore} / 5
                      </span>
                    </div>
                    {/* Condition Meter */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(facility.conditionScore / 5) * 100}%`,
                          backgroundColor: conditionMeta?.dotColor || '#10B981'
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Evaluasi kondisi: <strong className="text-slate-700">{conditionMeta?.label}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kategori</span>
                      <span className="font-bold text-slate-800">{facility.kategori}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Subkategori</span>
                      <span className="font-semibold text-slate-700">{facility.subkategori?.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Koordinat GIS</span>
                      <span className="font-mono text-slate-700">
                        {facility.latitude.toFixed(6)}, {facility.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Akurasi Lokasi</span>
                      <span className="font-semibold text-slate-700">±{facility.akurasiLokasi} meter</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-800 text-xs">Deskripsi & Catatan Teknis</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {facility.deskripsi || 'Belum ada deskripsi spesifik untuk fasilitas ini.'}
                </p>
              </div>

              {/* PIC & Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#123B5D]" /> Penanggung Jawab Fasilitas (PIC)
                  </h4>
                  <p className="font-semibold text-slate-800 text-xs">
                    {facility.penanggungJawabNama || 'Pengurus RT 07'}
                  </p>
                  {isPengurus && facility.teleponPIC && (
                    <p className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {facility.teleponPIC}
                    </p>
                  )}
                </div>

                {isPengurus && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Nilai Aset & Estimasi Perbaikan
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Nilai Aset</span>
                        <span className="font-bold text-slate-800">
                          Rp {(facility.estimasiNilaiAset || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Est. Perbaikan</span>
                        <span className="font-bold text-rose-700">
                          Rp {(facility.estimasiBiayaPerbaikan || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Events */}
              {facility.linkedEventIds && facility.linkedEventIds.length > 0 && (
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-1.5">
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" /> Terkait dengan Kegiatan RT
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {facility.linkedEventIds.map((evtId) => (
                      <span
                        key={evtId}
                        className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-800 font-mono text-[10px] font-bold"
                      >
                        {evtId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'INSPECTIONS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Histori Pemeriksaan Berkala</span>
                {onInspect && isPengurus && (
                  <button
                    onClick={() => onInspect(facility)}
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> Catat Pemeriksaan Baru
                  </button>
                )}
              </div>

              {inspections.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  Belum ada catatan pemeriksaan untuk fasilitas ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {inspections.map((insp) => (
                    <div
                      key={insp.inspectionId}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {insp.inspectionId}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {insp.tanggalPemeriksaan}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">Transisi Kondisi:</span>
                        <span className="font-bold text-slate-700">{insp.kondisiSebelum}</span>
                        <span>→</span>
                        <span className="font-bold text-[#123B5D]">{insp.kondisiSesudah}</span>
                      </div>
                      <p className="text-slate-700 text-xs">
                        <strong>Temuan:</strong> {insp.temuan}
                      </p>
                      <p className="text-slate-600 text-xs">
                        <strong>Rekomendasi:</strong> {insp.rekomendasi}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                        <span>Pemeriksa: {insp.pemeriksaNama} ({insp.pemeriksaRole})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'MAINTENANCE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Histori Pemeliharaan & Perbaikan</span>
                {onMaintain && isPengurus && (
                  <button
                    onClick={() => onMaintain(facility)}
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Usulkan Pemeliharaan
                  </button>
                )}
              </div>

              {maintenanceList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  Belum ada histori pemeliharaan untuk fasilitas ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {maintenanceList.map((m) => (
                    <div
                      key={m.maintenanceId}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {m.maintenanceId}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {m.status}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-xs">{m.jenisPemeliharaan.replace(/_/g, ' ')}</h5>
                      <p className="text-slate-600 text-xs">{m.deskripsi}</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Biaya Aktual</span>
                          <span className="font-bold text-slate-800">
                            Rp {(m.biaya || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Sumber Dana</span>
                          <span className="font-semibold text-slate-700">{m.sumberDana}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'COMPLAINTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Laporan & Pengaduan Warga</span>
                {onReportProblem && (
                  <button
                    onClick={() => onReportProblem(facility)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Laporkan Kerusakan
                  </button>
                )}
              </div>

              {complaints.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  Tidak ada laporan kerusakan aktif untuk fasilitas ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {complaints.map((c) => (
                    <div
                      key={c.complaintId}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{c.jenisMasalah}</span>
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{c.deskripsi}</p>
                      <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                        <span>Pelapor: {c.pelaporNama}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onReportProblem && (
              <button
                onClick={() => onReportProblem(facility)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Lapor Masalah
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPengurus && onEdit && (
              <button
                onClick={() => onEdit(facility)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Data
              </button>
            )}
            {['ADMIN', 'KETUA_RT'].includes(currentUserRole.toUpperCase()) && onDelete && (
              <button
                onClick={() => onDelete(facility)}
                className="px-3.5 py-2 rounded-xl border border-red-300 font-bold text-xs text-red-600 hover:bg-red-50 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
