import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Heart, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check 
} from 'lucide-react';
import { User } from '../types';
import { StoreController } from '../controllers/storeController';
import confetti from 'canvas-confetti';

interface ContactViewProps {
  currentUser: User | null;
  onNavigateToTab?: (tab: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  currentUser
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [subject, setSubject] = useState('Consulta General / Voluntariado');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !message) {
      setErrorMsg('Por favor ingresa tu nombre, correo y mensaje.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      StoreController.submitContactMessage({
        name,
        email,
        phone,
        subject,
        message
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      setMessage('');

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }, 600);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFEB]/15 text-[#BAE6FD] text-xs font-bold border border-[#BAE6FD]/30">
            <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Estamos para escucharte en Purificación, Tolima</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif]">
            Contacto & Canales de Ayuda Pata Amiga
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            ¿Tienes dudas sobre procesos de adopción, quieres vincular tu veterinaria o deseas colaborar con donaciones de alimento para los refugios temporales de Purificación? Escríbenos o contáctanos directamente.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Side Contact Info & Phone / Right Side Functional Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Official Email, Phone, Address & Donation Methods */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] space-y-6 shadow-xs">
            <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-[#0F172A] border-b border-[#F1EBE3] pb-3">
              Información de Contacto
            </h3>

            {/* Official Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-6 h-6 text-[#0284C7]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                  Correo Electrónico Oficial:
                </span>
                <a 
                  href="mailto:contacto@pataamiga-purificacion.org"
                  className="text-sm sm:text-base font-bold text-[#0F172A] hover:text-[#0284C7] hover:underline block break-all"
                >
                  contacto@pataamiga-purificacion.org
                </a>
                <p className="text-xs text-slate-500">
                  Respuesta en menos de 24 horas hábiles.
                </p>
              </div>
            </div>

            {/* Official Phone / WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-6 h-6 text-[#0284C7]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                  Teléfono & WhatsApp de Urgencias:
                </span>
                <a 
                  href="tel:+573128904521"
                  className="text-sm sm:text-base font-bold text-[#0284C7] hover:underline block font-mono"
                >
                  +57 312 890 4521
                </a>
                <p className="text-xs text-slate-500">
                  Atención de casos y reportes comunitarios en Tolima.
                </p>
              </div>
            </div>

            {/* Location in Purificación Tolima */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-6 h-6 text-[#0284C7]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                  Ubicación Principal:
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Municipio de Purificación, Tolima, Colombia
                </p>
                <p className="text-xs text-slate-500">
                  Puntos de acopio en Barrio El Ospina Pérez y Plaza de Bolívar.
                </p>
              </div>
            </div>

            {/* Attention hours */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-6 h-6 text-[#0284C7]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                  Horarios de Atención:
                </span>
                <p className="text-xs text-slate-700">
                  Lunes a Domingo: 8:00 AM – 6:00 PM (Urgencias 24/7 vía chat de reporte)
                </p>
              </div>
            </div>
          </div>

          {/* Donation Transparency Box */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#0284C7] fill-[#0284C7]" />
              <span>Aportes y Donaciones Solidarias</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tus donaciones cubren compras de concentrado, medicamentos para cachorros y cirugías de animales atropellados en Purificación.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-3 bg-[#F5EFEB]/70 rounded-xl border border-[#E5DDD0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0F172A] block">Nequi / Daviplata</span>
                  <span className="font-mono text-[#0284C7] font-semibold">312 890 4521</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('3128904521', 'nequi')}
                  className="p-1.5 rounded-lg bg-white text-[#0F172A] hover:bg-[#F5EFEB] cursor-pointer border border-[#E5DDD0]"
                  title="Copiar número"
                >
                  {copiedAccount === 'nequi' ? <Check className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-[#F5EFEB]/70 rounded-xl border border-[#E5DDD0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0F172A] block">Donación en Especie</span>
                  <span className="text-slate-500 text-[11px]">Concentrado / Cobijas</span>
                </div>
                <span className="text-[10px] bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded font-bold border border-[#BAE6FD]">
                  Tolima
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Functional Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-10 animate-in fade-in">
              <div className="w-16 h-16 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#BAE6FD]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-[#0F172A]">
                ¡Mensaje Enviado con Éxito!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Gracias por comunicarte con <strong>Pata Amiga Purificación</strong>. Hemos recibido tu consulta y nuestro equipo voluntario te responderá lo antes posible al correo <strong>{email}</strong>.
              </p>
              <button
                id="contact-again-btn"
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 bg-[#0284C7] text-white text-xs font-bold rounded-xl shadow hover:bg-[#0369A1] cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="border-b border-[#F1EBE3] pb-3">
                <h2 className="text-lg font-bold font-['Outfit',sans-serif] text-[#0F172A]">
                  Formulario de Contacto Directo
                </h2>
                <p className="text-xs text-slate-500">
                  Déjanos tus datos y mensaje para ponernos en contacto contigo.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Nombre Completo *
                </label>
                <input
                  id="contact-name-input"
                  type="text"
                  required
                  placeholder="Ej. Camila Andrea Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
                />
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    id="contact-email-input"
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    id="contact-phone-input"
                    type="tel"
                    placeholder="312 890 4521"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
                  />
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de Contacto / Asunto *
                </label>
                <select
                  id="contact-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                >
                  <option value="Consulta General / Voluntariado">Quiero unirme como voluntario en Purificación</option>
                  <option value="Donaciones de Alimento / Económicas">Quiero realizar una donación o apadrinar</option>
                  <option value="Alianza Veterinaria">Soy médico veterinario / Clínica aliada</option>
                  <option value="Pregunta sobre Adopción">Preguntas sobre el proceso de adopción</option>
                  <option value="Otro motivo">Otro asunto</option>
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Mensaje *
                </label>
                <textarea
                  id="contact-message-textarea"
                  required
                  rows={4}
                  placeholder="Escribe detalladamente tu consulta, propuesta o mensaje para el equipo de Pata Amiga..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
                />
              </div>

              <div className="p-3 bg-[#E0F2FE] rounded-xl border border-[#BAE6FD] text-[11px] text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>Tu mensaje será tratado confidencialmente por los coordinadores de Pata Amiga Purificación Tolima.</span>
              </div>

              {/* Botón de Enviar */}
              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4 text-[#BAE6FD]" />
                <span>{isSubmitting ? 'Enviando mensaje...' : 'Enviar Mensaje a Pata Amiga'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
