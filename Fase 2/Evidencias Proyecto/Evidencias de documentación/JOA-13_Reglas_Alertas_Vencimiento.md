# JOA-13 · Reglas de las alertas de vencimiento por correo

| | |
|---|---|
| **Tarea** | [JOA-13] Definir las reglas de las alertas de vencimiento |
| **Responsable** | Joaquín Orellana (Product Owner) |
| **Revisión** | José Vargas (datos) y Simón Jofré (implementación y pruebas) |
| **Estado** | Propuesta para revisión del equipo |
| **Fecha** | 28-10-2026 |

Este documento fija las reglas de los ítems **PB-15** y **PB-16** del [Product Backlog](JOA-08_Product_Backlog.md) y el destinatario de PB-14. Cierra los **[POR CONFIRMAR]** de la sección 5 de [JOA-01](JOA-01_Reglas_Modulo_Vehiculos.md), de esos ítems y de la tabla `aviso_enviado` del [modelo de datos](JOS-04_Modelo_de_Datos.md) (sección 3.7). Las decisiones se acordaron en equipo el 28-10-2026, después de la revisión del avance con la profesora.

El estado de cada documento (vigente, por vencer o vencido) y la regla de "hoy en hora de Chile" están en [JOA-10](JOA-10_Reglas_Modulo_Documentos.md). Este documento no los repite: los usa.

---

## 1. Alcance

> Avisar por correo al responsable de cada empresa antes de que venza un documento, una sola vez por cada plazo, y dejar registrado cada envío.

Incluye:

- Un proceso automático que corre una vez al día.
- Un correo diario por empresa con los documentos que tienen aviso ese día.
- El registro de cada envío, exitoso o fallido, y el reintento de los fallidos.

Fuera de este módulo:

- **Cualquier canal que no sea el correo** (WhatsApp, SMS, notificaciones push). Es una decisión fija del proyecto.
- Configurar los plazos o el destinatario desde la aplicación: son fijos en el MVP.
- Avisos después de vencido el documento.
- Una pantalla para ver el historial de envíos. El registro existe en la base de datos y se puede consultar, pero no tiene pantalla en el MVP.

---

## 2. Decisiones

| Tema | Decisión | Por qué |
|---|---|---|
| Plazos (PB-15) | **4 avisos** por documento: a los **30, 7 y 1 días** antes y **el mismo día** del vencimiento. | 30 días da tiempo para agendar la revisión técnica; 7 y 1 son recordatorios; el día del vencimiento es el último aviso. |
| Destinatario (PB-14) | El **correo de contacto de la empresa** (`email_contacto`). | Ya existe, es obligatorio y la empresa lo puede actualizar (PB-14). No depende de cuántos usuarios tenga la empresa. |
| Formato | **Un solo correo diario por empresa**, con todos los documentos que tienen aviso ese día. | Menos correos para el responsable y menos uso del plan gratis del proveedor. |
| Hora (PB-15) | Una vez al día, a las **11:00 UTC**: llega entre las **07:00 y las 08:00 hora de Chile**, según la época del año. | El programador diario trabaja en UTC y Chile cambia de horario dos veces al año. El equipo acepta ese rango. |
| Proveedor (PB-15) | **Resend**, plan gratis (100 correos al día y 3.000 al mes). | Se integra con Next.js y Vercel con una sola clave. Con un correo diario por empresa alcanza de sobra para el MVP. |
| Programador | **Vercel Cron**, que llama una ruta protegida de la aplicación. | Viene con Vercel, donde se despliega la aplicación. |
| Sin duplicados (PB-16) | Un mismo aviso (documento + fecha de vencimiento + plazo) **nunca se envía dos veces**, aunque el proceso corra de nuevo. | Restricción única de `aviso_enviado` (JOS-04, sección 3.7). |
| Fallas (PB-16) | Cada intento queda registrado como `enviado` o `fallido`. Los fallidos **se reintentan al día siguiente**. | No se pierde un aviso por una caída del proveedor. |
| Plazos saltados | Si un plazo no se avisó a tiempo, **solo se manda el plazo que corresponde hoy**; los anteriores no se envían atrasados. | Nunca llega "vence en 7 días" cuando faltan 5. El correo siempre dice los días reales. |
| Dueños inactivos (PB-16) | Los documentos de vehículos y conductores **inactivos no generan avisos**. | Igual que en el listado de documentos (JOA-10, sección 2). |
| Renovación | Un documento renovado (fecha nueva) empieza de cero sus 4 avisos. | Los avisos se registran con la fecha de vencimiento que tenía el documento (JOS-04, sección 3.7). |
| Fecha | Iteración 6 (16-11 al 29-11). Requiere el módulo de documentos (Iteración 5) y la aplicación desplegada en Vercel (Iteración 4). | Sin documentos no hay qué avisar, y el envío diario necesita la aplicación publicada. |

---

## 3. Qué documentos se avisan cada día

El proceso corre una vez al día y calcula **hoy en hora de Chile** (la misma función de JOA-10).

### 3.1 Plazo que corresponde

Para cada documento cuyo dueño está activo:

1. `días = fecha de vencimiento − hoy`.
2. Si `días` es negativo (ya venció), no se avisa.
3. Si `días` es mayor que 30, todavía no se avisa.
4. Si no, el **plazo que corresponde** es el menor de 30, 7, 1 o 0 que sea mayor o igual a `días`.

| Días que faltan | Plazo que corresponde |
|---|---|
| 31 o más | Ninguno |
| 8 a 30 | 30 |
| 2 a 7 | 7 |
| 1 | 1 |
| 0 (vence hoy) | 0 |
| Negativo (vencido) | Ninguno |

### 3.2 Si se avisa o no

Se incluye el documento en el correo de su empresa si **no existe** en `aviso_enviado` un registro con el mismo documento, la misma fecha de vencimiento, el mismo plazo y estado `enviado`.

- Si existe y está `enviado`: no se repite.
- Si existe y está `fallido`: se reintenta (sigue siendo el plazo que corresponde).
- Si el plazo de un aviso fallido ya pasó al siguiente (por ejemplo, falló el de 7 días y hoy toca el de 1), se manda el de hoy y el fallido queda como estaba.
- Un documento registrado con pocos días por vencer recibe solo el plazo que le corresponde ese día. Por ejemplo, si se registra el lunes y vence el sábado, recibe el aviso de 7 días, que dice "vence en 5 días".

### 3.3 Registro de cada envío

Por cada documento incluido en un correo se guarda una fila en `aviso_enviado` con el documento, la fecha de vencimiento, el plazo, el destinatario, el estado y la fecha y hora del intento. Para que dos ejecuciones simultáneas no envíen dos veces, primero se registra la fila (la restricción única lo impide), después se envía el correo y al final se marca `enviado` o `fallido`.

---

## 4. El correo

- **De:** MicroLogist.
- **Para:** el `email_contacto` de la empresa.
- **Asunto:** "MicroLogist: N documentos por vencer" o, si alguno vence hoy, "MicroLogist: documentos que vencen hoy".
- **Cuerpo:**
  - Saludo con el nombre de la empresa.
  - La lista de documentos, ordenada por fecha de vencimiento: tipo de documento, a quién pertenece (patente o nombre del conductor), fecha de vencimiento en formato `DD-MM-AAAA` y cuánto falta ("Vence hoy", "Vence mañana", "Vence en N días").
  - Un enlace a la lista de documentos de la aplicación.
  - Una nota final: "Este aviso se envía al correo de contacto de tu empresa. Puedes cambiarlo en los datos de tu empresa."
- Se lee bien en Gmail y Outlook, en computador y en celular (RNF-COM-05). Texto simple, sin imágenes.

Ejemplo (hoy 01-12-2026):

> **Asunto:** MicroLogist: documentos que vencen hoy
>
> Hola, Transportes Cordillera:
>
> Estos documentos necesitan tu atención:
>
> - **Licencia de conducir** · Pedro Soto · vence el 01-12-2026 · **Vence hoy**
> - **Permiso de circulación** · BBCD-12 · vence el 08-12-2026 · Vence en 7 días
> - **Revisión técnica** · FGHJ-34 · vence el 31-12-2026 · Vence en 30 días
>
> Ver documentos: https://…/documentos

---

## 5. Notas para la implementación (Simón)

- El proceso es una ruta de la aplicación que llama Vercel Cron (`vercel.json`, horario `0 11 * * *`). Se protege con una clave en `CRON_SECRET`: sin ella responde 401.
- Esa ruta debe quedar **fuera del inicio de sesión** del proxy (`debeRedirigirAlLogin` en `src/lib/acceso.ts`), porque Vercel Cron no tiene sesión. Agregar su prueba en `tests/acceso.test.ts`.
- Variables nuevas, en `.env.example`, en Vercel y en JOS-06: `RESEND_API_KEY`, `CRON_SECRET` y el remitente.
- En el plan gratis de Resend, sin dominio propio, solo se puede enviar a correos verificados en la cuenta. Para la demo, el `email_contacto` de las empresas de prueba debe ser un correo del equipo.
- Se reutilizan del módulo de documentos el cálculo del estado y la función de hoy en Chile (SIM-09). No se repite ese cálculo.
- El proceso debe terminar en menos de 5 minutos con los datos de prueba (RNF-REN-04).

---

## 6. Criterios de aceptación

Base para las pruebas (SIM-04, casos CP-FUN-27 y CP-FUN-28). Se prueban con fechas controladas.

**Plazos**

1. Un documento que vence en 30, 7 o 1 días, o hoy, aparece en el correo de ese día con los días que faltan.
2. Un documento que vence en 31 días o más, o que ya venció, no aparece.
3. Un documento que vence en 5 días y no tiene avisos aparece una vez, con "Vence en 5 días", y no recibe el de 30 días atrasado.

**Envío**

4. Cada empresa recibe como máximo un correo al día, en su `email_contacto`, con todos sus documentos que tienen aviso.
5. Una empresa sin documentos con aviso ese día no recibe correo.
6. Los documentos de vehículos y conductores inactivos no aparecen.
7. El correo de una empresa nunca incluye documentos de otra empresa.

**Registro y duplicados**

8. Cada documento incluido queda registrado en `aviso_enviado` con su plazo, destinatario, estado y fecha.
9. Si el proceso corre dos veces el mismo día, no se envía ningún aviso repetido.
10. Si el envío falla, queda `fallido` y se reintenta al día siguiente.
11. Al renovar un documento (fecha nueva), vuelve a recibir sus avisos desde el plazo que corresponda.

**Seguridad**

12. Llamar la ruta del proceso sin `CRON_SECRET` responde 401 y no envía nada.

---

## 7. Checklist de JOA-13

- [x] Plazos, destinatario, formato, hora y proveedor (sección 2).
- [x] Regla para elegir el plazo, sin duplicados y con reintento (sección 3).
- [x] Contenido del correo con un ejemplo (sección 4).
- [x] Notas para la implementación (sección 5).
- [x] Criterios de aceptación numerados (sección 6).
- [ ] Revisión y aprobación de José y Simón en el PR.
