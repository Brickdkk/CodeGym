// Global type declarations for CodeGym

declare module '*.js';

// Extender la definición de Express para incluir propiedades de usuario
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email?: string;
      [key: string]: any;
    }
    
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      logout(options?: { keepSessionInfo?: boolean }, callback?: (err: any) => void): void;
      login(user: any, done: (err: any) => void): void;
      sessionID: string;
    }
  }
}

// Definiciones para interfaces/tipos comunes utilizados en el proyecto
interface TestResult {
  testNumber: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTime: number;
}

interface TestCase {
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  maxStreak?: number;
  lastSolvedDate: Date | null;
}

// Definiciones para interfaces/tipos de la base de datos
interface DatabaseStorage {
  getAllExercises?(): Promise<any[]>;
  getExercises?(): Promise<any[]>;
  getExercisesByLanguage?(languageSlug: string): Promise<any[]>;
  getExerciseCountsByLanguage?(): Promise<any[]>; 
  getUser?(userId: string): Promise<any>;
  getUsers?(): Promise<any[]>;
  [key: string]: any;
}

// Tipos para el sistema de límites de intentos
interface AttemptLimiter {
  (maxAttempts?: number, windowMs?: number): any;
}

// Tipos globales para errores
type ErrorWithMessage = {
  message: string;
};

type UnknownError = unknown;

// Helper para trabajar con errores de tipo unknown
declare function isErrorWithMessage(error: unknown): error is ErrorWithMessage;

// Export para asegurar que este archivo sea tratado como un módulo
export {};
