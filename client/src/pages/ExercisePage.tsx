import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import CodeEditor from "@/components/CodeEditor";
import GuestSuccessModal from "@/components/GuestSuccessModal";
import CommentsSection from "@/components/CommentsSection";
import ExerciseRankings from "@/components/ExerciseRankings";
import TestResultsFeedback from "@/components/TestResultsFeedback";
import SuccessAnimation from "@/components/SuccessAnimation";
import { ArrowLeft, Play, Send, MemoryStick, Trophy, User } from "lucide-react";
import type { Exercise } from "@shared/schema";
import { runCode, submitCode } from "@/lib/testRunner";
import type { RunResult } from "@/lib/testRunner";
import { optimisticProgressUpdate } from "@/lib/progressSync";

export default function ExercisePage() {
  const [match, params] = useRoute("/exercise/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [code, setCode] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);

  const { data: exercise, isLoading: exerciseLoading } = useQuery<Exercise>({
    queryKey: [`/api/exercises/${slug}`],
    enabled: !!slug,
  });

  const { data: languages } = useQuery<Array<{ id: number; slug: string }>>({
    queryKey: ["/api/languages"],
  });

  // Derive the language slug from the exercise's languageId
  const languageSlug = languages?.find(
    (l) => l.id === exercise?.languageId
  )?.slug ?? "javascript";

  // Map language slug to CodeEditor language string
  const editorLanguage = (() => {
    switch (languageSlug) {
      case "python": return "python";
      case "javascript": return "javascript";
      case "cpp": return "cpp";
      case "c": return "c";
      case "html-css": return "html";
      default: return "javascript";
    }
  })();

  // Set starter code when exercise is loaded
  useEffect(() => {
    if (exercise?.starterCode) {
      setCode(exercise.starterCode);
    }
  }, [exercise]);

  // "Ejecutar Codigo" — run locally, no auth needed
  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Codigo vacio",
        description: "Por favor, escribe algo de codigo antes de ejecutar.",
        variant: "destructive",
      });
      return;
    }
    if (!slug) return;

    setIsRunning(true);
    setResult(null);
    try {
      const runResult = await runCode(slug, code);
      setResult(runResult);
      toast({
        title: "Codigo ejecutado",
        description: "Revisa los resultados abajo.",
      });
    } catch (err: any) {
      toast({
        title: "Error de ejecucion",
        description: err?.message || "Hubo un problema al ejecutar tu codigo.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, slug, toast]);

  // "Enviar Solucion" — run locally, then persist if authenticated
  const handleSubmitCode = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Codigo vacio",
        description: "Por favor, escribe algo de codigo antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    if (!slug) return;

    setIsSubmitting(true);
    setResult(null);
    try {
      if (isAuthenticated) {
        // Authenticated: run + persist
        const { runResult } = await submitCode(slug, code);
        setResult(runResult);

        if (runResult.allTestsPassed) {
          setShowSuccess(true);
          toast({
            title: "Correcto!",
            description: "Tu solucion es correcta. Felicidades!",
            variant: "default",
          });
          // Optimistic: instant XP + streak update in cache
          optimisticProgressUpdate(
            exercise?.points ?? 10,
            runResult.totalExecutionTime,
          );
          queryClient.invalidateQueries({ queryKey: [`/api/exercises/${slug}/rankings`] });
        } else {
          toast({
            title: "Respuesta incorrecta",
            description: "Tu codigo no paso todos los casos de prueba.",
            variant: "destructive",
          });
        }
      } else {
        // Guest: run locally only, show guest modal on success
        const runResult = await runCode(slug, code);
        setResult(runResult);

        if (runResult.allTestsPassed) {
          setShowGuestSuccessModal(true);
        } else {
          toast({
            title: "Respuesta incorrecta",
            description: "Tu codigo no paso todos los casos de prueba.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Hubo un problema al enviar tu solucion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, slug, isAuthenticated, toast]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "Principiante";
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

            {/* Test Cases Examples */}
            {!!(exercise.testCases && Array.isArray(exercise.testCases) && (exercise.testCases as any[]).length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ejemplos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(exercise.testCases as any[]).slice(0, 2).map((testCase: any, index: number) => (
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

            {/* Test Results — replaced inline terminal with TestResultsFeedback */}
            {result && (
              <TestResultsFeedback result={result} />
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Editor de Codigo</CardTitle>
                <CardDescription>
                  Escribe tu solucion aqui. Puedes ejecutar el codigo para probarlo o enviarlo para evaluacion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={editorLanguage}
                  height="400px"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                variant="outline" 
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Ejecutando..." : "Ejecutar Codigo"}
              </Button>
              
              <Button 
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Solucion"}
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
                    Estas navegando como invitado. Tu progreso no se guardara.
                  </p>
                  <Button size="sm" onClick={() => window.location.href = "/api/login"}>
                    Iniciar Sesion
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
            key={`rankings-${exercise.slug}-${result?.totalExecutionTime}`}
          />
        )}

        {/* Guest Success Modal */}
        {exercise && (
          <GuestSuccessModal
            isOpen={showGuestSuccessModal}
            onClose={() => setShowGuestSuccessModal(false)}
            exerciseTitle={exercise.title}
            executionTime={result?.totalExecutionTime}
          />
        )}

        {/* Success celebration animation */}
        <SuccessAnimation
          show={showSuccess}
          onComplete={() => setShowSuccess(false)}
        />
      </div>
    </div>
  );
}
