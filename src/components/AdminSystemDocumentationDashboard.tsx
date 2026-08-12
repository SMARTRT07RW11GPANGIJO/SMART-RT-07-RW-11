import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/rt';
import {
  SystemDocumentationService,
  DocumentationMetadata,
  DocumentationSection,
  SopItem
} from '../services/systemDocumentationService';
import {
  BookOpen,
  Search,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Server,
  Database,
  Terminal,
  Layers,
  Save,
  AlertTriangle,
  LifeBuoy,
  UserCheck,
  UserX,
  Users,
  PhoneCall,
  Copy,
  Check,
  Download,
  Printer,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';

interface Props {
  currentUserRole: UserRole;
  onNavigateToControlCenter?: () => void;
}

type ViewTab = 'explorer' | 'onboarding' | 'offboarding' | 'sops' | 'drp' | 'busfactor';

export const AdminSystemDocumentationDashboard: React.FC<Props> = ({
  currentUserRole,
  onNavigateToControlCenter
}) => {
  const [metadata, setMetadata] = useState<DocumentationMetadata>(
    SystemDocumentationService.getMetadata()
  );
  const [sections, setSections] = useState<DocumentationSection[]>(
    SystemDocumentationService.getAllSections()
  );
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('explorer');
  const [selectedSection, setSelectedSection] = useState<DocumentationSection>(
    sections[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [sopList, setSopList] = useState<SopItem[]>([]);

  useEffect(() => {
    setSopList(SystemDocumentationService.getSopList());
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    const results = SystemDocumentationService.searchDocumentation(q);
    setSections(results);
    if (results.length > 0 && !results.some((s) => s.id === selectedSection.id)) {
      setSelectedSection(results[0]);
    }
  };

  const handleSelectSection = (section: DocumentationSection) => {
    setSelectedSection(section);
    SystemDocumentationService.logDocumentationView(section.id, currentUserRole);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(selectedSection.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredByCat = sections.filter((s) => {
    if (categoryFilter === 'ALL') return true;
    return s.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header with Official Metadata Specs */}
      <div className="bg-gradient-to-r from-[#0D2A4A] via-[#1E3A5F] to-[#0D2A4A] text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-emerald-400 text-slate-950 uppercase flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              TAHAP 9K — SYSTEM DOCUMENTATION
            </span>
            <span className="text-xs text-slate-300 font-mono">
              VERSION: {metadata.docVersion}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
              STATUS: {metadata.status}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            Dokumentasi Sistem & Operasional SMART RT
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Pusat pengetahun teknis & operasional komprehensif untuk arsitektur, skema database, spesifikasi API, keamanan, backup, SOP admin, disaster recovery, dan tata kelola rilis.
          </p>
        </div>

        {/* Status Metrics Box & Action Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 bg-slate-900/90 rounded-2xl border border-slate-700 flex items-center gap-4 shadow-inner font-mono text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Coverage</div>
              <div className="text-lg font-black text-emerald-400">{metadata.coveragePercent}%</div>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Terakhir Diperbarui</div>
              <div className="text-xs font-bold text-slate-200">{metadata.lastUpdated}</div>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Review Berikutnya</div>
              <div className="text-xs font-bold text-amber-300">{metadata.nextReview}</div>
            </div>
          </div>

          {onNavigateToControlCenter && (
            <button
              onClick={onNavigateToControlCenter}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Terminal className="w-4 h-4" />
              <span>Control Center (9J)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveViewTab('explorer')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'explorer'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Module Explorer (18 Sections)</span>
        </button>

        <button
          onClick={() => setActiveViewTab('onboarding')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'onboarding'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Admin Onboarding</span>
        </button>

        <button
          onClick={() => setActiveViewTab('offboarding')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'offboarding'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Admin Offboarding</span>
        </button>

        <button
          onClick={() => setActiveViewTab('sops')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'sops'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SOP Admin (15 Standard)</span>
        </button>

        <button
          onClick={() => setActiveViewTab('drp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'drp'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Disaster Recovery Plan</span>
        </button>

        <button
          onClick={() => setActiveViewTab('busfactor')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeViewTab === 'busfactor'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Bus Factor Protection</span>
        </button>
      </div>

      {/* VIEW TAB 1: MODULE EXPLORER */}
      {activeViewTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: SEARCH, CATEGORY FILTER & SECTION TREE (4 COLS) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari dokumentasi (api, database, sop)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D2A4A]"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {['ALL', 'CORE', 'INFRASTRUCTURE', 'SECURITY', 'OPERATIONS', 'GUIDE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#0D2A4A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Section List */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredByCat.map((section) => {
                const isSelected = selectedSection.id === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(section)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded bg-[#0D2A4A] text-white text-[10px] font-bold font-mono shrink-0 mt-0.5">
                      {section.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{section.title}</div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {section.summary}
                      </p>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: SELECTED SECTION DOCUMENT READER (8 COLS) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                    MODUL {selectedSection.number}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                    {selectedSection.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedSection.filePath}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedSection.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyContent}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>

            {/* Document Content Box */}
            <div className="p-5 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner whitespace-pre-wrap select-all">
              {selectedSection.content}
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" /> Verifikasi Keamanan Dokumen
              </div>
              <p className="text-[11px] text-blue-800/80">
                Seluruh kredensial rahasia, token API, dan password dalam modul ini telah disensor (`[REDACTED]`). Data warga menggunakan format sampel fiktif untuk menjaga kerahasiaan PII.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: ADMIN ONBOARDING */}
      {activeViewTab === 'onboarding' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">GUIDE</span>
              <span className="text-xs text-slate-400 font-mono">DOC-GUIDE-ONBOARDING</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">10-Step Administrator Onboarding Checklist</h2>
            <p className="text-xs text-slate-500 mt-1">
              Panduan orientasi wajib bagi administrator atau Ketua RT baru untuk menguasai pengoperasian SMART RT secara independen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: 1, title: 'Baca Sistem Overview & Arsitektur', desc: 'Pahami komponen React SPA, Express Server, Google Sheets DB, dan Rita AI.' },
              { step: 2, title: 'Penerimaan Kredensial Akun', desc: 'Terima akun dari Ketua RT / Admin lama dengan peranan ADMIN atau KETUA_RT.' },
              { step: 3, title: 'Login Pertama & Ubah Password', desc: 'Ubah kata sandi default menjadi kata sandi kompleks sesuai kebijakan keamanan.' },
              { step: 4, title: 'Pelajari Matriks Akses RBAC', desc: 'Pahami batas wewenang antara Admin, Ketua RT, Pengurus, dan Warga.' },
              { step: 5, title: 'Inspeksi Control Center (9J)', desc: 'Buka Control Center dan periksa System Health Score seluruh 9 sub-service.' },
              { step: 6, title: 'Uji Health Ping & Ping All', desc: 'Jalankan tes pings layanan di Control Center untuk memastikan status ONLINE.' },
              { step: 7, title: 'Eksekusi Backup & Restore Test', desc: 'Jalankan snapshot backup terisolasi dan verifikasi status hash SHA-256 PASS.' },
              { step: 8, title: 'Uji Coba Rita AI Assistant', desc: 'Lakukan interaksi kueri dengan Rita AI untuk memastikan filter PII aktif.' },
              { step: 9, title: 'Review 15 SOP Admin', desc: 'Pelajari prosedur persetujuan surat, kuitansi iuran, dan penanganan pengaduan.' },
              { step: 10, title: 'Penandatanganan Onboarding', desc: 'Selesaikan konfirmasi orientasi dan catat kejadian ke dalam Audit Trail.' }
            ].map((item) => (
              <div key={item.step} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0D2A4A] text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 3: ADMIN OFFBOARDING */}
      {activeViewTab === 'offboarding' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">GUIDE</span>
              <span className="text-xs text-slate-400 font-mono">DOC-GUIDE-OFFBOARDING</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">8-Step Admin Offboarding Protocol</h2>
            <p className="text-xs text-slate-500 mt-1">
              Prosedur pencabutan akses, rotasi rahasia sistem, dan pelimpahan tanggung jawab saat administrator melepaskan jabatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: 1, title: 'Nonaktifkan Akun & Revokasi Sesi', desc: 'Batalkan seluruh token sesi aktif dan ubah status akun menjadi INACTIVE di Control Center.' },
              { step: 2, title: 'Pelimpahan Wewenang Pendataan', desc: 'Alihkan seluruh pengajuan surat dan tiket pengaduan aktif ke admin penerus.' },
              { step: 3, title: 'Rotasi Secret System Server', desc: 'Rotasi WHATSAPP_API_TOKEN, GEMINI_API_KEY, dan GAS_SHARED_SECRET di environment variables.' },
              { step: 4, title: 'Pencabutan Akses Google Drive', desc: 'Hapus akun admin lama dari daftar Editor spreadsheet Google Sheets dan Drive Vault.' },
              { step: 5, title: 'Verifikasi Snapshot Backup', desc: 'Jalankan backup snapshot on-demand sebelum proses offboarding selesai.' },
              { step: 6, title: 'Audit Log Penelusuran Akses', desc: 'Periksa Audit Log untuk memastikan tidak ada tindakan tidak sah sebelum purna tugas.' },
              { step: 7, title: 'Pembaruan Kontak Darurat', desc: 'Perbarui daftar penanggung jawab di EMERGENCY_CONTACTS.md.' },
              { step: 8, title: 'Sign-Off Keamanan Akhir', desc: 'Catat peristiwa penyelesaian offboarding ke dalam Audit Trail.' }
            ].map((item) => (
              <div key={item.step} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-900 text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-rose-950">{item.title}</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 4: SOP DIRECTORY */}
      {activeViewTab === 'sops' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Daftar 15 Standard Operating Procedures (SOP Admin)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prosedur kerja standar operasional resmi untuk seluruh aktivitas administrasi SMART RT.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode SOP</th>
                  <th className="p-3">Nama SOP</th>
                  <th className="p-3">Penanggung Jawab (PIC)</th>
                  <th className="p-3">Tujuan Operasional</th>
                  <th className="p-3 text-center">Audit Req.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {sopList.map((sop) => (
                  <tr key={sop.code} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-[#0D2A4A]">{sop.code}</td>
                    <td className="p-3 font-semibold text-slate-900 font-sans">{sop.title}</td>
                    <td className="p-3 text-slate-600 font-sans">{sop.pic}</td>
                    <td className="p-3 text-slate-500 font-sans">{sop.purpose}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        REQUIRED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW TAB 5: DISASTER RECOVERY PLAN */}
      {activeViewTab === 'drp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Disaster Recovery Plan (DRP Scenarios)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Target Pemulihan Layanan: **RTO &lt; 30 Menit** | **RPO &lt; 24 Jam**.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold font-mono text-xs">
              DRP ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] font-mono">
                SKENARIO A — CRITICAL
              </span>
              <h3 className="text-xs font-bold text-slate-900">Kerusakan / Penghapusan Database Google Sheets</h3>
              <p className="text-[11px] text-slate-600">
                Aktifkan Mode Pemeliharaan di Control Center (9J), ambil snapshot terverifikasi dari Drive Folder `06_BACKUP`, dan jalankan `restoreService.ts`.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] font-mono">
                SKENARIO B — HIGH
              </span>
              <h3 className="text-xs font-bold text-slate-900">Vercel / Hosting Outage Down</h3>
              <p className="text-[11px] text-slate-600">
                Lakukan pengujian lokal `npm run build`, lalu re-deploy bundle `dist/server.cjs` menggunakan Vercel CLI atau re-trigger CI/CD pipeline.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] font-mono">
                SKENARIO C — MEDIUM
              </span>
              <h3 className="text-xs font-bold text-slate-900">WhatsApp Gateway Unresponsive</h3>
              <p className="text-[11px] text-slate-600">
                Periksa token di Control Center, re-issue bearer token, dan sistem akan mengirim notifikasi secara otomatis saat gateway kembali ONLINE.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] font-mono">
                SKENARIO D — CRITICAL
              </span>
              <h3 className="text-xs font-bold text-slate-900">Kebocoran Kredensial / Akses Tak Sah</h3>
              <p className="text-[11px] text-slate-600">
                Batalkan seluruh sesi di Control Center, rotasi `GEMINI_API_KEY`, `WHATSAPP_API_TOKEN`, dan `GAS_SHARED_SECRET`, lalu ubah kata sandi Admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 6: BUS FACTOR PROTECTION */}
      {activeViewTab === 'busfactor' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">"Bus Factor" Protection & Continuity Plan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sistem SMART RT dirancang agar **TIDAK PERNAH** bergantung pada satu individu. Jika pengelola utama tidak dapat dihubungi, pengelola cadangan dapat mengoperasikan sistem sepenuhnya berdasarkan dokumentasi ini.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Fungsi Utama</th>
                  <th className="p-3">Penanggung Jawab Utama</th>
                  <th className="p-3">Pengelola Cadangan (Delegasi)</th>
                  <th className="p-3">Tingkat Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-3 font-bold text-slate-900 font-sans">System Lead & DevOps</td>
                  <td className="p-3 text-slate-700">Lead System Admin</td>
                  <td className="p-3 text-emerald-700 font-bold">Backup Admin / DevOps 2</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">ADMIN</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 font-sans">Executive Sign-Off</td>
                  <td className="p-3 text-slate-700">Ketua RT 07</td>
                  <td className="p-3 text-emerald-700 font-bold">Wakil Ketua RT</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">KETUA_RT</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 font-sans">Operational Management</td>
                  <td className="p-3 text-slate-700">Sekertaris RT</td>
                  <td className="p-3 text-emerald-700 font-bold">Bendahara RT</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">PENGURUS</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 font-sans">AI & KB Management</td>
                  <td className="p-3 text-slate-700">AI Specialist</td>
                  <td className="p-3 text-emerald-700 font-bold">Lead System Admin</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">ADMIN</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
