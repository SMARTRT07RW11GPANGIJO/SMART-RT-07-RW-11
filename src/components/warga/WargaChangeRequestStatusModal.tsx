import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, XCircle, FileText, UserPlus, RefreshCw, ShieldAlert } from 'lucide-react';
import { AuthoritativeSessionContext } from '../../security/authorization';
import { WargaChangeRequestItem } from '../../types/wargaDashboard';
import { WargaChangeRequestService } from '../../services/wargaChangeRequestService';

interface WargaChangeRequestStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  authContext: AuthoritativeSessionContext;
}

export const WargaChangeRequestStatusModal: React.FC<WargaChangeRequestStatusModalProps> = ({
  isOpen,
  onClose,
  authContext
}) => {
  const [requests, setRequests] = useState<WargaChangeRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await WargaChangeRequestService.getMyChangeRequests(authContext);
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, authContext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#2E7D52] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Status Pengajuan Warga</h3>
              <p className="text-[11px] text-slate-200">Riwayat permohonan perubahan data & penambahan anggota</p>
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Daftar Pengajuan ({requests.length})</span>
            <button
              onClick={loadRequests}
              disabled={isLoading}
              className="text-xs text-[#123B5D] font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Muat Ulang
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <Clock className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-300" />
              Memuat status pengajuan...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600">Belum Ada Pengajuan</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Anda belum pernah mengajukan perubahan data atau penambahan anggota keluarga.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isAdd = req.jenisPengajuan === 'ADD';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';
                const isPending = !isApproved && !isRejected;

                return (
                  <div
                    key={req.idPengajuan}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAdd ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <UserPlus className="w-3 h-3" /> Tambah Anggota
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-[#123B5D] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                            <FileText className="w-3 h-3" /> Ubah Data
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">{req.idPengajuan}</span>
                      </div>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Menunggu Verifikasi
                        </span>
                      )}
                      {isApproved && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Disetujui
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Ditolak
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isAdd
                          ? `Usulan: ${req.dataUsulan?.NAMA_LENGKAP || 'Anggota Baru'} (${req.dataUsulan?.HUBUNGAN_KELUARGA || 'ANGGOTA'})`
                          : `Usulan: Pembaruan Data ${req.dataUsulan?.NAMA_LENGKAP || ''}`}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alasan: <span className="text-slate-700 italic">"{req.alasan}"</span>
                      </p>
                      {req.buktiReferensi && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Bukti/Lampiran: {req.buktiReferensi}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Waktu Pengajuan: {req.timestampAjukan}</span>
                      {req.catatanVerifikasi && (
                        <span className="text-slate-600 font-semibold">{req.catatanVerifikasi}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
