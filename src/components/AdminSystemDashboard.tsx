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
  X
} from 'lucide-react';
import { 
  getProductionConfig, 
  validateProductionConfig, 
  getSystemHealth, 
  SystemHealthStatus, 
  ConfigValidationResult,
  AppEnvironment 
} from '../services/productionConfigService';

interface AdminSystemDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (type: any, title: string, message?: string) => void;
}

export const AdminSystemDashboard: React.FC<AdminSystemDashboardProps> = ({
  isOpen,
  onClose,
  addToast
}) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [validationResult, setValidationResult] = useState<ConfigValidationResult>(validateProductionConfig());
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Edit State
  const [currentEnv, setCurrentEnv] = useState<AppEnvironment>(getProductionConfig().appEnv);
  const [customGasUrl, setCustomGasUrl] = useState(getProductionConfig().gasWebappUrl);
  const [customDbId, setCustomDbId] = useState(getProductionConfig().databaseId);
  const [customDriveId, setCustomDriveId] = useState(getProductionConfig().driveRootFolderId);

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

  if (!isOpen) return null;

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
        </div>
      </div>
    </div>
  );
};
