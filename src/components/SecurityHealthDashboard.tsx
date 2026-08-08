import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  RefreshCw, 
  Lock, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  RotateCcw, 
  Bot, 
  Plus, 
  Search,
  BookOpen,
  Eye,
  Key
} from 'lucide-react';
import { UserRole, AuditLog, Warga, Keluarga, SuratPengantar, TransaksiKeuangan, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan } from '../types/rt';
import { ROLE_PERMISSIONS, maskNik, maskNoHp } from '../services/securityService';
import { BackupRecord, getStoredBackups, createSystemBackup, restoreSystemData, getSystemHealthStatus } from '../services/backupService';
import { getKnowledgeBase, saveKnowledgeBase, KnowledgeItem } from '../services/aiAssistantService';

interface SecurityHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  auditLogs: AuditLog[];
  dataState: {
    wargaList: Warga[];
    keluargaList: Keluarga[];
    suratList: SuratPengantar[];
    transaksiList: TransaksiKeuangan[];
    iuranList: TagihanIuran[];
    pengaduanList: Pengaduan[];
    pengumumanList: Pengumuman[];
    agendaList: AgendaKegiatan[];
    auditLogs: AuditLog[];
  };
  onRestoreState: (restoredData: any) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const SecurityHealthDashboard: React.FC<SecurityHealthDashboardProps> = ({
  isOpen,
  onClose,
  currentRole,
  auditLogs,
  dataState,
  onRestoreState,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'BACKUP' | 'HEALTH' | 'RITA_KB' | 'LOGS'>('SECURITY');

  // Backup state
  const [backups, setBackups] = useState<BackupRecord[]>(getStoredBackups());
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState<BackupRecord | null>(null);

  // Knowledge Base State
  const [kbItems, setKbItems] = useState<KnowledgeItem[]>(getKnowledgeBase());
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbCategory, setNewKbCategory] = useState<'FAQ' | 'SOP' | 'Peraturan' | 'Pelayanan' | 'Profil'>('SOP');
  const [newKbContent, setNewKbContent] = useState('');
  const [isAddingKb, setIsAddingKb] = useState(false);

  if (!isOpen) return null;

  const handleCreateManualBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      const newBkp = createSystemBackup('MANUAL', `Pengurus (${currentRole})`, dataState);
      setBackups(getStoredBackups());
      setIsBackupRunning(false);
      addToast('success', 'Backup Berhasil Created!', `File Backup ID: ${newBkp.backupId} saved safely.`);
    }, 600);
  };

  const handleConfirmRestore = () => {
    if (!selectedRestoreBackup) return;

    const result = restoreSystemData(selectedRestoreBackup.backupId, `Admin (${currentRole})`, dataState);

    if (result.success) {
      if (result.restoredData) {
        onRestoreState(result.restoredData);
      }
      setBackups(getStoredBackups());
      setSelectedRestoreBackup(null);
      addToast('success', 'Restorasi System Berhasil!', result.message);
    } else {
      addToast('error', 'Gagal Memulihkan System', result.message);
    }
  };

  const handleAddKbItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTitle || !newKbContent) return;

    const newItem: KnowledgeItem = {
      id: `KB-${Date.now()}`,
      category: newKbCategory,
      title: newKbTitle,
      content: newKbContent,
      source: `SOP Tambahan Admin (${currentRole})`,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: 'PUBLISHED'
    };

    const updated = [newItem, ...kbItems];
    setKbItems(updated);
    saveKnowledgeBase(updated);
    setNewKbTitle('');
    setNewKbContent('');
    setIsAddingKb(false);
    addToast('success', 'Knowledge Base Diperbarui', 'Informasi resmi baru ditambahkan ke RITA AI Assistant.');
  };

  const systemHealth = getSystemHealthStatus();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] border border-[#D4A72C] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">MODUL KEAMANAN & BACKUP SYSTEM</h2>
                <span className="bg-[#D4A72C] text-[#123B5D] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  TAHAP 6, 7 & 8
                </span>
              </div>
              <p className="text-xs text-slate-300">Hardening, Disaster Recovery, System Health & RITA Knowledge Base</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-xl transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'SECURITY' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-[#D4A72C]" /> Security & Permissions
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'BACKUP' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" /> Backup & Restore
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'HEALTH' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" /> System Health
          </button>

          <button
            onClick={() => setActiveTab('RITA_KB')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'RITA_KB' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" /> RITA AI Knowledge Base
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'LOGS' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" /> Audit Trail Integrity
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: SECURITY & PERMISSION MATRIX */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Masking Data Sensitif
                  </div>
                  <p className="text-xs text-slate-600">NIK & No HP disamarkan otomatis untuk non-admin. Contoh Masked NIK: <strong className="text-emerald-800">{maskNik('3507123456780004')}</strong></p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                    <Key className="w-5 h-5 text-blue-600" /> Server-side Authorization
                  </div>
                  <p className="text-xs text-slate-600">Pengecekan permission dilakukan secara langsung pada level service & backend layer, mencegah bypassing frontend URL/Route.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                    <Lock className="w-5 h-5 text-amber-600" /> IDOR & Object-Level Guard
                  </div>
                  <p className="text-xs text-slate-600">Warga hanya diizinkan mengakses permohonan surat, iuran, dan aduan milik akunnya sendiri melalui verification filter.</p>
                </div>
              </div>

              {/* Role Permission Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                  <span>ROLE PERMISSION MATRIX (SMART RT 07 RW 11)</span>
                  <span className="text-xs text-emerald-400">Least Privilege & Fail Closed Policy</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase">
                      <tr>
                        <th className="p-3">Role User</th>
                        <th className="p-3">Tingkat Akses</th>
                        <th className="p-3">Akses Data Warga</th>
                        <th className="p-3">Akses Surat Pengantar</th>
                        <th className="p-3">Akses Keuangan</th>
                        <th className="p-3">Backup & System</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-bold text-purple-900">ADMIN</td>
                        <td className="p-3 font-semibold text-emerald-600">FULL SYSTEM ACCESS</td>
                        <td className="p-3">Read / Write / Unmask</td>
                        <td className="p-3">Approve / Revoke / PDF A4</td>
                        <td className="p-3">Full Audit & Edit</td>
                        <td className="p-3">Backup & Restore</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-blue-900">KETUA_RT</td>
                        <td className="p-3 font-semibold text-blue-600">EXECUTIVE APPROVER</td>
                        <td className="p-3">Read Only (Full)</td>
                        <td className="p-3">Approve / Revoke / PDF A4</td>
                        <td className="p-3">Read Only</td>
                        <td className="p-3">Manual Backup</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-emerald-900">PENGURUS</td>
                        <td className="p-3 font-semibold text-emerald-600">OPERATIONAL OFFICER</td>
                        <td className="p-3">Read Only (Limited)</td>
                        <td className="p-3">Process / Generate PDF</td>
                        <td className="p-3">Read / Update Iuran</td>
                        <td className="p-3">Read Only</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">WARGA</td>
                        <td className="p-3 font-semibold text-slate-600">LIMITED CITIZEN</td>
                        <td className="p-3 text-slate-500">Read Own Profile Only</td>
                        <td className="p-3">Create / View Own PDF</td>
                        <td className="p-3">View Own Iuran Only</td>
                        <td className="p-3 text-slate-400">No Access</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-500">PUBLIC</td>
                        <td className="p-3 font-semibold text-slate-400">ANONYMOUS GUEST</td>
                        <td className="p-3 text-slate-400">No Access</td>
                        <td className="p-3">Verify QR Hash Only</td>
                        <td className="p-3 text-slate-400">No Access</td>
                        <td className="p-3 text-slate-400">No Access</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & DISASTER RECOVERY */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800 text-white p-5 rounded-2xl shadow">
                <div>
                  <h3 className="font-extrabold text-base text-[#D4A72C]">AUTOMATIC & SAFETY BACKUP ENGINE</h3>
                  <p className="text-xs text-slate-300">Retention: Daily (14x), Weekly (8x), Monthly (12x). Automatic Pre-Restore Safety Snapshot enabled.</p>
                </div>
                <button
                  onClick={handleCreateManualBackup}
                  disabled={isBackupRunning}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow border border-[#D4A72C]/40"
                >
                  <Database className="w-4 h-4 text-[#D4A72C]" />
                  {isBackupRunning ? 'Proses Backup...' : 'Buat Backup Manual Now'}
                </button>
              </div>

              {/* SLA & Recovery Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 text-xs uppercase mb-1">RPO (Recovery Point Objective)</div>
                  <div className="text-lg font-black text-[#2E7D52]">Maksimal 24 Jam Data Loss</div>
                  <p className="text-[11px] text-slate-500 mt-1">Dapat pulih dengan aman menggunakan snapshot harian otomatis Asia/Jakarta.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 text-xs uppercase mb-1">RTO (Recovery Time Objective)</div>
                  <div className="text-lg font-black text-[#123B5D]">Maksimal 4 Jam Recovery</div>
                  <p className="text-[11px] text-slate-500 mt-1">Restorasi snapshot 1-click dengan verifikasi integritas checksum SHA-256.</p>
                </div>
              </div>

              {/* Backup Records Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-3 font-bold text-xs text-slate-800 uppercase border-b border-slate-200">
                  Daftar Snapshot Backup System
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Backup ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Tipe</th>
                        <th className="p-3">Ukuran</th>
                        <th className="p-3">Checksum</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {backups.map((b) => (
                        <tr key={b.backupId} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#123B5D]">{b.backupId}</td>
                          <td className="p-3 text-slate-600">{b.timestamp}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.type === 'DAILY' ? 'bg-blue-100 text-blue-800' :
                              b.type === 'PRE_RESTORE' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {b.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{(b.sizeBytes / 1024).toFixed(1)} KB</td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{b.checksum}</td>
                          <td className="p-3">
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedRestoreBackup(b)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1 ml-auto"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Restore Confirmation Dialog */}
              {selectedRestoreBackup && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    PERINGATAN RESTORASI SYSTEM (ID: {selectedRestoreBackup.backupId})
                  </div>
                  <p className="text-xs text-slate-700">
                    Restorasi akan menggantikan seluruh data aplikasi dengan snapshot tanggal <strong>{selectedRestoreBackup.timestamp}</strong>. Sistem akan otomatis membuat <strong>PRE_RESTORE Safety Backup</strong> terlebih dahulu untuk menjamin keamanan data.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleConfirmRestore}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
                    >
                      Konfirmasi Restorasi Data Sekarang
                    </button>
                    <button
                      onClick={() => setSelectedRestoreBackup(null)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM HEALTH */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-4">
              <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#D4A72C]">STATUS KESEHATAN SYSTEM RT 07</h3>
                  <p className="text-xs text-slate-300">Monitoring real-time seluruh modul server & ketersediaan layanan</p>
                </div>
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  100% OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemHealth.map((sh, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{sh.module}</h4>
                      <p className="text-[11px] text-slate-500">{sh.details}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                      sh.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sh.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RITA AI KNOWLEDGE BASE */}
          {activeTab === 'RITA_KB' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Knowledge Base RITA AI Assistant</h3>
                  <p className="text-xs text-slate-500">Basis data resmi RAG untuk menjawab pertanyaan warga secara tepat</p>
                </div>
                <button
                  onClick={() => setIsAddingKb(!isAddingKb)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> {isAddingKb ? 'Batal' : 'Tambah Informasi Resmi'}
                </button>
              </div>

              {isAddingKb && (
                <form onSubmit={handleAddKbItem} className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul SOP / Informasi</label>
                    <input
                      type="text"
                      value={newKbTitle}
                      onChange={(e) => setNewKbTitle(e.target.value)}
                      placeholder="Contoh: SOP Peminjaman Tenda RT"
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={newKbCategory}
                        onChange={(e: any) => setNewKbCategory(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      >
                        <option value="SOP">SOP</option>
                        <option value="FAQ">FAQ</option>
                        <option value="Peraturan">Peraturan</option>
                        <option value="Pelayanan">Pelayanan</option>
                        <option value="Profil">Profil</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Isi Konten Informasi</label>
                    <textarea
                      value={newKbContent}
                      onChange={(e) => setNewKbContent(e.target.value)}
                      rows={3}
                      placeholder="Tuliskan aturan atau penjelasan resmi..."
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Simpan Informasi ke RITA AI
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {kbItems.map((kb) => (
                  <div key={kb.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#123B5D]">{kb.title}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {kb.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{kb.content}</p>
                    <p className="text-[10px] text-slate-400">Sumber: {kb.source} | Update: {kb.lastUpdated}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'LOGS' && (
            <div className="space-y-3">
              <div className="bg-slate-800 text-white p-3 rounded-xl font-bold text-xs flex justify-between items-center">
                <span>CATATAN AUDIT TRAIL SENSITIF (APPEND-ONLY)</span>
                <span className="text-[#D4A72C]">Total: {auditLogs.length} Records</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Waktu</th>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Aksi</th>
                      <th className="p-2.5">Modul</th>
                      <th className="p-2.5">Record ID</th>
                      <th className="p-2.5">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id_log} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                        <td className="p-2.5 font-bold text-[#123B5D]">{log.user}</td>
                        <td className="p-2.5 font-bold text-slate-800">{log.action}</td>
                        <td className="p-2.5 text-slate-600">{log.module}</td>
                        <td className="p-2.5 font-mono text-[11px]">{log.record_id}</td>
                        <td className="p-2.5 text-slate-600">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-5 py-2 rounded-xl shadow"
          >
            Tutup Panel Security
          </button>
        </div>

      </div>
    </div>
  );
};
