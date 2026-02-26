import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Users, Trophy, Play } from "lucide-react";
import type { Language, Exercise } from "@shared/schema";

// Import language logos
import pythonLogo from '@/assets/logo-python.png';
import cLogo from '@/assets/logo-c.png';
import cppLogo from '@/assets/logo-cpp.png';
import htmlCssLogo from '@/assets/logo-html-css.png';
import javascriptLogo from '@/assets/logo-javascript.png';

// Function to get the appropriate logo for each language
const getLanguageLogo = (slug: string): string | undefined => {
  switch (slug.toLowerCase()) {
    case 'python':
      return pythonLogo;
    case 'c':
      return cLogo;
    case 'cpp':
    case 'c++':
      return cppLogo;
    case 'javascript':
      return javascriptLogo;
    case 'html':
    case 'css':
      return htmlCssLogo;
    default:
      return undefined;
  }
};

export default function LanguagePage() {
  const [match, params] = useRoute("/language/:slug");
  const slug = params?.slug;

  const { data: language, isLoading: languageLoading } = useQuery<Language>({
    queryKey: [`/api/languages/${slug}`],
    enabled: !!slug,
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: [`/api/languages/${slug}/exercises`],
    enabled: !!slug,
  });

  const getDifficultyColor = (difficulty: string) => {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
      case "easy":
      case "basic":
      case "principiante":
        return "bg-green-500";
      case "intermediate":
      case "medium":
      case "intermedio":
        return "bg-yellow-500";
      case "advanced":
      case "hard":
      case "avanzado":
        return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "beginner":
      case "easy":
      case "basic":
      case "principiante":
        return "Principiante";
      case "intermediate":
      case "medium":
      case "intermedio":
        return "Intermedio";
      case "advanced":
      case "hard":
      case "avanzado":
        return "Avanzado";
      default: return difficulty;
    }
  };

  const normalizeDifficulty = (difficulty: string) => {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case "easy":
      case "basic":
      case "principiante":
        return "beginner";
      case "medium":
      case "intermedio":
        return "intermediate";
      case "hard":
      case "avanzado":
        return "advanced";
      default:
        return normalizedDifficulty;
    }
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    const normalizedDifficulty = normalizeDifficulty(exercise.difficulty);
    if (!acc[normalizedDifficulty]) {
      acc[normalizedDifficulty] = [];
    }
    acc[normalizedDifficulty].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  if (languageLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8"></div>
            <div className="h-12 bg-muted rounded mb-4"></div>
            <div className="h-6 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Lenguaje no encontrado</h1>
            <p className="text-muted-foreground mb-4">
              El lenguaje que buscas no existe o ha sido removido.
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Language Info */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-6">            <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-muted/50">
              {language && language.slug ? (
                (() => {
                  const logoSrc = getLanguageLogo(language.slug);
                  return logoSrc ? (
                    <img 
                      src={logoSrc} 
                      alt={`${language.name} logo`}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                      style={{ background: language.color }}
                    >
                      <i className={language.icon}></i>
                    </div>
                  );
                })()
              ) : null}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Ejercicios de {language.name}</h1>
              <p className="text-xl text-muted-foreground">{language.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{exercises.length}</div>
                  <div className="text-sm text-muted-foreground">Ejercicios</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-sm text-muted-foreground">Participantes</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-sm text-muted-foreground">Tasa de éxito</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercises */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Ejercicios por Dificultad</h2>
          
          <Tabs defaultValue="beginner" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="beginner">Principiante</TabsTrigger>
              <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            {["beginner", "intermediate", "advanced"].map((difficulty) => (
              <TabsContent key={difficulty} value={difficulty} className="mt-6">
                {exercisesLoading ? (
                  <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 bg-muted rounded"></div>
                            <div className="h-6 w-20 bg-muted rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {groupedExercises[difficulty]?.length > 0 ? (
                      groupedExercises[difficulty].map((exercise) => (
                        <Link key={exercise.id} href={`/exercise/${exercise.slug}`}>
                          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
                                  <p className="text-muted-foreground mb-4 line-clamp-2">
                                    {exercise.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="secondary" 
                                      className={`${getDifficultyColor(exercise.difficulty)} text-white`}
                                    >
                                      {getDifficultyLabel(exercise.difficulty)}
                                    </Badge>

                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="text-muted-foreground">
                            No hay ejercicios disponibles para este nivel de dificultad.
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
