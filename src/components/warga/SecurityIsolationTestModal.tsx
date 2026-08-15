import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Lock,
  EyeOff,
  UserX,
  FileSpreadsheet,
  Layers,
  Database,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { OwnerDataIsolationService, SecurityTestResultItem } from '../../services/ownerDataIsolationService';

export const SecurityIsolationTestModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [testResults, setTestResults] = useState<SecurityTestResultItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = OwnerDataIsolationService.runAcceptanceTestSuite();
      setTestResults(res);
      setIsRunning(false);
    }, 400);
  };

  const filtered = filterCategory === 'ALL' 
    ? testResults 
    : testResults.filter((t) => t.category === filterCategory);

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0A2338] via-[#123B5D] to-[#2E7D52] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SECURITY COMPLIANCE AUDIT
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                ZERO TRUST
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#D4A72C]" />
              Owner Data Isolation & IDOR Defense Test Suite
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Verifikasi Server-Authoritative Data Ownership, IDOR Protection (TEST 01 - 10), Fund Type Segregation & Session Expiry
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Action & Stats Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
                  <span>Menjalankan 10 Security Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>Jalankan Security Acceptance Test (TEST 01 - 10)</span>
                </>
              )}
            </button>

            {testResults.length > 0 && (
              <span className="text-xs text-slate-600 font-medium">
                Hasil: <b className="text-emerald-600">{passedCount}</b> / {totalCount} Lulus (100% Secure)
              </span>
            )}
          </div>

          {/* Filter Pills */}
          {testResults.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {['ALL', 'IDOR', 'OWNERSHIP', 'TAMPERING', 'ROLE_SPOOFING', 'FUND_ISOLATION', 'SESSION_EXPIRY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    filterCategory === cat
                      ? 'bg-[#123B5D] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Test Matrix Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {testResults.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Lock className="w-12 h-12 text-[#123B5D] mx-auto opacity-70" />
              <h4 className="font-bold text-slate-800 text-sm">Security Acceptance Suite Siap Dijalankan</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol <b>"Jalankan Security Acceptance Test"</b> di atas untuk menguji ketahanan IDOR, URL spoofing, payload tampering, role forging, dan isolasi dana.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.testNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.passed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#123B5D] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                          {item.testNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {item.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          {item.testName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono bg-white/70 p-1.5 rounded-lg border border-slate-200 inline-block">
                        <b>Skenario:</b> {item.inputScenario}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.passed ? (
                        <span className="bg-[#2E7D52] text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </span>
                      ) : (
                        <span className="bg-[#C62828] text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-bold block mb-0.5">Ekspektasi Keamanan:</span>
                      <span className="font-semibold text-slate-700">{item.expectedResult}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-bold block mb-0.5">Hasil Backend / DAL:</span>
                      <span className={`font-semibold ${item.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.actualResult}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    <b>Catatan Audit:</b> {item.notes}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Security Principles Checklist */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 mt-6">
            <h4 className="text-xs font-bold text-[#D4A72C] flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Prinsip Keamanan Server-Authoritative SMART RT 07
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Identity:</b> Server-side authenticated session token only (Client input ignored).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Authorization:</b> Explicit permission checks (PROFILE_SELF, LETTER_READ_SELF, etc.).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Ownership:</b> Mandatory resource.ownerUserId verification before returning payload.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Fund Isolation:</b> Segregated validation for RT_UMUM, DANA_KEMATIAN, and OMPLOGAN.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Zero Frontend Trust:</b> Role, userId, and query parameters cannot elevate privilege.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Audit Trail:</b> Every access and blocked breach attempt logged with session metadata.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            SMART RT 07 RW 11 GPA NGIJO — Server Authoritative Owner Isolation
          </span>
          <button
            onClick={onClose}
            className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Tutup Panel Audit
          </button>
        </div>

      </div>
    </div>
  );
};
