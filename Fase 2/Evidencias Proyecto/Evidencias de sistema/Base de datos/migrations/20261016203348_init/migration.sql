-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "rol" AS ENUM ('admin');

-- CreateEnum
CREATE TYPE "tipo_vehiculo" AS ENUM ('bus', 'minibus', 'van', 'furgon', 'automovil', 'otro');

-- CreateEnum
CREATE TYPE "estado_vehiculo" AS ENUM ('activo', 'en_mantencion', 'inactivo');

-- CreateTable
CREATE TABLE "empresa" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "rut" VARCHAR(12),
    "email_contacto" VARCHAR(254) NOT NULL,
    "telefono" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "rol" "rol" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "patente" VARCHAR(6) NOT NULL,
    "tipo" "tipo_vehiculo" NOT NULL,
    "marca" VARCHAR(50) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "anio" SMALLINT NOT NULL,
    "capacidad_pasajeros" SMALLINT NOT NULL,
    "numero_interno" VARCHAR(20),
    "color" VARCHAR(30),
    "estado" "estado_vehiculo" NOT NULL DEFAULT 'activo',
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_rut_key" ON "empresa"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_empresa_id_idx" ON "usuario"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_empresa_id_patente_key" ON "vehiculo"("empresa_id", "patente");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seguridad en Supabase (agregado a mano).
-- Supabase publica el esquema "public" por su Data API usando la clave anónima,
-- que es pública (NEXT_PUBLIC_SUPABASE_ANON_KEY). Con RLS activo y sin políticas,
-- esa API no puede leer ni modificar estas tablas. La aplicación no se ve afectada:
-- Prisma se conecta como dueño de las tablas, y el dueño no queda sujeto a RLS.
ALTER TABLE "empresa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehiculo" ENABLE ROW LEVEL SECURITY;

-- La tabla de historial de Prisma también queda en "public". Se protege solo si
-- existe (no existe en la base temporal que Prisma usa para comparar migraciones).
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
