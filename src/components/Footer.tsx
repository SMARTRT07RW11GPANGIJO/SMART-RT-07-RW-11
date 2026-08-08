import React from 'react';
import { Building2, Phone, Mail, MapPin, Shield, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  setTab: (tab: string) => void;
  openArchModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setTab, openArchModal }) => {
  return (
    <footer className="bg-[#0A2338] text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D52] p-0.5 border border-[#D4A72C] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">RT 07 RW 11 GPA NGIJO</h3>
                <p className="text-xs text-slate-400">Kec. Karangploso, Kab. Malang</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ekosistem tata kelola digital terpadu RT 07 RW 11 Perum GPA Ngijo. Mewujudkan pelayanan publik yang mudah, transparan, akuntabel, dan humanis.
            </p>
            <div className="inline-block bg-[#2E7D52]/20 border border-[#2E7D52]/50 text-[#2E7D52] font-semibold text-xs px-3 py-1 rounded-full">
              "Bersama Melayani, Bersama Membangun"
            </div>
          </div>

          {/* Navigasi Utama */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-[#D4A72C]">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab('landing')} className="hover:text-white transition-colors">
                  Home & Portal Publik
                </button>
              </li>
              <li>
                <button onClick={() => setTab('dashboard')} className="hover:text-white transition-colors">
                  Dashboard Administrasi RT
                </button>
              </li>
              <li>
                <button onClick={() => setTab('verify')} className="hover:text-white transition-colors">
                  Verifikasi Surat (\`/verify\`)
                </button>
              </li>
              <li>
                <button onClick={openArchModal} className="text-[#D4A72C] font-semibold hover:underline flex items-center gap-1">
                  Spesifikasi & Arsitektur TAHAP 1
                </button>
              </li>
            </ul>
          </div>

          {/* Layanan Warga */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-[#D4A72C]">Layanan Warga</h4>
            <ul className="space-y-2 text-xs">
              <li>Surat Pengantar KTP / KK</li>
              <li>Surat Domisili & Surat Keterangan Usaha</li>
              <li>Pelaporan Pengaduan & Aspirasi Lingkungan</li>
              <li>Informasi Iuran & Transparansi Keuangan Kas</li>
              <li>Agenda Gotong-Royong & Kegitan Warga</li>
            </ul>
          </div>

          {/* Kontak & Sekretariat */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-[#D4A72C]">Sekretariat RT</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                <span>Perum GPA Ngijo Blok C, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <a href="mailto:rt07rw11.gpa@gmail.com" className="hover:text-white">rt07rw11.gpa@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2E7D52] shrink-0" />
                <span>WhatsApp RT: 0812-3456-7890</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SMART RT 07 RW 11 Perum GPA Ngijo. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-[#2E7D52]" /> Google Workspace & GAS Integrated
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
