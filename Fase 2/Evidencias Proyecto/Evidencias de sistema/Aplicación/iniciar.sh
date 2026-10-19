#!/bin/sh
# Arranque del contenedor de la aplicación (JOS-05).
# Las migraciones y el seed se pueden ejecutar todas las veces que se quiera:
# solo aplican lo que falta.
set -e

echo "Aplicando migraciones..."
npx prisma migrate deploy

echo "Cargando datos de prueba..."
npm run db:seed

echo "Iniciando MicroLogist en http://localhost:3000"
exec npm run dev -- --hostname 0.0.0.0
