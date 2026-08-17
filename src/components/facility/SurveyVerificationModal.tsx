// SMART RT 07 RW 11 GPA NGIJO - GEO SURVEY VERIFICATION MODAL v2.0
// Official Review, Approval & Rejection Workflow for Field GPS Surveys

import React, { useState } from 'react';
import { GeoSurvey, FacilityActorSession } from '../../types/facility';
import { getGPSAccuracyGrade } from '../../config/facilityConfig';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Compass,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface SurveyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: GeoSurvey | null;
  actor: FacilityActorSession;
  onVerify: (surveyId: string, reviewNotes: string) => Promise<void>;
  onReject: (surveyId: string, rejectionReason: string) => Promise<void>;
}

export const SurveyVerificationModal: React.FC<SurveyVerificationModalProps> = ({
  isOpen,
  onClose,
  survey,
  actor,
  onVerify,
  onReject
}) => {
  const [reviewNotes, setReviewNotes] = useState('Terverifikasi sesuai kondisi fisik lapangan dan batas wilayah RT 07.');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !survey) return null;

  const accuracyInfo = getGPSAccuracyGrade(survey.accuracyMeters);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      setErrorMsg('Alasan penolakan survey wajib diisi.');
      return;
    }

    setIsProcessing(true);
    try {
      if (actionType === 'APPROVE') {
        await onVerify(survey.surveyId, reviewNotes);
      } else {
        await onReject(survey.surveyId, rejectionReason);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses verifikasi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Verifikasi Survey Lapangan</h2>
              <p className="text-xs text-slate-300">
                Otorisasi & Sinkronisasi ke GeoBase Resmi RT 07 RW 11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Survey Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-500">{survey.surveyId}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                STATUS: {survey.verificationStatus}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{survey.namaFasilitas}</h3>
              <p className="text-xs text-slate-500">Kategori: {survey.kategori} • Sub: {survey.subkategori}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Koordinat GPS</span>
                <span className="font-mono font-bold text-slate-800">
                  {survey.latitude}, {survey.longitude}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Akurasi Perangkat</span>
                <span className="font-mono font-bold text-slate-800">
                  ± {survey.accuracyMeters} m ({accuracyInfo.label})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Surveyor: <strong>{survey.capturedByName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(survey.capturedAt).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {survey.notes && (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Catatan Lapangan:</span>
                <p className="text-slate-600 italic">"{survey.notes}"</p>
              </div>
            )}

            {/* Photo Evidence Thumbnail if present */}
            {survey.photoEvidence && survey.photoEvidence.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Bukti Foto Terlampir:
                </span>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {survey.photoEvidence.map((ev, idx) => (
                    <img
                      key={idx}
                      src={ev.fileData}
                      alt={ev.fileName}
                      className="w-24 h-16 rounded-lg object-cover border border-slate-300 shadow-xs"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Keputusan Pengurus RT 07
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('APPROVE')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui & Sinkronkan
              </button>
              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  actionType === 'REJECT'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Tolak Hasil Survey
              </button>
            </div>
          </div>

          {/* Notes or Reason Input */}
          {actionType === 'APPROVE' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Verifikasi Resmi
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">
                Alasan Penolakan Survey <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="Jelaskan alasan penolakan (misal: titik GPS di luar wilayah RT 07, foto tidak sesuai, dll)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center gap-2 ${
              actionType === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {actionType === 'APPROVE' ? 'Konfirmasi Verifikasi' : 'Tolak Survey'}
          </button>
        </div>
      </div>
    </div>
  );
};
