import { Link } from "wouter";
import { Code, Github, Twitter, Linkedin, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold font-mono">CodeGym</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              La plataforma líder para entrenar habilidades de programación a través de ejercicios interactivos 
              y competencias globales.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Ejercicios
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Rankings
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Insignias
                </span>
              </li>
              <li>
                <Link href="/profile">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Mi Perfil
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:e.tillemanne@gmail.com?subject=Consulta CodeGym&body=Hola, tengo una consulta sobre CodeGym:"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Contacto
                </a>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Comunidad
                </span>
              </li>
              <li>
                <Link href="/legal">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Política de Privacidad & Cookies
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="text-muted-foreground mb-4 sm:mb-0">
            © 2025 CodeGym. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              aria-label="Discord"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
