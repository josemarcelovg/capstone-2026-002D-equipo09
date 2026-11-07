# JOA-10 · Campos y reglas del módulo de documentos

| | |
|---|---|
| **Tarea** | [JOA-10] Definir campos y reglas del módulo de documentos |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (modelo de datos) y Simón Jofré (pruebas y fechas) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 27-10-2026 |

Este documento fija las reglas de los ítems **PB-11**, **PB-12** y **PB-13** del [Product Backlog](JOA-08_Product_Backlog.md), como pide su sección 8 antes de desarrollar cada módulo. Cierra los **[POR CONFIRMAR]** de esos ítems y de la tabla `documento` del [modelo de datos](JOS-04_Modelo_de_Datos.md) (secciones 3.5 y 6). Sigue el mismo formato que [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) y [JOA-09](JOA-09_Reglas_Modulo_Conductores.md).

Las decisiones de la sección 2 son la propuesta del Product Owner; quedan firmes cuando José y Simón aprueban el PR.

---

## 1. Alcance

> Registrar los documentos de los vehículos y conductores con su fecha de vencimiento, ver cuáles están vigentes, por vencer o vencidos, y actualizarlos al renovarlos, sin que una empresa pueda ver o modificar los de otra.

Incluye:

- Registrar un documento de un vehículo o de un conductor.
- Un listado general de documentos de la empresa, ordenado por vencimiento y con filtros.
- Los documentos de cada vehículo y conductor, en su ficha.
- Editar un documento para renovarlo (nueva fecha) o corregirlo.
- Separación de datos entre empresas, con las mismas reglas de JOA-01 (sección 2.4).
- Uso desde computador y celular.

Fuera de este módulo:

- **Los avisos por correo** (PB-15 y PB-16). Este módulo deja calculado el estado de cada documento; cuándo y a quién se avisa se define en el documento de reglas de los avisos. Lo único que se adelanta está en la sección 3.4.
- **Los datos de contacto de la empresa** (PB-14).
- **Adjuntar el archivo** del documento (foto o PDF). Ver la sección 2.
- **Historial** de vencimientos anteriores. Ver la sección 2.

---

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Tipos y dueño (PB-11) | Revisión técnica, SOAP y permiso de circulación son de un **vehículo**; licencia de conducir es de un **conductor**; "otro" puede ser de cualquiera de los dos. Un documento tiene un solo dueño. | Son los documentos que exige la ley para operar y los que hoy se controlan a mano (Product Vision). |
| Campos (PB-11) | Tipo, dueño y fecha de vencimiento obligatorios. Descripción obligatoria solo cuando el tipo es "otro"; opcional en los demás (por ejemplo, la clase de la licencia). Observaciones opcionales. | Es lo mínimo para controlar vencimientos. Número de póliza o folio no se usan para nada en el MVP. |
| Archivo adjunto (PB-11) | **No en el MVP.** | Guardar archivos agrega almacenamiento, límites de tamaño y datos sensibles (la licencia tiene foto y datos personales). Se puede agregar después sin cambiar las reglas. |
| Un documento por dueño y tipo | Un vehículo tiene **un solo** SOAP, una sola revisión técnica y un solo permiso de circulación; un conductor tiene una sola licencia. Los de tipo "otro" no tienen límite. | Si se pudiera registrar uno nuevo en cada renovación, el anterior quedaría para siempre como "vencido" y ensuciaría el listado y los avisos. Renovar es editar (PB-13). |
| "Por vencer" (PB-12) | **30 días o menos**, contando el día del vencimiento. | Da tiempo para agendar la revisión técnica o renovar el permiso. Es el mismo plazo del primer aviso propuesto. |
| El día del vencimiento | La fecha de vencimiento es el **último día válido**: ese día el documento está "por vencer" y se muestra como "Vence hoy". Desde el día siguiente, "vencido". | Así se lee la fecha impresa en los documentos chilenos. |
| Zona horaria (PB-12) | "Hoy" es la fecha en **hora de Chile** (`America/Santiago`), no la del servidor. | El servidor corre en otra zona horaria; entre las 21:00 y las 23:59 de Chile ya sería "mañana" y los estados cambiarían antes de tiempo. |
| Historial (PB-13) | **No en el MVP.** Renovar reemplaza la fecha. | No lo pide ningún criterio del MVP. El registro de avisos enviados ya guarda las fechas a las que se avisó. |
| Eliminar | **No existe eliminar.** Un documento mal ingresado se corrige editándolo. | Igual que vehículos y conductores. Con un documento por tipo, corregir siempre es posible. |
| Dueños inactivos | No se pueden registrar documentos nuevos para un vehículo o conductor inactivo. Sus documentos no aparecen en el listado general por defecto (se ven con "Incluir inactivos") y no generan avisos. | Un vehículo vendido o un conductor que ya no trabaja no necesita control de vencimientos. Si se reactiva, sus documentos vuelven a contar. |
| Cambiar el dueño al editar | Se puede, pero solo dentro del mismo tipo de dueño: de un vehículo a otro vehículo, o de un conductor a otro conductor. | Es la única forma de corregir un documento asociado al vehículo equivocado, porque no se elimina. |
| Rango de fechas | Entre hoy **menos 5 años** y hoy **más 10 años**. Las fechas pasadas se aceptan. | Detecta errores de tipeo (2062 en vez de 2026). Se acepta una fecha pasada porque al empezar a usar el sistema habrá documentos ya vencidos. |
| Paginación | No en el MVP. | Igual que vehículos y conductores. |

---

## 3. Documento: campos y formatos

| Campo | Tipo | Obligatorio | Formato / regla |
|---|---|---|---|
| `id` | uuid | Sí | Generado por el sistema. |
| `empresa_id` | uuid → Empresa | Sí | Asignado por el servidor desde la sesión, nunca desde el formulario. |
| `tipo` | enum | Sí | `revision_tecnica`, `soap`, `permiso_circulacion`, `licencia_conducir`, `otro`. |
| `vehiculo_id` | uuid → Vehículo | Según el tipo | Vehículo de la misma empresa y activo al registrar. |
| `conductor_id` | uuid → Conductor | Según el tipo | Conductor de la misma empresa y activo al registrar. |
| `descripcion` | texto (2–100) | Solo si el tipo es `otro` | Ej.: "Clase A3", "Seguro de pasajeros". |
| `fecha_vencimiento` | fecha (sin hora) | Sí | Entre hoy − 5 años y hoy + 10 años. Se ingresa y se muestra como `DD-MM-AAAA`. |
| `observaciones` | texto (máx. 500) | No | |
| `created_at`, `updated_at` | fecha y hora | Sí | Automáticos. |

### 3.1 Tipo y dueño

| Tipo | Etiqueta | Dueño |
|---|---|---|
| `revision_tecnica` | Revisión técnica | Vehículo |
| `soap` | SOAP | Vehículo |
| `permiso_circulacion` | Permiso de circulación | Vehículo |
| `licencia_conducir` | Licencia de conducir | Conductor |
| `otro` | Otro | Vehículo o conductor |

- Siempre hay exactamente un dueño: un vehículo **o** un conductor, nunca los dos ni ninguno.
- El dueño tiene que ser de la empresa de la sesión. Si no, se responde "no encontrado", igual que al abrir un vehículo de otra empresa.

### 3.2 Estado

El estado **no se guarda**: se calcula cada vez con la fecha de vencimiento y la fecha de hoy en hora de Chile.

| Estado | Condición | Cómo se muestra |
|---|---|---|
| Vencido | La fecha de vencimiento es anterior a hoy. | "Vencido" y "Venció hace N días" (o "Venció ayer") |
| Por vencer | Faltan de 0 a 30 días. | "Por vencer" y "Vence en N días", "Vence mañana" o "Vence hoy" |
| Vigente | Faltan más de 30 días. | "Vigente" y la fecha |

El estado se lee en el texto y no solo en el color (RNF-USA-06).

### 3.3 Renovar y corregir

- **Renovar** es editar el documento y poner la nueva fecha de vencimiento. El estado se recalcula al guardar.
- **Corregir** es editar cualquier otro campo. El tipo se puede cambiar solo si el nuevo tipo admite al mismo dueño.
- Registrar un segundo documento del mismo tipo para el mismo dueño (salvo "otro") muestra un mensaje que lleva a editar el existente.

### 3.4 Lo que este módulo deja listo para los avisos

- Una sola función calcula el estado y los días que faltan, con un único valor de 30 días para "por vencer". Los avisos la reutilizan en vez de repetir el cálculo.
- La misma función de "hoy en hora de Chile" (SIM-09) sirve para las pantallas y para el proceso diario de avisos.
- Los documentos de dueños inactivos quedan excluidos con el mismo filtro que usa el listado general.

---

## 4. Comportamiento de las pantallas

- **Menú:** se agrega "Documentos" junto a "Vehículos" y "Conductores".
- **Listado general:** ordenado por fecha de vencimiento, del más próximo (o más vencido) al más lejano. Columnas: tipo, a quién pertenece (patente o nombre, con enlace a su ficha), vence (fecha) y estado. En el celular se ve como tarjetas. Filtros: estado (todos, vencidos, por vencer, vigentes), tipo e "Incluir inactivos". Mensaje cuando no hay documentos: "Aún no tienes documentos registrados" y botón para registrar.
- **Ficha del vehículo y del conductor:** una sección "Documentos" con los documentos de ese dueño y el botón "Agregar documento", que abre el formulario con el dueño ya elegido. Si el dueño está inactivo, el botón no aparece.
- **Registro y edición:** se elige el tipo; según el tipo, el formulario pide un vehículo o un conductor (solo los activos de la empresa). El error se muestra junto a cada campo. Después de guardar, vuelve a la pantalla de origen (el listado o la ficha) con un mensaje de confirmación.
- **Validación en dos lugares:** en el formulario (para ayudar al usuario) y en el servidor con **Zod** (la que protege los datos).
- **Permisos:** los mismos de JOA-01 (sección 2.4), cambiando "vehículo" por "documento". Un documento de otra empresa responde **404**.

Mensajes:

| Caso | Mensaje |
|---|---|
| Tipo vacío | "Selecciona el tipo de documento." |
| Vehículo vacío (tipo de vehículo) | "Selecciona el vehículo al que pertenece el documento." |
| Conductor vacío (licencia) | "Selecciona el conductor al que pertenece la licencia." |
| "Otro" sin dueño | "Indica si el documento es de un vehículo o de un conductor." |
| Tipo que no corresponde al dueño | "Ese tipo de documento no corresponde a un conductor." / "…a un vehículo." |
| Dueño inactivo | "No puedes agregar documentos a un vehículo inactivo. Reactívalo primero." (o "…a un conductor inactivo…") |
| Descripción vacía con tipo "otro" | "Describe el documento (entre 2 y 100 caracteres)." |
| Fecha vacía o inválida | "Ingresa la fecha de vencimiento (DD-MM-AAAA)." |
| Fecha fuera de rango | "La fecha debe estar entre 01-12-2021 y 01-12-2036." (con las fechas calculadas desde hoy) |
| Documento repetido | "El vehículo BBCD-12 ya tiene un SOAP registrado. Edítalo para renovarlo." / "Pedro Soto ya tiene una licencia de conducir registrada. Edítala para renovarla." |
| Guardado | "Documento registrado correctamente." / "Los cambios del documento se guardaron." |
| Error del servidor | "No pudimos guardar el documento. Intenta nuevamente." (sin detalles técnicos) |

---

## 5. Ejemplos de datos

Supuestos: hoy es **01-12-2026** en hora de Chile; la empresa tiene el vehículo `BBCD-12` y el conductor Pedro Soto (`11.111.111-1`), los dos activos, y el vehículo `XY-4321` inactivo. `BBCD-12` ya tiene un SOAP registrado.

### 5.1 Válidos y su estado

| Tipo | Dueño | Vence | Estado |
|---|---|---|---|
| Revisión técnica | BBCD-12 | 15-06-2027 | Vigente |
| Permiso de circulación | BBCD-12 | 31-12-2026 | Por vencer · Vence en 30 días |
| Licencia de conducir (descripción "Clase A3") | Pedro Soto | 01-12-2026 | Por vencer · Vence hoy |
| Otro: "Seguro de pasajeros" | BBCD-12 | 30-11-2026 | Vencido · Venció ayer |
| Otro: "Curso de primeros auxilios" | Pedro Soto | 01-01-2027 | Vigente (faltan 31 días) |

### 5.2 Inválidos

| Dato | Motivo |
|---|---|
| SOAP de Pedro Soto | El SOAP es de un vehículo. |
| Licencia de conducir de BBCD-12 | La licencia es de un conductor. |
| Segundo SOAP de BBCD-12 | Ya tiene uno: se edita para renovarlo. |
| Cualquier documento nuevo de XY-4321 | El vehículo está inactivo. |
| Tipo "otro" sin descripción | La descripción es obligatoria para "otro". |
| Fecha vacía o `31-02-2027` | Obligatoria y debe existir. |
| Fecha `01-12-2062` o `01-12-2015` | Fuera del rango permitido. |
| Vehículo y conductor a la vez | Un documento tiene un solo dueño. |
| Vehículo de otra empresa (por id en una solicitud) | Responde "no encontrado" y no se guarda nada. |
| `empresa_id` enviado en el formulario | Se ignora: el servidor usa el de la sesión. |

---

## 6. Criterios de aceptación

Base para las pruebas del módulo (SIM-04, casos CP-FUN-23 a CP-FUN-25) y para la demostración. Se prueban con las dos empresas ficticias y con fechas cercanas a hoy.

**Registro**

1. Registrar un documento válido de un vehículo y otro de un conductor los guarda, y siguen apareciendo después de recargar.
2. Un tipo que no corresponde al dueño, un dueño vacío o un dueño inactivo muestran su error y no se guarda nada.
3. Un segundo documento del mismo tipo para el mismo dueño (salvo "otro") muestra el mensaje para editarlo y no crea nada.
4. Una fecha vacía, inexistente o fuera de rango muestra su error; una fecha pasada dentro del rango se acepta y queda "vencido".

**Estado**

5. Un documento que vence en más de 30 días se ve "Vigente"; en 30 días o menos, "Por vencer" con los días que faltan; el día del vencimiento, "Vence hoy"; al día siguiente, "Vencido".
6. El estado usa la fecha de Chile: a las 23:30 de Chile un documento que vence ese día sigue en "Vence hoy".

**Listados**

7. El listado general muestra los documentos de la empresa ordenados por vencimiento, y los filtros por estado y tipo funcionan.
8. Los documentos de vehículos y conductores inactivos no aparecen por defecto; con "Incluir inactivos", sí.
9. La ficha de un vehículo y la de un conductor muestran sus documentos, y "Agregar documento" abre el formulario con ese dueño elegido.
10. Si la empresa no tiene documentos, aparece el mensaje y el botón para registrar.

**Renovar y corregir**

11. Editar la fecha de un documento vencido a una fecha futura lo deja "Vigente" o "Por vencer" según corresponda, y el cambio persiste.
12. Cambiar el dueño a otro vehículo (o a otro conductor) funciona; cambiarlo de un vehículo a un conductor no.

**Separación entre empresas**

13. El usuario de A no ve documentos de B en el listado ni en las fichas.
14. Abrir o editar un documento de B por su id, o registrar un documento para un vehículo o conductor de B, responde "no encontrado" y los datos de B no cambian.

**Adaptabilidad**

15. Listado, registro y edición se pueden usar en un celular (360 px) sin desplazamiento horizontal, y el menú con "Documentos" cabe sin desbordarse.

---

## 7. Checklist de JOA-10

- [x] Alcance y exclusiones del módulo (sección 1).
- [x] Cierra los [POR CONFIRMAR] de PB-11 a PB-13 y de la tabla `documento` de JOS-04 (sección 2).
- [x] Tipos y dueño, estado, regla del día del vencimiento y zona horaria (sección 3).
- [x] Comportamiento de las pantallas y mensajes (sección 4).
- [x] Ejemplos de datos válidos e inválidos (sección 5).
- [x] Criterios de aceptación numerados para las pruebas (sección 6).
- [ ] Revisión y aprobación de José y Simón en el PR.
