/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Daftar Tata Tertib Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
  Download,
  Send,
  CheckCircle2,
  Archive,
  PlusCircle,
  ShieldCheck,
  Clock,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import {
  TataTertibArticle,
  TataTertibCategoryItem,
  TataTertibStatus
} from '../../types/tataTertib';
import { generateTataTertibPdf } from '../../utils/tataTertibPdf';

interface TataTertibDaftarTabProps {
  articles: TataTertibArticle[];
  categories: TataTertibCategoryItem[];
  currentRole: UserRole | string;
  onSelectArticle: (article: TataTertibArticle) => void;
  onEditArticle: (article: TataTertibArticle) => void;
  onSubmitReview: (article: TataTertibArticle) => void;
  onApproveArticle: (article: TataTertibArticle) => void;
  onArchiveArticle: (article: TataTertibArticle) => void;
  onOpenCreateDraft: () => void;
  onPrintArticle: (article: TataTertibArticle) => void;
}

export const TataTertibDaftarTab: React.FC<TataTertibDaftarTabProps> = ({
  articles,
  categories,
  currentRole,
  onSelectArticle,
  onEditArticle,
  onSubmitReview,
  onApproveArticle,
  onArchiveArticle,
  onOpenCreateDraft,
  onPrintArticle
}) => {
  const isCitizen = currentRole === 'WARGA' || currentRole === 'PUBLIC';
  const canEdit = ['ADMIN', 'KETUA_RT', 'PENGURUS'].includes(currentRole);
  const isKetuaOrAdmin = ['ADMIN', 'KETUA_RT'].includes(currentRole);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(isCitizen ? 'AKTIF' : 'ALL');

  // Filtered List
  const filteredArticles = useMemo(() => {
    return articles.filter(item => {
      // Citizen only sees AKTIF rules
      if (isCitizen && item.status !== 'AKTIF' && item.status !== 'ACTIVE') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.judul?.toLowerCase().includes(q);
        const matchCode = (item.kode || item.id)?.toLowerCase().includes(q);
        const matchCat = item.kategori?.toLowerCase().includes(q);
        const matchContent = item.isi?.toLowerCase().includes(q);
        const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchCat && !matchContent && !matchKeywords) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (item.kategori.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'AKTIF') {
          return item.status === 'AKTIF' || item.status === 'ACTIVE';
        }
        if (selectedStatus === 'DRAFT') {
          return item.status === 'DRAFT' || item.status === 'DITINJAU';
        }
        if (selectedStatus === 'MENUNGGU_PERSETUJUAN') {
          return item.status === 'MENUNGGU_PERSETUJUAN' || item.status === 'PENDING_APPROVAL';
        }
        if (selectedStatus === 'DIARSIPKAN') {
          return item.status === 'DIARSIPKAN' || item.status === 'ARCHIVED' || item.status === 'DIREVISI';
        }
      }

      return true;
    });
  }, [articles, searchQuery, selectedCategory, selectedStatus, isCitizen]);

  const getStatusBadge = (status: TataTertibStatus) => {
    switch (status) {
      case 'AKTIF':
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">AKTIF RESMI</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">DRAFT</span>;
      case 'MENUNGGU_PERSETUJUAN':
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">REVIEW KETUA RT</span>;
      case 'DITINJAU':
      case 'DIREVISI':
      case 'REVISED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">DIREVISI</span>;
      case 'DIARSIPKAN':
      case 'ARCHIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-300">DIARSIPKAN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode (e.g. TT-001), judul, pasal, kata kunci (parkir, sampah, portal)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter berdasarkan Kategori"
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter (Hidden for normal citizen) */}
          {!isCitizen && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter berdasarkan Status Aturan"
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Status: AKTIF</option>
              <option value="DRAFT">Status: DRAFT</option>
              <option value="MENUNGGU_PERSETUJUAN">Status: MENUNGGU APPROVAL</option>
              <option value="DIARSIPKAN">Status: ARSIP / REVISI</option>
            </select>
          )}

          {canEdit && (
            <button
              onClick={onOpenCreateDraft}
              className="px-3 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Draft
            </button>
          )}
        </div>
      </div>

      {/* Main Table / List View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-28">Kode</th>
                <th className="py-3 px-4">Judul Tata Tertib</th>
                <th className="py-3 px-3 w-32">Kategori</th>
                <th className="py-3 px-3 w-24 text-center">Versi</th>
                <th className="py-3 px-3 w-32 text-center">Status</th>
                <th className="py-3 px-3 w-28">Tgl Berlaku</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Tidak ada data tata tertib yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article, idx) => (
                  <tr key={article.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#123B5D]">
                      {article.kode || article.id}
                    </td>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectArticle(article)}
                        className="font-bold text-slate-800 hover:text-[#123B5D] cursor-pointer hover:underline"
                      >
                        {article.judul}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {article.tujuan || article.summary || article.isi}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {article.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      v{article.versi}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 font-medium">
                      {article.tanggalBerlaku}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail */}
                        <button
                          onClick={() => onSelectArticle(article)}
                          title="Buka Detail Tata Tertib"
                          className="p-1.5 text-slate-600 hover:text-[#123B5D] hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print */}
                        <button
                          onClick={() => onPrintArticle(article)}
                          title="Cetak A4 Resmi"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* PDF Download */}
                        <button
                          onClick={() => generateTataTertibPdf(article)}
                          title="Unduh File PDF Resmi"
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Edit for Admin/Pengurus */}
                        {canEdit && (
                          <button
                            onClick={() => onEditArticle(article)}
                            title="Edit / Revisi Pasal"
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Submit Review for Draft */}
                        {canEdit && article.status === 'DRAFT' && (
                          <button
                            onClick={() => onSubmitReview(article)}
                            title="Ajukan Persetujuan ke Ketua RT"
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Approve for Ketua RT */}
                        {isKetuaOrAdmin && (article.status === 'MENUNGGU_PERSETUJUAN' || article.status === 'PENDING_APPROVAL' || article.status === 'DRAFT') && (
                          <button
                            onClick={() => onApproveArticle(article)}
                            title="Sahkan & Publikasikan (Ketua RT)"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive for Ketua RT / Admin */}
                        {isKetuaOrAdmin && (article.status === 'AKTIF' || article.status === 'ACTIVE') && (
                          <button
                            onClick={() => onArchiveArticle(article)}
                            title="Arsipkan Aturan"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
