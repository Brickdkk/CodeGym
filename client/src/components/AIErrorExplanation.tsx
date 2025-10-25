import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Crown, Lightbulb, AlertCircle, CheckCircle, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIErrorExplanationProps {
  userCode: string;
  expectedOutput: string;
  actualOutput: string;
  language: string;
  exerciseTitle: string;
}

interface CodeErrorAnalysis {
  errorType: string;
  probableCause: string;
  whatWentWrong: string;
  expectedBehavior: string;
  suggestions: string[];
  codeExample?: string;
}

export default function AIErrorExplanation({
  userCode,
  expectedOutput,
  actualOutput,
  language,
  exerciseTitle
}: AIErrorExplanationProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // AI error explanation mutation using free Gemini service
  const explainErrorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/explain-code", {
        method: "POST",
        body: JSON.stringify({
          userCode: `// Código del usuario:\n${userCode}\n\n// Salida esperada: ${expectedOutput}\n// Salida obtenida: ${actualOutput}`,
          language,
          exerciseTitle
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error("Failed to get explanation");
      return response.json();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo obtener la explicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleExplainError = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    explainErrorMutation.mutate();
    setIsDialogOpen(true);
  };

  const analysis = explainErrorMutation.data as CodeErrorAnalysis;

  return (
    <>
      <Button
        onClick={handleExplainError}
        variant="outline"
        size="sm"
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-blue-500/20"
        disabled={explainErrorMutation.isPending}
      >
        <Brain className="h-4 w-4 mr-2" />
        {explainErrorMutation.isPending ? "Analizando..." : "¿Por qué falló mi código?"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              Análisis de Error con IA
            </DialogTitle>
            <DialogDescription>
              Explicación detallada de tu error de código
            </DialogDescription>
          </DialogHeader>

          {explainErrorMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3">Analizando tu código...</span>
            </div>
          )}

          {explainErrorMutation.data && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Análisis de tu Código
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {typeof explainErrorMutation.data === 'string' 
                        ? explainErrorMutation.data 
                        : explainErrorMutation.data.explanation || 
                          explainErrorMutation.data.message || 
                          JSON.stringify(explainErrorMutation.data)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Example */}
              {analysis.codeExample && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-500" />
                      Ejemplo de Código Corregido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{analysis.codeExample}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}