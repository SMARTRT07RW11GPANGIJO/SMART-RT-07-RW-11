import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Calendar,
  CreditCard,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { IdentityAuthService, LoginResult } from '../services/identityAuthService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { UserRole } from '../types/rt';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthoritativeSessionContext, isFirstLogin: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'WARGA_KK' | 'OFFICER'>('WARGA_KK');
  
  // Warga Form State
  const [nomorKK, setNomorKK] = useState('');
  const [wargaPassword, setWargaPassword] = useState('');
  const [showWargaPass, setShowWargaPass] = useState(false);

  // Officer Form State
  const [username, setUsername] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [showOfficerPass, setShowOfficerPass] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleWargaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const cleanKK = nomorKK.trim();
      const res: LoginResult = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: cleanKK,
        password: wargaPassword.trim()
      });

      if (res.success && res.session) {
        onLoginSuccess(res.session, !!res.forcePasswordChange);
        onClose();
      } else {
        setErrorMessage(res.error || 'Nomor KK atau password tidak sesuai.');
        if (res.remainingAttempts !== undefined) {
          setRemainingAttempts(res.remainingAttempts);
        }
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat memproses login. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const cleanUser = username.trim();
      const res: LoginResult = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: cleanUser,
        password: officerPassword.trim()
      });

      if (res.success && res.session) {
        onLoginSuccess(res.session, !!res.forcePasswordChange);
        onClose();
      } else {
        setErrorMessage(res.error || 'Username atau password tidak sesuai.');
        if (res.remainingAttempts !== undefined) {
          setRemainingAttempts(res.remainingAttempts);
        }
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat memproses login. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="login-modal-container"
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-[#123B5D] via-[#0A2338] to-[#123B5D] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2E7D52] flex items-center justify-center font-bold text-[#D4A72C] border border-[#D4A72C] shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider block">
                PORTAL RESMI WARGA
              </span>
              <h3 className="text-lg font-black text-white">
                Masuk Sistem RT 07 RW 11
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Perum GPA Ngijo, Karangploso • Layanan Mandiri Digital & Administrasi RT
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-1.5">
          <button
            type="button"
            onClick={() => { setActiveTab('WARGA_KK'); setErrorMessage(null); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'WARGA_KK'
                ? 'bg-white text-[#123B5D] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-[#2E7D52]" />
            Warga (Nomor KK)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('OFFICER'); setErrorMessage(null); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'OFFICER'
                ? 'bg-white text-[#123B5D] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#D4A72C]" />
            Pengurus & Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Gagal Masuk</span>
              <p className="leading-relaxed">{errorMessage}</p>
              {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 5 && (
                <p className="text-[11px] text-rose-700 font-semibold pt-1">
                  Sisa percobaan sebelum akun terkunci: {remainingAttempts} kali.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'WARGA_KK' ? (
            <form onSubmit={handleWargaSubmit} className="space-y-4">
              {/* Helper Badge for Warga */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aktivasi / Login Pertama Warga:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-700">
                  Gunakan <strong>Nomor KK (16 digit)</strong> dan password awal yaitu <strong>Tanggal Lahir Kepala Keluarga</strong> (contoh: <code>1982-08-15</code> atau <code>15-08-1982</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Kartu Keluarga (KK)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={nomorKK}
                    onChange={(e) => setNomorKK(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 3507120101150001"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D52] focus:border-[#2E7D52] font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {nomorKK.length}/16 digit angka
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password / Tanggal Lahir Kepala Keluarga
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showWargaPass ? 'text' : 'password'}
                    required
                    value={wargaPassword}
                    onChange={(e) => setWargaPassword(e.target.value)}
                    placeholder="Password atau YYYY-MM-DD"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D52] focus:border-[#2E7D52]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWargaPass(!showWargaPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showWargaPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || nomorKK.length !== 16 || !wargaPassword}
                className="w-full mt-2 bg-[#2E7D52] hover:bg-[#236340] disabled:bg-slate-300 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4A72C]/30 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Memverifikasi Identitas KK...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk ke Dashboard Warga</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOfficerSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Akses Pengurus & Administrator:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Gunakan username terdaftar (<code>pengurus_rt07</code>, <code>ketua_rt07</code>, atau <code>admin_rt07</code>) dan password resmi Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Pengurus / Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: pengurus_rt07"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:border-[#123B5D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Akun
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showOfficerPass ? 'text' : 'password'}
                    required
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="Masukkan password pengurus"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:border-[#123B5D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOfficerPass(!showOfficerPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showOfficerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !username || !officerPassword}
                className="w-full mt-2 bg-[#123B5D] hover:bg-[#0A2338] disabled:bg-slate-300 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4A72C]/40 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Mengautentikasi Akun...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#D4A72C]" />
                    <span>Masuk Panel Pengurus</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Helper Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Belum memiliki akses atau kendala data KK? Hubungi Sekretaris RT 07 via WhatsApp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
