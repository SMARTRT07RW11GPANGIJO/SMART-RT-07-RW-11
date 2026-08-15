import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  Users, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileText, 
  Scale, 
  X, 
  Download, 
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { UserRole } from '../../security/roles';
import { DeathFundTabType, PesertaDanaKematian, KejadianKematianDK } from '../../types/deathFund';
import { DeathFundService } from '../../services/deathFundService';
import { DeathFundDashboardTab } from './DeathFundDashboardTab';
import { DeathFundPesertaTab } from './DeathFundPesertaTab';
import { DeathFundIuranTab } from './DeathFundIuranTab';
import { DeathFundPemasukanTab } from './DeathFundPemasukanTab';
import { DeathFundPengeluaranTab } from './DeathFundPengeluaranTab';
import { DeathFundKejadianTab } from './DeathFundKejadianTab';
import { DeathFundSantunanTab } from './DeathFundSantunanTab';
import { DeathFundTransaksiTab } from './DeathFundTransaksiTab';
import { DeathFundLaporanTab } from './DeathFundLaporanTab';
import { DeathFundRekonsiliasiTab } from './DeathFundRekonsiliasiTab';

interface DeathFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRole | string;
  wargaList?: any[]; // For quick autofill from general warga if needed
}

export const DeathFundModal: React.FC<DeathFundModalProps> = ({
  isOpen,
  onClose,
  currentRole = 'BENDAHARA',
  wargaList = []
}) => {
  const [activeTab, setActiveTab] = useState<DeathFundTabType>('DASHBOARD');
  const [refreshKey, setRefreshKey] = useState(0);

  const activeRole = currentRole as UserRole;

  // Loaded State
  const [summary, setSummary] = useState(DeathFundService.getDashboardSummary());
  const [pesertaList, setPesertaList] = useState(DeathFundService.getPesertaList());
  const [tagihanList, setTagihanList] = useState(DeathFundService.getTagihanList());
  const [pemasukanList, setPemasukanList] = useState(DeathFundService.getPemasukanList());
  const [pengeluaranList, setPengeluaranList] = useState(DeathFundService.getPengeluaranList());
  const [kejadianList, setKejadianList] = useState(DeathFundService.getKejadianList());
  const [santunanList, setSantunanList] = useState(DeathFundService.getSantunanList());
  const [ledgerTx, setLedgerTx] = useState(DeathFundService.getLedgerTransactions());
  const [rekonsiliasiList, setRekonsiliasiList] = useState(DeathFundService.getRekonsiliasiList());
  const [auditLogs, setAuditLogs] = useState(DeathFundService.getAuditLogs());

  // Reload data
  const reloadData = () => {
    setSummary(DeathFundService.getDashboardSummary());
    setPesertaList(DeathFundService.getPesertaList());
    setTagihanList(DeathFundService.getTagihanList());
    setPemasukanList(DeathFundService.getPemasukanList());
    setPengeluaranList(DeathFundService.getPengeluaranList());
    setKejadianList(DeathFundService.getKejadianList());
    setSantunanList(DeathFundService.getSantunanList());
    setLedgerTx(DeathFundService.getLedgerTransactions());
    setRekonsiliasiList(DeathFundService.getRekonsiliasiList());
    setAuditLogs(DeathFundService.getAuditLogs());
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (isOpen) {
      DeathFundService.init();
      reloadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Actions Handlers
  const handleAddPeserta = (payload: any) => {
    DeathFundService.addPeserta(payload, { sessionId: `SESS-${Date.now()}`, userId: 'Pengurus RT 07', role: activeRole, isValid: true });
    reloadData();
  };

  const handleUpdatePeserta = (idPeserta: string, payload: any) => {
    DeathFundService.updatePeserta(idPeserta, payload, { sessionId: `SESS-${Date.now()}`, userId: 'Pengurus RT 07', role: activeRole, isValid: true });
    reloadData();
  };

  const handleUpdateStatusPeserta = (idPeserta: string, status: any) => {
    DeathFundService.updatePesertaStatus(idPeserta, status, { actor: 'Pengurus RT 07', role: activeRole });
    reloadData();
  };

  const handleGenerateInvoices = (bulan: string | number, tahun: number, nominal: number) => {
    const monthMap: Record<string, number> = {
      'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
      'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    };
    const monthNum = typeof bulan === 'number' ? bulan : (monthMap[bulan] || parseInt(bulan, 10) || 8);
    const res = DeathFundService.generateMonthlyInvoices(monthNum, tahun, nominal, { sessionId: `SESS-${Date.now()}`, userId: 'Bendahara Kas', role: activeRole, isValid: true });
    reloadData();
    const count = typeof res === 'number' ? res : res?.createdCount || 0;
    alert(`Berhasil membuat ${count} lembar tagihan iuran periode bulan ke-${monthNum} ${tahun}.`);
  };

  const handlePayInvoice = (tagihanId: string, payload: any) => {
    DeathFundService.payInvoice(tagihanId, payload, { sessionId: `SESS-${Date.now()}`, userId: 'Bendahara Kas', role: activeRole, isValid: true });
    reloadData();
  };

  const handleAddPemasukan = (payload: any) => {
    DeathFundService.addPemasukan(payload, { sessionId: `SESS-${Date.now()}`, userId: 'Bendahara Kas', role: activeRole, isValid: true });
    reloadData();
  };

  const handleAddPengeluaran = (payload: any) => {
    DeathFundService.addPengeluaran(payload, { sessionId: `SESS-${Date.now()}`, userId: 'Bendahara Kas', role: activeRole, isValid: true });
    reloadData();
  };

  const handleReportKejadian = (payload: any) => {
    DeathFundService.reportKejadian(payload, { sessionId: `SESS-${Date.now()}`, userId: 'Pelapor Warga / Pengurus', role: activeRole, isValid: true });
    reloadData();
  };

  const handleVerifyKejadian = (idKejadian: string, status: any) => {
    DeathFundService.verifyKejadian(idKejadian, status, { sessionId: `SESS-${Date.now()}`, userId: 'Ketua RT 07', role: activeRole, isValid: true });
    reloadData();
  };

  const handleCreateSantunanDraft = (kejadian: KejadianKematianDK) => {
    DeathFundService.createSantunan(
      {
        idKejadian: kejadian.idKejadian,
        namaPenerima: kejadian.namaKepalaKeluarga,
        hubunganPenerima: 'Ahli Waris / Kepala Keluarga',
        nominal: 1000000,
        jenisBantuan: 'Santunan Duka Cita Tunai',
        keterangan: `Santunan duka cita atas wafatnya Alm/Almh ${kejadian.namaAlmarhum}`
      },
      { actor: 'Seksi Sosial RT 07', role: activeRole }
    );
    reloadData();
    setActiveTab('SANTUNAN');
  };

  const handleApproveSantunan = (idSantunan: string) => {
    DeathFundService.approveSantunan(idSantunan, { sessionId: `SESS-${Date.now()}`, userId: 'Bpk Agus Santoso (Ketua RT)', role: activeRole, isValid: true });
    reloadData();
  };

  const handlePaySantunan = (idSantunan: string, payload: any) => {
    DeathFundService.disburseSantunan(idSantunan, payload, { actor: 'Ibu Siti (Bendahara)', role: activeRole });
    reloadData();
  };

  const handleAddRekonsiliasi = (payload: any) => {
    DeathFundService.addRekonsiliasi(payload, { actor: 'Tim Audit RT 07', role: activeRole });
    reloadData();
  };

  const handleExportBackup = () => {
    const jsonStr = DeathFundService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Dana_Kematian_RT07_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (jsonData: string) => {
    try {
      DeathFundService.importFullBackupJSON(jsonData, { actor: 'Administrator', role: currentRole });
      reloadData();
      alert('✅ Database Dana Kematian berhasil dipulihkan!');
    } catch (e: any) {
      alert(`Gagal impor: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-7xl h-[94vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        
        {/* TOP HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  🕊️ Modul Dana Kematian & Sosial Duka
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                  v1.0 Production
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FundType.DANA_KEMATIAN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                RT 07 RW 11 Griya Permata Alam (GPA) Ngijo, Karangploso • Terpisah & Terisolasi Penuh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 font-semibold">Peran Aktif:</div>
              <div className="text-xs font-bold text-teal-400">{currentRole}</div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Tutup Modul"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TAB BAR */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 overflow-x-auto shrink-0 flex items-center gap-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'DASHBOARD'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab('PESERTA')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PESERTA'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> Data Peserta ({pesertaList.length})
          </button>

          <button
            onClick={() => setActiveTab('IURAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'IURAN'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4" /> Iuran Warga ({tagihanList.length})
          </button>

          <button
            onClick={() => setActiveTab('PEMASUKAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PEMASUKAN'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pemasukan
          </button>

          <button
            onClick={() => setActiveTab('PENGELUARAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PENGELUARAN'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-600" /> Pengeluaran
          </button>

          <button
            onClick={() => setActiveTab('KEJADIAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'KEJADIAN'
                ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>🕯️</span> Kejadian Duka ({kejadianList.length})
          </button>

          <button
            onClick={() => setActiveTab('SANTUNAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'SANTUNAN'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-600" /> Santunan ({santunanList.length})
          </button>

          <button
            onClick={() => setActiveTab('TRANSAKSI')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'TRANSAKSI'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Buku Besar
          </button>

          <button
            onClick={() => setActiveTab('LAPORAN')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'LAPORAN'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" /> Laporan & Cetak
          </button>

          <button
            onClick={() => setActiveTab('REKONSILIASI')}
            className={`px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'REKONSILIASI'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4 text-teal-600" /> Rekonsiliasi & Audit
          </button>
        </div>

        {/* MAIN BODY CONTENT CONTAINER */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/60">
          {activeTab === 'DASHBOARD' && (
            <DeathFundDashboardTab
              stats={summary}
              summary={summary}
              onNavigateTab={(tab) => {
                const tabMap: Record<string, DeathFundTabType> = {
                  DASHBOARD: 'DASHBOARD',
                  PESERTA: 'PESERTA',
                  IURAN: 'IURAN',
                  PEMASUKAN: 'PEMASUKAN',
                  PENGELUARAN: 'PENGELUARAN',
                  KEJADIAN: 'KEJADIAN',
                  SANTUNAN: 'SANTUNAN',
                  TRANSAKSI: 'TRANSAKSI',
                  LAPORAN: 'LAPORAN',
                  REKONSILIASI: 'REKONSILIASI'
                };
                const upper = String(tab).toUpperCase();
                setActiveTab(tabMap[upper] || 'DASHBOARD');
              }}
              openNewPemasukan={() => setActiveTab('PEMASUKAN')}
              openNewPengeluaran={() => setActiveTab('PENGELUARAN')}
              openReportKejadian={() => setActiveTab('KEJADIAN')}
              openGenerateIuran={() => setActiveTab('IURAN')}
              recentTransactions={ledgerTx}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'PESERTA' && (
            <DeathFundPesertaTab
              pesertaList={pesertaList}
              onAddPeserta={handleAddPeserta}
              onUpdatePeserta={handleUpdatePeserta}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'IURAN' && (
            <DeathFundIuranTab
              invoices={tagihanList}
              pesertaList={pesertaList}
              onGenerateMonthly={(b, t, n) => handleGenerateInvoices(b, t, n)}
              onPayInvoice={handlePayInvoice}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'PEMASUKAN' && (
            <DeathFundPemasukanTab
              pemasukanList={pemasukanList}
              onAddPemasukan={handleAddPemasukan}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'PENGELUARAN' && (
            <DeathFundPengeluaranTab
              pengeluaranList={pengeluaranList}
              currentBalance={summary?.saldoTotal ?? 0}
              onAddPengeluaran={handleAddPengeluaran}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'KEJADIAN' && (
            <DeathFundKejadianTab
              kejadianList={kejadianList}
              pesertaList={pesertaList}
              onReportKejadian={handleReportKejadian}
              onVerifyKejadian={handleVerifyKejadian}
              onCreateSantunanDraft={handleCreateSantunanDraft}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'SANTUNAN' && (
            <DeathFundSantunanTab
              santunanList={santunanList}
              currentBalance={summary?.saldoTotal ?? 0}
              onApproveSantunan={handleApproveSantunan}
              onPaySantunan={handlePaySantunan}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'TRANSAKSI' && (
            <DeathFundTransaksiTab
              transactions={ledgerTx}
              currentRole={activeRole}
            />
          )}

          {activeTab === 'LAPORAN' && (
            <DeathFundLaporanTab
              pesertaList={pesertaList}
              tagihanList={tagihanList}
              pemasukanList={pemasukanList}
              pengeluaranList={pengeluaranList}
              kejadianList={kejadianList}
              santunanList={santunanList}
              saldoSaatIni={summary?.saldoTotal ?? 0}
            />
          )}

          {activeTab === 'REKONSILIASI' && (
            <DeathFundRekonsiliasiTab
              saldoSistem={summary?.saldoTotal ?? 0}
              rekonsiliasiList={rekonsiliasiList}
              auditLogs={auditLogs}
              onAddRekonsiliasi={handleAddRekonsiliasi}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              currentRole={activeRole}
            />
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Sistem Keuangan RT Terisolasi Mandiri: <strong>RT 07 RW 11 GPA Ngijo</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Pembaruan Sistem Realtime</span>
            <button
              onClick={reloadData}
              className="font-bold text-teal-700 hover:text-teal-900 transition-colors"
            >
              Sinkronkan Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
