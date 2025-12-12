# ⚠️ IMPORTANTE: Ejecuta los comandos desde el directorio correcto

## ❌ Error que estás viendo:
```
ENOENT: no such file or directory, open 'C:\Users\ignac\package.json'
```

**Esto significa que estás ejecutando los comandos desde el directorio incorrecto.**

---

## ✅ SOLUCIÓN: Navega al directorio del proyecto primero

### En CMD (Símbolo del sistema):
```cmd
cd F:\descargas\agrotrack-futamaq-web
npm.cmd install
npm.cmd run dev
```

### En PowerShell:
```powershell
cd F:\descargas\agrotrack-futamaq-web
npm.cmd install
npm.cmd run dev
```

---

## 📋 Pasos Completos:

1. **Abre tu terminal (CMD o PowerShell)**

2. **Navega al proyecto:**
   ```cmd
   cd F:\descargas\agrotrack-futamaq-web
   ```

3. **Verifica que estás en el lugar correcto:**
   ```cmd
   dir package.json
   ```
   Deberías ver el archivo `package.json` listado.

4. **Instala las dependencias:**
   ```cmd
   npm.cmd install
   ```
   ⏳ Esto tomará varios minutos...

5. **Ejecuta el proyecto:**
   ```cmd
   npm.cmd run dev
   ```

6. **Abre tu navegador en:**
   ```
   http://localhost:3000
   ```

---

## 🔍 Cómo saber si estás en el directorio correcto:

Tu prompt debería mostrar:
```
F:\descargas\agrotrack-futamaq-web>
```

**NO** debería mostrar:
```
C:\Users\ignac>
```

---

## 💡 Tip: Crear un acceso directo

Puedes crear un script `.bat` para facilitar esto:

**`iniciar-proyecto.bat`:**
```batch
@echo off
cd /d F:\descargas\agrotrack-futamaq-web
npm.cmd run dev
pause
```

Haz doble clic en este archivo para iniciar el proyecto directamente.

---

**¡Recuerda siempre navegar al directorio del proyecto antes de ejecutar npm!** 🚀


