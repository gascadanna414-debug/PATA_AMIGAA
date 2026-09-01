import React, { useState } from 'react';
import { Heart, Share2, ArrowLeft, ArrowRight, MapPin, Calendar, CheckCircle2, BookOpen, Search, Sparkles, User as UserIcon } from 'lucide-react';
import { SuccessStory, User } from '../types';
import { StoreController } from '../controllers/storeController';
import confetti from 'canvas-confetti';

interface BlogViewProps {
  onNavigateToAdopt?: () => void;
  currentUser: User | null;
  initialStoryId?: string;
}

export const BlogView: React.FC<BlogViewProps> = ({
  onNavigateToAdopt,
  initialStoryId
}) => {
  const [stories, setStories] = useState<SuccessStory[]>(() => StoreController.getSuccessStories());
  const [selectedStoryId, setSelectedStoryId] = useState<string>(initialStoryId || 'story-hades');
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [storySearch, setStorySearch] = useState('');
  const [storySpeciesFilter, setStorySpeciesFilter] = useState<'Todos' | 'Perro' | 'Gato'>('Todos');

  const filteredStories = stories.filter(s => {
    const matchesSpecies = storySpeciesFilter === 'Todos' || s.species === storySpeciesFilter;
    const matchesSearch = !storySearch || 
      s.petName.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.breed.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.rescueStory.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.rescueLocation.toLowerCase().includes(storySearch.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  const currentStoryIndex = stories.findIndex(s => s.id === selectedStoryId);
  const currentStory = stories[currentStoryIndex !== -1 ? currentStoryIndex : 0] || stories[0];

  const handleNextStory = () => {
    const nextIdx = (currentStoryIndex + 1) % stories.length;
    setSelectedStoryId(stories[nextIdx].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStory = () => {
    const prevIdx = (currentStoryIndex - 1 + stories.length) % stories.length;
    setSelectedStoryId(stories[prevIdx].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = (storyId: string) => {
    if (likedStories[storyId]) return;
    const updated = StoreController.likeSuccessStory(storyId);
    setStories(updated);
    setLikedStories(prev => ({ ...prev, [storyId]: true }));
    try {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    } catch {
      // fallback
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Top Banner with Search and Story Pills */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#EAE2D5] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#9E6B38] text-xs font-bold uppercase tracking-wider mb-2 border border-[#E8DFD3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Historias de Rescate y Superación</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Transformando Vidas en Purificación, Tolima
            </h1>
            <p className="text-xs sm:text-sm text-[#6E574B] mt-1">
              Conoce las emotivas historias de rescate, recuperación y adopción de nuestros peluditos protegidos.
            </p>
          </div>

          {/* Search bar inside blog */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#9E6B38] absolute left-3.5 top-3" />
            <input
              type="text"
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              placeholder="Buscar por nombre, barrio o raza..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-full text-xs text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
            />
          </div>
        </div>

        {/* Species & Story Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F5EDE2]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setStorySpeciesFilter('Todos')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                storySpeciesFilter === 'Todos'
                  ? 'bg-[#2C1E14] text-white'
                  : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
              }`}
            >
              Todos ({stories.length})
            </button>
            <button
              onClick={() => setStorySpeciesFilter('Perro')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                storySpeciesFilter === 'Perro'
                  ? 'bg-[#2C1E14] text-white'
                  : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
              }`}
            >
              🐶 Perros ({stories.filter(s => s.species === 'Perro').length})
            </button>
            <button
              onClick={() => setStorySpeciesFilter('Gato')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                storySpeciesFilter === 'Gato'
                  ? 'bg-[#2C1E14] text-white'
                  : 'bg-[#FAF6F0] text-[#6E574B] hover:bg-[#F3ECE0]'
              }`}
            >
              🐱 Gatos ({stories.filter(s => s.species === 'Gato').length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {filteredStories.map(s => {
              const isSelected = s.id === currentStory.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStoryId(s.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#9E6B38] text-white shadow-xs font-bold'
                      : 'bg-[#F9F6F0] text-[#5C4538] hover:bg-[#F3ECE0] border border-[#E8DFD3]'
                  }`}
                >
                  <span>{s.petName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Rescue Story Article (Featured) */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EAE2D5] shadow-xs max-w-4xl mx-auto space-y-8">
        {/* Story Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#9E6B38] text-xs font-semibold border border-[#E8DFD3]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentStory.rescueLocation}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-[#2C1E14] tracking-tight">
            Historia de Rescate de {currentStory.petName.toUpperCase()}
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7568] flex items-center justify-center gap-2">
            <span>{currentStory.breed} • {currentStory.estimatedAge}</span>
            <span>•</span>
            <span className="text-[#9E6B38] font-medium">Adoptado en Purificación, Tolima</span>
          </p>
        </div>

        {/* Hero Photo */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#EAE2D5] max-w-3xl mx-auto bg-[#1C120B]">
          <img
            src={currentStory.currentPhotoUrl || currentStory.beforePhotoUrl}
            alt={`Historia de rescate de ${currentStory.petName}`}
            className="w-full h-auto max-h-[480px] object-cover mx-auto"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-[#2C1E14]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full">
            {currentStory.species} • {currentStory.petName}
          </div>
          <div className="absolute bottom-3 right-3 bg-[#9E6B38] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            ¡Caso de Éxito Resuelto!
          </div>
        </div>

        {/* Before / After comparison photos if available */}
        {currentStory.beforePhotoUrl && currentStory.currentPhotoUrl && currentStory.beforePhotoUrl !== currentStory.currentPhotoUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DFD3]">
            <div className="space-y-1.5 text-center">
              <span className="text-xs font-bold text-[#8A7568] block">Al momento del rescate</span>
              <div className="h-44 rounded-xl overflow-hidden bg-black/10">
                <img
                  src={currentStory.beforePhotoUrl}
                  alt={`Antes de ${currentStory.petName}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="space-y-1.5 text-center">
              <span className="text-xs font-bold text-[#9E6B38] block">Hoy con su familia adoptiva</span>
              <div className="h-44 rounded-xl overflow-hidden bg-black/10">
                <img
                  src={currentStory.currentPhotoUrl}
                  alt={`Después de ${currentStory.petName}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Story Narrative Paragraphs */}
        <div className="max-w-2xl mx-auto space-y-5 text-[#3D2C22] text-sm sm:text-base leading-relaxed font-normal">
          <p className="font-medium text-[#2C1E14] text-base sm:text-lg">
            {currentStory.rescueStory}
          </p>

          <p className="text-[#5C4538]">
            {currentStory.adoptionStory}
          </p>

          {/* Recovery and Health details */}
          <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E8DFD3] space-y-2.5 my-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-[#2C1E14]">
              <CheckCircle2 className="w-4 h-4 text-[#9E6B38]" />
              <span>Proceso de Recuperación en Purificación</span>
            </div>
            <p className="text-[#6E574B]">
              <strong>Al ser encontrado:</strong> {currentStory.healthBefore}
            </p>
            <p className="text-[#6E574B]">
              <strong>Vida actual:</strong> {currentStory.healthAfter}
            </p>
            <div className="pt-2 border-t border-[#E8DFD3] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#9E6B38] font-bold">
                Adoptado por: {currentStory.adoptedFamilyName}
              </span>
              <span className="text-[#8A7568]">
                Fecha: {currentStory.adoptedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Story Pagination Navigation Buttons */}
        <div className="max-w-2xl mx-auto flex items-center justify-between pt-4 border-t border-[#EAE2D5]">
          <button
            onClick={handlePrevStory}
            className="px-4 py-2 rounded-full bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#5C4538] text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-[#E8DFD3]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#9E6B38]" />
            <span>Historia anterior</span>
          </button>

          <button
            onClick={handleNextStory}
            className="px-4 py-2 rounded-full bg-[#9E6B38] hover:bg-[#86582A] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>Siguiente historia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Article Footer & Actions */}
        <div className="max-w-2xl mx-auto pt-4 border-t border-[#EAE2D5] flex items-center justify-between">
          <button
            onClick={() => handleLike(currentStory.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
              likedStories[currentStory.id]
                ? 'bg-[#FAF6F0] text-[#9E6B38] border border-[#9E6B38]'
                : 'bg-[#F9F6F0] hover:bg-[#F3ECE0] text-[#5C4538] border border-[#E8DFD3]'
            }`}
          >
            <Heart className={`w-4 h-4 ${likedStories[currentStory.id] ? 'fill-[#9E6B38] text-[#9E6B38]' : 'text-[#9E6B38]'}`} />
            <span>{currentStory.likes} Personas conmovidas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#E8DFD3] text-[#5C4538] transition cursor-pointer"
              title="Compartir historia"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="text-[11px] text-[#9E6B38] font-semibold">¡Enlace copiado!</span>
            )}
          </div>
        </div>

        {/* CTA to adopt */}
        {onNavigateToAdopt && (
          <div className="bg-[#9E6B38] text-white p-6 sm:p-8 rounded-2xl text-center space-y-3 max-w-2xl mx-auto shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold font-['Fraunces',serif]">
              ¿Quieres ser parte del próximo final feliz?
            </h3>
            <p className="text-xs sm:text-sm text-[#F6EFE5]">
              Tenemos perritos y gaticos en Purificación esperando una oportunidad como la que tuvo {currentStory.petName}.
            </p>
            <button
              onClick={onNavigateToAdopt}
              className="px-6 py-2.5 bg-white hover:bg-[#FAF6F0] text-[#2C1E14] font-bold rounded-full text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Ver catálogo de adopción
            </button>
          </div>
        )}
      </article>

      {/* Grid of all other stories */}
      <div className="max-w-6xl mx-auto space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
              Todas las Historias de Rescate ({filteredStories.length})
            </h3>
            <p className="text-xs text-[#8A7568]">
              Haz clic en cualquier caso para leer su crónica completa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => {
                setSelectedStoryId(story.id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between group ${
                story.id === currentStory.id ? 'border-[#9E6B38] ring-2 ring-[#9E6B38]/20' : 'border-[#EAE2D5]'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#1C120B]">
                  <img
                    src={story.currentPhotoUrl || story.beforePhotoUrl}
                    alt={story.petName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#2C1E14]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {story.species} • {story.petName}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#9E6B38] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    ❤️ {story.likes}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14] group-hover:text-[#9E6B38] transition">
                      {story.petName}
                    </h4>
                    <span className="text-[11px] text-[#8A7568]">{story.estimatedAge}</span>
                  </div>
                  <p className="text-xs text-[#8A7568] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#9E6B38]" />
                    <span className="truncate">{story.rescueLocation}</span>
                  </p>
                  <p className="text-xs text-[#5C4538] line-clamp-2 leading-relaxed">
                    {story.rescueStory}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <span className="text-xs font-bold text-[#9E6B38] group-hover:underline flex items-center gap-1">
                  Leer historia completa →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
