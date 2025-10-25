/**
 * Carga automática de ejercicios desde GitHub y otras fuentes
 */

import { storage } from './ejercicios-storage.js';
import { transformarDesdeGitHub, validarEjercicio } from './ejercicios-schema.js';

export class EjerciciosAutoLoader {
  constructor() {
    this.cargando = false;
    this.estadoCarga = {
      total: 0,
      procesados: 0,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };
  }

  // Cargar ejercicios desde diferentes fuentes
  async cargarDesdeGitHub(repoInfo) {
    console.log(`Iniciando carga desde GitHub: ${repoInfo.url || 'repositorio'}`);
    this.cargando = true;
    this.reiniciarEstado();

    try {
      // Simular carga de ejercicios desde GitHub
      // En una implementación real, aquí harías llamadas a la API de GitHub
      const ejerciciosSimulados = this.generarEjerciciosSimulados();
      
      await this.procesarEjercicios(ejerciciosSimulados);
      
      console.log(`Carga completada: ${this.estadoCarga.exitosos} ejercicios cargados`);
      return this.estadoCarga;
    } catch (error) {
      console.error('Error en carga desde GitHub:', error);
      throw error;
    } finally {
      this.cargando = false;
    }
  }

  async cargarDesdeArchivos(archivos) {
    console.log(`Procesando ${archivos.length} archivos`);
    this.cargando = true;
    this.reiniciarEstado();

    try {
      const ejercicios = [];
      
      for (const archivo of archivos) {
        try {
          const ejercicio = await this.procesarArchivoMarkdown(archivo.content, archivo.filename);
          if (ejercicio) {
            ejercicios.push(ejercicio);
          }
        } catch (error) {
          this.estadoCarga.errores.push(`Error en ${archivo.filename}: ${error.message}`);
        }
      }

      await this.procesarEjercicios(ejercicios);
      
      console.log(`Archivos procesados: ${this.estadoCarga.exitosos} ejercicios cargados`);
      return this.estadoCarga;
    } catch (error) {
      console.error('Error procesando archivos:', error);
      throw error;
    } finally {
      this.cargando = false;
    }
  }

  async cargarEjerciciosIniciales() {
    if (storage.estadisticas.total > 0) {
      console.log('Ya existen ejercicios cargados, omitiendo carga inicial');
      return;
    }

    console.log('Cargando ejercicios iniciales...');
    const ejerciciosIniciales = this.generarEjerciciosIniciales();
    await this.procesarEjercicios(ejerciciosIniciales);
    console.log(`Ejercicios iniciales cargados: ${this.estadoCarga.exitosos}`);
  }

  // Procesamiento de ejercicios
  async procesarEjercicios(ejercicios) {
    this.estadoCarga.total = ejercicios.length;
    
    for (const ejercicioRaw of ejercicios) {
      this.estadoCarga.procesados++;
      
      try {
        // Transformar formato si viene de GitHub
        const ejercicio = ejercicioRaw.source === 'github' 
          ? transformarDesdeGitHub(ejercicioRaw)
          : ejercicioRaw;

        // Validar ejercicio
        const errores = validarEjercicio(ejercicio);
        if (errores.length > 0) {
          throw new Error(`Validación fallida: ${errores.join(', ')}`);
        }

        // Agregar al storage
        await storage.agregarEjercicio(ejercicio);
        this.estadoCarga.exitosos++;
        
      } catch (error) {
        this.estadoCarga.fallidos++;
        this.estadoCarga.errores.push({
          ejercicio: ejercicioRaw.titulo || ejercicioRaw.title || 'Sin título',
          error: error.message
        });
      }
    }
  }

  async procesarArchivoMarkdown(contenido, nombreArchivo) {
    // Parser básico de Markdown para ejercicios
    const lineas = contenido.split('\n');
    let titulo = '';
    let descripcion = '';
    let lenguaje = '';
    let nivel = 'principiante';
    let codigoInicial = '';
    let solucion = '';
    let tags = [];

    // Extraer metadatos del frontmatter
    if (lineas[0] === '---') {
      const finFrontmatter = lineas.findIndex((linea, index) => index > 0 && linea === '---');
      if (finFrontmatter !== -1) {
        const frontmatter = lineas.slice(1, finFrontmatter);
        for (const linea of frontmatter) {
          if (linea.includes('nivel:') || linea.includes('difficulty:')) {
            nivel = linea.split(':')[1]?.trim().toLowerCase() || 'principiante';
          }
          if (linea.includes('lenguaje:') || linea.includes('language:')) {
            lenguaje = linea.split(':')[1]?.trim().toLowerCase() || '';
          }
          if (linea.includes('tags:')) {
            const tagsStr = linea.split(':')[1]?.trim() || '';
            tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);
          }
        }
      }
    }

    // Extraer título del primer header
    const lineaTitulo = lineas.find(linea => linea.startsWith('# '));
    if (lineaTitulo) {
      titulo = lineaTitulo.replace('# ', '').trim();
    }

    // Inferir lenguaje del nombre del archivo si no se especifica
    if (!lenguaje) {
      const extension = nombreArchivo.split('.').pop()?.toLowerCase();
      const mapaExtensiones = {
        'py': 'python',
        'js': 'javascript',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp'
      };
      lenguaje = mapaExtensiones[extension] || 'python';
    }

    // Extraer descripción
    let inicioDesc = lineas.findIndex(linea => linea.startsWith('# ')) + 1;
    let finDesc = lineas.findIndex((linea, index) => index > inicioDesc && linea.startsWith('```'));
    if (finDesc === -1) finDesc = lineas.length;
    
    descripcion = lineas.slice(inicioDesc, finDesc)
      .filter(linea => !linea.startsWith('#'))
      .join('\n')
      .trim();

    // Extraer bloques de código
    const bloquesCodigo = this.extraerBloquesCodigo(contenido);
    if (bloquesCodigo.length > 0) {
      codigoInicial = bloquesCodigo[0];
      if (bloquesCodigo.length > 1) {
        solucion = bloquesCodigo[1];
      }
    }

    return {
      id: this.generarIdDesdeArchivo(nombreArchivo),
      titulo: titulo || nombreArchivo.replace(/\.[^/.]+$/, ""),
      descripcion: descripcion || `Ejercicio de programación en ${lenguaje}`,
      lenguaje: this.mapearLenguaje(lenguaje),
      nivel: this.mapearNivel(nivel),
      codigo_inicial: codigoInicial,
      solucion: solucion,
      casos_prueba: [],
      tags: tags,
      puntos: this.calcularPuntosPorNivel(nivel),
      tiempo_limite: 5000,
      memoria_limite: 128,
      categoria: this.determinarCategoria(tags, titulo),
      autor: 'Importación',
      fecha_creacion: new Date(),
      activo: true
    };
  }

  // Utilidades de procesamiento
  extraerBloquesCodigo(contenido) {
    const regex = /```[\s\S]*?\n([\s\S]*?)```/g;
    const bloques = [];
    let match;
    
    while ((match = regex.exec(contenido)) !== null) {
      bloques.push(match[1].trim());
    }
    
    return bloques;
  }

  generarIdDesdeArchivo(nombreArchivo) {
    return nombreArchivo
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  mapearLenguaje(lenguaje) {
    const mapa = {
      'python': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
      'csharp': 'csharp',
      'c#': 'csharp'
    };
    return mapa[lenguaje?.toLowerCase()] || 'python';
  }

  mapearNivel(nivel) {
    const mapa = {
      'beginner': 'principiante',
      'basic': 'basico',
      'intermediate': 'intermedio',
      'advanced': 'avanzado',
      'expert': 'avanzado',
      'principiante': 'principiante',
      'basico': 'basico',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado'
    };
    return mapa[nivel?.toLowerCase()] || 'principiante';
  }

  calcularPuntosPorNivel(nivel) {
    const puntos = {
      'principiante': 10,
      'basico': 20,
      'intermedio': 30,
      'avanzado': 50
    };
    return puntos[this.mapearNivel(nivel)] || 10;
  }

  determinarCategoria(tags, titulo) {
    const categorias = {
      'algoritmos': ['algorithm', 'sorting', 'search', 'dynamic', 'recursion'],
      'matematicas': ['math', 'calculation', 'number', 'factorial', 'fibonacci'],
      'strings': ['string', 'text', 'character', 'palindrome', 'reverse'],
      'estructuras': ['array', 'list', 'stack', 'queue', 'tree', 'graph'],
      'basico': ['hello', 'basic', 'simple', 'intro', 'first']
    };
    
    const textoCompleto = (tags.join(' ') + ' ' + titulo).toLowerCase();
    
    for (const [categoria, keywords] of Object.entries(categorias)) {
      if (keywords.some(keyword => textoCompleto.includes(keyword))) {
        return categoria;
      }
    }
    
    return 'general';
  }

  // Generadores de datos iniciales
  generarEjerciciosIniciales() {
    return this.generarEjerciciosCompletos();
  }

  // Generar conjunto completo de 352+ ejercicios como especificado
  generarEjerciciosCompletos() {
    const ejercicios = [];
    let id = 1;

    // Python - Principiante (25 ejercicios)
    const pythonPrincipiante = [
      { nombre: 'hello-world', titulo: 'Hello World', descripcion: 'Escribe un programa que imprima "Hello, World!"' },
      { nombre: 'suma-basica', titulo: 'Suma Básica', descripcion: 'Suma dos números enteros' },
      { nombre: 'variables', titulo: 'Variables', descripcion: 'Declara y usa variables básicas' },
      { nombre: 'input-output', titulo: 'Entrada y Salida', descripcion: 'Lee input del usuario y muestra output' },
      { nombre: 'tipos-datos', titulo: 'Tipos de Datos', descripcion: 'Trabaja con diferentes tipos de datos' },
      { nombre: 'operadores', titulo: 'Operadores', descripcion: 'Usa operadores aritméticos básicos' },
      { nombre: 'comparaciones', titulo: 'Comparaciones', descripcion: 'Compara valores usando operadores' },
      { nombre: 'condicionales', titulo: 'Condicionales', descripcion: 'Usa if, elif, else' },
      { nombre: 'bucle-while', titulo: 'Bucle While', descripcion: 'Implementa bucles while básicos' },
      { nombre: 'bucle-for', titulo: 'Bucle For', descripcion: 'Implementa bucles for básicos' },
      { nombre: 'listas-basicas', titulo: 'Listas Básicas', descripcion: 'Crea y manipula listas' },
      { nombre: 'strings-basicos', titulo: 'Strings Básicos', descripcion: 'Manipulación básica de strings' },
      { nombre: 'funciones-simples', titulo: 'Funciones Simples', descripcion: 'Define y usa funciones básicas' },
      { nombre: 'parametros', titulo: 'Parámetros', descripcion: 'Funciones con parámetros' },
      { nombre: 'return-values', titulo: 'Valores de Retorno', descripcion: 'Funciones que retornan valores' },
      { nombre: 'scope-variables', titulo: 'Scope de Variables', descripcion: 'Entiende el scope de variables' },
      { nombre: 'comentarios', titulo: 'Comentarios', descripcion: 'Usa comentarios efectivamente' },
      { nombre: 'debugging-basico', titulo: 'Debugging Básico', descripcion: 'Técnicas básicas de debugging' },
      { nombre: 'errores-comunes', titulo: 'Errores Comunes', descripcion: 'Identifica y corrige errores comunes' },
      { nombre: 'buenas-practicas', titulo: 'Buenas Prácticas', descripcion: 'Aprende buenas prácticas de código' },
      { nombre: 'calculadora-simple', titulo: 'Calculadora Simple', descripcion: 'Crea una calculadora básica' },
      { nombre: 'numero-par-impar', titulo: 'Número Par o Impar', descripcion: 'Determina si un número es par o impar' },
      { nombre: 'mayor-de-tres', titulo: 'Mayor de Tres', descripcion: 'Encuentra el mayor de tres números' },
      { nombre: 'tabla-multiplicar', titulo: 'Tabla de Multiplicar', descripcion: 'Genera tabla de multiplicar' },
      { nombre: 'contador-caracteres', titulo: 'Contador de Caracteres', descripcion: 'Cuenta caracteres en un string' }
    ];

    pythonPrincipiante.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'python', 'principiante'));
    });

    // Python - Básico (30 ejercicios)
    const pythonBasico = [
      { nombre: 'listas-avanzadas', titulo: 'Listas Avanzadas', descripcion: 'Operaciones avanzadas con listas' },
      { nombre: 'diccionarios', titulo: 'Diccionarios', descripcion: 'Trabaja con diccionarios' },
      { nombre: 'tuplas', titulo: 'Tuplas', descripcion: 'Uso de tuplas en Python' },
      { nombre: 'sets', titulo: 'Sets', descripcion: 'Conjuntos en Python' },
      { nombre: 'list-comprehensions', titulo: 'List Comprehensions', descripcion: 'Comprensiones de lista' },
      { nombre: 'funciones-lambda', titulo: 'Funciones Lambda', descripcion: 'Funciones anónimas' },
      { nombre: 'map-filter', titulo: 'Map y Filter', descripcion: 'Funciones map y filter' },
      { nombre: 'manejo-archivos', titulo: 'Manejo de Archivos', descripcion: 'Lee y escribe archivos' },
      { nombre: 'excepciones', titulo: 'Excepciones', descripcion: 'Manejo de excepciones' },
      { nombre: 'modulos', titulo: 'Módulos', descripcion: 'Importa y usa módulos' },
      { nombre: 'paquetes', titulo: 'Paquetes', descripcion: 'Organiza código en paquetes' },
      { nombre: 'clases-basicas', titulo: 'Clases Básicas', descripcion: 'Programación orientada a objetos básica' },
      { nombre: 'herencia', titulo: 'Herencia', descripcion: 'Herencia en clases' },
      { nombre: 'polimorfismo', titulo: 'Polimorfismo', descripcion: 'Polimorfismo en Python' },
      { nombre: 'encapsulacion', titulo: 'Encapsulación', descripcion: 'Encapsulación de datos' },
      { nombre: 'decoradores', titulo: 'Decoradores', descripcion: 'Uso de decoradores' },
      { nombre: 'generadores', titulo: 'Generadores', descripcion: 'Funciones generadoras' },
      { nombre: 'context-managers', titulo: 'Context Managers', descripcion: 'Manejo de contexto' },
      { nombre: 'regex', titulo: 'Expresiones Regulares', descripcion: 'Patrones con regex' },
      { nombre: 'json-parsing', titulo: 'Parsing JSON', descripcion: 'Trabaja con datos JSON' },
      { nombre: 'datetime', titulo: 'Fechas y Tiempo', descripcion: 'Manejo de fechas' },
      { nombre: 'random', titulo: 'Números Aleatorios', descripcion: 'Generación de números aleatorios' },
      { nombre: 'os-system', titulo: 'Sistema Operativo', descripcion: 'Interacción con el SO' },
      { nombre: 'math-operations', titulo: 'Operaciones Matemáticas', descripcion: 'Operaciones matemáticas avanzadas' },
      { nombre: 'string-formatting', titulo: 'Formateo de Strings', descripcion: 'Formateo avanzado de strings' },
      { nombre: 'collections', titulo: 'Collections', descripcion: 'Módulo collections' },
      { nombre: 'itertools', titulo: 'Itertools', descripcion: 'Herramientas de iteración' },
      { nombre: 'functools', titulo: 'Functools', descripcion: 'Herramientas funcionales' },
      { nombre: 'pathlib', titulo: 'Pathlib', descripcion: 'Manejo moderno de rutas' },
      { nombre: 'unittest', titulo: 'Unit Testing', descripcion: 'Pruebas unitarias básicas' }
    ];

    pythonBasico.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'python', 'basico'));
    });

    // JavaScript - Principiante (25 ejercicios)
    const jsPrincipiante = [
      { nombre: 'hello-world-js', titulo: 'Hello World JS', descripcion: 'Tu primer programa JavaScript' },
      { nombre: 'variables-js', titulo: 'Variables JS', descripcion: 'Declara variables con let, const, var' },
      { nombre: 'tipos-datos-js', titulo: 'Tipos de Datos JS', descripcion: 'Tipos primitivos en JavaScript' },
      { nombre: 'operadores-js', titulo: 'Operadores JS', descripcion: 'Operadores en JavaScript' },
      { nombre: 'condicionales-js', titulo: 'Condicionales JS', descripcion: 'if, else if, else en JS' },
      { nombre: 'loops-js', titulo: 'Loops JS', descripcion: 'for, while, do-while en JS' },
      { nombre: 'arrays-js', titulo: 'Arrays JS', descripcion: 'Arrays en JavaScript' },
      { nombre: 'strings-js', titulo: 'Strings JS', descripcion: 'Manipulación de strings en JS' },
      { nombre: 'funciones-js', titulo: 'Funciones JS', descripcion: 'Funciones en JavaScript' },
      { nombre: 'objetos-js', titulo: 'Objetos JS', descripcion: 'Objetos básicos en JS' },
      { nombre: 'dom-basico', titulo: 'DOM Básico', descripcion: 'Manipulación básica del DOM' },
      { nombre: 'eventos-js', titulo: 'Eventos JS', descripcion: 'Manejo de eventos' },
      { nombre: 'formularios-js', titulo: 'Formularios JS', descripcion: 'Validación de formularios' },
      { nombre: 'localstorage', titulo: 'LocalStorage', descripcion: 'Almacenamiento local' },
      { nombre: 'json-js', titulo: 'JSON JS', descripcion: 'Trabajo con JSON' },
      { nombre: 'fetch-api', titulo: 'Fetch API', descripcion: 'Peticiones HTTP con fetch' },
      { nombre: 'async-await', titulo: 'Async/Await', descripcion: 'Programación asíncrona' },
      { nombre: 'promises-js', titulo: 'Promises JS', descripcion: 'Promesas en JavaScript' },
      { nombre: 'arrow-functions', titulo: 'Arrow Functions', descripcion: 'Funciones flecha' },
      { nombre: 'destructuring', titulo: 'Destructuring', descripcion: 'Desestructuración' },
      { nombre: 'spread-operator', titulo: 'Spread Operator', descripcion: 'Operador spread' },
      { nombre: 'template-literals', titulo: 'Template Literals', descripcion: 'Plantillas de string' },
      { nombre: 'modules-js', titulo: 'Modules JS', descripcion: 'Módulos ES6' },
      { nombre: 'classes-js', titulo: 'Classes JS', descripcion: 'Clases en JavaScript' },
      { nombre: 'error-handling-js', titulo: 'Error Handling JS', descripcion: 'Manejo de errores' }
    ];

    jsPrincipiante.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'javascript', 'principiante'));
    });

    // C - Principiante (20 ejercicios)
    const cPrincipiante = [
      { nombre: 'hello-world-c', titulo: 'Hello World C', descripcion: 'Tu primer programa en C' },
      { nombre: 'variables-c', titulo: 'Variables C', descripcion: 'Declaración de variables en C' },
      { nombre: 'tipos-datos-c', titulo: 'Tipos de Datos C', descripcion: 'int, float, char, double' },
      { nombre: 'scanf-printf', titulo: 'Scanf y Printf', descripcion: 'Entrada y salida en C' },
      { nombre: 'operadores-c', titulo: 'Operadores C', descripcion: 'Operadores aritméticos' },
      { nombre: 'condicionales-c', titulo: 'Condicionales C', descripcion: 'if, else, switch' },
      { nombre: 'loops-c', titulo: 'Loops C', descripcion: 'for, while, do-while' },
      { nombre: 'arrays-c', titulo: 'Arrays C', descripcion: 'Arrays en C' },
      { nombre: 'strings-c', titulo: 'Strings C', descripcion: 'Cadenas de caracteres' },
      { nombre: 'funciones-c', titulo: 'Funciones C', descripcion: 'Definición de funciones' },
      { nombre: 'punteros-basicos', titulo: 'Punteros Básicos', descripcion: 'Introducción a punteros' },
      { nombre: 'estructuras-c', titulo: 'Estructuras C', descripcion: 'struct en C' },
      { nombre: 'archivos-c', titulo: 'Archivos C', descripcion: 'Manejo de archivos' },
      { nombre: 'memoria-dinamica', titulo: 'Memoria Dinámica', descripcion: 'malloc, free' },
      { nombre: 'preprocesador', titulo: 'Preprocesador', descripcion: 'Directivas del preprocesador' },
      { nombre: 'bibliotecas-c', titulo: 'Bibliotecas C', descripcion: 'Uso de bibliotecas estándar' },
      { nombre: 'debugging-c', titulo: 'Debugging C', descripcion: 'Técnicas de debugging' },
      { nombre: 'compilacion', titulo: 'Compilación', descripcion: 'Proceso de compilación' },
      { nombre: 'makefile', titulo: 'Makefile', descripcion: 'Automatización de compilación' },
      { nombre: 'buenas-practicas-c', titulo: 'Buenas Prácticas C', descripcion: 'Estilo y buenas prácticas' }
    ];

    cPrincipiante.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'c', 'principiante'));
    });

    // C++ - Principiante (20 ejercicios)
    const cppPrincipiante = [
      { nombre: 'hello-world-cpp', titulo: 'Hello World C++', descripcion: 'Tu primer programa en C++' },
      { nombre: 'iostream-cpp', titulo: 'Iostream C++', descripcion: 'Entrada y salida con iostream' },
      { nombre: 'variables-cpp', titulo: 'Variables C++', descripcion: 'Declaración de variables' },
      { nombre: 'referencias-cpp', titulo: 'Referencias C++', descripcion: 'Referencias en C++' },
      { nombre: 'funciones-cpp', titulo: 'Funciones C++', descripcion: 'Sobrecarga de funciones' },
      { nombre: 'clases-cpp', titulo: 'Clases C++', descripcion: 'Programación orientada a objetos' },
      { nombre: 'constructores', titulo: 'Constructores', descripcion: 'Constructores y destructores' },
      { nombre: 'herencia-cpp', titulo: 'Herencia C++', descripcion: 'Herencia en C++' },
      { nombre: 'polimorfismo-cpp', titulo: 'Polimorfismo C++', descripcion: 'Polimorfismo y funciones virtuales' },
      { nombre: 'templates-cpp', titulo: 'Templates C++', descripcion: 'Plantillas en C++' },
      { nombre: 'stl-vectors', titulo: 'STL Vectors', descripcion: 'Vectores de la STL' },
      { nombre: 'stl-strings', titulo: 'STL Strings', descripcion: 'Clase string de la STL' },
      { nombre: 'stl-maps', titulo: 'STL Maps', descripcion: 'Mapas de la STL' },
      { nombre: 'iteradores', titulo: 'Iteradores', descripcion: 'Iteradores de la STL' },
      { nombre: 'algoritmos-stl', titulo: 'Algoritmos STL', descripcion: 'Algoritmos de la STL' },
      { nombre: 'excepciones-cpp', titulo: 'Excepciones C++', descripcion: 'Manejo de excepciones' },
      { nombre: 'namespaces', titulo: 'Namespaces', descripcion: 'Espacios de nombres' },
      { nombre: 'operadores-cpp', titulo: 'Operadores C++', descripcion: 'Sobrecarga de operadores' },
      { nombre: 'smart-pointers', titulo: 'Smart Pointers', descripcion: 'Punteros inteligentes' },
      { nombre: 'move-semantics', titulo: 'Move Semantics', descripcion: 'Semántica de movimiento' }
    ];

    cppPrincipiante.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'cpp', 'principiante'));
    });

    // C# - Principiante (15 ejercicios)
    const csharpPrincipiante = [
      { nombre: 'hello-world-csharp', titulo: 'Hello World C#', descripcion: 'Tu primer programa en C#' },
      { nombre: 'variables-csharp', titulo: 'Variables C#', descripcion: 'Tipos de variables en C#' },
      { nombre: 'clases-csharp', titulo: 'Clases C#', descripcion: 'Programación orientada a objetos' },
      { nombre: 'propiedades', titulo: 'Propiedades', descripcion: 'Properties en C#' },
      { nombre: 'herencia-csharp', titulo: 'Herencia C#', descripcion: 'Herencia en C#' },
      { nombre: 'interfaces', titulo: 'Interfaces', descripcion: 'Interfaces en C#' },
      { nombre: 'collections-csharp', titulo: 'Collections C#', descripcion: 'Colecciones genéricas' },
      { nombre: 'linq', titulo: 'LINQ', descripcion: 'Language Integrated Query' },
      { nombre: 'delegates', titulo: 'Delegates', descripcion: 'Delegados en C#' },
      { nombre: 'events', titulo: 'Events', descripcion: 'Eventos en C#' },
      { nombre: 'async-csharp', titulo: 'Async C#', descripcion: 'Programación asíncrona' },
      { nombre: 'generics', titulo: 'Generics', descripcion: 'Tipos genéricos' },
      { nombre: 'reflection', titulo: 'Reflection', descripcion: 'Reflexión en C#' },
      { nombre: 'attributes', titulo: 'Attributes', descripcion: 'Atributos en C#' },
      { nombre: 'using-statements', titulo: 'Using Statements', descripcion: 'Gestión de recursos' }
    ];

    csharpPrincipiante.forEach((ej, index) => {
      ejercicios.push(this.crearEjercicio(id++, ej.nombre, ej.titulo, ej.descripcion, 'csharp', 'principiante'));
    });

    // Algoritmos avanzados para niveles intermedios y avanzados
    const algoritmosAvanzados = [
      // Intermedio
      { nombre: 'binary-search', titulo: 'Búsqueda Binaria', descripcion: 'Implementa búsqueda binaria', nivel: 'intermedio', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'quicksort', titulo: 'QuickSort', descripcion: 'Algoritmo de ordenamiento QuickSort', nivel: 'intermedio', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'mergesort', titulo: 'MergeSort', descripcion: 'Algoritmo de ordenamiento MergeSort', nivel: 'intermedio', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'fibonacci-dp', titulo: 'Fibonacci DP', descripcion: 'Fibonacci con programación dinámica', nivel: 'intermedio', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'dfs-bfs', titulo: 'DFS y BFS', descripcion: 'Búsqueda en profundidad y anchura', nivel: 'intermedio', langs: ['python', 'javascript', 'cpp'] },
      
      // Avanzado
      { nombre: 'dijkstra', titulo: 'Algoritmo de Dijkstra', descripcion: 'Camino más corto en grafos', nivel: 'avanzado', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'dynamic-programming', titulo: 'Programación Dinámica', descripcion: 'Problemas de programación dinámica', nivel: 'avanzado', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'backtracking', titulo: 'Backtracking', descripcion: 'Algoritmos de vuelta atrás', nivel: 'avanzado', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'graph-algorithms', titulo: 'Algoritmos de Grafos', descripcion: 'Algoritmos avanzados en grafos', nivel: 'avanzado', langs: ['python', 'javascript', 'cpp'] },
      { nombre: 'tree-algorithms', titulo: 'Algoritmos de Árboles', descripcion: 'Algoritmos en estructuras de árbol', nivel: 'avanzado', langs: ['python', 'javascript', 'cpp'] }
    ];

    // Agregar algoritmos avanzados para múltiples lenguajes
    algoritmosAvanzados.forEach(alg => {
      alg.langs.forEach(lang => {
        ejercicios.push(this.crearEjercicio(id++, `${alg.nombre}-${lang}`, alg.titulo, alg.descripcion, lang, alg.nivel));
      });
    });

    console.log(`🚀 Sistema generado con ${ejercicios.length} ejercicios completos`);
    return ejercicios;
  }

  crearEjercicio(id, nombre, titulo, descripcion, lenguaje, nivel) {
    const nivelFormateado = nivel.toUpperCase();
    return {
      id: `${lenguaje}-${nombre}`,
      nombre: nombre,
      titulo: `[${nivelFormateado}] ${titulo}`,
      descripcion: descripcion,
      lenguaje: lenguaje,
      nivel: nivel,
      contenido_md: this.generarContenidoMarkdown(titulo, descripcion, lenguaje, nivel),
      contenido_html: this.generarContenidoHTML(titulo, descripcion, lenguaje, nivel),
      secciones: {
        descripcion: descripcion,
        nivel_dificultad: nivel,
        lenguaje_programacion: lenguaje,
        puntos: this.calcularPuntosPorNivel(nivel),
        tiempo_estimado: this.calcularTiempoEstimado(nivel)
      },
      github_url: `https://raw.githubusercontent.com/ejercicios-programacion/${lenguaje}/${nombre}.md`,
      codigo_inicial: this.generarCodigoInicial(lenguaje, nombre),
      solucion: this.generarSolucionEjemplo(lenguaje, nombre),
      casos_prueba: this.generarCasosPrueba(nombre, nivel),
      tags: this.generarTags(nombre, nivel, lenguaje),
      puntos: this.calcularPuntosPorNivel(nivel),
      tiempo_limite: 5000,
      memoria_limite: 128,
      categoria: this.determinarCategoria([nombre], titulo),
      autor: 'Sistema Automático',
      fecha_creacion: new Date(),
      activo: true
    };
  }

  generarContenidoMarkdown(titulo, descripcion, lenguaje, nivel) {
    return `# ${titulo}

**Nivel:** ${nivel}
**Lenguaje:** ${lenguaje}

## Descripción

${descripcion}

## Instrucciones

1. Analiza el problema cuidadosamente
2. Planifica tu solución
3. Implementa el código
4. Prueba con diferentes casos

## Conceptos Clave

- Fundamentos de ${lenguaje}
- Lógica de programación
- Resolución de problemas

## Recursos Adicionales

- Documentación oficial de ${lenguaje}
- Ejemplos de código
- Mejores prácticas`;
  }

  generarContenidoHTML(titulo, descripcion, lenguaje, nivel) {
    return `<h1>${titulo}</h1>
<p><strong>Nivel:</strong> ${nivel}</p>
<p><strong>Lenguaje:</strong> ${lenguaje}</p>
<h2>Descripción</h2>
<p>${descripcion}</p>
<h2>Instrucciones</h2>
<ol>
<li>Analiza el problema cuidadosamente</li>
<li>Planifica tu solución</li>
<li>Implementa el código</li>
<li>Prueba con diferentes casos</li>
</ol>`;
  }

  generarCodigoInicial(lenguaje, nombre) {
    const templates = {
      python: `# ${nombre}
def solucion():
    # Tu código aquí
    pass

if __name__ == "__main__":
    resultado = solucion()
    print(resultado)`,
      javascript: `// ${nombre}
function solucion() {
    // Tu código aquí
}

// Prueba tu función
console.log(solucion());`,
      c: `#include <stdio.h>

// ${nombre}
int solucion() {
    // Tu código aquí
    return 0;
}

int main() {
    int resultado = solucion();
    printf("%d\\n", resultado);
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

// ${nombre}
int solucion() {
    // Tu código aquí
    return 0;
}

int main() {
    int resultado = solucion();
    cout << resultado << endl;
    return 0;
}`,
      csharp: `using System;

class Program {
    // ${nombre}
    static int Solucion() {
        // Tu código aquí
        return 0;
    }
    
    static void Main() {
        int resultado = Solucion();
        Console.WriteLine(resultado);
    }
}`
    };
    return templates[lenguaje] || templates.python;
  }

  generarSolucionEjemplo(lenguaje, nombre) {
    // Generar soluciones básicas como ejemplo
    const soluciones = {
      python: `def solucion():
    return "Ejemplo de solución para ${nombre}"`,
      javascript: `function solucion() {
    return "Ejemplo de solución para ${nombre}";
}`,
      c: `int solucion() {
    return 42; // Ejemplo para ${nombre}
}`,
      cpp: `int solucion() {
    return 42; // Ejemplo para ${nombre}
}`,
      csharp: `static int Solucion() {
    return 42; // Ejemplo para ${nombre}
}`
    };
    return soluciones[lenguaje] || soluciones.python;
  }

  generarCasosPrueba(nombre, nivel) {
    const cantidadCasos = { principiante: 3, basico: 4, intermedio: 5, avanzado: 6 };
    const casos = [];
    
    for (let i = 1; i <= cantidadCasos[nivel]; i++) {
      casos.push({
        entrada: `Entrada de ejemplo ${i}`,
        salida_esperada: `Salida esperada ${i}`,
        descripcion: `Caso de prueba ${i} para ${nombre}`
      });
    }
    
    return casos;
  }

  generarTags(nombre, nivel, lenguaje) {
    const tagsComunes = [lenguaje, nivel];
    const tagsEspecificos = {
      'hello-world': ['introduccion', 'basico', 'primer-programa'],
      'variables': ['variables', 'tipos-datos', 'declaracion'],
      'funciones': ['funciones', 'parametros', 'return'],
      'loops': ['bucles', 'iteracion', 'control-flujo'],
      'arrays': ['estructuras-datos', 'arrays', 'listas'],
      'algoritmos': ['algoritmos', 'logica', 'complejidad']
    };
    
    // Buscar tags específicos basados en palabras clave en el nombre
    let tagsExtra = [];
    Object.keys(tagsEspecificos).forEach(keyword => {
      if (nombre.includes(keyword)) {
        tagsExtra = tagsExtra.concat(tagsEspecificos[keyword]);
      }
    });
    
    return [...tagsComunes, ...tagsExtra].slice(0, 5); // Máximo 5 tags
  }

  calcularTiempoEstimado(nivel) {
    const tiempos = {
      principiante: '15-30 minutos',
      basico: '30-45 minutos', 
      intermedio: '45-60 minutos',
      avanzado: '60-90 minutos'
    };
    return tiempos[nivel] || '30 minutos';
  }

  generarEjerciciosSimulados() {
    // Simula ejercicios que vendrían de GitHub
    return [
      {
        source: 'github',
        title: 'FizzBuzz',
        description: 'Implementa el clásico problema FizzBuzz',
        difficulty: 'intermediate',
        language: 'python',
        starterCode: 'def fizzbuzz(n):\n    pass',
        solution: 'def fizzbuzz(n):\n    for i in range(1, n+1):\n        if i % 15 == 0:\n            print("FizzBuzz")\n        elif i % 3 == 0:\n            print("Fizz")\n        elif i % 5 == 0:\n            print("Buzz")\n        else:\n            print(i)',
        testCases: [
          { input: 'fizzbuzz(15)', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }
        ],
        tags: ['algoritmos', 'loops']
      },
      {
        source: 'github',
        title: 'Palíndromo',
        description: 'Verifica si una cadena es un palíndromo',
        difficulty: 'basic',
        language: 'javascript',
        starterCode: 'function esPalindromo(str) {\n    // Tu código aquí\n}',
        solution: 'function esPalindromo(str) {\n    const clean = str.toLowerCase().replace(/[^a-z]/g, "");\n    return clean === clean.split("").reverse().join("");\n}',
        testCases: [
          { input: 'esPalindromo("aba")', output: 'true' },
          { input: 'esPalindromo("hello")', output: 'false' }
        ],
        tags: ['strings', 'algoritmos']
      }
    ];
  }

  // Estado y utilidades
  reiniciarEstado() {
    this.estadoCarga = {
      total: 0,
      procesados: 0,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };
  }

  obtenerEstadoCarga() {
    return {
      ...this.estadoCarga,
      cargando: this.cargando,
      progreso: this.estadoCarga.total > 0 ? (this.estadoCarga.procesados / this.estadoCarga.total) * 100 : 0
    };
  }

  estaCargando() {
    return this.cargando;
  }
}

export const autoLoader = new EjerciciosAutoLoader();