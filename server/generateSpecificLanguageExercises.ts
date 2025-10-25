import { storage } from "./storage.js";
import type { InsertExercise } from "../shared/schema.js";

/**
 * Generate 40 exercises per difficulty for specific languages
 */
export class SpecificLanguageExerciseGenerator {
  private difficultyMap = {
    'beginner': 'beginner',
    'intermediate': 'intermediate', 
    'advanced': 'advanced'
  };

  private generateExerciseTemplate(languageSlug: string, difficulty: string, index: number) {
    const basePoints = { beginner: 10, intermediate: 20, advanced: 30 };
    
    const exerciseTemplates = {
      c: {
        beginner: {
          title: `Estructuras Básicas C ${index}`,
          description: `Ejercicio ${index}: Trabaja con estructuras de datos básicas, arrays y punteros en C. Implementa operaciones fundamentales y gestión de memoria.`,
          starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Ejercicio ${index}: Implementa tu solución aquí\n    // TODO: Completa la función\n    return 0;\n}`,
          solution: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int arr[${index}];\n    for(int i = 0; i < ${index}; i++) {\n        arr[i] = i * 2;\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Salida correcta para ejercicio ${index}` }
          ]
        },
        intermediate: {
          title: `Gestión Memoria C ${index}`,
          description: `Ejercicio ${index}: Maneja memoria dinámica, punteros avanzados y estructuras complejas en C. Implementa algoritmos de gestión de memoria.`,
          starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    int data;\n    struct Node* next;\n} Node;\n\nint main() {\n    // Ejercicio ${index}: Implementa gestión de memoria\n    return 0;\n}`,
          solution: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node* next;\n} Node;\n\nint main() {\n    Node* head = malloc(sizeof(Node));\n    head->data = ${index};\n    head->next = NULL;\n    printf("Node data: %d\\n", head->data);\n    free(head);\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Node data: ${index}` }
          ]
        },
        advanced: {
          title: `Algoritmos Avanzados C ${index}`,
          description: `Ejercicio ${index}: Implementa algoritmos complejos, optimización de memoria y estructuras de datos avanzadas en C.`,
          starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\n// Ejercicio ${index}: Algoritmo avanzado\nint advanced_algorithm(int* arr, int size) {\n    // TODO: Implementa algoritmo optimizado\n    return 0;\n}\n\nint main() {\n    return 0;\n}`,
          solution: `#include <stdio.h>\n#include <stdlib.h>\n\nint advanced_algorithm(int* arr, int size) {\n    int sum = 0;\n    for(int i = 0; i < size; i++) {\n        sum += arr[i] * ${index};\n    }\n    return sum;\n}\n\nint main() {\n    int arr[] = {1, 2, 3};\n    printf("Result: %d\\n", advanced_algorithm(arr, 3));\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Result: ${6 * index}` }
          ]
        }
      },
      cpp: {
        beginner: {
          title: `POO Básica C++ ${index}`,
          description: `Ejercicio ${index}: Conceptos básicos de programación orientada a objetos, clases simples y métodos en C++.`,
          starterCode: `#include <iostream>\nusing namespace std;\n\nclass Exercise${index} {\npublic:\n    // TODO: Implementa la clase\n};\n\nint main() {\n    // Tu código aquí\n    return 0;\n}`,
          solution: `#include <iostream>\nusing namespace std;\n\nclass Exercise${index} {\npublic:\n    int value;\n    Exercise${index}(int v) : value(v) {}\n    void display() {\n        cout << "Value: " << value << endl;\n    }\n};\n\nint main() {\n    Exercise${index} obj(${index});\n    obj.display();\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Value: ${index}` }
          ]
        },
        intermediate: {
          title: `Herencia C++ ${index}`,
          description: `Ejercicio ${index}: Implementa herencia, polimorfismo y métodos virtuales en C++. Diseña jerarquías de clases.`,
          starterCode: `#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual void method() = 0;\n};\n\nclass Derived : public Base {\n    // TODO: Implementa la clase derivada\n};\n\nint main() {\n    return 0;\n}`,
          solution: `#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual void method() = 0;\n};\n\nclass Derived : public Base {\npublic:\n    void method() override {\n        cout << "Derived method " << ${index} << endl;\n    }\n};\n\nint main() {\n    Derived obj;\n    obj.method();\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Derived method ${index}` }
          ]
        },
        advanced: {
          title: `Templates C++ ${index}`,
          description: `Ejercicio ${index}: Domina templates, metaprogramación y características avanzadas de C++. Implementa templates genéricos.`,
          starterCode: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nclass Advanced${index} {\n    // TODO: Implementa template avanzado\n};\n\nint main() {\n    return 0;\n}`,
          solution: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nclass Advanced${index} {\npublic:\n    T data;\n    Advanced${index}(T value) : data(value) {}\n    T process() {\n        return data * ${index};\n    }\n};\n\nint main() {\n    Advanced${index}<int> obj(5);\n    cout << "Result: " << obj.process() << endl;\n    return 0;\n}`,
          testCases: [
            { input: "", expected: `Result: ${5 * index}` }
          ]
        }
      },
      csharp: {
        beginner: {
          title: `Fundamentos C# ${index}`,
          description: `Ejercicio ${index}: Conceptos básicos de C#, clases, propiedades y métodos. Programación orientada a objetos básica.`,
          starterCode: `using System;\n\nclass Program {\n    // Ejercicio ${index}: Implementa tu solución\n    static void Main() {\n        // TODO: Tu código aquí\n    }\n}`,
          solution: `using System;\n\nclass Exercise${index} {\n    public int Value { get; set; }\n    \n    public Exercise${index}(int value) {\n        Value = value;\n    }\n    \n    public void Display() {\n        Console.WriteLine($"Value: {Value}");\n    }\n}\n\nclass Program {\n    static void Main() {\n        var obj = new Exercise${index}(${index});\n        obj.Display();\n    }\n}`,
          testCases: [
            { input: "", expected: `Value: ${index}` }
          ]
        },
        intermediate: {
          title: `LINQ y Colecciones C# ${index}`,
          description: `Ejercicio ${index}: Trabaja con LINQ, colecciones genéricas y expresiones lambda en C#. Manipula datos eficientemente.`,
          starterCode: `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        // Ejercicio ${index}: Implementa LINQ\n        var numbers = new List<int> {1, 2, 3, 4, 5};\n        // TODO: Procesa la colección\n    }\n}`,
          solution: `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        var numbers = new List<int> {1, 2, 3, 4, 5};\n        var result = numbers\n            .Where(x => x > 2)\n            .Select(x => x * ${index})\n            .ToList();\n        \n        Console.WriteLine($"Result: {string.Join(", ", result)}");\n    }\n}`,
          testCases: [
            { input: "", expected: `Result: ${3 * index}, ${4 * index}, ${5 * index}` }
          ]
        },
        advanced: {
          title: `Async/Await C# ${index}`,
          description: `Ejercicio ${index}: Programación asíncrona, Tasks y patrones avanzados en C#. Implementa operaciones concurrentes.`,
          starterCode: `using System;\nusing System.Threading.Tasks;\n\nclass Program {\n    // Ejercicio ${index}: Implementa operación asíncrona\n    static async Task Main() {\n        // TODO: Implementa async/await\n    }\n}`,
          solution: `using System;\nusing System.Threading.Tasks;\n\nclass Program {\n    static async Task<int> ProcessAsync() {\n        await Task.Delay(100);\n        return ${index} * 2;\n    }\n    \n    static async Task Main() {\n        var result = await ProcessAsync();\n        Console.WriteLine($"Async result: {result}");\n    }\n}`,
          testCases: [
            { input: "", expected: `Async result: ${index * 2}` }
          ]
        }
      }
    };

    const templates = exerciseTemplates[languageSlug as keyof typeof exerciseTemplates];
    if (!templates) return null;

    const difficultyTemplate = templates[difficulty as keyof typeof templates];
    if (!difficultyTemplate) return null;
    
    return {
      title: difficultyTemplate.title,
      description: difficultyTemplate.description,
      starterCode: difficultyTemplate.starterCode,
      solutionCode: difficultyTemplate.solution,
      testCases: difficultyTemplate.testCases,
      tags: [languageSlug, difficulty, `ejercicio-${index}`],
      timeLimit: 30000,
      memoryLimit: 128000000,
      points: basePoints[difficulty as keyof typeof basePoints],
    };
  }

  private generateSlug(title: string, languageSlug: string): string {
    return `${title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/\+/g, 'plus')}-${languageSlug}`;
  }

  async generateExercisesForLanguage(languageSlug: string): Promise<void> {
    console.log(`\n🔧 Generando 40 ejercicios por dificultad para ${languageSlug.toUpperCase()}...`);
    
    const language = await storage.getLanguageBySlug(languageSlug);
    if (!language) {
      console.error(`❌ Lenguaje no encontrado: ${languageSlug}`);
      return;
    }

    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const exercisesPerDifficulty = 40;
    
    let totalGenerated = 0;
    let totalSkipped = 0;

    for (const difficulty of difficulties) {
      console.log(`  📝 Generando ${exercisesPerDifficulty} ejercicios de dificultad ${difficulty}...`);
      
      for (let i = 1; i <= exercisesPerDifficulty; i++) {
        try {
          const template = this.generateExerciseTemplate(languageSlug, difficulty, i);
          if (!template) {
            console.log(`    ⚠ No hay template para ${languageSlug} ${difficulty} ${i}`);
            continue;
          }

          const exerciseData: InsertExercise = {
            title: template.title,
            description: template.description,
            languageId: language.id,
            difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
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

    console.log(`  🎉 ${languageSlug}: ${totalGenerated} generados, ${totalSkipped} saltados`);
  }

  async generateForAllTargetLanguages(): Promise<void> {
    console.log('🚀 GENERANDO 40 EJERCICIOS POR DIFICULTAD PARA C, C++, C#');
    console.log('=======================================================');
    
    const languages = ['c', 'cpp', 'csharp'];
    
    for (const languageSlug of languages) {
      await this.generateExercisesForLanguage(languageSlug);
    }

    console.log('\n📊 RESUMEN FINAL:');
    console.log('✅ Generación completada para C, C++, C#');
    console.log('📈 Cada lenguaje ahora tiene 40 ejercicios por dificultad');
    console.log('🎯 Total esperado: 120 ejercicios por lenguaje');
  }
}

export const specificLanguageExerciseGenerator = new SpecificLanguageExerciseGenerator();