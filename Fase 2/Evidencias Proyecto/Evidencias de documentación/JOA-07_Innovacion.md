# JOA-07 · Innovación de MicroLogist

| | |
|---|---|
| **Tarea** | [JOA-07] Documentar la innovación del proyecto |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas y Simón Jofré |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 12-10-2026 |

Este documento explica qué tiene de nuevo MicroLogist: qué problema existe hoy, cómo lo resuelven las empresas, qué alternativas hay en el mercado y qué aporta nuestro producto frente a ellas. Se apoya en la [Product Vision](JOA-04_Product_Vision.md) y en el alcance definido en [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md).

La comparación de la sección 3 se hizo con información pública de cada producto, consultada el 12-10-2026 (ver sección 7). El equipo no probó esos productos.

---

## 1. El problema hoy

Una empresa pequeña de transporte de pasajeros tiene que controlar al mismo tiempo sus vehículos, sus conductores, los turnos y varios documentos obligatorios: revisión técnica, SOAP, permiso de circulación y licencias de conducir. Cada documento vence en una fecha distinta, según el tipo de documento, el vehículo y el conductor.

Cuando un vencimiento se pasa, la empresa lo paga caro:

- **Multas.** Circular sin SOAP, por ejemplo, es una infracción grave, con una multa de 1 a 1,5 UTM (BioBioChile, 2024). El monto y la categoría para la revisión técnica y el permiso de circulación vencidos están **[POR CONFIRMAR]** con la Ley de Tránsito.
- **Vehículos o conductores que no pueden operar**, lo que significa servicios que no se prestan.
- **Tiempo perdido** en revisar papeles y preguntar a otras personas para saber qué está al día.

El problema afecta a responsables y dueños de empresas de transporte urbano, escolar, de trabajadores, de estudiantes, de viajes particulares y de turismo.

---

## 2. Cómo lo resuelven hoy las empresas

Según la definición del proyecto (Fase 1) y la Product Vision, la información está repartida en varias herramientas que no se hablan entre sí:

| Herramienta | Para qué la usan | Limitación |
|---|---|---|
| **Planillas** (Excel o Google Sheets) | Lista de vehículos, conductores y fechas de vencimiento. | No avisan solas: alguien tiene que abrirlas y revisar las fechas. Es fácil equivocarse al escribir y suelen existir varias versiones. |
| **Papeles y carpetas** | Guardar los documentos físicos. | Hay que revisarlos uno por uno, se pueden perder y solo están en la oficina. |
| **Calendario o recordatorios del celular** | Anotar fechas importantes. | Quedan en el teléfono de una sola persona y no muestran el estado general de la flota. |
| **WhatsApp y llamadas** | Coordinar turnos y avisar novedades. | La información se pierde en la conversación y no queda un registro ordenado por vehículo o conductor. |
| **La memoria de quien lleva el control** | Saber qué vence pronto y quién maneja qué. | Si esa persona falta o se va, la información se pierde. |

Ninguna de estas herramientas tiene costo ni requiere aprender algo nuevo, y por eso se usan. El problema es que el control depende de que una persona se acuerde de revisar, y crece en desorden con cada vehículo nuevo.

Si el equipo ya cuenta con entrevistas o retroalimentación de responsables de empresas, falta citarlas aquí como respaldo **[POR CONFIRMAR]**.

---

## 3. Alternativas existentes

Existen productos que resuelven parte del problema. Los agrupamos en tres tipos.

### 3.1 Plataformas de telemática y GPS

**Ejemplos:** Geotab y Black GPS.

- Geotab ofrece en Chile monitoreo en tiempo real mediante su dispositivo GO9, que combina GPS con el diagnóstico a bordo del vehículo.
- Black GPS es una empresa chilena que ofrece monitoreo del consumo de combustible, evaluación del comportamiento del conductor, video vigilancia, mantenimiento de flotas y una central de monitoreo.

**Qué resuelven:** saber dónde está cada vehículo, cómo se conduce y cuánto consume.

**Limitaciones para nuestro usuario:**

- Necesitan un equipo instalado en cada vehículo, con su costo e instalación.
- Su foco es el monitoreo del vehículo en ruta, no el control de documentos ni la asignación de turnos.
- En las fuentes revisadas no aparecen precios publicados, así que una empresa chica debe pedir una cotización para saber cuánto le costaría.

### 3.2 Software de gestión y mantenimiento de flotas

**Ejemplos:** cloudFleet y Fleetio.

- cloudFleet se presenta como una solución web para el mantenimiento y la gestión de flotas. Tiene módulos de mantenimiento, checklist, neumáticos, combustible, documentación, compras e inventario de repuestos, y viajes y anticipos. Permite definir los documentos requeridos de vehículos y de personal, con alertas.
- Fleetio incluye recordatorios de renovación para vehículos (por defecto: prueba de emisiones, inspección, seguro y registro), con avisos por correo o notificación. Su página de precios indica entre 4 y 10 dólares por vehículo al mes, según el plan.

**Qué resuelven:** el mantenimiento y los costos de la flota. También controlan documentos con vencimiento, igual que MicroLogist.

**Limitaciones para nuestro usuario:**

- Están pensados alrededor del mantenimiento, con muchos módulos que una empresa chica de pasajeros no necesita. Eso significa más configuración y más tiempo para aprender a usarlos.
- El sitio y la documentación de ayuda de Fleetio están en inglés, y sus tipos de documento por defecto están pensados para otro país, aunque se pueden personalizar.
- cloudFleet no publica sus precios en las páginas revisadas.
- En las páginas revisadas no encontramos la asignación de turnos por fecha y jornada como una función destacada.

### 3.3 Módulos de flota de sistemas de gestión empresarial

**Ejemplo:** Odoo Flota.

- Permite hacer seguimiento de reparaciones, contratos de leasing, conductores y costos de los vehículos, y envía una alerta por correo cuando un contrato llega a su fecha de vencimiento.

**Qué resuelve:** el control administrativo y de costos de los vehículos de una empresa.

**Limitaciones para nuestro usuario:**

- Es una aplicación dentro de un sistema de gestión empresarial más grande, pensada para empresas que ya administran sus procesos con ese sistema.
- Está orientada a contratos y costos, no a la operación diaria de un servicio de transporte de pasajeros.

### 3.4 Resumen de la comparación

| | Planillas, papel y WhatsApp | Telemática y GPS | Software de mantenimiento de flotas | Sistema de gestión empresarial | MicroLogist (MVP) |
|---|---|---|---|---|---|
| **Foco principal** | Uso general | Ubicación y conducción | Mantenimiento y costos | Contratos y costos | Documentos, turnos y estado de la flota |
| **Avisa antes de un vencimiento** | No, hay que revisar a mano | No es su foco | Sí | Sí, de contratos | Sí, por correo |
| **Necesita equipos en los vehículos** | No | Sí | No | No | No |
| **Pensado para empresas chicas de pasajeros** | No, pero es lo que usan | No específicamente | No específicamente | No específicamente | Sí |
| **Esfuerzo para empezar** | Ninguno | Alto: instalar equipos | Medio o alto: muchos módulos por configurar | Medio o alto: es parte de un sistema mayor | Bajo: registrar vehículos y documentos |

---

## 4. El aporte de MicroLogist

Controlar vencimientos con alertas no es una función nueva: ya existe en los productos de la sección 3.2. **La innovación de MicroLogist está en el enfoque**: tomar esa necesidad y resolverla de forma simple para un tipo de empresa que hoy queda entre dos extremos, las planillas que no avisan y los sistemas de flota pensados para operaciones más grandes.

En concreto, MicroLogist aporta:

1. **Solo lo necesario.** Vehículos, conductores, documentos con vencimiento, avisos y turnos. No incluye mantenimiento, neumáticos, combustible ni inventario, que son los módulos que hacen más complejas a las alternativas.
2. **Sin equipos.** No necesita GPS ni nada instalado en los vehículos. La empresa puede empezar a usarlo sin comprar ni instalar equipos.
3. **Hecho para Chile.** Valida la patente chilena en sus dos formatos y trabaja con los documentos que una empresa local debe tener al día: revisión técnica, SOAP, permiso de circulación y licencia de conducir.
4. **Hecho para transporte de pasajeros**, en sus distintos rubros: urbano, escolar, de trabajadores, de estudiantes, viajes particulares y turismo.
5. **Avisa solo.** El sistema envía un correo antes de cada vencimiento, sin que alguien tenga que acordarse de revisar una planilla.
6. **Todo en un lugar y desde el celular.** Es una plataforma web adaptable: se usa desde el navegador en computador, tablet o teléfono, sin instalar una aplicación.

### Frente a cada alternativa

| Frente a | Qué aporta MicroLogist | Qué no reemplaza |
|---|---|---|
| **Planillas, papel y WhatsApp** | Avisos automáticos, validación de los datos, un solo lugar para toda la información y un control que no depende de una persona. | Nada: busca reemplazarlas en estas tareas. |
| **Telemática y GPS** | Control de documentos y turnos sin instalar equipos. | El seguimiento de la ubicación. Una empresa que lo necesite seguirá usando su GPS. |
| **Software de mantenimiento de flotas** | Una herramienta más simple, en español, con formatos chilenos y pensada para pasajeros. | La gestión de mantenimiento, repuestos y combustible. |
| **Sistemas de gestión empresarial** | Empezar a usarlo sin implementar un sistema completo. | La contabilidad y los demás procesos de la empresa. |

---

## 5. Lo que MicroLogist no es

Para no prometer más de lo que el producto hará:

- **No usa GPS** ni hace seguimiento de rutas en tiempo real.
- **No usa inteligencia artificial ni analítica avanzada.** Son una posible evolución futura, fuera del plazo del capstone (JOA-01, sección 1.4).
- **No gestiona mantenimiento, combustible ni inventario.**
- **Avisa solo por correo.** No envía avisos por WhatsApp, SMS ni notificaciones push.
- **La innovación no está en la tecnología.** Usa tecnologías conocidas. Lo nuevo es a quién está dirigido y qué tan simple es de usar.

---

## 6. Cómo comprobaremos el aporte

El aporte se verificará con los indicadores de la sección 6.2 de la Product Vision, que siguen **[POR CONFIRMAR]** con el equipo:

| Lo que afirmamos | Cómo lo comprobaremos |
|---|---|
| Es simple de usar | Un usuario nuevo registra un vehículo en menos de 2 minutos. |
| Avisa a tiempo | En las pruebas del módulo de avisos, ningún documento vence sin aviso previo. |
| Se puede usar desde el celular | Los flujos principales funcionan en una pantalla de 360 px de ancho. |
| Le sirve al usuario | Al menos 3 de 4 usuarios de prueba dicen que lo usarían. |

---

## 7. Fuentes

Consultadas el 12-10-2026. Los precios y funciones de productos de terceros pueden cambiar, así que conviene revisarlos de nuevo antes del informe final.

- BioBioChile (14-03-2024). [Cuáles son las infracciones de tránsito más cursadas en Chile y de cuánto son sus multas](https://www.biobiochile.cl/noticias/servicios/explicado/2024/03/14/cuales-son-las-infracciones-de-transito-mas-cursadas-en-chile-y-de-cuanto-son-sus-multas.shtml).
- Geotab (19-11-2024). [Telemática tracker para flotas: solución clave en Chile](https://www.geotab.com/es-latam/blog/telematica-tracker-para-flotas-en-chile/).
- Radio Pauta (03-12-2024). [Black GPS: innovación en gestión de flotas para empresas que buscan eficiencia y seguridad](https://www.pauta.cl/economia/2024/12/03/black-gps-innovacion-en-gestion-de-flotas-para-empresas-que-buscan-eficiencia-y-seguridad.html).
- cloudFleet. [Sitio principal](https://www.cloudfleet.com/) y [características del software](https://www.cloudfleet.com/features).
- Fleetio. [Vehicle Renewal Reminders](https://help.fleetio.com/en_US/vehicle-renewal-reminders), [Vehicle Renewal Types](https://help.fleetio.com/en_US/vehicle-renewal-types) y [página de precios](https://www.fleetio.com/pricing).
- Odoo. [Aplicación Flota](https://www.odoo.com/es_ES/app/fleet).

---

## 8. Checklist de JOA-07

- [x] Problema actual y cómo lo resuelven hoy las empresas: planillas, papel y WhatsApp (secciones 1 y 2).
- [x] Alternativas existentes y sus limitaciones (sección 3).
- [x] Aporte concreto de MicroLogist frente a esas alternativas (sección 4).
- [x] No se atribuyen al MVP funciones fuera de alcance: inteligencia artificial, GPS ni analítica avanzada (sección 5).
- [ ] Revisión de José y Simón en el PR.
