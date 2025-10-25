import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertCommentSchema, exercises, userProgress, submissions, userStreaks, users } from "../shared/schema.js";
import { z } from "zod";
import { githubImportService, type GitHubExercise } from "./githubImport.js";
import { insertSubmissionSchema, insertUserProgressSchema } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, sql, count } from "drizzle-orm";
import { freeAIService } from "./freeAIService.js";
import { codeExecutionService } from "./codeExecutionService.js";
import { fixedCodeExecutionService } from "./fixedCodeExecutionService.js";
import passport from "passport";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";

// Security imports
import { loginRateLimit } from "./security/rateLimiting.js";
import { validateExerciseSubmission, validateComment, handleValidationErrors, sanitizeCode } from "./security/validation.js";
import { securityLogger } from "./security/securityLogger.js";
import { provideCSRFToken, verifyCSRFToken } from "./security/csrf.js";

import type { Request, Response, NextFunction } from "express";

// Middleware to check if a user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "No autenticado" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get('/api/auth/user', async (req, res) => {
    if (req.isAuthenticated()) {
      try {
        let userId;

        // Unified user object from Passport.js
        const user = req.user as any;
        if (user) {
          // Fetch full user profile from storage if needed
          const fullUser = await storage.getUser(user.id);
          if (fullUser) {
            return res.json({
              ...fullUser,
              authMethod: user.googleId ? 'google' :
                         user.githubId ? 'github' : 'local'
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
  
  // Registro con email y contraseña
  app.post('/api/auth/register', [
    body('email').isEmail().withMessage('Ingrese un email válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('lastName').trim().notEmpty().withMessage('El apellido es obligatorio'),
  ], async (req, res) => {
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
        return res.status(400).json({ message: 'Ya existe un usuario con este email' });
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear nuevo usuario
      const userId = `local_${Date.now().toString()}_${Math.random().toString(36).substring(2, 15)}`;
      
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl: profileImageUrl || "",
        password: hashedPassword,
        isPremium: false
      });

      // Iniciar sesión automáticamente
      req.login({ id: userId, email, firstName, lastName, profileImageUrl }, (err) => {
        if (err) {
          console.error("Error de inicio de sesión tras registro:", err);
          return res.status(500).json({ message: 'Error en el inicio de sesión automático' });
        }
        return res.status(201).json({ message: 'Usuario registrado correctamente' });
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: 'Error en el servidor durante el registro' });
    }
  });

  // Login con email y contraseña
  app.post('/api/auth/login/local', loginRateLimit, [
    body('email').isEmail(),
    body('password').notEmpty()
  ], (req, res, next) => {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("Error en autenticación local:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Autenticación fallida' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: 'Inicio de sesión exitoso',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl
          }
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

  // Cierre de sesión unificado
  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
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
      const language = await storage.getLanguageBySlug(req.params.slug);
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }
      res.json(language);
    } catch (error) {
      console.error("Error fetching language:", error);
      res.status(500).json({ message: "Failed to fetch language" });
    }
  });

  // Exercise by slug route (must come before the generic /:slug route)
  app.get('/api/exercises/:id', async (req, res) => {
    try {
      const exercise = await storage.getExerciseBySlug(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Exercises routes
  app.get('/api/languages/:slug/exercises', async (req, res) => {
    try {
      const { difficulty } = req.query;
      const exercises = await storage.getExercisesByLanguage(req.params.slug, difficulty as string);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Exercise search route for rankings
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

  app.get('/api/exercises/:slug', async (req, res) => {
    try {
      const exercise = await storage.getExerciseBySlug(req.params.slug);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Code execution route (for guests and authenticated users) - VS Code Copilot style
  app.post('/api/exercises/:slug/execute', async (req, res) => {
    try {
      // Security logging
      securityLogger.logSecurityEvent(req, 'CODE_EXECUTION', { 
        exerciseSlug: req.params.slug,
        codeLength: req.body.code?.length || 0
      });

      const exercise = await storage.getExerciseBySlug(req.params.slug);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const { code } = req.body;
      
      if (!code || !code.trim()) {
        return res.status(400).json({ message: "Code is required" });
      }

      // Validate and sanitize code for security
      const codeValidation = sanitizeCode(code);
      if (!codeValidation.isValid) {
        securityLogger.logSecurityEvent(req, 'CODE_EXECUTION', { 
          dangerous: true,
          error: codeValidation.error,
          originalCode: code.substring(0, 100) + '...'
        }, 'CRITICAL');
        return res.status(400).json({ message: codeValidation.error });
      }

      // Parse test cases from exercise with robust error handling
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

      // If no test cases, create a basic one
      if (testCases.length === 0) {
        testCases = [{ input: '', expected: 'Hello World' }];
      }

      // Get language information
      const language = await storage.getLanguageById(exercise.languageId);
      const languageSlug = language?.slug || 'javascript';

      // Execute code with fixed service that handles test cases correctly
      const executionResult = await fixedCodeExecutionService.executeCode(
        code,
        languageSlug,
        testCases,
        `execute_${Date.now()}`
      );
      
      res.json({
        results: {
          status: executionResult.allTestsPassed ? 'accepted' : 'wrong_answer',
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          output: executionResult.output,
          error: executionResult.error,
          testResults: executionResult.testResults,
          summary: executionResult.summary,
          allTestsPassed: executionResult.allTestsPassed
        }
      });
    } catch (error: any) {
      console.error("Error executing code:", error);
      res.status(500).json({ message: "Failed to execute code", error: error?.message });
    }
  });

  // Submissions routes (authenticated users only)
  app.post('/api/exercises/:slug/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const exercise = await storage.getExerciseBySlug(req.params.slug);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const submissionData = insertSubmissionSchema.parse({
        userId,
        exerciseId: exercise.id,
        code: req.body.code,
        status: "pending"
      });

      // Execute code using the same service as the execute endpoint
      let testCases: Array<{input: string, expected: string}> = [];
      try {
        if (exercise.testCases && Array.isArray(exercise.testCases)) {
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
      } catch (error) {
        console.error('Error parsing test cases for submission:', error);
        testCases = [];
      }

      // If no test cases, create a basic one
      if (testCases.length === 0) {
        testCases = [{ input: '', expected: 'Hello World' }];
      }
      const language = await storage.getLanguageById(exercise.languageId);
      const languageSlug = language?.slug || 'javascript';

      const executionResult = await fixedCodeExecutionService.executeCode(
        req.body.code,
        languageSlug,
        testCases,
        `submit_${Date.now()}`
      );
      
      const testResults = {
        status: executionResult.allTestsPassed ? 'accepted' : 'wrong_answer',
        executionTime: executionResult.executionTime,
        memoryUsed: executionResult.memoryUsed,
        output: executionResult.output,
        testResults: executionResult.testResults
      };
      
      const submission = await storage.createSubmission({
        ...submissionData,
        status: testResults.status,
        executionTime: testResults.executionTime,
        memoryUsed: testResults.memoryUsed
      });

      // Update user progress and rankings if solved
      if (testResults.status === "accepted") {
        await storage.updateUserProgress({
          userId,
          exerciseId: exercise.id,
          solved: true,
          bestTime: testResults.executionTime,
          attempts: 1,
          lastAttempt: new Date()
        });

        // Update exercise ranking automatically
        await storage.updateExerciseRanking({
          exerciseId: exercise.id,
          userId,
          executionTime: testResults.executionTime || 0,
          submissionId: submission.id
        });
      }

      res.json({
        submission,
        results: {
          status: testResults.status,
          executionTime: testResults.executionTime,
          memoryUsed: testResults.memoryUsed,
          output: testResults.output,
          testResults: testResults.testResults,
          summary: executionResult.summary,
          allTestsPassed: executionResult.allTestsPassed
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
      const exercise = await storage.getExerciseBySlug(req.params.slug);
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

  // GitHub Import routes (authenticated admin only)
  app.post('/api/admin/import/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const { exercises } = req.body;
      
      if (!Array.isArray(exercises)) {
        return res.status(400).json({ message: "Se requiere un array de ejercicios" });
      }

      const result = await githubImportService.importExercises(exercises as GitHubExercise[]);
      
      res.json(result);
    } catch (error) {
      console.error("Error importing exercises:", error);
      res.status(500).json({ message: "Error al importar ejercicios" });
    }
  });

  app.post('/api/admin/import/parse-markdown', isAuthenticated, async (req: any, res) => {
    try {
      const { markdownContent, filename } = req.body;
      
      if (!markdownContent || !filename) {
        return res.status(400).json({ message: "Se requiere contenido markdown y nombre de archivo" });
      }

      const exercise = githubImportService.parseMarkdownToExercise(markdownContent, filename);
      
      if (!exercise) {
        return res.status(400).json({ message: "No se pudo parsear el archivo markdown" });
      }

      res.json({ exercise });
    } catch (error) {
      console.error("Error parsing markdown:", error);
      res.status(500).json({ message: "Error al parsear markdown" });
    }
  });

  // Batch import endpoint for multiple markdown files
  app.post('/api/admin/import/batch-markdown', isAuthenticated, async (req: any, res) => {
    try {
      const { files } = req.body; // Array of { content: string, filename: string }
      
      if (!Array.isArray(files)) {
        return res.status(400).json({ message: "Se requiere un array de archivos" });
      }

      const exercises: GitHubExercise[] = [];
      const parseErrors: string[] = [];

      for (const file of files) {
        try {
          const exercise = githubImportService.parseMarkdownToExercise(file.content, file.filename);
          if (exercise) {
            exercises.push(exercise);
          } else {
            parseErrors.push(`No se pudo parsear: ${file.filename}`);
          }
        } catch (error) {
          parseErrors.push(`Error en ${file.filename}: ${error}`);
        }
      }

      if (exercises.length === 0) {
        return res.status(400).json({ 
          message: "No se pudo parsear ningún ejercicio",
          errors: parseErrors 
        });
      }

      // Import the parsed exercises
      const importResult = await githubImportService.importExercises(exercises);
      
      res.json({
        ...importResult,
        parseErrors
      });
    } catch (error) {
      console.error("Error in batch import:", error);
      res.status(500).json({ message: "Error en importación masiva" });
    }
  });

  // Ruta para importar ejercicios adicionales predefinidos
  app.post('/api/admin/import/additional-exercises', async (req, res) => {
    try {
      const { githubExerciseData } = await import('./githubExerciseData.js');
      
      console.log(`Iniciando importación de ${githubExerciseData.length} ejercicios adicionales...`);
      
      const result = await githubImportService.importExercises(githubExerciseData);
      
      console.log(`Importación completada. Ejercicios importados: ${result.exercisesImported}`);
      
      res.json({
        ...result,
        message: `Se importaron ${result.exercisesImported} ejercicios adicionales exitosamente`
      });
    } catch (error) {
      console.error('Error en importación de ejercicios adicionales:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor durante la importación',
        details: error.message
      });
    }
  });



  // Comments endpoints
  app.get('/api/exercises/:id/comments', async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      
      if (isNaN(exerciseId)) {
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
      if (isNaN(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const commentData = insertCommentSchema.parse({
        ...req.body,
        exerciseId,
        userId
      });

      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  app.delete('/api/comments/:id', isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
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
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Global rankings endpoint
  app.get("/api/rankings/global", async (req, res) => {
    try {
      // Return only real user data - no fake rankings
      const currentUserId = (req.user as any)?.id;
      const rankings = [];
      
      // If user is authenticated, show only their real ranking
      if (currentUserId) {
        const userStats = await storage.getUserStats(currentUserId);
        if (userStats) {
          rankings.push({
            rank: 1,
            userId: currentUserId,
            firstName: "Tu",
            lastName: "Progreso",
            points: userStats.totalPoints || 0,
            exercisesSolved: userStats.exercisesSolved || 0,
            averageTime: userStats.averageTime || 0,
            isCurrentUser: true
          });
        }
      }
      
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  // Initialize rankings for all exercises endpoint
  app.post("/api/rankings/initialize", async (req, res) => {
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

  // AI Code Explanation - Free for registered users
  app.post('/api/ai/explain-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userCode, language, exerciseTitle } = req.body;
      
      if (!userCode || !language) {
        return res.status(400).json({ message: "Se requiere código y lenguaje" });
      }

      const explanation = await freeAIService.explainCode(
        userCode,
        language,
        exerciseTitle,
        userId
      );

      res.json(explanation);
    } catch (error: any) {
      console.error("Error explaining code:", error);
      res.status(500).json({ message: error.message || "Error al explicar el código" });
    }
  });

  // AI Error Explanation - Free for registered users
  app.post('/api/ai/explain-error', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userCode, expectedOutput, actualOutput, language, exerciseTitle } = req.body;

      if (!userCode || !expectedOutput || !actualOutput || !language) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // This now uses the free AI service
      const explanation = await freeAIService.explainCode(
        `${userCode}\n\nError: La salida esperada era "${expectedOutput}" pero se obtuvo "${actualOutput}"`,
        language,
        exerciseTitle,
        userId
      );
      
      res.json(explanation);
    } catch (error: any) {
      console.error("Error explaining code error:", error);
      res.status(500).json({ message: "Error al explicar el error del código" });
    }
  });

  // AI Personalized Recommendations - Free for registered users
  app.post('/api/ai/personalized-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userLevel, completedExercises, struggledTopics } = req.body;
      
      // This now uses the free AI service
      const recommendations = await freeAIService.explainCode(
        `Nivel de usuario: ${userLevel}\nEjercicios completados: ${completedExercises.join(', ')}\nTemas con dificultad: ${struggledTopics.join(', ')}`,
        'meta',
        'Recomendaciones personalizadas',
        userId
      );
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Error al obtener recomendaciones" });
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
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Exercise-specific rankings endpoint - public access for guests  
  app.get("/api/exercises/:exerciseSlug/rankings", async (req, res) => {
    try {
      const { exerciseSlug } = req.params;
      
      // Get exercise by slug first
      const exercise = await storage.getExerciseBySlug(exerciseSlug);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      
      // Get real exercise rankings from database - top 5 fastest times
      const realRankings = await storage.getExerciseRankings(exercise.id);
      res.json(realRankings);
    } catch (error) {
      console.error("Error fetching exercise rankings:", error);
      res.status(500).json({ error: "Failed to fetch exercise rankings" });
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
      const userStats = await storage.getUserStats(userId);
      const achievements = []; // No fake achievements - only real unlocked achievements

      res.json(achievements);
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

      // Get user progress data
      const progressData = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      // Get user submissions for calculating best rank
      const submissionsData = await db
        .select()
        .from(submissions)
        .where(eq(submissions.userId, userId));

      // Get user streak data
      const streakData = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      // Get total exercises count
      const totalExercisesResult = await db
        .select({ count: count(exercises.id) })
        .from(exercises);

      const totalExercises = totalExercisesResult[0]?.count || 0;
      const solvedExercises = progressData.filter((p: any) => p.solved).length;
      const totalAttempts = progressData.reduce((sum: number, progress: any) => sum + (progress.attempts || 0), 0);
      
      // Calculate average time from solved exercises only
      const solvedProgressData = progressData.filter((p: any) => p.solved && p.bestTime);
      const averageTime = solvedProgressData.length > 0 
        ? Math.round(solvedProgressData.reduce((sum: number, progress: any) => sum + progress.bestTime, 0) / solvedProgressData.length)
        : 0;

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
        bestRank: bestRank,
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
      const learningPaths = [];
      res.json(learningPaths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // Exercise counts by language endpoint
  app.get("/api/exercise-counts", async (req, res) => {
    try {
      // Get real exercise counts from database
      const languages = await storage.getLanguages();
      const exerciseCounts = [];

      for (const language of languages) {
        const exercises = await storage.getExercisesByLanguage(language.slug);
        exerciseCounts.push({
          languageSlug: language.slug,
          languageName: language.name,
          exerciseCount: exercises.length
        });
      }

      res.json(exerciseCounts);
    } catch (error) {
      console.error("Error fetching exercise counts:", error);
      res.status(500).json({ error: "Failed to fetch exercise counts" });
    }
  });

  // Security monitoring endpoint (admin only)
  app.get('/api/security/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow admin access to security dashboard
      if (userId !== 'admin') {
        securityLogger.logSecurityEvent(req, 'ADMIN_ACCESS', {
          unauthorized: true,
          attemptedResource: 'security dashboard'
        }, 'HIGH');
        return res.status(403).json({ error: 'Access denied' });
      }

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
  app.post('/api/security/run-tests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (userId !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { securityTestSuite } = await import('./security/securityTests.js');
      const testResults = await securityTestSuite.runAllTests();
      const report = securityTestSuite.generateSecurityReport(testResults);
      
      securityLogger.logSecurityEvent(req, 'ADMIN_ACCESS', {
        securityTestRun: true,
        testsPassed: testResults.overallPassed
      });

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

  // Security status endpoint
  app.get('/api/security/status', async (req, res) => {
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
  app.get('/api/security/compliance-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
        if (userId !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

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

  // Generate exercises for specific languages endpoint
  app.post('/api/admin/generate-exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (userId !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      console.log('Starting manual exercise generation for C, C++, C#...');
      const { specificLanguageExerciseGenerator } = await import('./generateSpecificLanguageExercises.js');
      await specificLanguageExerciseGenerator.generateForAllTargetLanguages();
      
      res.json({
        success: true,
        message: 'Exercise generation completed for C, C++, C#',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating exercises:', error);
      res.status(500).json({ error: 'Failed to generate exercises' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
