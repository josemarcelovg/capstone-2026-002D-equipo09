# JOA-03 · Validación de la primera entrega y guion de demostración

| | |
|---|---|
| **Tarea** | [JOA-03] Validar primera entrega y preparar demostración |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (vehículos y datos) y Simón Jofré (acceso y pruebas) |
| **Estado** | En curso: falta ensayar el guion completo y probar el README en otro computador |
| **Fecha** | 27-10-2026 (primera versión: 18-10-2026) |

Este documento sirve para dos cosas: comprobar que la primera entrega cumple lo acordado en la [sección 7 de JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) y en la [Definition of Done](SIM-05_Definition_of_Done.md) (sección 5), y guiar la demostración para la profesora. Lo marcado como **[POR CONFIRMAR]** todavía no es una decisión del equipo.

---

## 1. Qué se demuestra

> Iniciar sesión y registrar, listar y editar vehículos con datos persistentes, sin que una empresa pueda ver o modificar los datos de otra.

- **Duración:** 10 minutos de demostración y 5 de preguntas **[POR CONFIRMAR]** con la profesora.
- **Quién presenta:** Joaquín conduce el guion; José responde lo técnico de vehículos y datos; Simón, lo de acceso y pruebas **[POR CONFIRMAR]**.
- **Dónde:** en local, con la base de datos de desarrollo de Supabase y las cuentas de prueba de SIM-02. El inicio de sesión ya existe, pero el despliegue en Vercel todavía no está hecho ([JOS-06](JOS-06_Manual_Tecnico.md), sección 8.1).

---

## 2. Estado de las tareas de la primera entrega

Estado real al 27-10-2026. Las tareas son las de la sección 5 de la Definition of Done.

| Tarea | Responsable | Estado | Qué falta |
|---|---|---|---|
| JOA-01 · Reglas de vehículos | Joaquín | Terminada | — |
| JOA-02 · Interfaz de vehículos | Joaquín | En curso | Ya funciona con el inicio de sesión (probado en SIM-03). Falta confirmar sus criterios en el tablero. |
| JOA-03 · Validación y demostración | Joaquín | En curso | Este documento. Falta ensayar el guion completo. |
| JOS-01 · Proyecto Next.js | José | Terminada | — |
| JOS-02 · Supabase y Prisma | José | Terminada | — |
| JOS-03 · Lógica de vehículos | José | En curso | La empresa ya se toma de la sesión (SIM-02). Falta confirmar sus criterios en el tablero. |
| SIM-01 · Tablero y seguimiento | Simón | En curso | — |
| SIM-02 · Inicio de sesión | Simón | Terminada | PR #21 (19-10-2026). |
| SIM-03 · Pruebas | Simón | Terminada | PR #22 (21-10-2026): 14 de 14 criterios aprobados. Las dos observaciones menores se corrigieron en los PR #28 y #29; el PR #31 cierra el registro. |

---

## 3. Preparación

### 3.1 El día anterior

- [ ] Actualizar `main` y seguir el README: `npm install`, `npm run db:deploy`, `npm run db:seed` y `npm run db:comprobar`.
- [ ] `npm run build`, `npm run lint` y `npm test` terminan sin errores (Definition of Done, sección 3.1).
- [ ] `npm run dev` y abrir http://localhost:3000. Usar `localhost` y no la dirección "Network", que Next.js bloquea en modo desarrollo.
- [ ] Elegir la patente que se registrará en la demo (sección 3.3) y comprobar que no existe.
- [ ] Ensayar el guion completo con el equipo al menos una vez.

### 3.2 Datos de prueba

Son los del seed (`Aplicación/prisma/seed.ts`): dos empresas ficticias, sin datos personales reales.

| Empresa | `id` | Vehículos |
|---|---|---|
| **A** · Transportes Cordillera (ficticia) | `a0000000-0000-4000-8000-000000000001` | BBCD-12 (minibús, activo), FGHJ-34 (van, activo), HJKL-78 (bus, en mantención), XY-4321 (van, inactivo) |
| **B** · Buses del Litoral (ficticia) | `b0000000-0000-4000-8000-000000000002` | BBCD-12 (minibús, activo), AB-1234 (bus, en mantención), KLPR-56 (furgón, activo) |

`BBCD-12` está en las dos empresas a propósito (criterio 13).

### 3.3 Patente para registrar

Se usa `prdm-26`, escrita así para mostrar que se guarda como `PRDM26`. El seed no borra los vehículos creados en los ensayos y una patente no se puede repetir en la misma empresa, aunque esté inactiva. Por eso, en cada ensayo se cambia el número: `prdm-27`, `prdm-28`, etc.

### 3.4 Cuentas de prueba

Una cuenta por empresa, creada por el equipo en Supabase Auth y con su perfil en `usuario` ([SIM-02](SIM-02_Inicio_de_Sesion.md), secciones 5 y 6.3). Las contraseñas se comparten por un canal privado del equipo y no se escriben en el repositorio.

Para la demo, el `.env` debe tener `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; sin ellas la aplicación entra en modo desarrollo y no pide iniciar sesión (SIM-02, sección 3).

---

## 4. Guion de la demostración

Los números de la última columna son los criterios de la sección 7 de JOA-01.

### 4.1 Acceso

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 1 | Abrir http://localhost:3000/vehiculos sin sesión. | Redirige al inicio de sesión. | 3 |
| 2 | Entrar con la cuenta de la Empresa A y una contraseña incorrecta. | Mensaje genérico, sin decir si falló el correo o la contraseña. | 2 |
| 3 | Entrar con la contraseña correcta. | Listado de vehículos de la Empresa A. | 1 |

### 4.2 Vehículos (Empresa A)

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 4 | Mirar el listado. | BBCD-12, FGHJ-34 y HJKL-78, ordenados por patente, con tipo, marca y modelo, año, n.º interno y estado. XY-4321 no aparece porque está inactivo. | — |
| 5 | Buscar `hjkl`. Luego filtrar por "En mantención". Luego marcar "Incluir inactivos" y presionar "Limpiar". | Solo HJKL-78 en las dos primeras búsquedas; con inactivos aparece XY-4321. | 10 |
| 6 | "Registrar vehículo" y enviar el formulario vacío. | Un error junto a cada campo obligatorio; no se guarda nada. | 8 |
| 7 | Escribir año `2030` y capacidad `veinte`. | "El año debe estar entre 1980 y 2027." y "La capacidad debe ser un número entre 1 y 100." | 8 |
| 8 | Registrar la patente `bb-cd 12` con datos válidos. | "Ya tienes un vehículo registrado con la patente BBCD-12." No se crea nada. | 6 |
| 9 | Registrar `prdm-26`: van, Mercedes-Benz, Sprinter 515, 2022, 19 pasajeros. | Vuelve al listado con "Vehículo registrado correctamente." y aparece PRDM-26. | 5, 7 |
| 10 | Recargar la página (F5). | PRDM-26 sigue en el listado. | 5 |
| 11 | Abrir PRDM-26, cambiar la capacidad a 17 y el estado a "En mantención", y guardar. Recargar. | "Los cambios del vehículo se guardaron." y el cambio sigue después de recargar. | 9 |
| 12 | En PRDM-26, "Desactivar vehículo" y aceptar la confirmación. | Pregunta "¿Desactivar el vehículo PRDM-26? Dejará de aparecer en el listado". Luego, "Vehículo desactivado…" y ya no aparece. | 10 |
| 13 | Marcar "Incluir inactivos", abrir PRDM-26 y "Reactivar vehículo". | "Vehículo reactivado." y vuelve al listado por defecto. | 10 |

### 4.3 Separación entre empresas

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 14 | Abrir HJKL-78 y copiar su dirección (`/vehiculos/a1000000-0000-4000-8000-000000000002`). | — | — |
| 15 | Cerrar sesión. Luego volver atrás en el navegador y recargar. | No se muestran ni se modifican datos. | 4 |
| 16 | Iniciar sesión con la cuenta de la Empresa B. | BBCD-12, AB-1234 y KLPR-56. No aparece ningún vehículo de A, y BBCD-12 existe en ambas empresas. | 11, 13 |
| 17 | Pegar la dirección copiada en el paso 14. | "No encontrado". | 12 |

La segunda mitad del criterio 12 (editar un vehículo de otra empresa con una solicitud directa) no se muestra en la demo. La comprueban las pruebas de SIM-03.

### 4.4 Celular

| Paso | Qué se hace | Qué debe verse | Criterio |
|---|---|---|---|
| 18 | En las herramientas del navegador, vista de dispositivo a 360 px de ancho. Recorrer listado, registro y detalle. | El listado se ve como tarjetas y ninguna pantalla tiene desplazamiento horizontal. | 14 |

### 4.5 Cierre (1 minuto)

Mostrar lo que falta y los próximos pasos (sección 7.1).

---

## 5. Matriz de validación

Estado de cada criterio de la sección 7 de JOA-01 al 27-10-2026. Todos se probaron con sesión real y con las dos cuentas de prueba en [SIM-03](SIM-03_Pruebas_Primera_Entrega.md) (21-10-2026).

| # | Criterio (resumen) | Estado | Evidencia | Paso |
|---|---|---|---|---|
| 1 | Credenciales correctas: entra y ve su listado | Aprobado | SIM-03, caso 7.1 | 3 |
| 2 | Credenciales incorrectas: mensaje genérico | Aprobado | SIM-03, caso 7.2 | 2 |
| 3 | Sin sesión: redirige al inicio de sesión | Aprobado | SIM-03, caso 7.3 | 1 |
| 4 | Después de cerrar sesión no hay acceso a datos | Aprobado | SIM-03, caso 7.4 | 15 |
| 5 | Registrar un vehículo válido y que persista | Aprobado | SIM-03, caso 7.5 (antes, PR #12 sin sesión) | 9, 10 |
| 6 | Patente duplicada: mensaje y no crea nada | Aprobado | SIM-03, caso 7.6 | 8 |
| 7 | Patente normalizada | Aprobado | SIM-03, caso 7.7, y pruebas automáticas (`Aplicación/tests/vehiculos.test.ts`) | 9 |
| 8 | Campos inválidos muestran su error y no se guardan | Aprobado | SIM-03, caso 7.8, y pruebas automáticas | 6, 7 |
| 9 | Editar y que el cambio persista | Aprobado | SIM-03, caso 7.9 | 11 |
| 10 | Desactivar, ver con "Incluir inactivos" y reactivar | Aprobado | SIM-03, caso 7.10 | 5, 12, 13 |
| 11 | La Empresa A no ve los vehículos de la B | Aprobado | SIM-03, caso 7.11 | 16 |
| 12 | Un vehículo de otra empresa responde "no encontrado" | Aprobado | SIM-03, caso 7.12 (incluye la edición por solicitud directa) | 17 |
| 13 | La misma patente en dos empresas | Aprobado | SIM-03, caso 7.13, y seed | 16 |
| 14 | Computador y celular a 360 px | Aprobado | SIM-03, caso 7.14; PR #5 (JOA-02) y capturas en `Evidencias de sistema/Aplicación/Capturas` | 18 |

SIM-03 no encontró errores. Las pruebas se hicieron en local; falta repetir los casos principales en Vercel cuando exista el despliegue (SIM-03, sección 8).

---

## 6. Comprobaciones de esta tarea

### 6.1 Reglas de vehículos contra el código

Revisión hecha el 18-10-2026 sobre `main`. Las rutas son de `Fase 2/Evidencias Proyecto/Evidencias de sistema/Aplicación`, salvo la de `Base de datos`.

| Regla de JOA-01 | Dónde está | ¿Cumple? |
|---|---|---|
| Patente normalizada y formatos `BBCD12` o `AB1234` (3.1) | `src/lib/vehiculos.ts` | Sí |
| Patente única por empresa, incluidos los inactivos (3.1) | `@@unique([empresaId, patente])` en `Base de datos/schema.prisma` | Sí |
| Año entre 1980 y el año actual + 1; capacidad entre 1 y 100 (3) | `src/lib/vehiculos.ts` | Sí |
| Tipos y estados permitidos (3 y 3.2) | `src/lib/vehiculos.ts` | Sí |
| No existe eliminar; desactivar pide confirmación (3.2 y 4) | `src/app/vehiculos/acciones.ts` y `boton-activacion.tsx` | Sí |
| Inactivos fuera del listado por defecto (3.2) | `listarVehiculos` en `src/lib/vehiculos-datos.ts` | Sí |
| La empresa la pone el servidor y filtra todas las consultas; otra empresa responde 404 (2.4) | `src/lib/vehiculos-datos.ts`, `src/lib/sesion.ts` y `src/app/vehiculos/[id]/page.tsx` | Sí. Desde SIM-02 la empresa sale de la sesión; `EMPRESA_DESARROLLO_ID` solo se usa en modo desarrollo |
| Validación en el servidor con Zod (4) | `guardarVehiculo` en `src/app/vehiculos/acciones.ts` | Sí |
| Mensajes de la sección 4 | `src/lib/vehiculos.ts` y `src/app/vehiculos/acciones.ts` | Sí |

No se encontraron diferencias entre las reglas y el código.

### 6.2 Errores que bloqueen el flujo principal

No hay errores que bloqueen el flujo principal. SIM-03 aprobó los 14 criterios con sesión real y solo dejó dos observaciones menores de presentación (título de la pestaña en "No encontrado" y nombre de la empresa en el celular), que se corrigieron en los PR #28, #29 y #31.

### 6.3 README y ejecución reproducible

Se comprueba con RNF-DIS-05 de [JOA-05](JOA-05_Requisitos_No_Funcionales.md): otro integrante clona el repositorio en un computador distinto, sigue el README y anota cuánto tardó. La meta es menos de 15 minutos **[POR CONFIRMAR]**.

| Fecha | Quién | Computador | Tiempo | Resultado |
|---|---|---|---|---|
| Pendiente | | | | |

Observación del 18-10-2026: en Windows, clonar el repositorio dentro de una carpeta con una ruta muy larga falla con el error "Filename too long". El README ya recomienda usar una carpeta corta, como `C:\Proyectos`.

### 6.4 Tablero

Actualizado el 18-10-2026:

- JOS-06 pasó a terminada.
- Se marcaron los criterios cumplidos de JOA-02, JOA-04 a JOA-08, JOS-03 y JOS-06.
- Se corrigieron las rutas antiguas `docs/fase2-desarrollo` en las tarjetas JOA-01, JOS-03 y SIM-03.
- Se asignaron iteraciones. La Iteración 3 (19-10 al 01-11) queda con SIM-01, SIM-02, SIM-03, JOA-02, JOA-03 y JOS-03.

Las iteraciones quedan sujetas al acuerdo del equipo (SIM-01).

---

## 7. Pendientes

### 7.1 Para contar en la demostración

- El módulo de vehículos funciona con inicio de sesión real y datos persistentes separados por empresa (14 de 14 criterios aprobados en SIM-03).
- Falta el despliegue en Vercel.
- Próximos pasos: despliegue y el MVP completo, partiendo por conductores y documentos con vencimiento (PB-08 a PB-13) y después los avisos por correo.

### 7.2 Antes de dar por terminada la entrega

- ~~SIM-02 terminado y JOA-02 y JOS-03 integrados con la sesión.~~ Hecho (PR #21; integración comprobada en SIM-03). Falta marcar los criterios de JOA-02 y JOS-03 en el tablero.
- ~~Pruebas de SIM-03 ejecutadas con las dos empresas ficticias y sin errores que bloqueen el flujo.~~ Hecho (PR #22).
- Guion completo ensayado con el equipo, con inicio de sesión.
- README probado por otro integrante (sección 6.3).
- Decisiones **[POR CONFIRMAR]** que afectan esta entrega: duración de la sesión (RNF-SEG-06) y duración de los sprints. El largo mínimo de la contraseña quedó en 8 caracteres (SIM-02).
- Los PR #1, #5, #6, #7, #8, #9 y #14 se unieron sin un Approve registrado. Se regularizan con la revisión de José y Simón de los documentos correspondientes (Definition of Done, sección 2).

---

## 8. Checklist de JOA-03

- [x] Guion de la demostración y matriz de validación preparados (secciones 4 y 5).
- [x] Reglas del módulo de vehículos contrastadas con el código (sección 6.1).
- [x] Tablero actualizado según lo realmente terminado (sección 6.4).
- [ ] Demostración completa, con inicio de sesión, ensayada con el equipo.
- [x] Sin errores que bloqueen el flujo principal, según las pruebas de SIM-03.
- [ ] README probado por otro integrante en otro computador (sección 6.3).
- [ ] Revisión de José y Simón en el PR.
