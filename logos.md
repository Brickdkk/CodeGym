Actúa como Frontend Tech Lead. Vamos a estandarizar la UI de la plataforma creando un sistema centralizado para los logos de los lenguajes de programación. Ejecuta las siguientes tareas con rigor técnico:

1. ARQUITECTURA DE RECURSOS: Crea un archivo de mapeo, por ejemplo `client/src/lib/languageLogos.ts` (o `.tsx` si usarás componentes SVG). Este archivo debe exportar un diccionario u objeto que vincule el ID exacto de cada lenguaje soportado por la plataforma con la ruta de su logo correspondiente (ubicados en `client/src/assets/logos/`).
2. REFACTORIZACIÓN DE UI: Audita los componentes visuales (tarjetas de ejercicios, selectores de lenguaje, rankings) y modifícalos para que consuman este nuevo diccionario en lugar de usar rutas estáticas o íconos genéricos. Maneja un logo "por defecto" o un "fallback" en caso de que un logo no cargue.
3. INVENTARIO DE ASSETS (TU REPORTE): Analiza los lenguajes configurados actualmente en el sistema de ejecución (runners/WASM). Al terminar el código, imprímeme en esta consola una lista EXACTA y detallada de los archivos de imagen que yo, como usuario, necesito descargar y guardar en la carpeta `client/src/assets/logos/`. 
   - Especifícame el nombre exacto que esperas que tenga cada archivo (ej. `python.svg`, `cpp.png`).
   - Recomiéndame el formato ideal para rendimiento web.

Detente y entrégame la lista de logos requeridos en cuanto el código esté implementado.