-- ============================================================================
-- BASE DE DATOS: Pata Amiga - Purificación, Tolima
-- Motor: MySQL 8.0+ / MariaDB 10.4+
-- Codificación: UTF-8 Unicode (utf8mb4)
-- Descripción: Esquema relacional para gestión de adopciones, reportes de rescate,
--              brigadas de salud animal, voluntariado y canales comunitarios.
-- ============================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `pata_amiga_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `pata_amiga_db`;

-- Desactivar temporalmente revisión de claves foráneas para creación limpia
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 2. ELIMINACIÓN PREVENTIVA DE TABLAS (SI EXISTEN)
-- ============================================================================
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_channels`;
DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `health_events`;
DROP TABLE IF EXISTS `animal_reports`;
DROP TABLE IF EXISTS `adoption_applications`;
DROP TABLE IF EXISTS `adoption_pets`;
DROP TABLE IF EXISTS `success_stories`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;

-- ============================================================================
-- 3. TABLA: users (Usuarios del Sistema)
-- ============================================================================
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ciudadano', 'voluntario', 'rescatista', 'veterinario', 'admin') NOT NULL DEFAULT 'ciudadano',
  `phone` VARCHAR(30) DEFAULT NULL,
  `location` VARCHAR(150) DEFAULT 'Purificación, Tolima',
  `avatar` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. TABLA: success_stories (Historias de Rescate y Casos de Éxito Antes/Después)
-- ============================================================================
CREATE TABLE `success_stories` (
  `id` VARCHAR(50) NOT NULL,
  `pet_name` VARCHAR(80) NOT NULL,
  `species` ENUM('Perro', 'Gato', 'Equino', 'Otro') NOT NULL DEFAULT 'Perro',
  `breed` VARCHAR(100) NOT NULL DEFAULT 'Criollo / Mestizo',
  `estimated_age` VARCHAR(50) NOT NULL,
  `rescue_location` VARCHAR(200) NOT NULL,
  `rescue_story` TEXT NOT NULL,
  `adoption_story` TEXT NOT NULL,
  `adopted_family_name` VARCHAR(120) NOT NULL,
  `adopted_date` VARCHAR(50) NOT NULL,
  `health_before` TEXT NOT NULL,
  `health_after` TEXT NOT NULL,
  `before_photo_url` VARCHAR(500) NOT NULL,
  `current_photo_url` VARCHAR(500) NOT NULL,
  `rescuer_name` VARCHAR(120) NOT NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stories_species` (`species`),
  KEY `idx_stories_likes` (`likes_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TABLA: adoption_pets (Mascotas Disponibles para Adopción)
-- ============================================================================
CREATE TABLE `adoption_pets` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `species` ENUM('Perro', 'Gato', 'Otro') NOT NULL DEFAULT 'Perro',
  `breed` VARCHAR(100) NOT NULL DEFAULT 'Criollo',
  `gender` ENUM('Macho', 'Hembra') NOT NULL,
  `age` VARCHAR(50) NOT NULL,
  `size` ENUM('Pequeño', 'Mediano', 'Grande') NOT NULL DEFAULT 'Mediano',
  `story` TEXT NOT NULL,
  `rescue_history` TEXT NOT NULL,
  `vaccinated` TINYINT(1) NOT NULL DEFAULT 1,
  `sterilized` TINYINT(1) NOT NULL DEFAULT 1,
  `dewormed` TINYINT(1) NOT NULL DEFAULT 1,
  `special_care_notes` TEXT DEFAULT NULL,
  `personality_tags` JSON DEFAULT NULL COMMENT 'Array JSON de rasgos de personalidad',
  `photos` JSON NOT NULL COMMENT 'Array JSON con URLs de fotos',
  `status` ENUM('disponible', 'en_proceso', 'adoptado') NOT NULL DEFAULT 'disponible',
  `rescuer_name` VARCHAR(120) NOT NULL,
  `rescuer_contact` VARCHAR(50) NOT NULL,
  `rescuer_location` VARCHAR(150) NOT NULL DEFAULT 'Purificación, Tolima',
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pets_status` (`status`),
  KEY `idx_pets_species` (`species`),
  KEY `idx_pets_gender` (`gender`),
  KEY `idx_pets_size` (`size`),
  KEY `idx_pets_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. TABLA: adoption_applications (Solicitudes de Adopción)
-- ============================================================================
CREATE TABLE `adoption_applications` (
  `id` VARCHAR(50) NOT NULL,
  `pet_id` VARCHAR(50) NOT NULL,
  `pet_name` VARCHAR(80) NOT NULL,
  `applicant_name` VARCHAR(120) NOT NULL,
  `applicant_email` VARCHAR(150) NOT NULL,
  `applicant_phone` VARCHAR(30) NOT NULL,
  `applicant_city` VARCHAR(100) NOT NULL DEFAULT 'Purificación',
  `housing_type` ENUM('Casa con patio', 'Casa sin patio', 'Apartamento', 'Finca') NOT NULL,
  `has_other_pets` TINYINT(1) NOT NULL DEFAULT 0,
  `other_pets_details` TEXT DEFAULT NULL,
  `reason_for_adoption` TEXT NOT NULL,
  `status` ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_app_pet_id` (`pet_id`),
  KEY `idx_app_status` (`status`),
  KEY `idx_app_email` (`applicant_email`),
  CONSTRAINT `fk_app_pet` FOREIGN KEY (`pet_id`) REFERENCES `adoption_pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. TABLA: animal_reports (Reportes de Emergencia, Rescate y Maltrato)
-- ============================================================================
CREATE TABLE `animal_reports` (
  `id` VARCHAR(50) NOT NULL,
  `reporter_name` VARCHAR(120) NOT NULL,
  `reporter_email` VARCHAR(150) DEFAULT NULL,
  `reporter_phone` VARCHAR(30) NOT NULL,
  `neighborhood` VARCHAR(120) NOT NULL COMMENT 'Barrio o sector en Purificación Tolima',
  `address_details` TEXT NOT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `animal_type` ENUM('Perro', 'Gato', 'Equino', 'Fauna Silvestre', 'Otro') NOT NULL DEFAULT 'Perro',
  `urgency` ENUM('urgente', 'moderada', 'leve') NOT NULL DEFAULT 'moderada',
  `description` TEXT NOT NULL,
  `photo_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('recibido', 'en_camino', 'en_atencion', 'rescatado') NOT NULL DEFAULT 'recibido',
  `status_note` TEXT DEFAULT NULL,
  `assigned_rescuer` VARCHAR(150) DEFAULT NULL,
  `reported_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_urgency` (`urgency`),
  KEY `idx_reports_neighborhood` (`neighborhood`),
  KEY `idx_reports_reported_at` (`reported_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. TABLA: health_events (Jornadas de Esterilización, Vacunación y Brigadas)
-- ============================================================================
CREATE TABLE `health_events` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `type` ENUM('vacunacion', 'esterilizacion', 'brigada_salud', 'donacion_alimento') NOT NULL,
  `event_date` VARCHAR(50) NOT NULL,
  `event_time` VARCHAR(50) NOT NULL,
  `location_name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(200) NOT NULL,
  `municipality` VARCHAR(100) NOT NULL DEFAULT 'Purificación, Tolima',
  `description` TEXT NOT NULL,
  `is_free` TINYINT(1) NOT NULL DEFAULT 1,
  `fee_details` VARCHAR(150) DEFAULT NULL,
  `requirements` JSON DEFAULT NULL COMMENT 'Array JSON de requisitos',
  `total_spots` INT UNSIGNED NOT NULL DEFAULT 50,
  `registered_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `contact_phone` VARCHAR(30) NOT NULL,
  `contact_organizer` VARCHAR(120) NOT NULL,
  `status` ENUM('proximo', 'en_curso', 'finalizado') NOT NULL DEFAULT 'proximo',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_type` (`type`),
  KEY `idx_events_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. TABLA: event_registrations (Inscripciones de Mascotas a Eventos/Brigadas)
-- ============================================================================
CREATE TABLE `event_registrations` (
  `id` VARCHAR(50) NOT NULL,
  `event_id` VARCHAR(50) NOT NULL,
  `owner_name` VARCHAR(120) NOT NULL,
  `owner_email` VARCHAR(150) NOT NULL,
  `owner_phone` VARCHAR(30) NOT NULL,
  `owner_neighborhood` VARCHAR(120) NOT NULL,
  `pet_name` VARCHAR(80) NOT NULL,
  `pet_species` VARCHAR(50) NOT NULL,
  `pet_age` VARCHAR(50) NOT NULL,
  `confirmation_code` VARCHAR(30) NOT NULL,
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reg_confirmation_code` (`confirmation_code`),
  KEY `idx_reg_event_id` (`event_id`),
  KEY `idx_reg_owner_email` (`owner_email`),
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `health_events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TABLA: chat_channels (Canales de Chat Comunitario y Urgencias)
-- ============================================================================
CREATE TABLE `chat_channels` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `role_description` VARCHAR(150) NOT NULL,
  `avatar` VARCHAR(500) NOT NULL,
  `type` ENUM('red_rescatistas', 'veterinaria', 'voluntarios', 'general') NOT NULL DEFAULT 'general',
  `online` TINYINT(1) NOT NULL DEFAULT 1,
  `phone` VARCHAR(30) NOT NULL,
  `badge_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_message` VARCHAR(255) DEFAULT NULL,
  `last_message_time` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. TABLA: chat_messages (Mensajes en Canales de Chat)
-- ============================================================================
CREATE TABLE `chat_messages` (
  `id` VARCHAR(50) NOT NULL,
  `channel_id` VARCHAR(50) NOT NULL,
  `sender_id` VARCHAR(50) NOT NULL,
  `sender_name` VARCHAR(120) NOT NULL,
  `sender_role` ENUM('ciudadano', 'voluntario', 'rescatista', 'veterinario', 'sistema') NOT NULL DEFAULT 'ciudadano',
  `avatar` VARCHAR(500) DEFAULT NULL,
  `text` TEXT NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_channel_id` (`channel_id`),
  KEY `idx_msg_created_at` (`created_at`),
  CONSTRAINT `fk_msg_channel` FOREIGN KEY (`channel_id`) REFERENCES `chat_channels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. TABLA: contact_messages (Mensajes de Contacto y Voluntariado)
-- ============================================================================
CREATE TABLE `contact_messages` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pendiente', 'leido', 'respondido') NOT NULL DEFAULT 'pendiente',
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`),
  KEY `idx_contact_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. TABLA: password_resets (Tokens / Códigos de Recuperación de Contraseña)
-- ============================================================================
CREATE TABLE `password_resets` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `reset_code` VARCHAR(10) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reset_email_code` (`email`, `reset_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. VISTAS SQL ÚTILES (Para reportes y dashboards)
-- ============================================================================

-- Vista: Resumen de adopciones disponibles
CREATE OR REPLACE VIEW `vw_pets_available` AS
SELECT 
  p.id,
  p.name,
  p.species,
  p.breed,
  p.gender,
  p.age,
  p.size,
  p.rescuer_name,
  p.rescuer_location,
  p.featured,
  p.created_at,
  COUNT(a.id) AS total_applications
FROM `adoption_pets` p
LEFT JOIN `adoption_applications` a ON p.id = a.pet_id
WHERE p.status = 'disponible'
GROUP BY p.id;

-- Vista: Reportes urgentes activos en Purificación
CREATE OR REPLACE VIEW `vw_urgent_reports` AS
SELECT 
  r.id,
  r.animal_type,
  r.urgency,
  r.neighborhood,
  r.description,
  r.status,
  r.reporter_name,
  r.reporter_phone,
  r.reported_at
FROM `animal_reports` r
WHERE r.urgency = 'urgente' AND r.status != 'rescatado'
ORDER BY r.reported_at DESC;

-- Vista: Disponibilidad de cupos en eventos
CREATE OR REPLACE VIEW `vw_event_spots` AS
SELECT 
  e.id,
  e.title,
  e.type,
  e.event_date,
  e.location_name,
  e.total_spots,
  e.registered_count,
  (e.total_spots - e.registered_count) AS available_spots,
  e.status
FROM `health_events` e
WHERE e.status = 'proximo';

-- Reactivar revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
