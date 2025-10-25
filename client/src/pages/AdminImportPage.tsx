import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ImportResult {
  success: boolean;
  exercisesImported: number;
  languagesCreated: number;
  errors: string[];
  details: {
    exercises: Array<{ title: string; slug: string; status: 'created' | 'updated' | 'error' }>;
    languages: Array<{ name: string; slug: string; status: 'created' | 'existing' }>;
  };
  parseErrors?: string[];
}

export default function AdminImportPage() {
  const [exerciseJson, setExerciseJson] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [filename, setFilename] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const importExercisesMutation = useMutation({
    mutationFn: async (exercises: any[]) => {
      const response = await apiRequest("POST", "/api/admin/import/exercises", { exercises });
      return await response.json();
    },
    onSuccess: (data: ImportResult) => {
      setImportResult(data);
      toast({
        title: data.success ? "Importación exitosa" : "Importación con errores",
        description: `${data.exercisesImported} ejercicios importados, ${data.languagesCreated} lenguajes creados`,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Error en la importación",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const parseMarkdownMutation = useMutation({
    mutationFn: async ({ content, name }: { content: string; name: string }) => {
      const response = await apiRequest("POST", "/api/admin/import/parse-markdown", {
        markdownContent: content,
        filename: name
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.exercise) {
        setExerciseJson(JSON.stringify([data.exercise], null, 2));
        toast({
          title: "Markdown parseado",
          description: "El archivo se ha convertido a formato de ejercicio"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error al parsear",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const batchImportMutation = useMutation({
    mutationFn: async (files: Array<{ content: string; filename: string }>) => {
      const response = await apiRequest("POST", "/api/admin/import/batch-markdown", { files });
      return await response.json();
    },
    onSuccess: (data: ImportResult) => {
      setImportResult(data);
      toast({
        title: data.success ? "Importación masiva exitosa" : "Importación con errores",
        description: `${data.exercisesImported} ejercicios importados`,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Error en importación masiva",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleJsonImport = () => {
    try {
      const exercises = JSON.parse(exerciseJson);
      if (!Array.isArray(exercises)) {
        throw new Error("El JSON debe ser un array de ejercicios");
      }
      importExercisesMutation.mutate(exercises);
    } catch (error) {
      toast({
        title: "JSON inválido",
        description: "Verifica el formato del JSON",
        variant: "destructive"
      });
    }
  };

  const handleMarkdownParse = () => {
    if (!markdownContent.trim() || !filename.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Ingresa el contenido markdown y el nombre del archivo",
        variant: "destructive"
      });
      return;
    }
    parseMarkdownMutation.mutate({ content: markdownContent, name: filename });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'markdown') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'json') {
        setExerciseJson(content);
      } else {
        setMarkdownContent(content);
        setFilename(file.name);
      }
    };
    reader.readAsText(file);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'existing':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'created':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'existing':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importar Ejercicios desde GitHub</h1>
        <p className="text-muted-foreground">
          Herramientas para importar ejercicios desde repositorios de GitHub y archivos Markdown
        </p>
      </div>

      <Tabs defaultValue="instructions" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
          <TabsTrigger value="json">Importar JSON</TabsTrigger>
          <TabsTrigger value="markdown">Parsear Markdown</TabsTrigger>
          <TabsTrigger value="batch">Importación Masiva</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cómo integrar tu herramienta de GitHub</CardTitle>
              <CardDescription>
                Sigue estos pasos para conectar tu proyecto de importación de GitHub con CodeGym
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold">Preparar tu herramienta de Node.js</h3>
                    <p className="text-sm text-muted-foreground">
                      Tu herramienta debe ser capaz de leer archivos Markdown desde GitHub y convertirlos al siguiente formato JSON:
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded font-mono text-sm">
{`{
  "title": "Suma de dos números",
  "description": "Implementa una función que sume dos números",
  "difficulty": "beginner", // beginner | intermediate | advanced | expert
  "language": "python", // python | javascript | java | cpp | c
  "starterCode": "def suma(a, b):\\n    pass",
  "solution": "def suma(a, b):\\n    return a + b",
  "testCases": [
    {"input": "1, 2", "output": "3"},
    {"input": "5, 7", "output": "12"}
  ],
  "tags": ["matemáticas", "básico"]
}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold">Endpoints disponibles</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      CodeGym proporciona estos endpoints para tu herramienta:
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">POST /api/admin/import/exercises</code>
                        <p className="text-xs text-muted-foreground">Importa un array de ejercicios en formato JSON</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">POST /api/admin/import/parse-markdown</code>
                        <p className="text-xs text-muted-foreground">Convierte un archivo Markdown individual a formato de ejercicio</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">POST /api/admin/import/batch-markdown</code>
                        <p className="text-xs text-muted-foreground">Procesa múltiples archivos Markdown de una vez</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold">Ejemplo de integración</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Código de ejemplo para tu herramienta de Node.js:
                    </p>
                    <div className="p-3 bg-muted rounded font-mono text-sm overflow-x-auto">
{`const axios = require('axios');

// Función para importar ejercicios a CodeGym
async function importToCodeGym(exercises) {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/import/exercises', {
      exercises: exercises
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Agregar headers de autenticación si es necesario
      }
    });
    
    console.log('Importación exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en importación:', error.response?.data || error.message);
    throw error;
  }
}

// Ejemplo de uso
const ejercicios = [
  {
    title: "Suma de dos números",
    description: "Implementa una función que sume dos números",
    difficulty: "beginner",
    language: "python",
    starterCode: "def suma(a, b):\\n    pass",
    testCases: [{"input": "1, 2", "output": "3"}]
  }
];

importToCodeGym(ejercicios);`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h3 className="font-semibold">Autenticación</h3>
                    <p className="text-sm text-muted-foreground">
                      Los endpoints de importación requieren autenticación. Asegúrate de estar logueado en CodeGym 
                      antes de hacer las peticiones desde tu herramienta.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Importar desde JSON</span>
              </CardTitle>
              <CardDescription>
                Pega o carga un archivo JSON con ejercicios en el formato requerido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-upload">Cargar archivo JSON</Label>
                <Input
                  id="json-upload"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileUpload(e, 'json')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise-json">JSON de ejercicios</Label>
                <Textarea
                  id="exercise-json"
                  placeholder="Pega aquí el JSON con los ejercicios..."
                  value={exerciseJson}
                  onChange={(e) => setExerciseJson(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleJsonImport}
                disabled={importExercisesMutation.isPending || !exerciseJson.trim()}
                className="w-full"
              >
                {importExercisesMutation.isPending ? "Importando..." : "Importar Ejercicios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Parsear Markdown</span>
              </CardTitle>
              <CardDescription>
                Convierte un archivo Markdown individual al formato de ejercicio JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="md-upload">Cargar archivo Markdown</Label>
                <Input
                  id="md-upload"
                  type="file"
                  accept=".md,.txt"
                  onChange={(e) => handleFileUpload(e, 'markdown')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filename">Nombre del archivo</Label>
                <Input
                  id="filename"
                  placeholder="ejercicio.md"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markdown-content">Contenido Markdown</Label>
                <Textarea
                  id="markdown-content"
                  placeholder="Pega aquí el contenido del archivo Markdown..."
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  rows={10}
                />
              </div>

              <Button 
                onClick={handleMarkdownParse}
                disabled={parseMarkdownMutation.isPending || !markdownContent.trim() || !filename.trim()}
                className="w-full"
              >
                {parseMarkdownMutation.isPending ? "Parseando..." : "Parsear a JSON"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Importación Masiva</span>
              </CardTitle>
              <CardDescription>
                Para importación masiva desde GitHub, usa tu herramienta externa que se conecte a los endpoints de la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  La importación masiva está diseñada para ser usada desde tu herramienta de Node.js externa. 
                  Consulta las instrucciones en la pestaña "Instrucciones" para ver cómo integrarla.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      {importResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {importResult.success ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> : 
                <XCircle className="h-5 w-5 text-red-500" />
              }
              <span>Resultado de la Importación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded">
                <div className="text-2xl font-bold text-green-600">{importResult.exercisesImported}</div>
                <div className="text-sm text-muted-foreground">Ejercicios Importados</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded">
                <div className="text-2xl font-bold text-blue-600">{importResult.languagesCreated}</div>
                <div className="text-sm text-muted-foreground">Lenguajes Creados</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
            </div>

            {importResult.details.exercises.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Ejercicios procesados:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.details.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="truncate">{exercise.title}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(exercise.status)}
                        <Badge variant={getStatusBadgeVariant(exercise.status) as any}>
                          {exercise.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Errores:</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}