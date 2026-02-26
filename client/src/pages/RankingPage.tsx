import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Medal, Trophy, Clock, User, Search, Filter } from "lucide-react";

interface ExerciseRanking {
  rank: number;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  executionTime: number; // in milliseconds
  submittedAt: string;
}

interface Exercise {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  languageSlug: string;
  languageName: string;
}

export default function RankingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch languages - now available for guests too
  const { data: languages = [] } = useQuery<any[]>({
    queryKey: ["/api/languages"]
  });

  // Fetch exercises based on filters - now available for guests too
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises/search", selectedLanguage, selectedDifficulty, searchTerm]
  });

  // Fetch rankings for selected exercise - available for guests too
  const { data: rankings = [], isLoading: rankingsLoading } = useQuery<ExerciseRanking[]>({
    queryKey: ["/api/exercises", selectedExercise, "rankings"],
    enabled: !!selectedExercise
  });

  // Filter exercises based on search term
  const filteredExercises = exercises.filter((exercise: Exercise) =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    if (rank === 3) return "bg-amber-600/10 text-amber-600 border-amber-600/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case 'intermediate':
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case 'advanced':
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return difficulty;
    }
  };

  const getUserDisplayName = (firstName?: string, lastName?: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario Anónimo';
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    const name = getUserDisplayName(firstName, lastName);
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rankings de Ejercicios</h1>
          <p className="text-muted-foreground">
            Compite con otros usuarios y ve quién resuelve los ejercicios más rápido
          </p>
        </div>
        <Trophy className="h-8 w-8 text-primary" />
        </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar Ejercicios
          </CardTitle>
          <CardDescription>
            Filtra por lenguaje, dificultad o busca un ejercicio específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Language Filter */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Lenguaje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los lenguajes</SelectItem>
                {languages.map((lang: any) => (
                  <SelectItem key={lang.slug} value={lang.slug}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dificultades</SelectItem>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>

            {/* Exercise Select */}
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {filteredExercises.map((exercise: Exercise) => (
                  <SelectItem key={exercise.slug} value={exercise.slug}>
                    {exercise.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      {!selectedExercise && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercisesLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No se encontraron ejercicios con los filtros seleccionados</p>
            </div>
          ) : (
            filteredExercises.map((exercise: Exercise) => (
              <Card key={exercise.slug} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{exercise.title}</CardTitle>
                    <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {exercise.languageName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setSelectedExercise(exercise.slug)}
                    className="w-full"
                    variant="outline"
                  >
                    Ver Rankings
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Exercise Rankings */}
      {selectedExercise && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Rankings del Ejercicio
                </CardTitle>
                <CardDescription>
                  Top 10 mejores tiempos para este ejercicio
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedExercise("")}
              >
                Volver a la lista
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rankingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no hay rankings para este ejercicio</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ¡Sé el primero en resolverlo!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rankings.map((entry: ExerciseRanking) => (
                  <div 
                    key={`${entry.userId}-${entry.submittedAt}`}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        {entry.user?.profileImageUrl && (
                          <AvatarImage src={entry.user.profileImageUrl} />
                        )}
                        <AvatarFallback>
                          {getUserInitials(entry.user?.firstName, entry.user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-semibold">
                          {getUserDisplayName(entry.user?.firstName, entry.user?.lastName)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.submittedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getRankBadgeColor(entry.rank)}>
                        Puesto #{entry.rank}
                      </Badge>
                      <div className="flex items-center gap-2 text-lg font-mono">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{formatTime(Number(entry.executionTime))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}