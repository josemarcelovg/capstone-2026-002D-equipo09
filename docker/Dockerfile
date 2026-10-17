# Imagen de desarrollo de MicroLogist (JOS-05). La usa docker/compose.yaml.
# El código se copia dentro de la imagen: para ver cambios, volver a ejecutar
# `docker compose -f docker/compose.yaml up --build`.

FROM node:24-bookworm-slim

# OpenSSL lo necesita el motor de migraciones de Prisma.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Primero solo lo necesario para instalar dependencias, así Docker reutiliza
# esta capa mientras package-lock.json no cambie. `npm ci` ejecuta además
# `prisma generate` (postinstall), que necesita el esquema y su configuración.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["sh", "docker/iniciar.sh"]
