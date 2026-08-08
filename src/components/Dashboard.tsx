import React, { useState } from 'react';
import { 
  UserRole, 
  Warga, 
  Keluarga, 
  SuratPengantar, 
  TransaksiKeuangan, 
  TagihanIuran, 
  Pengaduan, 
  Pengumuman, 
  AgendaKegiatan, 
  Pengurus, 
  AuditLog 
} from '../types/rt';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  FileText, 
  Wallet, 
  AlertTriangle, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  History, 
  Settings, 
  Plus, 
  Check, 
  X, 
  Search, 
  Eye, 
  EyeOff, 
  Download, 
  QrCode,
  Lock,
  CreditCard,
  FileCheck,
  Megaphone,
  BookOpen,
  Send,
  Code,
  RefreshCw,
  UserCheck,
  Building,
  Activity,
  CheckCircle2,
  Database
} from 'lucide-react';

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
  Cell
} from 'recharts';

import { WargaFormModal } from './WargaFormModal';
import { KeluargaFormModal } from './KeluargaFormModal';
import { TransaksiFormModal } from './TransaksiFormModal';
import { PengumumanFormModal } from './PengumumanFormModal';
import { AgendaFormModal } from './AgendaFormModal';
import { BackendCodeModal } from './BackendCodeModal';
import { testGasConnection, getGasWebappUrl, setGasWebappUrl } from '../services/apiService';
import { waServiceInstance } from '../services/whatsappService';
import { createDigitalDocumentFromSurat } from '../services/documentService';

interface DashboardProps {
  currentRole: UserRole;
  wargaList: Warga[];
  setWargaList: React.Dispatch<React.SetStateAction<Warga[]>>;
  keluargaList: Keluarga[];
  setKeluargaList: React.Dispatch<React.SetStateAction<Keluarga[]>>;
  suratList: SuratPengantar[];
  setSuratList: React.Dispatch<React.SetStateAction<SuratPengantar[]>>;
  transaksiList: TransaksiKeuangan[];
  setTransaksiList: React.Dispatch<React.SetStateAction<TransaksiKeuangan[]>>;
  iuranList: TagihanIuran[];
  setIuranList: React.Dispatch<React.SetStateAction<TagihanIuran[]>>;
  pengaduanList: Pengaduan[];
  setPengaduanList: React.Dispatch<React.SetStateAction<Pengaduan[]>>;
  pengumumanList: Pengumuman[];
  setPengumumanList: React.Dispatch<React.SetStateAction<Pengumuman[]>>;
  agendaList: AgendaKegiatan[];
  setAgendaList: React.Dispatch<React.SetStateAction<AgendaKegiatan[]>>;
  pengurusList: Pengurus[];
  auditLogs: AuditLog[];
  openLetterModal: () => void;
  openComplaintModal: () => void;
  openArchModal: () => void;
  openArchiveModal?: () => void;
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentRole,
  wargaList,
  setWargaList,
  keluargaList,
  setKeluargaList,
  suratList,
  setSuratList,
  transaksiList,
  setTransaksiList,
  iuranList,
  setIuranList,
  pengaduanList,
  setPengaduanList,
  pengumumanList,
  setPengumumanList,
  agendaList,
  setAgendaList,
  pengurusList,
  auditLogs,
  openLetterModal,
  openComplaintModal,
  openArchModal,
  openArchiveModal,
  activeSubTab,
  setActiveSubTab,
  addToast
}) => {
  const [showFullNik, setShowFullNik] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState<Pengurus | null>(null);

  // Form Modals State
  const [wargaModalOpen, setWargaModalOpen] = useState(false);
  const [kkModalOpen, setKkModalOpen] = useState(false);
  const [trxModalOpen, setTrxModalOpen] = useState(false);
  const [pgmModalOpen, setPgmModalOpen] = useState(false);
  const [agdModalOpen, setAgdModalOpen] = useState(false);
  const [backendCodeModalOpen, setBackendCodeModalOpen] = useState(false);

  // Settings GAS State
  const [webAppUrlInput, setWebAppUrlInput] = useState(getGasWebappUrl());
  const [isTestingConn, setIsTestingConn] = useState(false);

  // Calculations
  const totalPemasukan = transaksiList.filter((t) => t.jenis === 'Pemasukan').reduce((a, b) => a + b.pemasukan, 0);
  const totalPengeluaran = transaksiList.filter((t) => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.pengeluaran, 0);
  const saldoKas = transaksiList.length > 0 ? transaksiList[transaksiList.length - 1].saldo_berjalan : 18780000;
  const pendingSuratCount = suratList.filter((s) => s.status !== 'SELESAI' && s.status !== 'DITOLAK').length;
  const activeAduanCount = pengaduanList.filter((p) => p.status !== 'SELESAI').length;

  // Chart Data Preparation
  const chartKeuanganData = [
    { bulan: 'Mei', Pemasukan: 2100000, Pengeluaran: 600000 },
    { bulan: 'Juni', Pemasukan: 2200000, Pengeluaran: 750000 },
    { bulan: 'Juli', Pemasukan: 2250000, Pengeluaran: 920000 },
    { bulan: 'Agustus', Pemasukan: totalPemasukan, Pengeluaran: totalPengeluaran }
  ];

  const pieStatusWarga = [
    { name: 'Tetap', value: wargaList.filter(w => w.status_warga === 'Tetap').length },
    { name: 'Kontrak', value: wargaList.filter(w => w.status_warga === 'Kontrak').length },
    { name: 'Kos', value: wargaList.filter(w => w.status_warga === 'Kos').length }
  ];

  const COLORS_PIE = ['#2E7D52', '#D4A72C', '#C62828'];

  // Handlers
  const handleApproveSurat = (id: string) => {
    const targetSurat = suratList.find((s) => s.id_surat === id);
    setSuratList((prev) =>
      prev.map((s) => {
        if (s.id_surat === id) {
          return {
            ...s,
            status: 'SELESAI',
            tanggal_disetujui: new Date().toISOString().split('T')[0],
            catatan_admin: 'Telah disetujui & ditandatangani Ketua RT 07 RW 11.'
          };
        }
        return s;
      })
    );
    addToast('success', 'Surat Pengantar Disetujui!', 'Dokumen disetujui & PDF A4 resmi dengan QR Code dibuat.');

    if (targetSurat) {
      // Generate Tahap 5 Digital Document PDF Record
      createDigitalDocumentFromSurat(targetSurat);

      const pemohonWarga = wargaList.find((w) => w.id_warga === targetSurat.id_warga);
      const targetPhone = pemohonWarga?.no_hp || '081234567890';
      waServiceInstance.sendNotification('SURAT_APPROVED', targetPhone, {
        recipientPhone: targetPhone,
        recipientName: targetSurat.nama_pemohon,
        idRecord: targetSurat.nomor_surat,
        jenisLayanan: targetSurat.jenis_surat
      });
      waServiceInstance.sendNotification('SURAT_COMPLETED', targetPhone, {
        recipientPhone: targetPhone,
        recipientName: targetSurat.nama_pemohon,
        idRecord: targetSurat.nomor_surat,
        jenisLayanan: targetSurat.jenis_surat
      });
    }
  };

  const handleRejectSurat = (id: string) => {
    setSuratList((prev) =>
      prev.map((s) => (s.id_surat === id ? { ...s, status: 'DITOLAK', catatan_admin: 'Dokumen / data persyaratan belum lengkap' } : s))
    );
    addToast('error', 'Surat Ditolak', 'Status permohonan diperbarui menjadi DITOLAK.');
  };

  const handleUpdatePengaduan = (id: string, newStatus: Pengaduan['status']) => {
    const targetAduan = pengaduanList.find((p) => p.id_pengaduan === id);
    setPengaduanList((prev) =>
      prev.map((p) => (p.id_pengaduan === id ? { ...p, status: newStatus } : p))
    );
    addToast('info', 'Status Tiket Diperbarui', `Tiket pengaduan diubah ke status ${newStatus}.`);

    if (targetAduan && newStatus === 'SELESAI') {
      waServiceInstance.sendNotification('PENGADUAN_COMPLETED', targetAduan.no_hp || '081234567890', {
        recipientPhone: targetAduan.no_hp || '081234567890',
        recipientName: targetAduan.nama_pelapor,
        idRecord: targetAduan.nomor_tiket,
        jenisLayanan: targetAduan.kategori,
        details: 'Permasalahan lokasi telah ditindaklanjuti dan diselesaikan oleh Pengurus RT.'
      });
    }
  };

  const handlePayIuran = (idIuran: string) => {
    setIuranList((prev) =>
      prev.map((i) => {
        if (i.id_iuran === idIuran) {
          return {
            ...i,
            status: 'LUNAS',
            nominal_dibayar: i.nominal_tagihan,
            tanggal_bayar: new Date().toISOString().split('T')[0],
            metode_bayar: 'QRIS RT'
          };
        }
        return i;
      })
    );
    addToast('success', 'Pembayaran Iuran Berhasil!', 'Status iuran keluarga diperbarui menjadi LUNAS.');
  };

  const handleAddWargaSubmit = (newWarga: Warga) => {
    setWargaList((prev) => [newWarga, ...prev]);
    addToast('success', 'Data Warga Tersimpan!', `${newWarga.nama_lengkap} ditambahkan ke database RT 07.`);
  };

  const handleAddKeluargaSubmit = (newKk: Keluarga) => {
    setKeluargaList((prev) => [newKk, ...prev]);
    addToast('success', 'Kartu Keluarga Tersimpan!', `KK an. ${newKk.nama_kepala_keluarga} berhasil terdaftar.`);
  };

  const handleAddTrxSubmit = (newTrx: TransaksiKeuangan) => {
    setTransaksiList((prev) => [...prev, newTrx]);
    addToast('success', 'Transaksi Kas Recorded!', `${newTrx.jenis} sebesar Rp ${newTrx.pemasukan || newTrx.pengeluaran} tersimpan.`);
  };

  const handleAddPgmSubmit = (newPgm: Pengumuman) => {
    setPengumumanList((prev) => [newPgm, ...prev]);
    addToast('success', 'Pengumuman Dipublikasikan!', `Pengumuman "${newPgm.judul}" berhasil dikirim.`);

    // Broadcast WhatsApp Notification Event 7: PENGUMUMAN_IMPORTANT
    waServiceInstance.sendNotification('PENGUMUMAN_IMPORTANT', '081234567890', {
      recipientPhone: '081234567890',
      recipientName: 'Warga RT 07',
      jenisLayanan: newPgm.judul,
      details: newPgm.isi
    });
  };

  const handleAddAgdSubmit = (newAgd: AgendaKegiatan) => {
    setAgendaList((prev) => [newAgd, ...prev]);
    addToast('success', 'Agenda RT Ditambahkan!', `Agenda "${newAgd.judul}" dijadwalkan.`);
  };

  const handleTestGasConnection = async () => {
    setIsTestingConn(true);
    addToast('loading', 'Menghubungkan ke Google Apps Script...', 'Memeriksa endpoint API WebApp.');
    setGasWebappUrl(webAppUrlInput);
    
    const res = await testGasConnection(webAppUrlInput);
    setIsTestingConn(false);

    if (res.success) {
      addToast('success', 'Koneksi Backend Aktif!', res.message || 'Apps Script WebApp siap memproses data.');
    } else {
      addToast('error', 'Gagal Terhubung', res.error || 'Periksa kembali URL Web App.');
    }
  };

  const handleExportWargaCsv = () => {
    const headers = 'ID,Nama Lengkap,NIK,No KK,Blok,Pekerjaan,No HP,Status Warga\n';
    const rows = wargaList.map(w => `"${w.id_warga}","${w.nama_lengkap}","${w.nik}","${w.no_kk}","${w.blok}","${w.pekerjaan}","${w.no_hp}","${w.status_warga}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Database_Warga_RT07_GPA_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Mengeksport Data CSV', 'File database warga berhasil diunduh.');
  };

  const maskNik = (nik: string) => {
    if (showFullNik || currentRole === 'ADMIN' || currentRole === 'KETUA_RT') return nik;
    return `${nik.slice(0, 6)}******${nik.slice(-2)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Role Banner & System Specs Header */}
      <div className="bg-[#123B5D] text-white p-5 rounded-3xl shadow-xl border border-[#2E7D52] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#2E7D52] flex items-center justify-center font-bold text-[#D4A72C] border border-[#D4A72C] shadow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              PORTAL UTAMA SMART RT 07 RW 11
              <span className="bg-[#2E7D52] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#D4A72C]">
                ROLE: {currentRole}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Perum GPA Ngijo, Karangploso • Terintegrasi Google Apps Script Backend (Tahap 2)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBackendCodeModalOpen(true)}
            className="bg-[#D4A72C]/20 hover:bg-[#D4A72C]/30 text-[#D4A72C] border border-[#D4A72C]/50 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" /> Backend Kode Apps Script (Tahap 2)
          </button>
          <button
            onClick={openArchModal}
            className="bg-[#2E7D52]/30 hover:bg-[#2E7D52]/40 text-emerald-300 border border-[#2E7D52]/60 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            Spesifikasi Arsitektur
          </button>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Navigation & Main Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Desktop Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-1.5 bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Navigasi Modul Portal
          </span>

          <button
            onClick={() => setActiveSubTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'overview' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4A72C]" />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveSubTab('warga')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
              activeSubTab === 'warga' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#2E7D52]" />
              <span>Data Warga RT</span>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-black">
              {wargaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('keluarga')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
              activeSubTab === 'keluarga' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-amber-600" />
              <span>Data Keluarga / KK</span>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-black">
              {keluargaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('surat')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
              activeSubTab === 'surat' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-sky-500" />
              <span>Administrasi Surat</span>
            </div>
            {pendingSuratCount > 0 && (
              <span className="bg-[#C62828] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingSuratCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('keuangan')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'keuangan' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#2E7D52]" />
            Keuangan & Kas RT
          </button>

          <button
            onClick={() => setActiveSubTab('iuran')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
              activeSubTab === 'iuran' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Iuran Bulanan Warga</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Rp 50rb/bln
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pengaduan')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
              activeSubTab === 'pengaduan' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#C62828]" />
              <span>Pengaduan Warga</span>
            </div>
            {activeAduanCount > 0 && (
              <span className="bg-[#C62828] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeAduanCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('pengumuman')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'pengumuman' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4 text-purple-600" />
            Pengumuman & Broadcast
          </button>

          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'agenda' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#2E7D52]" />
            Agenda Kegiatan RT
          </button>

          <button
            onClick={() => setActiveSubTab('pengurus')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'pengurus' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            Profil Pengurus & ID Card
          </button>

          <button
            onClick={() => setActiveSubTab('profil')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'profil' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Profil Saya & KK Digital
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'audit' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            Audit Log Sistem
          </button>

          <button
            onClick={() => setActiveSubTab('pengaturan')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'pengaturan' ? 'bg-[#123B5D] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-[#D4A72C]" />
            Google Sheets & GAS Sync
          </button>
        </div>

        {/* Content Display Area */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[600px]">
          
          {/* SubTab 1: OVERVIEW DASHBOARD */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Statistik Utama Ekosistem RT 07</h3>
                  <p className="text-xs text-slate-500">Perum GPA Ngijo, Karangploso • Data Terverifikasi Real-Time</p>
                </div>
                <span className="bg-emerald-100 text-[#2E7D52] font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Sistem Online
                </span>
              </div>

              {/* 7 High-Impact Stat Cards as requested in TAHAP 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Warga</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#123B5D]">{wargaList.length} Jiwa</span>
                    <Users className="w-6 h-6 text-[#2E7D52]" />
                  </div>
                  <span className="text-[11px] text-[#2E7D52] font-semibold">100% Terdata</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Jumlah KK</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#123B5D]">{keluargaList.length} KK</span>
                    <Home className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[11px] text-slate-500">Perum GPA Ngijo</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pengajuan Surat</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-sky-600">{suratList.length} Surat</span>
                    <FileText className="w-6 h-6 text-sky-500" />
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold">{pendingSuratCount} Menunggu Action</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pengaduan Warga</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#C62828]">{pengaduanList.length} Tiket</span>
                    <AlertTriangle className="w-6 h-6 text-[#C62828]" />
                  </div>
                  <span className="text-[11px] text-[#C62828] font-semibold">{activeAduanCount} Aktif Diproses</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Saldo Kas RT</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-[#2E7D52]">Rp {saldoKas.toLocaleString('id-ID')}</span>
                    <Wallet className="w-6 h-6 text-[#D4A72C]" />
                  </div>
                  <span className="text-[11px] text-slate-500">Agustus 2026</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#2E7D52]">Total Pemasukan</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-800">Rp {totalPemasukan.toLocaleString('id-ID')}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#2E7D52]" />
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Bulan Ini</span>
                </div>

                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#C62828]">Total Pengeluaran</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-rose-800">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
                    <AlertTriangle className="w-5 h-5 text-[#C62828]" />
                  </div>
                  <span className="text-[11px] text-rose-700 font-medium">Bulan Ini</span>
                </div>
              </div>

              {/* Recharts Financial Graph & Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-8 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-[#123B5D]">Grafik Arus Kas RT (Pemasukan vs Pengeluaran)</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartKeuanganData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString('id-ID')}`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Pemasukan" fill="#2E7D52" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Pengeluaran" fill="#C62828" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <h4 className="font-bold text-sm text-[#123B5D]">Demografi Status Warga</h4>
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieStatusWarga}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieStatusWarga.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-2xl border border-slate-200">
                    <div className="flex justify-between"><span>Warga Tetap:</span> <b>{pieStatusWarga[0].value} orang</b></div>
                    <div className="flex justify-between"><span>Warga Kontrak:</span> <b>{pieStatusWarga[1].value} orang</b></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-[#123B5D]/5 p-5 rounded-3xl border border-[#123B5D]/20 space-y-3">
                <span className="text-xs font-bold text-[#123B5D] uppercase tracking-wider block">
                  Aksi Cepat Layanan Digital RT 07
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setWargaModalOpen(true)}
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Tambah Warga
                  </button>
                  <button
                    onClick={openLetterModal}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" /> Form Permohonan Surat
                  </button>
                  <button
                    onClick={openComplaintModal}
                    className="bg-[#C62828] hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" /> Pengaduan Warga
                  </button>
                  <button
                    onClick={() => setTrxModalOpen(true)}
                    className="bg-[#D4A72C] hover:bg-amber-600 text-[#123B5D] text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Wallet className="w-4 h-4" /> Catat Kas RT
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SubTab 2: DATA WARGA */}
          {activeSubTab === 'warga' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Database Kependudukan Warga RT 07</h3>
                  <p className="text-xs text-slate-500">Perum GPA Ngijo • NIK disamarkan untuk non-admin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFullNik(!showFullNik)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-300"
                  >
                    {showFullNik ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showFullNik ? 'Sembunyikan NIK' : 'Tampilkan NIK (Role)'}
                  </button>

                  <button
                    onClick={handleExportWargaCsv}
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>

                  <button
                    onClick={() => setWargaModalOpen(true)}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> Tambah Warga
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, NIK, blok rumah, atau pekerjaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>

              {/* Warga Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#123B5D] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ID Warga</th>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">NIK</th>
                      <th className="p-3">Blok</th>
                      <th className="p-3">Pekerjaan</th>
                      <th className="p-3">No. HP</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wargaList
                      .filter((w) =>
                        w.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        w.blok.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        w.nik.includes(searchTerm)
                      )
                      .map((w) => (
                        <tr key={w.id_warga} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-slate-500 font-bold">{w.id_warga}</td>
                          <td className="p-3 font-bold text-slate-800">{w.nama_lengkap}</td>
                          <td className="p-3 font-mono font-semibold text-slate-600">{maskNik(w.nik)}</td>
                          <td className="p-3 font-semibold text-[#123B5D]">{w.blok}</td>
                          <td className="p-3 text-slate-600">{w.pekerjaan}</td>
                          <td className="p-3 text-slate-600">{w.no_hp}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              w.status_warga === 'Tetap' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
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

          {/* SubTab 3: DATA KELUARGA */}
          {activeSubTab === 'keluarga' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Direktori Kepala Keluarga (KK)</h3>
                  <p className="text-xs text-slate-500">Master Data Rumah Tangga Perum GPA Ngijo RT 07</p>
                </div>
                <button
                  onClick={() => setKkModalOpen(true)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Tambah KK Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keluargaList.map((k) => (
                  <div key={k.id_kk} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-sm text-[#123B5D]">{k.nama_kepala_keluarga}</h4>
                      <span className="bg-[#123B5D] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {k.blok}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><b>No. KK:</b> <span className="font-mono font-bold text-slate-800">{k.no_kk}</span></p>
                      <p><b>Jumlah Anggota:</b> {k.jumlah_anggota} Orang</p>
                      <p><b>Kepemilikan Rumah:</b> <span className="text-[#2E7D52] font-semibold">{k.status_rumah}</span></p>
                      <p><b>Kontak No HP:</b> {k.no_hp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 4: ADMINISTRASI SURAT */}
          {activeSubTab === 'surat' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Workflow Permohonan Surat Pengantar</h3>
                  <p className="text-xs text-slate-500">Persetujuan Digital Ketua RT & Generasi QR Code Verifikasi A4 PDF</p>
                </div>
                <div className="flex items-center gap-2">
                  {openArchiveModal && (
                    <button
                      onClick={openArchiveModal}
                      className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow border border-emerald-400/40"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-400" /> Arsip Surat (Tahap 5)
                    </button>
                  )}
                  <button
                    onClick={openLetterModal}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> Form Permohonan Surat
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {suratList.map((s) => (
                  <div key={s.id_surat} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#123B5D] text-sm">{s.nomor_surat}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{s.jenis_surat} an. {s.nama_pemohon}</h4>
                      <p className="text-slate-600"><b>Keperluan:</b> {s.keperluan}</p>
                      <p className="text-slate-500 text-[11px]">Tanggal: {s.tanggal_pengajuan} • Blok: {s.blok_rumah}</p>
                      {s.catatan_admin && (
                        <p className="text-xs text-[#2E7D52] font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                          Catatan Admin: {s.catatan_admin}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {s.status !== 'SELESAI' && (
                        <>
                          <button
                            onClick={() => handleApproveSurat(s.id_surat)}
                            className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui (RT)
                          </button>
                          <button
                            onClick={() => handleRejectSurat(s.id_surat)}
                            className="bg-[#C62828] hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </>
                      )}
                      <button
                        onClick={openLetterModal}
                        className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow flex items-center gap-1"
                      >
                        Pratinjau PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 5: KEUANGAN KAS RT */}
          {activeSubTab === 'keuangan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Transparansi Laporan Kas RT 07</h3>
                  <p className="text-xs text-slate-500">Pencatatan Pemasukan & Pengeluaran Terbuka untuk Seluruh Warga</p>
                </div>
                <button
                  onClick={() => setTrxModalOpen(true)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Catat Transaksi Baru
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Total Pemasukan</span>
                  <p className="text-xl font-black text-emerald-800">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-700">Total Pengeluaran</span>
                  <p className="text-xl font-black text-rose-800">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-700">Saldo Akhir Kas RT</span>
                  <p className="text-xl font-black text-amber-900">Rp {saldoKas.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#123B5D] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Jenis</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Keterangan</th>
                      <th className="p-3">Jumlah</th>
                      <th className="p-3">Saldo Berjalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transaksiList.map((t) => (
                      <tr key={t.id_transaksi} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-700">{t.tanggal}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.jenis === 'Pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {t.jenis}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{t.kategori}</td>
                        <td className="p-3 text-slate-600">{t.keterangan}</td>
                        <td className="p-3 font-bold font-mono">
                          {t.jenis === 'Pemasukan' ? `+ Rp ${t.pemasukan.toLocaleString('id-ID')}` : `- Rp ${t.pengeluaran.toLocaleString('id-ID')}`}
                        </td>
                        <td className="p-3 font-bold font-mono text-[#123B5D]">Rp {t.saldo_berjalan.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 6: IURAN BULANAN */}
          {activeSubTab === 'iuran' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Rekapitulasi Iuran Warga Bulanan</h3>
                  <p className="text-xs text-slate-500">Iuran Kebersihan, Keamanan, & Kas RT (Rp 50.000 / Bulan / KK)</p>
                </div>
                <span className="bg-[#2E7D52] text-white font-bold text-xs px-3 py-1.5 rounded-xl">
                  Periode: Agustus 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {iuranList.map((ir) => (
                  <div key={ir.id_iuran} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-800">{ir.nama_kepala_keluarga} ({ir.blok})</h4>
                      <p className="text-xs text-slate-500">Tagihan: Rp {ir.nominal_tagihan.toLocaleString('id-ID')} • Metode: {ir.metode_bayar || 'Belum'}</p>
                      {ir.tanggal_bayar && <p className="text-[10px] text-emerald-700 font-bold">Lunas Tanggal: {ir.tanggal_bayar}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {ir.status !== 'LUNAS' ? (
                        <>
                          <button
                            onClick={() => {
                              waServiceInstance.sendNotification('IURAN_REMINDER', '081234567890', {
                                recipientPhone: '081234567890',
                                recipientName: ir.nama_kepala_keluarga,
                                bulanTahun: ir.bulan_tahun,
                                nominal: ir.nominal_tagihan.toLocaleString('id-ID')
                              });
                              addToast('success', 'Pengingat WA Terkirim!', `Pesan pengingat iuran dikirim ke ${ir.nama_kepala_keluarga}`);
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-2 rounded-xl shadow flex items-center gap-1 border border-emerald-400/40"
                            title="Kirim Pengingat WA"
                          >
                            <Send className="w-3 h-3" /> WA Remind
                          </button>
                          <button
                            onClick={() => handlePayIuran(ir.id_iuran)}
                            className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3 py-2 rounded-xl shadow flex items-center gap-1"
                          >
                            Bayar QRIS
                          </button>
                        </>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs">
                          LUNAS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 7: PENGADUAN WARGA */}
          {activeSubTab === 'pengaduan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Ticket Board Pengaduan & Aspirasi Lingkungan</h3>
                  <p className="text-xs text-slate-500">Status Flow: BARU → DITERIMA → DIPROSES → SELESAI</p>
                </div>
                <button
                  onClick={openComplaintModal}
                  className="bg-[#C62828] text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Tambah Tiket Pengaduan
                </button>
              </div>

              <div className="space-y-3">
                {pengaduanList.map((ad) => (
                  <div key={ad.id_pengaduan} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#123B5D] bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-200">
                        {ad.nomor_tiket}
                      </span>
                      <div className="flex gap-1 overflow-x-auto">
                        {(['BARU', 'DITERIMA', 'DIPROSES', 'SELESAI'] as Pengaduan['status'][]).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdatePengaduan(ad.id_pengaduan, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              ad.status === st ? 'bg-[#123B5D] text-white shadow' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">[{ad.kategori}] {ad.deskripsi}</h4>
                    <p className="text-xs text-slate-600">Pelapor: <b>{ad.nama_pelapor}</b> • Lokasi: {ad.lokasi} • Tgl: {ad.tanggal}</p>
                    {ad.tanggapan_admin && (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                        <b>Tanggapan Pengurus:</b> {ad.tanggapan_admin}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 8: PENGUMUMAN & BROADCAST */}
          {activeSubTab === 'pengumuman' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Papan Pengumuman & Broadcast RT 07</h3>
                  <p className="text-xs text-slate-500">Informasi Resmi Sekretariat untuk Warga Perum GPA Ngijo</p>
                </div>
                <button
                  onClick={() => setPgmModalOpen(true)}
                  className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Buat Pengumuman
                </button>
              </div>

              <div className="space-y-4">
                {pengumumanList.map((pgm) => (
                  <div key={pgm.id_pengumuman} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#2E7D52] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {pgm.kategori}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{pgm.tanggal} • {pgm.penulis}</span>
                    </div>
                    <h4 className="font-bold text-[#123B5D] text-base">{pgm.judul}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{pgm.isi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 9: AGENDA KEGIATAN */}
          {activeSubTab === 'agenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Agenda & Timelines Kegiatan Warga</h3>
                  <p className="text-xs text-slate-500">Jadwal Gotong Royong, Rapat RT, Posyandu, dan Peringatan Hari Besar</p>
                </div>
                <button
                  onClick={() => setAgdModalOpen(true)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Tambah Agenda
                </button>
              </div>

              <div className="space-y-3">
                {agendaList.map((agd) => (
                  <div key={agd.id_agenda} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4A72C] text-[#123B5D] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          {agd.kategori}
                        </span>
                        <span className="font-bold text-slate-500">{agd.tanggal} ({agd.jam})</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">{agd.judul}</h4>
                      <p className="text-slate-600"><b>Lokasi:</b> {agd.lokasi}</p>
                      <p className="text-slate-500">{agd.deskripsi}</p>
                      <p className="text-slate-400 text-[11px]">PIC: {agd.penanggung_jawab}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 10: PROFIL PENGURUS & DIGITAL ID CARD */}
          {activeSubTab === 'pengurus' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-[#123B5D]">Struktur Pengurus RT 07 RW 11 & ID Card Digital</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {pengurusList.map((p) => (
                  <div key={p.id_pengurus} className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center space-y-3 shadow-sm">
                    <img
                      src={p.foto_url}
                      alt={p.nama}
                      className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-[#123B5D] shadow"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{p.nama}</h4>
                      <p className="text-xs font-bold text-[#2E7D52]">{p.jabatan}</p>
                      <p className="text-[11px] text-slate-500">{p.periode} • {p.blok}</p>
                    </div>
                    <button
                      onClick={() => setSelectedIdCard(p)}
                      className="w-full bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pratinjau ID Card Digital
                    </button>
                  </div>
                ))}
              </div>

              {/* ID Card Modal Preview */}
              {selectedIdCard && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="p-6 bg-[#0A2338] text-white rounded-3xl border-2 border-[#D4A72C] max-w-sm w-full shadow-2xl space-y-4 relative overflow-hidden">
                    <button
                      onClick={() => setSelectedIdCard(null)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center border-b border-white/20 pb-3">
                      <h4 className="font-bold text-sm tracking-wider uppercase text-[#D4A72C]">KARTU IDENTITAS RESMI PENGURUS</h4>
                      <p className="text-[10px] text-slate-300">RT 07 RW 11 PERUM GPA NGIJO</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <img src={selectedIdCard.foto_url} alt="" className="w-20 h-20 rounded-2xl object-cover border border-[#D4A72C]" />
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-white text-base">{selectedIdCard.nama}</p>
                        <p className="text-[#D4A72C] font-bold">{selectedIdCard.jabatan}</p>
                        <p className="text-[10px] text-slate-300">Periode: {selectedIdCard.periode}</p>
                        <p className="text-[10px] text-slate-300">{selectedIdCard.email}</p>
                      </div>
                    </div>

                    <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between text-[11px]">
                      <span>VERIFIKASI: PENGURUS SAH</span>
                      <QrCode className="w-8 h-8 text-[#D4A72C]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SubTab 11: PROFIL SAYA */}
          {activeSubTab === 'profil' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-[#123B5D]">Profil Terdaftar & Kartu Keluarga Digital</h3>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#123B5D] text-[#D4A72C] font-black text-2xl flex items-center justify-center shadow">
                    BS
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#123B5D]">Bambang Sugianto, S.T.</h4>
                    <p className="text-xs text-slate-600">Ketua RT 07 • Perum GPA Ngijo Blok C-07</p>
                    <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Status Warga: Tetap (Terverifikasi)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  <p><b>NIK:</b> <span className="font-mono">3507121508820001</span></p>
                  <p><b>No. KK:</b> <span className="font-mono">3507120101150001</span></p>
                  <p><b>No. WhatsApp:</b> 081234567890</p>
                  <p><b>Email:</b> bambang.sugianto@gmail.com</p>
                  <p><b>Status Iuran Bulan Ini:</b> <span className="text-emerald-700 font-bold">LUNAS</span></p>
                  <p><b>Jumlah Anggota Keluarga:</b> 4 Orang</p>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 12: AUDIT LOG */}
          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-[#123B5D]">Audit Log System Activity</h3>
              <p className="text-xs text-slate-500">Catatan Aktivitas & Keamanan Pengoperasian Database Google Sheets</p>

              <div className="space-y-2">
                {auditLogs.map((l) => (
                  <div key={l.id_log} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.action}</span>
                      <span className="text-slate-500 font-mono ml-2">[{l.timestamp}]</span>
                      <p className="text-slate-600 mt-0.5">{l.description}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 13: PENGATURAN GOOGLE SHEETS & APPS SCRIPT */}
          {activeSubTab === 'pengaturan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#123B5D]">Pengaturan Google Sheets & Integration Settings</h3>
                  <p className="text-xs text-slate-500">Konfigurasi Web App URL Apps Script & Sinkronisasi Real-Time</p>
                </div>
                <button
                  onClick={() => setBackendCodeModalOpen(true)}
                  className="bg-[#D4A72C] text-[#123B5D] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Code className="w-4 h-4" /> Buka Kode Apps Script
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Apps Script Web App Endpoint URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webAppUrlInput}
                      onChange={(e) => setWebAppUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                    />
                    <button
                      onClick={handleTestGasConnection}
                      disabled={isTestingConn}
                      className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-4 rounded-xl shrink-0 flex items-center gap-1.5 shadow"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTestingConn ? 'animate-spin' : ''}`} />
                      Tes Koneksi
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Spreadsheet ID Database</label>
                    <input
                      type="text"
                      readOnly
                      value="1a2b3c4d5e6f7g8h9i0_SMART_RT07_GPA_NGIJO"
                      className="w-full bg-slate-200/60 p-2.5 rounded-xl border border-slate-300 font-mono text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Sinkronisasi Backend</label>
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-2 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Google Apps Script Connected & Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Form Modals */}
      <WargaFormModal
        isOpen={wargaModalOpen}
        onClose={() => setWargaModalOpen(false)}
        onAddWarga={handleAddWargaSubmit}
      />

      <KeluargaFormModal
        isOpen={kkModalOpen}
        onClose={() => setKkModalOpen(false)}
        onAddKeluarga={handleAddKeluargaSubmit}
      />

      <TransaksiFormModal
        isOpen={trxModalOpen}
        onClose={() => setTrxModalOpen(false)}
        onAddTransaksi={handleAddTrxSubmit}
        currentSaldo={saldoKas}
      />

      <PengumumanFormModal
        isOpen={pgmModalOpen}
        onClose={() => setPgmModalOpen(false)}
        onAddPengumuman={handleAddPgmSubmit}
      />

      <AgendaFormModal
        isOpen={agdModalOpen}
        onClose={() => setAgdModalOpen(false)}
        onAddAgenda={handleAddAgdSubmit}
      />

      <BackendCodeModal
        isOpen={backendCodeModalOpen}
        onClose={() => setBackendCodeModalOpen(false)}
      />

    </div>
  );
};
