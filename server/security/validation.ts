import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

// Lazy-initialized DOMPurify instance.
// JSDOM is extremely heavy (~8 MB transitive deps) — instantiating it at import
// time crashes Vercel serverless functions (FUNCTION_INVOCATION_FAILED).
let purify: any = null;

function getPurify() {
  if (!purify) {
    // Dynamic require avoids loading jsdom at module evaluation time
    const { JSDOM } = require('jsdom');
    const DOMPurify = require('dompurify');
    const window = new JSDOM('').window;
    purify = DOMPurify(window);
  }
  return purify;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return getPurify().sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'code', 'pre'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize user input — only trim + length-limit.
 * SQL injection is prevented by parameterized queries (Drizzle ORM).
 * The old regex-based keyword stripping was broken (removed legitimate words
 * like "select", "update", "delete" from user text).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 1000);
}

/**
 * Validate and sanitize code input for exercise execution
 */
export function sanitizeCode(code: string): { isValid: boolean; sanitized: string; error?: string } {
  if (typeof code !== 'string') {
    return { isValid: false, sanitized: '', error: 'Code must be a string' };
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /require\s*\(\s*['"`]fs['"`]\s*\)/, // File system access
    /require\s*\(\s*['"`]child_process['"`]\s*\)/, // Process execution
    /require\s*\(\s*['"`]os['"`]\s*\)/, // OS access
    /eval\s*\(/, // Direct eval
    /Function\s*\(/, // Function constructor
    /import\s+.*from\s+['"`]fs['"`]/, // ES6 fs import
    /import\s+.*from\s+['"`]child_process['"`]/, // ES6 process import
    /process\.exit/, // Process termination
    /while\s*\(\s*true\s*\)/, // Infinite loops
    /for\s*\(\s*;\s*;\s*\)/, // Infinite for loops
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return { 
        isValid: false, 
        sanitized: '', 
        error: 'Code contains potentially dangerous operations' 
      };
    }
  }

  // Limit code length
  if (code.length > 10000) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: 'Code exceeds maximum length limit' 
    };
  }

  return { isValid: true, sanitized: code };
}

/**
 * Validation rules for user registration
 */
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('First name must contain only letters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Last name must contain only letters'),
];

/**
 * Validation rules for exercise submission
 */
export const validateExerciseSubmission = [
  body('code')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code is required and must not exceed 10,000 characters'),
  body('exerciseId')
    .isInt({ min: 1 })
    .withMessage('Valid exercise ID is required'),
];

/**
 * Validation rules for comments
 */
export const validateComment = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('exerciseId')
    .isInt({ min: 1 })
    .withMessage('Valid exercise ID is required'),
];

/**
 * Middleware to handle validation errors
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  
  // Sanitize string fields
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitizeInput(value);
      }
    }
  }
  
  next();
}