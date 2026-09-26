# capstone-2026-002D-equipo09 

# Nombre Del Proyecto: MicroLogist

# Descripción del Proyecto :
## Descripción

MicroLogist es una plataforma web orientada a pequeñas y medianas empresas de transporte de pasajeros. Permite centralizar y gestionar información de vehículos, conductores, turnos y documentación obligatoria, incorporando alertas para facilitar el control de vencimientos.

## ¿A quién va dirigido?

Está dirigido principalmente a responsables y propietarios de pequeñas y medianas empresas de transporte urbano, escolar, de trabajadores, estudiantes, viajes particulares y servicios turísticos.

## ¿Qué problema resuelve?

MicroLogist busca solucionar la dificultad de gestionar información operativa y documental que puede encontrarse dispersa en planillas, documentos físicos, calendarios o conversaciones de WhatsApp. Esto dificulta conocer el estado real de la flota y puede provocar olvidos en documentos importantes.

La plataforma centraliza esta información en un solo lugar, facilitando el seguimiento de vehículos, conductores, turnos y vencimientos, ayudando a mejorar la organización y gestión del servicio.



# Tecnologías Utilizadas :

| Tecnología        | Uso                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Next.js**       | Framework principal para desarrollar la aplicación web.                             |
| **React**         | Se utilizará para crear la interfaz de usuario.                                     |
| **TypeScript**    | Se utilizará para desarrollar el código de la aplicación.                           |
| **Tailwind CSS**  | Se utilizará para diseñar la interfaz y adaptarla a distintos dispositivos.         |
| **PostgreSQL**    | Base de datos donde se almacenará la información del sistema.                       |
| **Prisma ORM**    | Se utilizará para conectar la aplicación con la base de datos y realizar consultas. |
| **Supabase**      | Se utilizará para alojar la base de datos y gestionar servicios del sistema.        |
| **Supabase Auth** | Se utilizará para gestionar el inicio de sesión y la autenticación de usuarios.     |
| **Zod**           | Se utilizará para validar los datos ingresados en el sistema.                       |
| **Vercel**        | Se utilizará para desplegar y alojar la aplicación web.                             |
| **GitHub**        | Se utilizará para almacenar el código y gestionar el trabajo del equipo.            |






# Instrucciones Para Ejecutar Localmente :

Requisitos
Node.js 24 o superior (versión usada por el equipo: 24)
npm (se instala junto con Node.js)
Git

Instalación
Clonar el repositorio (se recomienda una carpeta fuera de OneDrive, por ejemplo C:\Proyectos):

   
   git clone https://github.com/josemarcelovg/capstone-2026-002D-equipo09.git
   cd capstone-2026-002D-equipo09

2. Instalar las dependencias:

npm install
3. Crear el archivo de variables de entorno a partir del ejemplo:

cp .env.example .env

   Los valores se completarán cuando se configure Supabase. El archivo .env nunca se sube al repositorio.

Ejecución

┌───────────────┬───────────────────────────────────────┐
│    Comando    │            Para qué sirve             │
├───────────────┼───────────────────────────────────────┤
│ npm run dev   │ Inicia el servidor de desarrollo      │
├───────────────┼───────────────────────────────────────┤
│ npm run build │ Compila la aplicación para producción │
├───────────────┼───────────────────────────────────────┤
│ npm run start │ Ejecuta la versión compilada          │
├───────────────┼───────────────────────────────────────┤
│ npm run lint  │ Revisa el código con ESLint           │
└───────────────┴───────────────────────────────────────┘

Con npm run dev, abrir http://localhost:3000 en el navegador.

▎ ⚠️ Usar la dirección localhost y no la que aparece como "Network": Next.js bloquea esa dirección en modo desarrollo y la página se ve vacía.

Estructura del repositorio

┌───────────┬─────────────────────────────────────┐
│  Carpeta  │              Contenido              │
- npm (se instala junto con Node.js)
- Git

### Instalación

1. Clonar el repositorio (se recomienda una carpeta fuera de OneDrive, por ejemplo `C:\Proyectos`):

   
bash
   git clone https://github.com/josemarcelovg/capstone-2026-002D-equipo09.git
   cd capstone-2026-002D-equipo09

Instalar las dependencias:

npm install
Crear el archivo de variables de entorno a partir del ejemplo:

cp .env.example .env

   Los valores se completarán cuando se configure Supabase. El archivo .env nunca se sube al repositorio.

Ejecución

┌───────────────┬───────────────────────────────────────┐
│    Comando    │            Para qué sirve             │
├───────────────┼───────────────────────────────────────┤
│ npm run dev   │ Inicia el servidor de desarrollo      │
├───────────────┼───────────────────────────────────────┤
│ npm run build │ Compila la aplicación para producción │
├───────────────┼───────────────────────────────────────┤
│ npm run start │ Ejecuta la versión compilada          │
├───────────────┼───────────────────────────────────────┤
│ npm run lint  │ Revisa el código con ESLint           │
└───────────────┴───────────────────────────────────────┘

Con npm run dev, abrir http://localhost:3000/ en el navegador.

▎ ⚠️ Usar la dirección localhost y no la que aparece como "Network": Next.js bloquea esa dirección en modo desarrollo y la página se ve vacía.

Estructura del repositorio

┌───────────┬─────────────────────────────────────┐
│  Carpeta  │              Contenido              │
├───────────┼─────────────────────────────────────┤
│ src/app/  │ Páginas y rutas de la aplicación    │
├───────────┼─────────────────────────────────────┤
│ public/   │ Imágenes y archivos estáticos       │
├───────────┼─────────────────────────────────────┤
│ docs/     │ Documentación del proyecto por fase │
├───────────┼─────────────────────────────────────┤
│ database/ │ Scripts y recursos de base de datos │
├───────────┼─────────────────────────────────────┤
│ docker/   │ Configuración de Docker             │
├───────────┼─────────────────────────────────────┤
│ tests/    │ Pruebas                             │
└───────────┴─────────────────────────────────────┘


# Integrantes Del Equipo Con Sus Roles:

## Simon Jofre(Scrum Master)
## Joaquin Orellana(Product Owner)
## Jose Vargas(Developer)

# Metodología de Trabajo: Para el desarrollo del proyecto se utilizará una metodología ágil e incremental, tomando como referencia algunos principios de Scrum. La idea es trabajar por etapas cortas, avanzando poco a poco y revisando constantemente lo que se va desarrollando. Primero se validará el problema y se definirán los requisitos principales. Después se evaluarán las tecnologías y la infraestructura que se utilizarán, se diseñará la solución y se comenzará con el desarrollo de un producto mínimo viable. Finalmente, se realizarán pruebas, correcciones, documentación y la presentación final del proyecto.

