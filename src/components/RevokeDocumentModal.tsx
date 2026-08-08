import React, { useState } from 'react';
import { X, Ban, AlertTriangle, ShieldAlert } from 'lucide-react';
import { DigitalDocument } from '../types/rt';

interface RevokeDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DigitalDocument | null;
  onConfirmRevoke: (docId: string, reason: string) => void;
}

export const RevokeDocumentModal: React.FC<RevokeDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onConfirmRevoke
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !doc) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim() === '') {
      setError('Alasan pencabutan dokumen Wajib diisi!');
      return;
    }
    onConfirmRevoke(doc.documentId, reason);
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A2338] text-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden">
        
        <div className="p-5 bg-red-950/80 border-b border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Konfirmasi Pencabutan Dokumen</h3>
              <p className="text-xs text-red-200">Aksi ini permanen dan mengubah status verifikasi menjadi REVOKED.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Nomor Surat:</span>
              <span className="font-mono text-emerald-400 font-bold">{doc.nomorSurat}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Document ID:</span>
              <span className="font-mono text-amber-300 font-bold">{doc.documentId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Pemohon:</span>
              <span className="text-white font-bold">{doc.pemohonNama}</span>
            </div>
          </div>

          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-600/50 flex items-start gap-2 text-amber-200 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              Setelah dicabut, siapapun yang memindai QR Code pada dokumen ini akan menerima status <strong>DOCUMENT REVOKED</strong> beserta alasan pencabutan.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Alasan Pencabutan Dokumen *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={3}
              placeholder="Contoh: Terjadi kekeliruan data pemohon / Pemohon telah pindah domisili / Pembatalan oleh instansi pengaju."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
            {error && <p className="text-red-400 text-[11px] mt-1 font-bold">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <ShieldAlert className="w-4 h-4" /> Ya, Cabut Dokumen
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
