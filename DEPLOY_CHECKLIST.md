# Checklist de Despliegue en Render

Este documento contiene todos los pasos necesarios para desplegar correctamente la aplicación CodeGym en la plataforma Render.

## Preparación del Código

- [x] Actualizar todas las URLs en el frontend para SEO y redes sociales
- [x] Configurar URLs dinámicas para callbacks de OAuth (Google y GitHub)
- [x] Configurar URLs dinámicas para Mercado Pago
- [x] Actualizar la configuración de CORS para incluir el dominio de producción
- [x] Verificar los scripts de build y start en package.json

## Pasos de Despliegue en Render

### 1. Preparar el Repositorio GitHub

- [ ] Asegurarse de que la última versión del código esté actualizada en el repositorio de GitHub
- [ ] Verificar que el archivo `.gitignore` excluya correctamente archivos sensibles (`.env`, `node_modules`, `dist`, etc.)
- [ ] Comprobar que todos los cambios para producción estén integrados en la rama principal

### 2. Crear la Base de Datos PostgreSQL en Render

- [ ] Iniciar sesión en [Render Dashboard](https://dashboard.render.com/)
- [ ] Ir a "New" → "PostgreSQL"
- [ ] Configurar la base de datos:
  - [ ] **Nombre**: `codegym-db` (o el nombre deseado)
  - [ ] **Región**: La más cercana a tu ubicación o a la de tus usuarios
  - [ ] **PostgreSQL Version**: Seleccionar la versión adecuada (recomendado: 15)
  - [ ] **Plan**: Seleccionar el plan apropiado (Free tier disponible para pruebas)
- [ ] Hacer clic en "Create Database"
- [ ] Una vez creada, copiar la "Internal Database URL" (será usada como `DATABASE_URL` en las variables de entorno)

### 3. Crear el Web Service en Render

- [ ] Ir a "New" → "Web Service"
- [ ] Conectar con tu repositorio de GitHub que contiene el código de CodeGym
- [ ] Configurar el servicio:
  - [ ] **Name**: `codegym-ejerciciosdeprogramacion`
  - [ ] **Region**: Misma región seleccionada para la base de datos
  - [ ] **Branch**: `main` (o la rama que uses para producción)  - [ ] **Runtime**: `Node`
  - [ ] **Build Command**: `npm install && npm run build`
  - [ ] **IMPORTANTE**: No uses `npm run build --prefix client` ya que solo compilará el frontend sin el backend
  - [ ] **Start Command**: `npm start`
  - [ ] **Plan**: Seleccionar el plan adecuado

### 4. Configurar Variables de Entorno

En la sección "Environment" del Web Service, añadir las siguientes variables:

- [ ] `DATABASE_URL`: Pegar la "Internal Database URL" copiada anteriormente
- [ ] `NODE_ENV`: `production`
- [ ] `SESSION_SECRET`: Un valor aleatorio largo y seguro
- [ ] `PORT`: `10000` (Render asigna automáticamente un puerto, pero es bueno especificarlo)
- [ ] `GOOGLE_CLIENT_ID`: Tu ID de cliente de Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET`: Tu secreto de cliente de Google OAuth
- [ ] `GITHUB_CLIENT_ID`: Tu ID de cliente de GitHub OAuth
- [ ] `GITHUB_CLIENT_SECRET`: Tu secreto de cliente de GitHub OAuth
- [ ] `GEMINI_API_KEY`: Tu clave de API de Google Gemini
- [ ] `MERCADOPAGO_ACCESS_TOKEN`: Tu token de acceso de Mercado Pago
- [ ] Cualquier otra variable de entorno específica de la aplicación

### 5. Ejecutar Migraciones de Base de Datos (si es necesario)

Si necesitas ejecutar migraciones después del despliegue:

- [ ] Ir a la sección "Shell" del Web Service en Render
- [ ] Ejecutar el comando de migración: `npm run db:push`
- [ ] Para migraciones específicas: `npm run db:migrate:auth`

### 6. Actualizar URLs de OAuth

#### Google Developer Console:

- [ ] Ir a [Google Developer Console](https://console.developers.google.com/)
- [ ] Seleccionar tu proyecto
- [ ] Ir a "Credentials" → "OAuth 2.0 Client IDs" → Seleccionar tu cliente
- [ ] Añadir `https://codegym-ejerciciosdeprogramacion.onrender.com/api/auth/google/callback` en "Authorized redirect URIs"
- [ ] Guardar los cambios

#### GitHub Developer Settings:

- [ ] Ir a [GitHub Developer Settings](https://github.com/settings/developers)
- [ ] Seleccionar tu OAuth App
- [ ] Actualizar "Authorization callback URL" a `https://codegym-ejerciciosdeprogramacion.onrender.com/api/auth/github/callback`
- [ ] Guardar los cambios

### 7. Configurar Webhook de Mercado Pago

- [ ] Iniciar sesión en el [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers)
- [ ] Ir a "Webhooks"
- [ ] Configurar la URL del webhook como `https://codegym-ejerciciosdeprogramacion.onrender.com/api/payments/webhook`
- [ ] Seleccionar los eventos relevantes (pago.creado, pago.actualizado, etc.)
- [ ] Guardar la configuración

### 8. Verificar el Despliegue

- [ ] Esperar a que se complete el despliegue inicial (visible en el dashboard de Render)
- [ ] Verificar que la aplicación esté funcionando correctamente en `https://codegym-ejerciciosdeprogramacion.onrender.com`
- [ ] Comprobar que la autenticación funcione (registrarse/iniciar sesión con email, Google y GitHub)
- [ ] Verificar que el flujo de pagos con Mercado Pago funcione correctamente
- [ ] Revisar los logs en Render para detectar cualquier error

### 9. Configurar Dominio Personalizado (Opcional)

Si en el futuro deseas usar un dominio personalizado:

- [ ] Ir a la sección "Settings" del Web Service
- [ ] En "Custom Domain", hacer clic en "Add"
- [ ] Seguir las instrucciones para configurar los registros DNS de tu dominio

### 10. Monitoreo y Respaldo

- [ ] Configurar notificaciones de estado del servicio en Render
- [ ] Configurar respaldos automáticos de la base de datos en Render (disponible en planes pagados)
- [ ] Considerar herramientas de monitoreo adicionales como Sentry, LogRocket, etc.

## Resolución de Problemas Comunes

- **Error de conexión a la base de datos**: Verificar que la variable `DATABASE_URL` sea correcta y corresponda a la URL interna de Render.
- **Errores 502 Bad Gateway**: Revisar los logs para ver si la aplicación se está iniciando correctamente.
- **Problemas con OAuth**: Comprobar que las URLs de callback estén actualizadas en los paneles de Google y GitHub.
- **Webhooks de Mercado Pago no funcionan**: Verificar la configuración de webhooks y revisar los logs para detectar errores.
- **Error "ENOENT: no such file or directory" para archivos estáticos**: Este problema se ha resuelto con mejoras en el código para buscar los archivos estáticos en múltiples ubicaciones posibles.

## Notas Adicionales

- El primer despliegue puede tardar varios minutos ya que Render necesita construir la aplicación completa.
- Los servicios gratuitos de Render tienen limitaciones y pueden "dormir" después de períodos de inactividad.
- Para un entorno de producción real, considera usar un plan pagado para evitar el tiempo de inactividad.
- Si sigues teniendo problemas con la ubicación de los archivos estáticos, revisa el log de la aplicación que mostrará la ruta que está usando para servir estos archivos.
- La aplicación ahora es más robusta y buscará automáticamente los archivos estáticos en varias ubicaciones posibles.
