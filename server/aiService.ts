import { checkUserSubscription } from './mercadopago.js';

// La interfaz para la respuesta estructurada se mantiene igual
export interface CodeErrorAnalysis {
  errorType: string;
  probableCause: string;
  whatWentWrong: string;
  expectedBehavior: string;
  suggestions: string[];
  codeExample?: string;
}

export class AIService {
  private geminiApiKey: string;

  constructor() {
    // Ahora usamos la clave de Gemini, que es la única que tenemos
    this.geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
  }

  /**
   * Analiza errores de código usando la API de Google Gemini (Función Premium).
   */
  async explainCodeError(
    userId: string,
    userCode: string,
    expectedOutput: string,
    actualOutput: string,
    language: string,
    exerciseTitle: string
  ): Promise<CodeErrorAnalysis> {
    // 1. La verificación de suscripción Premium se mantiene igual
    const isPremium = await checkUserSubscription(userId);
    if (!isPremium) {
      throw new Error('Esta función requiere suscripción premium');
    }

    if (!this.geminiApiKey) {
      throw new Error('La clave de API de Google Gemini no está configurada.');
    }

    // 2. Creamos un prompt optimizado para Gemini solicitando una respuesta JSON
    const prompt = `
      Eres un tutor de programación experto. Analiza el siguiente error de código en ${language} para el ejercicio "${exerciseTitle}".

      CÓDIGO DEL USUARIO:
      \`\`\`${language}
      ${userCode}
      \`\`\`

      SALIDA ESPERADA:
      \`\`\`
      ${expectedOutput}
      \`\`\`

      SALIDA OBTENIDA (ERROR):
      \`\`\`
      ${actualOutput}
      \`\`\`

      Tu tarea es devolver un objeto JSON con el siguiente formato, sin texto adicional:
      {
        "errorType": "Tipo de error (Ej: 'Error de Lógica', 'Error de Sintaxis')",
        "probableCause": "La causa más probable del error en una frase.",
        "whatWentWrong": "Explicación detallada de qué salió mal y por qué.",
        "expectedBehavior": "Explicación de por qué la salida esperada era la correcta.",
        "suggestions": ["Array con 3 sugerencias claras y accionables para corregir el código."],
        "codeExample": "Un bloque de código corregido que solucione el problema."
      }
    `;

    try {
      // 3. Usamos la lógica de llamada a la API de Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la API de Gemini: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponseText = data.candidates[0]?.content?.parts[0]?.text;

      if (!aiResponseText) {
        throw new Error('Respuesta inesperada de la API de Gemini.');
      }

      // 4. Parseamos la respuesta JSON de Gemini
      const analysis = JSON.parse(aiResponseText) as CodeErrorAnalysis;
      return analysis;

    } catch (error) {
      console.error('Error llamando a la API de Gemini:', error);
      throw new Error('No se pudo generar el análisis del error.');
    }
  }

  /**
   * Genera recomendaciones personalizadas (también podría usar Gemini).
   */
  async getPersonalizedRecommendations(
    userId: string,
    userProgress: any[],
    preferredLanguages: string[]
  ): Promise<any[]> {
    // Esta función también podría ser adaptada para usar Gemini en el futuro.
    // Por ahora, se mantiene la lógica de verificación premium.
    const isPremium = await checkUserSubscription(userId);
    if (!isPremium) {
      throw new Error('Esta función requiere suscripción premium');
    }

    // Lógica de recomendación (actualmente simulada)
    return [
      {
        title: 'Desafío de Algoritmos en ' + (preferredLanguages[0] || 'tu lenguaje'),
        description: 'Basado en tu progreso, te recomendamos practicar algoritmos de ordenamiento.',
        difficulty: 'intermediate',
        estimatedTime: '45 minutos'
      }
    ];
  }
}

export const aiService = new AIService();