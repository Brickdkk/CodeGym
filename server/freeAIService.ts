export interface CodeExplanation {
  explanation: string;
  improvements: string[];
  concepts: string[];
  difficulty: string;
}

export class FreeAIService {
  private readonly GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
  /**
   * Explain code and suggest improvements using HuggingFace free API
   */
  async explainCode(
    userCode: string,
    language: string,
    exerciseTitle: string,
    userId?: string
  ): Promise<CodeExplanation> {
    try {
      // This is now a free service for all authenticated users
      if (!userId) {
        throw new Error("Debes estar registrado para usar explicaciones de IA.");
      }

      const prompt = this.buildAnalysisPrompt(userCode, language, exerciseTitle);
      const explanation = await this.callGeminiAI(prompt);
      
      return this.parseResponse(explanation);
    } catch (error) {
      console.error("Error explaining code:", error);
      throw new Error(error instanceof Error ? error.message : "Error al explicar el código");
    }
  }

  /**
   * Build analysis prompt for the AI
   */
  private buildAnalysisPrompt(code: string, language: string, exerciseTitle: string): string {
    return `Eres un asistente de programación inteligente especializado en análisis de código. Tu objetivo es ayudar a estudiantes de programación a entender por qué su código falló y cómo mejorarlo.

Analiza el siguiente código ${language} para el ejercicio "${exerciseTitle}":

\`\`\`${language}
${code}
\`\`\`

**Contexto**: Este es código de un estudiante que está aprendiendo programación en una plataforma educativa. El código no pasó algunos casos de prueba.

**Tu tarea**: Proporciona un análisis detallado y educativo que incluya:

1. **¿Qué hace el código actualmente?** - Explica línea por línea de manera simple
2. **¿Por qué puede estar fallando?** - Identifica posibles errores lógicos, sintácticos o de algoritmo
3. **¿Cómo mejorarlo?** - Da sugerencias específicas y ejemplos de código corregido
4. **Conceptos importantes** - Menciona qué conceptos de programación debe reforzar el estudiante
5. **Próximos pasos** - Sugiere qué debería estudiar o practicar a continuación

**Estilo de respuesta**: 
- Usa un tono amigable y motivador
- Explica de manera simple pero técnicamente correcta
- Incluye ejemplos de código cuando sea útil
- Responde en español
- Sé específico sobre los errores encontrados

**Formato**: Estructura tu respuesta con títulos claros para cada sección.`;
  }

  /**
   * Call free AI service (HuggingFace)
   */
  private async callGeminiAI(prompt: string): Promise<string> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }

      const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        return this.generateRuleBasedAnalysis(prompt);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 && 
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      }
      
      return this.generateRuleBasedAnalysis(prompt);
    } catch (error) {
      console.error("Gemini API failed, using fallback:", error);
      return this.generateRuleBasedAnalysis(prompt);
    }
  }

  /**
   * Generate rule-based analysis as fallback
   */
  private generateRuleBasedAnalysis(prompt: string): string {
    const codeMatch = prompt.match(/```[\s\S]*?```|`[^`]+`/);
    const languageMatch = prompt.match(/código de (\w+)/);
    const language = languageMatch ? languageMatch[1].toLowerCase() : 'código';
    
    let analysis = `## Análisis del código ${language}\n\n`;
    
    // Basic code analysis
    if (codeMatch) {
      const code = codeMatch[0].replace(/```/g, '').trim();
      
      // Detect common patterns
      if (code.includes('for') || code.includes('while')) {
        analysis += "**Conceptos utilizados:**\n- Bucles (iteración)\n";
      }
      if (code.includes('if') || code.includes('else')) {
        analysis += "- Estructuras condicionales\n";
      }
      if (code.includes('function') || code.includes('def ') || code.includes('void ')) {
        analysis += "- Funciones\n";
      }
      if (code.includes('[]') || code.includes('array') || code.includes('list')) {
        analysis += "- Arrays/Listas\n";
      }
      
      analysis += "\n**Explicación:**\n";
      analysis += "Este código utiliza estructuras básicas de programación. ";
      
      if (language === 'python') {
        analysis += "Python es un lenguaje interpretado que facilita la lectura del código.";
      } else if (language === 'javascript') {
        analysis += "JavaScript permite manipular datos de forma dinámica.";
      } else if (language === 'c' || language === 'cpp') {
        analysis += "C/C++ requiere gestión manual de memoria y es muy eficiente.";
      }
      
      analysis += "\n\n**Sugerencias de mejora:**\n";
      analysis += "- Añadir comentarios explicativos\n";
      analysis += "- Usar nombres de variables más descriptivos\n";
      analysis += "- Considerar casos edge\n";
      analysis += "- Optimizar la complejidad algorítmica si es posible\n";
      
      // Determine difficulty
      const complexPatterns = ['recursion', 'callback', 'async', 'malloc', 'pointer'];
      const hasComplexPatterns = complexPatterns.some(pattern => 
        code.toLowerCase().includes(pattern)
      );
      
      if (hasComplexPatterns) {
        analysis += "\n**Nivel:** Avanzado";
      } else if (code.includes('for') || code.includes('function')) {
        analysis += "\n**Nivel:** Intermedio";
      } else {
        analysis += "\n**Nivel:** Principiante";
      }
    }
    
    return analysis;
  }

  /**
   * Parse AI response into structured format
   */
  private parseResponse(response: string): CodeExplanation {
    const concepts: string[] = [];
    const improvements: string[] = [];
    
    // Extract concepts
    const conceptsMatch = response.match(/conceptos?[^:]*:([^#\n]*(?:\n- [^#\n]*)*)/i);
    if (conceptsMatch) {
      const conceptsText = conceptsMatch[1];
      concepts.push(...conceptsText.split(/[,\n-]/).map(c => c.trim()).filter(c => c.length > 0));
    }
    
    // Extract improvements
    const improvementsMatch = response.match(/mejora[^:]*:([^#\n]*(?:\n- [^#\n]*)*)/i);
    if (improvementsMatch) {
      const improvementsText = improvementsMatch[1];
      improvements.push(...improvementsText.split(/[,\n-]/).map(i => i.trim()).filter(i => i.length > 0));
    }
    
    // Extract difficulty
    let difficulty = "intermedio";
    if (response.toLowerCase().includes("principiante")) {
      difficulty = "principiante";
    } else if (response.toLowerCase().includes("avanzado")) {
      difficulty = "avanzado";
    }
    
    return {
      explanation: response,
      improvements: improvements.length > 0 ? improvements : [
        "Añadir comentarios explicativos",
        "Usar nombres de variables más descriptivos",
        "Considerar casos edge"
      ],
      concepts: concepts.length > 0 ? concepts : [
        "Estructuras de control",
        "Variables y tipos de datos"
      ],
      difficulty
    };
  }
}

export const freeAIService = new FreeAIService();