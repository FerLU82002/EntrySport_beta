-- Script para crear usuarios de autenticación en Supabase
-- IMPORTANTE: Este script debe ejecutarse desde el panel de Supabase SQL Editor
-- ya que requiere permisos especiales para insertar en auth.users

-- Nota: En producción, los usuarios se crean a través de la API de Supabase Auth
-- Este script es solo para propósitos de desarrollo/prueba

-- Para crear usuarios de prueba, usa el panel de Supabase Authentication
-- o ejecuta este código desde una función de servidor:

/*
Opción 1: Crear usuarios desde el panel de Supabase
1. Ve a Authentication > Users en tu proyecto de Supabase
2. Click en "Add user" > "Create new user"
3. Crea estos usuarios:
   - Email: usuario@gmail.com, Password: demo123, User ID: user-demo-123
   - Email: admin@gmail.com, Password: demo123, User ID: admin-demo-456

Opción 2: Usar la API de Supabase desde el código
Ver el archivo: lib/supabase/create-demo-users.ts
*/

-- Verificar que los usuarios existan en auth.users
-- (Solo lectura, no podemos insertar directamente aquí)
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email IN ('usuario@gmail.com', 'admin@gmail.com')
ORDER BY email;
