import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  FileText, 
  Wallet, 
  Megaphone, 
  BookOpen, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { WargaNotificationItem } from '../../types/wargaDashboard';

interface WargaNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: WargaNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (target: string) => void;
}

export const WargaNotificationsModal: React.FC<WargaNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));

  const getIcon = (type: WargaNotificationItem['type']) => {
    switch (type) {
      case 'SURAT':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'IURAN':
      case 'DANA_KEMATIAN':
        return <Wallet className="w-4 h-4 text-[#2E7D52]" />;
      case 'OMPLOGAN':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      case 'TATA_TERTIB':
        return <BookOpen className="w-4 h-4 text-emerald-700" />;
      case 'PENGADUAN':
        return <AlertTriangle className="w-4 h-4 text-[#C62828]" />;
      case 'KEGIATAN':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'PENGUMUMAN':
      default:
        return <Megaphone className="w-4 h-4 text-indigo-600" />;
    }
  };

  const handleClickItem = (n: WargaNotificationItem) => {
    if (!n.isRead) {
      onMarkAsRead(n.id);
    }
    if (n.actionUrl) {
      onNavigate(n.actionUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#2E7D52] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 relative">
              <Bell className="w-5 h-5 text-[#D4A72C]" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pusat Notifikasi Warga</h3>
              <p className="text-[11px] text-slate-200">Info Layanan & Tagihan Terkini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Mark All Button */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'UNREAD'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Belum Dibaca ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>

          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] font-bold text-[#2E7D52] hover:underline flex items-center gap-1 shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-medium">Tidak ada notifikasi saat ini.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                className={`pt-2.5 first:pt-0 pb-1 cursor-pointer transition-all rounded-2xl p-2.5 hover:bg-slate-50 flex items-start gap-3 ${
                  !item.isRead ? 'bg-emerald-50/60 border border-emerald-200/80' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-bold text-xs text-slate-800 truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{item.message}</p>
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#2E7D52] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
