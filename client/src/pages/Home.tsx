import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LanguageCard from "@/components/LanguageCard";
import { useAuth } from "@/hooks/useAuth";
import { Code, Trophy, Shield, Gamepad2, TrendingUp, Smartphone, Rocket, UserPlus, Play } from "lucide-react";
import type { Language } from "@shared/schema";

// Import language logos
import pythonLogo from '@/assets/logo-python.png';
import cLogo from '@/assets/logo-c.png';
import cppLogo from '@/assets/logo-cpp.png';
import htmlCssLogo from '@/assets/logo-html-css.png';
import javascriptLogo from '@/assets/logo-javascript.png';

interface Stats {
  activeUsers: number;
  exercisesSolved: number;
  successRate: number;
}

interface ExerciseCount {
  languageSlug: string;
  languageName: string;
  exerciseCount: number;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  const { data: languages = [], isLoading: languagesLoading } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  // Fetch exercise counts with 10-minute refresh interval
  const { data: exerciseCounts = [], isLoading: countsLoading } = useQuery<ExerciseCount[]>({
    queryKey: ["/api/exercise-counts"],
    refetchInterval: 10 * 60 * 1000, // 10 minutes in milliseconds
    refetchIntervalInBackground: true,
  });
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
      case 'html-css':
        return htmlCssLogo;
      default:
        return undefined;
    }
  };

  const handleGetStarted = () => {
    // In a real app, this would trigger registration or navigate to exercises
    window.location.href = "/api/login";
  };

  const handleStartGuest = () => {
    // Navigate to first available language or show language selection
    if (languages.length > 0) {
      window.location.href = `/language/${languages[0].slug}`;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Entrena tus Habilidades con Ejercicios de Programación
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Resuelve ejercicios interactivos, compite en rankings globales y mejora tus habilidades de programación 
              con nuestra plataforma gamificada para desarrolladores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3 animate-bounce-subtle"
                onClick={handleGetStarted}
              >
                <Play className="mr-2 h-5 w-5" />
                Crear Cuenta Gratuita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div className="animate-slide-up">
              <div className="text-3xl font-bold text-primary mb-2">
                {statsLoading ? "..." : stats?.exercisesSolved?.toLocaleString() || "1,213"}
              </div>
              <div className="text-muted-foreground">Ejercicios Resueltos</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-3xl font-bold text-primary mb-2">
                {statsLoading ? "..." : `${stats?.successRate || 94}%`}
              </div>
              <div className="text-muted-foreground">Tasa de Éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Lenguajes Disponibles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige tu lenguaje favorito y comienza a resolver ejercicios desde principiante hasta experto
            </p>
          </header>

          {languagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-8 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-lg mb-6"></div>
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {languages.map((language) => {
                const exerciseCount = exerciseCounts.find(
                  count => count.languageSlug === language.slug
                )?.exerciseCount;
                  return (
                  <LanguageCard 
                    key={language.id} 
                    language={language} 
                    exerciseCount={exerciseCount}
                    image={getLanguageLogo(language.slug)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">¿Por Qué Elegir CodeGym?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Resuelve problemas de programación con ejercicios de programación diseñados para acelerar tu crecimiento como desarrollador
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Code className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Editor Profesional</h3>
              <p className="text-muted-foreground">
                Editor de código con resaltado de sintaxis, autocompletado y numeración de líneas para resolver problemas de programación como en tu IDE favorito.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Compite en Nuestro Ranking</h3>
              <p className="text-muted-foreground">
                Compite por un lugar en el <strong>Top 5</strong> de programadores y demuestra tus habilidades en tiempo real.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Ejecución Segura</h3>
              <p className="text-muted-foreground">
                Tu código se ejecuta en entornos aislados y seguros, garantizando la integridad del sistema.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gamificación</h3>
              <p className="text-muted-foreground">
                Gana puntos, desbloquea insignias y mantén rachas resolviendo ejercicios de programación para mantenerte motivado.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Progreso Detallado</h3>
              <p className="text-muted-foreground">
                Visualiza tu progreso con estadísticas detalladas y recibe feedback personalizado en cada ejercicio.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Multiplataforma</h3>
              <p className="text-muted-foreground">
                Accede desde cualquier dispositivo con una experiencia optimizada para móvil, tablet y escritorio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-primary to-blue-600 p-8 lg:p-12 border-0">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
                ¿Listo para llevar tus habilidades al siguiente nivel?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {isAuthenticated 
                  ? "Continúa resolviendo ejercicios de programación y mejorando tus habilidades con CodeGym."
                  : "Únete a miles de programadores que ya están mejorando sus habilidades con CodeGym. Regístrate gratis y comienza tu journey hoy mismo."
                }
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-3 bg-black hover:bg-gray-800 text-white"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Programando
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Crear Cuenta Gratuita
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
