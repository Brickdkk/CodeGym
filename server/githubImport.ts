import { storage } from "./storage.js";
import type { InsertExercise, InsertLanguage } from "../shared/schema.js";

export interface GitHubExercise {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  starterCode?: string;
  solution?: string;
  testCases?: Array<{
    input: string;
    output: string;
  }>;
  tags?: string[];
}

export interface ImportResult {
  success: boolean;
  exercisesImported: number;
  languagesCreated: number;
  errors: string[];
  details: {
    exercises: Array<{ title: string; slug: string; status: 'created' | 'updated' | 'error' }>;
    languages: Array<{ name: string; slug: string; status: 'created' | 'existing' }>;
  };
}

export class GitHubImportService {
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  private getLanguageConfig(languageName: string) {
    const normalizedName = languageName.toLowerCase();
    
    const configs: Record<string, any> = {
      'python': {
        name: 'Python',
        description: 'Lenguaje interpretado de alto nivel, ideal para principiantes',
        icon: '🐍',
        color: '#3776ab',
        fileExtension: '.py',
        syntaxHighlighting: 'python',
        defaultTemplate: '# Escribe tu código aquí\ndef solution():\n    pass'
      },
      'javascript': {
        name: 'JavaScript',
        description: 'Lenguaje de programación versátil para web y backend',
        icon: '⚡',
        color: '#f7df1e',
        fileExtension: '.js',
        syntaxHighlighting: 'javascript',
        defaultTemplate: '// Escribe tu código aquí\nfunction solution() {\n    // Tu código aquí\n}'
      },
      'java': {
        name: 'Java',
        description: 'Lenguaje orientado a objetos, robusto y multiplataforma',
        icon: '☕',
        color: '#ed8b00',
        fileExtension: '.java',
        syntaxHighlighting: 'java',
        defaultTemplate: 'public class Solution {\n    public static void main(String[] args) {\n        // Tu código aquí\n    }\n}'
      },
      'cpp': {
        name: 'C++',
        description: 'Lenguaje de programación de sistemas de alto rendimiento',
        icon: '⚙️',
        color: '#00599c',
        fileExtension: '.cpp',
        syntaxHighlighting: 'cpp',
        defaultTemplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Tu código aquí\n    return 0;\n}'
      },
      'c': {
        name: 'C',
        description: 'Lenguaje de programación de sistemas fundamental',
        icon: '🔧',
        color: '#a8b9cc',
        fileExtension: '.c',
        syntaxHighlighting: 'c',
        defaultTemplate: '#include <stdio.h>\n\nint main() {\n    // Tu código aquí\n    return 0;\n}'
      }
    };

    return configs[normalizedName] || {
      name: languageName.charAt(0).toUpperCase() + languageName.slice(1),
      description: `Ejercicios de programación en ${languageName}`,
      icon: '📝',
      color: '#666666',
      fileExtension: '.txt',
      syntaxHighlighting: 'text',
      defaultTemplate: '// Código aquí'
    };
  }

  private async ensureLanguageExists(languageName: string): Promise<string> {
    const config = this.getLanguageConfig(languageName);
    const slug = this.generateSlug(config.name);
    
    const existingLanguage = await storage.getLanguageBySlug(slug);
    if (existingLanguage) {
      return slug;
    }

    const newLanguage: InsertLanguage = {
      name: config.name,
      slug: slug,
      description: config.description,
      icon: config.icon,
      color: config.color,
      fileExtension: config.fileExtension,
      syntaxHighlighting: config.syntaxHighlighting,
      defaultTemplate: config.defaultTemplate,
      isActive: true
    };

    await storage.createLanguage(newLanguage);
    return slug;
  }

  private validateExercise(exercise: GitHubExercise): string[] {
    const errors: string[] = [];
    
    if (!exercise.title?.trim()) {
      errors.push('El título es obligatorio');
    }
    
    if (!exercise.description?.trim()) {
      errors.push('La descripción es obligatoria');
    }
    
    if (!exercise.language?.trim()) {
      errors.push('El lenguaje es obligatorio');
    }
    
    if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(exercise.difficulty)) {
      errors.push('La dificultad debe ser: beginner, intermediate, advanced o expert');
    }
    
    return errors;
  }

  private calculatePoints(difficulty: string): number {
    const pointsMap: Record<string, number> = {
      'beginner': 10,
      'intermediate': 25,
      'advanced': 50,
      'expert': 100
    };
    return pointsMap[difficulty] || 10;
  }

  public async importExercises(exercises: GitHubExercise[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      exercisesImported: 0,
      languagesCreated: 0,
      errors: [],
      details: {
        exercises: [],
        languages: []
      }
    };

    if (!exercises || exercises.length === 0) {
      result.errors.push('No se proporcionaron ejercicios para importar');
      return result;
    }

    try {
      // Procesar lenguajes únicos
      const uniqueLanguages = Array.from(new Set(exercises.map(ex => ex.language?.toLowerCase()).filter(Boolean)));
      const existingLanguages = await storage.getLanguages();
      const existingLanguageSlugs = existingLanguages.map(lang => lang.slug);

      for (const languageName of uniqueLanguages) {
        try {
          const slug = await this.ensureLanguageExists(languageName);
          const wasExisting = existingLanguageSlugs.includes(slug);
          
          result.details.languages.push({
            name: languageName,
            slug: slug,
            status: wasExisting ? 'existing' : 'created'
          });
          
          if (!wasExisting) {
            result.languagesCreated++;
          }
        } catch (error) {
          result.errors.push(`Error procesando lenguaje ${languageName}: ${error}`);
        }
      }

      // Obtener todos los ejercicios existentes para verificar slugs únicos
      const allExercises = await storage.getAllExercises();
      const existingSlugs = allExercises.map(ex => ex.slug);

      // Procesar cada ejercicio
      for (let index = 0; index < exercises.length; index++) {
        const exercise = exercises[index];
        try {
          // Validar ejercicio
          const validationErrors = this.validateExercise(exercise);
          if (validationErrors.length > 0) {
            const errorMsg = `Ejercicio ${index + 1} (${exercise.title || 'Sin título'}): ${validationErrors.join(', ')}`;
            result.errors.push(errorMsg);
            result.details.exercises.push({
              title: exercise.title || `Ejercicio ${index + 1}`,
              slug: '',
              status: 'error'
            });
            continue;
          }

          // Generar slug único
          const baseSlug = this.generateSlug(exercise.title);
          const uniqueSlug = await this.ensureUniqueSlug(baseSlug, existingSlugs);
          existingSlugs.push(uniqueSlug);

          // Obtener el lenguaje
          const languageSlug = this.generateSlug(exercise.language.toLowerCase());
          const language = await storage.getLanguageBySlug(languageSlug);
          
          if (!language) {
            result.errors.push(`Lenguaje no encontrado para el ejercicio: ${exercise.title}`);
            continue;
          }

          // Verificar si el ejercicio ya existe
          const existingExercise = await storage.getExerciseBySlug(uniqueSlug);
          
          const exerciseData: InsertExercise = {
            title: exercise.title.trim(),
            slug: uniqueSlug,
            description: exercise.description.trim(),
            difficulty: exercise.difficulty,
            languageId: language.id,
            starterCode: exercise.starterCode || language.defaultTemplate || '',
            solution: exercise.solution || null,
            testCases: exercise.testCases ? JSON.stringify(exercise.testCases) : JSON.stringify([]),
            tags: exercise.tags ? JSON.stringify(exercise.tags) : null,
            timeLimit: 5000,
            memoryLimit: 128,
            points: this.calculatePoints(exercise.difficulty),
            isActive: true
          };

          if (existingExercise) {
            // Actualizar ejercicio existente
            await storage.updateExercise(existingExercise.id, exerciseData);
            result.details.exercises.push({
              title: exercise.title,
              slug: uniqueSlug,
              status: 'updated'
            });
          } else {
            // Crear nuevo ejercicio
            await storage.createExercise(exerciseData);
            result.details.exercises.push({
              title: exercise.title,
              slug: uniqueSlug,
              status: 'created'
            });
            result.exercisesImported++;
          }

        } catch (error) {
          const errorMsg = `Error importando ejercicio "${exercise.title}": ${error}`;
          result.errors.push(errorMsg);
          result.details.exercises.push({
            title: exercise.title || `Ejercicio ${index + 1}`,
            slug: '',
            status: 'error'
          });
        }
      }

      result.success = result.errors.length === 0 || result.exercisesImported > 0;
      
    } catch (error) {
      result.errors.push(`Error general en la importación: ${error}`);
    }

    return result;
  }

  public parseMarkdownToExercise(markdownContent: string, filename: string): GitHubExercise | null {
    try {
      const lines = markdownContent.split('\n');
      let title = '';
      let description = '';
      let difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
      let language = '';
      let starterCode = '';
      const testCases: Array<{input: string, output: string}> = [];

      // Extraer título del primer header
      const titleMatch = lines.find(line => line.startsWith('# '));
      if (titleMatch) {
        title = titleMatch.replace('# ', '').trim();
      }

      // Extraer metadata del frontmatter si existe
      if (lines[0] === '---') {
        const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---');
        if (frontmatterEnd !== -1) {
          const frontmatter = lines.slice(1, frontmatterEnd);
          for (const line of frontmatter) {
            if (line.includes('difficulty:')) {
              const diff = line.split(':')[1]?.trim().toLowerCase();
              if (['beginner', 'intermediate', 'advanced', 'expert'].includes(diff)) {
                difficulty = diff as any;
              }
            }
            if (line.includes('language:')) {
              language = line.split(':')[1]?.trim() || '';
            }
          }
        }
      }

      // Inferir lenguaje del nombre del archivo si no se especifica
      if (!language) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const extToLang: Record<string, string> = {
          'py': 'python',
          'js': 'javascript',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'cs': 'csharp'
        };
        language = extToLang[ext || ''] || 'python';
      }

      // Extraer descripción
      let descStart = lines.findIndex(line => line.startsWith('# ')) + 1;
      let descEnd = lines.findIndex((line, index) => index > descStart && line.startsWith('```'));
      if (descEnd === -1) descEnd = lines.length;
      
      description = lines.slice(descStart, descEnd)
        .filter(line => !line.startsWith('#'))
        .join('\n')
        .trim();

      return {
        title: title || filename.replace(/\.[^/.]+$/, ""),
        description: description || `Ejercicio de programación en ${language}`,
        difficulty,
        language,
        starterCode,
        testCases
      };

    } catch (error) {
      console.error(`Error parsing markdown file ${filename}:`, error);
      return null;
    }
  }
}

export const githubImportService = new GitHubImportService();