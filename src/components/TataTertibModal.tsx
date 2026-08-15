/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Main Standalone Component & Modal for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Search,
  Megaphone,
  History,
  Printer,
  Settings,
  X,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  TataTertibArticle,
  TataTertibCategoryItem,
  TataTertibHistory,
  TataTertibSummaryStats,
  TataTertibTabType,
  TataTertibConfig,
  TataTertibAuditLog
} from '../types/tataTertib';
import { TataTertibService } from '../services/tataTertibService';

// Subcomponents
import { TataTertibDashboardTab } from './tataTertib/TataTertibDashboardTab';
import { TataTertibDaftarTab } from './tataTertib/TataTertibDaftarTab';
import { TataTertibKategoriTab } from './tataTertib/TataTertibKategoriTab';
import { TataTertibSearchTab } from './tataTertib/TataTertibSearchTab';
import { TataTertibPengumumanTab } from './tataTertib/TataTertibPengumumanTab';
import { TataTertibRiwayatTab } from './tataTertib/TataTertibRiwayatTab';
import { TataTertibCetakTab } from './tataTertib/TataTertibCetakTab';
import { TataTertibPengaturanTab } from './tataTertib/TataTertibPengaturanTab';
import { TataTertibDetailModal } from './tataTertib/TataTertibDetailModal';
import { TataTertibDraftModal } from './tataTertib/TataTertibDraftModal';
import { TataTertibApprovalModal } from './tataTertib/TataTertibApprovalModal';

interface TataTertibModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole | string;
  currentUserName?: string;
  openComplaintModal?: () => void;
  openFinanceModal?: () => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TataTertibModal: React.FC<TataTertibModalProps> = ({
  isOpen,
  onClose,
  currentRole = 'WARGA',
  currentUserName = 'Warga RT 07',
  openComplaintModal,
  openFinanceModal,
  addToast
}) => {
  // Active Tab State
  const [activeTab, setActiveTab] = useState<TataTertibTabType>('DASHBOARD');

  // Master Data States
  const [articles, setArticles] = useState<TataTertibArticle[]>([]);
  const [categories, setCategories] = useState<TataTertibCategoryItem[]>([]);
  const [history, setHistory] = useState<TataTertibHistory[]>([]);
  const [stats, setStats] = useState<TataTertibSummaryStats>(TataTertibService.getSummaryStats());
  const [config, setConfig] = useState<TataTertibConfig>(TataTertibService.getConfig());
  const [auditLogs, setAuditLogs] = useState<TataTertibAuditLog[]>([]);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // Modals inside module
  const [selectedDetailArticle, setSelectedDetailArticle] = useState<TataTertibArticle | null>(null);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [editingDraftArticle, setEditingDraftArticle] = useState<TataTertibArticle | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [articleToApprove, setArticleToApprove] = useState<TataTertibArticle | null>(null);

  // Load Data
  const refreshData = () => {
    const loadedArticles = TataTertibService.getArticles();
    const loadedCategories = TataTertibService.getCategories();
    const loadedHistory = TataTertibService.getHistoryList();
    const loadedStats = TataTertibService.getSummaryStats();
    const loadedConfig = TataTertibService.getConfig();
    const loadedAudit = TataTertibService.getAuditLogs();

    setArticles(loadedArticles);
    setCategories(loadedCategories);
    setHistory(loadedHistory);
    setStats(loadedStats);
    setConfig(loadedConfig);
    setAuditLogs(loadedAudit);

    const userId = currentUserName.toLowerCase().replace(/\s+/g, '_');
    setIsAcknowledged(TataTertibService.isUserAcknowledged(userId, loadedStats.activeVersion));
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, currentUserName]);

  if (!isOpen) return null;

  const canManage = ['ADMIN', 'KETUA_RT', 'PENGURUS'].includes(currentRole);
  const isAdminOrKetua = ['ADMIN', 'KETUA_RT'].includes(currentRole);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (addToast) {
      addToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // Handlers
  const handleAcknowledge = () => {
    const userId = currentUserName.toLowerCase().replace(/\s+/g, '_');
    const res = TataTertibService.acknowledge(userId, currentUserName, stats.activeVersion);
    notify(res.message, res.success ? 'success' : 'info');
    refreshData();
  };

  const handleOpenCreateDraft = () => {
    setEditingDraftArticle(null);
    setDraftModalOpen(true);
  };

  const handleEditArticle = (article: TataTertibArticle) => {
    setEditingDraftArticle(article);
    setDraftModalOpen(true);
  };

  const handleSaveDraft = (formData: any) => {
    if (editingDraftArticle) {
      const res = TataTertibService.updateDraft(
        editingDraftArticle.id,
        formData,
        currentRole,
        currentUserName
      );
      notify(res.message, res.success ? 'success' : 'error');
    } else {
      const res = TataTertibService.createDraft(
        formData,
        currentRole,
        currentUserName
      );
      notify(res.message, res.success ? 'success' : 'error');
    }
    setDraftModalOpen(false);
    setEditingDraftArticle(null);
    refreshData();
  };

  const handleSubmitReview = (article: TataTertibArticle) => {
    const res = TataTertibService.submitForApproval(article.id, currentRole, currentUserName);
    notify(res.message, res.success ? 'success' : 'error');
    refreshData();
  };

  const handleOpenApproveModal = (article: TataTertibArticle) => {
    setArticleToApprove(article);
    setApprovalModalOpen(true);
  };

  const handleExecuteApprove = (
    articleId: string,
    newVersion: string,
    effectiveDate: string,
    changeSummary: string,
    reason: string
  ) => {
    const res = TataTertibService.approveAndPublish(
      articleId,
      newVersion,
      effectiveDate,
      changeSummary,
      reason,
      currentRole,
      currentUserName
    );
    notify(res.message, res.success ? 'success' : 'error');
    setApprovalModalOpen(false);
    setArticleToApprove(null);
    refreshData();
  };

  const handleArchiveArticle = (article: TataTertibArticle) => {
    const reason = prompt('Masukkan alasan pengarsipan aturan ini:');
    if (reason === null) return;

    const res = TataTertibService.archiveArticle(article.id, currentRole, currentUserName, reason);
    notify(res.message, res.success ? 'success' : 'error');
    refreshData();
  };

  const handleAddCategory = (categoryData: { code: string; name: string; description?: string }) => {
    const res = TataTertibService.addCategory(categoryData, currentRole, currentUserName);
    notify(res.message, res.success ? 'success' : 'error');
    refreshData();
  };

  const handleSaveConfig = (updatedConfig: Partial<TataTertibConfig>) => {
    const res = TataTertibService.updateConfig(updatedConfig, currentRole, currentUserName);
    notify(res.message, res.success ? 'success' : 'error');
    refreshData();
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      articles,
      categories,
      history,
      config
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BACKUP-TATA-TERTIB-RT07-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('File cadangan JSON berhasil diunduh.', 'success');
  };

  const handleImportBackup = (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.articles && Array.isArray(parsed.articles)) {
        TataTertibService.saveArticles(parsed.articles);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        TataTertibService.saveCategories(parsed.categories);
      }
      if (parsed.history && Array.isArray(parsed.history)) {
        TataTertibService.saveHistory(parsed.history);
      }
      notify('Data cadangan Tata Tertib berhasil dipulihkan.', 'success');
      refreshData();
    } catch {
      notify('Format file JSON tidak valid.', 'error');
    }
  };

  const handleSubmitFeedback = (tataTertibId: string, isHelpful: boolean, comment?: string) => {
    const userId = currentUserName.toLowerCase().replace(/\s+/g, '_');
    const res = TataTertibService.submitFeedback(tataTertibId, isHelpful, comment, userId, currentUserName);
    notify(res.message, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[94vh] max-h-[94vh] animate-in fade-in zoom-in duration-200">
        {/* Main Application Header Bar */}
        <header className="bg-[#123B5D] px-4 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-[#D4A72C]/40 shadow-inner">
              <Building2 className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  MODUL TATA TERTIB WARGA v1.0
                </h2>
                <span className="bg-[#2E7D52] text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  RT 07 RW 11 GPA NGIJO
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sistem Peraturan & Hukum Lingkungan Mandiri • User: <span className="font-semibold text-white">{currentUserName}</span> ({currentRole})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Modul Tata Tertib"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* 8 Standalone Submenu Tabs Navigation */}
        <nav aria-label="Menu Tata Tertib" className="bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none flex-shrink-0 py-2">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'DASHBOARD'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('DAFTAR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'DAFTAR'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Daftar Tata Tertib ({stats.activeCount})
          </button>

          <button
            onClick={() => setActiveTab('KATEGORI')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'KATEGORI'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Kategori ({stats.totalCategories})
          </button>

          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'SEARCH'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Pencarian
          </button>

          <button
            onClick={() => setActiveTab('PENGUMUMAN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'PENGUMUMAN'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Pengumuman
          </button>

          <button
            onClick={() => setActiveTab('RIWAYAT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'RIWAYAT'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Versi
          </button>

          <button
            onClick={() => setActiveTab('CETAK_PDF')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'CETAK_PDF'
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            Simpan PDF / Cetak
          </button>

          {isAdminOrKetua && (
            <button
              onClick={() => setActiveTab('PENGATURAN')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'PENGATURAN'
                  ? 'bg-[#123B5D] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Pengaturan Admin
            </button>
          )}
        </nav>

        {/* Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'DASHBOARD' && (
            <TataTertibDashboardTab
              stats={stats}
              categories={categories}
              recentArticles={articles.filter(a => a.status === 'AKTIF' || a.status === 'ACTIVE')}
              currentRole={currentRole}
              isAcknowledged={isAcknowledged}
              onAcknowledge={handleAcknowledge}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenCreateDraft={handleOpenCreateDraft}
              onSelectArticle={(art) => setSelectedDetailArticle(art)}
            />
          )}

          {activeTab === 'DAFTAR' && (
            <TataTertibDaftarTab
              articles={articles}
              categories={categories}
              currentRole={currentRole}
              onSelectArticle={(art) => setSelectedDetailArticle(art)}
              onEditArticle={handleEditArticle}
              onSubmitReview={handleSubmitReview}
              onApproveArticle={handleOpenApproveModal}
              onArchiveArticle={handleArchiveArticle}
              onOpenCreateDraft={handleOpenCreateDraft}
              onPrintArticle={(art) => {
                setSelectedDetailArticle(art);
                setActiveTab('CETAK_PDF');
              }}
            />
          )}

          {activeTab === 'KATEGORI' && (
            <TataTertibKategoriTab
              categories={categories}
              articles={articles}
              currentRole={currentRole}
              onAddCategory={handleAddCategory}
              onFilterByCategory={() => {
                setActiveTab('DAFTAR');
              }}
            />
          )}

          {activeTab === 'SEARCH' && (
            <TataTertibSearchTab
              articles={articles}
              categories={categories}
              onSelectArticle={(art) => setSelectedDetailArticle(art)}
              onPrintArticle={(art) => {
                setSelectedDetailArticle(art);
                setActiveTab('CETAK_PDF');
              }}
            />
          )}

          {activeTab === 'PENGUMUMAN' && (
            <TataTertibPengumumanTab
              history={history}
              stats={stats}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'RIWAYAT' && (
            <TataTertibRiwayatTab history={history} />
          )}

          {activeTab === 'CETAK_PDF' && (
            <TataTertibCetakTab articles={articles} config={config} />
          )}

          {activeTab === 'PENGATURAN' && isAdminOrKetua && (
            <TataTertibPengaturanTab
              config={config}
              auditLogs={auditLogs}
              currentRole={currentRole}
              onSaveConfig={handleSaveConfig}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}
        </main>
      </div>

      {/* Sub Modals */}
      <TataTertibDetailModal
        article={selectedDetailArticle}
        onClose={() => setSelectedDetailArticle(null)}
        onPrint={() => {
          setSelectedDetailArticle(null);
          setActiveTab('CETAK_PDF');
        }}
        onSubmitFeedback={handleSubmitFeedback}
      />

      <TataTertibDraftModal
        initialArticle={editingDraftArticle}
        categories={categories}
        isOpen={draftModalOpen}
        onClose={() => {
          setDraftModalOpen(false);
          setEditingDraftArticle(null);
        }}
        onSave={handleSaveDraft}
      />

      <TataTertibApprovalModal
        article={articleToApprove}
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setArticleToApprove(null);
        }}
        onApprove={handleExecuteApprove}
      />
    </div>
  );
};
