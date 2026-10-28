-- CreateTable
CREATE TABLE "conductor" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "rut" VARCHAR(10) NOT NULL,
    "telefono" VARCHAR(12) NOT NULL,
    "email" VARCHAR(254),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conductor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conductor_empresa_id_rut_key" ON "conductor"("empresa_id", "rut");

-- CreateIndex
CREATE UNIQUE INDEX "conductor_id_empresa_id_key" ON "conductor"("id", "empresa_id");

-- AddForeignKey
ALTER TABLE "conductor" ADD CONSTRAINT "conductor_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seguridad en Supabase (agregado a mano), igual que en la migración inicial:
-- con RLS activo y sin políticas, la Data API de Supabase no puede leer ni
-- modificar esta tabla con la clave anónima. Prisma, como dueño, no queda sujeto a RLS.
ALTER TABLE "conductor" ENABLE ROW LEVEL SECURITY;
