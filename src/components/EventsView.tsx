import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Check, 
  Sparkles, 
  X,
  AlertCircle
} from 'lucide-react';
import { HealthEvent, EventRegistration, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { sanitizePhone10, isValidPhone10 } from '../utils/phoneUtils';
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

  // Synchronize events if updated elsewhere
  useEffect(() => {
    const handleDataChange = () => {
      setEvents(StoreController.getEvents());
    };
    window.addEventListener('pata-data-change', handleDataChange);
    return () => window.removeEventListener('pata-data-change', handleDataChange);
  }, []);
  
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

    if (!isValidPhone10(ownerPhone)) {
      setRegError('El número de teléfono/celular debe tener exactamente 10 caracteres numéricos (ej: 3128904521).');
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
      <div className="bg-white text-[#2C1E14] rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAE2D5] relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#9E6B38] block">
            Jornadas y Brigadas Comunitarias — Purificación, Tolima
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-[#2C1E14] tracking-tight">
            Brigadas de esterilización y salud veterinaria
          </h1>
          <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
            Inscribe a tus animales de compañía en las jornadas de esterilización, vacunación antirrábica y desparasitación preventiva en los barrios y veredas de Purificación.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF6F0] p-1.5 rounded-full border border-[#E8DFD3] max-w-fit">
        {[
          { id: 'todos', label: 'Todas las jornadas' },
          { id: 'esterilizacion', label: 'Esterilización' },
          { id: 'vacunacion', label: 'Vacunación y Desparasitación' },
          { id: 'brigada_salud', label: 'Brigadas de Salud Veredal' },
          { id: 'donacion_alimento', label: 'Colectas de Alimento' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`event-tab-${tab.id}`}
            onClick={() => setSelectedType(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedType === tab.id
                ? 'bg-[#9E6B38] text-white shadow-xs'
                : 'text-[#6E574B] hover:text-[#2C1E14] hover:bg-white/60'
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
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between ${
                isSoldOut ? 'border-rose-200 ring-1 ring-rose-100' : 'border-[#EAE2D5] hover:border-[#9E6B38]'
              }`}
            >
              <div>
                {/* Card Top Tag */}
                <div className="p-6 pb-4 bg-[#FAF6F0] border-b border-[#EAE2D5]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#2C1E14] text-[#FAF6F0]">
                      {event.type === 'esterilizacion' && 'Cirugía de Esterilización'}
                      {event.type === 'vacunacion' && 'Vacunación & Desparasitación'}
                      {event.type === 'brigada_salud' && 'Brigada de Salud Veredal'}
                      {event.type === 'donacion_alimento' && 'Colectatón Comunitaria'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isSoldOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 shadow-xs">
                          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          Cupos agotados
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#9E6B38] bg-white px-2 py-0.5 rounded-full border border-[#E8DFD3]">
                          {event.isFree ? '100% Gratuito / SISBÉN' : 'Aporte Solidario'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14] leading-snug">
                    {event.title}
                  </h3>
                </div>

                {/* Event Core Details */}
                <div className="p-6 space-y-4">
                  {/* Mensaje de Cupos Agotados destacado */}
                  {isSoldOut && (
                    <div 
                      id={`sold-out-alert-${event.id}`}
                      className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-950 shadow-xs"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-rose-900">
                          Cupos agotados
                        </p>
                        <p className="text-[11px] text-rose-700 leading-snug">
                          Se ha completado el cupo máximo de {event.totalSpots} mascotas para esta brigada en Purificación. Te invitamos a consultar las otras brigadas disponibles que aún tienen cupos libres.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date, Time & Location */}
                  <div className="space-y-2.5 text-xs text-[#5C4538] bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3]">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-[#9E6B38] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2C1E14] block">Fecha:</span>
                        <span>{event.date}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#9E6B38] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2C1E14] block">Horario:</span>
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#9E6B38] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2C1E14] block">Lugar:</span>
                        <span className="font-semibold text-[#2C1E14]">{event.locationName}</span>
                        <p className="text-[11px] text-[#6E574B]">{event.address}, {event.municipality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#5C4538] leading-relaxed">
                    {event.description}
                  </p>

                  {/* Requirements List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#9E6B38] uppercase tracking-wider block">
                      Requisitos indispensables:
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#5C4538]">
                      {event.requirements.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#9E6B38] shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Spots Capacity Counter */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#6E574B]">Cupos asignados:</span>
                      {isSoldOut ? (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 inline shrink-0" />
                          {event.totalSpots} de {event.totalSpots} (Cupos agotados)
                        </span>
                      ) : (
                        <span className="text-[#9E6B38] font-semibold">
                          {event.registeredCount} de {event.totalSpots} ({spotsLeft} disponibles)
                        </span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-[#FAF6F0] rounded-full overflow-hidden border border-[#E8DFD3]">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSoldOut ? 'bg-rose-600' : 'bg-[#9E6B38]'
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
                  onClick={() => !isSoldOut && handleOpenRegistration(event)}
                  className={`w-full py-3 px-4 rounded-full font-bold text-xs transition duration-150 flex items-center justify-center gap-2 ${
                    isSoldOut 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed shadow-none'
                      : 'bg-[#9E6B38] hover:bg-[#86582A] text-white shadow-xs cursor-pointer'
                  }`}
                >
                  {isSoldOut ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Cupos agotados</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-white" />
                      <span>Inscribir a mi mascota</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            id="event-registration-modal"
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-[#2C1E14] px-6 py-4 text-[#FAF7F2] flex items-center justify-between shrink-0 border-b border-[#3D281D]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#9E6B38]" />
                <div>
                  <h3 className="text-base font-bold font-['Fraunces',serif]">
                    Inscripción a Jornada Veterinaria
                  </h3>
                  <p className="text-xs text-[#D9C6B6] truncate max-w-[280px]">
                    {selectedEvent.title}
                  </p>
                </div>
              </div>
              <button
                id="close-event-modal-btn"
                onClick={() => setSelectedEvent(null)}
                className="text-[#D9C6B6] hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {registeredResult ? (
                <div className="space-y-4 text-center py-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-[#FAF6F0] text-[#9E6B38] rounded-full flex items-center justify-center mx-auto shadow-xs border border-[#E8DFD3]">
                    <CheckCircle2 className="w-8 h-8 text-[#9E6B38]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2C1E14] font-['Fraunces',serif]">
                    ¡Inscripción Confirmada!
                  </h3>
                  <p className="text-xs text-[#5C4538] max-w-sm mx-auto leading-relaxed">
                    Hemos reservado el cupo para tu mascota <strong>{registeredResult.petName}</strong> en la jornada de Purificación Tolima.
                  </p>

                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] text-xs text-left space-y-1.5 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-[#6E574B]">Número de Turno:</span>
                      <span className="font-bold text-[#9E6B38] text-sm">#{registeredResult.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E574B]">Mascota:</span>
                      <span className="font-bold text-[#2C1E14]">{registeredResult.petName} ({registeredResult.petSpecies})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E574B]">Lugar:</span>
                      <span className="font-bold text-[#2C1E14]">{selectedEvent.locationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E574B]">Fecha y Hora:</span>
                      <span className="font-bold text-[#2C1E14]">{selectedEvent.date} — {selectedEvent.time}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8A7568]">
                    * Recuerda llevar a tu mascota en ayuno si es para cirugía de esterilización.
                  </p>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2.5 bg-[#9E6B38] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#86582A] cursor-pointer"
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
                    <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider block">
                      Datos del Responsable (Mayor de edad)
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                        Tu Nombre Completo *
                      </label>
                      <input
                        id="reg-owner-name-input"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ej. Carlos Eduardo Rodríguez"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          id="reg-owner-email-input"
                          type="email"
                          required
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder="tu.correo@ejemplo.com"
                          className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                          Celular / WhatsApp * <span className="text-[10px] text-[#8A7568] font-normal">(10 dígitos)</span>
                        </label>
                        <input
                          id="reg-owner-phone-input"
                          type="tel"
                          required
                          maxLength={10}
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(sanitizePhone10(e.target.value))}
                          placeholder="3128904521"
                          className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#EAE2D5]">
                    <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider block">
                      Datos de la Mascota a Atender
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                        Nombre de la Mascota *
                      </label>
                      <input
                        id="reg-pet-name-input"
                        type="text"
                        required
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Ej. Firulais, Michi, Luna..."
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                          Especie *
                        </label>
                        <select
                          id="reg-pet-species-select"
                          value={petSpecies}
                          onChange={(e) => setPetSpecies(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        >
                          <option value="Perro">🐶 Perro / Canino</option>
                          <option value="Gato">🐱 Gato / Felino</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                          Edad Aproximada *
                        </label>
                        <input
                          id="reg-pet-age-input"
                          type="text"
                          required
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          placeholder="Ej. 8 meses, 2 años"
                          className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="submit-event-registration-btn"
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-[#9E6B38] hover:bg-[#86582A] text-white text-xs font-semibold rounded-full shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
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
