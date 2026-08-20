// SMART RT 07 RW 11 GPA NGIJO - AI SOURCE CITATION INDICATOR
// Transparent Knowledge Citation with Strict Verified vs Reference Unverified Badges

import React, { useState } from 'react';
import { AISourceCitation } from '../../types/aiAgent';
import { ShieldCheck, AlertTriangle, BookOpen, Database, ChevronDown, ChevronUp, Layers, ExternalLink } from 'lucide-react';

interface AISourceIndicatorProps {
  sources: AISourceCitation[];
}

export const AISourceIndicator: React.FC<AISourceIndicatorProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const verifiedCount = sources.filter((s) => s.isVerifiedRealWorld).length;
  const referenceCount = sources.filter((s) => !s.isVerifiedRealWorld).length;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg bg-slate-100/70 hover:bg-slate-200/70"
        aria-label="Toggle Source Citations"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-[11px]">
            Sumber Data Terverifikasi ({sources.length})
          </span>
          {verifiedCount > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> {verifiedCount} Verified
            </span>
          )}
          {referenceCount > 0 && (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> {referenceCount} Referensi
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
          {isExpanded ? <span>Tutup</span> : <span>Rincian</span>}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-1 pr-1">
          {sources.map((source, index) => {
            const isRef = !source.isVerifiedRealWorld || source.verificationStatus === 'REFERENCE_UNVERIFIED';

            return (
              <div
                key={source.sourceId || index}
                className={`p-2.5 rounded-xl border transition-all ${
                  isRef
                    ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                    : 'bg-white border-emerald-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    {isRef ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <span className="truncate">{source.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      isRef
                        ? 'bg-amber-200/80 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isRef ? 'REFERENCE_UNVERIFIED' : 'FIELD_VERIFIED'}
                  </span>
                </div>

                {source.snippet && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 font-normal">
                    {source.snippet}
                  </p>
                )}

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Klasifikasi: {source.layer.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-[9px] text-slate-400">{source.sourceId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
