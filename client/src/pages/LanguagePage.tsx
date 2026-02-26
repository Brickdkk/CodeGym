import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Code,
  Flame,
  Gauge,
  Rocket,
  ChevronRight,
} from "lucide-react";
import type { Language, Exercise } from "@shared/schema";
import { getLanguageLogo } from "@/lib/languageLogos";

/* ── Animation presets ────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

/* ── Difficulty config ────────────────────────────────────── */

interface DifficultyInfo {
  key: string;
  label: string;
  description: string;
  color: string;       // tailwind bg class
  textColor: string;   // tailwind text class
  borderColor: string; // tailwind hover border
  icon: typeof Flame;
}

const difficulties: DifficultyInfo[] = [
  {
    key: "beginner",
    label: "Principiante",
    description: "Conceptos fundamentales y sintaxis básica. Ideal para empezar.",
    color: "bg-green-500/10",
    textColor: "text-green-500",
    borderColor: "hover:border-green-500/50",
    icon: Flame,
  },
  {
    key: "intermediate",
    label: "Intermedio",
    description: "Estructuras de datos, lógica y algoritmos de complejidad media.",
    color: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    borderColor: "hover:border-yellow-500/50",
    icon: Gauge,
  },
  {
    key: "advanced",
    label: "Avanzado",
    description: "Problemas complejos que requieren pensamiento algorítmico avanzado.",
    color: "bg-red-500/10",
    textColor: "text-red-500",
    borderColor: "hover:border-red-500/50",
    icon: Rocket,
  },
];

/* ── Helpers ──────────────────────────────────────────────── */

function normalizeDifficulty(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (["easy", "basic", "principiante"].includes(d)) return "beginner";
  if (["medium", "intermedio"].includes(d)) return "intermediate";
  if (["hard", "avanzado"].includes(d)) return "advanced";
  return d;
}

function getDifficultyBadgeColor(difficulty: string): string {
  const d = normalizeDifficulty(difficulty);
  if (d === "beginner") return "bg-green-500";
  if (d === "intermediate") return "bg-yellow-500";
  if (d === "advanced") return "bg-red-500";
  return "bg-gray-500";
}

function getDifficultyLabel(difficulty: string): string {
  const d = normalizeDifficulty(difficulty);
  if (d === "beginner") return "Principiante";
  if (d === "intermediate") return "Intermedio";
  if (d === "advanced") return "Avanzado";
  return difficulty;
}

/* ── Main component ───────────────────────────────────────── */

export default function LanguagePage() {
  const [, params] = useRoute("/language/:slug");
  const slug = params?.slug;
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const { data: language, isLoading: languageLoading } = useQuery<Language>({
    queryKey: [`/api/languages/${slug}`],
    enabled: !!slug,
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: [`/api/languages/${slug}/exercises`],
    enabled: !!slug,
  });

  /* group exercises by normalised difficulty */
  const grouped = exercises.reduce((acc, ex) => {
    const d = normalizeDifficulty(ex.difficulty);
    (acc[d] ??= []).push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  /* ── Loading skeleton ───────────────────────────────────── */
  if (languageLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-24" />
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-muted rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-8 bg-muted rounded w-64" />
                <div className="h-5 bg-muted rounded w-96" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 404 ────────────────────────────────────────────────── */
  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Lenguaje no encontrado</h1>
            <p className="text-muted-foreground mb-4">
              El lenguaje que buscas no existe o ha sido removido.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoSrc = language.slug ? getLanguageLogo(language.slug) : undefined;
  const selectedInfo = difficulties.find((d) => d.key === selectedDifficulty);
  const filteredExercises = selectedDifficulty ? (grouped[selectedDifficulty] ?? []) : [];

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Back button ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {selectedDifficulty ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDifficulty(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Elegir dificultad
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          )}
        </motion.div>

        {/* ── Language header ─────────────────────────────── */}
        <motion.div
          className="flex items-center gap-5 mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-muted/50 flex-shrink-0">
            {logoSrc && !imgError ? (
              <img
                src={logoSrc}
                alt={`${language.name} logo`}
                className="w-12 h-12 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: language.color || "#6366f1" }}
              >
                <Code className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              {language.name}
            </h1>
            <p className="text-muted-foreground mt-1">{language.description}</p>
          </div>
        </motion.div>

        {/* ── Content area (animated swap) ────────────────── */}
        <AnimatePresence mode="wait">
          {!selectedDifficulty ? (
            /* ── Step 1: Difficulty selection ──────────────── */
            <motion.div
              key="difficulty-select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <h2 className="text-2xl font-bold mb-2">Elige tu nivel</h2>
              <p className="text-muted-foreground mb-8">
                Selecciona la dificultad para ver los ejercicios disponibles.
              </p>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {difficulties.map((diff, i) => {
                  const count = grouped[diff.key]?.length ?? 0;
                  return (
                    <motion.div key={diff.key} custom={i} variants={fadeUp}>
                      <Card
                        className={`group cursor-pointer border border-border/60 transition-all duration-300 ${diff.borderColor} hover:shadow-lg`}
                        onClick={() => setSelectedDifficulty(diff.key)}
                      >
                        <CardContent className="p-6">
                          <div
                            className={`w-12 h-12 rounded-xl ${diff.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <diff.icon className={`h-6 w-6 ${diff.textColor}`} />
                          </div>

                          <h3 className="text-lg font-bold mb-1">{diff.label}</h3>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {diff.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${diff.textColor}`}>
                              {exercisesLoading ? "..." : `${count} ejercicios`}
                            </span>
                            <ChevronRight
                              className={`h-4 w-4 ${diff.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ) : (
            /* ── Step 2: Exercise list ────────────────────── */
            <motion.div
              key="exercise-list"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {/* Difficulty header */}
              <div className="flex items-center gap-3 mb-8">
                {selectedInfo && (
                  <div
                    className={`w-10 h-10 rounded-lg ${selectedInfo.color} flex items-center justify-center`}
                  >
                    <selectedInfo.icon
                      className={`h-5 w-5 ${selectedInfo.textColor}`}
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedInfo?.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredExercises.length} ejercicios disponibles
                  </p>
                </div>
              </div>

              {exercisesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded mb-2 w-3/4" />
                        <div className="h-4 bg-muted rounded w-full mb-4" />
                        <div className="h-6 w-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredExercises.length === 0 ? (
                <motion.div variants={slideIn}>
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        No hay ejercicios disponibles para este nivel.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSelectedDifficulty(null)}
                      >
                        Elegir otra dificultad
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredExercises.map((exercise, i) => (
                    <motion.div
                      key={exercise.id}
                      custom={i}
                      variants={fadeUp}
                    >
                      <Link href={`/exercise/${exercise.slug}`}>
                        <Card className="group cursor-pointer border border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-5 flex items-center gap-4">
                            {/* Number badge */}
                            <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0 text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                              {i + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                                {exercise.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                {exercise.description}
                              </p>
                            </div>

                            {/* Difficulty badge + play */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className={`${getDifficultyBadgeColor(exercise.difficulty)} text-white text-xs`}
                              >
                                {getDifficultyLabel(exercise.difficulty)}
                              </Badge>
                              <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
