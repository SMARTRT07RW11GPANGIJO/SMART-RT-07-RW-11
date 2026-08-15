/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Detail Modal for Tata Tertib Article
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Printer,
  Download,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  QrCode,
  Tag
} from 'lucide-react';
import { TataTertibArticle } from '../../types/tataTertib';
import { generateTataTertibPdf } from '../../utils/tataTertibPdf';

interface TataTertibDetailModalProps {
  article: TataTertibArticle | null;
  onClose: () => void;
  onPrint: (article: TataTertibArticle) => void;
  onSubmitFeedback: (tataTertibId: string, isHelpful: boolean, comment?: string) => void;
}

export const TataTertibDetailModal: React.FC<TataTertibDetailModalProps> = ({
  article,
  onClose,
  onPrint,
  onSubmitFeedback
}) => {
  if (!article) return null;

  const [feedbackSent, setFeedbackSent] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleFeedback = (isHelpful: boolean) => {
    onSubmitFeedback(article.id, isHelpful, commentText);
    setFeedbackSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#1E4D79] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-amber-200">
                  {article.kode || article.id}
                </span>
                <span className="text-[11px] font-bold bg-[#2E7D52] px-2 py-0.5 rounded-full">
                  {article.kategori}
                </span>
                <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  v{article.versi}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-1 line-clamp-1">
                {article.judul}
              </h3>
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Nomor Dokumen</span>
              <p className="font-mono font-bold text-slate-800 line-clamp-1 mt-0.5">
                {article.documentNumber || `TT/RT07RW11/${article.id}/2026`}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Tanggal Berlaku</span>
              <p className="font-bold text-slate-800 mt-0.5">{article.tanggalBerlaku}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Penyusun</span>
              <p className="font-bold text-slate-800 mt-0.5 line-clamp-1">{article.dibuatOleh || 'Pengurus RT'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Disahkan Oleh</span>
              <p className="font-bold text-emerald-800 mt-0.5 line-clamp-1">{article.disetujuiOleh || 'Ketua RT 07'}</p>
            </div>
          </div>

          {/* Dasar, Tujuan & Ruang Lingkup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.dasar && (
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
                <span className="font-bold text-xs text-blue-900">Dasar Hukum & Kesepakatan:</span>
                <p className="text-xs text-blue-800 mt-1">{article.dasar}</p>
              </div>
            )}
            {article.tujuan && (
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
                <span className="font-bold text-xs text-emerald-900">Maksud & Tujuan:</span>
                <p className="text-xs text-emerald-800 mt-1">{article.tujuan}</p>
              </div>
            )}
          </div>

          {/* Kewajiban & Larangan Grid */}
          {(article.kewajiban?.length || article.larangan?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.kewajiban && article.kewajiban.length > 0 && (
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Kewajiban Warga
                  </h4>
                  <ul className="space-y-1.5">
                    {article.kewajiban.map((k, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.larangan && article.larangan.length > 0 && (
                <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200">
                  <h4 className="font-bold text-xs text-rose-900 uppercase flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Larangan Lingkungan
                  </h4>
                  <ul className="space-y-1.5">
                    {article.larangan.map((l, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Full Content (Isi Pasal) */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#123B5D]" />
              Naskah Lengkap Pasal
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
              {article.isi || article.content}
            </div>
          </div>

          {/* Sanksi */}
          {article.sanksi && (
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs">
              <span className="font-bold text-amber-900">Ketentuan Sanksi Pelanggaran: </span>
              <span className="text-amber-800">{article.sanksi}</span>
            </div>
          )}

          {/* Keywords / Tags */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Kata Kunci:
              </span>
              {article.keywords.map((kw, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Apakah penjelasan aturan ini cukup jelas bagi Anda?
              </span>
              {!feedbackSent ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Jelas & Paham
                  </button>
                  <button
                    onClick={() => setShowCommentBox(true)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Perlu Masukan
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Terima kasih atas aspirasi Anda!
                </span>
              )}
            </div>

            {showCommentBox && !feedbackSent && (
              <div className="pt-2 space-y-2">
                <textarea
                  placeholder="Tuliskan pertanyaan atau usulan masukan perbaikan untuk aturan ini..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                  rows={2}
                />
                <button
                  onClick={() => handleFeedback(false)}
                  className="px-3.5 py-1.5 bg-[#123B5D] text-white text-xs font-bold rounded-lg"
                >
                  Kirim Masukan Aspirasi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <QrCode className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-[11px]">Verifikasi Sah: SMART-RT-07-OK</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(article)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              Cetak Dokumen
            </button>
            <button
              onClick={() => generateTataTertibPdf(article)}
              className="px-3.5 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Unduh PDF Resmi
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
