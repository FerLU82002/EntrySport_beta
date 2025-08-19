import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Validar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_supabase_project_url") {
    console.warn("⚠️ Supabase no configurado, saltando middleware de autenticación")
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Rutas protegidas que requieren autenticación
    const protectedRoutes = ["/dashboard", "/profile"]
    const adminRoutes = ["/admin"]

    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // Redirigir a login si no está autenticado en ruta protegida
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Verificar rol de admin para rutas administrativas
    if (isAdminRoute && user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Redirigir a home si no está autenticado en ruta admin
    if (isAdminRoute && !user) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return response
  } catch (error) {
    console.warn("Error en middleware de autenticación:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
