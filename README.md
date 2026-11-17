# Bootcamp TalentoTech
![alt text](image.png)

## 🚀 TaskPulse - Sistema de Gestión y Control de Tareas Asignables

Proyecto desarrollado para el laboratorio de evaluación de **TalentoTech**, implementando un sistema web completo de registro, inicio de sesión, asignación colaborativa, control de estados, cálculo de tiempos con Redis, tablero Kanban con arrastrar y soltar (Drag & Drop) y auditoría de tareas entre usuarios.

---

## 📊 Estado del Reto hasta el Momento

| Componente | Requisito del Reto | Estado | Detalle de la Solución Implementada |
| :--- | :--- | :---: | :--- |
| **Parte 1** | Página Home (`/`) | ✅ **100%** | Página de bienvenida interactiva, resumen de arquitectura, stack tecnológico y accesos directos. |
| **Parte 1** | Página de Registro (`/register`) | ✅ **100%** | Formulario con validación de campos obligatorios, gestión de correos duplicados y alertas dinámicas. |
| **Parte 1** | Página de Inicio de Sesión (`/login`) | ✅ **100%** | Verificación segura de credenciales, feedback en tiempo real y selector rápido de usuarios de prueba. |
| **Parte 1** | Encriptación de Contraseñas | ✅ **100%** | Cifrado unidireccional con algoritmo `bcrypt` (10 rondas de salt) antes de almacenar en la base de datos. |
| **Parte 1** | Tokens JWT y Sesiones en Redis | ✅ **100%** | Generación de Bearer Token JWT y almacenamiento de sesión activa en Redis (`session:user:<id>`). |
| **Parte 1** | Variables Globales / Estado Compartido | ✅ **100%** | Manejo de estado global con Context API para usuario autenticado, tokens de sesión y alertas. |
| **Parte 2** | Estructura Relacional de BD | ✅ **100%** | Esquema normalizado en PostgreSQL (`users`, `tasks`, `task_statuses`, `task_comments`, `task_status_history`). |
| **Parte 2** | Creación y Asignación de Tareas | ✅ **100%** | Modal interactivo para crear tareas, asignar a compañeros y registrar fechas y horas exactas. |
| **Parte 2** | Tablero Kanban y Drag & Drop | ✅ **100%** | Tablero visual de 4 columnas con funcionalidad interactiva de arrastrar y soltar tarjetas para cambiar estados. |
| **Parte 2** | Cálculo de Tiempos con Redis | ✅ **100%** | Cálculo dinámico y acelerado en memoria del tiempo transcurrido desde la asignación (`timeSinceAssignment`). |
| **Parte 2** | Control de Estados de Tarea | ✅ **100%** | Transiciones en tiempo real (`Pendiente`, `En Proceso`, `En Revisión`, `Finalizada`) con registro de auditoría. |
| **Parte 2** | Comentarios Bidireccionales | ✅ **100%** | Hilo de comentarios colaborativos entre el creador y el asignado con fecha y hora exacta. |
| **Parte 2** | Endpoints REST en NestJS | ✅ **100%** | API REST modular con controladores, servicios, DTOs con `class-validator` y guardas `JwtAuthGuard`. |
| **DevOps** | Contenedores Docker Compose | ✅ **100%** | Orquestación integral de 4 servicios: Frontend + Backend + PostgreSQL + Redis en un solo comando. |

---

## 👥 Usuarios de Prueba Creados para Evaluación

Para facilitar la revisión y pruebas del laboratorio sin necesidad de registrar nuevos usuarios manualmente, el sistema cuenta con **usuarios semilla preconfigurados**:

> [!IMPORTANT]
> **Contraseña universal para todas las cuentas de prueba:** `Password123!`
> *(Con **P** mayúscula y signo de exclamación **!** al final).*

| Nombre | Correo Electrónico | Rol sugerido | Propósito en la Prueba |
| :--- | :--- | :--- | :--- |
| **Sofía Romero** | `sofia@taskpulse.io` | Fullstack Dev | Crear tareas, comentar y asignar a compañeros del equipo |
| **Carlos Mendoza** | `carlos@taskpulse.io` | DevOps Lead | Probar tareas asignadas en estado *Pendiente* y optimizaciones Redis |
| **Mariana Silva** | `mariana@taskpulse.io` | Frontend Architect | Probar tareas en estado *En Proceso* y avanzar a *Finalizada* |
| **Diego Torres** | `diego@taskpulse.io` | QA Automation | Probar tareas completadas e historial de transiciones |
| **Elena Morales** | `elena@taskpulse.io` | Tech Lead | Creadora de tareas técnicas y supervisión general |
| **Admin TalentoTech** | `admin@taskpulse.io` | Administrador | Supervisión general del sistema |

> [!TIP]
> **Acceso de 1 Clic en la Interfaz**: En la pantalla de inicio de sesión (`/login`), se incluye una barra con botones de acceso rápido para cada usuario de prueba. Al pulsar cualquiera de ellos (Sofía, Carlos, Mariana, Diego o Elena), el correo y la contraseña se autocompletan de inmediato.

---

## ⚙️ Auto-Sembrado y Resiliencia de Datos

El backend incluye un servicio automático de inicialización (`DatabaseSeedService`):
1. **Verificación en el arranque**: Cada vez que el backend arranca (sea en Docker o en local), comprueba si los 6 usuarios de prueba y los estados existen en PostgreSQL.
2. **Auto-recuperación**: Si la base de datos está vacía, inserta automáticamente los usuarios con el hash válido de `bcrypt` y las tareas de muestra. Si ya existen, sincroniza sus contraseñas para asegurar que `Password123!` funcione siempre.
3. **Botón en la interfaz**: También puedes pulsar el botón `🌱 Cargar Datos Semilla Ahora` directamente en la pantalla de inicio de sesión o acceder al endpoint `http://localhost:3001/api/seed`.

---

## 🧪 Casos de Prueba Paso a Paso para la Evaluación

### Caso 1: Inicio de Sesión y Autenticación con Redis
1. Ingresa a [http://localhost:3000/login](http://localhost:3000/login).
2. Haz clic en el botón de prueba **"Sofía"** (o escribe `sofia@taskpulse.io` con `Password123!`).
3. Presiona **"Entrar al Espacio de Trabajo"**.
4. El sistema verificará la contraseña con `bcrypt`, generará el JWT y registrará la sesión activa en Redis (`session:user:1`).
5. Se redireccionará automáticamente al tablero principal (`/dashboard`).

### Caso 2: Tablero Kanban Interactivo (Drag & Drop)
1. Estando en el Dashboard, haz clic sostenido sobre cualquier tarjeta de tarea.
2. Arrástrala y suéltala en otra columna (por ejemplo de **"Pendiente"** a **"En Proceso"** o **"Finalizada"**).
3. El estado se actualizará de inmediato en la interfaz y se sincronizará automáticamente en la base de datos y en Redis.

### Caso 3: Crear y Asignar una Tarea
1. En el Dashboard, pulsa el botón **"+ Nueva Tarea"**.
2. Escribe un título (ej: *Optimizaciones de performance en Redis*), descripción y selecciona como asignado a **"Carlos Mendoza"**.
3. Haz clic en **"Crear Tarea"**.
4. La tarea se registrará con fecha y hora exacta (`assigned_at`).
5. El sistema calculará dinámicamente el tiempo transcurrido desde la asignación con soporte y caché en Redis.

### Caso 4: Cambio de Estado y Auditoría Histórica
1. Cierra sesión y entra como **Carlos Mendoza** (`carlos@taskpulse.io` / `Password123!`).
2. Ve a la pestaña **"Asignadas a mí"**. Verás la tarea asignada por Sofía.
3. Cambia el estado (arrastrando la tarjeta o mediante el selector desplegable).
4. Haz clic en la tarea para abrir el detalle y verifica la sección **"Historial de Cambios"**, donde queda registrado el timestamp exacto y quién realizó el cambio.

### Caso 5: Comentarios Colaborativos
1. En la vista de detalle de la tarea, escribe un comentario (ej: *Comencé a trabajar en la configuración del cliente Redis*).
2. Pulsa **"Comentar"**.
3. El comentario quedará visible al instante con el nombre del autor, rol y hora exacta de publicación.

### Caso 6: Registro de Nuevo Usuario
1. Dirígete a [http://localhost:3000/register](http://localhost:3000/register).
2. Ingresa un nuevo nombre, correo y contraseña (mínimo 6 caracteres).
3. Valida la verificación de campos requeridos y el manejo amigable de correos duplicados.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons).
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript, TypeORM, Passport, JWT, Bcrypt, Class-Validator).
- **Base de Datos**: [PostgreSQL 16](https://www.postgresql.org/) con relaciones foráneas, constraints e índices optimizados.
- **Caché y Sesiones**: [Redis 7](https://redis.io/) para sesiones concurrentes y cálculo acelerado de tiempos de asignación.
- **Infraestructura**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/).

---

## 🌐 Endpoints de la API REST (NestJS)

Todas las rutas privadas requieren el encabezado `Authorization: Bearer <token_jwt>`.

### Autenticación & Usuarios
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Público | Registro de nuevos usuarios con encriptación bcrypt |
| `POST` | `/api/auth/login` | Público | Validación de credenciales, emisión de JWT y sesión en Redis |
| `POST` | `/api/auth/logout` | Privado | Invalida y elimina la sesión activa en Redis |
| `GET` | `/api/auth/profile` | Privado | Retorna los datos del usuario autenticado |
| `GET` | `/api/users` | Privado | Lista de usuarios registrados para el selector de asignación |

### Tareas, Estados, Semilla & Comentarios
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/tasks/statuses` | Privado | Obtiene la lista de estados (`Pendiente`, `En Proceso`, `Finalizada`) |
| `GET` | `/api/tasks` | Privado | Lista tareas con filtros (`all`, `assigned`, `created`) |
| `POST` | `/api/tasks` | Privado | Crea una nueva tarea asignada a un compañero |
| `GET` | `/api/tasks/:id` | Privado | Detalle de tarea con comentarios e historial de auditoría |
| `PATCH` | `/api/tasks/:id/status` | Privado | Actualiza el estado de la tarea y genera registro de auditoría |
| `PATCH` | `/api/tasks/:id/assign` | Privado | Reasigna la tarea a otro usuario y reinicia timer en Redis |
| `GET` | `/api/tasks/:id/comments` | Privado | Lista los comentarios asociados a una tarea |
| `POST` | `/api/tasks/:id/comments` | Privado | Añade un comentario a la tarea |
| `GET` | `/api/seed` | Público | Inicializa y verifica los datos semilla en la base de datos |

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción A: Con Docker Compose (Recomendado - 1 Solo Comando)

Levanta todos los servicios interconectados (Frontend, Backend, PostgreSQL y Redis):

```bash
docker-compose up --build
```

Una vez iniciado:
- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **PostgreSQL**: Puerto `5432` (`task_management_db`)
- **Redis**: Puerto `6379`

> [!NOTE]
> Si deseas reiniciar los contenedores eliminando volúmenes previos para un inicio 100% limpio desde cero:
> ```bash
> docker-compose down -v
> docker-compose up --build
> ```

---

### Opción B: Modo Desarrollo Local (Sin Docker)

#### Prerrequisitos:
- Instancia local de PostgreSQL (puerto `5432`).
- Instancia local de Redis (puerto `6379`).
- Node.js v20+.

#### 1. Base de Datos:
Ejecuta el script SQL `database/init.sql` en tu gestor PostgreSQL (pgAdmin, DBeaver o `psql`).

#### 2. Backend (NestJS):
```bash
cd backend
npm install
npm run seed     # Siembra o actualiza usuarios y tareas de prueba
npm run start:dev
```
*API disponible en: `http://localhost:3001/api`.*

#### 3. Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```
*Aplicación disponible en: `http://localhost:3000`.*

---

## 📁 Estructura del Proyecto

```text
GestionyControldeTareas/
├── backend/                       # API REST con NestJS
│   ├── src/
│   │   ├── auth/                  # Registro, Login, JWT, Passport, Guards
│   │   ├── users/                 # Consulta y listado de usuarios
│   │   ├── tasks/                 # Creación, estados, comentarios y asignación
│   │   ├── redis/                 # Cliente Redis (Sesiones y cálculo de tiempos)
│   │   ├── database/              # Entidades TypeORM y servicio de semilla
│   │   ├── app.controller.ts      # Controlador raíz y endpoints de estado / semilla
│   │   ├── app.module.ts          # Módulo principal
│   │   └── main.ts                # Inicialización y ValidationPipes
│   ├── Dockerfile
│   └── package.json
├── frontend/                      # Cliente Web con Next.js (App Router)
│   ├── app/
│   │   ├── page.tsx               # Landing / Bienvenida
│   │   ├── login/page.tsx         # Inicio de sesión con credenciales demo
│   │   ├── register/page.tsx      # Registro seguro con validaciones
│   │   ├── dashboard/page.tsx     # Tablero Kanban interactivo (Drag & Drop), métricas y filtros
│   │   ├── management/page.tsx    # Vista detallada de gestión y auditoría
│   │   └── layout.tsx             # Layout global
│   ├── components/                # AuthPortal, TaskManagementView, Navbar, AlertBanner
│   ├── context/                   # AuthContext (Variables globales y estado compartido)
│   ├── lib/                       # Cliente HTTP Fetch con interceptores
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql                   # DDL con tablas, índices y datos semilla
├── docker-compose.yml             # Orquestación de Frontend, Backend, Postgres y Redis
├── .env.example                   # Variables de entorno de referencia
├── Reto.md                        # Enunciado y requerimientos del laboratorio
└── README.md                      # Documentación completa y guía de evaluación
```
