import fs from 'fs';
import path from 'path';
import { 
  AdoptionPet, 
  AnimalReport, 
  AdoptionApplication, 
  HealthEvent, 
  SuccessStory,
  AppNotification,
  User
} from '../src/types';
import { 
  INITIAL_ADOPTION_PETS, 
  INITIAL_ANIMAL_REPORTS, 
  INITIAL_ADOPTION_APPLICATIONS, 
  INITIAL_HEALTH_EVENTS, 
  INITIAL_SUCCESS_STORIES 
} from '../src/data/initialData';

export interface LiveDatabaseState {
  pets: AdoptionPet[];
  reports: AnimalReport[];
  adoptionApplications: AdoptionApplication[];
  healthEvents: HealthEvent[];
  eventRegistrations: any[];
  successStories: SuccessStory[];
  adminNotifications: AppNotification[];
  userNotifications: AppNotification[];
  registeredUsers: any[];
  lastUpdated: number;
}

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'pata_amiga_live_db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (e) {
    console.error('Error creating database directory:', e);
  }
}

/**
 * Ensures pet statuses are strictly aligned with adoption applications:
 * - Approved application -> 'adoptado'
 * - Pending application -> 'en_proceso' (unless already adoptado)
 */
function reconcilePetStatuses(pets: AdoptionPet[], apps: AdoptionApplication[]): AdoptionPet[] {
  const approvedPetIds = new Set(
    apps.filter(a => a.status === 'aprobada').map(a => a.petId)
  );
  const pendingPetIds = new Set(
    apps.filter(a => a.status === 'pendiente').map(a => a.petId)
  );

  return pets.map(pet => {
    if (approvedPetIds.has(pet.id)) {
      return { ...pet, status: 'adoptado' };
    }
    if (pendingPetIds.has(pet.id) && pet.status === 'disponible') {
      return { ...pet, status: 'en_proceso' };
    }
    return pet;
  });
}

function getInitialState(): LiveDatabaseState {
  const reconciledPets = reconcilePetStatuses(
    [...INITIAL_ADOPTION_PETS],
    [...INITIAL_ADOPTION_APPLICATIONS]
  );

  return {
    pets: reconciledPets,
    reports: [...INITIAL_ANIMAL_REPORTS],
    adoptionApplications: [...INITIAL_ADOPTION_APPLICATIONS],
    healthEvents: [...INITIAL_HEALTH_EVENTS],
    eventRegistrations: [],
    successStories: [...INITIAL_SUCCESS_STORIES],
    adminNotifications: [],
    userNotifications: [],
    registeredUsers: [],
    lastUpdated: Date.now()
  };
}

let memoryState: LiveDatabaseState | null = null;

export function getDatabase(): LiveDatabaseState {
  if (memoryState) {
    return memoryState;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<LiveDatabaseState>;
      
      const initial = getInitialState();
      const mergedPets = parsed.pets && parsed.pets.length > 0 ? parsed.pets : initial.pets;
      const mergedApps = parsed.adoptionApplications || initial.adoptionApplications;

      memoryState = {
        pets: reconcilePetStatuses(mergedPets, mergedApps),
        reports: parsed.reports && parsed.reports.length > 0 ? parsed.reports : initial.reports,
        adoptionApplications: mergedApps,
        healthEvents: parsed.healthEvents || initial.healthEvents,
        eventRegistrations: parsed.eventRegistrations || [],
        successStories: parsed.successStories || initial.successStories,
        adminNotifications: parsed.adminNotifications || [],
        userNotifications: parsed.userNotifications || [],
        registeredUsers: parsed.registeredUsers || [],
        lastUpdated: parsed.lastUpdated || Date.now()
      };

      return memoryState;
    }
  } catch (e) {
    console.error('Error reading database file, using initial fallback:', e);
  }

  memoryState = getInitialState();
  saveDatabase(memoryState);
  return memoryState;
}

export function saveDatabase(state: LiveDatabaseState): boolean {
  try {
    state.lastUpdated = Date.now();
    state.pets = reconcilePetStatuses(state.pets, state.adoptionApplications);
    memoryState = state;
    
    // Write atomically
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (e) {
    console.error('Error writing database file:', e);
    // Even if filesystem fails in read-only environment, memoryState is preserved in RAM
    return false;
  }
}

// Dedicated mutators

export function addReportToServer(report: AnimalReport): { report: AnimalReport; state: LiveDatabaseState } {
  const db = getDatabase();
  
  // Check if report already exists
  const existingIdx = db.reports.findIndex(r => r.id === report.id);
  if (existingIdx !== -1) {
    db.reports[existingIdx] = { ...db.reports[existingIdx], ...report };
  } else {
    db.reports.unshift(report);
  }

  // Also add an admin notification
  const adminNotif: AppNotification = {
    id: `notif-admin-${Date.now()}`,
    title: `🚨 Nuevo Reporte Animal: ${report.animalType} (${report.urgency.toUpperCase()})`,
    message: `Ubicación: ${report.neighborhood} - ${report.addressDetails}. Reportado por ${report.reporterName} (Tel: ${report.reporterPhone}).`,
    type: 'reporte',
    timestamp: 'Ahora mismo',
    read: false,
    linkTab: 'admin',
    targetRole: 'admin',
    metadata: {
      reportId: report.id,
      animalType: report.animalType,
      neighborhood: report.neighborhood
    }
  };
  db.adminNotifications.unshift(adminNotif);

  saveDatabase(db);
  return { report, state: db };
}

export function updateReportOnServer(reportId: string, updates: Partial<AnimalReport>): { report: AnimalReport | null; state: LiveDatabaseState } {
  const db = getDatabase();
  const idx = db.reports.findIndex(r => r.id === reportId);
  if (idx === -1) {
    return { report: null, state: db };
  }

  db.reports[idx] = { ...db.reports[idx], ...updates };
  saveDatabase(db);
  return { report: db.reports[idx], state: db };
}

export function addAdoptionApplicationToServer(app: AdoptionApplication): { application: AdoptionApplication; state: LiveDatabaseState } {
  const db = getDatabase();
  
  const normalizedApp: AdoptionApplication = {
    ...app,
    id: app.id || `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: app.status || 'pendiente',
    submittedAt: app.submittedAt || new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  const existingIdx = db.adoptionApplications.findIndex(a => a.id === normalizedApp.id);
  if (existingIdx !== -1) {
    db.adoptionApplications[existingIdx] = { ...db.adoptionApplications[existingIdx], ...normalizedApp };
  } else {
    db.adoptionApplications.unshift(normalizedApp);
  }

  // Update target pet status to 'en_proceso' unless already 'adoptado'
  const petIdx = db.pets.findIndex(p => p.id === normalizedApp.petId);
  if (petIdx !== -1 && db.pets[petIdx].status !== 'adoptado') {
    db.pets[petIdx].status = 'en_proceso';
  }

  // Add admin notification
  const adminNotif: AppNotification = {
    id: `notif-app-${Date.now()}`,
    title: `🐾 Nueva Postulación de Adopción: ${normalizedApp.petName}`,
    message: `${normalizedApp.applicantName} (${normalizedApp.applicantPhone}) se ha postulado para adoptar a ${normalizedApp.petName}. Ubicación: ${normalizedApp.applicantCity}.`,
    type: 'adopcion',
    timestamp: 'Ahora mismo',
    read: false,
    linkTab: 'admin',
    targetRole: 'admin',
    metadata: {
      petName: normalizedApp.petName,
      applicantName: normalizedApp.applicantName,
      applicantPhone: normalizedApp.applicantPhone,
      applicationId: normalizedApp.id
    }
  };
  db.adminNotifications.unshift(adminNotif);

  saveDatabase(db);
  return { application: normalizedApp, state: db };
}

export function updateAdoptionApplicationOnServer(
  appId: string, 
  status: 'pendiente' | 'aprobada' | 'rechazada', 
  adminNote?: string
): { application: AdoptionApplication | null; state: LiveDatabaseState } {
  const db = getDatabase();
  const idx = db.adoptionApplications.findIndex(a => a.id === appId);
  if (idx === -1) {
    return { application: null, state: db };
  }

  const targetApp = { ...db.adoptionApplications[idx] };
  targetApp.status = status;
  if (adminNote) {
    targetApp.statusNote = adminNote;
  }
  targetApp.reviewedAt = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  db.adoptionApplications[idx] = targetApp;

  // Reconcile pet status
  const targetPetId = targetApp.petId;
  const petIdx = db.pets.findIndex(p => p.id === targetPetId);
  
  if (status === 'aprobada') {
    if (petIdx !== -1) {
      db.pets[petIdx].status = 'adoptado';
    }

    // Add user notification for applicant
    if (!db.userNotifications) db.userNotifications = [];
    db.userNotifications.unshift({
      id: `user-notif-${Date.now()}`,
      userId: targetApp.userId,
      userEmail: targetApp.applicantEmail?.trim().toLowerCase(),
      statusType: 'aprobada',
      title: `🎉 ¡Postulación Aprobada para ${targetApp.petName}!`,
      message: adminNote
        ? `¡Felicidades, ${targetApp.applicantName}! Tu solicitud para adoptar a ${targetApp.petName} ha sido APROBADA. Mensaje de la administración: "${adminNote}". Nos comunicaremos contigo al ${targetApp.applicantPhone}.`
        : `¡Felicidades, ${targetApp.applicantName}! Tu solicitud para adoptar a ${targetApp.petName} ha sido APROBADA con éxito por la administración de Pata Amiga Purificación. Nos comunicaremos contigo al ${targetApp.applicantPhone}.`,
      type: 'adopcion',
      linkTab: 'adopciones',
      timestamp: 'Ahora mismo',
      read: false,
      metadata: {
        petName: targetApp.petName,
        applicantName: targetApp.applicantName,
        applicantPhone: targetApp.applicantPhone,
        statusNote: targetApp.statusNote
      }
    });
  } else if (status === 'rechazada') {
    // If no other pending application for this pet, revert to disponible
    const hasOtherPending = db.adoptionApplications.some(
      a => a.petId === targetPetId && a.id !== appId && a.status === 'pendiente'
    );
    if (!hasOtherPending && petIdx !== -1 && db.pets[petIdx].status !== 'adoptado') {
      db.pets[petIdx].status = 'disponible';
    }

    // Add user notification for applicant
    if (!db.userNotifications) db.userNotifications = [];
    db.userNotifications.unshift({
      id: `user-notif-${Date.now()}`,
      userId: targetApp.userId,
      userEmail: targetApp.applicantEmail?.trim().toLowerCase(),
      statusType: 'rechazada',
      title: `Aviso sobre tu postulación de adopción (${targetApp.petName})`,
      message: adminNote
        ? `Hola ${targetApp.applicantName}, tu solicitud para adoptar a ${targetApp.petName} no ha podido ser aprobada. Observación: "${adminNote}". Te invitamos a conocer otros peluditos en adopción.`
        : `Hola ${targetApp.applicantName}, tu postulación para adoptar a ${targetApp.petName} fue evaluada y no ha podido ser aprobada en esta ocasión. Te invitamos a consultar nuestro catálogo.`,
      type: 'adopcion',
      linkTab: 'adopciones',
      timestamp: 'Ahora mismo',
      read: false,
      metadata: {
        petName: targetApp.petName,
        applicantName: targetApp.applicantName,
        applicantPhone: targetApp.applicantPhone,
        statusNote: targetApp.statusNote
      }
    });
  }

  saveDatabase(db);
  return { application: targetApp, state: db };
}

export function updatePetStatusOnServer(petId: string, status: 'disponible' | 'en_proceso' | 'adoptado'): { pet: AdoptionPet | null; state: LiveDatabaseState } {
  const db = getDatabase();
  const petIdx = db.pets.findIndex(p => p.id === petId);
  if (petIdx === -1) {
    return { pet: null, state: db };
  }

  db.pets[petIdx].status = status;
  saveDatabase(db);
  return { pet: db.pets[petIdx], state: db };
}

export function savePetOnServer(pet: AdoptionPet): { pet: AdoptionPet; state: LiveDatabaseState } {
  const db = getDatabase();
  const petIdx = db.pets.findIndex(p => p.id === pet.id);
  if (petIdx !== -1) {
    db.pets[petIdx] = { ...db.pets[petIdx], ...pet };
  } else {
    db.pets.unshift(pet);
  }
  saveDatabase(db);
  return { pet, state: db };
}

export function deletePetOnServer(petId: string): { success: boolean; state: LiveDatabaseState } {
  const db = getDatabase();
  db.pets = db.pets.filter(p => p.id !== petId);
  saveDatabase(db);
  return { success: true, state: db };
}

export function syncClientDataWithServer(clientData: Partial<LiveDatabaseState>): LiveDatabaseState {
  const db = getDatabase();

  // Merge reports: keep all reports from client that are not yet on server
  if (Array.isArray(clientData.reports)) {
    for (const rep of clientData.reports) {
      if (!db.reports.some(r => r.id === rep.id)) {
        db.reports.unshift(rep);
      }
    }
  }

  // Merge applications: keep all applications from client
  if (Array.isArray(clientData.adoptionApplications)) {
    for (const app of clientData.adoptionApplications) {
      const idx = db.adoptionApplications.findIndex(a => a.id === app.id);
      if (idx === -1) {
        db.adoptionApplications.unshift(app);
      } else {
        // If client or server has a reviewed status, prioritize approved/rejected over pending
        if (app.status === 'aprobada' || app.status === 'rechazada') {
          db.adoptionApplications[idx] = { ...db.adoptionApplications[idx], ...app };
        }
      }
    }
  }

  // Merge registered users
  if (Array.isArray(clientData.registeredUsers)) {
    for (const usr of clientData.registeredUsers) {
      const idx = db.registeredUsers.findIndex(u => u.email?.toLowerCase() === usr.email?.toLowerCase() || u.id === usr.id);
      if (idx === -1) {
        db.registeredUsers.push(usr);
      } else {
        db.registeredUsers[idx] = { ...db.registeredUsers[idx], ...usr };
      }
    }
  }

  saveDatabase(db);
  return db;
}
