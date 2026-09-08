import React, { useState, useMemo, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  CheckCircle2, 
  MapPin, 
  X, 
  Check, 
  MessageSquare,
  AlertCircle,
  Filter,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { AdoptionPet, AdoptionApplication, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { parsePhoneWithCountry, formatPhone10 } from '../utils/phoneUtils';
import { PhoneInput } from './PhoneInput';
import confetti from 'canvas-confetti';

interface AdoptionsViewProps {
  onNavigateToChat?: (rescuerName?: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  initialSpeciesFilter?: 'Todos' | 'Perro' | 'Gato';
  onNavigateToTab?: (tab: string) => void;
}

export const AdoptionsView: React.FC<AdoptionsViewProps> = ({
  onNavigateToChat,
  currentUser,
  onOpenAuth,
  initialSpeciesFilter = 'Todos',
  onNavigateToTab
}) => {
  const [pets, setPets] = useState<AdoptionPet[]>(() => StoreController.getAdoptionPets());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'Todos' | 'Perro' | 'Gato'>(initialSpeciesFilter);
  const [selectedSize, setSelectedSize] = useState<'Todos' | 'Pequeño' | 'Mediano' | 'Grande'>('Todos');
  const [selectedGender, setSelectedGender] = useState<'Todos' | 'Macho' | 'Hembra'>('Todos');
  const [selectedTrait, setSelectedTrait] = useState<string>('Todos');
  
  // User's own applications tracking with real-time sync
  const [userApplications, setUserApplications] = useState<AdoptionApplication[]>(() =>
    StoreController.getUserAdoptionApplications(currentUser)
  );

  // Real-time synchronization when pets or applications change status, or when profile switches
  useEffect(() => {
    // Immediately refresh state whenever currentUser prop changes
    setPets(StoreController.getAdoptionPets());
    setUserApplications(StoreController.getUserAdoptionApplications(currentUser));

    // Immediate background sync with centralized server
    StoreController.syncWithServer();

    const handleDataChange = () => {
      setPets(StoreController.getAdoptionPets());
      setUserApplications(StoreController.getUserAdoptionApplications(currentUser));
    };

    window.addEventListener('pata-data-change', handleDataChange);
    window.addEventListener('pata-pets-change', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('pata-data-change', handleDataChange);
      window.removeEventListener('pata-pets-change', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, [currentUser]);

  // Update species filter if prop changes
  useEffect(() => {
    if (initialSpeciesFilter) {
      setSelectedSpecies(initialSpeciesFilter);
    }
  }, [initialSpeciesFilter]);
  
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

  // Collect all unique personality traits for quick filters
  const allTraits = useMemo(() => {
    const set = new Set<string>();
    pets.forEach(p => p.personality.forEach(t => set.add(t)));
    return Array.from(set);
  }, [pets]);

  const filteredPets = useMemo(() => {
    return pets.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.story.toLowerCase().includes(q) ||
        p.rescueHistory.toLowerCase().includes(q) ||
        p.rescuerLocation.toLowerCase().includes(q) ||
        p.personality.some(t => t.toLowerCase().includes(q));

      const matchesSpecies = selectedSpecies === 'Todos' || p.species === selectedSpecies;
      const matchesSize = selectedSize === 'Todos' || p.size === selectedSize;
      const matchesGender = selectedGender === 'Todos' || p.gender === selectedGender;
      const matchesTrait = selectedTrait === 'Todos' || p.personality.includes(selectedTrait);

      return matchesSearch && matchesSpecies && matchesSize && matchesGender && matchesTrait;
    });
  }, [pets, searchQuery, selectedSpecies, selectedSize, selectedGender, selectedTrait]);

  const handleOpenAdoption = (pet: AdoptionPet) => {
    const freshPet = StoreController.getPetById(pet.id) || pet;
    setActivePet(freshPet);
    setShowApplicationModal(true);
    setAppSubmitted(false);
    setAppError(null);
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      setApplicantPhone(currentUser.phone || '');
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSpecies('Todos');
    setSelectedSize('Todos');
    setSelectedGender('Todos');
    setSelectedTrait('Todos');
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet) return;
    setAppError(null);

    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !reasonForAdoption.trim()) {
      setAppError('Por favor completa todos los campos obligatorios del formulario.');
      return;
    }

    const phoneValidation = parsePhoneWithCountry(applicantPhone);
    if (!phoneValidation.isValid) {
      setAppError(phoneValidation.message);
      return;
    }

    if (!termsAccepted) {
      setAppError('Debes aceptar el compromiso de tenencia responsable y seguimiento veterinario.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      StoreController.submitAdoptionApplication({
        userId: currentUser?.id,
        petId: activePet.id,
        petName: activePet.name,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        applicantPhone: applicantPhone.trim(),
        applicantCity,
        housingType,
        hasOtherPets,
        otherPetsDetails,
        reasonForAdoption: reasonForAdoption.trim()
      });

      setPets(StoreController.getAdoptionPets());
      setUserApplications(StoreController.getUserAdoptionApplications(currentUser));
      setActivePet(prev => prev ? { ...prev, status: 'en_proceso' } : null);

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] text-[#2C1E14] relative overflow-hidden shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#9E6B38] text-xs font-bold uppercase tracking-wider border border-[#E8DFD3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Oficial de Adopción • Purificación, Tolima</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-[#2C1E14] tracking-tight">
            Perros y gatos buscando una segunda oportunidad
          </h1>
          <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
            Conoce a todos nuestros rescatados en hogares de paso. Todos cuentan con valoración veterinaria completa, esquema de vacunas, desparasitación y esterilización.
          </p>
        </div>
      </div>

      {/* Main Grid with Left Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE2D5] shadow-xs space-y-4 lg:space-y-5 lg:sticky lg:top-24">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7568] px-1 sm:px-3 block mb-2">
              Navegación
            </span>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 no-scrollbar">
              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('inicio') : null}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-[#5C4538] hover:bg-[#FAF6F0] hover:text-[#2C1E14] flex items-center gap-2 transition text-left cursor-pointer whitespace-nowrap"
              >
                <span>Inicio</span>
              </button>
              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('reportar') : null}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-[#5C4538] hover:bg-[#FAF6F0] hover:text-[#2C1E14] flex items-center gap-2 transition text-left cursor-pointer whitespace-nowrap"
              >
                <span>Reporte de Animales</span>
              </button>
              <button
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-[#9E6B38] text-white flex items-center gap-2 shadow-xs text-left cursor-default whitespace-nowrap"
              >
                <span>Catálogo Adopción</span>
              </button>
              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('blog') : null}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-[#5C4538] hover:bg-[#FAF6F0] hover:text-[#2C1E14] flex items-center gap-2 transition text-left cursor-pointer whitespace-nowrap"
              >
                <span>Historias de Rescate</span>
              </button>
              <button
                onClick={() => onNavigateToTab ? onNavigateToTab('jornadas') : null}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold text-[#5C4538] hover:bg-[#FAF6F0] hover:text-[#2C1E14] flex items-center gap-2 transition text-left cursor-pointer whitespace-nowrap"
              >
                <span>Jornadas de Salud</span>
              </button>
            </nav>
          </div>

          {/* Quick Species Filter in Sidebar */}
          <div className="pt-3.5 border-t border-[#EAE2D5] space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7568] px-1 sm:px-3 block">
              Filtrar por especie
            </span>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5">
              <button
                onClick={() => setSelectedSpecies('Todos')}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-left transition cursor-pointer flex items-center justify-between gap-1 ${
                  selectedSpecies === 'Todos'
                    ? 'bg-[#FAF6F0] text-[#9E6B38] font-bold border border-[#EAE2D5]'
                    : 'text-[#6E574B] hover:bg-[#FAF6F0]'
                }`}
              >
                <span className="truncate">🐾 Todos</span>
                <span className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full font-bold">{pets.length}</span>
              </button>
              <button
                onClick={() => setSelectedSpecies('Perro')}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-left transition cursor-pointer flex items-center justify-between gap-1 ${
                  selectedSpecies === 'Perro'
                    ? 'bg-[#FAF6F0] text-[#9E6B38] font-bold border border-[#EAE2D5]'
                    : 'text-[#6E574B] hover:bg-[#FAF6F0]'
                }`}
              >
                <span className="truncate">🐶 Perros</span>
                <span className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full font-bold">
                  {pets.filter(p => p.species === 'Perro').length}
                </span>
              </button>
              <button
                onClick={() => setSelectedSpecies('Gato')}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-left transition cursor-pointer flex items-center justify-between gap-1 ${
                  selectedSpecies === 'Gato'
                    ? 'bg-[#FAF6F0] text-[#9E6B38] font-bold border border-[#EAE2D5]'
                    : 'text-[#6E574B] hover:bg-[#FAF6F0]'
                }`}
              >
                <span className="truncate">🐱 Gatos</span>
                <span className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full font-bold">
                  {pets.filter(p => p.species === 'Gato').length}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Dedicated Animal Search Section & Pet Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* USER ADOPTION APPLICATIONS TRACKING & STATUS */}
          {userApplications.length > 0 && (
            <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#9E6B38] border border-[#E8DFD3] shadow-xs">
                    <Heart className="w-4 h-4 fill-[#9E6B38]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                      Mis Postulaciones de Adopción ({userApplications.length})
                    </h2>
                    <p className="text-[11px] text-[#8A7568]">
                      Estado en tiempo real y respuestas de la administración de Pata Amiga Purificación
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {userApplications.map((app) => {
                  const isApproved = app.status === 'aprobada';
                  const isRejected = app.status === 'rechazada';

                  return (
                    <div
                      key={app.id}
                      className={`p-4 rounded-2xl border transition ${
                        isApproved
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : isRejected
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-white border-[#E8DFD3]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2C1E14]">
                              Postulación para {app.petName}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isRejected
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isApproved ? '🎉 Aprobada' : isRejected ? 'No aprobada' : '⏳ En revisión'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8A7568] block mt-0.5">
                            Radicada el: {app.submittedAt}
                          </span>
                        </div>
                      </div>

                      {app.statusNote && (
                        <div className="mt-3 p-3 bg-white/90 rounded-xl border border-[#E8DFD3] text-xs text-[#5C4538] space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#9E6B38]">
                            <span>💬 Mensaje oficial de la administración:</span>
                            {app.reviewedAt && (
                              <span className="text-[#8A7568] font-normal text-[10px]">
                                {app.reviewedAt}
                              </span>
                            )}
                          </div>
                          <p className="italic leading-relaxed">"{app.statusNote}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APARTADO EXCLUSIVO PARA BUSCAR LOS ANIMALES */}
          <div 
            id="animal-search-section"
            className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE2D5] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5EDE2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#9E6B38] border border-[#E8DFD3]">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                    Buscador de Animales
                  </h2>
                  <p className="text-[11px] text-[#8A7568]">
                    Filtra por nombre, raza, tamaño, sexo o personalidad
                  </p>
                </div>
              </div>

              {(searchQuery || selectedSpecies !== 'Todos' || selectedSize !== 'Todos' || selectedGender !== 'Todos' || selectedTrait !== 'Todos') && (
                <button
                  id="reset-filters-btn"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[#9E6B38] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-center"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            {/* Main Search Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4">
              {/* Search by Breed, Name or Keyword */}
              <div className="sm:col-span-2 md:col-span-5 relative">
                <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                  Buscar por nombre o raza
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
                  <input
                    id="search-breed-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej. Mona, Hades, Kiara, Bruno, Chopper, Criollo..."
                    className="w-full pl-10 pr-8 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-[#8A7568] hover:text-[#2C1E14] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Species Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                  Especie
                </label>
                <select
                  id="filter-species-select"
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                >
                  <option value="Todos">Todas</option>
                  <option value="Perro">Perros</option>
                  <option value="Gato">Gatos</option>
                </select>
              </div>

              {/* Size Selector */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                  Tamaño
                </label>
                <select
                  id="filter-size-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                >
                  <option value="Todos">Cualquier tamaño</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              {/* Gender Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                  Sexo
                </label>
                <select
                  id="filter-gender-select"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                >
                  <option value="Todos">Todos</option>
                  <option value="Macho">Machos</option>
                  <option value="Hembra">Hembras</option>
                </select>
              </div>
            </div>

            {/* Quick Trait Filter Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#8A7568] block mb-1.5">
                Filtrar por personalidad o temperamento:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTrait('Todos')}
                  className={`text-[11px] px-3 py-1 rounded-full transition cursor-pointer font-medium ${
                    selectedTrait === 'Todos'
                      ? 'bg-[#9E6B38] text-white shadow-xs'
                      : 'bg-[#FAF6F0] text-[#5C4538] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                  }`}
                >
                  Cualquier temperamento
                </button>
                {allTraits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => setSelectedTrait(selectedTrait === trait ? 'Todos' : trait)}
                    className={`text-[11px] px-3 py-1 rounded-full transition cursor-pointer font-medium ${
                      selectedTrait === trait
                        ? 'bg-[#9E6B38] text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#5C4538] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                    }`}
                  >
                    #{trait}
                  </button>
                ))}
              </div>
            </div>

            {/* Active search feedback counter */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F5EDE2] text-xs text-[#6E574B]">
              <span>
                Mostrando <strong className="text-[#2C1E14] font-bold">{filteredPets.length}</strong> {filteredPets.length === 1 ? 'animal disponible' : 'animales disponibles'} para adopción en Purificación
              </span>
            </div>
          </div>

          {/* Pets Grid */}
          {filteredPets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#EAE2D5] space-y-3">
              <div className="w-14 h-14 bg-[#FAF6F0] text-[#9E6B38] rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-[#9E6B38]" />
              </div>
              <h3 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                No encontramos animales con esos criterios de búsqueda
              </h3>
              <p className="text-xs text-[#6E574B] max-w-md mx-auto">
                Prueba buscando otro nombre o haciendo clic en el botón de restablecer para ver todos los peluditos disponibles.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2 bg-[#9E6B38] text-white rounded-full text-xs font-semibold mt-2 hover:bg-[#86582A] cursor-pointer shadow-xs"
              >
                Ver todos los animales ({pets.length})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  id={`pet-card-${pet.id}`}
                  className="bg-white rounded-3xl border border-[#EAE2D5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#9E6B38] transition duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo & badges */}
                    <div className="relative h-60 overflow-hidden bg-[#1C120B]">
                      <img
                        src={resolveImageUrl(pet.photos[0], pet.species === 'Gato' ? 'cat' : 'dog')}
                        alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, pet.species === 'Gato' ? 'cat' : 'dog')}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-[#2C1E14]/80 backdrop-blur-xs text-[#FAF6F0] text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                        <span>{pet.species} • {pet.breed}</span>
                      </div>

                      {pet.status === 'en_proceso' ? (
                        <div className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>En proceso de adopción</span>
                        </div>
                      ) : pet.status === 'adoptado' ? (
                        <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{pet.gender === 'Hembra' ? '¡Adoptada!' : '¡Adoptado!'}</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-[#9E6B38] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                          Disponible
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 bg-[#2C1E14]/80 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[11px] text-[#FAF6F0] flex items-center justify-between border border-white/10">
                        <span className="font-medium">{pet.gender} • {pet.age}</span>
                        <span className="text-[#E8DFD3]">Tamaño {pet.size}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
                          {pet.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#8A7568]">
                          <MapPin className="w-3.5 h-3.5 text-[#9E6B38]" />
                          <span className="truncate max-w-[130px]">{pet.rescuerLocation.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Health status pill list */}
                      <div className="flex flex-wrap gap-1.5">
                        {pet.healthStatus.sterilized && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FAF6F0] text-[#2C1E14] border border-[#E8DFD3] px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 text-[#9E6B38]" />
                            Esterilizado
                          </span>
                        )}
                        {pet.healthStatus.vaccinated && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 text-amber-700" />
                            Vacunado
                          </span>
                        )}
                        {pet.healthStatus.dewormed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F9F6F0] text-[#5C4538] border border-[#E8DFD3] px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 text-[#6E574B]" />
                            Desparasitado
                          </span>
                        )}
                      </div>

                      {/* Rescue History & Story */}
                      <div className="text-xs text-[#5C4538] line-clamp-3 leading-relaxed">
                        <strong className="text-[#2C1E14]">Historia:</strong> {pet.story}
                      </div>

                      {/* Personality Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {pet.personality.map((trait, idx) => (
                          <span 
                            key={idx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrait(trait);
                            }}
                            className="text-[10px] bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#9E6B38] px-2 py-0.5 rounded-full border border-[#E8DFD3] cursor-pointer"
                          >
                            #{trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-5 pt-0">
                    {pet.status === 'adoptado' ? (
                      <button
                        id={`adopt-pet-btn-${pet.id}`}
                        onClick={() => handleOpenAdoption(pet)}
                        className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ver ficha • {pet.gender === 'Hembra' ? 'Adoptada' : 'Adoptado'}</span>
                      </button>
                    ) : pet.status === 'en_proceso' ? (
                      <button
                        id={`adopt-pet-btn-${pet.id}`}
                        onClick={() => handleOpenAdoption(pet)}
                        className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Ver ficha (En proceso)</span>
                      </button>
                    ) : (
                      <button
                        id={`adopt-pet-btn-${pet.id}`}
                        onClick={() => handleOpenAdoption(pet)}
                        className="w-full py-2.5 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white text-xs font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Ver ficha & postularme</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: FICHA COMPLETA DE ADOPCIÓN & FORMULARIO DE POSTULACIÓN */}
      {showApplicationModal && activePet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div 
            id="adoption-modal-container"
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#EAE2D5] overflow-hidden my-auto max-h-[96vh] flex flex-col"
          >
            {/* Modal Header Full Width */}
            <div className="bg-[#2C1E14] px-6 py-4 text-[#FAF7F2] flex items-center justify-between shrink-0 border-b border-[#3D281D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9E6B38] flex items-center justify-center text-white shadow-xs">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-['Fraunces',serif]">
                    Ficha de Adopción: {activePet.name}
                  </h3>
                  <p className="text-xs text-[#D9C6B6]">
                    {activePet.species} • {activePet.breed} • {activePet.rescuerLocation}
                  </p>
                </div>
              </div>
              <button
                id="close-adoption-modal-btn"
                onClick={() => setShowApplicationModal(false)}
                className="text-[#D9C6B6] hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <span>Cerrar</span>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body - Spacious 2-column on desktop */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Left Column: Full Pet Details & Health Sheet */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Large High-Res Pet Photo */}
                  <div className="relative rounded-2xl overflow-hidden bg-[#1C120B] border border-[#EAE2D5] shadow-sm">
                    <img
                      src={resolveImageUrl(activePet.photos[0], activePet.species === 'Gato' ? 'cat' : 'dog')}
                      alt={activePet.name}
                      className="w-full h-72 sm:h-80 object-cover"
                      onError={(e) => handleImageError(e, activePet.species === 'Gato' ? 'cat' : 'dog')}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[#2C1E14]/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                      {activePet.species} • {activePet.breed}
                    </div>
                    {activePet.status === 'en_proceso' ? (
                      <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>En proceso de adopción</span>
                      </div>
                    ) : activePet.status === 'adoptado' ? (
                      <div className="absolute top-3 right-3 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        ¡Adoptado!
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-[#9E6B38] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        Disponible en Purificación
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 bg-[#2C1E14]/85 backdrop-blur-xs p-3 rounded-xl text-xs text-[#FAF6F0] flex items-center justify-between border border-white/10">
                      <span className="font-bold text-sm text-white">{activePet.name}</span>
                      <span className="text-[#E8DFD3]">{activePet.gender} • {activePet.age} • Tamaño {activePet.size}</span>
                    </div>
                  </div>

                  {/* Rescuer Contact Info Bar */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-[#8A7568] uppercase tracking-wider block">
                        Rescatista / Hogar de paso
                      </span>
                      <p className="text-sm font-bold text-[#2C1E14]">{activePet.rescuerName}</p>
                      <p className="text-xs text-[#6E574B] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#9E6B38]" />
                        <span>{activePet.rescuerLocation}</span>
                      </p>
                    </div>

                    {onNavigateToChat && (
                      <button
                        onClick={() => {
                          setShowApplicationModal(false);
                          onNavigateToChat(activePet.rescuerName);
                        }}
                        className="px-4 py-2 bg-white hover:bg-[#F3ECE0] border border-[#E8DFD3] text-[#2C1E14] rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#9E6B38]" />
                        <span>Chat directo</span>
                      </button>
                    )}
                  </div>

                  {/* Complete Health Status Grid */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2C1E14]">
                      Historial Veterinario Completo
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-xs space-y-1">
                        <span className="font-bold text-[#2C1E14] block">Vacunación</span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${activePet.healthStatus.vaccinated ? 'text-[#9E6B38]' : 'text-[#8A7568]'}`}>
                          <Check className="w-3.5 h-3.5" />
                          {activePet.healthStatus.vaccinated ? 'Séxtuple + Rabia' : 'En proceso'}
                        </span>
                      </div>

                      <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-xs space-y-1">
                        <span className="font-bold text-[#2C1E14] block">Esterilización</span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${activePet.healthStatus.sterilized ? 'text-[#9E6B38]' : 'text-[#8A7568]'}`}>
                          <Check className="w-3.5 h-3.5" />
                          {activePet.healthStatus.sterilized ? 'Esterilizado(a)' : 'Programado'}
                        </span>
                      </div>

                      <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DFD3] text-xs space-y-1">
                        <span className="font-bold text-[#2C1E14] block">Desparasitación</span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${activePet.healthStatus.dewormed ? 'text-[#9E6B38]' : 'text-[#8A7568]'}`}>
                          <Check className="w-3.5 h-3.5" />
                          {activePet.healthStatus.dewormed ? 'Al día' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    {activePet.healthStatus.specialCareNotes && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <strong>Observaciones médicas:</strong> {activePet.healthStatus.specialCareNotes}
                      </div>
                    )}
                  </div>

                  {/* Narrative & History */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] space-y-2 text-xs sm:text-sm text-[#3D2C22]">
                    <h4 className="font-bold text-[#2C1E14] uppercase tracking-wider text-xs">
                      Historia de Vida y Carácter
                    </h4>
                    <p className="leading-relaxed text-[#5C4538]">
                      {activePet.story}
                    </p>
                    <p className="leading-relaxed text-[#6E574B] pt-2 border-t border-[#E8DFD3]">
                      <strong className="text-[#2C1E14]">Antecedentes de rescate:</strong> {activePet.rescueHistory}
                    </p>
                    
                    {/* Personality Badges */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {activePet.personality.map((trait, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-white text-[#9E6B38] font-semibold px-2.5 py-1 rounded-full border border-[#E8DFD3]"
                        >
                          #{trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-6 bg-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#E8DFD3] space-y-5">
                  {appSubmitted ? (
                    <div className="bg-white border border-[#E8DFD3] rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
                      <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-[#2C1E14] font-['Fraunces',serif]">
                        ¡Solicitud de Adopción Enviada!
                      </h4>
                      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                        Hemos recibido tu solicitud de adopción para <strong>{activePet.name}</strong>. Nos comunicaremos contigo al <strong>{formatPhone10(applicantPhone)}</strong> para coordinar más datos necesarios o ultimar detalles.
                      </div>
                      <p className="text-xs text-[#6E574B] max-w-md mx-auto">
                        Puedes seguir el estado de tu postulación desde la sección <strong>"Mis Postulaciones"</strong> en la parte superior de este catálogo.
                      </p>
                      <button
                        onClick={() => setShowApplicationModal(false)}
                        className="px-6 py-2.5 bg-[#9E6B38] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs hover:bg-[#86582A] cursor-pointer transition"
                      >
                        Cerrar y volver al catálogo
                      </button>
                    </div>
                  ) : activePet.status === 'adoptado' ? (
                    <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
                      <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-[#2C1E14] font-['Fraunces',serif]">
                        ¡{activePet.name} ya fue {activePet.gender === 'Hembra' ? 'adoptada' : 'adoptado'}!
                      </h4>
                      <p className="text-xs sm:text-sm text-[#5C4538] max-w-md mx-auto leading-relaxed">
                        Esta hermosa mascota ya encontró un hogar amoroso y responsable en Purificación, Tolima. Te invitamos a conocer a los demás peluditos disponibles en nuestro catálogo que aún esperan una oportunidad.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setShowApplicationModal(false)}
                          className="px-6 py-2.5 bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs hover:bg-emerald-800 cursor-pointer transition"
                        >
                          Explorar otros peluditos disponibles
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#9E6B38] text-xs font-bold uppercase tracking-wider mb-2 border border-[#E8DFD3]">
                          <Heart className="w-3.5 h-3.5 fill-[#9E6B38]" />
                          <span>Formulario Oficial de Postulación</span>
                        </div>
                        <h4 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                          Quiero adoptar a {activePet.name}
                        </h4>
                        <p className="text-xs text-[#6E574B]">
                          Diligencia este formulario para que el hogar de paso evalúe tu solicitud.
                        </p>
                      </div>

                      {appError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{appError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                            Tu Nombre Completo *
                          </label>
                          <input
                            id="adopt-app-name-input"
                            type="text"
                            required
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                            placeholder="Ej. María García"
                            className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                            Correo Electrónico *
                          </label>
                          <input
                            id="adopt-app-email-input"
                            type="email"
                            required
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                            placeholder="tu.correo@ejemplo.com"
                            className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <PhoneInput
                          id="adopt-app-phone-input"
                          label="Teléfono / WhatsApp de Contacto"
                          value={applicantPhone}
                          onChange={setApplicantPhone}
                          required={true}
                          helperText="Selecciona tu país e ingresa tu número para que el rescatista te contacte"
                        />

                        <div>
                          <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                            Tipo de Vivienda *
                          </label>
                          <select
                            id="adopt-app-housing-select"
                            value={housingType}
                            onChange={(e) => setHousingType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
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
                            className="rounded border-[#E8DFD3] text-[#9E6B38] focus:ring-[#9E6B38]"
                          />
                          <label htmlFor="has-other-pets-checkbox" className="text-xs font-semibold text-[#5C4538] cursor-pointer">
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
                            className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C1E14] mb-1">
                          ¿Por qué deseas adoptar a {activePet.name}? *
                        </label>
                        <textarea
                          id="adopt-reason-textarea"
                          required
                          rows={3}
                          value={reasonForAdoption}
                          onChange={(e) => setReasonForAdoption(e.target.value)}
                          placeholder="Cuéntanos sobre tu hogar, el tiempo que compartirán y el cariño que le brindarán..."
                          className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-[#E8DFD3] flex items-start gap-2">
                        <input
                          id="adopt-terms-checkbox"
                          type="checkbox"
                          required
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-[#E8DFD3] text-[#9E6B38] focus:ring-[#9E6B38]"
                        />
                        <label htmlFor="adopt-terms-checkbox" className="text-[11px] text-[#2C1E14] leading-snug cursor-pointer">
                          Acepto el compromiso de tenencia responsable (alimentación adecuada, cariño, no mantener encadenado y permitir seguimiento por parte de los rescatistas de Purificación, Tolima).
                        </label>
                      </div>

                      <button
                        id="submit-adoption-application-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#9E6B38] hover:bg-[#86582A] text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Heart className="w-4 h-4 text-white fill-white" />
                        <span>{isSubmitting ? 'Enviando postulación...' : `Enviar Postulación para Adoptar a ${activePet.name}`}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
