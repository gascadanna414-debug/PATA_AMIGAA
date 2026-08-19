import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  Mail, 
  Home, 
  Sparkles, 
  Heart 
} from 'lucide-react';
import { User } from '../types';
import { AuthController } from '../controllers/authController';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'forgot') => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  unreadCount = 0
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    AuthController.logout();
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'historias', label: 'Finales Felices', icon: Sparkles },
    { id: 'adopcion', label: 'En Adopción', icon: Heart },
    { id: 'reportar', label: 'Reportar Caso', icon: AlertCircle, highlight: true },
    { id: 'eventos', label: 'Eventos y Brigadas', icon: Calendar },
    { id: 'chat', label: 'Chat de Ayuda', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'contacto', label: 'Contacto', icon: Mail }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-xl border-b border-[#334155]/60 backdrop-blur-md bg-opacity-98">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => { setActiveTab('inicio'); setIsMobileMenuOpen(false); }}
            className="cursor-pointer group select-none transition transform hover:opacity-95"
          >
            <Logo size="md" variant="light" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    item.highlight 
                      ? 'bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-md shadow-slate-950/30 font-bold'
                      : isActive
                        ? 'bg-[#1E293B] text-[#7DD3FC] border border-[#38BDF8]/40 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-[#1E293B]/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    item.highlight ? 'text-white' : isActive ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
                  }`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-[#38BDF8] text-[#0F172A] rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Section (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-[#1E293B]/90 pl-3 pr-2 py-1.5 rounded-2xl border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#BAE6FD] text-[#0F172A] flex items-center justify-center font-bold text-xs shadow-inner">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-white block max-w-[130px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#7DD3FC] capitalize font-medium">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="open-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  id="open-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-[#F5EFEB] hover:bg-[#EFE7DC] text-[#0F172A] rounded-xl shadow-md border border-[#E5DDD0] transition cursor-pointer"
                >
                  Registrarme
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs px-3 py-1.5 bg-[#F5EFEB] text-[#0F172A] font-bold rounded-lg cursor-pointer"
              >
                Ingresar
              </button>
            )}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1E293B] transition cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1120] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-[#1E293B] rounded-xl mb-3 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#38BDF8] text-[#0F172A] flex items-center justify-center font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.name}</div>
                  <div className="text-xs text-[#7DD3FC] capitalize">{currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-300 hover:text-rose-200 font-semibold px-2 py-1 bg-rose-950/50 rounded-lg cursor-pointer flex items-center gap-1 border border-rose-800/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                    item.highlight
                      ? 'bg-[#0284C7] text-white shadow-md'
                      : isActive
                        ? 'bg-[#1E293B] text-[#7DD3FC] border border-[#38BDF8]/40'
                        : 'text-slate-300 hover:bg-[#1E293B]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#38BDF8] text-[#0F172A] rounded-full">
                      {item.badge} nuevos
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!currentUser && (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-slate-200 bg-[#1E293B] rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-[#0F172A] bg-[#F5EFEB] rounded-xl hover:bg-[#EFE7DC] shadow cursor-pointer"
              >
                Crear Cuenta Gratuita
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
