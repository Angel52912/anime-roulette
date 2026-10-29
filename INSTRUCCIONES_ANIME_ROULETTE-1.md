# Anime Roulette — Instrucciones para Open Code

> Lee TODO este archivo antes de escribir código. Construye el proyecto **por pasos**, en el orden indicado, y detente al final de cada paso para que el usuario haga su commit.

## 0. Reglas para el asistente (obligatorias)

1. **No hagas commits ni `git push`.** El usuario hará cada commit con su propia cuenta (Angel52912) para que el historial sea de su autoría. Al terminar cada paso, solo sugiere el mensaje de commit indicado.
2. **Nunca escribas una clave de API real** en ningún archivo. Solo crea `.env.example` con un valor falso. El usuario creará su propio `.env`.
3. **Código simple y explicable.** El usuario debe poder explicar cualquier línea en una demo. Usa JavaScript puro (sin React, Vue ni frameworks de frontend), funciones pequeñas y comentarios en español que expliquen el porqué.
4. **No inventes funciones ni endpoints.** Usa únicamente los que se listan aquí. Si dudas de algo, dilo en vez de suponer.
5. Node.js 18 o superior (usa `fetch` nativo en el backend).
6. Todo el texto de la interfaz va en **español**.
7. **Registro de la bitácora:** al terminar cada paso, agrega una entrada nueva al final de `BITACORA_IA.md` con (a) el prompt del usuario copiado **literalmente**, sin parafrasear, y (b) un resumen de 2 líneas de lo que hiciste. **No llenes** los campos marcados `[COMPLETAR]`: los llena solo el usuario. Si el usuario te manda después un prompt de corrección, agrégalo también como entrada nueva con su prompt literal y el resumen de lo que cambiaste.

## 1. Descripción del proyecto

**Anime Roulette** es una web donde el usuario "apuesta" por un género y una ruleta le entrega un anime al azar. Muestra portada, score, episodios y sinopsis. Un botón **"Resumir con IA"** manda la sinopsis al backend, que consulta Gemini y devuelve un resumen corto en español. También hay buscador y una lista de pendientes (watchlist) guardada en `localStorage`.

**Requisitos de la tarea que se deben cumplir:**
- Peticiones a API externa y resultados en pantalla (Jikan + Gemini).
- Manejo de errores: sin conexión, respuesta vacía y límite de peticiones (429).
- Interfaz clara y usable.
- Clave de API nunca en el repositorio.
- README con instrucciones de ejecución.

## 2. Stack

- **Frontend:** HTML, CSS y JavaScript puro, servido desde `public/`.
- **Backend:** Node.js + Express. Sirve `public/` y expone `POST /api/resumen`.
- **Paquetes npm:** `express` y `dotenv` (nada más).
- **APIs:**
  - Jikan v4 (sin clave), base `https://api.jikan.moe/v4`.
  - Gemini (con clave en `.env`, solo desde el backend).

## 3. Estructura de archivos

```
anime-roulette/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── BITACORA_IA.md
```

## 4. Estilo visual (muy importante)

Fusión de tres referencias de anime: **Kakegurui** (casino elegante y peligroso), **No Game No Life** (colores vivos, juegos, tablero de ajedrez) y **Classroom of the Elite** (minimalismo frío, rangos por clase). Usa solo CSS propio, sin copiar imágenes ni logos de las series.

**Paleta (variables CSS en `:root`):**
```css
--bg: #0a0a10;          /* negro casino */
--panel: #14141f;
--rojo: #c1123a;        /* Kakegurui: rojo carmesí */
--oro: #e8c15a;         /* detalles de lujo */
--rosa: #ff5fa2;        /* No Game No Life */
--cian: #4fd8ff;        /* No Game No Life */
--hielo: #cfd8e6;       /* Classroom of the Elite: texto frío */
--texto: #eef1f7;
```

**Tipografías (Google Fonts):**
- Títulos: `Cinzel` (elegante, estilo casino).
- Texto: `Inter` o `Noto Sans JP`.
- Acentos opcionales: `Press Start 2P` (solo en etiquetas pequeñas, guiño a juegos).

**Elementos de diseño:**
- Fondo oscuro con un patrón sutil de **tablero de ajedrez** (NGNL) en baja opacidad y un degradado radial rojo detrás del título.
- Título "ANIME ROULETTE" con brillo dorado y subtítulo: *"Apuesta tu próxima obsesión."*
- **Ruleta CSS** (círculo con `conic-gradient` rojo/negro y borde dorado) que gira mientras carga una petición.
- La tarjeta del anime se revela con una animación tipo **carta que se voltea** (`transform: rotateY`).
- **Insignia de clase (Classroom of the Elite)** según el score de MyAnimeList:
  - score ≥ 8.5 → "CLASE A"
  - 7.5 a 8.49 → "CLASE B"
  - 6.5 a 7.49 → "CLASE C"
  - menor a 6.5 o sin score → "CLASE D"
  Muestra además "Puntos de clase: {score}".
- Textos temáticos: botón principal **"Girar la ruleta"**, error de límite **"La casa pide que esperes un momento…"**, vacío **"Nadie apostó por eso. Prueba otra búsqueda."**, watchlist llamada **"Mi mano"**.
- Pie de página con una frase tipo reglas de juego: *"Regla única: todo se decide con un giro."*
- Bordes finos dorados, esquinas ligeramente redondeadas, sombras con brillo (`box-shadow` con rojo/rosa).
- **Responsive** (celular y computadora) con CSS Grid/Flexbox y `@media`.
- Respeta `prefers-reduced-motion` (desactiva giros y volteos).
- Accesibilidad: `alt` en imágenes, `aria-live="polite"` en la zona de mensajes, botones con texto claro.

## 5. Interfaz (secciones de `index.html`)

1. **Header:** título y subtítulo.
2. **Panel de apuesta:** `<select>` de género (se llena desde la API), botón "Girar la ruleta", y un buscador (`input` + botón "Buscar").
3. **Zona de mensajes:** `<div id="mensajes" aria-live="polite">`.
4. **Ruleta/Cargando:** elemento que gira mientras hay petición.
5. **Tarjeta de resultado:** imagen, título, insignia de clase, score, episodios, año, géneros, sinopsis, botones **"Resumir con IA"** y **"Guardar en Mi mano"**, y un cuadro donde aparece el resumen de la IA.
6. **Resultados de búsqueda:** grid de tarjetas pequeñas; al hacer clic en una se muestra en la tarjeta grande.
7. **Mi mano (watchlist):** lista con portada, título, score y botón para quitar.
8. **Footer.**

## 6. Lógica de `app.js`

### 6.1 Jikan (desde el navegador)
Función auxiliar `pedirJikan(ruta)`:
- Usa `fetch` con `AbortController` y timeout de 8 segundos.
- Si `response.status === 429` → lanza error de tipo "limite".
- Si `!response.ok` → error genérico con el código.
- Si `fetch` falla por red (`TypeError`) → error de tipo "red".
- Devuelve el JSON.

Endpoints permitidos:
- `GET /genres/anime` → llena el `<select>` (usa `data[].mal_id` y `data[].name`). Cárgalo al iniciar.
- `GET /random/anime` → anime al azar sin filtro.
- `GET /anime?genres={id}&order_by=score&sort=desc&sfw=true&limit=25&page={n}` → con género.
- `GET /anime?q={texto}&sfw=true&limit=12` → búsqueda.

**Ruleta con género:** haz una primera petición con `page=1` para leer `pagination.last_visible_page`; elige una página al azar entre 1 y `Math.min(last_visible_page, 10)`; pide esa página y escoge un elemento al azar del arreglo `data`.

Campos que usarás de cada anime: `mal_id`, `title`, `title_english`, `images.jpg.large_image_url`, `score`, `episodes`, `year`, `synopsis`, `genres[].name`, `url`. **Todos pueden venir `null`**: muestra valores de reemplazo ("Sin score", "Sin sinopsis disponible", etc.).

### 6.2 Manejo de errores (centralizado)
Función `mostrarError(tipo)` que escribe en `#mensajes`:
- `red` → "Sin conexión. Revisa tu internet e inténtalo de nuevo."
- `limite` → "La casa pide que esperes un momento…" y **deshabilita los botones 5 segundos** con cuenta regresiva visible.
- `vacio` → "Nadie apostó por eso. Prueba otra búsqueda."
- `servidor` → "El servidor no respondió. Intenta más tarde."
- `ia` → "La IA no pudo resumir esta vez."
Siempre quita la ruleta de "cargando" en un bloque `finally`.

### 6.3 Resumir con IA
- Botón "Resumir con IA" → `fetch("/api/resumen", { method: "POST", ... })` con JSON `{ titulo, sinopsis }`.
- Si la sinopsis no existe, no hagas la petición y avisa.
- Muestra el resumen en el cuadro; si el backend responde 429 → error `limite`; otro fallo → error `ia`.
- Guarda resúmenes ya pedidos en un objeto en memoria (`cache[mal_id]`) para no repetir peticiones.

### 6.4 Mi mano (localStorage)
- Clave: `animeRoulette.miMano`, valor: arreglo JSON de `{ mal_id, title, image, score }`.
- Envuelve lecturas y escrituras en `try/catch` (puede estar bloqueado).
- No permitir duplicados por `mal_id`.
- Funciones: `leerMiMano()`, `guardarMiMano(lista)`, `agregarAMiMano(anime)`, `quitarDeMiMano(id)`, `pintarMiMano()`.
- Al cargar la página, pinta Mi mano.

## 7. Backend (`server.js`)

- Carga `dotenv`, crea la app Express, `express.json({ limit: "20kb" })`, sirve `public/` con `express.static`.
- Puerto: `process.env.PORT || 3000`.
- Si falta `GEMINI_API_KEY` al arrancar, imprime un aviso claro en consola (sin mostrar la clave).

**Ruta `POST /api/resumen`:**
1. Lee `titulo` y `sinopsis` de `req.body`. Si falta la sinopsis → `400` con `{ error: "Falta la sinopsis" }`.
2. Recorta la sinopsis a 4000 caracteres.
3. Llama a Gemini:
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
   - Método `POST`, headers `Content-Type: application/json` y `x-goog-api-key: process.env.GEMINI_API_KEY`.
   - Body: `{ "contents": [{ "parts": [{ "text": PROMPT }] }] }`
   - `PROMPT`: `Eres un narrador de anime. Resume en español, en máximo 2 frases y sin spoilers, la siguiente sinopsis del anime "${titulo}":\n\n${sinopsis}`
4. Si Gemini responde `429` → responde `429` con `{ error: "limite" }`.
5. Si responde otro error → `502` con `{ error: "ia" }`.
6. Lee el texto en `data.candidates?.[0]?.content?.parts?.[0]?.text`. Si viene vacío → `502`.
7. Responde `{ resumen: texto }`.
8. Todo dentro de `try/catch`; en `catch` responde `500` sin exponer detalles internos.

**Nota:** el nombre del modelo puede cambiar con el tiempo. Déjalo en una constante `MODELO_GEMINI` al inicio del archivo para cambiarlo fácil, y menciónalo en el README.

## 8. Archivos de configuración

**`package.json`:** nombre `anime-roulette`, `"scripts": { "start": "node server.js" }`, dependencias `express` y `dotenv`.

**`.env.example`:**
```
GEMINI_API_KEY=pega_aqui_tu_clave
PORT=3000
```

**`.gitignore`:**
```
node_modules/
.env
```

## 9. Pasos de construcción y commits sugeridos

Haz un paso a la vez y detente al terminar cada uno.

| Paso | Qué construir | Mensaje de commit sugerido |
|---|---|---|
| 1 | Estructura de carpetas, `package.json`, `.gitignore`, `.env.example` | `Estructura base del proyecto` |
| 2 | `index.html` y `style.css` con el estilo de la sección 4 (sin lógica) | `Interfaz y estilo visual` |
| 3 | Carga de géneros, ruleta aleatoria y tarjeta de resultado con Jikan | `Conexion a Jikan y tarjeta de anime` |
| 4 | Buscador y ruleta con filtro de género | `Buscador y filtro por genero` |
| 5 | Manejo de errores centralizado y cooldown de 429 | `Manejo de errores y limite de peticiones` |
| 6 | `server.js` con la ruta `/api/resumen` | `Backend Express con ruta de resumen` |
| 7 | Botón "Resumir con IA" conectado y caché | `Boton de resumen con Gemini` |
| 8 | Mi mano con `localStorage` | `Watchlist con localStorage` |
| 9 | `README.md` y `BITACORA_IA.md` | `README y bitacora de IA` |

Recomendación al usuario: espaciar los commits en varios días y probar cada paso antes de continuar.

## 10. Contenido del `README.md`

Incluye estas secciones:
1. **Título y descripción** de Anime Roulette.
2. **Requisitos:** Node 18+.
3. **Instalación y ejecución:**
   - `npm install`
   - Copiar `.env.example` a `.env` y poner la clave propia (obtenida en aistudio.google.com/apikey).
   - `npm start` y abrir `http://localhost:3000`.
4. **Declaración de IA:** herramientas usadas (Open Code, Claude, Gemini en la app), para qué se usó cada una, y qué parte hizo el usuario sin IA. *(El usuario debe completarla con la verdad; deja campos `[COMPLETAR]`.)*
5. **Manejo de errores:** lista de casos cubiertos.
6. **Seguridad:** la clave solo vive en `.env` (ignorado por git).
7. **Capturas** (marcador para agregarlas).

## 11. Contenido de `BITACORA_IA.md`

Crea el archivo con la plantilla y, siguiendo la regla 7, agrega una entrada después de cada paso con el prompt literal del usuario y el resumen de lo que hiciste. **Nunca inventes** prompts, resultados ni correcciones: los campos `[COMPLETAR]` los llena el usuario con lo que realmente pasó.

```
# Bitácora de programación con IA

## Prompt 1
**Prompt (copiado tal cual):** [lo agrega Open Code, literal]
**Qué hizo la IA (resumen):** [lo agrega Open Code]
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

(Cada paso nuevo agrega otra entrada "## Prompt N" con el mismo formato.)

## Un error de la IA que detecté
[COMPLETAR: qué falló (código que no corría, función inexistente, solución insegura o ineficiente) y cómo lo resolví]

## Qué aprendí y qué haría distinto
[COMPLETAR]
```

## 12. Checklist final (verifícalo al terminar)

- [ ] `npm start` levanta el servidor sin errores.
- [ ] Los géneros se cargan en el `<select>`.
- [ ] "Girar la ruleta" funciona con y sin género.
- [ ] El buscador muestra resultados y el mensaje de vacío.
- [ ] Apagar el internet muestra el mensaje de "sin conexión".
- [ ] Un 429 muestra el mensaje temático y el cooldown.
- [ ] "Resumir con IA" devuelve un resumen en español.
- [ ] Mi mano guarda, no duplica y persiste al recargar.
- [ ] La clave de API no aparece en ningún archivo versionado.
- [ ] Se ve bien en celular y en computadora.
