# Integración con GitHub - CodeGym

Esta documentación explica cómo integrar tu herramienta de Node.js que importa ejercicios desde GitHub con la plataforma CodeGym.

## Endpoints Disponibles

### 1. Importar ejercicios desde JSON
```
POST /api/admin/import/exercises
Content-Type: application/json
Authentication: Required (Replit Auth)
```

**Body:**
```json
{
  "exercises": [
    {
      "title": "Suma de dos números",
      "description": "Implementa una función que sume dos números enteros",
      "difficulty": "beginner",
      "language": "python",
      "starterCode": "def suma(a, b):\n    pass",
      "solution": "def suma(a, b):\n    return a + b",
      "testCases": [
        {"input": "1, 2", "output": "3"},
        {"input": "5, 7", "output": "12"}
      ],
      "tags": ["matemáticas", "básico"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "exercisesImported": 1,
  "languagesCreated": 0,
  "errors": [],
  "details": {
    "exercises": [
      {"title": "Suma de dos números", "slug": "suma-de-dos-numeros", "status": "created"}
    ],
    "languages": [
      {"name": "python", "slug": "python", "status": "existing"}
    ]
  }
}
```

### 2. Parsear Markdown individual
```
POST /api/admin/import/parse-markdown
Content-Type: application/json
Authentication: Required
```

**Body:**
```json
{
  "markdownContent": "# Suma de dos números\n\nImplementa una función...",
  "filename": "suma.py.md"
}
```

### 3. Importación masiva desde Markdown
```
POST /api/admin/import/batch-markdown
Content-Type: application/json
Authentication: Required
```

**Body:**
```json
{
  "files": [
    {
      "content": "# Ejercicio 1\n\nDescripción...",
      "filename": "ejercicio1.py.md"
    },
    {
      "content": "# Ejercicio 2\n\nDescripción...",
      "filename": "ejercicio2.js.md"
    }
  ]
}
```

## Formato de Ejercicio

### Campos requeridos:
- `title`: Título del ejercicio
- `description`: Descripción detallada
- `difficulty`: "beginner" | "intermediate" | "advanced" | "expert"
- `language`: "python" | "javascript" | "java" | "cpp" | "c" | "csharp"

### Campos opcionales:
- `starterCode`: Código inicial para el estudiante
- `solution`: Solución completa del ejercicio
- `testCases`: Array de casos de prueba con input/output
- `tags`: Array de etiquetas para categorización

## Ejemplo de Integración con Node.js

```javascript
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class CodeGymImporter {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  // Importar ejercicios desde un array JSON
  async importExercises(exercises) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/admin/import/exercises`, {
        exercises: exercises
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Para mantener la sesión de autenticación
      });
      
      return response.data;
    } catch (error) {
      console.error('Error importing exercises:', error.response?.data || error.message);
      throw error;
    }
  }

  // Parsear un archivo Markdown individual
  async parseMarkdown(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      const response = await axios.post(`${this.baseUrl}/api/admin/import/parse-markdown`, {
        markdownContent: content,
        filename: filename
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      return response.data.exercise;
    } catch (error) {
      console.error('Error parsing markdown:', error.response?.data || error.message);
      throw error;
    }
  }

  // Importación masiva desde directorio de archivos Markdown
  async batchImportFromDirectory(directoryPath) {
    try {
      const files = await fs.readdir(directoryPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      const fileContents = await Promise.all(
        markdownFiles.map(async (filename) => {
          const content = await fs.readFile(path.join(directoryPath, filename), 'utf8');
          return { content, filename };
        })
      );

      const response = await axios.post(`${this.baseUrl}/api/admin/import/batch-markdown`, {
        files: fileContents
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in batch import:', error.response?.data || error.message);
      throw error;
    }
  }

  // Importar desde repositorio GitHub
  async importFromGitHub(repoUrl, branch = 'main', exercisesPath = 'exercises') {
    // Aquí implementarías la lógica para:
    // 1. Clonar o descargar el repositorio
    // 2. Buscar archivos .md en el directorio especificado
    // 3. Usar batchImportFromDirectory para importar
    
    console.log(`Importing from GitHub: ${repoUrl}`);
    // Tu implementación aquí...
  }
}

// Ejemplo de uso
async function main() {
  const importer = new CodeGymImporter();
  
  try {
    // Opción 1: Importar ejercicios directamente
    const exercises = [
      {
        title: "Factorial",
        description: "Calcula el factorial de un número",
        difficulty: "intermediate",
        language: "python",
        starterCode: "def factorial(n):\n    pass",
        testCases: [
          {"input": "5", "output": "120"},
          {"input": "0", "output": "1"}
        ]
      }
    ];
    
    const result = await importer.importExercises(exercises);
    console.log('Import result:', result);
    
    // Opción 2: Importar desde directorio local
    // const batchResult = await importer.batchImportFromDirectory('./exercises');
    // console.log('Batch import result:', batchResult);
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// main();
```

## Formato Markdown Soportado

El parseador de Markdown busca la siguiente estructura:

```markdown
---
difficulty: beginner
language: python
---

# Título del Ejercicio

Descripción detallada del ejercicio.
Puede incluir múltiples párrafos.

## Ejemplos

Input: 5
Output: 120

```python
def factorial(n):
    pass
```

## Solución

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```
```

### Campos del frontmatter:
- `difficulty`: Nivel de dificultad
- `language`: Lenguaje de programación

Si no se especifica el lenguaje en el frontmatter, se infiere de la extensión del archivo:
- `.py.md` → Python
- `.js.md` → JavaScript
- `.java.md` → Java
- `.cpp.md` → C++
- `.c.md` → C

## Autenticación

Los endpoints de importación requieren autenticación con Replit Auth. Asegúrate de:

1. Estar logueado en CodeGym
2. Incluir `withCredentials: true` en tus peticiones axios
3. O manejar las cookies de sesión manualmente

## Manejo de Errores

La API devuelve información detallada sobre errores:

```json
{
  "success": false,
  "exercisesImported": 2,
  "languagesCreated": 1,
  "errors": [
    "Ejercicio 3 (Sin título): El título es obligatorio",
    "Error importando ejercicio \"Ejercicio inválido\": Validation error"
  ],
  "details": {
    "exercises": [
      {"title": "Ejercicio 1", "slug": "ejercicio-1", "status": "created"},
      {"title": "Ejercicio 2", "slug": "ejercicio-2", "status": "updated"},
      {"title": "Ejercicio 3", "slug": "", "status": "error"}
    ]
  }
}
```

## Interfaz Web de Administración

También puedes usar la interfaz web en `/admin/import` para:

- Probar la importación con archivos individuales
- Ver el resultado detallado de las importaciones
- Validar el formato de tus ejercicios antes de automatizar

## Consideraciones de Rendimiento

- Para grandes volúmenes de ejercicios, usa la importación masiva
- Los slugs se generan automáticamente y se aseguran únicos
- Los lenguajes se crean automáticamente si no existen
- Los ejercicios existentes se actualizan en lugar de duplicarse

## Próximos Pasos

1. Configura tu herramienta de Node.js con los ejemplos proporcionados
2. Prueba la integración con algunos ejercicios de ejemplo
3. Implementa la lógica específica para tu repositorio GitHub
4. Automatiza el proceso según tus necesidades