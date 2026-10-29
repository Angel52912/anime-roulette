// ============================================================
// ANIME ROULETTE — lógica del front-end
// Paso 4: buscador y ruleta con filtro de género
// ============================================================

// URL base de la API: es gratuita y no necesita clave.
// Jikan (api.jikan.moe/v4) cerró su API pública el 1 de octubre de 2026,
// así que usamos Tenrai, que conserva el mismo esquema y los mismos caminos
// (la recomienda el propio mantenedor de Jikan en su issue #613).
const BASE_API = "https://api.tenrai.org/v1";

// ---------- Referencias a los elementos del HTML (mismos IDs) ----------
const elementoGenero = document.getElementById("genero");
const botonGirar = document.getElementById("btn-girar");
const elementoBusqueda = document.getElementById("busqueda");
const botonBuscar = document.getElementById("btn-buscar");
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
const gridResultados = document.getElementById("grid-resultados");
const vacioResultados = document.getElementById("vacio-resultados");

// Anime que se muestra en la tarjeta ahora mismo.
// Lo usarán los pasos siguientes: "Resumir con IA" (7) y "Mi mano" (8).
let animeActual = null;

// true mientras hay una petición en curso: evita giros y búsquedas dobles
let cargando = false;

// Cronómetro del cooldown del 429: null cuando no hay espera en curso
let relojCooldown = null;

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

  // El límite de peticiones (429) es especial: además del mensaje temático,
  // bloquea los botones 5 segundos con cuenta regresiva visible
  if (clave === "limite") {
    iniciarCooldown(5);
  }
}

// ------------------------------------------------------------
// iniciarCooldown: espera obligatoria tras un 429.
// Durante "segundos" segundos los botones quedan deshabilitados y la
// cuenta regresiva se ve en la zona de mensajes: "…(5)", "…(4)"…
// ------------------------------------------------------------
function iniciarCooldown(segundos) {
  // Si ya había una cuenta atrás en marcha, no dejamos dos a la vez
  if (relojCooldown) {
    clearInterval(relojCooldown);
  }

  let restantes = segundos;
  botonGirar.disabled = true;
  botonBuscar.disabled = true;

  const pintarCuenta = () => {
    mensajes.textContent = `La casa pide que esperes un momento… (${restantes})`;
    mensajes.classList.add("error");
  };

  pintarCuenta(); // el primer número se ve enseguida: "…(5)"

  relojCooldown = setInterval(() => {
    restantes -= 1;

    if (restantes <= 0) {
      clearInterval(relojCooldown);
      relojCooldown = null;
      mensajes.textContent = ""; // se borra el aviso al terminar
      // Solo se reactivan los botones si no hay otra petición en curso
      if (!cargando) {
        botonGirar.disabled = false;
        botonBuscar.disabled = false;
      }
    } else {
      pintarCuenta();
    }
  }, 1000);
}

// ------------------------------------------------------------
// limpiarMensajes: borra el aviso anterior antes de una acción nueva
// ------------------------------------------------------------
function limpiarMensajes() {
  mensajes.textContent = "";
  mensajes.classList.remove("error");
}

// ------------------------------------------------------------
// empezarCarga / terminarCarga: estado compartido mientras hay petición.
// La ruleta gira y los botones quedan bloqueados para no repetir peticiones.
// ------------------------------------------------------------
function empezarCarga() {
  cargando = true;
  botonGirar.disabled = true;
  botonBuscar.disabled = true;
  elementoRuleta.classList.add("girando");
  textoCargando.hidden = false;
}

function terminarCarga() {
  cargando = false;
  elementoRuleta.classList.remove("girando");
  textoCargando.hidden = true;

  // Los botones solo se reactivan si NO hay una cuenta atrás (429) en marcha
  if (!relojCooldown) {
    botonGirar.disabled = false;
    botonBuscar.disabled = false;
  }
}

// ------------------------------------------------------------
// cargarGeneros: pide los géneros a la API y llena el <select> al iniciar
// ------------------------------------------------------------
async function cargarGeneros() {
  try {
    const json = await pedirJikan("/genres/anime");

    for (const genero of json.data) {
      const opcion = document.createElement("option");
      opcion.value = genero.mal_id;      // lo usa la ruleta con filtro
      opcion.textContent = genero.name;  // nombre visible tal cual lo da la API
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
// girarConGenero: la ruleta con género se decide en DOS peticiones.
// 1) Pedimos la página 1 solo para leer pagination.last_visible_page
//    (cuántas páginas de resultados tiene ese género).
// 2) Elegimos una página al azar entre 1 y min(last_visible_page, 10)
//    y dentro de esa página un anime al azar.
// Así el giro no se queda siempre en los mismos 25 primeros.
// Devuelve el anime elegido o null si no hay resultados.
// ------------------------------------------------------------
async function girarConGenero(idGenero) {
  // Sin sfw: aquí manda el género elegido. Con "sfw=true" los géneros para
  // adultos (Hentai, Erotica) devolvían 0 resultados y el giro terminaba
  // siempre en "Nadie apostó por eso"; se decidió que funcionen todos.
  const rutaBase = `/anime?genres=${idGenero}&order_by=score&sort=desc&limit=25`;

  // 1) cuántas páginas hay
  const primera = await pedirJikan(`${rutaBase}&page=1`);
  const ultima = Math.min((primera.pagination && primera.pagination.last_visible_page) || 1, 10);

  // 2) página al azar (entre 1 y "ultima", ambas incluidas)
  const pagina = Math.floor(Math.random() * ultima) + 1;
  const segunda = await pedirJikan(`${rutaBase}&page=${pagina}`);

  if (!segunda.data || segunda.data.length === 0) {
    return null; // respuesta vacía
  }

  // 3) anime al azar dentro de esa página
  const posicion = Math.floor(Math.random() * segunda.data.length);
  return segunda.data[posicion];
}

// ------------------------------------------------------------
// girarRuleta: con género elegido usa girarConGenero; sin género,
// pide un anime al azar puro (/random/anime, sin filtro, tal cual el enunciado)
// ------------------------------------------------------------
async function girarRuleta() {
  if (cargando || relojCooldown) return; // petición en curso o espera del 429

  limpiarMensajes();
  empezarCarga();

  try {
    const idGenero = elementoGenero.value;
    let anime = null;

    if (idGenero) {
      anime = await girarConGenero(idGenero);
    } else {
      const json = await pedirJikan("/random/anime");
      anime = json.data || null;
    }

    // Respuesta vacía: no hay anime que mostrar
    if (!anime) {
      mostrarError("vacio");
      return;
    }

    pintarTarjeta(anime);
  } catch (error) {
    mostrarError(error.message);
  } finally {
    terminarCarga(); // sea éxito o error, la ruleta siempre se detiene
  }
}

// ------------------------------------------------------------
// buscarAnime: pide hasta 12 resultados y los pinta como tarjetas chicas
// ------------------------------------------------------------
async function buscarAnime() {
  if (cargando || relojCooldown) return; // petición en curso o espera del 429

  const texto = elementoBusqueda.value.trim();

  // Sin texto no tiene sentido pedir a la API
  if (!texto) {
    mostrarError("vacio");
    return;
  }

  limpiarMensajes();
  empezarCarga();

  try {
    // encodeURIComponent convierte espacios y tildes a formato de URL
    const json = await pedirJikan(`/anime?q=${encodeURIComponent(texto)}&sfw=true&limit=12`);
    const resultados = json.data || [];

    pintarResultados(resultados);

    // Búsqueda sin resultados → mensaje temático de vacío
    if (resultados.length === 0) {
      mostrarError("vacio");
    }
  } catch (error) {
    mostrarError(error.message);
  } finally {
    terminarCarga();
  }
}

// ------------------------------------------------------------
// pintarResultados: dibuja el grid de tarjetas pequeñas.
// Al hacer clic en una, esa pasa a la tarjeta grande.
// ------------------------------------------------------------
function pintarResultados(lista) {
  gridResultados.textContent = ""; // borramos los resultados anteriores

  // Si no hay nada, volvemos a mostrar el texto de "sin resultados"
  vacioResultados.hidden = lista.length > 0;

  for (const anime of lista) {
    const titulo = anime.title_english || anime.title || "Sin título";
    const portada = anime.images && anime.images.jpg ? anime.images.jpg.large_image_url : null;

    // La tarjeta chica es un <button> para que también se pueda usar
    // con el teclado (accesibilidad)
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "mini-tarjeta";

    const imagen = document.createElement("img");
    if (portada) {
      imagen.src = portada;
      imagen.alt = `Portada de ${titulo}`; // alt obligatorio
    } else {
      imagen.alt = "Portada no disponible";
    }

    const datos = document.createElement("div");
    datos.className = "mini-datos";

    const nombre = document.createElement("span");
    nombre.className = "mini-titulo";
    nombre.textContent = titulo;

    const puntuacion = document.createElement("span");
    puntuacion.className = "mini-score";
    puntuacion.textContent = typeof anime.score === "number" ? `Score: ${anime.score}` : "Sin score";

    datos.appendChild(nombre);
    datos.appendChild(puntuacion);
    boton.appendChild(imagen);
    boton.appendChild(datos);

    // Clic en la tarjeta chica → se muestra en la tarjeta grande
    boton.addEventListener("click", () => pintarTarjeta(anime));

    gridResultados.appendChild(boton);
  }
}

// ---------- Arranque de la página ----------
botonGirar.addEventListener("click", girarRuleta); // botón "Girar la ruleta"
botonBuscar.addEventListener("click", buscarAnime); // botón "Buscar"

// Con "Enter" dentro del campo de búsqueda también se busca
elementoBusqueda.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    buscarAnime();
  }
});

cargarGeneros(); // el <select> se llena apenas carga la página
