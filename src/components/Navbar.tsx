import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  AlertCircle, 
  Calendar, 
  Mail, 
  Home, 
  BookOpen, 
  Heart,
  Bell,
  ShieldCheck,
  UserCog
} from 'lucide-react';
import { User } from '../types';
import { AuthController } from '../controllers/authController';
import { StoreController } from '../controllers/storeController';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'forgot') => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenNotifications,
  onOpenProfile
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = AuthController.isAdmin(currentUser);

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    if (!currentUser) return 0;
    return isAdmin ? StoreController.getAdminUnreadCount() : StoreController.getUserUnreadCount(currentUser);
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      if (!currentUser) {
        setUnreadCount(0);
      } else if (isAdmin) {
        setUnreadCount(StoreController.getAdminUnreadCount());
      } else {
        setUnreadCount(StoreController.getUserUnreadCount(currentUser));
      }
    };
    updateCount();
    window.addEventListener('pata-data-change', updateCount);
    window.addEventListener('pata-notifications-change', updateCount);
    return () => {
      window.removeEventListener('pata-data-change', updateCount);
      window.removeEventListener('pata-notifications-change', updateCount);
    };
  }, [currentUser, isAdmin]);

  const handleRequestLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    AuthController.logout();
    if (activeTab === 'admin') {
      setActiveTab('inicio');
    }
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'adopcion', label: 'Adoptar', icon: Heart },
    { id: 'reportar', label: 'Reportar', icon: AlertCircle },
    { id: 'eventos', label: 'Brigadas', icon: Calendar },
    { id: 'blog', label: 'Historias', icon: BookOpen },
    { id: 'contacto', label: 'Contacto', icon: Mail }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE2D5] shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => { setActiveTab('inicio'); setIsMobileMenuOpen(false); }}
            className="cursor-pointer group select-none transition transform hover:opacity-95"
          >
            <Logo size="md" variant="color" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'blog' && activeTab === 'historias');
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border border-[#9E6B38] text-[#9E6B38] bg-[#FDFBF7] font-semibold shadow-xs'
                      : 'text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#F6EFE5]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Panel Tab Link */}
            <button
              id="nav-link-admin"
              onClick={() => setActiveTab('admin')}
              className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#2C1E14] text-[#FAF6F0] font-semibold shadow-xs'
                  : isAdmin
                    ? 'bg-[#FAF6F0] text-[#9E6B38] border border-[#E8DFD3] hover:bg-[#F3ECE0]'
                    : 'text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#F6EFE5]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#9E6B38]" />
              <span>Panel Admin</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              )}
            </button>
          </nav>

          {/* User Auth & Notification Section (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Notification Bell */}
            <button
              id="notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#FAF6F0] rounded-full transition cursor-pointer border border-[#E8DFD3]"
              title="Avisos y notificaciones de brigadas"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#FAF6F0] pl-2.5 pr-2 py-1 rounded-full border border-[#E8DFD3]">
                <button
                  id="open-profile-summary-btn"
                  onClick={() => onOpenProfile && onOpenProfile()}
                  title="Ver y editar mi perfil"
                  className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0 overflow-hidden ring-1 ring-white">
                    {currentUser.avatar ? (
                      <img 
                        src={resolveImageUrl(currentUser.avatar, 'avatar')} 
                        alt={currentUser.name} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => handleImageError(e, 'avatar')}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left leading-tight pr-1">
                    <span className="text-xs font-bold text-[#2C1E14] block max-w-[120px] truncate group-hover:text-[#9E6B38] transition">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#8A7568] capitalize font-medium flex items-center gap-1">
                      <span>{currentUser.role}</span>
                      <span className="text-[#9E6B38] font-bold">• Editar</span>
                    </span>
                  </div>
                </button>
                <button
                  id="open-profile-btn"
                  onClick={() => onOpenProfile && onOpenProfile()}
                  title="Editar perfil"
                  className="p-1.5 text-[#8A7568] hover:text-[#9E6B38] rounded-full hover:bg-[#EFE6DA] transition cursor-pointer"
                >
                  <UserCog className="w-3.5 h-3.5" />
                </button>
                <button
                  id="logout-btn"
                  onClick={handleRequestLogout}
                  title="Cerrar sesión"
                  className="p-1.5 text-[#8A7568] hover:text-rose-600 rounded-full hover:bg-[#EFE6DA] transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="open-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-1.5 text-xs sm:text-sm font-medium text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#F5EDE2] rounded-full border border-[#D5C8B8] transition cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  id="open-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-1.5 text-xs sm:text-sm font-semibold bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full shadow-xs transition cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Bell Toggle */}
          <div className="lg:hidden flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-[#5C4538] hover:bg-[#FAF6F0] rounded-xl cursor-pointer border border-[#E8DFD3] min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Notificaciones"
              aria-label="Abrir notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-1.5 p-1 bg-[#FAF6F0] rounded-full border border-[#E8DFD3] text-left cursor-pointer"
                title="Perfil"
              >
                <div className="w-7 h-7 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                  {currentUser.avatar ? (
                    <img 
                      src={resolveImageUrl(currentUser.avatar, 'avatar')} 
                      alt={currentUser.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => handleImageError(e, 'avatar')}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden xs:inline-block text-xs font-bold text-[#2C1E14] max-w-[80px] sm:max-w-[110px] truncate pr-1.5">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  id="mobile-open-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="text-xs px-2.5 sm:px-3 py-1.5 text-[#5C4538] hover:text-[#2C1E14] border border-[#D5C8B8] rounded-full font-medium cursor-pointer transition min-h-[36px] flex items-center"
                >
                  Ingresar
                </button>
                <button
                  id="mobile-open-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:inline-flex text-xs px-3 py-1.5 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs cursor-pointer whitespace-nowrap min-h-[36px] items-center"
                >
                  Registrarse
                </button>
              </div>
            )}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#F5EDE2] transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6F0] border-b border-[#EAE2D5] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-white rounded-2xl mb-3 border border-[#E8DFD3]">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="w-9 h-9 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-1 ring-white shrink-0">
                  {currentUser.avatar ? (
                    <img
                      src={resolveImageUrl(currentUser.avatar, 'avatar')}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, 'avatar')}
                    />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2C1E14]">{currentUser.name}</div>
                  <div className="text-xs text-[#9E6B38] font-medium flex items-center gap-1">
                    <span className="capitalize text-[#8A7568]">{currentUser.role}</span>
                    <span>• Editar perfil</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="mobile-drawer-edit-profile-btn"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-[#9E6B38] hover:text-[#86582A] font-semibold px-2.5 py-1.5 bg-[#FAF6F0] rounded-xl cursor-pointer flex items-center gap-1 border border-[#E8DFD3]"
                  title="Editar perfil"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={handleRequestLogout}
                  className="text-xs text-rose-700 hover:text-rose-800 font-semibold p-1.5 bg-rose-50 rounded-xl cursor-pointer flex items-center justify-center border border-rose-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'blog' && activeTab === 'historias');
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#9E6B38] border border-[#9E6B38] font-semibold'
                      : 'text-[#5C4538] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#9E6B38]" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

            <button
              id="mobile-nav-admin"
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#2C1E14] text-white font-semibold'
                  : 'bg-white text-[#9E6B38] border border-[#E8DFD3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#9E6B38]" />
                <span>Panel Administrador</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Activo</span>
                )}
              </div>
            </button>
          </div>

          {!currentUser && (
            <div className="pt-3 border-t border-[#E8DFD3] flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-medium text-[#5C4538] bg-white border border-[#D5C8B8] rounded-full hover:bg-[#F5EDE2] cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-semibold text-white bg-[#9E6B38] hover:bg-[#86582A] rounded-full shadow-xs cursor-pointer"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación de Cierre de Sesión (Portal al body para centrado perfecto) */}
      {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            id="logout-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE2D5] space-y-4 text-center transform animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                ¿Estás seguro de que deseas cerrar sesión?
              </h3>
              <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
                Tu sesión activa en Pata Amiga Purificación se cerrará. Podrás volver a iniciar sesión en cualquier momento.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="cancel-logout-btn"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-[#FAF6F0] hover:bg-[#EFE6DA] text-[#5C4538] text-xs sm:text-sm font-semibold rounded-full border border-[#E8DFD3] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-logout-btn"
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
