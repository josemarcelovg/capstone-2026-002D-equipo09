# SIM-11 · Alertas de vencimiento por correo

| | |
|---|---|
| **Tarea** | [SIM-11] Implementar las alertas de vencimiento por correo |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Implementado y probado sin base de datos; falta configurar Resend y probar con documentos en la base |
| **Fecha** | 04-11-2026 |

Este documento explica cómo se implementaron los avisos por correo (PB-15 y PB-16) según las reglas de [JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md), en la versión mínima que entra en la entrega final de la semana 15 ([JOA-08](JOA-08_Product_Backlog.md), sección 2). Usa la tabla `documento` (PR #53), el cálculo del estado de [JOA-10](JOA-10_Reglas_Modulo_Documentos.md) y la fecha de hoy en Chile (SIM-09).

---

## 1. Qué se construyó

| Parte | Dónde | Qué hace |
|---|---|---|
| Registro de avisos | Tabla `aviso_enviado` (`Base de datos/schema.prisma` y migración `20261104025354_avisos`) | Un registro por documento, fecha de vencimiento y plazo, con destinatario, estado y fecha del intento. Ver [JOS-04](JOS-04_Modelo_de_Datos.md), sección 3.7. |
| Reglas | `src/lib/avisos.ts` | Plazo que corresponde, avisos pendientes, un grupo por empresa, el correo y la clave de la ruta. No usa la base ni Next.js. |
| Envío | `src/lib/correo.ts` | Envía con la API HTTP de Resend, sin dependencias nuevas. |
| Proceso diario | `src/lib/avisos-datos.ts` | Lee los documentos, registra cada aviso, envía un correo por empresa y marca enviado o fallido. |
| Ruta | `src/app/api/avisos/route.ts` | `GET /api/avisos`, protegida con `CRON_SECRET`. Responde solo los totales. |
| Programación | `vercel.json` | Vercel Cron la llama todos los días a las 11:00 UTC (`0 11 * * *`). |
| Proxy | `src/lib/acceso.ts` | Deja pasar `/api/avisos` sin sesión, porque Vercel Cron no tiene una. |

---

## 2. Qué pasa cada día

1. Vercel Cron llama `GET /api/avisos` con `Authorization: Bearer <CRON_SECRET>`. Sin esa clave, la ruta responde **401** y no hace nada.
2. El proceso calcula **hoy en hora de Chile** y busca los documentos que vencen entre hoy y 30 días más.
3. Para cada documento con dueño activo, elige el **plazo que corresponde** (30, 7, 1 o 0 días). Si ese aviso ya está registrado como `enviado`, lo salta.
4. **Registra el aviso como `fallido` antes de enviar.** Si otra ejecución ya lo registró, la restricción única lo impide y lo salta. Un aviso fallido de un día anterior se vuelve a tomar; uno que falló hoy, se reintenta mañana.
5. Arma **un correo por empresa** con todos sus avisos y lo envía a su `email_contacto`.
6. Si Resend acepta el correo, marca sus avisos como `enviado`. Si no, quedan `fallido` y se reintentan al día siguiente.
7. Responde los totales: `{ hoy, correos, enviados, fallidos }`.

---

## 3. Configuración

| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `RESEND_API_KEY` | Clave para enviar correos con Resend | Resend > **API Keys** > **Create API Key**, con permiso de envío. |
| `CORREO_REMITENTE` | Remitente de los correos | Sin dominio propio: `MicroLogist <onboarding@resend.dev>`, el remitente de prueba de Resend. |
| `CRON_SECRET` | Clave que Vercel Cron envía al llamar la ruta | Una cadena larga y aleatoria, por ejemplo la que muestra `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. |

Las tres van en el `.env` para probar en local y en **Vercel > Project Settings > Environment Variables** para producción ([SIM-10](SIM-10_Despliegue_Vercel.md), sección 4.4). Ninguna se sube al repositorio.

Pasos:

1. **Cuenta de Resend:** la crea Simón con un correo del equipo, en el plan gratis (100 correos al día y 3.000 al mes).
2. **Destinatario de la demo:** sin dominio propio, el plan gratis solo envía a los correos verificados en la cuenta (JOA-13, sección 5). Por eso el correo de contacto de las empresas de prueba se cambia, desde **Mi empresa**, al correo de la cuenta de Resend.
3. **Migraciones:** `npm run db:deploy` en desarrollo y en producción, después de unir este PR y el #53. Las dos migraciones (`documentos` y `avisos`) crean sus tablas con RLS.
4. **Vercel:** al desplegar con `vercel.json`, el proceso aparece en **Settings > Cron Jobs**. Desde ahí también se puede ejecutar a mano.

---

## 4. Cómo probarlo a mano

Con la aplicación corriendo (`npm run dev`), las migraciones aplicadas, `CRON_SECRET` en el `.env` y un documento que venza en 7 días, desde PowerShell:

```powershell
$clave = "<CRON_SECRET del .env>"
Invoke-RestMethod http://localhost:3000/api/avisos -Headers @{ Authorization = "Bearer $clave" }
```

| Paso | Resultado esperado |
|---|---|
| Primera llamada | `correos: 1`, `enviados` igual a la cantidad de documentos con aviso y `fallidos: 0`. Llega un correo a la cuenta de Resend. |
| Segunda llamada, el mismo día | `correos: 0`: no se repite ningún aviso (criterio 9 de JOA-13). |
| Llamada sin la clave o con otra | 401 y `{"error":"No autorizado."}` (criterio 12). |
| Sin `RESEND_API_KEY` | `fallidos` igual a la cantidad de avisos; al día siguiente se reintentan (criterio 10). |

---

## 5. Pruebas

Rama `sim-11-alertas-correo`, desde el PR #53 (tabla `documento`), el 04-11-2026.

| Prueba | Resultado |
|---|---|
| `npm test` | ✅ 109 de 109. Incluye 19 pruebas nuevas de las reglas (`tests/avisos.test.ts`), 4 del envío (`tests/correo.test.ts`) y 1 del proxy (`tests/acceso.test.ts`). |
| CP-INT-23 · la ruta sin clave responde 401 | ✅ Con la aplicación levantada: sin clave, con una clave inventada y con una vacía, responde 401 y no redirige al inicio de sesión. `aplicacion.test.ts`: 9 de 9. |
| `npx tsc --noEmit`, `npm run lint` y `npm run build` | ✅ Sin errores; el build incluye la ruta `/api/avisos`. |

**Pendiente:**

- **Pruebas de integración del proceso con la base de datos**, en una transacción que se deshace y con un envío de prueba: un correo por empresa, sin repetir en una segunda ejecución, fallido y reintento al día siguiente, y renovación. Se agregan cuando las migraciones de documentos y avisos estén aplicadas en Supabase.
- **CP-FUN-27 y CP-FUN-28** ([SIM-04](SIM-04_Plan_de_Pruebas.md)) con un envío real, cuando exista la cuenta de Resend.

---

## 6. Límites del MVP

- **Hora:** en el plan Hobby de Vercel, el proceso corre en algún momento entre las 11:00 y las 11:59 UTC, así que el correo llega entre las 07:00 y las 08:59 de Chile.
- **Destinatarios:** sin dominio propio, Resend solo envía a los correos verificados en la cuenta (sección 3).
- **Enlace del correo:** apunta a `/documentos`, la lista de documentos, que se construye en el módulo de documentos.
- **Historial:** los envíos quedan en `aviso_enviado`, sin pantalla (JOA-13, sección 1).

---

## 7. Checklist de SIM-11

- [x] Tabla `aviso_enviado` con su migración, la regla de los plazos y RLS.
- [x] Reglas de los plazos, duplicados, reintentos y correo, con sus pruebas (sección 5).
- [x] Ruta protegida con `CRON_SECRET`, Vercel Cron y variables en `.env.example`.
- [ ] Cuenta de Resend y variables en Vercel.
- [ ] Migraciones aplicadas en desarrollo y producción.
- [ ] Pruebas de integración del proceso, y CP-FUN-27 y CP-FUN-28 con un envío real.
- [ ] Variables y operación en JOS-06 (secciones 5.1 y 8.3).
- [ ] Revisión de José y Joaquín en el PR.
