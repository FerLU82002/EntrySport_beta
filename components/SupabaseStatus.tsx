"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Info } from "lucide-react"
import { checkSupabaseConfig } from "@/lib/supabase"

export function SupabaseStatus() {
  const config = checkSupabaseConfig()

  if (config.isConfigured) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Supabase configurado correctamente. Todas las funcionalidades están disponibles.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-3">
          <p className="font-medium">🎮 Modo Demostración Activo</p>
          <p className="text-sm">
            La aplicación está funcionando con datos de ejemplo. Todas las funcionalidades están disponibles para
            explorar, pero los datos no se guardan permanentemente.
          </p>

          <div className="bg-blue-100 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Para funcionalidad completa con base de datos real:</p>
            <div className="space-y-1 text-xs">
              <p>
                1. Crea un proyecto en <strong>supabase.com</strong>
              </p>
              <p>2. Copia las claves API desde Settings → API</p>
              <p>
                3. Configúralas en <strong>.env.local</strong>
              </p>
              <p>4. Ejecuta los scripts SQL en el SQL Editor</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.open("https://supabase.com", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Ir a Supabase
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const content = `# Configurar Supabase

## 1. Crear archivo .env.local
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
\`\`\`

## 2. Obtener claves de Supabase
- Ve a supabase.com
- Crea un proyecto
- Settings → API
- Copia Project URL y anon key

## 3. Ejecutar scripts SQL
- Ve al SQL Editor en Supabase
- Ejecuta los scripts en orden: 01, 02, 03, 04`

                navigator.clipboard.writeText(content)
                alert("Guía copiada al portapapeles!")
              }}
            >
              Copiar Guía
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
