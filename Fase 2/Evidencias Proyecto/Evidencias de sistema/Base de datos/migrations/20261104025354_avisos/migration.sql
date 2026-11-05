-- CreateEnum
CREATE TYPE "estado_aviso" AS ENUM ('enviado', 'fallido');

-- CreateTable
CREATE TABLE "aviso_enviado" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "dias_anticipacion" SMALLINT NOT NULL,
    "destinatario" VARCHAR(254) NOT NULL,
    "estado" "estado_aviso" NOT NULL,
    "enviado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "aviso_enviado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aviso_enviado_empresa_id_idx" ON "aviso_enviado"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "aviso_enviado_documento_id_fecha_vencimiento_dias_anticipac_key" ON "aviso_enviado"("documento_id", "fecha_vencimiento", "dias_anticipacion");

-- AddForeignKey
ALTER TABLE "aviso_enviado" ADD CONSTRAINT "aviso_enviado_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_enviado" ADD CONSTRAINT "aviso_enviado_documento_id_empresa_id_fkey" FOREIGN KEY ("documento_id", "empresa_id") REFERENCES "documento"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- Regla de JOA-13, sección 2 (agregada a mano: Prisma no maneja restricciones CHECK).
-- Solo existen los avisos de 30, 7 y 1 días antes y el del mismo día del vencimiento.
ALTER TABLE "aviso_enviado" ADD CONSTRAINT "aviso_enviado_dias_anticipacion_check"
    CHECK ("dias_anticipacion" IN (30, 7, 1, 0));

-- Seguridad en Supabase (agregado a mano), igual que en las migraciones anteriores:
-- con RLS activo y sin políticas, la Data API de Supabase no puede leer ni
-- modificar esta tabla con la clave anónima. Prisma, como dueño, no queda sujeto a RLS.
ALTER TABLE "aviso_enviado" ENABLE ROW LEVEL SECURITY;
