-- ============================================
-- SCRIPT 002: Políticas de Seguridad RLS
-- Row Level Security Policies
-- ============================================

-- ============================================
-- POLÍTICAS PARA PROFILES
-- ============================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS PARA ESTABLECIMIENTOS
-- ============================================

CREATE POLICY "Anyone can view establecimientos"
  ON public.establecimientos FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert their own establecimientos"
  ON public.establecimientos FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own establecimientos"
  ON public.establecimientos FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own establecimientos"
  ON public.establecimientos FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- POLÍTICAS PARA ZONAS
-- ============================================

CREATE POLICY "Anyone can view zonas"
  ON public.zonas FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert zonas for their establecimientos"
  ON public.zonas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.establecimientos
      WHERE id = establecimiento_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their own zonas"
  ON public.zonas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.establecimientos
      WHERE id = establecimiento_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete their own zonas"
  ON public.zonas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.establecimientos
      WHERE id = establecimiento_id AND owner_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS PARA BLOQUEOS
-- ============================================

CREATE POLICY "Anyone can view bloqueos"
  ON public.bloqueos FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert bloqueos for their zonas"
  ON public.bloqueos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.zonas z
      JOIN public.establecimientos e ON z.establecimiento_id = e.id
      WHERE z.id = zona_id AND e.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their own bloqueos"
  ON public.bloqueos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.zonas z
      JOIN public.establecimientos e ON z.establecimiento_id = e.id
      WHERE z.id = zona_id AND e.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete their own bloqueos"
  ON public.bloqueos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.zonas z
      JOIN public.establecimientos e ON z.establecimiento_id = e.id
      WHERE z.id = zona_id AND e.owner_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS PARA RESERVAS
-- ============================================

-- Usuarios pueden ver sus propias reservas
CREATE POLICY "Users can view their own reservas"
  ON public.reservas FOR SELECT
  USING (auth.uid() = user_id);

-- Dueños pueden ver reservas de sus zonas
CREATE POLICY "Owners can view reservas for their zonas"
  ON public.reservas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.zonas z
      JOIN public.establecimientos e ON z.establecimiento_id = e.id
      WHERE z.id = zona_id AND e.owner_id = auth.uid()
    )
  );

-- Usuarios pueden crear sus propias reservas
CREATE POLICY "Users can insert their own reservas"
  ON public.reservas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden cancelar sus propias reservas
CREATE POLICY "Users can update their own reservas"
  ON public.reservas FOR UPDATE
  USING (auth.uid() = user_id);

-- Dueños pueden actualizar estado de reservas de sus zonas
CREATE POLICY "Owners can update reservas for their zonas"
  ON public.reservas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.zonas z
      JOIN public.establecimientos e ON z.establecimiento_id = e.id
      WHERE z.id = zona_id AND e.owner_id = auth.uid()
    )
  );
