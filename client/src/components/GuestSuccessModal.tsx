import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, UserPlus, X, Star, Target, Award } from "lucide-react";

interface GuestSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseTitle: string;
  executionTime?: number;
}

export default function GuestSuccessModal({ 
  isOpen, 
  onClose, 
  exerciseTitle, 
  executionTime 
}: GuestSuccessModalProps) {
  const handleRegister = () => {
    onClose();
    window.location.href = "/api/login";
  };

  const handleContinueAsGuest = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-green-500">¡Felicidades!</DialogTitle>
          <DialogDescription className="text-base">
            Tu código es correcto. Has resuelto "{exerciseTitle}" exitosamente.
            {executionTime && (
              <span className="block mt-2 text-sm text-muted-foreground">
                Tiempo de ejecución: {executionTime}ms
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Star className="h-4 w-4" />
              ¿Por qué registrarte?
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Target className="h-3 w-3 text-primary" />
                Guarda tu progreso y estadísticas
              </li>
              <li className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-primary" />
                Compite en rankings globales
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-3 w-3 text-primary" />
                Gana insignias y logros
              </li>
            </ul>
          </div>
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleRegister}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Registrarse Gratis
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleContinueAsGuest}
          >
            Continuar como Invitado
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            El registro es gratuito y solo toma unos segundos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}