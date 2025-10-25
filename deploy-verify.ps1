#!/usr/bin/env pwsh
# CODEGYM DEPLOY VERIFICATION SCRIPT
# Verifica que el deploy en Render sea exitoso

param(
    [string]$RenderUrl = "",
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "CodeGym Deploy Verification"

Write-Host "CODEGYM DEPLOY VERIFICATION" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

if (-not $RenderUrl) {
    Write-Host "[INPUT] Ingresa la URL de tu servicio en Render (ej: https://tu-app.onrender.com):"
    $RenderUrl = Read-Host
}

if (-not $RenderUrl -or $RenderUrl -eq "") {
    Write-Host "[ERROR] URL de Render requerida" -ForegroundColor Red
    exit 1
}

# Remover slash final si existe
$RenderUrl = $RenderUrl.TrimEnd('/')

Write-Host "=== Verificacion de Deploy en Render ===" -ForegroundColor Yellow
Write-Host "[INFO] URL del servicio: $RenderUrl"
Write-Host "[INFO] Timeout: $TimeoutSeconds segundos"

$validations = 0
$errors = 0
$startTime = Get-Date

function Test-Endpoint {
    param($Url, $Description, $ExpectedStatus = 200)
    
    try {
        Write-Host "[TEST] $Description..." -NoNewline
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " [OK]" -ForegroundColor Green
            return $true
        } else {
            Write-Host " [FAIL] Estado: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host " [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ContentContains {
    param($Url, $Description, $ExpectedContent)
    
    try {
        Write-Host "[TEST] $Description..." -NoNewline
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 30 -UseBasicParsing
        
        if ($response.Content -like "*$ExpectedContent*") {
            Write-Host " [OK]" -ForegroundColor Green
            return $true
        } else {
            Write-Host " [FAIL] Contenido no encontrado" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host " [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# === TESTS DE DEPLOY ===

# 1. Health Check del API
if (Test-Endpoint "$RenderUrl/api/health" "Health check del API") {
    $validations++
} else {
    $errors++
}

# 2. Frontend disponible
if (Test-Endpoint "$RenderUrl" "Frontend principal") {
    $validations++
} else {
    $errors++
}

# 3. Verificar que el frontend contiene React
if (Test-ContentContains "$RenderUrl" "Contenido React en frontend" "CodeGym") {
    $validations++
} else {
    $errors++
}

# 4. Test de endpoints adicionales (si existen)
$additionalEndpoints = @(
    "/api/exercises",
    "/api/user/profile"
)

foreach ($endpoint in $additionalEndpoints) {
    $fullUrl = "$RenderUrl$endpoint"
    Write-Host "[TEST] Endpoint $endpoint..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 15 -UseBasicParsing
        if ($response.StatusCode -in @(200, 404, 401)) {
            Write-Host " [OK] Responde (estado: $($response.StatusCode))" -ForegroundColor Green
            $validations++
        } else {
            Write-Host " [WARN] Estado inesperado: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " [WARN] No disponible o error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 5. Performance test básico
Write-Host "[TEST] Tiempo de respuesta del frontend..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri $RenderUrl -Method GET -TimeoutSec 30 -UseBasicParsing
    $sw.Stop()
    
    $responseTime = $sw.ElapsedMilliseconds
    if ($responseTime -lt 5000) {
        Write-Host " [OK] $responseTime ms" -ForegroundColor Green
        $validations++
    } else {
        Write-Host " [WARN] Lento: $responseTime ms" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

$endTime = Get-Date
$totalTime = ($endTime - $startTime).TotalSeconds

Write-Host "`n========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "✅ DEPLOY EXITOSO EN RENDER!" -ForegroundColor Green
} else {
    Write-Host "❌ DEPLOY CON PROBLEMAS" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Resumen:" -ForegroundColor White
Write-Host "   • Validaciones exitosas: $validations" -ForegroundColor Green
Write-Host "   • Errores encontrados: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "   • Tiempo total: $([math]::Round($totalTime, 1)) segundos" -ForegroundColor Gray

if ($errors -eq 0) {
    Write-Host "`n🎉 Tu aplicación está funcionando correctamente en Render!" -ForegroundColor Green
    Write-Host "URL: $RenderUrl" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "`n⚠️  Algunos tests fallaron. Revisa los logs de Render." -ForegroundColor Yellow
    Write-Host "URL de logs: https://dashboard.render.com/" -ForegroundColor Cyan
    exit 1
}
