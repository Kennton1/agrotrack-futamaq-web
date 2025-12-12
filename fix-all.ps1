Write-Host "=== SOLUCION COMPLETA DE PROBLEMAS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Detener todos los procesos de Node
Write-Host "1. Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "   OK" -ForegroundColor Green

# 2. Eliminar .next
Write-Host "2. Eliminando cache de Next.js..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "   OK: .next eliminado" -ForegroundColor Green
} else {
    Write-Host "   OK: No existe .next" -ForegroundColor Gray
}

# 3. Eliminar node_modules/.cache
Write-Host "3. Eliminando cache de node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   OK: Cache eliminado" -ForegroundColor Green
} else {
    Write-Host "   OK: No existe cache" -ForegroundColor Gray
}

# 4. Limpiar cache de npm
Write-Host "4. Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   OK" -ForegroundColor Green

Write-Host ""
Write-Host "=== LIMPIEZA COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "AHORA HAZ LO SIGUIENTE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. EN EL NAVEGADOR (Chrome/Edge):" -ForegroundColor Yellow
Write-Host "   a) Abre DevTools (F12)" -ForegroundColor White
Write-Host "   b) Ve a Application > Service Workers" -ForegroundColor White
Write-Host "   c) Si hay service workers, haz clic en 'Unregister' en TODOS" -ForegroundColor White
Write-Host "   d) Ve a Application > Storage" -ForegroundColor White
Write-Host "   e) Haz clic en 'Clear site data'" -ForegroundColor White
Write-Host "   f) Cierra y vuelve a abrir el navegador" -ForegroundColor White
Write-Host ""
Write-Host "2. REINICIA EL SERVIDOR:" -ForegroundColor Yellow
Write-Host "   Ejecuta: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. ESPERA 15-20 SEGUNDOS para que compile" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. RECARGA LA PAGINA:" -ForegroundColor Yellow
Write-Host "   Presiona Ctrl+Shift+R (recarga forzada)" -ForegroundColor White
Write-Host ""





