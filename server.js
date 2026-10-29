// ============================================================
// ANIME ROULETTE — servidor Express
// Paso 6: sirve public/ y expone POST /api/resumen (consulta Gemini)
// ============================================================

// dotenv lee el archivo .env y lo vuelve variables de process.env
require("dotenv").config();
const express = require("express");

// El nombre del modelo puede cambiar con el tiempo: aquí se cambia fácil
const MODELO_GEMINI = "gemini-3.5-flash-lite";
const URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

const app = express();
const PUERTO = process.env.PORT || 3000;

// Aviso claro si falta la clave (sin mostrarla nunca en consola)
if (!process.env.GEMINI_API_KEY) {
  console.warn("AVISO: falta GEMINI_API_KEY en el archivo .env. El resumen con IA no funcionará.");
}

// Límite de 20kb para que nadie mande cuerpos enormes al servidor
app.use(express.json({ limit: "20kb" }));

// Sirve el front-end (index.html, style.css, app.js)
app.use(express.static("public"));

// ------------------------------------------------------------
// POST /api/resumen: recibe { titulo, sinopsis } y devuelve { resumen }
// La clave de Gemini vive solo aquí, el navegador nunca la ve.
// ------------------------------------------------------------
app.post("/api/resumen", async (req, res) => {
  try {
    const { titulo, sinopsis } = req.body || {};

    // Sin sinopsis no hay nada que resumir
    if (!sinopsis || typeof sinopsis !== "string") {
      return res.status(400).json({ error: "Falta la sinopsis" });
    }

    // Recortamos para no gastar de más en la IA
    const sinopsisCorta = sinopsis.slice(0, 4000);

    const prompt =
      `Eres un narrador de anime. Resume en español, en máximo 2 frases y sin spoilers, ` +
      `la siguiente sinopsis del anime "${titulo}":\n\n${sinopsisCorta}`;

    const respuesta = await fetch(URL_GEMINI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    // 429: Gemini nos pide esperar; el front muestra el mensaje de límite
    if (respuesta.status === 429) {
      return res.status(429).json({ error: "limite" });
    }

    // Cualquier otro fallo de Gemini → 502 (la puerta de enlace falló)
    if (!respuesta.ok) {
      // El motivo real (clave inválida, modelo inexistente…) solo se ve en la
      // consola del servidor; al navegador solo le llega el error genérico
      const detalle = await respuesta.text();
      console.error(`Gemini respondió ${respuesta.status}:`, detalle.slice(0, 300));
      return res.status(502).json({ error: "ia" });
    }

    const data = await respuesta.json();
    // El "?." evita errores si la respuesta viene con otra forma
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto || !texto.trim()) {
      return res.status(502).json({ error: "ia" });
    }

    res.json({ resumen: texto.trim() });
  } catch (error) {
    // No exponemos detalles internos al navegador, solo al log del servidor
    console.error("Error en /api/resumen:", error.message);
    res.status(500).json({ error: "servidor" });
  }
});

app.listen(PUERTO, () => {
  console.log(`Anime Roulette listo en http://localhost:${PUERTO}`);
});
