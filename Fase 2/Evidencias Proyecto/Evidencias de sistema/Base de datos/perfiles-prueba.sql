-- Perfiles de las cuentas de prueba (SIM-02).
-- Une cada usuario de Supabase Auth con su empresa ficticia del seed (Aplicación/prisma/seed.ts),
-- usando el mismo id, como pide JOS-02 (sección 7).
--
-- Se ejecuta en Supabase > SQL Editor, después de:
--   1. npm run db:deploy y npm run db:seed, desde Aplicación (crean las empresas ficticias).
--   2. Crear los dos usuarios en Supabase > Authentication > Users > Add user,
--      marcando "Auto Confirm User".
--
-- Antes de ejecutarlo, reemplazar CORREO-EMPRESA-A y CORREO-EMPRESA-B por los correos
-- de esas cuentas. Las contraseñas no van aquí ni en ningún archivo del repositorio.
-- Se puede ejecutar varias veces: si el perfil ya existe, solo actualiza sus datos.

insert into usuario (id, empresa_id, nombre, email, rol)
select
  u.id,
  c.empresa_id::uuid,
  c.nombre,
  lower(u.email),
  'admin'::rol
from auth.users u
join (
  values
    ('CORREO-EMPRESA-A', 'a0000000-0000-4000-8000-000000000001', 'Administrador Empresa A'),
    ('CORREO-EMPRESA-B', 'b0000000-0000-4000-8000-000000000002', 'Administrador Empresa B')
) as c (email, empresa_id, nombre) on lower(u.email) = lower(c.email)
on conflict (id) do update
  set empresa_id = excluded.empresa_id,
      nombre = excluded.nombre,
      email = excluded.email;

-- Comprobación: deben aparecer las dos cuentas, cada una con su empresa.
select u.email, e.nombre as empresa
from usuario u
join empresa e on e.id = u.empresa_id
order by e.nombre;
