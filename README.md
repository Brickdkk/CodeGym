# CodeGym - Plataforma de Ejercicios de Programación

Aplicación full-stack para practicar y mejorar habilidades de programación en múltiples lenguajes.

## Estructura del Proyecto

- `/client`: Frontend React con Vite
- `/server`: Backend Node.js con Express y TypeScript
- `/shared`: Esquemas y tipos compartidos
- `/migrations`: Scripts de migración para la base de datos
- `/api`: Entry point para Vercel Serverless Functions

## Requisitos

- Node.js 18+
- PostgreSQL (Neon recomendado para producción)
- Credenciales de OAuth (Google y GitHub)

## Desarrollo Local

1. Clona el repositorio
2. Instala dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/codegym
   SESSION_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   BASE_URL=http://localhost:5000
   ```
4. Ejecuta migraciones:
   ```
   npm run db:push
   ```
5. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```
6. La aplicación estará disponible en `http://localhost:5000`

## Despliegue en Vercel

1. Conecta el repositorio en el dashboard de Vercel
2. Configura las variables de entorno en el dashboard:
   - `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
   - `BASE_URL=https://codegym-kappa.vercel.app`
   - `ALLOWED_ORIGINS=https://codegym-kappa.vercel.app`
   - OAuth credentials (Google + GitHub)
3. Actualiza las redirect URIs de OAuth para el dominio de producción
4. Vercel desplegará automáticamente en cada push

### Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila frontend y backend para producción
- `npm start`: Inicia la aplicación en modo producción
- `npm run db:push`: Aplica migraciones de base de datos

## Características Principales

- Autenticación multi-proveedor (Email, Google, GitHub)
- 80 ejercicios curados en 4 lenguajes (Python, JavaScript, C++, HTML/CSS)
- Ejecución de código 100% client-side (WASM/Pyodide/JSCPP)
- Rankings y sistema de puntos
- Validación instantánea con mensajes pedagógicos

## Tecnologías

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL (Neon Serverless) con Drizzle ORM
- **Autenticación**: Passport.js (Local + Google + GitHub OAuth)
- **Ejecución de Código**: Pyodide (Python), Web Workers (JS), JSCPP (C++), iframe sandbox (HTML/CSS)
- **Despliegue**: Vercel (CDN + Serverless Functions)
