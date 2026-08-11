import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wallet, 
  AlertTriangle,
  Settings,
  User,
  Home,
  Bot
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (subTab: any) => void;
  openLetterModal: () => void;
  pendingSuratCount: number;
  activeAduanCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setTab,
  activeSubTab,
  setActiveSubTab,
  openLetterModal,
  pendingSuratCount,
  activeAduanCount
}) => {
  const handleNav = (subTab: string) => {
    setTab('dashboard');
    setActiveSubTab(subTab);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A2338]/95 backdrop-blur-md border-t border-slate-700/80 z-40 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        
        <button
          onClick={() => setTab('ai-chat')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'ai-chat'
              ? 'text-[#2E7D52] font-bold scale-105'
              : 'text-[#E9D8B4] hover:text-white'
          }`}
        >
          <Bot className="w-5 h-5 text-[#D4A72C]" />
          <span className="text-[10px] mt-0.5">AI Chat</span>
        </button>

        <button
          onClick={() => handleNav('overview')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'overview'
              ? 'text-[#D4A72C] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => handleNav('warga')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'warga'
              ? 'text-[#2E7D52] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Warga</span>
        </button>

        <button
          onClick={() => handleNav('surat')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'surat'
              ? 'text-[#D4A72C] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Surat</span>
          {pendingSuratCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 bg-[#C62828] text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white">
              {pendingSuratCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNav('keuangan')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'keuangan'
              ? 'text-[#2E7D52] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Kas RT</span>
        </button>

        <button
          onClick={() => handleNav('pengaduan')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'pengaduan'
              ? 'text-[#C62828] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Aduan</span>
          {activeAduanCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 bg-[#C62828] text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white">
              {activeAduanCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNav('pengaturan')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' && activeSubTab === 'pengaturan'
              ? 'text-[#D4A72C] font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>

      </div>
    </div>
  );
};
