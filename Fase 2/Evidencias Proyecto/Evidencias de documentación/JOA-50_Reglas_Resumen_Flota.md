# JOA-50 · Reglas del resumen de la flota

| | |
|---|---|
| **Tarea** | [JOA-50] Reglas del resumen de la flota |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (consultas y pantalla, JOS-21) y Simón Jofré (pruebas, SIM-14) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 20-11-2026 |

Este documento fija las reglas del ítem **PB-20** del [Product Backlog](JOA-08_Product_Backlog.md), como pide su sección 8 antes de desarrollar cada módulo. Responde la necesidad 3 de la [Product Vision](JOA-04_Product_Vision.md): "ver el estado de la flota de un vistazo", que hoy no está cubierta, porque al entrar a la aplicación se salta directo al listado de vehículos.

En el plan para la defensa de título, PB-20 entra en la Iteración 5 con prioridad P1 ([SIM-06](SIM-06_Sprint_Backlog_y_Retrospectivas.md), sección 7): lo construye José (JOS-21) y lo prueba Simón (SIM-14 y SIM-15).

Las decisiones de la sección 2 son la propuesta del Product Owner; quedan firmes cuando José y Simón aprueban el PR.

---

## 1. Alcance

> Ver al entrar cuántos vehículos están activos, en mantención e inactivos, y cuántos documentos están vencidos o por vencer, con acceso directo a cada listado.

Incluye:

- Una pantalla de inicio con el resumen de los vehículos por estado y de los documentos que necesitan atención.
- Que cada número lleve al listado ya filtrado.
- Los mensajes cuando la empresa todavía no tiene datos o tiene todo al día.

Fuera de este módulo:

- **Gráficos, tendencias o historial.** El resumen muestra la foto de hoy; no compara con días anteriores.
- **Los turnos del día.** Se pueden agregar al resumen cuando exista el módulo de turnos (PB-17 a PB-19).
- **Ingresos** (PB-21 a PB-23), que son opcionales.
- **Configurar qué se muestra.** El resumen es igual para todas las empresas.

---

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Dónde se ve | En la **pantalla de inicio** (`/`), que pasa a ser la primera después de iniciar sesión. Se agrega **"Inicio"** como primera opción del menú. | Es lo primero que necesita saber el responsable al entrar: qué está bien y qué necesita atención. |
| Vehículos | Cuántos están **activos**, **en mantención** e **inactivos**, y el total. | Es el criterio 1 de PB-20. Son los tres estados de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) (sección 3.2). |
| Documentos | Cuántos están **vencidos** y cuántos **por vencer** (30 días o menos, contando el día del vencimiento). Dentro de "por vencer", cuántos **vencen hoy**. | Es el criterio 2 de PB-20. "Vence hoy" se destaca porque es el último día para renovar, y es el mismo aviso que llega por correo ([JOA-13](JOA-13_Reglas_Alertas_Vencimiento.md)). |
| Documentos vigentes | **No se muestran** en el resumen. | El resumen responde qué necesita atención. Los vigentes se ven en el listado de documentos. |
| Dueños inactivos | Los documentos de vehículos inactivos y de conductores inactivos **no se cuentan**. | Es la misma regla del listado de documentos y de los avisos ([JOA-10](JOA-10_Reglas_Modulo_Documentos.md), sección 2): un vehículo vendido o un conductor que ya no trabaja no necesita control de vencimientos. |
| Estado de los documentos | Se calcula igual que en el listado: con la fecha de vencimiento y la fecha de hoy en **hora de Chile**. | Así los números del resumen siempre coinciden con lo que muestra el listado al hacer clic. |
| Cada número lleva a su listado | Cada número es un enlace al listado con el filtro aplicado (sección 3). | El resumen dice qué pasa; el listado muestra cuáles son. |
| Cuándo se actualiza | Se calcula cada vez que se abre la pantalla. **No se guarda** nada nuevo en la base de datos. | Los estados de los documentos cambian solos con los días; guardar los totales los dejaría desactualizados. |
| Empresas | Solo cuenta los datos de la empresa de la sesión. | Igual que todo el sistema (PB-03). |
| Permisos | Los mismos de JOA-01 (sección 2.4). | No hay nada nuevo que proteger: son totales de datos que el usuario ya puede ver. |

---

## 3. Qué muestra

| Bloque | Número | Lleva a |
|---|---|---|
| Vehículos | Activos | `/vehiculos?estado=activo` |
| Vehículos | En mantención | `/vehiculos?estado=en_mantencion` |
| Vehículos | Inactivos | `/vehiculos?estado=inactivo&inactivos=1` |
| Vehículos | Total | `/vehiculos?inactivos=1` (el listado oculta los inactivos si no se marca "Incluir inactivos") |
| Documentos | Vencidos | `/documentos?estado=vencido` |
| Documentos | Por vencer (con "N vencen hoy" si hay alguno) | `/documentos?estado=por_vencer` |

El listado al que lleva cada enlace debe mostrar exactamente la cantidad que dice el resumen.

---

## 4. Comportamiento de las pantallas

- **Menú:** "Inicio" queda primero, antes de "Vehículos".
- **Después de iniciar sesión** se llega a "Inicio", no al listado de vehículos.
- **Computador:** dos bloques, "Vehículos" y "Documentos", uno al lado del otro. Cada número va en su tarjeta, con el nombre del estado escrito (por ejemplo, "3 · En mantención").
- **Celular (360 px):** los bloques y las tarjetas uno debajo del otro, sin desplazamiento horizontal.
- **Colores:** los mismos de la insignia de cada estado en los listados. El estado se lee en el texto y no solo en el color (RNF-USA-06).
- **Accesos rápidos:** botones "Registrar vehículo" y "Registrar documento".

Mensajes:

| Caso | Mensaje |
|---|---|
| La empresa no tiene vehículos | "Todavía no tienes vehículos registrados." y el botón "Registrar vehículo" |
| La empresa no tiene documentos (de dueños activos) | "Todavía no tienes documentos registrados." y el botón "Registrar documento" |
| Hay documentos, pero ninguno vencido ni por vencer | "Tus documentos están al día: ninguno vencido ni por vencer en los próximos 30 días." |
| Error al cargar | "No pudimos cargar el resumen. Intenta nuevamente." (sin detalles técnicos) |

---

## 5. Ejemplos de datos

Empresa de ejemplo, con **hoy = 15-12-2026**:

| Dato | Valor |
|---|---|
| Vehículos | 3 activos, 1 en mantención y 1 inactivo |
| SOAP de un vehículo activo | Vence el 10-12-2026 → vencido |
| Revisión técnica de un vehículo activo | Vence el 15-12-2026 → por vencer, "Vence hoy" |
| Permiso de circulación del vehículo en mantención | Vence el 05-01-2027 → por vencer (21 días) |
| Licencia de un conductor activo | Vence el 30-06-2027 → vigente |
| SOAP del vehículo inactivo | Vence el 01-12-2026 → vencido, pero **no se cuenta** (dueño inactivo) |

Resumen esperado:

| Número | Valor |
|---|---|
| Vehículos activos | 3 |
| Vehículos en mantención | 1 |
| Vehículos inactivos | 1 |
| Total de vehículos | 5 |
| Documentos vencidos | 1 |
| Documentos por vencer | 2, con "1 vence hoy" |

---

## 6. Criterios de aceptación

Base para las pruebas del resumen (SIM-04, casos que detalla SIM-14). Se prueban con las dos empresas ficticias.

**Vehículos**

1. El resumen muestra cuántos vehículos están activos, en mantención e inactivos, y el total.
2. Cada número lleva al listado de vehículos con su filtro, y el listado muestra exactamente esa cantidad.

**Documentos**

3. El resumen muestra cuántos documentos están vencidos y cuántos por vencer, y cuántos de estos vencen hoy cuando hay alguno.
4. Los documentos de vehículos o conductores inactivos no se cuentan.
5. Cada número lleva al listado de documentos con su filtro, y el listado muestra exactamente esa cantidad.
6. Un documento que vence hoy cuenta como "por vencer" y aparece en "vencen hoy"; desde mañana cuenta como "vencido".

**Pantalla**

7. Después de iniciar sesión se llega a "Inicio", y "Inicio" es la primera opción del menú.
8. Una empresa sin vehículos o sin documentos ve su mensaje y el botón para registrar.
9. Una empresa con documentos, pero ninguno vencido ni por vencer, ve el mensaje "Tus documentos están al día".

**Separación entre empresas**

10. El usuario de la Empresa A solo ve los totales de su empresa: crear o desactivar datos en la Empresa B no cambia el resumen de A.

**Adaptabilidad**

11. El resumen se puede usar a 360 px sin desplazamiento horizontal.

---

## 7. Notas para la implementación (José, JOS-21)

- **No necesita tablas ni migraciones nuevas.** Todo sale de `vehiculo` y `documento`.
- **Vehículos:** una consulta que cuente por `estado`, filtrada por la empresa de la sesión.
- **Documentos:** usar los mismos filtros del listado (`filtroDocumentos` y `DUENO_ACTIVO` en `src/lib/documentos-filtros.ts`, con `rangoDeEstado` de `src/lib/documentos.ts`). Así los números del resumen y del listado no pueden quedar distintos.
- **Inicio:** hoy `src/app/page.tsx` redirige a `/vehiculos`, y el inicio de sesión también (`src/app/login`). Ambos deben llevar a `/`.
- **"No encontrado":** puede seguir volviendo al listado de vehículos (`src/lib/navegacion.ts`); no es parte de este ítem.

---

## 8. Checklist de JOA-50

- [x] Alcance y lo que queda fuera (sección 1).
- [x] Decisiones con su porqué (sección 2).
- [x] Qué muestra y a qué listado lleva cada número (sección 3).
- [x] Pantallas, celular y mensajes (sección 4).
- [x] Ejemplo con el resultado esperado (sección 5).
- [x] Criterios de aceptación para SIM-14 (sección 6).
- [ ] Revisión y aprobación de José y Simón en el PR.
