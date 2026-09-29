import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, ShieldCheck, Send, Loader2, Users } from 'lucide-react';
import { AuthoritativeSessionContext } from '../../security/authorization';
import { WargaProfileSummary } from '../../types/wargaDashboard';
import { WargaChangeRequestService } from '../../services/wargaChangeRequestService';

interface WargaTambahAnggotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  authContext: AuthoritativeSessionContext;
  profile: WargaProfileSummary;
  onSuccess: (message: string) => void;
}

export const WargaTambahAnggotaModal: React.FC<WargaTambahAnggotaModalProps> = ({
  isOpen,
  onClose,
  authContext,
  profile,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State for new family member
  const [namaLengkap, setNamaLengkap] = useState('');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [nik, setNik] = useState('');
  const [hubunganKeluarga, setHubunganKeluarga] = useState('ANAK');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [tempatLahir, setTempatLahir] = useState('Malang');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [agama, setAgama] = useState('Islam');
  const [statusPerkawinan, setStatusPerkawinan] = useState('Belum Kawin');
  const [pendidikan, setPendidikan] = useState('SMA/Sederajat');
  const [pekerjaan, setPekerjaan] = useState('Pelajar / Mahasiswa');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [alasan, setAlasan] = useState('');
  const [buktiReferensi, setBuktiReferensi] = useState('');

  if (!isOpen) return null;

  // Nomor KK diambil dari data resmi warga aktif / session, BUKAN diketik ulang
  const familyNoKk = authContext.nomorKK || profile.noKkMasked || '3507************';
  const familyBlok = profile.blok !== '-' ? profile.blok : 'C-01';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi NIK (harus 16 digit)
    const cleanNik = nik.replace(/\D/g, '');
    if (cleanNik.length !== 16) {
      setErrorMessage('NIK anggota baru harus tepat 16 digit angka.');
      return;
    }

    if (!namaLengkap.trim()) {
      setErrorMessage('Nama lengkap anggota keluarga wajib diisi.');
      return;
    }

    if (!tanggalLahir) {
      setErrorMessage('Tanggal lahir anggota keluarga wajib diisi.');
      return;
    }

    if (!alasan.trim()) {
      setErrorMessage('Alasan penambahan anggota keluarga wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);

      const dataUsulan: Record<string, any> = {
        NAMA_LENGKAP: namaLengkap.trim(),
        NAMA_PANGGILAN: namaPanggilan.trim() || undefined,
        NIK: cleanNik,
        HUBUNGAN_KELUARGA: hubunganKeluarga,
        JENIS_KELAMIN: jenisKelamin,
        TEMPAT_LAHIR: tempatLahir.trim(),
        TANGGAL_LAHIR: tanggalLahir,
        AGAMA: agama,
        STATUS_PERKAWINAN: statusPerkawinan,
        PENDIDIKAN: pendidikan,
        PEKERJAAN: pekerjaan,
        NO_HP: noHp.trim() || undefined,
        EMAIL: email.trim() || undefined,
        BLOK: familyBlok,
        STATUS_TINGGAL: profile.statusWarga === 'Kontrak' ? 'KONTRAK_SEWA' : profile.statusWarga === 'Kos' ? 'KOS' : 'TETAP'
      };

      const res = await WargaChangeRequestService.submitChangeRequest(authContext, {
        jenisPengajuan: 'ADD',
        idWargaTarget: '', // Belum memiliki ID warga resmi sebelum diapprove
        dataUsulan,
        alasan: alasan.trim(),
        buktiReferensi: buktiReferensi.trim() || undefined
      });

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        setErrorMessage(res.message || 'Gagal mengajukan penambahan anggota keluarga.');
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
              <UserPlus className="w-5 h-5 text-[#20C878]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Tambah Anggota Keluarga</h3>
              <p className="text-[11px] text-slate-200">Ajukan pendaftaran anggota baru ke Kartu Keluarga Anda</p>
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aturan Keluarga SSoT:</strong> Anggota baru akan didaftarkan di bawah Nomor KK yang sama dengan Kepala Keluarga. Data tidak langsung aktif sebelum diverifikasi dan disetujui Pengurus RT 07.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Read-Only Family Context Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Nomor KK (Otoritatif):</span>
              <span className="font-mono text-slate-700 font-bold">{familyNoKk}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Kepala Keluarga:</span>
              <span className="font-bold text-slate-700">{profile.namaLengkap}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Lokasi Rumah / Blok:</span>
              <span className="font-semibold text-slate-700">{familyBlok} (RT {profile.rt || '07'} / RW {profile.rw || '11'})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Status Anggota Baru:</span>
              <span className="font-bold text-[#2E7D52]">ANGGOTA_KELUARGA</span>
            </div>
          </div>

          {/* Section: Identitas Anggota Keluarga Baru */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2E7D52]" />
              <span>Identitas Anggota Keluarga Baru</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Nama Lengkap (sesuai Akta/KTP) *</label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none"
                  placeholder="Nama lengkap anggota keluarga"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">NIK (16 Digit) *</label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#2E7D52] focus:outline-none"
                  placeholder="3507xxxxxxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Hubungan Keluarga *</label>
                <select
                  value={hubunganKeluarga}
                  onChange={(e) => setHubunganKeluarga(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white font-semibold text-slate-800"
                >
                  <option value="ANAK">ANAK</option>
                  <option value="ISTRI">ISTRI</option>
                  <option value="ORANG_TUA">ORANG TUA / MERTUA</option>
                  <option value="FAMILI_LAIN">FAMILI LAIN</option>
                  <option value="PENYEWA">PENYEWA</option>
                  <option value="PENGHUNI_KOS">PENGHUNI KOS</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Jenis Kelamin *</label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tempat Lahir *</label>
                <input
                  type="text"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none"
                  placeholder="Kota kelahiran"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tanggal Lahir *</label>
                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Agama</label>
                <select
                  value={agama}
                  onChange={(e) => setAgama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pendidikan Terakhir</label>
                <select
                  value={pendidikan}
                  onChange={(e) => setPendidikan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                >
                  <option value="Belum Sekolah">Belum / Tidak Sekolah</option>
                  <option value="SD/Sederajat">SD / Sederajat</option>
                  <option value="SMP/Sederajat">SMP / Sederajat</option>
                  <option value="SMA/Sederajat">SMA / Sederajat</option>
                  <option value="D3/Diploma">D3 / Diploma</option>
                  <option value="S1/Sarjana">S1 / Sarjana</option>
                  <option value="S2/Magister">S2 / Magister</option>
                  <option value="S3/Doktor">S3 / Doktor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pekerjaan</label>
                <select
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                >
                  <option value="Pelajar / Mahasiswa">Pelajar / Mahasiswa</option>
                  <option value="Belum / Tidak Bekerja">Belum / Tidak Bekerja</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="Wiraswasta / Pedagang">Wiraswasta / Pedagang</option>
                  <option value="PNS / ASN">PNS / ASN</option>
                  <option value="TNI / POLRI">TNI / POLRI</option>
                  <option value="Profesional / Guru / Dosen">Profesional / Guru / Dosen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Status Perkawinan</label>
                <select
                  value={statusPerkawinan}
                  onChange={(e) => setStatusPerkawinan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none bg-white"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">No. HP (Opsional)</label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Section: Alasan & Bukti */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Alasan Penambahan Anggota Keluarga *</span>
                <span className="text-[10px] text-rose-500 font-normal">Wajib diisi</span>
              </label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none resize-none"
                placeholder="Contoh: Kelahiran anak pertama / Pernikahan / Pindah KK baru."
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Nomor Bukti Dokumen (Akta Lahir / Surat Pindah)</label>
              <input
                type="text"
                value={buktiReferensi}
                onChange={(e) => setBuktiReferensi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2E7D52] focus:outline-none"
                placeholder="Contoh: No. Akta 3507-LT-xxxx / No. Surat Keterangan"
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
              className="px-5 py-2.5 rounded-xl bg-[#2E7D52] hover:bg-[#256643] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pengajuan Anggota</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
