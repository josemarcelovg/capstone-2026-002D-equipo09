# Base de datos de MicroLogist

PostgreSQL, administrada con Prisma. En desarrollo se usa Supabase o la base local de Docker.

| Archivo | Qué es |
|---|---|
| `schema.prisma` | Modelo de datos: tablas, columnas, relaciones y restricciones (por ejemplo, patente única por empresa). |
| `migrations/` | Scripts SQL que crean y modifican las tablas, en orden. Cada carpeta tiene su `migration.sql`. |
| `perfiles-prueba.sql` | Une las cuentas de prueba de Supabase Auth con su empresa ficticia. Se ejecuta en el SQL Editor de Supabase ([SIM-02](<../../Evidencias de documentación/SIM-02_Inicio_de_Sesion.md>), sección 5). |

- **Diagrama entidad-relación y diccionario de datos:** [JOS-04 Modelo de datos](<../../Evidencias de documentación/JOS-04_Modelo_de_Datos.md>).
- **Configuración y datos de prueba:** [JOS-02 Configuración de la base de datos](<../../Evidencias de documentación/JOS-02_Configuracion_Base_de_Datos.md>).

## Cómo se usa

Los comandos se ejecutan desde la carpeta `Aplicación`, que tiene la configuración de Prisma (`prisma.config.ts`) apuntando a esta carpeta:

| Comando | Qué hace |
|---|---|
| `npm run db:deploy` | Aplica las migraciones de `migrations/`. |
| `npm run db:seed` | Carga las dos empresas y los vehículos ficticios (`Aplicación/prisma/seed.ts`). |
| `npm run db:comprobar` | Comprueba la conexión y la separación entre empresas (`Aplicación/prisma/comprobar.ts`). |
| `npm run db:migrate` | Crea una migración nueva en `migrations/` después de cambiar `schema.prisma` (solo en desarrollo). |

Los datos de prueba quedan en `Aplicación/prisma/` porque usan el cliente de Prisma y las dependencias de la aplicación.

Con Docker no hace falta ejecutar nada: al levantar el sistema se aplican las migraciones y se cargan los datos de prueba solos (ver el [README](<../README.md>)).
