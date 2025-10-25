import { storage } from "./storage.js";
import { securityTestSuite } from "./security/securityTests.js";

/**
 * Final deployment validation system
 * Runs critical tests to ensure platform readiness
 */
export class DeploymentValidator {
  private results: any[] = [];
  private passedTests = 0;
  private totalTests = 0;

  private logTest(category: string, test: string, passed: boolean, details?: string) {
    this.totalTests++;
    if (passed) this.passedTests++;
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} [${category}] ${test}${details ? ` - ${details}` : ''}`);
    
    this.results.push({
      category,
      test,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validate core database functionality
   */
  async validateDatabase(): Promise<void> {
    console.log('\n🗄️ Validando Base de Datos...');

    try {
      const languages = await storage.getLanguages();
      this.logTest('DATABASE', 'Conexión y obtención de lenguajes', languages.length >= 5, `${languages.length} lenguajes`);

      const stats = await storage.getStats();
      this.logTest('DATABASE', 'Estadísticas del sistema', stats.exercisesSolved >= 1000, `${stats.exercisesSolved} ejercicios resueltos`);

      // Test exercise retrieval for each language
      for (const language of languages.slice(0, 3)) {
        const exercises = await storage.getExercisesByLanguage(language.slug);
        this.logTest('DATABASE', `Ejercicios de ${language.name}`, exercises.length > 0, `${exercises.length} ejercicios`);
      }

    } catch (error: any) {
      this.logTest('DATABASE', 'Operaciones de base de datos', false, error.message);
    }
  }

  /**
   * Validate security implementation
   */
  async validateSecurity(): Promise<void> {
    console.log('\n🔒 Validando Seguridad...');

    try {
      const securityResults = await securityTestSuite.runAllTests();
      
      this.logTest('SECURITY', 'Pruebas de seguridad generales', securityResults.overallPassed, 
        `${Object.keys(securityResults.results).length} verificaciones`);

      // Test security status endpoint
      const response = await fetch('http://localhost:5000/api/security/status');
      if (response.ok) {
        const status = await response.json();
        this.logTest('SECURITY', 'Estado de seguridad', status.status === 'SECURE', 
          `Estado: ${status.status}, Amenaza: ${status.threatLevel}`);
      }

    } catch (error: any) {
      this.logTest('SECURITY', 'Validación de seguridad', false, error.message);
    }
  }

  /**
   * Validate API endpoints
   */
  async validateAPI(): Promise<void> {
    console.log('\n🌐 Validando APIs...');

    const endpoints = [
      { path: '/api/languages', name: 'Lenguajes' },
      { path: '/api/stats', name: 'Estadísticas' },
      { path: '/api/exercise-counts', name: 'Conteo de ejercicios' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000${endpoint.path}`);
        this.logTest('API', endpoint.name, response.ok, `Status: ${response.status}`);
      } catch (error: any) {
        this.logTest('API', endpoint.name, false, 'No disponible');
      }
    }
  }

  /**
   * Validate exercise content and structure
   */
  async validateExercises(): Promise<void> {
    console.log('\n📚 Validando Ejercicios...');

    try {
      const languages = await storage.getLanguages();
      let totalExerciseCount = 0;

      for (const language of languages) {
        const exercises = await storage.getExercisesByLanguage(language.slug);
        totalExerciseCount += exercises.length;

        this.logTest('EXERCISES', `Contenido ${language.name}`, exercises.length >= 10, 
          `${exercises.length} ejercicios disponibles`);

        // Validate exercise structure
        if (exercises.length > 0) {
          const exercise = exercises[0];
          const hasRequiredFields = exercise.title && exercise.description && exercise.starterCode;
          this.logTest('EXERCISES', `Estructura ${language.name}`, hasRequiredFields, 
            'Campos requeridos presentes');
        }
      }

      this.logTest('EXERCISES', 'Colección total', totalExerciseCount >= 100, 
        `${totalExerciseCount} ejercicios en total`);

    } catch (error: any) {
      this.logTest('EXERCISES', 'Validación de ejercicios', false, error.message);
    }
  }

  /**
   * Run complete deployment validation
   */
  async runDeploymentValidation(): Promise<{
    readyForDeployment: boolean;
    successRate: number;
    summary: string;
    details: any[];
  }> {
    console.log('🚀 INICIANDO VALIDACIÓN FINAL PARA DEPLOYMENT');
    console.log('==============================================');

    this.results = [];
    this.passedTests = 0;
    this.totalTests = 0;

    await this.validateDatabase();
    await this.validateSecurity();
    await this.validateAPI();
    await this.validateExercises();

    const successRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;
    const readyForDeployment = successRate >= 85;

    const summary = `
==============================================
📊 RESULTADOS DE VALIDACIÓN PARA DEPLOYMENT
==============================================
✅ Pruebas exitosas: ${this.passedTests}/${this.totalTests}
📈 Tasa de éxito: ${successRate.toFixed(1)}%

${readyForDeployment ? 
  '🟢 PLATAFORMA LISTA PARA DEPLOYMENT' : 
  '🔴 REQUIERE CORRECCIONES ANTES DEL DEPLOYMENT'}
==============================================
    `;

    console.log(summary);

    return {
      readyForDeployment,
      successRate,
      summary,
      details: this.results
    };
  }
}

export const deploymentValidator = new DeploymentValidator();