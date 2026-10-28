# SIM-06 · Sprint Backlog y retrospectivas

| | |
|---|---|
| **Tarea** | [SIM-06] Mantener Sprint Backlog y retrospectivas |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | Joaquín Orellana (Product Owner) y José Vargas |
| **Estado** | En curso: se actualiza al inicio y al cierre de cada iteración |
| **Fecha** | 21-10-2026 (actualizado el 28-10-2026) |

Este documento registra qué tareas entraron en cada iteración (Sprint Backlog), cómo terminaron y qué aprendió el equipo en cada retrospectiva. Los datos salen del tablero del Project del equipo ("@josemarcelovg's Micrologist"), del historial de pull requests de GitHub y de los documentos [JOA-03](JOA-03_Validacion_Primera_Entrega.md) y [JOA-08](JOA-08_Product_Backlog.md). Los ítems del backlog se citan con su identificador `PB-xx`.

Las retrospectivas no se inventan: cada una trae los datos medibles de la iteración y temas propuestos a partir de esos datos, y lo que el equipo concluye se completa en la reunión, donde dice **[POR COMPLETAR EN LA RETROSPECTIVA]**. Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Cómo se trabaja por iteración

**Iteraciones del tablero** (campo *Iteration* del Project):

| Iteración | Fechas | Duración | Estado al 28-10-2026 |
|---|---|---|---|
| 1 | 21-09 al 04-10 | 2 semanas | Completada |
| 2 | 05-10 al 18-10 | 2 semanas | Completada |
| 3 | 19-10 al 01-11 | 2 semanas | En curso; retrospectiva hecha el 27-10 |
| 4 | 02-11 al 15-11 | 2 semanas | Planificada (sección 6) |

Los sprints duran 2 semanas, igual que estas iteraciones (acordado en la retrospectiva del 27-10-2026).

**Ciclo de cada iteración:**

1. **Planificación** (primer día): el Product Owner prioriza y el equipo elige las tarjetas que entran. Se registran en la sección 3 de este documento.
2. **Seguimiento** (reunión semanal): se revisa el tablero y los bloqueos.
3. **Cierre** (último día): se revisa lo terminado según la [Definition of Done](SIM-05_Definition_of_Done.md) y se hace la retrospectiva (sección 4).

**Estados del tablero:** *Todo*, *In progress* y *Done*. Una tarjeta pasa a *Done* cuando cumple sus criterios de aceptación y la Definition of Done, lo que incluye que su PR se una a `main` con un *Approve*. Desde la Iteración 4, cada tarjeta se estima con una talla de XS a XL (campo *Size*) al planificar la iteración (acordado el 27-10-2026). Las tarjetas de las iteraciones 1 a 3 no tienen estimación.

---

## 2. Resumen de las iteraciones

| Iteración | Tarjetas en el tablero | Terminadas | PR unidos a `main` | PR con *Approve* |
|---|---|---|---|---|
| 1 | 4 | 4 | 4 (#1 a #4) | 3 |
| 2 | 8 | 8 | 16 (#5 a #20) | 6 |
| 3 (al 21-10) | 6, más 2 sin iteración | 3 | 3 (#21 a #23) | 3 |

---

## 3. Sprint Backlog por iteración

### 3.1 Iteración 1 · 21-09 al 04-10

**Objetivo:** el tablero no registra un objetivo por iteración. A partir de las tareas: *definir el producto y dejar listo el proyecto base* **[POR CONFIRMAR]**.

| Tarea | Responsable | Ítems del backlog | PR (fecha de unión) | Estado al cierre |
|---|---|---|---|---|
| [JOA-01] Definir alcance, campos y reglas del módulo de vehículos | Joaquín | Reglas de PB-01 a PB-07 | #1 (24-09) | Terminada |
| [JOA-04] Redactar Product Vision | Joaquín | — | #2 (28-09) | Terminada |
| [JOS-01] Preparar proyecto Next.js y entorno compartido | José | — | #3 (28-09) | Terminada |
| [SIM-05] Definir y aprobar la Definition of Done | Simón | — | #4 (29-09) | Terminada |

En el tablero, la primera iteración se llama solo "Iteration" (sin número); estas cuatro tarjetas la tienen asignada.

### 3.2 Iteración 2 · 05-10 al 18-10

**Objetivo:** a partir de las tareas, *diseñar la solución y construir el módulo de vehículos con datos persistentes* **[POR CONFIRMAR]**.

| Tarea | Responsable | Ítems del backlog | PR (fecha de unión) | Estado al cierre |
|---|---|---|---|---|
| [JOA-05] Definir requisitos no funcionales verificables | Joaquín | — | #8 (13-10) | Terminada |
| [JOA-06] Elaborar diagramas UML | Joaquín | — | #9 (13-10) y #10 (16-10) | Terminada |
| [JOA-07] Documentar la innovación del proyecto | Joaquín | — | #7 (13-10) | Terminada |
| [JOA-08] Construir y priorizar el Product Backlog | Joaquín | PB-01 a PB-23 | #6 (13-10) y #18 (18-10) | Terminada |
| [JOS-02] Configurar Supabase, Prisma y modelo inicial de datos | José | PB-03 | #11 (16-10) | Terminada |
| [JOS-04] Documentar modelo de datos: DER y diccionario | José | — | #13 (16-10) | Terminada |
| [JOS-05] Configurar entorno Docker | José | — | #15 (16-10) | Terminada |
| [JOS-06] Redactar manual técnico | José | — | #16 (16-10) | Terminada |

**También avanzaron en esta iteración**, aunque en el tablero quedaron en la Iteración 3:

| Tarea | Responsable | Ítems del backlog | PR (fecha de unión) | Qué faltó |
|---|---|---|---|---|
| [JOA-02] Construir e integrar interfaz de vehículos | Joaquín | PB-04 a PB-07 | #5 (13-10) | Integrarla con el inicio de sesión |
| [JOS-03] Implementar registro, consulta y edición de vehículos | José | PB-04 a PB-07 | #12 (16-10) | Tomar la empresa desde la sesión |
| [JOA-03] Validar primera entrega y preparar demostración | Joaquín | — | #17 (18-10) | Ejecutar el guion completo |

**PR sin tarjeta en el tablero:** #14 (16-10) y #19 (18-10), que ordenaron el repositorio según la estructura de evidencias, y #20 (18-10), con la guía 2.4 de la Fase 2.

**Estado del backlog al cierre** (JOA-08, actualización del 18-10): PB-03 a PB-07 en curso; PB-01 y PB-02 pendientes, a la espera del inicio de sesión.

### 3.3 Iteración 3 · 19-10 al 01-11 (en curso)

**Objetivo** (JOA-03, secciones 6.4 y 7.2): *terminar la primera entrega*, es decir, inicio de sesión, vehículos con datos separados por empresa, pruebas con dos empresas ficticias y demostración.

| Tarea | Responsable | Ítems del backlog | PR (fecha de unión) | Estado en el tablero (21-10) | Estado real (21-10) |
|---|---|---|---|---|---|
| [SIM-01] Organizar y mantener tablero y seguimiento de la primera entrega | Simón | — | — | In progress | En curso |
| [SIM-02] Implementar inicio de sesión y control de acceso | Simón | PB-01, PB-02 y PB-03 | #21 (19-10) | Todo | Terminada |
| [SIM-03] Probar autenticación, vehículos y separación entre empresas | Simón | PB-01 a PB-07 | #22 (21-10) | Todo | Terminada: 14 de 14 criterios aprobados |
| [JOA-02] Construir e integrar interfaz de vehículos | Joaquín | PB-04 a PB-07 | #5 | In progress | En curso. La interfaz ya funciona con el inicio de sesión (probado en SIM-03); falta que el responsable confirme sus criterios |
| [JOS-03] Implementar registro, consulta y edición de vehículos | José | PB-04 a PB-07 | #12 | In progress | En curso. La empresa ya se toma de la sesión desde SIM-02; falta que el responsable confirme sus criterios |
| [JOA-03] Validar primera entrega y preparar demostración | Joaquín | — | #17 | In progress | En curso: falta ejecutar el guion completo |
| [SIM-04] Elaborar plan de pruebas y trazabilidad | Simón | — | #23 (21-10) | Todo, sin iteración | Terminada |
| [SIM-06] Mantener Sprint Backlog y retrospectivas | Simón | — | Este documento | Todo, sin iteración | En curso |

---

## 4. Retrospectivas

Cada retrospectiva responde tres preguntas: **qué funcionó**, **qué no funcionó** y **qué vamos a cambiar**. Las acciones que salgan pasan a la sección 5 con responsable y fecha.

### 4.1 Iteración 1

**Datos:**

- 4 de 4 tarjetas terminadas.
- 3 de 4 PR con *Approve*. El PR #1 se unió el 24-09, antes de que existiera la Definition of Done (aprobada el 29-09 con el PR #4).
- En el tablero, esta iteración se llama solo "Iteration", sin número, lo que se confunde con una tarjeta sin iteración.

**Temas propuestos a partir de los datos:**

- La Definition of Done se acordó al final de la iteración. ¿Conviene definir las reglas de trabajo antes de empezar a entregar?

| Qué funcionó | Qué no funcionó | Qué vamos a cambiar |
|---|---|---|
| El reparto de tareas quedó bien y se terminaron las 4 tarjetas. | La Definition of Done llegó tarde y el PR #1 se unió antes de que existieran las reglas de trabajo. Faltó organizar mejor los tiempos, porque el proyecto se cruza con la práctica profesional de los tres. | Acordar la Definition of Done y las reglas de trabajo antes de empezar cada módulo. Planificar cada iteración según la carga de la práctica profesional de cada uno. |

### 4.2 Iteración 2

**Datos:**

- 8 de 8 tarjetas de la iteración terminadas. JOA-02, JOS-03 y JOA-03 avanzaron (sus PR se unieron), pero pasaron a la Iteración 3.
- 16 PR unidos: 6 con *Approve* y 10 sin él (#5 a #9, #14 y #17 a #20), aunque la Definition of Done lo exige (sección 2).
- Los PR #5 a #9 se unieron en dos minutos, el 13-10 entre las 23:25 y las 23:26.
- La estructura de carpetas del repositorio cambió dos veces (PR #14 el 16-10 y PR #19 el 18-10), y las ramas que estaban en curso tuvieron que adaptarse (JOS-05 y SIM-02).
- El inicio de sesión (SIM-02) quedó para la Iteración 3 y era lo que impedía cerrar la primera entrega (JOA-03, sección 2).

**Temas propuestos a partir de los datos:**

- Cómo asegurar que todo PR tenga una revisión antes de unirse; por ejemplo, con una regla en la rama `main` que exija una aprobación.
- Avisar y coordinar antes de mover carpetas del repositorio, para no romper las ramas abiertas.
- Partir antes con las tareas que bloquean a otras, como el inicio de sesión.

| Qué funcionó | Qué no funcionó | Qué vamos a cambiar |
|---|---|---|
| Se terminaron las 8 tarjetas y avanzó harto la documentación. | Por apuro, se unieron PR sin revisión (10 de 16). El inicio de sesión partió tarde y frenó el cierre de la primera entrega. | Activar en `main` la regla que exige una aprobación antes de unir un PR. Al planificar, partir por las tareas que bloquean a otras. |

### 4.3 Iteración 3

**Datos** (retrospectiva del 27-10-2026):

- SIM-02, SIM-03 y SIM-04 unidas, las tres con *Approve* (PR #21 a #23).
- Primera entrega: 14 de 14 criterios de JOA-01 aprobados en las pruebas de SIM-03.
- Primera entrega cerrada: demo ensayada con inicio de sesión y README probado por José en su notebook (12 minutos, sin problemas).
- Los 16 PR unidos en la iteración (#21 a #36) tienen *Approve*.
- Un error abierto: ERR-01, con 3 vulnerabilidades altas en las dependencias ([SIM-04](SIM-04_Plan_de_Pruebas.md), sección 9).
- El tablero no refleja el avance: el 21-10, SIM-02, SIM-03 y SIM-04 seguían en *Todo*, y SIM-04 y SIM-06 no tenían iteración asignada.

**Temas propuestos a partir de los datos:**

- Mover cada tarjeta a *Done* cuando se une su PR, vinculando el PR a la tarjeta o usando las automatizaciones del Project.

| Qué funcionó | Qué no funcionó | Qué vamos a cambiar |
|---|---|---|
| Se cerró la primera entrega (14 de 14 criterios, demo ensayada) y todos los PR pasaron por revisión. | El tablero se atrasó: había tarjetas terminadas que seguían en *Todo*. ERR-01 sigue abierto y bloquea el inicio de conductores. | Quien aprieta *Merge* mueve la tarjeta a *Done* en ese mismo momento. Cerrar ERR-01 (JOS-07) el 02-11. |

---

## 5. Acciones de mejora

Las acciones nacen de los temas de la sección 4. Estas se acordaron en la retrospectiva del 27-10-2026. Las acciones propuestas "regularizar los PR unidos sin *Approve*" y "avisar antes de mover carpetas" se descartaron.

| # | Acción | Origen | Responsable | Fecha | Estado |
|---|---|---|---|---|---|
| 1 | Activar en `main` la regla que exige una aprobación antes de unir un PR. | Iteración 2 | José, como dueño del repositorio | 02-11 | Aceptada |
| 2 | Acordar la Definition of Done y las reglas de trabajo antes de empezar cada módulo. | Iteración 1 | Todos | Al inicio de cada módulo | Aceptada |
| 3 | Planificar cada iteración según la carga de la práctica profesional de cada uno. | Iteración 1 | Todos | En cada planificación | Aceptada |
| 4 | Al planificar, partir por las tareas que bloquean a otras. | Iteración 2 | Joaquín (Product Owner) | En cada planificación | Aceptada |
| 5 | Quien aprieta *Merge* mueve la tarjeta a *Done* en ese mismo momento. | Iteración 3 | Quien hace el *Merge* | Desde el 27-10 | Aceptada |
| 6 | Cerrar ERR-01 actualizando Next.js (JOS-07). | Iteración 3 | José | 02-11 | Aceptada |
| 7 | Sprints de 2 semanas, igual que las iteraciones del tablero. | Iteraciones 1 a 3 | Todos | Desde la Iteración 4 | Aceptada |

---

## 6. Iteración 4 · 02-11 al 15-11

Planificada en la reunión del 27-10-2026.

**Objetivo:** cerrar ERR-01, desplegar en Vercel y terminar el módulo de conductores (registrar, listar, editar y desactivar), probado con dos empresas ficticias.

| Orden | Tarea | Responsable | Talla | Depende de |
|---|---|---|---|---|
| 1 | [JOS-07] Cerrar ERR-01 (actualizar Next.js), el 02-11 | José | S | — |
| 2 | [JOS-09] Tabla de conductores, migración con RLS y datos de prueba | Simón | M | JOS-07 |
| 3 | [JOS-10] Validación y acceso a datos de conductores | Joaquín | M | JOS-09 |
| 4 | [JOA-11] y [JOA-12] Pantallas de conductores | Joaquín | M | JOS-10 |
| 5 | [SIM-08] Pruebas de conductores (y CP-INT-17 a 20 en SIM-04) | Simón | M | JOA-12 |
| 6 | [SIM-10] Desplegar la aplicación en Vercel | Simón, con apoyo de José | M | JOS-07 |
| — | [SIM-06] Registrar esta retrospectiva | Simón | XS | — |

Las reglas de los módulos de conductores (JOA-09, PR #33) y documentos (JOA-10, PR #35) y el cierre de la primera entrega (JOA-03, PR #36) ya se unieron a `main` en la Iteración 3. [SIM-09] (fechas en hora de Chile) pasa a la Iteración 5, porque recién se necesita para el módulo de documentos.

**Reunión de seguimiento:** jueves 06-11 en la noche, unos 20 minutos.

---

## 7. Cómo se mantiene

- **Al inicio de cada iteración:** se agrega su Sprint Backlog en la sección 3, con tareas, responsables, ítems del backlog y objetivo.
- **Al cierre de cada iteración:** se completan los datos, se hace la retrospectiva con el equipo y se actualiza la sección 5.
- **Quién:** Simón, como Scrum Master; los cambios se proponen en un PR que revisa otro integrante.

### Registro de cambios

| Fecha | Cambio |
|---|---|
| 21-10-2026 | Primera versión: Sprint Backlog de las iteraciones 1, 2 y 3, y datos y temas para sus retrospectivas. |
| 28-10-2026 | Retrospectivas de las iteraciones 1 a 3 (reunión del 27-10-2026), acciones de mejora aceptadas y planificación de la Iteración 4. |

---

## 8. Checklist de SIM-06

- [x] Iteraciones y fechas tomadas del tablero (sección 1).
- [x] Sprint Backlog de las iteraciones 1, 2 y 3, con tareas, responsables, ítems del backlog y PR (sección 3).
- [x] Datos medibles y temas propuestos para cada retrospectiva (sección 4).
- [x] Retrospectivas de las iteraciones 1 y 2 completadas con el equipo (sección 4).
- [x] Acciones de mejora aceptadas, con responsable y fecha (sección 5).
- [x] Retrospectiva de la Iteración 3 al cierre, hecha el 27-10.
- [x] Planificación de la Iteración 4 (sección 6).
- [ ] Revisión de Joaquín y José en el PR.
