# JOA-08 · Product Backlog de MicroLogist

| | |
|---|---|
| **Tarea** | [JOA-08] Construir y priorizar el Product Backlog |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas y Simón Jofré |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 12-10-2026 |
| **Actualización** | 18-10-2026 (cierre de la Iteración 2) |

Este documento reúne todo lo que MicroLogist debe hacer, ordenado por prioridad. Parte de la [Product Vision](JOA-04_Product_Vision.md) y de las reglas de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md). De aquí salen los ítems de cada Sprint Backlog (SIM-06) y los casos del plan de pruebas (SIM-04). Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Cómo leer este backlog

- **Ítem:** una funcionalidad escrita como historia de usuario, con un identificador `PB-xx` que no cambia aunque cambie su prioridad.
- **Prioridad:** el orden de la tabla de la sección 2. Lo que está más arriba se hace primero.
- **Etapa:** a qué parte del producto pertenece, según la sección 7.1 de la Product Vision.

| Etapa | Qué significa |
|---|---|
| **Primera entrega** | Iniciar sesión y registrar, listar y editar vehículos con datos separados por empresa. |
| **MVP completo** | Conductores, documentos, avisos por correo y turnos. |
| **Opcional** | Ingresos. Se hace solo si el avance lo permite. |

- **Estado:** `Pendiente`, `En curso` o `Terminado`. Un ítem está terminado cuando cumple sus criterios de aceptación y la [Definition of Done](SIM-05_Definition_of_Done.md).
- **Usuario:** en todas las historias es el dueño o responsable de la empresa (rol `admin`). En el MVP no hay otros roles y los conductores no inician sesión.

Este backlog contiene funcionalidades del producto. Las tareas de documentación y de entorno (UML, modelo de datos, Docker, manual técnico, plan de pruebas) se siguen en el tablero del Project.

---

## 2. Backlog priorizado

Estado al 18-10-2026.

| Prioridad | ID | Ítem | Módulo | Etapa | Estado |
|---|---|---|---|---|---|
| 1 | PB-01 | Iniciar sesión | Acceso | Primera entrega | Pendiente |
| 2 | PB-02 | Cerrar sesión | Acceso | Primera entrega | Pendiente |
| 3 | PB-03 | Separación de datos entre empresas | Acceso | Primera entrega | En curso |
| 4 | PB-04 | Registrar vehículo | Vehículos | Primera entrega | En curso |
| 5 | PB-05 | Listar y buscar vehículos | Vehículos | Primera entrega | En curso |
| 6 | PB-06 | Ver detalle y editar vehículo | Vehículos | Primera entrega | En curso |
| 7 | PB-07 | Desactivar y reactivar vehículo | Vehículos | Primera entrega | En curso |
| 8 | PB-08 | Registrar conductor | Conductores | MVP completo | Pendiente |
| 9 | PB-09 | Listar, buscar y editar conductores | Conductores | MVP completo | Pendiente |
| 10 | PB-10 | Desactivar y reactivar conductor | Conductores | MVP completo | Pendiente |
| 11 | PB-11 | Registrar documento con vencimiento | Documentos | MVP completo | Pendiente |
| 12 | PB-12 | Ver documentos y su estado | Documentos | MVP completo | Pendiente |
| 13 | PB-13 | Renovar o corregir documento | Documentos | MVP completo | Pendiente |
| 14 | PB-14 | Datos de contacto de la empresa | Empresa | MVP completo | Pendiente |
| 15 | PB-15 | Aviso por correo antes del vencimiento | Avisos | MVP completo | Pendiente |
| 16 | PB-16 | Avisos sin duplicados y con registro de envíos | Avisos | MVP completo | Pendiente |
| 17 | PB-17 | Asignar turno | Turnos | MVP completo | Pendiente |
| 18 | PB-18 | Ver turnos por fecha | Turnos | MVP completo | Pendiente |
| 19 | PB-19 | Editar o anular turno | Turnos | MVP completo | Pendiente |
| 20 | PB-20 | Resumen de la flota | Inicio | MVP completo **[POR CONFIRMAR]** | Pendiente |
| 21 | PB-21 | Activar el módulo de ingresos | Ingresos | Opcional | Pendiente |
| 22 | PB-22 | Registrar ingreso | Ingresos | Opcional | Pendiente |
| 23 | PB-23 | Ver ingresos por período | Ingresos | Opcional | Pendiente |

### Avance de la primera entrega

- **PB-04 a PB-07:** implementados y comprobados con dos empresas ficticias (JOA-02 y JOS-03, PR #5 y #12). Siguen en curso porque falta integrarlos con el inicio de sesión (criterio común 5 de la sección 3).
- **PB-03:** todas las consultas de vehículos ya filtran por empresa (JOS-03), pero la empresa todavía no viene de una sesión real.
- **PB-01 y PB-02:** pendientes. Dependen de SIM-02, planificado para la Iteración 3 (19-10 al 01-11).

El detalle por criterio está en la matriz de validación de [JOA-03](JOA-03_Validacion_Primera_Entrega.md).

### Por qué este orden

1. **Acceso y vehículos primero**, porque son la primera entrega y todo lo demás depende de ellos: sin empresa ni vehículos no hay a qué asociar documentos o turnos.
2. **Conductores antes que documentos**, porque la licencia de conducir es un documento del conductor.
3. **Documentos y avisos antes que turnos**, porque evitar que se pase un vencimiento es el principal valor del producto (sección 1 de la Product Vision).
4. **Ingresos al final**, porque es opcional y no todas las empresas lo necesitan.

---

## 3. Criterios comunes a todos los ítems

Para no repetirlos en cada historia, todos los ítems deben cumplir además lo siguiente:

1. El usuario solo ve y modifica los datos de su empresa. Pedir un registro de otra empresa responde "no encontrado" (JOA-01, sección 2.4).
2. Los datos se validan en el servidor. Los errores se muestran junto al campo y sin detalles técnicos.
3. Lo que se guarda sigue ahí después de recargar la página.
4. Las pantallas se pueden usar en computador y en celular (360 px de ancho) sin desplazamiento horizontal.
5. Sin sesión iniciada, la pantalla redirige al inicio de sesión.

---

## 4. Ítems de la primera entrega

Los criterios citan entre paréntesis el número del criterio de aceptación de la sección 7 de JOA-01.

### PB-01 · Iniciar sesión

**Historia:** como responsable de una empresa de transporte, quiero iniciar sesión con mi correo y contraseña, para entrar a los datos de mi empresa.

**Tareas del tablero:** SIM-02 y SIM-03.

**Criterios de aceptación:**

1. Con credenciales correctas entro y veo el listado de vehículos de mi empresa (7.1).
2. Con credenciales incorrectas aparece un mensaje genérico, que no indica si falló el correo o la contraseña (7.2).
3. Sin sesión, cualquier página privada redirige al inicio de sesión (7.3).
4. En esta etapa se usan cuentas de prueba creadas por el equipo (JOA-01, sección 2.3).

### PB-02 · Cerrar sesión

**Historia:** como responsable, quiero cerrar sesión, para que nadie más use mi cuenta en ese equipo.

**Tareas del tablero:** SIM-02 y SIM-03.

**Criterios de aceptación:**

1. Al cerrar sesión vuelvo a la pantalla de inicio de sesión.
2. Después de cerrar sesión, volver atrás en el navegador o llamar directamente a una operación privada no muestra ni modifica datos (7.4).

### PB-03 · Separación de datos entre empresas

**Historia:** como responsable, quiero que solo mi empresa pueda ver y modificar sus datos, para que mi información esté segura.

**Tareas del tablero:** JOS-02, JOS-03, SIM-02 y SIM-03.

**Criterios de aceptación:**

1. El usuario de la Empresa A no ve en su listado los vehículos de la Empresa B (7.11).
2. Si el usuario de A abre o edita un vehículo de B escribiendo su `id`, recibe "no encontrado" y los datos de B no cambian (7.12).
3. Ambas empresas pueden tener la misma patente sin conflicto (7.13).
4. El `empresa_id` se toma de la sesión en el servidor y nunca del formulario.

### PB-04 · Registrar vehículo

**Historia:** como responsable, quiero registrar un vehículo con sus datos, para tener mi flota en un solo lugar.

**Tareas del tablero:** JOA-02 (interfaz) y JOS-03 (lógica y datos).

**Criterios de aceptación:**

1. Un vehículo válido se guarda y sigue apareciendo después de recargar la página (7.5).
2. La patente se guarda normalizada (`fghj-34` → `FGHJ34`) y solo acepta los formatos `BBCD12` o `AB1234` (7.7).
3. Una patente que ya existe en la empresa muestra el mensaje de duplicado y no crea nada (7.6).
4. Los campos obligatorios vacíos o fuera de formato muestran su error y no se guardan (7.8).
5. Los campos, rangos y mensajes son los de las secciones 3 y 4 de JOA-01.

### PB-05 · Listar y buscar vehículos

**Historia:** como responsable, quiero ver el listado de mis vehículos y buscarlos por patente o estado, para saber rápidamente qué tengo y cómo está.

**Tareas del tablero:** JOA-02 y JOS-03.

**Criterios de aceptación:**

1. El listado muestra patente, tipo, marca y modelo, año, número interno y estado, ordenado por patente.
2. Puedo buscar por patente y filtrar por estado.
3. Los vehículos inactivos no aparecen por defecto; se ven con "Incluir inactivos".
4. Si no hay vehículos, aparece "Aún no tienes vehículos registrados" y un botón para registrar.

### PB-06 · Ver detalle y editar vehículo

**Historia:** como responsable, quiero abrir un vehículo y corregir sus datos, para mantener la información al día.

**Tareas del tablero:** JOA-02 y JOS-03.

**Criterios de aceptación:**

1. Puedo abrir un vehículo y ver todos sus datos.
2. Al editar, los cambios se guardan y persisten al recargar (7.9).
3. Si cambio la patente, se vuelve a validar su formato y que no esté duplicada.
4. Después de guardar vuelvo al listado con un mensaje de confirmación.

### PB-07 · Desactivar y reactivar vehículo

**Historia:** como responsable, quiero desactivar un vehículo que ya no uso sin perder su historial, para mantener mi listado al día.

**Tareas del tablero:** JOA-02 y JOS-03.

**Criterios de aceptación:**

1. Desactivar pide confirmación y cambia el estado a `inactivo`. El vehículo no se elimina.
2. Un vehículo desactivado sale del listado por defecto; con "Incluir inactivos" vuelve a aparecer (7.10).
3. Un vehículo inactivo se puede reactivar (7.10).

---

## 5. Ítems del MVP completo

Antes de desarrollar cada módulo hay que definir sus campos y reglas, como se hizo con los vehículos en JOA-01. Las reglas de conductores (PB-08 a PB-10) están en [JOA-09](JOA-09_Reglas_Modulo_Conductores.md), que resuelve los **[POR CONFIRMAR]** de esos tres ítems cuando se aprueba.

### PB-08 · Registrar conductor

**Historia:** como responsable, quiero registrar a mis conductores con sus datos, para saber quiénes manejan en mi empresa.

**Criterios de aceptación:**

1. Puedo registrar un conductor con sus datos obligatorios. La lista de campos está **[POR CONFIRMAR]** (propuesta: nombre, RUT, teléfono y correo).
2. El RUT se valida con su dígito verificador y no se repite dentro de la empresa **[POR CONFIRMAR]**.
3. Los datos inválidos muestran su error y no se guardan.
4. El conductor es un registro y no una cuenta: no inicia sesión en el sistema (JOA-01, sección 2.1).

### PB-09 · Listar, buscar y editar conductores

**Historia:** como responsable, quiero ver y corregir los datos de mis conductores, para mantener la información al día.

**Criterios de aceptación:**

1. Veo el listado de los conductores de mi empresa y puedo buscar por nombre o RUT **[POR CONFIRMAR]**.
2. Puedo abrir un conductor y editar sus datos; los cambios persisten al recargar.
3. Si no hay conductores, aparece un mensaje claro y un botón para registrar.

### PB-10 · Desactivar y reactivar conductor

**Historia:** como responsable, quiero desactivar a un conductor que ya no trabaja conmigo sin perder su historial, para mantener mi listado al día.

**Criterios de aceptación:**

1. Puedo desactivar un conductor, con confirmación, y reactivarlo después.
2. Un conductor desactivado no aparece en el listado por defecto ni se puede asignar a turnos nuevos.
3. Que los conductores no se eliminen, igual que los vehículos, está **[POR CONFIRMAR]**.

### PB-11 · Registrar documento con vencimiento

**Historia:** como responsable, quiero registrar los documentos de mis vehículos y conductores con su fecha de vencimiento, para controlar que estén al día.

**Criterios de aceptación:**

1. Puedo registrar un documento de un vehículo (revisión técnica, SOAP, permiso de circulación u otro) o de un conductor (licencia de conducir u otro).
2. Cada documento tiene tipo, a quién pertenece y fecha de vencimiento obligatoria. Los demás campos están **[POR CONFIRMAR]**.
3. Solo puedo asociarlo a vehículos y conductores de mi empresa.
4. Adjuntar el archivo del documento está **[POR CONFIRMAR]** (JOA-01, sección 1.4).

### PB-12 · Ver documentos y su estado

**Historia:** como responsable, quiero ver qué documentos están vigentes, por vencer o vencidos, para actuar antes de tener un problema.

**Criterios de aceptación:**

1. Cada documento muestra su estado según la fecha de hoy: vigente, por vencer o vencido.
2. "Por vencer" significa que faltan 30 días o menos **[POR CONFIRMAR]**.
3. Puedo ver los documentos de un vehículo o de un conductor, y un listado general ordenado por fecha de vencimiento con filtro por estado.
4. La fecha se evalúa en hora de Chile (`America/Santiago`) **[POR CONFIRMAR]**.

### PB-13 · Renovar o corregir documento

**Historia:** como responsable, quiero actualizar un documento cuando lo renuevo, para que el sistema deje de marcarlo como vencido.

**Criterios de aceptación:**

1. Puedo editar un documento y cambiar su fecha de vencimiento; su estado se recalcula.
2. Después de renovarlo, los avisos se calculan con la nueva fecha.
3. Guardar el historial de vencimientos anteriores está **[POR CONFIRMAR]**.

### PB-14 · Datos de contacto de la empresa

**Historia:** como responsable, quiero ver y actualizar los datos de mi empresa, para que los avisos lleguen al correo correcto.

**Criterios de aceptación:**

1. Puedo ver y editar el nombre, el correo de contacto y el teléfono de mi empresa (campos de JOA-01, sección 2.2).
2. El correo de contacto es obligatorio y se valida su formato.
3. Que ese correo sea el destinatario de los avisos está **[POR CONFIRMAR]** (JOA-01, sección 5).

### PB-15 · Aviso por correo antes del vencimiento

**Historia:** como responsable, quiero recibir un correo antes de que venza un documento, para renovarlo a tiempo.

**Criterios de aceptación:**

1. Recibo un correo cuando a un documento le faltan 30, 7 y 1 días para vencer, y el día en que vence **[POR CONFIRMAR]**.
2. El correo indica qué documento vence, de qué vehículo o conductor es y en qué fecha.
3. El envío se hace una vez al día, en la mañana, hora de Chile **[POR CONFIRMAR]**.
4. El único canal es el correo: no hay avisos por WhatsApp, SMS ni notificaciones push.
5. El proveedor de correo está **[POR CONFIRMAR]**.

### PB-16 · Avisos sin duplicados y con registro de envíos

**Historia:** como responsable, quiero que cada aviso llegue una sola vez y quede registrado, para confiar en los avisos y poder revisar si se enviaron.

**Criterios de aceptación:**

1. Cada envío queda registrado (documento, plazo y fecha de envío) y el mismo aviso no se repite **[POR CONFIRMAR]**.
2. Los documentos de vehículos inactivos no generan avisos **[POR CONFIRMAR]**.
3. Si un envío falla, queda registrado para poder reintentarlo **[POR CONFIRMAR]**.

### PB-17 · Asignar turno

**Historia:** como responsable, quiero asignar un vehículo y un conductor a una fecha y jornada, para dejar registro de quién maneja qué.

**Criterios de aceptación:**

1. Puedo crear un turno eligiendo fecha, jornada, vehículo y conductor.
2. Solo puedo elegir vehículos y conductores de mi empresa que no estén inactivos. Si un vehículo en mantención se puede asignar está **[POR CONFIRMAR]**.
3. No puedo asignar el mismo vehículo ni el mismo conductor a dos turnos de la misma fecha y jornada **[POR CONFIRMAR]**.
4. Las jornadas disponibles están **[POR CONFIRMAR]** (propuesta: mañana, tarde y noche).

### PB-18 · Ver turnos por fecha

**Historia:** como responsable, quiero ver los turnos de un día, para saber qué vehículo y qué conductor salen en cada jornada.

**Criterios de aceptación:**

1. Veo los turnos de un día con su jornada, vehículo y conductor.
2. Puedo cambiar de fecha y filtrar por vehículo o por conductor.
3. Si no hay turnos ese día, aparece un mensaje claro.

### PB-19 · Editar o anular turno

**Historia:** como responsable, quiero corregir o anular un turno, para reflejar los cambios de último momento.

**Criterios de aceptación:**

1. Puedo cambiar el vehículo, el conductor, la fecha o la jornada de un turno, con las mismas validaciones que al crearlo.
2. Puedo anular un turno, con confirmación.
3. Si el turno anulado se borra o queda registrado como anulado está **[POR CONFIRMAR]**.

### PB-20 · Resumen de la flota

**Historia:** como responsable, quiero ver un resumen de mi flota al entrar, para saber de un vistazo qué necesita atención.

Este ítem responde a la necesidad 3 de la Product Vision ("ver el estado de la flota de un vistazo"), pero no figura como módulo en su sección 5.1. Que entre en el MVP está **[POR CONFIRMAR]**.

**Criterios de aceptación:**

1. Veo cuántos vehículos están activos, en mantención e inactivos.
2. Veo cuántos documentos están vencidos y por vencer, con acceso a su listado.

---

## 6. Ítems opcionales

### PB-21 · Activar el módulo de ingresos

**Historia:** como responsable, quiero activar o desactivar el módulo de ingresos, para usarlo solo si le sirve a mi tipo de empresa.

**Criterios de aceptación:**

1. Puedo activar o desactivar el módulo desde los datos de mi empresa. Que venga desactivado por defecto está **[POR CONFIRMAR]**.
2. Con el módulo desactivado, no aparece en el menú ni se puede entrar a sus pantallas.
3. Desactivarlo no borra los ingresos ya registrados.

### PB-22 · Registrar ingreso

**Historia:** como responsable, quiero registrar los ingresos de mi operación, para llevar un control simple de lo que recaudo.

**Criterios de aceptación:**

1. Puedo registrar un ingreso con fecha y monto en pesos. Si se asocia a un vehículo, a un servicio o a ambos está **[POR CONFIRMAR]**.
2. Sirve para distintos tipos de empresa: recaudación diaria en transporte urbano o ingreso por servicio en turismo y viajes particulares.
3. El monto debe ser un número mayor que cero.
4. Puedo corregir o anular un ingreso registrado por error.

### PB-23 · Ver ingresos por período

**Historia:** como responsable, quiero ver mis ingresos de un período, para saber cuánto recaudé.

**Criterios de aceptación:**

1. Veo los ingresos de un rango de fechas con su total.
2. Puedo filtrar por vehículo.
3. No incluye pagos, facturación ni reportes avanzados, que están fuera de alcance.

---

## 7. Fuera del backlog

**Evolución futura** (después del plazo del capstone, sección 7.1 de la Product Vision):

- Varios usuarios por empresa con roles (por ejemplo, un operador que no puede desactivar).
- Registro público, para que una empresa se inscriba sola **[POR CONFIRMAR]** (JOA-01, sección 2.3).
- Reportes y analítica.

**Fuera de alcance** (no se hará, sección 1.4 de JOA-01): GPS y seguimiento de rutas, aplicación móvil nativa, avisos por WhatsApp, SMS o notificaciones push, pagos y facturación, integraciones con organismos externos e inteligencia artificial.

---

## 8. Pendientes de este backlog

- **Estimación:** los ítems no tienen estimación. El equipo decidirá si usa puntos o tallas y estimará cada ítem al planificar el sprint **[POR CONFIRMAR]**.
- **Sprints:** el tablero del Project usa iteraciones de 14 días (Iteración 3: 19-10 al 01-11), pero el equipo todavía no confirma esa duración como la de los sprints **[POR CONFIRMAR]**. La asignación de ítems a cada sprint se registra en el Sprint Backlog (SIM-06).
- **Reglas de cada módulo:** conductores, documentos, turnos e ingresos necesitan un documento de reglas como JOA-01 antes de desarrollarse. Ahí se resuelven los **[POR CONFIRMAR]** de sus ítems. Conductores (PB-08 a PB-10): resueltos en [JOA-09](JOA-09_Reglas_Modulo_Conductores.md).
- **PB-20:** falta decidir si el resumen de la flota entra en el MVP.

---

## 9. Cómo se mantiene

- **Cuándo:** al cierre de cada sprint y cada vez que el equipo acuerde un cambio de alcance.
- **Quién:** Joaquín, como Product Owner, propone el cambio en un pull request y otro integrante lo revisa.
- **Qué se actualiza:** el estado de los ítems, el orden de prioridad, los ítems nuevos o descartados, los **[POR CONFIRMAR]** que se resolvieron y el registro de cambios.
- Los identificadores `PB-xx` no se reutilizan ni se renumeran, para que el plan de pruebas (SIM-04) y los Sprint Backlog (SIM-06) puedan citarlos.

### Registro de cambios

| Fecha | Cambio |
|---|---|
| 12-10-2026 | Primera versión del backlog. |
| 18-10-2026 | Cierre de la Iteración 2: PB-03 pasa a En curso, se agrega el avance de la primera entrega y se anota la duración de las iteraciones del tablero. |

---

## 10. Checklist de JOA-08

- [x] Incluye todo el alcance del producto: vehículos, conductores, turnos, documentación, avisos por correo e ingresos opcionales (secciones 4, 5 y 6).
- [x] Cada ítem tiene sus criterios de aceptación (secciones 3 a 6).
- [x] Está priorizado y distingue primera entrega, MVP completo y opcionales (sección 2).
- [ ] Revisión y aportes de José y Simón en el PR.
- [ ] Se actualiza al cierre de cada sprint (sección 9).
