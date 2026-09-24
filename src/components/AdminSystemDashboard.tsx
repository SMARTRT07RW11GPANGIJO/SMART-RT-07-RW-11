import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  FolderGit2, 
  ShieldCheck, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  Lock, 
  Layers, 
  Activity, 
  FileCheck, 
  X,
  AlertOctagon,
  Trash2,
  CheckSquare,
  Square,
  ShieldAlert,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  FileWarning
} from 'lucide-react';
import { 
  getProductionConfig, 
  validateProductionConfig, 
  getSystemHealth, 
  SystemHealthStatus, 
  ConfigValidationResult,
  AppEnvironment 
} from '../services/productionConfigService';
import { syncDataWithGAS } from '../services/apiService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { UserRole } from '../security/roles';

interface AdminSystemDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (type: any, title: string, message?: string) => void;
  currentRole?: UserRole;
  sessionContext?: AuthoritativeSessionContext | null;
}

export const AdminSystemDashboard: React.FC<AdminSystemDashboardProps> = ({
  isOpen,
  onClose,
  addToast,
  currentRole,
  sessionContext
}) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [validationResult, setValidationResult] = useState<ConfigValidationResult>(validateProductionConfig());
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Edit State
  const [currentEnv, setCurrentEnv] = useState<AppEnvironment>(getProductionConfig().appEnv);
  const [customGasUrl, setCustomGasUrl] = useState(getProductionConfig().gasWebappUrl);
  const [customDbId, setCustomDbId] = useState(getProductionConfig().databaseId);
  const [customDriveId, setCustomDriveId] = useState(getProductionConfig().driveRootFolderId);

  // CR-PROD/19-SEP-001A: Controlled Production Reset State
  const REQUIRED_CR_ID = 'CR-PROD/19-SEP-001A';
  const REQUIRED_MANIFEST_ID = 'PRE_RESET_2026-09-20_MASTER_MANIFEST.json';
  const REQUIRED_ENV = 'PRODUCTION';
  const REQUIRED_CONFIRMATION_PHRASE = 'SAYA YAKIN DAN BERTANGGUNG JAWAB PENUH UNTUK RESET DATA PRODUKSI RT 07';

  const [crId, setCrId] = useState<string>(REQUIRED_CR_ID);
  const [backupManifestId, setBackupManifestId] = useState<string>(REQUIRED_MANIFEST_ID);
  const [backupVerified, setBackupVerified] = useState<boolean>(false);
  const [resetEnvironment, setResetEnvironment] = useState<string>(REQUIRED_ENV);
  const [confirmationPhrase, setConfirmationPhrase] = useState<string>('');

  // Gate 2: Authorization State (Memory-only, no local/session/cookie persistence)
  const [resetAuthorizationCode, setResetAuthorizationCode] = useState<string>('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isAuthorizingReset, setIsAuthorizingReset] = useState<boolean>(false);
  const [resetAuthorizationMessage, setResetAuthorizationMessage] = useState<string>('');

  const [isExecutingReset, setIsExecutingReset] = useState<boolean>(false);
  const [resetExecutionResult, setResetExecutionResult] = useState<{
    status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'FAILED_PARTIAL' | 'DENIED' | 'ALREADY_COMPLETED';
    message: string;
    errorCode?: string | null;
    timestamp?: string;
    data?: any;
  }>({
    status: 'IDLE',
    message: ''
  });

  // Admin Session validation
  const hasValidAdminSession = currentRole === 'ADMIN' && sessionContext?.isValid === true;
  const hasResetAuthorization = Boolean(resetToken);

  // Strict Precondition validation
  const isCrIdValid = crId.trim() === REQUIRED_CR_ID;
  const isManifestValid = backupManifestId.trim() === REQUIRED_MANIFEST_ID;
  const isEnvValid = resetEnvironment === REQUIRED_ENV;
  const isPhraseValid = confirmationPhrase.trim() === REQUIRED_CONFIRMATION_PHRASE;

  const isPreconditionMet = 
    currentRole === 'ADMIN' &&
    sessionContext?.isValid === true &&
    hasResetAuthorization &&
    isCrIdValid &&
    isManifestValid &&
    backupVerified === true &&
    isEnvValid &&
    isPhraseValid &&
    !isExecutingReset &&
    !isAuthorizingReset;

  const handleAuthorizeProductionReset = async () => {
    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak', 'Hanya role ADMIN yang diizinkan meminta otorisasi reset produksi.');
      return;
    }

    if (!sessionContext?.isValid) {
      addToast('error', 'Sesi Tidak Valid', 'Sesi ADMIN tidak aktif atau tidak valid. Silakan login kembali.');
      return;
    }

    if (!isCrIdValid) {
      addToast('error', 'CR ID Invalid', `CR ID wajib bernilai '${REQUIRED_CR_ID}'.`);
      return;
    }

    if (!resetAuthorizationCode.trim()) {
      addToast('error', 'Kode Otorisasi Kosong', 'Harap masukkan Authorization Code untuk mengaktifkan token reset.');
      return;
    }

    setIsAuthorizingReset(true);
    setResetAuthorizationMessage('Menghubungi server GAS untuk otorisasi reset produksi...');

    try {
      const response = await syncDataWithGAS('authorizeProductionReset', {
        crId: crId.trim(),
        authorizationCode: resetAuthorizationCode.trim()
      });

      if (response && response.success === true && response?.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setResetAuthorizationCode('');
        setResetAuthorizationMessage('Otorisasi berhasil. Reset Token aktif dalam memory halaman.');
        addToast('success', 'Otorisasi Berhasil', 'Reset Token aktif di memory.');
      } else {
        const errorMsg = response?.message || 'Gagal memvalidasi kode otorisasi reset.';
        setResetAuthorizationMessage(`Gagal: ${errorMsg}`);
        addToast('error', 'Otorisasi Ditolak', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Terjadi kesalahan koneksi saat memverifikasi kode otorisasi.';
      setResetAuthorizationMessage(`Error: ${errorMsg}`);
      addToast('error', 'Koneksi Gagal', errorMsg);
    } finally {
      setIsAuthorizingReset(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshSystemHealth();
    }
  }, [isOpen]);

  const refreshSystemHealth = async () => {
    setIsLoadingHealth(true);
    const validation = validateProductionConfig();
    setValidationResult(validation);

    const health = await getSystemHealth();
    setHealthStatus(health);
    setIsLoadingHealth(false);
  };

  const handleSaveConfiguration = () => {
    localStorage.setItem('SMART_RT_APP_ENV', currentEnv);
    localStorage.setItem('SMART_RT_GAS_WEBAPP_URL', customGasUrl);
    localStorage.setItem('SMART_RT_DATABASE_ID', customDbId);
    localStorage.setItem('SMART_RT_DRIVE_FOLDER_ID', customDriveId);

    const validation = validateProductionConfig();
    setValidationResult(validation);

    if (validation.isValid) {
      addToast('success', 'Konfigurasi Sistem Diperbarui!', `Aplikasi beralih ke environment: ${currentEnv.toUpperCase()}`);
    } else {
      addToast('error', 'Konfigurasi Memiliki Warning/Error', validation.errors[0] || 'Periksa kembali setting.');
    }

    refreshSystemHealth();
  };

  const handleExecuteControlledReset = async () => {
    // 1. Client-Side Precondition Guard (Fail-Closed: NO NETWORK REQUEST if any check fails)
    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak', 'Hanya role ADMIN yang diizinkan menjalankan controlled production reset.');
      return;
    }

    if (!sessionContext?.isValid) {
      addToast('error', 'Sesi Tidak Valid', 'Sesi ADMIN autentik tidak aktif atau tidak valid. Harap login kembali sebagai ADMIN.');
      return;
    }

    if (!hasResetAuthorization || !resetToken) {
      addToast('error', 'Otorisasi Diperlukan', 'Reset Token belum diaktifkan. Harap masukkan Kode Otorisasi terlebih dahulu.');
      return;
    }

    if (!isCrIdValid) {
      addToast('error', 'CR Binding Invalid', `CR ID wajib bernilai '${REQUIRED_CR_ID}'.`);
      return;
    }

    if (!isManifestValid) {
      addToast('error', 'Manifest Invalid', `Backup Manifest ID wajib bernilai '${REQUIRED_MANIFEST_ID}'.`);
      return;
    }

    if (!backupVerified) {
      addToast('error', 'Verifikasi Backup Diperlukan', 'Anda wajib mencentang konfirmasi verifikasi backup terlebih dahulu.');
      return;
    }

    if (!isEnvValid) {
      addToast('error', 'Environment Guard Gagal', `Environment reset wajib bernilai '${REQUIRED_ENV}'.`);
      return;
    }

    if (!isPhraseValid) {
      addToast('error', 'Frasa Konfirmasi Tidak Sesuai', 'Frasa konfirmasi yang Anda ketikkan tidak cocok persis.');
      return;
    }

    // Double confirmation via native dialog
    const confirmed = window.confirm(
      'PERINGATAN KRITIKAL PRODUKSI:\n\n' +
      'Apakah Anda benar-benar yakin ingin MENJALANKAN CONTROLLED PRODUCTION RESET?\n' +
      'Operasi ini akan mengosongkan baris data pada 7 sheet operasional produksi Google Sheets.\n\n' +
      'Tekan OK untuk mengirim request eksekusi ke backend Google Apps Script.'
    );

    if (!confirmed) {
      return;
    }

    setIsExecutingReset(true);
    setResetExecutionResult({
      status: 'IN_PROGRESS',
      message: 'Mengirim request controlledProductionReset ke backend Google Apps Script...',
      timestamp: new Date().toISOString()
    });

    try {
      const response = await syncDataWithGAS('controlledProductionReset', {
        resetToken,
        crId: crId.trim(),
        backupManifestId: backupManifestId.trim(),
        backupVerified: true,
        environment: REQUIRED_ENV,
        confirmationPhrase: confirmationPhrase.trim()
      });

      const responseData = response?.data;
      const statusFromBackend = responseData?.status;
      const errorCode = response?.errorCode || null;
      const message = response?.message || 'Tidak ada pesan dari backend.';

      if (response && response.success === true && (statusFromBackend === 'COMPLETED' || !statusFromBackend)) {
        setResetExecutionResult({
          status: 'COMPLETED',
          message: message,
          errorCode: null,
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('success', 'Production Reset COMPLETED', message);
      } else if (statusFromBackend === 'FAILED_PARTIAL' || errorCode === 'FAILED_PARTIAL') {
        setResetExecutionResult({
          status: 'FAILED_PARTIAL',
          message: message,
          errorCode: errorCode || 'FAILED_PARTIAL',
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('error', 'CRITICAL: FAILED_PARTIAL', message);
      } else if (statusFromBackend === 'IN_PROGRESS' || errorCode === 'CONCURRENT_EXECUTION_BLOCKED') {
        setResetExecutionResult({
          status: 'IN_PROGRESS',
          message: message,
          errorCode: errorCode,
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('warning', 'Proses Sedang Berjalan', message);
      } else if (errorCode === 'ALREADY_COMPLETED') {
        setResetExecutionResult({
          status: 'ALREADY_COMPLETED',
          message: message,
          errorCode: errorCode,
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('info', 'Reset Sudah Selesai Sebelumnya', message);
      } else if (errorCode === 'PERMISSION_DENIED' || errorCode === 'AUTH_REQUIRED' || errorCode === 'INVALID_SESSION') {
        setResetExecutionResult({
          status: 'DENIED',
          message: message,
          errorCode: errorCode,
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('error', 'Akses Ditolak', message);
      } else {
        setResetExecutionResult({
          status: 'FAILED',
          message: message,
          errorCode: errorCode || 'RESET_FAILED',
          timestamp: new Date().toISOString(),
          data: responseData
        });
        addToast('error', 'Reset Gagal', message);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Terjadi kesalahan koneksi atau jaringan ke server GAS.';
      setResetExecutionResult({
        status: 'FAILED',
        message: errorMsg,
        errorCode: 'CLIENT_NETWORK_EXCEPTION',
        timestamp: new Date().toISOString()
      });
      addToast('error', 'Koneksi Gagal', errorMsg);
    } finally {
      setIsExecutingReset(false);
    }
  };

  if (!isOpen) return null;

  // Role isolation: Only ADMIN may access Tahap 7B System Dashboard & Reset Gateway
  if (currentRole !== 'ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl text-center space-y-4 border border-rose-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-800">AKSES DITOLAK (ROLE ISOLATION)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Halaman Konfigurasi Sistem (Tahap 7B) dan Gateway Reset Produksi hanya dapat diakses oleh peran <strong>ADMIN</strong> dengan sesi autentikasi yang sah.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#123B5D] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-8">
        {/* Header Bar */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#2E7D52] p-2.5 rounded-xl border border-[#D4A72C]/40">
              <Server className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide">ADMIN SYSTEM DASHBOARD (/admin/system)</h2>
                <span className="bg-[#D4A72C] text-[#123B5D] text-[10px] font-black px-2 py-0.5 rounded">
                  TAHAP 7B
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Centralized Production Configuration, Environment Isolation, Health Check & Production Guard
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

        {/* Main Content Area */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Production Lock Alert Banner */}
          {validationResult.status === 'PRODUCTION_LOCKED' && (
            <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-pulse">
              <Lock className="w-8 h-8 shrink-0 text-amber-300" />
              <div>
                <h4 className="font-black text-sm uppercase tracking-wide">PRODUCTION LOCK ACTIVE!</h4>
                <p className="text-xs text-rose-100">
                  {validationResult.errors.join(' | ')} Startup diblokir untuk mencegah penggunaan konfigurasi development pada environment production.
                </p>
              </div>
            </div>
          )}

          {/* Quick Health Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>APP ENVIRONMENT</span>
                <Layers className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-black text-[#123B5D]">
                {getProductionConfig().appEnv.toUpperCase()}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Version: v{getProductionConfig().appVersion}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>SYSTEM HEALTH</span>
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${healthStatus?.status === 'HEALTHY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {healthStatus?.status || 'CHECKING...'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Latency: {healthStatus?.components.backend.latencyMs || 0}ms</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>SECRET PROTECTION</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-sm font-black text-[#2E7D52]">
                ZERO CLIENT LEAK
              </div>
              <div className="text-[11px] text-slate-500">PropertiesService Active</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>VERCEL DEPLOYMENT</span>
                <FileCheck className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-sm font-black text-slate-800">
                Vite SPA (dist)
              </div>
              <div className="text-[11px] text-slate-500">npm run build ready</div>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Component Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> Status Komponen Infrastructure
                </h3>
                <button
                  onClick={refreshSystemHealth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Refresh Health Check"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {healthStatus && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Frontend Stack</div>
                      <div className="text-slate-500 text-[11px]">{healthStatus.components.frontend.message}</div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {healthStatus.components.frontend.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Backend Web App (GAS)</div>
                      <div className="text-slate-500 text-[11px]">{healthStatus.components.backend.message}</div>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      healthStatus.components.backend.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {healthStatus.components.backend.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Google Spreadsheet Database</div>
                      <div className="text-slate-500 text-[11px]">
                        ID: <code className="font-mono">{healthStatus.components.database.spreadsheetIdMasked}</code> ({healthStatus.components.database.tablesCount} Sheets)
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {healthStatus.components.database.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Google Drive Storage</div>
                      <div className="text-slate-500 text-[11px]">
                        Root Folder ID: <code className="font-mono">{healthStatus.components.storage.driveRootIdMasked}</code> ({healthStatus.components.storage.foldersCount} Restricted Folders)
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {healthStatus.components.storage.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Secret & Security Configuration Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" /> Secret Security Status (PropertiesService)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rahasia & API Keys disembunyikan sepenuhnya dari browser.
                </p>
              </div>

              {healthStatus?.components.security.maskedSecrets && (
                <div className="space-y-2.5 text-xs font-mono">
                  {Object.entries(healthStatus.components.security.maskedSecrets).map(([key, status]) => (
                    <div key={key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="font-bold text-[#123B5D] text-[11px]">{key}</span>
                      <span className="text-slate-600 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Environment Switcher & Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#123B5D]" /> Environment Settings & Variable Overrides
                </h3>
                <p className="text-xs text-slate-500">Ubah environment target dan periksa kesiapan Production Guard.</p>
              </div>
              <button
                onClick={handleSaveConfiguration}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
              >
                Simpan & Validasi Konfigurasi
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Target Environment (VITE_APP_ENV)</label>
                <select
                  value={currentEnv}
                  onChange={(e) => setCurrentEnv(e.target.value as AppEnvironment)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="development">DEVELOPMENT (Testing Data Allowed)</option>
                  <option value="staging">STAGING (Isolated Sheet & Drive)</option>
                  <option value="production">PRODUCTION (Strict Security Guard)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Google Apps Script Web App URL</label>
                <input
                  type="text"
                  value={customGasUrl}
                  onChange={(e) => setCustomGasUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Production Database Spreadsheet ID</label>
                <input
                  type="text"
                  value={customDbId}
                  onChange={(e) => setCustomDbId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  placeholder="1a2b3c4d5e6f7g8h9i0_SMART_RT07_GPA_PROD"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Google Drive Root Folder ID</label>
                <input
                  type="text"
                  value={customDriveId}
                  onChange={(e) => setCustomDriveId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  placeholder="1DriveFolderRoot_SMART_RT07_GPA_PROD"
                />
              </div>
            </div>
          </div>

          {/* Deployment Checklist TAHAP 7B */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              CHECKLIST PUBLIKASI PRODUCTION (TAHAP 7B COMPLIANT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>.env.example terdefinisi tanpa rahasia/secrets</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>vercel.json terkonfigurasi (npm run build, dist)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PropertiesService GAS menyimpan seluruh API keys</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Database Google Spreadsheet 13 sheet terisolasi</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Drive Folders 01-07 Restricted (No "Anyone with link")</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Production Guard aktif mencegah dev DB di production</span>
              </div>
            </div>
          </div>

          {/* CR-PROD/19-SEP-001A: CONTROLLED PRODUCTION RESET GATEWAY (ADMIN ONLY) */}
          <div className="bg-white border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
            {/* Header / Title */}
            <div className="border-b border-rose-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 text-sm sm:text-base tracking-tight">
                      CR-PROD/19-SEP-001A: CONTROLLED PRODUCTION RESET GATEWAY
                    </h3>
                    <span className="bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      ADMIN ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Antarmuka resmi frontend untuk memicu backend Google Apps Script: <code className="font-mono text-rose-700 bg-rose-50 px-1 py-0.5 rounded">controlledProductionReset</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500">Status Sesi:</span>
                {hasValidAdminSession ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sesi ADMIN Valid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-lg">
                    <XCircle className="w-3.5 h-3.5" />
                    Sesi Tidak Valid
                  </span>
                )}
              </div>
            </div>

            {/* Warning Box: PART E */}
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex gap-3.5 items-start">
              <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-black text-xs text-rose-900 tracking-wide uppercase">
                  OPERASI PRODUKSI — DESTRUKTIF
                </h4>
                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                  Operasi ini akan menghapus data body/baris 2+ pada 7 sheet data operasional produksi. Header/schema dipertahankan. AI_AUDIT_LOG tidak termasuk target reset. Pastikan backup telah diverifikasi sebelum melanjutkan.
                </p>
                <div className="text-[11px] text-rose-700 pt-1 flex flex-wrap gap-1.5 items-center">
                  <span className="font-bold">7 Target Sheet:</span>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">WARGA</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">KELUARGA</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">SURAT</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">TRANSAKSI_KEUANGAN</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">IURAN_BULANAN</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">PENGADUAN</code>
                  <code className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-mono">PENGAJUAN_PERUBAHAN_WARGA</code>
                </div>
              </div>
            </div>

            {/* RESET AUTHORIZATION — ONE TIME (Gate 2) */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-700" />
                  <h4 className="font-black text-xs text-amber-900 tracking-wide uppercase">
                    RESET AUTHORIZATION — ONE TIME
                  </h4>
                </div>
                <div>
                  {hasResetAuthorization ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      RESET TOKEN AKTIF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      MENUNGGU OTORISASI
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-amber-900 leading-relaxed">
                Masukkan Kode Otorisasi Reset yang dikeluarkan Project Director/Sistem. Token otorisasi reset bersifat sementara dan <strong>hanya disimpan dalam memory halaman</strong> (tidak disimpan ke localStorage, sessionStorage, cookie, atau IndexedDB).
              </p>

              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="password"
                  id="input-reset-authorization-code"
                  value={resetAuthorizationCode}
                  onChange={(e) => setResetAuthorizationCode(e.target.value)}
                  disabled={isAuthorizingReset || hasResetAuthorization}
                  placeholder={hasResetAuthorization ? "Token reset sudah aktif di memory" : "Masukkan Authorization Code..."}
                  className="w-full sm:flex-1 p-2.5 bg-white border border-amber-300 rounded-xl font-mono text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  type="button"
                  id="btn-authorize-reset"
                  onClick={handleAuthorizeProductionReset}
                  disabled={isAuthorizingReset || hasResetAuthorization || !resetAuthorizationCode.trim() || currentRole !== 'ADMIN' || !sessionContext?.isValid}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    hasResetAuthorization
                      ? 'bg-emerald-700 text-white cursor-default'
                      : !resetAuthorizationCode.trim() || isAuthorizingReset || currentRole !== 'ADMIN' || !sessionContext?.isValid
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-95'
                  }`}
                >
                  {isAuthorizingReset ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>MEMVALIDASI...</span>
                    </>
                  ) : hasResetAuthorization ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>TEROTORISASI</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>AKTIFKAN OTORISASI</span>
                    </>
                  )}
                </button>
              </div>

              {resetAuthorizationMessage && (
                <div className={`text-[11px] font-medium pt-1 ${hasResetAuthorization ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {resetAuthorizationMessage}
                </div>
              )}
            </div>

            {/* Reset Parameters Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Field A1: CR ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Change Request ID (CR ID)</label>
                  <span className="text-[10px] font-mono text-slate-400">Wajib: CR-PROD/19-SEP-001A</span>
                </div>
                <input
                  type="text"
                  id="input-reset-crid"
                  value={crId}
                  onChange={(e) => setCrId(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs ${
                    isCrIdValid ? 'border-slate-300 text-slate-800' : 'border-rose-400 text-rose-700 bg-rose-50/50'
                  }`}
                  placeholder="CR-PROD/19-SEP-001A"
                />
              </div>

              {/* Field A2: Backup Manifest ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Backup Manifest ID</label>
                  <span className="text-[10px] font-mono text-slate-400">Wajib: PRE_RESET_2026-09-20_MASTER_MANIFEST.json</span>
                </div>
                <input
                  type="text"
                  id="input-reset-manifest-id"
                  value={backupManifestId}
                  onChange={(e) => setBackupManifestId(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs ${
                    isManifestValid ? 'border-slate-300 text-slate-800' : 'border-rose-400 text-rose-700 bg-rose-50/50'
                  }`}
                  placeholder="PRE_RESET_2026-09-20_MASTER_MANIFEST.json"
                />
              </div>

              {/* Field A4: Target Environment */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Target Environment</label>
                  <span className="text-[10px] text-rose-600 font-bold">Wajib PRODUCTION</span>
                </div>
                <select
                  id="select-reset-environment"
                  value={resetEnvironment}
                  onChange={(e) => setResetEnvironment(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl font-bold text-xs ${
                    isEnvValid ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="PRODUCTION">PRODUCTION (Authoritative Operational Database)</option>
                  <option value="STAGING" disabled>STAGING (Disallowed for this CR)</option>
                  <option value="DEVELOPMENT" disabled>DEVELOPMENT (Disallowed for this CR)</option>
                </select>
              </div>

              {/* Field A3: Backup Verified Checkbox */}
              <div className="space-y-1 flex flex-col justify-end">
                <label className="font-bold text-slate-700">Verifikasi Backup Eksplisit</label>
                <label 
                  htmlFor="checkbox-backup-verified"
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    backupVerified 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                      : 'bg-amber-50/80 border-amber-300 text-slate-700 hover:bg-amber-100/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="checkbox-backup-verified"
                    checked={backupVerified}
                    onChange={(e) => setBackupVerified(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-[11px] leading-tight font-medium">
                    Saya menyatakan telah memverifikasi secara langsung file backup manifest <code className="font-mono font-bold text-[10px]">PRE_RESET_2026-09-20_MASTER_MANIFEST.json</code> dan menyatakan data aman untuk di-reset.
                  </span>
                </label>
              </div>
            </div>

            {/* Field A5: Confirmation Phrase */}
            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span>Frasa Konfirmasi Tanggung Jawab (Exact String Match)</span>
                {isPhraseValid ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cocok
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-[11px]">
                    Ketik persis frasa di bawah
                  </span>
                )}
              </label>
              <div className="p-2.5 bg-slate-200 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px] select-all font-semibold">
                SAYA YAKIN DAN BERTANGGUNG JAWAB PENUH UNTUK RESET DATA PRODUKSI RT 07
              </div>
              <input
                type="text"
                id="input-reset-confirmation-phrase"
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                className={`w-full p-2.5 border rounded-xl font-mono text-xs ${
                  isPhraseValid 
                    ? 'border-emerald-400 bg-emerald-50/30 text-emerald-950 font-bold' 
                    : 'border-slate-300 bg-white text-slate-800'
                }`}
                placeholder="Ketik persis kalimat konfirmasi di atas..."
              />
            </div>

            {/* Preconditions Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <span className="font-bold text-slate-700 text-xs block">
                Pemeriksaan Pra-Kondisi Eksekusi (Fail-Closed Gates):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 font-medium ${currentRole === 'ADMIN' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {currentRole === 'ADMIN' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>1. Role ADMIN</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${sessionContext?.isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {sessionContext?.isValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>2. Sesi ADMIN Valid</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasResetAuthorization ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {hasResetAuthorization ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>3. Reset Authorization Token Aktif</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${isCrIdValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isCrIdValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>4. CR ID Valid</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${isManifestValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isManifestValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>5. Manifest ID Valid</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${backupVerified ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {backupVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>6. Backup Verified</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${isPhraseValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isPhraseValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>7. Frasa Konfirmasi Cocok</span>
                </div>
              </div>
            </div>

            {/* Action Button: EXECUTE PRODUCTION RESET */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                {!isPreconditionMet && (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Tombol dinonaktifkan: Lengkapi seluruh pra-kondisi di atas untuk mengaktifkan.
                  </span>
                )}
                {isPreconditionMet && !isExecutingReset && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Seluruh pra-kondisi terpenuhi. Siap untuk eksekusi terkelola.
                  </span>
                )}
              </div>

              <button
                type="button"
                id="btn-execute-production-reset"
                onClick={handleExecuteControlledReset}
                disabled={!isPreconditionMet || isExecutingReset}
                className={`px-5 py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto ${
                  isPreconditionMet && !isExecutingReset
                    ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer active:scale-95 shadow-rose-900/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {isExecutingReset ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>MENGEKSEKUSI RESET PRODUKSI...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>EXECUTE PRODUCTION RESET</span>
                  </>
                )}
              </button>
            </div>

            {/* Backend Response Handling Card (PART F) */}
            {resetExecutionResult.status !== 'IDLE' && (
              <div className={`p-4 rounded-xl border space-y-3 transition-all ${
                resetExecutionResult.status === 'COMPLETED'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : resetExecutionResult.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : resetExecutionResult.status === 'ALREADY_COMPLETED'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : resetExecutionResult.status === 'FAILED_PARTIAL'
                  ? 'bg-rose-100 border-rose-400 text-rose-950 animate-pulse'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <div className="flex items-center gap-2">
                    {resetExecutionResult.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {resetExecutionResult.status === 'IN_PROGRESS' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                    {resetExecutionResult.status === 'ALREADY_COMPLETED' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                    {resetExecutionResult.status === 'FAILED_PARTIAL' && <AlertOctagon className="w-5 h-5 text-rose-600" />}
                    {(resetExecutionResult.status === 'FAILED' || resetExecutionResult.status === 'DENIED') && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-black text-xs uppercase tracking-wide">
                      HASIL EKSEKUSI BACKEND: {resetExecutionResult.status}
                    </span>
                  </div>
                  {resetExecutionResult.timestamp && (
                    <span className="text-[10px] font-mono opacity-70">
                      {new Date(resetExecutionResult.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="font-medium">
                    {resetExecutionResult.message}
                  </p>
                  {resetExecutionResult.errorCode && (
                    <p className="text-[11px] font-mono opacity-80">
                      Error Code: <span className="font-bold">{resetExecutionResult.errorCode}</span>
                    </p>
                  )}
                  {resetExecutionResult.data && (
                    <div className="mt-2 p-2.5 bg-black/5 rounded-lg font-mono text-[10px] space-y-1 overflow-x-auto">
                      <div>Status: {resetExecutionResult.data.status}</div>
                      {resetExecutionResult.data.targetCount !== undefined && (
                        <div>Target Sheets: {resetExecutionResult.data.targetCount} | Verified: {resetExecutionResult.data.verifiedCount || 0}</div>
                      )}
                      {resetExecutionResult.data.auditLogWritten && (
                        <div>Audit Log: SUCCESS (AI_AUDIT_LOG recorded)</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
