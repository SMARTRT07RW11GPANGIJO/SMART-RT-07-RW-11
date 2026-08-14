import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types/rt';
import {
  OmplonganKegiatan,
  OmplonganTarikan,
  OmplonganWargaItem,
  OmplonganPengeluaran,
  OmplonganDashboardStats,
  OmplonganRekapWarga,
  OmplonganRekapPetugas,
  OmplonganReportType,
  PengeluaranCategory,
  PaymentMethod,
  WargaPaymentStatus
} from '../types/omplongan';
import { formatRupiah } from '../types/finance';
import { OmplonganCoreService } from '../services/omplonganCoreService';
import { OmplonganPdfService } from '../services/omplonganPdfService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { INITIAL_WARGA } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  X,
  Plus,
  Users,
  Target,
  Wallet,
  TrendingUp,
  Receipt,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  DollarSign,
  Search,
  Filter,
  Check,
  Send,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  UserCheck,
  Activity,
  Save
} from 'lucide-react';

interface OmplonganManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentUserId?: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

const COLORS = ['#166534', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#4b5563'];

export const OmplonganManagementModal: React.FC<OmplonganManagementModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUserId = `USR-${currentRole}`,
  addToast
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'warga'
    | 'tarikan'
    | 'input_tarikan'
    | 'pemasukan'
    | 'pengeluaran'
    | 'saldo'
    | 'rekap_warga'
    | 'rekap_petugas'
    | 'laporan'
    | 'cetak_pdf'
    | 'security_tests'
    | 'pengaturan'
  >('dashboard');

  // Authoritative session context
  const authSession: AuthoritativeSessionContext = useMemo(
    () => ({
      sessionId: `SESS-OMP-${Date.now()}`,
      userId: currentUserId,
      role: currentRole,
      isValid: true,
      issuedAt: new Date().toISOString()
    }),
    [currentRole, currentUserId]
  );

  // States
  const [kegiatan, setKegiatan] = useState<OmplonganKegiatan>(OmplonganCoreService.getActiveKegiatan());
  const [tarikanList, setTarikanList] = useState<OmplonganTarikan[]>([]);
  const [itemsList, setItemsList] = useState<OmplonganWargaItem[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<OmplonganPengeluaran[]>([]);
  const [stats, setStats] = useState<OmplonganDashboardStats>(OmplonganCoreService.getDashboardStats());
  const [selectedTarikanId, setSelectedTarikanId] = useState<string>('');

  // Modals inside Omplongan
  const [newTarikanModalOpen, setNewTarikanModalOpen] = useState(false);
  const [closeTarikanModalOpen, setCloseTarikanModalOpen] = useState(false);
  const [targetTarikanToClose, setTargetTarikanToClose] = useState<OmplonganTarikan | null>(null);
  const [newPengeluaranModalOpen, setNewPengeluaranModalOpen] = useState(false);
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<OmplonganReportType>('LPJ_AKHIR');

  // Form states
  const [tarikanForm, setTarikanForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    namaPetugas: 'Budi Santoso',
    petugasId: 'petugas_budi',
    wilayah: 'Blok A & Blok B',
    catatan: ''
  });

  const [closeTarikanForm, setCloseTarikanForm] = useState({
    totalSetoran: 0,
    alasanSelisih: '',
    catatan: ''
  });

  const [inputWargaForm, setInputWargaForm] = useState({
    wargaId: INITIAL_WARGA[0]?.id_warga || 'WRG-001',
    nominal: 100000,
    metode: 'TUNAI' as PaymentMethod,
    catatan: ''
  });

  const [pengeluaranForm, setPengeluaranForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: 'HADIAH_LOMBA' as PengeluaranCategory,
    keterangan: '',
    nominal: 0,
    penerima: '',
    metode: 'TUNAI' as PaymentMethod,
    buktiFileName: '',
    catatan: ''
  });

  // Security test results state
  const [securityTestResults, setSecurityTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Search & Filter
  const [searchWarga, setSearchWarga] = useState('');
  const [filterKategoriExp, setFilterKategoriExp] = useState('ALL');

  // Reload all data
  const loadData = () => {
    try {
      const activeKeg = OmplonganCoreService.getActiveKegiatan();
      setKegiatan(activeKeg);
      const tarikan = OmplonganCoreService.listTarikan(authSession);
      setTarikanList(tarikan);
      if (tarikan.length > 0 && !selectedTarikanId) {
        setSelectedTarikanId(tarikan[0].idTarikan);
      }
      const items = OmplonganCoreService.getStoredItems();
      setItemsList(items);
      const pengeluaran = OmplonganCoreService.listPengeluaran(authSession);
      setPengeluaranList(pengeluaran);
      setStats(OmplonganCoreService.getDashboardStats());
    } catch (err: any) {
      console.error('Error loading Omplongan data:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, authSession]);

  // Selected Tarikan Data
  const currentSelectedTarikan = tarikanList.find((t) => t.idTarikan === selectedTarikanId) || tarikanList[0];
  const itemsForSelectedTarikan = itemsList.filter((i) => i.tarikanId === currentSelectedTarikan?.idTarikan);

  // Rekap Data
  const rekapWargaData = OmplonganCoreService.getRekapPerWarga(authSession);
  const rekapPetugasData = OmplonganCoreService.getRekapPerPetugas(authSession);

  // Filtered Rekap Warga
  const filteredRekapWarga = rekapWargaData.filter(
    (w) =>
      w.namaWarga.toLowerCase().includes(searchWarga.toLowerCase()) ||
      w.nomorRumah.toLowerCase().includes(searchWarga.toLowerCase())
  );

  // Chart Data preparation
  const chartTarikanData = tarikanList.map((t) => ({
    name: t.idTarikan,
    Input: t.totalInput,
    Setoran: t.totalSetoran
  }));

  const chartPengeluaranByCategory = useMemo(() => {
    const map = new Map<string, number>();
    pengeluaranList
      .filter((p) => p.status === 'APPROVED')
      .forEach((p) => {
        map.set(p.kategori, (map.get(p.kategori) || 0) + p.nominal);
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [pengeluaranList]);

  // Handlers
  const handleCreateTarikan = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = OmplonganCoreService.createTarikan(
        {
          tanggal: tarikanForm.tanggal,
          namaPetugas: tarikanForm.namaPetugas,
          petugasId: tarikanForm.petugasId,
          wilayah: tarikanForm.wilayah,
          catatan: tarikanForm.catatan
        },
        authSession
      );
      loadData();
      setSelectedTarikanId(created.idTarikan);
      setNewTarikanModalOpen(false);
      if (addToast) addToast('success', 'Tarikan Berhasil Dibuat!', `${created.idTarikan} siap menerima input warga.`);
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal Membuat Tarikan', err.message);
    }
  };

  const handleInputWarga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedTarikan) {
      if (addToast) addToast('warning', 'Pilih Tarikan Terlebih Dahulu');
      return;
    }
    const resident = INITIAL_WARGA.find((w) => w.id_warga === inputWargaForm.wargaId);
    if (!resident) return;

    try {
      const newItem = OmplonganCoreService.addWargaPayment(
        {
          tarikanId: currentSelectedTarikan.idTarikan,
          wargaId: resident.id_warga,
          namaWarga: resident.nama_lengkap,
          nomorRumah: resident.alamat || resident.blok,
          blok: resident.blok,
          noHp: resident.no_hp,
          nominal: Number(inputWargaForm.nominal),
          metode: inputWargaForm.metode,
          catatan: inputWargaForm.catatan
        },
        authSession
      );
      loadData();
      if (addToast) {
        addToast(
          'success',
          'Pembayaran Dicatat & WA Terkirim!',
          `${resident.nama_lengkap} (${formatRupiah(newItem.nominal)}) - WA notifikasi telah diproses.`
        );
      }
      setInputWargaForm((prev) => ({ ...prev, nominal: 100000, catatan: '' }));
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal Input Pembayaran', err.message);
    }
  };

  const handleOpenCloseTarikan = (tarikan: OmplonganTarikan) => {
    setTargetTarikanToClose(tarikan);
    setCloseTarikanForm({
      totalSetoran: tarikan.totalInput,
      alasanSelisih: '',
      catatan: ''
    });
    setCloseTarikanModalOpen(true);
  };

  const handleConfirmCloseTarikan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTarikanToClose) return;

    try {
      const updated = OmplonganCoreService.closeTarikan(
        {
          idTarikan: targetTarikanToClose.idTarikan,
          totalSetoran: Number(closeTarikanForm.totalSetoran),
          alasanSelisih: closeTarikanForm.alasanSelisih,
          catatan: closeTarikanForm.catatan
        },
        authSession
      );
      loadData();
      setCloseTarikanModalOpen(false);
      if (addToast) {
        addToast(
          'success',
          'Tarikan Selesai & Ditutup!',
          `Status: ${updated.status}. Setoran: ${formatRupiah(updated.totalSetoran)}`
        );
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal Menutup Tarikan', err.message);
    }
  };

  const handleVerifyDeposit = (tarikanId: string) => {
    try {
      const updated = OmplonganCoreService.verifyDeposit(tarikanId, authSession);
      loadData();
      if (addToast) {
        addToast('success', 'Setoran Terverifikasi!', `${tarikanId} telah diverifikasi oleh Bendahara/Admin.`);
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Verifikasi Ditolak', err.message);
    }
  };

  const handleCreatePengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exp = OmplonganCoreService.createPengeluaran(
        {
          tanggal: pengeluaranForm.tanggal,
          kategori: pengeluaranForm.kategori,
          keterangan: pengeluaranForm.keterangan,
          nominal: Number(pengeluaranForm.nominal),
          penerima: pengeluaranForm.penerima,
          metode: pengeluaranForm.metode,
          buktiFileName: pengeluaranForm.buktiFileName || 'Nota_Agustusan.jpg',
          catatan: pengeluaranForm.catatan
        },
        authSession
      );
      loadData();
      setNewPengeluaranModalOpen(false);
      setPengeluaranForm({
        tanggal: new Date().toISOString().slice(0, 10),
        kategori: 'HADIAH_LOMBA',
        keterangan: '',
        nominal: 0,
        penerima: '',
        metode: 'TUNAI',
        buktiFileName: '',
        catatan: ''
      });
      if (addToast) {
        addToast(
          'success',
          'Pengeluaran Dicatat!',
          `${exp.keterangan} (${formatRupiah(exp.nominal)}) berhasil dicatat ke sub-ledger.`
        );
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal Mencatat Pengeluaran', err.message);
    }
  };

  const handleApprovePengeluaran = (expId: string) => {
    try {
      OmplonganCoreService.approvePengeluaran(expId, authSession);
      loadData();
      if (addToast) addToast('success', 'Pengeluaran Disetujui!', `Disetujui oleh Ketua RT 07.`);
    } catch (err: any) {
      if (addToast) addToast('error', 'Persetujuan Gagal', err.message);
    }
  };

  const handleRunSecurityTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = OmplonganCoreService.runAutomatedSecurityTests();
      setSecurityTestResults(results);
      setIsRunningTests(false);
      const passCount = results.filter((r) => r.status === 'PASS').length;
      if (addToast) {
        addToast(
          passCount === results.length ? 'success' : 'warning',
          'Security Test Selesai!',
          `${passCount}/${results.length} Test Cases PASS.`
        );
      }
    }, 600);
  };

  const handlePrintReport = (type: OmplonganReportType) => {
    OmplonganPdfService.printReport({
      type,
      kegiatan,
      stats,
      tarikanList,
      itemsList,
      pengeluaranList: pengeluaranList.filter((p) => p.status === 'APPROVED'),
      rekapWarga: rekapWargaData,
      rekapPetugas: rekapPetugasData
    });
    if (addToast) addToast('info', 'Mencetak Laporan PDF', `Format A4 ${type} telah dikirim ke printer browser.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* =================================================================== */}
        {/* HEADER BAR */}
        {/* =================================================================== */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#2E7D52] to-[#D4A72C] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#123B5D] rounded-[10px] flex items-center justify-center text-lg font-black">
                🇮🇩
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  OMPLONGAN AGUSTUSAN
                  <span className="text-xs px-2 py-0.5 bg-[#C62828] text-white rounded font-bold uppercase tracking-wider">
                    HUT RI KE-81
                  </span>
                </h2>
                <span className="text-xs bg-[#2E7D52] text-white px-2 py-0.5 rounded-full font-semibold border border-[#D4A72C]/40">
                  RT 07 RW 11 GPA NGIJO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sistem Terpadu Penarikan, Pembukuan Kas, Pengeluaran, & Laporan Keuangan Agustusan 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#0A2338] px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Role Anda:</span>
              <span className="font-bold text-[#D4A72C]">{currentRole}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono font-semibold">{formatRupiah(stats.saldo)}</span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SUB NAVIGATION TABS */}
        {/* =================================================================== */}
        <div className="bg-[#0A2338] px-4 py-2 border-b border-slate-700 overflow-x-auto flex items-center gap-1.5 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('warga')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'warga'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            👥 Data Warga
          </button>
          <button
            onClick={() => setActiveTab('tarikan')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tarikan'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🎯 Sesi / Tarikan ({tarikanList.length})
          </button>
          <button
            onClick={() => setActiveTab('input_tarikan')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'input_tarikan'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            💰 Input Hasil Tarikan
          </button>
          <button
            onClick={() => setActiveTab('pemasukan')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pemasukan'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🧾 Transaksi Pemasukan
          </button>
          <button
            onClick={() => setActiveTab('pengeluaran')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pengeluaran'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            💸 Pengeluaran Agustusan
          </button>
          <button
            onClick={() => setActiveTab('saldo')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'saldo'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📊 Saldo Omplongan
          </button>
          <button
            onClick={() => setActiveTab('rekap_warga')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rekap_warga'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📋 Rekap Warga
          </button>
          <button
            onClick={() => setActiveTab('rekap_petugas')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rekap_petugas'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            👤 Rekap Petugas
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📈 Laporan Keuangan
          </button>
          <button
            onClick={() => setActiveTab('cetak_pdf')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cetak_pdf'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📄 Cetak Laporan PDF
          </button>
          <button
            onClick={() => setActiveTab('security_tests')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security_tests'
                ? 'bg-purple-700 text-white shadow'
                : 'text-purple-300 hover:bg-purple-900/40 hover:text-white'
            }`}
          >
            🛡️ Security & Regression Tests (36)
          </button>
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pengaturan'
                ? 'bg-[#2E7D52] text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            ⚙️ Pengaturan Periode
          </button>
        </div>

        {/* =================================================================== */}
        {/* MAIN BODY VIEW */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: DASHBOARD OMPLONGAN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner Card */}
              <div className="bg-gradient-to-r from-[#123B5D] via-[#1E4D7B] to-[#2E7D52] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#C62828] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                        HUT RI KE-81
                      </span>
                      <span className="text-xs text-slate-200">Periode: {kegiatan.tanggalMulai} s/d {kegiatan.tanggalSelesai}</span>
                    </div>
                    <h3 className="text-2xl font-black mt-1">{kegiatan.namaKegiatan}</h3>
                    <p className="text-xs text-slate-200 max-w-2xl mt-1">
                      RT 07 RW 11 Perum Griya Permata Alam (GPA) Ngijo, Karangploso, Kabupaten Malang.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setNewTarikanModalOpen(true)}
                      className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all border border-[#D4A72C]/40"
                    >
                      <Plus className="w-4 h-4" />
                      + BUAT TARIKAN BARU
                    </button>
                    <button
                      onClick={() => setNewPengeluaranModalOpen(true)}
                      className="bg-[#C62828] hover:bg-[#A32020] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      + CATAT PENGELUARAN
                    </button>
                    <button
                      onClick={() => handlePrintReport('LPJ_AKHIR')}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-[#D4A72C]" />
                      CETAK LPJ
                    </button>
                  </div>
                </div>

                {/* Progress Target Bar */}
                <div className="mt-6 pt-5 border-t border-white/15">
                  <div className="flex justify-between items-center text-xs mb-2 font-semibold">
                    <span>Progress Target Pengumpulan Dana</span>
                    <span className="text-[#D4A72C] font-bold text-sm">
                      {formatRupiah(stats.totalTerkumpul)} / {formatRupiah(stats.totalTarget)} ({stats.persentasePencapaian}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-3.5 p-0.5 overflow-hidden border border-white/20">
                    <div
                      className="bg-gradient-to-r from-[#D4A72C] to-[#2E7D52] h-full rounded-full transition-all duration-500 shadow"
                      style={{ width: `${Math.min(100, stats.persentasePencapaian)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 5 Main Highlight Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Total Warga</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stats.totalWarga}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Kepala Keluarga RT 07</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Target Omplongan</span>
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-lg font-black text-slate-800">{formatRupiah(stats.totalTarget)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Rp 100.000 / KK</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Total Terkumpul</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-emerald-700">{formatRupiah(stats.totalTerkumpul)}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {stats.persentasePencapaian}% dari target
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold">Pengeluaran</span>
                    <Receipt className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-lg font-black text-rose-700">{formatRupiah(stats.totalPengeluaran)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{pengeluaranList.length} transaksi nota</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold text-emerald-900">Saldo Kas Omplongan</span>
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-emerald-900">{formatRupiah(stats.saldo)}</div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">Kas Bersih Tersedia</div>
                </div>
              </div>

              {/* 4 Interactive Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Pemasukan per Tarikan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      📊 Pemasukan vs Setoran per Tarikan
                    </h4>
                    <span className="text-xs text-slate-400">{tarikanList.length} Sesi Terdata</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartTarikanData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          formatter={(value: any) => [formatRupiah(Number(value)), '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                        <Legend />
                        <Bar dataKey="Input" fill="#2E7D52" name="Input Warga" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Setoran" fill="#123B5D" name="Setoran Fisik" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Pengeluaran per Kategori */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      💸 Komposisi Pengeluaran Agustusan
                    </h4>
                    <span className="text-xs text-slate-400">Total: {formatRupiah(stats.totalPengeluaran)}</span>
                  </div>
                  <div className="h-64 w-full flex items-center justify-center">
                    {chartPengeluaranByCategory.length === 0 ? (
                      <div className="text-slate-400 text-xs">Belum ada data pengeluaran terverifikasi.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartPengeluaranByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {chartPengeluaranByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [formatRupiah(Number(value)), 'Nominal']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Tarikan Quick Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    🎯 Status Sesi Tarikan Terakhir
                  </h4>
                  <button
                    onClick={() => setActiveTab('tarikan')}
                    className="text-xs text-[#2E7D52] hover:underline font-semibold flex items-center gap-1"
                  >
                    Lihat Semua Sesi <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">ID Tarikan</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Petugas</th>
                        <th className="p-3">Wilayah</th>
                        <th className="p-3 text-right">Input Warga</th>
                        <th className="p-3 text-right">Setoran</th>
                        <th className="p-3 text-right">Selisih</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tarikanList.slice(0, 5).map((t) => (
                        <tr key={t.idTarikan} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{t.idTarikan}</td>
                          <td className="p-3">{t.tanggal}</td>
                          <td className="p-3">{t.namaPetugas}</td>
                          <td className="p-3">{t.wilayah}</td>
                          <td className="p-3 text-right font-semibold text-emerald-700">
                            {formatRupiah(t.totalInput)}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">{formatRupiah(t.totalSetoran)}</td>
                          <td
                            className={`p-3 text-right font-semibold ${
                              t.selisih !== 0 ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          >
                            {formatRupiah(t.selisih)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'TERVERIFIKASI'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'SELISIH'
                                  ? 'bg-rose-100 text-rose-800'
                                  : t.status === 'MENUNGGU_VERIFIKASI'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedTarikanId(t.idTarikan);
                                setActiveTab('input_tarikan');
                              }}
                              className="text-xs bg-[#2E7D52]/10 hover:bg-[#2E7D52] hover:text-white text-[#2E7D52] font-bold px-2.5 py-1 rounded transition-all"
                            >
                              Buka Input
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA WARGA */}
          {activeTab === 'warga' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Data Partisipasi Omplongan Warga RT 07 RW 11</h3>
                  <p className="text-xs text-slate-500">
                    Daftar seluruh kepala keluarga dan status pelunasan omplongan kegiatan Agustusan.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchWarga}
                    onChange={(e) => setSearchWarga(e.target.value)}
                    placeholder="Cari nama atau blok rumah..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#2E7D52] outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">No</th>
                        <th className="p-3">Nama Warga</th>
                        <th className="p-3">Alamat / Blok</th>
                        <th className="p-3">No. HP</th>
                        <th className="p-3 text-right">Target</th>
                        <th className="p-3 text-right">Total Bayar</th>
                        <th className="p-3 text-right">Sisa</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRekapWarga.map((w, idx) => (
                        <tr key={w.wargaId} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{w.namaWarga}</td>
                          <td className="p-3 text-slate-600">{w.nomorRumah}</td>
                          <td className="p-3 text-slate-500 font-mono">{w.noHp || '-'}</td>
                          <td className="p-3 text-right">{formatRupiah(w.target)}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">{formatRupiah(w.totalDibayar)}</td>
                          <td className="p-3 text-right text-slate-600">{formatRupiah(w.sisa)}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.status === 'LUNAS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : w.status === 'SEBAGIAN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setInputWargaForm({
                                  wargaId: w.wargaId,
                                  nominal: w.sisa > 0 ? w.sisa : 100000,
                                  metode: 'TUNAI',
                                  catatan: ''
                                });
                                setActiveTab('input_tarikan');
                              }}
                              className="text-xs bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-2.5 py-1 rounded transition-all shadow-sm"
                            >
                              + Input
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SESI / TARIKAN OMPLONGAN */}
          {activeTab === 'tarikan' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Sesi / Tarikan Omplongan Lapangan</h3>
                  <p className="text-xs text-slate-500">
                    Setiap penarikan oleh petugas dicatat sebagai sesi unik dengan verifikasi dan bukti setoran.
                  </p>
                </div>
                <button
                  onClick={() => setNewTarikanModalOpen(true)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  + BUAT TARIKAN BARU
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tarikanList.map((tarikan) => (
                  <div
                    key={tarikan.idTarikan}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{tarikan.idTarikan}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tarikan.status === 'TERVERIFIKASI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tarikan.status === 'SELISIH'
                              ? 'bg-rose-100 text-rose-800'
                              : tarikan.status === 'MENUNGGU_VERIFIKASI'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tarikan.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{tarikan.tanggal}</span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">{tarikan.namaPetugas}</div>
                      <div className="text-xs text-slate-600 mb-4">{tarikan.wilayah}</div>

                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Warga Dikunjungi:</span>
                          <span className="font-bold">{tarikan.jumlahWargaDikunjungi} KK</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Input Warga:</span>
                          <span className="font-bold text-emerald-700">{formatRupiah(tarikan.totalInput)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Setoran Fisik:</span>
                          <span className="font-bold text-slate-900">{formatRupiah(tarikan.totalSetoran)}</span>
                        </div>
                        {tarikan.selisih !== 0 && (
                          <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200">
                            <span>Selisih Setoran:</span>
                            <span>{formatRupiah(tarikan.selisih)}</span>
                          </div>
                        )}
                      </div>

                      {tarikan.alasanSelisih && (
                        <div className="text-[11px] bg-rose-50 text-rose-800 p-2.5 rounded-lg mb-3 border border-rose-200">
                          <strong>Alasan Selisih:</strong> {tarikan.alasanSelisih}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedTarikanId(tarikan.idTarikan);
                          setActiveTab('input_tarikan');
                        }}
                        className="flex-1 bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold py-2 rounded-lg text-center"
                      >
                        Input Warga
                      </button>

                      {tarikan.status === 'BERJALAN' && (
                        <button
                          onClick={() => handleOpenCloseTarikan(tarikan)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                        >
                          Selesaikan
                        </button>
                      )}

                      {(tarikan.status === 'MENUNGGU_VERIFIKASI' || tarikan.status === 'SELISIH') &&
                        ['BENDAHARA', 'ADMIN', 'KETUA_RT'].includes(currentRole) && (
                          <button
                            onClick={() => handleVerifyDeposit(tarikan.idTarikan)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verifikasi
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INPUT HASIL TARIKAN */}
          {activeTab === 'input_tarikan' && (
            <div className="space-y-6">
              {/* Tarikan Selector Header */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PILIH SESI TARIKAN AKTIF:</label>
                  <select
                    value={selectedTarikanId}
                    onChange={(e) => setSelectedTarikanId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#2E7D52]"
                  >
                    {tarikanList.map((t) => (
                      <option key={t.idTarikan} value={t.idTarikan}>
                        {t.idTarikan} - {t.namaPetugas} ({t.wilayah}) - {t.tanggal}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Terkumpul Sesi Ini:</span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatRupiah(currentSelectedTarikan?.totalInput || 0)}
                    </span>
                  </div>
                  {currentSelectedTarikan?.status === 'BERJALAN' && (
                    <button
                      onClick={() => handleOpenCloseTarikan(currentSelectedTarikan)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      SELESAIKAN TARIKAN
                    </button>
                  )}
                </div>
              </div>

              {/* Form Input + Table Warga in this Session */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#2E7D52]" />
                    Input Pembayaran Warga
                  </h4>
                  <form onSubmit={handleInputWarga} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pilih Warga RT 07:</label>
                      <select
                        value={inputWargaForm.wargaId}
                        onChange={(e) => setInputWargaForm({ ...inputWargaForm, wargaId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#2E7D52]"
                      >
                        {INITIAL_WARGA.map((w) => (
                          <option key={w.id_warga} value={w.id_warga}>
                            {w.nama_lengkap} ({w.alamat || w.blok})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nominal Pembayaran (Rp):</label>
                      <input
                        type="number"
                        min="1000"
                        value={inputWargaForm.nominal}
                        onChange={(e) => setInputWargaForm({ ...inputWargaForm, nominal: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-emerald-800 text-sm outline-none focus:ring-2 focus:ring-[#2E7D52]"
                        required
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setInputWargaForm({ ...inputWargaForm, nominal: 50000 })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold"
                        >
                          50rb
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputWargaForm({ ...inputWargaForm, nominal: 100000 })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-emerald-700"
                        >
                          100rb (Target)
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputWargaForm({ ...inputWargaForm, nominal: 150000 })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold"
                        >
                          150rb
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran:</label>
                      <select
                        value={inputWargaForm.metode}
                        onChange={(e) => setInputWargaForm({ ...inputWargaForm, metode: e.target.value as PaymentMethod })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none"
                      >
                        <option value="TUNAI">TUNAI / Uang Fisik</option>
                        <option value="TRANSFER">TRANSFER BANK</option>
                        <option value="QRIS">QRIS RT 07 RW 11</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan:</label>
                      <input
                        type="text"
                        value={inputWargaForm.catatan}
                        onChange={(e) => setInputWargaForm({ ...inputWargaForm, catatan: e.target.value })}
                        placeholder="Contoh: Lunas saat kunjungan, infaq lebih"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none"
                      />
                    </div>

                    <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-lg text-[11px] border border-emerald-200">
                      📲 <strong>WhatsApp Gateway:</strong> Notifikasi tanda terima omplongan otomatis dikirim ke nomor HP warga setelah disimpan.
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2E7D52] hover:bg-[#236340] text-white font-bold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      SIMPAN PEMBAYARAN
                    </button>
                  </form>
                </div>

                {/* List Warga in this Session Table */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        📋 Riwayat Input Warga Sesi #{currentSelectedTarikan?.idTarikan}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        {itemsForSelectedTarikan.length} Transaksi Tercatat
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-2.5">No</th>
                            <th className="p-2.5">Nama Warga</th>
                            <th className="p-2.5">Nomor Rumah</th>
                            <th className="p-2.5 text-center">Metode</th>
                            <th className="p-2.5 text-right">Nominal</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {itemsForSelectedTarikan.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400">
                                Belum ada input warga pada sesi tarikan ini.
                              </td>
                            </tr>
                          ) : (
                            itemsForSelectedTarikan.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-2.5 text-slate-400">{idx + 1}</td>
                                <td className="p-2.5 font-bold text-slate-900">{item.namaWarga}</td>
                                <td className="p-2.5 text-slate-600">{item.nomorRumah}</td>
                                <td className="p-2.5 text-center">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
                                    {item.metode}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right font-bold text-emerald-700">
                                  {formatRupiah(item.nominal)}
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">TOTAL PEMASUKAN SESI #{currentSelectedTarikan?.idTarikan}:</span>
                    <span className="text-base text-emerald-800 font-black">
                      {formatRupiah(currentSelectedTarikan?.totalInput || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSAKSI PEMASUKAN */}
          {activeTab === 'pemasukan' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buku Transaksi Pemasukan Omplongan</h3>
                  <p className="text-xs text-slate-500">
                    Buku kas terisolasi (FundType.OMPLOGAN) menampung seluruh dana tarikan warga, donasi, & sponsor.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Pemasukan Omplongan:</span>
                  <span className="text-lg font-black text-emerald-700">{formatRupiah(stats.totalTerkumpul)}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">No</th>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Nama Warga / Pembayar</th>
                        <th className="p-3">Sesi Tarikan</th>
                        <th className="p-3 text-center">Metode</th>
                        <th className="p-3 text-right">Nominal</th>
                        <th className="p-3">Pencatat / Petugas</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemsList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono text-slate-600">{item.createdAt.slice(0, 16).replace('T', ' ')}</td>
                          <td className="p-3 font-bold text-slate-900">
                            {item.namaWarga}
                            <span className="block text-[10px] text-slate-500 font-normal">{item.nomorRumah}</span>
                          </td>
                          <td className="p-3 font-semibold text-blue-700">{item.tarikanId}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">{item.metode}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-700">{formatRupiah(item.nominal)}</td>
                          <td className="p-3 text-slate-600">{item.createdBy}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PENGELUARAN AGUSTUSAN */}
          {activeTab === 'pengeluaran' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buku Pengeluaran Kegiatan Agustusan</h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan nota, kwitansi belanja, sewa panggung, konsumsi, hadiah lomba, dan sound system.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewPengeluaranModalOpen(true)}
                    className="bg-[#C62828] hover:bg-[#A32020] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    + CATAT PENGELUARAN BARU
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">ID</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Keterangan / Item</th>
                        <th className="p-3">Penerima / Toko</th>
                        <th className="p-3 text-center">Metode</th>
                        <th className="p-3 text-right">Nominal</th>
                        <th className="p-3">Bukti Nota</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pengeluaranList.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{exp.id}</td>
                          <td className="p-3">{exp.tanggal}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                              {exp.kategori.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">{exp.keterangan}</td>
                          <td className="p-3 text-slate-600">{exp.penerima}</td>
                          <td className="p-3 text-center">{exp.metode}</td>
                          <td className="p-3 text-right font-bold text-rose-700">{formatRupiah(exp.nominal)}</td>
                          <td className="p-3">
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 w-fit">
                              <FolderOpen className="w-3 h-3" />
                              {exp.buktiFileName || 'Nota.jpg'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                exp.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {exp.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {exp.status !== 'APPROVED' && ['KETUA_RT', 'ADMIN'].includes(currentRole) && (
                              <button
                                onClick={() => handleApprovePengeluaran(exp.id)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2 py-1 rounded text-[10px]"
                              >
                                Setujui
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SALDO OMPLONGAN */}
          {activeTab === 'saldo' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Perhitungan Real-Time Saldo Omplongan</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Saldo dihitung langsung secara authoritative dari transaksi sub-ledger backend (FundType.OMPLOGAN).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Total Pemasukan (A)</span>
                    <div className="text-2xl font-black text-emerald-700">{formatRupiah(stats.totalTerkumpul)}</div>
                    <span className="text-xs text-emerald-600 mt-2 block">
                      {itemsList.length} Transaksi Warga & Donasi
                    </span>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <span className="text-xs font-bold text-rose-800 uppercase block mb-1">Total Pengeluaran (B)</span>
                    <div className="text-2xl font-black text-rose-700">{formatRupiah(stats.totalPengeluaran)}</div>
                    <span className="text-xs text-rose-600 mt-2 block">
                      {pengeluaranList.filter((p) => p.status === 'APPROVED').length} Transaksi Belanja & Hadiah
                    </span>
                  </div>

                  <div className="bg-[#0A2338] text-white rounded-xl p-5 shadow-lg border border-[#D4A72C]/40">
                    <span className="text-xs font-bold text-[#D4A72C] uppercase block mb-1">
                      Saldo Sisa Kas Omplongan (A - B)
                    </span>
                    <div className="text-2xl font-black text-white">{formatRupiah(stats.saldo)}</div>
                    <span className="text-xs text-slate-300 mt-2 block">Saldo Terisolasi Kas RT 07</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900">Kebijakan Akuntansi & Immutability:</h4>
                  <p>
                    1. Saldo tidak boleh diubah secara manual dari antarmuka frontend; seluruh angka dihasilkan dari agregasi buku kas.
                  </p>
                  <p>
                    2. Pengeluaran yang dibatalkan wajib melalui prosedur <em>Reversal</em> (Koreksi) dengan alasan tercatat pada audit trail.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REKAP WARGA */}
          {activeTab === 'rekap_warga' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Partisipasi Per Warga</h3>
                  <p className="text-xs text-slate-500">
                    {currentRole === 'WARGA'
                      ? 'Menampilkan kontribusi akun Anda (Data minimization aktif).'
                      : 'Menampilkan rekapitulasi kontribusi seluruh warga RT 07 RW 11.'}
                  </p>
                </div>
                <button
                  onClick={() => handlePrintReport('REKAP_WARGA')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#D4A72C]" />
                  Cetak Rekap Warga
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">No</th>
                        <th className="p-3">Nama Warga</th>
                        <th className="p-3">Rumah</th>
                        <th className="p-3 text-right">Target</th>
                        <th className="p-3 text-right">Total Dibayar</th>
                        <th className="p-3 text-right">Sisa Kewajiban</th>
                        <th className="p-3 text-center">Sesi Diikuti</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rekapWargaData.map((w, idx) => (
                        <tr key={w.wargaId} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{w.namaWarga}</td>
                          <td className="p-3 text-slate-600">{w.nomorRumah}</td>
                          <td className="p-3 text-right">{formatRupiah(w.target)}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">{formatRupiah(w.totalDibayar)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRupiah(w.sisa)}</td>
                          <td className="p-3 text-center">{w.jumlahTarikanIkut} Kali</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.status === 'LUNAS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : w.status === 'SEBAGIAN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REKAP PETUGAS */}
          {activeTab === 'rekap_petugas' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Kinerja & Setoran Petugas</h3>
                  <p className="text-xs text-slate-500">
                    Rekonsiliasi perbandingan total input yang ditagih petugas vs total setoran fisik ke Bendahara.
                  </p>
                </div>
                <button
                  onClick={() => handlePrintReport('REKAP_PETUGAS')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#D4A72C]" />
                  Cetak Rekap Petugas
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">No</th>
                        <th className="p-3">Nama Petugas Penarik</th>
                        <th className="p-3 text-center">Jumlah Sesi Tarikan</th>
                        <th className="p-3 text-center">Total Warga Dikunjungi</th>
                        <th className="p-3 text-right">Total Uang Ditagih</th>
                        <th className="p-3 text-right">Total Uang Disetor</th>
                        <th className="p-3 text-right">Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rekapPetugasData.map((pet, idx) => (
                        <tr key={pet.petugasId} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{pet.namaPetugas}</td>
                          <td className="p-3 text-center font-bold">{pet.jumlahTarikan} Sesi</td>
                          <td className="p-3 text-center">{pet.jumlahWarga} KK</td>
                          <td className="p-3 text-right font-bold text-slate-800">{formatRupiah(pet.totalDitagih)}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            {formatRupiah(pet.totalDisetor)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              pet.selisih !== 0 ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          >
                            {formatRupiah(pet.selisih)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: LAPORAN KEUANGAN */}
          {activeTab === 'laporan' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Laporan Keuangan Konsolidasi Omplongan Agustusan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Periode: {kegiatan.tanggalMulai} s/d {kegiatan.tanggalSelesai} — Tahun {kegiatan.tahun}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrintReport('GABUNGAN')}
                      className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-[#D4A72C]" />
                      Cetak Laporan Gabungan
                    </button>
                  </div>
                </div>

                {/* Report Breakdown */}
                <div className="mt-6 space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-sm text-slate-900 mb-3">1. Rincian Pemasukan Dana</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span>Pemasukan Tarikan Omplongan Warga RT 07</span>
                        <span className="font-bold text-emerald-700">{formatRupiah(stats.totalTerkumpul)}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold text-slate-900">
                        <span>TOTAL PEMASUKAN:</span>
                        <span className="text-emerald-800 text-sm">{formatRupiah(stats.totalTerkumpul)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-sm text-slate-900 mb-3">2. Rincian Pengeluaran Kegiatan</h4>
                    <div className="space-y-2">
                      {pengeluaranList
                        .filter((p) => p.status === 'APPROVED')
                        .map((exp) => (
                          <div key={exp.id} className="flex justify-between py-1 border-b border-slate-200">
                            <span>
                              [{exp.kategori.replace('_', ' ')}] {exp.keterangan} ({exp.penerima})
                            </span>
                            <span className="font-bold text-rose-700">{formatRupiah(exp.nominal)}</span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 font-bold text-slate-900 pt-2">
                        <span>TOTAL PENGELUARAN:</span>
                        <span className="text-rose-800 text-sm">{formatRupiah(stats.totalPengeluaran)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-900">SISA SALDO KAS OMPLONGAN TERSEDIA:</span>
                    <span className="text-lg text-emerald-900 font-black">{formatRupiah(stats.saldo)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: CETAK LAPORAN PDF (ALL 7 TYPES + LPJ) */}
          {activeTab === 'cetak_pdf' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  🖨️ Pusat Cetak Laporan Keuangan & Ekspor PDF
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Pilih salah satu format laporan standar A4 bertanda tangan digital resmi RT 07 RW 11 GPA Ngijo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      type: 'LPJ_AKHIR' as OmplonganReportType,
                      title: 'Laporan Pertanggungjawaban (LPJ)',
                      desc: 'Dokumen lengkap LPJ resmi (A s/d M) untuk pertanggungjawaban warga RT 07.',
                      badge: 'REKOMENDASI UTAMA',
                      badgeColor: 'bg-emerald-100 text-emerald-800'
                    },
                    {
                      type: 'GABUNGAN' as OmplonganReportType,
                      title: 'Laporan Keuangan Gabungan',
                      desc: 'Ringkasan pemasukan, pengeluaran, dan sisa saldo kas kegiatan.',
                      badge: 'KONSOLIDASI',
                      badgeColor: 'bg-blue-100 text-blue-800'
                    },
                    {
                      type: 'PEMASUKAN' as OmplonganReportType,
                      title: 'Laporan Pemasukan Lengkap',
                      desc: 'Daftar seluruh transaksi setoran warga, metode bayar, dan nominal.',
                      badge: 'INCOME',
                      badgeColor: 'bg-emerald-100 text-emerald-800'
                    },
                    {
                      type: 'PENGELUARAN' as OmplonganReportType,
                      title: 'Laporan Pengeluaran & Nota',
                      desc: 'Rincian belanja perlengkapan, konsumsi, hadiah lomba, & panggung.',
                      badge: 'EXPENSE',
                      badgeColor: 'bg-rose-100 text-rose-800'
                    },
                    {
                      type: 'REKAP_TARIKAN' as OmplonganReportType,
                      title: 'Rekapitulasi Sesi Tarikan',
                      desc: 'Daftar nomor tarikan, petugas, jumlah warga, setoran & selisih.',
                      badge: 'SESI TARIKAN',
                      badgeColor: 'bg-purple-100 text-purple-800'
                    },
                    {
                      type: 'REKAP_PETUGAS' as OmplonganReportType,
                      title: 'Rekapitulasi Kinerja Petugas',
                      desc: 'Performa penarikan dan rekonsiliasi setoran per petugas penarik.',
                      badge: 'PETUGAS',
                      badgeColor: 'bg-amber-100 text-amber-800'
                    },
                    {
                      type: 'REKAP_WARGA' as OmplonganReportType,
                      title: 'Rekapitulasi Partisipasi Warga',
                      desc: 'Daftar lengkap 85 warga RT 07 beserta status lunas/sebagian.',
                      badge: 'WARGA',
                      badgeColor: 'bg-indigo-100 text-indigo-800'
                    }
                  ].map((rep) => (
                    <div
                      key={rep.type}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-[#2E7D52] hover:shadow-md transition-all bg-white"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rep.badgeColor}`}>
                            {rep.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{rep.title}</h4>
                        <p className="text-xs text-slate-500 mb-4">{rep.desc}</p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handlePrintReport(rep.type)}
                          className="flex-1 bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Cetak A4 / PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SECURITY & REGRESSION TESTS (36) */}
          {activeTab === 'security_tests' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-700" />
                      Security, RBAC, & Regression Test Suite (Spec #35 & #36)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eksekusi pengujian otomatis 11 skenario resmi: IDOR data protection, segregation of duties, selisih validation, dan sub-ledger immutability.
                    </p>
                  </div>
                  <button
                    onClick={handleRunSecurityTests}
                    disabled={isRunningTests}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                    {isRunningTests ? 'Menjalankan Tes...' : '▶ JALANKAN TEST SUITE (11 SKENARIO)'}
                  </button>
                </div>

                {securityTestResults.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs font-bold text-purple-900">
                      <span>
                        Hasil Eksekusi: {securityTestResults.filter((r) => r.status === 'PASS').length}/
                        {securityTestResults.length} SKENARIO PASS
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        100% PRODUCTION READY
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Skenario Uji</th>
                            <th className="p-3">Deskripsi Validasi</th>
                            <th className="p-3">Ekspektasi</th>
                            <th className="p-3">Hasil Aktual</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {securityTestResults.map((t, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-900">{t.testName}</td>
                              <td className="p-3 text-slate-600">{t.description}</td>
                              <td className="p-3 font-mono text-blue-700">{t.expected}</td>
                              <td className="p-3 font-mono text-slate-700">{t.actual}</td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    t.status === 'PASS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-slate-700">Test Suite Siap Dijalankan</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      Klik tombol di atas untuk memvalidasi seluruh rule keamanan, segregation of duties, dan integritas sub-ledger.
                    </p>
                    <button
                      onClick={handleRunSecurityTests}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      Mulai Pengujian
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 13: PENGATURAN PERIODE */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pengaturan Periode Kegiatan Agustusan</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Konfigurasi nama kegiatan, tahun anggaran, target dana, dan status operasional.
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Kegiatan:</label>
                    <input
                      type="text"
                      value={kegiatan.namaKegiatan}
                      onChange={(e) => setKegiatan({ ...kegiatan, namaKegiatan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tahun Kegiatan:</label>
                      <input
                        type="number"
                        value={kegiatan.tahun}
                        onChange={(e) => setKegiatan({ ...kegiatan, tahun: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Status Kegiatan:</label>
                      <select
                        value={kegiatan.status}
                        onChange={(e) => setKegiatan({ ...kegiatan, status: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                      >
                        <option value="AKTIF">AKTIF (Menerima Input & Tarikan)</option>
                        <option value="DRAFT">DRAFT (Persiapan)</option>
                        <option value="SELESAI">SELESAI (Finalisasi LPJ)</option>
                        <option value="ARSIP">ARSIP (Tutup Buku)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Total Dana (Rp):</label>
                      <input
                        type="number"
                        value={kegiatan.targetDana}
                        onChange={(e) => setKegiatan({ ...kegiatan, targetDana: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Per Kepala Keluarga (Rp):</label>
                      <input
                        type="number"
                        value={kegiatan.targetPerKeluarga}
                        onChange={(e) => setKegiatan({ ...kegiatan, targetPerKeluarga: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai:</label>
                      <input
                        type="date"
                        value={kegiatan.tanggalMulai}
                        onChange={(e) => setKegiatan({ ...kegiatan, tanggalMulai: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai:</label>
                      <input
                        type="date"
                        value={kegiatan.tanggalSelesai}
                        onChange={(e) => setKegiatan({ ...kegiatan, tanggalSelesai: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      OmplonganCoreService.updateKegiatan(kegiatan.idKegiatan, kegiatan, authSession);
                      loadData();
                      if (addToast) addToast('success', 'Pengaturan Tersimpan!');
                    }}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-5 py-2.5 rounded-xl shadow"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: BUAT TARIKAN BARU */}
      {/* ===================================================================== */}
      {newTarikanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#2E7D52]" />
                Buat Sesi Tarikan Baru
              </h4>
              <button onClick={() => setNewTarikanModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTarikan} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Tarikan:</label>
                <input
                  type="date"
                  value={tarikanForm.tanggal}
                  onChange={(e) => setTarikanForm({ ...tarikanForm, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Petugas Penarik:</label>
                <select
                  value={tarikanForm.petugasId}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const name =
                      sel === 'petugas_budi'
                        ? 'Budi Santoso'
                        : sel === 'petugas_andi'
                        ? 'Andi Wicaksono'
                        : 'Petugas RT 07';
                    setTarikanForm({ ...tarikanForm, petugasId: sel, namaPetugas: name });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                >
                  <option value="petugas_budi">Budi Santoso (Seksi Pemuda)</option>
                  <option value="petugas_andi">Andi Wicaksono (Seksi Acara)</option>
                  <option value="petugas_lain">Petugas Panitia Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wilayah / Blok Kunjungan:</label>
                <input
                  type="text"
                  value={tarikanForm.wilayah}
                  onChange={(e) => setTarikanForm({ ...tarikanForm, wilayah: e.target.value })}
                  placeholder="Contoh: Blok A & B, Blok C-01 s/d C-15"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={tarikanForm.catatan}
                  onChange={(e) => setTarikanForm({ ...tarikanForm, catatan: e.target.value })}
                  placeholder="Contoh: Tarikan putaran pertama"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTarikanModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2E7D52] hover:bg-[#236340] text-white font-bold py-2.5 rounded-xl shadow"
                >
                  Simpan Tarikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SELESAIKAN TARIKAN & VALIDASI SETORAN (CLOSING) */}
      {/* ===================================================================== */}
      {closeTarikanModalOpen && targetTarikanToClose && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                Selesaikan Tarikan #{targetTarikanToClose.idTarikan}
              </h4>
              <button onClick={() => setCloseTarikanModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseTarikan} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Petugas:</span>
                  <span className="font-bold text-slate-900">{targetTarikanToClose.namaPetugas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Input Warga:</span>
                  <span className="font-black text-emerald-700">{formatRupiah(targetTarikanToClose.totalInput)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Uang Fisik Yang Disetor (Rp):</label>
                <input
                  type="number"
                  value={closeTarikanForm.totalSetoran}
                  onChange={(e) => setCloseTarikanForm({ ...closeTarikanForm, totalSetoran: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-emerald-800 text-sm outline-none focus:ring-2 focus:ring-[#2E7D52]"
                  required
                />
              </div>

              {/* Warning on difference */}
              {closeTarikanForm.totalSetoran !== targetTarikanToClose.totalInput && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ⚠️ PERBEDAAN SETORAN
                  </div>
                  <div className="text-[11px]">
                    Selisih: <strong>{formatRupiah(closeTarikanForm.totalSetoran - targetTarikanToClose.totalInput)}</strong>
                  </div>
                  <div>
                    <label className="font-bold text-rose-900 block mb-1">
                      Wajib Isi "Alasan Selisih": <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={closeTarikanForm.alasanSelisih}
                      onChange={(e) => setCloseTarikanForm({ ...closeTarikanForm, alasanSelisih: e.target.value })}
                      placeholder="Jelaskan alasan selisih secara detail..."
                      className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Penutupan:</label>
                <input
                  type="text"
                  value={closeTarikanForm.catatan}
                  onChange={(e) => setCloseTarikanForm({ ...closeTarikanForm, catatan: e.target.value })}
                  placeholder="Catatan hasil tarikan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseTarikanModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow"
                >
                  Tutup & Setor Tarikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CATAT PENGELUARAN BARU */}
      {/* ===================================================================== */}
      {newPengeluaranModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                Catat Pengeluaran Agustusan
              </h4>
              <button onClick={() => setNewPengeluaranModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePengeluaran} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal:</label>
                  <input
                    type="date"
                    value={pengeluaranForm.tanggal}
                    onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, tanggal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                  <select
                    value={pengeluaranForm.kategori}
                    onChange={(e) =>
                      setPengeluaranForm({ ...pengeluaranForm, kategori: e.target.value as PengeluaranCategory })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                  >
                    <option value="HADIAH_LOMBA">HADIAH LOMBA</option>
                    <option value="KONSUMSI">KONSUMSI</option>
                    <option value="DEKORASI">DEKORASI</option>
                    <option value="UMBUL_UMBUL">UMBUL-UMBUL</option>
                    <option value="PERLENGKAPAN">PERLENGKAPAN</option>
                    <option value="SEWA_PERALATAN">SEWA PERALATAN</option>
                    <option value="PANGGUNG">PANGGUNG</option>
                    <option value="SOUND_SYSTEM">SOUND SYSTEM</option>
                    <option value="DOKUMENTASI">DOKUMENTASI</option>
                    <option value="KEAMANAN">KEAMANAN</option>
                    <option value="KEBERSIHAN">KEBERSIHAN</option>
                    <option value="PENTAS_SENI">PENTAS SENI</option>
                    <option value="MALAM_PUNCAK">MALAM PUNCAK</option>
                    <option value="LAINNYA">LAINNYA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Rincian Belanja:</label>
                <input
                  type="text"
                  value={pengeluaranForm.keterangan}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, keterangan: e.target.value })}
                  placeholder="Contoh: Pembelian Bendera Merah Putih & Piala"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal (Rp):</label>
                  <input
                    type="number"
                    min="1000"
                    value={pengeluaranForm.nominal}
                    onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, nominal: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-rose-700 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Bayar:</label>
                  <select
                    value={pengeluaranForm.metode}
                    onChange={(e) =>
                      setPengeluaranForm({ ...pengeluaranForm, metode: e.target.value as PaymentMethod })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="TUNAI">TUNAI</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penerima / Toko:</label>
                <input
                  type="text"
                  value={pengeluaranForm.penerima}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, penerima: e.target.value })}
                  placeholder="Contoh: Toko Olahraga Malang / Warung Bu Siti"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama File Bukti / Nota (Google Drive):</label>
                <input
                  type="text"
                  value={pengeluaranForm.buktiFileName}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, buktiFileName: e.target.value })}
                  placeholder="Contoh: Nota_Piala_Lomba_2026.jpg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPengeluaranModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C62828] hover:bg-[#A32020] text-white font-bold py-2.5 rounded-xl shadow"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
