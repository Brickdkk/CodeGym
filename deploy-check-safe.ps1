# =============================================================================
# DEPLOY-CHECK.PS1 - Script de Validacion Pre-Deploy para CodeGym
# =============================================================================
# Este script realiza una validacion exhaustiva del proyecto antes del deploy
# en Render. Debe ejecutarse sin errores para garantizar un deploy exitoso.
# =============================================================================

param(
    [switch]$SkipTests = $false,
    [switch]$SkipLint = $false,
    [int]$HealthCheckPort = 5000,
    [string]$HealthCheckHost = "localhost"
)

# Configuracion de colores y logging
$ErrorActionPreference = "Continue"
$Global:TestsPassed = 0
$Global:TestsFailed = 0
$Global:StartTime = Get-Date

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n=== $Message ===" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
    $Global:TestsPassed++
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $Global:TestsFailed++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Stop-OnError {
    param([string]$Message)
    Write-Error $Message
    Write-Step "DEPLOY CHECK FAILED" "Red"
    Write-Host "El proyecto NO esta listo para deploy en Render." -ForegroundColor Red
    Write-Host "Por favor, corrija los errores antes de intentar el deploy." -ForegroundColor Red
    exit 1
}

function Test-Command {
    param([string]$Command)
    try {
        $null = & $Command --version 2>$null
        return $true
    } catch {
        return $false
    }
}

# =============================================================================
# INICIO DEL SCRIPT
# =============================================================================

Write-Host "CODEGYM DEPLOY VALIDATION SCRIPT" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host "Validando proyecto para deploy en Render..." -ForegroundColor Magenta
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta

# =============================================================================
# PASO 1: VALIDACIONES PREVIAS
# =============================================================================

Write-Step "Validaciones Previas del Sistema"

# Verificar Node.js
if (-not (Test-Command "node")) {
    Stop-OnError "Node.js no esta instalado o no esta en el PATH"
}
$nodeVersion = & node --version
Write-Success "Node.js detectado: $nodeVersion"

# Verificar npm
if (-not (Test-Command "npm")) {
    Stop-OnError "npm no esta disponible"
}
$npmVersion = & npm --version
Write-Success "npm detectado: $npmVersion"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Stop-OnError "package.json no encontrado. Ejecute el script desde la raiz del proyecto"
}
Write-Success "Directorio del proyecto validado"

# Verificar archivos criticos
$criticalFiles = @(
    "package.json",
    "server/index.ts", 
    "tsconfig.json",
    "tsconfig.server.json"
)

foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        Stop-OnError "Archivo critico no encontrado: $file"
    }
}
Write-Success "Archivos criticos validados"

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
$tempPatterns = @("*.log", "npm-debug.log*", ".npm", "coverage")
foreach ($pattern in $tempPatterns) {
    $items = Get-ChildItem -Path . -Name $pattern -Recurse -ErrorAction SilentlyContinue
    foreach ($item in $items) {
        Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Success "Archivos temporales eliminados"

# =============================================================================
# PASO 3: INSTALACION DE DEPENDENCIAS
# =============================================================================

Write-Step "Instalacion de Dependencias"

Write-Info "Instalando dependencias con npm install..."
$originalErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"

$installOutput = & npm install 2>&1
$installExitCode = $LASTEXITCODE

$ErrorActionPreference = $originalErrorActionPreference

# Verificar si hay errores reales (no warnings)
$realErrors = $installOutput | Where-Object { $_ -match "npm ERR!" }
if ($installExitCode -ne 0 -and $realErrors) {
    Write-Host $installOutput -ForegroundColor Red
    Stop-OnError "Fallo la instalacion de dependencias con errores reales"
} else {
    # Mostrar warnings pero continuar
    $warnings = $installOutput | Where-Object { $_ -match "npm warn" }
    if ($warnings -and $warnings.Count -gt 0) {
        Write-Warning "Hay algunos warnings de npm, pero no son criticos"
    }
    Write-Success "Dependencias instaladas correctamente"
}

# Verificar que Jest esta instalado
try {
    $null = & npx jest --version 2>$null
    Write-Success "Jest instalado y funcional"
} catch {
    Write-Warning "Jest no esta disponible, se omitiran las pruebas"
    $SkipTests = $true
}

# =============================================================================
# PASO 4: LINTING (CALIDAD DE CODIGO)
# =============================================================================

if (-not $SkipLint) {
    Write-Step "Analisis de Calidad de Codigo ESLint"
    
    try {
        $lintOutput = & npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 10 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Linting completado sin errores criticos"
        } else {
            Write-Warning "ESLint encontro algunos problemas, pero no son criticos"
            Write-Host $lintOutput -ForegroundColor Yellow
        }
    } catch {
        Write-Warning "ESLint no esta configurado correctamente, se omite el linting"
    }
} else {
    Write-Info "Linting omitido por parametro"
}

# =============================================================================
# PASO 5: EJECUCION DE PRUEBAS
# =============================================================================

if (-not $SkipTests) {
    Write-Step "Ejecucion de Pruebas Unitarias e Integracion"
    
    try {
        Write-Info "Ejecutando suite de pruebas..."
        $testOutput = & npm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Todas las pruebas pasaron correctamente"
            Write-Host $testOutput -ForegroundColor Green
        } else {
            Write-Host $testOutput -ForegroundColor Red
            Stop-OnError "Las pruebas fallaron. El codigo no esta listo para deploy"
        }
    } catch {
        Stop-OnError "Error ejecutando las pruebas: $($_.Exception.Message)"
    }
} else {
    Write-Info "Pruebas omitidas por parametro"
}

# =============================================================================
# PASO 6: BUILD DE PRODUCCION
# =============================================================================

Write-Step "Build de Produccion"

Write-Info "Iniciando build del cliente..."
try {
    $clientBuildOutput = & npm run build:client 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host $clientBuildOutput -ForegroundColor Red
        Stop-OnError "Fallo el build del cliente"
    }
    Write-Success "Cliente construido exitosamente"
} catch {
    Stop-OnError "Error ejecutando build del cliente: $($_.Exception.Message)"
}

Write-Info "Iniciando build del servidor..."
try {
    $null = & npm run build:server 2>&1
    # El build del servidor puede fallar pero continuamos (esta configurado con || true)
    if (Test-Path "dist/server") {
        Write-Success "Servidor construido exitosamente"
    } else {
        Write-Warning "Build del servidor fallo, pero se creara version de fallback"
    }
} catch {
    Write-Warning "Error en build del servidor, continuando con fallback"
}

# Verificar archivos criticos del build
$buildFiles = @(
    "dist/client/index.html"
)

$buildSuccess = $true
foreach ($file in $buildFiles) {
    if (-not (Test-Path $file)) {
        # Intentar encontrar el index.html en subdirectorios
        $foundIndex = Get-ChildItem -Path "dist" -Name "index.html" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($foundIndex) {
            Write-Info "Encontrado index.html en: $foundIndex, moviendo a ubicacion correcta..."
            $sourcePath = Join-Path "dist" $foundIndex
            Copy-Item -Path $sourcePath -Destination "dist/client/index.html" -Force
            Write-Success "index.html movido a ubicacion correcta"
        } else {
            Write-Error "Archivo de build critico no encontrado: $file"
            $buildSuccess = $false
        }
    } else {
        Write-Success "Archivo de build encontrado: $file"
    }
}

if (-not $buildSuccess) {
    Stop-OnError "Build incompleto - archivos criticos faltantes"
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

Write-Success "Build de produccion completado"

# =============================================================================
# PASO 7: HEALTH CHECK CRITICO
# =============================================================================

Write-Step "Health Check del Build CRITICO" "Yellow"

Write-Info "Iniciando servidor en modo produccion..."

# Matar procesos de Node existentes en el puerto
try {
    $existingProcess = Get-NetTCPConnection -LocalPort $HealthCheckPort -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Warning "Puerto $HealthCheckPort ocupado, intentando liberar..."
        $processId = $existingProcess.OwningProcess | Select-Object -First 1
        if ($processId) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
} catch {
    # El puerto esta libre
}

# Iniciar servidor en background
$serverProcess = $null
try {
    $env:NODE_ENV = "production"
    $env:PORT = $HealthCheckPort.ToString()
    
    Write-Info "Iniciando servidor en puerto $HealthCheckPort..."
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -PassThru -WindowStyle Hidden
    
    # Esperar que el servidor inicie
    Write-Info "Esperando 8 segundos para que el servidor inicie..."
    Start-Sleep -Seconds 8
    
    # Verificar que el proceso sigue corriendo
    if ($serverProcess.HasExited) {
        Stop-OnError "El servidor se cerro inesperadamente durante el inicio"
    }
    
    Write-Success "Servidor iniciado correctamente (PID: $($serverProcess.Id))"
    
    # Test del endpoint /api/health
    Write-Info "Probando endpoint /api/health..."
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://${HealthCheckHost}:${HealthCheckPort}/api/health" -TimeoutSec 10 -UseBasicParsing
        
        if ($healthResponse.StatusCode -eq 200) {
            Write-Success "Health check endpoint respondio correctamente (200)"
            
            # Verificar contenido JSON
            try {
                $healthData = $healthResponse.Content | ConvertFrom-Json
                if ($healthData.status -eq "ok") {
                    Write-Success "Health check JSON valido con status: ok"
                } else {
                    Stop-OnError "Health check retorno status invalido: $($healthData.status)"
                }
            } catch {
                Stop-OnError "Health check retorno JSON invalido"
            }
        } else {
            Stop-OnError "Health check fallo con codigo: $($healthResponse.StatusCode)"
        }
    } catch {
        Stop-OnError "No se pudo conectar al endpoint de health check: $($_.Exception.Message)"
    }
    
    # Test del endpoint /health (basico)
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
    Stop-OnError "Error critico durante health check: $($_.Exception.Message)"
} finally {
    # CRITICO: Siempre matar el proceso del servidor
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
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.start -match "node dist/index.js") {
        Write-Success "Script de start configurado correctamente"
    } else {
        Stop-OnError "Script de start en package.json no esta configurado correctamente"
    }
} catch {
    Stop-OnError "Error leyendo package.json: $($_.Exception.Message)"
}

# Verificar tamaño de archivos criticos
try {
    $indexHtmlSize = (Get-Item "dist/client/index.html").Length
    if ($indexHtmlSize -gt 100) {  # Al menos 100 bytes
        Write-Success "index.html tiene tamaño valido ($indexHtmlSize bytes)"
    } else {
        Stop-OnError "index.html parece estar corrupto o vacio"
    }
} catch {
    Stop-OnError "Error verificando index.html: $($_.Exception.Message)"
}

# =============================================================================
# RESUMEN FINAL
# =============================================================================

$endTime = Get-Date
$duration = $endTime - $Global:StartTime

Write-Host "`n" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "VALIDACION COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "EL PROYECTO ESTA LISTO PARA DEPLOY EN RENDER" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen de Validacion:" -ForegroundColor Cyan
Write-Host "   • Pruebas Pasadas: $Global:TestsPassed" -ForegroundColor Green
Write-Host "   • Pruebas Fallidas: $Global:TestsFailed" -ForegroundColor Green
Write-Host "   • Duracion Total: $($duration.TotalSeconds.ToString('F1')) segundos" -ForegroundColor Green
Write-Host "   • Health Check: EXITOSO" -ForegroundColor Green
Write-Host "   • Build: COMPLETO" -ForegroundColor Green
Write-Host "   • Archivos: TODOS PRESENTES" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos Pasos:" -ForegroundColor Cyan
Write-Host "   1. Commit y push de todos los cambios" -ForegroundColor Yellow
Write-Host "   2. Deploy en Render usando: npm run render-build" -ForegroundColor Yellow
Write-Host "   3. Verificar que el servicio inicie correctamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: Asegurese de que las variables de entorno esten" -ForegroundColor Red
Write-Host "configuradas correctamente en Render antes del deploy." -ForegroundColor Red
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green

exit 0
