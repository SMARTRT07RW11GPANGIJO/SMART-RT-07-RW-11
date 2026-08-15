import React, { useState } from 'react';
import { KejadianKematianDK, StatusKejadianDK, PesertaDanaKematian } from '../../types/deathFund';
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  PlusCircle, 
  FileText, 
  User, 
  MapPin, 
  ShieldCheck, 
  X,
  Send,
  Eye
} from 'lucide-react';

interface DeathFundKejadianTabProps {
  kejadianList: KejadianKematianDK[];
  pesertaList: PesertaDanaKematian[];
  onReportKejadian: (payload: any) => void;
  onVerifyKejadian: (id: string, status: any) => void;
  onCreateSantunanDraft: (kejadian: KejadianKematianDK) => void;
  currentRole: string;
}

export const DeathFundKejadianTab: React.FC<DeathFundKejadianTabProps> = ({
  kejadianList,
  pesertaList,
  onReportKejadian,
  onVerifyKejadian,
  onCreateSantunanDraft,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusKejadianDK>('ALL');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<KejadianKematianDK | null>(null);

  const [form, setForm] = useState({
    idPeserta: '',
    namaAlmarhum: '',
    hubungan: 'KEPALA_KELUARGA',
    tanggalMeninggal: new Date().toISOString().slice(0, 10),
    tempatMeninggal: 'Kediaman / Rumah Duka',
    keterangan: 'Telah dikebumikan di TPU Desa Ngijo',
    dokumenSuratKematianUrl: ''
  });

  const canVerify = ['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const filteredList = kejadianList.filter(item => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchAlmarhum = item.namaAlmarhum.toLowerCase().includes(q);
      const matchKK = item.namaKepalaKeluarga.toLowerCase().includes(q);
      const matchId = item.idKejadian.toLowerCase().includes(q);
      if (!matchAlmarhum && !matchKK && !matchId) return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idPeserta || !form.namaAlmarhum.trim()) return;

    onReportKejadian(form);
    setIsReportModalOpen(false);
    setForm({
      idPeserta: '',
      namaAlmarhum: '',
      hubungan: 'KEPALA_KELUARGA',
      tanggalMeninggal: new Date().toISOString().slice(0, 10),
      tempatMeninggal: 'Kediaman / Rumah Duka',
      keterangan: 'Telah dikebumikan di TPU Desa Ngijo',
      dokumenSuratKematianUrl: ''
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-xl">🕯️</span> Catatan Kejadian Kematian & Duka Cita
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan resmi musibah duka warga RT 07 RW 11 GPA Ngijo, verifikasi berjenjang pengurus & Ketua RT, serta rujukan hak santunan.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Laporkan Musibah Duka Baru
        </button>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama almarhum/almarhumah, nama kepala keluarga, atau ID kejadian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="ALL">Semua Status Kejadian ({kejadianList.length})</option>
            <option value="DILAPORKAN">🟡 Status: DILAPORKAN</option>
            <option value="DIVERIFIKASI">🔵 Status: DIVERIFIKASI</option>
            <option value="DIPROSES">🟣 Status: DIPROSES SANTUNAN</option>
            <option value="SELESAI">🟢 Status: SELESAI</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID Kejadian</th>
                <th className="p-3.5">Nama Almarhum / Duka</th>
                <th className="p-3.5">Keluarga Terkait</th>
                <th className="p-3.5">Hubungan</th>
                <th className="p-3.5">Tgl Wafat</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi / Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data kejadian duka cita.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  return (
                    <tr key={item.idKejadian} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        {item.idKejadian}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.namaAlmarhum}</div>
                        <div className="text-[11px] text-slate-500">{item.tempatMeninggal || 'Malang'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{item.namaKepalaKeluarga}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.nomorKKInternal}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.hubungan}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {item.tanggalMeninggal}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'SELESAI'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'DIVERIFIKASI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.status === 'DIPROSES'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetail(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>

                          {canVerify && item.status === 'DILAPORKAN' && (
                            <button
                              onClick={() => onVerifyKejadian(item.idKejadian, 'DIVERIFIKASI')}
                              className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow"
                            >
                              <ShieldCheck className="w-3 h-3" /> Verifikasi
                            </button>
                          )}

                          {canVerify && item.status === 'DIVERIFIKASI' && !item.santunanId && (
                            <button
                              onClick={() => onCreateSantunanDraft(item)}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow"
                            >
                              <HeartHandshake className="w-3 h-3" /> Ajukan Santunan
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

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span>🕯️</span> Detail Musibah Duka Cita ({selectedDetail.idKejadian})
              </h4>
              <button onClick={() => setSelectedDetail(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <div className="text-slate-400 text-[10px]">Nama Almarhum / Duka</div>
                  <div className="text-base font-bold text-slate-800">{selectedDetail.namaAlmarhum}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate-400 text-[10px]">Keluarga Terkait</div>
                    <div className="font-semibold text-slate-800">{selectedDetail.namaKepalaKeluarga}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Hubungan Keluarga</div>
                    <div className="font-semibold text-slate-800">{selectedDetail.hubungan}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate-400 text-[10px]">Tanggal Meninggal</div>
                    <div className="font-semibold text-slate-800">{selectedDetail.tanggalMeninggal}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Tempat Meninggal</div>
                    <div className="font-semibold text-slate-800">{selectedDetail.tempatMeninggal || '-'}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Keterangan / Pemakaman:</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {selectedDetail.keterangan || 'Tidak ada keterangan tambahan.'}
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Status Verifikasi Pengurus & RT
                </div>
                <div className="text-[11px]">Status: <strong>{selectedDetail.status}</strong></div>
                {selectedDetail.verifiedBy && (
                  <div className="text-[11px] text-teal-800">Diverifikasi oleh: <strong>{selectedDetail.verifiedBy}</strong></div>
                )}
                {selectedDetail.santunanId && (
                  <div className="text-[11px] text-rose-700 font-semibold">Terkait Berkas Santunan ID: {selectedDetail.santunanId}</div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAPOR DUKA MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-amber-800 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span>🕯️</span> Laporkan Kejadian Kematian & Duka Cita
              </h4>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Keluarga / KK Peserta *</label>
                <select
                  required
                  value={form.idPeserta}
                  onChange={(e) => setForm({ ...form, idPeserta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">-- Pilih Peserta / Kepala Keluarga --</option>
                  {pesertaList.map(p => (
                    <option key={p.idPeserta} value={p.idPeserta}>
                      {p.namaKepalaKeluarga} ({p.blokRumah} No. {p.nomorRumah}) - {p.idPeserta}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Almarhum / Almarhumah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Alm. Bpk. Hendro Wibowo"
                  value={form.namaAlmarhum}
                  onChange={(e) => setForm({ ...form, namaAlmarhum: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hubungan dalam Keluarga</label>
                  <select
                    value={form.hubungan}
                    onChange={(e) => setForm({ ...form, hubungan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ANAK">Anak</option>
                    <option value="ORANG_TUA">Orang Tua</option>
                    <option value="MERTUA">Mertua</option>
                    <option value="FAMILI_LAIN">Famili Lain</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Meninggal</label>
                  <input
                    type="date"
                    required
                    value={form.tanggalMeninggal}
                    onChange={(e) => setForm({ ...form, tanggalMeninggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tempat Meninggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Rumah Duka / RSUD Saiful Anwar Malang"
                  value={form.tempatMeninggal}
                  onChange={(e) => setForm({ ...form, tempatMeninggal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Lokasi Pemakaman</label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Laporan Duka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
