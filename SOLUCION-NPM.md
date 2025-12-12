# 🔧 Solución: Problema de Ejecución de npm en PowerShell

## ❌ Error que estás viendo:
```
npm : No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 
porque la ejecución de scripts está deshabilitada en este sistema.
```

## ✅ SOLUCIÓN RÁPIDA (Elige una opción)

---

### **OPCIÓN 1: Usar `npm.cmd` (Más Rápida y Segura)**

En lugar de usar `npm`, usa `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

**Ventajas:**
- ✅ No requiere cambiar configuraciones del sistema
- ✅ Funciona inmediatamente
- ✅ Es más seguro

**Ejemplos:**
```powershell
# Instalar dependencias
npm.cmd install

# Ejecutar proyecto
npm.cmd run dev

# Ver versión
npm.cmd --version
```

---

### **OPCIÓN 2: Cambiar Política de Ejecución de PowerShell**

Si prefieres usar `npm` directamente:

1. **Abre PowerShell como Administrador:**
   - Presiona `Windows + X`
   - Selecciona "Windows PowerShell (Administrador)"

2. **Ejecuta este comando:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Confirma con "S" (Sí)**

4. **Cierra y vuelve a abrir PowerShell**

5. **Ahora `npm` debería funcionar:**
   ```powershell
   npm install
   npm run dev
   ```

---

### **OPCIÓN 3: Usar CMD (Símbolo del Sistema) en lugar de PowerShell**

CMD no tiene este problema:

1. Abre **CMD** (Símbolo del sistema)
2. Navega a tu proyecto:
   ```cmd
   cd F:\descargas\agrotrack-futamaq-web
   ```
3. Ejecuta normalmente:
   ```cmd
   npm install
   npm run dev
   ```

---

## 🚀 Instalar Dependencias del Proyecto

Una vez que npm funcione (con cualquiera de las opciones anteriores):

```powershell
# Navega al proyecto (si no estás ahí)
cd F:\descargas\agrotrack-futamaq-web

# Instala dependencias
npm.cmd install
# O si ya cambiaste la política:
npm install

# Esto tomará unos minutos...
```

## ▶️ Ejecutar el Proyecto

```powershell
npm.cmd run dev
# O si ya cambiaste la política:
npm run dev
```

El proyecto estará disponible en: **http://localhost:3000**

---

## 📝 Resumen

- **Problema:** PowerShell bloquea la ejecución de scripts npm
- **Solución más rápida:** Usa `npm.cmd` en lugar de `npm`
- **Solución permanente:** Cambia la política de ejecución de PowerShell
- **Alternativa:** Usa CMD en lugar de PowerShell

---

## ✅ Verificar que Funciona

Después de instalar, verifica:

```powershell
npm.cmd --version
node --version
```

Ambos deberían mostrar números de versión.

---

**¡Elige la opción que prefieras y continúa con la instalación!** 🎉


