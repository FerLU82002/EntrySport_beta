-- Políticas RLS para profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Políticas RLS para establecimientos
create policy "Anyone can view establecimientos"
  on public.establecimientos for select
  using (true);

create policy "Owners can insert their own establecimientos"
  on public.establecimientos for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own establecimientos"
  on public.establecimientos for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own establecimientos"
  on public.establecimientos for delete
  using (auth.uid() = owner_id);

-- Políticas RLS para canchas
create policy "Anyone can view canchas"
  on public.canchas for select
  using (true);

create policy "Owners can insert canchas for their establecimientos"
  on public.canchas for insert
  with check (
    exists (
      select 1 from public.establecimientos
      where id = cancha_id and owner_id = auth.uid()
    )
  );

create policy "Owners can update their own canchas"
  on public.canchas for update
  using (
    exists (
      select 1 from public.establecimientos
      where id = establecimiento_id and owner_id = auth.uid()
    )
  );

create policy "Owners can delete their own canchas"
  on public.canchas for delete
  using (
    exists (
      select 1 from public.establecimientos
      where id = establecimiento_id and owner_id = auth.uid()
    )
  );

-- Políticas RLS para bloqueos
create policy "Anyone can view bloqueos"
  on public.bloqueos for select
  using (true);

create policy "Owners can insert bloqueos for their canchas"
  on public.bloqueos for insert
  with check (
    exists (
      select 1 from public.canchas c
      join public.establecimientos e on c.establecimiento_id = e.id
      where c.id = cancha_id and e.owner_id = auth.uid()
    )
  );

create policy "Owners can update their own bloqueos"
  on public.bloqueos for update
  using (
    exists (
      select 1 from public.canchas c
      join public.establecimientos e on c.establecimiento_id = e.id
      where c.id = cancha_id and e.owner_id = auth.uid()
    )
  );

create policy "Owners can delete their own bloqueos"
  on public.bloqueos for delete
  using (
    exists (
      select 1 from public.canchas c
      join public.establecimientos e on c.establecimiento_id = e.id
      where c.id = cancha_id and e.owner_id = auth.uid()
    )
  );

-- Políticas RLS para reservas
create policy "Users can view their own reservas"
  on public.reservas for select
  using (auth.uid() = user_id);

create policy "Owners can view reservas for their establecimientos"
  on public.reservas for select
  using (
    exists (
      select 1 from public.establecimientos
      where id = establecimiento_id and owner_id = auth.uid()
    )
  );

create policy "Users can insert their own reservas"
  on public.reservas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reservas"
  on public.reservas for update
  using (auth.uid() = user_id);

create policy "Owners can update reservas for their establecimientos"
  on public.reservas for update
  using (
    exists (
      select 1 from public.establecimientos
      where id = establecimiento_id and owner_id = auth.uid()
    )
  );
