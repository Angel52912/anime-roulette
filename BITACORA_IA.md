# Bitácora de programación con IA

## Prompt 1
**Prompt (copiado tal cual):** lee @INSTRUCCIONES_ANIME_ROULETTE-1.md y ejecuta el paso 1 con comentarios en español
**Qué hizo la IA (resumen):** Creé la estructura base del proyecto: carpeta `public/` con `index.html`, `style.css` y `app.js` vacíos (se llenan en los pasos 2 y 3), más `package.json`, `.gitignore` y `.env.example` con clave falsa y comentarios en español.
Corrí `npm install` para comprobar que el `package.json` resuelve bien las dependencias (express y dotenv): 69 paquetes, 0 vulnerabilidades.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 2
**Prompt (copiado tal cual):** ejecuta el paso 2 con comentarios en español
**Qué hizo la IA (resumen):** Escribí `index.html` con las 8 secciones de la interfaz (header, panel de apuesta, mensajes, ruleta, tarjeta, resultados, Mi mano y footer) y `style.css` con la paleta, tipografías, ruleta con `conic-gradient`, volteo de tarjeta, insignias de clase, responsive y `prefers-reduced-motion`.
Sin lógica: los botones "Resumir con IA" y "Guardar en Mi mano" nacen deshabilitados y `app.js` solo lleva una nota hasta el paso 3.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 3
**Prompt (copiado tal cual):** ejecuta el paso 3 con comentarios en español
**Qué hizo la IA (resumen):** Escribí `app.js` con `pedirJikan` (fetch + AbortController de 8 s y errores tipados `limite`/`red`/`servidor`), `mostrarError`, carga de `/genres/anime` al iniciar y `girarRuleta` con `/random/anime` que rellena la tarjeta con valores de reemplazo para campos null y el enlace "Ver en MyAnimeList ↗" (campo `url`).
Al confirmarse que Jikan cerró su API pública el 1-oct-2026, cambié la URL base a Tenrai (`https://api.tenrai.org/v1`, mismo esquema) y agregué `sfw=true` al azar; verifiqué los 4 endpoints con respuesta 200 y CORS `*`.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 4
**Prompt (copiado tal cual):** que si se puede mostrar contenido para adultos en la ruleta
**Qué hizo la IA (resumen):** Comprobé el caso con la doc de Tenrai y con muestreo real: sin filtro salió "Virgin Night [Hentai]" y con `sfw=true` seguía pasando Ecchi ("No Game No Life Specials"), porque `sfw` no filtra Ecchi.
Cambié la ruleta a `/random/anime?sfw-strict=true` (filtra Hentai, Erotica, R+ y Ecchi): 20 muestras sin casos; los pasos 4+ usarán el mismo filtro estricto salvo que indiques lo contrario.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 5
**Prompt (copiado tal cual):** antes, creo que es mejor mantener el contenido para adult0s da mas realismo al azar que representa la ruleta
**Qué hizo la IA (resumen):** Revertí la ruleta a `GET /random/anime` sin ningún filtro (el endpoint literal del enunciado), eliminando `sfw-strict`, para que el azar conserve contenido adulto según tu criterio de realismo.
Dejé anotado en el código cómo reactivar `?sfw-strict=true` si cambias de opinión; el paso 4 usará el `sfw=true` literal del enunciado en buscador y filtro por género.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 6
**Prompt (copiado tal cual):** ejecuta el paso 4 con comentarios en español
**Qué hizo la IA (resumen):** Agregué la ruleta con género en dos peticiones (página 1 para leer `last_visible_page`, página al azar de las primeras 10 y anime al azar de esa página) y el buscador (`/anime?q=…&sfw=true&limit=12`) que pinta un grid de tarjetas `<button>` clicables que llevan su anime a la tarjeta grande.
Unifiqué el estado de carga en `empezarCarga`/`terminarCarga` (ruleta girando y botones bloqueados), agregué búsqueda con "Enter" y mensajes de vacío; todo comentado en español y verificado con `node --check` y peticiones reales.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 7
**Prompt (copiado tal cual):** haz que funcionen los generos para adultos
**Qué hizo la IA (resumen):** Quité `sfw=true` de la ruleta con género (`girarConGenero`); verificado con peticiones reales: Hentai (12) y Erotica (49) pasaron de 0 resultados con filtro a 25 (67 y 4 páginas), y Ecchi (9) amplió de 16 a 34 páginas.
El buscador conserva el `sfw=true` literal del enunciado; si también lo quieres sin filtro, se quita con ese mismo cambio en la línea de `buscarAnime`.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 8
**Prompt (copiado tal cual):** lee @INSTRUCCIONES_ANIME_ROULETTE-1.md y continua con el paso que sigue
**Qué hizo la IA (resumen):** Revisé el paso 5: `mostrarError(tipo)` con los 5 textos temáticos, `iniciarCooldown(5)` que deshabilita botones con cuenta regresiva visible en el 429, y `terminarCarga()` en `finally`. Ya estaba en `public/app.js` sin commitear; solo agregué esta entrada.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 9
**Prompt (copiado tal cual):** continua con el paso 6 con comentarios en español
**Qué hizo la IA (resumen):** Creé `server.js`: Express sirve `public/` y `POST /api/resumen` llama a Gemini (`MODELO_GEMINI` en constante), con 400 sin sinopsis, 429 → `limite`, otros fallos → 502 `ia` y 500 genérico en el `catch`.
Probé sin clave real: 400 sin sinopsis, 502 con sinopsis, 200 en `/` y el aviso de clave faltante en consola.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 10
**Prompt (copiado tal cual):** continua con el paso 7 con comentarios en español
**Qué hizo la IA (resumen):** En `public/app.js` agregué `resumirConIA()`: POST a `/api/resumen` con `{ titulo, sinopsis }`, aviso si no hay sinopsis, 429 → `limite`, otro fallo → `ia`, y caché `cache[mal_id]`. El botón se habilita al pintar la tarjeta y el cuadro muestra el resumen guardado si existe.
Simulé con `fetch` falso: resumen OK, caché (1 sola llamada al repetir), sin sinopsis (0 llamadas), 502 y 429.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 11
**Prompt (copiado tal cual):** app.js:322 
 POST http://127.0.0.1:5501/api/resumen net::ERR_ABORTED 405 (Method Not Allowed)
resumirConIA    @    app.js:322 salio este error
**Qué hizo la IA (resumen):** Sin cambios de código. Explicó que la página se abría con Live Server (puerto 5501), que no tiene `/api/resumen`; hay que usar `npm start` y abrir `http://localhost:3000`.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 12
**Prompt (copiado tal cual):** salio este error Failed to load resource: the server responded with a status of 502 (Bad Gateway)
**Qué hizo la IA (resumen):** En `server.js` agregué un `console.error` con el código y el mensaje que devuelve Gemini, para ver el motivo real del 502. También revisó el largo (sin mostrarla) de la clave del `.env`.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

## Prompt 13
**Prompt (copiado tal cual):** "error": {
    "code": 404,
    "message": "This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemin
**Qué hizo la IA (resumen):** Cambié la constante `MODELO_GEMINI` en `server.js` de `gemini-2.5-flash-lite` a `gemini-3.5-flash-lite`.
**¿Funcionó?:** [COMPLETAR: sí / no]
**Si no funcionó, qué corregí:** [COMPLETAR o "No aplica"]
**Prompt de corrección que usé:** [COMPLETAR o "No aplica"]
**Resultado tras la corrección:** [COMPLETAR o "No aplica"]

(Cada paso nuevo agrega otra entrada "## Prompt N" con el mismo formato.)

## Un error de la IA que detecté
[COMPLETAR: qué falló (código que no corría, función inexistente, solución insegura o ineficiente) y cómo lo resolví]

## Qué aprendí y qué haría distinto
[COMPLETAR]
