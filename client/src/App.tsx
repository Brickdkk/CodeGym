import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LanguagePage from "@/pages/LanguagePage";
import ExercisePage from "@/pages/ExercisePage";
import RankingPage from "@/pages/RankingPage";
import ProfilePage from "@/pages/ProfilePage";
import LegalPage from "@/pages/LegalPage";
import AdminImportPage from "@/pages/AdminImportPage";
import MicroserviceTestPage from "@/pages/MicroserviceTestPage";
import { AuthPages } from "@/components/auth/AuthPages"; // Importamos las páginas de autenticación
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeModal from "@/components/WelcomeModal";
import CookieBanner from "@/components/CookieBanner";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/language/:slug" component={LanguagePage} />
          <Route path="/exercise/:slug" component={ExercisePage} />
          <Route path="/rankings" component={RankingPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/admin/import" component={AdminImportPage} />
          <Route path="/admin/microservice" component={MicroserviceTestPage} />
          <Route path="/legal" component={LegalPage} />
          
          {/* Rutas de autenticación */}
          <Route path="/login">{() => <AuthPages />}</Route>
          <Route path="/register">{() => <AuthPages />}</Route>
          
          <Route component={NotFound} />
        </Switch>
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
