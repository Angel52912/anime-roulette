// ============================================================
// ANIME ROULETTE — lógica del front-end
// Paso 3: conexión con la API de anime (géneros, ruleta y tarjeta)
// ============================================================

// URL base de la API: es gratuita y no necesita clave.
// Jikan (api.jikan.moe/v4) cerró su API pública el 1 de octubre de 2026,
// así que usamos Tenrai, que conserva el mismo esquema y los mismos caminos
// (la recomienda el propio mantenedor de Jikan en su issue #613).
const BASE_API = "https://api.tenrai.org/v1";

// ---------- Referencias a los elementos del HTML (mismos IDs) ----------
const elementoGenero = document.getElementById("genero");
const botonGirar = document.getElementById("btn-girar");
const elementoRuleta = document.getElementById("ruleta");
const textoCargando = document.getElementById("texto-cargando");
const mensajes = document.getElementById("mensajes");
const tarjeta = document.getElementById("tarjeta");
const elementoPortada = document.getElementById("portada");
const elementoTitulo = document.getElementById("titulo");
const elementoEnlaceMAL = document.getElementById("enlace-mal");
const elementoClase = document.getElementById("clase");
const elementoPuntos = document.getElementById("puntos");
const elementoScore = document.getElementById("score");
const elementoEpisodios = document.getElementById("episodios");
const elementoAnio = document.getElementById("anio");
const elementoGeneros = document.getElementById("generos");
const elementoSinopsis = document.getElementById("sinopsis");

// Anime que se muestra en la tarjeta ahora mismo.
// Lo usarán los pasos siguientes: "Resumir con IA" (7) y "Mi mano" (8).
let animeActual = null;

// ------------------------------------------------------------
// pedirJikan: hace un fetch a la API con tiempo límite de 8 segundos
// y convierte cada fallo en un "tipo" de error (red, limite, servidor).
// Se llama "pedirJikan" porque Tenrai conserva los mismos caminos de Jikan.
// ------------------------------------------------------------
async function pedirJikan(ruta) {
  // AbortController nos deja cancelar la petición si tarda demasiado
  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), 8000);

  try {
    const respuesta = await fetch(BASE_API + ruta, { signal: controlador.signal });

    // 429 = nos pasamos de peticiones: la casa pide calma
    if (respuesta.status === 429) {
      throw new Error("limite");
    }

    // Otros códigos de error (404, 500…): error genérico que guarda el código
    if (!respuesta.ok) {
      throw new Error("servidor:" + respuesta.status);
    }

    // Si todo salió bien, devolvemos el JSON tal cual
    return await respuesta.json();
  } catch (error) {
    // Sin internet o fallo de red: fetch lanza un TypeError
    if (error.name === "TypeError") {
      throw new Error("red");
    }
    // Se agotaron los 8 segundos: no llegó ninguna respuesta
    if (error.name === "AbortError") {
      throw new Error("servidor");
    }
    // Nuestros errores tipados ("limite", "servidor:404"…) siguen su camino
    throw error;
  } finally {
    clearTimeout(reloj); // siempre se apaga el cronómetro
  }
}

// ------------------------------------------------------------
// mostrarError: escribe en #mensajes el texto temático de cada fallo
// (el cooldown del 429 se agrega en el paso 5)
// ------------------------------------------------------------
function mostrarError(tipo) {
  // pedirJikan puede mandar "servidor:404"; nos quedamos con la parte base
  const clave = String(tipo).split(":")[0];

  const textos = {
    red: "Sin conexión. Revisa tu internet e inténtalo de nuevo.",
    limite: "La casa pide que esperes un momento…",
    vacio: "Nadie apostó por eso. Prueba otra búsqueda.",
    servidor: "El servidor no respondió. Intenta más tarde.",
    ia: "La IA no pudo resumir esta vez." // se usa en el paso 7
  };

  // Tipo desconocido → mensaje de servidor por defecto
  mensajes.textContent = textos[clave] || textos.servidor;
  mensajes.classList.add("error");
}

// ------------------------------------------------------------
// cargarGeneros: pide los géneros a la API y llena el <select> al iniciar
// ------------------------------------------------------------
async function cargarGeneros() {
  try {
    const json = await pedirJikan("/genres/anime");

    for (const genero of json.data) {
      const opcion = document.createElement("option");
      opcion.value = genero.mal_id;      // lo pide el filtro del paso 4
      opcion.textContent = genero.name;  // nombre visible en español/inglés según Jikan
      elementoGenero.appendChild(opcion);
    }
  } catch (error) {
    // Si falla, el select se queda solo con "Todos los géneros" y se avisa
    mostrarError(error.message);
  }
}

// ------------------------------------------------------------
// calcularClase: convierte el score de MyAnimeList en la letra de clase
// Reglas de la sección 4: ≥8.5 → A, 7.5–8.49 → B, 6.5–7.49 → C, menos o sin score → D
// ------------------------------------------------------------
function calcularClase(score) {
  if (score === null) return "D"; // sin score → CLASE D
  if (score >= 8.5) return "A";
  if (score >= 7.5) return "B";
  if (score >= 6.5) return "C";
  return "D";
}

// ------------------------------------------------------------
// pintarTarjeta: rellena la tarjeta grande con los datos del anime.
// Todos los campos pueden venir null: siempre hay valor de reemplazo.
// ------------------------------------------------------------
function pintarTarjeta(anime) {
  animeActual = anime; // lo necesitarán los botones de IA (7) y Mi mano (8)

  // Título: preferimos el inglés; si no, el original; si no, uno genérico
  const titulo = anime.title_english || anime.title || "Sin título";
  const puntuacion = typeof anime.score === "number" ? anime.score : null;

  // Portada: si no hay imagen, quitamos el src para no ver un icono roto
  const portada = anime.images && anime.images.jpg ? anime.images.jpg.large_image_url : null;
  if (portada) {
    elementoPortada.src = portada;
    elementoPortada.alt = `Portada de ${titulo}`; // accesibilidad: alt siempre
  } else {
    elementoPortada.removeAttribute("src");
    elementoPortada.alt = "Portada no disponible";
  }

  // Título y enlace a la ficha de MyAnimeList (campo "url" de la API)
  elementoTitulo.textContent = titulo;
  if (anime.url) {
    elementoEnlaceMAL.href = anime.url;
    elementoEnlaceMAL.hidden = false;
  } else {
    elementoEnlaceMAL.hidden = true;
  }

  // Insignia de clase y puntos de clase
  const letra = calcularClase(puntuacion);
  elementoClase.textContent = `CLASE ${letra}`;
  elementoClase.className = `insignia clase-${letra.toLowerCase()}`; // limpia la clase anterior
  elementoPuntos.textContent = `Puntos de clase: ${puntuacion !== null ? puntuacion : "Sin score"}`;

  // Datos sueltos con valores de reemplazo cuando vienen null
  elementoScore.textContent = puntuacion !== null ? puntuacion : "Sin score";
  elementoEpisodios.textContent = typeof anime.episodes === "number" ? anime.episodes : "Sin datos";
  elementoAnio.textContent = typeof anime.year === "number" ? anime.year : "Sin datos";
  elementoGeneros.textContent = Array.isArray(anime.genres) && anime.genres.length > 0
    ? anime.genres.map((genero) => genero.name).join(", ")
    : "Sin géneros";
  elementoSinopsis.textContent = anime.synopsis || "Sin sinopsis disponible";

  // Reiniciamos la animación para que la tarjeta se "voltee" de nuevo
  tarjeta.style.animation = "none";
  void tarjeta.offsetHeight; // truco: obliga al navegador a repintar
  tarjeta.style.animation = "";
}

// ------------------------------------------------------------
// girarRuleta: pide un anime al azar y lo muestra en la tarjeta.
// (El filtro por género y el buscador se agregan en el paso 4.)
// ------------------------------------------------------------
async function girarRuleta() {
  // Limpiamos mensajes y ponemos la ruleta en modo "cargando"
  mensajes.textContent = "";
  mensajes.classList.remove("error");
  botonGirar.disabled = true; // evita giros dobles mientras carga
  elementoRuleta.classList.add("girando");
  textoCargando.hidden = false;

  try {
    // Sin filtro de contenido: se usa GET /random/anime tal cual lo pide el
    // enunciado, y se decidió conservar el azar completo (contenido para
    // adultos incluido) porque da más realismo a la ruleta.
    // Si alguna vez quieres filtrarlo, basta con añadir "?sfw-strict=true".
    const json = await pedirJikan("/random/anime");

    // Respuesta vacía: no hay anime que mostrar
    if (!json.data) {
      mostrarError("vacio");
      return;
    }

    pintarTarjeta(json.data);
  } catch (error) {
    mostrarError(error.message);
  } finally {
    // Sea éxito o error, la ruleta siempre se detiene
    elementoRuleta.classList.remove("girando");
    textoCargando.hidden = true;
    botonGirar.disabled = false;
  }
}

// ---------- Arranque de la página ----------
botonGirar.addEventListener("click", girarRuleta); // botón "Girar la ruleta"
cargarGeneros(); // el <select> se llena apenas carga la página
