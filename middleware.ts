import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = [
    "/", 
    "/auth/login", 
    "/auth/sign-up", 
    "/auth/sign-up-success", 
    "/auth/forgot-password",
    "/auth/reset-password",
    "/login", 
    "/debug",
    "/test-db"
  ]

  // Permitir acceso a rutas públicas
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next()
  }

  // Permitir acceso a archivos estáticos
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Para rutas protegidas, verificar autenticación en el cliente
  // El AuthProvider manejará la redirección si es necesario
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
