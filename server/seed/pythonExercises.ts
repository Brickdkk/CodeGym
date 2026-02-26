import type { SeedExercise } from './types.js';

export const pythonExercises: SeedExercise[] = [
  // ============================================================
  // BEGINNER (5 exercises) — 10 points each
  // ============================================================
  {
    title: "Hola Mundo",
    slug: "python-hola-mundo",
    description:
      "Escribe un programa en Python que imprima exactamente el texto \"Hola Mundo\" en la consola. Este es el primer programa clásico que todo programador escribe al aprender un nuevo lenguaje.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Hola Mundo
# Imprime "Hola Mundo" en la consola.
# Pista: usa la función print()

`,
    solution: `print("Hola Mundo")
`,
    testCases: [
      { input: "", expected: "Hola Mundo" },
      { input: "", expected: "Hola Mundo" },
      { input: "", expected: "Hola Mundo" },
    ],
    tags: ["print", "salida", "introduccion"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },
  {
    title: "Suma de dos números",
    slug: "python-suma-dos-numeros",
    description:
      "Lee dos números enteros desde la entrada estándar (uno por línea) e imprime su suma.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Suma de dos números
# Lee dos enteros (uno por línea) e imprime su suma.
# Pista: usa input() para leer y int() para convertir.

a = int(input())
b = int(input())
# Tu código aquí
`,
    solution: `a = int(input())
b = int(input())
print(a + b)
`,
    testCases: [
      { input: "3\n5", expected: "8" },
      { input: "0\n0", expected: "0" },
      { input: "-4\n7", expected: "3" },
      { input: "100\n200", expected: "300" },
    ],
    tags: ["variables", "entrada", "operadores", "aritmetica"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },
  {
    title: "Par o Impar",
    slug: "python-par-o-impar",
    description:
      "Lee un número entero e imprime \"Par\" si es par o \"Impar\" si es impar.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Par o Impar
# Lee un entero e imprime "Par" o "Impar".
# Pista: usa el operador módulo (%)

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
if n % 2 == 0:
    print("Par")
else:
    print("Impar")
`,
    testCases: [
      { input: "4", expected: "Par" },
      { input: "7", expected: "Impar" },
      { input: "0", expected: "Par" },
      { input: "-3", expected: "Impar" },
      { input: "100", expected: "Par" },
    ],
    tags: ["condicionales", "operadores", "modulo"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },
  {
    title: "Área del rectángulo",
    slug: "python-area-rectangulo",
    description:
      "Lee la base y la altura de un rectángulo (números enteros, uno por línea) e imprime su área.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Área del rectángulo
# Lee base y altura (enteros) e imprime el área.
# Fórmula: area = base * altura

base = int(input())
altura = int(input())
# Tu código aquí
`,
    solution: `base = int(input())
altura = int(input())
print(base * altura)
`,
    testCases: [
      { input: "5\n3", expected: "15" },
      { input: "10\n10", expected: "100" },
      { input: "1\n1", expected: "1" },
      { input: "7\n4", expected: "28" },
    ],
    tags: ["variables", "aritmetica", "geometria"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },
  {
    title: "Mayor de dos",
    slug: "python-mayor-de-dos",
    description:
      "Lee dos números enteros (uno por línea) e imprime el mayor de los dos. Si son iguales, imprime cualquiera de ellos.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Mayor de dos
# Lee dos enteros e imprime el mayor.
# Pista: usa if/else o la función max()

a = int(input())
b = int(input())
# Tu código aquí
`,
    solution: `a = int(input())
b = int(input())
print(max(a, b))
`,
    testCases: [
      { input: "5\n3", expected: "5" },
      { input: "2\n8", expected: "8" },
      { input: "-1\n-5", expected: "-1" },
      { input: "7\n7", expected: "7" },
      { input: "0\n100", expected: "100" },
    ],
    tags: ["condicionales", "comparacion", "funciones"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  // ============================================================
  // BASIC (5 exercises) — 15 points each
  // ============================================================
  {
    title: "Tabla de multiplicar",
    slug: "python-tabla-multiplicar",
    description:
      "Lee un número entero n e imprime su tabla de multiplicar del 1 al 10. Cada línea debe tener el formato: \"n x i = resultado\" (por ejemplo, \"5 x 1 = 5\").",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Tabla de multiplicar
# Lee un entero n e imprime su tabla del 1 al 10.
# Formato por línea: "n x i = resultado"
# Ejemplo para n=3: "3 x 1 = 3", "3 x 2 = 6", ...

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
`,
    testCases: [
      {
        input: "5",
        expected:
          "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50",
      },
      {
        input: "1",
        expected:
          "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10",
      },
      {
        input: "3",
        expected:
          "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30",
      },
    ],
    tags: ["bucles", "for", "formato", "multiplicacion"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },
  {
    title: "Contar vocales",
    slug: "python-contar-vocales",
    description:
      "Lee una cadena de texto e imprime la cantidad de vocales (a, e, i, o, u) que contiene. Considera tanto mayúsculas como minúsculas.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Contar vocales
# Lee una cadena e imprime cuántas vocales tiene.
# Cuenta tanto mayúsculas como minúsculas.

texto = input()
# Tu código aquí
`,
    solution: `texto = input()
vocales = "aeiouAEIOU"
count = 0
for c in texto:
    if c in vocales:
        count += 1
print(count)
`,
    testCases: [
      { input: "Hola Mundo", expected: "4" },
      { input: "Python", expected: "1" },
      { input: "AEIOU", expected: "5" },
      { input: "bcdfg", expected: "0" },
      { input: "Murcielago", expected: "5" },
    ],
    tags: ["cadenas", "bucles", "conteo", "vocales"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },
  {
    title: "Invertir cadena",
    slug: "python-invertir-cadena",
    description:
      "Lee una cadena de texto e imprime la cadena invertida (al revés).",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Invertir cadena
# Lee una cadena e imprime la cadena al revés.
# Pista: Python permite slicing con [::-1]

texto = input()
# Tu código aquí
`,
    solution: `texto = input()
print(texto[::-1])
`,
    testCases: [
      { input: "Hola", expected: "aloH" },
      { input: "Python", expected: "nohtyP" },
      { input: "abcde", expected: "edcba" },
      { input: "12345", expected: "54321" },
    ],
    tags: ["cadenas", "slicing", "inversion"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },
  {
    title: "Fibonacci",
    slug: "python-fibonacci",
    description:
      "Lee un número entero n (n >= 1) e imprime los primeros n números de la secuencia de Fibonacci separados por espacios. La secuencia comienza con 0 y 1.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Fibonacci
# Lee n e imprime los primeros n números de Fibonacci separados por espacios.
# La secuencia empieza: 0, 1, 1, 2, 3, 5, 8, ...

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
fib = []
a, b = 0, 1
for _ in range(n):
    fib.append(str(a))
    a, b = b, a + b
print(" ".join(fib))
`,
    testCases: [
      { input: "1", expected: "0" },
      { input: "2", expected: "0 1" },
      { input: "5", expected: "0 1 1 2 3" },
      { input: "8", expected: "0 1 1 2 3 5 8 13" },
      { input: "10", expected: "0 1 1 2 3 5 8 13 21 34" },
    ],
    tags: ["bucles", "secuencias", "fibonacci", "listas"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },
  {
    title: "Factorial",
    slug: "python-factorial",
    description:
      "Lee un número entero n (n >= 0) e imprime n! (el factorial de n). Recuerda que 0! = 1.",
    difficulty: "beginner",
    languageSlug: "python",
    starterCode: `# Ejercicio: Factorial
# Lee un entero n >= 0 e imprime n! (factorial de n).
# Recuerda: 0! = 1, 5! = 120

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
resultado = 1
for i in range(1, n + 1):
    resultado *= i
print(resultado)
`,
    testCases: [
      { input: "0", expected: "1" },
      { input: "1", expected: "1" },
      { input: "5", expected: "120" },
      { input: "10", expected: "3628800" },
      { input: "7", expected: "5040" },
    ],
    tags: ["bucles", "factorial", "aritmetica", "matematicas"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  // ============================================================
  // INTERMEDIATE (5 exercises) — 25 points each
  // ============================================================
  {
    title: "Números primos",
    slug: "python-numeros-primos",
    description:
      "Lee un número entero n (n >= 2) e imprime todos los números primos desde 2 hasta n (inclusive), separados por espacios.",
    difficulty: "intermediate",
    languageSlug: "python",
    starterCode: `# Ejercicio: Números primos
# Lee n e imprime todos los primos del 2 al n separados por espacios.
# Un número primo solo es divisible por 1 y por sí mismo.

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
primos = []
for num in range(2, n + 1):
    es_primo = True
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            es_primo = False
            break
    if es_primo:
        primos.append(str(num))
print(" ".join(primos))
`,
    testCases: [
      { input: "10", expected: "2 3 5 7" },
      { input: "2", expected: "2" },
      { input: "20", expected: "2 3 5 7 11 13 17 19" },
      { input: "30", expected: "2 3 5 7 11 13 17 19 23 29" },
    ],
    tags: ["primos", "bucles", "matematicas", "optimizacion"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },
  {
    title: "Ordenar lista",
    slug: "python-ordenar-lista",
    description:
      "Lee un número entero n en la primera línea, luego lee n números enteros (uno por línea). Imprime los números ordenados de menor a mayor, uno por línea.",
    difficulty: "intermediate",
    languageSlug: "python",
    starterCode: `# Ejercicio: Ordenar lista
# Lee n, luego n números (uno por línea).
# Imprime los números ordenados de menor a mayor, uno por línea.

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
numeros = []
for _ in range(n):
    numeros.append(int(input()))
numeros.sort()
for num in numeros:
    print(num)
`,
    testCases: [
      { input: "5\n3\n1\n4\n1\n5", expected: "1\n1\n3\n4\n5" },
      { input: "3\n9\n2\n7", expected: "2\n7\n9" },
      { input: "4\n-3\n0\n5\n-1", expected: "-3\n-1\n0\n5" },
      { input: "1\n42", expected: "42" },
    ],
    tags: ["listas", "ordenamiento", "sort", "bucles"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },
  {
    title: "Palíndromo",
    slug: "python-palindromo",
    description:
      "Lee una cadena de texto e imprime \"Si\" si es un palíndromo o \"No\" si no lo es. Ignora las diferencias entre mayúsculas y minúsculas. Un palíndromo se lee igual de izquierda a derecha que de derecha a izquierda.",
    difficulty: "intermediate",
    languageSlug: "python",
    starterCode: `# Ejercicio: Palíndromo
# Lee una cadena e imprime "Si" si es palíndromo, "No" si no lo es.
# Ignora mayúsculas/minúsculas.
# Ejemplo: "Ana" -> "Si", "Hola" -> "No"

texto = input()
# Tu código aquí
`,
    solution: `texto = input()
limpio = texto.lower()
if limpio == limpio[::-1]:
    print("Si")
else:
    print("No")
`,
    testCases: [
      { input: "Ana", expected: "Si" },
      { input: "Hola", expected: "No" },
      { input: "reconocer", expected: "Si" },
      { input: "Python", expected: "No" },
      { input: "Aba", expected: "Si" },
    ],
    tags: ["cadenas", "palindromo", "condicionales", "slicing"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },
  {
    title: "Suma de dígitos",
    slug: "python-suma-digitos",
    description:
      "Lee un número entero no negativo e imprime la suma de sus dígitos. Por ejemplo, para 123 la suma es 1 + 2 + 3 = 6.",
    difficulty: "intermediate",
    languageSlug: "python",
    starterCode: `# Ejercicio: Suma de dígitos
# Lee un número entero no negativo e imprime la suma de sus dígitos.
# Ejemplo: 123 -> 6

n = input()
# Tu código aquí
`,
    solution: `n = input()
print(sum(int(d) for d in n))
`,
    testCases: [
      { input: "123", expected: "6" },
      { input: "0", expected: "0" },
      { input: "9999", expected: "36" },
      { input: "105", expected: "6" },
      { input: "11111", expected: "5" },
    ],
    tags: ["cadenas", "digitos", "bucles", "aritmetica"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },
  {
    title: "Matriz transpuesta",
    slug: "python-matriz-transpuesta",
    description:
      "Lee un entero N en la primera línea, seguido de N líneas con N números enteros separados por espacios (una matriz NxN). Imprime la transpuesta de la matriz: N líneas, cada una con N números separados por espacios.",
    difficulty: "intermediate",
    languageSlug: "python",
    starterCode: `# Ejercicio: Matriz transpuesta
# Lee N, luego una matriz NxN de enteros.
# Imprime la transpuesta de la matriz.
# La transpuesta intercambia filas por columnas.

n = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
matriz = []
for _ in range(n):
    fila = list(map(int, input().split()))
    matriz.append(fila)
for j in range(n):
    fila_t = []
    for i in range(n):
        fila_t.append(str(matriz[i][j]))
    print(" ".join(fila_t))
`,
    testCases: [
      {
        input: "2\n1 2\n3 4",
        expected: "1 3\n2 4",
      },
      {
        input: "3\n1 2 3\n4 5 6\n7 8 9",
        expected: "1 4 7\n2 5 8\n3 6 9",
      },
      {
        input: "1\n5",
        expected: "5",
      },
      {
        input: "3\n0 0 0\n0 0 0\n0 0 0",
        expected: "0 0 0\n0 0 0\n0 0 0",
      },
    ],
    tags: ["matrices", "listas", "bucles", "transpuesta"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  // ============================================================
  // ADVANCED (5 exercises) — 40 points each
  // ============================================================
  {
    title: "Búsqueda binaria",
    slug: "python-busqueda-binaria",
    description:
      "La primera línea contiene n (cantidad de elementos). La segunda línea contiene n enteros ordenados de menor a mayor separados por espacios. La tercera línea contiene el número objetivo a buscar. Imprime el índice (basado en 0) del objetivo en la lista, o -1 si no se encuentra. Debes implementar búsqueda binaria.",
    difficulty: "advanced",
    languageSlug: "python",
    starterCode: `# Ejercicio: Búsqueda binaria
# Lee n, luego n enteros ordenados, luego un objetivo.
# Imprime el índice (0-based) del objetivo o -1 si no existe.
# Implementa el algoritmo de búsqueda binaria.

n = int(input())
lista = list(map(int, input().split()))
objetivo = int(input())
# Tu código aquí
`,
    solution: `n = int(input())
lista = list(map(int, input().split()))
objetivo = int(input())

izq, der = 0, n - 1
resultado = -1
while izq <= der:
    medio = (izq + der) // 2
    if lista[medio] == objetivo:
        resultado = medio
        break
    elif lista[medio] < objetivo:
        izq = medio + 1
    else:
        der = medio - 1
print(resultado)
`,
    testCases: [
      { input: "5\n1 3 5 7 9\n5", expected: "2" },
      { input: "5\n1 3 5 7 9\n4", expected: "-1" },
      { input: "6\n2 4 6 8 10 12\n12", expected: "5" },
      { input: "6\n2 4 6 8 10 12\n2", expected: "0" },
      { input: "1\n42\n42", expected: "0" },
    ],
    tags: ["busqueda", "binaria", "algoritmos", "listas"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
  {
    title: "Torre de Hanoi",
    slug: "python-torre-hanoi",
    description:
      "Lee un número entero n (el número de discos). Imprime los movimientos necesarios para resolver la Torre de Hanoi con n discos, moviendo de la torre A a la torre C usando B como auxiliar. Cada movimiento debe imprimirse como \"De X a Y\" donde X e Y son A, B o C.",
    difficulty: "advanced",
    languageSlug: "python",
    starterCode: `# Ejercicio: Torre de Hanoi
# Lee n (número de discos).
# Imprime los movimientos para mover n discos de A a C.
# Formato: "De X a Y" (ej: "De A a C")
# Usa recursión.

n = int(input())
# Tu código aquí
`,
    solution: `def hanoi(n, origen, destino, auxiliar):
    if n == 1:
        print(f"De {origen} a {destino}")
        return
    hanoi(n - 1, origen, auxiliar, destino)
    print(f"De {origen} a {destino}")
    hanoi(n - 1, auxiliar, destino, origen)

n = int(input())
hanoi(n, "A", "C", "B")
`,
    testCases: [
      {
        input: "1",
        expected: "De A a C",
      },
      {
        input: "2",
        expected: "De A a B\nDe A a C\nDe B a C",
      },
      {
        input: "3",
        expected:
          "De A a C\nDe A a B\nDe C a B\nDe A a C\nDe B a A\nDe B a C\nDe A a C",
      },
    ],
    tags: ["recursion", "hanoi", "algoritmos", "clasicos"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
  {
    title: "Números romanos",
    slug: "python-numeros-romanos",
    description:
      "Lee una cadena que representa un número romano válido (usando I, V, X, L, C, D, M) e imprime su valor en decimal. Los números romanos pueden usar notación sustractiva (por ejemplo, IV = 4, IX = 9).",
    difficulty: "advanced",
    languageSlug: "python",
    starterCode: `# Ejercicio: Números romanos a decimal
# Lee un número romano (ej: "XIV") e imprime su valor decimal.
# Valores: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
# Regla sustractiva: si un valor menor precede a uno mayor, se resta.

romano = input()
# Tu código aquí
`,
    solution: `romano = input()
valores = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
total = 0
for i in range(len(romano)):
    if i + 1 < len(romano) and valores[romano[i]] < valores[romano[i + 1]]:
        total -= valores[romano[i]]
    else:
        total += valores[romano[i]]
print(total)
`,
    testCases: [
      { input: "III", expected: "3" },
      { input: "IV", expected: "4" },
      { input: "IX", expected: "9" },
      { input: "XLII", expected: "42" },
      { input: "MCMXCIV", expected: "1994" },
    ],
    tags: ["cadenas", "diccionarios", "romanos", "conversion"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
  {
    title: "Comprimir cadena",
    slug: "python-comprimir-cadena",
    description:
      "Lee una cadena de texto e imprime su compresión RLE (Run-Length Encoding). Cada carácter consecutivo repetido se reemplaza por el carácter seguido del número de repeticiones. Por ejemplo, \"aabbc\" se convierte en \"a2b2c1\".",
    difficulty: "advanced",
    languageSlug: "python",
    starterCode: `# Ejercicio: Comprimir cadena (RLE)
# Lee una cadena e imprime su compresión Run-Length Encoding.
# Ejemplo: "aabbc" -> "a2b2c1"
# Cada grupo de caracteres iguales consecutivos se comprime.

texto = input()
# Tu código aquí
`,
    solution: `texto = input()
if not texto:
    print("")
else:
    resultado = ""
    actual = texto[0]
    cuenta = 1
    for i in range(1, len(texto)):
        if texto[i] == actual:
            cuenta += 1
        else:
            resultado += actual + str(cuenta)
            actual = texto[i]
            cuenta = 1
    resultado += actual + str(cuenta)
    print(resultado)
`,
    testCases: [
      { input: "aabbc", expected: "a2b2c1" },
      { input: "aaaa", expected: "a4" },
      { input: "abcde", expected: "a1b1c1d1e1" },
      { input: "aaabbbccc", expected: "a3b3c3" },
      { input: "aabbbcccc", expected: "a2b3c4" },
    ],
    tags: ["cadenas", "compresion", "rle", "bucles"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
  {
    title: "Subarray suma máxima",
    slug: "python-subarray-suma-maxima",
    description:
      "Lee un entero n en la primera línea, seguido de n enteros separados por espacios en la segunda línea. Encuentra e imprime la suma máxima de cualquier subarray contiguo (algoritmo de Kadane). Se garantiza que n >= 1.",
    difficulty: "advanced",
    languageSlug: "python",
    starterCode: `# Ejercicio: Subarray de suma máxima (Kadane)
# Lee n, luego n enteros separados por espacios.
# Imprime la suma máxima de un subarray contiguo.
# Usa el algoritmo de Kadane para resolverlo en O(n).

n = int(input())
nums = list(map(int, input().split()))
# Tu código aquí
`,
    solution: `n = int(input())
nums = list(map(int, input().split()))
max_actual = nums[0]
max_global = nums[0]
for i in range(1, n):
    max_actual = max(nums[i], max_actual + nums[i])
    if max_actual > max_global:
        max_global = max_actual
print(max_global)
`,
    testCases: [
      { input: "8\n-2 1 -3 4 -1 2 1 -5", expected: "6" },
      { input: "1\n-1", expected: "-1" },
      { input: "5\n1 2 3 4 5", expected: "15" },
      { input: "5\n-1 -2 -3 -4 -5", expected: "-1" },
      { input: "6\n2 -1 2 3 -9 4", expected: "6" },
    ],
    tags: ["algoritmos", "kadane", "arreglos", "programacion-dinamica"],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
];
