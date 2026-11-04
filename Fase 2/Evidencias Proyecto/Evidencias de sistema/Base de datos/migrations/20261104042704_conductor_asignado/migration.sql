-- Conductor asignado al vehículo (PB-24). Generada con `prisma migrate diff`.
-- No crea tablas: la columna queda bajo el RLS que ya tiene `vehiculo`.

-- AlterTable
ALTER TABLE "vehiculo" ADD COLUMN     "conductor_id" UUID;

-- CreateIndex
CREATE INDEX "vehiculo_conductor_id_idx" ON "vehiculo"("conductor_id");

-- AddForeignKey
-- Compuesta, como las de documento: el conductor tiene que ser de la misma empresa (JOS-04, sección 4).
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_conductor_id_empresa_id_fkey" FOREIGN KEY ("conductor_id", "empresa_id") REFERENCES "conductor"("id", "empresa_id") ON DELETE RESTRICT ON UPDATE RESTRICT;
