import React from 'react';
import { AIChat } from '../components/ai/AIChat';
import { UserRole } from '../types/rt';
import { Bot, ShieldCheck, Database, BookOpen, Activity } from 'lucide-react';

interface AIAssistantPageProps {
  currentRole: UserRole;
  userName?: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  currentRole,
  userName = 'Warga RT 07',
  addToast
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Page Header / Banner */}
      <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-[#0D2A4A] via-[#123B5D] to-[#2E7D52] rounded-2xl p-6 text-white shadow-lg border border-[#C89A2B]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2E7D52] border-2 border-[#C89A2B] flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                  AI Web Chat SMART RT 07
                </h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                  TAHAP 8G
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium">
                Asisten kecerdasan buatan terintegrasi RAG Knowledge Base, Data Access Layer (DAL), dan Keamanan Bertingkat untuk pelayanan administrasi warga RT 07 RW 11 Perum GPA Ngijo.
              </p>
            </div>
          </div>

          {/* System Metrics Pill List */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Security Guard Active
            </span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 text-[#E9D8B4]">
              <BookOpen className="w-3.5 h-3.5 text-[#C89A2B]" /> RAG KB v2.0
            </span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 text-blue-300">
              <Database className="w-3.5 h-3.5" /> DAL DTO Masked
            </span>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 text-purple-300">
              <Activity className="w-3.5 h-3.5" /> Audit Log 100%
            </span>
          </div>

        </div>
      </div>

      {/* Primary Chat Canvas */}
      <div className="max-w-7xl mx-auto">
        <AIChat currentRole={currentRole} userName={userName} addToast={addToast} />
      </div>

    </div>
  );
};
