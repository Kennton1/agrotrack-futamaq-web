# 🚜 AgroTrack FUTAMAQ - Sistema de Gestión Agrícola

Sistema integral de gestión de maquinaria agrícola, órdenes de trabajo y mantenimientos para FUTAMAQ.

## 🌾 Características

- **Dashboard Principal**: KPIs y métricas en tiempo real
- **Gestión de Órdenes de Trabajo**: Planificación y seguimiento de faenas
- **Control de Maquinaria**: Inventario y estado de equipos
- **Mantenimientos**: Programación y registro de mantenimientos
- **Control de Combustible**: Seguimiento de consumos y costos
- **Reportes**: Generación de reportes y análisis

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Forms**: React Hook Form + Zod

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd agrotrack-futamaq-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

**IMPORTANTE:** Antes de continuar, necesitas configurar Supabase para que la aplicación funcione correctamente.

#### 3.1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración inicial

#### 3.2. Obtener credenciales

1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (clave pública)
   - **service_role secret key** (clave secreta)

#### 3.3. Crear archivo .env.local

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Company Configuration
NEXT_PUBLIC_COMPANY_NAME=FUTAMAQ
```

**Reemplaza los valores con tus credenciales reales de Supabase.**

### 4. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecutar las migraciones SQL para crear las tablas
3. Configurar las políticas de seguridad (RLS)
4. Actualizar las variables de entorno con las credenciales

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                    # Rutas protegidas
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── ordenes-trabajo/       # Gestión de OT
│   │   ├── maquinarias/           # Gestión de equipos
│   │   ├── mantenimientos/        # Calendario y registro
│   │   ├── combustible/           # Control de cargas
│   │   ├── repuestos/             # Inventario
│   │   ├── reportes/              # Reportes y exports
│   │   ├── usuarios/              # Gestión de usuarios
│   │   └── configuracion/         # Configuraciones
│   ├── api/                       # API Routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                        # Componentes base
│   ├── layout/                    # Layout components
│   ├── dashboard/                 # Dashboard y KPIs
│   ├── ordenes/                   # Componentes OT
│   ├── maquinarias/               # Gestión equipos
│   ├── mantenimientos/            # Componentes mantención
│   ├── combustible/               # Control combustible
│   ├── reportes/                  # Generación reportes
│   ├── tables/                    # Tablas reutilizables
│   ├── maps/                      # Componentes de mapas
│   └── common/                    # Componentes comunes
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── utils.ts                  # Utilidades
│   ├── constants.ts              # Constantes FUTAMAQ
│   ├── validations.ts            # Schemas Zod
│   └── api/                      # Servicios API
├── hooks/                        # Custom hooks
├── types/                        # TypeScript types
└── data/                         # Datos mock iniciales
```

## 🎨 Paleta de Colores FUTAMAQ

- **Primario**: Verde (#22c55e) - Representa la agricultura y naturaleza
- **Secundario**: Grises neutros para elementos de soporte
- **Estados**:
  - Éxito: Verde
  - Advertencia: Amarillo
  - Peligro: Rojo
  - Información: Azul

## 📊 Funcionalidades Implementadas (Sprint 1)

### ✅ Dashboard Principal
- KPIs principales (hectáreas, combustible, costos, horas)
- Resumen del día
- Estado de maquinarias en campo
- Alertas y notificaciones
- Tabla de órdenes de trabajo recientes

### ✅ Layout y Navegación
- Sidebar responsivo con navegación principal
- Barra superior con buscador y notificaciones
- Diseño mobile-first

### ✅ Componentes Base
- Sistema de cards
- Botones con variantes
- Badges de estado
- Utilidades de formato (CLP, hectáreas, horas)

## 🚧 Próximos Sprints

### Sprint 2: Autenticación y Usuarios
- Sistema de login/logout
- Gestión de roles y permisos
- Perfiles de usuario

### Sprint 3: Gestión de Maquinarias
- CRUD completo de maquinarias
- Seguimiento de ubicación
- Historial de mantenimientos

### Sprint 4: Órdenes de Trabajo
- Creación y edición de OT
- Asignación de recursos
- Seguimiento de progreso

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es propiedad de FUTAMAQ. Todos los derechos reservados.

## 📞 Contacto

FUTAMAQ - Sistema de Gestión Agrícola
- Email: info@futamaq.cl
- Web: www.futamaq.cl