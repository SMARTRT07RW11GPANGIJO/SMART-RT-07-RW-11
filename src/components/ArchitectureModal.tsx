import React, { useState } from 'react';
import { ARCHITECTURE_SECTIONS } from '../data/architectureDocs';
import { X, BookOpen, CheckCircle, ChevronRight, FileCode, ShieldAlert, Database, LayoutGrid } from 'lucide-react';

interface ArchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(ARCHITECTURE_SECTIONS[0].id);

  if (!isOpen) return null;

  const currentSection = ARCHITECTURE_SECTIONS.find((s) => s.id === selectedId) || ARCHITECTURE_SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center font-black text-[#D4A72C] border border-[#D4A72C]">
              T1
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                SPESIFIKASI DOKUMEN ARSITEKTUR TAHAP 1
                <span className="bg-[#2E7D52] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4A72C]">
                  APPROVED
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                SMART RT 07 RW 11 GPA NGIJO — Executive Summary & Technical Blueprint (Bagian A - J)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Left Menu / Index */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 p-3 overflow-y-auto shrink-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Daftar Spesifikasi Architecture (A-J)
            </span>
            <div className="space-y-1">
              {ARCHITECTURE_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedId(sec.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedId === sec.id
                      ? 'bg-[#123B5D] text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      selectedId === sec.id ? 'bg-[#2E7D52] text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {sec.code}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${selectedId === sec.id ? 'text-[#D4A72C]' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> Tahap 1 Selesai
              </span>
              <p className="text-[11px] text-amber-800 leading-snug">
                Arsitektur sistem telah siap dan siap dilanjutkan ke TAHAP 2 (Google Sheets Schema & Apps Script Engine).
              </p>
            </div>
          </div>

          {/* Right Content Reader */}
          <div className="flex-1 p-6 overflow-y-auto bg-white font-sans text-slate-800 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2E7D52] bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  SEKSI {currentSection.code}
                </span>
                <h2 className="text-xl font-bold text-[#123B5D] mt-2">{currentSection.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{currentSection.summary}</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-wrap font-mono bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 overflow-x-auto shadow-inner">
              {currentSection.contentMarkdown}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
