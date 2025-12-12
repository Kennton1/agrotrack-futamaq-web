# Script para instalar Node.js en Windows
# Ejecuta este script como Administrador: Click derecho > "Ejecutar con PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalador de Node.js para AgroTrack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js ya está instalado
Write-Host "Verificando si Node.js está instalado..." -ForegroundColor Yellow
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if ($nodeInstalled) {
    Write-Host "✅ Node.js ya está instalado!" -ForegroundColor Green
    Write-Host "Versión: $(node --version)" -ForegroundColor Green
    Write-Host "npm versión: $(npm --version)" -ForegroundColor Green
    exit 0
}

Write-Host "❌ Node.js NO está instalado" -ForegroundColor Red
Write-Host ""

# Intentar instalar con winget
Write-Host "Intentando instalar Node.js con winget..." -ForegroundColor Yellow
$wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue

if ($wingetAvailable) {
    Write-Host "✅ winget está disponible" -ForegroundColor Green
    Write-Host "Instalando Node.js LTS..." -ForegroundColor Yellow
    
    try {
        winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
        Write-Host "✅ Instalación completada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
        Write-Host "1. Cierra esta ventana de PowerShell" -ForegroundColor White
        Write-Host "2. Abre una nueva ventana de PowerShell o CMD" -ForegroundColor White
        Write-Host "3. Ejecuta: node --version" -ForegroundColor White
        Write-Host "4. Si funciona, ve a tu proyecto y ejecuta: npm install" -ForegroundColor White
    } catch {
        Write-Host "❌ Error al instalar con winget" -ForegroundColor Red
        Write-Host "Sigue las instrucciones manuales en SOLUCION-RAPIDA.md" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ winget no está disponible" -ForegroundColor Red
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  INSTALACIÓN MANUAL REQUERIDA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sigue estos pasos:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Abre tu navegador" -ForegroundColor White
    Write-Host "2. Ve a: https://nodejs.org/es/" -ForegroundColor Cyan
    Write-Host "3. Descarga la versión LTS (botón verde)" -ForegroundColor White
    Write-Host "4. Ejecuta el instalador .msi descargado" -ForegroundColor White
    Write-Host "5. Sigue el asistente (marca 'Add to PATH')" -ForegroundColor White
    Write-Host "6. Reinicia tu terminal después de instalar" -ForegroundColor White
    Write-Host ""
    Write-Host "¿Quieres que abra el navegador ahora? (S/N)" -ForegroundColor Yellow
    $respuesta = Read-Host
    
    if ($respuesta -eq "S" -or $respuesta -eq "s") {
        Start-Process "https://nodejs.org/es/"
    }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


