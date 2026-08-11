import React, { useState } from 'react';
import { ReasonCode } from '../../types/aiFeedback';
import { REASON_LABELS } from '../../services/aiFeedbackService';
import { X, ShieldAlert, AlertCircle, ThumbsDown, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasonCode: ReasonCode, comment: string) => void;
  questionSnippet?: string;
  answerSnippet?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  questionSnippet,
  answerSnippet
}) => {
  const [selectedReason, setSelectedReason] = useState<ReasonCode>('IRRELEVANT');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(selectedReason, comment);
      setIsSubmitting(false);
      setComment('');
      onClose();
    }, 300);
  };

  const reasonList = Object.keys(REASON_LABELS) as ReasonCode[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0D2A4A] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Apa yang salah dengan jawaban ini?</h3>
              <p className="text-[11px] text-slate-300">Umpan balik Anda sangat berharga untuk mengevaluasi & meningkatkan AI SMART RT.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Question / Answer Context Box */}
          {questionSnippet && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">Pertanyaan Pengguna:</p>
              <p className="text-slate-800 font-medium italic line-clamp-2">"{questionSnippet}"</p>
            </div>
          )}

          {/* Reason Code Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Pilih Alasan Utama <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reasonList.map((code) => {
                const isSelected = selectedReason === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedReason(code)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-[#0D2A4A]/5 border-[#0D2A4A] font-bold text-[#0D2A4A] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#0D2A4A] bg-[#0D2A4A] text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="leading-tight text-[11px]">{REASON_LABELS[code]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Comment Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Jelaskan masalahnya <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Contoh: SOP yang disebutkan di jawaban sudah diganti dengan aturan baru RT 2026..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D2A4A] focus:border-[#0D2A4A] text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Privacy Warning Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Peringatan Keamanan Privasi:</span>
              <p className="text-slate-600 text-[10px] leading-tight mt-0.5">
                Jangan masukkan NIK, nomor KK, password, PIN, atau data pribadi sensitif lainnya dalam komentar feedback.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Umpan Balik</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
