-- Tabla de turnos (JOA-14, JOS-19). Generada con `prisma migrate diff`; el CHECK y el RLS van a mano.

-- CreateEnum
CREATE TYPE "jornada" AS ENUM ('manana', 'tarde', 'noche');

-- CreateTable
CREATE TABLE "turno" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "jornada" "jornada" NOT NULL,
    "vehiculo_id" UUID NOT NULL,
    "conductor_id" UUID NOT NULL,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivo_anulacion" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "turno_empresa_id_fecha_idx" ON "turno"("empresa_id", "fecha");

-- CreateIndex
-- Un vehículo y un conductor tienen como máximo un turno por fecha y jornada. Los anulados no cuentan.
CREATE UNIQUE INDEX "turno_vehiculo_id_fecha_jornada_key" ON "turno"("vehiculo_id", "fecha", "jornada") WHERE (NOT anulado);

-- CreateIndex
CREATE UNIQUE INDEX "turno_conductor_id_fecha_jornada_key" ON "turno"("conductor_id", "fecha", "jornada") WHERE (NOT anulado);

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- Compuestas, como las de documento: el vehículo y el conductor tienen que ser de la misma empresa.
ALTER TABLE "turno" ADD CONSTRAINT "turno_vehiculo_id_empresa_id_fkey" FOREIGN KEY ("vehiculo_id", "empresa_id") REFERENCES "vehiculo"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_conductor_id_empresa_id_fkey" FOREIGN KEY ("conductor_id", "empresa_id") REFERENCES "conductor"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- Regla de JOA-14, sección 3 (agregada a mano: Prisma no maneja restricciones CHECK).
-- El motivo solo se guarda en un turno anulado.
ALTER TABLE "turno" ADD CONSTRAINT "turno_motivo_anulacion_check"
    CHECK ("anulado" OR "motivo_anulacion" IS NULL);

-- Seguridad en Supabase (agregado a mano), igual que en las migraciones anteriores:
-- con RLS activo y sin políticas, la Data API de Supabase no puede leer ni
-- modificar esta tabla con la clave anónima. Prisma, como dueño, no queda sujeto a RLS.
ALTER TABLE "turno" ENABLE ROW LEVEL SECURITY;
