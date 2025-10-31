import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
console.log("Avvio server...");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// middleware per loggare ogni request in arrivo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post("/api/itinerary", async (req, res) => {
  try {
    const { destination, days, interests } = req.body || {};

    if (!destination || !days) {
      return res
        .status(400)
        .json({ error: "destination e days sono obbligatori" });
    }

    const prompt = `
Crea un piano di viaggio di ${days} giorni a ${destination},
concentra il piano su: ${
      Array.isArray(interests) ? interests.join(", ") : interests
    }.
Includi per ogni giorno: colazione, pranzo, cena e 2-3 attività principali.
Rispondi in formato JSON valido: un array di oggetti con campi "giorno", "attivita", "descrizione".
Esempio:
[
  {"giorno": 1, "attivita": "Visita al museo", "descrizione": "..." },
  ...
]
    `;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.8,
    });

    let text = "";
    if (response.output && response.output.length > 0) {
      text = response.output
        .map((o) => {
          if (!o.content) return "";
          return o.content
            .map((c) => c.text || c.md || c.speech || "")
            .join("");
        })
        .join("\n");
    }

    if (!text && response.output_text) {
      text = response.output_text;
    }

    if (
      !text &&
      Array.isArray(response?.choices) &&
      response.choices[0]?.text
    ) {
      text = response.choices[0].text;
    }

    if (!text) {
      console.warn(
        "Impossibile estrarre testo dalla risposta OpenAI. Inviaamo l'intero oggetto al client."
      );
      return res.status(500).json({
        error: "OpenAI returned an unexpected response format",
        raw: response,
      });
    }

    try {
      const parsed = JSON.parse(text);
      return res.json({ itinerary: parsed });
    } catch (parseErr) {
      return res.json({ itinerary: text });
    }
  } catch (err) {
    console.error("Errore interno /api/itinerary:", err);
    return res.status(500).json({
      error: "Errore nella generazione del piano",
      detail: err.message || err,
    });
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

export default app;
