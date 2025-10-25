import OpenAI from "openai";
import { db } from "./db.js";
import { exercises } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface DifficultyAnalysis {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reasoning: string;
  confidence: number;
}

export class DifficultyClassifier {
  
  async classifyExerciseDifficulty(
    title: string, 
    description: string, 
    language: string,
    starterCode?: string
  ): Promise<DifficultyAnalysis> {
    try {
      const prompt = `Analiza este ejercicio de programación y clasifica su dificultad de forma PRECISA:

Título: ${title}
Lenguaje: ${language}
Descripción: ${description}
${starterCode ? `Código inicial: ${starterCode}` : ''}

CRITERIOS ESTRICTOS de clasificación:

BEGINNER (principiante) - SOLO ejercicios muy básicos:
- Variables y tipos de datos básicos
- Operaciones aritméticas simples
- Condicionales básicos (if/else simple)
- Bucles básicos (for/while simple)  
- Input/output básico
- Calculadoras simples
- NO incluye: funciones complejas, arrays avanzados, algoritmos

INTERMEDIATE (intermedio) - Complejidad media:
- Funciones con parámetros múltiples
- Arrays y manipulación de estructuras
- Algoritmos básicos (ordenamiento, búsqueda)
- Manejo de archivos
- Estructuras de datos básicas
- Programación orientada a objetos básica
- Validaciones complejas

ADVANCED (avanzado) - Complejidad alta:
- APIs y servicios web (SIEMPRE advanced)
- Bases de datos y SQL (SIEMPRE advanced)
- Web scraping (SIEMPRE advanced)
- Algoritmos complejos y optimización
- Patrones de diseño avanzados
- Integración de sistemas
- Frameworks y librerías complejas
- Concurrencia y threading
- Criptografía y seguridad

REGLAS OBLIGATORIAS:
- Cualquier ejercicio con "API" = advanced
- Cualquier ejercicio con "database" o "SQL" = advanced
- Cualquier ejercicio con "web scraping" = advanced
- Cualquier ejercicio con "servidor" o "cliente" = advanced

Responde SOLO con JSON válido:
{
  "difficulty": "beginner|intermediate|advanced",
  "reasoning": "Explicación detallada de por qué esta dificultad",
  "confidence": 0.95
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert programming educator who accurately classifies exercise difficulty levels. Be precise and consider the full complexity of each exercise."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        difficulty: result.difficulty || 'intermediate',
        reasoning: result.reasoning || 'Analysis completed',
        confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1)
      };

    } catch (error) {
      console.error('Error classifying difficulty:', error);
      // Fallback classification based on keywords
      return this.fallbackClassification(title, description, language);
    }
  }

  private fallbackClassification(title: string, description: string, language: string): DifficultyAnalysis {
    const content = (title + ' ' + description).toLowerCase();
    
    // Advanced indicators
    const advancedKeywords = [
      'api', 'database', 'sql', 'authentication', 'encryption', 'algorithm',
      'optimization', 'concurrent', 'async', 'thread', 'network', 'server',
      'framework', 'library integration', 'design pattern', 'architecture',
      'machine learning', 'data structure', 'graph', 'tree', 'recursion complex'
    ];
    
    // Beginner indicators
    const beginnerKeywords = [
      'hello world', 'basic', 'simple', 'introduction', 'first', 'print',
      'variable', 'add', 'subtract', 'input', 'output', 'if else', 'loop basic'
    ];
    
    const advancedScore = advancedKeywords.filter(keyword => content.includes(keyword)).length;
    const beginnerScore = beginnerKeywords.filter(keyword => content.includes(keyword)).length;
    
    if (advancedScore >= 2) {
      return {
        difficulty: 'advanced',
        reasoning: 'Contains advanced programming concepts',
        confidence: 0.7
      };
    } else if (beginnerScore >= 2) {
      return {
        difficulty: 'beginner',
        reasoning: 'Contains basic programming concepts',
        confidence: 0.7
      };
    } else {
      return {
        difficulty: 'intermediate',
        reasoning: 'Moderate complexity programming exercise',
        confidence: 0.6
      };
    }
  }

  async reclassifyAllExercises(): Promise<{
    total: number;
    updated: number;
    errors: number;
  }> {
    console.log('🔄 Starting comprehensive difficulty reclassification...');
    
    const allExercises = await db.select().from(exercises);
    let updated = 0;
    let errors = 0;
    
    for (const exercise of allExercises) {
      try {
        // Get language info
        const language = await this.getLanguageName(exercise.languageId);
        
        // Classify difficulty
        const analysis = await this.classifyExerciseDifficulty(
          exercise.title,
          exercise.description,
          language,
          exercise.starterCode || undefined
        );
        
        // Update if different
        if (analysis.difficulty !== exercise.difficulty) {
          await db
            .update(exercises)
            .set({ 
              difficulty: analysis.difficulty
            })
            .where(eq(exercises.id, exercise.id));
          
          console.log(`✅ Updated "${exercise.title}": ${exercise.difficulty} → ${analysis.difficulty}`);
          console.log(`   Reasoning: ${analysis.reasoning}`);
          updated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing "${exercise.title}":`, error);
        errors++;
      }
    }
    
    console.log(`\n📊 Reclassification Summary:`);
    console.log(`   Total exercises: ${allExercises.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Unchanged: ${allExercises.length - updated - errors}`);
    
    return {
      total: allExercises.length,
      updated,
      errors
    };
  }

  private async getLanguageName(languageId: number): Promise<string> {
    try {
      const { languages } = await import("../shared/schema.js");
      const [language] = await db.select().from(languages).where(eq(languages.id, languageId));
      return language?.name || 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  async classifySpecificExercises(exerciseIds: number[]): Promise<void> {
    console.log(`🎯 Reclassifying ${exerciseIds.length} specific exercises...`);
    
    for (const id of exerciseIds) {
      try {
        const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
        if (!exercise) continue;
        
        const language = await this.getLanguageName(exercise.languageId);
        const analysis = await this.classifyExerciseDifficulty(
          exercise.title,
          exercise.description,
          language,
          exercise.starterCode || undefined
        );
        
        await db
          .update(exercises)
          .set({ 
            difficulty: analysis.difficulty
          })
          .where(eq(exercises.id, id));
        
        console.log(`✅ "${exercise.title}": ${exercise.difficulty} → ${analysis.difficulty}`);
        console.log(`   ${analysis.reasoning} (confidence: ${analysis.confidence})`);
        
      } catch (error) {
        console.error(`❌ Error processing exercise ${id}:`, error);
      }
    }
  }
}

export const difficultyClassifier = new DifficultyClassifier();