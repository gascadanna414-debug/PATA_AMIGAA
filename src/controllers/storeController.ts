import { 
  SuccessStory, 
  AdoptionPet, 
  AdoptionApplication, 
  HealthEvent, 
  EventRegistration, 
  AnimalReport, 
  ChatChannel, 
  ChatMessage, 
  ContactMessage,
  AppNotification
} from '../types';
import { 
  INITIAL_SUCCESS_STORIES, 
  INITIAL_ADOPTION_PETS, 
  INITIAL_HEALTH_EVENTS, 
  INITIAL_ANIMAL_REPORTS, 
  INITIAL_CHAT_CHANNELS, 
  INITIAL_CHAT_MESSAGES 
} from '../data/initialData';
import { AUTHORIZED_ADMIN_EMAILS } from './authController';

const STORIES_KEY = 'pata_amiga_stories';
const PETS_KEY = 'pata_amiga_pets';
const ADOPTION_APPS_KEY = 'pata_amiga_adoption_apps';
const EVENTS_KEY = 'pata_amiga_events';
const REGISTRATIONS_KEY = 'pata_amiga_event_registrations';
const REPORTS_KEY = 'pata_amiga_reports';
const NOTIFICATIONS_KEY = 'pata_amiga_notifications';
const ADMIN_NOTIFICATIONS_KEY = 'pata_amiga_admin_notifications_v2';
const USER_NOTIFICATIONS_KEY = 'pata_amiga_user_notifications_v2';
const CHAT_CHANNELS_KEY = 'pata_amiga_chat_channels';
const CHAT_MESSAGES_KEY = 'pata_amiga_chat_messages';
const CONTACTS_KEY = 'pata_amiga_contacts';
const DELETED_PETS_KEY = 'pata_amiga_deleted_pets_ids';
const DELETED_EVENTS_KEY = 'pata_amiga_deleted_events_ids';

const MAX_EVENT_CAPACITY = 25;

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('pata-data-change', { detail: { key } }));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

const INITIAL_ADMIN_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'admin-notif-rep-1',
    title: '🚨 Nuevo Reporte Animal: Perro (URGENTE)',
    message: 'Ubicación: Barrio Camilo Torres - Carrera 5 con Calle 4. Reportado por Carlos Mendoza (Tel: 3105558899). Animal con herida en pata delantera.',
    type: 'reporte',
    timestamp: 'Hoy, 09:15 AM',
    read: false,
    linkTab: 'admin',
    targetRole: 'admin',
    metadata: {
      reportId: 'rep-1',
      animalType: 'Perro',
      neighborhood: 'Barrio Camilo Torres'
    }
  },
  {
    id: 'admin-notif-app-1',
    title: '🐾 Nueva Postulación de Adopción: Mateo',
    message: 'Laura Camila Rodríguez (Tel: 3154442211) se ha postulado para adoptar a Mateo. Ubicación: Barrio Ospina Pérez. Requiere evaluación en el panel.',
    type: 'adopcion',
    timestamp: 'Ayer, 03:40 PM',
    read: false,
    linkTab: 'admin',
    targetRole: 'admin',
    metadata: {
      petName: 'Mateo',
      applicantName: 'Laura Camila Rodríguez',
      applicationId: 'app-sample-1'
    }
  },
  {
    id: 'admin-notif-rep-2',
    title: '🚨 Nuevo Reporte Animal: Gato',
    message: 'Ubicación: Barrio Santa Bárbara - Manzana B Casa 12. Reportado por Andrea Gómez (Tel: 3147771234). Gatito abandonado dentro de caja.',
    type: 'reporte',
    timestamp: 'Hace 2 días',
    read: true,
    linkTab: 'admin',
    targetRole: 'admin',
    metadata: {
      reportId: 'rep-2',
      animalType: 'Gato',
      neighborhood: 'Barrio Santa Bárbara'
    }
  }
];

const INITIAL_USER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'user-notif-new-brigade-1',
    title: '📢 ¡Nueva Brigada Programada en Purificación!',
    message: 'Se ha abierto la inscripción para la "Gran Jornada de Esterilización Gratuita" en el Polideportivo Municipal. ¡Separa tu cupo con anticipación, cupo limitado a 25 mascotas!',
    type: 'evento',
    isNewBrigade: true,
    timestamp: 'Hoy, 10:00 AM',
    read: false,
    linkTab: 'eventos',
    targetRole: 'user'
  },
  {
    id: 'user-notif-rem-1',
    title: '🗓️ Recordatorio de Brigada Próxima',
    message: 'Recuerda que la jornada veterinaria en el Polideportivo Municipal se aproxima. Para cirugías o esterilizaciones, tu mascota debe estar en ayuno estricto de 8 horas y llevar carné de vacunación.',
    type: 'evento',
    isReminder: true,
    timestamp: 'Hoy, 08:00 AM',
    read: false,
    linkTab: 'eventos',
    targetRole: 'user'
  },
  {
    id: 'user-notif-app-accepted-1',
    title: '🎉 ¡Postulación Aprobada para Adopción: Mateo!',
    message: '¡Felicidades! Tu postulación para adoptar a Mateo ha sido APROBADA con éxito por el equipo de Pata Amiga Purificación. Nos comunicaremos contigo para coordinar la firma del acta y entrega responsable.',
    type: 'adopcion',
    statusType: 'aprobada',
    timestamp: 'Ayer, 04:30 PM',
    read: true,
    linkTab: 'adopciones',
    targetRole: 'user',
    metadata: {
      petName: 'Mateo',
      applicantName: 'Tutor Solicitante'
    }
  }
];

export const StoreController = {
  // --- SUCCESS STORIES ---
  getSuccessStories(): SuccessStory[] {
    const cached = getItem<SuccessStory[]>(STORIES_KEY, INITIAL_SUCCESS_STORIES);
    const merged = [...INITIAL_SUCCESS_STORIES];
    cached.forEach(c => {
      const idx = merged.findIndex(m => m.id === c.id);
      if (idx !== -1) {
        merged[idx] = {
          ...merged[idx],
          likes: Math.max(merged[idx].likes, c.likes || 0)
        };
      } else {
        merged.push(c);
      }
    });
    return merged;
  },

  saveSuccessStory(story: Partial<SuccessStory> & { petName: string; breed: string; rescueStory: string; adoptionStory: string }): SuccessStory {
    const stories = this.getSuccessStories();
    const isEdit = !!story.id && stories.some(s => s.id === story.id);
    
    let savedStory: SuccessStory;
    if (isEdit) {
      savedStory = {
        ...stories.find(s => s.id === story.id)!,
        ...story
      } as SuccessStory;
      const updated = stories.map(s => s.id === story.id ? savedStory : s);
      setItem(STORIES_KEY, updated);
    } else {
      savedStory = {
        id: `story-${Date.now()}`,
        petName: story.petName,
        species: story.species || 'Perro',
        breed: story.breed,
        estimatedAge: story.estimatedAge || '1 año',
        rescueLocation: story.rescueLocation || 'Purificación, Tolima',
        rescueStory: story.rescueStory,
        adoptionStory: story.adoptionStory,
        adoptedFamilyName: story.adoptedFamilyName || 'Familia Adoptante',
        adoptedDate: story.adoptedDate || new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
        healthBefore: story.healthBefore || 'En proceso de recuperación',
        healthAfter: story.healthAfter || '100% Sano y feliz',
        beforePhotoUrl: story.beforePhotoUrl || '/images/hades_rescue_1788225379594.jpg',
        currentPhotoUrl: story.currentPhotoUrl || '/images/hades_rescue_1788225379594.jpg',
        rescuerName: story.rescuerName || 'Equipo Voluntario Pata Amiga',
        likes: story.likes || 12
      };
      stories.unshift(savedStory);
      setItem(STORIES_KEY, stories);
    }

    return savedStory;
  },

  deleteSuccessStory(storyId: string): boolean {
    const stories = this.getSuccessStories();
    const filtered = stories.filter(s => s.id !== storyId);
    setItem(STORIES_KEY, filtered);
    return true;
  },

  likeSuccessStory(storyId: string): SuccessStory[] {
    const stories = this.getSuccessStories();
    const updated = stories.map(s => s.id === storyId ? { ...s, likes: s.likes + 1 } : s);
    setItem(STORIES_KEY, updated);
    return updated;
  },

  // --- ADOPTIONS ---
  getAdoptionPets(): AdoptionPet[] {
    const deletedIds = new Set(getItem<string[]>(DELETED_PETS_KEY, []));
    const cached = getItem<AdoptionPet[]>(PETS_KEY, INITIAL_ADOPTION_PETS);
    
    // Ensure all initial pets not deleted are incorporated
    let needsSave = false;
    const cachedIds = new Set(cached.map(p => p.id));
    for (const initPet of INITIAL_ADOPTION_PETS) {
      if (!cachedIds.has(initPet.id) && !deletedIds.has(initPet.id)) {
        cached.push(initPet);
        needsSave = true;
      }
    }
    
    // Filter out deleted pets
    const finalPets = cached.filter(p => !deletedIds.has(p.id) && p.id !== 'pet-luna' && p.id !== 'pet-luna' && p.name !== 'Luna' && p.name !== 'Nala');

    // Ensure Thor has real dog photo
    for (const p of finalPets) {
      if (p.id === 'pet-thor') {
        if (!p.photos || p.photos.length === 0 || p.photos[0].includes('1568640347023')) {
          p.photos = ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80'];
          needsSave = true;
        }
      }
    }

    if (needsSave || finalPets.length !== cached.length) {
      setItem(PETS_KEY, finalPets);
    }
    return finalPets;
  },

  getPetById(id: string): AdoptionPet | undefined {
    return this.getAdoptionPets().find(p => p.id === id);
  },

  saveAdoptionPet(pet: Partial<AdoptionPet> & { name: string; species: 'Perro' | 'Gato' | 'Otro'; breed: string; story: string }): AdoptionPet {
    const pets = this.getAdoptionPets();
    const isEdit = !!pet.id && pets.some(p => p.id === pet.id);

    let savedPet: AdoptionPet;
    if (isEdit) {
      savedPet = {
        ...pets.find(p => p.id === pet.id)!,
        ...pet
      } as AdoptionPet;
      const updated = pets.map(p => p.id === pet.id ? savedPet : p);
      setItem(PETS_KEY, updated);
    } else {
      savedPet = {
        id: `pet-${Date.now()}`,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender || 'Macho',
        age: pet.age || '1 año',
        size: pet.size || 'Mediano',
        story: pet.story,
        rescueHistory: pet.rescueHistory || 'Rescatado en Purificación, Tolima.',
        healthStatus: pet.healthStatus || {
          vaccinated: true,
          sterilized: true,
          dewormed: true,
          specialCareNotes: 'Desparasitado y con vacunas al día.'
        },
        personality: pet.personality || ['Cariñoso', 'Juguetón'],
        photos: pet.photos && pet.photos.length > 0 ? pet.photos : ['/images/mateo_rescue_story_1788226480262.jpg'],
        status: pet.status || 'disponible',
        rescuerName: pet.rescuerName || 'Colectivo Pata Amiga Purificación',
        rescuerContact: pet.rescuerContact || '+57 312 890 4521',
        rescuerLocation: pet.rescuerLocation || 'Purificación, Tolima',
        featured: pet.featured ?? true
      };
      pets.unshift(savedPet);
      setItem(PETS_KEY, pets);
    }

    return savedPet;
  },

  deleteAdoptionPet(petId: string): boolean {
    const deleted = getItem<string[]>(DELETED_PETS_KEY, []);
    if (!deleted.includes(petId)) {
      deleted.push(petId);
      setItem(DELETED_PETS_KEY, deleted);
    }
    const pets = getItem<AdoptionPet[]>(PETS_KEY, INITIAL_ADOPTION_PETS);
    const filtered = pets.filter(p => p.id !== petId);
    setItem(PETS_KEY, filtered);
    return true;
  },

  updatePetStatus(petId: string, status: 'disponible' | 'en_proceso' | 'adoptado'): AdoptionPet[] {
    const pets = this.getAdoptionPets();
    const updated = pets.map(p => p.id === petId ? { ...p, status } : p);
    setItem(PETS_KEY, updated);
    return updated;
  },

  searchPets(query: string, species?: string, size?: string): AdoptionPet[] {
    const pets = this.getAdoptionPets();
    return pets.filter(p => {
      const matchesQuery = !query || 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.breed.toLowerCase().includes(query.toLowerCase()) ||
        p.story.toLowerCase().includes(query.toLowerCase()) ||
        p.personality.some(trait => trait.toLowerCase().includes(query.toLowerCase()));
      
      const matchesSpecies = !species || species === 'Todos' || p.species.toLowerCase() === species.toLowerCase();
      const matchesSize = !size || size === 'Todos' || p.size.toLowerCase() === size.toLowerCase();

      return matchesQuery && matchesSpecies && matchesSize;
    });
  },

  getAdoptionApplications(): AdoptionApplication[] {
    return getItem<AdoptionApplication[]>(ADOPTION_APPS_KEY, []);
  },

  submitAdoptionApplication(appData: Omit<AdoptionApplication, 'id' | 'status' | 'submittedAt'>): AdoptionApplication {
    const apps = getItem<AdoptionApplication[]>(ADOPTION_APPS_KEY, []);
    const newApp: AdoptionApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pendiente',
      submittedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    apps.unshift(newApp);
    setItem(ADOPTION_APPS_KEY, apps);

    // Save applicant contact in browser storage so notification badges trigger smoothly
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pata_last_applicant_email', appData.applicantEmail.trim().toLowerCase());
        localStorage.setItem('pata_last_applicant_name', appData.applicantName.trim());
      }
    } catch {
      // fallback
    }

    // AUTOMATIC STATUS UPDATE: The selected pet immediately changes to 'en_proceso'
    this.updatePetStatus(appData.petId, 'en_proceso');

    // Notify rescuers
    this.sendSystemChatMessage(
      'channel-rescatistas',
      `🐾 ¡Nueva solicitud de adopción! ${appData.applicantName} ha postulado para adoptar a ${appData.petName}. Ciudad: ${appData.applicantCity}, Teléfono: ${appData.applicantPhone}. Estado actualizado a 'En proceso de adopción'.`
    );

    // In-app notification exclusively for administrators in Admin Panel
    this.addAdminNotification({
      title: `🐾 Nueva Postulación de Adopción: ${appData.petName}`,
      message: `${appData.applicantName} (${appData.applicantPhone}) se ha postulado para adoptar a ${appData.petName}. Ubicación: ${appData.applicantCity}.`,
      type: 'adopcion',
      linkTab: 'admin',
      metadata: {
        petName: appData.petName,
        applicantName: appData.applicantName,
        applicantPhone: appData.applicantPhone,
        applicationId: newApp.id
      }
    });

    return newApp;
  },

  updateApplicationStatus(appId: string, status: 'pendiente' | 'aprobada' | 'rechazada', adminNote?: string): boolean {
    const apps = this.getAdoptionApplications();
    const idx = apps.findIndex(a => a.id === appId);
    if (idx === -1) return false;

    const targetApp = { ...apps[idx] };
    targetApp.status = status;
    targetApp.statusNote = adminNote || (status === 'aprobada'
      ? '¡Felicitaciones! Tu postulación ha sido aprobada por la administración de Pata Amiga Purificación.'
      : status === 'rechazada'
        ? 'Tu postulación no ha podido ser aprobada en esta oportunidad. Te invitamos a conocer otros peluditos en adopción.'
        : 'Tu solicitud está en revisión.');
    targetApp.reviewedAt = new Date().toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    apps[idx] = targetApp;
    setItem(ADOPTION_APPS_KEY, apps);

    const targetPetId = targetApp.petId;
    if (status === 'aprobada') {
      this.updatePetStatus(targetPetId, 'adoptado');

      // 1. Send direct in-app notification exclusively to the user (applicant)
      this.addUserNotification({
        userId: targetApp.userId,
        userEmail: targetApp.applicantEmail.trim().toLowerCase(),
        statusType: 'aprobada',
        title: `🎉 ¡Postulación Aprobada para ${targetApp.petName}!`,
        message: adminNote
          ? `¡Felicidades, ${targetApp.applicantName}! Tu solicitud para adoptar a ${targetApp.petName} ha sido APROBADA. Mensaje de la administración: "${adminNote}". Nos comunicaremos contigo al ${targetApp.applicantPhone} para coordinar la entrega y firma del acta.`
          : `¡Felicidades, ${targetApp.applicantName}! Tu solicitud para adoptar a ${targetApp.petName} ha sido APROBADA con éxito por la administración de Pata Amiga Purificación. Nos comunicaremos contigo al ${targetApp.applicantPhone} para coordinar la entrega y firma del acta de adopción responsable.`,
        type: 'adopcion',
        linkTab: 'adopciones',
        metadata: {
          petName: targetApp.petName,
          applicantName: targetApp.applicantName,
          applicantPhone: targetApp.applicantPhone,
          statusNote: targetApp.statusNote
        }
      });

      // 2. Official chat announcement to Community and Rescuers
      this.sendSystemChatMessage(
        'channel-general',
        `🐾🎉 ¡FINAL FELIZ EN PURIFICACIÓN! La postulación de ${targetApp.applicantName} para adoptar a ${targetApp.petName} ha sido APROBADA por la administración de Pata Amiga. ¡Bienvenido a tu nuevo hogar, ${targetApp.petName}!`
      );
      this.sendSystemChatMessage(
        'channel-rescatistas',
        `✅ Adopción APROBADA: ${targetApp.petName} adoptado(a) por ${targetApp.applicantName} (Tel: ${targetApp.applicantPhone}, Ciudad: ${targetApp.applicantCity}). Notificación enviada al usuario. Mascota pasa a estado 'Adoptado'.`
      );

    } else if (status === 'rechazada') {
      const otherPending = apps.some(a => a.petId === targetPetId && a.id !== appId && a.status === 'pendiente');
      if (!otherPending) {
        this.updatePetStatus(targetPetId, 'disponible');
      }

      // 1. Send direct in-app notification exclusively to the user (applicant)
      this.addUserNotification({
        userId: targetApp.userId,
        userEmail: targetApp.applicantEmail.trim().toLowerCase(),
        statusType: 'rechazada',
        title: `Aviso sobre tu postulación de adopción (${targetApp.petName})`,
        message: adminNote
          ? `Hola ${targetApp.applicantName}, tu solicitud para adoptar a ${targetApp.petName} no ha podido ser aprobada. Observación de la administración: "${adminNote}". Te invitamos a conocer otros peluditos en adopción.`
          : `Hola ${targetApp.applicantName}, tu postulación para adoptar a ${targetApp.petName} fue evaluada y no ha podido ser aprobada en esta ocasión. Te invitamos a consultar nuestro catálogo para conocer más peluditos que esperan un hogar amoroso en Purificación.`,
        type: 'adopcion',
        linkTab: 'adopciones',
        metadata: {
          petName: targetApp.petName,
          applicantName: targetApp.applicantName,
          applicantPhone: targetApp.applicantPhone,
          statusNote: targetApp.statusNote
        }
      });

      // 2. Rescuer chat update
      this.sendSystemChatMessage(
        'channel-rescatistas',
        `ℹ️ Solicitud de adopción rechazada para ${targetApp.petName} (Postulante: ${targetApp.applicantName}). Notificación enviada al usuario. Mascota liberada a estado 'Disponible'.`
      );
    }

    return true;
  },

  getUserAdoptionApplications(user?: { id?: string; email?: string } | null): AdoptionApplication[] {
    const apps = this.getAdoptionApplications();
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('pata_last_applicant_email')?.toLowerCase().trim() : null;
    if (!user && !savedEmail) return [];
    const cleanEmail = user?.email?.toLowerCase().trim() || savedEmail;
    return apps.filter(a =>
      (user?.id && a.userId === user.id) ||
      (cleanEmail && a.applicantEmail.toLowerCase().trim() === cleanEmail)
    );
  },

  deleteAdoptionApplication(appId: string): boolean {
    const apps = this.getAdoptionApplications();
    const appToDelete = apps.find(a => a.id === appId);
    const filtered = apps.filter(a => a.id !== appId);
    setItem(ADOPTION_APPS_KEY, filtered);

    // If the pet was 'en_proceso' and has no other pending applications, revert to 'disponible'
    if (appToDelete) {
      const remainingForPet = filtered.some(a => a.petId === appToDelete.petId && a.status === 'pendiente');
      if (!remainingForPet) {
        const pet = this.getPetById(appToDelete.petId);
        if (pet && pet.status === 'en_proceso') {
          this.updatePetStatus(appToDelete.petId, 'disponible');
        }
      }
    }

    return true;
  },

  // --- RESCUE REPORTS (Reach Administrators & Rescuers) ---
  getReports(): AnimalReport[] {
    return getItem<AnimalReport[]>(REPORTS_KEY, INITIAL_ANIMAL_REPORTS);
  },

  createReport(reportData: Omit<AnimalReport, 'id' | 'status' | 'reportedAt'>): AnimalReport {
    const reports = this.getReports();
    const mainPhoto = reportData.photos && reportData.photos.length > 0 ? reportData.photos[0] : (reportData.photoUrl || '/images/hades_rescue_1788225379594.jpg');
    
    const newReport: AnimalReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      photoUrl: mainPhoto,
      photos: reportData.photos && reportData.photos.length > 0 ? reportData.photos : [mainPhoto],
      status: 'recibido',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Hoy)',
      statusNote: 'Reporte ingresado al panel de administración de Pata Amiga. Notificando a rescatistas y autoridades en Purificación.',
      assignedRescuer: 'Equipo de Guardia Purificación'
    };
    reports.unshift(newReport);
    setItem(REPORTS_KEY, reports);

    // Broadcast in rescue chat
    this.sendSystemChatMessage(
      'channel-rescatistas',
      `🚨 ALERTA DE RESCATE: ${newReport.animalType} en estado ${newReport.urgency.toUpperCase()} en ${newReport.neighborhood} (${newReport.addressDetails}). ${newReport.photos?.length || 1} fotos de evidencia adjuntadas. Reportado por: ${newReport.reporterName} (${newReport.reporterPhone}).`
    );

    // Send admin notification exclusively to Admin Panel
    this.addAdminNotification({
      title: `🚨 Nuevo Reporte Animal: ${newReport.animalType} (${newReport.urgency.toUpperCase()})`,
      message: `Ubicación: ${newReport.neighborhood} - ${newReport.addressDetails}. Reportado por ${newReport.reporterName} (Tel: ${newReport.reporterPhone}).`,
      type: 'reporte',
      linkTab: 'admin',
      metadata: {
        reportId: newReport.id,
        animalType: newReport.animalType,
        neighborhood: newReport.neighborhood
      }
    });

    return newReport;
  },

  submitReport(reportData: Omit<AnimalReport, 'id' | 'status' | 'reportedAt'>): AnimalReport {
    return this.createReport(reportData);
  },

  updateReportStatus(reportId: string, status: AnimalReport['status'], statusNote?: string, assignedRescuer?: string): AnimalReport[] {
    const reports = this.getReports();
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          statusNote: statusNote !== undefined ? statusNote : r.statusNote,
          assignedRescuer: assignedRescuer !== undefined ? assignedRescuer : r.assignedRescuer
        };
      }
      return r;
    });
    setItem(REPORTS_KEY, updated);
    return updated;
  },

  deleteReport(reportId: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== reportId);
    setItem(REPORTS_KEY, filtered);
    return true;
  },

  // --- HEALTH EVENTS / BRIGADAS (Limit 25 persons) ---
  getEvents(): HealthEvent[] {
    const deletedIds = new Set(getItem<string[]>(DELETED_EVENTS_KEY, []));
    const cached = getItem<HealthEvent[]>(EVENTS_KEY, INITIAL_HEALTH_EVENTS);
    let needsUpdate = false;

    // Ensure all initial events that haven't been deleted are included
    const existingIds = new Set(cached.map(e => e.id));
    for (const initEvent of INITIAL_HEALTH_EVENTS) {
      if (!existingIds.has(initEvent.id) && !deletedIds.has(initEvent.id)) {
        cached.push(initEvent);
        needsUpdate = true;
      }
    }

    // Filter out deleted events
    const finalEvents = cached.filter(e => !deletedIds.has(e.id));
    if (finalEvents.length !== cached.length) {
      needsUpdate = true;
    }

    // Ensure strictly 1 event has exhausted spots (event-1 with 25/25) if present and not deleted
    const soldOutCount = finalEvents.filter(e => (e.registeredCount || 0) >= MAX_EVENT_CAPACITY).length;
    const isEvent1SoldOut = finalEvents.some(e => e.id === 'event-1' && (e.registeredCount || 0) >= MAX_EVENT_CAPACITY);

    if (finalEvents.some(e => e.id === 'event-1') && (soldOutCount !== 1 || !isEvent1SoldOut)) {
      for (const ev of finalEvents) {
        if (ev.id === 'event-1') {
          ev.registeredCount = MAX_EVENT_CAPACITY;
        } else if ((ev.registeredCount || 0) >= MAX_EVENT_CAPACITY) {
          const fallbackCount = INITIAL_HEALTH_EVENTS.find(i => i.id === ev.id)?.registeredCount ?? 14;
          ev.registeredCount = Math.min(fallbackCount, MAX_EVENT_CAPACITY - 3);
        }
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      setItem(EVENTS_KEY, finalEvents);
    }

    // Ensure all events enforce 25 capacity
    return finalEvents.map(e => ({
      ...e,
      totalSpots: MAX_EVENT_CAPACITY,
      registeredCount: Math.min(e.registeredCount || 0, MAX_EVENT_CAPACITY)
    }));
  },

  saveHealthEvent(eventData: Partial<HealthEvent> & { title: string; date: string; time: string; locationName: string; address: string }): HealthEvent {
    const events = this.getEvents();
    const isEdit = !!eventData.id && events.some(e => e.id === eventData.id);

    let savedEvent: HealthEvent;
    if (isEdit) {
      savedEvent = {
        ...events.find(e => e.id === eventData.id)!,
        ...eventData,
        totalSpots: MAX_EVENT_CAPACITY
      } as HealthEvent;
      const updated = events.map(e => e.id === eventData.id ? savedEvent : e);
      setItem(EVENTS_KEY, updated);
    } else {
      savedEvent = {
        id: `event-${Date.now()}`,
        title: eventData.title,
        type: eventData.type || 'esterilizacion',
        date: eventData.date,
        time: eventData.time,
        locationName: eventData.locationName,
        address: eventData.address,
        municipality: eventData.municipality || 'Purificación, Tolima',
        description: eventData.description || 'Jornada veterinaria integral comunitaria en Purificación.',
        isFree: eventData.isFree ?? true,
        feeDetails: eventData.feeDetails || 'Atención 100% gratuita para la comunidad tolimense.',
        requirements: eventData.requirements && eventData.requirements.length > 0 ? eventData.requirements : [
          'Mascota en ayuno de 8 horas.',
          'Llevar carné de vacunación.',
          'Tutor mayor de edad con documento de identidad.'
        ],
        totalSpots: MAX_EVENT_CAPACITY,
        registeredCount: 0,
        contactPhone: eventData.contactPhone || '+57 312 890 4521',
        contactOrganizer: eventData.contactOrganizer || 'Pata Amiga Purificación & Alcaldía',
        status: eventData.status || 'proximo'
      };
      events.unshift(savedEvent);
      setItem(EVENTS_KEY, events);

      // Notify community users about the new health brigade
      this.addUserNotification({
        title: `📢 ¡Nueva Brigada Programada en Purificación!`,
        message: `Se ha abierto la inscripción para: "${savedEvent.title}" el ${savedEvent.date} a las ${savedEvent.time} en ${savedEvent.locationName}. ¡Separa tu cupo con anticipación (máximo 25 mascotas)!`,
        type: 'evento',
        isNewBrigade: true,
        eventId: savedEvent.id,
        linkTab: 'eventos'
      });
    }

    return savedEvent;
  },

  deleteHealthEvent(eventId: string): boolean {
    const deleted = getItem<string[]>(DELETED_EVENTS_KEY, []);
    if (!deleted.includes(eventId)) {
      deleted.push(eventId);
      setItem(DELETED_EVENTS_KEY, deleted);
    }
    const events = getItem<HealthEvent[]>(EVENTS_KEY, INITIAL_HEALTH_EVENTS);
    const filtered = events.filter(e => e.id !== eventId);
    setItem(EVENTS_KEY, filtered);
    return true;
  },

  getEventRegistrations(eventId?: string): EventRegistration[] {
    const all = getItem<EventRegistration[]>(REGISTRATIONS_KEY, []);
    if (eventId) {
      return all.filter(r => r.eventId === eventId);
    }
    return all;
  },

  registerForEvent(regData: Omit<EventRegistration, 'id' | 'registeredAt' | 'confirmationCode'>): { registration: EventRegistration; event: HealthEvent } {
    const events = this.getEvents();
    const eventIndex = events.findIndex(e => e.id === regData.eventId);
    if (eventIndex === -1) {
      throw new Error('Evento no encontrado');
    }

    const event = events[eventIndex];
    if (event.registeredCount >= MAX_EVENT_CAPACITY) {
      throw new Error(`Lo sentimos, los cupos para esta jornada se han agotado (límite máximo de ${MAX_EVENT_CAPACITY} personas alcanzado).`);
    }

    event.registeredCount += 1;
    events[eventIndex] = event;
    setItem(EVENTS_KEY, events);

    const confirmationCode = `PA-TOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const registrations = getItem<EventRegistration[]>(REGISTRATIONS_KEY, []);
    const newReg: EventRegistration = {
      ...regData,
      id: `reg-${Date.now()}`,
      registeredAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      confirmationCode
    };
    registrations.unshift(newReg);
    setItem(REGISTRATIONS_KEY, registrations);

    // In-app notification strictly for the registered user: recordatorio de brigada
    this.addUserNotification({
      userId: regData.userId,
      userEmail: regData.ownerEmail.trim().toLowerCase(),
      title: `🗓️ Recordatorio de Cita para Brigada: ${event.title}`,
      message: `¡Hola ${regData.ownerName}! Recuerda tu cita para ${regData.petName} en la jornada del ${event.date} a las ${event.time} en ${event.locationName} (${event.address}). Código de reserva: ${confirmationCode}. Recuerda llevar carné de vacunación y cumplir con ayuno si aplica procedimiento quirúrgico.`,
      type: 'evento',
      isReminder: true,
      eventId: event.id,
      linkTab: 'eventos'
    });

    return { registration: newReg, event };
  },

  deleteEventRegistration(regId: string): boolean {
    const registrations = getItem<EventRegistration[]>(REGISTRATIONS_KEY, []);
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return false;

    const filtered = registrations.filter(r => r.id !== regId);
    setItem(REGISTRATIONS_KEY, filtered);

    // Decrement event registered count
    const events = this.getEvents();
    const eventIndex = events.findIndex(e => e.id === reg.eventId);
    if (eventIndex !== -1 && events[eventIndex].registeredCount > 0) {
      events[eventIndex].registeredCount -= 1;
      setItem(EVENTS_KEY, events);
    }

    return true;
  },

  // --- NOTIFICATIONS SYSTEM ---
  // --- ADMIN NOTIFICATIONS (Exclusivas para el Panel de Control: Postulaciones de adopción y Reportes) ---
  getAdminNotifications(): AppNotification[] {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    // Filtrar estrictamente solo postulaciones y reportes para administradores
    return list.filter(n => n.type === 'reporte' || n.type === 'adopcion');
  },

  addAdminNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'targetRole'>): AppNotification {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...notif,
      id: `admin-notif-${Date.now()}`,
      timestamp: 'Hace un momento',
      read: false,
      targetRole: 'admin'
    };
    list.unshift(newNotif);
    setItem(ADMIN_NOTIFICATIONS_KEY, list);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return newNotif;
  },

  markAdminNotificationRead(notifId: string): AppNotification[] {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    const updated = list.map(n => n.id === notifId ? { ...n, read: true } : n);
    setItem(ADMIN_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return updated;
  },

  markAdminNotificationUnread(notifId: string): AppNotification[] {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    const updated = list.map(n => n.id === notifId ? { ...n, read: false } : n);
    setItem(ADMIN_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return updated;
  },

  markAllAdminNotificationsRead(): AppNotification[] {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    const updated = list.map(n => ({ ...n, read: true }));
    setItem(ADMIN_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return updated;
  },

  deleteAdminNotification(notifId: string): boolean {
    const list = getItem<AppNotification[]>(ADMIN_NOTIFICATIONS_KEY, INITIAL_ADMIN_NOTIFICATIONS);
    const updated = list.filter(n => n.id !== notifId);
    setItem(ADMIN_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return true;
  },

  getAdminUnreadCount(): number {
    return this.getAdminNotifications().filter(n => !n.read).length;
  },

  // --- USER NOTIFICATIONS (Exclusivas para usuarios: Recordatorios de brigadas inscritas, nueva brigada y estado de adopción) ---
  getUserNotifications(user?: { id?: string; email?: string; role?: string } | null): AppNotification[] {
    const list = getItem<AppNotification[]>(USER_NOTIFICATIONS_KEY, INITIAL_USER_NOTIFICATIONS);
    const cleanEmail = user?.email?.toLowerCase().trim() || 
      (typeof window !== 'undefined' ? localStorage.getItem('pata_last_applicant_email')?.toLowerCase().trim() : null);
    const userId = user?.id;

    return list.filter(n => {
      // 1. Notificaciones de nueva brigada (para todos los usuarios)
      if (n.type === 'evento' && n.isNewBrigade === true) {
        return true;
      }

      // 2. Recordatorios de brigadas a las que están inscritos
      if (n.type === 'evento' && (n.isReminder === true || n.title.toLowerCase().includes('recordatorio'))) {
        if (n.userId || n.userEmail) {
          if (userId && n.userId === userId) return true;
          if (cleanEmail && n.userEmail?.toLowerCase().trim() === cleanEmail) return true;
          return false;
        }
        return true;
      }

      // 3. Notificación de postulación aceptada o rechazada
      if (n.type === 'adopcion' && (n.statusType === 'aprobada' || n.statusType === 'rechazada')) {
        if (n.userId || n.userEmail) {
          if (userId && n.userId === userId) return true;
          if (cleanEmail && n.userEmail?.toLowerCase().trim() === cleanEmail) return true;
          return false;
        }
        return true;
      }

      // Descartar cualquier reporte u otra notificación en el canal de usuario
      return false;
    });
  },

  addUserNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'targetRole'>): AppNotification {
    const list = getItem<AppNotification[]>(USER_NOTIFICATIONS_KEY, INITIAL_USER_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...notif,
      id: `user-notif-${Date.now()}`,
      timestamp: 'Hace un momento',
      read: false,
      targetRole: 'user'
    };
    list.unshift(newNotif);
    setItem(USER_NOTIFICATIONS_KEY, list);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return newNotif;
  },

  markUserNotificationRead(notifId: string): AppNotification[] {
    const list = getItem<AppNotification[]>(USER_NOTIFICATIONS_KEY, INITIAL_USER_NOTIFICATIONS);
    const updated = list.map(n => n.id === notifId ? { ...n, read: true } : n);
    setItem(USER_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return updated;
  },

  markAllUserNotificationsRead(user?: { id?: string; email?: string } | null): AppNotification[] {
    const list = getItem<AppNotification[]>(USER_NOTIFICATIONS_KEY, INITIAL_USER_NOTIFICATIONS);
    const updated = list.map(n => ({ ...n, read: true }));
    setItem(USER_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return updated;
  },

  deleteUserNotification(notifId: string): boolean {
    const list = getItem<AppNotification[]>(USER_NOTIFICATIONS_KEY, INITIAL_USER_NOTIFICATIONS);
    const updated = list.filter(n => n.id !== notifId);
    setItem(USER_NOTIFICATIONS_KEY, updated);
    window.dispatchEvent(new Event('pata-data-change'));
    window.dispatchEvent(new Event('pata-notifications-change'));
    return true;
  },

  getUserUnreadCount(user?: { id?: string; email?: string; role?: string } | null): number {
    return this.getUserNotifications(user).filter(n => !n.read).length;
  },

  // Alias y métodos de compatibilidad:
  getNotifications(): AppNotification[] {
    return this.getAdminNotifications();
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    if (notif.targetRole === 'admin' || notif.type === 'reporte' || (notif.type === 'adopcion' && !notif.statusType)) {
      return this.addAdminNotification(notif);
    }
    return this.addUserNotification(notif);
  },

  markNotificationRead(notifId: string): AppNotification[] {
    this.markAdminNotificationRead(notifId);
    return this.markUserNotificationRead(notifId);
  },

  markNotificationUnread(notifId: string): AppNotification[] {
    return this.markAdminNotificationUnread(notifId);
  },

  markAllNotificationsRead(): AppNotification[] {
    this.markAllAdminNotificationsRead();
    return this.markAllUserNotificationsRead();
  },

  deleteNotification(notifId: string): boolean {
    this.deleteAdminNotification(notifId);
    return this.deleteUserNotification(notifId);
  },

  getUnreadCount(user?: { id?: string; email?: string; role?: string } | null): number {
    return this.getUserUnreadCount(user);
  },

  // --- CHAT SYSTEM ---
  getChatChannels(): ChatChannel[] {
    return getItem<ChatChannel[]>(CHAT_CHANNELS_KEY, INITIAL_CHAT_CHANNELS);
  },

  getMessages(channelId: string): ChatMessage[] {
    const allMessages = getItem<Record<string, ChatMessage[]>>(CHAT_MESSAGES_KEY, INITIAL_CHAT_MESSAGES);
    return allMessages[channelId] || [];
  },

  sendMessage(channelId: string, messageData: { senderId: string; senderName: string; senderRole: any; text: string; imageUrl?: string; avatar?: string }): ChatMessage {
    const allMessages = getItem<Record<string, ChatMessage[]>>(CHAT_MESSAGES_KEY, INITIAL_CHAT_MESSAGES);
    const channelMsgs = allMessages[channelId] || [];

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      channelId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole,
      avatar: messageData.avatar,
      text: messageData.text,
      imageUrl: messageData.imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    channelMsgs.push(newMsg);
    allMessages[channelId] = channelMsgs;
    setItem(CHAT_MESSAGES_KEY, allMessages);

    // Update last message in channels list
    const channels = this.getChatChannels();
    const chanIndex = channels.findIndex(c => c.id === channelId);
    if (chanIndex !== -1) {
      channels[chanIndex].lastMessage = messageData.text;
      channels[chanIndex].lastMessageTime = newMsg.timestamp;
      setItem(CHAT_CHANNELS_KEY, channels);
    }

    // Trigger realistic community responder if sent by citizen
    if (messageData.senderRole === 'ciudadano' || messageData.senderRole === 'user') {
      setTimeout(() => {
        this.simulateChannelReply(channelId, messageData.text);
      }, 1400);
    }

    return newMsg;
  },

  sendSystemChatMessage(channelId: string, text: string): void {
    const allMessages = getItem<Record<string, ChatMessage[]>>(CHAT_MESSAGES_KEY, INITIAL_CHAT_MESSAGES);
    const channelMsgs = allMessages[channelId] || [];

    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      channelId,
      senderId: 'sistema-pata-amiga',
      senderName: 'Notificación Pata Amiga',
      senderRole: 'sistema',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    channelMsgs.push(sysMsg);
    allMessages[channelId] = channelMsgs;
    setItem(CHAT_MESSAGES_KEY, allMessages);
  },

  simulateChannelReply(channelId: string, userText: string): void {
    let replyName = 'Dra. Sofía - Rescatista Tolima';
    let replyRole: any = 'rescatista';
    let replyAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
    let replyText = '¡Recibido! Gracias por escribirnos. Nuestro equipo de voluntarios en Purificación ya está revisando tu mensaje.';

    const lower = userText.toLowerCase();

    if (channelId === 'channel-veterinaria') {
      replyName = 'Dra. Sofía Ruiz (Médico Veterinario)';
      replyRole = 'veterinario';
      replyAvatar = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80';
      if (lower.includes('herid') || lower.includes('sangre') || lower.includes('atropell')) {
        replyText = 'Por favor mantén al animal abrigado y en un lugar tranquilo. Si es un perro reactivo por dolor, cubre sus ojos con un pañuelo suave antes de movilizarlo. ¿En qué barrio de Purificación te encuentras?';
      } else if (lower.includes('vacuna') || lower.includes('esteril')) {
        replyText = 'Te invitamos a registrarte en nuestra próxima brigada de salud (máximo 25 cupos por jornada) o acudir a las veterinarias aliadas en Purificación.';
      } else {
        replyText = 'Hola, soy la Dra. Sofía. Si tienes una consulta veterinaria urgente sobre un animal en Purificación, detállame sus síntomas y edad aproximada.';
      }
    } else if (channelId === 'channel-voluntarios') {
      replyName = 'Carlos Méndez (Coordinador Tolima)';
      replyRole = 'voluntario';
      replyAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
      replyText = '¡Excelente iniciativa! En Purificación siempre necesitamos manos amigas para transporte de mascotas, hogar de paso o apoyo en las brigadas de fin de semana.';
    } else {
      if (lower.includes('adopta') || lower.includes('requisito')) {
        replyText = '¡Qué alegría! Para adoptar solicitamos copia de cédula, recibo público y el compromiso de brindarle amor y chequeos veterinarios.';
      } else if (lower.includes('donar') || lower.includes('ayuda')) {
        replyText = '¡Muchas gracias por tu solidaridad! Puedes donar concentrado en nuestros puntos aliados en el centro de Purificación o por Nequi/Daviplata.';
      }
    }

    const allMessages = getItem<Record<string, ChatMessage[]>>(CHAT_MESSAGES_KEY, INITIAL_CHAT_MESSAGES);
    const channelMsgs = allMessages[channelId] || [];

    const replyMsg: ChatMessage = {
      id: `rep-${Date.now()}`,
      channelId,
      senderId: `responder-${channelId}`,
      senderName: replyName,
      senderRole: replyRole,
      avatar: replyAvatar,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    channelMsgs.push(replyMsg);
    allMessages[channelId] = channelMsgs;
    setItem(CHAT_MESSAGES_KEY, allMessages);

    const channels = this.getChatChannels();
    const chanIndex = channels.findIndex(c => c.id === channelId);
    if (chanIndex !== -1) {
      channels[chanIndex].lastMessage = replyText;
      channels[chanIndex].lastMessageTime = replyMsg.timestamp;
      setItem(CHAT_CHANNELS_KEY, channels);
    }
  },

  // --- CONTACT MESSAGES ---
  getContactMessages(): ContactMessage[] {
    return getItem<ContactMessage[]>(CONTACTS_KEY, []);
  },

  submitContactMessage(data: Omit<ContactMessage, 'id' | 'submittedAt' | 'read'>): ContactMessage {
    const contacts = getItem<ContactMessage[]>(CONTACTS_KEY, []);
    const newContact: ContactMessage = {
      ...data,
      id: `contact-${Date.now()}`,
      read: false,
      submittedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    contacts.unshift(newContact);
    setItem(CONTACTS_KEY, contacts);

    // In-app notification strictly for administrators: "mensajes de los usuarios"
    this.addNotification({
      title: '📩 Nuevo Mensaje de Contacto',
      message: `${data.name} (${data.phone}) ha enviado un mensaje: "${data.subject}"`,
      type: 'sistema',
      targetRole: 'admin',
      linkTab: 'admin'
    });

    return newContact;
  },

  deleteContactMessage(id: string): boolean {
    const contacts = this.getContactMessages();
    const filtered = contacts.filter(c => c.id !== id);
    setItem(CONTACTS_KEY, filtered);
    return true;
  },

  markContactMessageRead(id: string): boolean {
    const contacts = this.getContactMessages();
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) return false;
    contacts[idx].read = true;
    setItem(CONTACTS_KEY, contacts);
    return true;
  }
};
