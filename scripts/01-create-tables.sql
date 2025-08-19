-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de establecimientos
CREATE TABLE public.establecimientos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  coordenadas JSONB NOT NULL, -- {lat: number, lng: number}
  telefono TEXT,
  email TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  servicios TEXT[] DEFAULT '{}',
  horario_atencion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de canchas/zonas
CREATE TABLE public.canchas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  establecimiento_id UUID REFERENCES establecimientos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Fútbol 11', 'Fútbol 7', etc.
  precio_por_hora DECIMAL(10,2) NOT NULL,
  capacidad INTEGER NOT NULL,
  caracteristicas TEXT[] DEFAULT '{}',
  descripcion TEXT,
  imagen_url TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de horarios bloqueados/reservados
CREATE TABLE public.horarios_bloqueados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cancha_id UUID REFERENCES canchas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo TEXT DEFAULT 'reservado' CHECK (tipo IN ('reservado', 'mantenimiento', 'bloqueado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE public.reservas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cancha_id UUID REFERENCES canchas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'pending' CHECK (estado IN ('pending', 'paid', 'cancelled', 'completed')),
  metodo_pago TEXT,
  transaction_id TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE public.pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL, -- 'card', 'yape', 'plin', etc.
  estado TEXT DEFAULT 'pending' CHECK (estado IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recompensas/puntos
CREATE TABLE public.recompensas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  puntos INTEGER DEFAULT 0,
  nivel TEXT DEFAULT 'bronce' CHECK (nivel IN ('bronce', 'plata', 'oro', 'platino')),
  reservas_completadas INTEGER DEFAULT 0,
  descuento_disponible DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas de uso
CREATE TABLE public.metricas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE DEFAULT CURRENT_DATE,
  visitas_totales INTEGER DEFAULT 0,
  reservas_creadas INTEGER DEFAULT 0,
  reservas_completadas INTEGER DEFAULT 0,
  ingresos_totales DECIMAL(10,2) DEFAULT 0,
  usuarios_nuevos INTEGER DEFAULT 0,
  canchas_mas_populares JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_reservas_user_id ON reservas(user_id);
CREATE INDEX idx_reservas_cancha_id ON reservas(cancha_id);
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_horarios_bloqueados_cancha_fecha ON horarios_bloqueados(cancha_id, fecha);
CREATE INDEX idx_canchas_establecimiento ON canchas(establecimiento_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establecimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para establecimientos (públicos para lectura)
CREATE POLICY "Todos pueden ver establecimientos activos" ON establecimientos
  FOR SELECT USING (activo = true);

CREATE POLICY "Solo admins pueden modificar establecimientos" ON establecimientos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para canchas (públicas para lectura)
CREATE POLICY "Todos pueden ver canchas activas" ON canchas
  FOR SELECT USING (activa = true);

CREATE POLICY "Solo admins pueden modificar canchas" ON canchas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para reservas
CREATE POLICY "Usuarios pueden ver sus propias reservas" ON reservas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear reservas" ON reservas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus reservas pendientes" ON reservas
  FOR UPDATE USING (auth.uid() = user_id AND estado = 'pending');

CREATE POLICY "Admins pueden ver todas las reservas" ON reservas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para pagos
CREATE POLICY "Usuarios pueden ver sus propios pagos" ON pagos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservas 
      WHERE reservas.id = pagos.reserva_id AND reservas.user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden modificar pagos" ON pagos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para recompensas
CREATE POLICY "Usuarios pueden ver sus propias recompensas" ON recompensas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede actualizar recompensas" ON recompensas
  FOR ALL USING (true); -- Se manejará por funciones

-- Políticas para métricas (solo admins)
CREATE POLICY "Solo admins pueden ver métricas" ON metricas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
