# JOA-04 · Product Vision de MicroLogist

| | |
|---|---|
| **Tarea** | [JOA-04] Redactar Product Vision |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Validación** | José Vargas y Simón Jofré |
| **Estado** | Propuesta para validación del equipo |
| **Fecha** | 24-09-2026 |

Este documento explica qué queremos lograr con MicroLogist, para quién es y por qué vale la pena. Sirve de base para el Product Backlog (JOA-08), los requisitos no funcionales (JOA-05) y la sección de innovación (JOA-07). Las reglas detalladas del primer módulo están en [JOA-01_Reglas_Modulo_Vehiculos.md](JOA-01_Reglas_Modulo_Vehiculos.md).

---

## 1. Visión

> **Que cualquier empresa pequeña de transporte de pasajeros sepa, en un solo lugar y desde el celular, el estado de sus vehículos, conductores y documentos, sin que se le pase ningún vencimiento.**

### En una frase

**Para** dueños y responsables de pequeñas y medianas empresas de transporte de pasajeros,
**que** hoy manejan su flota con planillas, papeles, calendarios y conversaciones de WhatsApp,
**MicroLogist** es una plataforma web
**que** centraliza vehículos, conductores, turnos y documentación, y avisa por correo antes de que un documento venza.
**A diferencia de** las planillas y los sistemas de gestión de flotas pensados para empresas grandes,
**nuestro producto** es simple, funciona en computador, tablet o teléfono y no necesita GPS ni equipos instalados en los vehículos.

---

## 2. El problema

En una empresa chica de transporte, la información de la flota está repartida: la revisión técnica en una carpeta, el SOAP en el correo, los turnos en un cuaderno o en un grupo de WhatsApp, los datos de los conductores en una planilla que actualiza una sola persona.

Esto trae problemas concretos:

- **Vencimientos que se pasan.** Nadie avisa cuando vence la revisión técnica, el SOAP, el permiso de circulación o la licencia de un conductor. Un documento vencido puede significar multas o un vehículo detenido.
- **No se sabe el estado real de la flota.** Para saber qué vehículos están operativos, en taller o con documentos al día, hay que preguntar o revisar varias fuentes.
- **Asignaciones informales.** Quién maneja qué vehículo y en qué turno se coordina de palabra, sin registro.
- **Todo depende de una persona.** Si quien lleva el control se enferma o se va, la información se pierde.
- **No escala.** Con cada vehículo nuevo el desorden crece.

---

## 3. Para quién es

### 3.1 Segmento

Pequeñas y medianas empresas de **transporte de pasajeros** de distintos rubros:

- Transporte urbano (micros, colectivos, taxibuses).
- Transporte escolar.
- Traslado de trabajadores.
- Traslado de estudiantes universitarios.
- Viajes particulares y servicios privados.
- Servicios turísticos.

El producto partió pensando en micros y colectivos, pero el problema administrativo es el mismo en todos estos rubros, así que la solución apunta a todos ellos.

### 3.2 Usuarios

| Usuario | Qué necesita | ¿Usa el sistema? |
|---|---|---|
| **Dueño o responsable de la empresa** | Ver el estado de la flota, registrar vehículos y conductores, organizar turnos y enterarse a tiempo de los vencimientos. | Sí, es el usuario principal (rol `admin`). |
| **Administrativo o encargado de operaciones** | Mantener los datos al día y coordinar turnos. | En una etapa posterior, cuando una empresa pueda tener varios usuarios. |
| **Conductor** | Que su información y su licencia estén en orden. | No en el MVP: es un registro dentro del sistema, no una cuenta. |

---

## 4. Necesidades que resolvemos

1. **Tener todo en un solo lugar:** vehículos, conductores, turnos y documentos.
2. **Enterarse antes de que algo venza:** un correo con anticipación, sin tener que revisar fechas a mano.
3. **Ver el estado de la flota de un vistazo:** qué está operativo, qué está en taller y qué documentos están por vencer.
4. **Usarlo desde cualquier parte:** computador en la oficina o celular en el terminal.
5. **Que sea simple:** sin capacitación larga, sin instalar nada en los vehículos y sin costos de hardware.
6. **Que los datos estén seguros:** cada empresa ve solo su información.

---

## 5. El producto

### 5.1 Módulos

| Módulo | Qué hace | Cuándo |
|---|---|---|
| **Acceso** | Inicio y cierre de sesión; cada empresa ve solo sus datos. | Primera entrega |
| **Vehículos** | Registrar, listar, editar y desactivar vehículos. | Primera entrega |
| **Conductores** | Datos de los conductores y sus licencias. | MVP |
| **Documentos** | Revisión técnica, SOAP, permiso de circulación, licencias y otros, con su fecha de vencimiento. | MVP |
| **Avisos por correo** | Correo automático antes de que venza un documento. | MVP |
| **Turnos** | Asignar vehículo y conductor por fecha y jornada. | MVP |
| **Ingresos** | Registro de ingresos, activable según el tipo de empresa. | Opcional |

### 5.2 Lo que lo hace distinto

- **Pensado para empresas chicas:** hace pocas cosas y las hace bien, en vez de copiar un sistema de flotas grande.
- **Sirve para varios rubros** de transporte de pasajeros, no solo para uno.
- **Sin hardware:** no requiere GPS, sensores ni equipos en los vehículos, así que empezar a usarlo cuesta poco.
- **Web adaptable:** se usa desde el navegador en computador, tablet o celular, sin instalar una app.
- **Avisos por correo:** un canal formal, que deja registro y que cualquier empresa ya tiene.

---

## 6. Objetivos y cómo mediremos el éxito

### 6.1 Objetivo general

Desarrollar y validar una plataforma web simple que centralice la gestión de vehículos, conductores, turnos, documentación e ingresos opcionales de pequeñas y medianas empresas de transporte de pasajeros, sin requerir GPS ni equipamiento adicional.

### 6.2 Indicadores propuestos

Todos son **[POR CONFIRMAR]** con el equipo y se validarán con usuarios reales o de prueba.

| Indicador | Meta propuesta |
|---|---|
| Tiempo para registrar un vehículo | Menos de 2 minutos para un usuario nuevo. |
| Documentos que vencen sin aviso previo | Cero, en las pruebas del módulo de avisos. |
| Separación de datos entre empresas | Ningún acceso cruzado en las pruebas (SIM-03). |
| Uso en celular | Los flujos principales funcionan en una pantalla de 360 px de ancho. |
| Opinión de usuarios en la validación | Al menos 3 de 4 usuarios de prueba dicen que lo usarían. |

---

## 7. Alcance y hoja de ruta

### 7.1 Etapas

| Etapa | Contenido |
|---|---|
| **Primera entrega** | Inicio de sesión y registro, listado y edición de vehículos, con datos separados por empresa. |
| **MVP completo** | Conductores, documentos, avisos por correo y turnos. |
| **Opcional** | Ingresos, según el avance y el tipo de empresa. |
| **Evolución futura** | Varios usuarios por empresa con roles, reportes, analítica y otras mejoras. Fuera del plazo del capstone. |

### 7.2 Hitos del cronograma (18 semanas)

| Semana | Hito |
|---|---|
| 3 | Idea validada |
| 6 | Stack tecnológico definido |
| 14 | MVP integrado |
| 18 | Entrega final |

Las fechas exactas de cada semana están **[POR CONFIRMAR]** con el cronograma del equipo.

### 7.3 Fuera de alcance

- GPS, seguimiento de rutas en tiempo real y equipos instalados en los vehículos.
- Aplicación móvil nativa.
- Avisos por WhatsApp, SMS o notificaciones push: el único canal es el correo.
- Pagos, facturación y suscripciones.
- Integraciones con organismos externos.
- Inteligencia artificial y analítica avanzada.

El detalle está en la sección 1.4 de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md).

---

## 8. Supuestos y riesgos

| Tipo | Descripción | Cómo lo manejamos |
|---|---|---|
| Supuesto | Los responsables de las empresas usan correo y tienen un celular o computador con internet. | Validarlo en las entrevistas o pruebas con usuarios. |
| Supuesto | Las empresas están dispuestas a ingresar sus datos al sistema. | Hacer el registro lo más rápido posible y validarlo con usuarios. |
| Riesgo | El plazo de 18 semanas no alcanza para todos los módulos. | Priorizar en el backlog y dejar ingresos como opcional. |
| Riesgo | Dependemos de servicios externos (Supabase, Vercel, proveedor de correo) y de sus planes gratuitos. | Documentar la configuración y revisar los límites de cada plan. |
| Riesgo | Los correos de aviso llegan a spam o no se envían. | Registrar cada envío y probar con distintos proveedores de correo. |
| Riesgo | Acceso cruzado entre empresas por un error de programación. | Validar siempre en el servidor y probarlo con dos empresas ficticias. |

---

## 9. Equipo

| Integrante | Rol en el equipo |
|---|---|
| Joaquín Orellana | Product Owner |
| Simón Jofré | Scrum Master |
| José Vargas | Developer |

Los tres participan en análisis, diseño, desarrollo, pruebas y documentación.

---

## 10. Checklist de JOA-04

- [x] Usuarios objetivo de todos los rubros de transporte de pasajeros (sección 3).
- [x] Problema, objetivo del producto y valor que entrega (secciones 2, 4, 5 y 6).
- [x] Alcance, limitaciones y lo que queda fuera (sección 7 y JOA-01).
- [ ] Validación de José y Simón en el PR.
