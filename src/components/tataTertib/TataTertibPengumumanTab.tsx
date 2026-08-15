/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Pengumuman & Broadcast Perubahan Tata Tertib v1.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Share2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import { TataTertibHistory, TataTertibSummaryStats } from '../../types/tataTertib';

interface TataTertibPengumumanTabProps {
  history: TataTertibHistory[];
  stats: TataTertibSummaryStats;
  currentRole: UserRole | string;
}

export const TataTertibPengumumanTab: React.FC<TataTertibPengumumanTabProps> = ({
  history,
  stats,
  currentRole
}) => {
  const [copied, setCopied] = useState(false);
  const latestRev = history[0] || {
    version: stats.activeVersion,
    effectiveDate: stats.effectiveDate,
    changeSummary: 'Pemberlakuan Buku Tata Tertib Warga RT 07 RW 11 GPA Ngijo Resmi.',
    reason: 'Penyelarasan ketertiban lingkungan komplek.',
    changesList: [
      'Penataan parkir kendaraan roda 4 di bahu jalan komplek.',
      'Jam tutup portal malam pukul 23.00 WIB.',
      'Ketentuan iuran kas RT, kebersihan, dan dana kematian.'
    ]
  };

  const announcementText = `📢 *PENGUMUMAN RESMI TATA TERTIB WARGA RT 07 RW 11* 📢
*Perum Graha Permata Anugrah (GPA) Desa Ngijo*

Berdasarkan hasil Musyawarah Warga & Pengurus RT 07, telah diberlakukan:
📜 *TATA TERTIB WARGA VERSI ${latestRev.version}*
📅 Berlaku Efektif: *${latestRev.effectiveDate}*

*Ringkasan Pembaruan:*
${latestRev.changeSummary}

*Poin Utama Aturan:*
${(latestRev.changesList || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

Silakan seluruh warga RT 07 membuka Portal SMART RT untuk membaca rincian lengkap pasal dan mengonfirmasi pemahaman aturan:
🌐 https://smart-rt-07.web.app/

*Pengurus & Ketua RT 07 RW 11 GPA Ngijo*
_Bapak Sutrisno, M.P._`;

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(announcementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(announcementText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Official Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-[#123B5D] p-6 rounded-2xl text-white shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20">
            <Megaphone className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
              PEMBERITAHUAN RESMI RT 07
            </span>
            <h2 className="text-xl font-black mt-1">Pemberlakuan Tata Tertib Warga Versi {latestRev.version}</h2>
            <p className="text-xs text-amber-100 mt-0.5">Disahkan oleh Ketua RT 07 RW 11 GPA Ngijo pada tanggal {latestRev.effectiveDate}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs text-slate-100 leading-relaxed">
          <p className="font-bold text-amber-200 mb-1">Maksud & Tujuan Perubahan:</p>
          <p>{latestRev.changeSummary}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Sebarkan ke Grup WhatsApp Warga
          </button>

          <button
            onClick={handleCopyBroadcast}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Teks Tersalin!' : 'Salin Format Pengumuman'}
          </button>
        </div>
      </div>

      {/* Broadcast Preview Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#123B5D]" />
          Format Teks Broadcast WhatsApp RT 07
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
          {announcementText}
        </div>
      </div>
    </div>
  );
};
