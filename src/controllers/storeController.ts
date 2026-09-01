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

const STORIES_KEY = 'pata_amiga_stories';
const PETS_KEY = 'pata_amiga_pets';
const ADOPTION_APPS_KEY = 'pata_amiga_adoption_apps';
const EVENTS_KEY = 'pata_amiga_events';
const REGISTRATIONS_KEY = 'pata_amiga_event_registrations';
const REPORTS_KEY = 'pata_amiga_reports';
const NOTIFICATIONS_KEY = 'pata_amiga_notifications';
const CHAT_CHANNELS_KEY = 'pata_amiga_chat_channels';
const CHAT_MESSAGES_KEY = 'pata_amiga_chat_messages';
const CONTACTS_KEY = 'pata_amiga_contacts';

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
    const cached = getItem<AdoptionPet[]>(PETS_KEY, INITIAL_ADOPTION_PETS);
    const merged = [...INITIAL_ADOPTION_PETS];
    cached.forEach(c => {
      const idx = merged.findIndex(m => m.id === c.id);
      if (idx === -1 && c.id !== 'pet-luna' && c.id !== 'pet-nala' && c.name !== 'Luna' && c.name !== 'Nala') {
        merged.push(c);
      }
    });
    return merged.filter(p => p.id !== 'pet-luna' && p.id !== 'pet-nala' && p.name !== 'Luna' && p.name !== 'Nala');
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
    const pets = this.getAdoptionPets();
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

    // Notify rescuers
    this.sendSystemChatMessage(
      'channel-rescatistas',
      `🐾 ¡Nueva solicitud de adopción! ${appData.applicantName} ha postulado para adoptar a ${appData.petName}. Ciudad: ${appData.applicantCity}, Teléfono: ${appData.applicantPhone}.`
    );

    // Add in-app notification
    this.addNotification({
      title: 'Solicitud de Adopción Registrada',
      message: `Tu solicitud para adoptar a ${appData.petName} fue enviada con éxito. Nuestro equipo se comunicará contigo al ${appData.applicantPhone}.`,
      type: 'adopcion',
      linkTab: 'adopciones'
    });

    return newApp;
  },

  updateApplicationStatus(appId: string, status: 'pendiente' | 'aprobada' | 'rechazada'): boolean {
    const apps = this.getAdoptionApplications();
    const idx = apps.findIndex(a => a.id === appId);
    if (idx === -1) return false;
    apps[idx].status = status;
    setItem(ADOPTION_APPS_KEY, apps);
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

    // Send admin notification
    this.addNotification({
      title: `Nuevo Reporte Animal: ${newReport.animalType} (${newReport.urgency.toUpperCase()})`,
      message: `Ubicación: ${newReport.neighborhood} - ${newReport.addressDetails}. Reportado por ${newReport.reporterName}.`,
      type: 'reporte',
      linkTab: 'admin'
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
    const cached = getItem<HealthEvent[]>(EVENTS_KEY, INITIAL_HEALTH_EVENTS);
    // Ensure all events enforce 25 capacity
    return cached.map(e => ({
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
    }

    return savedEvent;
  },

  deleteHealthEvent(eventId: string): boolean {
    const events = this.getEvents();
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

    // Create automated event notification for user
    this.addNotification({
      title: `🔔 Inscripción Confirmada: ${event.title}`,
      message: `¡Hola ${regData.ownerName}! Tu mascota ${regData.petName} quedó inscrita con éxito para el ${event.date} (${event.time}) en ${event.locationName}. Código: ${confirmationCode}. Te enviaremos recordatorio cuando se acerque la fecha.`,
      type: 'evento',
      eventId: event.id,
      linkTab: 'eventos'
    });

    // Create upcoming event reminder alert in advance
    this.addNotification({
      title: `🗓️ Recordatorio Próximo Evento: ${event.title}`,
      message: `Recuerda que tienes cita programada con ${regData.petName} en ${event.locationName} (${event.address}). Por favor cumplir con los requisitos previos (ayuno, bozal/guacal). Cupo ${event.registeredCount}/${MAX_EVENT_CAPACITY}.`,
      type: 'evento',
      eventId: event.id,
      linkTab: 'eventos'
    });

    return { registration: newReg, event };
  },

  // --- NOTIFICATIONS SYSTEM ---
  getNotifications(): AppNotification[] {
    const initialNotifs: AppNotification[] = [
      {
        id: 'notif-1',
        title: '🗓️ Recordatorio de Brigada Próxima',
        message: 'La Gran Jornada de Esterilización en el Polideportivo Municipal se aproxima. Recuerda llevar a tu mascota en ayuno de 8 horas.',
        type: 'evento',
        timestamp: 'Hoy, 08:00 AM',
        read: false,
        linkTab: 'eventos'
      },
      {
        id: 'notif-2',
        title: '📢 Nuevo Reporte en Purificación',
        message: 'Se ha registrado un reporte de rescate en el Barrio Camilo Torres. El móvil de apoyo ya fue asignado.',
        type: 'reporte',
        timestamp: 'Ayer, 04:30 PM',
        read: true,
        linkTab: 'reportar'
      }
    ];
    return getItem<AppNotification[]>(NOTIFICATIONS_KEY, initialNotifs);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Hace un momento',
      read: false
    };
    list.unshift(newNotif);
    setItem(NOTIFICATIONS_KEY, list);
    return newNotif;
  },

  markNotificationRead(notifId: string): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === notifId ? { ...n, read: true } : n);
    setItem(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  markAllNotificationsRead(): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map(n => ({ ...n, read: true }));
    setItem(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
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
  submitContactMessage(data: Omit<ContactMessage, 'id' | 'submittedAt'>): ContactMessage {
    const contacts = getItem<ContactMessage[]>(CONTACTS_KEY, []);
    const newContact: ContactMessage = {
      ...data,
      id: `contact-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    contacts.unshift(newContact);
    setItem(CONTACTS_KEY, contacts);
    return newContact;
  }
};
