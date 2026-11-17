LABORATORIO - REGISTRO E INGRESO DE USUARIOS PARA CONTROL DE TAREAS

En este laboratorio, deberán desarrollar una aplicación web funcional que permita el registro e inicio de sesión de usuarios, con el objetivo de establecer una base sólida para un sistema de control de tareas. La aplicación deberá ser implementada utilizando JavaScript y cualquiera de sus frameworks o bibliotecas (Next.js, Nest.js). Además, se debe integrar el uso de bases de datos, Redis y variables globales para manejar estados compartidos.
Requisitos:
1. Páginas requeridas:
Home: Una página principal que funcione como una bienvenida y punto de entrada al sistema. Aquí pueden incluir información básica sobre la aplicación o links hacia las páginas de registro e inicio de sesión.
Registro: Una página donde los usuarios puedan registrarse proporcionando la información necesaria (por ejemplo: nombre, correo, contraseña).
Inicio de sesión: Una página donde los usuarios registrados puedan iniciar sesión en el sistema.
2. Funcionalidades:
Registro de usuarios:
Al registrarse, los datos del usuario deben almacenarse de manera segura en la base de datos seleccionada.
Las contraseñas deben ser encriptadas antes de guardarlas.
Validar campos obligatorios y gestionar errores de manera amigable (por ejemplo, usuario ya existente).
Inicio de sesión:
Verificar las credenciales del usuario en la base de datos.
Implementar manejo de sesiones o tokens de autenticación (por ejemplo, JWT).
Utilizar Redis para almacenar datos de sesión o tokens si aplica.
Variables globales:
Implementar variables globales para manejar estados compartidos (por ejemplo, usuario autenticado, mensajes de error, etc.).
3. Restricciones:
Solo pueden usar JavaScript y sus frameworks o bibliotecas relacionadas.
La base de datos puede ser a elección (SQL o NoSQL), pero es obligatorio integrar Redis como soporte para alguna funcionalidad (como caché, sesiones o mensajes).
Todo el código debe estar estructurado y limpio.
4. Entregables:
1. Base de datos creada:
a. La estructura de tablas o colecciones necesarias para almacenar los datos de usuarios.
b. Documentación o script para inicializar la base de datos.
2. Código fuente completo:
a. Componentes frontend (si aplican).
b. Servidor backend con endpoints para registro e inicio de sesión.
c. Conexión a la base de datos y Redis.
3. Aplicación funcional:
a. Las tres páginas deben estar operativas.
b. Registro e inicio de sesión deben funcionar correctamente.
Criterios de evaluación:
Correcta implementación del registro e inicio de sesión.
Seguridad básica aplicada (encriptación de contraseñas, manejo de sesiones/tokens)
Uso correcto de variables globales para el flujo de la aplicación.
Organización y claridad del código.
Presentación funcional de las páginas requeridas.
PARTE #2

Gestión y Control de Tareas Asignables entre Usuarios
En esta segunda parte del laboratorio, expandimos la funcionalidad de la aplicación para incluir un sistema de gestión de tareas asignables entre usuarios. Este sistema debe permitir crear tareas, asignarlas a otros usuarios registrados, controlar su estado y registrar detalles como tiempo de asignación y comentarios asociados.
Requisitos:
1. Bases de datos:
Estructura de las tablas o colecciones:
Los estudiantes deberán crear las tablas necesarias para almacenar las siguientes entidades relacionadas con los usuarios registrados:
Tareas: Información básica de la tarea como título, descripción, estado, usuario creador, usuario asignado, y fechas importantes.
Estados de tarea: Una tabla o colección que permita definir y gestionar múltiples estados posibles para las tareas (por ejemplo, "Pendiente", "En Proceso", "Finalizada").
Comentarios: Una tabla o colección para registrar los comentarios realizados sobre una tarea por parte del usuario que la creó o a quien fue asignada.
Las nuevas tablas o colecciones deben estar relacionadas con las creadas previamente para usuarios y sesiones.
2. Funcionalidades:
Gestión de Tareas:
1. Crear tareas:
a. Los usuarios deben poder crear una nueva tarea especificando: título, descripción, usuario asignado, y un estado inicial (como "Pendiente").
b. Registrar la fecha y hora exacta en la que fue creada y asignada.
2. Asignación de tareas:
a. Cada tarea debe estar asociada a un usuario creador y un usuario asignado.
b. Registrar cuánto tiempo ha pasado desde la asignación de la tarea.
3. Estados de tareas:
a. Implementar una lista de estados para las tareas (predefinidos o personalizables).
b. Los usuarios deben poder cambiar el estado de una tarea asignada (por ejemplo, de "Pendiente" a "En Proceso" o "Finalizada").
c. Registrar la fecha y hora del cambio de estado.
Comentarios:
1. Registrar comentarios:
a. Los usuarios pueden agregar comentarios a una tarea.
b. Tanto el usuario que asigna la tarea como el que la recibe pueden añadir comentarios.
c. Cada comentario debe estar relacionado con una tarea específica e incluir la fecha y hora en que fue creado.
Controladores y Endpoints:
1. Endpoints requeridos:
a. Tareas: Endpoints para crear, listar, actualizar, y asignar tareas.
b. Estados: Endpoints para listar y gestionar los estados de las tareas.
c. Comentarios: Endpoints para añadir y listar comentarios asociados a una tarea.
3. Restricciones:
Las bases de datos deben estar diseñadas de manera relacional si se utiliza SQL, o correctamente referenciadas si se usa NoSQL.
Solo se permite el uso de JavaScript y frameworks relacionados (Node.js, Next.js, NestJS, etc.).
Se debe garantizar que únicamente usuarios registrados puedan crear y gestionar tareas.
Redis debe ser integrado para optimizar funcionalidades como el cálculo de tiempos de asignación o para almacenar temporalmente los estados de las tareas.
4. Entregables:
1. Base de datos extendida:
a. Esquema actualizado que incluya las tablas o colecciones para las tareas, estados y comentarios.
b. Documentación o script para inicializar la base de datos extendida.
2. Controladores funcionales:
a. Implementación de controladores y servicios que interactúen con las nuevas tablas o colecciones.
b. Código bien estructurado y limpio para manejar la lógica de creación, asignación y actualización de tareas.
