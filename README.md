# 🏟️ ReservaCanchas - Sistema de Reservas Deportivas

Sistema completo para reservar canchas sintéticas en Lima, Perú. Incluye gestión de establecimientos, reservas, pagos y panel administrativo.

## 🚀 Inicio Rápido

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
\`\`\`

## 🎮 Modo Demostración

La aplicación funciona inmediatamente en **modo demo** con:
- ✅ 12 establecimientos reales de Lima
- ✅ Múltiples canchas de diferentes deportes  
- ✅ Sistema completo de filtros y reservas
- ✅ Interfaz de usuario y admin completa
- ✅ Datos realistas (no se guardan permanentemente)

## 🗄️ Configuración de Base de Datos (Opcional)

Para funcionalidad completa con persistencia de datos:

### 1. Crear Proyecto Supabase
- Ve a [supabase.com](https://supabase.com)
- Crea un nuevo proyecto
- Espera a que se inicialice

### 2. Obtener Claves API
- Ve a **Settings** → **API**
- Copia **Project URL** y **anon public key**

### 3. Configurar Variables de Entorno
Edita `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
\`\`\`

### 4. Ejecutar Scripts SQL
En el **SQL Editor** de Supabase, ejecuta en orden:
1. `scripts/01-create-tables.sql`
2. `scripts/02-create-functions.sql` 
3. `scripts/03-seed-data.sql`

### 5. Reiniciar Servidor
\`\`\`bash
npm run dev
\`\`\`

## 📱 Funcionalidades

### Para Usuarios
- 🔍 **Buscar canchas** - Filtros por tipo, ubicación, precio
- 📅 **Reservar horarios** - Calendario interactivo
- 💳 **Gestión de pagos** - Integración con pasarelas
- 🏆 **Sistema de recompensas** - Puntos y descuentos
- 📊 **Dashboard personal** - Historial y próximas reservas

### Para Administradores
- 🏢 **Gestión de establecimientos** - CRUD completo
- ⚽ **Administrar canchas** - Precios, horarios, características
- 📈 **Métricas y reportes** - Ingresos, ocupación, usuarios
- 👥 **Gestión de usuarios** - Roles y permisos
- 🚫 **Control de horarios** - Bloqueos y mantenimiento

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn/ui, Radix UI, Lucide Icons
- **Autenticación**: Supabase Auth con RLS
- **Pagos**: Integración preparada para Yape/Plin

## 📂 Estructura del Proyecto

\`\`\`
├── app/                    # App Router de Next.js
├── components/            # Componentes reutilizables
├── contexts/             # Context API de React
├── data/                 # Datos estáticos para demo
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── scripts/              # Scripts SQL para Supabase
├── types/                # Definiciones de TypeScript
└── utils/                # Funciones auxiliares
\`\`\`

## 🔐 Seguridad

- **Row Level Security (RLS)** - Políticas de acceso granular
- **Autenticación JWT** - Tokens seguros de Supabase
- **Validación de datos** - Esquemas y constraints
- **Roles de usuario** - Admin/Usuario con permisos específicos

## 🚀 Despliegue

### Vercel (Recomendado)
\`\`\`bash
# Conectar con GitHub y desplegar automáticamente
vercel --prod
\`\`\`

### Variables de Entorno en Producción
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_de_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
\`\`\`

## 📞 Soporte

- 📧 Email: info@reservacanchas.com
- 📱 WhatsApp: +51 987 654 321
- 🌐 Web: [reservacanchas.com](https://reservacanchas.com)

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ para la comunidad deportiva de Lima, Perú**
