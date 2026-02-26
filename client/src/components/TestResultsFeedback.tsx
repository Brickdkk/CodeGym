/**
 * TestResultsFeedback.tsx — Static pedagogical display of test results.
 *
 * Shows each test case result with clear pass/fail indicators, input/expected/actual
 * values, and helpful static error hints (no AI). Uses Framer Motion for smooth
 * reveal animations.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { RunResult, TestResult } from "@/lib/wasmExecutor";

interface TestResultsFeedbackProps {
  result: RunResult;
}

/**
 * Static pedagogical hints — no AI, just pattern-based tips.
 */
function getHint(test: TestResult): string | null {
  if (test.passed) return null;

  if (test.error) {
    if (test.error.includes('Time limit')) {
      return "Tu código tardó demasiado. Revisa si tienes bucles infinitos o una complejidad excesiva.";
    }
    if (test.error.includes('SyntaxError') || test.error.includes('syntax')) {
      return "Hay un error de sintaxis en tu código. Revisa paréntesis, llaves y punto y coma.";
    }
    if (test.error.includes('NameError') || test.error.includes('is not defined')) {
      return "Estás usando una variable o función que no ha sido definida. Verifica los nombres.";
    }
    if (test.error.includes('TypeError')) {
      return "Hay un error de tipo. Asegúrate de que las operaciones son compatibles con los tipos de datos.";
    }
    if (test.error.includes('IndexError') || test.error.includes('out of range') || test.error.includes('out of bounds')) {
      return "Estás accediendo a un índice fuera del rango. Verifica los límites de tus arreglos.";
    }
    return "Revisa el mensaje de error para encontrar pistas sobre qué salió mal.";
  }

  const expected = test.expected.trim();
  const actual = test.actual.trim();

  if (actual === '') {
    return "Tu código no produce ninguna salida. Asegúrate de imprimir el resultado.";
  }

  // Check if it's a whitespace/newline difference
  if (actual.replace(/\s+/g, '') === expected.replace(/\s+/g, '')) {
    return "La respuesta es casi correcta pero tiene diferencias de espacios o saltos de línea.";
  }

  // Check if it's a case difference
  if (actual.toLowerCase() === expected.toLowerCase()) {
    return "La respuesta es correcta pero con diferencias de mayúsculas/minúsculas.";
  }

  return "Compara tu salida con la esperada. Verifica tu lógica paso a paso con la entrada dada.";
}

function StatusIcon({ status }: { status: RunResult['status'] }) {
  switch (status) {
    case 'accepted':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'wrong_answer':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'runtime_error':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'time_limit_exceeded':
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
}

function statusLabel(status: RunResult['status']): string {
  switch (status) {
    case 'accepted': return 'Todas las pruebas superadas';
    case 'wrong_answer': return 'Algunas pruebas fallaron';
    case 'runtime_error': return 'Error en tiempo de ejecución';
    case 'time_limit_exceeded': return 'Tiempo límite excedido';
  }
}

function statusColor(status: RunResult['status']): string {
  switch (status) {
    case 'accepted': return 'bg-green-500';
    case 'wrong_answer': return 'bg-red-500';
    case 'runtime_error': return 'bg-orange-500';
    case 'time_limit_exceeded': return 'bg-yellow-500';
  }
}

export default function TestResultsFeedback({ result }: TestResultsFeedbackProps) {
  const passedCount = result.testResults.filter(t => t.passed).length;
  const totalCount = result.testResults.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Resultados de Ejecución
          </CardTitle>
          <div className="flex items-center gap-2">
            <StatusIcon status={result.status} />
            <Badge className={`${statusColor(result.status)} text-white`}>
              {statusLabel(result.status)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span>{passedCount}/{totalCount} pruebas correctas</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{result.totalExecutionTime}ms</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="sync">
          <div className="space-y-3">
            {result.testResults.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`p-3 rounded-lg border ${
                  test.passed
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {test.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    test.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    Caso {index + 1}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {test.executionTime}ms
                  </span>
                </div>
                <div className="text-sm space-y-1 font-mono">
                  <div>
                    <span className="text-muted-foreground">Entrada: </span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{test.input || '(vacío)'}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Esperado: </span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{test.expected}</code>
                  </div>
                  {!test.passed && (
                    <div>
                      <span className="text-muted-foreground">Obtenido: </span>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{test.actual || '(sin salida)'}</code>
                    </div>
                  )}
                  {test.error && (
                    <div className="text-xs text-red-500 dark:text-red-400 mt-1 font-sans">
                      Error: {test.error}
                    </div>
                  )}
                </div>
                {/* Static pedagogical hint */}
                {!test.passed && (() => {
                  const hint = getHint(test);
                  return hint ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.15 }}
                      className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5 font-sans"
                    >
                      <span className="shrink-0">💡</span>
                      <span>{hint}</span>
                    </motion.div>
                  ) : null;
                })()}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
