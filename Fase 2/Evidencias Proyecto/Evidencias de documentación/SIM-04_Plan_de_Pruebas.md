# SIM-04 · Plan de pruebas

| | |
|---|---|
| **Tarea** | [SIM-04] Definir el plan de pruebas |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | Joaquín Orellana (requisitos y backlog) y José Vargas (rendimiento y datos) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 21-10-2026 |

Este plan define cómo se prueba MicroLogist: qué tipos de prueba hay, con qué técnicas se ejecutan, en qué entorno y con qué datos, cuándo se hacen y cómo se registran los resultados y los errores. Cada caso de prueba tiene un identificador que no cambia, y cada requisito de [JOA-05](JOA-05_Requisitos_No_Funcionales.md) queda cubierto por al menos un caso (sección 10). Los casos de la primera entrega ya tienen un estado, gracias a la ejecución de [SIM-03](SIM-03_Pruebas_Primera_Entrega.md). Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Objetivo y alcance

**Objetivo:** comprobar antes de cada entrega que MicroLogist hace lo acordado en [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) y en el [Product Backlog](JOA-08_Product_Backlog.md), y que cumple los requisitos no funcionales de JOA-05, con evidencia que cualquier integrante pueda revisar.

| Etapa | Qué se prueba | Nivel de detalle de los casos |
|---|---|---|
| **Primera entrega** | Inicio y cierre de sesión, vehículos y separación entre empresas (PB-01 a PB-07). | Detallados; la mayoría ya ejecutados en SIM-03. |
| **MVP completo** | Conductores, documentos, avisos por correo y turnos (PB-08 a PB-20). | Un caso por ítem del backlog. Se detallan cuando exista el documento de reglas de cada módulo, como pide la sección 8 de JOA-08. |
| **Opcional** | Ingresos (PB-21 a PB-23). | Igual que el MVP, si el módulo se hace. |

**Fuera de alcance:** lo que JOA-01 deja fuera del producto (sección 1.4: GPS, aplicación nativa, avisos por WhatsApp o SMS, pagos, integraciones externas). Tampoco se hacen pruebas de carga masiva ni auditorías de seguridad externas.

---

## 2. Tipos de prueba

JOA-05 (sección 7) parte con cuatro tipos y deja pendiente qué hacer con rendimiento y disponibilidad. **Propuesta de SIM-04:** agregar un quinto tipo, *Rendimiento y disponibilidad*, para que esos requisitos no queden sin caso **[POR CONFIRMAR]** con el equipo (JOA-05, sección 8).

| Tipo | Qué comprueba | Requisitos que cubre | Prefijo de los casos |
|---|---|---|---|
| **Funcionales** | Que el sistema hace lo que dicen JOA-01 y el backlog. | Criterios de JOA-01 e ítems PB-xx; RNF-USA-03, RNF-USA-04, RNF-USA-05, RNF-DIS-02 y RNF-DIS-04 | `CP-FUN` |
| **Seguridad** | Acceso solo con sesión, separación entre empresas, validación en el servidor y manejo de secretos. | RNF-SEG-01 a RNF-SEG-10 | `CP-SEG` |
| **Compatibilidad** | Que funciona en celular, tablet, computador y en los navegadores acordados. | RNF-COM-01 a RNF-COM-05 | `CP-COM` |
| **Usabilidad** | Que se aprende sin ayuda, que los usuarios lo encuentran útil y que es accesible. | RNF-USA-01, RNF-USA-02 y RNF-USA-06 | `CP-USA` |
| **Rendimiento y disponibilidad** | Tiempos de carga y respuesta, volumen de datos, disponibilidad, respaldo y facilidad para levantar el proyecto. | RNF-REN-01 a RNF-REN-04, RNF-DIS-01, RNF-DIS-03 y RNF-DIS-05 | `CP-REN` |

Los identificadores `CP-xxx-nn` no se reutilizan ni se renumeran, igual que los `PB-xx` y los `RNF-xxx-nn`.

---

## 3. Técnicas

| Técnica | Para qué se usa | Cómo |
|---|---|---|
| **Pruebas automáticas** | Reglas que no dependen de la pantalla: validación de vehículos y reglas de acceso. | `npm test` desde `Evidencias de sistema/Aplicación` (hoy 24 pruebas en `tests/`). Corren en cada PR de código (DoD, sección 3.1). |
| **Pruebas manuales en el navegador** | Flujos completos, como los vería el usuario. | Con las cuentas de prueba de la Empresa A y la Empresa B. |
| **Solicitudes alteradas** | Comprobar que el servidor protege los datos aunque el navegador mande otra cosa. | Herramientas del navegador: modificar la solicitud antes de enviarla (por ejemplo, cambiar un id o agregar `empresa_id`). |
| **Consultas de solo lectura a la base de datos** | Confirmar el efecto real de una acción, sin confiar solo en lo que dice la pantalla. | Consultas `select` sobre la tabla del módulo, antes y después de probar. Nunca se modifican datos a mano. |
| **Mediciones** | Tiempos de carga y de respuesta, accesibilidad. | Lighthouse en Chrome y pestaña "Red" de las herramientas del navegador, con limitación de red cuando el caso lo pide. |
| **Pruebas con usuarios** | Usabilidad (RNF-USA-01 y RNF-USA-02). | Sección 6.4. |
| **Revisión** | Requisitos que se comprueban leyendo configuración, código o historial. | Esquema de Prisma, configuración de Supabase Auth, historial de git y `npm audit`. |

---

## 4. Entornos y datos

| Entorno | Para qué | Notas |
|---|---|---|
| **Local con Supabase** | La mayoría de los casos. | `npm run dev` desde `Aplicación`, Node.js 24, `.env` con el proyecto `micrologist-dev` ([SIM-02](SIM-02_Inicio_de_Sesion.md), sección 5). |
| **Local con Docker** | Revisar la aplicación sin claves de Supabase. | No sirve para las pruebas de acceso: en Docker no se inicia sesión ([JOS-05](JOS-05_Entorno_Docker.md)). |
| **Versión desplegada (Vercel)** | HTTPS, rendimiento, disponibilidad y persistencia tras volver a desplegar. | Cuando exista el despliegue **[POR CONFIRMAR]**. |

**Datos de prueba:**

- Las dos empresas ficticias del seed y sus cuentas de prueba: `admin.empresa.a@micrologist.cl` (Empresa A) y `admin.empresa.b@micrologist.cl` (Empresa B).
- Los vehículos que se crean al probar llevan patentes fáciles de reconocer, que empiezan con `SIM` (por ejemplo, `SIMT03`), y se anotan en el registro de cada ejecución, porque la aplicación no elimina vehículos.
- No se usan datos personales reales. Las contraseñas de las cuentas de prueba no se escriben en ningún documento ni archivo del repositorio.

---

## 5. Severidad y criterios de entrada y de salida

**Severidad de un error:**

| Severidad | Cuándo |
|---|---|
| **Bloqueante** | Impide completar un flujo principal, pierde datos o deja ver o modificar datos de otra empresa. |
| **Mayor** | Una funcionalidad falla, pero hay una forma de seguir; o un requisito de seguridad que no expone datos no se cumple. |
| **Menor** | Problemas de presentación o de texto que no impiden usar el sistema. |

**Criterios de entrada** (antes de ejecutar las pruebas de una etapa):

- `npm run build`, `npm run lint` y `npm test` sin errores (DoD, sección 3.1).
- El código a probar está en `main` o en la rama del PR, y se anota el commit.
- El entorno y las cuentas de prueba están listos (sección 4).

**Criterios de salida** (para dar por probada una etapa):

- El 100 % de los casos de la etapa ejecutados.
- 0 errores bloqueantes y 0 errores mayores de seguridad abiertos.
- Los errores menores registrados, con responsable.
- La evidencia guardada (sección 8).

---

## 6. Casos de prueba

**Estados:** ✅ Aprobado · 🟡 Parcial (se probó una parte) · ❌ No aprobado · ⏳ Pendiente · 📝 Por detallar (falta el documento de reglas del módulo).

### 6.1 Funcionales (`CP-FUN`)

**Primera entrega**

| ID | Qué se comprueba | Resultado esperado | Origen | Estado |
|---|---|---|---|---|
| CP-FUN-01 | Iniciar sesión con credenciales correctas. | Entra y ve el listado de su empresa. | JOA-01 7.1, PB-01 | ✅ SIM-03 (21-10-2026) |
| CP-FUN-02 | Registrar un vehículo válido. | Se guarda y sigue al recargar. | JOA-01 7.5, PB-04, RNF-DIS-02 | ✅ SIM-03 |
| CP-FUN-03 | Registrar una patente que ya existe en la empresa. | Mensaje de duplicado; no se crea nada. | JOA-01 7.6, PB-04 | ✅ SIM-03 |
| CP-FUN-04 | Escribir la patente con minúsculas, espacios o guion. | Se guarda normalizada (`fghj-34` → `FGHJ34`). | JOA-01 7.7, PB-04 | ✅ SIM-03 |
| CP-FUN-05 | Enviar campos obligatorios vacíos y datos fuera de formato. | Cada campo muestra su error en español, con los mensajes de JOA-01; no se guarda nada. | JOA-01 7.8, RNF-USA-03 | ✅ SIM-03 |
| CP-FUN-06 | Listado: columnas, orden por patente, búsqueda por patente, filtro por estado y mensaje cuando no hay vehículos. | Lo que pide PB-05 y la sección 4 de JOA-01. | PB-05 | ⏳ Pendiente |
| CP-FUN-07 | Ver el detalle de un vehículo y editarlo. | Los cambios se guardan y siguen al recargar; vuelve al listado con mensaje. | JOA-01 7.9, PB-06, RNF-DIS-02 | ✅ SIM-03 |
| CP-FUN-08 | Cambiar la patente al editar. | Se vuelven a validar el formato y que no esté duplicada. | PB-06 (criterio 3) | ⏳ Pendiente |
| CP-FUN-09 | Desactivar y reactivar un vehículo. | Pide confirmación; sale del listado normal; aparece con "Incluir inactivos"; se puede reactivar. | JOA-01 7.10, PB-07, RNF-USA-04 | ✅ SIM-03 |
| CP-FUN-10 | Cerrar sesión. | Vuelve a la pantalla de inicio de sesión. | PB-02 (criterio 1) | ✅ SIM-03 |
| CP-FUN-11 | Errores en un formulario con datos ya escritos. | Los mensajes están en español, junto a su campo, y no se borra lo que el usuario escribió. | RNF-USA-03, RNF-USA-04 | ⏳ Pendiente |
| CP-FUN-12 | Guardar con una conexión lenta (simulada en el navegador). | Se ve un estado de carga y termina con un mensaje de confirmación o de error. | RNF-USA-05 | ⏳ Pendiente |
| CP-FUN-13 | Persistencia al recargar, al cerrar sesión y al volver a desplegar. | 0 registros perdidos. | RNF-DIS-02 | 🟡 Recargar y cerrar sesión aprobados en SIM-03; falta volver a desplegar |

**MVP completo** (📝 se detallan con el documento de reglas de cada módulo)

| ID | Qué se comprueba | Origen | Estado |
|---|---|---|---|
| CP-FUN-14 | Si la base de datos o el proveedor de correo no responden, el usuario ve un mensaje claro y no se pierden datos. | RNF-DIS-04 | ⏳ Pendiente (MVP) |
| CP-FUN-20 | Registrar un conductor. | PB-08 | 📝 |
| CP-FUN-21 | Listar, buscar y editar conductores. | PB-09 | 📝 |
| CP-FUN-22 | Desactivar y reactivar un conductor. | PB-10 | 📝 |
| CP-FUN-23 | Registrar un documento con su vencimiento. | PB-11 | 📝 |
| CP-FUN-24 | Ver los documentos y su estado (vigente, por vencer, vencido). | PB-12 | 📝 |
| CP-FUN-25 | Renovar o corregir un documento. | PB-13 | 📝 |
| CP-FUN-26 | Ver y editar los datos de contacto de la empresa. | PB-14 | 📝 |
| CP-FUN-27 | Aviso por correo antes del vencimiento. | PB-15 | 📝 |
| CP-FUN-28 | Avisos sin duplicados y con registro de envíos. | PB-16 | 📝 |
| CP-FUN-29 | Asignar un turno. | PB-17 | 📝 |
| CP-FUN-30 | Ver los turnos por fecha. | PB-18 | 📝 |
| CP-FUN-31 | Editar o anular un turno. | PB-19 | 📝 |
| CP-FUN-32 | Resumen de la flota (si entra en el MVP). | PB-20 | 📝 |

**Opcional**

| ID | Qué se comprueba | Origen | Estado |
|---|---|---|---|
| CP-FUN-40 | Activar y desactivar el módulo de ingresos. | PB-21 | 📝 |
| CP-FUN-41 | Registrar un ingreso. | PB-22 | 📝 |
| CP-FUN-42 | Ver los ingresos de un período. | PB-23 | 📝 |

### 6.2 Seguridad (`CP-SEG`)

Cuando se agregue cada módulo del MVP (conductores, documentos, turnos e ingresos), los casos CP-SEG-01, CP-SEG-03, CP-SEG-04 y CP-SEG-06 se repiten para ese módulo.

| ID | Qué se comprueba | Resultado esperado | Origen | Estado |
|---|---|---|---|---|
| CP-SEG-01 | Abrir cada página privada sin sesión. | Todas redirigen al inicio de sesión. | RNF-SEG-01, JOA-01 7.3 | ✅ SIM-03 |
| CP-SEG-02 | Después de cerrar sesión, volver atrás y enviar una operación privada. | No se muestran ni se modifican datos. | RNF-SEG-01, JOA-01 7.4 | ✅ SIM-03 |
| CP-SEG-03 | Listado de cada empresa. | Ninguna ve registros de la otra. | RNF-SEG-02, JOA-01 7.11 | ✅ SIM-03 |
| CP-SEG-04 | Abrir o modificar un registro de otra empresa por su dirección o con una solicitud alterada. | "No encontrado" (404, nunca 403) y los datos de la otra empresa no cambian. | RNF-SEG-02, JOA-01 7.12 | ✅ SIM-03, confirmado en la base de datos |
| CP-SEG-05 | Registrar en dos empresas la misma patente. | Se acepta en ambas, sin conflicto. | RNF-SEG-02, JOA-01 7.13 | ✅ SIM-03 |
| CP-SEG-06 | Enviar un `empresa_id` distinto en la solicitud. | El registro queda en la empresa de la sesión. | RNF-SEG-03 | ✅ SIM-03, confirmado en la base de datos |
| CP-SEG-07 | Enviar datos inválidos sin pasar por el formulario y ejecutar las pruebas automáticas. | El servidor rechaza el 100 % de los datos inválidos de la sección 6.2 de JOA-01. | RNF-SEG-04 | ✅ SIM-03 y `npm test` (24 de 24) |
| CP-SEG-08 | Revisar el modelo de datos y probar el inicio de sesión con un correo inexistente y con una contraseña incorrecta. | No hay columna de contraseña; el mensaje es idéntico en los dos casos. | RNF-SEG-05, JOA-01 7.2 | ✅ SIM-03 y revisión del esquema (21-10-2026) |
| CP-SEG-09 | Reglas de contraseña y sesión vencida. | Contraseña de 8 caracteres o más; una sesión vencida redirige al inicio de sesión sin mostrar datos. | RNF-SEG-06 | 🟡 Largo mínimo configurado en Supabase (SIM-02); falta acordar la duración de la sesión y probar una sesión vencida |
| CP-SEG-10 | Buscar contraseñas, claves y archivos `.env` en el repositorio y en su historial. | 0 secretos. | RNF-SEG-07 | ✅ Revisión del 21-10-2026: 0 archivos `.env` y ningún patrón de clave en el historial |
| CP-SEG-11 | Entrar a la versión desplegada con `http://`. | Redirige a `https://` y todas las páginas usan HTTPS. | RNF-SEG-08 | ⏳ Pendiente (no hay despliegue) |
| CP-SEG-12 | Forzar errores (por ejemplo, con la base de datos desconectada en un entorno de prueba). | Ningún mensaje incluye trazas, consultas ni nombres de tablas. | RNF-SEG-09 | 🟡 Inicio de sesión con el servicio caído y pantalla de vehículos sin base de datos, sin detalles técnicos (SIM-02); falta repetirlo con sesión iniciada |
| CP-SEG-13 | Ejecutar `npm audit --omit=dev`. | Sin vulnerabilidades altas ni críticas. | RNF-SEG-10 | ❌ 21-10-2026: 3 altas (`next` 16.3.6, `sharp` y `source-map-js`). Ver ERR-01 en la sección 9 |

### 6.3 Compatibilidad (`CP-COM`)

| ID | Qué se comprueba | Resultado esperado | Origen | Estado |
|---|---|---|---|---|
| CP-COM-01 | Flujos principales en un celular de 360 px. | Se completan sin desplazamiento horizontal. | RNF-COM-01, JOA-01 7.14 | 🟡 Aprobado con las herramientas del navegador (SIM-03); falta un teléfono real |
| CP-COM-02 | Flujos principales a 768 px **[POR CONFIRMAR]**. | Se completan sin desplazamiento horizontal. | RNF-COM-02 | ⏳ Pendiente |
| CP-COM-03 | Flujos principales desde 1280 px **[POR CONFIRMAR]**. | Se completan. | RNF-COM-03 | ⏳ Pendiente |
| CP-COM-04 | Flujo principal en cada navegador acordado, anotando la versión. | Funciona en todos. | RNF-COM-04 | 🟡 Chromium aprobado (SIM-03); faltan Edge, Firefox, Safari, Chrome para Android y Safari para iPhone **[POR CONFIRMAR]** |
| CP-COM-05 | Correo de aviso en Gmail y Outlook, en computador y celular. | Se ve completo y legible. | RNF-COM-05 | 📝 MVP |

### 6.4 Usabilidad (`CP-USA`)

| ID | Qué se comprueba | Resultado esperado | Origen | Estado |
|---|---|---|---|---|
| CP-USA-01 | Un usuario nuevo registra un vehículo, sin ayuda y con cronómetro. | Lo logra en menos de 2 minutos **[POR CONFIRMAR]**. | RNF-USA-01 | ⏳ Pendiente |
| CP-USA-02 | Pregunta al final de la prueba con usuarios: "¿lo usaría?". | Al menos 3 de 4 dicen que sí **[POR CONFIRMAR]**. | RNF-USA-02 | ⏳ Pendiente (MVP) |
| CP-USA-03 | Recorrer cada pantalla solo con el teclado, revisar etiquetas y contraste, y pasar la auditoría de accesibilidad de Lighthouse. | Todo se usa con el teclado, el foco siempre se ve, cada campo tiene etiqueta y Lighthouse da 90 o más **[POR CONFIRMAR]**. | RNF-USA-06 | ⏳ Pendiente |

**Cómo se hace la prueba con usuarios:** 4 personas que no conozcan la aplicación, idealmente del rubro del transporte **[POR CONFIRMAR]**. A cada una se le entrega la misma tarea escrita, se cronometra y no se le dan indicaciones; al terminar se le hace la pregunta de CP-USA-02. En el registro se las nombra como "Usuario 1" a "Usuario 4", sin datos personales.

### 6.5 Rendimiento y disponibilidad (`CP-REN`)

Los umbrales de rendimiento se miden sobre la versión desplegada, no en el computador de desarrollo (JOA-05, sección 3).

| ID | Qué se comprueba | Resultado esperado | Origen | Estado |
|---|---|---|---|---|
| CP-REN-01 | Carga del inicio de sesión, el listado y el formulario en un celular simulado con 4G (Lighthouse, 3 mediciones). | Contenido principal en 2,5 s o menos **[POR CONFIRMAR]**. | RNF-REN-01 | ⏳ Pendiente (despliegue) |
| CP-REN-02 | Tiempo de guardar al registrar y al editar (pestaña "Red", 5 repeticiones). | 2 s o menos **[POR CONFIRMAR]**. | RNF-REN-02 | ⏳ Pendiente (despliegue) |
| CP-REN-03 | Listado, búsqueda y filtros con 100 vehículos en una empresa **[POR CONFIRMAR]**. | Cumple CP-REN-01; búsqueda y filtros en 1 s o menos. | RNF-REN-03 | ⏳ Pendiente (requiere cargar los datos) |
| CP-REN-04 | Duración del proceso diario de avisos. | Menos de 5 minutos **[POR CONFIRMAR]**. | RNF-REN-04 | 📝 MVP |
| CP-REN-05 | Disponibilidad de la versión desplegada durante un mes. | 99 % o más **[POR CONFIRMAR]**. | RNF-DIS-01 | ⏳ Pendiente (MVP) |
| CP-REN-06 | Respaldar la base de datos y restaurarla en un proyecto de prueba. | Se restaura completa. | RNF-DIS-03 | ⏳ Pendiente (MVP) |
| CP-REN-07 | Otro integrante clona el repositorio y levanta la aplicación siguiendo el README, en un computador distinto. | Lo logra en menos de 15 minutos **[POR CONFIRMAR]**. | RNF-DIS-05 | ⏳ Pendiente (también lo pide la sección 6.3 de JOA-03) |

---

## 7. Cuándo se ejecutan

| Momento | Qué se ejecuta |
|---|---|
| **En cada PR de código** | Pruebas automáticas y los casos del módulo que cambió (DoD, sección 3.1). |
| **Al cierre de cada iteración** (cada 14 días **[POR CONFIRMAR]**) | Casos funcionales y de seguridad de lo terminado en la iteración, registrados en su documento de pruebas. |
| **Primera entrega** (Iteración 3, 19-10 al 01-11) | Lo ejecutado en SIM-03 y los casos de primera entrega que siguen pendientes (sección 9). |
| **Al desplegar en Vercel** | CP-SEG-11, CP-REN-01 a CP-REN-03 y la parte de CP-FUN-13 que requiere volver a desplegar. |
| **MVP integrado** (semana 14 **[POR CONFIRMAR]**) | Todos los casos de la primera entrega otra vez (regresión) y los casos del MVP, ya detallados. |
| **Entrega final** (semana 18 **[POR CONFIRMAR]**) | Regresión completa y prueba con usuarios (CP-USA-01 y CP-USA-02). |

---

## 8. Registro de resultados y de errores

- **Cada ejecución** se registra en un documento con el formato de [SIM-03](SIM-03_Pruebas_Primera_Entrega.md): versión probada (commit), fecha, entorno, cuentas usadas y, por cada caso, su ID, los pasos, el resultado esperado, el resultado obtenido y el estado. Cuando el caso lo permite, el resultado se confirma con una consulta de solo lectura a la base de datos.
- **Cada error** recibe un identificador `ERR-nn` y se registra con: el caso que lo encontró, los pasos para reproducirlo, el resultado esperado y el obtenido, la severidad (sección 5), el responsable y el estado. También se crea su tarjeta en el tablero del Project.
- **Cada corrección se vuelve a probar** con el mismo caso, y el resultado se agrega al registro (DoD, sección 3.3).
- **Evidencia:** las capturas van en `Evidencias de sistema/Aplicación/Capturas` y los documentos en `Evidencias de documentación`. Nunca contienen datos personales reales ni contraseñas.

---

## 9. Estado al 21-10-2026

**Casos de la primera entrega** (36):

| Estado | Cantidad | Casos |
|---|---|---|
| ✅ Aprobado | 17 | CP-FUN-01 a 05, 07, 09 y 10; CP-SEG-01 a 08 y 10 |
| 🟡 Parcial | 5 | CP-FUN-13, CP-SEG-09, CP-SEG-12, CP-COM-01 y CP-COM-04 |
| ❌ No aprobado | 1 | CP-SEG-13 |
| ⏳ Pendiente | 13 | CP-FUN-06, 08, 11 y 12; CP-SEG-11; CP-COM-02 y 03; CP-USA-01 y 03; CP-REN-01, 02, 03 y 07 |

**Casos del MVP y opcionales** (22): 18 por detallar y 4 pendientes. Se completan cuando existan las reglas de cada módulo.

**Errores abiertos:**

| ID | Caso | Descripción | Cómo reproducirlo | Severidad | Responsable | Estado |
|---|---|---|---|---|---|---|
| ERR-01 | CP-SEG-13 | `npm audit --omit=dev` informa 3 vulnerabilidades altas: `next` 16.3.6, `sharp` y `source-map-js` (las dos últimas llegan a través de Next.js). | Ejecutar `npm audit --omit=dev` desde `Aplicación`. | Mayor | José, con el umbral que confirme Simón (JOA-05, sección 8) | Abierto. La corrección ya está identificada en [JOS-06](JOS-06_Manual_Tecnico.md) (sección 9): actualizar Next.js a 16.4 y ejecutar `npm audit fix`. |

Las dos observaciones menores de presentación de SIM-03 (sección 6) no son errores y quedan registradas allí.

---

## 10. Relación con JOA-05

Con esta tabla se completa la sección 7 de JOA-05: cada requisito tiene al menos un caso.

| Requisito | Caso(s) | | Requisito | Caso(s) |
|---|---|---|---|---|
| RNF-SEG-01 | CP-SEG-01, CP-SEG-02 | | RNF-USA-01 | CP-USA-01 |
| RNF-SEG-02 | CP-SEG-03, CP-SEG-04, CP-SEG-05 | | RNF-USA-02 | CP-USA-02 |
| RNF-SEG-03 | CP-SEG-06 | | RNF-USA-03 | CP-FUN-05, CP-FUN-11 |
| RNF-SEG-04 | CP-SEG-07 | | RNF-USA-04 | CP-FUN-09, CP-FUN-11 |
| RNF-SEG-05 | CP-SEG-08 | | RNF-USA-05 | CP-FUN-12 |
| RNF-SEG-06 | CP-SEG-09 | | RNF-USA-06 | CP-USA-03 |
| RNF-SEG-07 | CP-SEG-10 | | RNF-COM-01 | CP-COM-01 |
| RNF-SEG-08 | CP-SEG-11 | | RNF-COM-02 | CP-COM-02 |
| RNF-SEG-09 | CP-SEG-12 | | RNF-COM-03 | CP-COM-03 |
| RNF-SEG-10 | CP-SEG-13 | | RNF-COM-04 | CP-COM-04 |
| RNF-REN-01 | CP-REN-01 | | RNF-COM-05 | CP-COM-05 |
| RNF-REN-02 | CP-REN-02 | | RNF-DIS-01 | CP-REN-05 |
| RNF-REN-03 | CP-REN-03 | | RNF-DIS-02 | CP-FUN-02, CP-FUN-07, CP-FUN-13 |
| RNF-REN-04 | CP-REN-04 | | RNF-DIS-03 | CP-REN-06 |
| | | | RNF-DIS-04 | CP-FUN-14 |
| | | | RNF-DIS-05 | CP-REN-07 |

---

## 11. Riesgos

| Riesgo | Cómo lo manejamos |
|---|---|
| Sin despliegue no se pueden probar HTTPS, rendimiento ni disponibilidad. | Esos casos quedan programados para el despliegue (sección 7) y no bloquean las pruebas en local. |
| Pocas personas disponibles para la prueba con usuarios. | Agendarla con anticipación; si no se consiguen personas del rubro, usar personas que no conozcan la aplicación **[POR CONFIRMAR]**. |
| La base de desarrollo es compartida y los datos de prueba se acumulan. | Patentes que empiezan con `SIM` y registro de lo creado en cada ejecución (sección 4). |
| El equipo no tiene todos los navegadores y dispositivos de RNF-COM-04. | Usar los dispositivos de los integrantes y anotar los que no se pudieron probar **[POR CONFIRMAR]**. |
| Los planes gratuitos de Vercel y Supabase limitan las mediciones de disponibilidad. | Revisar los límites de cada plan antes de confirmar RNF-DIS-01 (JOA-05, sección 6). |

---

## 12. Pendientes

- **Confirmar con el equipo** el quinto tipo de prueba (sección 2) y los umbrales **[POR CONFIRMAR]** de JOA-05 (sección 8).
- **Ejecutar los 13 casos pendientes de la primera entrega** y cerrar ERR-01 antes de dar por terminada la entrega (sección 9).
- **Agregar los ID de la sección 10** a la sección 7 de JOA-05 (a cargo de Joaquín).
- **Detallar los casos del MVP** cuando estén los documentos de reglas de conductores, documentos, avisos y turnos.
- **Fechas exactas** de las semanas 14 y 18 **[POR CONFIRMAR]** con el cronograma.

---

## 13. Checklist de SIM-04

- [x] Tipos de prueba definidos, con la propuesta para rendimiento y disponibilidad (sección 2).
- [x] Técnicas, entornos, datos y criterios de entrada y de salida (secciones 3 a 5).
- [x] Casos con identificador para la primera entrega, el MVP y el módulo opcional (sección 6).
- [x] Cada requisito de JOA-05 cubierto por al menos un caso (sección 10).
- [x] Cuándo se ejecuta cada grupo de casos y cómo se registran los resultados y los errores (secciones 7 y 8).
- [x] Estado actual con los resultados de SIM-03 y las revisiones del 21-10-2026 (sección 9).
- [ ] Revisión de Joaquín y José en el PR.
