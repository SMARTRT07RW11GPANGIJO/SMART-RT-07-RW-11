import React, { useEffect, useState } from 'react';
import { X, Printer, ShieldCheck, Download, AlertTriangle, CheckCircle2, FileText, Ban, ExternalLink } from 'lucide-react';
import { DigitalDocument } from '../types/rt';
import { renderDocumentHTML, printOrSavePDF, openDocumentInNewTab, generateQRCodeDataUrl } from '../services/pdfGeneratorService';
import { OfficialKopSurat } from './OfficialKopSurat';
import { DOCUMENT_BRANDING, getLetterPlace } from '../config/documentBranding';

interface PdfDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DigitalDocument | null;
  onRevokeClick?: (doc: DigitalDocument) => void;
  canRevoke?: boolean;
}

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({
  isOpen,
  onClose,
  document: doc,
  onRevokeClick,
  canRevoke = false
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [htmlPreview, setHtmlPreview] = useState<string>('');

  const [printError, setPrintError] = useState<string | null>(null);

  useEffect(() => {
    if (doc) {
      generateQRCodeDataUrl(doc.qrVerificationUrl || `${window.location.origin}/verify/${doc.documentId}`).then(setQrDataUrl);
      renderDocumentHTML(doc).then(setHtmlPreview);
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const handlePrint = async () => {
    setPrintError(null);
    try {
      await printOrSavePDF(doc);
    } catch (err) {
      console.error('Print failed:', err);
      try {
        window.print();
      } catch (e) {
        setPrintError('Gagal membuka dialog cetak. Gunakan tombol "Buka Tab Baru" untuk mencetak/mengunduh PDF.');
      }
    }
  };

  const handleOpenInNewTab = async () => {
    if (!doc) return;
    await openDocumentInNewTab(doc);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0A2338] text-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 bg-[#123B5D] border-b border-[#2E7D52] flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C] shadow">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                DOKUMEN RESMI DIGITAL RT 07
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  doc.status === 'VALID' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-red-600 text-white border-red-400'
                }`}>
                  STATUS: {doc.status}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono">No: {doc.nomorSurat} • ID: {doc.documentId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenInNewTab}
              className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              title="Buka dokumen di tab baru untuk dicetak / diunduh sebagai PDF"
            >
              <ExternalLink className="w-4 h-4" /> Buka Tab Baru
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              title="Cetak langsung atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" /> Cetak / Unduh PDF A4
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white" title="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {printError && (
          <div className="bg-red-900 text-red-100 p-2.5 px-6 text-xs flex items-center justify-between border-b border-red-700 no-print">
            <span>{printError}</span>
          </div>
        )}

        {/* Warning Banner if Revoked */}
        {doc.status === 'REVOKED' && (
          <div className="bg-red-900/90 text-white p-3 px-6 border-b border-red-700 text-xs flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>DOKUMEN INI TELAH DICABUT:</strong> {doc.revokedReason || 'Tidak berlaku lagi dalam administrasi RT.'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-red-200">Dicabut pada: {doc.revokedAt}</span>
          </div>
        )}

        {/* PDF Body Container - Simulating standard A4 paper preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 flex justify-center">
          <div className="document-print-area bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-serif relative text-xs sm:text-sm leading-relaxed">
            
            {/* Watermark if Revoked */}
            {doc.status === 'REVOKED' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="border-8 border-red-600/20 text-red-600/20 text-4xl sm:text-6xl font-bold uppercase rotate-[-30deg] px-10 py-4 font-sans tracking-widest">
                  DOKUMEN DICABUT
                </div>
              </div>
            )}

            {/* Kop Surat */}
            <OfficialKopSurat theme="navy" />

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
                {doc.jenisSurat}
              </h2>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
                Nomor: {doc.nomorSurat}
              </p>
            </div>

            {/* Paragraph Content */}
            <div className="space-y-4 text-justify">
              <p>
                Yang bertanda tangan di bawah ini Pengurus RT 07 RW 11 Perumahan GPA Ngijo, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, menerangkan dengan sebenarnya bahwa:
              </p>

              <table className="w-full my-4 text-xs sm:text-sm">
                <tbody>
                  <tr>
                    <td className="w-40 py-1 font-semibold text-slate-700">Nama Lengkap</td>
                    <td className="py-1">: <strong className="text-slate-900">{doc.pemohonNama}</strong></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">NIK (Masked)</td>
                    <td className="py-1 font-mono">: {doc.pemohonNikMasked}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Alamat Rumah</td>
                    <td className="py-1">: {doc.pemohonAlamat}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Jenis Layanan</td>
                    <td className="py-1">: {doc.jenisSurat}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Maksud / Keperluan</td>
                    <td className="py-1">: <span className="font-semibold">{doc.keperluan}</span></td>
                  </tr>
                </tbody>
              </table>

              <p>
                Bahwa orang tersebut di atas adalah benar-benar warga bertempat tinggal di wilayah RT 07 RW 11 Perum GPA Ngijo dan berklasifikasi baik dalam administrasi kependudukan lingkungan.
              </p>

              <p>
                Demikian Surat Keterangan / Pengantar ini diterbitkan secara resmi melalui sistem digital untuk dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature & QR Verification Box */}
            <div className="mt-12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* QR Verification Card */}
              <div className="border border-[#123B5D] rounded-2xl p-3 bg-slate-50 text-center w-48 shadow-sm">
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg" />}
                <p className="text-[10px] font-bold text-[#123B5D] uppercase mt-2 font-sans leading-tight">
                  SCAN UNTUK VERIFIKASI<br/>DOKUMEN RESMI
                </p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">ID: {doc.documentId}</p>
              </div>

              {/* Signature Block (Right positioned, all text left-aligned) */}
              <div className="signature-block text-left font-sans min-w-[240px] space-y-1 sm:ml-auto">
                <div className="signature-location text-left text-xs text-slate-700">
                  {getLetterPlace()}, {new Date(doc.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="signature-title text-left text-xs font-bold text-slate-900 mt-0.5">
                  {DOCUMENT_BRANDING.chairmanOrganization}
                </div>

                <div className="digital-signature text-left my-2.5 py-2 px-3 border border-dashed border-[#2E7D52] bg-emerald-50 rounded-xl">
                  <div className="text-[10px] font-bold text-[#2E7D52] flex items-center justify-start gap-1 text-left">
                    <CheckCircle2 className="w-3.5 h-3.5" /> [ DIGITAL SIGNATURE VALID ]
                  </div>
                  <div className="text-[9px] font-mono text-slate-600 truncate mt-0.5 text-left">
                    HASH: {doc.verificationToken}
                  </div>
                  <div className="text-[8px] text-slate-500 text-left mt-1">
                    DOKUMEN DITANDATANGANI SECARA ELEKTRONIK
                  </div>
                </div>

                <div className="signature-name text-left font-bold underline text-sm text-slate-900">
                  {doc.namaKetua || DOCUMENT_BRANDING.chairmanName}
                </div>
                <div className="signature-position text-left text-xs text-slate-600">
                  {doc.jabatanKetua || DOCUMENT_BRANDING.chairmanTitle}
                </div>
              </div>

            </div>

            {/* Footer Notice */}
            <div className="mt-10 border-t border-slate-200 pt-3 text-center text-[10px] font-sans text-slate-500">
              Dokumen resmi digital ini diterbitkan secara sah oleh Sistem SMART RT 07 RW 11 GPA Ngijo.<br/>
              Keabsahan dokumen dapat diverifikasi secara publik melalui URL: <a href={doc.qrVerificationUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-mono">{doc.qrVerificationUrl}</a>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Document Security Token: <code className="text-amber-300 font-mono">{doc.verificationToken}</code></span>
          </div>

          <div className="flex items-center gap-3">
            {canRevoke && doc.status === 'VALID' && onRevokeClick && (
              <button
                onClick={() => onRevokeClick(doc)}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Ban className="w-4 h-4" /> Cabut DokumenIni
              </button>
            )}

            <button
              onClick={handlePrint}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
