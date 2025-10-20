"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function DebugContent() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([])
  const [zonas, setZonas] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Verificar configuración de Supabase
        const config = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || "NO CONFIGURADO",
          anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        }
        setSupabaseConfig(config)

        const supabase = createClient()

        // Test 1: Consultar establecimientos
        const { data: estData, error: estError } = await supabase
          .from('establecimientos')
          .select('*')

        if (estError) {
          console.error("❌ Error en establecimientos:", estError)
          setError(`Error establecimientos: ${estError.message}`)
        } else {
          setEstablecimientos(estData || [])
        }

        // Test 2: Consultar zonas
        const { data: zonasData, error: zonasError } = await supabase
          .from('zonas')
          .select('*')

        if (zonasError) {
          console.error("❌ Error en zonas:", zonasError)
          setError(prev => prev ? `${prev} | Error zonas: ${zonasError.message}` : `Error zonas: ${zonasError.message}`)
        } else {
          setZonas(zonasData || [])
        }

      } catch (err) {
        console.error("❌ Error general:", err)
        setError(`Error general: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnóstico de Conexión</h1>

        {/* Configuración */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ Configuración de Supabase</h2>
          <div className="space-y-2">
            <p><strong>URL:</strong> {supabaseConfig?.url}</p>
            <p><strong>Anon Key Length:</strong> {supabaseConfig?.anonKeyLength} caracteres</p>
            <p className="text-sm text-gray-500">
              {supabaseConfig?.anonKeyLength > 0 ? "✅ Configurado" : "❌ No configurado"}
            </p>
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-800">⏳ Cargando datos...</p>
          </div>
        )}

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Errores</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Establecimientos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            🏢 Establecimientos ({establecimientos.length})
          </h2>
          {establecimientos.length === 0 ? (
            <p className="text-gray-500">No hay establecimientos en la base de datos</p>
          ) : (
            <div className="space-y-4">
              {establecimientos.map((est, idx) => (
                <div key={est.id} className="border rounded p-4 bg-gray-50">
                  <p className="font-semibold">{idx + 1}. {est.nombre}</p>
                  <p className="text-sm text-gray-600">ID: {est.id}</p>
                  <p className="text-sm text-gray-600">Ubicación: {est.ubicacion}</p>
                  <p className="text-sm text-gray-600">Dirección: {est.direccion}</p>
                  <p className="text-sm text-gray-600">Owner ID: {est.owner_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zonas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            ⚽ Zonas ({zonas.length})
          </h2>
          {zonas.length === 0 ? (
            <p className="text-gray-500">No hay zonas en la base de datos</p>
          ) : (
            <div className="space-y-4">
              {zonas.map((zona, idx) => (
                <div key={zona.id} className="border rounded p-4 bg-gray-50">
                  <p className="font-semibold">{idx + 1}. {zona.nombre}</p>
                  <p className="text-sm text-gray-600">ID: {zona.id}</p>
                  <p className="text-sm text-gray-600">Establecimiento ID: {zona.establecimiento_id}</p>
                  <p className="text-sm text-gray-600">Tipo: {zona.tipo}</p>
                  <p className="text-sm text-gray-600">Precio: S/ {zona.precio}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">📊 Resumen</h2>
          <ul className="space-y-2 text-green-700">
            <li>✅ Cliente de Supabase inicializado</li>
            <li>{establecimientos.length > 0 ? "✅" : "❌"} Establecimientos: {establecimientos.length}</li>
            <li>{zonas.length > 0 ? "✅" : "❌"} Zonas: {zonas.length}</li>
            <li>{!error ? "✅" : "❌"} Sin errores de conexión</li>
          </ul>
        </div>

        {/* Consola del navegador */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            💡 <strong>Tip:</strong> Abre la consola del navegador (F12) para ver logs detallados
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return <DebugContent />
}
