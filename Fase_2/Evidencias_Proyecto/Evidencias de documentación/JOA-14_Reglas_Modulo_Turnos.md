# JOA-14 · Campos y reglas del módulo de turnos

| | |
|---|---|
| **Tarea** | [JOA-14] Definir campos y reglas del módulo de turnos |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (modelo de datos) y Simón Jofré (implementación y pruebas) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 28-10-2026 |

Este documento fija las reglas de los ítems **PB-17**, **PB-18** y **PB-19** del [Product Backlog](JOA-08_Product_Backlog.md), como pide su sección 8 antes de desarrollar cada módulo. Cierra los **[POR CONFIRMAR]** de esos ítems y de la tabla `turno` del [modelo de datos](JOS-04_Modelo_de_Datos.md) (secciones 3.6 y 3.9). Sigue el mismo formato que [JOA-09](JOA-09_Reglas_Modulo_Conductores.md) y [JOA-10](JOA-10_Reglas_Modulo_Documentos.md). Las decisiones se acordaron en equipo el 28-10-2026.

---

## 1. Alcance

> Asignar un vehículo y un conductor a una fecha y jornada, ver los turnos de cada día, y corregir o anular un turno, sin que una empresa pueda ver o modificar los de otra.

Incluye:

- Crear un turno.
- Ver los turnos de un día, con filtros por vehículo o conductor.
- Editar y anular un turno.
- Separación de datos entre empresas, con las mismas reglas de JOA-01 (sección 2.4).
- Uso desde computador y celular.

Fuera de este módulo:

- **Horarios exactos.** La jornada indica la parte del día, no la hora.
- **Turnos que se repiten** (por ejemplo, "todos los lunes"). Cada turno se crea por separado.
- Rutas, recorridos o GPS (fuera del proyecto).
- Avisos por correo sobre turnos. Las alertas son solo de vencimientos ([JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md)).
- Vista semanal tipo calendario.

---

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Jornadas (PB-17) | **Mañana, tarde y noche**, sin horario fijo. | Es como las empresas organizan el día. Con horas exactas, la regla de "no repetir" se vuelve mucho más compleja. |
| Vehículos asignables (PB-17) | **Solo vehículos activos.** Los "en mantención" e inactivos no aparecen para elegir. | Un vehículo en taller no puede salir. |
| Conductores asignables (PB-17) | Solo conductores activos. | PB-10, criterio 2. |
| Sin duplicados (PB-17) | Un vehículo y un conductor tienen **como máximo un turno por fecha y jornada**. Pueden tener turnos en otras jornadas del mismo día. Los anulados no cuentan. | Evita asignar dos veces el mismo vehículo o conductor. Sí se permite doblar jornada. |
| Anular (PB-19) | **Se marca como anulado, no se borra.** Pide confirmación y admite un **motivo opcional**. | Igual que el resto del sistema: nada se elimina. El turno anulado libera su vehículo y conductor. |
| Fechas al crear | Desde **hoy** hasta **60 días** hacia adelante, en hora de Chile. | No tiene sentido crear turnos pasados, y 60 días alcanzan para planificar. |
| Editar y anular | Solo turnos de **hoy en adelante**. Los pasados quedan como registro y no se modifican. | El registro de quién manejó qué no debe cambiar después. |
| Dueño pasa a mantención o inactivo | Sus turnos futuros **no se anulan solos**. Se muestran con un aviso ("Vehículo en mantención", "Vehículo inactivo" o "Conductor inactivo") para reasignarlos. Al desactivar un vehículo o conductor con turnos futuros, el mensaje de confirmación indica cuántos tiene. | El responsable decide qué hacer. Anular en automático podría dejar jornadas sin cubrir sin que nadie se dé cuenta. |
| Vista | **Por día**, en 3 bloques (mañana, tarde y noche). | Es la pregunta del día a día: "¿quién sale hoy?". Se ve bien en el celular. |
| Implementación | Iteración 7 (14-12 al 27-12), entre Simón y Joaquín. | Depende de conductores (Iteración 4). |

---

## 3. Turno: campos y formatos

| Campo | Tipo | Obligatorio | Formato / regla |
|---|---|---|---|
| `id` | uuid | Sí | Generado por el sistema. |
| `empresa_id` | uuid → Empresa | Sí | Asignado por el servidor desde la sesión, nunca desde el formulario. |
| `fecha` | fecha (sin hora) | Sí | Al crear: entre hoy y hoy + 60 días (hora de Chile). Se muestra como `DD-MM-AAAA`. |
| `jornada` | enum | Sí | `manana`, `tarde` o `noche`. Se muestran como Mañana, Tarde y Noche. |
| `vehiculo_id` | uuid → Vehículo | Sí | Vehículo de la misma empresa, activo al crear o editar. |
| `conductor_id` | uuid → Conductor | Sí | Conductor de la misma empresa, activo al crear o editar. |
| `anulado` | sí / no | Sí | `no` por defecto. |
| `motivo_anulacion` | texto (máx. 200) | No | Solo si está anulado. |
| `created_at`, `updated_at` | fecha y hora | Sí | Automáticos. |

**Cambio respecto de JOS-04 (sección 3.6):** se agrega `motivo_anulacion`. El resto queda igual: claves foráneas compuestas para no cruzar empresas, índice `(empresa_id, fecha)` y dos índices únicos parciales, `(vehiculo_id, fecha, jornada)` y `(conductor_id, fecha, jornada)`, que solo cuentan los turnos no anulados.

### 3.1 Editar

- Se pueden cambiar la fecha, la jornada, el vehículo y el conductor, con las mismas validaciones que al crear.
- Si el vehículo o el conductor del turno ya no está activo, se puede guardar sin cambiarlo. La regla de "solo activos" aplica al elegir uno nuevo.
- Un turno anulado no se edita. Si hay que volver a usarlo, se crea uno nuevo.

### 3.2 Anular

- Pide confirmación: "¿Anular el turno de la mañana del 15-12-2026 (BBCD-12 · Pedro Soto)?".
- Se puede anotar un motivo de hasta 200 caracteres.
- Después de anular, el vehículo y el conductor quedan libres para otro turno en esa fecha y jornada.

---

## 4. Comportamiento de las pantallas

- **Menú:** se agrega "Turnos".
- **Vista del día:** abre en la fecha de hoy. Tiene botones "Día anterior", "Hoy" y "Día siguiente", y un selector de fecha. Muestra 3 bloques (Mañana, Tarde y Noche) y, en cada uno, los turnos con la patente, el número interno del vehículo y el nombre del conductor.
- **Avisos en cada turno:** "Anulado" (tachado, con el motivo si lo tiene), "Vehículo en mantención", "Vehículo inactivo" o "Conductor inactivo". Se leen en el texto, no solo por el color.
- **Filtros:** por vehículo o por conductor. Muestran sus turnos desde hoy en adelante, ordenados por fecha y jornada. "Ocultar anulados" viene marcado por defecto.
- **Sin turnos:** "No hay turnos para este día" y un botón "Asignar turno".
- **Crear y editar:** el formulario pide fecha, jornada, vehículo y conductor. Las listas muestran solo los activos y, junto a cada uno, si ya tiene turno en esa fecha y jornada. El error se muestra junto a cada campo. Al guardar, vuelve a la vista de ese día con un mensaje de confirmación.
- **Celular (360 px):** los 3 bloques uno debajo del otro, sin desplazamiento horizontal.
- **Validación en dos lugares:** en el formulario y en el servidor con **Zod**. Los índices únicos de la base de datos son la última protección.
- **Permisos:** los mismos de JOA-01 (sección 2.4). Un turno de otra empresa responde **404**.

Mensajes:

| Caso | Mensaje |
|---|---|
| Fecha vacía | "Selecciona la fecha del turno." |
| Fecha pasada o a más de 60 días | "La fecha debe estar entre hoy y el 26-12-2026." (calculada desde hoy) |
| Jornada vacía | "Selecciona la jornada." |
| Vehículo vacío | "Selecciona el vehículo." |
| Conductor vacío | "Selecciona el conductor." |
| Vehículo no activo | "El vehículo BBCD-12 no está activo y no se puede asignar." |
| Conductor inactivo | "Pedro Soto está inactivo y no se puede asignar." |
| Vehículo ya asignado | "BBCD-12 ya tiene un turno el 15-12-2026 en la mañana." |
| Conductor ya asignado | "Pedro Soto ya tiene un turno el 15-12-2026 en la mañana." |
| Editar un turno pasado o anulado | "Este turno ya no se puede modificar." |
| Guardado | "Turno asignado correctamente." / "Los cambios del turno se guardaron." |
| Anulado | "Turno anulado." |
| Error del servidor | "No pudimos guardar el turno. Intenta nuevamente." (sin detalles técnicos) |

---

## 5. Ejemplos de datos

Supuestos: hoy es **27-10-2026** en hora de Chile. La empresa tiene los vehículos BBCD-12 y FGHJ-34 (activos), HJKL-78 (en mantención) y XY-4321 (inactivo), y los conductores Pedro Soto y María Muñoz (activos) y Luis Rojas (inactivo). Ya existe un turno el 28-10-2026 en la mañana con BBCD-12 y Pedro Soto.

### 5.1 Válidos

| Fecha | Jornada | Vehículo | Conductor | Nota |
|---|---|---|---|---|
| 28-10-2026 | Tarde | BBCD-12 | Pedro Soto | Mismo vehículo y conductor, otra jornada. |
| 28-10-2026 | Mañana | FGHJ-34 | María Muñoz | Otro vehículo y otro conductor en la misma jornada. |
| 27-10-2026 | Noche | FGHJ-34 | Pedro Soto | Hoy. |
| 26-12-2026 | Mañana | BBCD-12 | María Muñoz | El último día permitido (hoy + 60). |

### 5.2 Inválidos

| Dato | Motivo |
|---|---|
| 28-10-2026, Mañana, BBCD-12, María Muñoz | BBCD-12 ya tiene turno esa mañana. |
| 28-10-2026, Mañana, FGHJ-34, Pedro Soto | Pedro Soto ya tiene turno esa mañana. |
| HJKL-78 | Está en mantención. |
| XY-4321 o Luis Rojas | Están inactivos. |
| Fecha 26-10-2026 | Es pasada. |
| Fecha 27-12-2026 | Supera los 60 días. |
| Jornada `madrugada` | No existe. |
| Vehículo de otra empresa (por id en una solicitud) | Responde "no encontrado" y no se guarda nada. |
| `empresa_id` enviado en el formulario | Se ignora: el servidor usa el de la sesión. |

---

## 6. Criterios de aceptación

Base para las pruebas del módulo (SIM-04, casos CP-FUN-29 a CP-FUN-31). Se prueban con las dos empresas ficticias.

**Crear**

1. Crear un turno válido lo guarda, y aparece en la vista de ese día después de recargar.
2. Las listas para elegir muestran solo vehículos y conductores activos de la empresa.
3. Asignar un vehículo o un conductor que ya tiene turno en esa fecha y jornada muestra su error y no guarda nada. En otra jornada del mismo día sí se permite.
4. Una fecha pasada o a más de 60 días muestra su error.

**Ver**

5. La vista del día muestra los turnos en sus 3 jornadas, y se puede avanzar o retroceder de día.
6. Los filtros por vehículo y por conductor muestran sus turnos desde hoy, ordenados.
7. Un día sin turnos muestra el mensaje y el botón para asignar.
8. Un turno cuyo vehículo pasó a mantención, o cuyo vehículo o conductor fue desactivado, muestra el aviso correspondiente.

**Editar y anular**

9. Editar un turno de hoy en adelante guarda el cambio con las mismas validaciones. Un turno pasado o anulado no se puede editar.
10. Anular pide confirmación, guarda el motivo si se escribió, muestra el turno como anulado y libera su vehículo y conductor para esa jornada.
11. Al desactivar un vehículo o un conductor con turnos futuros, la confirmación indica cuántos tiene, y los turnos no se anulan.

**Separación entre empresas**

12. El usuario de A no ve los turnos de B.
13. Abrir, editar o anular un turno de B por su id, o crear un turno con un vehículo o conductor de B, responde "no encontrado" y no cambia nada.

**Adaptabilidad**

14. La vista del día y el formulario se pueden usar a 360 px sin desplazamiento horizontal.

---

## 7. Checklist de JOA-14

- [x] Alcance y exclusiones del módulo (sección 1).
- [x] Cierra los [POR CONFIRMAR] de PB-17 a PB-19 y de la tabla `turno` de JOS-04 (sección 2).
- [x] Campos y reglas de editar y anular (sección 3).
- [x] Comportamiento de las pantallas y mensajes (sección 4).
- [x] Ejemplos válidos e inválidos (sección 5).
- [x] Criterios de aceptación numerados (sección 6).
- [ ] Revisión y aprobación de José y Simón en el PR.
