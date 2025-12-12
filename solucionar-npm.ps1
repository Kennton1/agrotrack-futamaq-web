# Script para solucionar el problema de ejecución de npm en PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Solucionando problema de npm" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar política de ejecución
Write-Host ""
Write-Host "Verificando política de ejecución..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy
Write-Host "Política actual: $currentPolicy" -ForegroundColor White

if ($currentPolicy -eq "Restricted") {
    Write-Host ""
    Write-Host "⚠️  La política está en 'Restricted'" -ForegroundColor Yellow
    Write-Host "Cambiando política a 'RemoteSigned'..." -ForegroundColor Yellow
    
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✅ Política cambiada exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se pudo cambiar la política automáticamente" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUCIÓN ALTERNATIVA:" -ForegroundColor Yellow
        Write-Host "Usa 'npm.cmd' en lugar de 'npm':" -ForegroundColor White
        Write-Host "  npm.cmd install" -ForegroundColor Cyan
        Write-Host "  npm.cmd run dev" -ForegroundColor Cyan
    }
}

# Probar npm
Write-Host ""
Write-Host "Probando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm funciona: $npmVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes usar 'npm install' normalmente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  npm aún no funciona con 'npm'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUCIÓN: Usa 'npm.cmd' en lugar de 'npm'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor White
    Write-Host "  npm.cmd install" -ForegroundColor Cyan
    Write-Host "  npm.cmd run dev" -ForegroundColor Cyan
    Write-Host "  npm.cmd --version" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


