# JOA-01 · Alcance, campos y reglas del módulo de vehículos

| | |
|---|---|
| **Tarea** | [JOA-01] Definir alcance, campos y reglas del módulo de vehículos |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (modelo de datos) y Simón Jofré (acceso y pruebas) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 24-09-2026 |

Este documento fija las reglas que necesitan **JOS-02** (modelo de datos), **JOS-03** (lógica de vehículos), **JOA-02** (interfaz), **SIM-02** (acceso) y **SIM-03** (pruebas). Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Alcance

### 1.1 Primera entrega

> Iniciar sesión y registrar, listar y editar vehículos con datos persistentes, sin que una empresa pueda ver o modificar los datos de otra.

Incluye:

- Inicio y cierre de sesión con cuentas de prueba.
- Registrar un vehículo.
- Listar los vehículos de la empresa, con búsqueda por patente y filtro por estado.
- Ver el detalle y editar un vehículo.
- Desactivar un vehículo cambiando su estado (no se elimina).
- Separación de datos entre empresas, comprobada con dos empresas ficticias.
- Uso desde computador y celular.

### 1.2 Alcance general del producto (entregas posteriores)

Siguen dentro del producto, aunque no sean parte de esta primera entrega:

- **Conductores**: datos y licencias.
- **Turnos**: asignación de vehículo y conductor por fecha y jornada.
- **Documentos**: revisión técnica, SOAP, permiso de circulación, licencias y otros, con su fecha de vencimiento.
- **Avisos de vencimiento por correo** (ver sección 5).
- **Ingresos**: módulo opcional según el tipo de empresa.

### 1.3 Limitaciones

- Plazo de 18 semanas y equipo de tres personas: el MVP debe ser acotado.
- Plataforma web adaptable; se necesita conexión a internet.
- Dependemos de servicios externos (Supabase, Vercel y el proveedor de correo) y de sus planes gratuitos o de bajo costo.
- En la primera entrega cada empresa tiene **un solo usuario**.

### 1.4 Fuera de alcance

- GPS, seguimiento de rutas en tiempo real, sensores o equipos instalados en los vehículos.
- Aplicación móvil nativa.
- Avisos por WhatsApp, SMS o notificaciones push: **el único canal es el correo**.
- Pagos, facturación y suscripciones.
- Integraciones con organismos externos (por ejemplo, consulta automática de revisión técnica).
- Inteligencia artificial y analítica avanzada (posible evolución futura).
- Adjuntar archivos de documentos en la primera entrega **[POR CONFIRMAR para el módulo de documentos]**.

---

## 2. Usuarios, empresa y permisos

### 2.1 Decisiones

| Decisión | Detalle |
|---|---|
| **1 usuario = 1 empresa** | Cada cuenta pertenece a una sola empresa y es su administrador. |
| **Existe la tabla Empresa** | Aunque hoy haya un usuario por empresa, los datos cuelgan de la empresa y no del usuario. Así, agregar más usuarios más adelante no obliga a rehacer el modelo. |
| **Rol inicial único: `admin`** | Los roles adicionales (por ejemplo, un operador que no puede desactivar) quedan para después. |
| **Conductores sin login** | En el MVP, un conductor es un registro, no una cuenta del sistema. |

### 2.2 Entidades para JOS-02

Nombres orientativos; José puede ajustarlos en el esquema Prisma manteniendo las reglas.

**Empresa**

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `id` | uuid | Sí | Generado por el sistema. |
| `nombre` | texto (2–100) | Sí | Nombre de fantasía o razón social. |
| `rut` | texto | No | Formato RUT chileno con dígito verificador. Único si se ingresa. **[POR CONFIRMAR]** si será obligatorio. |
| `email_contacto` | email | Sí | Correo que recibirá los avisos de vencimiento. |
| `telefono` | texto | No | Solo como dato de contacto; no se usa para avisos. |
| `created_at`, `updated_at` | fecha y hora | Sí | Automáticos. |

**Usuario (perfil)**

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `id` | uuid | Sí | El mismo `id` del usuario en Supabase Auth. |
| `empresa_id` | uuid → Empresa | Sí | Una sola empresa. |
| `nombre` | texto (2–100) | Sí | |
| `email` | email | Sí | Lo gestiona Supabase Auth. |
| `rol` | enum | Sí | Por ahora solo `admin`. |
| `created_at` | fecha y hora | Sí | Automático. |

La contraseña **no** se guarda en nuestras tablas: la maneja Supabase Auth.

### 2.3 Cómo se crean las cuentas en la primera entrega

Se usan **cuentas de prueba creadas por el equipo**: dos empresas ficticias con un usuario cada una. El registro público (que una empresa se inscriba sola) queda **[POR CONFIRMAR]** para una entrega posterior.

### 2.4 Permisos

| Acción | `admin` de la empresa | Usuario de otra empresa | Sin sesión |
|---|---|---|---|
| Listar vehículos | Solo los de su empresa | No ve nada de la otra | Redirige a login |
| Ver detalle | Sí | Responde **404** | Redirige a login |
| Registrar | Sí, siempre en su empresa | — | Redirige a login |
| Editar | Sí | Responde **404** | Redirige a login |
| Desactivar / reactivar | Sí | Responde **404** | Redirige a login |

Reglas obligatorias para **SIM-02** y **JOS-03**:

1. El `empresa_id` **nunca viene del formulario**: el servidor lo toma de la sesión del usuario.
2. Toda consulta de vehículos filtra por el `empresa_id` de la sesión, también cuando se busca por `id`.
3. Si alguien pide un vehículo de otra empresa, se responde **404 (no encontrado)** y no 403, para no revelar que existe.
4. La validación se hace **en el servidor**. Ocultar un botón en la interfaz no cuenta como control de acceso.
5. Al cerrar sesión no se puede seguir consultando ni modificando datos privados.

---

## 3. Vehículo: campos y formatos

| Campo | Tipo | Obligatorio | Formato / regla |
|---|---|---|---|
| `id` | uuid | Sí | Generado por el sistema. |
| `empresa_id` | uuid → Empresa | Sí | Asignado por el servidor desde la sesión. |
| `patente` | texto | Sí | Formato chileno (ver 3.1). Se guarda normalizada. **Única dentro de la empresa.** |
| `tipo` | enum | Sí | `bus`, `minibus`, `van`, `furgon`, `automovil`, `otro`. |
| `marca` | texto (2–50) | Sí | Ej.: Mercedes-Benz. |
| `modelo` | texto (1–50) | Sí | Ej.: Sprinter 515. |
| `anio` | entero | Sí | Entre 1980 y el año actual + 1. |
| `capacidad_pasajeros` | entero | Sí | Entre 1 y 100 asientos de pasajeros, sin contar al conductor. |
| `numero_interno` | texto (1–20) | No | Número de máquina que usa la empresa. |
| `color` | texto (máx. 30) | No | |
| `estado` | enum | Sí | `activo` (valor por defecto), `en_mantencion`, `inactivo`. |
| `observaciones` | texto (máx. 500) | No | |
| `created_at`, `updated_at` | fecha y hora | Sí | Automáticos. |

El vehículo **no** tiene columnas de revisión técnica, SOAP ni permiso de circulación. Esas fechas se manejarán en el módulo de **Documentos**, que servirá tanto para vehículos como para conductores.

### 3.1 Patente

- **Normalización antes de validar y guardar:** pasar a mayúsculas y quitar espacios, guiones y puntos. Ej.: `bb-cd 12` → `BBCD12`.
- **Formatos aceptados** (después de normalizar):
  - Formato actual: 4 letras + 2 números → `BBCD12`. Expresión regular: `^[A-Z]{4}[0-9]{2}$`
  - Formato antiguo: 2 letras + 4 números → `AB1234`. Expresión regular: `^[A-Z]{2}[0-9]{4}$`
- **Duplicados:** no puede haber dos vehículos con la misma patente en **la misma empresa**, incluidos los inactivos. En la base de datos se implementa como restricción única compuesta `(empresa_id, patente)`. Otra empresa sí puede registrar esa patente (por ejemplo, un vehículo vendido).
- **Visualización:** se puede mostrar con guion (`BBCD-12`), pero se guarda sin él.
- La patente **se puede editar**, pero se vuelve a validar el formato y la unicidad.

**[POR CONFIRMAR]:** restringir las letras del formato actual a las que usa el Registro Civil (sin vocales). Por ahora se aceptan todas las letras para no rechazar patentes válidas por error.

### 3.2 Estados

| Estado | Significado | ¿Aparece en el listado por defecto? |
|---|---|---|
| `activo` | Disponible para operar. | Sí |
| `en_mantencion` | En taller o fuera de servicio temporal. | Sí |
| `inactivo` | Dado de baja: vendido, retirado o sin uso. | No (se ve con el filtro "Incluir inactivos") |

- **No existe eliminar.** Para sacar un vehículo se cambia a `inactivo`. Así se conserva su historial (turnos y documentos futuros).
- Un vehículo `inactivo` se puede reactivar.
- **[POR CONFIRMAR para el módulo de avisos]:** los vehículos inactivos no deberían generar avisos de vencimiento.

---

## 4. Comportamiento de las pantallas (para JOA-02 y JOS-03)

- **Listado:** ordenado por patente. Columnas: patente, tipo, marca/modelo, año, número interno y estado. Búsqueda por patente y filtro por estado. Mensaje claro cuando no hay vehículos ("Aún no tienes vehículos registrados" y botón para registrar).
- **Registro y edición:** mismos campos y validaciones. Mostrar el error junto a cada campo. Después de guardar, volver al listado con un mensaje de confirmación.
- **Desactivar:** pedir confirmación ("¿Desactivar el vehículo BBCD-12? Dejará de aparecer en el listado").
- **Validación en dos lugares:** en el formulario (para ayudar al usuario) y en el servidor con **Zod** (la que realmente protege los datos).
- **Paginación:** no es necesaria en la primera entrega; las flotas objetivo son pequeñas. **[POR CONFIRMAR]** si se necesita después.

Mensajes sugeridos:

| Caso | Mensaje |
|---|---|
| Patente vacía | "Ingresa la patente del vehículo." |
| Patente con formato inválido | "La patente debe tener el formato BBCD12 o AB1234." |
| Patente duplicada | "Ya tienes un vehículo registrado con la patente BBCD-12." |
| Año fuera de rango | "El año debe estar entre 1980 y 2027." |
| Capacidad inválida | "La capacidad debe ser un número entre 1 y 100." |
| Error del servidor | "No pudimos guardar el vehículo. Intenta nuevamente." (sin mostrar detalles técnicos) |

---

## 5. Avisos de vencimiento

**Decisión confirmada:** los avisos de vencimiento se envían **exclusivamente por correo electrónico**. No se usará WhatsApp, SMS ni otro canal.

Este punto **no es parte de la primera entrega**. Se definirá junto con el módulo de documentos. Pendiente de acordar:

| Tema | Propuesta inicial | Estado |
|---|---|---|
| Destinatario | `email_contacto` de la empresa | **[POR CONFIRMAR]** |
| Anticipación | 30, 7 y 1 días antes, y el día en que vence | **[POR CONFIRMAR]** |
| Hora y zona horaria | Un envío diario en la mañana, hora de Chile (`America/Santiago`) | **[POR CONFIRMAR]** |
| Evitar duplicados | Registrar cada envío (documento + plazo) y no repetirlo | **[POR CONFIRMAR]** |
| Proveedor de correo | Por elegir (por ejemplo, Resend o SMTP) | **[POR CONFIRMAR]** |

---

## 6. Ejemplos de datos

Supuesto de los ejemplos: la empresa ya tiene registrado `BBCD12`.

### 6.1 Válidos

| Patente ingresada | Se guarda como | Tipo | Marca | Modelo | Año | Capacidad | Estado |
|---|---|---|---|---|---|---|---|
| `FGHJ-34` | `FGHJ34` | van | Mercedes-Benz | Sprinter 515 | 2021 | 19 | activo |
| `ab 1234` | `AB1234` | bus | Volvo | B290R | 2012 | 44 | en_mantencion |
| `KLPR56` | `KLPR56` | furgon | Hyundai | H-1 | 2019 | 11 | activo |
| `BBCD12` *(en otra empresa)* | `BBCD12` | minibus | Yutong | ZK6729 | 2018 | 25 | activo |

### 6.2 Inválidos

| Dato | Motivo |
|---|---|
| Patente vacía | Campo obligatorio. |
| Patente `ABC123` | No cumple ninguno de los dos formatos. |
| Patente `BBCD-12` en la misma empresa | Duplicada dentro de la empresa. |
| Año `1975` o `2030` | Fuera del rango permitido. |
| Capacidad `0`, `150` o `veinte` | Fuera de rango o no numérica. |
| Tipo `camion` | No pertenece a los valores permitidos. |
| Estado `eliminado` | No pertenece a los valores permitidos. |
| `empresa_id` enviado en el formulario | Se ignora: el servidor usa el de la sesión. |

---

## 7. Criterios de aceptación de la primera entrega

Base para las pruebas de **SIM-03** y la demostración de **JOA-03**.

**Acceso**

1. Con credenciales correctas, el usuario entra y ve el listado de vehículos de su empresa.
2. Con credenciales incorrectas aparece un mensaje genérico, sin indicar si falló el correo o la contraseña.
3. Sin sesión, cualquier página privada redirige al login.
4. Después de cerrar sesión, volver atrás en el navegador o llamar directamente a una operación privada no muestra ni modifica datos.

**Vehículos**

5. Registrar un vehículo válido lo guarda, y sigue apareciendo después de recargar la página.
6. Registrar una patente que ya existe en la empresa muestra el mensaje de duplicado y no crea nada.
7. La patente se guarda normalizada (`fghj-34` → `FGHJ34`).
8. Los campos obligatorios vacíos o fuera de formato muestran su error y no se guardan.
9. Editar un vehículo actualiza sus datos, y el cambio persiste al recargar.
10. Desactivar un vehículo lo saca del listado por defecto; con "Incluir inactivos" vuelve a aparecer y se puede reactivar.

**Separación entre empresas** (con Empresa A y Empresa B ficticias)

11. El usuario de A no ve en su listado los vehículos de B.
12. Si el usuario de A abre o edita un vehículo de B escribiendo su `id` directamente (en la URL o en una solicitud), recibe "no encontrado" y los datos de B no cambian.
13. Ambas empresas pueden tener la misma patente sin conflicto.

**Adaptabilidad**

14. Listado, registro y edición se pueden usar en computador y en un celular (ancho de 360 px) sin desplazamiento horizontal.

---

## 8. Checklist de JOA-01

- [x] Alcance, limitaciones y exclusiones del MVP documentados (sección 1).
- [x] Campos, obligatoriedad, formatos, estados y regla de patentes duplicadas (sección 3).
- [x] Permisos y relación usuario–empresa–vehículo (sección 2) — **pendiente la revisión de José y Simón en el PR**.
- [x] Avisos exclusivamente por correo; destinatarios y plazos pendientes (sección 5).
- [x] Conductores, turnos, documentos e ingresos opcionales se mantienen en el alcance general (sección 1.2).
- [x] Ejemplos de datos válidos e inválidos y criterios de aceptación (secciones 6 y 7).
