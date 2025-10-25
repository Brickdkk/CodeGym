# CodeGym - Programming Exercise Platform

## Overview

CodeGym is a comprehensive programming education platform built with React, Express.js, and PostgreSQL. The platform allows users to solve coding exercises across multiple programming languages, track their progress, and compete on leaderboards. It includes premium features powered by AI for code explanation and error analysis.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **Code Editor**: CodeMirror integration with syntax highlighting for multiple languages
- **State Management**: TanStack Query for server state management
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session management
- **Code Execution**: Sandboxed code execution service with security measures
- **Payment Processing**: MercadoPago integration for premium subscriptions

### Database Design
- **Users**: Profile management with premium subscription tracking
- **Languages**: Supported programming languages (Python, JavaScript, C, C++, C#, HTML/CSS)
- **Exercises**: Coding challenges with difficulty levels and test cases
- **Submissions**: User code submissions with execution results
- **Progress Tracking**: User achievement and completion statistics
- **Comments**: Exercise discussion system

## Key Components

### Exercise Management System
- **Exercise Generator**: Automated creation of exercises across languages and difficulties
- **GitHub Import Service**: Bulk import of exercises from external sources
- **Difficulty Classification**: AI-powered exercise difficulty assessment
- **Microservice Architecture**: Separate exercise management microservice with storage and routing

### Code Execution Engine
- **Multi-language Support**: Python, JavaScript, C, C++, C# execution
- **Security Sandbox**: Prevents dangerous code execution and system access
- **Test Case Validation**: Automated testing against predefined inputs/outputs
- **Performance Monitoring**: Execution time and memory usage tracking

### Premium Features
- **AI Code Analysis**: OpenAI-powered code explanation and error analysis
- **Free AI Service**: Gemini-based code explanations for all users
- **Premium Keys**: Alternative access method to premium features
- **Usage Tracking**: Rate limiting and subscription validation

### Security Implementation
- **HTTPS Enforcement**: Automatic HTTP to HTTPS redirects
- **CORS Configuration**: Restricted cross-origin requests
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive sanitization of user inputs
- **CSRF Protection**: Token-based request validation
- **Code Sanitization**: Prevention of malicious code execution

## Data Flow

1. **User Authentication**: Replit Auth → Session Management → User Profile
2. **Exercise Discovery**: Language Selection → Exercise Filtering → Exercise Display
3. **Code Submission**: Code Input → Security Validation → Execution → Results
4. **Progress Tracking**: Submission Results → Database Update → Achievement Calculation
5. **Payment Flow**: MercadoPago Integration → Webhook Validation → Premium Access

## External Dependencies

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Drizzle Kit**: Database migration management
- **ESBuild**: Production build optimization

### Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **OpenAI API**: Premium AI code analysis features
- **MercadoPago SDK**: Payment processing for Chilean market
- **Helmet**: Security middleware for Express
- **CORS**: Cross-origin resource sharing configuration

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **CodeMirror**: Professional code editing experience
- **Tailwind CSS**: Utility-first styling framework
- **React Hook Form**: Form validation and management

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Node.js server with static file serving
- **Database**: PostgreSQL with connection pooling
- **Environment Variables**: Secure configuration for API keys and database credentials

### Build Process
1. Frontend build with Vite
2. Backend compilation with ESBuild
3. Database migration application
4. Static asset optimization

### Replit Integration
- **Modules**: Node.js 20, PostgreSQL 16, Python 3.11
- **Deployment**: Autoscale deployment target
- **Port Configuration**: Internal port 5000, external port 80
- **Workflow**: Parallel execution with automatic port detection

## Changelog

```
Changelog:
- June 13, 2025. Initial setup
- June 13, 2025. SEO optimizations implemented:
  * Title tag optimized: "CodeGym: La Plataforma #1 de Ejercicios de Programación"
  * Meta description with CTA: includes "Empieza gratis" call-to-action
  * H1 updated: "Entrena tus Habilidades con Ejercicios de Programación"
  * Structured H2/H3 headings: "Lenguajes Disponibles", "¿Por Qué Elegir CodeGym?", "Compite en Nuestro Ranking"
  * Schema.org JSON-LD with WebSite and LearningResource types
  * Open Graph and Twitter Cards optimized for social sharing
  * Geographic targeting for Chile (es-CL locale)
  * Semantic HTML5 structure with proper header, main, section tags
- June 13, 2025. Difficulty classification corrected: only basic if/else = beginner, lists/arrays = intermediate
- June 13, 2025. Exercise output display fixed: shows expected results properly
- June 13, 2025. Complete website code packaged for download (904KB archive)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```