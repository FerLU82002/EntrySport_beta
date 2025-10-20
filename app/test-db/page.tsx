"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SimpleDebugPage() {
  const [result, setResult] = useState<string>("Iniciando diagnóstico...")
  const [establecimientos, setEstablecimientos] = useState<any[]>([])

  useEffect(() => {
    const runDiagnostic = async () => {
      const logs: string[] = []
      
      try {
        logs.push("✅ Página cargada")
        
        // Verificar variables de entorno
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        logs.push(`⚙️ SUPABASE_URL: ${hasUrl ? "Configurada" : "❌ NO CONFIGURADA"}`)
        logs.push(`⚙️ SUPABASE_ANON_KEY: ${hasKey ? "Configurada" : "❌ NO CONFIGURADA"}`)
        
        if (!hasUrl || !hasKey) {
          logs.push("❌ ERROR: Variables de entorno no configuradas")
          setResult(logs.join("\n"))
          return
        }
        
        // Crear cliente
        logs.push("🔧 Creando cliente de Supabase...")
        const supabase = createClient()
        logs.push("✅ Cliente creado")
        
        // Query directa
        logs.push("📡 Consultando tabla establecimientos...")
        const { data, error, status } = await supabase
          .from('establecimientos')
          .select('*')
        
        logs.push(`📊 Status: ${status}`)
        
        if (error) {
          logs.push(`❌ ERROR: ${error.message}`)
          logs.push(`   Code: ${error.code}`)
          logs.push(`   Details: ${error.details}`)
          logs.push(`   Hint: ${error.hint}`)
        } else {
          logs.push(`✅ Query exitosa`)
          logs.push(`📦 Registros encontrados: ${data?.length || 0}`)
          setEstablecimientos(data || [])
          
          if (data && data.length > 0) {
            data.forEach((est, idx) => {
              logs.push(`   ${idx + 1}. ${est.nombre} (ID: ${est.id})`)
            })
          }
        }
        
        // Verificar cache
        const cache = localStorage.getItem('establecimientos-publicos')
        if (cache) {
          try {
            const parsed = JSON.parse(cache)
            const age = Date.now() - parsed.timestamp
            logs.push(`💾 Cache encontrado: ${Math.round(age / 1000)} segundos de antigüedad`)
            logs.push(`   Canchas en cache: ${parsed.data?.length || 0}`)
          } catch (e) {
            logs.push(`⚠️ Cache corrupto`)
          }
        } else {
          logs.push(`📭 No hay cache`)
        }
        
      } catch (err: any) {
        logs.push(`❌ ERROR GENERAL: ${err.message || err}`)
        console.error("Error completo:", err)
      }
      
      setResult(logs.join("\n"))
    }
    
    runDiagnostic()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnóstico Simple</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
        </div>
        
        {establecimientos.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📦 Establecimientos Encontrados</h2>
            <div className="space-y-4">
              {establecimientos.map(est => (
                <div key={est.id} className="bg-gray-700 rounded p-4">
                  <p className="font-bold">{est.nombre}</p>
                  <p className="text-sm text-gray-300">ID: {est.id}</p>
                  <p className="text-sm text-gray-300">Ubicación: {est.ubicacion}</p>
                  <p className="text-sm text-gray-300">Dirección: {est.direccion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-yellow-900 rounded-lg p-6">
          <h2 className="font-bold mb-2">🧹 Limpiar Cache</h2>
          <button 
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-semibold"
          >
            Limpiar Cache y Recargar
          </button>
        </div>
      </div>
    </div>
  )
}
