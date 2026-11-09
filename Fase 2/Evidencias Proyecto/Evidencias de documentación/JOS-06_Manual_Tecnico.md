# JOS-06 · Manual técnico de MicroLogist

| | |
|---|---|
| **Tarea** | [JOS-06] Redactar manual técnico |
| **Responsable** | José Vargas (Developer). Aportan Simón Jofré y Joaquín Orellana. |
| **Revisión** | Simón Jofré y Joaquín Orellana |
| **Versión** | 0.2 |
| **Fecha** | 16-10-2026 (actualizado el 02-11-2026) |

Este manual explica **cómo está construido MicroLogist y cómo se instala, configura, despliega y mantiene**. Está pensado para quien desarrolla o administra el sistema: el equipo, la profesora o quien continúe el proyecto. No es el manual de usuario: no explica cómo usar las pantallas.

Se actualiza en cada entrega (sección 12). Lo que todavía no está decidido o implementado se marca **[POR CONFIRMAR]** o **Pendiente**.

---

## 1. Resumen del sistema

MicroLogist es una aplicación web para pequeñas y medianas empresas de transporte de pasajeros: centraliza vehículos, conductores, turnos y documentos, y avisa por correo antes de que venzan los documentos.

| Módulo | Estado al 02-11-2026 |
|---|---|
| Vehículos: registrar, listar, buscar, editar, desactivar y reactivar | Implementado, con datos en PostgreSQL (JOS-02 y JOS-03) |
| Inicio y cierre de sesión con Supabase Auth | Implementado ([SIM-02](SIM-02_Inicio_de_Sesion.md)) |
| Conductores: registrar, listar, buscar, editar, desactivar y reactivar | Implementado y probado ([SIM-08](SIM-08_Pruebas_Conductores.md)) |
| Mi empresa: datos de contacto | Implementado (JOA-15) |
| Documentos | Validación y cálculo del estado listos (`src/lib/documentos.ts`); faltan la tabla y las pantallas |
| Avisos por correo y turnos | Pendiente (MVP completo) |
| Ingresos | Opcional, pendiente |

Los requisitos están en [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md), [JOA-05](JOA-05_Requisitos_No_Funcionales.md) y el [Product Backlog](JOA-08_Product_Backlog.md).

---

## 2. Arquitectura

### 2.1 Componentes

| Componente | Tecnología | Dónde se ejecuta |
|---|---|---|
| Aplicación web (interfaz y servidor) | Next.js con App Router | Vercel (producción) o el computador (desarrollo) |
| Base de datos | PostgreSQL | Supabase (desarrollo y producción) o Docker (local) |
| Inicio de sesión | Supabase Auth, con la sesión en cookies (`@supabase/ssr`) | Supabase ([SIM-02](SIM-02_Inicio_de_Sesion.md)) |
| Envío de avisos | Proceso diario y proveedor de correo | Pendiente **[POR CONFIRMAR]** |

El diagrama general está en el [README](<../../../README.md#arquitectura>) y el diagrama de componentes en [JOA-06](JOA-06_Diagramas_UML.md), sección 4.

### 2.2 Cómo viaja una solicitud dentro del código

Ejemplo: guardar un vehículo.

```mermaid
flowchart LR
    form["Formulario<br/>vehiculo-form.tsx"] -->|valida con Zod| esquema["Esquema<br/>src/lib/vehiculos.ts"]
    form -->|server action| accion["guardarVehiculo<br/>acciones.ts"]
    accion -->|valida de nuevo| esquema
    accion --> datos["Acceso a datos<br/>src/lib/vehiculos-datos.ts"]
    datos -->|empresa de la sesión| sesion["src/lib/sesion.ts"]
    datos --> prisma["Prisma<br/>src/lib/prisma.ts"]
    prisma -->|SQL| bd[("PostgreSQL")]
```

Reglas de diseño que siguen todas las pantallas:

1. **Validación en dos lugares con el mismo esquema Zod:** en el navegador, para ayudar al usuario, y en el servidor, que es la que protege los datos.
2. **Todo el acceso a la base de datos pasa por `src/lib/*-datos.ts`.** Las páginas y acciones no usan Prisma directamente.
3. **El acceso a datos siempre filtra por la empresa de la sesión**, también al buscar por `id`. La empresa la entrega `empresaDeLaSesion()` y nunca viene del formulario.
4. **Lo que no es de la empresa responde 404**, no 403, para no revelar que existe.
5. **Los errores no muestran detalles técnicos** al usuario: se registran en el servidor (`console.error`) y la pantalla muestra un mensaje claro.

---

## 3. Tecnologías y versiones

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 24 | Entorno de ejecución (el equipo usa 24) |
| Next.js | 16.4.4 | Framework web (App Router, server actions, Turbopack) |
| React | 19.2.8 | Interfaz |
| TypeScript | 5 | Lenguaje |
| Tailwind CSS | 4 | Estilos adaptables a computador y celular |
| Zod | 4 | Validación de datos |
| Prisma ORM | 7.10.1 | Esquema, migraciones y consultas. Usa el adaptador `@prisma/adapter-pg` con el driver `pg` |
| PostgreSQL | 17 en Docker; la versión de Supabase la define el proyecto | Base de datos |
| Supabase | Plan gratuito | Hospeda PostgreSQL y, desde SIM-02, el inicio de sesión |
| Vercel | Se configura en la Iteración 4 (SIM-10) | Despliegue |
| Docker | Docker Desktop | Entorno local opcional (JOS-05) |

Las versiones exactas están en `package.json` y `package-lock.json`. Prisma se fijó en 7.10.1 porque, al 16-10-2026, la etiqueta "latest" de su CLI apunta a una versión 8 en prueba.

---

## 4. Estructura del código

En la raíz del repositorio están las carpetas `Fase 1`, `Fase 2` y `Fase 3`, y el `README.md` con la descripción del proyecto y las instrucciones para ejecutarlo. El sistema está en `Fase 2/Evidencias Proyecto/Evidencias de sistema`:

```
Evidencias de sistema/
├── Base de datos/
│   ├── migrations/               Migraciones versionadas (scripts SQL)
│   └── README.md                 Qué contiene y cómo se usa
└── Aplicación/                   Desde aquí se ejecutan los comandos npm y Docker
    └── (estructura de abajo)
```

Dentro de `Aplicación`:

```
Aplicación/
├── src/
│   ├── app/                      Páginas y rutas (App Router)
│   │   ├── layout.tsx            Estructura común y menú
│   │   ├── menu-sesion.tsx       Encabezado: empresa y «Cerrar sesión»
│   │   ├── page.tsx              "/" redirige a /vehiculos
│   │   ├── not-found.tsx         Página "No encontrado"
│   │   ├── login/                Inicio y cierre de sesión (/login)
│   │   ├── vehiculos/
│   │   │   ├── (listado)/        Listado (/vehiculos) y su pantalla de carga
│   │   │   ├── nuevo/            Registro (/vehiculos/nuevo)
│   │   │   ├── [id]/             Detalle y edición (/vehiculos/:id)
│   │   │   ├── acciones.ts       Server actions: guardar y cambiar estado
│   │   │   ├── error.tsx         Página de error sin detalles técnicos
│   │   │   └── *.tsx             Formulario, botón de activación e insignia de estado
│   │   ├── conductores/          Igual que vehículos (/conductores)
│   │   └── empresa/              Mi empresa: datos de contacto (/empresa)
│   ├── lib/
│   │   ├── vehiculos.ts          Esquema Zod, tipos y formato de patente
│   │   ├── vehiculos-datos.ts    Acceso a datos de vehículos (filtra por empresa)
│   │   ├── conductores*.ts       Lo mismo para conductores (esquema, datos y filtros)
│   │   ├── empresa*.ts           Lo mismo para Mi empresa
│   │   ├── sesion.ts             Usuario y empresa de la sesión
│   │   ├── acceso.ts             Reglas del inicio de sesión y modo de acceso
│   │   ├── supabase.ts           Cliente de Supabase (solo para la autenticación)
│   │   ├── seguridad.ts          Encabezados de seguridad HTTP
│   │   ├── rut.ts, fechas.ts     RUT chileno y fechas en hora de Chile
│   │   ├── documentos.ts         Validación de documentos (todavía sin pantallas)
│   │   └── prisma.ts             Cliente de Prisma para la aplicación
│   ├── proxy.ts                  Sin sesión, redirige a /login antes de cada página
│   └── generated/prisma/         Cliente generado por Prisma (no se sube al repositorio)
├── prisma/
│   ├── schema.prisma             Modelo de datos
│   ├── seed.ts                   Datos ficticios de prueba
│   └── comprobar.ts              Comprobación de la base de datos
├── tests/                        Pruebas automáticas
├── Capturas/                     Capturas de pantalla de la aplicación
├── Dockerfile, compose.yaml,     Entorno Docker (JOS-05)
│   iniciar.sh
├── prisma.config.ts              Configuración del CLI de Prisma (migraciones en «Base de datos»)
└── .env.example                  Variables de entorno, sin valores secretos
```

Convenciones:

- **Nombres en español**, en el código y en la base de datos (`vehiculo`, `guardarVehiculo`). Código en camelCase; tablas y columnas en snake_case.
- **Un módulo nuevo** (por ejemplo, documentos) sigue el patrón de vehículos y conductores: `src/lib/documentos.ts` (esquema), `src/lib/documentos-datos.ts` (acceso a datos) y `src/app/documentos/` (pantallas y acciones).
- **Ramas y commits:** una rama por tarea (`jos-03-vehiculos-prisma`), commits que empiezan con el código de la tarea (`JOS-03: …`) y pull request revisado por otro integrante ([Definition of Done](SIM-05_Definition_of_Done.md)).

---

## 5. Instalación y configuración

Los pasos para instalar y ejecutar están en el [README](<../../../README.md#instrucciones-para-ejecutar-localmente>). Hay dos formas de trabajar:

| Forma | Base de datos | Cuándo usarla |
|---|---|---|
| `npm run dev` en el computador | Supabase (o la de Docker) | Para programar a diario |
| Docker (`docker compose up --build`, desde `Aplicación`) | PostgreSQL local, sin claves | Para levantar y revisar la aplicación sin credenciales ([JOS-05](JOS-05_Entorno_Docker.md)) |

### 5.1 Variables de entorno

Se definen en `.env` (desarrollo), en `Aplicación/compose.yaml` (Docker) o en el panel de Vercel (producción). El `.env` nunca se sube al repositorio.

| Variable | Para qué | Quién la usa | Desarrollo | Producción |
|---|---|---|---|---|
| `DATABASE_URL` | Conexión de la aplicación (Supabase: transaction pooler, puerto 6543, `?pgbouncer=true`) | `src/lib/prisma.ts` | Sí | Sí |
| `DIRECT_URL` | Conexión para migraciones, seed y comprobación (Supabase: session pooler, puerto 5432) | `prisma.config.ts`, `prisma/seed.ts`, `prisma/comprobar.ts` | Sí | Solo donde se ejecuten las migraciones |
| `EMPRESA_DESARROLLO_ID` | Empresa con la que se trabaja sin Supabase Auth (modo desarrollo, por ejemplo en Docker) | `src/lib/acceso.ts` | Solo si faltan las dos variables de Supabase | No: en producción no se usa |
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección del proyecto de Supabase (*Project URL*) | Inicio de sesión (`src/lib/acceso.ts`) | Sí, para iniciar sesión | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (*anon*) de Supabase; la clave `service_role` nunca se usa | Inicio de sesión (`src/lib/acceso.ts`) | Sí, para iniciar sesión | Sí |

Las dos variables de Supabase van juntas. Con las dos, se pide iniciar sesión, también en desarrollo. Sin ninguna, en desarrollo se trabaja con `EMPRESA_DESARROLLO_ID`. Con una sola, o sin ellas en producción, la aplicación no muestra datos ([SIM-02](SIM-02_Inicio_de_Sesion.md), sección 3).

Cómo obtener las direcciones de la base de datos: [JOS-02](JOS-02_Configuracion_Base_de_Datos.md), sección 3. La dirección y la clave pública de Supabase Auth: [SIM-02](SIM-02_Inicio_de_Sesion.md), sección 5.

---

## 6. Base de datos y migraciones

| Tema | Dónde está |
|---|---|
| Configuración de Supabase, comandos, datos de prueba y seguridad | [JOS-02](JOS-02_Configuracion_Base_de_Datos.md) |
| Diagrama entidad-relación, diccionario de datos y separación entre empresas | [JOS-04](JOS-04_Modelo_de_Datos.md) |

Comandos principales:

| Comando | Para qué |
|---|---|
| `npm run db:deploy` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga los datos ficticios (se puede repetir) |
| `npm run db:comprobar` | Comprueba crear y consultar vehículos, sin dejar datos |
| `npm run db:migrate -- --name descripcion` | Crea una migración nueva después de cambiar el esquema |
| `npm run db:studio` | Abre Prisma Studio para ver las tablas |

Reglas al cambiar el modelo:

1. Editar `prisma/schema.prisma` y crear la migración con `npm run db:migrate` (desde `Aplicación`). La carpeta nueva de `Base de datos/migrations/` se sube en el mismo PR.
2. **Toda tabla nueva activa RLS en su migración** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), como la migración inicial ([JOS-02](JOS-02_Configuracion_Base_de_Datos.md), sección 6).
3. Toda tabla con datos de una empresa tiene `empresa_id` obligatorio ([JOS-04](JOS-04_Modelo_de_Datos.md), sección 4).
4. Nunca se edita una migración que ya está en `main`: se corrige con una nueva.
5. Después de cambiar el esquema, `npx prisma generate` actualiza el cliente. `npm install` también lo ejecuta.

---

## 7. Pruebas y calidad

| Comando | Qué revisa |
|---|---|
| `npm test` | Pruebas automáticas con el runner de Node (`node --test`). Hoy son 85 en `tests/`: vehículos, conductores, Mi empresa, documentos, inicio de sesión, RUT, fechas y encabezados de seguridad. |
| `npm run test:integracion` | Pruebas con la base de datos real y con la aplicación levantada (23 en `tests/integracion/`). Usan el `.env` ([SIM-04](SIM-04_Plan_de_Pruebas.md), sección 6.6). |
| `npm run lint` | Reglas de ESLint de Next.js |
| `npm run build` | Compila la aplicación; también revisa los tipos de TypeScript |
| `npm run db:comprobar` | Funcionamiento de la base de datos y de la separación entre empresas |

La Definition of Done exige que `build` y `lint` pasen antes de unir un PR ([SIM-05](SIM-05_Definition_of_Done.md), sección 3.1). El plan de pruebas completo está en [SIM-04](SIM-04_Plan_de_Pruebas.md).

---

## 8. Despliegue y operación

### 8.1 Vercel (aplicación) · Pendiente

La aplicación todavía no está desplegada. Se despliega en la Iteración 4, del 02-11 al 15-11 (SIM-10, acordado el 27-10-2026). Pasos previstos:

1. El proyecto de Vercel **no se conecta con GitHub**: Vercel nombra las funciones con la ruta desde la raíz del repositorio, que tiene espacios (`Fase 2/…`), y el build falla. La aplicación la construye y publica la GitHub Action `.github/workflows/vercel.yml`, con la CLI de Vercel y desde la carpeta `Aplicación`: una vista previa en cada PR y producción en cada push a `main` ([SIM-10](SIM-10_Despliegue_Vercel.md), secciones 4.3 y 4.5). El esquema de Prisma está dentro de `Aplicación` para que el build no necesite nada de fuera. `npm install` ejecuta `prisma generate` automáticamente.
2. Configurar las variables de producción de la sección 5.1 en el panel de Vercel.
3. Aplicar las migraciones a la base de producción antes de cada despliegue que las incluya: `npm run db:deploy` con la `DIRECT_URL` de producción. Si esto se automatiza, se define al configurar Vercel.
4. Elegir para las funciones de Vercel una región cercana a la de la base de datos, para reducir la latencia (el proyecto de producción de Supabase está en East US, Ohio, así que corresponde Cleveland, `cle1`; [SIM-10](SIM-10_Despliegue_Vercel.md), sección 4.3).

En producción, la aplicación necesita las dos variables de Supabase del proyecto de producción: sin ellas no muestra datos, a propósito ([SIM-02](SIM-02_Inicio_de_Sesion.md), sección 3). En ese proyecto hay que repetir la configuración de Supabase Auth de SIM-02 (sección 5): registro público desactivado, contraseña de 8 caracteres o más, y las cuentas con su perfil en `usuario`.

### 8.2 Supabase (base de datos e inicio de sesión)

| Tema | Estado |
|---|---|
| Proyecto de desarrollo | `micrologist-dev`, plan gratuito, región West US (Oregon). Migrado y con datos de prueba. |
| Proyecto de producción | `micrologist-prod`, aparte del de desarrollo (acordado el 27-10-2026), plan gratuito, región East US (Ohio). Con las mismas migraciones que desarrollo ([SIM-10](SIM-10_Despliegue_Vercel.md), sección 4.2). |
| Acceso del equipo | Los tres comparten el proyecto de desarrollo (acordado el 27-10-2026; [JOS-02](JOS-02_Configuracion_Base_de_Datos.md), sección 3). |
| Respaldos | Según el plan de Supabase **[POR CONFIRMAR]** (RNF-DIS-03). |
| Supabase Auth | Configurado en el proyecto de desarrollo el 19-10-2026 (SIM-02): inicio con correo y contraseña, registro público desactivado, contraseña de 8 caracteres o más, y una cuenta de prueba para la Empresa A y otra para la B, cada una con su perfil en `usuario`. El `id` de la tabla `usuario` es el de Supabase Auth. |

Si una contraseña de la base de datos se filtra o hay que cambiarla: Supabase → **Project Settings → Database → Reset database password**, y luego actualizar `DATABASE_URL` y `DIRECT_URL` en cada `.env` y en Vercel. La contraseña va sin corchetes dentro de la URL.

### 8.3 Avisos por correo · Pendiente

Se implementa con el módulo de documentos (PB-15 y PB-16). Quedan por definir **[POR CONFIRMAR]**: el proveedor de correo (por ejemplo, Resend o SMTP), el programador del proceso diario (por ejemplo, Vercel Cron), la hora del envío en hora de Chile y las variables de entorno nuevas, que se agregarán a la sección 5.1 y a `.env.example`. El modelo del registro de envíos ya está propuesto en [JOS-04](JOS-04_Modelo_de_Datos.md), sección 3.7.

### 8.4 Operación diaria

- **Registros de errores:** en desarrollo, en la terminal de `npm run dev`; en producción, en los logs de Vercel. Las acciones registran el error con `console.error` y al usuario le muestran un mensaje sin detalles.
- **Monitoreo de disponibilidad:** **[POR CONFIRMAR]** (RNF-DIS-01).
- **Dependencias:** revisar `npm audit --omit=dev` antes de cada entrega (RNF-SEG-10).

---

## 9. Seguridad

| Medida | Dónde |
|---|---|
| Credenciales solo en variables de entorno; `.env` fuera del repositorio y fuera de las imágenes de Docker | `.gitignore`, `Dockerfile.dockerignore` |
| Solo con sesión: el proxy redirige a `/login`, y cada página y acción vuelve a validar la sesión contra Supabase Auth | `src/proxy.ts`, `src/lib/sesion.ts` |
| La empresa se toma de la sesión y todas las consultas filtran por ella | `src/lib/sesion.ts` y los `src/lib/*-datos.ts` |
| Validación en el servidor con Zod | `src/lib/vehiculos.ts`, `src/lib/conductores.ts`, `src/lib/empresa.ts` y los `acciones.ts` |
| Patente y RUT del conductor únicos por empresa, garantizados por la base de datos | Restricciones `(empresa_id, patente)` y `(empresa_id, rut)` |
| La API pública de Supabase no puede leer las tablas (RLS activo sin políticas) | Migración de cada tabla |
| Contraseñas fuera de nuestras tablas y el mismo mensaje si el correo no existe o la contraseña es incorrecta | Supabase Auth; `mensajeDeErrorDeAcceso()` en `src/lib/acceso.ts` |
| Encabezados de seguridad (CSP, HSTS y otros) y sin `X-Powered-By` | `src/lib/seguridad.ts`, `next.config.ts` |
| Errores sin detalles técnicos | `error.tsx` de vehículos, conductores y Mi empresa |

**Dependencias al día (JOS-07, 02-11-2026):** se actualizaron Next.js y `eslint-config-next` de 16.3.6 a 16.4.4 y `zod` a 4.6.7, y se ejecutó `npm audit fix` (sin `--force`). No basta con cualquier 16.4: hasta la 16.4.0, Next.js tiene 2 vulnerabilidades críticas de ejecución remota de código. `npm audit --omit=dev` informa 0 vulnerabilidades, lo que cumple CP-SEG-13 y cierra ERR-01 de [SIM-04](SIM-04_Plan_de_Pruebas.md). `npm audit` completo informa 16 vulnerabilidades moderadas, todas en herramientas de desarrollo: vienen de `minimatch` ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), publicado el 30-10-2026), que llega a través de ESLint y no forma parte de la aplicación en producción. No se usa `npm audit fix --force` porque propone bajar ESLint a la versión 4.

---

## 10. Mejoras técnicas pendientes

| Mejora | Motivo |
|---|---|
| `engines.node` a `>=24` y `@types/node` a `^24` en `package.json` | Hoy dice `>=20.9.0`, pero el equipo usa Node 24 y `npm test` necesita una versión que tenga `--experimental-strip-types` |
| Integración continua con GitHub Actions (lint, pruebas y build en cada PR) | Automatizar los chequeos de la Definition of Done |

---

## 11. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| La página se ve vacía con la dirección "Network" | Next.js bloquea esa dirección en desarrollo. Usar `http://localhost:3000`. |
| `P1001: Can't reach database server` | Revisar la conexión a internet y las direcciones del `.env`. |
| `password authentication failed` | La contraseña del `.env` no coincide. Revisar que no quedaron los corchetes de `[YOUR-PASSWORD]`. |
| `Cannot find module '@/generated/prisma/client'`, o TypeScript no reconoce una tabla nueva | Falta generar el cliente: `npx prisma generate` (o `npm install`). Pasa después de bajar una migración nueva. |
| Después de actualizar Next.js, `npm run build` dice `Cannot find module '@tailwindcss/postcss'` | Quedó la caché de la versión anterior. Borrar la carpeta `.next` y compilar de nuevo. |
| ESLint o Tailwind "no existen" después de `npm audit fix --omit=dev` | Ese comando quita de `node_modules` las dependencias de desarrollo. Ejecutar `npm install` para recuperarlas. |
| Prisma no encuentra las variables | Prisma no lee el `.env` solo: lo carga `prisma.config.ts` con `dotenv`. Ejecutar los comandos desde la carpeta `Aplicación`. |
| La aplicación muestra "No pudimos cargar los vehículos" | Revisar en la terminal el error real. En desarrollo, comprobar `EMPRESA_DESARROLLO_ID` y la conexión a la base de datos. |
| Problemas con Docker | [JOS-05](JOS-05_Entorno_Docker.md), sección 5. |

---

## 12. Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 0.1 | 16-10-2026 | Primera versión: arquitectura, estructura, instalación, variables, base de datos, pruebas, despliegue previsto y seguridad. Módulo de vehículos con base de datos; inicio de sesión pendiente. |
| 0.1.1 | 02-11-2026 | JOS-07: Next.js 16.4.4 y dependencias de producción sin vulnerabilidades (cierra ERR-01). Dos problemas frecuentes nuevos y uno ampliado. |
| 0.2 | 02-11-2026 | Inicio de sesión con Supabase Auth (SIM-02) en las secciones 1, 2.1, 4, 5.1, 8 y 9. Estado de los módulos, estructura del código y pruebas al día, con conductores y Mi empresa. |

En cada entrega se actualizan las secciones 1, 5.1, 8 y 9, y se agrega una fila a esta tabla.

---

## 13. Checklist de JOS-06

- [x] Arquitectura, tecnologías y estructura del código (secciones 2 a 4).
- [x] Instalación, configuración, variables de entorno, base de datos y migraciones (secciones 5 y 6).
- [x] Despliegue y operación con Vercel, Supabase y el servicio de correo, marcando lo pendiente (sección 8).
- [x] Separado del manual de usuario y con historial para actualizarlo en cada entrega (sección 12).
- [ ] Aportes de Simón (inicio de sesión y plan de pruebas) y de Joaquín cuando correspondan.
- [ ] Revisión del equipo en el PR.
