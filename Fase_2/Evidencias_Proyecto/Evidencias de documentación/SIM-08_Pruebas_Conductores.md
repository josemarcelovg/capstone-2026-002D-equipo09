# SIM-08 · Pruebas del módulo de conductores

| | |
|---|---|
| **Tarea** | [SIM-08] Probar el módulo de conductores con dos empresas ficticias |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | Ejecutado: 14 de 14 criterios aprobados, con 2 observaciones menores |
| **Fecha** | 02-11-2026 (casos preparados el 29-10-2026) |

Este documento prueba el módulo de conductores (PB-08 a PB-10) con los 14 criterios de aceptación de [JOA-09](JOA-09_Reglas_Modulo_Conductores.md) (sección 6), con las dos empresas ficticias y con el mismo formato que [SIM-03](SIM-03_Pruebas_Primera_Entrega.md). Corresponde a los casos CP-FUN-20 a CP-FUN-22 y CP-INT-17 a CP-INT-22 del [plan de pruebas](SIM-04_Plan_de_Pruebas.md).

---

## 1. Resumen

| Grupo | Resultado |
|---|---|
| Conductores, criterios 1 a 9 (Empresa A) | ✅ 9 de 9 |
| Separación entre empresas, criterios 10 a 12 | ✅ 3 de 3 |
| Acceso y adaptabilidad, criterios 13 y 14 | ✅ 2 de 2 |
| Seguridad adicional (sección 4.4) | ✅ 3 de 3 |
| `npm test` | ✅ 55 de 55 |
| `npm run test:integracion` | ✅ 23 de 23, incluidos CP-INT-10 y CP-INT-17 a CP-INT-22 |

No se encontraron errores. Quedan 2 observaciones menores de textos de pantalla (sección 7).

---

## 2. Entorno y datos

| | |
|---|---|
| **Versión probada** | `main` en el commit `9978c9f` (incluye JOS-09, JOS-10 y las pantallas de conductores, PR #41 a #43), más las pruebas CP-INT-21 y CP-INT-22 de esta rama |
| **Fecha y hora** | 02-11-2026, entre las 22:08 y las 22:35 (hora de Chile) |
| **Dónde** | En local, con `npm run dev` desde `Evidencias_de_sistema/Aplicación`, Node.js 24.20 |
| **Base de datos e inicio de sesión** | Proyecto `micrologist-dev` en Supabase. La migración `20261027204333_conductores` está aplicada desde el 28-10-2026 a las 12:40 (`_prisma_migrations`) y `npx prisma migrate status` dice que el esquema está al día |
| **Navegador** | Chromium, en tamaño de computador y emulando un celular de 360 × 740 px |
| **Cuentas** | `admin.empresa.a@micrologist.cl` (Empresa A, "Transportes Cordillera") y `admin.empresa.b@micrologist.cl` (Empresa B, "Buses del Litoral"). Las contraseñas no se registran en este documento. |

**Datos:** no se cargó el seed. Antes de probar, las dos empresas tenían 0 conductores (consulta de solo lectura), lo que permitió probar el criterio 7. Las pruebas crearon sus propios conductores, todos ficticios y con nombre que empieza con "Prueba SIM-08":

| Empresa | Nombre | RUT | Para qué |
|---|---|---|---|
| A | Prueba SIM-08 Uno | 1.000.005-K | Criterios 1, 4, 6, 8 y 9 |
| A | Prueba SIM-08 Dos | 1.000.013-0 | Criterios 2 y 6; destino de las solicitudes alteradas del criterio 11 |
| A | Prueba SIM-08 Empresa | 55.555.555-5 | Sección 4.4 (se registró con `33.333.333-3` y después se cambió, ver sección 5) |
| B | Prueba SIM-08 B | 1.000.005-K | Criterios 10 a 12 |

Los conductores no se eliminan (JOA-09, sección 3.3): al terminar, los cuatro quedaron desactivados.

---

## 3. Pruebas automáticas

| Prueba | Resultado |
|---|---|
| `npm test` | ✅ 55 de 55, incluidas las de validación de conductores (`tests/conductores.test.ts`). |
| `npm run test:integracion` | ✅ 23 de 23, con la aplicación corriendo. CP-INT-10 confirma RLS en `conductor`; CP-INT-17 a CP-INT-20 se ejecutaron por primera vez contra Supabase; la última prueba confirma que no quedaron datos. |
| CP-INT-21 · páginas de conductores sin sesión | ✅ Las 6 direcciones responden 307 hacia `/login`. |
| CP-INT-22 · la API pública no lee `conductor` | ✅ Responde 200 sin filas. |

---

## 4. Casos de prueba

**Estados:** ✅ Aprobado · 🟡 Parcial · ❌ No aprobado.

### 4.1 Conductores (Empresa A)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **1** Registro válido | Registrar "Prueba SIM-08 Uno", RUT `1000005k`, teléfono `9 0000 0101`, sin correo. Recargar el listado. | Vuelve al listado con "Conductor registrado correctamente." y el conductor sigue ahí al recargar. | Vuelve con "Conductor registrado correctamente." y la tarjeta "Prueba SIM-08 Uno · Activo · 1.000.005-K · +56 9 0000 0101", que sigue al recargar. | ✅ |
| **2** Datos normalizados | Registrar "  Prueba   SIM-08 Dos ", RUT `1.000.013-0`, teléfono `+56 9 0000 0102` y correo `Prueba.SIM08@Correo.CL`. | Se guarda normalizado y se muestra con puntos y espacios. | En la base: `Prueba SIM-08 Dos`, `1000013-0`, `+56900000102` y `prueba.sim08@correo.cl`. En pantalla: `1.000.013-0` y `+56 9 0000 0102`. | ✅ |
| **3** Dígito verificador incorrecto | Registrar un conductor con RUT `11.111.111-2`. | Error del RUT y no se guarda. | "El RUT no es válido. Revisa el dígito verificador." junto al campo, con el cursor en "RUT". No se guardó nada. | ✅ |
| **4** RUT duplicado | a) Registrar otro conductor con `1.000.005-K` (Uno, activo). b) Repetirlo con Uno desactivado (criterio 9). | a) Mensaje de duplicado. b) Mensaje para reactivarlo. En ninguno se crea nada. | a) "Ya tienes un conductor registrado con el RUT 1.000.005-K." b) "Ya tienes un conductor inactivo con el RUT 1.000.005-K. Búscalo con «Incluir inactivos» y reactívalo." En la base sigue habiendo un solo `1000005-K` en la A. | ✅ |
| **5** Obligatorios y formatos | a) Enviar el formulario vacío. b) Nombre `J`, RUT `abc`, teléfono `1234` y correo `juan@`. | Un error por campo, con los mensajes de JOA-09; no se guarda nada y no se borra lo escrito. | a) "Ingresa el nombre del conductor.", "Ingresa el RUT del conductor." e "Ingresa el teléfono del conductor."; el cursor queda en "Nombre". b) Los cuatro errores de formato de JOA-09 (sección 4). Los campos conservan lo escrito y no se guardó nada. | ✅ |
| **6** Listado y búsqueda | Ver el listado y buscar `sim-08 d`, `EMPRESA`, `prueba   sim-08   uno`, `1.000.013-0`, `10000130`, `1000005k` y `9999`. | Solo activos, ordenados por nombre. Cada búsqueda encuentra al conductor que corresponde. | Listado: Dos, Empresa y Uno, en ese orden; con Uno desactivado, no aparece. Las búsquedas encuentran a Dos, Empresa, Uno, Dos, Dos y Uno; `9999` muestra "No hay conductores que coincidan con la búsqueda." | ✅ |
| **7** Sin conductores | Con la tabla vacía, abrir `/conductores` con la cuenta A. | "Aún no tienes conductores registrados" y el botón para registrar. | Aparecen el mensaje y el botón "Registrar conductor". | ✅ |
| **8** Edición | Abrir Uno, cambiar el teléfono a `9 0000 0111`, guardar y recargar la ficha. | Mensaje de guardado y el cambio sigue al recargar. | "Los cambios del conductor se guardaron." y, al recargar, el teléfono es `+56 9 0000 0111`. | ✅ |
| **9** Desactivar y reactivar | Desactivar Uno, ver el listado normal y con «Incluir inactivos», y reactivarlo. | Pide confirmación; sale del listado normal; aparece como Inactivo con «Incluir inactivos»; se puede reactivar. | La confirmación dice "¿Desactivar a Prueba SIM-08 Uno? Dejará de aparecer en el listado". Vuelve con "Conductor desactivado. Puedes verlo marcando «Incluir inactivos».", sin Uno en el listado normal; con el filtro aparece como Inactivo. "Reactivar conductor" lo deja Activo con "Conductor reactivado.". | ✅ |

### 4.2 Separación entre empresas

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **10** Cada empresa ve solo lo suyo | Con la cuenta B, ver el listado y buscar `Prueba` y `1.000.013-0`, con «Incluir inactivos». Con la cuenta A, buscar `SIM-08 B` y `1000005k` con «Incluir inactivos». | Ninguna ve conductores de la otra. | B: "Aún no tienes conductores registrados" en las tres consultas, aunque la A tenía 3. A: `SIM-08 B` no encuentra nada y `1000005k` solo encuentra a Uno, no al conductor de la B con el mismo RUT. | ✅ |
| **11** Abrir, editar o desactivar un conductor de otra empresa | a) Abrir por su dirección la ficha de un conductor de la otra empresa, desde B y desde A. b) Con la cuenta B, guardar una edición de "Prueba SIM-08 B" cambiando en la solicitud su id por el de "Prueba SIM-08 Dos" (A). c) Lo mismo con "Desactivar conductor". | "No encontrado", y los datos de la otra empresa no cambian. | a) 404 con la página "No encontrado", sin datos del conductor, en las dos direcciones. b) "No encontramos el conductor. Vuelve al listado." c) Vuelve al listado sin desactivar nada. En la base, Dos sigue con el mismo teléfono, activo y la misma hora de modificación (22:13:07); "Prueba SIM-08 B" tampoco cambió. | ✅ |
| **12** Mismo RUT en dos empresas | Con la cuenta B, registrar "Prueba SIM-08 B" con RUT `1000005-K` (que ya existe en la A). | Se registra sin conflicto. | "Conductor registrado correctamente."; en la base hay un `1000005-K` en cada empresa. | ✅ |

Las solicitudes de los casos 11 b y c se alteraron desde el navegador, reemplazando el id en el cuerpo de la solicitud antes de enviarla, igual que en SIM-03.

### 4.3 Acceso y adaptabilidad

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **13** Sin sesión | Sin iniciar sesión, abrir `/conductores`, `/conductores?inactivos=1`, `/conductores/nuevo` y dos fichas por su id. | Todas redirigen al inicio de sesión. | Las 5 direcciones redirigen a `/login`, que responde 200 sin datos de conductores. También lo comprueba CP-INT-21. | ✅ |
| **14** Celular de 360 px | Con la cuenta A, abrir el listado, el registro y la ficha con un ancho de 360 px. | Sin desplazamiento horizontal; el listado cambia a tarjetas y el menú cabe. | En las tres pantallas el ancho del documento es 360 px y ningún elemento se sale. El listado se ve como tarjetas y el menú muestra "MicroLogist", "Vehículos", "Conductores" y "Cerrar sesión" sin desbordarse. | ✅ |

### 4.4 Seguridad adicional (JOA-05)

| Requisito | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **RNF-SEG-04** Validación en el servidor | Con la cuenta A, completar el registro con datos válidos y cambiar la solicitud antes de enviarla: RUT `11111111-2` y teléfono `1234`. | El servidor rechaza los datos aunque el formulario los haya aceptado. | El servidor respondió con los errores de RUT y teléfono y no se guardó nada. | ✅ |
| **RNF-SEG-03** La empresa sale de la sesión | Con la cuenta A, registrar "Prueba SIM-08 Empresa" agregando al formulario `empresaId` y `empresa_id` con el id de la Empresa B. | El conductor queda en la Empresa A. | Quedó en la Empresa A. | ✅ |
| **JOA-09 5.2** `activo` en el registro | En el mismo registro, agregar `activo=false`. | Se ignora: el conductor nuevo queda activo. | Quedó activo. | ✅ |

---

## 5. Verificación en la base de datos

Consultas de solo lectura (transacción `read only`) antes, durante y después de los casos manuales. No se modificaron datos a mano.

```sql
select e.nombre as empresa, c.nombre, c.rut, c.telefono, c.email, c.activo, c.id, c.updated_at
from conductor c join empresa e on e.id = c.empresa_id
order by c.created_at;
```

| Momento | Resultado |
|---|---|
| Antes de las pruebas | 0 conductores en las dos empresas. |
| Después de los criterios 1, 2 y de la sección 4.4 | Datos normalizados como indica el criterio 2; "Prueba SIM-08 Empresa" en la Empresa A y activo; ningún registro de la prueba de RNF-SEG-04. |
| Antes y después del criterio 11 | "Prueba SIM-08 Dos" (A): `+56900000102`, activo, modificado a las 22:13:07, sin cambios. |
| Al terminar | Los 4 conductores "Prueba SIM-08" desactivados. |

"Prueba SIM-08 Empresa" se registró con `33.333.333-3`, que es el RUT de Luis Rojas en el seed de la Empresa A. Para que un `npm run db:seed` posterior no falle por RUT duplicado, al terminar se cambió desde la aplicación a `55.555.555-5`, que no usa el seed.

---

## 6. Relación con los requisitos

| Criterios | Casos de SIM-04 | Requisitos |
|---|---|---|
| 1 a 5 | CP-FUN-20, CP-INT-17, CP-INT-18 | PB-08, RNF-USA-03 |
| 6 a 8 | CP-FUN-21, CP-INT-20 | PB-09, RNF-DIS-02 |
| 9 | CP-FUN-22 | PB-10, RNF-USA-04 |
| 10 a 12 | CP-SEG-03, CP-SEG-04 y CP-SEG-05 para conductores, CP-INT-18, CP-INT-19 | RNF-SEG-02 |
| 13 | CP-SEG-01 para conductores, CP-INT-21 | RNF-SEG-01 |
| 14 | CP-COM-01 para conductores | RNF-COM-01 |
| Sección 4.4 | CP-SEG-06 y CP-SEG-07 para conductores | RNF-SEG-03, RNF-SEG-04 |
| — | CP-INT-10, CP-INT-22 | RNF-SEG-02 (RLS en `conductor`) |

---

## 7. Errores y observaciones

No se encontraron errores. Dos observaciones menores, que no bloquean ningún criterio:

| ID | Dónde | Observación | Sugerencia |
|---|---|---|---|
| OBS-01 | Página "No encontrado" | Al abrir un conductor de otra empresa, la página ofrece "Volver al listado de vehículos". Es la página general de la aplicación. | Un enlace a `/conductores` desde las páginas de conductores, o uno general a "Inicio". |
| OBS-02 | Listado de conductores | Si la empresa solo tiene conductores inactivos, el listado sin búsqueda dice "No hay conductores que coincidan con la búsqueda.", aunque no se buscó nada. JOA-09 no define este caso. | Un mensaje como "No tienes conductores activos. Marca «Incluir inactivos» para verlos". |

---

## 8. Checklist de SIM-08

- [x] Casos preparados para los 14 criterios de JOA-09 (sección 4).
- [x] CP-INT-17 a CP-INT-22 registrados en SIM-04 (sección 6.6).
- [x] Pruebas automáticas completas: 55 unitarias y 23 de integración (sección 3).
- [x] Casos manuales ejecutados con las dos empresas: 14 de 14 criterios y 3 de 3 casos de seguridad (sección 4).
- [x] Resultados confirmados en la base con consultas de solo lectura (sección 5).
- [ ] Revisión de José y Joaquín en el PR.
