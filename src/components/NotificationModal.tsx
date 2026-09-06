import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Calendar, 
  AlertCircle, 
  Heart, 
  CheckCheck, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';
import { AppNotification, User } from '../types';
import { StoreController } from '../controllers/storeController';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onNavigateToTab?: (tab: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToTab,
  onOpenAuth
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    currentUser ? StoreController.getUserNotifications(currentUser) : []
  );

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(currentUser ? StoreController.getUserNotifications(currentUser) : []);
    };
    window.addEventListener('pata-data-change', handleUpdate);
    window.addEventListener('pata-notifications-change', handleUpdate);
    return () => {
      window.removeEventListener('pata-data-change', handleUpdate);
      window.removeEventListener('pata-notifications-change', handleUpdate);
    };
  }, [currentUser]);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin' || 
    (currentUser?.email && ['fundacionpataamigatol@gmail.com', 'admin@pataamiga.org', 'alcaldia@purificacion-tolima.gov.co'].includes(currentUser.email.toLowerCase().trim()));

  const handleMarkAllAsRead = () => {
    StoreController.markAllUserNotificationsRead(currentUser);
    setNotifications(StoreController.getUserNotifications(currentUser));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    StoreController.markUserNotificationRead(notif.id);
    setNotifications(StoreController.getUserNotifications(currentUser));
    if (notif.linkTab && onNavigateToTab) {
      onNavigateToTab(notif.linkTab);
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                Avisos y Recordatorios
              </h3>
              <p className="text-[11px] text-[#D8C7BA]">
                {currentUser ? `Bandeja de ${currentUser.name}` : 'Comunidad de Purificación, Tolima'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#D8C7BA] hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode A: User NOT logged in - Do NOT show any notifications, prompt login/register */}
        {!currentUser ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#9E6B38] mx-auto flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#9E6B38]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-[#2C1E14] font-['Fraunces',serif]">
                Inicia sesión para ver tus notificaciones
              </h4>
              <p className="text-xs text-[#6E574B] leading-relaxed max-w-xs mx-auto">
                Para consultar las actualizaciones de tus postulaciones de adopción y recordatorios de brigadas veterinarias en Purificación, ingresa con tu cuenta.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full py-2.5 px-4 bg-[#2C1E14] hover:bg-[#3D2C1F] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#9E6B38]" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('register');
                }}
                className="w-full py-2.5 px-4 bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#2C1E14] border border-[#E8DFD3] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#9E6B38]" />
                <span>Registrarme Gratis</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#F5EDE2] text-[11px] text-[#8A7568]">
              Pata Amiga Purificación • Resguardo y Bienestar Animal
            </div>
          </div>
        ) : (
          <>
            {/* Admin Quick Switch Notice if user is Admin */}
            {isAdmin && (
              <div className="bg-amber-50/90 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                  <span>¿Buscas las alertas del panel? Están en tu <strong>Buzón Interno</strong></span>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('admin');
                    onClose();
                  }}
                  className="text-xs font-bold text-[#9E6B38] hover:underline shrink-0 cursor-pointer"
                >
                  Ir al Buzón →
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="px-5 py-2.5 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between text-xs">
              <span className="text-[#6E574B] font-semibold">
                {unreadCount} {unreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[#9E6B38] hover:text-[#86582A] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar todo como leído</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[440px] overflow-y-auto divide-y divide-[#F5EDE2] p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <Bell className="w-8 h-8 text-[#D8C7BA] mx-auto opacity-50" />
              <p className="text-xs text-[#8A7568]">
                No tienes recordatorios ni notificaciones pendientes.
              </p>
            </div>
          ) : (
            notifications.map(notif => {
              const isApproved = notif.statusType === 'aprobada';
              const isRejected = notif.statusType === 'rechazada';
              const isNewBrigade = notif.isNewBrigade;
              const isReminder = notif.isReminder || notif.title.toLowerCase().includes('recordatorio');

              const getIcon = () => {
                if (isApproved) {
                  return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                }
                if (isRejected) {
                  return <XCircle className="w-4 h-4 text-rose-600" />;
                }
                if (isNewBrigade) {
                  return <Sparkles className="w-4 h-4 text-amber-600" />;
                }
                return <Calendar className="w-4 h-4 text-[#9E6B38]" />;
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex gap-3 ${
                    isApproved
                      ? 'bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200'
                      : isRejected
                        ? 'bg-rose-50/60 hover:bg-rose-50 border border-rose-200'
                        : isNewBrigade
                          ? 'bg-amber-50/60 hover:bg-amber-50 border border-amber-200'
                          : notif.read
                            ? 'bg-white hover:bg-[#FAF6F0]'
                            : 'bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                    isApproved 
                      ? 'bg-white border-emerald-200' 
                      : isRejected 
                        ? 'bg-white border-rose-200' 
                        : isNewBrigade
                          ? 'bg-white border-amber-200'
                          : 'bg-white border-[#E8DFD3]'
                  }`}>
                    {getIcon()}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <h4 className="text-xs font-bold text-[#2C1E14] truncate">
                          {notif.title}
                        </h4>
                        {isApproved && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            Aprobada
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                            No aprobada
                          </span>
                        )}
                        {isNewBrigade && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 shrink-0">
                            Nueva Brigada
                          </span>
                        )}
                        {isReminder && !isApproved && !isRejected && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 shrink-0">
                            Recordatorio
                          </span>
                        )}
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#9E6B38] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#5C4538] leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.metadata?.statusNote && (
                      <div className="text-[10px] text-[#6E574B] bg-white/80 p-2 rounded-xl border border-[#E8DFD3] italic">
                        💬 Nota: "{notif.metadata.statusNote}"
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#8A7568] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9E6B38]" />
                        {notif.timestamp}
                      </span>
                      {notif.linkTab && (
                        <span className="text-[#9E6B38] font-semibold flex items-center gap-0.5 hover:underline">
                          <span>Ver en {notif.linkTab}</span>
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
          </>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-[#FAF6F0] border-t border-[#E8DFD3] text-center">
          <p className="text-[11px] text-[#8A7568]">
            🔔 Avisos sobre recordatorios de brigadas inscritas, nuevas brigadas de salud y estado de tus postulaciones de adopción.
          </p>
        </div>
      </div>
    </div>
  );
};
