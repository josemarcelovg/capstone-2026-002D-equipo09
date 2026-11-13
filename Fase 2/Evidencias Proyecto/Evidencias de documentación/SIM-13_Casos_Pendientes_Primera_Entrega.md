# SIM-13 · Casos pendientes de la primera entrega

| | |
|---|---|
| **Tarea** | [SIM-13] Ejecutar los casos de SIM-04 que seguían pendientes desde la primera entrega |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Ejecutado: 6 casos aprobados y 1 parcial (falta Lighthouse). El error ERR-02 y la observación menor se corrigieron el mismo día |
| **Fecha** | 11-11-2026 · actualizado el mismo día (ERR-02 y observación 1 corregidos) |

Este documento registra la ejecución de los casos del [plan de pruebas](SIM-04_Plan_de_Pruebas.md) que seguían pendientes desde la primera entrega y que se podían probar en local con una sesión iniciada: CP-FUN-06, 08, 11 y 12, CP-COM-02 y 03, y la parte de CP-USA-03 que no necesita Lighthouse (teclado, foco, etiquetas y contraste). La sección 9 de SIM-04 los tenía en "Iniciar sesión en la aplicación local". Usa el formato de [SIM-03](SIM-03_Pruebas_Primera_Entrega.md) y de [SIM-12](SIM-12_Pruebas_Documentos_Empresa_y_Conductor.md).

También deja registrada la revisión en pantalla de la corrección de OBS-03 de SIM-12 (PR #86), que no se había podido ver porque la sesión de prueba había vencido.

---

## 1. Resumen

| Caso | Qué se comprueba | Resultado |
|---|---|---|
| CP-FUN-06 | Listado de vehículos: columnas, orden, búsqueda, filtro por estado y mensaje sin vehículos | ✅ (el mensaje sin vehículos, en el código) |
| CP-FUN-08 | Cambiar la patente al editar | ✅ |
| CP-FUN-11 | Errores en un formulario con datos ya escritos | ✅ |
| CP-FUN-12 | Guardar con una conexión lenta | ✅ |
| CP-COM-02 | Flujos principales a 768 px | ✅ con la observación 1 |
| CP-COM-03 | Flujos principales a 1280 px | ✅ |
| CP-USA-03 | Teclado, foco, etiquetas y contraste | 🟡 Aprobado sin Lighthouse; la auditoría queda para la versión publicada (SIM-10) |
| OBS-03 de SIM-12 | Enlace de la página "No encontrado" | ✅ Revisada en pantalla |

**Se encontró un error, ERR-02** (sección 4): al simular la conexión caída mientras se guarda, el formulario se reemplaza por la pantalla "No pudimos cargar los vehículos" y se pierde lo escrito. Está fuera de lo que pide CP-FUN-12 (una conexión lenta, que sí funciona bien). Severidad mayor, sin datos expuestos: no impide terminar la etapa (SIM-04, sección 5), pero se debe corregir. También hay una observación menor de presentación a 768 px. **Los dos se corrigieron y se volvieron a probar el 11-11-2026** (sección 4).

---

## 2. Entorno y datos

| | |
|---|---|
| **Versión probada** | Rama `sim-12-observaciones` en el commit `3744592` (`main` en `2331721` más el PR #86). Las últimas revisiones de teclado del registro y la ficha de conductor se hicieron con `main` (`2331721`), que en esas pantallas es igual |
| **Fecha y hora** | 11-11-2026, entre las 19:00 y las 19:45 (hora de Chile) |
| **Dónde** | En local, con `npm run dev` desde `Evidencias de sistema/Aplicación`, Node.js 24.20 |
| **Base de datos e inicio de sesión** | Proyecto `micrologist-dev` en Supabase |
| **Navegador** | Chromium, emulando 1280 × 800, 768 × 1024 y 375 × 812 px |
| **Cuenta** | `admin.empresa.a@micrologist.cl` (Empresa A, "Transportes Cordillera"). La contraseña no se registra en este documento. |

**Cómo se comprobó cada resultado:** se leyó lo que muestra cada pantalla y se midió con la consola del navegador: el ancho del documento y de los controles, el elemento que tiene el foco, el estilo del foco, la etiqueta de cada campo y el contraste de cada texto con su fondo. Al terminar se consultó la base con una consulta de **solo lectura**.

**Datos:** no se creó ningún registro. Para CP-FUN-08 y CP-FUN-12 se cambió la patente de `SIMT03` de la A a `SIMT04` y su color a "Blanco SIM", y después se devolvieron sus valores (`SIMT03`, color Gris). Para CP-COM-02 y CP-USA-03 se guardaron, sin cambios, `SIMT03` y los datos de la empresa A.

---

## 3. Casos de prueba

### 3.1 Funcionales (1280 px, cuenta A)

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **CP-FUN-06** Listado | a) Abrir `/vehiculos`. b) Buscar `bb-cd 12`, `12` y `zzzz99`. c) Filtrar por cada estado y marcar "Incluir inactivos". d) Ver el mensaje cuando la empresa no tiene vehículos. | Lo que piden PB-05 y la sección 4 de JOA-01: columnas patente, tipo, marca/modelo, año, n.º interno y estado; orden por patente; búsqueda por patente; filtro por estado; "Aún no tienes vehículos registrados" con un botón para registrar. | a) Columnas Patente, Tipo, Marca y modelo, Año, N.º interno y Estado, más "Ver / editar". Los 9 vehículos no inactivos, ordenados de ABCD-20 a SIMT-03. b) `bb-cd 12`: solo BBCD-12. `12`: BBCD-12, PQRS-12, SIMD-12 y SIMF-12. `zzzz99`: "No hay vehículos que coincidan con la búsqueda." y el enlace "Limpiar". c) En mantención: HJKL-78. Activo: los 8 activos. Inactivo: SIMG-12 y XY-4321. "Incluir inactivos": los 11, en orden. d) No se pudo ver en pantalla, porque las dos empresas de prueba tienen vehículos (A 11 y B 4). En `src/app/vehiculos/(listado)/page.tsx`, el mensaje y el botón "Registrar vehículo" aparecen solo si la empresa no tiene ningún vehículo, ni siquiera inactivo. Es el mismo diseño que se aprobó en pantalla para conductores (SIM-08, criterio 7) y documentos (SIM-12, criterio 10). | ✅ (d, revisado en el código) |
| **CP-FUN-08** Patente al editar | En la ficha de SIMT-03, guardar con la patente: a) `ABC123`; b) `bbcd-12`; c) `xy 4321` (un vehículo inactivo de la A); d) `simt-04`. Revisar la ficha después de los rechazos. | Se vuelven a validar el formato y que no esté repetida. | a) "La patente debe tener el formato BBCD12 o AB1234." debajo del campo (lo revisa el formulario). b) "Ya tienes un vehículo registrado con la patente BBCD-12." (lo revisa el servidor). c) "Ya tienes un vehículo registrado con la patente XY-4321.". Después de los tres rechazos, la ficha seguía con `SIMT03` y color Gris. d) Vuelve al listado con "Los cambios del vehículo se guardaron." y aparece SIMT-04. Después se devolvió a `SIMT03`. | ✅ |
| **CP-FUN-11** Errores sin borrar lo escrito | a) En la ficha de SIMT-03, cambiar el color a "Blanco SIM" y enviar con las patentes de CP-FUN-08 a, b y c. b) En "Registrar vehículo", llenar todos los campos (KLPR56, Van, Hyundai, H-1, n.º interno, color y observaciones) con año 1975 y capacidad "ve", y enviar. | Mensajes en español, junto a su campo, y no se borra lo que el usuario escribió. | a) Cada error aparece debajo de "Patente", en español. El color "Blanco SIM" y la patente escrita siguen en el formulario, también después de la respuesta del servidor. b) "El año debe estar entre 1980 y 2027." y "La capacidad debe ser un número entre 1 y 100." debajo de su campo. El cursor queda en "Año" y los otros 9 campos conservan lo escrito. Cada campo con error queda marcado como inválido y enlazado a su mensaje (`aria-invalid` y `aria-describedby`). No se guardó el vehículo. | ✅ |
| **CP-FUN-12** Conexión lenta | Desde la consola del navegador, retrasar 4 s cada solicitud de guardado. Cambiar la patente de SIMT-03 a `simt-04` y guardar. | Se ve un estado de carga y termina con un mensaje de confirmación o de error. | Mientras espera, el botón dice "Guardando…" y está deshabilitado, así que no se puede enviar dos veces. Al terminar vuelve al listado con "Los cambios del vehículo se guardaron.". Con la conexión caída en vez de lenta aparece ERR-02 (sección 4). | ✅ |

### 3.2 Compatibilidad

Las 10 pantallas revisadas son el listado, el registro y la ficha de vehículos, conductores y documentos, y "Mi empresa".

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **CP-COM-03** 1280 px | Abrir las 10 pantallas a 1280 × 800. Los casos de la sección 3.1 se ejecutaron a este ancho. | Los flujos principales se completan. | En ninguna pantalla el documento es más ancho que la ventana. Los tres listados se ven como tabla. Los flujos de buscar, filtrar, editar y guardar de la sección 3.1 se completaron. | ✅ |
| **CP-COM-02** 768 px | Abrir las 10 pantallas a 768 × 1024. Buscar `simt`, abrir la tarjeta de SIMT-03 y guardar sin cambios. | Se completan sin desplazamiento horizontal. | Sin desplazamiento horizontal en ninguna. El menú lateral se mantiene y los listados se ven como tarjetas en dos columnas. Los campos de los formularios miden al menos 184 px. El flujo termina con "Los cambios del vehículo se guardaron.". Los filtros de vehículos y documentos quedan apretados (observación 1). | ✅ |

### 3.3 Usabilidad: CP-USA-03 sin Lighthouse

| Parte | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **Foco visible** | Recorrer con Tab el listado, el registro y la ficha de vehículos; el listado, el registro y la ficha de conductores; el listado y el registro de documentos, y "Mi empresa". | Todo se alcanza con el teclado y el foco siempre se ve. | Se recorren en orden el menú, las acciones, los filtros, las filas y los campos. Cada elemento muestra el foco: un contorno naranjo de 2 px en enlaces y botones, un borde y un anillo naranjos en campos y listas, y el contorno del navegador en la casilla "Incluir inactivos". El único elemento sin foco visible es el botón de las herramientas de desarrollo de Next.js, que solo existe con `npm run dev`. | ✅ |
| **Uso solo con teclado** | a) En "Registrar documento", elegir el tipo con las flechas. b) En "Mi empresa", llegar a "Guardar cambios" con Tab y apretar Enter. c) A 375 px, abrir el menú con Enter y entrar a "Conductores". | Las acciones se completan sin el mouse. | a) El tipo cambia a SOAP y aparece el campo "Vehículo", con su etiqueta. b) "Los datos de tu empresa se guardaron.". c) El menú se abre con las 4 secciones; Enter en "Conductores" abre `/conductores` y cierra el menú. La confirmación de desactivar es la del navegador, que se responde con el teclado. | ✅ |
| **Etiquetas** | Revisar cada campo de los formularios y filtros de esas pantallas. | Cada campo tiene etiqueta. | Todos tienen: 11 en vehículos, 4 en conductores, 5 en documentos (con "Vehículo" o "Conductor" según el tipo), 4 en "Mi empresa" y los de los filtros de los tres listados. | ✅ |
| **Contraste** | Medir el contraste de cada texto visible con su fondo en los tres listados, la ficha de SIMT-03 y "Mi empresa". | Al menos 4,5:1 (JOA-05, RNF-USA-06). | 241 textos; ninguno bajo 4,5:1, ni bajo 3:1 en los textos grandes. El más bajo tiene 4,79:1. | ✅ |
| **Lighthouse** | Auditoría de accesibilidad. | 90 puntos o más. | No se ejecutó: se hará en la versión publicada, junto con CP-REN-01 (SIM-10). | ⏳ |

### 3.4 Corrección de SIM-12

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **OBS-03 de SIM-12** (PR #86) | Con sesión, abrir un documento, un conductor y un vehículo que no existen, y `/documentos/no-existe/editar`. | La página "No encontrado" lleva al listado de la sección donde se estaba. | Las cuatro responden 404 "No encontrado". Los enlaces son "Volver al listado de documentos" (`/documentos`), "Volver al listado de conductores" (`/conductores`), "Volver al listado de vehículos" (`/vehiculos`) y "Volver al listado de documentos". | ✅ |

---

## 4. Errores y observaciones

**ERR-02 · Guardar sin conexión**

| | |
|---|---|
| **Caso que lo encontró** | CP-FUN-12, al probar además una conexión caída (se relaciona con CP-FUN-14 y RNF-USA-04) |
| **Cómo reproducirlo** | 1. Abrir la ficha de un vehículo y cambiar un campo. 2. Cortar la conexión (en las pruebas, desde la consola del navegador se hizo fallar la solicitud de guardado). 3. Apretar "Guardar cambios". |
| **Resultado esperado** | Un mensaje de que no se pudo guardar, junto al formulario, sin borrar lo escrito (RNF-USA-04 y RNF-USA-05). |
| **Resultado obtenido** | El botón muestra "Guardando…" y, cuando falla la solicitud, todo el formulario se reemplaza por la pantalla de error "No pudimos cargar los vehículos. Puede ser un problema de conexión. Intenta nuevamente.". El mensaje habla de cargar y no de guardar, y lo escrito se pierde. En la base no cambia nada: los datos ya guardados no se pierden. |
| **Alcance** | El mismo patrón está en los formularios de vehículos, conductores, documentos y "Mi empresa" (`await guardar…(…)` sin manejar el error de red), y en los botones de desactivar y reactivar. |
| **Severidad** | Mayor (SIM-04, sección 5): una funcionalidad falla, pero se puede seguir recargando y escribiendo de nuevo. No expone datos de otra empresa. |
| **Propuesta** | En cada formulario, si la solicitud falla, mostrar "No pudimos guardar. Revisa tu conexión e intenta nuevamente." como error general, conservando lo escrito. |
| **Corrección** | `llamarAlServidor()` (`src/lib/guardado.ts`) llama a la acción del servidor y, si la solicitud falla, devuelve el aviso en vez de lanzar el error. Deja pasar las redirecciones de Next.js con `unstable_rethrow`, así que guardar con conexión sigue volviendo al listado. La usan los cuatro formularios y los dos botones. La prueban 4 casos de `tests/guardado.test.ts`. |
| **Cómo se volvió a probar** | Con los mismos pasos, haciendo fallar las solicitudes desde la consola: en la ficha de SIMT-03 (con el color cambiado), en la de un conductor (con el nombre cambiado), en la edición de un documento (con observaciones escritas) y en "Mi empresa" (con un teléfono escrito) aparece "No pudimos guardar. Revisa tu conexión e intenta nuevamente." arriba del formulario y lo escrito sigue ahí. "Reactivar vehículo" en XY-4321 y "Reactivar conductor" muestran el mismo aviso debajo del botón, y los dos siguen inactivos. Con la conexión repuesta, guardar SIMT-03 vuelve al listado con "Los cambios del vehículo se guardaron.". `npm test` (129 de 129), `npm run lint` y `tsc --noEmit` sin errores. |
| **Responsable y estado** | Simón. ✅ Cerrado el 11-11-2026 |

**Observaciones menores** (presentación; no bloquean):

| # | Observación | Cómo verla | Propuesta | Estado |
|---|---|---|---|---|
| 1 | A 768 px, con el menú lateral de 256 px, los filtros de vehículos y de documentos se ponen en una sola fila: el buscador de patente y las listas quedan de 77 a 81 px. No se ve completo el ejemplo "BBCD12", y "Todos" se corta en "Todo". Se pueden usar, y el buscador de conductores (166 px) se lee bien. | Abrir `/vehiculos` o `/documentos` a 768 px. | Dejar los filtros en dos filas hasta los 1024 px, el mismo ancho en que el listado cambia a tabla. | ✅ Corregida el 11-11-2026: los filtros de vehículos y documentos van en dos filas hasta los 1024 px (`sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]`). A 768 px los campos miden 194 px y se ven completos "BBCD12" y "Todos"; a 1024 px vuelven a una fila (205 a 209 px). Sin desplazamiento horizontal |

---

## 5. Verificación en la base de datos

Consulta de solo lectura al terminar (hora de Chile):

| Dato | Resultado |
|---|---|
| Vehículos de la Empresa A | 11, los mismos que antes de las pruebas. No existen `SIMT04` ni `KLPR56` en la A: los intentos rechazados no crearon nada. |
| `SIMT03` de la A | Activo, color Gris, n.º interno 100 (los valores de SIM-03). Última modificación a las 19:25, el guardado sin cambios de CP-COM-02 |
| Empresa A | Última modificación a las 19:28, el guardado con el teclado de CP-USA-03 |
| `SIMT03` y datos de la Empresa B | Sin cambios (modificados por última vez el 21-10 y el 16-10) |

---

## 6. Relación con los requisitos

| Requisito | Casos |
|---|---|
| PB-05 · Listado de vehículos | CP-FUN-06 |
| PB-06 · Editar un vehículo (criterio 3, patente) | CP-FUN-08 |
| RNF-USA-03 · Mensajes claros en español | CP-FUN-08 y CP-FUN-11 |
| RNF-USA-04 · No se borra lo escrito | CP-FUN-11. ERR-02 lo incumplía cuando fallaba la conexión; ya está corregido |
| RNF-USA-05 · Estado de carga y mensaje final | CP-FUN-12 |
| RNF-USA-06 · Accesibilidad básica | CP-USA-03, sin Lighthouse |
| RNF-COM-02 · Tablet (768 px) | CP-COM-02 |
| RNF-COM-03 · Computador (1280 px) | CP-COM-03 |

---

## 7. Limitaciones y pendientes

- **Lighthouse** (accesibilidad de CP-USA-03, y CP-REN-01) se ejecutará en la versión publicada, con sesión (SIM-10).
- **La pantalla de inicio de sesión** no se recorrió con el teclado, porque había una sesión iniciada. Se revisará con la auditoría de Lighthouse.
- **El mensaje sin vehículos** de CP-FUN-06 se revisó en el código. Para verlo en pantalla haría falta una empresa de prueba sin vehículos.
- **ERR-02 y la observación 1 ya están corregidos** y se volvieron a probar en local (sección 4). Falta verlos en la versión publicada, cuando se una el PR.
- **Tarjeta [SIM-13]** en el tablero del Project, para enlazar este documento.

---

## 8. Checklist de SIM-13

- [x] CP-FUN-06, 08, 11 y 12, CP-COM-02 y 03 y CP-USA-03 (sin Lighthouse) ejecutados con la cuenta de la Empresa A (sección 3).
- [x] Cada caso con pasos, resultado esperado y resultado obtenido (DoD, sección 3.3).
- [x] Datos de prueba devueltos a sus valores y confirmados con una consulta de solo lectura (sección 5).
- [x] ERR-02 y la observación 1 registrados, con cómo reproducirlos y una propuesta (sección 4).
- [x] Corrección de OBS-03 de SIM-12 revisada en pantalla (sección 3.4).
- [x] Evidencia sin datos personales reales: empresa y cuenta ficticias, sin contraseñas (sección 2).
- [x] ERR-02 y la observación 1 corregidos y vueltos a probar el 11-11-2026, con `tests/guardado.test.ts` (sección 4).
- [ ] Revisión de José y Joaquín en el PR.
