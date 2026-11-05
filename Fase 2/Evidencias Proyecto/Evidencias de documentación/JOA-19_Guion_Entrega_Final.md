# JOA-19 · Validación de la entrega final y guion de demostración

| | |
|---|---|
| **Tarea** | [JOA-19] Validar la entrega final y preparar la demostración |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (datos y despliegue) y Simón Jofré (pruebas y avisos) |
| **Estado** | Propuesta: falta el despliegue, ensayar el guion con el equipo y las pruebas pendientes de la sección 2 |
| **Fecha** | 04-11-2026 |

Este documento hace para la entrega final de la semana 15 lo mismo que [JOA-03](JOA-03_Validacion_Primera_Entrega.md) hizo para la primera: comprobar que se cumple el alcance aprobado en la [sección 2 de JOA-08](JOA-08_Product_Backlog.md) (PR #50) y guiar la demostración para la profesora. Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Qué se demuestra

> Un responsable de una empresa de transporte entra a MicroLogist publicado en Vercel, ve sus vehículos y conductores, sabe quién maneja cada vehículo, controla los documentos con su vencimiento y recibe un aviso por correo antes de que venzan, sin que otra empresa vea sus datos.

- **Duración:** 15 minutos de demostración y 5 de preguntas **[POR CONFIRMAR]**.
- **Fecha:** semana 15 **[POR CONFIRMAR]** (SIM-06, sección 6). En este documento el día de la demo se llama **D**.
- **Quién presenta:** Joaquín conduce el guion; José responde lo de datos y despliegue; Simón, lo de avisos y pruebas **[POR CONFIRMAR]**.
- **Dónde:** en `https://micrologist-equipo09.vercel.app`, con el proyecto de Supabase de producción y sus cuentas de prueba ([SIM-10](SIM-10_Despliegue_Vercel.md)). **Plan B**, si el despliegue no está listo: en local con `npm run dev` y la base de desarrollo; todo el guion funciona igual, salvo que el aviso se ejecuta a mano (paso 20) en vez de llegar en la mañana.

---

## 2. Estado del alcance

Estado real al 04-11-2026, según la sección 2 de JOA-08.

| Ítem | Código | Pruebas | Qué falta |
|---|---|---|---|
| Primera entrega (PB-01 a PB-07) | ✅ | ✅ [SIM-03](SIM-03_Pruebas_Primera_Entrega.md): 14 de 14 | — |
| Conductores (PB-08 a PB-10) | ✅ | ✅ [SIM-08](SIM-08_Pruebas_Conductores.md): 14 de 14 | — |
| Documentos (PB-11 a PB-13), con su sección en las fichas | ✅ PR #48, #53 y #56 | ⏳ Probados en local en el PR #56 | CP-FUN-23 a CP-FUN-25 con Supabase ([SIM-04](SIM-04_Plan_de_Pruebas.md)) |
| Conductor asignado al vehículo (PB-24) | ✅ PR #57 | ⏳ Probado en local en el PR #57, más 2 pruebas de integración | Sus casos en SIM-04 |
| Datos de contacto de la empresa (PB-14) | ✅ PR #44 | ⏳ Pruebas unitarias | CP-FUN-26 |
| Avisos por correo (PB-15 y PB-16) | ✅ PR #55 | ⏳ Reglas en `tests/avisos.test.ts`; CP-INT-23 ✅ | Cuenta de Resend y un envío real (CP-FUN-27 y CP-FUN-28, [SIM-11](SIM-11_Alertas_por_Correo.md)) |
| Despliegue en Vercel (SIM-10) | ✅ Guía en el PR #54; publicada en `https://micrologist-equipo09.vercel.app` (PR #60) | ✅ Responde el inicio de sesión y `/api/avisos` exige la clave (05-11-2026) | Desplegar con la GitHub Action, como pidió la profesora: cargar sus secretos y desconectar Git en Vercel (SIM-10, secciones 4.3 y 4.5) |
| Migraciones en Supabase | — | — | `npm run db:deploy` en desarrollo y producción: `documentos`, `avisos` y `conductor_asignado` |

Turnos (PB-17 a PB-19), resumen de la flota (PB-20) e ingresos (PB-21 a PB-23) quedan fuera de esta entrega (JOA-08, sección 2).

---

## 3. Preparación

### 3.1 Antes del día de la demo

- [ ] Actualizar `main` y seguir el README: `npm install`, `npm run db:deploy`, `npm run db:seed` y `npm run db:comprobar`, en desarrollo y en producción (SIM-10, sección 4.2).
- [ ] `npm run build`, `npm run lint` y `npm test` terminan sin errores (Definition of Done, sección 3.1).
- [ ] Que la última ejecución de la GitHub Action en `main` esté en verde y haya publicado en producción (SIM-10, sección 4.5).
- [ ] Cuenta de Resend y variables `RESEND_API_KEY`, `CORREO_REMITENTE` y `CRON_SECRET` en Vercel (SIM-11, sección 3).
- [ ] En **Mi empresa** de las dos empresas, cambiar el correo de contacto al correo de la cuenta de Resend y aceptar la confirmación: sin dominio propio, el plan gratis solo envía a los correos verificados (SIM-11, sección 3). Los dos correos llegan a la misma bandeja, cada uno con el nombre de su empresa.
- [ ] En producción, en **D − 1 después de las 09:00**, registrar los documentos de la sección 3.3 con las fechas calculadas desde D. Así el proceso de esa mañana ya pasó y el primero que los avisa es el de la mañana de D.
- [ ] Ensayar el guion completo con el equipo al menos una vez, en desarrollo (sección 3.5).

### 3.2 Datos de prueba

Son los del seed (`Aplicación/prisma/seed.ts`): dos empresas ficticias, sin datos personales reales. En producción se cargan los mismos (SIM-10, sección 4.2).

| Empresa | Vehículos | Conductores |
|---|---|---|
| **A** · Transportes Cordillera (ficticia) | BBCD-12 (activo), FGHJ-34 (activo), HJKL-78 (en mantención), XY-4321 (inactivo) | Pedro Soto, María Muñoz y Luis Rojas (inactivo) |
| **B** · Buses del Litoral (ficticia) | BBCD-12 (activo), AB-1234 (en mantención), KLPR-56 (activo) | Pedro Soto y Ana Díaz |

`BBCD-12` y el RUT de Pedro Soto están en las dos empresas a propósito.

### 3.3 Documentos para la demo

El seed no trae documentos, porque su estado depende del día. Se registran desde la aplicación en D − 1 (sección 3.1). La columna "Ejemplo" usa D = 18-11-2026 **[POR CONFIRMAR]**.

| Empresa | Documento | Dueño | Vence | Ejemplo | En la demo |
|---|---|---|---|---|---|
| A | Revisión técnica | HJKL-78 | D − 10 | 08-11-2026 | Vencido; no genera aviso. Se renueva en el paso 15 |
| A | Licencia de conducir, descripción "Clase A3" | Pedro Soto | D | 18-11-2026 | Vence hoy; aviso del día del vencimiento |
| A | Permiso de circulación | BBCD-12 | D + 7 | 25-11-2026 | Por vencer; aviso de 7 días |
| A | Revisión técnica | FGHJ-34 | D + 90 | 16-02-2027 | Vigente; no genera aviso |
| A | Permiso de circulación | XY-4321 (inactivo) | D + 7 | 25-11-2026 | No aparece por defecto ni genera aviso |
| B | SOAP | BBCD-12 de B | D + 7 | 25-11-2026 | Solo lo ve la Empresa B y llega en su propio correo |

El documento de XY-4321 se registra mientras el vehículo está activo: reactivarlo, agregar el documento y desactivarlo otra vez.

### 3.4 Valores para registrar en la demo

- **SOAP de BBCD-12** de la Empresa A, con vencimiento **D + 30** (ejemplo: 18-12-2026). No está en la sección 3.3, así que se puede registrar; un segundo SOAP muestra el mensaje de repetido.
- **Renovación** de la revisión técnica de HJKL-78 a **D + 1 año** (ejemplo: 18-11-2027).

### 3.5 Ensayos y avisos

- **Ensayar en desarrollo** (local, con la base de desarrollo) y presentar en producción. Son bases distintas (SIM-10), así que los ensayos no dejan datos en la de la demo. Como no existe eliminar, un ensayo en producción dejaría el SOAP del paso 13 ya registrado.
- Para ensayar, cargar también en desarrollo los documentos de la sección 3.3, con las fechas calculadas desde el día del ensayo.
- En producción, el proceso diario corre solo, entre las 07:00 y las 08:59 hora de Chile (SIM-11, sección 6). En la mañana de D llegan los correos del paso 19.
- Un aviso ya enviado no se repite (JOA-13, criterio 9). Ejecutar el proceso a mano en D, antes de la demo, no rompe nada: el paso 20 igual muestra que solo llega el documento nuevo.

### 3.6 Cuentas de prueba

Una cuenta por empresa en Supabase Auth, con su perfil en `usuario` ([SIM-02](SIM-02_Inicio_de_Sesion.md), secciones 5 y 6.3). Las de producción tienen contraseñas propias (SIM-10, sección 4.2). Las contraseñas se comparten por un canal privado del equipo y no se escriben en el repositorio.

---

## 4. Guion de la demostración

La última columna indica el criterio: **JOA-10 · n** son los de la sección 6 de [JOA-10](JOA-10_Reglas_Modulo_Documentos.md); **PB-24 · n** y **PB-14 · n**, los de esos ítems en JOA-08; **JOA-13 · n**, los de la sección 6 de [JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md).

### 4.1 Acceso y lo que ya estaba (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 1 | Abrir la dirección de Vercel sin sesión. | Redirige al inicio de sesión. | PB-01 · 3 |
| 2 | Entrar con la cuenta de la Empresa A. | Listado de vehículos: BBCD-12, FGHJ-34 y HJKL-78. El menú tiene Vehículos, Conductores y Documentos. | PB-01 · 1 |
| 3 | Abrir **Conductores**. | Pedro Soto y María Muñoz; Luis Rojas no aparece porque está inactivo. | PB-09 |

### 4.2 Conductor asignado (2 minutos)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 4 | Abrir BBCD-12 y desplegar **Conductor asignado**. | "Sin conductor asignado", María Muñoz y Pedro Soto. Luis Rojas no está porque está inactivo. | PB-24 · 2 |
| 5 | Elegir a Pedro Soto y guardar. Volver a abrir BBCD-12. | "Los cambios del vehículo se guardaron." La ficha muestra la sección **Conductor asignado** con Pedro Soto, su RUT y su teléfono. | PB-24 · 1 |
| 6 | Bajar en la ficha de BBCD-12. | Primero **Documentos** del vehículo (permiso de circulación, "Por vencer · Vence en 7 días") y después los documentos de Pedro Soto: licencia "Por vencer · Vence hoy". | PB-24 · 3; JOA-10 · 9 |
| 7 | Hacer clic en el nombre de Pedro Soto. | Su ficha muestra **Vehículos asignados: BBCD-12**, con enlace, y su licencia en **Documentos**. | PB-24 · 5; JOA-10 · 9 |

### 4.3 Documentos (4 minutos)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 8 | Abrir **Documentos**. | Ordenados por vencimiento: revisión técnica de HJKL-78 ("Vencido · Venció hace 10 días"), licencia de Pedro Soto ("Vence hoy"), permiso de BBCD-12 ("Vence en 7 días") y revisión técnica de FGHJ-34 ("Vigente"). El permiso de XY-4321 no aparece. | JOA-10 · 5, 7, 8 |
| 9 | Filtrar por "Por vencer". Luego por tipo "Revisión técnica" con estado "Todos". | Primero la licencia y el permiso; después las dos revisiones técnicas. | JOA-10 · 7 |
| 10 | Marcar "Incluir inactivos" y filtrar. | Aparece el permiso de XY-4321 con la marca "(inactivo)". | JOA-10 · 8 |
| 11 | Volver a la ficha de BBCD-12 y presionar **Agregar documento**. | El formulario llega con BBCD-12 elegido y solo con los tipos de un vehículo (sin licencia). | JOA-10 · 9 |
| 12 | Enviar el formulario vacío. Luego escribir la fecha `01-12-2062`. | "Selecciona el tipo de documento." e "Ingresa la fecha de vencimiento (DD-MM-AAAA)."; con la fecha, "La fecha debe estar entre …" con el rango calculado desde hoy. No se guarda nada. | JOA-10 · 2, 4 |
| 13 | Registrar el SOAP con la fecha de la sección 3.4. | Vuelve a la ficha con "Documento registrado correctamente." y el SOAP "Por vencer · Vence en 30 días". | JOA-10 · 1, 5 |
| 14 | Intentar registrar otro SOAP para BBCD-12. | "El vehículo BBCD-12 ya tiene un SOAP registrado. Edítalo para renovarlo.", con el enlace "Ir a editarlo". No se crea nada. | JOA-10 · 3 |
| 15 | En **Documentos**, abrir la revisión técnica vencida de HJKL-78 y cambiar la fecha a la de la sección 3.4. | "Los cambios del documento se guardaron." y ahora está "Vigente". | JOA-10 · 11 |

### 4.4 Datos de la empresa (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 16 | Hacer clic en el nombre de la empresa, en el encabezado. | **Mi empresa** con nombre, correo de contacto, teléfono y RUT. | PB-14 · 1 |
| 17 | Borrar el correo de contacto y guardar. | "Ingresa un correo válido." No se guarda. | PB-14 · 2 |
| 18 | Volver a escribir el mismo correo y cambiar el teléfono. Guardar. | "Los datos de tu empresa se guardaron." Ese correo es el que recibe los avisos (JOA-13, sección 2). | PB-14 · 1, 3 |

### 4.5 Avisos por correo (3 minutos)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 19 | Abrir la bandeja de la cuenta de Resend. | Dos correos de la mañana. El de la Empresa A ("MicroLogist: documentos que vencen hoy", "Hola, Transportes Cordillera (ficticia):") trae la licencia de Pedro Soto ("Vence hoy") y el permiso de BBCD-12 ("Vence en 7 días"). No trae la revisión vencida, la vigente ni el permiso de XY-4321. El de la Empresa B ("MicroLogist: 1 documento por vencer") trae solo su SOAP. | JOA-13 · 1, 2, 4, 6, 7 |
| 20 | Ejecutar el proceso a mano: Vercel > **Settings > Cron Jobs** > ejecutar (o el comando de SIM-11, sección 4). | Llega un solo correo nuevo, "MicroLogist: 1 documento por vencer", con el SOAP del paso 13 ("Vence en 30 días"). Los avisos de la mañana no se repiten. | JOA-13 · 1, 4, 9 |

Los criterios 3, 5, 8, 10, 11 y 12 de JOA-13 no se muestran en la demo: los cubren las pruebas de SIM-11 y de SIM-04 (CP-FUN-27, CP-FUN-28 y CP-INT-23).

### 4.6 Desactivar un conductor con vehículo asignado (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 21 | En la ficha de Pedro Soto, **Desactivar conductor**. | La confirmación dice "…Dejará de aparecer en el listado y su vehículo quedará sin conductor asignado". Después, "Conductor desactivado. … 1 vehículo quedó sin conductor asignado." | PB-24 · 4 |
| 22 | Abrir BBCD-12. | "Este vehículo no tiene conductor asignado." | PB-24 · 4 |
| 23 | En **Conductores**, marcar "Incluir inactivos", abrir a Pedro Soto y **Reactivar conductor**. | "Conductor reactivado." BBCD-12 sigue sin conductor: reactivarlo no lo vuelve a asignar. | PB-24 · 4 |

### 4.7 Separación entre empresas (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 24 | Copiar la dirección del documento abierto en el paso 15. Cerrar sesión y entrar con la cuenta de la Empresa B. | — | — |
| 25 | Abrir **Documentos**. | Solo el SOAP del BBCD-12 de B. Ningún documento de la Empresa A. | JOA-10 · 13 |
| 26 | Pegar la dirección copiada. | "No encontrado". | JOA-10 · 14 |

### 4.8 Celular (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 27 | En las herramientas del navegador, vista de dispositivo a 360 px. Recorrer **Documentos**, la ficha de BBCD-12 y el formulario de registro. | Los documentos se ven como tarjetas; ninguna pantalla tiene desplazamiento horizontal y el menú pasa a dos líneas sin desbordarse. | JOA-10 · 15; JOA-08 · criterio común 4 |

### 4.9 Cierre (1 minuto)

Contar lo que queda como trabajo futuro y los próximos pasos (sección 7.1).

---

## 5. Matriz de validación

Estado al 04-11-2026. "Desarrollo" quiere decir que se probó en el navegador al construirlo, en local y con una base en memoria (PR #56 y #57); todavía falta la prueba del equipo con Supabase.

| Criterio | Estado | Evidencia | Paso |
|---|---|---|---|
| JOA-10 · 1 a 4 (registro y errores) | ⏳ Desarrollo | PR #56; `tests/documentos.test.ts`; falta CP-FUN-23 | 11 a 14 |
| JOA-10 · 5 y 6 (estado y hora de Chile) | ⏳ Desarrollo | PR #56; `tests/documentos.test.ts` y `tests/fechas.test.ts` (SIM-09); falta CP-FUN-24 | 6, 8, 13 |
| JOA-10 · 7 a 10 (listados y fichas) | ⏳ Desarrollo | PR #56; `tests/documentos-filtros.test.ts`; falta CP-FUN-24. El criterio 10 (listado vacío) no se probó | 6 a 11 |
| JOA-10 · 11 y 12 (renovar y cambiar de dueño) | ⏳ Desarrollo | PR #56; falta CP-FUN-25 | 15 |
| JOA-10 · 13 y 14 (separación entre empresas) | ⏳ Desarrollo | PR #56, también con el formulario manipulado | 25, 26 |
| JOA-10 · 15 (celular) | ⏳ Desarrollo | PR #56 | 27 |
| PB-24 · 1 a 5 | ⏳ Desarrollo | PR #57; 2 pruebas de integración en `tests/integracion/base-de-datos.test.ts`; faltan sus casos en SIM-04 | 4 a 7, 21 a 23 |
| PB-14 · 1 y 2 | ⏳ Pruebas unitarias | `tests/empresa.test.ts` (PR #44); falta CP-FUN-26 | 16 a 18 |
| PB-14 · 3 | ✅ Decidido | JOA-13, sección 2: los avisos van al correo de contacto | 18, 19 |
| JOA-13 · 1 a 11 | ⏳ Reglas | `tests/avisos.test.ts` y `tests/correo.test.ts` (SIM-11); falta un envío real (CP-FUN-27 y CP-FUN-28) | 19, 20 |
| JOA-13 · 12 | ✅ Aprobado | CP-INT-23 (04-11-2026) | — |

---

## 6. Comprobaciones de esta tarea

### 6.1 Reglas contra el código

Revisión hecha el 04-11-2026 sobre `main`. Las rutas son de `Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación`, salvo la de `Base de datos`.

| Regla | Dónde está | ¿Cumple? |
|---|---|---|
| Tipos y dueño, un documento por dueño y tipo salvo "otro" (JOA-10, 2 y 3.1) | `src/lib/documentos.ts`, `src/lib/documentos-datos.ts` e índices únicos parciales en `Aplicación/prisma/schema.prisma` | Sí |
| Estado calculado con la fecha de Chile, 30 días para "por vencer" (JOA-10, 2 y 3.2) | `calcularEstado` en `src/lib/documentos.ts` y `hoyEnChile` en `src/lib/fechas.ts` | Sí |
| Dueños inactivos fuera del listado por defecto y sin documentos nuevos (JOA-10, 2) | `DUENO_ACTIVO` en `src/lib/documentos-filtros.ts` y `crearDocumento` en `src/lib/documentos-datos.ts` | Sí |
| Un documento, vehículo o conductor de otra empresa responde "no encontrado" (JOA-10, 4) | `src/lib/documentos-datos.ts` y claves foráneas compuestas en `schema.prisma` | Sí |
| Conductor asignado: solo activos de la empresa, varios vehículos por conductor y sin conductor al desactivarlo (PB-24) | `src/lib/vehiculos-datos.ts`, `desactivarConductor` en `src/lib/conductores-datos.ts` y la clave foránea compuesta de `vehiculo.conductor_id` | Sí |
| Avisos a 30, 7, 1 y 0 días, un correo por empresa, sin duplicados ni dueños inactivos (JOA-13, 2 y 3) | `src/lib/avisos.ts`, `src/lib/avisos-datos.ts` y la restricción única de `aviso_enviado` | Sí |
| La ruta del proceso exige `CRON_SECRET` (JOA-13, criterio 12) | `src/app/api/avisos/route.ts` | Sí |

No se encontraron diferencias entre las reglas y el código.

### 6.2 Errores que bloqueen el flujo principal

No se conocen errores que bloqueen el flujo principal. Falta confirmarlo con las pruebas de SIM-04 en Supabase (sección 2) y con el despliegue en Vercel.

### 6.3 README

El README explica cómo ejecutar el sistema en local y con Docker, y desde el 05-11-2026 tiene la dirección de producción (`https://micrologist-equipo09.vercel.app`) y cómo se publica con GitHub Actions.

### 6.4 Primer ensayo, en local

04-11-2026, sobre `main` (`c14dbf7`), con `npm run dev` en modo desarrollo, un Postgres en memoria (PGlite) con las cinco migraciones, el seed y los documentos de la sección 3.3 calculados con D = 04-11-2026. Sin inicio de sesión: la empresa se eligió con `EMPRESA_DESARROLLO_ID`.

| Pasos | Resultado |
|---|---|
| 2 a 18 | ✅ Cada paso mostró lo que dice el guion, con los mismos textos. El rango de fechas del paso 12 salió "entre 04-11-2021 y 04-11-2036". En el paso 18, con el mismo correo, no se pidió confirmación |
| 21 a 23 | ✅ La confirmación, el mensaje "1 vehículo quedó sin conductor asignado." y BBCD-12 sin conductor después de reactivar |
| 25 y 26 | ✅ Con la Empresa B: solo su SOAP, y el documento de la Empresa A responde 404 "No encontrado" |
| 1, 19 y 20 | No ensayados: necesitan el inicio de sesión, Vercel y la cuenta de Resend |
| 27 | No repetido en este ensayo; las mismas pantallas se revisaron a 360 px en los PR #56 y #57 |

Falta el ensayo con el equipo en Vercel (sección 7.2).

---

## 7. Pendientes

### 7.1 Para contar en la demostración

- El MVP de la entrega final está completo: vehículos, conductores con su vehículo asignado, documentos con su vencimiento, datos de la empresa y avisos por correo, con los datos separados por empresa.
- **Trabajo futuro:** turnos (sus reglas ya están en [JOA-14](JOA-14_Reglas_Modulo_Turnos.md)), resumen de la flota e ingresos (JOA-08, sección 7).

### 7.2 Antes de dar por terminada la entrega

- Migraciones aplicadas en desarrollo y producción, y la GitHub Action publicando en Vercel, con sus secretos cargados (SIM-10, sección 4.5).
- Cuenta de Resend y un envío real (SIM-11).
- Pruebas de SIM-04: CP-FUN-23 a CP-FUN-28 y los casos de PB-24.
- Guion completo ensayado con el equipo, con inicio de sesión y en Vercel.
- Confirmar la fecha y la duración de la demostración.

---

## 8. Checklist de JOA-19

- [x] Estado del alcance de la entrega final (sección 2).
- [x] Preparación, datos y documentos para la demo (sección 3).
- [x] Guion de la demostración con los criterios de cada paso (sección 4).
- [x] Matriz de validación (sección 5).
- [x] Reglas contrastadas con el código (sección 6.1).
- [x] Primer ensayo en local, sin inicio de sesión ni correo (sección 6.4).
- [ ] Guion ensayado con el equipo, con inicio de sesión y en Vercel.
- [ ] Revisión de José y Simón en el PR.
