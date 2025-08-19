-- Insertar establecimientos de ejemplo
INSERT INTO establecimientos (id, nombre, descripcion, direccion, ubicacion, coordenadas, telefono, rating, servicios, horario_atencion) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Complejo Deportivo Los Campeones', 'Complejo deportivo premium con canchas certificadas por FIFA.', 'Av. Javier Prado Este 1234', 'San Isidro, Lima', '{"lat": -12.0964, "lng": -77.0428}', '+51 987 654 321', 4.9, ARRAY['Vestuarios con duchas', 'Estacionamiento para 50 vehículos', 'Cafetería', 'Primeros auxilios', 'Seguridad 24h'], 'Lunes a Domingo: 6:00 AM - 11:00 PM'),

('550e8400-e29b-41d4-a716-446655440002', 'Centro Deportivo La Cantera', 'Centro deportivo con múltiples canchas en el corazón de Miraflores.', 'Av. Larco 567', 'Miraflores, Lima', '{"lat": -12.1196, "lng": -77.0282}', '+51 976 543 210', 4.7, ARRAY['Vestuarios', 'Parqueadero', 'Alquiler de balones', 'Hidratación', 'Tienda deportiva'], 'Lunes a Domingo: 7:00 AM - 10:00 PM'),

('550e8400-e29b-41d4-a716-446655440003', 'Elite Sports Center', 'El centro deportivo más exclusivo de Lima con servicios VIP únicos.', 'Av. La Fontana 567', 'La Molina, Lima', '{"lat": -12.0769, "lng": -76.9442}', '+51 910 987 654', 5.0, ARRAY['Vestuarios VIP', 'Catering', 'Transmisión en vivo', 'Masajista', 'Servicio de toallas'], 'Lunes a Domingo: 8:00 AM - 10:00 PM');

-- Insertar canchas de ejemplo
INSERT INTO canchas (id, establecimiento_id, nombre, tipo, precio_por_hora, capacidad, caracteristicas, descripcion, imagen_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cancha Principal', 'Fútbol 11', 180.00, 22, ARRAY['Césped sintético FIFA', 'Iluminación LED', 'Vestuarios premium', 'Graderías VIP'], 'Cancha principal con césped sintético certificado FIFA, ideal para partidos profesionales.', '/placeholder.svg?height=300&width=400'),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Cancha Rápida A', 'Fútbol 7', 120.00, 14, ARRAY['Césped sintético', 'Iluminación nocturna', 'Vestuarios', 'Graderías'], 'Cancha principal con mejor ubicación y servicios premium.', '/placeholder.svg?height=300&width=400'),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Cancha Rápida B', 'Fútbol 7', 100.00, 14, ARRAY['Césped sintético', 'Iluminación básica', 'Vestuarios'], 'Cancha secundaria, excelente relación calidad-precio.', '/placeholder.svg?height=300&width=400'),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Campo VIP Premium', 'Fútbol 11', 250.00, 22, ARRAY['Césped híbrido', 'Iluminación profesional', 'Vestuarios VIP', 'Transmisión en vivo', 'Catering'], 'La experiencia más exclusiva en fútbol con césped híbrido y servicios VIP.', '/placeholder.svg?height=300&width=400');

-- Crear usuario admin de ejemplo (se debe hacer después de que alguien se registre)
-- INSERT INTO profiles (id, email, full_name, role) VALUES 
-- ('admin-uuid-here', 'admin@reservacanchas.com', 'Administrador Sistema', 'admin');
