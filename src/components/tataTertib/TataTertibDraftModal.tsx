/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Create & Edit Draft Modal for Tata Tertib
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FileEdit,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  TataTertibArticle,
  TataTertibCategoryItem
} from '../../types/tataTertib';

interface TataTertibDraftModalProps {
  initialArticle?: TataTertibArticle | null;
  categories: TataTertibCategoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
}

export const TataTertibDraftModal: React.FC<TataTertibDraftModalProps> = ({
  initialArticle,
  categories,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialArticle;

  const [judul, setJudul] = useState(initialArticle?.judul || '');
  const [kategori, setKategori] = useState(initialArticle?.kategori || 'KEBERSIHAN');
  const [isi, setIsi] = useState(initialArticle?.isi || initialArticle?.content || '');
  const [dasar, setDasar] = useState(initialArticle?.dasar || '');
  const [tujuan, setTujuan] = useState(initialArticle?.tujuan || initialArticle?.summary || '');
  const [ruangLingkup, setRuangLingkup] = useState(initialArticle?.ruangLingkup || '');
  const [kewajiban, setKewajiban] = useState<string[]>(initialArticle?.kewajiban || ['']);
  const [larangan, setLarangan] = useState<string[]>(initialArticle?.larangan || ['']);
  const [sanksi, setSanksi] = useState(initialArticle?.sanksi || '');
  const [catatan, setCatatan] = useState(initialArticle?.catatan || '');
  const [keywords, setKeywords] = useState(initialArticle?.keywords?.join(', ') || '');

  const handleAddKewajiban = () => setKewajiban([...kewajiban, '']);
  const handleRemoveKewajiban = (index: number) => setKewajiban(kewajiban.filter((_, i) => i !== index));
  const handleChangeKewajiban = (index: number, val: string) => {
    const copy = [...kewajiban];
    copy[index] = val;
    setKewajiban(copy);
  };

  const handleAddLarangan = () => setLarangan([...larangan, '']);
  const handleRemoveLarangan = (index: number) => setLarangan(larangan.filter((_, i) => i !== index));
  const handleChangeLarangan = (index: number, val: string) => {
    const copy = [...larangan];
    copy[index] = val;
    setLarangan(copy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) return;

    const payload = {
      judul: judul.trim(),
      kategori,
      isi: isi.trim(),
      dasar: dasar.trim() || undefined,
      tujuan: tujuan.trim() || undefined,
      ruangLingkup: ruangLingkup.trim() || undefined,
      kewajiban: kewajiban.map(k => k.trim()).filter(Boolean),
      larangan: larangan.map(l => l.trim()).filter(Boolean),
      sanksi: sanksi.trim() || undefined,
      catatan: catatan.trim() || undefined,
      keywords: keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#1E4D79] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileEdit className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? `Edit / Revisi Aturan #${initialArticle?.kode || initialArticle?.id}` : 'Form Penyusunan Draft Tata Tertib Baru'}
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Pengurus RT 07 RW 11 GPA Ngijo
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Judul Aturan / Bab Tata Tertib *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ketentuan Pengelolaan Sampah & Jadwal Angkut"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Bidang Kategori *
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dasar Hukum / Musyawarah
              </label>
              <input
                type="text"
                placeholder="e.g. Hasil Musyawarah Warga RT 07 & Perda Kebersihan"
                value={dasar}
                onChange={(e) => setDasar(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Maksud & Tujuan Aturan
              </label>
              <input
                type="text"
                placeholder="e.g. Menjaga kebersihan saluran air dan kenyamanan pemukiman"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ruang Lingkup Berlaku
            </label>
            <input
              type="text"
              placeholder="e.g. Seluruh warga penghuni, pengontrak, dan tamu di lingkungan RT 07"
              value={ruangLingkup}
              onChange={(e) => setRuangLingkup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          {/* Kewajiban List */}
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-900">
                Poin Kewajiban Warga (Dos)
              </label>
              <button
                type="button"
                onClick={handleAddKewajiban}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Poin
              </button>
            </div>
            {kewajiban.map((k, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Kewajiban #${idx + 1}`}
                  value={k}
                  onChange={(e) => handleChangeKewajiban(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {kewajiban.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKewajiban(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Larangan List */}
          <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-rose-900">
                Poin Larangan (Don'ts)
              </label>
              <button
                type="button"
                onClick={handleAddLarangan}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Poin
              </button>
            </div>
            {larangan.map((l, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Larangan #${idx + 1}`}
                  value={l}
                  onChange={(e) => handleChangeLarangan(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {larangan.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLarangan(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Naskah Lengkap Pasal */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Naskah Rincian Pasal Lengkap *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Ketik naskah pasal secara lengkap, terstruktur dengan nomor ayat..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-sans leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ketentuan Sanksi
              </label>
              <input
                type="text"
                placeholder="e.g. Teguran lisan, tertulis, dan denda sosial pembersihan"
                value={sanksi}
                onChange={(e) => setSanksi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Kunci Pencarian (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                placeholder="e.g. sampah, selokan, got, jentik, denda"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              <Save className="w-4 h-4" />
              Simpan Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
