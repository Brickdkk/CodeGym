/**
 * Rutas API para el sistema de ejercicios
 */

import { storage } from './ejercicios-storage.js';
import { autoLoader } from './ejercicios-autoloader.js';
import { validarEjercicio } from './ejercicios-schema.js';

export function configurarRutasEjercicios(app) {
  // Middleware para logging
  const logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  };

  // Aplicar logging a todas las rutas de ejercicios
  app.use('/api/microservice', logRequest);
  app.use('/api/ejercicio', logRequest);
  app.use('/api/search', logRequest);

  // ===== RUTAS PRINCIPALES DE EJERCICIOS =====

  // Obtener todos los ejercicios con filtros
  app.get('/api/microservice/exercises', async (req, res) => {
    try {
      const filtros = {
        lenguaje: req.query.lenguaje || req.query.language,
        nivel: req.query.nivel || req.query.level,
        categoria: req.query.categoria || req.query.category,
        busqueda: req.query.busqueda || req.query.search,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        ordenar: req.query.ordenar || req.query.sort,
        limite: parseInt(req.query.limite || req.query.limit) || undefined,
        pagina: parseInt(req.query.pagina || req.query.page) || 0,
        activo: req.query.activo !== 'false'
      };

      const ejercicios = await storage.buscarEjercicios(filtros);
      const estadisticas = await storage.obtenerEstadisticas();

      res.json({
        ejercicios,
        total: ejercicios.length,
        estadisticas,
        filtros: Object.fromEntries(
          Object.entries(filtros).filter(([_, value]) => value !== undefined)
        )
      });
    } catch (error) {
      console.error('Error obteniendo ejercicios:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Obtener ejercicio específico por lenguaje y slug
  app.get('/api/ejercicio/:lenguaje/:slug', async (req, res) => {
    try {
      const { lenguaje, slug } = req.params;
      const ejercicio = await storage.obtenerEjercicioPorSlug(lenguaje, slug);
      
      if (!ejercicio) {
        return res.status(404).json({ 
          error: 'Ejercicio no encontrado',
          lenguaje,
          slug
        });
      }

      res.json(ejercicio);
    } catch (error) {
      console.error('Error obteniendo ejercicio específico:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Obtener ejercicio por ID
  app.get('/api/microservice/exercises/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const ejercicio = await storage.obtenerEjercicio(id);
      
      if (!ejercicio) {
        return res.status(404).json({ 
          error: 'Ejercicio no encontrado',
          id
        });
      }

      res.json(ejercicio);
    } catch (error) {
      console.error('Error obteniendo ejercicio por ID:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE BÚSQUEDA =====

  // Búsqueda de texto libre
  app.get('/api/search/:termino', async (req, res) => {
    try {
      const { termino } = req.params;
      const limite = parseInt(req.query.limite || req.query.limit) || 20;
      
      const resultados = await storage.buscarPorTexto(termino);
      const limitados = resultados.slice(0, limite);

      res.json({
        termino,
        resultados: limitados,
        total: resultados.length,
        limitados: limitados.length
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      res.status(500).json({ 
        error: 'Error en búsqueda',
        message: error.message 
      });
    }
  });

  // Búsqueda avanzada con POST
  app.post('/api/search', async (req, res) => {
    try {
      const filtros = req.body;
      const ejercicios = await storage.buscarEjercicios(filtros);

      res.json({
        ejercicios,
        total: ejercicios.length,
        filtros
      });
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({ 
        error: 'Error en búsqueda avanzada',
        message: error.message 
      });
    }
  });

  // ===== RUTAS POR CATEGORÍAS =====

  // Ejercicios por lenguaje
  app.get('/api/exercises/language/:lenguaje', async (req, res) => {
    try {
      const { lenguaje } = req.params;
      const limite = parseInt(req.query.limite || req.query.limit) || undefined;
      
      const ejercicios = await storage.obtenerPorLenguaje(lenguaje);
      const resultado = limite ? ejercicios.slice(0, limite) : ejercicios;

      res.json({
        lenguaje,
        ejercicios: resultado,
        total: ejercicios.length
      });
    } catch (error) {
      console.error('Error obteniendo ejercicios por lenguaje:', error);
      res.status(500).json({ 
        error: 'Error obteniendo ejercicios por lenguaje',
        message: error.message 
      });
    }
  });

  // Ejercicios por nivel
  app.get('/api/exercises/level/:nivel', async (req, res) => {
    try {
      const { nivel } = req.params;
      const limite = parseInt(req.query.limite || req.query.limit) || undefined;
      
      const ejercicios = await storage.obtenerPorNivel(nivel);
      const resultado = limite ? ejercicios.slice(0, limite) : ejercicios;

      res.json({
        nivel,
        ejercicios: resultado,
        total: ejercicios.length
      });
    } catch (error) {
      console.error('Error obteniendo ejercicios por nivel:', error);
      res.status(500).json({ 
        error: 'Error obteniendo ejercicios por nivel',
        message: error.message 
      });
    }
  });

  // Ejercicios recomendados
  app.get('/api/exercises/recommended', async (req, res) => {
    try {
      const limite = parseInt(req.query.limite || req.query.limit) || 5;
      const recomendados = await storage.obtenerRecomendados(limite);

      res.json({
        recomendados,
        total: recomendados.length
      });
    } catch (error) {
      console.error('Error obteniendo recomendados:', error);
      res.status(500).json({ 
        error: 'Error obteniendo recomendados',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE ADMINISTRACIÓN =====

  // Crear nuevo ejercicio
  app.post('/api/exercises', async (req, res) => {
    try {
      const ejercicioData = req.body;
      
      // Validar ejercicio
      const errores = validarEjercicio(ejercicioData);
      if (errores.length > 0) {
        return res.status(400).json({
          error: 'Datos del ejercicio inválidos',
          errores
        });
      }

      const ejercicio = await storage.agregarEjercicio(ejercicioData);
      
      res.status(201).json({
        mensaje: 'Ejercicio creado exitosamente',
        ejercicio
      });
    } catch (error) {
      console.error('Error creando ejercicio:', error);
      res.status(500).json({ 
        error: 'Error creando ejercicio',
        message: error.message 
      });
    }
  });

  // Actualizar ejercicio
  app.put('/api/exercises/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const cambios = req.body;
      
      const ejercicio = await storage.actualizarEjercicio(id, cambios);
      
      if (!ejercicio) {
        return res.status(404).json({ 
          error: 'Ejercicio no encontrado',
          id
        });
      }

      res.json({
        mensaje: 'Ejercicio actualizado exitosamente',
        ejercicio
      });
    } catch (error) {
      console.error('Error actualizando ejercicio:', error);
      res.status(500).json({ 
        error: 'Error actualizando ejercicio',
        message: error.message 
      });
    }
  });

  // Eliminar ejercicio
  app.delete('/api/exercises/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await storage.eliminarEjercicio(id);
      
      if (!eliminado) {
        return res.status(404).json({ 
          error: 'Ejercicio no encontrado',
          id
        });
      }

      res.json({
        mensaje: 'Ejercicio eliminado exitosamente',
        id
      });
    } catch (error) {
      console.error('Error eliminando ejercicio:', error);
      res.status(500).json({ 
        error: 'Error eliminando ejercicio',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE IMPORTACIÓN =====

  // Importar ejercicios desde GitHub
  app.post('/api/exercises/import/github', async (req, res) => {
    try {
      const { repoUrl, branch = 'main', path = 'exercises' } = req.body;
      
      if (!repoUrl) {
        return res.status(400).json({
          error: 'URL del repositorio requerida'
        });
      }

      const resultado = await autoLoader.cargarDesdeGitHub({
        url: repoUrl,
        branch,
        path
      });

      res.json({
        mensaje: 'Importación desde GitHub completada',
        resultado
      });
    } catch (error) {
      console.error('Error importando desde GitHub:', error);
      res.status(500).json({ 
        error: 'Error importando desde GitHub',
        message: error.message 
      });
    }
  });

  // Importar desde archivos
  app.post('/api/exercises/import/files', async (req, res) => {
    try {
      const { archivos } = req.body;
      
      if (!archivos || !Array.isArray(archivos)) {
        return res.status(400).json({
          error: 'Array de archivos requerido'
        });
      }

      const resultado = await autoLoader.cargarDesdeArchivos(archivos);

      res.json({
        mensaje: 'Importación de archivos completada',
        resultado
      });
    } catch (error) {
      console.error('Error importando archivos:', error);
      res.status(500).json({ 
        error: 'Error importando archivos',
        message: error.message 
      });
    }
  });

  // Estado de carga
  app.get('/api/exercises/import/status', async (req, res) => {
    try {
      const estado = autoLoader.obtenerEstadoCarga();
      res.json(estado);
    } catch (error) {
      console.error('Error obteniendo estado de carga:', error);
      res.status(500).json({ 
        error: 'Error obteniendo estado',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE ESTADÍSTICAS =====

  // Estadísticas básicas del microservicio
  app.get('/api/microservice/stats', async (req, res) => {
    try {
      const estadisticas = await storage.obtenerEstadisticas();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ 
        error: 'Error obteniendo estadísticas',
        message: error.message 
      });
    }
  });

  // Estadísticas detalladas
  app.get('/api/stats/detailed', async (req, res) => {
    try {
      const estadisticas = await storage.obtenerEstadisticasDetalladas();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error obteniendo estadísticas detalladas:', error);
      res.status(500).json({ 
        error: 'Error obteniendo estadísticas detalladas',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE MANTENIMIENTO =====

  // Exportar todos los datos
  app.get('/api/exercises/export', async (req, res) => {
    try {
      const datos = await storage.exportarDatos();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=ejercicios-export.json');
      res.json(datos);
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({ 
        error: 'Error exportando datos',
        message: error.message 
      });
    }
  });

  // Importar datos
  app.post('/api/exercises/import', async (req, res) => {
    try {
      const datos = req.body;
      const resultado = await storage.importarDatos(datos);
      
      res.json({
        mensaje: 'Datos importados exitosamente',
        resultado
      });
    } catch (error) {
      console.error('Error importando datos:', error);
      res.status(500).json({ 
        error: 'Error importando datos',
        message: error.message 
      });
    }
  });

  // Limpiar todos los ejercicios
  app.delete('/api/exercises/all', async (req, res) => {
    try {
      await storage.limpiarEjercicios();
      
      res.json({
        mensaje: 'Todos los ejercicios han sido eliminados'
      });
    } catch (error) {
      console.error('Error limpiando ejercicios:', error);
      res.status(500).json({ 
        error: 'Error limpiando ejercicios',
        message: error.message 
      });
    }
  });

  // Recargar ejercicios iniciales
  app.post('/api/exercises/reload', async (req, res) => {
    try {
      await storage.limpiarEjercicios();
      await autoLoader.cargarEjerciciosIniciales();
      
      const estadisticas = await storage.obtenerEstadisticas();
      
      res.json({
        mensaje: 'Ejercicios iniciales recargados',
        estadisticas
      });
    } catch (error) {
      console.error('Error recargando ejercicios:', error);
      res.status(500).json({ 
        error: 'Error recargando ejercicios',
        message: error.message 
      });
    }
  });

  // ===== RUTAS ADICIONALES ESPECIFICADAS =====

  // Ejercicios aleatorios
  app.get('/api/exercises/random', async (req, res) => {
    try {
      const cantidad = parseInt(req.query.cantidad) || 5;
      const todosEjercicios = await storage.buscarEjercicios({ activo: true });
      
      // Mezclar y tomar cantidad especificada
      const aleatorios = todosEjercicios
        .sort(() => 0.5 - Math.random())
        .slice(0, cantidad);

      res.json({
        ejercicios: aleatorios,
        cantidad: aleatorios.length,
        total_disponibles: todosEjercicios.length
      });
    } catch (error) {
      console.error('Error obteniendo ejercicios aleatorios:', error);
      res.status(500).json({ 
        error: 'Error obteniendo ejercicios aleatorios',
        message: error.message 
      });
    }
  });

  // Ejercicios por nivel específico
  app.get('/api/exercises/nivel/:nivel', async (req, res) => {
    try {
      const { nivel } = req.params;
      const ejercicios = await storage.obtenerPorNivel(nivel);

      res.json({
        nivel,
        ejercicios,
        total: ejercicios.length
      });
    } catch (error) {
      console.error('Error obteniendo ejercicios por nivel:', error);
      res.status(500).json({ 
        error: 'Error obteniendo ejercicios por nivel',
        message: error.message 
      });
    }
  });

  // Logs de peticiones recientes (simulado)
  app.get('/api/logs', async (req, res) => {
    try {
      // En una implementación real, esto vendría de un sistema de logging
      const logs = [
        { timestamp: new Date(), endpoint: '/api/exercises', method: 'GET', status: 200 },
        { timestamp: new Date(Date.now() - 60000), endpoint: '/api/search/hello', method: 'GET', status: 200 },
        { timestamp: new Date(Date.now() - 120000), endpoint: '/api/ejercicio/python/hello-world', method: 'GET', status: 200 },
        { timestamp: new Date(Date.now() - 180000), endpoint: '/api/stats', method: 'GET', status: 200 }
      ];

      res.json({
        logs: logs.slice(0, parseInt(req.query.limit) || 50),
        total: logs.length
      });
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      res.status(500).json({ 
        error: 'Error obteniendo logs',
        message: error.message 
      });
    }
  });

  // Repositorios configurados
  app.get('/api/repositories', async (req, res) => {
    try {
      const repositorios = [
        {
          nombre: 'ejercicios-python',
          url: 'https://github.com/ejercicios-programacion/python',
          lenguaje: 'python',
          activo: true,
          ejercicios_cargados: 55
        },
        {
          nombre: 'ejercicios-javascript',
          url: 'https://github.com/ejercicios-programacion/javascript',
          lenguaje: 'javascript',
          activo: true,
          ejercicios_cargados: 25
        },
        {
          nombre: 'ejercicios-c',
          url: 'https://github.com/ejercicios-programacion/c',
          lenguaje: 'c',
          activo: true,
          ejercicios_cargados: 20
        },
        {
          nombre: 'ejercicios-cpp',
          url: 'https://github.com/ejercicios-programacion/cpp',
          lenguaje: 'cpp',
          activo: true,
          ejercicios_cargados: 20
        },
        {
          nombre: 'ejercicios-csharp',
          url: 'https://github.com/ejercicios-programacion/csharp',
          lenguaje: 'csharp',
          activo: true,
          ejercicios_cargados: 15
        }
      ];

      res.json({
        repositorios,
        total: repositorios.length,
        activos: repositorios.filter(r => r.activo).length
      });
    } catch (error) {
      console.error('Error obteniendo repositorios:', error);
      res.status(500).json({ 
        error: 'Error obteniendo repositorios',
        message: error.message 
      });
    }
  });

  // Forzar carga masiva
  app.post('/api/exercises/load-massive', async (req, res) => {
    try {
      if (autoLoader.estaCargando()) {
        return res.status(409).json({
          error: 'Carga ya en progreso',
          estado: autoLoader.obtenerEstadoCarga()
        });
      }

      console.log('🚀 Iniciando carga automática de ejercicios masiva...');
      
      // Limpiar ejercicios existentes y cargar nuevos
      await storage.limpiarEjercicios();
      await autoLoader.cargarEjerciciosIniciales();

      const estadisticas = await storage.obtenerEstadisticas();

      res.json({
        mensaje: 'Carga masiva completada exitosamente',
        estadisticas,
        ejercicios_cargados: estadisticas.total
      });
    } catch (error) {
      console.error('Error en carga masiva:', error);
      res.status(500).json({ 
        error: 'Error en carga masiva',
        message: error.message 
      });
    }
  });

  // Refrescar ejercicios existentes
  app.post('/api/exercises/refresh', async (req, res) => {
    try {
      console.log('🔄 Refrescando ejercicios existentes...');
      
      // Obtener ejercicios actuales
      const ejerciciosActuales = await storage.exportarDatos();
      
      // Limpiar y recargar
      await storage.limpiarEjercicios();
      await autoLoader.cargarEjerciciosIniciales();

      const estadisticas = await storage.obtenerEstadisticas();

      res.json({
        mensaje: 'Ejercicios refrescados exitosamente',
        estadisticas_anteriores: ejerciciosActuales.estadisticas,
        estadisticas_nuevas: estadisticas,
        diferencia: estadisticas.total - (ejerciciosActuales.estadisticas?.total || 0)
      });
    } catch (error) {
      console.error('Error refrescando ejercicios:', error);
      res.status(500).json({ 
        error: 'Error refrescando ejercicios',
        message: error.message 
      });
    }
  });

  // ===== RUTAS DE INFORMACIÓN =====

  // Información del sistema
  app.get('/api/exercises/info', async (req, res) => {
    try {
      const estadisticas = await storage.obtenerEstadisticas();
      const estadoCarga = autoLoader.obtenerEstadoCarga();
      
      res.json({
        sistema: 'Sistema de Ejercicios v1.0',
        estadisticas,
        estadoCarga,
        endpoints: {
          ejercicios: '/api/exercises',
          busqueda: '/api/search/:termino',
          especifico: '/api/ejercicio/:lenguaje/:slug',
          estadisticas: '/api/stats',
          importacion: '/api/exercises/import/github',
          aleatorios: '/api/exercises/random',
          por_nivel: '/api/exercises/nivel/:nivel',
          logs: '/api/logs',
          repositorios: '/api/repositories',
          carga_masiva: 'POST /api/exercises/load-massive',
          refrescar: 'POST /api/exercises/refresh'
        }
      });
    } catch (error) {
      console.error('Error obteniendo información del sistema:', error);
      res.status(500).json({ 
        error: 'Error obteniendo información',
        message: error.message 
      });
    }
  });

  console.log('Rutas de ejercicios configuradas exitosamente');
  console.log('Endpoints disponibles:');
  console.log('  GET  /api/exercises - Listar ejercicios con filtros');
  console.log('  GET  /api/ejercicio/:lenguaje/:slug - Ejercicio específico');
  console.log('  GET  /api/search/:termino - Búsqueda de texto');
  console.log('  POST /api/exercises/import/github - Importar desde GitHub');
  console.log('  GET  /api/stats - Estadísticas del sistema');
}

export default configurarRutasEjercicios;