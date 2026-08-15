/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Search & Smart Query Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  Tag,
  ChevronRight,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  TataTertibArticle,
  TataTertibCategoryItem
} from '../../types/tataTertib';
import { generateTataTertibPdf } from '../../utils/tataTertibPdf';

interface TataTertibSearchTabProps {
  articles: TataTertibArticle[];
  categories: TataTertibCategoryItem[];
  onSelectArticle: (article: TataTertibArticle) => void;
  onPrintArticle: (article: TataTertibArticle) => void;
}

const QUICK_TAGS = [
  'Portal Malam',
  'Parkir Mobil',
  'Sampah & Kebersihan',
  'Tamu 1x24 Jam',
  'Renovasi Rumah',
  'Hewan Peliharaan',
  'Iuran RT & Kematian',
  'Sanksi Pelanggaran'
];

export const TataTertibSearchTab: React.FC<TataTertibSearchTabProps> = ({
  articles,
  categories,
  onSelectArticle,
  onPrintArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredResults = useMemo(() => {
    return articles.filter(item => {
      // Only active rules
      if (item.status !== 'AKTIF' && item.status !== 'ACTIVE') return false;

      // Category match
      if (selectedCategory !== 'ALL' && item.kategori.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search matching
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const matchTitle = item.judul.toLowerCase().includes(q);
      const matchCode = (item.kode || item.id).toLowerCase().includes(q);
      const matchCategory = item.kategori.toLowerCase().includes(q);
      const matchContent = (item.isi || '').toLowerCase().includes(q);
      const matchTujuan = (item.tujuan || '').toLowerCase().includes(q);
      const matchKewajiban = item.kewajiban?.some(k => k.toLowerCase().includes(q));
      const matchLarangan = item.larangan?.some(l => l.toLowerCase().includes(q));
      const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));

      return matchTitle || matchCode || matchCategory || matchContent || matchTujuan || matchKewajiban || matchLarangan || matchKeywords;
    });
  }, [articles, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-[#123B5D]" />
          <h3 className="text-base font-bold text-slate-800">
            Pencarian Cerdas Tata Tertib RT 07 RW 11
          </h3>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ketik kata kunci pencarian (contoh: parkir mobil, bakar sampah, portal 23.00, renovasi rumah)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Quick Tag Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Pencarian Populer:
          </span>
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag.split(' ')[0])}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Kategori:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#123B5D] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({articles.filter(a => a.status === 'AKTIF').length})
          </button>
          {categories.map(cat => {
            const count = articles.filter(a => a.status === 'AKTIF' && a.kategori.toLowerCase() === cat.code.toLowerCase()).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.code)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.code
                    ? 'bg-[#123B5D] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-600">
          Ditemukan <span className="text-[#123B5D] font-black">{filteredResults.length}</span> aturan yang cocok
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-3.5">
        {filteredResults.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm text-slate-600">Tidak ada aturan yang cocok dengan kata kunci tersebut.</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci umum lainnya seperti "kebersihan", "mobil", "keamanan".</p>
          </div>
        ) : (
          filteredResults.map(article => (
            <div
              key={article.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#123B5D] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#123B5D] bg-slate-100 px-2 py-0.5 rounded">
                    {article.kode || article.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {article.kategori}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    v{article.versi}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectArticle(article)}
                    className="px-2.5 py-1 text-xs font-bold text-[#123B5D] hover:bg-slate-100 rounded-lg flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Lengkap
                  </button>
                  <button
                    onClick={() => onPrintArticle(article)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak
                  </button>
                  <button
                    onClick={() => generateTataTertibPdf(article)}
                    className="px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>

              <div>
                <h4
                  onClick={() => onSelectArticle(article)}
                  className="font-bold text-base text-slate-800 hover:text-[#123B5D] cursor-pointer"
                >
                  {article.judul}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {article.tujuan || article.summary}
                </p>
              </div>

              {/* Kewajiban / Larangan Highlights */}
              {(article.kewajiban?.length || article.larangan?.length) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg text-xs">
                  {article.kewajiban && article.kewajiban.length > 0 && (
                    <div>
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Kewajiban Pokok:
                      </span>
                      <ul className="list-disc list-inside text-slate-700 mt-1 space-y-0.5 pl-1">
                        {article.kewajiban.slice(0, 2).map((k, i) => (
                          <li key={i} className="line-clamp-1">{k}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {article.larangan && article.larangan.length > 0 && (
                    <div>
                      <span className="font-bold text-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Larangan Pokok:
                      </span>
                      <ul className="list-disc list-inside text-slate-700 mt-1 space-y-0.5 pl-1">
                        {article.larangan.slice(0, 2).map((l, i) => (
                          <li key={i} className="line-clamp-1">{l}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Berlaku sejak: {article.tanggalBerlaku}</span>
                <span>Pengesahan: {article.disetujuiOleh}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
