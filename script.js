// CodeGym - Main Client JavaScript File - VERSIÓN MEJORADA
// This is the main frontend application logic

// Application state
const AppState = {
  currentUser: null,
  currentLanguage: null,
  currentExercise: null,
  exercises: [],
  exerciseCounts: [],
  stats: {
    exercisesSolved: 1213,
    successRate: 94,
    activeUsers: 8
  }
};

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// API service for backend communication
class ApiService {
  static async get(endpoint) {
    try {
      const response = await fetch(`/api${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async post(endpoint, data) {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

// Main App class
class CodeGymApp {
  constructor() {
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.renderHomePage();
    // MEJORA: Se llama a la nueva función para observar las animaciones
    this.observeAnimations(); 
  }

  setupEventListeners() {
    // Language selection
    document.addEventListener('click', (e) => {
      if (e.target.matches('.language-card') || e.target.closest('.language-card')) {
        const card = e.target.closest('.language-card');
        const languageSlug = card.dataset.language;
        this.selectLanguage(languageSlug);
      }
    });

    // Exercise execution
    document.addEventListener('click', (e) => {
      if (e.target.matches('.execute-btn')) {
        this.executeCode();
      }
    });

    // Login/Register buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.login-btn')) {
        window.location.href = '/api/login';
      }
    });
  }

  async loadInitialData() {
    try {
      // Load languages
      const languages = await ApiService.get('/languages');
      AppState.languages = languages;

      // Load stats
      const stats = await ApiService.get('/stats');
      AppState.stats = { ...AppState.stats, ...stats };

      // Load exercise counts
      const exerciseCounts = await ApiService.get('/exercise-counts');
      AppState.exerciseCounts = exerciseCounts;

      // Try to load current user
      try {
        const user = await ApiService.get('/auth/user');
        AppState.currentUser = user;
      } catch (error) {
        // User not authenticated, continue as guest
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  renderHomePage() {
    const app = $('#root');
    if (!app) return;

    app.innerHTML = `
      <main class="min-h-screen">
        <!-- Hero Section -->
        <section class="hero">
          <div class="container">
            <h1>Entrena tus Habilidades con Ejercicios de Programación</h1>
            <p>Resuelve ejercicios interactivos, compite en rankings globales y mejora tus habilidades de programación con nuestra plataforma gamificada para desarrolladores.</p>
            <button class="btn btn-primary btn-lg login-btn">
              Crear Cuenta Gratuita
            </button>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="stats-section">
          <div class="container">
            <div class="stats">
              <div class="stat-item animate-fade-in">
                <div class="stat-number">${AppState.stats.exercisesSolved.toLocaleString()}</div>
                <div class="stat-label">Ejercicios Resueltos</div>
              </div>
              <div class="stat-item animate-fade-in">
                <div class="stat-number">${AppState.stats.successRate}%</div>
                <div class="stat-label">Tasa de Éxito</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Languages Section -->
        <section class="languages-section">
          <div class="container">
            <header class="text-center">
              <h2>Lenguajes Disponibles</h2>
              <p>Elige tu lenguaje favorito y comienza a resolver ejercicios desde principiante hasta experto</p>
            </header>
            <div class="language-grid">
              ${this.renderLanguageCards()}
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features">
          <div class="container">
            <header class="text-center">
              <h2>¿Por Qué Elegir CodeGym?</h2>
              <p>Resuelve problemas de programación diseñados para acelerar tu crecimiento como desarrollador</p>
            </header>
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">💻</div>
                <h3>Editor Profesional</h3>
                <p>Editor de código con resaltado de sintaxis, autocompletado y numeración de líneas.</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏆</div>
                <h3>Compite en Nuestro Ranking</h3>
                <p>Compite por un lugar en el <strong>Top 5</strong> de programadores y demuestra tus habilidades.</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🛡️</div>
                <h3>Ejecución Segura</h3>
                <p>Tu código se ejecuta en entornos aislados y seguros, garantizando la integridad del sistema.</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎮</div>
                <h3>Gamificación</h3>
                <p>Gana puntos, desbloquea insignias y mantén rachas para mantenerte motivado.</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📈</div>
                <h3>Progreso Detallado</h3>
                <p>Visualiza tu progreso con estadísticas detalladas y recibe feedback personalizado.</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <h3>Multiplataforma</h3>
                <p>Accede desde cualquier dispositivo con una experiencia optimizada para móvil, tablet y escritorio.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  renderLanguageCards() {
    if (!AppState.languages) return '<div>Cargando lenguajes...</div>';

    const languageIcons = {
      python: '🐍',
      javascript: '🟨',
      c: '⚡',
      cpp: '➕',
      csharp: '#️⃣',
      html: '🌐'
    };

    return AppState.languages.map(language => {
      const exerciseCount = AppState.exerciseCounts.find(
        count => count.languageSlug === language.slug
      )?.exerciseCount || 0;
      
      return `
        <div class="language-card animate-slide-up" data-language="${language.slug}">
          <div class="language-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            ${languageIcons[language.slug] || '💻'}
          </div>
          <h3>${language.name}</h3>
          <p>${language.description}</p>
          <div class="language-stats">
            <small>${exerciseCount} ejercicios disponibles</small>
          </div>
        </div>
      `;
    }).join('');
  }

  async selectLanguage(languageSlug) {
    try {
      AppState.currentLanguage = languageSlug;
      
      // Load exercises for selected language
      const exercises = await ApiService.get(`/languages/${languageSlug}/exercises`);
      AppState.exercises = exercises;
      
      // Navigate to exercises page
      this.renderExercisesPage();
    } catch (error) {
      console.error('Failed to load exercises:', error);
      this.showNotification('Error al cargar ejercicios', 'error');
    }
  }

  renderExercisesPage() {
    const app = $('#root');
    app.innerHTML = `
      <main class="exercises-page">
        <div class="container">
          <header class="page-header">
            <h1>Ejercicios de ${AppState.currentLanguage.toUpperCase()}</h1>
            <button class="btn btn-secondary" onclick="app.renderHomePage()">← Volver al inicio</button>
          </header>
          
          <div class="exercises-grid">
            ${this.renderExerciseList()}
          </div>
        </div>
      </main>
    `;
  }

  renderExerciseList() {
    if (!AppState.exercises || AppState.exercises.length === 0) {
      return '<div class="no-exercises">No hay ejercicios disponibles</div>';
    }

    return AppState.exercises.map(exercise => `
      <div class="exercise-card" data-exercise-id="${exercise.id}">
        <div class="exercise-header">
          <h3>${exercise.title}</h3>
          <span class="difficulty-badge difficulty-${exercise.difficulty}">${exercise.difficulty}</span>
        </div>
        <p class="exercise-description">${exercise.description.substring(0, 100)}...</p>
        <div class="exercise-meta">
          <span class="points">🏆 ${exercise.points} puntos</span>
          <button class="btn btn-primary" onclick="app.openExercise('${exercise.slug}')">
            Resolver
          </button>
        </div>
      </div>
    `).join('');
  }

  async openExercise(exerciseSlug) {
    try {
      const exercise = await ApiService.get(`/exercises/${exerciseSlug}`);
      this.renderExercisePage(exercise);
    } catch (error) {
      console.error('Failed to load exercise:', error);
      this.showNotification('Error al cargar el ejercicio', 'error');
    }
  }

  renderExercisePage(exercise) {
    AppState.currentExercise = exercise;
    const app = $('#root');
    app.innerHTML = `
      <main class="exercise-page">
        <div class="container">
          <header class="exercise-header">
            <h1>${exercise.title}</h1>
            <div class="exercise-meta">
              <span class="difficulty-badge difficulty-${exercise.difficulty}">${exercise.difficulty}</span>
              <span class="points">🏆 ${exercise.points} puntos</span>
            </div>
          </header>

          <div class="exercise-content">
            <div class="exercise-description">
              <h2>Descripción</h2>
              <div>${exercise.description}</div>
              
              ${exercise.testCases ? `
                <h3>Ejemplos</h3>
                ${exercise.testCases.slice(0, 2).map((testCase, index) => `
                  <div class="example">
                    <strong>Ejemplo ${index + 1}:</strong>
                    <div class="test-case">
                      <div><strong>Entrada:</strong> ${testCase.input || 'Sin entrada'}</div>
                      <div><strong>Salida esperada:</strong> ${testCase.output || testCase.expected || 'No especificada'}</div>
                    </div>
                  </div>
                `).join('')}
              ` : ''}
            </div>

            <div class="code-section">
              <h2>Tu Solución</h2>
              <textarea class="code-editor" id="code-input" placeholder="Escribe tu código aquí...">${exercise.starterCode || ''}</textarea>
              
              <div class="editor-actions">
                <button class="btn btn-primary execute-btn">▶️ Ejecutar Código</button>
                <button class="btn btn-success" onclick="app.submitSolution()">✅ Enviar Solución</button>
              </div>

              <div id="execution-results" class="execution-results"></div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  async executeCode() {
    const codeInput = $('#code-input');
    const resultsDiv = $('#execution-results');
    
    if (!codeInput || !resultsDiv) return;

    const code = codeInput.value.trim();
    if (!code) {
      this.showNotification('Por favor ingresa tu código', 'warning');
      return;
    }

    if (!AppState.currentExercise) {
      this.showNotification('No se encontró el ejercicio actual', 'error');
      return;
    }

    resultsDiv.innerHTML = '<div class="loading">Ejecutando código...</div>';

    try {
      const result = await ApiService.post(`/exercises/${AppState.currentExercise.slug}/execute`, {
        code: code,
        language: AppState.currentLanguage
      });

      this.displayExecutionResults(result, resultsDiv);
    } catch (error) {
      console.error('Execution failed:', error);
      resultsDiv.innerHTML = `
        <div class="terminal error">
          <div>❌ Error al ejecutar el código</div>
          <div>${error.message}</div>
        </div>
      `;
    }
  }

  displayExecutionResults(result, container) {
    const { status, output, error, allTestsPassed, testResults } = result;

    let html = '<div class="terminal">';
    
    if (status === 'success') {
      html += `<div class="success">✅ Código ejecutado exitosamente</div>`;
      if (allTestsPassed) {
        html += `<div class="success">🎉 ¡Todos los tests pasaron!</div>`;
      }
    } else {
      html += `<div class="error">❌ Error en la ejecución</div>`;
    }

    if (output) {
      html += `<div class="output">Salida: ${output}</div>`;
    }

    if (error) {
      html += `<div class="error">Error: ${error}</div>`;
    }

    if (testResults && testResults.length > 0) {
      html += '<div class="test-results">';
      testResults.forEach((test, index) => {
        const status = test.passed ? 'success' : 'error';
        const icon = test.passed ? '✅' : '❌';
        html += `
          <div class="${status}">
            ${icon} Test ${index + 1}: ${test.passed ? 'PASSED' : 'FAILED'}
            ${!test.passed ? `<br>Esperado: ${test.expected}<br>Obtenido: ${test.actual}` : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // MEJORA: Nueva función para animar elementos al hacer scroll
  observeAnimations() {
    const animatedElements = $$('.animate-fade-in, .animate-slide-up');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Cuando el elemento entra en la vista
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          // Dejamos de observar el elemento una vez que la animación se ha disparado
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1 // La animación se dispara cuando el 10% del elemento es visible
    });

    // Pausamos la animación de todos los elementos al inicio y los observamos
    animatedElements.forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CodeGymApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CodeGymApp, ApiService };
}