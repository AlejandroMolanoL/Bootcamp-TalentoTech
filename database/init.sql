-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL
-- PROYECTO: GESTIÓN Y CONTROL DE TAREAS (TalentoTech)
-- ============================================================================

-- Crear extensiones necesarias si aplica
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: users (Usuarios del sistema)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda rápida por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TABLA: task_statuses (Estados de las tareas)
CREATE TABLE IF NOT EXISTS task_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: tasks (Tareas asignables entre usuarios)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status_id INT NOT NULL REFERENCES task_statuses(id) ON DELETE RESTRICT,
    created_by_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes de tareas
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status_id);

-- 4. TABLA: task_comments (Comentarios en tareas)
CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON task_comments(task_id);

-- 5. TABLA: task_status_history (Registro histórico de cambios de estado)
CREATE TABLE IF NOT EXISTS task_status_history (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    changed_by_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_status_id INT REFERENCES task_statuses(id),
    new_status_id INT NOT NULL REFERENCES task_statuses(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_task_id ON task_status_history(task_id);

-- ============================================================================
-- DATOS SEMILLA (SEED DATA)
-- ============================================================================

-- 1. Insertar los estados básicos de tareas si no existen
INSERT INTO task_statuses (id, name, description, is_default, color)
VALUES 
    (1, 'Pendiente', 'La tarea ha sido asignada pero no iniciada.', TRUE, '#F59E0B'),
    (2, 'En Proceso', 'La tarea se encuentra actualmente en desarrollo.', FALSE, '#3B82F6'),
    (3, 'Finalizada', 'La tarea ha sido completada satisfactoriamente.', FALSE, '#10B981')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_default = EXCLUDED.is_default,
    color = EXCLUDED.color;

-- Ajustar la secuencia de task_statuses
SELECT setval('task_statuses_id_seq', (SELECT GREATEST(MAX(id), 1) FROM task_statuses));

-- 2. Insertar usuarios de prueba para evaluaciones y testing
-- Contraseña para todos los usuarios semilla: Password123!
-- Hash bcrypt (10 rounds): $2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W
INSERT INTO users (name, email, password)
VALUES 
    ('Sofía Romero', 'sofia@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W'),
    ('Carlos Mendoza', 'carlos@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W'),
    ('Mariana Silva', 'mariana@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W'),
    ('Diego Torres', 'diego@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W'),
    ('Elena Morales', 'elena@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W'),
    ('Admin TalentoTech', 'admin@taskpulse.io', '$2b$10$r32JGeR5wXZt991gLo6aNOmvXTGOZTEotMnwjJWk3FwkR6FAG1P3W')
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name,
    password = EXCLUDED.password;

-- Ajustar la secuencia de users
SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 1) FROM users));

-- 3. Insertar tareas de prueba iniciales referenciando a los usuarios por email
INSERT INTO tasks (title, description, status_id, created_by_id, assigned_to_id, created_at, assigned_at)
SELECT 
    'Indexar esquemas de sesiones y caché en Redis',
    'Configurar estructura de llaves session:user:<id> con TTL de 24 horas y optimizar el cálculo de tiempos transcurridos en memoria.',
    1,
    u_creator.id,
    u_assignee.id,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
FROM users u_creator, users u_assignee
WHERE u_creator.email = 'elena@taskpulse.io' AND u_assignee.email = 'carlos@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Indexar esquemas de sesiones y caché en Redis');

INSERT INTO tasks (title, description, status_id, created_by_id, assigned_to_id, created_at, assigned_at)
SELECT 
    'Implementar interfaz de gestión y tablero de tareas',
    'Desarrollar vistas React con Tailwind CSS para listar tareas, filtrar por asignación y permitir cambio de estado con auditoría.',
    2,
    u_creator.id,
    u_assignee.id,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
FROM users u_creator, users u_assignee
WHERE u_creator.email = 'sofia@taskpulse.io' AND u_assignee.email = 'mariana@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Implementar interfaz de gestión y tablero de tareas');

INSERT INTO tasks (title, description, status_id, created_by_id, assigned_to_id, created_at, assigned_at)
SELECT 
    'Pruebas de endpoints REST y seguridad JWT',
    'Verificar el ciclo completo de registro, login, emisión de JWT y protección de endpoints con JwtAuthGuard en NestJS.',
    3,
    u_creator.id,
    u_assignee.id,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
FROM users u_creator, users u_assignee
WHERE u_creator.email = 'elena@taskpulse.io' AND u_assignee.email = 'diego@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Pruebas de endpoints REST y seguridad JWT');

-- Ajustar la secuencia de tasks
SELECT setval('tasks_id_seq', (SELECT GREATEST(MAX(id), 1) FROM tasks));

-- 4. Insertar comentarios de ejemplo
INSERT INTO task_comments (task_id, user_id, content, created_at)
SELECT t.id, u.id, 'Hola Carlos, por favor valida que la clave de Redis expire en 86400 segundos.', NOW() - INTERVAL '1 day 20 hours'
FROM tasks t, users u
WHERE t.title LIKE '%Redis%' AND u.email = 'elena@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM task_comments tc WHERE tc.task_id = t.id AND tc.user_id = u.id AND tc.content LIKE '%Hola Carlos%');

INSERT INTO task_comments (task_id, user_id, content, created_at)
SELECT t.id, u.id, 'Listo Elena, ya configuré el RedisService con ioredis y el cálculo de tiempo dinámico.', NOW() - INTERVAL '1 day 18 hours'
FROM tasks t, users u
WHERE t.title LIKE '%Redis%' AND u.email = 'carlos@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM task_comments tc WHERE tc.task_id = t.id AND tc.user_id = u.id AND tc.content LIKE '%Listo Elena%');

INSERT INTO task_comments (task_id, user_id, content, created_at)
SELECT t.id, u.id, 'Mariana, recuerda agregar el indicador visual del tiempo transcurrido desde la asignación.', NOW() - INTERVAL '20 hours'
FROM tasks t, users u
WHERE t.title LIKE '%interfaz%' AND u.email = 'sofia@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM task_comments tc WHERE tc.task_id = t.id AND tc.user_id = u.id AND tc.content LIKE '%Mariana%');

SELECT setval('task_comments_id_seq', (SELECT GREATEST(MAX(id), 1) FROM task_comments));

-- 5. Insertar historial de estados de ejemplo
INSERT INTO task_status_history (task_id, changed_by_id, previous_status_id, new_status_id, changed_at)
SELECT t.id, u.id, 1, 2, NOW() - INTERVAL '18 hours'
FROM tasks t, users u
WHERE t.title LIKE '%interfaz%' AND u.email = 'mariana@taskpulse.io'
AND NOT EXISTS (SELECT 1 FROM task_status_history tsh WHERE tsh.task_id = t.id AND tsh.changed_by_id = u.id);

SELECT setval('task_status_history_id_seq', (SELECT GREATEST(MAX(id), 1) FROM task_status_history));

