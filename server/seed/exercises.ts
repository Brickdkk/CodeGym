/**
 * exercises.ts — Seed runner for curated exercises.
 *
 * Imports all per-language exercise arrays, resolves languageId from slug,
 * and upserts into the DB. Called once during app initialization.
 * Also migrates any legacy "basic" difficulty to "beginner".
 */

import { storage } from '../storage.js';
import { db } from '../db.js';
import { exercises } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { pythonExercises } from './pythonExercises.js';
import { jsExercises } from './jsExercises.js';
import { cppExercises } from './cppExercises.js';
import { cExercises } from './cExercises.js';
import { htmlExercises } from './htmlExercises.js';
import type { SeedExercise } from './types.js';
import type { InsertExercise } from '../../shared/schema.js';

const allExercises: SeedExercise[] = [
  ...pythonExercises,
  ...jsExercises,
  ...cppExercises,
  ...cExercises,
  ...htmlExercises,
];

/**
 * Seed curated exercises. Skips any exercise whose slug already exists.
 * Migrates legacy "basic" difficulty → "beginner".
 * Returns the count of newly inserted exercises.
 */
export async function seedExercises(): Promise<number> {
  // Migrate any existing "basic" exercises to "beginner"
  try {
    const migrated = await db
      .update(exercises)
      .set({ difficulty: 'beginner' })
      .where(eq(exercises.difficulty, 'basic'));
    console.log('[seed] Migrated "basic" difficulty exercises to "beginner"');
  } catch (err) {
    console.error('[seed] Failed to migrate basic→beginner:', err);
  }

  // Build a slug -> languageId map
  const languageMap = new Map<string, number>();

  for (const ex of allExercises) {
    if (!languageMap.has(ex.languageSlug)) {
      const lang = await storage.getLanguageBySlug(ex.languageSlug);
      if (lang) {
        languageMap.set(ex.languageSlug, lang.id);
      } else {
        console.warn(`[seed] Language not found for slug "${ex.languageSlug}", skipping its exercises.`);
      }
    }
  }

  let inserted = 0;

  for (const ex of allExercises) {
    const languageId = languageMap.get(ex.languageSlug);
    if (!languageId) continue;

    // Skip if already exists
    const existing = await storage.getExerciseBySlug(ex.slug);
    if (existing) continue;

    const exercise = {
      title: ex.title,
      slug: ex.slug,
      description: ex.description,
      difficulty: ex.difficulty,
      languageId,
      starterCode: ex.starterCode,
      solution: ex.solution,
      testCases: ex.testCases,
      tags: ex.tags,
      timeLimit: ex.timeLimit,
      memoryLimit: ex.memoryLimit,
      points: ex.points,
      isActive: ex.isActive,
    } as any;

    try {
      await storage.createExercise(exercise);
      inserted++;
    } catch (err) {
      console.error(`[seed] Failed to insert exercise "${ex.slug}":`, err);
    }
  }

  return inserted;
}
