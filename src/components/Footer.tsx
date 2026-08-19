import React from 'react';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'forgot') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1120] text-white border-t border-[#1E293B] mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col with Logo */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Plataforma comunitaria de bienestar animal creada para conectar a los ciudadanos de Purificación, Tolima con veterinarias, rescatistas y voluntarios dedicados a la protección de animales desamparados.
            </p>
            <div className="text-xs text-[#7DD3FC] flex items-center gap-1.5 font-semibold pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Purificación, Tolima, Colombia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#BAE6FD]">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => { onNavigate('inicio'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline cursor-pointer">
                  • Inicio & Finales Felices
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('adopcion'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline cursor-pointer">
                  • Mascotas en Adopción
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('reportar'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline text-[#7DD3FC] font-semibold cursor-pointer">
                  • Reportar Animal en Peligro
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('eventos'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline cursor-pointer">
                  • Brigadas de Esterilización y Vacunas
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('chat'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline cursor-pointer">
                  • Chat de Rescate en Vivo
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('contacto'); scrollToTop(); }} className="hover:text-[#38BDF8] hover:underline cursor-pointer">
                  • Contacto & Donaciones
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#BAE6FD]">
              Atención Comunitaria Tolima
            </h4>
            <div className="bg-[#1E293B] p-4 rounded-2xl border border-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-2 text-white">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span className="font-bold font-mono text-sm">+57 312 890 4521</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span className="truncate">contacto@pataamiga-purificacion.org</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-snug">
                Atención en barrios: Ospina Pérez, Camilo Torres, Santander, El Triunfo y zona rural de Purificación.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll-top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Pata Amiga — Purificación, Tolima.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer text-xs bg-[#1E293B] hover:bg-[#334155] px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-200 font-semibold"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#38BDF8]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
