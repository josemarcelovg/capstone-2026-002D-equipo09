# JOA-09 · Campos y reglas del módulo de conductores

| | |
|---|---|
| **Tarea** | [JOA-09] Definir campos y reglas del módulo de conductores |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (modelo de datos y lógica) y Simón Jofré (pruebas) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 27-10-2026 |

Este documento fija las reglas de los ítems **PB-08**, **PB-09** y **PB-10** del [Product Backlog](JOA-08_Product_Backlog.md), como pide su sección 8 antes de desarrollar cada módulo. Cierra los **[POR CONFIRMAR]** de esos ítems y de la tabla `conductor` del [modelo de datos](JOS-04_Modelo_de_Datos.md) (secciones 3.4 y 6). Sigue el mismo formato que [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md), y todo lo que no se dice aquí funciona igual que en vehículos.

Las decisiones de la sección 2 son la propuesta del Product Owner; quedan firmes cuando José y Simón aprueban el PR.

---

## 1. Alcance

> Registrar, listar, buscar, editar, desactivar y reactivar los conductores de la empresa, sin que una empresa pueda ver o modificar los de otra.

Incluye:

- Registrar un conductor.
- Listar los conductores de la empresa, con búsqueda por nombre o RUT.
- Ver el detalle y editar un conductor.
- Desactivar y reactivar un conductor (no se elimina).
- Separación de datos entre empresas, con las mismas reglas de JOA-01 (sección 2.4).
- Uso desde computador y celular.

Fuera de este módulo:

- **El conductor no es una cuenta:** no inicia sesión (JOA-01, sección 2.1).
- **La licencia de conducir es un documento**, no un campo del conductor. Su clase y su vencimiento se registran en el módulo de documentos (PB-11 a PB-13), que se define en JOA-10.
- Asignar conductores a turnos (PB-17 a PB-19).
- Datos que no se necesitan para operar: dirección, fecha de nacimiento, foto, previsión, salud, etc. Ver la sección 2.

---

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Campos obligatorios (PB-08) | Nombre, RUT y teléfono. El correo es opcional. | Es lo mínimo para identificar y ubicar a un conductor. La Ley 21.719 de protección de datos personales, que rige desde diciembre de 2026, pide no guardar más datos de los necesarios. |
| RUT único (PB-08) | Único dentro de la empresa, **incluidos los inactivos**, igual que la patente. Otra empresa sí puede registrar el mismo RUT. | Un conductor puede trabajar para dos empresas. Si el RUT ya está en un conductor inactivo, lo que corresponde es reactivarlo y no crear otro. |
| Búsqueda (PB-09) | Un solo cuadro que busca por nombre o por RUT. | Es lo que el responsable tiene a mano. |
| Eliminar (PB-10) | **No existe eliminar.** Se desactiva y se puede reactivar. | Igual que los vehículos: se conserva el historial de turnos y documentos. |
| Estado | Activo o inactivo. No hay un tercer estado. | En los conductores no existe un caso como "en mantención". |
| Nombre | Un solo campo con el nombre completo. | Separar nombres y apellidos no aporta nada al MVP y complica los formularios. |
| Búsqueda sin acentos | No: "munoz" no encuentra "Muñoz". | Es una limitación aceptada para el MVP; las flotas son pequeñas y se ven completas en el listado. |
| Paginación | No en el MVP. | Igual que en vehículos (JOA-01, sección 4). |

---

## 3. Conductor: campos y formatos

| Campo | Tipo | Obligatorio | Formato / regla |
|---|---|---|---|
| `id` | uuid | Sí | Generado por el sistema. |
| `empresa_id` | uuid → Empresa | Sí | Asignado por el servidor desde la sesión, nunca desde el formulario. |
| `nombre` | texto (2–100) | Sí | Nombre completo. Se quitan los espacios del inicio y del final, y los espacios repetidos quedan en uno. |
| `rut` | texto | Sí | RUT chileno con dígito verificador válido (ver 3.1). Se guarda normalizado. **Único dentro de la empresa.** |
| `telefono` | texto | Sí | Teléfono chileno (ver 3.2). Se guarda normalizado. |
| `email` | email (máx. 254) | No | Correo de contacto. Se guarda en minúsculas. No se usa para avisos: los avisos van al correo de la empresa. |
| `activo` | sí / no | Sí | `sí` por defecto. |
| `created_at`, `updated_at` | fecha y hora | Sí | Automáticos. |

### 3.1 RUT

- **Normalización antes de validar y guardar:** quitar puntos, espacios y guion, pasar la `k` a mayúscula y volver a poner el guion antes del dígito verificador. Ej.: `11.111.111-1` → `11111111-1`; `1000005-k` → `1000005-K`.
- **Formato aceptado** después de normalizar: de 7 a 8 dígitos, guion y un dígito verificador (`0` a `9` o `K`). Expresión regular: `^[0-9]{7,8}-[0-9K]$`.
- **Dígito verificador:** se calcula con el módulo 11. Si no coincide, se rechaza.
- **Visualización:** con puntos (`11.111.111-1`), pero se guarda sin ellos.
- El RUT **se puede editar**: se vuelve a validar el formato, el dígito verificador y la unicidad.
- La misma validación se reutilizará para el RUT de la empresa (PB-14).

### 3.2 Teléfono

- **Normalización:** quitar espacios, guiones, puntos y paréntesis, y el `+56` o `56` del inicio si está.
- **Formato aceptado** después de normalizar: 9 dígitos (celular `9XXXXXXXX` o fijo, por ejemplo `2XXXXXXXX`).
- **Se guarda** como `+56` seguido de los 9 dígitos. Ej.: `9 1234 5678` → `+56912345678`.
- **Visualización:** `+56 9 1234 5678`.

### 3.3 Estados

| Estado | Significado | ¿Aparece en el listado por defecto? |
|---|---|---|
| Activo | Trabaja en la empresa. | Sí |
| Inactivo | Ya no trabaja en la empresa. | No (se ve con el filtro "Incluir inactivos") |

- Un conductor inactivo **se puede reactivar**.
- Un conductor inactivo **no se puede asignar a turnos nuevos** (PB-10, criterio 2) y sus documentos **no generan avisos** (se detalla en JOA-10).

---

## 4. Comportamiento de las pantallas

- **Menú:** se agrega "Conductores" junto a "Vehículos".
- **Listado:** ordenado por nombre. Columnas: nombre, RUT, teléfono y estado. En el celular se ve como tarjetas, igual que vehículos. Mensaje cuando no hay conductores: "Aún no tienes conductores registrados" y botón para registrar.
- **Búsqueda:** un cuadro "Buscar por nombre o RUT". Por nombre, encuentra el texto en cualquier parte y sin importar mayúsculas. Por RUT, se ignoran los puntos y el guion de lo escrito.
- **Registro y edición:** mismos campos y validaciones. El error se muestra junto a cada campo. Después de guardar, vuelve al listado con un mensaje de confirmación.
- **Desactivar:** pide confirmación ("¿Desactivar a Juan Pérez? Dejará de aparecer en el listado").
- **Validación en dos lugares:** en el formulario (para ayudar al usuario) y en el servidor con **Zod** (la que protege los datos).
- **Permisos:** los mismos de JOA-01 (sección 2.4), cambiando "vehículo" por "conductor". Un conductor de otra empresa responde **404**.

Mensajes:

| Caso | Mensaje |
|---|---|
| Nombre vacío | "Ingresa el nombre del conductor." |
| Nombre muy corto o muy largo | "El nombre debe tener entre 2 y 100 caracteres." |
| RUT vacío | "Ingresa el RUT del conductor." |
| RUT con formato inválido | "El RUT debe tener el formato 12345678-9." |
| Dígito verificador incorrecto | "El RUT no es válido. Revisa el dígito verificador." |
| RUT duplicado (conductor activo) | "Ya tienes un conductor registrado con el RUT 11.111.111-1." |
| RUT duplicado (conductor inactivo) | "Ya tienes un conductor inactivo con el RUT 11.111.111-1. Búscalo con «Incluir inactivos» y reactívalo." |
| Teléfono vacío | "Ingresa el teléfono del conductor." |
| Teléfono inválido | "El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678." |
| Correo inválido | "Ingresa un correo válido o deja el campo vacío." |
| Guardado | "Conductor registrado correctamente." / "Los cambios del conductor se guardaron." |
| Desactivado / reactivado | "Conductor desactivado." / "Conductor reactivado." |
| Error del servidor | "No pudimos guardar el conductor. Intenta nuevamente." (sin detalles técnicos) |

---

## 5. Ejemplos de datos

Los RUT de los ejemplos y de los datos de prueba son de dígitos repetidos o claramente ficticios, para no subir el RUT de una persona real (Definition of Done). Supuesto: la empresa ya tiene registrado `11111111-1`.

### 5.1 Válidos

| Dato ingresado | Se guarda como | Nota |
|---|---|---|
| Nombre `  Juan   Pérez ` | `Juan Pérez` | Espacios normalizados. |
| RUT `22.222.222-2` | `22222222-2` | Con puntos y guion. |
| RUT `1000005k` | `1000005-K` | 7 dígitos, sin guion y con `k` minúscula. |
| RUT `1000013-0` | `1000013-0` | Dígito verificador 0. |
| RUT `11.111.111-1` *(en otra empresa)* | `11111111-1` | El mismo RUT en otra empresa es válido. |
| Teléfono `+56 9 1234 5678` | `+56912345678` | |
| Teléfono `912345678` | `+56912345678` | Sin código de país. |
| Teléfono `(2) 2345 6789` | `+56223456789` | Fijo de Santiago. |
| Correo vacío | *(sin correo)* | Es opcional. |
| Correo `Juan.Perez@Correo.CL` | `juan.perez@correo.cl` | Se guarda en minúsculas. |

### 5.2 Inválidos

| Dato | Motivo |
|---|---|
| Nombre vacío o `J` | Obligatorio; mínimo 2 caracteres. |
| RUT vacío | Obligatorio. |
| RUT `11111111-2` | Dígito verificador incorrecto. |
| RUT `123456-7` o `123456789-0` | Menos de 7 o más de 8 dígitos. |
| RUT `11111111-X` o `abc` | Formato inválido. |
| RUT `11.111.111-1` en la misma empresa | Duplicado dentro de la empresa, aunque el otro esté inactivo. |
| Teléfono vacío | Obligatorio. |
| Teléfono `1234` o `+56 9 1234 56789` | No tiene 9 dígitos. |
| Correo `juan@` | Formato inválido. |
| `empresa_id` enviado en el formulario | Se ignora: el servidor usa el de la sesión. |
| `activo` enviado en el formulario de registro | Se ignora: un conductor nuevo siempre parte activo. |

---

## 6. Criterios de aceptación

Base para las pruebas del módulo (SIM-04, casos CP-FUN-20 a CP-FUN-22) y para la demostración. Se prueban con las dos empresas ficticias.

**Conductores** (Empresa A)

1. Registrar un conductor válido lo guarda, y sigue apareciendo después de recargar la página.
2. El RUT y el teléfono se guardan normalizados (`22.222.222-2` → `22222222-2`; `9 1234 5678` → `+56912345678`).
3. Un RUT con el dígito verificador incorrecto muestra su error y no se guarda.
4. Registrar un RUT que ya existe en la empresa muestra el mensaje de duplicado y no crea nada. Si el existente está inactivo, el mensaje indica que se puede reactivar.
5. Los campos obligatorios vacíos o fuera de formato muestran su error y no se guardan.
6. El listado muestra solo los conductores activos, ordenados por nombre; la búsqueda encuentra por parte del nombre y por RUT, con o sin puntos.
7. Si la empresa no tiene conductores, aparece el mensaje y el botón para registrar.
8. Editar un conductor actualiza sus datos, y el cambio persiste al recargar.
9. Desactivar un conductor pide confirmación y lo saca del listado por defecto; con "Incluir inactivos" vuelve a aparecer y se puede reactivar.

**Separación entre empresas**

10. El usuario de A no ve en su listado ni en la búsqueda los conductores de B.
11. Si el usuario de A abre, edita o desactiva un conductor de B escribiendo su `id` directamente (en la URL o en una solicitud), recibe "no encontrado" y los datos de B no cambian.
12. Ambas empresas pueden tener un conductor con el mismo RUT sin conflicto.

**Acceso y adaptabilidad**

13. Sin sesión, las páginas de conductores redirigen al inicio de sesión.
14. Listado, registro y edición se pueden usar en computador y en un celular (360 px) sin desplazamiento horizontal, y el menú con "Conductores" cabe sin desbordarse.

---

## 7. Checklist de JOA-09

- [x] Alcance y exclusiones del módulo (sección 1).
- [x] Cierra los [POR CONFIRMAR] de PB-08 a PB-10 y de la tabla `conductor` de JOS-04 (sección 2).
- [x] Campos, obligatoriedad, formatos de RUT y teléfono, estados y regla de duplicados (sección 3).
- [x] Comportamiento de las pantallas y mensajes exactos (sección 4).
- [x] Ejemplos de datos válidos e inválidos con RUT ficticios (sección 5).
- [x] Criterios de aceptación numerados para las pruebas (sección 6).
- [ ] Revisión y aprobación de José y Simón en el PR.
