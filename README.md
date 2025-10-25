# CodeGym - Plataforma de Ejercicios de Programación

Esta aplicación full-stack permite a los usuarios practicar y mejorar sus habilidades de programación en varios lenguajes.

## Estructura del Proyecto

- `/client`: Frontend React con Vite
- `/server`: Backend Node.js con Express y TypeScript
- `/shared`: Esquemas y tipos compartidos
- `/migrations`: Scripts de migración para la base de datos

## Requisitos

- Node.js 18+
- PostgreSQL
- Credenciales de OAuth (Google y GitHub)
- Credenciales de MercadoPago (opcional)
- API Key de Google Gemini

## Desarrollo Local

1. Clona el repositorio
2. Instala dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env` en la raíz con las siguientes variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/codegym
   SESSION_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token
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

## Despliegue en Producción

Para desplegar en Render:

1. Sigue las instrucciones detalladas en `DEPLOY_CHECKLIST.md`

### Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el frontend y el backend para producción
- `npm run build:windows`: Igual que build pero optimizado para Windows
- `npm run start`: Inicia la aplicación en modo producción
- `npm run db:push`: Aplica migraciones de base de datos
- `npm run db:migrate:auth`: Aplica migraciones específicas para autenticación
- `npm run deploy`: Construye la aplicación y ejecuta las migraciones (útil para CI/CD)

## Características Principales

- Autenticación multi-proveedor (Email, Google, GitHub)
- Ejercicios de programación en múltiples lenguajes
- Generación de ejercicios con IA
- Pagos con MercadoPago
- Rankings y sistema de puntos

## Tecnologías Utilizadas

- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Passport.js
- **IA**: Google Gemini API
- **Pagos**: MercadoPago
