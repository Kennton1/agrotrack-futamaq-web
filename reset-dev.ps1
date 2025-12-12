Write-Host "=== LIMPIEZA COMPLETA DEL PROYECTO ===" -ForegroundColor Cyan
Write-Host ""

# 1. Detener procesos de Node
Write-Host "1. Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Eliminar carpeta .next
Write-Host "2. Eliminando carpeta .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "   OK: Carpeta .next eliminada" -ForegroundColor Green
} else {
    Write-Host "   OK: No existe carpeta .next" -ForegroundColor Gray
}

# 3. Eliminar node_modules/.cache
Write-Host "3. Eliminando cache de node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   OK: Cache de node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "   OK: No existe cache de node_modules" -ForegroundColor Gray
}

# 4. Limpiar cache de npm
Write-Host "4. Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   OK: Cache de npm limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "=== LIMPIEZA COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "1. En el navegador (Chrome/Edge):" -ForegroundColor White
Write-Host "   - Abre DevTools (F12)" -ForegroundColor White
Write-Host "   - Ve a Application > Service Workers" -ForegroundColor White
Write-Host "   - Haz clic en 'Unregister' en todos los service workers" -ForegroundColor White
Write-Host "   - Ve a Application > Storage" -ForegroundColor White
Write-Host "   - Haz clic en 'Clear site data'" -ForegroundColor White
Write-Host ""
Write-Host "2. Reinicia el servidor:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Recarga la pagina con Ctrl+Shift+R" -ForegroundColor White
Write-Host ""





