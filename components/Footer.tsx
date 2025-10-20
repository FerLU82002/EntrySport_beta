"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Sobre EntrySport */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="text-xl font-bold text-white">EntrySport</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              La plataforma líder para reservar canchas deportivas en Huánuco. Encuentra y reserva al instante tu espacio deportivo favorito.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Canchas Disponibles
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-green-500 transition-colors">
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link href="/mis-reservas" className="hover:text-green-500 transition-colors">
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-green-500 transition-colors">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Deportes */}
          <div>
            <h3 className="text-white font-semibold mb-4">Deportes</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Fútbol 11
                </Link>
              </li>
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Fútbol 7
                </Link>
              </li>
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Fútbol 5
                </Link>
              </li>
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Básquetbol
                </Link>
              </li>
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Vóley
                </Link>
              </li>
              <li>
                <Link href="/#canchas" className="hover:text-green-500 transition-colors">
                  Tenis
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Jr. 28 de Julio 456<br />Huánuco, Perú</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <a href="tel:+51962123456" className="hover:text-green-500 transition-colors">
                  +51 962 123 456
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <a href="mailto:info@entrysport.com" className="hover:text-green-500 transition-colors">
                  info@entrysport.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} EntrySport. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <Link href="/terminos" className="hover:text-green-500 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="hover:text-green-500 transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
