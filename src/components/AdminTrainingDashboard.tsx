import React, { useState } from 'react';
import {
  UserRole
} from '../types/rt';
import {
  TrainingService,
  TrainingRecord,
  TrainingKPI,
  QuizQuestion,
  PracticalLabScenario
} from '../services/trainingService';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  CheckSquare,
  ShieldAlert,
  Server,
  FileText,
  UserCheck,
  Building2,
  Key,
  Database,
  Printer,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

interface Props {
  currentUserRole: UserRole;
  onNavigateToControlCenter?: () => void;
}

type TabType = 'overview' | 'handbooks' | 'simulations' | 'exam' | 'certificates' | 'records';

export const AdminTrainingDashboard: React.FC<Props> = ({ currentUserRole, onNavigateToControlCenter }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [kpi, setKpi] = useState<TrainingKPI>(TrainingService.getKPI());
  const [records, setRecords] = useState<TrainingRecord[]>(TrainingService.getRecords());
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(TrainingService.isTrainingModeActive());

  // Handbook Viewer State
  const [selectedRoleForHandbook, setSelectedRoleForHandbook] = useState<UserRole>('WARGA');

  // Exam Simulator State
  const [selectedExamRole, setSelectedExamRole] = useState<UserRole>('WARGA');
  const [examQuestions, setExamQuestions] = useState(TrainingService.getQuizBank('WARGA'));
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, number>>({});
  const [practicalAnswers, setPracticalAnswers] = useState<Record<string, number>>({});
  const [securityAnswers, setSecurityAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [lastExamResult, setLastExamResult] = useState<TrainingRecord | null>(null);
  const [traineeName, setTraineeName] = useState('Budi Santoso (Peserta Test)');

  // Simulation State
  const [activeSimStep, setActiveSimStep] = useState<number>(0);
  const [selectedLabId, setSelectedLabId] = useState<string>('LAB-01');
  const [simLog, setSimLog] = useState<string[]>([]);

  // Search Records
  const [searchQuery, setSearchQuery] = useState('');

  // Certificate Modal / View State
  const [selectedCertRecord, setSelectedCertRecord] = useState<TrainingRecord | null>(null);

  const handleToggleTrainingMode = (checked: boolean) => {
    setIsTrainingMode(checked);
    TrainingService.setTrainingMode(checked);
  };

  const handleRoleChangeForExam = (role: UserRole) => {
    setSelectedExamRole(role);
    setExamQuestions(TrainingService.getQuizBank(role));
    setTheoryAnswers({});
    setPracticalAnswers({});
    setSecurityAnswers({});
    setExamSubmitted(false);
    setLastExamResult(null);
  };

  const handleSubmitExam = () => {
    const result = TrainingService.evaluateExam(
      `USR-${Math.floor(100 + Math.random() * 900)}`,
      traineeName,
      selectedExamRole,
      theoryAnswers,
      practicalAnswers,
      securityAnswers,
      examQuestions,
      'System Evaluator 9L'
    );
    setLastExamResult(result);
    setExamSubmitted(true);
    setRecords(TrainingService.getRecords());
    setKpi(TrainingService.getKPI());
  };

  const handleRunSimulationStep = (lab: PracticalLabScenario) => {
    if (activeSimStep < lab.steps.length) {
      const stepMsg = `[${new Date().toLocaleTimeString()}] STEP ${activeSimStep + 1}: ${lab.steps[activeSimStep]}`;
      setSimLog(prev => [stepMsg, ...prev]);
      setActiveSimStep(prev => prev + 1);
    }
  };

  const resetSimulation = () => {
    setActiveSimStep(0);
    setSimLog([]);
  };

  const filteredRecords = records.filter(r => 
    r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const labs = TrainingService.getPracticalLabs();
  const currentLab = labs.find(l => l.id === selectedLabId) || labs[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* 🟢 TOP BAR HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> TAHAP 9L — TRAINING SYSTEM
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px] font-bold">
              {kpi.version}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Sistem Pelatihan Resmi SMART RT 07 RW 11
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Prinsip: TEORI → DEMO → PRAKTIK → SIMULASI → EVALUASI → LULUS → SERTIFIKASI → ROLE ACTIVATION
          </p>
        </div>

        {/* Training Environment Mode Switcher & Control Center Link */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
            isTrainingMode 
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>TRAINING ENVIRONMENT:</span>
            <button
              onClick={() => handleToggleTrainingMode(!isTrainingMode)}
              className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-black transition-all ${
                isTrainingMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isTrainingMode ? 'ACTIVE (DUMMY DATA)' : 'INACTIVE (PROD)'}
            </button>
          </div>

          {onNavigateToControlCenter && (
            <button
              onClick={onNavigateToControlCenter}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Control Center 9J</span>
            </button>
          )}
        </div>
      </div>

      {/* 📊 KPI METRICS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Peserta</span>
          <span className="text-2xl font-black text-white font-mono">{kpi.totalParticipants} Orang</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-900/50 space-y-1">
          <span className="text-emerald-400 text-[10px] font-mono uppercase block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Lulus & Certified
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{kpi.totalCertified} Orang</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-rose-900/50 space-y-1">
          <span className="text-rose-400 text-[10px] font-mono uppercase block flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Remedial Required
          </span>
          <span className="text-2xl font-black text-rose-400 font-mono">{kpi.totalRemedial} Orang</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-amber-900/50 space-y-1">
          <span className="text-amber-400 text-[10px] font-mono uppercase block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Belum Training
          </span>
          <span className="text-2xl font-black text-amber-300 font-mono">{kpi.totalBelumTraining} Orang</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-blue-900/50 space-y-1">
          <span className="text-blue-400 text-[10px] font-mono uppercase block flex items-center gap-1">
            <Award className="w-3 h-3" /> Overall Pass Rate
          </span>
          <span className="text-2xl font-black text-blue-300 font-mono">{kpi.passRate}%</span>
        </div>
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-purple-900/50 space-y-1">
          <span className="text-purple-400 text-[10px] font-mono uppercase block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Security Pass Rate
          </span>
          <span className="text-2xl font-black text-purple-300 font-mono">{kpi.securityPassRate}%</span>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Overview & Governance
        </button>

        <button
          onClick={() => setActiveTab('handbooks')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'handbooks'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Modul & Handbooks (1-4)
        </button>

        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'simulations'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Play className="w-4 h-4" /> Praktik Labs & DR (A-G)
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'exam'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Quiz & Security Exam
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'certificates'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Sertifikat Terverifikasi
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'records'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Data Peserta & Status
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & GOVERNANCE */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Principles Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl border border-blue-900/60 shadow-lg space-y-4">
            <div className="flex items-center gap-3 border-b border-blue-800/50 pb-3">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Prinsip Tatakelola Pelatihan (Training Governance)</h3>
                <p className="text-xs text-slate-300">Akses penuh diberikan hanya jika lulus pelatihan & verifikasi keamanan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block font-mono">1. TRAINING ≠ DEMO</span>
                <p className="text-slate-300">
                  Pelatihan wajib melalui tahap Teori, Demo, Praktik, Simulasi, Evaluasi, Lulus, baru Aktivasi Role.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block font-mono">2. FORMULA AUTHORIZATION</span>
                <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  AKSES = ROLE + PERMISSION + TRAINING + AUTHORIZATION
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400 block font-mono">3. COMPULSORY SECURITY TEST</span>
                <p className="text-slate-300">
                  Security Test bernilai bobot 20% dan WAJIB LULUS 100%. Gagal di Security Test = REMEDIAL.
                </p>
              </div>
            </div>
          </div>

          {/* Level Matrix Table */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Matriks 4 Level Pelatihan Resmi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* LEVEL 1: WARGA */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-blue-400">LEVEL 1 — WARGA</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold">
                    10 MODUL
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <li>• Login & Logout</li>
                  <li>• Profil Warga & Surat</li>
                  <li>• Tracking & Iuran RT</li>
                  <li>• Pengaduan & WA Bot</li>
                  <li>• Rita AI Assistant</li>
                  <li>• Keamanan Akun</li>
                </ul>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex justify-between">
                  <span>Certified Rate:</span>
                  <span>{kpi.certifiedByRole.WARGA?.rate || 100}%</span>
                </div>
              </div>

              {/* LEVEL 2: PENGURUS */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-emerald-400">LEVEL 2 — PENGURUS</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                    12 MODUL
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <li>• Role & Permission</li>
                  <li>• Verifikasi Surat</li>
                  <li>• Pengelolaan Pengaduan</li>
                  <li>• Iuran & WA Broadcast</li>
                  <li>• Audit Log Operasional</li>
                  <li>• Incident Handling</li>
                </ul>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex justify-between">
                  <span>Certified Rate:</span>
                  <span>{kpi.certifiedByRole.PENGURUS?.rate || 100}%</span>
                </div>
              </div>

              {/* LEVEL 3: KETUA RT */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-purple-400">LEVEL 3 — KETUA RT</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold">
                    12 MODUL
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <li>• Dashboard Executive</li>
                  <li>• Review & Approval</li>
                  <li>• Tanda Tangan Digital</li>
                  <li>• Laporan Kas & Warga</li>
                  <li>• Security Awareness</li>
                  <li>• Broadcast Review</li>
                </ul>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex justify-between">
                  <span>Certified Rate:</span>
                  <span>{kpi.certifiedByRole.KETUA_RT?.rate || 100}%</span>
                </div>
              </div>

              {/* LEVEL 4: ADMIN */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-amber-400">LEVEL 4 — ADMIN</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold">
                    20 MODUL
                  </span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <li>• User & Role Mgmt</li>
                  <li>• Security & Secrets</li>
                  <li>• Backup & Restore</li>
                  <li>• Monitoring 24 Jam</li>
                  <li>• Disaster Recovery A-G</li>
                  <li>• Vercel & GAS Mgmt</li>
                </ul>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex justify-between">
                  <span>Certified Rate:</span>
                  <span>{kpi.certifiedByRole.ADMIN?.rate || 100}%</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MODUL & HANDBOOKS */}
      {/* ========================================================================= */}
      {activeTab === 'handbooks' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">PILIH LEVEL HANDBOOK:</span>
            {(['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'] as UserRole[]).forEach}
            <div className="flex gap-2">
              {(['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleForHandbook(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRoleForHandbook === r
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Handbook Content Cards */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                HANDBOOK & QUICK START GUIDE: LEVEL {selectedRoleForHandbook}
              </h3>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                Official Document v1.0
              </span>
            </div>

            {selectedRoleForHandbook === 'WARGA' && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">Modul Warga (WARGA-01 s/d WARGA-10)</h4>
                  <p>1. WARGA-01 Pengenalan SMART RT: Layanan portal publik mandiri RT 07 RW 11.</p>
                  <p>2. WARGA-02 Login & Logout: Menggunakan NIK terverifikasi & password aman.</p>
                  <p>3. WARGA-03 Profil Warga: Memeriksa data keluarga dan status kependudukan.</p>
                  <p>4. WARGA-04 Pengajuan Surat: Formulir otomatis Surat Pengantar KTP, KK, & Keterangan.</p>
                  <p>5. WARGA-05 Tracking Surat: Memantau proses verifikasi Pengurus hingga Tanda Tangan Ketua RT.</p>
                  <p>6. WARGA-06 Iuran RT: Memeriksa tagihan dan riwayat pembayaran iuran warga.</p>
                  <p>7. WARGA-07 Pengaduan: Menyampaikan aspirasi, kendala, atau laporan fasilitas.</p>
                  <p>8. WARGA-08 WhatsApp Notification: Menerima update otomatis status surat & pengumuman.</p>
                  <p>9. WARGA-09 AI Assistant (Rita): Memanfaatkan Rita AI untuk FAQ dan panduan warga.</p>
                  <p>10. WARGA-10 Keamanan Data: Menjaga kerahasiaan NIK, Password, dan keamanan akun.</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-blue-400 text-sm">Quick Start Guide Warga (1 Halaman)</h4>
                  <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-200">
                    <li>Login dengan NIK dan Password Anda.</li>
                    <li>Buka menu Profil untuk memastikan data keluarga sudah sesuai.</li>
                    <li>Pilih 'Pengajuan Surat' jika memerlukan Surat Pengantar RT.</li>
                    <li>Cek status pengajuan di menu 'Tracking Surat'.</li>
                    <li>Lihat riwayat pembayaran iuran di menu 'Iuran'.</li>
                    <li>Sampaikan laporan fasilitas di menu 'Pengaduan'.</li>
                    <li>Tanya Rita AI Assistant jika membutuhkan bantuan cepat.</li>
                  </ol>
                </div>
              </div>
            )}

            {selectedRoleForHandbook === 'PENGURUS' && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">Modul Pengurus (PENGURUS-01 s/d PENGURUS-12)</h4>
                  <p>PENGURUS-01 Role & Permission: Batas kewenangan operasional Pengurus.</p>
                  <p>PENGURUS-03 Verifikasi Surat: Peninjauan identitas NIK/KK & kelengkapan berkas.</p>
                  <p>PENGURUS-04 Pengelolaan Pengaduan: Assignment, investigasi, dan resolusi status.</p>
                  <p>PENGURUS-06 Iuran: Verifikasi transfer warga dan penerbitan kuitansi.</p>
                  <p>PENGURUS-10 Data Protection: Klasifikasi data CONFIDENTIAL & HIGHLY CONFIDENTIAL.</p>
                  <p>PENGURUS-12 SOP Pelayanan: 15 SOP standar pelayanan administrasi warga.</p>
                </div>
              </div>
            )}

            {selectedRoleForHandbook === 'KETUA_RT' && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-purple-400 text-sm">Modul Ketua RT (KETUA-01 s/d KETUA-12)</h4>
                  <p>KETUA-01 Dashboard Executive: Monitoring kesehatan sistem & antrean persetujuan.</p>
                  <p>KETUA-03 Approval Final: Pengambilan keputusan persetujuan/penolakan surat.</p>
                  <p>KETUA-04 Digital Signature: Tanda Tangan Digital & QR Code sah.</p>
                  <p>KETUA-08 Broadcast Pengumuman: Alur review & pengiriman pengumuman massal.</p>
                  <p>KETUA-10 Security Awareness: Mitigasi Phishing, Account Takeover, & kebocoran data.</p>
                </div>
              </div>
            )}

            {selectedRoleForHandbook === 'ADMIN' && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">Modul Admin (ADMIN-01 s/d ADMIN-20)</h4>
                  <p>ADMIN-01 Arsitektur Sistem: Full-stack React 19, Vite, Express, GAS, Vercel, & Gemini.</p>
                  <p>ADMIN-06 Security Operations: Firewalls, Rate Limits, & Secret Rotation.</p>
                  <p>ADMIN-15 Backup & Restore: Daily Snapshot (06:00 WIB) & Checksum SHA-256.</p>
                  <p>ADMIN-17 Disaster Recovery: Skenario DR CASE A-G & Penanganan Insiden RTO &lt; 30m.</p>
                  <p>ADMIN-19 Cryptographic Audit Log: SHA-256 hash chaining tamper-evident logging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRAKTIK LABS & DISASTER RECOVERY */}
      {/* ========================================================================= */}
      {activeTab === 'simulations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lab Selector Sidebar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                Katalog Praktik Labs & DR
              </h3>

              <div className="space-y-2">
                {labs.map(lab => (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setSelectedLabId(lab.id);
                      resetSimulation();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1 ${
                      selectedLabId === lab.id
                        ? 'bg-emerald-950/80 border-emerald-500/80 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className={lab.category === 'DISASTER_RECOVERY' ? 'text-amber-400' : 'text-blue-400'}>
                        {lab.id}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        lab.category === 'DISASTER_RECOVERY' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-blue-950 text-blue-300'
                      }`}>
                        {lab.category}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200 line-clamp-1">{lab.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Lab Execution Interactive Canvas */}
            <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                    Interactive Lab Scenario
                  </span>
                  <h3 className="text-lg font-bold text-white">{currentLab.title}</h3>
                </div>
                <button
                  onClick={resetSimulation}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {currentLab.description}
              </p>

              {/* Step Progress Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase">
                  Langkah-Langkah Simulasi ({activeSimStep} / {currentLab.steps.length})
                </span>
                <div className="space-y-2">
                  {currentLab.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        idx < activeSimStep
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : idx === activeSimStep
                          ? 'bg-blue-950/60 border-blue-600 text-white font-bold animate-pulse'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-60">#{idx + 1}</span>
                        <span>{step}</span>
                      </div>
                      {idx < activeSimStep ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono opacity-50">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleRunSimulationStep(currentLab)}
                  disabled={activeSimStep >= currentLab.steps.length}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeSimStep >= currentLab.steps.length
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{activeSimStep >= currentLab.steps.length ? 'Lab Completed' : 'Jalankan Langkah Berikutnya'}</span>
                </button>

                {activeSimStep >= currentLab.steps.length && (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PASSED EXECUTED
                  </span>
                )}
              </div>

              {/* Simulation Log Console */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[10px]">
                  <span>Console Execution Log</span>
                  <span>{simLog.length} Records</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {simLog.length === 0 ? (
                    <span className="text-slate-600 italic">Tekan 'Jalankan Langkah Berikutnya' untuk memulai simulasi...</span>
                  ) : (
                    simLog.map((log, i) => (
                      <div key={i} className="text-emerald-400">{log}</div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUIZ & SECURITY EXAM SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            
            {/* Exam Setup Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" /> Ujian Evaluasi & Security Test
                </h3>
                <p className="text-xs text-slate-400">
                  Bobot: Teori 30% + Praktik 50% + Security 20% (Compulsory 100% Required).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">ROLE UJIAN:</span>
                {(['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleChangeForExam(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedExamRole === r
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Trainee Name Input */}
            <div className="max-w-md space-y-1">
              <label className="text-xs font-bold text-slate-300">Nama Peserta Ujian:</label>
              <input
                type="text"
                value={traineeName}
                onChange={e => setTraineeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Questions Form */}
            {!examSubmitted ? (
              <div className="space-y-6">
                
                {/* Section 1: Teori */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> BAGIAN 1: UJIAN TEORI (BOBOT 30%)
                  </h4>
                  {examQuestions.theory.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-white">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                            <input
                              type="radio"
                              name={q.id}
                              checked={theoryAnswers[q.id] === oIdx}
                              onChange={() => setTheoryAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              className="accent-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section 2: Praktik */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> BAGIAN 2: SIMULASI PRAKTIK (BOBOT 50%)
                  </h4>
                  {examQuestions.practical.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-white">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                            <input
                              type="radio"
                              name={q.id}
                              checked={practicalAnswers[q.id] === oIdx}
                              onChange={() => setPracticalAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              className="accent-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section 3: Security Test (Compulsory) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> BAGIAN 3: SECURITY TEST (BOBOT 20% - COMPULSORY 100%)
                    </h4>
                    <span className="text-[10px] text-rose-400 font-mono font-bold uppercase bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      Wajib Lulus 100%
                    </span>
                  </div>
                  {examQuestions.security.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-rose-950/60 space-y-3">
                      <p className="text-xs font-bold text-white">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                            <input
                              type="radio"
                              name={q.id}
                              checked={securityAnswers[q.id] === oIdx}
                              onChange={() => setSecurityAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              className="accent-rose-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSubmitExam}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit & Evaluasi Hasil Ujian
                  </button>
                </div>

              </div>
            ) : (
              /* Exam Result Banner */
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase block">Hasil Ujian Evaluasi</span>
                    <h3 className="text-lg font-black text-white">{traineeName} ({selectedExamRole})</h3>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold uppercase border ${
                    lastExamResult?.status === 'CERTIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-rose-950 text-rose-300 border-rose-600'
                  }`}>
                    STATUS: {lastExamResult?.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Nilai Teori (30%)</span>
                    <span className="text-xl font-bold text-blue-300">{lastExamResult?.theoryScore} / 100</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Nilai Praktik (50%)</span>
                    <span className="text-xl font-bold text-emerald-300">{lastExamResult?.practicalScore} / 100</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Security Score (20%)</span>
                    <span className={`text-xl font-bold ${lastExamResult?.securityPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {lastExamResult?.securityScore} / 100
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">NILAI AKHIR</span>
                    <span className="text-2xl font-black text-white">{lastExamResult?.finalScore}</span>
                  </div>
                </div>

                {!lastExamResult?.securityPass && (
                  <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <strong className="block font-bold">REMEDIAL REQUIRED — SECURITY TEST FAILED</strong>
                      <span>Peserta tidak mencapai 100% pada Security Test (Compulsory). Akses role tidak dapat diaktifkan sebelum lulus retest keamanan.</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setExamSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    Ulangi Ujian (Retest)
                  </button>

                  {lastExamResult?.status === 'CERTIFIED' && (
                    <button
                      onClick={() => {
                        setSelectedCertRecord(lastExamResult);
                        setActiveTab('certificates');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" /> Lihat & Cetak Sertifikat
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SERTIFIKAT TERVERIFIKASI */}
      {/* ========================================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Sertifikat Pelatihan Resmi Terverifikasi
              </h3>
              <span className="text-xs text-slate-400 font-mono">Verifikasi QR Code Online</span>
            </div>

            {/* Certificate Selector dropdown */}
            <div className="max-w-md space-y-1">
              <label className="text-xs font-bold text-slate-300">Pilih Peserta Lulus:</label>
              <select
                onChange={e => {
                  const rec = records.find(r => r.trainingId === e.target.value);
                  setSelectedCertRecord(rec || null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- Pilih Sertifikat --</option>
                {records.filter(r => r.status === 'CERTIFIED').map(r => (
                  <option key={r.trainingId} value={r.trainingId}>
                    {r.nama} ({r.role}) - {r.certificateId}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Template Card */}
            {selectedCertRecord ? (
              <div className="p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-emerald-500/60 shadow-2xl space-y-6 text-center max-w-3xl mx-auto print:bg-white print:text-black">
                
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs font-mono font-bold">
                    <GraduationCap className="w-4 h-4" /> SMART RT 07 RW 11 — PERUM GPA NGIJO
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">SERTIFIKAT PELATIHAN RESMI</h2>
                  <p className="text-xs font-mono text-emerald-400">CERTIFICATE OF TRAINING COMPLETION</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Diberikan kepada:</p>
                  <h3 className="text-xl font-bold text-white underline decoration-emerald-500 underline-offset-8">
                    {selectedCertRecord.nama}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Atas kelulusannya pada Pelatihan Tingkat: <strong className="text-emerald-400">{selectedCertRecord.moduleLevel}</strong> ({selectedCertRecord.role})
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">NILAI AKHIR</span>
                    <span className="font-bold text-emerald-400 text-lg">{selectedCertRecord.finalScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SECURITY TEST</span>
                    <span className="font-bold text-emerald-400 text-lg">PASS (100%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">TANGGAL LULUS</span>
                    <span className="font-bold text-slate-200 text-xs">{selectedCertRecord.tanggal}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-left text-xs font-mono text-slate-400">
                  <div>
                    <span className="block text-[10px]">Certificate ID:</span>
                    <span className="font-bold text-emerald-400">{selectedCertRecord.certificateId}</span>
                    <span className="block text-[10px] mt-1">Trainer: {selectedCertRecord.trainer}</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-700 text-slate-950 text-center space-y-1">
                    <div className="w-16 h-16 bg-slate-950 rounded flex items-center justify-center text-white text-[8px] font-bold p-1">
                      [QR VERIFY]
                    </div>
                    <span className="text-[8px] font-bold block text-slate-900">VERIFIED OFFICIAL</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Cetak / Unduh PDF Sertifikat
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
                Pilih peserta dari dropdown di atas untuk melihat tampilan resmi sertifikat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DATA PESERTA & STATUS */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" /> Training Records & Authorization Status
              </h3>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, role, status..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-3">Training ID</th>
                    <th className="py-3 px-3">Nama & Role</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3">Scores (T/P/S)</th>
                    <th className="py-3 px-3">Nilai Akhir</th>
                    <th className="py-3 px-3">Security</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecords.map(r => (
                    <tr key={r.trainingId} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3 text-slate-400">{r.trainingId}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{r.nama}</span>
                        <span className="text-[10px] text-blue-400">{r.role}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[10px]">{r.moduleLevel}</td>
                      <td className="py-3 px-3 text-slate-300">
                        {r.theoryScore} / {r.practicalScore} / {r.securityScore}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{r.finalScore}</td>
                      <td className="py-3 px-3">
                        {r.securityPass ? (
                          <span className="text-emerald-400 font-bold">PASS</span>
                        ) : (
                          <span className="text-rose-400 font-bold">FAIL</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          r.status === 'CERTIFIED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : r.status === 'REMEDIAL'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {r.status === 'CERTIFIED' ? (
                          <button
                            onClick={() => {
                              setSelectedCertRecord(r);
                              setActiveTab('certificates');
                            }}
                            className="text-[10px] text-emerald-400 hover:underline font-bold"
                          >
                            Sertifikat
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedExamRole(r.role);
                              setTraineeName(r.nama);
                              setActiveTab('exam');
                            }}
                            className="text-[10px] text-amber-400 hover:underline font-bold"
                          >
                            Retest Ujian
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

    </div>
  );
};
