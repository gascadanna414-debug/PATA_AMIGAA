import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Check, 
  Sparkles, 
  X
} from 'lucide-react';
import { HealthEvent, EventRegistration, User } from '../types';
import { StoreController } from '../controllers/storeController';
import confetti from 'canvas-confetti';

interface EventsViewProps {
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUser
}) => {
  const [events, setEvents] = useState<HealthEvent[]>(() => StoreController.getEvents());
  const [selectedType, setSelectedType] = useState<string>('todos');
  
  // Registration Modal State
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || '');
  const [ownerPhone, setOwnerPhone] = useState(currentUser?.phone || '');
  const [ownerNeighborhood] = useState('Barrio El Ospina Pérez, Purificación');
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Perro');
  const [petAge, setPetAge] = useState('1 año');
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<EventRegistration | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const filteredEvents = events.filter(e => {
    if (selectedType === 'todos') return true;
    return e.type === selectedType;
  });

  const handleOpenRegistration = (event: HealthEvent) => {
    setSelectedEvent(event);
    setRegisteredResult(null);
    setRegError(null);
    if (currentUser) {
      setOwnerName(currentUser.name);
      setOwnerEmail(currentUser.email);
      setOwnerPhone(currentUser.phone || '');
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegError(null);

    if (!ownerName || !ownerEmail || !ownerPhone || !petName) {
      setRegError('Por favor completa todos los campos del propietario y la mascota.');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      try {
        const res = StoreController.registerForEvent({
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          ownerName,
          ownerEmail,
          ownerPhone,
          ownerNeighborhood,
          petName,
          petSpecies,
          petAge
        });

        setEvents(StoreController.getEvents());
        setRegisteredResult(res.registration);
        setIsRegistering(false);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // fallback
        }
      } catch (err: any) {
        setIsRegistering(false);
        setRegError(err.message || 'Error al procesar el registro.');
      }
    }, 500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFEB]/15 text-[#BAE6FD] text-xs font-bold border border-[#BAE6FD]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Jornadas y Brigadas de Salud en Purificación, Tolima</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif]">
            Eventos Próximos de Esterilización, Vacunación y Salud Animal
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Participa en nuestras brigadas veterinarias comunitarias. Ayuda a prevenir la sobrepoblación y garantiza la salud de tus mascotas con atención profesional ética en Purificación.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#F5EFEB] p-1.5 rounded-2xl border border-[#E5DDD0] max-w-fit">
        {[
          { id: 'todos', label: 'Todos los eventos' },
          { id: 'esterilizacion', label: '✂️ Esterilización' },
          { id: 'vacunacion', label: '💉 Vacunación y Desparasitación' },
          { id: 'donacion_alimento', label: '📦 Colectas de Alimento' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`event-tab-${tab.id}`}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedType === tab.id
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const spotsLeft = event.totalSpots - event.registeredCount;
          const isSoldOut = spotsLeft <= 0;
          const progressPercent = Math.min(100, Math.round((event.registeredCount / event.totalSpots) * 100));

          return (
            <div
              key={event.id}
              id={`event-card-${event.id}`}
              className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-sm hover:shadow-md hover:border-[#38BDF8] transition duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Card Top Tag */}
                <div className="p-6 pb-4 bg-[#F5EFEB]/70 border-b border-[#E5DDD0]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0F172A] text-white">
                      {event.type === 'esterilizacion' && 'Cirugía de Esterilización'}
                      {event.type === 'vacunacion' && 'Vacunación & Desparasitación'}
                      {event.type === 'donacion_alimento' && 'Colectatón Comunitaria'}
                    </span>
                    <span className="text-xs font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-[#BAE6FD]">
                      {event.isFree ? '100% Gratuito / SISBÉN' : 'Bajo Costo'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-[#0F172A] leading-snug">
                    {event.title}
                  </h3>
                </div>

                {/* Event Core Details */}
                <div className="p-6 space-y-4">
                  {/* Date, Time & Location */}
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0F172A] block">Fecha:</span>
                        <span>{event.date}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0F172A] block">Hora:</span>
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0F172A] block">Lugar exacto:</span>
                        <span className="font-semibold text-slate-900">{event.locationName}</span>
                        <p className="text-[11px] text-slate-500">{event.address}, {event.municipality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Requirements List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider block">
                      Requisitos indispensables:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {event.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Spots Capacity Counter */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Cupos reservados:</span>
                      <span className={isSoldOut ? 'text-red-600 font-bold' : 'text-[#0284C7]'}>
                        {event.registeredCount} de {event.totalSpots} ({spotsLeft} disponibles)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSoldOut ? 'bg-red-500' : progressPercent > 80 ? 'bg-amber-400' : 'bg-[#0284C7]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  id={`register-event-btn-${event.id}`}
                  disabled={isSoldOut}
                  onClick={() => handleOpenRegistration(event)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    isSoldOut 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] text-white hover:shadow-sky-950/20'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#BAE6FD]" />
                  <span>{isSoldOut ? 'Cupos Agotados' : 'Inscribir a mi Mascota Gratis'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            id="event-registration-modal"
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-[#0F172A] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <h3 className="text-base font-bold font-['Outfit',sans-serif]">
                    Inscripción a Jornada Veterinaria
                  </h3>
                  <p className="text-xs text-[#BAE6FD] truncate max-w-[280px]">
                    {selectedEvent.title}
                  </p>
                </div>
              </div>
              <button
                id="close-event-modal-btn"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {registeredResult ? (
                <div className="space-y-4 text-center py-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#BAE6FD]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] font-['Outfit',sans-serif]">
                    ¡Inscripción Confirmada!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Hemos reservado el cupo para tu mascota <strong>{registeredResult.petName}</strong> en la jornada de Purificación Tolima.
                  </p>

                  <div className="bg-[#F5EFEB]/70 p-4 rounded-2xl border border-[#E5DDD0] text-xs text-left space-y-1.5 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Número de Turno:</span>
                      <span className="font-bold text-[#0284C7] text-sm">#{registeredResult.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mascota:</span>
                      <span className="font-bold text-slate-800">{registeredResult.petName} ({registeredResult.petSpecies})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lugar:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.locationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fecha y Hora:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.date} — {selectedEvent.time}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    * Recuerda llevar a tu mascota en ayuno si es para cirugía de esterilización.
                  </p>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow hover:bg-slate-800 cursor-pointer"
                  >
                    Cerrar y ver más eventos
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  {regError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      {regError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                      Datos del Responsable (Mayor de edad)
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tu Nombre Completo *
                      </label>
                      <input
                        id="reg-owner-name-input"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ej. Carlos Eduardo Rodríguez"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          id="reg-owner-email-input"
                          type="email"
                          required
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Celular / WhatsApp *
                        </label>
                        <input
                          id="reg-owner-phone-input"
                          type="tel"
                          required
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="312 890 4521"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
                      Datos de la Mascota a Atender
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre de la Mascota *
                      </label>
                      <input
                        id="reg-pet-name-input"
                        type="text"
                        required
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Ej. Firulais, Michi, Luna..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Especie *
                        </label>
                        <select
                          id="reg-pet-species-select"
                          value={petSpecies}
                          onChange={(e) => setPetSpecies(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        >
                          <option value="Perro">🐶 Perro / Canino</option>
                          <option value="Gato">🐱 Gato / Felino</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Edad Aproximada *
                        </label>
                        <input
                          id="reg-pet-age-input"
                          type="text"
                          required
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          placeholder="Ej. 8 meses, 2 años"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="submit-event-registration-btn"
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#BAE6FD]" />
                    <span>{isRegistering ? 'Reservando cupo...' : 'Confirmar Registro Gratuito'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
