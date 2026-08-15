/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Pengaturan & Admin Panel Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Database,
  History,
  FileSpreadsheet,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import {
  TataTertibConfig,
  TataTertibAuditLog
} from '../../types/tataTertib';

interface TataTertibPengaturanTabProps {
  config: TataTertibConfig;
  auditLogs: TataTertibAuditLog[];
  currentRole: UserRole | string;
  onSaveConfig: (updatedConfig: Partial<TataTertibConfig>) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
}

export const TataTertibPengaturanTab: React.FC<TataTertibPengaturanTabProps> = ({
  config,
  auditLogs,
  currentRole,
  onSaveConfig,
  onExportBackup,
  onImportBackup
}) => {
  const [formData, setFormData] = useState<TataTertibConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#123B5D]" />
          Pengaturan Modul Tata Tertib & Integrasi Data
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi format penomoran dokumen resmi, kop surat, pejabat pengesahan, dan audit trail log.
        </p>
      </div>

      {/* Config Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Konfigurasi Dokumen & Kop Surat RT 07
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              KOP Judul Utama (Header Kop)
            </label>
            <input
              type="text"
              value={formData.kopHeaderTitle}
              onChange={(e) => setFormData({ ...formData, kopHeaderTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              KOP Sub-Judul (Lokasi Pemukiman)
            </label>
            <input
              type="text"
              value={formData.kopSubTitle}
              onChange={(e) => setFormData({ ...formData, kopSubTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Alamat Lengkap KOP RT
            </label>
            <input
              type="text"
              value={formData.kopLocation}
              onChange={(e) => setFormData({ ...formData, kopLocation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Format Penomoran Surat
            </label>
            <input
              type="text"
              value={formData.documentNumberFormat}
              onChange={(e) => setFormData({ ...formData, documentNumberFormat: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Nama Pejabat Penandatangan
            </label>
            <input
              type="text"
              value={formData.signingOfficialName}
              onChange={(e) => setFormData({ ...formData, signingOfficialName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Jabatan Resmi
            </label>
            <input
              type="text"
              value={formData.signingOfficialTitle}
              onChange={(e) => setFormData({ ...formData, signingOfficialTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {saveSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pengaturan berhasil diperbarui!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-4 py-2 bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi
          </button>
        </div>
      </form>

      {/* Google Sheets & Drive Metadata Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Struktur Sinkronisasi Google Sheets & Google Drive
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-emerald-800">TT_MASTER</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Database 13+ Pasal resmi RT 07 RW 11.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-blue-800">TT_CATEGORY</span>
            <p className="text-[11px] text-slate-500 mt-0.5">12 Kategori standar + custom categories.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-amber-800">TT_VERSION</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Audit log versi dan berita acara perubahan.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-purple-800">TT_APPROVAL</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Catatan pengesahan resmi Ketua RT.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-indigo-800">TT_AUDIT</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Log aktivitas create, update, publish, print.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-mono font-bold text-rose-800">SMART RT/TATA TERTIB/</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Folder Google Drive (DRAFT, AKTIF, PDF).</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#123B5D]" />
          Cadangan & Pemulihan Data Tata Tertib
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportBackup}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300"
          >
            <Download className="w-4 h-4 text-[#123B5D]" />
            Ekspor Backup JSON
          </button>

          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-700" />
            Impor / Restore JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          Audit Trail Log Aktivitas Tata Tertib
        </h4>
        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Waktu</th>
                <th className="p-2.5">Aksi</th>
                <th className="p-2.5">User (Role)</th>
                <th className="p-2.5">Rincian Log</th>
                <th className="p-2.5 text-center">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {auditLogs.slice(0, 50).map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-[#123B5D]">
                    {log.action}
                  </td>
                  <td className="p-2.5">
                    {log.userName} ({log.role})
                  </td>
                  <td className="p-2.5">
                    {log.details}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
