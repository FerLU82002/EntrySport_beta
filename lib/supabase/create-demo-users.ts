// Script para crear usuarios de demostración usando Supabase Admin API
// Este archivo debe ejecutarse desde el servidor con privilegios de admin

import { createClient } from "@supabase/supabase-js"

// Este script requiere las credenciales de admin de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createDemoUsers() {
  console.log("Creando usuarios de demostración...")

  // Crear usuario general
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: "usuario@gmail.com",
    password: "demo123",
    email_confirm: true,
    user_metadata: {
      nombre: "Usuario General",
      telefono: "+51 987 654 321",
      role: "usuario",
    },
  })

  if (userError) {
    console.error("Error creando usuario:", userError)
  } else {
    console.log("Usuario creado:", userData.user?.email)
    console.log("User ID:", userData.user?.id)
  }

  // Crear administrador/dueño
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@gmail.com",
    password: "demo123",
    email_confirm: true,
    user_metadata: {
      nombre: "Dueño de Cancha",
      telefono: "+51 987 654 322",
      role: "dueno",
    },
  })

  if (adminError) {
    console.error("Error creando admin:", adminError)
  } else {
    console.log("Admin creado:", adminData.user?.email)
    console.log("User ID:", adminData.user?.id)
  }

  console.log("\n⚠️ IMPORTANTE: Copia los User IDs generados y actualiza el script 004_seed_demo_data.sql")
  console.log('Reemplaza "user-demo-123" y "admin-demo-456" con los IDs reales generados.')
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createDemoUsers()
    .then(() => {
      console.log("\n✅ Usuarios de demostración creados exitosamente")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Error:", error)
      process.exit(1)
    })
}

export { createDemoUsers }
