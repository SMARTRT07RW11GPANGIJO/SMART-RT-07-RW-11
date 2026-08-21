import React from 'react';
import { 
  Building2, 
  FileText, 
  HelpCircle, 
  Wallet, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Pengumuman, AgendaKegiatan, TransaksiKeuangan } from '../types/rt';
import { WhatsAppBotSimulator } from './WhatsAppBotSimulator';

interface LandingProps {
  setTab: (tab: string) => void;
  openLetterModal: () => void;
  openComplaintModal: () => void;
  openLoginModal?: () => void;
  announcements: Pengumuman[];
  agendas: AgendaKegiatan[];
  transactions: TransaksiKeuangan[];
}

export const LandingPage: React.FC<LandingProps> = ({
  setTab,
  openLetterModal,
  openComplaintModal,
  openLoginModal,
  announcements,
  agendas,
  transactions
}) => {

  const totalPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.pemasukan, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.pengeluaran, 0);

  const saldoKas = transactions.length > 0 ? transactions[transactions.length - 1].saldo_berjalan : 18780000;

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#123B5D] via-[#0A2338] to-[#123B5D] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl border-b border-[#2E7D52]">
        
        {/* Background Decorative Element */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#2E7D52]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-64 h-64 bg-[#D4A72C]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#2E7D52]/30 border border-[#2E7D52] px-3 py-1 rounded-full text-xs font-semibold text-[#D4A72C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Resmikan & Ekosistem Digital RT 07 RW 11</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Selamat Datang di Portal Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-white">
                RT 07 RW 11 GPA NGIJO
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Pelayanan warga yang mudah, cepat, transparan, dan terintegrasi. Akses surat pengantar resmi, laporan keuangan, pengaduan lingkungan, dan agenda kegiatan langsung dari smartphone Anda.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={openLetterModal}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg border border-[#D4A72C]/40 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                AJUKAN SURAT SEKARANG
              </button>

              <button
                onClick={() => setTab('dashboard')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all border border-slate-500 backdrop-blur-md flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-[#D4A72C]" />
                MASUK PORTAL DASHBOARD
              </button>
            </div>

            {/* Quick Metrics Badge */}
            <div className="pt-6 border-t border-slate-700/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <span className="block text-2xl font-black text-[#D4A72C]">45 KK</span>
                <span className="text-[11px] text-slate-400 font-medium">Keluarga Terdaftar</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-[#2E7D52]">180+</span>
                <span className="text-[11px] text-slate-400 font-medium">Jiwa Warga RT 07</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-[#D4A72C]">24/7</span>
                <span className="text-[11px] text-slate-400 font-medium">Layanan Digital</span>
              </div>
            </div>
          </div>

          {/* Hero Card Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-left relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2E7D52] flex items-center justify-center font-bold text-white text-xs border border-[#D4A72C]">
                    RT07
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Layanan Mandiri Warga</h4>
                    <p className="text-[10px] text-slate-300">GPA Ngijo, Karangploso</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded border border-green-500/40">
                  ONLINE
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-200">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>📄 Surat Pengantar KTP / Domisili</span>
                  <span className="text-[#D4A72C] font-bold">Auto PDF</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>💳 Iuran RT QRIS & Transfer</span>
                  <span className="text-emerald-400 font-bold">Transparan</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>🚨 Pelaporan Keluhan Ber-Tiket</span>
                  <span className="text-amber-300 font-bold">Lacak Realtime</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={openComplaintModal}
                  className="w-full bg-[#C62828] hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow"
                >
                  <HelpCircle className="w-4 h-4 text-[#D4A72C]" />
                  BUAT PENGADUAN LINGKUNGAN
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Section Layanan Warga Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#2E7D52] bg-green-100 px-3 py-1 rounded-full border border-green-300">
            PELAYANAN PUBLIK
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D]">Menu Layanan Warga Utama</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Akses fasilitas administrasi, pelaporan, dan keuangan lingkungan secara mudah dan aman.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div 
            onClick={openLetterModal}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#2E7D52]"
          >
            <div className="w-12 h-12 bg-emerald-100 text-[#2E7D52] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#2E7D52] transition-colors mb-1">
              Surat Pengantar RT
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Pengajuan Surat KTP, KK, Domisili, SKU, dan SKCK dengan generator nomor surat otomatis & QR Code.
            </p>
            <span className="text-xs font-bold text-[#2E7D52] flex items-center gap-1 group-hover:underline">
              Ajukan Surat <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => setTab('dashboard')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#123B5D]"
          >
            <div className="w-12 h-12 bg-blue-100 text-[#123B5D] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#123B5D] transition-colors mb-1">
              Pendataan Warga & KK
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Direktori data keluarga dan warga terverifikasi dengan perlindungan privasi data NIK yang ketat.
            </p>
            <span className="text-xs font-bold text-[#123B5D] flex items-center gap-1 group-hover:underline">
              Lihat Portal <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={openComplaintModal}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#C62828]"
          >
            <div className="w-12 h-12 bg-red-100 text-[#C62828] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#C62828] transition-colors mb-1">
              Pengaduan & Aspirasi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Penyampaian keluhan fasilitas umum, lampu jalan, dan keamanan dengan nomor tiket lacak otomatis.
            </p>
            <span className="text-xs font-bold text-[#C62828] flex items-center gap-1 group-hover:underline">
              Kirim Aduan <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => setTab('dashboard')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#D4A72C]"
          >
            <div className="w-12 h-12 bg-amber-100 text-[#D4A72C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#D4A72C] transition-colors mb-1">
              Transparansi Iuran Kas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Laporan saldo kas bulanan RT, rekap pembayaran iuran warga, dan riwayat belanja fasilitas.
            </p>
            <span className="text-xs font-bold text-[#D4A72C] flex items-center gap-1 group-hover:underline">
              Lihat Keuangan <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => setTab('dashboard')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#2E7D52]"
          >
            <div className="w-12 h-12 bg-[#2E7D52]/10 text-[#2E7D52] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#2E7D52] transition-colors mb-1">
              Agenda & Gotong Royong
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Jadwal kegiatan kerja bakti, rapat warga, dan peringatan HUT RI 17 Agustus mendatang.
            </p>
            <span className="text-xs font-bold text-[#2E7D52] flex items-center gap-1 group-hover:underline">
              Buka Kalender <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => setTab('verify')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200 transition-all group cursor-pointer border-t-4 border-t-[#123B5D]"
          >
            <div className="w-12 h-12 bg-slate-100 text-[#123B5D] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#123B5D] group-hover:text-[#123B5D] transition-colors mb-1">
              Verifikasi Keaslian Surat
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Uji keabsahan nomor surat resmi RT 07 RW 11 dengan scanner QR code online.
            </p>
            <span className="text-xs font-bold text-[#123B5D] flex items-center gap-1 group-hover:underline">
              Uji Dokumen <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>
      </section>

      {/* Section Transparansi Keuangan Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#123B5D] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-[#2E7D52]">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-700">
            <div>
              <span className="text-xs font-bold text-[#D4A72C] bg-[#D4A72C]/20 border border-[#D4A72C]/40 px-3 py-1 rounded-full">
                TRANSPARANSI KAS PUBLIK
              </span>
              <h3 className="text-2xl font-bold mt-2">Ringkasan Laporan Keuangan RT 07</h3>
              <p className="text-xs text-slate-300">Periode Agustus 2026 — Perum GPA Ngijo</p>
            </div>

            <button
              onClick={() => setTab('dashboard')}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-[#D4A72C]/30 shadow flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Detail Laporan Transaksi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-center">
            <div className="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-2xl">
              <span className="text-xs text-slate-300 font-medium block">Total Pemasukan Kas</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                Rp {totalPemasukan.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-2xl">
              <span className="text-xs text-slate-300 font-medium block">Total Pengeluaran Kas</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                Rp {totalPengeluaran.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur border border-[#D4A72C]/40 p-5 rounded-2xl">
              <span className="text-xs text-amber-200 font-medium block">Saldo Kas Akhir Berjalan</span>
              <span className="text-2xl font-black text-[#D4A72C] mt-1 block">
                Rp {saldoKas.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Section Pengumuman & Agenda Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pengumuman Terbaru */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-lg text-[#123B5D] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C62828]" />
              Pengumuman Terbaru RT 07
            </h3>
            <span className="text-xs text-[#2E7D52] font-bold cursor-pointer hover:underline" onClick={() => setTab('dashboard')}>
              Lihat Semua
            </span>
          </div>

          <div className="space-y-4">
            {announcements.map((p) => (
              <div key={p.id_pengumuman} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#123B5D] px-2.5 py-0.5 rounded-full">
                    {p.kategori}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{p.tanggal}</span>
                </div>
                <h4 className="font-bold text-base text-slate-800 leading-snug">{p.judul}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.isi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda Warga Timeline */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-lg text-[#123B5D] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2E7D52]" />
              Agenda & Kegiatan Warga
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            {agendas.map((ag) => (
              <div key={ag.id_agenda} className="flex gap-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                <div className="w-12 h-12 bg-[#2E7D52]/10 text-[#2E7D52] rounded-xl flex flex-col items-center justify-center shrink-0 border border-[#2E7D52]/30">
                  <span className="text-[10px] font-bold uppercase">{ag.tanggal.slice(8, 10)}</span>
                  <span className="text-[8px] font-bold uppercase">AGT</span>
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-800">{ag.judul}</h4>
                  <p className="text-slate-500 font-medium text-[11px]">{ag.jam} • {ag.lokasi}</p>
                  <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded">
                    {ag.penanggung_jawab}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* WhatsApp Bot Sandbox Interactive Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-white">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
              <Bot className="w-4 h-4" />
              INTEGRASI WHATSAPP BUSINESS BOT
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Simulasi Bot WhatsApp Resmi RT 07 RW 11
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Warga dapat mengecek nomor tiket surat, status pengaduan, dan jadwal kegiatan melalui pesan otomatis WhatsApp. Coba kirimkan pesan di simulator interaktif samping ini!
            </p>
            
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Ketik <b>ASSALAMUALAIKUM</b> untuk membuka menu otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Ketik <b>1</b> untuk informasi pengajuan surat pengantar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Ketik <b>SRT-2026-0001</b> untuk cek status dokumen</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <WhatsAppBotSimulator />
          </div>
        </div>
      </section>

    </div>
  );
};
