import React from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Home, 
  Phone, 
  Mail, 
  Users, 
  QrCode, 
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { WargaProfileSummary } from '../../types/wargaDashboard';

interface WargaProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WargaProfileSummary;
}

export const WargaProfileModal: React.FC<WargaProfileModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#2E7D52] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Profil Warga Terdaftar</h3>
              <p className="text-[11px] text-slate-200">SMART RT 07 RW 11 GPA Ngijo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Identity Card Mini Banner */}
          <div className="bg-gradient-to-br from-[#0A2338] to-[#123B5D] p-4 sm:p-5 rounded-3xl text-white border-2 border-[#D4A72C]/40 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#D4A72C]" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-200">KARTU DIGITAL WARGA RT 07</span>
              </div>
              <span className="bg-[#2E7D52] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                TERVERIFIKASI
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2E7D52] to-[#D4A72C] p-0.5 shrink-0 shadow">
                <div className="w-full h-full bg-[#123B5D] rounded-[14px] flex items-center justify-center text-[#D4A72C] font-black text-xl">
                  {profile.namaLengkap.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-bold text-base text-white truncate">{profile.namaLengkap}</h4>
                <p className="text-xs text-[#D4A72C] font-semibold">{profile.statusKeluarga}</p>
                <p className="text-[11px] text-slate-300">RT {profile.rt} / RW {profile.rw} • {profile.perumahan}</p>
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-300 block">Alamat / Lokasi Rumah:</span>
                <span className="font-bold text-white">{profile.blok}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl">
                <QrCode className="w-6 h-6 text-[#D4A72C]" />
                <span className="text-[10px] text-slate-300 font-mono">ID: {profile.idWarga}</span>
              </div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider">
              Data Kependudukan Resmi
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Nomor Induk Kependudukan</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{profile.nikMasked}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Nomor Kartu Keluarga</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{profile.noKkMasked}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Status Domisili</span>
                <span className="font-bold text-[#2E7D52] flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Warga {profile.statusWarga} (Aktif)
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Anggota Keluarga</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> {profile.jumlahAnggotaKeluarga} Jiwa Terdaftar
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">WhatsApp / No. HP</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {profile.noHp}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Terhubung</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-[11px] border border-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2E7D52] shrink-0 mt-0.5" />
            <p>
              Data Anda terlindungi oleh sistem otorisasi tingkat lanjut (DAL). Anda hanya dapat melihat data kependudukan keluarga Anda sendiri.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold py-3 rounded-2xl transition-all shadow text-xs"
          >
            Tutup Profil
          </button>

        </div>

      </div>
    </div>
  );
};
