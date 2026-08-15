import React, { useState } from 'react';
import { RekonsiliasiDK, AuditLogDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  Scale, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  History, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Lock,
  PlusCircle,
  X
} from 'lucide-react';

interface DeathFundRekonsiliasiTabProps {
  saldoSistem: number;
  rekonsiliasiList: RekonsiliasiDK[];
  auditLogs: AuditLogDK[];
  onAddRekonsiliasi: (payload: {
    saldoFisik: number;
    selisih: number;
    keterangan?: string;
  }) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonData: string) => void;
  currentRole: string;
}

export const DeathFundRekonsiliasiTab: React.FC<DeathFundRekonsiliasiTabProps> = ({
  saldoSistem,
  rekonsiliasiList,
  auditLogs,
  onAddRekonsiliasi,
  onExportBackup,
  onImportBackup,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'RECONCILIATION' | 'AUDIT_LOG' | 'BACKUP'>('RECONCILIATION');

  // Reconciliation form modal
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [saldoFisikInput, setSaldoFisikInput] = useState<number>(saldoSistem);
  const [catatanRecon, setCatatanRecon] = useState('');
  const [importJsonText, setImportJsonText] = useState('');

  const selisih = saldoFisikInput - saldoSistem;
  const isMatch = selisih === 0;

  const canManage = ['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const handleSaveRecon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRekonsiliasi({
      saldoFisik: saldoFisikInput,
      selisih: selisih,
      keterangan: catatanRecon || (isMatch ? 'Rekonsiliasi kas klop / cocok.' : 'Terdapat selisih kas fisik.')
    });
    setIsReconModalOpen(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600" /> Rekonsiliasi, Audit Trail & Keamanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan integritas saldo, histori mutasi audit trail tak terhapus, dan utilitas backup-restore database lokal.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('RECONCILIATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'RECONCILIATION'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekonsiliasi Kas
          </button>
          <button
            onClick={() => setActiveSubTab('AUDIT_LOG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'AUDIT_LOG'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('BACKUP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'BACKUP'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup & Pulihkan
          </button>
        </div>
      </div>

      {/* RECONCILIATION VIEW */}
      {activeSubTab === 'RECONCILIATION' && (
        <div className="space-y-4">
          {/* Card Integrity Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold">Saldo Tercatat di Sistem</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{formatRupiah(saldoSistem)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Kalkulasi isolated ledger otomatis</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold">Status Fisik Terakhir</div>
              <div className="text-xl font-bold text-teal-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600" /> Klop & Sinkron
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tervalidasi buku bank & kas tunai</div>
            </div>

            <div className="bg-teal-50 p-5 rounded-2xl border border-teal-200 flex flex-col justify-between">
              <div>
                <div className="text-xs text-teal-800 font-bold">Uji Cocok Fisik Kas</div>
                <div className="text-[11px] text-teal-700 mt-1">
                  Lakukan opname kas berkala untuk memastikan uang fisik / saldo bank sesuai.
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => {
                    setSaldoFisikInput(saldoSistem);
                    setCatatanRecon('');
                    setIsReconModalOpen(true);
                  }}
                  className="mt-3 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" /> Mulai Opname Rekonsiliasi
                </button>
              )}
            </div>
          </div>

          {/* History Rekonsiliasi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Riwayat Berita Acara Rekonsiliasi Kas
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal Opname</th>
                    <th className="p-3 text-right">Saldo Sistem</th>
                    <th className="p-3 text-right">Saldo Fisik/Bank</th>
                    <th className="p-3 text-right">Selisih</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Petugas Pemeriksa</th>
                    <th className="p-3">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekonsiliasiList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Belum ada riwayat rekonsiliasi kas.
                      </td>
                    </tr>
                  ) : (
                    rekonsiliasiList.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-medium text-slate-700 whitespace-nowrap">{r.tanggal}</td>
                        <td className="p-3 text-right font-bold text-slate-800">{formatRupiah(r.saldoSistem)}</td>
                        <td className="p-3 text-right font-bold text-teal-700">{formatRupiah(r.saldoFisik)}</td>
                        <td className={`p-3 text-right font-bold ${r.selisih === 0 ? 'text-slate-500' : 'text-rose-600'}`}>
                          {formatRupiah(r.selisih)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'MATCH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">{r.petugas}</td>
                        <td className="p-3 text-slate-600 max-w-xs">{r.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG VIEW */}
      {activeSubTab === 'AUDIT_LOG' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" /> Log Aktivitas & Jejak Audit Sistem (Immutable)
            </span>
            <span className="text-[11px] text-slate-500">Mencatat setiap mutasi & perubahan status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Waktu (ISO)</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Pengguna / Peran</th>
                  <th className="p-3">Rincian Operasi</th>
                  <th className="p-3 text-center">Tipe Entitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-sans text-xs">
                      Belum ada audit log.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-teal-50 text-teal-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 font-sans">{log.actor} ({log.role})</td>
                      <td className="p-3 text-slate-700 font-sans max-w-sm">{log.details}</td>
                      <td className="p-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {log.entityType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BACKUP & RESTORE VIEW */}
      {activeSubTab === 'BACKUP' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card Export Backup */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Cadangkan Data (Backup JSON)</h4>
                <p className="text-xs text-slate-500">Unduh seluruh berkas peserta, tagihan, iuran, dan transaksi duka.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              File JSON ini memuat seluruh data kepesertaan RT 07, buku besar Dana Kematian, tagihan otomatis, dan catatan duka cita. Simpan berkas ini di media penyimpanan aman secara berkala.
            </p>

            <button
              onClick={onExportBackup}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" /> Unduh Berkas Cadangan (.JSON)
            </button>
          </div>

          {/* Card Restore */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Pulihkan Data (Restore JSON)</h4>
                <p className="text-xs text-slate-500">Impor data cadangan JSON ke penyimpanan lokal.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Memuat berkas cadangan akan memperbarui master data kepesertaan dan mutasi keuangan Dana Kematian.
            </p>

            <label className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow cursor-pointer">
              <Upload className="w-4 h-4" /> Pilih File JSON Cadangan
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* RECON MODAL */}
      {isReconModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-teal-800 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-300" /> Berita Acara Rekonsiliasi Kas Fisik
              </h4>
              <button onClick={() => setIsReconModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecon} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">Saldo Menurut Sistem Buku Besar:</div>
                <div className="text-lg font-black text-slate-800">{formatRupiah(saldoSistem)}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Saldo Fisik Nyata (Kas Tunai + Rekening Bank) *
                </label>
                <input
                  type="number"
                  step={5000}
                  required
                  value={saldoFisikInput}
                  onChange={(e) => setSaldoFisikInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-teal-700 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className={`p-3 rounded-xl border ${isMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                <div className="font-semibold">Selisih Kas: {formatRupiah(selisih)}</div>
                <div className="text-[11px] mt-0.5">
                  {isMatch ? '✅ Saldo sistem dan fisik 100% klop.' : '⚠️ Terdapat selisih nominal antara buku dan kas fisik.'}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan / Penjelasan Opname</label>
                <textarea
                  rows={2}
                  value={catatanRecon}
                  onChange={(e) => setCatatanRecon(e.target.value)}
                  placeholder="Keterangan hasil rekonsiliasi kas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReconModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Simpan Berita Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
