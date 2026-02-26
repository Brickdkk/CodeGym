import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Code,
  Trophy,
  Shield,
  Gamepad2,
  TrendingUp,
  Smartphone,
  Play,
  UserPlus,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { Language } from "@shared/schema";
import { getLanguageLogo } from "@/lib/languageLogos";
import { useState } from "react";

interface Stats {
  activeUsers: number;
  exercisesSolved: number;
  successRate: number;
}

interface ExerciseCount {
  languageSlug: string;
  languageName: string;
  exerciseCount: number;
}

/* ── animation presets ────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

/* ── Language Card (inline, only used here) ───────────────── */

function LanguageGridCard({
  language,
  exerciseCount,
  index,
}: {
  language: Language;
  exerciseCount?: number;
  index: number;
}) {
  const logoSrc = getLanguageLogo(language.slug);
  const [imgError, setImgError] = useState(false);
  const displayCount =
    exerciseCount !== undefined ? exerciseCount : language.exerciseCount;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Link href={`/language/${language.slug}`}>
        <Card className="group relative overflow-hidden cursor-pointer border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/20">
          {/* Glow line at top */}
          <div
            className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: language.color || "hsl(195,100%,50%)" }}
          />

          <div className="p-6 sm:p-8">
            {/* Logo + Badge row */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted/60 group-hover:scale-110 transition-transform duration-300">
                {logoSrc && !imgError ? (
                  <img
                    src={logoSrc}
                    alt={`${language.name} logo`}
                    className="w-10 h-10 object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: language.color || "#6366f1" }}
                  >
                    <Code className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-medium text-primary"
              >
                {displayCount} ejercicios
              </Badge>
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">
              {language.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">
              {language.description}
            </p>

            {/* CTA */}
            <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
              Comenzar
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/* ── Feature item ─────────────────────────────────────────── */

const features = [
  {
    icon: Code,
    title: "Editor Profesional",
    desc: "Resaltado de sintaxis, autocompletado y numeración de líneas como en tu IDE favorito.",
  },
  {
    icon: Trophy,
    title: "Rankings Globales",
    desc: "Compite por un lugar en el Top 5 y demuestra tus habilidades en tiempo real.",
  },
  {
    icon: Shield,
    title: "Ejecución Segura",
    desc: "Tu código se ejecuta en entornos aislados dentro de tu navegador.",
  },
  {
    icon: Gamepad2,
    title: "Gamificación",
    desc: "Gana puntos, desbloquea insignias y mantén rachas para mantenerte motivado.",
  },
  {
    icon: TrendingUp,
    title: "Progreso Detallado",
    desc: "Estadísticas detalladas y feedback personalizado en cada ejercicio.",
  },
  {
    icon: Smartphone,
    title: "Multiplataforma",
    desc: "Accede desde cualquier dispositivo con experiencia optimizada.",
  },
];

/* ── Main component ───────────────────────────────────────── */

export default function Home() {
  const { isAuthenticated } = useAuth();

  const { data: languages = [], isLoading: languagesLoading } = useQuery<
    Language[]
  >({
    queryKey: ["/api/languages"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: exerciseCounts = [] } = useQuery<ExerciseCount[]>({
    queryKey: ["/api/exercise-counts"],
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-hidden">
      {/* ── Layer 1: Grid background ─────────────────────── */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none" />

      {/* ── Layer 2: Radial mask (softens grid edges) ────── */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)]" />

      {/* ── Layer 3: All content ─────────────────────────── */}
      <div className="relative z-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Subtle radial gradient behind hero */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(195,100%,50%,0.08),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/30 text-primary"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              100% Gratuito
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Entrena tus Habilidades de{" "}
              <span className="text-primary">Programación</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Resuelve ejercicios interactivos, compite en rankings y mejora tus
              habilidades con nuestra plataforma gamificada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-3"
                onClick={handleGetStarted}
              >
                <Play className="mr-2 h-5 w-5" />
                {isAuthenticated ? "Continuar Programando" : "Crear Cuenta Gratuita"}
              </Button>

              <Link href={languages.length > 0 ? `/language/${languages[0].slug}` : "/"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 border-border hover:border-primary/50"
                >
                  Explorar Ejercicios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-10 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn}>
              <div className="text-3xl font-bold text-primary mb-1">
                {statsLoading
                  ? "..."
                  : stats?.exercisesSolved?.toLocaleString() || "1,213"}
              </div>
              <div className="text-sm text-muted-foreground">
                Ejercicios Resueltos
              </div>
            </motion.div>
            <motion.div variants={scaleIn}>
              <div className="text-3xl font-bold text-primary mb-1">
                {statsLoading ? "..." : `${stats?.successRate || 94}%`}
              </div>
              <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Language Grid ────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Elige tu Lenguaje
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Selecciona un lenguaje y empieza a resolver ejercicios desde
              principiante hasta avanzado.
            </p>
          </motion.header>

          {languagesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-8 animate-pulse">
                  <div className="w-14 h-14 bg-muted rounded-xl mb-5" />
                  <div className="h-6 bg-muted rounded mb-3 w-3/4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {languages.map((language, index) => {
                  const count = exerciseCounts.find(
                    (c) => c.languageSlug === language.slug
                  )?.exerciseCount;
                  return (
                    <LanguageGridCard
                      key={language.id}
                      language={language}
                      exerciseCount={count}
                      index={index}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ¿Por Qué CodeGym?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Diseñado para acelerar tu crecimiento como desarrollador.
            </p>
          </motion.header>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                className="text-center group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-8 lg:p-12">
              {/* Subtle accent glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  ¿Listo para mejorar tus habilidades?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {isAuthenticated
                    ? "Continúa resolviendo ejercicios y escalando posiciones en el ranking."
                    : "Regístrate gratis y comienza tu camino como programador hoy."}
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-3"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Programando
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Crear Cuenta Gratuita
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      </div>{/* end content layer */}
    </div>
  );
}
