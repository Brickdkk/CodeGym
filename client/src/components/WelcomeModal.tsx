import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Rocket, UserPlus, LogIn, Users } from "lucide-react";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Show modal for first-time visitors who are not authenticated
    if (!isLoading && !isAuthenticated) {
      // Check if user has seen the welcome modal before
      const hasSeenWelcome = localStorage.getItem('codegym-welcome-seen');
      
      if (!hasSeenWelcome) {
        // Delay showing modal slightly for better UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('codegym-welcome-seen', 'true');
  };

  const handleLogin = () => {
    handleClose();
    window.location.href = "/api/login";
  };

  const handleContinueAsGuest = () => {
    handleClose();
    // User can continue browsing as guest
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl">¡Bienvenido a CodeGym!</DialogTitle>
          <DialogDescription className="text-base">
            ¿Cómo te gustaría comenzar tu journey de programación?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleLogin}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Crear Cuenta / Iniciar Sesión
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleContinueAsGuest}
          >
            <Users className="mr-2 h-5 w-5" />
            Continuar como Invitado
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Los usuarios invitados pueden resolver ejercicios, pero su progreso no se guardará.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
