import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  KeyRound, 
  Sparkles,
  Info
} from 'lucide-react';
import { IdentityAuthService, PasswordPolicyResult } from '../services/identityAuthService';
import { AuthoritativeSessionContext } from '../security/authorization';

interface FirstLoginChangePasswordModalProps {
  isOpen: boolean;
  session: AuthoritativeSessionContext;
  onPasswordChanged: (updatedSession: AuthoritativeSessionContext) => void;
}

export const FirstLoginChangePasswordModal: React.FC<FirstLoginChangePasswordModalProps> = ({
  isOpen,
  session,
  onPasswordChanged
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const policy: PasswordPolicyResult = IdentityAuthService.evaluatePasswordPolicy(
    newPassword,
    confirmPassword,
    {
      identifier: session.nomorKK || session.userId
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!policy.valid) {
      setErrorMessage(policy.errors[0] || 'Password belum memenuhi standar keamanan.');
      return;
    }

    setLoading(true);

    try {
      const res = await IdentityAuthService.changePassword(
        session.sessionId,
        newPassword.trim(),
        confirmPassword.trim()
      );

      if (res.success && res.session) {
        onPasswordChanged(res.session);
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan password baru.');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat memperbarui password. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="first-login-gate-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-500/40 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#123B5D] via-[#0A2338] to-[#123B5D] text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D52] flex items-center justify-center font-bold text-[#D4A72C] border-2 border-[#D4A72C] shadow-lg">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider block">
                GERBANG KEAMANAN RESMI (SECURITY GATE)
              </span>
              <h3 className="text-lg font-black text-white">
                Amankan Akun Anda
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Selamat datang, <strong>{session.namaLengkap || 'Warga RT 07'}</strong>. Untuk privasi dan perlindungan data keluarga, Anda <strong>wajib membuat password baru</strong> sebelum mengakses layanan mandiri RT.
          </p>
        </div>

        {/* Security Warning Box */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Tanggal lahir atau password sementara hanya berlaku untuk aktivasi awal. Buat password pribadi yang kuat dan rahasia.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter (huruf & angka)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D52] focus:border-[#2E7D52]"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru Anda"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D52] focus:border-[#2E7D52]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength Meter & Policy Checklist */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-600">Kekuatan Password:</span>
              <span className={`font-bold ${
                policy.strength === 'STRONG' ? 'text-emerald-700' :
                policy.strength === 'MEDIUM' ? 'text-amber-700' : 'text-rose-600'
              }`}>
                {policy.strength === 'STRONG' ? 'Sangat Kuat' :
                 policy.strength === 'MEDIUM' ? 'Cukup Aman' : 'Lemah / Belum Sesuai'}
              </span>
            </div>

            {/* Strength Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  policy.strength === 'STRONG' ? 'bg-[#2E7D52]' :
                  policy.strength === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${policy.score}%` }}
              />
            </div>

            <div className="space-y-1 pt-1 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Minimal 8 karakter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Kombinasi huruf dan angka</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Konfirmasi password sesuai</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !policy.valid}
            className="w-full mt-2 bg-[#2E7D52] hover:bg-[#236340] disabled:bg-slate-300 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-[#D4A72C]/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Mengenkripsi & Mengaktifkan Akun...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
                <span>Simpan Password & Masuk Portal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
