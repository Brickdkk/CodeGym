/**
 * Esquemas y validaciones para el sistema de ejercicios
 */

// Esquema base de ejercicio
export const ejercicioSchema = {
  id: { type: 'string', required: true },
  titulo: { type: 'string', required: true },
  descripcion: { type: 'string', required: true },
  lenguaje: { type: 'string', required: true, enum: ['python', 'javascript', 'c', 'cpp', 'csharp'] },
  nivel: { type: 'string', required: true, enum: ['principiante', 'basico', 'intermedio', 'avanzado'] },
  codigo_inicial: { type: 'string', default: '' },
  solucion: { type: 'string', default: '' },
  casos_prueba: { type: 'array', default: [] },
  tags: { type: 'array', default: [] },
  puntos: { type: 'number', default: 10 },
  tiempo_limite: { type: 'number', default: 5000 },
  memoria_limite: { type: 'number', default: 128 },
  categoria: { type: 'string', default: 'general' },
  autor: { type: 'string', default: 'Sistema' },
  fecha_creacion: { type: 'date', default: () => new Date() },
  activo: { type: 'boolean', default: true }
};

// Validador de ejercicios
export function validarEjercicio(ejercicio) {
  const errores = [];
  
  if (!ejercicio.titulo?.trim()) {
    errores.push('El título es obligatorio');
  }
  
  if (!ejercicio.descripcion?.trim()) {
    errores.push('La descripción es obligatoria');
  }
  
  if (!ejercicio.lenguaje || !ejercicioSchema.lenguaje.enum.includes(ejercicio.lenguaje)) {
    errores.push(`Lenguaje debe ser uno de: ${ejercicioSchema.lenguaje.enum.join(', ')}`);
  }
  
  if (!ejercicio.nivel || !ejercicioSchema.nivel.enum.includes(ejercicio.nivel)) {
    errores.push(`Nivel debe ser uno de: ${ejercicioSchema.nivel.enum.join(', ')}`);
  }
  
  return errores;
}

// Transformador de formato GitHub a formato interno
export function transformarDesdeGitHub(ejercicioGitHub) {
  return {
    id: ejercicioGitHub.slug || generarId(ejercicioGitHub.title),
    titulo: ejercicioGitHub.title,
    descripcion: ejercicioGitHub.description,
    lenguaje: mapearLenguaje(ejercicioGitHub.language),
    nivel: mapearDificultad(ejercicioGitHub.difficulty),
    codigo_inicial: ejercicioGitHub.starterCode || '',
    solucion: ejercicioGitHub.solution || '',
    casos_prueba: ejercicioGitHub.testCases || [],
    tags: ejercicioGitHub.tags || [],
    puntos: calcularPuntos(ejercicioGitHub.difficulty),
    tiempo_limite: ejercicioGitHub.timeLimit || 5000,
    memoria_limite: ejercicioGitHub.memoryLimit || 128,
    categoria: determinarCategoria(ejercicioGitHub.tags),
    autor: 'GitHub Import',
    fecha_creacion: new Date(),
    activo: true
  };
}

// Funciones auxiliares
function generarId(titulo) {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function mapearLenguaje(language) {
  const mapa = {
    'python': 'python',
    'javascript': 'javascript',
    'js': 'javascript',
    'c': 'c',
    'cpp': 'cpp',
    'c++': 'cpp',
    'csharp': 'csharp',
    'c#': 'csharp'
  };
  return mapa[language?.toLowerCase()] || 'python';
}

function mapearDificultad(difficulty) {
  const mapa = {
    'beginner': 'principiante',
    'basic': 'basico',
    'intermediate': 'intermedio',
    'advanced': 'avanzado',
    'expert': 'avanzado'
  };
  return mapa[difficulty?.toLowerCase()] || 'principiante';
}

function calcularPuntos(difficulty) {
  const puntos = {
    'principiante': 10,
    'basico': 20,
    'intermedio': 30,
    'avanzado': 50
  };
  return puntos[mapearDificultad(difficulty)] || 10;
}

function determinarCategoria(tags) {
  if (!tags || !Array.isArray(tags)) return 'general';
  
  const categorias = {
    'algoritmos': ['algorithm', 'sorting', 'search', 'dynamic'],
    'matematicas': ['math', 'calculation', 'number', 'factorial'],
    'strings': ['string', 'text', 'character', 'palindrome'],
    'estructuras': ['array', 'list', 'stack', 'queue', 'tree'],
    'basico': ['hello', 'basic', 'simple', 'intro']
  };
  
  for (const [categoria, keywords] of Object.entries(categorias)) {
    if (tags.some(tag => keywords.some(keyword => 
      tag.toLowerCase().includes(keyword)
    ))) {
      return categoria;
    }
  }
  
  return 'general';
}

export const lenguajesDisponibles = [
  { id: 'python', nombre: 'Python', extension: '.py' },
  { id: 'javascript', nombre: 'JavaScript', extension: '.js' },
  { id: 'c', nombre: 'C', extension: '.c' },
  { id: 'cpp', nombre: 'C++', extension: '.cpp' },
  { id: 'csharp', nombre: 'C#', extension: '.cs' }
];

export const nivelesDisponibles = [
  { id: 'principiante', nombre: 'Principiante', orden: 1 },
  { id: 'basico', nombre: 'Básico', orden: 2 },
  { id: 'intermedio', nombre: 'Intermedio', orden: 3 },
  { id: 'avanzado', nombre: 'Avanzado', orden: 4 }
];