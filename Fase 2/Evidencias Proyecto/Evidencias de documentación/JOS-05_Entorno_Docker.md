# JOS-05 · Entorno de desarrollo con Docker

| | |
|---|---|
| **Tarea** | [JOS-05] Configurar entorno Docker |
| **Responsable** | José Vargas (Developer) |
| **Revisión** | Simón Jofré o Joaquín Orellana (levantar el entorno en su computador) |
| **Estado** | En revisión |
| **Fecha** | 16-10-2026 |

Con un solo comando, Docker levanta MicroLogist y una base de datos PostgreSQL propia, con las tablas y los datos de prueba ya cargados. **No necesita las claves de Supabase**: cualquier integrante, o la profesora, puede ejecutar la aplicación sin pedir credenciales.

---

## 1. Qué levanta

| Servicio | Imagen | Puerto en el computador | Para qué |
|---|---|---|---|
| `db` | `postgres:17` | `5432` | Base de datos local. Sus datos quedan en el volumen `datos-postgres` y se mantienen entre reinicios. |
| `app` | Se construye con `docker/Dockerfile` (Node.js 24) | `3000` | La aplicación en modo desarrollo (`next dev`). |

Al arrancar, `app` espera a que la base de datos esté lista y ejecuta `docker/iniciar.sh`:

1. `prisma migrate deploy`: crea o actualiza las tablas con las migraciones de `prisma/migrations/` (JOS-02).
2. `npm run db:seed`: carga las dos empresas ficticias y sus vehículos. No duplica datos si ya están.
3. `npm run dev`: inicia la aplicación.

Archivos:

| Archivo | Contenido |
|---|---|
| `docker/compose.yaml` | Los dos servicios, sus variables y puertos. |
| `docker/Dockerfile` | La imagen de la aplicación. |
| `docker/iniciar.sh` | Lo que hace la aplicación al arrancar. |
| `.dockerignore` | Lo que no entra a la imagen. Entre otras cosas, **los archivos `.env`**: las credenciales nunca quedan dentro de una imagen. |
| `.gitattributes` | Obliga a guardar los `.sh` con fin de línea LF. Si se guardaran con el de Windows (CRLF), el script fallaría dentro del contenedor. |

---

## 2. Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y abierto. En Windows usa WSL 2; el instalador lo configura.
- Al menos 8 GB de RAM recomendados. Con menos funciona, pero más lento.
- Conexión a internet la primera vez, para descargar las imágenes y las dependencias.

---

## 3. Uso

Todos los comandos se ejecutan desde la carpeta raíz del proyecto.

| Para… | Comando |
|---|---|
| Levantar todo (la primera vez tarda unos minutos) | `docker compose -f docker/compose.yaml up --build` |
| Abrir la aplicación | http://localhost:3000 |
| Detener | `Ctrl + C` en la terminal, o `docker compose -f docker/compose.yaml down` |
| Ver cambios del código | Volver a ejecutar el comando de levantar, con `--build` |
| Borrar los datos y empezar de cero | `docker compose -f docker/compose.yaml down -v` y levantar de nuevo |
| Levantar solo la base de datos | `docker compose -f docker/compose.yaml up db` |

### 3.1 Probar con la otra empresa

Mientras no exista el inicio de sesión (SIM-02), la aplicación trabaja con la empresa de `EMPRESA_DESARROLLO_ID`, que por defecto es la Empresa A del seed. Para probar la separación entre empresas, crear el archivo `docker/.env` (no se sube al repositorio) con:

```
EMPRESA_DESARROLLO_ID=b0000000-0000-4000-8000-000000000002
```

y levantar de nuevo. Al borrar el archivo, vuelve a la Empresa A.

### 3.2 Programar usando la base de datos de Docker

Docker sirve para **levantar y revisar** la aplicación. Para programar a diario conviene seguir con `npm run dev` en el computador: la guía de Next.js advierte que en Windows y macOS los cambios de archivos tardan en llegar a un contenedor y la recarga automática se vuelve lenta.

Para programar sin Supabase:

1. `docker compose -f docker/compose.yaml up db` (solo la base de datos).
2. En el `.env`, usar las direcciones locales que están comentadas en `.env.example`.
3. `npm run db:deploy`, `npm run db:seed` y `npm run dev` como siempre.

---

## 4. Variables

`docker/compose.yaml` define todas las variables que necesita, así que **no hace falta un `.env`** para usar Docker. Ninguna es secreta.

| Variable | Valor en Docker | Para qué |
|---|---|---|
| `DATABASE_URL` y `DIRECT_URL` | `postgresql://micrologist:micrologist@db:5432/micrologist` | Conexión a la base local (`db` es el nombre del servicio dentro de Docker). |
| `EMPRESA_DESARROLLO_ID` | Empresa A del seed, salvo que `docker/.env` diga otra | Empresa de trabajo hasta SIM-02. |
| `DB_PUERTO` y `APP_PUERTO` | `5432` y `3000` | Puertos en el computador. Se cambian en `docker/.env` si ya están ocupados. |

Los valores de `micrologist` son credenciales solo de esta base local: no dan acceso a nada fuera de Docker.

Cuando exista el inicio de sesión (SIM-02), Supabase Auth necesitará `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Cómo se entregan en Docker se define en esa tarea **[POR CONFIRMAR]**.

---

## 5. Problemas frecuentes

| Síntoma | Solución |
|---|---|
| `port is already allocated` en 5432 o 3000 | Otro programa usa ese puerto. Crear `docker/.env` con `DB_PUERTO=5433` o `APP_PUERTO=3001` y levantar de nuevo. |
| `Cannot connect to the Docker daemon` o `docker: command not found` | Docker Desktop no está abierto o no está instalado. |
| `sh: docker/iniciar.sh: not found` o `set: Illegal option -` | El script quedó con fin de línea de Windows. Ejecutar `git checkout -- docker/iniciar.sh` para recuperarlo con LF y levantar con `--build`. |
| La página no muestra vehículos | Revisar en la terminal que aparezcan "Aplicando migraciones..." y "Seed listo". Si hubo un error, `down -v` y levantar de nuevo. |

---

## 6. Checklist de JOS-05

- [x] Configuración Docker del entorno de desarrollo en la carpeta `docker/` (sección 1).
- [x] Variables documentadas en `.env.example` y en este documento, sin valores secretos (sección 4).
- [x] README actualizado con los pasos para ejecutar con Docker.
- [ ] Otro integrante levanta el entorno siguiendo estas instrucciones y deja evidencia en el PR.
