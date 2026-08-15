/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Riwayat & Versioning Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React from 'react';
import {
  History,
  CheckCircle2,
  Calendar,
  UserCheck,
  FileText,
  GitBranch,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TataTertibHistory } from '../../types/tataTertib';

interface TataTertibRiwayatTabProps {
  history: TataTertibHistory[];
}

export const TataTertibRiwayatTab: React.FC<TataTertibRiwayatTabProps> = ({ history }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-[#123B5D]" />
            Riwayat Versi & Amandemen Tata Tertib
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Transparansi rekam jejak amandemen hukum lingkungan RT 07 RW 11 GPA Ngijo dari masa ke masa.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 border-l-2 border-slate-200 ml-4 space-y-8 py-2">
        {history.map((item, index) => {
          const isLatest = index === 0;

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                  isLatest
                    ? 'bg-emerald-500 border-emerald-100 text-white ring-4 ring-emerald-50'
                    : 'bg-slate-400 border-slate-100 text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              {/* Version Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#123B5D] transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-[#123B5D] flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-emerald-600" />
                      Versi {item.version}
                    </span>
                    {isLatest && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                        BERLAKU SAAT INI
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.effectiveDate}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {item.approvedBy}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ringkasan Perubahan:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {item.changeSummary}
                  </p>
                </div>

                {item.reason && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Dasar Pertimbangan / Alasan:</span>
                    <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>
                  </div>
                )}

                {item.changesList && item.changesList.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-700">Rincian Poin yang Disesuaikan:</span>
                    <ul className="mt-1 space-y-1">
                      {item.changesList.map((ch, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
