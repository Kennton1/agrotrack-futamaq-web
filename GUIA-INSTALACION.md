# Guía de Instalación - AgroTrack FUTAMAQ

Esta guía te ayudará a instalar y configurar el sistema AgroTrack FUTAMAQ en tu entorno local o de producción.

---

## Punto 1: Verificar Prerrequisitos del Sistema

**¿Qué estamos haciendo?**  
Verificamos que tu computadora tenga todas las herramientas necesarias instaladas antes de comenzar. Esto evita errores durante la instalación y asegura que el sistema funcione correctamente.

**Herramientas necesarias:**
- **Node.js versión 18 o superior**: Necesario para ejecutar la aplicación Next.js
- **npm (Node Package Manager)**: Se instala automáticamente con Node.js
- **Git**: Para clonar el repositorio del proyecto
- **Cuenta de Supabase**: Necesaria para la base de datos y autenticación

**Comandos a ejecutar:**

Abre una terminal (PowerShell en Windows, Terminal en Mac/Linux) y ejecuta estos comandos uno por uno:

```bash
node --version
```
*Debe mostrar v18 o superior*

```bash
npm --version
```
*Debe mostrar una versión de npm*

```bash
git --version
```
*Debe mostrar una versión de Git*

**Si alguno de estos comandos muestra un error o no está instalado, deberás instalarlo antes de continuar.**

---

## Punto 2: Clonar el Repositorio del Proyecto

**¿Qué estamos haciendo?**  
Descargamos el código fuente completo del proyecto desde el repositorio Git. Esto nos permite tener una copia local del sistema en nuestra computadora para poder trabajar con él.

**Comandos a ejecutar:**

1. Abre una terminal en la ubicación donde deseas guardar el proyecto (por ejemplo: `C:\proyectos\`)

2. Ejecuta el comando para clonar el repositorio:
```bash
git clone <url-del-repositorio>
```
*Reemplaza `<url-del-repositorio>` con la URL real del repositorio Git del proyecto*

3. Navega a la carpeta del proyecto que se acaba de crear:
```bash
cd agrotrack-futamaq-web
```
*Este comando te lleva dentro de la carpeta del proyecto para poder trabajar en él*

---

## Punto 3: Instalar las Dependencias del Proyecto

**¿Qué estamos haciendo?**  
Instalamos todas las librerías y paquetes externos que el sistema necesita para funcionar. El proyecto usa muchas herramientas (React, Next.js, Supabase, etc.) que no vienen incluidas en el código, por lo que debemos descargarlas e instalarlas.

**Comandos a ejecutar:**

1. Asegúrate de estar dentro de la carpeta del proyecto (`agrotrack-futamaq-web`). Si no estás, ejecuta:
```bash
cd agrotrack-futamaq-web
```

2. Ejecuta el comando para instalar todas las dependencias:
```bash
npm install
```
*Este comando lee el archivo `package.json` y descarga todas las librerías necesarias. Puede tardar varios minutos.*

**Qué hace este comando:**
- Descarga todas las librerías necesarias (React, Next.js, Tailwind CSS, Supabase, etc.)
- Las instala en la carpeta `node_modules`
- Crea el archivo `package-lock.json` que asegura versiones consistentes

---

## Punto 4: Crear y Configurar el Proyecto en Supabase

**¿Qué estamos haciendo?**  
Creamos un proyecto en Supabase, que es la plataforma que proporciona la base de datos y el sistema de autenticación para nuestra aplicación. Sin esto, el sistema no puede guardar ni recuperar información.

**Pasos a seguir (sin comandos, es una configuración web):**

1. Ve al sitio web de Supabase: [https://supabase.com](https://supabase.com)

2. Inicia sesión o crea una cuenta gratuita si no tienes una

3. Haz clic en **"New Project"** (Nuevo Proyecto)

4. Completa el formulario con la siguiente información:
   - **Nombre del proyecto**: Ejemplo: "agrotrack-futamaq"
   - **Contraseña de la base de datos**: Crea una contraseña segura y **guárdala en un lugar seguro**
   - **Región**: Selecciona la región más cercana a tu ubicación (esto mejora la velocidad)

5. Haz clic en **"Create new project"** y espera a que se complete la configuración (puede tardar 2-3 minutos)

**Importante:** Guarda la contraseña de la base de datos que creaste, la necesitarás más adelante si necesitas acceder directamente a la base de datos.

---

## Punto 5: Obtener las Credenciales de Supabase

**¿Qué estamos haciendo?**  
Obtenemos las claves de acceso (credenciales) que permitirán que nuestra aplicación se conecte de forma segura a la base de datos de Supabase. Sin estas claves, la aplicación no podrá comunicarse con Supabase.

**Pasos a seguir (sin comandos, es una configuración web):**

1. En el dashboard de Supabase (donde creaste el proyecto), ve a **Settings** (Configuración) en el menú lateral izquierdo

2. Haz clic en **API** en el submenú de configuración

3. Encontrarás tres valores importantes que debes copiar:
   - **Project URL**: Una URL que se ve así: `https://xxxxx.supabase.co`
   - **anon public key**: Una clave larga que comienza con `eyJ...` (esta es pública y segura de compartir)
   - **service_role secret key**: Otra clave larga (**mantén esta en secreto, no la compartas nunca**)

**Copia estos tres valores** y guárdalos temporalmente en un documento de texto. Los usarás en el siguiente paso para configurar las variables de entorno.

---

## Punto 6: Crear el Archivo de Variables de Entorno

**¿Qué estamos haciendo?**  
Creamos un archivo especial que almacena las credenciales de Supabase de forma segura. Este archivo permite que la aplicación se conecte a la base de datos sin tener que escribir las claves directamente en el código.

**Pasos a seguir:**

1. En la raíz del proyecto (carpeta `agrotrack-futamaq-web`), crea un nuevo archivo llamado `.env.local`
   *Puedes crearlo con cualquier editor de texto (Notepad, VS Code, etc.)*

2. Abre el archivo y copia y pega el siguiente contenido:

```bash
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-aqui

# Configuración de la Empresa
NEXT_PUBLIC_COMPANY_NAME=FUTAMAQ
```

3. Reemplaza los valores con los que obtuviste en el paso anterior:
   - `https://tu-proyecto-id.supabase.co` → Reemplaza con tu **Project URL** de Supabase
   - `tu-clave-anon-publica-aqui` → Reemplaza con tu **anon public key**
   - `tu-clave-service-role-aqui` → Reemplaza con tu **service_role secret key**

4. Guarda el archivo

**Importante:** 
- El archivo `.env.local` NO debe subirse al repositorio Git (ya está en `.gitignore`)
- Mantén estas claves en secreto, especialmente la `SERVICE_ROLE_KEY`
- No dejes espacios antes o después del signo `=` en las variables

---

## Punto 7: Configurar la Base de Datos en Supabase

**¿Qué estamos haciendo?**  
Ejecutamos un script SQL que crea todas las tablas necesarias en la base de datos (usuarios, maquinarias, mantenimientos, combustible, etc.) y configura cómo se relacionan entre sí. Sin este paso, la aplicación no tendrá dónde guardar la información.

**Pasos a seguir:**

1. En el dashboard de Supabase, ve a **SQL Editor** en el menú lateral izquierdo

2. Haz clic en **New query** (Nueva consulta) para abrir el editor SQL

3. Busca en tu proyecto local el archivo `supabase-schema.sql` (debe estar en la raíz del proyecto, junto a `package.json`)

4. Abre ese archivo con un editor de texto y copia **todo su contenido**

5. Pega el contenido completo en el editor SQL de Supabase

6. Haz clic en **Run** (Ejecutar) o presiona `Ctrl + Enter` (o `Cmd + Enter` en Mac)

7. Verifica que aparezca un mensaje de éxito indicando que las tablas se crearon correctamente

**Qué hace este script:**
- Crea todas las tablas necesarias (usuarios, maquinarias, mantenimientos, combustible, repuestos, etc.)
- Configura las relaciones entre las tablas (claves foráneas)
- Establece las políticas de seguridad básicas (Row Level Security)

---

## Punto 8: Verificar la Instalación y Ejecutar en Modo Desarrollo

**¿Qué estamos haciendo?**  
Iniciamos el servidor de desarrollo local que permite ejecutar la aplicación en tu computadora. Esto nos permite probar que todo esté funcionando correctamente antes de ponerlo en producción.

**Comandos a ejecutar:**

1. Asegúrate de estar en la carpeta del proyecto en la terminal. Si no estás, ejecuta:
```bash
cd agrotrack-futamaq-web
```

2. Ejecuta el comando para iniciar el servidor de desarrollo:
```bash
npm run dev
```

**Alternativa para Windows (si el comando anterior no funciona):**
```bash
npm run dev:next
```

3. Espera a que aparezca un mensaje indicando que el servidor está corriendo. Deberías ver algo como:
   ```
   ✓ Ready on http://localhost:3000
   ```

4. Abre tu navegador web y ve a: [http://localhost:3000](http://localhost:3000)

**Qué deberías ver:**
- La aplicación debería cargar correctamente
- Deberías poder ver la página de inicio o login
- No deberían aparecer errores en la consola del navegador (presiona F12 → Console para verla)

**Si hay errores:**
- Revisa que todas las variables de entorno en `.env.local` estén correctamente configuradas
- Verifica que la base de datos se haya creado correctamente (Punto 7)
- Revisa la terminal donde ejecutaste `npm run dev` para ver mensajes de error específicos

---

## Punto 9: Crear el Primer Usuario Administrador

**¿Qué estamos haciendo?**  
Creamos el primer usuario del sistema con permisos de administrador. Este usuario será el que puedas usar para iniciar sesión en la aplicación y gestionar todos los aspectos del sistema.

**Pasos a seguir (sin comandos, es una configuración web):**

1. En el dashboard de Supabase, ve a **Authentication** → **Users** en el menú lateral izquierdo

2. Haz clic en **Add user** → **Create new user**

3. Completa el formulario con la siguiente información:
   - **Email**: Ingresa un email válido (ejemplo: `admin@futamaq.cl`)
   - **Password**: Crea una contraseña segura (guárdala en un lugar seguro)
   - **Auto Confirm User**: **Activa esta opción** para que el usuario pueda iniciar sesión inmediatamente sin necesidad de confirmar el email

4. Haz clic en **Create user**

5. **Opcional - Asignar rol de administrador:**
   - Ve a **SQL Editor** en Supabase
   - Ejecuta una consulta para actualizar el rol del usuario (esto depende de cómo esté configurado el sistema de roles en tu proyecto)

**Nota:** Dependiendo de cómo esté configurado el sistema de roles, es posible que necesites ejecutar una consulta SQL adicional para asignar el rol de administrador al usuario. Consulta la documentación del proyecto para más detalles.

---

## Punto 10: Verificar que Todo Funciona Correctamente

**¿Qué estamos haciendo?**  
Realizamos una verificación final para asegurarnos de que todos los componentes del sistema están funcionando correctamente. Esto nos permite detectar cualquier problema antes de comenzar a usar el sistema en producción.

**Pasos de verificación:**

1. **Verifica la conexión a Supabase:**
   - En la aplicación (http://localhost:3000), intenta iniciar sesión con el usuario que creaste en el Punto 9
   - Si puedes iniciar sesión correctamente, la conexión a Supabase está funcionando

2. **Verifica que las páginas carguen:**
   - Navega por las diferentes secciones del sistema usando el menú lateral:
     - Dashboard
     - Maquinarias
     - Mantenimientos
     - Combustible
     - Repuestos
     - Reportes
   - Verifica que no aparezcan errores en la consola del navegador (presiona F12 → Console)

3. **Verifica la base de datos:**
   - En Supabase, ve a **Table Editor** en el menú lateral
   - Verifica que existan las tablas principales: `usuarios`, `maquinarias`, `mantenimientos`, `combustible`, `repuestos`, etc.
   - Si las tablas existen, la base de datos está configurada correctamente

4. **Verifica el modo oscuro:**
   - El sistema debería iniciar en modo oscuro por defecto
   - Busca el botón de cambio de tema (generalmente en la barra superior)
   - Verifica que puedas cambiar entre modo claro y oscuro sin problemas

**Si todo funciona correctamente, ¡la instalación está completa y puedes comenzar a usar el sistema!**

---

## Solución de Problemas Comunes

### Error: "Cannot find module"
**Solución:** Ejecuta `npm install` nuevamente para reinstalar las dependencias.

### Error: "Invalid API key" o problemas de conexión a Supabase
**Solución:** Verifica que las variables de entorno en `.env.local` sean correctas y que no tengan espacios extra.

### Error: "Table does not exist"
**Solución:** Asegúrate de haber ejecutado el archivo `supabase-schema.sql` en el SQL Editor de Supabase.

### El servidor no inicia en Windows
**Solución:** Usa `npm run dev:next` en lugar de `npm run dev`, o verifica que PowerShell tenga los permisos necesarios.

### Problemas con el modo oscuro
**Solución:** Limpia la caché del navegador (Ctrl + Shift + Delete) y recarga la página.

---

## Próximos Pasos

Una vez completada la instalación:

1. Revisa la **Guía de Usuario** para aprender a usar el sistema
2. Revisa la **Guía de Mantenimiento** para conocer las tareas de mantenimiento periódicas
3. Configura los datos iniciales (maquinarias, usuarios, etc.)
4. Personaliza la configuración según las necesidades de tu empresa

---

**¿Necesitas ayuda?** Revisa la documentación del proyecto o contacta al equipo de desarrollo.

