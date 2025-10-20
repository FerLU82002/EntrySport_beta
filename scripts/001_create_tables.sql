-- ============================================
-- SCRIPT 001: Creación de Tablas Base
-- Sistema de Reservas de Canchas Deportivas
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  role TEXT NOT NULL CHECK (role IN ('usuario', 'dueno')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de establecimientos deportivos (solo para dueños)
CREATE TABLE IF NOT EXISTS public.establecimientos (
  id TEXT PRIMARY KEY, -- Formato: "est-1234567890"
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT NOT NULL,
  telefono TEXT,
  horario_atencion TEXT,
  servicios TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Ubicación jerárquica (Departamento - Distrito)
  ubicacion TEXT NOT NULL, -- Formato: "Lima - San Isidro"
  departamento TEXT NOT NULL,
  distrito TEXT NOT NULL,
  -- Coordenadas geográficas
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  -- Imagen del establecimiento
  foto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de zonas/canchas (pertenecen a un establecimiento)
CREATE TABLE IF NOT EXISTS public.zonas (
  id TEXT PRIMARY KEY,
  establecimiento_id TEXT NOT NULL REFERENCES public.establecimientos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Fútbol 11', 'Fútbol 7', 'Fútbol 5', 'Básquet', 'Vóley', 'Tenis'
  capacidad INTEGER NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  caracteristicas TEXT[] DEFAULT ARRAY[]::TEXT[],
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de bloqueos de horarios (mantenimiento, eventos, etc.)
CREATE TABLE IF NOT EXISTS public.bloqueos (
  id TEXT PRIMARY KEY,
  zona_id TEXT NOT NULL REFERENCES public.zonas(id) ON DELETE CASCADE,
  zona_nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TEXT NOT NULL, -- Formato: "10:00"
  hora_fin TEXT NOT NULL,    -- Formato: "12:00"
  motivo TEXT NOT NULL CHECK (motivo IN ('mantenimiento', 'evento', 'otro')),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas CON TODOS LOS CAMPOS ACTUALES
CREATE TABLE IF NOT EXISTS public.reservas (
  id TEXT PRIMARY KEY,
  -- Información del usuario
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usuario_nombre TEXT NOT NULL,
  usuario_email TEXT NOT NULL,
  usuario_telefono TEXT NOT NULL,
  -- Referencias a cancha y zona
  cancha_id INTEGER, -- Deprecated, se mantiene por compatibilidad
  zona_id TEXT NOT NULL REFERENCES public.zonas(id) ON DELETE CASCADE,
  establecimiento_id TEXT REFERENCES public.establecimientos(id) ON DELETE CASCADE,
  -- Información de la reserva
  fecha DATE NOT NULL,
  horarios TEXT[] NOT NULL, -- Array de horarios: ["10:00", "11:00", "12:00"]
  precio DECIMAL(10, 2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('tarjeta', 'yape', 'efectivo')),
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')) DEFAULT 'pendiente',
  -- Código de verificación para entrada
  codigo_verificacion TEXT NOT NULL,
  -- Información duplicada para facilitar consultas (desnormalización)
  establecimiento TEXT NOT NULL,
  cancha TEXT NOT NULL,
  zona TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- ============================================

-- Índices para establecimientos
CREATE INDEX IF NOT EXISTS idx_establecimientos_owner ON public.establecimientos(owner_id);
CREATE INDEX IF NOT EXISTS idx_establecimientos_ubicacion ON public.establecimientos(ubicacion);
CREATE INDEX IF NOT EXISTS idx_establecimientos_departamento ON public.establecimientos(departamento);
CREATE INDEX IF NOT EXISTS idx_establecimientos_distrito ON public.establecimientos(distrito);

-- Índices para zonas
CREATE INDEX IF NOT EXISTS idx_zonas_establecimiento ON public.zonas(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_zonas_tipo ON public.zonas(tipo);
CREATE INDEX IF NOT EXISTS idx_zonas_disponible ON public.zonas(disponible);

-- Índices para bloqueos
CREATE INDEX IF NOT EXISTS idx_bloqueos_zona ON public.bloqueos(zona_id);
CREATE INDEX IF NOT EXISTS idx_bloqueos_fecha ON public.bloqueos(fecha);
CREATE INDEX IF NOT EXISTS idx_bloqueos_zona_fecha ON public.bloqueos(zona_id, fecha);

-- Índices para reservas
CREATE INDEX IF NOT EXISTS idx_reservas_user ON public.reservas(user_id);
CREATE INDEX IF NOT EXISTS idx_reservas_zona ON public.reservas(zona_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON public.reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON public.reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_estado ON public.reservas(fecha, estado);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo_verificacion ON public.reservas(codigo_verificacion);
-- Índice único para evitar códigos duplicados en el mismo día
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_codigo_fecha ON public.reservas(codigo_verificacion, fecha);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establecimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios del sistema';
COMMENT ON TABLE public.establecimientos IS 'Establecimientos deportivos registrados por dueños';
COMMENT ON TABLE public.zonas IS 'Zonas/canchas dentro de cada establecimiento';
COMMENT ON TABLE public.bloqueos IS 'Bloqueos de horarios por mantenimiento o eventos';
COMMENT ON TABLE public.reservas IS 'Reservas de zonas con información completa del cliente y código de verificación';

COMMENT ON COLUMN public.reservas.codigo_verificacion IS 'Código de 6 dígitos para validar entrada del cliente';
COMMENT ON COLUMN public.reservas.horarios IS 'Array de horarios reservados en formato ["10:00", "11:00"]';
COMMENT ON COLUMN public.reservas.usuario_nombre IS 'Nombre completo del cliente';
COMMENT ON COLUMN public.reservas.usuario_email IS 'Email del cliente para notificaciones';
COMMENT ON COLUMN public.reservas.usuario_telefono IS 'Teléfono del cliente para contacto';
COMMENT ON COLUMN public.establecimientos.ubicacion IS 'Ubicación en formato "Departamento - Distrito"';
COMMENT ON COLUMN public.bloqueos.motivo IS 'Razón del bloqueo: mantenimiento, evento u otro';
