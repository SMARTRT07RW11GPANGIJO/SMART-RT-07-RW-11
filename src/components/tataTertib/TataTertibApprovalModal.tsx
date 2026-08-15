/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Approval & Publishing Modal for Ketua RT / Admin
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  GitBranch,
  Building2,
  FileCheck
} from 'lucide-react';
import { TataTertibArticle } from '../../types/tataTertib';

interface TataTertibApprovalModalProps {
  article: TataTertibArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (
    articleId: string,
    newVersion: string,
    effectiveDate: string,
    changeSummary: string,
    reason: string
  ) => void;
}

export const TataTertibApprovalModal: React.FC<TataTertibApprovalModalProps> = ({
  article,
  isOpen,
  onClose,
  onApprove
}) => {
  if (!isOpen || !article) return null;

  const [newVersion, setNewVersion] = useState('1.2');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [changeSummary, setChangeSummary] = useState(
    `Pengesahan resmi aturan ${article.judul} untuk lingkungan RT 07 RW 11 GPA Ngijo.`
  );
  const [reason, setReason] = useState('Hasil keputusan musyawarah warga RT 07 RW 11.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion || !changeSummary || !effectiveDate) return;

    onApprove(article.id, newVersion, effectiveDate, changeSummary, reason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E7D52] to-[#123B5D] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileCheck className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Pengesahan & Publikasi Tata Tertib
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Wewenang Khusus Ketua RT 07 RW 11 GPA Ngijo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <p className="font-bold text-sm">
              {article.kode || article.id}: {article.judul}
            </p>
            <p className="text-xs text-emerald-700">
              Kategori: <span className="font-semibold">{article.kategori}</span> • Dibuat oleh: <span className="font-semibold">{article.dibuatOleh}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Versi yang Disahkan *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1.2 atau 2.0"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Mulai Berlaku Efektif *
              </label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ringkasan Perubahan / Berita Acara *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan ringkasan poin yang diubah atau disahkan..."
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dasar Pertimbangan / Alasan Amandemen
            </label>
            <input
              type="text"
              placeholder="e.g. Hasil evaluasi rapat warga semester 1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Legal statement */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>
              Dengan menekan tombol di bawah, aturan ini akan langsung berstatus <strong className="text-emerald-800">AKTIF RESMI</strong>, dapat diakses seluruh warga, dan otomatis diperbarui di basis pengetahuan AI Assistant RITA.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Sahkan & Publikasikan Resmi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
