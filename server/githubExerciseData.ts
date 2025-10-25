import type { GitHubExercise } from './githubImport.js';

// Ejercicios adicionales para importar desde "GitHub"
export const githubExerciseData: GitHubExercise[] = [
  // PYTHON - Principiante
  {
    title: "Contador de vocales",
    description: "Crea una función que cuente las vocales en una cadena de texto.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def contar_vocales(texto):\n    # Tu código aquí\n    pass",
    solution: "def contar_vocales(texto):\n    vocales = 'aeiouAEIOU'\n    return sum(1 for char in texto if char in vocales)",
    testCases: [
      { input: "hola", output: "2" },
      { input: "programacion", output: "5" }
    ],
    tags: ["strings", "loops", "basic"]
  },
  {
    title: "Calculadora de edad",
    description: "Calcula la edad de una persona dado su año de nacimiento.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def calcular_edad(año_nacimiento):\n    # Tu código aquí\n    pass",
    solution: "def calcular_edad(año_nacimiento):\n    from datetime import datetime\n    return datetime.now().year - año_nacimiento",
    testCases: [
      { input: "1990", output: "34" },
      { input: "2000", output: "24" }
    ],
    tags: ["math", "dates", "basic"]
  },
  {
    title: "Convertidor de temperatura",
    description: "Convierte grados Celsius a Fahrenheit.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def celsius_a_fahrenheit(celsius):\n    # Tu código aquí\n    pass",
    solution: "def celsius_a_fahrenheit(celsius):\n    return (celsius * 9/5) + 32",
    testCases: [
      { input: "0", output: "32.0" },
      { input: "100", output: "212.0" }
    ],
    tags: ["math", "conversion", "formulas"]
  },
  {
    title: "Lista de números pares",
    description: "Genera una lista con los primeros N números pares.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def numeros_pares(n):\n    # Tu código aquí\n    pass",
    solution: "def numeros_pares(n):\n    return [i * 2 for i in range(1, n + 1)]",
    testCases: [
      { input: "5", output: "[2, 4, 6, 8, 10]" },
      { input: "3", output: "[2, 4, 6]" }
    ],
    tags: ["lists", "loops", "math"]
  },
  {
    title: "Validador de email",
    description: "Verifica si una cadena tiene formato de email válido.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def es_email_valido(email):\n    # Tu código aquí\n    pass",
    solution: "def es_email_valido(email):\n    return '@' in email and '.' in email.split('@')[-1]",
    testCases: [
      { input: "test@example.com", output: "True" },
      { input: "invalid-email", output: "False" }
    ],
    tags: ["strings", "validation", "regex"]
  },
  {
    title: "Suma de dígitos",
    description: "Calcula la suma de todos los dígitos de un número.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def suma_digitos(numero):\n    # Tu código aquí\n    pass",
    solution: "def suma_digitos(numero):\n    return sum(int(d) for d in str(abs(numero)))",
    testCases: [
      { input: "123", output: "6" },
      { input: "456", output: "15" }
    ],
    tags: ["math", "strings", "loops"]
  },
  {
    title: "Palíndromo simple",
    description: "Verifica si una palabra es un palíndromo.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def es_palindromo(palabra):\n    # Tu código aquí\n    pass",
    solution: "def es_palindromo(palabra):\n    palabra = palabra.lower().replace(' ', '')\n    return palabra == palabra[::-1]",
    testCases: [
      { input: "oso", output: "True" },
      { input: "casa", output: "False" }
    ],
    tags: ["strings", "algorithms", "logic"]
  },
  {
    title: "Generador de tabla de multiplicar",
    description: "Genera la tabla de multiplicar de un número dado.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def tabla_multiplicar(numero):\n    # Tu código aquí\n    pass",
    solution: "def tabla_multiplicar(numero):\n    return [numero * i for i in range(1, 11)]",
    testCases: [
      { input: "5", output: "[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]" },
      { input: "3", output: "[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]" }
    ],
    tags: ["math", "loops", "lists"]
  },
  {
    title: "Contador de palabras",
    description: "Cuenta el número de palabras en una frase.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def contar_palabras(frase):\n    # Tu código aquí\n    pass",
    solution: "def contar_palabras(frase):\n    return len(frase.strip().split()) if frase.strip() else 0",
    testCases: [
      { input: "Hola mundo", output: "2" },
      { input: "Python es genial", output: "3" }
    ],
    tags: ["strings", "split", "counting"]
  },
  {
    title: "Calculadora de área circular",
    description: "Calcula el área de un círculo dado su radio.",
    difficulty: "beginner" as const,
    language: "python",
    starterCode: "def area_circulo(radio):\n    # Tu código aquí\n    pass",
    solution: "def area_circulo(radio):\n    import math\n    return math.pi * radio ** 2",
    testCases: [
      { input: "5", output: "78.54" },
      { input: "10", output: "314.16" }
    ],
    tags: ["math", "geometry", "formulas"]
  },

  // PYTHON - Intermedio
  {
    title: "Ordenamiento burbuja",
    description: "Implementa el algoritmo de ordenamiento burbuja.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def ordenamiento_burbuja(lista):\n    # Tu código aquí\n    pass",
    solution: "def ordenamiento_burbuja(lista):\n    n = len(lista)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if lista[j] > lista[j+1]:\n                lista[j], lista[j+1] = lista[j+1], lista[j]\n    return lista",
    testCases: [
      { input: "[64, 34, 25, 12, 22, 11, 90]", output: "[11, 12, 22, 25, 34, 64, 90]" }
    ],
    tags: ["sorting", "algorithms", "loops"]
  },
  {
    title: "Generador de contraseñas",
    description: "Genera una contraseña aleatoria de longitud especificada.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def generar_contraseña(longitud):\n    # Tu código aquí\n    pass",
    solution: "def generar_contraseña(longitud):\n    import random\n    import string\n    caracteres = string.ascii_letters + string.digits + '!@#$%^&*'\n    return ''.join(random.choice(caracteres) for _ in range(longitud))",
    testCases: [
      { input: "8", output: "random8chars" },
      { input: "12", output: "random12chars" }
    ],
    tags: ["random", "strings", "security"]
  },
  {
    title: "Calculadora de fibonacci",
    description: "Calcula el n-ésimo número de la secuencia Fibonacci.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def fibonacci(n):\n    # Tu código aquí\n    pass",
    solution: "def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b",
    testCases: [
      { input: "10", output: "55" },
      { input: "15", output: "610" }
    ],
    tags: ["math", "recursion", "dynamic-programming"]
  },
  {
    title: "Analizador de texto",
    description: "Analiza un texto y devuelve estadísticas (palabras, caracteres, líneas).",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def analizar_texto(texto):\n    # Tu código aquí\n    pass",
    solution: "def analizar_texto(texto):\n    lineas = texto.count('\\n') + 1 if texto else 0\n    palabras = len(texto.split()) if texto.strip() else 0\n    caracteres = len(texto)\n    return {'lineas': lineas, 'palabras': palabras, 'caracteres': caracteres}",
    testCases: [
      { input: "Hola mundo\\nSegunda línea", output: "{'lineas': 2, 'palabras': 4, 'caracteres': 22}" }
    ],
    tags: ["strings", "analysis", "dictionaries"]
  },
  {
    title: "Conversor de números romanos",
    description: "Convierte números enteros a números romanos.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def a_romano(numero):\n    # Tu código aquí\n    pass",
    solution: "def a_romano(numero):\n    valores = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]\n    simbolos = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']\n    resultado = ''\n    for i in range(len(valores)):\n        while numero >= valores[i]:\n            resultado += simbolos[i]\n            numero -= valores[i]\n    return resultado",
    testCases: [
      { input: "27", output: "XXVII" },
      { input: "1994", output: "MCMXCIV" }
    ],
    tags: ["math", "conversion", "algorithms"]
  },
  {
    title: "Detector de números primos",
    description: "Verifica si un número es primo y encuentra todos los primos hasta N.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def es_primo(n):\n    # Tu código aquí\n    pass\n\ndef primos_hasta(n):\n    # Tu código aquí\n    pass",
    solution: "def es_primo(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\ndef primos_hasta(n):\n    return [i for i in range(2, n + 1) if es_primo(i)]",
    testCases: [
      { input: "17", output: "True" },
      { input: "10", output: "[2, 3, 5, 7]" }
    ],
    tags: ["math", "algorithms", "prime-numbers"]
  },
  {
    title: "Calculadora de distancia",
    description: "Calcula la distancia entre dos puntos en un plano cartesiano.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def distancia_puntos(x1, y1, x2, y2):\n    # Tu código aquí\n    pass",
    solution: "def distancia_puntos(x1, y1, x2, y2):\n    import math\n    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)",
    testCases: [
      { input: "0, 0, 3, 4", output: "5.0" },
      { input: "1, 1, 4, 5", output: "5.0" }
    ],
    tags: ["math", "geometry", "distance"]
  },
  {
    title: "Compresión de cadenas",
    description: "Comprime una cadena usando el método de conteo de caracteres (aabcccccaaa -> a2b1c5a3).",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def comprimir_cadena(s):\n    # Tu código aquí\n    pass",
    solution: "def comprimir_cadena(s):\n    if not s:\n        return s\n    resultado = []\n    contador = 1\n    for i in range(1, len(s)):\n        if s[i] == s[i-1]:\n            contador += 1\n        else:\n            resultado.append(s[i-1] + str(contador))\n            contador = 1\n    resultado.append(s[-1] + str(contador))\n    comprimida = ''.join(resultado)\n    return comprimida if len(comprimida) < len(s) else s",
    testCases: [
      { input: "aabcccccaaa", output: "a2b1c5a3" },
      { input: "abc", output: "abc" }
    ],
    tags: ["strings", "compression", "algorithms"]
  },
  {
    title: "Validador de paréntesis",
    description: "Verifica si los paréntesis en una expresión están balanceados.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def parentesis_balanceados(expresion):\n    # Tu código aquí\n    pass",
    solution: "def parentesis_balanceados(expresion):\n    stack = []\n    pares = {'(': ')', '[': ']', '{': '}'}\n    for char in expresion:\n        if char in pares:\n            stack.append(char)\n        elif char in pares.values():\n            if not stack or pares[stack.pop()] != char:\n                return False\n    return len(stack) == 0",
    testCases: [
      { input: "(())", output: "True" },
      { input: "(()", output: "False" }
    ],
    tags: ["data-structures", "stack", "validation"]
  },
  {
    title: "Generador de permutaciones",
    description: "Genera todas las permutaciones posibles de una lista.",
    difficulty: "intermediate" as const,
    language: "python",
    starterCode: "def permutaciones(lista):\n    # Tu código aquí\n    pass",
    solution: "def permutaciones(lista):\n    if len(lista) <= 1:\n        return [lista]\n    resultado = []\n    for i in range(len(lista)):\n        elemento = lista[i]\n        resto = lista[:i] + lista[i+1:]\n        for p in permutaciones(resto):\n            resultado.append([elemento] + p)\n    return resultado",
    testCases: [
      { input: "[1, 2, 3]", output: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]" }
    ],
    tags: ["recursion", "permutations", "algorithms"]
  },

  // PYTHON - Avanzado
  {
    title: "Implementación de Trie",
    description: "Implementa una estructura de datos Trie para búsqueda eficiente de palabras.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "class TrieNode:\n    def __init__(self):\n        pass\n\nclass Trie:\n    def __init__(self):\n        pass\n\n    def insert(self, word):\n        pass\n\n    def search(self, word):\n        pass",
    solution: "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word):\n        node = self.root\n        for char in word:\n            if char not in node.children:\n                node.children[char] = TrieNode()\n            node = node.children[char]\n        node.is_end_word = True\n\n    def search(self, word):\n        node = self.root\n        for char in word:\n            if char not in node.children:\n                return False\n            node = node.children[char]\n        return node.is_end_word",
    testCases: [
      { input: "insert('hello'), search('hello')", output: "True" },
      { input: "insert('hello'), search('help')", output: "False" }
    ],
    tags: ["data-structures", "trees", "advanced"]
  },
  {
    title: "Algoritmo A* para pathfinding",
    description: "Implementa el algoritmo A* para encontrar el camino más corto en una cuadrícula.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "def a_star(grid, start, end):\n    # Tu código aquí\n    pass",
    solution: "def a_star(grid, start, end):\n    import heapq\n    rows, cols = len(grid), len(grid[0])\n    open_set = [(0, start)]\n    came_from = {}\n    g_score = {start: 0}\n    f_score = {start: abs(start[0] - end[0]) + abs(start[1] - end[1])}\n    \n    while open_set:\n        current = heapq.heappop(open_set)[1]\n        if current == end:\n            path = []\n            while current in came_from:\n                path.append(current)\n                current = came_from[current]\n            return path[::-1]\n        \n        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:\n            neighbor = (current[0] + dx, current[1] + dy)\n            if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and grid[neighbor[0]][neighbor[1]] == 0:\n                tentative_g = g_score[current] + 1\n                if neighbor not in g_score or tentative_g < g_score[neighbor]:\n                    came_from[neighbor] = current\n                    g_score[neighbor] = tentative_g\n                    f_score[neighbor] = tentative_g + abs(neighbor[0] - end[0]) + abs(neighbor[1] - end[1])\n                    heapq.heappush(open_set, (f_score[neighbor], neighbor))\n    return []",
    testCases: [
      { input: "[[0,0,0],[0,1,0],[0,0,0]], (0,0), (2,2)", output: "[(0,1), (0,2), (1,2), (2,2)]" }
    ],
    tags: ["algorithms", "pathfinding", "ai"]
  },
  {
    title: "Sistema de cache LRU",
    description: "Implementa un sistema de cache con política Least Recently Used.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "class LRUCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass",
    solution: "class LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = {}\n        self.order = []\n\n    def get(self, key):\n        if key in self.cache:\n            self.order.remove(key)\n            self.order.append(key)\n            return self.cache[key]\n        return -1\n\n    def put(self, key, value):\n        if key in self.cache:\n            self.order.remove(key)\n        elif len(self.cache) >= self.capacity:\n            oldest = self.order.pop(0)\n            del self.cache[oldest]\n        self.cache[key] = value\n        self.order.append(key)",
    testCases: [
      { input: "capacity=2, put(1,1), put(2,2), get(1)", output: "1" },
      { input: "put(3,3), get(2)", output: "-1" }
    ],
    tags: ["data-structures", "cache", "lru"]
  },
  {
    title: "Parser de expresiones matemáticas",
    description: "Implementa un parser que evalúe expresiones matemáticas con paréntesis.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "def evaluar_expresion(expresion):\n    # Tu código aquí\n    pass",
    solution: "def evaluar_expresion(expresion):\n    def precedencia(op):\n        return 2 if op in ['*', '/'] else 1\n    \n    def aplicar_operacion(a, b, op):\n        if op == '+': return a + b\n        if op == '-': return a - b\n        if op == '*': return a * b\n        if op == '/': return a / b\n    \n    valores = []\n    operadores = []\n    i = 0\n    \n    while i < len(expresion):\n        if expresion[i].isdigit():\n            num = 0\n            while i < len(expresion) and expresion[i].isdigit():\n                num = num * 10 + int(expresion[i])\n                i += 1\n            valores.append(num)\n            continue\n        \n        if expresion[i] == '(':\n            operadores.append(expresion[i])\n        elif expresion[i] == ')':\n            while operadores and operadores[-1] != '(':\n                b = valores.pop()\n                a = valores.pop()\n                op = operadores.pop()\n                valores.append(aplicar_operacion(a, b, op))\n            operadores.pop()\n        elif expresion[i] in '+-*/':\n            while (operadores and operadores[-1] != '(' and\n                   precedencia(operadores[-1]) >= precedencia(expresion[i])):\n                b = valores.pop()\n                a = valores.pop()\n                op = operadores.pop()\n                valores.append(aplicar_operacion(a, b, op))\n            operadores.append(expresion[i])\n        i += 1\n    \n    while operadores:\n        b = valores.pop()\n        a = valores.pop()\n        op = operadores.pop()\n        valores.append(aplicar_operacion(a, b, op))\n    \n    return valores[0]",
    testCases: [
      { input: "3+5*2", output: "13" },
      { input: "(3+5)*2", output: "16" }
    ],
    tags: ["parsing", "stack", "math"]
  },
  {
    title: "Detección de ciclos en grafos",
    description: "Implementa un algoritmo para detectar ciclos en un grafo dirigido.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "def tiene_ciclo(grafo):\n    # Tu código aquí\n    pass",
    solution: "def tiene_ciclo(grafo):\n    BLANCO, GRIS, NEGRO = 0, 1, 2\n    color = {nodo: BLANCO for nodo in grafo}\n    \n    def dfs(nodo):\n        if color[nodo] == GRIS:\n            return True\n        if color[nodo] == NEGRO:\n            return False\n        \n        color[nodo] = GRIS\n        for vecino in grafo.get(nodo, []):\n            if dfs(vecino):\n                return True\n        color[nodo] = NEGRO\n        return False\n    \n    for nodo in grafo:\n        if color[nodo] == BLANCO:\n            if dfs(nodo):\n                return True\n    return False",
    testCases: [
      { input: "{'A': ['B'], 'B': ['C'], 'C': ['A']}", output: "True" },
      { input: "{'A': ['B'], 'B': ['C'], 'C': []}", output: "False" }
    ],
    tags: ["graphs", "dfs", "cycle-detection"]
  },
  {
    title: "Compresión Huffman",
    description: "Implementa el algoritmo de compresión Huffman.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "def huffman_compress(texto):\n    # Tu código aquí\n    pass",
    solution: "def huffman_compress(texto):\n    import heapq\n    from collections import defaultdict, Counter\n    \n    if not texto:\n        return '', {}\n    \n    # Contar frecuencias\n    freq = Counter(texto)\n    \n    # Crear heap\n    heap = [[peso, [simbolo, '']] for simbolo, peso in freq.items()]\n    heapq.heapify(heap)\n    \n    # Construir árbol\n    while len(heap) > 1:\n        lo = heapq.heappop(heap)\n        hi = heapq.heappop(heap)\n        for par in lo[1:]:\n            par[1] = '0' + par[1]\n        for par in hi[1:]:\n            par[1] = '1' + par[1]\n        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])\n    \n    # Crear tabla de códigos\n    codigos = dict(sorted(heapq.heappop(heap)[1:], key=lambda p: (len(p[-1]), p)))\n    \n    # Comprimir texto\n    comprimido = ''.join(codigos[char] for char in texto)\n    \n    return comprimido, codigos",
    testCases: [
      { input: "hello", output: "compressed_binary_string" }
    ],
    tags: ["compression", "huffman", "trees"]
  },
  {
    title: "Algoritmo de consenso Raft",
    description: "Implementa una versión simplificada del algoritmo de consenso Raft.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "class RaftNode:\n    def __init__(self, node_id):\n        pass\n\n    def request_vote(self, candidate_id, term):\n        pass\n\n    def append_entries(self, entries):\n        pass",
    solution: "class RaftNode:\n    def __init__(self, node_id):\n        self.node_id = node_id\n        self.current_term = 0\n        self.voted_for = None\n        self.log = []\n        self.state = 'follower'  # follower, candidate, leader\n        self.votes_received = 0\n    \n    def request_vote(self, candidate_id, term):\n        if term > self.current_term:\n            self.current_term = term\n            self.voted_for = None\n            self.state = 'follower'\n        \n        if (self.voted_for is None or self.voted_for == candidate_id) and term >= self.current_term:\n            self.voted_for = candidate_id\n            return True\n        return False\n    \n    def append_entries(self, entries, leader_term):\n        if leader_term >= self.current_term:\n            self.current_term = leader_term\n            self.state = 'follower'\n            self.log.extend(entries)\n            return True\n        return False\n    \n    def start_election(self):\n        self.state = 'candidate'\n        self.current_term += 1\n        self.voted_for = self.node_id\n        self.votes_received = 1",
    testCases: [
      { input: "node election", output: "consensus_result" }
    ],
    tags: ["distributed-systems", "consensus", "raft"]
  },
  {
    title: "Máquina de estados finitos",
    description: "Implementa una máquina de estados finitos configurable.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "class FSM:\n    def __init__(self, states, transitions, initial_state):\n        pass\n\n    def process_input(self, input_symbol):\n        pass\n\n    def is_accepting(self):\n        pass",
    solution: "class FSM:\n    def __init__(self, states, transitions, initial_state, accepting_states=None):\n        self.states = states\n        self.transitions = transitions\n        self.current_state = initial_state\n        self.initial_state = initial_state\n        self.accepting_states = accepting_states or set()\n    \n    def process_input(self, input_symbol):\n        if (self.current_state, input_symbol) in self.transitions:\n            self.current_state = self.transitions[(self.current_state, input_symbol)]\n            return True\n        return False\n    \n    def process_string(self, input_string):\n        for symbol in input_string:\n            if not self.process_input(symbol):\n                return False\n        return True\n    \n    def is_accepting(self):\n        return self.current_state in self.accepting_states\n    \n    def reset(self):\n        self.current_state = self.initial_state",
    testCases: [
      { input: "binary_string_fsm", output: "accepted_or_rejected" }
    ],
    tags: ["automata", "fsm", "theory"]
  },
  {
    title: "Algoritmo de programación dinámica",
    description: "Resuelve el problema de la mochila usando programación dinámica.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "def mochila(capacidad, pesos, valores):\n    # Tu código aquí\n    pass",
    solution: "def mochila(capacidad, pesos, valores):\n    n = len(pesos)\n    dp = [[0 for _ in range(capacidad + 1)] for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(1, capacidad + 1):\n            if pesos[i-1] <= w:\n                dp[i][w] = max(\n                    valores[i-1] + dp[i-1][w - pesos[i-1]],\n                    dp[i-1][w]\n                )\n            else:\n                dp[i][w] = dp[i-1][w]\n    \n    # Reconstruir solución\n    w = capacidad\n    items_seleccionados = []\n    for i in range(n, 0, -1):\n        if dp[i][w] != dp[i-1][w]:\n            items_seleccionados.append(i-1)\n            w -= pesos[i-1]\n    \n    return dp[n][capacidad], items_seleccionados[::-1]",
    testCases: [
      { input: "capacidad=10, pesos=[2,1,3,2], valores=[12,10,20,15]", output: "(37, [1, 2, 3])" }
    ],
    tags: ["dynamic-programming", "optimization", "knapsack"]
  },
  {
    title: "Simulador de máquina de Turing",
    description: "Implementa un simulador básico de máquina de Turing.",
    difficulty: "advanced" as const,
    language: "python",
    starterCode: "class TuringMachine:\n    def __init__(self, states, alphabet, transitions, initial_state, accepting_states):\n        pass\n\n    def run(self, input_string):\n        pass",
    solution: "class TuringMachine:\n    def __init__(self, states, alphabet, transitions, initial_state, accepting_states):\n        self.states = states\n        self.alphabet = alphabet\n        self.transitions = transitions  # {(state, symbol): (new_state, new_symbol, direction)}\n        self.current_state = initial_state\n        self.accepting_states = accepting_states\n        self.tape = []\n        self.head_position = 0\n    \n    def run(self, input_string, max_steps=1000):\n        self.tape = list(input_string) + ['_'] * 100  # Blank symbol\n        self.head_position = 0\n        self.current_state = self.initial_state\n        steps = 0\n        \n        while (self.current_state not in self.accepting_states and \n               steps < max_steps):\n            \n            current_symbol = self.tape[self.head_position]\n            key = (self.current_state, current_symbol)\n            \n            if key not in self.transitions:\n                break\n            \n            new_state, new_symbol, direction = self.transitions[key]\n            \n            self.tape[self.head_position] = new_symbol\n            self.current_state = new_state\n            \n            if direction == 'R':\n                self.head_position += 1\n            elif direction == 'L':\n                self.head_position = max(0, self.head_position - 1)\n            \n            if self.head_position >= len(self.tape):\n                self.tape.extend(['_'] * 50)\n            \n            steps += 1\n        \n        return {\n            'accepted': self.current_state in self.accepting_states,\n            'final_state': self.current_state,\n            'tape': ''.join(self.tape[:self.head_position + 10]).rstrip('_'),\n            'steps': steps\n        }",
    testCases: [
      { input: "simple_tm_config", output: "{'accepted': True, 'steps': 5}" }
    ],
    tags: ["turing-machine", "computation", "theory"]
  },

  // JAVASCRIPT - Principiante  
  {
    title: "Calculadora básica",
    description: "Crea una función que realice operaciones matemáticas básicas.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function calculadora(a, b, operacion) {\n    // Tu código aquí\n}",
    solution: "function calculadora(a, b, operacion) {\n    switch(operacion) {\n        case '+': return a + b;\n        case '-': return a - b;\n        case '*': return a * b;\n        case '/': return b !== 0 ? a / b : 'Error: División por cero';\n        default: return 'Operación no válida';\n    }\n}",
    testCases: [
      { input: "5, 3, '+'", output: "8" },
      { input: "10, 2, '/'", output: "5" }
    ],
    tags: ["math", "functions", "basic"]
  },
  {
    title: "Validador de números",
    description: "Verifica si una cadena representa un número válido.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function esNumeroValido(str) {\n    // Tu código aquí\n}",
    solution: "function esNumeroValido(str) {\n    return !isNaN(str) && !isNaN(parseFloat(str)) && str.trim() !== '';\n}",
    testCases: [
      { input: "'123'", output: "true" },
      { input: "'abc'", output: "false" }
    ],
    tags: ["validation", "numbers", "strings"]
  },
  {
    title: "Contador de elementos",
    description: "Cuenta cuántas veces aparece un elemento en un array.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function contarElemento(array, elemento) {\n    // Tu código aquí\n}",
    solution: "function contarElemento(array, elemento) {\n    return array.filter(item => item === elemento).length;\n}",
    testCases: [
      { input: "[1, 2, 3, 2, 2], 2", output: "3" },
      { input: "['a', 'b', 'a'], 'a'", output: "2" }
    ],
    tags: ["arrays", "counting", "filter"]
  },
  {
    title: "Generador de saludo",
    description: "Crea un saludo personalizado basado en la hora del día.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function generarSaludo(nombre, hora) {\n    // Tu código aquí\n}",
    solution: "function generarSaludo(nombre, hora) {\n    let saludo;\n    if (hora < 12) {\n        saludo = 'Buenos días';\n    } else if (hora < 18) {\n        saludo = 'Buenas tardes';\n    } else {\n        saludo = 'Buenas noches';\n    }\n    return `${saludo}, ${nombre}!`;\n}",
    testCases: [
      { input: "'Ana', 9", output: "'Buenos días, Ana!'" },
      { input: "'Carlos', 20", output: "'Buenas noches, Carlos!'" }
    ],
    tags: ["strings", "conditionals", "time"]
  },
  {
    title: "Inversor de cadenas",
    description: "Invierte el orden de los caracteres en una cadena.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function invertirCadena(str) {\n    // Tu código aquí\n}",
    solution: "function invertirCadena(str) {\n    return str.split('').reverse().join('');\n}",
    testCases: [
      { input: "'hola'", output: "'aloh'" },
      { input: "'JavaScript'", output: "'tpircSavaJ'" }
    ],
    tags: ["strings", "reverse", "methods"]
  },
  {
    title: "Calculadora de propina",
    description: "Calcula el monto de propina basado en el total de la cuenta.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function calcularPropina(total, porcentaje) {\n    // Tu código aquí\n}",
    solution: "function calcularPropina(total, porcentaje) {\n    const propina = (total * porcentaje) / 100;\n    return {\n        propina: propina.toFixed(2),\n        total: (total + propina).toFixed(2)\n    };\n}",
    testCases: [
      { input: "100, 15", output: "{propina: '15.00', total: '115.00'}" },
      { input: "50, 20", output: "{propina: '10.00', total: '60.00'}" }
    ],
    tags: ["math", "objects", "calculations"]
  },
  {
    title: "Detector de mayúsculas",
    description: "Verifica si una cadena está completamente en mayúsculas.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function esMayuscula(str) {\n    // Tu código aquí\n}",
    solution: "function esMayuscula(str) {\n    return str === str.toUpperCase() && str !== str.toLowerCase();\n}",
    testCases: [
      { input: "'HOLA'", output: "true" },
      { input: "'Hola'", output: "false" }
    ],
    tags: ["strings", "case", "validation"]
  },
  {
    title: "Suma de array",
    description: "Calcula la suma de todos los números en un array.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function sumarArray(numeros) {\n    // Tu código aquí\n}",
    solution: "function sumarArray(numeros) {\n    return numeros.reduce((suma, num) => suma + num, 0);\n}",
    testCases: [
      { input: "[1, 2, 3, 4, 5]", output: "15" },
      { input: "[10, -5, 3]", output: "8" }
    ],
    tags: ["arrays", "reduce", "math"]
  },
  {
    title: "Formateador de nombres",
    description: "Convierte un nombre a formato título (primera letra mayúscula).",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function formatearNombre(nombre) {\n    // Tu código aquí\n}",
    solution: "function formatearNombre(nombre) {\n    return nombre.toLowerCase().split(' ')\n        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))\n        .join(' ');\n}",
    testCases: [
      { input: "'juan perez'", output: "'Juan Perez'" },
      { input: "'MARIA GARCIA'", output: "'Maria Garcia'" }
    ],
    tags: ["strings", "formatting", "case"]
  },
  {
    title: "Verificador de edad",
    description: "Determina si una persona es mayor de edad.",
    difficulty: "beginner" as const,
    language: "javascript",
    starterCode: "function esMayorDeEdad(edad) {\n    // Tu código aquí\n}",
    solution: "function esMayorDeEdad(edad) {\n    return edad >= 18;\n}",
    testCases: [
      { input: "20", output: "true" },
      { input: "16", output: "false" }
    ],
    tags: ["conditionals", "age", "validation"]
  },

  // JAVASCRIPT - Intermedio
  {
    title: "Debounce function",
    description: "Implementa una función debounce que retrasa la ejecución de una función.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function debounce(func, delay) {\n    // Tu código aquí\n}",
    solution: "function debounce(func, delay) {\n    let timeoutId;\n    return function(...args) {\n        clearTimeout(timeoutId);\n        timeoutId = setTimeout(() => func.apply(this, args), delay);\n    };\n}",
    testCases: [
      { input: "function, 300ms", output: "debounced_function" }
    ],
    tags: ["closures", "timers", "optimization"]
  },
  {
    title: "Promesas en cadena",
    description: "Crea una función que ejecute promesas en secuencia.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function ejecutarEnSecuencia(promesas) {\n    // Tu código aquí\n}",
    solution: "async function ejecutarEnSecuencia(promesas) {\n    const resultados = [];\n    for (const promesa of promesas) {\n        try {\n            const resultado = await promesa();\n            resultados.push(resultado);\n        } catch (error) {\n            resultados.push({ error: error.message });\n        }\n    }\n    return resultados;\n}",
    testCases: [
      { input: "[promise1, promise2, promise3]", output: "[result1, result2, result3]" }
    ],
    tags: ["promises", "async", "sequential"]
  },
  {
    title: "Currying avanzado",
    description: "Implementa una función curry que soporte funciones de múltiples argumentos.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function curry(func) {\n    // Tu código aquí\n}",
    solution: "function curry(func) {\n    return function curried(...args) {\n        if (args.length >= func.length) {\n            return func.apply(this, args);\n        } else {\n            return function(...args2) {\n                return curried.apply(this, args.concat(args2));\n            };\n        }\n    };\n}",
    testCases: [
      { input: "add(1)(2)(3)", output: "6" },
      { input: "add(1, 2)(3)", output: "6" }
    ],
    tags: ["functional-programming", "currying", "closures"]
  },
  {
    title: "Observable simple",
    description: "Implementa un patrón Observer básico.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "class Observable {\n    constructor() {\n        // Tu código aquí\n    }\n\n    subscribe(observer) {\n        // Tu código aquí\n    }\n\n    notify(data) {\n        // Tu código aquí\n    }\n}",
    solution: "class Observable {\n    constructor() {\n        this.observers = [];\n    }\n\n    subscribe(observer) {\n        this.observers.push(observer);\n        return () => {\n            this.observers = this.observers.filter(obs => obs !== observer);\n        };\n    }\n\n    notify(data) {\n        this.observers.forEach(observer => {\n            try {\n                observer(data);\n            } catch (error) {\n                console.error('Observer error:', error);\n            }\n        });\n    }\n}",
    testCases: [
      { input: "observable.notify('test')", output: "observers_called" }
    ],
    tags: ["patterns", "observer", "events"]
  },
  {
    title: "Memoización",
    description: "Implementa una función de memoización para optimizar funciones costosas.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function memoize(func) {\n    // Tu código aquí\n}",
    solution: "function memoize(func) {\n    const cache = new Map();\n    return function(...args) {\n        const key = JSON.stringify(args);\n        if (cache.has(key)) {\n            return cache.get(key);\n        }\n        const result = func.apply(this, args);\n        cache.set(key, result);\n        return result;\n    };\n}",
    testCases: [
      { input: "memoized_fibonacci(10)", output: "55" }
    ],
    tags: ["optimization", "cache", "memoization"]
  },
  {
    title: "Validador de esquemas",
    description: "Crea un validador simple de esquemas de objetos.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function validarEsquema(objeto, esquema) {\n    // Tu código aquí\n}",
    solution: "function validarEsquema(objeto, esquema) {\n    const errores = [];\n    \n    for (const [campo, reglas] of Object.entries(esquema)) {\n        const valor = objeto[campo];\n        \n        if (reglas.required && (valor === undefined || valor === null)) {\n            errores.push(`Campo '${campo}' es requerido`);\n            continue;\n        }\n        \n        if (valor !== undefined && reglas.type && typeof valor !== reglas.type) {\n            errores.push(`Campo '${campo}' debe ser de tipo ${reglas.type}`);\n        }\n        \n        if (reglas.minLength && valor.length < reglas.minLength) {\n            errores.push(`Campo '${campo}' debe tener al menos ${reglas.minLength} caracteres`);\n        }\n        \n        if (reglas.pattern && !reglas.pattern.test(valor)) {\n            errores.push(`Campo '${campo}' no cumple el patrón requerido`);\n        }\n    }\n    \n    return {\n        valido: errores.length === 0,\n        errores\n    };\n}",
    testCases: [
      { input: "{name: 'John', age: 25}, schema", output: "{valido: true, errores: []}" }
    ],
    tags: ["validation", "schemas", "objects"]
  },
  {
    title: "Retry con backoff",
    description: "Implementa una función que reintente operaciones con backoff exponencial.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "async function retryWithBackoff(func, maxRetries = 3) {\n    // Tu código aquí\n}",
    solution: "async function retryWithBackoff(func, maxRetries = 3, baseDelay = 1000) {\n    let lastError;\n    \n    for (let intento = 0; intento <= maxRetries; intento++) {\n        try {\n            return await func();\n        } catch (error) {\n            lastError = error;\n            \n            if (intento === maxRetries) {\n                throw new Error(`Falló después de ${maxRetries + 1} intentos: ${error.message}`);\n            }\n            \n            const delay = baseDelay * Math.pow(2, intento);\n            await new Promise(resolve => setTimeout(resolve, delay));\n        }\n    }\n}",
    testCases: [
      { input: "failing_function, 3", output: "success_or_error" }
    ],
    tags: ["async", "retry", "error-handling"]
  },
  {
    title: "Proxy para logging",
    description: "Usa Proxy para crear un objeto que registre todos los accesos a propiedades.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "function crearProxyConLog(objeto) {\n    // Tu código aquí\n}",
    solution: "function crearProxyConLog(objeto, logger = console.log) {\n    return new Proxy(objeto, {\n        get(target, prop, receiver) {\n            logger(`Accediendo a propiedad: ${prop}`);\n            return Reflect.get(target, prop, receiver);\n        },\n        set(target, prop, value, receiver) {\n            logger(`Estableciendo propiedad: ${prop} = ${value}`);\n            return Reflect.set(target, prop, value, receiver);\n        },\n        has(target, prop) {\n            logger(`Verificando existencia de propiedad: ${prop}`);\n            return Reflect.has(target, prop);\n        },\n        deleteProperty(target, prop) {\n            logger(`Eliminando propiedad: ${prop}`);\n            return Reflect.deleteProperty(target, prop);\n        }\n    });\n}",
    testCases: [
      { input: "proxy.name", output: "logs_access_and_returns_value" }
    ],
    tags: ["proxy", "logging", "metaprogramming"]
  },
  {
    title: "State machine",
    description: "Implementa una máquina de estados simple.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "class StateMachine {\n    constructor(states, initialState) {\n        // Tu código aquí\n    }\n\n    transition(event) {\n        // Tu código aquí\n    }\n}",
    solution: "class StateMachine {\n    constructor(states, initialState) {\n        this.states = states;\n        this.currentState = initialState;\n        this.listeners = new Map();\n    }\n\n    transition(event) {\n        const currentStateConfig = this.states[this.currentState];\n        if (!currentStateConfig || !currentStateConfig.transitions[event]) {\n            throw new Error(`Transición inválida: ${event} desde ${this.currentState}`);\n        }\n\n        const nextState = currentStateConfig.transitions[event];\n        const previousState = this.currentState;\n        \n        // Ejecutar callback de salida\n        if (currentStateConfig.onExit) {\n            currentStateConfig.onExit();\n        }\n        \n        this.currentState = nextState;\n        \n        // Ejecutar callback de entrada\n        const nextStateConfig = this.states[nextState];\n        if (nextStateConfig.onEnter) {\n            nextStateConfig.onEnter();\n        }\n        \n        // Notificar listeners\n        this.notifyListeners(previousState, nextState, event);\n        \n        return this.currentState;\n    }\n\n    getCurrentState() {\n        return this.currentState;\n    }\n\n    onTransition(callback) {\n        if (!this.listeners.has('transition')) {\n            this.listeners.set('transition', []);\n        }\n        this.listeners.get('transition').push(callback);\n    }\n\n    notifyListeners(from, to, event) {\n        const callbacks = this.listeners.get('transition') || [];\n        callbacks.forEach(callback => callback(from, to, event));\n    }\n}",
    testCases: [
      { input: "machine.transition('start')", output: "new_state" }
    ],
    tags: ["state-machine", "patterns", "events"]
  },
  {
    title: "Rate limiter",
    description: "Implementa un limitador de velocidad usando token bucket.",
    difficulty: "intermediate" as const,
    language: "javascript",
    starterCode: "class RateLimiter {\n    constructor(maxTokens, refillRate) {\n        // Tu código aquí\n    }\n\n    consume(tokens = 1) {\n        // Tu código aquí\n    }\n}",
    solution: "class RateLimiter {\n    constructor(maxTokens, refillRate) {\n        this.maxTokens = maxTokens;\n        this.tokens = maxTokens;\n        this.refillRate = refillRate; // tokens per second\n        this.lastRefill = Date.now();\n    }\n\n    refill() {\n        const now = Date.now();\n        const timePassed = (now - this.lastRefill) / 1000;\n        const tokensToAdd = Math.floor(timePassed * this.refillRate);\n        \n        if (tokensToAdd > 0) {\n            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);\n            this.lastRefill = now;\n        }\n    }\n\n    consume(tokens = 1) {\n        this.refill();\n        \n        if (this.tokens >= tokens) {\n            this.tokens -= tokens;\n            return true;\n        }\n        \n        return false;\n    }\n\n    getAvailableTokens() {\n        this.refill();\n        return this.tokens;\n    }\n}",
    testCases: [
      { input: "limiter.consume(1)", output: "true_or_false" }
    ],
    tags: ["rate-limiting", "algorithms", "performance"]
  },

  // JAVASCRIPT - Avanzado
  {
    title: "Virtual DOM implementation",
    description: "Implementa una versión simplificada de Virtual DOM.",
    difficulty: "advanced" as const,
    language: "javascript",
    starterCode: "class VNode {\n    constructor(tag, props, children) {\n        // Tu código aquí\n    }\n}\n\nfunction render(vnode) {\n    // Tu código aquí\n}\n\nfunction diff(oldVNode, newVNode) {\n    // Tu código aquí\n}",
    solution: "class VNode {\n    constructor(tag, props = {}, children = []) {\n        this.tag = tag;\n        this.props = props;\n        this.children = children;\n    }\n}\n\nfunction render(vnode) {\n    if (typeof vnode === 'string') {\n        return document.createTextNode(vnode);\n    }\n    \n    const element = document.createElement(vnode.tag);\n    \n    // Aplicar propiedades\n    Object.keys(vnode.props).forEach(key => {\n        if (key.startsWith('on')) {\n            const event = key.slice(2).toLowerCase();\n            element.addEventListener(event, vnode.props[key]);\n        } else if (key === 'className') {\n            element.className = vnode.props[key];\n        } else {\n            element.setAttribute(key, vnode.props[key]);\n        }\n    });\n    \n    // Renderizar hijos\n    vnode.children.forEach(child => {\n        element.appendChild(render(child));\n    });\n    \n    return element;\n}\n\nfunction diff(oldVNode, newVNode) {\n    const patches = [];\n    \n    if (!oldVNode) {\n        patches.push({ type: 'CREATE', vnode: newVNode });\n    } else if (!newVNode) {\n        patches.push({ type: 'REMOVE' });\n    } else if (typeof oldVNode !== typeof newVNode || \n               (oldVNode.tag && oldVNode.tag !== newVNode.tag)) {\n        patches.push({ type: 'REPLACE', vnode: newVNode });\n    } else if (typeof oldVNode === 'string') {\n        if (oldVNode !== newVNode) {\n            patches.push({ type: 'TEXT', text: newVNode });\n        }\n    } else {\n        // Diff propiedades\n        const propPatches = diffProps(oldVNode.props, newVNode.props);\n        if (propPatches.length > 0) {\n            patches.push({ type: 'PROPS', patches: propPatches });\n        }\n        \n        // Diff hijos\n        const childPatches = diffChildren(oldVNode.children, newVNode.children);\n        if (childPatches.length > 0) {\n            patches.push({ type: 'CHILDREN', patches: childPatches });\n        }\n    }\n    \n    return patches;\n}\n\nfunction diffProps(oldProps, newProps) {\n    const patches = [];\n    \n    // Props eliminadas o modificadas\n    Object.keys(oldProps).forEach(key => {\n        if (!(key in newProps)) {\n            patches.push({ type: 'REMOVE_PROP', key });\n        } else if (oldProps[key] !== newProps[key]) {\n            patches.push({ type: 'SET_PROP', key, value: newProps[key] });\n        }\n    });\n    \n    // Props nuevas\n    Object.keys(newProps).forEach(key => {\n        if (!(key in oldProps)) {\n            patches.push({ type: 'SET_PROP', key, value: newProps[key] });\n        }\n    });\n    \n    return patches;\n}\n\nfunction diffChildren(oldChildren, newChildren) {\n    const patches = [];\n    const maxLength = Math.max(oldChildren.length, newChildren.length);\n    \n    for (let i = 0; i < maxLength; i++) {\n        const childPatches = diff(oldChildren[i], newChildren[i]);\n        if (childPatches.length > 0) {\n            patches.push({ index: i, patches: childPatches });\n        }\n    }\n    \n    return patches;\n}",
    testCases: [
      { input: "vdom_diff", output: "patch_operations" }
    ],
    tags: ["virtual-dom", "frameworks", "rendering"]
  },
  {
    title: "Async Iterator con backpressure",
    description: "Implementa un async iterator que maneje backpressure.",
    difficulty: "advanced" as const,
    language: "javascript",
    starterCode: "class AsyncStream {\n    constructor(generator, bufferSize = 10) {\n        // Tu código aquí\n    }\n\n    async *[Symbol.asyncIterator]() {\n        // Tu código aquí\n    }\n}",
    solution: "class AsyncStream {\n    constructor(generator, bufferSize = 10) {\n        this.generator = generator;\n        this.bufferSize = bufferSize;\n        this.buffer = [];\n        this.waitingReaders = [];\n        this.ended = false;\n        this.error = null;\n    }\n\n    async *[Symbol.asyncIterator]() {\n        const iterator = this.generator();\n        let reading = false;\n        \n        const fillBuffer = async () => {\n            if (reading || this.ended) return;\n            reading = true;\n            \n            try {\n                while (this.buffer.length < this.bufferSize && !this.ended) {\n                    const { value, done } = await iterator.next();\n                    \n                    if (done) {\n                        this.ended = true;\n                        break;\n                    }\n                    \n                    this.buffer.push(value);\n                    \n                    // Notificar lectores esperando\n                    if (this.waitingReaders.length > 0) {\n                        const reader = this.waitingReaders.shift();\n                        reader.resolve();\n                    }\n                }\n            } catch (error) {\n                this.error = error;\n                this.ended = true;\n                \n                // Notificar error a lectores esperando\n                this.waitingReaders.forEach(reader => reader.reject(error));\n                this.waitingReaders.length = 0;\n            } finally {\n                reading = false;\n            }\n        };\n        \n        while (true) {\n            await fillBuffer();\n            \n            if (this.error) {\n                throw this.error;\n            }\n            \n            if (this.buffer.length === 0) {\n                if (this.ended) {\n                    break;\n                }\n                \n                // Esperar a que lleguen más datos\n                await new Promise((resolve, reject) => {\n                    this.waitingReaders.push({ resolve, reject });\n                });\n                continue;\n            }\n            \n            yield this.buffer.shift();\n        }\n    }\n}",
    testCases: [
      { input: "async_stream_iteration", output: "streamed_values" }
    ],
    tags: ["async-iterators", "backpressure", "streams"]
  },
  {
    title: "Micro Frontend Framework",
    description: "Implementa un sistema básico para cargar micro frontends.",
    difficulty: "advanced" as const,
    language: "javascript",
    starterCode: "class MicroFrontendLoader {\n    constructor() {\n        // Tu código aquí\n    }\n\n    async loadMicroFrontend(name, url) {\n        // Tu código aquí\n    }\n\n    mount(name, container) {\n        // Tu código aquí\n    }\n}",
    solution: "class MicroFrontendLoader {\n    constructor() {\n        this.microFrontends = new Map();\n        this.loadedScripts = new Set();\n    }\n\n    async loadMicroFrontend(name, config) {\n        if (this.microFrontends.has(name)) {\n            return this.microFrontends.get(name);\n        }\n\n        const { url, cssUrl, dependencies = [] } = config;\n\n        try {\n            // Cargar dependencias primero\n            await Promise.all(dependencies.map(dep => this.loadScript(dep)));\n\n            // Cargar CSS si existe\n            if (cssUrl) {\n                await this.loadCSS(cssUrl);\n            }\n\n            // Cargar script principal\n            await this.loadScript(url);\n\n            // El micro frontend debe registrarse globalmente\n            const microFrontend = window[`MicroFrontend_${name}`];\n            if (!microFrontend) {\n                throw new Error(`Micro frontend ${name} no se registró correctamente`);\n            }\n\n            this.microFrontends.set(name, microFrontend);\n            return microFrontend;\n\n        } catch (error) {\n            console.error(`Error cargando micro frontend ${name}:`, error);\n            throw error;\n        }\n    }\n\n    async loadScript(url) {\n        if (this.loadedScripts.has(url)) {\n            return;\n        }\n\n        return new Promise((resolve, reject) => {\n            const script = document.createElement('script');\n            script.src = url;\n            script.async = true;\n            \n            script.onload = () => {\n                this.loadedScripts.add(url);\n                resolve();\n            };\n            \n            script.onerror = () => {\n                reject(new Error(`Error cargando script: ${url}`));\n            };\n            \n            document.head.appendChild(script);\n        });\n    }\n\n    async loadCSS(url) {\n        return new Promise((resolve, reject) => {\n            const link = document.createElement('link');\n            link.rel = 'stylesheet';\n            link.href = url;\n            \n            link.onload = resolve;\n            link.onerror = () => reject(new Error(`Error cargando CSS: ${url}`));\n            \n            document.head.appendChild(link);\n        });\n    }\n\n    async mount(name, container, props = {}) {\n        const microFrontend = this.microFrontends.get(name);\n        if (!microFrontend) {\n            throw new Error(`Micro frontend ${name} no está cargado`);\n        }\n\n        // Crear contexto aislado\n        const context = {\n            container,\n            props,\n            eventBus: this.createEventBus(),\n            unmount: () => this.unmount(name, container)\n        };\n\n        if (typeof microFrontend.mount === 'function') {\n            await microFrontend.mount(context);\n        } else {\n            throw new Error(`Micro frontend ${name} no tiene método mount`);\n        }\n\n        return context;\n    }\n\n    unmount(name, container) {\n        const microFrontend = this.microFrontends.get(name);\n        if (microFrontend && typeof microFrontend.unmount === 'function') {\n            microFrontend.unmount(container);\n        }\n        \n        // Limpiar contenedor\n        if (container) {\n            container.innerHTML = '';\n        }\n    }\n\n    createEventBus() {\n        const listeners = new Map();\n        \n        return {\n            on(event, callback) {\n                if (!listeners.has(event)) {\n                    listeners.set(event, new Set());\n                }\n                listeners.get(event).add(callback);\n            },\n            \n            off(event, callback) {\n                if (listeners.has(event)) {\n                    listeners.get(event).delete(callback);\n                }\n            },\n            \n            emit(event, data) {\n                if (listeners.has(event)) {\n                    listeners.get(event).forEach(callback => {\n                        try {\n                            callback(data);\n                        } catch (error) {\n                            console.error('Error in event listener:', error);\n                        }\n                    });\n                }\n            }\n        };\n    }\n}",
    testCases: [
      { input: "load_and_mount_microfrontend", output: "mounted_component" }
    ],
    tags: ["micro-frontends", "architecture", "dynamic-loading"]
  },
  {
    title: "WebAssembly Wrapper",
    description: "Crea un wrapper para interactuar fácilmente con módulos WebAssembly.",
    difficulty: "advanced" as const,
    language: "javascript",
    starterCode: "class WASMWrapper {\n    constructor() {\n        // Tu código aquí\n    }\n\n    async loadModule(wasmUrl) {\n        // Tu código aquí\n    }\n\n    callFunction(name, ...args) {\n        // Tu código aquí\n    }\n}",
    solution: "class WASMWrapper {\n    constructor() {\n        this.module = null;\n        this.instance = null;\n        this.memory = null;\n        this.functionCache = new Map();\n    }\n\n    async loadModule(wasmUrl, imports = {}) {\n        try {\n            // Cargar el archivo WASM\n            const response = await fetch(wasmUrl);\n            if (!response.ok) {\n                throw new Error(`Error cargando WASM: ${response.statusText}`);\n            }\n            \n            const bytes = await response.arrayBuffer();\n            \n            // Importaciones por defecto\n            const defaultImports = {\n                env: {\n                    memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),\n                    table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),\n                    ...imports.env\n                },\n                ...imports\n            };\n            \n            // Compilar e instanciar\n            const module = await WebAssembly.compile(bytes);\n            const instance = await WebAssembly.instantiate(module, defaultImports);\n            \n            this.module = module;\n            this.instance = instance;\n            this.memory = defaultImports.env.memory;\n            \n            return this;\n            \n        } catch (error) {\n            console.error('Error cargando módulo WASM:', error);\n            throw error;\n        }\n    }\n\n    callFunction(name, ...args) {\n        if (!this.instance) {\n            throw new Error('Módulo WASM no cargado');\n        }\n        \n        const func = this.instance.exports[name];\n        if (typeof func !== 'function') {\n            throw new Error(`Función ${name} no encontrada en el módulo WASM`);\n        }\n        \n        try {\n            return func(...args);\n        } catch (error) {\n            console.error(`Error ejecutando función WASM ${name}:`, error);\n            throw error;\n        }\n    }\n\n    readString(ptr, length) {\n        if (!this.memory) {\n            throw new Error('Memoria WASM no disponible');\n        }\n        \n        const buffer = new Uint8Array(this.memory.buffer, ptr, length);\n        return new TextDecoder().decode(buffer);\n    }\n\n    writeString(str) {\n        if (!this.memory) {\n            throw new Error('Memoria WASM no disponible');\n        }\n        \n        const encoded = new TextEncoder().encode(str);\n        const ptr = this.callFunction('malloc', encoded.length + 1);\n        \n        if (!ptr) {\n            throw new Error('Error asignando memoria en WASM');\n        }\n        \n        const buffer = new Uint8Array(this.memory.buffer, ptr, encoded.length + 1);\n        buffer.set(encoded);\n        buffer[encoded.length] = 0; // null terminator\n        \n        return ptr;\n    }\n\n    readArray(ptr, length, type = 'i32') {\n        if (!this.memory) {\n            throw new Error('Memoria WASM no disponible');\n        }\n        \n        const TypedArray = {\n            'i8': Int8Array,\n            'i16': Int16Array,\n            'i32': Int32Array,\n            'f32': Float32Array,\n            'f64': Float64Array\n        }[type];\n        \n        if (!TypedArray) {\n            throw new Error(`Tipo no soportado: ${type}`);\n        }\n        \n        return new TypedArray(this.memory.buffer, ptr, length);\n    }\n\n    getExports() {\n        return this.instance ? Object.keys(this.instance.exports) : [];\n    }\n\n    getMemoryUsage() {\n        if (!this.memory) {\n            return null;\n        }\n        \n        return {\n            pages: this.memory.buffer.byteLength / (64 * 1024),\n            bytes: this.memory.buffer.byteLength\n        };\n    }\n}",
    testCases: [
      { input: "wasm_module_interaction", output: "function_results" }
    ],
    tags: ["webassembly", "interop", "performance"]
  },
  {
    title: "Advanced Service Worker",
    description: "Implementa un Service Worker avanzado con estrategias de cache inteligentes.",
    difficulty: "advanced" as const,
    language: "javascript",
    starterCode: "class AdvancedServiceWorker {\n    constructor() {\n        // Tu código aquí\n    }\n\n    install() {\n        // Tu código aquí\n    }\n\n    fetch(event) {\n        // Tu código aquí\n    }\n}",
    solution: "class AdvancedServiceWorker {\n    constructor() {\n        this.CACHE_NAME = 'advanced-sw-v1';\n        this.RUNTIME_CACHE = 'runtime-cache-v1';\n        this.strategies = new Map();\n        this.networkTimeouts = new Map();\n        \n        this.setupStrategies();\n    }\n\n    setupStrategies() {\n        // Cache First para assets estáticos\n        this.strategies.set(/\\.(css|js|png|jpg|jpeg|gif|svg|woff2?)$/, 'cacheFirst');\n        \n        // Network First para API calls\n        this.strategies.set(/\\/api\\//, 'networkFirst');\n        \n        // Stale While Revalidate para páginas HTML\n        this.strategies.set(/\\.html$/, 'staleWhileRevalidate');\n        \n        // Network Only para auth endpoints\n        this.strategies.set(/\\/(login|logout|auth)/, 'networkOnly');\n    }\n\n    install() {\n        self.addEventListener('install', (event) => {\n            event.waitUntil(\n                this.precacheResources().then(() => {\n                    self.skipWaiting();\n                })\n            );\n        });\n\n        self.addEventListener('activate', (event) => {\n            event.waitUntil(\n                this.cleanupOldCaches().then(() => {\n                    self.clients.claim();\n                })\n            );\n        });\n\n        self.addEventListener('fetch', (event) => {\n            event.respondWith(this.handleFetch(event));\n        });\n    }\n\n    async precacheResources() {\n        const cache = await caches.open(this.CACHE_NAME);\n        const resourcesToCache = [\n            '/',\n            '/offline.html',\n            '/manifest.json'\n        ];\n        \n        return cache.addAll(resourcesToCache);\n    }\n\n    async cleanupOldCaches() {\n        const cacheNames = await caches.keys();\n        return Promise.all(\n            cacheNames\n                .filter(name => name !== this.CACHE_NAME && name !== this.RUNTIME_CACHE)\n                .map(name => caches.delete(name))\n        );\n    }\n\n    async handleFetch(event) {\n        const { request } = event;\n        const url = new URL(request.url);\n        \n        // Determinar estrategia\n        const strategy = this.getStrategy(url.pathname);\n        \n        try {\n            switch (strategy) {\n                case 'cacheFirst':\n                    return await this.cacheFirst(request);\n                case 'networkFirst':\n                    return await this.networkFirst(request);\n                case 'staleWhileRevalidate':\n                    return await this.staleWhileRevalidate(request);\n                case 'networkOnly':\n                    return await this.networkOnly(request);\n                default:\n                    return await this.networkFirst(request);\n            }\n        } catch (error) {\n            return this.handleFetchError(request, error);\n        }\n    }\n\n    getStrategy(pathname) {\n        for (const [pattern, strategy] of this.strategies) {\n            if (pattern.test(pathname)) {\n                return strategy;\n            }\n        }\n        return 'networkFirst';\n    }\n\n    async cacheFirst(request) {\n        const cachedResponse = await caches.match(request);\n        if (cachedResponse) {\n            return cachedResponse;\n        }\n        \n        const networkResponse = await fetch(request);\n        if (networkResponse.ok) {\n            const cache = await caches.open(this.RUNTIME_CACHE);\n            cache.put(request, networkResponse.clone());\n        }\n        \n        return networkResponse;\n    }\n\n    async networkFirst(request, timeout = 3000) {\n        try {\n            const controller = new AbortController();\n            const timeoutId = setTimeout(() => controller.abort(), timeout);\n            \n            const networkResponse = await fetch(request, {\n                signal: controller.signal\n            });\n            \n            clearTimeout(timeoutId);\n            \n            if (networkResponse.ok) {\n                const cache = await caches.open(this.RUNTIME_CACHE);\n                cache.put(request, networkResponse.clone());\n            }\n            \n            return networkResponse;\n        } catch (error) {\n            const cachedResponse = await caches.match(request);\n            if (cachedResponse) {\n                return cachedResponse;\n            }\n            throw error;\n        }\n    }\n\n    async staleWhileRevalidate(request) {\n        const cachedResponse = await caches.match(request);\n        \n        const networkPromise = fetch(request).then(response => {\n            if (response.ok) {\n                const cache = caches.open(this.RUNTIME_CACHE);\n                cache.then(c => c.put(request, response.clone()));\n            }\n            return response;\n        }).catch(() => null);\n        \n        return cachedResponse || await networkPromise;\n    }\n\n    async networkOnly(request) {\n        return fetch(request);\n    }\n\n    async handleFetchError(request, error) {\n        console.error('Fetch error:', error);\n        \n        // Si es una navegación, devolver página offline\n        if (request.mode === 'navigate') {\n            const offlinePage = await caches.match('/offline.html');\n            if (offlinePage) {\n                return offlinePage;\n            }\n        }\n        \n        // Para otros recursos, intentar cache\n        const cachedResponse = await caches.match(request);\n        if (cachedResponse) {\n            return cachedResponse;\n        }\n        \n        // Respuesta de error por defecto\n        return new Response('Network error occurred', {\n            status: 408,\n            statusText: 'Network Error'\n        });\n    }\n}",
    testCases: [
      { input: "service_worker_installation", output: "caching_strategies_active" }
    ],
    tags: ["service-worker", "caching", "offline"]
  },

  // Ejercicios para otros lenguajes siguen el mismo patrón...
  // Por brevedad, incluiré algunos ejercicios representativos para C++, HTML/CSS, C y C#

  // C++ - Principiante
  {
    title: "Calculadora simple en C++",
    description: "Implementa una calculadora que realice operaciones básicas.",
    difficulty: "beginner" as const,
    language: "cpp",
    starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Tu código aquí\n    return 0;\n}",
    solution: "#include <iostream>\nusing namespace std;\n\nint main() {\n    double a, b;\n    char op;\n    \n    cout << \"Ingresa dos números: \";\n    cin >> a >> b;\n    cout << \"Ingresa operación (+, -, *, /): \";\n    cin >> op;\n    \n    switch(op) {\n        case '+':\n            cout << \"Resultado: \" << a + b << endl;\n            break;\n        case '-':\n            cout << \"Resultado: \" << a - b << endl;\n            break;\n        case '*':\n            cout << \"Resultado: \" << a * b << endl;\n            break;\n        case '/':\n            if(b != 0)\n                cout << \"Resultado: \" << a / b << endl;\n            else\n                cout << \"Error: División por cero\" << endl;\n            break;\n        default:\n            cout << \"Operación no válida\" << endl;\n    }\n    \n    return 0;\n}",
    testCases: [
      { input: "5 3 +", output: "8" },
      { input: "10 2 /", output: "5" }
    ],
    tags: ["basic", "calculator", "operators"]
  },

  // HTML & CSS - Principiante
  {
    title: "Página de perfil responsive",
    description: "Crea una página de perfil personal con diseño responsive.",
    difficulty: "beginner" as const,
    language: "html-css",
    starterCode: "<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        /* Tu CSS aquí */\n    </style>\n</head>\n<body>\n    <!-- Tu HTML aquí -->\n</body>\n</html>",
    solution: "<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n        }\n        \n        body {\n            font-family: Arial, sans-serif;\n            line-height: 1.6;\n            color: #333;\n        }\n        \n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 20px;\n        }\n        \n        .profile-header {\n            text-align: center;\n            margin-bottom: 30px;\n        }\n        \n        .profile-img {\n            width: 150px;\n            height: 150px;\n            border-radius: 50%;\n            border: 5px solid #ddd;\n            margin-bottom: 20px;\n        }\n        \n        .profile-info {\n            display: grid;\n            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n            gap: 20px;\n        }\n        \n        .info-card {\n            background: #f4f4f4;\n            padding: 20px;\n            border-radius: 8px;\n        }\n        \n        @media (max-width: 600px) {\n            .container {\n                padding: 10px;\n            }\n            \n            .profile-img {\n                width: 100px;\n                height: 100px;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"profile-header\">\n            <img src=\"https://via.placeholder.com/150\" alt=\"Perfil\" class=\"profile-img\">\n            <h1>Juan Pérez</h1>\n            <p>Desarrollador Web</p>\n        </div>\n        \n        <div class=\"profile-info\">\n            <div class=\"info-card\">\n                <h3>Información Personal</h3>\n                <p><strong>Email:</strong> juan@example.com</p>\n                <p><strong>Teléfono:</strong> +1234567890</p>\n                <p><strong>Ubicación:</strong> Madrid, España</p>\n            </div>\n            \n            <div class=\"info-card\">\n                <h3>Habilidades</h3>\n                <p>HTML, CSS, JavaScript, React, Node.js</p>\n            </div>\n        </div>\n    </div>\n</body>\n</html>",
    testCases: [
      { input: "responsive_design", output: "mobile_desktop_compatible" }
    ],
    tags: ["html", "css", "responsive", "profile"]
  },

  // C - Principiante
  {
    title: "Programa de gestión de inventario",
    description: "Crea un programa que gestione un inventario simple usando estructuras.",
    difficulty: "beginner" as const,
    language: "c",
    starterCode: "#include <stdio.h>\n#include <string.h>\n\ntypedef struct {\n    // Define tu estructura aquí\n} Producto;\n\nint main() {\n    // Tu código aquí\n    return 0;\n}",
    solution: "#include <stdio.h>\n#include <string.h>\n\ntypedef struct {\n    int id;\n    char nombre[50];\n    float precio;\n    int cantidad;\n} Producto;\n\nvoid mostrarProducto(Producto p) {\n    printf(\"ID: %d, Nombre: %s, Precio: %.2f, Cantidad: %d\\n\", \n           p.id, p.nombre, p.precio, p.cantidad);\n}\n\nint main() {\n    Producto inventario[5];\n    int numProductos = 0;\n    int opcion;\n    \n    do {\n        printf(\"\\n--- Gestión de Inventario ---\\n\");\n        printf(\"1. Agregar producto\\n\");\n        printf(\"2. Mostrar inventario\\n\");\n        printf(\"3. Salir\\n\");\n        printf(\"Opción: \");\n        scanf(\"%d\", &opcion);\n        \n        switch(opcion) {\n            case 1:\n                if(numProductos < 5) {\n                    printf(\"ID: \");\n                    scanf(\"%d\", &inventario[numProductos].id);\n                    printf(\"Nombre: \");\n                    scanf(\"%s\", inventario[numProductos].nombre);\n                    printf(\"Precio: \");\n                    scanf(\"%f\", &inventario[numProductos].precio);\n                    printf(\"Cantidad: \");\n                    scanf(\"%d\", &inventario[numProductos].cantidad);\n                    numProductos++;\n                    printf(\"Producto agregado exitosamente.\\n\");\n                } else {\n                    printf(\"Inventario lleno.\\n\");\n                }\n                break;\n            case 2:\n                printf(\"\\n--- Inventario ---\\n\");\n                for(int i = 0; i < numProductos; i++) {\n                    mostrarProducto(inventario[i]);\n                }\n                break;\n        }\n    } while(opcion != 3);\n    \n    return 0;\n}",
    testCases: [
      { input: "inventory_management", output: "product_list" }
    ],
    tags: ["structures", "arrays", "inventory"]
  },

  // C# - Principiante
  {
    title: "Sistema de biblioteca con clases",
    description: "Implementa un sistema básico de biblioteca usando programación orientada a objetos.",
    difficulty: "beginner" as const,
    language: "csharp",
    starterCode: "using System;\nusing System.Collections.Generic;\n\npublic class Libro {\n    // Define tu clase aquí\n}\n\npublic class Biblioteca {\n    // Define tu clase aquí\n}\n\nclass Program {\n    static void Main() {\n        // Tu código aquí\n    }\n}",
    solution: "using System;\nusing System.Collections.Generic;\n\npublic class Libro {\n    public string Titulo { get; set; }\n    public string Autor { get; set; }\n    public int Año { get; set; }\n    public bool Disponible { get; set; }\n    \n    public Libro(string titulo, string autor, int año) {\n        Titulo = titulo;\n        Autor = autor;\n        Año = año;\n        Disponible = true;\n    }\n    \n    public override string ToString() {\n        return $\"{Titulo} por {Autor} ({Año}) - {(Disponible ? \"Disponible\" : \"Prestado\")}\";\n    }\n}\n\npublic class Biblioteca {\n    private List<Libro> libros;\n    \n    public Biblioteca() {\n        libros = new List<Libro>();\n    }\n    \n    public void AgregarLibro(Libro libro) {\n        libros.Add(libro);\n        Console.WriteLine($\"Libro '{libro.Titulo}' agregado a la biblioteca.\");\n    }\n    \n    public void MostrarLibros() {\n        Console.WriteLine(\"\\n--- Catálogo de Libros ---\");\n        foreach(var libro in libros) {\n            Console.WriteLine(libro);\n        }\n    }\n    \n    public bool PrestarLibro(string titulo) {\n        var libro = libros.Find(l => l.Titulo.Equals(titulo, StringComparison.OrdinalIgnoreCase));\n        if(libro != null && libro.Disponible) {\n            libro.Disponible = false;\n            Console.WriteLine($\"Libro '{titulo}' prestado exitosamente.\");\n            return true;\n        }\n        Console.WriteLine($\"Libro '{titulo}' no disponible.\");\n        return false;\n    }\n    \n    public bool DevolverLibro(string titulo) {\n        var libro = libros.Find(l => l.Titulo.Equals(titulo, StringComparison.OrdinalIgnoreCase));\n        if(libro != null && !libro.Disponible) {\n            libro.Disponible = true;\n            Console.WriteLine($\"Libro '{titulo}' devuelto exitosamente.\");\n            return true;\n        }\n        Console.WriteLine($\"Error al devolver libro '{titulo}'.\");\n        return false;\n    }\n}\n\nclass Program {\n    static void Main() {\n        var biblioteca = new Biblioteca();\n        \n        // Agregar algunos libros\n        biblioteca.AgregarLibro(new Libro(\"Don Quijote\", \"Miguel de Cervantes\", 1605));\n        biblioteca.AgregarLibro(new Libro(\"Cien años de soledad\", \"Gabriel García Márquez\", 1967));\n        \n        // Mostrar catálogo\n        biblioteca.MostrarLibros();\n        \n        // Prestar y devolver libros\n        biblioteca.PrestarLibro(\"Don Quijote\");\n        biblioteca.MostrarLibros();\n        biblioteca.DevolverLibro(\"Don Quijote\");\n        biblioteca.MostrarLibros();\n    }\n}",
    testCases: [
      { input: "library_system", output: "book_management" }
    ],
    tags: ["oop", "classes", "library"]
  }
];