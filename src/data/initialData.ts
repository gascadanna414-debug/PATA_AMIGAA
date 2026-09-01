import { SuccessStory, AdoptionPet, HealthEvent, AnimalReport, ChatChannel, ChatMessage } from '../types';

export const INITIAL_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-hades',
    petName: 'Hades',
    species: 'Perro',
    breed: 'Mestizo de Pitbull',
    estimatedAge: '2 años',
    rescueLocation: 'Vía hacia Saldaña, Purificación Tolima',
    rescueStory: 'Hades no siempre tuvo nombre. Durante mucho tiempo fue solo una sombra más al borde del camino, moviéndose rápido entre el ruido de los motores y el olor a asfalto caliente. Había aprendido a sobrevivir esquivando ruedas, buscando restos de comida y confiando solo en su instinto. Pero lo curioso de Hades es que, incluso en medio de todo eso, nunca perdió algo muy suyo: la curiosidad y la nobleza.',
    adoptionStory: 'Un día se detuvo frente a un taller donde una voluntaria de Pata Amiga le ofreció agua limpia. No huyó. Se quedó esperando, con los ojos atentos y la cola moviéndose apenas un poco. Tras su chequeo veterinario y esterilización, fue adoptado por Don Fernando y su familia en Purificación, donde hoy duerme tranquilo en su propio patio.',
    adoptedFamilyName: 'Familia Ramírez Gómez',
    adoptedDate: '12 de Junio, 2024',
    healthBefore: 'Deshidratación, almohadillas lastimadas por el asfalto y parásitos.',
    healthAfter: '100% recuperado, peso ideal, esterilizado, vacunado y muy afectuoso.',
    beforePhotoUrl: '/images/hades_rescue_1788225379594.jpg',
    currentPhotoUrl: '/images/hades_rescue_1788225379594.jpg',
    rescuerName: 'Equipo Voluntario Pata Amiga',
    likes: 89
  },
  {
    id: 'story-chopper',
    petName: 'Chopper',
    species: 'Perro',
    breed: 'Criollo Mestizo',
    estimatedAge: '1 año',
    rescueLocation: 'Barrio Ospina Pérez, Purificación Tolima',
    rescueStory: 'El refugio estaba casi en silencio aquella tarde. Afuera, el viento movía las hojas secas como si contaran secretos que nadie escuchaba. Dentro, entre jaulas limpias pero frías, había un perro que no ladraba. No era el más grande ni el más llamativo. Tenía el pelaje opaco, cicatrices que hablaban de un pasado difícil y una mirada tranquila, demasiado tranquila para alguien tan joven.',
    adoptionStory: 'A diferencia de los demás, no saltaba cuando alguien se acercaba. Solo observaba con ternura. Los voluntarios decían que había llegado solo una mañana sentado frente a la puerta esperando. Hoy Chopper es el consentido indiscutible de la familia Castro Morales en su finca campestre.',
    adoptedFamilyName: 'Familia Castro Morales',
    adoptedDate: '24 de Agosto, 2024',
    healthBefore: 'Bajo peso, anemia leve y pelaje maltratado.',
    healthAfter: 'Totalmente revitalizado, pelaje brillante, carné de vacunas completo y esterilizado.',
    beforePhotoUrl: '/images/chopper_rescue_1788225394304.jpg',
    currentPhotoUrl: '/images/chopper_rescue_1788225394304.jpg',
    rescuerName: 'Dra. Sofía - Rescatista Purificación',
    likes: 94
  },
  {
    id: 'story-mateo',
    petName: 'Mateo',
    species: 'Perro',
    breed: 'Criollo Caramelo',
    estimatedAge: '2 años',
    rescueLocation: 'Malecón del Río Magdalena, Purificación Tolima',
    rescueStory: 'Mateo deambulaba cerca de la orilla del Río Magdalena buscando sombra y restos de comida de los pescadores. Estaba asustadizo, con desnutrición severa y una patita delantera lastimada por un tropiezo.',
    adoptionStory: 'Una brigada de voluntarios de Pata Amiga logró ganarse su confianza con paciencia y premios. Tras dos meses de tratamiento y rehabilitación física en hogar de paso, fue adoptado por la profesora Luz Marina, quien lo lleva a pasear todas las tardes.',
    adoptedFamilyName: 'Luz Marina & Familia',
    adoptedDate: '18 de Julio, 2024',
    healthBefore: 'Desnutrición moderada, cojera en miembro anterior izquierdo y pulgas.',
    healthAfter: 'Corre con total energía, pelaje dorado radiante, peso óptimo y vacunación completa.',
    beforePhotoUrl: '/images/mateo_rescue_story_1788226480262.jpg',
    currentPhotoUrl: '/images/mateo_rescue_story_1788226480262.jpg',
    rescuerName: 'Brigadistas Río Magdalena Purificación',
    likes: 67
  },
  {
    id: 'story-kiara',
    petName: 'Kiara',
    species: 'Gato',
    breed: 'Calicó Mestiza',
    estimatedAge: '1 año',
    rescueLocation: 'Barrio El Triunfo, Purificación Tolima',
    rescueStory: 'Kiara fue encontrada atrapada en la copa de un árbol durante un fuerte aguacero en Purificación. Llevaba más de un día maullando asustada sin poder bajar.',
    adoptionStory: 'Con ayuda de la comunidad y una escalera alta, fue rescatada a salvo. Resultó ser una gata increíblemente dulce y cariñosa. Fue adoptada por una pareja de jóvenes médicos que buscaban una compañera hogareña.',
    adoptedFamilyName: 'Dra. Valentina & Dr. Camilo',
    adoptedDate: '05 de Septiembre, 2024',
    healthBefore: 'Hipotermia leve, asustadiza y deshidratada.',
    healthAfter: 'Esterilizada, ronroneadora experta, con peso saludable y vacunas felinas al día.',
    beforePhotoUrl: '/images/kiara_cat_rescue_1788226493062.jpg',
    currentPhotoUrl: '/images/kiara_cat_rescue_1788226493062.jpg',
    rescuerName: 'Equipo Voluntario Purificación',
    likes: 72
  },
  {
    id: 'story-bruno',
    petName: 'Bruno',
    species: 'Perro',
    breed: 'Cruce Pastor Tolimense',
    estimatedAge: '3 años',
    rescueLocation: 'Vereda Chenche Asoleados (Rural), Purificación',
    rescueStory: 'Bruno vivía amarrado con una soga corta bajo el sol inclemente en una finca abandonada. No tenía acceso a agua fresca y presentaba dermatitis severa por el calor y parásitos.',
    adoptionStory: 'A través de un reporte ciudadano en Pata Amiga, se coordinó el rescate y traslado a la clínica veterinaria. Tras sanar sus heridas y recuperar la confianza en los humanos, encontró un hogar definitivo en una hermosa casa de campo en Purificación.',
    adoptedFamilyName: 'Familia Mendoza Barreto',
    adoptedDate: '14 de Octubre, 2024',
    healthBefore: 'Dermatitis solar, bajo peso y marcas de rozamiento en el cuello.',
    healthAfter: 'Pelaje grueso y brillante, esterilizado, sociable con otros perros y muy protector.',
    beforePhotoUrl: '/images/bruno_dog_rescue_1788226506971.jpg',
    currentPhotoUrl: '/images/bruno_dog_rescue_1788226506971.jpg',
    rescuerName: 'Rescate Rural Purificación',
    likes: 81
  },
  {
    id: 'story-nala',
    petName: 'Nala',
    species: 'Perro',
    breed: 'Cachorrita Mestiza',
    estimatedAge: '6 meses',
    rescueLocation: 'Sector Santander, Purificación Tolima',
    rescueStory: 'Nala fue abandonada en una caja de cartón cerca de la escuela del barrio Santander junto con dos de sus hermanitos cuando apenas tenían unas pocas semanas de vida.',
    adoptionStory: 'Fueron alimentados con biberón en un hogar de paso voluntario. Nala fue la primera en ser adoptada por la familia Pineda, quienes tienen dos niños que ahora son sus compañeros inseparables de juegos.',
    adoptedFamilyName: 'Familia Pineda Ruiz',
    adoptedDate: '02 de Noviembre, 2024',
    healthBefore: 'Lactante huérfana, baja temperatura y parásitos intestinales.',
    healthAfter: 'Cachorra juguetona y sana, con esquema completo de vacunación y microchip.',
    beforePhotoUrl: '/images/nala_puppy_rescue_1788226520622.jpg',
    currentPhotoUrl: '/images/nala_puppy_rescue_1788226520622.jpg',
    rescuerName: 'Hogar de Paso Amigos Peludos',
    likes: 98
  },
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
    beforePhotoUrl: '/images/canela_before_1787104655599.jpg',
    currentPhotoUrl: '/images/canela_after_1787104667779.jpg',
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
    beforePhotoUrl: '/images/milo_before_1787104677033.jpg',
    currentPhotoUrl: '/images/milo_after_1787104685898.jpg',
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
    beforePhotoUrl: '/images/rocky_before_1787104697477.jpg',
    currentPhotoUrl: '/images/rocky_after_1787104708249.jpg',
    rescuerName: 'Clínica Veterinaria San Francisco Purificación',
    likes: 56
  }
];

export const INITIAL_ADOPTION_PETS: AdoptionPet[] = [
  {
    id: 'pet-mona',
    name: 'Mona',
    species: 'Perro',
    breed: 'Cachorro Mestizo',
    gender: 'Hembra',
    age: '5 meses',
    size: 'Pequeño',
    story: 'Mona es una cachorrita dulce, juguetona y muy tierna de pelaje dorado. Le encanta compartir con niños y es muy obediente.',
    rescueHistory: 'Rescatada en la vereda Chenche Asoleados de Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Desparasitada, vacunada y con chequeo veterinario al día.'
    },
    personality: ['Juguetona', 'Cariñosa', 'Dócil', 'Alegre'],
    photos: [
      '/images/mona_dog_1788225963408.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Equipo Voluntario Pata Amiga',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Barrio Ospina Pérez, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-mateo',
    name: 'Mateo',
    species: 'Perro',
    breed: 'Criollo Caramelo',
    gender: 'Macho',
    age: '2 años',
    size: 'Mediano',
    story: 'Mateo es un perro alegre, juguetón y lleno de vida. Le fascina jugar con pelotas en el pasto y es sumamente sociable con personas y otros caninos.',
    rescueHistory: 'Rescatado en el Malecón del Río Magdalena en Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Chequeo completo, desparasitado y esterilizado.'
    },
    personality: ['Sociable', 'Juguetón', 'Noble', 'Activo'],
    photos: [
      '/images/mateo_rescue_story_1788226480262.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Brigadistas Río Magdalena',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Sector Malecón, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-kiara',
    name: 'Kiara',
    species: 'Gato',
    breed: 'Calicó',
    gender: 'Hembra',
    age: '8 meses',
    size: 'Pequeño',
    story: 'Kiara es una gatita curiosa, ronroneadora y muy dulce. Le gusta sentarse en ventanas soleadas y recibir caricias.',
    rescueHistory: 'Rescatada en el Barrio El Triunfo, Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Esterilizada y vacunada con triple felina.'
    },
    personality: ['Curiosa', 'Dulce', 'Tranquila', 'Cariñosa'],
    photos: [
      '/images/kiara_cat_rescue_1788226493062.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Dra. Andrea Castro',
    rescuerContact: '+57 314 772 1093',
    rescuerLocation: 'Barrio El Triunfo, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-bruno',
    name: 'Bruno',
    species: 'Perro',
    breed: 'Pastor Mestizo',
    gender: 'Macho',
    age: '3 años',
    size: 'Grande',
    story: 'Bruno es un guardián leal, inteligente y paciente. Ideal para familias con patio o fincas que busquen un protector noble y amoroso.',
    rescueHistory: 'Rescatado en la vereda Chenche Asoleados.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Completamente sano, vacunado y esterilizado.'
    },
    personality: ['Protector', 'Inteligente', 'Leal', 'Tranquilo'],
    photos: [
      '/images/bruno_dog_rescue_1788226506971.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Rescate Rural Purificación',
    rescuerContact: '+57 310 445 8892',
    rescuerLocation: 'Purificación, Tolima',
    featured: true
  },
  {
    id: 'pet-onix',
    name: 'Onix',
    species: 'Gato',
    breed: 'Criollo',
    gender: 'Macho',
    age: '4 años',
    size: 'Mediano',
    story: 'Onix es un gato negro noble y sereno. Es silencioso, observador y busca un hogar donde le brinden afecto y tranquilidad.',
    rescueHistory: 'Rescatado en un tejado comercial de Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Vacunación al día y castrado.'
    },
    personality: ['Sereno', 'Independiente', 'Dócil', 'Leal'],
    photos: [
      '/images/onix_cat_1788225421317.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Voluntarios Pata Amiga',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Barrio Camilo Torres, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-simba',
    name: 'Simba',
    species: 'Perro',
    breed: 'Mestizo',
    gender: 'Macho',
    age: '3 años',
    size: 'Mediano',
    story: 'Simba es un perro fiel y alegre, de orejas expresivas y mirada atenta. Disfruta de caminatas matutinas y es un gran compañero de vida.',
    rescueHistory: 'Encontrado desorientado cerca del Río Magdalena en Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Chequeo general perfecto, energía balanceada.'
    },
    personality: ['Alegre', 'Leal', 'Sociable', 'Protector'],
    photos: [
      '/images/simba_dog_1788225435727.jpg'
    ],
    status: 'disponible',
    rescuerName: 'María Ruiz (Voluntaria)',
    rescuerContact: '+57 310 445 8892',
    rescuerLocation: 'Barrio Santander, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-maya',
    name: 'Maya',
    species: 'Gato',
    breed: 'Carey',
    gender: 'Hembra',
    age: '1 año',
    size: 'Pequeño',
    story: 'Maya es una gatita carey dulce y curiosa. Le fascina jugar con ramitas y dormir en los regazos mientras le acarician las orejas.',
    rescueHistory: 'Rescatada de un lote deshabitado en Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Esterilizada y vacunada con triple felina.'
    },
    personality: ['Juguetona', 'Dulce', 'Curiosa', 'Mimosa'],
    photos: [
      '/images/maya_cat_1788225449558.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Luisa Polo (Hogar de Paso)',
    rescuerContact: '+57 320 918 3341',
    rescuerLocation: 'Barrio Ospina Pérez, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-rocky',
    name: 'Rocky',
    species: 'Perro',
    breed: 'Mestizo',
    gender: 'Macho',
    age: '1 año',
    size: 'Grande',
    story: 'Rocky es un perro con alma de cachorro feliz. Le encanta correr, jugar a la pelota y llenar de cariño a toda su familia.',
    rescueHistory: 'Rescatado en Chenche Asoleados.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Desparasitado y con esquema de vacunas al día.'
    },
    personality: ['Activo', 'Juguetón', 'Cariñoso', 'Noble'],
    photos: [
      '/images/rocky_labrador_1788225471339.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Comité de Rescate Tolima',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Sector La Ponderosa, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-chopper',
    name: 'Chopper',
    species: 'Perro',
    breed: 'Criollo Rubio',
    gender: 'Macho',
    age: '4 meses',
    size: 'Pequeño',
    story: 'Chopper es un cachorro de pelaje rubio suave y mirada tierna. Es muy dócil, aprende rápido y busca una familia amorosa.',
    rescueHistory: 'Rescatado en el Barrio Ospina Pérez, Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: false,
      dewormed: true,
      specialCareNotes: 'Con compromiso de esterilización gratuita a los 6 meses.'
    },
    personality: ['Tierno', 'Dócil', 'Juguetón', 'Compañero'],
    photos: [
      '/images/chopper_rescue_1788225394304.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Dra. Sofía Rescatista',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Barrio Ospina Pérez, Purificación Tolima',
    featured: true
  },
  {
    id: 'pet-hades',
    name: 'Hades',
    species: 'Perro',
    breed: 'Mestizo',
    gender: 'Macho',
    age: '2 años',
    size: 'Mediano',
    story: 'Hades es un perrito noble y tranquilo que busca siempre contacto visual y cariño. Sociable con personas y muy agradecido.',
    rescueHistory: 'Rescatado en la vía nacional Purificación.',
    healthStatus: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      specialCareNotes: 'Esterilizado y con carné de salud al día.'
    },
    personality: ['Noble', 'Tranquilo', 'Leal', 'Atento'],
    photos: [
      '/images/hades_rescue_1788225379594.jpg'
    ],
    status: 'disponible',
    rescuerName: 'Pata Amiga Purificación',
    rescuerContact: '+57 312 890 4521',
    rescuerLocation: 'Purificación, Tolima',
    featured: true
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
    totalSpots: 25,
    registeredCount: 19,
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
    totalSpots: 25,
    registeredCount: 22,
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
    totalSpots: 25,
    registeredCount: 14,
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
