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
    <footer className="bg-[#241710] text-[#FAF7F2] border-t border-[#3B2519] mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#3B2519]">
          {/* Brand Col with Logo */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-xs text-[#D9C6B6] leading-relaxed max-w-sm">
              Plataforma comunitaria de bienestar animal creada para conectar a los ciudadanos de Purificación, Tolima con veterinarias, rescatistas y voluntarios dedicados a la protección de animales desamparados.
            </p>
            <div className="text-xs text-[#D19B68] flex items-center gap-1.5 font-semibold pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#9E6B38]" />
              <span>Purificación, Tolima, Colombia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-[#D9C6B6]">
              <li>
                <button onClick={() => { onNavigate('inicio'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline cursor-pointer">
                  • Inicio & Historias
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('adopcion'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline cursor-pointer">
                  • Mascotas en Adopción
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('reportar'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline text-[#D19B68] font-semibold cursor-pointer">
                  • Reportar Animal en Peligro
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('eventos'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline cursor-pointer">
                  • Brigadas & Jornadas
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('historias'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline cursor-pointer">
                  • Historias & Blog
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('contacto'); scrollToTop(); }} className="hover:text-[#D19B68] hover:underline cursor-pointer">
                  • Contacto & Donaciones
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]">
              Atención Comunitaria Tolima
            </h4>
            <div className="bg-[#1D120C] p-4 rounded-2xl border border-[#3B2519] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2]">
                <Phone className="w-4 h-4 text-[#9E6B38] shrink-0" />
                <span className="font-bold font-mono text-sm">+57 312 890 4521</span>
              </div>
              <div className="flex items-center gap-2 text-[#D9C6B6]">
                <Mail className="w-4 h-4 text-[#9E6B38] shrink-0" />
                <span className="truncate">contacto@pataamiga-purificacion.org</span>
              </div>
              <p className="text-[11px] text-[#A89182] pt-1 leading-snug">
                Atención en barrios: Ospina Pérez, Camilo Torres, Santander, El Triunfo y zona rural de Purificación.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll-top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A89182]">
          <div>
            © {new Date().getFullYear()} Pata Amiga — Purificación, Tolima.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer text-xs bg-[#1D120C] hover:bg-[#3B2519] px-4 py-2 rounded-full border border-[#3B2519] text-[#D9C6B6] font-semibold"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#9E6B38]" />
          </button>
        </div>
      </div>
    </footer>
  );
};

