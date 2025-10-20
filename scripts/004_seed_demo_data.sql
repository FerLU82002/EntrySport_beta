-- ============================================
-- SCRIPT 004: Datos de Demostración
-- Sistema de Reservas de Canchas Deportivas
-- ============================================

-- ⚠️ IMPORTANTE: PRIMERO debes crear los usuarios en auth.users
-- Hay 2 opciones:

-- OPCIÓN 1 (RECOMENDADA): Crear desde Supabase Dashboard
--   1. Ve a Authentication > Users
--   2. Click "Add user" > "Create new user"
--   3. Crea usuario: usuario@demo.com / Password: Demo123456!
--      - User Metadata: {"nombre": "Juan Pérez", "telefono": "987654321", "role": "usuario"}
--   4. Crea dueño: dueno@demo.com / Password: Demo123456!
--      - User Metadata: {"nombre": "Carlos Rodríguez", "telefono": "912345678", "role": "dueno"}
--   5. COPIA los UUIDs generados y reemplázalos en este script

-- OPCIÓN 2: Registrarse desde la aplicación
--   1. Ve a /auth/sign-up y registra ambos usuarios
--   2. Para el dueño, después ejecuta:
--      UPDATE public.profiles SET role = 'dueno' WHERE email = 'dueno@demo.com';

-- ============================================
-- VERIFICAR QUE LOS USUARIOS EXISTAN
-- ============================================

-- Este query muestra los usuarios que existen actualmente
DO $$
DECLARE
  usuario_count INTEGER;
  dueno_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO usuario_count FROM auth.users WHERE email = 'usuario@demo.com';
  SELECT COUNT(*) INTO dueno_count FROM auth.users WHERE email = 'dueno@demo.com';
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Verificando usuarios de demostración...';
  RAISE NOTICE '==============================================';
  
  IF usuario_count = 0 THEN
    RAISE WARNING '⚠️  Usuario "usuario@demo.com" NO existe en auth.users';
    RAISE NOTICE 'Créalo desde: Authentication > Users en Supabase Dashboard';
  ELSE
    RAISE NOTICE '✅ Usuario "usuario@demo.com" existe';
  END IF;
  
  IF dueno_count = 0 THEN
    RAISE WARNING '⚠️  Usuario "dueno@demo.com" NO existe en auth.users';
    RAISE NOTICE 'Créalo desde: Authentication > Users en Supabase Dashboard';
  ELSE
    RAISE NOTICE '✅ Usuario "dueno@demo.com" existe';
  END IF;
  
  IF usuario_count = 0 OR dueno_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Pasos para crear usuarios:';
    RAISE NOTICE '1. Ve a Authentication > Users en Supabase';
    RAISE NOTICE '2. Click "Add user" > "Create new user"';
    RAISE NOTICE '3. Email: usuario@demo.com / Password: Demo123456!';
    RAISE NOTICE '4. Email: dueno@demo.com / Password: Demo123456!';
    RAISE NOTICE '5. Vuelve a ejecutar este script';
    RAISE NOTICE '';
    RAISE EXCEPTION 'Faltan usuarios. Por favor créalos primero.';
  END IF;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Continuando con la inserción de datos...';
  RAISE NOTICE '==============================================';
END $$;

-- ============================================
-- PERFILES DE USUARIO
-- ============================================

-- Obtener los IDs de los usuarios desde auth.users y crear/actualizar perfiles
INSERT INTO public.profiles (id, email, nombre, telefono, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nombre', 'Juan Pérez'),
  COALESCE(u.raw_user_meta_data->>'telefono', '987654321'),
  'usuario',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'usuario@demo.com'
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  updated_at = NOW();

INSERT INTO public.profiles (id, email, nombre, telefono, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nombre', 'Carlos Rodríguez'),
  COALESCE(u.raw_user_meta_data->>'telefono', '912345678'),
  'dueno',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'dueno@demo.com'
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  role = 'dueno', -- Asegurar que sea dueño
  updated_at = NOW();

-- ============================================
-- ESTABLECIMIENTOS
-- ============================================

-- Insertar establecimiento usando el ID real del dueño desde auth.users
INSERT INTO public.establecimientos (
  id,
  owner_id,
  nombre,
  descripcion,
  direccion,
  telefono,
  horario_atencion,
  servicios,
  ubicacion,
  departamento,
  distrito,
  ubicacion_lat,
  ubicacion_lng,
  foto,
  created_at,
  updated_at
)
SELECT
  'est-demo-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  u.id, -- ID real del usuario desde auth.users
  'Complejo Deportivo Los Campeones',
  'Moderno complejo deportivo con canchas sintéticas de última generación. Contamos con iluminación LED, vestuarios, estacionamiento y cafetería.',
  'Av. Universitaria 1234, Pillco Marca',
  '+51 962 123 456',
  'Lunes a Domingo: 6:00 AM - 11:00 PM',
  ARRAY['Iluminación LED', 'Vestuarios', 'Estacionamiento', 'Cafetería', 'Gradas', 'Wi-Fi'],
  'Huánuco - Pillco Marca',
  'Huánuco',
  'Pillco Marca',
  -9.9306,
  -76.2422,
  '/images/complejo-campeones.jpg',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'dueno@demo.com'
ON CONFLICT (id) DO UPDATE 
SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  updated_at = NOW();

-- Guardar el ID del establecimiento para usarlo después
DO $$
DECLARE
  establecimiento_id_var TEXT;
BEGIN
  SELECT id INTO establecimiento_id_var 
  FROM public.establecimientos 
  WHERE nombre = 'Complejo Deportivo Los Campeones' 
  LIMIT 1;
  
  -- Almacenar temporalmente en una variable de sesión
  PERFORM set_config('demo.establecimiento_id', establecimiento_id_var, false);
  
  RAISE NOTICE 'Establecimiento ID: %', establecimiento_id_var;
END $$;

-- ============================================
-- ZONAS (antes "canchas")
-- ============================================

-- Insertar zonas usando el ID del establecimiento creado anteriormente
INSERT INTO public.zonas (
  id,
  establecimiento_id,
  nombre,
  tipo,
  capacidad,
  precio,
  descripcion,
  caracteristicas,
  disponible,
  created_at,
  updated_at
)
SELECT
  'zona-demo-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || seq,
  e.id,
  zona_data.nombre,
  zona_data.tipo,
  zona_data.capacidad,
  zona_data.precio,
  zona_data.descripcion,
  zona_data.caracteristicas,
  true,
  NOW(),
  NOW()
FROM public.establecimientos e,
LATERAL (VALUES
  (1, 'Zona A - Fútbol 11', 'Fútbol 11', 22, 80.00, 
   'Cancha de fútbol profesional con césped sintético de última generación',
   ARRAY['Césped sintético', 'Iluminación LED', 'Gradas para 100 personas', 'Tablero electrónico']),
  (2, 'Zona B - Fútbol 7', 'Fútbol 7', 14, 60.00,
   'Cancha de fútbol 7 ideal para partidos amistosos y entrenamientos',
   ARRAY['Césped sintético', 'Iluminación LED', 'Arcos reglamentarios']),
  (3, 'Zona C - Fútbol 5', 'Fútbol 5', 10, 50.00,
   'Cancha de fútbol 5 techada, perfecta para todo clima',
   ARRAY['Techada', 'Piso de cemento pulido', 'Iluminación LED', 'Malla de protección'])
) AS zona_data(seq, nombre, tipo, capacidad, precio, descripcion, caracteristicas)
WHERE e.nombre = 'Complejo Deportivo Los Campeones'
ON CONFLICT (id) DO UPDATE 
SET 
  nombre = EXCLUDED.nombre,
  precio = EXCLUDED.precio,
  disponible = EXCLUDED.disponible,
  updated_at = NOW();

-- ============================================
-- RESERVAS
-- ============================================

-- Insertar reservas usando IDs reales de usuarios y zonas
INSERT INTO public.reservas (
  id,
  user_id,
  usuario_nombre,
  usuario_email,
  usuario_telefono,
  cancha_id,
  zona_id,
  establecimiento_id,
  fecha,
  horarios,
  precio,
  metodo_pago,
  estado,
  codigo_verificacion,
  establecimiento,
  cancha,
  zona,
  direccion,
  telefono,
  fecha_creacion,
  updated_at
)
SELECT
  'res-demo-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || reserva_data.seq,
  u.id,
  p.nombre,
  p.email,
  p.telefono,
  1, -- deprecated
  z.id,
  e.id,
  reserva_data.fecha,
  reserva_data.horarios,
  reserva_data.precio,
  reserva_data.metodo_pago,
  reserva_data.estado,
  reserva_data.codigo,
  e.nombre,
  'Cancha ' || reserva_data.cancha_nombre,
  z.nombre,
  e.direccion,
  e.telefono,
  reserva_data.fecha_creacion,
  reserva_data.fecha_creacion
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
CROSS JOIN public.establecimientos e
CROSS JOIN LATERAL (
  SELECT * FROM public.zonas 
  WHERE establecimiento_id = e.id 
  ORDER BY nombre 
  LIMIT 3
) z
CROSS JOIN LATERAL (VALUES
  (1, CURRENT_DATE, ARRAY['16:00', '17:00'], 160.00, 'yape', 'confirmada', '123456', 
   'Principal', NOW(), z.nombre = 'Zona A - Fútbol 11'),
  (2, CURRENT_DATE + INTERVAL '1 day', ARRAY['10:00', '11:00'], 120.00, 'efectivo', 'pendiente', '234567',
   'Secundaria', NOW(), z.nombre = 'Zona B - Fútbol 7'),
  (3, CURRENT_DATE - INTERVAL '3 days', ARRAY['18:00', '19:00', '20:00'], 240.00, 'tarjeta', 'completada', '345678',
   'Principal', NOW() - INTERVAL '3 days', z.nombre = 'Zona A - Fútbol 11'),
  (4, CURRENT_DATE + INTERVAL '5 days', ARRAY['14:00', '15:00'], 100.00, 'yape', 'cancelada', '456789',
   'Techada', NOW() - INTERVAL '1 day', z.nombre = 'Zona C - Fútbol 5')
) AS reserva_data(seq, fecha, horarios, precio, metodo_pago, estado, codigo, cancha_nombre, fecha_creacion, zona_match)
WHERE u.email = 'usuario@demo.com'
  AND e.nombre = 'Complejo Deportivo Los Campeones'
  AND reserva_data.zona_match = true
ON CONFLICT (id) DO UPDATE 
SET 
  estado = EXCLUDED.estado,
  updated_at = NOW();

-- Versión alternativa más simple si la anterior da error
-- Crear reservas de una en una
DO $$
DECLARE
  usuario_id UUID;
  establecimiento_id_var TEXT;
  zona_a_id TEXT;
  zona_b_id TEXT;
  zona_c_id TEXT;
BEGIN
  -- Obtener IDs
  SELECT id INTO usuario_id FROM auth.users WHERE email = 'usuario@demo.com';
  SELECT id INTO establecimiento_id_var FROM public.establecimientos WHERE nombre = 'Complejo Deportivo Los Campeones';
  SELECT id INTO zona_a_id FROM public.zonas WHERE establecimiento_id = establecimiento_id_var AND nombre LIKE '%Fútbol 11%' LIMIT 1;
  SELECT id INTO zona_b_id FROM public.zonas WHERE establecimiento_id = establecimiento_id_var AND nombre LIKE '%Fútbol 7%' LIMIT 1;
  SELECT id INTO zona_c_id FROM public.zonas WHERE establecimiento_id = establecimiento_id_var AND nombre LIKE '%Fútbol 5%' LIMIT 1;
  
  -- Reserva 1: Confirmada para hoy
  INSERT INTO public.reservas (
    id, user_id, usuario_nombre, usuario_email, usuario_telefono,
    cancha_id, zona_id, establecimiento_id,
    fecha, horarios, precio, metodo_pago, estado, codigo_verificacion,
    establecimiento, cancha, zona, direccion, telefono,
    fecha_creacion, updated_at
  ) VALUES (
    'res-demo-hoy-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    usuario_id, 'Juan Pérez', 'usuario@demo.com', '987654321',
    1, zona_a_id, establecimiento_id_var,
    CURRENT_DATE, ARRAY['16:00', '17:00'], 160.00, 'yape', 'confirmada', '123456',
    'Complejo Deportivo Los Campeones', 'Cancha Principal', 'Zona A - Fútbol 11',
    'Av. Universitaria 1234, Pillco Marca', '+51 962 123 456',
    NOW(), NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Reserva 2: Pendiente para mañana
  INSERT INTO public.reservas (
    id, user_id, usuario_nombre, usuario_email, usuario_telefono,
    cancha_id, zona_id, establecimiento_id,
    fecha, horarios, precio, metodo_pago, estado, codigo_verificacion,
    establecimiento, cancha, zona, direccion, telefono,
    fecha_creacion, updated_at
  ) VALUES (
    'res-demo-manana-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    usuario_id, 'Juan Pérez', 'usuario@demo.com', '987654321',
    1, zona_b_id, establecimiento_id_var,
    CURRENT_DATE + INTERVAL '1 day', ARRAY['10:00', '11:00'], 120.00, 'efectivo', 'pendiente', '234567',
    'Complejo Deportivo Los Campeones', 'Cancha Secundaria', 'Zona B - Fútbol 7',
    'Av. Universitaria 1234, Pillco Marca', '+51 962 123 456',
    NOW(), NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Reserva 3: Completada (hace 3 días)
  INSERT INTO public.reservas (
    id, user_id, usuario_nombre, usuario_email, usuario_telefono,
    cancha_id, zona_id, establecimiento_id,
    fecha, horarios, precio, metodo_pago, estado, codigo_verificacion,
    establecimiento, cancha, zona, direccion, telefono,
    fecha_creacion, updated_at
  ) VALUES (
    'res-demo-pasada-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    usuario_id, 'Juan Pérez', 'usuario@demo.com', '987654321',
    1, zona_a_id, establecimiento_id_var,
    CURRENT_DATE - INTERVAL '3 days', ARRAY['18:00', '19:00', '20:00'], 240.00, 'tarjeta', 'completada', '345678',
    'Complejo Deportivo Los Campeones', 'Cancha Principal', 'Zona A - Fútbol 11',
    'Av. Universitaria 1234, Pillco Marca', '+51 962 123 456',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Reserva 4: Cancelada
  INSERT INTO public.reservas (
    id, user_id, usuario_nombre, usuario_email, usuario_telefono,
    cancha_id, zona_id, establecimiento_id,
    fecha, horarios, precio, metodo_pago, estado, codigo_verificacion,
    establecimiento, cancha, zona, direccion, telefono,
    fecha_creacion, updated_at
  ) VALUES (
    'res-demo-cancelada-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    usuario_id, 'Juan Pérez', 'usuario@demo.com', '987654321',
    1, zona_c_id, establecimiento_id_var,
    CURRENT_DATE + INTERVAL '5 days', ARRAY['14:00', '15:00'], 100.00, 'yape', 'cancelada', '456789',
    'Complejo Deportivo Los Campeones', 'Cancha Techada', 'Zona C - Fútbol 5',
    'Av. Universitaria 1234, Pillco Marca', '+51 962 123 456',
    NOW() - INTERVAL '1 day', NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✅ Reservas creadas exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error al crear reservas: %', SQLERRM;
END $$;

-- ============================================
-- BLOQUEOS
-- ============================================

-- Insertar bloqueos usando IDs reales de zonas
DO $$
DECLARE
  zona_a_id TEXT;
  zona_b_id TEXT;
BEGIN
  SELECT id INTO zona_a_id FROM public.zonas WHERE nombre LIKE '%Fútbol 11%' LIMIT 1;
  SELECT id INTO zona_b_id FROM public.zonas WHERE nombre LIKE '%Fútbol 7%' LIMIT 1;
  
  INSERT INTO public.bloqueos (
    id, zona_id, zona_nombre, fecha, hora_inicio, hora_fin, motivo, descripcion, created_at
  ) VALUES (
    'bloq-demo-mantenimiento-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    zona_a_id,
    'Zona A - Fútbol 11',
    CURRENT_DATE + INTERVAL '7 days',
    '08:00',
    '12:00',
    'mantenimiento',
    'Mantenimiento preventivo del césped sintético',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.bloqueos (
    id, zona_id, zona_nombre, fecha, hora_inicio, hora_fin, motivo, descripcion, created_at
  ) VALUES (
    'bloq-demo-evento-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    zona_b_id,
    'Zona B - Fútbol 7',
    CURRENT_DATE + INTERVAL '4 days',
    '20:00',
    '22:00',
    'evento',
    'Torneo interno de la empresa',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✅ Bloqueos creados exitosamente';
END $$;

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================

SELECT '==================================================';
SELECT '          VERIFICACIÓN DE DATOS DEMO              ';
SELECT '==================================================';

SELECT 'Perfiles creados:' as info, COUNT(*) as total FROM public.profiles;
SELECT 'Establecimientos creados:' as info, COUNT(*) as total FROM public.establecimientos;
SELECT 'Zonas creadas:' as info, COUNT(*) as total FROM public.zonas;
SELECT 'Reservas creadas:' as info, COUNT(*) as total FROM public.reservas;
SELECT 'Bloqueos creados:' as info, COUNT(*) as total FROM public.bloqueos;

SELECT '';
SELECT 'Detalle de usuarios:';
SELECT email, nombre, role FROM public.profiles ORDER BY role DESC, email;

SELECT '';
SELECT 'Detalle de establecimientos y zonas:';
SELECT 
  e.nombre as establecimiento,
  COUNT(z.id) as total_zonas
FROM public.establecimientos e
LEFT JOIN public.zonas z ON z.establecimiento_id = e.id
GROUP BY e.id, e.nombre;

SELECT '';
SELECT 'Detalle de reservas por estado:';
SELECT 
  estado,
  COUNT(*) as cantidad,
  SUM(precio) as total_ingresos
FROM public.reservas
GROUP BY estado
ORDER BY 
  CASE estado
    WHEN 'pendiente' THEN 1
    WHEN 'confirmada' THEN 2
    WHEN 'completada' THEN 3
    WHEN 'cancelada' THEN 4
  END;

SELECT '';
SELECT '==================================================';
SELECT '               DATOS DEMO COMPLETOS                ';
SELECT '==================================================';
SELECT '';
SELECT '✅ Credenciales de prueba:';
SELECT '   Usuario: usuario@demo.com / Password: Demo123456!';
SELECT '   Dueño:   dueno@demo.com / Password: Demo123456!';
SELECT '';
SELECT '📋 Próximos pasos:';
SELECT '   1. Ve a /login en tu aplicación';
SELECT '   2. Inicia sesión con cualquiera de los usuarios';
SELECT '   3. El sistema te redirigirá según tu rol';
SELECT '';
SELECT '==================================================';


