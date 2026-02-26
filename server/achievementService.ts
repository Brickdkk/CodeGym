import { db } from "./db.js";
import { 
  achievements, 
  userAchievements, 
  userStreaks, 
  dailyActivity,
  userProgress,
  exercises,
  languages
} from "../shared/schema.js";
import { eq, and, sql, desc } from "drizzle-orm";

// Interfaces para tipos
export interface UserStreak {
  id: number;
  userId: string;
  currentStreak: number | null;
  longestStreak: number | null;
  lastActivityDate: Date | null;
  totalActiveDays: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface DailyActivity {
  id: number;
  userId: string;
  date: Date;
  exercisesCompleted: number | null;
  timeSpent: number | null;
  pointsEarned: number | null;
  createdAt: Date | null;
}

// Interfaces para logros
export interface AchievementProgress {
  achievement: any;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export class AchievementService {
  
  /**
   * Check and unlock achievements for a user after completing an exercise
   */
  async checkAndUnlockAchievements(userId: string, exerciseCompleted?: any): Promise<string[]> {
    const unlockedAchievements: string[] = [];
    
    try {
      // Get all active achievements
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));

      // Get user's current achievements
      const userCurrentAchievements = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const unlockedIds = new Set(userCurrentAchievements.map(ua => ua.achievementId));

      // Check each achievement
      for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        const requirement = achievement.requirement as any;
        const shouldUnlock = await this.checkAchievementRequirement(userId, requirement);

        if (shouldUnlock) {
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date(),
          } as any);

          unlockedAchievements.push(achievement.name);
        }
      }

      return unlockedAchievements;    } catch (error) {
      if (error instanceof Error) {
        console.error('Error checking achievements:', error.message);
      } else {
        console.error('Error checking achievements:', error);
      }
      return [];
    }
  }

  /**
   * Check if a specific achievement requirement is met
   */
  private async checkAchievementRequirement(userId: string, requirement: any): Promise<boolean> {
    try {
      switch (requirement.type) {
        case 'exercises_completed':
          const completedCount = await this.getUserCompletedExercisesCount(userId);
          return completedCount >= requirement.count;        case 'streak':
          const userStreak = await this.getUserStreak(userId);
          return (userStreak.currentStreak || 0) >= requirement.days;

        case 'language_exercises':
          const languageCount = await this.getUserLanguageExercisesCount(userId, requirement.language);
          return languageCount >= requirement.count;

        case 'difficulty_exercises':
          const difficultyCount = await this.getUserDifficultyExercisesCount(userId, requirement.difficulty);
          return difficultyCount >= requirement.count;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking requirement:', error);
      return false;
    }
  }

  /**
   * Get user's completed exercises count
   */
  private async getUserCompletedExercisesCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.solved, true)
      ));
    
    return Number(result[0]?.count || 0);
  }

  /**
   * Get user's completed exercises count for a specific language
   */
  private async getUserLanguageExercisesCount(userId: string, languageSlug: string): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(userProgress)
      .innerJoin(exercises, eq(userProgress.exerciseId, exercises.id))
      .innerJoin(languages, eq(exercises.languageId, languages.id))
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.solved, true),
        eq(languages.slug, languageSlug)
      ));
    
    return Number(result[0]?.count || 0);
  }

  /**
   * Get user's completed exercises count for a specific difficulty
   */
  private async getUserDifficultyExercisesCount(userId: string, difficulty: string): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(userProgress)
      .innerJoin(exercises, eq(userProgress.exerciseId, exercises.id))
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.solved, true),
        eq(exercises.difficulty, difficulty)
      ));
    
    return Number(result[0]?.count || 0);
  }

  /**
   * Update user's daily streak
   */
  async updateUserStreak(userId: string): Promise<UserStreak> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create user streak record
    let userStreak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .then(rows => rows[0]);

    if (!userStreak) {
      // Create new streak record
      const [newStreak] = await db
        .insert(userStreaks)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          totalActiveDays: 1,
        } as any)
        .returning();
      
      return newStreak;
    }

    const lastActivityDate = userStreak.lastActivityDate ? new Date(userStreak.lastActivityDate) : null;
    
    if (!lastActivityDate) {
      // First activity
      const [updated] = await db
        .update(userStreaks)
        .set({
          currentStreak: 1,          longestStreak: Math.max(1, userStreak.longestStreak || 0),
          lastActivityDate: today,
          totalActiveDays: (userStreak.totalActiveDays || 0) + 1,
          updatedAt: new Date(),
        } as any)
        .where(eq(userStreaks.userId, userId))
        .returning();
      
      return updated;
    }

    lastActivityDate.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrentStreak = userStreak.currentStreak;
    let newTotalActiveDays = userStreak.totalActiveDays;

    if (lastActivityDate.getTime() === today.getTime()) {
      // Already active today, no changes needed
      return userStreak;
    } else if (lastActivityDate.getTime() === yesterday.getTime()) {      // Consecutive day
      newCurrentStreak = (userStreak.currentStreak || 0) + 1;
      newTotalActiveDays = (userStreak.totalActiveDays || 0) + 1;
    } else {
      // Streak broken
      newCurrentStreak = 1;
      newTotalActiveDays = (userStreak.totalActiveDays || 0) + 1;
    }

    const [updated] = await db
      .update(userStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(newCurrentStreak, userStreak.longestStreak || 0),
        lastActivityDate: today,
        totalActiveDays: newTotalActiveDays,
        updatedAt: new Date(),
      } as any)
      .where(eq(userStreaks.userId, userId))
      .returning();

    return updated;
  }

  /**
   * Log daily activity for a user
   */
  async logDailyActivity(userId: string, exercisesCompleted: number = 1, timeSpent: number = 0, pointsEarned: number = 0): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Check if activity already exists for today
      const existingActivity = await db
        .select()
        .from(dailyActivity)
        .where(and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.date, today)
        ))
        .then(rows => rows[0]);

      if (existingActivity) {
        // Update existing activity
        await db
          .update(dailyActivity)          .set({
            exercisesCompleted: (existingActivity.exercisesCompleted || 0) + exercisesCompleted,
            timeSpent: (existingActivity.timeSpent || 0) + timeSpent,
            pointsEarned: (existingActivity.pointsEarned || 0) + pointsEarned,
          } as any)
          .where(eq(dailyActivity.id, existingActivity.id));
      } else {
        // Create new activity record
        await db
          .insert(dailyActivity)
          .values({
            userId,
            date: today,
            exercisesCompleted,
            timeSpent,
            pointsEarned,
          } as any);
      }
    } catch (error) {
      console.error('Error logging daily activity:', error);
    }
  }

  /**
   * Get user's streak information
   */
  async getUserStreak(userId: string): Promise<UserStreak> {
    const userStreak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .then(rows => rows[0]);

    if (!userStreak) {
      // Return default streak
      return {
        id: 0,
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        totalActiveDays: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return userStreak;
  }

  /**
   * Get user's achievements with progress
   */
  async getUserAchievementsWithProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      // Get all achievements
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true))
        .orderBy(achievements.category, achievements.points);

      // Get user's unlocked achievements
      const userUnlocked = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const unlockedMap = new Map(userUnlocked.map(ua => [ua.achievementId, ua]));

      const result: AchievementProgress[] = [];

      for (const achievement of allAchievements) {
        const userAchievement = unlockedMap.get(achievement.id);
        const unlocked = !!userAchievement;
        
        const requirement = achievement.requirement as any;
        const progress = unlocked ? requirement.count || requirement.days || 1 : await this.getAchievementProgress(userId, requirement);
        const maxProgress = requirement.count || requirement.days || 1;

        result.push({
          achievement,
          unlocked,
          unlockedAt: userAchievement?.unlockedAt || undefined,
          progress: Math.min(progress, maxProgress),
          maxProgress,
        });
      }

      return result;    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting user achievements:', error.message);
      } else {
        console.error('Error getting user achievements:', error);
      }
      return [];
    }
  }

  /**
   * Get current progress towards an achievement
   */
  private async getAchievementProgress(userId: string, requirement: any): Promise<number> {
    try {
      switch (requirement.type) {
        case 'exercises_completed':
          return await this.getUserCompletedExercisesCount(userId);

        case 'streak':
          const userStreak = await this.getUserStreak(userId);
          return userStreak.currentStreak || 0;

        case 'language_exercises':
          return await this.getUserLanguageExercisesCount(userId, requirement.language);

        case 'difficulty_exercises':
          return await this.getUserDifficultyExercisesCount(userId, requirement.difficulty);

        default:
          return 0;
      }    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting achievement progress:', error.message);
      } else {
        console.error('Error getting achievement progress:', error);
      }
      return 0;
    }
  }

  /**
   * Get user's weekly activity data
   */
  async getUserWeeklyActivity(userId: string): Promise<DailyActivity[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    try {
      const activities = await db
        .select()
        .from(dailyActivity)
        .where(and(
          eq(dailyActivity.userId, userId),
          sql`${dailyActivity.date} >= ${weekAgo}`
        ))
        .orderBy(desc(dailyActivity.date));

      return activities;    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting weekly activity:', error.message);
      } else {
        console.error('Error getting weekly activity:', error);
      }
      return [];
    }
  }
}

export const achievementService = new AchievementService();