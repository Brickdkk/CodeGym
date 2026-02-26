import { 
  users, 
  languages, 
  exercises, 
  submissions, 
  userProgress,
  comments,
  type User, 
  type UpsertUser,
  type Language,
  type InsertLanguage,
  type Exercise,
  type InsertExercise,
  type Submission,
  type InsertSubmission,
  type UserProgress,
  type InsertUserProgress,
  type Comment,
  type InsertComment
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, asc, and, sql, count, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Language operations
  getLanguages(): Promise<Language[]>;
  getLanguageBySlug(slug: string): Promise<Language | undefined>;
  getLanguageById(id: number): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  
  // Exercise bulk operations for import
  getAllExercises(): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise>;
  
  // Exercise operations
  getExercisesByLanguage(languageSlug: string, difficulty?: string): Promise<Exercise[]>;
  getExerciseBySlug(slug: string): Promise<Exercise | undefined>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  searchExercises(filters: { language?: string; difficulty?: string; search?: string }): Promise<Exercise[]>;
  
  // Comment operations
  getExerciseComments(exerciseId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(commentId: number, userId: string): Promise<void>;
  
  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // User progress operations
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgress(userId: string): Promise<UserProgress[]>;
  
  // Ranking operations
  getExerciseRankings(exerciseId: number): Promise<any[]>;
  updateExerciseRanking(ranking: { exerciseId: number; userId: string; executionTime: number; submissionId: number }): Promise<void>;
  
  // Stats operations
  getStats(): Promise<{
    activeUsers: number;
    exercisesSolved: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        } as any,
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      } as any)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Language operations
  async getLanguages(): Promise<Language[]> {
    return await db.select().from(languages).orderBy(asc(languages.name));
  }

  async getLanguageBySlug(slug: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.slug, slug));
    return language;
  }

  async getLanguageById(id: number): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.id, id));
    return language;
  }

  // Exercise operations
  async getExercisesByLanguage(languageSlug: string, difficulty?: string): Promise<Exercise[]> {
    const language = await this.getLanguageBySlug(languageSlug);
    if (!language) return [];

    if (difficulty) {
      return await db
        .select()
        .from(exercises)
        .where(and(eq(exercises.languageId, language.id), eq(exercises.difficulty, difficulty)))
        .orderBy(asc(exercises.title));
    }

    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.languageId, language.id))
      .orderBy(asc(exercises.title));
  }

  async getExerciseBySlug(slug: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.slug, slug));
    return exercise;
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }

  async searchExercises(filters: { language?: string; difficulty?: string; search?: string }): Promise<Exercise[]> {
    const conditions = [];
    
    if (filters.language && filters.language !== 'all') {
      const language = await this.getLanguageBySlug(filters.language);
      if (language) {
        conditions.push(eq(exercises.languageId, language.id));
      }
    }
    
    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(eq(exercises.difficulty, filters.difficulty));
    }
    
    if (filters.search) {
      conditions.push(sql`${exercises.title} ILIKE ${`%${filters.search}%`}`);
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(exercises)
        .where(and(...conditions))
        .orderBy(asc(exercises.title));
    }
    
    return await db
      .select()
      .from(exercises)
      .orderBy(asc(exercises.title));
  }

  // Submission operations
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [created] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    return created;
  }

  // User progress operations
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, progress.userId),
          eq(userProgress.exerciseId, progress.exerciseId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          attempts: existing.attempts ? existing.attempts + 1 : 1,
          lastAttempt: new Date(),
          bestTime: (progress as any).bestTime && (!existing.bestTime || (progress as any).bestTime < existing.bestTime) 
            ? (progress as any).bestTime 
            : existing.bestTime
        } as any)
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          ...progress,
          attempts: 1,
          lastAttempt: new Date()
        } as any)
        .returning();
      return created;
    }
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastAttempt));
  }

  // Ranking operations
  async getExerciseRankings(exerciseId: number): Promise<any[]> {
    // Get the best submission for each user (fastest execution time)
    const results = await db
      .select({
        userId: submissions.userId,
        executionTime: sql`MIN(${submissions.executionTime})`.as('best_time'),
        submittedAt: sql`MIN(${submissions.submittedAt})`.as('first_submission'),
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl
        }
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.userId, users.id))
      .where(
        and(
          eq(submissions.exerciseId, exerciseId),
          eq(submissions.status, "accepted"),
          sql`${submissions.executionTime} IS NOT NULL`
        )
      )
      .groupBy(submissions.userId, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(sql`MIN(${submissions.executionTime}) ASC`)
      .limit(5);

    return results.map((result, index) => ({
      rank: index + 1,
      userId: result.userId,
      user: result.user,
      executionTime: result.executionTime,
      submittedAt: result.submittedAt
    }));
  }

  async updateExerciseRanking(ranking: { exerciseId: number; userId: string; executionTime: number; submissionId: number }): Promise<void> {
    // Rankings are automatically computed from submissions table
    // This method ensures the submission exists and is properly recorded
    try {
      // Verify the submission exists and update if necessary
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, ranking.submissionId));
      
      if (submission) {
        // Update submission with execution time if not already set
        await db
          .update(submissions)
          .set({ executionTime: ranking.executionTime } as any)
          .where(eq(submissions.id, ranking.submissionId));
        
        console.log(`Ranking updated for exercise ${ranking.exerciseId}, user ${ranking.userId}`);
      }
    } catch (error) {
      console.error('Error updating exercise ranking:', error);
    }
  }

  // Stats operations
  async getStats(): Promise<{
    activeUsers: number;
    exercisesSolved: number;
    successRate: number;
  }> {
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [solvedCount] = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.status, "accepted"));

    const [totalSubmissions] = await db
      .select({ count: count() })
      .from(submissions);

    const successRate = 94;

    return {
      activeUsers: userCount.count,
      exercisesSolved: 1213, // Exact number as requested
      successRate
    };
  }

  // Import-related methods
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [created] = await db
      .insert(languages)
      .values(language)
      .returning();
    return created;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises)
      .orderBy(asc(exercises.id));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [created] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    return created;
  }

  async updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise> {
    const [updated] = await db
      .update(exercises)
      .set(exercise)
      .where(eq(exercises.id, id))
      .returning();
    return updated;
  }

  // Comment operations
  async getExerciseComments(exerciseId: number): Promise<(Comment & { user: User })[]> {
    try {
      const query = sql`
        SELECT 
          c.id,
          c.exercise_id as "exerciseId",
          c.user_id as "userId", 
          c.content,
          c.created_at as "createdAt",
          c.updated_at as "updatedAt",
          u.id as "user_id",
          u.first_name as "user_firstName",
          u.last_name as "user_lastName", 
          u.email as "user_email",
          u.profile_image_url as "user_profileImageUrl",
          u.created_at as "user_createdAt",
          u.updated_at as "user_updatedAt"
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.exercise_id = ${exerciseId}
        ORDER BY c.created_at DESC
      `;
      
      const result = await db.execute(query);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        exerciseId: row.exerciseId,
        userId: row.userId,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          id: row.user_id,
          firstName: row.user_firstName,
          lastName: row.user_lastName,
          email: row.user_email,
          profileImageUrl: row.user_profileImageUrl,
          createdAt: row.user_createdAt,
          updatedAt: row.user_updatedAt,
        }
      })) as (Comment & { user: User })[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async deleteComment(commentId: number, userId: string): Promise<void> {
    await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)));
  }

  async getUserStats(userId: string): Promise<any> {
    // Aggregated queries — no full-table fetches, no in-memory counting
    const [progressAgg] = await db
      .select({
        exercisesSolved: sql<number>`count(*) filter (where ${userProgress.solved} = true)`,
        totalAttempts: sql<number>`coalesce(sum(${userProgress.attempts}), 0)`,
        averageTime: sql<number>`coalesce(avg(${userProgress.bestTime}) filter (where ${userProgress.solved} = true and ${userProgress.bestTime} is not null), 0)`,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const [submissionAgg] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.userId, userId));

    const exercisesSolved = Number(progressAgg?.exercisesSolved ?? 0);
    const totalPoints = exercisesSolved * 10;

    return {
      totalPoints,
      exercisesSolved,
      averageTime: Math.round(Number(progressAgg?.averageTime ?? 0)),
      totalAttempts: Number(progressAgg?.totalAttempts ?? 0),
      totalSubmissions: Number(submissionAgg?.count ?? 0),
    };
  }

  async getTotalExerciseCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(exercises);
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();