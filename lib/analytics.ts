// Tipos para eventos de Google Analytics
export interface GAEvent {
  action: string
  category?: string
  label?: string
  value?: number
}

// Declaración global para gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

// Helper para enviar eventos personalizados a Google Analytics
export const sendGAEvent = (event: GAEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    })
  }
}

// Eventos específicos de EntrySport
export const GAEvents = {
  // Vista de cancha
  viewCancha: (canchaId: string, establecimiento: string, tipo: string) => {
    sendGAEvent({
      action: 'view_cancha',
      category: 'engagement',
      label: establecimiento,
      value: 1,
    })
    
    if (window.gtag) {
      window.gtag('event', 'view_cancha', {
        cancha_id: canchaId,
        establecimiento,
        tipo,
      })
    }
  },

  // Inicio de proceso de reserva
  beginCheckout: (zonaId: string, precio: number, fecha: string) => {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        zona_id: zonaId,
        precio,
        fecha,
        currency: 'PEN',
        value: precio,
      })
    }
  },

  // Reserva completada
  purchase: (reservaId: string, precio: number, zona: string, zonaId: string) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: reservaId,
        value: precio,
        currency: 'PEN',
        items: [
          {
            item_id: zonaId,
            item_name: zona,
            price: precio,
            quantity: 1,
          },
        ],
      })
    }
  },

  // Registro de usuario
  signUp: (method: string = 'email') => {
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method,
      })
    }
  },

  // Inicio de sesión
  login: (method: string = 'email') => {
    if (window.gtag) {
      window.gtag('event', 'login', {
        method,
      })
    }
  },

  // Búsqueda
  search: (searchTerm: string) => {
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
      })
    }
  },

  // Selección de fecha
  selectDate: (fecha: string) => {
    sendGAEvent({
      action: 'select_date',
      category: 'booking',
      label: fecha,
    })
  },

  // Selección de horario
  selectTime: (horario: string) => {
    sendGAEvent({
      action: 'select_time',
      category: 'booking',
      label: horario,
    })
  },

  // Click en teléfono
  clickPhone: (establecimiento: string) => {
    sendGAEvent({
      action: 'click_phone',
      category: 'engagement',
      label: establecimiento,
    })
  },

  // Click en direcciones (mapa)
  clickDirections: (establecimiento: string) => {
    sendGAEvent({
      action: 'click_directions',
      category: 'engagement',
      label: establecimiento,
    })
  },

  // Compartir en redes sociales
  share: (platform: string, content: string) => {
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: content,
      })
    }
  },

  // Cancelación de reserva
  cancelReservation: (reservaId: string, motivo?: string) => {
    sendGAEvent({
      action: 'cancel_reservation',
      category: 'booking',
      label: motivo || 'user_cancelled',
    })
  },
}
