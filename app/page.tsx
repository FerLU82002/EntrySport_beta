"use client"

import { AppProvider } from "@/contexts/AppContext"
import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { FiltrosSection } from "@/components/FiltrosSection"
import { CanchasGrid } from "@/components/CanchasGrid"
import { LoginModal } from "@/components/LoginModal"
import { DetallesModal } from "@/components/DetallesModal"
import { SupabaseStatus } from "@/components/SupabaseStatus"
import { Search, Calendar, Users, Phone, Mail, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Agregar estado de Supabase después del header */}
        <div className="container mx-auto px-4 pt-4">
          <SupabaseStatus />
        </div>

        <HeroSection />
        <FiltrosSection />
        <CanchasGrid />
        <LoginModal />
        <DetallesModal />

        {/* Resto de secciones estáticas */}
        <section id="como-funciona" className="py-16 bg-gray-50">
          {/* Contenido de cómo funciona */}
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-gray-600 text-lg">Reservar tu cancha es muy fácil</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Busca y compara</h3>
                <p className="text-gray-600">
                  Encuentra establecimientos cerca de ti, compara precios de diferentes zonas y lee reseñas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {/* Cambiar CalendarIcon por Calendar en la sección "Cómo funciona" */}
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Selecciona zona y horario</h3>
                <p className="text-gray-600">
                  Elige la zona que prefieras, selecciona fecha y hora, realiza el pago seguro.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Juega y disfruta</h3>
                <p className="text-gray-600">
                  Llega al establecimiento, presenta tu reserva y disfruta del mejor deporte.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          {/* Estadísticas */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-gray-600">Establecimientos</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">120+</div>
                <div className="text-gray-600">Zonas disponibles</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10k+</div>
                <div className="text-gray-600">Reservas realizadas</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">4.8</div>
                <div className="text-gray-600">Rating promedio</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          {/* Mapa general */}
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Encuentra establecimientos cerca de ti</h2>
              <p className="text-gray-600 text-lg">Explora todos nuestros establecimientos deportivos en el mapa</p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-96 md:h-[500px] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124423.04!2d-77.0428!3d-12.0464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5f619ee3ec7%3A0x14206cb9cc452e4a!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1635959999999!5m2!1ses!2spe"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de establecimientos deportivos en Lima"
                  ></iframe>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Ocupado</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Múltiples zonas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contacto" className="bg-gray-900 text-white py-12">
          {/* Footer */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RC</span>
                  </div>
                  <span className="text-xl font-bold">ReservaCanchas</span>
                </div>
                <p className="text-gray-400">
                  La plataforma líder para reservar canchas sintéticas en Lima. Conectamos jugadores con los mejores
                  establecimientos deportivos.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Para Jugadores</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Buscar canchas</li>
                  <li>Hacer reservas</li>
                  <li>Gestionar reservas</li>
                  <li>Reseñas y ratings</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Para Establecimientos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Registrar tu cancha</li>
                  <li>Gestionar reservas</li>
                  <li>Panel de control</li>
                  <li>Soporte técnico</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+51 987 654 321</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>info@reservacanchas.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Lima, Perú</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ReservaCanchas. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  )
}
