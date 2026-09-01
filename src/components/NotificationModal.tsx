import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Calendar, 
  AlertCircle, 
  Heart, 
  CheckCheck, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { AppNotification, User } from '../types';
import { StoreController } from '../controllers/storeController';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToTab
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StoreController.getNotifications());

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(StoreController.getNotifications());
    };
    window.addEventListener('pata-data-change', handleUpdate);
    return () => window.removeEventListener('pata-data-change', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    StoreController.markAllNotificationsRead();
    setNotifications(StoreController.getNotifications());
  };

  const handleNotificationClick = (notif: AppNotification) => {
    StoreController.markNotificationRead(notif.id);
    setNotifications(StoreController.getNotifications());
    if (notif.linkTab && onNavigateToTab) {
      onNavigateToTab(notif.linkTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-12 animate-in slide-in-from-top-4 duration-200">
        {/* Modal Header */}
        <div className="bg-[#2C1E14] px-5 py-4 text-white flex items-center justify-between border-b border-[#3D2C1F]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <Bell className="w-4 h-4 text-[#9E6B38]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-['Fraunces',serif]">
                Notificaciones y Avisos de Brigadas
              </h3>
              <p className="text-[11px] text-[#D8C7BA]">
                Purificación, Tolima
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#D8C7BA] hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between text-xs">
          <span className="text-[#6E574B] font-semibold">
            {notifications.filter(n => !n.read).length} avisos sin leer
          </span>
          <button
            onClick={handleMarkAllAsRead}
            className="text-[#9E6B38] hover:text-[#86582A] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Marcar todo como leído</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F5EDE2] p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <Bell className="w-8 h-8 text-[#D8C7BA] mx-auto opacity-50" />
              <p className="text-xs text-[#8A7568]">
                No tienes notificaciones pendientes.
              </p>
            </div>
          ) : (
            notifications.map(notif => {
              const getIcon = () => {
                switch (notif.type) {
                  case 'evento':
                    return <Calendar className="w-4 h-4 text-[#9E6B38]" />;
                  case 'reporte':
                    return <AlertCircle className="w-4 h-4 text-red-600" />;
                  case 'adopcion':
                    return <Heart className="w-4 h-4 text-emerald-600" />;
                  default:
                    return <Bell className="w-4 h-4 text-[#9E6B38]" />;
                }
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex gap-3 ${
                    notif.read
                      ? 'bg-white hover:bg-[#FAF6F0]'
                      : 'bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFD3] flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon()}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#2C1E14] truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#9E6B38] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C4538] leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#8A7568] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9E6B38]" />
                        {notif.timestamp}
                      </span>
                      {notif.linkTab && (
                        <span className="text-[#9E6B38] font-semibold flex items-center gap-0.5">
                          <span>Ver detalle</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#FAF6F0] border-t border-[#E8DFD3] text-center">
          <p className="text-[11px] text-[#8A7568]">
            🔔 Notificaciones automáticas de proximidad de eventos y rescates en Purificación.
          </p>
        </div>
      </div>
    </div>
  );
};
