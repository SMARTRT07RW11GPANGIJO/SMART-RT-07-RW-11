import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  UserPlus, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  Eye,
  ShieldCheck,
  ChevronRight,
  Home,
  Check
} from 'lucide-react';
import { AuthoritativeSessionContext } from '../../security/authorization';
import { WargaChangeRequestItem } from '../../types/wargaDashboard';
import { WargaChangeRequestService } from '../../services/wargaChangeRequestService';
import { ResidentFamilyService } from '../../services/residentFamilyService';

interface WargaChangeRequestVerificationViewProps {
  authContext: AuthoritativeSessionContext;
  onWargaListUpdated: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const WargaChangeRequestVerificationView: React.FC<WargaChangeRequestVerificationViewProps> = ({
  authContext,
  onWargaListUpdated,
  addToast
}) => {
  const [requests, setRequests] = useState<WargaChangeRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WargaChangeRequestItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await WargaChangeRequestService.getPendingChangeRequests(authContext);
      setRequests(data);
    } catch (err: any) {
      console.warn('Gagal memuat antrean WCR:', err);
      addToast('error', 'Gagal Memuat Antrean', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [authContext, addToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (item: WargaChangeRequestItem) => {
    if (processingId) return;
    setProcessingId(item.idPengajuan);

    try {
      const res = await WargaChangeRequestService.approveChangeRequest(
        authContext,
        item.idPengajuan,
        `Disetujui oleh ${authContext.namaLengkap || 'Pengurus RT 07'}`
      );

      if (res.success) {
        addToast('success', 'Pengajuan Disetujui', res.message);
        // Refresh WCR list & SSoT warga
        await loadRequests();
        onWargaListUpdated();
      } else {
        addToast('error', 'Persetujuan Gagal', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Kesalahan Sistem', err?.message || 'Gagal memproses persetujuan.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (item: WargaChangeRequestItem) => {
    setSelectedRequest(item);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      addToast('error', 'Alasan Diperlukan', 'Harap isi alasan penolakan.');
      return;
    }

    setProcessingId(selectedRequest.idPengajuan);
    try {
      const res = await WargaChangeRequestService.rejectChangeRequest(
        authContext,
        selectedRequest.idPengajuan,
        rejectReason.trim()
      );

      if (res.success) {
        addToast('info', 'Pengajuan Ditolak', res.message);
        setRejectModalOpen(false);
        setSelectedRequest(null);
        await loadRequests();
      } else {
        addToast('error', 'Penolakan Gagal', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Kesalahan Sistem', err?.message || 'Gagal menolak pengajuan.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'SUBMITTED') return r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW';
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Verifikasi Pengajuan Perubahan Data Warga (WCR)
                </h2>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  CR-WCR/PROD-002
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Antrean permohonan penambahan anggota keluarga baru & koreksi profil dari warga. Persetujuan akan otomatis mendaftarkan anggota baru ke SSoT Kependudukan dengan nomor Kartu Keluarga otoritatif pemohon.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadRequests}
              disabled={loading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-2 uppercase tracking-wider">Status:</span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'ALL'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('SUBMITTED')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'SUBMITTED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Menunggu Verifikasi ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'APPROVED'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui ({requests.filter(r => r.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'REJECTED'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Ditolak ({requests.filter(r => r.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Request Cards List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Tidak Ada Pengajuan</h3>
          <p className="text-xs text-slate-400 mt-1">
            Tidak ada permohonan pengajuan data warga dengan filter saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((item) => {
            const isPending = item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';
            const usulan = item.dataUsulan || {};

            return (
              <div 
                key={item.idPengajuan}
                className={`bg-white border rounded-3xl p-5 shadow-sm transition hover:shadow-md ${
                  isPending ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-black px-2.5 py-1 rounded-lg">
                        {item.idPengajuan}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.timestampAjukan}
                      </span>
                      {item.jenisPengajuan === 'ADD' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserPlus className="w-3 h-3" /> TAMBAH ANGGOTA KELUARGA
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" /> UBAH PROFIL
                        </span>
                      )}

                      {/* Status Badge */}
                      {isPending && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> MENUNGGU VERIFIKASI
                        </span>
                      )}
                      {isApproved && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> DISETUJUI & TERCATAT SSOT
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> DITOLAK
                        </span>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>{usulan.NAMA_LENGKAP || 'Nama Belum Ditentukan'}</span>
                        {usulan.HUBUNGAN_KELUARGA && (
                          <span className="bg-[#123B5D] text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                            {usulan.HUBUNGAN_KELUARGA}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">NIK Usulan:</span>
                          <span className="font-mono font-bold text-slate-800">{usulan.NIK || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Jenis Kelamin:</span>
                          <span>{usulan.JENIS_KELAMIN || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Tempat, Tgl Lahir:</span>
                          <span>{usulan.TEMPAT_LAHIR || '-'}, {usulan.TANGGAL_LAHIR || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Agama / Status Kawin:</span>
                          <span>{usulan.AGAMA || '-'} • {usulan.STATUS_PERKAWINAN || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Pendidikan / Pekerjaan:</span>
                          <span>{usulan.PENDIDIKAN || '-'} • {usulan.PEKERJAAN || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Alamat & Blok:</span>
                          <span>{usulan.BLOK || 'Blok JN No 17'}</span>
                        </div>
                      </div>

                      {/* Alasan & Bukti */}
                      <div className="pt-2 border-t border-slate-200/60 mt-2 text-xs">
                        <span className="font-bold text-slate-700">Alasan: </span>
                        <span className="text-slate-600 italic">"{item.alasan}"</span>
                        {item.buktiReferensi && (
                          <span className="block text-slate-500 text-[11px] mt-0.5">
                            📎 Bukti: {item.buktiReferensi}
                          </span>
                        )}
                      </div>

                      {/* Catatan Verifikasi Jika Ada */}
                      {item.catatanVerifikasi && (
                        <div className="bg-slate-100 rounded-xl p-2 text-xs text-slate-600 mt-2">
                          <span className="font-bold">Catatan Pengurus: </span>
                          <span>{item.catatanVerifikasi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 min-w-[160px]">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={processingId === item.idPengajuan}
                          className="w-full bg-[#2E7D52] hover:bg-[#256642] text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                        >
                          {processingId === item.idPengajuan ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Setujui & Daftarkan
                        </button>
                        <button
                          onClick={() => handleOpenReject(item)}
                          disabled={processingId === item.idPengajuan}
                          className="w-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold px-4 py-2 rounded-2xl flex items-center justify-center gap-1.5 transition border border-slate-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="text-center p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold w-full">
                        <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                        Terdaftar di SSoT
                      </div>
                    ) : (
                      <div className="text-center p-2 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-bold w-full">
                        <XCircle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                        Pengajuan Ditolak
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Tolak Pengajuan WCR</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedRequest.idPengajuan}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Silakan tuliskan alasan penolakan untuk pemohon. Pengajuan tidak akan didaftarkan ke SSoT.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen bukti pendukung tidak terbaca atau NIK tidak sesuai data Disdukcapil."
              rows={3}
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || processingId === selectedRequest.idPengajuan}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
