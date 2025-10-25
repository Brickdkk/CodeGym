import { storage } from "./storage.js";
import type { InsertExercise } from "../shared/schema.js";

/**
 * Massive exercise generator for comprehensive platform loading
 * Generates 40 exercises per difficulty per language
 */
export class MassiveExerciseGenerator {
  private difficultyMap = {
    'beginner': 'easy',
    'intermediate': 'medium', 
    'advanced': 'hard'
  };

  private generateExerciseByLanguageAndDifficulty(
    languageSlug: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced', 
    index: number
  ) {
    const difficultyLevel = this.difficultyMap[difficulty];
    const basePoints = { easy: 10, medium: 20, hard: 30 };
    
    const exerciseTemplates = {
      python: {
        beginner: [
          { 
            title: `Variables y Tipos ${index}`,
            description: `Ejercicio ${index}: Crea variables de diferentes tipos y realiza operaciones básicas.`,
            starterCode: `# Ejercicio ${index}: Variables y tipos\n# TODO: Implementa tu solución aquí\n`,
            solution: `x = ${index}\ny = "${index}"\nz = ${index}.5\nresult = x + z\nprint(result)`,
            testCases: [
              { input: "", expected: `${index + 0.5}` }
            ]
          }
        ],
        intermediate: [
          {
            title: `Funciones Avanzadas ${index}`,
            description: `Ejercicio ${index}: Implementa una función que procese listas y diccionarios.`,
            starterCode: `# Ejercicio ${index}: Funciones avanzadas\ndef process_data(data):\n    # TODO: Implementa tu solución aquí\n    pass\n`,
            solution: `def process_data(data):\n    return [x * ${index} for x in data if x > 0]`,
            testCases: [
              { input: "[1, -2, 3, 4]", expected: `[${index}, ${3*index}, ${4*index}]` }
            ]
          }
        ],
        advanced: [
          {
            title: `Algoritmos Complejos ${index}`,
            description: `Ejercicio ${index}: Implementa un algoritmo de ordenamiento optimizado.`,
            starterCode: `# Ejercicio ${index}: Algoritmos complejos\ndef advanced_sort(arr):\n    # TODO: Implementa tu solución aquí\n    pass\n`,
            solution: `def advanced_sort(arr):\n    return sorted(arr, key=lambda x: x % ${index + 1})`,
            testCases: [
              { input: "[5, 2, 8, 1, 9]", expected: "sorted array" }
            ]
          }
        ]
      },
      javascript: {
        beginner: [
          {
            title: `Arrays Básicos ${index}`,
            description: `Ejercicio ${index}: Manipula arrays con métodos básicos de JavaScript.`,
            starterCode: `// Ejercicio ${index}: Arrays básicos\nfunction processArray(arr) {\n    // TODO: Implementa tu solución aquí\n}\n`,
            solution: `function processArray(arr) {\n    return arr.map(x => x * ${index}).filter(x => x > 0);\n}`,
            testCases: [
              { input: "[1, -2, 3, 4]", expected: `[${index}, ${3*index}, ${4*index}]` }
            ]
          }
        ],
        intermediate: [
          {
            title: `Promesas y Async ${index}`,
            description: `Ejercicio ${index}: Trabaja con promesas y funciones asíncronas.`,
            starterCode: `// Ejercicio ${index}: Promesas y async\nasync function asyncOperation() {\n    // TODO: Implementa tu solución aquí\n}\n`,
            solution: `async function asyncOperation() {\n    return new Promise(resolve => {\n        setTimeout(() => resolve(${index}), 100);\n    });\n}`,
            testCases: [
              { input: "", expected: `${index}` }
            ]
          }
        ],
        advanced: [
          {
            title: `Patrones de Diseño ${index}`,
            description: `Ejercicio ${index}: Implementa patrones de diseño avanzados en JavaScript.`,
            starterCode: `// Ejercicio ${index}: Patrones de diseño\nclass AdvancedPattern {\n    // TODO: Implementa tu solución aquí\n}\n`,
            solution: `class AdvancedPattern {\n    constructor(value = ${index}) {\n        this.value = value;\n    }\n    process() {\n        return this.value * 2;\n    }\n}`,
            testCases: [
              { input: "", expected: `${index * 2}` }
            ]
          }
        ]
      },
      cpp: {
        beginner: [
          {
            title: `Punteros Básicos ${index}`,
            description: `Ejercicio ${index}: Trabaja con punteros y referencias en C++.`,
            starterCode: `// Ejercicio ${index}: Punteros básicos\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Implementa tu solución aquí\n    return 0;\n}\n`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = ${index};\n    int* ptr = &x;\n    cout << *ptr << endl;\n    return 0;\n}`,
            testCases: [
              { input: "", expected: `${index}` }
            ]
          }
        ],
        intermediate: [
          {
            title: `Clases y Objetos ${index}`,
            description: `Ejercicio ${index}: Diseña clases con herencia y polimorfismo.`,
            starterCode: `// Ejercicio ${index}: Clases y objetos\n#include <iostream>\nusing namespace std;\n\nclass Base {\n    // TODO: Implementa tu solución aquí\n};\n`,
            solution: `#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual int getValue() { return ${index}; }\n};\n\nclass Derived : public Base {\npublic:\n    int getValue() override { return ${index * 2}; }\n};`,
            testCases: [
              { input: "", expected: `${index * 2}` }
            ]
          }
        ],
        advanced: [
          {
            title: `Templates Avanzados ${index}`,
            description: `Ejercicio ${index}: Implementa templates y metaprogramación en C++.`,
            starterCode: `// Ejercicio ${index}: Templates avanzados\n#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nclass Advanced {\n    // TODO: Implementa tu solución aquí\n};\n`,
            solution: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nclass Advanced {\npublic:\n    T process(T value) { return value * ${index}; }\n};`,
            testCases: [
              { input: "5", expected: `${5 * index}` }
            ]
          }
        ]
      },
      c: {
        beginner: [
          {
            title: `Estructuras Básicas ${index}`,
            description: `Ejercicio ${index}: Trabaja con estructuras y arreglos en C.`,
            starterCode: `// Ejercicio ${index}: Estructuras básicas\n#include <stdio.h>\n\nint main() {\n    // TODO: Implementa tu solución aquí\n    return 0;\n}\n`,
            solution: `#include <stdio.h>\n\nint main() {\n    int arr[3] = {${index}, ${index*2}, ${index*3}};\n    printf("%d\\n", arr[1]);\n    return 0;\n}`,
            testCases: [
              { input: "", expected: `${index * 2}` }
            ]
          }
        ],
        intermediate: [
          {
            title: `Gestión de Memoria ${index}`,
            description: `Ejercicio ${index}: Maneja memoria dinámica y punteros en C.`,
            starterCode: `// Ejercicio ${index}: Gestión de memoria\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // TODO: Implementa tu solución aquí\n    return 0;\n}\n`,
            solution: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int* ptr = malloc(sizeof(int));\n    *ptr = ${index};\n    printf("%d\\n", *ptr);\n    free(ptr);\n    return 0;\n}`,
            testCases: [
              { input: "", expected: `${index}` }
            ]
          }
        ],
        advanced: [
          {
            title: `Algoritmos Optimizados ${index}`,
            description: `Ejercicio ${index}: Implementa algoritmos optimizados en C.`,
            starterCode: `// Ejercicio ${index}: Algoritmos optimizados\n#include <stdio.h>\n\nint optimized_algorithm(int n) {\n    // TODO: Implementa tu solución aquí\n    return 0;\n}\n`,
            solution: `#include <stdio.h>\n\nint optimized_algorithm(int n) {\n    return n * ${index} + ${index};\n}\n\nint main() {\n    printf("%d\\n", optimized_algorithm(5));\n    return 0;\n}`,
            testCases: [
              { input: "5", expected: `${5 * index + index}` }
            ]
          }
        ]
      },
      'html-css': {
        beginner: [
          {
            title: `Layout Básico ${index}`,
            description: `Ejercicio ${index}: Crea un layout básico con HTML y CSS.`,
            starterCode: `<!-- Ejercicio ${index}: Layout básico -->\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        /* TODO: Implementa tu CSS aquí */\n    </style>\n</head>\n<body>\n    <!-- TODO: Implementa tu HTML aquí -->\n</body>\n</html>`,
            solution: `<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .container { width: ${index * 10}px; margin: auto; }\n        .box { background: #f0f0f0; padding: 20px; }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="box">Contenido ${index}</div>\n    </div>\n</body>\n</html>`,
            testCases: [
              { input: "", expected: "valid html layout" }
            ]
          }
        ],
        intermediate: [
          {
            title: `Flexbox Avanzado ${index}`,
            description: `Ejercicio ${index}: Implementa layouts complejos con Flexbox.`,
            starterCode: `<!-- Ejercicio ${index}: Flexbox avanzado -->\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        /* TODO: Implementa Flexbox aquí */\n    </style>\n</head>\n<body>\n    <!-- TODO: Implementa tu estructura aquí -->\n</body>\n</html>`,
            solution: `<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .flex-container {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            height: ${index * 5}px;\n        }\n        .flex-item { flex: 1; margin: 10px; background: #ddd; }\n    </style>\n</head>\n<body>\n    <div class="flex-container">\n        <div class="flex-item">Item ${index}</div>\n        <div class="flex-item">Item ${index + 1}</div>\n    </div>\n</body>\n</html>`,
            testCases: [
              { input: "", expected: "flexbox layout" }
            ]
          }
        ],
        advanced: [
          {
            title: `Grid y Animaciones ${index}`,
            description: `Ejercicio ${index}: Crea layouts con CSS Grid y animaciones.`,
            starterCode: `<!-- Ejercicio ${index}: Grid y animaciones -->\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        /* TODO: Implementa Grid y animaciones aquí */\n    </style>\n</head>\n<body>\n    <!-- TODO: Implementa tu estructura aquí -->\n</body>\n</html>`,
            solution: `<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .grid-container {\n            display: grid;\n            grid-template-columns: repeat(${index % 3 + 2}, 1fr);\n            gap: 10px;\n            animation: fadeIn 2s ease-in;\n        }\n        @keyframes fadeIn {\n            from { opacity: 0; }\n            to { opacity: 1; }\n        }\n        .grid-item { background: #333; color: white; padding: 20px; }\n    </style>\n</head>\n<body>\n    <div class="grid-container">\n        <div class="grid-item">Grid ${index}</div>\n        <div class="grid-item">Grid ${index + 1}</div>\n    </div>\n</body>\n</html>`,
            testCases: [
              { input: "", expected: "grid layout with animations" }
            ]
          }
        ]
      }
    };

    const templates = exerciseTemplates[languageSlug as keyof typeof exerciseTemplates];
    if (!templates) return null;

    const difficultyTemplates = templates[difficulty];
    if (!difficultyTemplates || difficultyTemplates.length === 0) return null;

    const template = difficultyTemplates[0]; // Use first template as base
    
    return {
      title: template.title,
      description: template.description,
      starterCode: template.starterCode,
      solutionCode: template.solution,
      testCases: template.testCases,
      tags: [languageSlug, difficultyLevel, `ejercicio-${index}`],
      timeLimit: 30000,
      memoryLimit: 128000000,
      points: basePoints[difficultyLevel as keyof typeof basePoints],
      content: template.description
    };
  }

  private generateSlug(title: string, languageSlug: string): string {
    return `${title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')}-${languageSlug}`;
  }

  async generateMassiveExercises(): Promise<void> {
    console.log("🚀 Iniciando generación masiva de ejercicios (40 por dificultad por lenguaje)...");
    
    const languages = ['python', 'javascript', 'cpp', 'c', 'html-css'];
    const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    const exercisesPerDifficulty = 40;
    
    let totalGenerated = 0;
    let totalSkipped = 0;

    for (const languageSlug of languages) {
      console.log(`\n📚 Generando ejercicios para ${languageSlug.toUpperCase()}...`);
      
      const language = await storage.getLanguageBySlug(languageSlug);
      if (!language) {
        console.error(`❌ Lenguaje no encontrado: ${languageSlug}`);
        continue;
      }

      for (const difficulty of difficulties) {
        console.log(`  📝 Generando ${exercisesPerDifficulty} ejercicios de dificultad ${difficulty}...`);
        
        for (let i = 1; i <= exercisesPerDifficulty; i++) {
          try {
            const template = this.generateExerciseByLanguageAndDifficulty(languageSlug, difficulty, i);
            if (!template) {
              console.log(`    ⚠ No hay template para ${languageSlug} ${difficulty} ${i}`);
              continue;
            }

            const exerciseData: InsertExercise = {
              title: template.title,
              description: template.description,
              languageId: language.id,
              difficulty: this.difficultyMap[difficulty] as 'easy' | 'medium' | 'hard',
              points: template.points,
              slug: this.generateSlug(template.title, languageSlug),
              starterCode: template.starterCode,
              solution: template.solutionCode,
              testCases: template.testCases,
              tags: template.tags,
              timeLimit: template.timeLimit,
              memoryLimit: template.memoryLimit,
            };

            await storage.createExercise(exerciseData);
            totalGenerated++;
            console.log(`    ✅ ${i}/${exercisesPerDifficulty} - ${template.title}`);
          } catch (error: any) {
            if (error.message?.includes('duplicate key value violates unique constraint')) {
              totalSkipped++;
              console.log(`    ⏭ ${i}/${exercisesPerDifficulty} - Ya existe, saltando...`);
            } else {
              console.error(`    ❌ Error en ejercicio ${i}:`, error.message);
            }
          }
        }
      }
    }

    console.log(`\n🎉 Generación masiva completada!`);
    console.log(`📊 Ejercicios generados: ${totalGenerated}`);
    console.log(`⏭ Ejercicios saltados (duplicados): ${totalSkipped}`);
    console.log(`📈 Total procesados: ${totalGenerated + totalSkipped}`);
  }
}

export const massiveExerciseGenerator = new MassiveExerciseGenerator();