import { sum, average, isValidEmail, generateTestId } from './mathUtils';

describe('MathUtils - Pruebas Unitarias', () => {
  
  describe('sum function', () => {
    test('debe sumar dos números positivos correctamente', () => {
      expect(sum(2, 3)).toBe(5);
      expect(sum(10, 25)).toBe(35);
    });

    test('debe manejar números negativos', () => {
      expect(sum(-2, 3)).toBe(1);
      expect(sum(-5, -10)).toBe(-15);
    });

    test('debe manejar ceros', () => {
      expect(sum(0, 0)).toBe(0);
      expect(sum(5, 0)).toBe(5);
    });

    test('debe lanzar error con argumentos no numéricos', () => {
      // @ts-ignore - Ignoramos TS para probar el manejo de errores
      expect(() => sum('2', 3)).toThrow('Los argumentos deben ser números');
      // @ts-ignore
      expect(() => sum(null, 3)).toThrow('Los argumentos deben ser números');
    });
  });

  describe('average function', () => {
    test('debe calcular la media correctamente', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20])).toBe(15);
    });

    test('debe manejar un solo elemento', () => {
      expect(average([42])).toBe(42);
    });

    test('debe filtrar valores no numéricos', () => {
      // @ts-ignore
      expect(average([1, 2, 'invalid', 3, null])).toBe(2);
    });

    test('debe lanzar error con array vacío', () => {
      expect(() => average([])).toThrow('Se requiere un array no vacío de números');
    });

    test('debe lanzar error con array sin números válidos', () => {
      // @ts-ignore
      expect(() => average(['a', 'b', null])).toThrow('No hay números válidos en el array');
    });
  });

  describe('isValidEmail function', () => {
    test('debe validar emails correctos', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('admin@codegym.dev')).toBe(true);
    });

    test('debe rechazar emails inválidos', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    test('debe manejar tipos no string', () => {
      // @ts-ignore
      expect(isValidEmail(null)).toBe(false);
      // @ts-ignore
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe('generateTestId function', () => {
    test('debe generar IDs únicos', () => {
      const id1 = generateTestId();
      const id2 = generateTestId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^test_\d+_[a-z0-9]{9}$/);
    });

    test('debe generar IDs con formato correcto', () => {
      const id = generateTestId();
      expect(id).toMatch(/^test_/);
      expect(id.split('_')).toHaveLength(3);
    });
  });
});
