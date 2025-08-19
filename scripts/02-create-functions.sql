-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Crear registro de recompensas
  INSERT INTO public.recompensas (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar recompensas después de completar reserva
CREATE OR REPLACE FUNCTION public.update_rewards_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'completed' AND OLD.estado != 'completed' THEN
    UPDATE recompensas 
    SET 
      puntos = puntos + 10,
      reservas_completadas = reservas_completadas + 1,
      nivel = CASE 
        WHEN reservas_completadas + 1 >= 50 THEN 'platino'
        WHEN reservas_completadas + 1 >= 25 THEN 'oro'
        WHEN reservas_completadas + 1 >= 10 THEN 'plata'
        ELSE 'bronce'
      END,
      descuento_disponible = CASE 
        WHEN (reservas_completadas + 1) % 10 = 0 THEN 15.00
        ELSE descuento_disponible
      END
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar recompensas
CREATE OR REPLACE TRIGGER on_reserva_completed
  AFTER UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION public.update_rewards_on_completion();

-- Función para bloquear horarios al crear reserva
CREATE OR REPLACE FUNCTION public.block_schedule_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'paid' THEN
    INSERT INTO horarios_bloqueados (cancha_id, fecha, hora_inicio, hora_fin, tipo)
    VALUES (NEW.cancha_id, NEW.fecha, NEW.hora_inicio, NEW.hora_fin, 'reservado');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para bloquear horarios
CREATE OR REPLACE TRIGGER on_reservation_paid
  AFTER INSERT OR UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION public.block_schedule_on_reservation();

-- Función para actualizar métricas diarias
CREATE OR REPLACE FUNCTION public.update_daily_metrics()
RETURNS void AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO metricas (fecha, reservas_creadas, reservas_completadas, ingresos_totales)
  VALUES (
    today,
    (SELECT COUNT(*) FROM reservas WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM reservas WHERE DATE(updated_at) = today AND estado = 'completed'),
    (SELECT COALESCE(SUM(precio_total), 0) FROM reservas WHERE DATE(updated_at) = today AND estado = 'completed')
  )
  ON CONFLICT (fecha) DO UPDATE SET
    reservas_creadas = EXCLUDED.reservas_creadas,
    reservas_completadas = EXCLUDED.reservas_completadas,
    ingresos_totales = EXCLUDED.ingresos_totales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
