import { SuccessStory, AdoptionPet, HealthEvent, AnimalReport, ChatChannel, ChatMessage } from '../types';

export const INITIAL_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    petName: 'Canela',
    species: 'Perro',
    breed: 'Criollo Tolimense',
    estimatedAge: '2 años',
    rescueLocation: 'Barrio El Ospina Pérez, Purificación Tolima',
    rescueStory: 'Canela fue hallada en grave estado de desnutrición y con sarna avanzada cerca a la salida hacia Prado. Una vecina hizo el reporte a través de Pata Amiga y los rescatistas voluntarios acudieron en menos de una hora.',
    adoptionStory: 'Tras 3 meses de cuidados médicos, baños medicados y mucho amor, la familia Gómez de Purificación decidió adoptarla. Ahora disfruta de paseos en el Malecón del Río Magdalena y tiene una cama calientita.',
    adoptedFamilyName: 'Familia Gómez Ramírez',
    adoptedDate: '15 de Mayo, 2024',
    healthBefore: 'Desnutrición severa (8kg), sarna sarcóptica y parásitos.',
    healthAfter: 'Completamente sana (16kg), pelo brillante, esterilizada y con esquema de vacunas al día.',
    beforePhotoUrl: '/src/assets/images/canela_before_1787104655599.jpg',
    currentPhotoUrl: '/src/assets/images/canela_after_1787104667779.jpg',
    rescuerName: 'Dra. Sofía - Rescatista Voluntaria Tolima',
    likes: 42
  },
  {
    id: 'story-2',
    petName: 'Milo & Bigotes',
    species: 'Gato',
    breed: 'Mestizo Atigrado Naranja',
    estimatedAge: '1 año',
    rescueLocation: 'Sector de la Galería Municipal, Purificación',
    rescueStory: 'Era un gatito cachorro abandonado en una caja de cartón bajo la lluvia. Fue alimentado con biberón por el equipo voluntario durante sus primeras 4 semanas.',
    adoptionStory: 'Fue adoptado por Don Hernando y su hija Mariana. Ahora es el consentido del hogar, duerme cómodo en los sillones y es sumamente juguetón.',
    adoptedFamilyName: 'Hernando & Mariana Lozano',
    adoptedDate: '28 de Julio, 2024',
    healthBefore: 'Hipotermia, conjuntivitis neonatal y bajo peso.',
    healthAfter: '100% recuperado, castrado, desparasitado y con carné de vacunación felina al día.',
    beforePhotoUrl: '/src/assets/images/milo_before_1787104677033.jpg',
    currentPhotoUrl: '/src/assets/images/milo_after_1787104685898.jpg',
    rescuerName: 'Carlos Méndez - Brigadista Pata Amiga',
    likes: 38
  },
  {
    id: 'story-3',
    petName: 'Rocky',
    species: 'Perro',
    breed: 'Cruce de Labrador Negro',
    estimatedAge: '3 años',
    rescueLocation: 'Vía Purificación - Saldaña (Sector Chenche)',
    rescueStory: 'Fue víctima de un atropellamiento leve en la carretera nacional. Tenía una pata trasera fracturada y no podía caminar.',
    adoptionStory: 'Gracias a una colecta comunitaria se pagó su cirugía ortopédica en la veterinaria aliada. Tras su rehabilitación, fue adoptado por una familia que vive en una casa campestre en Purificación.',
    adoptedFamilyName: 'Familia Morales Castro',
    adoptedDate: '10 de Noviembre, 2024',
    healthBefore: 'Fractura de pata trasera y deshidratación.',
    healthAfter: 'Corre con total normalidad, hueso completamente consolidado y con gran vitalidad.',
    beforePhotoUrl: '/src/assets/images/rocky_before_1787104697477.jpg',
    currentPhotoUrl: '/src/assets/images/rocky_after_1787104708249.jpg',
    rescuerName: 'Clínica Veterinaria San Francisco Purificación',
    likes: 56
  }
];

export const INITIAL_ADOPTION_PETS: AdoptionPet[] = [
  {
    id: 'pet-1',
    name: 'Luna',
    species: 'Perro',
    breed: 'Criollo Mestizo',
    gender: 'Hembra',
    age: '1.5 años',
    size: 'Mediano',
    story: 'Luna fue encontrada deambulando cerca al Parque Principal de Purificación buscando comida. Es sumamente cariñosa, dulce con los niños y se lleva bien con otros perritos.',
    rescueHistory: 'Rescatada hace 2 meses en el centro de Purificación. Llegó con pulgas y parásitos pero ya fue tratada con antiparasitarios de amplio espectro.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Ninguna condición especial. Dieta estándar para perro adulto.'
    },
    personality: ['Juguetona', 'Sociable', 'Protectora', 'Amorosa'],
    photos: [
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'María Fernanda Ruiz (Voluntaria)',
    rescuerContact: '+57 310 445 8892',
    rescuerLocation: 'Barrio Camilo Torres, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-2',
    name: 'Simba',
    species: 'Gato',
    breed: 'Mestizo Atigrado',
    gender: 'Macho',
    age: '8 meses',
    size: 'Pequeño',
    story: 'Simba es un gatito curioso y ronroneador que adora tomar el sol y jugar con pelotitas. Se adapta fácilmente a apartamentos o casas.',
    rescueHistory: 'Rescatado de una bodega en el sector comercial de Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Test de VIF/FeLV negativo. Vacuna triple felina aplicada.'
    },
    personality: ['Curioso', 'Ronroneador', 'Tranquilo', 'Cariñoso'],
    photos: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'Dra. Andrea Castro (Veterinaria)',
    rescuerContact: '+57 314 772 1093',
    rescuerLocation: 'Barrio El Triunfo, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-3',
    name: 'Toby',
    species: 'Perro',
    breed: 'Cruce de Golden / Criollo',
    gender: 'Macho',
    age: '2 años',
    size: 'Grande',
    story: 'Toby es un perro noble y leal con energía para pasear y jugar a la pelota. Ideal para una familia activa o con patio.',
    rescueHistory: 'Rescatado en la vereda Chenche Asoleados. Estaba amarrado bajo el sol sin agua. Su dueño lo cedió voluntariamente.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Excelente condición física. Vacuna séxtuple y antirrábica vigentes.'
    },
    personality: ['Noble', 'Guardián', 'Leal', 'Activo'],
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'Comité de Rescate Purificación',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Barrio Santander, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-4',
    name: 'Nala',
    species: 'Gato',
    breed: 'Siamés Mestizo',
    gender: 'Hembra',
    age: '1 año',
    size: 'Pequeño',
    story: 'Ojos azules cautivadores y personalidad tierna. Le encanta dormir sobre las piernas de sus cuidadores y es muy limpia.',
    rescueHistory: 'Entregada por una familia de la tercera edad que ya no podía atenderla en Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Esterilizada hace 1 mes, cicatriz perfecta.'
    },
    personality: ['Dormilona', 'Vocal', 'Cariñosa', 'Apegada'],
    photos: [
      'https://images.unsplash.com/photo-1513360309081-38f0762b40ab?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'Luisa Fernanda Polo (Voluntaria)',
    rescuerContact: '+57 320 918 3341',
    rescuerLocation: 'Barrio Villa del Río, Purificación Tolima',
    featured: false
  },
  {
    id: 'pet-5',
    name: 'Pecas',
    species: 'Perro',
    breed: 'Beagle Mestizo',
    gender: 'Macho',
    age: '3 años',
    size: 'Mediano',
    story: 'Pecas es juguetón, curioso y le encantan los paseos por el campo. Es muy inteligente y aprende trucos rápidamente.',
    rescueHistory: 'Encontrado extraviado en la zona del puente sobre el Río Magdalena. Nunca fue reclamado.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Buen estado general. Peso controlado.'
    },
    personality: ['Olfateador', 'Alegre', 'Inteligente', 'Sociable'],
    photos: [
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'Albergue Amigo Purificación',
    rescuerContact: '+57 315 670 9922',
    rescuerLocation: 'Sector La Ponderosa, Purificación Tolima',
    featured: false
  },
  {
    id: 'pet-6',
    name: 'Boby',
    species: 'Perro',
    breed: 'Criollo Poodle Mestizo',
    gender: 'Macho',
    age: '4 años',
    size: 'Pequeño',
    story: 'Boby es tranquilo, ideal para personas adultas mayores o familias que busquen un perrito faldero y muy dócil.',
    rescueHistory: 'Rescatado tras quedar desamparado en el Barrio Ospina Pérez.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Profilaxis dental realizada recientemente.'
    },
    personality: ['Calmado', 'Obediente', 'Tierno', 'Compañero'],
    photos: [
      'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'disponible',
    rescuerName: 'Dra. Sofía Rescatista',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Barrio Ospina Pérez, Purificación Tolima',
    featured: false
  }
];

export const INITIAL_HEALTH_EVENTS: HealthEvent[] = [
  {
    id: 'event-1',
    title: 'Gran Jornada de Esterilización Gratuita y a Bajo Costo',
    type: 'esterilizacion',
    date: 'Sábado, 28 de Septiembre 2024',
    time: '07:30 AM - 03:00 PM',
    locationName: 'Polideportivo Municipal de Purificación',
    address: 'Calle 7 con Carrera 4, Barrio El Triunfo',
    municipality: 'Purificación, Tolima',
    description: 'Jornada quirúrgica de esterilización para perros y gatos machos y hembras. Ayudamos a frenar el abandono animal en Purificación y corregimientos aledaños con apoyo de médicos veterinarios especializados.',
    isFree: true,
    feeDetails: 'Gratuito para estratos 1 y 2 (presentar recibo público o SISBÉN). Donación sugerida de $25.000 para otros estratos.',
    requirements: [
      'Mascota en ayuno estricto de agua y comida por 8 horas.',
      'Edad entre 4 meses y 7 años.',
      'Perros con collar y traílla (bozal si es reactivo).',
      'Gatos en guacal o canastilla segura, nunca en brazos.',
      'Llevar cobija limpia y toalla para la recuperación posquirúrgica.'
    ],
    totalSpots: 80,
    registeredCount: 54,
    contactPhone: '+57 312 890 4521',
    contactOrganizer: 'Alcaldía Municipal & Colectivo Pata Amiga',
    status: 'proximo'
  },
  {
    id: 'event-2',
    title: 'Brigada de Vacunación Antirrábica y Desparasitación',
    type: 'vacunacion',
    date: 'Domingo, 13 de Octubre 2024',
    time: '08:00 AM - 01:00 PM',
    locationName: 'Parque Principal de Purificación',
    address: 'Plaza de Bolívar, Frente a la Iglesia San Juan Bautista',
    municipality: 'Purificación, Tolima',
    description: 'Vacunación antirrábica obligatoria anual para todos los caninos y felinos del municipio, junto con desparasitación interna y externa contra pulgas y garrapatas.',
    isFree: true,
    feeDetails: '100% Gratuita para toda la comunidad tolimense.',
    requirements: [
      'Mascotas mayores de 3 meses de edad.',
      'Hembras no deben estar en gestación avanzada.',
      'Llevar el carné de vacunación anterior si lo tiene.',
      'El tutor debe ser mayor de edad.'
    ],
    totalSpots: 150,
    registeredCount: 92,
    contactPhone: '+57 314 772 1093',
    contactOrganizer: 'Secretaría de Salud y Pata Amiga',
    status: 'proximo'
  },
  {
    id: 'event-3',
    title: 'Colectatón “Un Kilo de Amor” por los Callejeros de Purificación',
    type: 'donacion_alimento',
    date: 'Sábado, 26 de Octubre 2024',
    time: '09:00 AM - 05:00 PM',
    locationName: 'Malecón Turístico del Río Magdalena',
    address: 'Avenida del Río, Purificación',
    municipality: 'Purificación, Tolima',
    description: 'Recolección masiva de concentrado para perros y gatos, medicamentos veterinarios (antibióticos, gasas, jeringas), cobijas y platos para alimentar a más de 70 animales en refugios temporales de Purificación.',
    isFree: true,
    feeDetails: 'Aportes voluntarios en especie o apoyo económico vía Nequi/Daviplata.',
    requirements: [
      'Alimento sellado o a granel en buen estado.',
      'Medicamentos vigentes.',
      'Participación de voluntarios para clasificación.'
    ],
    totalSpots: 200,
    registeredCount: 110,
    contactPhone: '+57 310 445 8892',
    contactOrganizer: 'Red de Voluntarios Tolimenses',
    status: 'proximo'
  }
];

export const INITIAL_ANIMAL_REPORTS: AnimalReport[] = [
  {
    id: 'rep-1',
    reporterName: 'Carlos Gómez',
    reporterEmail: 'carlos.gomez@gmail.com',
    reporterPhone: '3138891022',
    neighborhood: 'Barrio Camilo Torres',
    addressDetails: 'Frente a la tienda Los Almendros, Carrera 5',
    animalType: 'Perro',
    urgency: 'urgente',
    description: 'Perrita criolla color café atropellada en una pata, está resguardada en el andén pero gime de dolor. Necesita atención médica urgente.',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    status: 'en_atencion',
    reportedAt: 'Hoy, 09:30 AM',
    statusNote: 'La Dra. Sofía ya la recogió en el móvil de rescate y está en la clínica veterinaria recibiendo analgésicos y rayos X.',
    assignedRescuer: 'Dra. Sofía - Rescatista Tolima'
  },
  {
    id: 'rep-2',
    reporterName: 'Claudia Mendoza',
    reporterEmail: 'claudia.m@hotmail.com',
    reporterPhone: '3119023411',
    neighborhood: 'Barrio El Ospina Pérez',
    addressDetails: 'Cerca a la cancha sintética, Calle 10',
    animalType: 'Gato',
    urgency: 'moderada',
    description: 'Camada de 4 gatitos recién nacidos abandonados en una caja. La mamá no aparece. Requieren nodriza o leche maternizada urgente.',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    status: 'en_camino',
    reportedAt: 'Hoy, 11:15 AM',
    statusNote: 'Voluntario Juan David se dirige con guacal y fórmula para cachorros.',
    assignedRescuer: 'Juan David (Voluntario)'
  },
  {
    id: 'rep-3',
    reporterName: 'Julián Barreto',
    reporterEmail: 'julian.b@yahoo.es',
    reporterPhone: '3207712398',
    neighborhood: 'Sector Santander',
    addressDetails: 'Vía hacia la orilla del Río Magdalena',
    animalType: 'Perro',
    urgency: 'leve',
    description: 'Perro mestizo negro deambulando desorientado, tiene un collar azul viejo pero no tiene placa. Parece extraviado recientemente.',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    status: 'recibido',
    reportedAt: 'Ayer, 04:20 PM',
    statusNote: 'Reporte publicado en redes comunitarias para ubicar a los dueños.',
    assignedRescuer: 'Red Pata Amiga Purificación'
  }
];

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'channel-rescatistas',
    name: 'Red de Rescatistas Purificación',
    roleDescription: 'Coordinación de emergencias y rescates en Tolima',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    type: 'red_rescatistas',
    online: true,
    phone: '+57 312 890 4521',
    badgeCount: 2,
    lastMessage: 'Tenemos un voluntario disponible en el Barrio Camilo Torres para verificar el caso.',
    lastMessageTime: '10:45 AM'
  },
  {
    id: 'channel-veterinaria',
    name: 'Dra. Sofía Ruiz (Médico Veterinario)',
    roleDescription: 'Atención médica y orientación de primeros auxilios',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    type: 'veterinaria',
    online: true,
    phone: '+57 314 772 1093',
    badgeCount: 0,
    lastMessage: 'Si el perrito tiene sangrado, por favor mantén presión suave con una gasa limpia.',
    lastMessageTime: '09:50 AM'
  },
  {
    id: 'channel-voluntarios',
    name: 'Brigadas y Voluntariado Tolima',
    roleDescription: 'Organización de eventos, esterilización y donaciones',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    type: 'voluntarios',
    online: true,
    phone: '+57 310 445 8892',
    badgeCount: 1,
    lastMessage: 'Recuerden que este sábado necesitamos apoyo en el Polideportivo desde las 7:00 AM.',
    lastMessageTime: '08:15 AM'
  },
  {
    id: 'channel-general',
    name: 'Comunidad Pata Amiga Purificación',
    roleDescription: 'Chat abierto para ciudadanos y amantes de los animales',
    avatar: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=200&q=80',
    type: 'general',
    online: true,
    phone: '+57 315 670 9922',
    badgeCount: 0,
    lastMessage: 'Muchas gracias a todos por compartir la historia de Canela!',
    lastMessageTime: 'Ayer'
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'channel-rescatistas': [
    {
      id: 'msg-1',
      channelId: 'channel-rescatistas',
      senderId: 'sofia-rescate',
      senderName: 'Dra. Sofía - Rescatista Tolima',
      senderRole: 'rescatista',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      text: '¡Hola a todos! Bienvenidos al canal directo de la Red de Rescatistas de Purificación, Tolima. Aquí recibimos alertas prioritarias.',
      timestamp: '09:00 AM'
    },
    {
      id: 'msg-2',
      channelId: 'channel-rescatistas',
      senderId: 'carlos-voluntario',
      senderName: 'Carlos Méndez (Brigadista)',
      senderRole: 'voluntario',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      text: 'Tenemos activo el reporte del Barrio Camilo Torres. El vehículo de apoyo ya está en camino para recoger al animalito.',
      timestamp: '09:40 AM'
    },
    {
      id: 'msg-3',
      channelId: 'channel-rescatistas',
      senderId: 'sofia-rescate',
      senderName: 'Dra. Sofía - Rescatista Tolima',
      senderRole: 'rescatista',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      text: 'Tenemos un voluntario disponible en el Barrio Camilo Torres para verificar el caso.',
      timestamp: '10:45 AM'
    }
  ],
  'channel-veterinaria': [
    {
      id: 'vet-msg-1',
      channelId: 'channel-veterinaria',
      senderId: 'dra-ruiz',
      senderName: 'Dra. Sofía Ruiz (Médico Veterinario)',
      senderRole: 'veterinario',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      text: 'Hola. Si encontraste un animal lastimado en Purificación, por favor describe los síntomas. Si tiene sangrado, mantén presión suave con gasa limpia y no le suministres medicamentos humanos como paracetamol o ibuprofeno.',
      timestamp: '09:50 AM'
    }
  ],
  'channel-voluntarios': [
    {
      id: 'vol-msg-1',
      channelId: 'channel-voluntarios',
      senderId: 'admin-vol',
      senderName: 'Comité de Voluntarios',
      senderRole: 'voluntario',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      text: 'Recuerden que este sábado necesitamos apoyo en el Polideportivo desde las 7:00 AM para la jornada de esterilización.',
      timestamp: '08:15 AM'
    }
  ],
  'channel-general': [
    {
      id: 'gen-msg-1',
      channelId: 'channel-general',
      senderId: 'comunidad-1',
      senderName: 'Mariana Ospina (Ciudadana)',
      senderRole: 'ciudadano',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      text: '¡Muchas gracias a todos por compartir la historia de Canela! Su nueva familia está feliz.',
      timestamp: 'Ayer'
    }
  ]
};

export const PURIFICACION_NEIGHBORHOODS = [
  'Barrio El Ospina Pérez',
  'Barrio Camilo Torres',
  'Barrio Santander',
  'Barrio El Triunfo',
  'Barrio Villa del Río',
  'Barrio La Ponderosa',
  'Sector Centro / Plaza de Bolívar',
  'Malecón del Río Magdalena',
  'Barrio Los Fundadores',
  'Barrio Juan Manuel Rudas',
  'Vereda Chenche Asoleados (Rural)',
  'Vereda Santa Lucía (Rural)',
  'Vereda Villa Esperanza (Rural)',
  'Otro Sector en Purificación Tolima'
];
