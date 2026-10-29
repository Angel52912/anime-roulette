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

(Cada paso nuevo agrega otra entrada "## Prompt N" con el mismo formato.)

## Un error de la IA que detecté
[COMPLETAR: qué falló (código que no corría, función inexistente, solución insegura o ineficiente) y cómo lo resolví]

## Qué aprendí y qué haría distinto
[COMPLETAR]
