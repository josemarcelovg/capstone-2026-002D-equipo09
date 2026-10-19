# Imagen de desarrollo de MicroLogist (JOS-05). La usa compose.yaml (en esta carpeta).
# El código se copia dentro de la imagen: para ver cambios, volver a ejecutar
# `docker compose up --build`.
#
# El contexto de construcción es la carpeta «Evidencias de sistema», para que la
# imagen tenga la aplicación («Aplicación») y el esquema y las migraciones
# («Base de datos»). Lo que no se copia está en Dockerfile.dockerignore.

FROM node:24-bookworm-slim

# OpenSSL lo necesita el motor de migraciones de Prisma.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Se mantienen los nombres de las carpetas porque prisma.config.ts y el esquema
# se apuntan entre sí con rutas relativas.
WORKDIR /sistema
COPY ["Base de datos", "Base de datos/"]

# Primero solo lo necesario para instalar dependencias, así Docker reutiliza
# esta capa mientras package-lock.json no cambie. `npm ci` ejecuta además
# `prisma generate` (postinstall), que necesita el esquema y su configuración.
COPY ["Aplicación/package.json", "Aplicación/package-lock.json", "Aplicación/prisma.config.ts", "Aplicación/"]
WORKDIR /sistema/Aplicación
RUN npm ci --no-audit --no-fund

COPY ["Aplicación", "/sistema/Aplicación/"]
RUN npx prisma generate

EXPOSE 3000
CMD ["sh", "iniciar.sh"]
