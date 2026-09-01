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
  ShieldAlert, 
  Activity, 
  CheckCircle
} from 'lucide-react';
import { AnimalReport, User } from '../types';
import { StoreController } from '../controllers/storeController';
import { PURIFICACION_NEIGHBORHOODS } from '../data/initialData';
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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  // Submission feedbacks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<AnimalReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('La imagen no debe superar los 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetSamplePhoto = (url: string) => {
    setPhotoUrl(url);
    setErrorMsg(null);
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
        // Fallback default coordinates for Purificación Tolima
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

    if (!photoUrl) {
      setErrorMsg('Por favor adjunta una foto o selecciona una imagen de muestra para que el equipo pueda evaluar el caso.');
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
        photoUrl
      });

      setReports(StoreController.getReports());
      setSubmittedReport(newRep);
      setIsSubmitting(false);

      // Reset fields
      setDescription('');
      setPhotoUrl('');
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
            Si encuentras un perro, gato u otro animal herido, atropellado o en situación crítica en Purificación o sus veredas, completa este formulario. El reporte se comparte con los voluntarios y veterinarias de la zona.
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
                ¡Reporte registrado con éxito!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4538] max-w-md mx-auto leading-relaxed">
                El caso fue asignado a <strong>{submittedReport.assignedRescuer}</strong>. Los voluntarios cercanos al sector <strong>{submittedReport.neighborhood}</strong> han sido notificados con la información y foto suministradas.
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
                    Seguir en la comunidad
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-5">
              <div className="border-b border-[#F5EDE2] pb-3">
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[#2C1E14]">
                  Formulario de Reporte Ciudadano
                </h2>
                <p className="text-xs text-[#6E574B]">
                  Proporciona detalles específicos para coordinar el rescate en Purificación, Tolima.
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
                    Teléfono / Celular de Contacto Inmediato *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9E6B38] absolute left-3 top-2.5" />
                    <input
                      id="report-phone-input"
                      type="tel"
                      required
                      placeholder="Ej. 312 890 4521"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
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
                      <option value="Equino">🐴 Caballo / Mula</option>
                      <option value="Fauna Silvestre">🦜 Fauna Silvestre</option>
                      <option value="Otro">🐾 Otro animal</option>
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

              {/* Step 4: Espacio para adjuntar foto del animal */}
              <div className="space-y-3 pt-2 border-t border-[#EAE2D5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9E6B38] uppercase tracking-wider">
                    4. Adjuntar Foto o Evidencia Visual del Animal *
                  </span>
                  <span className="text-[11px] text-[#8A7568]">Requerido para el triaje</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#9E6B38] bg-[#2C1E14] h-52 group">
                    <img
                      src={photoUrl}
                      alt="Foto adjunta del animal"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-[#2C1E14] rounded-full text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#9E6B38]" />
                        <span>Cambiar foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-[#9E6B38] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#FAF6F0]" />
                      <span>Foto adjuntada correctamente</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8DFD3] hover:border-[#9E6B38] bg-[#FAF6F0] hover:bg-[#F3ECE0] rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-[#9E6B38] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform border border-[#E8DFD3]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2C1E14]">
                        Haz clic aquí para seleccionar o arrastrar una foto del animal
                      </p>
                      <p className="text-[11px] text-[#8A7568] mt-0.5">
                        Formatos soportados: JPG, PNG, WEBP (hasta 5MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick test preset photos */}
                {!photoUrl && (
                  <div className="pt-1">
                    <p className="text-[11px] text-[#8A7568] mb-1.5">
                      O selecciona una foto de muestra rápida para probar el reporte:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetSamplePhoto('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80')}
                        className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        🐕 Perrito criollo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetSamplePhoto('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80')}
                        className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        🐱 Gatico en caja
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetSamplePhoto('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80')}
                        className="text-[11px] bg-[#FAF6F0] border border-[#E8DFD3] hover:bg-[#F3ECE0] px-3 py-1 rounded-full text-[#9E6B38] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        🐾 Animal desorientado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Enviar Reporte */}
              <button
                id="submit-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#9E6B38] hover:bg-[#86582A] text-white font-semibold rounded-full shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando alerta a la red de Purificación...' : 'Enviar Reporte de Rescate'}</span>
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
              Seguimiento en tiempo real de los animales atendidos por los voluntarios en Tolima.
            </p>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const getStatusBadge = (status: AnimalReport['status']) => {
                  switch (status) {
                    case 'recibido':
                      return <span className="bg-[#FAF6F0] text-[#9E6B38] border border-[#E8DFD3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">1. Recibido</span>;
                    case 'en_camino':
                      return <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">2. Rescatista en camino</span>;
                    case 'en_atencion':
                      return <span className="bg-[#F3ECE0] text-[#5C4538] border border-[#E8DFD3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">3. En atención médica</span>;
                    case 'rescatado':
                      return <span className="bg-[#2C1E14] text-[#FAF6F0] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">4. A salvo / Rescatado</span>;
                  }
                };

                return (
                  <div 
                    key={rep.id} 
                    id={`active-report-${rep.id}`}
                    className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-2"
                  >
                    <div className="flex gap-3">
                      <img
                        src={rep.photoUrl}
                        alt="Foto reporte"
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0"
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
                        </div>
                        <p className="text-[11px] text-[#5C4538] line-clamp-2 leading-relaxed">
                          {rep.description}
                        </p>
                      </div>
                    </div>

                    {rep.statusNote && (
                      <div className="bg-white p-2 rounded-xl border border-[#E8DFD3] text-[11px] text-[#5C4538] flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9E6B38] shrink-0 mt-0.5" />
                        <span><strong>Avance:</strong> {rep.statusNote}</span>
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
