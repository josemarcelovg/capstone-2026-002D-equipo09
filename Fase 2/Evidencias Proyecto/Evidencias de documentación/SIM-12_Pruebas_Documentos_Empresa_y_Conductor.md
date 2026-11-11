# SIM-12 · Pruebas de documentos, datos de la empresa y conductor asignado

| | |
|---|---|
| **Tarea** | [SIM-12] Probar documentos, datos de la empresa y conductor asignado con dos empresas ficticias |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Ejecutado: 23 de 23 criterios aprobados. Las 2 observaciones menores se corrigieron el 11-11-2026 |
| **Fecha** | 10-11-2026 · actualizado el 11-11-2026 (observaciones corregidas) |

Este documento prueba el módulo de documentos (PB-11 a PB-13) con los 15 criterios de aceptación de [JOA-10](JOA-10_Reglas_Modulo_Documentos.md) (sección 6), los datos de contacto de la empresa (PB-14) y el conductor asignado al vehículo (PB-24), con los criterios de [JOA-08](JOA-08_Product_Backlog.md). Usa las dos empresas ficticias y el mismo formato que [SIM-08](SIM-08_Pruebas_Conductores.md). Corresponde a los casos CP-FUN-23 a CP-FUN-26 y CP-FUN-33 del [plan de pruebas](SIM-04_Plan_de_Pruebas.md), y a CP-SEG-03 y CP-SEG-04 repetidos para documentos.

Con esto, PB-11 a PB-14 y PB-24 tienen sus casos de SIM-04 aprobados, que era lo que faltaba para marcarlos como terminados en JOA-08 ([JOA-19](JOA-19_Guion_Entrega_Final.md), sección 7.2).

---

## 1. Resumen

| Grupo | Resultado |
|---|---|
| Documentos: registro, criterios 1 a 4 (Empresa A) | ✅ 4 de 4 |
| Documentos: estado, criterios 5 y 6 | ✅ 2 de 2 (el 6, con pruebas automáticas) |
| Documentos: listados, criterios 7 a 10 | ✅ 4 de 4 |
| Documentos: renovar y corregir, criterios 11 y 12 | ✅ 2 de 2 |
| Documentos: separación entre empresas, criterios 13 y 14 | ✅ 2 de 2 |
| Documentos: adaptabilidad, criterio 15 | ✅ 1 de 1 |
| Datos de la empresa (PB-14), criterios 1 a 3 | ✅ 3 de 3 (el 3, con CP-INT-24; el envío real queda para CP-FUN-27) |
| Conductor asignado (PB-24), criterios 1 a 5 | ✅ 5 de 5 |
| `npm test` | ✅ 121 de 121 |
| `npm run test:integracion` | ✅ 50 de 50, con la aplicación levantada |

No se encontraron errores. Las 2 observaciones menores de mensajes en pantalla se corrigieron el 11-11-2026, y una tercera se retiró porque no era un error (sección 7).

---

## 2. Entorno y datos

| | |
|---|---|
| **Versión probada** | `main` en el commit `e8dc8fe` (PR #77), con las pruebas de rendimiento de la rama `sim-04-pruebas-rendimiento`, que no cambian la aplicación |
| **Fecha y hora** | 10-11-2026, entre las 19:04 y las 19:26 (hora de Chile). "Hoy" para los estados: 10-11-2026 |
| **Dónde** | En local, con `npm run dev` desde `Evidencias de sistema/Aplicación`, Node.js 24.20 |
| **Base de datos e inicio de sesión** | Proyecto `micrologist-dev` en Supabase, con las cinco migraciones aplicadas (`_prisma_migrations`, consulta de solo lectura) |
| **Navegador** | Chromium, en tamaño de computador y emulando un celular de 360 × 740 px |
| **Cuentas** | `admin.empresa.a@micrologist.cl` (Empresa A, "Transportes Cordillera") y `admin.empresa.b@micrologist.cl` (Empresa B, "Buses del Litoral"). Las contraseñas no se registran en este documento. |

**Datos antes de probar** (consulta de solo lectura): la A tenía 8 vehículos (1 inactivo), 3 conductores, todos inactivos (los de SIM-08), y 1 documento; la B, 4 vehículos, 1 conductor inactivo y 0 documentos.

Las pruebas crearon sus propios datos en la Empresa A, todos ficticios: patentes que empiezan con `SIM` y conductores cuyo nombre empieza con "Prueba SIM-12".

| Dato | Para qué |
|---|---|
| Conductores "Prueba SIM-12 Uno" (`1.000.021-1`), "Dos" (`1.000.048-3`) e "Inactivo" (`1.000.056-4`) | Licencias, conductor asignado y dueño inactivo |
| Vehículos SIMD-12 (con Uno asignado al registrarlo), SIMF-12 (sin conductor) y SIMG-12 (desactivado después) | Documentos de vehículo, conductor asignado y dueño inactivo |
| 8 documentos: SOAP y revisión técnica de SIMD-12, permiso de circulación y "Seguro de pasajeros" de SIMF-12, SOAP de SIMG-12 y una licencia de cada conductor | Estados, listados, renovación y separación |

Los vencimientos se eligieron para cubrir cada estado: ayer (09-11-2026), hoy, mañana, en 5, 10 y 30 días, en 31 días (11-12-2026) y en 60 días (09-01-2027).

**Cómo se ingresaron:** desde el navegador, llenando cada formulario y enviándolo una vez por carga de página. En la prueba de fechas del criterio 4 se enviaron cuatro fechas seguidas sin recargar, y la última, `2027-01-09`, guardó el SOAP de SIMD-12. Es correcto, porque la aplicación acepta ese formato (sección 7). Era uno de los documentos planificados, así que se mantuvo. Los envíos siguientes se hicieron de a uno, esperando cada respuesta.

---

## 3. Pruebas automáticas

| Prueba | Resultado |
|---|---|
| `npm test` | ✅ 121 de 121. Incluye las reglas de documentos (`tests/documentos.test.ts` y `tests/documentos-filtros.test.ts`), de la empresa (`tests/empresa.test.ts`) y de fechas (`tests/fechas.test.ts`). |
| `npm run test:integracion` | ✅ 50 de 50, con la aplicación corriendo: los casos de documentos y de PB-24 con la base de datos, CP-INT-10 a CP-INT-34 y la comprobación de que no quedaron datos. |

---

## 4. Casos de prueba

**Estados:** ✅ Aprobado · 🟡 Parcial · ❌ No aprobado.

### 4.1 Documentos (Empresa A)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **1** Registro válido | Registrar el SOAP de SIMD-12 y la licencia "Clase A3" de Prueba SIM-12 Uno. Recargar el listado. | Se guardan y siguen al recargar. | "Documento registrado correctamente." Al recargar aparecen "SOAP · De SIMD-12 · Vence el 09-01-2027" y "Licencia de conducir (Clase A3) · De Prueba SIM-12 Uno". | ✅ |
| **2** Tipo, dueño vacío y dueño inactivo | a) SOAP sin vehículo. b) "Otro" sin indicar el dueño. c) Licencia de conducir con un vehículo, en una solicitud alterada. d) SOAP de SIMG-12 y licencia de "Prueba SIM-12 Inactivo" ya desactivados, en solicitudes alteradas, porque el formulario no los ofrece. | Cada caso muestra su error y no se guarda nada. | a) "Selecciona el vehículo al que pertenece el documento." b) "Indica si el documento es de un vehículo o de un conductor." c) "Ese tipo de documento no corresponde a un vehículo." d) "No puedes agregar documentos a un vehículo inactivo. Reactívalo primero." y "…a un conductor inactivo…". El formulario solo ofrece vehículos que no están inactivos y conductores activos. En la base no se guardó ninguno. | ✅ |
| **3** Documento repetido | Registrar un segundo SOAP para SIMD-12. | Mensaje para editar el existente; no se crea nada. | "El vehículo SIMD-12 ya tiene un SOAP registrado. Edítalo para renovarlo." con el enlace "Ir a editarlo". En la base sigue habiendo un solo SOAP de SIMD-12. | ✅ |
| **4** Fechas | a) Fecha vacía. b) `31-02-2027`. c) `01-12-2062` y `01-12-2015`. d) Una fecha pasada dentro del rango (09-11-2026, el permiso de SIMF-12). | a) y b) "Ingresa la fecha…". c) El rango. d) Se acepta y queda vencido. | a) y b) "Ingresa la fecha de vencimiento (DD-MM-AAAA)." c) "La fecha debe estar entre 10-11-2021 y 10-11-2036." d) Se guardó como "Vencido · Venció ayer". | ✅ |
| **5** Estado | Ver el listado con los 8 documentos. | "Vigente" a más de 30 días; "Por vencer" con los días que faltan; "Vence hoy"; "Vencido" desde el día siguiente. | Ayer: "Vencido · Venció ayer". Hoy: "Por vencer · Vence hoy". Mañana: "Vence mañana". En 5, 10 y 30 días: "Vence en 5 días", "Vence en 10 días" y "Vence en 30 días". En 31 y 60 días: "Vigente". | ✅ |
| **6** Fecha de Chile | — | A las 23:30 de Chile, un documento que vence ese día sigue en "Vence hoy". | La prueba se hizo a las 19:00, así que este criterio queda cubierto por pruebas automáticas: `tests/fechas.test.ts` comprueba que a las 23:30 de Chile (02:30 UTC del día siguiente) sigue siendo el mismo día, y `tests/documentos.test.ts`, que ese día se muestra "Vence hoy". Las pantallas usan las mismas funciones. | ✅ |
| **7** Orden y filtros | Ver el listado sin filtros y filtrar por cada estado, por SOAP y por licencias por vencer. | Ordenado por vencimiento; cada filtro muestra solo lo suyo. | Del más vencido al más lejano. Vencidos: el permiso de SIMF-12. Por vencer: las 3 licencias, el SOAP de SIMG-12 y la revisión técnica de SIMD-12. Vigentes: "Seguro de pasajeros", el SOAP de SIMD-12 y la revisión técnica de BBCD-12. SOAP: los 2 SOAP. Licencias por vencer: las 3 licencias. | ✅ |
| **8** Dueños inactivos | Desactivar SIMG-12 y "Prueba SIM-12 Inactivo" y ver el listado sin y con «Incluir inactivos». | No aparecen por defecto; con el filtro, sí. | Sin el filtro, 7 documentos. Con «Incluir inactivos», 9: aparecen la licencia de "Prueba SIM-12 Inactivo (inactivo)" y el SOAP de "SIMG-12 (inactivo)". | ✅ |
| **9** Fichas | Abrir la ficha de SIMD-12 y la de Prueba SIM-12 Uno, y tocar "Agregar documento". Abrir la ficha de SIMG-12 ya inactivo. | Cada ficha muestra sus documentos; "Agregar documento" abre el formulario con ese dueño elegido. | La ficha de SIMD-12 muestra su revisión técnica y su SOAP con su estado; la de Uno, su licencia. "Agregar documento" abre "Registrar documento · Del vehículo SIMD-12" con el vehículo elegido y solo los tipos de vehículo. La ficha de SIMG-12 inactivo muestra su SOAP, no tiene el botón y dice "No puedes agregar documentos a un vehículo inactivo. Reactívalo primero." | ✅ |
| **10** Sin documentos | Con la cuenta B, que no tiene documentos, abrir `/documentos`. | Mensaje y botón para registrar. | "Aún no tienes documentos registrados" y el botón "Registrar documento". | ✅ |
| **11** Renovar | Editar el permiso de SIMF-12, vencido el 09-11-2026, con la fecha 09-11-2027. Recargar. | Pasa a "Vigente" y el cambio persiste. | "Los cambios del documento se guardaron." Al recargar: "Vence el 09-11-2027 · Vigente". | ✅ |
| **12** Cambiar el dueño | a) Pasar "Seguro de pasajeros" de SIMF-12 a SIMD-12. b) Pasarlo a Prueba SIM-12 Uno con una solicitud alterada, porque el formulario no ofrece conductores. | a) Funciona. b) Se rechaza. | a) Se guardó y ahora es "De SIMD-12". b) "Este documento es de un vehículo: solo puedes pasarlo a otro vehículo." El documento siguió en SIMD-12. | ✅ |
| **15** Celular de 360 px | Abrir el listado, el registro (con "Otro") y la edición con un ancho de 360 px. | Sin desplazamiento horizontal; el menú con "Documentos" cabe. | En las tres pantallas el ancho del documento es 360 px. El listado se ve como tarjetas y el menú muestra "MicroLogist", "Vehículos", "Conductores", "Documentos" y "Cerrar sesión" sin desbordarse. | ✅ |

### 4.2 Separación entre empresas (documentos)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **13** Cada empresa ve solo lo suyo | Con la cuenta B, ver el listado de documentos con y sin «Incluir inactivos». Abrir la ficha de SIMD-12 y la de Prueba SIM-12 Uno (A) por su dirección. | B no ve documentos de A en el listado ni en las fichas. | El listado de B dice "Aún no tienes documentos registrados" en los dos casos, aunque A tenía 9. Las dos fichas de A responden 404 "No encontrado". | ✅ |
| **14** Abrir, editar o registrar en la otra empresa | Con la cuenta B: a) abrir y editar el SOAP de SIMD-12 por su id, también con `?volver=ficha`; b) abrir `/documentos/nuevo?vehiculo=` con el id de SIMD-12; c) registrar un SOAP para SIMD-12 y una licencia para Prueba SIM-12 Uno con solicitudes alteradas. | "No encontrado" y los datos de A no cambian. | a) y b) 404 "No encontrado", sin datos de A. c) "No encontramos el vehículo o conductor elegido. Recarga la página e intenta nuevamente." El formulario de B solo ofrece vehículos de B (la B tiene su propio BBCD-12). En la base, A siguió con sus 9 documentos sin cambios y B con 0. | ✅ |

Las solicitudes alteradas de los criterios 2, 12 y 14 se hicieron desde el navegador: se cambiaron los campos del formulario antes de enviarlo (se quitó el campo del dueño y se agregó otro con el id elegido), igual que en SIM-03 y SIM-08.

### 4.3 Datos de la empresa (PB-14, Empresa A)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **1** Ver y editar | Abrir "Mi empresa". Agregar el teléfono `9 0000 0012`, guardar y recargar. Cambiar el correo de contacto a uno de prueba y guardar. Al terminar, dejar el teléfono vacío y el correo original. | Se ven el nombre, el correo y el teléfono, y los cambios se guardan. | Muestra nombre, correo de contacto, teléfono y RUT (opcional, "Una vez guardado, no se puede cambiar", no se tocó). "Los datos de tu empresa se guardaron."; al recargar, el teléfono es `+56 9 0000 0012`. Al cambiar el correo pide confirmación: "Las alertas de vencimiento llegarán a … ¿Confirmas?". Al terminar, el teléfono quedó vacío y el correo, el original. | ✅ |
| **2** Correo obligatorio y con formato | Guardar con el correo vacío y con `contacto@`, quitando antes la validación del navegador para que la solicitud llegue al servidor. | Error y no se guarda. | Los dos: "Ingresa un correo válido." Al recargar, los datos seguían iguales. | ✅ |
| **3** Destinatario de los avisos | — | El correo de contacto recibe los avisos. | Lo cubre CP-INT-24: el proceso arma un correo por empresa dirigido a su `email_contacto` ([SIM-11](SIM-11_Alertas_por_Correo.md)). La pantalla lo dice: "Aquí llegan las alertas de vencimiento." El envío real queda para CP-FUN-27, cuando esté la cuenta de Resend. | ✅ |

### 4.4 Conductor asignado (PB-24, Empresa A)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **1** Elegir o dejar sin conductor | Registrar SIMD-12 con Prueba SIM-12 Uno, SIMF-12 sin conductor, y después editar SIMF-12 para asignarle a Uno. | Se guarda lo elegido. | Los dos registros y la edición se guardaron ("Los cambios del vehículo se guardaron."). La edición de SIMD-12 trae a Uno elegido. | ✅ |
| **2** Solo conductores activos de la empresa | Ver la lista de conductores al registrar un vehículo, antes y después de desactivar "Prueba SIM-12 Inactivo". Con la cuenta B, la misma lista. | Solo los activos de la empresa. | Antes: los 3 "Prueba SIM-12", sin los 3 inactivos de SIM-08. Después: solo Dos y Uno. En la B solo aparece "Sin conductor asignado": su único conductor está inactivo y no se ofrece ninguno de la A. | ✅ |
| **3** Ficha del vehículo | Abrir la ficha de SIMD-12. | Muestra al conductor y sus documentos con su estado, además de los del vehículo. | "Conductor asignado: Prueba SIM-12 Uno · 1.000.021-1 · +56 9 0000 0021", con "Sus documentos: Licencia de conducir (Clase A3) · Vence hoy", debajo de los documentos del vehículo. | ✅ |
| **4** Varios vehículos y desactivar | Con Uno asignado a SIMD-12 y SIMF-12, desactivarlo y revisar los dos vehículos; reactivarlo y revisar su ficha. | Quedan sin conductor y la confirmación y el mensaje lo avisan; reactivarlo no los vuelve a asignar. | La confirmación dice "¿Desactivar a Prueba SIM-12 Uno? Dejará de aparecer en el listado y sus 2 vehículos quedarán sin conductor asignado" y el mensaje "Conductor desactivado. … 2 vehículos quedaron sin conductor asignado.". Los dos vehículos quedaron sin conductor. Al reactivarlo: "No tiene vehículos asignados." | ✅ |
| **5** Ficha del conductor | Abrir la ficha de Uno con SIMD-12 y SIMF-12 asignados. | Muestra sus vehículos con enlace. | "Vehículos asignados: SIMD-12, SIMF-12", cada uno con enlace a su ficha. | ✅ |

---

## 5. Verificación en la base de datos

Consultas de solo lectura antes y después de los casos manuales. No se modificaron datos a mano.

| Momento | Resultado |
|---|---|
| Antes de las pruebas | A: 8 vehículos, 3 conductores inactivos y 1 documento. B: 4 vehículos, 1 conductor inactivo y 0 documentos. Migraciones: las cinco aplicadas. |
| Al terminar | A: 9 documentos, los 8 de la prueba con las fechas, dueños y descripciones que indican los criterios (un solo SOAP de SIMD-12, el permiso renovado al 09-11-2027 y "Seguro de pasajeros" en SIMD-12). B: 0 documentos. Ningún registro de los intentos inválidos. |

Los datos de prueba quedaron en la base de desarrollo, con SIMG-12 y "Prueba SIM-12 Inactivo" desactivados. Sirven para la prueba de avisos con un envío real (CP-FUN-27, SIM-11), porque hay documentos que vencen en los próximos días.

Al guardar "Mi empresa", el nombre de la Empresa A quedó sin el espacio que tenía al final ("Transportes Cordillera "), porque la aplicación quita los espacios sobrantes al guardar. Es el comportamiento esperado.

---

## 6. Relación con los requisitos

| Criterios | Casos de SIM-04 | Requisitos |
|---|---|---|
| JOA-10, 1 a 4 | CP-FUN-23 | PB-11, RNF-USA-03, RNF-DIS-02 |
| JOA-10, 5 a 10 | CP-FUN-24 | PB-12 |
| JOA-10, 11 y 12 | CP-FUN-25 | PB-13, RNF-DIS-02 |
| JOA-10, 13 y 14 | CP-SEG-03 y CP-SEG-04 para documentos | RNF-SEG-02 |
| JOA-10, 15 | CP-COM-01 para documentos | RNF-COM-01 |
| PB-14, 1 a 3 | CP-FUN-26, CP-INT-24 | PB-14 |
| PB-24, 1 a 5 | CP-FUN-33 | PB-24 |

---

## 7. Errores y observaciones

No se encontraron errores. Quedaron dos observaciones menores, que no bloqueaban ningún criterio y se corrigieron el 11-11-2026:

| ID | Dónde | Observación | Corrección |
|---|---|---|---|
| OBS-01 | Registro de documentos | Con un tipo de vehículo, sin vehículo y sin fecha, solo aparecía el error de la fecha. El del vehículo aparecía recién al corregirla. JOA-10 (sección 4) pide el error junto a cada campo. | ✅ Las reglas del dueño estaban en un `superRefine` de Zod, que no se ejecuta si otro campo ya falló. Ahora `validarDocumento` las revisa aparte y muestra todos los errores a la vez. Lo prueba `tests/documentos.test.ts` («muestra a la vez el error del dueño y el de otro campo»). |
| OBS-03 | Página "No encontrado" | Al abrir un documento de otra empresa, la página ofrecía "Volver al listado de vehículos". Es la misma observación OBS-01 de SIM-08, ahora también en documentos. | ✅ El enlace lleva al listado de la sección donde se estaba: documentos, conductores o vehículos. Lo decide `listadoParaVolver()` en `src/lib/navegacion.ts`, probada en `tests/navegacion.test.ts`. Revisada en pantalla el 11-11-2026, con la cuenta A: un documento, un conductor y un vehículo que no existen responden 404 con "Volver al listado de documentos", "Volver al listado de conductores" y "Volver al listado de vehículos", y `/documentos/no-existe/editar` vuelve al de documentos. |

**OBS-02 se retiró.** Se había anotado que la fecha `2027-01-09` mostraba el mensaje del rango en vez del de formato. No era así: la aplicación acepta ese formato a propósito, porque es el que entrega un campo de tipo fecha (`leerFecha` en `src/lib/fechas.ts` y la prueba «acepta la fecha del campo de tipo fecha»). Ese envío se guardó bien: es el SOAP de SIMD-12 que vence el 09-01-2027. Su respuesta llegó después de que se leyó la pantalla, que todavía mostraba el mensaje del intento anterior (sección 2).

---

## 8. Checklist de SIM-12

- [x] Casos detallados en SIM-04: CP-FUN-23 a CP-FUN-26 y CP-FUN-33 (sección 6.1).
- [x] Pruebas automáticas completas: 121 unitarias y 50 de integración (sección 3).
- [x] Casos manuales ejecutados con las dos empresas: 15 de 15 criterios de JOA-10, 3 de 3 de PB-14 y 5 de 5 de PB-24 (sección 4).
- [x] Resultados confirmados en la base con consultas de solo lectura (sección 5).
- [x] Observaciones OBS-01 y OBS-03 corregidas, con sus pruebas: 125 unitarias y 43 de integración el 11-11-2026 (sección 7).
- [ ] Tarjeta [SIM-12] en el tablero.
- [ ] Revisión de José y Joaquín en el PR.
