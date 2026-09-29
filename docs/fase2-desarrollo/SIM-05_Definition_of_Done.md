# SIM-05 · Definition of Done

| | |
|---|---|
| **Tarea** | [SIM-05] Definir y aprobar la Definition of Done |
| **Responsable** | Simón Jofré (Scrum Master) |
| **Aprobación** | Joaquín Orellana, José Vargas y Simón Jofré |
| **Estado** | Propuesta para aprobación del equipo |
| **Fecha** | 29-09-2026 |

## 1. Para qué sirve

La Definition of Done (DoD) es la lista de condiciones que debe cumplir **cualquier tarea** para pasar a **Done** en el tablero. Así los tres entendemos lo mismo por "terminado" y no damos por listo algo que todavía no funciona, no se probó o no se revisó.

Se diferencia de los **criterios de aceptación**: esos son propios de cada tarea (lo que esa tarea debe hacer). La DoD es común a todas (cómo se entrega).

Una tarea está terminada cuando cumple **sus criterios de aceptación y esta DoD**.

---

## 2. Condiciones para todas las tareas

- [ ] Cumple todos los criterios de aceptación de la tarea en el Project.
- [ ] Se trabajó en una rama propia creada desde `main` actualizado (por ejemplo `sim-05-definition-of-done`).
- [ ] Tiene un pull request con una descripción de qué se hizo y cómo revisarlo.
- [ ] Otro integrante revisó el PR y dejó **Approve** registrado en GitHub antes del merge.
- [ ] Los comentarios de la revisión se resolvieron o se acordó dejarlos para otra tarea.
- [ ] El PR se unió a `main` y la rama se borró.
- [ ] No se suben contraseñas, claves, archivos `.env` ni datos personales reales.
- [ ] La tarea se movió a **Done** en el Project.

---

## 3. Condiciones adicionales según el tipo de tarea

### 3.1 Código

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Funciona al probarlo en local con `npm run dev`.
- [ ] Los datos que se guardan siguen ahí después de recargar la página (cuando aplica).
- [ ] Las entradas del usuario se validan en el servidor (Zod), no solo en el formulario.
- [ ] Se respeta la separación entre empresas: un usuario no puede ver ni modificar datos de otra empresa.
- [ ] Las pantallas se revisaron en computador y en celular (cuando aplica).
- [ ] El PR incluye evidencia: capturas o descripción de lo probado.
- [ ] Si cambió la instalación, la configuración o las variables de entorno, se actualizaron el README y `.env.example`.

### 3.2 Documentación

- [ ] Está en la carpeta correspondiente de `docs/` según la fase.
- [ ] El nombre del archivo sigue el formato `CODIGO_Nombre.md` (por ejemplo `JOA-04_Product_Vision.md`).
- [ ] Lo que no está decidido se marca como **[POR CONFIRMAR]**.
- [ ] No contradice decisiones ya tomadas (por ejemplo: avisos solo por correo, sin GPS).
- [ ] Se revisó la ortografía y que se vea bien en GitHub (tablas y listas).

### 3.3 Pruebas

- [ ] Cada caso tiene: pasos, resultado esperado y resultado obtenido.
- [ ] Los errores encontrados se registran con cómo reproducirlos.
- [ ] Las correcciones se vuelven a probar.
- [ ] La evidencia queda en `docs/fase2-desarrollo` sin datos personales reales.

---

## 4. Cómo se revisa un PR

1. Quien termina la tarea abre el PR y agrega como revisor a otro integrante.
2. El revisor lo revisa **idealmente el mismo día**, para no bloquear al resto.
3. En la pestaña **Files changed**, el revisor usa **Submit review** y elige:
   - **Approve**: cumple todo, se puede unir.
   - **Request changes**: falta algo; se explica qué en un comentario.
4. Si el PR es de código, el revisor lo prueba en su computador (`git fetch`, `git checkout nombre-de-la-rama`, `npm install`, `npm run dev`).
5. Recién con **Approve** se hace el merge.
6. Nadie aprueba su propio PR.

---

## 5. Done de la primera entrega

La primera entrega ("iniciar sesión y registrar, listar y editar vehículos con datos persistentes") está terminada cuando:

- [ ] Todas sus tareas (JOA-01, JOA-02, JOA-03, JOS-01, JOS-02, JOS-03, SIM-01, SIM-02, SIM-03) están en Done según esta DoD.
- [ ] Se cumplen los criterios de aceptación de la sección 7 de `JOA-01_Reglas_Modulo_Vehiculos.md`.
- [ ] Las pruebas de SIM-03 se ejecutaron con dos empresas ficticias y sin errores que bloqueen el flujo principal.
- [ ] Cualquier integrante puede clonar el repo, seguir el README y ejecutar la aplicación.
- [ ] Está preparada la demostración para la profesora.

---

## 6. Cambios a esta DoD

Si el equipo quiere agregar o quitar una condición, se propone en la reunión semanal o en un PR que modifique este archivo. El cambio se aplica desde que el PR se une, no hacia atrás.

---

## 7. Aprobación del equipo

| Integrante | Rol | Aprobado |
|---|---|---|
| Simón Jofré | Scrum Master | [ ] |
| Joaquín Orellana | Product Owner | [ ] |
| José Vargas | Developer | [ ] |

Simón la aprueba al abrir el PR como autor; Joaquín y José la aprueban dejando **Approve** en ese PR.
