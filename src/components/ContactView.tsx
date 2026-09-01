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
      <div className="bg-white text-[#2C1E14] rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAE2D5] relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#9E6B38] block">
            Estamos para escucharte en Purificación, Tolima
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-[#2C1E14] tracking-tight">
            Canales de contacto y apoyo comunitario
          </h1>
          <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
            ¿Tienes dudas sobre adopciones, quieres vincular tu veterinaria o deseas aportar concentrado y medicamentos para los albergues de paso? Escríbenos directamente.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Side Contact Info & Phone / Right Side Functional Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Official Email, Phone, Address & Donation Methods */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] space-y-6 shadow-xs">
            <h3 className="text-xl font-bold font-['Fraunces',serif] text-[#2C1E14] border-b border-[#F5EDE2] pb-3">
              Información de Contacto
            </h3>

            {/* Official Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#9E6B38] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#9E6B38]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#9E6B38] uppercase tracking-wider block">
                  Correo Electrónico:
                </span>
                <a 
                  href="mailto:contacto@pataamiga-purificacion.org"
                  className="text-sm sm:text-base font-semibold text-[#2C1E14] hover:text-[#9E6B38] hover:underline block break-all"
                >
                  contacto@pataamiga-purificacion.org
                </a>
                <p className="text-xs text-[#6E574B]">
                  Respuesta en menos de 24 horas hábiles.
                </p>
              </div>
            </div>

            {/* Official Phone / WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#9E6B38] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#9E6B38]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#9E6B38] uppercase tracking-wider block">
                  Teléfono & WhatsApp:
                </span>
                <a 
                  href="tel:+573128904521"
                  className="text-sm sm:text-base font-semibold text-[#9E6B38] hover:underline block font-mono"
                >
                  +57 312 890 4521
                </a>
                <p className="text-xs text-[#6E574B]">
                  Atención de casos y reportes comunitarios en Tolima.
                </p>
              </div>
            </div>

            {/* Location in Purificación Tolima */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#9E6B38] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#9E6B38]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#9E6B38] uppercase tracking-wider block">
                  Ubicación:
                </span>
                <p className="text-sm font-medium text-[#2C1E14]">
                  Municipio de Purificación, Tolima, Colombia
                </p>
                <p className="text-xs text-[#6E574B]">
                  Puntos de acopio en Barrio El Ospina Pérez y Parque Principal.
                </p>
              </div>
            </div>

            {/* Attention hours */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD3] text-[#9E6B38] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#9E6B38]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#9E6B38] uppercase tracking-wider block">
                  Horarios de Atención:
                </span>
                <p className="text-xs text-[#5C4538]">
                  Lunes a Domingo: 8:00 AM – 6:00 PM (Urgencias 24/7 vía canal de rescate)
                </p>
              </div>
            </div>
          </div>

          {/* Donation Transparency Box */}
          <div className="bg-white p-6 rounded-3xl border border-[#EAE2D5] space-y-3 shadow-xs">
            <h4 className="text-sm font-bold font-['Fraunces',serif] text-[#2C1E14] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#9E6B38] fill-[#9E6B38]" />
              <span>Aportes y Donaciones Solidarias</span>
            </h4>
            <p className="text-xs text-[#5C4538] leading-relaxed">
              Las donaciones cubren alimento concentrado, medicamentos y atención veterinaria para animales rescatados en Purificación.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#2C1E14] block">Nequi / Daviplata</span>
                  <span className="font-mono text-[#9E6B38] font-medium">312 890 4521</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('3128904521', 'nequi')}
                  className="p-1.5 rounded-full bg-white text-[#2C1E14] hover:bg-[#F3ECE0] cursor-pointer border border-[#E8DFD3]"
                  title="Copiar número"
                >
                  {copiedAccount === 'nequi' ? <Check className="w-3.5 h-3.5 text-[#9E6B38]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#2C1E14] block">Donación en Especie</span>
                  <span className="text-[#6E574B] text-[11px]">Concentrado / Insumos</span>
                </div>
                <span className="text-[10px] bg-white text-[#9E6B38] px-2 py-0.5 rounded-full font-semibold border border-[#E8DFD3]">
                  Tolima
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Functional Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE2D5] shadow-xs">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-10 animate-in fade-in">
              <div className="w-16 h-16 bg-[#FAF6F0] text-[#9E6B38] rounded-full flex items-center justify-center mx-auto border border-[#E8DFD3]">
                <CheckCircle2 className="w-9 h-9 text-[#9E6B38]" />
              </div>
              <h3 className="text-xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
                ¡Mensaje recibido con éxito!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4538] max-w-md mx-auto leading-relaxed">
                Gracias por escribir a <strong>Pata Amiga Purificación</strong>. Te responderemos pronto al correo <strong>{email}</strong>.
              </p>
              <button
                id="contact-again-btn"
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 bg-[#9E6B38] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#86582A] cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="border-b border-[#F5EDE2] pb-3">
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Escríbenos un mensaje
                </h2>
                <p className="text-xs text-[#6E574B]">
                  Déjanos tus datos y nos pondremos en contacto contigo.
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
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Nombre Completo *
                </label>
                <input
                  id="contact-name-input"
                  type="text"
                  required
                  placeholder="Ej. Camila Andrea Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                />
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    id="contact-email-input"
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    id="contact-phone-input"
                    type="tel"
                    placeholder="312 890 4521"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                  />
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Motivo de Contacto / Asunto *
                </label>
                <select
                  id="contact-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
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
                <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                  Tu Mensaje *
                </label>
                <textarea
                  id="contact-message-textarea"
                  required
                  rows={4}
                  placeholder="Escribe detalladamente tu consulta, propuesta o mensaje para el equipo de Pata Amiga..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                />
              </div>

              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-[11px] text-[#5C4538] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9E6B38] shrink-0" />
                <span>Tu mensaje será atendido con reserva por los coordinadores de Pata Amiga en Purificación, Tolima.</span>
              </div>

              {/* Botón de Enviar */}
              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Enviando mensaje...' : 'Enviar mensaje'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
