// Health check endpoint para monitoreo
// Ruta: /api/health

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar que el servidor está funcionando
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
