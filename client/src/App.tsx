import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeModal from "@/components/WelcomeModal";
import CookieBanner from "@/components/CookieBanner";

// Route-level code splitting: each page loads only when navigated to
const Home = lazy(() => import("@/pages/Home"));
const LanguagePage = lazy(() => import("@/pages/LanguagePage"));
const ExercisePage = lazy(() => import("@/pages/ExercisePage"));
const RankingPage = lazy(() => import("@/pages/RankingPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPages = lazy(() => import("@/components/auth/AuthPages").then(m => ({ default: m.AuthPages })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
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
      </main>
      <Footer />
      <WelcomeModal />
      <CookieBanner />
    </div>
  );
}

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
