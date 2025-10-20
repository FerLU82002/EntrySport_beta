-- ============================================
-- SCRIPT 003: Creación de Triggers
-- Sistema de Reservas de Canchas Deportivas
-- ============================================

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, telefono, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.raw_user_meta_data->>'telefono',
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario')
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Función para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- Triggers para updated_at en cada tabla
-- ============================================

-- Trigger para profiles
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para establecimientos
DROP TRIGGER IF EXISTS set_updated_at_establecimientos ON public.establecimientos;
CREATE TRIGGER set_updated_at_establecimientos
  BEFORE UPDATE ON public.establecimientos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para zonas (antes era "canchas")
DROP TRIGGER IF EXISTS set_updated_at_zonas ON public.zonas;
CREATE TRIGGER set_updated_at_zonas
  BEFORE UPDATE ON public.zonas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para reservas
DROP TRIGGER IF EXISTS set_updated_at_reservas ON public.reservas;
CREATE TRIGGER set_updated_at_reservas
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un nuevo usuario en auth.users';
COMMENT ON FUNCTION public.handle_updated_at() IS 'Actualiza automáticamente el campo updated_at antes de cada UPDATE';

