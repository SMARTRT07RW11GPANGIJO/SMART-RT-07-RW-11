/**
 * GoogleSheetsSyncModal.tsx
 * SMART RT 07 RW 11 GPA NGIJO
 * GOOGLE SHEETS & GOOGLE DRIVE INTEGRATION MODAL
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Plus,
  Search,
  UploadCloud,
  DownloadCloud,
  Layers,
  AlertTriangle,
  FolderOpen,
  X,
  FileText,
  DollarSign,
  Users,
  ShieldCheck,
  Check,
  Eye,
  LogOut,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCurrentFirebaseUser,
  getAccessToken
} from '../services/googleAuthService';
import {
  GoogleSheetsService,
  DriveSpreadsheetFile,
  SpreadsheetMetadata,
  SyncResult,
  WargaImportPreview,
  DEFAULT_TABS
} from '../services/googleSheetsService';
import { Warga, SuratPengantar, UserRole } from '../types/rt';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  wargaList: Warga[];
  suratList: SuratPengantar[];
  onUpdateWargaList?: (newWarga: Warga[]) => void;
  currentRole: UserRole;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  wargaList,
  suratList,
  onUpdateWargaList,
  currentRole,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'spreadsheets' | 'viewer' | 'import' | 'settings'>('sync');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active spreadsheet state
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string | null>(GoogleSheetsService.getActiveSpreadsheetId());
  const [activeMetadata, setActiveMetadata] = useState<SpreadsheetMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Drive file browser state
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSheetInput, setCustomSheetInput] = useState('');

  // Sync state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingModule, setSyncingModule] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncResult[]>([]);

  // Live Sheet Viewer state
  const [selectedViewerTab, setSelectedViewerTab] = useState<string>('Data_Warga');
  const [liveSheetRows, setLiveSheetRows] = useState<any[][]>([]);
  const [isLoadingViewer, setIsLoadingViewer] = useState(false);

  // Import state
  const [importTabName, setImportTabName] = useState<string>('Data_Warga');
  const [importPreview, setImportPreview] = useState<WargaImportPreview | null>(null);
  const [isAnalyzingImport, setIsAnalyzingImport] = useState(false);
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [showConfirmImportModal, setShowConfirmImportModal] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setHasToken(!!token);
      },
      () => {
        setUser(getCurrentFirebaseUser());
        getAccessToken().then(token => setHasToken(!!token));
      }
    );

    // Initial check
    getAccessToken().then(token => {
      setHasToken(!!token);
      setUser(getCurrentFirebaseUser());
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Load metadata when activeSpreadsheetId changes
  useEffect(() => {
    if (activeSpreadsheetId && hasToken) {
      loadSpreadsheetMetadata(activeSpreadsheetId);
    }
  }, [activeSpreadsheetId, hasToken]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        addToast('success', 'Google Workspace Terhubung', `Berhasil masuk sebagai ${result.user.displayName || result.user.email}`);
        
        // Auto fetch drive files
        fetchDriveSpreadsheets();
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      addToast('error', 'Gagal Terhubung ke Google', err.message || 'Terjadi kesalahan saat otentikasi Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setHasToken(false);
      addToast('info', 'Google Disconnect', 'Sesi Google Workspace berhasil diakhiri.');
    } catch (err: any) {
      addToast('error', 'Error Logout', err.message);
    }
  };

  const loadSpreadsheetMetadata = async (sheetId: string) => {
    setIsLoadingMeta(true);
    try {
      const meta = await GoogleSheetsService.getSpreadsheetMetadata(sheetId);
      setActiveMetadata(meta);
      GoogleSheetsService.setActiveSpreadsheet(meta.spreadsheetId, meta.title);
      setActiveSpreadsheetId(meta.spreadsheetId);
    } catch (err: any) {
      console.error('Failed to load spreadsheet meta:', err);
      addToast('error', 'Gagal Membaca Metadata Sheet', err.message);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const fetchDriveSpreadsheets = async () => {
    if (!hasToken) return;
    setIsLoadingFiles(true);
    try {
      const files = await GoogleSheetsService.listSpreadsheets();
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      addToast('error', 'Gagal Mengambil File Google Drive', err.message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNewMasterSheet = async () => {
    setIsLoadingMeta(true);
    try {
      addToast('loading', 'Membuat Google Sheet...', 'Mempersiapkan master spreadsheet RT 07 di Google Drive');
      const newSheet = await GoogleSheetsService.createMasterSpreadsheet();
      setActiveSpreadsheetId(newSheet.spreadsheetId);
      setActiveMetadata(newSheet);
      addToast('success', 'Spreadsheet Baru Dibuat!', `Master sheet "${newSheet.title}" siap digunakan.`);
      
      // Refresh drive list
      fetchDriveSpreadsheets();
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      addToast('error', 'Gagal Membuat Spreadsheet', err.message);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleConnectCustomSheet = () => {
    if (!customSheetInput.trim()) return;
    
    // Extract ID if full URL pasted
    let id = customSheetInput.trim();
    const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }

    setActiveSpreadsheetId(id);
    loadSpreadsheetMetadata(id);
    setCustomSheetInput('');
    addToast('info', 'Menghubungkan Spreadsheet', `Memuat Google Sheet ID: ${id}`);
  };

  // Sync Operations
  const handleSyncAll = async () => {
    if (!activeSpreadsheetId) {
      addToast('error', 'Pilih Spreadsheet', 'Silakan pilih atau buat Google Spreadsheet terlebih dahulu.');
      return;
    }

    setIsSyncingAll(true);
    addToast('loading', 'Sinkronisasi Dimulai', 'Mengunggah semua data RT 07 ke Google Sheets...');

    try {
      const { results, totalWritten } = await GoogleSheetsService.syncAllMasterData(
        activeSpreadsheetId,
        wargaList,
        suratList
      );
      
      setSyncHistory(prev => [...results, ...prev]);
      addToast('success', 'Sinkronisasi Selesai!', `Berhasil memperbarui 5 tab dengan total ${totalWritten} baris data.`);
      
      // Reload metadata
      loadSpreadsheetMetadata(activeSpreadsheetId);
    } catch (err: any) {
      console.error('Sync all error:', err);
      addToast('error', 'Gagal Sinkronisasi', err.message);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncSpecific = async (moduleType: 'warga' | 'kas' | 'kematian' | 'omplongan' | 'surat') => {
    if (!activeSpreadsheetId) {
      addToast('error', 'Pilih Spreadsheet', 'Pilih spreadsheet target terlebih dahulu.');
      return;
    }

    setSyncingModule(moduleType);
    try {
      let res: SyncResult;
      if (moduleType === 'warga') {
        res = await GoogleSheetsService.syncDataWarga(activeSpreadsheetId, wargaList);
      } else if (moduleType === 'kas') {
        res = await GoogleSheetsService.syncKasRT(activeSpreadsheetId);
      } else if (moduleType === 'kematian') {
        res = await GoogleSheetsService.syncDanaKematian(activeSpreadsheetId);
      } else if (moduleType === 'omplongan') {
        res = await GoogleSheetsService.syncOmplongan(activeSpreadsheetId);
      } else {
        res = await GoogleSheetsService.syncSuratPengantar(activeSpreadsheetId, suratList);
      }

      setSyncHistory(prev => [res, ...prev]);
      addToast('success', `Tab ${res.sheetName} Disinkronkan`, `${res.rowsWritten} baris data berhasil diperbarui.`);
      loadSpreadsheetMetadata(activeSpreadsheetId);
    } catch (err: any) {
      console.error('Specific sync error:', err);
      addToast('error', 'Gagal Sinkronkan Data', err.message);
    } finally {
      setSyncingModule(null);
    }
  };

  // Live Sheet Viewer
  const handleLoadLiveViewer = async (tabName: string) => {
    if (!activeSpreadsheetId) return;
    setSelectedViewerTab(tabName);
    setIsLoadingViewer(true);
    try {
      const rows = await GoogleSheetsService.readRange(activeSpreadsheetId, `${tabName}!A1:Z50`);
      setLiveSheetRows(rows);
    } catch (err: any) {
      console.error('Viewer fetch error:', err);
      addToast('error', 'Gagal Membaca Tab', err.message);
    } finally {
      setIsLoadingViewer(false);
    }
  };

  // Import operations
  const handleAnalyzeImport = async () => {
    if (!activeSpreadsheetId) {
      addToast('error', 'Pilih Spreadsheet', 'Silakan hubungkan spreadsheet terlebih dahulu.');
      return;
    }

    setIsAnalyzingImport(true);
    try {
      const preview = await GoogleSheetsService.previewImportWargaFromSheet(activeSpreadsheetId, importTabName);
      setImportPreview(preview);
      addToast('info', 'Analisis Selesai', `Ditemukan ${preview.validRecords.length} baris warga valid dari ${preview.totalRows} baris.`);
    } catch (err: any) {
      console.error('Import analysis error:', err);
      addToast('error', 'Analisis Gagal', err.message);
    } finally {
      setIsAnalyzingImport(false);
    }
  };

  const handleExecuteImport = () => {
    if (!importPreview || importPreview.validRecords.length === 0) return;
    setIsExecutingImport(true);

    try {
      if (onUpdateWargaList) {
        onUpdateWargaList(importPreview.validRecords);
        addToast('success', 'Import Berhasil!', `${importPreview.validRecords.length} data warga berhasil diperbarui ke sistem.`);
      }
      setShowConfirmImportModal(false);
      setImportPreview(null);
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui Database', err.message);
    } finally {
      setIsExecutingImport(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-800 via-[#123B5D] to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Integrasi Google Sheets & Drive</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Resmi RT 07
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sinkronisasi real-time dua arah, pencadangan otomatis, dan ekspor spreadsheet terpadu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSpreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all border border-white/20"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka di Sheets
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Bar / Account Status */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {hasToken && user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.email?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1.5 text-[11px]">
                    ({user.email})
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Terotentikasi
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Cloud className="w-4 h-4 text-amber-500" />
                <span>Belum terhubung ke Akun Google untuk mengakses Drive/Sheets.</span>
              </div>
            )}
          </div>

          <div>
            {hasToken ? (
              <button
                onClick={handleGoogleLogout}
                className="flex items-center gap-1 text-slate-500 hover:text-red-500 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Ganti Akun Google
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {isAuthenticating ? 'Menghubungkan...' : 'Sign in with Google'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Sinkronisasi & Ekspor
          </button>

          <button
            onClick={() => {
              setActiveTab('spreadsheets');
              fetchDriveSpreadsheets();
            }}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'spreadsheets'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Pilih / Buat Spreadsheet
          </button>

          <button
            onClick={() => {
              setActiveTab('viewer');
              handleLoadLiveViewer('Data_Warga');
            }}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'viewer'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" /> Viewer Live Google Sheets
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <DownloadCloud className="w-4 h-4" /> Import Data dari Sheets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Warning banner if not authenticated */}
          {!hasToken && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold text-sm">Otorisasi Google Diperlukan</p>
                <p className="mt-1">
                  Untuk membaca dan memperbarui data Google Spreadsheet secara real-time langsung ke Google Drive Anda, silakan klik tombol <strong>"Sign in with Google"</strong> di atas.
                </p>
              </div>
            </div>
          )}

          {/* Active Connected Spreadsheet Info Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeMetadata?.title || GoogleSheetsService.getActiveSpreadsheetName() || 'Belum Ada Spreadsheet Terpilih'}
                  </h3>
                  {activeSpreadsheetId && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>ID: {activeSpreadsheetId || 'None'}</span>
                  {activeMetadata?.sheets && (
                    <span>• {activeMetadata.sheets.length} Tab Tersedia</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {activeSpreadsheetId ? (
                <>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka di Tab Baru
                  </a>
                  <button
                    onClick={() => activeSpreadsheetId && loadSpreadsheetMetadata(activeSpreadsheetId)}
                    disabled={isLoadingMeta}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    title="Muat Ulang Metadata"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingMeta ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateNewMasterSheet}
                  disabled={!hasToken || isLoadingMeta}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Buat Master Spreadsheet RT 07 Baru
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: SINKRONISASI & EKSPOR */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* 1-Click Master Backup Button */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-[#123B5D] to-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                        1-Click Sync
                      </span>
                      <h4 className="text-base font-black">Sinkronkan Semua Data RT ke Master Google Sheet</h4>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 max-w-xl">
                      Secara otomatis memperbarui 5 tab sekaligus: <strong>Data_Warga</strong> ({wargaList.length} KK/Jiwa), <strong>Buku_Kas_RT</strong>, <strong>Dana_Kematian</strong>, <strong>Omplongan_Agustusan</strong>, dan <strong>Surat_Pengantar</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncAll}
                    disabled={!hasToken || !activeSpreadsheetId || isSyncingAll}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap transform hover:scale-[1.02]"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncingAll ? 'animate-bounce' : ''}`} />
                    {isSyncingAll ? 'Sedang Mengunggah...' : 'Sinkronkan Semua Sekarang'}
                  </button>
                </div>
              </div>

              {/* Individual Module Cards */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Sinkronisasi Per Pos & Modul Data
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Card 1: Data Warga */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Tab: <code className="text-blue-600">Data_Warga</code>
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">Data Warga & Kependudukan</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {wargaList.length} Jiwa terdaftar dengan profil NIK, KK, Blok Rumah, HP, dan Pekerjaan.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncSpecific('warga')}
                      disabled={!hasToken || !activeSpreadsheetId || syncingModule === 'warga'}
                      className="mt-4 w-full py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {syncingModule === 'warga' ? 'Mengunggah...' : 'Ekspor Data Warga'}
                    </button>
                  </div>

                  {/* Card 2: Buku Kas RT */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Tab: <code className="text-emerald-600">Buku_Kas_RT</code>
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">Buku Kas & Keuangan RT</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ledger kas umum, rincian iuran masuk, belanja pos ronda, dan rekap saldo berjalan.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncSpecific('kas')}
                      disabled={!hasToken || !activeSpreadsheetId || syncingModule === 'kas'}
                      className="mt-4 w-full py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {syncingModule === 'kas' ? 'Mengunggah...' : 'Ekspor Kas RT'}
                    </button>
                  </div>

                  {/* Card 3: Omplongan Agustusan */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <span className="text-sm">🇮🇩</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Tab: <code className="text-red-600">Omplongan_Agustusan</code>
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">Omplongan Agustusan</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Sesi tarikan petugas, donasi per KK, rincian belanja lomba, dan sisa kas Agustusan.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncSpecific('omplongan')}
                      disabled={!hasToken || !activeSpreadsheetId || syncingModule === 'omplongan'}
                      className="mt-4 w-full py-2 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-800 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {syncingModule === 'omplongan' ? 'Mengunggah...' : 'Ekspor Omplongan'}
                    </button>
                  </div>

                  {/* Card 4: Dana Kematian */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <span className="text-sm">🕊️</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Tab: <code className="text-purple-600">Dana_Kematian</code>
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">Dana Kematian & Santunan</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Iuran kematian Rp 20.000/KK dan catatan realisasi santunan duka cita warga.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncSpecific('kematian')}
                      disabled={!hasToken || !activeSpreadsheetId || syncingModule === 'kematian'}
                      className="mt-4 w-full py-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-purple-200 dark:border-purple-800 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {syncingModule === 'kematian' ? 'Mengunggah...' : 'Ekspor Dana Kematian'}
                    </button>
                  </div>

                  {/* Card 5: Log Surat & Dokumen */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Tab: <code className="text-amber-600">Surat_Pengantar</code>
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">Surat Pengantar & Dokumen</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {suratList.length} Arsip nomor surat digital, QR hash, dan riwayat verifikasi pengurus.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncSpecific('surat')}
                      disabled={!hasToken || !activeSpreadsheetId || syncingModule === 'surat'}
                      className="mt-4 w-full py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {syncingModule === 'surat' ? 'Mengunggah...' : 'Ekspor Log Surat'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync History Table */}
              {syncHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Riwayat Sinkronisasi Terakhir
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        <tr>
                          <th className="p-2.5">Waktu</th>
                          <th className="p-2.5">Tab Sheet</th>
                          <th className="p-2.5">Jumlah Baris</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Tautan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        {syncHistory.map((h, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-slate-500 dark:text-slate-400">{h.timestamp}</td>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{h.sheetName}</td>
                            <td className="p-2.5 font-mono">{h.rowsWritten} baris</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                                Sukses
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <a
                                href={h.spreadsheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                Buka <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PILIH / BUAT SPREADSHEET */}
          {activeTab === 'spreadsheets' && (
            <div className="space-y-6">
              {/* Connect by Manual ID / URL */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Hubungkan dengan Link atau ID Spreadsheet Tertentu
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSheetInput}
                    onChange={(e) => setCustomSheetInput(e.target.value)}
                    placeholder="Tempel Google Sheet URL (https://docs.google.com/spreadsheets/d/.../edit) atau ID"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleConnectCustomSheet}
                    disabled={!customSheetInput.trim()}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow disabled:opacity-50"
                  >
                    Hubungkan
                  </button>
                </div>
              </div>

              {/* Drive Spreadsheet Browser */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Spreadsheet di Google Drive Anda
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pilih salah satu file untuk dijadikan target sinkronisasi
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari file..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <button
                      onClick={fetchDriveSpreadsheets}
                      disabled={isLoadingFiles}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                      title="Segarkan Daftar"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingFiles ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span>Membaca file dari Google Drive...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 text-xs">
                    <p className="font-semibold">Tidak ada file spreadsheet ditemukan di Google Drive.</p>
                    <button
                      onClick={handleCreateNewMasterSheet}
                      className="mt-3 px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Buat Master Spreadsheet RT 07
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {driveFiles
                      .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((file) => {
                        const isSelected = activeSpreadsheetId === file.id;
                        return (
                          <div
                            key={file.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 ring-1 ring-emerald-500'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <FileSpreadsheet className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {file.name}
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Diubah: {new Date(file.modifiedTime).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isSelected ? (
                                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Terpilih
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveSpreadsheetId(file.id);
                                    loadSpreadsheetMetadata(file.id);
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-colors"
                                >
                                  Pilih
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VIEWER LIVE GOOGLE SHEETS */}
          {activeTab === 'viewer' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Tab Sheet:</span>
                  <div className="flex gap-1.5 overflow-x-auto">
                    {DEFAULT_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleLoadLiveViewer(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedViewerTab === tab
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleLoadLiveViewer(selectedViewerTab)}
                  disabled={isLoadingViewer || !activeSpreadsheetId}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingViewer ? 'animate-spin text-emerald-600' : ''}`} />
                  Segarkan Data
                </button>
              </div>

              {/* Table rendering */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
                {isLoadingViewer ? (
                  <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span>Mengambil baris dari Google Sheets API...</span>
                  </div>
                ) : liveSheetRows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <p>Tab <strong>{selectedViewerTab}</strong> kosong atau belum pernah disinkronkan.</p>
                    <button
                      onClick={() => handleSyncSpecific(selectedViewerTab.toLowerCase().includes('warga') ? 'warga' : selectedViewerTab.toLowerCase().includes('kas') ? 'kas' : 'omplongan' as any)}
                      className="mt-3 px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 shadow"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Ekspor Data Sekarang ke Tab Ini
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#123B5D] text-white">
                          {liveSheetRows[0]?.map((cell: any, cIdx: number) => (
                            <th key={cIdx} className="p-2.5 font-bold border-r border-blue-900 whitespace-nowrap">
                              {String(cell || '')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {liveSheetRows.slice(1).map((row: any[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            {row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-2.5 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                {String(cell !== undefined && cell !== null ? cell : '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: IMPORT DARI GOOGLE SHEETS */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <p className="font-bold text-sm">Import Data Warga dari Google Sheets</p>
                  <p className="mt-1">
                    Sistem akan membaca kolom seperti <em>Nama Lengkap, NIK, No KK, Blok, No HP</em> secara otomatis dan menampilkan pratinjau sebelum disimpan ke database RT.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Tab Spreadsheet Sumber:
                  </label>
                  <input
                    type="text"
                    value={importTabName}
                    onChange={(e) => setImportTabName(e.target.value)}
                    placeholder="e.g. Data_Warga"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="pt-5">
                  <button
                    onClick={handleAnalyzeImport}
                    disabled={!activeSpreadsheetId || !hasToken || isAnalyzingImport}
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Search className={`w-3.5 h-3.5 ${isAnalyzingImport ? 'animate-spin' : ''}`} />
                    {isAnalyzingImport ? 'Menganalisis...' : 'Pratinjau Data Impor'}
                  </button>
                </div>
              </div>

              {/* Import Preview Card */}
              {importPreview && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Hasil Analisis Data Impor
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {importPreview.validRecords.length} baris valid siap diimpor ke data warga RT 07.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowConfirmImportModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow flex items-center gap-1.5"
                    >
                      <DownloadCloud className="w-4 h-4" /> Terapkan ke Database Warga
                    </button>
                  </div>

                  {/* Summary Chips */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Baris</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{importPreview.totalRows}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[10px] text-emerald-600 font-bold block uppercase">Baris Valid</span>
                      <span className="text-base font-black text-emerald-600">{importPreview.validRecords.length}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-[10px] text-amber-600 font-bold block uppercase">Baris Dilewati</span>
                      <span className="text-base font-black text-amber-600">{importPreview.invalidRows.length}</span>
                    </div>
                  </div>

                  {/* Table Sample */}
                  <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Blok Rumah</th>
                          <th className="p-2">NIK</th>
                          <th className="p-2">No. HP</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        {importPreview.validRecords.slice(0, 10).map((w, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-slate-900 dark:text-white">{w.nama_lengkap}</td>
                            <td className="p-2">{w.blok}</td>
                            <td className="p-2 font-mono text-[11px]">{w.nik}</td>
                            <td className="p-2">{w.no_hp}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                                {w.status_warga}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            OAuth 2.0 Token tersimpan aman di memory sesuai standar Google Workspace API.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Confirmation Dialog for Destructive Import */}
      {showConfirmImportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Impor Data Warga
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin memperbarui database Warga RT 07 dengan <strong>{importPreview?.validRecords.length} data</strong> dari Google Sheets?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmImportModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isExecutingImport}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
              >
                {isExecutingImport ? 'Menerapkan...' : 'Ya, Terapkan Impor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
