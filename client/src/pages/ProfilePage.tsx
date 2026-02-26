import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  User,
  Save,
  Trophy,
  Target,
  Calendar,
  BookOpen,
  Zap,
  Shield,
  Star,
  Flame,
  Lock,
  Settings,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getRelativeTime } from "@/lib/timeUtils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profileImageUrl?: string;
  createdAt: string;
  country?: string;
  password?: string;
  authMethod?: string;
}

interface UserStats {
  exercisesSolved: number;
  solvedExercises: number;
  totalPoints: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteLanguage: string;
  totalExercises: number;
  successRate: number;
  totalAttempts: number;
}

interface LanguageProgress {
  languageId: number;
  languageName: string;
  languageSlug: string;
  languageColor: string;
  totalExercises: number;
  solvedExercises: number;
}

/* ------------------------------------------------------------------ */
/*  Animated progress bar (spring physics)                             */
/* ------------------------------------------------------------------ */

function AnimatedProgressBar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  const springValue = useSpring(0, { stiffness: 60, damping: 18, mass: 1 });
  const width = useTransform(springValue, (v) => `${v}%`);

  useEffect(() => {
    const timer = setTimeout(() => springValue.set(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay, springValue]);

  return (
    <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ width, backgroundColor: color }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card with hover elevation                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,200,255,0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 flex flex-col items-center gap-2 cursor-default"
    >
      <div
        className="rounded-full p-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge pill (shiny)                                                 */
/* ------------------------------------------------------------------ */

function ShinyBadge({
  icon: Icon,
  label,
  unlocked,
}: {
  icon: React.ElementType;
  label: string;
  unlocked: boolean;
}) {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.08 } : {}}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
        unlocked
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
          : "border-white/5 bg-white/[0.02] text-muted-foreground opacity-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {unlocked && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.3 }}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
        </motion.span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  /* ---- Settings state ---- */
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  /* ---- Queries ---- */
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
    staleTime: 0,
    retry: false,
  });

  const { data: languageProgress = [] } = useQuery<LanguageProgress[]>({
    queryKey: ["/api/user/progress/by-language"],
    enabled: isAuthenticated,
    staleTime: 0,
    retry: false,
  });

  /* Sync username field */
  useEffect(() => {
    if (userProfile?.username) setUsername(userProfile.username);
  }, [userProfile]);

  /* ---- Mutations ---- */
  const usernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      const res = await apiRequest("PATCH", "/api/profile/username", { username: newUsername });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Nombre de usuario actualizado" });
      setUsernameError("");
    },
    onError: (err: any) => {
      if (isUnauthorizedError(err)) {
        toast({ title: "Sesion expirada", variant: "destructive" });
        return;
      }
      const msg = err?.message || "Error al actualizar";
      setUsernameError(msg);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", "/api/profile/password", payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Contrasena actualizada" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    },
    onError: (err: any) => {
      if (isUnauthorizedError(err)) {
        toast({ title: "Sesion expirada", variant: "destructive" });
        return;
      }
      setPasswordError(err?.message || "Error al actualizar contrasena");
    },
  });

  /* ---- Handlers ---- */
  const handleUsernameSave = () => {
    setUsernameError("");
    if (username.length < 3 || username.length > 30) {
      setUsernameError("El nombre de usuario debe tener entre 3 y 30 caracteres");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError("Solo letras, numeros, guiones y guiones bajos");
      return;
    }
    usernameMutation.mutate(username);
  };

  const handlePasswordSave = () => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Ingresa tu contrasena actual");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("La nueva contrasena debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contrasenas no coinciden");
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  /* ---- Derived data ---- */
  const solved = userStats?.solvedExercises ?? userStats?.exercisesSolved ?? 0;
  const points = solved * 10;
  const streak = userStats?.currentStreak ?? 0;
  const avgTime = userStats?.averageTime ?? 0;
  const successRate = userStats?.successRate ?? 0;
  const totalAttempts = userStats?.totalAttempts ?? 0;
  const isLocalAuth = userProfile?.authMethod === "local" || !!userProfile?.password;

  /* Badges based on real progress */
  const badges = [
    { icon: Star, label: "Primera solucion", unlocked: solved >= 1 },
    { icon: Zap, label: "5 ejercicios", unlocked: solved >= 5 },
    { icon: Flame, label: "10 ejercicios", unlocked: solved >= 10 },
    { icon: Trophy, label: "25 ejercicios", unlocked: solved >= 25 },
    { icon: Shield, label: "50 ejercicios", unlocked: solved >= 50 },
    { icon: Award, label: "Maestro (80)", unlocked: solved >= 80 },
  ];

  /* ---- Early returns ---- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-white/10 bg-white/[0.03] backdrop-blur-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso requerido</h1>
            <p className="text-muted-foreground mb-4">
              Debes iniciar sesion para ver tu perfil.
            </p>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
              onClick={() => (window.location.href = "/login")}
            >
              Iniciar sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/5 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white/5 rounded-xl" />
              <div className="space-y-4">
                <div className="h-64 bg-white/5 rounded-xl" />
                <div className="h-32 bg-white/5 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ============= HERO HEADER ============= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Avatar className="h-24 w-24 ring-2 ring-cyan-500/50">
            <AvatarImage src={userProfile?.profileImageUrl} alt="avatar" />
            <AvatarFallback className="text-3xl bg-cyan-500/10 text-cyan-400">
              {userProfile?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">
              {userProfile?.firstName} {userProfile?.lastName}
            </h1>
            {userProfile?.username && (
              <p className="text-muted-foreground">@{userProfile.username}</p>
            )}
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground justify-center sm:justify-start">
              <Calendar className="h-4 w-4" />
              <span>Miembro desde {getRelativeTime(userProfile?.createdAt || new Date())}</span>
            </div>
          </div>
        </motion.div>

        {/* ============= TABS ============= */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="bg-white/[0.03] border border-white/10">
            <TabsTrigger value="progress" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progreso
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <Settings className="h-4 w-4 mr-2" />
              Configuracion
            </TabsTrigger>
          </TabsList>

          {/* ======== TAB: PROGRESS ======== */}
          <TabsContent value="progress" className="space-y-6">
            {/* Stat cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Target} label="Ejercicios resueltos" value={solved} color="#00c8ff" />
              <StatCard icon={Trophy} label="Puntos totales" value={points} color="#facc15" />
              <StatCard icon={Flame} label="Racha actual" value={`${streak}d`} color="#f97316" />
              <StatCard icon={Clock} label="Tiempo promedio" value={`${avgTime}ms`} color="#a78bfa" />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon={CheckCircle2} label="Tasa de exito" value={`${successRate}%`} color="#34d399" />
              <StatCard icon={Zap} label="Intentos totales" value={totalAttempts} color="#f472b6" />
              <StatCard icon={BookOpen} label="Total ejercicios" value={userStats?.totalExercises ?? 0} color="#60a5fa" />
            </div>

            {/* Language progress */}
            {languageProgress.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-cyan-400" />
                      Progreso por Lenguaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {languageProgress.map((lp, i) => {
                      const pct =
                        lp.totalExercises > 0
                          ? Math.round((lp.solvedExercises / lp.totalExercises) * 100)
                          : 0;
                      return (
                        <div key={lp.languageSlug}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{lp.languageName}</span>
                            <span className="text-xs text-muted-foreground">
                              {lp.solvedExercises}/{lp.totalExercises} — {pct}%
                            </span>
                          </div>
                          <AnimatedProgressBar
                            pct={pct}
                            color={lp.languageColor || "hsl(195,100%,50%)"}
                            delay={i * 150}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-cyan-400" />
                    Insignias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((b) => (
                      <ShinyBadge key={b.label} icon={b.icon} label={b.label} unlocked={b.unlocked} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ======== TAB: SETTINGS ======== */}
          <TabsContent value="settings" className="space-y-6">
            {/* Username */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-cyan-400" />
                    Nombre de usuario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex gap-3">
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setUsernameError("");
                        }}
                        placeholder="mi_nombre"
                        className="bg-white/5 border-white/10 max-w-sm"
                      />
                      <Button
                        onClick={handleUsernameSave}
                        disabled={usernameMutation.isPending || username === userProfile?.username}
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {usernameMutation.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                    </div>
                    {usernameError && (
                      <p className="text-sm text-red-400">{usernameError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      3-30 caracteres. Solo letras, numeros, guiones y guiones bajos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password (only for local auth) */}
            {isLocalAuth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lock className="h-5 w-5 text-cyan-400" />
                      Cambiar contrasena
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-sm">
                    {/* Current password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPw">Contrasena actual</Label>
                      <div className="relative">
                        <Input
                          id="currentPw"
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-white/5 border-white/10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPw">Nueva contrasena</Label>
                      <div className="relative">
                        <Input
                          id="newPw"
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white/5 border-white/10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPw(!showNewPw)}
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPw">Confirmar nueva contrasena</Label>
                      <Input
                        id="confirmPw"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-sm text-red-400">{passwordError}</p>
                    )}

                    <Button
                      onClick={handlePasswordSave}
                      disabled={passwordMutation.isPending}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {passwordMutation.isPending ? "Guardando..." : "Actualizar contrasena"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Account info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    Informacion de cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{userProfile?.email || "—"}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre</span>
                    <span>{userProfile?.firstName} {userProfile?.lastName}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metodo de autenticacion</span>
                    <Badge variant="outline" className="border-white/10">
                      {userProfile?.authMethod === "google"
                        ? "Google"
                        : userProfile?.authMethod === "github"
                        ? "GitHub"
                        : "Email/Contrasena"}
                    </Badge>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Miembro desde</span>
                    <span>{getRelativeTime(userProfile?.createdAt || new Date())}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
