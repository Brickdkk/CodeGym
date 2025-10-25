import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('codegym-cookies-accepted');
    
    if (!cookiesAccepted) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('codegym-cookies-accepted', 'true');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('codegym-cookies-accepted', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Uso de Cookies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de rendimiento para mejorar tu experiencia. 
                Al continuar navegando, aceptas nuestro uso de cookies según nuestra{" "}
                <Link href="/legal">
                  <span className="text-primary hover:underline cursor-pointer">
                    Política de Privacidad
                  </span>
                </Link>
                .
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={acceptCookies} size="sm">
                  Aceptar todas las cookies
                </Button>
                <Button onClick={declineCookies} variant="outline" size="sm">
                  Solo cookies esenciales
                </Button>
                <Link href="/legal">
                  <Button variant="ghost" size="sm">
                    Más información
                  </Button>
                </Link>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={declineCookies}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}