# CodeGym - Plataforma de Ejercicios de Programación

Aplicación full-stack para practicar y mejorar habilidades de programación en múltiples lenguajes. Desarrollado por estudiante chileno en aprendizaje buscando mejorar y resolver un problema como la práctica y búsquedas de ejercicios dentro de mallas curriculares universitarias o bootcamps, siempre buscando optar a la mejor calidad.

## Características Principales

- Autenticación multi-proveedor (Email, Google, GitHub)
- 100 ejercicios en 5 lenguajes (Python, JavaScript, C, C++, HTML/CSS)
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
