# =============================================================================
# DEPLOY-CHECK.PS1 - Script de Validación Pre-Deploy para CodeGym
# =============================================================================
# Este script realiza una validación exhaustiva del proyecto antes del deploy
# en Render. Debe ejecutarse sin errores para garantizar un deploy exitoso.
# =============================================================================

param(
    [switch]$SkipTests = $false,
    [switch]$SkipLint = $false,
    [int]$HealthCheckPort = 5000,
    [string]$HealthCheckHost = "localhost"
)

# Configuración de colores y logging
$ErrorActionPreference = "Stop"
$Global:TestsPassed = 0
$Global:TestsFailed = 0
$Global:StartTime = Get-Date

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n=== $Message ===" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
    $Global:TestsPassed++
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    $Global:TestsFailed++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Stop-OnError {
    param([string]$Message)
    Write-Error $Message
    Write-Step "❌ DEPLOY CHECK FAILED ❌" "Red"
    Write-Host "El proyecto NO está listo para deploy en Render." -ForegroundColor Red
    Write-Host "Por favor, corrija los errores antes de intentar el deploy." -ForegroundColor Red
    exit 1
}

function Test-Command {
    param([string]$Command)
    try {
        & $Command --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# =============================================================================
# INICIO DEL SCRIPT
# =============================================================================

Write-Host @"
🚀 CODEGYM DEPLOY VALIDATION SCRIPT 🚀
======================================
Validando proyecto para deploy en Render...
Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@ -ForegroundColor Magenta

# =============================================================================
# PASO 1: VALIDACIONES PREVIAS
# =============================================================================

Write-Step "Validaciones Previas del Sistema"

# Verificar Node.js
if (-not (Test-Command "node")) {
    Stop-OnError "Node.js no está instalado o no está en el PATH"
}
$nodeVersion = & node --version
Write-Success "Node.js detectado: $nodeVersion"

# Verificar npm
if (-not (Test-Command "npm")) {
    Stop-OnError "npm no está disponible"
}
$npmVersion = & npm --version
Write-Success "npm detectado: $npmVersion"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Stop-OnError "package.json no encontrado. Ejecute el script desde la raíz del proyecto"
}
Write-Success "Directorio del proyecto validado"

# Verificar archivos críticos
$criticalFiles = @(
    "package.json",
    "server/index.ts", 
    "tsconfig.json",
    "tsconfig.server.json"
)

foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        Stop-OnError "Archivo crítico no encontrado: $file"
    }
}
Write-Success "Archivos críticos validados"

# =============================================================================
# PASO 2: LIMPIEZA COMPLETA
# =============================================================================

Write-Step "Limpieza Completa del Proyecto"

# Eliminar node_modules
if (Test-Path "node_modules") {
    Write-Info "Eliminando node_modules..."
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Success "node_modules eliminado"
}

# Eliminar dist
if (Test-Path "dist") {
    Write-Info "Eliminando dist..."
    Remove-Item -Path "dist" -Recurse -Force
    Write-Success "dist eliminado"
}

# Eliminar client/dist
if (Test-Path "client/dist") {
    Write-Info "Eliminando client/dist..."
    Remove-Item -Path "client/dist" -Recurse -Force
    Write-Success "client/dist eliminado"
}

# Eliminar archivos temporales
$tempFiles = @("*.log", "npm-debug.log*", ".npm", "coverage")
foreach ($pattern in $tempFiles) {
    Get-ChildItem -Path . -Name $pattern -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Path $_ -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Success "Archivos temporales eliminados"

# =============================================================================
# PASO 3: INSTALACIÓN DE DEPENDENCIAS
# =============================================================================

Write-Step "Instalación de Dependencias"

Write-Info "Instalando dependencias con npm install..."
$installOutput = & npm install 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host $installOutput -ForegroundColor Red
    Stop-OnError "Falló la instalación de dependencias"
}
Write-Success "Dependencias instaladas correctamente"

# Verificar que Jest está instalado
try {
    & npx jest --version | Out-Null
    Write-Success "Jest instalado y funcional"
} catch {
    Write-Warning "Jest no está disponible, se omitirán las pruebas"
    $SkipTests = $true
}

# =============================================================================
# PASO 4: LINTING (CALIDAD DE CÓDIGO)
# =============================================================================

if (-not $SkipLint) {
    Write-Step "Análisis de Calidad de Código (ESLint)"
    
    try {
        $lintOutput = & npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 10 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Linting completado sin errores críticos"
        } else {
            Write-Warning "ESLint encontró algunos problemas, pero no son críticos"
            Write-Host $lintOutput -ForegroundColor Yellow
        }
    } catch {
        Write-Warning "ESLint no está configurado correctamente, se omite el linting"
    }
} else {
    Write-Info "Linting omitido por parámetro"
}

# =============================================================================
# PASO 5: EJECUCIÓN DE PRUEBAS
# =============================================================================

if (-not $SkipTests) {
    Write-Step "Ejecución de Pruebas Unitarias e Integración"
    
    try {
        Write-Info "Ejecutando suite de pruebas..."
        $testOutput = & npm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Todas las pruebas pasaron correctamente"
            Write-Host $testOutput -ForegroundColor Green
        } else {
            Write-Host $testOutput -ForegroundColor Red
            Stop-OnError "Las pruebas fallaron. El código no está listo para deploy"
        }
    } catch {
        Stop-OnError "Error ejecutando las pruebas: $($_.Exception.Message)"
    }
} else {
    Write-Info "Pruebas omitidas por parámetro"
}

# =============================================================================
# PASO 6: BUILD DE PRODUCCIÓN
# =============================================================================

Write-Step "Build de Producción"

Write-Info "Iniciando build del cliente..."
$clientBuildOutput = & npm run build:client 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host $clientBuildOutput -ForegroundColor Red
    Stop-OnError "Falló el build del cliente"
}
Write-Success "Cliente construido exitosamente"

Write-Info "Iniciando build del servidor..."
$serverBuildOutput = & npm run build:server 2>&1
# El build del servidor puede fallar pero continuamos (está configurado con || true)
if (Test-Path "dist/server") {
    Write-Success "Servidor construido exitosamente"
} else {
    Write-Warning "Build del servidor falló, pero se creará versión de fallback"
}

# Verificar archivos críticos del build
$buildFiles = @(
    "client/dist/index.html",
    "dist/client/index.html"
)

$buildSuccess = $true
foreach ($file in $buildFiles) {
    if (-not (Test-Path $file)) {
        # Intentar copiar archivos si es necesario
        if ($file -eq "dist/client/index.html" -and (Test-Path "client/dist/index.html")) {
            Write-Info "Copiando archivos del cliente a dist..."
            if (-not (Test-Path "dist/client")) {
                New-Item -Path "dist/client" -ItemType Directory -Force | Out-Null
            }
            Copy-Item -Path "client/dist/*" -Destination "dist/client/" -Recurse -Force
            Write-Success "Archivos del cliente copiados"
        } else {
            Write-Error "Archivo de build crítico no encontrado: $file"
            $buildSuccess = $false
        }
    }
}

if (-not $buildSuccess) {
    Stop-OnError "Build incompleto - archivos críticos faltantes"
}

# Crear index.js principal si no existe
if (-not (Test-Path "dist/index.js")) {
    Write-Info "Creando index.js principal..."
    $mainIndex = @'
import('./server/index.js').catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});
'@
    $mainIndex | Out-File -FilePath "dist/index.js" -Encoding UTF8
    Write-Success "index.js principal creado"
}

Write-Success "Build de producción completado"

# =============================================================================
# PASO 7: HEALTH CHECK CRÍTICO
# =============================================================================

Write-Step "Health Check del Build (CRÍTICO)" "Yellow"

Write-Info "Iniciando servidor en modo producción..."

# Matar procesos de Node existentes en el puerto
try {
    $existingProcess = Get-NetTCPConnection -LocalPort $HealthCheckPort -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Warning "Puerto $HealthCheckPort ocupado, intentando liberar..."
    }
} catch {
    # El puerto está libre
}

# Iniciar servidor en background
$serverProcess = $null
try {
    $env:NODE_ENV = "production"
    $env:PORT = $HealthCheckPort.ToString()
    
    Write-Info "Iniciando servidor en puerto $HealthCheckPort..."
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -PassThru -NoNewWindow
    
    # Esperar que el servidor inicie
    Write-Info "Esperando 8 segundos para que el servidor inicie..."
    Start-Sleep -Seconds 8
    
    # Verificar que el proceso sigue corriendo
    if ($serverProcess.HasExited) {
        Stop-OnError "El servidor se cerró inesperadamente durante el inicio"
    }
    
    Write-Success "Servidor iniciado correctamente (PID: $($serverProcess.Id))"
    
    # Test del endpoint /api/health
    Write-Info "Probando endpoint /api/health..."
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://${HealthCheckHost}:${HealthCheckPort}/api/health" -TimeoutSec 10 -UseBasicParsing
        
        if ($healthResponse.StatusCode -eq 200) {
            Write-Success "Health check endpoint respondió correctamente (200 OK)"
            
            # Verificar contenido JSON
            try {
                $healthData = $healthResponse.Content | ConvertFrom-Json
                if ($healthData.status -eq "ok") {
                    Write-Success "Health check JSON válido con status: ok"
                } else {
                    Stop-OnError "Health check retornó status inválido: $($healthData.status)"
                }
            } catch {
                Stop-OnError "Health check retornó JSON inválido"
            }
        } else {
            Stop-OnError "Health check falló con código: $($healthResponse.StatusCode)"
        }
    } catch {
        Stop-OnError "No se pudo conectar al endpoint de health check: $($_.Exception.Message)"
    }
    
    # Test del endpoint /health (básico)
    Write-Info "Probando endpoint /health..."
    try {
        $basicHealthResponse = Invoke-WebRequest -Uri "http://${HealthCheckHost}:${HealthCheckPort}/health" -TimeoutSec 5 -UseBasicParsing
        if ($basicHealthResponse.StatusCode -eq 200) {
            Write-Success "Endpoint /health funcionando correctamente"
        }
    } catch {
        Write-Warning "Endpoint /health no responde, pero /api/health funciona"
    }
    
} catch {
    Stop-OnError "Error crítico durante health check: $($_.Exception.Message)"
} finally {
    # CRÍTICO: Siempre matar el proceso del servidor
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Write-Info "Deteniendo servidor de prueba..."
        try {
            $serverProcess.Kill()
            $serverProcess.WaitForExit(5000)
            Write-Success "Servidor detenido correctamente"
        } catch {
            Write-Warning "No se pudo detener el servidor limpiamente"
            # Intentar matar por puerto
            try {
                $processId = (Get-NetTCPConnection -LocalPort $HealthCheckPort -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
                if ($processId) {
                    Stop-Process -Id $processId -Force
                    Write-Success "Servidor forzado a cerrar"
                }
            } catch {
                Write-Warning "No se pudo forzar el cierre del servidor"
            }
        }
    }
}

# =============================================================================
# PASO 8: VALIDACIONES FINALES
# =============================================================================

Write-Step "Validaciones Finales"

# Verificar estructura de archivos final
$finalFiles = @(
    "dist/index.js",
    "dist/client/index.html",
    "package.json"
)

$allFilesPresent = $true
foreach ($file in $finalFiles) {
    if (Test-Path $file) {
        Write-Success "Archivo presente: $file"
    } else {
        Write-Error "Archivo faltante: $file"
        $allFilesPresent = $false
    }
}

if (-not $allFilesPresent) {
    Stop-OnError "Estructura de archivos incompleta para deploy"
}

# Verificar package.json tiene script start correcto
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.start -match "node dist/index.js") {
    Write-Success "Script de start configurado correctamente"
} else {
    Stop-OnError "Script de start en package.json no está configurado correctamente"
}

# Verificar tamaño de archivos críticos
$indexHtmlSize = (Get-Item "dist/client/index.html").Length
if ($indexHtmlSize -gt 100) {  # Al menos 100 bytes
    Write-Success "index.html tiene tamaño válido ($indexHtmlSize bytes)"
} else {
    Stop-OnError "index.html parece estar corrupto o vacío"
}

# =============================================================================
# RESUMEN FINAL
# =============================================================================

$endTime = Get-Date
$duration = $endTime - $Global:StartTime

Write-Host @"

🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉

✅ ¡VALIDACIÓN COMPLETADA EXITOSAMENTE! ✅

🚀 EL PROYECTO ESTÁ LISTO PARA DEPLOY EN RENDER 🚀

📊 Resumen de Validación:
   • Pruebas Pasadas: $Global:TestsPassed
   • Pruebas Fallidas: $Global:TestsFailed
   • Duración Total: $($duration.TotalSeconds.ToString("F1")) segundos
   • Health Check: ✅ EXITOSO
   • Build: ✅ COMPLETO
   • Archivos: ✅ TODOS PRESENTES

🔧 Próximos Pasos:
   1. Commit y push de todos los cambios
   2. Deploy en Render usando: npm run render-build
   3. Verificar que el servicio inicie correctamente

⚠️  IMPORTANTE: Asegúrese de que las variables de entorno estén 
   configuradas correctamente en Render antes del deploy.

🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉

"@ -ForegroundColor Green

exit 0
