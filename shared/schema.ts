import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for express-session with connect-pg-simple.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username").unique(),
  country: varchar("country"),
  profileImageUrl: varchar("profile_image_url"),
  // Nuevos campos para autenticación
  password: varchar("password"),  // Para autenticación local
  googleId: varchar("google_id").unique(), // Para OAuth de Google
  githubId: varchar("github_id").unique(), // Para OAuth de GitHub
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_comments_exercise").on(table.exerciseId),
]);

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  exerciseCount: integer("exercise_count").default(0),
  fileExtension: varchar("file_extension", { length: 10 }),
  syntaxHighlighting: varchar("syntax_highlighting", { length: 50 }),
  defaultTemplate: text("default_template"),
  isActive: boolean("is_active").default(true),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // "beginner", "intermediate", "advanced"
  languageId: integer("language_id").references(() => languages.id).notNull(),
  starterCode: text("starter_code"),
  solution: text("solution"),
  testCases: jsonb("test_cases").notNull(), // Array of test cases
  tags: jsonb("tags"), // Array of tags for categorization
  timeLimit: integer("time_limit").default(5000), // milliseconds
  memoryLimit: integer("memory_limit").default(128), // MB
  points: integer("points").default(10), // Points awarded for completion
  isActive: boolean("is_active").default(true), // Whether exercise is visible
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_exercises_language_id").on(table.languageId),
  index("idx_exercises_difficulty").on(table.difficulty),
]);

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  code: text("code").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "pending", "accepted", "wrong_answer", "time_limit_exceeded", "runtime_error"
  executionTime: integer("execution_time"), // milliseconds
  memoryUsed: integer("memory_used"), // bytes
  submittedAt: timestamp("submitted_at").defaultNow(),
}, (table) => [
  index("idx_submissions_user_exercise").on(table.userId, table.exerciseId),
  index("idx_submissions_exercise_status").on(table.exerciseId, table.status),
]);

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  solved: boolean("solved").default(false),
  bestTime: integer("best_time"), // milliseconds
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt"),
}, (table) => [
  index("idx_user_progress_user_exercise").on(table.userId, table.exerciseId),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const insertLanguageSchema = createInsertSchema(languages);
export const insertExerciseSchema = createInsertSchema(exercises);
export const insertSubmissionSchema = createInsertSchema(submissions);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const insertCommentSchema = createInsertSchema(comments);

// Achievements and streak tracking tables
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  requirement: jsonb("requirement").notNull(), // JSON describing requirement
  category: varchar("category", { length: 50 }).default('general'),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
}, (table) => [
  index("idx_user_achievements_user").on(table.userId),
]);

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  totalActiveDays: integer("total_active_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_streaks_user").on(table.userId),
]);

export const dailyActivity = pgTable("daily_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  exercisesCompleted: integer("exercises_completed").default(0),
  timeSpent: integer("time_spent").default(0),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_daily_activity_user_date").on(table.userId, table.date),
]);

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;
export type DailyActivity = typeof dailyActivity.$inferSelect;
export type InsertDailyActivity = typeof dailyActivity.$inferInsert;

export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const insertUserStreakSchema = createInsertSchema(userStreaks);
export const insertDailyActivitySchema = createInsertSchema(dailyActivity);
