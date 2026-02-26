import type { SeedExercise } from './types.js';

export const htmlExercises: SeedExercise[] = [
  // =============================================
  // BEGINNER EXERCISES (5) — 10 points each
  // =============================================

  {
    title: 'Mi primera pagina',
    slug: 'html-mi-primera-pagina',
    description:
      'Crea tu primera pagina web con un titulo principal (h1) que diga "Bienvenido" y un parrafo (p) que diga "Mi primera pagina web". Este es el primer paso para aprender HTML.',
    difficulty: 'beginner',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi primera pagina</title>
</head>
<body>
  <!-- TODO: Agrega un encabezado h1 con el texto "Bienvenido" -->

  <!-- TODO: Agrega un parrafo p con el texto "Mi primera pagina web" -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi primera pagina</title>
</head>
<body>
  <h1>Bienvenido</h1>
  <p>Mi primera pagina web</p>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Bienvenido\nMi primera pagina web',
      },
    ],
    tags: ['html', 'estructura', 'basico', 'h1', 'p'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  {
    title: 'Lista de compras',
    slug: 'html-lista-de-compras',
    description:
      'Crea una pagina con un encabezado h2 que diga "Lista de Compras" y una lista desordenada (ul) con tres elementos: Manzanas, Pan y Leche.',
    difficulty: 'beginner',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de compras</title>
</head>
<body>
  <!-- TODO: Agrega un encabezado h2 con el texto "Lista de Compras" -->

  <!-- TODO: Agrega una lista desordenada (ul) con tres elementos (li):
       - Manzanas
       - Pan
       - Leche
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de compras</title>
</head>
<body>
  <h2>Lista de Compras</h2>
  <ul>
    <li>Manzanas</li>
    <li>Pan</li>
    <li>Leche</li>
  </ul>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Lista de Compras\nManzanas\nPan\nLeche',
      },
    ],
    tags: ['html', 'listas', 'ul', 'li', 'basico'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  {
    title: 'Enlace web',
    slug: 'html-enlace-web',
    description:
      'Crea un parrafo que contenga un enlace (etiqueta a) con el texto "Visita Google" que apunte a https://www.google.com. Aprende a crear hipervinculos en HTML.',
    difficulty: 'beginner',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Enlace web</title>
</head>
<body>
  <!-- TODO: Crea un parrafo (p) que contenga un enlace (a) con:
       - href="https://www.google.com"
       - texto del enlace: "Visita Google"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Enlace web</title>
</head>
<body>
  <p><a href="https://www.google.com">Visita Google</a></p>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Visita Google',
      },
    ],
    tags: ['html', 'enlaces', 'a', 'href', 'basico'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  {
    title: 'Imagen y texto',
    slug: 'html-imagen-y-texto',
    description:
      'Crea una pagina con un encabezado h1 "Mi Galeria" y un parrafo que diga "Una imagen vale mas que mil palabras". Aprende a combinar elementos de texto en HTML.',
    difficulty: 'beginner',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Imagen y texto</title>
</head>
<body>
  <!-- TODO: Agrega un encabezado h1 con el texto "Mi Galeria" -->

  <!-- TODO: Agrega un parrafo p con el texto "Una imagen vale mas que mil palabras" -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Imagen y texto</title>
</head>
<body>
  <h1>Mi Galeria</h1>
  <p>Una imagen vale mas que mil palabras</p>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Mi Galeria\nUna imagen vale mas que mil palabras',
      },
    ],
    tags: ['html', 'texto', 'h1', 'p', 'basico'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  {
    title: 'Datos personales',
    slug: 'html-datos-personales',
    description:
      'Crea una tabla HTML con los encabezados Nombre, Edad y Ciudad, y una fila de datos con: Ana, 25, Madrid. Aprende a estructurar datos tabulares.',
    difficulty: 'beginner',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Datos personales</title>
</head>
<body>
  <!-- TODO: Crea una tabla (table) con:
       - Una fila de encabezados (th): Nombre, Edad, Ciudad
       - Una fila de datos (td): Ana, 25, Madrid
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Datos personales</title>
</head>
<body>
  <table>
    <tr>
      <th>Nombre</th>
      <th>Edad</th>
      <th>Ciudad</th>
    </tr>
    <tr>
      <td>Ana</td>
      <td>25</td>
      <td>Madrid</td>
    </tr>
  </table>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Nombre\tEdad\tCiudad\nAna\t25\tMadrid',
      },
    ],
    tags: ['html', 'tablas', 'table', 'tr', 'td', 'th'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 10,
    isActive: true,
  },

  // =============================================
  // BASIC EXERCISES (5) — 15 points each
  // =============================================

  {
    title: 'Formulario de contacto',
    slug: 'html-formulario-contacto',
    description:
      'Crea un formulario de contacto con tres campos etiquetados: "Nombre:", "Email:" y "Mensaje:", junto con un boton de envio que diga "Enviar". Aprende a crear formularios en HTML.',
    difficulty: 'basic',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario de contacto</title>
</head>
<body>
  <!-- TODO: Crea un formulario (form) con:
       - Un label "Nombre:" seguido de un input de texto
       - Un label "Email:" seguido de un input de email
       - Un label "Mensaje:" seguido de un textarea
       - Un boton de envio (button) con texto "Enviar"
       Usa etiquetas <br> o <div> para separar los campos
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario de contacto</title>
</head>
<body>
  <form>
    <div>
      <label>Nombre:</label>
      <input type="text">
    </div>
    <div>
      <label>Email:</label>
      <input type="email">
    </div>
    <div>
      <label>Mensaje:</label>
      <textarea></textarea>
    </div>
    <button type="submit">Enviar</button>
  </form>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Nombre:\nEmail:\nMensaje:\nEnviar',
      },
    ],
    tags: ['html', 'formularios', 'form', 'input', 'label', 'button'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  {
    title: 'Navegacion',
    slug: 'html-navegacion',
    description:
      'Crea una barra de navegacion (nav) con tres enlaces: Inicio, Acerca de y Contacto. Aprende a crear menus de navegacion con HTML.',
    difficulty: 'basic',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Navegacion</title>
</head>
<body>
  <!-- TODO: Crea un elemento nav con tres enlaces (a):
       - "Inicio" que apunte a "#inicio"
       - "Acerca de" que apunte a "#acerca"
       - "Contacto" que apunte a "#contacto"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Navegacion</title>
</head>
<body>
  <nav>
    <a href="#inicio">Inicio</a>
    <a href="#acerca">Acerca de</a>
    <a href="#contacto">Contacto</a>
  </nav>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Inicio Acerca de Contacto',
      },
    ],
    tags: ['html', 'navegacion', 'nav', 'enlaces', 'menu'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  {
    title: 'Tarjeta de perfil',
    slug: 'html-tarjeta-perfil',
    description:
      'Crea una tarjeta de perfil usando un div con clase "card" que contenga: un h2 con "Juan Perez", un parrafo con "Desarrollador Web" y otro parrafo con "Madrid, Espana". Aplica estilos CSS basicos.',
    difficulty: 'basic',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tarjeta de perfil</title>
  <style>
    /* TODO: Agrega estilos CSS para la tarjeta:
       - .card: borde, padding, border-radius, sombra
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un div con clase "card" que contenga:
       - h2 con "Juan Perez"
       - p con "Desarrollador Web"
       - p con "Madrid, Espana"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tarjeta de perfil</title>
  <style>
    .card {
      border: 1px solid #ccc;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 300px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Juan Perez</h2>
    <p>Desarrollador Web</p>
    <p>Madrid, Espana</p>
  </div>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Juan Perez\nDesarrollador Web\nMadrid, Espana',
      },
    ],
    tags: ['html', 'css', 'div', 'clases', 'tarjeta', 'estilos'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  {
    title: 'Lista ordenada',
    slug: 'html-lista-ordenada',
    description:
      'Crea una pagina con un encabezado h2 "Pasos para cocinar" y una lista ordenada (ol) con tres pasos: Preparar ingredientes, Cocinar y Servir.',
    difficulty: 'basic',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista ordenada</title>
</head>
<body>
  <!-- TODO: Agrega un encabezado h2 con "Pasos para cocinar" -->

  <!-- TODO: Agrega una lista ordenada (ol) con tres elementos (li):
       1. Preparar ingredientes
       2. Cocinar
       3. Servir
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista ordenada</title>
</head>
<body>
  <h2>Pasos para cocinar</h2>
  <ol>
    <li>Preparar ingredientes</li>
    <li>Cocinar</li>
    <li>Servir</li>
  </ol>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: 'Pasos para cocinar\nPreparar ingredientes\nCocinar\nServir',
      },
    ],
    tags: ['html', 'listas', 'ol', 'li', 'ordenada'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  {
    title: 'Pie de pagina',
    slug: 'html-pie-de-pagina',
    description:
      'Crea un pie de pagina (footer) con el texto "© 2024 CodeGym. Todos los derechos reservados." Aprende a usar el elemento semantico footer.',
    difficulty: 'basic',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pie de pagina</title>
  <style>
    /* TODO: Agrega estilos CSS para el footer:
       - color de fondo, texto centrado, padding
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un elemento footer con un parrafo que contenga:
       "© 2024 CodeGym. Todos los derechos reservados."
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pie de pagina</title>
  <style>
    footer {
      background-color: #333;
      color: white;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <footer>
    <p>\u00a9 2024 CodeGym. Todos los derechos reservados.</p>
  </footer>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected: '\u00a9 2024 CodeGym. Todos los derechos reservados.',
      },
    ],
    tags: ['html', 'css', 'footer', 'semantico', 'estilos'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 15,
    isActive: true,
  },

  // =============================================
  // INTERMEDIATE EXERCISES (5) — 25 points each
  // =============================================

  {
    title: 'Tabla de horarios',
    slug: 'html-tabla-horarios',
    description:
      'Crea una tabla de horarios con encabezados Hora, Lunes y Martes, y dos filas de datos: "08:00, Matematicas, Historia" y "09:00, Ciencias, Ingles". Practica tablas HTML con estilos CSS.',
    difficulty: 'intermediate',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tabla de horarios</title>
  <style>
    /* TODO: Agrega estilos CSS para la tabla:
       - bordes, padding en celdas, color de encabezados
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un h2 con "Horario de Clases" -->

  <!-- TODO: Crea una tabla con:
       - Encabezados: Hora, Lunes, Martes
       - Fila 1: 08:00, Matematicas, Historia
       - Fila 2: 09:00, Ciencias, Ingles
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tabla de horarios</title>
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: center;
    }
    th {
      background-color: #4a90d9;
      color: white;
    }
  </style>
</head>
<body>
  <h2>Horario de Clases</h2>
  <table>
    <tr>
      <th>Hora</th>
      <th>Lunes</th>
      <th>Martes</th>
    </tr>
    <tr>
      <td>08:00</td>
      <td>Matematicas</td>
      <td>Historia</td>
    </tr>
    <tr>
      <td>09:00</td>
      <td>Ciencias</td>
      <td>Ingles</td>
    </tr>
  </table>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Horario de Clases\nHora\tLunes\tMartes\n08:00\tMatematicas\tHistoria\n09:00\tCiencias\tIngles',
      },
    ],
    tags: ['html', 'css', 'tablas', 'table', 'estilos', 'horarios'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  {
    title: 'Articulo de blog',
    slug: 'html-articulo-blog',
    description:
      'Crea un articulo de blog usando la etiqueta article con un titulo h1, un subtitulo h2, dos parrafos de contenido y la informacion del autor. Usa elementos semanticos de HTML5.',
    difficulty: 'intermediate',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Articulo de blog</title>
  <style>
    /* TODO: Agrega estilos CSS para el articulo:
       - fuente, margenes, colores para encabezados
       - estilo para la informacion del autor
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un article con:
       - h1: "Aprendiendo HTML5"
       - h2: "Una guia para principiantes"
       - p: "HTML5 es la ultima version del lenguaje de marcado para la web."
       - p: "Con HTML5 puedes crear paginas web modernas y accesibles."
       - footer dentro del article con p: "Escrito por Maria Lopez"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Articulo de blog</title>
  <style>
    article {
      max-width: 700px;
      margin: 0 auto;
      font-family: Georgia, serif;
      line-height: 1.6;
    }
    h1 { color: #2c3e50; }
    h2 { color: #7f8c8d; font-weight: normal; }
    article footer { border-top: 1px solid #ccc; padding-top: 10px; color: #666; }
  </style>
</head>
<body>
  <article>
    <h1>Aprendiendo HTML5</h1>
    <h2>Una guia para principiantes</h2>
    <p>HTML5 es la ultima version del lenguaje de marcado para la web.</p>
    <p>Con HTML5 puedes crear paginas web modernas y accesibles.</p>
    <footer>
      <p>Escrito por Maria Lopez</p>
    </footer>
  </article>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Aprendiendo HTML5\nUna guia para principiantes\nHTML5 es la ultima version del lenguaje de marcado para la web.\nCon HTML5 puedes crear paginas web modernas y accesibles.\nEscrito por Maria Lopez',
      },
    ],
    tags: ['html', 'css', 'article', 'semantico', 'blog', 'estructura'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  {
    title: 'Lista de definiciones',
    slug: 'html-lista-definiciones',
    description:
      'Crea una lista de definiciones (dl) con los terminos HTML, CSS y JavaScript, cada uno con su definicion correspondiente. Aprende a usar las etiquetas dl, dt y dd.',
    difficulty: 'intermediate',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de definiciones</title>
  <style>
    /* TODO: Agrega estilos CSS:
       - Estilo para dt (negrita)
       - Estilo para dd (margen, color)
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un h2 con "Glosario Web" -->

  <!-- TODO: Crea una lista de definiciones (dl) con:
       - dt: "HTML" / dd: "Lenguaje de marcado para crear paginas web"
       - dt: "CSS" / dd: "Lenguaje de estilos para disenar paginas web"
       - dt: "JavaScript" / dd: "Lenguaje de programacion para la web"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de definiciones</title>
  <style>
    dt {
      font-weight: bold;
      color: #2c3e50;
      margin-top: 10px;
    }
    dd {
      margin-left: 20px;
      color: #555;
    }
  </style>
</head>
<body>
  <h2>Glosario Web</h2>
  <dl>
    <dt>HTML</dt>
    <dd>Lenguaje de marcado para crear paginas web</dd>
    <dt>CSS</dt>
    <dd>Lenguaje de estilos para disenar paginas web</dd>
    <dt>JavaScript</dt>
    <dd>Lenguaje de programacion para la web</dd>
  </dl>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Glosario Web\nHTML\nLenguaje de marcado para crear paginas web\nCSS\nLenguaje de estilos para disenar paginas web\nJavaScript\nLenguaje de programacion para la web',
      },
    ],
    tags: ['html', 'css', 'dl', 'dt', 'dd', 'definiciones', 'glosario'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  {
    title: 'Seccion con aside',
    slug: 'html-seccion-con-aside',
    description:
      'Crea una pagina con una seccion principal (main) que contenga un articulo, y un aside con enlaces relacionados. Practica el uso de elementos semanticos HTML5 y layout CSS.',
    difficulty: 'intermediate',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Seccion con aside</title>
  <style>
    /* TODO: Agrega estilos CSS para el layout:
       - main y aside lado a lado (flexbox o float)
       - estilos para el aside (fondo, borde)
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un div contenedor con:
       - main con:
         - h1: "Contenido Principal"
         - p: "Este es el articulo principal de la pagina."
       - aside con:
         - h3: "Enlaces Relacionados"
         - ul con tres li que contengan enlaces:
           - "Tutorial HTML" (#)
           - "Tutorial CSS" (#)
           - "Tutorial JS" (#)
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Seccion con aside</title>
  <style>
    .container {
      display: flex;
      gap: 20px;
    }
    main {
      flex: 2;
    }
    aside {
      flex: 1;
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <main>
      <h1>Contenido Principal</h1>
      <p>Este es el articulo principal de la pagina.</p>
    </main>
    <aside>
      <h3>Enlaces Relacionados</h3>
      <ul>
        <li><a href="#">Tutorial HTML</a></li>
        <li><a href="#">Tutorial CSS</a></li>
        <li><a href="#">Tutorial JS</a></li>
      </ul>
    </aside>
  </div>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Contenido Principal\nEste es el articulo principal de la pagina.\nEnlaces Relacionados\nTutorial HTML\nTutorial CSS\nTutorial JS',
      },
    ],
    tags: ['html', 'css', 'main', 'aside', 'semantico', 'layout', 'flexbox'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  {
    title: 'Formulario de registro',
    slug: 'html-formulario-registro',
    description:
      'Crea un formulario de registro completo con campos para nombre, email, contrasena y un boton de registro. Incluye etiquetas descriptivas y estructura adecuada.',
    difficulty: 'intermediate',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario de registro</title>
  <style>
    /* TODO: Agrega estilos CSS para el formulario:
       - Ancho maximo, centrado
       - Estilos para inputs y boton
       - Espaciado entre campos
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un h2 con "Crear Cuenta" -->

  <!-- TODO: Crea un formulario (form) con:
       - div con label "Nombre completo:" e input text
       - div con label "Correo electronico:" e input email
       - div con label "Contrasena:" e input password
       - div con label "Confirmar contrasena:" e input password
       - button con texto "Registrarse"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario de registro</title>
  <style>
    form {
      max-width: 400px;
      margin: 0 auto;
    }
    .campo {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background-color: #3498db;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h2>Crear Cuenta</h2>
  <form>
    <div class="campo">
      <label>Nombre completo:</label>
      <input type="text">
    </div>
    <div class="campo">
      <label>Correo electronico:</label>
      <input type="email">
    </div>
    <div class="campo">
      <label>Contrasena:</label>
      <input type="password">
    </div>
    <div class="campo">
      <label>Confirmar contrasena:</label>
      <input type="password">
    </div>
    <button type="submit">Registrarse</button>
  </form>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Crear Cuenta\nNombre completo:\nCorreo electronico:\nContrasena:\nConfirmar contrasena:\nRegistrarse',
      },
    ],
    tags: ['html', 'css', 'formulario', 'registro', 'form', 'input', 'label'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 25,
    isActive: true,
  },

  // =============================================
  // ADVANCED EXERCISES (5) — 40 points each
  // =============================================

  {
    title: 'Pagina completa',
    slug: 'html-pagina-completa',
    description:
      'Crea una pagina web completa con estructura semantica: header con titulo y navegacion, main con seccion de bienvenida y seccion de servicios, y footer. Demuestra dominio de HTML5 semantico y CSS.',
    difficulty: 'advanced',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pagina completa</title>
  <style>
    /* TODO: Agrega estilos CSS completos:
       - Reset basico
       - Estilos para header, nav, main, footer
       - Layout responsive
       - Colores y tipografia
    */
  </style>
</head>
<body>
  <!-- TODO: Crea la estructura completa:
       - header con:
         - h1: "CodeGym Academy"
         - nav con enlaces: Inicio, Cursos, Contacto
       - main con:
         - section con h2 "Bienvenido" y p "Aprende a programar desde cero"
         - section con h2 "Nuestros Cursos" y ul con: HTML y CSS, JavaScript, Python
       - footer con p: "© 2024 CodeGym Academy"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pagina completa</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    header { background-color: #2c3e50; color: white; padding: 20px; }
    header h1 { margin-bottom: 10px; }
    nav a { color: #ecf0f1; text-decoration: none; margin-right: 15px; }
    main { padding: 20px; }
    section { margin-bottom: 20px; }
    footer { background-color: #2c3e50; color: white; text-align: center; padding: 15px; }
  </style>
</head>
<body>
  <header>
    <h1>CodeGym Academy</h1>
    <nav>
      <a href="#inicio">Inicio</a>
      <a href="#cursos">Cursos</a>
      <a href="#contacto">Contacto</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>Bienvenido</h2>
      <p>Aprende a programar desde cero</p>
    </section>
    <section>
      <h2>Nuestros Cursos</h2>
      <ul>
        <li>HTML y CSS</li>
        <li>JavaScript</li>
        <li>Python</li>
      </ul>
    </section>
  </main>
  <footer>
    <p>\u00a9 2024 CodeGym Academy</p>
  </footer>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'CodeGym Academy\nInicio Cursos Contacto\nBienvenido\nAprende a programar desde cero\nNuestros Cursos\nHTML y CSS\nJavaScript\nPython\n\u00a9 2024 CodeGym Academy',
      },
    ],
    tags: [
      'html',
      'css',
      'semantico',
      'header',
      'nav',
      'main',
      'footer',
      'estructura',
      'completa',
    ],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },

  {
    title: 'Menu dropdown',
    slug: 'html-menu-dropdown',
    description:
      'Crea un menu de navegacion con submenus desplegables usando listas anidadas. El menu principal tiene: Inicio, Servicios (con submenus Diseno Web, Desarrollo, Marketing) y Contacto.',
    difficulty: 'advanced',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Menu dropdown</title>
  <style>
    /* TODO: Agrega estilos CSS para el menu:
       - Lista horizontal para el menu principal
       - Submenus ocultos que aparecen al hacer hover
       - Colores, padding, transiciones
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un h1 con "Mi Sitio Web" -->

  <!-- TODO: Crea un nav con una lista (ul) anidada:
       - li: enlace "Inicio"
       - li: enlace "Servicios" con ul anidado:
         - li: enlace "Diseno Web"
         - li: enlace "Desarrollo"
         - li: enlace "Marketing"
       - li: enlace "Contacto"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Menu dropdown</title>
  <style>
    nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: #333;
      display: flex;
    }
    nav ul li {
      position: relative;
    }
    nav ul li a {
      display: block;
      padding: 12px 20px;
      color: white;
      text-decoration: none;
    }
    nav ul li a:hover {
      background-color: #555;
    }
    nav ul ul {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      flex-direction: column;
      min-width: 160px;
    }
    nav ul li:hover > ul {
      display: flex;
    }
  </style>
</head>
<body>
  <h1>Mi Sitio Web</h1>
  <nav>
    <ul>
      <li><a href="#">Inicio</a></li>
      <li>
        <a href="#">Servicios</a>
        <ul>
          <li><a href="#">Diseno Web</a></li>
          <li><a href="#">Desarrollo</a></li>
          <li><a href="#">Marketing</a></li>
        </ul>
      </li>
      <li><a href="#">Contacto</a></li>
    </ul>
  </nav>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Mi Sitio Web\nInicio\nServicios\nDiseno Web\nDesarrollo\nMarketing\nContacto',
      },
    ],
    tags: ['html', 'css', 'nav', 'dropdown', 'menu', 'listas-anidadas', 'hover'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },

  {
    title: 'Dashboard de estadisticas',
    slug: 'html-dashboard-estadisticas',
    description:
      'Crea un dashboard de estadisticas con un encabezado, tarjetas de metricas (Usuarios, Ventas, Ingresos, Visitas) y una tabla de datos recientes. Aplica CSS avanzado con grid o flexbox.',
    difficulty: 'advanced',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <style>
    /* TODO: Agrega estilos CSS avanzados:
       - Layout con CSS Grid para las tarjetas
       - Estilos para cada tarjeta de estadistica
       - Estilos para la tabla
       - Colores y tipografia profesional
    */
  </style>
</head>
<body>
  <!-- TODO: Crea la estructura del dashboard:
       - header con h1: "Panel de Control"
       - section con clase "stats" con 4 divs de tarjeta, cada uno con:
         - h3 con el nombre de la metrica
         - p con el valor
       - section con h2: "Actividad Reciente" y una tabla con:
         - Encabezados: Fecha, Evento, Estado
         - 2 filas de datos
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; }
    header { background: #1a1a2e; color: white; padding: 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 20px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h3 { color: #666; font-size: 14px; }
    .stat-card p { font-size: 24px; font-weight: bold; color: #1a1a2e; }
    .activity { padding: 20px; }
    table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: bold; }
  </style>
</head>
<body>
  <header>
    <h1>Panel de Control</h1>
  </header>
  <section class="stats">
    <div class="stat-card">
      <h3>Usuarios</h3>
      <p>1,250</p>
    </div>
    <div class="stat-card">
      <h3>Ventas</h3>
      <p>340</p>
    </div>
    <div class="stat-card">
      <h3>Ingresos</h3>
      <p>$12,500</p>
    </div>
    <div class="stat-card">
      <h3>Visitas</h3>
      <p>8,900</p>
    </div>
  </section>
  <section class="activity">
    <h2>Actividad Reciente</h2>
    <table>
      <tr>
        <th>Fecha</th>
        <th>Evento</th>
        <th>Estado</th>
      </tr>
      <tr>
        <td>2024-01-15</td>
        <td>Nuevo usuario registrado</td>
        <td>Completado</td>
      </tr>
      <tr>
        <td>2024-01-14</td>
        <td>Venta procesada</td>
        <td>Pendiente</td>
      </tr>
    </table>
  </section>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Panel de Control\nUsuarios\n1,250\nVentas\n340\nIngresos\n$12,500\nVisitas\n8,900\nActividad Reciente\nFecha\tEvento\tEstado\n2024-01-15\tNuevo usuario registrado\tCompletado\n2024-01-14\tVenta procesada\tPendiente',
      },
    ],
    tags: ['html', 'css', 'dashboard', 'grid', 'tablas', 'tarjetas', 'layout'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },

  {
    title: 'Tabla con resumen',
    slug: 'html-tabla-resumen',
    description:
      'Crea una tabla compleja de productos con thead, tbody y tfoot. Incluye encabezados, filas de datos de productos con precio y cantidad, y un pie de tabla con el total. Aplica estilos CSS avanzados.',
    difficulty: 'advanced',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tabla con resumen</title>
  <style>
    /* TODO: Agrega estilos CSS avanzados para la tabla:
       - Estilos diferenciados para thead, tbody, tfoot
       - Filas alternadas con colores
       - Bordes y padding
    */
  </style>
</head>
<body>
  <!-- TODO: Crea un h2 con "Inventario de Productos" -->

  <!-- TODO: Crea una tabla con:
       - thead: Producto, Precio, Cantidad, Subtotal
       - tbody con 3 filas:
         - Laptop, $800, 5, $4,000
         - Monitor, $300, 10, $3,000
         - Teclado, $50, 20, $1,000
       - tfoot: Total, (vacio), (vacio), $8,000
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tabla con resumen</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h2 { color: #2c3e50; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background-color: #2c3e50; color: white; padding: 12px; text-align: left; }
    tbody td { padding: 10px; border-bottom: 1px solid #ddd; }
    tbody tr:nth-child(even) { background-color: #f2f2f2; }
    tfoot td { padding: 12px; font-weight: bold; background-color: #ecf0f1; border-top: 2px solid #2c3e50; }
  </style>
</head>
<body>
  <h2>Inventario de Productos</h2>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Precio</th>
        <th>Cantidad</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Laptop</td>
        <td>$800</td>
        <td>5</td>
        <td>$4,000</td>
      </tr>
      <tr>
        <td>Monitor</td>
        <td>$300</td>
        <td>10</td>
        <td>$3,000</td>
      </tr>
      <tr>
        <td>Teclado</td>
        <td>$50</td>
        <td>20</td>
        <td>$1,000</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td></td>
        <td></td>
        <td>$8,000</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Inventario de Productos\nProducto\tPrecio\tCantidad\tSubtotal\nLaptop\t$800\t5\t$4,000\nMonitor\t$300\t10\t$3,000\nTeclado\t$50\t20\t$1,000\nTotal\t\t\t$8,000',
      },
    ],
    tags: ['html', 'css', 'tabla', 'thead', 'tbody', 'tfoot', 'inventario'],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },

  {
    title: 'Portfolio personal',
    slug: 'html-portfolio-personal',
    description:
      'Crea una pagina de portfolio personal completa con: header con nombre y navegacion, seccion de presentacion, seccion de proyectos con tarjetas, y un formulario de contacto en el footer. Demuestra dominio completo de HTML5 y CSS.',
    difficulty: 'advanced',
    languageSlug: 'html-css',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portfolio personal</title>
  <style>
    /* TODO: Agrega estilos CSS completos y profesionales:
       - Layout responsive con flexbox/grid
       - Header con navegacion estilizada
       - Tarjetas de proyectos con sombras
       - Formulario de contacto estilizado
       - Footer con fondo oscuro
       - Tipografia y colores profesionales
    */
  </style>
</head>
<body>
  <!-- TODO: Crea la estructura completa del portfolio:
       - header con h1 "Carlos Garcia" y nav con: Inicio, Proyectos, Contacto
       - section "sobre-mi" con:
         - h2: "Sobre Mi"
         - p: "Soy un desarrollador web apasionado por crear soluciones digitales."
       - section "proyectos" con:
         - h2: "Mis Proyectos"
         - 3 divs de tarjeta con h3 y p:
           1. h3: "Tienda Online" / p: "E-commerce con carrito de compras"
           2. h3: "Blog Personal" / p: "Plataforma de publicacion de articulos"
           3. h3: "App del Clima" / p: "Aplicacion de pronostico del tiempo"
       - footer con:
         - h2: "Contacto"
         - form con label "Nombre:", label "Email:", label "Mensaje:", button "Enviar Mensaje"
         - p: "© 2024 Carlos Garcia"
  -->

</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portfolio personal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    header { background: #1a1a2e; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    nav a { color: #eee; text-decoration: none; margin-left: 20px; }
    section { padding: 40px 20px; max-width: 960px; margin: 0 auto; }
    .proyectos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
    .proyecto-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    footer { background: #1a1a2e; color: white; padding: 40px 20px; text-align: center; }
    footer form { max-width: 400px; margin: 20px auto; }
    footer label { display: block; margin-top: 10px; text-align: left; }
    footer input, footer textarea { width: 100%; padding: 8px; margin-top: 5px; border: none; border-radius: 4px; }
    footer button { margin-top: 15px; padding: 10px 30px; background: #e94560; color: white; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <h1>Carlos Garcia</h1>
    <nav>
      <a href="#inicio">Inicio</a>
      <a href="#proyectos">Proyectos</a>
      <a href="#contacto">Contacto</a>
    </nav>
  </header>
  <section id="sobre-mi">
    <h2>Sobre Mi</h2>
    <p>Soy un desarrollador web apasionado por crear soluciones digitales.</p>
  </section>
  <section id="proyectos">
    <h2>Mis Proyectos</h2>
    <div class="proyectos-grid">
      <div class="proyecto-card">
        <h3>Tienda Online</h3>
        <p>E-commerce con carrito de compras</p>
      </div>
      <div class="proyecto-card">
        <h3>Blog Personal</h3>
        <p>Plataforma de publicacion de articulos</p>
      </div>
      <div class="proyecto-card">
        <h3>App del Clima</h3>
        <p>Aplicacion de pronostico del tiempo</p>
      </div>
    </div>
  </section>
  <footer id="contacto">
    <h2>Contacto</h2>
    <form>
      <div>
        <label>Nombre:</label>
        <input type="text">
      </div>
      <div>
        <label>Email:</label>
        <input type="email">
      </div>
      <div>
        <label>Mensaje:</label>
        <textarea></textarea>
      </div>
      <button type="submit">Enviar Mensaje</button>
    </form>
    <p>\u00a9 2024 Carlos Garcia</p>
  </footer>
</body>
</html>`,
    testCases: [
      {
        input: '',
        expected:
          'Carlos Garcia\nInicio Proyectos Contacto\nSobre Mi\nSoy un desarrollador web apasionado por crear soluciones digitales.\nMis Proyectos\nTienda Online\nE-commerce con carrito de compras\nBlog Personal\nPlataforma de publicacion de articulos\nApp del Clima\nAplicacion de pronostico del tiempo\nContacto\nNombre:\nEmail:\nMensaje:\nEnviar Mensaje\n\u00a9 2024 Carlos Garcia',
      },
    ],
    tags: [
      'html',
      'css',
      'portfolio',
      'grid',
      'flexbox',
      'formulario',
      'semantico',
      'completa',
    ],
    timeLimit: 5000,
    memoryLimit: 128,
    points: 40,
    isActive: true,
  },
];
