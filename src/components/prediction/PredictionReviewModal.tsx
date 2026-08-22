// SMART RT 07 RW 11 GPA NGIJO - PREDIKSI KEBUTUHAN LAYANAN RT v1.0
// Review Modal for Human Oversight

import React, { useState } from 'react';
import { PredictionItem, PredictionActorSession } from '../../types/prediction';
import { predictionService } from '../../services/predictionService';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface PredictionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionItem | null;
  actor: PredictionActorSession;
  onSuccess: (updated: PredictionItem) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const PredictionReviewModal: React.FC<PredictionReviewModalProps> = ({
  isOpen,
  onClose,
  prediction,
  actor,
  onSuccess,
  addToast
}) => {
  if (!isOpen || !prediction) return null;

  const [reviewNote, setReviewNote] = useState(prediction.reviewNote || '');
  const [selectedAction, setSelectedAction] = useState<'REVIEW' | 'ACCEPT' | 'DISMISS'>('ACCEPT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = predictionService.reviewPrediction(
        actor,
        prediction.predictionId,
        selectedAction,
        reviewNote
      );

      const actionText = 
        selectedAction === 'ACCEPT' ? 'disetujui' :
        selectedAction === 'DISMISS' ? 'diabaikan' : 'dalam peninjauan';

      addToast('success', 'Status Rekomendasi Diperbarui', `Rekomendasi ${prediction.predictionId} telah ${actionText}.`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui Status', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Peninjauan Rekomendasi Prediksi</h3>
              <p className="text-xs text-slate-300">Keputusan Resmi Pengurus RT 07</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Info */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                {prediction.predictionId}
              </span>
              <span className="text-[10px] font-bold text-[#123B5D]">
                Periode: {prediction.period}
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{prediction.title}</h4>
            <p className="text-[11px] text-slate-600 line-clamp-2">{prediction.recommendation}</p>
          </div>

          {/* Action Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Pilih Keputusan Tindak Lanjut:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('ACCEPT')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  selectedAction === 'ACCEPT'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${selectedAction === 'ACCEPT' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Terima / Setuju</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REVIEW')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  selectedAction === 'REVIEW'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className={`w-5 h-5 ${selectedAction === 'REVIEW' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Kaji Ulang</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('DISMISS')}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  selectedAction === 'DISMISS'
                    ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className={`w-5 h-5 ${selectedAction === 'DISMISS' ? 'text-red-600' : 'text-slate-400'}`} />
                <span>Abaikan / Tutup</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Catatan Resmi Pengurus / Ketua RT:
            </label>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Contoh: Telah dikoordinasikan dengan Seksi Pembangunan untuk diagendakan pada kerja bakti bulan depan..."
              className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#123B5D] focus:border-transparent"
            />
          </div>

          {/* Reviewer Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Keputusan akan dicatat atas nama <strong>{actor.nama || actor.userId}</strong> ({actor.role}) pada audit trail.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#123B5D] hover:bg-[#1B4B75] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simpan Keputusan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
