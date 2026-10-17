# JOS-02 · Configuración de Supabase, Prisma y modelo inicial de datos

| | |
|---|---|
| **Tarea** | [JOS-02] Configurar Supabase, Prisma y modelo inicial de datos |
| **Responsable** | José Vargas (Developer) |
| **Revisión** | Simón Jofré (relación usuario–empresa con SIM-02) |
| **Estado** | En revisión |
| **Fecha** | 16-10-2026 |

Este documento explica cómo quedó la base de datos de la primera entrega y cómo levantarla. Las reglas vienen de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md), secciones 2.2 y 3. El diagrama entidad-relación y el diccionario completo se harán en **JOS-04**.

---

## 1. Qué incluye

- Base de datos PostgreSQL en **Supabase**, conectada con **Prisma ORM 7**.
- Tablas `empresa`, `usuario` y `vehiculo`, con sus relaciones y reglas.
- Migración inicial versionada en `prisma/migrations/`.
- Datos ficticios de prueba: dos empresas y siete vehículos (`prisma/seed.ts`).
- Un script que comprueba la creación y consulta de vehículos (`prisma/comprobar.ts`).
- El cliente de Prisma para la aplicación en `src/lib/prisma.ts`. Las pantallas todavía usan los datos de ejemplo en memoria: cambiarlas a la base de datos es parte de **JOS-03**.

---

## 2. Modelo de datos

En el código los campos van en camelCase (`capacidadPasajeros`); en la base de datos, las tablas y columnas quedan en snake_case (`capacidad_pasajeros`), como en JOA-01. El esquema está en `prisma/schema.prisma`.

### 2.1 Tablas

| Tabla | Para qué | Reglas principales |
|---|---|---|
| `empresa` | Cada empresa de transporte. Todos los datos cuelgan de ella. | `rut` opcional y único si se ingresa. `email_contacto` obligatorio (recibirá los avisos). |
| `usuario` | Perfil de quien inicia sesión. | `id` = id del usuario en Supabase Auth. Pertenece a una sola empresa. `email` único. `rol` solo `admin` por ahora. Sin contraseña: la maneja Supabase Auth. |
| `vehiculo` | Vehículos de cada empresa. | Patente única **dentro de la empresa** (`empresa_id` + `patente`), incluidos los inactivos. Otra empresa sí puede repetirla. |

### 2.2 Valores permitidos

| Tipo | Valores |
|---|---|
| `rol` | `admin` |
| `tipo_vehiculo` | `bus`, `minibus`, `van`, `furgon`, `automovil`, `otro` |
| `estado_vehiculo` | `activo` (por defecto), `en_mantencion`, `inactivo` |

### 2.3 Qué valida la base de datos y qué valida Zod

La base de datos asegura lo que no puede fallar nunca: campos obligatorios, largo máximo de los textos, valores permitidos, relaciones y patente única por empresa. Los formatos y rangos (patente `BBCD12`/`AB1234`, año entre 1980 y el año siguiente, capacidad de 1 a 100) los valida el esquema Zod en el servidor (`src/lib/vehiculos.ts`), como pide JOA-01.

No existe eliminar: las relaciones están en `RESTRICT`, así que no se puede borrar una empresa que tenga usuarios o vehículos.

---

## 3. Configurar Supabase (una vez por proyecto)

1. Entrar a [supabase.com](https://supabase.com) y crear un proyecto:
   - **Name:** `micrologist-dev`
   - **Database Password:** generar una y guardarla. Conviene que tenga solo letras y números, porque los símbolos hay que codificarlos en la URL.
   - **Region:** South America (São Paulo), la más cercana a Chile.
2. Cuando termine de crearse, abrir **Connect → ORMs → Prisma** y copiar `DATABASE_URL` y `DIRECT_URL`.
3. Copiar `.env.example` como `.env`, pegar los dos valores y reemplazar la contraseña.

| Variable | Conexión de Supabase | Quién la usa |
|---|---|---|
| `DATABASE_URL` | Transaction pooler, puerto **6543**, con `?pgbouncer=true` | La aplicación (`src/lib/prisma.ts`) |
| `DIRECT_URL` | Session pooler, puerto **5432** | Migraciones, seed y comprobación (`prisma.config.ts`) |

Se usa el *session pooler* y no la conexión directa (`db.xxx.supabase.co`) porque la directa solo funciona con IPv6 en el plan gratuito, y muchas redes domésticas no lo tienen.

**[POR CONFIRMAR]:** si el equipo comparte un solo proyecto de desarrollo en Supabase (invitando a los tres a la organización) o cada uno crea el suyo. Las credenciales se obtienen desde el panel de Supabase; nunca se envían por chat ni se suben al repositorio.

---

## 4. Comandos

| Comando | Para qué sirve |
|---|---|
| `npm install` | Instala dependencias y genera el cliente de Prisma (`postinstall`). |
| `npm run db:deploy` | Aplica las migraciones pendientes. Es lo primero en una base nueva. |
| `npm run db:seed` | Carga las empresas y vehículos ficticios. Se puede ejecutar varias veces sin duplicar. |
| `npm run db:comprobar` | Comprueba la creación y consulta de vehículos. No deja datos nuevos. |
| `npm run db:studio` | Abre Prisma Studio para ver las tablas en el navegador. |
| `npm run db:migrate -- --name descripcion` | Crea una migración nueva después de cambiar `prisma/schema.prisma`. |

Primera vez, con el `.env` listo:

```bash
npm install
npm run db:deploy
npm run db:seed
npm run db:comprobar
```

### 4.1 Cómo cambiar el modelo más adelante

1. Editar `prisma/schema.prisma`.
2. Ejecutar `npm run db:migrate -- --name que-cambio` (por ejemplo `--name agregar-conductor`). Esto crea la migración y la aplica.
3. Subir la carpeta nueva de `prisma/migrations/` en el mismo PR que el cambio.

Nunca se editan migraciones que ya están en `main`: si algo quedó mal, se corrige con una migración nueva.

---

## 5. Datos de prueba

Empresas inventadas, sin datos personales reales. Los `id` son fijos para que las pruebas de SIM-03 puedan referirse a ellos.

| Empresa | `id` | Vehículos |
|---|---|---|
| Transportes Cordillera (ficticia) | `a0000000-0000-4000-8000-000000000001` | `BBCD12` activo, `HJKL78` en mantención, `FGHJ34` activo, `XY4321` inactivo |
| Buses del Litoral (ficticia) | `b0000000-0000-4000-8000-000000000002` | `BBCD12` activo, `AB1234` en mantención, `KLPR56` activo |

`BBCD12` está en las dos empresas a propósito (criterio 13 de JOA-01).

Los usuarios no se cargan en el seed: su `id` tiene que ser el que asigna Supabase Auth. Ver la sección 7.

---

## 6. Seguridad

- **Credenciales:** solo en `.env`, que está en `.gitignore`. En Vercel se configuran como variables de entorno del proyecto.
- **RLS activado en todas las tablas:** Supabase publica el esquema `public` por su Data API usando la clave anónima, que es pública (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). La migración inicial activa *Row Level Security* sin políticas, así que esa API no puede leer ni modificar las tablas. La aplicación no se ve afectada porque Prisma se conecta como dueño de las tablas. Toda tabla nueva debe activar RLS en su migración.
- **Separación entre empresas:** la base de datos no la impone por sí sola. La aplicación debe filtrar siempre por el `empresa_id` de la sesión (JOA-01, sección 2.4), como se hace en `prisma/comprobar.ts`. Eso se implementa en JOS-03 y SIM-02.

---

## 7. Coordinación con SIM-02 (inicio de sesión)

- El `id` de `usuario` es el mismo `id` del usuario en Supabase Auth (`auth.users.id`). Al iniciar sesión se busca el perfil con ese `id` y de ahí se obtiene `empresa_id`.
- Desde JOS-03, todo el acceso a vehículos obtiene la empresa con `empresaDeLaSesion()` en `src/lib/sesion.ts`. SIM-02 solo tiene que reemplazar esa función. Mientras tanto, en desarrollo se usa `EMPRESA_DESARROLLO_ID` del `.env`.
- Para las cuentas de prueba: crear los dos usuarios en **Supabase → Authentication → Users** y luego agregar su perfil en `usuario` con ese mismo `id`, uno en cada empresa ficticia.
- **[POR CONFIRMAR] con Simón:** si el perfil se crea a mano para las cuentas de prueba (suficiente para la primera entrega) o con un trigger en la base de datos cuando exista el registro público.

---

## 8. Evidencia de comprobación

Salida de `npm run db:comprobar` contra el proyecto de desarrollo en Supabase (16-10-2026), después de `db:deploy` y `db:seed`:

```
✔ Crea un vehículo en la empresa A con estado 'activo' por defecto
✔ El listado de A incluye el vehículo nuevo, sin inactivos y ordenado por patente
✔ Buscar por id un vehículo de B filtrando por A no lo encuentra
✔ La empresa B puede registrar la misma patente que A
✔ Rechaza una patente repetida dentro de la misma empresa (error P2002)
✔ No quedan datos de la comprobación en la base

Todo correcto.
```

`npx prisma migrate status` responde "Database schema is up to date!" y las cuatro tablas (`empresa`, `usuario`, `vehiculo` y `_prisma_migrations`) tienen RLS activo.

---

## 9. Checklist de JOS-02

- [x] Conexión de desarrollo a PostgreSQL en Supabase mediante Prisma.
- [x] Empresa, perfil de usuario y vehículo con sus relaciones según JOA-01.
- [x] Migraciones versionadas y reproducibles; datos ficticios de prueba.
- [x] Comprobación de creación y consulta de vehículos de la empresa de prueba (sección 8).
- [x] Configuración y procedimiento de migración documentados, sin credenciales.
- [x] Comprobación ejecutada contra Supabase (sección 8).
- [ ] Revisión de Simón en el PR.
