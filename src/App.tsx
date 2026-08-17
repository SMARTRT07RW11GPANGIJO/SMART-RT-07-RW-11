import React, { useState, useEffect } from 'react';
import { UserRole, Warga, Keluarga, SuratPengantar, TransaksiKeuangan, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan, AuditLog, DigitalDocument } from './types/rt';
import { INITIAL_WARGA, INITIAL_KELUARGA, INITIAL_SURAT, INITIAL_TRANSAKSI, INITIAL_IURAN, INITIAL_PENGADUAN, INITIAL_PENGUMUMAN, INITIAL_AGENDA, INITIAL_PENGURUS, INITIAL_AUDIT_LOG } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DocumentVerificationView } from './components/DocumentVerificationView';
import { LetterGeneratorModal } from './components/LetterGeneratorModal';
import { ComplaintModal } from './components/ComplaintModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { WhatsAppAutomationModal } from './components/WhatsAppAutomationModal';
import { PdfDocumentViewer } from './components/PdfDocumentViewer';
import { DocumentArchiveModal } from './components/DocumentArchiveModal';
import { RevokeDocumentModal } from './components/RevokeDocumentModal';
import { BottomNav } from './components/BottomNav';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { waServiceInstance } from './services/whatsappService';
import { getStoredDigitalDocuments, revokeDigitalDocument } from './services/documentService';
import { SuratService } from './services/suratService';
import { SecurityHealthDashboard } from './components/SecurityHealthDashboard';
import { AdminSystemDashboard } from './components/AdminSystemDashboard';
import { SystemMonitoringDashboard } from './components/SystemMonitoringDashboard';
import { AdminAIPermissionsDashboard } from './components/AdminAIPermissionsDashboard';
import { AIToolsAutomationModal } from './components/AIToolsAutomationModal';
import { AdminAIAuditDashboard } from './components/AdminAIAuditDashboard';
import { AdminAIEvaluationDashboard } from './components/AdminAIEvaluationDashboard';
import { AdminAIProductionDashboard } from './components/AdminAIProductionDashboard';
import { AdminProductionMonitoringDashboard } from './components/AdminProductionMonitoringDashboard';
import { AdminAlertsDashboard } from './components/AdminAlertsDashboard';
import { FinanceManagementModal } from './components/FinanceManagementModal';
import { TataTertibModal } from './components/TataTertibModal';
import { OmplonganManagementModal } from './components/OmplonganManagementModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { DeathFundModal } from './components/deathFund/DeathFundModal';
import { AdminBackupVerificationDashboard } from './components/AdminBackupVerificationDashboard';
import { AdminDisasterRecoveryDashboard } from './components/AdminDisasterRecoveryDashboard';
import { AdminSecurityOperationsDashboard } from './components/AdminSecurityOperationsDashboard';
import { AdminAIContinuousEvalDashboard } from './components/AdminAIContinuousEvalDashboard';
import { AdminAIKnowledgeManagementDashboard } from './components/AdminAIKnowledgeManagementDashboard';
import { AdminAIFeedbackDashboard } from './components/AdminAIFeedbackDashboard';
import { AdminControlCenterDashboard } from './components/AdminControlCenterDashboard';
import { AdminSystemDocumentationDashboard } from './components/AdminSystemDocumentationDashboard';
import { AdminTrainingDashboard } from './components/AdminTrainingDashboard';
import { AdminLaunchDashboard } from './components/AdminLaunchDashboard';
import { FacilityDashboard } from './components/facility/FacilityDashboard';
import { RitaAssistantWidget } from './components/RitaAssistantWidget';
import { AIAssistantPage } from './pages/AIAssistant';

export default function App() {
  const [currentRole, setRole] = useState<UserRole>('PUBLIC');
  const [currentTab, setTab] = useState<string>('landing');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  // Master States
  const [wargaList, setWargaList] = useState<Warga[]>(INITIAL_WARGA);
  const [keluargaList, setKeluargaList] = useState<Keluarga[]>(INITIAL_KELUARGA);
  const [suratList, setSuratList] = useState<SuratPengantar[]>(INITIAL_SURAT);
  const [transaksiList, setTransaksiList] = useState<TransaksiKeuangan[]>(INITIAL_TRANSAKSI);
  const [iuranList, setIuranList] = useState<TagihanIuran[]>(INITIAL_IURAN);
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>(INITIAL_PENGADUAN);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(INITIAL_PENGUMUMAN);
  const [agendaList, setAgendaList] = useState<AgendaKegiatan[]>(INITIAL_AGENDA);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOG);

  // Tahap 5 Digital Documents State
  const [digitalDocs, setDigitalDocs] = useState<DigitalDocument[]>(getStoredDigitalDocuments());
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<DigitalDocument | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeTargetDoc, setRevokeTargetDoc] = useState<DigitalDocument | null>(null);

  // Sync Digital Documents store
  const refreshDigitalDocs = () => {
    setDigitalDocs(getStoredDigitalDocuments());
  };

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [systemModalOpen, setSystemModalOpen] = useState(false);
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [aiPermissionsModalOpen, setAiPermissionsModalOpen] = useState(false);
  const [aiToolsModalOpen, setAiToolsModalOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [tataTertibModalOpen, setTataTertibModalOpen] = useState(false);
  const [omplonganModalOpen, setOmplonganModalOpen] = useState(false);
  const [googleSheetsModalOpen, setGoogleSheetsModalOpen] = useState(false);
  const [deathFundModalOpen, setDeathFundModalOpen] = useState(false);

  const handleRestoreState = (restoredData: any) => {
    if (restoredData.wargaList) setWargaList(restoredData.wargaList);
    if (restoredData.keluargaList) setKeluargaList(restoredData.keluargaList);
    if (restoredData.suratList) setSuratList(restoredData.suratList);
    if (restoredData.transaksiList) setTransaksiList(restoredData.transaksiList);
    if (restoredData.iuranList) setIuranList(restoredData.iuranList);
    if (restoredData.pengaduanList) setPengaduanList(restoredData.pengaduanList);
    if (restoredData.pengumumanList) setPengumumanList(restoredData.pengumumanList);
    if (restoredData.agendaList) setAgendaList(restoredData.agendaList);
    if (restoredData.auditLogs) setAuditLogs(restoredData.auditLogs);
    refreshDigitalDocs();
  };

  const handleOpenPdfDoc = (doc: DigitalDocument) => {
    setSelectedPdfDoc(doc);
    setPdfViewerOpen(true);
  };

  const handleOpenRevokeModal = (doc: DigitalDocument) => {
    setRevokeTargetDoc(doc);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = (docId: string, reason: string) => {
    const result = revokeDigitalDocument(docId, `Pengurus RT (${currentRole})`, reason);
    if (result.success) {
      refreshDigitalDocs();
      addToast('error', 'Dokumen Dicabut!', `Document ${docId} berhasil dicabut.`);
      
      const newLog: AuditLog = {
        id_log: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `Pengurus RT (${currentRole})`,
        action: 'DOCUMENT_REVOKED',
        module: 'Arsip Dokumen Digital',
        record_id: docId,
        status: 'WARNING',
        description: `Mencabut dokumen ${docId} dengan alasan: ${reason}`
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } else {
      addToast('error', 'Gagal Mencabut Dokumen', result.message);
    }
  };

  const handleAddSurat = (newSurat: SuratPengantar) => {
    setSuratList((prev) => [newSurat, ...prev]);
    const newLog: AuditLog = {
      id_log: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `Warga (${newSurat.nama_pemohon})`,
      action: 'SUBMIT_SURAT',
      module: 'Administrasi Surat',
      record_id: newSurat.id_surat,
      status: 'SUCCESS',
      description: `Mengajukan permohonan ${newSurat.jenis_surat}.`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', 'Permohonan Surat Terkirim!', `Nomor Registrasi: ${newSurat.nomor_surat}`);

    // Trigger WhatsApp Event 1: SURAT_RECEIVED
    const pemohonWarga = wargaList.find((w) => w.id_warga === newSurat.id_warga);
    const targetPhone = pemohonWarga?.no_hp || '081234567890';
    waServiceInstance.sendNotification('SURAT_RECEIVED', targetPhone, {
      recipientPhone: targetPhone,
      recipientName: newSurat.nama_pemohon,
      idRecord: newSurat.nomor_surat,
      jenisLayanan: newSurat.jenis_surat
    });
  };

  const handleAddPengaduan = (newPengaduan: Pengaduan) => {
    setPengaduanList((prev) => [newPengaduan, ...prev]);
    const newLog: AuditLog = {
      id_log: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `Warga (${newPengaduan.nama_pelapor})`,
      action: 'SUBMIT_PENGADUAN',
      module: 'Pengaduan Warga',
      record_id: newPengaduan.id_pengaduan,
      status: 'SUCCESS',
      description: `Mengirim pengaduan ${newPengaduan.kategori}.`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', 'Pengaduan Terdaftar!', `Nomor Tiket: ${newPengaduan.nomor_tiket}`);

    // Trigger WhatsApp Event 5: PENGADUAN_RECEIVED
    waServiceInstance.sendNotification('PENGADUAN_RECEIVED', newPengaduan.no_hp || '081234567890', {
      recipientPhone: newPengaduan.no_hp || '081234567890',
      recipientName: newPengaduan.nama_pelapor,
      idRecord: newPengaduan.nomor_tiket,
      jenisLayanan: newPengaduan.kategori,
      details: newPengaduan.deskripsi
    });
  };

  const pendingSuratCount = suratList.filter((s) => s.status !== 'SELESAI' && s.status !== 'DITOLAK').length;
  const activeAduanCount = pengaduanList.filter((p) => p.status !== 'SELESAI').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#2E7D52] selection:text-white pb-16 lg:pb-0">
      
      {/* Header Bar */}
      <Header
        currentRole={currentRole}
        setRole={setRole}
        currentTab={currentTab}
        setTab={setTab}
        openLetterModal={() => setLetterModalOpen(true)}
        openComplaintModal={() => setComplaintModalOpen(true)}
        openArchModal={() => setArchModalOpen(true)}
        openWaModal={() => setWaModalOpen(true)}
        openArchiveModal={() => {
          refreshDigitalDocs();
          setArchiveModalOpen(true);
        }}
        openSecurityModal={() => setSecurityModalOpen(true)}
        openSystemModal={() => setSystemModalOpen(true)}
        openMonitorModal={() => setMonitorModalOpen(true)}
        openAiPermissionsModal={() => setAiPermissionsModalOpen(true)}
        openAiToolsModal={() => setAiToolsModalOpen(true)}
        openAiAuditModal={() => setTab('ai-audit')}
        openAiEvalModal={() => setTab('ai-eval')}
        openAiProductionModal={() => setTab('ai-prod')}
        openProductionMonitoringModal={() => setTab('prod-monitoring')}
        openProductionAlertsModal={() => setTab('prod-alerts')}
        openBackupVerificationModal={() => setTab('prod-backup')}
        openDisasterRecoveryModal={() => setTab('prod-dr')}
        openSecurityOpsModal={() => setTab('prod-sec-ops')}
        openFinanceModal={() => setFinanceModalOpen(true)}
        openTataTertibModal={() => setTataTertibModalOpen(true)}
        openOmplonganModal={() => setOmplonganModalOpen(true)}
        openGoogleSheetsModal={() => setGoogleSheetsModalOpen(true)}
        openDeathFundModal={() => setDeathFundModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            setTab={setTab}
            openLetterModal={() => setLetterModalOpen(true)}
            openComplaintModal={() => setComplaintModalOpen(true)}
            announcements={pengumumanList}
            agendas={agendaList}
            transactions={transaksiList}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            currentRole={currentRole}
            wargaList={wargaList}
            setWargaList={setWargaList}
            keluargaList={keluargaList}
            setKeluargaList={setKeluargaList}
            suratList={suratList}
            setSuratList={setSuratList}
            transaksiList={transaksiList}
            setTransaksiList={setTransaksiList}
            iuranList={iuranList}
            setIuranList={setIuranList}
            pengaduanList={pengaduanList}
            setPengaduanList={setPengaduanList}
            pengumumanList={pengumumanList}
            setPengumumanList={setPengumumanList}
            agendaList={agendaList}
            setAgendaList={setAgendaList}
            pengurusList={INITIAL_PENGURUS}
            auditLogs={auditLogs}
            openLetterModal={() => setLetterModalOpen(true)}
            openComplaintModal={() => setComplaintModalOpen(true)}
            openArchModal={() => setArchModalOpen(true)}
            openArchiveModal={() => {
              refreshDigitalDocs();
              setArchiveModalOpen(true);
            }}
            openFinanceModal={() => setFinanceModalOpen(true)}
            openTataTertibModal={() => setTataTertibModalOpen(true)}
            openOmplonganModal={() => setOmplonganModalOpen(true)}
            openGoogleSheetsModal={() => setGoogleSheetsModalOpen(true)}
            openDeathFundModal={() => setDeathFundModalOpen(true)}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            addToast={addToast}
          />
        )}

        {(currentTab === 'verify' || currentTab === 'verifikasi' || currentTab === 'surat-verifikasi') && (
          <DocumentVerificationView
            suratList={suratList}
            digitalDocs={digitalDocs}
            currentRole={currentRole}
            onRefreshList={() => {
              setSuratList(SuratService.getStoredSuratList());
            }}
            onOpenLetterModal={() => setLetterModalOpen(true)}
          />
        )}

        {currentTab === 'ai-chat' && (
          <AIAssistantPage currentRole={currentRole} userName="Warga RT 07" addToast={addToast} />
        )}

        {(currentTab === 'fasilitas' || currentTab === 'gis' || currentTab === 'facility') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FacilityDashboard
              currentRole={currentRole}
              currentUserId={`USR-${currentRole}`}
              currentUserName={currentRole === 'KETUA_RT' ? 'Bpk. Eko Sucahyono' : 'Pengurus RT 07'}
              isBackendConnected={true}
            />
          </div>
        )}

        {currentTab === 'ai-audit' && (
          <AdminAIAuditDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {currentTab === 'ai-eval' && (
          <AdminAIEvaluationDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {currentTab === 'ai-prod' && (
          <AdminAIProductionDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'prod-monitoring' || currentTab === 'admin-monitoring') && (
          <AdminProductionMonitoringDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'prod-alerts' || currentTab === 'admin-alerts') && (
          <AdminAlertsDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'prod-backup' || currentTab === 'admin-backup' || currentTab === 'backup-verification') && (
          <AdminBackupVerificationDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'prod-dr' || currentTab === 'admin-dr' || currentTab === 'disaster-recovery') && (
          <AdminDisasterRecoveryDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'prod-sec-ops' || currentTab === 'admin-sec-ops' || currentTab === 'security-operations') && (
          <AdminSecurityOperationsDashboard currentRole={currentRole} currentUserId={`USR-${currentRole}`} />
        )}

        {(currentTab === 'ai-continuous-eval' || currentTab === 'ai-eval-9f' || currentTab === 'continuous-eval') && (
          <AdminAIContinuousEvalDashboard currentUserRole={currentRole} />
        )}

        {(currentTab === 'ai-knowledge-9g' || currentTab === 'admin-knowledge' || currentTab === 'knowledge-management') && (
          <AdminAIKnowledgeManagementDashboard currentUserRole={currentRole} />
        )}

        {(currentTab === 'ai-feedback-9h' || currentTab === 'admin-ai-feedback' || currentTab === 'ai-feedback' || currentTab === 'user-feedback') && (
          <AdminAIFeedbackDashboard currentUserRole={currentRole} />
        )}

        {(currentTab === 'control-center-9j' || currentTab === 'control-center' || currentTab === 'admin-control-center' || currentTab === 'sys-control') && (
          <AdminControlCenterDashboard
            currentUserRole={currentRole}
            onOpenDocumentation={() => setTab('system-docs-9k')}
            onOpenTraining={() => setTab('system-training-9l')}
            onOpenLaunch={() => setTab('official-launch-9m')}
          />
        )}

        {(currentTab === 'system-docs-9k' || currentTab === 'system-documentation' || currentTab === 'admin-docs' || currentTab === 'docs') && (
          <AdminSystemDocumentationDashboard
            currentUserRole={currentRole}
            onNavigateToControlCenter={() => setTab('control-center-9j')}
          />
        )}

        {(currentTab === 'system-training-9l' || currentTab === 'system-training' || currentTab === 'admin-training' || currentTab === 'training') && (
          <AdminTrainingDashboard
            currentUserRole={currentRole}
            onNavigateToControlCenter={() => setTab('control-center-9j')}
          />
        )}

        {(currentTab === 'official-launch-9m' || currentTab === 'official-launch' || currentTab === 'admin-launch' || currentTab === 'launch' || currentTab === 'launch-2.0') && (
          <AdminLaunchDashboard
            currentUserRole={currentRole}
            onNavigateToControlCenter={() => setTab('control-center-9j')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setTab={setTab} openArchModal={() => setArchModalOpen(true)} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setTab={setTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        openLetterModal={() => setLetterModalOpen(true)}
        pendingSuratCount={pendingSuratCount}
        activeAduanCount={activeAduanCount}
        currentRole={currentRole}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modals */}
      <LetterGeneratorModal
        isOpen={letterModalOpen}
        onClose={() => setLetterModalOpen(false)}
        suratList={suratList}
        onAddSurat={handleAddSurat}
        currentRole={currentRole}
        onRefreshList={() => {
          const fresh = SuratService.getStoredSuratList();
          if (fresh && fresh.length > 0) setSuratList(fresh);
        }}
      />

      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        onAddPengaduan={handleAddPengaduan}
      />

      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />

      <WhatsAppAutomationModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        addToast={addToast}
      />

      {/* Tahap 5 PDF & QR Verification Modals */}
      <DocumentArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        digitalDocs={digitalDocs}
        onSelectDoc={handleOpenPdfDoc}
        onRevokeClick={handleOpenRevokeModal}
        currentRole={currentRole}
      />

      <PdfDocumentViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        document={selectedPdfDoc}
        onRevokeClick={handleOpenRevokeModal}
        canRevoke={currentRole === 'ADMIN' || currentRole === 'KETUA_RT' || currentRole === 'PENGURUS'}
      />

      <RevokeDocumentModal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        document={revokeTargetDoc}
        onConfirmRevoke={handleConfirmRevoke}
      />

      {/* Tahap 6 & 7 Security, Health & Backup Dashboard */}
      <SecurityHealthDashboard
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        currentRole={currentRole}
        auditLogs={auditLogs}
        dataState={{
          wargaList,
          keluargaList,
          suratList,
          transaksiList,
          iuranList,
          pengaduanList,
          pengumumanList,
          agendaList,
          auditLogs
        }}
        onRestoreState={handleRestoreState}
        addToast={addToast}
      />

      {/* Tahap 7B Admin System Dashboard (/admin/system) */}
      <AdminSystemDashboard
        isOpen={systemModalOpen}
        onClose={() => setSystemModalOpen(false)}
        addToast={addToast}
      />

      {/* Tahap 7H 24-Hour Production Monitoring Dashboard (/admin/system-monitor) */}
      <SystemMonitoringDashboard
        isOpen={monitorModalOpen}
        onClose={() => setMonitorModalOpen(false)}
        addToast={addToast}
      />

      {/* Tahap 8A AI Architecture & Permission Matrix Dashboard (/admin/ai-permissions) */}
      <AdminAIPermissionsDashboard
        isOpen={aiPermissionsModalOpen}
        onClose={() => setAiPermissionsModalOpen(false)}
        currentRole={currentRole}
        addToast={addToast}
      />

      {/* Tahap 8I AI Tools & Automation Dashboard */}
      <AIToolsAutomationModal
        isOpen={aiToolsModalOpen}
        onClose={() => setAiToolsModalOpen(false)}
        currentRole={currentRole}
        userName={currentRole === 'PUBLIC' ? 'Tamu RT 07' : `Warga (${currentRole})`}
      />

      {/* MODUL KEUANGAN RT v2.0 */}
      <FinanceManagementModal
        isOpen={financeModalOpen}
        onClose={() => setFinanceModalOpen(false)}
        currentRole={currentRole}
        addToast={(msg, type) => addToast(type === 'error' ? 'error' : type === 'success' ? 'success' : 'info', 'Keuangan RT', msg)}
      />

      {/* MODUL TATA TERTIB WARGA v1.0 */}
      <TataTertibModal
        isOpen={tataTertibModalOpen}
        onClose={() => setTataTertibModalOpen(false)}
        currentRole={currentRole}
        addToast={(msg, type) => addToast(type === 'error' ? 'error' : type === 'success' ? 'success' : 'info', 'Tata Tertib', msg)}
      />

      {/* MODUL OMPLONGAN AGUSTUSAN v1.0 */}
      <OmplonganManagementModal
        isOpen={omplonganModalOpen}
        onClose={() => setOmplonganModalOpen(false)}
        currentRole={currentRole}
        currentUserId={currentRole === 'PUBLIC' ? 'Tamu' : `WRG-${currentRole}`}
        addToast={addToast}
      />

      {/* GOOGLE SHEETS & DRIVE SYNC INTEGRATION */}
      <GoogleSheetsSyncModal
        isOpen={googleSheetsModalOpen}
        onClose={() => setGoogleSheetsModalOpen(false)}
        wargaList={wargaList}
        setWargaList={setWargaList}
        suratList={suratList}
        addToast={addToast}
      />

      {/* MODUL DANA KEMATIAN v1.0 — PRODUCTION READY */}
      <DeathFundModal
        isOpen={deathFundModalOpen}
        onClose={() => setDeathFundModalOpen(false)}
        currentRole={currentRole}
        wargaList={wargaList}
      />

      {/* Tahap 8 AI Assistant RITA Floating Widget */}
      <RitaAssistantWidget
        currentRole={currentRole}
        userName={currentRole === 'PUBLIC' ? 'Tamu RT 07' : `Warga (${currentRole})`}
        suratList={suratList}
        iuranList={iuranList}
        pengaduanList={pengaduanList}
        pengumumanList={pengumumanList}
        agendaList={agendaList}
        openLetterModal={() => setLetterModalOpen(true)}
        openComplaintModal={() => setComplaintModalOpen(true)}
        openTataTertibModal={() => setTataTertibModalOpen(true)}
        openArchiveModal={() => {
          refreshDigitalDocs();
          setArchiveModalOpen(true);
        }}
        onPublishAnnouncement={(newAnn) => {
          setPengumumanList((prev) => [newAnn, ...prev]);
        }}
        addToast={addToast}
      />

    </div>
  );
}
