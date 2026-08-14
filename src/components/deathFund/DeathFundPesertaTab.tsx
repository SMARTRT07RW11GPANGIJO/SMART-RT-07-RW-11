import React, { useState } from 'react';
import { PesertaDanaKematian, AnggotaKeluargaDK, StatusPesertaDK } from '../../types/deathFund';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  Phone, 
  Home, 
  User, 
  Calendar,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';

interface DeathFundPesertaTabProps {
  pesertaList: PesertaDanaKematian[];
  onAddPeserta: (payload: any) => void;
  onUpdatePeserta: (id: string, payload: any) => void;
  currentRole: string;
}

export const DeathFundPesertaTab: React.FC<DeathFundPesertaTabProps> = ({
  pesertaList,
  onAddPeserta,
  onUpdatePeserta,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusPesertaDK>('ALL');
  const [selectedPesertaDetail, setSelectedPesertaDetail] = useState<PesertaDanaKematian | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPeserta, setEditingPeserta] = useState<PesertaDanaKematian | null>(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    nomorKKInternal: '',
    namaKepalaKeluarga: '',
    jumlahAnggota: 2,
    status: 'AKTIF' as StatusPesertaDK,
    tanggalBergabung: new Date().toISOString().slice(0, 10),
    keterangan: 'Warga Tetap RT 07',
    noHp: '',
    blokRumah: 'Blok A',
    nomorRumah: '01'
  });

  const canManage = ['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const filteredList = pesertaList.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.namaKepalaKeluarga.toLowerCase().includes(q);
      const matchKK = p.nomorKKInternal.toLowerCase().includes(q);
      const matchBlok = `${p.blokRumah} ${p.nomorRumah}`.toLowerCase().includes(q);
      if (!matchName && !matchKK && !matchBlok) return false;
    }
    return true;
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.namaKepalaKeluarga.trim()) return;

    onAddPeserta({
      ...addForm,
      nomorKKInternal: addForm.nomorKKInternal || `KK-RT07-${String(pesertaList.length + 1).padStart(3, '0')}`
    });

    setIsAddModalOpen(false);
    setAddForm({
      nomorKKInternal: '',
      namaKepalaKeluarga: '',
      jumlahAnggota: 2,
      status: 'AKTIF',
      tanggalBergabung: new Date().toISOString().slice(0, 10),
      keterangan: 'Warga Tetap RT 07',
      noHp: '',
      blokRumah: 'Blok A',
      nomorRumah: '01'
    });
  };

  const handleOpenEdit = (p: PesertaDanaKematian) => {
    setEditingPeserta(p);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeserta) return;

    onUpdatePeserta(editingPeserta.idPeserta, editingPeserta);
    setIsEditModalOpen(false);
    setEditingPeserta(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> Basis Data Peserta Dana Kematian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {pesertaList.length} KK Terdata ({pesertaList.filter(p => p.status === 'AKTIF').length} Aktif, {pesertaList.filter(p => p.status !== 'AKTIF').length} Nonaktif/Pindah)
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> Tambah Peserta Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kepala keluarga, blok rumah, atau nomor KK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="ALL">Semua Status ({pesertaList.length})</option>
            <option value="AKTIF">Status: AKTIF</option>
            <option value="NONAKTIF">Status: NONAKTIF</option>
            <option value="KELUAR">Status: KELUAR / PINDAH</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID / No. KK</th>
                <th className="p-3.5">Nama Kepala Keluarga</th>
                <th className="p-3.5">Alamat / Blok</th>
                <th className="p-3.5 text-center">Anggota</th>
                <th className="p-3.5">Kontak WA</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Tgl Gabung</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data peserta sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => {
                  return (
                    <tr key={p.idPeserta} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-700">{p.idPeserta}</div>
                        <div className="text-[11px] text-slate-400">{p.nomorKKInternal}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 text-sm">{p.namaKepalaKeluarga}</div>
                        <div className="text-[11px] text-slate-500">{p.keterangan || 'Warga RT 07'}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="font-semibold text-slate-700">{p.blokRumah || '-'}</span> No. {p.nomorRumah || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {p.jumlahAnggota || (p.anggotaKeluarga?.length || 2)} Jiwa
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {p.noHp || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            p.status === 'AKTIF'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'NONAKTIF'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {p.tanggalBergabung}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPesertaDetail(p)}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-all title='Lihat Anggota Keluarga'"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all title='Ubah Data'"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL: ANGGOTA KELUARGA */}
      {selectedPesertaDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" /> Detail Kepesertaan & Anggota Keluarga
                </h4>
                <p className="text-xs text-slate-300">
                  {selectedPesertaDetail.namaKepalaKeluarga} ({selectedPesertaDetail.idPeserta})
                </p>
              </div>
              <button
                onClick={() => setSelectedPesertaDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[11px]">Nomor KK Internal</div>
                  <div className="font-bold text-slate-800">{selectedPesertaDetail.nomorKKInternal}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Alamat</div>
                  <div className="font-bold text-slate-800">{selectedPesertaDetail.blokRumah} No. {selectedPesertaDetail.nomorRumah}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Status</div>
                  <div className="font-bold text-emerald-600">{selectedPesertaDetail.status}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Kontak WA</div>
                  <div className="font-bold text-slate-800">{selectedPesertaDetail.noHp || '-'}</div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 text-xs mb-2">Daftar Anggota Keluarga yang Ditanggung:</h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Nama Anggota</th>
                        <th className="p-2.5">Hubungan</th>
                        <th className="p-2.5">Status Hak Santunan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedPesertaDetail.anggotaKeluarga || []).map((ang, idx) => (
                        <tr key={ang.id || idx}>
                          <td className="p-2.5 font-medium text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{ang.nama}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                              {ang.hubungan}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {ang.statusKepesertaan || 'AKTIF'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-800 text-[11px] leading-relaxed">
                ℹ️ <strong>Ketentuan Santunan:</strong> Setiap anggota keluarga yang terdaftar berhak menerima santunan duka cita dan bantuan pemakaman resmi dari Kas Dana Kematian RT 07 sesuai ketetapan musyawarah warga.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPesertaDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PESERTA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-teal-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-300" /> Tambah Peserta Dana Kematian Baru
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kepala Keluarga / Warga *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Budi Santoso"
                  value={addForm.namaKepalaKeluarga}
                  onChange={(e) => setAddForm({ ...addForm, namaKepalaKeluarga: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blok Rumah</label>
                  <select
                    value={addForm.blokRumah}
                    onChange={(e) => setAddForm({ ...addForm, blokRumah: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Blok A">Blok A</option>
                    <option value="Blok B">Blok B</option>
                    <option value="Blok C">Blok C</option>
                    <option value="Blok D">Blok D</option>
                    <option value="Blok E">Blok E</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Rumah</label>
                  <input
                    type="text"
                    placeholder="Contoh: 05"
                    value={addForm.nomorRumah}
                    onChange={(e) => setAddForm({ ...addForm, nomorRumah: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={addForm.noHp}
                    onChange={(e) => setAddForm({ ...addForm, noHp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah Anggota Keluarga</label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.jumlahAnggota}
                    onChange={(e) => setAddForm({ ...addForm, jumlahAnggota: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Domisili</label>
                <input
                  type="text"
                  value={addForm.keterangan}
                  onChange={(e) => setAddForm({ ...addForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PESERTA MODAL */}
      {isEditModalOpen && editingPeserta && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-teal-300" /> Perbarui Data Peserta ({editingPeserta.idPeserta})
              </h4>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kepala Keluarga</label>
                <input
                  type="text"
                  required
                  value={editingPeserta.namaKepalaKeluarga}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, namaKepalaKeluarga: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Kepesertaan</label>
                  <select
                    value={editingPeserta.status}
                    onChange={(e) => setEditingPeserta({ ...editingPeserta, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                    <option value="KELUAR">KELUAR</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={editingPeserta.noHp || ''}
                    onChange={(e) => setEditingPeserta({ ...editingPeserta, noHp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={editingPeserta.keterangan || ''}
                  onChange={(e) => setEditingPeserta({ ...editingPeserta, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
