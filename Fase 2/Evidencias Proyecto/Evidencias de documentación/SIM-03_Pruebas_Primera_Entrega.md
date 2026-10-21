# SIM-03 · Pruebas de la primera entrega

| | |
|---|---|
| **Tarea** | [SIM-03] Probar la primera entrega con dos empresas ficticias |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 21-10-2026 |

Este documento registra las pruebas de la primera entrega ("iniciar sesión y registrar, listar y editar vehículos con datos persistentes, sin que una empresa pueda ver o modificar los datos de otra"). Se probaron los 14 criterios de aceptación de la sección 7 de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) y los requisitos de seguridad de [JOA-05](JOA-05_Requisitos_No_Funcionales.md) que dependen de ellos. Cada caso tiene sus pasos, el resultado esperado y el resultado obtenido, como pide la [Definition of Done](SIM-05_Definition_of_Done.md) (sección 3.3).

---

## 1. Resumen

| Grupo | Criterios de JOA-01 | Resultado |
|---|---|---|
| Acceso | 7.1 a 7.4 | 4 de 4 aprobados |
| Vehículos | 7.5 a 7.10 | 6 de 6 aprobados |
| Separación entre empresas | 7.11 a 7.13 | 3 de 3 aprobados |
| Adaptabilidad | 7.14 | 1 de 1 aprobado |
| Seguridad adicional (JOA-05) | RNF-SEG-03 y RNF-SEG-04, y solicitudes alteradas | 4 de 4 aprobados |

**No se encontraron errores.** Hay dos observaciones menores de presentación (sección 6) que no bloquean la entrega.

---

## 2. Entorno y datos

| | |
|---|---|
| **Versión probada** | Rama `main` en el commit `259f429` (incluye SIM-02, PR #21) |
| **Fecha y hora** | 21-10-2026, entre las 13:55 y las 14:15 (hora de Chile) |
| **Dónde** | En local, con `npm run dev` desde `Evidencias de sistema/Aplicación`, Node.js 24.20 |
| **Base de datos e inicio de sesión** | Proyecto de desarrollo `micrologist-dev` en Supabase (Supabase Auth configurado según [SIM-02](SIM-02_Inicio_de_Sesion.md), sección 5) |
| **Navegador** | Chromium, en tamaño de computador y emulando un celular de 360 × 740 px |
| **Cuentas** | `admin.empresa.a@micrologist.cl` (Empresa A, "Transportes Cordillera (ficticia)") y `admin.empresa.b@micrologist.cl` (Empresa B, "Buses del Litoral (ficticia)"). Las contraseñas no se registran en este documento. |

**Cómo se comprobó cada resultado:** en el navegador se leyó lo que muestra cada pantalla (mensajes, tablas, campos y códigos de respuesta). Además, antes, durante y después de las pruebas se consultó la tabla `vehiculo` con consultas de **solo lectura**, para confirmar en la base de datos lo que la pantalla decía (sección 4).

**Datos iniciales:** los 7 vehículos del seed (4 de la Empresa A y 3 de la B) y un vehículo `PQRS12` de la Empresa A que ya existía antes de estas pruebas.

**Datos creados por estas pruebas** (quedan en la base de desarrollo, porque la aplicación no permite eliminar vehículos):

| Empresa | Patente | Para qué |
|---|---|---|
| A | `SIMT03` | Registro, normalización, edición, desactivación y reactivación (7.5 a 7.10) |
| A | `SIME03` | Prueba de que la empresa no se puede elegir desde la solicitud (RNF-SEG-03) |
| B | `SIMT03` | Misma patente en dos empresas (7.13) |

Los vehículos del seed no se modificaron.

---

## 3. Casos de prueba

### 3.1 Acceso

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **7.1** Credenciales correctas | Iniciar sesión con la cuenta de la Empresa A. | Entra y ve el listado de vehículos de su empresa. | Entra a `/vehiculos`; el encabezado muestra "Transportes Cordillera (ficticia)" y "Cerrar sesión". El listado tiene solo vehículos de la A (BBCD-12, FGHJ-34, HJKL-78 y PQRS-12). | ✅ Aprobado |
| **7.2** Credenciales incorrectas | a) Cuenta A con una contraseña incorrecta. b) Un correo que no existe. | Mensaje genérico, sin indicar qué dato falló. | En los dos casos aparece "Correo o contraseña incorrectos.", no se crea sesión y la pantalla sigue en `/login`. | ✅ Aprobado |
| **7.3** Sin sesión | Sin iniciar sesión, abrir `/`, `/vehiculos`, `/vehiculos?inactivos=1`, `/vehiculos/nuevo` y la ficha de un vehículo de cada empresa. | Todas redirigen al inicio de sesión. | Las 6 direcciones responden 307 hacia `/login`. `/login` responde 200. | ✅ Aprobado |
| **7.4** Después de cerrar sesión | 1. Con la sesión de la A abierta, preparar una edición de `SIMT03` y guardarla sin enviarla. 2. Apretar "Cerrar sesión". 3. Volver atrás en el navegador y abrir la ficha por su dirección. 4. Enviar la edición guardada. | No se muestran ni se modifican datos. | 2: vuelve a `/login` y se borran las cookies de sesión. 3: el navegador termina en `/login`, sin datos del vehículo. 4: el servidor responde con una redirección a `/login`, sin datos, y en la base `SIMT03` no cambia (misma observación y misma hora de modificación). | ✅ Aprobado |

### 3.2 Vehículos (Empresa A)

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **7.5** Registro válido | Registrar un vehículo con patente `simt-03`, tipo Van, Toyota Hiace 2020, 14 pasajeros, n.º interno 99. Recargar el listado. | Se guarda y sigue apareciendo al recargar. | Vuelve al listado con "Vehículo registrado correctamente." y la fila "SIMT-03 · Van · Toyota Hiace · 2020 · 99 · Activo", que sigue ahí al recargar. | ✅ Aprobado |
| **7.6** Patente duplicada | Registrar otro vehículo en la A con la patente `simt 03`. | Mensaje de duplicado; no se crea nada. | Aparece "Ya tienes un vehículo registrado con la patente SIMT-03." junto al campo. En la base hay un solo `SIMT03` en la A. | ✅ Aprobado |
| **7.7** Patente normalizada | Revisar cómo quedó guardada la patente escrita como `simt-03`. | Se guarda como `SIMT03`. | En la base quedó `SIMT03`; en pantalla se muestra `SIMT-03`. | ✅ Aprobado |
| **7.8** Campos obligatorios y formatos | a) Enviar el formulario vacío. b) Enviar con patente `ABC123`, año 1975 y capacidad 0. | Cada campo muestra su error y no se guarda nada. | a) Seis errores, uno por campo obligatorio, con los mensajes de JOA-01 (sección 4); el cursor queda en "Patente". b) "La patente debe tener el formato BBCD12 o AB1234.", "El año debe estar entre 1980 y 2027." y "La capacidad debe ser un número entre 1 y 100.". No se guardó ningún vehículo. | ✅ Aprobado |
| **7.9** Edición | Abrir `SIMT03`, cambiar el color a "Gris" y el n.º interno a "100", guardar y recargar la ficha. | Los cambios se guardan y persisten. | Vuelve con "Los cambios del vehículo se guardaron." y, al recargar, la ficha muestra color "Gris" y n.º interno "100". | ✅ Aprobado |
| **7.10** Desactivar y reactivar | Apretar "Desactivar vehículo" en `SIMT03` y aceptar. Ver el listado normal y con "Incluir inactivos". Reactivarlo. | Pide confirmación; sale del listado normal; aparece con "Incluir inactivos" y se puede reactivar. | La confirmación dice "¿Desactivar el vehículo SIMT-03? Dejará de aparecer en el listado". Vuelve con "Vehículo desactivado. Puedes verlo marcando «Incluir inactivos».", y no aparece en el listado normal. Con "Incluir inactivos" aparece como Inactivo. "Reactivar vehículo" lo deja Activo, con "Vehículo reactivado.". | ✅ Aprobado |

### 3.3 Separación entre empresas

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **7.11** Cada empresa ve solo lo suyo | Revisar el listado con la cuenta A y con la cuenta B. | Ninguna ve vehículos de la otra. | A: solo vehículos con id de la A, ninguno de la B. B: solo AB-1234, BBCD-12 y KLPR-56 (y luego su `SIMT03`), ninguno de la A. | ✅ Aprobado |
| **7.12** Abrir o editar un vehículo de otra empresa | Con la cuenta A: a) abrir la ficha del AB-1234 de la B escribiendo su dirección; b) enviar una edición y c) una desactivación de `SIMT03` cambiando en la solicitud el id por el del AB-1234 (con las herramientas del navegador). Con la cuenta B: d) abrir la ficha del `SIMT03` de la A. | "No encontrado", y los datos de la otra empresa no cambian. | a) y d): respuesta 404 con la página "No encontrado", sin datos del otro vehículo. b) "No encontramos el vehículo. Vuelve al listado.". c) Vuelve al listado sin desactivar nada. En la base, el AB-1234 de la B sigue igual que antes de las pruebas (mismo estado y misma hora de modificación). | ✅ Aprobado |
| **7.13** Misma patente en dos empresas | Con la cuenta B, registrar `SIMT-03` (que ya existe en la A). | Se registra sin conflicto. | "Vehículo registrado correctamente."; en la base hay un `SIMT03` en cada empresa. | ✅ Aprobado |

### 3.4 Adaptabilidad

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **7.14** Celular de 360 px | Con sesión iniciada (cuenta B), abrir el listado, el registro y la edición con un ancho de 360 px. | Se pueden usar sin desplazamiento horizontal. | En las tres pantallas el ancho del documento es 360 px y ningún elemento se sale de la pantalla. El listado cambia a tarjetas y el encabezado muestra completo "MicroLogist", "Vehículos" y "Cerrar sesión". Capturas en la sección 7. | ✅ Aprobado |

### 3.5 Seguridad adicional (JOA-05)

| Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **RNF-SEG-04** Validación en el servidor | Con la cuenta A, completar el registro con datos válidos y cambiar la solicitud antes de enviarla: patente `ABC123` y año 1975. | El servidor rechaza los datos aunque el formulario los haya aceptado. | El servidor responde con los errores de patente y año, y no se guarda nada. | ✅ Aprobado |
| **RNF-SEG-03** La empresa sale de la sesión | Con la cuenta A, registrar `SIME03` agregando a la solicitud `empresaId` y `empresa_id` con el id de la Empresa B. | El vehículo queda en la empresa de la sesión. | `SIME03` quedó en la Empresa A. | ✅ Aprobado |
| **RNF-SEG-02** Edición alterada | Caso 7.12 b. | No modifica datos de la otra empresa. | Sin cambios en la Empresa B. | ✅ Aprobado |
| **RNF-SEG-02** Desactivación alterada | Caso 7.12 c. | No modifica datos de la otra empresa. | Sin cambios en la Empresa B. | ✅ Aprobado |

Las pruebas automáticas (`npm test`, 24 de 24) complementan estos casos: cubren la validación de los datos de vehículos y las reglas de acceso de SIM-02.

---

## 4. Verificación en la base de datos

Consultas de solo lectura a la tabla `vehiculo` (hora de Chile).

**Antes de las pruebas:** 8 vehículos.

| Empresa | Patente | Estado | Última modificación |
|---|---|---|---|
| A | BBCD12 | activo | 16-10 21:44 |
| A | FGHJ34 | activo | 16-10 21:44 |
| A | HJKL78 | en_mantencion | 16-10 21:44 |
| A | PQRS12 | activo | 16-10 22:00 |
| A | XY4321 | inactivo | 16-10 21:44 |
| B | AB1234 | en_mantencion | 16-10 21:44 |
| B | BBCD12 | activo | 16-10 21:44 |
| B | KLPR56 | activo | 16-10 21:44 |

**Después de las pruebas:** 11 vehículos. Son los mismos 8, **sin ningún cambio**, más los 3 creados por las pruebas:

| Empresa | Patente | Estado | Última modificación |
|---|---|---|---|
| A | SIME03 | activo | 21-10 14:04 |
| A | SIMT03 | activo (color Gris, n.º interno 100) | 21-10 14:06 |
| B | SIMT03 | activo | 21-10 14:12 |

Que el AB1234 de la Empresa B mantenga su hora de modificación del 16-10 demuestra que las solicitudes alteradas de los casos 7.12 b y c no lo tocaron. La última modificación del `SIMT03` de la A es la de su reactivación (14:06), así que tampoco cambió con la edición enviada sin sesión (caso 7.4).

---

## 5. Relación con los requisitos

| Requisito | Casos |
|---|---|
| PB-01 · Iniciar sesión | 7.1, 7.2 y 7.3 |
| PB-02 · Cerrar sesión | 7.4 |
| PB-03 · Separación de datos entre empresas | 7.11, 7.12, 7.13 y RNF-SEG-03 |
| PB-04 a PB-07 · Vehículos | 7.5 a 7.10 |
| RNF-SEG-01 · Solo con sesión | 7.3 y 7.4 |
| RNF-SEG-02 · Cada empresa ve y modifica solo lo suyo | 7.11, 7.12 y 7.13 |
| RNF-SEG-03 · Empresa desde la sesión | Caso de la sección 3.5 |
| RNF-SEG-04 · Validación en el servidor | Caso de la sección 3.5 |
| RNF-SEG-05 · Mensaje único ante credenciales incorrectas | 7.2 |
| RNF-COM-01 · Uso en celular | 7.14 |
| RNF-DIS-02 · Los datos persisten | 7.5 y 7.9 |

---

## 6. Errores y observaciones

**Errores encontrados:** ninguno.

**Observaciones menores** (presentación; no bloquean la entrega):

| # | Observación | Cómo verla | Propuesta |
|---|---|---|---|
| 1 | La página "No encontrado" de un vehículo mantiene en la pestaña del navegador el título "Detalle del vehículo · MicroLogist". | Abrir `/vehiculos/<id de otra empresa>` y mirar el título de la pestaña. | Que esa página use el título "No encontrado". Prioridad baja. |
| 2 | En pantallas de menos de 640 px el encabezado no muestra el nombre de la empresa (está oculto a propósito para que quepa "Cerrar sesión"). | Abrir cualquier pantalla a 360 px con sesión. | Evaluar mostrarlo en otra línea o en el listado. Prioridad baja. |

---

## 7. Evidencias

Capturas en [`Evidencias de sistema/Aplicación/Capturas`](<../Evidencias de sistema/Aplicación/Capturas>), con sesión de la Empresa B a 360 px:

| Archivo | Pantalla |
|---|---|
| `07-sesion-listado-celular-360.png` | Listado en tarjetas, con "Cerrar sesión" en el encabezado |
| `08-sesion-registro-celular-360.png` | Formulario de registro |
| `09-sesion-edicion-celular-360.png` | Ficha y edición de `SIMT-03` |

El resto de los resultados (mensajes, códigos de respuesta y consultas a la base) está transcrito en las secciones 3 y 4.

---

## 8. Limitaciones y pendientes

- Las pruebas se hicieron **en local** contra el proyecto de desarrollo de Supabase. Falta repetir los casos principales (7.1 a 7.4 y 7.11 a 7.12) en la versión desplegada en Vercel, cuando exista.
- Se probó en Chromium. Los demás navegadores de RNF-COM están **[POR CONFIRMAR]** en el plan de pruebas (SIM-04).
- Los 3 vehículos de prueba quedan en la base de desarrollo (sección 2). Si el equipo prefiere quitarlos, hay que hacerlo desde Supabase, porque la aplicación no elimina vehículos.
- **Documentos de otros integrantes** que se pueden actualizar con estos resultados: el estado de los criterios en [JOA-03](JOA-03_Validacion_Primera_Entrega.md) y el estado de PB-01 a PB-07 en el [Product Backlog](JOA-08_Product_Backlog.md), a cargo de Joaquín.

---

## 9. Checklist de SIM-03

- [x] Criterios 7.1 a 7.14 de JOA-01 ejecutados con dos empresas ficticias (sección 3).
- [x] Cada caso con pasos, resultado esperado y resultado obtenido (DoD, sección 3.3).
- [x] Resultados confirmados en la base de datos con consultas de solo lectura (sección 4).
- [x] Errores registrados: ninguno; observaciones menores con cómo reproducirlas (sección 6).
- [x] Evidencia sin datos personales reales: empresas y cuentas ficticias, sin contraseñas (secciones 2 y 7).
- [ ] Revisión de José y Joaquín en el PR.
