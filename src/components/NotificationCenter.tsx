// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Notification Center Component for Real-time Activity Alerts

import React from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Play,
  CheckCircle,
  X,
  XCircle,
  Volume2
} from 'lucide-react';
import { NotificationItem, ActorSession, KegiatanRT } from '../types/activity';
import { activityCalendarService } from '../services/activityCalendarService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  actor: ActorSession;
  onSelectEvent: (kegiatanId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  actor,
  onSelectEvent
}) => {
  if (!isOpen) return null;

  const notifications = activityCalendarService.getNotifications(actor.userId);
  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  const handleMarkAllRead = () => {
    activityCalendarService.markAllNotificationsAsRead(actor.userId);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    activityCalendarService.markNotificationAsRead(item.notificationId);
    if (item.kegiatanId) {
      onSelectEvent(item.kegiatanId);
      onClose();
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'EVENT_NEW':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'EVENT_SCHEDULE_CHANGE':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'EVENT_CANCEL':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'EVENT_START':
        return <Play className="w-4 h-4 text-sky-600" />;
      case 'EVENT_COMPLETE':
        return <CheckCircle className="w-4 h-4 text-teal-600" />;
      case 'EVENT_REMINDER':
        return <Volume2 className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 mt-12 animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-5 py-4 text-white flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Pusat Notifikasi RT</h3>
              <p className="text-[11px] text-slate-300">
                {unreadCount > 0 ? `${unreadCount} pemberitahuan belum dibaca` : 'Semua sudah dibaca'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Tandai semua dibaca"
                className="text-xs text-slate-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Baca Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada notifikasi kegiatan saat ini.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.notificationId}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                  item.status === 'UNREAD' ? 'bg-emerald-50/40' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs ${item.status === 'UNREAD' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                  {item.status === 'UNREAD' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D52] mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
