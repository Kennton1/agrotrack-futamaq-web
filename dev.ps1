# Script para iniciar Next.js y abrir Chrome
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green

# Buscar Chrome en ubicaciones comunes
$chromePaths = @(
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (-not $chromePath) {
    Write-Host "Chrome no encontrado. Intentando abrir con el navegador predeterminado..." -ForegroundColor Yellow
    $chromePath = "chrome.exe"
}

# Abrir Chrome después de 3 segundos en background
Start-Job -ScriptBlock {
    param($chromeExe)
    Start-Sleep -Seconds 3
    Write-Host "Abriendo Chrome..." -ForegroundColor Green
    Start-Process $chromeExe -ArgumentList "http://localhost:3000"
} -ArgumentList $chromePath | Out-Null

# Iniciar Next.js sin abrir navegador automáticamente
$env:BROWSER = "none"
npm run dev:next

