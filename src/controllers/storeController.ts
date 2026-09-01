import { 
  SuccessStory, 
  AdoptionPet, 
  AdoptionApplication,
  HealthEvent, 
  EventRegistration,
  AnimalReport, 
  ChatChannel, 
  ChatMessage, 
  ContactMessage 
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
const CHAT_CHANNELS_KEY = 'pata_amiga_chat_channels';
const CHAT_MESSAGES_KEY = 'pata_amiga_chat_messages';
const CONTACTS_KEY = 'pata_amiga_contacts';

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
    // Ensure all initial stories exist and have updated photos
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

    // Also send an automated chat message notifying the rescuer channel
    this.sendSystemChatMessage(
      'channel-rescatistas',
      `🐾 ¡Nueva solicitud de adopción! ${appData.applicantName} ha postulado para adoptar a ${appData.petName}. Ciudad: ${appData.applicantCity}, Teléfono: ${appData.applicantPhone}.`
    );

    return newApp;
  },

  // --- RESCUE REPORTS ---
  getReports(): AnimalReport[] {
    return getItem<AnimalReport[]>(REPORTS_KEY, INITIAL_ANIMAL_REPORTS);
  },

  createReport(reportData: Omit<AnimalReport, 'id' | 'status' | 'reportedAt'>): AnimalReport {
    const reports = this.getReports();
    const newReport: AnimalReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'recibido',
      reportedAt: 'Hace un momento',
      statusNote: 'Reporte ingresado al sistema de Pata Amiga. Notificando a voluntarios en Purificación Tolima.',
      assignedRescuer: 'Equipo de Guardia Tolima'
    };
    reports.unshift(newReport);
    setItem(REPORTS_KEY, reports);

    // Broadcast in the rescue chat
    this.sendSystemChatMessage(
      'channel-rescatistas',
      `🚨 ALERTA DE RESCATE: ${newReport.animalType} en estado ${newReport.urgency.toUpperCase()} en ${newReport.neighborhood} (${newReport.addressDetails}). Reportado por: ${newReport.reporterName} (${newReport.reporterPhone}).`
    );

    return newReport;
  },

  submitReport(reportData: Omit<AnimalReport, 'id' | 'status' | 'reportedAt'>): AnimalReport {
    return this.createReport(reportData);
  },

  updateReportStatus(reportId: string, status: AnimalReport['status'], statusNote?: string): AnimalReport[] {
    const reports = this.getReports();
    const updated = reports.map(r => r.id === reportId ? { ...r, status, statusNote: statusNote || r.statusNote } : r);
    setItem(REPORTS_KEY, updated);
    return updated;
  },

  // --- HEALTH EVENTS ---
  getEvents(): HealthEvent[] {
    return getItem<HealthEvent[]>(EVENTS_KEY, INITIAL_HEALTH_EVENTS);
  },

  registerForEvent(regData: Omit<EventRegistration, 'id' | 'registeredAt' | 'confirmationCode'>): { registration: EventRegistration; event: HealthEvent } {
    const events = this.getEvents();
    const eventIndex = events.findIndex(e => e.id === regData.eventId);
    if (eventIndex === -1) {
      throw new Error('Evento no encontrado');
    }

    const event = events[eventIndex];
    if (event.registeredCount >= event.totalSpots) {
      throw new Error('Lo sentimos, los cupos para esta jornada se han agotado.');
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

    return { registration: newReg, event };
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

    // Trigger realistic community responder if sent by user
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
        replyText = 'Te invitamos a registrarte en nuestra próxima brigada de salud o acudir a las veterinarias aliadas en la Calle 7 de Purificación.';
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
