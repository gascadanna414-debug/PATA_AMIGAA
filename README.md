# 🐾 Pata Amiga - Purificación, Tolima
> **Plataforma Integral de Bienestar Animal, Adopciones, Rescates y Brigadas Veterinarias**

---

## 🛠️ 1. Ficha Técnica y Stack Tecnológico

| Componente | Tecnología Utilizada | Versión / Detalle |
|---|---|---|
| **Lenguaje Principal** | **TypeScript** | `v5.8+` (Tipado estricto, interfaces, enums) |
| **Framework Frontend** | **React** | `v19.0.1` (Hooks, Componentes Funcionales) |
| **Herramienta de Construcción (Bundler)** | **Vite** | `v6.2.3` (Compilación instantánea y HMR) |
| **Framework de Estilos (CSS)** | **Tailwind CSS** | `v4.1.14` (Plugin nativo `@tailwindcss/vite`) |
| **Motor de Base de Datos** | **MySQL / MariaDB** | `MySQL 8.0+` o `MariaDB 10.4+` (InnoDB, UTF8mb4) |
| **Librería de Iconos** | **Lucide React** | `v0.546.0` (Iconografía vectorial moderna) |
| **Librería de Animaciones** | **Motion** | `v12.23.24` (Transiciones fluidas) |
| **Efectos Interactivos** | **Canvas Confetti** | `v1.9.4` (Celebración de adopciones exitosas) |
| **Entorno de Ejecución** | **Node.js** | `v18.0.0` o superior (Recomendado LTS v20+) |

---

## 📋 2. Requisitos Previos del Sistema

Antes de iniciar con la configuración del proyecto, debes tener instalados en tu sistema operativo (Windows, macOS o Linux):

1. **Node.js** (versión `18.x`, `20.x` o superior) con su gestor de paquetes **NPM** (`v9.x` o superior).
   - [Descargar Node.js](https://nodejs.org/)
   - Verifica la instalación ejecutando en tu terminal:
     ```bash
     node -v
     npm -v
     ```
2. **Git** (Para control de versiones y clonación).
   - [Descargar Git](https://git-scm.com/)
3. **Servidor MySQL / MariaDB Local**:
   - Puedes utilizar suites todo-en-uno como **XAMPP**, **WampServer**, **Laragon** o una instalación independiente de **MySQL Server** junto con **MySQL Workbench**.
   - [Descargar XAMPP](https://www.apachefriends.org/)

---

## 🚀 3. Configuración Inicial del Proyecto (Paso a Paso)

### Paso 3.1: Descargar o Clonar el Repositorio
Abre tu terminal o consola de comandos y ubícate en tu carpeta de proyectos:

```bash
# Opción A: Clonar mediante Git
git clone https://github.com/tu-usuario/pata-amiga.git
cd pata-amiga

# Opción B: Si descargaste el archivo .zip, descomprímelo y entra en la carpeta desde la terminal
cd ruta/de/tu/carpeta/pata-amiga
```

---

### Paso 3.2: Instalación de Dependencias
Descarga e instala todos los módulos y librerías definidos en el `package.json`:

```bash
npm install
```

> 💡 **Nota**: Si tu versión de NPM muestra advertencias por compatibilidad de paquetes entre versiones mayores, ejecuta:
> ```bash
> npm install --legacy-peer-deps
> ```

---

### Paso 3.3: Configuración de Variables de Entorno Globales
Crea tu archivo `.env` en la raíz del proyecto a partir de la plantilla `.env.example`:

```bash
# En Windows (CMD / PowerShell):
copy .env.example .env

# En macOS / Linux:
cp .env.example .env
```

Contenido del archivo `.env`:
```env
# Puerto del servidor de desarrollo
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# URL base de la aplicación
APP_URL=http://localhost:3000
```

---

## 🗄️ 4. Configuración de la Base de Datos (MySQL)

La base de datos relacional para **Pata Amiga** se encuentra completamente estructurada en la carpeta `/database`.

### Esquema de Tablas Creadas:
- **`users`**: Usuarios del sistema (Ciudadanos, Voluntarios, Rescatistas, Veterinarios).
- **`adoption_pets`**: Catálogo de perros y gatos en adopción con ficha médica (vacunación, esterilización) y fotos.
- **`adoption_applications`**: Solicitudes de adopción vinculadas por `FOREIGN KEY` a las mascotas.
- **`animal_reports`**: Reportes ciudadanos de emergencias, maltrato y rescate en Purificación.
- **`health_events`**: Brigadas de esterilización, vacunación antirrábica y donatones.
- **`event_registrations`**: Registro de turnos y confirmación de asistencia a las brigadas.
- **`chat_channels` & `chat_messages`**: Canales de chat comunitario y coordinación de urgencias.
- **`success_stories`**: Historias de rescate "Antes y Después" con registro de transformaciones.
- **`contact_messages`**: Mensajes directos recibidos vía formulario de contacto.
- **`password_resets`**: Códigos seguros de recuperación de contraseñas.

---

### Procedimiento de Importación:

#### Opción 1: Desde phpMyAdmin (XAMPP / WampServer / Laragon)
1. Inicia los servicios de **Apache** y **MySQL** desde el panel de control de XAMPP.
2. Abre tu navegador e ingresa a: **`http://localhost/phpmyadmin`**.
3. Haz clic en la pestaña **Importar** (menú superior).
4. Pulsa **Seleccionar archivo**, navega hasta la carpeta del proyecto y selecciona:
   📁 **`database/schema.sql`**
5. Haz clic en el botón inferior **Continuar / Importar**.
6. Repite el mismo procedimiento para cargar el archivo:
   📁 **`database/seeds.sql`** (esto cargará los datos de prueba de Purificación, Tolima).

#### Opción 2: Desde la Línea de Comandos (Terminal)
```bash
# 1. Crear la base de datos y tablas
mysql -u root -p < database/schema.sql

# 2. Cargar datos de prueba
mysql -u root -p < database/seeds.sql
```

#### Opción 3: Desde MySQL Workbench o DBeaver
1. Abre tu gestor SQL y conéctate a tu servidor local.
2. Ve a **File** -> **Open SQL Script** y abre `database/schema.sql`.
3. Presiona el botón del rayo ⚡ (`Ctrl + Shift + Enter`) para ejecutarlo.
4. Abre `database/seeds.sql` y ejecútalo de la misma forma.

---

## ⚙️ 5. Configuración Global de la Aplicación

### 5.1 Enrutamiento y Punto de Entrada (`src/main.tsx` & `src/App.tsx`)
- **Punto de Entrada (`src/main.tsx`)**: Inicializa React 19 con `StrictMode` montando el componente raíz en el elemento `#root` de `index.html`.
- **Enrutamiento Reactivo (`src/App.tsx`)**: Gestiona la navegación sin recargas entre las vistas principales:
  - `home`: Portada, estadísticas, historias de rescate antes/después y donaciones.
  - `adoptions`: Catálogo con filtros avanzados por especie, tamaño, género y edad.
  - `report`: Formulario de reporte de rescates y mapa de ubicación.
  - `events`: Jornadas de esterilización y brigadas con inscripción interactiva.
  - `chat`: Canales de comunicación en vivo con brigadistas y veterinarias.
  - `contact`: Canales de WhatsApp, llamadas de urgencia y cuentas Nequi/Daviplata.

### 5.2 Estilos Globales y Tipografía (`src/index.css`)
- Se importa Tailwind CSS 4 mediante `@import "tailwindcss";`.
- Tipografía oficial cargada desde Google Fonts:
  - **Titulares y Marca**: *Outfit* (Sans-serif moderno de alto impacto).
  - **Cuerpo y Textos**: *Inter* (Legibilidad óptima).
- Paleta cromática armoniosa:
  - **Azul Marino Profundo**: `#0F172A`, `#1E293B`
  - **Azul Pastel / Celeste**: `#BAE6FD`, `#E0F2FE`, `#38BDF8`
  - **Beige Cálido y Crema**: `#FBF8F3`, `#F5EFEB`, `#E8E2D8`

### 5.3 Controladores de Estado y Persistencia (`src/controllers/`)
- **`authController.ts`**: Controla el ciclo de vida de la sesión, almacenamiento local encriptado (`localStorage`), roles y validación de credenciales.
- **`storeController.ts`**: Administra la reactividad de mascotas, filtros, registro de reportes, turnos de eventos e inserción de mensajes de chat en tiempo real.

---

## 🏃 6. Ejecución del Proyecto

### Iniciar en Modo Desarrollo (Local)
Ejecuta el siguiente comando para levantar el servidor de desarrollo:

```bash
npm run dev
```

Abre tu navegador en:
👉 **`http://localhost:3000`**

### Validar Tipos y Sintaxis (TypeScript Lint)
```bash
npm run lint
```

### Compilar para Producción (Build)
Genera el paquete optimizado y minificado para despliegue:
```bash
npm run build
```
Los archivos finales se ubicarán en la carpeta **`/dist`**.

### Previsualizar la Compilación de Producción
```bash
npm run preview
```

---

## 👥 7. Cuentas de Acceso Preconfiguradas para Pruebas

Para probar los diferentes roles y permisos del sistema, puedes iniciar sesión con cualquiera de los siguientes usuarios:

| Rol | Nombre | Correo Electrónico | Contraseña |
|---|---|---|---|
| 🏠 **Ciudadano / Adoptante** | Danna Gasca | `gascadanna414@gmail.com` | `123456` |
| 🩺 **Médico Veterinario** | Dr. Carlos Alarcón | `carlos.alarcon@vetpurificacion.com` | `123456` |
| 🤝 **Voluntario de Jornadas** | María Fernanda Ruiz | `maria.ruiz@voluntarios-tolima.org` | `123456` |
| 🚑 **Rescatista de Campo** | Javier Peña | `javier.rescates@gmail.com` | `123456` |

> ⚡ *Nota: En el modal de inicio de sesión también dispones de un botón rápido de **"Autocompletar"** para probar de inmediato.*

---

## 📁 8. Estructura de Carpetas

```text
pata-amiga/
├── database/                   # Archivos SQL para base de datos MySQL
│   ├── schema.sql              # Estructura DDL, tablas, índices y vistas
│   ├── seeds.sql               # Datos iniciales DML (Purificación, Tolima)
│   └── README.md               # Documentación exclusiva de la base de datos
├── public/                     # Recursos públicos estáticos y favicon
├── src/
│   ├── assets/                 # Imágenes de transformaciones y recursos gráficos
│   ├── components/             # Componentes modulares y vistas
│   │   ├── AdoptionsView.tsx   # Módulo de catálogo y solicitud de adopción
│   │   ├── AuthModal.tsx       # Modales de autenticación y recuperación
│   │   ├── ChatView.tsx        # Módulo de canales de chat comunitario
│   │   ├── ContactView.tsx     # Formulario de contacto, donaciones y Nequi
│   │   ├── EventsView.tsx      # Módulo de brigadas y reserva de turnos
│   │   ├── Footer.tsx          # Pie de página institucional
│   │   ├── HomeView.tsx        # Página de inicio e historias antes/después
│   │   ├── Logo.tsx            # Logo vectorial SVG con branding oficial
│   │   ├── Navbar.tsx          # Barra de navegación principal
│   │   └── ReportView.tsx      # Módulo de reportes y geolocalización
│   ├── controllers/            # Controladores de lógica de negocio y sesión
│   │   ├── authController.ts   # Autenticación y gestión de usuarios
│   │   └── storeController.ts  # Manejo centralizado del estado
│   ├── data/                   # Datos semilla en memoria
│   │   └── initialData.ts      # Colecciones iniciales de datos
│   ├── types/                  # Modelos de datos e interfaces TypeScript
│   │   └── index.ts            # Declaraciones de tipos globales
│   ├── App.tsx                 # Enrutador principal y layout
│   ├── index.css               # Estilos globales con Tailwind CSS
│   └── main.tsx                # Punto de entrada de la aplicación
├── .env.example                # Plantilla de variables de entorno
├── index.html                  # HTML principal
├── package.json                # Dependencias, scripts y configuración npm
├── tsconfig.json               # Configuración de compilación de TypeScript
├── vite.config.ts              # Configuración del servidor y plugins de Vite
└── README.md                   # Esta guía
```

---

## ❓ 9. Preguntas Frecuentes y Solución de Problemas

1. **¿Qué hacer si el puerto 3000 está ocupado?**
   - Puedes liberar el puerto ejecutando `npx kill-port 3000` o especificar otro puerto en Vite (`npm run dev -- --port 3001`).

2. **¿Cómo personalizar la información de contacto y cuentas de donación?**
   - Los números telefónicos y cuentas bancarias de Purificación (Nequi, Daviplata, Bancolombia) se encuentran en `src/components/ContactView.tsx` y `src/data/initialData.ts`.

---

**Pata Amiga** • *Por el respeto y cuidado de los animales en Purificación, Tolima.*
