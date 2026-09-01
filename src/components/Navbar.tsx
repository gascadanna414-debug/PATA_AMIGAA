import React, { useState, useEffect } from 'react';
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
  ShieldCheck
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenNotifications
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => StoreController.getUnreadCount());

  const isAdmin = AuthController.isAdmin(currentUser);

  useEffect(() => {
    const handleDataChange = () => {
      setUnreadCount(StoreController.getUnreadCount());
    };
    window.addEventListener('pata-data-change', handleDataChange);
    return () => window.removeEventListener('pata-data-change', handleDataChange);
  }, []);

  const handleLogout = () => {
    AuthController.logout();
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
              <div className="flex items-center gap-2.5 bg-[#FAF6F0] pl-3 pr-2 py-1 rounded-full border border-[#E8DFD3]">
                <div className="w-7 h-7 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-xs shadow-inner">
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
                  <span className="text-xs font-bold text-[#2C1E14] block max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#8A7568] capitalize font-medium">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1 text-[#8A7568] hover:text-rose-600 rounded-full hover:bg-[#EFE6DA] transition cursor-pointer"
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
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-[#5C4538] hover:bg-[#FAF6F0] rounded-xl cursor-pointer border border-[#E8DFD3]"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs px-3 py-1.5 bg-[#9E6B38] text-white font-medium rounded-full cursor-pointer"
              >
                Ingresar
              </button>
            )}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#5C4538] hover:text-[#2C1E14] hover:bg-[#F5EDE2] transition cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6F0] border-b border-[#EAE2D5] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-white rounded-2xl mb-3 border border-[#E8DFD3]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#9E6B38] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2C1E14]">{currentUser.name}</div>
                  <div className="text-xs text-[#8A7568] capitalize">{currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-700 hover:text-rose-800 font-semibold px-2.5 py-1 bg-rose-50 rounded-lg cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
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
              {isAdmin && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Activo</span>
              )}
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
    </header>
  );
};
