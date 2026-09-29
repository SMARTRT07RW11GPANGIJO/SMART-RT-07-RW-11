import React, { useState } from 'react';
import { X, FileEdit, AlertCircle, CheckCircle2, ShieldCheck, Send, Loader2 } from 'lucide-react';
import { AuthoritativeSessionContext } from '../../security/authorization';
import { WargaProfileSummary } from '../../types/wargaDashboard';
import { WargaChangeRequestService } from '../../services/wargaChangeRequestService';

interface WargaAjukanPerubahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  authContext: AuthoritativeSessionContext;
  profile: WargaProfileSummary;
  onSuccess: (message: string) => void;
}

export const WargaAjukanPerubahanModal: React.FC<WargaAjukanPerubahanModalProps> = ({
  isOpen,
  onClose,
  authContext,
  profile,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [namaLengkap, setNamaLengkap] = useState(profile.namaLengkap || '');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [noHp, setNoHp] = useState(profile.noHp !== '-' ? profile.noHp : '');
  const [email, setEmail] = useState(profile.email !== '-' ? profile.email : '');
  const [pekerjaan, setPekerjaan] = useState('Karyawan Swasta');
  const [pendidikan, setPendidikan] = useState('SMA/Sederajat');
  const [statusPerkawinan, setStatusPerkawinan] = useState('Kawin');
  const [agama, setAgama] = useState('Islam');
  const [blok, setBlok] = useState(profile.blok !== '-' ? profile.blok : 'C-01');
  const [statusTinggal, setStatusTinggal] = useState<'TETAP' | 'KONTRAK_SEWA' | 'KOS'>('TETAP');
  const [namaPemilikRumah, setNamaPemilikRumah] = useState('');
  const [teleponPemilikRumah, setTeleponPemilikRumah] = useState('');
  const [alasan, setAlasan] = useState('');
  const [buktiReferensi, setBuktiReferensi] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!alasan.trim()) {
      setErrorMessage('Mohon isi alasan pengajuan perubahan data.');
      return;
    }

    try {
      setIsSubmitting(true);

      const dataUsulan: Record<string, any> = {
        NAMA_LENGKAP: namaLengkap.trim(),
        NAMA_PANGGILAN: namaPanggilan.trim() || undefined,
        NO_HP: noHp.trim() || undefined,
        EMAIL: email.trim() || undefined,
        PEKERJAAN: pekerjaan,
        PENDIDIKAN: pendidikan,
        STATUS_PERKAWINAN: statusPerkawinan,
        AGAMA: agama,
        BLOK: blok.trim(),
        STATUS_TINGGAL: statusTinggal
      };

      if (statusTinggal !== 'TETAP') {
        if (namaPemilikRumah.trim()) dataUsulan.NAMA_PEMILIK_RUMAH = namaPemilikRumah.trim();
        if (teleponPemilikRumah.trim()) dataUsulan.TELEPON_PEMILIK_RUMAH = teleponPemilikRumah.trim();
      }

      const res = await WargaChangeRequestService.submitChangeRequest(authContext, {
        jenisPengajuan: 'EDIT',
        idWargaTarget: profile.idWarga || authContext.userId,
        dataUsulan,
        alasan: alasan.trim(),
        buktiReferensi: buktiReferensi.trim() || undefined
      });

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        setErrorMessage(res.message || 'Gagal mengajukan perubahan data.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan saat mengirim pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#2E7D52] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileEdit className="w-5 h-5 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ajukan Perubahan Data Saya</h3>
              <p className="text-[11px] text-slate-200">Kirim permohonan pembaruan data ke Pengurus RT 07</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* SSoT Notice Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Prinsip SSoT:</strong> Formulir ini mengajukan permohonan perubahan data. Data resmi Anda di sistem tidak akan berubah langsung sampai Pengurus RT memverifikasi dan menyetujuinya.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Read-Only Identity Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Nama SSoT Saat Ini:</span>
              <span className="font-bold text-slate-700">{profile.namaLengkap}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">NIK (Terdaftar):</span>
              <span className="font-mono text-slate-700 font-semibold">{profile.nikMasked}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">No. Kartu Keluarga:</span>
              <span className="font-mono text-slate-700 font-semibold">{profile.noKkMasked}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">ID Warga:</span>
              <span className="font-mono text-slate-700 font-semibold">{profile.idWarga}</span>
            </div>
          </div>

          {/* Section: Usulan Perubahan Data */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
              <span>Isi Data Usulan yang Ingin Diperbarui</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Lengkap (Koreksi)</label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  placeholder="Nama lengkap sesuai KTP"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Panggilan</label>
                <input
                  type="text"
                  value={namaPanggilan}
                  onChange={(e) => setNamaPanggilan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  placeholder="Contoh: Pak Tris"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">No. HP / WhatsApp Aktif</label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  placeholder="081234567890"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  placeholder="nama@email.com"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pekerjaan</label>
                <select
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none bg-white"
                >
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="PNS / ASN">PNS / ASN</option>
                  <option value="TNI / POLRI">TNI / POLRI</option>
                  <option value="Wiraswasta / Pedagang">Wiraswasta / Pedagang</option>
                  <option value="Profesional / Guru / Dosen">Profesional / Guru / Dosen</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Pensiunan">Pensiunan</option>
                  <option value="Pelajar / Mahasiswa">Pelajar / Mahasiswa</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pendidikan Terakhir</label>
                <select
                  value={pendidikan}
                  onChange={(e) => setPendidikan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none bg-white"
                >
                  <option value="SMA/Sederajat">SMA/Sederajat</option>
                  <option value="D3/Diploma">D3/Diploma</option>
                  <option value="S1/Sarjana">S1/Sarjana</option>
                  <option value="S2/Magister">S2/Magister</option>
                  <option value="S3/Doktor">S3/Doktor</option>
                  <option value="SMP/Sederajat">SMP/Sederajat</option>
                  <option value="SD/Sederajat">SD/Sederajat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Status Perkawinan</label>
                <select
                  value={statusPerkawinan}
                  onChange={(e) => setStatusPerkawinan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none bg-white"
                >
                  <option value="Kawin">Kawin</option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Blok Rumah</label>
                <input
                  type="text"
                  value={blok}
                  onChange={(e) => setBlok(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                  placeholder="Contoh: C-01 atau B-05"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Status Tinggal / Domisili</label>
                <select
                  value={statusTinggal}
                  onChange={(e) => setStatusTinggal(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none bg-white"
                >
                  <option value="TETAP">TETAP (Rumah Milik Sendiri)</option>
                  <option value="KONTRAK_SEWA">KONTRAK / SEWA</option>
                  <option value="KOS">KOS</option>
                </select>
              </div>

              {statusTinggal !== 'TETAP' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Nama Pemilik Rumah</label>
                    <input
                      type="text"
                      value={namaPemilikRumah}
                      onChange={(e) => setNamaPemilikRumah(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                      placeholder="Nama pemilik rumah kontrakan/kos"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">No. Telepon Pemilik Rumah</label>
                    <input
                      type="tel"
                      value={teleponPemilikRumah}
                      onChange={(e) => setTeleponPemilikRumah(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                      placeholder="081234567890"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Alasan Pengajuan & Bukti */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Alasan Pengajuan Perubahan Data *</span>
                <span className="text-[10px] text-rose-500 font-normal">Wajib diisi</span>
              </label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none resize-none"
                placeholder="Contoh: Pembaruan nomor telepon dan status pekerjaan terbaru."
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Bukti Referensi / Keterangan Pendukung (Opsional)</label>
              <input
                type="text"
                value={buktiReferensi}
                onChange={(e) => setBuktiReferensi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                placeholder="Contoh: Dokumen KTP baru / SK Pindah / Keterangan Tambahan"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#123B5D] hover:bg-[#0e2f4a] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pengajuan</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
