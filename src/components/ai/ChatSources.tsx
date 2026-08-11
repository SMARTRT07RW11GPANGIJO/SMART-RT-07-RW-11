import React from 'react';
import { SourceCard } from '../../types/ai';
import { BookOpen, CheckCircle2, Tag } from 'lucide-react';

interface ChatSourcesProps {
  sources: SourceCard[];
}

export const ChatSources: React.FC<ChatSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0D2A4A]">
        <BookOpen className="w-3.5 h-3.5 text-[#C89A2B]" />
        <span>Sumber Referensi Resmi (RAG Knowledge Base):</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, index) => (
          <div
            key={index}
            className="bg-[#0D2A4A]/5 border border-[#0D2A4A]/15 rounded-xl p-2.5 text-xs text-slate-800 space-y-1 shadow-2xs hover:border-[#C89A2B] transition-colors"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="font-bold text-[#0D2A4A] text-xs leading-tight line-clamp-1">
                {src.title}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  src.status === 'ACTIVE' || src.status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {src.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-600 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#C89A2B]" /> {src.category}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Versi {src.version}
              </span>
            </div>

            {src.snippet && (
              <p className="text-[10px] text-slate-500 italic line-clamp-2 pt-0.5 border-t border-slate-200/50">
                "{src.snippet}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
