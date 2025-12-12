# Script para solucionar problemas de desarrollo
Write-Host "Limpiando cache de Next.js..." -ForegroundColor Yellow

# Eliminar carpeta .next
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "Carpeta .next eliminada" -ForegroundColor Green
} else {
    Write-Host "No existe carpeta .next" -ForegroundColor Gray
}

# Eliminar node_modules/.cache si existe
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "Cache de node_modules eliminado" -ForegroundColor Green
}

# Limpiar cache de npm
Write-Host "Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host ""
Write-Host "Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "1. Cierra el servidor de desarrollo si esta corriendo (Ctrl+C)"
Write-Host "2. Ejecuta: npm run dev"
Write-Host "3. En el navegador, abre DevTools (F12) y:"
Write-Host "   - Ve a Application > Service Workers"
Write-Host "   - Haz clic en Unregister para desregistrar el service worker"
Write-Host "   - Ve a Application > Storage > Clear site data"
Write-Host "   - Recarga la pagina (Ctrl+Shift+R)"
