# Anime Roulette

Anime Roulette es una web donde apuestas por un género y una ruleta te entrega un anime al azar. Muestra portada, score, episodios, año, géneros y sinopsis. El botón **"Resumir con IA"** manda la sinopsis al backend, que consulta Gemini y devuelve un resumen corto en español. También tiene un buscador y una lista de pendientes llamada **"Mi mano"**, guardada en `localStorage`.

El estilo visual mezcla tres referencias de anime: Kakegurui (casino), No Game No Life (colores vivos y tablero de ajedrez) y Classroom of the Elite (insignias de clase según el score).

## Requisitos

- Node.js 18 o superior (el backend usa `fetch` nativo).
- Una clave de API de Gemini, gratuita en [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Instalación y ejecución

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y pega tu propia clave:
   ```
   GEMINI_API_KEY=tu_clave_aqui
   PORT=3000
   ```
3. Inicia el servidor:
   ```
   npm start
   ```
4. Abre `http://localhost:3000` en el navegador.

Abre la página siempre desde `http://localhost:3000`. Si usas otro servidor de archivos (por ejemplo Live Server), el botón de IA falla porque no existe la ruta `/api/resumen`.

### Notas sobre las APIs

- **Datos de anime:** la interfaz usa la API gratuita Tenrai (`https://api.tenrai.org/v1`), que conserva el esquema y los caminos de Jikan v4. La constante `BASE_API` está al inicio de `public/app.js`.
- **Modelo de Gemini:** el nombre del modelo cambia con el tiempo. Está en la constante `MODELO_GEMINI` al inicio de `server.js`; si Gemini responde 404, cámbialo por uno vigente.

## Declaración de IA

- **Herramientas usadas:** Open Code, Claude y Gemini (dentro de la app, para resumir sinopsis).
- **Para qué se usó cada una:** [opencode se uso para generar codigo, claude para testeo y documentacion y gemini como apoyo minimo en la documentacion]
- **Qué parte hice yo sin IA:** [cree el entorno principal, el .env con la api de gemini, hice commits y pruebas manuales aparte deltesteo de claude]

El detalle de los prompts y las correcciones está en `BITACORA_IA.md`.

## Manejo de errores

- **Sin conexión:** muestra "Sin conexión. Revisa tu internet e inténtalo de nuevo."
- **Respuesta vacía:** muestra "Nadie apostó por eso. Prueba otra búsqueda." (búsqueda sin resultados o género sin animes).
- **Límite de peticiones (429):** muestra "La casa pide que esperes un momento…", deshabilita los botones 5 segundos y enseña una cuenta regresiva. Aplica a la API de anime y al resumen con IA.
- **Servidor caído o lento:** las peticiones a la API de anime se cortan a los 8 segundos y muestran "El servidor no respondió. Intenta más tarde."
- **Fallo de la IA:** muestra "La IA no pudo resumir esta vez." Si el anime no tiene sinopsis, no se hace la petición y se avisa.
- **`localStorage` bloqueado:** Mi mano avisa que no se pudo guardar en vez de romperse.
- La ruleta de carga siempre se detiene, sea éxito o error.

## Seguridad

- La clave de Gemini vive solo en `.env`, que está en `.gitignore` y no se sube al repositorio.
- Solo el backend usa la clave; el navegador nunca la ve.
- `.env.example` contiene un valor falso.
- El servidor limita el cuerpo de las peticiones a 20 kb y recorta la sinopsis a 4000 caracteres.

