/**
 * Ejemplo de integración con CodeGym para importar ejercicios desde GitHub
 * 
 * Este archivo muestra cómo conectar tu herramienta de Node.js con CodeGym
 * para importar ejercicios automáticamente desde repositorios de GitHub.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class CodeGymImporter {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      withCredentials: true, // Importante para mantener la sesión de autenticación
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Importa un array de ejercicios directamente a CodeGym
   */
  async importExercises(exercises) {
    try {
      console.log(`Importing ${exercises.length} exercises to CodeGym...`);
      
      const response = await this.axiosInstance.post('/api/admin/import/exercises', {
        exercises: exercises
      });
      
      const result = response.data;
      
      console.log('Import completed:');
      console.log(`- Exercises imported: ${result.exercisesImported}`);
      console.log(`- Languages created: ${result.languagesCreated}`);
      console.log(`- Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log('Errors encountered:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
      
      return result;
    } catch (error) {
      console.error('Failed to import exercises:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Convierte un archivo Markdown individual a formato de ejercicio
   */
  async parseMarkdown(markdownContent, filename) {
    try {
      const response = await this.axiosInstance.post('/api/admin/import/parse-markdown', {
        markdownContent,
        filename
      });
      
      return response.data.exercise;
    } catch (error) {
      console.error(`Failed to parse ${filename}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Importación masiva desde múltiples archivos Markdown
   */
  async batchImportMarkdown(files) {
    try {
      console.log(`Processing ${files.length} markdown files...`);
      
      const response = await this.axiosInstance.post('/api/admin/import/batch-markdown', {
        files
      });
      
      const result = response.data;
      
      console.log('Batch import completed:');
      console.log(`- Exercises imported: ${result.exercisesImported}`);
      console.log(`- Parse errors: ${result.parseErrors?.length || 0}`);
      
      return result;
    } catch (error) {
      console.error('Batch import failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Importa desde un directorio local con archivos Markdown
   */
  async importFromDirectory(directoryPath) {
    try {
      const files = await fs.readdir(directoryPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      console.log(`Found ${markdownFiles.length} markdown files in ${directoryPath}`);
      
      const fileContents = await Promise.all(
        markdownFiles.map(async (filename) => {
          const content = await fs.readFile(path.join(directoryPath, filename), 'utf8');
          return { content, filename };
        })
      );

      return await this.batchImportMarkdown(fileContents);
    } catch (error) {
      console.error('Directory import failed:', error.message);
      throw error;
    }
  }
}

/**
 * Ejemplo de uso básico
 */
async function basicExample() {
  const importer = new CodeGymImporter();
  
  // Ejemplo 1: Importar ejercicios directamente
  const exercises = [
    {
      title: "Suma de dos números",
      description: "Implementa una función que tome dos números enteros y devuelva su suma.",
      difficulty: "beginner",
      language: "python",
      starterCode: "def suma(a, b):\n    # Tu código aquí\n    pass",
      solution: "def suma(a, b):\n    return a + b",
      testCases: [
        { input: "2, 3", output: "5" },
        { input: "0, 0", output: "0" },
        { input: "-1, 1", output: "0" }
      ],
      tags: ["matemáticas", "básico", "funciones"]
    },
    {
      title: "Factorial de un número",
      description: "Calcula el factorial de un número entero no negativo.",
      difficulty: "intermediate",
      language: "python",
      starterCode: "def factorial(n):\n    # Tu código aquí\n    pass",
      solution: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
      testCases: [
        { input: "5", output: "120" },
        { input: "0", output: "1" },
        { input: "3", output: "6" }
      ],
      tags: ["matemáticas", "recursión", "algoritmos"]
    }
  ];
  
  try {
    const result = await importer.importExercises(exercises);
    console.log('Import successful!', result);
  } catch (error) {
    console.error('Import failed:', error);
  }
}

/**
 * Ejemplo para importar desde directorio local
 */
async function directoryImportExample() {
  const importer = new CodeGymImporter();
  
  try {
    // Asume que tienes una carpeta "exercises" con archivos .md
    const result = await importer.importFromDirectory('./exercises');
    console.log('Directory import successful!', result);
  } catch (error) {
    console.error('Directory import failed:', error);
  }
}

/**
 * Función para simular la integración con GitHub
 * Puedes adaptar esto para usar la API de GitHub o tu herramienta específica
 */
async function githubIntegrationExample() {
  const importer = new CodeGymImporter();
  
  // Simula la descarga de archivos desde GitHub
  const githubFiles = [
    {
      filename: "sum.py.md",
      content: `---
difficulty: beginner
language: python
---

# Suma de dos números

Implementa una función que sume dos números enteros.

## Ejemplo

Input: 2, 3
Output: 5

\`\`\`python
def suma(a, b):
    # Tu código aquí
    pass
\`\`\`

## Solución

\`\`\`python
def suma(a, b):
    return a + b
\`\`\``
    },
    {
      filename: "fibonacci.js.md",
      content: `---
difficulty: intermediate
language: javascript
---

# Secuencia de Fibonacci

Genera el n-ésimo número de la secuencia de Fibonacci.

## Ejemplo

Input: 7
Output: 13

\`\`\`javascript
function fibonacci(n) {
    // Tu código aquí
}
\`\`\`

## Solución

\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\``
    }
  ];
  
  try {
    const result = await importer.batchImportMarkdown(githubFiles);
    console.log('GitHub import successful!', result);
  } catch (error) {
    console.error('GitHub import failed:', error);
  }
}

/**
 * Función de utilidad para validar ejercicios antes de importar
 */
function validateExercise(exercise) {
  const errors = [];
  
  if (!exercise.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!exercise.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(exercise.difficulty)) {
    errors.push('Difficulty must be: beginner, intermediate, advanced, or expert');
  }
  
  if (!['python', 'javascript', 'java', 'cpp', 'c', 'csharp'].includes(exercise.language)) {
    errors.push('Language must be: python, javascript, java, cpp, c, or csharp');
  }
  
  return errors;
}

/**
 * Ejemplo con validación previa
 */
async function validatedImportExample() {
  const importer = new CodeGymImporter();
  
  const exercises = [
    {
      title: "Palíndromo",
      description: "Verifica si una cadena es un palíndromo",
      difficulty: "intermediate",
      language: "python",
      starterCode: "def es_palindromo(s):\n    pass",
      testCases: [
        { input: "'aba'", output: "True" },
        { input: "'hello'", output: "False" }
      ]
    }
  ];
  
  // Validar antes de importar
  const validExercises = [];
  for (const exercise of exercises) {
    const errors = validateExercise(exercise);
    if (errors.length === 0) {
      validExercises.push(exercise);
    } else {
      console.log(`Invalid exercise "${exercise.title}":`, errors);
    }
  }
  
  if (validExercises.length > 0) {
    try {
      const result = await importer.importExercises(validExercises);
      console.log('Validated import successful!', result);
    } catch (error) {
      console.error('Import failed:', error);
    }
  }
}

// Exportar para uso en otros archivos
module.exports = {
  CodeGymImporter,
  validateExercise,
  basicExample,
  directoryImportExample,
  githubIntegrationExample,
  validatedImportExample
};

// Ejecutar ejemplo si se ejecuta directamente
if (require.main === module) {
  console.log('=== CodeGym GitHub Integration Example ===\n');
  
  // Descomenta el ejemplo que quieras probar:
  
  // basicExample();
  // directoryImportExample();
  // githubIntegrationExample();
  // validatedImportExample();
  
  console.log('\nUncomment one of the example functions above to test the integration.');
  console.log('Make sure CodeGym is running on http://localhost:5000');
  console.log('and that you are authenticated in the browser first.');
}