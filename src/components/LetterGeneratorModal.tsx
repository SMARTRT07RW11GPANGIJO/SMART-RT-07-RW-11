import React, { useState, useEffect } from 'react';
import { SuratPengantar, UserRole, DigitalDocument } from '../types/rt';
import { X, Printer, Download, CheckCircle, ShieldCheck, Copy, Check, FileCheck, AlertCircle, ExternalLink, Send, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { generateQRCodeDataUrl, printOrSavePDF, openDocumentInNewTab } from '../services/pdfGeneratorService';
import { SuratService } from '../services/suratService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { OfficialKopSurat } from './OfficialKopSurat';
import { DOCUMENT_BRANDING, getLetterPlace, getChairmanName, getChairmanTitle } from '../config/documentBranding';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratList: SuratPengantar[];
  onAddSurat: (newSurat: SuratPengantar) => void;
  currentRole: UserRole;
  onRefreshList?: () => void;
}

export const LetterGeneratorModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  suratList,
  onAddSurat,
  currentRole,
  onRefreshList
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [selectedSurat, setSelectedSurat] = useState<SuratPengantar | null>(suratList[0] || null);

  // Form states
  const [jenisSurat, setJenisSurat] = useState<SuratPengantar['jenis_surat']>('Surat Domisili');
  const [namaPemohon, setNamaPemohon] = useState('');
  const [nikPemohon, setNikPemohon] = useState('');
  const [noKk, setNoKk] = useState('');
  const [blokRumah, setBlokRumah] = useState('Blok C-07');
  const [keperluan, setKeperluan] = useState('');
  const [noHp, setNoHp] = useState('');
  
  // Action & Feedback States
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPreview = selectedSurat || suratList[0];

  // Helper session context for client-side authoritative check
  const sessionContext: AuthoritativeSessionContext = {
    sessionId: `SESS-${currentRole.toLowerCase()}-${Date.now()}`,
    userId: currentRole === 'WARGA' ? 'warga_0711' : currentRole.toLowerCase(),
    role: currentRole,
    isValid: true,
    isUserActive: true
  };

  useEffect(() => {
    if (currentPreview) {
      const link = `${window.location.origin}/verify?code=${currentPreview.qr_code_hash}`;
      generateQRCodeDataUrl(link).then(setQrDataUrl);
    }
  }, [currentPreview]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsProcessing(true);

    try {
      const result = await SuratService.createSurat(
        {
          jenis_surat: jenisSurat,
          nama_pemohon: namaPemohon,
          nik_pemohon: nikPemohon,
          no_kk: noKk,
          blok_rumah: blokRumah,
          keperluan: keperluan,
          no_hp: noHp
        },
        sessionContext
      );

      if (result.success && result.surat) {
        onAddSurat(result.surat);
        setSelectedSurat(result.surat);
        setActiveTab('preview');
        setStatusMessage({
          type: result.backendConnected ? 'success' : 'info',
          text: result.message
        });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Gagal menyimpan permohonan.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Approval + Document Generation + Digital Signature
  const handleApproveAndPublish = async () => {
    if (!currentPreview) return;
    setStatusMessage(null);
    setIsProcessing(true);

    try {
      const result = await SuratService.processSuratApprovalAndGeneration(
        currentPreview.id_surat,
        'Disetujui dan ditandatangani digital oleh Ketua RT 07',
        sessionContext
      );

      if (result.success && result.surat) {
        setSelectedSurat(result.surat);
        if (onRefreshList) onRefreshList();
        setStatusMessage({
          type: result.backendConnected ? 'success' : 'info',
          text: result.message
        });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Gagal menyetujui surat.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Akses ditolak atau terjadi kesalahan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Verification by Pengurus
  const handleVerifyByPengurus = async () => {
    if (!currentPreview) return;
    setStatusMessage(null);
    setIsProcessing(true);

    try {
      const result = await SuratService.verifySurat(
        currentPreview.id_surat,
        'VERIFY',
        'Berkas telah diverifikasi lengkap oleh Sekretaris RT',
        sessionContext
      );

      if (result.success && result.surat) {
        setSelectedSurat(result.surat);
        if (onRefreshList) onRefreshList();
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Gagal memverifikasi surat.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Akses ditolak.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocFromPreview = (): DigitalDocument => {
    return {
      documentId: currentPreview.id_surat || `DOC-2026-${Date.now().toString().slice(-6)}`,
      requestId: currentPreview.id_surat,
      nomorSurat: currentPreview.nomor_surat,
      jenisSurat: currentPreview.jenis_surat,
      tanggalSurat: currentPreview.tanggal_pengajuan,
      lifecycle: currentPreview.status === 'SELESAI' || currentPreview.status === 'DISETUJUI' ? 'APPROVED' : 'SUBMITTED',
      status: 'VALID',
      createdAt: currentPreview.tanggal_pengajuan,
      createdBy: 'Ketua RT 07',
      qrVerificationUrl: `${window.location.origin}/verify?code=${currentPreview.qr_code_hash}`,
      verificationToken: currentPreview.qr_code_hash,
      version: 1,
      pemohonNama: currentPreview.nama_pemohon,
      pemohonNikMasked: currentPreview.nik_pemohon
        ? (currentPreview.nik_pemohon.length === 16
            ? currentPreview.nik_pemohon.slice(0, 6) + '******' + currentPreview.nik_pemohon.slice(-4)
            : currentPreview.nik_pemohon)
        : '350712******0001',
      pemohonAlamat: `${currentPreview.blok_rumah}, RT 07 RW 11 Perum GPA Ngijo`,
      keperluan: currentPreview.keperluan,
      namaKetua: getChairmanName(),
      jabatanKetua: getChairmanTitle()
    };
  };

  const handlePrint = async () => {
    if (!currentPreview) return;
    try {
      const doc = getDocFromPreview();
      await printOrSavePDF(doc);
    } catch (err) {
      console.error('Failed to trigger print:', err);
      try {
        window.print();
      } catch (e) {
        setStatusMessage({
          type: 'error',
          text: 'Gagal membuka dialog cetak. Silakan gunakan tombol "Buka Tab Baru" untuk mencetak.'
        });
      }
    }
  };

  const handleOpenInNewTab = async () => {
    if (!currentPreview) return;
    const doc = getDocFromPreview();
    await openDocumentInNewTab(doc);
  };

  const copyVerifyLink = () => {
    if (!currentPreview) return;
    const link = `${window.location.origin}/verify?code=${currentPreview.qr_code_hash}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center font-bold text-[#D4A72C] border border-[#D4A72C]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Generator & Layanan Surat RT 07 RW 11</h3>
                <span className="bg-[#D4A72C] text-[#123B5D] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  v2.0 PROD
                </span>
              </div>
              <p className="text-xs text-slate-300">Pengajuan Mandiri & Penerbitan Dokumen Resmi Berbasis QR Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector & Controls */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 no-print">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Form Pengajuan Baru
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Pratinjau Dokumen PDF
            </button>
          </div>

          {activeTab === 'preview' && currentPreview && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Role Action Controls */}
              {['KETUA_RT', 'ADMIN'].includes(currentRole) && currentPreview.status !== 'SELESAI' && currentPreview.status !== 'DISETUJUI' && (
                <button
                  onClick={handleApproveAndPublish}
                  disabled={isProcessing}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                  title="Setujui dan tanda tangani digital"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Setujui & Terbitkan PDF
                </button>
              )}

              {currentRole === 'PENGURUS' && currentPreview.status === 'DIAJUKAN' && (
                <button
                  onClick={handleVerifyByPengurus}
                  disabled={isProcessing}
                  className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Verifikasi Berkas Sekretaris
                </button>
              )}

              <button
                onClick={copyVerifyLink}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Link Tersalin' : 'Salin Verification Link'}
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                title="Buka dokumen HTML/PDF di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Tab Baru
              </button>
              <button
                onClick={handlePrint}
                className="bg-[#123B5D] hover:bg-[#0c2840] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                title="Cetak atau Simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak / Simpan PDF
              </button>
            </div>
          )}
        </div>

        {/* System Notification Bar */}
        {statusMessage && (
          <div className={`p-3 px-6 text-xs flex items-center gap-2 no-print ${
            statusMessage.type === 'success' ? 'bg-emerald-50 border-b border-emerald-200 text-emerald-800' :
            statusMessage.type === 'info' ? 'bg-sky-50 border-b border-sky-200 text-sky-800' :
            'bg-red-50 border-b border-red-200 text-red-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> :
             statusMessage.type === 'info' ? <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" /> :
             <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 no-print">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-[#123B5D] text-base">Formulir Permohonan Surat Pengantar RT</h4>
                <p className="text-xs text-slate-500">Isi data permohonan sesuai dengan KTP & Kartu Keluarga resmi Anda.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Surat Pengantar</label>
                  <select
                    value={jenisSurat}
                    onChange={(e) => setJenisSurat(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  >
                    <option value="Surat Domisili">Surat Keterangan Domisili</option>
                    <option value="Surat Pengantar KTP">Surat Pengantar KTP Baru / Perpanjangan</option>
                    <option value="Surat Pengantar KK">Surat Pengantar Perubahan KK</option>
                    <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                    <option value="Surat Pengantar SKCK">Surat Pengantar SKCK Kepolisian</option>
                    <option value="Surat Keterangan Kematian">Surat Keterangan Kematian</option>
                    <option value="Surat Keterangan Lainnya">Surat Keterangan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pemohon</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendrik Prasetyo"
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK Pemohon (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="350712xxxxxx0001"
                    value={nikPemohon}
                    onChange={(e) => setNikPemohon(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="350712xxxxxx0001"
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blok & Nomor Rumah</label>
                  <select
                    value={blokRumah}
                    onChange={(e) => setBlokRumah(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  >
                    <option value="Blok C-01">Blok C-01</option>
                    <option value="Blok C-05">Blok C-05</option>
                    <option value="Blok C-07">Blok C-07</option>
                    <option value="Blok C-08">Blok C-08</option>
                    <option value="Blok C-12">Blok C-12</option>
                    <option value="Blok C-15">Blok C-15</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Notifikasi</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Pengajuan Surat</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jelaskan secara rinci keperluan pengajuan..."
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2E7D52] hover:bg-[#236340] shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim & Proses Permohonan
                </button>
              </div>
            </form>
          ) : (
            /* Printable Official Surat Layout */
            <div className="document-print-area max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 text-slate-900 font-serif leading-relaxed text-sm relative">
              
              {/* Kop Surat Resmi RT */}
              <OfficialKopSurat theme="slate" />

              {/* Status Ribbon (Screen Only) */}
              <div className="no-print absolute top-4 right-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  currentPreview?.status === 'SELESAI' || currentPreview?.status === 'DISETUJUI'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : currentPreview?.status === 'DIVERIFIKASI'
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {currentPreview?.status || 'DIAJUKAN'}
                </span>
              </div>

              {/* Judul Surat & Nomor */}
              <div className="text-center mb-6">
                <h4 className="font-bold text-base underline uppercase tracking-widest text-slate-900">
                  {currentPreview?.jenis_surat || 'SURAT KETERANGAN / PENGANTAR'}
                </h4>
                <p className="text-xs font-sans text-slate-700 font-semibold mt-1">
                  Nomor: {currentPreview?.nomor_surat || '001/RT07-RW11/VIII/2026'}
                </p>
              </div>

              {/* Isi Surat */}
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <p>
                  Yang bertanda tangan di bawah ini Pengurus RT 07 RW 11 Perumahan GPA Ngijo, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, menerangkan dengan sebenarnya bahwa:
                </p>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 my-3">
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-600">Nama Lengkap</span>
                    <span className="col-span-2">: {currentPreview?.nama_pemohon || 'Hendrik Prasetyo'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-600">NIK Pemohon</span>
                    <span className="col-span-2">: {currentPreview?.nik_pemohon || '3507122005930004'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-600">Nomor KK</span>
                    <span className="col-span-2">: {currentPreview?.no_kk || '3507120103200003'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-600">Alamat Tempat Tinggal</span>
                    <span className="col-span-2">: Perum GPA Ngijo {currentPreview?.blok_rumah || 'Blok C-12'}, RT 07 RW 11</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-600">Status Warga</span>
                    <span className="col-span-2">: Warga Terdaftar RT 07 RW 11 GPA Ngijo</span>
                  </div>
                </div>

                <p>
                  Orang tersebut di atas adalah benar-benar warga yang bertempat tinggal di wilayah RT 07 RW 11 Perum GPA Ngijo, Desa Ngijo, Kecamatan Karangploso.
                </p>

                <p>
                  Surat pengantar ini diberikan kepada yang bersangkutan untuk keperluan:
                </p>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 font-semibold text-slate-800">
                  "{currentPreview?.keperluan || 'Persyaratan Administrasi Kependudukan & Instansi Terkait'}"
                </div>

                <p>
                  Demikian Surat Pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan & QR Code Verification */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs items-end">
                <div className="text-center space-y-1.5">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-300 inline-block">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code Verifikasi" className="w-24 h-24 mx-auto object-contain" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-900 text-white p-1 flex flex-col items-center justify-center text-[8px] text-center font-mono rounded">
                        <ShieldCheck className="w-6 h-6 text-[#D4A72C] mb-1" />
                        <span>VERIFIED DOC</span>
                        <span>RT 07 RW 11</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-700 font-bold uppercase">SCAN UNTUK VERIFIKASI<br/>DOKUMEN RESMI</p>
                  <p className="text-[8px] text-slate-500 font-mono">ID: {currentPreview?.id_surat || 'DOC-2026-PREVIEW'}</p>
                </div>

                <div className="signature-block text-left space-y-1.5 max-w-[240px] ml-auto">
                  <div className="signature-location text-left text-slate-700 text-xs">
                    {getLetterPlace()}, {currentPreview?.tanggal_pengajuan ? new Date(currentPreview.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Agustus 2026'}
                  </div>
                  <div className="signature-title text-left font-bold text-slate-900 text-xs">
                    {DOCUMENT_BRANDING.chairmanOrganization}
                  </div>

                  <div className="digital-signature text-left my-2 p-2 rounded-lg border border-dashed border-[#2E7D52] bg-emerald-50 text-[#2E7D52]">
                    <div className="text-[10px] font-bold flex items-center justify-start gap-1 text-left">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> [ DIGITAL SIGNATURE VALID ]
                    </div>
                    <div className="text-[9px] font-mono text-slate-600 truncate mt-0.5 text-left">
                      HASH: {currentPreview?.qr_code_hash || 'T9X2A0-VERIFIED'}
                    </div>
                    <div className="text-[8px] text-slate-500 text-left mt-1 font-normal">
                      DOKUMEN DITANDATANGANI SECARA ELEKTRONIK
                    </div>
                  </div>

                  <div className="signature-name text-left font-bold text-slate-900 underline text-sm">
                    {getChairmanName()}
                  </div>
                  <div className="signature-position text-left text-[11px] text-slate-600">
                    {getChairmanTitle()}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
