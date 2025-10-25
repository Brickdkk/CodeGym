import { storage } from "./storage.js";
import { codeExecutionService } from "./codeExecutionService.js";
import { securityTestSuite } from "./security/securityTests.js";
import { premiumService } from "./premiumService.js";
import { achievementService } from "./achievementService.js";

/**
 * Comprehensive testing suite for entire CodeGym platform
 * Tests ALL functionality before deployment
 */
export class ComprehensiveTests {
  private testResults: any[] = [];
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;

  private log(category: string, test: string, status: 'PASS' | 'FAIL', details?: any) {
    const result = { category, test, status, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    if (status === 'PASS') {
      this.passedTests++;
      console.log(`✅ [${category}] ${test}`);
    } else {
      this.failedTests++;
      console.log(`❌ [${category}] ${test}${details ? ` - ${details}` : ''}`);
    }
    this.totalTests++;
  }

  /**
   * Test database connectivity and basic operations
   */
  async testDatabaseOperations(): Promise<void> {
    console.log('\n🗄️ Testing Database Operations...');
    
    try {
      // Test language retrieval
      const languages = await storage.getLanguages();
      this.log('DATABASE', 'Get Languages', languages.length > 0 ? 'PASS' : 'FAIL', `Found ${languages.length} languages`);

      // Test exercise retrieval
      const exercises = await storage.getExercises({ limit: 10 });
      this.log('DATABASE', 'Get Exercises', exercises.length > 0 ? 'PASS' : 'FAIL', `Found ${exercises.length} exercises`);

      // Test stats
      const stats = await storage.getStats();
      this.log('DATABASE', 'Get Stats', stats ? 'PASS' : 'FAIL', `Users: ${stats.activeUsers}, Exercises: ${stats.exercisesSolved}`);

      // Test user operations (if any exist)
      try {
        const users = await storage.getUsers({ limit: 5 });
        this.log('DATABASE', 'Get Users', 'PASS', `Found ${users.length} users`);
      } catch (error) {
        this.log('DATABASE', 'Get Users', 'FAIL', error.message);
      }

    } catch (error) {
      this.log('DATABASE', 'Database Connection', 'FAIL', error.message);
    }
  }

  /**
   * Test code execution for all supported languages
   */
  async testCodeExecution(): Promise<void> {
    console.log('\n🚀 Testing Code Execution...');

    const testCases = [
      {
        language: 'python',
        code: 'print("Hello World")',
        testCases: [{ input: '', expected: 'Hello World' }],
        description: 'Python Hello World'
      },
      {
        language: 'javascript',
        code: 'console.log("Hello World");',
        testCases: [{ input: '', expected: 'Hello World' }],
        description: 'JavaScript Hello World'
      },
      {
        language: 'cpp',
        code: '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello World" << endl; return 0; }',
        testCases: [{ input: '', expected: 'Hello World' }],
        description: 'C++ Hello World'
      },
      {
        language: 'c',
        code: '#include <stdio.h>\nint main() { printf("Hello World\\n"); return 0; }',
        testCases: [{ input: '', expected: 'Hello World' }],
        description: 'C Hello World'
      }
    ];

    for (const testCase of testCases) {
      try {
        const result = await codeExecutionService.executeCode(
          testCase.code,
          testCase.language,
          testCase.testCases
        );

        this.log('CODE_EXECUTION', testCase.description, 
          result.status === 'success' && result.allTestsPassed ? 'PASS' : 'FAIL',
          `Status: ${result.status}, Tests passed: ${result.allTestsPassed}`
        );
      } catch (error) {
        this.log('CODE_EXECUTION', testCase.description, 'FAIL', error.message);
      }
    }
  }

  /**
   * Test security measures
   */
  async testSecurity(): Promise<void> {
    console.log('\n🔒 Testing Security Measures...');

    try {
      const securityResults = await securityTestSuite.runAllTests();
      
      Object.entries(securityResults.results).forEach(([category, result]) => {
        this.log('SECURITY', category, (result as any).passed ? 'PASS' : 'FAIL', (result as any).message);
      });

      this.log('SECURITY', 'Overall Security', securityResults.overallPassed ? 'PASS' : 'FAIL', 
        `${Object.keys(securityResults.results).length} security checks`);

    } catch (error) {
      this.log('SECURITY', 'Security Tests', 'FAIL', error.message);
    }
  }

  /**
   * Test premium features
   */
  async testPremiumFeatures(): Promise<void> {
    console.log('\n💎 Testing Premium Features...');

    try {
      // Test premium status check
      const testUserId = 'test-user-123';
      const premiumStatus = await premiumService.getUserPremiumStatus(testUserId);
      this.log('PREMIUM', 'Get Premium Status', 'PASS', `Premium: ${premiumStatus.isPremium}, Expires: ${premiumStatus.expiresAt}`);

      // Test usage tracking
      const usage = await premiumService.getUserUsage(testUserId);
      this.log('PREMIUM', 'Get Usage Data', 'PASS', `AI explanations: ${usage.aiExplanationsUsed}, Personalized: ${usage.personalizedRecommendationsUsed}`);

    } catch (error) {
      this.log('PREMIUM', 'Premium Service', 'FAIL', error.message);
    }
  }

  /**
   * Test achievement system
   */
  async testAchievements(): Promise<void> {
    console.log('\n🏆 Testing Achievement System...');

    try {
      const testUserId = 'test-user-123';
      
      // Test achievement check
      const achievements = await achievementService.checkAndUnlockAchievements(testUserId);
      this.log('ACHIEVEMENTS', 'Check Achievements', 'PASS', `Unlocked ${achievements.length} achievements`);

      // Test streak tracking
      const streak = await achievementService.getUserStreak(testUserId);
      this.log('ACHIEVEMENTS', 'User Streak', 'PASS', `Current streak: ${streak.currentStreak}, Max: ${streak.maxStreak}`);

      // Test achievements with progress
      const achievementsWithProgress = await achievementService.getUserAchievementsWithProgress(testUserId);
      this.log('ACHIEVEMENTS', 'Achievements Progress', 'PASS', `Found ${achievementsWithProgress.length} achievements`);

    } catch (error) {
      this.log('ACHIEVEMENTS', 'Achievement System', 'FAIL', error.message);
    }
  }

  /**
   * Test exercise loading and retrieval
   */
  async testExerciseManagement(): Promise<void> {
    console.log('\n📚 Testing Exercise Management...');

    try {
      const languages = await storage.getLanguages();
      
      for (const language of languages.slice(0, 3)) { // Test first 3 languages
        const exercises = await storage.getExercisesByLanguage(language.slug, { limit: 10 });
        this.log('EXERCISES', `${language.name} Exercises`, exercises.length > 0 ? 'PASS' : 'FAIL', 
          `Found ${exercises.length} exercises`);

        if (exercises.length > 0) {
          const exercise = exercises[0];
          
          // Test exercise retrieval by slug
          const exerciseBySlug = await storage.getExerciseBySlug(language.slug, exercise.slug);
          this.log('EXERCISES', `Get Exercise by Slug (${language.name})`, 
            exerciseBySlug ? 'PASS' : 'FAIL', `Exercise: ${exercise.title}`);
        }
      }

      // Test exercise counting
      const exerciseCounts = await storage.getExerciseCountsByLanguage();
      this.log('EXERCISES', 'Exercise Counts', exerciseCounts.length > 0 ? 'PASS' : 'FAIL',
        `${exerciseCounts.length} languages with exercise counts`);

    } catch (error) {
      this.log('EXERCISES', 'Exercise Management', 'FAIL', error.message);
    }
  }

  /**
   * Test API endpoints (basic connectivity)
   */
  async testAPIEndpoints(): Promise<void> {
    console.log('\n🌐 Testing API Endpoints...');

    const endpoints = [
      { path: '/api/languages', method: 'GET', description: 'Languages API' },
      { path: '/api/stats', method: 'GET', description: 'Stats API' },
      { path: '/api/exercise-counts', method: 'GET', description: 'Exercise Counts API' },
      { path: '/api/security/status', method: 'GET', description: 'Security Status API' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000${endpoint.path}`);
        this.log('API', endpoint.description, 
          response.ok ? 'PASS' : 'FAIL', 
          `Status: ${response.status}`);
      } catch (error) {
        this.log('API', endpoint.description, 'FAIL', error.message);
      }
    }
  }

  /**
   * Run all comprehensive tests
   */
  async runAllTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    results: any[];
    summary: string;
  }> {
    console.log('🚀 INICIANDO TESTEO MASIVO Y EXHAUSTIVO DE CODEGYM');
    console.log('======================================================');
    
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;

    // Run all test suites
    await this.testDatabaseOperations();
    await this.testCodeExecution();
    await this.testSecurity();
    await this.testPremiumFeatures();
    await this.testAchievements();
    await this.testExerciseManagement();
    await this.testAPIEndpoints();

    const successRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;

    const summary = `
======================================================
🎯 RESULTADOS DEL TESTEO EXHAUSTIVO
======================================================
📊 Total de pruebas ejecutadas: ${this.totalTests}
✅ Pruebas exitosas: ${this.passedTests}
❌ Pruebas fallidas: ${this.failedTests}
📈 Tasa de éxito: ${successRate.toFixed(1)}%

${successRate >= 90 ? '🟢 SISTEMA LISTO PARA DEPLOY' : 
  successRate >= 75 ? '🟡 SISTEMA NECESITA AJUSTES MENORES' : 
  '🔴 SISTEMA NECESITA CORRECCIONES CRÍTICAS'}
======================================================
    `;

    console.log(summary);

    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate,
      results: this.testResults,
      summary
    };
  }

  /**
   * Generate detailed test report
   */
  generateDetailedReport(): string {
    let report = '# REPORTE DETALLADO DE PRUEBAS CODEGYM\n\n';
    
    const categories = [...new Set(this.testResults.map(r => r.category))];
    
    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const categoryPassed = categoryTests.filter(r => r.status === 'PASS').length;
      const categoryTotal = categoryTests.length;
      
      report += `## ${category}\n`;
      report += `**Éxito: ${categoryPassed}/${categoryTotal} (${((categoryPassed/categoryTotal)*100).toFixed(1)}%)**\n\n`;
      
      categoryTests.forEach(test => {
        report += `- ${test.status === 'PASS' ? '✅' : '❌'} ${test.test}`;
        if (test.details) {
          report += ` - ${test.details}`;
        }
        report += '\n';
      });
      report += '\n';
    });

    return report;
  }
}

export const comprehensiveTests = new ComprehensiveTests();