import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeModal from "@/components/WelcomeModal";
import CookieBanner from "@/components/CookieBanner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Route-level code splitting: each page loads only when navigated to
const Home = lazy(() => import("@/pages/Home"));
const LanguagePage = lazy(() => import("@/pages/LanguagePage"));
const ExercisePage = lazy(() => import("@/pages/ExercisePage"));
const RankingPage = lazy(() => import("@/pages/RankingPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPages = lazy(() => import("@/components/auth/AuthPages").then(m => ({ default: m.AuthPages })));

/* ── Error Boundary ──────────────────────────────────────── */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Algo salió mal</h1>
            <p className="text-muted-foreground mb-6">
              Ha ocurrido un error inesperado. Intenta recargar la página.
            </p>
            <Button onClick={this.handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Page Loader ─────────────────────────────────────────── */

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

/* ── Router ──────────────────────────────────────────────── */

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/language/:slug" component={LanguagePage} />
              <Route path="/exercise/:slug" component={ExercisePage} />
              <Route path="/rankings" component={RankingPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/legal" component={LegalPage} />
              
              {/* Rutas de autenticación */}
              <Route path="/login">{() => <AuthPages />}</Route>
              <Route path="/register">{() => <AuthPages />}</Route>
              
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <WelcomeModal />
      <CookieBanner />
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────── */

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
