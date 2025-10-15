-- Script para crear datos de prueba: 1 usuario, 1 administrador con establecimiento y 2 canchas, y reservas

-- Primero, necesitamos crear los usuarios en auth.users (esto normalmente se hace a través de Supabase Auth)
-- Para propósitos de prueba, asumimos que los usuarios ya existen en auth.users con estos IDs:
-- Usuario: 'user-demo-123' (usuario@gmail.com)
-- Admin: 'admin-demo-456' (admin@gmail.com)

-- Insertar perfiles de usuario
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES 
  ('user-demo-123', 'usuario@gmail.com', 'usuario', NOW(), NOW()),
  ('admin-demo-456', 'admin@gmail.com', 'dueno', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, role = EXCLUDED.role, updated_at = NOW();

-- Crear establecimiento para el administrador
INSERT INTO public.establecimientos (
  id,
  owner_id,
  nombre,
  descripcion,
  direccion,
  departamento,
  provincia,
  distrito,
  telefono,
  ubicacion_lat,
  ubicacion_lng,
  imagen_url,
  created_at,
  updated_at
)
VALUES (
  'estab-demo-001',
  'admin-demo-456',
  'Complejo Deportivo Los Campeones',
  'Moderno complejo deportivo con canchas sintéticas de última generación. Contamos con iluminación LED, vestuarios, estacionamiento y cafetería.',
  'Av. Universitaria 1234, Pillco Marca',
  'Huánuco',
  'Huánuco',
  'Pillco Marca',
  '+51 962 123 456',
  -9.9306,
  -76.2422,
  '/modern-football-field.jpg',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  direccion = EXCLUDED.direccion,
  updated_at = NOW();

-- Crear 2 canchas para el establecimiento
INSERT INTO public.canchas (
  id,
  establecimiento_id,
  nombre,
  tipo,
  precio_hora,
  capacidad,
  disponible,
  servicios,
  imagen_url,
  created_at,
  updated_at
)
VALUES 
  (
    'cancha-demo-001',
    'estab-demo-001',
    'Cancha Principal - Zona A',
    'Fútbol',
    80.00,
    22,
    true,
    ARRAY['Iluminación LED', 'Vestuarios', 'Estacionamiento', 'Cafetería', 'Gradas'],
    '/modern-football-field.jpg',
    NOW(),
    NOW()
  ),
  (
    'cancha-demo-002',
    'estab-demo-001',
    'Cancha Secundaria - Zona B',
    'Fútbol',
    60.00,
    14,
    true,
    ARRAY['Iluminación LED', 'Vestuarios', 'Estacionamiento'],
    '/small-soccer-field.jpg',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  nombre = EXCLUDED.nombre,
  precio_hora = EXCLUDED.precio_hora,
  disponible = EXCLUDED.disponible,
  updated_at = NOW();

-- Crear reservas del usuario en las canchas del administrador
INSERT INTO public.reservas (
  id,
  user_id,
  cancha_id,
  establecimiento_id,
  fecha,
  hora_inicio,
  hora_fin,
  estado,
  metodo_pago,
  precio_total,
  notas,
  created_at,
  updated_at
)
VALUES 
  -- Reserva confirmada en Cancha Principal
  (
    'reserva-demo-001',
    'user-demo-123',
    'cancha-demo-001',
    'estab-demo-001',
    CURRENT_DATE + INTERVAL '2 days',
    '16:00:00',
    '18:00:00',
    'confirmada',
    'Yape',
    160.00,
    'Partido amistoso con amigos',
    NOW(),
    NOW()
  ),
  -- Reserva pendiente en Cancha Secundaria
  (
    'reserva-demo-002',
    'user-demo-123',
    'cancha-demo-002',
    'estab-demo-001',
    CURRENT_DATE + INTERVAL '5 days',
    '10:00:00',
    '12:00:00',
    'pendiente',
    'Efectivo',
    120.00,
    'Entrenamiento matutino',
    NOW(),
    NOW()
  ),
  -- Reserva pasada completada
  (
    'reserva-demo-003',
    'user-demo-123',
    'cancha-demo-001',
    'estab-demo-001',
    CURRENT_DATE - INTERVAL '3 days',
    '18:00:00',
    '20:00:00',
    'completada',
    'Transferencia',
    160.00,
    'Partido de campeonato',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  -- Otra reserva pasada completada (para contar visitas)
  (
    'reserva-demo-004',
    'user-demo-123',
    'cancha-demo-002',
    'estab-demo-001',
    CURRENT_DATE - INTERVAL '10 days',
    '14:00:00',
    '16:00:00',
    'completada',
    'Yape',
    120.00,
    'Práctica semanal',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO UPDATE 
SET 
  estado = EXCLUDED.estado,
  updated_at = NOW();

-- Crear algunos bloqueos de ejemplo para el calendario
INSERT INTO public.bloqueos (
  id,
  cancha_id,
  fecha,
  hora_inicio,
  hora_fin,
  motivo,
  descripcion,
  created_at
)
VALUES 
  (
    'bloqueo-demo-001',
    'cancha-demo-001',
    CURRENT_DATE + INTERVAL '7 days',
    '08:00:00',
    '12:00:00',
    'mantenimiento',
    'Mantenimiento preventivo del césped sintético',
    NOW()
  ),
  (
    'bloqueo-demo-002',
    'cancha-demo-002',
    CURRENT_DATE + INTERVAL '4 days',
    '20:00:00',
    '22:00:00',
    'evento',
    'Evento privado - Torneo interno',
    NOW()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  motivo = EXCLUDED.motivo,
  descripcion = EXCLUDED.descripcion;

-- Verificar los datos insertados
SELECT 'Perfiles creados:' as info, COUNT(*) as total FROM public.profiles WHERE id IN ('user-demo-123', 'admin-demo-456');
SELECT 'Establecimientos creados:' as info, COUNT(*) as total FROM public.establecimientos WHERE id = 'estab-demo-001';
SELECT 'Canchas creadas:' as info, COUNT(*) as total FROM public.canchas WHERE establecimiento_id = 'estab-demo-001';
SELECT 'Reservas creadas:' as info, COUNT(*) as total FROM public.reservas WHERE user_id = 'user-demo-123';
SELECT 'Bloqueos creados:' as info, COUNT(*) as total FROM public.bloqueos WHERE cancha_id IN ('cancha-demo-001', 'cancha-demo-002');
