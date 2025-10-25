import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Clock, User } from "lucide-react";

interface RankingUser {
  rank: number;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  executionTime: number;
  submittedAt: string;
}

interface ExerciseRankingsProps {
  exerciseSlug: string;
}

export default function ExerciseRankings({ exerciseSlug }: ExerciseRankingsProps) {
  const { data: rankings = [], isLoading, error } = useQuery({
    queryKey: [`/api/exercises/${exerciseSlug}/rankings`],
    enabled: !!exerciseSlug,
    retry: 3,
    refetchOnWindowFocus: false
  });

  console.log('ExerciseRankings Debug:', { 
    exerciseSlug, 
    rankings, 
    isLoading, 
    error,
    rankingsLength: Array.isArray(rankings) ? rankings.length : 0
  });

  const formatTime = (milliseconds: number) => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case 2:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case 3:
        return "bg-amber-600/10 text-amber-700 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rankings del Ejercicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    return (
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rankings del Ejercicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no hay rankings para este ejercicio.</p>
              <p className="text-sm">¡Sé el primero en completarlo!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rankings del Ejercicio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top {Array.isArray(rankings) ? rankings.length : 0} usuarios más rápidos
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(rankings) && rankings.map((ranking: RankingUser) => (
              <div
                key={ranking.userId}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(ranking.rank)}
                    <Badge variant="secondary" className={getRankColor(ranking.rank)}>
                      #{ranking.rank}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {ranking.user.profileImageUrl ? (
                      <img
                        src={ranking.user.profileImageUrl}
                        alt={`${ranking.user.firstName} ${ranking.user.lastName}`}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {ranking.user.firstName} {ranking.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ranking.submittedAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-right">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold">
                    {formatTime(ranking.executionTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {rankings.length >= 5 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando los 5 mejores tiempos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}