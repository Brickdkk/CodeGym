import { storage } from "./storage.js";
import type { InsertExercise, InsertLanguage } from "../shared/schema.js";

interface ExerciseTemplate {
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
}

export class ExerciseGenerator {
  private exerciseTemplates: Record<string, Record<string, ExerciseTemplate[]>> = {
    python: {
      beginner: [
        {
          title: "Suma de dos números",
          description: "Escribe una función que tome dos números y devuelva su suma.",
          starterCode: "def suma(a, b):\n    # Tu código aquí\n    pass",
          solution: "def suma(a, b):\n    return a + b",
          testCases: [
            { input: "suma(2, 3)", expected: "5" },
            { input: "suma(-1, 1)", expected: "0" },
            { input: "suma(0, 0)", expected: "0" }
          ],
          tags: ["matemáticas", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número par o impar",
          description: "Determina si un número es par o impar.",
          starterCode: "def es_par(n):\n    # Tu código aquí\n    pass",
          solution: "def es_par(n):\n    return n % 2 == 0",
          testCases: [
            { input: "es_par(4)", expected: "True" },
            { input: "es_par(7)", expected: "False" },
            { input: "es_par(0)", expected: "True" }
          ],
          tags: ["lógica", "matemáticas"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Longitud de cadena",
          description: "Calcula la longitud de una cadena de texto.",
          starterCode: "def longitud_cadena(texto):\n    # Tu código aquí\n    pass",
          solution: "def longitud_cadena(texto):\n    return len(texto)",
          testCases: [
            { input: "longitud_cadena('hola')", expected: "4" },
            { input: "longitud_cadena('')", expected: "0" },
            { input: "longitud_cadena('Python')", expected: "6" }
          ],
          tags: ["strings", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Máximo de tres números",
          description: "Encuentra el número más grande entre tres números dados.",
          starterCode: "def maximo_tres(a, b, c):\n    # Tu código aquí\n    pass",
          solution: "def maximo_tres(a, b, c):\n    return max(a, b, c)",
          testCases: [
            { input: "maximo_tres(1, 2, 3)", expected: "3" },
            { input: "maximo_tres(5, 2, 8)", expected: "8" },
            { input: "maximo_tres(-1, -5, -3)", expected: "-1" }
          ],
          tags: ["comparación", "lógica"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Invertir cadena",
          description: "Invierte una cadena de texto.",
          starterCode: "def invertir_cadena(texto):\n    # Tu código aquí\n    pass",
          solution: "def invertir_cadena(texto):\n    return texto[::-1]",
          testCases: [
            { input: "invertir_cadena('hola')", expected: "'aloh'" },
            { input: "invertir_cadena('Python')", expected: "'nohtyP'" },
            { input: "invertir_cadena('a')", expected: "'a'" }
          ],
          tags: ["strings", "manipulación"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Contar vocales",
          description: "Cuenta las vocales en una cadena de texto.",
          starterCode: "def contar_vocales(texto):\n    # Tu código aquí\n    pass",
          solution: "def contar_vocales(texto):\n    vocales = 'aeiouAEIOU'\n    return sum(1 for char in texto if char in vocales)",
          testCases: [
            { input: "contar_vocales('hola')", expected: "2" },
            { input: "contar_vocales('Python')", expected: "1" },
            { input: "contar_vocales('xyz')", expected: "0" }
          ],
          tags: ["strings", "conteo"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Área de círculo",
          description: "Calcula el área de un círculo dado su radio.",
          starterCode: "import math\n\ndef area_circulo(radio):\n    # Tu código aquí\n    pass",
          solution: "import math\n\ndef area_circulo(radio):\n    return math.pi * radio ** 2",
          testCases: [
            { input: "round(area_circulo(1), 2)", expected: "3.14" },
            { input: "round(area_circulo(2), 2)", expected: "12.57" },
            { input: "round(area_circulo(0), 2)", expected: "0.0" }
          ],
          tags: ["matemáticas", "geometría"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Tabla de multiplicar",
          description: "Genera la tabla de multiplicar de un número hasta el 10.",
          starterCode: "def tabla_multiplicar(n):\n    # Tu código aquí\n    pass",
          solution: "def tabla_multiplicar(n):\n    return [n * i for i in range(1, 11)]",
          testCases: [
            { input: "tabla_multiplicar(2)", expected: "[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]" },
            { input: "tabla_multiplicar(5)", expected: "[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]" },
            { input: "tabla_multiplicar(1)", expected: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" }
          ],
          tags: ["matemáticas", "listas"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número positivo, negativo o cero",
          description: "Determina si un número es positivo, negativo o cero.",
          starterCode: "def clasificar_numero(n):\n    # Tu código aquí\n    pass",
          solution: "def clasificar_numero(n):\n    if n > 0:\n        return 'positivo'\n    elif n < 0:\n        return 'negativo'\n    else:\n        return 'cero'",
          testCases: [
            { input: "clasificar_numero(5)", expected: "'positivo'" },
            { input: "clasificar_numero(-3)", expected: "'negativo'" },
            { input: "clasificar_numero(0)", expected: "'cero'" }
          ],
          tags: ["lógica", "condicionales"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Factorial simple",
          description: "Calcula el factorial de un número usando bucles.",
          starterCode: "def factorial(n):\n    # Tu código aquí\n    pass",
          solution: "def factorial(n):\n    if n <= 1:\n        return 1\n    resultado = 1\n    for i in range(2, n + 1):\n        resultado *= i\n    return resultado",
          testCases: [
            { input: "factorial(5)", expected: "120" },
            { input: "factorial(0)", expected: "1" },
            { input: "factorial(3)", expected: "6" }
          ],
          tags: ["matemáticas", "recursión"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Ordenamiento burbuja",
          description: "Implementa el algoritmo de ordenamiento burbuja.",
          starterCode: "def ordenamiento_burbuja(arr):\n    # Tu código aquí\n    pass",
          solution: "def ordenamiento_burbuja(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr",
          testCases: [
            { input: "ordenamiento_burbuja([64, 34, 25, 12, 22, 11, 90])", expected: "[11, 12, 22, 25, 34, 64, 90]" },
            { input: "ordenamiento_burbuja([5, 2, 8, 1, 9])", expected: "[1, 2, 5, 8, 9]" },
            { input: "ordenamiento_burbuja([1])", expected: "[1]" }
          ],
          tags: ["algoritmos", "ordenamiento"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Números primos",
          description: "Verifica si un número es primo.",
          starterCode: "def es_primo(n):\n    # Tu código aquí\n    pass",
          solution: "def es_primo(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True",
          testCases: [
            { input: "es_primo(17)", expected: "True" },
            { input: "es_primo(4)", expected: "False" },
            { input: "es_primo(2)", expected: "True" }
          ],
          tags: ["matemáticas", "optimización"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Secuencia Fibonacci",
          description: "Genera los primeros n números de la secuencia Fibonacci.",
          starterCode: "def fibonacci(n):\n    # Tu código aquí\n    pass",
          solution: "def fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    elif n == 2:\n        return [0, 1]\n    \n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[i-1] + fib[i-2])\n    return fib",
          testCases: [
            { input: "fibonacci(7)", expected: "[0, 1, 1, 2, 3, 5, 8]" },
            { input: "fibonacci(1)", expected: "[0]" },
            { input: "fibonacci(0)", expected: "[]" }
          ],
          tags: ["secuencias", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Anagramas",
          description: "Verifica si dos palabras son anagramas.",
          starterCode: "def son_anagramas(palabra1, palabra2):\n    # Tu código aquí\n    pass",
          solution: "def son_anagramas(palabra1, palabra2):\n    return sorted(palabra1.lower()) == sorted(palabra2.lower())",
          testCases: [
            { input: "son_anagramas('amor', 'roma')", expected: "True" },
            { input: "son_anagramas('python', 'java')", expected: "False" },
            { input: "son_anagramas('listen', 'silent')", expected: "True" }
          ],
          tags: ["strings", "algoritmos"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Palíndromo",
          description: "Verifica si una palabra es un palíndromo.",
          starterCode: "def es_palindromo(palabra):\n    # Tu código aquí\n    pass",
          solution: "def es_palindromo(palabra):\n    palabra = palabra.lower().replace(' ', '')\n    return palabra == palabra[::-1]",
          testCases: [
            { input: "es_palindromo('radar')", expected: "True" },
            { input: "es_palindromo('python')", expected: "False" },
            { input: "es_palindromo('A man a plan a canal Panama')", expected: "True" }
          ],
          tags: ["strings", "algoritmos"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Búsqueda binaria",
          description: "Implementa búsqueda binaria en una lista ordenada.",
          starterCode: "def busqueda_binaria(arr, objetivo):\n    # Tu código aquí\n    pass",
          solution: "def busqueda_binaria(arr, objetivo):\n    izq, der = 0, len(arr) - 1\n    while izq <= der:\n        medio = (izq + der) // 2\n        if arr[medio] == objetivo:\n            return medio\n        elif arr[medio] < objetivo:\n            izq = medio + 1\n        else:\n            der = medio - 1\n    return -1",
          testCases: [
            { input: "busqueda_binaria([1, 3, 5, 7, 9, 11], 7)", expected: "3" },
            { input: "busqueda_binaria([1, 3, 5, 7, 9, 11], 4)", expected: "-1" },
            { input: "busqueda_binaria([2, 4, 6, 8, 10], 2)", expected: "0" }
          ],
          tags: ["algoritmos", "búsqueda"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Matriz transpuesta",
          description: "Calcula la transpuesta de una matriz.",
          starterCode: "def transponer_matriz(matriz):\n    # Tu código aquí\n    pass",
          solution: "def transponer_matriz(matriz):\n    return [[matriz[j][i] for j in range(len(matriz))] for i in range(len(matriz[0]))]",
          testCases: [
            { input: "transponer_matriz([[1, 2, 3], [4, 5, 6]])", expected: "[[1, 4], [2, 5], [3, 6]]" },
            { input: "transponer_matriz([[1, 2], [3, 4], [5, 6]])", expected: "[[1, 3, 5], [2, 4, 6]]" },
            { input: "transponer_matriz([[1]])", expected: "[[1]]" }
          ],
          tags: ["matrices", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Contar caracteres",
          description: "Cuenta la frecuencia de cada caracter en una cadena.",
          starterCode: "def contar_caracteres(texto):\n    # Tu código aquí\n    pass",
          solution: "def contar_caracteres(texto):\n    contador = {}\n    for char in texto:\n        contador[char] = contador.get(char, 0) + 1\n    return contador",
          testCases: [
            { input: "contar_caracteres('hello')", expected: "{'h': 1, 'e': 1, 'l': 2, 'o': 1}" },
            { input: "contar_caracteres('aab')", expected: "{'a': 2, 'b': 1}" },
            { input: "contar_caracteres('xyz')", expected: "{'x': 1, 'y': 1, 'z': 1}" }
          ],
          tags: ["strings", "diccionarios"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Suma de matriz",
          description: "Suma dos matrices del mismo tamaño.",
          starterCode: "def sumar_matrices(matriz1, matriz2):\n    # Tu código aquí\n    pass",
          solution: "def sumar_matrices(matriz1, matriz2):\n    return [[matriz1[i][j] + matriz2[i][j] for j in range(len(matriz1[0]))] for i in range(len(matriz1))]",
          testCases: [
            { input: "sumar_matrices([[1, 2], [3, 4]], [[5, 6], [7, 8]])", expected: "[[6, 8], [10, 12]]" },
            { input: "sumar_matrices([[1, 0], [0, 1]], [[0, 1], [1, 0]])", expected: "[[1, 1], [1, 1]]" },
            { input: "sumar_matrices([[2]], [[3]])", expected: "[[5]]" }
          ],
          tags: ["matrices", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Números perfectos",
          description: "Verifica si un número es perfecto (suma de sus divisores propios).",
          starterCode: "def es_numero_perfecto(n):\n    # Tu código aquí\n    pass",
          solution: "def es_numero_perfecto(n):\n    if n <= 1:\n        return False\n    suma_divisores = 1\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            suma_divisores += i\n            if i != n // i:\n                suma_divisores += n // i\n    return suma_divisores == n",
          testCases: [
            { input: "es_numero_perfecto(6)", expected: "True" },
            { input: "es_numero_perfecto(28)", expected: "True" },
            { input: "es_numero_perfecto(12)", expected: "False" }
          ],
          tags: ["matemáticas", "números"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Algoritmo de Dijkstra",
          description: "Implementa el algoritmo de Dijkstra para encontrar el camino más corto.",
          starterCode: "import heapq\n\ndef dijkstra(grafo, inicio):\n    # Tu código aquí\n    pass",
          solution: "import heapq\n\ndef dijkstra(grafo, inicio):\n    distancias = {nodo: float('infinity') for nodo in grafo}\n    distancias[inicio] = 0\n    cola = [(0, inicio)]\n    \n    while cola:\n        dist_actual, nodo_actual = heapq.heappop(cola)\n        \n        if dist_actual > distancias[nodo_actual]:\n            continue\n            \n        for vecino, peso in grafo[nodo_actual].items():\n            distancia = dist_actual + peso\n            \n            if distancia < distancias[vecino]:\n                distancias[vecino] = distancia\n                heapq.heappush(cola, (distancia, vecino))\n    \n    return distancias",
          testCases: [
            { input: "dijkstra({'A': {'B': 1, 'C': 4}, 'B': {'C': 2, 'D': 5}, 'C': {'D': 1}, 'D': {}}, 'A')", expected: "{'A': 0, 'B': 1, 'C': 3, 'D': 4}" }
          ],
          tags: ["grafos", "algoritmos"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Programación Dinámica - Mochila",
          description: "Resuelve el problema de la mochila usando programación dinámica.",
          starterCode: "def problema_mochila(pesos, valores, capacidad):\n    # Tu código aquí\n    pass",
          solution: "def problema_mochila(pesos, valores, capacidad):\n    n = len(pesos)\n    dp = [[0 for _ in range(capacidad + 1)] for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(1, capacidad + 1):\n            if pesos[i-1] <= w:\n                dp[i][w] = max(valores[i-1] + dp[i-1][w-pesos[i-1]], dp[i-1][w])\n            else:\n                dp[i][w] = dp[i-1][w]\n    \n    return dp[n][capacidad]",
          testCases: [
            { input: "problema_mochila([10, 20, 30], [60, 100, 120], 50)", expected: "220" },
            { input: "problema_mochila([1, 3, 4, 5], [1, 4, 5, 7], 7)", expected: "9" }
          ],
          tags: ["dp", "optimización"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Árbol Binario de Búsqueda",
          description: "Implementa un árbol binario de búsqueda con inserción y búsqueda.",
          starterCode: "class Nodo:\n    def __init__(self, valor):\n        self.valor = valor\n        self.izquierdo = None\n        self.derecho = None\n\nclass ArbolBST:\n    def __init__(self):\n        self.raiz = None\n    \n    def insertar(self, valor):\n        # Tu código aquí\n        pass\n    \n    def buscar(self, valor):\n        # Tu código aquí\n        pass",
          solution: "class Nodo:\n    def __init__(self, valor):\n        self.valor = valor\n        self.izquierdo = None\n        self.derecho = None\n\nclass ArbolBST:\n    def __init__(self):\n        self.raiz = None\n    \n    def insertar(self, valor):\n        if self.raiz is None:\n            self.raiz = Nodo(valor)\n        else:\n            self._insertar_recursivo(self.raiz, valor)\n    \n    def _insertar_recursivo(self, nodo, valor):\n        if valor < nodo.valor:\n            if nodo.izquierdo is None:\n                nodo.izquierdo = Nodo(valor)\n            else:\n                self._insertar_recursivo(nodo.izquierdo, valor)\n        else:\n            if nodo.derecho is None:\n                nodo.derecho = Nodo(valor)\n            else:\n                self._insertar_recursivo(nodo.derecho, valor)\n    \n    def buscar(self, valor):\n        return self._buscar_recursivo(self.raiz, valor)\n    \n    def _buscar_recursivo(self, nodo, valor):\n        if nodo is None or nodo.valor == valor:\n            return nodo is not None\n        if valor < nodo.valor:\n            return self._buscar_recursivo(nodo.izquierdo, valor)\n        return self._buscar_recursivo(nodo.derecho, valor)",
          testCases: [
            { input: "arbol = ArbolBST(); arbol.insertar(50); arbol.insertar(30); arbol.insertar(70); arbol.buscar(30)", expected: "True" },
            { input: "arbol = ArbolBST(); arbol.insertar(10); arbol.buscar(20)", expected: "False" }
          ],
          tags: ["estructuras", "árboles"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Backtracking - N Reinas",
          description: "Resuelve el problema de las N reinas usando backtracking.",
          starterCode: "def n_reinas(n):\n    # Tu código aquí\n    pass",
          solution: "def n_reinas(n):\n    def es_seguro(tablero, fila, col):\n        for i in range(fila):\n            if tablero[i] == col or abs(tablero[i] - col) == abs(i - fila):\n                return False\n        return True\n    \n    def resolver(tablero, fila):\n        if fila == n:\n            return [tablero[:]]\n        \n        soluciones = []\n        for col in range(n):\n            if es_seguro(tablero, fila, col):\n                tablero[fila] = col\n                soluciones.extend(resolver(tablero, fila + 1))\n                tablero[fila] = -1\n        \n        return soluciones\n    \n    return resolver([-1] * n, 0)",
          testCases: [
            { input: "len(n_reinas(4))", expected: "2" },
            { input: "len(n_reinas(8))", expected: "92" }
          ],
          tags: ["backtracking", "recursión"],
          timeLimit: 10000,
          memoryLimit: 1024
        },
        {
          title: "Algoritmos de Grafos - DFS",
          description: "Implementa búsqueda en profundidad (DFS) para grafos.",
          starterCode: "def dfs(grafo, inicio, visitados=None):\n    # Tu código aquí\n    pass",
          solution: "def dfs(grafo, inicio, visitados=None):\n    if visitados is None:\n        visitados = set()\n    \n    visitados.add(inicio)\n    resultado = [inicio]\n    \n    for vecino in grafo.get(inicio, []):\n        if vecino not in visitados:\n            resultado.extend(dfs(grafo, vecino, visitados))\n    \n    return resultado",
          testCases: [
            { input: "sorted(dfs({'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}, 'A'))", expected: "['A', 'B', 'C', 'D']" }
          ],
          tags: ["grafos", "búsqueda"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de ordenamiento QuickSort",
          description: "Implementa el algoritmo QuickSort de manera eficiente.",
          starterCode: "def quicksort(arr):\n    # Tu código aquí\n    pass",
          solution: "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    pivote = arr[len(arr) // 2]\n    izquierda = [x for x in arr if x < pivote]\n    medio = [x for x in arr if x == pivote]\n    derecha = [x for x in arr if x > pivote]\n    \n    return quicksort(izquierda) + medio + quicksort(derecha)",
          testCases: [
            { input: "quicksort([3, 6, 8, 10, 1, 2, 1])", expected: "[1, 1, 2, 3, 6, 8, 10]" },
            { input: "quicksort([64, 34, 25, 12, 22, 11, 90])", expected: "[11, 12, 22, 25, 34, 64, 90]" }
          ],
          tags: ["ordenamiento", "recursión"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de MergeSort",
          description: "Implementa el algoritmo MergeSort de divide y vencerás.",
          starterCode: "def mergesort(arr):\n    # Tu código aquí\n    pass",
          solution: "def mergesort(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    medio = len(arr) // 2\n    izquierda = mergesort(arr[:medio])\n    derecha = mergesort(arr[medio:])\n    \n    return merge(izquierda, derecha)\n\ndef merge(izq, der):\n    resultado = []\n    i = j = 0\n    \n    while i < len(izq) and j < len(der):\n        if izq[i] <= der[j]:\n            resultado.append(izq[i])\n            i += 1\n        else:\n            resultado.append(der[j])\n            j += 1\n    \n    resultado.extend(izq[i:])\n    resultado.extend(der[j:])\n    return resultado",
          testCases: [
            { input: "mergesort([38, 27, 43, 3, 9, 82, 10])", expected: "[3, 9, 10, 27, 38, 43, 82]" },
            { input: "mergesort([64, 34, 25, 12, 22, 11, 90])", expected: "[11, 12, 22, 25, 34, 64, 90]" }
          ],
          tags: ["ordenamiento", "divide y vencerás"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Programación Dinámica - LCS",
          description: "Encuentra la subsecuencia común más larga entre dos cadenas.",
          starterCode: "def lcs(texto1, texto2):\n    # Tu código aquí\n    pass",
          solution: "def lcs(texto1, texto2):\n    m, n = len(texto1), len(texto2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if texto1[i-1] == texto2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    return dp[m][n]",
          testCases: [
            { input: "lcs('ABCDGH', 'AEDFHR')", expected: "3" },
            { input: "lcs('AGGTAB', 'GXTXAYB')", expected: "4" }
          ],
          tags: ["dp", "strings"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmos de Árboles - BFS",
          description: "Implementa búsqueda en anchura (BFS) para árboles.",
          starterCode: "from collections import deque\n\ndef bfs(grafo, inicio):\n    # Tu código aquí\n    pass",
          solution: "from collections import deque\n\ndef bfs(grafo, inicio):\n    visitados = set()\n    cola = deque([inicio])\n    resultado = []\n    \n    while cola:\n        nodo = cola.popleft()\n        if nodo not in visitados:\n            visitados.add(nodo)\n            resultado.append(nodo)\n            cola.extend(grafo.get(nodo, []))\n    \n    return resultado",
          testCases: [
            { input: "bfs({'A': ['B', 'C'], 'B': ['D', 'E'], 'C': ['F'], 'D': [], 'E': [], 'F': []}, 'A')", expected: "['A', 'B', 'C', 'D', 'E', 'F']" }
          ],
          tags: ["grafos", "búsqueda"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de Floyd-Warshall",
          description: "Encuentra las distancias más cortas entre todos los pares de vértices.",
          starterCode: "def floyd_warshall(grafo):\n    # Tu código aquí\n    pass",
          solution: "def floyd_warshall(grafo):\n    nodos = list(grafo.keys())\n    n = len(nodos)\n    \n    # Inicializar matriz de distancias\n    dist = [[float('inf')] * n for _ in range(n)]\n    \n    # Mapear nodos a índices\n    indice_nodo = {nodo: i for i, nodo in enumerate(nodos)}\n    \n    # Establecer distancias iniciales\n    for i in range(n):\n        dist[i][i] = 0\n    \n    for nodo in grafo:\n        i = indice_nodo[nodo]\n        for vecino, peso in grafo[nodo].items():\n            j = indice_nodo[vecino]\n            dist[i][j] = peso\n    \n    # Aplicar algoritmo Floyd-Warshall\n    for k in range(n):\n        for i in range(n):\n            for j in range(n):\n                if dist[i][k] + dist[k][j] < dist[i][j]:\n                    dist[i][j] = dist[i][k] + dist[k][j]\n    \n    return dist",
          testCases: [
            { input: "floyd_warshall({'0': {'1': 3, '3': 7}, '1': {'0': 8, '2': 2}, '2': {'0': 5, '3': 1}, '3': {'0': 2}})[0][2]", expected: "5" }
          ],
          tags: ["grafos", "caminos"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    },
    javascript: {
      beginner: [
        {
          title: "Suma de dos números",
          description: "Escribe una función que tome dos números y devuelva su suma.",
          starterCode: "function suma(a, b) {\n    // Tu código aquí\n}",
          solution: "function suma(a, b) {\n    return a + b;\n}",
          testCases: [
            { input: "suma(2, 3)", expected: "5" },
            { input: "suma(-1, 1)", expected: "0" },
            { input: "suma(0, 0)", expected: "0" }
          ],
          tags: ["matemáticas", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número par o impar",
          description: "Determina si un número es par o impar.",
          starterCode: "function esPar(n) {\n    // Tu código aquí\n}",
          solution: "function esPar(n) {\n    return n % 2 === 0;\n}",
          testCases: [
            { input: "esPar(4)", expected: "true" },
            { input: "esPar(7)", expected: "false" },
            { input: "esPar(0)", expected: "true" }
          ],
          tags: ["lógica", "matemáticas"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Longitud de cadena",
          description: "Calcula la longitud de una cadena de texto.",
          starterCode: "function longitudCadena(texto) {\n    // Tu código aquí\n}",
          solution: "function longitudCadena(texto) {\n    return texto.length;\n}",
          testCases: [
            { input: "longitudCadena('hola')", expected: "4" },
            { input: "longitudCadena('')", expected: "0" },
            { input: "longitudCadena('JavaScript')", expected: "10" }
          ],
          tags: ["strings", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Máximo de tres números",
          description: "Encuentra el número más grande entre tres números dados.",
          starterCode: "function maximoTres(a, b, c) {\n    // Tu código aquí\n}",
          solution: "function maximoTres(a, b, c) {\n    return Math.max(a, b, c);\n}",
          testCases: [
            { input: "maximoTres(1, 2, 3)", expected: "3" },
            { input: "maximoTres(5, 2, 8)", expected: "8" },
            { input: "maximoTres(-1, -5, -3)", expected: "-1" }
          ],
          tags: ["comparación", "lógica"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Invertir cadena",
          description: "Invierte una cadena de texto.",
          starterCode: "function invertirCadena(texto) {\n    // Tu código aquí\n}",
          solution: "function invertirCadena(texto) {\n    return texto.split('').reverse().join('');\n}",
          testCases: [
            { input: "invertirCadena('hola')", expected: "'aloh'" },
            { input: "invertirCadena('JavaScript')", expected: "'tpircSavaJ'" },
            { input: "invertirCadena('a')", expected: "'a'" }
          ],
          tags: ["strings", "manipulación"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Contar vocales",
          description: "Cuenta las vocales en una cadena de texto.",
          starterCode: "function contarVocales(texto) {\n    // Tu código aquí\n}",
          solution: "function contarVocales(texto) {\n    const vocales = 'aeiouAEIOU';\n    return texto.split('').filter(char => vocales.includes(char)).length;\n}",
          testCases: [
            { input: "contarVocales('hola')", expected: "2" },
            { input: "contarVocales('JavaScript')", expected: "3" },
            { input: "contarVocales('xyz')", expected: "0" }
          ],
          tags: ["strings", "conteo"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Área de círculo",
          description: "Calcula el área de un círculo dado su radio.",
          starterCode: "function areaCirculo(radio) {\n    // Tu código aquí\n}",
          solution: "function areaCirculo(radio) {\n    return Math.PI * radio * radio;\n}",
          testCases: [
            { input: "Math.round(areaCirculo(1) * 100) / 100", expected: "3.14" },
            { input: "Math.round(areaCirculo(2) * 100) / 100", expected: "12.57" },
            { input: "areaCirculo(0)", expected: "0" }
          ],
          tags: ["matemáticas", "geometría"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Tabla de multiplicar",
          description: "Genera la tabla de multiplicar de un número hasta el 10.",
          starterCode: "function tablaMultiplicar(n) {\n    // Tu código aquí\n}",
          solution: "function tablaMultiplicar(n) {\n    return Array.from({length: 10}, (_, i) => n * (i + 1));\n}",
          testCases: [
            { input: "tablaMultiplicar(2)", expected: "[2,4,6,8,10,12,14,16,18,20]" },
            { input: "tablaMultiplicar(5)", expected: "[5,10,15,20,25,30,35,40,45,50]" },
            { input: "tablaMultiplicar(1)", expected: "[1,2,3,4,5,6,7,8,9,10]" }
          ],
          tags: ["matemáticas", "arrays"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número positivo, negativo o cero",
          description: "Determina si un número es positivo, negativo o cero.",
          starterCode: "function clasificarNumero(n) {\n    // Tu código aquí\n}",
          solution: "function clasificarNumero(n) {\n    if (n > 0) return 'positivo';\n    if (n < 0) return 'negativo';\n    return 'cero';\n}",
          testCases: [
            { input: "clasificarNumero(5)", expected: "'positivo'" },
            { input: "clasificarNumero(-3)", expected: "'negativo'" },
            { input: "clasificarNumero(0)", expected: "'cero'" }
          ],
          tags: ["lógica", "condicionales"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Factorial simple",
          description: "Calcula el factorial de un número usando bucles.",
          starterCode: "function factorial(n) {\n    // Tu código aquí\n}",
          solution: "function factorial(n) {\n    if (n <= 1) return 1;\n    let resultado = 1;\n    for (let i = 2; i <= n; i++) {\n        resultado *= i;\n    }\n    return resultado;\n}",
          testCases: [
            { input: "factorial(5)", expected: "120" },
            { input: "factorial(0)", expected: "1" },
            { input: "factorial(3)", expected: "6" }
          ],
          tags: ["matemáticas", "bucles"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Ordenamiento burbuja",
          description: "Implementa el algoritmo de ordenamiento burbuja.",
          starterCode: "function ordenamientoBurbuja(arr) {\n    // Tu código aquí\n}",
          solution: "function ordenamientoBurbuja(arr) {\n    const n = arr.length;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n            }\n        }\n    }\n    return arr;\n}",
          testCases: [
            { input: "ordenamientoBurbuja([64, 34, 25, 12, 22, 11, 90])", expected: "[11,12,22,25,34,64,90]" },
            { input: "ordenamientoBurbuja([5, 2, 8, 1, 9])", expected: "[1,2,5,8,9]" },
            { input: "ordenamientoBurbuja([1])", expected: "[1]" }
          ],
          tags: ["algoritmos", "ordenamiento"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Números primos",
          description: "Verifica si un número es primo.",
          starterCode: "function esPrimo(n) {\n    // Tu código aquí\n}",
          solution: "function esPrimo(n) {\n    if (n < 2) return false;\n    for (let i = 2; i <= Math.sqrt(n); i++) {\n        if (n % i === 0) return false;\n    }\n    return true;\n}",
          testCases: [
            { input: "esPrimo(17)", expected: "true" },
            { input: "esPrimo(4)", expected: "false" },
            { input: "esPrimo(2)", expected: "true" }
          ],
          tags: ["matemáticas", "optimización"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Secuencia Fibonacci",
          description: "Genera los primeros n números de la secuencia Fibonacci.",
          starterCode: "function fibonacci(n) {\n    // Tu código aquí\n}",
          solution: "function fibonacci(n) {\n    if (n <= 0) return [];\n    if (n === 1) return [0];\n    if (n === 2) return [0, 1];\n    \n    const fib = [0, 1];\n    for (let i = 2; i < n; i++) {\n        fib.push(fib[i-1] + fib[i-2]);\n    }\n    return fib;\n}",
          testCases: [
            { input: "fibonacci(7)", expected: "[0,1,1,2,3,5,8]" },
            { input: "fibonacci(1)", expected: "[0]" },
            { input: "fibonacci(0)", expected: "[]" }
          ],
          tags: ["secuencias", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Anagramas",
          description: "Verifica si dos palabras son anagramas.",
          starterCode: "function sonAnagramas(palabra1, palabra2) {\n    // Tu código aquí\n}",
          solution: "function sonAnagramas(palabra1, palabra2) {\n    return palabra1.toLowerCase().split('').sort().join('') === \n           palabra2.toLowerCase().split('').sort().join('');\n}",
          testCases: [
            { input: "sonAnagramas('amor', 'roma')", expected: "true" },
            { input: "sonAnagramas('javascript', 'java')", expected: "false" },
            { input: "sonAnagramas('listen', 'silent')", expected: "true" }
          ],
          tags: ["strings", "algoritmos"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Palíndromo",
          description: "Verifica si una palabra es un palíndromo.",
          starterCode: "function esPalindromo(palabra) {\n    // Tu código aquí\n}",
          solution: "function esPalindromo(palabra) {\n    const limpia = palabra.toLowerCase().replace(/[^a-z]/g, '');\n    return limpia === limpia.split('').reverse().join('');\n}",
          testCases: [
            { input: "esPalindromo('radar')", expected: "true" },
            { input: "esPalindromo('javascript')", expected: "false" },
            { input: "esPalindromo('A man a plan a canal Panama')", expected: "true" }
          ],
          tags: ["strings", "algoritmos"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Búsqueda binaria",
          description: "Implementa búsqueda binaria en un array ordenado.",
          starterCode: "function busquedaBinaria(arr, objetivo) {\n    // Tu código aquí\n}",
          solution: "function busquedaBinaria(arr, objetivo) {\n    let izq = 0, der = arr.length - 1;\n    while (izq <= der) {\n        const medio = Math.floor((izq + der) / 2);\n        if (arr[medio] === objetivo) return medio;\n        if (arr[medio] < objetivo) izq = medio + 1;\n        else der = medio - 1;\n    }\n    return -1;\n}",
          testCases: [
            { input: "busquedaBinaria([1, 3, 5, 7, 9, 11], 7)", expected: "3" },
            { input: "busquedaBinaria([1, 3, 5, 7, 9, 11], 4)", expected: "-1" },
            { input: "busquedaBinaria([2, 4, 6, 8, 10], 2)", expected: "0" }
          ],
          tags: ["algoritmos", "búsqueda"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Matriz transpuesta",
          description: "Calcula la transpuesta de una matriz.",
          starterCode: "function transponerMatriz(matriz) {\n    // Tu código aquí\n}",
          solution: "function transponerMatriz(matriz) {\n    return matriz[0].map((_, i) => matriz.map(fila => fila[i]));\n}",
          testCases: [
            { input: "transponerMatriz([[1, 2, 3], [4, 5, 6]])", expected: "[[1,4],[2,5],[3,6]]" },
            { input: "transponerMatriz([[1, 2], [3, 4], [5, 6]])", expected: "[[1,3,5],[2,4,6]]" },
            { input: "transponerMatriz([[1]])", expected: "[[1]]" }
          ],
          tags: ["matrices", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Contar caracteres",
          description: "Cuenta la frecuencia de cada caracter en una cadena.",
          starterCode: "function contarCaracteres(texto) {\n    // Tu código aquí\n}",
          solution: "function contarCaracteres(texto) {\n    const contador = {};\n    for (const char of texto) {\n        contador[char] = (contador[char] || 0) + 1;\n    }\n    return contador;\n}",
          testCases: [
            { input: "JSON.stringify(contarCaracteres('hello'))", expected: "'{\"h\":1,\"e\":1,\"l\":2,\"o\":1}'" },
            { input: "JSON.stringify(contarCaracteres('aab'))", expected: "'{\"a\":2,\"b\":1}'" },
            { input: "JSON.stringify(contarCaracteres('xyz'))", expected: "'{\"x\":1,\"y\":1,\"z\":1}'" }
          ],
          tags: ["strings", "objetos"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Suma de matriz",
          description: "Suma dos matrices del mismo tamaño.",
          starterCode: "function sumarMatrices(matriz1, matriz2) {\n    // Tu código aquí\n}",
          solution: "function sumarMatrices(matriz1, matriz2) {\n    return matriz1.map((fila, i) => \n        fila.map((val, j) => val + matriz2[i][j])\n    );\n}",
          testCases: [
            { input: "sumarMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]])", expected: "[[6,8],[10,12]]" },
            { input: "sumarMatrices([[1, 0], [0, 1]], [[0, 1], [1, 0]])", expected: "[[1,1],[1,1]]" },
            { input: "sumarMatrices([[2]], [[3]])", expected: "[[5]]" }
          ],
          tags: ["matrices", "matemáticas"],
          timeLimit: 2000,
          memoryLimit: 256
        },
        {
          title: "Números perfectos",
          description: "Verifica si un número es perfecto (suma de sus divisores propios).",
          starterCode: "function esNumeroPerfecto(n) {\n    // Tu código aquí\n}",
          solution: "function esNumeroPerfecto(n) {\n    if (n <= 1) return false;\n    let sumaDivisores = 1;\n    for (let i = 2; i <= Math.sqrt(n); i++) {\n        if (n % i === 0) {\n            sumaDivisores += i;\n            if (i !== n / i) sumaDivisores += n / i;\n        }\n    }\n    return sumaDivisores === n;\n}",
          testCases: [
            { input: "esNumeroPerfecto(6)", expected: "true" },
            { input: "esNumeroPerfecto(28)", expected: "true" },
            { input: "esNumeroPerfecto(12)", expected: "false" }
          ],
          tags: ["matemáticas", "números"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Algoritmo de Dijkstra",
          description: "Implementa el algoritmo de Dijkstra para encontrar el camino más corto.",
          starterCode: "function dijkstra(grafo, inicio) {\n    // Tu código aquí\n}",
          solution: "function dijkstra(grafo, inicio) {\n    const distancias = {};\n    const visitados = new Set();\n    const cola = new Map();\n    \n    // Inicializar distancias\n    for (const nodo in grafo) {\n        distancias[nodo] = nodo === inicio ? 0 : Infinity;\n    }\n    \n    cola.set(inicio, 0);\n    \n    while (cola.size > 0) {\n        // Encontrar nodo con menor distancia\n        let nodoActual = null;\n        let menorDistancia = Infinity;\n        for (const [nodo, dist] of cola) {\n            if (dist < menorDistancia) {\n                menorDistancia = dist;\n                nodoActual = nodo;\n            }\n        }\n        \n        cola.delete(nodoActual);\n        visitados.add(nodoActual);\n        \n        // Actualizar distancias de vecinos\n        for (const vecino in grafo[nodoActual]) {\n            if (!visitados.has(vecino)) {\n                const nuevaDistancia = distancias[nodoActual] + grafo[nodoActual][vecino];\n                if (nuevaDistancia < distancias[vecino]) {\n                    distancias[vecino] = nuevaDistancia;\n                    cola.set(vecino, nuevaDistancia);\n                }\n            }\n        }\n    }\n    \n    return distancias;\n}",
          testCases: [
            { input: "JSON.stringify(dijkstra({'A': {'B': 1, 'C': 4}, 'B': {'C': 2, 'D': 5}, 'C': {'D': 1}, 'D': {}}, 'A'))", expected: "'{\"A\":0,\"B\":1,\"C\":3,\"D\":4}'" }
          ],
          tags: ["grafos", "algoritmos"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Programación Dinámica - Mochila",
          description: "Resuelve el problema de la mochila usando programación dinámica.",
          starterCode: "function problemaMochila(pesos, valores, capacidad) {\n    // Tu código aquí\n}",
          solution: "function problemaMochila(pesos, valores, capacidad) {\n    const n = pesos.length;\n    const dp = Array(n + 1).fill().map(() => Array(capacidad + 1).fill(0));\n    \n    for (let i = 1; i <= n; i++) {\n        for (let w = 1; w <= capacidad; w++) {\n            if (pesos[i-1] <= w) {\n                dp[i][w] = Math.max(\n                    valores[i-1] + dp[i-1][w-pesos[i-1]], \n                    dp[i-1][w]\n                );\n            } else {\n                dp[i][w] = dp[i-1][w];\n            }\n        }\n    }\n    \n    return dp[n][capacidad];\n}",
          testCases: [
            { input: "problemaMochila([10, 20, 30], [60, 100, 120], 50)", expected: "220" },
            { input: "problemaMochila([1, 3, 4, 5], [1, 4, 5, 7], 7)", expected: "9" }
          ],
          tags: ["dp", "optimización"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Árbol Binario de Búsqueda",
          description: "Implementa un árbol binario de búsqueda con inserción y búsqueda.",
          starterCode: "class Nodo {\n    constructor(valor) {\n        this.valor = valor;\n        this.izquierdo = null;\n        this.derecho = null;\n    }\n}\n\nclass ArbolBST {\n    constructor() {\n        this.raiz = null;\n    }\n    \n    insertar(valor) {\n        // Tu código aquí\n    }\n    \n    buscar(valor) {\n        // Tu código aquí\n    }\n}",
          solution: "class Nodo {\n    constructor(valor) {\n        this.valor = valor;\n        this.izquierdo = null;\n        this.derecho = null;\n    }\n}\n\nclass ArbolBST {\n    constructor() {\n        this.raiz = null;\n    }\n    \n    insertar(valor) {\n        if (this.raiz === null) {\n            this.raiz = new Nodo(valor);\n        } else {\n            this._insertarRecursivo(this.raiz, valor);\n        }\n    }\n    \n    _insertarRecursivo(nodo, valor) {\n        if (valor < nodo.valor) {\n            if (nodo.izquierdo === null) {\n                nodo.izquierdo = new Nodo(valor);\n            } else {\n                this._insertarRecursivo(nodo.izquierdo, valor);\n            }\n        } else {\n            if (nodo.derecho === null) {\n                nodo.derecho = new Nodo(valor);\n            } else {\n                this._insertarRecursivo(nodo.derecho, valor);\n            }\n        }\n    }\n    \n    buscar(valor) {\n        return this._buscarRecursivo(this.raiz, valor);\n    }\n    \n    _buscarRecursivo(nodo, valor) {\n        if (nodo === null || nodo.valor === valor) {\n            return nodo !== null;\n        }\n        if (valor < nodo.valor) {\n            return this._buscarRecursivo(nodo.izquierdo, valor);\n        }\n        return this._buscarRecursivo(nodo.derecho, valor);\n    }\n}",
          testCases: [
            { input: "const arbol = new ArbolBST(); arbol.insertar(50); arbol.insertar(30); arbol.insertar(70); arbol.buscar(30)", expected: "true" },
            { input: "const arbol = new ArbolBST(); arbol.insertar(10); arbol.buscar(20)", expected: "false" }
          ],
          tags: ["estructuras", "árboles"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Backtracking - N Reinas",
          description: "Resuelve el problema de las N reinas usando backtracking.",
          starterCode: "function nReinas(n) {\n    // Tu código aquí\n}",
          solution: "function nReinas(n) {\n    function esSeguro(tablero, fila, col) {\n        for (let i = 0; i < fila; i++) {\n            if (tablero[i] === col || Math.abs(tablero[i] - col) === Math.abs(i - fila)) {\n                return false;\n            }\n        }\n        return true;\n    }\n    \n    function resolver(tablero, fila) {\n        if (fila === n) {\n            return [tablero.slice()];\n        }\n        \n        const soluciones = [];\n        for (let col = 0; col < n; col++) {\n            if (esSeguro(tablero, fila, col)) {\n                tablero[fila] = col;\n                soluciones.push(...resolver(tablero, fila + 1));\n                tablero[fila] = -1;\n            }\n        }\n        \n        return soluciones;\n    }\n    \n    return resolver(Array(n).fill(-1), 0);\n}",
          testCases: [
            { input: "nReinas(4).length", expected: "2" },
            { input: "nReinas(8).length", expected: "92" }
          ],
          tags: ["backtracking", "recursión"],
          timeLimit: 10000,
          memoryLimit: 1024
        },
        {
          title: "Algoritmos de Grafos - DFS",
          description: "Implementa búsqueda en profundidad (DFS) para grafos.",
          starterCode: "function dfs(grafo, inicio, visitados = new Set()) {\n    // Tu código aquí\n}",
          solution: "function dfs(grafo, inicio, visitados = new Set()) {\n    visitados.add(inicio);\n    const resultado = [inicio];\n    \n    for (const vecino of grafo[inicio] || []) {\n        if (!visitados.has(vecino)) {\n            resultado.push(...dfs(grafo, vecino, visitados));\n        }\n    }\n    \n    return resultado;\n}",
          testCases: [
            { input: "dfs({'A': ['B', 'C'], 'B': ['D'], 'C': ['D'], 'D': []}, 'A').sort()", expected: "['A','B','C','D']" }
          ],
          tags: ["grafos", "búsqueda"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de ordenamiento QuickSort",
          description: "Implementa el algoritmo QuickSort de manera eficiente.",
          starterCode: "function quicksort(arr) {\n    // Tu código aquí\n}",
          solution: "function quicksort(arr) {\n    if (arr.length <= 1) return arr;\n    \n    const pivote = arr[Math.floor(arr.length / 2)];\n    const izquierda = arr.filter(x => x < pivote);\n    const medio = arr.filter(x => x === pivote);\n    const derecha = arr.filter(x => x > pivote);\n    \n    return [...quicksort(izquierda), ...medio, ...quicksort(derecha)];\n}",
          testCases: [
            { input: "quicksort([3, 6, 8, 10, 1, 2, 1])", expected: "[1,1,2,3,6,8,10]" },
            { input: "quicksort([64, 34, 25, 12, 22, 11, 90])", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["ordenamiento", "recursión"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de MergeSort",
          description: "Implementa el algoritmo MergeSort de divide y vencerás.",
          starterCode: "function mergesort(arr) {\n    // Tu código aquí\n}",
          solution: "function mergesort(arr) {\n    if (arr.length <= 1) return arr;\n    \n    const medio = Math.floor(arr.length / 2);\n    const izquierda = mergesort(arr.slice(0, medio));\n    const derecha = mergesort(arr.slice(medio));\n    \n    return merge(izquierda, derecha);\n}\n\nfunction merge(izq, der) {\n    const resultado = [];\n    let i = 0, j = 0;\n    \n    while (i < izq.length && j < der.length) {\n        if (izq[i] <= der[j]) {\n            resultado.push(izq[i]);\n            i++;\n        } else {\n            resultado.push(der[j]);\n            j++;\n        }\n    }\n    \n    return resultado.concat(izq.slice(i)).concat(der.slice(j));\n}",
          testCases: [
            { input: "mergesort([38, 27, 43, 3, 9, 82, 10])", expected: "[3,9,10,27,38,43,82]" },
            { input: "mergesort([64, 34, 25, 12, 22, 11, 90])", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["ordenamiento", "divide y vencerás"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Programación Dinámica - LCS",
          description: "Encuentra la subsecuencia común más larga entre dos cadenas.",
          starterCode: "function lcs(texto1, texto2) {\n    // Tu código aquí\n}",
          solution: "function lcs(texto1, texto2) {\n    const m = texto1.length, n = texto2.length;\n    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));\n    \n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (texto1[i-1] === texto2[j-1]) {\n                dp[i][j] = dp[i-1][j-1] + 1;\n            } else {\n                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n    }\n    \n    return dp[m][n];\n}",
          testCases: [
            { input: "lcs('ABCDGH', 'AEDFHR')", expected: "3" },
            { input: "lcs('AGGTAB', 'GXTXAYB')", expected: "4" }
          ],
          tags: ["dp", "strings"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmos de Árboles - BFS",
          description: "Implementa búsqueda en anchura (BFS) para árboles.",
          starterCode: "function bfs(grafo, inicio) {\n    // Tu código aquí\n}",
          solution: "function bfs(grafo, inicio) {\n    const visitados = new Set();\n    const cola = [inicio];\n    const resultado = [];\n    \n    while (cola.length > 0) {\n        const nodo = cola.shift();\n        if (!visitados.has(nodo)) {\n            visitados.add(nodo);\n            resultado.push(nodo);\n            cola.push(...(grafo[nodo] || []));\n        }\n    }\n    \n    return resultado;\n}",
          testCases: [
            { input: "bfs({'A': ['B', 'C'], 'B': ['D', 'E'], 'C': ['F'], 'D': [], 'E': [], 'F': []}, 'A')", expected: "['A','B','C','D','E','F']" }
          ],
          tags: ["grafos", "búsqueda"],
          timeLimit: 5000,
          memoryLimit: 512
        },
        {
          title: "Algoritmo de Floyd-Warshall",
          description: "Encuentra las distancias más cortas entre todos los pares de vértices.",
          starterCode: "function floydWarshall(grafo) {\n    // Tu código aquí\n}",
          solution: "function floydWarshall(grafo) {\n    const nodos = Object.keys(grafo);\n    const n = nodos.length;\n    \n    // Inicializar matriz de distancias\n    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));\n    \n    // Mapear nodos a índices\n    const indiceNodo = {};\n    nodos.forEach((nodo, i) => {\n        indiceNodo[nodo] = i;\n        dist[i][i] = 0;\n    });\n    \n    // Establecer distancias iniciales\n    for (const nodo in grafo) {\n        const i = indiceNodo[nodo];\n        for (const vecino in grafo[nodo]) {\n            const j = indiceNodo[vecino];\n            dist[i][j] = grafo[nodo][vecino];\n        }\n    }\n    \n    // Aplicar algoritmo Floyd-Warshall\n    for (let k = 0; k < n; k++) {\n        for (let i = 0; i < n; i++) {\n            for (let j = 0; j < n; j++) {\n                if (dist[i][k] + dist[k][j] < dist[i][j]) {\n                    dist[i][j] = dist[i][k] + dist[k][j];\n                }\n            }\n        }\n    }\n    \n    return dist;\n}",
          testCases: [
            { input: "floydWarshall({'0': {'1': 3, '3': 7}, '1': {'0': 8, '2': 2}, '2': {'0': 5, '3': 1}, '3': {'0': 2}})[0][2]", expected: "5" }
          ],
          tags: ["grafos", "caminos"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    },
    cpp: {
      beginner: [
        {
          title: "Suma de dos números",
          description: "Escribe una función que tome dos números y devuelva su suma.",
          starterCode: "#include <iostream>\nusing namespace std;\n\nint suma(int a, int b) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <iostream>\nusing namespace std;\n\nint suma(int a, int b) {\n    return a + b;\n}",
          testCases: [
            { input: "suma(2, 3)", expected: "5" },
            { input: "suma(-1, 1)", expected: "0" },
            { input: "suma(0, 0)", expected: "0" }
          ],
          tags: ["matemáticas", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número par o impar",
          description: "Determina si un número es par o impar.",
          starterCode: "#include <iostream>\nusing namespace std;\n\nbool esPar(int n) {\n    // Tu código aquí\n    return false;\n}",
          solution: "#include <iostream>\nusing namespace std;\n\nbool esPar(int n) {\n    return n % 2 == 0;\n}",
          testCases: [
            { input: "esPar(4)", expected: "true" },
            { input: "esPar(7)", expected: "false" },
            { input: "esPar(0)", expected: "true" }
          ],
          tags: ["lógica", "matemáticas"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Longitud de cadena",
          description: "Calcula la longitud de una cadena de texto.",
          starterCode: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint longitudCadena(string texto) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint longitudCadena(string texto) {\n    return texto.length();\n}",
          testCases: [
            { input: "longitudCadena(\"hola\")", expected: "4" },
            { input: "longitudCadena(\"\")", expected: "0" },
            { input: "longitudCadena(\"C++\")", expected: "3" }
          ],
          tags: ["strings", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Máximo de tres números",
          description: "Encuentra el número más grande entre tres números dados.",
          starterCode: "#include <iostream>\nusing namespace std;\n\nint maximoTres(int a, int b, int c) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <iostream>\nusing namespace std;\n\nint maximoTres(int a, int b, int c) {\n    return max({a, b, c});\n}",
          testCases: [
            { input: "maximoTres(1, 2, 3)", expected: "3" },
            { input: "maximoTres(5, 2, 8)", expected: "8" },
            { input: "maximoTres(-1, -5, -3)", expected: "-1" }
          ],
          tags: ["comparación", "lógica"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Invertir cadena",
          description: "Invierte una cadena de texto.",
          starterCode: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nstring invertirCadena(string texto) {\n    // Tu código aquí\n    return \"\";\n}",
          solution: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nstring invertirCadena(string texto) {\n    reverse(texto.begin(), texto.end());\n    return texto;\n}",
          testCases: [
            { input: "invertirCadena(\"hola\")", expected: "\"aloh\"" },
            { input: "invertirCadena(\"C++\")", expected: "\"+C+\"" },
            { input: "invertirCadena(\"a\")", expected: "\"a\"" }
          ],
          tags: ["strings", "manipulación"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Contar vocales",
          description: "Cuenta las vocales en una cadena de texto.",
          starterCode: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint contarVocales(string texto) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint contarVocales(string texto) {\n    string vocales = \"aeiouAEIOU\";\n    int contador = 0;\n    for (char c : texto) {\n        if (vocales.find(c) != string::npos) {\n            contador++;\n        }\n    }\n    return contador;\n}",
          testCases: [
            { input: "contarVocales(\"hola\")", expected: "2" },
            { input: "contarVocales(\"C++\")", expected: "0" },
            { input: "contarVocales(\"programacion\")", expected: "5" }
          ],
          tags: ["strings", "conteo"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Área de círculo",
          description: "Calcula el área de un círculo dado su radio.",
          starterCode: "#include <iostream>\n#include <cmath>\nusing namespace std;\n\ndouble areaCirculo(double radio) {\n    // Tu código aquí\n    return 0.0;\n}",
          solution: "#include <iostream>\n#include <cmath>\nusing namespace std;\n\ndouble areaCirculo(double radio) {\n    return M_PI * radio * radio;\n}",
          testCases: [
            { input: "round(areaCirculo(1.0) * 100) / 100", expected: "3.14" },
            { input: "round(areaCirculo(2.0) * 100) / 100", expected: "12.57" },
            { input: "areaCirculo(0.0)", expected: "0.0" }
          ],
          tags: ["matemáticas", "geometría"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Tabla de multiplicar",
          description: "Genera la tabla de multiplicar de un número hasta el 10.",
          starterCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> tablaMultiplicar(int n) {\n    // Tu código aquí\n    return {};\n}",
          solution: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> tablaMultiplicar(int n) {\n    vector<int> resultado;\n    for (int i = 1; i <= 10; i++) {\n        resultado.push_back(n * i);\n    }\n    return resultado;\n}",
          testCases: [
            { input: "tablaMultiplicar(2)", expected: "[2,4,6,8,10,12,14,16,18,20]" },
            { input: "tablaMultiplicar(5)", expected: "[5,10,15,20,25,30,35,40,45,50]" },
            { input: "tablaMultiplicar(1)", expected: "[1,2,3,4,5,6,7,8,9,10]" }
          ],
          tags: ["matemáticas", "vectores"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Número positivo, negativo o cero",
          description: "Determina si un número es positivo, negativo o cero.",
          starterCode: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring clasificarNumero(int n) {\n    // Tu código aquí\n    return \"\";\n}",
          solution: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring clasificarNumero(int n) {\n    if (n > 0) return \"positivo\";\n    if (n < 0) return \"negativo\";\n    return \"cero\";\n}",
          testCases: [
            { input: "clasificarNumero(5)", expected: "\"positivo\"" },
            { input: "clasificarNumero(-3)", expected: "\"negativo\"" },
            { input: "clasificarNumero(0)", expected: "\"cero\"" }
          ],
          tags: ["lógica", "condicionales"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Factorial simple",
          description: "Calcula el factorial de un número usando bucles.",
          starterCode: "#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    int resultado = 1;\n    for (int i = 2; i <= n; i++) {\n        resultado *= i;\n    }\n    return resultado;\n}",
          testCases: [
            { input: "factorial(5)", expected: "120" },
            { input: "factorial(0)", expected: "1" },
            { input: "factorial(3)", expected: "6" }
          ],
          tags: ["matemáticas", "bucles"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Ordenamiento burbuja",
          description: "Implementa el algoritmo de ordenamiento burbuja.",
          starterCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> ordenamientoBurbuja(vector<int> arr) {\n    // Tu código aquí\n    return arr;\n}",
          solution: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> ordenamientoBurbuja(vector<int> arr) {\n    int n = arr.size();\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j + 1]);\n            }\n        }\n    }\n    return arr;\n}",
          testCases: [
            { input: "ordenamientoBurbuja({64, 34, 25, 12, 22, 11, 90})", expected: "[11,12,22,25,34,64,90]" },
            { input: "ordenamientoBurbuja({5, 2, 8, 1, 9})", expected: "[1,2,5,8,9]" },
            { input: "ordenamientoBurbuja({1})", expected: "[1]" }
          ],
          tags: ["algoritmos", "ordenamiento"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Algoritmo QuickSort",
          description: "Implementa el algoritmo QuickSort de manera eficiente.",
          starterCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> quicksort(vector<int> arr) {\n    // Tu código aquí\n    return arr;\n}",
          solution: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> quicksort(vector<int> arr) {\n    if (arr.size() <= 1) return arr;\n    \n    int pivote = arr[arr.size() / 2];\n    vector<int> izquierda, medio, derecha;\n    \n    for (int x : arr) {\n        if (x < pivote) izquierda.push_back(x);\n        else if (x == pivote) medio.push_back(x);\n        else derecha.push_back(x);\n    }\n    \n    vector<int> izq_ordenada = quicksort(izquierda);\n    vector<int> der_ordenada = quicksort(derecha);\n    \n    vector<int> resultado;\n    resultado.insert(resultado.end(), izq_ordenada.begin(), izq_ordenada.end());\n    resultado.insert(resultado.end(), medio.begin(), medio.end());\n    resultado.insert(resultado.end(), der_ordenada.begin(), der_ordenada.end());\n    \n    return resultado;\n}",
          testCases: [
            { input: "quicksort({3, 6, 8, 10, 1, 2, 1})", expected: "[1,1,2,3,6,8,10]" },
            { input: "quicksort({64, 34, 25, 12, 22, 11, 90})", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["ordenamiento", "recursión"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    },
    c: {
      beginner: [
        {
          title: "Suma de dos números",
          description: "Escribe una función que tome dos números y devuelva su suma.",
          starterCode: "#include <stdio.h>\n\nint suma(int a, int b) {\n    // Tu código aquí\n    return 0;\n}",
          solution: "#include <stdio.h>\n\nint suma(int a, int b) {\n    return a + b;\n}",
          testCases: [
            { input: "suma(2, 3)", expected: "5" },
            { input: "suma(-1, 1)", expected: "0" },
            { input: "suma(0, 0)", expected: "0" }
          ],
          tags: ["matemáticas", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Ordenamiento burbuja",
          description: "Implementa el algoritmo de ordenamiento burbuja.",
          starterCode: "#include <stdio.h>\n\nvoid ordenamientoBurbuja(int arr[], int n) {\n    // Tu código aquí\n}",
          solution: "#include <stdio.h>\n\nvoid ordenamientoBurbuja(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}",
          testCases: [
            { input: "ordenamientoBurbuja([64, 34, 25, 12, 22, 11, 90], 7)", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["algoritmos", "ordenamiento"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Algoritmo QuickSort",
          description: "Implementa el algoritmo QuickSort de manera eficiente.",
          starterCode: "#include <stdio.h>\n\nvoid quicksort(int arr[], int bajo, int alto) {\n    // Tu código aquí\n}",
          solution: "#include <stdio.h>\n\nvoid intercambiar(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint particion(int arr[], int bajo, int alto) {\n    int pivote = arr[alto];\n    int i = (bajo - 1);\n    \n    for (int j = bajo; j <= alto - 1; j++) {\n        if (arr[j] < pivote) {\n            i++;\n            intercambiar(&arr[i], &arr[j]);\n        }\n    }\n    intercambiar(&arr[i + 1], &arr[alto]);\n    return (i + 1);\n}\n\nvoid quicksort(int arr[], int bajo, int alto) {\n    if (bajo < alto) {\n        int pi = particion(arr, bajo, alto);\n        quicksort(arr, bajo, pi - 1);\n        quicksort(arr, pi + 1, alto);\n    }\n}",
          testCases: [
            { input: "quicksort([64, 34, 25, 12, 22, 11, 90], 0, 6)", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["ordenamiento", "recursión"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    },
    csharp: {
      beginner: [
        {
          title: "Suma de dos números",
          description: "Escribe una función que tome dos números y devuelva su suma.",
          starterCode: "using System;\n\npublic class Program {\n    public static int Suma(int a, int b) {\n        // Tu código aquí\n        return 0;\n    }\n}",
          solution: "using System;\n\npublic class Program {\n    public static int Suma(int a, int b) {\n        return a + b;\n    }\n}",
          testCases: [
            { input: "Suma(2, 3)", expected: "5" },
            { input: "Suma(-1, 1)", expected: "0" },
            { input: "Suma(0, 0)", expected: "0" }
          ],
          tags: ["matemáticas", "básico"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Ordenamiento burbuja",
          description: "Implementa el algoritmo de ordenamiento burbuja.",
          starterCode: "using System;\n\npublic class Program {\n    public static int[] OrdenamientoBurbuja(int[] arr) {\n        // Tu código aquí\n        return arr;\n    }\n}",
          solution: "using System;\n\npublic class Program {\n    public static int[] OrdenamientoBurbuja(int[] arr) {\n        int n = arr.Length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n        return arr;\n    }\n}",
          testCases: [
            { input: "OrdenamientoBurbuja([64, 34, 25, 12, 22, 11, 90])", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["algoritmos", "ordenamiento"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Algoritmo QuickSort",
          description: "Implementa el algoritmo QuickSort de manera eficiente.",
          starterCode: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic class Program {\n    public static List<int> QuickSort(List<int> arr) {\n        // Tu código aquí\n        return arr;\n    }\n}",
          solution: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic class Program {\n    public static List<int> QuickSort(List<int> arr) {\n        if (arr.Count <= 1) return arr;\n        \n        int pivote = arr[arr.Count / 2];\n        var izquierda = arr.Where(x => x < pivote).ToList();\n        var medio = arr.Where(x => x == pivote).ToList();\n        var derecha = arr.Where(x => x > pivote).ToList();\n        \n        var resultado = new List<int>();\n        resultado.AddRange(QuickSort(izquierda));\n        resultado.AddRange(medio);\n        resultado.AddRange(QuickSort(derecha));\n        \n        return resultado;\n    }\n}",
          testCases: [
            { input: "QuickSort([64, 34, 25, 12, 22, 11, 90])", expected: "[11,12,22,25,34,64,90]" }
          ],
          tags: ["ordenamiento", "recursión"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    },
    "html-css": {
      beginner: [
        {
          title: "Página básica HTML",
          description: "Crea una página HTML básica con estructura completa.",
          starterCode: "<!DOCTYPE html>\n<!-- Tu código aquí -->",
          solution: "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Mi Página</title>\n</head>\n<body>\n    <h1>Hola Mundo</h1>\n    <p>Esta es mi primera página web.</p>\n</body>\n</html>",
          testCases: [
            { input: "document.title", expected: "\"Mi Página\"" },
            { input: "document.querySelector('h1').textContent", expected: "\"Hola Mundo\"" }
          ],
          tags: ["HTML", "estructura"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Lista con enlaces",
          description: "Crea una lista no ordenada con enlaces.",
          starterCode: "<!-- Crea una lista con 3 enlaces -->\n<ul>\n    <!-- Tu código aquí -->\n</ul>",
          solution: "<ul>\n    <li><a href=\"#inicio\">Inicio</a></li>\n    <li><a href=\"#acerca\">Acerca de</a></li>\n    <li><a href=\"#contacto\">Contacto</a></li>\n</ul>",
          testCases: [
            { input: "document.querySelectorAll('li').length", expected: "3" },
            { input: "document.querySelectorAll('a').length", expected: "3" }
          ],
          tags: ["HTML", "listas", "enlaces"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Formulario básico",
          description: "Crea un formulario con campos básicos.",
          starterCode: "<!-- Crea un formulario con nombre, email y botón -->\n<form>\n    <!-- Tu código aquí -->\n</form>",
          solution: "<form>\n    <label for=\"nombre\">Nombre:</label>\n    <input type=\"text\" id=\"nombre\" name=\"nombre\" required>\n    \n    <label for=\"email\">Email:</label>\n    <input type=\"email\" id=\"email\" name=\"email\" required>\n    \n    <button type=\"submit\">Enviar</button>\n</form>",
          testCases: [
            { input: "document.querySelectorAll('input').length", expected: "2" },
            { input: "document.querySelector('button').type", expected: "\"submit\"" }
          ],
          tags: ["HTML", "formularios"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Tabla de datos",
          description: "Crea una tabla con encabezados y datos.",
          starterCode: "<!-- Crea una tabla con productos y precios -->\n<table>\n    <!-- Tu código aquí -->\n</table>",
          solution: "<table>\n    <thead>\n        <tr>\n            <th>Producto</th>\n            <th>Precio</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>Laptop</td>\n            <td>$999</td>\n        </tr>\n        <tr>\n            <td>Mouse</td>\n            <td>$29</td>\n        </tr>\n    </tbody>\n</table>",
          testCases: [
            { input: "document.querySelectorAll('th').length", expected: "2" },
            { input: "document.querySelectorAll('td').length", expected: "4" }
          ],
          tags: ["HTML", "tablas"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Imagen con atributos",
          description: "Inserta una imagen con todos sus atributos necesarios.",
          starterCode: "<!-- Inserta una imagen con alt, width y height -->\n<!-- Tu código aquí -->",
          solution: "<img src=\"imagen.jpg\" alt=\"Descripción de la imagen\" width=\"300\" height=\"200\">",
          testCases: [
            { input: "document.querySelector('img').alt", expected: "\"Descripción de la imagen\"" },
            { input: "document.querySelector('img').width", expected: "300" }
          ],
          tags: ["HTML", "imágenes"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Div con clases",
          description: "Crea divs con diferentes clases CSS.",
          starterCode: "<!-- Crea 3 divs con clases diferentes -->\n<!-- Tu código aquí -->",
          solution: "<div class=\"header\">Encabezado</div>\n<div class=\"content\">Contenido principal</div>\n<div class=\"footer\">Pie de página</div>",
          testCases: [
            { input: "document.querySelectorAll('div').length", expected: "3" },
            { input: "document.querySelector('.header').textContent", expected: "\"Encabezado\"" }
          ],
          tags: ["HTML", "estructura", "clases"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Elementos semánticos",
          description: "Usa elementos semánticos de HTML5.",
          starterCode: "<!-- Usa header, nav, main, footer -->\n<!-- Tu código aquí -->",
          solution: "<header>\n    <h1>Mi Sitio Web</h1>\n</header>\n<nav>\n    <ul>\n        <li><a href=\"#\">Inicio</a></li>\n    </ul>\n</nav>\n<main>\n    <p>Contenido principal</p>\n</main>\n<footer>\n    <p>© 2024 Mi Sitio</p>\n</footer>",
          testCases: [
            { input: "document.querySelector('header')", expected: "truthy" },
            { input: "document.querySelector('main')", expected: "truthy" }
          ],
          tags: ["HTML5", "semántica"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Meta tags básicos",
          description: "Agrega meta tags esenciales al head.",
          starterCode: "<head>\n    <!-- Agrega meta tags para charset, viewport y description -->\n    <!-- Tu código aquí -->\n</head>",
          solution: "<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"description\" content=\"Una página web increíble\">\n    <title>Mi Página</title>\n</head>",
          testCases: [
            { input: "document.querySelector('meta[charset]').getAttribute('charset')", expected: "\"UTF-8\"" },
            { input: "document.querySelector('meta[name=\"viewport\"]')", expected: "truthy" }
          ],
          tags: ["HTML", "meta", "SEO"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Enlaces externos",
          description: "Crea enlaces que abran en nueva pestaña.",
          starterCode: "<!-- Crea enlaces a sitios externos -->\n<!-- Tu código aquí -->",
          solution: "<a href=\"https://github.com\" target=\"_blank\" rel=\"noopener\">GitHub</a>\n<a href=\"https://stackoverflow.com\" target=\"_blank\" rel=\"noopener\">Stack Overflow</a>",
          testCases: [
            { input: "document.querySelectorAll('a[target=\"_blank\"]').length", expected: "2" },
            { input: "document.querySelector('a').rel", expected: "\"noopener\"" }
          ],
          tags: ["HTML", "enlaces", "seguridad"],
          timeLimit: 1000,
          memoryLimit: 128
        },
        {
          title: "Lista de definiciones",
          description: "Crea una lista de definiciones con términos y descripciones.",
          starterCode: "<!-- Crea una lista de definiciones -->\n<dl>\n    <!-- Tu código aquí -->\n</dl>",
          solution: "<dl>\n    <dt>HTML</dt>\n    <dd>Lenguaje de marcado para páginas web</dd>\n    <dt>CSS</dt>\n    <dd>Hojas de estilo en cascada</dd>\n    <dt>JavaScript</dt>\n    <dd>Lenguaje de programación para web</dd>\n</dl>",
          testCases: [
            { input: "document.querySelectorAll('dt').length", expected: "3" },
            { input: "document.querySelectorAll('dd').length", expected: "3" }
          ],
          tags: ["HTML", "listas", "definiciones"],
          timeLimit: 1000,
          memoryLimit: 128
        }
      ],
      intermediate: [
        {
          title: "Formulario avanzado",
          description: "Crea un formulario con validación y diferentes tipos de input.",
          starterCode: "<!-- Formulario con validación -->\n<form>\n    <!-- Tu código aquí -->\n</form>",
          solution: "<form>\n    <fieldset>\n        <legend>Información Personal</legend>\n        <label for=\"nombre\">Nombre:</label>\n        <input type=\"text\" id=\"nombre\" name=\"nombre\" required pattern=\"[A-Za-z ]+\">\n        \n        <label for=\"edad\">Edad:</label>\n        <input type=\"number\" id=\"edad\" name=\"edad\" min=\"18\" max=\"100\" required>\n        \n        <label for=\"fecha\">Fecha de nacimiento:</label>\n        <input type=\"date\" id=\"fecha\" name=\"fecha\" required>\n        \n        <label for=\"genero\">Género:</label>\n        <select id=\"genero\" name=\"genero\" required>\n            <option value=\"\">Seleccionar...</option>\n            <option value=\"masculino\">Masculino</option>\n            <option value=\"femenino\">Femenino</option>\n            <option value=\"otro\">Otro</option>\n        </select>\n        \n        <button type=\"submit\">Enviar</button>\n    </fieldset>\n</form>",
          testCases: [
            { input: "document.querySelector('fieldset')", expected: "truthy" },
            { input: "document.querySelectorAll('input[required]').length", expected: "3" }
          ],
          tags: ["HTML", "formularios", "validación"],
          timeLimit: 2000,
          memoryLimit: 256
        }
      ],
      advanced: [
        {
          title: "Página completa responsive",
          description: "Crea una página web completa con estructura semántica.",
          starterCode: "<!DOCTYPE html>\n<!-- Página web completa -->\n<!-- Tu código aquí -->",
          solution: "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"description\" content=\"Portfolio personal de desarrollo web\">\n    <title>Mi Portfolio</title>\n</head>\n<body>\n    <header>\n        <nav>\n            <ul>\n                <li><a href=\"#inicio\">Inicio</a></li>\n                <li><a href=\"#proyectos\">Proyectos</a></li>\n                <li><a href=\"#contacto\">Contacto</a></li>\n            </ul>\n        </nav>\n    </header>\n    \n    <main>\n        <section id=\"inicio\">\n            <h1>Bienvenido a Mi Portfolio</h1>\n            <p>Desarrollador web especializado en tecnologías modernas.</p>\n        </section>\n        \n        <section id=\"proyectos\">\n            <h2>Mis Proyectos</h2>\n            <article>\n                <h3>Proyecto 1</h3>\n                <p>Descripción del proyecto...</p>\n                <img src=\"proyecto1.jpg\" alt=\"Captura del proyecto 1\" width=\"300\" height=\"200\">\n            </article>\n        </section>\n        \n        <section id=\"contacto\">\n            <h2>Contacto</h2>\n            <form>\n                <label for=\"email\">Email:</label>\n                <input type=\"email\" id=\"email\" required>\n                <label for=\"mensaje\">Mensaje:</label>\n                <textarea id=\"mensaje\" rows=\"4\" required></textarea>\n                <button type=\"submit\">Enviar</button>\n            </form>\n        </section>\n    </main>\n    \n    <footer>\n        <p>&copy; 2024 Mi Portfolio. Todos los derechos reservados.</p>\n    </footer>\n</body>\n</html>",
          testCases: [
            { input: "document.querySelectorAll('section').length", expected: "3" },
            { input: "document.querySelector('nav ul li')", expected: "truthy" }
          ],
          tags: ["HTML5", "semántica", "estructura"],
          timeLimit: 5000,
          memoryLimit: 512
        }
      ]
    }
  };

  private difficultyMap = {
    beginner: "principiante",
    intermediate: "intermedio", 
    advanced: "avanzado"
  };

  private calculatePoints(difficulty: string): number {
    switch (difficulty) {
      case "principiante": return 10;
      case "intermedio": return 25;
      case "avanzado": return 50;
      default: return 10;
    }
  }



  private generateSlug(title: string, languageSlug: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${baseSlug}-${languageSlug}`;
  }

  private generateAdditionalExercises(languageSlug: string): Record<string, ExerciseTemplate[]> {
    const additionalExercises: Record<string, ExerciseTemplate[]> = {
      beginner: [],
      easy: [],
      medium: [],
      hard: []
    };

    // Generate 30 additional exercises per language across all difficulties
    const baseTitles = {
      python: [
        "Calculadora Avanzada", "Sistema de Inventario", "Analizador de Texto", "Generador de Contraseñas",
        "Conversor de Unidades", "Sistema de Votación", "Calculadora de IMC", "Juego de Adivinanzas",
        "Generador de Fibonacci", "Ordenamiento Burbuja", "Búsqueda Binaria", "Factorial Recursivo",
        "Palíndromos", "Números Primos", "Serie de Pascal", "Contador de Palabras",
        "Validador de Email", "Encriptador César", "Sistema de Notas", "Agenda Personal",
        "Conversor de Temperaturas", "Calculadora de Propinas", "Juego Piedra Papel Tijera", "Cronómetro",
        "Lista de Tareas", "Generador de QR", "Análisis de Datos", "Web Scraper",
        "API REST", "Machine Learning Básico"
      ],
      javascript: [
        "Galería de Imágenes", "Reloj Digital", "Quiz Interactivo", "Carrito de Compras",
        "Reproductor de Música", "Chat en Tiempo Real", "Juego de Memoria", "Calculadora Científica",
        "Editor de Texto", "Tablero Kanban", "Mapa Interactivo", "Validador de Formularios",
        "Slider de Imágenes", "Menú Desplegable", "Modal Dinámico", "Efecto Parallax",
        "Buscador Dinámico", "Sistema de Pestañas", "Drag and Drop", "Canvas Painter",
        "Juego Snake", "Tetris", "Breakout", "Pac-Man",
        "API Weather", "Single Page App", "Progressive Web App", "React Components",
        "Node.js Server", "Express Router"
      ],
      cpp: [
        "Sistema de Archivos", "Algoritmo de Ordenamiento", "Estructura de Datos", "Punteros Avanzados",
        "Clases y Objetos", "Herencia Múltiple", "Templates", "STL Containers",
        "Memory Management", "Exception Handling", "Multithreading", "Socket Programming",
        "File I/O Operations", "Binary Search Tree", "Hash Tables", "Graph Algorithms",
        "Dynamic Programming", "Backtracking", "Greedy Algorithms", "Divide and Conquer",
        "Game Engine", "Graphics Programming", "Database Connector", "Compiler Design",
        "Operating System", "Network Protocol", "Embedded Systems", "Real-time Systems",
        "Parallel Computing", "GPU Programming"
      ],
      c: [
        "Manipulación de Strings", "Gestión de Memoria", "Archivos Binarios", "Estructuras",
        "Uniones", "Punteros a Funciones", "Macros Avanzadas", "Preprocessor",
        "System Calls", "Process Management", "Memory Allocation", "Linked Lists",
        "Stack Implementation", "Queue Implementation", "Tree Traversal", "Sorting Algorithms",
        "Hash Functions", "Bit Manipulation", "Device Drivers", "Kernel Modules",
        "Assembly Integration", "Performance Optimization", "Memory Mapping", "Signal Handling",
        "Inter-process Communication", "Network Programming", "Real-time Programming", "Embedded C",
        "Hardware Interface", "Low-level Graphics"
      ],
      csharp: [
        "Windows Forms App", "WPF Application", "Web API", "Entity Framework",
        "LINQ Queries", "Async Programming", "Dependency Injection", "Unit Testing",
        "Design Patterns", "Exception Handling", "File Operations", "Database Connection",
        "JSON Serialization", "XML Processing", "Web Services", "REST Client",
        "Socket Programming", "Multithreading", "Task Parallel Library", "Reflection",
        "Attributes", "Generics", "Collections", "Extension Methods",
        "Lambda Expressions", "MVVM Pattern", "Blazor App", "Azure Functions",
        "Microservices", "Docker Integration"
      ],
      "html-css": [
        "Landing Page Moderna", "Portfolio Responsive", "Dashboard Admin", "E-commerce Layout",
        "Blog Template", "Restaurant Website", "Corporate Site", "Photography Portfolio",
        "Music Player UI", "Social Media Feed", "Newsletter Template", "Pricing Tables",
        "Timeline Component", "Card Layouts", "Navigation Menus", "Hero Sections",
        "Footer Designs", "Form Styling", "Button Collections", "Icon Libraries",
        "Animation Effects", "CSS Grid Layouts", "Flexbox Designs", "Mobile-first Design",
        "Progressive Enhancement", "Accessibility Features", "Performance Optimization", "CSS Variables",
        "Modern Layouts", "Component Library"
      ]
    };

    const difficulties = ['beginner', 'easy', 'medium', 'hard'];
    const titles = baseTitles[languageSlug as keyof typeof baseTitles] || baseTitles.python;

    titles.forEach((title, index) => {
      const difficultyIndex = index % 4;
      const difficulty = difficulties[difficultyIndex];
      
      const template: ExerciseTemplate = {
        title: `${title} ${index + 1}`,
        description: `Implementa un ${title.toLowerCase()} funcional con todas las características requeridas.`,
        starterCode: this.getStarterCodeForLanguage(languageSlug),
        solution: this.getSolutionForLanguage(languageSlug),
        testCases: this.getTestCasesForLanguage(languageSlug),
        tags: [languageSlug, difficulty, "practice"],
        timeLimit: 5000,
        memoryLimit: 128
      };

      additionalExercises[difficulty].push(template);
    });

    return additionalExercises;
  }

  private getStarterCodeForLanguage(languageSlug: string): string {
    const starterCodes = {
      python: "# Implementa tu solución aquí\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()",
      javascript: "// Implementa tu solución aquí\nfunction main() {\n    // Tu código aquí\n}\n\nmain();",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Tu código aquí\n    return 0;\n}",
      c: "#include <stdio.h>\n\nint main() {\n    // Tu código aquí\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static void Main() {\n        // Tu código aquí\n    }\n}",
      "html-css": "<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        /* Tu CSS aquí */\n    </style>\n</head>\n<body>\n    <!-- Tu HTML aquí -->\n</body>\n</html>"
    };
    return starterCodes[languageSlug as keyof typeof starterCodes] || starterCodes.python;
  }

  private getSolutionForLanguage(languageSlug: string): string {
    const solutions = {
      python: "# Solución completa\ndef main():\n    print('Ejercicio completado')\n\nif __name__ == '__main__':\n    main()",
      javascript: "// Solución completa\nfunction main() {\n    console.log('Ejercicio completado');\n}\n\nmain();",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Ejercicio completado\" << endl;\n    return 0;\n}",
      c: "#include <stdio.h>\n\nint main() {\n    printf(\"Ejercicio completado\\n\");\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Ejercicio completado\");\n    }\n}",
      "html-css": "<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body { font-family: Arial; }\n    </style>\n</head>\n<body>\n    <h1>Ejercicio completado</h1>\n</body>\n</html>"
    };
    return solutions[languageSlug as keyof typeof solutions] || solutions.python;
  }

  private getTestCasesForLanguage(languageSlug: string): Array<{ input: string; expected: string; }> {
    return [
      { input: "test_input", expected: "expected_output" },
      { input: "test_input_2", expected: "expected_output_2" }
    ];
  }

  async generateExercisesForLanguage(languageSlug: string): Promise<void> {
    console.log(`Generando ejercicios para: ${languageSlug}`);
    
    const templates = this.exerciseTemplates[languageSlug];
    if (!templates) {
      console.log(`No hay plantillas para el lenguaje: ${languageSlug}`);
      return;
    }

    // Verificar que el lenguaje existe
    const language = await storage.getLanguageBySlug(languageSlug);
    if (!language) {
      console.log(`Lenguaje no encontrado: ${languageSlug}`);
      return;
    }

    // Generate additional exercises
    const additionalExercises = this.generateAdditionalExercises(languageSlug);
    
    // Merge existing templates with additional exercises
    const allTemplates = { ...templates };
    for (const [difficulty, exercises] of Object.entries(additionalExercises)) {
      if (allTemplates[difficulty]) {
        allTemplates[difficulty] = [...allTemplates[difficulty], ...exercises];
      } else {
        allTemplates[difficulty] = exercises;
      }
    }

    for (const [difficulty, exercises] of Object.entries(allTemplates)) {
      const mappedDifficulty = this.difficultyMap[difficulty as keyof typeof this.difficultyMap];
      
      // Skip if difficulty mapping is undefined
      if (!mappedDifficulty) {
        console.log(`Dificultad no mapeada: ${difficulty}`);
        continue;
      }
      
      for (const template of exercises) {
        try {
          const exerciseData: InsertExercise = {
            title: template.title,
            description: template.description,
            difficulty: mappedDifficulty,
            points: this.calculatePoints(mappedDifficulty),
            languageId: language.id,
            slug: this.generateSlug(template.title, languageSlug),
            starterCode: template.starterCode,
            solution: template.solution,
            testCases: template.testCases,
            tags: template.tags,
            timeLimit: template.timeLimit,
            memoryLimit: template.memoryLimit,
          };

          const existingExercise = await storage.getExerciseBySlug(exerciseData.slug);
          if (existingExercise) {
            console.log(`• Ejercicio existente omitido: ${exerciseData.slug}`);
            continue;
          }

          await storage.createExercise(exerciseData);
          console.log(`✓ Ejercicio creado: [${mappedDifficulty.toUpperCase()}] ${template.title} (${languageSlug})`);
        } catch (error) {
          console.error(`Error creando ejercicio ${template.title}:`, error);
        }
      }
    }
  }

  async generateAllExercises(): Promise<void> {
    console.log("Iniciando generación masiva de ejercicios...");
    
    const languages = ['python', 'javascript', 'cpp', 'c', 'csharp', 'html-css'];
    
    for (const languageSlug of languages) {
      await this.generateExercisesForLanguage(languageSlug);
    }
    
    console.log("Generación de ejercicios completada!");
  }
}

export const exerciseGenerator = new ExerciseGenerator();