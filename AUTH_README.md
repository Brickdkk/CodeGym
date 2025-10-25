# Sistema de Autenticación Multi-Método - CodeGym

Este documento describe el sistema de autenticación implementado en CodeGym, que permite a los usuarios iniciar sesión mediante múltiples métodos.

## Métodos de Autenticación Disponibles

1. **Email y Contraseña** - Autenticación local tradicional.
2. **Google OAuth** - Inicio de sesión con una cuenta de Google.
3. **GitHub OAuth** - Inicio de sesión con una cuenta de GitHub.
4. **Replit Auth** - El método original de autenticación (ya implementado previamente).

## Configuración Inicial

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   Copia el archivo `.env.example` a `.env` y completa las variables:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de completar:
   - `SESSION_SECRET`: Un string aleatorio y seguro para las sesiones.
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Obtenidos de la [Consola de APIs de Google](https://console.developers.google.com/).
   - `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`: Obtenidos de [GitHub Developer Settings](https://github.com/settings/developers).

3. **Migración de Base de Datos**:
   Ejecuta la migración para añadir los campos necesarios:
   ```bash
   npm run db:migrate:auth
   ```

## Creando Aplicaciones OAuth

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Ve a "APIs y Servicios" > "Credenciales"
4. Crea credenciales > "ID de cliente OAuth"
5. Configura la aplicación:
   - Tipo: Aplicación web
   - Nombre: CodeGym
   - URLs autorizados: `http://localhost:5000` (desarrollo) y tu URL de producción
   - Callbacks autorizados: `http://localhost:5000/api/auth/google/callback` (desarrollo) y tu URL de callback de producción
6. Copia el ID de cliente y el secreto a tu archivo `.env`

### GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva aplicación OAuth
3. Configura:
   - Nombre de la aplicación: CodeGym
   - URL de la página principal: `http://localhost:5000` (desarrollo) o tu URL de producción
   - Callback URL: `http://localhost:5000/api/auth/github/callback` (desarrollo) o tu URL de callback de producción
4. Copia el ID de cliente y el secreto a tu archivo `.env`

## Flujo de Autenticación

1. **Registro de Usuario (Local)**:
   - El usuario envía un formulario con email, contraseña y datos personales.
   - La contraseña se hashea con bcrypt antes de almacenarse.
   - Se crea una nueva entrada en la tabla `users`.

2. **Inicio de Sesión (Local)**:
   - El usuario envía email y contraseña.
   - Se valida la contraseña comparando el hash almacenado.
   - Se crea una sesión autenticada.

3. **OAuth (Google/GitHub)**:
   - El usuario hace clic en el botón correspondiente.
   - Es redirigido a la página de consentimiento del proveedor.
   - Después de autorizar, se recibe un callback con datos del perfil.
   - Se busca o crea un usuario en la base de datos basado en el ID o email del proveedor.
   - Se crea una sesión autenticada.

## Consideraciones de Seguridad

- Todas las contraseñas se almacenan hasheadas con bcrypt (12 rondas).
- No se exponen secretos en el código (se usan variables de entorno).
- Se implementan límites de tasa (rate limiting) para prevenir ataques de fuerza bruta.
- Se valida toda la entrada del usuario.

## Archivos Relevantes

- **`shared/schema.ts`**: Define el esquema de la base de datos con los campos de autenticación.
- **`server/authStrategies.ts`**: Configura las estrategias de passport para cada método de autenticación.
- **`server/replitAuth.ts`**: Integra la autenticación de Replit con las nuevas estrategias.
- **`server/routes.ts`**: Define los endpoints para registro, login y callbacks de OAuth.
- **`client/src/components/auth/`**: Componentes de React para formularios de login y registro.
- **`migrations/auth-fields-migration.ts`**: Script para actualizar la base de datos.

## Integración de Cuentas

El sistema permite a un usuario vincular múltiples métodos de autenticación a una sola cuenta:
- Si un usuario inicia sesión con OAuth y ya existe una cuenta con el mismo email, los perfiles se vinculan.
- Esto permite a los usuarios acceder con cualquiera de sus métodos configurados.
