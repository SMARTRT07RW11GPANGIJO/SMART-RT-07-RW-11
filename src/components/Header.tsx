import React from 'react';
import { UserRole } from '../types/rt';
import { AuthoritativeSessionContext } from '../security/authorization';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  FileText,
  HelpCircle, 
  Smartphone, 
  Menu, 
  X,
  BookOpen,
  MessageSquare,
  Server,
  Activity,
  Bot,
  Award,
  Bell,
  Flame,
  Lock,
  Terminal,
  GraduationCap,
  Rocket,
  FileSpreadsheet,
  LogIn,
  LogOut,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentTab: string;
  setTab: (tab: string) => void;
  openLetterModal?: () => void;
  openComplaintModal: () => void;
  openArchModal: () => void;
  openWaModal: () => void;
  openArchiveModal: () => void;
  openLoginModal?: () => void;
  onLogout?: () => void;
  sessionContext?: AuthoritativeSessionContext | null;
  openSecurityModal?: () => void;
  openSystemModal?: () => void;
  openMonitorModal?: () => void;
  openAiPermissionsModal?: () => void;
  openAiToolsModal?: () => void;
  openAiAuditModal?: () => void;
  openAiEvalModal?: () => void;
  openAiProductionModal?: () => void;
  openProductionMonitoringModal?: () => void;
  openProductionAlertsModal?: () => void;
  openBackupVerificationModal?: () => void;
  openDisasterRecoveryModal?: () => void;
  openSecurityOpsModal?: () => void;
  openContinuousEvalModal?: () => void;
  openFinanceModal?: () => void;
  openTataTertibModal?: () => void;
  openOmplonganModal?: () => void;
  openGoogleSheetsModal?: () => void;
  openDeathFundModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  currentTab,
  setTab,
  openLetterModal,
  openComplaintModal,
  openArchModal,
  openWaModal,
  openArchiveModal,
  openLoginModal,
  onLogout,
  sessionContext,
  openSecurityModal,
  openSystemModal,
  openMonitorModal,
  openAiPermissionsModal,
  openAiToolsModal,
  openAiAuditModal,
  openAiEvalModal,
  openAiProductionModal,
  openProductionMonitoringModal,
  openProductionAlertsModal,
  openBackupVerificationModal,
  openDisasterRecoveryModal,
  openSecurityOpsModal,
  openContinuousEvalModal,
  openFinanceModal,
  openTataTertibModal,
  openOmplonganModal,
  openGoogleSheetsModal,
  openDeathFundModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (tabId: string) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  const handlePortalDashboardClick = () => {
    setMobileMenuOpen(false);
    if (currentRole === 'PUBLIC') {
      if (openLoginModal) {
        openLoginModal();
      } else {
        handleNavClick('dashboard');
      }
    } else {
      handleNavClick('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#123B5D] text-white shadow-md border-b border-[#2E7D52]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group notranslate"
            translate="no"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E7D52] to-[#123B5D] p-0.5 border border-[#D4A72C] flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#123B5D] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Building2 className="w-6 h-6 text-[#D4A72C]" />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-white bg-[#C62828] px-1 rounded">07</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide leading-tight notranslate" translate="no">SMART RT 07</span>
                <span className="bg-[#2E7D52] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4A72C] notranslate" translate="no">RW 11</span>
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-tight notranslate" translate="no">Perum GPA Ngijo, Karangploso</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'landing' 
                  ? 'bg-[#2E7D52] text-white shadow-sm' 
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              HOME
            </button>

            <button
              onClick={handlePortalDashboardClick}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-[#2E7D52] text-white shadow-sm' 
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              PORTAL DASHBOARD
            </button>
          </nav>

          {/* Quick Actions & Role Switcher */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Real Identity Authentication Button or Authenticated Pill */}
            {sessionContext && sessionContext.isValid && currentRole !== 'PUBLIC' ? (
              <div className="flex items-center gap-2 bg-[#0A2338] border border-emerald-500/40 rounded-xl px-2.5 py-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2E7D52] flex items-center justify-center font-bold text-white text-xs border border-[#D4A72C]">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-white leading-tight max-w-[130px] truncate">
                      {sessionContext.namaLengkap || sessionContext.userId}
                    </span>
                    <span className="block text-[9px] font-mono text-emerald-400 leading-none">
                      {sessionContext.role === 'WARGA' && sessionContext.nomorKK 
                        ? `KK: ${sessionContext.nomorKK.slice(0, 4)}••••${sessionContext.nomorKK.slice(-4)}`
                        : sessionContext.role}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Keluar / Logout"
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              openLoginModal && (
                <button
                  onClick={openLoginModal}
                  className="bg-gradient-to-r from-[#123B5D] to-[#0A2338] hover:from-[#0A2338] hover:to-[#051421] text-[#D4A72C] hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow border border-[#D4A72C]/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  MASUK / LOGIN
                </button>
              )
            )}

            {/* Hamburger button for Desktop & Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 border border-slate-700 ml-1"
              title="Menu Navigasi Lengkap"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#D4A72C]" />}
            </button>
          </div>

          {/* Mobile Menu Button (< sm) */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Navigation Drawer (Desktop & Mobile) */}
      {mobileMenuOpen && (
        <div className="bg-[#0A2338] border-b border-slate-700 px-4 sm:px-8 pt-3 pb-6 space-y-4 shadow-2xl animate-fadeIn">
          {/* Section 1: Modul Utama & Layanan Publik */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-2">
              Layanan Warga & Lingkungan RT 07
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              <button
                onClick={() => handleNavClick('landing')}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'landing' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                HOME
              </button>
              <button
                onClick={handlePortalDashboardClick}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'dashboard' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                PORTAL DASHBOARD
              </button>
              <button
                onClick={() => handleNavClick('fasilitas')}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'fasilitas' || currentTab === 'gis' ? 'bg-[#2E7D52] text-white' : 'bg-emerald-950 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-900'}`}
              >
                🗺️ FASILITAS & GIS
              </button>
              <button
                onClick={() => handleNavClick('verify')}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'verify' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-[#D4A72C]" /> VERIFIKASI SURAT
              </button>
              <button
                onClick={() => { openWaModal(); setMobileMenuOpen(false); }}
                className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-emerald-700 text-white hover:bg-emerald-600 flex items-center justify-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WA BOT
              </button>
              {openTataTertibModal && (
                <button
                  onClick={() => { openTataTertibModal(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-emerald-900/90 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-800 flex items-center justify-center gap-1 shadow"
                >
                  📜 TATA TERTIB
                </button>
              )}
              {openDeathFundModal && (
                <button
                  onClick={() => { openDeathFundModal(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-gradient-to-r from-teal-800 to-emerald-900 text-teal-100 border border-teal-400/60 hover:from-teal-700 shadow"
                >
                  🕊️ DANA KEMATIAN
                </button>
              )}
              {openOmplonganModal && (
                <button
                  onClick={() => { openOmplonganModal(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-gradient-to-r from-[#C62828] via-[#123B5D] to-[#2E7D52] text-white border border-[#D4A72C]/60 hover:brightness-110 shadow"
                >
                  🇮🇩 OMPLONGAN
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Panel Pengurus RT & Admin (Role-Based) */}
          {(currentRole === 'PENGURUS' || currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block mb-2">
                Panel Pengurus RT & Administrasi (Role: {currentRole})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {openGoogleSheetsModal && (
                  <button
                    onClick={() => { openGoogleSheetsModal(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-emerald-800 text-emerald-100 border border-emerald-400/60 shadow hover:bg-emerald-700 flex items-center justify-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" /> GOOGLE SHEETS
                  </button>
                )}
                {openFinanceModal && (
                  <button
                    onClick={() => { openFinanceModal(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#D4A72C]/30 text-[#D4A72C] border border-[#D4A72C]/60 hover:bg-[#D4A72C]/40 shadow flex items-center justify-center gap-1"
                  >
                    💰 KEUANGAN RT
                  </button>
                )}
                <button
                  onClick={() => { openArchiveModal(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-blue-900/70 text-blue-200 border border-blue-400/40 hover:bg-blue-800 flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" /> ARSIP SURAT
                </button>
                {openSecurityOpsModal && (
                  <button
                    onClick={() => { openSecurityOpsModal(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#0D2A4A] text-[#E9D8B4] border border-[#C89A2B]/60 hover:bg-[#1E3A5F] flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-indigo-400" /> Keamanan Sistem
                  </button>
                )}
                {openDisasterRecoveryModal && (
                  <button
                    onClick={() => { openDisasterRecoveryModal(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#5A1E1B] text-[#E9D8B4] border border-[#C89A2B]/60 hover:bg-[#7A2824] flex items-center justify-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Pemulihan Sistem
                  </button>
                )}
                {openBackupVerificationModal && (
                  <button
                    onClick={() => { openBackupVerificationModal(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#0D2A4A] text-white border border-[#C89A2B]/60 hover:bg-[#1E3A5F] flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verifikasi Backup
                  </button>
                )}
                <button
                  onClick={() => { setTab('control-center-9j'); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-emerald-950 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-900 flex items-center justify-center gap-1"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Pusat Kontrol
                </button>
                <button
                  onClick={() => { setTab('system-docs-9k'); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#0D2A4A] text-emerald-300 border border-emerald-400/60 hover:bg-[#1E3A5F] flex items-center justify-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Panduan Sistem
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => { openComplaintModal(); setMobileMenuOpen(false); }}
              className="w-full bg-[#C62828] hover:bg-[#A32020] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              KIRIM PENGADUAN WARGA
            </button>
          </div>

          {/* Mobile Login / User Profile */}
          <div className="pb-2 border-b border-slate-800">
            {sessionContext && sessionContext.isValid && currentRole !== 'PUBLIC' ? (
              <div className="flex items-center justify-between bg-slate-900/90 border border-emerald-500/40 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2E7D52] flex items-center justify-center font-bold text-white text-xs border border-[#D4A72C]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">
                      {sessionContext.namaLengkap || sessionContext.userId}
                    </span>
                    <span className="block text-[10px] font-mono text-emerald-400">
                      {sessionContext.role === 'WARGA' && sessionContext.nomorKK 
                        ? `KK: ${sessionContext.nomorKK.slice(0, 4)}••••${sessionContext.nomorKK.slice(-4)}`
                        : sessionContext.role}
                    </span>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 text-[11px] font-bold border border-rose-800 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar
                  </button>
                )}
              </div>
            ) : (
              openLoginModal && (
                <button
                  onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                  className="w-full bg-[#D4A72C] text-[#123B5D] font-black text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  MASUK / LOGIN RESMI WARGA & PENGURUS
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};
