import React from 'react';
import { UserRole } from '../types/rt';
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
  MessageSquare
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentTab: string;
  setTab: (tab: string) => void;
  openLetterModal: () => void;
  openComplaintModal: () => void;
  openArchModal: () => void;
  openWaModal: () => void;
  openArchiveModal: () => void;
  openSecurityModal?: () => void;
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
  openSecurityModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (tabId: string) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#123B5D] text-white shadow-md border-b border-[#2E7D52]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E7D52] to-[#123B5D] p-0.5 border border-[#D4A72C] flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#123B5D] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Building2 className="w-6 h-6 text-[#D4A72C]" />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-white bg-[#C62828] px-1 rounded">07</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide leading-tight">SMART RT 07</span>
                <span className="bg-[#2E7D52] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4A72C]">RW 11</span>
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-tight">Perum GPA Ngijo, Karangploso</p>
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
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-[#2E7D52] text-white shadow-sm' 
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              PORTAL DASHBOARD
            </button>

            <button
              onClick={() => handleNavClick('verify')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'verify' 
                  ? 'bg-[#2E7D52] text-white shadow-sm' 
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
              VERIFIKASI SURAT
            </button>

            <button
              onClick={openArchiveModal}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-400/40 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              ARSIP SURAT (TAHAP 5)
            </button>

            <button
              onClick={openArchModal}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-[#D4A72C]/20 text-[#D4A72C] hover:bg-[#D4A72C]/30 border border-[#D4A72C]/40 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              SPESIFIKASI
            </button>

            <button
              onClick={openWaModal}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-400/50 shadow transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              WA BOT (TAHAP 4)
            </button>

            {openSecurityModal && (
              <button
                onClick={openSecurityModal}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-400/50 shadow transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                SECURITY & BACKUP
              </button>
            )}
          </nav>

          {/* Quick Actions & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={openLetterModal}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow border border-[#D4A72C]/30 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              AJUKAN SURAT
            </button>

            {/* Role Switcher for Testing */}
            <div className="relative group">
              <div className="bg-[#0A2338] border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <User className="w-3.5 h-3.5 text-[#D4A72C]" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 leading-none">Role Simulasi:</span>
                  <span className="font-bold text-white leading-none">{currentRole}</span>
                </div>
              </div>
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover:block z-50 text-slate-800 text-xs">
                <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase border-b border-slate-100">Pilih Role Simulasi</div>
                <button onClick={() => setRole('PUBLIC')} className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 font-medium ${currentRole==='PUBLIC'?'text-[#2E7D52] font-bold':''}`}>PUBLIC (Warga Umum)</button>
                <button onClick={() => setRole('WARGA')} className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 font-medium ${currentRole==='WARGA'?'text-[#2E7D52] font-bold':''}`}>WARGA TERVERIFIKASI</button>
                <button onClick={() => setRole('PENGURUS')} className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 font-medium ${currentRole==='PENGURUS'?'text-[#2E7D52] font-bold':''}`}>PENGURUS RT</button>
                <button onClick={() => setRole('KETUA_RT')} className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 font-medium ${currentRole==='KETUA_RT'?'text-[#2E7D52] font-bold':''}`}>KETUA RT 07</button>
                <button onClick={() => setRole('ADMIN')} className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 font-medium ${currentRole==='ADMIN'?'text-[#2E7D52] font-bold':''}`}>ADMIN RT (Full Access)</button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A2338] border-b border-slate-700 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'landing' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'dashboard' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              PORTAL DASHBOARD
            </button>
            <button
              onClick={() => handleNavClick('verify')}
              className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${currentTab === 'verify' ? 'bg-[#2E7D52] text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              VERIFIKASI SURAT
            </button>
            <button
              onClick={() => { openArchModal(); setMobileMenuOpen(false); }}
              className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-[#D4A72C]/20 text-[#D4A72C]"
            >
              SPESIFIKASI
            </button>
            <button
              onClick={() => { openWaModal(); setMobileMenuOpen(false); }}
              className="px-3 py-2 rounded-lg text-xs font-bold text-center bg-emerald-700 text-white flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WA BOT
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => { openLetterModal(); setMobileMenuOpen(false); }}
              className="w-full bg-[#2E7D52] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              AJUKAN SURAT PENGANTAR
            </button>

            <button
              onClick={() => { openComplaintModal(); setMobileMenuOpen(false); }}
              className="w-full bg-[#C62828] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              KIRIM PENGADUAN WARGA
            </button>
          </div>

          {/* Role selector in mobile */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">GANTI ROLE SIMULASI:</label>
            <div className="flex flex-wrap gap-1">
              {(['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${currentRole === r ? 'bg-[#D4A72C] text-[#123B5D]' : 'bg-slate-800 text-slate-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
