# SIM-08 · Pruebas del módulo de conductores

| | |
|---|---|
| **Tarea** | [SIM-08] Probar el módulo de conductores con dos empresas ficticias |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Revisión** | José Vargas y Joaquín Orellana |
| **Estado** | En preparación: se ejecuta cuando la migración de conductores esté aplicada en Supabase |
| **Fecha** | 29-10-2026 |

Este documento prueba el módulo de conductores (PB-08 a PB-10) con los 14 criterios de aceptación de [JOA-09](JOA-09_Reglas_Modulo_Conductores.md) (sección 6), con las dos empresas ficticias y con el mismo formato que [SIM-03](SIM-03_Pruebas_Primera_Entrega.md). Corresponde a los casos CP-FUN-20 a CP-FUN-22 y CP-INT-17 a CP-INT-22 del [plan de pruebas](SIM-04_Plan_de_Pruebas.md). La columna "Resultado obtenido" se completa al ejecutar cada caso.

---

## 1. Estado al 29-10-2026

**Lo que ya está en `main`:**

- La tabla `conductor`, con su migración y los datos de prueba (JOS-09, PR #41).
- La validación y el acceso a datos (JOS-10, PR #42), con sus pruebas unitarias y CP-INT-17 a CP-INT-20.
- Las pantallas (PR #43): listado con búsqueda e «Incluir inactivos», registro, y ficha con edición, desactivar y reactivar.

**Lo que falta para ejecutar:** aplicar la migración en el proyecto `micrologist-dev`. `npx prisma migrate status` muestra pendiente `20261027204333_conductores`, así que hoy las pantallas de conductores no pueden consultar la tabla.

**Pruebas automáticas ya ejecutadas:**

| Prueba | Resultado |
|---|---|
| `npm test` | 55 de 55 aprobadas, incluidas las de validación de conductores (`tests/conductores.test.ts`). |
| CP-INT-21 · páginas de conductores sin sesión | ✅ 29-10-2026: las 6 direcciones responden 307 hacia `/login`. |
| CP-INT-22 · la API pública no lee `conductor` | 🟡 29-10-2026: respondió 404 porque la tabla todavía no existe en Supabase. Se repite con la migración aplicada. |

---

## 2. Entorno y datos

| | |
|---|---|
| **Versión probada** | Rama `main` con JOS-09, JOS-10 y las pantallas de conductores. Se anota el commit al ejecutar. |
| **Dónde** | En local, con `npm run dev` desde `Evidencias de sistema/Aplicación`, Node.js 24.20 |
| **Base de datos e inicio de sesión** | Proyecto `micrologist-dev` en Supabase, con la migración `conductores` aplicada |
| **Navegador** | Chromium, en tamaño de computador y emulando un celular de 360 × 740 px |
| **Cuentas** | `admin.empresa.a@micrologist.cl` (Empresa A) y `admin.empresa.b@micrologist.cl` (Empresa B). Las contraseñas no se registran en este documento. |

**Conductores del seed** (todos ficticios):

| Empresa | Nombre | RUT | Estado |
|---|---|---|---|
| A | Pedro Soto (ficticio) | 11.111.111-1 | Activo |
| A | María Muñoz (ficticia) | 22.222.222-2 | Activo |
| A | Luis Rojas (ficticio) | 33.333.333-3 | Inactivo |
| B | Pedro Soto (ficticio) | 11.111.111-1 | Activo |
| B | Ana Díaz (ficticia) | 44.444.444-4 | Activo |

**Datos que crean las pruebas:** conductores cuyo nombre empieza con "Prueba SIM-08", con los RUT ficticios de los ejemplos de JOA-09 (`1000005-K` y `1000013-0`). Los conductores no se eliminan (JOA-09, sección 3.3), así que al terminar quedan desactivados y se anotan en la sección 5.

---

## 3. Orden de ejecución

1. Avisar al equipo y aplicar la migración desde `main`: `npm run db:deploy`. Confirmar con `npx prisma migrate status`.
2. **Antes del seed**, con la tabla vacía, probar el criterio 7 (mensaje cuando no hay conductores).
3. Cargar los datos de prueba: `npm run db:seed`.
4. Ejecutar `npm test` y `npm run test:integracion` completo (con `npm run dev` corriendo), para cerrar CP-INT-10 y CP-INT-17 a CP-INT-22.
5. Ejecutar los casos manuales de la sección 4.
6. Confirmar los resultados con las consultas de solo lectura de la sección 5.

---

## 4. Casos de prueba

**Estados:** ✅ Aprobado · 🟡 Parcial · ❌ No aprobado · ⏳ Pendiente.

### 4.1 Conductores (Empresa A)

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **1** Registro válido | Registrar "Prueba SIM-08 Uno", RUT `1000005k`, teléfono `9 0000 0101`, sin correo. Recargar el listado. | Vuelve al listado con "Conductor registrado correctamente." y el conductor sigue ahí al recargar. | | ⏳ |
| **2** Datos normalizados | Registrar "  Prueba   SIM-08 Dos ", RUT `1.000.013-0`, teléfono `+56 9 0000 0102` y correo `Prueba.SIM08@Correo.CL`. | Se guarda como `Prueba SIM-08 Dos`, `1000013-0`, `+56900000102` y `prueba.sim08@correo.cl`; en pantalla, `1.000.013-0` y `+56 9 0000 0102`. | | ⏳ |
| **3** Dígito verificador incorrecto | Registrar un conductor con RUT `11.111.111-2`. | "El RUT no es válido. Revisa el dígito verificador." y no se guarda. | | ⏳ |
| **4** RUT duplicado | a) Registrar otro conductor con RUT `11.111.111-1` (Pedro Soto, activo). b) Con RUT `33.333.333-3` (Luis Rojas, inactivo). | a) "Ya tienes un conductor registrado con el RUT 11.111.111-1." b) "Ya tienes un conductor inactivo con el RUT 33.333.333-3. Búscalo con «Incluir inactivos» y reactívalo." En ninguno se crea nada. | | ⏳ |
| **5** Obligatorios y formatos | a) Enviar el formulario vacío. b) Nombre `J`, RUT `abc`, teléfono `1234` y correo `juan@`. | a) Errores de nombre, RUT y teléfono, con los mensajes de JOA-09 (sección 4). b) Un error por campo. No se guarda nada y no se borra lo escrito. | | ⏳ |
| **6** Listado y búsqueda | Ver el listado. Buscar `muñoz`, `MARÍA`, `22.222.222-2`, `222222222` y `1000005k`. | Solo activos, ordenados por nombre (no aparece Luis Rojas). Cada búsqueda encuentra al conductor que corresponde. | | ⏳ |
| **7** Sin conductores | Antes del seed (paso 2 de la sección 3), abrir `/conductores` con la cuenta A. | "Aún no tienes conductores registrados" y el botón para registrar. | | ⏳ |
| **8** Edición | Abrir "Prueba SIM-08 Uno", cambiar el teléfono a `9 0000 0111`, guardar y recargar la ficha. | "Los cambios del conductor se guardaron." y el cambio sigue al recargar. | | ⏳ |
| **9** Desactivar y reactivar | Desactivar "Prueba SIM-08 Uno" y aceptar. Ver el listado normal y con «Incluir inactivos». Reactivarlo. | Pide confirmación ("¿Desactivar a Prueba SIM-08 Uno? …"); sale del listado normal; aparece como Inactivo con «Incluir inactivos»; "Conductor reactivado." lo deja Activo. | | ⏳ |

### 4.2 Separación entre empresas

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **10** Cada empresa ve solo lo suyo | Con la cuenta A, ver el listado y buscar `Ana` y `44.444.444-4`. Con la cuenta B, buscar `María`, `22.222.222-2` y `Prueba`. Se hace antes del criterio 12. | A no encuentra a Ana Díaz; B no encuentra a María Muñoz ni a los conductores "Prueba SIM-08" de la A. | | ⏳ |
| **11** Abrir, editar o desactivar un conductor de otra empresa | Con la cuenta A: a) abrir la ficha de Ana Díaz (B) escribiendo su dirección; b) enviar una edición y c) una desactivación de "Prueba SIM-08 Uno" cambiando en la solicitud el id por el de Ana Díaz (herramientas del navegador). | a) 404 con "No encontrado". b) y c) No se modifica nada: en la base, Ana Díaz sigue igual (mismo estado y misma hora de modificación). | | ⏳ |
| **12** Mismo RUT en dos empresas | Con la cuenta B, registrar "Prueba SIM-08 B" con RUT `1000005-K` (que ya existe en la A). | Se registra sin conflicto; en la base hay un `1000005-K` en cada empresa. | | ⏳ |

### 4.3 Acceso y adaptabilidad

| Criterio | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **13** Sin sesión | Sin iniciar sesión, abrir `/conductores`, `/conductores/nuevo` y la ficha de un conductor de cada empresa. | Todas redirigen al inicio de sesión. Automatizado en CP-INT-21. | CP-INT-21 aprobado el 29-10-2026 (307 hacia `/login` en las 6 direcciones). Falta repetirlo en el navegador. | 🟡 |
| **14** Celular de 360 px | Con sesión iniciada, abrir el listado, el registro y la edición con un ancho de 360 px. | Se pueden usar sin desplazamiento horizontal; el listado cambia a tarjetas y el menú con "Conductores" cabe sin desbordarse. | | ⏳ |

### 4.4 Seguridad adicional (JOA-05)

| Requisito | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **RNF-SEG-04** Validación en el servidor | Con la cuenta A, completar el registro con datos válidos y cambiar la solicitud antes de enviarla: RUT `11111111-2` y teléfono `1234`. | El servidor rechaza los datos aunque el formulario los haya aceptado. | | ⏳ |
| **RNF-SEG-03** La empresa sale de la sesión | Con la cuenta A, registrar "Prueba SIM-08 Empresa" agregando `empresaId` y `empresa_id` con el id de la Empresa B. | El conductor queda en la Empresa A. | | ⏳ |
| **JOA-09 5.2** `activo` en el registro | Con la cuenta A, registrar "Prueba SIM-08 Activo" agregando `activo=false` a la solicitud. | Se ignora: el conductor nuevo queda activo. | | ⏳ |

---

## 5. Verificación en la base de datos

Consultas de solo lectura, antes y después de los casos manuales (hora de Chile). Nunca se modifican datos a mano.

```sql
-- Conductores creados por las pruebas
select empresa_id, nombre, rut, telefono, email, activo, updated_at
from conductor
where nombre like 'Prueba SIM-08%'
order by created_at;

-- Ningún RUT repetido dentro de una empresa (debe volver vacío)
select empresa_id, rut, count(*)
from conductor
group by empresa_id, rut
having count(*) > 1;

-- Ana Díaz (Empresa B) antes y después del criterio 11
select activo, telefono, updated_at
from conductor
where id = 'b2000000-0000-4000-8000-000000000002';
```

Al terminar se desactivan los conductores "Prueba SIM-08" y se anota aquí cuáles quedaron en la base.

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

Se completa al ejecutar. Cada error recibe su `ERR-nn` y se registra en la sección 9 de SIM-04, como pide su sección 8.

---

## 8. Checklist de SIM-08

- [x] Casos preparados para los 14 criterios de JOA-09 (sección 4).
- [x] CP-INT-17 a CP-INT-22 registrados en SIM-04 (sección 6.6).
- [x] CP-INT-21 y CP-INT-22 automatizados y ejecutados (sección 1).
- [ ] Migración aplicada en Supabase y pruebas automáticas completas.
- [ ] Casos manuales ejecutados con las dos empresas y confirmados en la base.
- [ ] Revisión de José y Joaquín en el PR.
