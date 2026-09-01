import React, { useState } from 'react';
import { 
  Heart, 
  AlertCircle, 
  Calendar, 
  Star, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  HeartHandshake,
  Building2,
  Stethoscope,
  ShieldCheck,
  Check,
  BookOpen
} from 'lucide-react';
import { SuccessStory, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import confetti from 'canvas-confetti';

interface HomeViewProps {
  onNavigate: (tab: string, storyId?: string, petFilter?: 'Perro' | 'Gato' | 'Todos') => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate
}) => {
  const [stories, setStories] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});

  const handleLike = (storyId: string) => {
    if (likedStories[storyId]) return;
    const updated = StoreController.likeSuccessStory(storyId);
    setStories(updated);
    setLikedStories(prev => ({ ...prev, [storyId]: true }));
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch {
      // fallback
    }
  };

  const testimonials = [
    {
      stars: 5,
      quote: "Adoptar a Malu fue la mejor decisión de mi vida. El proceso fue muy fácil y el equipo de PataAmiga nos acompañó en todo momento.",
      author: "María García",
      role: "Adoptó a Malu"
    },
    {
      stars: 5,
      quote: "Gracias a PataAmiga pude reportar un perrito en peligro y fue rescatado al día siguiente. ¡Una organización increíble!",
      author: "Carlos Mejía",
      role: "Voluntario activo"
    },
    {
      stars: 5,
      quote: "Copito llegó a nuestra familia hace 6 meses y no podemos imaginarnos la vida sin él. ¡Gracias PataAmiga por conectarnos!",
      author: "Sofía Ramírez",
      role: "Adoptó a Copito"
    }
  ];

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* 1. HERO BANNER: (Matches Screenshot 2 Top) */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-md bg-[#2C1E14]">
        {/* Background Image */}
        <div className="relative h-[260px] sm:h-[360px] md:h-[420px] w-full">
          <img 
            src={resolveImageUrl('hero_banner_puppy_1788225942236.jpg', 'hero')} 
            alt="Salva una vida hoy - Pata Amiga Purificación" 
            className="w-full h-full object-cover object-center"
            onError={(e) => handleImageError(e, 'hero')}
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay on left for maximum text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
            <div className="px-6 sm:px-12 md:px-16 max-w-xl text-white space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md font-['Fraunces',serif]">
                Salva una <br className="hidden sm:inline" />vida hoy.
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-[#F9F4EE] font-medium drop-shadow-sm max-w-md">
                Adopta, Reporta y Apoya a los animales de nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE QUICK ACTION CARDS (Matches Screenshot 2 Bottom) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: ADOPTA A TU ¡MEJOR AMIGO! */}
        <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-7 border border-[#EAE2D5] shadow-xs flex flex-col justify-between items-center text-center space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold uppercase text-[#2C1E14] tracking-wide">
              ADOPTA A TU <br />
              <span className="text-[#9E6B38]">¡MEJOR AMIGO!</span>
            </h2>
          </div>

          {/* 3 Circular pet avatars */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
            {/* Mona */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#EAE2D5]">
                <img 
                  src={resolveImageUrl('mona_dog_1788225963408.jpg', 'puppy')} 
                  alt="Mona" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 'puppy')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold text-[#2C1E14]">Mona</span>
              <button
                onClick={() => onNavigate('adopcion', undefined, 'Perro')}
                className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#6E574B] text-[10px] font-semibold border border-[#EAE2D5] transition cursor-pointer shadow-2xs whitespace-nowrap"
              >
                Ver perros
              </button>
            </div>

            {/* Kiara */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#EAE2D5]">
                <img 
                  src={resolveImageUrl('kiara_cat_rescue_1788226493062.jpg', 'cat')} 
                  alt="Kiara" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 'cat')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold text-[#2C1E14]">Kiara</span>
              <button
                onClick={() => onNavigate('adopcion', undefined, 'Gato')}
                className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#6E574B] text-[10px] font-semibold border border-[#EAE2D5] transition cursor-pointer shadow-2xs whitespace-nowrap"
              >
                Ver gatos
              </button>
            </div>

            {/* Rocky */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#EAE2D5]">
                <img 
                  src={resolveImageUrl('rocky_labrador_1788225471339.jpg', 'dogLabrador')} 
                  alt="Rocky" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 'dogLabrador')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold text-[#2C1E14]">Rocky</span>
              <button
                onClick={() => onNavigate('adopcion', undefined, 'Perro')}
                className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#6E574B] text-[10px] font-semibold border border-[#EAE2D5] transition cursor-pointer shadow-2xs whitespace-nowrap"
              >
                Ver perros
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: REPORTAR UN ANIMAL EN PELIGRO */}
        <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-7 border border-[#EAE2D5] shadow-xs flex flex-col justify-between items-center text-center space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold uppercase text-[#2C1E14] tracking-wide">
              REPORTAR UN ANIMAL <br />
              <span>EN PELIGRO</span>
            </h2>
          </div>

          {/* Big Centered Graphic Icon (Paw in hands) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-3 border border-[#EAE2D5] shadow-xs flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#9E6B38" strokeWidth="2.5" strokeDasharray="4 4" />
              {/* Paw center */}
              <circle cx="24" cy="22" r="3.5" fill="#9E6B38" />
              <circle cx="32" cy="18" r="4" fill="#9E6B38" />
              <circle cx="40" cy="22" r="3.5" fill="#9E6B38" />
              <path d="M32 26C28 26 25 29 25 32C25 36 32 41 32 41C32 41 39 36 39 32C39 29 36 26 32 26Z" fill="#9E6B38" />
              {/* Caring hands silhouette */}
              <path d="M18 42C21 44 26 47 32 47C38 47 43 44 46 42" stroke="#2C1E14" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Button: Reportar incidente */}
          <button
            onClick={() => onNavigate('reportar')}
            className="w-full py-2.5 px-4 rounded-full bg-[#9E6B38] hover:bg-[#86582A] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            Reportar incidente
          </button>
        </div>

        {/* Card 3: ÚLTIMOS RESCATES Y NOTICIAS */}
        <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-7 border border-[#EAE2D5] shadow-xs flex flex-col justify-between items-center text-center space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold uppercase text-[#2C1E14] tracking-wide">
              ÚLTIMOS RESCATES <br />
              <span>Y NOTICIAS</span>
            </h2>
          </div>

          {/* Thumbnails: Chopper & Hades */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Chopper */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-full h-20 sm:h-22 rounded-xl overflow-hidden border border-[#EAE2D5] bg-black/5 shadow-2xs">
                <img 
                  src={resolveImageUrl('chopper_rescue_1788225394304.jpg', 'dog')} 
                  alt="El rescate de Chopper" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 'dog')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] font-extrabold uppercase text-[#2C1E14] leading-tight line-clamp-1">
                EL RESCATE DE CHOPPER
              </span>
              <button
                onClick={() => onNavigate('blog', 'story-chopper')}
                className="px-4 py-0.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#6E574B] text-[10px] font-semibold border border-[#EAE2D5] transition cursor-pointer shadow-2xs"
              >
                Ver
              </button>
            </div>

            {/* Hades */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-full h-20 sm:h-22 rounded-xl overflow-hidden border border-[#EAE2D5] bg-black/5 shadow-2xs">
                <img 
                  src={resolveImageUrl('hades_rescue_1788225379594.jpg', 'dogNoble')} 
                  alt="El rescate de Hades" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 'dogNoble')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] font-extrabold uppercase text-[#2C1E14] leading-tight line-clamp-1">
                EL RESCATE DE HADES
              </span>
              <button
                onClick={() => onNavigate('blog', 'story-hades')}
                className="px-4 py-0.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#6E574B] text-[10px] font-semibold border border-[#EAE2D5] transition cursor-pointer shadow-2xs"
              >
                Ver
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 HISTORIAS DE RESCATE RECIENTES CON IMÁGENES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#9E6B38] text-xs font-bold uppercase tracking-wider mb-2 border border-[#E8DFD3]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Historias que inspiran</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Finales Felices en Purificación
            </h2>
            <p className="text-xs sm:text-sm text-[#8A7568]">
              Cada rescate representa un compromiso cumplido con los animales de nuestra región.
            </p>
          </div>
          <button
            onClick={() => onNavigate('blog')}
            className="px-4 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#2C1E14] text-xs font-bold rounded-full border border-[#E8DFD3] transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Ver todas las {stories.length} historias</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9E6B38]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stories.slice(0, 4).map((story) => (
            <div
              key={story.id}
              onClick={() => onNavigate('blog', story.id)}
              className="bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#E8DFD3] hover:border-[#9E6B38] transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-36 overflow-hidden bg-black/10 relative">
                  <img
                    src={resolveImageUrl(story.currentPhotoUrl || story.beforePhotoUrl, story.species === 'Gato' ? 'cat' : 'dog')}
                    alt={story.petName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, story.species === 'Gato' ? 'cat' : 'dog')}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-[#2C1E14]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {story.species}
                  </div>
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#2C1E14] group-hover:text-[#9E6B38] transition font-['Fraunces',serif]">
                      {story.petName}
                    </h3>
                    <span className="text-[10px] text-[#8A7568]">{story.estimatedAge}</span>
                  </div>
                  <p className="text-[11px] text-[#8A7568] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#9E6B38] shrink-0" />
                    <span className="truncate">{story.rescueLocation.split(',')[0]}</span>
                  </p>
                  <p className="text-xs text-[#5C4538] line-clamp-2">
                    {story.rescueStory}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <span className="text-[11px] font-bold text-[#9E6B38] group-hover:underline">
                  Leer crónica →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FULL WIDTH STATS BAR: Caramel / Mustard Bar (Matches Screenshot 1 & 2) */}
      <section className="bg-[#9E6B38] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/15">
          <div className="space-y-1 pt-2 md:pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Fraunces',serif] text-white">
              120+
            </div>
            <div className="text-xs sm:text-sm text-[#FAF6F0] font-medium">
              Animales Rescatados
            </div>
          </div>

          <div className="space-y-1 pt-2 md:pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Fraunces',serif] text-white">
              85+
            </div>
            <div className="text-xs sm:text-sm text-[#FAF6F0] font-medium">
              Adopciones Exitosas
            </div>
          </div>

          <div className="space-y-1 pt-2 md:pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Fraunces',serif] text-white">
              200+
            </div>
            <div className="text-xs sm:text-sm text-[#FAF6F0] font-medium">
              Reportes Atendidos
            </div>
          </div>

          <div className="space-y-1 pt-2 md:pt-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Fraunces',serif] text-white">
              340+
            </div>
            <div className="text-xs sm:text-sm text-[#FAF6F0] font-medium">
              Familias Felices
            </div>
          </div>
        </div>
      </section>

      {/* 4. LO QUE DICEN NUESTRAS FAMILIAS (Matches Screenshot 1 top left) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1E14]">
            Lo que dicen nuestras familias
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7568]">
            Testimonios reales de adopción y rescate en Purificación, Tolima
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EAE2D5] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition"
            >
              <div className="space-y-3">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#5C4538] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Details */}
              <div className="pt-2 border-t border-[#F5EDE2]">
                <h4 className="text-sm font-bold text-[#2C1E14]">{t.author}</h4>
                <p className="text-[11px] text-[#8A7568]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VETERINARIAS Y ALIADOS LOCALES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Veterinarias y Aliados en Purificación
            </h3>
            <p className="text-xs sm:text-sm text-[#6E574B]">
              Profesionales y centros médicos locales que colaboran con cirugías, urgencias y medicamentos.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contacto')}
            className="text-xs font-semibold text-[#2C1E14] bg-[#FAF6F0] border border-[#E8DFD3] px-4 py-2 rounded-full hover:bg-[#F3ECE0] transition cursor-pointer self-start sm:self-auto"
          >
            Vincular mi veterinaria
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] text-[#9E6B38] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2C1E14]">Clínica Veterinaria San Francisco</h4>
              <p className="text-xs text-[#6E574B]">Calle 7 #4-22, Purificación Tolima</p>
              <p className="text-[11px] text-[#9E6B38] font-medium mt-1">Urgencias, Cirugía y Vacunación</p>
            </div>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] text-[#9E6B38] shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2C1E14]">Centro Médico Veterinario Tolima</h4>
              <p className="text-xs text-[#6E574B]">Carrera 5 frente al Parque Principal</p>
              <p className="text-[11px] text-[#9E6B38] font-medium mt-1">Esterilizaciones y Laboratorio</p>
            </div>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD3] text-[#9E6B38] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2C1E14]">Comité Voluntario Huellitas</h4>
              <p className="text-xs text-[#6E574B]">Barrio El Ospina Pérez</p>
              <p className="text-[11px] text-[#9E6B38] font-medium mt-1">Hogares de paso y Colectas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

