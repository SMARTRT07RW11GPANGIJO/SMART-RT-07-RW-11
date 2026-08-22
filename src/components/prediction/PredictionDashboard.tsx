// SMART RT 07 RW 11 GPA NGIJO - PREDIKSI KEBUTUHAN LAYANAN RT v1.0
// Main Executive Dashboard & Decision Support View

import React, { useState, useEffect } from 'react';
import { 
  PredictionItem, 
  PredictionSummary, 
  PredictionCategory, 
  PredictionActorSession,
  ConfidenceLevel,
  AnonymizedPredictionFeatureVector
} from '../../types/prediction';
import { UserRole } from '../../types/rt';
import { predictionService } from '../../services/predictionService';
import { PredictionReviewModal } from './PredictionReviewModal';
import { PredictionTestRunnerModal } from './PredictionTestRunnerModal';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Eye, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Database,
  BarChart3,
  HelpCircle
} from 'lucide-react';

interface PredictionDashboardProps {
  currentRole: UserRole;
  authContext?: any;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  currentRole,
  authContext,
  addToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'ALL'>('ALL');
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [features, setFeatures] = useState<AnonymizedPredictionFeatureVector | null>(null);
  const [selectedPredictionForReview, setSelectedPredictionForReview] = useState<PredictionItem | null>(null);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [showFeatureTransparency, setShowFeatureTransparency] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authoritative Actor Session
  const actorSession: PredictionActorSession = {
    userId: authContext?.userId || 'USR-CURRENT',
    role: currentRole,
    nama: authContext?.nama || (currentRole === 'KETUA_RT' ? 'Ketua RT 07' : 'Pengurus RT 07'),
    rtScope: 'RT07_RW11'
  };

  const loadData = () => {
    setIsLoading(true);
    try {
      const items = predictionService.getPredictions(
        actorSession, 
        selectedCategory === 'ALL' ? undefined : selectedCategory
      );
      const summ = predictionService.getPredictionSummary(actorSession);
      const feat = predictionService.extractAnonymizedFeatures();

      setPredictions(items);
      setSummary(summ);
      setFeatures(feat);
    } catch (err: any) {
      console.error('Failed to load predictions', err);
      addToast('error', 'Akses Terbatas', err.message || 'Gagal memuat modul prediksi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, currentRole]);

  const handleRegenerate = () => {
    try {
      predictionService.regeneratePredictions(actorSession);
      loadData();
      addToast('success', 'Inferensi Diperbarui', 'Fitur dan proyeksi kebutuhan telah dikomputasi ulang.');
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui', err.message);
    }
  };

  const handleExportCSV = () => {
    if (!predictions.length) return;

    const headers = ['ID Prediksi', 'Kategori', 'Tipe', 'Judul', 'Periode', 'Keyakinan (%)', 'Status', 'Proyeksi', 'Rekomendasi'];
    const rows = predictions.map(p => [
      `"${p.predictionId}"`,
      `"${p.category}"`,
      `"${p.predictionType}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.period}"`,
      p.confidence,
      `"${p.status}"`,
      `"${p.projectedValue} ${p.projectedUnit}"`,
      `"${p.recommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PREDIKSI_LAYANAN_RT07_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('info', 'Ekspor CSV Berhasil', 'Data wawasan prediksi telah diunduh.');
  };

  const getCategoryLabel = (cat: PredictionCategory) => {
    switch (cat) {
      case 'SURAT_ADMINISTRASI': return 'Surat & Administrasi';
      case 'KEGIATAN_WARGA': return 'Kegiatan Warga';
      case 'PEMELIHARAAN_FASILITAS': return 'Pemeliharaan Fasilitas';
      case 'PENGADUAN_LINGKUNGAN': return 'Pengaduan Lingkungan';
      case 'DATA_WARGA_BARU': return 'Warga Baru & Data';
      case 'KAS_OPERASIONAL': return 'Kas & Keuangan';
      default: return cat;
    }
  };

  const getCategoryIcon = (cat: PredictionCategory) => {
    switch (cat) {
      case 'SURAT_ADMINISTRASI': return <FileText className="w-4 h-4 text-sky-500" />;
      case 'KEGIATAN_WARGA': return <Calendar className="w-4 h-4 text-[#2E7D52]" />;
      case 'PEMELIHARAAN_FASILITAS': return <MapPin className="w-4 h-4 text-amber-500" />;
      case 'PENGADUAN_LINGKUNGAN': return <AlertTriangle className="w-4 h-4 text-[#C62828]" />;
      case 'DATA_WARGA_BARU': return <Users className="w-4 h-4 text-purple-500" />;
      case 'KAS_OPERASIONAL': return <Wallet className="w-4 h-4 text-emerald-600" />;
      default: return <TrendingUp className="w-4 h-4 text-[#D4A72C]" />;
    }
  };

  const getConfidenceBadge = (level: ConfidenceLevel, score: number) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Keyakinan Tinggi ({score}%)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Keyakinan Sedang ({score}%)
          </span>
        );
      case 'LOW':
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-500" /> Keyakinan Rendah ({score}%)
          </span>
        );
      default:
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-300">
            Data Terbatas
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Disetujui Pengurus
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> Dalam Peninjauan
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="bg-slate-400 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Ditutup / Selesai
          </span>
        );
      default:
        return (
          <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-1 rounded-xl border border-sky-300">
            Rekomendasi Baru
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Executive Scope */}
      <div className="bg-[#123B5D] text-white p-6 rounded-3xl shadow-xl border border-[#2E7D52] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C] shadow">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-base sm:text-lg">
                PREDIKSI KEBUTUHAN LAYANAN RT 07
              </h2>
              <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#D4A72C]">
                v1.0 STAT-RULE ENGINE
              </span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                SISTEM PENDUKUNG KEPUTUSAN
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Analisis Tren, Beban Fasilitas, Lonjakan Surat, dan Kesiapan Operasional Triwulan RT 07 GPA Ngijo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsTestRunnerOpen(true)}
            className="bg-[#2E7D52] hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 border border-[#D4A72C]"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
            <span>Gate Verifikasi (98 Test)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {(currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && (
            <button
              onClick={handleRegenerate}
              className="bg-[#D4A72C]/20 hover:bg-[#D4A72C]/30 text-[#D4A72C] text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-[#D4A72C]/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hitung Ulang</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Advisory Disclaimer & Human Oversight Notice */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950">
            Prinsip AI Safety & Akuntabilitas Pengurus RT:
          </p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Wawasan prediksi dan proyeksi pada halaman ini dihasilkan melalui kalkulasi statistik deskriptif &amp; rule-based inference berbasis data agregat. 
            <strong> Sistem ini murni bersifat pendukung keputusan (decision-support) dan tidak mengambil tindakan administratif secara otomatis.</strong> Keputusan resmi, penganggaran kas, dan tindak lanjut lapangan sepenuhnya berada di tangan Ketua RT dan Pengurus RT 07.
          </p>
        </div>
      </div>

      {/* 3. Executive KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Potensi Teridentifikasi</span>
              <Sparkles className="w-4 h-4 text-[#D4A72C]" />
            </div>
            <div className="text-2xl font-black text-slate-800">{summary.totalPredictions}</div>
            <p className="text-[11px] text-slate-500">6 Domain layanan RT 07 terpantau</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Keyakinan Tinggi (High)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{summary.highConfidenceCount}</div>
            <p className="text-[11px] text-emerald-600">Didukung data historis &gt; 80%</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dalam Peninjauan</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{summary.underReviewCount}</div>
            <p className="text-[11px] text-amber-600">Menunggu keputusan musyawarah</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-[#123B5D]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disetujui Pengurus</span>
              <ShieldCheck className="w-4 h-4 text-[#2E7D52]" />
            </div>
            <div className="text-2xl font-black text-[#123B5D]">{summary.acceptedCount}</div>
            <p className="text-[11px] text-slate-500">Rekomendasi masuk agenda kerja</p>
          </div>

        </div>
      )}

      {/* 4. Privacy & Anonymized Feature Vector Transparency */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#123B5D]" />
            <span className="text-xs font-bold text-slate-800">
              Transparansi Fitur Inferensi &amp; Kepatuhan UU PDP (Zero PII)
            </span>
          </div>
          <button
            onClick={() => setShowFeatureTransparency(!showFeatureTransparency)}
            className="text-xs font-bold text-[#123B5D] hover:underline flex items-center gap-1"
          >
            <span>{showFeatureTransparency ? 'Sembunyikan Agregat' : 'Lihat Ringkasan Fitur Agregat'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showFeatureTransparency ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {showFeatureTransparency && features && (
          <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Warga Aktif Terdata:</span>
                <strong className="text-slate-800">{features.totalActiveWarga} Jiwa</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Total KK:</span>
                <strong className="text-slate-800">{features.totalKK} Keluarga</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Komposisi Rumah:</span>
                <strong className="text-slate-800">{features.housingOwnerRatio}% Milik / {features.housingRenterRatio}% Kontrak</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Skor Kelengkapan Data:</span>
                <strong className="text-emerald-700">{features.dataCompletenessScore}% Lengkap</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              🔒 <strong>Jaminan PDP:</strong> Fitur ekstraksi hanya memproses rasio agregat, volume deret waktu, dan angka hitung total. Tidak ada NIK, Nomor KK, Tanggal Lahir, atau Nomor Telepon pribadi warga yang diproses atau disimpan pada layer inferensi ini.
            </p>
          </div>
        )}
      </div>

      {/* 5. Category Navigation Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
            selectedCategory === 'ALL'
              ? 'bg-[#123B5D] text-white shadow'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#D4A72C]" />
          <span>Semua Kategori ({predictions.length})</span>
        </button>

        {(['SURAT_ADMINISTRASI', 'PEMELIHARAAN_FASILITAS', 'KEGIATAN_WARGA', 'PENGADUAN_LINGKUNGAN', 'DATA_WARGA_BARU', 'KAS_OPERASIONAL'] as PredictionCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-[#123B5D] text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {getCategoryIcon(cat)}
            <span>{getCategoryLabel(cat)}</span>
          </button>
        ))}
      </div>

      {/* 6. Predictions Cards List */}
      <div className="space-y-4">
        {predictions.map(item => (
          <div 
            key={item.predictionId}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            {/* Top Bar: IDs, Category, Confidence, and Status */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-black text-[#123B5D] bg-slate-100 px-2.5 py-1 rounded-xl">
                  {item.predictionId}
                </span>
                <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {getCategoryIcon(item.category)}
                  {getCategoryLabel(item.category)}
                </span>
                {getConfidenceBadge(item.confidenceLevel, item.confidence)}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">
                  Periode: {item.period}
                </span>
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Metrics Projection & Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Left: Metric Comparison */}
              <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Proyeksi Kebutuhan Layanan
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#123B5D]">
                    {item.projectedValue}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {item.projectedUnit}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Kondisi baseline saat ini: <strong>{item.currentValue} {item.projectedUnit}</strong>
                </div>
                
                {/* Historical Sparkline/Points */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Tren Deret Waktu:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.historicalMetrics.map((hm, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 text-slate-700">
                        {hm.label}: <strong>{hm.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Evidence & Data Provenance */}
              <div className="md:col-span-8 space-y-2 md:pl-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Butir Bukti &amp; SSoT Provenance
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.dataPointsAnalyzed} data points dianalisis
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {item.evidence.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#2E7D52] font-black">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-400 pt-1 font-mono">
                  Sumber Data: {item.provenance}
                </p>
              </div>

            </div>

            {/* Advisory Action Recommendation Box */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-emerald-900 block">
                    Saran &amp; Rekomendasi Tindak Lanjut:
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                    {item.recommendation}
                  </p>
                </div>
              </div>

              {/* Action Button for Pengurus / Ketua RT */}
              {(currentRole === 'KETUA_RT' || currentRole === 'PENGURUS' || currentRole === 'ADMIN') && (
                <button
                  onClick={() => setSelectedPredictionForReview(item)}
                  className="bg-[#123B5D] hover:bg-[#1B4B75] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>Tinjau Rekomendasi</span>
                </button>
              )}
            </div>

            {/* Human Oversight Note Display (if reviewed) */}
            {item.reviewedBy && (
              <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <strong>Catatan Pengurus ({item.reviewedBy}):</strong> {item.reviewNote || 'Ditinjau tanpa catatan khusus.'}
                </div>
                {item.reviewedAt && (
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(item.reviewedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Review Modal */}
      <PredictionReviewModal
        isOpen={!!selectedPredictionForReview}
        onClose={() => setSelectedPredictionForReview(null)}
        prediction={selectedPredictionForReview}
        actor={actorSession}
        onSuccess={() => loadData()}
        addToast={addToast}
      />

      {/* Test Runner Modal */}
      <PredictionTestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

    </div>
  );
};
