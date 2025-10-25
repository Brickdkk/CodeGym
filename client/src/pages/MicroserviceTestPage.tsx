import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Search, Code, Database, Activity, Download, Upload } from "lucide-react";

interface Ejercicio {
  id: string;
  titulo: string;
  descripcion: string;
  lenguaje: string;
  nivel: string;
  categoria: string;
  tags: string[];
  puntos: number;
  fecha_creacion: string;
}

interface Estadisticas {
  total: number;
  porLenguaje: Record<string, number>;
  porNivel: Record<string, number>;
  ultimaActualizacion: string;
}

export default function MicroserviceTestPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroLenguaje, setFiltroLenguaje] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cargarEstadisticas();
    cargarEjercicios();
  }, []);

  const cargarEjercicios = async (filtros = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filtros,
        ...(filtroLenguaje && { lenguaje: filtroLenguaje }),
        ...(filtroNivel && { nivel: filtroNivel }),
        limite: '20'
      });

      const response = await fetch(`/api/microservice/exercises?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setEjercicios(data.ejercicios || []);
      } else {
        throw new Error(data.error || 'Error cargando ejercicios');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error cargando ejercicios: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (response.ok) {
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const buscarEjercicios = async () => {
    if (!busqueda.trim()) {
      cargarEjercicios();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(busqueda)}`);
      const data = await response.json();
      
      if (response.ok) {
        setEjercicios(data.resultados || []);
        toast({
          title: "Búsqueda completada",
          description: `Encontrados ${data.total} ejercicios`
        });
      } else {
        throw new Error(data.error || 'Error en búsqueda');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error en búsqueda: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recargarEjercicios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exercises/reload', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Ejercicios recargados",
          description: "Ejercicios iniciales recargados exitosamente"
        });
        cargarEjercicios();
        cargarEstadisticas();
      } else {
        throw new Error(data.error || 'Error recargando ejercicios');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error recargando: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarDatos = async () => {
    try {
      const response = await fetch('/api/exercises/export');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ejercicios-export.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Exportación exitosa",
          description: "Datos exportados correctamente"
        });
      } else {
        throw new Error('Error exportando datos');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error exportando: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const obtenerEjercicioEspecifico = async () => {
    try {
      const response = await fetch('/api/ejercicio/python/python-hello-world');
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Ejercicio encontrado",
          description: `${data.titulo} - ${data.descripcion.substring(0, 50)}...`
        });
      } else {
        throw new Error(data.error || 'Ejercicio no encontrado');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getNivelColor = (nivel: string) => {
    const colores = {
      'principiante': 'bg-green-500',
      'basico': 'bg-blue-500',
      'intermedio': 'bg-yellow-500',
      'avanzado': 'bg-red-500'
    };
    return colores[nivel] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Ejercicios - Microservicio</h1>
        <p className="text-muted-foreground">
          Panel de pruebas para el microservicio de ejercicios integrado con CodeGym
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="search">Búsqueda</TabsTrigger>
          <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
          <TabsTrigger value="admin">Administración</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Estadísticas del Sistema</span>
              </CardTitle>
              <CardDescription>
                Información en tiempo real del microservicio de ejercicios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {estadisticas ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded">
                      <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
                      <div className="text-sm text-muted-foreground">Total Ejercicios</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(estadisticas.porLenguaje).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Lenguajes</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(estadisticas.porNivel).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Niveles</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Por Lenguaje</h3>
                      <div className="space-y-2">
                        {Object.entries(estadisticas.porLenguaje).map(([lenguaje, count]) => (
                          <div key={lenguaje} className="flex justify-between items-center">
                            <span className="capitalize">{lenguaje}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Por Nivel</h3>
                      <div className="space-y-2">
                        {Object.entries(estadisticas.porNivel).map(([nivel, count]) => (
                          <div key={nivel} className="flex justify-between items-center">
                            <span className="capitalize">{nivel}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Última actualización: {new Date(estadisticas.ultimaActualizacion).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Cargando estadísticas...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Búsqueda de Ejercicios</span>
              </CardTitle>
              <CardDescription>
                Prueba las funcionalidades de búsqueda del microservicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="busqueda">Buscar ejercicios</Label>
                  <Input
                    id="busqueda"
                    placeholder="Ingresa un término de búsqueda..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarEjercicios()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={buscarEjercicios} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="lenguaje">Filtrar por lenguaje</Label>
                  <select
                    id="lenguaje"
                    className="w-full h-10 px-3 border border-input rounded-md"
                    value={filtroLenguaje}
                    onChange={(e) => setFiltroLenguaje(e.target.value)}
                  >
                    <option value="">Todos los lenguajes</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="nivel">Filtrar por nivel</Label>
                  <select
                    id="nivel"
                    className="w-full h-10 px-3 border border-input rounded-md"
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                  >
                    <option value="">Todos los niveles</option>
                    <option value="principiante">Principiante</option>
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => cargarEjercicios()} disabled={loading}>
                    Aplicar Filtros
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={obtenerEjercicioEspecifico} variant="outline">
                  Probar Ejercicio Específico
                </Button>
                <Button onClick={() => cargarEjercicios()} variant="outline">
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Lista de Ejercicios</span>
              </CardTitle>
              <CardDescription>
                Ejercicios disponibles en el microservicio ({ejercicios.length} mostrados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Cargando ejercicios...</div>
                </div>
              ) : ejercicios.length > 0 ? (
                <div className="space-y-4">
                  {ejercicios.map((ejercicio) => (
                    <div key={ejercicio.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{ejercicio.titulo}</h3>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{ejercicio.lenguaje}</Badge>
                          <Badge className={getNivelColor(ejercicio.nivel)}>
                            {ejercicio.nivel}
                          </Badge>
                          <Badge variant="secondary">{ejercicio.puntos} pts</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {ejercicio.descripcion.substring(0, 150)}...
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>ID: {ejercicio.id}</span>
                        <span>Categoría: {ejercicio.categoria}</span>
                        <span>{new Date(ejercicio.fecha_creacion).toLocaleDateString()}</span>
                      </div>
                      {ejercicio.tags && ejercicio.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ejercicio.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No se encontraron ejercicios</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Administración del Sistema</span>
              </CardTitle>
              <CardDescription>
                Herramientas de administración para el microservicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Estas operaciones afectan el sistema de ejercicios en memoria del microservicio.
                  Los cambios no afectan la base de datos principal de CodeGym.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={recargarEjercicios} disabled={loading} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Recargar Ejercicios Iniciales
                </Button>

                <Button onClick={exportarDatos} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Endpoints Disponibles</h3>
                <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
                  <div>GET /api/exercises - Listar ejercicios con filtros</div>
                  <div>GET /api/ejercicio/:lenguaje/:slug - Ejercicio específico</div>
                  <div>GET /api/search/:termino - Búsqueda de texto</div>
                  <div>POST /api/exercises/import/github - Importar desde GitHub</div>
                  <div>GET /api/stats - Estadísticas del sistema</div>
                  <div>GET /api/exercises/export - Exportar datos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}