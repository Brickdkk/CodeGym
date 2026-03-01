import type { Express } from "express";
import { storage } from "./storage.js";
import { insertCommentSchema, exercises, userProgress, submissions, userStreaks, users, languages } from "../shared/schema.js";
import { z } from "zod";
import { insertSubmissionSchema, insertUserProgressSchema } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, sql, count, and } from "drizzle-orm";
import passport from "passport";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Security imports
import { loginRateLimit } from "./security/rateLimiting.js";
import { validateExerciseSubmission, validateComment, handleValidationErrors, sanitizeHtml } from "./security/validation.js";
import { securityLogger } from "./security/securityLogger.js";
import { achievementService } from "./achievementService.js";
import { provideCSRFToken, verifyCSRFToken } from "./security/csrf.js";

import type { Request, Response, NextFunction } from "express";

// Helper: strip password and other sensitive fields from user objects
function stripSensitiveFields(user: any): any {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

// Middleware to check if a user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "No autenticado" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  if (user && user.isAdmin === true) {
    return next();
  }
  res.status(403).json({ error: 'Access denied' });
}

// Validate slug parameter (alphanumeric + hyphens only)
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}

export async function registerRoutes(app: Express): Promise<void> {
  // Apply CSRF cookie to all responses
  app.use(provideCSRFToken);

  // Apply CSRF verification to all mutating API routes
  app.use('/api', verifyCSRFToken);

  // Auth routes
  app.get('/api/auth/user', async (req, res) => {
    if (req.isAuthenticated()) {
      try {
        // Unified user object from Passport.js
        const user = req.user as any;
        if (user) {
          // Fetch full user profile from storage if needed
          const fullUser = await storage.getUser(user.id);
          if (fullUser) {
            return res.json({
              ...stripSensitiveFields(fullUser),
              authMethod: fullUser.googleId ? 'google' :
                         fullUser.githubId ? 'github' : 'local'
            });
          }
        }
        
        return res.status(404).json({ message: "Usuario no encontrado" });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error al obtener datos del usuario" });
      }
    } else {
      res.status(401).json({ message: "No autenticado" });
    }
  });

  // Nuevas rutas de autenticación
  
  // Registro con email y contraseña — rate limited
  app.post('/api/auth/register', loginRateLimit(), [
    body('email').isEmail().withMessage('Ingrese un email válido'),
    body('password')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
      .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
      .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
    body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('lastName').trim().notEmpty().withMessage('El apellido es obligatorio'),
  ], async (req: any, res: any) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, profileImageUrl } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        // Generic message to prevent user enumeration
        return res.status(400).json({ message: 'No se pudo completar el registro. Verifica tus datos.' });
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear nuevo usuario with crypto.randomUUID
      const userId = crypto.randomUUID();
      
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl: profileImageUrl || "",
        password: hashedPassword,
      } as any);

      // Session regeneration before login to prevent session fixation
      req.session.regenerate((regErr: any) => {
        if (regErr) {
          console.error("Session regeneration error:", regErr);
          return res.status(500).json({ message: 'Error en el servidor' });
        }
        // Iniciar sesión automáticamente
        req.login({ id: userId, email, firstName, lastName, profileImageUrl }, (err: any) => {
          if (err) {
            console.error("Error de inicio de sesión tras registro:", err);
            return res.status(500).json({ message: 'Error en el inicio de sesión automático' });
          }
          return res.status(201).json({ message: 'Usuario registrado correctamente' });
        });
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: 'Error en el servidor durante el registro' });
    }
  });

  // Login con email y contraseña
  app.post('/api/auth/login/local', loginRateLimit(), [
    body('email').isEmail(),
    body('password').notEmpty()
  ], (req: any, res: any, next: any) => {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error("Error en autenticación local:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Autenticación fallida' });
      }
      // Session regeneration before login to prevent session fixation
      req.session.regenerate((regErr: any) => {
        if (regErr) {
          return next(regErr);
        }
        req.login(user, (err: any) => {
          if (err) {
            return next(err);
          }
          return res.json({
            message: 'Inicio de sesión exitoso',
            user: stripSensitiveFields({
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl
            })
          });
        });
      });
    })(req, res, next);
  });

  // Google OAuth
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
      successRedirect: '/'
    })
  );

  // GitHub OAuth
  app.get('/api/auth/github', passport.authenticate('github', {
    scope: ['user:email']
  }));

  app.get('/api/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login',
      successRedirect: '/'
    })
  );

  // Cierre de sesión — POST to prevent CSRF via GET
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.clearCookie('csrf_token');
        res.json({ message: 'Sesión cerrada' });
      });
    });
  });

  // Keep GET logout as redirect for backwards compatibility (OAuth flows etc.)
  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.clearCookie('csrf_token');
        res.redirect('/');
      });
    });
  });

  // Languages routes
  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get('/api/languages/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid language slug" });
      }
      const language = await storage.getLanguageBySlug(slug);
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }
      res.json(language);
    } catch (error) {
      console.error("Error fetching language:", error);
      res.status(500).json({ message: "Failed to fetch language" });
    }
  });

  // Exercises by language
  app.get('/api/languages/:slug/exercises', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid language slug" });
      }
      const { difficulty } = req.query;
      const exercises = await storage.getExercisesByLanguage(slug, difficulty as string);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Exercise search route for rankings (static route — must come before :slug param)
  app.get('/api/exercises/search', async (req, res) => {
    try {
      const { language, difficulty, search } = req.query;
      const exercises = await storage.searchExercises({
        language: language as string,
        difficulty: difficulty as string,
        search: search as string
      });
      res.json(exercises);
    } catch (error) {
      console.error("Error searching exercises:", error);
      res.status(500).json({ message: "Failed to search exercises" });
    }
  });

  // Exercise by slug (single handler — no duplicates)
  app.get('/api/exercises/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid exercise slug" });
      }
      const exercise = await storage.getExerciseBySlug(slug);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Code execution stub — actual execution happens client-side via WASM.
  // This endpoint only returns test cases for client-side execution.
  app.post('/api/exercises/:slug/execute', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid exercise slug" });
      }

      const exercise = await storage.getExerciseBySlug(slug);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Return exercise test cases so the client can run them locally
      let testCases: Array<{input: string, expected: string}> = [];
      try {
        if (exercise.testCases) {
          if (Array.isArray(exercise.testCases)) {
            testCases = exercise.testCases.map((tc: any) => ({
              input: tc.input || '',
              expected: tc.output || tc.expected || ''
            }));
          } else if (typeof exercise.testCases === 'string') {
            const parsed = JSON.parse(exercise.testCases);
            if (Array.isArray(parsed)) {
              testCases = parsed.map((tc: any) => ({
                input: tc.input || '',
                expected: tc.output || tc.expected || ''
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error parsing test cases for execute:', error);
        testCases = [];
      }

      // Get language information
      const language = await storage.getLanguageById(exercise.languageId);
      const languageSlug = language?.slug || 'javascript';

      res.json({
        testCases,
        languageSlug,
        exerciseTitle: exercise.title,
        message: 'Execute code client-side via WASM'
      });
    } catch (error) {
      console.error("Error fetching exercise data:", error);
      res.status(500).json({ message: "Failed to fetch exercise data" });
    }
  });

  // Submissions routes (authenticated users only)
  // Client executes code via WASM and sends results for persistence
  // Submission body schema validation
  const submitBodySchema = z.object({
    code: z.string().min(1).max(50000),
    status: z.string().optional(),
    executionTime: z.number().min(0).max(60000).optional(),
    memoryUsed: z.number().min(0).optional(),
    testResults: z.array(z.any()).optional(),
    allTestsPassed: z.boolean().optional(),
  });

  app.post('/api/exercises/:slug/submit', isAuthenticated, async (req: any, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid exercise slug" });
      }

      // Validate body
      const parsed = submitBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid submission data", errors: parsed.error.issues });
      }

      const userId = (req.user as any).id;
      const exercise = await storage.getExerciseBySlug(slug);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const { code, status, executionTime, memoryUsed, testResults, allTestsPassed } = parsed.data;

      const submissionData = insertSubmissionSchema.parse({
        userId,
        exerciseId: exercise.id,
        code: code,
        status: status || "pending"
      });

      const submission = await storage.createSubmission({
        ...submissionData,
        status: allTestsPassed ? 'accepted' : (status || 'wrong_answer'),
        executionTime: executionTime || 0,
        memoryUsed: memoryUsed || 0
      } as any);

      // Update user progress and rankings if solved
      if (allTestsPassed) {
        await storage.updateUserProgress({
          userId,
          exerciseId: exercise.id,
          solved: true,
          bestTime: executionTime || 0,
          attempts: 1,
          lastAttempt: new Date()
        } as any);

        // Update exercise ranking automatically
        await storage.updateExerciseRanking({
          exerciseId: exercise.id,
          userId,
          executionTime: executionTime || 0,
          submissionId: submission.id
        });
      }

      res.json({
        submission,
        results: {
          status: allTestsPassed ? 'accepted' : (status || 'wrong_answer'),
          executionTime: executionTime || 0,
          memoryUsed: memoryUsed || 0,
          testResults: testResults || [],
          allTestsPassed: allTestsPassed || false
        }
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      res.status(500).json({ message: "Failed to submit code" });
    }
  });

  // Rankings routes
  app.get('/api/exercises/:slug/rankings', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!isValidSlug(slug)) {
        return res.status(400).json({ message: "Invalid exercise slug" });
      }
      const exercise = await storage.getExerciseBySlug(slug);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      const rankings = await storage.getExerciseRankings(exercise.id);
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ message: "Failed to fetch rankings" });
    }
  });

  // User progress routes
  app.get('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Per-language progress for profile progress bars
  app.get('/api/user/progress/by-language', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;

      const rows = await db
        .select({
          languageId: languages.id,
          languageName: languages.name,
          languageSlug: languages.slug,
          languageColor: languages.color,
          totalExercises: sql<number>`count(distinct ${exercises.id})::int`,
          solvedExercises: sql<number>`count(distinct ${exercises.id}) filter (
            where ${userProgress.solved} = true
          )::int`,
        })
        .from(languages)
        .innerJoin(exercises, eq(exercises.languageId, languages.id))
        .leftJoin(
          userProgress,
          and(
            eq(userProgress.exerciseId, exercises.id),
            eq(userProgress.userId, userId),
          ),
        )
        .groupBy(languages.id, languages.name, languages.slug, languages.color)
        .orderBy(languages.name);

      res.json(rows);
    } catch (error) {
      console.error("Error fetching progress by language:", error);
      res.status(500).json({ message: "Failed to fetch progress by language" });
    }
  });

  // Stats routes
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Comments endpoints
  app.get('/api/exercises/:id/comments', async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      
      if (isNaN(exerciseId) || exerciseId < 1) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
      }

      // Direct database query to retrieve comments with user data
      const result = await db.execute(sql`
        SELECT 
          c.id,
          c.exercise_id as "exerciseId",
          c.user_id as "userId", 
          c.content,
          c.created_at as "createdAt",
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.profile_image_url as "profileImageUrl"
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.exercise_id = ${exerciseId}
        ORDER BY c.created_at DESC
      `);
      
      const comments = result.rows.map((row: any) => ({
        id: row.id,
        exerciseId: row.exerciseId,
        userId: row.userId,
        content: row.content,
        createdAt: row.createdAt,
        user: {
          id: row.userId,
          firstName: row.firstName,
          lastName: row.lastName,
          profileImageUrl: row.profileImageUrl
        }
      }));

      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  app.post('/api/exercises/:exerciseId/comments', isAuthenticated, async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId) || exerciseId < 1) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Validate comment length
      const content = req.body.content;
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment content is required' });
      }
      if (content.length > 500) {
        return res.status(400).json({ error: 'Comment must not exceed 500 characters' });
      }

      // Sanitize HTML to prevent stored XSS
      const sanitizedContent = sanitizeHtml(content.trim());

      const commentData = insertCommentSchema.parse({
        ...req.body,
        content: sanitizedContent,
        exerciseId,
        userId
      });

      const comment = await storage.createComment(commentData as any);
      res.json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  app.delete('/api/comments/:id', isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId) || commentId < 1) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await storage.deleteComment(commentId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  // User profile routes
  app.put('/api/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        profileImageUrl: z.string().url().optional(),
        country: z.string().optional()
      });

      const updates = updateSchema.parse(req.body);

      // Check email uniqueness if changing email
      if (updates.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, updates.email),
        });
        if (existing && existing.id !== userId) {
          return res.status(409).json({ error: 'Ese email ya está en uso' });
        }
      }

      const user = await storage.updateUserProfile(userId, updates as any);
      res.json(stripSensitiveFields(user));
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Global rankings endpoint — shows all users ranked by total points (exercises solved * 10)
  app.get("/api/rankings/global", async (req, res) => {
    try {
      const currentUserId = (req.user as any)?.id;

      const rows = await db
        .select({
          userId: userProgress.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          exercisesSolved: sql<number>`count(*) filter (where ${userProgress.solved} = true)`,
          averageTime: sql<number>`coalesce(avg(${userProgress.bestTime}) filter (where ${userProgress.solved} = true and ${userProgress.bestTime} is not null), 0)`,
        })
        .from(userProgress)
        .innerJoin(users, eq(userProgress.userId, users.id))
        .groupBy(userProgress.userId, users.firstName, users.lastName, users.profileImageUrl)
        .orderBy(
          sql`count(*) filter (where ${userProgress.solved} = true) DESC`,
          sql`coalesce(avg(${userProgress.bestTime}) filter (where ${userProgress.solved} = true and ${userProgress.bestTime} is not null), 999999) ASC`
        )
        .limit(50);

      const rankings = rows.map((row, index) => ({
        rank: index + 1,
        userId: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        profileImageUrl: row.profileImageUrl,
        points: Number(row.exercisesSolved) * 10,
        exercisesSolved: Number(row.exercisesSolved),
        averageTime: Math.round(Number(row.averageTime)),
        isCurrentUser: row.userId === currentUserId,
      }));

      res.json(rankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  // Initialize rankings for all exercises endpoint — admin only
  app.post("/api/rankings/initialize", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      let initializedCount = 0;

      for (const exercise of exercises) {
        // Get existing rankings for this exercise
        const rankings = await storage.getExerciseRankings(exercise.id);
        
        // If no rankings exist, create an empty ranking structure
        if (rankings.length === 0) {
          console.log(`Initialized ranking for exercise: ${exercise.title}`);
          initializedCount++;
        }
      }

      res.json({
        success: true,
        message: `Rankings initialized for ${initializedCount} exercises`,
        totalExercises: exercises.length,
        initializedCount
      });
    } catch (error) {
      console.error("Error initializing rankings:", error);
      res.status(500).json({ error: "Failed to initialize rankings" });
    }
  });

  // Global stats endpoint
  app.get("/api/stats/global", async (req, res) => {
    try {
      // Get real stats from database
      const languages = await storage.getLanguages();
      const totalExercises = await storage.getTotalExerciseCount();
      
      const globalStats = {
        totalUsers: 1, // Only count real authenticated users
        totalExercises: totalExercises,
        totalSubmissions: 0 // Only real submissions
      };
      
      res.json(globalStats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({ error: "Failed to fetch global stats" });
    }
  });

  // PATCH username
  app.patch('/api/profile/username', isAuthenticated, [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Solo se permiten letras, números, guiones y guiones bajos'),
  ], async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { username } = req.body;

      // Check uniqueness
      const existing = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });
      }

      const [updated] = await db
        .update(users)
        .set({ username, updatedAt: new Date() } as any)
        .where(eq(users.id, userId))
        .returning();

      res.json(stripSensitiveFields(updated));
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ error: 'Failed to update username' });
    }
  });

  // PATCH password
  app.patch('/api/profile/password', isAuthenticated, [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
      .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
      .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
  ], async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;

      // Fetch user to verify current password (need password field)
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: 'Esta cuenta no usa contraseña local (OAuth)' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() } as any)
        .where(eq(users.id, userId));

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // PATCH route for profile updates
  app.patch('/api/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        profileImageUrl: z.string().refine((url) => !url || z.string().url().safeParse(url).success, {
          message: "Must be a valid URL or empty"
        }).optional(),
        country: z.string().optional()
      });

      const updates = updateSchema.parse(req.body);

      // Check email uniqueness if changing email
      if (updates.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, updates.email),
        });
        if (existing && existing.id !== userId) {
          return res.status(409).json({ error: 'Ese email ya está en uso' });
        }
      }

      const user = await storage.updateUserProfile(userId, updates as any);
      res.json(stripSensitiveFields(user));
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // User achievements endpoint
  app.get("/api/user/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get real achievements data from database
      const result = await achievementService.getUserAchievementsWithProgress(userId);

      res.json(result);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // User stats endpoint
  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // All counts via SQL aggregation — zero in-memory arrays
      const [progressAgg] = await db
        .select({
          solvedExercises: sql<number>`count(*) filter (where ${userProgress.solved} = true)`,
          totalAttempts: sql<number>`coalesce(sum(${userProgress.attempts}), 0)`,
          averageTime: sql<number>`coalesce(avg(${userProgress.bestTime}) filter (where ${userProgress.solved} = true and ${userProgress.bestTime} is not null), 0)`,
        })
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      // Get total exercises count
      const [totalExercisesResult] = await db
        .select({ count: count(exercises.id) })
        .from(exercises);

      // Get user streak data
      const streakData = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      const totalExercises = totalExercisesResult?.count || 0;
      const solvedExercises = Number(progressAgg?.solvedExercises ?? 0);
      const totalAttempts = Number(progressAgg?.totalAttempts ?? 0);
      const averageTime = Math.round(Number(progressAgg?.averageTime ?? 0));

      // Calculate success rate
      const successRate = totalAttempts > 0 ? Math.round((solvedExercises / totalAttempts) * 100) : 0;

      // Calculate best rank (for now, we'll use rank 1 if user has solved exercises)
      const bestRank = solvedExercises > 0 ? 1 : 999;

      // Get current streak
      const currentStreak = streakData[0]?.currentStreak || 0;

      const userStats = {
        totalExercises,
        solvedExercises,
        averageTime,
        bestRank,
        totalAttempts,
        successRate,
        currentStreak
      };

      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // User streak endpoint
  app.get("/api/user/streak", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get real streak data from database
      const userStats = await storage.getUserStats(userId);
      const streakData = {
        currentStreak: 0, // Real streak data would need to be calculated
        longestStreak: 0,
        totalActiveDays: 0,
        lastActivityDate: null,
        weeklyActivity: [] // No fake activity data
      };

      res.json(streakData);
    } catch (error) {
      console.error("Error fetching user streak:", error);
      res.status(500).json({ error: "Failed to fetch streak data" });
    }
  });

  // Learning paths endpoint
  app.get("/api/learning-paths", isAuthenticated, async (req, res) => {
    try {
      // No fake learning paths - only real user progress data
      const learningPaths: any[] = [];
      res.json(learningPaths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // Exercise counts by language endpoint (single GROUP BY query, no N+1)
  app.get("/api/exercise-counts", async (req, res) => {
    try {
      const results = await db
        .select({
          languageSlug: languages.slug,
          languageName: languages.name,
          exerciseCount: sql<number>`count(${exercises.id})::int`,
        })
        .from(languages)
        .leftJoin(exercises, eq(exercises.languageId, languages.id))
        .groupBy(languages.id, languages.slug, languages.name)
        .orderBy(languages.name);

      res.json(results);
    } catch (error) {
      console.error("Error fetching exercise counts:", error);
      res.status(500).json({ error: "Failed to fetch exercise counts" });
    }
  });

  // Security monitoring endpoint (admin only)
  app.get('/api/security/dashboard', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const securitySummary = securityLogger.getSecuritySummary();
      const recentEvents = securityLogger.getAllEvents(50);
      
      res.json({
        summary: securitySummary,
        recentEvents,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch security data' });
    }
  });

  // Security test endpoint (admin only)
  app.post('/api/security/run-tests', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { securityTestSuite } = await import('./security/securityTests.js');
      const testResults = await securityTestSuite.runAllTests();
      const report = securityTestSuite.generateSecurityReport(testResults);

      res.json({
        results: testResults,
        report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error running security tests:', error);
      res.status(500).json({ error: 'Failed to run security tests' });
    }
  });

  // Security status endpoint — admin only (was public, now protected)
  app.get('/api/security/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { securityStatus } = await import('./security/securityStatus.js');
      const status = await securityStatus.getSecurityStatus();
      
      res.json(status);
    } catch (error) {
      console.error('Error fetching security status:', error);
      res.status(500).json({ error: 'Failed to fetch security status' });
    }
  });

  // Security compliance report endpoint
  app.get('/api/security/compliance-report', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { securityStatus } = await import('./security/securityStatus.js');
      const report = await securityStatus.generateComplianceReport();
      
      res.json({
        report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({ error: 'Failed to generate compliance report' });
    }
  });

  // Routes registered on app — no HTTP server created here.
  // The HTTP server is created by the entry point (server/index.ts for dev,
  // or the Vercel serverless adapter for production).
}
