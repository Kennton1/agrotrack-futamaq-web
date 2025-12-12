# 📦 Guía de Instalación de Node.js para AgroTrack FUTAMAQ

## ⚠️ Problema Detectado

El error `npm no se reconoce como nombre de un cmdlet` indica que **Node.js no está instalado** en tu sistema Windows.

## 🚀 Solución: Instalar Node.js

### Opción 1: Instalación Manual (Recomendada)

1. **Descargar Node.js:**
   - Ve a: https://nodejs.org/es/download/
   - Descarga la versión **LTS (Long Term Support)** - Recomendada para la mayoría de usuarios
   - Selecciona el instalador para Windows (archivo `.msi`)

2. **Ejecutar el Instalador:**
   - Haz doble clic en el archivo descargado
   - Sigue el asistente de instalación
   - **IMPORTANTE:** Asegúrate de marcar la opción "Add to PATH" durante la instalación
   - Completa la instalación

3. **Verificar la Instalación:**
   - Cierra y vuelve a abrir PowerShell/Terminal
   - Ejecuta estos comandos para verificar:
     ```powershell
     node --version
     npm --version
     ```
   - Deberías ver números de versión (ej: `v20.11.0` y `10.2.4`)

### Opción 2: Instalación con Chocolatey (Si ya lo tienes)

Si tienes Chocolatey instalado, ejecuta:
```powershell
choco install nodejs-lts -y
```

### Opción 3: Instalación con winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ Después de Instalar Node.js

Una vez instalado Node.js:

1. **Cierra y vuelve a abrir PowerShell/Terminal** (importante para que reconozca los nuevos comandos)

2. **Navega al proyecto:**
   ```powershell
   cd F:\descargas\agrotrack-futamaq-web
   ```

3. **Instala las dependencias:**
   ```powershell
   npm install
   ```

4. **Ejecuta el proyecto:**
   ```powershell
   npm run dev
   ```

## 📝 Notas Importantes

- **Reinicia PowerShell/Terminal** después de instalar Node.js para que reconozca los comandos
- El proyecto requiere **Node.js 18 o superior**
- La versión LTS es la más estable y recomendada

## 🆘 Si Persisten los Problemas

1. Verifica que Node.js está en el PATH:
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern 'node'
   ```

2. Si no aparece, agrega manualmente Node.js al PATH:
   - Busca "Variables de entorno" en Windows
   - Agrega la ruta de Node.js (normalmente: `C:\Program Files\nodejs\`)

3. Reinicia tu computadora si es necesario

---

**Una vez instalado Node.js, podrás ejecutar `npm install` y `npm run dev` sin problemas.** 🎉


