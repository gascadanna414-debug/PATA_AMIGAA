import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Search, 
  CheckCircle2, 
  MapPin, 
  X, 
  Check, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { AdoptionPet, User } from '../types';
import { StoreController } from '../controllers/storeController';
import confetti from 'canvas-confetti';

interface AdoptionsViewProps {
  onNavigateToChat?: (rescuerName?: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const AdoptionsView: React.FC<AdoptionsViewProps> = ({
  onNavigateToChat,
  currentUser
}) => {
  const [pets] = useState<AdoptionPet[]>(() => StoreController.getAdoptionPets());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'Todos' | 'Perro' | 'Gato'>('Todos');
  const [selectedSize, setSelectedSize] = useState<'Todos' | 'Pequeño' | 'Mediano' | 'Grande'>('Todos');
  
  // Selected pet for detailed modal & application
  const [activePet, setActivePet] = useState<AdoptionPet | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Adoption application form state
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantCity] = useState('Purificación, Tolima');
  const [housingType, setHousingType] = useState<'Casa con patio' | 'Casa sin patio' | 'Apartamento' | 'Finca'>('Casa con patio');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [otherPetsDetails, setOtherPetsDetails] = useState('');
  const [reasonForAdoption, setReasonForAdoption] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPets = useMemo(() => {
    return pets.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.personality.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSpecies = selectedSpecies === 'Todos' || p.species === selectedSpecies;
      const matchesSize = selectedSize === 'Todos' || p.size === selectedSize;

      return matchesSearch && matchesSpecies && matchesSize;
    });
  }, [pets, searchQuery, selectedSpecies, selectedSize]);

  const handleOpenAdoption = (pet: AdoptionPet) => {
    setActivePet(pet);
    setShowApplicationModal(true);
    setAppSubmitted(false);
    setAppError(null);
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      setApplicantPhone(currentUser.phone || '');
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet) return;
    setAppError(null);

    if (!applicantName || !applicantEmail || !applicantPhone || !reasonForAdoption) {
      setAppError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!termsAccepted) {
      setAppError('Debes aceptar el compromiso de tenencia responsable y seguimiento veterinario.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      StoreController.submitAdoptionApplication({
        petId: activePet.id,
        petName: activePet.name,
        applicantName,
        applicantEmail,
        applicantPhone,
        applicantCity,
        housingType,
        hasOtherPets,
        otherPetsDetails,
        reasonForAdoption
      });

      setIsSubmitting(false);
      setAppSubmitted(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] rounded-3xl p-6 sm:p-10 border border-slate-700/80 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFEB]/15 text-[#BAE6FD] text-xs font-bold border border-[#BAE6FD]/30">
            <Heart className="w-3.5 h-3.5 fill-[#38BDF8] text-[#38BDF8]" />
            <span>Adopta en Purificación, Tolima</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif]">
            Encuentra a tu compañero de vida
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Todos nuestros rescatados han recibido valoración médica veterinaria completa, esquema de vacunación al día, desparasitación y están esterilizados o con compromiso de esterilización gratuita en Purificación.
          </p>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Search by Breed, Name or Keyword */}
          <div className="md:col-span-6 relative">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Buscar por Raza, Nombre o Personalidad
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-3" />
              <input
                id="search-breed-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. Criollo, Mestizo, Labrador, Siamés, Juguetón..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Species Selector */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Especie de Animal
            </label>
            <select
              id="filter-species-select"
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            >
              <option value="Todos">Todas las especies</option>
              <option value="Perro">🐶 Perros</option>
              <option value="Gato">🐱 Gatos</option>
            </select>
          </div>

          {/* Size Selector */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Tamaño
            </label>
            <select
              id="filter-size-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            >
              <option value="Todos">Cualquier tamaño</option>
              <option value="Pequeño">Pequeño (Apto para apartamento)</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande (Ideal casa con patio)</option>
            </select>
          </div>
        </div>

        {/* Quick active counts */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F1EBE3] text-xs text-slate-500">
          <span>Mostrando <strong>{filteredPets.length}</strong> peluditos disponibles en Purificación</span>
          {(searchQuery || selectedSpecies !== 'Todos' || selectedSize !== 'Todos') && (
            <button
              id="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecies('Todos');
                setSelectedSize('Todos');
              }}
              className="text-[#0284C7] hover:underline font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E8E2D8] space-y-3">
          <div className="w-14 h-14 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7 text-[#0284C7]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No encontramos mascotas con ese criterio</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prueba buscando otra raza (ej. Criollo, Mestizo) o quitando los filtros para ver todos los animales disponibles en Purificación Tolima.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSpecies('Todos'); setSelectedSize('Todos'); }}
            className="px-4 py-2 bg-[#0284C7] text-white rounded-xl text-xs font-bold mt-2 hover:bg-[#0369A1] cursor-pointer"
          >
            Ver todos los animales
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              id={`pet-card-${pet.id}`}
              className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-sm hover:shadow-md hover:border-[#38BDF8] transition duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Photo & badges */}
                <div className="relative h-60 overflow-hidden bg-slate-900">
                  <img
                    src={pet.photos[0]}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#0F172A]/90 backdrop-blur-xs text-[#BAE6FD] text-xs font-bold px-2.5 py-1 rounded-xl shadow border border-slate-700 flex items-center gap-1">
                    <span>{pet.species === 'Perro' ? '🐶' : '🐱'} {pet.breed}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-[#0284C7] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow">
                    En Adopción
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 bg-[#0F172A]/85 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs text-white flex items-center justify-between border border-slate-700">
                    <span className="font-semibold">{pet.gender} • {pet.age}</span>
                    <span className="text-[#BAE6FD]">Tamaño {pet.size}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-[#0F172A]">
                      {pet.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span className="truncate max-w-[130px]">{pet.rescuerLocation.split(',')[0]}</span>
                    </div>
                  </div>

                  {/* Health status pill list */}
                  <div className="flex flex-wrap gap-1.5">
                    {pet.healthStatus.sterilized && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F5EFEB] text-[#0F172A] border border-[#E5DDD0] px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-[#0284C7]" />
                        Esterilizado
                      </span>
                    )}
                    {pet.healthStatus.vaccinated && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-[#0284C7]" />
                        Vacunado
                      </span>
                    )}
                    {pet.healthStatus.dewormed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-slate-600" />
                        Desparasitado
                      </span>
                    )}
                  </div>

                  {/* Rescue History & Story */}
                  <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    <strong className="text-slate-800">Historia de rescate:</strong> {pet.story}
                  </div>

                  {/* Personality Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {pet.personality.map((trait, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] bg-[#F5EFEB] text-[#1E3A8A] px-2 py-0.5 rounded-full border border-[#E5DDD0]"
                      >
                        #{trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-5 pt-0">
                <button
                  id={`adopt-pet-btn-${pet.id}`}
                  onClick={() => handleOpenAdoption(pet)}
                  className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-[#BAE6FD] text-[#BAE6FD]" />
                  <span>Ver Historia & Postularme</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: PET DETAIL & ADOPTION APPLICATION FORM */}
      {showApplicationModal && activePet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            id="adoption-modal-container"
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-[#38BDF8] fill-[#38BDF8]" />
                <div>
                  <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                    Proceso de Adopción: {activePet.name}
                  </h3>
                  <p className="text-xs text-[#BAE6FD]">
                    Raza: {activePet.breed} • Purificación, Tolima
                  </p>
                </div>
              </div>
              <button
                id="close-adoption-modal-btn"
                onClick={() => setShowApplicationModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Pet Summary Card */}
              <div className="bg-[#F5EFEB]/70 rounded-2xl p-4 border border-[#E5DDD0] flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={activePet.photos[0]}
                  alt={activePet.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <span className="text-base font-bold text-[#0F172A]">{activePet.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] font-bold rounded-md">
                      {activePet.gender} • {activePet.age}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-md">
                      Tamaño {activePet.size}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Rescatista encargado:</strong> {activePet.rescuerName} ({activePet.rescuerContact})
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Ubicación:</strong> {activePet.rescuerLocation}
                  </p>
                </div>

                {onNavigateToChat && (
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      onNavigateToChat(activePet.rescuerName);
                    }}
                    className="px-3.5 py-2 bg-white border border-[#E5DDD0] rounded-xl text-xs font-bold text-[#0F172A] hover:bg-[#F5EFEB] flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Chatear</span>
                  </button>
                )}
              </div>

              {/* Complete Health & Story Sheet */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  Historial de Salud y Rescate
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block">Esquema de Vacunación:</span>
                    <span className={activePet.healthStatus.vaccinated ? 'text-[#0284C7] font-semibold' : 'text-slate-600'}>
                      {activePet.healthStatus.vaccinated ? '✓ Al día (Séxtuple + Rabia)' : 'Pendiente refuerzo'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block">Esterilización:</span>
                    <span className={activePet.healthStatus.sterilized ? 'text-[#0284C7] font-semibold' : 'text-slate-600'}>
                      {activePet.healthStatus.sterilized ? '✓ Esterilizado(a)' : 'Con cita programada'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block">Desparasitación:</span>
                    <span className={activePet.healthStatus.dewormed ? 'text-[#0284C7] font-semibold' : 'text-slate-600'}>
                      {activePet.healthStatus.dewormed ? '✓ Interna y Externa' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800">Cómo llegó a nosotros:</strong> {activePet.rescueHistory}
                </div>

                {activePet.healthStatus.specialCareNotes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong>Cuidados especiales:</strong> {activePet.healthStatus.specialCareNotes}
                  </div>
                )}
              </div>

              {/* APPLICATION FORM */}
              {appSubmitted ? (
                <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-[#0284C7] text-white rounded-full flex items-center justify-center mx-auto shadow">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0F172A]">
                    ¡Solicitud de Adopción Enviada con Éxito!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Hemos registrado tu postulación para <strong>{activePet.name}</strong>. El rescatista <strong>{activePet.rescuerName}</strong> se comunicará contigo vía WhatsApp o llamada telefónica al número <strong>{applicantPhone}</strong> para coordinar la visita domiciliaria en Purificación.
                  </p>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl shadow hover:bg-slate-800 cursor-pointer"
                  >
                    Entendido, ¡muchas gracias!
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-4 pt-2 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    Formulario de Postulación de Adopción
                  </h4>

                  {appError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{appError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tu Nombre Completo *
                      </label>
                      <input
                        id="adopt-app-name-input"
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Ej. María Fernanda Gómez"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        id="adopt-app-email-input"
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="tu.correo@ejemplo.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono / WhatsApp de Contacto *
                      </label>
                      <input
                        id="adopt-app-phone-input"
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="312 890 4521"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tipo de Vivienda *
                      </label>
                      <select
                        id="adopt-app-housing-select"
                        value={housingType}
                        onChange={(e) => setHousingType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      >
                        <option value="Casa con patio">Casa con patio (Purificación)</option>
                        <option value="Casa sin patio">Casa sin patio</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Finca">Finca / Zona Rural Tolima</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        id="has-other-pets-checkbox"
                        type="checkbox"
                        checked={hasOtherPets}
                        onChange={(e) => setHasOtherPets(e.target.checked)}
                        className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <label htmlFor="has-other-pets-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        ¿Tienes otras mascotas actualmente en casa?
                      </label>
                    </div>
                    {hasOtherPets && (
                      <input
                        id="other-pets-details-input"
                        type="text"
                        value={otherPetsDetails}
                        onChange={(e) => setOtherPetsDetails(e.target.value)}
                        placeholder="Ej. Un perro criollo de 4 años, esterilizado y sociable."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ¿Por qué deseas adoptar a {activePet.name}? *
                    </label>
                    <textarea
                      id="adopt-reason-textarea"
                      required
                      rows={3}
                      value={reasonForAdoption}
                      onChange={(e) => setReasonForAdoption(e.target.value)}
                      placeholder="Cuéntanos un poco sobre tu familia, el tiempo que compartirán y el espacio que tendrá la mascota..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  <div className="p-3 bg-[#F5EFEB] rounded-xl border border-[#E5DDD0] flex items-start gap-2">
                    <input
                      id="adopt-terms-checkbox"
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                    />
                    <label htmlFor="adopt-terms-checkbox" className="text-[11px] text-[#0F172A] leading-snug cursor-pointer">
                      Acepto el compromiso de tenencia responsable (alimentación adecuada, cariño, no mantener encadenado y permitir seguimiento por parte de los rescatistas de Purificación, Tolima).
                    </label>
                  </div>

                  <button
                    id="submit-adoption-application-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Heart className="w-4 h-4 text-[#BAE6FD] fill-[#BAE6FD]" />
                    <span>{isSubmitting ? 'Enviando postulación...' : `Enviar Postulación para Adoptar a ${activePet.name}`}</span>
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
