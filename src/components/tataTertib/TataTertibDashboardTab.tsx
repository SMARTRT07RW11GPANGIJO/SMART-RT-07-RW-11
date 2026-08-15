/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Dashboard Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  History,
  Search,
  Printer,
  PlusCircle,
  Megaphone,
  Award,
  Calendar,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import {
  TataTertibArticle,
  TataTertibSummaryStats,
  TataTertibTabType,
  TataTertibCategoryItem
} from '../../types/tataTertib';

interface TataTertibDashboardTabProps {
  stats: TataTertibSummaryStats;
  categories: TataTertibCategoryItem[];
  recentArticles: TataTertibArticle[];
  currentRole: UserRole | string;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
  onNavigateTab: (tab: TataTertibTabType) => void;
  onOpenCreateDraft: () => void;
  onSelectArticle: (article: TataTertibArticle) => void;
}

export const TataTertibDashboardTab: React.FC<TataTertibDashboardTabProps> = ({
  stats,
  categories,
  recentArticles,
  currentRole,
  isAcknowledged,
  onAcknowledge,
  onNavigateTab,
  onOpenCreateDraft,
  onSelectArticle
}) => {
  const canManage = ['ADMIN', 'KETUA_RT', 'PENGURUS'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Official RT 07 Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#1E4D79] to-[#2E7D52] rounded-2xl p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D4A72C]/60 flex items-center justify-center p-2 shadow-inner">
              <Building2 className="w-10 h-10 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#2E7D52] text-emerald-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  RT 07 RW 11
                </span>
                <span className="bg-[#D4A72C] text-[#123B5D] text-xs font-black px-2.5 py-0.5 rounded-full">
                  VERSI {stats.activeVersion}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                TATA TERTIB RESMI WARGA RT 07
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Perum Graha Permata Anugrah (GPA) Desa Ngijo, Kec. Karangploso, Kab. Malang
              </p>
            </div>
          </div>

          {/* Citizen Acknowledgment Pill */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-300">Status Pemahaman Warga</p>
              <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                {isAcknowledged ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    Telah Dikonfirmasi (v{stats.activeVersion})
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-300 inline" />
                    Belum Konfirmasi Versi Terbaru
                  </>
                )}
              </p>
            </div>
            {!isAcknowledged && (
              <button
                onClick={onAcknowledge}
                className="w-full sm:w-auto px-3.5 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Saya Mengerti & Setuju
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigateTab('DAFTAR')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktif Resmi</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Aturan Berlaku</span>
        </div>

        <div
          onClick={() => onNavigateTab('KATEGORI')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalCategories}</p>
          <span className="text-[10px] text-blue-600 font-bold">Bidang Lingkungan</span>
        </div>

        <div
          onClick={() => onNavigateTab('RIWAYAT')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Versi Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">v{stats.activeVersion}</p>
          <span className="text-[10px] text-amber-700 font-bold">{stats.effectiveDate}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sosialisasi</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.ackPercentage}%</p>
          <span className="text-[10px] text-indigo-600 font-bold">{stats.ackCount} / {stats.totalWarga} KK</span>
        </div>

        <div
          onClick={() => onNavigateTab('DAFTAR')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft / Review</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.draftCount + stats.pendingCount}</p>
          <span className="text-[10px] text-purple-600 font-bold">Proses Musyawarah</span>
        </div>

        <div
          onClick={() => onNavigateTab('DAFTAR')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aturan</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalTataTertib}</p>
          <span className="text-[10px] text-slate-500 font-bold">Seluruh Pasal</span>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('SEARCH')}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
            Pencarian Cepat
          </button>
          <button
            onClick={() => onNavigateTab('KATEGORI')}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            Lihat per Kategori
          </button>
          <button
            onClick={() => onNavigateTab('CETAK_PDF')}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            Cetak / Ekspor PDF
          </button>
          <button
            onClick={() => onNavigateTab('PENGUMUMAN')}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Megaphone className="w-4 h-4 text-amber-600" />
            Pengumuman Perubahan
          </button>
        </div>

        {canManage && (
          <button
            onClick={onOpenCreateDraft}
            className="px-3.5 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Draft Tata Tertib Baru
          </button>
        )}
      </div>

      {/* Two Column Section: Recent Rules & Categories Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Rules Quick Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2E7D52]" />
              Daftar Aturan Resmi Terkini
            </h3>
            <button
              onClick={() => onNavigateTab('DAFTAR')}
              className="text-xs text-[#123B5D] hover:underline font-bold flex items-center gap-1"
            >
              Lihat Seluruh ({stats.activeCount})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {recentArticles.slice(0, 6).map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#123B5D] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {article.kode || article.id}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      v{article.versi}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-2 line-clamp-1">
                    {article.judul}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {article.tujuan || article.summary || article.isi}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">{article.kategori}</span>
                  <span className="text-[#123B5D] font-bold flex items-center gap-1 group">
                    Buka Detail <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Categories Badge Explorer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Kategori Tata Tertib
            </h3>
            <button
              onClick={() => onNavigateTab('KATEGORI')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Kelola Kategori
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            {categories.slice(0, 8).map(cat => (
              <div
                key={cat.id}
                onClick={() => onNavigateTab('KATEGORI')}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {cat.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{cat.description || cat.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>

          {/* Legal Notice */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Keabsahan Hukum Lingkungan
            </h4>
            <p className="text-[11px] text-emerald-700 mt-1">
              Tata tertib ini disahkan secara sah oleh Pengurus & Ketua RT 07 RW 11 GPA Ngijo dan mengikat seluruh penghuni serta tamu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
