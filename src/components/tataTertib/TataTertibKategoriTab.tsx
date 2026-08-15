/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Kategori Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState } from 'react';
import {
  FolderOpen,
  PlusCircle,
  Shield,
  Trash2,
  Car,
  Home,
  Users,
  Dog,
  Calendar,
  Volume2,
  FileText,
  Building2,
  CheckSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import {
  TataTertibArticle,
  TataTertibCategoryItem
} from '../../types/tataTertib';

interface TataTertibKategoriTabProps {
  categories: TataTertibCategoryItem[];
  articles: TataTertibArticle[];
  currentRole: UserRole | string;
  onAddCategory: (categoryData: { code: string; name: string; description?: string }) => void;
  onFilterByCategory: (categoryCode: string) => void;
}

export const TataTertibKategoriTab: React.FC<TataTertibKategoriTabProps> = ({
  categories,
  articles,
  currentRole,
  onAddCategory,
  onFilterByCategory
}) => {
  const canManage = ['ADMIN', 'KETUA_RT', 'PENGURUS'].includes(currentRole);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  const getCategoryIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'KEBERSIHAN':
      case 'SAMPAH':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'KEAMANAN':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'KETERTIBAN':
        return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case 'LINGKUNGAN':
        return <Home className="w-5 h-5 text-teal-600" />;
      case 'SOSIAL':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'FASILITAS_UMUM':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'PARKIR':
        return <Car className="w-5 h-5 text-purple-600" />;
      case 'HEWAN_PELIHARAAN':
        return <Dog className="w-5 h-5 text-orange-600" />;
      case 'KEGIATAN_WARGA':
        return <Calendar className="w-5 h-5 text-pink-600" />;
      case 'JAM_ISTIRAHAT':
        return <Volume2 className="w-5 h-5 text-sky-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    onAddCategory({
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim()
    });

    setFormData({ code: '', name: '', description: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#123B5D]" />
            Struktur Bidang & Kategori Tata Tertib
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kategori aturan lingkungan RT 07 RW 11 GPA Ngijo yang dinamis dan terorganisir per bidang spesifik.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {showAddForm ? 'Tutup Form' : 'Tambah Kategori'}
          </button>
        )}
      </div>

      {/* Add Category Form (Admin / Pengurus) */}
      {showAddForm && canManage && (
        <form onSubmit={handleFormSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-300 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#D4A72C]" />
            Tambah Kategori Tata Tertib Baru
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Kode Kategori (Singkat, Huruf Kapital, e.g. KEBERSIHAN, PARKIR)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KEBERSIHAN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nama Kategori Resmi
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kebersihan Lingkungan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Deskripsi Ruang Lingkup Kategori
            </label>
            <input
              type="text"
              placeholder="e.g. Ketentuan seputar pengelolaan sampah, sanitasi selokan, dan kerja bakti."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#123B5D] text-white text-xs font-bold rounded-lg hover:bg-[#0A2338]"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const ruleCount = articles.filter(
            a => a.kategori.toLowerCase() === cat.code.toLowerCase() || (a.category && a.category.toLowerCase() === cat.code.toLowerCase())
          ).length;

          return (
            <div
              key={cat.id}
              onClick={() => onFilterByCategory(cat.code)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#123B5D] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getCategoryIcon(cat.code)}
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {cat.code}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 mt-3 group-hover:text-[#123B5D] transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'Ketentuan dan norma ketertiban lingkungan RT 07 RW 11.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {ruleCount} Pasal / Aturan
                </span>
                <span className="text-[#123B5D] font-bold flex items-center gap-1">
                  Buka Aturan <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
