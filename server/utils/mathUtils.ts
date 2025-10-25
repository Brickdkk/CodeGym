/**
 * Utilidades matemáticas para CodeGym
 */

/**
 * Suma dos números
 * @param a - Primer número
 * @param b - Segundo número
 * @returns La suma de a y b
 */
export function sum(a: number, b: number): number {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Los argumentos deben ser números');
  }
  return a + b;
}

/**
 * Calcula la media de un array de números
 * @param numbers - Array de números
 * @returns La media aritmética
 */
export function average(numbers: number[]): number {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Se requiere un array no vacío de números');
  }
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) {
    throw new Error('No hay números válidos en el array');
  }
  
  return validNumbers.reduce((acc, num) => acc + num, 0) / validNumbers.length;
}

/**
 * Valida si una cadena es un email válido
 * @param email - Cadena a validar
 * @returns true si es un email válido
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Genera un ID único simple para testing
 * @returns Un ID único basado en timestamp y random
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
