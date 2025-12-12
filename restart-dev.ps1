Write-Host "=== REINICIANDO SERVIDOR DE DESARROLLO ===" -ForegroundColor Cyan
Write-Host ""

# Detener procesos de Node
Write-Host "Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK: Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Limpiar .next
Write-Host "Limpiando cache de Next.js..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "OK: Cache limpiado" -ForegroundColor Green
}
Write-Host ""

# Iniciar servidor
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Servidor iniciado en nueva ventana" -ForegroundColor Green
Write-Host ""
Write-Host "Espera 10-15 segundos para que el servidor compile" -ForegroundColor Cyan
Write-Host "Luego recarga la pagina en el navegador (Ctrl+Shift+R)" -ForegroundColor Cyan
Write-Host ""





