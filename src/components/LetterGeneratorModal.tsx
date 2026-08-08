import React, { useState } from 'react';
import { SuratPengantar, UserRole } from '../types/rt';
import { X, Printer, Download, CheckCircle, ShieldCheck, Copy, Check, FileCheck } from 'lucide-react';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratList: SuratPengantar[];
  onAddSurat: (newSurat: SuratPengantar) => void;
  currentRole: UserRole;
}

export const LetterGeneratorModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  suratList,
  onAddSurat,
  currentRole
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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemohon || !nikPemohon || !keperluan) return;

    const nextIndex = suratList.length + 1;
    const autoNumber = `${String(nextIndex).padStart(3, '0')}/RT07-RW11/VIII/2026`;
    const newRecord: SuratPengantar = {
      id_surat: `SRT-2026-${String(nextIndex).padStart(4, '0')}`,
      nomor_surat: autoNumber,
      jenis_surat: jenisSurat,
      id_warga: `WRG-${Date.now().toString().slice(-4)}`,
      nama_pemohon: namaPemohon,
      nik_pemohon: nikPemohon,
      no_kk: noKk || '3507120101150001',
      blok_rumah: blokRumah,
      keperluan: keperluan,
      tanggal_pengajuan: new Date().toISOString().split('T')[0],
      status: 'DIAJUKAN',
      qr_code_hash: `VERIFY-SRT-${nextIndex}-GPA0711`
    };

    onAddSurat(newRecord);
    setSelectedSurat(newRecord);
    setActiveTab('preview');
  };

  const currentPreview = selectedSurat || suratList[0];

  const handlePrint = () => {
    window.print();
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
              <h3 className="font-bold text-base">Generator & Layanan Surat RT 07 RW 11</h3>
              <p className="text-xs text-slate-300">Pengajuan Mandiri & Pratinjau Surat Pengantar Resmi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between no-print">
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
              2. Pratinjau Document PDF
            </button>
          </div>

          {activeTab === 'preview' && currentPreview && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyVerifyLink}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Link Tersalin' : 'Salin Verification Link'}
              </button>
              <button
                onClick={handlePrint}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak / Simpan PDF
              </button>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-[#123B5D] text-base">Formulir Permohonan Surat Pengantar RT</h4>
                <p className="text-xs text-slate-500">Isi data permohonan sesuai dengan KTP & Kartu Keluarga Anda.</p>
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
                    onChange={(e) => setNikPemohon(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    placeholder="350712xxxxxx0001"
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value)}
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Pengajuan Surat</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jelaskan secara rinci untuk keperluan apa surat ini diajukan..."
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2E7D52] hover:bg-[#236340] shadow flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Kirim & Generasi Surat
                </button>
              </div>
            </form>
          ) : (
            /* Printable Official Surat Layout */
            <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 text-slate-900 font-serif leading-relaxed text-sm relative">
              
              {/* Kop Surat Resmi RT */}
              <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center relative">
                <div className="flex items-center justify-center gap-4 mb-1">
                  <div className="w-12 h-12 bg-[#123B5D] text-[#D4A72C] rounded-lg flex items-center justify-center font-bold text-xl border border-[#D4A72C] no-print">
                    RT07
                  </div>
                  <div>
                    <h2 className="font-bold text-lg sm:text-xl tracking-wider text-slate-900 uppercase">RUKUN TETANGGA 07 RUKUN WARGA 11</h2>
                    <h3 className="font-bold text-sm sm:text-base tracking-wide text-slate-800 uppercase">PERUMAHAN GPA NGIJO - KECAMATAN KARANGPLOSO</h3>
                    <p className="text-xs text-slate-600 font-sans mt-0.5">Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152</p>
                  </div>
                </div>
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
                  Yang bertanda tangan di bawah ini Ketua RT 07 RW 11 Perumahan GPA Ngijo, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, menerangkan dengan sebenarnya bahwa:
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
                  "{currentPreview?.keperluan || 'Persyaratan Administrasi Pekerjaan & Pembukaan Rekening Bank'}"
                </div>

                <p>
                  Demikian Surat Pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan & QR Code Verification */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs items-end">
                <div className="text-center space-y-2">
                  <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 inline-block">
                    {/* Simulated QR Code */}
                    <div className="w-20 h-20 bg-slate-900 text-white p-1 flex flex-col items-center justify-center text-[8px] text-center font-mono rounded">
                      <ShieldCheck className="w-6 h-6 text-[#D4A72C] mb-1" />
                      <span>VERIFIED DOC</span>
                      <span>RT 07 RW 11</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Scan QR untuk verifikasi keaslian di portal SMART RT</p>
                </div>

                <div className="text-center space-y-12">
                  <div>
                    <p className="text-slate-600">Ngijo, {currentPreview?.tanggal_pengajuan || '08 Agustus 2026'}</p>
                    <p className="font-bold text-slate-900">Ketua RT 07 RW 11 GPA Ngijo</p>
                  </div>
                  <div className="relative">
                    {/* Digital Seal / Stempel Stamp */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-dashed border-blue-600/40 rounded-full flex items-center justify-center rotate-[-12deg] pointer-events-none">
                      <span className="text-[9px] font-bold text-blue-700/60 text-center uppercase leading-tight">STEMPEL RESMI<br/>RT 07 RW 11<br/>GPA NGIJO</span>
                    </div>
                    <p className="font-bold text-slate-900 underline text-sm">BAMBANG SUGIANTO, S.T.</p>
                    <p className="text-[10px] text-slate-500">NIP / ID: RT07-2025-01</p>
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
