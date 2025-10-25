/**
 * Sistema de almacenamiento en memoria para ejercicios
 */

export class EjerciciosStorage {
  constructor() {
    this.ejercicios = new Map();
    this.cache = new Map();
    this.estadisticas = {
      total: 0,
      porLenguaje: {},
      porNivel: {},
      ultimaActualizacion: new Date()
    };
  }

  // Operaciones básicas CRUD
  async agregarEjercicio(ejercicio) {
    const id = ejercicio.id || this.generarId(ejercicio.titulo);
    ejercicio.id = id;
    
    this.ejercicios.set(id, { ...ejercicio });
    this.invalidarCache();
    this.actualizarEstadisticas();
    
    console.log(`Ejercicio agregado: ${ejercicio.titulo} (${id})`);
    return ejercicio;
  }

  async obtenerEjercicio(id) {
    return this.ejercicios.get(id) || null;
  }

  async obtenerEjercicioPorSlug(lenguaje, slug) {
    const id = `${lenguaje}-${slug}`;
    return this.ejercicios.get(id) || null;
  }

  async actualizarEjercicio(id, cambios) {
    const ejercicio = this.ejercicios.get(id);
    if (!ejercicio) return null;

    const ejercicioActualizado = { ...ejercicio, ...cambios };
    this.ejercicios.set(id, ejercicioActualizado);
    this.invalidarCache();
    this.actualizarEstadisticas();
    
    return ejercicioActualizado;
  }

  async eliminarEjercicio(id) {
    const eliminado = this.ejercicios.delete(id);
    if (eliminado) {
      this.invalidarCache();
      this.actualizarEstadisticas();
    }
    return eliminado;
  }

  // Operaciones de búsqueda y filtrado
  async buscarEjercicios(filtros = {}) {
    const cacheKey = JSON.stringify(filtros);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let resultados = Array.from(this.ejercicios.values());

    // Filtrar por lenguaje
    if (filtros.lenguaje) {
      resultados = resultados.filter(e => e.lenguaje === filtros.lenguaje);
    }

    // Filtrar por nivel
    if (filtros.nivel) {
      resultados = resultados.filter(e => e.nivel === filtros.nivel);
    }

    // Filtrar por categoría
    if (filtros.categoria) {
      resultados = resultados.filter(e => e.categoria === filtros.categoria);
    }

    // Filtrar por tags
    if (filtros.tags && Array.isArray(filtros.tags)) {
      resultados = resultados.filter(e => 
        filtros.tags.some(tag => e.tags.includes(tag))
      );
    }

    // Búsqueda por texto
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      resultados = resultados.filter(e => 
        e.titulo.toLowerCase().includes(termino) ||
        e.descripcion.toLowerCase().includes(termino) ||
        e.tags.some(tag => tag.toLowerCase().includes(termino))
      );
    }

    // Filtrar solo activos
    if (filtros.activo !== false) {
      resultados = resultados.filter(e => e.activo);
    }

    // Ordenar resultados
    if (filtros.ordenar) {
      resultados = this.ordenarResultados(resultados, filtros.ordenar);
    }

    // Paginación
    if (filtros.limite) {
      const inicio = (filtros.pagina || 0) * filtros.limite;
      resultados = resultados.slice(inicio, inicio + filtros.limite);
    }

    // Cachear resultado
    this.cache.set(cacheKey, resultados);
    
    return resultados;
  }

  async buscarPorTexto(texto) {
    return this.buscarEjercicios({ busqueda: texto });
  }

  async obtenerPorLenguaje(lenguaje) {
    return this.buscarEjercicios({ lenguaje });
  }

  async obtenerPorNivel(nivel) {
    return this.buscarEjercicios({ nivel });
  }

  async obtenerRecomendados(limite = 5) {
    const cacheKey = `recomendados_${limite}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Algoritmo simple de recomendación: ejercicios populares por nivel
    const todos = Array.from(this.ejercicios.values())
      .filter(e => e.activo)
      .sort((a, b) => {
        // Priorizar por nivel (principiante primero) y luego por puntos
        const pesoNivel = { principiante: 4, basico: 3, intermedio: 2, avanzado: 1 };
        return (pesoNivel[a.nivel] || 0) - (pesoNivel[b.nivel] || 0) || b.puntos - a.puntos;
      })
      .slice(0, limite);

    this.cache.set(cacheKey, todos);
    return todos;
  }

  // Operaciones masivas
  async agregarEjerciciosMasivo(ejercicios) {
    const resultados = {
      exitosos: 0,
      fallidos: 0,
      errores: []
    };

    for (const ejercicio of ejercicios) {
      try {
        await this.agregarEjercicio(ejercicio);
        resultados.exitosos++;
      } catch (error) {
        resultados.fallidos++;
        resultados.errores.push({
          ejercicio: ejercicio.titulo || 'Sin título',
          error: error.message
        });
      }
    }

    console.log(`Carga masiva completada: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`);
    return resultados;
  }

  async limpiarEjercicios() {
    this.ejercicios.clear();
    this.invalidarCache();
    this.actualizarEstadisticas();
    console.log('Todos los ejercicios han sido eliminados');
  }

  // Estadísticas y análisis
  async obtenerEstadisticas() {
    return { ...this.estadisticas };
  }

  async obtenerEstadisticasDetalladas() {
    const todos = Array.from(this.ejercicios.values());
    
    return {
      ...this.estadisticas,
      ejerciciosPorCategoria: this.contarPor(todos, 'categoria'),
      ejerciciosPorAutor: this.contarPor(todos, 'autor'),
      promedioCaracteresTitulo: this.promedio(todos.map(e => e.titulo.length)),
      promedioCaracteresDescripcion: this.promedio(todos.map(e => e.descripcion.length)),
      totalTags: new Set(todos.flatMap(e => e.tags)).size,
      ejerciciosMasRecientes: todos
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
        .slice(0, 5)
        .map(e => ({ id: e.id, titulo: e.titulo, fecha: e.fecha_creacion }))
    };
  }

  // Exportar/Importar datos
  async exportarDatos() {
    return {
      ejercicios: Array.from(this.ejercicios.values()),
      estadisticas: this.estadisticas,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  async importarDatos(datos) {
    if (datos.ejercicios && Array.isArray(datos.ejercicios)) {
      this.ejercicios.clear();
      
      for (const ejercicio of datos.ejercicios) {
        this.ejercicios.set(ejercicio.id, ejercicio);
      }
      
      this.invalidarCache();
      this.actualizarEstadisticas();
      
      console.log(`Importados ${datos.ejercicios.length} ejercicios`);
      return { importados: datos.ejercicios.length };
    }
    
    throw new Error('Formato de datos inválido');
  }

  // Métodos privados
  generarId(titulo) {
    return titulo
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }

  invalidarCache() {
    this.cache.clear();
  }

  actualizarEstadisticas() {
    const todos = Array.from(this.ejercicios.values());
    
    this.estadisticas = {
      total: todos.length,
      porLenguaje: this.contarPor(todos, 'lenguaje'),
      porNivel: this.contarPor(todos, 'nivel'),
      ultimaActualizacion: new Date()
    };
  }

  contarPor(array, propiedad) {
    return array.reduce((contador, item) => {
      const valor = item[propiedad];
      contador[valor] = (contador[valor] || 0) + 1;
      return contador;
    }, {});
  }

  promedio(numeros) {
    return numeros.length > 0 ? numeros.reduce((a, b) => a + b, 0) / numeros.length : 0;
  }

  ordenarResultados(resultados, criterio) {
    switch (criterio) {
      case 'titulo':
        return resultados.sort((a, b) => a.titulo.localeCompare(b.titulo));
      case 'nivel':
        const ordenNivel = { principiante: 1, basico: 2, intermedio: 3, avanzado: 4 };
        return resultados.sort((a, b) => ordenNivel[a.nivel] - ordenNivel[b.nivel]);
      case 'puntos':
        return resultados.sort((a, b) => b.puntos - a.puntos);
      case 'fecha':
        return resultados.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
      default:
        return resultados;
    }
  }
}

// Instancia singleton
export const storage = new EjerciciosStorage();