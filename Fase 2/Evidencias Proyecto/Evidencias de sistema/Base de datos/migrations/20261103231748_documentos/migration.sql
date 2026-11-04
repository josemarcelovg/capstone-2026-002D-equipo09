-- CreateEnum
CREATE TYPE "tipo_documento" AS ENUM ('revision_tecnica', 'soap', 'permiso_circulacion', 'licencia_conducir', 'otro');

-- CreateTable
CREATE TABLE "documento" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "tipo" "tipo_documento" NOT NULL,
    "descripcion" VARCHAR(100),
    "vehiculo_id" UUID,
    "conductor_id" UUID,
    "fecha_vencimiento" DATE NOT NULL,
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documento_empresa_id_fecha_vencimiento_idx" ON "documento"("empresa_id", "fecha_vencimiento");

-- CreateIndex
CREATE INDEX "documento_vehiculo_id_idx" ON "documento"("vehiculo_id");

-- CreateIndex
CREATE INDEX "documento_conductor_id_idx" ON "documento"("conductor_id");

-- CreateIndex
CREATE UNIQUE INDEX "documento_vehiculo_id_tipo_key" ON "documento"("vehiculo_id", "tipo") WHERE (tipo <> 'otro');

-- CreateIndex
CREATE UNIQUE INDEX "documento_conductor_id_tipo_key" ON "documento"("conductor_id", "tipo") WHERE (tipo <> 'otro');

-- CreateIndex
CREATE UNIQUE INDEX "documento_id_empresa_id_key" ON "documento"("id", "empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_id_empresa_id_key" ON "vehiculo"("id", "empresa_id");

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_vehiculo_id_empresa_id_fkey" FOREIGN KEY ("vehiculo_id", "empresa_id") REFERENCES "vehiculo"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_conductor_id_empresa_id_fkey" FOREIGN KEY ("conductor_id", "empresa_id") REFERENCES "conductor"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- Reglas de JOA-10, sección 2 (agregadas a mano: Prisma no maneja restricciones CHECK).
-- La aplicación valida lo mismo con Zod (src/lib/documentos.ts); estas reglas evitan
-- datos inválidos aunque la aplicación tuviera un error.

-- Un documento tiene exactamente un dueño: un vehículo o un conductor.
ALTER TABLE "documento" ADD CONSTRAINT "documento_un_dueno_check"
    CHECK (num_nonnulls("vehiculo_id", "conductor_id") = 1);

-- Revisión técnica, SOAP y permiso de circulación son de un vehículo; la licencia, de un
-- conductor; "otro", de cualquiera de los dos.
ALTER TABLE "documento" ADD CONSTRAINT "documento_tipo_dueno_check"
    CHECK (
        "tipo" = 'otro'
        OR ("tipo" IN ('revision_tecnica', 'soap', 'permiso_circulacion') AND "vehiculo_id" IS NOT NULL)
        OR ("tipo" = 'licencia_conducir' AND "conductor_id" IS NOT NULL)
    );

-- La descripción es obligatoria para el tipo "otro".
ALTER TABLE "documento" ADD CONSTRAINT "documento_descripcion_otro_check"
    CHECK ("tipo" <> 'otro' OR "descripcion" IS NOT NULL);

-- Seguridad en Supabase (agregado a mano), igual que en las migraciones anteriores:
-- con RLS activo y sin políticas, la Data API de Supabase no puede leer ni
-- modificar esta tabla con la clave anónima. Prisma, como dueño, no queda sujeto a RLS.
ALTER TABLE "documento" ENABLE ROW LEVEL SECURITY;
