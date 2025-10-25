/**
 * Script para copiar archivos estáticos del cliente al directorio dist
 * Compatible con sistemas Unix (Linux/macOS) y Windows
 */

// Importar módulos nativos de Node.js para mayor compatibilidad
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de rutas
const sourceDir = path.resolve(process.cwd(), 'client/dist');
const targetDir = path.resolve(process.cwd(), 'dist/client');

console.log(`Copiando archivos estáticos de ${sourceDir} a ${targetDir}...`);

try {
  // Crear directorio de destino si no existe
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Creado directorio: ${targetDir}`);
  }
  
  // Detectar el sistema operativo y ejecutar el comando apropiado
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Comando en Windows
    execSync(`xcopy /E /I /Y "${sourceDir}" "${targetDir}"`, { stdio: 'inherit' });
  } else {
    // Comando en Linux/macOS
    // Verificar si la carpeta existe antes de copiar
    if (fs.existsSync(sourceDir)) {
      // Usamos cp -r con /* para copiar el contenido, no la carpeta
      execSync(`cp -r "${sourceDir}/"* "${targetDir}/"`, { stdio: 'inherit' });
    } else {
      throw new Error(`Directorio de origen no encontrado: ${sourceDir}`);
    }
  }
  
  console.log('✅ Archivos estáticos copiados con éxito!');
} catch (error) {
  console.error('❌ Error al copiar archivos estáticos:', error);
  process.exit(1);
}
