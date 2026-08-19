-- ============================================================================
-- DATOS INICIALES (SEEDS): Pata Amiga - Purificación, Tolima
-- Motor: MySQL 8.0+ / MariaDB
-- ============================================================================

USE `pata_amiga_db`;

-- 1. USUARIOS INICIALES
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `location`, `avatar`) VALUES
('usr-1', 'Danna Gasca', 'gascadanna414@gmail.com', '$2b$10$EpRnTzVlqHNP0.fHPxW3eeM9yV1fM5YJvE7/2l.9/2P6j8tL8YJ/C', 'ciudadano', '3128904521', 'Purificación, Tolima', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
('usr-2', 'Dr. Carlos Alarcón', 'carlos.alarcon@vetpurificacion.com', '$2b$10$EpRnTzVlqHNP0.fHPxW3eeM9yV1fM5YJvE7/2l.9/2P6j8tL8YJ/C', 'veterinario', '3157789012', 'Purificación, Tolima', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'),
('usr-3', 'María Fernanda Ruiz', 'maria.ruiz@voluntarios-tolima.org', '$2b$10$EpRnTzVlqHNP0.fHPxW3eeM9yV1fM5YJvE7/2l.9/2P6j8tL8YJ/C', 'voluntario', '3104458892', 'Purificación, Tolima', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'),
('usr-4', 'Javier Peña', 'javier.rescates@gmail.com', '$2b$10$EpRnTzVlqHNP0.fHPxW3eeM9yV1fM5YJvE7/2l.9/2P6j8tL8YJ/C', 'rescatista', '3183345511', 'Purificación, Tolima', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');

-- 2. HISTORIAS DE ÉXITO (ANTES / DESPUÉS)
INSERT INTO `success_stories` (`id`, `pet_name`, `species`, `breed`, `estimated_age`, `rescue_location`, `rescue_story`, `adoption_story`, `adopted_family_name`, `adopted_date`, `health_before`, `health_after`, `before_photo_url`, `current_photo_url`, `rescuer_name`, `likes_count`) VALUES
('story-1', 'Canela', 'Perro', 'Criollo Tolimense', '2 años', 'Barrio El Ospina Pérez, Purificación Tolima', 
 'Canela fue hallada en grave estado de desnutrición y con sarna avanzada cerca a la salida hacia Prado. Una vecina hizo el reporte a través de Pata Amiga y los rescatistas voluntarios acudieron en menos de una hora.',
 'Tras 3 meses de cuidados médicos, baños medicados y mucho amor, la familia Gómez de Purificación decidió adoptarla. Ahora disfruta de paseos en el Malecón del Río Magdalena y tiene una cama calientita.',
 'Familia Gómez Ramírez', '15 de Mayo, 2024',
 'Desnutrición severa (8kg), sarna sarcóptica y parásitos.',
 'Completamente sana (16kg), pelo brillante, esterilizada y con esquema de vacunas al día.',
 '/src/assets/images/canela_before_1787104655599.jpg', '/src/assets/images/canela_after_1787104667779.jpg',
 'Dra. Sofía - Rescatista Voluntaria Tolima', 42),

('story-2', 'Milo & Bigotes', 'Gato', 'Mestizo Atigrado Naranja', '1 año', 'Sector de la Galería Municipal, Purificación',
 'Era un gatito cachorro abandonado en una caja de cartón bajo la lluvia. Fue alimentado con biberón por el equipo voluntario durante sus primeras 4 semanas.',
 'Fue adoptado por Don Hernando y su hija Mariana. Ahora es el consentido del hogar, duerme cómodo en los sillones y es sumamente juguetón.',
 'Hernando & Mariana Lozano', '28 de Julio, 2024',
 'Hipotermia, conjuntivitis neonatal y bajo peso.',
 '100% recuperado, castrado, desparasitado y con carné de vacunación felina al día.',
 '/src/assets/images/milo_before_1787104677033.jpg', '/src/assets/images/milo_after_1787104685898.jpg',
 'Carlos Méndez - Brigadista Pata Amiga', 38),

('story-3', 'Rocky', 'Perro', 'Cruce de Labrador Negro', '3 años', 'Vía Purificación - Saldaña (Sector Chenche)',
 'Fue víctima de un atropellamiento leve en la carretera nacional. Tenía una pata trasera fracturada y no podía caminar.',
 'Gracias a una colecta comunitaria se pagó su cirugía ortopédica en la veterinaria aliada. Tras su rehabilitación, fue adoptado por una familia que vive en una casa campestre en Purificación.',
 'Familia Morales Castro', '10 de Noviembre, 2024',
 'Fractura de pata trasera y deshidratación.',
 'Corre con total normalidad, hueso completamente consolidado y con gran vitalidad.',
 '/src/assets/images/rocky_before_1787104697477.jpg', '/src/assets/images/rocky_after_1787104708249.jpg',
 'Clínica Veterinaria San Francisco Purificación', 56);

-- 3. MASCOTAS DISPONIBLES PARA ADOPCIÓN
INSERT INTO `adoption_pets` (`id`, `name`, `species`, `breed`, `gender`, `age`, `size`, `story`, `rescue_history`, `vaccinated`, `sterilized`, `dewormed`, `special_care_notes`, `personality_tags`, `photos`, `status`, `rescuer_name`, `rescuer_contact`, `rescuer_location`, `featured`) VALUES
('pet-1', 'Luna', 'Perro', 'Criollo Mestizo', 'Hembra', '1.5 años', 'Mediano',
 'Luna fue encontrada deambulando cerca al Parque Principal de Purificación buscando comida. Es sumamente cariñosa, dulce con los niños y se lleva bien con otros perritos.',
 'Rescatada hace 2 meses en el centro de Purificación. Llegó con pulgas y parásitos pero ya fue tratada con antiparasitarios de amplio espectro.',
 1, 1, 1, 'Ninguna condición especial. Dieta estándar para perro adulto.',
 JSON_ARRAY('Juguetona', 'Sociable', 'Protectora', 'Amorosa'),
 JSON_ARRAY('https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80'),
 'disponible', 'María Fernanda Ruiz (Voluntaria)', '+57 310 445 8892', 'Barrio Camilo Torres, Purificación Tolima', 1),

('pet-2', 'Simba', 'Gato', 'Mestizo Atigrado', 'Macho', '8 meses', 'Pequeño',
 'Simba es un gatito curioso y ronroneador que adora tomar el sol y jugar con pelotitas. Se adapta fácilmente a apartamentos o casas.',
 'Rescatado de una bodega en el sector comercial de Purificación.',
 1, 1, 1, 'Gatito de interiores. Requiere rascador y arenero limpio.',
 JSON_ARRAY('Curioso', 'Tranquilo', 'Ronroneador', 'Independiente'),
 JSON_ARRAY('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80'),
 'disponible', 'Dra. Diana Castro (Veterinaria Aliada)', '+57 312 890 4521', 'Sector Centro, Purificación Tolima', 1),

('pet-3', 'Toby', 'Perro', 'Cruce Schnauzer / Criollo', 'Macho', '2 años', 'Pequeño',
 'Toby es muy leal, alegre y obediente. Le encanta que le acaricien la pancita y salir a caminar.',
 'Fue dejado atado a un árbol en la vía hacia el Malecón. Fue rescatado de inmediato por vecinos solidarios.',
 1, 1, 1, 'Pelo recortado recientemente, libre de garrapatas.',
 JSON_ARRAY('Obediente', 'Guardián', 'Cariñoso', 'Activo'),
 JSON_ARRAY('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'),
 'disponible', 'Fundación Amigos de 4 Patas Purificación', '+57 315 778 9012', 'Barrio Villa de las Palmas, Purificación', 1),

('pet-4', 'Mía', 'Gato', 'Carey Tricolor', 'Hembra', '1 año', 'Pequeño',
 'Mía es una gata tranquila de ojos verdes hermosos. Le gusta la compañía silenciosa y es muy aseada.',
 'Rescatada de un tejado en la vereda Chenche Asoleado.',
 1, 1, 1, 'Esterilizada y con prueba de leucemia felina negativa.',
 JSON_ARRAY('Dulce', 'Silenciosa', 'Dormilona', 'Limpia'),
 JSON_ARRAY('https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80'),
 'disponible', 'Javier Peña (Rescatista)', '+57 318 334 5511', 'Vereda Chenche, Purificación Tolima', 0);

-- 4. REPORTES DE ANIMALES EN EMERGENCIA
INSERT INTO `animal_reports` (`id`, `reporter_name`, `reporter_email`, `reporter_phone`, `neighborhood`, `address_details`, `latitude`, `longitude`, `animal_type`, `urgency`, `description`, `photo_url`, `status`, `status_note`, `assigned_rescuer`) VALUES
('rep-1', 'Claudia Marcela', 'claudia.m@gmail.com', '311 556 7890', 'Barrio El Modelo', 'Frente a la panadería central, carrera 5ta con calle 7ma', 3.8576, -74.9298, 'Perro', 'urgente',
 'Perrito callejero cojeando con herida abierta en la pata delantera. Parece haber sido golpeado por una moto.',
 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
 'en_atencion', 'El Dr. Alarcón ya lo recogió y está siendo atendido con sutura y antibióticos.', 'Clínica Veterinaria San Francisco'),

('rep-2', 'Andrés Felipe Tovar', 'andres.tovar@hotmail.com', '320 445 1122', 'Barrio Ospina Pérez', 'Lote baldío detrás del colegio técnico', 3.8542, -74.9271, 'Gato', 'moderada',
 'Camada de 4 gaticos recién nacidos sin madre visible desde hace 2 días. Lloran mucho.',
 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
 'rescatado', 'Gatitos puestos bajo nodriza temporal en el hogar de paso de la voluntaria María Ruiz.', 'María Fernanda Ruiz'),

('rep-3', 'Sandra Milena', 'sandra.purif@gmail.com', '314 990 3344', 'Sector La Candelaria', 'Cerca a la orilla del río Magdalena', 3.8610, -74.9315, 'Equino', 'urgente',
 'Caballo con signos de agotamiento extremo y deshidratación amarrado al sol sin agua.',
 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
 'en_camino', 'Comisión con la Policía Ambiental de Purificación en desplazamiento.', 'Brigada Mixta Policía + Voluntarios');

-- 5. JORNADAS DE SALUD Y BRIGADAS
INSERT INTO `health_events` (`id`, `title`, `type`, `event_date`, `event_time`, `location_name`, `address`, `municipality`, `description`, `is_free`, `fee_details`, `requirements`, `total_spots`, `registered_count`, `contact_phone`, `contact_organizer`, `status`) VALUES
('evt-1', 'Gran Jornada de Esterilización Gratuita para Caninos y Felinos', 'esterilizacion', 'Sábado 28 de Septiembre, 2024', '7:30 AM – 3:00 PM',
 'Polideportivo Barrio Ospina Pérez', 'Calle 8 con Carrera 3, Purificación', 'Purificación, Tolima',
 'Campaña masiva para frenar la sobrepoblación y el abandono animal en el municipio de Purificación. Cirugías realizadas por médicos veterinarios certificados.',
 1, '100% Gratuito (Cupos Limitados)',
 JSON_ARRAY('Ayuno de 8 horas de sólidos y líquidos', 'Traer cobija o manta térmica limpia', 'Perros con collar y bozal (si son nerviosos)', 'Gatos en guacal o funda de almohada segura', 'Mascotas mayores de 4 meses y en buen estado de salud'),
 60, 48, '+57 312 890 4521', 'Alcaldía de Purificación & Red Pata Amiga', 'proximo'),

('evt-2', 'Brigada de Vacunación Antirrábica y Desparasitación General', 'vacunacion', 'Domingo 6 de Octubre, 2024', '8:00 AM – 1:00 PM',
 'Parque Principal de Purificación', 'Plaza de Bolívar Central', 'Purificación, Tolima',
 'Aplicación de dosis antirrábica obligatoria anual, desparasitación interna y entrega de vitaminas para perros y gatos de todas las edades.',
 1, 'Gratis para estratos 1, 2 y zonas rurales',
 JSON_ARRAY('Presentar carné de vacunación previo si lo tiene', 'Mascota sujeta con correa', 'Tener al menos 3 meses de edad'),
 120, 85, '+57 315 778 9012', 'Secretaría de Salud & Veterinarios Aliados', 'proximo'),

('evt-3', 'Donatón de Alimento y Cobijas para Hogares de Paso', 'donacion_alimento', 'Sábado 19 de Octubre, 2024', '9:00 AM – 5:00 PM',
 'Malecón Turístico del Río Magdalena', 'Sector Puerto Fluvial, Purificación', 'Purificación, Tolima',
 'Recolección de bultos de concentrado, medicamentos, correas y elementos de aseo para abastecer los 6 refugios temporales de Purificación.',
 1, 'Donación voluntaria en especie o económica',
 JSON_ARRAY('Alimento sellado en su empaque original', 'Cobijas y toallas limpias', 'Medicamentos vigentes (analgésicos, gasas, sueros)'),
 200, 110, '+57 310 445 8892', 'Comité Juvenil Animalista de Purificación', 'proximo');

-- 6. CANALES DE CHAT
INSERT INTO `chat_channels` (`id`, `name`, `role_description`, `avatar`, `type`, `online`, `phone`, `badge_count`, `last_message`, `last_message_time`) VALUES
('channel-rescatistas', 'Red de Rescatistas Purificación', 'Voluntarios de rescate activo y tránsito', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 'red_rescatistas', 1, '+57 312 890 4521', 0, 'Estamos atentos para atender reportes en el casco urbano.', 'Hace 10 min'),
('channel-veterinaria', 'Clínica Veterinaria San Francisco', 'Consultas de urgencia y triaje básico', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80', 'veterinaria', 1, '+57 315 778 9012', 0, 'Disponible para casos de esterilización y cirugías.', 'Hace 25 min'),
('channel-voluntarios', 'Voluntarios de Jornadas & Eventos', 'Coordinación logística de brigadas', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'voluntarios', 1, '+57 310 445 8892', 0, 'Inscripciones abiertas para la jornada en el Ospina Pérez.', 'Hace 1 hora'),
('channel-general', 'Comunidad Pata Amiga Tolima', 'Canal general de adoptantes y donantes', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'general', 1, '+57 318 334 5511', 0, '¡Gracias a todos por apoyar las adopciones en Purificación!', 'Hace 3 horas');

-- 7. MENSAJES DE EJEMPLO EN EL CANAL DE RESCATISTAS
INSERT INTO `chat_messages` (`id`, `channel_id`, `sender_id`, `sender_name`, `sender_role`, `avatar`, `text`, `image_url`, `created_at`) VALUES
('msg-1', 'channel-rescatistas', 'sys-0', 'Pata Amiga Tolima', 'sistema', NULL, 'Canal oficial de atención ciudadana y coordinación de rescates en Purificación, Tolima.', NULL, '2024-09-01 08:00:00'),
('msg-2', 'channel-rescatistas', 'usr-2', 'Dra. Sofía Alarcón', 'rescatista', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 'Hola comunidad de Purificación. Estamos listos para coordinar cualquier apoyo o caso de vulnerabilidad.', NULL, '2024-09-01 08:15:00'),
('msg-3', 'channel-rescatistas', 'usr-3', 'Carlos Méndez', 'voluntario', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Tenemos 2 bultos de concentrado disponibles en el centro de acopio para hogares de paso temporales.', NULL, '2024-09-01 08:30:00');
