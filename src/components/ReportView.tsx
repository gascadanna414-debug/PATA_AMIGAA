import React, { useState, useRef } from 'react';
import { 
  AlertCircle, 
  Camera, 
  Upload, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User as UserIcon, 
  Crosshair, 
  Trash2, 
  Clock, 
  Activity, 
  CheckCircle,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { AnimalReport, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { sanitizePhone10, isValidPhone10 } from '../utils/phoneUtils';
import confetti from 'canvas-confetti';

interface ReportViewProps {
  currentUser: User | null;
  onNavigateToChat?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  currentUser,
  onNavigateToChat
}) => {
  const [reports, setReports] = useState<AnimalReport[]>(() => StoreController.getReports());

  // Form states
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || '');
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [neighborhood, setNeighborhood] = useState('Barrio El Ospina Pérez');
  const [addressDetails, setAddressDetails] = useState('');
  const [animalType, setAnimalType] = useState<AnimalReport['animalType']>('Perro');
  const [urgency, setUrgency] = useState<AnimalReport['urgency']>('urgente');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  // Submission feedbacks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<AnimalReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file image upload - supports multiple files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newPhotos: string[] = [];

    fileList.forEach((file: File) => {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Una o más imágenes superan los 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newPhotos.push(reader.result as string);
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          setPhotos(prev => [...prev, ...newPhotos]);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos(prev => [...prev, url]);
      setErrorMsg(null);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('La geolocalización no está disponible en este navegador.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setGpsNote(`Coordenadas GPS detectadas: Lat ${lat}, Lng ${lng} (Purificación, Tolima)`);
        setAddressDetails(prev => prev ? `${prev} (GPS: ${lat}, ${lng})` : `Cerca a coordenadas GPS: ${lat}, ${lng}, Purificación`);
      },
      () => {
        setIsLocating(false);
        setGpsNote('Ubicación fijada en cabecera municipal de Purificación, Tolima.');
        setAddressDetails(prev => prev ? prev : 'Casco urbano Purificación, Tolima');
      },
      { timeout: 7000 }
    );
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reporterName.trim() || !reporterEmail.trim() || !reporterPhone.trim() || !description.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos marcados con (*).');
      return;
    }

    if (!isValidPhone10(reporterPhone)) {
      setErrorMsg('El número de teléfono del informante debe contener exactamente 10 caracteres numéricos (ej: 3128904521).');
      return;
    }

    if (photos.length === 0) {
      setErrorMsg('Por favor adjunta al menos una foto de evidencia para que los administradores y rescatistas puedan evaluar el caso.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newRep = StoreController.createReport({
        reporterName,
        reporterEmail,
        reporterPhone,
        animalType,
        urgency,
        neighborhood,
        addressDetails,
        description,
        photoUrl: photos[0],
        photos: photos
      });

      setReports(StoreController.getReports());
      setSubmittedReport(newRep);
      setIsSubmitting(false);

      // Reset form
      setDescription('');
      setPhotos([]);
      setAddressDetails('');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }, 700);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Announcement */}
      <div className="bg-white text-[#2C1E14] rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EAE2D5] relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#9E6B38] block">
            Red de Auxilio Animal — Purificación
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-[#2C1E14] tracking-tight">
            Reportar un animal en riesgo o abandono
          </h1>
          <p className="text-xs sm:text-sm text-[#6E574B] leading-relaxed">
            Tu reporte llegará inmediatamente a nuestro equipo de administradores, veterinarios y rescatistas de Purificación, Tolima. Puedes adjuntar múltiples fotos como evidencia para una atención más rápida y precisa.
          </p>
        </div>
      </div>

      {/* Main Grid: Report Form on Left / Recent Community Reports on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Comprehensive Report Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE2D5] shadow-xs">
          {submittedReport ? (
            <div className="space-y-4 text-center py-6 animate-in fade-in">
              <div className="w-16 h-16 bg-[#FAF6F0] text-[#9E6B38] rounded-full flex items-center justify-center mx-auto border border-[#E8DFD3]">
                <CheckCircle2 className="w-9 h-9 text-[#9E6B38]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C1E14] font-['Fraunces',serif]">
                ¡Reporte enviado exitosamente a los administradores!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4538] max-w-md mx-auto leading-relaxed">
                El caso fue recibido por nuestro equipo central y asignado a <strong>{submittedReport.assignedRescuer}</strong>. Los voluntarios cercanos al sector <strong>{submittedReport.neighborhood}</strong> han recibido la alerta con las fotos de evidencia.
              </p>
              
              <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] text-xs text-left max-w-md mx-auto space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6E574B]">Código de reporte:</span>
                  <span className="font-mono font-bold text-[#9E6B38]">{submittedReport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E574B]">Animal:</span>
                  <span className="font-semibold text-[#2C1E14]">{submittedReport.animalType} ({submittedReport.urgency})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E574B]">Evidencias adjuntas:</span>
                  <span className="font-semibold text-[#2C1E14]">{submittedReport.photos?.length || 1} fotos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E574B]">Ubicación:</span>
                  <span className="font-semibold text-[#2C1E14]">{submittedReport.neighborhood}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  id="new-report-again-btn"
                  onClick={() => setSubmittedReport(null)}
                  className="px-6 py-2.5 bg-[#9E6B38] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#86582A] cursor-pointer"
                >
                  Reportar otro caso
                </button>
                {onNavigateToChat && (
                  <button
                    onClick={onNavigateToChat}
                    className="px-6 py-2.5 bg-[#FAF6F0] border border-[#E8DFD3] text-xs font-semibold text-[#2C1E14] rounded-full hover:bg-[#F3ECE0] cursor-pointer"
                  >
                    Ir al canal de rescate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-5">
              <div className="border-b border-[#F5EDE2] pb-3">
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Formulario de Reporte Directo
                </h2>
                <p className="text-xs text-[#6E574B]">
                  Este reporte llega directamente a los administradores y brigadas de rescate en Purificación.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Reporter Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider block">
                  1. Tus Datos de Contacto
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#9E6B38] absolute left-3 top-2.5" />
                      <input
                        id="report-name-input"
                        type="text"
                        required
                        placeholder="Ej. Juan Carlos Lozano"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9E6B38] absolute left-3 top-2.5" />
                      <input
                        id="report-email-input"
                        type="email"
                        required
                        placeholder="tu.correo@ejemplo.com"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    Teléfono / Celular de Contacto Inmediato * <span className="text-[10px] text-[#8A7568] font-normal">(10 dígitos)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9E6B38] absolute left-3 top-2.5" />
                    <input
                      id="report-phone-input"
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Ej. 3128904521"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(sanitizePhone10(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Location Information in Purificación Tolima */}
              <div className="space-y-3 pt-2 border-t border-[#EAE2D5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider">
                    2. Ubicación Exacta en Purificación, Tolima
                  </span>
                  <button
                    id="detect-gps-btn"
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-[11px] font-semibold text-[#9E6B38] hover:text-[#86582A] flex items-center gap-1 cursor-pointer bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#E8DFD3]"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detectando GPS...' : 'Usar mi ubicación GPS'}</span>
                  </button>
                </div>

                {gpsNote && (
                  <p className="text-[11px] text-[#2C1E14] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DFD3]">
                    📍 {gpsNote}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Barrio o Sector de Purificación *
                    </label>
                    <select
                      id="report-neighborhood-select"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                    >
                      {PURIFICACION_NEIGHBORHOODS.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Dirección o Puntos de Referencia *
                    </label>
                    <input
                      id="report-address-input"
                      type="text"
                      required
                      placeholder="Ej. Calle 7 # 4-12, frente a la tienda de Doña Rosa"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Animal Info & Urgency */}
              <div className="space-y-3 pt-2 border-t border-[#EAE2D5]">
                <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider block">
                  3. Información del Animal & Urgencia
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Tipo de Animal *
                    </label>
                    <select
                      id="report-animal-type-select"
                      value={animalType}
                      onChange={(e) => setAnimalType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                    >
                      <option value="Perro">🐶 Perro / Canino</option>
                      <option value="Gato">🐱 Gato / Felino</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                      Nivel de Gravedad / Urgencia *
                    </label>
                    <select
                      id="report-urgency-select"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                    >
                      <option value="urgente">🔴 Urgente / Crítico (Atropellado, Sangrado, Fractura)</option>
                      <option value="moderada">🟡 Moderada (Desnutrición, Sarna, Camada abandonada)</option>
                      <option value="leve">🟢 Leve (Extraviado, Deambulando sin peligro inmediato)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C1E14] mb-1">
                    Descripción Completa del Estado del Animal *
                  </label>
                  <textarea
                    id="report-description-textarea"
                    required
                    rows={3}
                    placeholder="Describe los síntomas visibles, color del pelaje, tamaño, si puede caminar, comportamiento y cualquier dato relevante..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E8DFD3] rounded-xl text-xs text-[#2C1E14] focus:outline-none focus:ring-2 focus:ring-[#9E6B38]"
                  />
                </div>
              </div>

              {/* Step 4: Espacio para adjuntar múltiples fotos de evidencia */}
              <div className="space-y-3 pt-2 border-t border-[#EAE2D5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider">
                    4. Fotos o Evidencias Visuales del Animal ({photos.length} adjuntadas) *
                  </span>
                  <span className="text-[11px] text-[#8A7568]">Puedes añadir más de una foto</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {/* Photos Gallery Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-[#9E6B38] bg-[#2C1E14] aspect-square shadow-xs">
                        <img
                          src={resolveImageUrl(url, 'dog')}
                          alt={`Evidencia ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, 'dog')}
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Foto {idx + 1} {idx === 0 ? '(Principal)' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E8DFD3] hover:border-[#9E6B38] bg-[#FAF6F0] hover:bg-[#F3ECE0] rounded-2xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition"
                    >
                      <Plus className="w-6 h-6 text-[#9E6B38] mb-1" />
                      <span className="text-[11px] font-semibold text-[#2C1E14]">Añadir otra foto</span>
                      <span className="text-[9px] text-[#8A7568]">JPG, PNG, WEBP</span>
                    </div>
                  </div>
                )}

                {/* Primary Upload Dropzone if no photos yet */}
                {photos.length === 0 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8DFD3] hover:border-[#9E6B38] bg-[#FAF6F0] hover:bg-[#F3ECE0] rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-[#9E6B38] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E8DFD3]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2C1E14]">
                        Haz clic aquí para seleccionar o arrastrar una o varias fotos del animal
                      </p>
                      <p className="text-[11px] text-[#8A7568] mt-0.5">
                        Formatos soportados: JPG, PNG, WEBP (puedes seleccionar varias fotos)
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Sample Photos */}
                <div className="pt-1">
                  <p className="text-[11px] text-[#8A7568] mb-1.5">
                    O añade fotos de muestra rápida para probar el reporte múltiple:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('/images/mateo_rescue_story_1788226480262.jpg')}
                      className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                    >
                      🐕 Perrito criollo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('/images/kiara_cat_rescue_1788226493062.jpg')}
                      className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                    >
                      🐱 Gatico en riesgo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('/images/bruno_dog_rescue_1788226506971.jpg')}
                      className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                    >
                      🐾 Perro lastimado
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón de Enviar Reporte */}
              <button
                id="submit-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando alerta a los administradores...' : 'Enviar Reporte a los Administradores'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Community Reports Feed & Status Tracker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EAE2D5] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-['Fraunces',serif] text-[#2C1E14] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#9E6B38] animate-pulse" />
                <span>Reportes Activos en Purificación</span>
              </h3>
              <span className="text-[11px] bg-[#2C1E14] text-[#FAF6F0] px-2.5 py-0.5 rounded-full font-semibold">
                {reports.length} casos
              </span>
            </div>

            <p className="text-xs text-[#6E574B] mb-4">
              Seguimiento en tiempo real de los animales atendidos por los administradores y voluntarios en Tolima.
            </p>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const getStatusBadge = (status: AnimalReport['status']) => {
                  switch (status) {
                    case 'recibido':
                      return <span className="bg-[#FAF6F0] text-[#9E6B38] border border-[#E8DFD3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">1. Recibido por Admin</span>;
                    case 'en_camino':
                      return <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">2. Rescatista en camino</span>;
                    case 'en_atencion':
                      return <span className="bg-[#F3ECE0] text-[#5C4538] border border-[#E8DFD3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">3. En atención médica</span>;
                    case 'rescatado':
                      return <span className="bg-[#2C1E14] text-[#FAF6F0] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">4. A salvo / Rescatado</span>;
                  }
                };

                const allEvidences = rep.photos && rep.photos.length > 0 ? rep.photos : [rep.photoUrl];

                return (
                  <div 
                    key={rep.id} 
                    id={`active-report-${rep.id}`}
                    className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-2"
                  >
                    <div className="flex gap-3">
                      <img
                        src={resolveImageUrl(rep.photoUrl, 'dog')}
                        alt="Foto reporte"
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
                        onError={(e) => handleImageError(e, 'dog')}
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2C1E14] truncate">
                            {rep.animalType} — {rep.neighborhood}
                          </span>
                          <span className="text-[10px] text-[#8A7568]">{rep.reportedAt}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getStatusBadge(rep.status)}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rep.urgency === 'urgente' ? 'bg-red-100 text-red-800' : 'bg-white text-[#9E6B38] border border-[#E8DFD3]'
                          }`}>
                            {rep.urgency}
                          </span>
                          {allEvidences.length > 1 && (
                            <span className="text-[10px] bg-white border border-[#E8DFD3] text-[#5C4538] px-1.5 py-0.2 rounded-full font-medium">
                              📷 {allEvidences.length} fotos
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5C4538] line-clamp-2 leading-relaxed">
                          {rep.description}
                        </p>
                      </div>
                    </div>

                    {/* Small thumbnail strip if multiple photos */}
                    {allEvidences.length > 1 && (
                      <div className="flex gap-1.5 pt-1 overflow-x-auto">
                        {allEvidences.map((photo, pIdx) => (
                          <img
                            key={pIdx}
                            src={resolveImageUrl(photo, 'dog')}
                            alt={`Evidencia ${pIdx + 1}`}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E8DFD3] shrink-0"
                            onError={(e) => handleImageError(e, 'dog')}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    )}

                    {rep.statusNote && (
                      <div className="bg-white p-2 rounded-xl border border-[#E8DFD3] text-[11px] text-[#5C4538] flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9E6B38] shrink-0 mt-0.5" />
                        <span><strong>Avance Admin:</strong> {rep.statusNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
