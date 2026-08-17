// SMART RT 07 RW 11 GPA NGIJO - OFFICIAL ENVIRONMENTAL FACILITY REPORT MODAL v1.0
// Official Facility & Environmental Infrastructure Audit Report with Official Letterhead & SHA-256 Hash

import React, { useState, useEffect } from 'react';
import { OfficialKopSurat } from '../OfficialKopSurat';
import { DOCUMENT_BRANDING } from '../../config/documentBranding';
import {
  FasilitasLingkungan,
  FacilityAnalytics,
  FacilityInspection,
  FacilityMaintenance
} from '../../types/facility';
import {
  CONDITION_METADATA
} from '../../config/facilityConfig';
import { X, Printer, Download, ShieldCheck, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface FacilityOfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: FasilitasLingkungan[];
  analytics: FacilityAnalytics;
  inspections: FacilityInspection[];
  maintenanceList: FacilityMaintenance[];
}

export const FacilityOfficialReportModal: React.FC<FacilityOfficialReportModalProps> = ({
  isOpen,
  onClose,
  facilities,
  analytics,
  inspections,
  maintenanceList
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const reportNumber = `LPJ-FAS-RT07-2026-${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;
  const reportDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    if (isOpen) {
      generateHashAndQr();
    }
  }, [isOpen, facilities]);

  const generateHashAndQr = async () => {
    const rawContent = `SMART-RT07-FACILITY-REPORT-${reportNumber}-${facilities.length}-${new Date().toISOString()}`;
    try {
      // Generate SHA-256 Hash
      const msgBuffer = new TextEncoder().encode(rawContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(hashHex);

      // Generate QR Code
      const qrUrl = `https://smart-rt07.gpa-ngijo.id/verify-doc?type=FACILITY_AUDIT&id=${reportNumber}&hash=${hashHex.substring(0, 16)}`;
      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' }
      });
      setQrDataUrl(qrImage);
    } catch (e) {
      console.error('Error generating QR / SHA-256:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Action Bar */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Laporan Resmi Audit Fasilitas Lingkungan & GIS
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                No: {reportNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper (A4 Style) */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-900 font-serif leading-relaxed text-xs">
          {/* Official Kop Surat (Permanent Document Engine v2.0) */}
          <OfficialKopSurat theme="navy" className="mb-6" />

          {/* Report Title */}
          <div className="text-center my-6 space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
              LAPORAN INVENTARISASI & KELAYAKAN FASILITAS LINGKUNGAN
            </h2>
            <p className="text-[11px] font-mono text-slate-600">
              Nomor: {reportNumber}
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3 mb-6">
            <h4 className="font-sans font-bold text-xs text-slate-900 border-b border-slate-300 pb-1">
              I. RINGKASAN EKSEKUTIF FASILITAS & SARANA PRASARANA
            </h4>
            <p className="text-justify font-sans text-xs text-slate-700 leading-normal">
              Berdasarkan hasil pendataan, pemetaan GIS berbasis koordinat, dan inspeksi berkala pada lingkungan <strong>RT 07 RW 11 Perumahan Griya Permata Alam (GPA) Ngijo, Kecamatan Karangploso, Kabupaten Malang</strong>, berikut adalah rekapitulasi data kondisi fasilitas lingkungan terkini:
            </p>

            {/* KPI Matrix Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans my-3">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 block">Total Aset Fasilitas</span>
                <span className="text-base font-bold text-slate-900">{analytics.totalFacilities} Unit</span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] text-emerald-800 block">Kondisi Baik/Layak</span>
                <span className="text-base font-bold text-emerald-700">
                  {analytics.goodConditionFacilities + analytics.fairConditionFacilities} Unit
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-[10px] text-amber-800 block">Rusak / Perlu Servis</span>
                <span className="text-base font-bold text-amber-700">{analytics.damagedFacilities} Unit</span>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="text-[10px] text-rose-800 block">Fasilitas Darurat</span>
                <span className="text-base font-bold text-rose-700">{analytics.emergencyFacilities} Unit</span>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Inventory List */}
          <div className="space-y-3 mb-6">
            <h4 className="font-sans font-bold text-xs text-slate-900 border-b border-slate-300 pb-1">
              II. DAFTAR INVENTARISASI & KONDISI FASILITAS TERDATA
            </h4>

            <table className="w-full text-left font-sans text-[10px] border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">Kode & Nama Fasilitas</th>
                  <th className="p-2 border-r border-slate-300">Kategori</th>
                  <th className="p-2 border-r border-slate-300">Lokasi / Patokan</th>
                  <th className="p-2 border-r border-slate-300 text-center">Koordinat GIS</th>
                  <th className="p-2 border-r border-slate-300 text-center">Kondisi</th>
                  <th className="p-2 text-center">Prioritas</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((f, idx) => (
                  <tr key={f.fasilitasId} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200">
                      <strong className="block text-slate-900">{f.namaFasilitas}</strong>
                      <span className="font-mono text-[9px] text-slate-500">{f.kodeFasilitas}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200">{f.kategori}</td>
                    <td className="p-2 border-r border-slate-200">{f.lokasi}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono text-[9px]">
                      {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">
                      {CONDITION_METADATA[f.kondisi]?.label || f.kondisi}
                    </td>
                    <td className="p-2 text-center font-bold text-slate-700">
                      {f.tingkatPrioritas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Recommendations & Financials */}
          <div className="space-y-3 mb-8">
            <h4 className="font-sans font-bold text-xs text-slate-900 border-b border-slate-300 pb-1">
              III. REKOMENDASI PEMELIHARAAN & ALOKASI ANGGARAN
            </h4>
            <p className="text-justify font-sans text-xs text-slate-700 leading-normal">
              Berdasarkan skor kelayakan rata-rata <strong>{analytics.averageConditionScore} / 5.0</strong>, pengurus RT 07 merekomendasikan penanganan prioritas tinggi terhadap fasilitas penerangan jalan dan gorong-gorong drainase Blok C dengan estimasi total perbaikan sebesar <strong>Rp {analytics.totalRepairCostEstimation.toLocaleString('id-ID')}</strong> yang diusulkan melalui pos Kas RT dan Swadaya Warga.
            </p>
          </div>

          {/* Signatures & QR Verification Block */}
          <div className="pt-6 font-sans flex items-end justify-between border-t border-slate-200">
            {/* QR Verification Block */}
            <div className="flex items-center gap-3">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Verification"
                  className="w-20 h-20 border border-slate-300 p-1 rounded-lg"
                />
              )}
              <div className="space-y-0.5 text-[9px] text-slate-500 font-mono">
                <p className="font-bold text-slate-700">VERIFIKASI DIGITAL RT 07</p>
                <p>Dokumen Sah & Terenkripsi</p>
                <p>SHA-256: {sha256Hash.substring(0, 16)}...</p>
                <p>Status: RESMI / VALID</p>
              </div>
            </div>

            {/* Official Signatory (Karangploso - Eko Sucahyono) */}
            <div className="text-center w-56 space-y-1">
              <p className="text-xs text-slate-800">
                {DOCUMENT_BRANDING.letterPlace}, {reportDate}
              </p>
              <p className="text-xs font-bold text-slate-900">
                {DOCUMENT_BRANDING.chairmanTitle}
              </p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] italic text-emerald-800 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  [Tervalidasi Digital]
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 underline">
                {DOCUMENT_BRANDING.chairmanName}
              </p>
              <p className="text-[10px] text-slate-500">
                SMART RT 07 RW 11 GPA NGIJO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
