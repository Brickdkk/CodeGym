export interface SeedExercise {
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  languageSlug: string;
  starterCode: string;
  solution: string;
  testCases: Array<{ input: string; expected: string }>;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  points: number;
  isActive: boolean;
}
