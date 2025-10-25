# Guía de Configuración para CodeGym en Windows

Esta guía te ayudará a configurar el proyecto CodeGym en un entorno Windows desde cero, asegurando una correcta instalación y evitando errores comunes.

## Requisitos Previos

### 1. Node.js (versión LTS)

1. Descarga Node.js LTS desde [nodejs.org](https://nodejs.org/)
2. Durante la instalación, **asegúrate de marcar la opción para añadir Node.js al PATH del sistema**
3. Verifica la instalación abriendo PowerShell y ejecutando:
   ```powershell
   node --version
   npm --version
   ```

### 2. PostgreSQL

1. Descarga PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Durante la instalación:
   - Anota la contraseña del usuario `postgres` que configures
   - **Asegúrate de marcar la opción para añadir PostgreSQL al PATH del sistema**
   - Mantén el puerto predeterminado (5432)
3. Verifica la instalación abriendo PowerShell y ejecutando:
   ```powershell
   psql --version
   ```

## Configuración del Proyecto

### 1. Clonar el Repositorio

```powershell
git clone [URL_DEL_REPOSITORIO] CodeGym
cd CodeGym
```

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto:
```powershell
Copy-Item .env.example .env
```

2. Edita el archivo `.env` con tus valores:
```
DATABASE_URL=postgres://postgres:TuContraseña@localhost:5432/codegym
PORT=5000
SESSION_SECRET=tu_secreto_seguro_para_sesiones
```

### 3. Crear la Base de Datos

1. Abre PostgreSQL (puedes usar pgAdmin o la línea de comandos)
2. Crea una base de datos llamada `codegym`:
```sql
CREATE DATABASE codegym;
```

### 4. Instalar Dependencias

```powershell
npm install
```

Este comando instalará todas las dependencias necesarias, incluido `cross-env` para compatibilidad multiplataforma.

### 5. Configurar la Base de Datos

```powershell
npm run db:push
```

Este comando migrará la estructura de la base de datos usando Drizzle ORM.

## Iniciar el Proyecto

### Modo Desarrollo

```powershell
npm run dev
```

La aplicación estará disponible en: http://localhost:5000

### Construir para Producción

```powershell
npm run build
npm start
```

## Solución de Problemas Comunes

### Error: "No se puede cargar el archivo porque la ejecución de scripts está deshabilitada en este sistema"

Si encuentras este error al ejecutar scripts en PowerShell, necesitas permitir la ejecución de scripts:

1. Abre PowerShell como administrador
2. Ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "'drizzle-kit' no se reconoce como un comando interno o externo"

Si encuentras este error después de instalar las dependencias:

1. Asegúrate de haber instalado las dependencias con `npm install`
2. Intenta ejecutar el comando con npx:
```powershell
npx drizzle-kit push
```

### Error de Conexión a PostgreSQL

Si no puedes conectarte a la base de datos:

1. Verifica que PostgreSQL esté en ejecución (Servicios de Windows)
2. Comprueba que la cadena de conexión en el archivo `.env` sea correcta
3. Asegúrate de que la base de datos `codegym` exista

## Notas Adicionales

- El proyecto usa TypeScript, asegúrate de tener un editor compatible como VS Code
- Para desarrollo, la aplicación recarga automáticamente los cambios
- Los archivos de migración de la base de datos se generan en la carpeta `/migrations`
