/**
 * progressSync.ts — Optimistic progress updates.
 *
 * After a successful exercise submission, immediately updates the React Query
 * cache so the user sees instant XP and streak changes. Then triggers a
 * background refetch for eventual server consistency.
 *
 * Pillar 5: Dopamine loop — instant gratification on success.
 */

import { queryClient } from './queryClient';

interface UserStats {
  exercisesSolved: number;
  totalPoints: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteLanguage: string;
}

/**
 * Optimistically update the user's stats in the React Query cache after
 * successfully solving an exercise. This makes the XP gain and streak
 * feel instantaneous, without waiting for a server round-trip.
 *
 * @param pointsEarned — points for this exercise
 * @param executionTime — ms taken for this submission
 */
export function optimisticProgressUpdate(pointsEarned: number, executionTime: number): void {
  // 1. Optimistic update on /api/user/stats
  queryClient.setQueryData<UserStats>(['/api/user/stats'], (old) => {
    if (!old) return old;

    const newSolved = old.exercisesSolved + 1;
    const newTotal = old.totalPoints + pointsEarned;
    // Running average: ((old_avg * old_n) + new_time) / new_n
    const newAvgTime = Math.round(
      (old.averageTime * old.exercisesSolved + executionTime) / newSolved
    );
    // Streak: optimistically bump current streak by 1
    const newCurrentStreak = old.currentStreak + 1;

    return {
      ...old,
      exercisesSolved: newSolved,
      totalPoints: newTotal,
      averageTime: newAvgTime,
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(old.longestStreak, newCurrentStreak),
    };
  });

  // 2. Background refetch to reconcile with server truth (non-blocking)
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] });
  }, 500);
}

/**
 * Invalidate all user-related caches. Call after logout or session changes.
 */
export function invalidateAllUserData(): void {
  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] });
}
