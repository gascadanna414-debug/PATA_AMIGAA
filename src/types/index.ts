export type UserRole = 'admin' | 'ciudadano' | 'voluntario' | 'rescatista' | 'veterinario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  avatar?: string;
  createdAt: string;
  registeredAt?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'evento' | 'reporte' | 'adopcion' | 'sistema';
  timestamp: string;
  read: boolean;
  eventId?: string;
  linkTab?: string;
}

export interface SuccessStory {
  id: string;
  petName: string;
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  estimatedAge: string;
  rescueLocation: string;
  rescueStory: string;
  adoptionStory: string;
  adoptedFamilyName: string;
  adoptedDate: string;
  healthBefore: string;
  healthAfter: string;
  beforePhotoUrl: string;
  currentPhotoUrl: string;
  rescuerName: string;
  likes: number;
}

export interface HealthStatus {
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  specialCareNotes: string;
}

export interface AdoptionPet {
  id: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  gender: 'Macho' | 'Hembra';
  age: string;
  size: 'Pequeño' | 'Mediano' | 'Grande';
  story: string;
  rescueHistory: string;
  healthStatus: HealthStatus;
  personality: string[];
  photos: string[];
  status: 'disponible' | 'en_proceso' | 'adoptado';
  rescuerName: string;
  rescuerContact: string;
  rescuerLocation: string;
  featured: boolean;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCity: string;
  housingType: 'Casa con patio' | 'Casa sin patio' | 'Apartamento' | 'Finca';
  hasOtherPets: boolean;
  otherPetsDetails: string;
  reasonForAdoption: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  submittedAt: string;
}

export interface AnimalReport {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  neighborhood: string;
  addressDetails: string;
  coordinates?: { lat: number; lng: number };
  animalType: 'Perro' | 'Gato' | 'Equino' | 'Fauna Silvestre' | 'Otro';
  urgency: 'urgente' | 'moderada' | 'leve';
  description: string;
  photoUrl: string;
  photos?: string[];
  status: 'recibido' | 'en_camino' | 'en_atencion' | 'rescatado';
  reportedAt: string;
  statusNote?: string;
  assignedRescuer?: string;
}

export interface HealthEvent {
  id: string;
  title: string;
  type: 'vacunacion' | 'esterilizacion' | 'brigada_salud' | 'donacion_alimento';
  date: string;
  time: string;
  locationName: string;
  address: string;
  municipality: string;
  description: string;
  isFree: boolean;
  feeDetails?: string;
  requirements: string[];
  totalSpots: number;
  registeredCount: number;
  contactPhone: string;
  contactOrganizer: string;
  status: 'proximo' | 'en_curso' | 'finalizado';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerNeighborhood: string;
  petName: string;
  petSpecies: string;
  petAge: string;
  registeredAt: string;
  confirmationCode: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'sistema';
  avatar?: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  roleDescription: string;
  avatar: string;
  type: 'red_rescatistas' | 'veterinaria' | 'voluntarios' | 'general';
  online: boolean;
  phone: string;
  badgeCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
  read?: boolean;
}
