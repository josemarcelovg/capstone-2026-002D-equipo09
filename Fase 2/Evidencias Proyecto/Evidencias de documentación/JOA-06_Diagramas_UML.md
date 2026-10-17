# JOA-06 · Diagramas UML de MicroLogist

| | |
|---|---|
| **Tarea** | [JOA-06] Elaborar diagramas UML |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (modelo de datos) y Simón Jofré (acceso) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 12-10-2026 |

Este documento contiene el diagrama de casos de uso del MVP y los diagramas de secuencia de sus flujos principales. Se basa en las reglas de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md), en la [Product Vision](JOA-04_Product_Vision.md) y en el Product Backlog (JOA-08).

Los diagramas están escritos en [Mermaid](https://mermaid.js.org/), dentro de este mismo archivo. GitHub los dibuja al abrir el documento, y su código queda versionado junto con el resto del repositorio: para cambiar un diagrama se edita el texto y se revisa en un pull request, igual que cualquier otro cambio.

---

## 1. Diagrama de casos de uso

Muestra quién usa MicroLogist y qué puede hacer en el MVP.

```mermaid
flowchart LR
    resp["«actor»<br/>Responsable de la empresa"]
    tiempo["«actor»<br/>Tiempo<br/>(una vez al día)"]
    correo["«actor»<br/>Proveedor de correo"]

    subgraph sistema["MicroLogist (MVP)"]
        direction TB
        subgraph avisos["Avisos por correo"]
            uc16(["CU-16 Enviar avisos de vencimiento"])
        end
        subgraph turnos["Turnos"]
            uc13(["CU-13 Asignar turno"])
            uc14(["CU-14 Consultar turnos por fecha"])
            uc15(["CU-15 Editar o anular turno"])
        end
        subgraph documentos["Documentos"]
            uc10(["CU-10 Registrar documento con vencimiento"])
            uc11(["CU-11 Consultar documentos y su estado"])
            uc12(["CU-12 Renovar o corregir documento"])
        end
        subgraph conductores["Conductores"]
            uc07(["CU-07 Registrar conductor"])
            uc08(["CU-08 Consultar y editar conductores"])
            uc09(["CU-09 Desactivar o reactivar conductor"])
        end
        subgraph vehiculos["Vehículos"]
            uc03(["CU-03 Registrar vehículo"])
            uc04(["CU-04 Consultar y buscar vehículos"])
            uc05(["CU-05 Editar vehículo"])
            uc06(["CU-06 Desactivar o reactivar vehículo"])
        end
        subgraph acceso["Acceso"]
            uc01(["CU-01 Iniciar sesión"])
            uc02(["CU-02 Cerrar sesión"])
        end
    end

    resp --- uc01
    resp --- uc02
    resp --- uc03
    resp --- uc04
    resp --- uc05
    resp --- uc06
    resp --- uc07
    resp --- uc08
    resp --- uc09
    resp --- uc10
    resp --- uc11
    resp --- uc12
    resp --- uc13
    resp --- uc14
    resp --- uc15
    tiempo --- uc16
    uc16 --- correo
```

### 1.1 Actores

| Actor | Quién es | Qué hace |
|---|---|---|
| **Responsable de la empresa** | El dueño o encargado de una empresa de transporte. Es el único usuario del MVP, con rol `admin`. | Inicia sesión y gestiona los vehículos, conductores, documentos y turnos de su empresa. También recibe los correos de aviso. |
| **Tiempo** | No es una persona: representa que el sistema actúa solo, una vez al día. | Inicia el envío de avisos de vencimiento. |
| **Proveedor de correo** | Servicio externo que entrega los correos. Cuál se usará está **[POR CONFIRMAR]** (JOA-01, sección 5). | Recibe del sistema cada aviso y lo entrega al responsable. |

El **conductor no es un actor**: en el MVP es un registro dentro del sistema y no inicia sesión (JOA-01, sección 2.1).

### 1.2 Casos de uso

| ID | Caso de uso | Actor | Ítem del backlog | Etapa |
|---|---|---|---|---|
| CU-01 | Iniciar sesión | Responsable | PB-01 | Primera entrega |
| CU-02 | Cerrar sesión | Responsable | PB-02 | Primera entrega |
| CU-03 | Registrar vehículo | Responsable | PB-04 | Primera entrega |
| CU-04 | Consultar y buscar vehículos | Responsable | PB-05 | Primera entrega |
| CU-05 | Editar vehículo | Responsable | PB-06 | Primera entrega |
| CU-06 | Desactivar o reactivar vehículo | Responsable | PB-07 | Primera entrega |
| CU-07 | Registrar conductor | Responsable | PB-08 | MVP completo |
| CU-08 | Consultar y editar conductores | Responsable | PB-09 | MVP completo |
| CU-09 | Desactivar o reactivar conductor | Responsable | PB-10 | MVP completo |
| CU-10 | Registrar documento con vencimiento | Responsable | PB-11 | MVP completo |
| CU-11 | Consultar documentos y su estado | Responsable | PB-12 | MVP completo |
| CU-12 | Renovar o corregir documento | Responsable | PB-13 | MVP completo |
| CU-13 | Asignar turno | Responsable | PB-17 | MVP completo |
| CU-14 | Consultar turnos por fecha | Responsable | PB-18 | MVP completo |
| CU-15 | Editar o anular turno | Responsable | PB-19 | MVP completo |
| CU-16 | Enviar avisos de vencimiento | Tiempo y proveedor de correo | PB-15 y PB-16 | MVP completo |

### 1.3 Reglas que aplican a todos los casos de uso

- Todos los casos de uso del responsable, salvo CU-01, necesitan una sesión iniciada. Sin sesión, el sistema redirige al inicio de sesión.
- El responsable solo ve y modifica los datos de su empresa (PB-03). No es un caso de uso aparte: es una regla que cumplen todos.

### 1.4 Lo que no aparece en el diagrama

- **Ingresos:** es un módulo opcional y no forma parte del MVP.
- **Datos de contacto de la empresa (PB-14) y resumen de la flota (PB-20):** están en el backlog, pero todavía no se confirma que entren en el MVP. Si se confirman, se agregan al diagrama.
- **Creación de cuentas:** en la primera entrega las cuentas de prueba las crea el equipo, no un usuario desde el sistema (JOA-01, sección 2.3).

---

## 2. Diagramas de secuencia

Muestran, paso a paso, cómo se comunican las partes del sistema en cada flujo. Los participantes son los mismos en todos:

| Participante | Qué es |
|---|---|
| **Interfaz web** | Las pantallas que el responsable ve en su navegador. |
| **Servidor** | La lógica de la aplicación (Next.js), donde se comprueba la sesión y se validan los datos. |
| **Supabase Auth** | El servicio que comprueba las credenciales y maneja las sesiones. |
| **Base de datos** | PostgreSQL, a la que el servidor accede con Prisma. |

### 2.1 Inicio de sesión (CU-01)

```mermaid
sequenceDiagram
    autonumber
    actor R as Responsable
    participant I as Interfaz web
    participant S as Servidor
    participant A as Supabase Auth
    participant B as Base de datos

    R->>I: Ingresa su correo y contraseña
    I->>S: Envía las credenciales
    S->>A: Pide verificar las credenciales
    alt Credenciales correctas
        A-->>S: Sesión válida
        S->>B: Busca el perfil y la empresa del usuario
        B-->>S: Usuario y empresa
        S-->>I: Guarda la sesión y redirige al listado
        I-->>R: Muestra los vehículos de su empresa
    else Credenciales incorrectas
        A-->>S: Error de autenticación
        S-->>I: Mensaje genérico de error
        I-->>R: Muestra el mensaje sin indicar qué dato falló
    end
```

- El mensaje de error es el mismo si el correo no existe o si la contraseña es incorrecta (JOA-01, criterio 7.2).
- La contraseña nunca se guarda en nuestras tablas: la maneja Supabase Auth.
- El detalle de cómo se guarda la sesión se define en SIM-02 **[POR CONFIRMAR]**.

### 2.2 Registro de vehículo (CU-03)

```mermaid
sequenceDiagram
    autonumber
    actor R as Responsable
    participant I as Interfaz web
    participant S as Servidor
    participant B as Base de datos

    R->>I: Completa el formulario y presiona Registrar
    I->>I: Valida los datos del formulario
    alt Datos inválidos
        I-->>R: Muestra el error junto a cada campo
    else Datos válidos
        I->>S: Envía los datos del vehículo
        S->>S: Comprueba la sesión y toma de ella la empresa
        S->>S: Valida de nuevo y normaliza la patente
        S->>B: Guarda el vehículo con la empresa de la sesión
        alt Patente ya registrada en la empresa
            B-->>S: Rechazo por patente duplicada
            S-->>I: Error de patente duplicada
            I-->>R: Muestra el mensaje de duplicado
        else Guardado correcto
            B-->>S: Vehículo guardado
            S-->>I: Redirige al listado con confirmación
            I-->>R: Muestra el listado y el mensaje de confirmación
        end
    end
```

- Los datos se validan dos veces con las mismas reglas: en el formulario, para ayudar al usuario, y en el servidor, que es la validación que protege los datos (JOA-01, sección 4).
- Si al servidor le llegan datos inválidos, devuelve los errores por campo y no guarda nada.
- La empresa nunca viene del formulario: el servidor la toma de la sesión (JOA-01, sección 2.4).
- La patente duplicada se detecta con la restricción única de empresa y patente en la base de datos.

### 2.3 Edición de vehículo (CU-05)

```mermaid
sequenceDiagram
    autonumber
    actor R as Responsable
    participant I as Interfaz web
    participant S as Servidor
    participant B as Base de datos

    R->>I: Abre un vehículo del listado
    I->>S: Pide el vehículo por su id
    S->>S: Comprueba la sesión y toma de ella la empresa
    S->>B: Busca el vehículo por id y empresa
    alt No existe o es de otra empresa
        B-->>S: Sin resultados
        S-->>I: No encontrado (404)
        I-->>R: Muestra "No encontrado"
    else Vehículo de la empresa
        B-->>S: Datos del vehículo
        S-->>I: Formulario con los datos actuales
        I-->>R: Muestra el formulario
        R->>I: Cambia los datos y presiona Guardar
        I->>I: Valida los datos del formulario
        I->>S: Envía los cambios
        S->>S: Valida de nuevo y normaliza la patente
        S->>B: Actualiza el vehículo por id y empresa
        B-->>S: Vehículo actualizado
        S-->>I: Redirige al listado con confirmación
        I-->>R: Muestra el listado y el mensaje de confirmación
    end
```

- Un vehículo de otra empresa responde "no encontrado" (404) y no 403, para no revelar que existe (JOA-01, sección 2.4).
- Los errores de validación y de patente duplicada se manejan igual que en el registro (sección 2.2).
- Desactivar o reactivar (CU-06) sigue los mismos pasos, cambiando solo el estado del vehículo.

### 2.4 Aviso de vencimiento por correo (CU-16)

```mermaid
sequenceDiagram
    autonumber
    participant T as Tiempo
    participant S as Servidor
    participant B as Base de datos
    participant C as Proveedor de correo
    actor R as Responsable

    T->>S: Inicia el proceso diario de avisos
    S->>B: Busca los documentos que vencen en los plazos de aviso
    B-->>S: Documentos por vencer, con su empresa
    loop Por cada documento
        S->>B: Consulta si ese aviso ya se envió
        alt Aviso pendiente
            B-->>S: No enviado
            S->>C: Pide enviar el correo al contacto de la empresa
            C->>R: Correo con el documento, a quién pertenece y su fecha
            S->>B: Registra el envío
        else Aviso ya enviado
            B-->>S: Ya enviado
            Note over S: No se envía de nuevo
        end
    end
```

Este flujo todavía tiene decisiones pendientes, todas de la sección 5 de JOA-01:

- Los plazos de aviso: 30, 7 y 1 días antes, y el día del vencimiento **[POR CONFIRMAR]**.
- La hora del proceso diario: en la mañana, hora de Chile **[POR CONFIRMAR]**.
- El destinatario: el correo de contacto de la empresa **[POR CONFIRMAR]**.
- El registro de cada envío para no repetir avisos **[POR CONFIRMAR]**.
- Que los documentos de vehículos inactivos no generen avisos **[POR CONFIRMAR]**.
- Qué pasa si el envío falla **[POR CONFIRMAR]**.

El único canal es el correo: no hay avisos por WhatsApp, SMS ni notificaciones push.

---

## 3. Coherencia con el modelo de datos

Los diagramas usan los nombres de JOA-01: empresa, usuario, vehículo, patente y estado. Los documentos, conductores, turnos y el registro de envíos todavía no tienen un modelo definido. Cuando José documente el modelo de datos (JOS-04), hay que revisar que los nombres de estos diagramas coincidan con los suyos.

---

## 4. Otros diagramas

La tarea pide agregar otros diagramas solo si la pauta vigente los exige. No encontramos en el repositorio una pauta que pida diagramas adicionales (de clases, de actividad o de componentes), así que no se incluyen. Si la profesora los solicita, se agregan a este documento **[POR CONFIRMAR]**.

---

## 5. Checklist de JOA-06

- [x] Diagrama de casos de uso con actores y funcionalidades del MVP (sección 1).
- [x] Diagramas de secuencia de inicio de sesión, registro y edición de vehículo, y aviso de vencimiento por correo (sección 2).
- [x] Sin diagramas adicionales, porque la pauta no los exige (sección 4).
- [x] Diagramas versionados en el repositorio como texto Mermaid dentro de este archivo.
- [ ] Revisión de coherencia con el modelo de datos de JOS-04, cuando exista (sección 3).
- [ ] Revisión de José y Simón en el PR.
