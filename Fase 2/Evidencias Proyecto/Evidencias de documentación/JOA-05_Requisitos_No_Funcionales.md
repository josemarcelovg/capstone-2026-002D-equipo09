# JOA-05 · Requisitos no funcionales de MicroLogist

| | |
|---|---|
| **Tarea** | [JOA-05] Definir requisitos no funcionales verificables |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | Simón Jofré (seguridad) y José Vargas (rendimiento y datos) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 12-10-2026 |

Los requisitos no funcionales dicen **cómo** debe comportarse MicroLogist: qué tan seguro, rápido, fácil de usar, compatible y disponible debe ser. Lo que el sistema hace está en las reglas de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md) y en el Product Backlog (JOA-08).

Cada requisito tiene un criterio que se puede medir y una forma concreta de comprobarlo. Los umbrales que el equipo todavía no acuerda están marcados como **[POR CONFIRMAR]**; el número que aparece junto a esa marca es solo una propuesta.

---

## 1. Cómo leer este documento

- **ID:** `RNF-` más la categoría y un número. No se reutiliza ni se renumera, para que el plan de pruebas (SIM-04) pueda citarlo.
- **Criterio medible:** lo que debe cumplirse para dar el requisito por aprobado.
- **Cómo se verifica:** los pasos o la herramienta para comprobarlo.
- **Desde:** la etapa en que empieza a exigirse. "Primera entrega" es inicio de sesión y vehículos; "MVP" es el producto con conductores, documentos, avisos y turnos.

| Categoría | Prefijo | Sección |
|---|---|---|
| Seguridad | `RNF-SEG` | 2 |
| Rendimiento | `RNF-REN` | 3 |
| Usabilidad | `RNF-USA` | 4 |
| Compatibilidad | `RNF-COM` | 5 |
| Disponibilidad | `RNF-DIS` | 6 |

---

## 2. Seguridad

A coordinar con Simón (SIM-02 y SIM-03).

| ID | Requisito | Criterio medible | Cómo se verifica | Desde |
|---|---|---|---|---|
| RNF-SEG-01 | Solo se accede con sesión iniciada. | El 100 % de las páginas privadas redirige al inicio de sesión cuando no hay sesión. Después de cerrar sesión, ninguna operación devuelve ni modifica datos. | Abrir cada página privada sin sesión. Cerrar sesión, volver atrás en el navegador y repetir una operación privada (JOA-01, criterios 7.3 y 7.4). | Primera entrega |
| RNF-SEG-02 | Cada empresa ve y modifica solo sus datos. | 0 accesos cruzados en las pruebas con dos empresas. Pedir un registro de otra empresa responde "no encontrado" (404), nunca 403. | Con las cuentas de Empresa A y Empresa B, ejecutar los criterios 7.11, 7.12 y 7.13 de JOA-01. | Primera entrega |
| RNF-SEG-03 | La empresa del usuario se toma de la sesión, nunca de lo que envía el navegador. | Enviar un `empresa_id` distinto en el formulario o en la solicitud no cambia la empresa del registro. | Modificar la solicitud con las herramientas del navegador y comprobar en la base de datos a qué empresa quedó asociado el registro. | Primera entrega |
| RNF-SEG-04 | Todos los datos se validan en el servidor. | El 100 % de los datos inválidos de la sección 6.2 de JOA-01 se rechaza, también cuando se envían sin pasar por el formulario. | Enviar solicitudes directas con datos inválidos. Ejecutar las pruebas automáticas del esquema de validación. | Primera entrega |
| RNF-SEG-05 | Las contraseñas no se guardan en nuestras tablas y el inicio de sesión no revela si el correo existe. | No hay ninguna columna de contraseña en el modelo de datos. El mensaje de error es idéntico para un correo que no existe y para una contraseña incorrecta. | Revisar el esquema de Prisma. Probar ambos casos en el inicio de sesión (JOA-01, criterio 7.2). | Primera entrega |
| RNF-SEG-06 | Las contraseñas y las sesiones tienen reglas mínimas. | Largo mínimo de la contraseña: 8 caracteres **[POR CONFIRMAR]**. Duración de la sesión: **[POR CONFIRMAR]**. Una sesión vencida redirige al inicio de sesión sin mostrar datos. | Revisar la configuración de Supabase Auth. Probar con una sesión vencida. | Primera entrega |
| RNF-SEG-07 | No hay secretos en el repositorio. | 0 contraseñas, claves o archivos `.env` en el repositorio y en su historial. Las claves viven en variables de entorno. | Revisión en cada pull request (Definition of Done) y búsqueda de claves en el historial antes de cada entrega. | Primera entrega |
| RNF-SEG-08 | La aplicación desplegada usa una conexión cifrada. | El 100 % de las páginas se sirve por HTTPS. Entrar por `http://` redirige a `https://`. | Abrir la dirección desplegada con `http://` y comprobar la redirección y el candado del navegador. | Primera entrega |
| RNF-SEG-09 | Los errores no muestran detalles técnicos. | Ningún mensaje al usuario incluye trazas de error, consultas ni nombres de tablas. | Forzar errores (por ejemplo, con la base de datos desconectada en un entorno de prueba) y revisar lo que aparece en pantalla. | Primera entrega |
| RNF-SEG-10 | Las dependencias no tienen vulnerabilidades graves conocidas. | `npm audit --omit=dev` no informa vulnerabilidades altas ni críticas **[POR CONFIRMAR]**. | Ejecutar el comando antes de cada entrega y guardar el resultado como evidencia. | Primera entrega |

---

## 3. Rendimiento

A coordinar con José (JOS-02 y JOS-03). Todos los umbrales de esta sección están **[POR CONFIRMAR]** y se miden sobre la versión desplegada, no en el computador de desarrollo.

| ID | Requisito | Criterio medible | Cómo se verifica | Desde |
|---|---|---|---|---|
| RNF-REN-01 | Las pantallas principales cargan rápido en un celular. | El contenido principal del inicio de sesión, el listado y el formulario de vehículos aparece en 2,5 segundos o menos **[POR CONFIRMAR]**, simulando un celular con conexión 4G. | Lighthouse en Chrome, en modo móvil. Se hacen 3 mediciones por pantalla y se toma la del medio. Se mira el indicador "Largest Contentful Paint". | Primera entrega |
| RNF-REN-02 | Guardar responde rápido. | Registrar o editar un vehículo responde en 2 segundos o menos **[POR CONFIRMAR]**. | Medir el tiempo de la solicitud en la pestaña "Red" de las herramientas del navegador, con 5 repeticiones. | Primera entrega |
| RNF-REN-03 | El listado funciona bien con una flota del tamaño esperado. | Con 100 vehículos en una empresa **[POR CONFIRMAR]**, el listado sigue cumpliendo RNF-REN-01, y la búsqueda y los filtros responden en 1 segundo o menos **[POR CONFIRMAR]**. | Cargar 100 vehículos de prueba y repetir las mediciones. | Primera entrega |
| RNF-REN-04 | El envío diario de avisos termina a tiempo. | El proceso diario de avisos termina en menos de 5 minutos **[POR CONFIRMAR]** con los datos de prueba. | Ejecutar el proceso en el entorno de prueba y revisar la hora de inicio y de término en el registro de envíos. | MVP |

---

## 4. Usabilidad

Los dos primeros requisitos vienen de los indicadores de la sección 6.2 de la [Product Vision](JOA-04_Product_Vision.md).

| ID | Requisito | Criterio medible | Cómo se verifica | Desde |
|---|---|---|---|---|
| RNF-USA-01 | Se aprende a usar sin capacitación. | Un usuario nuevo registra un vehículo en menos de 2 minutos y sin ayuda **[POR CONFIRMAR]**. | Prueba con usuarios: se entrega la tarea, se cronometra y no se dan indicaciones. | Primera entrega |
| RNF-USA-02 | Los usuarios lo consideran útil. | Al menos 3 de 4 usuarios de prueba dicen que lo usarían **[POR CONFIRMAR]**. | Pregunta al terminar la prueba con usuarios; se registra cada respuesta. | MVP |
| RNF-USA-03 | Los mensajes son claros y están en español. | El 100 % de los textos, errores y confirmaciones está en español. Cada error aparece junto a su campo, con los mensajes de la sección 4 de JOA-01. | Recorrer cada formulario con datos inválidos y comparar los mensajes con JOA-01. | Primera entrega |
| RNF-USA-04 | El sistema ayuda a no cometer errores. | Las acciones que sacan un registro del listado (desactivar o anular) piden confirmación. Cuando un formulario muestra errores, no se borra lo que el usuario ya escribió. | Prueba funcional de cada formulario y de cada acción de desactivar. | Primera entrega |
| RNF-USA-05 | El sistema siempre informa qué está pasando. | Toda acción de guardar muestra un estado de carga y termina con un mensaje de confirmación o de error. | Prueba funcional, simulando una conexión lenta en las herramientas del navegador. | Primera entrega |
| RNF-USA-06 | Cumple una accesibilidad básica. | Todos los campos tienen etiqueta. Todas las pantallas se pueden usar solo con el teclado y el foco siempre se ve. El contraste del texto es de al menos 4,5:1 **[POR CONFIRMAR]**. | Recorrer cada pantalla con la tecla Tab. Auditoría de accesibilidad de Lighthouse con 90 puntos o más **[POR CONFIRMAR]**. | Primera entrega |

---

## 5. Compatibilidad

| ID | Requisito | Criterio medible | Cómo se verifica | Desde |
|---|---|---|---|---|
| RNF-COM-01 | Funciona en celular. | Los flujos principales se pueden completar en una pantalla de 360 px de ancho, sin desplazamiento horizontal (JOA-01, criterio 7.14). | Herramientas del navegador a 360 px y, además, un teléfono real. | Primera entrega |
| RNF-COM-02 | Funciona en tablet. | Los flujos principales se pueden completar a 768 px de ancho **[POR CONFIRMAR]**, sin desplazamiento horizontal. | Herramientas del navegador a 768 px. | Primera entrega |
| RNF-COM-03 | Funciona en computador. | Los flujos principales se pueden completar desde 1280 px de ancho **[POR CONFIRMAR]**. | Navegador en un computador, con la ventana a ese ancho. | Primera entrega |
| RNF-COM-04 | Funciona en los navegadores más usados. | El flujo principal funciona en las dos últimas versiones de Chrome, Edge, Firefox y Safari, y en Chrome para Android y Safari para iPhone **[POR CONFIRMAR]**. | Ejecutar el flujo principal en cada navegador y anotar la versión usada. | Primera entrega |
| RNF-COM-05 | Los correos de aviso se leen bien. | El correo de aviso se ve completo y legible en Gmail y Outlook, en computador y en celular **[POR CONFIRMAR]**. | Enviar un aviso de prueba a cuentas de ambos servicios y revisarlo en cada uno. | MVP |

---

## 6. Disponibilidad

La disponibilidad depende de los planes gratuitos o de bajo costo de Vercel, Supabase y el proveedor de correo (riesgo ya anotado en la sección 8 de la Product Vision). Antes de confirmar estos umbrales hay que revisar los límites de cada plan **[POR CONFIRMAR]**.

| ID | Requisito | Criterio medible | Cómo se verifica | Desde |
|---|---|---|---|---|
| RNF-DIS-01 | La aplicación está disponible cuando el usuario la necesita. | La aplicación desplegada responde al menos el 99 % del tiempo en un mes **[POR CONFIRMAR]**. | Un monitor externo que revise la dirección cada pocos minutos **[POR CONFIRMAR]**, o el historial de estado de los proveedores. | MVP |
| RNF-DIS-02 | Lo que se guarda no se pierde. | 0 registros perdidos después de recargar la página, cerrar sesión o volver a desplegar la aplicación. | Guardar datos de prueba, volver a desplegar y comprobar que siguen ahí (JOA-01, criterios 7.5 y 7.9). | Primera entrega |
| RNF-DIS-03 | Existe un respaldo de los datos. | Se puede respaldar y restaurar la base de datos. La frecuencia del respaldo está **[POR CONFIRMAR]** según el plan de Supabase. | Hacer un respaldo y restaurarlo en un proyecto de prueba. | MVP |
| RNF-DIS-04 | Una falla de un servicio externo no rompe la aplicación. | Si la base de datos o el proveedor de correo no responden, el usuario ve un mensaje claro y no se pierden datos ya guardados. Los avisos que no se enviaron se reintentan **[POR CONFIRMAR]**. | Simular la falla en un entorno de prueba, con variables de entorno inválidas. | MVP |
| RNF-DIS-05 | Cualquier integrante puede levantar el proyecto. | Siguiendo el README, una persona clona el repositorio y ejecuta la aplicación en menos de 15 minutos **[POR CONFIRMAR]**. | Otro integrante lo hace en un computador distinto al de quien escribió el README. | Primera entrega |

**Limitación conocida:** MicroLogist necesita conexión a internet (JOA-01, sección 1.3). No se exige que funcione sin conexión.

---

## 7. Relación con el plan de pruebas (SIM-04)

SIM-04 define cuatro tipos de prueba. Esta tabla indica qué requisitos cubre cada tipo. El identificador de cada caso de prueba lo asignará SIM-04; cuando exista, se agregará aquí.

| Tipo de prueba | Requisitos que debe cubrir | Caso de prueba |
|---|---|---|
| **Seguridad** | RNF-SEG-01 a RNF-SEG-10 | Por asignar en SIM-04 |
| **Funcionales** | RNF-USA-03, RNF-USA-04, RNF-USA-05, RNF-DIS-02 y RNF-DIS-04 | Por asignar en SIM-04 |
| **Compatibilidad** | RNF-COM-01 a RNF-COM-05 | Por asignar en SIM-04 |
| **Usabilidad** | RNF-USA-01, RNF-USA-02 y RNF-USA-06 | Por asignar en SIM-04 |

Los requisitos de rendimiento (RNF-REN-01 a RNF-REN-04) y los de disponibilidad que faltan (RNF-DIS-01, RNF-DIS-03 y RNF-DIS-05) no calzan en esos cuatro tipos. Falta decidir si SIM-04 agrega un tipo de prueba para ellos o si se comprueban aparte **[POR CONFIRMAR]**.

Requisitos que ya tienen un criterio de aceptación en la sección 7 de JOA-01, y que SIM-03 probará en la primera entrega:

| Requisito | Criterio de JOA-01 |
|---|---|
| RNF-SEG-01 | 7.3 y 7.4 |
| RNF-SEG-02 | 7.11, 7.12 y 7.13 |
| RNF-SEG-05 | 7.2 |
| RNF-COM-01 | 7.14 |
| RNF-DIS-02 | 7.5 y 7.9 |

---

## 8. Umbrales por confirmar

| Quién lo confirma | Qué falta acordar |
|---|---|
| **Simón** (seguridad) | Largo mínimo de la contraseña y duración de la sesión (RNF-SEG-06). Nivel de vulnerabilidades aceptado (RNF-SEG-10). |
| **José** (rendimiento y datos) | Tiempos de carga y de respuesta (RNF-REN-01 y RNF-REN-02). Cantidad de vehículos por empresa (RNF-REN-03). Tiempo del proceso de avisos (RNF-REN-04). Frecuencia del respaldo (RNF-DIS-03). |
| **Los tres** | Metas de las pruebas con usuarios (RNF-USA-01 y RNF-USA-02). Contraste y puntaje de accesibilidad (RNF-USA-06). Anchos de tablet y computador y lista de navegadores (RNF-COM-02 a RNF-COM-04). Porcentaje de disponibilidad y forma de medirlo (RNF-DIS-01). Si se agrega un tipo de prueba para rendimiento y disponibilidad (sección 7). |

---

## 9. Checklist de JOA-05

- [x] Requisitos de seguridad, rendimiento, usabilidad, compatibilidad (computador, tablet y celular) y disponibilidad (secciones 2 a 6).
- [x] Cada requisito tiene un criterio medible y la forma de verificarlo.
- [x] Los umbrales sin acuerdo están marcados como [POR CONFIRMAR] (resumen en la sección 8).
- [ ] Relación con los casos de prueba de SIM-04: está por tipo de prueba (sección 7); faltan los identificadores de cada caso, que dependen de SIM-04.
- [ ] Revisión de Simón (seguridad) y José (rendimiento y datos) en el PR.
