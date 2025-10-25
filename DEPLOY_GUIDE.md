# 🚀 CodeGym - Guía de Deploy y Testing

## 📋 Resumen del Sistema de Validación

Este proyecto incluye un sistema completo de validación y testing diseñado para garantizar deploys exitosos en Render. El sistema incluye:

### ✅ Componentes del Sistema de Calidad

1. **Suite de Pruebas Jest**: Pruebas unitarias e integración
2. **ESLint**: Análisis de calidad de código
3. **Deploy Check Script**: Validación completa pre-deploy
4. **Health Check Endpoints**: Monitoreo de la aplicación

## 🔧 Configuración Inicial (Solo una vez)

### 1. Instalar Dependencias de Testing

```bash
npm install --save-dev jest @types/jest supertest @types/supertest ts-jest jest-environment-node eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores reales
# IMPORTANTE: Nunca commitear el archivo .env
```

### 3. Configurar Variables en Render

En el dashboard de Render, añadir estas variables de entorno:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgres_url_here
SESSION_SECRET=your_production_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🧪 Comandos de Testing

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Pruebas con cobertura
npm run test:coverage
```

### Análisis de Código

```bash
# Linting
npm run lint

# Corrección automática
npm run lint:fix
```

## 🚀 Proceso de Deploy

### 1. Validación Pre-Deploy (OBLIGATORIO)

```powershell
# En Windows PowerShell
.\deploy-check.ps1

# Con parámetros opcionales
.\deploy-check.ps1 -SkipTests -SkipLint -HealthCheckPort 3001
```

### 2. Deploy en Render

Solo después de que `deploy-check.ps1` complete exitosamente:

```bash
# Push a GitHub
git add .
git commit -m "Ready for deploy - all validations passed"
git push origin main

# El deploy se activará automáticamente en Render
```

## 📊 Endpoints de Monitoreo

### Health Check Básico
```
GET /health
Response: { "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### Health Check API
```
GET /api/health  
Response: { "status": "ok", "date": "2025-01-01T00:00:00.000Z", "version": "1.0.0" }
```

## 🛠️ Solución de Problemas

### Error: "Tests Failed"
```bash
# Ver detalles de las pruebas fallidas
npm test -- --verbose

# Ejecutar una prueba específica
npm test -- mathUtils.test.ts
```

### Error: "Build Failed"
```bash
# Verificar errores de TypeScript
npm run check

# Build solo del cliente
npm run build:client

# Build solo del servidor
npm run build:server
```

### Error: "Health Check Failed"
```bash
# Verificar que no hay procesos usando el puerto
netstat -ano | findstr :5000

# Matar proceso en puerto específico
taskkill /F /PID <process_id>
```

### Error en Render: "Application failed to start"
1. Verificar variables de entorno en Render
2. Revisar logs de Render
3. Asegurar que `dist/index.js` existe
4. Verificar que el build script funcionó correctamente

## 📁 Estructura de Archivos de Testing

```
server/
├── __tests__/
│   └── health.integration.test.ts    # Pruebas de integración
├── utils/
│   ├── mathUtils.ts                  # Utilidades
│   └── mathUtils.test.ts             # Pruebas unitarias
└── testApp.ts                        # App de testing

jest.config.js                       # Configuración de Jest
jest.setup.js                        # Setup global de pruebas
.eslintrc.js                         # Configuración de ESLint
deploy-check.ps1                     # Script de validación
```

## 🔒 Seguridad

### Variables de Entorno Sensibles
- Nunca commitear archivos `.env`
- Usar secrets manager en producción
- Rotar claves periódicamente

### Headers de Seguridad
- Helmet configurado para CSP
- CORS configurado apropiadamente
- Rate limiting implementado

## 📈 Métricas y Monitoreo

### Cobertura de Código
```bash
npm run test:coverage
# Ver reporte en: coverage/lcov-report/index.html
```

### Performance
- Health checks deben responder en < 1 segundo
- Build completo debe tomar < 2 minutos
- Deploy en Render debe completar en < 5 minutos

## 🆘 Contacto de Soporte

Si el deploy falla después de pasar todas las validaciones:

1. Revisar logs de Render
2. Verificar que todas las variables de entorno están configuradas
3. Asegurar que el repositorio GitHub está actualizado
4. Verificar que el plan de Render tiene suficientes recursos

---

**⚠️ IMPORTANTE**: Nunca hagas deploy sin ejecutar primero `deploy-check.ps1` exitosamente. Este script es tu garantía de que el deploy funcionará correctamente en Render.
