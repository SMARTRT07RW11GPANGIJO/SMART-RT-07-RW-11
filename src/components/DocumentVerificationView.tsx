import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, Ban, AlertTriangle, HelpCircle, FileText, Lock, QrCode } from 'lucide-react';
import { DigitalDocument, SuratPengantar } from '../types/rt';
import { verifyDocumentById } from '../services/documentService';

interface DocumentVerificationViewProps {
  suratList?: SuratPengantar[];
  digitalDocs?: DigitalDocument[];
}

export const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({
  digitalDocs = []
}) => {
  const [searchId, setSearchId] = useState<string>('');
  const [verifiedDoc, setVerifiedDoc] = useState<DigitalDocument | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VALID' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check URL parameter or hash if present
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/verify\/([A-Za-z0-9-]+)/);
    if (match && match[1]) {
      handlePerformVerify(match[1]);
    } else {
      // Default to first sample document for preview
      handlePerformVerify('DOC-2026-000001');
    }
  }, []);

  const handlePerformVerify = (docIdToTest: string) => {
    if (!docIdToTest || docIdToTest.trim() === '') return;
    
    setSearchId(docIdToTest);
    const result = verifyDocumentById(docIdToTest);

    if (!result.found || !result.document) {
      setVerifyStatus('NOT_FOUND');
      setVerifiedDoc(null);
      setStatusMessage(result.statusText);
      return;
    }

    setVerifiedDoc(result.document);
    if (result.document.status === 'VALID') {
      setVerifyStatus('VALID');
    } else if (result.document.status === 'REVOKED') {
      setVerifyStatus('REVOKED');
    } else if (result.document.status === 'EXPIRED') {
      setVerifyStatus('EXPIRED');
    } else {
      setVerifyStatus('NOT_FOUND');
    }
    setStatusMessage(result.statusText);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformVerify(searchId);
  };

  return (
    <div className="min-h-screen bg-[#051320] text-slate-100 py-10 px-4 sm:px-6 flex flex-col items-center">
      
      {/* Header Badge */}
      <div className="w-full max-w-3xl text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#123B5D] border border-emerald-500/40 text-emerald-300 font-bold text-xs tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          PORTAL VERIFIKASI KEABSAHAN DOKUMEN DIGITAL RT 07
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Sistem Otentikasi QR Document Code
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          RT 07 RW 11 Perum GPA Ngijo, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mb-8">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Masukkan ID Dokumen (contoh: DOC-2026-000001)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[#0A2338] border-2 border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#D4A72C] shadow-lg"
          />
          <Search className="w-5 h-5 absolute left-4 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs shadow transition-all"
          >
            Verifikasi
          </button>
        </div>
      </form>

      {/* Main Verification Card */}
      <div className="w-full max-w-2xl bg-[#0A2338] rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Status Indicator Bar */}
        {verifyStatus === 'VALID' && (
          <div className="bg-emerald-600 text-white p-6 text-center space-y-2 border-b border-emerald-500">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-wide">✓ DOKUMEN RESMI VALID</h2>
            <p className="text-xs text-emerald-100 font-medium">
              Dokumen ini terdaftar sah dalam Database Publik RT 07 RW 11 GPA Ngijo
            </p>
          </div>
        )}

        {verifyStatus === 'REVOKED' && (
          <div className="bg-red-700 text-white p-6 text-center space-y-2 border-b border-red-600">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
              <Ban className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-wide">✖ DOKUMEN TELAH DICABUT</h2>
            <p className="text-xs text-red-100 font-medium">
              Dokumen ini telah dicabut oleh Pengurus RT dan TIDAK LAGI BERLAKU.
            </p>
          </div>
        )}

        {verifyStatus === 'EXPIRED' && (
          <div className="bg-amber-600 text-white p-6 text-center space-y-2 border-b border-amber-500">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-wide">⚠️ MASA BERLAKU HABIS</h2>
            <p className="text-xs text-amber-100 font-medium">
              Dokumen ini telah melampaui batas waktu keabsahan.
            </p>
          </div>
        )}

        {verifyStatus === 'NOT_FOUND' && (
          <div className="bg-slate-800 text-slate-200 p-6 text-center space-y-2 border-b border-slate-700">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto border border-slate-500">
              <HelpCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">DOKUMEN TIDAK DITEMUKAN</h2>
            <p className="text-xs text-slate-400 font-medium">
              Nomor dokumen tidak terdaftar dalam sistem administrasi digital RT 07.
            </p>
          </div>
        )}

        {/* Verification Details Table */}
        {verifiedDoc && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-[#123B5D]/60 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Penerbit Resmi:</span>
                <span className="font-bold text-white">RT 07 RW 11 Perum GPA Ngijo</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Nomor Registrasi Surat:</span>
                <span className="font-mono font-bold text-[#D4A72C]">{verifiedDoc.nomorSurat}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Document ID:</span>
                <span className="font-mono font-bold text-emerald-400">{verifiedDoc.documentId}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Jenis Layanan / Dokumen:</span>
                <span className="font-bold text-white">{verifiedDoc.jenisSurat}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Tanggal Masehi Terbit:</span>
                <span className="font-bold text-white">{verifiedDoc.tanggalSurat}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                <span className="text-slate-400">Nama Pemohon (Warga):</span>
                <span className="font-bold text-white">{verifiedDoc.pemohonNama}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">NIK Status (Masked):</span>
                <span className="font-mono text-slate-300">{verifiedDoc.pemohonNikMasked}</span>
              </div>
            </div>

            {/* Revoked Reason if revoked */}
            {verifiedDoc.status === 'REVOKED' && (
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-800 space-y-1 text-xs">
                <span className="font-bold text-red-300">Alasan Pencabutan Resmi:</span>
                <p className="text-red-200">{verifiedDoc.revokedReason || 'Dokumen telah dibatalkan oleh pengurus.'}</p>
                <p className="text-[10px] text-red-400 font-mono mt-1">Dicabut oleh: {verifiedDoc.revokedBy} ({verifiedDoc.revokedAt})</p>
              </div>
            )}

            {/* Security & Privacy Shield Statement */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Perlindungan Privasi Warga:</span>
                Data pribadi sensitif seperti Nomor NIK lengkap, No. KK, No. HP, dan alamat detail tidak ditampilkan pada halaman publik sesuai dengan Kebijakan Keamanan Informasi RT 07 RW 11 GPA Ngijo.
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 text-center text-xs text-slate-300 space-y-1">
          <p>Sistem Pelayanan Administrasi Digital & Transparency Gateway</p>
          <p className="text-[11px] text-slate-400">
            Untuk konfirmasi lebih lanjut, silakan hubungi Pengurus RT 07 RW 11 Perum GPA Ngijo.
          </p>
        </div>

      </div>
    </div>
  );
};
