# 🐾 Base de Datos MySQL - Pata Amiga (Purificación, Tolima)

Este directorio contiene el script completo DDL (Estructura y Tablas) y DML (Datos Iniciales / Seeds) para desplegar la base de datos relacional de **Pata Amiga** en cualquier servidor **MySQL 8.0+** o **MariaDB 10.4+**.

---

## 📁 Archivos Incluidos

1. **`schema.sql`**: Contiene la definición de la base de datos `pata_amiga_db`, tablas con llaves primarias, foráneas, índices, restricciones y vistas (`VIEWS`) optimizadas.
2. **`seeds.sql`**: Contiene los registros iniciales de usuarios, historias de éxito de Purificación Tolima, mascotas en adopción, eventos de salud/esterilización, reportes de rescate y canales de chat.

---

## 📋 Diagrama de Entidades y Tablas

| Tabla | Descripción | Llave Primaria |
|---|---|---|
| `users` | Usuarios registrados (Ciudadanos, Voluntarios, Rescatistas, Veterinarios) | `id` |
| `success_stories` | Historias de antes y después con fotos y familias adoptantes | `id` |
| `adoption_pets` | Perros y gatos disponibles para adopción en Purificación | `id` |
| `adoption_applications` | Formularios y postulaciones de adopción de ciudadanos | `id` (FK `pet_id`) |
| `animal_reports` | Casos de emergencia, rescate, animales heridos o abandonados | `id` |
| `health_events` | Jornadas de esterilización, vacunación antirrábica y brigadas | `id` |
| `event_registrations` | Inscripción y asignación de turnos a jornadas veterinarias | `id` (FK `event_id`) |
| `chat_channels` | Canales temáticos (Rescatistas, Clínicas, Voluntarios) | `id` |
| `chat_messages` | Mensajes comunitarios en tiempo real y fotos adjuntas | `id` (FK `channel_id`) |
| `contact_messages` | Mensajes directos recibidos a través del formulario de contacto | `id` |
| `password_resets` | Códigos de 6 dígitos para recuperación de acceso | `id` |

---

## 🚀 Instrucciones de Instalación

### Opción 1: Desde la Terminal (Línea de Comandos MySQL)

```bash
# 1. Iniciar sesión en MySQL y ejecutar el script de creación
mysql -u root -p < database/schema.sql

# 2. Insertar los datos iniciales
mysql -u root -p < database/seeds.sql
```

### Opción 2: Desde phpMyAdmin (XAMPP / WampServer / cPanel)

1. Abre tu panel de **phpMyAdmin** en el navegador (`http://localhost/phpmyadmin`).
2. Haz clic en la pestaña superior **Importar** (Import).
3. Selecciona el archivo `database/schema.sql` y pulsa **Continuar** (Go).
4. Repite el paso anterior con `database/seeds.sql` para cargar los datos de prueba.

### Opción 3: Desde MySQL Workbench o DBeaver

1. Conéctate a tu instancia local o remota de MySQL.
2. Ve a **File** -> **Open SQL Script...** y selecciona `schema.sql`.
3. Ejecuta todo el script con el botón del rayo ⚡ (`Ctrl + Shift + Enter`).
4. Abre `seeds.sql` y ejecútalo para poblar las tablas.

---

## 🔍 Vistas SQL Integradas (Views)

El esquema incluye 3 vistas prediseñadas para consultas rápidas:

```sql
-- 1. Consultar mascotas disponibles junto al total de solicitudes recibidas:
SELECT * FROM vw_pets_available;

-- 2. Listar emergencias de atención inmediata en Purificación:
SELECT * FROM vw_urgent_reports;

-- 3. Ver cupos disponibles en próximas brigadas de esterilización:
SELECT * FROM vw_event_spots;
```
