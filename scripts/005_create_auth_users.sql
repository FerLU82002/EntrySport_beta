-- ============================================
-- SCRIPT 005: Creación de Usuarios de Autenticación
-- Sistema de Reservas de Canchas Deportivas
-- ============================================

-- IMPORTANTE: Este script es principalmente informativo
-- Los usuarios se crean a través de la API de Supabase Auth desde la aplicación

-- ============================================
-- ESTRATEGIA DE AUTENTICACIÓN
-- ============================================

/*
┌─────────────────────────────────────────────────────────────────┐
│ USUARIOS NORMALES (clientes que reservan)                      │
├─────────────────────────────────────────────────────────────────┤
│ 1. Se registran desde /auth/sign-up en la aplicación           │
│ 2. Automáticamente obtienen role: 'usuario'                    │
│ 3. Pueden hacer reservas y ver sus propias reservas            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DUEÑOS (administradores de establecimientos)                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. Se registran IGUAL desde /auth/sign-up                      │
│ 2. Inicialmente obtienen role: 'usuario'                       │
│ 3. TÚ (super admin) cambias manualmente su role a 'dueno'      │
│    en la tabla public.profiles desde Supabase                  │
│ 4. Al iniciar sesión, el sistema detecta role='dueno'          │
│    y los redirige automáticamente a /admin                     │
│ 5. Pueden crear establecimientos, zonas y gestionar reservas   │
└─────────────────────────────────────────────────────────────────┘
*/

-- ============================================
-- CÓMO CREAR USUARIOS DE PRUEBA
-- ============================================

-- OPCIÓN 1: Desde la aplicación (RECOMENDADO para producción)
-- 1. Ve a /auth/sign-up
-- 2. Completa el formulario de registro
-- 3. El trigger 'on_auth_user_created' creará automáticamente el perfil

-- OPCIÓN 2: Desde Supabase Dashboard (para desarrollo)
-- 1. Ve a Authentication > Users en Supabase Dashboard
-- 2. Click en "Add user" > "Create new user"
-- 3. Ingresa:
--    - Email: usuario@demo.com
--    - Password: Demo123456!
--    - Auto Confirm User: YES
--    - User Metadata (opcional):
--      {
--        "nombre": "Juan Pérez",
--        "telefono": "987654321",
--        "role": "usuario"
--      }

-- ============================================
-- CÓMO CONVERTIR UN USUARIO EN DUEÑO
-- ============================================

-- Después de que un usuario se registre, puedes convertirlo en dueño así:

-- 1. Encuentra el UUID del usuario
SELECT id, email, nombre, role 
FROM public.profiles 
WHERE email = 'dueno@demo.com';

-- 2. Cambia su role a 'dueno'
-- REEMPLAZA '11111111-1111-1111-1111-111111111111' con el UUID real
UPDATE public.profiles 
SET role = 'dueno', updated_at = NOW()
WHERE email = 'dueno@demo.com';

-- Verificar el cambio
SELECT id, email, nombre, role 
FROM public.profiles 
WHERE email = 'dueno@demo.com';

-- ============================================
-- CREAR USUARIOS DE DEMOSTRACIÓN MANUALMENTE
-- ============================================

-- Si necesitas crear usuarios de prueba directamente en auth.users
-- (requiere privilegios de servicio, usar con precaución)

-- Opción A: Crear desde SQL (solo funciona con service_role key)
/*
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  aud,
  role
)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'usuario@demo.com',
    crypt('Demo123456!', gen_salt('bf')), -- Requiere extensión pgcrypto
    NOW(),
    '{"nombre": "Juan Pérez", "telefono": "987654321", "role": "usuario"}'::jsonb,
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'dueno@demo.com',
    crypt('Demo123456!', gen_salt('bf')),
    NOW(),
    '{"nombre": "Carlos Rodríguez", "telefono": "912345678", "role": "dueno"}'::jsonb,
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;
*/

-- Opción B: Usar la función de Supabase Admin API (RECOMENDADO)
-- Ver: lib/supabase/create-demo-users.ts

-- ============================================
-- VERIFICAR USUARIOS EXISTENTES
-- ============================================

-- Ver todos los usuarios registrados
SELECT 
  p.id,
  p.email,
  p.nombre,
  p.telefono,
  p.role,
  p.created_at,
  CASE 
    WHEN p.role = 'dueno' THEN '🏢 Dueño (Administrador)'
    WHEN p.role = 'usuario' THEN '👤 Usuario (Cliente)'
    ELSE '❓ Desconocido'
  END as tipo_usuario
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Ver usuarios que son dueños
SELECT 
  p.id,
  p.email,
  p.nombre,
  COUNT(e.id) as total_establecimientos
FROM public.profiles p
LEFT JOIN public.establecimientos e ON e.owner_id = p.id
WHERE p.role = 'dueno'
GROUP BY p.id, p.email, p.nombre
ORDER BY p.email;

-- Ver usuarios normales con sus reservas
SELECT 
  p.id,
  p.email,
  p.nombre,
  COUNT(r.id) as total_reservas
FROM public.profiles p
LEFT JOIN public.reservas r ON r.user_id = p.id
WHERE p.role = 'usuario'
GROUP BY p.id, p.email, p.nombre
ORDER BY p.email;

-- ============================================
-- COMANDOS ÚTILES DE ADMINISTRACIÓN
-- ============================================

-- Promover usuario a dueño
-- UPDATE public.profiles SET role = 'dueno' WHERE email = 'correo@ejemplo.com';

-- Degradar dueño a usuario
-- UPDATE public.profiles SET role = 'usuario' WHERE email = 'correo@ejemplo.com';

-- Eliminar usuario completamente (también elimina en auth.users por CASCADE)
-- DELETE FROM public.profiles WHERE email = 'correo@ejemplo.com';

-- Ver todos los roles disponibles
SELECT DISTINCT role FROM public.profiles;

