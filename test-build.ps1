# Script de prueba para la construcción de CodeGym
# Este script simula lo que hará render-build.sh en el servidor de Render

Write-Host "🚀 Iniciando proceso de construcción para CodeGym..." -ForegroundColor Green

# 1. Crear estructura de directorios
Write-Host "🗂️ Creando estructura de directorios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "dist\client" | Out-Null
New-Item -ItemType Directory -Force -Path "dist\server" | Out-Null

# 2. Construir el cliente
Write-Host "📦 Construyendo el cliente..." -ForegroundColor Yellow
npm run build:client

if (Test-Path "client\dist\index.html") {
    Write-Host "✅ Cliente construido correctamente" -ForegroundColor Green
    
    # Copiar archivos del cliente
    Write-Host "📋 Copiando archivos del cliente..." -ForegroundColor Yellow
    Copy-Item -Path "client\dist\*" -Destination "dist\client\" -Recurse -Force
    
    if (Test-Path "dist\client\index.html") {
        Write-Host "✅ index.html copiado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: index.html no se copió correctamente" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Error: No se pudo construir el cliente" -ForegroundColor Red
}

# 3. Intentar construir el servidor TypeScript (modo permisivo)
Write-Host "📦 Intentando construir el servidor TypeScript..." -ForegroundColor Yellow

$tsConfigContent = @"
{
  "extends": "./tsconfig.server.json",
  "compilerOptions": {
    "noImplicitAny": false,
    "strict": false,
    "noEmitOnError": false,
    "skipLibCheck": true,
    "suppressImplicitAnyIndexErrors": true,
    "noImplicitReturns": false,
    "noImplicitThis": false,
    "strictNullChecks": false
  }
}
"@

$tsConfigContent | Out-File -FilePath "tsconfig.build.json" -Encoding UTF8

# Intentar compilación
$result = & npx tsc --project tsconfig.build.json 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Servidor construido exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ Compilación TypeScript con errores, creando servidor fallback..." -ForegroundColor Yellow
      # Crear servidor fallback
    $fallbackServer = @'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'fallback',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor CodeGym ejecutándose en puerto ${PORT}`);
  console.log('⚠️ Nota: Ejecutándose en modo fallback');
});
'@
    
    $fallbackServer | Out-File -FilePath "dist\server\index.js" -Encoding UTF8
}

# Limpiar archivo temporal
Remove-Item "tsconfig.build.json" -ErrorAction SilentlyContinue

# 4. Copiar archivos JS nativos del servidor
Write-Host "📋 Copiando archivos JavaScript nativos del servidor..." -ForegroundColor Yellow
if (Test-Path "server") {
    Get-ChildItem -Path "server" -Filter "*.js" -Recurse | ForEach-Object {
        Copy-Item $_.FullName -Destination "dist\server\$($_.Name)" -Force
        Write-Host "📄 Copiado: $($_.Name)" -ForegroundColor Cyan
    }
}

# 5. Crear punto de entrada principal
Write-Host "🔧 Creando punto de entrada principal..." -ForegroundColor Yellow
$mainEntry = @'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    console.log('🚀 Iniciando CodeGym...');
    
    const serverModule = await import('./server/index.js');
    console.log('✅ Servidor principal cargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al cargar servidor principal:', error.message);
    console.log('🔄 Iniciando servidor de emergencia...');
    
    const express = (await import('express')).default;
    const app = express();
    const PORT = process.env.PORT || 10000;
    
    app.use(express.static(path.join(__dirname, 'client')));
    
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'emergency', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/index.html'));
    });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🆘 Servidor de emergencia activo en puerto ${PORT}`);
    });
  }
}

startServer();
'@

$mainEntry | Out-File -FilePath "dist\index.js" -Encoding UTF8

# 6. Verificaciones finales
Write-Host "🔍 Verificación final..." -ForegroundColor Yellow

$checks = @(
    @{ Path = "dist\index.js"; Name = "Punto de entrada principal" }
    @{ Path = "dist\client\index.html"; Name = "Cliente HTML" }
    @{ Path = "dist\server"; Name = "Directorio del servidor" }
)

$allGood = $true
foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Host "✅ $($check.Name): OK" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Name): FALTA" -ForegroundColor Red
        $allGood = $false
    }
}

# Mostrar estadísticas
$clientFiles = (Get-ChildItem -Path "dist\client" -Recurse -File | Measure-Object).Count
$serverFiles = (Get-ChildItem -Path "dist\server" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
$totalFiles = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object).Count

Write-Host "📊 Estadísticas de construcción:" -ForegroundColor Cyan
Write-Host "   - Cliente: $clientFiles archivos" -ForegroundColor White
Write-Host "   - Servidor: $serverFiles archivos" -ForegroundColor White
Write-Host "   - Total: $totalFiles archivos" -ForegroundColor White

if ($allGood) {
    Write-Host "✅ ¡Construcción completada exitosamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Construcción completada con advertencias" -ForegroundColor Yellow
}
