# 🚜 Configuración de AgroTrack FUTAMAQ

## 📋 Pasos para Configurar el Sistema

### 1. 🔧 Configurar Supabase

#### 1.1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - **Name**: `agrotrack-futamaq`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: `South America (São Paulo)` o la más cercana
5. Espera a que se complete la configuración (2-3 minutos)

#### 1.2. Obtener Credenciales
1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: (clave pública larga)
   - **service_role secret key**: (clave secreta larga)

#### 1.3. Crear Base de Datos
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en "New Query"
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Verifica que se crearon todas las tablas en **Table Editor**

### 2. 🔑 Configurar Variables de Entorno

#### 2.1. Editar archivo .env.local
El archivo `.env.local` ya está creado con valores temporales. Reemplaza los valores:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-secreta-aqui

# Company Configuration
NEXT_PUBLIC_COMPANY_NAME=FUTAMAQ
```

#### 2.2. Verificar Configuración
1. Guarda el archivo `.env.local`
2. Reinicia el servidor de desarrollo: `npm run dev`
3. La aplicación debería cargar sin errores

### 3. 🧪 Probar el Sistema

#### 3.1. Crear Usuario de Prueba
1. Ve a la página de registro: `http://localhost:3000/register`
2. Crea una cuenta con:
   - **Email**: `admin@futamaq.cl`
   - **Nombre**: `Administrador FUTAMAQ`
   - **Rol**: `Administrador`
   - **Contraseña**: `admin123456`

#### 3.2. Verificar Funcionalidades
- ✅ Login/Logout
- ✅ Dashboard principal
- ✅ Gestión de usuarios
- ✅ Perfil de usuario
- ✅ Navegación entre páginas

### 4. 📊 Datos de Ejemplo

El script SQL incluye datos de ejemplo:
- **3 usuarios** (admin, operadores, clientes)
- **3 clientes** agrícolas
- **4 maquinarias** (tractores, implementos, cosechadora)
- **3 órdenes de trabajo** en diferentes estados
- **3 mantenimientos** programados
- **5 repuestos** en inventario

### 5. 🔒 Seguridad

#### 5.1. Políticas de Seguridad
- Row Level Security (RLS) habilitado en todas las tablas
- Políticas básicas configuradas para desarrollo
- En producción, ajustar las políticas según necesidades

#### 5.2. Configuración de Producción
- Cambiar contraseñas por defecto
- Configurar políticas RLS más restrictivas
- Habilitar autenticación por email
- Configurar backup automático

### 6. 🚀 Próximos Pasos

Una vez configurado:
1. **Sprint 3**: Gestión de Maquinarias
2. **Sprint 4**: Órdenes de Trabajo
3. **Sprint 5**: Control de Combustible
4. **Sprint 6**: Reportes y Dashboard

### 7. 🆘 Solución de Problemas

#### Error: "Your project's URL and Key are required"
- Verifica que el archivo `.env.local` existe
- Verifica que las credenciales son correctas
- Reinicia el servidor después de cambiar las variables

#### Error: "Failed to fetch"
- Verifica que el proyecto de Supabase está activo
- Verifica que las políticas RLS permiten acceso
- Revisa la consola del navegador para más detalles

#### Error: "Table doesn't exist"
- Ejecuta el script `supabase-schema.sql` completo
- Verifica que todas las tablas se crearon correctamente
- Revisa los logs de Supabase

### 8. 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Revisa los logs de Supabase en el dashboard
3. Verifica que todas las dependencias están instaladas
4. Asegúrate de que el archivo `.env.local` está en la raíz del proyecto

---

**¡El sistema AgroTrack FUTAMAQ está listo para usar!** 🎉



















































