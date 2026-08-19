import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Award, 
  MapPin, 
  ArrowRight, 
  Activity, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { SuccessStory, User } from '../types';
import { StoreController } from '../controllers/storeController';
import confetti from 'canvas-confetti';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  currentUser,
  onOpenAuth
}) => {
  const [stories, setStories] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [activeStoryFilter, setActiveStoryFilter] = useState<'Todos' | 'Perro' | 'Gato'>('Todos');
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});

  const handleLike = (storyId: string) => {
    if (likedStories[storyId]) return;
    const updated = StoreController.likeSuccessStory(storyId);
    setStories(updated);
    setLikedStories(prev => ({ ...prev, [storyId]: true }));
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // fallback
    }
  };

  const filteredStories = stories.filter(s => 
    activeStoryFilter === 'Todos' || s.species === activeStoryFilter
  );

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION: Deep Navy Canvas with Pastel Sky & Warm Beige Accents */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl border border-slate-700/80">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#BAE6FD]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFEB]/15 text-[#BAE6FD] border border-[#BAE6FD]/30 text-xs font-semibold mb-4 backdrop-blur-xs">
            <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Purificación, Tolima — Juntos por el Rescate & Bienestar Animal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-['Outfit',sans-serif] text-white leading-tight mb-4">
            Transformando vidas en <span className="text-[#38BDF8]">familias felices</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-2xl">
            En <strong>Pata Amiga</strong> conectamos a los ciudadanos de Purificación con médicos veterinarios, rescatistas dedicados y voluntarios. Rescatamos animales en estado de vulnerabilidad, organizamos brigadas de esterilización y encontramos hogares llenos de amor.
          </p>

          {/* Call to Actions: Warm Beige + Pastel Sky + Deep Navy Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              id="hero-adopt-btn"
              onClick={() => onNavigate('adopcion')}
              className="px-6 py-3.5 rounded-xl bg-[#F5EFEB] hover:bg-[#EFE7DC] text-[#0F172A] font-black text-sm sm:text-base shadow-lg shadow-black/20 border border-[#E5DDD0] transition duration-150 flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-[#0F172A] text-[#0F172A]" />
              <span>Adoptar una Mascota</span>
            </button>

            <button
              id="hero-report-btn"
              onClick={() => onNavigate('reportar')}
              className="px-6 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-950/30 transition duration-150 flex items-center gap-2 cursor-pointer border border-[#38BDF8]/40"
            >
              <AlertCircle className="w-5 h-5 text-[#BAE6FD]" />
              <span>Reportar Caso de Rescate</span>
            </button>

            <button
              id="hero-events-btn"
              onClick={() => onNavigate('eventos')}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-xs border border-slate-400/30 transition duration-150 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-[#38BDF8]" />
              <span>Ver Brigadas de Salud</span>
            </button>
          </div>
        </div>

        {/* Quick Trust Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B1120]/80 border border-slate-700 text-[#38BDF8]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white">+140</div>
              <div className="text-xs text-slate-300">Animales adoptados</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B1120]/80 border border-slate-700 text-[#38BDF8]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white">+320</div>
              <div className="text-xs text-slate-300">Esterilizaciones en Tolima</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B1120]/80 border border-slate-700 text-[#38BDF8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white">100%</div>
              <div className="text-xs text-slate-300">Atención veterinaria ética</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B1120]/80 border border-slate-700 text-[#38BDF8]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-white">+50</div>
              <div className="text-xs text-slate-300">Voluntarios activos</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: EVIDENCIAS DE ANIMALES AYUDADOS (FINALES FELICES) */}
      <section id="historias-de-exito" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0369A1] uppercase tracking-wider bg-[#E0F2FE] px-3 py-1 rounded-full mb-2 border border-[#BAE6FD]">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Evidencias Reales: Antes & Después</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A]">
              Animales que hemos rescatado y hoy tienen una familia
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Cada historia muestra la recuperación del mismo animal rescatado en Purificación Tolima: desde el momento del reporte hasta su vida feliz con una familia adoptiva.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-[#F5EFEB] p-1.5 rounded-2xl border border-[#E5DDD0] self-start sm:self-auto">
            {(['Todos', 'Perro', 'Gato'] as const).map(filter => (
              <button
                key={filter}
                id={`filter-story-${filter.toLowerCase()}`}
                onClick={() => setActiveStoryFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeStoryFilter === filter
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-700 hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                {filter === 'Todos' ? 'Todos los casos' : `${filter}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const isExpanded = expandedStoryId === story.id;
            const isLiked = likedStories[story.id];

            return (
              <div 
                key={story.id} 
                id={`story-card-${story.id}`}
                className="bg-white rounded-3xl border border-[#E8E2D8] shadow-sm hover:shadow-md hover:border-[#38BDF8] transition duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Matching Before & After Photo Comparison Container */}
                  <div className="relative bg-slate-900 group">
                    <div className="grid grid-cols-2 gap-0.5 h-60">
                      {/* Left: Before */}
                      <div className="relative overflow-hidden bg-slate-800">
                        <img 
                          src={story.beforePhotoUrl} 
                          alt={`Antes del rescate - ${story.petName}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>ANTES: Al rescatar</span>
                        </div>
                      </div>

                      {/* Right: After (Exact same animal recovered) */}
                      <div className="relative overflow-hidden bg-slate-950">
                        <img 
                          src={story.currentPhotoUrl} 
                          alt={`Después con su familia - ${story.petName}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-[#0284C7]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow border border-[#38BDF8]/40 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#BAE6FD]" />
                          <span>DESPUÉS: ¡Adoptado!</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 bg-[#0F172A]/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl text-[11px] text-white flex items-center justify-between border border-slate-700">
                      <span className="font-semibold">{story.breed} • {story.estimatedAge}</span>
                      <span className="text-[#38BDF8] font-medium">{story.adoptedDate}</span>
                    </div>
                  </div>

                  {/* Story details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-[#0F172A]">
                          {story.petName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0284C7]" />
                          <span>{story.rescueLocation}</span>
                        </p>
                      </div>
                      <div className="px-2.5 py-1 bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] rounded-lg text-xs font-bold">
                        En Familia
                      </div>
                    </div>

                    {/* Adoptive Family Highlight in Warm Beige */}
                    <div className="p-3 bg-[#F5EFEB]/70 rounded-2xl border border-[#E5DDD0] text-xs space-y-1">
                      <div className="text-[11px] text-[#1E3A8A] font-bold uppercase tracking-wider">
                        Familia Adoptiva en Purificación:
                      </div>
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#0284C7] fill-[#0284C7]" />
                        <span>{story.adoptedFamilyName}</span>
                      </div>
                    </div>

                    {/* Resumed story */}
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <p className="font-semibold text-slate-800 mb-1">Historia del rescate:</p>
                      <p className={isExpanded ? '' : 'line-clamp-3'}>
                        {story.rescueStory}
                      </p>
                    </div>

                    {/* Expanded Health Evolution */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#E8E2D8] space-y-2 text-xs animate-in fade-in duration-150">
                        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-amber-950">
                          <span className="font-bold block text-[11px] text-amber-900">Estado de salud al ser rescatado:</span>
                          <span>{story.healthBefore}</span>
                        </div>
                        <div className="bg-[#E0F2FE] p-2.5 rounded-xl border border-[#BAE6FD] text-[#0F172A]">
                          <span className="font-bold text-[#0369A1] block text-[11px]">Estado actual con su nueva familia:</span>
                          <span>{story.healthAfter}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] italic">
                          Atendido por: {story.rescuerName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#F1EBE3] bg-white">
                  <button
                    id={`toggle-story-detail-${story.id}`}
                    onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                    className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                  >
                    {isExpanded ? 'Ver menos' : 'Leer historia completa'}
                  </button>

                  <button
                    id={`like-story-btn-${story.id}`}
                    onClick={() => handleLike(story.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isLiked 
                        ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]' 
                        : 'bg-[#F5EFEB] hover:bg-[#EFE7DC] text-slate-700 hover:text-[#0F172A] border border-[#E5DDD0]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#0284C7] text-[#0284C7]' : 'text-[#0284C7]'}`} />
                    <span>{story.likes} Me alegra</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner encouraging more adoptions */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0284C7] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-700">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-['Outfit',sans-serif]">
              ¿Quieres ser el próximo en transformar una vida?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              Tenemos perritos y gaticos en Purificación esperando un hogar amoroso. Todos se entregan vacunados, desparasitados y esterilizados.
            </p>
          </div>
          <button
            id="story-banner-view-adoptions"
            onClick={() => onNavigate('adopcion')}
            className="px-5 py-3 rounded-xl bg-[#F5EFEB] hover:bg-[#EFE7DC] text-[#0F172A] font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 cursor-pointer border border-[#E5DDD0]"
          >
            <span>Ver Mascotas en Adopción</span>
            <ArrowRight className="w-4 h-4 text-[#0284C7]" />
          </button>
        </div>
      </section>

      {/* HOW TO HELP / MODES OF PARTICIPATION IN PURIFICACIÓN TOLIMA */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A]">
            ¿Cómo puedes ayudar en Purificación, Tolima?
          </h2>
          <p className="text-sm text-slate-600">
            Nuestra labor es posible gracias a la unión entre ciudadanos, voluntarios y profesionales veterinarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-sm hover:border-[#38BDF8] transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-bold">
              <Heart className="w-6 h-6 fill-[#0284C7]" />
            </div>
            <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-[#0F172A]">
              1. Adopta o Sé Hogar de Paso
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dale una segunda oportunidad a un animal rescatado en Purificación. Si no puedes adoptar de forma definitiva, puedes brindar hogar temporal mientras se recupera.
            </p>
            <button
              onClick={() => onNavigate('adopcion')}
              className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 cursor-pointer"
            >
              <span>Explorar catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-sm hover:border-[#F59E0B] transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-[#0F172A]">
              2. Reporta Animales en Peligro
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Si ves un animal herido, atropellado o abandonado en cualquier barrio o vereda de Purificación, repórtalo con foto y ubicación exacta para enviar apoyo.
            </p>
            <button
              onClick={() => onNavigate('reportar')}
              className="text-xs font-bold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 cursor-pointer"
            >
              <span>Hacer un reporte ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-sm hover:border-[#38BDF8] transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-[#0F172A]">
              3. Participa en Brigadas de Salud
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Inscribe a tus mascotas o participa como voluntario en las jornadas de vacunación antirrábica, esterilización masiva y desparasitación gratuita.
            </p>
            <button
              onClick={() => onNavigate('eventos')}
              className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 cursor-pointer"
            >
              <span>Ver próximas jornadas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* LOCAL ALLIES & PURIFICACIÓN VETS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif] text-[#0F172A]">
              Veterinarias y Aliados Locales en Purificación
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Red de profesionales que apoyan los procedimientos médicos, cirugías y brigadas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contacto')}
            className="text-xs font-bold text-[#0F172A] bg-[#F5EFEB] border border-[#E5DDD0] px-4 py-2 rounded-xl hover:bg-[#EFE7DC] transition cursor-pointer self-start sm:self-auto"
          >
            ¿Eres veterinario? Únete a la red
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-[#BAE6FD] text-[#0284C7] font-bold text-sm shadow-xs">
              🏥
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Clínica Veterinaria San Francisco</h4>
              <p className="text-xs text-slate-500">Calle 7 #4-22, Purificación Tolima</p>
              <p className="text-[11px] text-[#0284C7] font-semibold mt-1">Urgencias, Cirugía y Vacunación</p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-[#BAE6FD] text-[#0284C7] font-bold text-sm shadow-xs">
              🐾
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Centro Médico Veterinario Tolima</h4>
              <p className="text-xs text-slate-500">Carrera 5 frente al Parque Principal</p>
              <p className="text-[11px] text-[#0284C7] font-semibold mt-1">Esterilizaciones y Laboratorio</p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-[#BAE6FD] text-[#0284C7] font-bold text-sm shadow-xs">
              🤝
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Comité Voluntario Huellitas Purificación</h4>
              <p className="text-xs text-slate-500">Barrio El Ospina Pérez</p>
              <p className="text-[11px] text-[#0284C7] font-semibold mt-1">Hogares de paso y Colectas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
