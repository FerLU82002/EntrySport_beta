-- Tabla de perfiles de usuario (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('usuario', 'dueno')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de establecimientos (solo para dueños)
create table if not exists public.establecimientos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  descripcion text,
  direccion text not null,
  ubicacion_lat decimal(10, 8),
  ubicacion_lng decimal(11, 8),
  departamento text not null,
  provincia text not null,
  distrito text not null,
  telefono text,
  imagen_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de canchas/zonas (pertenecen a un establecimiento)
create table if not exists public.canchas (
  id uuid primary key default gen_random_uuid(),
  establecimiento_id uuid not null references public.establecimientos(id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('Fútbol 11', 'Fútbol 7', 'Fútbol 5', 'Básquet', 'Vóley', 'Tenis')),
  capacidad integer not null,
  precio_hora decimal(10, 2) not null,
  servicios text[] default array[]::text[],
  imagen_url text,
  disponible boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de bloqueos de horarios (mantenimiento, eventos, etc.)
create table if not exists public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  cancha_id uuid not null references public.canchas(id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  motivo text not null check (motivo in ('mantenimiento', 'evento', 'otro')),
  descripcion text,
  created_at timestamp with time zone default now()
);

-- Tabla de reservas
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cancha_id uuid not null references public.canchas(id) on delete cascade,
  establecimiento_id uuid not null references public.establecimientos(id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  precio_total decimal(10, 2) not null,
  metodo_pago text not null,
  estado text not null check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')) default 'pendiente',
  notas text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para mejorar el rendimiento
create index if not exists idx_establecimientos_owner on public.establecimientos(owner_id);
create index if not exists idx_canchas_establecimiento on public.canchas(establecimiento_id);
create index if not exists idx_bloqueos_cancha on public.bloqueos(cancha_id);
create index if not exists idx_reservas_user on public.reservas(user_id);
create index if not exists idx_reservas_cancha on public.reservas(cancha_id);
create index if not exists idx_reservas_fecha on public.reservas(fecha);
create index if not exists idx_reservas_estado on public.reservas(estado);

-- Habilitar Row Level Security en todas las tablas
alter table public.profiles enable row level security;
alter table public.establecimientos enable row level security;
alter table public.canchas enable row level security;
alter table public.bloqueos enable row level security;
alter table public.reservas enable row level security;
