# SIM-10 · Despliegue en Vercel

| | |
|---|---|
| **Tarea** | [SIM-10] Desplegar la aplicación en Vercel |
| **Responsable** | Simón Jofré (Scrum Master), con apoyo de José Vargas |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Aplicación lista para desplegar; faltan las cuentas y el proyecto de producción |
| **Fecha** | 03-11-2026 |

Este documento explica cómo se publica MicroLogist en Vercel, con un proyecto de Supabase para producción separado del de desarrollo (acordado el 27-10-2026, [JOS-02](JOS-02_Configuracion_Base_de_Datos.md), sección 3). Completa la sección 8.1 de [JOS-06](JOS-06_Manual_Tecnico.md) y es parte del alcance de la entrega final de la semana 15 ([JOA-08](JOA-08_Product_Backlog.md), sección 2).

---

## 1. Estado al 03-11-2026

**Listo:**

- ERR-01 está cerrado (JOS-07, PR #51): `npm audit --omit=dev` informa 0 vulnerabilidades con Next.js 16.4.4.
- La aplicación se construye y funciona en modo producción en local (sección 3).
- `prisma.config.ts` lee `DIRECT_URL` con `process.env`, así que `prisma generate` funciona en Vercel sin conexión a la base de datos.

**Falta:** crear el proyecto de Supabase de producción y el proyecto en Vercel. Son pasos con cuentas y claves, que hace cada integrante desde su navegador (sección 4). Las claves nunca se escriben en este documento ni en el repositorio.

---

## 2. Qué se despliega

| Parte | Dónde | Notas |
|---|---|---|
| Aplicación Next.js (páginas, acciones del servidor y proxy) | Vercel, plan Hobby (gratis) | Se construye desde la carpeta `Aplicación` del repositorio. |
| Base de datos PostgreSQL | Supabase, proyecto de producción (gratis) | Separado de `micrologist-dev`, con las mismas migraciones. |
| Inicio de sesión | Supabase Auth del proyecto de producción | Con sus propias cuentas de prueba. |

Los datos de producción son los de la demostración: las dos empresas ficticias del seed y sus cuentas de prueba. No se cargan datos reales.

---

## 3. Comprobación en local, antes de desplegar

Rama `sim-10-despliegue-vercel` desde `main` (`0057c51`), Node.js 24.20, el 03-11-2026.

| Comprobación | Resultado |
|---|---|
| `npm ci` (instala exactamente lo de `package-lock.json`, como Vercel) | ✅ Sin errores; ejecuta `prisma generate`. |
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades (CP-SEG-13). |
| `npm run build` | ✅ Compila las 10 rutas y el proxy. |
| `npm start` (modo producción) y `tests/integracion/aplicacion.test.ts` contra `http://localhost:3000` | ✅ 8 de 8: inicio de sesión, redirecciones sin sesión (vehículos y conductores), sesión falsificada, archivos públicos, encabezados de seguridad y API pública de Supabase cerrada. |
| `X-Powered-By` en las respuestas | ✅ No se envía. |

---

## 4. Pasos para desplegar

### 4.1 Proyecto de Supabase de producción

Lo crea José o Simón, en la organización de Supabase del equipo:

1. **New project** con el nombre `micrologist-prod` y la región **South America (São Paulo)**, la más cercana a Chile. La contraseña de la base de datos se genera ahí y se guarda en el gestor de contraseñas de quien la creó, nunca en el repositorio ni en el chat.
2. Configurar Supabase Auth igual que en desarrollo ([SIM-02](SIM-02_Inicio_de_Sesion.md), sección 5): inicio con correo y contraseña, **largo mínimo de 8** y **registro público desactivado** (*Allow new users to sign up* apagado).
3. Anotar, para el paso 4.4:
   - En **Connect > ORMs > Prisma**: `DATABASE_URL` (transaction pooler, puerto 6543, con `?pgbouncer=true`) y `DIRECT_URL` (session pooler, puerto 5432).
   - En **Project Settings > API**: la **Project URL** y la clave **pública** (*anon* o *publishable*). La clave `service_role` o *secret* nunca se usa.

### 4.2 Base de datos de producción

Desde `Aplicación`, en PowerShell, con la `DIRECT_URL` de producción solo en esa terminal. El `.env` sigue apuntando a desarrollo, y como `dotenv` no reemplaza una variable que ya existe, los comandos usan la de producción:

```powershell
$env:DIRECT_URL = "<DIRECT_URL de producción>"
npm run db:deploy
npm run db:seed
Remove-Item Env:DIRECT_URL
```

1. `npm run db:deploy` aplica todas las migraciones de `Base de datos/migrations` (todas activan RLS).
2. `npm run db:seed` carga las dos empresas ficticias, sus vehículos y sus conductores.
3. En **Authentication > Users > Add user**, crear las dos cuentas de prueba con **Auto Confirm User**. Pueden usar los mismos correos que en desarrollo, pero con contraseñas propias de producción, compartidas solo por un canal privado del equipo.
4. Ejecutar `Base de datos/perfiles-prueba.sql` en el **SQL Editor** de producción, reemplazando los dos correos. La consulta final debe mostrar las dos cuentas, cada una con su empresa.

### 4.3 Proyecto en Vercel

El repositorio es público y está en la cuenta de GitHub de José.

1. José instala la aplicación de **Vercel para GitHub** en su cuenta, con acceso solo a `capstone-2026-002D-equipo09`.
2. Simón entra a Vercel con su cuenta de GitHub y elige **Add New > Project > Import** del repositorio. Si el repositorio no aparece en su lista, José lo importa desde su propia cuenta de Vercel; el resto de los pasos es igual.
3. En la configuración del proyecto:
   - **Root Directory:** `Fase_2/Evidencias_Proyecto/Evidencias_de_sistema/Aplicación`, con la opción **Include files outside the root directory in the Build Step** **desactivada**, porque la aplicación ya no necesita nada de fuera de esa carpeta: desde el 04-11-2026 el esquema de Prisma está en `Aplicación/prisma/`. Las carpetas de la ruta no tienen espacios (`Fase_2`, `Evidencias_Proyecto`, `Evidencias_de_sistema`) porque Vercel nombra las funciones con la ruta desde la raíz del repositorio y no acepta espacios en ese nombre.
   - **Framework Preset:** Next.js (Vercel lo detecta). Comando de build: `npm run build`; de instalación: el de Vercel (`npm install`, que ejecuta `prisma generate`).
   - **Node.js Version:** 24.x, la misma que usa el equipo.
   - **Function Region:** São Paulo (`gru1`), la misma región de la base de datos de producción.

### 4.4 Variables de entorno

Se cargan en **Project Settings > Environment Variables**, para el entorno **Production**. Las escribe quien creó el proyecto de Supabase, copiándolas directamente desde el panel.

| Variable | Valor | ¿En Vercel? |
|---|---|---|
| `DATABASE_URL` | La de producción del paso 4.1 (puerto 6543, `?pgbouncer=true`) | Sí |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de producción | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de producción | Sí |
| `DIRECT_URL` | La de producción (puerto 5432) | No: solo se usa en la terminal del paso 4.2 |
| `EMPRESA_DESARROLLO_ID` | — | No: en producción nunca se usa (SIM-02) |

Las variables de las alertas por correo (`RESEND_API_KEY`, `CRON_SECRET` y el remitente) se agregan con SIM-11.

### 4.5 Primer despliegue

1. **Deploy** desde Vercel. Al terminar, la dirección queda como `https://<proyecto>.vercel.app`.
2. Desde ahí, cada vez que se une un PR a `main`, Vercel vuelve a desplegar solo. Los PR abiertos reciben una dirección de vista previa.
3. Si un PR trae una migración nueva, se aplica en producción (paso 4.2, solo `npm run db:deploy`) **antes** de unirlo, para que el código nuevo no llegue antes que su tabla.

---

## 5. Comprobaciones después de desplegar

Se registran en esta sección y en el plan de pruebas ([SIM-04](SIM-04_Plan_de_Pruebas.md)).

| Caso | Qué se hace | Resultado esperado | Estado |
|---|---|---|---|
| CP-SEG-11 | Entrar con `http://` y recorrer las páginas. | Redirige a `https://` y todas usan HTTPS. | ⏳ |
| CP-INT-11 a 16, 21 y 22 | Ejecutar `tests/integracion/aplicacion.test.ts` contra la dirección de Vercel (comando abajo). | 8 de 8 aprobadas. | ⏳ |
| CP-SEG-03 y CP-SEG-04 | Iniciar sesión con la cuenta A y con la B. | Cada una ve solo lo suyo; un registro de la otra responde "No encontrado". | ⏳ |
| CP-FUN-13 | Registrar un vehículo de prueba, volver a desplegar y revisarlo. | El vehículo sigue ahí. | ⏳ |
| CP-REN-01 a CP-REN-03 | Lighthouse en modo móvil, 3 mediciones por pantalla. | Contenido principal en 2,5 s o menos (RNF-REN-01). | ⏳ |

Comando para las pruebas de integración contra producción, desde `Aplicación`. Sin `--env-file`, para no mezclar el `.env` de desarrollo:

```powershell
$env:URL_APLICACION = "https://<proyecto>.vercel.app"
$env:NEXT_PUBLIC_SUPABASE_URL = "<Project URL de producción>"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "<clave pública de producción>"
node --experimental-strip-types --test "tests/integracion/aplicacion.test.ts"
```

---

## 6. Riesgos y problemas frecuentes

| Problema | Qué hacer |
|---|---|
| El build falla con "Could not find Prisma Schema". | Revisar que `schema.prisma` esté en `Aplicación/prisma/` y que `prisma.config.ts` apunte ahí. |
| El build falla con "A Serverless Function has an invalid name" ("must not contain any space"). | Alguna carpeta de la ruta del Root Directory tiene espacios. Por eso se renombraron el 04-11-2026 con guion bajo (`Fase_2/Evidencias_Proyecto/Evidencias_de_sistema`); revisar que el Root Directory de Vercel use esos nombres. |
| Las páginas responden "No pudimos…" o error 500 después de desplegar. | Falta aplicar una migración en producción o falta una variable de entorno. Los detalles quedan en los logs de Vercel (**Deployments > Functions**). |
| La aplicación responde lento. | Revisar que la región de las funciones de Vercel sea la misma de la base de datos (paso 4.3). |
| Se filtra una clave. | Rotarla en Supabase (**Reset database password** o una clave pública nueva) y actualizarla en Vercel ([JOS-06](JOS-06_Manual_Tecnico.md), sección 8.2). |

---

## 7. Checklist de SIM-10

- [x] Build, auditoría y pruebas en modo producción en local (sección 3).
- [x] Pasos de despliegue, variables y comprobaciones (secciones 4 y 5).
- [ ] Proyecto de Supabase de producción creado, migrado y con sus cuentas de prueba.
- [ ] Proyecto en Vercel desplegado, con su dirección anotada en este documento y en el README.
- [ ] Comprobaciones de la sección 5 registradas.
- [ ] Revisión de José y Joaquín en el PR.
