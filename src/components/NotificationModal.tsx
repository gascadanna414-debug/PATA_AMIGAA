import React, { useState, useEffect, useMemo } from 'react';
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
  UserPlus,
  Shield,
  Phone,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AppNotification, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { AuthController } from '../controllers/authController';

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
  const isAdmin = AuthController.isAdmin(currentUser);
  const [adminFilter, setAdminFilter] = useState<'todas' | 'eventos' | 'adopcion' | 'reporte'>('todas');
  const [userFilter, setUserFilter] = useState<'todas' | 'brigadas' | 'adopciones'>('todas');

  const [adminNotifications, setAdminNotifications] = useState<AppNotification[]>(() => 
    isAdmin ? StoreController.getAdminNotifications() : []
  );

  const [userNotifications, setUserNotifications] = useState<AppNotification[]>(() => 
    (!isAdmin && currentUser) ? StoreController.getUserNotifications(currentUser) : []
  );

  useEffect(() => {
    const handleUpdate = () => {
      if (isAdmin) {
        setAdminNotifications(StoreController.getAdminNotifications());
      } else if (currentUser) {
        setUserNotifications(StoreController.getUserNotifications(currentUser));
      } else {
        setUserNotifications([]);
        setAdminNotifications([]);
      }
    };

    handleUpdate();
    window.addEventListener('pata-data-change', handleUpdate);
    window.addEventListener('pata-notifications-change', handleUpdate);
    return () => {
      window.removeEventListener('pata-data-change', handleUpdate);
      window.removeEventListener('pata-notifications-change', handleUpdate);
    };
  }, [currentUser, isAdmin]);

  if (!isOpen) return null;

  // Handlers for Admins
  const handleMarkAllAdminRead = () => {
    StoreController.markAllAdminNotificationsRead();
    setAdminNotifications(StoreController.getAdminNotifications());
  };

  const handleAdminNotificationClick = (notif: AppNotification) => {
    StoreController.markAdminNotificationRead(notif.id);
    setAdminNotifications(StoreController.getAdminNotifications());
    if (onNavigateToTab) {
      if (notif.type === 'evento') {
        onNavigateToTab('eventos');
      } else {
        onNavigateToTab('admin');
      }
      onClose();
    }
  };

  // Handlers for Users
  const handleMarkAllUserRead = () => {
    StoreController.markAllUserNotificationsRead(currentUser);
    setUserNotifications(StoreController.getUserNotifications(currentUser));
  };

  const handleUserNotificationClick = (notif: AppNotification) => {
    StoreController.markUserNotificationRead(notif.id);
    setUserNotifications(StoreController.getUserNotifications(currentUser));
    if (notif.linkTab && onNavigateToTab) {
      onNavigateToTab(notif.linkTab);
      onClose();
    }
  };

  const adminUnreadCount = adminNotifications.filter(n => !n.read).length;
  const userUnreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-end p-4 sm:p-6">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-12 animate-in slide-in-from-top-4 duration-200">
        
        {/* --- MODAL HEADER --- */}
        <div className={`px-5 py-4 text-white flex items-center justify-between border-b ${
          isAdmin ? 'bg-[#1C2826] border-[#2C3E3B]' : 'bg-[#2C1E14] border-[#3D2C1F]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${isAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-[#9E6B38]'}`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold font-['Fraunces',serif]">
                  {isAdmin ? 'Alertas de Administración' : 'Avisos y Recordatorios'}
                </h3>
                {isAdmin && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#D8C7BA]">
                {isAdmin 
                  ? 'Buzón interno de gestión • Pata Amiga Purificación' 
                  : currentUser 
                    ? `Bandeja de ${currentUser.name}` 
                    : 'Comunidad de Purificación, Tolima'
                }
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

        {/* --- CASE 1: USER NOT LOGGED IN --- */}
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
                Para consultar las actualizaciones de tus postulaciones de adopción y los recordatorios de citas para brigadas veterinarias en Purificación, ingresa con tu cuenta.
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
        ) : isAdmin ? (
          /* --- CASE 2: ADMIN VIEW (Alertas de brigadas, cupos agotados, adopciones y reportes) --- */
          <div>
            {/* Admin Toolbar & Shortcuts */}
            <div className="px-4 py-2.5 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between text-xs">
              <span className="text-[#6E574B] font-semibold">
                {adminUnreadCount} {adminUnreadCount === 1 ? 'alerta sin leer' : 'alertas sin leer'}
              </span>
              <div className="flex items-center gap-3">
                {adminUnreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAdminRead}
                    className="text-[#9E6B38] hover:text-[#86582A] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar leídas</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('admin');
                    onClose();
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ir al Panel Admin →</span>
                </button>
              </div>
            </div>

            {/* Filter pills for Admins */}
            <div className="px-3 py-2 bg-white border-b border-[#F0E6D8] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setAdminFilter('todas')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
                  adminFilter === 'todas'
                    ? 'bg-[#2C1E14] text-white'
                    : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
                }`}
              >
                Todas ({adminNotifications.length})
              </button>
              <button
                onClick={() => setAdminFilter('eventos')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  adminFilter === 'eventos'
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Inscripciones y Cupos ({adminNotifications.filter(n => n.type === 'evento').length})</span>
              </button>
              <button
                onClick={() => setAdminFilter('adopcion')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  adminFilter === 'adopcion'
                    ? 'bg-[#9E6B38] text-white'
                    : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Adopciones ({adminNotifications.filter(n => n.type === 'adopcion').length})</span>
              </button>
              <button
                onClick={() => setAdminFilter('reporte')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  adminFilter === 'reporte'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>Reportes ({adminNotifications.filter(n => n.type === 'reporte').length})</span>
              </button>
            </div>

            {/* Admin Notifications List */}
            <div className="max-h-[440px] overflow-y-auto divide-y divide-[#F5EDE2] p-2 space-y-1">
              {adminNotifications
                .filter(n => adminFilter === 'todas' ? true : n.type === adminFilter)
                .length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2">
                  <Shield className="w-8 h-8 text-[#D8C7BA] mx-auto opacity-50" />
                  <p className="text-xs text-[#8A7568]">
                    No hay alertas de administración en esta categoría.
                  </p>
                </div>
              ) : (
                adminNotifications
                  .filter(n => adminFilter === 'todas' ? true : n.type === adminFilter)
                  .map(notif => {
                    const isSoldOut = notif.metadata?.isSoldOut || notif.title.includes('Cupos Agotados');
                    const isBrigadeReg = notif.type === 'evento' && !isSoldOut;
                    const isAdoption = notif.type === 'adopcion';
                    const isReport = notif.type === 'reporte';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleAdminNotificationClick(notif)}
                        className={`p-3.5 rounded-2xl transition cursor-pointer flex gap-3 ${
                          isSoldOut
                            ? 'bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300'
                            : isBrigadeReg
                              ? 'bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200'
                              : isReport
                                ? 'bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200'
                                : notif.read
                                  ? 'bg-white hover:bg-[#FAF6F0]'
                                  : 'bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                          isSoldOut
                            ? 'bg-amber-500 text-white border-amber-600'
                            : isBrigadeReg
                              ? 'bg-blue-600 text-white border-blue-700'
                              : isReport
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-[#9E6B38] text-white border-[#86582A]'
                        }`}>
                          {isSoldOut ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : isBrigadeReg ? (
                            <Calendar className="w-4 h-4" />
                          ) : isReport ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              <h4 className="text-xs font-bold text-[#2C1E14] truncate">
                                {notif.title}
                              </h4>
                              {isSoldOut && (
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 shrink-0">
                                  Cupos Llenos
                                </span>
                              )}
                              {isBrigadeReg && (
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 shrink-0">
                                  Inscripción
                                </span>
                              )}
                              {isAdoption && (
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EAE2D5] text-[#2C1E14] shrink-0">
                                  Adopción
                                </span>
                              )}
                              {isReport && (
                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 shrink-0">
                                  Reporte
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

                          {/* Quick Metadata preview */}
                          {notif.metadata?.confirmationCode && (
                            <div className="text-[10px] text-blue-900 bg-blue-100/70 px-2 py-1 rounded-lg flex items-center justify-between">
                              <span>Código Reserva: <strong>{notif.metadata.confirmationCode}</strong></span>
                              {notif.metadata?.registeredCount && notif.metadata?.capacity && (
                                <span>Ocupación: {notif.metadata.registeredCount}/{notif.metadata.capacity}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-[#8A7568] pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#9E6B38]" />
                              {notif.timestamp}
                            </span>
                            <span className="text-[#9E6B38] font-semibold flex items-center gap-0.5 hover:underline">
                              <span>Gestionar</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer for Admins */}
            <div className="p-3 bg-[#FAF6F0] border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-[#8A7568]">
              <span>Buzón con copia a las 4 administradoras</span>
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('admin');
                  onClose();
                }}
                className="font-bold text-[#9E6B38] hover:underline"
              >
                Abrir Panel Completo
              </button>
            </div>
          </div>
        ) : (
          /* --- CASE 3: REGULAR USER VIEW (Personal brigade reminders & Adoption updates) --- */
          <div>
            {/* User Toolbar */}
            <div className="px-5 py-2.5 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between text-xs">
              <span className="text-[#6E574B] font-semibold">
                {userUnreadCount} {userUnreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}
              </span>
              {userUnreadCount > 0 && (
                <button
                  onClick={handleMarkAllUserRead}
                  className="text-[#9E6B38] hover:text-[#86582A] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar todo como leído</span>
                </button>
              )}
            </div>

            {/* Filter pills for User */}
            <div className="px-3 py-2 bg-white border-b border-[#F0E6D8] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setUserFilter('todas')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
                  userFilter === 'todas'
                    ? 'bg-[#2C1E14] text-white'
                    : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
                }`}
              >
                Todas ({userNotifications.length})
              </button>
              <button
                onClick={() => setUserFilter('brigadas')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  userFilter === 'brigadas'
                    ? 'bg-blue-800 text-white'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Mis Brigadas ({userNotifications.filter(n => n.type === 'evento').length})</span>
              </button>
              <button
                onClick={() => setUserFilter('adopciones')}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  userFilter === 'adopciones'
                    ? 'bg-[#9E6B38] text-white'
                    : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Mis Adopciones ({userNotifications.filter(n => n.type === 'adopcion').length})</span>
              </button>
            </div>

            {/* User Notifications List */}
            <div className="max-h-[440px] overflow-y-auto divide-y divide-[#F5EDE2] p-2 space-y-1">
              {userNotifications
                .filter(n => {
                  if (userFilter === 'brigadas') return n.type === 'evento';
                  if (userFilter === 'adopciones') return n.type === 'adopcion';
                  return true;
                })
                .length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2">
                  <Bell className="w-8 h-8 text-[#D8C7BA] mx-auto opacity-50" />
                  <p className="text-xs text-[#8A7568] max-w-xs mx-auto">
                    {userFilter === 'brigadas'
                      ? 'No tienes recordatorios de brigadas inscritas. Inscríbete en la sección de Brigadas para recibir avisos de tu cita.'
                      : userFilter === 'adopciones'
                        ? 'No tienes solicitudes de adopción registradas con este perfil.'
                        : 'No tienes recordatorios ni avisos pendientes en tu cuenta.'}
                  </p>
                </div>
              ) : (
                userNotifications
                  .filter(n => {
                    if (userFilter === 'brigadas') return n.type === 'evento';
                    if (userFilter === 'adopciones') return n.type === 'adopcion';
                    return true;
                  })
                  .map(notif => {
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
                      return <Calendar className="w-4 h-4 text-blue-600" />;
                    };

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleUserNotificationClick(notif)}
                        className={`p-3.5 rounded-2xl transition cursor-pointer flex gap-3 ${
                          isApproved
                            ? 'bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200'
                            : isRejected
                              ? 'bg-rose-50/60 hover:bg-rose-50 border border-rose-200'
                              : isNewBrigade
                                ? 'bg-amber-50/60 hover:bg-amber-50 border border-amber-200'
                                : isReminder
                                  ? 'bg-blue-50/60 hover:bg-blue-50 border border-blue-200'
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
                                : isReminder
                                  ? 'bg-white border-blue-200'
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
                                  Recordatorio Cita
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

            {/* User Footer */}
            <div className="p-3 bg-[#FAF6F0] border-t border-[#E8DFD3] text-center">
              <p className="text-[11px] text-[#8A7568]">
                🔔 Recordatorios de brigadas a las que te inscribiste y estado de tus postulaciones de adopción en Purificación.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
