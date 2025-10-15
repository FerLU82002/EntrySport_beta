-- Función para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'usuario')
  );
  return new;
end;
$$;

-- Trigger para crear perfil automáticamente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers para updated_at
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_establecimientos
  before update on public.establecimientos
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_canchas
  before update on public.canchas
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_reservas
  before update on public.reservas
  for each row
  execute function public.handle_updated_at();
