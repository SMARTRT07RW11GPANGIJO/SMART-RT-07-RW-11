import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  UserCheck, 
  Key, 
  FileCheck, 
  FileSpreadsheet, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Trash2, 
  X,
  Layers,
  Database,
  Terminal,
  ShieldAlert,
  User,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { UserRole } from '../types/rt';
import { 
  AIPermission, 
  RolePermissionConfig, 
  AIToolDefinition, 
  AIAuditEntry, 
  DataClassificationRule 
} from '../types/aiPermissions';
import { 
  ROLE_PERMISSIONS, 
  AI_TOOLS_CATALOG, 
  DATA_CLASSIFICATION_RULES, 
  getAIAuditLogs, 
  logAIAuditEntry 
} from '../services/aiAuthorizationService';

interface AdminAIPermissionsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  addToast: (type: any, title: string, message?: string) => void;
}

export const AdminAIPermissionsDashboard: React.FC<AdminAIPermissionsDashboardProps> = ({
  isOpen,
  onClose,
  currentRole,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'TOOLS' | 'CLASSIFICATION' | 'AUDIT_LOG' | 'SECURITY'>('MATRIX');
  const [auditLogs, setAuditLogs] = useState<AIAuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'SUCCESS' | 'DENIED' | 'ERROR'>('ALL');

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  const refreshLogs = () => {
    const logs = getAIAuditLogs();
    setAuditLogs(logs);
  };

  const handleTestDeniedCall = () => {
    // Simulate a denied AI call attempt
    logAIAuditEntry({
      userId: 'WARGA_DEMO_01',
      role: 'WARGA',
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: 'createBackup',
      tool: 'createBackup',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'Akses Ditolak: Role WARGA tidak memiliki hak akses BACKUP_CREATE.'
    });

    addToast('warning', 'Akses Ditolak Dicatat', 'Simulasi panggilan AI tanpa izin berhasil diblokir & dicatat di AI_AUDIT_LOG.');
    refreshLogs();
  };

  const handleTestInvalidSession = () => {
    // Simulate invalid authentication session
    logAIAuditEntry({
      userId: 'UNAUTHENTICATED',
      role: 'PUBLIC',
      sessionId: `EXPIRED_SESSION`,
      action: 'getMyProfile',
      tool: 'validateAIAuthContext',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'Maaf, sesi Anda sudah tidak valid. Silakan login kembali.'
    });

    addToast('error', 'Authentication Error Simulated', 'Maaf, sesi Anda sudah tidak valid. Silakan login kembali.');
    refreshLogs();
  };

  const handleClearLogs = () => {
    localStorage.removeItem('SMART_RT_AI_AUDIT_LOG_V1');
    refreshLogs();
    addToast('info', 'AI Audit Log Direset', 'Seluruh riwayat AI audit log telah dibersihkan.');
  };

  if (!isOpen) return null;

  const ALL_PERMISSIONS_LIST: AIPermission[] = [
    'PUBLIC_READ',
    'PROFILE_SELF',
    'RESIDENT_READ',
    'RESIDENT_MANAGE',
    'LETTER_CREATE',
    'LETTER_READ_SELF',
    'LETTER_READ_ALL',
    'LETTER_VERIFY',
    'LETTER_APPROVE',
    'LETTER_DELETE',
    'PDF_GENERATE',
    'QR_VERIFY',
    'PAYMENT_READ_SELF',
    'FINANCE_READ',
    'FINANCE_MANAGE',
    'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF',
    'COMPLAINT_MANAGE',
    'ANNOUNCEMENT_CREATE',
    'ANNOUNCEMENT_PUBLISH',
    'AUDIT_READ',
    'BACKUP_CREATE',
    'BACKUP_RESTORE',
    'AI_CHAT',
    'AI_ADMIN_TOOLS'
  ];

  const ROLES_LIST: UserRole[] = ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'];

  const filteredLogs = auditLogs
    .filter(l => resultFilter === 'ALL' || l.result === resultFilter)
    .filter(l => 
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tool.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-100 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-6">
        {/* Header Bar */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#2E7D52] p-2.5 rounded-xl border border-[#D4A72C]/40">
              <ShieldCheck className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide">AI ARCHITECTURE & PERMISSION MATRIX</h2>
                <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> ZERO TRUST ENFORCED
                </span>
              </div>
              <p className="text-xs text-slate-300">
                /admin/ai-permissions — Authorization, Data Sanitization, Tool Catalogs & AI Audit Log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Header Navigation Tabs */}
        <div className="bg-slate-200 border-b border-slate-300 px-6 pt-3 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'MATRIX' 
                ? 'bg-white border-slate-300 text-[#123B5D] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/60 border-transparent'
            }`}
          >
            Role & Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'TOOLS' 
                ? 'bg-white border-slate-300 text-[#123B5D] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/60 border-transparent'
            }`}
          >
            AI Tool Catalog ({AI_TOOLS_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveTab('CLASSIFICATION')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'CLASSIFICATION' 
                ? 'bg-white border-slate-300 text-[#123B5D] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/60 border-transparent'
            }`}
          >
            Data Sanitization Rules
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'AUDIT_LOG' 
                ? 'bg-white border-slate-300 text-[#123B5D] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/60 border-transparent'
            }`}
          >
            AI_AUDIT_LOG ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x ${
              activeTab === 'SECURITY' 
                ? 'bg-white border-slate-300 text-[#123B5D] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/60 border-transparent'
            }`}
          >
            Security Architecture Docs
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: ROLE PERMISSION MATRIX */}
          {activeTab === 'MATRIX' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Role vs AIPermission Enforcement Matrix</h3>
                  <p className="text-xs text-slate-500">Matriks kebijakan Default-Deny. AI Tool hanya dapat dieksekusi jika role memiliki persetujuan eksplisit.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                  <span className="bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Denied (Default)
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#123B5D] text-white font-bold">
                    <tr>
                      <th className="p-3 w-1/4">AI Permission Key</th>
                      {ROLES_LIST.map(role => (
                        <th key={role} className="p-3 text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {ALL_PERMISSIONS_LIST.map((perm) => (
                      <tr key={perm} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 font-sans">{perm}</td>
                        {ROLES_LIST.map(role => {
                          const isAllowed = ROLE_PERMISSIONS[role].includes(perm);
                          return (
                            <td key={role} className="p-3 text-center">
                              {isAllowed ? (
                                <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center bg-slate-100 text-slate-300 w-6 h-6 rounded-full">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: AI TOOLS CATALOG */}
          {activeTab === 'TOOLS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm">AI Tool Catalog & Access Controls</h3>
                <p className="text-xs text-slate-500">Daftar fungsi terdaftar (Tools) yang diizinkan untuk dipanggil oleh AI Agent dengan mitigasi Human-in-the-Loop.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_TOOLS_CATALOG.map((tool) => (
                  <div key={tool.toolName} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <div className="font-mono font-bold text-[#123B5D] text-sm">{tool.toolName}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          Req Permission: <span className="text-slate-800 font-mono">{tool.requiredPermission}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                        tool.dataClassificationLevel === 'RESTRICTED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        tool.dataClassificationLevel === 'CONFIDENTIAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {tool.dataClassificationLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">{tool.description}</p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-600">Allowed Roles:</span>
                        <div className="flex gap-1">
                          {tool.allowedRoles.map(r => (
                            <span key={r} className="bg-slate-100 border text-slate-700 font-mono text-[9px] px-1.5 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      {tool.requiresHumanConfirmation ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-700" /> Human Confirmation Req
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded">
                          Auto-Execute
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DATA SANITIZATION */}
          {activeTab === 'CLASSIFICATION' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm">Data Classification & AI Sanitization Rules (`sanitizeDataForAI`)</h3>
                <p className="text-xs text-slate-500">Kebijakan pencegahan kebocoran data sensitif warga (PII / Secrets) sebelum diproses oleh model AI.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3">AI Sanitization Action</th>
                      <th className="p-3">Example Raw Input</th>
                      <th className="p-3">Sanitized AI Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {DATA_CLASSIFICATION_RULES.map((rule) => (
                      <tr key={rule.field} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#123B5D] font-sans">{rule.field}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rule.classification === 'RESTRICTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rule.classification}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-purple-800">{rule.aiPolicy}</td>
                        <td className="p-3 text-slate-400 line-through">{rule.exampleInput}</td>
                        <td className="p-3 text-emerald-700 font-bold">{rule.sanitizedOutput}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REAL-TIME AI AUDIT LOG */}
          {activeTab === 'AUDIT_LOG' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">AI_AUDIT_LOG Tracker</h3>
                  <p className="text-xs text-slate-500">Log audit real-time pemanggilan AI tool, status otorisasi, dan alasan penolakan.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTestDeniedCall}
                    className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Test Denied Call
                  </button>
                  <button
                    onClick={handleTestInvalidSession}
                    className="bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" /> Test Expired Session
                  </button>
                  <button
                    onClick={handleClearLogs}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Audit Log..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-slate-300 rounded-lg p-1.5 font-medium text-xs w-48"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-600">Result:</span>
                  <select
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value as any)}
                    className="border border-slate-300 rounded-lg p-1.5 font-bold"
                  >
                    <option value="ALL">Semua Result</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="DENIED">DENIED</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User & Role</th>
                      <th className="p-3">Tool & Action</th>
                      <th className="p-3">Result</th>
                      <th className="p-3">Decision & Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#123B5D]">{log.id}</td>
                          <td className="p-3 text-slate-500 text-[10px]">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                          <td className="p-3">
                            <span className="font-bold font-sans text-slate-800">{log.userId}</span>
                            <span className="ml-1 text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded border">
                              {log.role}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-700">{log.tool}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs space-y-0.5">
                            <div className="font-bold text-slate-800 font-sans">{log.decision}</div>
                            {log.deniedReason && (
                              <div className="text-[10px] text-rose-600">{log.deniedReason}</div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Belum ada catatan log audit AI.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY DOCS */}
          {activeTab === 'SECURITY' && (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D52]" />
                Arsitektur Keamanan AI SMART RT 07 RW 11 GPA NGIJO
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#123B5D]">1. Zero Direct Database Access</h4>
                  <p className="text-slate-600 leading-relaxed">
                    AI Agent tidak memiliki koneksi langsung ke Google Sheets atau Google Drive. Seluruh permintaan query dialihkan secara ketat melalui <code>aiDataAccessService.ts</code> dan <code>DataAccess.gs</code> di backend.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#123B5D]">2. Human-in-the-Loop Confirmation</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Setiap tindakan mutasi (pembuatan pengaduan, pengajuan surat, penerbitan pengumuman) memerlukan konfirmasi eksplisit dari pengguna di UI sebelum backend mengeksekusi aksi.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#123B5D]">3. Sanitasi PII Otomatis</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Fungsi <code>sanitizeDataForAI()</code> mengaburkan NIK, No KK, dan No HP, serta menghapus secret/token sebelum payload dikirimkan ke AI model.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#123B5D]">4. Comprehensive Audit Logging</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Setiap percobaan panggilan AI Tool (baik berhasil, ditolak, atau error) dicatat secara terpisah di lembar <code>AI_AUDIT_LOG</code> untuk keperluan akuntabilitas.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                  <h4 className="font-bold text-[#123B5D]">5. Strict AI Authentication & Identity Verification</h4>
                  <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                    • AI tidak boleh menentukan atau mempercayai identitas pengguna dari pesan, melainkan dari backend Auth context.<br/>
                    • AI wajib menolak request jika session tidak valid, expired, revoked, atau akun tidak aktif dengan pesan: <i>"Maaf, sesi Anda sudah tidak valid. Silakan login kembali."</i><br/>
                    • AI dilarang meminta password, API key, atau session secret.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
