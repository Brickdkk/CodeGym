import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import CodeEditor from "@/components/CodeEditor";
import GuestSuccessModal from "@/components/GuestSuccessModal";
import CommentsSection from "@/components/CommentsSection";
import ExerciseRankings from "@/components/ExerciseRankings";
import AIErrorExplanation from "@/components/AIErrorExplanation";
import { ArrowLeft, Play, Send, Clock, MemoryStick, Trophy, User, Terminal, Brain, Loader2 } from "lucide-react";
import type { Exercise } from "@shared/schema";

interface ExecutionResult {
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  output?: string;
  error?: string;
  testResults?: Array<{
    testNumber: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    executionTime: number;
  }>;
  summary?: string;
  allTestsPassed?: boolean;
}

export default function ExercisePage() {
  const [match, params] = useRoute("/exercise/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [code, setCode] = useState("");
  const [results, setResults] = useState<ExecutionResult | null>(null);
  const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const { data: exercise, isLoading: exerciseLoading } = useQuery<Exercise>({
    queryKey: [`/api/exercises/${slug}`],
    enabled: !!slug,
  });

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  // Set starter code when exercise is loaded
  useEffect(() => {
    if (exercise?.starterCode) {
      setCode(exercise.starterCode);
    }
  }, [exercise]);

  const executeMutation = useMutation({
    mutationFn: async (code: string) => {
      const endpoint = isAuthenticated ? `/api/exercises/${slug}/submit` : `/api/exercises/${slug}/execute`;
      const response = await apiRequest("POST", endpoint, { code });
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(data.results);
      if (data.results.status === "accepted") {
        if (isAuthenticated) {
          toast({
            title: "¡Correcto!",
            description: "Tu solución es correcta. ¡Felicidades!",
            variant: "default",
          });
          // Invalidate rankings to refresh
          queryClient.invalidateQueries({ queryKey: [`/api/exercises/${slug}/rankings`] });
        } else {
          // Show guest success modal for unregistered users
          setShowGuestSuccessModal(true);
        }
      } else {
        toast({
          title: "Respuesta incorrecta",
          description: "Tu código no pasó todos los casos de prueba.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión para enviar tu solución.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solución.",
        variant: "destructive",
      });
    },
  });

  const runCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", `/api/exercises/${slug}/execute`, { code });
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(data.results);
      toast({
        title: "Código ejecutado",
        description: "Revisa los resultados en el terminal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error de ejecución",
        description: "Hubo un problema al ejecutar tu código.",
        variant: "destructive",
      });
    },
  });

  const explainMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/explain-code", {
        userCode: `// Código del usuario:\n${code}\n\n// Resultado de la ejecución:\n${results?.output || "Sin salida"}`,
        language: Array.isArray(languages) ? languages.find((lang: any) => lang.id === exercise?.languageId)?.slug || "python" : "python",
        exerciseTitle: exercise?.title || "Ejercicio"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setAiExplanation(data.explanation || data.message || JSON.stringify(data));
      toast({
        title: "Explicación generada",
        description: "La IA ha analizado tu código y generado una explicación.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo generar la explicación. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleExplainError = () => {
    if (!results || results.allTestsPassed) return;
    setAiExplanation(null);
    explainMutation.mutate();
  };

  const runCode = () => {
    if (!code.trim()) {
      toast({
        title: "Código vacío",
        description: "Por favor, escribe algo de código antes de ejecutar.",
        variant: "destructive",
      });
      return;
    }

    runCodeMutation.mutate(code);
  };

  const submitCode = () => {
    if (!code.trim()) {
      toast({
        title: "Código vacío",
        description: "Por favor, escribe algo de código antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    executeMutation.mutate(code);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "basic": return "bg-blue-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "Principiante";
      case "basic": return "Básico";
      case "intermediate": return "Intermedio";
      case "advanced": return "Avanzado";
      default: return difficulty;
    }
  };

  if (exerciseLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Ejercicio no encontrado</h1>
            <p className="text-muted-foreground mb-4">
              El ejercicio que buscas no existe o ha sido removido.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <Link href={`/rankings/${slug}`}>
              <Button variant="outline" size="sm">
                <Trophy className="h-4 w-4 mr-2" />
                Ver Ranking
              </Button>
            </Link>
          </div>
        </div>

        {/* Exercise Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Problem Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getDifficultyColor(exercise.difficulty)} text-white`}
                    >
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {exercise.description}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Memoria: {exercise.memoryLimit}MB</span>
                </div>
              </CardContent>
            </Card>

            {/* Test Cases */}
            {exercise.testCases && Array.isArray(exercise.testCases) && (exercise.testCases as any[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ejemplos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exercise.testCases.slice(0, 2).map((testCase: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="text-sm font-medium">Ejemplo {index + 1}:</div>
                        <div className="bg-muted p-3 rounded font-mono text-sm">
                          <div><strong>Entrada:</strong> {testCase.input ? String(testCase.input) : 'Sin entrada'}</div>
                          <div><strong>Salida esperada:</strong> {testCase.output ? String(testCase.output) : testCase.expected ? String(testCase.expected) : 'No especificada'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terminal Output - VS Code Copilot Style */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Terminal de Ejecución
                  </CardTitle>
                  {results.allTestsPassed !== undefined && (
                    <div className="flex items-center gap-2">
                      {results.allTestsPassed ? (
                        <Badge className="bg-green-500 text-white">
                          ✅ Todas las pruebas superadas
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">
                          ❌ Algunas pruebas fallaron
                        </Badge>
                      )}
                      {results.summary && (
                        <span className="text-sm text-muted-foreground">
                          {results.summary}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* AI Explanation Button for failed tests */}
                  {!results.allTestsPassed && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExplainError()}
                        disabled={explainMutation.isPending}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        {explainMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            ¿Por qué falló mi código?
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                    {results.output || "Sin salida"}
                  </div>
                  
                  {/* AI Explanation */}
                  {aiExplanation && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Explicación de IA
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                        {aiExplanation}
                      </div>
                    </div>
                  )}
                  
                  {/* Test Results Details */}
                  {results.testResults && results.testResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Detalles de Casos de Prueba:</h4>
                      {results.testResults.map((test: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            test.passed 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${
                              test.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {test.passed ? '✅' : '❌'} Caso {test.testNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {test.executionTime}ms
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>Entrada:</strong> <code className="bg-muted px-1 rounded">{test.input}</code></div>
                            <div><strong>Esperado:</strong> <code className="bg-muted px-1 rounded">{test.expected}</code></div>
                            <div><strong>Obtenido:</strong> <code className="bg-muted px-1 rounded">{test.actual}</code></div>
                            {!test.passed && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                💡 La salida no coincide con lo esperado
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {(results.executionTime || results.memoryUsed) && (
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      {results.executionTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{results.executionTime}ms</span>
                        </div>
                      )}
                      {results.memoryUsed && (
                        <div className="flex items-center gap-1">
                          <MemoryStick className="h-4 w-4" />
                          <span>{results.memoryUsed}MB</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Test Results Table */}
                  {results.testResults && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Resultados de Casos de Prueba:</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 py-2 text-left">Caso</th>
                              <th className="px-3 py-2 text-left">Entrada</th>
                              <th className="px-3 py-2 text-left">Esperado</th>
                              <th className="px-3 py-2 text-left">Obtenido</th>
                              <th className="px-3 py-2 text-left">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.testResults.map((test: any, index: number) => (
                              <tr key={index} className="border-t">
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2 font-mono">{test.input}</td>
                                <td className="px-3 py-2 font-mono">{test.expected}</td>
                                <td className="px-3 py-2 font-mono">{test.actual}</td>
                                <td className="px-3 py-2">
                                  {test.passed ? (
                                    <span className="text-green-600">✓ Correcto</span>
                                  ) : (
                                    <span className="text-red-600">✗ Incorrecto</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}



                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Editor de Código</CardTitle>
                <CardDescription>
                  Escribe tu solución aquí. Puedes ejecutar el código para probarlo o enviarlo para evaluación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  height="400px"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={runCode}
                disabled={runCodeMutation.isPending}
                variant="outline" 
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {runCodeMutation.isPending ? "Ejecutando..." : "Ejecutar Código"}
              </Button>
              
              <Button 
                onClick={submitCode}
                disabled={executeMutation.isPending || runCodeMutation.isPending}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {executeMutation.isPending ? "Enviando..." : "Enviar Solución"}
              </Button>
            </div>

            {!isAuthenticated && (
              <Card className="border-yellow-500/20 bg-yellow-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Modo Invitado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estás navegando como invitado. Tu progreso no se guardará.
                  </p>
                  <Button size="sm" onClick={() => window.location.href = "/api/login"}>
                    Iniciar Sesión
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {exercise && (
          <div className="mt-8">
            <CommentsSection exerciseId={exercise.id} />
          </div>
        )}

        {/* Exercise Rankings Section */}
        {exercise && (
          <ExerciseRankings 
            exerciseSlug={exercise.slug} 
            key={`rankings-${exercise.slug}-${results?.executionTime}`}
          />
        )}

        {/* Guest Success Modal */}
        {exercise && (
          <GuestSuccessModal
            isOpen={showGuestSuccessModal}
            onClose={() => setShowGuestSuccessModal(false)}
            exerciseTitle={exercise.title}
            executionTime={results?.executionTime}
          />
        )}
      </div>
    </div>
  );
}
