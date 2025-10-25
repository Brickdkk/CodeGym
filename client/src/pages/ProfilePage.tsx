import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User, Save, Camera, Crown, Trophy, Target, Calendar } from "lucide-react";
import { getRelativeTime } from "@/lib/timeUtils";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: string;
  isPremium?: boolean;
  country?: string;
}

interface UserStats {
  exercisesSolved: number;
  totalPoints: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteLanguage: string;
}

export default function ProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
    country: ""
  });

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user statistics
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        country: userProfile.country || ""
      });
    }
  }, [userProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await apiRequest("PATCH", "/api/profile", updates);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso requerido</h1>
            <p className="text-muted-foreground mb-4">
              Debes iniciar sesión para ver tu perfil.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar perfil
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: userProfile?.firstName || "",
                            lastName: userProfile?.lastName || "",
                            email: userProfile?.email || "",
                            profileImageUrl: userProfile?.profileImageUrl || "",
                            country: userProfile?.country || ""
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={isEditing ? formData.profileImageUrl : userProfile?.profileImageUrl} 
                      alt="Profile" 
                    />
                    <AvatarFallback className="text-xl">
                      {(isEditing ? formData.firstName : userProfile?.firstName)?.charAt(0)?.toUpperCase() || 
                       (isEditing ? formData.lastName : userProfile?.lastName)?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="profileImage">URL de imagen de perfil</Label>
                      <Input
                        id="profileImage"
                        type="url"
                        value={formData.profileImageUrl}
                        onChange={(e) => handleInputChange("profileImageUrl", e.target.value)}
                        placeholder="https://ejemplo.com/tu-foto.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Puedes usar una URL de imagen desde tu perfil de GitHub, LinkedIn o cualquier servicio de imágenes
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Tu nombre"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{userProfile?.firstName || "Sin especificar"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Tu apellido"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{userProfile?.lastName || "Sin especificar"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="tu@email.com"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{userProfile?.email || "Sin especificar"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="Tu país"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{userProfile?.country || "Sin especificar"}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Información de cuenta</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {getRelativeTime(userProfile?.createdAt || new Date())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Premium Status */}
          <div className="space-y-6">
            {/* Statistics */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {userStats.exercisesSolved || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ejercicios resueltos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {userStats.totalPoints || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Puntos totales
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {userStats.currentStreak || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Racha actual
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {userStats.averageTime || 0}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tiempo promedio
                      </div>
                    </div>
                  </div>
                  
                  {userStats.favoriteLanguage && (
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <Badge variant="secondary">
                          <Target className="h-3 w-3 mr-1" />
                          Lenguaje favorito: {userStats.favoriteLanguage}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}