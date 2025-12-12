# 🚨 SOLUCIÓN RÁPIDA - Instalar Node.js

## ❌ Problema Actual
```
"npm" no se reconoce como un comando interno o externo
```
**Esto significa que Node.js NO está instalado en tu PC.**

---

## ✅ SOLUCIÓN PASO A PASO

### **OPCIÓN 1: Instalación Automática con winget (Más Rápida)**

Si tienes Windows 10/11 moderno, ejecuta esto en PowerShell o CMD **como Administrador**:

```powershell
winget install OpenJS.NodeJS.LTS
```

**Pasos:**
1. Presiona `Windows + X`
2. Selecciona "Windows PowerShell (Administrador)" o "Terminal (Administrador)"
3. Ejecuta el comando de arriba
4. Espera a que termine la instalación
5. **Cierra y vuelve a abrir** tu terminal
6. Verifica con: `node --version` y `npm --version`

---

### **OPCIÓN 2: Instalación Manual (Si winget no funciona)**

#### Paso 1: Descargar Node.js
1. Abre tu navegador
2. Ve a: **https://nodejs.org/es/**
3. Haz clic en el botón verde grande que dice **"Descargar Node.js (LTS)"**
4. Se descargará un archivo `.msi` (ejemplo: `node-v20.11.0-x64.msi`)

#### Paso 2: Instalar Node.js
1. Ve a tu carpeta de Descargas
2. Haz **doble clic** en el archivo `.msi` descargado
3. Sigue el asistente de instalación:
   - Haz clic en "Siguiente" en todas las pantallas
   - **IMPORTANTE:** En la pantalla de "Custom Setup", asegúrate de que esté marcada la opción **"Automatically install the necessary tools"**
   - Haz clic en "Instalar"
   - Espera a que termine (2-3 minutos)
   - Haz clic en "Finalizar"

#### Paso 3: Verificar Instalación
1. **Cierra completamente** tu terminal/PowerShell/CMD
2. **Abre una nueva ventana** de terminal
3. Ejecuta estos comandos:
   ```cmd
   node --version
   npm --version
   ```
4. Deberías ver algo como:
   ```
   v20.11.0
   10.2.4
   ```

#### Paso 4: Instalar Dependencias del Proyecto
1. Navega a tu proyecto:
   ```cmd
   cd F:\descargas\agrotrack-futamaq-web
   ```
2. Instala las dependencias:
   ```cmd
   npm install
   ```
3. Esto tomará unos minutos. Espera a que termine.

#### Paso 5: Ejecutar el Proyecto
```cmd
npm run dev
```

---

## 🔍 Verificar si Node.js está Instalado

Ejecuta en tu terminal:
```cmd
node --version
```

- ✅ Si muestra un número (ej: `v20.11.0`) → **Node.js está instalado**
- ❌ Si dice "no se reconoce" → **Node.js NO está instalado** → Sigue los pasos de arriba

---

## ⚠️ Problemas Comunes

### "Sigue sin funcionar después de instalar"
1. **Cierra TODAS las ventanas de terminal**
2. **Reinicia tu computadora** (a veces es necesario)
3. Abre una nueva terminal y prueba de nuevo

### "No tengo permisos de administrador"
- Usa la Opción 2 (instalación manual)
- No necesitas permisos de administrador para instalar Node.js normalmente

### "No sé dónde descargar"
- Ve directamente a: **https://nodejs.org/es/**
- Descarga la versión LTS (la recomendada)

---

## 📞 Después de Instalar

Una vez que Node.js esté instalado, ejecuta en tu proyecto:

```cmd
cd F:\descargas\agrotrack-futamaq-web
npm install
npm run dev
```

El proyecto debería iniciarse en: **http://localhost:3000**

---

**¡Sigue estos pasos y tu proyecto funcionará!** 🚀


