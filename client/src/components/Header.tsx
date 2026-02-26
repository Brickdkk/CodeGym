import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu, User, LogOut, Trophy, Target, ChevronDown } from "lucide-react";
import logoCodegym from "@/assets/logos/logo-codegym.png";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Ejercicios', href: '/' },
    { name: 'Perfil', href: '/profile' },
    { name: 'Rankings', href: '/rankings' },
  ];

  const getUserDisplayName = () => {
    const u = user as any;
    if (u?.firstName || u?.lastName) {
      return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    return u?.email || 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ')
      .map((word: string) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/">
          <img
            src={logoCodegym}
            alt="CodeGym"
            className="h-8 md:h-10 w-auto object-contain cursor-pointer"
          />
        </Link>

        {/* Desktop Navigation — absolutely centered */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <Button 
              variant={location === '/' ? 'default' : 'ghost'} 
              size="sm"
              className="font-medium"
            >
              Ejercicios
            </Button>
          </Link>

          <Link href="/profile">
            <Button 
              variant={location === '/profile' ? 'default' : 'ghost'} 
              size="sm"
              className="font-medium"
            >
              Perfil
            </Button>
          </Link>

          <Link href="/rankings">
            <Button 
              variant={location === '/rankings' ? 'default' : 'ghost'} 
              size="sm"
              className="font-medium"
            >
              Rankings
            </Button>
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              {/* Avatar clickable — redirects to profile */}
              <Link href="/profile">
                <button className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-cyan-500/50 transition-all duration-200 focus:outline-none focus:ring-cyan-500/50">
                  <Avatar className="h-10 w-10 border border-white/10">
                    {(user as any)?.profileImageUrl ? (
                      <AvatarImage 
                        src={(user as any).profileImageUrl} 
                        alt={getUserDisplayName()}
                      />
                    ) : null}
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <span className="text-sm font-medium mr-1 max-w-[120px] truncate">
                      {getUserDisplayName()}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(user as any)?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/rankings">
                    <DropdownMenuItem>
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>Rankings</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <Target className="mr-2 h-4 w-4" />
                      <span>Mi Progreso</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Iniciar Sesion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                  Registrarse
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>
                  <img
                    src={logoCodegym}
                    alt="CodeGym"
                    className="h-8 w-auto object-contain"
                  />
                </SheetTitle>
                <SheetDescription>
                  Plataforma de ejercicios de programacion
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setMobileOpen(false)}
                      >
                        Iniciar Sesion
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button 
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                        onClick={() => setMobileOpen(false)}
                      >
                        Registrarse
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
