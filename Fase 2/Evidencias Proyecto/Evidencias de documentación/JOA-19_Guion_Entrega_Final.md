# JOA-19 · Validación de la entrega final y guion de demostración

| | |
|---|---|
| **Tarea** | [JOA-19] Validar la entrega final y preparar la demostración |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (datos y despliegue) y Simón Jofré (pruebas y avisos) |
| **Estado** | Listo para la Evaluación Final: alcance terminado y probado, y datos de producción preparados (sección 3.7). Falta ensayar con el equipo |
| **Fecha** | 04-11-2026 · actualizado el 16-11-2026 (apertura con el aviso del mismo día y demo a las 11:30) y el 21-11-2026 (pregunta de Docker) |

Este documento hace para la entrega final de la semana 15 lo mismo que [JOA-03](JOA-03_Validacion_Primera_Entrega.md) hizo para la primera: comprobar que se cumple el alcance aprobado en la [sección 2 de JOA-08](JOA-08_Product_Backlog.md) (PR #50) y guiar la demostración para la profesora. Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Qué se demuestra

> Un responsable de una empresa de transporte entra a MicroLogist publicado en Vercel, ve sus vehículos y conductores, sabe quién maneja cada vehículo, controla los documentos con su vencimiento y recibe un aviso por correo antes de que venzan, sin que otra empresa vea sus datos.

- **Duración:** 20 minutos en total, que se cortan estrictamente en el minuto 20: unos 15 de exposición, con 4 y medio de demo, y el resto para preguntas (sección 9).
- **Fecha:** martes 17-11-2026, a las 11:30 (semana 15, SIM-06, sección 6). En este documento el día de la demo se llama **D**.
- **Quién presenta:** los tres; el reparto de cada bloque y de cada paso de la demo está en la sección 9.
- **Dónde:** en `https://micrologist-equipo09.vercel.app`, con el proyecto de Supabase de producción y sus cuentas de prueba ([SIM-10](SIM-10_Despliegue_Vercel.md)). **Plan B**, si el despliegue no está listo: en local con `npm run dev` y la base de desarrollo; todo el guion funciona igual, salvo que el aviso se ejecuta a mano (paso 20) en vez de llegar en la mañana.

---

## 2. Estado del alcance

Estado real al 15-11-2026, según la sección 2 de JOA-08. Todos los ítems del alcance están terminados.

| Ítem | Código | Pruebas | Qué falta |
|---|---|---|---|
| Primera entrega (PB-01 a PB-07) | ✅ | ✅ [SIM-03](SIM-03_Pruebas_Primera_Entrega.md): 14 de 14 | — |
| Conductores (PB-08 a PB-10) | ✅ | ✅ [SIM-08](SIM-08_Pruebas_Conductores.md): 14 de 14 | — |
| Documentos (PB-11 a PB-13), con su sección en las fichas | ✅ PR #48, #53 y #56 | ✅ CP-FUN-23 a CP-FUN-25: 15 de 15 criterios de JOA-10 ([SIM-12](SIM-12_Pruebas_Documentos_Empresa_y_Conductor.md)) | — |
| Conductor asignado al vehículo (PB-24) | ✅ PR #57 | ✅ CP-FUN-33: 5 de 5 (SIM-12) | — |
| Datos de contacto de la empresa (PB-14) | ✅ PR #44 | ✅ CP-FUN-26 (SIM-12) | — |
| Avisos por correo (PB-15 y PB-16) | ✅ PR #55, #74 y #94 (correo con el diseño de la aplicación) | ✅ CP-INT-23 a CP-INT-34, y CP-FUN-27 y CP-FUN-28 con un envío real el 15-11-2026 ([SIM-11](SIM-11_Alertas_por_Correo.md), sección 5) | — |
| Diseño de la aplicación (JOS-13) | ✅ PR #82 y #84: menú lateral, logo y colores naranjos | ✅ Revisado en producción | — |
| Despliegue en Vercel (SIM-10) | ✅ La GitHub Action prueba y publica en `https://micrologist-equipo09.vercel.app` en cada push a `main` (PR #62 y #71) | ✅ Cada PR pasa "Lint, tipos y pruebas" y "Despliegue en Vercel" | — |
| Migraciones en Supabase | ✅ Las cinco, también `conductor_asignado` | ✅ Revisado en producción el 15-11-2026 | — |

Turnos (PB-17 a PB-19), resumen de la flota (PB-20) e ingresos (PB-21 a PB-23) quedan fuera de esta entrega. Turnos se entrega para la defensa de título; el resumen de la flota y los ingresos se evalúan según el tiempo (JOA-08, sección 2, "Para la defensa de título").

---

## 3. Preparación

### 3.1 Antes del día de la demo

- [ ] Actualizar `main` y seguir el README: `npm install`, `npm run db:deploy`, `npm run db:seed` y `npm run db:comprobar`, en desarrollo y en producción (SIM-10, sección 4.2).
- [ ] `npm run build`, `npm run lint` y `npm test` terminan sin errores (Definition of Done, sección 3.1).
- [ ] Que la última ejecución de la GitHub Action en `main` esté en verde y haya publicado en producción (SIM-10, sección 4.5).
- [x] Cuenta de Resend y variables `RESEND_API_KEY`, `CORREO_REMITENTE`, `CRON_SECRET` y `URL_PUBLICA` en Vercel (SIM-11, sección 3). Probado con un envío real el 15-11-2026.
- [x] Las dos empresas tienen como correo de contacto el de la cuenta de Resend: sin dominio propio, el plan gratis solo envía a los correos verificados (SIM-11, sección 3). Los dos correos llegan a la misma bandeja, cada uno con el nombre de su empresa (15-11-2026).
- [x] Datos de producción como los espera el guion (sección 3.7, 15-11-2026).
- [x] Documentos de la sección 3.3 cargados en producción con D = 17-11-2026 (15-11-2026).
- [ ] En la mañana de D, revisar también la carpeta de spam: el remitente de prueba de Resend puede caer ahí (SIM-11, sección 6). Si pasa, marcarlo como "No es spam".
- [ ] Ensayar el guion completo con el equipo al menos una vez, en desarrollo (sección 3.5).

### 3.2 Datos de prueba

Son los del seed (`Aplicación/prisma/seed.ts`): dos empresas ficticias, sin datos personales reales. En producción se cargan los mismos (SIM-10, sección 4.2).

| Empresa | Vehículos | Conductores |
|---|---|---|
| **A** · Transportes Cordillera (ficticia) | BBCD-12 (activo), FGHJ-34 (activo), HJKL-78 (en mantención), XY-4321 (inactivo) | Pedro Soto, María Muñoz y Luis Rojas (inactivo) |
| **B** · Buses del Litoral (ficticia) | BBCD-12 (activo), AB-1234 (en mantención), KLPR-56 (activo) | Pedro Soto y Ana Díaz |

`BBCD-12` y el RUT de Pedro Soto están en las dos empresas a propósito.

### 3.3 Documentos para la demo

El seed no trae documentos, porque su estado depende del día. Se registran desde la aplicación en D − 1 (sección 3.1). En producción, la licencia de Pedro Soto y la revisión técnica de FGHJ-34 salen de documentos que ya existen, editándolos (sección 3.7): como no existe eliminar, registrarlos de nuevo daría el mensaje de repetido. La columna "Ejemplo" usa D = 17-11-2026, el día de la demo: son las fechas que quedaron cargadas en producción.

| Empresa | Documento | Dueño | Vence | Ejemplo | En la demo |
|---|---|---|---|---|---|
| A | Revisión técnica | HJKL-78 | D − 10 | 07-11-2026 | Vencido; no genera aviso. Se renueva en el paso 15 |
| A | Licencia de conducir, descripción "Clase A3" | Pedro Soto | D | 17-11-2026 | Vence hoy; aviso del día del vencimiento |
| A | Permiso de circulación | BBCD-12 | D + 7 | 24-11-2026 | Por vencer; aviso de 7 días |
| A | Revisión técnica | FGHJ-34 | D + 90 | 15-02-2027 | Vigente; no genera aviso |
| A | Permiso de circulación | XY-4321 (inactivo) | D + 7 | 24-11-2026 | No aparece por defecto ni genera aviso |
| B | SOAP | BBCD-12 de B | D + 7 | 24-11-2026 | Solo lo ve la Empresa B y llega en su propio correo |

El documento de XY-4321 se registra mientras el vehículo está activo: reactivarlo, agregar el documento y desactivarlo otra vez.

### 3.4 Valores para registrar en la demo

- **SOAP de BBCD-12** de la Empresa A, con vencimiento **D + 30** (17-12-2026). No está en la sección 3.3, así que se puede registrar; un segundo SOAP muestra el mensaje de repetido.
- **Renovación** de la revisión técnica de HJKL-78 a **D + 1 año** (17-11-2027).

### 3.5 Ensayos y avisos

- **Ensayar en desarrollo** (local, con la base de desarrollo) y presentar en producción. Son bases distintas (SIM-10), así que los ensayos no dejan datos en la de la demo. Como no existe eliminar, un ensayo en producción dejaría el SOAP del paso 13 ya registrado.
- Para ensayar, cargar también en desarrollo los documentos de la sección 3.3, con las fechas calculadas desde el día del ensayo.
- En producción, el proceso diario corre solo, entre las 07:00 y las 08:59 hora de Chile (SIM-11, sección 6). En la mañana de D llegan los correos del paso 19.
- Un aviso ya enviado no se repite (JOA-13, criterio 9). Ejecutar el proceso a mano en D, antes de la demo, no rompe nada: el paso 20 igual muestra que solo llega el documento nuevo.
- **La demo es a las 11:30:** a esa hora el proceso de la mañana ya corrió. Antes de entrar, revisar que llegaron los dos correos del paso 19, también en spam. Si no llegaron, ejecutar el proceso a mano (Vercel > **Settings > Cron Jobs**).
- **Los correos llegan al correo de contacto de las dos empresas ficticias**, que es la casilla de José. Quien los muestre (Joaquín en la apertura y Simón en el paso 19) debe tener esa casilla abierta en el teléfono y en el computador, o recibirlos reenviados antes de la demo.
- **El lunes 16-11 también llegan correos:** como los documentos quedaron cargados el 15-11, el proceso del lunes avisa la licencia (plazo de 1 día) y los permisos y el SOAP de B (plazo de 30). Es lo esperado: el martes cada uno tiene otro plazo (0 y 7 días), así que igual llegan los correos del paso 19.

### 3.6 Cuentas de prueba

Una cuenta por empresa en Supabase Auth, con su perfil en `usuario` ([SIM-02](SIM-02_Inicio_de_Sesion.md), secciones 5 y 6.3). Las de producción tienen contraseñas propias (SIM-10, sección 4.2). Las contraseñas se comparten por un canal privado del equipo y no se escriben en el repositorio.

### 3.7 Datos de producción después de la prueba del 15-11-2026

La prueba del envío real (SIM-11, sección 5) dejó en la Empresa A datos que no están en el seed. No se pueden eliminar, así que se dejaron así. **Hecho el 15-11-2026**, junto con los documentos de la sección 3.3, en una sola transacción en la base de producción, con los mismos valores que habría guardado la aplicación, y comprobado después con una consulta de solo lectura:

| Qué hay hoy | Qué hacer | Para qué |
|---|---|---|
| El nombre de la empresa es "Transportes Cordillera" | En **Mi empresa**, volver a "Transportes Cordillera (ficticia)" | El saludo del correo del paso 19 |
| BBDD23, un vehículo de prueba con Pedro Soto asignado, una revisión técnica vencida y un SOAP | Editarlo con "Sin conductor asignado" y después **Desactivar vehículo** | Sus documentos dejan de verse y de avisar, y la ficha de Pedro Soto muestra solo BBCD-12 (paso 7) |
| BBCD-12 con María Muñoz asignada | Editarlo con "Sin conductor asignado" | El paso 4 parte sin conductor |
| Una revisión técnica de BBCD-12, "Revisión técnica (aa)", que vence el 29-03-2032 | Editarla: pasarla a FGHJ-34, con vencimiento D + 90 y sin la descripción "aa" | Queda como la revisión técnica vigente de FGHJ-34 de la sección 3.3, y BBCD-12 solo con su permiso (paso 6) |
| La licencia de Pedro Soto, que vencía el 18-11-2026 | Fecha cambiada a D (17-11-2026) y descripción "Clase A3" | Es la licencia de la sección 3.3 |
| La Empresa B con otro correo de contacto | Correo de contacto cambiado al de la cuenta de Resend | Su correo del paso 19 |

Después de esto, la Empresa A queda con los vehículos y conductores del seed (sección 3.2) más BBDD23 inactivo, que solo aparece con «Incluir inactivos».

---

## 4. Guion de la demostración

La última columna indica el criterio: **JOA-10 · n** son los de la sección 6 de [JOA-10](JOA-10_Reglas_Modulo_Documentos.md); **PB-24 · n** y **PB-14 · n**, los de esos ítems en JOA-08; **JOA-13 · n**, los de la sección 6 de [JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md).

### 4.1 Acceso y lo que ya estaba (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 1 | Abrir la dirección de Vercel sin sesión. | Redirige al inicio de sesión. | PB-01 · 3 |
| 2 | Entrar con la cuenta de la Empresa A. | Listado de vehículos: BBCD-12, FGHJ-34 y HJKL-78, con una barra de color según su estado. El menú lateral tiene Vehículos, Conductores, Documentos y Mi empresa; abajo, el nombre de la empresa y "Cerrar sesión". | PB-01 · 1 |
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
| 10 | Marcar "Incluir inactivos" y filtrar. | Aparece el permiso de XY-4321 con la marca "(inactivo)". En producción aparecen también los dos documentos de BBDD23, el vehículo de la prueba del 15-11-2026 (sección 3.7). | JOA-10 · 8 |
| 11 | Volver a la ficha de BBCD-12 y presionar **Agregar documento**. | El formulario llega con BBCD-12 elegido y solo con los tipos de un vehículo (sin licencia). | JOA-10 · 9 |
| 12 | Enviar el formulario vacío. Luego escribir la fecha `01-12-2062`. | "Selecciona el tipo de documento." e "Ingresa la fecha de vencimiento (DD-MM-AAAA)."; con la fecha, "La fecha debe estar entre …" con el rango calculado desde hoy. No se guarda nada. | JOA-10 · 2, 4 |
| 13 | Registrar el SOAP con la fecha de la sección 3.4. | Vuelve a la ficha con "Documento registrado correctamente." y el SOAP "Por vencer · Vence en 30 días". | JOA-10 · 1, 5 |
| 14 | Intentar registrar otro SOAP para BBCD-12. | "El vehículo BBCD-12 ya tiene un SOAP registrado. Edítalo para renovarlo.", con el enlace "Ir a editarlo". No se crea nada. | JOA-10 · 3 |
| 15 | En **Documentos**, abrir la revisión técnica vencida de HJKL-78 y cambiar la fecha a la de la sección 3.4. | "Los cambios del documento se guardaron." y ahora está "Vigente". | JOA-10 · 11 |

### 4.4 Datos de la empresa (1 minuto)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 16 | En el menú lateral, abrir **Mi empresa**. | **Mi empresa** con nombre, correo de contacto, teléfono y RUT. | PB-14 · 1 |
| 17 | Borrar el correo de contacto y guardar. | "Ingresa un correo válido." No se guarda. | PB-14 · 2 |
| 18 | Volver a escribir el mismo correo y cambiar el teléfono. Guardar. | "Los datos de tu empresa se guardaron." Ese correo es el que recibe los avisos (JOA-13, sección 2). | PB-14 · 1, 3 |

### 4.5 Avisos por correo (3 minutos)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 19 | Abrir la bandeja de la cuenta de Resend. | Dos correos de la mañana, de "MicroLogist", con la franja naranja y el botón «Ver documentos». El de la Empresa A (asunto "MicroLogist: documentos que vencen hoy", título "Documentos que vencen hoy", "Hola, Transportes Cordillera (ficticia):") trae la licencia de Pedro Soto, con la etiqueta roja "Vence hoy", y el permiso de BBCD-12, con la etiqueta amarilla "Vence en 7 días". No trae la revisión vencida, la vigente ni el permiso de XY-4321. El de la Empresa B (asunto "MicroLogist: 1 documento por vencer") trae solo su SOAP. | JOA-13 · 1, 2, 4, 6, 7 |
| 20 | Ejecutar el proceso a mano: Vercel > **Settings > Cron Jobs** > ejecutar (o el comando de SIM-11, sección 4). | Llega un solo correo nuevo, "MicroLogist: 1 documento por vencer", con el SOAP del paso 13 y la etiqueta naranja "Vence en 30 días". Los avisos de la mañana no se repiten. | JOA-13 · 1, 4, 9 |

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
| 27 | En las herramientas del navegador, vista de dispositivo a 360 px. Recorrer **Documentos**, la ficha de BBCD-12 y el formulario de registro. | Los documentos se ven como tarjetas; ninguna pantalla tiene desplazamiento horizontal y el menú lateral se reemplaza por el botón «Menú», que despliega las mismas opciones. | JOA-10 · 15; JOA-08 · criterio común 4 |

### 4.9 Cierre (1 minuto)

Contar lo que tenemos hoy y lo que traeremos a la defensa de título (secciones 7.1 y 9.2, bloque 9).

---

## 5. Matriz de validación

Estado al 15-11-2026. Todos los criterios que muestra el guion tienen su caso de SIM-04 aprobado.

| Criterio | Estado | Evidencia | Paso |
|---|---|---|---|
| JOA-10 · 1 a 4 (registro y errores) | ✅ Aprobado | CP-FUN-23 ([SIM-12](SIM-12_Pruebas_Documentos_Empresa_y_Conductor.md)); `tests/documentos.test.ts` | 11 a 14 |
| JOA-10 · 5 y 6 (estado y hora de Chile) | ✅ Aprobado | CP-FUN-24 (SIM-12); el criterio 6, con `tests/fechas.test.ts` y `tests/documentos.test.ts` | 6, 8, 13 |
| JOA-10 · 7 a 10 (listados y fichas) | ✅ Aprobado | CP-FUN-24 (SIM-12), también el listado vacío con la Empresa B | 6 a 11 |
| JOA-10 · 11 y 12 (renovar y cambiar de dueño) | ✅ Aprobado | CP-FUN-25 (SIM-12) | 15 |
| JOA-10 · 13 y 14 (separación entre empresas) | ✅ Aprobado | SIM-12, sección 4, también con solicitudes alteradas | 25, 26 |
| JOA-10 · 15 (celular) | ✅ Aprobado | SIM-12, a 360 px | 27 |
| PB-24 · 1 a 5 | ✅ Aprobado | CP-FUN-33 (SIM-12); 2 pruebas de integración en `tests/integracion/base-de-datos.test.ts` | 4 a 7, 21 a 23 |
| PB-14 · 1 y 2 | ✅ Aprobado | CP-FUN-26 (SIM-12); `tests/empresa.test.ts` | 16 a 18 |
| PB-14 · 3 | ✅ Aprobado | CP-INT-24 y el envío real del 15-11-2026: el correo llegó al correo de contacto ([SIM-11](SIM-11_Alertas_por_Correo.md), sección 5) | 18, 19 |
| JOA-13 · 1 a 11 | ✅ Aprobado | CP-FUN-27 y CP-FUN-28 con un envío real (SIM-11, sección 5); CP-INT-24 a CP-INT-34 | 19, 20 |
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

No se conocen errores que bloqueen el flujo principal. Las pruebas de SIM-04 con Supabase (SIM-12) y el envío real en producción (SIM-11) no encontraron ninguno. ERR-02 (guardar sin conexión) se corrigió el 11-11-2026 (SIM-13).

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
- **Para la defensa de título:** turnos (sus reglas ya están en [JOA-14](JOA-14_Reglas_Modulo_Turnos.md)) y la prueba con usuarios. El resumen de la flota, los ingresos y el correo en Outlook se evalúan según el tiempo (JOA-08, sección 2).

### 7.2 Antes de dar por terminada la entrega

- ~~Migraciones aplicadas en desarrollo y producción, y la GitHub Action publicando en Vercel (SIM-10, sección 4.5).~~ Listo.
- ~~Cuenta de Resend y un envío real (SIM-11).~~ Listo el 15-11-2026.
- ~~Pruebas de SIM-04: CP-FUN-23 a CP-FUN-28 y los casos de PB-24.~~ Listo (SIM-12 y SIM-11).
- ~~Datos de producción preparados (sección 3.7) y documentos de la sección 3.3 cargados.~~ Listo el 15-11-2026.
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
- [x] Estado, guion y matriz al día con el diseño nuevo y el envío real (15-11-2026).
- [x] Datos de producción preparados para la demo (sección 3.7, 15-11-2026).
- [x] Guion de la presentación ante la comisión, con tiempos y responsables (sección 9).
- [ ] Guion ensayado con el equipo, con inicio de sesión y en Vercel.
- [ ] Presentación cronometrada en unos 15 minutos, con los tres exponiendo.
- [x] Revisión de José y Simón en el PR.

---

## 9. Guion de la presentación ante la comisión

La presentación del martes 17-11-2026 es la **Evaluación Final de la Fase 2** (Informe Final del Proyecto APT, 30% de la nota), ante una comisión de docentes de la asignatura y de la Dirección de Carrera, como si se expusiera ante la gerencia del proyecto. **Los tres integrantes exponen**, y la participación equitativa se evalúa de forma individual. El proyecto sigue en la Fase 3, hasta la defensa de título, así que se presenta el alcance ajustado tal como está hoy y se cierra con lo que estará listo para la defensa de título (bloque 8). Según las orientaciones del Proyecto APT y el correo de la profesora del 16-11-2026:

- Dura **máximo 20 minutos** y se corta estrictamente en el minuto 20. Por eso la exposición dura unos **15 minutos** y quedan unos 5 para las preguntas de la comisión.
- Hay que **describir lo más relevante y fundamentar las decisiones** tomadas durante el proceso. El centro de la presentación son las decisiones (bloque 6), no la lista de funciones.
- La estructura sigue los campos de la guía del Informe Final, y cada afirmación va con su evidencia: la aplicación funcionando, el correo recibido y los documentos del repositorio.

Por eso no es un *pitch*: es la defensa del proyecto, con la demo como evidencia. Del *pitch* se toma solo el inicio, un problema claro en un minuto.

### 9.1 Estructura y tiempos

| # | Bloque | Minuto | Quién | Se muestra |
|---|---|---|---|---|
| 1 | Apertura | 0:00 – 0:20 | Joaquín | Portada, con el correo en el teléfono |
| 2 | El problema | 0:20 – 1:30 | Simón | Diapositiva con el problema y la multa |
| 3 | Qué nos diferencia del resto | 1:30 – 2:15 | Joaquín | Diapositiva: lo que ya existe y en qué somos distintos ([JOA-07](JOA-07_Innovacion.md)) |
| 4 | Objetivo y alcance | 2:15 – 3:15 | Joaquín | Diapositiva: lo comprometido, lo entregado y lo que viene para la defensa de título |
| 5 | La solución y su arquitectura | 3:15 – 4:45 | José | Capturas de la aplicación y diagrama de arquitectura |
| 6 | Decisiones y su fundamento | 4:45 – 7:15 | Joaquín (producto, 4:45 – 6:00) y José (técnicas, 6:00 – 7:15) | Las decisiones de la sección 9.3 |
| 7 | Demo: el producto funcionando | 7:15 – 11:45 | Joaquín, José y Simón (sección 9.4) | La aplicación en Vercel |
| 8 | Metodología y calidad | 11:45 – 13:45 | Simón | Iteraciones, retroalimentación incorporada y pruebas |
| 9 | Lo que tenemos y lo que viene para la defensa de título | 13:45 – 14:45 | Simón | Diapositiva "Hoy / Para la defensa de título" |
| 10 | Cierre y pregunta a la comisión | 14:45 – 15:00 | Joaquín | Diapositiva "Gracias" |
| — | Preguntas de la comisión | 15:00 – 20:00 | Quien corresponda (sección 9.6) | — |

**Tiempo de cada integrante:** Joaquín, unos 5 minutos y 5 segundos; José, unos 5 minutos; Simón, unos 4 minutos y 55 segundos.

La presentación tiene 13 diapositivas, con más imágenes que texto. La demo solo lleva una diapositiva de transición.

### 9.2 Qué decir en cada bloque

Son ideas guía, no un texto para leer de memoria. Cada uno las dice con sus palabras.

**1. Apertura (Joaquín, 0:20).** Mostrar el correo en el teléfono:
- "Esto le llegó hoy en la mañana a una empresa de transporte: la licencia de uno de sus conductores vence hoy. Así funciona MicroLogist." Presentar al equipo y pasar a Simón.
- Usar el correo de la mañana de D (la licencia de Pedro Soto, «Vence hoy»), no el del 15-11: aquel decía «vence en 3 días» porque recuperó un plazo atrasado, y 3 días no es uno de los plazos (30, 7, 1 y el mismo día).

**2. El problema (Simón, 1:10).**
- "En una empresa chica de transporte, la revisión técnica está en una carpeta, el SOAP en el correo y los conductores en una planilla que lleva una sola persona. Nadie avisa cuando algo vence."
- "Circular con el SOAP, la revisión técnica o el permiso de circulación vencidos tiene una multa de 1 a 1,5 UTM cada uno, y el vehículo puede terminar en el corral: es un servicio que no se presta" ([JOA-04](JOA-04_Product_Vision.md), [JOA-07](JOA-07_Innovacion.md)).

**3. Qué nos diferencia del resto (Joaquín, 0:45).**
- "Ya existen soluciones, pero no están pensadas para una empresa chica de pasajeros."
- Las de GPS (Geotab, Black GPS) piden instalar un equipo en cada vehículo y miran la ruta, no los papeles. Los software de flotas (Fleetio, cloudFleet) también avisan vencimientos, pero traen muchos módulos de mantenimiento, y Fleetio está en inglés. Odoo obliga a implementar un sistema completo.
- "Avisar vencimientos no es nuevo; lo nuevo es el enfoque: sin equipos, solo lo necesario, con los documentos de Chile y avisando antes de que venza" ([JOA-07](JOA-07_Innovacion.md), sección 4). No decir que somos los únicos que avisan.

**4. Objetivo y alcance (Joaquín, 1:00).**
- "MicroLogist permite registrar vehículos, conductores y documentos, ver de un vistazo qué está vencido o por vencer, y avisa por correo antes de que venza."
- "Lo que entregamos: vehículos, conductores con su vehículo asignado, documentos con su estado, los datos de la empresa y los avisos por correo, para varias empresas con sus datos separados. Está publicado en Vercel."
- "Lo que quedó fuera, y por qué: la entrega final se adelantó a la semana 15, así que priorizamos lo que hace útil el control de vencimientos. Turnos, que ya tiene sus reglas escritas, lo traeremos a la defensa de título; el resumen de la flota y los ingresos los evaluaremos según el tiempo" ([JOA-08](JOA-08_Product_Backlog.md), sección 2, PR #50).

**5. La solución y su arquitectura (José, 1:30).** "Es un monolito modular en capas, cliente-servidor y multiempresa, sobre servicios administrados" ([JOS-06](JOS-06_Manual_Tecnico.md), sección 2). El producto de un vistazo y la arquitectura: una aplicación Next.js en Vercel, Supabase para la base de datos y el inicio de sesión, y el proceso diario de avisos con Vercel Cron y Resend. Todo en planes gratuitos y sin equipos en los vehículos.

**6. Decisiones (Joaquín y José, 2:30).** Es el bloque que más pesa. Joaquín presenta las de producto y José las técnicas, con la tabla de la sección 9.3. Basta con 4 o 5 bien explicadas; el resto queda para las preguntas.

**7. Demo (Joaquín, José y Simón, 4:30).** Ver la sección 9.4, que dice quién muestra cada paso. Mientras se muestra, decir qué decisión o criterio se está viendo: "esto es lo que pidió la profesora en la revisión del 28-10".

**8. Metodología y calidad (Simón, 2:00).**
- "Trabajamos con Scrum en 4 iteraciones de 2 semanas, con un tablero en GitHub Projects, Sprint Backlog y retrospectivas" ([SIM-06](SIM-06_Sprint_Backlog_y_Retrospectivas.md)).
- "Cada cambio entró por un PR, más de 100 en total, y casi todos con la aprobación de otro integrante; los pocos que no la tuvieron quedaron registrados en la retrospectiva. Cada PR pasa automáticamente lint, tipos, 130 pruebas unitarias, pruebas de integración con PostgreSQL, `npm audit` y pruebas de rendimiento, y se publica solo en Vercel" ([SIM-10](SIM-10_Despliegue_Vercel.md)).
- "El plan de pruebas tiene 94 casos: 70 aprobados y ninguno rechazado. Los parciales y pendientes tienen el motivo escrito, por ejemplo, Outlook no se probó" ([SIM-04](SIM-04_Plan_de_Pruebas.md), sección 9).

**9. Lo que tenemos y lo que viene para la defensa de título (Simón, 1:00), y 10. cierre (Joaquín, 0:15).**
- **Qué ajustamos por las retroalimentaciones anteriores:**
  - la profesora pidió, el 28-10, vincular el conductor al vehículo y ver los documentos en la ficha, y se agregó PB-24;
  - el 05-11 pidió publicar con GitHub Actions, y así se publica (SIM-10);
  - la revisión de Fase 1 y 2 pidió más tipos de prueba y justificar la metodología, y se agregaron las pruebas de rendimiento (PR #80) y la justificación en la Guía 1.5 (JOS-15, PR #90).
- **Límites, dichos con honestidad:**
  - sin dominio propio, el correo puede llegar a spam y solo se envía a correos verificados;
  - Outlook no se probó;
  - no hay prueba con usuarios reales todavía (CP-USA-01 y 02).
- **Hoy tenemos:** el alcance ajustado completo y publicado. "El MVP resuelve el problema principal: que un documento no venza sin que nadie se entere."
- **Para la defensa de título** (confirmado por el equipo el 16-11-2026):
  - **Turnos** (PB-17 a PB-19): sus reglas y criterios ya están escritos en [JOA-14](JOA-14_Reglas_Modulo_Turnos.md). Con esto se cumple lo que el objetivo de Fase 1 decía sobre turnos. En JOA-08 ya tiene la etapa "Defensa de título".
  - **Prueba con usuarios** (CP-USA-01 y 02): cierra el "validar" del objetivo y los indicadores 1 y 5 de [JOA-04](JOA-04_Product_Vision.md) (sección 6.2).
  - **La retroalimentación de esta presentación,** incorporada.
  - **Por evaluar, según el tiempo:** el resumen de la flota (PB-20); los ingresos (PB-21 a PB-23), que eran opcionales y todavía no tienen reglas; y el correo en Outlook (CP-COM-05).
- **Para la retroalimentación:** terminar con una pregunta concreta a la comisión: "Para la defensa de título, ¿qué priorizarían después de turnos: el resumen de la flota o los ingresos?".

### 9.3 Decisiones y su fundamento

| Decisión | Fundamento | Quién la explica |
|---|---|---|
| Avisar **antes** del vencimiento: 30, 7 y 1 días antes, y el mismo día | El aviso sirve para renovar a tiempo; uno de algo ya vencido llega tarde. Si un plazo no se avisó, llega el siguiente con los días reales ([JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md)). | Joaquín |
| Solo correo, sin WhatsApp ni SMS | Costo cero y sin aprobaciones de terceros; el correo de contacto de la empresa es el destinatario (JOA-13). | Joaquín |
| Desactivar en vez de eliminar | Se conserva la información y se evita perder datos por error ([JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md)). | Joaquín |
| Renovar un documento es editar su fecha | Un vehículo tiene un solo SOAP; si cada renovación creara uno nuevo, el anterior quedaría para siempre como "vencido" ([JOA-10](JOA-10_Reglas_Modulo_Documentos.md)). | Joaquín |
| Alcance recortado (PR #50) | La entrega se adelantó a la semana 15; se priorizó el control de vencimientos y lo que pidió la profesora. | Joaquín |
| Datos separados por empresa en cada consulta, más RLS en la base | Varias empresas usan el mismo sistema y ninguna puede ver lo de otra; se probó con dos empresas, también con solicitudes alteradas ([SIM-12](SIM-12_Pruebas_Documentos_Empresa_y_Conductor.md)). | José |
| Next.js, Supabase y Vercel | Gratis para un MVP, con inicio de sesión y base PostgreSQL incluidos, y una sola aplicación para el computador y el celular ([JOS-06](JOS-06_Manual_Tecnico.md)). | José |
| Publicar con GitHub Actions | Vercel rechazaba la ruta con espacios que pide el curso, y la profesora pidió publicar así. Además, nada llega a producción sin pasar las pruebas (SIM-10). | José |
| Resend sin dominio propio | Plan gratis. El costo, que se dice abiertamente, es que el correo puede caer en spam la primera vez ([SIM-11](SIM-11_Alertas_por_Correo.md)). | José |

### 9.4 Demo recortada (4 minutos y medio)

Los pasos son los de la sección 4. Los demás quedan por si la comisión los pide.

| Tiempo | Quién | Pasos | Qué se muestra | Qué se dice |
|---|---|---|---|---|
| 0:20 | Joaquín | 1 y 2 | Sin sesión redirige al login; con la Empresa A, el listado de vehículos con el menú lateral | "Cada empresa entra con su cuenta." |
| 1:10 | Joaquín | 4 a 7 | Asignar a Pedro Soto a BBCD-12; la ficha muestra al conductor con su licencia "Vence hoy"; la ficha de Pedro muestra su vehículo | "Esto lo pidió la profesora el 28-10: ver quién maneja cada vehículo y si sus documentos están al día." |
| 1:30 | José | 8 y 13 | El listado de documentos ordenado por vencimiento, con sus estados; registrar el SOAP de la sección 3.4 | "El estado se calcula con la fecha de hoy en Chile; no hay que actualizarlo a mano." |
| 0:45 | Simón | 19 | Los dos correos de la mañana, uno por empresa | "Un correo al día por empresa, con todo lo que necesita atención." |
| 0:45 | José | 24 a 26 | Con la Empresa B, solo sus documentos; la dirección de un documento de A responde "No encontrado" | "Aunque se conozca la dirección, no se ven datos de otra empresa." |

Quedan fuera, salvo que pregunten: validaciones del formulario (12 y 14), renovar (15), Mi empresa (16 a 18), ejecutar el proceso a mano (20), desactivar al conductor (21 a 23) y la vista de celular (27).

### 9.5 Preparación del día

- [ ] Llegar con 15 minutos de anticipación y probar la red del lugar.
- [ ] Antes de entrar, comprobar que llegaron los dos correos de la mañana, revisando también spam; si no llegaron, ejecutar el proceso en Vercel (**Settings > Cron Jobs**) (sección 3.5).
- [ ] Tener abiertos: las diapositivas, un navegador con la Empresa A, otro (o una ventana de incógnito) con la Empresa B, y el correo en el teléfono y en el computador.
- [ ] Copiar antes la dirección del documento del paso 26, para no buscarla en vivo.
- [ ] **Plan B:** si la aplicación o la red fallan, mostrar las capturas de `Aplicación/Capturas` y seguir el guion con ellas: las 12 a 15 (vehículos, conductores, documentos y la ficha con el conductor asignado, con el diseño actual) y las 10 y 11 (el correo de aviso).
- [ ] Alguien lleva el tiempo y avisa a los 11 minutos, al terminar la demo.

### 9.6 Preguntas probables y quién responde

| Pregunta | Quién | Respuesta corta |
|---|---|---|
| ¿Por qué no avisan cuando el documento ya venció? | Joaquín | Porque el objetivo es renovar a tiempo; después del vencimiento, el documento queda en rojo en el listado (JOA-13). |
| ¿Cómo se aseguran de que una empresa no vea los datos de otra? | José | Toda consulta filtra por la empresa de la sesión, la base tiene claves foráneas compuestas y RLS, y se probó con dos empresas y solicitudes alteradas. |
| ¿Qué pasa si falla el envío del correo? | Simón | Se reintenta de inmediato; si vuelve a fallar, queda registrado y se reintenta al día siguiente. Nunca se manda dos veces el mismo aviso. |
| ¿Cómo probaron el sistema? | Simón | Plan de pruebas con 94 casos (70 aprobados), pruebas automáticas en cada PR y pruebas con dos empresas de prueba. |
| ¿Por qué Scrum y no otra metodología? | Simón | El plazo era fijo y cambió: cuando la entrega pasó a la semana 15, con el backlog priorizado bastó reordenarlo. Cascada exige cerrar los requisitos al inicio, y Kanban no tiene iteraciones con fecha; de Kanban sí se tomó el tablero (README, JOS-15). |
| ¿Cuánto cuesta mantenerlo? | José | Hoy nada: todo está en planes gratis. Con más uso, el primer costo sería el dominio propio para los correos. |
| ¿Lo probaron con usuarios reales? | Joaquín | Todavía no: es parte de lo que traeremos a la defensa de título (CP-USA-01 y 02). |
| ¿Por qué no está turnos, si estaba en el objetivo? | Joaquín | Porque la entrega se adelantó a la semana 15 y priorizamos el control de vencimientos, que es el problema principal (PR #50). Las reglas de turnos ya están escritas y es lo primero para la defensa de título. |
| ¿Qué tipo de arquitectura usaron? | José | Un monolito modular en capas: una sola aplicación Next.js con páginas, acciones del servidor, validación y acceso a datos separados, sobre una base PostgreSQL multiempresa compartida, en servicios administrados (Vercel y Supabase). No usamos microservicios porque somos tres con plazo fijo y un monolito alcanza para el MVP (JOS-06, sección 2). |
| ¿Cómo se hace el despliegue? ¿Usan Docker? | José | Docker se usa solo para desarrollo: con `docker compose up --build` levanta la aplicación y un PostgreSQL local con las migraciones y los datos de prueba, sin las claves de Supabase ([JOS-05](JOS-05_Entorno_Docker.md)). El despliegue no usa Docker: cada cambio pasa por una GitHub Action que corre las pruebas y publica en Vercel, y la base de datos está en Supabase ([SIM-10](SIM-10_Despliegue_Vercel.md)). Así no hay un servidor propio que mantener. La comisión la hizo el 17-11-2026. |
| ¿En qué se diferencian de Fleetio o cloudFleet? | Joaquín | Ellos también avisan vencimientos. La diferencia es el enfoque: sin módulos de mantenimiento que configurar, en español, con los documentos y la patente de Chile, y pensado para una empresa chica de pasajeros (JOA-07, sección 4). |
| ¿Qué harían distinto? | Cada uno | Una idea por persona, de la retrospectiva de la Iteración 4 (SIM-06, sección 4.4): Joaquín, configurar los servicios externos en la primera semana; Simón, crear la tarjeta antes de abrir el PR para que el tablero refleje el trabajo; José, revisar los PR cada día en vez de acumularlos. |
